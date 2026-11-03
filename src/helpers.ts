// 공통 헬퍼 모음

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ApiBody = JsonValue | string;

export interface JwtClaims {
  tokenType?: string;
  sysType?: string;
  empNo?: string;
  uid?: string;
  loginSessKey?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export interface OutState {
  title: string;
  status: string | number;
  data: string;
}

export type LogoutReason = 'idle' | 'dup' | string | undefined;

export interface RefreshResult {
  status: string | number;
  data: ApiBody;
}

// 응답 본문 안전 파싱 (빈 본문·비JSON 대응)
// - 인터셉터 거부(401/403/419 등)는 본문 없이 상태코드만 오므로 res.json() 직접 호출 시 예외 발생
export async function readBody(res: Response): Promise<ApiBody> {
  const text = await res.text();
  if (!text) {
    const note =
      ({ 401: '인증 실패(토큰 없음/무효)', 403: '인가 거부', 419: '토큰 만료(리프레시 필요)' } as Record<number, string>)[
        res.status
      ] || '(빈 응답)';
    return note;
  }
  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return text;
  }
}

// 응답 객체에서 키 재귀 탐색 (토큰 위치 가변 대응)
export function deepFind(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== 'object') return null;
  const record = obj as Record<string, unknown>;
  if (record[key]) return record[key];
  for (const k in record) {
    const v = deepFind(record[k], key);
    if (v) return v;
  }
  return null;
}

// 중복로그인(4011) 신호 감지 — 다른 곳에서 동일 계정 로그인 시 인터셉터가 내려줌
export function isDupLogin(data: unknown): boolean {
  return !!(
    data &&
    typeof data === 'object' &&
    String((data as { rsltCd?: unknown }).rsltCd) === '4011'
  );
}

// JWT payload 디코딩 (base64url + UTF-8 한글 클레임 대응)
// - 검증 없이 디코딩만 (만료시각·클레임 표시용)
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const part = String(token).split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

// 밀리초 → mm:ss 포맷 (음수는 00:00)
export function formatRemain(ms: number): string {
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}
