# query-grid

**바우처 플랫폼 Admin** — 선불 지갑(모바일 상품권)을 운영하는 관리자용 화면 데모입니다.
사용자별 충전·사용 내역과 잔액을 목록으로 조회하고, 조회 결과를 Excel로 내려받는 화면을 React + TypeScript로 구현했습니다.

> 포트폴리오용 데모입니다. 백엔드 없이 동작하며, 화면의 데이터는 모두 예시 데이터입니다.

UI 컴포넌트는 직접 만들어 npm에 배포한 [`@xoheeoh/components`](https://github.com/xoheeoh/components)를 사용합니다.

## 주요 화면

- 로그인 (인증코드 입력, 비밀번호 변경 안내) → 메인
- 메인: 왼쪽 메뉴 + 탭으로 여러 화면을 열어 두고 전환
- 조회 화면: 조건 검색, 기간 선택, [AG Grid](https://www.ag-grid.com/) 목록
- Excel 다운로드: 표에 보이는 그대로 .xlsx로 저장 (정렬·필터가 적용된 전체 행, 2단 헤더 병합, 고정 합계 행, 숫자 서식). 업로드용 빈 양식도 내려받을 수 있습니다.
- 등록·수정 화면: 탭으로 나눈 입력 폼, 확인·실패 알림창

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

## 실행

```bash
npm install      # 최초 1회 (의존성 설치)
npm run dev      # 개발 서버 (http://localhost:5180)
```

| 명령 | 설명 |
| :--- | :--- |
| `npm run dev` | 개발 서버 (저장하면 바로 반영) |
| `npm run build` | 배포용 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run typecheck` | TypeScript 타입 검사 |

`/api` 요청은 Vite 프록시로 `http://localhost:5678`에 전달하도록 설정되어 있습니다. 백엔드를 붙일 때 `vite.config.ts`의 `server.proxy['/api'].target`을 수정합니다.

## 기술 구성

- React 18, TypeScript, Vite 5
- [`@xoheeoh/components`](https://www.npmjs.com/package/@xoheeoh/components) — Button, TextInput, Select, DateField, Dialog, Alert, Tabs 등
- AG Grid — 목록 화면
- [`write-excel-file`](https://www.npmjs.com/package/write-excel-file) — Excel 파일 생성 (AG Grid 무료 버전에는 Excel 내보내기가 없어서 사용)
- `@mdi/js` — 아이콘

## 디렉터리 구조

```
public/
  img/            로고·예시 이미지 (주소 /img/... 로 접근)
src/
  layout/         앱 화면 틀 (Sidebar)
  menus/          사이드바 메뉴별 화면
    menuConfig.ts   메뉴 그룹·라벨·아이콘 정의
    wallet/         고객 지갑 (지갑 조회, 충전·사용 내역)
    voucher/        상품권 관리 (상품권, 상품권 그룹)
    service/        고객센터 (일괄 수기처리, 상품권 양도)
    stats/          통계 (알림 발송 통계)
  pages/          로그인, 메인 등 주소 단위 화면
  styles/         공통 토큰·레이아웃·테이블·AG Grid 스타일
  utils/          날짜·숫자·AG Grid 컬럼 유틸
  App.tsx         화면 전환 루트
  main.tsx        진입점
  helpers.ts      API 응답 파싱·인증 관련 헬퍼
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

`<input>`, `<select>` 등 네이티브 태그를 화면에서 직접 쓰지 않고 `@xoheeoh/components`의 컴포넌트를 사용합니다.

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
  index.tsx                 ← 진입점
  BulkRequestPanel.tsx
  BulkRequestPanel.module.css

menus/voucher/VoucherManage/
  index.tsx
  edit/ … register/ …       ← 하위 패널·모달
```

### 4. import는 alias path 사용

가능하면 상대 경로(`../../../utils/...`) 대신 alias로 import합니다.

```ts
import { toDateValue } from "@utils/dateUtils";
```
