interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  color?: string;
}

export default function ProgressRing({ value, size = 40, stroke = 3.5, color = 'var(--brand-500)' }: ProgressRingProps) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const cx = size / 2;

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke="var(--border-card)"
        strokeWidth={stroke}
      />
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={value === 100 ? '#1b7a3d' : color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x={cx} y={cx + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size < 36 ? 8 : 10}
        fontWeight={700}
        fill="var(--text-primary)"
        fontFamily="var(--font-sans)"
      >
        {value}%
      </text>
    </svg>
  );
}
