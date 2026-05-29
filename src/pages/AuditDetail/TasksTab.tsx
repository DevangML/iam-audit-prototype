import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../hooks/useSession';
import { useAuditStore } from '../../store/auditStore';
import StatusChip from '../../components/StatusChip';
import ProgressRing from '../../components/ProgressRing';
import TaskWizard from './TaskWizard';

export default function TasksTab({ auditId }: { auditId: string }) {
  const session = getSession();
  const { tasks, tasksSeeded, applyTemplateTasks } = useAuditStore();
  const [showWizard, setShowWizard] = useState(false);
  const isLead = session?.role === 'lead';

  const nonCorrectionTasks = tasks.filter((t) => !t.isCorrection);

  // Group tasks by app
  const byApp: Record<string, typeof nonCorrectionTasks> = {};
  nonCorrectionTasks.forEach((t) => {
    if (!byApp[t.app]) byApp[t.app] = [];
    byApp[t.app].push(t);
  });

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Tasks</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {nonCorrectionTasks.length} tasks across {Object.keys(byApp).length} applications
          </p>
        </div>
        {isLead && (
          <button className="btn btn--primary" onClick={() => setShowWizard(true)}>
            + Add task
          </button>
        )}
      </div>

      {nonCorrectionTasks.length === 0 ? (
        <EmptyTasks onAddTask={() => setShowWizard(true)} onApplyTemplate={applyTemplateTasks} isLead={isLead} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {isLead && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -10 }}>
              <button className="btn btn--ghost btn--sm" onClick={applyTemplateTasks}>
                ↺ Apply template tasks
              </button>
            </div>
          )}
          {Object.entries(byApp).map(([app, appTasks]) => (
            <AppGroup key={app} app={app} tasks={appTasks} isLead={isLead} />
          ))}
        </div>
      )}

      {showWizard && <TaskWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
}

function AppGroup({ app, tasks, isLead }: { app: string; tasks: any[]; isLead: boolean }) {
  const appCode = tasks[0].appCode;
  const colors: Record<string, string> = { P: '#1565c0', B: '#6a1b9a', T: '#00695c', M: '#4e342e', V: '#1b5e20' };
  const c = colors[appCode] ?? '#455a64';

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: `${c}08`, borderBottom: '1px solid var(--border-card)' }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, background: `${c}20`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          {appCode}
        </span>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{app}</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Assignee</th>
            <th>Progress</th>
            <th>Status</th>
            {isLead && <th style={{ width: 40 }}></th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => <TaskRow key={t.id} task={t} isLead={isLead} />)}
        </tbody>
      </table>
    </div>
  );
}

function TaskRow({ task, isLead }: { task: any; isLead: boolean }) {
  const pct = task.mandatoryTotal > 0
    ? Math.round((task.mandatoryComplete / task.mandatoryTotal) * 100)
    : 100;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
          {task.mandatoryComplete}/{task.mandatoryTotal} mandatory
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--hero-start), var(--hero-end))',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700,
          }}>
            {task.assigneeAvatar}
          </div>
          <span style={{ fontSize: 13 }}>{task.assignee}</span>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ProgressRing value={pct} size={32} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pct}%</span>
        </div>
      </td>
      <td>
        <StatusChip variant={task.status} size="sm" />
      </td>
      {isLead && (
        <td>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-secondary)', padding: '0 4px', display: 'flex', alignItems: 'center' }}
            >
              ⋮
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 28, width: 140, background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 8, boxShadow: '0 4px 16px rgba(10,22,40,0.12)', zIndex: 50 }}>
                <button style={menuItemStyle} onClick={() => setMenuOpen(false)}>Edit task</button>
                <button style={{ ...menuItemStyle, color: 'var(--status-reject)' }} onClick={() => setMenuOpen(false)}>Remove</button>
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

function EmptyTasks({ onAddTask, onApplyTemplate, isLead }: { onAddTask: () => void; onApplyTemplate: () => void; isLead: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No tasks yet</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
        Add tasks manually or apply template tasks to get started quickly.
      </p>
      {isLead && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button className="btn btn--secondary" onClick={onAddTask}>+ Add task</button>
          <button className="btn btn--primary" onClick={onApplyTemplate}>Apply template tasks</button>
        </div>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '9px 14px',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontFamily: 'var(--font-sans)',
  color: 'var(--text-primary)',
};
