import { Dashboard } from "@menus/dashboard";
import { WalletHistory, WalletList } from "@menus/wallet";
import { VoucherGroupManage, VoucherManage } from "@menus/voucher";
import { BulkProcess, GiftTransfer } from "@menus/service";
import { SendingStats } from "@menus/stats";
import { DASHBOARD_TAB_ID, type MenuId, type TabId } from "@menus/menuConfig";

type MenuContentProps = {
  tabId: TabId | null;
  /** 대시보드에서 카드를 눌러 다른 화면을 열 때 쓴다. */
  onOpenMenu?: (menuId: MenuId) => void;
};

/** 활성 탭에 해당하는 화면을 Content 영역에 렌더. null/dashboard면 대시보드 */
export function MenuContent({ tabId, onOpenMenu }: MenuContentProps) {
  if (tabId === null || tabId === DASHBOARD_TAB_ID) {
    return <Dashboard onOpenMenu={onOpenMenu} />;
  }

  switch (tabId) {
    case "wallet-list":
      return <WalletList />;
    case "wallet-history":
      return <WalletHistory />;
    case "voucher-manage":
      return <VoucherManage />;
    case "voucher-group":
      return <VoucherGroupManage />;
    case "bulk-process":
      return <BulkProcess />;
    case "gift-transfer":
      return <GiftTransfer />;
    case "sending-stats":
      return <SendingStats />;
  }
}
