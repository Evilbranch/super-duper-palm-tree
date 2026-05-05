import { useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import TaskCard from '@/components/task/TaskCard';

interface TodayFocusProps {
  goalId: string;
}

export default function TodayFocus({ goalId }: TodayFocusProps) {
  const { tasksByGoal, loadForGoal } = useTaskStore();
  const tasks = tasksByGoal[goalId] ?? [];

  useEffect(() => {
    loadForGoal(goalId);
  }, [goalId, loadForGoal]);

  const priorityOrder: Record<string, number> = { Q1: 0, Q2: 1, Q3: 2, Q4: 3 };
  const sorted = [...tasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => priorityOrder[a.quadrant] - priorityOrder[b.quadrant] || a.sortOrder - b.sortOrder)
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        今日焦点
      </h2>
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-600">
          暂无任务，去创建一个目标吧
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStartFocus={() => {}}
              onComplete={() => useTaskStore.getState().updateStatus(task.id, 'done')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
