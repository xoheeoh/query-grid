import { useMemo, useRef, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule, type ColDef } from "ag-grid-community";
import { Alert, Banner, Button, Icon, IconButton, TextInput, useToast } from "@xoheeoh/components";
import { mdiAccountOutline, mdiArrowLeft, mdiArrowRightBold, mdiListBoxOutline } from "@mdi/js";
import { useSubviewLock } from "@menus/SubviewLockContext";
import { useSubviewEscape } from "@menus/useSubviewEscape";
import { FormField } from "@menus/FormField";
import { COL, formatAmount, onlyDigits, refreshRowNumbers } from "@utils";
import styles from "./TransferRequestPanel.module.css";

type TransferRequestPanelProps = {
  onClose: () => void;
};

type GiftCardRow = {
  id: number;
  seller: string;
  giftCardNm: string;
  giftCardNo: string;
  parValue: number;
  balance: number;
  /** 양도할 수 없는 이유. 비어 있으면 양도 가능 */
  note: string;
};

/** 양도자가 가진 상품권. API 연동 전 샘플 데이터 */
const MOCK_ROWS: GiftCardRow[] = [
  { id: 1, seller: "가나다은행", giftCardNm: "온누리상품권", giftCardNo: "1234-5678-9012-3456", parValue: 100_000, balance: 50_000, note: "" },
  { id: 2, seller: "가나다은행", giftCardNm: "온누리상품권", giftCardNo: "1234-5678-9012-3457", parValue: 50_000, balance: 1_200, note: "유효기간 만료" },
  { id: 3, seller: "라마바은행", giftCardNm: "경기사랑상품권", giftCardNo: "2234-5678-9012-0001", parValue: 200_000, balance: 200_000, note: "" },
  { id: 4, seller: "사아자페이", giftCardNm: "서울사랑상품권", giftCardNo: "3234-5678-9012-0002", parValue: 30_000, balance: 12_500, note: "" },
];

/** 회원 ID로 찾은 고객. 데모라 ID 끝자리로 이름을 정한다. */
function findMember(memberId: string) {
  const names = ["김민준", "이서연", "박지호", "최수아", "정하윤", "조은우", "윤서진", "장시우", "임지아", "한예준"];
  const index = Number(memberId.slice(-1));
  return { name: names[index] ?? "홍길동", phone: `010-${memberId.slice(-4).padStart(4, "0")}-${String(1000 + index * 111)}` };
}

type LookupResult = {
  transferable: boolean;
  reason: string;
  from: ReturnType<typeof findMember>;
  to: ReturnType<typeof findMember>;
};

type FormErrors = { fromMemberId?: string; toMemberId?: string };

/** 상품권 양도 관리 위에 올라가는 양도 요청 서브뷰(풀모달) */
export default function TransferRequestPanel({ onClose }: TransferRequestPanelProps) {
  useSubviewLock();
  const toast = useToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<AgGridReact<GiftCardRow>>(null);
  const [fromMemberId, setFromMemberId] = useState("");
  const [toMemberId, setToMemberId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [rowData, setRowData] = useState<GiftCardRow[]>([]);
  /** 표에서 체크한 상품권. 확인창을 띄울 때 읽어 둔다. */
  const [selectedRows, setSelectedRows] = useState<GiftCardRow[] | null>(null);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  const isDirty = fromMemberId !== "" || toMemberId !== "" || lookup !== null;

  /** 작성 중인 내용이 있으면 먼저 물어보고, 없으면 바로 닫는다. */
  const requestClose = () => {
    if (isDirty) setIsLeaveOpen(true);
    else onClose();
  };
  useSubviewEscape(panelRef, requestClose);

  /** 두 ID를 검사하고 양도 가능 여부를 조회한다. 데모라 같은 ID면 불가, 다르면 가능으로 본다. */
  const handleLookup = () => {
    const found: FormErrors = {};
    if (!fromMemberId) found.fromMemberId = "양도하는 고객의 회원 ID를 입력해 주세요.";
    if (!toMemberId) found.toMemberId = "양도받는 고객의 회원 ID를 입력해 주세요.";
    setErrors(found);
    if (found.fromMemberId || found.toMemberId) {
      toast.error("회원 ID를 입력해 주세요.");
      return;
    }
    const same = fromMemberId === toMemberId;
    setLookup({
      transferable: !same,
      reason: same ? "양도하는 고객과 양도받는 고객이 같습니다." : "",
      from: findMember(fromMemberId),
      to: findMember(toMemberId),
    });
    setRowData(same ? [] : MOCK_ROWS);
  };

  const updateId = (setter: (value: string) => void, key: keyof FormErrors) => (value: string) => {
    setter(onlyDigits(value));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    // ID가 바뀌면 이전 조회 결과는 더 이상 맞지 않는다.
    setLookup(null);
    setRowData([]);
  };

  /** 체크한 상품권이 있어야 확인창을 띄운다. */
  const handleRequestClick = () => {
    const selected = gridRef.current?.api.getSelectedRows() ?? [];
    if (selected.length === 0) {
      toast.warning("양도할 상품권을 표에서 선택해 주세요.");
      return;
    }
    setSelectedRows(selected);
  };

  // 데모라 서버 요청 없이 바로 완료 처리한다.
  const handleRequestConfirm = () => {
    setSelectedRows(null);
    toast.success("상품권 양도 요청이 등록되었습니다.");
    onClose();
  };

  const columnDefs = useMemo<ColDef<GiftCardRow>[]>(
    () => [
      COL.text<GiftCardRow>("판매처", "seller", { width: 120 }),
      COL.text<GiftCardRow>("상품권명", "giftCardNm", { width: 160 }),
      COL.fixed<GiftCardRow>("상품권번호", "giftCardNo", { width: 200 }),
      COL.amount<GiftCardRow>("액면가", "parValue", { width: 130 }),
      COL.amount<GiftCardRow>("잔액", "balance", { width: 130 }),
      COL.text<GiftCardRow>("비고", "note", { minWidth: 160, flex: 1 }),
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

  return (
    <div
      ref={panelRef}
      className="page-subview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-request-title"
      style={{ zIndex: 10 }}>
      <div className="page-subview-main">
        <div className="page-subview-header flex-between">
          <div className="row-start gap-12">
            <IconButton
              variant="outlined"
              color="neutral"
              onClick={requestClose}
              aria-label="상품권 양도 요청 닫기"
              icon={<Icon path={mdiArrowLeft} />}
            />
            <div className="page-title">
              <h3 id="transfer-request-title" className="text-heading3">
                상품권 양도 요청
              </h3>
              <p className="text-body2 text-color-secondary">
                회원 간 상품권 잔액의 양도를 요청합니다. 두 고객의 회원 ID로 양도 가능 여부를 먼저 조회합니다.
              </p>
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
                <FormField label="양도하는 고객" required error={errors.fromMemberId}>
                  {(control) => (
                    <TextInput
                      {...control}
                      inputMode="numeric"
                      placeholder="양도하는 고객의 회원 ID를 입력해 주세요. (숫자만 입력)"
                      value={fromMemberId}
                      status={errors.fromMemberId ? "negative" : "default"}
                      onChange={(e) => updateId(setFromMemberId, "fromMemberId")(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    />
                  )}
                </FormField>

                <FormField label="양도받는 고객" required error={errors.toMemberId}>
                  {(control) => (
                    <TextInput
                      {...control}
                      inputMode="numeric"
                      placeholder="양도받는 고객의 회원 ID를 입력해 주세요. (숫자만 입력)"
                      value={toMemberId}
                      status={errors.toMemberId ? "negative" : "default"}
                      onChange={(e) => updateId(setToMemberId, "toMemberId")(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    />
                  )}
                </FormField>

                <Button color="neutral" style={{ alignSelf: "flex-end" }} onClick={handleLookup} label="양도 가능여부 조회" />
              </div>

              {/* 조회 결과 */}
              {lookup && (
                <>
                  <div className={styles.resultSection}>
                    <div className="row-center gap-8">
                      <span className="text-subtitle2">조회 결과</span>
                      <span
                        className={`${styles.resultBadge} ${lookup.transferable ? styles.resultBadgeSuccess : styles.resultBadgeError}`}>
                        {lookup.transferable ? "양도 가능" : "양도 불가"}
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
                              <span className="text-subtitle2">{lookup.from.name}</span>
                              <span className="text-caption1 text-color-secondary">{lookup.from.phone}</span>
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
                              <span className="text-subtitle2">{lookup.to.name}</span>
                              <span className="text-caption1 text-color-secondary">{lookup.to.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Banner
                        type={lookup.transferable ? "success" : "error"}
                        message={lookup.transferable ? "선택하신 회원 간의 양도가 가능합니다." : "선택하신 회원 간의 양도가 불가합니다."}
                        detailMessage={
                          <p className={styles.resultReason}>
                            {lookup.transferable
                              ? "잔액만 양도되며 거래 내역이나 적립금은 넘어가지 않습니다. 아래 표에서 양도할 상품권을 선택한 뒤 양도 요청을 눌러 주세요.\n유효기간이 지난 상품권은 양도할 수 없습니다."
                              : `사유: ${lookup.reason}`}
                          </p>
                        }
                      />
                    </div>
                  </div>

                  {lookup.transferable && (
                    <AgGridProvider modules={[AllCommunityModule]}>
                      <div className="ag-theme-alpine grid-fill-wrap">
                        <AgGridReact<GiftCardRow>
                          ref={gridRef}
                          theme="legacy"
                          onModelUpdated={refreshRowNumbers}
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
                            noRowsToShow: "양도할 수 있는 상품권이 없습니다.",
                            pageSizeSelectorLabel: "",
                          }}
                          getRowId={(p) => String(p.data.id)}
                        />
                      </div>
                    </AgGridProvider>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-subview-footer" style={{ justifyContent: "flex-end" }}>
        <div className="row-center gap-8">
          <Button variant="outlined" color="neutral" onClick={requestClose} label="취소" />
          <Button disabled={!lookup?.transferable} onClick={handleRequestClick} label="양도 요청" />
        </div>
      </div>

      <Alert
        open={selectedRows !== null}
        onClose={() => setSelectedRows(null)}
        title="상품권 양도 요청"
        message={
          selectedRows
            ? `상품권 ${selectedRows.length}장, 잔액 합계 ${formatAmount(
                selectedRows.reduce((sum, row) => sum + row.balance, 0),
              )}원을 양도 요청합니다.\n양도한 잔액은 되돌릴 수 없습니다. 계속하시겠습니까?`
            : ""
        }
        secondaryAction={{ label: "취소" }}
        primaryAction={{ label: "요청", onClick: handleRequestConfirm }}
      />

      <Alert
        open={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        title="요청 취소"
        message={"입력한 내용과 조회 결과가 사라집니다.\n양도 요청을 등록하지 않고 나가시겠습니까?"}
        secondaryAction={{ label: "계속 작성" }}
        destructiveAction={{ label: "나가기", onClick: onClose }}
      />
    </div>
  );
}
