import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./AiAlertCapsule.module.css";

type AiAlertCapsuleProps = {
  /** 펼침 상태에 보이는 한 줄 문구. 홈 기본값 예: 오늘의 스케줄을 확인해 보세요 */
  title?: ReactNode;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title">;

export function AiAlertCapsule({
  title = "오늘의 스케줄을 확인해 보세요",
  expanded = false,
  onExpandedChange,
  type = "button",
  className,
  onClick,
  "aria-label": ariaLabel,
  ...rest
}: AiAlertCapsuleProps) {
  const classes = [
    styles.capsule,
    expanded ? styles.expanded : styles.collapsed,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      aria-expanded={expanded}
      aria-label={
        ariaLabel ??
        (expanded ? String(title) : "AI 알림 펼치기")
      }
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          onExpandedChange?.(!expanded);
        }
      }}
      {...rest}
    >
      <span className={styles.orb} aria-hidden="true" />
      {expanded ? <span className={styles.title}>{title}</span> : null}
    </button>
  );
}
