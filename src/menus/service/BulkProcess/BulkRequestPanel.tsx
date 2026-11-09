import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, type ColDef } from "ag-grid-community";
import { Alert, Banner, Button, Icon, IconButton, TextInput, Select, useToast } from "@xoheeoh/components";
import { mdiArrowLeft, mdiFileArrowUpDownOutline, mdiFileCheckOutline } from "@mdi/js";
import { useSubviewLock } from "@menus/SubviewLockContext";
import { COL, downloadExcelTemplate, exportGridToExcel, refreshRowNumbers } from "@utils";
import { EXTEND_HEADERS, REFUND_HEADERS, readUploadFile, type UploadKind, type UploadRow } from "./readUploadFile";
import styles from "./BulkRequestPanel.module.css";

/** 등록을 마친 요청의 요약. 목록에 한 줄로 붙는다. */
export type SubmittedBulkRequest = {
  kind: UploadKind;
  /** 가능으로 확인된 건수 */
  count: number;
};

type BulkRequestPanelProps = {
  onClose: () => void;
  /** 요청 등록이 끝나면 호출된다. 목록이 이 값으로 줄을 추가한다. */
  onSubmitted?: (request: SubmittedBulkRequest) => void;
};

const TEMPLATE_DOWNLOAD_OPTIONS = [
  { value: "1", label: "환불 양식", headers: REFUND_HEADERS },
  { value: "2", label: "만료일 연장 양식", headers: EXTEND_HEADERS },
  { value: "3", label: "대량구매 환불 양식", headers: REFUND_HEADERS },
] as const;

/** 파일 체크 결과 표의 한 줄. 파일에서 읽은 값 + 확인 단계에서 채워지는 값 */
type FileCheckResultRow = UploadRow & {
  id: number;
  verified: string;
  notified: string;
  /** 줄의 문제(업로드 때) 또는 확인 결과(확인 뒤) */
  errorMsg: string;
};

type UploadError = { message: string; detail?: string };

async function downloadTemplate(option: (typeof TEMPLATE_DOWNLOAD_OPTIONS)[number]) {
  await downloadExcelTemplate([...option.headers], option.label);
}

export default function BulkRequestPanel({ onClose, onSubmitted }: BulkRequestPanelProps) {
  useSubviewLock();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [templateSelectValue, setTemplateSelectValue] = useState("");
  const [uploadKind, setUploadKind] = useState<UploadKind>("refund");
  const [rowData, setRowData] = useState<FileCheckResultRow[]>([]);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  /** 환불 가능여부 확인을 마쳤으면 true. 그래야 요청을 등록할 수 있다. */
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckAlertOpen, setIsCheckAlertOpen] = useState(false);
  const [isSubmitAlertOpen, setIsSubmitAlertOpen] = useState(false);
  const toast = useToast();

  const rowErrorCount = rowData.filter((row) => row.rowError).length;
  /** 확인 단계에서 "가능"으로 끝난 줄 수 */
  const okCount = rowData.filter((row) => row.errorMsg.endsWith("가능")).length;
  /** 파일을 읽었고, 양식도 맞고, 줄마다 문제가 없어야 다음 단계로 간다. */
  const fileCheckSuccess = isFileUploaded && !uploadError && rowErrorCount === 0;
  const checkLabel = uploadKind === "extend" ? "연장 가능여부 확인" : "환불 가능여부 확인";

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 고쳐서 다시 골라도 change가 일어나게 비운다.
    event.target.value = "";
    if (!file) return;

    setFileName(file.name);
    setIsChecked(false);
    const result = await readUploadFile(file);
    if (!result.ok) {
      setUploadError({ message: result.message, detail: result.detail });
      setRowData([]);
      setIsFileUploaded(true);
      return;
    }
    setUploadError(null);
    setUploadKind(result.kind);
    setRowData(result.rows.map((row, index) => ({ ...row, id: index + 1, verified: "", notified: "", errorMsg: row.rowError })));
    setIsFileUploaded(true);
  };

  /** 줄마다 가능 여부를 채운다. 서버가 돌려줄 값이라 데모용 규칙으로 만든다. */
  const handleCheckConfirm = () => {
    setIsCheckAlertOpen(false);
    setRowData((rows) =>
      rows.map((row, index) => {
        if (uploadKind === "extend") {
          return { ...row, verified: "-", notified: "Y", errorMsg: "연장 가능" };
        }
        const verified = row.bankNo.length >= 12 ? "Y" : "N";
        return {
          ...row,
          verified,
          notified: index % 3 === 1 ? "N" : "Y",
          errorMsg: verified === "Y" ? "환불 가능" : "환불 불가 (수취인 정보 불일치)",
        };
      }),
    );
    setIsChecked(true);
    toast.success(`${checkLabel}이 완료되었습니다. 결과를 확인한 뒤 요청을 등록해 주세요.`);
  };

  // 데모라 서버 저장은 없고, 목록에 "확인중" 줄을 하나 더해 등록된 것처럼 보여준다.
  const handleSubmitConfirm = () => {
    setIsSubmitAlertOpen(false);
    onSubmitted?.({ kind: uploadKind, count: okCount });
    toast.success("일괄 수기처리 요청이 등록되었습니다. 목록에서 확인할 수 있습니다.");
    onClose();
  };

  const handleTemplateDownload = async (selectedValue: string) => {
    if (!selectedValue) return;

    const selected = TEMPLATE_DOWNLOAD_OPTIONS.find((option) => option.value === selectedValue);
    if (!selected) return;

    await downloadTemplate(selected);
    setTemplateSelectValue("");
  };

  // 양식에 따라 가운데 열이 다르다. 환불은 은행·계좌, 연장은 연장 만료일.
  const columnDefs = useMemo<ColDef<FileCheckResultRow>[]>(
    () => [
      COL.no<FileCheckResultRow>(),
      COL.text<FileCheckResultRow>("상품권번호", "giftCardNo", { width: 190 }),
      COL.text<FileCheckResultRow>("상품권ID", "giftCardId", { width: 140 }),
      COL.text<FileCheckResultRow>("고객명", "usrNm", { width: 110 }),
      ...(uploadKind === "refund"
        ? [
            COL.fixed<FileCheckResultRow>("은행코드", "bankCd", { width: 90 }),
            COL.text<FileCheckResultRow>("계좌번호", "bankNo", { width: 150 }),
            COL.fixed<FileCheckResultRow>("수취인확인", "verified", { width: 100 }),
          ]
        : [COL.fixed<FileCheckResultRow>("연장 만료일", "extendDate", { width: 130 })]),
      COL.fixed<FileCheckResultRow>("알림여부", "notified", { width: 90 }),
      COL.text<FileCheckResultRow>("확인", "errorMsg", {
        minWidth: 200,
        flex: 1,
        // 업로드 단계의 줄 문제는 빨갛게 보여준다.
        cellClass: (p) => (p.data?.rowError ? "text-color-danger" : ""),
      }),
    ],
    [uploadKind],
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
            <IconButton
              variant="outlined"
              color="neutral"
              onClick={onClose}
              aria-label="대량 처리 요청 닫기"
              icon={<Icon path={mdiArrowLeft} />}
            />
            <div className="page-title">
              <h3 id="bulk-request-title" className="text-heading3">
                일괄 수기처리 요청
              </h3>
              <p className="text-body2 text-color-secondary">
                양식을 내려받아 작성한 엑셀 파일을 올리면 내용을 읽어 확인합니다.
              </p>
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
                    {/* 실제 파일 선택 칸은 숨기고, 고른 파일 이름만 읽기 전용 칸에 보여준다. */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx"
                      hidden
                      aria-label="엑셀 파일 선택"
                      onChange={handleFileChange}
                    />
                    <TextInput
                      readOnly
                      aria-label="선택한 파일"
                      placeholder="양식에 맞춰 작성한 .xlsx 파일을 선택해 주세요."
                      className="table-item-value"
                      value={fileName}
                    />
                    <Button type="button" color="neutral" onClick={() => fileInputRef.current?.click()} label="파일 선택" />
                  </div>
                </div>

                <div className="row-center gap-8">
                  <Select
                    style={{ minWidth: 180 }}
                    aria-label="양식 다운로드"
                    value={templateSelectValue}
                    onValueChange={handleTemplateDownload}
                    options={TEMPLATE_DOWNLOAD_OPTIONS.map(({ value, label }) => ({ value, label }))}
                    placeholder="양식 다운로드"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 파일을 고른 뒤에만 보임 */}
          {isFileUploaded && (
            <>
              <div className="row-center gap-8">
                {uploadError ? (
                  <Banner type="error" message={uploadError.message} detailMessage={uploadError.detail} style={{ flex: 1 }} />
                ) : rowErrorCount > 0 ? (
                  <Banner
                    type="warning"
                    message={`${rowData.length}건 중 ${rowErrorCount}건에 문제가 있습니다.`}
                    detailMessage="표의 '확인' 열을 보고 파일을 고친 뒤 다시 올려 주세요."
                    style={{ flex: 1 }}
                  />
                ) : (
                  <Banner
                    type="success"
                    message={`${rowData.length}건을 읽었습니다.`}
                    detailMessage={`'${checkLabel}' 버튼을 누르면 상품권별 가능 여부를 조회합니다.`}
                    style={{ flex: 1 }}
                  />
                )}
                <Button
                  size="sm"
                  color="neutral"
                  disabled={!fileCheckSuccess || isChecked}
                  onClick={() => setIsCheckAlertOpen(true)}
                  label={isChecked ? "확인 완료" : checkLabel}
                />
              </div>

              {!uploadError && (
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

                  {/* 표가 남은 높이를 채우도록 세로 flex 상자로 감싼다. */}
                  <div className={styles.content} style={{ flex: 1, minHeight: 0 }}>
                    <AgGridProvider modules={[AllCommunityModule]}>
                      <div className="ag-theme-alpine grid-fill-wrap">
                        <AgGridReact<FileCheckResultRow>
                          ref={gridRef}
                          theme="legacy"
                          onModelUpdated={refreshRowNumbers}
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
                            noRowsToShow: "읽은 데이터가 없습니다.",
                            pageSizeSelectorLabel: "",
                          }}
                          getRowId={(p) => String(p.data.id)}
                        />
                      </div>
                    </AgGridProvider>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="page-subview-footer" style={{ justifyContent: "flex-end" }}>
        <div className="row-center gap-8">
          <Button variant="outlined" color="neutral" onClick={onClose} label="목록으로" />
          <Button disabled={!isChecked} onClick={() => setIsSubmitAlertOpen(true)} label="요청 등록" />
        </div>
      </div>

      <Alert
        open={isCheckAlertOpen}
        onClose={() => setIsCheckAlertOpen(false)}
        title={checkLabel}
        message={`읽은 ${rowData.length}건의 상품권에 대해 가능 여부를 조회합니다.\n계속하시겠습니까?`}
        secondaryAction={{ label: "취소" }}
        primaryAction={{ label: "확인", onClick: handleCheckConfirm }}
      />

      <Alert
        open={isSubmitAlertOpen}
        onClose={() => setIsSubmitAlertOpen(false)}
        title="일괄 수기처리 요청"
        message={`가능으로 확인된 ${okCount}건을 요청으로 등록합니다.\n계속하시겠습니까?`}
        secondaryAction={{ label: "취소" }}
        primaryAction={{ label: "등록", onClick: handleSubmitConfirm }}
      />
    </div>
  );
}
