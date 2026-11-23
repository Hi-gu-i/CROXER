import type { HTMLAttributes, ReactNode } from "react";
import { ResImgSend } from "../res-img";
import calendarFlipSrc from "./assets/status-calendar-flip.gif";
import styles from "./StatusResult.module.css";

export type StatusResultMotion = "calendarFlip" | "sendFly";

type StatusResultProps = {
  title: ReactNode;
  description?: ReactNode;
  /** 기본: Resource ResImgSend (64×56). 원본 그라데이션 비행기 */
  icon?: ReactNode;
  /**
   * Figma MYA_Interaction 모션.
   * - calendarFlip: `386:17912` 달력 앞장 펄럭 (2s loop)
   * - sendFly: `304:17033` 전송 아이콘 날아감 (2s loop)
   */
  motion?: StatusResultMotion;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/**
 * 완료·전송 결과 상태.
 * Task 8 `06 · 변경된 코스 전송` 원본. title/description/icon props로 교체.
 */
export function StatusResult({
  title,
  description,
  icon,
  motion,
  className,
  ...rest
}: StatusResultProps) {
  const classes = [
    styles.root,
    motion === "calendarFlip" ? styles.motionCalendar : "",
    motion === "sendFly" ? styles.motionSend : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const iconNode =
    motion === "calendarFlip" ? (
      <>
        <img
          className={styles.calendarFlip}
          src={calendarFlipSrc}
          alt=""
          width={64}
          height={61}
          draggable={false}
        />
        <span className={styles.calendarStill}>{icon}</span>
      </>
    ) : (
      (icon ?? <ResImgSend size={64} />)
    );

  return (
    <div className={classes} {...rest}>
      <div className={styles.icon} aria-hidden="true">
        <div className={styles.iconMotion}>{iconNode}</div>
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
