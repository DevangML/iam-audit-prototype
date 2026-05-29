import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function AppShell() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <Header />
      <Outlet />
    </div>
  );
}
