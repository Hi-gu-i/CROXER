import type { InsightTableRow } from "../../components";
import detail1 from "./assets/detail-1.png";
import extraA from "./assets/extra-a.png";
import extraB from "./assets/extra-b.jpg";
import extraC from "./assets/extra-c.jpg";
import set1B from "./assets/set1-b.png";
import set1C from "./assets/set1-c.png";
import set2A from "./assets/set2-a.png";
import set2B from "./assets/set2-b.png";
import set2C from "./assets/set2-c.png";

export const REFERENCE_ID = "resource-shoot-reference";
export const MEMO_ID = "resource-shoot-memo";
export const EXTRA_ID = "resource-shoot-extra";

export type ShootDetailSlide = {
  image: string;
  title: string;
  description: string;
  noteSource: string;
  noteDate: string;
  noteTitle: string;
  noteBody: string;
  insightTitle: string;
  insightRows: InsightTableRow[];
};

export type ShootDetailSet = {
  headerTitle: string;
  slides: ShootDetailSlide[];
};

/** 시안 `02 · 강변 촬영` — 풍경 속 사람들 · 강가의 동물들 */
export const SHOOT_DETAIL_SETS: Record<string, ShootDetailSet> = {
  [REFERENCE_ID]: {
    headerTitle: "풍경 속 사람들",
    slides: [
      {
        image: detail1,
        title: "자전거를 타고 지나는 사람들",
        description: "강변을 넓게 담고, 아래쪽에 자전거를 타는 사람들 담기",
        noteSource: "Notion • 여행 콘텐츠 기획 page ↗",
        noteDate: "2026.10.05",
        noteTitle: "내 촬영 메모",
        noteBody:
          "사람을 화면 가득 담기보다 아래부분에 작게\n자전거를 타고 바람에 휘날리는 머리칼이 잘 담기게 찍기",
        insightTitle: "촬영 포인트",
        insightRows: [
          { label: "구도", value: "강과 산책로를 넓게, 인물은 아래쪽에" },
          { label: "움직임", value: "화면에 들어와 빠져나갈 때까지" },
          { label: "분위기", value: "연출보다 일상적인 순간 포착" },
        ],
      },
      {
        image: set1B,
        title: "노을 지는 강변 스카이라인",
        description: "다리와 도시를 배경으로 넓은 강 풍경을 담기",
        noteSource: "Notion • 여행 콘텐츠 기획 page ↗",
        noteDate: "2026.10.05",
        noteTitle: "내 촬영 메모",
        noteBody:
          "하늘 색이 바뀔 때를 기다려 한 컷에 강과 도시를 같이 담기\n실루엣이 너무 뭉개지지 않게 노출을 살짝 밝게",
        insightTitle: "촬영 포인트",
        insightRows: [
          { label: "구도", value: "수평선을 낮게, 하늘 비중을 크게" },
          { label: "움직임", value: "고정 화면으로 빛의 변화를 받기" },
          { label: "분위기", value: "하루가 저무는 고요한 톤" },
        ],
      },
      {
        image: set1C,
        title: "언덕에 앉은 사람들",
        description: "멀리 도시를 바라보는 뒷모습을 여백과 함께 담기",
        noteSource: "Notion • 여행 콘텐츠 기획 page ↗",
        noteDate: "2026.10.05",
        noteTitle: "내 촬영 메모",
        noteBody:
          "인물은 작게, 앞쪽 풀과 뒤쪽 도시 빛을 같이 보이게\n대화 소리보다 바람 소리가 남도록 길게 찍기",
        insightTitle: "촬영 포인트",
        insightRows: [
          { label: "구도", value: "인물을 하단에, 도심 빛을 배경에" },
          { label: "움직임", value: "거의 고정, 고개 돌림만 받기" },
          { label: "분위기", value: "하루를 마무리하는 여운" },
        ],
      },
    ],
  },
  [MEMO_ID]: {
    headerTitle: "강가의 동물들",
    slides: [
      {
        image: set2A,
        title: "물결 위의 흰 오리",
        description: "물결 무늬를 살리고 오리를 화면 중앙 가까이에 담기",
        noteSource: "Notion • 여행 콘텐츠 기획 page ↗",
        noteDate: "2026.10.05",
        noteTitle: "내 촬영 메모",
        noteBody:
          "물결이 동그랗게 퍼질 때를 기다려 한 박자 늦게 셔터\n깃털 디테일이 죽지 않게 너무 어둡게 찍지 않기",
        insightTitle: "촬영 포인트",
        insightRows: [
          { label: "구도", value: "물결을 넓게, 피사체는 살짝 아래" },
          { label: "움직임", value: "헤엄치며 지나갈 때까지 따라가기" },
          { label: "분위기", value: "잔잔하고 가까운 관찰감" },
        ],
      },
      {
        image: set2B,
        title: "나뭇가지 위 새들",
        description: "나무 사이로 날아오르는 순간을 아래에서 올려 담기",
        noteSource: "Notion • 여행 콘텐츠 기획 page ↗",
        noteDate: "2026.10.05",
        noteTitle: "내 촬영 메모",
        noteBody:
          "잎 사이로 하늘이 비치게 두고 새의 움직임을 먼저 잡기\n초점이 나뭇잎에만 가지 않게 피사체를 따라가기",
        insightTitle: "촬영 포인트",
        insightRows: [
          { label: "구도", value: "아래에서 올려, 나뭇가지 프레임" },
          { label: "움직임", value: "날아오르는 궤적을 짧게 따라가기" },
          { label: "분위기", value: "숲과 강가의 생동감" },
        ],
      },
      {
        image: set2C,
        title: "연못의 잉어",
        description: "수면 위 연잎과 헤엄치는 잉어를 위에서 내려다보기",
        noteSource: "Notion • 여행 콘텐츠 기획 page ↗",
        noteDate: "2026.10.05",
        noteTitle: "내 촬영 메모",
        noteBody:
          "주황·흰 무늬가 겹칠 때를 노려 색 대비를 살리기\n연잎이 너무 많지 않은 틈을 찾아 구도 잡기",
        insightTitle: "촬영 포인트",
        insightRows: [
          { label: "구도", value: "위에서 내려다보는 평면 구도" },
          { label: "움직임", value: "무리의 흐름이 지나갈 때까지" },
          { label: "분위기", value: "색감이 돋보이는 고요한 수면" },
        ],
      },
    ],
  },
  /** 러닝 AI 작업 결과 · 노을진 풍경 */
  [EXTRA_ID]: {
    headerTitle: "노을진 풍경",
    slides: [
      {
        image: extraA,
        title: "바다 너머로 지는 노을",
        description: "비 온 뒤 반사광과 빛줄기를 살린 광활한 수면 컷",
        noteSource: "AI 작업 결과",
        noteDate: "오늘",
        noteTitle: "편집 레퍼런스",
        noteBody:
          "비 온 뒤 강변의 반사광을 살린 영상 구성\n수평선을 낮게 두고 하늘 빛줄기를 길게 받기",
        insightTitle: "편집 포인트",
        insightRows: [
          { label: "구도", value: "수평선을 낮게, 하늘 비중을 크게" },
          { label: "빛", value: "반사광과 빛줄기 대비를 유지" },
          { label: "분위기", value: "비 온 뒤의 차분한 톤" },
        ],
      },
      {
        image: extraB,
        title: "다리 사이로 지는 해",
        description: "강과 다리를 한 프레임에 담아 도시의 하루를 마무리",
        noteSource: "AI 작업 결과",
        noteDate: "오늘",
        noteTitle: "편집 레퍼런스",
        noteBody:
          "산책로 장면을 길게 이어 붙이는 컷 편집 방식\n수면 반사를 세로로 이어 리듬을 만들기",
        insightTitle: "편집 포인트",
        insightRows: [
          { label: "구도", value: "다리 실루엣을 중앙에" },
          { label: "리듬", value: "수면 반사를 세로로 잇기" },
          { label: "분위기", value: "하루가 저무는 고요한 톤" },
        ],
      },
      {
        image: extraC,
        title: "풀밭에서 바라본 강변",
        description: "인물 실루엣과 노을 강변을 함께 담은 여유로운 장면",
        noteSource: "AI 작업 결과",
        noteDate: "오늘",
        noteTitle: "편집 레퍼런스",
        noteBody:
          "비 오는 날의 차분한 톤을 살리는 색 보정 예시\n인물은 작게, 강과 다리 빛을 배경에 두기",
        insightTitle: "편집 포인트",
        insightRows: [
          { label: "구도", value: "인물을 하단에, 강·다리를 배경에" },
          { label: "색", value: "따뜻한 골드 톤을 유지" },
          { label: "분위기", value: "여유롭고 가까운 관찰감" },
        ],
      },
    ],
  },
};
