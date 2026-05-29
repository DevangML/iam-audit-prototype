import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuditStore } from '../../store/auditStore';
import { getSession } from '../../hooks/useSession';

const APPS = [
  { code: 'P', name: 'Pravesh' },
  { code: 'B', name: 'Beejak' },
  { code: 'T', name: 'Trinity' },
  { code: 'M', name: 'Matrix' },
  { code: 'V', name: 'Velocity' },
];

const appColors: Record<string, string> = {
  P: '#1565c0', B: '#6a1b9a', T: '#00695c', M: '#4e342e', V: '#1b5e20',
};

export default function ReviewTab({ auditId }: { auditId: string }) {
  const session = getSession();
  const role = session?.role ?? 'l1';
  const [searchParams, setSearchParams] = useSearchParams();
  const activeApp = searchParams.get('app') ?? 'Velocity';

  const { tasks, audit, updateSubtaskReview, l1Approve, l1SendBack, l2Approve, l2SendBack } = useAuditStore();

  const [comment, setComment] = useState('');
  const [showConfirmSendBack, setShowConfirmSendBack] = useState(false);

  const isL2 = role === 'l2';

  // Get tasks for active app
  const appTasks = tasks.filter(t => t.app === activeApp);

  // Check if any subtask is rejected
  const anyRejected = tasks.some(t =>
    t.subtasks?.some(s => s.reviewStatus === 'rejected')
  );

  const appRejectedCount = appTasks.reduce((acc, t) =>
    acc + (t.subtasks?.filter(s => s.reviewStatus === 'rejected').length ?? 0), 0
  );

  function handleApprove() {
    if (!comment.trim()) return;
    if (isL2) {
      l2Approve(comment);
    } else {
      l1Approve(comment);
    }
    setComment('');
  }

  function handleSendBack() {
    if (!comment.trim()) return;
    setShowConfirmSendBack(true);
  }

  function confirmSendBack() {
    if (isL2) {
      l2SendBack(comment);
    } else {
      l1SendBack(comment);
    }
    setComment('');
    setShowConfirmSendBack(false);
  }

  function setActiveApp(name: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('app', name);
      return next;
    });
  }

  return (
    <div style={{ paddingTop: 24, paddingBottom: 180 }}>
      {/* Status hints */}
      {anyRejected && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: 'var(--chip-sentback-bg)',
          border: '1px solid var(--chip-sentback-text)',
          fontSize: 13, color: 'var(--chip-sentback-text)',
        }}>
          ⚠️ Subtask rejected — <strong>Approve pack disabled</strong> · Send back enabled
        </div>
      )}

      {/* Segmented app tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 24,
        background: 'var(--surface-page)',
        borderRadius: 10,
        padding: 4,
        border: '1px solid var(--border-card)',
        width: 'fit-content',
      }}>
        {APPS.map(app => {
          const active = activeApp === app.name;
          const c = appColors[app.code];
          const appTaskList = tasks.filter(t => t.app === app.name);
          const rejCount = appTaskList.reduce((acc, t) =>
            acc + (t.subtasks?.filter(s => s.reviewStatus === 'rejected').length ?? 0), 0
          );
          return (
            <button
              key={app.code}
              onClick={() => setActiveApp(app.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px',
                borderRadius: 8,
                border: 'none',
                background: active ? 'var(--surface-card)' : 'transparent',
                color: active ? c : 'var(--text-secondary)',
                fontWeight: active ? 700 : 400,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                boxShadow: active ? 'var(--shadow-card)' : 'none',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              <span style={{
                fontSize: 10, fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: active ? c : 'var(--text-secondary)',
              }}>{app.code}</span>
              {app.name}
              {rejCount > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: 'var(--status-reject)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {rejCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Task accordions */}
      {appTasks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)', fontSize: 14,
        }}>
          No tasks for {activeApp} in this audit.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {appTasks.map(task => (
            <TaskAccordion key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Sticky review footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--surface-card)',
        borderTop: '1px solid var(--border-card)',
        padding: '14px 32px',
        boxShadow: '0 -4px 16px rgba(10,22,40,0.08)',
      }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          {isL2 && (
            <div style={{
              display: 'inline-block', marginBottom: 10,
              padding: '4px 12px', borderRadius: 6,
              background: 'var(--chip-pending-bg)', color: 'var(--chip-pending-text)',
              fontSize: 12, fontWeight: 700,
            }}>
              PENDING L2
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-secondary)' }}>
                {isL2 ? 'L2 approval comment' : 'L1 approval comment'} <span style={{ color: 'var(--status-reject)' }}>*</span>
              </label>
              <textarea
                style={{
                  width: '100%', padding: '9px 12px',
                  border: '1.5px solid var(--border-card)',
                  borderRadius: 8, fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  resize: 'none', height: 52,
                  boxSizing: 'border-box',
                }}
                placeholder={`Add your ${isL2 ? 'L2' : 'L1'} review comment before approving or sending back...`}
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, paddingBottom: 2 }}>
              <button
                onClick={handleSendBack}
                disabled={!comment.trim()}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  border: `1.5px solid ${comment.trim() ? 'var(--status-reject)' : 'var(--border-card)'}`,
                  background: 'transparent',
                  color: comment.trim() ? 'var(--status-reject)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 14, cursor: comment.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-sans)',
                  opacity: comment.trim() ? 1 : 0.5,
                }}
              >
                Send back
              </button>
              <button
                onClick={handleApprove}
                disabled={anyRejected || !comment.trim()}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  background: anyRejected || !comment.trim() ? 'var(--border-card)' : '#1b7a3d',
                  color: anyRejected || !comment.trim() ? 'var(--text-secondary)' : '#fff',
                  border: 'none',
                  fontWeight: 700, fontSize: 14,
                  cursor: anyRejected || !comment.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s',
                }}
                title={anyRejected ? 'Cannot approve — one or more subtasks rejected' : !comment.trim() ? 'Comment required' : ''}
              >
                Approve pack
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Send-back confirm overlay */}
      {showConfirmSendBack && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'var(--overlay-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-md)',
            padding: '32px 36px',
            width: 480,
            boxShadow: '0 8px 40px rgba(10,22,40,0.2)',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirm send back</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {isL2 ? 'This will send the audit back to L1 for remediation.' : 'This will send the audit back to the audit team with your rejections.'}
              {appRejectedCount > 0 && ` ${appRejectedCount} subtask${appRejectedCount > 1 ? 's' : ''} marked as rejected.`}
            </p>
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'var(--surface-page)',
              border: '1px solid var(--border-card)',
              fontSize: 13, color: 'var(--text-secondary)',
              marginBottom: 20, fontStyle: 'italic',
            }}>
              "{comment}"
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn--secondary" onClick={() => setShowConfirmSendBack(false)}>
                Cancel
              </button>
              <button
                onClick={confirmSendBack}
                style={{
                  padding: '9px 20px', borderRadius: 8,
                  background: 'var(--status-reject)', color: '#fff',
                  border: 'none', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}
              >
                Confirm send back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskAccordion({ task }: { task: any }) {
  const [open, setOpen] = useState(true);
  const { updateSubtaskReview } = useAuditStore();

  const subtasks = task.subtasks ?? [];
  const rejCount = subtasks.filter((s: any) => s.reviewStatus === 'rejected').length;

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
    }}>
      {/* Accordion header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</span>
          {rejCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px',
              borderRadius: 6, background: 'var(--chip-sentback-bg)',
              color: 'var(--chip-sentback-text)',
            }}>
              {rejCount} rejected
            </span>
          )}
        </div>
        <span style={{ fontSize: 18, color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          ↓
        </span>
      </button>

      {/* Subtask table */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border-card)', overflowX: 'auto' }}>
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Question</th>
                <th style={{ width: '25%' }}>Evidence</th>
                <th style={{ width: '20%' }}>Answer</th>
                <th style={{ width: '15%', textAlign: 'center' }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {subtasks.map((s: any) => {
                const rejected = s.reviewStatus === 'rejected';
                const approved = s.reviewStatus === 'approved';
                return (
                  <tr
                    key={s.id}
                    style={{
                      borderLeft: rejected ? '4px solid var(--status-reject)' : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 500 }}>
                      {s.question}
                      {s.mandatory && (
                        <span style={{ fontSize: 10, color: 'var(--status-reject)', marginLeft: 4 }}>*</span>
                      )}
                    </td>
                    <td>
                      {s.value && s.answerType === 'attachment' ? (
                        <div style={{
                          width: 48, height: 36, borderRadius: 4,
                          background: 'var(--border-card)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', border: '1px solid var(--border-card)',
                        }}
                          title="Click to view evidence"
                        >
                          <span style={{ fontSize: 18 }}>🖼</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                        {s.value !== undefined && s.value !== '' ? String(s.value) : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }} title="Approve">
                          <input
                            type="radio"
                            name={`review-${task.id}-${s.id}`}
                            value="approved"
                            checked={approved}
                            onChange={() => updateSubtaskReview(task.id, s.id, 'approved')}
                            style={{ accentColor: '#1b7a3d' }}
                          />
                          <span style={{ fontSize: 11, color: '#1b7a3d', fontWeight: 600 }}>✓</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }} title="Reject">
                          <input
                            type="radio"
                            name={`review-${task.id}-${s.id}`}
                            value="rejected"
                            checked={rejected}
                            onChange={() => updateSubtaskReview(task.id, s.id, 'rejected')}
                            style={{ accentColor: 'var(--status-reject)' }}
                          />
                          <span style={{ fontSize: 11, color: 'var(--status-reject)', fontWeight: 600 }}>✗</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
