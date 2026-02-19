import { useState, useEffect, useRef } from "react";

/**
 * 차트 진입 애니메이션 트리거.
 * - RAF 취소하지 않음: cleanup에서 cancelAnimationFrame 제거 → animated가 true로 설정됨
 * - innerWidth 0 시 fallback: 레이아웃 대기 중에도 애니메이션 트리거
 */
export function useEntryAnimation(dataLength: number, innerWidth: number) {
  const [animated, setAnimated] = useState(false);
  const prevKey = useRef("");
  const stableWidth = Math.max(innerWidth, 1);

  useEffect(() => {
    const key = `${dataLength}-${stableWidth}`;
    if (key !== prevKey.current) {
      prevKey.current = key;
      setAnimated(false);
      // 이중 RAF: 브라우저가 DOM을 그린 뒤 애니메이션 시작
      // cleanup에서 cancel 금지 → unmount 시에도 setAnimated(true) 실행되면 no-op
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimated(true));
      });
    }
  }, [dataLength, stableWidth]);

  return animated;
}
