import { useCallback } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import TaskCard from './TaskCard';

// ─── Quadrant config ───

const quadrantMeta = {
  Q1: { title: '紧急且重要', subtitle: '立即去做', className: 'border-red-500/40 bg-red-950/10' },
  Q2: { title: '重要不紧急', subtitle: '计划去做', className: 'border-blue-500/40 bg-blue-950/10' },
  Q3: { title: '紧急不重要', subtitle: '授权/速决', className: 'border-amber-500/40 bg-amber-950/10' },
  Q4: { title: '不紧急不重要', subtitle: '舍弃/搁置', className: 'border-slate-600/40 bg-slate-800/20' },
} as const;

// ─── Sortable card wrapper ───

function SortableTask({ task, onStartFocus, onComplete }: {
  task: Task;
  onStartFocus: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onStartFocus={onStartFocus} onComplete={onComplete} />
    </div>
  );
}

// ─── Main board ───

interface EisenhowerBoardProps {
  tasks: Task[];
  onDragEnd: (taskId: string, newUrgency: number, newImportance: number) => void;
  onStartFocus: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

export default function EisenhowerBoard({
  tasks,
  onDragEnd,
  onStartFocus,
  onComplete,
}: EisenhowerBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const grouped = useCallback(() => {
    const map: Record<string, Task[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };
    for (const t of tasks) map[t.quadrant].push(t);
    return map;
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id as string;
    const targetTask = tasks.find((t) => t.id === overId);
    if (!targetTask) return;
    onDragEnd(active.id as string, targetTask.urgency, targetTask.importance);
  };

  const g = grouped();

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
        {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
          <div
            key={q}
            className={`min-h-[160px] rounded-xl border p-3 ${quadrantMeta[q].className}`}
          >
            <div className="mb-2 flex items-baseline gap-2">
              <h3 className="text-sm font-semibold">{quadrantMeta[q].title}</h3>
              <span className="text-xs text-slate-500">{quadrantMeta[q].subtitle}</span>
            </div>
            <SortableContext items={g[q].map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {g[q].map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    onStartFocus={onStartFocus}
                    onComplete={onComplete}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
      <DragOverlay>
        {null /* Rendered as a clone of the dragged item — simplified here */}
      </DragOverlay>
    </DndContext>
  );
}
