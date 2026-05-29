import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getSession, clearSession } from '../hooks/useSession';
import { useAuditStore } from '../store/auditStore';
import NotificationDrawer from './NotificationDrawer';

export default function Header() {
  const session = getSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { notificationDrawerOpen, setNotificationDrawerOpen, notifications } = useAuditStore();
  const unread = notifications.filter((n) => !n.read).length;

  const isAuditDetail = location.pathname.includes('/audit-ops/audit/');
  const auditTitle = 'R1 ITGC — May 2026';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSignOut() {
    clearSession();
    navigate('/login');
  }

  if (!session) return null;

  return (
    <>
      <header style={headerStyle}>
        <div style={innerStyle}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={logoMarkStyle}>IA</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              IAM Audit
            </span>
          </div>

          {/* Breadcrumb — audit detail only */}
          {isAuditDetail && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, marginLeft: 32 }}>
              <Link to="/audit-ops" style={breadcrumbLinkStyle}>Audit Ops</Link>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{auditTitle}</span>
            </nav>
          )}

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            {/* Notification bell */}
            <button
              onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
              style={iconBtnStyle}
              title="Notifications"
            >
              <BellIcon />
              {unread > 0 && (
                <span style={badgeStyle}>{unread}</span>
              )}
            </button>

            {/* Help */}
            <button style={iconBtnStyle} title="Help">
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>?</span>
            </button>

            {/* Avatar menu */}
            <div ref={menuRef} style={{ position: 'relative', marginLeft: 4 }}>
              <button
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                style={avatarBtnStyle}
                title={session.name}
              >
                {session.avatar}
              </button>
              {avatarMenuOpen && (
                <div style={avatarMenuStyle}>
                  <div style={menuHeaderStyle}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{session.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{session.title}</div>
                  </div>
                  <div style={menuDivider} />
                  <button style={menuItemStyle} onClick={() => { setAvatarMenuOpen(false); }}>
                    Profile
                  </button>
                  <button style={{ ...menuItemStyle, color: 'var(--status-reject)' }} onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationDrawer />
    </>
  );
}

// ---- Styles ----
const headerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 'var(--header-h)',
  background: 'var(--surface-card)',
  borderBottom: '1px solid var(--border-card)',
  zIndex: 300,
  boxShadow: '0 1px 3px rgba(10,22,40,0.06)',
};

const innerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  maxWidth: 'calc(var(--content-max) + var(--page-pad) * 2)',
  margin: '0 auto',
  padding: '0 var(--page-pad)',
};

const logoMarkStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'linear-gradient(135deg, var(--hero-start), var(--hero-end))',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 700,
};

const iconBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  color: 'var(--text-secondary)',
  transition: 'background 0.15s',
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
  width: 16,
  height: 16,
  borderRadius: '50%',
  background: '#e53935',
  color: '#fff',
  fontSize: 10,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid var(--surface-card)',
};

const avatarBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--hero-start), var(--hero-end))',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.02em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const avatarMenuStyle: React.CSSProperties = {
  position: 'absolute',
  top: 44,
  right: 0,
  width: 220,
  background: 'var(--surface-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: '0 8px 24px rgba(10,22,40,0.14)',
  zIndex: 500,
  overflow: 'hidden',
};

const menuHeaderStyle: React.CSSProperties = {
  padding: '14px 16px',
};

const menuDivider: React.CSSProperties = {
  height: 1,
  background: 'var(--border-card)',
  margin: '0',
};

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 16px',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-sans)',
  transition: 'background 0.12s',
};

const breadcrumbLinkStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--brand-500)',
  textDecoration: 'none',
  fontWeight: 500,
};

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
