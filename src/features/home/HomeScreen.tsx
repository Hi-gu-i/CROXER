import { useEffect, useState } from 'react'
import { AiAlertCapsule, Tag } from '../../components'
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
import { IconDocument, IconMore, IconNoti, IconVerti } from '../../icons'
import { ResImgCamera, ResImgCard, ResImgFile } from '../../res-img'
import styles from './home-screen.module.css'

interface HomeScreenProps {
  onOpenActivity: (activityId: ActivityId) => void
  onOpenSchedule: () => void
}

const roleTone: Record<RoleId, TagTone> = {
  'role-leader': 'yellow',
  'role-editor': 'violet',
  'role-runner': 'mint',
}

type HomeTab = 'waiting' | 'running'

export default function HomeScreen({ onOpenActivity, onOpenSchedule }: HomeScreenProps) {
  useUtSession()
  const activityId = getNextActivityId()
  const [aiExpanded, setAiExpanded] = useState(false)
  const [homeTab, setHomeTab] = useState<HomeTab>('waiting')

  useEffect(() => {
    if (activityId) markActivityShown(activityId)
  }, [activityId])

  const items = getBriefingItems()
  const waiting = items.filter((item) => item.schedule.status === 'waiting')
  const running = items.filter((item) => item.schedule.status === 'in_progress')
  const listed = (homeTab === 'waiting' ? waiting : running).filter(
    (item) => item.activity.id !== activityId,
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <AiAlertCapsule
          expanded={aiExpanded}
          onExpandedChange={(next) => {
            if (aiExpanded && !next) {
              onOpenSchedule()
              return
            }
            setAiExpanded(next)
          }}
        />
        {/* 알림 버튼은 시안 모양만 둔다. 알림 목록은 첫 UT 범위 밖 */}
        <span className={styles.noti} aria-hidden="true">
          <IconNoti size={24} />
        </span>
      </header>

      {activityId ? (
        <FeaturedActivity activityId={activityId} onOpen={() => onOpenActivity(activityId)} />
      ) : (
        <div className={styles.finished}>
          <p className={styles.finishedText}>오늘 정한 활동을 모두 마쳤어요</p>
          <button type="button" className={styles.scheduleButton} onClick={onOpenSchedule}>
            스케줄 보기
          </button>
        </div>
      )}

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

function FeaturedActivity({ activityId, onOpen }: { activityId: ActivityId; onOpen: () => void }) {
  const activity = getActivity(activityId)
  const role = getRole(activity.roleId)
  const schedule = getScheduleByActivity(activityId)
  const resources = getResources(activityId).slice(0, 3)
  const resourceTotal = getResources(activityId).length

  return (
    <button type="button" className={styles.card} onClick={onOpen}>
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
