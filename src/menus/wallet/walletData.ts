/** 고객 지갑 화면이 쓰는 데이터 모양과 예시 데이터. API 연동 전이라 전부 코드 안에서 만든다. */

export type WalletStatus = "active" | "suspended" | "closed";

export const WALLET_STATUS_LABEL: Record<WalletStatus, string> = {
  active: "정상",
  suspended: "정지",
  closed: "해지",
};

/** 상태 배지 색. 정상은 초록, 정지는 빨강, 해지는 회색 */
export const WALLET_STATUS_BADGE: Record<WalletStatus, string> = {
  active: "status-badge-success",
  suspended: "status-badge-danger",
  closed: "status-badge-neutral",
};

export const WALLET_STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  ...(Object.keys(WALLET_STATUS_LABEL) as WalletStatus[]).map((value) => ({ value, label: WALLET_STATUS_LABEL[value] })),
];

/** 목록 한 줄 = 고객 한 명의 지갑 */
export type WalletRow = {
  id: number;
  /** 고객 앱에서 가입할 때 만든 로그인 아이디 */
  memberId: string;
  customerName: string;
  /** 가운데를 가린 휴대폰번호 */
  phone: string;
  /** 가입일. yyyyMMdd */
  joinedAt: string;
  status: WalletStatus;
  /** 잔액이 있는 상품권 종류 수 */
  voucherCount: number;
  /** 모든 상품권 잔액의 합 (원) */
  totalBalance: number;
  /** 마지막 거래일. yyyyMMdd */
  lastTradedAt: string;
};

export type WalletVoucher = {
  voucherName: string;
  balance: number;
  lastTradedAt: string;
};

export type TransactionType = "charge" | "use" | "refund";

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  charge: "충전",
  use: "사용",
  refund: "환불",
};

export const TRANSACTION_TYPE_BADGE: Record<TransactionType, string> = {
  charge: "status-badge-info",
  use: "status-badge-neutral",
  refund: "status-badge-danger",
};

export type WalletTransaction = {
  id: number;
  /** 거래 일시. yyyyMMddHHmm */
  tradedAt: string;
  type: TransactionType;
  voucherName: string;
  /** 원. 사용·환불도 양수로 두고 구분으로 방향을 나타낸다. */
  amount: number;
  balanceAfter: number;
  /** 사용이면 가맹점, 충전이면 판매처 */
  place: string;
};

const VOUCHER_NAMES = ["온누리상품권", "서울사랑상품권", "김포사랑상품권", "경기사랑상품권", "부산사랑상품권"];
const PLACES = ["가나다은행", "행복마트", "우리동네정육점", "라마바은행", "큰길약국", "사아자페이", "동네책방"];

/** 같은 입력이면 늘 같은 결과를 내는 간단한 난수. 예시 데이터가 새로고침마다 바뀌지 않게 한다. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

type Seed = [memberId: string, name: string, phoneTail: string, joinedAt: string, status: WalletStatus];

const SEEDS: Seed[] = [
  ["minjun.kim", "김민준", "1234", "20250312", "active"],
  ["seoyeon_lee", "이서연", "5678", "20250403", "active"],
  ["jiho_park", "박지호", "2468", "20241120", "active"],
  ["sua.choi", "최수아", "1357", "20250815", "suspended"],
  ["hayun_j", "정하윤", "9012", "20250127", "active"],
  ["doyun.kang", "강도윤", "3456", "20240905", "closed"],
  ["eunwoo_cho", "조은우", "7890", "20250602", "active"],
  ["seojin.yoon", "윤서진", "4321", "20250219", "active"],
  ["siwoo_jang", "장시우", "8765", "20250930", "active"],
  ["jia.lim", "임지아", "6543", "20241214", "suspended"],
  ["yejun_han", "한예준", "2109", "20250508", "active"],
  ["harin.oh", "오하린", "0987", "20250711", "active"],
  ["junwoo_seo", "서준우", "5544", "20241002", "active"],
  ["yuna_shin", "신유나", "3322", "20250324", "active"],
  ["jian.kwon", "권지안", "7788", "20250106", "active"],
  ["sieun_hwang", "황시은", "9900", "20250822", "closed"],
  ["hyunwoo.ahn", "안현우", "1122", "20250417", "active"],
  ["daeun_song", "송다은", "6677", "20251013", "active"],
  ["gunwoo.ryu", "류건우", "4455", "20250628", "suspended"],
  ["seoa_moon", "문서아", "8899", "20250915", "active"],
];

/** 고객 한 명의 보유 상품권과 최근 거래를 만든다. */
function buildWallet(index: number, seed: Seed) {
  const [memberId, customerName, phoneTail, joinedAt, status] = seed;
  const random = seeded(index + 1);

  // 보유 상품권 1~3종
  const voucherNames = [...VOUCHER_NAMES].sort(() => random() - 0.5).slice(0, 1 + Math.floor(random() * 3));
  const vouchers: WalletVoucher[] = voucherNames.map((voucherName) => ({
    voucherName,
    balance: status === "closed" ? 0 : Math.floor(random() * 40) * 10_000,
    lastTradedAt: `202611${String(1 + Math.floor(random() * 8)).padStart(2, "0")}`,
  }));

  // 최근 거래 10건. 최신이 위로 오도록 날짜를 거꾸로 내려가며 만든다.
  const transactions: WalletTransaction[] = [];
  let day = 8;
  const balances = Object.fromEntries(vouchers.map((v) => [v.voucherName, v.balance]));
  for (let i = 0; i < 10; i += 1) {
    const voucher = vouchers[Math.floor(random() * vouchers.length)]!;
    const roll = random();
    const type: TransactionType = roll < 0.35 ? "charge" : roll < 0.9 ? "use" : "refund";
    const amount = (1 + Math.floor(random() * 10)) * 5_000;
    const balanceAfter = balances[voucher.voucherName]!;
    // 지금 잔액에서 거꾸로 거슬러 올라가 "거래 전 잔액"을 다음 줄의 거래 후 잔액으로 쓴다.
    balances[voucher.voucherName] = Math.max(0, type === "use" ? balanceAfter + amount : balanceAfter - amount);
    transactions.push({
      id: index * 100 + i,
      tradedAt: `202611${String(day).padStart(2, "0")}${String(9 + Math.floor(random() * 12)).padStart(2, "0")}${String(
        Math.floor(random() * 60),
      ).padStart(2, "0")}`,
      type,
      voucherName: voucher.voucherName,
      amount,
      balanceAfter,
      place: type === "charge" ? PLACES[Math.floor(random() * 2) === 0 ? 0 : 3]! : PLACES[1 + Math.floor(random() * 6)]!,
    });
    if (random() < 0.6) day = Math.max(1, day - 1);
  }

  const row: WalletRow = {
    id: index + 1,
    memberId,
    customerName,
    phone: `010-****-${phoneTail}`,
    joinedAt,
    status,
    voucherCount: vouchers.filter((v) => v.balance > 0).length,
    totalBalance: vouchers.reduce((sum, v) => sum + v.balance, 0),
    lastTradedAt: transactions[0]!.tradedAt.slice(0, 8),
  };

  return { row, vouchers, transactions };
}

const WALLETS = SEEDS.map((seed, index) => buildWallet(index, seed));

/** 목록용 예시 데이터 */
export const MOCK_WALLET_ROWS: WalletRow[] = WALLETS.map((wallet) => wallet.row);

/** 상세용 예시 데이터. 목록 줄의 id로 찾는다. */
export function getWalletDetail(id: number) {
  return WALLETS.find((wallet) => wallet.row.id === id) ?? null;
}
