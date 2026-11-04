import Dashboard from "@menus/Dashboard";
import { WalletHistory, WalletList } from "@menus/wallet";
import { VoucherGroupManage, VoucherManage } from "@menus/voucher";
import { BulkProcess, GiftTransfer } from "@menus/service";
import { SendingStats } from "@menus/stats";
import { DASHBOARD_TAB_ID, type TabId } from "@menus/menuConfig";

/** 활성 탭에 해당하는 화면을 Content 영역에 렌더. null/dashboard면 대시보드 */
export function MenuContent({ tabId }: { tabId: TabId | null }) {
  if (tabId === null || tabId === DASHBOARD_TAB_ID) {
    return <Dashboard />;
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
