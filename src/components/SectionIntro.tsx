import type { HTMLAttributes, ReactNode } from "react";
import styles from "./SectionIntro.module.css";

type SectionIntroProps = {
  title: ReactNode;
  description?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

/**
 * 활동 본문 상단 안내.
 * Task 8 코스 선택·공지 확인 원본 인트로(VERTICAL · gap 2 · title 20/30 · body 14/22).
 */
export function SectionIntro({
  title,
  description,
  className,
  ...rest
}: SectionIntroProps) {
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  return (
    <header className={classes} {...rest}>
      <h2 className={styles.title}>{title}</h2>
      {description != null ? (
        <p className={styles.description}>{description}</p>
      ) : null}
    </header>
  );
}
