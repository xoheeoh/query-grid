import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  decodeJwt,
  deepFind,
  formatRemain,
  isDupLogin,
  readBody,
  type LogoutReason,
  type OutState,
  type RefreshResult,
} from "../helpers";

export interface SessionPageProps {
  accessToken: string;
  refreshToken: string;
  loginSessAt: number | null;
  onLoginSessAt: (ts: number) => void;
  onRefresh: () => Promise<RefreshResult>;
  onLogout: (reason?: LogoutReason) => void;
}

// 로그인 성공 후 세션 화면
// - 유휴(무활동) 타임아웃 카운트다운: 서버가 응답마다 내려주는 loginSessAt 기준(슬라이딩). 0 도달 시 자동 로그아웃.
// - 토큰 만료 카운트다운: JWT exp 기준(보조 표시).
export default function SessionPage({
  accessToken,
  loginSessAt,
  onLoginSessAt,
  onRefresh,
  onLogout,
}: SessionPageProps) {
  const [now, setNow] = useState(Date.now());
  const [out, setOut] = useState<OutState>({ title: "", status: "", data: "대기 중…" });
  // 유휴 총 창(window) — loginSessAt 갱신 시점에 측정(진행바 비율용)
  const [idleWindow, setIdleWindow] = useState<number | null>(null);
  const loggedOut = useRef(false);

  // 매초 갱신
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // loginSessAt 갱신될 때마다 유휴 창 크기 재측정
  useEffect(() => {
    if (loginSessAt) setIdleWindow(loginSessAt - Date.now());
  }, [loginSessAt]);

  // ── 유휴 타임아웃 계산 ──
  const idleRemain = loginSessAt ? loginSessAt - now : null;
  const idleExpired = idleRemain != null && idleRemain <= 0;
  const idleWarn = idleRemain != null && idleRemain > 0 && idleRemain < 30000; // 30초 미만 경고

  // 유휴 만료 시 자동 로그아웃 (1회만)
  useEffect(() => {
    if (idleExpired && !loggedOut.current) {
      loggedOut.current = true;
      onLogout("idle");
    }
  }, [idleExpired, onLogout]);

  // ── 토큰 만료 계산(보조) ──
  const claims = useMemo(() => decodeJwt(accessToken), [accessToken]);
  const expMs = claims?.exp ? claims.exp * 1000 : null;
  const iatMs = claims?.iat ? claims.iat * 1000 : null;
  const tokenRemain = expMs != null ? expMs - now : null;

  const show = (title: string, status: string | number, data: unknown) =>
    setOut({ title, status, data: typeof data === "string" ? data : JSON.stringify(data, null, 2) });

  // 보호 API 호출 — 응답의 loginSessAt 으로 유휴시간 연장(슬라이딩)
  const callApi = async () => {
    const path = window.prompt("호출할 GET 경로", "/api/tbsiMbs");
    if (!path) return;
    try {
      const res = await fetch(path, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await readBody(res);
      if (isDupLogin(data)) {
        // 중복로그인 감지 → 이전 세션 강제 로그아웃
        show(`GET ${path}`, res.status, data);
        onLogout("dup");
        return;
      }
      const sessAt = deepFind(data, "loginSessAt");
      if (sessAt) onLoginSessAt(Number(sessAt)); // 활동 → 유휴 연장
      show(`GET ${path}`, res.status, data);
    } catch (e) {
      show("API 오류", "-", String(e));
    }
  };

  // 리프레시 (부모가 토큰·loginSessAt 갱신)
  const refresh = async () => {
    const { status, data } = await onRefresh();
    show("리프레시", status, data);
  };

  // 유휴 표시 색상/비율
  const idleColor = idleExpired ? "#d32f2f" : idleWarn ? "#ed6c02" : "#1565c0";
  const idleRatio = idleRemain != null && idleWindow ? Math.max(0, Math.min(1, idleRemain / idleWindow)) : 0;

  const s: Record<string, CSSProperties> = {
    page: { maxWidth: 720, margin: "40px auto", padding: "0 16px" },
    fs: { border: "1px solid #ccc", borderRadius: 8, marginBottom: 16, padding: 16 },
    idleBig: { fontSize: 56, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: idleColor, margin: "8px 0" },
    tokenSmall: { fontSize: 20, fontVariantNumeric: "tabular-nums", color: "#555" },
    barWrap: { background: "#eee", borderRadius: 6, height: 14, overflow: "hidden", marginTop: 8 },
    bar: { background: idleColor, height: "100%", width: `${idleRatio * 100}%`, transition: "width 1s linear" },
    btn: { padding: "8px 16px", marginRight: 8, cursor: "pointer" },
    pre: {
      background: "#1e1e1e",
      color: "#d4d4d4",
      padding: 16,
      borderRadius: 8,
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
    },
    label: { display: "inline-block", width: 130, color: "#555" },
    hint: { color: "#666", fontSize: 13 },
    row: { margin: "4px 0" },
  };

  return (
    <div style={s.page}>
      <h1 style={{ fontSize: 20 }}>세션 — 로그인 성공 ✅</h1>

      <fieldset style={s.fs}>
        <legend>유휴(무활동) 타임아웃까지 남은 시간</legend>
        <div style={s.idleBig}>{idleRemain != null ? formatRemain(idleRemain) : "—"}</div>
        <div style={s.barWrap}>
          <div style={s.bar} />
        </div>
        <p style={s.hint}>
          서버가 응답마다 내려주는 <b>loginSessAt</b> 기준. <b>API 호출(아래 버튼)마다 시간이 연장(슬라이딩)</b>되며,
          연장 없이 0이 되면 자동 로그아웃됩니다.
        </p>
        <div style={{ marginTop: 4 }}>
          <span style={s.label}>토큰 만료까지</span>
          <span style={s.tokenSmall}>{tokenRemain != null ? formatRemain(tokenRemain) : "—"}</span>
          <span style={s.hint}> (JWT exp · 419 기준)</span>
        </div>
        <div style={{ marginTop: 12 }}>
          <button style={s.btn} onClick={refresh}>
            리프레시
          </button>
          <button style={s.btn} onClick={callApi}>
            인증요청(GET) — 유휴 연장
          </button>
          <button style={s.btn} onClick={() => onLogout()}>
            로그아웃
          </button>
        </div>
      </fieldset>

      <fieldset style={s.fs}>
        <legend>토큰 클레임</legend>
        {claims ? (
          <>
            <div style={s.row}>
              <span style={s.label}>tokenType</span>
              {String(claims.tokenType ?? "-")}
            </div>
            <div style={s.row}>
              <span style={s.label}>sysType</span>
              {String(claims.sysType ?? "-")}
            </div>
            <div style={s.row}>
              <span style={s.label}>empNo / uid</span>
              {String(claims.empNo ?? claims.uid ?? "-")}
            </div>
            <div style={s.row}>
              <span style={s.label}>loginSessKey</span>
              <span style={s.hint}>{String(claims.loginSessKey ?? "-")}</span>
            </div>
            <div style={s.row}>
              <span style={s.label}>발급(iat)</span>
              {iatMs ? new Date(iatMs).toLocaleString() : "-"}
            </div>
            <div style={s.row}>
              <span style={s.label}>만료(exp)</span>
              {expMs ? new Date(expMs).toLocaleString() : "-"}
            </div>
          </>
        ) : (
          <span style={s.hint}>토큰 디코딩 불가</span>
        )}
      </fieldset>

      <fieldset style={s.fs}>
        <legend>응답 {out.title && `— ${out.title} (HTTP ${out.status})`}</legend>
        <pre style={s.pre}>{out.data}</pre>
      </fieldset>
    </div>
  );
}
