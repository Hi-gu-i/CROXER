import type { HTMLAttributes, ReactNode } from "react";
import { IconSchedule } from "../../icons";
import styles from "./schedule-compare-card.module.css";

export type ScheduleCompareChip = {
  label: ReactNode;
  /** muted = 기존 · accent = 늘어난 일정(시안 파란 칩) */
  tone?: "muted" | "accent";
};

export type ScheduleCompareSection = {
  label: ReactNode;
  chips: readonly ScheduleCompareChip[];
};

type ScheduleCompareCardProps = {
  title?: ReactNode;
  sections: readonly ScheduleCompareSection[];
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/**
 * 촬영 일정 조정 대화의 「내일 일정 비교」 카드.
 * 원본 `08 · 추천 장소 채팅 · 일정 교체 제안` · 250×194.
 * 가이드: CardScheCompa류는 화면 전용 → `features/shoot`.
 */
export function ScheduleCompareCard({
  title = "내일 일정 비교",
  sections,
  className,
  ...rest
}: ScheduleCompareCardProps) {
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  return (
    <article className={classes} {...rest}>
      <header className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          <IconSchedule size={24} />
        </span>
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.sections}>
        {sections.map((section, index) => (
          <section key={index} className={styles.section}>
            <h3 className={styles.sectionLabel}>{section.label}</h3>
            <ul className={styles.chips}>
              {section.chips.map((chip, chipIndex) => (
                <li
                  key={chipIndex}
                  className={
                    chip.tone === "accent" ? styles.chipAccent : styles.chipMuted
                  }
                >
                  {chip.label}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
