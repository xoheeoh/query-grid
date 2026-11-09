/** 대시보드가 쓰는 숫자들. 고객 지갑 예시 데이터에서 뽑을 수 있는 건 뽑고, 나머지는 데모용 값으로 만든다. */
import { MOCK_WALLET_ROWS, getWalletDetail } from "../wallet/walletData";

/** 하루치 충전·사용 금액 (원) */
export type DailyAmount = {
  /** yyyyMMdd */
  date: string;
  charge: number;
  use: number;
};

/** 같은 입력이면 늘 같은 결과를 내는 간단한 난수 */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function toDateKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/** 오늘까지 최근 N일의 충전·사용 금액. 주말은 조금 낮게, 월말은 충전이 높게 만든다. */
export function buildDailySeries(days = 30, today = new Date()): DailyAmount[] {
  const random = seeded(2026);
  const series: DailyAmount[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const monthEnd = date.getDate() >= 28;
    // 고객 20명 규모(총 잔액 수백만 원)에 맞춘 하루 금액이다.
    const chargeBase = (weekend ? 620_000 : 980_000) + (monthEnd ? 300_000 : 0);
    const useBase = weekend ? 840_000 : 730_000;
    series.push({
      date: toDateKey(date),
      charge: Math.round((chargeBase * (0.75 + random() * 0.5)) / 10_000) * 10_000,
      use: Math.round((useBase * (0.75 + random() * 0.5)) / 10_000) * 10_000,
    });
  }
  return series;
}

export const DAILY_SERIES = buildDailySeries();

const today = DAILY_SERIES[DAILY_SERIES.length - 1]!;
const yesterday = DAILY_SERIES[DAILY_SERIES.length - 2]!;

/** 어제 대비 변화율(%). 어제가 0이면 0으로 둔다. */
function changeRate(current: number, previous: number) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export const KPI = {
  todayCharge: today.charge,
  todayChargeChange: changeRate(today.charge, yesterday.charge),
  todayUse: today.use,
  todayUseChange: changeRate(today.use, yesterday.use),
  totalBalance: MOCK_WALLET_ROWS.reduce((sum, row) => sum + row.totalBalance, 0),
  activeWallets: MOCK_WALLET_ROWS.filter((row) => row.status === "active").length,
  suspendedWallets: MOCK_WALLET_ROWS.filter((row) => row.status === "suspended").length,
  closedWallets: MOCK_WALLET_ROWS.filter((row) => row.status === "closed").length,
};

/** 상품권별 잔액 합과 비중. 잔액이 큰 순서 */
export type VoucherBalance = { voucherName: string; balance: number; share: number };

export const VOUCHER_BALANCES: VoucherBalance[] = (() => {
  const totals = new Map<string, number>();
  for (const row of MOCK_WALLET_ROWS) {
    for (const voucher of getWalletDetail(row.id)?.vouchers ?? []) {
      totals.set(voucher.voucherName, (totals.get(voucher.voucherName) ?? 0) + voucher.balance);
    }
  }
  const grandTotal = [...totals.values()].reduce((sum, value) => sum + value, 0);
  return [...totals.entries()]
    .map(([voucherName, balance]) => ({ voucherName, balance, share: grandTotal ? (balance / grandTotal) * 100 : 0 }))
    .sort((a, b) => b.balance - a.balance);
})();

/** 관리자가 손대야 하는 것들. 수기처리 건수와 만료 예정 잔액은 데모용 값이다. */
export const PENDING = {
  manualConfirming: 3,
  suspendedWallets: KPI.suspendedWallets,
  expiringBalance: 1_240_000,
};
