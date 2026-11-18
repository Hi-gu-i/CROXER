import { useEffect, useRef, useState } from 'react'
import { RoleTransitionPanel } from '../../components'
import type { ToggleCategoryTone } from '../../components/ToggleCategory'
import type { ActivityId, RoleId } from '../../data/types'
import { getActivity, getCurrentActivityId, getRole } from '../../data/utStore'
import styles from './role-switch-panel.module.css'

interface RoleSwitchPanelProps {
  nextActivityId: ActivityId
  /** 초가 다 지나고 잠시 더 머문 뒤 다음 활동으로 넘긴다 */
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
/** 1이 보인 뒤 패널을 조금 더 두고 다음 화면으로 넘어간다 */
const holdAfterCountMs = 2000

/**
 * 활동 전환 패널이 내려오고 5초를 센다.
 * 뒤는 활동 화면을 가린 투명 배경만 보이고, 선은 그리지 않는다.
 * 유지하기는 지금 화면에 남기고, 그대로 두면 잠시 더 있다가 다음 활동으로 넘어간다.
 */
export default function RoleSwitchPanel({ nextActivityId, onSwitch, onKeep }: RoleSwitchPanelProps) {
  const onSwitchRef = useRef(onSwitch)
  const [left, setLeft] = useState(countdownStart)
  const [holding, setHolding] = useState(false)
  const current = getActivity(getCurrentActivityId() ?? nextActivityId)
  const next = getActivity(nextActivityId)
  const role = getRole(current.roleId)

  useEffect(() => {
    onSwitchRef.current = onSwitch
  }, [onSwitch])

  useEffect(() => {
    if (holding) {
      const timer = window.setTimeout(() => onSwitchRef.current(), holdAfterCountMs)
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
      <RoleTransitionPanel
        phase="before"
        roleLabel={role.label}
        roleTone={toneByRole[role.id]}
        count={left}
        fromActivity={current.name}
        toActivity={next.name}
        onKeep={onKeep}
      />
    </div>
  )
}
