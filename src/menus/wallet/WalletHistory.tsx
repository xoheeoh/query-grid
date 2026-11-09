import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, type ColDef } from "ag-grid-community";
import { COL, exportGridToExcel, toDateValue } from "@utils";
import { Button, DateField, Select, TextButton, TextInput } from "@xoheeoh/components";

/** 고객 한 명의 기간 내 충전·사용 합계 */
type WalletHistoryRow = {
  id: number;
  /** 고객 앱에서 가입할 때 만든 로그인 아이디 */
  memberId: string;
  customerName: string;
  /** 가운데를 가린 휴대폰번호 */
  phone: string;
  voucherName: string;
  chargeAmount: number;
  chargeCount: number;
  useAmount: number;
  useCount: number;
  /** 기간과 상관없는 현재 잔액 */
  balance: number;
  /** 마지막 거래일. yyyyMMdd */
  lastTradedAt: string;
};

const VOUCHER_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "온누리상품권", label: "온누리상품권" },
  { value: "서울사랑상품권", label: "서울사랑상품권" },
  { value: "김포사랑상품권", label: "김포사랑상품권" },
  { value: "경기사랑상품권", label: "경기사랑상품권" },
  { value: "부산사랑상품권", label: "부산사랑상품권" },
];

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

/** 충전 금액과 사용 비율로 나머지 숫자를 계산해 한 줄을 만든다. 금액 단위는 원. */
function makeRow(
  id: number,
  memberId: string,
  customerName: string,
  phoneTail: string,
  voucherName: string,
  chargeAmount: number,
  chargeCount: number,
  usedRatio: number,
  useCount: number,
  lastTradedAt: string,
): WalletHistoryRow {
  const useAmount = Math.round((chargeAmount * usedRatio) / 1000) * 1000;
  return {
    id,
    memberId,
    customerName,
    phone: `010-****-${phoneTail}`,
    voucherName,
    chargeAmount,
    chargeCount,
    useAmount,
    useCount,
    balance: chargeAmount - useAmount,
    lastTradedAt,
  };
}

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: WalletHistoryRow[] = [
  makeRow(1, "minjun.kim", "김민준", "1234", "온누리상품권", 500_000, 5, 0.72, 18, "20261103"),
  makeRow(2, "seoyeon_lee", "이서연", "5678", "서울사랑상품권", 300_000, 3, 0.41, 7, "20261102"),
  makeRow(3, "jiho_park", "박지호", "2468", "경기사랑상품권", 1_000_000, 10, 0.88, 31, "20261104"),
  makeRow(4, "sua.choi", "최수아", "1357", "온누리상품권", 200_000, 2, 0.15, 3, "20261028"),
  makeRow(5, "hayun_j", "정하윤", "9012", "부산사랑상품권", 700_000, 7, 0.63, 22, "20261101"),
  makeRow(6, "doyun.kang", "강도윤", "3456", "김포사랑상품권", 150_000, 1, 1.0, 6, "20261020"),
  makeRow(7, "eunwoo_cho", "조은우", "7890", "서울사랑상품권", 450_000, 4, 0.55, 12, "20261031"),
  makeRow(8, "seojin.yoon", "윤서진", "4321", "온누리상품권", 800_000, 8, 0.27, 9, "20261104"),
  makeRow(9, "siwoo_jang", "장시우", "8765", "경기사랑상품권", 250_000, 2, 0.8, 14, "20261025"),
  makeRow(10, "jia.lim", "임지아", "6543", "부산사랑상품권", 600_000, 6, 0.0, 0, "20261029"),
  makeRow(11, "yejun_han", "한예준", "2109", "온누리상품권", 350_000, 3, 0.94, 20, "20261103"),
  makeRow(12, "harin.oh", "오하린", "0987", "서울사랑상품권", 900_000, 9, 0.48, 16, "20261102"),
  makeRow(13, "junwoo_seo", "서준우", "5544", "김포사랑상품권", 120_000, 1, 0.33, 2, "20261015"),
  makeRow(14, "yuna_shin", "신유나", "3322", "경기사랑상품권", 400_000, 4, 0.7, 11, "20261030"),
  makeRow(15, "jian.kwon", "권지안", "7788", "온누리상품권", 1_200_000, 12, 0.59, 27, "20261104"),
  makeRow(16, "sieun_hwang", "황시은", "9900", "부산사랑상품권", 180_000, 2, 0.22, 4, "20261019"),
  makeRow(17, "hyunwoo.ahn", "안현우", "1122", "서울사랑상품권", 550_000, 5, 0.86, 19, "20261101"),
  makeRow(18, "daeun_song", "송다은", "6677", "온누리상품권", 320_000, 3, 0.5, 8, "20261027"),
  makeRow(19, "gunwoo.ryu", "류건우", "4455", "김포사랑상품권", 270_000, 3, 0.11, 2, "20261022"),
  makeRow(20, "seoa_moon", "문서아", "8899", "경기사랑상품권", 650_000, 6, 0.77, 24, "20261103"),
];

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export default function WalletHistory() {
  // 기본 조회 기간은 최근 1개월
  const [dayFrom, setDayFrom] = useState(() => toDateValue(daysAgo(30)));
  const [dayTo, setDayTo] = useState(() => toDateValue(new Date()));
  const [dayShortcut, setDayShortcut] = useState("last30");
  const [voucher, setVoucher] = useState("all");
  const [searchType, setSearchType] = useState("memberId");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [rowData, setRowData] = useState<WalletHistoryRow[]>([]);

  const handleReset = () => {
    setDayFrom(toDateValue(daysAgo(30)));
    setDayTo(toDateValue(new Date()));
    setDayShortcut("last30");
    setVoucher("all");
    setSearchType("memberId");
    setSearchKeyword("");
    setRowData([]);
  };

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    const filtered = MOCK_ROWS.filter((row) => {
      if (voucher !== "all" && row.voucherName !== voucher) return false;
      if (!keyword) return true;
      if (searchType === "memberId") return row.memberId.toLowerCase().includes(keyword.toLowerCase());
      if (searchType === "name") return row.customerName.includes(keyword);
      // 휴대폰번호는 가려진 자리를 빼고 뒷자리로 찾는다.
      return row.phone.replace(/\D/g, "").includes(keyword);
    });
    setRowData(filtered);
  };

  useEffect(() => {
    handleSearch();
    // 최초 로드 시 기본 조회옵션으로 1회 조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columnDefs = useMemo<ColDef<WalletHistoryRow>[]>(
    () => [
      COL.no<WalletHistoryRow>(),
      COL.text<WalletHistoryRow>("회원 ID", "memberId", { width: 120 }),
      COL.text<WalletHistoryRow>("고객명", "customerName", { width: 85 }),
      COL.fixed<WalletHistoryRow>("휴대폰번호", "phone", { width: 120 }),
      COL.text<WalletHistoryRow>("상품권", "voucherName", { flex: 1, minWidth: 110 }),
      COL.amount<WalletHistoryRow>("충전 금액", "chargeAmount", { width: 110 }),
      COL.amount<WalletHistoryRow>("충전 건수", "chargeCount", { width: 80 }),
      COL.amount<WalletHistoryRow>("사용 금액", "useAmount", { width: 110 }),
      COL.amount<WalletHistoryRow>("사용 건수", "useCount", { width: 80 }),
      COL.amount<WalletHistoryRow>("잔액", "balance", { width: 110 }),
      COL.date<WalletHistoryRow>("최근 거래일", "lastTradedAt", { width: 105 }),
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  const gridRef = useRef<AgGridReact<WalletHistoryRow>>(null);
  const handleExcelDownload = () => {
    if (gridRef.current) exportGridToExcel(gridRef.current.api, "충전·사용 내역");
  };


  return (
    <div className="page-root">
      <div className="page-header">
        <div className="page-title">
          <h3>충전·사용 내역</h3>
          <p>고객별로 기간 안에 얼마를 충전하고 얼마를 사용했는지 조회합니다.</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-fields">
          <div className="filter-field">
            <span className="filter-label">거래 기간</span>
            <DateField
              size="sm"
              mode="range"
              from={dayFrom}
              to={dayTo}
              onFromChange={setDayFrom}
              onToChange={setDayTo}
              shortcut={dayShortcut}
              onShortcutChange={setDayShortcut}
            />
          </div>

          <div className="filter-field">
            <span className="filter-label">상품권</span>
            <Select
              size="sm"
              aria-label="상품권"
              options={VOUCHER_FILTER_OPTIONS}
              value={voucher}
              onValueChange={setVoucher}
              style={{ width: 170 }}
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
            <AgGridReact<WalletHistoryRow>
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
    </div>
  );
}
