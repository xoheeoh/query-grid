# query-grid

**바우처 플랫폼 Admin** — 선불 지갑(모바일 상품권)을 운영하는 관리자용 화면 데모입니다.
고객별 지갑 상태와 충전·사용 내역을 조회하고, 상품권을 등록·관리하고, 엑셀로 내려받거나 올리는 흐름을 React + TypeScript로 구현했습니다.

> 포트폴리오용 데모입니다. 백엔드 없이 동작하며, 화면의 데이터는 모두 코드 안에 둔 예시 데이터입니다. 등록·수정·삭제 같은 저장 동작은 확인창과 완료 안내까지만 보여주고 실제로 저장되지는 않습니다.

UI 컴포넌트는 직접 만들어 npm에 배포한 [`@xoheeoh/components`](https://github.com/xoheeoh/components)를 사용합니다.

## 화면

| 메뉴 | 화면 | 보여주는 것 |
| :--- | :--- | :--- |
| 홈 | 대시보드 | 오늘 충전·사용액, 총 보유 잔액, 활성 지갑 수 카드 / 최근 30일 충전·사용 선 그래프(직접 그린 SVG, 마우스 툴팁, 표 보기) / 처리할 일 / 상품권별 잔액 비중. 카드를 누르면 해당 화면이 탭으로 열림 |
| 고객 지갑 | 고객 지갑 조회 | 고객별 지갑 상태·잔액 목록 → 상세(고객 정보, 보유 상품권, 최근 거래) → 지갑 정지·해제 |
| | 충전·사용 내역 | 고객별 기간 내 충전·사용 합계. 회원 ID·이름·휴대폰 검색, 엑셀 다운로드 |
| 상품권 관리 | 상품권 관리 | 상품권 목록 → 등록·수정 폼(필수값 확인, 이미지 업로드, 한도 관리 모달, 작성 중 이탈 확인) |
| | 상품권 그룹 관리 | 그룹 목록 → 등록·수정 폼(그룹명 + 포함 상품권 선택) |
| 고객센터 | 일괄 수기처리 | 요청 목록(상세, 마스킹해제) → 요청 화면: 양식 다운로드 → **엑셀 업로드를 브라우저에서 읽어 양식·필수값 검사** → 가능여부 확인 → 요청 등록 |
| | 상품권 양도 | 양도 내역 목록(상세, 마스킹해제) → 양도 요청 화면(회원 ID 조회 → 상품권 선택 → 요청) |
| 통계 | 알림 발송 통계 | 2단 머리글·합계 고정 행이 있는 표, 집계 기준 안내, 엑셀 다운로드 |

공통으로 들어간 것:

- 로그인(인증코드, 비밀번호 변경 안내) → 메인. 로그인 없이 `/sample`로 바로 들어오면 로그인 화면으로 돌려보냄. 로그아웃은 확인창을 거침
- 왼쪽 메뉴 + 탭: 여러 화면을 열어 두고 전환, 탭 우클릭 메뉴(닫기·다른 탭 닫기 등), 등록 화면이 열려 있으면 탭 전환 전에 확인
- 조회 화면 공통 틀: 제목 → 조회 도구막대 → 결과 표([AG Grid](https://www.ag-grid.com/)). 표 순번(No)은 정렬·페이지를 반영한 자리 번호
- 엑셀 다운로드: 표에 보이는 그대로 .xlsx로 저장(정렬·필터 반영, 2단 머리글 병합, 합계 행, 숫자 서식). 업로드용 빈 양식도 내려받을 수 있음
- 등록·수정 화면 공통: 필수값 확인과 오류 문구, 작성 중 나가기 확인, 알림창 위에서 Esc를 눌러도 화면이 같이 닫히지 않음, 라벨과 입력칸 연결(화면 낭독기)

| 주소 | 화면 |
| :--- | :--- |
| `/` | 로그인 |
| `/sample` | 메인 (로그인 후 화면) |

## 데모 계정

| 아이디 | 비밀번호 | 인증코드 |
| :--- | :--- | :--- |
| `demo` | `demo1234` | `000000` |

- 서버 인증 없이 화면에서만 확인하는 데모용 계정입니다. (`src/pages/LoginPage.tsx`의 `DEMO_ACCOUNT`)
- 로그인할 때마다 비밀번호 변경 안내가 뜹니다. "90일 후에 변경"을 누르거나, 현재 비밀번호에 `demo1234`를 넣고 "변경"을 누르면 메인 화면으로 넘어갑니다. 새 비밀번호는 저장되지 않습니다.
- 로그인 상태는 브라우저 저장소(localStorage)에만 기록됩니다.

## 실행

```bash
npm install      # 최초 1회 (의존성 설치)
npm run dev      # 개발 서버 (http://localhost:5180)
```

| 명령 | 설명 |
| :--- | :--- |
| `npm run dev` | 개발 서버 (저장하면 바로 반영) |
| `npm run build` | 타입 검사 후 배포용 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run typecheck` | TypeScript 타입 검사만 |

## 기술 구성

- React 18, TypeScript, Vite 5
- [`@xoheeoh/components`](https://www.npmjs.com/package/@xoheeoh/components) — Button, TextInput, Select, DateField, Dialog, Alert, Tabs, Toast 등
- AG Grid (Community) — 목록 표
- [`write-excel-file`](https://www.npmjs.com/package/write-excel-file) — 엑셀 파일 생성 (AG Grid 무료 버전에는 엑셀 내보내기가 없어서 사용)
- [`read-excel-file`](https://www.npmjs.com/package/read-excel-file) — 올린 엑셀을 브라우저에서 읽기 (일괄 수기처리 요청)
- `@mdi/js` — 아이콘

## 디렉터리 구조

```
public/
  img/              로고·예시 이미지 (주소 /img/... 로 접근)
src/
  layout/           앱 화면 틀 (Sidebar)
  menus/            사이드바 메뉴별 화면
    menuConfig.ts     메뉴 그룹·라벨·아이콘 정의
    MenuContent.tsx   메뉴 id ↔ 화면 컴포넌트 연결
    FormField.tsx     등록·수정 폼의 한 줄(라벨 + 입력 + 오류 문구)
    useSubviewEscape.ts  등록·상세 화면의 Esc 처리
    dashboard/        대시보드 (지표 계산, SVG 그래프)
    wallet/           고객 지갑 (지갑 조회·상세, 충전·사용 내역, 예시 데이터)
    voucher/          상품권 관리 (상품권 등록·수정 폼, 상품권 그룹)
    service/          고객센터 (일괄 수기처리·엑셀 읽기, 상품권 양도)
    stats/            통계 (알림 발송 통계)
  pages/            로그인, 메인 등 주소 단위 화면
  styles/           공통 토큰·레이아웃·테이블·AG Grid 스타일
  utils/            날짜·숫자·마스킹·엑셀·AG Grid 열 유틸, 로그인 기록
  App.tsx           로그인 화면 루트
  main.tsx          진입점 (주소에 따라 로그인/메인 선택, 로그인 여부 확인)
```

### Path Alias

상대 경로 대신 alias를 사용합니다. (`tsconfig.app.json` / `vite.config.ts`에 정의)

| Alias | 경로 |
| :--- | :--- |
| `@menus` | `src/menus` |
| `@pages` | `src/pages` |
| `@utils` | `src/utils` |

```ts
import { Button, Select, TextInput } from "@xoheeoh/components";
import { MENU_GROUPS } from "@menus";
import { formatAmount } from "@utils";
```

---

## 개발 규칙

### 1. 공통 컴포넌트 사용

`<input>`, `<select>` 등 네이티브 태그를 화면에서 직접 쓰지 않고 `@xoheeoh/components`의 컴포넌트를 사용합니다. (예외: 패키지에 없는 `<input type="file">`)

```tsx
// ❌
<input type="text" value={name} onChange={...} />

// ✅
import { TextInput, Select } from "@xoheeoh/components";

<TextInput value={name} onChange={(e) => setName(e.target.value)} />
<Select options={options} value={type} onValueChange={setType} />
```

- 컴포넌트에 필요한 옵션이 없거나 버그가 있으면 이 저장소에서 우회하지 않고, [components 저장소](https://github.com/xoheeoh/components)를 고쳐 새 버전을 배포한 뒤 사용합니다.
- 화면 한정 스타일(간격, 너비 등)은 사용하는 화면의 인라인/로컬 CSS로 처리합니다.
- 컴포넌트 사용법은 components 저장소의 Storybook을 참고합니다.

### 2. 신규 탭 메뉴는 `src/menus/`에 추가

1. 대메뉴 폴더에 페이지 파일(또는 폴더) 추가 — 예: `wallet/WalletList.tsx`
2. 해당 폴더의 `index.ts`에서 export
3. `menuConfig.ts`에 메뉴 항목(id, label, 그룹) 등록
4. `MenuContent.tsx`에서 메뉴 id ↔ 페이지 컴포넌트 매핑

### 3. 메뉴 파일 구조

**단순 화면** (모달·서브패널 등 부가 UI가 없음)은 단일 파일로 둡니다.

```
menus/stats/
  SendingStats.tsx    ← 화면 본문
  index.ts
```

**복합 화면** (모달, 등록/수정 패널 등 하위 UI가 있음)은 메뉴 단위로 폴더화합니다.

```
menus/service/BulkProcess/
  index.tsx                 ← 목록 (진입점)
  BulkRequestPanel.tsx      ← 요청 화면
  readUploadFile.ts         ← 엑셀 읽기·양식 검사

menus/voucher/VoucherManage/
  index.tsx
  form/                     ← 등록·수정이 같이 쓰는 폼 (탭 패널, 한도 모달)
```

### 4. 조회 화면 틀

조회 화면은 `page-header`(제목) → `filter-bar`(조회 도구막대) → `result-panel`(건수 + 표) 순서로 만듭니다. 스타일은 `src/styles/page-layout.css`에 있습니다.

- 표 열은 `COL.no / text / amount / date / fixed / badges / action`(`@utils`)으로 만들어 정렬 기준을 맞춥니다.
- 표마다 `onModelUpdated={refreshRowNumbers}`를 넣어야 순번(No)이 정렬·페이지 이동 뒤에도 맞습니다.
- 엑셀 다운로드는 `exportGridToExcel(gridApi, 파일이름)` 한 줄로 끝납니다.

### 5. 등록·수정 화면 틀

위로 덮이는 화면(`page-subview`)은 다음을 갖춥니다.

- 입력 한 줄은 `FormField`로 감싸서 라벨·필수 표시·오류 문구를 한 번에 처리합니다. 입력 컴포넌트에는 `FormField`가 넘겨주는 속성을 그대로 펼쳐 넣습니다.
- 저장 버튼은 필수값을 검사해 문제 칸에 오류를 표시한 뒤 확인창을 띄웁니다.
- 작성 중 나가기(뒤로가기·취소·Esc)는 확인창을 거칩니다. Esc는 `useSubviewEscape(panelRef, requestClose)`로 처리합니다.
- 등록과 수정이 같은 폼이면 하나의 컴포넌트에 `mode`와 `initialValues`를 넘겨 재사용합니다. (`VoucherFormPanel`, `VoucherGroupFormPanel`)

### 6. import는 alias path 사용

가능하면 상대 경로(`../../../utils/...`) 대신 alias로 import합니다.

```ts
import { toDateValue } from "@utils/dateUtils";
```
