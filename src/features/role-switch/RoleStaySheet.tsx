import { useEffect, useId, useRef, useState } from 'react'
import { RoleTrack, ToggleCategory } from '../../components'
import type { ToggleCategoryTone } from '../../components/ToggleCategory'
import type { ActivityId, RoleId } from '../../data/types'
import { getActivity, getRole } from '../../data/utStore'
import { IconTime } from '../../icons'
import styles from './role-stay-sheet.module.css'

interface RoleStaySheetProps {
  activityId: ActivityId
  /** 유지하기. 역할과 활동 화면은 바꾸지 않고 막대만 닫는다 */
  onKeep: () => void
  /** 딤 처리된 화면이나 역할 탭을 다시 눌렀을 때 */
  onDismiss: () => void
  /** 남은 시간이 5초가 되었을 때. 역할을 다음 활동으로 넘긴다 */
  onSwitch: () => void
}

const toneByRole: Record<RoleId, ToggleCategoryTone> = {
  'role-leader': 'yellow',
  'role-editor': 'violet',
  'role-runner': 'mint',
}

/** 역할 막대에서 세는 남은 시간 */
const stayMs = 30 * 1000
/** 이 초가 남으면 역할을 넘긴다 */
const switchAtMs = 5 * 1000

function formatRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

/**
 * 활동 화면 상단 역할 탭을 열었을 때 위에서 내려오는 막대.
 * 남은 시간은 30초다. 5초가 남으면 역할을 넘긴다.
 * 아치 선은 전환 패널과 같은 RoleTrack이다.
 */
export default function RoleStaySheet({ activityId, onKeep, onDismiss, onSwitch }: RoleStaySheetProps) {
  const titleId = useId()
  const activity = getActivity(activityId)
  const role = getRole(activity.roleId)
  const tone = toneByRole[activity.roleId]
  const [openedAt] = useState(() => Date.now())
  const [now, setNow] = useState(openedAt)
  const switched = useRef(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const remainingMs = Math.max(stayMs - Math.max(now - openedAt, 0), 0)
  const remainingLabel = formatRemaining(remainingMs)

  useEffect(() => {
    if (switched.current || remainingMs > switchAtMs) return
    switched.current = true
    onSwitch()
  }, [onSwitch, remainingMs])

  return (
    <div className={styles.scrim} onClick={onDismiss}>
      <section
        className={`${styles.sheet} ${styles[tone]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <ToggleCategory
            tone={tone}
            className={styles.chip}
            aria-expanded="true"
            onClick={onDismiss}
          >
            {role.label}
          </ToggleCategory>
        </div>

        <p className={styles.time}>
          <IconTime size={16} aria-hidden="true" />
          <span aria-label={`남은 시간 ${remainingLabel}`}>{remainingLabel}</span>
        </p>

        <div className={styles.track}>
          <RoleTrack cellX={431} cellY={46} />
        </div>

        <p className={styles.caption}>현재 활동</p>
        <h2 id={titleId} className={styles.task}>
          {activity.name}
        </h2>

        <button type="button" className={styles.keep} onClick={onKeep}>
          유지하기
        </button>
      </section>
    </div>
  )
}
