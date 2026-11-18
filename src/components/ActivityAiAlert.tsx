import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconClose } from "../icons";
import styles from "./ActivityAiAlert.module.css";

type ActivityAiAlertState = "signal" | "expanded";

type ActivityAiAlertProps = {
  state?: ActivityAiAlertState;
  title?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
  onClose?: () => void;
  onSignalClick?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title">;

export function ActivityAiAlert({
  state = "signal",
  title,
  description,
  meta,
  actionLabel,
  onAction,
  onClose,
  onSignalClick,
  type = "button",
  className,
  onClick,
  "aria-label": ariaLabel,
  ...rest
}: ActivityAiAlertProps) {
  if (state === "signal") {
    const classes = [styles.signal, className ?? ""].filter(Boolean).join(" ");
    return (
      <button
        type={type}
        className={classes}
        aria-label={ariaLabel ?? "AI 알림 준비됨"}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) onSignalClick?.();
        }}
        {...rest}
      >
        <span className={styles.orb} aria-hidden="true" />
      </button>
    );
  }

  const classes = [styles.panel, className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={classes} role="dialog" aria-label={ariaLabel ?? "AI 알림"}>
      <div className={styles.header}>
        <span className={styles.orb} aria-hidden="true" />
        {onClose ? (
          <button
            type="button"
            className={styles.close}
            aria-label="알림 닫기"
            onClick={onClose}
          >
            <IconClose size={16} />
          </button>
        ) : (
          <span className={styles.close} aria-hidden="true">
            <IconClose size={16} />
          </span>
        )}
      </div>
      {meta ? <p className={styles.meta}>{meta}</p> : null}
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      {description ? <p className={styles.description}>{description}</p> : null}
      {actionLabel ? (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
