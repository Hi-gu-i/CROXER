import { useId } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./RoleTrack.module.css";

type RoleTrackProps = {
  /**
   * 선·세포 색. 기본은 흰 표면 토큰.
   * 역할 막대 위에서 쓸 때는 보통 그대로 두고, 배경에 맞게만 덮어쓴다.
   */
  color?: string;
  /** 곡선 너비(px). Figma Ellipse 5490 기본 553 */
  width?: number;
  /** 곡선 높이(px). Figma Ellipse 5490 기본 276 */
  height?: number;
  /** 선 두께(px). 시안 3 */
  strokeWidth?: number;
  /**
   * 세포(점) 왼쪽 위 X. 트랙 박스 기준 px.
   * 역할 막대 시안: 패널 (71,260) − 트랙 (−80,236) → (151, 24)
   */
  cellX?: number;
  /** 세포 왼쪽 위 Y. 트랙 박스 기준 px */
  cellY?: number;
  /** 세포(점) 표시. 기본 true */
  showCell?: boolean;
} & HTMLAttributes<HTMLDivElement>;

/** Figma `역할 막대` Ellipse 5490 — 553×276 반원 아치 */
const LINE_PATH =
  "M 0 276 C 0 123.57 123.79 0 276.5 0 C 429.21 0 553 123.57 553 276";

/**
 * 역할 막대·전환 패널에 쓰는 아치 곡선 + 세포(점).
 * Figma Section `역할 막대` 공통: Ellipse 5490 + 8×8 cell.
 * 문구·역할 색은 넣지 않는다. (#56)
 */
export function RoleTrack({
  color = "var(--color-surface-default)",
  width = 553,
  height = 276,
  strokeWidth = 3,
  cellX = 151,
  cellY = 24,
  showCell = true,
  className,
  style,
  ...rest
}: RoleTrackProps) {
  const gradId = useId().replace(/:/g, "");
  const classes = [styles.track, className ?? ""].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      style={
        {
          ...style,
          ["--role-track-color" as string]: color,
          ["--role-track-width" as string]: `${width}px`,
          ["--role-track-height" as string]: `${height}px`,
          ["--role-track-stroke" as string]: `${strokeWidth}px`,
          ["--role-track-cell-x" as string]: `${cellX}px`,
          ["--role-track-cell-y" as string]: `${cellY}px`,
        } as CSSProperties
      }
      aria-hidden="true"
      {...rest}
    >
      <svg
        className={styles.curve}
        viewBox="0 0 553 276"
        width={width}
        height={height}
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
            <stop offset="30%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="70%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={LINE_PATH} stroke={`url(#${gradId})`} />
      </svg>
      {showCell ? <span className={styles.cell} /> : null}
    </div>
  );
}
