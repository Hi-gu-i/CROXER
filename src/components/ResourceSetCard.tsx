import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ContextChip } from "./ContextChip";
import styles from "./ResourceSetCard.module.css";

type ResourceSetCardProps = {
  /** 세트 제목. 원본 칩(fill) 안 텍스트 */
  title: ReactNode;
  /** 예: 12장의 레퍼런스 이미지 */
  caption: ReactNode;
  /**
   * 콜라주 3칸(좌 큰 칸 · 우 상 · 우 하).
   * 시안 `01 · 편집자 자료` 틀에 object-fit: cover로 채운다.
   */
  images?: readonly [string, string, string];
  /** 썸네일·콜라주. images보다 우선하지 않음 — images 없을 때만 사용 */
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
  images,
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
      {images ? (
        <span className={styles.media} aria-hidden="true">
          <img className={styles.tileA} src={images[0]} alt="" />
          <img className={styles.tileB} src={images[1]} alt="" />
          <img className={styles.tileC} src={images[2]} alt="" />
        </span>
      ) : media ? (
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
