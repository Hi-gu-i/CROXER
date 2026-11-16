import {
  AiJobCard,
  AiJobToast,
  AnnouncementDraftCard,
  CourseSelectCard,
  InquiryCard,
  AiAssessmentCard,
  RunMeter,
  SectionIntro,
  StatusResult,
  Button,
  ChatBubble,
  ChatInput,
} from "./components";
import styles from "./App.module.css";

/**
 * 통합 담당(예은) 소유 파일.
 * Task 8·9 부품 미리보기용. 홈·탭바 틀이 준비되면 활동 진입 경로로 교체한다.
 */
export default function App() {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Task 9 부품</h1>

      <section className={styles.section}>
        <h2 className={styles.label}>RunMeter · idle</h2>
        <RunMeter phase="idle" progress={0} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>RunMeter · running</h2>
        <RunMeter
          phase="running"
          time="00:00:59"
          distance="0.16km"
          pace="5:55"
          avgPace="6:00"
          bpm="134"
          progress={0.25}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>AiJobToast</h2>
        <AiJobToast
          tone="ack"
          message="정리가 끝나면 알려드릴게요."
          actionLabel="작업 완료"
        />
        <AiJobToast
          tone="done"
          message="레퍼런스 정리가 완료됐어요"
          actionLabel="작업 완료"
        />
        <AiJobToast
          tone="ack"
          message="정리가 끝나면 알려드릴게요."
          actionLabel="작업 상세"
          showActionChevron
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>ChatBubble · ChatInput · AiJobCard (기존)</h2>
        <ChatBubble role="user">
          러닝하는 동안 내일 강변 촬영에서 쓸 레퍼런스 찾아서 추가해 줘
        </ChatBubble>
        <ChatBubble role="ai">
          기존 촬영 메모를 기준으로 레퍼런스를 찾고 ‘강변 촬영’ 페이지에 정리해
          둘게요
        </ChatBubble>
        <AiJobCard
          title="강변 촬영 레퍼런스 정리"
          status="현재 레퍼런스를 찾고 있어요"
          steps={[
            { label: "촬영 메모 확인", state: "done" },
            { label: "레퍼런스 탐색", state: "todo" },
            { label: "선별 및 정리", state: "todo" },
          ]}
        />
        <ChatInput placeholder="메세지를 입력하세요" />
      </section>

      <h1 className={styles.heading}>Task 8 부품</h1>

      <section className={styles.section}>
        <h2 className={styles.label}>InquiryCard · AiAssessmentCard</h2>
        <InquiryCard
          channel="카카오톡 • 크로싱 러닝크루"
          question="비가 오는데 오늘 러닝 코스는 그대로 진행하나요?"
          time="최근 20분"
        />
        <AiAssessmentCard
          title="오늘 달리기 좋은 대체 코스를 찾아뒀어요"
          badge="확인한 상황"
          description="러닝 시간에는 비가 그칠 예보예요. 다만 흙길은 젖어 있을 수 있어서 대체 코스를 찾아뒀어요."
          actionLabel="코스 확인"
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>SectionIntro + CourseSelectCard</h2>
        <SectionIntro
          title={"시간과 집결지는 그대로,\n코스만 골라주세요"}
          description="젖은 흙길을 피해 달릴 코스 2곳을 찾았어요"
        />
        <CourseSelectCard
          selected
          badge="A"
          label="CROXER 추천"
          title="공원 순환 코스"
          distance="4.2km"
          duration="약 45분"
          tag1="평탄한 포장길"
          tag2="공원 순환"
          description="공원 포장길로, 크루가 함께 달리기 편해요."
        />
        <Button fullWidth>코스 선택하기</Button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>AnnouncementDraftCard · StatusResult</h2>
        <AnnouncementDraftCard
          channel="카카오톡 • 크로싱 러닝크루"
          title="오늘 러닝 코스를 변경합니다"
          body="오늘 러닝은 예정대로 진행합니다. 강변 흙길이 젖어 있을 수 있어 공원 순환 A코스로 변경해요."
          time="오늘 19:00"
          location="여의도공원 문화의마당"
          courseTitle="공원 순환 A코스"
          courseMeta="4.2km • 약 45분"
        />
        <StatusResult
          title="변경된 소식을 전송했어요"
          description={
            "선택한 코스와 집결 안내, 경로 지도를\n크로싱 러닝크루 단톡방에 함께 보냈어요"
          }
        />
      </section>
    </main>
  );
}
