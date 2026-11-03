import { useEffect, useMemo, useState } from "react";

import { AgGridReact, AgGridProvider } from "ag-grid-react";
import { AllCommunityModule, type ColDef, type ICellRendererParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { COL } from "@utils";
import { Button, Checkbox, CheckboxGroup, TextInput, Select } from "@xoheeoh/components";
import VoucherRegisterPanel from "./register/VoucherRegisterPanel";
import VoucherEditPanel from "./edit/VoucherEditPanel";

const PUBLISHER_OPTIONS = [{ label: "전체", value: "all" }];
const SELLER_OPTIONS = [{ label: "전체", value: "all" }];
const STATUS_OPTIONS = ["1", "2", "3", "4"] as const;

const STATUS_LABEL: Record<(typeof STATUS_OPTIONS)[number], string> = {
  "1": "개인구매가능",
  "2": "대량구매가능",
  "3": "개인구매중지",
  "4": "대량구매중지",
};

type StatusCode = (typeof STATUS_OPTIONS)[number];

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

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: VoucherRow[] = [
  {
    id: 1,
    publisher: "중소벤처기업부",
    seller: "가나다은행",
    voucherName: "온누리상품권",
    status: ["1", "4"],
    annualIssuanceLimit: 120000000000,
    totalIssuance: 120000000000,
    annualDiscountLimit: 120000000000,
    totalDiscount: 120000000000,
  },
  {
    id: 2,
    publisher: "중소벤처기업부",
    seller: "가나다은행",
    voucherName: "온누리상품권",
    status: ["1", "2"],
    annualIssuanceLimit: 120000000000,
    totalIssuance: 120000000000,
    annualDiscountLimit: 120000000000,
    totalDiscount: 120000000000,
  },
  {
    id: 3,
    publisher: "서울특별시",
    seller: "가나다은행",
    voucherName: "서울사랑상품권",
    status: ["2", "3"],
    annualIssuanceLimit: 120000000000,
    totalIssuance: 120000000000,
    annualDiscountLimit: 120000000000,
    totalDiscount: 120000000000,
  },
  {
    id: 4,
    publisher: "김포시",
    seller: "가나다은행",
    voucherName: "김포사랑상품권",
    status: ["1"],
    annualIssuanceLimit: 120000000000,
    totalIssuance: 120000000000,
    annualDiscountLimit: 120000000000,
    totalDiscount: 120000000000,
  },
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
 variant="outlined" color="neutral"
 onClick={() => {
 if (params.data) onEdit?.(params.data);
 }} label="수정" />
    </span>
  );
}

export default function VoucherManage() {
  const [publisher, setPublisher] = useState<string>("all");
  const [seller, setSeller] = useState<string>("all");
  const [status, setStatus] = useState<string[]>([...STATUS_OPTIONS]);
  const [search, setSearch] = useState<string>("");
  const [rowData, setRowData] = useState<VoucherRow[]>([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherRow | null>(null);

  const allStatusSelected = STATUS_OPTIONS.every((v) => status.includes(v));
  const someStatusSelected = status.length > 0 && !allStatusSelected;

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
      COL.text<VoucherRow>("발행처", "publisher", { width: 120 }),
      COL.text<VoucherRow>("판매처", "seller", { width: 120 }),
      COL.text<VoucherRow>("상품권명", "voucherName", { flex: 1, minWidth: 160 }),
      COL.badges<VoucherRow>("상태", "status", { width: 220, cellRenderer: StatusBadgeRenderer }),
      COL.amount<VoucherRow>("연 발행한도", "annualIssuanceLimit", { width: 150 }),
      COL.amount<VoucherRow>("누적 발행금액", "totalIssuance", { width: 150 }),
      COL.amount<VoucherRow>("연 할인한도", "annualDiscountLimit", { width: 150 }),
      COL.amount<VoucherRow>("누적 할인금액", "totalDiscount", { width: 160 }),
      COL.action<VoucherRow>("관리", undefined, {
        colId: "manage",
        width: 100,
        cellRenderer: ManageRenderer,
      }),
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  const handleReset = () => {
    setPublisher("all");
    setSeller("all");
    setStatus([...STATUS_OPTIONS]);
    setSearch("");
    setRowData([]);
  };

  const handleSearch = () => {
    const keyword = search.trim();
    const filtered = MOCK_ROWS.filter((row) => {
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
      <div className="flex-between">
        <div className="page-title">
          <h3 className="text-heading3">상품권 관리</h3>
          <p className="text-body2 text-color-secondary">플랫폼을 통해 발행 될 상품권을 등록 및 관리합니다.</p>
        </div>

        <Button onClick={() => setIsRegisterOpen(true)} label="상품권 등록" />
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
            <span className="text-body2 table-item-label">발행처</span>
            <Select
              options={PUBLISHER_OPTIONS}
              value={publisher}
              onValueChange={(value) => setPublisher(value)}
              className="table-item-value"
            />
          </div>

          <div className="table-item">
            <span className="text-body2 table-item-label">판매처</span>
            <Select
              options={SELLER_OPTIONS}
              value={seller}
              onValueChange={(value) => setSeller(value)}
              className="table-item-value"
            />
          </div>

          <div className="table-item">
            <span className="text-body2 table-item-label">상태</span>
            <div className="row-start gap-12">
              <Checkbox
                label="전체"
                labelStyle={{ whiteSpace: "nowrap" }}
                checked={allStatusSelected}
                indeterminate={someStatusSelected}
                onChange={(e) => setStatus(e.target.checked ? [...STATUS_OPTIONS] : [])}
              />
              <CheckboxGroup name="status" value={status} onChange={setStatus} direction="horizontal" options={[{ value: "1", label: "개인구매 가능" }, { value: "2", label: "대량구매 가능" }, { value: "3", label: "개인구매 중지" }, { value: "4", label: "대량구매 중지" }]} />
            </div>
          </div>

          <div className="table-item">
            <span className="text-body2 table-item-label">검색어</span>
            <TextInput
              type="search"
              placeholder="판매처명, 상품권명을 입력해 주세요."
              className="table-item-value"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
      </div>

      <div className="grid-panel">
        <span className="grid-count-badge">총 {rowData.length.toLocaleString("ko-KR")} 건</span>

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
            validityPeriod: "1",
            pinValidityPeriod: "1",
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
