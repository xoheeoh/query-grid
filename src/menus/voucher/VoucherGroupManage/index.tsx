import { useEffect, useMemo, useState } from "react";

import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, ICellRendererParams } from "ag-grid-community";

import { Button, TextButton, TextInput, Select } from "@xoheeoh/components";
import { COL, refreshRowNumbers } from "@utils";
import VoucherGroupEditPanel from "./edit/VoucherGroupEditPanel";
import VoucherGroupRegisterPanel from "./register/VoucherGroupRegisterPanel";

const PUBLISHER_OPTIONS = [{ label: "전체", value: "all" }];

type VoucherGroupRow = {
  id: number;
  publisher: string;
  voucherGroupName: string;
  voucherDetail: string;
  registrant: string;
};

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: VoucherGroupRow[] = [
  {
    id: 1,
    publisher: "서울특별시",
    voucherGroupName: "테스트 상품권 그룹명",
    voucherDetail: "온누리상품권 외 00개",
    registrant: "홍길동 (gildonghong)",
  },
  {
    id: 2,
    publisher: "플랫폼 운영기관",
    voucherGroupName: "테스트 상품권 그룹명",
    voucherDetail: "온누리상품권 외 00개",
    registrant: "홍길동 (gildonghong)",
  },
  {
    id: 3,
    publisher: "경상남도",
    voucherGroupName: "테스트 상품권 그룹명",
    voucherDetail: "온누리상품권 외 00개",
    registrant: "홍길동 (gildonghong)",
  },
];

function EditRenderer(params: ICellRendererParams<VoucherGroupRow>) {
  const onEdit = params.context?.onEdit as ((row: VoucherGroupRow) => void) | undefined;

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

export default function VoucherGroupManage() {
  const [publisher, setPublisher] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [rowData, setRowData] = useState<VoucherGroupRow[]>([]);
  const [editingVoucherGroup, setEditingVoucherGroup] = useState<VoucherGroupRow | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const columnDefs = useMemo<ColDef<VoucherGroupRow>[]>(
    () => [
      COL.no<VoucherGroupRow>(),
      COL.text<VoucherGroupRow>("등록처(발행처)", "publisher", { width: 150 }),
      COL.text<VoucherGroupRow>("상품권 그룹명", "voucherGroupName", { width: 180 }),
      COL.text<VoucherGroupRow>("상품권", "voucherDetail", { flex: 1 }),
      COL.text<VoucherGroupRow>("등록자", "registrant", { width: 170 }),
      COL.action<VoucherGroupRow>("관리", undefined, {
        colId: "edit",
        width: 80,
        cellRenderer: EditRenderer,
      }),
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  const handleReset = () => {
    setPublisher("all");
    setSearch("");
    setRowData([]);
  };

  const handleSearch = () => {
    const keyword = search.trim();
    const filtered = MOCK_ROWS.filter((row) => {
      if (!keyword) return true;
      return row.voucherGroupName.includes(keyword);
    });
    setRowData(filtered);
  };

  useEffect(() => {
    handleSearch();
    // 최초 로드 시 기본 조회옵션으로 1회 조회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (row: VoucherGroupRow) => {
    setEditingVoucherGroup(row);
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div className="page-title">
          <h3>상품권 그룹 관리</h3>
          <p>발행처별 상품권 그룹을 등록 및 관리합니다.</p>
        </div>

        <Button onClick={() => setIsRegisterOpen(true)} label="상품권 그룹 등록" />
      </div>

      <div className="filter-bar">
        <div className="filter-fields">
          <div className="filter-field">
            <span className="filter-label">발행처</span>
            <Select
              size="sm"
              aria-label="발행처"
              options={PUBLISHER_OPTIONS}
              value={publisher}
              onValueChange={setPublisher}
              style={{ width: 170 }}
            />
          </div>

          <div className="filter-field">
            <span className="filter-label">검색어</span>
            <TextInput
              size="sm"
              aria-label="검색어"
              type="search"
              placeholder="상품권 그룹명"
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
            <AgGridReact<VoucherGroupRow>
              theme="legacy"
              onModelUpdated={refreshRowNumbers}
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

      {isRegisterOpen && <VoucherGroupRegisterPanel onClose={() => setIsRegisterOpen(false)} />}
      {editingVoucherGroup && (
        <VoucherGroupEditPanel initialData={editingVoucherGroup} onClose={() => setEditingVoucherGroup(null)} />
      )}
    </div>
  );
}
