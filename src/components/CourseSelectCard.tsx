import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import { IconAi } from "../icons";
import styles from "./CourseSelectCard.module.css";

type CourseSelectCardProps = {
  selected?: boolean;
  badge: ReactNode;
  label: ReactNode;
  title: ReactNode;
  distance: ReactNode;
  duration: ReactNode;
  tag1: ReactNode;
  tag2: ReactNode;
  description: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title">;

/** Assets `IconComplete` → 20px */
function SelectIcon({
  selected,
  gradId,
}: {
  selected: boolean;
  gradId: string;
}) {
  if (selected) {
    return (
      <span className={styles.selectIcon} aria-hidden="true">
        <svg viewBox="0 0 18 18" width="20" height="20" focusable="false">
          <defs>
            <radialGradient id={gradId} cx="45%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#4146fd" stopOpacity="0.9" />
              <stop offset="71%" stopColor="#5185fe" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7fb2ff" stopOpacity="0.88" />
            </radialGradient>
          </defs>
          <path
            fill={`url(#${gradId})`}
            d="M9 0C13.9705 0 18 4.02954 18 9C18 13.9705 13.9705 18 9 18C4.0296 17.9999 0 13.9704 0 9C0 4.02958 4.0296 0 9 0ZM13.1025 6.48633C12.677 6.06436 11.9905 6.06682 11.5684 6.49219L8.3584 9.72656L6.59375 7.94727C6.17149 7.52187 5.48406 7.51918 5.05859 7.94141C4.6335 8.3637 4.63159 9.0512 5.05371 9.47656L7.58887 12.0322C7.79254 12.2373 8.07032 12.3534 8.35938 12.3535C8.64854 12.3535 8.92712 12.2374 9.13086 12.0322L13.1094 8.02051C13.5312 7.59498 13.5278 6.90842 13.1025 6.48633Z"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className={styles.selectIcon} aria-hidden="true">
      <svg viewBox="0 0 20 20" width="20" height="20" focusable="false">
        <circle
          cx="10"
          cy="10"
          r="9"
          fill="var(--color-surface-default)"
          stroke="var(--color-gray-300)"
          strokeWidth="2"
        />
      </svg>
    </span>
  );
}

export function CourseSelectCard({
  selected = false,
  badge,
  label,
  title,
  distance,
  duration,
  tag1,
  tag2,
  description,
  type = "button",
  className,
  ...rest
}: CourseSelectCardProps) {
  const uid = useId().replace(/:/g, "");
  const classes = [
    styles.card,
    selected ? styles.selected : styles.unselected,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} aria-pressed={selected} {...rest}>
      <span className={styles.body}>
        <SelectIcon selected={selected} gradId={`courseComplete-${uid}`} />
        <span className={styles.content}>
          <span className={styles.head}>
            <span className={styles.badge}>{badge}</span>
            <span className={styles.titleBlock}>
              <span className={styles.titleRow}>
                <span className={styles.label}>{label}</span>
                <span className={styles.title}>{title}</span>
              </span>
              <span className={styles.metrics}>
                <span>{distance}</span>
                <span className={styles.sep} aria-hidden="true">
                  |
                </span>
                <span>{duration}</span>
              </span>
            </span>
          </span>
          <span className={styles.tags}>
            <span className={styles.tag}>{tag1}</span>
            <span className={styles.tag}>{tag2}</span>
          </span>
        </span>
      </span>

      <span className={styles.divider} aria-hidden="true" />

      <span className={styles.footer}>
        <span className={styles.insightIcon} aria-hidden="true">
          <IconAi size={14} />
        </span>
        <span className={styles.description}>{description}</span>
      </span>
    </button>
  );
}
