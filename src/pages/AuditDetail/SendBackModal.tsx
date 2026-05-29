import { useState } from 'react';
import { useAuditStore } from '../../store/auditStore';

interface SendBackModalProps {
  role: 'l1' | 'l2';
  onClose: () => void;
}

export default function SendBackModal({ role, onClose }: SendBackModalProps) {
  const { l1SendBack, l2SendBack, rejections } = useAuditStore();
  const [comment, setComment] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const rejectionCount = {
    Subtask: rejections.filter((r) => r.scope === 'Subtask').length,
    Task: rejections.filter((r) => r.scope === 'Task').length,
  };

  function handleConfirm() {
    if (!comment.trim()) return;
    if (role === 'l1') l1SendBack(comment);
    else l2SendBack(comment);
    onClose();
  }

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 22 }}>↩️</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            Send back audit
          </div>
        </div>

        {/* Rejection summary */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {Object.entries(rejectionCount).map(([scope, count]) => count > 0 && (
            <div key={scope} style={scopePillStyle}>
              <span style={{ fontWeight: 700 }}>{count}</span> {scope}{count > 1 ? 's' : ''} rejected
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ marginBottom: 6, display: 'block', fontSize: 13, fontWeight: 600 }}>
            Comment <span style={{ color: '#c62828' }}>*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain why this audit is being sent back…"
            rows={4}
            style={{ width: '100%', resize: 'none' }}
          />
        </div>

        {comment.trim() && !confirmed && (
          <div style={{ padding: '12px 16px', background: '#fff8e1', borderRadius: 8, border: '1px solid #ffe082', fontSize: 13, marginBottom: 16 }}>
            <strong>Preview:</strong> "{comment}"
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn--danger"
            disabled={!comment.trim()}
            onClick={handleConfirm}
          >
            Confirm send back
          </button>
        </div>
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

const scopePillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 12px',
  borderRadius: 100,
  background: 'var(--chip-sentback-bg)',
  color: 'var(--chip-sentback-text)',
  fontSize: 12,
  fontWeight: 500,
};
