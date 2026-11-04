import { useEffect, useMemo, useState } from "react";

import { AgGridReact, AgGridProvider } from "ag-grid-react";
import { AllCommunityModule, type ColDef, type ICellRendererParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { COL } from "@utils";
import { Button, TextButton, TextInput, Select } from "@xoheeoh/components";
import VoucherRegisterPanel from "./register/VoucherRegisterPanel";
import VoucherEditPanel from "./edit/VoucherEditPanel";
import {
  PUBLISHER_OPTIONS,
  SELLER_OPTIONS,
  STATUS_LABEL,
  STATUS_OPTIONS,
  optionLabel,
  withAllOption,
  type StatusCode,
} from "./voucherOptions";

type VoucherRow = {
  id: number;
  publisher: string;
  seller: string;
  voucherName: string;
  status: StatusCode[];
  annualIssuanceLimit: number;
  totalIssuance: number;
  annualDiscountLimit: number;
  totalDiscount: number;
};

/** 연 발행한도와 지금까지 쓴 비율로 나머지 금액을 계산해 한 줄을 만든다. */
function makeRow(
  id: number,
  publisher: string,
  seller: string,
  voucherName: string,
  status: StatusCode[],
  annualIssuanceLimit: number,
  usedRatio: number,
): VoucherRow {
  const annualDiscountLimit = annualIssuanceLimit / 10;
  return {
    id,
    publisher,
    seller,
    voucherName,
    status,
    annualIssuanceLimit,
    totalIssuance: Math.round(annualIssuanceLimit * usedRatio),
    annualDiscountLimit,
    totalDiscount: Math.round(annualDiscountLimit * usedRatio),
  };
}

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: VoucherRow[] = [
  makeRow(1, "중소벤처기업부", "가나다은행", "온누리상품권", ["1", "2"], 120_000_000_000, 0.71),
  makeRow(2, "중소벤처기업부", "라마바은행", "온누리상품권 (카드형)", ["1", "4"], 80_000_000_000, 0.42),
  makeRow(3, "서울특별시", "가나다은행", "서울사랑상품권", ["1", "2"], 50_000_000_000, 0.88),
  makeRow(4, "서울특별시", "사아자페이", "서울사랑상품권 (청년)", ["2", "3"], 12_000_000_000, 0.35),
  makeRow(5, "김포시", "가나다은행", "김포사랑상품권", ["1"], 9_000_000_000, 0.57),
  makeRow(6, "경기도", "라마바은행", "경기사랑상품권", ["1", "2"], 70_000_000_000, 0.63),
  makeRow(7, "경기도", "플랫폼 운영기관", "경기청년희망바우처", ["2", "3"], 6_500_000_000, 0.12),
  makeRow(8, "부산광역시", "가나다은행", "부산사랑상품권", ["1", "2"], 45_000_000_000, 0.79),
  makeRow(9, "부산광역시", "사아자페이", "부산전통시장상품권", ["3", "4"], 8_000_000_000, 1.0),
  makeRow(10, "전라남도", "라마바은행", "전남사랑상품권", ["1", "2"], 30_000_000_000, 0.48),
  makeRow(11, "전라남도", "가나다은행", "전남농어민바우처", ["1"], 4_200_000_000, 0.26),
  makeRow(12, "중소벤처기업부", "플랫폼 운영기관", "전통시장 소비쿠폰", ["2"], 15_000_000_000, 0.93),
  makeRow(13, "서울특별시", "라마바은행", "서울문화바우처", ["1", "4"], 3_000_000_000, 0.18),
  makeRow(14, "김포시", "사아자페이", "김포육아바우처", ["3"], 2_400_000_000, 0.66),
  makeRow(15, "경기도", "가나다은행", "경기농산물상품권", ["1", "2"], 11_000_000_000, 0.52),
  makeRow(16, "부산광역시", "라마바은행", "부산관광바우처", ["2", "3"], 5_600_000_000, 0.07),
  makeRow(17, "전라남도", "플랫폼 운영기관", "전남섬여행바우처", ["1"], 1_800_000_000, 0.39),
  makeRow(18, "중소벤처기업부", "사아자페이", "온누리상품권 (모바일)", ["3", "4"], 60_000_000_000, 1.0),
];

function isSuccessStatus(status: string) {
  return status === "1" || status === "2";
}

function StatusBadgeRenderer(params: ICellRendererParams<VoucherRow, StatusCode[]>) {
  const statuses = params.value;
  if (!statuses?.length) return null;

  return (
    <span className="grid-badge-group">
      {statuses.map((code) => {
        const tone = isSuccessStatus(code) ? "status-badge-success" : "status-badge-danger";
        return (
          <span key={code} className={`status-badge ${tone}`}>
            {STATUS_LABEL[code]}
          </span>
        );
      })}
    </span>
  );
}

function ManageRenderer(params: ICellRendererParams<VoucherRow>) {
  const onEdit = params.context?.onEdit as ((row: VoucherRow) => void) | undefined;

  return (
    <span className="grid-cell-center">
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        onClick={() => {
          if (params.data) onEdit?.(params.data);
        }}
        label="수정"
      />
    </span>
  );
}

const PUBLISHER_FILTER_OPTIONS = withAllOption(PUBLISHER_OPTIONS);
const SELLER_FILTER_OPTIONS = withAllOption(SELLER_OPTIONS);

export default function VoucherManage() {
  const [publisher, setPublisher] = useState<string>("all");
  const [seller, setSeller] = useState<string>("all");
  /** 고른 상태가 없으면 전체 조회 */
  const [status, setStatus] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [rowData, setRowData] = useState<VoucherRow[]>([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherRow | null>(null);

  const handleEdit = (row: VoucherRow) => {
    setEditingVoucher(row);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
  };

  const handleCloseEdit = () => {
    setEditingVoucher(null);
  };

  const columnDefs = useMemo<ColDef<VoucherRow>[]>(
    () => [
      COL.no<VoucherRow>(),
      COL.text<VoucherRow>("발행처", "publisher", { width: 130 }),
      COL.text<VoucherRow>("판매처", "seller", { width: 130 }),
      COL.text<VoucherRow>("상품권명", "voucherName", { flex: 1, minWidth: 180 }),
      COL.badges<VoucherRow>("상태", "status", { width: 200, cellRenderer: StatusBadgeRenderer }),
      COL.amount<VoucherRow>("연 발행한도", "annualIssuanceLimit", { width: 150 }),
      COL.amount<VoucherRow>("누적 발행금액", "totalIssuance", { width: 150 }),
      COL.amount<VoucherRow>("연 할인한도", "annualDiscountLimit", { width: 140 }),
      COL.amount<VoucherRow>("누적 할인금액", "totalDiscount", { width: 140 }),
      // 표가 가로로 넘쳐도 "수정" 버튼은 항상 보이도록 오른쪽에 고정한다.
      COL.action<VoucherRow>("관리", undefined, {
        colId: "manage",
        width: 90,
        pinned: "right",
        cellRenderer: ManageRenderer,
      }),
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  const handleReset = () => {
    setPublisher("all");
    setSeller("all");
    setStatus([]);
    setSearch("");
    setRowData([]);
  };

  const handleSearch = () => {
    const keyword = search.trim();
    const publisherName = publisher === "all" ? null : optionLabel(PUBLISHER_OPTIONS, publisher);
    const sellerName = seller === "all" ? null : optionLabel(SELLER_OPTIONS, seller);
    const filtered = MOCK_ROWS.filter((row) => {
      if (publisherName && row.publisher !== publisherName) return false;
      if (sellerName && row.seller !== sellerName) return false;
      if (status.length > 0 && !row.status.some((s) => status.includes(s))) return false;
      if (!keyword) return true;
      return row.seller.includes(keyword) || row.voucherName.includes(keyword);
    });
    setRowData(filtered);
  };

  useEffect(() => {
    handleSearch();
    // 최초 로드 시 기본 조회옵션으로 1회 조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-root">
      <div className="page-header">
        <div className="page-title">
          <h3>상품권 관리</h3>
          <p>플랫폼을 통해 발행 될 상품권을 등록 및 관리합니다.</p>
        </div>

        <Button onClick={() => setIsRegisterOpen(true)} label="상품권 등록" />
      </div>

      <div className="filter-bar">
        <div className="filter-fields">
          <div className="filter-field">
            <span className="filter-label">발행처</span>
            <Select
              size="sm"
              aria-label="발행처"
              options={PUBLISHER_FILTER_OPTIONS}
              value={publisher}
              onValueChange={setPublisher}
              style={{ width: 170 }}
            />
          </div>

          <div className="filter-field">
            <span className="filter-label">판매처</span>
            <Select
              size="sm"
              aria-label="판매처"
              options={SELLER_FILTER_OPTIONS}
              value={seller}
              onValueChange={setSeller}
              style={{ width: 170 }}
            />
          </div>

          <div className="filter-field">
            <span className="filter-label">상태</span>
            <Select
              size="sm"
              type="chip"
              multiple
              aria-label="상태"
              placeholder="전체"
              options={STATUS_OPTIONS}
              value={status}
              onValueChange={setStatus}
              style={{ minWidth: 220 }}
            />
          </div>

          <div className="filter-field">
            <span className="filter-label">검색어</span>
            <TextInput
              size="sm"
              aria-label="검색어"
              type="search"
              placeholder="판매처명, 상품권명"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ width: 240 }}
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
            <AgGridReact<VoucherRow>
              theme="legacy"
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              context={{ onEdit: handleEdit }}
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

      {isRegisterOpen && <VoucherRegisterPanel onClose={handleCloseRegister} />}
      {editingVoucher && (
        <VoucherEditPanel
          /* 수정화면용 임시 데이터 */
          initialData={{
            id: editingVoucher.id,
            publisher: editingVoucher.publisher,
            seller: editingVoucher.seller,
            voucherName: editingVoucher.voucherName,
            annualIssuanceLimit: editingVoucher.annualIssuanceLimit,
            annualDiscountLimit: editingVoucher.annualDiscountLimit,
            authKey: "1s458f135wNR0026",

            // 기본 정보
            category: "1",
            basicAttributes: ["1"],
            appDisplayType: "1",
            appDisplayName: editingVoucher.voucherName,
            voucherDescription: `${editingVoucher.voucherName} 전자상품권입니다.`,
            usageDescription: "전통시장 및 지정 가맹점에서 사용 가능합니다.",
            validityType: "1",
            validityPeriod: "5",
            pinValidityPeriod: "7",
            contactPhone: "15881234",

            // 기본 정책
            depositBusinessFund: "1,200,000,000",
            remainingBusinessFund: "850,000,000",
            holdingLimit: "2,000",
            personalPurchaseAvailable: "on",
            monthlyPurchaseLimit: "1,000",
            fullWithdrawSubsidyDeduction: "off",
            monthlyDiscountPurchaseLimit: "500",
            purchaseDiscountRate: "10.0",
            defaultMonthlySettlementLimit: "3,000",
            purchaseCancelPeriod: "7",
            monthlyGiftLimitType: "1",
            personalGiftLimit: "300",
            corporateGiftLimit: "1,000",
            unifiedGiftLimit: "500",

            // 환불기준 사용률
            refundRateOver10k: "60",
            refundRateUnder10k: "80",

            // 가맹점 수수료
            merchantFeeCode1: "0.5",
            merchantFeeCode2: "0.8",
            merchantFeeCode3: "1.0",
            merchantFeeCode4: "1.2",
            merchantFeeCodeN: "1.5",

            // 수수료 설정
            purchaseRefundFee: "0.0",
            expireRefundFee: "0.0",
            fullWithdrawFee: "1.0",
            systemOperatorFee: "0.3",
            salesFee: "2.0",
            platformOperatorFee: "0.2",

            // 판매/사용 정보
            channelLimits: {
              abc: { saleLimit: "50,000", discountLimit: "20,000" },
              kb: { saleLimit: "30,000", discountLimit: "10,000" },
              shinhan: { saleLimit: "", discountLimit: "" },
              nh: { saleLimit: "", discountLimit: "" },
              kakao: { saleLimit: "", discountLimit: "" },
            },
            merchantCategory: "all",
            merchantPostCode: "all",
            merchantSale: "none",
            merchantCorporation: "none",
          }}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
}
