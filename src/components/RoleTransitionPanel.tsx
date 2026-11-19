import { useId } from "react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";
import { ToggleCategory, type ToggleCategoryTone } from "./ToggleCategory";
import styles from "./RoleTransitionPanel.module.css";

export type RoleTransitionPhase = "before" | "countdown";

type RoleTransitionPanelProps = {
  /**
   * before — 전환전. From/To 두 활동.
   * countdown — 전환 후. 중앙 단일 활동(toActivity)만.
   */
  phase?: RoleTransitionPhase;
  roleLabel?: ReactNode;
  roleTone?: ToggleCategoryTone;
  count?: ReactNode;
  countSuffix?: ReactNode;
  fromLabel?: ReactNode;
  toLabel?: ReactNode;
  fromActivity?: ReactNode;
  /** countdown에선 중앙 단일 활동명으로 사용 */
  toActivity?: ReactNode;
  keepLabel?: ReactNode;
  /**
   * 아치 선(트랙)과 선 위 cell 점 표시.
   * 활동 전환 패널에서는 false. 시안·데모는 기본 true.
   */
  showTrack?: boolean;
  /** Cell 위치 덮어쓰기 (panel 좌표 px). 기본 원본 351,314 */
  cellX?: number;
  cellY?: number;
  onKeep?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
} & HTMLAttributes<HTMLElement>;

const DEFAULTS = {
  before: {
    roleLabel: "교양 3조 팀장",
    roleTone: "yellow" as ToggleCategoryTone,
  },
  countdown: {
    roleLabel: "러닝 크루장",
    roleTone: "mint" as ToggleCategoryTone,
  },
};

/** 원본 line VECTOR — vertices + cubic tangents */
const LINE_PATH =
  "M 0 276 C 0 123.57 123.79 0 276.5 0 C 429.21 0 553 123.57 553 276";

/**
 * 활동 전환 패널. Figma `RoleTransitionPanel`.
 * Tint(보라→민트+blur) · WhiteFade · 하단 radius 24 · 아치 곡선 Line.
 */
export function RoleTransitionPanel({
  phase = "before",
  roleLabel,
  roleTone,
  count = "3",
  countSuffix = "초 후에 자동으로 전환됩니다",
  fromLabel = "현재 활동",
  toLabel = "다음 활동",
  fromActivity = "구독 연장",
  toActivity = "한강 러닝",
  keepLabel = "유지하기",
  showTrack = true,
  cellX = 351,
  cellY = 314,
  onKeep,
  className,
  style,
  ...rest
}: RoleTransitionPanelProps) {
  const defaults = DEFAULTS[phase];
  const chipLabel = roleLabel ?? defaults.roleLabel;
  const chipTone = roleTone ?? defaults.roleTone;
  const isCountdown = phase === "countdown";
  const gradId = useId().replace(/:/g, "");

  const classes = [styles.panel, styles[phase], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={classes}
      style={
        {
          ...style,
          ["--rtp-cell-x" as string]: `${cellX}px`,
          ["--rtp-cell-y" as string]: `${cellY}px`,
        } as CSSProperties
      }
      aria-label="활동 전환"
      {...rest}
    >
      <div className={styles.tint} aria-hidden="true" />
      <div className={styles.whiteFade} aria-hidden="true" />

      <header className={styles.header}>
        <ToggleCategory tone={chipTone}>{chipLabel}</ToggleCategory>
      </header>

      <p className={styles.countdown}>
        <span className={styles.count}>{count}</span>
        <span className={styles.countSuffix}>{countSuffix}</span>
      </p>

      <div className={styles.labels}>
        <span className={styles.fromLabel}>{fromLabel}</span>
        {!isCountdown ? (
          <span className={styles.toLabel}>{toLabel}</span>
        ) : null}
      </div>

      <div className={styles.titles}>
        {!isCountdown ? (
          <span className={styles.fromActivity}>{fromActivity}</span>
        ) : null}
        <span className={styles.toActivity}>{toActivity}</span>
      </div>

      {showTrack ? (
        <div className={styles.track} aria-hidden="true">
          <svg
            className={styles.curve}
            viewBox="0 0 553 276"
            width="553"
            height="276"
            focusable="false"
          >
            <defs>
              <linearGradient
                id={gradId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
                gradientUnits="objectBoundingBox"
              >
                <stop
                  offset="20%"
                  stopColor="var(--color-surface-default)"
                  stopOpacity="0"
                />
                <stop
                  offset="50%"
                  stopColor="var(--color-surface-default)"
                  stopOpacity="1"
                />
                <stop
                  offset="80%"
                  stopColor="var(--color-surface-default)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <path d={LINE_PATH} stroke={`url(#${gradId})`} />
          </svg>
          <span className={styles.cell} />
        </div>
      ) : null}

      <button type="button" className={styles.keep} onClick={onKeep}>
        {keepLabel}
      </button>
    </section>
  );
}
