import { useState, useSyncExternalStore } from 'react'
import type { UtSyncStatus } from '../../data/utRoomSync'
import { createUtRoomId, getUtRoomId, getUtSyncStatus, subscribeUtSyncStatus } from '../../data/utStore'
import { displayUrl, facilitatorUrl, participantUrl } from './roomLink'
import styles from './facilitator-panel.module.css'

const syncLabel: Record<UtSyncStatus, string> = {
  local: '이 기기만',
  connecting: '연결 중',
  connected: '연결됨',
  offline: '끊김 · 다시 연결하는 중',
}

const syncHelp: Record<UtSyncStatus, string> = {
  local: '방 연결 서버가 아직 설정되지 않았어요. 지금은 이 기기 안에서만 진행 상태가 맞춰져요.',
  connecting: '방에 연결하고 있어요.',
  connected: '같은 방 주소로 연 기기끼리 진행 상태가 맞춰져요.',
  offline: '이 기기 상태로 계속 진행되고, 다시 연결되면 바뀐 내용을 맞춰요.',
}

type LinkId = 'participant' | 'facilitator'

interface RoomSectionProps {
  /** 진행자 패널을 별도 화면(#facilitator)으로 열었는지. 방은 이때만 만든다 */
  standalone: boolean
}

/**
 * 두 기기 연결 (#76). 진행자 휴대폰에서 방을 만들고 참가자 휴대폰에 주소를 보낸다.
 * 참가자 화면 위에 덮어 연 패널에서는 방 번호와 연결 상태만 보여 준다.
 */
export function RoomSection({ standalone }: RoomSectionProps) {
  const status = useSyncExternalStore(subscribeUtSyncStatus, getUtSyncStatus)
  const [copied, setCopied] = useState<LinkId | null>(null)
  const roomId = getUtRoomId()
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  if (!standalone && !roomId) return null

  const links = roomId
    ? ([
        { id: 'participant', label: '참가자 링크', url: participantUrl(roomId) },
        { id: 'facilitator', label: '진행자 링크', url: facilitatorUrl(roomId) },
      ] as const)
    : []

  function handleCreate() {
    // 방 번호는 앱을 열 때 주소에서 읽으므로, 새 방 주소로 다시 연다
    window.location.assign(facilitatorUrl(createUtRoomId()))
  }

  async function handleCopy(id: LinkId, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(id)
    } catch {
      setCopied(null)
    }
  }

  async function handleShare(url: string) {
    try {
      await navigator.share({ title: 'CROXER UT 참가자 링크', url })
    } catch {
      // 공유 창을 닫았을 때는 아무것도 하지 않는다
    }
  }

  return (
    <section className={styles.section} aria-labelledby="facilitator-room">
      <h3 id="facilitator-room" className={styles.sectionTitle}>
        두 기기 연결
      </h3>

      {roomId ? (
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
          </dl>
          <p className={styles.help}>{syncHelp[status]}</p>

          {standalone &&
            links.map((link) => (
              <div key={link.id} className={styles.linkBlock}>
                <span className={styles.linkLabel}>{link.label}</span>
                <span className={styles.roomLink}>{displayUrl(link.url)}</span>
                <div className={styles.actionRow}>
                  <button type="button" className={styles.actionButton} onClick={() => handleCopy(link.id, link.url)}>
                    {copied === link.id ? '복사함' : '복사'}
                  </button>
                  {link.id === 'participant' && canShare && (
                    <button type="button" className={styles.actionButton} onClick={() => handleShare(link.url)}>
                      공유하기
                    </button>
                  )}
                </div>
              </div>
            ))}
        </>
      ) : (
        <>
          <p className={styles.help}>
            참가자가 다른 휴대폰을 쓴다면 방을 만들고, 참가자 휴대폰에서 참가자 링크를 열어 주세요.
          </p>
          <button type="button" className={styles.actionButton} onClick={handleCreate}>
            새 방 만들기
          </button>
        </>
      )}
    </section>
  )
}
