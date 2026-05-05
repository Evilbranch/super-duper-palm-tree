import { create } from 'zustand';
import { db } from '@/db';
import { uuid } from '@/utils/id';
import type { FocusSession } from '@/types';

interface SessionState {
  sessions: FocusSession[];

  loadForTask: (taskId: string) => Promise<void>;
  record: (
    taskId: string,
    startTime: number,
    duration: number,
    interruptions: number,
  ) => Promise<string>;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],

  loadForTask: async (taskId) => {
    const sessions = await db.sessions
      .where({ taskId })
      .reverse()
      .sortBy('startTime');
    set({ sessions });
  },

  record: async (taskId, startTime, duration, interruptions) => {
    const id = uuid();
    const session: FocusSession = {
      id,
      taskId,
      startTime,
      endTime: startTime + duration * 1000,
      duration,
      interruptions,
    };
    await db.sessions.add(session);
    set((s) => ({ sessions: [session, ...s.sessions] }));
    return id;
  },
}));
