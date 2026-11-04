import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ChangeEvent } from "react";
import { Button, CheckboxGroup, Icon, RadioGroup, Select, TabPanel, TextInput, useToast } from "@xoheeoh/components";
import {
  mdiCashSync,
  mdiClose,
  mdiImagePlusOutline,
  mdiListBoxOutline,
  mdiPercentBoxOutline,
  mdiPlaylistEdit,
  mdiStorefrontEditOutline,
} from "@mdi/js";
import { formatThousandInput, onlyDigits } from "@utils";
import { FormField, type FieldControlProps } from "../FormField";
import {
  APP_DISPLAY_TYPE_OPTIONS,
  BASIC_ATTRIBUTE_OPTIONS,
  CATEGORY_OPTIONS,
  GIFT_LIMIT_TYPE_OPTIONS,
  PIN_VALIDITY_OPTIONS,
  PUBLISHER_OPTIONS,
  VALIDITY_PERIOD_OPTIONS,
  VALIDITY_TYPE_OPTIONS,
  YES_NO_OPTIONS,
} from "../voucherOptions";
import { LIMIT_MODAL_PRESETS, LimitHistoryModal, type LimitModalKind } from "./modal";
import type { RegisterPanelHandle } from "./types";
import styles from "../VoucherManagePanel.module.css";

const MAX_IMAGE_BYTES = 1024 * 1024;

type BasicForm = {
  // 기본 정보
  publisher: string;
  voucherName: string;
  category: string;
  basicAttributes: string[];
  appDisplayType: string;
  appDisplayName: string;
  /** 올린 이미지의 미리보기 주소. 비어 있으면 아직 안 올린 상태 */
  imageUrl: string;
  voucherDescription: string;
  usageDescription: string;
  validityType: string;
  validityPeriod: string;
  pinValidityPeriod: string;
  contactPhone: string;
  // 기본 정책
  annualIssuanceLimit: string;
  annualDiscountLimit: string;
  holdingLimit: string;
  personalPurchaseAvailable: string;
  monthlyPurchaseLimit: string;
  fullWithdrawSubsidyDeduction: string;
  monthlyDiscountPurchaseLimit: string;
  purchaseDiscountRate: string;
  defaultMonthlySettlementLimit: string;
  purchaseCancelPeriod: string;
  monthlyGiftLimitType: string;
  personalGiftLimit: string;
  corporateGiftLimit: string;
  unifiedGiftLimit: string;
  // 환불기준 사용률
  refundRateOver10k: string;
  refundRateUnder10k: string;
  // 가맹점 수수료
  merchantFeeCode1: string;
  merchantFeeCode2: string;
  merchantFeeCode3: string;
  merchantFeeCode4: string;
  merchantFeeCodeN: string;
  // 수수료 설정
  purchaseRefundFee: string;
  expireRefundFee: string;
  fullWithdrawFee: string;
  systemOperatorFee: string;
  salesFee: string;
  platformOperatorFee: string;
};

const INITIAL_FORM: BasicForm = {
  publisher: "",
  voucherName: "",
  category: "1",
  basicAttributes: [],
  appDisplayType: "1",
  appDisplayName: "",
  imageUrl: "",
  voucherDescription: "",
  usageDescription: "",
  validityType: "1",
  validityPeriod: "5",
  pinValidityPeriod: "7",
  contactPhone: "",
  annualIssuanceLimit: "",
  annualDiscountLimit: "",
  holdingLimit: "",
  personalPurchaseAvailable: "off",
  monthlyPurchaseLimit: "",
  fullWithdrawSubsidyDeduction: "off",
  monthlyDiscountPurchaseLimit: "500",
  purchaseDiscountRate: "0.0",
  defaultMonthlySettlementLimit: "",
  purchaseCancelPeriod: "7",
  monthlyGiftLimitType: "1",
  personalGiftLimit: "",
  corporateGiftLimit: "",
  unifiedGiftLimit: "",
  refundRateOver10k: "",
  refundRateUnder10k: "",
  merchantFeeCode1: "",
  merchantFeeCode2: "",
  merchantFeeCode3: "",
  merchantFeeCode4: "",
  merchantFeeCodeN: "",
  purchaseRefundFee: "",
  expireRefundFee: "",
  fullWithdrawFee: "",
  systemOperatorFee: "",
  salesFee: "",
  platformOperatorFee: "",
};

type FieldKey = keyof BasicForm;
type FormErrors = Partial<Record<FieldKey, string>>;

/** 필수값 검사. 문제가 있는 칸마다 안내 문구를 돌려준다. */
function findErrors(form: BasicForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.publisher) errors.publisher = "발행처를 선택해 주세요.";
  if (!form.voucherName.trim()) errors.voucherName = "상품권명을 입력해 주세요.";
  if (form.appDisplayType === "2" && !form.appDisplayName.trim()) {
    errors.appDisplayName = "앱에 표출할 상품권명을 입력해 주세요.";
  }
  if (!form.imageUrl) errors.imageUrl = "상품권 이미지를 올려 주세요.";
  if (!form.voucherDescription.trim()) errors.voucherDescription = "상품권 설명을 입력해 주세요.";
  if (!form.usageDescription.trim()) errors.usageDescription = "사용처 설명을 입력해 주세요.";
  if (!form.contactPhone) errors.contactPhone = "문의처 전화번호를 입력해 주세요.";
  else if (form.contactPhone.length < 8) errors.contactPhone = "전화번호는 숫자 8자리 이상 입력해 주세요.";
  return errors;
}

/** 금액은 천 단위 콤마, 일수는 숫자만, 비율은 숫자와 소수점 하나만 남긴다. */
type NumberKind = "amount" | "rate" | "days";
function sanitizeNumber(kind: NumberKind, raw: string): string {
  if (kind === "amount") return formatThousandInput(raw);
  if (kind === "days") return onlyDigits(raw);
  const [whole = "", ...rest] = raw.replace(/[^\d.]/g, "").split(".");
  return rest.length ? `${whole}.${rest.join("")}` : whole;
}

type NumberInputProps = {
  kind: NumberKind;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  control: FieldControlProps;
};

/** 오른쪽 정렬 숫자 입력칸 + 단위 글자 */
function NumberInput({ kind, unit, value, onChange, placeholder, control }: NumberInputProps) {
  return (
    <>
      <TextInput
        {...control}
        className="table-item-value"
        align="right"
        inputMode={kind === "rate" ? "decimal" : "numeric"}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(sanitizeNumber(kind, event.target.value))}
      />
      <span className="text-body2">{unit}</span>
    </>
  );
}

export const BasicInfoPannel = forwardRef<RegisterPanelHandle>(function BasicInfoPannel(_, ref) {
  const [form, setForm] = useState<BasicForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [limitModal, setLimitModal] = useState<LimitModalKind | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  /** 한 칸의 값을 바꾸고, 그 칸에 붙어 있던 오류 문구는 지운다. */
  const update = <K extends FieldKey>(key: K, value: BasicForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // 미리보기용 임시 주소는 바뀌거나 화면이 닫힐 때 해제한다.
  useEffect(() => {
    const url = form.imageUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [form.imageUrl]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 골라도 change가 일어나게 비운다.
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, imageUrl: "1MB 이하 이미지만 올릴 수 있습니다." }));
      return;
    }
    update("imageUrl", URL.createObjectURL(file));
  };

  const removeImage = () => {
    update("imageUrl", "");
    imageInputRef.current?.focus();
  };

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setForm(INITIAL_FORM);
        setErrors({});
      },
      isDirty: () => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM),
      validate: () => {
        const found = findErrors(form);
        setErrors(found);
        if (Object.keys(found).length === 0) return true;

        // 탭이 바뀌고 화면이 그려진 뒤에 첫 번째 오류 칸으로 이동한다.
        window.setTimeout(() => {
          const first = rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
          if (!first) return;
          // scrollIntoView는 바깥 틀까지 밀어 올려 화면이 틀어지므로, 탭 본문 스크롤만 직접 옮긴다.
          const scroller = first.closest<HTMLElement>(".page-subview-body");
          if (scroller) {
            const offset = first.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
            scroller.scrollTop += offset - scroller.clientHeight / 2;
          }
          first.focus({ preventScroll: true });
        }, 0);
        return false;
      },
    }),
    [form],
  );

  const handleSaveLimit = (kind: LimitModalKind) => {
    setLimitModal(null);
    toast.success(`${LIMIT_MODAL_PRESETS[kind].title.replace(" 관리", "")} 정보가 저장되었습니다.`);
  };

  const isInvalid = (key: FieldKey) => (errors[key] ? "negative" : "default");

  return (
    <TabPanel value="basic" forceMount className="page-subview-body">
      <div ref={rootRef} className="flex-col gap-16">
        {/* 1. 기본 정보 */}
        <div className={styles.body}>
          <div className={`row-center gap-8 ${styles.title}`}>
            <Icon path={mdiListBoxOutline} size={22} />
            <span className="text-subtitle2">기본 정보</span>
          </div>

          <div className={styles.content}>
            <div className={styles.layoutBox}>
              <FormField label="발행처" required error={errors.publisher}>
                {(control) => (
                  <Select
                    {...control}
                    options={PUBLISHER_OPTIONS}
                    placeholder="발행처를 선택해 주세요."
                    value={form.publisher}
                    status={isInvalid("publisher")}
                    onValueChange={(value) => update("publisher", value)}
                  />
                )}
              </FormField>

              <FormField label="상품권명" required error={errors.voucherName}>
                {(control) => (
                  <TextInput
                    {...control}
                    placeholder="상품권명을 입력해 주세요."
                    maxLength={50}
                    value={form.voucherName}
                    status={isInvalid("voucherName")}
                    onChange={(event) => update("voucherName", event.target.value)}
                  />
                )}
              </FormField>

              <FormField label="구분" required>
                {(control) => (
                  <RadioGroup
                    aria-labelledby={control["aria-labelledby"]}
                    direction="horizontal"
                    options={CATEGORY_OPTIONS}
                    value={form.category}
                    onChange={(value) => update("category", value)}
                  />
                )}
              </FormField>

              <FormField label="기본 속성">
                {(control) => (
                  <CheckboxGroup
                    aria-labelledby={control["aria-labelledby"]}
                    direction="horizontal"
                    options={BASIC_ATTRIBUTE_OPTIONS}
                    value={form.basicAttributes}
                    onChange={(value) => update("basicAttributes", value)}
                  />
                )}
              </FormField>

              <FormField label="앱 표출" required full error={errors.appDisplayName}>
                {(control) => (
                  <div className="row-center gap-8">
                    <Select
                      {...control}
                      aria-invalid={undefined}
                      options={APP_DISPLAY_TYPE_OPTIONS}
                      value={form.appDisplayType}
                      onValueChange={(value) => update("appDisplayType", value)}
                      style={{ width: 200, flexShrink: 0 }}
                    />
                    <TextInput
                      aria-label="앱 표출 상품권명"
                      aria-invalid={control["aria-invalid"]}
                      aria-describedby={control["aria-describedby"]}
                      className="table-item-value"
                      placeholder="앱에 표출할 상품권명을 입력해 주세요. (12자 내외 권고, 최대 50자)"
                      maxLength={50}
                      disabled={form.appDisplayType === "1"}
                      value={form.appDisplayType === "1" ? form.voucherName : form.appDisplayName}
                      status={isInvalid("appDisplayName")}
                      onChange={(event) => update("appDisplayName", event.target.value)}
                    />
                  </div>
                )}
              </FormField>

              <FormField label="상품권 이미지" required full error={errors.imageUrl}>
                {(control) => (
                  <div className="flex-col gap-12">
                    <div className={styles.imageWrap}>
                      <label
                        className={`${styles.imageBox} ${form.imageUrl ? styles.imageBoxFilled : ""} ${
                          errors.imageUrl ? styles.imageBoxError : ""
                        }`}>
                        <input
                          {...control}
                          ref={imageInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          className={styles.imageInput}
                          onChange={handleImageChange}
                        />
                        {form.imageUrl ? (
                          <img src={form.imageUrl} alt="올린 상품권 이미지 미리보기" className={styles.imagePreview} />
                        ) : (
                          <>
                            <Icon path={mdiImagePlusOutline} size={24} />
                            <span className="text-caption1">이미지 업로드</span>
                          </>
                        )}
                      </label>
                      {form.imageUrl && (
                        <button type="button" className={styles.imageRemoveBtn} aria-label="이미지 삭제" onClick={removeImage}>
                          <Icon path={mdiClose} size={18} />
                        </button>
                      )}
                    </div>

                    <ul className={`text-caption1 text-color-secondary ${styles.imageInfoList}`}>
                      <li>권장 크기: 100 x 100px</li>
                      <li>JPG, PNG, GIF 포맷 지원 / 최대 1MB</li>
                    </ul>
                  </div>
                )}
              </FormField>

              <FormField label="상품권 설명" required error={errors.voucherDescription}>
                {(control) => (
                  <TextInput
                    {...control}
                    placeholder="상품권 한 줄 설명을 입력해 주세요."
                    value={form.voucherDescription}
                    status={isInvalid("voucherDescription")}
                    onChange={(event) => update("voucherDescription", event.target.value)}
                  />
                )}
              </FormField>

              <FormField label="사용처 설명" required error={errors.usageDescription}>
                {(control) => (
                  <TextInput
                    {...control}
                    placeholder="사용처 한 줄 설명을 입력해 주세요."
                    value={form.usageDescription}
                    status={isInvalid("usageDescription")}
                    onChange={(event) => update("usageDescription", event.target.value)}
                  />
                )}
              </FormField>

              <FormField label="유효기간" required>
                {(control) => (
                  <div className="row-center gap-8">
                    <Select
                      {...control}
                      options={VALIDITY_TYPE_OPTIONS}
                      value={form.validityType}
                      onValueChange={(value) => update("validityType", value)}
                      style={{ flex: 1 }}
                    />
                    <Select
                      aria-label="유효기간 길이"
                      options={VALIDITY_PERIOD_OPTIONS}
                      value={form.validityPeriod}
                      onValueChange={(value) => update("validityPeriod", value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                )}
              </FormField>

              <FormField label="PIN 등록 유효기간" required>
                {(control) => (
                  <Select
                    {...control}
                    options={PIN_VALIDITY_OPTIONS}
                    value={form.pinValidityPeriod}
                    onValueChange={(value) => update("pinValidityPeriod", value)}
                  />
                )}
              </FormField>

              <FormField label="문의처 전화번호" required error={errors.contactPhone}>
                {(control) => (
                  <TextInput
                    {...control}
                    inputMode="numeric"
                    placeholder="문의처 전화번호를 입력해 주세요. (숫자만 입력)"
                    maxLength={11}
                    value={form.contactPhone}
                    status={isInvalid("contactPhone")}
                    onChange={(event) => update("contactPhone", onlyDigits(event.target.value))}
                  />
                )}
              </FormField>
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
              <FormField label="연 발행한도">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="amount"
                      unit="천원"
                      control={control}
                      placeholder="연 발행한도를 입력해 주세요. (숫자만 입력)"
                      value={form.annualIssuanceLimit}
                      onChange={(value) => update("annualIssuanceLimit", value)}
                    />
                    <Button variant="outlined" onClick={() => setLimitModal("annualIssuance")} label="한도 관리" />
                  </div>
                )}
              </FormField>

              <FormField label="연 할인판매한도">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="amount"
                      unit="천원"
                      control={control}
                      placeholder="연 할인판매한도를 입력해 주세요. (숫자만 입력)"
                      value={form.annualDiscountLimit}
                      onChange={(value) => update("annualDiscountLimit", value)}
                    />
                    <Button variant="outlined" onClick={() => setLimitModal("annualDiscount")} label="한도 관리" />
                  </div>
                )}
              </FormField>

              <FormField label="보유한도">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="amount"
                      unit="천원"
                      control={control}
                      placeholder="보유한도를 입력해 주세요. (숫자만 입력)"
                      value={form.holdingLimit}
                      onChange={(value) => update("holdingLimit", value)}
                    />
                  </div>
                )}
              </FormField>

              <FormField
                label={
                  <>
                    개인정가구매
                    <br />
                    가능 여부
                  </>
                }>
                {(control) => (
                  <RadioGroup
                    aria-labelledby={control["aria-labelledby"]}
                    direction="horizontal"
                    options={YES_NO_OPTIONS}
                    value={form.personalPurchaseAvailable}
                    onChange={(value) => update("personalPurchaseAvailable", value)}
                  />
                )}
              </FormField>

              <FormField label="월 구매한도">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="amount"
                      unit="천원"
                      control={control}
                      placeholder="월 구매한도를 입력해 주세요. (숫자만 입력)"
                      value={form.monthlyPurchaseLimit}
                      onChange={(value) => update("monthlyPurchaseLimit", value)}
                    />
                  </div>
                )}
              </FormField>

              <FormField
                label={
                  <>
                    전액 인출 시
                    <br />
                    지원금 차감 여부
                  </>
                }>
                {(control) => (
                  <RadioGroup
                    aria-labelledby={control["aria-labelledby"]}
                    direction="horizontal"
                    options={YES_NO_OPTIONS}
                    value={form.fullWithdrawSubsidyDeduction}
                    onChange={(value) => update("fullWithdrawSubsidyDeduction", value)}
                  />
                )}
              </FormField>

              <FormField label="월 할인구매한도">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="amount"
                      unit="천원"
                      control={control}
                      placeholder="월 할인구매한도를 입력해 주세요. (숫자만 입력)"
                      value={form.monthlyDiscountPurchaseLimit}
                      onChange={(value) => update("monthlyDiscountPurchaseLimit", value)}
                    />
                    <Button variant="outlined" onClick={() => setLimitModal("monthlyDiscountPurchase")} label="한도 관리" />
                  </div>
                )}
              </FormField>

              <FormField label="구매 할인율">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="rate"
                      unit="%"
                      control={control}
                      placeholder="구매 할인율을 입력해 주세요. (숫자만 입력)"
                      value={form.purchaseDiscountRate}
                      onChange={(value) => update("purchaseDiscountRate", value)}
                    />
                  </div>
                )}
              </FormField>

              <FormField label="기본 월 정산한도">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="amount"
                      unit="천원"
                      control={control}
                      placeholder="기본 월 정산한도를 입력해 주세요. (숫자만 입력)"
                      value={form.defaultMonthlySettlementLimit}
                      onChange={(value) => update("defaultMonthlySettlementLimit", value)}
                    />
                  </div>
                )}
              </FormField>

              <FormField label="구매취소 가능기간">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="days"
                      unit="일"
                      control={control}
                      placeholder="구매취소 가능기간을 입력해 주세요. (숫자만 입력)"
                      value={form.purchaseCancelPeriod}
                      onChange={(value) => update("purchaseCancelPeriod", value)}
                    />
                    <Button variant="outlined" onClick={() => setLimitModal("purchaseCancelPeriod")} label="기간 관리" />
                  </div>
                )}
              </FormField>

              <FormField label="월 선물 등록한도" full>
                {(control) => (
                  <div className="row-center gap-8">
                    <Select
                      {...control}
                      options={GIFT_LIMIT_TYPE_OPTIONS}
                      value={form.monthlyGiftLimitType}
                      onValueChange={(value) => update("monthlyGiftLimitType", value)}
                      style={{ width: 200, flexShrink: 0 }}
                    />
                    {form.monthlyGiftLimitType === "1" ? (
                      <>
                        <NumberInput
                          kind="amount"
                          unit="천원"
                          control={{ "aria-labelledby": control["aria-labelledby"] }}
                          placeholder="개인 선물 한도 (숫자만 입력)"
                          value={form.personalGiftLimit}
                          onChange={(value) => update("personalGiftLimit", value)}
                        />
                        <NumberInput
                          kind="amount"
                          unit="천원"
                          control={{ "aria-labelledby": control["aria-labelledby"] }}
                          placeholder="법인 선물 한도 (숫자만 입력)"
                          value={form.corporateGiftLimit}
                          onChange={(value) => update("corporateGiftLimit", value)}
                        />
                      </>
                    ) : (
                      <NumberInput
                        kind="amount"
                        unit="천원"
                        control={{ "aria-labelledby": control["aria-labelledby"] }}
                        placeholder="개인/법인 선물 한도 (숫자만 입력)"
                        value={form.unifiedGiftLimit}
                        onChange={(value) => update("unifiedGiftLimit", value)}
                      />
                    )}
                  </div>
                )}
              </FormField>
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
              <FormField label="액면가 1만원 초과 시">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="rate"
                      unit="%"
                      control={control}
                      placeholder="환불기준 사용률을 입력해 주세요. (숫자만 입력)"
                      value={form.refundRateOver10k}
                      onChange={(value) => update("refundRateOver10k", value)}
                    />
                  </div>
                )}
              </FormField>

              <FormField label="액면가 1만원 이하 시">
                {(control) => (
                  <div className="row-center gap-8">
                    <NumberInput
                      kind="rate"
                      unit="%"
                      control={control}
                      placeholder="환불기준 사용률을 입력해 주세요. (숫자만 입력)"
                      value={form.refundRateUnder10k}
                      onChange={(value) => update("refundRateUnder10k", value)}
                    />
                  </div>
                )}
              </FormField>
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
              {(
                [
                  ["코드 1", "merchantFeeCode1"],
                  ["코드 2", "merchantFeeCode2"],
                  ["코드 3", "merchantFeeCode3"],
                  ["코드 4", "merchantFeeCode4"],
                  ["코드 (n)", "merchantFeeCodeN"],
                ] as const
              ).map(([label, key]) => (
                <FormField key={key} label={label}>
                  {(control) => (
                    <div className="row-center gap-8">
                      <NumberInput
                        kind="rate"
                        unit="%"
                        control={control}
                        placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                        value={form[key]}
                        onChange={(value) => update(key, value)}
                      />
                    </div>
                  )}
                </FormField>
              ))}
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
              {(
                [
                  ["구매환불 수수료", "purchaseRefundFee"],
                  ["만료환불 수수료", "expireRefundFee"],
                  ["전액인출 수수료", "fullWithdrawFee"],
                  ["플랫폼 운영 수수료 (시스템 운영사)", "systemOperatorFee"],
                  ["판매 수수료", "salesFee"],
                  ["플랫폼 운영 수수료 (플랫폼 운영기관)", "platformOperatorFee"],
                ] as const
              ).map(([label, key]) => (
                <FormField key={key} label={label}>
                  {(control) => (
                    <div className="row-center gap-8">
                      <NumberInput
                        kind="rate"
                        unit="%"
                        control={control}
                        placeholder="수수료를 입력해 주세요. (숫자만 입력)"
                        value={form[key]}
                        onChange={(value) => update(key, value)}
                      />
                    </div>
                  )}
                </FormField>
              ))}
            </div>
          </div>
        </div>
      </div>

      <LimitHistoryModal kind={limitModal} onClose={() => setLimitModal(null)} onSave={handleSaveLimit} />
    </TabPanel>
  );
});

export default BasicInfoPannel;
