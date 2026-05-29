import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../../store/auditStore';
import StatusChip from '../../components/StatusChip';

export default function RejectionsTab({ auditId }: { auditId: string }) {
  const { rejections, corrections } = useAuditStore();
  const navigate = useNavigate();
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [fromFilter, setFromFilter] = useState<string>('all');

  const filtered = rejections.filter(r => {
    if (scopeFilter !== 'all' && r.scope.toLowerCase() !== scopeFilter) return false;
    if (fromFilter !== 'all' && r.rejectedByLevel.toLowerCase() !== fromFilter) return false;
    return true;
  });

  // Group by app
  const byApp: Record<string, typeof filtered> = {};
  filtered.forEach(r => {
    if (!byApp[r.app]) byApp[r.app] = [];
    byApp[r.app].push(r);
  });

  function getLinkedCorrection(rejectionId: string) {
    return corrections.find(c => c.rejectionId === rejectionId);
  }

  function handleViewInReview(r: typeof rejections[0]) {
    navigate(`/audit-ops/audit/${auditId}?tab=review&app=${r.app}`);
  }

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header + filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Rejections</h2>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 22, height: 22, borderRadius: 11,
            background: 'var(--chip-sentback-bg)', color: 'var(--chip-sentback-text)',
            fontSize: 11, fontWeight: 700, padding: '0 6px',
          }}>
            {rejections.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            style={filterStyle}
            value={scopeFilter}
            onChange={e => setScopeFilter(e.target.value)}
          >
            <option value="all">All scopes</option>
            <option value="subtask">Subtask</option>
            <option value="task">Task</option>
            <option value="application">Application</option>
            <option value="audit">Audit</option>
          </select>
          <select
            style={filterStyle}
            value={fromFilter}
            onChange={e => setFromFilter(e.target.value)}
          >
            <option value="all">From: All</option>
            <option value="l1">L1 reviewer</option>
            <option value="l2">L2 reviewer</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>No rejections</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>All items have been reviewed and approved.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(byApp).map(([app, rejs]) => (
            <div key={app}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                {app}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rejs.map(r => {
                  const linked = getLinkedCorrection(r.id);
                  return (
                    <RejectionCard
                      key={r.id}
                      rejection={r}
                      linkedCorrection={linked}
                      onViewInReview={() => handleViewInReview(r)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RejectionCard({
  rejection,
  linkedCorrection,
  onViewInReview,
}: {
  rejection: any;
  linkedCorrection: any;
  onViewInReview: () => void;
}) {
  const { createCorrection } = useAuditStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [corrTitle, setCorrTitle] = useState(`Correction — ${rejection.headline}`);
  const [corrDesc, setCorrDesc] = useState('');

  function handleCreate() {
    createCorrection({
      title: corrTitle,
      description: corrDesc,
      rejectionId: rejection.id,
      app: rejection.app,
      appCode: rejection.appCode,
      scope: 'Application',
    });
    setShowCreateForm(false);
  }

  return (
    <div
      className="border-accent-reject"
      style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-card)',
      padding: '18px 20px',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ScopeBadge scope={rejection.scope} />
            <AppBadge code={rejection.appCode} name={rejection.app} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            {rejection.headline}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Rejected by <strong>{rejection.rejectedBy}</strong> · {rejection.date}
          </div>
          {rejection.comment && (
            <div style={{
              fontSize: 13, color: 'var(--text-primary)',
              background: 'var(--surface-page)',
              borderRadius: 6, padding: '10px 12px',
              borderLeft: '3px solid var(--border-card)',
              fontStyle: 'italic',
            }}>
              "{rejection.comment}"
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <button
          className="btn btn--secondary btn--sm"
          onClick={onViewInReview}
        >
          View in Review
        </button>
        {linkedCorrection ? (
          <span style={{
            fontSize: 12, fontWeight: 600,
            padding: '5px 10px', borderRadius: 6,
            background: 'var(--chip-correction-bg)',
            color: 'var(--chip-correction-text)',
          }}>
            ↗ Correction created
          </span>
        ) : (
          <button
            className="btn btn--ghost btn--sm"
            style={{ color: 'var(--status-correction)', borderColor: 'var(--status-correction)' }}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            Create correction
          </button>
        )}
      </div>

      {/* Create correction inline form */}
      {showCreateForm && !linkedCorrection && (
        <div style={{
          marginTop: 14, padding: '14px 16px',
          background: 'var(--surface-page)',
          borderRadius: 8, border: '1px solid var(--border-card)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-correction)', marginBottom: 10 }}>
            🔶 CREATE CORRECTION
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Title</label>
            <input
              style={inputStyle}
              value={corrTitle}
              onChange={e => setCorrTitle(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, height: 64, resize: 'vertical' }}
              value={corrDesc}
              onChange={e => setCorrDesc(e.target.value)}
              placeholder="Describe the correction needed..."
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--primary btn--sm" onClick={handleCreate}>
              Create correction
            </button>
            <button className="btn btn--secondary btn--sm" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScopeBadge({ scope }: { scope: string }) {
  const labels: Record<string, string> = {
    subtask: 'Subtask',
    task: 'Task',
    application: 'Application',
    audit: 'Audit',
  };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
      background: 'var(--chip-sentback-bg)', color: 'var(--chip-sentback-text)',
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {labels[scope] ?? scope}
    </span>
  );
}

function AppBadge({ code, name }: { code: string; name: string }) {
  const colors: Record<string, string> = { P: '#1565c0', B: '#6a1b9a', T: '#00695c', M: '#4e342e', V: '#1b5e20' };
  const c = colors[code] ?? '#455a64';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
      background: `${c}12`, color: c, border: `1px solid ${c}30`,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)' }}>{code}</span>
      {name}
    </span>
  );
}

const filterStyle: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 7, border: '1.5px solid var(--border-card)',
  fontSize: 13, background: 'var(--surface-card)', color: 'var(--text-primary)',
  fontFamily: 'var(--font-sans)', cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1.5px solid var(--border-card)',
  borderRadius: 7, fontSize: 13, fontFamily: 'var(--font-sans)',
  background: 'var(--surface-card)', boxSizing: 'border-box',
};
