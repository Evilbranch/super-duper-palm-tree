import { create } from 'zustand';

const POMODORO_SECONDS = 25 * 60;

interface TimerState {
  isRunning: boolean;
  activeTaskId: string | null;
  remainingSeconds: number;
  totalSeconds: number;

  start: (taskId: string, durationSeconds?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  activeTaskId: null,
  remainingSeconds: POMODORO_SECONDS,
  totalSeconds: POMODORO_SECONDS,

  start: (taskId, durationSeconds = POMODORO_SECONDS) =>
    set({
      isRunning: true,
      activeTaskId: taskId,
      remainingSeconds: durationSeconds,
      totalSeconds: durationSeconds,
    }),

  pause: () => set({ isRunning: false }),
  resume: () => set({ isRunning: true }),
  reset: () =>
    set({
      isRunning: false,
      activeTaskId: null,
      remainingSeconds: POMODORO_SECONDS,
      totalSeconds: POMODORO_SECONDS,
    }),

  tick: () => {
    const { isRunning, remainingSeconds } = get();
    if (!isRunning || remainingSeconds <= 0) return;
    set({ remainingSeconds: remainingSeconds - 1 });
  },
}));
