import { Fragment, forwardRef, useImperativeHandle, useState } from "react";
import type { RegisterPanelHandle } from "./types";
import {
  Button,
  CheckboxGroup,
  Icon,
  TextInput,
  RadioGroup,
  Select,
  TabPanel,
  useToast,
} from "@xoheeoh/components";
import {
  mdiCashSync,
  mdiImagePlusOutline,
  mdiListBoxOutline,
  mdiPercentBoxOutline,
  mdiPlaylistEdit,
  mdiStorefrontEditOutline,
} from "@mdi/js";
import { AnnualLimitModal } from "./modal";
import styles from "../VoucherManagePanel.module.css";

export const BasicInfoPannel = forwardRef<RegisterPanelHandle>(function BasicInfoPannel(_, ref) {
  const [formKey, setFormKey] = useState(0);
  const [monthlyGiftLimitType, setMonthlyGiftLimitType] = useState<string>("1");
  const toast = useToast();

  useImperativeHandle(ref, () => ({
    reset: () => {
      setMonthlyGiftLimitType("1");
      setFormKey((k) => k + 1);
    },
  }));

  // 한도 관리 모달
  const [isAnnualLimitModalOpen, setIsAnnualLimitModalOpen] = useState(false);

  const handleSaveAnnualLimit = () => {
    setIsAnnualLimitModalOpen(false);
    toast.success("연 발행한도 정보가 저장되었습니다.");
  };

  return (
    <TabPanel value="basic" forceMount className="page-subview-body flex-col gap-16">
      <Fragment key={formKey}>
        {/* 1. 기본 정보 */}
        <div className={styles.body}>
          <div className={`row-center gap-8 ${styles.title}`}>
            <Icon path={mdiListBoxOutline} size={22} />
            <span className="text-subtitle2">기본 정보</span>
          </div>

          <div className={styles.content}>
            <div className={styles.layoutBox}>
              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  발행처 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <Select options={[]} placeholder="발행처를 선택해 주세요." />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  상품권명 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <TextInput placeholder="상품권명을 입력해 주세요." />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  구분 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <RadioGroup direction="horizontal" defaultValue="1" options={[{ value: "1", label: "정책발행" }, { value: "2", label: "소비쿠폰" }]} />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  기본 속성 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <CheckboxGroup direction="horizontal" options={[{ value: "1", label: "개인구매불가" }, { value: "2", label: "개인선물불가" }]} />
                </div>
              </div>

              <div className="row-center gap-8 grid-col-full">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  앱 표출 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value row-center gap-8">
                  <Select
                    defaultValue="1"
                    options={[{ value: "1", label: "정책발행" }]}
                    style={{ width: 200, flexShrink: 0 }}
                  />
                  <TextInput
                    className="table-item-value"
                    placeholder="앱 표출 상품권명을 입력해 주세요. (12자 내외 권고, 최대 50자)"
                  />
                </div>
              </div>

              <div className="row-center gap-8 grid-col-full">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  상품권 이미지 <span className={styles.required}>*</span>
                </span>

                <div className="flex-col gap-12">
                  <div className={styles.imageBox}>
                    <Icon path={mdiImagePlusOutline} size={24} />
                    <span className="text-caption1">이미지 업로드</span>
                  </div>

                  <ul className={`text-caption1 text-color-secondary ${styles.imageInfoList}`}>
                    <li>권장 크기: 100 x 100px</li>
                    <li>JPG, PNG, GIF 포맷 지원 / 최대 1MB</li>
                  </ul>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  상품권 설명 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <TextInput placeholder="상품권 한 줄 설명을 입력해 주세요." />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  사용처 설명 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <TextInput placeholder="사용처 한 줄 설명을 입력해 주세요." />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  유효기간 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value row-center gap-8">
                  <Select
                    defaultValue="1"
                    options={[{ value: "1", label: "구매일로부터" }]}
                    style={{ flex: 1, flexShrink: 0 }}
                  />
                  <Select
                    defaultValue="1"
                    options={[{ value: "1", label: "5년" }]}
                    style={{ flex: 1, flexShrink: 0 }}
                  />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  PIN 등록 유효기간 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <Select defaultValue="1" options={[{ value: "1", label: "7일" }]} />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  문의처 전화번호 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <TextInput placeholder="문의처 전화번호를 입력해 주세요. (숫자만 입력)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 기본 정책 */}
        <div className={styles.body}>
          <div className={`row-center gap-8 ${styles.title}`}>
            <Icon path={mdiPlaylistEdit} size={22} />
            <span className="text-subtitle2">기본 정책</span>
          </div>

          <div className={styles.content}>
            <div className={styles.layoutBox}>
              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>연 발행한도</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="연 발행한도를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">천원</span>
                  <Button variant="outlined" onClick={() => setIsAnnualLimitModalOpen(true)} label="한도 관리" />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>연 할인판매한도</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="연 할인판매한도를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">천원</span>
                  <Button variant="outlined" onClick={() => {}} label="한도 관리" />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>보유한도</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="보유한도를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">천원</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  개인정가구매
                  <br />
                  가능 여부
                </span>

                <div className="table-item-value flex-between gap-8">
                  <RadioGroup direction="horizontal" defaultValue="off" options={[{ value: "off", label: "N" }, { value: "on", label: "Y" }]} />
                  <Button variant="outlined" onClick={() => {}} label="구매 관리" />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>월 구매한도</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="월 구매한도를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">천원</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  전액 인출 시
                  <br />
                  지원금 차감 여부
                </span>

                <div className="table-item-value">
                  <RadioGroup direction="horizontal" defaultValue="off" options={[{ value: "off", label: "N" }, { value: "on", label: "Y" }]} />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>월 할인구매한도</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    align="right"
                    placeholder="월 할인구매한도를 입력해 주세요. (숫자만 입력)"
                    defaultValue={"500"}
                    className="table-item-value"
                  />
                  <span className="text-body2">천원</span>
                  <Button variant="outlined" onClick={() => {}} label="한도 관리" />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>구매 할인율</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    defaultValue={"0.0"}
                    placeholder="구매 할인율을 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>기본 월 정산한도</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="기본 월 정산한도를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">천원</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>구매취소 가능기간</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    align="right"
                    placeholder="구매취소 가능기간을 입력해 주세요. (숫자만 입력)"
                    defaultValue={"7"}
                    className="table-item-value"
                  />
                  <span className="text-body2">일</span>
                  <Button variant="outlined" onClick={() => {}} label="기간 관리" />
                </div>
              </div>

              <div className="row-center gap-8 grid-col-full">
                <span className={`text-body2 ${styles.tableLabel}`}>월 선물 등록한도</span>

                <div className="table-item-value row-center gap-8">
                  <Select
                    value={monthlyGiftLimitType}
                    onValueChange={(value) => {
                      setMonthlyGiftLimitType(value);
                    }}
                    defaultValue="1"
                    options={[
                      { value: "1", label: "개별 관리" },
                      { value: "2", label: "통합 관리" },
                    ]}
                    style={{ width: 200, flexShrink: 0 }}
                  />
                  {monthlyGiftLimitType === "1" ? (
                    <>
                      <TextInput placeholder="개인 선물 한도 (숫자만 입력)" className="table-item-value" align="right" />
                      <span className="text-body2">천원</span>
                      <TextInput placeholder="법인 선물 한도 (숫자만 입력)" className="table-item-value" align="right" />
                      <span className="text-body2">천원</span>
                    </>
                  ) : (
                    <>
                      <TextInput
                        placeholder="개인/법인 선물 한도 (숫자만 입력)"
                        className="table-item-value"
                        align="right"
                      />
                      <span className="text-body2">천원</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 환불기준 사용률 */}
        <div className={styles.body}>
          <div className={`row-center gap-8 ${styles.title}`}>
            <Icon path={mdiCashSync} size={22} />
            <span className="text-subtitle2">환불기준 사용률</span>
          </div>

          <div className={styles.content}>
            <div className={styles.layoutBox}>
              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>액면가 1만원 초과 시</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="환불기준 사용률을 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>액면가 1만원 이하 시</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="환불기준 사용률을 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 가맹점 수수료 */}
        <div className={styles.body}>
          <div className={`row-center gap-8 ${styles.title}`}>
            <Icon path={mdiStorefrontEditOutline} size={22} />
            <span className="text-subtitle2">가맹점 수수료</span>
          </div>

          <div className={styles.content}>
            <div className={styles.layoutBox}>
              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>코드 1</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>코드 2</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>코드 3</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>코드 4</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>코드 (n)</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. 수수료 설정 */}
        <div className={styles.body}>
          <div className={`row-center gap-8 ${styles.title}`}>
            <Icon path={mdiPercentBoxOutline} size={22} />
            <span className="text-subtitle2">수수료 설정</span>
          </div>

          <div className={styles.content}>
            <div className={styles.layoutBox}>
              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>구매환불 수수료</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>만료환불 수수료</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>전액인출 수수료</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  플랫폼 운영
                  <br />
                  수수료 (시스템 운영사)
                </span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>판매 수수료</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  플랫폼 운영
                  <br />
                  수수료 (플랫폼 운영기관)
                </span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>

      {/* 한도 관리 모달 */}
      <AnnualLimitModal
        open={isAnnualLimitModalOpen}
        onClose={() => setIsAnnualLimitModalOpen(false)}
        onSave={handleSaveAnnualLimit}
      />
    </TabPanel>
  );
});

export default BasicInfoPannel;
