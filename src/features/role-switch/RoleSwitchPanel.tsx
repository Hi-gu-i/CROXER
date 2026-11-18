import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ToggleCategory } from '../../components'
import type { ToggleCategoryTone } from '../../components/ToggleCategory'
import type { ActivityId, RoleId } from '../../data/types'
import { getActivity, getCurrentActivityId, getRole } from '../../data/utStore'
import styles from './role-switch-panel.module.css'

interface RoleSwitchPanelProps {
  nextActivityId: ActivityId
  /** 초가 다 지나면 다음 활동으로 넘긴다 */
  onSwitch: () => void
  /** 유지하기. 넘어가지 않고 지금 활동 화면에 남긴다 */
  onKeep: () => void
}

const toneByRole: Record<RoleId, ToggleCategoryTone> = {
  'role-leader': 'yellow',
  'role-editor': 'violet',
  'role-runner': 'mint',
}

/** 역할 막대에서 맞춘 명도. 토큰에 없는 색이라 이 전환에만 적는다. */
const colorByRole: Record<RoleId, string> = {
  'role-leader': '#d1bb72',
  'role-editor': '#a899c0',
  'role-runner': '#83b1af',
}

const countdownStart = 5
const shimmerMs = 1100

/**
 * 활동을 마친 뒤 위에서 내려오는 전환.
 * 5초 동안 역할 색이 파랑으로 번지고, 그대로 두면 쉬머를 지나 다음 화면으로 넘어간다.
 */
export default function RoleSwitchPanel({ nextActivityId, onSwitch, onKeep }: RoleSwitchPanelProps) {
  const onSwitchRef = useRef(onSwitch)
  const [left, setLeft] = useState(countdownStart)
  const [phase, setPhase] = useState<'count' | 'shimmer'>('count')
  const current = getActivity(getCurrentActivityId() ?? nextActivityId)
  const role = getRole(current.roleId)
  const mix = phase === 'shimmer' ? 1 : (countdownStart - left) / (countdownStart - 1)

  useEffect(() => {
    onSwitchRef.current = onSwitch
  }, [onSwitch])

  useEffect(() => {
    if (phase !== 'count') return
    const timer = window.setInterval(() => {
      setLeft((currentLeft) => {
        if (currentLeft <= 1) {
          window.clearInterval(timer)
          setPhase('shimmer')
          return 0
        }
        return currentLeft - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'shimmer') return
    const timer = window.setTimeout(() => onSwitchRef.current(), shimmerMs)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (phase === 'shimmer') {
    return (
      <div className={styles.shimmer} role="status" aria-live="polite" aria-label="다음 화면으로 넘어가는 중">
        <span className={styles.lineWide} />
        <span className={styles.lineMid} />
        <span className={styles.lineShort} />
        <span className={styles.block} />
        <span className={styles.row}>
          <span className={styles.circle} />
          <span className={styles.stack}>
            <span className={styles.lineMid} />
            <span className={styles.lineShort} />
          </span>
        </span>
        <span className={styles.block} />
        <span className={styles.pill} />
      </div>
    )
  }

  return (
    <div className={styles.scrim}>
      <section
        className={styles.sheet}
        style={{ '--handoff-from': colorByRole[current.roleId], '--handoff-mix': String(mix) } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-switch-title"
      >
        <div className={styles.header}>
          <ToggleCategory tone={toneByRole[role.id]}>{role.label}</ToggleCategory>
        </div>
        <p className={styles.count} aria-live="polite">
          <span className={styles.countNumber}>{left}</span>
          <span className={styles.countSuffix}>초 후에 자동으로 전환됩니다</span>
        </p>
        <p className={styles.caption}>현재 활동</p>
        <h2 id="role-switch-title" className={styles.task}>
          {current.name}
        </h2>
        <button type="button" className={styles.keep} onClick={onKeep}>
          유지하기
        </button>
      </section>
    </div>
  )
}
