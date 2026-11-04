import { useState } from "react";
import {
  Alert,
  Button,
  IconButton,
  Icon,
  TextInput,
  useToast,
} from "@xoheeoh/components";
import { mdiArrowLeft, mdiListBoxOutline, mdiTicketPercentOutline } from "@mdi/js";
import { useSubviewLock } from "../../../SubviewLockContext";
import styles from "../VoucherGroupManagePanel.module.css";

export type VoucherGroupEditInitialData = {
  id: number;
  publisher: string;
  voucherGroupName: string;
  voucherDetail: string;
  registrant: string;
};

type VoucherGroupEditPanelProps = {
  onClose: () => void;
  initialData: VoucherGroupEditInitialData;
};

const VOUCHER_OPTIONS = [
  { id: "1", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "2", name: "서울국민지원금", region: "서울특별시 강남구" },
  { id: "3", name: "오케이국민지원금", region: "서울특별시 강남구" },
  { id: "4", name: "서울국민지원금", region: "서울특별시 강남구" },
  { id: "5", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "6", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "7", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "8", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "9", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "10", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "11", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "12", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "13", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "14", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "15", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "16", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "17", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "18", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "19", name: "온누리 상품권", region: "서울특별시 강남구" },
  { id: "20", name: "온누리 상품권", region: "서울특별시 강남구" },
] as const;

/** API 연동 전 수정 화면용 임시 선택 상품권 ID */
const DUMMY_SELECTED_VOUCHER_IDS = ["1", "2", "3"];

/** 상품권 그룹 관리 Contents 위에 올라가는 수정 서브뷰(풀모달) */
export default function VoucherGroupEditPanel({ onClose, initialData }: VoucherGroupEditPanelProps) {
  useSubviewLock();
  const toast = useToast();
  // 값이 있으면 실패 알림을 띄운다. 닫으면 null로 돌아간다.
  const [failAlert, setFailAlert] = useState<{ title: string; message: string } | null>(null);
  const [groupName, setGroupName] = useState(initialData.voucherGroupName);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>(DUMMY_SELECTED_VOUCHER_IDS);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const isEditSuccess = true; // 수정 결과 모달 노출을 위한 임시 상태값

  const handleVoucherToggle = (voucherId: string, checked: boolean) => {
    setSelectedVoucherIds((prev) => (checked ? [...prev, voucherId] : prev.filter((id) => id !== voucherId)));
  };

  const handleReset = () => {
    setGroupName(initialData.voucherGroupName);
    setSelectedVoucherIds(DUMMY_SELECTED_VOUCHER_IDS);
  };

  const handleEdit = () => {
    setIsConfirmModalOpen(false);

    // TODO: 성공/실패 로직 분리해서 보여줘야함
    if (isEditSuccess) {
      toast.success("상품권 그룹 수정이 완료되었습니다.");
      onClose();
    } else {
      setFailAlert({ title: "수정 실패", message: "실패 사유" });
    }
  };

  return (
    <div
      className="page-subview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voucher-group-edit-title"
      // Sidebar hover/flyout과 레이어가 겹칠 때, 모달이 sidebar 위로 올라가 pointer 이벤트를 가로채는 문제를 방지
      style={{ zIndex: 10 }}>
      <div className="page-subview-main">
        <div className="page-subview-header flex-between">
          <div className="row-start gap-12">
            <IconButton variant="outlined" color="neutral" onClick={onClose} aria-label="상품권 그룹 관리로 돌아가기" icon={<Icon path={mdiArrowLeft} />} />
            <div className="page-title">
              <h3 id="voucher-group-edit-title" className="text-heading3">
                상품권 그룹 수정
              </h3>
              <p className="text-body2 text-color-secondary">
                상품권 그룹명: {initialData.voucherGroupName} ㆍ 상품권명: {initialData.voucherDetail}
              </p>
            </div>
          </div>
        </div>

        <div className="page-subview-tabs">
          <div className="page-subview-body flex-col gap-16">
            <div className={styles.body}>
              <div className={`row-center gap-8 ${styles.title}`}>
                <Icon path={mdiListBoxOutline} size={22} />
                <span className="text-subtitle2">기본 정보</span>
              </div>

              <div className={styles.content}>
                <div className="row-center gap-8">
                  <span className={`text-body2 ${styles.tableLabel}`}>
                    상품권 그룹명 <span className={styles.required}>*</span>
                  </span>

                  <div className="table-item-value">
                    <TextInput
                      placeholder="상품권 그룹명을 입력해 주세요. (최대 30자)"
                      maxLength={30}
                      value={groupName}
                      onChange={(event) => setGroupName(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.body} style={{ marginBottom: 16 }}>
              <div className={`row-center gap-8 ${styles.title}`}>
                <Icon path={mdiTicketPercentOutline} size={22} />
                <span className="text-subtitle2">상품권 선택</span>
              </div>

              <div className={styles.content}>
                <div className="row-center gap-8">
                  <span className="grid-count-badge">{selectedVoucherIds.length} 개</span>
                  <span className="text-caption1">상품권이 선택되었습니다.</span>
                </div>

                <div className={styles.voucherList}>
                  {VOUCHER_OPTIONS.map((voucher) => {
                    const inputId = `voucher-select-${voucher.id}`;
                    const isSelected = selectedVoucherIds.includes(voucher.id);

                    return (
                      <label key={voucher.id} className={styles.voucherItem} htmlFor={inputId}>
                        <div className="row-start gap-12">
                          <input
                            id={inputId}
                            type="checkbox"
                            className={styles.voucherCheckbox}
                            checked={isSelected}
                            onChange={(event) => handleVoucherToggle(voucher.id, event.target.checked)}
                          />
                          <div className="flex-col gap-4">
                            <span className="text-subtitle3">{voucher.name}</span>
                            <span className="text-color-secondary">{voucher.region}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-subview-footer">
        <Button variant="outlined" color="neutral" onClick={handleReset} label="초기화" />
        <div className="row-center gap-8">
          <Button variant="outlined" color="neutral" onClick={onClose} label="취소" />
          <Button onClick={() => setIsConfirmModalOpen(true)} label="수정" />
        </div>
      </div>

      {/* 상품권 그룹 수정 모달 */}
      <Alert
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="상품권 그룹 수정"
        message="상품권 그룹을 수정하시겠습니까?"
        secondaryAction={{ label: "취소" }}
        primaryAction={{ label: "수정", onClick: handleEdit }}
      />

      <Alert
        open={failAlert !== null}
        onClose={() => setFailAlert(null)}
        title={failAlert?.title}
        message={failAlert?.message}
        primaryAction={{ label: "확인" }}
      />
    </div>
  );
}
