// 스케줄(F-11). 화면 배치는 Figma `MYA_Interaction` › `02 · 스케줄 final`을 따른다
// - 시안의 두 영역(지난 활동·예정된 활동) 대신 PRD 기준 세 영역으로 나눈다:
//   진행 완료 / 진행 중 / 백그라운드 / 진행 후
// - 진행 중 활동과 AI 백그라운드 작업은 같은 영역 안에서 따로 보여준다. 요청만 받은 작업을 완료로 보이지 않는다
// - 진행 후의 활동은 UT 흐름(01~03)이 끝나기 전에는 '예정', 끝난 뒤에는 '미완료'로 보인다(PRD F-11)
// - 순서와 시각은 브리핑에서 정한 자리 그대로다(데이터 조회 함수가 돌려주는 값)
// - 날짜 칸·알림 버튼은 시안 모양만 둔다(누를 수 없음). 탭바는 앱 틀(통합 담당) 몫이라 넣지 않는다
import type { ReactNode } from 'react'
import { Tag } from '../../components'
import type { TagTone } from '../../components/Tag'
import type { ActivityId, AiJob, AiJobStatus, RoleId, ScheduleStatus, ScheduleView } from '../../data/types'
import { getActivity, getRole, getScheduleSections, getToday, isUtFlowFinished } from '../../data/utStore'
import { useUtSession } from '../../data/useUtSession'
import { IconAi, IconCheck, IconComplete, IconNoti, IconTime, IconToggle } from '../../icons'
import styles from './schedule-page.module.css'

export default function SchedulePage() {
  useUtSession()
  const { done, inProgress, background, upcoming } = getScheduleSections()
  const today = getToday()
  const isFinished = isUtFlowFinished()

  return (
    <section className={styles.schedulePage} aria-labelledby="schedule-title">
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 id="schedule-title" className={styles.title}>
            {formatMonthDay(today)}
            <IconToggle size={16} className={styles.titleIcon} />
          </h1>
          {/* 알림 버튼은 시안 모양만 둔다. 알림 목록은 첫 UT 범위 밖 */}
          <span className={styles.notiButton} aria-hidden="true">
            <IconNoti size={24} />
          </span>
        </div>
        <DaySelector today={today} />
      </header>

      <ScheduleSection
        title="진행 완료"
        emptyText="아직 마친 활동이 없어요."
        rows={done.map((item) => <ScheduleRow key={item.schedule.id} item={item} />)}
      />
      <ScheduleSection
        title="진행 중 / 백그라운드"
        emptyText="지금 진행 중인 활동이 없어요."
        rows={[
          ...inProgress.map((item) => <ScheduleRow key={item.schedule.id} item={item} />),
          ...background.map((job) => <BackgroundJobRow key={job.id} job={job} />),
        ]}
      />
      <ScheduleSection
        title="진행 후"
        emptyText="남은 활동이 없어요."
        rows={upcoming.map((item) => <ScheduleRow key={item.schedule.id} item={item} isFinished={isFinished} />)}
      />
    </section>
  )
}

// 카드 아래 설명 한 줄. 브리핑과 같은 문구다.
// 두 화면이 함께 쓰므로 활동 데이터 필드로 옮길 예정(UT 담당 베이스라인 변경 필요). 그때까지 화면 상수로 둔다
const activitySummary: Record<ActivityId, string> = {
  'activity-research': '어제 정리한 사례 3가지 확인하기',
  'activity-shoot': '촬영 방향과 참고 자료 준비됨',
  'activity-run': '반복 문의와 공지 정리됨',
  'activity-gpt-renewal': 'AI 구독 연장 제안',
  'activity-team-meeting': '이전 회의 내용과 자료 준비됨',
}

// 역할별 태그 색. 시안의 학생(노랑)·편집자(보라)·러닝 크루장(민트)을 따른다
const roleTone: Record<RoleId, TagTone> = {
  'role-leader': 'yellow',
  'role-editor': 'violet',
  'role-runner': 'mint',
}

const scheduleStatusLabel: Record<ScheduleStatus, string> = {
  done: '완료',
  in_progress: '진행 중...',
  waiting: '예정',
}

/** UT 흐름을 마친 뒤 남은 활동(구독 연장·팀플회의)의 상태 표시 */
const unfinishedLabel = '미완료'

const aiJobStatusLabel: Record<AiJobStatus, string> = {
  queued: '요청됨',
  running: '정리 중',
  completed: '정리 완료',
}

interface ScheduleSectionProps {
  title: string
  emptyText: string
  rows: ReactNode[]
}

function ScheduleSection({ title, emptyText, rows }: ScheduleSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {rows.length > 0 ? (
        <ol className={styles.list}>{rows}</ol>
      ) : (
        <p className={styles.empty}>{emptyText}</p>
      )}
    </section>
  )
}

function ScheduleRow({ item, isFinished = false }: { item: ScheduleView; isFinished?: boolean }) {
  const { status } = item.schedule
  const isUnfinished = isFinished && status === 'waiting'
  // 시안처럼 시작한 활동(완료·진행 중)은 체크를 채운다
  const isStarted = status !== 'waiting'
  return (
    <TimelineRow
      line={status === 'done' ? 'done' : status === 'in_progress' ? 'progress' : 'idle'}
      marker={
        <span className={`${styles.check} ${isStarted ? styles.checkDone : ''}`}>
          {isStarted && <IconCheck size={14} />}
        </span>
      }
      label={formatTime(item.schedule.startsAt)}
      isCurrent={status === 'in_progress'}
    >
      <ScheduleCard
        tone={roleTone[item.role.id]}
        tag={item.role.label}
        title={item.activity.name}
        description={activitySummary[item.activity.id]}
        status={
          <>
            {status === 'done' && <IconComplete size={14} />}
            {status === 'waiting' && !isUnfinished && <IconTime size={14} />}
            {isUnfinished ? unfinishedLabel : scheduleStatusLabel[status]}
          </>
        }
        isCurrent={status === 'in_progress'}
      />
    </TimelineRow>
  )
}

/** AI가 뒤에서 하는 작업. 진행 중 활동과 섞이지 않게 AI 표시와 작업 상태를 따로 둔다 */
function BackgroundJobRow({ job }: { job: AiJob }) {
  const activity = getActivity(job.activityId)
  const role = getRole(activity.roleId)
  return (
    <TimelineRow
      line="idle"
      marker={
        <span className={styles.aiMarker}>
          <IconAi size={14} />
        </span>
      }
      label="AI 백그라운드"
      isCurrent={false}
    >
      <ScheduleCard
        tone={roleTone[role.id]}
        tag={role.label}
        title={job.title}
        description={`${activity.name}에 결과를 연결해요`}
        status={aiJobStatusLabel[job.status]}
        isCurrent
      />
    </TimelineRow>
  )
}

interface TimelineRowProps {
  /** 체크 아래 세로선 색: 마침 / 진행 중(위쪽만 진하게) / 아직 */
  line: 'done' | 'progress' | 'idle'
  marker: ReactNode
  label: string
  isCurrent: boolean
  children: ReactNode
}

/** 한 줄 = 왼쪽 표시(체크·AI) + 시각 + 카드. 세로선은 체크 아래에서 다음 체크 앞까지 잇는다 */
function TimelineRow({ line, marker, label, isCurrent, children }: TimelineRowProps) {
  const lineClass = { done: styles.lineDone, progress: styles.lineProgress, idle: '' }[line]
  return (
    <li className={`${styles.item} ${lineClass}`}>
      <div className={styles.rail} aria-hidden="true">
        <span className={styles.railHead}>{marker}</span>
      </div>
      <p className={`${styles.time} ${isCurrent ? styles.timeCurrent : ''}`}>{label}</p>
      <div className={styles.cardSlot}>{children}</div>
    </li>
  )
}

interface ScheduleCardProps {
  tone: TagTone
  tag: string
  title: string
  description: string
  status: ReactNode
  isCurrent: boolean
}

// 시안의 스케줄 카드(태그 + 상태 / 이름 + 설명).
// 공통 ScheduleListCard는 누르는 버튼이라, 누를 일이 없는 이 목록에서는 같은 모양을 화면 안에서 만든다
function ScheduleCard({ tone, tag, title, description, status, isCurrent }: ScheduleCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <Tag tone={tone}>{tag}</Tag>
        <span className={`${styles.status} ${isCurrent ? styles.statusCurrent : ''}`}>{status}</span>
      </div>
      <div className={styles.cardText}>
        <p className={styles.activityName}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  )
}

const seoul = { timeZone: 'Asia/Seoul' } as const

function formatTime(startsAt: string) {
  return new Intl.DateTimeFormat('ko-KR', { ...seoul, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(
    new Date(startsAt),
  )
}

/** 2026-11-14 → 11월 14일 */
function formatMonthDay(today: string) {
  return new Intl.DateTimeFormat('ko-KR', { ...seoul, month: 'long', day: 'numeric' }).format(toDate(today))
}

function toDate(day: string) {
  return new Date(`${day}T12:00:00+09:00`)
}

/**
 * 오늘이 든 한 주(일~토) 날짜 칸. 시안 모양을 따르고 오늘만 강조한다.
 * 첫 UT는 오늘 하루만 다루므로 다른 날짜는 누를 수 없다
 */
function DaySelector({ today }: { today: string }) {
  const base = toDate(today)
  const weekdayFormat = new Intl.DateTimeFormat('ko-KR', { ...seoul, weekday: 'narrow' })
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base)
    date.setDate(base.getDate() - base.getDay() + index)
    return { key: index, day: date.getDate(), weekday: weekdayFormat.format(date), isToday: index === base.getDay() }
  })
  return (
    <ol className={styles.days} aria-label="이번 주">
      {days.map((item) => (
        <li
          key={item.key}
          className={`${styles.day} ${item.isToday ? styles.dayToday : ''}`}
          aria-current={item.isToday ? 'date' : undefined}
        >
          <span className={styles.dayNumber}>{item.day}</span>
          <span className={styles.dayWeekday}>{item.weekday}</span>
        </li>
      ))}
    </ol>
  )
}
