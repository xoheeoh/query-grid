import { useId, type ReactNode } from "react";
import styles from "./FormField.module.css";

/**
 * 입력 컴포넌트에 그대로 펼쳐 넣는 속성 묶음이다.
 * 라벨 글자와 입력칸을 연결해서 화면 낭독기가 "발행처, 필수, 오류" 식으로 읽게 한다.
 */
export type FieldControlProps = {
  "aria-labelledby": string;
  "aria-required"?: true;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

interface FormFieldProps {
  label: ReactNode;
  required?: boolean;
  /** 값이 있으면 입력칸 아래에 빨간 글씨로 보여준다. */
  error?: string;
  /** 2열 배치에서 한 줄을 통으로 쓴다. */
  full?: boolean;
  /** 입력 컴포넌트를 돌려주는 함수. 인자로 받은 속성을 입력 컴포넌트에 펼쳐 넣는다. */
  children: (control: FieldControlProps) => ReactNode;
}

/** 등록·수정 화면의 한 줄(라벨 + 입력칸 + 오류 문구) */
export function FormField({ label, required, error, full, children }: FormFieldProps) {
  const labelId = useId();
  const errorId = useId();

  const control: FieldControlProps = { "aria-labelledby": labelId };
  if (required) control["aria-required"] = true;
  if (error) {
    control["aria-invalid"] = true;
    control["aria-describedby"] = errorId;
  }

  return (
    <div className={`${styles.field} ${full ? "grid-col-full" : ""}`}>
      <span id={labelId} className={`text-body2 ${styles.label}`}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </span>

      <div className={styles.body}>
        {children(control)}
        {error && (
          <p id={errorId} className={`text-caption1 ${styles.errorText}`}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
