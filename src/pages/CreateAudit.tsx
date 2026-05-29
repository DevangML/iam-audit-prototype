import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { useAuditStore } from '../store/auditStore';

/** Governance CSV: IAM Audit List — six review categories (masters in production). */
export const REVIEW_TYPES = [
  'ITGC Business System',
  'Privilege Access Review (System Manager Role)',
  '3P Employees with Business Application access',
  'Users with Exception Access',
  'PeopleStrong Internal Audit',
  'System ID Review With API Key and API Secret',
] as const;

/** Apps per type — demo uses ITGC five; production loads from Review Type master. */
const APPS_BY_TYPE: Record<string, string[]> = {
  'ITGC Business System': ['Pravesh', 'Beejak', 'Trinity', 'Matrix', 'Velocity'],
  'Privilege Access Review (System Manager Role)': [
    'Pravesh', 'Beejak', 'Trinity', 'Matrix', 'Velocity', 'CAS', 'Nimbus',
  ],
  '3P Employees with Business Application access': ['Velocity', 'Matrix', 'Trinity', 'Pravesh'],
  'Users with Exception Access': ['Velocity', 'Pravesh', 'Trinity'],
  'PeopleStrong Internal Audit': ['CAS', 'G-suite'],
  'System ID Review With API Key and API Secret': [
    'Pravesh', 'Beejak', 'Trinity', 'Matrix', 'Velocity', 'CAS', 'Nimbus',
  ],
};

export default function CreateAudit() {
  const ok = useRoleGuard(['lead']);
  const navigate = useNavigate();
  const { applyTemplateTasks } = useAuditStore();
  const [step, setStep] = useState(1);

  // Step 1
  const [reviewType, setReviewType] = useState<string>(REVIEW_TYPES[0]);
  const [period, setPeriod] = useState('May 2026');
  const [title, setTitle] = useState('ITGC Business System — May 2026');

  const appsForType = APPS_BY_TYPE[reviewType] ?? APPS_BY_TYPE['ITGC Business System'];

  // Step 2
  const [selectedApps, setSelectedApps] = useState<string[]>([...appsForType]);

  function handleReviewTypeChange(next: string) {
    setReviewType(next);
    const apps = APPS_BY_TYPE[next] ?? [];
    setSelectedApps([...apps]);
    const short = next.includes('ITGC') ? 'ITGC' : next.split(' ')[0];
    setTitle(`${short} — ${period}`);
  }

  function toggleApp(app: string) {
    setSelectedApps((prev) =>
      prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
    );
  }

  function handleCreate() {
    applyTemplateTasks();
    navigate('/audit-ops/audit/audit-1?tab=tasks');
  }

  if (!ok) return null;

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh', paddingTop: 'var(--header-h)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        {/* Back */}
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/audit-ops')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ← {step > 1 ? 'Back' : 'Audit Ops'}
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Create audit</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>
          Choose a review category from your governance catalogue and start a new audit cycle
        </p>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 36 }}>
          {[
            { n: 1, label: 'Review type' },
            { n: 2, label: 'Applications' },
            { n: 3, label: 'Summary' },
          ].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'initial' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step >= s.n ? 'var(--brand-500)' : 'var(--border-card)',
                  color: step >= s.n ? '#fff' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: step >= s.n ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: 2, background: step > s.n ? 'var(--brand-500)' : 'var(--border-card)', margin: '0 12px', borderRadius: 1 }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: 32, boxShadow: 'var(--shadow-card)' }}>
          {step === 1 && (
            <Step1
              reviewType={reviewType}
              period={period}
              title={title}
              onReviewType={handleReviewTypeChange}
              onPeriod={setPeriod}
              onTitle={setTitle}
            />
          )}
          {step === 2 && (
            <Step2 apps={appsForType} selectedApps={selectedApps} onToggle={toggleApp} />
          )}
          {step === 3 && (
            <Step3 reviewType={reviewType} period={period} title={title} apps={selectedApps} />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, gap: 8 }}>
            {step < 3 ? (
              <button className="btn btn--primary" onClick={() => setStep(step + 1)}>
                Continue →
              </button>
            ) : (
              <button className="btn btn--primary" onClick={handleCreate}>
                Create audit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1({ reviewType, period, title, onReviewType, onPeriod, onTitle }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Review type & period</h2>
      <div>
        <label>Review type</label>
        <select value={reviewType} onChange={(e) => onReviewType(e.target.value)}>
          {REVIEW_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label>Period</label>
        <input type="text" value={period} onChange={(e) => onPeriod(e.target.value)} placeholder="e.g. May 2026" />
      </div>
      <div>
        <label>Audit title</label>
        <input type="text" value={title} onChange={(e) => onTitle(e.target.value)} />
      </div>
    </div>
  );
}

function Step2({ apps, selectedApps, onToggle }: { apps: string[]; selectedApps: string[]; onToggle: (app: string) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Applications in scope</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        Select the applications to include in this audit cycle (from master data for this review type).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {apps.map((app) => {
          const checked = selectedApps.includes(app);
          return (
            <label
              key={app}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                border: `1.5px solid ${checked ? 'var(--brand-500)' : 'var(--border-card)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                background: checked ? '#f0f6ff' : 'var(--surface-card)',
                transition: 'all 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(app)}
                style={{ width: 16, height: 16, accentColor: 'var(--brand-500)' }}
              />
              <span style={{ fontWeight: 600, fontSize: 14 }}>{app}</span>
              {!checked && (
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#e65100', fontWeight: 500 }}>
                  ⚠ Will be excluded
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Step3({ reviewType, period, title, apps }: any) {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Summary</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Title', value: title },
          { label: 'Review type', value: reviewType },
          { label: 'Period', value: period },
          { label: 'Applications', value: apps.join(', ') },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 120, fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, padding: '12px 16px', background: '#e3f2fd', borderRadius: 8, fontSize: 13, color: '#0d47a1' }}>
        Clicking "Create audit" will create the audit and open the Tasks tab where you can apply template tasks or add tasks manually.
      </div>
    </div>
  );
}
