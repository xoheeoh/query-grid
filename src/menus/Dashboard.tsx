import styles from "./PlaceholderPage.module.css";

/** 홈 대시보드 — 탭으로 표시하지 않음 */
export default function Dashboard() {
  return (
    <div className={styles.empty}>
      <p className="text-subtitle2">대시보드</p>
      <p className="text-body2">홈 화면입니다. 사이드바에서 메뉴를 선택해 작업을 시작하세요.</p>
    </div>
  );
}
