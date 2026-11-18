// CROXER 간단 UT 공용 데이터 타입
// 기준: docs/ut-data-baseline.md, docs/prd.md 6.2
// 화면은 이 타입을 가져다 쓰고, 값은 utStore.ts의 함수로만 읽고 쓴다.

// ── ID ─────────────────────────────────────────────
// 베이스라인의 ID를 그대로 쓴다. 새 ID는 UT 담당이 초기 데이터와 베이스라인에 먼저 추가한다.
export type RoleId = 'role-leader' | 'role-editor' | 'role-runner'

export type ActivityId =
  | 'activity-research'
  | 'activity-shoot'
  | 'activity-run'
  | 'activity-gpt-renewal'
  | 'activity-team-meeting'

export type ScheduleId =
  | 'schedule-research'
  | 'schedule-shoot'
  | 'schedule-run'
  | 'schedule-gpt-renewal'
  | 'schedule-team-meeting'

/** 순서를 바꿀 수 있는 앞 세 칸(리서치·촬영·러닝)의 일정 ID */
export type ReorderableScheduleId = 'schedule-research' | 'schedule-shoot' | 'schedule-run'

// ── 상태 값 ─────────────────────────────────────────
/** 일정 상태. 항상 오늘 기준(PRD 6.2) */
export type ScheduleStatus = 'waiting' | 'in_progress' | 'done'
/** AI 작업 상태. 일정 상태와 별개이며 요청 접수만으로 completed가 되지 않는다 */
export type AiJobStatus = 'queued' | 'running' | 'completed'
export type AlertStatus = 'unread' | 'read'
export type AnnouncementStatus = 'draft' | 'simulated_sent'

// ── 초기 데이터(가상, 읽기 전용) ─────────────────────
export interface Role {
  id: RoleId
  /** 역할 이름. 예: 교양 3조 팀장 */
  name: string
  /** 역할 태그에 쓰는 짧은 표시 문구 */
  label: string
}

export interface Activity {
  id: ActivityId
  roleId: RoleId
  name: string
  /** 브리핑에서 순서를 바꿀 수 있는지. 01~03은 true, 04·05는 false */
  isReorderable: boolean
}

export interface Schedule {
  id: ScheduleId
  activityId: ActivityId
  /**
   * ISO 8601, 한국 시간. 예: 2026-11-14T13:00:00+09:00.
   * 브리핑 자리의 시각이다. 초기 데이터에는 초기 순서의 시각이 들어 있고, 조회 함수는 저장된 브리핑 순서의 자리에 맞춘 시각을 돌려준다
   */
  startsAt: string
  status: ScheduleStatus
}

export interface Resource {
  id: string
  activityId: ActivityId
  title: string
  /** 자료 종류. 예: note, reference, ai_result */
  kind: string
  body: string
  /** AI 작업 결과 자료라면 그 작업 ID. 작업이 completed가 되기 전에는 화면에서 숨긴다 */
  aiJobId?: string
}

export interface AiJob {
  id: string
  /** 결과가 연결될 활동. job-shoot-extra는 activity-shoot */
  activityId: ActivityId
  /** 요청이 일어난 활동. job-shoot-extra는 activity-run */
  requestedInActivityId: ActivityId
  title: string
  status: AiJobStatus
  resultResourceIds: string[]
}

export interface Alert {
  id: string
  activityId: ActivityId
  /** 알림 종류. 예: rain */
  kind: string
  title: string
  body: string
  status: AlertStatus
}

/** 크루원 문의. AI 판단과 출처가 다른 정보로 표시한다 */
export interface Inquiry {
  id: string
  activityId: ActivityId
  authorName: string
  body: string
}

/** AI 판단. 문의와 구분해서 표시한다 */
export interface AiAssessment {
  id: string
  activityId: ActivityId
  inquiryId: string
  body: string
}

export interface Course {
  id: string
  activityId: ActivityId
  name: string
  meetingPoint: string
  description: string
}

export interface Announcement {
  id: string
  activityId: ActivityId
  /** 선택한 코스. 코스를 고르기 전에는 null */
  courseId: string | null
  /** 선택한 코스의 집결지 */
  meetingPoint: string
  body: string
  status: AnnouncementStatus
}

/** 채팅 입력의 별칭 키워드와 준비된 응답. UT 담당이 관리한다 */
export interface KeywordReply {
  id: string
  activityId: ActivityId
  keywords: string[]
  reply: string
}

/** 키워드가 맞지 않을 때 보여줄 준비된 선택지 */
export interface FallbackChoice {
  id: string
  activityId: ActivityId
  label: string
  reply: string
}

/**
 * 초기 데이터 파일(src/fixtures/croxer-ut-baseline.v1.json)의 모양.
 * UT 담당이 이 모양에 맞춰 초기 데이터를 만든다.
 */
export interface UtBaseline {
  version: string
  /** 가상 날짜. 예: 2026-11-14 */
  today: string
  roles: Role[]
  activities: Activity[]
  schedules: Schedule[]
  /** 초기 브리핑 순서. 앞 세 칸은 바꿀 수 있고 뒤 두 칸은 고정 */
  briefingOrder: ScheduleId[]
  resources: Resource[]
  aiJobs: AiJob[]
  alerts: Alert[]
  inquiries: Inquiry[]
  aiAssessments: AiAssessment[]
  courses: Course[]
  announcements: Announcement[]
  keywordReplies: KeywordReply[]
  fallbackChoices: FallbackChoice[]
}

// ── 참가자 세션(브라우저에 저장, 진행자 초기화 대상) ───
export interface UtSession {
  /** 저장 형식 버전. 형식이 바뀌면 이전 저장값을 버리고 초기 데이터로 시작한다 */
  version: string
  briefingOrder: ScheduleId[]
  /** 참가자가 브리핑 순서를 확정했는지 */
  isBriefingConfirmed: boolean
  activeRoleId: RoleId | null
  currentActivityId: ActivityId | null
  scheduleStatus: Record<ScheduleId, ScheduleStatus>
  aiJobStatus: Record<string, AiJobStatus>
  /** 참가자가 AI 작업을 요청한 시각(ISO). 요청 전에는 키가 없다 */
  aiJobRequestedAt: Record<string, string>
  alertStatus: Record<string, AlertStatus>
  /** 알림이 화면에 뜬 시각(ISO). 뜨기 전에는 키가 없다 */
  alertFiredAt: Record<string, string>
  /** 크루원 문의가 발생한 시각(ISO). 발생 전에는 키가 없다 */
  inquiryFiredAt: Record<string, string>
  selectedCourseId: string | null
  announcementStatus: Record<string, AnnouncementStatus>
}

/** 스케줄 화면에 보여줄 영역별 목록 */
export interface ScheduleSections {
  /** 진행 완료 */
  done: ScheduleView[]
  /** 진행 중 */
  inProgress: ScheduleView[]
  /** 백그라운드 AI 작업(queued·running) */
  background: AiJob[]
  /** 진행 후(아직 시작하지 않은 활동) */
  upcoming: ScheduleView[]
}

/** 화면에서 쓰기 쉽게 일정·활동·역할을 묶은 값 */
export interface ScheduleView {
  schedule: Schedule
  activity: Activity
  role: Role
  /** 브리핑 순서상 위치(1부터). 표시용이며 ID로 쓰지 않는다 */
  position: number
}
