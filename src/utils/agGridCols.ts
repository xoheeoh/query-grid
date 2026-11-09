import type { ColDef, ModelUpdatedEvent, ValueFormatterParams } from "ag-grid-community";
import { formatAmount, formatDate } from "./numberUtils";

/** 전 화면 공통 No 컬럼 폭 */
export const AG_GRID_NO_WIDTH = 72;

/**
 * 순번(No) 열을 다시 그린다.
 * AG Grid는 줄이 추가·정렬·페이지 이동으로 자리만 바뀌면 칸을 다시 그리지 않아서, 자리 번호를 쓰는 No 열이 옛 값으로 남는다.
 * 모든 표의 onModelUpdated에 이 함수를 넣는다.
 */
export function refreshRowNumbers(event: ModelUpdatedEvent) {
  event.api.refreshCells({ columns: ["no"], force: true });
}

type ColOpts<TData> = Omit<ColDef<TData>, "headerName" | "field">;

function amountFormatter(params: ValueFormatterParams) {
  return params.value == null ? "" : formatAmount(Number(params.value));
}

export function dateFormatter(params: ValueFormatterParams) {
  return params.value == null ? "" : formatDate(params.value);
}

function withField<TData>(field: string | undefined): Pick<ColDef<TData>, "field"> | object {
  return field ? { field: field as ColDef<TData>["field"] } : {};
}

/**
 * AgGrid 컬럼 정렬 룰
 * - text: 가변 길이 텍스트 → 좌측
 * - amount: 금액/수수료 등 숫자 → 우측
 * - date: 날짜/시간 → 중앙
 * - fixed: ID/전화번호/단일 상태 등 → 중앙
 * - badges: 복수 뱃지(다중 선택 상태 등) → 헤더 중앙, 셀 좌측
 * - action: 관리 버튼 등 → 헤더·버튼 모두 중앙
 * - no: 순번 → 중앙, 전 화면 동일 폭
 */
export const COL = {
  /**
   * 순번. 데이터의 id가 아니라 표에 보이는 순서(정렬·페이지 반영)를 1부터 센다.
   * field는 열 식별용으로만 쓰고 값은 자리 번호에서 만든다.
   */
  no: <TData = unknown>(field: string = "id", opts?: ColOpts<TData>): ColDef<TData> => ({
    headerName: "No",
    field: field as ColDef<TData>["field"],
    colId: "no",
    width: AG_GRID_NO_WIDTH,
    headerClass: "ag-header-right",
    cellStyle: { textAlign: "right" },
    valueGetter: (params) => (params.node?.rowIndex == null ? "" : params.node.rowIndex + 1),
    sortable: false,
    ...opts,
  }),

  text: <TData = unknown>(headerName: string, field: string, opts?: ColOpts<TData>): ColDef<TData> => ({
    headerName,
    field: field as ColDef<TData>["field"],
    headerClass: "ag-header-left",
    cellStyle: { textAlign: "left" },
    ...opts,
  }),

  amount: <TData = unknown>(headerName: string, field: string, opts?: ColOpts<TData>): ColDef<TData> => ({
    headerName,
    field: field as ColDef<TData>["field"],
    headerClass: "ag-header-right",
    cellStyle: { textAlign: "right" },
    valueFormatter: amountFormatter,
    ...opts,
  }),

  date: <TData = unknown>(headerName: string, field: string, opts?: ColOpts<TData>): ColDef<TData> => ({
    headerName,
    field: field as ColDef<TData>["field"],
    headerClass: "ag-header-center",
    cellStyle: { textAlign: "center" },
    valueFormatter: dateFormatter,
    ...opts,
  }),

  /** field 없이 colId만 쓸 때는 두 번째 인자를 생략하고 opts에 colId를 넣음 */
  fixed: <TData = unknown>(headerName: string, field?: string, opts?: ColOpts<TData>): ColDef<TData> => ({
    headerName,
    ...withField<TData>(field),
    headerClass: "ag-header-center",
    cellStyle: { textAlign: "center" },
    ...opts,
  }),

  /** 복수 뱃지: 헤더는 중앙, 뱃지 그룹은 좌측 */
  badges: <TData = unknown>(headerName: string, field: string, opts?: ColOpts<TData>): ColDef<TData> => ({
    headerName,
    field: field as ColDef<TData>["field"],
    headerClass: "ag-header-center",
    cellStyle: { textAlign: "left" },
    ...opts,
  }),

  /** 관리 버튼 등: 헤더·셀 콘텐츠 모두 중앙. field 없으면 opts에 colId 사용 */
  action: <TData = unknown>(headerName: string, field?: string, opts?: ColOpts<TData>): ColDef<TData> => ({
    headerName,
    ...withField<TData>(field),
    headerClass: "ag-header-center",
    cellStyle: { textAlign: "center" },
    sortable: false,
    ...opts,
  }),
} as const;
