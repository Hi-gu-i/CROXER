# MYA 디자인 토큰

CROXER 화면에서 쓰는 색, 간격, 둥글기, 글자, 그림자 값을 모아 둔 폴더다. 화면을 만들 때 어떤 토큰을 고르는지는 [UI 가이드](../docs/ui-guide.md)를 따른다. 이 문서는 토큰 파일을 고치는 사람이 출처와 변환 규칙을 확인하는 용도다.

출처는 Figma 파일 `🤖 MYA_Design-System`, Foundation 페이지의 `style guide` 섹션이다.

| 파일 | 내용 |
| --- | --- |
| `design-tokens.json` | 토큰 원본. 특정 플랫폼에 묶이지 않는 DTCG 형식이고, semantic 토큰은 primitive를 별칭으로 가리킨다. |
| `design-tokens.css` | 화면 코드에서 바로 쓰는 CSS 변수. `src/index.css`에서 한 번 불러온다. |

색은 Figma 로컬 변수 컬렉션(`♢ Color Primitive`, `♢ Color Semantic`)을 따른다. 텍스트 스타일은 로컬 텍스트 스타일(`ios/*`, `mac/*`), 그림자와 유리 효과는 로컬 효과 스타일을 따른다. 스타일 가이드의 색 칩은 색 변수에 연결되어 있고, 칩 라벨에는 변수 값이 적혀 있다.

## 가져온 범위

- 로컬 변수 컬렉션 5개, 그 안의 변수 176개
- 로컬 텍스트 스타일 23개
- 로컬 효과 스타일 7개
- 색 primitive와 semantic 별칭. mint, violet, muted, 투명도 포함
- padding, gap, radius primitive와 semantic 별칭
- 글자 primitive와 iOS·macOS 텍스트 스타일
- 그림자, 유리, 배경 블러 효과

## 변환 규칙

모든 컬렉션은 현재 모드가 하나(`Mode 1`)다.

Figma 글자 변수 `Spacing/*`는 레이아웃 간격이 아니라 자간이다. 그래서 `typography.primitive.letterSpacing`에 넣었다.

Figma 텍스트 스타일은 모두 글자 변수에 묶여 있다. 그래서 텍스트 스타일 토큰도 숫자를 복사하지 않고 해당 primitive를 참조한다. CSS는 `var(--font-size-*)`, JSON은 `{typography.primitive.*}` 형식이다.

Figma 그림자는 `LINEAR_BURN` 혼합 모드를 쓰지만, CSS `box-shadow`는 일반 혼합으로 그린다. Figma `GLASS` 효과는 CSS에 대응하는 속성이 없어서, 효과의 반경을 `backdrop-filter: blur()`에 넣어 비슷하게 만들었다.

Figma 변수 이름 `Weight/weignt-*`에는 오타가 있다. 토큰 경로는 `fontWeight`로 바로잡았고, 값 `Regular` / `Medium` / `Semibold` / `Bold`는 CSS 굵기 `400` / `500` / `600` / `700`으로 바꿨다. Figma 텍스트 스타일의 `SemiBold`도 `600`이다. 투명도 변수 이름 `Wpacity`, `Bpacity`, `Cpacity`는 `opacity.white`, `opacity.black`, `opacity.color`로 넣었다.

## 웹폰트

`design-tokens.css`는 맨 위에서 Wanted Sans v1.0.3 웹폰트를 jsDelivr에서 불러온다. 공식 저장소 `wanteddev/wanted-sans`의 static split 빌드이고, 라이선스는 SIL Open Font License 1.1이다. 글꼴 이름 `"Wanted Sans"`로 굵기 400–1000을 등록하고, 굵기마다 글자 범위별로 파일이 나뉘어 있어서 브라우저는 화면에 쓰인 글자 묶음만 받는다.

버전을 고정해 두었으므로 새 버전으로 올릴 때는 `@import` 주소의 버전 태그를 바꾸고 화면에서 글꼴을 확인한다.

## 토큰을 고칠 때

1. Figma 변수, 텍스트 스타일, 효과 스타일을 먼저 확인한다.
2. `design-tokens.json`과 `design-tokens.css`를 같은 PR에서 함께 고친다. CSS만 고치면 두 파일 값이 달라진다.
3. 값이나 토큰 이름이 바뀌면 [UI 가이드](../docs/ui-guide.md)의 표와 이 문서의 `가져온 범위`도 고친다.
4. 바뀐 토큰을 쓰는 화면을 PR의 `확인 방법`에 적는다.

## 변경 이력

| 버전 | 날짜 | 수정자 | 수정 내용과 이유 |
| --- | --- | --- | --- |
| 1.3 | 2026-11-21 | Cursor AI · Hi-gu-i 요청 | 전환 워시용 semantic `--color-role-leader-soft`(yellow-200), `--color-role-editor-soft`(violet-200), `--color-role-runner-soft`(mint-200)를 JSON·CSS에 추가. 화면이 기본 색 토큰을 직접 쓰지 않게 함 |
| 1.2 | 2026-11-19 | Cursor AI · 예은 요청 | 역할 막대용 semantic `--color-role-leader-strong`, `--color-role-editor-strong`, `--color-role-runner-strong`를 JSON·CSS에 추가. 화면 CSS의 hex를 빼기 위함 |
| 1.1 | 2026-11-18 | Cursor AI · 지유 요청 | 홈 선택 배경용 semantic `--color-bg-brand-subtle`(blue-100), `--color-bg-brand-soft`(blue-200)를 JSON·CSS에 추가 |
| 1.0 | 2026-11-11 | Cursor AI · 김민선 요청 | MYA 디자인 토큰의 출처, 변환 규칙, 웹폰트, 수정 절차 등록. 팀 문서 규칙에 맞춰 한국어로 작성하고 사용 기준은 `docs/ui-guide.md`로 분리 |
