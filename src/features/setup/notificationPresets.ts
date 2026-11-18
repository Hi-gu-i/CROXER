/**
 * 알림 설정(PRD F-02)의 유형과 상황별 토글.
 * 유형별 토글 조합은 PRD에서 '구현 담당자가 단순한 조합으로 정한다'고 둔 부분이다.
 */

export type NotificationTypeId = 'focus' | 'balanced' | 'all'
export type NotificationSituationId = 'schedule' | 'collaboration' | 'aiJob' | 'dailyReport'

export interface NotificationType {
  id: NotificationTypeId
  label: string
  description: string
}

export interface NotificationSituation {
  id: NotificationSituationId
  label: string
  description: string
}

export type NotificationToggles = Record<NotificationSituationId, boolean>

export const notificationTypes: NotificationType[] = [
  { id: 'focus', label: '집중 우선', description: '하는 활동에 집중해요. 일정이 바뀔 때만 바로 알려요.' },
  { id: 'balanced', label: '균형 있게', description: '일정 변경과 협업 문의는 바로, 나머지는 모아서 알려요.' },
  { id: 'all', label: '놓치지 않기', description: '모든 상황을 바로 알려요.' },
]

export const notificationSituations: NotificationSituation[] = [
  { id: 'schedule', label: '일정 변경·날씨', description: '비 예보처럼 일정에 영향을 주는 변화' },
  { id: 'collaboration', label: '협업 문의', description: '팀원·크루원이 보낸 문의와 답장 요청' },
  { id: 'aiJob', label: 'AI 작업 완료', description: '맡겨 둔 자료 정리·초안 작성이 끝났을 때' },
  { id: 'dailyReport', label: '하루 리포트', description: '하루를 마칠 때 오늘의 진행 상황 요약' },
]

export const presetToggles: Record<NotificationTypeId, NotificationToggles> = {
  focus: { schedule: true, collaboration: false, aiJob: false, dailyReport: false },
  balanced: { schedule: true, collaboration: true, aiJob: false, dailyReport: true },
  all: { schedule: true, collaboration: true, aiJob: true, dailyReport: true },
}

export const defaultNotificationType: NotificationTypeId = 'balanced'

/** 토글 조합이 어느 유형과 같은지 찾는다. 직접 바꿔 어느 유형과도 같지 않으면 null */
export function matchPreset(toggles: NotificationToggles): NotificationTypeId | null {
  const match = notificationTypes.find((type) =>
    notificationSituations.every((situation) => presetToggles[type.id][situation.id] === toggles[situation.id]),
  )
  return match ? match.id : null
}
