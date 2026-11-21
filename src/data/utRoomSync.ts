// UT 방 연결: 서로 다른 기기(참가자 휴대폰·진행자 휴대폰)가 같은 세션을 보게 한다.
// 서버는 Firebase Realtime Database의 REST 주소만 쓴다(라이브러리 없음).
// - 쓰기: 세션에서 바뀐 칸만 PATCH 한다(예: scheduleStatus/schedule-run). 두 기기가 다른 칸을 동시에 바꿔도 둘 다 남는다.
// - 읽기: rooms/{방번호}/session.json 을 EventSource로 듣는다. 연결되면 현재 값이 먼저 오고, 바뀔 때마다 바뀐 칸이 온다.
// - 순서: 서버가 받은 순서(= 듣기 연결로 오는 순서)를 따른다. 기기 시계는 쓰지 않는다.
//   내가 바꾼 칸은 서버에서 되돌아올 때까지 내 값을 덮어 보여 준다. 같은 칸을 두 기기가 바꾸면 서버에 나중에 도착한 값이 남는다.
// 개인정보는 주고받지 않는다. 세션(UtSession)에는 진행 상태만 있다.
import type { UtSession } from './types'

export type UtSyncStatus = 'local' | 'connecting' | 'connected' | 'offline'

/** 칸 경로(예: 'scheduleStatus/schedule-run') → 값. null은 지운 칸 */
export type UtSessionChanges = Record<string, unknown>

interface RoomSyncOptions {
  roomId: string
  /** 데이터베이스 주소. 예: https://croxer-ut-default-rtdb.asia-southeast1.firebasedatabase.app */
  databaseUrl: string
  /** 지금 기기의 세션 */
  getSession: () => UtSession
  /** 서버 값(+아직 돌아오지 않은 내 변경)을 앱의 세션 모양으로 맞춘다. 버전이 다르면 null */
  normalizeRemote: (raw: unknown) => UtSession | null
  /** 다른 기기에서 바뀐 세션을 이 기기에 반영한다 */
  applyRemote: (next: UtSession) => void
  /** 보내지 못한 변경을 기기에 기억해 둔다(새로고침해도 다시 보내기 위해) */
  loadPending: () => UtSessionChanges
  savePending: (changes: UtSessionChanges) => void
  onStatus: (status: UtSyncStatus) => void
}

type Tree = Record<string, unknown>

const RETRY_MS = 2000

function isPlainObject(value: unknown): value is Tree {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sameValue(a: unknown, b: unknown) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
}

/** 세션을 칸 단위로 편다. 목록(배열)은 한 칸으로 다룬다 */
function flatten(value: unknown, prefix = '', out: UtSessionChanges = {}) {
  if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}/${key}` : key, out)
    }
  } else if (prefix && value !== undefined && value !== null) {
    out[prefix] = value
  }
  return out
}

/** 이전 세션과 다음 세션에서 바뀐 칸만 고른다. 없어진 칸은 null */
export function diffSessions(previous: UtSession, next: UtSession): UtSessionChanges {
  const before = flatten(previous)
  const after = flatten(next)
  const changes: UtSessionChanges = {}
  for (const [path, value] of Object.entries(after)) {
    if (!sameValue(before[path], value)) changes[path] = value
  }
  for (const path of Object.keys(before)) {
    if (!(path in after)) changes[path] = null
  }
  return changes
}

function getAt(tree: unknown, path: string): unknown {
  let node = tree
  for (const key of path.split('/')) {
    if (!isPlainObject(node)) return undefined
    node = node[key]
  }
  return node
}

/** 트리의 path 칸을 value로 바꾼 새 트리. value가 null이면 지우고 빈 상자도 정리한다 */
function setAt(tree: unknown, path: string, value: unknown): Tree | null {
  const keys = path.split('/').filter(Boolean)
  if (keys.length === 0) return isPlainObject(value) ? value : null
  const root: Tree = isPlainObject(tree) ? { ...tree } : {}
  const [head, ...rest] = keys
  if (rest.length === 0) {
    if (value === null || value === undefined) delete root[head]
    else root[head] = value
  } else {
    const child = setAt(root[head], rest.join('/'), value)
    if (child === null) delete root[head]
    else root[head] = child
  }
  return Object.keys(root).length > 0 ? root : null
}

export function startRoomSync(options: RoomSyncOptions) {
  const sessionUrl = `${options.databaseUrl.replace(/\/+$/, '')}/rooms/${options.roomId}/session.json`

  /** 서버에 있는 값(듣기 연결로 받은 그대로) */
  let mirror: Tree | null = null
  let mirrorReady = false
  /** 서버가 아직 받았다고 답하지 않은 칸. 새로고침해도 다시 보내도록 기기에 기억한다 */
  let unacked: UtSessionChanges = options.loadPending()
  /** 내가 바꿨지만 아직 듣기 연결로 되돌아오지 않은 칸. 그동안 화면에는 내 값을 보여 준다 */
  let pending: UtSessionChanges = { ...unacked }
  /** 아직 보내지 않은 칸 */
  let outbox: UtSessionChanges = { ...unacked }
  let writing = false
  let retryTimer: number | null = null
  let status: UtSyncStatus = 'connecting'

  function setStatus(next: UtSyncStatus) {
    if (status === next) return
    status = next
    options.onStatus(next)
  }

  function rememberUnacked() {
    options.savePending(unacked)
  }

  async function flush() {
    if (writing || !mirrorReady || Object.keys(outbox).length === 0) return
    writing = true
    const sending = outbox
    outbox = {}
    try {
      const response = await fetch(sessionUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sending),
      })
      if (!response.ok) throw new Error(`room write failed: ${response.status}`)
      // 서버가 받은 칸은 새로고침해도 다시 보내지 않는다
      for (const [path, value] of Object.entries(sending)) {
        if (sameValue(unacked[path], value)) delete unacked[path]
      }
      rememberUnacked()
    } catch {
      // 보내지 못한 칸은 다음에 다시 보낸다. 그 사이 새로 바뀐 칸이 있으면 새 값이 우선이다
      outbox = { ...sending, ...outbox }
      setStatus('offline')
      scheduleRetry()
    } finally {
      writing = false
    }
    if (retryTimer === null && Object.keys(outbox).length > 0) void flush()
  }

  function scheduleRetry() {
    if (retryTimer !== null) return
    retryTimer = window.setTimeout(() => {
      retryTimer = null
      void flush()
    }, RETRY_MS)
  }

  /** 서버 값에 아직 돌아오지 않은 내 변경을 덮어 이 기기의 세션을 다시 만든다 */
  function rebuild() {
    let view: Tree | null = mirror
    for (const [path, value] of Object.entries(pending)) view = setAt(view, path, value)
    const next = options.normalizeRemote(view)
    if (!next) {
      if (mirror) {
        console.warn('[CROXER] 방 세션의 저장 형식이 달라 반영하지 않았어요. 두 기기를 모두 새로고침해 주세요.')
      }
      return
    }
    if (!sameValue(next, options.getSession())) options.applyRemote(next)
  }

  /** 서버에서 칸이 바뀌었다. 내 변경이 되돌아온 것이면 기다림 목록에서 지운다 */
  function settle(changedPaths: string[]) {
    for (const path of Object.keys(pending)) {
      const touched = changedPaths.some(
        (changed) => changed === '' || path === changed || path.startsWith(`${changed}/`) || changed.startsWith(`${path}/`),
      )
      if (touched && sameValue(getAt(mirror, path), pending[path])) delete pending[path]
    }
  }

  function handleFirstValue() {
    mirrorReady = true
    // 서버가 이미 받은 내 변경은 지금 서버 값이 더 새롭다. 보내지 못한 칸만 내 값으로 남긴다
    for (const path of Object.keys(pending)) {
      if (!(path in unacked)) delete pending[path]
    }
    if (mirror === null) {
      // 아직 아무도 쓰지 않은 방이면 이 기기의 세션으로 시작한다
      const all = flatten(options.getSession())
      pending = { ...all, ...pending }
      unacked = { ...all, ...unacked }
      outbox = { ...all, ...outbox }
      rememberUnacked()
    } else if (options.normalizeRemote(mirror) === null) {
      console.warn('[CROXER] 방 세션의 저장 형식이 달라 반영하지 않았어요. 두 기기를 모두 새로고침해 주세요.')
      return
    } else {
      rebuild()
    }
    void flush()
  }

  /** 기기 안에서 세션이 바뀌었다. 바뀐 칸만 보낸다 */
  function push(previous: UtSession, next: UtSession) {
    const changes = diffSessions(previous, next)
    if (Object.keys(changes).length === 0) return
    pending = { ...pending, ...changes }
    unacked = { ...unacked, ...changes }
    outbox = { ...outbox, ...changes }
    rememberUnacked()
    void flush()
  }

  async function refetch() {
    try {
      const response = await fetch(sessionUrl)
      if (!response.ok) throw new Error(`room read failed: ${response.status}`)
      const data: unknown = await response.json()
      const wasReady = mirrorReady
      mirror = isPlainObject(data) ? data : null
      settle([''])
      if (wasReady) rebuild()
      else handleFirstValue()
    } catch {
      setStatus('offline')
    }
  }

  const source = new EventSource(sessionUrl)
  options.onStatus(status)

  function readEvent(event: Event) {
    return JSON.parse((event as MessageEvent<string>).data) as { path: string; data: unknown }
  }

  source.addEventListener('put', (event) => {
    try {
      const { path, data } = readEvent(event)
      const cleanPath = path.replace(/^\/+/, '')
      mirror = setAt(mirror, cleanPath, data)
      setStatus('connected')
      settle([cleanPath])
      // 연결(또는 다시 연결)되면 전체 값이 path '/'로 먼저 온다
      if (cleanPath === '') handleFirstValue()
      else rebuild()
    } catch {
      void refetch()
    }
  })
  source.addEventListener('patch', (event) => {
    try {
      const { path, data } = readEvent(event)
      const base = path.replace(/^\/+/, '')
      const changed: string[] = []
      if (isPlainObject(data)) {
        for (const [key, value] of Object.entries(data)) {
          const full = base ? `${base}/${key}` : key
          mirror = setAt(mirror, full, value)
          changed.push(full)
        }
      }
      setStatus('connected')
      settle(changed)
      rebuild()
    } catch {
      void refetch()
    }
  })
  source.addEventListener('cancel', () => {
    // 데이터베이스 규칙이 읽기를 막았다
    setStatus('offline')
  })
  source.onerror = () => {
    // EventSource는 스스로 다시 연결한다. 다시 연결되면 현재 값이 먼저 오고 그때 맞춘다
    setStatus('offline')
    mirrorReady = false
  }

  /** 듣기 연결과 다시 보내기 예약을 끝낸다(개발 중 코드 교체 때 연결이 쌓이지 않게) */
  function stop() {
    source.close()
    if (retryTimer !== null) window.clearTimeout(retryTimer)
    retryTimer = null
  }

  return { push, stop, getStatus: () => status }
}
