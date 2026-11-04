/** 상품권 관리 목록·등록·수정 화면이 같이 쓰는 선택지 목록이다. 값은 전부 데모용 예시다. */

export type Option = { value: string; label: string };

/** 발행처 (상품권을 발행하는 기관) */
export const PUBLISHER_OPTIONS: Option[] = [
  { value: "mss", label: "중소벤처기업부" },
  { value: "seoul", label: "서울특별시" },
  { value: "gimpo", label: "김포시" },
  { value: "gyeonggi", label: "경기도" },
  { value: "busan", label: "부산광역시" },
  { value: "jeonnam", label: "전라남도" },
];

/** 판매처 (상품권을 파는 은행·앱) */
export const SELLER_OPTIONS: Option[] = [
  { value: "ganada", label: "가나다은행" },
  { value: "ramaba", label: "라마바은행" },
  { value: "saaja", label: "사아자페이" },
  { value: "platform", label: "플랫폼 운영기관" },
];

/** 상품권 상태 코드와 표시 이름. 목록 필터와 표 배지가 같은 이름을 쓴다. */
export const STATUS_CODES = ["1", "2", "3", "4"] as const;
export type StatusCode = (typeof STATUS_CODES)[number];
export const STATUS_LABEL: Record<StatusCode, string> = {
  "1": "개인구매가능",
  "2": "대량구매가능",
  "3": "개인구매중지",
  "4": "대량구매중지",
};
export const STATUS_OPTIONS: Option[] = STATUS_CODES.map((code) => ({ value: code, label: STATUS_LABEL[code] }));

export const CATEGORY_OPTIONS: Option[] = [
  { value: "1", label: "정책발행" },
  { value: "2", label: "소비쿠폰" },
];

export const BASIC_ATTRIBUTE_OPTIONS: Option[] = [
  { value: "1", label: "개인구매불가" },
  { value: "2", label: "개인선물불가" },
];

/** 앱에 보여줄 이름을 상품권명 그대로 쓸지, 따로 정할지 */
export const APP_DISPLAY_TYPE_OPTIONS: Option[] = [
  { value: "1", label: "상품권명 그대로" },
  { value: "2", label: "별도 명칭 사용" },
];

export const VALIDITY_TYPE_OPTIONS: Option[] = [
  { value: "1", label: "구매일로부터" },
  { value: "2", label: "발행일로부터" },
];

export const VALIDITY_PERIOD_OPTIONS: Option[] = [
  { value: "1", label: "1년" },
  { value: "2", label: "2년" },
  { value: "3", label: "3년" },
  { value: "5", label: "5년" },
];

export const PIN_VALIDITY_OPTIONS: Option[] = [
  { value: "3", label: "3일" },
  { value: "7", label: "7일" },
  { value: "14", label: "14일" },
  { value: "30", label: "30일" },
];

export const YES_NO_OPTIONS: Option[] = [
  { value: "off", label: "N" },
  { value: "on", label: "Y" },
];

export const GIFT_LIMIT_TYPE_OPTIONS: Option[] = [
  { value: "1", label: "개별 관리" },
  { value: "2", label: "통합 관리" },
];

/** 조회 필터용으로 맨 앞에 "전체"를 붙인다. */
export function withAllOption(options: Option[]): Option[] {
  return [{ value: "all", label: "전체" }, ...options];
}

export function optionLabel(options: Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
