import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ContextChip } from "./ContextChip";
import styles from "./ResourceSetCard.module.css";

type ResourceSetCardProps = {
  /** 세트 제목. 원본 칩(fill) 안 텍스트 */
  title: ReactNode;
  /** 예: 12장의 레퍼런스 이미지 */
  caption: ReactNode;
  /** 썸네일·콜라주. 없으면 원본 비율 플레이스홀더 */
  media?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title">;

/**
 * 편집자 자료 목록 한 줄.
 * 원본 `01 · 편집자 자료` 세트 카드.
 * 제목은 muted 칩(fill rgb(94 125 255 / 10%), pad 6×10, radius 24).
 */
export function ResourceSetCard({
  title,
  caption,
  media,
  type = "button",
  className,
  ...rest
}: ResourceSetCardProps) {
  const classes = [styles.card, className ?? ""].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      <span className={styles.copy}>
        <ContextChip tone="muted">{title}</ContextChip>
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.caption}>{caption}</span>
      </span>
      {media ? (
        <span className={styles.mediaCustom}>{media}</span>
      ) : (
        <span className={styles.media} aria-hidden="true">
          <span className={styles.tileA} />
          <span className={styles.tileB} />
          <span className={styles.tileC} />
        </span>
      )}
    </button>
  );
}
