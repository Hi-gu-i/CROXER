import type { ActivityId } from '../../data/types'
import { getActivity, getRole } from '../../data/utStore'
import styles from './role-switch-panel.module.css'

interface RoleSwitchPanelProps {
  nextActivityId: ActivityId
  onSwitch: () => void
  onKeep: () => void
}

export default function RoleSwitchPanel({ nextActivityId, onSwitch, onKeep }: RoleSwitchPanelProps) {
  const activity = getActivity(nextActivityId)
  const role = getRole(activity.roleId)

  return (
    <div className={styles.scrim}>
      <section
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-switch-title"
      >
        <h2 id="role-switch-title" className={styles.title}>
          {withDirectionParticle(role.name)} 전환할까요?
        </h2>
        <p className={styles.nextActivity}>다음 활동 · {activity.name}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.keepButton} onClick={onKeep}>
            유지하기
          </button>
          <button type="button" className={styles.switchButton} onClick={onSwitch}>
            전환하기
          </button>
        </div>
      </section>
    </div>
  )
}

/** 받침이 있으면(ㄹ 제외) '으로', 없으면 '로'를 붙인다. 예: 편집자로, 러닝 크루장으로 */
function withDirectionParticle(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  if (code < 0 || code > 11171) return `${word}(으)로`
  const finalConsonant = code % 28
  return finalConsonant === 0 || finalConsonant === 8 ? `${word}로` : `${word}으로`
}
