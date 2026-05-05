import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onStartFocus: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

const quadrantColors: Record<Task['quadrant'], string> = {
  Q1: 'border-l-red-500 bg-red-950/20',
  Q2: 'border-l-blue-500 bg-blue-950/20',
  Q3: 'border-l-amber-500 bg-amber-950/20',
  Q4: 'border-l-slate-500 bg-slate-800/30',
};

export default function TaskCard({ task, onStartFocus, onComplete }: TaskCardProps) {
  return (
    <div
      className={`rounded-lg border-l-4 p-3 ${quadrantColors[task.quadrant]} transition-shadow hover:shadow-lg`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {task.isCorrective && '🔧 '}{task.title}
          </p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-slate-500">
          {task.estimatedPomodoros} 番茄
        </span>
        <div className="ml-auto flex gap-1.5">
          <button
            onClick={() => onStartFocus(task.id)}
            className="btn btn-secondary btn-xs"
          >
            开始专注
          </button>
          <button
            onClick={() => onComplete(task.id)}
            className="btn btn-primary btn-xs"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
