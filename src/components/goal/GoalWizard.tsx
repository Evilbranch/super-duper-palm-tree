import { useState, useEffect, type FormEvent } from 'react';
import { useGoalStore } from '@/stores/goalStore';
import type { Goal } from '@/types';

interface GoalWizardProps {
  onClose: () => void;
  editGoal?: Goal | null; // when set → edit mode
}

const STEPS = ['特定范围', '量化指标', '投入评估', '关联愿景', '截止日期'];

function emptyForm() {
  return {
    title: '',
    specific: '',
    metric: '',
    target: 0,
    unit: '小时' as string,
    estimatedHours: 0,
    dailyMinutes: 0,
    relevant: '',
    timeBound: '',
  };
}

function formFromGoal(g: Goal) {
  return {
    title: g.title,
    specific: g.specific,
    metric: g.measurable.metric,
    target: g.measurable.target,
    unit: g.measurable.unit,
    estimatedHours: g.achievable.estimatedHours,
    dailyMinutes: g.achievable.dailyMinutes,
    relevant: g.relevant,
    timeBound: g.timeBound,
  };
}

export default function GoalWizard({ onClose, editGoal }: GoalWizardProps) {
  const isEdit = !!editGoal;
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(() =>
    editGoal ? formFromGoal(editGoal) : emptyForm(),
  );

  // Reset form when switching between create/edit
  useEffect(() => {
    setForm(editGoal ? formFromGoal(editGoal) : emptyForm());
    setStep(0);
    setError(null);
  }, [editGoal?.id]);

  const update = (field: string, value: string | number) => {
    setError(null);
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const feasibility =
      form.estimatedHours > 0
        ? (form.dailyMinutes * 60) / (form.estimatedHours * 60)
        : 0;

    const draft = {
      title: form.title,
      specific: form.specific,
      measurable: {
        metric: form.metric,
        current: editGoal?.measurable.current ?? 0,
        target: form.target,
        unit: form.unit,
      },
      achievable: {
        estimatedHours: form.estimatedHours,
        dailyMinutes: form.dailyMinutes,
        feasibility,
      },
      relevant: form.relevant,
      timeBound: form.timeBound,
      status: (editGoal?.status ?? 'active') as Goal['status'],
    };

    try {
      const store = useGoalStore.getState();
      if (isEdit) {
        await store.update(editGoal!.id, draft);
      } else {
        await store.create(draft);
      }
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : '存储写入失败，请检查浏览器是否允许本站使用本地存储',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return form.title.trim() !== '' && form.specific.trim() !== '';
      case 1: return form.metric.trim() !== '' && form.target > 0;
      case 2: return form.estimatedHours > 0 && form.dailyMinutes > 0;
      case 3: return form.relevant.trim() !== '';
      case 4: return form.timeBound !== '';
      default: return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex flex-wrap items-center gap-1">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i <= step ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-xs ${i <= step ? 'text-slate-200' : 'text-slate-600'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-4 ${i < step ? 'bg-emerald-600' : 'bg-slate-800'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Step 0: Title + Specific */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">学习目标</label>
            <input
              autoFocus
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="如：掌握系统设计面试"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              具体要学习什么范围？（Specific）
            </label>
            <textarea
              required
              value={form.specific}
              onChange={(e) => update('specific', e.target.value)}
              placeholder="如：分布式系统、数据库分片、消息队列的设计模式"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Step 1: Measurable */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              度量方式（Measurable）
            </label>
            <input
              required
              value={form.metric}
              onChange={(e) => update('metric', e.target.value)}
              placeholder="如：完成模拟面试次数"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-slate-300">目标值</label>
              <input
                required
                type="number"
                min={1}
                value={form.target || ''}
                onChange={(e) => update('target', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-sm text-slate-300">单位</label>
              <select
                value={form.unit}
                onChange={(e) => update('unit', e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value="小时">小时</option>
                <option value="次">次</option>
                <option value="题">题</option>
                <option value="页">页</option>
                <option value="个">个</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Achievable */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              预估总耗时（小时）
            </label>
            <input
              required
              type="number"
              min={1}
              value={form.estimatedHours || ''}
              onChange={(e) => update('estimatedHours', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              每日可投入（分钟）
            </label>
            <input
              required
              type="number"
              min={1}
              value={form.dailyMinutes || ''}
              onChange={(e) => update('dailyMinutes', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Step 3: Relevant */}
      {step === 3 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            这个目标与你的长期愿景有什么关联？（Relevant）
          </label>
          <textarea
            required
            value={form.relevant}
            onChange={(e) => update('relevant', e.target.value)}
            placeholder="如：为下半年晋升 Senior Engineer 做准备"
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* Step 4: Time-bound */}
      {step === 4 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            截止日期（Time-bound）
          </label>
          <input
            required
            type="date"
            value={form.timeBound}
            onChange={(e) => update('timeBound', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="btn btn-secondary"
        >
          上一步
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="btn btn-primary"
          >
            下一步
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting || !canAdvance()}
            className="btn btn-primary"
          >
            {submitting ? '保存中...' : isEdit ? '保存修改' : '创建目标'}
          </button>
        )}
      </div>
    </form>
  );
}
