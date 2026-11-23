import type { ButtonHTMLAttributes } from "react";
import { IconAi } from "../icons";
import glowSrc from "./assets/icon-ai-alert-glow.png";
import spinSrc from "./assets/icon-ai-alert-spin.gif";
import styles from "./IconAiAlert.module.css";

type IconAiAlertProps = {
  /**
   * true면 펼치기 전 alert 모션
   * (글래스 뒤 glow 회전 + 글래스 위 다이아몬드 스핀 GIF).
   */
  active?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/**
 * Figma `iconai alert` (MYA_Interaction · 417:40537).
 * glow는 글래스 뒤, 다이아몬드 스핀은 글래스 위 — 둘 중 아이콘은 하나만.
 */
export function IconAiAlert({
  active = false,
  type = "button",
  className,
  "aria-label": ariaLabel = "AI 알림",
  ...rest
}: IconAiAlertProps) {
  const buttonClasses = [styles.face, className ?? ""].filter(Boolean).join(" ");

  return (
    <span
      className={[styles.wrap, active ? styles.active : ""].filter(Boolean).join(" ")}
      data-alert-active={active ? "true" : "false"}
    >
      {active ? (
        <span className={styles.glow} aria-hidden="true">
          <img className={styles.glowImg} src={glowSrc} alt="" />
        </span>
      ) : null}
      <button type={type} className={buttonClasses} aria-label={ariaLabel} {...rest}>
        {active ? (
          <img className={styles.spin} src={spinSrc} alt="" draggable={false} />
        ) : (
          <IconAi className={styles.icon} size={22} />
        )}
      </button>
    </span>
  );
}
