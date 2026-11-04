import { useEffect, useMemo, useRef, useState } from "react";
import { AllCommunityModule, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { COL, formatThousandInput, parseThousandInput, toDateValue } from "@utils";
import { Banner, Button, DateField, Dialog, TextInput, Select } from "@xoheeoh/components";
import styles from "../../VoucherManagePanel.module.css";

/** 어떤 한도(또는 기간)를 관리하는 모달인지 */
export type LimitModalKind = "annualIssuance" | "annualDiscount" | "monthlyDiscountPurchase" | "purchaseCancelPeriod";

export const LIMIT_MODAL_PRESETS: Record<LimitModalKind, { title: string; valueLabel: string; unit: string }> = {
  annualIssuance: { title: "연 발행한도 관리", valueLabel: "발행한도", unit: "천원" },
  annualDiscount: { title: "연 할인판매한도 관리", valueLabel: "할인판매한도", unit: "천원" },
  monthlyDiscountPurchase: { title: "월 할인구매한도 관리", valueLabel: "할인구매한도", unit: "천원" },
  purchaseCancelPeriod: { title: "구매취소 가능기간 관리", valueLabel: "구매취소 가능기간", unit: "일" },
};

type LimitHistoryModalProps = {
  /** null이면 닫힌 상태 */
  kind: LimitModalKind | null;
  onClose: () => void;
  onSave: (kind: LimitModalKind) => void;
};

type LimitRow = {
  id: number;
  applyDateTime: string;
  value: number;
  registrantName: string;
  registrantId: string;
  /** 마스킹해제를 누르면 true. 아이디를 가리지 않고 보여준다. */
  unmasked: boolean;
};

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: LimitRow[] = [
  { id: 1, applyDateTime: "202701010000", value: 1500000, registrantName: "홍길동", registrantId: "gildonghong", unmasked: false },
  { id: 2, applyDateTime: "202707010000", value: 1800000, registrantName: "홍길동", registrantId: "gildonghong", unmasked: false },
  { id: 3, applyDateTime: "202801010000", value: 2000000, registrantName: "김민수", registrantId: "minsukim", unmasked: false },
];

/** 아이디 앞 7자만 남기고 가린다. 예: gildong**** */
function maskId(id: string) {
  return id.slice(0, 7) + "*".repeat(Math.max(0, id.length - 7));
}

function DeleteRenderer(params: ICellRendererParams<LimitRow>) {
  const onDelete = params.context?.onDelete as ((id: number) => void) | undefined;
  return (
    <span className="grid-cell-center">
      <Button
        size="sm"
        variant="outlined"
        color="destructive"
        onClick={() => {
          if (params.data) onDelete?.(params.data.id);
        }}
        label="삭제"
      />
    </span>
  );
}

function UnmaskingRenderer(params: ICellRendererParams<LimitRow>) {
  const onToggleMask = params.context?.onToggleMask as ((id: number) => void) | undefined;
  return (
    <span className="grid-cell-center">
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        onClick={() => {
          if (params.data) onToggleMask?.(params.data.id);
        }}
        label={params.data?.unmasked ? "마스킹" : "마스킹해제"}
      />
    </span>
  );
}

/** 적용일자별 한도(또는 기간)를 등록·삭제하는 모달. 어떤 항목인지는 kind로 정한다. */
export function LimitHistoryModal({ kind, onClose, onSave }: LimitHistoryModalProps) {
  // 닫히는 동안에도 제목이 비지 않도록 마지막 종류를 기억한다.
  const lastKindRef = useRef<LimitModalKind>("annualIssuance");
  if (kind) lastKindRef.current = kind;
  const preset = LIMIT_MODAL_PRESETS[lastKindRef.current];

  const [applyDate, setApplyDate] = useState(() => toDateValue(new Date()));
  const [applyHour, setApplyHour] = useState("00");
  const [value, setValue] = useState("");
  const [valueError, setValueError] = useState("");
  const [rowData, setRowData] = useState<LimitRow[]>([]);

  // 열릴 때마다 입력칸과 목록을 처음 상태로 돌린다.
  useEffect(() => {
    if (!kind) return;
    setApplyDate(toDateValue(new Date()));
    setApplyHour("00");
    setValue("");
    setValueError("");
    setRowData(MOCK_ROWS);
  }, [kind]);

  const handleAdd = () => {
    const digits = parseThousandInput(value);
    if (!digits) {
      setValueError(`${preset.valueLabel} 값을 입력해 주세요.`);
      return;
    }
    setRowData((prev) => [
      ...prev,
      {
        id: Date.now(),
        applyDateTime: `${applyDate.replace(/-/g, "")}${applyHour}00`,
        value: Number(digits),
        registrantName: "홍길동",
        registrantId: "demo",
        unmasked: false,
      },
    ]);
    setValue("");
    setValueError("");
  };

  const handleDelete = (id: number) => {
    setRowData((prev) => prev.filter((row) => row.id !== id));
  };

  const handleToggleMask = (id: number) => {
    setRowData((prev) => prev.map((row) => (row.id === id ? { ...row, unmasked: !row.unmasked } : row)));
  };

  const columnDefs = useMemo<ColDef<LimitRow>[]>(
    () => [
      COL.no<LimitRow>(),
      COL.date<LimitRow>("적용일시", "applyDateTime", { width: 150 }),
      COL.amount<LimitRow>(`${preset.valueLabel} (${preset.unit})`, "value", { width: 170 }),
      COL.text<LimitRow>("등록자", "registrantName", {
        flex: 1,
        // 이름 뒤에 아이디를 붙여 보여준다. 마스킹해제 전에는 아이디를 가린다.
        valueGetter: (params) =>
          params.data
            ? `${params.data.registrantName} (${params.data.unmasked ? params.data.registrantId : maskId(params.data.registrantId)})`
            : "",
      }),
      COL.action<LimitRow>("관리", undefined, { colId: "delete", width: 80, cellRenderer: DeleteRenderer }),
      COL.action<LimitRow>("마스킹해제", undefined, { colId: "unmasking", width: 110, cellRenderer: UnmaskingRenderer }),
    ],
    [preset],
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  return (
    <Dialog
      open={kind !== null}
      onClose={onClose}
      title={preset.title}
      size="lg"
      footer={
        <>
          <Button variant="outlined" color="neutral" onClick={onClose} label="닫기" />
          <Button onClick={() => kind && onSave(kind)} label="저장" />
        </>
      }>
      <div style={{ display: "grid", gap: 16 }}>
        <Banner
          type="info"
          message={`적용일자별 ${preset.valueLabel} 등록·관리 화면입니다. 등록된 값은 해당 적용일자부터 반영됩니다.`}
          detailMessage={
            <>
              등록내역에서는 적용 예정 내역만 조회가 가능하며, 현재 시점에 적용 중인 내역은 등록/수정 화면에 반영되어
              확인이 가능합니다.
              <br />
              동일 적용일자에 내역이 복수 등록되는 경우, 가장 최근 등록 건으로 업데이트됩니다.
            </>
          }
        />

        <div className={`row-end gap-8 ${styles.modalBox}`}>
          <DateField label="적용일자" required value={applyDate} onValueChange={setApplyDate} />
          <Select
            label="적용시간"
            required
            value={applyHour}
            onValueChange={setApplyHour}
            options={Array.from({ length: 24 }, (_, i) => {
              const hour = i.toString().padStart(2, "0");
              return { value: hour, label: `${hour}시` };
            })}
          />
          <TextInput
            label={`${preset.valueLabel} (${preset.unit})`}
            required
            placeholder="숫자만 입력"
            align="right"
            inputMode="numeric"
            className="table-item-value"
            value={value}
            status={valueError ? "negative" : "default"}
            description={valueError || undefined}
            onChange={(event) => {
              setValue(formatThousandInput(event.target.value));
              setValueError("");
            }}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
          />
          <Button color="neutral" onClick={handleAdd} label="추가" />
        </div>

        <div className={styles.modalGridPanel}>
          <span className="grid-count-badge">총 {rowData.length.toLocaleString("ko-KR")} 건</span>

          <AgGridProvider modules={[AllCommunityModule]}>
            <div className="ag-theme-alpine grid-fill-wrap">
              <AgGridReact<LimitRow>
                theme="legacy"
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                context={{ onDelete: handleDelete, onToggleMask: handleToggleMask }}
                pagination
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50]}
                paginationPanels={["pageSize", "pageSummary"]}
                animateRows
                rowHeight={40}
                headerHeight={40}
                localeText={{
                  noRowsToShow: "조회 결과가 없습니다.",
                  pageSizeSelectorLabel: "",
                }}
                getRowId={(p) => String(p.data.id)}
              />
            </div>
          </AgGridProvider>
        </div>
      </div>
    </Dialog>
  );
}

export default LimitHistoryModal;
