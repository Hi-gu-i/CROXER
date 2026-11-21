import { useEffect } from "react";
import {
  ActivityHeader,
  StatusBar,
  StatusResult,
} from "../../components";
import { ResImgCalendar } from "../../res-img";
import styles from "./shoot-schedule-done.module.css";

type ShootScheduleDoneProps = {
  onHome?: () => void;
  /** 완료 화면을 잠시 보여준 뒤 UT 흐름 종료 */
  onFinish?: () => void;
};

/** 완료 플래시 후 자동 전환 (시안에 CTA 없음) */
const AUTO_FINISH_MS = 1800;

/**
 * 원본 `12 · 일정 수정 완료`.
 * Status+Header · StatusResult(ResImgCalendar).
 * 첫 UT는 교체 본실행 없이 UI만 — 필요 시 여기까지 전환 가능.
 */
export function ShootScheduleDone({ onHome, onFinish }: ShootScheduleDoneProps) {
  useEffect(() => {
    if (!onFinish) return;
    const id = window.setTimeout(() => {
      onFinish();
    }, AUTO_FINISH_MS);
    return () => window.clearTimeout(id);
  }, [onFinish]);

  return (
    <main className={styles.page}>
      <StatusBar />
      <ActivityHeader
        roleLabel="편집자"
        roleTone="violet"
        showAi
        trailing="home"
        onHomeClick={onHome}
      />

      <div className={styles.body}>
        <StatusResult
          className={styles.result}
          icon={<ResImgCalendar size={64} />}
          title="일정 교체가 완료됐어요."
          description={
            "날씨와 마감 일정을 반영하여\n10월 14일 교체가능한 일정과 바꾸었어요."
          }
        />
      </div>
    </main>
  );
}
