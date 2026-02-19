import { useMemo, useCallback, useState, memo } from "react";
import * as d3 from "d3";
import { useChartDimensions } from "./useChartDimensions";
import { useTooltipHandlers } from "./useTooltipHandlers";
import { useEntryAnimation } from "./useEntryAnimation";

const MAX_POINTS = 800;

/** 대량 데이터 시 시각화용 균등 샘플링 (분포 유지) */
function sampleScatterData<T extends { x: number; y: number }>(
  data: T[],
  maxPoints: number
): T[] {
  if (data.length <= maxPoints) return data;
  const step = data.length / maxPoints;
  const sampled: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.min(Math.floor(i * step), data.length - 1);
    sampled.push(data[idx]);
  }
  return sampled;
}

interface Props {
  data: { x: number; y: number }[];
  color?: string;
  xLabel?: string;
  yLabel?: string;
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
  height?: number;
  xDomain?: [number, number];
}

export const D3ScatterChart = memo(function D3ScatterChart({
  data,
  color = "#6366f1",
  xLabel,
  yLabel,
  xFormat = (v) => String(v),
  yFormat = (v) => String(v),
  height = 380,
  xDomain,
}: Props) {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const { containerRef, width, innerWidth, innerHeight } = useChartDimensions(margin, height);
  const { onHover, onLeave } = useTooltipHandlers();

  const displayData = useMemo(
    () => sampleScatterData(data, MAX_POINTS),
    [data],
  );
  const animated = useEntryAnimation(displayData.length, innerWidth);
  const [hovered, setHovered] = useState<{ x: number; y: number } | null>(null);

  const { xScale, yScale } = useMemo(() => {
    const xMin = xDomain?.[0] ?? (d3.min(data, (d) => d.x) ?? 0);
    const xMax = xDomain?.[1] ?? (d3.max(data, (d) => d.x) ?? 1);
    const yMax = d3.max(data, (d) => d.y) ?? 1;
    const xScale = d3.scaleLinear().domain([xMin, xMax * 1.05]).range([0, innerWidth]).nice();
    const yScale = d3.scaleLinear().domain([0, yMax * 1.05]).range([innerHeight, 0]).nice();
    return { xScale, yScale };
  }, [data, innerWidth, innerHeight, xDomain]);

  const xTicks = xScale.ticks(6);
  const yTicks = yScale.ticks(5);

  const quadtree = useMemo(
    () => d3.quadtree<{ x: number; y: number }>().x((d) => d.x).y((d) => d.y).addAll(displayData),
    [displayData],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const svg = e.currentTarget.ownerSVGElement as SVGSVGElement;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left - margin.left;
      const my = e.clientY - rect.top - margin.top;
      const dataX = xScale.invert(mx);
      const dataY = yScale.invert(my);
      const nearest = quadtree.find(dataX, dataY);
      if (nearest) {
        setHovered(nearest);
        onHover(e, [
          { label: xLabel ?? "X", value: xFormat(nearest.x), color },
          { label: yLabel ?? "Y", value: yFormat(nearest.y) },
        ]);
      }
    },
    [xScale, yScale, quadtree, onHover, xFormat, yFormat, xLabel, yLabel, color, margin.left, margin.top],
  );

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
    onLeave();
  }, [onLeave]);

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height} className="select-none">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yTicks.map((t) => (
            <g key={`y-${t}`}>
              <line x1={0} x2={innerWidth} y1={yScale(t)} y2={yScale(t)} stroke="#e5e7eb" strokeDasharray="3,3" />
              <text x={-8} y={yScale(t)} dy="0.35em" textAnchor="end" fontSize={10} fill="#6b7280">{yFormat(t)}</text>
            </g>
          ))}
          {xTicks.map((t) => (
            <g key={`x-${t}`}>
              <line x1={xScale(t)} x2={xScale(t)} y1={0} y2={innerHeight} stroke="#f3f4f6" strokeDasharray="2,4" />
              <text x={xScale(t)} y={innerHeight + 16} textAnchor="middle" fontSize={10} fill="#6b7280">{xFormat(t)}</text>
            </g>
          ))}

          {displayData.map((d, i) => (
            <circle
              key={`${d.x}-${d.y}-${i}`}
              cx={xScale(d.x)}
              cy={yScale(d.y)}
              r={animated ? 2.5 : 0}
              fill={color}
              opacity={animated ? 0.2 : 0}
              style={{
                transition: `r 400ms ease ${(i % 80) * 5}ms, opacity 400ms ease ${(i % 80) * 5}ms`,
              }}
            />
          ))}

          {hovered && (
            <>
              <line x1={xScale(hovered.x)} x2={xScale(hovered.x)} y1={0} y2={innerHeight}
                stroke={color} strokeWidth={1} strokeDasharray="4,3" opacity={0.4} className="pointer-events-none" />
              <line x1={0} x2={innerWidth} y1={yScale(hovered.y)} y2={yScale(hovered.y)}
                stroke={color} strokeWidth={1} strokeDasharray="4,3" opacity={0.4} className="pointer-events-none" />
              <circle cx={xScale(hovered.x)} cy={yScale(hovered.y)} r={14}
                fill={color} opacity={0.1} className="pointer-events-none" />
              <circle cx={xScale(hovered.x)} cy={yScale(hovered.y)} r={5}
                fill="white" stroke={color} strokeWidth={2.5} className="pointer-events-none" />
            </>
          )}

          <rect x={0} y={0} width={innerWidth} height={innerHeight}
            fill="transparent" className="cursor-crosshair"
            onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />

          {xLabel && <text x={innerWidth / 2} y={innerHeight + 38} textAnchor="middle" fontSize={12} fill="#6b7280">{xLabel}</text>}
          {yLabel && <text transform={`translate(-45, ${innerHeight / 2}) rotate(-90)`} textAnchor="middle" fontSize={12} fill="#6b7280">{yLabel}</text>}
        </g>
      </svg>
    </div>
  );
});
