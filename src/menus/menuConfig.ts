import {
  mdiAccountCogOutline,
  mdiBankOutline,
  mdiCashMultiple,
  mdiChartBar,
  mdiCogOutline,
  mdiEmailOutline,
  mdiFaceAgent,
  mdiFileSearchOutline,
  mdiInvoiceListOutline,
  mdiLockOpenOutline,
  mdiTicketPercentOutline,
} from "@mdi/js";

export type MenuId =
  | "customer-manage"
  | "voucher-manage"
  | "voucher-balance"
  | "bulk-purchase"
  | "bulk-send"
  | "bulk-gift-status"
  | "voucher-group"
  | "history"
  | "sending-stats"
  | "sending-results"
  | "send-sms"
  | "settlement"
  | "search-transactions"
  | "statistics"
  | "fund-segregation"
  | "inquiry-manage"
  | "manual-process"
  | "bulk-process"
  | "gift-transfer"
  | "access"
  | "system";

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

/** m110100~m111100 번호 순. 미정 소메뉴는 임시 Page 1개씩 연결 */
export const MENU_GROUPS: MenuGroup[] = [
  {
    title: "고객관리",
    icon: mdiAccountCogOutline,
    items: [{ id: "customer-manage", label: "고객관리" }],
  },
  {
    title: "상품권 관리",
    icon: mdiTicketPercentOutline,
    items: [
      { id: "voucher-manage", label: "상품권 관리" },
      { id: "voucher-balance", label: "상품권 잔액 관리" },
      { id: "bulk-purchase", label: "대량구매 등록" },
      { id: "bulk-send", label: "대량발송 요청" },
      { id: "bulk-gift-status", label: "대량선물 발송 현황" },
      { id: "voucher-group", label: "상품권 그룹 관리" },
    ],
  },
  {
    title: "이용내역",
    icon: mdiInvoiceListOutline,
    items: [{ id: "history", label: "이용내역" }],
  },
  {
    title: "문자 발송 관리",
    icon: mdiEmailOutline,
    items: [
      { id: "sending-stats", label: "발송 통계" },
      { id: "sending-results", label: "발송 결과 조회" },
      { id: "send-sms", label: "알림톡 발송" },
    ],
  },
  {
    title: "정산 관리",
    icon: mdiCashMultiple,
    items: [{ id: "settlement", label: "정산 관리" }],
  },
  {
    title: "특정거래조회",
    icon: mdiFileSearchOutline,
    items: [{ id: "search-transactions", label: "특정거래조회" }],
  },
  {
    title: "통계",
    icon: mdiChartBar,
    items: [{ id: "statistics", label: "통계" }],
  },
  {
    title: "자금분리 및 계좌관리",
    icon: mdiBankOutline,
    items: [{ id: "fund-segregation", label: "자금분리 및 계좌관리" }],
  },
  {
    title: "고객센터",
    icon: mdiFaceAgent,
    items: [
      { id: "inquiry-manage", label: "1:1상담 관리" },
      { id: "manual-process", label: "관리자 수기처리" },
      { id: "bulk-process", label: "일괄 수기처리" },
      { id: "gift-transfer", label: "상품권 양도" },
    ],
  },
  {
    title: "접근 관리",
    icon: mdiLockOpenOutline,
    items: [{ id: "access", label: "접근 관리" }],
  },
  {
    title: "시스템 관리",
    icon: mdiCogOutline,
    items: [{ id: "system", label: "시스템 관리" }],
  },
];

export const MENU_LABEL: Record<MenuId, string> = {
  "customer-manage": "고객관리",
  "voucher-manage": "상품권 관리",
  "voucher-balance": "상품권 잔액 관리",
  "bulk-purchase": "대량구매 등록",
  "bulk-send": "대량발송 요청",
  "bulk-gift-status": "대량선물 발송 현황",
  "voucher-group": "상품권 그룹 관리",
  history: "이용내역",
  "sending-stats": "발송 통계",
  "sending-results": "발송 결과 조회",
  "send-sms": "알림톡 발송",
  settlement: "정산 관리",
  "search-transactions": "특정거래조회",
  statistics: "통계",
  "fund-segregation": "자금분리 및 계좌관리",
  "inquiry-manage": "1:1상담 관리",
  "manual-process": "관리자 수기처리",
  "bulk-process": "일괄 수기처리",
  "gift-transfer": "상품권 양도",
  access: "접근 관리",
  system: "시스템 관리",
};

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
