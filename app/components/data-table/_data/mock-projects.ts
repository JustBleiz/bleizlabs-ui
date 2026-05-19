// Mock data fixture dla DataTable demo route — realistic project list

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  owner: string;
  budget: number;
  deadline: string; // ISO date
  progress: number; // 0-100
  archived: boolean;
  overdue: boolean;
  description: string;
  tags: string[];
}

const OWNERS = [
  'Anna Kowalska',
  'Marek Nowak',
  'Tomasz Wiśniewski',
  'Katarzyna Wójcik',
  'Piotr Kowalczyk',
  'Maria Kamińska',
  'Jakub Lewandowski',
  'Aleksandra Dąbrowska',
];

const STATUSES: ProjectStatus[] = ['active', 'paused', 'completed', 'archived'];
const PRIORITIES: ProjectPriority[] = ['low', 'medium', 'high', 'critical'];
const TAG_POOL = [
  'frontend',
  'backend',
  'design',
  'ops',
  'product',
  'urgent',
  'research',
  'maintenance',
  'launch',
  'iteration',
];

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length]!;
}

function pickTags(seed: number): string[] {
  const count = (seed % 3) + 1;
  const start = seed % TAG_POOL.length;
  return Array.from({ length: count }, (_, i) => pick(TAG_POOL, start + i));
}

export const MOCK_PROJECTS: Project[] = Array.from({ length: 47 }, (_, i) => {
  const isOverdue = i % 11 === 0;
  const status: ProjectStatus = isOverdue ? 'active' : pick(STATUSES, i);
  const archived = status === 'archived';
  return {
    id: `proj-${String(i + 1).padStart(3, '0')}`,
    name:
      [
        `Atelier Q${(i % 4) + 1} Refresh`,
        `Marketing Funnel Pivot`,
        `Customer Portal v${(i % 3) + 2}`,
        `Onboarding Wizard`,
        `Billing Migration`,
        `Performance Sweep`,
        `Mobile Rollout`,
        `Design System Audit`,
      ][i % 8] + ` #${String(i + 1).padStart(3, '0')}`,
    status,
    priority: pick(PRIORITIES, i + 2),
    owner: pick(OWNERS, i + 3),
    budget: (((i + 1) * 8500) % 250000) + 12000,
    deadline: new Date(2026, 5 + (i % 7), ((i * 5) % 28) + 1).toISOString(),
    progress: archived ? 100 : Math.min(100, (i * 13) % 110),
    archived,
    overdue: isOverdue,
    description: `Workstream covering ${pickTags(i).join(' + ')}. Key milestones rolled out per quarter cadence.`,
    tags: pickTags(i),
  };
});

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Aktywny',
  paused: 'Wstrzymany',
  completed: 'Zakończony',
  archived: 'Zarchiwizowany',
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
  critical: 'Krytyczny',
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
