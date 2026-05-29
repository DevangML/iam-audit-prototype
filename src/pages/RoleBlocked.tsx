import { useNavigate } from 'react-router-dom';
import { getSession } from '../hooks/useSession';

const HOME_ROUTES: Record<string, string> = {
  lead: '/audit-ops',
  assignee: '/my-work',
  l1: '/audit-review',
  l2: '/audit-review',
};

const ROLE_LABELS: Record<string, string> = {
  lead: 'Audit team lead',
  assignee: 'Task assignee',
  l1: 'L1 reviewer',
  l2: 'L2 reviewer',
};

export default function RoleBlocked() {
  const navigate = useNavigate();
  const session = getSession();
  const homeRoute = session ? HOME_ROUTES[session.role] ?? '/' : '/login';
  const roleLabel = session ? ROLE_LABELS[session.role] ?? session.role : 'your role';

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-h))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-page)',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: 400,
        padding: 40,
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
          Not available for your role
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
          This page is not accessible for <strong>{roleLabel}</strong>.
          Use the link below to return to your workspace.
        </p>
        <button
          className="btn btn--primary"
          onClick={() => navigate(homeRoute)}
        >
          Go to my home
        </button>
      </div>
    </div>
  );
}
