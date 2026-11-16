import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ChatBubble.module.css";

type ChatBubbleRole = "ai" | "user";
type ChatBubbleShape = "bubble" | "pill";

type ChatBubbleProps = {
  children: ReactNode;
  role?: ChatBubbleRole;
  shape?: ChatBubbleShape;
} & HTMLAttributes<HTMLDivElement>;

export function ChatBubble({
  children,
  role = "ai",
  shape = "bubble",
  className,
  ...rest
}: ChatBubbleProps) {
  const classes = [
    styles.bubble,
    styles[role],
    shape === "pill" ? styles.shapePill : styles.shapeBubble,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      <p className={styles.message}>{children}</p>
    </div>
  );
}
