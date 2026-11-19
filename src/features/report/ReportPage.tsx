import { useState } from 'react'
import { Card } from '../../components'
import type { ActivityId } from '../../data/types'
import { IconEdit, IconStart, IconTogether } from '../../icons'
import {
  getAiJob,
  getAnnouncement,
  getBriefingItems,
  getCourses,
  getSelectedCourseId,
  getToday,
  isAiJobRequested,
  isAlertFired,
} from '../../data/utStore'
import { useUtSession } from '../../data/useUtSession'
import { ReportFeedbackCard } from './ReportFeedbackCard'
import {
  lastWeekAverage,
  longestDone,
  progressDetail,
  roleIconKey,
  weekdayCompletion,
  weeklyPattern,
} from './reportData'
import styles from './report-page.module.css'

type Period = 'day' | 'week' | 'season'

const periods: { id: Period; label: string }[] = [
  { id: 'day', label: '일간' },
  { id: 'week', label: '주간' },
  { id: 'season', label: '시즌' },
]

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const RUN_ACTIVITY_ID: ActivityId = 'activity-run'
const RAIN_ALERT_ID = 'alert-shoot-rain'
const REFERENCE_JOB_ID = 'job-shoot-extra'

const roleIcon = {
  leader: IconEdit,
  editor: IconStart,
  runner: IconTogether,
}

function parseDay(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function shortDate(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

function clockLabel() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')} : ${String(now.getMinutes()).padStart(2, '0')}`
}

/**
 * 리포트(PRD F-11 리포트 부분). 첫 UT 범위 밖 화면.
 * Figma `11 · 스케줄·리포트` › Report final 3(일간)·4(주간) 기준.
 * 오늘 활동은 세션에서 읽고, 소요 시간·지난 패턴은 가상 데이터(`reportData.ts`)를 쓴다.
 */
export function ReportPage() {
  useUtSession()
  const [period, setPeriod] = useState<Period>('day')

  const today = parseDay(getToday())
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return date
  })

  const items = getBriefingItems()
  const doneCount = items.filter((item) => item.schedule.status === 'done').length
  const inProgressCount = items.filter((item) => item.schedule.status === 'in_progress').length
  const waitingCount = items.filter((item) => item.schedule.status === 'waiting').length
  const aiRunning = isAiJobRequested(REFERENCE_JOB_ID) && getAiJob(REFERENCE_JOB_ID).status !== 'completed' ? 1 : 0
  const todayRate = Math.round((doneCount / items.length) * 100)
  const remaining = [
    { id: 'in-progress', label: '진행 중', count: inProgressCount, tone: 'strong' },
    { id: 'waiting', label: '진행 전', count: waitingCount, tone: 'default' },
    { id: 'ai', label: 'AI 작업', count: aiRunning, tone: 'soft' },
  ] as const
  const remainingTotal = remaining.reduce((sum, item) => sum + item.count, 0)
  const longest = longestDone(items)

  const rainFired = isAlertFired(RAIN_ALERT_ID)
  const course = getCourses(RUN_ACTIVITY_ID).find((item) => item.id === getSelectedCourseId())
  const announcementSent = getAnnouncement(RUN_ACTIVITY_ID)?.status === 'simulated_sent'
  const dailyInsight = course
    ? {
        title: '비 예보를 보고 러닝 코스를 바꿨어요.',
        body: `크루원 문의를 모아 포장된 코스 2개를 비교했고, 지호님이 고른 ${course.name}${announcementSent ? '로 공지를 보냈어요.' : '로 정했어요.'}`,
      }
    : rainFired
      ? {
          title: '촬영 시간대의 비 예보를 먼저 알려 드렸어요.',
          body: '강변 촬영 전에 날씨와 실내 대안을 함께 확인할 수 있게 했어요.',
        }
      : {
          title: '오늘 활동을 브리핑 순서대로 이어 갔어요.',
          body: `${doneCount}개 활동을 마쳤어요. 남은 활동은 스케줄에서 확인할 수 있어요.`,
        }

  const weekBars = [...weekdayCompletion, { label: WEEKDAYS[today.getDay()], value: todayRate, isToday: true }]
  const weekAverage = Math.round(weekBars.reduce((sum, bar) => sum + bar.value, 0) / weekBars.length)
  const weekDiff = weekAverage - lastWeekAverage
  const maxBar = Math.max(...weekBars.map((bar) => bar.value), 1)

  return (
    <section className={styles.page} aria-labelledby="report-title">
      <header className={styles.header}>
        <h1 id="report-title" className={styles.title}>
          리포트
        </h1>
      </header>

      <div className={styles.periodTabs} role="tablist" aria-label="리포트 기간">
        {periods.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={period === item.id}
            className={styles.periodTab}
            onClick={() => setPeriod(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {period === 'day' && (
        <div className={styles.panel} role="tabpanel" aria-label="일간 리포트">
          <p className={styles.dateLabel}>
            {today.getFullYear()}년 {shortDate(today)}
          </p>
          <ol className={styles.weekStrip} aria-label="이번 주">
            {weekDays.map((date) => {
              const isToday = date.getTime() === today.getTime()
              return (
                <li key={date.toISOString()} className={styles.weekDay} data-today={isToday} aria-current={isToday ? 'date' : undefined}>
                  <span className={styles.weekDayNumber}>{date.getDate()}</span>
                  <span className={styles.weekDayName}>{WEEKDAYS[date.getDay()]}</span>
                </li>
              )
            })}
          </ol>

          <Card className={styles.card}>
            <header className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>오늘의 진행 상황</h2>
              <p className={styles.cardCaption}>
                기록된 할 일 {items.length}개 중 {todayRate}% 완료
                {longest ? ` • 가장 오래 걸린 활동: ${longest.activity.name}` : ''}
              </p>
            </header>
            <ul className={styles.progressList}>
              {items.map((item) => {
                const Icon = roleIcon[roleIconKey[item.role.id]]
                return (
                  <li key={item.schedule.id} className={styles.progressItem} data-status={item.schedule.status}>
                    <Icon size={24} className={styles.progressIcon} />
                    <span className={styles.progressText}>
                      <span className={styles.progressName}>{item.activity.name}</span>
                      <span className={styles.progressDetail}>
                        {item.role.label} • {progressDetail(item)}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Card className={styles.card}>
            <header className={styles.remainingHeader}>
              <h2 className={styles.cardTitle}>미완료 검토사항</h2>
              <span className={styles.divider} aria-hidden="true" />
              <span className={styles.remainingCount}>{remainingTotal}건</span>
            </header>
            <p className={styles.cardCaption}>{clockLabel()}</p>
            {remainingTotal > 0 ? (
              <>
                <div className={styles.stackBar} aria-hidden="true">
                  {remaining
                    .filter((item) => item.count > 0)
                    .map((item) => (
                      <span key={item.id} className={styles.stackSegment} data-tone={item.tone} style={{ flexGrow: item.count }} />
                    ))}
                </div>
                <ul className={styles.legend}>
                  {remaining.map((item) => (
                    <li key={item.id} className={styles.legendItem}>
                      <span className={styles.legendSwatch} data-tone={item.tone} aria-hidden="true" />
                      {item.label} {item.count}건
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className={styles.cardCaption}>오늘 남은 일이 없어요.</p>
            )}
          </Card>

          <ReportFeedbackCard
            key={dailyInsight.title}
            title={dailyInsight.title}
            body={dailyInsight.body}
            positiveLabel="도움이 됐어요"
            negativeLabel="다르게 도와주세요"
          />
        </div>
      )}

      {period === 'week' && (
        <div className={styles.panel} role="tabpanel" aria-label="주간 리포트">
          <p className={styles.dateLabel}>
            {shortDate(weekDays[1])} ~ {shortDate(today)}
          </p>

          <Card className={styles.card}>
            <header className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>요일별 완료 성취도</h2>
              <p className={styles.cardCaption}>
                {shortDate(weekDays[1])} ~ {shortDate(today)}
              </p>
            </header>
            <ol className={styles.barChart}>
              {weekBars.map((bar) => (
                <li key={bar.label} className={styles.barColumn}>
                  <span className={styles.barTrack}>
                    <span
                      className={styles.bar}
                      data-today={'isToday' in bar}
                      style={{ height: `${Math.max((bar.value / maxBar) * 100, 6)}%` }}
                      title={`${bar.value}%`}
                    />
                  </span>
                  <span className={styles.barLabel}>{bar.label}</span>
                </li>
              ))}
            </ol>
            <p className={styles.weekSummary}>
              {weekDiff >= 0
                ? `지난주보다 평균 ${weekDiff}%p 더 완료했어요.`
                : `지난주보다 평균 ${Math.abs(weekDiff)}%p 덜 완료했어요.`}
            </p>
            <dl className={styles.statList}>
              <div className={styles.statRow}>
                <dt>이번 주 평균 완료율</dt>
                <dd>{weekAverage}%</dd>
              </div>
              <div className={styles.statRow}>
                <dt>지난 주 평균 완료율</dt>
                <dd>{lastWeekAverage}%</dd>
              </div>
            </dl>
          </Card>

          <Card className={styles.card}>
            <header className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{weeklyPattern.title}</h2>
              <p className={styles.cardCaption}>{weeklyPattern.caption}</p>
            </header>
            <table className={styles.patternTable}>
              <tbody>
                {weeklyPattern.rows.map((row) => (
                  <tr key={row.date}>
                    <th scope="row">{row.date}</th>
                    <td>{row.change}</td>
                    <td className={styles.patternResult}>{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <ReportFeedbackCard
            title={weeklyPattern.insightTitle}
            body={weeklyPattern.insightBody}
            positiveLabel="좋아요"
            negativeLabel="괜찮아요"
          />
        </div>
      )}

      {period === 'season' && (
        <div className={styles.panel} role="tabpanel" aria-label="시즌 리포트">
          <Card className={`${styles.card} ${styles.emptyCard}`}>
            <h2 className={styles.cardTitle}>시즌 리포트는 준비 중이에요</h2>
            <p className={styles.cardCaption}>
              활동 기간이 쌓이면 기간별로 반복된 패턴과 다음 기간에 도움이 될 피드백을 보여 드릴게요.
            </p>
          </Card>
        </div>
      )}
    </section>
  )
}

