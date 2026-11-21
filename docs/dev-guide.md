# CROXER 개발 가이드

팀원과 AI가 같은 개발 환경에서 같은 이름과 파일 배치를 사용하기 위한 기준입니다. GitHub 작업 순서와 PR은 [협업 가이드](collaboration-guide.md), 설치 방법은 [README](../README.md)를 참고하세요.

## 개발 환경

- 화면은 **React**, 코드는 **TypeScript**, 스타일은 **CSS**를 사용합니다. `*.tsx`에는 화면과 컴포넌트를, `*.ts`에는 데이터 타입과 로직을 작성합니다. Vite로 앱을 실행하고 빌드합니다.
- Node.js 버전은 [`.nvmrc`](../.nvmrc), npm 환경은 README를 따릅니다. 처음 설치하거나 의존성이 바뀌면 `npm ci`, 화면을 확인할 때는 `npm run dev`를 사용합니다. `package-lock.json`은 함께 관리합니다.
- 새 라이브러리가 필요한 경우 사용 목적을 통합 담당과 확인하고 `package.json`과 `package-lock.json` 변경을 같은 PR에 담습니다. 코드 변경을 올리기 전에는 `npm run lint`, `npm run build`, 변경된 화면의 실제 동작을 확인합니다.

## 화면, 저장 로직, 서버의 역할

- 화면은 입력·클릭·화면 이동을 처리하고, 데이터가 필요한 경우 해당 기능의 저장·조회 함수에 요청합니다. 예를 들어 `ActivityMemoryCard.tsx`는 조건을 보여주고, `memoryStore.ts`는 활동 ID로 조건을 저장하고 불러옵니다. 브리핑도 같은 조회 함수를 사용합니다.
- 첫 UT는 브라우저에서 가상 데이터를 불러오고 참가자의 변경을 해당 세션에 저장하는 구성을 기준으로 합니다. 데이터베이스 서버 없이도 참가자 초기화, 일정 수락 후 반영, 역할 간 데이터 분리를 재현할 수 있습니다. 가상 초기 데이터와 참가자가 변경한 세션 데이터는 구분합니다.
- **데이터 접근 규칙 (팀 약속).** 모든 화면은 데이터·흐름 담당이 만든 저장·조회 함수로만 데이터를 읽고 씁니다. 화면 코드에서 브라우저 저장소(`localStorage` 등)나 `src/fixtures/`의 초기 데이터 파일을 직접 읽거나 쓰지 않습니다. 이렇게 해야 새로고침 후 유지와 진행자 초기화가 모든 화면에 똑같이 적용됩니다. 필요한 함수가 없으면 [AI 협업 요청 가이드](ai-collaboration.md)로 데이터·흐름 담당에게 요청합니다.
- **ID와 상태 값 (팀 약속).** 역할·활동·일정·자료·작업의 ID(`role-editor`, `activity-shoot`, `schedule-edit`, `job-shoot-extra` 등)와 상태 값(`waiting`, `queued`, `dismissed`, `simulated_sent` 등)은 [UT 데이터 베이스라인](ut-data-baseline.md)에 적힌 것을 그대로 씁니다. 각자 새로 만들지 않습니다. 베이스라인에 없는 ID가 필요하면 UT 담당이 초기 데이터에 추가하고 베이스라인에도 적습니다.
- 팀이 실제 AI API 호출이나 여러 기기 간 저장을 검증하기로 하면 서버를 별도로 추가합니다. 첫 서버 코드가 생기면 같은 저장소에 `server/`를 두고, 서버가 받을 값과 화면에 돌려줄 값, 실패했을 때의 표시를 프론트 담당과 서버 담당이 합의합니다. API 키는 서버 쪽에서 관리합니다.

## 파일을 둘 위치

현재 저장소에는 `src/main.tsx`, `src/App.tsx`, `src/index.css`가 있습니다. 아래 예시 폴더는 해당 기능이 처음 생길 때 만듭니다.

| 위치 | 넣을 내용 | 예시 |
| --- | --- | --- |
| `src/main.tsx` | 브라우저에서 앱을 시작하는 코드 | React 앱 실행 |
| `src/App.tsx` | 앱의 공통 화면 틀과 기능 화면 연결 | 홈에서 기억 화면 열기 |
| `src/index.css` | 앱 전체에 적용되는 기본 스타일 | 기본 글꼴과 바깥 여백 |
| `src/features/<기능명>/` | 기능 하나의 화면·전용 스타일·로직 | `briefing/BriefingPage.tsx`, `briefing/briefing-page.module.css` |
| `src/components/` | 둘 이상의 기능에서 쓰는 공통 UI | `PrimaryButton.tsx` |
| `src/data/` | 공용 데이터 타입과 저장·조회 함수. 데이터·흐름 담당만 수정 | `types.ts`, `utStore.ts`, `useUtSession.ts` |
| `src/fixtures/` | UT 시작 상태를 만드는 가상 데이터 | `croxer-ut-baseline.v1.json` |
| `docs/` | 기획, 디자인, 개발, 협업 기준 문서 | `dev-guide.md` |

기능 한 곳에서만 쓰는 부품은 그 기능 폴더에 함께 둡니다. `src/App.tsx`, 전역 CSS, 공통 UI, 개발 설정을 여러 작업에서 수정해야 하면, 담당자를 정해 먼저 합칠 작업의 순서를 맞춥니다.

첫 UT의 기능 폴더는 구현 순서에 맞춰 `setup/`, `home/`, `briefing/`, `schedule/`, `role-switch/`, `memory/` 등을 추가합니다. 예를 들어 브리핑 담당은 `features/briefing/`을, 역할 전환 담당은 `features/role-switch/`를 수정합니다. 여러 화면에서 쓰는 데이터는 소유 기능의 저장·조회 함수로 연결합니다.

## 저장·조회 함수 (`src/data/`)

화면은 아래 함수로만 UT 데이터를 읽고 씁니다. 타입은 `src/data/types.ts`, 함수는 `src/data/utStore.ts`에 있습니다. 필요한 함수가 없거나 동작을 바꿔야 하면 데이터·흐름 담당에게 요청합니다.

- **화면 다시 그리기.** 컴포넌트 맨 위에서 `useUtSession()`을 부른 뒤 조회 함수로 값을 읽습니다. 저장 함수를 부르면 값을 쓰는 모든 화면이 함께 갱신됩니다.
- **저장 위치.** 참가자 세션은 브라우저 저장소의 UT 전용 키 `croxer-ut-session` 하나에 저장되어 새로고침해도 유지됩니다. 주소에 `?room=방번호`가 있으면 방마다 `croxer-ut-session:room:방번호`에 따로 저장하고, 같은 방의 다른 기기와 맞춥니다(아래 '방 연결'). 같은 컴퓨터의 다른 탭에서 바뀐 값은 브라우저의 `storage` 이벤트에 담긴 값으로 받고, 받은 값을 다시 저장하지 않습니다. 방에 연결된 동안에는 탭마다 따로인 저장소(sessionStorage)를 써서, 같은 브라우저에서 방 주소를 두 탭으로 열어도 서로의 중간 상태로 화면이 바뀌지 않습니다. 초기 데이터는 읽기 전용이며 세션과 섞이지 않습니다.
- **상태 규칙.** 함수가 [PRD](prd.md) 6.2를 지킵니다. 예를 들어 `completeActivity`는 현재 역할과 AI 작업 상태를 바꾸지 않고, `requestAiJob`은 작업을 완료로 만들지 않습니다. 화면에서 상태 값을 직접 조합하지 않습니다.

| 화면·기능 | 조회 | 저장·변경 |
| --- | --- | --- |
| 공통 | `getRoles`, `getRole`, `getActivities`, `getActivity`, `getSchedules`, `getSchedule`, `getScheduleByActivity`, `getActiveRoleId`, `getCurrentActivityId`, `getToday` | — |
| 브리핑(F-03) | `getBriefingItems`, `getBriefingOrder`, `isBriefingConfirmed` | `saveBriefingOrder(앞 세 일정 ID)` — 뒤 두 칸은 자동 고정, `confirmBriefing()` — 첫 활동으로 진입하고 그 활동 ID를 돌려줌 |
| 활동 순서·홈·전환 패널 | `getEntryOrder`, `getNextActivityId`, `isUtFlowFinished` | `enterActivity(활동 ID)` — 역할·열린 활동 변경, 일정 진행 중, `markActivityShown(활동 ID)` — 홈 카드가 뜰 때 일정만 진행 중, `completeActivity(활동 ID)` — 일정 완료, 다음 활동 ID를 돌려줌 |
| 자료(Task 4) | `getResources(활동 ID)`, `getResource` — AI 작업 결과는 완료 전 숨김 | — |
| 비 알림(Task 6) | `getFiredAlerts(활동 ID)`, `getAlert`, `isAlertFired` | `fireAlert` — 진입 10초 후·진행자 패널, `markAlertRead` |
| 러닝 문의·코스·공지(Task 8) | `getFiredInquiries`, `isInquiryFired`, `getAiAssessment(문의 ID)`, `getCourses`, `getSelectedCourseId`, `getAnnouncement(활동 ID)` — 선택 코스·집결지 반영 | `fireInquiry` — 진입 시·진행자 패널, `selectCourse`, `sendAnnouncement` — 한 번만, 코스 선택 후에만 |
| AI 작업(Task 9) | `getAiJobs`, `getAiJob`, `isAiJobRequested` | `requestAiJob` — `queued`, 한 번만, `markAiJobRunning` — `running` |
| 채팅 입력 | `findKeywordReply(활동 ID, 입력)`, `getFallbackChoices(활동 ID)` | — |
| 스케줄(F-11) | `getScheduleSections()` — 진행 완료·진행 중·백그라운드·진행 후 | — |
| 진행자 패널 | — | `resetUtSession()`, `skipToNextActivity()`, `fireAlert`, `fireInquiry` |
| 방 연결(다른 기기) | `getUtRoomId()` — 방 번호 또는 `null`, `getUtSyncStatus()` — `local`(방이 없거나 데이터베이스 주소가 설정되지 않음) / `connecting` / `connected` / `offline`(연결이 끊김), `subscribeUtSyncStatus(listener)` | `createUtRoomId()` — 새 6자리 방 번호, `buildUtRoomUrl(방번호, 'participant' \| 'facilitator')` — 참가자·진행자 주소 |
| 앱 셸(화면 이동) | `subscribeUtExternalChange((이전, 다음) => …)` — 다른 탭·다른 기기에서 세션이 바뀌었을 때만 부름. 이 기기의 변경에는 부르지 않음 | — |

초기 데이터는 UT 담당의 `src/fixtures/croxer-ut-baseline.v1.json`을 쓰며, 이 파일은 `types.ts`의 `UtBaseline` 모양을 따릅니다. 화면에서 이 파일을 직접 불러오지 않고 위 함수로 읽습니다.

### 방 연결 (참가자·진행자가 서로 다른 기기일 때)

참가자 휴대폰과 진행자 휴대폰이 같은 방 번호로 앱을 열면 세션이 서로 맞춰집니다. 서버 코드는 두지 않고 Firebase Realtime Database를 주소(REST)로만 씁니다. 추가 라이브러리는 없습니다. 코드는 `src/data/utRoomSync.ts`에 있고, 화면은 위 표의 함수만 씁니다.

- **주소.** 참가자 `https://배포주소/?room=482193`, 진행자 `https://배포주소/?room=482193#facilitator`. 방 번호가 없으면 지금처럼 기기 안에서만 동작하고, 같은 컴퓨터의 탭끼리는 브라우저 저장소로 맞춰집니다.
- **맞추는 방식.** 이 기기에서 바뀔 때마다 세션의 바뀐 칸만(예: `scheduleStatus/schedule-run`) `rooms/{방번호}/session`에 올리고, 다른 기기의 변경은 듣기 연결로 받습니다. 그래서 진행자가 비 알림을 띄우는 순간 참가자가 코스를 골라도 둘 다 남습니다. 같은 칸을 두 기기가 동시에 바꾸면 서버에 나중에 도착한 값이 남습니다. 나중에 연 기기는 지금 값을 먼저 받습니다. 기기 시계는 순서 판단에 쓰지 않습니다.
- **끊겼을 때.** 기기 안의 상태로 계속 동작하고(`offline`), 다시 연결되면 보내지 못한 변경을 올립니다. 보내지 못한 변경이 없으면 서버 값을 받습니다.
- **버전.** 두 기기는 같은 배포를 열어야 합니다. 저장 형식 버전(`version`)이 다른 값은 반영하지 않으니, 배포 뒤에는 두 기기를 모두 새로고침합니다.
- **개인정보.** 주고받는 값은 진행 상태(`UtSession`)뿐입니다. 참가자 이름 같은 개인정보와 개입 기록은 올리지 않습니다.

**처음 설정 (팀원이 한 번)**

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 만들고, 빌드 → Realtime Database → 데이터베이스 만들기를 누릅니다. 위치는 가까운 곳(예: 싱가포르 `asia-southeast1`), 시작 모드는 '잠금 모드'를 고릅니다.
2. Realtime Database의 규칙 탭에 아래 규칙을 붙여 넣고 게시합니다. `rooms/{6자리 숫자}/session`만 읽고 쓸 수 있고, 세션 모양이 아니면 쓰지 못합니다.
3. 데이터 탭 위쪽의 데이터베이스 주소(`https://…firebasedatabase.app`)를 복사합니다.
4. Vercel 프로젝트 → Settings → Environment Variables에 `VITE_FIREBASE_DATABASE_URL`로 넣고(Production·Preview 모두), 다시 배포합니다. 로컬에서 시험할 때는 `.env.local`에 같은 이름으로 넣습니다. `.env.local`은 저장소에 올라가지 않습니다.

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "rooms": {
      "$room": {
        ".read": "$room.matches(/^[0-9]{6}$/)",
        ".write": "$room.matches(/^[0-9]{6}$/)",
        "session": {
          ".validate": "!newData.exists() || newData.hasChildren(['version', 'startedAt', 'updatedAt', 'briefingOrder', 'scheduleStatus'])"
        },
        "$other": { ".validate": false }
      }
    }
  }
}
```

`VITE_`로 시작하는 값은 배포된 화면 코드에 들어가므로 비밀이 아닙니다. 데이터베이스는 위 규칙이 지키며, 방 번호를 아는 사람만 그 방을 읽고 쓸 수 있습니다. 비밀키(서비스 계정 키 등)는 쓰지 않습니다.

## 화면별 CSS

- 화면이나 컴포넌트 전용 스타일은 해당 코드 옆의 `.module.css` 파일에 둡니다. 예를 들어 `BriefingPage.tsx`에서 `briefing-page.module.css`를 불러옵니다. 이렇게 하면 다른 담당자가 홈이나 스케줄을 꾸밀 때 브리핑 스타일이 섞이는 일을 줄일 수 있습니다.
- 앱 전체의 기본 글꼴, 바깥 여백 초기화, 배경은 `src/index.css`에 둡니다. 공통 색상과 간격은 디자인 시스템에서 정한 값을 공유하고, 버튼처럼 여러 기능에서 쓰는 부품의 CSS는 해당 공통 컴포넌트 옆에 둡니다.

## 이름 짓기

코드 식별자는 영어로 통일합니다. 사용자가 화면에서 읽는 문구와 팀 문서는 한국어를 기본으로 합니다.

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 기능 폴더, 문서, CSS 파일 | 소문자, 여러 단어는 하이픈으로 구분 | `role-switch/`, `dev-guide.md`, `activity-memory-card.css` |
| React 컴포넌트와 파일명 | 단어 첫 글자를 대문자로 쓰고 이름을 맞춤 | `ActivityMemoryCard` → `ActivityMemoryCard.tsx` |
| TypeScript 로직 파일, 변수, 함수, 데이터 필드 | 첫 단어는 소문자, 다음 단어는 대문자로 시작 | `memoryStore.ts`, `saveActivityMemory`, `activityId` |
| 타입 이름 | 단어 첫 글자를 대문자로 시작 | `ActivityMemory`, `Role` |
| 참·거짓 값 | 이름에서 의미가 드러나도록 작성 | `isSaving`, `hasMemory` |
| CSS 클래스 | CSS 모듈에서는 소문자로 시작하고 다음 단어는 대문자. 전역 클래스는 소문자와 하이픈 | 모듈 `.cardTitle`, 전역 `.app-shell` |

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
| 1.8 | 2026-11-21 | Claude Code · 지유 요청 | 같은 컴퓨터 탭 두 개로 쓸 때 다른 탭에서 받은 세션을 저장소에 다시 쓰던 문제를 고침(두 탭이 낡은 값을 주고받아 확정·과제 넘기기가 되돌아감). 탭 사이 변경은 이벤트에 담긴 값으로 읽는다고 저장 위치 설명에 추가 |
| 1.7 | 2026-11-21 | Claude Code · 지유 요청 | 방 연결 중에는 탭마다 따로인 저장소를 쓰도록 바꿔, 같은 브라우저 두 탭에서 화면이 튀던 문제를 고침. 데이터베이스 주소가 없을 때 연결 상태를 `offline` 대신 `local`로 알림 |
| 1.6 | 2026-11-21 | Claude Code · 지유 요청 | 참가자·진행자가 서로 다른 기기로 UT를 진행할 수 있게 방 연결(`?room=`, Firebase Realtime Database REST) 함수와 처음 설정·데이터베이스 규칙을 추가. 현지 님 요청 카드 반영 |
| 1.5 | 2026-11-15 | Claude Code · 지유 요청 | UT 담당의 초기 데이터 파일이 합쳐져 저장·조회 함수가 임시값 대신 이 파일을 쓰도록 안내 문구 수정 |
| 1.4 | 2026-11-15 | Claude Code · 지유 요청 | 0단계 데이터 기반: 공용 데이터 폴더 `src/data/`를 파일 위치 표에 추가하고, 화면별 저장·조회 함수 이름과 저장 키를 공유하기 위해 `저장·조회 함수` 섹션 추가 |
| 1.3 | 2026-11-14 | Claude Code · 지유 요청 | 팀 회의 결정 반영: 화면은 저장·조회 함수로만 데이터에 접근하고, ID와 상태 값은 UT 데이터 베이스라인을 그대로 쓰도록 약속 추가 |
| 1.2 | 2026-11-11 | Codex · Hi-gu-i 요청 | 화면별 폴더와 CSS, 브라우저 저장과 서버의 책임을 구체화해 병렬 작업 범위를 명확히 함 |
| 1.1 | 2026-11-11 | Codex · Hi-gu-i 요청 | 변경 이력 추가 및 UT 데이터 규칙 참조 경로 갱신 |
| 1.0 | 2026-11-11 | Codex · Hi-gu-i 요청 | 개발 환경, 파일 구조, 이름 규칙 정리 · [e1203b2](https://github.com/Hi-gu-i/CROXER/commit/e1203b2) |
