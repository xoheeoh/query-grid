import { useRef, useState } from "react";
import { Alert, Button, Checkbox, IconButton, Icon, TextInput, useToast } from "@xoheeoh/components";
import { mdiArrowLeft, mdiListBoxOutline, mdiTicketPercentOutline } from "@mdi/js";
import { useSubviewLock } from "../../SubviewLockContext";
import { useSubviewEscape } from "../../useSubviewEscape";
import { FormField } from "../../FormField";
import styles from "./VoucherGroupManagePanel.module.css";

export type VoucherGroupFormMode = "register" | "edit";

/** 수정 화면에 넘기는 기존 값 */
export type VoucherGroupFormValues = {
  groupName: string;
  selectedVoucherIds: string[];
};

type VoucherGroupFormPanelProps = {
  mode: VoucherGroupFormMode;
  initialValues?: Partial<VoucherGroupFormValues>;
  onClose: () => void;
};

/** 그룹에 넣을 수 있는 상품권 목록. 상품권 관리의 예시 데이터와 같은 이름을 쓴다. */
const VOUCHER_OPTIONS = [
  { id: "1", name: "온누리상품권", region: "중소벤처기업부" },
  { id: "2", name: "온누리상품권 (카드형)", region: "중소벤처기업부" },
  { id: "3", name: "전통시장 소비쿠폰", region: "중소벤처기업부" },
  { id: "4", name: "서울사랑상품권", region: "서울특별시" },
  { id: "5", name: "서울사랑상품권 (청년)", region: "서울특별시" },
  { id: "6", name: "서울문화바우처", region: "서울특별시" },
  { id: "7", name: "김포사랑상품권", region: "김포시" },
  { id: "8", name: "김포육아바우처", region: "김포시" },
  { id: "9", name: "경기사랑상품권", region: "경기도" },
  { id: "10", name: "경기청년희망바우처", region: "경기도" },
  { id: "11", name: "부산사랑상품권", region: "부산광역시" },
  { id: "12", name: "전남사랑상품권", region: "전라남도" },
] as const;

const EMPTY_VALUES: VoucherGroupFormValues = { groupName: "", selectedVoucherIds: [] };

const TEXT: Record<VoucherGroupFormMode, { title: string; subtitle: string; submit: string; confirm: string; done: string }> = {
  register: {
    title: "상품권 그룹 등록",
    subtitle: "신규 상품권 그룹을 등록합니다. * 표시는 필수 항목입니다.",
    submit: "등록",
    confirm: "상품권 그룹을 등록하시겠습니까?",
    done: "상품권 그룹 등록이 완료되었습니다.",
  },
  edit: {
    title: "상품권 그룹 수정",
    subtitle: "상품권 그룹의 이름과 포함 상품권을 수정합니다. * 표시는 필수 항목입니다.",
    submit: "수정",
    confirm: "상품권 그룹을 수정하시겠습니까?",
    done: "상품권 그룹 수정이 완료되었습니다.",
  },
};

type FormErrors = { groupName?: string; vouchers?: string };

/** 상품권 그룹 관리 위에 올라가는 등록·수정 서브뷰(풀모달). 같은 폼을 쓰고 mode로만 구분한다. */
export default function VoucherGroupFormPanel({ mode, initialValues, onClose }: VoucherGroupFormPanelProps) {
  useSubviewLock();
  const toast = useToast();
  const text = TEXT[mode];
  const panelRef = useRef<HTMLDivElement>(null);
  // "처음 상태"는 처음 열릴 때 한 번만 정한다. 초기화와 변경 여부 판단의 기준이다.
  const [initial] = useState<VoucherGroupFormValues>(() => ({ ...EMPTY_VALUES, ...initialValues }));
  const [groupName, setGroupName] = useState(initial.groupName);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>(initial.selectedVoucherIds);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const isDirty =
    groupName !== initial.groupName ||
    JSON.stringify([...selectedVoucherIds].sort()) !== JSON.stringify([...initial.selectedVoucherIds].sort());

  /** 작성 중인 내용이 있으면 먼저 물어보고, 없으면 바로 닫는다. */
  const requestClose = () => {
    if (isDirty) setIsLeaveOpen(true);
    else onClose();
  };
  useSubviewEscape(panelRef, requestClose);

  const handleVoucherToggle = (voucherId: string, checked: boolean) => {
    setSelectedVoucherIds((prev) => (checked ? [...prev, voucherId] : prev.filter((id) => id !== voucherId)));
    setErrors((prev) => ({ ...prev, vouchers: undefined }));
  };

  const handleResetClick = () => {
    if (!isDirty) {
      toast.info("초기화할 내용이 없습니다.");
      return;
    }
    setIsResetOpen(true);
  };

  const handleResetConfirm = () => {
    setIsResetOpen(false);
    setGroupName(initial.groupName);
    setSelectedVoucherIds(initial.selectedVoucherIds);
    setErrors({});
  };

  /** 필수값부터 검사하고, 통과하면 확인창을 띄운다. */
  const handleSubmitClick = () => {
    const found: FormErrors = {};
    if (!groupName.trim()) found.groupName = "상품권 그룹명을 입력해 주세요.";
    if (selectedVoucherIds.length === 0) found.vouchers = "그룹에 넣을 상품권을 하나 이상 선택해 주세요.";
    setErrors(found);
    if (found.groupName || found.vouchers) {
      toast.error("필수 항목을 확인해 주세요.");
      return;
    }
    setIsConfirmOpen(true);
  };

  // 데모라 서버 저장 없이 바로 완료 처리한다.
  const handleSubmit = () => {
    setIsConfirmOpen(false);
    toast.success(text.done);
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="page-subview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voucher-group-form-title"
      style={{ zIndex: 10 }}>
      <div className="page-subview-main">
        <div className="page-subview-header flex-between">
          <div className="row-start gap-12">
            <IconButton
              variant="outlined"
              color="neutral"
              onClick={requestClose}
              aria-label="상품권 그룹 관리로 돌아가기"
              icon={<Icon path={mdiArrowLeft} />}
            />
            <div className="page-title">
              <h3 id="voucher-group-form-title" className="text-heading3">
                {text.title}
              </h3>
              <p className="text-body2 text-color-secondary">{text.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="page-subview-body flex-col gap-16">
          <div className={styles.body}>
            <div className={`row-center gap-8 ${styles.title}`}>
              <Icon path={mdiListBoxOutline} size={22} />
              <span className="text-subtitle2">기본 정보</span>
            </div>

            <div className={styles.content}>
              <FormField label="상품권 그룹명" required error={errors.groupName}>
                {(control) => (
                  <TextInput
                    {...control}
                    placeholder="상품권 그룹명을 입력해 주세요. (최대 30자)"
                    maxLength={30}
                    value={groupName}
                    status={errors.groupName ? "negative" : "default"}
                    onChange={(event) => {
                      setGroupName(event.target.value);
                      setErrors((prev) => ({ ...prev, groupName: undefined }));
                    }}
                  />
                )}
              </FormField>
            </div>
          </div>

          <section className={styles.body} aria-labelledby="voucher-group-form-vouchers">
            <div className={`row-center gap-8 ${styles.title}`}>
              <Icon path={mdiTicketPercentOutline} size={22} />
              <span id="voucher-group-form-vouchers" className="text-subtitle2">
                상품권 선택
              </span>
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            </div>

            <div className={styles.content}>
              <div className="row-center gap-8">
                <span className="result-count">
                  <strong>{selectedVoucherIds.length}</strong>개
                </span>
                <span className="text-caption1">상품권이 선택되었습니다.</span>
                {errors.vouchers && (
                  <span className="text-caption1 text-color-danger" role="alert">
                    {errors.vouchers}
                  </span>
                )}
              </div>

              <div className={styles.voucherList} role="group" aria-labelledby="voucher-group-form-vouchers">
                {VOUCHER_OPTIONS.map((voucher) => {
                  const isSelected = selectedVoucherIds.includes(voucher.id);
                  return (
                    <div
                      key={voucher.id}
                      className={`${styles.voucherItem} ${isSelected ? styles.voucherItemSelected : ""} ${
                        errors.vouchers ? styles.voucherItemError : ""
                      }`}>
                      <Checkbox
                        className={styles.voucherCheckbox}
                        checked={isSelected}
                        onChange={(event) => handleVoucherToggle(voucher.id, event.target.checked)}
                        label={
                          <span className="flex-col gap-4">
                            <span className="text-subtitle3">{voucher.name}</span>
                            <span className="text-caption1 text-color-secondary">{voucher.region}</span>
                          </span>
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="page-subview-footer">
        <Button variant="outlined" color="neutral" onClick={handleResetClick} label="초기화" />
        <div className="row-center gap-8">
          <Button variant="outlined" color="neutral" onClick={requestClose} label="취소" />
          <Button onClick={handleSubmitClick} label={text.submit} />
        </div>
      </div>

      <Alert
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={text.title}
        message={text.confirm}
        secondaryAction={{ label: "취소" }}
        primaryAction={{ label: text.submit, onClick: handleSubmit }}
      />

      <Alert
        open={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        title="작성 취소"
        message={"작성 중인 내용이 모두 사라집니다.\n저장하지 않고 나가시겠습니까?"}
        secondaryAction={{ label: "계속 작성" }}
        destructiveAction={{ label: "나가기", onClick: onClose }}
      />

      <Alert
        open={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="초기화"
        message={"입력한 내용을 처음 상태로 되돌립니다.\n계속하시겠습니까?"}
        secondaryAction={{ label: "취소" }}
        destructiveAction={{ label: "초기화", onClick: handleResetConfirm }}
      />
    </div>
  );
}
