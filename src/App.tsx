import { useEffect, useState, type ComponentType, type MouseEvent, type ReactNode } from 'react'
import styles from './app.module.css'
import { IconHome, IconReport, IconSchedule, IconSet } from './icons'
import type { ActivityId } from './data/types'
import { useUtSession } from './data/useUtSession'
import {
  completeActivity,
  enterActivity,
  getActiveRoleId,
  getActivity,
  getCurrentActivityId,
  getRole,
  getScheduleByActivity,
  isBriefingConfirmed,
  UT_STORAGE_KEY,
} from './data/utStore'
import BriefingPage from './features/briefing/BriefingPage'
import { FacilitatorPanel } from './features/facilitator'
import HomeScreen from './features/home/HomeScreen'
import RoleStaySheet from './features/role-switch/RoleStaySheet'
import RoleSwitchPanel from './features/role-switch/RoleSwitchPanel'
import { ReportPage } from './features/report'
import SchedulePage from './features/schedule/SchedulePage'
import { NotificationSettingsPage } from './features/setup'
import { ResearchActivityPage } from './features/research'
import { RunActivityPage } from './features/run'
import { ShootActivityPage } from './features/shoot'

type TabId = 'home' | 'schedule' | 'report' | 'settings'

type Screen =
  | { name: TabId }
  | {
      name: 'activity'
      activityId: ActivityId
      /** 진입 직후 바로 열 자료(예: AI 작업 결과) */
      openResourceId?: string
    }

type OpenActivityOptions = {
  openResourceId?: string
}

interface ActivityScreenProps {
  activityId: ActivityId
  /** 활동의 UT 흐름을 마쳤을 때 한 번 부른다. 완료 처리와 다음 활동 안내는 App이 맡는다 */
  onFinish: () => void
  /** Header 홈. 넘기지 않으면 활동 화면이 홈 동작을 생략할 수 있다 */
  onHome?: () => void
  /** 다른 활동으로 바로 이동(예: 러닝 → 촬영 자료 확인) */
  onOpenActivity?: (activityId: ActivityId, options?: OpenActivityOptions) => void
  /** 진입 시 바로 열 자료 ID */
  initialResourceId?: string
}

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
  const [roleSheetOpen, setRoleSheetOpen] = useState(false)
  const [enteredAtByActivity, setEnteredAtByActivity] = useState<Partial<Record<ActivityId, number>>>({})

  function rememberActivityEntry(nextActivityId: ActivityId) {
    setEnteredAtByActivity((current) =>
      current[nextActivityId] != null ? current : { ...current, [nextActivityId]: Date.now() },
    )
  }

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== UT_STORAGE_KEY || !event.newValue) return
      let next: { isBriefingConfirmed?: boolean; currentActivityId?: ActivityId | null }
      let prev: { isBriefingConfirmed?: boolean; currentActivityId?: ActivityId | null }
      try {
        next = JSON.parse(event.newValue)
        prev = event.oldValue ? JSON.parse(event.oldValue) : {}
      } catch {
        return
      }
      const briefingChanged = Boolean(next.isBriefingConfirmed) !== Boolean(prev.isBriefingConfirmed)
      const activityChanged = (next.currentActivityId ?? null) !== (prev.currentActivityId ?? null)
      if (!briefingChanged && !activityChanged) return
      setSwitchTargetId(null)
      setRoleSheetOpen(false)
      setEnteredAtByActivity({})
      if (!next.isBriefingConfirmed || briefingChanged) {
        setScreen({ name: 'home' })
        return
      }
      if (next.currentActivityId) rememberActivityEntry(next.currentActivityId)
      setScreen(
        next.currentActivityId ? { name: 'activity', activityId: next.currentActivityId } : { name: 'schedule' },
      )
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const activityId = screen.name === 'activity' ? screen.activityId : null

  function handleFacilitatorActivity(nextActivityId: ActivityId | null) {
    setSwitchTargetId(null)
    setRoleSheetOpen(false)
    if (nextActivityId) rememberActivityEntry(nextActivityId)
    setScreen(nextActivityId ? { name: 'activity', activityId: nextActivityId } : { name: 'schedule' })
  }

  function handleFacilitatorReset() {
    setSwitchTargetId(null)
    setRoleSheetOpen(false)
    setEnteredAtByActivity({})
    setScreen({ name: 'home' })
  }

  if (!isBriefingConfirmed()) {
    return (
      <Frame>
        <BriefingPage
          onConfirm={() => {
            setSwitchTargetId(null)
            setRoleSheetOpen(false)
            setScreen({ name: 'home' })
          }}
        />
        <FacilitatorPanel onActivityChange={handleFacilitatorActivity} onReset={handleFacilitatorReset} />
      </Frame>
    )
  }

  function openActivity(activityId: ActivityId, options?: OpenActivityOptions) {
    // 브리핑 확정(confirmBriefing)이 첫 활동 진입을 이미 처리했으므로 같은 활동이면 다시 시작하지 않는다.
    if (getCurrentActivityId() !== activityId) enterActivity(activityId)
    setRoleSheetOpen(false)
    rememberActivityEntry(activityId)
    setScreen({
      name: 'activity',
      activityId,
      openResourceId: options?.openResourceId,
    })
  }

  function finishActivity(activityId: ActivityId) {
    if (getScheduleByActivity(activityId).status === 'done') return
    const nextActivityId = completeActivity(activityId)
    setRoleSheetOpen(false)
    if (nextActivityId) {
      setSwitchTargetId(nextActivityId)
    } else {
      setScreen({ name: 'schedule' })
    }
  }

  function switchToNextActivity() {
    if (!switchTargetId) return
    enterActivity(switchTargetId)
    setRoleSheetOpen(false)
    rememberActivityEntry(switchTargetId)
    setScreen({ name: 'activity', activityId: switchTargetId })
    setSwitchTargetId(null)
  }

  function closeRoleSheet() {
    setRoleSheetOpen(false)
  }

  function handleActivityClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (screen.name !== 'activity') return
    const roleLabel = getRole(getActivity(screen.activityId).roleId).label
    const button = (event.target as HTMLElement).closest('button')
    if (!button?.querySelector('svg')) return
    if (button.textContent?.replace(/\s+/g, ' ').trim() !== roleLabel) return
    event.preventDefault()
    event.stopPropagation()
    setRoleSheetOpen(true)
  }

  const enteredAt = activityId ? enteredAtByActivity[activityId] : undefined

  const showTabBar = screen.name !== 'activity'
  const activeTab: TabId = screen.name === 'activity' ? 'home' : screen.name
  const ActivityScreen =
    screen.name === 'activity' ? (activityScreens[screen.activityId] ?? TempActivityScreen) : null

  // Status·Header가 셸 최상단에 붙는 활동은 패딩 없는 screenActivity.
  // 그 외 활동은 기존 screen 패딩을 유지한다.
  const flushActivity =
    screen.name === 'activity' &&
    (screen.activityId === 'activity-shoot' || screen.activityId === 'activity-run')
  const screenClass = flushActivity
    ? styles.screenActivity
    : showTabBar
      ? `${styles.screen} ${styles.screenWithTabBar}`
      : styles.screen

  return (
    <Frame>
      <main className={screenClass}>
        {screen.name === 'home' && (
          <HomeScreen
            onOpenActivity={openActivity}
            onOpenSchedule={() => setScreen({ name: 'schedule' })}
          />
        )}
        {screen.name === 'activity' && ActivityScreen && (
          <div className={styles.activityScreen} onClickCapture={handleActivityClickCapture}>
            <ActivityScreen
              key={`${screen.activityId}:${screen.openResourceId ?? 'default'}`}
              activityId={screen.activityId}
              onFinish={() => finishActivity(screen.activityId)}
              onHome={() => setScreen({ name: 'home' })}
              onOpenActivity={openActivity}
              initialResourceId={screen.openResourceId}
            />
          </div>
        )}
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
      {roleSheetOpen && activityId && enteredAt != null && (
        <RoleStaySheet
          activityId={activityId}
          enteredAt={enteredAt}
          onKeep={closeRoleSheet}
          onDismiss={closeRoleSheet}
        />
      )}
      {switchTargetId && (
        <RoleSwitchPanel
          nextActivityId={switchTargetId}
          onSwitch={switchToNextActivity}
          onKeep={() => {
            setSwitchTargetId(null)
            setScreen({ name: 'home' })
          }}
        />
      )}
      <FacilitatorPanel onActivityChange={handleFacilitatorActivity} onReset={handleFacilitatorReset} />
    </Frame>
  )
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
