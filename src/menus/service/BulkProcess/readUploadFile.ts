import readXlsxFile, { type Row } from "read-excel-file";

/** 업로드 양식 종류. 환불·대량구매환불은 같은 양식이라 하나로 본다. */
export type UploadKind = "refund" | "extend";

export const REFUND_HEADERS = ["상품권번호", "상품권ID", "고객명", "은행코드", "계좌번호"] as const;
export const EXTEND_HEADERS = ["상품권번호", "상품권ID", "고객명", "연장 만료일 (YYYY-MM-DD)"] as const;

/** 파일에서 읽은 한 줄. 양식에 없는 칸은 빈 문자열이다. */
export type UploadRow = {
  giftCardNo: string;
  giftCardId: string;
  usrNm: string;
  bankCd: string;
  bankNo: string;
  extendDate: string;
  /** 그 줄의 문제. 없으면 빈 문자열 */
  rowError: string;
};

export type UploadResult =
  | { ok: true; kind: UploadKind; rows: UploadRow[] }
  | { ok: false; message: string; detail?: string };

/** 엑셀 칸 값을 글자로 바꾼다. 날짜는 yyyy-MM-dd, 숫자는 지수 표기 없이. */
function cellText(value: Row[number]): string {
  if (value == null) return "";
  if (value instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  if (typeof value === "number") return value.toLocaleString("fullwide", { useGrouping: false });
  return String(value).trim();
}

function sameHeaders(header: string[], expected: readonly string[]) {
  return expected.length === header.length && expected.every((name, index) => name === header[index]);
}

/** 줄 하나의 필수값과 형식을 검사해 문제를 글로 돌려준다. */
function findRowError(kind: UploadKind, row: UploadRow): string {
  const missing: string[] = [];
  if (!row.giftCardNo) missing.push("상품권번호");
  if (!row.giftCardId) missing.push("상품권ID");
  if (!row.usrNm) missing.push("고객명");
  if (kind === "refund") {
    if (!row.bankCd) missing.push("은행코드");
    if (!row.bankNo) missing.push("계좌번호");
  } else if (!row.extendDate) {
    missing.push("연장 만료일");
  }
  if (missing.length > 0) return `필수값 누락: ${missing.join(", ")}`;
  if (kind === "extend" && !/^\d{4}-\d{2}-\d{2}$/.test(row.extendDate)) return "연장 만료일은 YYYY-MM-DD 형식이어야 합니다.";
  if (kind === "refund" && !/^\d{3}$/.test(row.bankCd)) return "은행코드는 숫자 3자리여야 합니다.";
  if (kind === "refund" && !/^\d{10,16}$/.test(row.bankNo)) return "계좌번호는 숫자 10~16자리여야 합니다.";
  return "";
}

/**
 * 업로드한 엑셀을 브라우저에서 읽어 양식을 검사한다.
 * 첫 줄이 양식의 열 제목과 똑같아야 하고, 둘째 줄부터를 데이터로 본다.
 */
export async function readUploadFile(file: File): Promise<UploadResult> {
  if (!/\.xlsx$/i.test(file.name)) {
    return { ok: false, message: "엑셀 파일(.xlsx)만 올릴 수 있습니다.", detail: `올린 파일: ${file.name}` };
  }

  let rows: Row[];
  try {
    rows = await readXlsxFile(file);
  } catch {
    return { ok: false, message: "파일을 읽을 수 없습니다. 엑셀(.xlsx) 파일이 맞는지 확인해 주세요." };
  }

  const header = (rows[0] ?? []).map(cellText);
  const kind: UploadKind | null = sameHeaders(header, REFUND_HEADERS)
    ? "refund"
    : sameHeaders(header, EXTEND_HEADERS)
      ? "extend"
      : null;
  if (!kind) {
    return {
      ok: false,
      message: "양식이 맞지 않습니다. '양식 다운로드'로 받은 파일의 첫 줄(열 제목)을 그대로 두고 작성해 주세요.",
      detail: `읽은 열 제목: ${header.filter(Boolean).join(", ") || "(없음)"}`,
    };
  }

  const dataRows = rows.slice(1).filter((row) => row.some((cell) => cellText(cell) !== ""));
  if (dataRows.length === 0) {
    return { ok: false, message: "입력된 데이터가 없습니다. 2번째 줄부터 작성해 주세요." };
  }

  const parsed = dataRows.map((cells) => {
    const [giftCardNo, giftCardId, usrNm, fourth, fifth] = cells.map(cellText);
    const row: UploadRow = {
      giftCardNo: giftCardNo ?? "",
      giftCardId: giftCardId ?? "",
      usrNm: usrNm ?? "",
      bankCd: kind === "refund" ? (fourth ?? "") : "",
      bankNo: kind === "refund" ? (fifth ?? "") : "",
      extendDate: kind === "extend" ? (fourth ?? "") : "",
      rowError: "",
    };
    row.rowError = findRowError(kind, row);
    return row;
  });

  return { ok: true, kind, rows: parsed };
}
