import { useState } from 'react';
import type { AppProgress } from '../data/types';

interface HeatmapProps {
  apps: AppProgress[];
  size?: 'sm' | 'md';
}

function progressToColor(pct: number): string {
  if (pct >= 80) return '#1b7a3d';
  if (pct >= 60) return '#2e7d32';
  if (pct >= 40) return '#f57c00';
  if (pct >= 20) return '#e65100';
  return '#c62828';
}

export default function Heatmap({ apps, size = 'md' }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ app: AppProgress; x: number; y: number } | null>(null);
  const sq = size === 'sm' ? 22 : 26;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {apps.map((app) => (
        <div
          key={app.code}
          onMouseEnter={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setTooltip({ app, x: rect.left, y: rect.bottom + 6 });
          }}
          onMouseLeave={() => setTooltip(null)}
          style={{
            width: sq,
            height: sq,
            borderRadius: 4,
            background: progressToColor(app.progress),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: size === 'sm' ? 9 : 10,
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          {app.code}
        </div>
      ))}

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x,
            background: 'var(--text-primary)',
            color: '#fff',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 500,
            zIndex: 999,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {tooltip.app.name} — {tooltip.app.progress}%
        </div>
      )}
    </div>
  );
}

export function HeatmapLegend() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
      <span>Legend:</span>
      {[
        { color: '#c62828', label: '<20%' },
        { color: '#e65100', label: '20–40%' },
        { color: '#f57c00', label: '40–60%' },
        { color: '#2e7d32', label: '60–80%' },
        { color: '#1b7a3d', label: '80%+' },
      ].map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
