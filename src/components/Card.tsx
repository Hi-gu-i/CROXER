import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

type CardSize = "sm" | "md" | "lg";

type CardProps = {
  children: ReactNode;
  size?: CardSize;
  as?: "article" | "section" | "div";
} & HTMLAttributes<HTMLElement>;

export function Card({
  children,
  size = "md",
  as: Element = "article",
  className,
  ...rest
}: CardProps) {
  const classes = [styles.card, styles[size], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Element className={classes} {...rest}>
      {children}
    </Element>
  );
}
