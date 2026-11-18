import { useState } from 'react'
import { Button } from '../../components'
import {
  defaultNotificationType,
  matchPreset,
  notificationSituations,
  notificationTypes,
  presetToggles,
  type NotificationToggles,
  type NotificationTypeId,
} from './notificationPresets'
import styles from './notification-settings-page.module.css'

interface NotificationSettingsPageProps {
  /** 저장했을 때. 세션 저장이 연결되면 이 값을 저장소 함수로 넘긴다 */
  onSave?: (toggles: NotificationToggles, type: NotificationTypeId | null) => void
}

function sameToggles(a: NotificationToggles, b: NotificationToggles) {
  return notificationSituations.every((situation) => a[situation.id] === b[situation.id])
}

/**
 * 알림 설정(PRD F-02 중 알림 부분). 첫 UT 범위 밖 화면.
 * 유형과 상황별 토글을 한 화면에 두고, 유형을 고르면 토글이 바로 바뀐다. `저장`을 눌렀을 때만 반영한다(PRD 11.1).
 * PRD 3.3에 따라 '설정이 후속 동작에 반영되지 않는다'는 문구는 화면에 넣지 않는다.
 */
export function NotificationSettingsPage({ onSave }: NotificationSettingsPageProps) {
  const [saved, setSaved] = useState<NotificationToggles>(presetToggles[defaultNotificationType])
  const [draft, setDraft] = useState<NotificationToggles>(presetToggles[defaultNotificationType])
  const [justSaved, setJustSaved] = useState(false)

  const selectedType = matchPreset(draft)
  const isDirty = !sameToggles(draft, saved)

  function chooseType(typeId: NotificationTypeId) {
    setDraft(presetToggles[typeId])
    setJustSaved(false)
  }

  function toggle(id: keyof NotificationToggles) {
    setDraft((current) => ({ ...current, [id]: !current[id] }))
    setJustSaved(false)
  }

  function save() {
    setSaved(draft)
    setJustSaved(true)
    onSave?.(draft, selectedType)
  }

  return (
    <section className={styles.page} aria-labelledby="notification-settings-title">
      <header className={styles.header}>
        <h1 id="notification-settings-title" className={styles.title}>
          알림 설정
        </h1>
        <p className={styles.lead}>CROXER가 언제 알려 드릴지 골라 주세요.</p>
      </header>

      <fieldset className={styles.typeGroup}>
        <legend className={styles.sectionTitle}>알림 유형</legend>
        {notificationTypes.map((type) => {
          const checked = selectedType === type.id
          return (
            <label key={type.id} className={styles.typeOption} data-checked={checked}>
              <input
                type="radio"
                name="notification-type"
                className={styles.radio}
                checked={checked}
                onChange={() => chooseType(type.id)}
              />
              <span className={styles.typeText}>
                <span className={styles.typeLabel}>{type.label}</span>
                <span className={styles.typeDescription}>{type.description}</span>
              </span>
              <span className={styles.radioMark} aria-hidden="true" />
            </label>
          )
        })}
        {selectedType === null && <p className={styles.customNote}>상황별 알림을 직접 고른 조합이에요.</p>}
      </fieldset>

      <section className={styles.situationGroup} aria-labelledby="notification-situations">
        <h2 id="notification-situations" className={styles.sectionTitle}>
          상황별 알림
        </h2>
        <ul className={styles.situationList}>
          {notificationSituations.map((situation) => {
            const on = draft[situation.id]
            const labelId = `notification-${situation.id}`
            return (
              <li key={situation.id} className={styles.situationRow}>
                <span className={styles.situationText}>
                  <span id={labelId} className={styles.situationLabel}>
                    {situation.label}
                  </span>
                  <span className={styles.situationDescription}>{situation.description}</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-labelledby={labelId}
                  className={styles.switch}
                  data-on={on}
                  onClick={() => toggle(situation.id)}
                >
                  <span className={styles.switchThumb} />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className={styles.footer}>
        {justSaved && !isDirty && (
          <p className={styles.savedNote} role="status">
            알림 설정을 저장했어요.
          </p>
        )}
        <Button fullWidth disabled={!isDirty} onClick={save}>
          저장
        </Button>
      </div>
    </section>
  )
}
