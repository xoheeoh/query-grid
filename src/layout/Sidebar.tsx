import { useId, useState, type ReactNode } from "react";
import { mdiChevronDown, mdiLogout } from "@mdi/js";
import { Icon } from "@xoheeoh/components";
import styles from "./Sidebar.module.css";

export interface SidebarProps {
  children: ReactNode;
  /** 넘기면 맨 아래에 로그아웃 버튼을 보여준다. */
  onLogout?: () => void;
  className?: string;
  "aria-label"?: string;
}

/**
 * 왼쪽 주 메뉴다.
 * 1100px 이하에서는 아이콘만 남고, 그룹에 마우스를 올리거나 포커스하면 하위 메뉴가 옆으로 펼쳐진다.
 */
export function Sidebar({ children, onLogout, className, "aria-label": ariaLabel }: SidebarProps) {
  return (
    <nav className={[styles.sidebar, className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      <ul className={styles.groupList}>{children}</ul>

      {onLogout && (
        <button type="button" className={styles.logout} onClick={onLogout}>
          <Icon path={mdiLogout} size={20} />
          <span className={styles.logoutLabel}>로그아웃</span>
        </button>
      )}
    </nav>
  );
}

export interface SidebarGroupProps {
  title: string;
  /** @mdi/js path */
  icon: string;
  children: ReactNode;
}

/** 대메뉴 하나다. 제목 버튼을 누르면 하위 메뉴를 접고 편다. */
export function SidebarGroup({ title, icon, children }: SidebarGroupProps) {
  const [open, setOpen] = useState(true);
  const panelId = useId();

  return (
    <li className={styles.group}>
      <button
        type="button"
        className={styles.groupButton}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}>
        <Icon path={icon} size={20} />
        <span className={styles.groupTitle}>{title}</span>
        <Icon path={mdiChevronDown} size={18} className={styles.chevron} />
      </button>

      <div id={panelId} className={styles.panel} data-open={open}>
        {/* 접고 펼 때 높이가 부드럽게 바뀌도록 내용물을 한 번 더 감싼다. */}
        <div className={styles.panelInner}>
          {/* 아이콘만 보이는 좁은 화면의 플라이아웃에서만 보이는 제목이다. 버튼이 이미 이름을 읽어주므로 숨긴다. */}
          <p className={styles.flyoutTitle} aria-hidden>
            {title}
          </p>
          <ul className={styles.itemList}>{children}</ul>
        </div>
      </div>
    </li>
  );
}

export interface SidebarItemProps {
  /** 현재 열린 화면이면 true */
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function SidebarItem({ active = false, onClick, children }: SidebarItemProps) {
  return (
    <li>
      <button
        type="button"
        className={styles.item}
        aria-current={active ? "page" : undefined}
        onClick={onClick}>
        {children}
      </button>
    </li>
  );
}
