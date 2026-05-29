import { useState } from 'react';
import { useAuditStore } from '../../store/auditStore';

interface SubtaskDraft {
  id: string;
  question: string;
  answerType: 'text' | 'attachment' | 'yes_no' | 'date';
  mandatory: boolean;
}

const ANSWER_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'date', label: 'Date' },
  { value: 'attachment', label: 'Attachment' },
];

const TEMPLATES = [
  { id: 'user-access', name: 'User access review', description: 'Population, access list, approvals' },
  { id: 'change-mgmt', name: 'Change management', description: 'CAB approvals, deployment evidence' },
  { id: 'backup', name: 'Backup & recovery', description: 'Backup logs, test results, RTO/RPO' },
];

export default function TaskWizard({ onClose }: { onClose: () => void }) {
  const { addTask } = useAuditStore();
  const [step, setStep] = useState(1);

  // Step 1
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Step 2
  const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([
    { id: 'st1', question: '', answerType: 'text', mandatory: true },
  ]);

  // Step 3
  const [assignee, setAssignee] = useState('Priya Nair');
  const [dueDate, setDueDate] = useState('2026-06-15');
  const [sendEmail, setSendEmail] = useState(true);

  function addSubtask() {
    setSubtasks(prev => [...prev, {
      id: `st${Date.now()}`,
      question: '',
      answerType: 'text',
      mandatory: false,
    }]);
  }

  function updateSubtask(id: string, field: keyof SubtaskDraft, value: any) {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  function removeSubtask(id: string) {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  }

  function handleSave() {
    const mandatory = subtasks.filter(s => s.mandatory && s.question.trim());
    addTask({
      id: `task-${Date.now()}`,
      title,
      description,
      assignee,
      assigneeAvatar: 'PN',
      assigneeId: 'assignee',
      app: 'Velocity',
      appCode: 'V',
      status: 'open',
      due: dueDate,
      mandatoryTotal: mandatory.length,
      mandatoryComplete: 0,
      subtasks: subtasks.filter(s => s.question.trim()).map((s, i) => ({
        id: `new-${i}`,
        question: s.question,
        answerType: s.answerType,
        mandatory: s.mandatory,
        value: '',
        reviewStatus: 'pending' as const,
      })),
    });
    onClose();
  }

  const canProceedStep1 = title.trim().length > 0;
  const canProceedStep2 = subtasks.some(s => s.question.trim().length > 0);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--overlay-dim)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        width: 680,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 40px rgba(10,22,40,0.18)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add task</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-secondary)', lineHeight: 1 }}>×</button>
          </div>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
            {['Details', 'Subtasks', 'Assign'].map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: done ? '#1b7a3d' : active ? 'var(--brand-500)' : 'var(--border-card)',
                    color: done || active ? '#fff' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {done ? '✓' : n}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
                  {i < 2 && <div style={{ width: 32, height: 2, background: done ? '#1b7a3d' : 'var(--border-card)', borderRadius: 2 }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Templates */}
              <div>
                <label style={labelStyle}>Start from a template (optional)</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTemplate(t.id); if (!title) setTitle(t.name); }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${selectedTemplate === t.id ? 'var(--brand-500)' : 'var(--border-card)'}`,
                        background: selectedTemplate === t.id ? 'var(--chip-progress-bg)' : 'transparent',
                        color: selectedTemplate === t.id ? 'var(--brand-500)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 13, fontWeight: 500,
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Task name <span style={{ color: 'var(--status-reject)' }}>*</span></label>
                <input
                  style={inputStyle}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Population sample review"
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what evidence is needed..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Define the evidence questions for this task.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {subtasks.map((s, idx) => (
                  <div key={s.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 140px 100px 36px',
                    gap: 10,
                    alignItems: 'start',
                    padding: '12px 14px',
                    background: 'var(--surface-page)',
                    borderRadius: 8,
                    border: '1px solid var(--border-card)',
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>Question {idx + 1}</div>
                      <input
                        style={{ ...inputStyle, margin: 0 }}
                        value={s.question}
                        onChange={e => updateSubtask(s.id, 'question', e.target.value)}
                        placeholder="Evidence question..."
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>Answer type</div>
                      <select
                        style={{ ...inputStyle, margin: 0 }}
                        value={s.answerType}
                        onChange={e => updateSubtask(s.id, 'answerType', e.target.value)}
                      >
                        {ANSWER_TYPES.map(at => (
                          <option key={at.value} value={at.value}>{at.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 24 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={s.mandatory}
                          onChange={e => updateSubtask(s.id, 'mandatory', e.target.checked)}
                        />
                        Mandatory
                      </label>
                    </div>
                    <button
                      onClick={() => removeSubtask(s.id)}
                      disabled={subtasks.length === 1}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--status-reject)', fontSize: 16, paddingTop: 24,
                        opacity: subtasks.length === 1 ? 0.3 : 1,
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSubtask}
                style={{
                  marginTop: 12, background: 'none', border: '1.5px dashed var(--border-card)',
                  borderRadius: 8, padding: '9px 16px', cursor: 'pointer',
                  width: '100%', color: 'var(--brand-500)', fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                + Add question
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: 'var(--chip-progress-bg)',
                border: '1px solid var(--brand-500)',
                borderRadius: 8, padding: '14px 16px',
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--brand-700)' }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {subtasks.filter(s => s.question.trim()).length} questions · {subtasks.filter(s => s.mandatory).length} mandatory
                </div>
              </div>
              <div>
                <label style={labelStyle}>Assignee</label>
                <select
                  style={inputStyle}
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                >
                  <option>Priya Nair</option>
                  <option>Rahul Mehta</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Due date</label>
                <input type="date" style={inputStyle} value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
                Send assignment email to {assignee}
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}
            className="btn btn--secondary"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step < 3 ? (
            <button
              className="btn btn--primary"
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              onClick={() => setStep(s => s + 1)}
            >
              Next →
            </button>
          ) : (
            <button className="btn btn--primary" onClick={handleSave}>
              Save task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1.5px solid var(--border-card)',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  color: 'var(--text-primary)',
  background: 'var(--surface-card)',
  boxSizing: 'border-box',
};
