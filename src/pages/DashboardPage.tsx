import { useEffect, useState } from 'react';
import { useGoalStore } from '@/stores/goalStore';
import { useTaskStore } from '@/stores/taskStore';
import GoalWizard from '@/components/goal/GoalWizard';
import TodayFocus from '@/components/dashboard/TodayFocus';
import type { Goal } from '@/types';

// ──── Confirm dialog ────

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="btn btn-secondary btn-xs">取消</button>
          <button onClick={onConfirm} className="btn btn-danger btn-xs">确认删除</button>
        </div>
      </div>
    </div>
  );
}

// ──── Progress ring ────

function MiniProgress({ current, target }: { current: number; target: number }) {
  const pct = target > 0 ? Math.min(1, current / target) : 0;
  const r = 14;
  const circ = 2 * Math.PI * r;
  return (
    <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor"
        className="text-slate-800" strokeWidth="3" />
      <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor"
        className="text-emerald-400" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
      <text x="18" y="20" textAnchor="middle" fill="currentColor"
        className="fill-slate-300 text-[9px] font-bold" dominantBaseline="middle"
        transform="rotate(90 18 18)">
        {Math.round(pct * 100)}
      </text>
    </svg>
  );
}

// ──── Goal card ────

function GoalCard({
  goal,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  onIncrement,
  onComplete,
}: {
  goal: Goal;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onIncrement: (delta: number) => void;
  onComplete: () => void;
}) {
  const daysLeft = Math.ceil(
    (new Date(goal.timeBound).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  const overdue = daysLeft < 0;
  const urgent = daysLeft >= 0 && daysLeft <= 3;
  const isCompleted = goal.status === 'completed';
  const pct = goal.measurable.target > 0
    ? Math.min(1, goal.measurable.current / goal.measurable.target)
    : 0;

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-xl border p-4 transition-all ${
        isActive
          ? 'border-emerald-500/60 bg-emerald-950/20 ring-1 ring-emerald-500/30'
          : isCompleted
            ? 'border-emerald-800/40 bg-slate-900/50 opacity-70'
            : 'border-slate-800 bg-slate-900 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <MiniProgress current={goal.measurable.current} target={goal.measurable.target} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-white">{goal.title}</h3>
            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="btn-icon"
                title="编辑"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              {!isCompleted && (
                <button
                  onClick={(e) => { e.stopPropagation(); onComplete(); }}
                  className="btn-icon hover:!bg-emerald-950 hover:!text-emerald-400"
                  title="标记完成"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="btn-icon hover:!bg-red-950 hover:!text-red-400"
                title="删除"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-slate-400">{goal.specific}</p>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : pct > 0 ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
              style={{ width: `${(isCompleted ? 1 : pct) * 100}%` }}
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            {/* Progress counter with +/- */}
            <div className="flex items-center gap-1">
              {!isCompleted && (
                <button
                  onClick={(e) => { e.stopPropagation(); onIncrement(-1); }}
                  disabled={goal.measurable.current <= 0}
                  className="flex h-5 w-5 items-center justify-center rounded text-xs text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-20"
                >
                  −
                </button>
              )}
              <span className="text-xs tabular-nums text-slate-400">
                {goal.measurable.current}/{goal.measurable.target} {goal.measurable.unit}
              </span>
              {!isCompleted && (
                <button
                  onClick={(e) => { e.stopPropagation(); onIncrement(1); }}
                  className="flex h-5 w-5 items-center justify-center rounded text-xs text-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  ＋
                </button>
              )}
            </div>

            {/* Deadline + status */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${
                  isCompleted ? 'text-emerald-400' :
                  overdue ? 'text-red-400' : urgent ? 'text-amber-400' : 'text-slate-500'
                }`}
              >
                {isCompleted
                  ? '已完成'
                  : overdue
                    ? `超期 ${Math.abs(daysLeft)} 天`
                    : daysLeft === 0
                      ? '今天截止'
                      : `剩 ${daysLeft} 天`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──── Dashboard page ────

export default function DashboardPage() {
  const {
    goals,
    activeGoalId,
    loadAll,
    setActive,
    remove: removeGoal,
    toggleStatus,
    updateMeasurable,
  } = useGoalStore();
  const { loadForGoal } = useTaskStore();

  const [showWizard, setShowWizard] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (activeGoalId) loadForGoal(activeGoalId);
  }, [activeGoalId, loadForGoal]);

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowWizard(true);
  };

  const handleDelete = async () => {
    if (!deletingGoal) return;
    try {
      setDeleteError(null);
      await removeGoal(deletingGoal.id);
      setDeletingGoal(null);
    } catch {
      setDeleteError('删除失败，请重试');
    }
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    setEditingGoal(null);
  };

  const handleIncrement = async (goalId: string, delta: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || goal.status !== 'active') return;
    const newVal = goal.measurable.current + delta;
    if (newVal < 0) return;
    await updateMeasurable(goalId, delta);
    // Auto-complete when target reached
    if (newVal >= goal.measurable.target) {
      await toggleStatus(goalId);
    }
  };

  const handleComplete = async (goalId: string) => {
    await toggleStatus(goalId);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      {/* Section: Today Focus */}
      {activeGoalId && (
        <TodayFocus goalId={activeGoalId} />
      )}

      {/* Section: Active goals */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            活跃目标 · {activeGoals.length}
          </h2>
          <button
            onClick={() => { setEditingGoal(null); setShowWizard(true); }}
            className="btn btn-primary btn-sm"
          >
            ＋ 新建目标
          </button>
        </div>

        {activeGoals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 py-10 text-center">
            <p className="text-sm text-slate-500">还没有学习目标</p>
            <button
              onClick={() => { setEditingGoal(null); setShowWizard(true); }}
              className="btn btn-primary btn-sm mt-2"
            >
              创建第一个 SMART 目标
            </button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isActive={goal.id === activeGoalId}
                onSelect={() => setActive(goal.id)}
                onEdit={() => handleEdit(goal)}
                onDelete={() => setDeletingGoal(goal)}
                onIncrement={(delta) => handleIncrement(goal.id, delta)}
                onComplete={() => handleComplete(goal.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section: Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            已完成 · {completedGoals.length}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 opacity-60">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isActive={false}
                onSelect={() => toggleStatus(goal.id)}
                onEdit={() => handleEdit(goal)}
                onDelete={() => setDeletingGoal(goal)}
                onIncrement={() => {}}
                onComplete={() => toggleStatus(goal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Goal Wizard Modal (create / edit) */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingGoal ? '编辑目标' : 'SMART 目标拆解'}
              </h2>
              <button
                onClick={handleWizardClose}
                className="btn btn-ghost btn-sm"
              >
                取消
              </button>
            </div>
            <GoalWizard onClose={handleWizardClose} editGoal={editingGoal} />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingGoal}
        title="删除目标"
        message={
          deleteError
            ? deleteError
            : `确定要删除「${deletingGoal?.title}」及其所有关联任务吗？此操作不可恢复。`
        }
        onConfirm={handleDelete}
        onCancel={() => { setDeletingGoal(null); setDeleteError(null); }}
      />
    </div>
  );
}
