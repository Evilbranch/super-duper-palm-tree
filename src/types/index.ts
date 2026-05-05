// ──── Goal (SMART 目标) ────
export interface Goal {
  id: string;
  title: string;
  specific: string;
  measurable: {
    metric: string;
    current: number;
    target: number;
    unit: string;
  };
  achievable: {
    estimatedHours: number;
    dailyMinutes: number;
    feasibility: number;
  };
  relevant: string;
  timeBound: string; // ISO 8601
  status: 'active' | 'completed' | 'archived';
  createdAt: number;
  updatedAt: number;
}

// ──── Task (任务, 挂载于 Goal) ────
export interface Task {
  id: string;
  goalId: string;
  title: string;
  description: string;
  urgency: 0 | 1 | 2 | 3;
  importance: 0 | 1 | 2 | 3;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  status: 'todo' | 'in_progress' | 'done';
  estimatedPomodoros: number;
  sortOrder: number;
  isCorrective: boolean;
  createdAt: number;
  completedAt: number | null;
}

// ──── FocusSession (专注记录) ────
export interface FocusSession {
  id: string;
  taskId: string;
  startTime: number;
  endTime: number;
  duration: number;
  interruptions: number;
}

// ──── Reflection (PDCA 复盘) ────
export interface Reflection {
  id: string;
  goalId: string;
  cycleStart: string;
  cycleEnd: string;
  plan: string;
  done: string;
  check: string;
  act: string;
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt: number;
}

// ──── SkillNode (技能树) ────
export interface SkillNode {
  id: string;
  name: string;
  parentId: string | null;
  mastery: number;
  linkedGoalIds: string[];
}
