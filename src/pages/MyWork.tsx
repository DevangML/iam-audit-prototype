import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { getSession } from '../hooks/useSession';
import { useAuditStore } from '../store/auditStore';
import StatusChip from '../components/StatusChip';
import ProgressRing from '../components/ProgressRing';
import TaskSlideOver from './TaskSlideOver';

export default function MyWork() {
  const ok = useRoleGuard(['assignee']);
  const session = getSession();
  const [searchParams] = useSearchParams();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks } = useAuditStore();
  const isEmpty = searchParams.get('empty') === '1';
  const [activeTaskId, setActiveTaskId] = useState<string | null>(taskId ?? null);

  useEffect(() => {
    if (taskId) setActiveTaskId(taskId);
  }, [taskId]);

  if (!ok || !session) return null;

  const myTasks = isEmpty ? [] : tasks.filter(
    (t) => t.assigneeId === 'assignee'
  );
  const open = myTasks.filter((t) => t.status === 'open').length;
  const dueThisWeek = myTasks.filter((t) => t.due).length;
  const corrections = myTasks.filter((t) => t.isCorrection).length;
  const completed = myTasks.filter((t) => t.status === 'complete').length;

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <div className="page-wrapper">
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>My Work</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            {session.name} · Tasks assigned to you
          </p>
        </div>

        {/* Stat strip */}
        <div style={statStripStyle}>
          <StatCard label="Open" value={open} />
          <StatCard label="Due this week" value={dueThisWeek} accent="var(--status-correction)" />
          <StatCard label="Corrections" value={corrections} accent="var(--status-correction)" />
          <StatCard label="Completed" value={completed} accent="var(--status-ready)" />
        </div>

        {/* Task grid */}
        {myTasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={taskGridStyle}>
            {myTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => {
                  setActiveTaskId(task.id);
                  navigate(`/my-work/task/${task.id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task slide-over */}
      {activeTaskId && (
        <TaskSlideOver
          taskId={activeTaskId}
          onClose={() => {
            setActiveTaskId(null);
            navigate('/my-work');
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={statCardStyle}>
      <div style={{ fontSize: 32, fontWeight: 700, color: accent ?? 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function TaskCard({ task, onClick }: { task: any; onClick: () => void }) {
  const pct = task.mandatoryTotal > 0
    ? Math.round((task.mandatoryComplete / task.mandatoryTotal) * 100)
    : 100;

  const appColors: Record<string, string> = {
    P: '#1565c0', B: '#6a1b9a', T: '#00695c', M: '#4e342e', V: '#1b5e20',
  };
  const appColor = appColors[task.appCode] ?? '#455a64';

  return (
    <button
      onClick={onClick}
      style={{
        ...taskCardStyle,
        borderLeft: task.isCorrection ? '4px solid var(--status-correction)' : undefined,
      }}
    >
      {/* App badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          height: 24,
          padding: '0 10px',
          borderRadius: 100,
          background: `${appColor}18`,
          color: appColor,
          fontSize: 12,
          fontWeight: 600,
          border: `1px solid ${appColor}30`,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{task.appCode}</span>
          {task.app}
        </span>
        {task.isCorrection && <StatusChip variant="correction" size="sm" />}
      </div>

      {/* Title */}
      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', textAlign: 'left', marginBottom: 4 }}>
        {task.title}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'left', marginBottom: 16 }}>
        R1 ITGC — May 2026
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ProgressRing value={pct} size={36} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
              {task.mandatoryComplete}/{task.mandatoryTotal}
            </div>
            mandatory
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {task.due && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Due {formatDate(task.due)}
            </span>
          )}
          <StatusChip variant={task.status} size="sm" />
        </div>
      </div>
    </button>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        No tasks assigned
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        You have no tasks assigned to you for the current audit period.
      </p>
      <button className="btn btn--secondary" onClick={() => navigate('/my-work')}>
        Refresh
      </button>
    </div>
  );
}

function formatDate(d: string) {
  const date = new Date(d);
  const day = date.getDate();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${day} ${months[date.getMonth()]}`;
}

const statStripStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 16,
  marginBottom: 28,
};

const statCardStyle: React.CSSProperties = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  padding: '20px 24px',
  boxShadow: 'var(--shadow-card)',
};

const taskGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
};

const taskCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 20,
  background: 'var(--surface-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-card)',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'transform 0.15s, box-shadow 0.15s',
  minHeight: 180,
};
