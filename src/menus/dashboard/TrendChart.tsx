import { useEffect, useId, useRef, useState } from "react";
import { TextButton } from "@xoheeoh/components";
import { formatAmount, formatDate } from "@utils";
import type { DailyAmount } from "./dashboardData";
import styles from "./Dashboard.module.css";

/** 선 두 개의 색. 파랑·초록은 색약 구분 검사(dataviz 검사 스크립트)를 통과한 조합이다. */
const SERIES = [
  { key: "charge", label: "충전", color: "#0d52a9" },
  { key: "use", label: "사용", color: "#5c8a0b" },
] as const;

/** 그래프 최소 높이. 담는 상자가 더 크면 그 높이를 쓴다. */
const MIN_HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 28, left: 56 };

/** 원 단위를 "1,200만" 같은 축 글자로 */
function axisLabel(value: number) {
  return `${formatAmount(Math.round(value / 10_000))}만`;
}

/** 축 눈금 위쪽 값. 가장 큰 값보다 살짝 크고 보기 좋은 단위로 올린다. */
function niceMax(max: number) {
  const unit = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / unit) * unit;
}

type TrendChartProps = {
  data: DailyAmount[];
  title: string;
};

/** 최근 N일 충전·사용 금액 선 그래프. 마우스를 올리면 그날 숫자가 뜨고, "표로 보기"로 같은 값을 표로 볼 수 있다. */
export function TrendChart({ data, title }: TrendChartProps) {
  const titleId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: MIN_HEIGHT });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  // 담는 상자 크기에 맞춰 그래프 크기를 정한다. 창 크기가 바뀌면 다시 잰다.
  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        width: entry.contentRect.width,
        height: Math.max(MIN_HEIGHT, Math.floor(entry.contentRect.height)),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [showTable]);

  const { width, height } = size;
  const plotWidth = Math.max(0, width - PADDING.left - PADDING.right);
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const maxValue = niceMax(Math.max(...data.flatMap((d) => [d.charge, d.use])));
  const x = (index: number) =>
    PADDING.left +
    (data.length <= 1 ? 0 : (index / (data.length - 1)) * plotWidth);
  const y = (value: number) =>
    PADDING.top + plotHeight - (value / maxValue) * plotHeight;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => maxValue * ratio);

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left - PADDING.left) / plotWidth;
    setHoverIndex(
      Math.min(
        data.length - 1,
        Math.max(0, Math.round(ratio * (data.length - 1))),
      ),
    );
  };

  const hovered = hoverIndex === null ? null : data[hoverIndex]!;

  return (
    <figure className={styles.chart} aria-labelledby={titleId}>
      <div className={styles.chartHeader}>
        <figcaption id={titleId} className="text-subtitle2">
          {title}
        </figcaption>
        <div className="row-center gap-12">
          <ul className={styles.legend} aria-label="범례">
            {SERIES.map((series) => (
              <li key={series.key} className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ background: series.color }}
                  aria-hidden="true"
                />
                {series.label}
              </li>
            ))}
          </ul>
          <TextButton
            size="sm"
            color="neutral"
            onClick={() => setShowTable((v) => !v)}
            label={showTable ? "그래프로 보기" : "표로 보기"}
          />
        </div>
      </div>

      {showTable ? (
        <div className={styles.chartTableWrap}>
          <div className={styles.chartTableScroll}>
            <table className="table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th className={styles.amountCell}>충전</th>
                  <th className={styles.amountCell}>사용</th>
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((d) => (
                  <tr key={d.date}>
                    <td>{formatDate(d.date)}</td>
                    <td className={styles.amountCell}>
                      {formatAmount(d.charge)}원
                    </td>
                    <td className={styles.amountCell}>
                      {formatAmount(d.use)}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div ref={wrapRef} className={styles.chartPlot}>
          {width > 0 && (
            <svg
              width={width}
              height={height}
              role="img"
              aria-label={`${title}. 자세한 값은 표로 보기에서 확인할 수 있습니다.`}
              onMouseMove={handleMove}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* 가로 눈금선과 축 글자 */}
              {ticks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={y(tick)}
                    y2={y(tick)}
                    className={styles.gridLine}
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y(tick)}
                    className={styles.axisText}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {axisLabel(tick)}
                  </text>
                </g>
              ))}
              {/* 날짜 글자: 5일 간격 */}
              {data.map((d, index) =>
                index % 5 === 0 || index === data.length - 1 ? (
                  <text
                    key={d.date}
                    x={x(index)}
                    y={height - 8}
                    className={styles.axisText}
                    textAnchor="middle"
                  >
                    {formatDate(d.date).slice(5)}
                  </text>
                ) : null,
              )}
              {/* 선 */}
              {SERIES.map((series) => (
                <polyline
                  key={series.key}
                  points={data
                    .map((d, index) => `${x(index)},${y(d[series.key])}`)
                    .join(" ")}
                  fill="none"
                  stroke={series.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
              {/* 마우스를 올린 날: 세로선과 점 */}
              {hovered && hoverIndex !== null && (
                <g>
                  <line
                    x1={x(hoverIndex)}
                    x2={x(hoverIndex)}
                    y1={PADDING.top}
                    y2={PADDING.top + plotHeight}
                    className={styles.crosshair}
                  />
                  {SERIES.map((series) => (
                    <circle
                      key={series.key}
                      cx={x(hoverIndex)}
                      cy={y(hovered[series.key])}
                      r={5}
                      fill={series.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </g>
              )}
            </svg>
          )}

          {hovered && hoverIndex !== null && (
            <div
              className={styles.tooltip}
              style={{ left: x(hoverIndex), top: PADDING.top }}
              // 왼쪽 끝 근처는 오른쪽으로, 오른쪽 끝 근처는 왼쪽으로 펼친다.
              data-side={x(hoverIndex) > width / 2 ? "left" : "right"}
            >
              <div className={styles.tooltipDate}>
                {formatDate(hovered.date)}
              </div>
              {SERIES.map((series) => (
                <div key={series.key} className={styles.tooltipRow}>
                  <span
                    className={styles.legendSwatch}
                    style={{ background: series.color }}
                    aria-hidden="true"
                  />
                  <span>{series.label}</span>
                  <strong>{formatAmount(hovered[series.key])}원</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
