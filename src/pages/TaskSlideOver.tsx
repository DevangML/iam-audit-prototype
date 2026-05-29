import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuditStore } from '../store/auditStore';
import type { Task, Subtask } from '../data/types';

interface TaskSlideOverProps {
  taskId: string;
  onClose: () => void;
}

export default function TaskSlideOver({ taskId, onClose }: TaskSlideOverProps) {
  const { tasks, updateSubtaskAnswer, markTaskComplete } = useAuditStore();
  const task = tasks.find((t) => t.id === taskId);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (task) {
      const initial: Record<string, string> = {};
      task.subtasks.forEach((s) => { initial[s.id] = s.value; });
      setLocalAnswers(initial);
    }
  }, [taskId]);

  if (!task) return null;

  const mandatoryDone = task.subtasks.filter(
    (s) => s.mandatory && (localAnswers[s.id] || s.value)
  ).length;
  const mandatoryTotal = task.subtasks.filter((s) => s.mandatory).length;
  const canComplete = mandatoryDone >= mandatoryTotal;

  function handleSave() {
    Object.entries(localAnswers).forEach(([id, value]) => {
      updateSubtaskAnswer(task!.id, id, value);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function handleComplete() {
    handleSave();
    markTaskComplete(task!.id);
    onClose();
  }

  return createPortal(
    <>
      <div style={overlayStyle} onClick={onClose} />
      <aside style={panelStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <AppBadge code={task.appCode} name={task.app} />
              {task.isCorrection && <CorrectionBadge />}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{task.title}</h2>
            {task.description && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                {task.description}
              </p>
            )}
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Progress subheader */}
        <div style={subheaderStyle}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {mandatoryDone} of {mandatoryTotal} mandatory complete
          </span>
          <div style={progressBarBg}>
            <div style={{ ...progressBarFill, width: `${(mandatoryDone / mandatoryTotal) * 100}%` }} />
          </div>
        </div>

        {/* Subtask list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {task.subtasks.map((subtask, idx) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              index={idx + 1}
              value={localAnswers[subtask.id] ?? subtask.value}
              onChange={(val) => setLocalAnswers((prev) => ({ ...prev, [subtask.id]: val }))}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          {saved && (
            <span style={{ fontSize: 13, color: 'var(--status-ready)', fontWeight: 500 }}>✓ Saved</span>
          )}
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn btn--ghost" onClick={handleSave}>Save draft</button>
            <button
              className="btn btn--primary"
              onClick={handleComplete}
              disabled={!canComplete || task.status === 'complete'}
              title={!canComplete ? 'Complete all mandatory fields first' : ''}
            >
              {task.status === 'complete' ? '✓ Complete' : 'Mark complete'}
            </button>
          </div>
        </div>
      </aside>
    </>,
    document.body
  );
}

function SubtaskRow({
  subtask, index, value, onChange,
}: {
  subtask: Subtask;
  index: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={subtaskRowStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, minWidth: 20, paddingTop: 2 }}>
          {index}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
              {subtask.question}
            </span>
            {subtask.mandatory && (
              <span style={{ fontSize: 10, color: '#c62828', fontWeight: 700 }}>*</span>
            )}
          </div>
          <AnswerInput type={subtask.answerType} value={value} onChange={onChange} />
        </div>
        {value && (
          <span style={{ fontSize: 16, color: 'var(--status-ready)', paddingTop: 2 }}>✓</span>
        )}
      </div>
    </div>
  );
}

function AnswerInput({ type, value, onChange }: { type: string; value: string; onChange: (v: string) => void }) {
  switch (type) {
    case 'text':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder="Enter your response…"
          style={{ width: '100%', resize: 'vertical', minHeight: 60 }}
        />
      );
    case 'yes_no':
      return (
        <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--border-card)', width: 'fit-content' }}>
          {(['yes', 'no'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                padding: '7px 20px',
                fontSize: 13,
                fontWeight: 600,
                background: value === opt ? 'var(--brand-500)' : 'transparent',
                color: value === opt ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s',
              }}
            >
              {opt === 'yes' ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      );
    case 'date':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 200 }}
        />
      );
    case 'attachment':
      return (
        <div>
          {value ? (
            <div style={fileChipStyle}>
              <span style={{ fontSize: 14 }}>📎</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
              <button
                onClick={() => onChange('')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12 }}
              >
                ✕
              </button>
            </div>
          ) : (
            <label style={uploadZoneStyle}>
              <span style={{ fontSize: 22 }}>⬆️</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Click or drag to upload
              </span>
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) onChange(e.target.files[0].name);
                }}
              />
            </label>
          )}
        </div>
      );
    default:
      return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
}

function AppBadge({ code, name }: { code: string; name: string }) {
  const colors: Record<string, string> = { P: '#1565c0', B: '#6a1b9a', T: '#00695c', M: '#4e342e', V: '#1b5e20' };
  const c = colors[code] ?? '#455a64';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: '0 10px', borderRadius: 100, background: `${c}18`, color: c, fontSize: 12, fontWeight: 600, border: `1px solid ${c}30` }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{code}</span>
      {name}
    </span>
  );
}

function CorrectionBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 100, background: 'var(--chip-correction-bg)', color: 'var(--chip-correction-text)', fontSize: 11, fontWeight: 700 }}>
      ! CORRECTION
    </span>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'var(--overlay-dim)',
  zIndex: 600,
};

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, right: 0, bottom: 0,
  width: 'var(--slideover-w)',
  background: 'var(--surface-card)',
  borderLeft: '1px solid var(--border-card)',
  boxShadow: '-8px 0 32px rgba(10,22,40,0.14)',
  zIndex: 700,
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '22px 24px 16px',
  borderBottom: '1px solid var(--border-card)',
};

const subheaderStyle: React.CSSProperties = {
  padding: '12px 24px',
  borderBottom: '1px solid var(--border-card)',
  background: 'var(--surface-page)',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
};

const progressBarBg: React.CSSProperties = {
  flex: 1,
  height: 6,
  borderRadius: 3,
  background: 'var(--border-card)',
  overflow: 'hidden',
};

const progressBarFill: React.CSSProperties = {
  height: '100%',
  background: 'var(--brand-500)',
  borderRadius: 3,
  transition: 'width 0.3s ease',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '16px 24px',
  borderTop: '1px solid var(--border-card)',
  background: 'var(--surface-page)',
};

const closeBtnStyle: React.CSSProperties = {
  width: 32, height: 32,
  borderRadius: 8,
  background: 'var(--surface-page)',
  border: '1px solid var(--border-card)',
  cursor: 'pointer',
  fontSize: 14,
  color: 'var(--text-secondary)',
  flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const subtaskRowStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderBottom: '1px solid var(--border-card)',
};

const fileChipStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: 8,
  background: '#e3f2fd',
  border: '1px solid #90caf9',
  width: 'fit-content',
  maxWidth: '100%',
};

const uploadZoneStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px 24px',
  border: '1.5px dashed var(--border-card)',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'border-color 0.15s',
};
