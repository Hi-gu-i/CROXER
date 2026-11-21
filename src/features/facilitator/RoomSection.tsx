import { useState } from 'react'
import { createRoomId, displayUrl, participantUrl, readRoomId, readSyncStatus } from './roomLink'
import type { RoomSyncStatus } from './roomLink'
import styles from './facilitator-panel.module.css'

const syncLabel: Record<RoomSyncStatus, string> = {
  local: '이 기기만',
  connecting: '연결 중',
  connected: '참가자 휴대폰과 연결됨',
  offline: '끊김 · 다시 연결하는 중',
}

interface RoomSectionProps {
  /** 진행자 패널을 별도 화면(#facilitator)으로 열었는지. 방은 이때만 만든다 */
  standalone: boolean
  /** 새 방을 만들었을 때. 패널이 개입 기록에 남긴다 */
  onCreate?: (roomId: string) => void
}

/**
 * 두 기기 연결 (#76). 진행자 휴대폰에서 방을 만들고 참가자 휴대폰에 주소를 보낸다.
 * 참가자 화면 위에 덮어 연 패널에서는 방 번호와 연결 상태만 보여 준다.
 */
export function RoomSection({ standalone, onCreate }: RoomSectionProps) {
  const [roomId, setRoomId] = useState(readRoomId)
  const [copied, setCopied] = useState(false)
  const status = readSyncStatus()
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  if (!standalone && !roomId) return null

  const link = roomId ? participantUrl(roomId) : null

  function handleCreate() {
    const nextId = createRoomId()
    setRoomId(nextId)
    setCopied(false)
    onCreate?.(nextId)
  }

  async function handleCopy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function handleShare() {
    if (!link) return
    try {
      await navigator.share({ title: 'CROXER UT', url: link })
    } catch {
      // 공유 창을 닫았을 때는 아무것도 하지 않는다
    }
  }

  return (
    <section className={styles.section} aria-labelledby="facilitator-room">
      <h3 id="facilitator-room" className={styles.sectionTitle}>
        두 기기 연결
      </h3>

      {roomId && link ? (
        <>
          <div className={styles.roomCard}>
            <span className={styles.roomLabel}>방 번호</span>
            <strong className={styles.roomNumber}>{roomId}</strong>
          </div>
          <dl className={styles.statusList}>
            <div className={styles.statusRow}>
              <dt>연결 상태</dt>
              <dd className={styles.syncStatus} data-status={status}>
                {syncLabel[status]}
              </dd>
            </div>
            {standalone && (
              <div className={styles.statusRow}>
                <dt>참가자 주소</dt>
                <dd className={styles.roomLink}>{displayUrl(link)}</dd>
              </div>
            )}
          </dl>
          {standalone && (
            <>
              <p className={styles.help}>참가자 휴대폰에서 위 주소를 열어 주세요.</p>
              <div className={styles.actionRow}>
                <button type="button" className={styles.actionButton} onClick={handleCopy}>
                  {copied ? '복사함' : '주소 복사'}
                </button>
                {canShare && (
                  <button type="button" className={styles.actionButton} onClick={handleShare}>
                    공유하기
                  </button>
                )}
              </div>
            </>
          )}
          {status === 'local' && (
            <p className={styles.help}>실시간 연결 기능은 준비 중이에요. 지금은 이 기기 안에서만 진행 상태가 맞춰져요.</p>
          )}
        </>
      ) : (
        <>
          <p className={styles.help}>참가자가 다른 휴대폰을 쓴다면 방을 만들고, 참가자 휴대폰에서 주소를 열어 주세요.</p>
          <button type="button" className={styles.actionButton} onClick={handleCreate}>
            새 방 만들기
          </button>
        </>
      )}
    </section>
  )
}
