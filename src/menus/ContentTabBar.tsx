import { useState, type MouseEvent } from "react";
import { mdiClose } from "@mdi/js";
import { Icon } from "@xoheeoh/components";
import { TAB_LABEL, type TabId } from "./menuConfig";
import { TabContextMenu, type TabContextMenuItem } from "./TabContextMenu";
import styles from "./ContentTabBar.module.css";

export interface ContentTabBarProps {
  openTabs: TabId[];
  activeTab: TabId | null;
  onSelect: (tabId: TabId) => void;
  onClose: (tabId: TabId) => void;
  /** 우클릭 메뉴에서 여러 탭을 한 번에 닫을 때 쓴다. */
  onCloseMany: (tabIds: TabId[]) => void;
}

/** 우클릭 메뉴가 열린 탭과 위치 */
type OpenedMenu = {
  tabId: TabId;
  x: number;
  y: number;
  anchor: HTMLElement;
};

/** Content 영역 상단 — 열린 메뉴를 탭으로 쌓아 전환·닫기. 탭을 우클릭하면 여러 탭을 닫는 메뉴가 뜬다. */
export function ContentTabBar({ openTabs, activeTab, onSelect, onClose, onCloseMany }: ContentTabBarProps) {
  const [menu, setMenu] = useState<OpenedMenu | null>(null);

  if (openTabs.length === 0) return null;

  const openMenu = (event: MouseEvent<HTMLElement>, tabId: TabId) => {
    event.preventDefault();
    const anchor = event.currentTarget;
    // 키보드(Shift+F10 등)로 열면 좌표가 0으로 오므로 탭 바로 아래에 띄운다.
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    const rect = anchor.getBoundingClientRect();
    setMenu({
      tabId,
      x: fromKeyboard ? rect.left : event.clientX,
      y: fromKeyboard ? rect.bottom : event.clientY,
      anchor,
    });
  };

  const menuItems = (tabId: TabId): TabContextMenuItem[] => {
    const index = openTabs.indexOf(tabId);
    return [
      { label: "닫기", onSelect: () => onCloseMany([tabId]) },
      {
        label: "다른 탭 모두 닫기",
        disabled: openTabs.length <= 1,
        onSelect: () => onCloseMany(openTabs.filter((id) => id !== tabId)),
      },
      {
        label: "오른쪽 탭 모두 닫기",
        disabled: index === openTabs.length - 1,
        onSelect: () => onCloseMany(openTabs.slice(index + 1)),
      },
      { label: "모두 닫기", dividerBefore: true, onSelect: () => onCloseMany(openTabs) },
    ];
  };

  return (
    <div className={styles.bar} role="tablist" aria-label="열린 페이지">
      {openTabs.map((tabId) => {
        const selected = tabId === activeTab;
        const label = TAB_LABEL[tabId];
        return (
          // 모양만 잡는 틀이다. 탭 역할은 안쪽 이름 버튼이 맡아서, 닫기 버튼이 탭 안에 겹치지 않게 한다.
          <div
            key={tabId}
            className={`${styles.tab} ${selected ? styles.tabActive : ""}`}
            onContextMenu={(event) => openMenu(event, tabId)}>
            <button
              type="button"
              role="tab"
              aria-selected={selected}
              className={styles.tabLabel}
              onClick={() => onSelect(tabId)}
              // 마우스 없이도 닫을 수 있게 Delete 키로 탭을 닫는다.
              onKeyDown={(event) => {
                if (event.key === "Delete") onClose(tabId);
              }}>
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

      {menu && (
        <TabContextMenu
          x={menu.x}
          y={menu.y}
          items={menuItems(menu.tabId)}
          onClose={() => setMenu(null)}
          returnFocusTo={menu.anchor.querySelector("button")}
        />
      )}
    </div>
  );
}
