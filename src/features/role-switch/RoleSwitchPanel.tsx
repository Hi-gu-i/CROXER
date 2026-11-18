import { useEffect, useRef, useState } from 'react'
import { RoleTransitionPanel, type ToggleCategoryTone } from '../../components'
import type { ActivityId, RoleId } from '../../data/types'
import { getActivity, getCurrentActivityId, getRole } from '../../data/utStore'
import styles from './role-switch-panel.module.css'

interface RoleSwitchPanelProps {
  nextActivityId: ActivityId
  onSwitch: () => void
  onKeep: () => void
}

const ROLE_TONE: Record<RoleId, ToggleCategoryTone> = {
  'role-leader': 'yellow',
  'role-editor': 'violet',
  'role-runner': 'mint',
}

const COUNTDOWN_SEC = 3

/**
 * 앱 연결용 전환 패널.
 * UI는 ④ `RoleTransitionPanel`을 쓰고, onSwitch/onKeep 연결만 여기서 맡는다.
 */
export default function RoleSwitchPanel({
  nextActivityId,
  onSwitch,
  onKeep,
}: RoleSwitchPanelProps) {
  const currentId = getCurrentActivityId()
  const current = currentId ? getActivity(currentId) : null
  const next = getActivity(nextActivityId)
  const role = getRole(next.roleId)
  const [count, setCount] = useState(COUNTDOWN_SEC)
  const switchedRef = useRef(false)

  useEffect(() => {
    if (count > 0) {
      const timer = window.setTimeout(() => setCount((value) => value - 1), 1000)
      return () => window.clearTimeout(timer)
    }

    if (!switchedRef.current) {
      switchedRef.current = true
      onSwitch()
    }
  }, [count, onSwitch])

  return (
    <div className={styles.scrim}>
      <RoleTransitionPanel
        phase="before"
        roleLabel={role.name}
        roleTone={ROLE_TONE[next.roleId]}
        count={String(Math.max(count, 0))}
        fromActivity={current?.name ?? '현재 활동'}
        toActivity={next.name}
        onKeep={onKeep}
      />
    </div>
  )
}
