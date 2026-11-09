import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { COL, exportGridToExcel, refreshRowNumbers } from "@utils";
import { Button, DateField, Select, TextButton, TextInput } from "@xoheeoh/components";
import {
  MOCK_WALLET_ROWS,
  WALLET_STATUS_BADGE,
  WALLET_STATUS_LABEL,
  WALLET_STATUS_OPTIONS,
  type WalletRow,
  type WalletStatus,
} from "./walletData";
import WalletDetailPanel from "./WalletDetailPanel";

const SEARCH_TYPE_OPTIONS = [
  { value: "memberId", label: "회원 ID" },
  { value: "name", label: "이름" },
  { value: "phone", label: "휴대폰번호" },
];

const SEARCH_PLACEHOLDER: Record<string, string> = {
  memberId: "회원 ID",
  name: "이름",
  phone: "휴대폰 뒷자리",
};

function StatusRenderer(params: ICellRendererParams<WalletRow, WalletStatus>) {
  if (!params.value) return null;
  return (
    <span className="grid-cell-center">
      <span className={`status-badge ${WALLET_STATUS_BADGE[params.value]}`}>{WALLET_STATUS_LABEL[params.value]}</span>
    </span>
  );
}

function DetailRenderer(params: ICellRendererParams<WalletRow>) {
  const onDetail = params.context?.onDetail as ((row: WalletRow) => void) | undefined;
  return (
    <span className="grid-cell-center">
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        onClick={() => {
          if (params.data) onDetail?.(params.data);
        }}
        label="상세"
      />
    </span>
  );
}

/** 고객별 지갑의 현재 상태(상태·잔액·보유 상품권)를 보는 목록. 상세에서 지갑을 정지·해제할 수 있다. */
export default function WalletList() {
  // 정지·해제로 바뀐 상태를 화면에 남기려고 예시 데이터를 상태로 들고 있는다.
  const [wallets, setWallets] = useState<WalletRow[]>(MOCK_WALLET_ROWS);
  const [status, setStatus] = useState("all");
  const [joinedFrom, setJoinedFrom] = useState("");
  const [joinedTo, setJoinedTo] = useState("");
  const [joinedShortcut, setJoinedShortcut] = useState("");
  const [searchType, setSearchType] = useState("memberId");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [rowData, setRowData] = useState<WalletRow[]>([]);
  const [detailId, setDetailId] = useState<number | null>(null);

  const handleReset = () => {
    setStatus("all");
    setJoinedFrom("");
    setJoinedTo("");
    setJoinedShortcut("");
    setSearchType("memberId");
    setSearchKeyword("");
    setRowData([]);
  };

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    const from = joinedFrom.replace(/-/g, "");
    const to = joinedTo.replace(/-/g, "");
    const filtered = wallets.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (from && row.joinedAt < from) return false;
      if (to && row.joinedAt > to) return false;
      if (!keyword) return true;
      if (searchType === "memberId") return row.memberId.toLowerCase().includes(keyword.toLowerCase());
      if (searchType === "name") return row.customerName.includes(keyword);
      return row.phone.replace(/\D/g, "").includes(keyword);
    });
    setRowData(filtered);
  };

  useEffect(() => {
    handleSearch();
    // 최초 로드 시 기본 조회옵션으로 1회 조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 상세에서 정지·해제하면 원본과 조회 결과 양쪽을 같이 바꾼다. */
  const handleStatusChange = (id: number, nextStatus: WalletStatus) => {
    const apply = (rows: WalletRow[]) => rows.map((row) => (row.id === id ? { ...row, status: nextStatus } : row));
    setWallets(apply);
    setRowData(apply);
  };

  const columnDefs = useMemo<ColDef<WalletRow>[]>(
    () => [
      COL.no<WalletRow>(),
      COL.text<WalletRow>("회원 ID", "memberId", { width: 120 }),
      COL.text<WalletRow>("고객명", "customerName", { width: 85 }),
      COL.fixed<WalletRow>("휴대폰번호", "phone", { width: 140 }),
      COL.date<WalletRow>("가입일", "joinedAt", { width: 120 }),
      COL.fixed<WalletRow>("지갑 상태", "status", { width: 100, cellRenderer: StatusRenderer }),
      COL.amount<WalletRow>("보유 상품권", "voucherCount", { width: 100 }),
      COL.amount<WalletRow>("총 잔액", "totalBalance", { flex: 1, minWidth: 120 }),
      COL.date<WalletRow>("최근 거래일", "lastTradedAt", { width: 120 }),
      COL.action<WalletRow>("관리", undefined, { colId: "detail", width: 90, pinned: "right", cellRenderer: DetailRenderer }),
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  const gridRef = useRef<AgGridReact<WalletRow>>(null);
  const handleExcelDownload = () => {
    if (gridRef.current) exportGridToExcel(gridRef.current.api, "고객 지갑 조회");
  };

  const detailWallet = detailId === null ? null : (wallets.find((row) => row.id === detailId) ?? null);

  return (
    <div className="page-root">
      <div className="page-header">
        <div className="page-title">
          <h3>고객 지갑 조회</h3>
          <p>고객별 지갑의 상태와 잔액을 조회하고, 상세에서 지갑을 정지하거나 해제합니다.</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-fields">
          <div className="filter-field">
            <span className="filter-label">지갑 상태</span>
            <Select
              size="sm"
              aria-label="지갑 상태"
              options={WALLET_STATUS_OPTIONS}
              value={status}
              onValueChange={setStatus}
              style={{ width: 130 }}
            />
          </div>

          <div className="filter-field">
            <span className="filter-label">가입일</span>
            <DateField
              size="sm"
              mode="range"
              from={joinedFrom}
              to={joinedTo}
              onFromChange={setJoinedFrom}
              onToChange={setJoinedTo}
              shortcut={joinedShortcut}
              onShortcutChange={setJoinedShortcut}
            />
          </div>

          <div className="filter-field">
            <span className="filter-label">고객</span>
            <div className="filter-group">
              <Select
                size="sm"
                aria-label="고객 검색 기준"
                options={SEARCH_TYPE_OPTIONS}
                value={searchType}
                onValueChange={setSearchType}
                style={{ width: 130 }}
              />
              <TextInput
                size="sm"
                aria-label="고객 검색어"
                type="search"
                placeholder={SEARCH_PLACEHOLDER[searchType]}
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
            총 <strong>{rowData.length.toLocaleString("ko-KR")}</strong>명
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
            <AgGridReact<WalletRow>
              ref={gridRef}
              theme="legacy"
              onModelUpdated={refreshRowNumbers}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              context={{ onDetail: (row: WalletRow) => setDetailId(row.id) }}
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

      {detailWallet && (
        <WalletDetailPanel wallet={detailWallet} onClose={() => setDetailId(null)} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
