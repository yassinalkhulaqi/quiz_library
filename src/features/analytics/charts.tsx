import React from 'react';

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
  secondary?: number;
}

function useMeasure() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

export function BarChart({
  data,
  height = 200,
  highlightIndex,
}: {
  data: ChartDatum[];
  height?: number;
  highlightIndex?: number;
}) {
  const { ref, width } = useMeasure();
  const pad = { top: 16, right: 8, bottom: 28, left: 32 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const groupW = data.length > 0 ? innerW / data.length : 0;
  const barW = Math.min(44, groupW * 0.6);

  return (
    <div ref={ref} className="w-full" style={{ height }} aria-label="Bar chart">
      {width > 0 && (
        <svg width={width} height={height}>
          {[0.25, 0.5, 0.75, 1].map((f) => {
            const y = pad.top + innerH - innerH * f;
            return (
              <g key={f}>
                <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="var(--border)" strokeDasharray="3 4" strokeWidth="1" />
                <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--soft)">
                  {Math.round(max * f)}
                </text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const h = (d.value / max) * innerH;
            const x = pad.left + groupW * i + (groupW - barW) / 2;
            const y = pad.top + innerH - h;
            const isHighlight = highlightIndex === i;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(h, 2)}
                  rx={6}
                  fill={d.color ?? 'var(--brand-500)'}
                  opacity={isHighlight ? 1 : 0.82}
                  className="transition-opacity"
                />
                <text x={pad.left + groupW * i + groupW / 2} y={height - 10} textAnchor="middle" fontSize="10" fill="var(--soft)">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export function GroupedBarChart({
  data,
  height = 220,
}: {
  data: { label: string; a: number; b: number }[];
  height?: number;
}) {
  const { ref, width } = useMeasure();
  const pad = { top: 16, right: 8, bottom: 28, left: 32 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.flatMap((d) => [d.a, d.b]), 1);
  const groupW = data.length > 0 ? innerW / data.length : 0;
  const barW = Math.min(16, groupW * 0.28);

  return (
    <div ref={ref} className="w-full" style={{ height }} aria-label="Grouped bar chart">
      {width > 0 && (
        <svg width={width} height={height}>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={pad.left}
              y1={pad.top + innerH - innerH * f}
              x2={width - pad.right}
              y2={pad.top + innerH - innerH * f}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
          ))}
          {data.map((d, i) => {
            const cx = pad.left + groupW * i + groupW / 2;
            const hA = (d.a / max) * innerH;
            const hB = (d.b / max) * innerH;
            return (
              <g key={i}>
                <rect x={cx - barW - 1} y={pad.top + innerH - hA} width={barW} height={Math.max(hA, 2)} rx={4} fill="var(--brand-500)" />
                <rect x={cx + 1} y={pad.top + innerH - hB} width={barW} height={Math.max(hB, 2)} rx={4} fill="var(--accent-500)" />
                <text x={cx} y={height - 10} textAnchor="middle" fontSize="10" fill="var(--soft)">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export function LineChart({
  data,
  height = 200,
  color = 'var(--brand-500)',
}: {
  data: ChartDatum[];
  height?: number;
  color?: string;
}) {
  const { ref, width } = useMeasure();
  const pad = { top: 16, right: 12, bottom: 28, left: 32 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);

  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const pts = data.map((d, i) => ({
    x: pad.left + stepX * i,
    y: pad.top + innerH - ((d.value - min) / Math.max(max - min, 1)) * innerH,
  }));

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div ref={ref} className="w-full" style={{ height }} aria-label="Line chart">
      {width > 0 && (
        <svg width={width} height={height}>
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              x1={pad.left}
              y1={pad.top + innerH * f}
              x2={width - pad.right}
              y2={pad.top + innerH * f}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
          ))}
          <path d={`${path} L${pad.left + stepX * (data.length - 1)},${pad.top + innerH} L${pad.left},${pad.top + innerH} Z`} fill={color} opacity="0.08" />
          <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="var(--surface)" stroke={color} strokeWidth="2" />
              <text x={p.x} y={height - 8} textAnchor="middle" fontSize="9" fill="var(--soft)">
                {data[i].label}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

export function DonutChart({
  data,
  size = 150,
  thickness = 16,
  centerLabel,
  centerValue,
}: {
  data: ChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let offset = 0;

  const arc = (startAngle: number, endAngle: number) => {
    const start = ((startAngle - 90) * Math.PI) / 180;
    const end = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} role="img" aria-label="Donut chart">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--elevated)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 360 : 0;
          const a = offset;
          offset += pct;
          if (pct <= 0) return null;
          return (
            <path
              key={i}
              d={arc(a, a + pct)}
              fill="none"
              stroke={d.color ?? 'var(--brand-500)'}
              strokeWidth={thickness}
              strokeLinecap="butt"
            />
          );
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text)">
          {centerValue}
        </text>
        {centerLabel ? (
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="var(--soft)">
            {centerLabel}
          </text>
        ) : null}
      </svg>
    </div>
  );
}

export function ScoreRing({
  value,
  size = 130,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const thickness = 12;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--elevated)" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="block text-2xl font-bold text-text">{Math.round(pct)}%</span>
        {label ? <span className="block text-[10px] uppercase tracking-wide text-soft">{label}</span> : null}
      </div>
    </div>
  );
}

export function ChartLegend({ data }: { data: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {data.map((d) => (
        <span key={d.label} className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
          {d.label}
        </span>
      ))}
    </div>
  );
}