import { useSearchParams, useParams } from 'react-router-dom';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getSession } from '../../hooks/useSession';
import { useAuditStore } from '../../store/auditStore';
import CommandBar from '../../components/CommandBar';
import StatusChip from '../../components/StatusChip';
import OverviewTab from './OverviewTab';
import TasksTab from './TasksTab';
import RejectionsTab from './RejectionsTab';
import CorrectionsTab from './CorrectionsTab';
import ReviewTab from './ReviewTab';
import ClosureModal from './ClosureModal';
import { useState, useEffect } from 'react';

export default function AuditDetail({ forceNewTask }: { forceNewTask?: boolean }) {
  const ok = useRoleGuard(['lead', 'l1', 'l2']);
  const session = getSession();
  const { auditId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { audit, audit2 } = useAuditStore();
  const [showClosure, setShowClosure] = useState(false);

  const currentAudit = auditId === 'audit-2' ? audit2 : audit;
  const tab = searchParams.get('tab') || 'overview';
  const role = session?.role;

  // Show closure modal when audit is approved
  const wasApproved = audit.status === 'approved';
  useEffect(() => {
    if (audit.status === 'approved') {
      setShowClosure(true);
    }
  }, [audit.status]);

  if (!ok || !session) return null;

  // S18 — Lead locked when audit-2 or routing l1
  const isLocked = (auditId === 'audit-2' && role === 'lead') || 
                   (currentAudit.status === 'sent_back' && currentAudit.routing_target === 'l1' && role === 'lead');
  
  // S16 — L1 remediation view
  const isL1Remediation = currentAudit.status === 'sent_back' && currentAudit.routing_target === 'l1' && role === 'l1';

  const TABS = buildTabs(role, currentAudit, isLocked, isL1Remediation);

  function setTab(t: string) {
    const params: Record<string, string> = { tab: t };
    const app = searchParams.get('app');
    if (app && t === 'review') params.app = app;
    setSearchParams(params);
  }

  const activeTab = TABS.find((t) => t.id === tab) ? tab : TABS[0]?.id ?? 'overview';

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      {/* Hero — ONE per audit detail */}
      <div style={heroStyle}>
        <div style={heroInner}>
          <div style={{ flex: 1 }}>
            {isL1Remediation && (
              <div style={{ marginBottom: 10 }}>
                <StatusChip variant="l1_remediation" label="L2 sent back remediation" />
              </div>
            )}
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {currentAudit.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <StatusChip variant={currentAudit.status} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                {currentAudit.reviewType} · {currentAudit.org}
              </span>
              {isLocked && role === 'lead' && (
                <StatusChip variant="correction" label="Waiting on L1 remediation" />
              )}
            </div>

            {/* Progress bar in hero */}
            <div style={{ marginTop: 20, maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                <span>Progress</span>
                <span style={{ fontWeight: 700 }}>{currentAudit.percentComplete}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.25)' }}>
                <div style={{ height: '100%', width: `${currentAudit.percentComplete}%`, background: '#fff', borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command bar — sticky on every tab */}
      <CommandBar auditId={auditId ?? 'audit-1'} />

      {/* Tab nav */}
      <div style={tabBarStyle}>
        <div style={tabBarInner}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...tabBtnStyle,
                borderBottom: activeTab === t.id ? '2px solid var(--brand-500)' : '2px solid transparent',
                color: activeTab === t.id ? 'var(--brand-500)' : 'var(--text-secondary)',
                fontWeight: activeTab === t.id ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="page-wrapper">
        {activeTab === 'overview' && <OverviewTab audit={currentAudit} />}
        {activeTab === 'tasks' && <TasksTab auditId={auditId ?? 'audit-1'} />}
        {activeTab === 'rejections' && <RejectionsTab auditId={auditId ?? 'audit-1'} />}
        {activeTab === 'corrections' && <CorrectionsTab auditId={auditId ?? 'audit-1'} />}
        {activeTab === 'review' && <ReviewTab auditId={auditId ?? 'audit-1'} />}
      </div>

      {/* S19 Closure modal */}
      {showClosure && (
        <ClosureModal onClose={() => setShowClosure(false)} />
      )}
    </div>
  );
}

function buildTabs(role: string | undefined, audit: any, isLocked: boolean, isL1Remediation: boolean) {
  const { status, routing_target } = audit;
  const showRejections = (status === 'sent_back' && routing_target === 'audit_team') || isL1Remediation;
  const showCorrections = (status === 'sent_back' && routing_target === 'audit_team') || isL1Remediation;
  const showReview = role === 'l1' || role === 'l2' || (role === 'lead' && ['pending_l1', 'pending_l2', 'approved', 'sent_back'].includes(status));

  if (isL1Remediation) {
    // S16: only Rejections, Corrections, Review
    return [
      { id: 'rejections', label: 'Rejections' },
      { id: 'corrections', label: 'Corrections' },
      { id: 'review', label: 'Review' },
    ];
  }

  if (isLocked && role === 'lead') {
    // S18: Overview, Tasks, Review only
    return [
      { id: 'overview', label: 'Overview' },
      { id: 'tasks', label: 'Tasks' },
      ...(showReview ? [{ id: 'review', label: 'Review' }] : []),
    ];
  }

  return [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks' },
    ...(showRejections ? [{ id: 'rejections', label: 'Rejections' }] : []),
    ...(showCorrections ? [{ id: 'corrections', label: 'Corrections' }] : []),
    ...(showReview ? [{ id: 'review', label: 'Review' }] : []),
  ];
}

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--hero-start), var(--hero-end))',
  paddingTop: 'var(--header-h)',
};

const heroInner: React.CSSProperties = {
  maxWidth: 'calc(var(--content-max) + var(--page-pad) * 2)',
  margin: '0 auto',
  padding: '32px var(--page-pad) 28px',
};

const tabBarStyle: React.CSSProperties = {
  background: 'var(--surface-card)',
  borderBottom: '1px solid var(--border-card)',
  position: 'sticky',
  top: 'calc(var(--header-h) + 52px)', // header + command bar
  zIndex: 100,
};

const tabBarInner: React.CSSProperties = {
  maxWidth: 'calc(var(--content-max) + var(--page-pad) * 2)',
  margin: '0 auto',
  padding: '0 var(--page-pad)',
  display: 'flex',
  gap: 0,
};

const tabBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 44,
  padding: '0 16px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  transition: 'color 0.15s',
};

const tabCountStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: 'var(--status-correction)',
  color: '#fff',
  fontSize: 10,
  fontWeight: 700,
};
