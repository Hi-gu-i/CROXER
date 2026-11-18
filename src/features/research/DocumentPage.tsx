import type { Resource } from '../../data/types'
import { documentLabel } from './researchFolders'
import styles from './research-activity-page.module.css'

type Block = { kind: 'section'; heading: string; text: string } | { kind: 'paragraph'; text: string }

/** 빈 줄로 나눈 덩어리 중 `01 `, `1. `로 시작하는 첫 줄은 소제목으로 본다 */
function toBlocks(body: string): Block[] {
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [first, ...rest] = chunk.split('\n')
      if (rest.length > 0 && /^(\d{2}\s|\d\.\s)/.test(first)) {
        return { kind: 'section', heading: first, text: rest.join('\n') }
      }
      return { kind: 'paragraph', text: chunk }
    })
}

interface DocumentPageProps {
  resource: Resource
  /** thumb: 폴더 안 미리보기(축소), full: 본문 화면 */
  variant: 'thumb' | 'full'
}

/** 리서치 문서 한 장. 미리보기와 본문이 같은 내용을 보여 주도록 같은 구성을 쓴다. */
export function DocumentPage({ resource, variant }: DocumentPageProps) {
  const blocks = toBlocks(resource.body)
  const [lead, ...others] = blocks
  const leadText = lead?.kind === 'paragraph' ? lead.text : null
  const rest = leadText ? others : blocks

  return (
    <article
      className={variant === 'thumb' ? styles.pageThumb : styles.pageFull}
      aria-hidden={variant === 'thumb' ? true : undefined}
    >
      <p className={styles.pageLabel}>{documentLabel}</p>
      <h2 className={styles.pageTitle}>{resource.title}</h2>
      {leadText && <p className={styles.pageLead}>{leadText}</p>}
      {rest.map((block, index) =>
        block.kind === 'section' ? (
          <section key={index} className={styles.pageSection}>
            <h3 className={styles.pageHeading}>{block.heading}</h3>
            <p className={styles.pageText}>{block.text}</p>
          </section>
        ) : (
          <p key={index} className={styles.pageText}>
            {block.text}
          </p>
        ),
      )}
    </article>
  )
}
