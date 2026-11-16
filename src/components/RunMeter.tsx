import { useId, type HTMLAttributes, type ReactNode } from "react";
import {
  IconFilter,
  IconPlaying,
  IconRe,
  IconShare,
  IconStart,
  IconStop,
} from "../icons";
import styles from "./RunMeter.module.css";

export type RunMeterPhase = "idle" | "running" | "paused";

type RunMeterProps = {
  /** 경과 시간. 예: `00:00:59` */
  time?: ReactNode;
  /** 거리. 예: `0.16km` */
  distance?: ReactNode;
  /** 현재 페이스. 빈 값/`—`면 대시 표시 */
  pace?: ReactNode;
  /** 평균 페이스 */
  avgPace?: ReactNode;
  /** 심박수 BPM */
  bpm?: ReactNode;
  /** idle=시작 전 · running=측정 중 · paused=일시정지 */
  phase?: RunMeterPhase;
  /** 원형 진행도 0~1. 12시 방향에서 시계방향. 기본 0 */
  progress?: number;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  onShare?: () => void;
  onMenu?: () => void;
  paceLabel?: ReactNode;
  avgPaceLabel?: ReactNode;
  bpmLabel?: ReactNode;
} & HTMLAttributes<HTMLElement>;

const RING_SIZE = 253;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function MetricValue({ value }: { value: ReactNode }) {
  const empty =
    value == null || value === "" || value === "—" || value === "-";

  if (empty) {
    return <span className={styles.metricDash} aria-hidden="true" />;
  }

  return <span className={styles.metricValue}>{value}</span>;
}

/**
 * 러닝 측정 패널.
 * Task 9 `01 · 러닝` / `08 · 러닝 · 시작 대기` 원본.
 * Assets: IconShare·IconFilter·IconRe·IconStart·IconStop·IconPlaying.
 * time·distance·pace·bpm·phase props로 교체.
 */
export function RunMeter({
  time = "00:00:00",
  distance = "0km",
  pace,
  avgPace,
  bpm,
  phase = "idle",
  progress = 0,
  onStart,
  onPause,
  onStop,
  onReset,
  onShare,
  onMenu,
  paceLabel = "Pace",
  avgPaceLabel = "Avg. Pace",
  bpmLabel = "BPM",
  className,
  ...rest
}: RunMeterProps) {
  const gradId = useId().replace(/:/g, "");
  const progressGradId = `runMeterProgress-${gradId}`;
  const fillGradId = `runMeterFill-${gradId}`;
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");
  const clamped = Math.min(1, Math.max(0, progress));
  const running = phase === "running";
  const dashOffset = RING_CIRCUMFERENCE * (1 - clamped);

  return (
    <section className={classes} aria-label="러닝 측정" {...rest}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolBtn}
          aria-label="공유"
          onClick={onShare}
        >
          <IconShare size={24} />
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          aria-label="메뉴"
          onClick={onMenu}
        >
          <IconFilter size={24} />
        </button>
      </div>

      <div className={styles.ringBlock}>
        <svg
          className={styles.ringSvg}
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={fillGradId}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="var(--color-base-000)" />
              <stop offset="100%" stopColor="var(--color-blue-050)" />
            </linearGradient>
            <linearGradient
              id={progressGradId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="var(--color-blue-200)" />
              <stop offset="50%" stopColor="var(--color-blue-300)" />
              <stop offset="100%" stopColor="var(--color-blue-500)" />
            </linearGradient>
          </defs>
          <circle
            className={styles.ringFill}
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_SIZE / 2}
            fill={`url(#${fillGradId})`}
          />
          <circle
            className={styles.ringTrack}
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
          />
          <circle
            className={styles.ringProgress}
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={`url(#${progressGradId})`}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </svg>

        <div className={styles.hero}>
          <p className={styles.time}>{time}</p>
          <p className={styles.distance}>{distance}</p>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.sideBtn}
          aria-label="초기화"
          onClick={onReset}
        >
          <IconRe size={24} />
        </button>

        <button
          type="button"
          className={styles.primaryBtn}
          aria-label={running ? "일시정지" : "시작"}
          onClick={running ? onPause : onStart}
        >
          {running ? <IconStop size={24} /> : <IconStart size={24} />}
        </button>

        <button
          type="button"
          className={styles.sideBtn}
          aria-label="정지"
          onClick={onStop}
        >
          <IconPlaying size={24} />
        </button>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>{paceLabel}</span>
          <MetricValue value={pace} />
        </div>
        <div className={[styles.metric, styles.metricAvg].join(" ")}>
          <span className={styles.metricLabel}>{avgPaceLabel}</span>
          <MetricValue value={avgPace} />
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>{bpmLabel}</span>
          <MetricValue value={bpm} />
        </div>
      </div>
    </section>
  );
}
