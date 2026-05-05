import { useEffect, useState, type FormEvent } from 'react';
import { useGoalStore } from '@/stores/goalStore';
import { useReflectionStore } from '@/stores/reflectionStore';

export default function ReflectionPage() {
  const { goals, loadAll } = useGoalStore();
  const { reflections, loadForGoal, create } = useReflectionStore();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [rate, setRate] = useState<1 | 2 | 3 | 4 | 5>(3);

  const [form, setForm] = useState({
    cycleStart: '',
    cycleEnd: '',
    plan: '',
    done: '',
    check: '',
    act: '',
  });

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (selectedGoalId) loadForGoal(selectedGoalId);
  }, [selectedGoalId, loadForGoal]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId) return;
    await create({ goalId: selectedGoalId, ...form, rating: rate });
    setForm({ cycleStart: '', cycleEnd: '', plan: '', done: '', check: '', act: '' });
    setRate(3);
  };

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-400">选择复盘目标</label>
        <select
          value={selectedGoalId ?? ''}
          onChange={(e) => setSelectedGoalId(e.target.value || null)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
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

      {selectedGoal && (
        <>
          {/* Plan vs Actual snapshot */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <p className="text-xs text-slate-500">目标值</p>
              <p className="text-lg font-bold">
                {selectedGoal.measurable.target} {selectedGoal.measurable.unit}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <p className="text-xs text-slate-500">当前值</p>
              <p className="text-lg font-bold">
                {selectedGoal.measurable.current} {selectedGoal.measurable.unit}
              </p>
            </div>
          </div>

          {/* PDCA Form */}
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-sm font-semibold">PDCA 复盘</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">周期开始</label>
                <input
                  required
                  type="date"
                  value={form.cycleStart}
                  onChange={(e) => setForm((f) => ({ ...f, cycleStart: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">周期结束</label>
                <input
                  required
                  type="date"
                  value={form.cycleEnd}
                  onChange={(e) => setForm((f) => ({ ...f, cycleEnd: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {(['plan', 'done', 'check', 'act'] as const).map((field) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-medium text-slate-400 uppercase">
                  {field === 'plan' ? 'P — 原计划' :
                   field === 'done' ? 'D — 实际完成' :
                   field === 'check' ? 'C — 偏差分析' :
                   'A — 改进措施'}
                </label>
                <textarea
                  required
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>
            ))}

            {/* Rating */}
            <div>
              <label className="mb-1 block text-xs text-slate-400">自评 ({rate} 星)</label>
              <div className="flex gap-1">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRate(n)}
                    className={`text-xl ${n <= rate ? 'text-amber-400' : 'text-slate-700'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              提交复盘
            </button>
          </form>

          {/* Past reflections */}
          {reflections.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                历史复盘
              </h3>
              {reflections.slice(0, 5).map((r) => (
                <div key={r.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">
                      {r.cycleStart} → {r.cycleEnd}
                    </span>
                    <span className="text-xs text-amber-400">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm"><b className="text-slate-400">C:</b> {r.check}</p>
                  <p className="text-sm"><b className="text-slate-400">A:</b> {r.act}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
