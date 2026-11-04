import { useEffect, useMemo, useState } from "react";
import { AllCommunityModule, ColDef } from "ag-grid-community";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { COL, toDateValue } from "@utils";
import {
  Banner,
  Button,
  DateField,
  Dialog,
  TextInput,
  Select,
} from "@xoheeoh/components";
import styles from "../../VoucherManagePanel.module.css";

type AnnualLimitModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
};

type LimitRow = {
  id: number;
  applyDateTime: string;
  limitAmount: number;
  registrant: string;
};

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: LimitRow[] = [
  {
    id: 1,
    applyDateTime: "202601011200",
    limitAmount: 1000000,
    registrant: "홍길동 (gildong***)",
  },
  {
    id: 2,
    applyDateTime: "202601011200",
    limitAmount: 1000000,
    registrant: "홍길동 (gildong***)",
  },
  {
    id: 3,
    applyDateTime: "202601011200",
    limitAmount: 1000000,
    registrant: "홍길동 (gildong***)",
  },
];

function ManageRenderer() {
  return (
    <span className="grid-cell-center">
      <Button size="sm" variant="outlined" color="destructive" onClick={() => {}} label="삭제" />
    </span>
  );
}

function UnmaskingRenderer() {
  return (
    <span className="grid-cell-center">
      <Button size="sm" variant="outlined" color="neutral" onClick={() => {}} label="마스킹해제" />
    </span>
  );
}

// 연 발행한도 관리 모달
export function AnnualLimitModal({ open, onClose, onSave }: AnnualLimitModalProps) {
  const [limitApplyDate, setLimitApplyDate] = useState(() => toDateValue(new Date()));
  const [rowData, setRowData] = useState<LimitRow[]>([]);

  const columnDefs = useMemo<ColDef<LimitRow>[]>(
    () => [
      COL.no<LimitRow>(),
      COL.date<LimitRow>("적용일시", "applyDateTime", { width: 150 }),
      COL.amount<LimitRow>("발행한도 (천원)", "limitAmount", { width: 150 }),
      COL.text<LimitRow>("등록자", "registrant", { flex: 1 }),
      COL.action<LimitRow>("관리", undefined, {
        colId: "delete",
        width: 80,
        cellRenderer: ManageRenderer,
      }),
      COL.action<LimitRow>("마스킹해제", undefined, {
        colId: "unmasking",
        width: 100,
        cellRenderer: UnmaskingRenderer,
      }),
    ],
    []
  );

  useEffect(() => {
    if (open) {
      setRowData(MOCK_ROWS);
    }
  }, [open]);

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="연 발행한도 관리"
      size="lg"
      footer={
        <>
          <Button variant="outlined" color="neutral" onClick={onClose} label="닫기" />
          <Button onClick={onSave} label="저장" />
        </>
      }>
      <div style={{ display: "grid", gap: 16 }}>
        <Banner
          type="info"
          message="적용일자별 한도를 등록 및 관리합니다. 등록된 한도는 해당 적용일자부터 반영됩니다."
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
          <DateField label="적용일자" required value={limitApplyDate} onValueChange={setLimitApplyDate} />
          <Select
            label="적용시간"
            required
            defaultValue={"00"}
            options={Array.from({ length: 24 }, (_, i) => ({
              value: i.toString().padStart(2, "0"),
              label: `${i.toString().padStart(2, "0")}시`,
            }))}
          />
          <TextInput
            label="발행한도 (천원)"
            required
            placeholder="발행한도를 입력해 주세요. (숫자만 입력)"
            align="right"
            className="table-item-value"
          />
          <Button color="neutral" onClick={() => {}} label="추가" />
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

export default AnnualLimitModal;
