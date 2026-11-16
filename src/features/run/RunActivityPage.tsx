import { useEffect, useState, type FormEvent } from "react";
import {
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
  ToggleCategory,
} from "../../components";
import {
  completeActivity,
  enterActivity,
  findKeywordReply,
  fireInquiry,
  getAiAssessment,
  getAiJob,
  getAnnouncement,
  getCourses,
  getFallbackChoices,
  getFiredInquiries,
  getSelectedCourseId,
  isAiJobRequested,
  markAiJobRunning,
  requestAiJob,
  selectCourse,
  sendAnnouncement,
} from "../../data/utStore";
import { useUtSession } from "../../data/useUtSession";
import styles from "./run-activity-page.module.css";

const ACTIVITY_ID = "activity-run" as const;
const INQUIRY_ID = "inquiry-run-weather";
const JOB_ID = "job-shoot-extra";
const ANNOUNCEMENT_ID = "announcement-run-course";

type RunStep =
  | "inquiry"
  | "courses"
  | "announcement"
  | "running"
  | "chat"
  | "job";

type ChatMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
};

const COURSE_VIEW: Record<
  string,
  {
    badge: string;
    label: string;
    distance: string;
    duration: string;
    tag1: string;
    tag2: string;
  }
> = {
  "course-run-paved": {
    badge: "A",
    label: "CROXER 추천",
    distance: "5km",
    duration: "40분",
    tag1: "평탄한 포장길",
    tag2: "가로등 밝음",
  },
  "course-run-park": {
    badge: "B",
    label: "최단 거리",
    distance: "4km",
    duration: "30분",
    tag1: "공원 순환",
    tag2: "바람 적음",
  },
};

/**
 * Task 8(문의·코스·공지) → Task 9(러닝 중 레퍼런스 요청) 조립 화면.
 * App 연결은 통합 담당(예은) 범위. 미리보기용으로 App에서 잠시 마운트할 수 있다.
 */
export function RunActivityPage() {
  useUtSession();

  const [step, setStep] = useState<RunStep>("inquiry");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "ai-hello",
      role: "ai",
      text: "러닝하는 동안 도와드릴 일이 있으면 말해 주세요. 예를 들어 강변 촬영 레퍼런스 정리를 맡길 수 있어요.",
    },
  ]);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    enterActivity(ACTIVITY_ID);
    fireInquiry(INQUIRY_ID);
  }, []);

  const inquiries = getFiredInquiries(ACTIVITY_ID);
  const inquiry = inquiries[0] ?? null;
  const assessment = inquiry ? getAiAssessment(inquiry.id) : null;
  const courses = getCourses(ACTIVITY_ID);
  const selectedCourseId = getSelectedCourseId();
  const announcement = getAnnouncement(ACTIVITY_ID);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;
  const job = getAiJob(JOB_ID);
  const jobRequested = isAiJobRequested(JOB_ID);
  const fallbacks = getFallbackChoices(ACTIVITY_ID);

  function goCourses() {
    setStep("courses");
  }

  function handleSelectCourse(courseId: string) {
    selectCourse(courseId);
  }

  function goAnnouncement() {
    if (!getSelectedCourseId()) return;
    setStep("announcement");
  }

  function handleSendAnnouncement() {
    if (!sendAnnouncement(ANNOUNCEMENT_ID)) return;
    setStep("running");
  }

  function openChat() {
    setStep("chat");
    setShowFallback(false);
  }

  function appendExchange(userText: string, aiText: string) {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: userText },
      { id: `a-${Date.now() + 1}`, role: "ai", text: aiText },
    ]);
  }

  function handleReferenceRequest(userText: string, aiText: string) {
    appendExchange(userText, aiText);
    if (requestAiJob(JOB_ID)) {
      markAiJobRunning(JOB_ID);
    } else if (job.status === "queued") {
      markAiJobRunning(JOB_ID);
    }
    setDraft("");
    setShowFallback(false);
    setStep("job");
  }

  function handleSendChat() {
    const text = draft.trim();
    if (!text) return;

    const hit = findKeywordReply(ACTIVITY_ID, text);
    if (hit) {
      handleReferenceRequest(text, hit.reply);
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
    handleReferenceRequest(label, reply);
  }

  function handleComplete() {
    completeActivity(ACTIVITY_ID);
  }

  function onChatSubmit(event: FormEvent) {
    event.preventDefault();
    handleSendChat();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <ToggleCategory tone="mint">러닝 크루장</ToggleCategory>
        <h1 className={styles.headerTitle}>한강 러닝</h1>
      </header>

      {step === "inquiry" ? (
        <div className={styles.body}>
          <h2 className={styles.sectionTitle}>모임 문의</h2>
          <div className={styles.stack}>
            {inquiry ? (
              <InquiryCard
                channel="카카오톡 • 크로싱 러닝크루"
                question={inquiry.body}
                time="최근 20분"
              />
            ) : null}
            {assessment ? (
              <AiAssessmentCard
                title="오늘은 포장 코스가 안전해 보여요"
                badge="확인한 상황"
                description={assessment.body}
                actionLabel="대체 코스 보기"
                onAction={goCourses}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {step === "courses" ? (
        <>
          <div className={styles.body}>
            <h2 className={styles.sectionTitle}>대체 코스</h2>
            <div className={styles.courseList}>
              {courses.map((course) => {
                const view = COURSE_VIEW[course.id];
                return (
                  <CourseSelectCard
                    key={course.id}
                    selected={selectedCourseId === course.id}
                    badge={view?.badge ?? "·"}
                    label={view?.label ?? "코스"}
                    title={course.name}
                    distance={view?.distance ?? ""}
                    duration={view?.duration ?? ""}
                    tag1={view?.tag1 ?? ""}
                    tag2={view?.tag2 ?? ""}
                    description={course.description}
                    onClick={() => handleSelectCourse(course.id)}
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
              이 코스로 공지 작성
            </Button>
          </div>
        </>
      ) : null}

      {step === "announcement" && announcement ? (
        <>
          <div className={styles.body}>
            <h2 className={styles.sectionTitle}>변경 공지</h2>
            <AnnouncementDraftCard
              channel="카카오톡 • 크로싱 러닝크루"
              title="오늘 19:00 러닝 코스 변경"
              body={announcement.body}
              time="오늘 19:00"
              location={announcement.meetingPoint || "집결지 미정"}
              courseTitle={selectedCourse?.name ?? "선택한 코스"}
              courseMeta={
                selectedCourse
                  ? `${COURSE_VIEW[selectedCourse.id]?.distance ?? ""} · ${COURSE_VIEW[selectedCourse.id]?.duration ?? ""}`
                  : ""
              }
            />
          </div>
          <div className={styles.footer}>
            <Button
              fullWidth
              disabled={announcement.status === "simulated_sent"}
              onClick={handleSendAnnouncement}
            >
              {announcement.status === "simulated_sent"
                ? "공지 전송 완료"
                : "카카오톡으로 보내기"}
            </Button>
          </div>
        </>
      ) : null}

      {step === "running" ? (
        <>
          <RunMeter
            phase="running"
            time="00:05:40"
            distance="0.8km"
            pace="5:40"
            avgPace="5:45"
            bpm="148"
            progress={0.12}
          />
          {jobRequested ? (
            <AiJobToast
              tone={job.status === "completed" ? "done" : "ack"}
              message={
                job.status === "completed"
                  ? "레퍼런스 정리가 완료됐어요"
                  : "정리가 끝나면 알려드릴게요."
              }
              actionLabel="작업 완료"
              onAction={openChat}
            />
          ) : null}
          <div className={styles.footer}>
            <Button fullWidth onClick={openChat}>
              채팅 열기
            </Button>
          </div>
        </>
      ) : null}

      {step === "chat" || step === "job" ? (
        <>
          <div className={styles.body}>
            <div className={styles.chatList}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={[
                    styles.chatRow,
                    message.role === "user" ? styles.chatRowUser : styles.chatRowAi,
                  ].join(" ")}
                >
                  <ChatBubble role={message.role}>{message.text}</ChatBubble>
                </div>
              ))}
            </div>

            {step === "job" && jobRequested ? (
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
            ) : null}

            {showFallback && step === "chat" ? (
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

          {step === "chat" ? (
            <form className={styles.footer} onSubmit={onChatSubmit}>
              <ChatInput
                value={draft}
                placeholder="레퍼런스 정리 요청하기"
                onChange={(event) => setDraft(event.target.value)}
                onSend={handleSendChat}
              />
            </form>
          ) : (
            <div className={styles.footer}>
              <Button fullWidth onClick={handleComplete}>
                러닝 마치기
              </Button>
            </div>
          )}
        </>
      ) : null}
    </main>
  );
}
