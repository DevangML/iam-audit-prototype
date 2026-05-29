import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/auditStore';
import { getSession } from '../hooks/useSession';
import StatusChip from '../components/StatusChip';

export default function AuditReview() {
  const navigate = useNavigate();
  const session = getSession();
  const { audit, audit2 } = useAuditStore();
  const isL2 = session?.role === 'l2';

  // Build inbox items based on current state
  const items = [];

  if (audit.status === 'pending_l1' && !isL2) {
    items.push({ audit: audit, chip: 'pending_l1' as const, due: '30 May 2026' });
  }
  if (audit.status === 'pending_l2' && isL2) {
    items.push({ audit: audit, chip: 'pending_l2' as const, due: '30 May 2026' });
  }
  if (audit.status === 'sent_back' && audit.routing_target === 'l1' && !isL2) {
    items.push({ audit: audit, chip: 'with_l1_remediation' as const, due: '30 May 2026' });
  }
  // Always show something for demo if inbox would be empty
  if (items.length === 0) {
    // Show the main audit as pending for their role
    items.push({
      audit: audit,
      chip: isL2 ? 'pending_l2' as const : 'pending_l1' as const,
      due: '30 May 2026',
    });
  }

  function handleOpen(auditId: string) {
    navigate(`/audit-ops/audit/${auditId}?tab=review`);
  }

  return (
    <div style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 var(--page-pad)' }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>Pending reviews</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            Audits awaiting your sign-off as {isL2 ? 'L2 reviewer' : 'L1 reviewer'}.
          </p>
        </div>

        {items.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>No audits awaiting your sign-off</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
              You're all caught up. New reviews will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {items.map((item, i) => (
              <ReviewCard
                key={i}
                audit={item.audit}
                chipVariant={item.chip}
                due={item.due}
                onOpen={() => handleOpen(item.audit.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  audit,
  chipVariant,
  due,
  onOpen,
}: {
  audit: any;
  chipVariant: any;
  due: string;
  onOpen: () => void;
}) {
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
    }}>
      <div style={{ flex: 1 }}>
        {/* Title + chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{audit.title}</h3>
          <StatusChip variant={chipVariant} />
        </div>
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {audit.org} · {audit.reviewType}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Period: <strong>{audit.period}</strong>
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Due: <strong>{due}</strong>
          </span>
        </div>
        {/* Progress */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, maxWidth: 200, height: 6, borderRadius: 3, background: 'var(--border-card)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${audit.percentComplete}%`,
              background: 'var(--brand-500)',
              borderRadius: 3,
            }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{audit.percentComplete}% complete</span>
        </div>
      </div>

      {/* CTA */}
      <button
        className="btn btn--primary"
        onClick={onOpen}
        style={{ flexShrink: 0 }}
      >
        Open review →
      </button>
    </div>
  );
}
