import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconHamburger } from "../icons";
import { Tag } from "./Tag";
import styles from "./ScheduleListCard.module.css";

type ScheduleListCardTone = "yellow" | "violet" | "blue" | "mint" | "neutral";
type ScheduleListCardTrailing = "handle" | "status";

type ScheduleListCardProps = {
  tag: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tone?: ScheduleListCardTone;
  trailing?: ScheduleListCardTrailing;
  status?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title">;

export function ScheduleListCard({
  tag,
  title,
  description,
  tone = "yellow",
  trailing = "handle",
  status = "진행 중...",
  type = "button",
  className,
  ...rest
}: ScheduleListCardProps) {
  const classes = [
    styles.card,
    trailing === "handle" ? styles.withHandle : styles.withStatus,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {trailing === "handle" ? (
        <>
          <span className={styles.content}>
            <Tag tone={tone}>{tag}</Tag>
            <span className={styles.header}>
              <span className={styles.title}>{title}</span>
              {description ? (
                <span className={styles.description}>{description}</span>
              ) : null}
            </span>
          </span>
          <IconHamburger className={styles.icon} size={24} />
        </>
      ) : (
        <>
          <span className={styles.top}>
            <Tag tone={tone}>{tag}</Tag>
            <span className={styles.spacer} />
            <span className={styles.status}>{status}</span>
          </span>
          <span className={styles.header}>
            <span className={styles.title}>{title}</span>
            {description ? (
              <span className={styles.description}>{description}</span>
            ) : null}
          </span>
        </>
      )}
    </button>
  );
}
