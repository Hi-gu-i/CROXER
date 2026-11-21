import { useState } from 'react'
import { Button } from '../../components'
import { IconAi } from '../../icons'
import styles from './report-page.module.css'

interface ReportFeedbackCardProps {
  title: string
  body: string
  positiveLabel: string
  negativeLabel: string
  /** 저장했을 때. 세션 저장이 연결되면 이 값을 저장소 함수로 넘긴다 */
  onSave?: (feedback: { helpful: boolean; note: string; savedAt: string }) => void
}

/**
 * AI 개입 결과 카드와 피드백(Figma `CardCroxer`).
 * 시안의 두 버튼에 PRD F-11의 '피드백 입력·저장'을 이어 붙였다.
 */
export function ReportFeedbackCard({ title, body, positiveLabel, negativeLabel, onSave }: ReportFeedbackCardProps) {
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [note, setNote] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  function choose(value: boolean) {
    setHelpful(value)
    setSavedAt(null)
  }

  const canSave = helpful !== null && note.trim().length > 0

  function save() {
    if (!canSave || helpful === null) return
    const now = new Date()
    const time = [now.getHours(), now.getMinutes()].map((n) => String(n).padStart(2, '0')).join(':')
    setSavedAt(time)
    onSave?.({ helpful, note: note.trim(), savedAt: now.toISOString() })
  }

  return (
    <article className={styles.insightCard}>
      <header className={styles.insightHeader}>
        <IconAi size={24} className={styles.insightIcon} />
        <h3 className={styles.insightTitle}>{title}</h3>
      </header>
      <p className={styles.insightBody}>{body}</p>

      <div className={styles.feedbackChoices} role="group" aria-label="이 결과가 도움이 됐나요?">
        <button
          type="button"
          className={styles.feedbackChoice}
          data-variant="positive"
          aria-pressed={helpful === true}
          onClick={() => choose(true)}
        >
          {positiveLabel}
        </button>
        <button
          type="button"
          className={styles.feedbackChoice}
          data-variant="negative"
          aria-pressed={helpful === false}
          onClick={() => choose(false)}
        >
          {negativeLabel}
        </button>
      </div>

      {helpful !== null && (
        <div className={styles.feedbackForm}>
          <label className={styles.feedbackLabel}>
            {helpful ? '어떤 점이 좋았는지 남겨 주세요' : '어떻게 도와드리면 좋을까요?'}
            <textarea
              className={styles.feedbackInput}
              rows={2}
              value={note}
              onChange={(event) => {
                setNote(event.target.value)
                setSavedAt(null)
              }}
            />
          </label>
          {savedAt ? (
            <p className={styles.feedbackSaved} role="status">
              {savedAt}에 피드백을 저장했어요.
            </p>
          ) : (
            // 입력 전에는 회색으로 꺼 두고, 내용을 적으면 브랜드 색으로 켠다
            <Button className={styles.feedbackSave} disabled={!canSave} onClick={save}>
              피드백 저장
            </Button>
          )}
        </div>
      )}
    </article>
  )
}
