import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, ColGroupDef, RowClassParams } from "ag-grid-community";
import { COL, exportGridToExcel, toDateValue } from "@utils";
import { Button, DateField, Dialog } from "@xoheeoh/components";

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
      <div className="page-title">
        <h3 className="text-heading3">알림 발송 통계</h3>
        <p className="text-body2 text-color-secondary">
          시스템에서 발송된 문자(알림톡, LMS 등)의 발송 통계를 조회합니다.
        </p>
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
            <span className="text-body2 table-item-label">기간</span>
            <DateField
              mode="range"
              className="table-item-value"
              from={dayFrom}
              to={dayTo}
              onFromChange={setDayFrom}
              onToChange={setDayTo}
              shortcut={dayShortcut}
              onShortcutChange={setDayShortcut}
            />
          </div>
        </div>
      </div>

      <div className="grid-panel">
        <div className="flex-between">
          <div className="row-center gap-8">
            <span className="grid-count-badge">총 {rowData.length.toLocaleString("ko-KR")} 건</span>
            <span className="text-caption1 text-color-danger">
              ⓘ 대량선물 건수에는 자동생성 건수가 포함되어있습니다.
            </span>
          </div>

          <div className="row-center gap-8">
            <span className="text-caption1 text-color-secondary">ⓘ 단가: 카카오 알림톡: 00.0원 / LMS: 00.0원</span>
            <Button size="sm" variant="outlined" color="neutral" onClick={() => setIsBasisModalOpen(true)} label="집계 기준" />
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

      {/* 집계 기준 테이블 모달 */}
      <Dialog
        size="lg"
        open={isBasisModalOpen}
        onClose={() => setIsBasisModalOpen(false)}
        title="집계 기준"
        footer={
          <Button variant="outlined" color="neutral" onClick={() => setIsBasisModalOpen(false)} label="확인" />
        }>
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>구분</th>
                <th>타입</th>
                <th>집계 기준</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>개인선물</td>
                <td
                  rowSpan={9}
                  style={{
                    borderRight: "1px solid var(--color-border-default)",
                    borderLeft: "1px solid var(--color-border-default)",
                  }}>
                  성공: 카카오 알림톡
                  <br />
                  실패: LMS
                </td>
                <td>
                  <ul style={s.list}>
                    <li>발송일 기준 / 발송된 판매처에 부과</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>대량선물</td>
                <td>
                  <ul style={s.list}>
                    <li>대량선물 & 자동생성 합산하여 집계</li>
                    <li>
                      대량선물은 상태값에 따라 집계
                      <ul style={s.subList}>
                        <li>- 등록대기: 집계에서 제외 (등록 또는 취소 후 집계 반영)</li>
                        <li>- 등록: 등록일 기준 / 등록된 판매처에 부과</li>
                        <li>- 관리자취소 or 만료취소: 취소 or 만료일 기준 / 플랫폼 운영기관에 부과</li>
                      </ul>
                    </li>
                    <li>
                      대량선물 재발송 건수도 재발송 후 상태값에 따라 집계
                      <ul style={s.subList}>
                        <li>- 등록대기: 집계에서 제외 (등록 또는 취소 후 집계 반영)</li>
                        <li>- 등록: 등록일 기준 / 등록된 판매처에 부과</li>
                        <li>- 관리자취소 or 만료취소: 취소 or 만료일 기준 / 플랫폼 운영기관에 부과</li>
                      </ul>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>자동생성</td>
                <td>
                  <ul style={s.list}>
                    <li>
                      자동생성 건은 상태값에 따라 집계
                      <ul style={s.subList}>
                        <li>- 생성성공 문자: 지정된 판매처에 부과</li>
                        <li>- 생성실패 문자: 플랫폼 운영기관에 부과</li>
                      </ul>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>만료예정</td>
                <td>
                  <ul style={s.list}>
                    <li>만료예정 알림톡 발송일 기준 / 발송시점 상품권 보유 판매처에 부과</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>가맹점 승인</td>
                <td>
                  <ul style={s.list}>
                    <li>발송일 기준 / 플랫폼 운영기관에 부과</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>FDS</td>
                <td>
                  <ul style={s.list}>
                    <li>FDS 이상거래 대상 선정 가맹점 대표자 휴대폰번호로 알림톡 발송 건수 / 플랫폼 운영기관에 부과</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>기타</td>
                <td>
                  <ul style={s.list}>
                    <li>다른 항목에 속하지 않은 모든 건수 / 발송일 기준 / 플랫폼 운영기관에 부과</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>관리자 인증 및 임시 비밀번호</td>
                <td>
                  <ul style={s.list}>
                    <li>발송일 기준 / 플랫폼 운영기관에 부과</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>기타</td>
                <td>
                  <ul style={s.list}>
                    <li>관리자인증 & 임시 비밀번호가 아닌 모든 건수 / 발송일 기준 / 플랫폼 운영기관에 부과</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>회원인증</td>
                <td
                  style={{
                    borderRight: "1px solid var(--color-border-default)",
                    borderLeft: "1px solid var(--color-border-default)",
                  }}>
                  본인인증
                </td>
                <td>
                  <ul style={s.list}>
                    <li>인증 발생일자 기준 / 발행한 판매처에 부과</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Dialog>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  list: {
    paddingLeft: 16,
    lineHeight: 1.7,
  },
  subList: {
    paddingLeft: 0,
    listStyleType: "none",
    color: "var(--color-text-secondary)",
  },
};
