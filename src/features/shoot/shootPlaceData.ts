import place1 from "./assets/place-1.png";
import set1A from "./assets/set1-a.png";
import set2A from "./assets/set2-a.png";

export type ShootPlace = {
  id: string;
  name: string;
  status: string;
  hours: string;
  distance: string;
  walkTime: string;
  address: string;
  insight: string;
  imageSrc: string;
  /** 마커 중심 · 393 프레임 기준 % */
  marker: { left: number; top: number };
};

/**
 * `06 · 지도 채팅` 추천 장소 3곳.
 * 1번은 시안 문구·좌표, 2·3번은 같은 강변 대안 UT 제안값.
 */
export const SHOOT_PLACES: readonly ShootPlace[] = [
  {
    id: "place-bookstore",
    name: "여울너머 책방",
    status: "영업중",
    hours: "19:00 까지",
    distance: "350m",
    walkTime: "도보 10분",
    address: "서울 성동구 사근동12길 4 1층",
    insight: "기존 촬영 분위기를 유지할 수 있어요",
    imageSrc: place1,
    // Figma Plugin 선택점 · Ellipse 5439 (280, 357)
    marker: { left: (280 / 393) * 100, top: (357 / 852) * 100 },
  },
  {
    id: "place-studio",
    name: "물결 전망 스튜디오",
    status: "영업중",
    hours: "21:00 까지",
    distance: "480m",
    walkTime: "도보 12분",
    address: "서울 성동구 왕십리로 89",
    insight: "통유리로 비 오는 강변을 실내에서 담을 수 있어요",
    imageSrc: set1A,
    // Figma Plugin icon - 2 — 살짝 오른쪽으로 두어 선택 캡슐이 안쪽에 오게
    marker: { left: (56 / 393) * 100, top: (241 / 852) * 100 },
  },
  {
    id: "place-arcade",
    name: "사근 아케이드 갤러리",
    status: "영업중",
    hours: "20:00 까지",
    distance: "620m",
    walkTime: "도보 15분",
    address: "서울 성동구 사근동 10길 12",
    insight: "비를 피하면서 따뜻한 실내 조명을 활용할 수 있어요",
    imageSrc: set2A,
    // Figma Plugin icon - 3 (94, 426)
    marker: { left: (94 / 393) * 100, top: (426 / 852) * 100 },
  },
];
