import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ShotPoint.module.css";

type ShotPointProps = {
  /** 원본 번호 배지. 숫자·문자 모두 가능 */
  index: ReactNode;
  title: ReactNode;
  description?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/**
 * 촬영 장면 포인트.
 * 원본 `02 · 강변 촬영` 번호+제목+한 줄 설명.
 */
export function ShotPoint({
  index,
  title,
  description,
  className,
  ...rest
}: ShotPointProps) {
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  return (
    <article className={classes} {...rest}>
      <span className={styles.badge} aria-hidden="true">
        {index}
      </span>
      <div className={styles.copy}>
        <h3 className={styles.title}>{title}</h3>
        {description != null ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
    </article>
  );
}
