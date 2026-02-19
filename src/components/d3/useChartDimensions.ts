import { useRef, useState, useEffect } from "react";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const DEFAULT_MARGIN: Margin = { top: 20, right: 20, bottom: 40, left: 50 };
const MIN_WIDTH = 400;

export function useChartDimensions(margin: Margin = DEFAULT_MARGIN, minHeight = 320) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MIN_WIDTH);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = (w: number) => {
      if (w > 0) setWidth(w);
    };
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    updateWidth(el.clientWidth);
    // 첫 페인트 후 레이아웃이 안정될 때 재측정 (탭 전환/그리드 등)
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => updateWidth(el.clientWidth));
    });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const innerWidth = Math.max(width - margin.left - margin.right, 100);
  const innerHeight = Math.max(minHeight - margin.top - margin.bottom, 0);

  return { containerRef, width, height: minHeight, innerWidth, innerHeight, margin };
}
