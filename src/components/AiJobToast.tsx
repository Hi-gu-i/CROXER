import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { IconPlaying } from "../icons";
import styles from "./AiJobToast.module.css";

export type AiJobToastTone = "ack" | "done";

type AiJobToastProps = {
  /** ack=접수 안내 · done=완료 */
  tone?: AiJobToastTone;
  message: ReactNode;
  /** 오른쪽 액션/상태. 예: `작업 상세` / `작업 완료` */
  actionLabel?: ReactNode;
  onAction?: () => void;
  /**
   * 채팅 「작업 상세」처럼 오른쪽 원형 IconPlaying.
   * 러닝 완료 토스트 원본에는 없음. 기본 false.
   */
  showActionChevron?: boolean;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

type ActionProps = {
  label: ReactNode;
  showIcon: boolean;
  onAction?: () => void;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function Action({ label, showIcon, onAction, className, ...rest }: ActionProps) {
  const classes = [
    styles.action,
    showIcon ? styles.actionWithIcon : styles.actionPlain,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <span className={styles.actionLabel}>{label}</span>
      {showIcon ? (
        <span className={styles.actionIcon} aria-hidden="true">
          <IconPlaying size={12} />
        </span>
      ) : null}
    </>
  );

  if (onAction) {
    return (
      <button type="button" className={classes} onClick={onAction} {...rest}>
        {body}
      </button>
    );
  }

  return <span className={classes}>{body}</span>;
}

/**
 * AI 작업 상태 토스트.
 * ack: `07 · 레퍼런스 · 작업 진행` · done: `10 · 러닝끝나고…` 알림.
 * message·actionLabel·tone props로 교체.
 */
export function AiJobToast({
  tone = "ack",
  message,
  actionLabel,
  onAction,
  showActionChevron = false,
  className,
  ...rest
}: AiJobToastProps) {
  const classes = [
    styles.root,
    tone === "done" ? styles.done : styles.ack,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="status" aria-live="polite" {...rest}>
      <div className={styles.inner}>
        <p className={styles.message}>{message}</p>
        {actionLabel != null ? (
          <Action
            label={actionLabel}
            showIcon={showActionChevron}
            onAction={onAction}
          />
        ) : null}
      </div>
    </div>
  );
}
