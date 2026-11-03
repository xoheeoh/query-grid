import { mdiClose } from "@mdi/js";
import { Icon } from "@xoheeoh/components";
import { TAB_LABEL, type TabId } from "./menuConfig";
import styles from "./ContentTabBar.module.css";

export interface ContentTabBarProps {
  openTabs: TabId[];
  activeTab: TabId | null;
  onSelect: (tabId: TabId) => void;
  onClose: (tabId: TabId) => void;
}

/** Content 영역 상단 — 열린 메뉴를 탭으로 쌓아 전환·닫기 */
export function ContentTabBar({ openTabs, activeTab, onSelect, onClose }: ContentTabBarProps) {
  if (openTabs.length === 0) return null;

  return (
    <div className={styles.bar} role="tablist" aria-label="열린 페이지">
      {openTabs.map((tabId) => {
        const selected = tabId === activeTab;
        const label = TAB_LABEL[tabId];
        return (
          <div
            key={tabId}
            className={`${styles.tab} ${selected ? styles.tabActive : ""}`}
            role="tab"
            aria-selected={selected}>
            <button type="button" className={styles.tabLabel} onClick={() => onSelect(tabId)}>
              <span className="text-subtitle4">{label}</span>
            </button>
            <button
              type="button"
              className={styles.closeButton}
              aria-label={`${label} 탭 닫기`}
              onClick={(event) => {
                event.stopPropagation();
                onClose(tabId);
              }}>
              <Icon path={mdiClose} size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
