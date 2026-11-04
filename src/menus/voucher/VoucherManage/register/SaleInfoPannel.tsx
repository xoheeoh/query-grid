import { Fragment, forwardRef, useImperativeHandle, useState, type ChangeEvent, type ReactNode } from "react";
import { Banner, Button, Checkbox, CheckboxGroup, Icon, TextInput, Select, TabPanel, Tooltip } from "@xoheeoh/components";
import { mdiHelpCircleOutline, mdiStorefrontCheckOutline, mdiStoreMarkerOutline } from "@mdi/js";
import { formatThousandInput } from "@utils";
import { FormField } from "../FormField";
import { SELLER_OPTIONS, type Option } from "../voucherOptions";
import type { RegisterPanelHandle } from "./types";
import styles from "../VoucherManagePanel.module.css";

/** 판매처 지정 관련 */
type SaleChannelId = string;
type ChannelLimits = Record<SaleChannelId, { saleLimit: string; discountLimit: string }>;

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
const SALES_OPTIONS: Option[] = [
  { value: "none", label: "매출 제한 없음" },
  { value: "except", label: "특정 매출구간 가맹점만 불가" },
  { value: "use", label: "지정 카테고리 가능 매출 설정" },
];
const CORPORATION_OPTIONS: Option[] = [
  { value: "none", label: "법인 제한 없음" },
  { value: "except", label: "지정 법인 제외" },
];
const SALES_CODE_OPTIONS: Option[] = ["A", "B", "C", "D", "E", "F", "G", "H"].map((code) => ({ value: code, label: code }));

const SALES_RANGE_ROWS = [
  [
    { code: "Z", range: "0원" },
    { code: "E", range: "30억 초과 ~ 50억 이하" },
  ],
  [
    { code: "A", range: "1원 초과 ~ 8억 이하" },
    { code: "F", range: "50억 초과 ~ 80억 이하" },
  ],
  [
    { code: "B", range: "8억 초과 ~ 10억 이하" },
    { code: "G", range: "80억 초과 ~ 120억 이하" },
  ],
  [
    { code: "C", range: "10억 초과 ~ 12억 이하" },
    { code: "H", range: "120억 초과" },
  ],
  [{ code: "D", range: "12억 초과 ~ 30억 이하" }],
] as const;

/** "추가"로 늘어나는 입력 줄 하나 */
type RuleRow = { id: number; value: string; codes: string[] };
/** 가맹점 조건 한 항목: 방식(드롭다운) + 추가한 줄들 */
type RuleState = { mode: string; rows: RuleRow[] };

type SaleForm = {
  selectedChannels: SaleChannelId[];
  limits: ChannelLimits;
  category: RuleState;
  postCode: RuleState;
  sale: RuleState;
  corporation: RuleState;
};

const INITIAL_FORM: SaleForm = {
  selectedChannels: [],
  limits: EMPTY_LIMITS,
  category: { mode: "all", rows: [] },
  postCode: { mode: "all", rows: [] },
  sale: { mode: "none", rows: [] },
  corporation: { mode: "none", rows: [] },
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
  /** 매출 조건은 줄마다 매출구간 코드도 고른다. */
  withSalesCodes?: boolean;
};

/** 사용 가맹점 조건 한 항목. "추가"를 누를 때마다 입력 줄이 늘고, 줄마다 "삭제"가 있다. */
function MerchantRuleSection({ label, name, options, noneValue, rule, onChange, placeholder, withSalesCodes }: MerchantRuleSectionProps) {
  const disabled = rule.mode === noneValue;

  const addRow = () => {
    onChange({ ...rule, rows: [...rule.rows, { id: ++ruleRowSeq, value: "", codes: [] }] });
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
                {withSalesCodes && (
                  <CheckboxGroup
                    aria-label={`${name} ${index + 1} 매출구간 코드`}
                    direction="horizontal"
                    style={{ paddingRight: 12 }}
                    options={SALES_CODE_OPTIONS}
                    value={row.codes}
                    onChange={(codes) => updateRow(row.id, { codes })}
                  />
                )}
              </div>
              <Button variant="outlined" color="destructive" onClick={() => removeRow(row.id)} label="삭제" />
            </div>
          ))}
        </div>
      )}
    </FormField>
  );
}

export const SaleInfoPannel = forwardRef<RegisterPanelHandle>(function SaleInfoPannel(_, ref) {
  const [form, setForm] = useState<SaleForm>(INITIAL_FORM);

  const update = <K extends keyof SaleForm>(key: K, value: SaleForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useImperativeHandle(
    ref,
    () => ({
      reset: () => setForm(INITIAL_FORM),
      // 판매/사용 정보에는 필수값이 없다.
      validate: () => true,
      isDirty: () => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM),
    }),
    [form],
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

          <MerchantRuleSection
            label={
              <span className="row-center gap-4">
                매출
                <Tooltip
                  position="bottom"
                  arrow="vertical"
                  content={
                    <table className={styles.salesRangeTable}>
                      <thead>
                        <tr>
                          <th>코드</th>
                          <th>매출액 범위</th>
                          <th>코드</th>
                          <th>매출액 범위</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SALES_RANGE_ROWS.map((row) => (
                          <tr key={row.map((cell) => cell.code).join("-")}>
                            {row.map((cell) => (
                              <Fragment key={cell.code}>
                                <td>{cell.code}</td>
                                <td>{cell.range}</td>
                              </Fragment>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  }>
                  <Icon path={mdiHelpCircleOutline} size={16} />
                </Tooltip>
              </span>
            }
            name="매출 업종코드"
            options={SALES_OPTIONS}
            noneValue="none"
            rule={form.sale}
            onChange={(rule) => update("sale", rule)}
            placeholder="업종코드를 입력해 주세요."
            withSalesCodes
          />

          <MerchantRuleSection
            label="법인"
            name="법인번호"
            options={CORPORATION_OPTIONS}
            noneValue="none"
            rule={form.corporation}
            onChange={(rule) => update("corporation", rule)}
            placeholder="법인번호를 입력해 주세요."
          />
        </div>
      </div>
    </TabPanel>
  );
});

export default SaleInfoPannel;
