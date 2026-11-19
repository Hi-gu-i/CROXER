import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconRight } from "../icons";
import styles from "./ChatResultCard.module.css";

type ChatResultCardProps = {
  title: ReactNode;
  description: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title">;

/**
 * 채팅 안 추천 결과 카드.
 * 원본 `05 · 추천 결과 · 새 디자인` — title / description / action 문구만 교체.
 */
export function ChatResultCard({
  title,
  description,
  actionLabel = "추천 장소 보러가기",
  onAction,
  className,
  disabled,
  type = "button",
  ...rest
}: ChatResultCardProps) {
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  return (
    <article className={classes}>
      <div className={styles.body}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
      {actionLabel ? (
        <button
          type={type}
          className={styles.action}
          onClick={onAction}
          disabled={disabled}
          {...rest}
        >
          <span className={styles.actionLabel}>{actionLabel}</span>
          <span className={styles.actionIcon} aria-hidden="true">
            <IconRight size={16} />
          </span>
        </button>
      ) : null}
    </article>
  );
}
