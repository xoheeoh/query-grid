import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { COL, exportGridToExcel, formatAmount, formatDate, maskPhone, refreshRowNumbers, toDateValue } from "@utils";
import { Button, DateField, Dialog, TextButton, TextInput, Select } from "@xoheeoh/components";
import TransferRequestPanel from "./TransferRequestPanel";
import styles from "./TransferRequestPanel.module.css";

type TransferredVoucher = { voucherName: string; balance: number };

type GiftTransferRow = {
  id: number;
  fromName: string;
  fromPhone: string;
  toName: string;
  toPhone: string;
  reason: string;
  requestDate: string;
  status: "양도완료" | "양도실패";
  transferor: string;
  /** 양도한(하려던) 상품권과 잔액 */
  vouchers: TransferredVoucher[];
  /** 실패했을 때의 이유 */
  failReason?: string;
  /** 마스킹해제를 누르면 true. 휴대폰번호를 가리지 않는다. */
  unmasked: boolean;
};

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: GiftTransferRow[] = [
  {
    id: 1,
    fromName: "홍길동",
    fromPhone: "010-1234-5678",
    toName: "이길동",
    toPhone: "010-2345-6789",
    reason: "판매처 변경",
    requestDate: "20261104",
    status: "양도완료",
    transferor: "이용자",
    vouchers: [{ voucherName: "온누리상품권", balance: 50_000 }],
    unmasked: false,
  },
  {
    id: 2,
    fromName: "김민수",
    fromPhone: "010-3456-7890",
    toName: "김민수",
    toPhone: "010-4567-8901",
    reason: "개명으로 CI 변경됨",
    requestDate: "20261102",
    status: "양도실패",
    transferor: "관리자",
    vouchers: [
      { voucherName: "서울사랑상품권", balance: 120_000 },
      { voucherName: "온누리상품권", balance: 30_000 },
    ],
    failReason: "양수자 본인인증 정보가 일치하지 않습니다.",
    unmasked: false,
  },
  {
    id: 3,
    fromName: "박지호",
    fromPhone: "010-5678-9012",
    toName: "박서연",
    toPhone: "010-6789-0123",
    reason: "명의 변경",
    requestDate: "20261028",
    status: "양도완료",
    transferor: "관리자",
    vouchers: [{ voucherName: "경기사랑상품권", balance: 200_000 }],
    unmasked: false,
  },
];

function memberText(name: string, phone: string, unmasked: boolean) {
  return `${name} (${unmasked ? phone : maskPhone(phone)})`;
}

function DetailRenderer(params: ICellRendererParams<GiftTransferRow>) {
  const onDetail = params.context?.onDetail as ((row: GiftTransferRow) => void) | undefined;
  return (
    <span className="grid-cell-center">
      <Button size="sm" variant="outlined" color="neutral" onClick={() => params.data && onDetail?.(params.data)} label="상세" />
    </span>
  );
}

function UnmaskingRenderer(params: ICellRendererParams<GiftTransferRow>) {
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

export default function GiftTransfer() {
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [dayFrom, setDayFrom] = useState("");
  const [dayTo, setDayTo] = useState("");
  const [dayShortcut, setDayShortcut] = useState("today");
  const [searchType, setSearchType] = useState("name");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [rowData, setRowData] = useState<GiftTransferRow[]>([]);
  const [detailRow, setDetailRow] = useState<GiftTransferRow | null>(null);

  const handleReset = () => {
    const today = toDateValue(new Date());
    setDayFrom(today);
    setDayTo(today);
    setDayShortcut("today");
    setSearchType("name");
    setSearchKeyword("");
    setRowData([]);
  };

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    setRowData(
      MOCK_ROWS.filter((row) => {
        if (!keyword) return true;
        if (searchType === "name") return row.fromName.includes(keyword) || row.toName.includes(keyword);
        const digits = keyword.replace(/\D/g, "");
        return row.fromPhone.replace(/\D/g, "").includes(digits) || row.toPhone.replace(/\D/g, "").includes(digits);
      }),
    );
  };

  useEffect(() => {
    handleSearch();
    // 최초 로드 시 기본 조회옵션으로 1회 조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleMask = (id: number) => {
    setRowData((rows) => rows.map((row) => (row.id === id ? { ...row, unmasked: !row.unmasked } : row)));
  };

  const columnDefs = useMemo<ColDef<GiftTransferRow>[]>(
    () => [
      COL.no<GiftTransferRow>(),
      COL.text<GiftTransferRow>("양도하는 고객", "fromName", {
        minWidth: 170,
        flex: 1,
        valueGetter: (p) => (p.data ? memberText(p.data.fromName, p.data.fromPhone, p.data.unmasked) : ""),
      }),
      COL.text<GiftTransferRow>("양도받는 고객", "toName", {
        minWidth: 170,
        flex: 1,
        valueGetter: (p) => (p.data ? memberText(p.data.toName, p.data.toPhone, p.data.unmasked) : ""),
      }),
      COL.text<GiftTransferRow>("양도 사유", "reason", { minWidth: 160, flex: 1 }),
      COL.date<GiftTransferRow>("양도요청일", "requestDate", { width: 120 }),
      COL.fixed<GiftTransferRow>("상태", "status", { width: 100 }),
      COL.fixed<GiftTransferRow>("양도주체", "transferor", { width: 100 }),
      COL.action<GiftTransferRow>("관리", undefined, { colId: "detail", width: 90, cellRenderer: DetailRenderer }),
      COL.action<GiftTransferRow>("마스킹해제", undefined, { colId: "unmasking", width: 120, cellRenderer: UnmaskingRenderer }),
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  const gridRef = useRef<AgGridReact<GiftTransferRow>>(null);
  const handleExcelDownload = () => {
    if (gridRef.current) exportGridToExcel(gridRef.current.api, "상품권 양도");
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div className="page-title">
          <h3>상품권 양도</h3>
          <p>회원/판매처 간 상품권 양도 내역을 조회 및 관리합니다.</p>
        </div>

        <Button onClick={() => setIsRequestOpen(true)} label="상품권 양도 요청" />
      </div>

      <div className="filter-bar">
        <div className="filter-fields">
          <div className="filter-field">
            <span className="filter-label">양도 요청일</span>
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

          <div className="filter-field">
            <span className="filter-label">고객</span>
            <div className="filter-group">
              <Select
                size="sm"
                aria-label="고객 검색 기준"
                options={[
                  { label: "이름", value: "name" },
                  { label: "휴대폰번호", value: "phone" },
                ]}
                value={searchType}
                onValueChange={setSearchType}
                style={{ width: 120 }}
              />
              <TextInput
                size="sm"
                aria-label="고객 검색어"
                placeholder="검색어"
                type="search"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{ width: 200 }}
              />
            </div>
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
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            disabled={rowData.length === 0}
            onClick={handleExcelDownload}
            label="엑셀 다운로드"
          />
        </div>

        <AgGridProvider modules={[AllCommunityModule]}>
          <div className="ag-theme-alpine grid-fill-wrap">
            <AgGridReact<GiftTransferRow>
              ref={gridRef}
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

      {/* 상품권 양도 요청 모달 */}
      {isRequestOpen && <TransferRequestPanel onClose={() => setIsRequestOpen(false)} />}

      {/* 상세: 양도 정보와 양도한 상품권 */}
      <Dialog
        open={detailRow !== null}
        onClose={() => setDetailRow(null)}
        title="상품권 양도 상세"
        size="md"
        footer={<Button variant="outlined" color="neutral" onClick={() => setDetailRow(null)} label="닫기" />}>
        {detailRow && (
          <div className="flex-col gap-16">
            <dl className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>양도하는 고객</dt>
                <dd className={styles.detailValue}>{memberText(detailRow.fromName, detailRow.fromPhone, detailRow.unmasked)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>양도받는 고객</dt>
                <dd className={styles.detailValue}>{memberText(detailRow.toName, detailRow.toPhone, detailRow.unmasked)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>양도요청일</dt>
                <dd className={styles.detailValue}>{formatDate(detailRow.requestDate)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>양도주체</dt>
                <dd className={styles.detailValue}>{detailRow.transferor}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>양도 사유</dt>
                <dd className={styles.detailValue}>{detailRow.reason}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>상태</dt>
                <dd className={styles.detailValue}>
                  <span className={`status-badge ${detailRow.status === "양도완료" ? "status-badge-success" : "status-badge-danger"}`}>
                    {detailRow.status}
                  </span>
                  {detailRow.failReason && <span className="text-caption1 text-color-danger"> {detailRow.failReason}</span>}
                </dd>
              </div>
            </dl>

            <table className="table">
              <thead>
                <tr>
                  <th>상품권</th>
                  <th className={styles.amountCell}>양도 잔액</th>
                </tr>
              </thead>
              <tbody>
                {detailRow.vouchers.map((voucher) => (
                  <tr key={voucher.voucherName}>
                    <td>{voucher.voucherName}</td>
                    <td className={styles.amountCell}>{formatAmount(voucher.balance)}원</td>
                  </tr>
                ))}
                <tr>
                  <td>합계</td>
                  <td className={styles.amountCell}>
                    <strong>{formatAmount(detailRow.vouchers.reduce((sum, v) => sum + v.balance, 0))}원</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Dialog>
    </div>
  );
}
