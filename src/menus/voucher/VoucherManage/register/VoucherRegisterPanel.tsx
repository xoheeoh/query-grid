import { useEffect, useRef, useState } from "react";
import { Alert, Button, IconButton, Icon, Tab, TabList, Tabs, useToast } from "@xoheeoh/components";
import { mdiArrowLeft } from "@mdi/js";
import { useSubviewLock } from "../../../SubviewLockContext";
import { BasicInfoPannel, SaleInfoPannel, type RegisterPanelHandle } from ".";

type VoucherRegisterPanelProps = {
  onClose: () => void;
};

const TAB_LABEL: Record<string, string> = { basic: "기본 정보", sale: "판매/사용 정보" };

/** 상품권 관리 Contents 위에 올라가는 등록 서브뷰(풀모달) */
export default function VoucherRegisterPanel({ onClose }: VoucherRegisterPanelProps) {
  useSubviewLock();
  const toast = useToast();
  const panelRef = useRef<HTMLDivElement>(null);
  // 값이 있으면 실패 알림을 띄운다. 닫으면 null로 돌아간다.
  const [failAlert, setFailAlert] = useState<{ title: string; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = useState(false);
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false);
  const basicRef = useRef<RegisterPanelHandle>(null);
  const saleRef = useRef<RegisterPanelHandle>(null);
  const isRegisterSuccess = true; // 등록 결과 모달 노출을 위한 임시 상태값

  const activeRef = activeTab === "basic" ? basicRef : saleRef;
  const isDirty = () => Boolean(basicRef.current?.isDirty() || saleRef.current?.isDirty());

  /** 작성 중인 내용이 있으면 먼저 물어보고, 없으면 바로 닫는다. */
  const requestClose = () => {
    if (isDirty()) setIsLeaveAlertOpen(true);
    else onClose();
  };

  const handleResetClick = () => {
    if (!activeRef.current?.isDirty()) {
      toast.info("초기화할 내용이 없습니다.");
      return;
    }
    setIsResetAlertOpen(true);
  };

  const handleResetConfirm = () => {
    setIsResetAlertOpen(false);
    activeRef.current?.reset();
  };

  /** 필수값부터 검사하고, 통과하면 등록 확인창을 띄운다. */
  const handleRegisterClick = () => {
    const basicOk = basicRef.current?.validate() ?? true;
    const saleOk = saleRef.current?.validate() ?? true;
    if (!basicOk || !saleOk) {
      setActiveTab(basicOk ? "sale" : "basic");
      toast.error("필수 항목을 확인해 주세요.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

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
      if (event.key !== "Escape") return;
      const target = event.target as HTMLElement | null;
      // 알림창·모달 안에서 누른 Esc는 그쪽이 처리한다. 등록 화면까지 같이 닫히면 안 된다.
      const nearestDialog = target?.closest('[role="dialog"], [role="alertdialog"]');
      if (nearestDialog !== panelRef.current) return;
      // 열려 있는 드롭다운은 자기가 닫는다.
      if (target?.closest('[aria-expanded="true"]')) return;
      requestClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div
      ref={panelRef}
      className="page-subview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voucher-register-title"
      // Sidebar hover/flyout과 레이어가 겹칠 때, 모달이 sidebar 위로 올라가 pointer 이벤트를 가로채는 문제를 방지
      style={{ zIndex: 10 }}>
      <div className="page-subview-main">
        <div className="page-subview-header flex-between">
          <div className="row-start gap-12">
            <IconButton
              variant="outlined"
              color="neutral"
              onClick={requestClose}
              aria-label="상품권 관리로 돌아가기"
              icon={<Icon path={mdiArrowLeft} />}
            />
            <div className="page-title">
              <h3 id="voucher-register-title" className="text-heading3">
                상품권 등록
              </h3>
              <p className="text-body2 text-color-secondary">신규 상품권을 등록합니다. * 표시는 필수 항목입니다.</p>
            </div>
          </div>
        </div>

        <Tabs resize="hug" value={activeTab} onChange={setActiveTab} className="page-subview-tabs">
          <TabList>
            <Tab value="basic">{TAB_LABEL.basic}</Tab>
            <Tab value="sale">{TAB_LABEL.sale}</Tab>
          </TabList>

          <BasicInfoPannel ref={basicRef} />
          <SaleInfoPannel ref={saleRef} />
        </Tabs>
      </div>

      <div className="page-subview-footer">
        <Button variant="outlined" color="neutral" onClick={handleResetClick} label="현재 탭 초기화" />
        <div className="row-center gap-8">
          <Button variant="outlined" color="neutral" onClick={requestClose} label="취소" />
          <Button onClick={handleRegisterClick} label="등록" />
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
        open={isLeaveAlertOpen}
        onClose={() => setIsLeaveAlertOpen(false)}
        title="작성 취소"
        message={"작성 중인 내용이 모두 사라집니다.\n등록을 취소하고 나가시겠습니까?"}
        secondaryAction={{ label: "계속 작성" }}
        destructiveAction={{ label: "나가기", onClick: onClose }}
      />

      <Alert
        open={isResetAlertOpen}
        onClose={() => setIsResetAlertOpen(false)}
        title="현재 탭 초기화"
        message={`"${TAB_LABEL[activeTab]}" 탭에 입력한 내용을 모두 지웁니다.\n계속하시겠습니까?`}
        secondaryAction={{ label: "취소" }}
        destructiveAction={{ label: "초기화", onClick: handleResetConfirm }}
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
