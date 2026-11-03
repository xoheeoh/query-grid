import { useEffect, useMemo, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef } from "ag-grid-community";
import { Banner, Button, Icon, IconButton, TextInput } from "@xoheeoh/components";
import { mdiAccountOutline, mdiArrowLeft, mdiArrowRightBold, mdiListBoxOutline } from "@mdi/js";
import { useSubviewLock } from "@menus/SubviewLockContext";
import { COL } from "@utils";
import styles from "./TransferRequestPanel.module.css";

type TransferRequestPanelProps = {
  onClose: () => void;
};

type giftCardInfoRow = {
  id: number;
  seller: string;
  giftCardNm: string;
  giftCardNo: string;
  parValue: number;
  balance: number;
  note: string;
};

/** API 연동 전 샘플 데이터 */
const MOCK_ROWS: giftCardInfoRow[] = [
  {
    id: 1,
    seller: "가나다페이",
    giftCardNm: "온누리상품권",
    giftCardNo: "1234-5678-9012-3456-7890",
    parValue: 100000,
    balance: 50000,
    note: "",
  },
  {
    id: 2,
    seller: "가나다페이",
    giftCardNm: "온누리상품권",
    giftCardNo: "1234-5678-9012-3456-7890",
    parValue: 50000,
    balance: 1200,
    note: "유효기간 만료",
  },
  {
    id: 3,
    seller: "쿠콘",
    giftCardNm: "창원누비전",
    giftCardNo: "1234-5678-9012-3456-7890",
    parValue: 200000,
    balance: 200000,
    note: "낙전처리",
  },
];

export default function TransferRequestPanel({ onClose }: TransferRequestPanelProps) {
  useSubviewLock();
  const [fromMemberId, setFromMemberId] = useState("");
  const [toMemberId, setToMemberId] = useState("");
  const isButtonEnabled = fromMemberId.length > 0 && toMemberId.length > 0;

  const [showTransferResult, setShowTransferResult] = useState(false);
  const [rowData, setRowData] = useState<giftCardInfoRow[]>([]);
  const isTransferable = true; // 결과 화면 테스트를 위한 임시값

  const columnDefs = useMemo<ColDef<giftCardInfoRow>[]>(
    () => [
      COL.text<giftCardInfoRow>("판매처", "seller", { width: 120 }),
      COL.text<giftCardInfoRow>("상품권명", "giftCardNm", { width: 160 }),
      COL.fixed<giftCardInfoRow>("상품권번호", "giftCardNo", { width: 240 }),
      COL.amount<giftCardInfoRow>("액면가", "parValue", { width: 150 }),
      COL.amount<giftCardInfoRow>("잔액", "balance", { width: 150 }),
      COL.text<giftCardInfoRow>("비고", "note", { minWidth: 200, flex: 1 }),
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  useEffect(() => {
    if (isTransferable) {
      setRowData(MOCK_ROWS);
    } else {
      setRowData([]);
    }
  }, [isTransferable]);

  return (
    <div
      className="page-subview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-request-title"
      // Sidebar hover/flyout과 레이어가 겹칠 때, 모달이 sidebar 위로 올라가 pointer 이벤트를 가로채는 문제를 방지
      style={{ zIndex: 10 }}>
      <div className="page-subview-main">
        <div className="page-subview-header flex-between">
          <div className="row-start gap-12">
            <IconButton variant="outlined" color="neutral" onClick={onClose} aria-label="상품권 양도 요청 닫기" icon={<Icon path={mdiArrowLeft} />} />
            <div className="page-title">
              <h3 id="transfer-request-title" className="text-heading3">
                상품권 양도 요청
              </h3>
              <p className="text-body2 text-color-secondary">회원 간 상품권 잔액에 대한 양도 요청을 진행합니다.</p>
            </div>
          </div>
        </div>

        <div className="page-subview-body flex-col gap-16">
          <div className={styles.body} style={{ marginBottom: 16 }}>
            <div className={`row-center gap-8 ${styles.title}`}>
              <Icon path={mdiListBoxOutline} size={22} />
              <span className="text-subtitle2">기본 정보</span>
            </div>

            <div className={styles.content}>
              <div className="flex-col gap-16">
                <div className="row-center gap-8">
                  <span className={`text-body2 ${styles.tableLabel}`}>양도하는 고객</span>
                  <TextInput
                    placeholder="양도하는 고객의 유저 ID를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    value={fromMemberId}
                    onChange={(e) => setFromMemberId(e.target.value)}
                  />
                </div>

                <div className="row-center gap-8">
                  <span className={`text-body2 ${styles.tableLabel}`}>양도받는 고객</span>
                  <TextInput
                    placeholder="양도받는 고객의 유저 ID를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    value={toMemberId}
                    onChange={(e) => setToMemberId(e.target.value)}
                  />
                </div>

                <Button
 color="neutral"
 style={{ alignSelf: "flex-end" }}
 disabled={!isButtonEnabled}
 onClick={() => setShowTransferResult(true)} label="양도 가능여부 조회" />
              </div>

              {/* 조회 결과 */}
              {showTransferResult && (
                <>
                  <div className={styles.resultSection}>
                    <div className="row-center gap-8">
                      <span className="text-subtitle2">조회 결과</span>
                      <span
                        className={`${styles.resultBadge} ${
                          isTransferable ? styles.resultBadgeSuccess : styles.resultBadgeError
                        }`}>
                        {isTransferable ? "양도 가능" : "양도 불가"}
                      </span>
                    </div>

                    <div className="flex-col gap-16">
                      <div className="row-center gap-12" style={{ margin: "0 auto" }}>
                        <div className={`${styles.memberCard} ${styles.memberCardFrom}`}>
                          <span className={styles.memberRole}>양도자</span>
                          <div className={styles.memberInfo}>
                            <div className={styles.memberAvatar}>
                              <Icon path={mdiAccountOutline} size={20} />
                            </div>
                            <div className={styles.memberDetail}>
                              <span className="text-subtitle2">홍길동</span>
                              <span className="text-caption1 text-color-secondary">010-1234-1234</span>
                            </div>
                          </div>
                        </div>

                        <Icon path={mdiArrowRightBold} size={28} color="var(--color-primary-500)" />

                        <div className={`${styles.memberCard} ${styles.memberCardTo}`}>
                          <span className={styles.memberRole}>양수자</span>
                          <div className={styles.memberInfo}>
                            <div className={styles.memberAvatar}>
                              <Icon path={mdiAccountOutline} size={20} />
                            </div>
                            <div className={styles.memberDetail}>
                              <span className="text-subtitle2">고길동</span>
                              <span className="text-caption1 text-color-secondary">010-2345-2345</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Banner
                          type={isTransferable ? "success" : "error"}
                          message={
                            isTransferable
                              ? "선택하신 회원 간의 양도가 가능합니다."
                              : "선택하신 회원 간의 양도가 불가합니다."
                          }
                          detailMessage={
                            <p className={styles.resultReason}>
                              {isTransferable
                                ? `잔액만 양도가 가능하며, 이전 거래내역 또는 적립금 등은 이관되지 않습니다. 아래에서 양도할 상품권을 선택 후 양도 요청 바랍니다.\n유효기간이 만료된 상품권은 양도가 불가합니다. (강제 환불 또는 고객 직접 환불요청 필요)`
                                : "사유: 양도자/양수자 정보를 찾을 수 없습니다."}
                            </p>
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <AgGridProvider modules={[AllCommunityModule]}>
                    <div className="ag-theme-alpine grid-fill-wrap">
                      <AgGridReact<giftCardInfoRow>
                        theme="legacy"
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowSelection={{
                          mode: "multiRow",
                          checkboxes: true,
                          headerCheckbox: true,
                          hideDisabledCheckboxes: true,
                          enableClickSelection: true,
                          isRowSelectable: (node) => !node.data?.note,
                        }}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-subview-footer" style={{ justifyContent: "flex-end" }}>
        <div className="row-center gap-8">
          <Button variant="outlined" color="neutral" onClick={onClose} label="취소" />
          <Button onClick={() => {}} label="양도 요청" />
        </div>
      </div>
    </div>
  );
}
