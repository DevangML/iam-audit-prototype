import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getSession } from './hooks/useSession';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import MyWork from './pages/MyWork';
import AuditOps from './pages/AuditOps';
import CreateAudit from './pages/CreateAudit';
import AuditDetail from './pages/AuditDetail/index';
import AuditReview from './pages/AuditReview';
import EmailPreview from './pages/EmailPreview';
import RoleBlocked from './pages/RoleBlocked';

function RequireRole({ children, roles }: { children: JSX.Element; roles: string[] }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (!roles.includes(session.role)) return <Navigate to="/blocked" replace />;
  return children;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/email-preview" element={<EmailPreview />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<HomeRedirect />} />
          <Route
            path="my-work"
            element={
              <RequireRole roles={['assignee']}>
                <MyWork />
              </RequireRole>
            }
          />
          <Route
            path="my-work/task/:taskId"
            element={
              <RequireRole roles={['assignee']}>
                <MyWork />
              </RequireRole>
            }
          />
          <Route
            path="audit-ops"
            element={
              <RequireRole roles={['lead']}>
                <AuditOps />
              </RequireRole>
            }
          />
          <Route
            path="audit-ops/create"
            element={
              <RequireRole roles={['lead']}>
                <CreateAudit />
              </RequireRole>
            }
          />
          <Route
            path="audit-ops/audit/:auditId"
            element={
              <RequireRole roles={['lead', 'l1', 'l2']}>
                <AuditDetail />
              </RequireRole>
            }
          />
          <Route
            path="audit-ops/audit/:auditId/tasks/new"
            element={
              <RequireRole roles={['lead']}>
                <AuditDetail forceNewTask />
              </RequireRole>
            }
          />
          <Route
            path="audit-review"
            element={
              <RequireRole roles={['l1', 'l2']}>
                <AuditReview />
              </RequireRole>
            }
          />
          <Route path="blocked" element={<RoleBlocked />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function HomeRedirect() {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={getHomeRoute(session.role)} replace />;
}

function getHomeRoute(role: string) {
  switch (role) {
    case 'lead': return '/audit-ops';
    case 'assignee': return '/my-work';
    case 'l1':
    case 'l2': return '/audit-review';
    default: return '/login';
  }
}
