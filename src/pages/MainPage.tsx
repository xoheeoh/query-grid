import { useEffect, useState } from "react";
import { mdiAccountOutline, mdiChevronRight, mdiClipboardTextOutline } from "@mdi/js";
import { Alert, Icon, ToastProvider } from "@xoheeoh/components";
import { Sidebar, SidebarGroup, SidebarItem } from "../layout/Sidebar";
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

  const [alertCount] = useState(7);
  const [isBadgeVisible, setIsBadgeVisible] = useState(true);

  const isDashboard = activeTab === null || activeTab === DASHBOARD_TAB_ID;
  const currentPageLabel = isDashboard || !activeTab || !isMenuId(activeTab) ? "대시보드" : MENU_LABEL[activeTab];
  const breadcrumbTitle =
    isDashboard || !activeTab || !isMenuId(activeTab)
      ? "홈 > 대시보드"
      : `홈 > ${getMenuGroupTitle(activeTab)} > ${MENU_LABEL[activeTab]}`;

  useEffect(() => {
    if (alertCount > 0) {
      setIsBadgeVisible(true);
    } else {
      setIsBadgeVisible(false);
    }
  }, [alertCount]);

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

  function closeTab(tabId: TabId) {
    const index = openTabs.indexOf(tabId);
    if (index === -1) return;

    const next = openTabs.filter((id) => id !== tabId);
    setOpenTabs(next);

    if (next.length === 0) {
      setActiveTab(null);
      return;
    }

    if (tabId === activeTab) {
      setActiveTab(next[index - 1] ?? next[index]!);
    }
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

  // TODO: 실제 로그아웃 로직으로 변경
  function handleLogout() {
    window.location.href = "/";
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.headerInfoContainer} ${styles.headerLeading}`}>
          <button type="button" className={styles.brand} onClick={openDashboard} aria-label="대시보드로 이동">
            <img src="/img/logo.svg" alt="" />
            <div className={styles.brandText}>
              <span className={`text-subtitle2 ${styles.brandTitle}`}>바우처 플랫폼</span>
              <span className={`text-caption1 ${styles.brandBadge}`}>Admin</span>
            </div>
          </button>

          <div className={`${styles.divider} ${styles.headerDividerBrand}`} />

          <div className={styles.breadcrumbPath} title={breadcrumbTitle}>
            <span className={styles.breadcrumbAncestors}>
              <span className={`text-body2 ${styles.label}`}>홈</span>
              <Icon path={mdiChevronRight} size={14} color="rgba(255, 255, 255, 0.5)" />
              {!isDashboard && activeTab && isMenuId(activeTab) && (
                <>
                  <span className={`text-body2 ${styles.label}`}>{getMenuGroupTitle(activeTab)}</span>
                  <Icon path={mdiChevronRight} size={14} color="rgba(255, 255, 255, 0.5)" />
                </>
              )}
            </span>
            <span className={`text-subtitle3 ${styles.breadcrumbCurrent}`}>{currentPageLabel}</span>
          </div>
        </div>

        <div className={`${styles.headerInfoContainer} ${styles.headerTrailing}`}>
          <div className={styles.headerInfo}>
            <div className={`${styles.headerInfoItem} ${styles.lastLogin}`}>
              <span className={`text-caption2 ${styles.label}`}>최근 접속</span>
              <div className={styles.headerInfoValue}>
                <span className="text-caption1">
                  <strong>2025-05-20 08:42</strong>
                </span>
              </div>
            </div>

            <div className={`${styles.headerInfoItem} ${styles.sessionInfo}`}>
              <span className={`text-caption2 ${styles.label} ${styles.sessionLabel}`}>세션 잔여</span>
              <div className={styles.headerInfoValue}>
                <span className="text-caption1">
                  <strong className={styles.time}>18 : 30</strong>
                </span>
                <button type="button" className={styles.timeButton}>
                  <span className="text-caption2">
                    <strong>연장</strong>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className={`${styles.divider} ${styles.headerDividerMeta}`} />

          <div className={styles.headerAvatarInfo} tabIndex={0} aria-label="사용자 정보">
            <div className={styles.avatar}>
              <Icon path={mdiAccountOutline} color="rgba(255, 255, 255, 0.8)" size={20} />
            </div>

            <div className={`${styles.headerInfoItem} ${styles.headerMetaText}`}>
              <span className={`text-caption2 ${styles.label}`}>demotest0m</span>
              <div className={styles.headerInfoValue}>
                <span className="text-caption1">
                  <strong>홍길동</strong>
                </span>
              </div>
            </div>
          </div>

          <div className={`${styles.divider} ${styles.headerDividerMeta}`} />

          <div className={styles.headerAvatarInfo} tabIndex={0} aria-label={`보관함 ${alertCount}건 대기`}>
            <div className={styles.avatar}>
              {isBadgeVisible && <div className={styles.badge}>{alertCount > 99 ? "99+" : alertCount}</div>}
              <Icon path={mdiClipboardTextOutline} color="rgba(255, 255, 255, 0.8)" size={20} />
            </div>

            <div className={`${styles.headerInfoItem} ${styles.headerMetaText}`}>
              <span className={`text-caption2 ${styles.label}`}>보관함</span>
              <div className={styles.headerInfoValue}>
                <span className="text-caption1">
                  <strong>{alertCount}건 대기</strong>
                </span>
              </div>
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
          <ContentTabBar openTabs={openTabs} activeTab={activeTab} onSelect={handleSelectTab} onClose={closeTab} />
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
