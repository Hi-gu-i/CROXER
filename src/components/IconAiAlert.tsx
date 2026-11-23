import type { ButtonHTMLAttributes } from "react";
import { IconAi } from "../icons";
import glowSrc from "./assets/icon-ai-alert-glow.png";
import spinSrc from "./assets/icon-ai-alert-spin.gif";
import styles from "./IconAiAlert.module.css";

type IconAiAlertProps = {
  /**
   * true면 펼치기 전 alert 모션(주변 glow 회전 + 아이콘 스핀 GIF).
   * 사용자가 눌러 알림을 연 뒤에는 false.
   */
  active?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/**
 * Figma `iconai alert` (MYA_Interaction · 417:40537).
 * 알림을 열기 전에 모션이 돌고, 탭하면 알림이 펼쳐진다.
 */
export function IconAiAlert({
  active = false,
  type = "button",
  className,
  "aria-label": ariaLabel = "AI 알림",
  ...rest
}: IconAiAlertProps) {
  const classes = [
    styles.root,
    active ? styles.active : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      aria-label={ariaLabel}
      data-alert-active={active ? "true" : "false"}
      {...rest}
    >
      {active ? (
        <span className={styles.glow} aria-hidden="true">
          <img className={styles.glowImg} src={glowSrc} alt="" />
        </span>
      ) : null}
      {active ? (
        <img className={styles.spin} src={spinSrc} alt="" draggable={false} />
      ) : (
        <IconAi className={styles.icon} size={22} />
      )}
    </button>
  );
}
