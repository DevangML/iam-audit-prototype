import { useAuditStore } from '../../store/auditStore';
import { selectAllCorrectionsApproved } from '../../store/auditStore';

export default function CorrectionsTab({ auditId }: { auditId: string }) {
  const {
    corrections, rejections, audit,
    approveCorrection, rejectCorrection,
    reforwardToL1, reforwardToL2,
  } = useAuditStore();

  const approvedCount = corrections.filter(c => c.status === 'approved').length;
  const total = corrections.length;
  const allApproved = selectAllCorrectionsApproved(corrections);

  const isL2Roundtrip = rejections.some(r => r.rejectedByLevel === 'L2');

  return (
    <div style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Corrections</h2>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 22, height: 22, borderRadius: 11,
          background: 'var(--chip-correction-bg)', color: 'var(--chip-correction-text)',
          fontSize: 11, fontWeight: 700, padding: '0 6px',
        }}>
          {total}
        </span>
      </div>

      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>No corrections yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            Create corrections from the Rejections tab to track remediation work.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {corrections.map(c => {
            const linkedRejection = rejections.find(r => r.id === c.rejectionId);
            return (
              <CorrectionCard
                key={c.id}
                correction={c}
                linkedRejection={linkedRejection}
                onApprove={() => approveCorrection(c.id)}
                onReject={() => rejectCorrection(c.id)}
              />
            );
          })}
        </div>
      )}

      {/* Sticky re-forward footer */}
      {total > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: 'var(--surface-card)', borderTop: '1px solid var(--border-card)',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 -4px 16px rgba(10,22,40,0.08)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {allApproved ? (
              <span style={{ color: '#1b7a3d', fontWeight: 600 }}>✓ All corrections approved — ready to re-forward</span>
            ) : (
              <span>{approvedCount} of {total} corrections approved</span>
            )}
          </div>
          <button
            className="btn btn--primary"
            disabled={!allApproved}
            onClick={isL2Roundtrip ? reforwardToL2 : reforwardToL1}
            title={!allApproved ? 'Approve all corrections before re-forwarding' : ''}
          >
            {isL2Roundtrip ? 'Re-forward to L2' : 'Re-forward to L1'}
          </button>
        </div>
      )}
    </div>
  );
}

function CorrectionCard({
  correction,
  linkedRejection,
  onApprove,
  onReject,
}: {
  correction: any;
  linkedRejection: any;
  onApprove: () => void;
  onReject: () => void;
}) {
  const pct = correction.progressTotal > 0
    ? Math.round((correction.progressDone / correction.progressTotal) * 100)
    : 0;

  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: 'var(--chip-progress-bg)', text: 'var(--chip-progress-text)' },
    in_progress: { bg: 'var(--chip-progress-bg)', text: 'var(--chip-progress-text)' },
    approved: { bg: 'var(--chip-approved-bg)', text: 'var(--chip-approved-text)' },
    rejected: { bg: 'var(--chip-sentback-bg)', text: 'var(--chip-sentback-text)' },
  };
  const sc = statusColors[correction.status] ?? statusColors.open;

  return (
    <div
      className="border-accent-correction"
      style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-card)',
      padding: '18px 20px',
    }}>
      {/* Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4,
          background: 'var(--chip-correction-bg)', color: 'var(--chip-correction-text)',
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
        }}>CORRECTION</span>
        <AppBadge code={correction.appCode} name={correction.app} />
        <ScopeBadge scope={correction.scope} />
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        {correction.title}
      </div>

      {linkedRejection && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
          ↳ Spawned from: <span style={{ fontWeight: 600 }}>{linkedRejection.headline}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--hero-start), var(--hero-end))',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700,
          }}>{correction.assigneeAvatar}</div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{correction.assignee}</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Due: <strong>{correction.due}</strong></span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{correction.progressDone}/{correction.progressTotal} subtasks</span>
      </div>

      <div style={{ height: 6, borderRadius: 3, background: 'var(--border-card)', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: pct === 100 ? '#1b7a3d' : 'var(--brand-500)',
          borderRadius: 3, transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: sc.bg, color: sc.text }}>
          {correction.status}
        </span>
        {correction.status !== 'approved' && correction.status !== 'rejected' && (
          <>
            <button className="btn btn--success btn--sm" onClick={onApprove}>Approve</button>
            <button className="btn btn--danger-outline btn--sm" onClick={onReject}>Reject</button>
          </>
        )}
      </div>
    </div>
  );
}

function ScopeBadge({ scope }: { scope: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
      background: 'var(--chip-draft-bg)', color: 'var(--chip-draft-text)',
    }}>{scope}</span>
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
