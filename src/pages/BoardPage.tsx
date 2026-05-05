import { useEffect, useState } from 'react';
import { useGoalStore } from '@/stores/goalStore';
import { useTaskStore } from '@/stores/taskStore';
import { useTimerStore } from '@/stores/timerStore';
import { useSessionStore } from '@/stores/sessionStore';
import EisenhowerBoard from '@/components/task/EisenhowerBoard';
import TaskForm from '@/components/task/TaskForm';
import FocusTimer from '@/components/timer/FocusTimer';

export default function BoardPage() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const { goals, activeGoalId, loadAll, setActive } = useGoalStore();
  const { tasksByGoal, loadForGoal, reposition, updateStatus, decrementPomodoro } = useTaskStore();
  const { activeTaskId, start, reset } = useTimerStore();
  const { record } = useSessionStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (activeGoalId) loadForGoal(activeGoalId);
  }, [activeGoalId, loadForGoal]);

  const tasks = activeGoalId ? (tasksByGoal[activeGoalId] ?? []) : [];

  const handleStartFocus = (taskId: string) => {
    start(taskId);
    setShowTimer(true);
  };

  const handleTimerComplete = async () => {
    if (activeTaskId) {
      const startTime = Date.now() - 25 * 60 * 1000;
      await record(activeTaskId, startTime, 25 * 60, 0);
      decrementPomodoro(activeTaskId);
    }
    setShowTimer(false);
    reset();
  };

  if (showTimer) {
    return (
      <div className="mx-auto max-w-md p-4">
        <FocusTimer onComplete={handleTimerComplete} />
        <button
          onClick={() => setShowTimer(false)}
          className="btn btn-secondary mt-4 w-full"
        >
          返回看板
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={activeGoalId ?? ''}
            onChange={(e) => setActive(e.target.value || null)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="">选择目标...</option>
            {goals
              .filter((g) => g.status === 'active')
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
          </select>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          disabled={!activeGoalId}
          className="btn btn-primary"
        >
          ＋ 添加任务
        </button>
      </div>

      {/* Task form modal */}
      {showTaskForm && activeGoalId && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">新建任务</h3>
            <button onClick={() => setShowTaskForm(false)} className="btn btn-ghost btn-sm">
              取消
            </button>
          </div>
          <TaskForm goalId={activeGoalId} onClose={() => setShowTaskForm(false)} />
        </div>
      )}

      {/* Board */}
      {activeGoalId && (
        <EisenhowerBoard
          tasks={tasks}
          onDragEnd={reposition}
          onStartFocus={handleStartFocus}
          onComplete={(id) => updateStatus(id, 'done')}
        />
      )}

      {/* Empty state */}
      {!activeGoalId && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-slate-500">先选择一个学习目标</p>
        </div>
      )}
    </div>
  );
}
