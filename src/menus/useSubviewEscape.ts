import { useEffect, type RefObject } from "react";

/**
 * 서브뷰(등록·수정·상세처럼 위로 덮이는 화면)에서 Esc 키를 처리한다.
 * - 알림창이나 모달 안에서 누른 Esc는 그쪽이 처리하게 두고, 서브뷰는 닫지 않는다.
 * - 버튼이 바뀌어 포커스가 본문으로 빠진 상태라도, 알림창이 떠 있지 않을 때만 닫는다.
 * - 열려 있는 드롭다운은 자기가 닫는다.
 */
export function useSubviewEscape(panelRef: RefObject<HTMLElement | null>, onEscape: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target as HTMLElement | null;
      const nearestDialog = target?.closest('[role="dialog"], [role="alertdialog"]') ?? null;
      if (nearestDialog && nearestDialog !== panelRef.current) return;
      if (!nearestDialog && document.querySelector('[role="alertdialog"], [role="dialog"]:not(.page-subview)')) return;
      if (target?.closest('[aria-expanded="true"]')) return;
      onEscape();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });
}
