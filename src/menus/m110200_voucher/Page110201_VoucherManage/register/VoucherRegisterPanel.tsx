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
import { BasicInfoPannel, SaleInfoPannel, type RegisterPanelHandle } from ".";

type VoucherRegisterPanelProps = {
  onClose: () => void;
};

/** 상품권 관리 Contents 위에 올라가는 등록 서브뷰(풀모달) */
export default function VoucherRegisterPanel({ onClose }: VoucherRegisterPanelProps) {
  useSubviewLock();
  const toast = useToast();
  // 값이 있으면 실패 알림을 띄운다. 닫으면 null로 돌아간다.
  const [failAlert, setFailAlert] = useState<{ title: string; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const basicRef = useRef<RegisterPanelHandle>(null);
  const saleRef = useRef<RegisterPanelHandle>(null);

  const handleReset = () => {
    if (activeTab === "basic") basicRef.current?.reset();
    else if (activeTab === "sale") saleRef.current?.reset();
  };

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const isRegisterSuccess = true; // 등록 결과 모달 노출을 위한 임시 상태값

  const handleRegister = () => {
    setIsConfirmModalOpen(false);

    // TODO: 성공/실패 로직 분리해서 보여줘야함
    if (isRegisterSuccess) {
      toast.success("상품권 등록이 완료되었습니다.");
      onClose();
    } else {
      setFailAlert({ title: "등록 실패", message: "실패 사유" });
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
      aria-labelledby="voucher-register-title"
      // Sidebar hover/flyout과 레이어가 겹칠 때, 모달이 sidebar 위로 올라가 pointer 이벤트를 가로채는 문제를 방지
      style={{ zIndex: 10 }}>
      <div className="page-subview-main">
        <div className="page-subview-header flex-between">
          <div className="row-start gap-12">
            <IconButton variant="outlined" color="neutral" onClick={onClose} aria-label="상품권 관리로 돌아가기" icon={<Icon path={mdiArrowLeft} />} />
            <div className="page-title">
              <h3 id="voucher-register-title" className="text-heading3">
                상품권 등록
              </h3>
              <p className="text-body2 text-color-secondary">신규 상품권을 등록합니다.</p>
            </div>
          </div>
        </div>

        <Tabs resize="hug" value={activeTab} onChange={setActiveTab} className="page-subview-tabs">
          <TabList>
            <Tab value="basic">기본 정보</Tab>
            <Tab value="sale">판매/사용 정보</Tab>
          </TabList>

          <BasicInfoPannel ref={basicRef} />
          <SaleInfoPannel ref={saleRef} />
        </Tabs>
      </div>

      <div className="page-subview-footer">
        <Button variant="outlined" color="neutral" onClick={handleReset} label="초기화" />
        <div className="row-center gap-8">
          <Button variant="outlined" color="neutral" onClick={onClose} label="취소" />
          <Button onClick={() => setIsConfirmModalOpen(true)} label="등록" />
        </div>
      </div>

      {/* 상품권 등록 모달 */}
      <Alert
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="상품권 등록"
        message="상품권을 등록하시겠습니까?"
        secondaryAction={{ label: "취소" }}
        primaryAction={{ label: "등록", onClick: handleRegister }}
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
