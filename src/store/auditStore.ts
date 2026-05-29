import { create } from 'zustand';
import {
  INITIAL_AUDIT,
  INITIAL_AUDIT_2,
  INITIAL_TASKS,
  INITIAL_REJECTIONS,
  INITIAL_CORRECTIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/demo-audit';
import type { Audit, Task, Rejection, Correction, Notification, AuditStatus, SubtaskReviewStatus } from '../data/types';

interface AuditStore {
  // Core data
  audit: Audit;
  audit2: Audit;
  tasks: Task[];
  rejections: Rejection[];
  corrections: Correction[];
  notifications: Notification[];

  // UI state
  notificationDrawerOpen: boolean;
  tasksSeeded: boolean; // for S08 empty state

  // Workflow actions
  setNotificationDrawerOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;

  submitToL1: () => void;
  l1Approve: (comment: string) => void;
  l1SendBack: (comment: string) => void;
  l2Approve: (comment: string) => void;
  l2SendBack: (comment: string) => void;

  applyTemplateTasks: () => void;
  addTask: (task: Task) => void;

  createCorrection: (data: Partial<Correction> & { rejectionId: string }) => void;
  approveCorrection: (id: string) => void;
  rejectCorrection: (id: string) => void;

  reforwardToL1: () => void;
  reforwardToL2: () => void;
  releaseToAuditTeam: () => void;

  updateSubtaskReview: (taskId: string, subtaskId: string, status: SubtaskReviewStatus) => void;
  updateSubtaskAnswer: (taskId: string, subtaskId: string, value: string) => void;
  markTaskComplete: (taskId: string) => void;

  closeAudit: () => void;

  // Dev helpers
  setAuditStatus: (status: AuditStatus) => void;
  resetStore: () => void;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  audit: { ...INITIAL_AUDIT },
  audit2: { ...INITIAL_AUDIT_2 },
  tasks: [...INITIAL_TASKS.map(t => ({ ...t, subtasks: t.subtasks.map(s => ({ ...s })) }))],
  rejections: [...INITIAL_REJECTIONS],
  corrections: [...INITIAL_CORRECTIONS],
  notifications: [...INITIAL_NOTIFICATIONS],
  notificationDrawerOpen: false,
  tasksSeeded: true, // start with tasks seeded

  setNotificationDrawerOpen: (open) => set({ notificationDrawerOpen: open }),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  submitToL1: () =>
    set((s) => ({
      audit: { ...s.audit, status: 'pending_l1', routing_target: null },
    })),

  l1Approve: (comment) =>
    set((s) => ({
      audit: { ...s.audit, status: 'pending_l2', routing_target: null, l1Comment: comment },
    })),

  l1SendBack: (comment) =>
    set((s) => ({
      audit: {
        ...s.audit,
        status: 'sent_back',
        routing_target: 'audit_team',
        l1Comment: comment,
      },
      rejections: s.rejections.length ? s.rejections : [...INITIAL_REJECTIONS],
    })),

  l2Approve: (comment) =>
    set((s) => ({
      audit: { ...s.audit, status: 'approved', routing_target: null, l2Comment: comment },
    })),

  l2SendBack: (comment) =>
    set((s) => ({
      audit: {
        ...s.audit,
        status: 'sent_back',
        routing_target: 'l1',
        l2Comment: comment,
      },
    })),

  applyTemplateTasks: () =>
    set(() => ({
      tasks: INITIAL_TASKS.map(t => ({ ...t, subtasks: t.subtasks.map(s => ({ ...s })) })),
      tasksSeeded: true,
    })),

  addTask: (task) =>
    set((s) => ({ tasks: [...s.tasks, task] })),

  createCorrection: (data) => {
    const id = `corr-${Date.now()}`;
    const newCorr: Correction = {
      id,
      app: data.app ?? '',
      appCode: data.appCode ?? '',
      rejectionId: data.rejectionId,
      title: data.title ?? 'Correction task',
      description: data.description ?? '',
      assignee: data.assignee ?? 'Priya Nair',
      assigneeAvatar: data.assigneeAvatar ?? 'PN',
      due: data.due ?? '',
      progressDone: 0,
      progressTotal: 1,
      status: 'open',
      scope: data.scope ?? 'Application',
    };
    set((s) => ({
      corrections: [...s.corrections, newCorr],
      rejections: s.rejections.map((r) =>
        r.id === data.rejectionId ? { ...r, hasCorrection: true, correctionTaskId: id } : r
      ),
    }));
  },

  approveCorrection: (id) =>
    set((s) => ({
      corrections: s.corrections.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)),
    })),

  rejectCorrection: (id) =>
    set((s) => ({
      corrections: s.corrections.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)),
    })),

  reforwardToL1: () =>
    set((s) => ({
      audit: { ...s.audit, status: 'pending_l1', routing_target: null },
    })),

  reforwardToL2: () =>
    set((s) => ({
      audit: { ...s.audit, status: 'pending_l2', routing_target: null },
    })),

  releaseToAuditTeam: () =>
    set((s) => ({
      audit: { ...s.audit, status: 'sent_back', routing_target: 'audit_team' },
    })),

  updateSubtaskReview: (taskId, subtaskId, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, reviewStatus: status } : st
              ),
            }
          : t
      ),
    })),

  updateSubtaskAnswer: (taskId, subtaskId, value) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, value } : st
              ),
            }
          : t
      ),
    })),

  markTaskComplete: (taskId) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'complete', mandatoryComplete: t.mandatoryTotal }
          : t
      ),
    })),

  closeAudit: () =>
    set((s) => ({ audit: { ...s.audit, status: 'approved' } })),

  setAuditStatus: (status) =>
    set((s) => ({ audit: { ...s.audit, status } })),

  resetStore: () =>
    set(() => ({
      audit: { ...INITIAL_AUDIT },
      tasks: INITIAL_TASKS.map(t => ({ ...t, subtasks: t.subtasks.map(s => ({ ...s })) })),
      rejections: [...INITIAL_REJECTIONS],
      corrections: [...INITIAL_CORRECTIONS],
      notifications: [...INITIAL_NOTIFICATIONS],
      tasksSeeded: true,
    })),
}));

// Derived selectors
export const selectMandatoryBlockers = (tasks: Task[]) =>
  tasks.filter(
    (t) => !t.isCorrection && t.status !== 'complete' && t.mandatoryComplete < t.mandatoryTotal
  );

export const selectAllCorrectionsApproved = (corrections: Correction[]) =>
  corrections.length > 0 && corrections.every((c) => c.status === 'approved');

export const selectAnySubtaskRejected = (tasks: Task[], app?: string) => {
  const relevantTasks = app ? tasks.filter((t) => t.app === app && !t.isCorrection) : tasks.filter(t => !t.isCorrection);
  return relevantTasks.some((t) => t.subtasks.some((s) => s.reviewStatus === 'rejected'));
};
