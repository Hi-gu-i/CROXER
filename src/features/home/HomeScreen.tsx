import { useEffect } from 'react'
import type { ActivityId } from '../../data/types'
import { useUtSession } from '../../data/useUtSession'
import {
  getActivity,
  getNextActivityId,
  getRole,
  getScheduleByActivity,
  markActivityShown,
} from '../../data/utStore'
import styles from './home-screen.module.css'

interface HomeScreenProps {
  onOpenActivity: (activityId: ActivityId) => void
  onOpenSchedule: () => void
}

export default function HomeScreen({ onOpenActivity, onOpenSchedule }: HomeScreenProps) {
  useUtSession()
  const activityId = getNextActivityId()

  useEffect(() => {
    if (activityId) markActivityShown(activityId)
  }, [activityId])

  if (!activityId) {
    return (
      <>
        <h1 className={styles.title}>홈</h1>
        <div className={styles.finished}>
          <p className={styles.finishedText}>오늘 정한 활동을 모두 마쳤어요</p>
          <button type="button" className={styles.scheduleButton} onClick={onOpenSchedule}>
            스케줄 보기
          </button>
        </div>
      </>
    )
  }

  const activity = getActivity(activityId)
  const role = getRole(activity.roleId)
  const startTime = getScheduleByActivity(activityId).startsAt.slice(11, 16)

  return (
    <>
      <h1 className={styles.title}>홈</h1>
      <button type="button" className={styles.card} onClick={() => onOpenActivity(activityId)}>
        <span className={styles.eyebrow}>먼저 할 활동</span>
        <span className={styles.roleTag}>{role.label}</span>
        <span className={styles.activityName}>{activity.name}</span>
        <span className={styles.meta}>오늘 {startTime}</span>
      </button>
    </>
  )
}
