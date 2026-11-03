import type { Column, ColumnGroup, GridApi, IRowNode } from "ag-grid-community";
import type { CellObject, Row } from "write-excel-file/browser";

const HEADER_STYLE: Partial<CellObject> = {
  fontWeight: "bold",
  backgroundColor: "#F2F4F7",
  align: "center",
  alignVertical: "center",
  borderColor: "#D0D5DD",
  borderStyle: "thin",
};

/** 화면 px 너비를 엑셀 열 너비(글자 수)로 바꿀 때 쓰는 비율 */
const PX_PER_CHAR = 7;

/**
 * 행 배열을 .xlsx 파일로 만들어 내려받는다.
 * 라이브러리는 버튼을 누를 때만 불러와서 첫 화면 로딩에 영향을 주지 않는다.
 */
async function saveXlsx(rows: Row[], fileName: string, options: { widths: number[]; headerRowCount: number }) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  await writeExcelFile(rows, {
    columns: options.widths.map((width) => ({ width })),
    stickyRowsCount: options.headerRowCount,
  }).toFile(fileName);
}

/** 파일 이름 뒤에 붙이는 오늘 날짜다. 예: 20261103 */
function todayStamp() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}${mm}${dd}`;
}

/** 데이터가 연결된 열만 내보낸다. "관리", "마스킹해제" 같은 버튼 열은 field가 없어서 빠진다. */
function hasData(column: Column) {
  const def = column.getColDef();
  return Boolean(def.field || def.valueGetter);
}

/** 패딩 그룹(그룹이 없는 열을 2단 헤더에 맞추려고 AG Grid가 넣는 빈 그룹)은 그룹이 없는 것으로 본다. */
function realGroup(column: Column): ColumnGroup | null {
  const group = column.getParent();
  return group && !group.isPadding() ? group : null;
}

/** 헤더 행을 만든다. 그룹 헤더가 있으면 2단으로 만들고, 그룹 제목 칸과 그룹 없는 열의 제목 칸을 병합한다. */
function buildHeaderRows<TData>(api: GridApi<TData>, columns: Column[]): Row[] {
  const title = (column: Column) => api.getDisplayNameForColumn(column, "header");
  const hasGroups = columns.some((column) => realGroup(column));

  if (!hasGroups) {
    return [columns.map((column) => ({ ...HEADER_STYLE, value: title(column) }))];
  }

  const groupRow: Row = [];
  const titleRow: Row = [];

  columns.forEach((column, index) => {
    const group = realGroup(column);

    if (!group) {
      groupRow.push({ ...HEADER_STYLE, value: title(column), rowSpan: 2 });
      titleRow.push(null);
      return;
    }

    // 같은 그룹의 첫 열에만 그룹 제목을 넣고, 이어지는 열 수만큼 병합한다.
    const isFirstInGroup = index === 0 || realGroup(columns[index - 1]) !== group;
    if (isFirstInGroup) {
      let span = 1;
      while (index + span < columns.length && realGroup(columns[index + span]) === group) span++;
      groupRow.push({ ...HEADER_STYLE, value: api.getDisplayNameForColumnGroup(group, "header"), columnSpan: span });
    } else {
      groupRow.push(null);
    }
    titleRow.push({ ...HEADER_STYLE, value: title(column) });
  });

  return [groupRow, titleRow];
}

/**
 * 셀 하나를 엑셀 값으로 바꾼다.
 * - 숫자는 계산할 수 있게 숫자 칸으로 넣고, 화면에 쉼표가 보이면 천 단위 서식을 붙인다.
 * - 나머지는 화면에 보이는 글자를 텍스트(@)로 넣는다. 긴 번호가 1.23E+19처럼 바뀌지 않게 한다.
 */
function toCell<TData>(api: GridApi<TData>, node: IRowNode<TData>, column: Column, bold: boolean): CellObject {
  const raw = api.getCellValue({ rowNode: node, colKey: column });
  const shown = api.getCellValue({ rowNode: node, colKey: column, useFormatter: true });
  const fontWeight = bold ? "bold" : undefined;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    const format = String(shown ?? "").includes(",") ? "#,##0" : undefined;
    return { value: raw, type: Number, format, fontWeight };
  }

  const text = shown == null ? "" : Array.isArray(shown) ? shown.join(", ") : String(shown);
  return { value: text, type: String, format: "@", fontWeight };
}

/**
 * AG Grid 표를 화면에 보이는 그대로 .xlsx로 내려받는다.
 * 현재 페이지만이 아니라 정렬·필터가 적용된 전체 행을 내보내고, 위에 고정된 행(합계 등)은 굵게 맨 위에 넣는다.
 * 파일 이름에는 오늘 날짜가 붙는다. 예: exportGridToExcel(api, "상품권 양도") → 상품권 양도_20261103.xlsx
 */
export async function exportGridToExcel<TData>(api: GridApi<TData>, fileName: string) {
  const columns = api.getAllDisplayedColumns().filter(hasData);
  const headerRows = buildHeaderRows(api, columns);

  const pinnedRows: Row[] = [];
  for (let i = 0; i < api.getPinnedTopRowCount(); i++) {
    const node = api.getPinnedTopRow(i);
    if (node) pinnedRows.push(columns.map((column) => toCell(api, node, column, true)));
  }

  const bodyRows: Row[] = [];
  api.forEachNodeAfterFilterAndSort((node) => {
    bodyRows.push(columns.map((column) => toCell(api, node, column, false)));
  });

  await saveXlsx([...headerRows, ...pinnedRows, ...bodyRows], `${fileName}_${todayStamp()}.xlsx`, {
    widths: columns.map((column) => Math.max(8, Math.round(column.getActualWidth() / PX_PER_CHAR))),
    headerRowCount: headerRows.length,
  });
}

/**
 * 제목 행만 있는 빈 업로드 양식을 내려받는다. 모든 열을 텍스트(@)로 지정해서 번호를 입력해도 숫자로 바뀌지 않게 한다.
 * 예: downloadExcelTemplate(["상품권번호", "고객명"], "환불 양식") → 환불 양식.xlsx
 */
export async function downloadExcelTemplate(headers: string[], fileName: string) {
  const headerRow: Row = headers.map((value) => ({ ...HEADER_STYLE, value, format: "@" }));
  await saveXlsx([headerRow], `${fileName}.xlsx`, {
    widths: headers.map((header) => Math.max(14, header.length * 2 + 4)),
    headerRowCount: 1,
  });
}
