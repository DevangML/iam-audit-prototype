import type { Audit } from '../../data/types';
import { TIMELINE_EVENTS } from '../../data/demo-audit';

export default function OverviewTab({ audit }: { audit: Audit }) {
  const timelineEvents = buildTimeline(audit);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, paddingTop: 24 }}>
      {/* App progress */}
      <div>
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-card)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Application progress</h2>
          </div>
          {audit.apps.map((app) => (
            <div key={app.code} style={appRowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                <AppCodeBadge code={app.code} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{app.name}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--border-card)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${app.progress}%`,
                    background: progressColor(app.progress),
                    borderRadius: 4,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, minWidth: 36, textAlign: 'right', color: progressColor(app.progress) }}>
                  {app.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Audit details */}
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', padding: 24, marginTop: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Audit details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Review type', value: audit.reviewType },
              { label: 'Organisation', value: audit.org },
              { label: 'Period', value: audit.period },
              { label: 'Created', value: formatDate(audit.createdAt ?? '') },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 120, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Timeline</h2>
          <div style={{ position: 'relative' }}>
            {timelineEvents.map((event, idx) => (
              <div key={event.label} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: idx < timelineEvents.length - 1 ? 24 : 0 }}>
                {/* Connector line */}
                {idx < timelineEvents.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: 10,
                    top: 20,
                    bottom: 0,
                    width: 2,
                    background: event.done ? 'var(--brand-500)' : 'var(--border-card)',
                  }} />
                )}
                {/* Dot */}
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: event.active ? 'var(--brand-500)' : event.done ? '#1b7a3d' : 'var(--border-card)',
                  border: event.active ? '3px solid #e3f2fd' : 'none',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}>
                  {event.done && !event.active && (
                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>
                  )}
                </div>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontSize: 14, fontWeight: event.active ? 700 : 500, color: event.done || event.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {event.label}
                  </div>
                  {event.date && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{event.date}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildTimeline(audit: Audit) {
  const statusOrder: Record<string, number> = {
    draft: 0,
    in_progress: 1,
    pending_l1: 2,
    pending_l2: 3,
    approved: 4,
    sent_back: 2,
  };
  const currentIdx = statusOrder[audit.status] ?? 1;

  const events = [
    { label: 'Draft', date: '1 May 2026' },
    { label: 'In progress', date: '3 May 2026' },
    { label: 'Pending L1', date: audit.status === 'pending_l1' || statusOrder[audit.status] >= 2 ? '' : null },
    { label: 'Pending L2', date: audit.status === 'pending_l2' || statusOrder[audit.status] >= 3 ? '' : null },
    { label: 'Approved', date: audit.status === 'approved' ? '29 May 2026' : null },
  ];

  return events.map((e, i) => ({
    ...e,
    done: i < currentIdx,
    active: i === currentIdx,
  }));
}

function progressColor(pct: number): string {
  if (pct >= 80) return '#1b7a3d';
  if (pct >= 50) return '#1976d2';
  if (pct >= 30) return '#f57c00';
  return '#c62828';
}

function formatDate(d: string) {
  if (!d) return 'N/A';
  const date = new Date(d);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function AppCodeBadge({ code }: { code: string }) {
  const colors: Record<string, string> = { P: '#1565c0', B: '#6a1b9a', T: '#00695c', M: '#4e342e', V: '#1b5e20' };
  const c = colors[code] ?? '#455a64';
  return (
    <span style={{
      width: 28, height: 28, borderRadius: 6,
      background: `${c}18`,
      color: c,
      border: `1px solid ${c}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
      flexShrink: 0,
    }}>
      {code}
    </span>
  );
}

const appRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '14px 24px',
  borderBottom: '1px solid var(--border-card)',
};
