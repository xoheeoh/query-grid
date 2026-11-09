import { useEffect, useMemo, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { COL, formatAmount, formatDate, getLoginSession, maskId, refreshRowNumbers, toDateValue } from "@utils";
import { Button, DateField, Dialog, Select, TextButton } from "@xoheeoh/components";
import BulkRequestPanel, { type SubmittedBulkRequest } from "./BulkRequestPanel";
import styles from "./BulkRequestPanel.module.css";

const PROCESS_TYPE_OPTIONS = [
  { label: "전체", value: "all" },
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

function optionLabel(options: readonly { label: string; value: string }[], value: string | null | undefined) {
  if (value == null || value === "") return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

type BulkProcessRow = {
  id: number;
  requestDate: string;
  processType: string;
  /** 대상 상품권 수 */
  giftCard: number;
  requesterName: string;
  requesterId: string;
  status: string;
  /** 마스킹해제를 누르면 true. 요청자 아이디를 가리지 않는다. */
  unmasked: boolean;
};

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: BulkProcessRow[] = [
  { id: 1, requestDate: "20261107100000", processType: "refund", giftCard: 1_200, requesterName: "홍길동", requesterId: "gildonghong", status: "confirming", unmasked: false },
  { id: 2, requestDate: "20261105143000", processType: "bulkRefund", giftCard: 850, requesterName: "김민수", requesterId: "minsukim", status: "confirmed", unmasked: false },
  { id: 3, requestDate: "20261029091500", processType: "extend", giftCard: 300, requesterName: "홍길동", requesterId: "gildonghong", status: "completed", unmasked: false },
];

/** 상세 창의 처리 이력. 요청 상태까지만 채운다. */
function buildHistory(row: BulkProcessRow) {
  const steps = [
    { status: "요청 등록", at: row.requestDate, by: row.requesterName, note: "엑셀 업로드" },
    { status: "확인중", at: row.requestDate.slice(0, 8) + "101200", by: "운영 담당자", note: "환불 가능여부 조회" },
    { status: "확인완료", at: row.requestDate.slice(0, 8) + "153000", by: "운영 담당자", note: `${formatAmount(row.giftCard)}건 확인` },
    { status: "요청완료", at: row.requestDate.slice(0, 8) + "180000", by: "시스템", note: "처리 완료" },
  ];
  const reached = { confirming: 2, confirmed: 3, completed: 4, canceled: 1 }[row.status] ?? 1;
  return steps.slice(0, reached);
}

function requesterText(row: BulkProcessRow) {
  return `${row.requesterName} (${row.unmasked ? row.requesterId : maskId(row.requesterId)})`;
}

function DetailRenderer(params: ICellRendererParams<BulkProcessRow>) {
  const onDetail = params.context?.onDetail as ((row: BulkProcessRow) => void) | undefined;
  return (
    <span className="grid-cell-center">
      <Button size="sm" variant="outlined" color="neutral" onClick={() => params.data && onDetail?.(params.data)} label="상세" />
    </span>
  );
}

function UnmaskingRenderer(params: ICellRendererParams<BulkProcessRow>) {
  const onToggleMask = params.context?.onToggleMask as ((id: number) => void) | undefined;
  return (
    <span className="grid-cell-center">
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        onClick={() => params.data && onToggleMask?.(params.data.id)}
        label={params.data?.unmasked ? "마스킹" : "마스킹해제"}
      />
    </span>
  );
}

export default function BulkProcess() {
  const [processType, setProcessType] = useState<string>("all");
  const [dateRangeType, setDateRangeType] = useState<string>("requestDate");
  const [dayFrom, setDayFrom] = useState("");
  const [dayTo, setDayTo] = useState("");
  const [dayShortcut, setDayShortcut] = useState("today");
  /** 고른 상태가 없으면 전체 조회 */
  const [statuses, setStatuses] = useState<string[]>([]);
  // 요청 화면에서 등록한 줄을 화면이 열려 있는 동안 기억하려고 예시 데이터를 상태로 들고 있는다.
  const [requests, setRequests] = useState<BulkProcessRow[]>(MOCK_ROWS);
  const [rowData, setRowData] = useState<BulkProcessRow[]>([]);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<BulkProcessRow | null>(null);

  const handleReset = () => {
    const today = toDateValue(new Date());
    setProcessType("all");
    setDateRangeType("requestDate");
    setDayFrom(today);
    setDayTo(today);
    setDayShortcut("today");
    setStatuses([]);
    setRowData([]);
  };

  const handleSearch = () => {
    setRowData(
      requests.filter((row) => {
        if (processType !== "all" && row.processType !== processType) return false;
        if (statuses.length > 0 && !statuses.includes(row.status)) return false;
        return true;
      }),
    );
  };

  useEffect(() => {
    handleSearch();
    // 최초 로드 시 기본 조회옵션으로 1회 조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 요청 화면에서 등록을 마치면 "확인중" 줄을 맨 위에 더한다. */
  const handleSubmitted = ({ kind, count }: SubmittedBulkRequest) => {
    const session = getLoginSession();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const row: BulkProcessRow = {
      // No 열이 id를 그대로 보여주므로 이어지는 번호를 쓴다.
      id: Math.max(0, ...requests.map((r) => r.id)) + 1,
      requestDate: `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`,
      processType: kind === "extend" ? "extend" : "refund",
      giftCard: count,
      requesterName: session?.name ?? "관리자",
      requesterId: session?.id ?? "admin",
      status: "confirming",
      unmasked: false,
    };
    setRequests((prev) => [row, ...prev]);
    setRowData((prev) => [row, ...prev]);
  };

  const handleToggleMask = (id: number) => {
    setRowData((rows) => rows.map((row) => (row.id === id ? { ...row, unmasked: !row.unmasked } : row)));
  };

  const columnDefs = useMemo<ColDef<BulkProcessRow>[]>(
    () => [
      COL.no<BulkProcessRow>(),
      COL.date<BulkProcessRow>("요청일시", "requestDate", { width: 180 }),
      COL.fixed<BulkProcessRow>("처리구분", "processType", {
        width: 130,
        valueFormatter: (p) => optionLabel(PROCESS_TYPE_OPTIONS, p.value),
      }),
      COL.amount<BulkProcessRow>("대상 상품권 수", "giftCard", { width: 140 }),
      COL.text<BulkProcessRow>("요청자", "requesterName", {
        minWidth: 180,
        flex: 1,
        valueGetter: (p) => (p.data ? requesterText(p.data) : ""),
      }),
      COL.fixed<BulkProcessRow>("상태", "status", {
        width: 120,
        valueFormatter: (p) => optionLabel(STATUS_OPTIONS, p.value),
      }),
      COL.action<BulkProcessRow>("관리", undefined, { colId: "detail", width: 90, cellRenderer: DetailRenderer }),
      COL.action<BulkProcessRow>("마스킹해제", undefined, { colId: "unmasking", width: 120, cellRenderer: UnmaskingRenderer }),
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  return (
    <div className="page-root">
      <div className="page-header">
        <div className="page-title">
          <h3>일괄 수기처리</h3>
          <p>대량의 환불/만료연장 요청 건을 엑셀 업로드를 통해 처리합니다.</p>
        </div>

        <Button onClick={() => setIsRequestOpen(true)} label="일괄 수기처리 요청" />
      </div>

      <div className="filter-bar">
        <div className="filter-fields">
          <div className="filter-field">
            <span className="filter-label">처리구분</span>
            <Select
              size="sm"
              aria-label="처리구분"
              options={PROCESS_TYPE_OPTIONS}
              value={processType}
              onValueChange={setProcessType}
              style={{ width: 150 }}
            />
          </div>

          <div className="filter-field">
            <span className="filter-label">기간</span>
            <div className="filter-group">
              <Select
                size="sm"
                aria-label="기간 기준"
                options={DATE_RANGE_TYPE_OPTIONS}
                value={dateRangeType}
                onValueChange={setDateRangeType}
                style={{ width: 130 }}
              />
              <DateField
                size="sm"
                mode="range"
                from={dayFrom}
                to={dayTo}
                onFromChange={setDayFrom}
                onToChange={setDayTo}
                shortcut={dayShortcut}
                onShortcutChange={setDayShortcut}
                defaultToday
              />
            </div>
          </div>

          <div className="filter-field">
            <span className="filter-label">상태</span>
            <Select
              size="sm"
              type="chip"
              multiple
              aria-label="상태"
              placeholder="전체"
              options={[...STATUS_OPTIONS]}
              value={statuses}
              onValueChange={setStatuses}
              style={{ minWidth: 200 }}
            />
          </div>
        </div>

        <div className="filter-actions">
          <TextButton size="sm" color="neutral" onClick={handleReset} label="초기화" />
          <Button size="sm" onClick={handleSearch} label="조회" />
        </div>
      </div>

      <div className="result-panel">
        <div className="result-toolbar">
          <span className="result-count">
            총 <strong>{rowData.length.toLocaleString("ko-KR")}</strong>건
          </span>
        </div>

        <AgGridProvider modules={[AllCommunityModule]}>
          <div className="ag-theme-alpine grid-fill-wrap">
            <AgGridReact<BulkProcessRow>
              theme="legacy"
              onModelUpdated={refreshRowNumbers}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              context={{ onDetail: setDetailRow, onToggleMask: handleToggleMask }}
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

      {isRequestOpen && <BulkRequestPanel onClose={() => setIsRequestOpen(false)} onSubmitted={handleSubmitted} />}

      {/* 상세: 요청 정보와 지금까지의 처리 이력 */}
      <Dialog
        open={detailRow !== null}
        onClose={() => setDetailRow(null)}
        title="일괄 수기처리 상세"
        size="md"
        footer={<Button variant="outlined" color="neutral" onClick={() => setDetailRow(null)} label="닫기" />}>
        {detailRow && (
          <div className="flex-col gap-16">
            <dl className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>요청일시</dt>
                <dd className={styles.detailValue}>{formatDate(detailRow.requestDate)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>처리구분</dt>
                <dd className={styles.detailValue}>{optionLabel(PROCESS_TYPE_OPTIONS, detailRow.processType)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>대상 상품권 수</dt>
                <dd className={styles.detailValue}>{formatAmount(detailRow.giftCard)}건</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>요청자</dt>
                <dd className={styles.detailValue}>{requesterText(detailRow)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>상태</dt>
                <dd className={styles.detailValue}>{optionLabel(STATUS_OPTIONS, detailRow.status)}</dd>
              </div>
            </dl>

            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 170 }}>일시</th>
                  <th style={{ width: 110 }}>상태</th>
                  <th style={{ width: 120 }}>처리자</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {buildHistory(detailRow).map((step) => (
                  <tr key={step.status}>
                    <td>{formatDate(step.at)}</td>
                    <td>{step.status}</td>
                    <td>{step.by}</td>
                    <td>{step.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Dialog>
    </div>
  );
}
