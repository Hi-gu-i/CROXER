import { useEffect, useId, useState } from 'react'
import { ToggleCategory } from '../../components'
import type { ToggleCategoryTone } from '../../components/ToggleCategory'
import type { ActivityId, RoleId } from '../../data/types'
import { getActivity, getRole, getSchedules } from '../../data/utStore'
import { IconTime } from '../../icons'
import styles from './role-stay-sheet.module.css'

interface RoleStaySheetProps {
  activityId: ActivityId
  /** 이 활동 화면에 들어온 시각. 남은 시간은 여기서부터 줄어든다 */
  enteredAt: number
  /** 유지하기. 역할과 활동 화면은 바꾸지 않고 막대만 닫는다 */
  onKeep: () => void
  /** 딤 처리된 화면이나 역할 탭을 다시 눌렀을 때 */
  onDismiss: () => void
}

const toneByRole: Record<RoleId, ToggleCategoryTone> = {
  'role-leader': 'yellow',
  'role-editor': 'violet',
  'role-runner': 'mint',
}

const fallbackSlotMs = 60 * 60 * 1000

/** 브리핑 자리의 길이. 다음 자리 시각까지이고, 마지막 자리는 1시간으로 둔다 */
function slotDurationMs(activityId: ActivityId) {
  const schedules = getSchedules().slice().sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const index = schedules.findIndex((item) => item.activityId === activityId)
  const current = schedules[index]
  if (!current) return fallbackSlotMs
  const next = schedules[index + 1]
  const start = Date.parse(current.startsAt)
  const end = next ? Date.parse(next.startsAt) : start + fallbackSlotMs
  return Number.isFinite(end - start) && end > start ? end - start : fallbackSlotMs
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

/**
 * 활동 화면 상단 역할 탭을 열었을 때 위에서 내려오는 막대.
 * Figma Section 22 `러닝에서 학생` 기준. 역할 전환 패널과는 별개다.
 */
export default function RoleStaySheet({ activityId, enteredAt, onKeep, onDismiss }: RoleStaySheetProps) {
  const titleId = useId()
  const activity = getActivity(activityId)
  const role = getRole(activity.roleId)
  const tone = toneByRole[activity.roleId]
  const durationMs = slotDurationMs(activityId)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const remainingMs = Math.max(durationMs - Math.max(now - enteredAt, 0), 0)
  const remainingLabel = formatRemaining(remainingMs)

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

        <p className={styles.caption}>현재 활동</p>
        <h2 id={titleId} className={styles.task}>
          {activity.name}
        </h2>

        <div className={styles.arc} aria-hidden="true">
          <svg viewBox="0 0 360 56" focusable="false">
            <path d="M16 44 Q 150 8 344 28" strokeWidth="2" />
            <circle cx="16" cy="44" r="4" />
          </svg>
        </div>

        <button type="button" className={styles.keep} onClick={onKeep}>
          유지하기
        </button>
      </section>
    </div>
  )
}
