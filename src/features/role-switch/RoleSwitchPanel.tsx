import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { RoleTransitionPanel } from '../../components'
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

const countdownStart = 5

/** 아치 위 점. 패널 좌표. 5초에서 왼쪽, 1초에서 오른쪽. */
const arcPoints: Array<[number, number]> = [
  [33, 321],
  [69, 299],
  [109, 282],
  [152, 272],
  [197, 268],
  [241, 272],
  [284, 282],
  [324, 299],
  [360, 321],
]

function arcCell(mix: number) {
  const scaled = Math.min(1, Math.max(0, mix)) * (arcPoints.length - 1)
  const index = Math.floor(scaled)
  const next = Math.min(arcPoints.length - 1, index + 1)
  const t = scaled - index
  const [x0, y0] = arcPoints[index]
  const [x1, y1] = arcPoints[next]
  return {
    cellX: x0 + (x1 - x0) * t,
    cellY: y0 + (y1 - y0) * t,
  }
}

/**
 * 활동 전환 패널은 그대로 두고, 뒤 배경만 쉬머로 바뀐다.
 * 5초를 그대로 두면 다음 활동으로 넘어가고, 유지하기는 지금 화면에 남긴다.
 */
export default function RoleSwitchPanel({ nextActivityId, onSwitch, onKeep }: RoleSwitchPanelProps) {
  const onSwitchRef = useRef(onSwitch)
  const [left, setLeft] = useState(countdownStart)
  const [holding, setHolding] = useState(false)
  const current = getActivity(getCurrentActivityId() ?? nextActivityId)
  const next = getActivity(nextActivityId)
  const role = getRole(current.roleId)
  const backMix = (countdownStart - left) / (countdownStart - 1)
  const { cellX, cellY } = arcCell(backMix)

  useEffect(() => {
    onSwitchRef.current = onSwitch
  }, [onSwitch])

  useEffect(() => {
    if (holding) {
      const timer = window.setTimeout(() => onSwitchRef.current(), 900)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setInterval(() => {
      setLeft((currentLeft) => {
        if (currentLeft <= 1) {
          window.clearInterval(timer)
          setHolding(true)
          return 1
        }
        return currentLeft - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [holding])

  return (
    <div className={styles.stage}>
      <div
        className={styles.shimmer}
        style={{ '--back-mix': String(backMix) } as CSSProperties}
        aria-hidden="true"
      >
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
      <div className={styles.veil} />
      <RoleTransitionPanel
        phase="before"
        roleLabel={role.label}
        roleTone={toneByRole[role.id]}
        count={left}
        fromActivity={current.name}
        toActivity={next.name}
        cellX={cellX}
        cellY={cellY}
        onKeep={onKeep}
      />
    </div>
  )
}
