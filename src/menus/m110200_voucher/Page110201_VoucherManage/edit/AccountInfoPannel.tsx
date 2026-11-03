import { forwardRef } from "react";
import { EditPanelHandle, VoucherEditInitialData } from "./types";
import { Button, Icon, TextInput, RadioGroup, Select, TabPanel } from "@xoheeoh/components";
import { mdiBankOutline } from "@mdi/js";
import styles from "../VoucherManagePanel.module.css";

type AccountInfoPannelProps = {
  initialData: VoucherEditInitialData;
};

/**
 * 기본적으로 수정화면에서 최초 등록하는 내용
 * 최초 등록 이후 수정하는 경우 데이터 불러옴
 */
export const AccountInfoPannel = forwardRef<EditPanelHandle, AccountInfoPannelProps>(function AccountInfoPannel(
  { initialData },
  ref
) {
  return (
    <TabPanel value="account" forceMount className="page-subview-body flex-col gap-16">
      <div className={styles.body}>
        <div className={`row-center gap-8 ${styles.title}`}>
          <Icon path={mdiBankOutline} size={22} />
          <span className="text-subtitle2">계좌 정보</span>
        </div>

        <div className={styles.content}>
          <div className="row-center gap-8">
            <span className="text-body2 table-item-label">계좌운용방식</span>

            <div className="table-item-value">
              <RadioGroup direction="horizontal" defaultValue="1" options={[{ value: "1", label: "은행 명의" }, { value: "2", label: "지자체 명의" }, { value: "3", label: "신탁" }]} />
            </div>
          </div>

          <div className="row-center gap-8">
            <span className="text-body2 table-item-label">입출금계좌</span>

            <div className="table-item-value flex-col gap-8">
              <div className="table-item-value row-center gap-8">
                <Select
                  defaultValue={"1"}
                  options={[
                    { value: "1", label: "국민은행" },
                    { value: "2", label: "우리은행" },
                  ]}
                  style={{ width: 140, flexShrink: 0 }}
                />
                <div className="table-item-value">
                  <TextInput placeholder="계좌번호를 입력해 주세요. (숫자만 입력)" />
                </div>
                <div style={{ width: 200, flexShrink: 0 }}>
                  <TextInput placeholder="계좌주명를 입력해 주세요." />
                </div>
                <Button style={{ flexShrink: 0 }} onClick={() => {}} label="계좌주 실명조회" />
              </div>
              <div className="table-item-value row-center gap-8">
                <TextInput placeholder="비밀번호" className="table-item-value" />
                <TextInput placeholder="비밀번호 확인" className="table-item-value" />
                <TextInput placeholder="사업자번호" className="table-item-value" />
                <div style={{ width: 328 }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabPanel>
  );
});

export default AccountInfoPannel;
