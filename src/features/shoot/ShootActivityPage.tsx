import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ActivityAiAlert,
  ActivityHeader,
  Button,
  ChatBubble,
  ChatInput,
  ChatResultCard,
  ResourceSetCard,
  StatusBar,
} from "../../components";
import type { ActivityId, FallbackChoice } from "../../data/types";
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
import { IconAi } from "../../icons";
import chatBgGradient from "./assets/chat-bg-gradient.png";
import set1A from "./assets/set1-a.png";
import set1B from "./assets/set1-b.png";
import set1C from "./assets/set1-c.png";
import set2A from "./assets/set2-a.png";
import set2B from "./assets/set2-b.png";
import set2C from "./assets/set2-c.png";
import { ShootMapChat } from "./ShootMapChat";
import {
  getShootDetailHeaderTitle,
  ShootResourceDetail,
} from "./ShootResourceDetail";
import { MEMO_ID, REFERENCE_ID } from "./shootDetailData";
import { SHOOT_PLACES } from "./shootPlaceData";
import styles from "./shoot-activity-page.module.css";

const ALERT_ID = "alert-shoot-rain";
/** UT 베이스라인: 촬영 자료 진입 후 기본 10초 */
const RAIN_ALERT_DELAY_MS = 10_000;
/** `05 · 추천 결과` — 다른 장소 찾기 / 장소 키워드 */
const PLACE_CHOICE_ID = "choice-shoot-indoor";
const PLACE_REPLY_ID = "reply-shoot-indoor";
const PLACE_RESULT = {
  title: "추천 장소 3곳을 찾았어요",
  description: "비를 피하면서 기존 촬영 분위기를 이어갈 수 있는 곳이에요",
  actionLabel: "추천 장소 보러가기",
} as const;

/** 시안 `01 · 편집자 자료` 콜라주 6장 · 세트당 좌·우상·우하 */
const SET_IMAGES: Record<string, readonly [string, string, string]> = {
  [REFERENCE_ID]: [set1A, set1B, set1C],
  [MEMO_ID]: [set2A, set2B, set2C],
};

/** 시안 `01 · 편집자 자료` 세트 칩·캡션 */
const SET_LABELS: Record<string, { title: string; caption: string }> = {
  [REFERENCE_ID]: {
    title: "풍경 속 사람들",
    caption: "12장의 레퍼런스 이미지",
  },
  [MEMO_ID]: {
    title: "강가의 동물들",
    caption: "8장의 레퍼런스 이미지",
  },
};

function formatTodayTime(startsAt: string) {
  return `오늘 ${startsAt.slice(11, 16)}`;
}

type ShootStep = "materials" | "resource" | "chat" | "map";

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
      kind: "placeResult";
    };

type ShootActivityPageProps = {
  activityId: ActivityId;
  /** 활동의 UT 흐름을 마쳤을 때 한 번 부른다. 완료 처리와 전환 패널은 App이 맡는다 */
  onFinish: () => void;
  /** Header 홈 버튼. App이 홈 탭으로 돌릴 때 넘긴다 */
  onHome?: () => void;
};

/**
 * Task 6 강변 촬영.
 * 원본 `01 · 편집자 자료` → `02 · 강변 촬영` → `03 · 촬영·AI 알림` → `04 · 장소 제안` → `06 · 지도 채팅`.
 * 일정 교체(§05)는 첫 UT 제외.
 */
export function ShootActivityPage({
  activityId,
  onFinish,
  onHome,
}: ShootActivityPageProps) {
  useUtSession();

  const [step, setStep] = useState<ShootStep>("materials");
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [resolved, setResolved] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const resources = getResources(activityId).filter(
    (resource) => resource.kind !== "ai_result",
  );
  const startLabel = formatTodayTime(getScheduleByActivity(activityId).startsAt);
  const selected = resources.find((item) => item.id === resourceId) ?? null;
  const alert = getAlert(ALERT_ID);
  const fallbacks = getFallbackChoices(activityId);
  const detailTitle =
    resourceId != null ? getShootDetailHeaderTitle(resourceId) : "편집자";

  function clearRainTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function scheduleRainAlert() {
    if (isAlertFired(ALERT_ID) || timerRef.current !== null) return;
    timerRef.current = window.setTimeout(() => {
      fireAlert(ALERT_ID);
      markAlertRead(ALERT_ID);
      setAlertOpen(true);
      timerRef.current = null;
    }, RAIN_ALERT_DELAY_MS);
  }

  function openResource(id: string) {
    setResourceId(id);
    setStep("resource");
    setAlertOpen(false);
    scheduleRainAlert();
  }

  function backToMaterials() {
    clearRainTimer();
    setStep("materials");
    setResourceId(null);
    setAlertOpen(false);
  }

  /** Header IconAi — 비 알림 펼침 */
  function openRainAlert() {
    fireAlert(ALERT_ID);
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

  function appendPlaceResult(userText: string) {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: userText },
      { id: `a-${Date.now() + 1}`, role: "ai", kind: "placeResult" },
    ]);
    setDraft("");
    setShowFallback(false);
    setResolved(false);
  }

  /** `05` 추천 카드 → `06 · 지도 채팅` */
  function openPlaceMap() {
    setSelectedPlaceId(SHOOT_PLACES[0]?.id ?? null);
    setStep("map");
  }

  function selectPlace(placeId: string) {
    setSelectedPlaceId(placeId);
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
      if (hit.id === PLACE_REPLY_ID) {
        appendPlaceResult(text);
        return;
      }
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

  function handleFallback(choice: FallbackChoice) {
    if (choice.id === PLACE_CHOICE_ID) {
      appendPlaceResult(choice.label);
      return;
    }
    handleResolved(choice.label, choice.reply);
  }

  function onChatSubmit(event: FormEvent) {
    event.preventDefault();
    handleSendChat();
  }

  const isDetail = step === "resource" && selected != null;
  const isChat = step === "chat";
  const isMap = step === "map";

  return (
    <main
      className={[
        styles.page,
        isChat ? styles.pageChat : "",
        isMap ? styles.pageMap : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isChat ? (
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

      <StatusBar />
      <ActivityHeader
        roleLabel={isDetail ? detailTitle : "편집자"}
        roleTone={isDetail ? "neutral" : "violet"}
        showRoleIcon={!isDetail}
        showAi={!isChat && !isMap}
        trailing={isDetail ? "close" : "home"}
        onAiClick={openRainAlert}
        onHomeClick={onHome}
        onCloseClick={backToMaterials}
      />

      {step === "materials" ? (
        <div className={styles.body}>
          <h1 className={styles.visuallyHidden}>촬영 자료</h1>
          <p className={styles.lead}>
            {startLabel} 강변 촬영에 쓸 자료를 확인하세요.
          </p>
          <div className={styles.setList}>
            {resources.map((resource) => {
              const labels = SET_LABELS[resource.id] ?? {
                title: resource.title,
                caption:
                  resource.kind === "reference" ? "참고 자료" : "메모",
              };
              return (
                <ResourceSetCard
                  key={resource.id}
                  title={labels.title}
                  caption={labels.caption}
                  images={SET_IMAGES[resource.id]}
                  onClick={() => openResource(resource.id)}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {isDetail ? (
        <div className={styles.detailBody}>
          <ShootResourceDetail resourceId={selected.id} />
        </div>
      ) : null}

      {alertOpen ? (
        <div className={styles.alertOverlay}>
          <ActivityAiAlert
            state="expanded"
            meta="현재 날씨 • 강변 지역에 강수"
            title={alert.title}
            description={alert.body}
            actionLabel="촬영 계획 상의하기"
            onAction={startPlanChat}
            onClose={closeAlert}
          />
        </div>
      ) : null}

      {isChat ? (
        <>
          <div className={[styles.body, styles.chatBody].join(" ")}>
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
                  {message.kind === "placeResult" ? (
                    <div className={styles.chatAiBlock}>
                      <span className={styles.chatAiAvatar} aria-hidden="true">
                        <IconAi size={22} />
                      </span>
                      <ChatResultCard
                        title={PLACE_RESULT.title}
                        description={PLACE_RESULT.description}
                        actionLabel={PLACE_RESULT.actionLabel}
                        onAction={openPlaceMap}
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

            {showFallback ? (
              <div className={styles.fallback}>
                <p className={styles.fallbackLabel}>선택지</p>
                {fallbacks.map((choice) => (
                  <Button
                    key={choice.id}
                    variant="secondary"
                    fullWidth
                    onClick={() => handleFallback(choice)}
                  >
                    {choice.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          {resolved ? (
            <div className={[styles.footer, styles.chatFooter].join(" ")}>
              <Button fullWidth onClick={onFinish}>
                촬영 흐름 마치기
              </Button>
            </div>
          ) : (
            <form
              className={[styles.footer, styles.chatFooter].join(" ")}
              onSubmit={onChatSubmit}
            >
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

      {isMap ? (
        <>
          <div className={styles.mapLayer}>
            <ShootMapChat
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={selectPlace}
            />
          </div>
          <div className={[styles.footer, styles.mapFooter].join(" ")}>
            <ChatInput
              value={draft}
              placeholder="메세지를 입력하세요"
              onChange={(event) => setDraft(event.target.value)}
              onSend={() => undefined}
            />
          </div>
        </>
      ) : null}
    </main>
  );
}
