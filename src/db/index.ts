import Dexie, { Table } from 'dexie';
import type { Goal, Task, FocusSession, Reflection, SkillNode } from '@/types';

export class LearnPlannerDB extends Dexie {
  goals!: Table<Goal, string>;
  tasks!: Table<Task, string>;
  sessions!: Table<FocusSession, string>;
  reflections!: Table<Reflection, string>;
  skills!: Table<SkillNode, string>;

  constructor() {
    super('LearnPlannerDB');
    this.version(1).stores({
      goals:        'id, status, timeBound, createdAt',
      tasks:        'id, goalId, quadrant, status, sortOrder, [goalId+status]',
      sessions:     'id, taskId, startTime',
      reflections:  'id, goalId, cycleEnd',
      skills:       'id, parentId, mastery',
    });
  }
}

export const db = new LearnPlannerDB();
