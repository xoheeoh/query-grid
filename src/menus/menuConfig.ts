import { mdiChartBar, mdiFaceAgent, mdiTicketPercentOutline, mdiWalletOutline } from "@mdi/js";

export type MenuId =
  | "wallet-list"
  | "wallet-history"
  | "voucher-manage"
  | "voucher-group"
  | "bulk-process"
  | "gift-transfer"
  | "sending-stats";

/** 탭으로 열 수 있는 화면. 대시보드는 로고 클릭 시에만 탭으로 추가됨 */
export type TabId = MenuId | "dashboard";

export const DASHBOARD_TAB_ID: TabId = "dashboard";

export interface MenuItem {
  id: MenuId;
  label: string;
}

export interface MenuGroup {
  title: string;
  /** @mdi/js path — 대메뉴 아이콘 */
  icon: string;
  items: MenuItem[];
}

/** 사이드바에 보이는 순서대로 적는다. 그룹 하나가 폴더 하나(wallet, voucher, service, stats)와 짝이다. */
export const MENU_GROUPS: MenuGroup[] = [
  {
    title: "고객 지갑",
    icon: mdiWalletOutline,
    items: [
      { id: "wallet-list", label: "고객 지갑 조회" },
      { id: "wallet-history", label: "충전·사용 내역" },
    ],
  },
  {
    title: "상품권 관리",
    icon: mdiTicketPercentOutline,
    items: [
      { id: "voucher-manage", label: "상품권 관리" },
      { id: "voucher-group", label: "상품권 그룹 관리" },
    ],
  },
  {
    title: "고객센터",
    icon: mdiFaceAgent,
    items: [
      { id: "bulk-process", label: "일괄 수기처리" },
      { id: "gift-transfer", label: "상품권 양도" },
    ],
  },
  {
    title: "통계",
    icon: mdiChartBar,
    items: [{ id: "sending-stats", label: "알림 발송 통계" }],
  },
];

export const MENU_LABEL: Record<MenuId, string> = Object.fromEntries(
  MENU_GROUPS.flatMap((group) => group.items.map((item) => [item.id, item.label])),
) as Record<MenuId, string>;

export const TAB_LABEL: Record<TabId, string> = {
  ...MENU_LABEL,
  dashboard: "대시보드",
};

export function isMenuId(tabId: TabId): tabId is MenuId {
  return tabId !== DASHBOARD_TAB_ID;
}

/** activeTab에 해당하는 대메뉴(그룹) 타이틀. 대시보드는 빈 문자열 */
export function getMenuGroupTitle(tabId: TabId | null): string {
  if (tabId === null || !isMenuId(tabId)) return "";
  const group = MENU_GROUPS.find((g) => g.items.some((item) => item.id === tabId));
  return group?.title ?? "";
}
