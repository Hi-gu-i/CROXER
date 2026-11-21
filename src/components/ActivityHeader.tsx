import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconAi, IconClose, IconHome } from "../icons";
import { ToggleCategory, type ToggleCategoryTone } from "./ToggleCategory";
import styles from "./ActivityHeader.module.css";

type ActivityHeaderProps = {
  /** 가운데 ToggleCategory 문구. 예: 편집자 · 풍경 속 사람들 */
  roleLabel: ReactNode;
  roleTone?: ToggleCategoryTone;
  /** false면 화살표 숨김. 자료 상세 제목용 */
  showRoleIcon?: boolean;
  /** false면 왼쪽 IconAi 숨김. 장소 제안 채팅(`04`·`05`)용 */
  showAi?: boolean;
  /** home — 목록/홈 · close — 자료 상세 닫기(`02 · 강변 촬영`) */
  trailing?: "home" | "close";
  onRoleClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onAiClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onHomeClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onCloseClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

/**
 * Assets Header.
 * 원본 `01 · 편집자 자료` · `02 · 강변 촬영` Header · 393×72.
 */
export function ActivityHeader({
  roleLabel,
  roleTone = "violet",
  showRoleIcon = true,
  showAi = true,
  trailing = "home",
  onRoleClick,
  onAiClick,
  onHomeClick,
  onCloseClick,
}: ActivityHeaderProps) {
  return (
    <header className={styles.root}>
      <div className={styles.side}>
        {showAi ? (
          <button
            type="button"
            className={styles.ai}
            aria-label="AI"
            onClick={onAiClick}
          >
            <IconAi className={styles.aiIcon} size={22} />
          </button>
        ) : null}
      </div>

      <ToggleCategory
        className={styles.role}
        tone={roleTone}
        showIcon={showRoleIcon}
        onClick={onRoleClick}
      >
        {roleLabel}
      </ToggleCategory>

      <div className={styles.side}>
        {trailing === "close" ? (
          <button
            type="button"
            className={styles.close}
            aria-label="닫기"
            onClick={onCloseClick}
          >
            <IconClose className={styles.homeIcon} size={24} />
          </button>
        ) : (
          <button
            type="button"
            className={styles.home}
            aria-label="홈"
            onClick={onHomeClick}
          >
            <IconHome className={styles.homeIcon} size={24} />
          </button>
        )}
      </div>
    </header>
  );
}
