import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../../store/auditStore';
import { getSession } from '../../hooks/useSession';

export default function ClosureModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { tasks } = useAuditStore();
  const session = getSession();

  const stats = [
    { label: 'Duration', value: '12 days' },
    { label: 'Rejection rounds', value: '2' },
    { label: 'Tasks completed', value: String(tasks.filter(t => t.status === 'complete').length || 24) },
    { label: 'Applications', value: '5' },
  ];

  function handleDone() {
    const home = session?.role === 'lead' ? '/audit-ops' : '/audit-review';
    navigate(home);
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'var(--overlay-dim)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        width: 640,
        boxShadow: '0 8px 40px rgba(10,22,40,0.2)',
        overflow: 'hidden',
      }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
          padding: '40px 48px',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 36,
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Audit approved</h2>
          <p style={{ fontSize: 15, opacity: 0.85 }}>R1 ITGC — May 2026 · ElasticRun</p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid var(--border-card)',
        }}>
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '24px 0',
                textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid var(--border-card)' : 'none',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => {
              // stub
              alert('Evidence pack download — would generate ZIP in production.');
            }}
            className="btn btn--secondary"
          >
            Download evidence pack
          </button>
          <button
            onClick={handleDone}
            className="btn btn--primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
