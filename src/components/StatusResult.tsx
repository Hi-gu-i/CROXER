import type { HTMLAttributes, ReactNode } from "react";
import { ResImgSend } from "../res-img";
import styles from "./StatusResult.module.css";

type StatusResultProps = {
  title: ReactNode;
  description?: ReactNode;
  /** 기본: Resource ResImgSend (64×56). 원본 그라데이션 비행기 */
  icon?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/**
 * 완료·전송 결과 상태.
 * Task 8 `06 · 변경된 코스 전송` 원본. title/description/icon props로 교체.
 */
export function StatusResult({
  title,
  description,
  icon,
  className,
  ...rest
}: StatusResultProps) {
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={classes} {...rest}>
      <div className={styles.icon} aria-hidden="true">
        {icon ?? <ResImgSend size={64} />}
      </div>
      <div className={styles.copy}>
        <h2 className={styles.title}>{title}</h2>
        {description != null ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
    </div>
  );
}
