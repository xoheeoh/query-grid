import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import styles from "./TabContextMenu.module.css";

export interface TabContextMenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  /** true면 이 항목 위에 구분선을 넣는다. */
  dividerBefore?: boolean;
}

export interface TabContextMenuProps {
  /** 화면 기준 좌표. 화면 밖으로 나가면 안쪽으로 당긴다. */
  x: number;
  y: number;
  items: TabContextMenuItem[];
  onClose: () => void;
  /** 메뉴가 닫힌 뒤 포커스를 돌려줄 요소 */
  returnFocusTo?: HTMLElement | null;
}

/** 화면 가장자리에서 띄우는 최소 여백 */
const EDGE_GAP = 8;

/**
 * 탭에서 우클릭하면 뜨는 메뉴다.
 * 바깥 클릭·Esc·스크롤·창 크기 변경에 닫히고, 위아래 화살표로 항목을 옮길 수 있다.
 */
export function TabContextMenu({ x, y, items, onClose, returnFocusTo }: TabContextMenuProps) {
  const menuRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  // 메뉴 크기를 잰 뒤 화면 밖으로 나가는 만큼 안쪽으로 옮긴다.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const { width, height } = menu.getBoundingClientRect();
    setPosition({
      left: Math.max(EDGE_GAP, Math.min(x, window.innerWidth - width - EDGE_GAP)),
      top: Math.max(EDGE_GAP, Math.min(y, window.innerHeight - height - EDGE_GAP)),
    });
  }, [x, y]);

  // 열리면 첫 번째 항목에 포커스를 둔다.
  useEffect(() => {
    const first = menuRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)");
    first?.focus();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  // 닫힐 때 메뉴를 연 탭으로 포커스를 돌려준다. 탭이 함께 닫혔으면 건너뛴다.
  useEffect(() => {
    return () => {
      if (returnFocusTo?.isConnected) returnFocusTo.focus();
    };
  }, [returnFocusTo]);

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const buttons = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [],
    );
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);

    switch (event.key) {
      case "Escape":
      case "Tab":
        event.preventDefault();
        onClose();
        break;
      case "ArrowDown":
        event.preventDefault();
        buttons[(current + 1) % buttons.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        buttons[(current - 1 + buttons.length) % buttons.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        buttons[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        buttons[buttons.length - 1]?.focus();
        break;
    }
  };

  return createPortal(
    <ul
      ref={menuRef}
      className={styles.menu}
      role="menu"
      aria-label="탭 메뉴"
      style={position}
      onKeyDown={handleKeyDown}
      // 메뉴 위에서 다시 우클릭해도 브라우저 기본 메뉴가 뜨지 않게 한다.
      onContextMenu={(event) => event.preventDefault()}>
      {items.map((item) => (
        <li key={item.label} role="none">
          {item.dividerBefore && <div className={styles.divider} role="separator" />}
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            disabled={item.disabled}
            onClick={() => {
              item.onSelect();
              onClose();
            }}>
            {item.label}
          </button>
        </li>
      ))}
    </ul>,
    document.body,
  );
}
