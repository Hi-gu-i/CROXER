// ⚠️ 임시 초기 데이터
// UT 담당의 src/fixtures/croxer-ut-baseline.v1.json이 합쳐지면 이 파일을 지우고
// utStore.ts의 import 한 줄을 그 JSON으로 바꾼다.
// ID와 오늘 13:00·16:00·19:00은 베이스라인 값이다. 그 밖의 시각·문구·코스는 화면 확인용 임시값이다.
import type { UtBaseline } from './types'

const day = '2026-11-14'
const at = (time: string) => `${day}T${time}:00+09:00`

export const tempBaseline: UtBaseline = {
  version: 'temp-1',
  today: day,
  roles: [
    { id: 'role-leader', name: '교양 3조 팀장', label: '교양 3조 팀장' },
    { id: 'role-editor', name: '편집자', label: '편집자' },
    { id: 'role-runner', name: '러닝 크루장', label: '러닝 크루장' },
  ],
  activities: [
    { id: 'activity-research', roleId: 'role-leader', name: '지역 활성화 사례 리서치 검토', isReorderable: true },
    { id: 'activity-shoot', roleId: 'role-editor', name: '강변 촬영', isReorderable: true },
    { id: 'activity-run', roleId: 'role-runner', name: '한강 러닝', isReorderable: true },
    { id: 'activity-gpt-renewal', roleId: 'role-leader', name: 'ChatGPT 구독 연장하기', isReorderable: false },
    { id: 'activity-team-meeting', roleId: 'role-leader', name: '팀플회의 / 교양 팀장 녹음', isReorderable: false },
  ],
  schedules: [
    { id: 'schedule-research', activityId: 'activity-research', startsAt: at('13:00'), status: 'waiting' },
    { id: 'schedule-shoot', activityId: 'activity-shoot', startsAt: at('16:00'), status: 'waiting' },
    { id: 'schedule-run', activityId: 'activity-run', startsAt: at('19:00'), status: 'waiting' },
    // 04·05 시각은 UT 담당이 정한다. 아래는 임시값
    { id: 'schedule-gpt-renewal', activityId: 'activity-gpt-renewal', startsAt: at('21:00'), status: 'waiting' },
    { id: 'schedule-team-meeting', activityId: 'activity-team-meeting', startsAt: at('22:00'), status: 'waiting' },
  ],
  briefingOrder: [
    'schedule-research',
    'schedule-shoot',
    'schedule-run',
    'schedule-gpt-renewal',
    'schedule-team-meeting',
  ],
  resources: [
    { id: 'resource-research-cases', activityId: 'activity-research', title: '활성화 사례', kind: 'note', body: '(임시) 어제 밤 정리한 자료 본문' },
    { id: 'resource-shoot-reference', activityId: 'activity-shoot', title: '촬영 참고 자료', kind: 'reference', body: '(임시) 촬영 참고 자료 본문' },
    { id: 'resource-shoot-extra', activityId: 'activity-shoot', title: '레퍼런스 정리', kind: 'ai_result', body: '(임시) AI 정리 결과', aiJobId: 'job-shoot-extra' },
  ],
  aiJobs: [
    {
      id: 'job-shoot-extra',
      activityId: 'activity-shoot',
      requestedInActivityId: 'activity-run',
      title: '강변 촬영 레퍼런스 정리',
      status: 'queued',
      resultResourceIds: ['resource-shoot-extra'],
    },
  ],
  alerts: [
    { id: 'alert-shoot-rain', activityId: 'activity-shoot', kind: 'rain', title: '(임시) 비 예보', body: '(임시) 촬영 시간대에 비 예보가 있어요', status: 'unread' },
  ],
  inquiries: [
    { id: 'inquiry-run-weather', activityId: 'activity-run', authorName: '(임시) 크루원', body: '(임시) 비 오는데 오늘 러닝 하나요?' },
  ],
  aiAssessments: [
    { id: 'assessment-run-weather', activityId: 'activity-run', inquiryId: 'inquiry-run-weather', body: '(임시) 흙길 코스는 미끄러울 수 있어요' },
  ],
  courses: [
    { id: 'course-run-a', activityId: 'activity-run', name: '(임시) 대체 코스 A', meetingPoint: '(임시) 집결지 A', description: '(임시)' },
    { id: 'course-run-b', activityId: 'activity-run', name: '(임시) 대체 코스 B', meetingPoint: '(임시) 집결지 B', description: '(임시)' },
  ],
  announcements: [
    { id: 'announcement-run-course', activityId: 'activity-run', courseId: null, meetingPoint: '', body: '(임시) 오늘 러닝 코스가 바뀌었어요', status: 'draft' },
  ],
  keywordReplies: [
    { id: 'reply-shoot-indoor', activityId: 'activity-shoot', keywords: ['실내', '대안'], reply: '(임시) 실내 대안을 찾아볼게요' },
    { id: 'reply-run-reference', activityId: 'activity-run', keywords: ['레퍼런스', '자료'], reply: '(임시) 레퍼런스 정리를 시작할게요' },
  ],
  fallbackChoices: [
    { id: 'choice-shoot-indoor', activityId: 'activity-shoot', label: '실내 대안 보기', reply: '(임시) 실내 대안을 찾아볼게요' },
    { id: 'choice-run-reference', activityId: 'activity-run', label: '촬영 레퍼런스 정리 요청', reply: '(임시) 레퍼런스 정리를 시작할게요' },
  ],
}
