import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/auditStore';
import type { Notification } from '../data/types';

export default function NotificationDrawer() {
  const { notificationDrawerOpen, setNotificationDrawerOpen, notifications, markNotificationRead } = useAuditStore();
  const navigate = useNavigate();

  function handleNotificationClick(n: Notification) {
    markNotificationRead(n.id);
    setNotificationDrawerOpen(false);
    navigate(n.route);
  }

  return (
    <>
      {notificationDrawerOpen && (
        <div
          style={overlayStyle}
          onClick={() => setNotificationDrawerOpen(false)}
        />
      )}
      <aside style={{ ...drawerStyle, transform: notificationDrawerOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div style={drawerHeaderStyle}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Notifications</span>
          <button onClick={() => setNotificationDrawerOpen(false)} style={closeBtn}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <button key={n.id} style={{ ...notifRowStyle, background: n.read ? 'transparent' : '#f0f6ff' }} onClick={() => handleNotificationClick(n)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ marginTop: 2, fontSize: 16 }}>{getIcon(n.type)}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{n.timeAgo}</div>
                  </div>
                  {!n.read && <div style={unreadDot} />}
                </div>
                <span style={{ fontSize: 12, color: 'var(--brand-500)', marginTop: 4, display: 'block' }}>›</span>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

function getIcon(type: Notification['type']) {
  switch (type) {
    case 'assigned': return '📋';
    case 'correction': return '⚠️';
    case 'ready': return '✅';
    case 'sentback': return '↩️';
    case 'approved': return '🎉';
    default: return '🔔';
  }
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'var(--overlay-dim)',
  zIndex: 350,
};

const drawerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 'var(--header-h)',
  right: 0,
  width: 'var(--drawer-w)',
  height: 'calc(100vh - var(--header-h))',
  background: 'var(--surface-card)',
  borderLeft: '1px solid var(--border-card)',
  boxShadow: '-4px 0 24px rgba(10,22,40,0.12)',
  zIndex: 400,
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.25s ease',
};

const drawerHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 20px',
  borderBottom: '1px solid var(--border-card)',
};

const closeBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
  color: 'var(--text-secondary)',
  padding: 4,
};

const notifRowStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '14px 20px',
  border: 'none',
  borderBottom: '1px solid var(--border-card)',
  cursor: 'pointer',
  transition: 'background 0.12s',
  textAlign: 'left',
};

const unreadDot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: 'var(--brand-500)',
  flexShrink: 0,
  marginTop: 4,
};
