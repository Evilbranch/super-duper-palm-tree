import { create } from 'zustand';
import { db } from '@/db';
import { uuid } from '@/utils/id';
import { deriveQuadrant } from '@/utils/deriveQuadrant';
import type { Task } from '@/types';

interface TaskState {
  tasksByGoal: Record<string, Task[]>;
  isLoading: boolean;

  loadForGoal: (goalId: string) => Promise<void>;
  create: (draft: Omit<Task, 'id' | 'quadrant' | 'createdAt' | 'completedAt'>) => Promise<string>;
  reposition: (taskId: string, newUrgency: number, newImportance: number) => Promise<void>;
  updateStatus: (taskId: string, status: Task['status']) => Promise<void>;
  decrementPomodoro: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasksByGoal: {},
  isLoading: false,

  loadForGoal: async (goalId) => {
    set({ isLoading: true });
    try {
      const tasks = await db.tasks
        .where({ goalId })
        .filter((t) => t.status !== 'done')
        .sortBy('sortOrder');
      set((s) => ({
        tasksByGoal: { ...s.tasksByGoal, [goalId]: tasks },
        isLoading: false,
      }));
    } catch (err) {
      console.error('任务加载失败:', err);
      set({ isLoading: false });
    }
  },

  create: async (draft) => {
    const id = uuid();
    const quadrant = deriveQuadrant(draft.urgency, draft.importance);
    const task: Task = {
      ...draft,
      id,
      quadrant,
      createdAt: Date.now(),
      completedAt: null,
    };
    await db.tasks.add(task);
    set((s) => ({
      tasksByGoal: {
        ...s.tasksByGoal,
        [draft.goalId]: [...(s.tasksByGoal[draft.goalId] ?? []), task],
      },
    }));
    return id;
  },

  reposition: async (taskId, newUrgency, newImportance) => {
    const newQuadrant = deriveQuadrant(newUrgency, newImportance);
    const task = await db.tasks.get(taskId);
    if (!task) return;

    await db.tasks.update(taskId, {
      urgency: newUrgency as Task['urgency'],
      importance: newImportance as Task['importance'],
      quadrant: newQuadrant,
    });

    set((s) => {
      const updated: Record<string, Task[]> = {};
      for (const [gid, tasks] of Object.entries(s.tasksByGoal)) {
        updated[gid] = tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                urgency: newUrgency as Task['urgency'],
                importance: newImportance as Task['importance'],
                quadrant: newQuadrant,
              }
            : t,
        );
      }
      return { tasksByGoal: updated };
    });
  },

  updateStatus: async (taskId, status) => {
    const updates: Partial<Task> = { status };
    if (status === 'done') updates.completedAt = Date.now();
    await db.tasks.update(taskId, updates);

    set((s) => {
      const updated: Record<string, Task[]> = {};
      for (const [gid, tasks] of Object.entries(s.tasksByGoal)) {
        updated[gid] = tasks
          .map((t) => (t.id === taskId ? { ...t, ...updates } : t))
          .filter((t) => t.status !== 'done');
      }
      return { tasksByGoal: updated };
    });
  },

  decrementPomodoro: async (taskId) => {
    const task = await db.tasks.get(taskId);
    if (!task || task.estimatedPomodoros <= 0) return;
    await db.tasks.update(taskId, {
      estimatedPomodoros: task.estimatedPomodoros - 1,
    });

    set((s) => {
      const updated: Record<string, Task[]> = {};
      for (const [gid, tasks] of Object.entries(s.tasksByGoal)) {
        updated[gid] = tasks.map((t) =>
          t.id === taskId ? { ...t, estimatedPomodoros: t.estimatedPomodoros - 1 } : t,
        );
      }
      return { tasksByGoal: updated };
    });
  },
}));
