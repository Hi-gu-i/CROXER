import type { HTMLAttributes, ReactNode } from "react";
import { IconAi } from "../icons";
import styles from "./InsightTableCard.module.css";

export type InsightTableRow = {
  label: ReactNode;
  value: ReactNode;
};

type InsightTableCardProps = {
  title: ReactNode;
  rows: InsightTableRow[];
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/**
 * 활동 인사이트 표 카드.
 * 원본 촬영 화면 `CardCroxer`(촬영 포인트) 역할. Assets `CardCroxer` 화면 조립과 별개.
 */
export function InsightTableCard({
  title,
  rows,
  className,
  ...rest
}: InsightTableCardProps) {
  const classes = [styles.card, className ?? ""].filter(Boolean).join(" ");

  return (
    <article className={classes} {...rest}>
      <header className={styles.header}>
        <IconAi className={styles.icon} size={24} />
        <h3 className={styles.title}>{title}</h3>
      </header>
      <dl className={styles.table}>
        {rows.map((row, index) => (
          <div key={index} className={styles.row}>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={styles.value}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
