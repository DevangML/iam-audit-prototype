# IAM Audit — Interactive Prototype

**Ticket:** RECO-4618 · **Pilot demo:** ITGC Business System — May 2026 · **Org:** ElasticRun

A fully interactive, client-side prototype of the IAM Audit tool. No backend — all state lives in Zustand with seeded demo data.

**Stakeholder scope (what we deliver vs not):**  
`_bmad-output/planning-artifacts/claude-prototype/DELIVERY-SCOPE.md`

**Design:** sRGB tokens + **Display P3 (wide gamut / HDR-ready)** fallbacks in `src/styles/tokens.css` and `.hero-gradient` / `.border-accent-*` in `global.css`.

## Quick start

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Demo login

Navigate to `/login` (or any protected route — you'll be redirected). Select a profile:

| Profile | Role | Home |
|---------|------|------|
| Rahul Mehta | Audit team lead | `/audit-ops` |
| Priya Nair | Task assignee | `/my-work` |
| Meera Shah | L1 reviewer | `/audit-review` |
| Arjun Patel | L2 reviewer | `/audit-review` |

No password. Sign out via the avatar menu in the header.

## Demo flows

### Flow A — Audit team lead (Rahul Mehta)
1. `/audit-ops` → See dashboard with 2 audit cards
2. **Create audit** → 3-step wizard → redirects to empty Tasks tab
3. **Apply template tasks** → seeds demo tasks
4. **Add task** → 3-step task wizard
5. **Submit to L1** → blocked if mandatory subtasks incomplete → shows blocker modal → transitions to `pending_l1`
6. After L1 sends back: Rejections tab → Create correction → Corrections tab → Re-forward to L1

### Flow B — Task assignee (Priya Nair)
1. `/my-work` → Stat strip + task cards (one with orange correction border)
2. Click any task → 520px slide-over with evidence inputs
3. Answer subtasks (text, yes/no, date, attachment upload) → Mark complete

### Flow C — Reviewer (Meera Shah = L1, Arjun Patel = L2)
1. `/audit-review` → Pending reviews inbox → **Open review**
2. Review tab → segmented app tabs (P B T M V)
3. Approve/reject individual subtasks → Add comment → **Approve pack** or **Send back**
4. L2 send-back → L1 sees S16 remediation view (Rejections + Corrections + Review only)
5. L2 approve → S19 closure modal

### S20 Email preview
Visit `/email-preview` (any role) — standalone email layout.

## Stack

- React 18 + Vite 6
- React Router v6
- Zustand 5 (no persist — state resets on page reload by design)
- TypeScript (strict: false)
- Pure CSS with design tokens — no UI library

## Key screens

| Screen | Route | Notes |
|--------|-------|-------|
| S01 My Work | `/my-work` | Assignee task grid |
| S02 Slide-over | `/my-work/task/:taskId` | 520px evidence panel |
| S03 Pending reviews | `/audit-review` | L1/L2 inbox |
| S04 Audit Ops | `/audit-ops` | Dashboard + heatmap |
| S05 Create audit | `/audit-ops/create` | 3-step wizard |
| S06–S15 Audit detail | `/audit-ops/audit/:id` | Tabs + command bar |
| S16 L1 remediation | same URL | Tabs: Rejections, Corrections, Review |
| S17 Confirm modals | — | Submit + Send back |
| S18 Lead locked | `/audit-ops/audit/audit-2` | Lead view of Apr audit |
| S19 Closure | — | Triggered on L2 approve |
| S20 Email | `/email-preview` | Task assignment email |
| S21 Empty My Work | `/my-work?empty=1` | 5th profile card |
