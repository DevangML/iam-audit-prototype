import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSession } from '../hooks/useSession';
import { useAuditStore, selectMandatoryBlockers, selectAllCorrectionsApproved } from '../store/auditStore';
import StatusChip from './StatusChip';
import SubmitConfirmModal from '../pages/AuditDetail/SubmitModal';
import SendBackModal from '../pages/AuditDetail/SendBackModal';

export default function CommandBar({ auditId }: { auditId: string }) {
  const session = getSession();
  const role = session?.role;
  const { audit, tasks, corrections, submitToL1, l1Approve, l2Approve, reforwardToL1, releaseToAuditTeam } = useAuditStore();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSendBackModal, setShowSendBackModal] = useState(false);
  const [l1Comment, setL1Comment] = useState('');
  const [l2Comment, setL2Comment] = useState('');
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const blockers = selectMandatoryBlockers(tasks);
  const allCorrectionsApproved = selectAllCorrectionsApproved(corrections);
  const { status, routing_target } = audit;

  // ---- LEAD view ----
  if (role === 'lead') {
    if (status === 'in_progress') {
      return (
        <>
          <div style={barStyle}>
            <div style={barInner}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusChip variant="in_progress" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {audit.percentComplete}% complete
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {blockers.length > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginRight: 4 }}>
                    {blockers.length} mandatory task{blockers.length > 1 ? 's' : ''} incomplete
                  </span>
                )}
                <button
                  className="btn btn--primary"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={blockers.length > 0}
                  title={blockers.length > 0 ? 'Complete all mandatory tasks first' : 'Submit for L1 review'}
                >
                  Submit to L1
                </button>
              </div>
            </div>
          </div>
          {showSubmitModal && (
            <SubmitConfirmModal
              blockers={blockers}
              onConfirm={() => { submitToL1(); setShowSubmitModal(false); }}
              onClose={() => setShowSubmitModal(false)}
            />
          )}
        </>
      );
    }

    if (status === 'pending_l1') {
      return (
        <div style={barStyle}>
          <div style={barInner}>
            <StatusChip variant="pending_l1" />
            <div style={waitingBanner}>
              Waiting on L1 review — no actions available
            </div>
          </div>
        </div>
      );
    }

    if (status === 'pending_l2') {
      return (
        <div style={barStyle}>
          <div style={barInner}>
            <StatusChip variant="pending_l2" />
            <div style={waitingBanner}>Waiting on L2 approval</div>
          </div>
        </div>
      );
    }

    if (status === 'sent_back' && routing_target === 'audit_team') {
      return (
        <div style={barStyle}>
          <div style={barInner}>
            <StatusChip variant="sent_back" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--chip-sentback-text)', fontWeight: 500 }}>
                Audit sent back — address rejections
              </span>
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => setSearchParams({ tab: 'rejections' })}
              >
                View Rejections
              </button>
              {allCorrectionsApproved && corrections.length > 0 && (
                <button className="btn btn--primary btn--sm" onClick={() => reforwardToL1()}>
                  Re-forward to L1
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (status === 'approved') {
      return (
        <div style={barStyle}>
          <div style={barInner}>
            <StatusChip variant="approved" />
            <span style={{ fontSize: 13, color: 'var(--chip-approved-text)', fontWeight: 500 }}>
              Audit approved and closed
            </span>
          </div>
        </div>
      );
    }

    return null;
  }

  // ---- L1 view ----
  if (role === 'l1') {
    if (status === 'pending_l1') {
      return (
        <>
          <div style={barStyle}>
            <div style={barInner}>
              <StatusChip variant="pending_l1" label="Pending L1" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  placeholder="L1 approval comment (required)"
                  value={l1Comment}
                  onChange={(e) => setL1Comment(e.target.value)}
                  style={{ width: 300, height: 36, padding: '0 10px', borderRadius: 8, border: '1.5px solid var(--border-card)', fontFamily: 'var(--font-sans)', fontSize: 13 }}
                />
                <button
                  className="btn btn--success"
                  disabled={!l1Comment.trim()}
                  onClick={() => l1Approve(l1Comment)}
                  title={!l1Comment.trim() ? 'Approval comment required' : ''}
                >
                  Approve pack
                </button>
                <button className="btn btn--danger" onClick={() => setShowSendBackModal(true)}>
                  Send back
                </button>
              </div>
            </div>
          </div>
          {showSendBackModal && (
            <SendBackModal
              role="l1"
              onClose={() => setShowSendBackModal(false)}
            />
          )}
        </>
      );
    }

    if (status === 'sent_back' && routing_target === 'l1') {
      return (
        <div style={barStyle}>
          <div style={barInner}>
            <StatusChip variant="l1_remediation" label="L2 sent back remediation" />
            <button className="btn btn--primary" onClick={() => releaseToAuditTeam()}>
              Release to audit team
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={barStyle}>
        <div style={barInner}>
          <StatusChip variant={status} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Read-only view</span>
        </div>
      </div>
    );
  }

  // ---- L2 view ----
  if (role === 'l2') {
    if (status === 'pending_l2') {
      return (
        <>
          <div style={barStyle}>
            <div style={barInner}>
              <StatusChip variant="pending_l2" label="Pending L2" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  placeholder="L2 approval comment (required)"
                  value={l2Comment}
                  onChange={(e) => setL2Comment(e.target.value)}
                  style={{ width: 300, height: 36, padding: '0 10px', borderRadius: 8, border: '1.5px solid var(--border-card)', fontFamily: 'var(--font-sans)', fontSize: 13 }}
                />
                <button
                  className="btn btn--success"
                  disabled={!l2Comment.trim()}
                  onClick={() => l2Approve(l2Comment)}
                >
                  Approve pack
                </button>
                <button className="btn btn--danger" onClick={() => setShowSendBackModal(true)}>
                  Send back
                </button>
              </div>
            </div>
          </div>
          {showSendBackModal && (
            <SendBackModal role="l2" onClose={() => setShowSendBackModal(false)} />
          )}
        </>
      );
    }

    return (
      <div style={barStyle}>
        <div style={barInner}>
          <StatusChip variant={status} />
        </div>
      </div>
    );
  }

  return null;
}

const barStyle: React.CSSProperties = {
  position: 'sticky',
  top: 'var(--header-h)',
  zIndex: 200,
  background: 'var(--surface-card)',
  borderBottom: '1px solid var(--border-card)',
  boxShadow: '0 2px 8px rgba(10,22,40,0.06)',
};

const barInner: React.CSSProperties = {
  maxWidth: 'calc(var(--content-max) + var(--page-pad) * 2)',
  margin: '0 auto',
  padding: '0 var(--page-pad)',
  height: 52,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
};

const waitingBanner: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-secondary)',
  fontStyle: 'italic',
};
