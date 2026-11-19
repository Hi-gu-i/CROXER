import type { HTMLAttributes, ReactNode } from "react";
import { IconExchange } from "../icons";
import { ResImgCamera, ResImgWrite } from "../res-img";
import styles from "./ScheduleSwapCard.module.css";

type ScheduleSwapSide = {
  dayLabel: ReactNode;
  title: ReactNode;
  /** shoot = ResImgCamera · edit = ResImgWrite */
  kind: "shoot" | "edit";
};

type ScheduleSwapCardProps = {
  title: ReactNode;
  left: ScheduleSwapSide;
  right: ScheduleSwapSide;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/**
 * 일정 조정 대화의 스왑 제안 카드.
 * 원본 `05 · 일정 조정 대화` · 「내일 촬영하려면 편집 일정 조정이 필요해요」.
 */
export function ScheduleSwapCard({
  title,
  left,
  right,
  className,
  ...rest
}: ScheduleSwapCardProps) {
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  return (
    <article className={classes} {...rest}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.row}>
        <SwapSide {...left} />
        <span className={styles.exchange} aria-hidden="true">
          <IconExchange size={18} />
        </span>
        <SwapSide {...right} />
      </div>
    </article>
  );
}

function SwapSide({ dayLabel, title, kind }: ScheduleSwapSide) {
  return (
    <div className={styles.side}>
      <span className={styles.iconWrap} aria-hidden="true">
        <span className={styles.iconBg} />
        {kind === "shoot" ? (
          <ResImgCamera size={28} className={styles.resIcon} />
        ) : (
          <ResImgWrite size={28} className={styles.resIcon} />
        )}
      </span>
      <span className={styles.day}>{dayLabel}</span>
      <span className={styles.sideTitle}>{title}</span>
    </div>
  );
}
