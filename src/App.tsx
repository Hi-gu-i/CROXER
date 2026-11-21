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
  getNextActivityId,
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

type Screen = { name: TabId } | { name: 'activity'; activityId: ActivityId }

interface ActivityScreenProps {
  activityId: ActivityId
  /** 활동의 UT 흐름을 마쳤을 때 한 번 부른다. 완료 처리와 다음 활동 안내는 App이 맡는다 */
  onFinish: () => void
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
      if (!next.isBriefingConfirmed || briefingChanged) {
        setScreen({ name: 'home' })
        return
      }
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
    setScreen(nextActivityId ? { name: 'activity', activityId: nextActivityId } : { name: 'schedule' })
  }

  function handleFacilitatorReset() {
    setSwitchTargetId(null)
    setRoleSheetOpen(false)
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

  function openActivity(activityId: ActivityId) {
    // 브리핑 확정(confirmBriefing)이 첫 활동 진입을 이미 처리했으므로 같은 활동이면 다시 시작하지 않는다.
    if (getCurrentActivityId() !== activityId) enterActivity(activityId)
    setRoleSheetOpen(false)
    setScreen({ name: 'activity', activityId })
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
    setScreen({ name: 'activity', activityId: switchTargetId })
    setSwitchTargetId(null)
  }

  function closeRoleSheet() {
    setRoleSheetOpen(false)
  }

  function switchRoleFromStay() {
    if (screen.name !== 'activity') return
    const nextActivityId = getNextActivityId(screen.activityId)
    setRoleSheetOpen(false)
    if (!nextActivityId) {
      setScreen({ name: 'schedule' })
      return
    }
    enterActivity(nextActivityId)
    setScreen({ name: 'activity', activityId: nextActivityId })
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

  const activityDone =
    screen.name === 'activity' && getScheduleByActivity(screen.activityId).status === 'done'
  // 활동을 마친 뒤 유지하기는 그 화면에 남긴다. 하단 탭이 없으면 나갈 곳이 없다.
  const showTabBar = screen.name !== 'activity' || (activityDone && !switchTargetId)
  const activeTab: TabId | null = screen.name === 'activity' ? null : screen.name
  const ActivityScreen =
    screen.name === 'activity' ? (activityScreens[screen.activityId] ?? TempActivityScreen) : null

  return (
    <Frame>
      <main className={showTabBar ? `${styles.screen} ${styles.screenWithTabBar}` : styles.screen}>
        {screen.name === 'home' && (
          <HomeScreen
            onOpenActivity={openActivity}
            onOpenSchedule={() => setScreen({ name: 'schedule' })}
          />
        )}
        {screen.name === 'activity' && ActivityScreen && (
          <div className={styles.activityScreen} onClickCapture={handleActivityClickCapture}>
            <ActivityScreen
              key={screen.activityId}
              activityId={screen.activityId}
              onFinish={() => finishActivity(screen.activityId)}
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
      {roleSheetOpen && activityId && (
        <RoleStaySheet
          activityId={activityId}
          onKeep={closeRoleSheet}
          onDismiss={closeRoleSheet}
          onSwitch={switchRoleFromStay}
        />
      )}
      {switchTargetId && (
        <RoleSwitchPanel
          nextActivityId={switchTargetId}
          onSwitch={switchToNextActivity}
          onKeep={() => setSwitchTargetId(null)}
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

