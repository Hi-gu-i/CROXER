import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Tag.module.css";

export type TagTone = "neutral" | "yellow" | "violet" | "blue" | "mint";

type TagProps = {
  children: ReactNode;
  tone?: TagTone;
} & HTMLAttributes<HTMLSpanElement>;

/**
 * DS `Tag` — tone 5종.
 * 패딩 4×12, 13/18, radius pill. 코스 카드 칩(4×8·12px)과는 별개.
 */
export function Tag({
  children,
  tone = "neutral",
  className,
  ...rest
}: TagProps) {
  const classes = [styles.tag, styles[tone], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
