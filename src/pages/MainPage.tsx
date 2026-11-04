import { useState } from "react";
import { mdiAccountOutline, mdiChevronRight } from "@mdi/js";
import { Alert, Icon, ToastProvider } from "@xoheeoh/components";
import { Sidebar, SidebarGroup, SidebarItem } from "../layout/Sidebar";
import { clearLoginSession, getLoginSession } from "@utils";
import {
  ContentTabBar,
  DASHBOARD_TAB_ID,
  MENU_GROUPS,
  MENU_LABEL,
  MenuContent,
  SubviewLockProvider,
  getMenuGroupTitle,
  isMenuId,
  useSubviewLockState,
  type MenuId,
  type TabId,
} from "@menus";
import styles from "./MainPage.module.css";

/** 로그인 후 메인 셸 — /sample 경로. 헤더 + 사이드바 + Content(menu 페이지) */
export default function MainPage() {
  return (
    <ToastProvider>
      <SubviewLockProvider>
        <MainPageContent />
      </SubviewLockProvider>
    </ToastProvider>
  );
}

function MainPageContent() {
  const [openTabs, setOpenTabs] = useState<TabId[]>([]);
  /** null = 탭이 모두 닫힌 암묵적 대시보드(탭으로 표시하지 않음) */
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  /** 서브뷰 잠금 중 화면 이동 대기 — 탭 전환·사이드바 메뉴 클릭 확인 Dialog용 */
  const [pendingTab, setPendingTab] = useState<TabId | null>(null);
  const { isLocked } = useSubviewLockState();
  // 로그인 화면에서 저장한 사용자 정보. 로그인 없이 바로 들어오면 없다.
  const session = getLoginSession();

  const isDashboard = activeTab === null || activeTab === DASHBOARD_TAB_ID;
  const currentPageLabel = isDashboard || !activeTab || !isMenuId(activeTab) ? "대시보드" : MENU_LABEL[activeTab];
  const breadcrumbTitle =
    isDashboard || !activeTab || !isMenuId(activeTab)
      ? "홈 > 대시보드"
      : `홈 > ${getMenuGroupTitle(activeTab)} > ${MENU_LABEL[activeTab]}`;

  /** 탭이 열려 있으면 대시보드를 탭으로 추가. 탭이 없으면 암묵적 대시보드만 표시 */
  function openDashboard() {
    if (openTabs.length === 0) {
      setActiveTab(null);
      return;
    }

    setOpenTabs((prev) => (prev.includes(DASHBOARD_TAB_ID) ? prev : [...prev, DASHBOARD_TAB_ID]));
    setActiveTab(DASHBOARD_TAB_ID);
  }

  function activateTab(tabId: TabId) {
    if (isMenuId(tabId)) {
      setOpenTabs((prev) => (prev.includes(tabId) ? prev : [...prev, tabId]));
    } else if (tabId === DASHBOARD_TAB_ID) {
      setOpenTabs((prev) => (prev.includes(DASHBOARD_TAB_ID) ? prev : [...prev, DASHBOARD_TAB_ID]));
    }
    setActiveTab(tabId);
  }

  function openMenu(menuId: MenuId) {
    if (menuId === activeTab) return;

    if (isLocked) {
      setPendingTab(menuId);
      return;
    }

    activateTab(menuId);
  }

  /** 여러 탭을 한 번에 닫는다. 보고 있던 탭이 닫히면 원래 자리에서 가장 가까운 남은 탭(앞쪽 우선)을 연다. */
  function closeTabs(tabIds: TabId[]) {
    const closing = new Set(tabIds);
    const next = openTabs.filter((id) => !closing.has(id));
    if (next.length === openTabs.length) return;

    setOpenTabs(next);

    if (next.length === 0) {
      setActiveTab(null);
      return;
    }

    if (activeTab !== null && closing.has(activeTab)) {
      const index = openTabs.indexOf(activeTab);
      const before = openTabs.slice(0, index).reverse().find((id) => !closing.has(id));
      const after = openTabs.slice(index + 1).find((id) => !closing.has(id));
      setActiveTab(before ?? after ?? next[0]!);
    }
  }

  function closeTab(tabId: TabId) {
    closeTabs([tabId]);
  }

  /** ContentTabBar 탭 선택 — 서브뷰가 열려 있으면 이탈 확인 후 이동 */
  function handleSelectTab(tabId: TabId) {
    if (tabId === activeTab) return;

    if (isLocked) {
      setPendingTab(tabId);
      return;
    }

    setActiveTab(tabId);
  }

  function handleCancelLeave() {
    setPendingTab(null);
  }

  function handleConfirmLeave() {
    if (pendingTab == null) return;
    activateTab(pendingTab);
    setPendingTab(null);
  }

  function handleLogout() {
    clearLoginSession();
    window.location.href = "/";
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.headerInfoContainer} ${styles.headerLeading}`}>
          <button type="button" className={styles.brand} onClick={openDashboard} aria-label="대시보드로 이동">
            <img src="/img/logo_color.svg" alt="" width={24} height={24} />
            <div className={styles.brandText}>
              <span className={`text-subtitle2 ${styles.brandTitle}`}>바우처 플랫폼</span>
              <span className={`text-caption1 ${styles.brandBadge}`}>Admin</span>
            </div>
          </button>

          <div className={`${styles.divider} ${styles.headerDividerBrand}`} />

          <div className={styles.breadcrumbPath} title={breadcrumbTitle}>
            <span className={styles.breadcrumbAncestors}>
              <span className={`text-body2 ${styles.label}`}>홈</span>
              <Icon path={mdiChevronRight} size={14} className={styles.breadcrumbChevron} />
              {!isDashboard && activeTab && isMenuId(activeTab) && (
                <>
                  <span className={`text-body2 ${styles.label}`}>{getMenuGroupTitle(activeTab)}</span>
                  <Icon path={mdiChevronRight} size={14} className={styles.breadcrumbChevron} />
                </>
              )}
            </span>
            <span className={`text-subtitle3 ${styles.breadcrumbCurrent}`}>{currentPageLabel}</span>
          </div>
        </div>

        <div className={`${styles.headerInfoContainer} ${styles.headerTrailing}`}>
          <div className={`${styles.headerInfoItem} ${styles.lastLogin}`}>
            <span className={`text-caption2 ${styles.label}`}>최근 접속</span>
            <span className="text-caption1">
              <strong>{session?.loginAt ?? "-"}</strong>
            </span>
          </div>

          <div className={`${styles.divider} ${styles.headerDividerMeta}`} />

          <div className={styles.headerAvatarInfo} tabIndex={0} aria-label="사용자 정보">
            <div className={styles.avatar}>
              <Icon path={mdiAccountOutline} size={20} />
            </div>

            <div className={`${styles.headerInfoItem} ${styles.headerMetaText}`}>
              <span className={`text-caption2 ${styles.label}`}>{session?.id ?? "-"}</span>
              <span className="text-caption1">
                <strong>{session?.name ?? "-"}</strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <Sidebar className={styles.sidebar} aria-label="주 메뉴" onLogout={handleLogout}>
          {MENU_GROUPS.map((group) => (
            <SidebarGroup key={group.title} title={group.title} icon={group.icon}>
              {group.items.map((item) => (
                <SidebarItem key={item.id} active={activeTab === item.id} onClick={() => openMenu(item.id)}>
                  {item.label}
                </SidebarItem>
              ))}
            </SidebarGroup>
          ))}
        </Sidebar>

        <main className={styles.content}>
          <ContentTabBar
            openTabs={openTabs}
            activeTab={activeTab}
            onSelect={handleSelectTab}
            onClose={closeTab}
            onCloseMany={closeTabs}
          />
          <div className={styles.contentBody}>
            <MenuContent tabId={activeTab} />
          </div>
        </main>
      </div>

      <Alert
        open={pendingTab != null}
        onClose={handleCancelLeave}
        title="화면 이동"
        message={"저장하지 않은 내용은 모두 초기화됩니다.\n화면을 이동하시겠습니까?"}
        secondaryAction={{ label: "취소" }}
        primaryAction={{ label: "확인", onClick: handleConfirmLeave }}
      />
    </div>
  );
}
