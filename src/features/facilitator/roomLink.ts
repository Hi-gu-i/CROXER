import { buildUtRoomUrl } from '../../data/utStore'

/**
 * 두 기기 연결 주소 (#76).
 * 방 번호·연결은 utStore가 맡고, 주소도 utStore의 buildUtRoomUrl 모양을 그대로 쓴다.
 * 참가자 https://배포주소/?room=482193 · 진행자 https://배포주소/?room=482193#facilitator
 */

/** 진행자 패널을 별도 화면으로 여는 주소 끝 */
const FACILITATOR_HASH = '#facilitator'

/** 주소 끝(#...)이 진행자 표시인지 */
export function isFacilitatorHash(hash: string): boolean {
  return hash === FACILITATOR_HASH
}

/** 참가자 휴대폰에서 열 주소 */
export function participantUrl(roomId: string): string {
  return buildUtRoomUrl(roomId, 'participant')
}

/** 진행자 휴대폰에서 열 주소 */
export function facilitatorUrl(roomId: string): string {
  return buildUtRoomUrl(roomId, 'facilitator')
}

/** 화면에 보여 줄 짧은 주소 (https:// 제외) */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '')
}
