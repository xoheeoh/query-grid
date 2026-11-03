import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface SubviewLockContextValue {
  /** 서브뷰(등록/수정 풀모달)가 하나라도 열려 있으면 true */
  isLocked: boolean;
  acquire: () => void;
  release: () => void;
}

const SubviewLockContext = createContext<SubviewLockContextValue | null>(null);

/** 메인 셸에서 서브뷰 잠금 상태를 공유 */
export function SubviewLockProvider({ children }: { children: ReactNode }) {
  const [lockCount, setLockCount] = useState(0);

  const acquire = useCallback(() => {
    setLockCount((count) => count + 1);
  }, []);

  const release = useCallback(() => {
    setLockCount((count) => Math.max(0, count - 1));
  }, []);

  const value = useMemo(
    () => ({
      isLocked: lockCount > 0,
      acquire,
      release,
    }),
    [lockCount, acquire, release]
  );

  return <SubviewLockContext.Provider value={value}>{children}</SubviewLockContext.Provider>;
}

function useSubviewLockContext(component: string): SubviewLockContextValue {
  const ctx = useContext(SubviewLockContext);
  if (!ctx) {
    throw new Error(`${component}는 반드시 <SubviewLockProvider> 안에서 사용해야 합니다.`);
  }
  return ctx;
}

/** 메인 셸 — 서브뷰 잠금 여부 조회 */
export function useSubviewLockState() {
  return useSubviewLockContext("useSubviewLockState");
}

/**
 * 서브뷰(등록/수정 풀모달) 마운트 시 잠금 등록.
 * — ContentTabBar 탭 전환 시 이탈 확인 Dialog를 띄우기 위함
 */
export function useSubviewLock() {
  const { acquire, release } = useSubviewLockContext("useSubviewLock");

  useEffect(() => {
    acquire();
    return () => release();
  }, [acquire, release]);
}
