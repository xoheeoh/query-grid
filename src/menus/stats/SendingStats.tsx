import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, ColGroupDef, RowClassParams } from "ag-grid-community";
import { COL, exportGridToExcel, toDateValue } from "@utils";
import { Button, DateField, Dialog, Icon, TextButton } from "@xoheeoh/components";
import { mdiHelpCircleOutline } from "@mdi/js";

type SendingStatsRow = {
  id: number;
  seller: string;
  isSummary?: boolean;
  // 카카오 알림톡
  kakaoPersonal: number;
  kakaoBulk: number;
  kakaoAuto: number;
  kakaoExpire: number;
  kakaoAdmin: number;
  kakaoFds: number;
  kakaoEtc: number;
  kakaoTotal: number;
  // LMS
  lmsPersonal: number;
  lmsBulk: number;
  lmsAuto: number;
  lmsExpire: number;
  lmsAdmin: number;
  lmsFds: number;
  lmsEtc: number;
  lmsTotal: number;
};

const CHANNEL_SUB_COLS = [
  { label: "개인선물", kakao: "kakaoPersonal", lms: "lmsPersonal", width: 110 },
  { label: "대량선물", kakao: "kakaoBulk", lms: "lmsBulk", width: 110 },
  { label: "자동생성", kakao: "kakaoAuto", lms: "lmsAuto", width: 110 },
  { label: "만료예정", kakao: "kakaoExpire", lms: "lmsExpire", width: 110 },
  { label: "관리자 인증 및 임시 비밀번호", kakao: "kakaoAdmin", lms: "lmsAdmin", width: 190 },
  { label: "FDS", kakao: "kakaoFds", lms: "lmsFds", width: 110 },
  { label: "기타", kakao: "kakaoEtc", lms: "lmsEtc", width: 110 },
  { label: "합계", kakao: "kakaoTotal", lms: "lmsTotal", width: 110 },
] as const;

const MOCK_AMOUNT = 10000000;

function makeStatsRow(id: number, seller: string, amount: number = MOCK_AMOUNT, isSummary = false): SendingStatsRow {
  return {
    id,
    seller,
    isSummary,
    kakaoPersonal: amount,
    kakaoBulk: amount,
    kakaoAuto: amount,
    kakaoExpire: amount,
    kakaoAdmin: amount,
    kakaoFds: amount,
    kakaoEtc: amount,
    kakaoTotal: amount,
    lmsPersonal: amount,
    lmsBulk: amount,
    lmsAuto: amount,
    lmsExpire: amount,
    lmsAdmin: amount,
    lmsFds: amount,
    lmsEtc: amount,
    lmsTotal: amount,
  };
}

const MOCK_SUMMARY_ROWS: SendingStatsRow[] = [
  makeStatsRow(-1, "합계 (발송일 기준)", MOCK_AMOUNT, true),
  makeStatsRow(-2, "합계 (청구 기준)", MOCK_AMOUNT, true),
];

const MOCK_SELLER_ROWS: SendingStatsRow[] = [
  makeStatsRow(1, "국민은행"),
  makeStatsRow(2, "가나다페이"),
  makeStatsRow(3, "경남은행"),
  makeStatsRow(4, "플랫폼 운영기관"),
  makeStatsRow(5, "신한은행"),
  makeStatsRow(6, "우리은행"),
  makeStatsRow(7, "하나은행"),
  makeStatsRow(8, "IBK기업은행"),
  makeStatsRow(9, "NH농협은행"),
  makeStatsRow(10, "카카오뱅크"),
  makeStatsRow(11, "토스뱅크"),
  makeStatsRow(12, "케이뱅크"),
];

export default function SendingStats() {
  const [dayFrom, setDayFrom] = useState(() => toDateValue(new Date()));
  const [dayTo, setDayTo] = useState(() => toDateValue(new Date()));
  const [dayShortcut, setDayShortcut] = useState("today");
  const [rowData, setRowData] = useState<SendingStatsRow[]>([]);
  const [pinnedTopRowData, setPinnedTopRowData] = useState<SendingStatsRow[]>([]);
  const [isBasisModalOpen, setIsBasisModalOpen] = useState(false);

  const handleReset = () => {
    const today = toDateValue(new Date());
    setDayFrom(today);
    setDayTo(today);
    setDayShortcut("today");
    setRowData([]);
    setPinnedTopRowData([]);
  };

  const handleSearch = () => {
    setPinnedTopRowData(MOCK_SUMMARY_ROWS);
    setRowData(MOCK_SELLER_ROWS);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const columnDefs = useMemo<(ColDef<SendingStatsRow> | ColGroupDef<SendingStatsRow>)[]>(
    () => [
      COL.text<SendingStatsRow>("판매처", "seller", { width: 160 }),
      {
        headerName: "카카오 알림톡",
        headerClass: "ag-header-center",
        marryChildren: true,
        children: CHANNEL_SUB_COLS.map((col) =>
          COL.amount<SendingStatsRow>(col.label, col.kakao, { width: col.width })
        ),
      },
      {
        headerName: "LMS",
        headerClass: "ag-header-center",
        marryChildren: true,
        children: CHANNEL_SUB_COLS.map((col) => COL.amount<SendingStatsRow>(col.label, col.lms, { width: col.width })),
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  const gridRef = useRef<AgGridReact<SendingStatsRow>>(null);
  const handleExcelDownload = () => {
    if (gridRef.current) exportGridToExcel(gridRef.current.api, "알림 발송 통계");
  };

  const getRowClass = (params: RowClassParams<SendingStatsRow>) =>
    params.data?.isSummary ? "grid-row-summary" : undefined;

  return (
    <div className="page-root">
      <div className="page-header">
        <div className="page-title">
          <h3>알림 발송 통계</h3>
          <p>시스템에서 발송된 문자(알림톡, LMS 등)의 발송 통계를 조회합니다.</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-fields">
          <div className="filter-field">
            <span className="filter-label">기간</span>
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
        </div>

        <div className="filter-actions">
          <TextButton size="sm" color="neutral" onClick={handleReset} label="초기화" />
          <Button size="sm" onClick={handleSearch} label="조회" />
        </div>
      </div>

      <div className="result-panel">
        <div className="result-toolbar">
          <div className="row-center gap-12">
            <span className="result-count">
              총 <strong>{rowData.length.toLocaleString("ko-KR")}</strong>건
            </span>
            <span className="text-caption1 text-color-danger">
              ⓘ 대량선물 건수에는 자동생성 건수가 포함되어있습니다.
            </span>
            {/* 실행 버튼이 아니라 설명을 여는 도움말이라 글자 버튼으로 둔다. */}
            <TextButton
              size="sm"
              color="neutral"
              icon={<Icon path={mdiHelpCircleOutline} size={16} />}
              onClick={() => setIsBasisModalOpen(true)}
              label="집계 기준"
            />
          </div>

          <div className="row-center gap-8">
            <span className="text-caption1 text-color-secondary">ⓘ 단가: 카카오 알림톡: 00.0원 / LMS: 00.0원</span>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              disabled={rowData.length === 0}
              onClick={handleExcelDownload}
              label="엑셀 다운로드"
            />
          </div>
        </div>

        <AgGridProvider modules={[AllCommunityModule]}>
          <div className="ag-theme-alpine grid-fill-wrap">
            <AgGridReact<SendingStatsRow>
              ref={gridRef}
              theme="legacy"
              rowData={rowData}
              pinnedTopRowData={pinnedTopRowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowClass={getRowClass}
              pagination
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              paginationPanels={["pageSize", "pageSummary"]}
              animateRows
              rowHeight={40}
              headerHeight={40}
              groupHeaderHeight={40}
              localeText={{
                noRowsToShow: "조회 결과가 없습니다.",
                pageSizeSelectorLabel: "",
              }}
              getRowId={(p) => String(p.data.id)}
            />
          </div>
        </AgGridProvider>
      </div>

      {/* 집계 기준 안내 모달. 데모라 대표 항목 4개만 보여준다. */}
      <Dialog
        size="lg"
        open={isBasisModalOpen}
        onClose={() => setIsBasisModalOpen(false)}
        title="집계 기준 안내"
        footer={
          <Button variant="outlined" color="neutral" onClick={() => setIsBasisModalOpen(false)} label="확인" />
        }>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 120 }}>구분</th>
              <th style={{ width: 150 }}>발송 채널</th>
              <th>집계 기준</th>
            </tr>
          </thead>
          <tbody>
            {BASIS_ROWS.map((row, index) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                {index === 0 && (
                  <td rowSpan={BASIS_ROWS.length} style={s.channelCell}>
                    성공: 카카오 알림톡
                    <br />
                    실패: LMS
                  </td>
                )}
                <td>
                  <ul style={s.list}>
                    {row.rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Dialog>
    </div>
  );
}

/** 집계 기준 안내 표의 내용 */
const BASIS_ROWS = [
  { label: "개인선물", rules: ["발송일 기준 / 발송된 판매처에 부과"] },
  {
    label: "대량선물",
    rules: [
      "대량선물과 자동생성 건을 합산하여 집계",
      "등록 건은 등록일 기준 / 등록된 판매처에 부과",
      "관리자취소·만료취소 건은 취소일 기준 / 플랫폼 운영기관에 부과",
    ],
  },
  { label: "만료예정", rules: ["만료예정 알림톡 발송일 기준 / 발송 시점에 상품권을 보유한 판매처에 부과"] },
  { label: "기타", rules: ["위 항목에 속하지 않은 모든 건수 / 발송일 기준 / 플랫폼 운영기관에 부과"] },
];

const s: Record<string, CSSProperties> = {
  list: {
    margin: 0,
    paddingLeft: 16,
    lineHeight: 1.7,
  },
  channelCell: {
    borderLeft: "1px solid var(--color-gray-100)",
    borderRight: "1px solid var(--color-gray-100)",
    verticalAlign: "middle",
    textAlign: "center",
  },
};
