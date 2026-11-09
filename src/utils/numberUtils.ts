/** 입력 문자열에서 숫자만 남기고 천 단위 콤마를 붙인다. */
export function formatThousandInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 천 단위 콤마가 포함된 금액 문자열에서 숫자만 추출한다. */
export function parseThousandInput(value: string): string {
  return value.replace(/\D/g, "");
}

/** 숫자를 천 단위 콤마 표시 문자열로 변환한다. */
export function formatAmount(value: number): string {
  return value.toLocaleString("ko-KR");
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** 날짜(Date) 또는 yyyyMMdd·yyyyMMddHHmm 형태의 문자열을 "yyyy-MM-dd HH:mm" 꼴로 바꾼다. */
export function formatDate(value: Date | string): string {
  if (!value) return "";
  const s = onlyDigits(String(value));

  if (s.length === 8) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }

  if (s.length === 12) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}`;
  }

  if (s.length === 14) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}`;
  }

  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}
