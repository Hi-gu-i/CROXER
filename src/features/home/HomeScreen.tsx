import { useEffect, useState } from 'react'
import { Tag } from '../../components'
import type { TagTone } from '../../components/Tag'
import type { ActivityId, RoleId } from '../../data/types'
import { useUtSession } from '../../data/useUtSession'
import {
  getActivity,
  getBriefingItems,
  getNextActivityId,
  getResources,
  getRole,
  getScheduleByActivity,
  markActivityShown,
} from '../../data/utStore'
import { IconAi, IconDocument, IconMore, IconNoti, IconVerti } from '../../icons'
import { ResImgCamera, ResImgCard, ResImgFile } from '../../res-img'
import styles from './home-screen.module.css'

interface HomeScreenProps {
  onOpenActivity: (activityId: ActivityId) => void
}

/** 진입 활동을 모두 마친 뒤 홈 카드에만 보여주는 고정 다음 활동. 화면은 없다. */
const lockedNextActivityId = 'activity-gpt-renewal' satisfies ActivityId

const roleTone: Record<RoleId, TagTone> = {
  'role-leader': 'yellow',
  'role-editor': 'violet',
  'role-runner': 'mint',
}

type HomeTab = 'waiting' | 'running'

export default function HomeScreen({ onOpenActivity }: HomeScreenProps) {
  useUtSession()
  const nextActivityId = getNextActivityId()
  const featuredId = nextActivityId ?? lockedNextActivityId
  const featuredLocked = nextActivityId === null
  const [expanded, setExpanded] = useState(false)
  const [homeTab, setHomeTab] = useState<HomeTab>('waiting')

  useEffect(() => {
    if (nextActivityId) markActivityShown(nextActivityId)
  }, [nextActivityId])

  const items = getBriefingItems().filter((item) => item.activity.id !== featuredId)
  const waiting = items.filter((item) => item.schedule.status === 'waiting')
  const running = items.filter((item) => item.schedule.status === 'in_progress')
  const listed = homeTab === 'waiting' ? waiting : running

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={expanded ? `${styles.aiButton} ${styles.aiButtonExpanded}` : styles.aiButton}
          aria-expanded={expanded}
          aria-label={expanded ? '오늘의 스케줄을 확인해 보세요' : 'AI 알림 펼치기'}
          onClick={() => setExpanded((open) => !open)}
        >
          <IconAi size={24} />
          {expanded ? <span className={styles.aiTitle}>오늘의 스케줄을 확인해 보세요</span> : null}
        </button>
        {/* 알림 버튼은 시안 모양만 둔다. 알림 목록은 첫 UT 범위 밖 */}
        <span className={styles.noti} aria-hidden="true">
          <IconNoti size={24} />
        </span>
      </header>

      <FeaturedActivity
        activityId={featuredId}
        locked={featuredLocked}
        onOpen={() => onOpenActivity(featuredId)}
      />

      <section className={styles.section} aria-label="다른 활동">
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={homeTab === 'waiting'}
            className={homeTab === 'waiting' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setHomeTab('waiting')}
          >
            대기 중
            <span className={styles.count}>{waiting.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={homeTab === 'running'}
            className={homeTab === 'running' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setHomeTab('running')}
          >
            실행 중
            <span className={homeTab === 'running' ? styles.count : styles.countMuted}>{running.length}</span>
          </button>
        </div>
        <ul className={styles.list}>
          {listed.length === 0 ? (
            <li className={styles.empty}>이 상태의 다른 활동이 없어요.</li>
          ) : (
            listed.map((item) => (
              <li key={item.activity.id}>
                <div className={styles.listCard}>
                  <span className={styles.listCaption}>
                    <Tag tone={roleTone[item.role.id]}>{item.role.label}</Tag>
                    <span className={styles.time}>{formatSlotTime(item.schedule.startsAt)}</span>
                    <IconMore size={24} className={styles.more} />
                  </span>
                  <span className={styles.listTitle}>{item.activity.name}</span>
                  <span className={styles.listSummary}>{item.activity.summary}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}

function FeaturedActivity({
  activityId,
  onOpen,
  locked = false,
}: {
  activityId: ActivityId
  onOpen: () => void
  locked?: boolean
}) {
  const activity = getActivity(activityId)
  const role = getRole(activity.roleId)
  const schedule = getScheduleByActivity(activityId)
  const resources = getResources(activityId).slice(0, 3)
  const resourceTotal = getResources(activityId).length

  const cardClass = locked ? `${styles.card} ${styles.cardLocked}` : styles.card
  const body = (
    <>
      <span className={styles.caption}>
        <Tag tone={roleTone[role.id]}>{role.label}</Tag>
        <IconVerti size={16} className={styles.divider} />
        <span className={styles.remain}>{formatSlotTime(schedule.startsAt)}</span>
      </span>
      <FeaturedIllustration activityId={activityId} />
      <span className={styles.activityName}>{activity.name}</span>
      <span className={styles.summary}>{activity.summary}</span>
      {resources.length > 0 && (
        <span className={styles.overview}>
          <span className={styles.overviewIcon}>
            <span className={styles.docBadge}>
              <IconDocument size={20} />
            </span>
            <span className={styles.docCount}>
              1/{resourceTotal}
            </span>
          </span>
          <span className={styles.overviewList}>
            {resources.map((resource, index) => (
              <span
                key={resource.id}
                className={index === 0 ? `${styles.resource} ${styles.resourceCurrent}` : styles.resource}
              >
                {resource.title}
              </span>
            ))}
          </span>
        </span>
      )}
    </>
  )

  if (locked) return <div className={cardClass}>{body}</div>
  return (
    <button type="button" className={cardClass} onClick={onOpen}>
      {body}
    </button>
  )
}

function FeaturedIllustration({ activityId }: { activityId: ActivityId }) {
  if (activityId === 'activity-shoot') return <ResImgCamera className={styles.illustration} />
  if (activityId === 'activity-research') return <ResImgFile className={styles.illustration} />
  return <ResImgCard className={styles.illustration} />
}

function formatSlotTime(startsAt: string) {
  return `오늘 ${startsAt.slice(11, 16)}`
}
