import { buildUtRoomUrl } from '../../data/utStore'

/**
 * 두 기기 연결 주소 (#76).
 * 방 번호·연결은 utStore(getUtRoomId · createUtRoomId · getUtSyncStatus)가 맡고,
 * 여기서는 사람이 구분하기 쉽게 주소 끝에 '진행자' · '참가자'를 붙인다.
 */

/** 진행자 패널을 별도 화면으로 여는 주소 끝. '#facilitator'도 그대로 쓸 수 있다 */
export const FACILITATOR_HASH_KO = '#진행자'
/** 참가자 주소 끝. 앱 동작에는 영향이 없고 링크를 구분하는 표시다 */
export const PARTICIPANT_HASH_KO = '#참가자'

const FACILITATOR_HASHES = ['#facilitator', FACILITATOR_HASH_KO]

/** 주소 끝(#...)이 진행자 표시인지. 브라우저가 한글을 %EC.. 로 바꿔 주므로 풀어서 비교한다 */
export function isFacilitatorHash(hash: string): boolean {
  let decoded = hash
  try {
    decoded = decodeURIComponent(hash)
  } catch {
    // 잘못된 표기는 그대로 비교한다
  }
  return FACILITATOR_HASHES.includes(decoded)
}

/** 방 주소(끝 표시 없음). 한글 표시는 읽기 쉽게 %로 바꾸지 않고 그대로 붙인다 */
function roomBaseUrl(roomId: string): string {
  return buildUtRoomUrl(roomId, 'participant').replace(/#.*$/, '')
}

/** 참가자 휴대폰에서 열 주소. 예: https://croxer.vercel.app/?room=482193#참가자 */
export function participantUrl(roomId: string): string {
  return `${roomBaseUrl(roomId)}${PARTICIPANT_HASH_KO}`
}

/** 진행자 휴대폰에서 열 주소. 예: https://croxer.vercel.app/?room=482193#진행자 */
export function facilitatorUrl(roomId: string): string {
  return `${roomBaseUrl(roomId)}${FACILITATOR_HASH_KO}`
}

/** 화면에 보여 줄 짧은 주소 (https:// 제외) */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '')
}
