import { Icon } from "@xoheeoh/components";
import { mdiChevronRight, mdiTrendingDown, mdiTrendingUp } from "@mdi/js";
import { formatAmount } from "@utils";
import type { MenuId } from "../menuConfig";
import { DAILY_SERIES, KPI, PENDING, VOUCHER_BALANCES } from "./dashboardData";
import { TrendChart } from "./TrendChart";
import styles from "./Dashboard.module.css";

type DashboardProps = {
  /** 카드나 할 일을 누르면 그 화면을 탭으로 연다. */
  onOpenMenu?: (menuId: MenuId) => void;
};

/** 어제 대비 변화. 올랐으면 초록 화살표, 내렸으면 빨간 화살표와 글자로 같이 보여준다. */
function Change({ rate }: { rate: number }) {
  const up = rate >= 0;
  return (
    <span className={`${styles.tileSub} ${up ? styles.up : styles.down}`}>
      <Icon path={up ? mdiTrendingUp : mdiTrendingDown} size={14} />
      어제 대비 {up ? "+" : ""}
      {rate.toFixed(1)}%
    </span>
  );
}

/** 홈 대시보드. 오늘의 숫자, 최근 30일 흐름, 처리할 일, 상품권별 잔액 비중을 한 화면에 보여준다. */
export default function Dashboard({ onOpenMenu }: DashboardProps) {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayLabel = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const tiles: Array<{ label: string; value: number; unit: string; sub: React.ReactNode; menuId: MenuId }> = [
    { label: "오늘 충전액", value: KPI.todayCharge, unit: "원", sub: <Change rate={KPI.todayChargeChange} />, menuId: "wallet-history" },
    { label: "오늘 사용액", value: KPI.todayUse, unit: "원", sub: <Change rate={KPI.todayUseChange} />, menuId: "wallet-history" },
    {
      label: "총 보유 잔액",
      value: KPI.totalBalance,
      unit: "원",
      sub: <span className={styles.tileSub}>고객 지갑에 남아 있는 금액 합계</span>,
      menuId: "wallet-list",
    },
    {
      label: "활성 지갑",
      value: KPI.activeWallets,
      unit: "개",
      sub: (
        <span className={styles.tileSub}>
          정지 {KPI.suspendedWallets} · 해지 {KPI.closedWallets}
        </span>
      ),
      menuId: "wallet-list",
    },
  ];

  const pendingItems: Array<{ label: string; value: string; menuId: MenuId }> = [
    { label: "일괄 수기처리 확인 대기", value: `${PENDING.manualConfirming}건`, menuId: "bulk-process" },
    { label: "정지 상태 지갑", value: `${PENDING.suspendedWallets}개`, menuId: "wallet-list" },
    { label: "이달 만료 예정 잔액", value: `${formatAmount(PENDING.expiringBalance)}원`, menuId: "voucher-manage" },
  ];

  return (
    <div className={styles.root}>
      <div className="page-header">
        <div className="page-title">
          <h3>대시보드</h3>
          <p>{todayLabel} 기준. 숫자 카드와 처리할 일을 누르면 해당 화면으로 이동합니다.</p>
        </div>
      </div>

      <div className={styles.tiles}>
        {tiles.map((tile) => (
          <button key={tile.label} type="button" className={styles.tile} onClick={() => onOpenMenu?.(tile.menuId)}>
            <span className={styles.tileLabel}>{tile.label}</span>
            <span className={styles.tileValue}>
              {formatAmount(tile.value)}
              <span className={styles.tileUnit}>{tile.unit}</span>
            </span>
            {tile.sub}
          </button>
        ))}
      </div>

      <div className={styles.columns}>
        <TrendChart data={DAILY_SERIES} title="최근 30일 충전·사용 금액" />

        <div className={styles.sideColumn}>
          <section className={styles.card} aria-labelledby="dashboard-pending">
            <h4 id="dashboard-pending" className={`text-subtitle2 ${styles.cardTitle}`}>
              처리할 일
            </h4>
            <ul className={styles.pendingList}>
              {pendingItems.map((item) => (
                <li key={item.label}>
                  <button type="button" className={styles.pendingItem} onClick={() => onOpenMenu?.(item.menuId)}>
                    <span className={styles.pendingLabel}>{item.label}</span>
                    <span className={styles.pendingValue}>
                      {item.value}
                      <Icon path={mdiChevronRight} size={16} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card} aria-labelledby="dashboard-share">
            <h4 id="dashboard-share" className={`text-subtitle2 ${styles.cardTitle}`}>
              상품권별 잔액 비중
            </h4>
            <ul className={styles.shareList}>
              {VOUCHER_BALANCES.map((item) => (
                <li key={item.voucherName} className={styles.shareRow}>
                  <span className={styles.shareName} title={item.voucherName}>
                    {item.voucherName}
                  </span>
                  <span
                    className={styles.shareBar}
                    role="img"
                    aria-label={`${item.voucherName} 잔액 ${formatAmount(item.balance)}원, ${item.share.toFixed(1)}%`}>
                    <span className={styles.shareFill} style={{ width: `${item.share}%` }} />
                  </span>
                  <span className={styles.shareValue}>{item.share.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
