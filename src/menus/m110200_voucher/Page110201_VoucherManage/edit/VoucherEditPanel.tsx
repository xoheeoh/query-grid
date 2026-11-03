import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  IconButton,
  Icon,
  Tab,
  TabList,
  Tabs,
  useToast,
} from "@xoheeoh/components";
import { mdiArrowLeft } from "@mdi/js";
import { useSubviewLock } from "../../../SubviewLockContext";
import {
  AccountInfoPannel,
  BasicInfoPannel,
  MessageInfoPannel,
  SaleInfoPannel,
  type EditPanelHandle,
  type VoucherEditInitialData,
} from ".";

type VoucherEditPanelProps = {
  onClose: () => void;
  initialData: VoucherEditInitialData;
};

/** 상품권 관리 Contents 위에 올라가는 수정 서브뷰(풀모달) */
export default function VoucherEditPanel({ onClose, initialData }: VoucherEditPanelProps) {
  useSubviewLock();
  const toast = useToast();
  // 값이 있으면 실패 알림을 띄운다. 닫으면 null로 돌아간다.
  const [failAlert, setFailAlert] = useState<{ title: string; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const basicRef = useRef<EditPanelHandle>(null);
  const accountRef = useRef<EditPanelHandle>(null);
  const saleRef = useRef<EditPanelHandle>(null);
  const messageRef = useRef<EditPanelHandle>(null);

  const handleReset = () => {
    if (activeTab === "basic") basicRef.current?.reset();
    else if (activeTab === "sale") saleRef.current?.reset();
  };

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isSubmitSuccess = true; // 결과 모달 노출을 위한 임시 상태값
  const isDeleteSuccess = false; // 결과 모달 노출을 위한 임시 상태값

  const handleSubmit = () => {
    setIsConfirmModalOpen(false);

    // TODO: 성공/실패 로직 분리해서 보여줘야함
    if (isSubmitSuccess) {
      toast.success("상품권 수정이 완료되었습니다.");
      onClose();
    } else {
      setFailAlert({ title: "수정 실패", message: "실패 사유" });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(false);

    // TODO: 성공/실패 로직 분리해서 보여줘야함
    if (isDeleteSuccess) {
      toast.success("상품권 삭제가 완료되었습니다.");
      onClose();
    } else {
      setFailAlert({ title: "삭제 실패", message: "실패 사유" });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="page-subview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voucher-edit-title"
      // Sidebar hover/flyout과 레이어가 겹칠 때, 모달이 sidebar 위로 올라가 pointer 이벤트를 가로채는 문제를 방지
      style={{ zIndex: 10 }}>
      <div className="page-subview-main">
        <div className="page-subview-header flex-between">
          <div className="row-start gap-12">
            <IconButton variant="outlined" color="neutral" onClick={onClose} aria-label="상품권 관리로 돌아가기" icon={<Icon path={mdiArrowLeft} />} />
            <div className="page-title">
              <h3 id="voucher-edit-title" className="text-heading3">
                상품권 수정
              </h3>
              <p className="text-body2 text-color-secondary">
                발행처: {initialData.publisher} ㆍ 상품권명: {initialData.voucherName}
              </p>
            </div>
          </div>
        </div>

        <Tabs resize="hug" value={activeTab} onChange={setActiveTab} className="page-subview-tabs">
          <TabList>
            <Tab value="basic">기본 정보</Tab>
            <Tab value="account">계좌 정보</Tab>
            <Tab value="sale">판매/사용 정보</Tab>
            <Tab value="message">알림톡 메시지</Tab>
          </TabList>

          <BasicInfoPannel ref={basicRef} initialData={initialData} />
          <AccountInfoPannel ref={accountRef} initialData={initialData} />
          <SaleInfoPannel ref={saleRef} initialData={initialData} />
          <MessageInfoPannel ref={messageRef} initialData={initialData} />
        </Tabs>
      </div>

      <div className="page-subview-footer">
        <Button variant="outlined" color="neutral" onClick={handleReset} label="초기화" />
        <div className="row-center gap-8">
          <Button variant="outlined" color="neutral" onClick={onClose} label="취소" />
          <Button color="neutral" onClick={() => {}} label="적립 개시" />
          <Button color="destructive" onClick={() => setIsDeleteModalOpen(true)} label="삭제" />
          <Button onClick={() => setIsConfirmModalOpen(true)} label="수정" />
        </div>
      </div>

      {/* 상품권 수정 모달 */}
      <Alert
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="상품권 수정"
        message="상품권 정보를 수정하시겠습니까?"
        secondaryAction={{ label: "취소" }}
        primaryAction={{ label: "수정", onClick: handleSubmit }}
      />

      {/* 상품권 삭제 모달 */}
      <Alert
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="상품권 삭제"
        message="상품권을 삭제하시겠습니까?"
        secondaryAction={{ label: "취소" }}
        destructiveAction={{ label: "삭제", onClick: handleDelete }}
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
