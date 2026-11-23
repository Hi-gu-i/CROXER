import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ActivityHeader,
  AiAssessmentCard,
  AiJobCard,
  AiJobToast,
  AnnouncementDraftCard,
  Button,
  ChatBubble,
  ChatInput,
  CourseSelectCard,
  InquiryCard,
  RunMeter,
  SectionIntro,
  StatusResult,
  type RunMeterPhase,
} from "../../components";
import type { ActivityId } from "../../data/types";
import {
  findKeywordReply,
  fireInquiry,
  getAiJob,
  getAnnouncement,
  getCourses,
  getFallbackChoices,
  getScheduleByActivity,
  getSelectedCourseId,
  isAiJobRequested,
  markAiJobCompleted,
  markAiJobRunning,
  requestAiJob,
  selectCourse,
  sendAnnouncement,
} from "../../data/utStore";
import { useUtSession } from "../../data/useUtSession";
import { IconAi } from "../../icons";
import { ResImgSend } from "../../res-img";
import chatBgGradient from "../../assets/chat-bg-gradient.png";
import courseExpandIcon from "./assets/course-expand-icon.svg?url";
import courseMapBase from "./assets/course-map-base.png";
import courseMarker from "./assets/course-marker.svg?url";
import coursePreviewA from "./assets/course-preview-a.png";
import styles from "./run-activity-page.module.css";

/** IconAi alert 모션 시작 전 여유 (촬영 비 알림과 동일) */
const ICON_AI_ALERT_DELAY_MS = 5_000;
/** 채팅 X로 나간 뒤 ack → 완료 토스트 전환 */
const JOB_TOAST_DONE_DELAY_MS = 5_000;
const JOB_TOAST_ACK_MESSAGE = "정리가 끝나면 알려드릴게요.";
const JOB_TOAST_DONE_MESSAGE = "레퍼런스 정리가 완료됐어요";
const TOAST_SWAP_MS = 280;

type JobToastPhase = "hidden" | "ack" | "done";

/** ack → done 전환 시 아래로 fade-out 후 위로 fade-in */
function SwappingJobToast({
  phase,
  onDoneAction,
  className,
}: {
  phase: "ack" | "done";
  onDoneAction?: () => void;
  className?: string;
}) {
  const [shown, setShown] = useState<"ack" | "done">(phase);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (phase === shown) return;
    setExiting(true);
    const id = window.setTimeout(() => {
      setShown(phase);
      setExiting(false);
    }, TOAST_SWAP_MS);
    return () => window.clearTimeout(id);
  }, [phase, shown]);

  const isDone = shown === "done";

  return (
    <div
      className={[
        styles.toastSwap,
        exiting ? styles.toastSwapOut : styles.toastSwapIn,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 시안 기존 ack 글래스 형태 유지 · 문구·액션만 바꿈 */}
      <AiJobToast
        tone="ack"
        message={isDone ? JOB_TOAST_DONE_MESSAGE : JOB_TOAST_ACK_MESSAGE}
        actionLabel={isDone ? "러닝 마치기" : undefined}
        onAction={isDone ? onDoneAction : undefined}
      />
    </div>
  );
}

/** A 루트 · 원본 viewBox 좌표 + map(361×256) 배치 */
const ROUTE_A = {
  path: "M86.0478 176.445L170.284 77.9227C171.082 76.9899 171.407 75.7424 171.167 74.5389L170.814 72.775C170.641 71.9126 170.189 71.131 169.528 70.5513L129.058 35.0837C127.396 33.6268 124.867 33.7944 123.412 35.4579L107.693 53.4223C106.234 55.0898 103.697 55.2536 102.036 53.7877L88.7391 42.0551C88.2842 41.6537 87.9266 41.1542 87.6932 40.5942L83.4024 30.2961C83.1691 29.7362 82.8114 29.2366 82.3565 28.8352L52.0574 2.10071C50.3969 0.635563 47.862 0.798349 46.4026 2.46385L7.30134 47.0852C6.80884 47.6473 6.48363 48.336 6.36257 49.0734L1.15284 80.8054C1.08327 81.2291 1.08239 81.6613 1.15024 82.0854L2.93657 93.25C3.01016 93.7099 3.16351 94.1534 3.38971 94.5606L7.8514 102.592C7.982 102.827 8.13598 103.048 8.311 103.252L13.8453 109.709C13.9801 109.866 14.1269 110.013 14.2844 110.147L36.4361 129.069C37.4442 129.93 37.9601 131.234 37.8137 132.552L37.7792 132.863C37.6343 134.167 38.1381 135.459 39.1276 136.321L84.0478 175.445",
  transform: "translate(123.07 57.01) scale(0.9893 0.9969)",
  /** path 끝점 → map 좌표 (선 위에 마커) */
  marker: { x: 208.17, y: 232.91 },
} as const;

/** B 루트 · 강변 포장 B코스: 물가 도로 → 92 강변 차로 남동쪽 → 옆 길 북서쪽 → 램프 아래 → 출발점. map(361×256) 좌표 그대로 (#117) */
const ROUTE_B = {
  path: "M60 117.5 L66 121 L71 125 L78.5 132 L86.5 140 L94.5 148 L102.5 156 L110.5 164 L118.5 172 L126.5 180 L134.5 188 L142.5 196 L150 204 L158 212 L166 220 L174.5 228 L183.5 236 L192.5 244 L203 244.5 L213.5 244 L208.3 236 L206.2 231.9 L161.8 192.9 L160.5 189.2 L159.1 185.7 L137 166.6 L131 159.6 L126.2 150.6 L124.2 138.2 L129.4 105.9 L121 104 L114 104.5 L110 105.5 L104 109.2 L96 110.5 L88 108.5 L82 105.5 L76 107 L70 111 L64 115.5 L60 117.5 Z",
  transform: "translate(0 0)",
  /** 출발점 = 끝점 (선 위에 마커) */
  marker: { x: 60, y: 117.5 },
} as const;

const INQUIRY_ID = "inquiry-run-weather";
const JOB_ID = "job-shoot-extra";
const ANNOUNCEMENT_ID = "announcement-run-course";
/** 이미 맡긴 뒤 추가 채팅 응답 */
const JOB_IN_PROGRESS_REPLY = "레퍼런스 정리중이에요.";

/** 시안 `03 · 러닝 문의` 카드 문구 */
const INQUIRY_QUESTION = "비가 오는데 오늘 러닝 코스는 그대로 진행하나요?";
const INQUIRY_CHANNEL = "카카오톡 • 크로싱 러닝크루";
const INQUIRY_TIME = "최근 20분";

/** 시안 `01 · 러닝 문의` ai 알림 문구 */
const ASSESSMENT = {
  title: "오늘 달리기 좋은\n대체 코스를 찾아뒀어요",
  badge: "확인한 상황",
  description:
    "러닝 시간에는 비가 그칠 예보예요. 다만 흙길은 젖어 있을 수 있어서 대체 코스를 찾아뒀어요",
  actionLabel: "코스 확인",
} as const;

/** 시안 `05` 공지 카드 시간 · 오늘 오후 h:mm */
function formatAnnouncementTime(startsAt: string) {
  const hour = Number(startsAt.slice(11, 13));
  const minute = startsAt.slice(14, 16);
  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `오늘 ${period} ${hour12}:${minute}`;
}

/** 시안 코스 표기 · 공원 순환 A코스 */
function courseAnnounceName(courseId: string) {
  const view = COURSE_VIEW[courseId];
  if (!view) return "선택한 코스";
  const letter = view.label.replace(" 코스", "");
  const base = view.title.replace(/ 코스$/, "");
  return `${base} ${letter}코스`;
}

type RunStep =
  | "inquiry"
  | "courses"
  | "announcement"
  | "sent"
  | "running"
  | "chat"
  | "job";

/** 시안 `06 · 변경된 코스 전송` 플래시 후 러닝으로 */
const SENT_FLASH_MS = 1800;

/** 데모 러닝 · 약 5:40/km · 링은 10분에 한 바퀴 */
const DEMO_PACE_SEC_PER_KM = 340;
const DEMO_RING_FULL_MS = 10 * 60 * 1000;

function formatRunClock(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function formatPaceClock(secPerKm: number) {
  const clamped = Math.max(0, secPerKm);
  const m = Math.floor(clamped / 60);
  const s = Math.floor(clamped % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDistanceKm(km: number) {
  if (km < 0.01) return `${km.toFixed(2)}km`;
  if (km < 1) return `${km.toFixed(2)}km`;
  return `${km.toFixed(1)}km`;
}

function deriveRunMetrics(elapsedMs: number) {
  if (elapsedMs <= 0) {
    return {
      time: "00:00:00",
      distance: "0km",
      pace: "0",
      avgPace: "0",
      bpm: "0",
      progress: 0,
    };
  }

  const elapsedSec = elapsedMs / 1000;
  const wave = Math.sin(elapsedSec / 7);
  const paceSec = DEMO_PACE_SEC_PER_KM + wave * 12;
  const distanceKm = elapsedSec / DEMO_PACE_SEC_PER_KM;
  const avgPaceSec =
    distanceKm > 0.001 ? elapsedSec / distanceKm : DEMO_PACE_SEC_PER_KM;
  const bpm = Math.round(142 + wave * 8 + Math.min(12, elapsedSec / 40));

  return {
    time: formatRunClock(elapsedMs),
    distance: formatDistanceKm(distanceKm),
    pace: formatPaceClock(paceSec),
    avgPace: formatPaceClock(avgPaceSec),
    bpm: String(bpm),
    progress: Math.min(0.999, elapsedMs / DEMO_RING_FULL_MS),
  };
}

type ChatMessage =
  | {
      id: string;
      role: "ai" | "user";
      kind?: "text";
      text: string;
    }
  | {
      id: string;
      role: "ai";
      kind: "jobCard";
    };

/** 시안 `04 · 러닝 문의 불 들어옴` 코스 카드 · A→B 순서 */
const COURSE_ORDER = ["course-run-park", "course-run-paved"] as const;

const COURSE_VIEW: Record<
  string,
  {
    badge: string;
    label: string;
    title: string;
    distance: string;
    duration: string;
    tag1: string;
    tag2: string;
    description: string;
  }
> = {
  "course-run-park": {
    badge: "CROXER 추천",
    label: "A 코스",
    title: "공원 순환 코스",
    distance: "4.2km",
    duration: "약 45분",
    tag1: "평탄한 포장길",
    tag2: "공원 순환",
    description: "공원 포장길로, 크루가 함께 달리기 편해요.",
  },
  "course-run-paved": {
    badge: "최단 거리",
    label: "B 코스",
    title: "강변 포장 코스",
    distance: "3.8km",
    duration: "약 37분",
    tag1: "평탄한 포장길",
    tag2: "최단 거리",
    description: "강변을 돌아가는 코스로, 강가를 구경하기 좋아요.",
  },
};

type RunActivityPageProps = {
  activityId: ActivityId;
  /** 활동의 UT 흐름을 마쳤을 때 한 번 부른다. 완료 처리와 전환 패널은 App이 맡는다 */
  onFinish: () => void;
  /** 공지→측정 패널 유지하기 · 공지 초안으로 되돌림 */
  runHandoffStayNonce?: number;
  /** 유지하기 후 「다음으로」· 측정 화면으로 안전하게 진행 */
  onContinueForward?: () => void;
};

/**
 * Task 8(문의·코스·공지) → Task 9(러닝 중 레퍼런스 요청).
 * 원본 `03 · 러닝 문의` → AI 판단 → 코스·공지·러닝.
 * 마치기는 onFinish만 부른다. 촬영로 바로 점프하지 않는다 (#62 리뷰).
 */
export function RunActivityPage({
  activityId,
  onFinish,
  runHandoffStayNonce = 0,
  onContinueForward,
}: RunActivityPageProps) {
  useUtSession();

  const [step, setStep] = useState<RunStep>("inquiry");
  const stepRef = useRef<RunStep>("inquiry");
  stepRef.current = step;
  /** 유지하기 후 공지 초안 · 보내기 막고 「다음으로」 */
  const [announceAfterKeep, setAnnounceAfterKeep] = useState(false);
  const [draft, setDraft] = useState("");
  /** 시안 `02 · 레퍼런스 · 대화 시작` · 빈 대화로 시작 */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  /** 이 대화에서 맡기기 → 작업 카드까지 받았는지 */
  const [referenceJobAssigned, setReferenceJobAssigned] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  /** 5초 후 IconAi alert 모션 · 탭하면 평가 알림 펼침 */
  const [alertArmed, setAlertArmed] = useState(false);
  /** 모션이 한 번이라도 켜졌으면 닫은 뒤에도 바로 다시 열 수 있음 (effect 재실행 방지용 ref) */
  const alertEverArmedRef = useRef(false);
  /** 화면 선택 상태. 공지 발송 후에도 시안처럼 선택이 보이게 유지 */
  const [pickedCourseId, setPickedCourseId] = useState<string | null>(null);
  const [meterPhase, setMeterPhase] = useState<RunMeterPhase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  /** 작업 카드(job)를 본 뒤 채팅을 나가 러닝으로 복귀 */
  const [returnedAfterJob, setReturnedAfterJob] = useState(false);
  /** ack=접수 안내 · done=완료 (채팅을 나가도 유지) */
  const [jobToastPhase, setJobToastPhase] = useState<JobToastPhase>("hidden");
  /** 정지(■) 후 · 채팅 없이 마치기 확인 토스트 */
  const [showStopFinishConfirm, setShowStopFinishConfirm] = useState(false);
  const runAccumulatedRef = useRef(0);
  const runStartedAtRef = useRef<number | null>(null);
  const jobToastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    fireInquiry(INQUIRY_ID);
  }, []);

  useEffect(() => {
    return () => {
      if (jobToastTimerRef.current != null) {
        window.clearTimeout(jobToastTimerRef.current);
      }
    };
  }, []);

  function clearJobToastTimer() {
    if (jobToastTimerRef.current != null) {
      window.clearTimeout(jobToastTimerRef.current);
      jobToastTimerRef.current = null;
    }
  }

  /** 채팅을 닫은 뒤 5초 → 완료 토스트 + job-shoot-extra completed */
  function scheduleJobToastDone() {
    clearJobToastTimer();
    jobToastTimerRef.current = window.setTimeout(() => {
      markAiJobCompleted(JOB_ID);
      setJobToastPhase("done");
      jobToastTimerRef.current = null;
    }, JOB_TOAST_DONE_DELAY_MS);
  }

  /** 문의 화면 첫 진입 후 5초 → IconAi alert 모션 (한 번 뜬 뒤에는 타이머 재시작 안 함) */
  useEffect(() => {
    if (step !== "inquiry") {
      setAlertArmed(false);
      return;
    }
    if (assessmentOpen) {
      setAlertArmed(false);
      return;
    }
    // 이미 모션이 한 번 떴으면 유지 · armed를 끄지 않음 (닫은 뒤 재오픈용)
    if (alertEverArmedRef.current) return;
    setAlertArmed(false);
    const id = window.setTimeout(() => {
      alertEverArmedRef.current = true;
      setAlertArmed(true);
    }, ICON_AI_ALERT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [step, assessmentOpen]);

  useEffect(() => {
    if (step !== "sent") return;
    const id = window.setTimeout(() => {
      // 전송 완료 → 러닝 첫 진입만 초기화. 채팅 복귀 시에는 유지.
      runAccumulatedRef.current = 0;
      runStartedAtRef.current = null;
      setElapsedMs(0);
      setMeterPhase("idle");
      setReturnedAfterJob(false);
      setJobToastPhase("hidden");
      setStep("running");
    }, SENT_FLASH_MS);
    return () => window.clearTimeout(id);
  }, [step]);

  /** 공지→측정 패널 유지하기만 · 일반 활동 전환 유지하기는 측정 화면에 남김 */
  useEffect(() => {
    if (runHandoffStayNonce < 1) return;
    const current = stepRef.current;
    if (current !== "sent" && current !== "running") return;
    setAnnounceAfterKeep(true);
    setStep("announcement");
  }, [runHandoffStayNonce]);

  function handleAnnounceNext() {
    setAnnounceAfterKeep(false);
    runAccumulatedRef.current = 0;
    runStartedAtRef.current = null;
    setElapsedMs(0);
    setMeterPhase("idle");
    setReturnedAfterJob(false);
    setJobToastPhase("hidden");
    setStep("running");
    onContinueForward?.();
  }

  useEffect(() => {
    if (meterPhase !== "running") return;

    runStartedAtRef.current = Date.now();
    const tick = () => {
      const startedAt = runStartedAtRef.current;
      if (startedAt == null) return;
      setElapsedMs(runAccumulatedRef.current + (Date.now() - startedAt));
    };
    tick();
    const id = window.setInterval(tick, 100);
    return () => {
      window.clearInterval(id);
      if (runStartedAtRef.current != null) {
        runAccumulatedRef.current += Date.now() - runStartedAtRef.current;
        runStartedAtRef.current = null;
        setElapsedMs(runAccumulatedRef.current);
      }
    };
  }, [meterPhase]);

  const runMetrics = deriveRunMetrics(elapsedMs);

  const courses = getCourses(activityId);
  const selectedCourseId = pickedCourseId ?? getSelectedCourseId();
  const announcement = getAnnouncement(activityId);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;
  const job = getAiJob(JOB_ID);
  const jobRequested = isAiJobRequested(JOB_ID);
  const fallbacks = getFallbackChoices(activityId);
  const schedule = getScheduleByActivity(activityId);
  const announcementTime = formatAnnouncementTime(schedule.startsAt);
  const selectedView =
    (selectedCourseId && COURSE_VIEW[selectedCourseId]) || null;
  const selectedAnnounceName = selectedCourseId
    ? courseAnnounceName(selectedCourseId)
    : "선택한 코스";
  const selectedRoute =
    selectedCourseId === "course-run-paved" ? ROUTE_B : ROUTE_A;

  function openAssessment() {
    setAlertArmed(false);
    setAssessmentOpen(true);
  }

  function closeAssessment() {
    setAlertArmed(false);
    setAssessmentOpen(false);
  }

  function goCourses() {
    setAlertArmed(false);
    setAssessmentOpen(false);
    // 시안: A 코스 기본 선택
    const nextId = getSelectedCourseId() ?? COURSE_ORDER[0];
    selectCourse(nextId);
    setPickedCourseId(nextId);
    setStep("courses");
  }

  function handleSelectCourse(courseId: string) {
    selectCourse(courseId);
    setPickedCourseId(courseId);
  }

  function goAnnouncement() {
    if (!getSelectedCourseId()) return;
    setAnnounceAfterKeep(false);
    setStep("announcement");
  }

  function handleSendAnnouncement() {
    if (announceAfterKeep) return;
    sendAnnouncement(ANNOUNCEMENT_ID);
    setStep("sent");
  }

  function handleMeterStart() {
    setMeterPhase("running");
    setShowStopFinishConfirm(false);
  }

  function handleMeterPause() {
    setMeterPhase("paused");
  }

  function handleMeterStop() {
    setMeterPhase("paused");
    // 채팅 경로 토스트가 없을 때만 정지 확인 토스트
    if (!returnedAfterJob) {
      setShowStopFinishConfirm(true);
    }
  }

  function handleMeterReset() {
    runAccumulatedRef.current = 0;
    runStartedAtRef.current = null;
    setElapsedMs(0);
    setMeterPhase("idle");
    setShowStopFinishConfirm(false);
  }

  function openChat() {
    if (meterPhase === "running") {
      setMeterPhase("paused");
    }
    // 채팅으로 돌아가면 완료 전환 타이머는 멈춤 · 이미 done이면 유지
    if (jobToastPhase !== "done") {
      clearJobToastTimer();
    }
    setStep("chat");
    setShowFallback(false);
  }

  function closeChat() {
    // 작업 카드를 본 뒤에만 복귀 플래그 · ack 토스트 유지 후 5초 뒤 완료
    if (step === "job" && jobRequested) {
      setReturnedAfterJob(true);
      setJobToastPhase("ack");
      scheduleJobToastDone();
    }
    setStep("running");
    setShowFallback(false);
  }

  function handleHeaderAiClick() {
    if (step === "sent" || step === "chat" || step === "job") return;
    if (step === "running") {
      openChat();
      return;
    }
    // 문의: 첫 모션 전에는 막고, 한 번 뜬 뒤에는 바로 다시 펼침
    if (step === "inquiry" && !alertArmed && !alertEverArmedRef.current) return;
    openAssessment();
  }

  function appendExchange(userText: string, aiText: string) {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: userText },
      { id: `a-${Date.now() + 1}`, role: "ai", text: aiText },
    ]);
  }

  function handleReferenceRequest(userText: string, aiText: string) {
    const stamp = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: `u-${stamp}`, role: "user", text: userText },
      { id: `a-${stamp + 1}`, role: "ai", text: aiText },
      { id: `job-${stamp + 2}`, role: "ai", kind: "jobCard" },
    ]);
    if (requestAiJob(JOB_ID)) {
      markAiJobRunning(JOB_ID);
    } else if (job.status === "queued") {
      markAiJobRunning(JOB_ID);
    }
    setReferenceJobAssigned(true);
    setJobToastPhase("ack");
    setDraft("");
    setShowFallback(false);
    setStep("job");
  }

  function handleSendChat() {
    const text = draft.trim();
    if (!text) return;

    // 맡기기+카드 직후(job)에만. IconAI로 연 chat 화면에서는 이 문구를 쓰지 않음.
    if (step === "job") {
      appendExchange(text, JOB_IN_PROGRESS_REPLY);
      setDraft("");
      setShowFallback(false);
      return;
    }

    const alreadyHasJobCard =
      referenceJobAssigned || messages.some((m) => m.kind === "jobCard");

    const hit = findKeywordReply(activityId, text);
    if (hit) {
      if (alreadyHasJobCard) {
        // 카드는 한 번만 · 답변 문구만 추가
        appendExchange(text, hit.reply);
        setDraft("");
        setShowFallback(false);
        return;
      }
      handleReferenceRequest(text, hit.reply);
      return;
    }

    appendExchange(
      text,
      alreadyHasJobCard
        ? "잘 이해하지 못했어요. 다른 말로 다시 말해 주세요."
        : "잘 이해하지 못했어요. 아래에서 고르거나 다른 말로 다시 말해 주세요.",
    );
    setDraft("");
    setShowFallback(!alreadyHasJobCard);
  }

  function handleFallback(label: string, reply: string) {
    if (step === "job") {
      appendExchange(label, JOB_IN_PROGRESS_REPLY);
      setShowFallback(false);
      return;
    }
    if (referenceJobAssigned || messages.some((m) => m.kind === "jobCard")) {
      appendExchange(label, reply);
      setShowFallback(false);
      return;
    }
    handleReferenceRequest(label, reply);
  }

  /** 러닝 UT 종료. App이 schedule-run done·다음 활동 안내를 맡는다 */
  function handleJobDone() {
    onFinish();
  }

  function onChatSubmit(event: FormEvent) {
    event.preventDefault();
    handleSendChat();
  }

  return (
    <main
      className={[
        styles.page,
        step === "sent" ? styles.pageSent : "",
        step === "running" ? styles.pageRunning : "",
        step === "chat" || step === "job" ? styles.pageChat : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {step === "chat" || step === "job" ? (
        <div className={styles.chatBackground} aria-hidden="true">
          <img
            className={styles.chatBgGradient}
            src={chatBgGradient}
            alt=""
            draggable={false}
          />
          <div className={styles.chatBgWhite} />
        </div>
      ) : null}

      <ActivityHeader
        roleLabel="러닝 크루장"
        roleTone="mint"
        showAi={step !== "chat" && step !== "job"}
        aiAlert={step === "inquiry" && alertArmed && !assessmentOpen}
        trailing={step === "chat" || step === "job" ? "close" : "home"}
        onAiClick={
          step === "sent" || step === "chat" || step === "job"
            ? undefined
            : handleHeaderAiClick
        }
        onCloseClick={closeChat}
      />

      {step === "inquiry" ? (
        <div className={styles.body}>
          <h1 className={styles.sectionTitle}>모임 문의</h1>
          <div className={styles.stack}>
            <InquiryCard
              channel={INQUIRY_CHANNEL}
              question={INQUIRY_QUESTION}
              time={INQUIRY_TIME}
            />
          </div>
        </div>
      ) : null}

      {/* 시안 `01 · 러닝 문의` — Header IconAi → 중앙 알림 + opacity 배경 */}
      {step === "inquiry" && assessmentOpen ? (
        <div className={styles.alertOverlay}>
          <AiAssessmentCard
            title={ASSESSMENT.title}
            badge={ASSESSMENT.badge}
            description={ASSESSMENT.description}
            actionLabel={ASSESSMENT.actionLabel}
            onAction={goCourses}
            onClose={closeAssessment}
          />
        </div>
      ) : null}

      {step === "courses" ? (
        <>
          <div className={styles.courseBody}>
            <SectionIntro
              className={styles.courseIntro}
              title={"시간과 집결지는 그대로,\n코스만 골라주세요"}
              description="젖은 흙길을 피해 달릴 코스 2곳을 찾았어요"
            />

            <div className={styles.courseMap}>
              <img
                className={styles.courseMapImg}
                src={courseMapBase}
                alt="대체 러닝 코스 지도"
                draggable={false}
              />
              {(() => {
                const route =
                  selectedCourseId === "course-run-paved" ? ROUTE_B : ROUTE_A;
                return (
                  <>
                    <svg
                      className={styles.courseRouteOverlay}
                      viewBox="0 0 361 256"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <g transform={route.transform}>
                        <path
                          d={route.path}
                          fill="none"
                          stroke="var(--color-bg-brand)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    </svg>
                    {/* 시안 마커 SVG · 루트 선 끝점 위 */}
                    <img
                      className={styles.courseMarker}
                      src={courseMarker}
                      alt=""
                      draggable={false}
                      style={{
                        left: `${(route.marker.x / 361) * 100}%`,
                        top: `${(route.marker.y / 256) * 100}%`,
                      }}
                    />
                  </>
                );
              })()}
              <img
                className={styles.courseMapExpand}
                src={courseExpandIcon}
                alt=""
                draggable={false}
                aria-hidden="true"
              />
            </div>

            <div className={styles.courseList}>
              {COURSE_ORDER.map((courseId) => {
                const view = COURSE_VIEW[courseId];
                const course = courses.find((item) => item.id === courseId);
                if (!view || !course) return null;
                return (
                  <CourseSelectCard
                    key={courseId}
                    className={styles.courseCard}
                    selected={selectedCourseId === courseId}
                    badge={view.badge}
                    label={view.label}
                    title={view.title}
                    distance={view.distance}
                    duration={view.duration}
                    tag1={view.tag1}
                    tag2={view.tag2}
                    description={view.description}
                    onClick={() => handleSelectCourse(courseId)}
                  />
                );
              })}
            </div>
          </div>
          <div className={styles.footer}>
            <Button
              fullWidth
              disabled={!selectedCourseId}
              onClick={goAnnouncement}
            >
              코스 선택하기
            </Button>
          </div>
        </>
      ) : null}

      {step === "announcement" && announcement ? (
        <>
          <div className={styles.courseBody}>
            <SectionIntro
              className={styles.courseIntro}
              title="코스 변경 공지가 준비됐어요"
              description="내용을 확인한 뒤 크루 단톡방에 보내주세요"
            />
            <AnnouncementDraftCard
              channel="카카오톡 • 크로싱 러닝크루"
              title="오늘 러닝 코스를 변경합니다"
              body={`오늘 러닝은 예정대로 진행합니다\n강변 흙길이 젖어 있을 수 있어 ${selectedAnnounceName}로 변경합니다`}
              time={announcementTime}
              location={
                selectedCourse?.meetingPoint ||
                announcement.meetingPoint ||
                "집결지 미정"
              }
              courseTitle={selectedAnnounceName}
              courseMeta={
                selectedView
                  ? `${selectedView.distance} • ${selectedView.duration}`
                  : ""
              }
              mapContent={
                <div className={styles.announceMap}>
                  <img
                    className={styles.announceMapBase}
                    src={
                      selectedCourseId === "course-run-park"
                        ? coursePreviewA
                        : courseMapBase
                    }
                    alt=""
                    draggable={false}
                  />
                  <svg
                    className={styles.announceMapRoute}
                    viewBox="0 0 361 256"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <g transform={selectedRoute.transform}>
                      <path
                        d={selectedRoute.path}
                        fill="none"
                        stroke="var(--color-bg-brand)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                  <img
                    className={styles.announceMapMarker}
                    src={courseMarker}
                    alt=""
                    draggable={false}
                    style={{
                      left: `${(selectedRoute.marker.x / 361) * 100}%`,
                      top: `${(selectedRoute.marker.y / 256) * 100}%`,
                    }}
                  />
                </div>
              }
            />
          </div>
          <div className={styles.footer}>
            {announceAfterKeep ? (
              <>
                <p className={styles.footerHint}>이미 보낸 공지예요</p>
                <Button fullWidth onClick={handleAnnounceNext}>
                  다음으로
                </Button>
              </>
            ) : (
              <Button fullWidth onClick={handleSendAnnouncement}>
                공지 보내기
              </Button>
            )}
          </div>
        </>
      ) : null}

      {/* 시안 `06 · 변경된 코스 전송` · StatusResult(ResImgSend) */}
      {step === "sent" ? (
        <div className={styles.sentBody}>
          <StatusResult
            className={styles.sentResult}
            motion="sendFly"
            icon={<ResImgSend size={64} />}
            title="변경된 소식을 전송했어요"
            description={
              "선택한 코스와 집결 안내, 경로 지도를\n크로싱 러닝크루 단톡방에 함께 보냈어요"
            }
          />
        </div>
      ) : null}

      {/* 시안 `01 · 러닝` · 시작/일시정지 측정
          헤더·토스트는 셸에 고정, RunMeter만 meterScroll에서 스크롤 */}
      {step === "running" ? (
        <>
          <div className={styles.meterScroll}>
            <RunMeter
              phase={meterPhase}
              time={runMetrics.time}
              distance={runMetrics.distance}
              pace={runMetrics.pace}
              avgPace={runMetrics.avgPace}
              bpm={runMetrics.bpm}
              progress={runMetrics.progress}
              onStart={handleMeterStart}
              onPause={handleMeterPause}
              onStop={handleMeterStop}
              onReset={handleMeterReset}
            />
          </div>
          {/*
            채팅 경로: 맡기기 후 X로 나와도 ack 유지 → 5초 뒤 완료 토스트
            비채팅 경로(#72): 정지(■) 후 확인 토스트
          */}
          {jobToastPhase === "ack" || jobToastPhase === "done" ? (
            <div className={styles.runJobToast}>
              <SwappingJobToast
                phase={jobToastPhase}
                onDoneAction={handleJobDone}
              />
            </div>
          ) : showStopFinishConfirm ? (
            <div className={styles.runJobToast}>
              <AiJobToast
                tone="ack"
                message="러닝을 마칠까요?"
                actionLabel="러닝 마치기"
                onAction={handleJobDone}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {/* 시안 `08 · 러닝·AI 업무 요청` · `02 · 레퍼런스 · 대화 시작` */}
      {step === "chat" || step === "job" ? (
        <>
          <div className={styles.chatBody}>
            <div className={styles.chatList}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={[
                    styles.chatRow,
                    message.role === "user"
                      ? styles.chatRowUser
                      : styles.chatRowAi,
                  ].join(" ")}
                >
                  {message.kind === "jobCard" ? (
                    <div className={styles.chatAiBlock}>
                      <span
                        className={styles.chatAiAvatarSpacer}
                        aria-hidden="true"
                      />
                      <AiJobCard
                        title={job.title}
                        status={
                          job.status === "running"
                            ? "현재 레퍼런스를 찾고 있어요"
                            : "요청을 접수했어요"
                        }
                        steps={[
                          { label: "촬영 메모 확인", state: "done" },
                          { label: "레퍼런스 탐색", state: "todo" },
                          { label: "선별 및 정리", state: "todo" },
                        ]}
                        storagePath={["Notion", "강변 촬영", "레퍼런스"]}
                      />
                    </div>
                  ) : message.role === "ai" ? (
                    <div className={styles.chatAiBlock}>
                      <span className={styles.chatAiAvatar} aria-hidden="true">
                        <IconAi size={22} />
                      </span>
                      <ChatBubble role="ai">{message.text}</ChatBubble>
                    </div>
                  ) : (
                    <ChatBubble role="user">{message.text}</ChatBubble>
                  )}
                </div>
              ))}
            </div>

            {showFallback && step === "chat" && !referenceJobAssigned ? (
              <div className={styles.fallback}>
                <p className={styles.fallbackLabel}>선택지</p>
                {fallbacks.map((choice) => (
                  <Button
                    key={choice.id}
                    variant="secondary"
                    fullWidth
                    onClick={() => handleFallback(choice.label, choice.reply)}
                  >
                    {choice.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            className={[styles.footer, styles.chatFooter].join(" ")}
            onSubmit={onChatSubmit}
          >
            {/* 시안 `07 · 레퍼런스 · 작업 진행` · 입력창 위 ack 토스트 */}
            {step === "job" && jobRequested && jobToastPhase !== "done" ? (
              <AiJobToast
                className={styles.chatJobToast}
                tone="ack"
                message={JOB_TOAST_ACK_MESSAGE}
                actionLabel="작업 상세"
                showActionChevron
              />
            ) : null}
            <ChatInput
              value={draft}
              placeholder="메세지를 입력하세요"
              onChange={(event) => setDraft(event.target.value)}
              onSend={handleSendChat}
            />
          </form>
        </>
      ) : null}
    </main>
  );
}
