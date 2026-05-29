import type { AuditStatus, TaskStatus, CorrectionStatus, SubtaskReviewStatus } from '../data/types';

type ChipVariant =
  | AuditStatus
  | TaskStatus
  | CorrectionStatus
  | SubtaskReviewStatus
  | 'correction'
  | 'l1_remediation'
  | 'with_l1_remediation'
  | 'pending_l1'
  | 'pending_l2';

interface ChipProps {
  variant: string;
  label?: string;
  size?: 'sm' | 'md';
}

const CHIP_MAP: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  draft:              { bg: 'var(--chip-draft-bg)',      color: 'var(--chip-draft-text)',      icon: '○', label: 'Draft' },
  in_progress:        { bg: 'var(--chip-progress-bg)',   color: 'var(--chip-progress-text)',   icon: '●', label: 'In progress' },
  pending_l1:         { bg: 'var(--chip-pending-bg)',    color: 'var(--chip-pending-text)',    icon: '◐', label: 'Pending L1' },
  pending_l2:         { bg: 'var(--chip-pending-bg)',    color: 'var(--chip-pending-text)',    icon: '◐', label: 'Pending L2' },
  sent_back:          { bg: 'var(--chip-sentback-bg)',   color: 'var(--chip-sentback-text)',   icon: '↩', label: 'Sent back' },
  approved:           { bg: 'var(--chip-approved-bg)',   color: 'var(--chip-approved-text)',   icon: '✓', label: 'Approved' },
  open:               { bg: 'var(--chip-draft-bg)',      color: 'var(--chip-draft-text)',      icon: '○', label: 'Open' },
  complete:           { bg: 'var(--chip-approved-bg)',   color: 'var(--chip-approved-text)',   icon: '✓', label: 'Complete' },
  correction:         { bg: 'var(--chip-correction-bg)', color: 'var(--chip-correction-text)', icon: '!', label: 'Correction' },
  rejected:           { bg: 'var(--chip-sentback-bg)',   color: 'var(--chip-sentback-text)',   icon: '✕', label: 'Rejected' },
  pending:            { bg: 'var(--chip-pending-bg)',    color: 'var(--chip-pending-text)',    icon: '…', label: 'Pending' },
  with_l1_remediation:{ bg: '#fff3e0',                  color: '#e65100',                    icon: '↩', label: 'With L1 remediation' },
  l1_remediation:     { bg: '#fff3e0',                  color: '#e65100',                    icon: '↩', label: 'L2 sent back remediation' },
};

export default function StatusChip({ variant, label, size = 'md' }: ChipProps) {
  const config = CHIP_MAP[variant] ?? CHIP_MAP.draft;
  const displayLabel = label ?? config.label;
  const height = size === 'sm' ? 22 : 24;
  const fontSize = size === 'sm' ? 11 : 12;
  const px = size === 'sm' ? 8 : 10;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height,
        padding: `0 ${px}px`,
        borderRadius: 100,
        background: config.bg,
        color: config.color,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 9, lineHeight: 1 }}>{config.icon}</span>
      {displayLabel}
    </span>
  );
}

export function ScopeBadge({ scope }: { scope: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    Subtask:     { bg: '#e3f2fd', color: '#0d47a1' },
    Task:        { bg: '#e8f5e9', color: '#1b5e20' },
    Application: { bg: '#fff3e0', color: '#e65100' },
    Audit:       { bg: '#fce4ec', color: '#880e4f' },
  };
  const c = colors[scope] ?? colors.Subtask;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 22,
      padding: '0 8px',
      borderRadius: 100,
      background: c.bg,
      color: c.color,
      fontSize: 11,
      fontWeight: 600,
    }}>
      {scope}
    </span>
  );
}

export function AppBadge({ code, name }: { code: string; name: string }) {
  const colors: Record<string, string> = {
    P: '#1565c0', B: '#6a1b9a', T: '#00695c', M: '#4e342e', V: '#1b5e20',
  };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: 24,
      padding: '0 10px',
      borderRadius: 100,
      background: `${colors[code] ?? '#455a64'}18`,
      color: colors[code] ?? '#455a64',
      fontSize: 12,
      fontWeight: 600,
      border: `1px solid ${colors[code] ?? '#455a64'}30`,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>{code}</span>
      {name}
    </span>
  );
}
