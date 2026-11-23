import { useEffect, useRef, useState, type ComponentType, type MouseEvent, type ReactNode } from 'react'
import styles from './app.module.css'
import { IconHome, IconReport, IconSchedule, IconSet } from './icons'
import type { ActivityId, UtSession } from './data/types'
import { useUtSession } from './data/useUtSession'
import {
  completeActivity,
  enterActivity,
  getActiveRoleId,
  getActivity,
  getCurrentActivityId,
  getNextActivityId,
  getAnnouncement,
  getRole,
  getScheduleByActivity,
  isBriefingConfirmed,
  subscribeUtExternalChange,
} from './data/utStore'
import BriefingPage from './features/briefing/BriefingPage'
import { FacilitatorPanel } from './features/facilitator'
import { isFacilitatorHash } from './features/facilitator/roomLink'
import HomeScreen from './features/home/HomeScreen'
import RoleSwitchPanel from './features/role-switch/RoleSwitchPanel'
import { ReportPage } from './features/report'
import SchedulePage from './features/schedule/SchedulePage'
import { NotificationSettingsPage } from './features/setup'
import { ResearchActivityPage } from './features/research'
import { RunActivityPage } from './features/run'
import { ShootActivityPage } from './features/shoot'

type TabId = 'home' | 'schedule' | 'report' | 'settings'

type Screen = { name: TabId } | { name: 'activity'; activityId: ActivityId }

interface ActivityScreenProps {
  activityId: ActivityId
  /** 활동의 UT 흐름을 마쳤을 때 한 번 부른다. 완료 처리와 다음 활동 안내는 App이 맡는다 */
  onFinish: () => void
  /** 헤더의 홈. 그 버튼이 있는 활동 화면이 부른다 */
  onHome?: () => void
  /**
   * 카톡 공지 전송 완료 화면 다음, 측정으로 넘어가기 전에 부른다.
   * 전환 패널이 끝나면 runMeterReady가 true가 된다.
   */
  onRunHandoff?: () => void
  /** 공지→측정 전환 패널이 끝난 뒤에만 true. 측정 화면을 열 때 쓴다 */
  runMeterReady?: boolean
  /**
   * 공지→측정 패널 「유지하기」.
   * 러닝만 듣고 공지 초안(직전)으로 되돌린다.
   */
  runHandoffStayNonce?: number
  /**
   * 활동 전환 패널 「유지하기」(촬영 일정 완료 뒤 등).
   * 해당 활동만 듣고 완료 직전 화면으로 되돌린다.
   */
  activityKeepNonce?: number
  /** 유지하기 후 「다음으로」· 공지→측정으로 안전하게 진행 */
  onContinueForward?: () => void
}

/** 전송 완료 화면이 잠깐 보인 뒤 패널이 내려온다 */
const runNoticeFlashMs = 1800

const tabs: { id: TabId; label: string; Icon: typeof IconHome }[] = [
  { id: 'home', label: '홈', Icon: IconHome },
  { id: 'schedule', label: '스케줄', Icon: IconSchedule },
  { id: 'report', label: '리포트', Icon: IconReport },
  { id: 'settings', label: '설정', Icon: IconSet },
]

// 활동 화면 연결 지점. 담당 화면이 준비되면 활동 ID에 맞춰 여기에 등록한다.
// 등록하지 않은 활동은 임시 화면(TempActivityScreen)이 열린다.
const activityScreens: Partial<Record<ActivityId, ComponentType<ActivityScreenProps>>> = {
  'activity-research': ResearchActivityPage,
  'activity-shoot': ShootActivityPage,
  'activity-run': RunActivityPage,
}

export default function App() {
  useUtSession()
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [switchTargetId, setSwitchTargetId] = useState<ActivityId | null>(null)
  const [runHandoff, setRunHandoff] = useState(false)
  const [runMeterReady, setRunMeterReady] = useState(false)
  const [runHandoffStayNonce, setRunHandoffStayNonce] = useState(0)
  const [activityKeepNonce, setActivityKeepNonce] = useState(0)
  const runMeterReadyRef = useRef(false)
  const facilitatorStandalone = useFacilitatorStandalone()

  /** 다음 활동 전환 패널 유지하기 · 패널만 닫고(촬영 완료 직후 등은 직전 화면 신호) */
  function keepActivitySwitch() {
    setSwitchTargetId(null)
    setActivityKeepNonce((value) => value + 1)
  }

  /** 공지→측정 패널 유지하기 · 측정으로 넘기지 않고 공지 초안 복귀 신호 */
  function keepRunHandoff() {
    setRunHandoff(false)
    runMeterReadyRef.current = false
    setRunMeterReady(false)
    setRunHandoffStayNonce((value) => value + 1)
  }

  function clearRunHandoff() {
    runMeterReadyRef.current = false
    setRunHandoff(false)
    setRunMeterReady(false)
  }

  function requestRunHandoff() {
    if (runMeterReadyRef.current) return
    setRunHandoff(true)
  }

  function finishRunHandoff() {
    // 같은 러닝 안의 측정 시작이다. 역할을 바꾸거나 일정을 완료로 만들지 않는다.
    runMeterReadyRef.current = true
    setRunHandoff(false)
    setRunMeterReady(true)
  }

  const onRunScreen = screen.name === 'activity' && screen.activityId === 'activity-run'
  const runNoticeSent = onRunScreen && getAnnouncement('activity-run')?.status === 'simulated_sent'
  const runNoticeWasDraft = useRef(false)

  useEffect(() => {
    if (!onRunScreen) {
      runNoticeWasDraft.current = getAnnouncement('activity-run')?.status !== 'simulated_sent'
      return
    }
    if (!runNoticeSent) {
      runNoticeWasDraft.current = true
      return
    }
    if (!runNoticeWasDraft.current || runMeterReadyRef.current) return
    const timer = window.setTimeout(() => {
      runNoticeWasDraft.current = false
      if (runMeterReadyRef.current) return
      setRunHandoff(true)
    }, runNoticeFlashMs)
    return () => window.clearTimeout(timer)
  }, [onRunScreen, runNoticeSent])

  // 이 기기의 저장은 부르지 않는다. 다른 탭·다른 기기가 세션을 바꿨을 때만 화면을 옮긴다.
  useEffect(() => {
    return subscribeUtExternalChange((previous, next) => {
      const briefingChanged = next.isBriefingConfirmed !== previous.isBriefingConfirmed
      const activityChanged = next.currentActivityId !== previous.currentActivityId
      const prevStarted = readStartedAt(previous)
      const nextStarted = readStartedAt(next)
      const startedAtChanged = prevStarted !== undefined && nextStarted !== prevStarted
      if (!briefingChanged && !activityChanged && !startedAtChanged) return
      setSwitchTargetId(null)
      clearRunHandoff()
      if (!next.isBriefingConfirmed || briefingChanged || startedAtChanged) {
        setScreen({ name: 'home' })
        return
      }
      setScreen(
        next.currentActivityId ? { name: 'activity', activityId: next.currentActivityId } : { name: 'schedule' },
      )
    })
  }, [])

  function handleFacilitatorActivity(nextActivityId: ActivityId | null) {
    setSwitchTargetId(null)
    clearRunHandoff()
    setScreen(nextActivityId ? { name: 'activity', activityId: nextActivityId } : { name: 'schedule' })
  }

  function handleFacilitatorReset() {
    setSwitchTargetId(null)
    clearRunHandoff()
    setScreen({ name: 'home' })
  }

  // 진행자 주소(#facilitator, #진행자)는 참가자 홈을 그리지 않는다. 홈이 활동을 진행 중으로 저장하면 다른 화면의 현재 활동을 덮어쓴다.
  if (facilitatorStandalone) {
    return (
      <Frame>
        <FacilitatorPanel onActivityChange={handleFacilitatorActivity} onReset={handleFacilitatorReset} />
      </Frame>
    )
  }

  if (!isBriefingConfirmed()) {
    return (
      <Frame>
        <BriefingPage
          onConfirm={() => {
            setSwitchTargetId(null)
            clearRunHandoff()
            setScreen({ name: 'home' })
          }}
        />
        <FacilitatorPanel onActivityChange={handleFacilitatorActivity} onReset={handleFacilitatorReset} />
      </Frame>
    )
  }

  function goHome() {
    // 전환 패널이 떠 있으면 그 선택이 우선이다. 홈으로 보내며 패널을 닫지 않는다.
    if (switchTargetId || runHandoff) return
    setScreen({ name: 'home' })
  }

  function handleActivityHomeCapture(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest('button')
    if (button?.getAttribute('aria-label') !== '홈') return
    event.preventDefault()
    event.stopPropagation()
    goHome()
  }

  function openActivity(activityId: ActivityId) {
    // 브리핑 확정(confirmBriefing)이 첫 활동 진입을 이미 처리했으므로 같은 활동이면 다시 시작하지 않는다.
    if (getCurrentActivityId() !== activityId) enterActivity(activityId)
    clearRunHandoff()
    setScreen({ name: 'activity', activityId })
  }

  function finishActivity(activityId: ActivityId) {
    const nextActivityId =
      getScheduleByActivity(activityId).status === 'done'
        ? getNextActivityId(activityId)
        : completeActivity(activityId)
    if (nextActivityId) {
      setSwitchTargetId(nextActivityId)
      return
    }
    setScreen({ name: 'schedule' })
  }

  function switchToNextActivity() {
    if (!switchTargetId || screen.name !== 'activity') return
    enterActivity(switchTargetId)
    clearRunHandoff()
    setScreen({ name: 'activity', activityId: switchTargetId })
    setSwitchTargetId(null)
  }

  // 활동 화면은 마친 뒤에도 하단 탭을 두지 않는다. 나갈 때는 상단 홈 버튼을 쓴다.
  const showTabBar = screen.name !== 'activity'
  const activeTab: TabId | null = screen.name === 'activity' ? null : screen.name
  const ActivityScreen =
    screen.name === 'activity' ? (activityScreens[screen.activityId] ?? TempActivityScreen) : null

  return (
    <Frame>
      <main
        className={
          screen.name === 'activity'
            ? styles.activityHost
            : showTabBar
              ? `${styles.screen} ${styles.screenWithTabBar}`
              : styles.screen
        }
      >
        {screen.name === 'home' && (
          <HomeScreen onOpenActivity={openActivity} />
        )}
        {screen.name === 'activity' && ActivityScreen && (
          <div className={styles.activityScreen} onClickCapture={handleActivityHomeCapture}>
            <ActivityScreen
              key={screen.activityId}
              activityId={screen.activityId}
              onFinish={() => finishActivity(screen.activityId)}
              onHome={goHome}
              onRunHandoff={screen.activityId === 'activity-run' ? requestRunHandoff : undefined}
              runMeterReady={screen.activityId === 'activity-run' && runMeterReady}
              runHandoffStayNonce={runHandoffStayNonce}
              activityKeepNonce={activityKeepNonce}
              onContinueForward={
                screen.activityId === 'activity-run' ? finishRunHandoff : undefined
              }
            />
          </div>
        )}
        {/* 진행 완료 카드를 누르면 그 활동 화면만 연다. 스케줄 화면이 onOpenActivity를 받기 시작하면 연결한다 */}
        {screen.name === 'schedule' && <SchedulePage />}
        {screen.name === 'report' && <ReportPage />}
        {screen.name === 'settings' && <NotificationSettingsPage />}
      </main>
      {showTabBar && (
        <nav className={styles.tabBar} aria-label="하단 탭">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              aria-current={tab.id === activeTab ? 'page' : undefined}
              onClick={() => setScreen({ name: tab.id })}
            >
              <tab.Icon className={styles.tabIcon} size={24} />
              <span className={tab.id === activeTab ? styles.tabLabel : styles.visuallyHidden}>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      )}
      {switchTargetId && (
        <RoleSwitchPanel
          nextActivityId={switchTargetId}
          onSwitch={switchToNextActivity}
          onKeep={keepActivitySwitch}
        />
      )}
      {runHandoff && !switchTargetId && (
        <RoleSwitchPanel
          nextActivityId="activity-run"
          fromActivityName="코스 변경 공지"
          toActivityName="러닝 측정"
          onSwitch={finishRunHandoff}
          onKeep={keepRunHandoff}
        />
      )}
      <FacilitatorPanel onActivityChange={handleFacilitatorActivity} onReset={handleFacilitatorReset} />
    </Frame>
  )
}

function useFacilitatorStandalone() {
  const [standalone, setStandalone] = useState(
    () => typeof window !== 'undefined' && isFacilitatorHash(window.location.hash),
  )
  useEffect(() => {
    const onHashChange = () => setStandalone(isFacilitatorHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return standalone
}

/** 세션에 초기화 시각이 생기기 전에는 필드가 없다. 없던 값이 처음 생기는 것은 초기화로 보지 않는다. */
function readStartedAt(session: UtSession): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(session, 'startedAt')) return undefined
  return typeof session.startedAt === 'string' ? session.startedAt : undefined
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stage}>
      <div className={styles.frame}>{children}</div>
    </div>
  )
}

// 아래 Temp* 화면은 담당 화면이 합쳐지면 위의 연결 지점에서 교체하고 지운다.

function TempActivityScreen({ activityId, onFinish }: ActivityScreenProps) {
  const activity = getActivity(activityId)
  const role = getRole(activity.roleId)
  const activeRoleId = getActiveRoleId()
  const isDone = getScheduleByActivity(activityId).status === 'done'
  return (
    <>
      <h1 className={styles.tempTitle}>{activity.name}</h1>
      <p className={styles.tempNotice}>
        {role.label} · 임시 활동 화면입니다. 담당 화면이 연결되면 교체됩니다.
      </p>
      <p className={styles.tempNotice}>
        현재 역할 · {activeRoleId ? getRole(activeRoleId).label : '없음'}
      </p>
      {isDone ? (
        <p className={styles.tempNotice}>이 활동은 완료됐어요.</p>
      ) : (
        <button type="button" className={styles.tempPrimary} onClick={onFinish}>
          활동 마치기 (임시)
        </button>
      )}
    </>
  )
}

