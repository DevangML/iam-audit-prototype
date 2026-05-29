export default function EmailPreview() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#e8ecf0',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      {/* Email envelope */}
      <div style={{
        width: 600,
        background: '#ffffff',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}>
        {/* Email header meta */}
        <div style={{
          background: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 24px',
          fontSize: 12,
          color: '#666',
        }}>
          <div style={{ marginBottom: 4 }}>
            <strong>From:</strong> noreply@iam-audit.elasticrun.com
          </div>
          <div style={{ marginBottom: 4 }}>
            <strong>To:</strong> priya.nair@elasticrun.com
          </div>
          <div>
            <strong>Subject:</strong> IAM Audit — Task assigned: Velocity / Population sample
          </div>
        </div>

        {/* Email body */}
        <div>
          {/* Brand header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--hero-start), var(--hero-end))',
            padding: '28px 32px',
          }}>
            <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
              IAM Audit
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
              ElasticRun · R1 ITGC
            </div>
          </div>

          {/* Body content */}
          <div style={{ padding: '32px 32px 24px' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#0a1628', marginBottom: 16 }}>
              Hi Priya,
            </p>
            <p style={{ fontSize: 14, color: '#3d4d5c', lineHeight: 1.6, marginBottom: 20 }}>
              A task has been assigned to you in the current audit cycle. Please complete your evidence and mark the task as done at your earliest convenience.
            </p>

            {/* Task card */}
            <div style={{
              border: '1px solid #e3e8ef',
              borderRadius: 8,
              padding: '18px 20px',
              marginBottom: 28,
              background: '#f8fbff',
            }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 8px',
                  borderRadius: 4, background: '#e3f2fd', color: '#0d47a1',
                  letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                }}>
                  V · Velocity
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', marginBottom: 6 }}>
                Population sample
              </div>
              <div style={{ fontSize: 13, color: '#5a6b7d', marginBottom: 12 }}>
                R1 ITGC — May 2026 · ElasticRun
              </div>

              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#8a9ab0', fontWeight: 600, marginBottom: 2 }}>DUE DATE</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0a1628' }}>30 May 2026</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#8a9ab0', fontWeight: 600, marginBottom: 2 }}>QUESTIONS</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0a1628' }}>4 (3 mandatory)</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#8a9ab0', fontWeight: 600, marginBottom: 2 }}>PROGRESS</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0a1628' }}>4 / 6</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <a
                href="/my-work/task/t1"
                style={{
                  display: 'inline-block',
                  background: '#1976d2',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '13px 36px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '-0.2px',
                }}
              >
                Open task →
              </a>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e3e8ef', margin: '0 0 20px' }} />

            <p style={{ fontSize: 12, color: '#8a9ab0', lineHeight: 1.6 }}>
              You received this email because you are assigned as an auditor in IAM Audit at ElasticRun.
              Do not reply to this email — use the task panel in the app to communicate.
            </p>
          </div>

          {/* Footer */}
          <div style={{
            background: '#f4f7fb',
            borderTop: '1px solid #e3e8ef',
            padding: '14px 32px',
            fontSize: 11,
            color: '#8a9ab0',
            textAlign: 'center',
          }}>
            IAM Audit · ElasticRun · Pilot R1 ITGC May 2026
          </div>
        </div>
      </div>
    </div>
  );
}
