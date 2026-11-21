// CROXER 간단 UT 저장·조회 함수
// 모든 화면은 이 파일의 함수로만 데이터를 읽고 쓴다(docs/dev-guide.md 데이터 접근 규칙).
// - 초기 데이터(baseline): 가상 하루. 읽기 전용
// - 참가자 세션(session): 참가자가 바꾼 상태. 브라우저 저장소의 UT 전용 키 하나에 저장
//   주소에 ?room=방번호 가 있으면 같은 방의 다른 기기와 세션을 맞춘다(utRoomSync.ts). 없으면 기기 안에서만 동작한다.
// 상태 변경 규칙은 docs/prd.md 6.2를 따른다.
import baselineJson from '../fixtures/croxer-ut-baseline.v1.json'
import { startRoomSync, type UtSessionChanges, type UtSyncStatus } from './utRoomSync'
import type {
  Activity,
  ActivityId,
  AiAssessment,
  AiJob,
  AiJobStatus,
  Alert,
  Announcement,
  Course,
  FallbackChoice,
  Inquiry,
  KeywordReply,
  ReorderableScheduleId,
  Resource,
  Role,
  RoleId,
  Schedule,
  ScheduleId,
  ScheduleSections,
  ScheduleStatus,
  ScheduleView,
  UtBaseline,
  UtSession,
} from './types'

// 초기 데이터는 UT 담당의 src/fixtures/croxer-ut-baseline.v1.json(UtBaseline 모양)을 쓴다.
const baseline = baselineJson as UtBaseline

/** 방 번호 모양(6자리 숫자). 주소의 ?room= 값이 이 모양일 때만 방에 들어간다. 데이터베이스 규칙과 같다 */
const ROOM_ID_PATTERN = /^\d{6}$/

function readRoomIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('room')?.trim() ?? ''
  return ROOM_ID_PATTERN.test(value) ? value : null
}

const roomId = readRoomIdFromUrl()
/** 방 연결 서버 주소. 없으면 방 번호가 있어도 기기 안에서만 동작한다 */
const databaseUrl = (import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined)?.trim() || null
/** 실제로 다른 기기와 맞추는지 */
const roomSyncEnabled = Boolean(
  typeof window !== 'undefined' && roomId && databaseUrl && typeof EventSource !== 'undefined',
)

/** 브라우저 저장소의 UT 전용 키. 방에 들어가 있으면 방마다 따로 둔다 */
export const UT_STORAGE_KEY = roomId ? `croxer-ut-session:room:${roomId}` : 'croxer-ut-session'
/** 서버가 아직 받지 않은 방 변경을 기억하는 키 */
const PENDING_KEY = `${UT_STORAGE_KEY}:pending`

/**
 * 세션을 둘 브라우저 저장소.
 * 방 없이 쓸 때는 localStorage: 같은 컴퓨터의 탭끼리 storage 이벤트로 맞춘다(진행자 탭 방식).
 * 방 연결 중이면 sessionStorage: 탭마다 따로 두어, 같은 브라우저에서 방 주소를 두 탭으로 열어도
 * 다른 탭의 중간 상태가 storage 이벤트로 넘어오지 않는다. 새로고침해도 유지되고, 탭을 새로 열면 서버에서 받아온다.
 */
function sessionStorageArea(): Storage | null {
  try {
    return roomSyncEnabled ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}
/** 세션 저장 형식 버전. UtSession 모양을 바꾸면 올린다 */
const SESSION_VERSION = '2'

// ── 세션 보관과 구독 ─────────────────────────────────

function sessionVersion() {
  return `${SESSION_VERSION}:${baseline.version}`
}

function createInitialSession(): UtSession {
  const now = new Date().toISOString()
  return {
    version: sessionVersion(),
    startedAt: now,
    updatedAt: now,
    briefingOrder: [...baseline.briefingOrder],
    isBriefingConfirmed: false,
    activeRoleId: null,
    currentActivityId: null,
    scheduleStatus: Object.fromEntries(
      baseline.schedules.map((schedule) => [schedule.id, schedule.status]),
    ) as Record<ScheduleId, ScheduleStatus>,
    aiJobStatus: Object.fromEntries(baseline.aiJobs.map((job) => [job.id, job.status])),
    aiJobRequestedAt: {},
    alertStatus: Object.fromEntries(baseline.alerts.map((alert) => [alert.id, alert.status])),
    alertFiredAt: {},
    inquiryFiredAt: {},
    selectedCourseId: null,
    announcementStatus: Object.fromEntries(
      baseline.announcements.map((announcement) => [announcement.id, announcement.status]),
    ),
  }
}

function readStoredSession(): UtSession | null {
  try {
    const raw = sessionStorageArea()?.getItem(UT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UtSession
    // 저장 형식이나 초기 데이터가 바뀌었으면 이전 저장값을 쓰지 않는다
    return parsed.version === sessionVersion() ? parsed : null
  } catch {
    return null
  }
}

function writeStoredSession(next: UtSession) {
  try {
    sessionStorageArea()?.setItem(UT_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 메모리 상태만 유지한다
  }
}

let session: UtSession = readStoredSession() ?? createInitialSession()
const listeners = new Set<() => void>()
const externalListeners = new Set<(previous: UtSession, next: UtSession) => void>()
const syncStatusListeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

/** 이 기기 밖(다른 탭·다른 기기)에서 바뀐 세션으로 교체한다 */
function replaceFromOutside(next: UtSession) {
  const previous = session
  session = next
  writeStoredSession(session)
  notify()
  externalListeners.forEach((listener) => listener(previous, next))
}

function commit(update: (current: UtSession) => UtSession) {
  const previous = session
  session = { ...update(session), updatedAt: new Date().toISOString() }
  writeStoredSession(session)
  notify()
  roomSync?.push(previous, session)
}

/**
 * 서버에서 받은 세션을 이 앱의 모양으로 맞춘다.
 * 데이터베이스는 빈 목록·null 값을 저장하지 않으므로 빠진 칸을 초기 모양으로 채운다.
 * 저장 형식 버전이 다르면 null.
 */
function normalizeRemoteSession(raw: unknown): UtSession | null {
  if (!raw || typeof raw !== 'object') return null
  const remote = raw as Partial<UtSession>
  if (remote.version !== sessionVersion()) return null
  const base = createInitialSession()
  return {
    ...base,
    ...remote,
    briefingOrder: Array.isArray(remote.briefingOrder) ? remote.briefingOrder : base.briefingOrder,
    isBriefingConfirmed: remote.isBriefingConfirmed ?? false,
    activeRoleId: remote.activeRoleId ?? null,
    currentActivityId: remote.currentActivityId ?? null,
    selectedCourseId: remote.selectedCourseId ?? null,
    scheduleStatus: { ...base.scheduleStatus, ...remote.scheduleStatus },
    aiJobStatus: { ...base.aiJobStatus, ...remote.aiJobStatus },
    aiJobRequestedAt: { ...remote.aiJobRequestedAt },
    alertStatus: { ...base.alertStatus, ...remote.alertStatus },
    alertFiredAt: { ...remote.alertFiredAt },
    inquiryFiredAt: { ...remote.inquiryFiredAt },
    announcementStatus: { ...base.announcementStatus, ...remote.announcementStatus },
  }
}

function loadPendingChanges(): UtSessionChanges {
  try {
    const raw = sessionStorageArea()?.getItem(PENDING_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? (parsed as UtSessionChanges) : {}
  } catch {
    return {}
  }
}

function savePendingChanges(changes: UtSessionChanges) {
  try {
    if (Object.keys(changes).length > 0) sessionStorageArea()?.setItem(PENDING_KEY, JSON.stringify(changes))
    else sessionStorageArea()?.removeItem(PENDING_KEY)
  } catch {
    // 저장소를 쓸 수 없으면 이번 화면 동안만 기억한다
  }
}

let syncStatus: UtSyncStatus = 'local'

function setSyncStatus(next: UtSyncStatus) {
  syncStatus = next
  syncStatusListeners.forEach((listener) => listener())
}

const roomSync =
  roomSyncEnabled && roomId && databaseUrl
    ? startRoomSync({
        roomId,
        databaseUrl,
        getSession: () => session,
        normalizeRemote: normalizeRemoteSession,
        applyRemote: replaceFromOutside,
        loadPending: loadPendingChanges,
        savePending: savePendingChanges,
        onStatus: setSyncStatus,
      })
    : null

// 개발 중 이 파일이 다시 불러와지면 이전 연결을 닫는다
import.meta.hot?.dispose(() => roomSync?.stop())

if (roomId && !roomSync) {
  // 방 번호는 있는데 데이터베이스 주소가 없다. 끊긴 게 아니라 서버가 없는 것이므로 'local'로 알린다
  console.warn('[CROXER] VITE_FIREBASE_DATABASE_URL이 없어 방에 연결하지 못했어요. 이 기기 안에서만 동작해요.')
}

// 다른 탭(예: 같은 컴퓨터의 진행자 탭)에서 바꾼 세션을 반영한다. 방에 들어가 있으면 방 연결이 맡는다
if (typeof window !== 'undefined' && !roomSync) {
  window.addEventListener('storage', (event) => {
    if (event.key !== UT_STORAGE_KEY) return
    replaceFromOutside(readStoredSession() ?? createInitialSession())
  })
}

/** 세션이 바뀔 때마다 listener를 부른다. 반환값을 부르면 구독을 끝낸다 */
export function subscribeUtSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** 현재 세션 값. 화면에서는 보통 useUtSession()을 쓴다 */
export function getUtSession(): UtSession {
  return session
}

/**
 * 이 기기 밖(같은 컴퓨터의 다른 탭, 같은 방의 다른 기기)에서 세션이 바뀌었을 때만 부른다.
 * 이 기기에서 commit한 변경에는 부르지 않는다. 화면 이동(예: 다른 기기에서 초기화)에 쓴다.
 * 반환값을 부르면 구독을 끝낸다.
 */
export function subscribeUtExternalChange(listener: (previous: UtSession, next: UtSession) => void) {
  externalListeners.add(listener)
  return () => {
    externalListeners.delete(listener)
  }
}

// ── 방 연결(서로 다른 기기) ───────────────────────────

/** 지금 들어와 있는 방 번호. 주소에 ?room= 이 없거나 모양이 틀리면 null */
export function getUtRoomId(): string | null {
  return roomId
}

/**
 * 방 연결 상태.
 * local: 방 없이 기기 안에서만 동작 / connecting: 연결 중 / connected: 연결됨 / offline: 끊김(기기 안 상태로 계속 동작)
 */
export function getUtSyncStatus(): UtSyncStatus {
  return syncStatus
}

/** 방 연결 상태가 바뀔 때마다 listener를 부른다. 반환값을 부르면 구독을 끝낸다 */
export function subscribeUtSyncStatus(listener: () => void) {
  syncStatusListeners.add(listener)
  return () => {
    syncStatusListeners.delete(listener)
  }
}

/** 새 방 번호(6자리 숫자)를 만든다. 진행자 패널에서 참가자마다 하나씩 쓴다 */
export function createUtRoomId(): string {
  const value = new Uint32Array(1)
  crypto.getRandomValues(value)
  return String(100000 + (value[0] % 900000))
}

/** 방 주소를 만든다. 참가자 휴대폰은 participant, 진행자 휴대폰은 facilitator */
export function buildUtRoomUrl(nextRoomId: string, target: 'participant' | 'facilitator' = 'participant') {
  const url = new URL(window.location.href)
  url.search = `?room=${nextRoomId}`
  url.hash = target === 'facilitator' ? '#facilitator' : ''
  return url.toString()
}

/** 진행자 패널 전용: 참가자 세션을 초기 데이터로 되돌린다 */
export function resetUtSession() {
  commit(() => createInitialSession())
}

// ── 역할·활동·일정 조회 ───────────────────────────────

/** 가상 날짜(YYYY-MM-DD) */
export function getToday() {
  return baseline.today
}

export function getRoles(): Role[] {
  return baseline.roles
}

export function getRole(roleId: RoleId): Role {
  return findOrThrow(baseline.roles, roleId, '역할')
}

export function getActivities(): Activity[] {
  return baseline.activities
}

export function getActivity(activityId: ActivityId): Activity {
  return findOrThrow(baseline.activities, activityId, '활동')
}

/** 일정 목록. status는 참가자 세션의 값이 반영된다 */
export function getSchedules(): Schedule[] {
  return baseline.schedules.map(withScheduleStatus)
}

export function getSchedule(scheduleId: ScheduleId): Schedule {
  return withScheduleStatus(findOrThrow(baseline.schedules, scheduleId, '일정'))
}

export function getScheduleByActivity(activityId: ActivityId): Schedule {
  const schedule = baseline.schedules.find((item) => item.activityId === activityId)
  if (!schedule) throw new Error(`활동 ${activityId}의 일정이 없습니다`)
  return withScheduleStatus(schedule)
}

export function getActiveRoleId(): RoleId | null {
  return session.activeRoleId
}

export function getCurrentActivityId(): ActivityId | null {
  return session.currentActivityId
}

// ── 브리핑 순서와 활동 진입 순서 ──────────────────────

/** 현재 브리핑 순서(일정 ID 목록) */
export function getBriefingOrder(): ScheduleId[] {
  return session.briefingOrder
}

/** 브리핑 화면용: 순서대로 일정·활동·역할을 묶은 목록 */
export function getBriefingItems(): ScheduleView[] {
  return session.briefingOrder.map((scheduleId, index) => toScheduleView(scheduleId, index + 1))
}

export function isBriefingConfirmed() {
  return session.isBriefingConfirmed
}

/**
 * 브리핑 순서를 저장한다. 순서를 바꿀 수 있는 세 일정만 받는다.
 * 뒤 두 칸(구독 연장·팀플회의)은 항상 초기 순서대로 뒤에 붙는다.
 * 세 일정이 정확히 한 번씩 들어 있지 않으면 저장하지 않고 false를 돌려준다.
 * 일정 시각은 바꾸지 않는다(PRD 6.2).
 */
export function saveBriefingOrder(reorderableOrder: ReorderableScheduleId[]): boolean {
  const reorderableIds = getReorderableScheduleIds()
  const isValid =
    reorderableOrder.length === reorderableIds.length &&
    new Set(reorderableOrder).size === reorderableIds.length &&
    reorderableOrder.every((id) => reorderableIds.includes(id))
  if (!isValid) return false

  const fixedIds = baseline.briefingOrder.filter((id) => !reorderableIds.includes(id))
  commit((current) => ({ ...current, briefingOrder: [...reorderableOrder, ...fixedIds] }))
  return true
}

/** 브리핑을 확정하고 첫 번째 활동으로 진입한다. 진입한 활동 ID를 돌려준다 */
export function confirmBriefing(): ActivityId {
  const firstActivityId = getEntryOrder()[0]
  commit((current) => ({ ...current, isBriefingConfirmed: true }))
  enterActivity(firstActivityId)
  return firstActivityId
}

/** 활동 진입 순서. 브리핑 순서에서 화면이 있는 활동(01~03)만 뽑는다 */
export function getEntryOrder(): ActivityId[] {
  return session.briefingOrder
    .map((scheduleId) => findOrThrow(baseline.schedules, scheduleId, '일정').activityId)
    .filter((activityId) => getActivity(activityId).isReorderable)
}

/**
 * 진입 순서상 다음에 할 활동. 아직 완료되지 않은 첫 활동을 돌려준다.
 * fromActivityId를 주면 그 활동 뒤에서부터 찾는다. 없으면 null(UT 종료).
 */
export function getNextActivityId(fromActivityId?: ActivityId): ActivityId | null {
  const order = getEntryOrder()
  const start = fromActivityId ? order.indexOf(fromActivityId) + 1 : 0
  return order.slice(start).find((id) => getScheduleByActivity(id).status !== 'done') ?? null
}

/** 진입 순서의 활동(01~03)을 모두 마쳤는지 */
export function isUtFlowFinished() {
  return getEntryOrder().every((id) => getScheduleByActivity(id).status === 'done')
}

// ── 활동 상태 변경 ───────────────────────────────────

/**
 * 활동 화면에 진입한다. 현재 역할·열린 활동을 바꾸고 일정을 진행 중으로 만든다.
 * 이미 완료된 일정은 되돌리지 않는다.
 */
export function enterActivity(activityId: ActivityId) {
  const activity = getActivity(activityId)
  const scheduleId = getScheduleByActivity(activityId).id
  commit((current) => ({
    ...current,
    activeRoleId: activity.roleId,
    currentActivityId: activityId,
    scheduleStatus: startSchedule(current.scheduleStatus, scheduleId),
  }))
}

/** 홈에 활동 카드가 떴을 때 부른다. 일정만 진행 중으로 만들고 역할은 바꾸지 않는다 */
export function markActivityShown(activityId: ActivityId) {
  const scheduleId = getScheduleByActivity(activityId).id
  if (session.scheduleStatus[scheduleId] !== 'waiting') return
  commit((current) => ({
    ...current,
    scheduleStatus: startSchedule(current.scheduleStatus, scheduleId),
  }))
}

/**
 * 활동의 UT 흐름을 마쳤을 때 부른다. 일정을 완료로 만들고 다음 활동 ID를 돌려준다.
 * 현재 역할과 AI 작업 상태는 바꾸지 않는다(참가자가 전환 패널에서 선택).
 */
export function completeActivity(activityId: ActivityId): ActivityId | null {
  const scheduleId = getScheduleByActivity(activityId).id
  commit((current) => ({
    ...current,
    scheduleStatus: { ...current.scheduleStatus, [scheduleId]: 'done' },
  }))
  return getNextActivityId(activityId)
}

/**
 * 진행자 패널 전용: 막힌 활동을 완료로 옮기고 다음 활동의 시작 상태로 진입한다.
 * 다음 활동 ID를 돌려준다. 남은 활동이 없으면 null.
 *
 * 남은 활동이 없으면 열린 활동(currentActivityId)을 비운다. 진행자가 다른 탭(#facilitator)에서
 * 넘겨도 참가자 탭이 저장값 변화로 UT 종료를 알아채 스케줄로 이동할 수 있게 하기 위해서다.
 * 현재 역할은 바꾸지 않는다.
 */
export function skipToNextActivity(): ActivityId | null {
  const currentId = session.currentActivityId ?? getNextActivityId()
  if (!currentId) return null
  const nextId = completeActivity(currentId)
  if (nextId) {
    enterActivity(nextId)
  } else {
    commit((current) => ({ ...current, currentActivityId: null }))
  }
  return nextId
}

// ── 스케줄 화면 ──────────────────────────────────────

/** 스케줄 화면의 진행 완료·진행 중·백그라운드·진행 후 목록. 각 영역은 브리핑 순서대로 */
export function getScheduleSections(): ScheduleSections {
  const items = getBriefingItems()
  return {
    done: items.filter((item) => item.schedule.status === 'done'),
    inProgress: items.filter((item) => item.schedule.status === 'in_progress'),
    background: getAiJobs().filter(
      (job) => isAiJobRequested(job.id) && job.status !== 'completed',
    ),
    upcoming: items.filter((item) => item.schedule.status === 'waiting'),
  }
}

// ── 자료 ────────────────────────────────────────────

/** 활동의 자료. AI 작업 결과 자료는 작업이 completed가 되기 전에는 빠진다 */
export function getResources(activityId: ActivityId): Resource[] {
  return baseline.resources.filter(
    (resource) => resource.activityId === activityId && isResourceVisible(resource),
  )
}

export function getResource(resourceId: string): Resource | null {
  const resource = baseline.resources.find((item) => item.id === resourceId)
  return resource && isResourceVisible(resource) ? resource : null
}

// ── AI 작업 ─────────────────────────────────────────

export function getAiJobs(): AiJob[] {
  return baseline.aiJobs.map(withAiJobStatus)
}

export function getAiJob(jobId: string): AiJob {
  return withAiJobStatus(findOrThrow(baseline.aiJobs, jobId, 'AI 작업'))
}

/** 참가자가 이미 요청했는지. 요청 버튼을 완료 상태로 바꿀 때 쓴다 */
export function isAiJobRequested(jobId: string) {
  return jobId in session.aiJobRequestedAt
}

/**
 * AI 작업을 요청한다(상태 queued). 이미 요청했으면 아무것도 하지 않고 false.
 * 현재 역할과 일정 상태는 바꾸지 않는다.
 */
export function requestAiJob(jobId: string): boolean {
  findOrThrow(baseline.aiJobs, jobId, 'AI 작업')
  if (isAiJobRequested(jobId)) return false
  commit((current) => ({
    ...current,
    aiJobStatus: { ...current.aiJobStatus, [jobId]: 'queued' },
    aiJobRequestedAt: { ...current.aiJobRequestedAt, [jobId]: new Date().toISOString() },
  }))
  return true
}

/** 요청한 AI 작업을 실행 중으로 바꾼다. 첫 UT에서는 completed로 바꾸는 함수가 없다 */
export function markAiJobRunning(jobId: string) {
  if (!isAiJobRequested(jobId) || session.aiJobStatus[jobId] !== 'queued') return
  commit((current) => ({
    ...current,
    aiJobStatus: { ...current.aiJobStatus, [jobId]: 'running' },
  }))
}

// ── 알림(비 알림) ────────────────────────────────────

/** 활동에서 이미 뜬 알림 목록 */
export function getFiredAlerts(activityId: ActivityId): Alert[] {
  return baseline.alerts
    .filter((alert) => alert.activityId === activityId && alert.id in session.alertFiredAt)
    .map(withAlertStatus)
}

export function getAlert(alertId: string): Alert {
  return withAlertStatus(findOrThrow(baseline.alerts, alertId, '알림'))
}

export function isAlertFired(alertId: string) {
  return alertId in session.alertFiredAt
}

/** 알림을 띄운다(촬영 자료 진입 10초 후 또는 진행자 패널). 이미 떴으면 그대로 둔다 */
export function fireAlert(alertId: string) {
  findOrThrow(baseline.alerts, alertId, '알림')
  if (isAlertFired(alertId)) return
  commit((current) => ({
    ...current,
    alertFiredAt: { ...current.alertFiredAt, [alertId]: new Date().toISOString() },
  }))
}

/** 알림을 열었을 때 부른다. 읽음 여부만 바꾼다 */
export function markAlertRead(alertId: string) {
  findOrThrow(baseline.alerts, alertId, '알림')
  commit((current) => ({
    ...current,
    alertStatus: { ...current.alertStatus, [alertId]: 'read' },
  }))
}

// ── 크루원 문의·AI 판단·코스·공지 ─────────────────────

/** 활동에서 이미 발생한 문의 목록 */
export function getFiredInquiries(activityId: ActivityId): Inquiry[] {
  return baseline.inquiries.filter(
    (inquiry) => inquiry.activityId === activityId && inquiry.id in session.inquiryFiredAt,
  )
}

export function isInquiryFired(inquiryId: string) {
  return inquiryId in session.inquiryFiredAt
}

/** 문의를 발생시킨다(러닝 진입 시 또는 진행자 패널). 이미 발생했으면 그대로 둔다 */
export function fireInquiry(inquiryId: string) {
  findOrThrow(baseline.inquiries, inquiryId, '문의')
  if (isInquiryFired(inquiryId)) return
  commit((current) => ({
    ...current,
    inquiryFiredAt: { ...current.inquiryFiredAt, [inquiryId]: new Date().toISOString() },
  }))
}

/** 문의에 대한 AI 판단. 문의와 출처가 다른 정보로 표시한다 */
export function getAiAssessment(inquiryId: string): AiAssessment | null {
  return baseline.aiAssessments.find((item) => item.inquiryId === inquiryId) ?? null
}

export function getCourses(activityId: ActivityId): Course[] {
  return baseline.courses.filter((course) => course.activityId === activityId)
}

export function getSelectedCourseId(): string | null {
  return session.selectedCourseId
}

/** 대체 코스를 고른다. 공지를 이미 보냈으면 바꾸지 않고 false */
export function selectCourse(courseId: string): boolean {
  const course = findOrThrow(baseline.courses, courseId, '코스')
  const announcement = baseline.announcements.find((item) => item.activityId === course.activityId)
  if (announcement && session.announcementStatus[announcement.id] === 'simulated_sent') return false
  commit((current) => ({ ...current, selectedCourseId: courseId }))
  return true
}

/** 활동의 공지 초안. 선택한 코스와 그 집결지가 반영된다 */
export function getAnnouncement(activityId: ActivityId): Announcement | null {
  const announcement = baseline.announcements.find((item) => item.activityId === activityId)
  if (!announcement) return null
  const course = baseline.courses.find(
    (item) => item.id === session.selectedCourseId && item.activityId === activityId,
  )
  return {
    ...announcement,
    courseId: course?.id ?? null,
    meetingPoint: course?.meetingPoint ?? announcement.meetingPoint,
    status: session.announcementStatus[announcement.id] ?? announcement.status,
  }
}

/**
 * 공지를 모의 발송한다(draft → simulated_sent). 실제 메시지는 보내지 않는다.
 * 코스를 고르지 않았거나 이미 보냈으면 false.
 */
export function sendAnnouncement(announcementId: string): boolean {
  const announcement = findOrThrow(baseline.announcements, announcementId, '공지')
  const current = getAnnouncement(announcement.activityId)
  if (!current || current.courseId === null || current.status !== 'draft') return false
  commit((state) => ({
    ...state,
    announcementStatus: { ...state.announcementStatus, [announcementId]: 'simulated_sent' },
  }))
  return true
}

// ── 채팅 별칭 키워드 ─────────────────────────────────

/** 채팅 입력이 별칭 키워드와 맞으면 준비된 응답을, 아니면 null을 돌려준다 */
export function findKeywordReply(activityId: ActivityId, text: string): KeywordReply | null {
  const input = normalize(text)
  if (!input) return null
  return (
    baseline.keywordReplies.find(
      (reply) =>
        reply.activityId === activityId &&
        reply.keywords.some((keyword) => input.includes(normalize(keyword))),
    ) ?? null
  )
}

/** 키워드가 맞지 않을 때 보여줄 준비된 선택지 */
export function getFallbackChoices(activityId: ActivityId): FallbackChoice[] {
  return baseline.fallbackChoices.filter((choice) => choice.activityId === activityId)
}

// ── 내부 도우미 ──────────────────────────────────────

function findOrThrow<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id)
  if (!item) throw new Error(`${label} ID ${id}가 초기 데이터에 없습니다`)
  return item
}

function getReorderableScheduleIds(): ScheduleId[] {
  return baseline.schedules
    .filter((schedule) => getActivity(schedule.activityId).isReorderable)
    .map((schedule) => schedule.id)
}

function startSchedule(statuses: Record<ScheduleId, ScheduleStatus>, scheduleId: ScheduleId) {
  return statuses[scheduleId] === 'waiting'
    ? { ...statuses, [scheduleId]: 'in_progress' as const }
    : statuses
}

/**
 * 브리핑 자리별 시각. 초기 순서의 시각(13:00·16:00·19:00·21:00·22:00)을 자리에 고정하고,
 * 순서를 바꾸면 그 자리에 온 활동이 자리의 시각을 갖는다(2026-11-18 지유 결정, Figma 브리핑 시안 기준)
 */
const slotStartsAt = baseline.briefingOrder.map(
  (scheduleId) => findOrThrow(baseline.schedules, scheduleId, '일정').startsAt,
)

function withScheduleStatus(schedule: Schedule): Schedule {
  const slotIndex = session.briefingOrder.indexOf(schedule.id)
  return {
    ...schedule,
    startsAt: slotStartsAt[slotIndex] ?? schedule.startsAt,
    status: session.scheduleStatus[schedule.id] ?? schedule.status,
  }
}

function withAiJobStatus(job: AiJob): AiJob {
  return { ...job, status: (session.aiJobStatus[job.id] as AiJobStatus) ?? job.status }
}

function withAlertStatus(alert: Alert): Alert {
  return { ...alert, status: session.alertStatus[alert.id] ?? alert.status }
}

function toScheduleView(scheduleId: ScheduleId, position: number): ScheduleView {
  const schedule = getSchedule(scheduleId)
  const activity = getActivity(schedule.activityId)
  return { schedule, activity, role: getRole(activity.roleId), position }
}

function isResourceVisible(resource: Resource) {
  return !resource.aiJobId || getAiJob(resource.aiJobId).status === 'completed'
}

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, '')
}
