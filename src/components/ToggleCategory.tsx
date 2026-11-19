import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconToggle } from "../icons";
import styles from "./ToggleCategory.module.css";

export type ToggleCategoryTone = "yellow" | "violet" | "mint" | "neutral";

type ToggleCategoryProps = {
  children: ReactNode;
  /**
   * yellow — 교양 3조 팀장 / 학생
   * violet — 편집자
   * mint — 러닝 크루장
   * neutral — 자료 상세 제목(`02 · 강변 촬영`)
   */
  tone?: ToggleCategoryTone;
  /** false면 화살표 아이콘 숨김. 자료 상세 제목용 */
  showIcon?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * 활동 화면 상단 역할 토글.
 * `01 · 편집자 자료` ToggleCategory 기준. DS `Tag`·`ContextChip`과 별개.
 */
export function ToggleCategory({
  children,
  tone = "violet",
  showIcon = true,
  type = "button",
  className,
  ...rest
}: ToggleCategoryProps) {
  const classes = [styles.toggle, styles[tone], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      <span className={styles.label}>{children}</span>
      {showIcon ? <IconToggle className={styles.icon} size={16} /> : null}
    </button>
  );
}
