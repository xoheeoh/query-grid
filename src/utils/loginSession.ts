import { format } from "date-fns";

const SESSION_KEY = "loginSession";

/** 로그인한 사용자 정보. 서버가 없는 데모라 브라우저(localStorage)에 보관한다. */
export type LoginSession = {
  id: string;
  name: string;
  /** 로그인에 성공한 시각. "YYYY-MM-DD HH:mm" */
  loginAt: string;
};

type StoredSession = Omit<LoginSession, "loginAt"> & { loginAt: string /* ISO 문자열 */ };

/** 로그인 성공 시 사용자 정보와 지금 시각을 저장한다. */
export function saveLoginSession(user: Pick<LoginSession, "id" | "name">, date: Date = new Date()) {
  const stored: StoredSession = { ...user, loginAt: date.toISOString() };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
  } catch {
    // 저장이 막힌 브라우저(시크릿 창 등)에서는 조용히 넘어간다. 헤더에 "-"로 표시된다.
  }
}

/** 저장된 로그인 정보를 돌려준다. 없거나 읽을 수 없으면 null */
export function getLoginSession(): LoginSession | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const stored = JSON.parse(saved) as Partial<StoredSession>;
    if (!stored.id || !stored.name || !stored.loginAt) return null;
    const date = new Date(stored.loginAt);
    if (Number.isNaN(date.getTime())) return null;
    return { id: stored.id, name: stored.name, loginAt: format(date, "yyyy-MM-dd HH:mm") };
  } catch {
    return null;
  }
}

/** 로그아웃 시 저장된 로그인 정보를 지운다. */
export function clearLoginSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // 지울 수 없어도 로그아웃은 진행한다.
  }
}
