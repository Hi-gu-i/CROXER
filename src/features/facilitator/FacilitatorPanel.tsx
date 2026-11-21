import { useEffect, useRef, useState } from 'react'
import type { ActivityId, AiJobStatus, ScheduleStatus } from '../../data/types'
import {
  fireAlert,
  fireInquiry,
  getActiveRoleId,
  getActivity,
  getAiJob,
  getAlert,
  getAnnouncement,
  getBriefingItems,
  getCourses,
  getCurrentActivityId,
  getNextActivityId,
  getRole,
  getSelectedCourseId,
  isAiJobRequested,
  isAlertFired,
  isBriefingConfirmed,
  isInquiryFired,
  resetUtSession,
  skipToNextActivity,
} from '../../data/utStore'
import { useUtSession } from '../../data/useUtSession'
import { ReportPage } from '../report'
import { NotificationSettingsPage } from '../setup'
import { RoomSection } from './RoomSection'
import { isFacilitatorHash } from './roomLink'
import styles from './facilitator-panel.module.css'

const RAIN_ALERT_ID = 'alert-shoot-rain'
const CREW_INQUIRY_ID = 'inquiry-run-weather'
const RUN_ACTIVITY_ID: ActivityId = 'activity-run'
const REFERENCE_JOB_ID = 'job-shoot-extra'

/** 별도 탭으로 열 때 쓰는 주소 끝 */
export const FACILITATOR_HASH = '#facilitator'
/** 숨은 영역을 이 횟수만큼 TAP_WINDOW_MS 안에 누르면 열린다 */
const TAP_COUNT = 5
const TAP_WINDOW_MS = 2000

const scheduleLabel: Record<ScheduleStatus, string> = {
  waiting: '진행 전',
  in_progress: '진행 중',
  done: '완료',
}

const aiJobLabel: Record<AiJobStatus, string> = {
  queued: '요청됨',
  running: '실행 중',
  completed: '완료',
}

type PreviewId = 'notifications' | 'report'

const previewTitle: Record<PreviewId, string> = {
  notifications: '알림 설정',
  report: '리포트',
}

interface LogEntry {
  id: number
  time: string
  action: string
  context: string
}

interface FacilitatorPanelProps {
  /** 진행자가 막힌 과제를 넘겼을 때. App이 다음 활동 화면을 연다. 남은 활동이 없으면 null */
  onActivityChange?: (activityId: ActivityId | null) => void
  /** 참가자 초기화 직후. App이 첫 화면으로 돌아간다 */
  onReset?: () => void
}

function isStandaloneMode() {
  return typeof window !== 'undefined' && isFacilitatorHash(window.location.hash)
}

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

function nowLabel() {
  const now = new Date()
  return [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
}

/**
 * 진행자 패널(PRD 8.2). 참가자 화면에는 보이지 않는다.
 * 여는 방법: 화면 맨 위 왼쪽 숨은 영역 5번 연속 탭, 키보드 Option(Alt)+Shift+P, 같은 컴퓨터의 다른 탭에서 주소 끝 #진행자(또는 #facilitator).
 * 다른 휴대폰에서 열 때는 '두 기기 연결'에서 방을 만들고 참가자 휴대폰에 참가자 링크를 보낸다(#76).
 * 개입 기록은 이 화면에만 남고 저장소·브라우저 저장소에 쓰지 않는다. 관찰 기록지에 옮길 때 복사한다.
 */
export function FacilitatorPanel({ onActivityChange, onReset }: FacilitatorPanelProps) {
  useUtSession()
  const [standalone, setStandalone] = useState(isStandaloneMode)
  const [open, setOpen] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const [copied, setCopied] = useState(false)
  const [preview, setPreview] = useState<PreviewId | null>(null)
  const taps = useRef<number[]>([])
  const nextLogId = useRef(1)

  useEffect(() => {
    function onHashChange() {
      setStandalone(isStandaloneMode())
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey && event.shiftKey && event.code === 'KeyP' && !isTypingTarget(event.target)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const isOpen = standalone || open

  function handleSecretTap() {
    const now = Date.now()
    taps.current = [...taps.current.filter((time) => now - time < TAP_WINDOW_MS), now]
    if (taps.current.length >= TAP_COUNT) {
      taps.current = []
      setOpen(true)
    }
  }

  // 화면에 보여 줄 참가자 상태
  const confirmed = isBriefingConfirmed()
  const items = getBriefingItems()
  const activeRoleId = getActiveRoleId()
  const currentActivityId = getCurrentActivityId()
  const blockedActivityId = currentActivityId ?? (confirmed ? getNextActivityId() : null)
  const skipTargetId = blockedActivityId ? getNextActivityId(blockedActivityId) : null
  const canSkip = confirmed && blockedActivityId !== null
  const rainFired = isAlertFired(RAIN_ALERT_ID)
  const crewFired = isInquiryFired(CREW_INQUIRY_ID)
  const selectedCourse = getCourses(RUN_ACTIVITY_ID).find((course) => course.id === getSelectedCourseId())
  const announcement = getAnnouncement(RUN_ACTIVITY_ID)
  const referenceJob = isAiJobRequested(REFERENCE_JOB_ID) ? getAiJob(REFERENCE_JOB_ID) : null

  function currentContext() {
    return currentActivityId ? getActivity(currentActivityId).name : confirmed ? '활동 사이' : '브리핑'
  }

  function record(action: string) {
    const entry = { id: nextLogId.current++, time: nowLabel(), action, context: currentContext() }
    setLog((entries) => [entry, ...entries])
    setCopied(false)
  }

  function handleRain() {
    record('비 알림 띄움')
    fireAlert(RAIN_ALERT_ID)
  }

  function handleCrew() {
    record('크루원 문의 띄움')
    fireInquiry(CREW_INQUIRY_ID)
  }

  function handleSkip() {
    if (!blockedActivityId) return
    const from = getActivity(blockedActivityId).name
    const nextId = skipToNextActivity()
    record(nextId ? `막힌 과제 넘김: ${from} → ${getActivity(nextId).name}` : `막힌 과제 넘김: ${from} 완료, 남은 활동 없음`)
    onActivityChange?.(nextId)
  }

  function handleReset() {
    resetUtSession()
    setLog([])
    setCopied(false)
    setConfirmingReset(false)
    onReset?.()
  }

  async function handleCopy() {
    const text = [...log]
      .reverse()
      .map((entry) => `${entry.time}\t${entry.context}\t${entry.action}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className={styles.secretArea}
        aria-hidden="true"
        tabIndex={-1}
        onClick={handleSecretTap}
      />
    )
  }

  return (
    <div className={standalone ? styles.standalone : styles.scrim}>
      <section className={styles.panel} role="dialog" aria-modal={!standalone} aria-label="진행자 패널">
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>진행자 패널</h2>
            <p className={styles.caption}>참가자에게 보이지 않게 사용하세요</p>
          </div>
          {!standalone && (
            <button type="button" className={styles.closeButton} onClick={() => setOpen(false)}>
              닫기
            </button>
          )}
        </header>

        <RoomSection standalone={standalone} />

        <section className={styles.section} aria-labelledby="facilitator-status">
          <h3 id="facilitator-status" className={styles.sectionTitle}>
            참가자 진행 상태
          </h3>
          <dl className={styles.statusList}>
            <div className={styles.statusRow}>
              <dt>브리핑</dt>
              <dd>{confirmed ? '확정함' : '확정 전'}</dd>
            </div>
            <div className={styles.statusRow}>
              <dt>현재 활동</dt>
              <dd>
                {currentActivityId ? getActivity(currentActivityId).name : '없음'}
                {activeRoleId ? ` · ${getRole(activeRoleId).label}` : ''}
              </dd>
            </div>
            <div className={styles.statusRow}>
              <dt>비 알림</dt>
              <dd>{rainFired ? `띄움 · ${getAlert(RAIN_ALERT_ID).status === 'read' ? '읽음' : '안 읽음'}` : '아직'}</dd>
            </div>
            <div className={styles.statusRow}>
              <dt>크루원 문의</dt>
              <dd>{crewFired ? '띄움' : '아직'}</dd>
            </div>
            <div className={styles.statusRow}>
              <dt>코스·공지</dt>
              <dd>
                {selectedCourse ? selectedCourse.name : '코스 선택 전'}
                {announcement?.status === 'simulated_sent' ? ' · 공지 보냄' : ''}
              </dd>
            </div>
            <div className={styles.statusRow}>
              <dt>AI 작업</dt>
              <dd>{referenceJob ? aiJobLabel[referenceJob.status] : '요청 전'}</dd>
            </div>
          </dl>
          <ol className={styles.scheduleList}>
            {items.map((item, index) => (
              <li key={item.schedule.id} className={styles.scheduleRow}>
                <span className={styles.scheduleIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.scheduleName}>{item.activity.name}</span>
                <span className={styles.scheduleStatus} data-status={item.schedule.status}>
                  {scheduleLabel[item.schedule.status]}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="facilitator-events">
          <h3 id="facilitator-events" className={styles.sectionTitle}>
            돌발 상황 바로 띄우기
          </h3>
          <div className={styles.actionRow}>
            <button type="button" className={styles.actionButton} disabled={rainFired} onClick={handleRain}>
              {rainFired ? '비 알림 띄움' : '비 알림'}
            </button>
            <button type="button" className={styles.actionButton} disabled={crewFired} onClick={handleCrew}>
              {crewFired ? '크루원 문의 띄움' : '크루원 문의'}
            </button>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="facilitator-skip">
          <h3 id="facilitator-skip" className={styles.sectionTitle}>
            막힌 과제 넘기기
          </h3>
          <p className={styles.help}>
            {canSkip && blockedActivityId
              ? `${getActivity(blockedActivityId).name}을 완료로 옮기고 ${skipTargetId ? `${getActivity(skipTargetId).name} 시작 상태로 이동해요.` : '남은 활동 없이 마쳐요.'}`
              : confirmed
                ? '넘길 활동이 없어요.'
                : '브리핑을 확정한 뒤에 쓸 수 있어요.'}
          </p>
          <button type="button" className={styles.actionButton} disabled={!canSkip} onClick={handleSkip}>
            다음 활동으로 이동
          </button>
        </section>

        <section className={styles.section} aria-labelledby="facilitator-reset">
          <h3 id="facilitator-reset" className={styles.sectionTitle}>
            참가자 초기화
          </h3>
          {confirmingReset ? (
            <>
              <p className={styles.help}>
                진행 상황과 아래 개입 기록이 모두 지워져요. 기록을 먼저 복사했는지 확인하세요.
              </p>
              <div className={styles.actionRow}>
                <button type="button" className={styles.actionButton} onClick={() => setConfirmingReset(false)}>
                  취소
                </button>
                <button type="button" className={`${styles.actionButton} ${styles.danger}`} onClick={handleReset}>
                  초기화
                </button>
              </div>
            </>
          ) : (
            <button type="button" className={styles.actionButton} onClick={() => setConfirmingReset(true)}>
              새 참가자로 초기화
            </button>
          )}
        </section>

        <section className={styles.section} aria-labelledby="facilitator-preview">
          <h3 id="facilitator-preview" className={styles.sectionTitle}>
            첫 UT 범위 밖 화면 미리보기
          </h3>
          <p className={styles.help}>UT 흐름에는 없는 화면이에요. 참가자 진행 상태는 그대로 두고 열어 볼 수 있어요.</p>
          <div className={styles.actionRow}>
            <button type="button" className={styles.actionButton} onClick={() => setPreview('notifications')}>
              알림 설정
            </button>
            <button type="button" className={styles.actionButton} onClick={() => setPreview('report')}>
              리포트
            </button>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="facilitator-log">
          <div className={styles.logHeader}>
            <h3 id="facilitator-log" className={styles.sectionTitle}>
              개입 기록
            </h3>
            <button type="button" className={styles.textButton} disabled={log.length === 0} onClick={handleCopy}>
              {copied ? '복사함' : '기록 복사'}
            </button>
          </div>
          {log.length === 0 ? (
            <p className={styles.help}>아직 개입하지 않았어요.</p>
          ) : (
            <ul className={styles.logList}>
              {log.map((entry) => (
                <li key={entry.id} className={styles.logRow}>
                  <span className={styles.logTime}>{entry.time}</span>
                  <span>
                    {entry.action}
                    <span className={styles.logContext}> · {entry.context}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      {preview && (
        <div className={styles.previewLayer} role="dialog" aria-modal="true" aria-label={`${previewTitle[preview]} 미리보기`}>
          <div className={styles.previewBar}>
            <span className={styles.previewTag}>미리보기 · {previewTitle[preview]}</span>
            <button type="button" className={styles.closeButton} onClick={() => setPreview(null)}>
              닫기
            </button>
          </div>
          <div className={styles.previewBody}>{preview === 'notifications' ? <NotificationSettingsPage /> : <ReportPage />}</div>
        </div>
      )}
    </div>
  )
}
