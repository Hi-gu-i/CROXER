import { useEffect, useState } from "react";
import batterySrc from "../assets/status/battery.svg";
import receptionSrc from "../assets/status/reception.svg";
import wifiSrc from "../assets/status/wifi.svg";
import styles from "./StatusBar.module.css";

type StatusBarProps = {
  /** 비우면 현재 시각(HH:MM). Figma `01 · 편집자 자료` Status 기준 */
  time?: string;
};

function formatClock(date: Date) {
  return [date.getHours(), date.getMinutes()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

/**
 * Assets Status (iOS 상태 바).
 * 원본 `01 · 편집자 자료` Status · 393×48.
 */
export function StatusBar({ time }: StatusBarProps) {
  const [now, setNow] = useState(() => formatClock(new Date()));

  useEffect(() => {
    if (time != null) return;
    const tick = () => setNow(formatClock(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [time]);

  return (
    <div className={styles.root} aria-hidden="true">
      <span className={styles.time}>{time ?? now}</span>
      <span className={styles.icons}>
        <img className={styles.reception} src={receptionSrc} alt="" width={18} height={11} />
        <img className={styles.wifi} src={wifiSrc} alt="" width={18} height={13} />
        <img className={styles.battery} src={batterySrc} alt="" width={27} height={13} />
      </span>
    </div>
  );
}
