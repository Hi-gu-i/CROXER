import type { HTMLAttributes, ReactNode } from "react";
import { IconAi } from "../icons";
import styles from "./PlaceInfoCard.module.css";

type PlaceInfoCardProps = {
  imageSrc: string;
  imageAlt?: string;
  title: ReactNode;
  status: ReactNode;
  hours: ReactNode;
  distance: ReactNode;
  walkTime: ReactNode;
  address: ReactNode;
  insight: ReactNode;
  /** 예: 1 */
  index?: number;
  /** 예: 3 */
  total?: number;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/**
 * 지도 위 추천 장소 정보 카드.
 * 원본 `06 · 지도 채팅` 하단 카드. 문구·이미지·index는 props로 교체.
 */
export function PlaceInfoCard({
  imageSrc,
  imageAlt = "",
  title,
  status,
  hours,
  distance,
  walkTime,
  address,
  insight,
  index = 1,
  total = 3,
  className,
  ...rest
}: PlaceInfoCardProps) {
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  return (
    <article className={classes} {...rest}>
      <span className={styles.badge}>
        {index}/{total}
      </span>

      <div className={styles.main}>
        <img className={styles.thumb} src={imageSrc} alt={imageAlt} />
        <div className={styles.copy}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.meta}>
            <span>{status}</span>
            <span>{hours}</span>
          </p>
          <p className={styles.meta}>
            <span>{distance}</span>
            <span className={styles.walkTime}>{walkTime}</span>
          </p>
          <p className={styles.address}>{address}</p>
        </div>
      </div>

      <div className={styles.insight}>
        <IconAi className={styles.insightIcon} size={14} aria-hidden="true" />
        <p className={styles.insightText}>{insight}</p>
      </div>
    </article>
  );
}
