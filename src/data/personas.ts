import type { Persona } from './types';

export const PERSONAS: readonly Persona[] = [
  {
    id: 'lead',
    name: 'Rahul Mehta',
    role: 'lead',
    title: 'Audit team lead',
    avatar: 'RM',
    subtitle: 'Audit Ops, create audits, rejections',
    homeRoute: '/audit-ops',
  },
  {
    id: 'assignee',
    name: 'Priya Nair',
    role: 'assignee',
    title: 'Task assignee',
    avatar: 'PN',
    subtitle: 'My Work, tasks & evidence',
    homeRoute: '/my-work',
  },
  {
    id: 'l1',
    name: 'Meera Shah',
    role: 'l1',
    title: 'L1 reviewer',
    avatar: 'MS',
    subtitle: 'Pending reviews, sign-off',
    homeRoute: '/audit-review',
  },
  {
    id: 'l2',
    name: 'Arjun Patel',
    role: 'l2',
    title: 'L2 reviewer',
    avatar: 'AP',
    subtitle: 'Final approval',
    homeRoute: '/audit-review',
  },
] as const;

export const EMPTY_ASSIGNEE: Persona = {
  id: 'empty-assignee',
  name: 'Empty Assignee',
  role: 'assignee',
  title: 'Task assignee',
  avatar: 'EA',
  subtitle: 'No tasks assigned — empty state',
  homeRoute: '/my-work?empty=1',
};
