import type { ButtonHTMLAttributes } from "react";
import { IconAi } from "../icons";
import glowSrc from "./assets/icon-ai-alert-glow.png";
import styles from "./IconAiAlert.module.css";

type IconAiAlertProps = {
  /**
   * true면 펼치기 전 alert 모션(글래스 뒤 glow 회전).
   * 사용자가 눌러 알림을 연 뒤에는 false.
   */
  active?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/**
 * Figma `iconai alert` (MYA_Interaction · 417:40537).
 * 그라데이션만 글래스 뒤에서 회전하고, 아이콘은 글래스 위 IconAi 하나.
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
        <IconAi className={styles.icon} size={22} />
      </button>
    </span>
  );
}
