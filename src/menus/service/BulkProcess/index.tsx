import { useEffect, useMemo, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef } from "ag-grid-community";
import { COL, toDateValue } from "@utils";
import { Button, Checkbox, CheckboxGroup, DateField, Select } from "@xoheeoh/components";
import BulkRequestPanel from "./BulkRequestPanel";

const PROCESS_TYPE_OPTIONS = [
  { label: "전체", value: "" },
  { label: "환불", value: "refund" },
  { label: "만료연장", value: "extend" },
  { label: "대량구매환불", value: "bulkRefund" },
];
const DATE_RANGE_TYPE_OPTIONS = [
  { label: "요청일", value: "requestDate" },
  { label: "상태 변경일", value: "statusChangeDate" },
];
const STATUS_OPTIONS = [
  { label: "확인중", value: "confirming" },
  { label: "확인완료", value: "confirmed" },
  { label: "요청완료", value: "completed" },
  { label: "요청취소", value: "canceled" },
] as const;

const STATUS_VALUES = STATUS_OPTIONS.map((o) => o.value);

function optionLabel(options: readonly { label: string; value: string }[], value: string | null | undefined) {
  if (value == null || value === "") return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

type BulkProcessRow = {
  id: number;
  requestDate: string;
  processType: string;
  giftCard: number;
  requester: string;
  status: string;
};

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: BulkProcessRow[] = [
  {
    id: 1,
    requestDate: "20260701100000",
    processType: "refund",
    giftCard: 100000,
    requester: "홍길동 (gildong*****)",
    status: "confirming",
  },
  {
    id: 2,
    requestDate: "20260701100000",
    processType: "bulkRefund",
    giftCard: 100000,
    requester: "홍길동 (gildong*****)",
    status: "confirmed",
  },
  {
    id: 3,
    requestDate: "20260701100000",
    processType: "extend",
    giftCard: 50000,
    requester: "홍길동 (gildong*****)",
    status: "completed",
  },
];

function DetailRenderer() {
  return (
    <span className="grid-cell-center">
      <Button size="sm" variant="outlined" color="neutral" onClick={() => {}} label="상세" />
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

export default function BulkProcess() {
  const [processType, setProcessType] = useState<string>("");
  const [dateRangeType, setDateRangeType] = useState<string>("requestDate");
  const [dayFrom, setDayFrom] = useState("");
  const [dayTo, setDayTo] = useState("");
  const [dayShortcut, setDayShortcut] = useState("today");
  const [statuses, setStatuses] = useState<string[]>([...STATUS_VALUES]);
  const [rowData, setRowData] = useState<BulkProcessRow[]>([]);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const allStatusesSelected = STATUS_VALUES.every((value) => statuses.includes(value));
  const someStatusesSelected = statuses.length > 0 && !allStatusesSelected;

  const handleToggleAllStatuses = (checked: boolean) => {
    setStatuses(checked ? [...STATUS_VALUES] : []);
  };

  const handleReset = () => {
    const today = toDateValue(new Date());
    setProcessType("");
    setDateRangeType("requestDate");
    setDayFrom(today);
    setDayTo(today);
    setDayShortcut("today");
    setStatuses([...STATUS_VALUES]);
    setRowData([]);
  };

  const handleSearch = () => {
    setRowData(MOCK_ROWS);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const columnDefs = useMemo<ColDef<BulkProcessRow>[]>(
    () => [
      COL.no<BulkProcessRow>(),
      COL.date<BulkProcessRow>("요청일시", "requestDate", { width: 200 }),
      COL.fixed<BulkProcessRow>("처리구분", "processType", {
        width: 130,
        valueFormatter: (p) => optionLabel(PROCESS_TYPE_OPTIONS, p.value),
      }),
      COL.amount<BulkProcessRow>("대상 상품권 수", "giftCard", { width: 150 }),
      COL.text<BulkProcessRow>("요청자", "requester", { minWidth: 180, flex: 1 }),
      COL.fixed<BulkProcessRow>("상태", "status", {
        width: 150,
        valueFormatter: (p) => optionLabel(STATUS_OPTIONS, p.value),
      }),
      COL.action<BulkProcessRow>("관리", undefined, {
        colId: "detail",
        width: 100,
        cellRenderer: DetailRenderer,
      }),
      COL.action<BulkProcessRow>("마스킹해제", undefined, {
        colId: "unmasking",
        width: 120,
        cellRenderer: UnmaskingRenderer,
      }),
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  return (
    <div className="page-root">
      <div className="flex-between">
        <div className="page-title">
          <h3 className="text-heading3">일괄 수기처리</h3>
          <p className="text-body2 text-color-secondary">
            대량의 환불/만료연장 요청 건을 엑셀 업로드를 통해 처리합니다.
          </p>
        </div>

        <Button onClick={() => setIsRequestOpen(true)} label="일괄 수기처리 요청" />
      </div>

      <div className="filter-panel">
        <div className="flex-between">
          <span className="text-subtitle2">조회옵션</span>
          <div className="row-center gap-8">
            <Button size="sm" variant="outlined" color="neutral" onClick={handleReset} label="초기화" />
            <Button size="sm" onClick={handleSearch} label="조회" />
          </div>
        </div>

        <div className="filter-fields">
          <div className="table-item">
            <span className="text-body2 table-item-label">처리구분</span>
            <Select
              options={PROCESS_TYPE_OPTIONS}
              value={processType}
              onValueChange={(value) => setProcessType(value)}
              className="table-item-value"
            />
          </div>

          <div className="table-item">
            <span className="table-item-label">
              <Select
                options={DATE_RANGE_TYPE_OPTIONS}
                value={dateRangeType}
                onValueChange={(value) => setDateRangeType(value)}
              />
            </span>
            <DateField
              mode="range"
              className="table-item-value"
              from={dayFrom}
              to={dayTo}
              onFromChange={setDayFrom}
              onToChange={setDayTo}
              shortcut={dayShortcut}
              onShortcutChange={setDayShortcut}
              defaultToday
            />
          </div>

          <div className="table-item" style={{ minHeight: 39 }}>
            <span className="text-body2 table-item-label">상태</span>

            <div className="row-center gap-12">
              <Checkbox
                label="전체"
                checked={allStatusesSelected}
                indeterminate={someStatusesSelected}
                onChange={(e) => handleToggleAllStatuses(e.target.checked)}
              />
              <CheckboxGroup
                direction="horizontal"
                value={statuses}
                onChange={setStatuses}
                options={[...STATUS_OPTIONS]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-panel">
        <span className="grid-count-badge">총 {rowData.length.toLocaleString("ko-KR")}건</span>

        <AgGridProvider modules={[AllCommunityModule]}>
          <div className="ag-theme-alpine grid-fill-wrap">
            <AgGridReact<BulkProcessRow>
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

      {isRequestOpen && <BulkRequestPanel onClose={() => setIsRequestOpen(false)} />}
    </div>
  );
}
