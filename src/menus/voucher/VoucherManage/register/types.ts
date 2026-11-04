/** 등록 화면의 각 탭이 부모(등록 패널)에게 열어 주는 기능 */
export type RegisterPanelHandle = {
  /** 입력값을 처음 상태로 되돌린다. */
  reset: () => void;
  /** 필수값을 검사해서 문제가 있으면 화면에 표시하고 false를 돌려준다. */
  validate: () => boolean;
  /** 처음 상태에서 하나라도 바뀌었으면 true */
  isDirty: () => boolean;
};
