# CROXER 개발 가이드

팀원과 AI가 같은 개발 환경에서 같은 이름과 파일 배치를 사용하기 위한 기준입니다. GitHub 작업 순서와 PR은 [협업 가이드](collaboration-guide.md), 설치 방법은 [README](../README.md)를 참고하세요.

## 개발 환경

- 화면은 **React**, 코드는 **TypeScript**, 스타일은 **CSS**를 사용합니다. `*.tsx`에는 화면과 컴포넌트를, `*.ts`에는 데이터 타입과 로직을 작성합니다. Vite로 앱을 실행하고 빌드합니다.
- Node.js 버전은 [`.nvmrc`](../.nvmrc), npm 환경은 README를 따릅니다. 처음 설치하거나 의존성이 바뀌면 `npm ci`, 화면을 확인할 때는 `npm run dev`를 사용합니다. `package-lock.json`은 함께 관리합니다.
- 새 라이브러리가 필요한 경우 사용 목적을 통합 담당과 확인하고 `package.json`과 `package-lock.json` 변경을 같은 PR에 담습니다. 코드 변경을 올리기 전에는 `npm run lint`, `npm run build`, 변경된 화면의 실제 동작을 확인합니다.

## 파일을 둘 위치

현재 저장소에는 `src/main.tsx`, `src/App.tsx`, `src/index.css`가 있습니다. 아래 예시 폴더는 해당 기능이 처음 생길 때 만듭니다.

| 위치 | 넣을 내용 | 예시 |
| --- | --- | --- |
| `src/main.tsx` | 브라우저에서 앱을 시작하는 코드 | React 앱 실행 |
| `src/App.tsx` | 앱의 공통 화면 틀과 기능 화면 연결 | 홈에서 기억 화면 열기 |
| `src/index.css` | 앱 전체에 적용되는 기본 스타일 | 기본 글꼴과 바깥 여백 |
| `src/features/<기능명>/` | 기능 하나의 화면·스타일·로직 | `memory/ActivityMemoryCard.tsx`, `memory/memoryStore.ts` |
| `src/components/` | 둘 이상의 기능에서 쓰는 공통 UI | `PrimaryButton.tsx` |
| `docs/` | 기획, 디자인, 개발, 협업 기준 문서 | `dev-guide.md` |

기능 한 곳에서만 쓰는 부품은 그 기능 폴더에 함께 둡니다. `src/App.tsx`, 전역 CSS, 공통 UI, 개발 설정을 여러 작업에서 수정해야 하면, 담당자를 정해 먼저 합칠 작업의 순서를 맞춥니다.

## 이름 짓기

코드 식별자는 영어로 통일합니다. 사용자가 화면에서 읽는 문구와 팀 문서는 한국어를 기본으로 합니다.

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 기능 폴더, 문서, CSS 파일 | 소문자, 여러 단어는 하이픈으로 구분 | `role-switch/`, `dev-guide.md`, `activity-memory-card.css` |
| React 컴포넌트와 파일명 | 단어 첫 글자를 대문자로 쓰고 이름을 맞춤 | `ActivityMemoryCard` → `ActivityMemoryCard.tsx` |
| TypeScript 로직 파일, 변수, 함수, 데이터 필드 | 첫 단어는 소문자, 다음 단어는 대문자로 시작 | `memoryStore.ts`, `saveActivityMemory`, `activityId` |
| 타입 이름 | 단어 첫 글자를 대문자로 시작 | `ActivityMemory`, `Role` |
| 참·거짓 값 | 이름에서 의미가 드러나도록 작성 | `isSaving`, `hasMemory` |
| CSS 클래스 | 소문자와 하이픈, 쓰이는 화면이나 부품 이름 포함 | `.activity-memory-card`, `.activity-memory-card-title` |

새 이름을 정하기 전에 같은 의미로 쓰는 기존 이름을 확인합니다. 예를 들어 저장 화면에서 `activityId`를 쓰기로 했으면 브리핑에서도 `activityId`를 사용합니다. `taskId`, `activityID`를 같은 뜻으로 섞어 쓰면 두 화면을 연결할 때 값이 맞지 않을 수 있습니다.

## 여러 화면에서 쓰는 데이터

| 필드 예시 | 의미 |
| --- | --- |
| `roleId` | 역할을 구분하는 ID |
| `activityId` | 개별 활동을 구분하는 ID |
| `condition` | 활동에 기억해 둘 조건 |
| `updatedAt` | 마지막으로 수정한 시각 |

`roleId`와 `activityId`는 화면에 표시되는 이름과 별개의 값입니다. 예를 들어 활동 이름을 ‘강변 촬영’에서 ‘한강 촬영’으로 바꿔도 동일한 활동의 `activityId`를 유지합니다.

위 표는 **필드 이름의 예시**입니다. 실제 저장·조회 형식은 기억과 브리핑 작업을 나누기 전에 팀에서 합의하고 [UT 데이터 베이스라인](ut-data-baseline.md)에 예시 데이터와 함께 적습니다. 여러 화면에서 같은 데이터 형식을 쓰면 TypeScript 타입을 한 곳에 정의해 가져다 씁니다. 필드 이름이나 형식을 바꿀 때는 저장, 조회, 예시 데이터에 미치는 영향을 함께 확인합니다.

## 변경 기록

- 작업 브랜치는 내용 기준으로 이름을 짓습니다. 예를 들어 `feat/activity-memory`, `fix/briefing-condition`, `docs/dev-guide`를 사용합니다.
- 커밋과 PR 제목은 팀원이 결과를 알아볼 수 있게 작성합니다. 예를 들어 `활동 조건 저장 화면 추가`, `개발 언어와 파일 이름 규칙 정리`로 적습니다.
- 비밀키와 실제 참가자 기록은 저장소에 넣지 않습니다. 화면을 확인할 때는 가상 예시를 사용합니다.

## 변경 이력

| 버전 | 날짜 | 수정자 | 수정 내용과 이유 |
| --- | --- | --- | --- |
| 1.1 | 2026-11-11 | Codex · Hi-gu-i 요청 | 변경 이력 추가 및 UT 데이터 규칙 참조 경로 갱신 |
| 1.0 | 2026-11-11 | Codex · Hi-gu-i 요청 | 개발 환경, 파일 구조, 이름 규칙 정리 · [e1203b2](https://github.com/Hi-gu-i/CROXER/commit/e1203b2) |
