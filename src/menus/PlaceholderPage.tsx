import styles from "./PlaceholderPage.module.css";
import { MENU_LABEL, type MenuId } from "./menuConfig";

interface PlaceholderPageProps {
  menuId: MenuId;
}

export default function PlaceholderPage({ menuId }: PlaceholderPageProps) {
  return (
    <div className={styles.empty}>
      <p className="text-subtitle2">{MENU_LABEL[menuId]}</p>
      <p className="text-body2">이 메뉴 화면은 아직 준비 중입니다.</p>
    </div>
  );
}
