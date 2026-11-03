import { Fragment, forwardRef, useImperativeHandle, useState } from "react";
import { EditPanelHandle, VoucherEditInitialData } from "./types";
import { formatAmount } from "@utils";
import { Button, CheckboxGroup, Icon, TextInput, RadioGroup, Select, TabPanel } from "@xoheeoh/components";
import {
  mdiCashSync,
  mdiClose,
  mdiImagePlusOutline,
  mdiListBoxOutline,
  mdiPercentBoxOutline,
  mdiPlaylistEdit,
  mdiStorefrontEditOutline,
} from "@mdi/js";
import { BasicPolicyChangeHistoryModal } from "./modal";
import styles from "../VoucherManagePanel.module.css";

const SAMPLE_VOUCHER_IMAGE = "/img/upload_sample.jpg";

type BasicInfoPannelProps = {
  initialData: VoucherEditInitialData;
};

export const BasicInfoPannel = forwardRef<EditPanelHandle, BasicInfoPannelProps>(function BasicInfoPannel(
  { initialData },
  ref
) {
  const [formKey, setFormKey] = useState(0);
  const [monthlyGiftLimitType, setMonthlyGiftLimitType] = useState<string>(initialData.monthlyGiftLimitType);
  const [voucherImageUrl, setVoucherImageUrl] = useState<string>(SAMPLE_VOUCHER_IMAGE);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setMonthlyGiftLimitType(initialData.monthlyGiftLimitType);
      setVoucherImageUrl(SAMPLE_VOUCHER_IMAGE);
      setFormKey((k) => k + 1);
    },
  }));

  // 기본 정책 변경 이력 조회
  const [isBasicPolicyChangeHistoryModalOpen, setIsBasicPolicyChangeHistoryModalOpen] = useState(false);

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
                  <TextInput readOnly value={initialData.publisher} />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  상품권명 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <TextInput placeholder="상품권명을 입력해 주세요." defaultValue={initialData.voucherName} />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>구분</span>

                <div className="table-item-value">
                  <RadioGroup direction="horizontal" defaultValue={initialData.category} options={[{ value: "1", label: "정책발행" }, { value: "2", label: "소비쿠폰" }]} />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>기본 속성</span>

                <div className="table-item-value">
                  <CheckboxGroup direction="horizontal" defaultValue={initialData.basicAttributes} options={[{ value: "1", label: "개인구매불가" }, { value: "2", label: "개인선물불가" }]} />
                </div>
              </div>

              <div className="row-center gap-8 grid-col-full">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  앱 표출 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value row-center gap-8">
                  <Select
                    defaultValue={initialData.gmapDisplayType}
                    options={[{ value: "1", label: "정책발행" }]}
                    style={{ width: 200, flexShrink: 0 }}
                  />
                  <TextInput
                    className="table-item-value"
                    placeholder="앱 표출 상품권명을 입력해 주세요. (12자 내외 권고, 최대 50자)"
                    defaultValue={initialData.gmapDisplayName}
                  />
                </div>
              </div>

              <div className="row-center gap-8 grid-col-full">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  상품권 이미지 <span className={styles.required}>*</span>
                </span>

                <div className="flex-col gap-12">
                  {voucherImageUrl ? (
                    <div className={`${styles.imageBox} ${styles.imageBoxFilled}`}>
                      <img src={voucherImageUrl} alt="상품권 이미지" className={styles.imagePreview} />
                      <button
                        type="button"
                        className={styles.imageRemoveBtn}
                        aria-label="이미지 삭제"
                        onClick={() => setVoucherImageUrl("")}>
                        <Icon path={mdiClose} size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.imageBox}>
                      <Icon path={mdiImagePlusOutline} size={24} />
                      <span className="text-caption1">이미지 업로드</span>
                    </div>
                  )}

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
                  <TextInput
                    placeholder="상품권 한 줄 설명을 입력해 주세요."
                    defaultValue={initialData.voucherDescription}
                  />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  사용처 설명 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <TextInput placeholder="사용처 한 줄 설명을 입력해 주세요." defaultValue={initialData.usageDescription} />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  유효기간 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value row-center gap-8">
                  <Select
                    defaultValue={initialData.validityType}
                    options={[{ value: "1", label: "구매일로부터" }]}
                    style={{ flex: 1, flexShrink: 0 }}
                  />
                  <Select
                    defaultValue={initialData.validityPeriod}
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
                  <Select defaultValue={initialData.pinValidityPeriod} options={[{ value: "1", label: "7일" }]} />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>
                  문의처 전화번호 <span className={styles.required}>*</span>
                </span>

                <div className="table-item-value">
                  <TextInput
                    placeholder="문의처 전화번호를 입력해 주세요. (숫자만 입력)"
                    defaultValue={initialData.contactPhone}
                  />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>인증키</span>

                <div className="table-item-value">
                  <TextInput readOnly value={initialData.authKey} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 기본 정책 */}
        <div className={styles.body}>
          <div className={`flex-between ${styles.title}`} style={{ padding: "0 16px", height: 57 }}>
            <div className="row-center gap-8">
              <Icon path={mdiPlaylistEdit} size={22} />
              <span className="text-subtitle2">기본 정책</span>
            </div>
            <Button variant="outlined" color="neutral" onClick={() => setIsBasicPolicyChangeHistoryModalOpen(true)} label="기본 정책 변경 이력 조회" />
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
                    defaultValue={formatAmount(initialData.annualIssuanceLimit)}
                  />
                  <span className="text-body2">천원</span>
                  <Button variant="outlined" onClick={() => {}} label="한도 관리" />
                </div>
              </div>

              <div></div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>입금사업비</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput className="table-item-value" align="right" readOnly value={initialData.depositBusinessFund} />
                  <span className="text-body2">원</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>잔여사업비</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    className="table-item-value"
                    align="right"
                    readOnly
                    value={initialData.remainingBusinessFund}
                  />
                  <span className="text-body2">원</span>
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>연 할인판매한도</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    placeholder="연 할인판매한도를 입력해 주세요. (숫자만 입력)"
                    className="table-item-value"
                    align="right"
                    defaultValue={formatAmount(initialData.annualDiscountLimit)}
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
                    defaultValue={initialData.holdingLimit}
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
                  <RadioGroup direction="horizontal" defaultValue={initialData.personalPurchaseAvailable} options={[{ value: "off", label: "N" }, { value: "on", label: "Y" }]} />
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
                    defaultValue={initialData.monthlyPurchaseLimit}
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
                  <RadioGroup direction="horizontal" defaultValue={initialData.fullWithdrawSubsidyDeduction} options={[{ value: "off", label: "N" }, { value: "on", label: "Y" }]} />
                </div>
              </div>

              <div className="row-center gap-8">
                <span className={`text-body2 ${styles.tableLabel}`}>월 할인구매한도</span>

                <div className="table-item-value row-center gap-8">
                  <TextInput
                    align="right"
                    placeholder="월 할인구매한도를 입력해 주세요. (숫자만 입력)"
                    defaultValue={initialData.monthlyDiscountPurchaseLimit}
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
                    defaultValue={initialData.purchaseDiscountRate}
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
                    defaultValue={initialData.defaultMonthlySettlementLimit}
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
                    defaultValue={initialData.purchaseCancelPeriod}
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
                    options={[
                      { value: "1", label: "개별 관리" },
                      { value: "2", label: "통합 관리" },
                    ]}
                    style={{ width: 200, flexShrink: 0 }}
                  />
                  {monthlyGiftLimitType === "1" ? (
                    <>
                      <TextInput
                        placeholder="개인 선물 한도 (숫자만 입력)"
                        className="table-item-value"
                        align="right"
                        defaultValue={initialData.personalGiftLimit}
                      />
                      <span className="text-body2">천원</span>
                      <TextInput
                        placeholder="법인 선물 한도 (숫자만 입력)"
                        className="table-item-value"
                        align="right"
                        defaultValue={initialData.corporateGiftLimit}
                      />
                      <span className="text-body2">천원</span>
                    </>
                  ) : (
                    <>
                      <TextInput
                        placeholder="개인/법인 선물 한도 (숫자만 입력)"
                        className="table-item-value"
                        align="right"
                        defaultValue={initialData.unifiedGiftLimit}
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
                    defaultValue={initialData.refundRateOver10k}
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
                    defaultValue={initialData.refundRateUnder10k}
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
                    defaultValue={initialData.merchantFeeCode1}
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
                    defaultValue={initialData.merchantFeeCode2}
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
                    defaultValue={initialData.merchantFeeCode3}
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
                    defaultValue={initialData.merchantFeeCode4}
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
                    defaultValue={initialData.merchantFeeCodeN}
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
                    defaultValue={initialData.purchaseRefundFee}
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
                    defaultValue={initialData.expireRefundFee}
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
                    defaultValue={initialData.fullWithdrawFee}
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
                    defaultValue={initialData.platformOpFeeKis}
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
                    defaultValue={initialData.salesFee}
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
                    defaultValue={initialData.platformOpFeeHangyeolwon}
                  />
                  <span className="text-body2">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>

      {/* 기본 정책 변경 이력 조회 모달 */}
      <BasicPolicyChangeHistoryModal
        open={isBasicPolicyChangeHistoryModalOpen}
        onClose={() => setIsBasicPolicyChangeHistoryModalOpen(false)}
      />
    </TabPanel>
  );
});

export default BasicInfoPannel;
