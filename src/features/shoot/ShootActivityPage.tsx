import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ActivityAiAlert,
  Button,
  ChatBubble,
  ChatInput,
  ToggleCategory,
} from "../../components";
import type { ActivityId } from "../../data/types";
import {
  findKeywordReply,
  fireAlert,
  getAlert,
  getFallbackChoices,
  getResources,
  getScheduleByActivity,
  isAlertFired,
  markAlertRead,
} from "../../data/utStore";
import { useUtSession } from "../../data/useUtSession";
import styles from "./shoot-activity-page.module.css";

const ALERT_ID = "alert-shoot-rain";
/** UT 베이스라인: 촬영 자료 진입 후 기본 10초 */
const RAIN_ALERT_DELAY_MS = 10_000;

function formatTodayTime(startsAt: string) {
  return `오늘 ${startsAt.slice(11, 16)}`;
}

type ShootStep = "materials" | "resource" | "chat";

type ChatMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
};

type ShootActivityPageProps = {
  activityId: ActivityId;
  /** 활동의 UT 흐름을 마쳤을 때 한 번 부른다. 완료 처리와 전환 패널은 App이 맡는다 */
  onFinish: () => void;
};

/**
 * Task 6 강변 촬영.
 * 원본 `03 · 촬영·AI 알림` → `04 · 장소 제안` 흐름.
 * 일정 교체(§05)는 첫 UT 제외.
 */
export function ShootActivityPage({
  activityId,
  onFinish,
}: ShootActivityPageProps) {
  useUtSession();

  const [step, setStep] = useState<ShootStep>("materials");
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [resolved, setResolved] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const resources = getResources(activityId);
  const startLabel = formatTodayTime(getScheduleByActivity(activityId).startsAt);
  const selected = resources.find((item) => item.id === resourceId) ?? null;
  const alertFired = isAlertFired(ALERT_ID);
  const alert = getAlert(ALERT_ID);
  const fallbacks = getFallbackChoices(activityId);

  function clearRainTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function openResource(id: string) {
    setResourceId(id);
    setStep("resource");
    setAlertOpen(false);

    if (!isAlertFired(ALERT_ID) && timerRef.current === null) {
      timerRef.current = window.setTimeout(() => {
        fireAlert(ALERT_ID);
        timerRef.current = null;
      }, RAIN_ALERT_DELAY_MS);
    }
  }

  function backToMaterials() {
    clearRainTimer();
    setStep("materials");
    setResourceId(null);
    setAlertOpen(false);
  }

  function openAlert() {
    markAlertRead(ALERT_ID);
    setAlertOpen(true);
  }

  function closeAlert() {
    setAlertOpen(false);
  }

  function startPlanChat() {
    markAlertRead(ALERT_ID);
    setAlertOpen(false);
    setShowFallback(false);
    setMessages([
      {
        id: "ai-weather",
        role: "ai",
        text: "비가 와서 예정된 강변 촬영은 어려울 것 같아요. 다른 장소를 제안해 드릴까요?",
      },
    ]);
    setStep("chat");
  }

  function appendExchange(userText: string, aiText: string) {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: userText },
      { id: `a-${Date.now() + 1}`, role: "ai", text: aiText },
    ]);
  }

  function handleResolved(userText: string, aiText: string) {
    appendExchange(userText, aiText);
    setDraft("");
    setShowFallback(false);
    setResolved(true);
  }

  function handleSendChat() {
    const text = draft.trim();
    if (!text) return;

    const hit = findKeywordReply(activityId, text);
    if (hit) {
      handleResolved(text, hit.reply);
      return;
    }

    appendExchange(
      text,
      "준비된 키워드와 맞지 않아요. 아래 선택지에서 고르거나 다른 말로 다시 입력해 주세요.",
    );
    setDraft("");
    setShowFallback(true);
  }

  function handleFallback(label: string, reply: string) {
    handleResolved(label, reply);
  }

  function onChatSubmit(event: FormEvent) {
    event.preventDefault();
    handleSendChat();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <ToggleCategory tone="violet">편집자</ToggleCategory>
        <h1 className={styles.headerTitle}>
          {step === "materials"
            ? "촬영 자료"
            : step === "chat"
              ? "촬영 계획"
              : selected?.title ?? "강변 촬영"}
        </h1>
      </header>

      {step === "materials" ? (
        <div className={styles.body}>
          <p className={styles.lead}>
            {startLabel} 강변 촬영에 쓸 자료를 확인하세요.
          </p>
          <ul className={styles.resourceList}>
            {resources.map((resource) => (
              <li key={resource.id}>
                <button
                  type="button"
                  className={styles.resourceCard}
                  onClick={() => openResource(resource.id)}
                >
                  <span className={styles.resourceKind}>
                    {resource.kind === "reference" ? "참고 자료" : "메모"}
                  </span>
                  <span className={styles.resourceTitle}>{resource.title}</span>
                  <span className={styles.resourcePreview}>
                    {resource.body.split("\n")[0]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === "resource" && selected ? (
        <>
          <div className={styles.body}>
            <button
              type="button"
              className={styles.back}
              onClick={backToMaterials}
            >
              자료 목록
            </button>
            <article className={styles.doc}>
              <h2 className={styles.docTitle}>{selected.title}</h2>
              <p className={styles.docBody}>{selected.body}</p>
            </article>
            {!alertFired ? (
              <p className={styles.hint}>
                자료 확인 중이에요. 잠시 후 날씨 알림이 뜰 수 있어요.
              </p>
            ) : null}
          </div>

          {alertFired && !alertOpen ? (
            <div className={styles.alertDock}>
              <ActivityAiAlert state="signal" onSignalClick={openAlert} />
            </div>
          ) : null}

          {alertFired && alertOpen ? (
            <div className={styles.alertOverlay}>
              <ActivityAiAlert
                state="expanded"
                meta="현재 날씨 · 강변 지역에 강수"
                title={alert.title}
                description={alert.body}
                actionLabel="촬영 계획 상의하기"
                onAction={startPlanChat}
                onClose={closeAlert}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {step === "chat" ? (
        <>
          <div className={styles.body}>
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
                  <ChatBubble role={message.role}>{message.text}</ChatBubble>
                </div>
              ))}
            </div>

            {showFallback ? (
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

          {resolved ? (
            <div className={styles.footer}>
              <Button fullWidth onClick={onFinish}>
                촬영 흐름 마치기
              </Button>
            </div>
          ) : (
            <form className={styles.footer} onSubmit={onChatSubmit}>
              <ChatInput
                value={draft}
                placeholder="메세지를 입력하세요"
                onChange={(event) => setDraft(event.target.value)}
                onSend={handleSendChat}
              />
            </form>
          )}
        </>
      ) : null}
    </main>
  );
}
