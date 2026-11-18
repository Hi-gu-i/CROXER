import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { IconClose } from "../icons";
import { ContextChip } from "./ContextChip";
import styles from "./InquiryCard.module.css";

type InquiryCardProps = {
  channel: ReactNode;
  question: ReactNode;
  time: ReactNode;
  originalLabel?: ReactNode;
  onOriginalClick?: () => void;
  /** 뒤 카드 스택 표시. 기본 true */
  stacked?: boolean;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/** KakaoTalk 마크 (원본 이미지 대체). */
function KakaoMark() {
  return (
    <span className={styles.kakaoMark} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" focusable="false">
        <path
          fill="currentColor"
          d="M12 4C7.03 4 3 7.14 3 11c0 2.45 1.61 4.6 4.04 5.84-.13.48-.84 3.06-.87 3.25 0 0-.07.2.11.27.18.08.28.03.28.03.37-.05 4.27-2.82 4.94-3.3.49.07 1 .1 1.5.1 4.97 0 9-3.14 9-7s-4.03-7-9-7z"
        />
      </svg>
    </span>
  );
}

export function InquiryCard({
  channel,
  question,
  time,
  originalLabel = "원문보기",
  onOriginalClick,
  stacked = true,
  className,
  ...rest
}: InquiryCardProps) {
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  return (
    <article className={classes} {...rest}>
      <div className={stacked ? styles.stack : styles.stackFlat}>
        {stacked ? (
          <>
            <span className={styles.layerBack} aria-hidden="true" />
            <span className={styles.layerMid} aria-hidden="true" />
          </>
        ) : null}
        <div className={styles.front}>
          <div className={styles.main}>
            <div className={styles.channelRow}>
              <ContextChip tone="brand">{channel}</ContextChip>
              <KakaoMark />
            </div>
            <p className={styles.question}>{question}</p>
          </div>
          <span className={styles.time}>{time}</span>
        </div>
      </div>

      {originalLabel ? (
        onOriginalClick ? (
          <button
            type="button"
            className={styles.original}
            onClick={onOriginalClick}
          >
            {originalLabel}
          </button>
        ) : (
          <span className={styles.original}>{originalLabel}</span>
        )
      ) : null}
    </article>
  );
}

type AiAssessmentCardProps = {
  title: ReactNode;
  badge?: ReactNode;
  description: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
  onClose?: () => void;
} & Omit<HTMLAttributes<HTMLElement>, "title"> &
  Pick<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">;

/** 01 · 러닝 문의 AI 판단 카드. 문의와 출처가 다른 정보. */
export function AiAssessmentCard({
  title,
  badge = "확인한 상황",
  description,
  actionLabel = "코스 확인",
  onAction,
  onClose,
  className,
  disabled,
  ...rest
}: AiAssessmentCardProps) {
  const classes = [styles.assessment, className ?? ""].filter(Boolean).join(" ");

  return (
    <section className={classes} role="dialog" aria-label="AI 판단" {...rest}>
      <div className={styles.assessmentHeader}>
        <span className={styles.aiOrb} aria-hidden="true" />
        {onClose ? (
          <button
            type="button"
            className={styles.close}
            aria-label="닫기"
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

      <div className={styles.assessmentBody}>
        <h2 className={styles.assessmentTitle}>{title}</h2>
        <div className={styles.assessmentBlock}>
          {badge ? <span className={styles.badge}>{badge}</span> : null}
          <p className={styles.assessmentDescription}>{description}</p>
        </div>
      </div>

      {actionLabel ? (
        <button
          type="button"
          className={styles.action}
          onClick={onAction}
          disabled={disabled}
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
