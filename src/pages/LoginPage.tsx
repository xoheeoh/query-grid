import { useEffect, useState, type CSSProperties } from "react";
import { Alert, Banner, Button, Checkbox, Dialog, TextInput } from "@xoheeoh/components";

const OTP_DURATION_SEC = 4 * 60 + 59; // 04:59

/**
 * 포트폴리오 데모용 계정이다. 서버 인증 없이 화면에서만 비교한다.
 * 로그인 화면에 그대로 안내되므로 비밀 값이 아니다.
 */
const DEMO_ACCOUNT = {
  id: "demo",
  password: "demo1234",
  otp: "000000",
};

function formatRemainTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 로그인 화면 — 성공 시 /sample(MainPage)로 이동 */
export default function LoginPage() {
  // 값이 있으면 알림창을 띄운다. 닫으면 null로 돌아간다.
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  // true면 알림창을 닫을 때 메인 화면으로 이동한다.
  const [moveToMainOnAlertClose, setMoveToMainOnAlertClose] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [otpNo, setOtpNo] = useState("");
  const [saveId, setSaveId] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [remainSeconds, setRemainSeconds] = useState(OTP_DURATION_SEC);

  // 데모에서는 비밀번호 변경 안내 흐름을 보여주려고 항상 true로 둔다.
  const isChangeRequired = true;
  const [isChangePwModalOpen, setIsChangePwModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const isCounting = showOtpInput && remainSeconds > 0;

  useEffect(() => {
    if (!isCounting) return;

    const id = window.setInterval(() => {
      setRemainSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [isCounting]);

  const doLogin = async () => {
    if (!loginId.trim()) {
      setAlertMessage("아이디를 입력해 주세요.");
      return;
    }

    if (!password.trim()) {
      setAlertMessage("비밀번호를 입력해 주세요.");
      return;
    }

    if (loginId.trim() !== DEMO_ACCOUNT.id || password !== DEMO_ACCOUNT.password) {
      setAlertMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    if (!showOtpInput) {
      setRemainSeconds(OTP_DURATION_SEC);
      setShowOtpInput(true);
      return;
    }

    if (!otpNo.trim()) {
      setAlertMessage("인증코드를 입력해 주세요.");
      return;
    }

    if (remainSeconds <= 0) {
      setAlertMessage(`인증코드 입력시간이 초과되었습니다.\n인증코드 재요청 후 다시 시도해 주세요.`);
      return;
    }

    if (otpNo.trim() !== DEMO_ACCOUNT.otp) {
      setAlertMessage("인증코드가 올바르지 않습니다.");
      return;
    }

    if (isChangeRequired) {
      setIsChangePwModalOpen(true);
      return;
    }

    window.location.assign("/sample");
  };

  const handleResendOtp = () => {
    setRemainSeconds(OTP_DURATION_SEC);
  };

  const handleChangePwLater = () => {
    setIsChangePwModalOpen(false);
    setMoveToMainOnAlertClose(true);
    setAlertMessage("비밀번호 변경 기한이 90일 연장되었습니다.");
  };

  const isChangePwButtonDisabled =
    !currentPassword ||
    !newPassword ||
    !newPasswordConfirm ||
    newPassword !== newPasswordConfirm ||
    newPassword.length < 10;

  // 데모에서는 새 비밀번호를 저장하지 않고, 현재 비밀번호만 확인한 뒤 다음 화면으로 넘어간다.
  const handleChangePw = () => {
    if (currentPassword !== DEMO_ACCOUNT.password) {
      setAlertMessage(`현재 비밀번호가 올바르지 않습니다.\n확인 후 다시 시도해 주세요.`);
      return;
    }

    setIsChangePwModalOpen(false);
    setMoveToMainOnAlertClose(true);
    setAlertMessage("비밀번호가 변경되었습니다.\n(데모에서는 실제로 저장되지 않습니다.)");
  };

  const handleAlertClose = () => {
    setAlertMessage(null);
    if (moveToMainOnAlertClose) window.location.assign("/sample");
  };

  return (
    <div style={s.page}>
      <div style={s.wrapper}>
        <h1 style={s.logoContainer}>
          <img src="/img/logo_color.svg" alt="" style={s.logo} />
          <span style={s.logoTitle}>바우처 플랫폼</span>
          <span style={s.logoBadge}>Admin</span>
        </h1>

        <Banner
          type="info"
          message="데모 계정으로 로그인해 보세요."
          detailMessage={`아이디 ${DEMO_ACCOUNT.id} · 비밀번호 ${DEMO_ACCOUNT.password} · 인증코드 ${DEMO_ACCOUNT.otp}`}
        />

        <div style={s.form}>
          <TextInput
            size="lg"
            label="아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디를 입력해 주세요."
          />

          <TextInput
            size="lg"
            label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해 주세요."
            type="password"
          />

          {showOtpInput && (
            <div className="row-end gap-8">
              <div className="table-item-value" style={{ position: "relative" }}>
                <TextInput
                  size="lg"
                  label="인증코드"
                  value={otpNo}
                  onChange={(e) => setOtpNo(e.target.value)}
                  placeholder="인증코드를 입력해 주세요."
                />

                <span style={s.remainTime}>{formatRemainTime(remainSeconds)}</span>
              </div>
              <Button size="lg" label="재요청" onClick={handleResendOtp} />
            </div>
          )}

          <Checkbox label="아이디 저장하기" checked={saveId} onChange={(e) => setSaveId(e.target.checked)} />
        </div>

        <Button size="lg" label="로그인" onClick={doLogin} />
      </div>

      <div style={s.footer}>
        <span>
          <strong>고객센터</strong> 0000-0000
        </span>
      </div>

      {/* 비밀번호 변경 모달 */}
      <Dialog
        open={isChangePwModalOpen}
        onClose={() => setIsChangePwModalOpen(false)}
        title="비밀번호 변경"
        footer={
          <div className="flex-between" style={{ flex: 1 }}>
            <Button
              variant="outlined"
              color="neutral"
              label="취소"
              onClick={() => setIsChangePwModalOpen(false)}
            />
            <div className="row-center gap-8">
              <Button variant="outlined" color="neutral" label="90일 후에 변경" onClick={handleChangePwLater} />
              <Button label="변경" onClick={handleChangePw} disabled={isChangePwButtonDisabled} />
            </div>
          </div>
        }>
        <div style={s.changePwModalContent}>
          <p className="text-color-secondary">
            사용자의 개인정보 보호와 안전한 서비스 사용을 위해 비밀번호를 변경해주시기 바랍니다.
            <br />
            소중한 개인정보를 안전하게 지키기 위해 주기적으로(최소 3개월) 비밀번호를 변경해야 합니다.
          </p>

          <TextInput
            size="lg"
            label="현재 비밀번호"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호를 입력해 주세요."
            type="password"
          />

          <TextInput
            size="lg"
            label="신규 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="신규 비밀번호를 입력해 주세요."
            type="password"
          />

          <TextInput
            size="lg"
            label="신규 비밀번호 확인"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            placeholder="신규 비밀번호를 확인해 주세요."
            type="password"
          />

          <Banner
            type="info"
            message="비밀번호 정책"
            detailMessage={
              <>
                - 10~20자
                <br />- 영문대소/숫자/특수문자 중 2가지 이상 조합 (사용가능 특수문자: {"~ ` ! @ # $ % ^ & * ( ) _ - + = {} [ ] | \\ ; : ' \" < > , . ?"})
              </>
            }
          />
        </div>
      </Dialog>

      <Alert
        open={alertMessage !== null}
        onClose={handleAlertClose}
        title="알림"
        message={alertMessage ?? ""}
        primaryAction={{ label: "확인" }}
      />
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "var(--color-gray-50)",
  },
  wrapper: {
    backgroundColor: "var(--color-white)",
    width: 450,
    border: "1px solid var(--color-border-default)",
    borderRadius: "var(--r-lg)",
    padding: 36,
    display: "grid",
    gap: 36,
  },
  form: { display: "flex", flexDirection: "column", gap: 24 },
  logoContainer: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  logo: { width: 32, height: 32 },
  logoTitle: { fontSize: 20, fontWeight: 700, color: "var(--color-gray-900)", letterSpacing: -0.3 },
  logoBadge: {
    padding: "2px 7px",
    borderRadius: "var(--r-xs)",
    background: "var(--color-primary-50)",
    color: "var(--color-primary-800)",
    fontSize: 12,
    fontWeight: 600,
  },
  remainTime: {
    position: "absolute",
    right: 20,
    bottom: 14,
    fontSize: 12,
    color: "var(--color-danger)",
  },
  footer: {
    marginTop: 16,
    color: "var(--color-text-secondary)",
  },
  changePwModalContent: {
    display: "grid",
    gap: 24,
  },
};
