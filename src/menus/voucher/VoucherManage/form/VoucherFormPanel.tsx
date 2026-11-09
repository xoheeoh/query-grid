import { useEffect, useRef, useState } from "react";
import { Alert, Button, IconButton, Icon, Tab, TabList, Tabs, useToast } from "@xoheeoh/components";
import { mdiArrowLeft } from "@mdi/js";
import { useSubviewLock } from "../../../SubviewLockContext";
import { BasicInfoPanel, type VoucherBasicValues } from "./BasicInfoPanel";
import { SaleInfoPanel, type VoucherSaleValues } from "./SaleInfoPanel";
import type { FormPanelHandle } from "./types";

export type VoucherFormMode = "register" | "edit";

/** 수정 화면에 넘기는 기존 값. 탭별로 나뉜다. */
export type VoucherFormValues = {
  basic?: Partial<VoucherBasicValues>;
  sale?: Partial<VoucherSaleValues>;
};

type VoucherFormPanelProps = {
  mode: VoucherFormMode;
  /** mode가 edit일 때 불러온 값 */
  initialValues?: VoucherFormValues;
  onClose: () => void;
};

const TAB_LABEL: Record<string, string> = { basic: "기본 정보", sale: "판매/사용 정보" };

/** 등록·수정 화면의 문구. 어느 쪽인지에 따라 제목·버튼·확인창 글자만 다르다. */
const TEXT: Record<VoucherFormMode, { title: string; subtitle: string; submit: string; confirm: string; done: string }> = {
  register: {
    title: "상품권 등록",
    subtitle: "신규 상품권을 등록합니다. * 표시는 필수 항목입니다.",
    submit: "등록",
    confirm: "상품권을 등록하시겠습니까?",
    done: "상품권 등록이 완료되었습니다.",
  },
  edit: {
    title: "상품권 수정",
    subtitle: "상품권 정보를 수정합니다. * 표시는 필수 항목입니다.",
    submit: "수정",
    confirm: "상품권 정보를 수정하시겠습니까?",
    done: "상품권 수정이 완료되었습니다.",
  },
};

/** 상품권 관리 Contents 위에 올라가는 등록·수정 서브뷰(풀모달). 같은 폼을 쓰고 mode로만 구분한다. */
export function VoucherFormPanel({ mode, initialValues, onClose }: VoucherFormPanelProps) {
  useSubviewLock();
  const toast = useToast();
  const text = TEXT[mode];
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const basicRef = useRef<FormPanelHandle>(null);
  const saleRef = useRef<FormPanelHandle>(null);

  const activeRef = activeTab === "basic" ? basicRef : saleRef;
  const isDirty = () => Boolean(basicRef.current?.isDirty() || saleRef.current?.isDirty());

  /** 작성 중인 내용이 있으면 먼저 물어보고, 없으면 바로 닫는다. */
  const requestClose = () => {
    if (isDirty()) setIsLeaveOpen(true);
    else onClose();
  };

  const handleResetClick = () => {
    if (!activeRef.current?.isDirty()) {
      toast.info("초기화할 내용이 없습니다.");
      return;
    }
    setIsResetOpen(true);
  };

  const handleResetConfirm = () => {
    setIsResetOpen(false);
    activeRef.current?.reset();
  };

  /** 필수값부터 검사하고, 통과하면 확인창을 띄운다. */
  const handleSubmitClick = () => {
    const basicOk = basicRef.current?.validate() ?? true;
    const saleOk = saleRef.current?.validate() ?? true;
    if (!basicOk || !saleOk) {
      setActiveTab(basicOk ? "sale" : "basic");
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

  const handleDelete = () => {
    setIsDeleteOpen(false);
    toast.success("상품권이 삭제되었습니다.");
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target as HTMLElement | null;
      // 알림창·모달 안에서 누른 Esc는 그쪽이 처리한다. 이 화면까지 같이 닫히면 안 된다.
      const nearestDialog = target?.closest('[role="dialog"], [role="alertdialog"]') ?? null;
      if (nearestDialog && nearestDialog !== panelRef.current) return;
      // 포커스가 본문으로 빠진 경우: 알림창이 떠 있지 않을 때만 이 화면을 닫는다.
      if (!nearestDialog && document.querySelector('[role="alertdialog"], [role="dialog"]:not(.page-subview)')) return;
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
      aria-labelledby="voucher-form-title"
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
              <h3 id="voucher-form-title" className="text-heading3">
                {text.title}
              </h3>
              <p className="text-body2 text-color-secondary">{text.subtitle}</p>
            </div>
          </div>
        </div>

        <Tabs resize="hug" value={activeTab} onChange={setActiveTab} className="page-subview-tabs">
          <TabList>
            <Tab value="basic">{TAB_LABEL.basic}</Tab>
            <Tab value="sale">{TAB_LABEL.sale}</Tab>
          </TabList>

          <BasicInfoPanel ref={basicRef} initialValues={initialValues?.basic} publisherLocked={mode === "edit"} />
          <SaleInfoPanel ref={saleRef} initialValues={initialValues?.sale} />
        </Tabs>
      </div>

      <div className="page-subview-footer">
        <Button variant="outlined" color="neutral" onClick={handleResetClick} label="현재 탭 초기화" />
        <div className="row-center gap-8">
          <Button variant="outlined" color="neutral" onClick={requestClose} label="취소" />
          {mode === "edit" && <Button color="destructive" onClick={() => setIsDeleteOpen(true)} label="삭제" />}
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
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="상품권 삭제"
        message={"삭제한 상품권은 되돌릴 수 없습니다.\n정말 삭제하시겠습니까?"}
        secondaryAction={{ label: "취소" }}
        destructiveAction={{ label: "삭제", onClick: handleDelete }}
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
        title="현재 탭 초기화"
        message={`"${TAB_LABEL[activeTab]}" 탭에 입력한 내용을 처음 상태로 되돌립니다.\n계속하시겠습니까?`}
        secondaryAction={{ label: "취소" }}
        destructiveAction={{ label: "초기화", onClick: handleResetConfirm }}
      />
    </div>
  );
}

export default VoucherFormPanel;
