export type Role = 'lead' | 'assignee' | 'l1' | 'l2';

export type AuditStatus =
  | 'draft'
  | 'in_progress'
  | 'pending_l1'
  | 'pending_l2'
  | 'sent_back'
  | 'approved';

export type RoutingTarget = null | 'audit_team' | 'l1';

export type TaskStatus = 'open' | 'in_progress' | 'complete';

export type SubtaskReviewStatus = 'approved' | 'rejected' | 'pending';

export type AnswerType = 'text' | 'attachment' | 'yes_no' | 'date';

export type RejectionScope = 'Subtask' | 'Task' | 'Application' | 'Audit';

export type CorrectionScope = 'Application' | 'Whole audit';

export type CorrectionStatus = 'open' | 'in_progress' | 'approved' | 'rejected';

export interface Persona {
  id: string;
  name: string;
  role: Role;
  title: string;
  avatar: string;
  subtitle: string;
  homeRoute: string;
}

export interface Session {
  userId: string;
  name: string;
  role: Role;
  avatar: string;
  title: string;
}

export interface Subtask {
  id: string;
  question: string;
  answerType: AnswerType;
  value: string;
  mandatory: boolean;
  reviewStatus: SubtaskReviewStatus;
}

export interface Task {
  id: string;
  app: string;
  appCode: string;
  title: string;
  assigneeId: string;
  assignee: string;
  assigneeAvatar: string;
  status: TaskStatus;
  mandatoryTotal: number;
  mandatoryComplete: number;
  subtasks: Subtask[];
  isCorrection?: boolean;
  correctionFor?: string;
  due?: string;
  description?: string;
}

export interface AppProgress {
  name: string;
  code: string;
  progress: number;
}

export interface Rejection {
  id: string;
  scope: RejectionScope;
  app: string;
  appCode: string;
  headline: string;
  rejectedBy: string;
  rejectedByLevel: 'L1' | 'L2';
  date: string;
  comment: string;
  correctionTaskId?: string;
  hasCorrection?: boolean;
}

export interface Correction {
  id: string;
  app: string;
  appCode: string;
  rejectionId: string;
  title: string;
  description: string;
  assignee: string;
  assigneeAvatar: string;
  due: string;
  progressDone: number;
  progressTotal: number;
  status: CorrectionStatus;
  scope: CorrectionScope;
}

export interface Notification {
  id: string;
  type: 'assigned' | 'correction' | 'ready' | 'sentback' | 'approved';
  message: string;
  timeAgo: string;
  route: string;
  read: boolean;
}

export interface Audit {
  id: string;
  title: string;
  org: string;
  reviewType: string;
  period: string;
  status: AuditStatus;
  percentComplete: number;
  routing_target: RoutingTarget;
  apps: AppProgress[];
  l1Comment?: string;
  l2Comment?: string;
  createdAt?: string;
}
