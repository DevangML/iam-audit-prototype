import { useNavigate } from 'react-router-dom';
import { PERSONAS, EMPTY_ASSIGNEE } from '../data/personas';
import { setSession } from '../hooks/useSession';
import type { Persona } from '../data/types';

export default function Login() {
  const navigate = useNavigate();

  function handleSelect(persona: Persona) {
    setSession({
      userId: persona.id,
      name: persona.name,
      role: persona.role,
      avatar: persona.avatar,
      title: persona.title,
    });
    navigate(persona.homeRoute);
  }

  const allPersonas = [...PERSONAS, EMPTY_ASSIGNEE];

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={logoStyle}>IA</div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)', marginBottom: 8 }}>
          IAM Audit
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 40 }}>
          Demo login — select a profile to explore the prototype. No password required.
        </p>

        <div style={gridStyle}>
          {PERSONAS.map((persona) => (
            <ProfileCard key={persona.id} persona={persona} onSelect={handleSelect} />
          ))}
        </div>

        {/* Optional empty state card */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <button
            style={emptyCardStyle}
            onClick={() => handleSelect(EMPTY_ASSIGNEE)}
          >
            <span style={{ fontSize: 22 }}>👤</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Empty assignee</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>No tasks assigned — empty state view</div>
            </div>
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 36 }}>
          Pilot: R1 ITGC — May 2026 · Org: ElasticRun
        </p>
      </div>
    </div>
  );
}

function ProfileCard({ persona, onSelect }: { persona: Persona; onSelect: (p: Persona) => void }) {
  const roleColors: Record<string, string> = {
    lead: '#1976d2',
    assignee: '#2e7d32',
    l1: '#6a1b9a',
    l2: '#e65100',
  };
  const color = roleColors[persona.role] ?? '#1976d2';

  return (
    <button style={cardStyle} onClick={() => onSelect(persona)}>
      <div style={{ ...avatarStyle, background: `linear-gradient(135deg, ${color}cc, ${color})` }}>
        {persona.avatar}
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{persona.name}</div>
        <span style={{
          display: 'inline-block',
          marginTop: 6,
          padding: '2px 10px',
          borderRadius: 100,
          background: `${color}18`,
          color: color,
          fontSize: 11,
          fontWeight: 600,
          border: `1px solid ${color}30`,
        }}>
          {persona.title}
        </span>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
          {persona.subtitle}
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-card)', width: '100%' }}>
        <div style={{
          width: '100%',
          height: 36,
          borderRadius: 8,
          background: color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 600,
          gap: 6,
        }}>
          Login as {persona.name.split(' ')[0]}
          <span style={{ fontSize: 16 }}>→</span>
        </div>
      </div>
    </button>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg, #f0f6ff 0%, var(--surface-page) 60%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 32,
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 900,
};

const logoStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 16,
  background: 'linear-gradient(135deg, var(--hero-start), var(--hero-end))',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  fontWeight: 700,
  boxShadow: '0 8px 24px rgba(25,118,210,0.3)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: 24,
  background: 'var(--surface-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-card)',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
  width: '100%',
};

const avatarStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  fontWeight: 700,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

const emptyCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 20px',
  background: 'var(--surface-card)',
  border: '1px dashed var(--border-card)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  fontSize: 14,
  color: 'var(--text-secondary)',
  transition: 'border-color 0.15s',
};
