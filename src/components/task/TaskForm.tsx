import { useState, type FormEvent } from 'react';
import { useTaskStore } from '@/stores/taskStore';

interface TaskFormProps {
  goalId: string;
  onClose: () => void;
}

export default function TaskForm({ goalId, onClose }: TaskFormProps) {
  const create = useTaskStore((s) => s.create);

  const [form, setForm] = useState({
    title: '',
    description: '',
    urgency: 1,
    importance: 1,
    estimatedPomodoros: 1,
  });

  const update = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await create({
      goalId,
      title: form.title,
      description: form.description,
      urgency: form.urgency as 0 | 1 | 2 | 3,
      importance: form.importance as 0 | 1 | 2 | 3,
      estimatedPomodoros: form.estimatedPomodoros,
      status: 'todo',
      sortOrder: 0,
      isCorrective: false,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">任务名称</label>
        <input
          autoFocus
          required
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="如：阅读 DDIA 第5章"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">描述（可选）</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-slate-400">紧急性 ({form.urgency})</label>
          <input
            type="range"
            min={0}
            max={3}
            value={form.urgency}
            onChange={(e) => update('urgency', Number(e.target.value))}
            className="w-full accent-red-500"
          />
          <div className="flex justify-between text-[10px] text-slate-600">
            <span>不紧急</span><span>极度紧急</span>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">重要性 ({form.importance})</label>
          <input
            type="range"
            min={0}
            max={3}
            value={form.importance}
            onChange={(e) => update('importance', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-600">
            <span>不重要</span><span>极度重要</span>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          预估番茄钟数
        </label>
        <input
          type="number"
          min={1}
          max={20}
          value={form.estimatedPomodoros}
          onChange={(e) => update('estimatedPomodoros', Number(e.target.value))}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        添加任务
      </button>
    </form>
  );
}
