import type { Task } from '../../data/types';

interface SubmitConfirmModalProps {
  blockers: Task[];
  onConfirm: () => void;
  onClose: () => void;
}

export default function SubmitConfirmModal({ blockers, onConfirm, onClose }: SubmitConfirmModalProps) {
  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        {blockers.length > 0 ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Cannot submit yet
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              The following mandatory tasks are incomplete:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {blockers.map((t) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff8e1', borderRadius: 8, border: '1px solid #ffe082' }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {t.mandatoryComplete}/{t.mandatoryTotal} mandatory subtasks complete · {t.app}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn--secondary" onClick={onClose}>Close</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Submit to L1?
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
              All mandatory tasks are complete. This will submit the audit for L1 review. The L1 reviewer will be notified.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn--primary" onClick={onConfirm}>Confirm submit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'var(--overlay-dim)',
  zIndex: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle: React.CSSProperties = {
  width: 560,
  background: 'var(--surface-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: '0 20px 60px rgba(10,22,40,0.2)',
  padding: 32,
};
