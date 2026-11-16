import type { HTMLAttributes, ReactNode } from "react";
import { IconLocation, IconRight, IconTime } from "../icons";
import { ContextChip } from "./ContextChip";
import styles from "./AnnouncementDraftCard.module.css";

type AnnouncementDraftCardProps = {
  recipientLabel?: ReactNode;
  channel: ReactNode;
  title: ReactNode;
  body: ReactNode;
  time: ReactNode;
  location: ReactNode;
  courseTitle: ReactNode;
  courseMeta: ReactNode;
  /** 코스 미리보기 맵. 없으면 플레이스홀더 */
  mapSrc?: string;
  mapAlt?: string;
  onCourseClick?: () => void;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/** KakaoTalk 마크 (원본 이미지 대체용 심플 마크). */
function KakaoMark() {
  return (
    <span className={styles.kakaoMark} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" focusable="false">
        <path
          fill="#3C1E1E"
          d="M12 4C7.03 4 3 7.14 3 11c0 2.45 1.61 4.6 4.04 5.84-.13.48-.84 3.06-.87 3.25 0 0-.07.2.11.27.18.08.28.03.28.03.37-.05 4.27-2.82 4.94-3.3.49.07 1 .1 1.5.1 4.97 0 9-3.14 9-7s-4.03-7-9-7z"
        />
      </svg>
    </span>
  );
}

export function AnnouncementDraftCard({
  recipientLabel = "받는사람",
  channel,
  title,
  body,
  time,
  location,
  courseTitle,
  courseMeta,
  mapSrc,
  mapAlt = "",
  onCourseClick,
  className,
  ...rest
}: AnnouncementDraftCardProps) {
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  return (
    <article className={classes} {...rest}>
      <div className={styles.recipients}>
        <span className={styles.recipientLabel}>{recipientLabel}</span>
        <div className={styles.channel}>
          <ContextChip tone="brand">{channel}</ContextChip>
          <KakaoMark />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.copy}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.body}>{body}</p>
          </div>

          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <IconTime className={styles.metaIcon} size={18} />
              <span>{time}</span>
            </div>
            <div className={styles.metaRow}>
              <IconLocation className={styles.metaIcon} size={18} />
              <span>{location}</span>
            </div>
          </div>
        </div>

        <div className={styles.coursePreview}>
          {mapSrc ? (
            <img className={styles.map} src={mapSrc} alt={mapAlt} />
          ) : (
            <div className={styles.mapPlaceholder} aria-hidden="true" />
          )}
          {onCourseClick ? (
            <button
              type="button"
              className={styles.courseBar}
              onClick={onCourseClick}
            >
              <span className={styles.courseText}>
                <span className={styles.courseTitle}>{courseTitle}</span>
                <span className={styles.courseMeta}>{courseMeta}</span>
              </span>
              <IconRight className={styles.arrowIcon} size={24} />
            </button>
          ) : (
            <div className={styles.courseBar}>
              <span className={styles.courseText}>
                <span className={styles.courseTitle}>{courseTitle}</span>
                <span className={styles.courseMeta}>{courseMeta}</span>
              </span>
              <IconRight className={styles.arrowIcon} size={24} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
