import { create } from 'zustand';
import { db } from '@/db';
import { uuid } from '@/utils/id';
import { useSkillStore } from '@/stores/skillStore';
import type { Goal } from '@/types';

export type GoalDraft = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>;

interface GoalState {
  goals: Goal[];
  activeGoalId: string | null;
  isLoading: boolean;

  loadAll: () => Promise<void>;
  create: (draft: GoalDraft) => Promise<string>;
  update: (id: string, draft: GoalDraft) => Promise<void>;
  remove: (id: string) => Promise<void>;
  updateMeasurable: (goalId: string, delta: number) => Promise<void>;
  toggleStatus: (goalId: string) => Promise<void>;
  archive: (goalId: string) => Promise<void>;
  setActive: (goalId: string | null) => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  activeGoalId: null,
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    try {
      const goals = await db.goals.orderBy('createdAt').reverse().toArray();
      set({ goals, isLoading: false });
    } catch (err) {
      console.error('IndexedDB 读取失败:', err);
      set({ isLoading: false });
    }
  },

  create: async (draft) => {
    const id = uuid();
    const now = Date.now();
    const goal: Goal = { id, ...draft, createdAt: now, updatedAt: now };
    try {
      await db.goals.add(goal);
      set((s) => ({ goals: [goal, ...s.goals], activeGoalId: id }));
    } catch (err) {
      console.error('目标创建失败:', err);
      throw err;
    }
    return id;
  },

  update: async (id, draft) => {
    const existing = await db.goals.get(id);
    if (!existing) throw new Error('目标不存在');
    const updated: Goal = {
      ...existing,
      ...draft,
      id,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    };
    try {
      await db.goals.put(updated);
      set((s) => ({
        goals: s.goals.map((g) => (g.id === id ? updated : g)),
      }));
    } catch (err) {
      console.error('目标更新失败:', err);
      throw err;
    }
  },

  remove: async (id) => {
    try {
      await db.transaction('rw', [db.goals, db.tasks], async () => {
        await db.goals.delete(id);
        await db.tasks.where({ goalId: id }).delete();
      });
      set((s) => ({
        goals: s.goals.filter((g) => g.id !== id),
        activeGoalId: s.activeGoalId === id ? null : s.activeGoalId,
      }));
    } catch (err) {
      console.error('目标删除失败:', err);
      throw err;
    }
  },

  updateMeasurable: async (goalId, delta) => {
    const goal = await db.goals.get(goalId);
    if (!goal) return;
    goal.measurable.current = Math.max(0, goal.measurable.current + delta);
    goal.updatedAt = Date.now();
    await db.goals.put(goal);
    set((s) => ({
      goals: s.goals.map((g) => (g.id === goalId ? { ...goal } : g)),
    }));
  },

  toggleStatus: async (goalId) => {
    const goal = await db.goals.get(goalId);
    if (!goal) return;
    const next = goal.status === 'active' ? 'completed' : 'active';
    await db.goals.update(goalId, { status: next, updatedAt: Date.now() });
    set((s) => ({
      goals: s.goals.map((g) =>
        g.id === goalId ? { ...g, status: next, updatedAt: Date.now() } : g,
      ),
    }));
    // Auto-recalc skill mastery when goal status changes
    await useSkillStore.getState().recalcAllMastery();
  },

  archive: async (goalId) => {
    await db.goals.update(goalId, { status: 'archived', updatedAt: Date.now() });
    set((s) => ({
      goals: s.goals.filter((g) => g.id !== goalId),
      activeGoalId: s.activeGoalId === goalId ? null : s.activeGoalId,
    }));
  },

  setActive: (goalId) => set({ activeGoalId: goalId }),
}));
