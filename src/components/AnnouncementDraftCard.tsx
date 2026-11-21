import type { HTMLAttributes, ReactNode } from "react";
import { IconLocation, IconRight, IconTime } from "../icons";
import { ContextChip } from "./ContextChip";
import kakaoChipIcon from "./assets/kakao-chip-icon.png";
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
  /** 맵 자리에 직접 넣을 콘텐츠(선택 코스 합성 지도 등). 있으면 mapSrc보다 우선 */
  mapContent?: ReactNode;
  onCourseClick?: () => void;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/** 시안 카카오톡 칩 옆 마크 · 원형 가운데 정렬 */
function KakaoMark() {
  return (
    <span
      className={styles.kakaoMark}
      style={{ backgroundImage: `url(${kakaoChipIcon})` }}
      aria-hidden="true"
    />
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
  mapContent,
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
          {mapContent != null ? (
            <div className={styles.mapSlot}>{mapContent}</div>
          ) : mapSrc ? (
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
