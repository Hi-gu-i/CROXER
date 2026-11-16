import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ContextChip.module.css";

export type ContextChipTone = "brand" | "muted";

type ContextChipProps = {
  children: ReactNode;
  /**
   * brand — 채널·날씨·상태 (4×10, 13/18, blue-600)
   * muted — 자료/제목형 맥락 (6×10, 14/22, gray-700)
   */
  tone?: ContextChipTone;
} & HTMLAttributes<HTMLSpanElement>;

/**
 * 활동 화면 상단 맥락 칩.
 * DS `Tag`(일정 카드 역할 라벨)와 별개.
 */
export function ContextChip({
  children,
  tone = "brand",
  className,
  ...rest
}: ContextChipProps) {
  const classes = [styles.chip, styles[tone], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
