// 오늘의 브리핑(F-03). 화면 배치는 Figma `MYA_Interaction` › `01 · 브리핑 final`을 따른다
// - 01~03(리서치·촬영·러닝)만 핸들로 순서를 바꾼다. 04·05는 핸들 없이 뒤에 고정(시안과 달리 PRD 기준)
// - 놓는 순간 순서를 저장한다(새로고침해도 유지). 번호와 시각은 자리에 고정되고, 그 자리에 온 활동이 자리의 시각을 갖는다
// - 확정하면 첫 활동으로 진입하고 onConfirm으로 그 활동 ID를 알린다(화면 이동은 통합 담당이 연결)
import { useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import type { ActivityId, ReorderableScheduleId, ScheduleView } from '../../data/types'
import {
  confirmBriefing,
  getBriefingItems,
  isBriefingConfirmed,
  saveBriefingOrder,
} from '../../data/utStore'
import { useUtSession } from '../../data/useUtSession'
import styles from './briefing-page.module.css'

interface BriefingPageProps {
  /** 확정 후 첫 활동 화면으로 이동할 때 부른다 */
  onConfirm?: (activityId: ActivityId) => void
}

interface DragState {
  scheduleId: ReorderableScheduleId
  fromIndex: number
  startY: number
  offsetY: number
  /** 카드 하나가 차지하는 높이(카드 + 사이 간격) */
  slotHeight: number
}

export default function BriefingPage({ onConfirm }: BriefingPageProps) {
  useUtSession()
  const items = getBriefingItems()
  const isConfirmed = isBriefingConfirmed()
  const reorderable = items.filter((item) => item.activity.isReorderable)
  const fixed = items.filter((item) => !item.activity.isReorderable)

  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const [drag, setDrag] = useState<DragState | null>(null)

  const reorderableIds = reorderable.map((item) => item.schedule.id as ReorderableScheduleId)
  const lastIndex = reorderableIds.length - 1

  const targetIndex = drag
    ? clamp(drag.fromIndex + Math.round(drag.offsetY / drag.slotHeight), 0, lastIndex)
    : -1

  function moveItem(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    const next = [...reorderableIds]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    saveBriefingOrder(next)
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (isConfirmed) return
    const first = itemRefs.current[0]
    const second = itemRefs.current[1]
    if (!first || !second) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({
      scheduleId: reorderableIds[index],
      fromIndex: index,
      startY: event.clientY,
      offsetY: 0,
      slotHeight: second.getBoundingClientRect().top - first.getBoundingClientRect().top,
    })
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag) return
    // 01~03 범위 밖(04·05 자리)으로는 끌 수 없다
    const minOffset = -drag.fromIndex * drag.slotHeight
    const maxOffset = (lastIndex - drag.fromIndex) * drag.slotHeight
    const offsetY = clamp(event.clientY - drag.startY, minOffset, maxOffset)
    setDrag({ ...drag, offsetY })
  }

  function handlePointerEnd() {
    if (!drag) return
    moveItem(drag.fromIndex, targetIndex)
    setDrag(null)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (isConfirmed) return
    if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault()
      moveItem(index, index - 1)
    }
    if (event.key === 'ArrowDown' && index < lastIndex) {
      event.preventDefault()
      moveItem(index, index + 1)
    }
  }

  function itemShift(index: number) {
    if (!drag) return 0
    if (index === drag.fromIndex) return drag.offsetY
    if (drag.fromIndex < index && index <= targetIndex) return -drag.slotHeight
    if (targetIndex <= index && index < drag.fromIndex) return drag.slotHeight
    return 0
  }

  function handleConfirm() {
    const firstActivityId = confirmBriefing()
    onConfirm?.(firstActivityId)
  }

  return (
    <section className={styles.briefingPage} aria-labelledby="briefing-title">
      <header className={styles.header}>
        <h1 id="briefing-title" className={styles.title}>
          오늘의 브리핑
        </h1>
        <p className={styles.description}>
          {isConfirmed ? '확정한 순서대로 활동을 진행하고 있어요.' : '박스를 움직여 하루 스케줄을 조정하세요.'}
        </p>
      </header>

      <ol className={`${styles.list} ${drag ? styles.isDragging : ''}`}>
        {reorderable.map((item, index) => (
          <li
            key={item.schedule.id}
            ref={(element) => {
              itemRefs.current[index] = element
            }}
            className={`${styles.item} ${drag?.fromIndex === index ? styles.isActive : ''}`}
          >
            {/* 번호·시각·세로선은 자리에 고정하고 카드만 움직인다 */}
            <BriefingRow
              item={item}
              isFirst={index === 0}
              isLast={false}
              cardShift={itemShift(index)}
            >
              {!isConfirmed && (
                <button
                  type="button"
                  className={styles.handle}
                  aria-label={`${item.activity.name} 순서 옮기기. 위아래 화살표 키로도 옮길 수 있어요`}
                  onPointerDown={(event) => handlePointerDown(event, index)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <HandleIcon />
                </button>
              )}
            </BriefingRow>
          </li>
        ))}
        {fixed.map((item, index) => (
          <li key={item.schedule.id} className={styles.item}>
            <BriefingRow item={item} isFirst={false} isLast={index === fixed.length - 1} cardShift={0}>
              <span className={styles.visuallyHidden}>순서 고정</span>
            </BriefingRow>
          </li>
        ))}
      </ol>

      {!isConfirmed && (
        <div className={styles.footer}>
          <button type="button" className={styles.confirmButton} onClick={handleConfirm}>
            이 순서로 시작하기
          </button>
        </div>
      )}
    </section>
  )
}

interface BriefingRowProps {
  item: ScheduleView
  isFirst: boolean
  isLast: boolean
  /** 끄는 동안 카드만 위아래로 옮길 거리(px) */
  cardShift: number
  children: ReactNode
}

/**
 * 한 자리 = 왼쪽 타임라인(번호·세로선) + 시각 + 일정 카드.
 * 시각은 자리의 시각이라(데이터의 startsAt) 번호와 같은 줄에 고정되고, 카드만 끌어서 옮긴다
 */
function BriefingRow({ item, isFirst, isLast, cardShift, children }: BriefingRowProps) {
  const railClass = [styles.rail, isFirst ? styles.railFirst : '', isLast ? styles.railLast : '']
    .filter(Boolean)
    .join(' ')
  return (
    <>
      <div className={railClass} aria-hidden="true">
        <span className={styles.railHead}>
          <span className={styles.badge}>{item.position}</span>
        </span>
      </div>
      <p className={styles.time}>{formatTime(item.schedule.startsAt)}</p>
      <div className={styles.cardSlot} style={{ transform: `translateY(${cardShift}px)` }}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            {/* 역할별 색 태그는 공통 Tag 부품(민선, PR #19)이 합쳐지면 교체한다 */}
            <span className={styles.roleTag}>{item.role.label}</span>
            <div className={styles.cardText}>
              <p className={styles.activityName}>{item.activity.name}</p>
              <p className={styles.summary}>{item.activity.summary}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}

function HandleIcon() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
      <path d="M1 1h14M1 5h14M1 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

const seoul = { timeZone: 'Asia/Seoul' } as const

function formatTime(startsAt: string) {
  return new Intl.DateTimeFormat('ko-KR', { ...seoul, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(
    new Date(startsAt),
  )
}
