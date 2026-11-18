# CROXER UI 가이드

CROXER 화면의 색, 간격, 둥글기, 글자, 그림자를 MYA 디자인 토큰으로 맞추는 기준이다. 화면을 만들거나 고치는 팀원과 AI는 이 문서의 토큰만 쓰고, 값(`#4146fd`, `16px`)을 직접 적지 않는다. 토큰 이름을 그대로 쓰면 Figma Foundation의 스타일 가이드와 같은 결과가 나온다.

색은 Figma에 등록된 Color Primitive, Color Semantic 변수를 따른다. 글자는 로컬 텍스트 스타일 `ios/*`, `mac/*`, 그림자와 유리 효과는 로컬 효과 스타일을 따른다. 스타일 가이드의 색 칩은 변수에 연결되어 있고, 칩의 이름과 hex는 이 문서의 값과 같다.

원본은 Figma 파일 `🤖 MYA_Design-System`, Foundation 페이지의 `style guide`다. 코드에서 쓰는 파일은 [`tokens/design-tokens.css`](../tokens/design-tokens.css)이고, 토큰 파일의 출처와 변환 규칙은 [`tokens/README.md`](../tokens/README.md)에 있다.

## 공통 UI 부품

둘 이상 화면에서 쓰는 부품은 `src/components/`에 둔다. 값은 hex·px로 적지 않고 아래 토큰만 쓴다.

| 부품 | 파일 | 기준 |
| --- | --- | --- |
| `Button` | `Button.tsx` | DS `Button`. `primary`는 `--color-bg-brand`, 높이·패딩은 `--padding-300`, 모서리는 `--radius-control` |
| `Card` | `Card.tsx` | 표면 카드. 크기 `sm`/`md`/`lg`는 `--radius-card-*`, `--padding-card-*`, 그림자는 `--shadow-card` |
| `Tag` | `Tag.tsx` | DS `Tag`. 일정 카드 역할 라벨. 패딩 4×12, 13/18. `tone`=neutral/yellow/violet/blue/mint |
| `ContextChip` | `ContextChip.tsx` | 활동 본문 맥락 칩(채널·자료명 등). `tone=brand`/`muted`. `Tag`·`ToggleCategory`와 별개 |
| `ToggleCategory` | `ToggleCategory.tsx` | **활동 화면 상단** 역할 토글. `01 · 편집자 자료` 기준. `tone`=yellow(교양/학생)/violet(편집자)/mint(러닝 크루장). Label+Assets `IconToggle` |
| `RoleTransitionPanel` | `RoleTransitionPanel.tsx` | DS 원본 활동 전환 패널(보관). `phase=before`/`countdown`. **앱 셸에는 ① `RoleSwitchPanel`을 연결한다** |
| `ScheduleListCard` | `ScheduleListCard.tsx` | 브리핑·스케줄·리포트 일정/리스트 카드(315×102). `trailing=handle\|status`, `tag`/`title`/`description`/`status` 교체. Assets `CardScheCompa`와 별개 |
| `ChatBubble` | `ChatBubble.tsx` | 04 장소 제안 · 05 일정 조정 대화 말풍선. `role=ai\|user`, `shape=bubble\|pill`. 문구는 children으로 교체 |
| `ChatInput` | `ChatInput.tsx` | 같은 채팅 입력창. `placeholder`/`value` 교체. 보내기는 Assets `IconArrowU` |
| `CourseSelectCard` | `CourseSelectCard.tsx` | 06 러닝 A/B 코스 카드. `selected`로 A·B 색/이펙트 전환. `badge`/`label`/`title`/`distance`/`duration`/`tag1`/`tag2`/`description` 교체 |
| `AnnouncementDraftCard` | `AnnouncementDraftCard.tsx` | 06 러닝 공지 초안. 받는사람·채널 + 본문 카드(title/body/time/location) + 코스 미리보기. `channel`/`title`/`body`/`time`/`location`/`courseTitle`/`courseMeta`/`mapSrc` 교체 |
| `InquiryCard` | `InquiryCard.tsx` | 06 러닝 크루원 문의 카드(스택). `channel`/`question`/`time`/`originalLabel` 교체. 문의·AI 판단은 출처가 다름 |
| `AiAssessmentCard` | `InquiryCard.tsx` | 같은 흐름의 AI 판단 카드. `title`/`badge`/`description`/`actionLabel` 교체. 홈·활동 범용 `ActivityAiAlert`와 구분 |
| `AiJobCard` | `AiJobCard.tsx` | 08 레퍼런스 작업 카드. `title`/`status`/`steps`/`storageLabel`/`storagePath` 교체. 스텝 `state=done\|todo`, path chevron=Assets `IconRight` |
| `AiAlertCapsule` | `AiAlertCapsule.tsx` | **홈** AI 알림. 접힘=`04` `ai 아이콘`, 펼침=`05` `펼친 ai 아이콘`. DS `HolderAi`·`IconAi`와 다름 |
| `ActivityAiAlert` | `ActivityAiAlert.tsx` | **활동** AI 알림. `signal`=펼침 준비, `expanded`=공통 카드. 문구는 `meta`/`title`/`description`/`action`으로 교체(촬영·러닝·녹음 시나리오 복제 없음) |
| `ResourceSetCard` | `ResourceSetCard.tsx` | Task 6 자료 목록 세트. `title`/`caption`/`media`. 원본 `01 · 편집자 자료` |
| `ResourceNoteCard` | `ResourceNoteCard.tsx` | 자료 메모 블록. `source`/`date`/`title`/`body`. 원본 「내 촬영 메모」 |
| `ShotPoint` | `ShotPoint.tsx` | 촬영 장면 포인트. `index`/`title`/`description` |
| `InsightTableCard` | `InsightTableCard.tsx` | 인사이트 표 카드. `title`/`rows[{label,value}]`. 원본 `CardCroxer` 역할(Assets 화면 조립과 별개) |
| `SectionIntro` | `SectionIntro.tsx` | 활동 본문 상단 안내. `title`/`description`. Task 8 코스·공지 인트로 |
| `StatusResult` | `StatusResult.tsx` | 완료·전송 결과. `title`/`description`/`icon`. 기본 아이콘=`ResImgSend`. Task 8 공지 전송 완료 |
| `RunMeter` | `RunMeter.tsx` | 러닝 측정 패널. `time`/`distance`/`pace`/`avgPace`/`bpm`/`phase`/`progress`. Task 9 원본 |
| `AiJobToast` | `AiJobToast.tsx` | AI 작업 상태 토스트. `tone=ack\|done`, `message`/`actionLabel`. Task 9 원본 |

홈 전용 큰 카드(`CardMain`)·일정 비교 카드(`CardScheCompa`) 등은 화면 전용 조합이므로 공통 폴더에 두지 않는다. 활동 전환은 앱에서 통합 담당의 `src/features/role-switch/RoleSwitchPanel`을 쓰고, DS 원본 `RoleTransitionPanel`은 `src/components/`에 보관한다.

## Assets (Icons)

MYA Design System Icon 페이지(`111:2`)에 등록된 아이콘은 `src/icons/`에 둔다. 화면·컴포넌트에서는 인라인 SVG를 새로 그리지 말고 여기서 import한다.

```ts
import { IconHome, IconAi, IconToggle } from "../icons";

<IconHome size={24} />           // 기본 24
<IconToggle size={16} />         // 슬롯에 맞게 size
```

- `fill`은 `currentColor`다. 부모 `color` 또는 `--color-icon-*` 토큰으로 맞춘다.
- `IconDefault`는 Figma에서 빈 플레이스홀더라 빈 SVG로 등록했다.
- 목록·타입: `iconNames`, `IconName`, `IconProps`를 `src/icons`에서 export한다.

| 모듈 | 파일 | 기준 |
| --- | --- | --- |
| Icons | `src/icons/*` | DS Icon 페이지 전체(45). `createIcon` 래퍼 + 개별 `Icon*.tsx` + `index.ts` |

## Assets (Resource · ResImg)

MYA Design System Resource 페이지의 일러스트 슬롯은 **64×56**이다(`ResImgGroup`·`ResImgWrite`와 동일). `src/res-img/`에 두고 import한다.

```ts
import { ResImgCamera, ResImgSend } from "../res-img";

<ResImgCamera />                 // 기본 64×56
<ResImgSend size={48} />         // 가로 기준, 세로는 56/64 비율
```

- 색이 포함된 일러스트라 `currentColor`를 쓰지 않는다.
- `StatusResult` 기본 아이콘은 `ResImgSend`다.
- 목록·타입: `resImgNames`, `ResImgName`, `ResImgProps`를 `src/res-img`에서 export한다.

| 모듈 | 파일 | 기준 |
| --- | --- | --- |
| ResImg | `src/res-img/*` | DS Resource `ResImgCamera`·`File`·`Card`·`Send`·`Calendar` (64×56) |

## 파일을 연결한다

토큰은 앱 전체에 적용되는 `src/index.css` 맨 위에서 한 번만 불러온다. 기능 폴더의 CSS나 컴포넌트에서는 다시 불러오지 않고 `var(--…)`로 바로 쓴다.

```css
/* src/index.css 맨 위 */
@import "../tokens/design-tokens.css";
```

`src/index.css`는 여러 작업이 함께 쓰는 전역 CSS다. 이 연결을 추가하거나 바꿀 때는 [개발 가이드](dev-guide.md)에 따라 통합 담당과 순서를 맞추고, `npm run build`와 실제 화면에서 토큰과 글꼴이 적용되는지 확인한다.

글꼴 가족은 `Wanted Sans`다. `design-tokens.css`가 맨 위에서 Wanted Sans 웹폰트(v1.0.3, jsDelivr)를 불러오므로, 토큰 파일만 연결하면 폰트가 설치되지 않은 방문자에게도 같은 글꼴로 보인다. 폰트를 따로 로드하거나 다른 웹폰트 링크를 추가하지 않는다.

웹폰트는 글자 범위별로 나뉘어 있어서 브라우저는 화면에 쓰인 글자 묶음만 받는다. 첫 화면에서 글꼴이 늦게 바뀌는 것이 보이면 `index.html`의 `<head>`에 아래 줄을 넣는다. `index.html`도 공용 파일이므로 통합 담당과 확인한다.

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
```

웹폰트를 불러오지 못하면 `sans-serif`로 보인다. 오프라인 환경이나 외부 CDN을 쓸 수 없는 배포 환경이라면 폰트 파일을 프로젝트에 넣고 이 `@import` 주소를 그 경로로 바꾼다.

## 두 층으로 고른다

토큰은 두 층이다.

| 층 | 이름 예 | 쓰는 곳 |
| --- | --- | --- |
| Primitive | `--color-blue-600`, `--padding-300`, `--radius-200` | 팔레트와 스케일. 화면 CSS에 직접 쓰지 않는다. |
| Semantic | `--color-brand-default`, `--padding-card-md`, `--radius-card-md` | 버튼, 카드, 본문처럼 역할이 있는 UI. 화면은 이 층만 쓴다. |

Semantic은 Primitive를 가리킨다. 브랜드 색이 바뀌면 `--color-brand-default`가 가리키는 값만 바꾸면 되고, 화면의 hex는 건드리지 않는다.

숫자 스케일 `000` `050` `100`은 밝기나 크기 단계다. `000`이 가장 작고 밝고, 숫자가 커질수록 진하거나 커진다. `999`는 끝값(검정, 완전 둥근 pill)이다. 모든 단계가 다 있지는 않다. 표에 있는 단계만 쓴다.

## 화면을 만들 때 순서

1. 플랫폼을 정한다. 모바일은 `ios`, 데스크톱은 `mac`.
2. 요소의 역할을 고른다. 페이지 배경, 카드 표면, 본문, 브랜드 버튼, 상태 메시지.
3. 아래 표에서 semantic 토큰을 고른다.
4. 맞는 semantic이 없으면 새 hex나 px를 만들지 말고, 있는 primitive를 가리키는 semantic을 `design-tokens.css`에 추가한다.

## 색

### 화면에서 쓰는 색

| 토큰 | 값 | 쓸 때 |
| --- | --- | --- |
| `--color-bg-default` | `#ffffff` | 페이지 기본 배경 |
| `--color-bg-subtle` | `#f3f6ff` | 옅은 브랜드 배경, 구분되는 섹션 |
| `--color-bg-brand` | `#5165fe` | 브랜드 배경 |
| `--color-surface-default` | `#ffffff` | 카드, 시트, 입력 표면 |
| `--color-surface-subtle` | `#f8f9fa` | 표면 안의 보조 영역 |
| `--color-text-primary` | `#202731` | 제목, 본문 |
| `--color-text-secondary` | `#47505c` | 보조 설명 |
| `--color-text-tertiary` | `#838c97` | 메타 정보, 시간, 힌트 |
| `--color-text-disabled` | `#a7afb9` | 비활성 글자 |
| `--color-text-inverse` | `#ffffff` | 브랜드·어두운 배경 위의 글자 |
| `--color-text-brand` | `#4146fd` | 링크, 브랜드 글자 |
| `--color-border-subtle` | `#ecf0f3` | 약한 구분선 |
| `--color-border-default` | `#dae0e5` | 기본 테두리, 구분선 |
| `--color-border-strong` | `#bfc8d0` | 강조 테두리 |
| `--color-border-color` | `#b2c5ff` | 브랜드 톤 테두리 |
| `--color-icon-default` | `#47505c` | 기본 아이콘 |
| `--color-icon-brand` | `#4146fd` | 브랜드 아이콘 |
| `--color-icon-disabled` | `#838c97` | 비활성 아이콘 |
| `--color-icon-inverse` | `#ffffff` | 브랜드·어두운 배경 위의 아이콘 |
| `--color-brand-default` | `#4146fd` | 주요 버튼, 브랜드 채움 |
| `--color-brand-pressed` | `#3224e1` | 눌림, 한 단계 진한 브랜드 |
| `--color-brand-muted` | `#272c6d` | Muted 브랜드 채움 |
| `--color-brand-light` | `#859fff` | 밝은 브랜드 강조 |
| `--color-status-success` | `#42dcb2` | 성공 |
| `--color-status-warning` | `#fcd658` | 경고 |
| `--color-status-warning-strong` | `#fbc205` | 강한 경고 |
| `--color-status-danger` | `#f15863` | 오류, 삭제 |
| `--color-status-danger-strong` | `#a9040b` | 강한 오류 |

배경·표면·글자·테두리·아이콘은 역할 토큰을 쓴다. 브랜드 버튼의 채움은 `--color-brand-*`, 버튼 위 글자와 아이콘은 `--color-text-inverse`, `--color-icon-inverse`다.

### Primitive 팔레트

새 semantic을 만들 때만 참조한다.

| 이름 | 단계 |
| --- | --- |
| `--color-base-000` `#ffffff` · `--color-base-999` `#000000` | 흰색, 검정 |
| `--color-gray-050` `075` `100`–`900` | `#f8f9fa` `#f1f4f6` `#ecf0f3` `#dae0e5` `#bfc8d0` `#a7afb9` `#838c97` `#626c79` `#47505c` `#2f3743` `#202731` |
| `--color-blue-050`–`900` | `#f3f6ff` `#d7e1ff` `#b2c5ff` `#859fff` `#728dff` `#5165fe` `#4146fd` `#3224e1` `#2600be` `#210084` |
| `--color-mint-050` `100` `200` `300` `400` `600` | `#e7f6f5` `#c8f1ee` `#95e6e0` `#42dcb2` `#25c7a1` `#168673` |
| `--color-violet-050` `100` `200` `300` `400` `600` | `#f9f5ff` `#ebdbff` `#d9b9ff` `#b691fa` `#a480f7` `#6e3fce` |
| `--color-red-400` `600` `800` | `#f15863` `#d0293c` `#a9040b` |
| `--color-yellow-050` `100` `200` `300` `400` `600` | `#fffbe7` `#fbecb2` `#fcd658` `#fbc205` `#eba300` `#985907` |
| `--color-muted-800` | `#272c6d` |

Lime 스케일과 red 500·700, yellow의 이전 hex는 라이브러리에서 빠졌다. 성공은 mint, 오류는 red 400/800, 경고는 yellow 200/300이다.

### 투명도

오버레이와 스크림에만 쓴다. 8자리 hex의 마지막 두 자리가 알파다.

| 토큰 | 값 | 소스 이름 |
| --- | --- | --- |
| `--color-opacity-white-000` | `#ffffff00` | `opacity/Wpacity-000` |
| `--color-opacity-white-100` | `#ffffff1a` | `opacity/Wpacity-100` |
| `--color-opacity-white-200` | `#ffffff33` | `opacity/Wpacity-200` |
| `--color-opacity-white-400` | `#ffffff66` | `opacity/Wpacity-400` |
| `--color-opacity-white-600` | `#ffffff99` | `opacity/Wpacity-600` |
| `--color-opacity-black-100` | `#0000001a` | `opacity/Bpacity-100` |
| `--color-opacity-black-200` | `#00000033` | `opacity/Bpacity-200` |
| `--color-opacity-black-400` | `#00000066` | `opacity/Bpacity-400` |
| `--color-opacity-black-600` | `#00000099` | `opacity/Bpacity-600` |
| `--color-opacity-color-500` | `#f3f6ff80` | `opacity/Cpacity-500` |

팔레트에 없는 단계(예: gray-250, mint-500, violet-700)는 만들지 않는다.

## 간격, 틈, 둥글기

레이아웃 변수는 이번 수정에서 바뀌지 않았다.

### 화면에서 쓰는 레이아웃

| 토큰 | 값 | 쓸 때 |
| --- | --- | --- |
| `--gap-xs` | `4px` | 아이콘과 글자처럼 붙는 사이 |
| `--gap-sm` | `8px` | 관련 요소 사이 |
| `--gap-md` | `16px` | 기본 스택, 카드 안 블록 |
| `--gap-lg` | `20px` | 느슨한 그룹 |
| `--gap-xl` | `24px` | 큰 그룹 |
| `--gap-section` | `48px` | 섹션과 섹션 사이 |
| `--padding-section` | `24px` | 섹션 안쪽 여백 |
| `--padding-card-sm` | `12px` | 작은 카드 |
| `--padding-card-md` | `16px` | 기본 카드 |
| `--padding-card-lg` | `20px` | 큰 카드 |
| `--padding-control-x` | `16px` | 버튼·입력 좌우 |
| `--padding-control-y` | `8px` | 버튼·입력 상하 |
| `--padding-ios-x` | `16px` | iOS 화면 좌우 |
| `--padding-ios-y` | `8px` | iOS 화면 상하 |
| `--padding-screen-mac` | `64px` | Mac 화면 바깥 여백 |
| `--radius-control` | `999px` | 버튼, 필, 칩 |
| `--radius-card-sm` | `16px` | 작은 카드 |
| `--radius-card-md` | `24px` | 기본 카드 |
| `--radius-card-lg` | `32px` | 큰 카드 |
| `--radius-screen` | `44px` | 디바이스·화면 프레임 |

카드는 padding·radius를 같은 크기로 맞춘다. `sm`끼리, `md`끼리, `lg`끼리.

### Primitive 스케일

| 토큰 | padding | gap | radius |
| --- | --- | --- | --- |
| `000` | 0 | 0 | 0 |
| `025` | — | 2px | — |
| `050` | 4px | 4px | 4px |
| `100` | 8px | 8px | 8px |
| `150` | 10px | 10px | 12px |
| `200` | 12px | 12px | 16px |
| `250` | — | — | 20px |
| `300` | 16px | 16px | 24px |
| `350` | — | — | 28px |
| `400` | 20px | 20px | 32px |
| `500` | 24px | 24px | 44px |
| `600` | 32px | 32px | — |
| `700` | 40px | 40px | — |
| `800` | 48px | 48px | — |
| `900` | 64px | — | — |
| `999` | — | — | 999px |

padding·gap·radius는 숫자가 같아도 px가 다르다. `--padding-200`은 12px이고 `--radius-200`은 16px이다. 스케일 번호를 눈대중으로 옮기지 말고 토큰 이름을 그대로 쓴다.

## 글자

텍스트 스타일은 `font`와 `letter-spacing` 한 쌍이다. 크기만 따로 적지 않는다.

```css
.briefing-page-title {
  font: var(--type-ios-title-large-font);
  letter-spacing: var(--type-ios-title-large-tracking);
}
```

`font` 값 안에는 굵기, 크기, 줄높이, `Wanted Sans`가 들어 있다.

역할은 네 가지다.

| 역할 | 쓸 때 |
| --- | --- |
| `display` | 화면을 여는 큰 헤드라인 |
| `title` | 섹션·카드 제목 |
| `body` | 본문. `strong`은 강조, `read`는 긴 읽기, `medium`은 기본, `accent`는 작은 강조, `small`은 촘촘한 본문 |
| `caption` | 캡션, 메타, 보조 수치 |

`accent`는 iOS에만 있다. 모바일 화면은 `--type-ios-*`, 데스크톱 화면은 `--type-mac-*`를 쓴다. 한 화면 안에서 두 플랫폼을 섞지 않는다.

### iOS

| 토큰 접두사 | weight | size / line | tracking |
| --- | --- | --- | --- |
| `--type-ios-display-large` | 700 | 40 / 48 | -0.5px |
| `--type-ios-display-medium` | 500 | 32 / 40 | -0.4px |
| `--type-ios-title-large` | 700 | 28 / 36 | -0.4px |
| `--type-ios-title-medium` | 700 | 22 / 32 | -0.3px |
| `--type-ios-title-small` | 600 | 20 / 30 | -0.3px |
| `--type-ios-body-strong` | 600 | 17 / 26 | -0.2px |
| `--type-ios-body-read` | 400 | 17 / 28 | -0.3px |
| `--type-ios-body-medium` | 400 | 16 / 24 | -0.3px |
| `--type-ios-body-accent` | 600 | 14 / 22 | -0.2px |
| `--type-ios-body-small` | 400 | 14 / 22 | -0.3px |
| `--type-ios-caption-large` | 400 | 13 / 18 | 0 |
| `--type-ios-caption-medium` | 400 | 12 / 16 | 0 |

각 행은 `-font`와 `-tracking` 두 변수다. 예: `--type-ios-body-medium-font`, `--type-ios-body-medium-tracking`.

### Mac

| 토큰 접두사 | weight | size / line | tracking |
| --- | --- | --- | --- |
| `--type-mac-display-large` | 700 | 48 / 56 | -0.5px |
| `--type-mac-display-medium` | 700 | 34 / 42 | -0.4px |
| `--type-mac-title-large` | 700 | 28 / 36 | -0.4px |
| `--type-mac-title-medium` | 700 | 22 / 32 | -0.3px |
| `--type-mac-title-small` | 600 | 20 / 30 | -0.3px |
| `--type-mac-body-strong` | 600 | 16 / 24 | -0.2px |
| `--type-mac-body-read` | 400 | 18 / 28 | -0.2px |
| `--type-mac-body-medium` | 400 | 16 / 24 | -0.2px |
| `--type-mac-body-small` | 400 | 14 / 20 | 0 |
| `--type-mac-caption-large` | 400 | 13 / 18 | 0 |
| `--type-mac-caption-medium` | 400 | 12 / 16 | 0 |

### 글자 primitive

스타일로 표현할 수 없을 때만 조합한다. 굵기는 400, 500, 600, 700만 있다.

| 스케일 | size | line-height |
| --- | --- | --- |
| 100 | 12 | 16 |
| 150 | 13 | 18 |
| 200 | 14 | 20 |
| 250 | 15 | 22 |
| 300 | 16 | 24 |
| 350 | 17 | 26 |
| 400 | 18 | 28 |
| 500 | 20 | 30 |
| 550 | 22 | 32 |
| 600 | 28 | 36 |
| 650 | 32 | 40 |
| 700 | 34 | 42 |
| 800 | 40 | 48 |
| 900 | 48 | 56 |

자간 primitive는 `--letter-spacing-000` `0`, `-100` `-0.2px`, `-200` `-0.3px`, `-300` `-0.4px`, `-400` `-0.5px`다. Figma의 `Spacing/*`는 글자 간격이지 레이아웃 간격이 아니다.

Figma의 텍스트 스타일은 모두 이 primitive 변수에 묶여 있다. 그래서 `--type-*` 토큰도 숫자 대신 primitive를 참조한다. 예를 들어 `--type-ios-body-read-font`는 `var(--font-weight-regular) var(--font-size-350)/var(--line-height-400) var(--font-family-sans)`다. 글자 primitive 값을 바꾸면 그 값을 쓰는 텍스트 스타일 토큰이 함께 바뀐다.

## 그림자와 효과

Figma 효과 스타일 7개에 대응한다. 그림자는 `box-shadow`, 유리·블러 효과는 `backdrop-filter`로 쓴다.

| 토큰 | 값 | Figma 스타일 | 쓸 때 |
| --- | --- | --- | --- |
| `--shadow-card` | `0 0 8px 0` gray-100 | `ShadowCard` | 카드 기본 그림자 |
| `--shadow-line` | `0 0 12px 0` gray-200 | `ShadowLine` | 경계가 더 필요한 카드 |
| `--shadow-glass` | `0 8px 16px 0` gray-075 | `ShadowGlass` | 유리 패널 아래 그림자 |
| `--effect-glass-background-backdrop` | `blur(8px)` | `GlassBackground` | 유리 배경 |
| `--effect-glass-active-backdrop` | `blur(24px)` | `GlassActive` | 활성 유리. `--effect-glass-active-shadow`와 같이 쓴다 |
| `--effect-glass-active-shadow` | `inset 2px 2px 8px 2px` blue-100 | `GlassActive` | 활성 유리의 안쪽 그림자 |
| `--effect-glass-gradient-backdrop` | `blur(8px)` | `GlassGradient` | 그라데이션 유리 |
| `--effect-blur-background-backdrop` | `blur(16px)` | `BlurBackground` | 배경 블러 |

```css
.activity-memory-card {
  box-shadow: var(--shadow-card);
}

.role-switch-tab-active {
  backdrop-filter: var(--effect-glass-active-backdrop);
  box-shadow: var(--effect-glass-active-shadow);
}
```

CSS로는 Figma와 똑같이 나오지 않는 부분이 두 가지 있다. Figma 그림자는 `LINEAR_BURN` 혼합 모드라서 CSS에서는 조금 더 옅게 보인다. Figma `GLASS` 효과의 굴절, 깊이, 빛은 CSS에 대응하는 속성이 없어서 블러만 옮겼다. 그림자 값을 직접 만들지 말고 이 토큰을 쓴다.

## 이렇게 작성한다

클래스 이름은 [개발 가이드](dev-guide.md)의 이름 규칙을 따른다. 아래 예시는 쓰이는 화면이나 부품 이름을 넣은 소문자·하이픈 클래스다.

```css
.app-shell {
  padding: var(--padding-ios-y) var(--padding-ios-x);
  background: var(--color-bg-subtle);
  color: var(--color-text-primary);
}

.activity-memory-card {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  padding: var(--padding-card-md);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card-md);
  background: var(--color-surface-default);
}

.activity-memory-card-title {
  font: var(--type-ios-title-medium-font);
  letter-spacing: var(--type-ios-title-medium-tracking);
}

.activity-memory-card-condition {
  font: var(--type-ios-body-medium-font);
  letter-spacing: var(--type-ios-body-medium-tracking);
  color: var(--color-text-secondary);
}

.primary-button {
  padding: var(--padding-control-y) var(--padding-control-x);
  border: 0;
  border-radius: var(--radius-control);
  background: var(--color-brand-default);
  color: var(--color-text-inverse);
  font: var(--type-ios-body-strong-font);
  letter-spacing: var(--type-ios-body-strong-tracking);
}

.primary-button:active {
  background: var(--color-brand-pressed);
}
```

`1px` 테두리 두께처럼 이 시스템에 스케일이 없는 값만 숫자로 둔다. 색, 여백, 둥글기, 글자 크기·굵기·줄높이·자간은 토큰이다.

## AI에게 전달하는 지시

CROXER 협업 가이드는 AI가 작업 전에 이 문서(`docs/ui-guide.md`)를 읽도록 안내한다. 그래서 CROXER 폴더에서 작업할 때는 아래 블록을 따로 붙이지 않아도 된다. 저장소를 열 수 없는 대화형 AI에게 화면 코드를 요청할 때만 프롬프트에 붙인다.

```text
CROXER 화면을 만들 때는 tokens/design-tokens.css의 커스텀 프로퍼티만 사용한다.

- 토큰은 src/index.css에서 이미 불러온다. 기능 CSS에서 다시 불러오지 않는다. Wanted Sans 웹폰트도 토큰 파일이 불러오므로 폰트 링크나 @font-face를 따로 추가하지 않는다.
- 색, padding, gap, radius, font, letter-spacing에 hex, rgb, 임의 px를 쓰지 않는다.
- 화면 CSS에는 semantic 토큰만 쓴다. --color-blue-600, --padding-300, --radius-200 같은 primitive는 새 semantic을 정의할 때만 쓴다.
- 배경은 --color-bg-default, --color-bg-subtle, --color-bg-brand. 카드 표면은 --color-surface-*. 글자는 --color-text-*, 선은 --color-border-*, 아이콘은 --color-icon-*, 브랜드 채움은 --color-brand-*, 성공·경고·오류는 --color-status-* 를 쓴다.
- 성공은 mint, 경고는 yellow, 오류는 red다. lime 색과 red-500, red-700은 없다.
- 반투명 오버레이는 --color-opacity-white-*, --color-opacity-black-*, --color-opacity-color-500 만 쓴다.
- 간격은 --gap-xs|sm|md|lg|xl|section, 카드 여백은 --padding-card-sm|md|lg, 버튼 여백은 --padding-control-x|y, 둥글기는 --radius-control 또는 --radius-card-sm|md|lg 를 쓴다. 카드의 padding과 radius는 같은 크기 단계를 짝으로 쓴다.
- 모바일 글자는 --type-ios-*, 데스크톱 글자는 --type-mac-* 를 쓰고, font와 letter-spacing을 항상 같이 선언한다. iOS 작은 강조는 --type-ios-body-accent-* 다.
- 그림자는 --shadow-card|line|glass, 유리·블러는 --effect-*-backdrop 을 backdrop-filter에 쓴다. 활성 유리는 --effect-glass-active-shadow 도 같이 쓴다. box-shadow 값을 직접 만들지 않는다.
- 표에 없는 토큰이 필요하면 기존 primitive를 var()로 가리키는 semantic만 design-tokens.css에 추가한다. 새 색 값이나 새 px 스케일은 만들지 않는다.
- CSS 클래스는 쓰이는 화면이나 부품 이름을 넣은 소문자·하이픈 이름으로 짓는다. 예: .activity-memory-card, .primary-button
```

## 토큰을 추가할 때

semantic이 역할을 표현하지 못할 때만 `tokens/design-tokens.css`의 semantic 구역에 한 줄을 추가한다. 토큰은 여러 화면이 함께 쓰는 공용 파일이므로, 추가 이유와 영향을 받는 화면을 PR에 적는다.

```css
--color-border-brand: var(--color-blue-600);
```

- 오른쪽은 반드시 기존 primitive 또는 기존 semantic이다.
- 팔레트에 없는 색, 스케일에 없는 px는 추가하지 않는다.
- 이름 순서는 `--{종류}-{역할}-{단계}`다. 종류는 `color`, `padding`, `gap`, `radius`, `type`, `shadow`, `effect`이다.
- `tokens/design-tokens.json`을 함께 고친다. JSON이 원본이고 CSS는 그 값을 펼친 파일이다. JSON의 `{color.primitive.blue.600}` 별칭이 CSS의 `var(--color-blue-600)`이다.
- 이 문서의 표와 아래 `변경 이력`도 같은 PR에서 고친다.

## 변경 이력

| 버전 | 날짜 | 수정자 | 수정 내용과 이유 |
| --- | --- | --- | --- |
| 1.1 | 2026-11-16 | Cursor AI · 김민선 요청 | Task 6·8·9용 공통 부품·Icons·ResImg 기준을 `src/components/` 등에 등록. 앱 전환은 ① `RoleSwitchPanel`, DS `RoleTransitionPanel`은 보관. 화면 CSS hex는 semantic 토큰으로 맞춤 |
| 1.0 | 2026-11-11 | Cursor AI · 김민선 요청 | MYA 디자인 시스템 토큰의 사용 기준 등록. 협업 가이드가 디자인 기준으로 참조하는 `docs/ui-guide.md` 경로에 두고, CROXER 전역 CSS 연결 방법과 팀 이름 규칙에 맞춘 예시 반영 |
