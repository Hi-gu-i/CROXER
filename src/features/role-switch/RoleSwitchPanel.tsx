import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { RoleTransitionPanel } from '../../components'
import type { ToggleCategoryTone } from '../../components/ToggleCategory'
import type { ActivityId, RoleId } from '../../data/types'
import { getActivity, getCurrentActivityId, getRole } from '../../data/utStore'
import styles from './role-switch-panel.module.css'

interface RoleSwitchPanelProps {
  nextActivityId: ActivityId
  /** 초가 다 지나고 잠시 더 머문 뒤 다음 활동으로 넘긴다 */
  onSwitch: () => void
  /** 유지하기. 역할은 그대로 두고 방금 끝낸 활동 화면에 남긴다 */
  onKeep: () => void
  /** 현재 칸 문구. 없으면 지금 활동 이름을 쓴다 */
  fromActivityName?: string
  /** 다음 칸 문구. 없으면 다음 활동 이름을 쓴다 */
  toActivityName?: string
}

const toneByRole: Record<RoleId, ToggleCategoryTone> = {
  'role-leader': 'yellow',
  'role-editor': 'violet',
  'role-runner': 'mint',
}

/** 패널 칸에만 쓰는 짧은 이름. 홈·브리핑·스케줄의 원래 이름은 바꾸지 않는다. */
const panelNameByActivity: Partial<Record<ActivityId, string>> = {
  'activity-research': '리서치 검토',
  'activity-shoot': '강변 촬영',
  'activity-run': '한강 러닝',
}

function panelActivityName(activityId: ActivityId, fullName: string) {
  return panelNameByActivity[activityId] ?? fullName
}

/** 왼쪽은 지금 역할, 오른쪽은 다음 역할. 전환 워시는 semantic soft */
const tintByRole: Record<RoleId, string> = {
  'role-leader': 'var(--color-role-leader-soft)',
  'role-editor': 'var(--color-role-editor-soft)',
  'role-runner': 'var(--color-role-runner-soft)',
}

const countdownStart = 5
/** 1이 보인 뒤 패널을 조금 더 두고 다음 화면으로 넘어간다 */
const holdAfterCountMs = 2000
/** 보이는 아치의 왼쪽 끝에서 오른쪽 끝까지. 5초 카운트와 같은 시간 */
const cellFrom = 0.34
const cellTo = 0.68
const cellTravelMs = 5000

/**
 * 활동 전환 패널이 내려오고 5초를 센다.
 * 뒤는 활동 화면을 가린 빈 딤만 보이고, 아치 선은 민선 부품 그대로 보인다.
 * 유지하기는 방금 끝낸 활동에 남기고, 그대로 두면 잠시 더 있다가 다음 활동으로 넘어간다.
 */
export default function RoleSwitchPanel({
  nextActivityId,
  onSwitch,
  onKeep,
  fromActivityName,
  toActivityName,
}: RoleSwitchPanelProps) {
  const onSwitchRef = useRef(onSwitch)
  const stageRef = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState(countdownStart)
  const [holding, setHolding] = useState(false)
  const current = getActivity(getCurrentActivityId() ?? nextActivityId)
  const next = getActivity(nextActivityId)
  const role = getRole(current.roleId)
  const nextRole = getRole(next.roleId)
  const sameRole = role.id === nextRole.id
  const washRole = sameRole ? role : nextRole

  useEffect(() => {
    onSwitchRef.current = onSwitch
  }, [onSwitch])

  // 선이 화면 너비에 맞춰 줄어들므로, 고정 좌표 대신 지금 그려진 아치 위에 점을 둔다.
  useLayoutEffect(() => {
    const root = stageRef.current
    const svg = [...(root?.querySelectorAll('section svg') ?? [])].find(
      (item): item is SVGSVGElement => item instanceof SVGSVGElement && item.viewBox.baseVal.width > 100,
    )
    const path = svg?.querySelector('path')
    const track = svg?.parentElement
    const cell = track?.querySelector(':scope > span')
    if (!(path instanceof SVGPathElement) || !(svg instanceof SVGSVGElement) || !(track instanceof HTMLElement) || !(cell instanceof HTMLElement)) {
      return
    }

    const place = (ratio: number) => {
      const matrix = path.getScreenCTM()
      if (!matrix) return
      const point = path.getPointAtLength(path.getTotalLength() * ratio).matrixTransform(matrix)
      const trackBox = track.getBoundingClientRect()
      const size = cell.offsetWidth
      cell.style.left = `${point.x - trackBox.left - size / 2}px`
      cell.style.top = `${point.y - trackBox.top - size / 2}px`
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      place(cellTo)
      return
    }

    const motion = { frame: 0 }
    const started = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / cellTravelMs)
      place(cellFrom + (cellTo - cellFrom) * progress)
      if (progress < 1) motion.frame = window.requestAnimationFrame(tick)
    }
    place(cellFrom)
    motion.frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(motion.frame)
  }, [])

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
    <div ref={stageRef} className={sameRole ? `${styles.stage} ${styles.flatWash}` : styles.stage}>
      <RoleTransitionPanel
        phase="before"
        roleLabel={role.label}
        roleTone={toneByRole[role.id]}
        count={left}
        fromActivity={fromActivityName ?? panelActivityName(current.id, current.name)}
        toActivity={toActivityName ?? panelActivityName(next.id, next.name)}
        showTrack
        onKeep={onKeep}
        style={
          {
            '--handoff-from': tintByRole[role.id],
            '--handoff-to': tintByRole[sameRole ? role.id : washRole.id],
          } as CSSProperties
        }
      />
    </div>
  )
}
