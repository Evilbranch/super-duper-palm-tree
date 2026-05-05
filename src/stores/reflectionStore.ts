import { create } from 'zustand';
import { db } from '@/db';
import { uuid } from '@/utils/id';
import type { Reflection } from '@/types';

interface ReflectionState {
  reflections: Reflection[];

  loadForGoal: (goalId: string) => Promise<void>;
  create: (draft: Omit<Reflection, 'id' | 'createdAt'>) => Promise<string>;
}

export const useReflectionStore = create<ReflectionState>((set) => ({
  reflections: [],

  loadForGoal: async (goalId) => {
    const reflections = await db.reflections
      .where({ goalId })
      .reverse()
      .sortBy('cycleEnd');
    set({ reflections });
  },

  create: async (draft) => {
    const id = uuid();
    const reflection: Reflection = { id, ...draft, createdAt: Date.now() };

    await db.transaction('rw', [db.reflections, db.tasks], async () => {
      await db.reflections.add(reflection);

      if (draft.rating < 3) {
        const goal = await db.goals.get(draft.goalId);
        if (!goal) return;

        await db.tasks.add({
          id: uuid(),
          goalId: draft.goalId,
          title: `改进项：${draft.check.slice(0, 30)}`,
          description: `复盘发现：${draft.check}。措施：${draft.act}`,
          urgency: 1,
          importance: 3,
          quadrant: 'Q2',
          status: 'todo',
          estimatedPomodoros: 1,
          sortOrder: 0,
          isCorrective: true,
          createdAt: Date.now(),
          completedAt: null,
        });
      }
    });

    set((s) => ({ reflections: [reflection, ...s.reflections] }));
    return id;
  },
}));
