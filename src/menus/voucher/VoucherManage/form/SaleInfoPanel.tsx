import { forwardRef, useImperativeHandle, useState, type ChangeEvent, type ReactNode } from "react";
import { Banner, Button, Checkbox, Icon, TextInput, Select, TabPanel } from "@xoheeoh/components";
import { mdiStorefrontCheckOutline, mdiStoreMarkerOutline } from "@mdi/js";
import { formatThousandInput } from "@utils";
import { FormField } from "../../../FormField";
import { SELLER_OPTIONS, type Option } from "../voucherOptions";
import type { FormPanelHandle } from "./types";
import styles from "../VoucherManagePanel.module.css";

/** 판매처 지정 관련 */
type SaleChannelId = string;
export type ChannelLimits = Record<SaleChannelId, { saleLimit: string; discountLimit: string }>;

const EMPTY_LIMITS: ChannelLimits = Object.fromEntries(
  SELLER_OPTIONS.map((seller) => [seller.value, { saleLimit: "", discountLimit: "" }]),
);

/** 사용 가맹점 관련 */
const CATEGORY_OPTIONS: Option[] = [
  { value: "all", label: "전체 가맹점" },
  { value: "except", label: "특정 카테고리 제외" },
  { value: "use", label: "특정 카테고리 사용" },
];
const POST_CODE_OPTIONS: Option[] = [
  { value: "all", label: "전체 지역" },
  { value: "target", label: "지정 우편번호" },
];

/** "추가"로 늘어나는 입력 줄 하나 */
type RuleRow = { id: number; value: string };
/** 가맹점 조건 한 항목: 방식(드롭다운) + 추가한 줄들 */
type RuleState = { mode: string; rows: RuleRow[] };

/** 판매/사용 정보 탭의 입력값. 수정 화면은 이 모양으로 기존 값을 넘긴다. */
export type VoucherSaleValues = {
  selectedChannels: SaleChannelId[];
  limits: ChannelLimits;
  category: RuleState;
  postCode: RuleState;
};

type SaleForm = VoucherSaleValues;

const INITIAL_FORM: SaleForm = {
  selectedChannels: [],
  limits: EMPTY_LIMITS,
  category: { mode: "all", rows: [] },
  postCode: { mode: "all", rows: [] },
};

let ruleRowSeq = 0;

type MerchantRuleSectionProps = {
  /** 화면에 보이는 라벨. 도움말 아이콘 같은 걸 붙일 수 있다. */
  label: ReactNode;
  /** 화면 낭독기용 이름. "카테고리 1 삭제"처럼 쓰인다. */
  name: string;
  options: Option[];
  /** 이 값이면 "제한 없음"이라 줄을 추가할 수 없다. */
  noneValue: string;
  rule: RuleState;
  onChange: (rule: RuleState) => void;
  placeholder: string;
};

/** 사용 가맹점 조건 한 항목. "추가"를 누를 때마다 입력 줄이 늘고, 줄마다 "삭제"가 있다. */
function MerchantRuleSection({ label, name, options, noneValue, rule, onChange, placeholder }: MerchantRuleSectionProps) {
  const disabled = rule.mode === noneValue;

  const addRow = () => {
    onChange({ ...rule, rows: [...rule.rows, { id: ++ruleRowSeq, value: "" }] });
  };

  const updateRow = (id: number, patch: Partial<RuleRow>) => {
    onChange({ ...rule, rows: rule.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)) });
  };

  const removeRow = (id: number) => {
    onChange({ ...rule, rows: rule.rows.filter((row) => row.id !== id) });
  };

  return (
    <FormField label={label}>
      {(control) => (
        <div className={styles.tableItemInBox}>
          <div className={styles.tableItem}>
            <div className="table-item-value">
              <Select
                {...control}
                options={options}
                value={rule.mode}
                onValueChange={(mode) => onChange({ mode, rows: mode === noneValue ? [] : rule.rows })}
              />
            </div>
            <Button variant="outlined" disabled={disabled} onClick={addRow} label="추가" />
          </div>

          {rule.rows.map((row, index) => (
            <div key={row.id} className={styles.tableItem}>
              <div className="row-center gap-8 table-item-value">
                <div className="table-item-value">
                  <TextInput
                    aria-label={`${name} ${index + 1}`}
                    placeholder={placeholder}
                    value={row.value}
                    onChange={(event) => updateRow(row.id, { value: event.target.value })}
                  />
                </div>
              </div>
              <Button variant="outlined" color="destructive" onClick={() => removeRow(row.id)} label="삭제" />
            </div>
          ))}
        </div>
      )}
    </FormField>
  );
}

type SaleInfoPanelProps = {
  /** 수정 화면에서 넘기는 기존 값. 없으면 빈 폼으로 시작한다. */
  initialValues?: Partial<VoucherSaleValues>;
};

export const SaleInfoPanel = forwardRef<FormPanelHandle, SaleInfoPanelProps>(function SaleInfoPanel(
  { initialValues },
  ref,
) {
  // "처음 상태"는 처음 열릴 때 한 번만 정한다. 판매처별 한도는 빠진 판매처를 빈 값으로 채운다.
  const [initial] = useState<SaleForm>(() => ({
    ...INITIAL_FORM,
    ...initialValues,
    limits: { ...EMPTY_LIMITS, ...initialValues?.limits },
  }));
  const [form, setForm] = useState<SaleForm>(initial);

  const update = <K extends keyof SaleForm>(key: K, value: SaleForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useImperativeHandle(
    ref,
    () => ({
      reset: () => setForm(initial),
      // 판매/사용 정보에는 필수값이 없다.
      validate: () => true,
      isDirty: () => JSON.stringify(form) !== JSON.stringify(initial),
    }),
    [form, initial],
  );

  /** 판매처 지정 관련 */
  const allSelected = SELLER_OPTIONS.every((seller) => form.selectedChannels.includes(seller.value));
  const someSelected = form.selectedChannels.length > 0 && !allSelected;

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    update("selectedChannels", event.target.checked ? SELLER_OPTIONS.map((seller) => seller.value) : []);
  };

  const handleSelectChannel = (id: SaleChannelId) => (event: ChangeEvent<HTMLInputElement>) => {
    update(
      "selectedChannels",
      event.target.checked ? [...form.selectedChannels, id] : form.selectedChannels.filter((v) => v !== id),
    );
  };

  const handleLimitChange =
    (id: SaleChannelId, field: "saleLimit" | "discountLimit") => (event: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatThousandInput(event.target.value);
      update("limits", { ...form.limits, [id]: { ...form.limits[id], [field]: formatted } });
    };

  return (
    <TabPanel value="sale" forceMount className="page-subview-body flex-col gap-16">
      <div className={styles.body}>
        <div className={`row-center gap-8 ${styles.title}`}>
          <Icon path={mdiStorefrontCheckOutline} size={22} />
          <span className="text-subtitle2">판매처 지정</span>
        </div>

        <div className={styles.content}>
          <Banner type="info" message="체크박스 클릭 시 한도 입력이 활성화됩니다. 한도 미입력 시 무제한으로 적용됩니다." />

          <table className="table">
            <thead>
              <tr>
                <th>
                  <Checkbox
                    aria-label="판매처 전체 선택"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>판매처명</th>
                <th>연 판매한도</th>
                <th>연 할인판매한도</th>
              </tr>
            </thead>

            <tbody>
              {SELLER_OPTIONS.map((seller) => {
                const checked = form.selectedChannels.includes(seller.value);
                const channelLimits = form.limits[seller.value];
                return (
                  <tr key={seller.value}>
                    <td>
                      <Checkbox
                        aria-label={`${seller.label} 선택`}
                        checked={checked}
                        onChange={handleSelectChannel(seller.value)}
                      />
                    </td>
                    <td>{seller.label}</td>
                    <td>
                      <div className={styles.inputBox}>
                        <TextInput
                          aria-label={`${seller.label} 연 판매한도`}
                          placeholder="금액을 입력해 주세요."
                          className="table-item-value"
                          align="right"
                          inputMode="numeric"
                          disabled={!checked}
                          value={channelLimits.saleLimit}
                          onChange={handleLimitChange(seller.value, "saleLimit")}
                        />
                        <span className="text-body2">천원</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.inputBox}>
                        <TextInput
                          aria-label={`${seller.label} 연 할인판매한도`}
                          placeholder="금액을 입력해 주세요."
                          className="table-item-value"
                          align="right"
                          inputMode="numeric"
                          disabled={!checked}
                          value={channelLimits.discountLimit}
                          onChange={handleLimitChange(seller.value, "discountLimit")}
                        />
                        <span className="text-body2">천원</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.body}>
        <div className={`row-center gap-8 ${styles.title}`}>
          <Icon path={mdiStoreMarkerOutline} size={22} />
          <span className="text-subtitle2">사용 가맹점</span>
        </div>

        <div className={styles.content}>
          <MerchantRuleSection
            label="카테고리"
            name="카테고리 업종코드"
            options={CATEGORY_OPTIONS}
            noneValue="all"
            rule={form.category}
            onChange={(rule) => update("category", rule)}
            placeholder="업종코드를 입력해 주세요."
          />

          <MerchantRuleSection
            label="우편번호"
            name="우편번호"
            options={POST_CODE_OPTIONS}
            noneValue="all"
            rule={form.postCode}
            onChange={(rule) => update("postCode", rule)}
            placeholder="우편번호를 입력해 주세요."
          />
        </div>
      </div>
    </TabPanel>
  );
});

export default SaleInfoPanel;
