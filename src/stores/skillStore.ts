import { create } from 'zustand';
import { db } from '@/db';
import { uuid } from '@/utils/id';
import type { SkillNode } from '@/types';

interface SkillState {
  skills: SkillNode[];
  isLoading: boolean;

  loadAll: () => Promise<void>;
  add: (name: string, parentId: string | null) => Promise<string>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  toggleLinkGoal: (skillId: string, goalId: string) => Promise<void>;
  recalcAllMastery: () => Promise<void>;
}

export const useSkillStore = create<SkillState>((set) => ({
  skills: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    try {
      const skills = await db.skills.toArray();
      set({ skills, isLoading: false });
    } catch (err) {
      console.error('技能加载失败:', err);
      set({ isLoading: false });
    }
  },

  add: async (name, parentId) => {
    const id = uuid();
    const node: SkillNode = {
      id,
      name,
      parentId,
      mastery: 0,
      linkedGoalIds: [],
    };
    try {
      await db.skills.add(node);
      set((s) => ({ skills: [...s.skills, node] }));
    } catch (err) {
      console.error('技能添加失败:', err);
      throw err;
    }
    return id;
  },

  remove: async (id) => {
    const children = await db.skills.where({ parentId: id }).toArray();
    await db.transaction('rw', db.skills, async () => {
      for (const child of children) {
        await db.skills.delete(child.id);
      }
      await db.skills.delete(id);
    });
    set((s) => ({
      skills: s.skills.filter(
        (n) => n.id !== id && !children.some((c) => c.id === n.id),
      ),
    }));
  },

  rename: async (id, name) => {
    await db.skills.update(id, { name });
    set((s) => ({
      skills: s.skills.map((n) => (n.id === id ? { ...n, name } : n)),
    }));
  },

  toggleLinkGoal: async (skillId, goalId) => {
    const skill = await db.skills.get(skillId);
    if (!skill) return;
    const ids = skill.linkedGoalIds.includes(goalId)
      ? skill.linkedGoalIds.filter((id) => id !== goalId)
      : [...skill.linkedGoalIds, goalId];

    // Recalc mastery from linked goals
    const goals = await db.goals.bulkGet(ids);
    const completed = goals.filter((g) => g?.status === 'completed').length;
    const mastery = ids.length > 0 ? completed / ids.length : 0;

    await db.skills.update(skillId, { linkedGoalIds: ids, mastery });
    set((s) => ({
      skills: s.skills.map((n) =>
        n.id === skillId ? { ...n, linkedGoalIds: ids, mastery } : n,
      ),
    }));
  },

  recalcAllMastery: async () => {
    const skills = await db.skills.toArray();
    const updated: SkillNode[] = [];

    for (const skill of skills) {
      const goals = await db.goals.bulkGet(skill.linkedGoalIds);
      const completed = goals.filter((g) => g?.status === 'completed').length;
      const mastery =
        skill.linkedGoalIds.length > 0
          ? completed / skill.linkedGoalIds.length
          : 0;
      if (mastery !== skill.mastery) {
        skill.mastery = mastery;
        await db.skills.update(skill.id, { mastery });
      }
      updated.push(skill);
    }
    set({ skills: updated });
  },
}));
