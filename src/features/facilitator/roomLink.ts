/**
 * 두 기기 연결용 방 번호와 주소 (#76).
 *
 * 임시 구현: 방 번호를 만들고 주소의 `?room=` 값으로 읽고 쓰는 것까지만 한다.
 * 실제로 두 기기의 세션을 맞추는 일은 데이터 쪽 요청 #74에서 한다.
 * #74가 합쳐지면 아래 함수를 utStore의 getUtRoomId · createUtRoomId · getUtSyncStatus로 바꾼다.
 */

export const ROOM_PARAM = 'room'

/** #74에서 제안한 연결 상태. 지금은 항상 'local' */
export type RoomSyncStatus = 'local' | 'connecting' | 'connected' | 'offline'

/** 임시: 주소의 ?room= 값. #74 이후 getUtRoomId()로 바꾼다 */
export function readRoomId(): string | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get(ROOM_PARAM)
  return value && /^\d{4,6}$/.test(value) ? value : null
}

/**
 * 임시: 새 4자리 방 번호를 만들고 이 탭 주소에 붙인다. #74 이후 createUtRoomId()로 바꾼다.
 * 주소에 남겨 두면 진행자 휴대폰을 새로고침해도 같은 방에 다시 들어간다.
 */
export function createRoomId(): string {
  const roomId = String(1000 + Math.floor(Math.random() * 9000))
  const url = new URL(window.location.href)
  url.searchParams.set(ROOM_PARAM, roomId)
  window.history.replaceState(window.history.state, '', url)
  return roomId
}

/** 임시: #74 이후 getUtSyncStatus()로 바꾼다 */
export function readSyncStatus(): RoomSyncStatus {
  return 'local'
}

/** 참가자 휴대폰에서 열 주소. 진행자 패널 주소 끝(#facilitator)은 뺀다 */
export function participantUrl(roomId: string): string {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set(ROOM_PARAM, roomId)
  return url.toString()
}

/** 화면에 보여 줄 짧은 주소 (https:// 제외) */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '')
}
