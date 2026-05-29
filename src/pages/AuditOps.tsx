import { useNavigate } from 'react-router-dom';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { useAuditStore } from '../store/auditStore';
import Heatmap, { HeatmapLegend } from '../components/Heatmap';
import { HeatmapLegend as _ } from '../components/Heatmap';
import StatusChip from '../components/StatusChip';

export default function AuditOps() {
  const ok = useRoleGuard(['lead']);
  const navigate = useNavigate();
  const { audit, audit2 } = useAuditStore();

  if (!ok) return null;

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={heroStyle}>
        <div style={heroInner}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ElasticRun · Audit Ops
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Audit Ops</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
              Manage ITGC audits, tasks, and review cycles for ElasticRun
            </p>
          </div>
          <button
            className="btn"
            style={{ background: '#fff', color: 'var(--brand-700)', fontWeight: 700, height: 44, padding: '0 24px', borderRadius: 10, fontSize: 14 }}
            onClick={() => navigate('/audit-ops/create')}
          >
            + Create audit
          </button>
        </div>
      </div>

      <div className="page-wrapper" style={{ paddingTop: 32 }}>
        {/* KPI tiles */}
        <div style={kpiGridStyle}>
          <KPITile label="Audits in progress" value={2} icon="📊" />
          <KPITile label="Overdue tasks" value={5} icon="⏰" accent="var(--status-correction)" />
          <KPITile label="Pending L1 sign-off" value={1} icon="✍️" accent="var(--status-pending)" />
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>All audits</h2>
          <select style={{ height: 36, padding: '0 12px', borderRadius: 8, border: '1.5px solid var(--border-card)', background: 'var(--surface-card)', fontSize: 13, color: 'var(--text-primary)', width: 140 }}>
            <option>All periods</option>
            <option>May 2026</option>
            <option>Apr 2026</option>
          </select>
          <select style={{ height: 36, padding: '0 12px', borderRadius: 8, border: '1.5px solid var(--border-card)', background: 'var(--surface-card)', fontSize: 13, color: 'var(--text-primary)', width: 160 }}>
            <option>All statuses</option>
            <option>In progress</option>
            <option>Sent back</option>
            <option>Approved</option>
          </select>
        </div>

        {/* Heatmap legend */}
        <div style={{ marginBottom: 16 }}>
          <HeatmapLegend />
        </div>

        {/* Audit cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AuditCard audit={audit} onClick={() => navigate('/audit-ops/audit/audit-1')} />
          <AuditCard audit={audit2} onClick={() => navigate('/audit-ops/audit/audit-2')} withRemediation />
        </div>
      </div>
    </div>
  );
}

function KPITile({ label, value, icon, accent }: { label: string; value: number; icon: string; accent?: string }) {
  return (
    <div style={kpiTileStyle}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: accent ?? 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function AuditCard({ audit, onClick, withRemediation }: { audit: any; onClick: () => void; withRemediation?: boolean }) {
  return (
    <div style={auditCardStyle}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {audit.title}
            </h3>
            <StatusChip variant={audit.status} />
            {withRemediation && (
              <StatusChip variant="with_l1_remediation" label="With L1 remediation" />
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {audit.reviewType} · {audit.org} · {audit.period}
          </div>
        </div>
        <button className="btn btn--secondary btn--sm" onClick={onClick}>
          Open audit →
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
          <span>Overall progress</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{audit.percentComplete}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--border-card)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${audit.percentComplete}%`, background: 'var(--brand-500)', borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Heatmap apps={audit.apps} size="sm" />
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          {audit.apps.map((app: any) => (
            <span key={app.code}>{app.name} {app.progress}%</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--hero-start), var(--hero-end))',
  paddingTop: 'var(--header-h)',
};

const heroInner: React.CSSProperties = {
  maxWidth: 'calc(var(--content-max) + var(--page-pad) * 2)',
  margin: '0 auto',
  padding: '40px var(--page-pad) 36px',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 24,
};

const kpiGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 16,
  marginBottom: 32,
};

const kpiTileStyle: React.CSSProperties = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-card)',
  padding: '20px 24px',
};

const auditCardStyle: React.CSSProperties = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-card)',
  padding: 24,
};
