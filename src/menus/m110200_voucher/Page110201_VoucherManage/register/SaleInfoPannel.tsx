import { ChangeEvent, Fragment, forwardRef, useImperativeHandle, useState } from "react";
import { Banner, Button, Checkbox, CheckboxGroup, Icon, TextInput, Select, TabPanel, Tooltip } from "@xoheeoh/components";
import { mdiHelpCircleOutline, mdiStorefrontCheckOutline, mdiStoreMarkerOutline } from "@mdi/js";
import { formatThousandInput } from "@utils";
import type { RegisterPanelHandle } from "./types";
import styles from "../VoucherManagePanel.module.css";

/** 판매처 지정 관련 */
const SALE_CHANNELS = [
  { id: "kb", name: "국민은행" },
  { id: "shinhan", name: "신한은행" },
  { id: "nh", name: "농협은행" },
  { id: "kakao", name: "카카오뱅크" },
] as const;

const EMPTY_LIMITS = Object.fromEntries(
  SALE_CHANNELS.map((ch) => [ch.id, { saleLimit: "", discountLimit: "" }])
) as ChannelLimits;

type SaleChannelId = (typeof SALE_CHANNELS)[number]["id"];
type ChannelLimits = Record<SaleChannelId, { saleLimit: string; discountLimit: string }>;

/** 사용 가맹점 관련 */
const CATEGORIES = [
  { id: "all", name: "전체 가맹점" },
  { id: "except", name: "특정 카테고리 제외" },
  { id: "use", name: "특정 카테고리 사용" },
];
const POST_CODES = [
  { id: "all", name: "전체 지역" },
  { id: "target", name: "지정 우편번호" },
];
const SALES = [
  { id: "none", name: "매출 제한 없음" },
  {
    id: "except",
    name: "특정 매출구간 가맹점만 불가",
  },
  { id: "use", name: "지정 카테고리 가능 매출 설정" },
];
const CORPORATIONS = [
  { id: "none", name: "법인 제한 없음" },
  {
    id: "except",
    name: "지정 법인 제외",
  },
];

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

export const SaleInfoPannel = forwardRef<RegisterPanelHandle>(function SaleInfoPannel(_, ref) {
  /** 판매처 지정 관련 */
  const [selectedChannels, setSelectedChannels] = useState<SaleChannelId[]>([]);
  const [limits, setLimits] = useState<ChannelLimits>(EMPTY_LIMITS);

  const allSelected = SALE_CHANNELS.every((ch) => selectedChannels.includes(ch.id));
  const someSelected = selectedChannels.length > 0 && !allSelected;

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedChannels(event.target.checked ? SALE_CHANNELS.map((ch) => ch.id) : []);
  };

  const handleSelectChannel = (id: SaleChannelId) => (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedChannels((prev) => (event.target.checked ? [...prev, id] : prev.filter((v) => v !== id)));
  };

  const handleLimitChange =
    (id: SaleChannelId, field: "saleLimit" | "discountLimit") => (event: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatThousandInput(event.target.value);
      setLimits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: formatted } }));
    };

  /** 사용 가맹점 관련 */
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPostCode, setSelectedPostCode] = useState<string>("all");
  const [selectedSale, setSelectedSale] = useState<string>("none");
  const [selectedCorporation, setSelectedCorporation] = useState<string>("none");

  const [addCategoryVisible, setAddCategoryVisible] = useState(false);
  const [addPostCodeVisible, setAddPostCodeVisible] = useState(false);
  const [addSaleVisible, setAddSaleVisible] = useState(false);
  const [addCorporationVisible, setAddCorporationVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelectedChannels([]);
      setLimits(EMPTY_LIMITS);
      setSelectedCategory("all");
      setSelectedPostCode("all");
      setSelectedSale("none");
      setSelectedCorporation("none");
      setAddCategoryVisible(false);
      setAddPostCodeVisible(false);
      setAddSaleVisible(false);
      setAddCorporationVisible(false);
    },
  }));

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
              {SALE_CHANNELS.map((channel) => {
                const checked = selectedChannels.includes(channel.id);
                const channelLimits = limits[channel.id];
                return (
                  <tr key={channel.id}>
                    <td>
                      <Checkbox
                        aria-label={`${channel.name} 선택`}
                        checked={checked}
                        onChange={handleSelectChannel(channel.id)}
                      />
                    </td>
                    <td>{channel.name}</td>
                    <td>
                      <div className={styles.inputBox}>
                        <TextInput
                          placeholder="금액을 입력해 주세요."
                          className="table-item-value"
                          align="right"
                          inputMode="numeric"
                          disabled={!checked}
                          value={channelLimits.saleLimit}
                          onChange={handleLimitChange(channel.id, "saleLimit")}
                        />
                        <span className="text-body2">천원</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.inputBox}>
                        <TextInput
                          placeholder="금액을 입력해 주세요."
                          className="table-item-value"
                          align="right"
                          inputMode="numeric"
                          disabled={!checked}
                          value={channelLimits.discountLimit}
                          onChange={handleLimitChange(channel.id, "discountLimit")}
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
          <div className={styles.tableItem}>
            <span className="text-body2 table-item-label">카테고리</span>

            <div className={styles.tableItemInBox}>
              <div className={styles.tableItem}>
                <div className="table-item-value">
                  <Select
                    options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      if (value === "all") setAddCategoryVisible(false);
                    }}
                  />
                </div>

                <Button
 variant="outlined"
 disabled={selectedCategory === "all"}
 onClick={() => setAddCategoryVisible(true)} label="추가" />
              </div>

              {addCategoryVisible && (
                <div className={styles.tableItem}>
                  <div className="table-item-value">
                    <TextInput placeholder="업종코드를 입력해 주세요." />
                  </div>

                  <Button variant="outlined" color="destructive" onClick={() => setAddCategoryVisible(false)} label="삭제" />
                </div>
              )}
            </div>
          </div>

          <div className={styles.tableItem}>
            <span className="text-body2 table-item-label">우편번호</span>

            <div className={styles.tableItemInBox}>
              <div className={styles.tableItem}>
                <div className="table-item-value">
                  <Select
                    options={POST_CODES.map((c) => ({ value: c.id, label: c.name }))}
                    value={selectedPostCode}
                    onValueChange={(value) => {
                      setSelectedPostCode(value);
                      if (value === "all") setAddPostCodeVisible(false);
                    }}
                  />
                </div>

                <Button
 variant="outlined"
 disabled={selectedPostCode === "all"}
 onClick={() => setAddPostCodeVisible(true)} label="추가" />
              </div>

              {addPostCodeVisible && (
                <div className={styles.tableItem}>
                  <div className="table-item-value">
                    <TextInput placeholder="우편번호를 입력해 주세요." />
                  </div>

                  <Button variant="outlined" color="destructive" onClick={() => setAddPostCodeVisible(false)} label="삭제" />
                </div>
              )}
            </div>
          </div>

          <div className={styles.tableItem}>
            <span className="text-body2 table-item-label row-center gap-4">
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

            <div className={styles.tableItemInBox}>
              <div className={styles.tableItem}>
                <div className="table-item-value">
                  <Select
                    options={SALES.map((c) => ({ value: c.id, label: c.name }))}
                    value={selectedSale}
                    onValueChange={(value) => {
                      setSelectedSale(value);
                      if (value === "none") setAddSaleVisible(false);
                    }}
                  />
                </div>

                <Button
 variant="outlined"
 disabled={selectedSale === "none"}
 onClick={() => setAddSaleVisible(true)} label="추가" />
              </div>

              {addSaleVisible && (
                <div className={styles.tableItem}>
                  <div className="row-center gap-8 table-item-value">
                    <div className="table-item-value">
                      <TextInput placeholder="업종코드를 입력해 주세요." />
                    </div>

                    <CheckboxGroup direction="horizontal" style={{ paddingRight: 12 }} options={[{ value: "A", label: "A" }, { value: "B", label: "B" }, { value: "C", label: "C" }, { value: "D", label: "D" }, { value: "E", label: "E" }, { value: "F", label: "F" }, { value: "G", label: "G" }, { value: "H", label: "H" }]} />
                  </div>

                  <Button variant="outlined" color="destructive" onClick={() => setAddSaleVisible(false)} label="삭제" />
                </div>
              )}
            </div>
          </div>

          <div className={styles.tableItem}>
            <span className="text-body2 table-item-label">법인</span>

            <div className={styles.tableItemInBox}>
              <div className={styles.tableItem}>
                <div className="table-item-value">
                  <Select
                    options={CORPORATIONS.map((c) => ({ value: c.id, label: c.name }))}
                    value={selectedCorporation}
                    onValueChange={(value) => {
                      setSelectedCorporation(value);
                      if (value === "none") setAddCorporationVisible(false);
                    }}
                  />
                </div>

                <Button
 variant="outlined"
 disabled={selectedCorporation === "none"}
 onClick={() => setAddCorporationVisible(true)} label="추가" />
              </div>

              {addCorporationVisible && (
                <div className={styles.tableItem}>
                  <div className="table-item-value">
                    <TextInput placeholder="법인번호를 입력해 주세요." />
                  </div>

                  <Button variant="outlined" color="destructive" onClick={() => setAddCorporationVisible(false)} label="삭제" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TabPanel>
  );
});

export default SaleInfoPannel;
