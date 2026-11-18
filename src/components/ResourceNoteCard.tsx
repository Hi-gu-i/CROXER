import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ResourceNoteCard.module.css";

type ResourceNoteCardProps = {
  title: ReactNode;
  body: ReactNode;
  /** 예: Notion • 여행 콘텐츠 기획 page */
  source?: ReactNode;
  /** 예: 2026.10.05 */
  date?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/**
 * 자료 본문의 메모 블록.
 * 원본 `02 · 강변 촬영` 「내 촬영 메모」. source/date/title/body 교체.
 */
export function ResourceNoteCard({
  title,
  body,
  source,
  date,
  className,
  ...rest
}: ResourceNoteCardProps) {
  const classes = [styles.card, className ?? ""].filter(Boolean).join(" ");
  const showMeta = source != null || date != null;

  return (
    <article className={classes} {...rest}>
      {showMeta ? (
        <div className={styles.meta}>
          {source != null ? <span className={styles.source}>{source}</span> : null}
          {date != null ? <span className={styles.date}>· {date}</span> : null}
        </div>
      ) : null}
      <div className={styles.copy}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.body}>{body}</p>
      </div>
    </article>
  );
}
