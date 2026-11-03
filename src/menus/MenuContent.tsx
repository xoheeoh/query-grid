import Dashboard from "@menus/Dashboard";
import { Page110101 } from "@menus/m110100_user";
import {
  BulkGiftSendStatus,
  BulkPurchaseRegister,
  BulkSendRequest,
  VoucherBalance,
  VoucherGroupManage,
  VoucherManage,
} from "@menus/m110200_voucher";
import { Page110301 } from "@menus/m110300_history";
import { SendSms, SendingResults, SendingStats } from "@menus/m110400_sms";
import { Page110501 } from "@menus/m110500_settlement";
import { Page110601 } from "@menus/m110600_searchTransactions";
import { Page110701 } from "@menus/m110700_statistics";
import { Page110801 } from "@menus/m110800_fundSegregation";
import { BulkProcess, GiftTransfer, InquiryManage, ManualProcess } from "@menus/m110900_service";
import { Page111001 } from "@menus/m111000_access";
import { Page111101 } from "@menus/m111100_system";
import { DASHBOARD_TAB_ID, type TabId } from "@menus/menuConfig";

/** 활성 탭에 해당하는 화면을 Content 영역에 렌더. null/dashboard면 대시보드 */
export function MenuContent({ tabId }: { tabId: TabId | null }) {
  if (tabId === null || tabId === DASHBOARD_TAB_ID) {
    return <Dashboard />;
  }

  switch (tabId) {
    case "customer-manage":
      return <Page110101 />;
    case "voucher-manage":
      return <VoucherManage />;
    case "voucher-balance":
      return <VoucherBalance />;
    case "bulk-purchase":
      return <BulkPurchaseRegister />;
    case "bulk-send":
      return <BulkSendRequest />;
    case "bulk-gift-status":
      return <BulkGiftSendStatus />;
    case "voucher-group":
      return <VoucherGroupManage />;
    case "history":
      return <Page110301 />;
    case "sending-stats":
      return <SendingStats />;
    case "sending-results":
      return <SendingResults />;
    case "send-sms":
      return <SendSms />;
    case "settlement":
      return <Page110501 />;
    case "search-transactions":
      return <Page110601 />;
    case "statistics":
      return <Page110701 />;
    case "fund-segregation":
      return <Page110801 />;
    case "inquiry-manage":
      return <InquiryManage />;
    case "manual-process":
      return <ManualProcess />;
    case "bulk-process":
      return <BulkProcess />;
    case "gift-transfer":
      return <GiftTransfer />;
    case "access":
      return <Page111001 />;
    case "system":
      return <Page111101 />;
  }
}
