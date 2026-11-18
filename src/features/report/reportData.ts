import type { ActivityId, RoleId, ScheduleView } from '../../data/types'

/**
 * 리포트의 가상 데이터. PRD F-11: '소요 시간과 과거 패턴에는 가상 데이터를 사용한다'.
 * 오늘 활동의 진행 상태는 세션에서 읽고, 여기에는 세션에 없는 값만 둔다.
 */

/** 오늘 마친 활동의 소요 시간(분) */
export const virtualDurationMinutes: Partial<Record<ActivityId, number>> = {
  'activity-research': 40,
  'activity-shoot': 70,
  'activity-run': 45,
}

/** 이번 주 월~금 완료율(%). 토요일(오늘)은 세션의 실제 진행률로 채운다 */
export const weekdayCompletion = [
  { label: '월', value: 58 },
  { label: '화', value: 31 },
  { label: '수', value: 63 },
  { label: '목', value: 72 },
  { label: '금', value: 80 },
]

export const lastWeekAverage = 57

export const weeklyPattern = {
  title: '회의 뒤 편집이 늦게 시작된 날이 있어요.',
  caption: '회의 직후 편집 3회 중 2회, 시작 지연',
  rows: [
    { date: '11/09', change: '15:00 → 15:50', result: '+50분' },
    { date: '11/11', change: '14:00 → 16:30', result: '+150분' },
    { date: '11/12', change: '15:00 → 15:00', result: '예정대로' },
  ],
  insightTitle: '회의 뒤, 다음 작업까지 여유가 필요했나요?',
  insightBody: '늦게 시작한 두 날의 평균 지연은 100분이에요. 여유가 필요했다면 다음 일정에 반영할게요.',
}

export const roleIconKey: Record<RoleId, 'leader' | 'editor' | 'runner'> = {
  'role-leader': 'leader',
  'role-editor': 'editor',
  'role-runner': 'runner',
}

export function timeLabel(iso: string) {
  return iso.slice(11, 16)
}

/** 오늘 진행 상황 카드의 설명 한 줄 */
export function progressDetail(item: ScheduleView) {
  const { schedule, activity } = item
  if (schedule.status === 'done') {
    const minutes = virtualDurationMinutes[activity.id]
    return minutes ? `완료 • ${minutes}분 걸림` : '완료'
  }
  if (schedule.status === 'in_progress') return '진행 중'
  return `진행 전 • ${timeLabel(schedule.startsAt)} 예정`
}

/** 오늘 마친 활동 중 가장 오래 걸린 활동 */
export function longestDone(items: ScheduleView[]) {
  return items
    .filter((item) => item.schedule.status === 'done' && virtualDurationMinutes[item.activity.id])
    .sort((a, b) => (virtualDurationMinutes[b.activity.id] ?? 0) - (virtualDurationMinutes[a.activity.id] ?? 0))[0]
}
