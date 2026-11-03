import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef } from "ag-grid-community";
import { Banner, Button, Icon, IconButton, TextInput, Select } from "@xoheeoh/components";
import { mdiArrowLeft, mdiFileArrowUpDownOutline, mdiFileCheckOutline } from "@mdi/js";
import { useSubviewLock } from "@menus/SubviewLockContext";
import { COL, downloadExcelTemplate, exportGridToExcel } from "@utils";
import styles from "./BulkRequestPanel.module.css";

type BulkRequestPanelProps = {
  onClose: () => void;
};

/** 업로드 양식별 열 제목. 데모용 구성이며 파일 체크 결과 표의 입력 항목을 기준으로 한다. */
const REFUND_TEMPLATE_HEADERS = ["상품권번호", "상품권ID", "고객명", "은행코드", "계좌번호"];

const TEMPLATE_DOWNLOAD_OPTIONS = [
  { value: "1", label: "환불 양식", headers: REFUND_TEMPLATE_HEADERS },
  { value: "2", label: "만료일 연장 양식", headers: ["상품권번호", "상품권ID", "고객명", "연장 만료일 (YYYY-MM-DD)"] },
  { value: "3", label: "대량구매 환불 양식", headers: REFUND_TEMPLATE_HEADERS },
] as const;

type FileCheckResultRow = {
  id: number;
  giftCardNo: string;
  giftCardId: string;
  usrNm: string;
  bankCd: string;
  bankNo: string;
  verified: string;
  notified: string;
  errorMsg: string;
};

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: FileCheckResultRow[] = [
  {
    id: 1,
    giftCardNo: "41210141000013347490",
    giftCardId: "202008280158",
    usrNm: "홍길동",
    bankCd: "004",
    bankNo: "12345678901234",
    verified: "Y",
    notified: "Y",
    errorMsg: "O (카드결제)",
  },
  {
    id: 2,
    giftCardNo: "999999000013346237",
    giftCardId: "202003300082",
    usrNm: "홍길동",
    bankCd: "011",
    bankNo: "456789012334",
    verified: "Y",
    notified: "N",
    errorMsg: "고객미환불금 낙전",
  },
  {
    id: 3,
    giftCardNo: "48210141000013347371",
    giftCardId: "202003300083",
    usrNm: "홍길동",
    bankCd: "003",
    bankNo: "45678901234",
    verified: "N",
    notified: "Y",
    errorMsg: "이관폐기 상품권",
  },
];

async function downloadTemplate(option: (typeof TEMPLATE_DOWNLOAD_OPTIONS)[number]) {
  await downloadExcelTemplate([...option.headers], option.label);
}

export default function BulkRequestPanel({ onClose }: BulkRequestPanelProps) {
  useSubviewLock();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateSelectValue, setTemplateSelectValue] = useState("");
  const [rowData, setRowData] = useState<FileCheckResultRow[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const fileCheckSuccess = false;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: 실제 파일 업로드 API 연동 후 응답 데이터로 setRowData 교체
    setRowData(MOCK_ROWS);
    setIsFileUploaded(true);
  };

  const handleTemplateDownload = async (selectedValue: string) => {
    if (!selectedValue) return;

    const selected = TEMPLATE_DOWNLOAD_OPTIONS.find((option) => option.value === selectedValue);
    if (!selected) return;

    await downloadTemplate(selected);
    setTemplateSelectValue("");
  };

  const columnDefs = useMemo<ColDef<FileCheckResultRow>[]>(
    () => [
      COL.no<FileCheckResultRow>(),
      COL.text<FileCheckResultRow>("상품권번호", "giftCardNo", { width: 200 }),
      COL.text<FileCheckResultRow>("상품권ID", "giftCardId", { width: 160 }),
      COL.text<FileCheckResultRow>("고객명", "usrNm", { width: 150 }),
      COL.fixed<FileCheckResultRow>("은행코드", "bankCd", { width: 100 }),
      COL.text<FileCheckResultRow>("계좌번호", "bankNo", { width: 160 }),
      COL.fixed<FileCheckResultRow>("수취인확인여부", "verified", { width: 120 }),
      COL.fixed<FileCheckResultRow>("알림여부", "notified", { width: 100 }),
      COL.text<FileCheckResultRow>("확인", "errorMsg", { minWidth: 160, flex: 1 }),
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  const gridRef = useRef<AgGridReact<FileCheckResultRow>>(null);
  const handleExcelDownload = () => {
    if (gridRef.current) exportGridToExcel(gridRef.current.api, "파일 체크 결과");
  };

  return (
    <div
      className="page-subview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-request-title"
      // Sidebar hover/flyout과 레이어가 겹칠 때, 모달이 sidebar 위로 올라가 pointer 이벤트를 가로채는 문제를 방지
      style={{ zIndex: 10 }}>
      <div className="page-subview-main">
        <div className="page-subview-header flex-between">
          <div className="row-start gap-12">
            <IconButton variant="outlined" color="neutral" onClick={onClose} aria-label="대량 처리 요청 닫기" icon={<Icon path={mdiArrowLeft} />} />
            <div className="page-title">
              <h3 id="bulk-request-title" className="text-heading3">
                일괄 수기처리 요청
              </h3>
              <p className="text-body2 text-color-secondary">신규 일괄 수기처리 요청내역을 등록합니다.</p>
            </div>
          </div>
        </div>

        <div className="page-subview-body flex-col gap-16">
          <div className={styles.body}>
            <div className={`row-center gap-8 ${styles.title}`}>
              <Icon path={mdiFileArrowUpDownOutline} size={22} />
              <span className="text-subtitle2">일괄 수기처리</span>
            </div>

            <div className={styles.content}>
              <div className={styles.layoutBox}>
                <div className="row-center gap-8">
                  <span className={`text-body2 ${styles.tableLabel}`}>파일 업로드</span>

                  <div className={`table-item-value row-center gap-8 ${styles.fileUpload}`}>
                    <TextInput
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      className={`table-item-value ${styles.fileInput}`}
                      onChange={handleFileChange}
                    />
                    <Button type="button" color="neutral" onClick={() => fileInputRef.current?.click()} label="파일 선택" />
                  </div>
                </div>

                <div className="row-center gap-8">
                  <Select
                    style={{ minWidth: 180 }}
                    value={templateSelectValue}
                    onValueChange={handleTemplateDownload}
                    options={TEMPLATE_DOWNLOAD_OPTIONS.map(({ value, label }) => ({ value, label }))}
                    placeholder="양식 다운로드"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 파일 업로드 이후에만 보임 */}
          {isFileUploaded && (
            <>
              <div className="row-center gap-8">
                {fileCheckSuccess ? (
                  <Banner
                    type="success"
                    message="데이터가 정상 업로드되었습니다."
                    detailMessage="'환불 가능여부 확인' 버튼을 클릭하시면, 상품권별 환불 가능여부 및 수취인 조회가 진행됩니다."
                    style={{ flex: 1 }}
                  />
                ) : (
                  <Banner
                    type="warning"
                    message="데이터 확인하여 수정 후 다시 파일을 업로드해주시기 바랍니다."
                    style={{ flex: 1 }}
                  />
                )}
                <Button
                  size="sm"
                  color="neutral"
                  disabled={!fileCheckSuccess}
                  onClick={() => {}}
                  label="환불 가능여부 확인"
                />
              </div>

              <div className={styles.body} style={{ flex: 1, marginBottom: 16 }}>
                <div className={`flex-between ${styles.title}`} style={{ height: 57 }}>
                  <div className="row-center gap-8">
                    <Icon path={mdiFileCheckOutline} size={22} />
                    <span className="text-subtitle2">파일 체크 결과</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    disabled={rowData.length === 0}
                    onClick={handleExcelDownload}
                    label="엑셀 다운로드"
                  />
                </div>

                <div className="grid-panel" style={{ border: "none" }}>
                  <AgGridProvider modules={[AllCommunityModule]}>
                    <div className="ag-theme-alpine grid-fill-wrap">
                      <AgGridReact<FileCheckResultRow>
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
            </>
          )}
        </div>
      </div>

      <div className="page-subview-footer" style={{ justifyContent: "flex-end" }}>
        <Button variant="outlined" color="neutral" onClick={onClose} label="목록으로" />
      </div>
    </div>
  );
}
