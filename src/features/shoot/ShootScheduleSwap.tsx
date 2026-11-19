import type { ReactNode } from "react";
import {
  ActivityHeader,
  Button,
  SectionIntro,
  StatusBar,
} from "../../components";
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

const TOP: SwapItem = {
  when: "오늘 13:00 예정",
  title: "성수동 외부 촬영",
  subtitle: "여행 콘텐츠 제작",
  status: "바로 진행 어려움",
  statusTone: "warn",
  illustration: "camera",
};

const BOTTOM: SwapItem = {
  when: "10월 14일 11:00 예정",
  title: "리서치 자료 정리",
  subtitle: "팀 프로젝트",
  status: "시간 조정 가능",
  statusTone: "ok",
  illustration: "file",
};

const REASONS: readonly ReasonRow[] = [
  { icon: "sunny", text: "14일은 맑을 예정이에요" },
  { icon: "time", text: "두 일정 모두 마감에 영향이 없어요" },
  { icon: "person", text: "참여자 일정을 확인했어요" },
];

/**
 * 원본 `11 · 일정 교체 제안`.
 * Status+Header · SectionIntro · blue-050 위 교체 카드 2장 · 이유 카드 · 하단 Button.
 */
export function ShootScheduleSwap({ onHome, onConfirm }: ShootScheduleSwapProps) {
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
            <SwapProposeCard item={TOP} />
            <span className={styles.exchange} aria-hidden="true">
              <IconExchange size={18} />
            </span>
            <SwapProposeCard item={BOTTOM} />
          </div>
        </div>

        <article className={styles.reasonCard}>
          <header className={styles.reasonHeader}>
            <IconAi size={24} className={styles.reasonIcon} aria-hidden="true" />
            <h2 className={styles.reasonTitle}>교체해도 괜찮아요</h2>
          </header>
          <ul className={styles.reasonList}>
            {REASONS.map((row) => (
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
