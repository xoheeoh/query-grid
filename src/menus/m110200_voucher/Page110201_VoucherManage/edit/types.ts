export type EditPanelHandle = {
  reset: () => void;
};

/** 판매처별 한도 (샘플용) */
export type VoucherEditChannelLimit = {
  saleLimit: string;
  discountLimit: string;
};

/** 목록 행에서 수정 화면으로 넘기는 초기값 (샘플 더미 포함) */
export type VoucherEditInitialData = {
  id: number;
  publisher: string;
  seller: string;
  voucherName: string;
  annualIssuanceLimit: number;
  annualDiscountLimit: number;
  authKey: string;

  /** 구분: 1 정책발행 / 2 소비쿠폰 */
  category: string;
  /** 기본 속성: 1 개인구매불가 / 2 개인선물불가 */
  basicAttributes: string[];
  gmapDisplayType: string;
  gmapDisplayName: string;
  voucherDescription: string;
  usageDescription: string;
  validityType: string;
  validityPeriod: string;
  pinValidityPeriod: string;
  contactPhone: string;

  /** 입금사업비 (원) */
  depositBusinessFund: string;
  /** 잔여사업비 (원) */
  remainingBusinessFund: string;

  holdingLimit: string;
  /** 개인정가구매: on / off */
  personalPurchaseAvailable: string;
  monthlyPurchaseLimit: string;
  /** 전액 인출 시 지원금 차감: on / off */
  fullWithdrawSubsidyDeduction: string;
  monthlyDiscountPurchaseLimit: string;
  purchaseDiscountRate: string;
  defaultMonthlySettlementLimit: string;
  purchaseCancelPeriod: string;
  /** 월 선물 등록한도: 1 개별 / 2 통합 */
  monthlyGiftLimitType: string;
  personalGiftLimit: string;
  corporateGiftLimit: string;
  unifiedGiftLimit: string;

  refundRateOver10k: string;
  refundRateUnder10k: string;

  merchantFeeCode1: string;
  merchantFeeCode2: string;
  merchantFeeCode3: string;
  merchantFeeCode4: string;
  merchantFeeCodeN: string;

  purchaseRefundFee: string;
  expireRefundFee: string;
  fullWithdrawFee: string;
  platformOpFeeKis: string;
  salesFee: string;
  platformOpFeeHangyeolwon: string;

  /** 판매처 채널 id → 한도 */
  channelLimits: Record<string, VoucherEditChannelLimit>;
  merchantCategory: string;
  merchantPostCode: string;
  merchantSale: string;
  merchantCorporation: string;
};
