import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef } from "ag-grid-community";
import { COL, exportGridToExcel, toDateValue } from "@utils";
import { Button, DateField, TextButton, TextInput, Select } from "@xoheeoh/components";
import TransferRequestPanel from "./TransferRequestPanel";

type GiftTransferRow = {
  id: number;
  fromMember: string;
  toMember: string;
  reason: string;
  requestDate: string;
  status: string;
  transferor: string;
};

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: GiftTransferRow[] = [
  {
    id: 1,
    fromMember: "홍길동 (010-0000-0000)",
    toMember: "이길동 (010-0000-0000)",
    reason: "판매처 변경",
    requestDate: "20260721",
    status: "양도완료",
    transferor: "이용자",
  },
  {
    id: 2,
    fromMember: "홍길동 (010-0000-0000)",
    toMember: "이길동 (010-0000-0000)",
    reason: "개명으로 CI 변경됨",
    requestDate: "20260721",
    status: "양도실패",
    transferor: "관리자",
  },
  {
    id: 3,
    fromMember: "홍길동 (010-0000-0000)",
    toMember: "이길동 (010-0000-0000)",
    reason: "명의 변경",
    requestDate: "20260721",
    status: "양도완료",
    transferor: "관리자",
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

export default function GiftTransfer() {
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [dayFrom, setDayFrom] = useState("");
  const [dayTo, setDayTo] = useState("");
  const [dayShortcut, setDayShortcut] = useState("today");
  const [searchType, setSearchType] = useState("name");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [rowData, setRowData] = useState<GiftTransferRow[]>([]);

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
    setRowData(MOCK_ROWS);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const columnDefs = useMemo<ColDef<GiftTransferRow>[]>(
    () => [
      COL.no<GiftTransferRow>(),
      COL.text<GiftTransferRow>("양도하는 고객", "fromMember", { minWidth: 180, flex: 1 }),
      COL.text<GiftTransferRow>("양도받는 고객", "toMember", { minWidth: 180, flex: 1 }),
      COL.text<GiftTransferRow>("양도 사유", "reason", { minWidth: 180, flex: 1 }),
      COL.date<GiftTransferRow>("양도요청일", "requestDate", { width: 200 }),
      COL.fixed<GiftTransferRow>("상태", "status", { width: 120 }),
      COL.fixed<GiftTransferRow>("양도주체", "transferor", { width: 120 }),
      COL.action<GiftTransferRow>("관리", undefined, {
        colId: "detail",
        width: 100,
        cellRenderer: DetailRenderer,
      }),
      COL.action<GiftTransferRow>("마스킹해제", undefined, {
        colId: "unmasking",
        width: 120,
        cellRenderer: UnmaskingRenderer,
      }),
    ],
    []
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

      {/* 상품권 양도 요청 모달 */}
      {isRequestOpen && <TransferRequestPanel onClose={() => setIsRequestOpen(false)} />}
    </div>
  );
}
