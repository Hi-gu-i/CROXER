import type { ReactNode } from "react";
import {
  ActivityHeader,
  Button,
  SectionIntro,
  StatusBar,
} from "../../components";
import { getScheduleByActivity, getToday } from "../../data/utStore";
import { useUtSession } from "../../data/useUtSession";
import {
  IconAi,
  IconComplete,
  IconExchange,
  IconNotice,
  IconPerson,
  IconSunny,
  IconTime,
} from "../../icons";
import { ResImgCamera, ResImgFile } from "../../res-img";
import styles from "./shoot-schedule-swap.module.css";

type SwapItem = {
  when: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  status: ReactNode;
  statusTone: "warn" | "ok";
  illustration: "camera" | "file";
};

type ReasonRow = {
  icon: "sunny" | "time" | "person";
  text: ReactNode;
};

type ShootScheduleSwapProps = {
  onHome?: () => void;
  /** `12 · 일정 수정 완료`로 전환. 본실행 로직은 없음 */
  onConfirm?: () => void;
};

/** YYYY-MM-DD → 다음 날 YYYY-MM-DD (가상 UT 날짜) */
function nextCalendarDay(today: string) {
  const [year, month, day] = today.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 2026-11-15 → 11월 15일 */
function formatMonthDay(day: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00+09:00`));
}

/** ISO startsAt → 13:00 */
function formatClock(startsAt: string) {
  return startsAt.slice(11, 16);
}

/**
 * 원본 `11 · 일정 교체 제안`.
 * Status+Header · SectionIntro · blue-050 위 교체 카드 2장 · 이유 카드 · 하단 Button.
 * 오늘 시각은 브리핑 자리의 촬영 일정, 내일은 getToday() 다음 날(#96·#81).
 */
export function ShootScheduleSwap({ onHome, onConfirm }: ShootScheduleSwapProps) {
  useUtSession();

  const shootStartsAt = getScheduleByActivity("activity-shoot").startsAt;
  const tomorrow = nextCalendarDay(getToday());
  const tomorrowLabel = formatMonthDay(tomorrow);
  const tomorrowDay = Number(tomorrow.slice(8, 10));

  const top: SwapItem = {
    when: `오늘 ${formatClock(shootStartsAt)} 예정`,
    title: "성수동 외부 촬영",
    subtitle: "여행 콘텐츠 제작",
    status: "바로 진행 어려움",
    statusTone: "warn",
    illustration: "camera",
  };

  const bottom: SwapItem = {
    when: `${tomorrowLabel} 11:00 예정`,
    title: "리서치 자료 정리",
    subtitle: "팀 프로젝트",
    status: "시간 조정 가능",
    statusTone: "ok",
    illustration: "file",
  };

  const reasons: readonly ReasonRow[] = [
    { icon: "sunny", text: `${tomorrowDay}일은 맑을 예정이에요` },
    { icon: "time", text: "두 일정 모두 마감에 영향이 없어요" },
    { icon: "person", text: "참여자 일정을 확인했어요" },
  ];

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
        <SectionIntro
          className={styles.intro}
          title="일정을 바꿀까요?"
          description="날씨와 마감 일정을 확인해 교체 가능한 일정을 찾았어요"
        />

        {/* 시안: blue-050 밴드는 교체 카드 구간만 감쌈 · 이유 카드는 밴드 밖 */}
        <div className={styles.swapRegion}>
          <div className={styles.swapStack}>
            <SwapProposeCard item={top} />
            <span className={styles.exchange} aria-hidden="true">
              <IconExchange size={18} />
            </span>
            <SwapProposeCard item={bottom} />
          </div>
        </div>

        <article className={styles.reasonCard}>
          <header className={styles.reasonHeader}>
            <IconAi size={24} className={styles.reasonIcon} aria-hidden="true" />
            <h2 className={styles.reasonTitle}>교체해도 괜찮아요</h2>
          </header>
          <ul className={styles.reasonList}>
            {reasons.map((row) => (
              <li key={String(row.text)} className={styles.reasonRow}>
                <ReasonIcon kind={row.icon} />
                <span className={styles.reasonText}>{row.text}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className={styles.footer}>
        <Button fullWidth onClick={onConfirm}>
          일정 교체하기
        </Button>
      </div>
    </main>
  );
}

function SwapProposeCard({ item }: { item: SwapItem }) {
  return (
    <article className={styles.swapCard}>
      <div className={styles.swapCopy}>
        <p className={styles.swapWhen}>{item.when}</p>
        <div className={styles.swapTitles}>
          <h2 className={styles.swapTitle}>{item.title}</h2>
          <p className={styles.swapSubtitle}>{item.subtitle}</p>
        </div>
        <span
          className={
            item.statusTone === "ok" ? styles.statusOk : styles.statusWarn
          }
        >
          {item.statusTone === "ok" ? (
            <IconComplete size={14} aria-hidden="true" />
          ) : (
            <IconNotice size={14} aria-hidden="true" />
          )}
          {item.status}
        </span>
      </div>
      <span className={styles.swapArt} aria-hidden="true">
        {item.illustration === "camera" ? (
          <ResImgCamera size={64} />
        ) : (
          <ResImgFile size={64} />
        )}
      </span>
    </article>
  );
}

function ReasonIcon({ kind }: { kind: ReasonRow["icon"] }) {
  const props = {
    size: 20 as const,
    className: styles.rowIcon,
    "aria-hidden": true as const,
  };
  if (kind === "sunny") return <IconSunny {...props} />;
  if (kind === "time") return <IconTime {...props} />;
  return <IconPerson {...props} />;
}
