import { useRef, useState } from "react";
import { Alert, Button, Icon, IconButton, useToast } from "@xoheeoh/components";
import { mdiAccountOutline, mdiArrowLeft, mdiHistory, mdiTicketPercentOutline } from "@mdi/js";
import { formatAmount, formatDate } from "@utils";
import { useSubviewEscape } from "../useSubviewEscape";
import {
  TRANSACTION_TYPE_BADGE,
  TRANSACTION_TYPE_LABEL,
  WALLET_STATUS_BADGE,
  WALLET_STATUS_LABEL,
  getWalletDetail,
  type WalletRow,
  type WalletStatus,
} from "./walletData";
import styles from "./WalletDetailPanel.module.css";

type WalletDetailPanelProps = {
  wallet: WalletRow;
  onClose: () => void;
  /** 정지·해제로 상태가 바뀌면 목록에도 알린다. */
  onStatusChange: (id: number, status: WalletStatus) => void;
};

/** 목록에서 "상세"를 누르면 위로 덮이는 고객 지갑 상세 화면. 보유 상품권과 최근 거래를 보여주고 지갑을 정지·해제한다. */
export function WalletDetailPanel({ wallet, onClose, onStatusChange }: WalletDetailPanelProps) {
  const toast = useToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const [pendingStatus, setPendingStatus] = useState<WalletStatus | null>(null);
  const detail = getWalletDetail(wallet.id);

  const handleConfirmStatus = () => {
    if (!pendingStatus) return;
    onStatusChange(wallet.id, pendingStatus);
    toast.success(pendingStatus === "suspended" ? "지갑을 정지했습니다." : "지갑 정지를 해제했습니다.");
    setPendingStatus(null);
  };

  useSubviewEscape(panelRef, onClose);

  return (
    <div
      ref={panelRef}
      className="page-subview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-detail-title"
      style={{ zIndex: 10 }}>
      <div className="page-subview-main">
        <div className="page-subview-header flex-between">
          <div className="row-start gap-12">
            <IconButton
              variant="outlined"
              color="neutral"
              onClick={onClose}
              aria-label="고객 지갑 조회로 돌아가기"
              icon={<Icon path={mdiArrowLeft} />}
            />
            <div className="page-title">
              <h3 id="wallet-detail-title" className="text-heading3">
                고객 지갑 상세
              </h3>
              <p className="text-body2 text-color-secondary">
                {wallet.customerName} ({wallet.memberId})
              </p>
            </div>
          </div>
        </div>

        <div className="page-subview-body flex-col gap-16">
          <section className={styles.card} aria-labelledby="wallet-detail-customer">
            <div className={styles.cardTitle}>
              <Icon path={mdiAccountOutline} size={22} />
              <span id="wallet-detail-customer" className="text-subtitle2">
                고객 정보
              </span>
            </div>
            <dl className={`${styles.cardBody} ${styles.infoGrid}`}>
              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>회원 ID</dt>
                <dd className={styles.infoValue}>{wallet.memberId}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>고객명</dt>
                <dd className={styles.infoValue}>{wallet.customerName}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>휴대폰번호</dt>
                <dd className={styles.infoValue}>{wallet.phone}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>가입일</dt>
                <dd className={styles.infoValue}>{formatDate(wallet.joinedAt)}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>지갑 상태</dt>
                <dd>
                  <span className={`status-badge ${WALLET_STATUS_BADGE[wallet.status]}`}>
                    {WALLET_STATUS_LABEL[wallet.status]}
                  </span>
                </dd>
              </div>
              <div className={styles.infoItem}>
                <dt className={styles.infoLabel}>총 잔액</dt>
                <dd className={styles.infoValue}>{formatAmount(wallet.totalBalance)}원</dd>
              </div>
            </dl>
          </section>

          <section className={styles.card} aria-labelledby="wallet-detail-vouchers">
            <div className={styles.cardTitle}>
              <Icon path={mdiTicketPercentOutline} size={22} />
              <span id="wallet-detail-vouchers" className="text-subtitle2">
                보유 상품권
              </span>
            </div>
            <div className={styles.cardBody}>
              {detail && detail.vouchers.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>상품권</th>
                      <th className={styles.amount}>잔액</th>
                      <th style={{ width: 160 }}>최근 거래일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.vouchers.map((voucher) => (
                      <tr key={voucher.voucherName}>
                        <td>{voucher.voucherName}</td>
                        <td className={styles.amount}>{formatAmount(voucher.balance)}원</td>
                        <td>{formatDate(voucher.lastTradedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.empty}>보유한 상품권이 없습니다.</p>
              )}
            </div>
          </section>

          <section className={styles.card} aria-labelledby="wallet-detail-transactions">
            <div className={styles.cardTitle}>
              <Icon path={mdiHistory} size={22} />
              <span id="wallet-detail-transactions" className="text-subtitle2">
                최근 거래
              </span>
              <span className="text-caption1 text-color-secondary">최근 10건</span>
            </div>
            <div className={styles.cardBody}>
              {detail && detail.transactions.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 170 }}>거래 일시</th>
                      <th style={{ width: 90 }}>구분</th>
                      <th>상품권</th>
                      <th>거래처</th>
                      <th className={styles.amount}>금액</th>
                      <th className={styles.amount}>거래 후 잔액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{formatDate(tx.tradedAt)}</td>
                        <td>
                          <span className={`status-badge ${TRANSACTION_TYPE_BADGE[tx.type]}`}>
                            {TRANSACTION_TYPE_LABEL[tx.type]}
                          </span>
                        </td>
                        <td>{tx.voucherName}</td>
                        <td>{tx.place}</td>
                        <td className={styles.amount}>
                          {tx.type === "use" ? "-" : "+"}
                          {formatAmount(tx.amount)}원
                        </td>
                        <td className={styles.amount}>{formatAmount(tx.balanceAfter)}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.empty}>거래 내역이 없습니다.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="page-subview-footer">
        <Button variant="outlined" color="neutral" onClick={onClose} label="닫기" />
        <div className="row-center gap-8">
          {wallet.status === "active" && (
            <Button color="destructive" onClick={() => setPendingStatus("suspended")} label="지갑 정지" />
          )}
          {wallet.status === "suspended" && (
            <Button onClick={() => setPendingStatus("active")} label="정지 해제" />
          )}
          {wallet.status === "closed" && (
            <span className="text-caption1 text-color-secondary">해지된 지갑은 상태를 바꿀 수 없습니다.</span>
          )}
        </div>
      </div>

      <Alert
        open={pendingStatus === "suspended"}
        onClose={() => setPendingStatus(null)}
        title="지갑 정지"
        message={`${wallet.customerName} 고객의 지갑을 정지합니다.\n정지된 동안에는 충전과 사용이 모두 막힙니다. 계속하시겠습니까?`}
        secondaryAction={{ label: "취소" }}
        destructiveAction={{ label: "정지", onClick: handleConfirmStatus }}
      />

      <Alert
        open={pendingStatus === "active"}
        onClose={() => setPendingStatus(null)}
        title="정지 해제"
        message={`${wallet.customerName} 고객의 지갑 정지를 해제합니다.\n바로 충전과 사용이 가능해집니다. 계속하시겠습니까?`}
        secondaryAction={{ label: "취소" }}
        primaryAction={{ label: "해제", onClick: handleConfirmStatus }}
      />
    </div>
  );
}

export default WalletDetailPanel;
