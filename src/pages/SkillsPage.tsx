import { useEffect, useState, type FormEvent } from 'react';
import { useSkillStore } from '@/stores/skillStore';
import { useGoalStore } from '@/stores/goalStore';
import type { SkillNode } from '@/types';

// ──── Tree builder ────

interface TreeNode extends SkillNode {
  children: TreeNode[];
  depth: number;
}

function buildTree(skills: SkillNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const s of skills) {
    map.set(s.id, { ...s, children: [], depth: 0 });
  }
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  function walk(nodes: TreeNode[], d: number) {
    for (const n of nodes) {
      n.depth = d;
      walk(n.children, d + 1);
    }
  }
  walk(roots, 0);
  return roots;
}

function flattenTree(roots: TreeNode[]): TreeNode[] {
  const out: TreeNode[] = [];
  function walk(nodes: TreeNode[]) {
    for (const n of nodes) {
      out.push(n);
      walk(n.children);
    }
  }
  walk(roots);
  return out;
}

// ──── Goal linker dropdown ────

function GoalLinker({
  skillId,
  linkedIds,
  onToggle,
  onClose,
}: {
  skillId: string;
  linkedIds: string[];
  onToggle: (skillId: string, goalId: string) => void;
  onClose: () => void;
}) {
  const goals = useGoalStore((s) => s.goals);

  return (
    <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl">
      <p className="mb-1 text-[10px] font-medium uppercase text-slate-500">关联学习目标</p>
      {goals.length === 0 ? (
        <p className="py-2 text-center text-xs text-slate-600">
          暂无目标。先在首页创建学习目标，再回来关联。
        </p>
      ) : (
        <div className="max-h-40 space-y-0.5 overflow-y-auto">
          {goals.map((g) => {
            const linked = linkedIds.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => onToggle(skillId, g.id)}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                  linked
                    ? 'bg-emerald-950/50 text-emerald-300'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    linked ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />
                <span className="flex-1 truncate">{g.title}</span>
                {linked && (
                  <span className="text-[10px] text-emerald-500">已关联</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <button onClick={onClose} className="btn btn-ghost btn-xs mt-1 w-full">
        关闭
      </button>
    </div>
  );
}

// ──── Skill row ────

function SkillRow({
  node,
  onAddChild,
  onDelete,
  onRename,
  onToggleLink,
}: {
  node: TreeNode;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onToggleLink: (skillId: string, goalId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(node.name);
  const [showLinker, setShowLinker] = useState(false);
  const goals = useGoalStore((s) => s.goals);
  const linkedGoals = goals.filter((g) => node.linkedGoalIds.includes(g.id));

  const pct = Math.min(1, node.mastery);
  const barColor =
    pct >= 1 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-slate-700';

  return (
    <div
      className="group relative rounded-lg border border-slate-800 bg-slate-900/50 transition-colors hover:border-slate-700"
      style={{ marginLeft: node.depth * 20 }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Mastery dot */}
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            pct >= 1 ? 'bg-emerald-400 shadow-[0_0_6px] shadow-emerald-500/50' :
            pct > 0 ? 'bg-amber-400' : 'bg-slate-600'
          }`}
        />

        {/* Name */}
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim() && name !== node.name) onRename(node.id, name.trim());
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') { setName(node.name); setEditing(false); }
            }}
            className="flex-1 rounded border border-emerald-700 bg-slate-800 px-2 py-0.5 text-sm text-white outline-none"
          />
        ) : (
          <span
            className="flex-1 cursor-pointer truncate text-sm text-slate-200"
            onDoubleClick={() => setEditing(true)}
          >
            {node.name}
          </span>
        )}

        {/* Mastery bar */}
        <div className="hidden w-24 items-center gap-1.5 sm:flex">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <span className="w-8 text-right text-[10px] tabular-nums text-slate-400">
            {Math.round(pct * 100)}%
          </span>
        </div>

        {/* Linked goal count badge */}
        <button
          onClick={() => setShowLinker(!showLinker)}
          className={`hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] transition-colors sm:flex ${
            node.linkedGoalIds.length > 0
              ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
              : 'bg-slate-800 text-slate-600 hover:bg-slate-700 hover:text-slate-400'
          }`}
          title="关联学习目标"
        >
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {node.linkedGoalIds.length > 0 ? node.linkedGoalIds.length : '关联'}
        </button>

        {/* Actions */}
        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setShowLinker(!showLinker)}
            className="btn-icon sm:hidden"
            title="关联目标"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button
            onClick={() => onAddChild(node.id)}
            className="btn-icon"
            title="添加子技能"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="btn-icon hover:!bg-red-950 hover:!text-red-400"
            title="删除"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Linked goal badges */}
      {linkedGoals.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2">
          {linkedGoals.map((g) => (
            <span
              key={g.id}
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                g.status === 'completed'
                  ? 'bg-emerald-950 text-emerald-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {g.status === 'completed' && '✓ '}{g.title}
            </span>
          ))}
        </div>
      )}

      {/* Goal linker dropdown */}
      {showLinker && (
        <GoalLinker
          skillId={node.id}
          linkedIds={node.linkedGoalIds}
          onToggle={onToggleLink}
          onClose={() => setShowLinker(false)}
        />
      )}
    </div>
  );
}

// ──── Page ────

export default function SkillsPage() {
  const { skills, loadAll, add, remove, rename, toggleLinkGoal } = useSkillStore();
  const [newName, setNewName] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddRoot = async (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      await add(name, null);
      setNewName('');
      setShowInput(false);
    } catch { /* store 已 log */ }
  };

  const handleAddChild = async (parentId: string) => {
    const name = prompt('输入子技能名称：');
    if (!name?.trim()) return;
    try {
      await add(name.trim(), parentId);
    } catch { /* store 已 log */ }
  };

  const handleDelete = async (id: string) => {
    const node = skills.find((s) => s.id === id);
    if (!node) return;
    const children = skills.filter((s) => s.parentId === id);
    const msg =
      children.length > 0
        ? `删除「${node.name}」将同时删除其 ${children.length} 个子技能，确定吗？`
        : `确定要删除「${node.name}」吗？`;
    if (!window.confirm(msg)) return;
    try {
      await remove(id);
    } catch { /* store 已 log */ }
  };

  const tree = buildTree(skills);
  const flat = flattenTree(tree);

  const masteryStats = (() => {
    const total = skills.length;
    const mastered = skills.filter((s) => s.mastery >= 1).length;
    const inProgress = skills.filter((s) => s.mastery > 0 && s.mastery < 1).length;
    return { total, mastered, inProgress };
  })();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      {/* Stats bar */}
      {skills.length > 0 && (
        <div className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900 p-3">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{masteryStats.total}</p>
            <p className="text-[10px] text-slate-500">总技能</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">{masteryStats.mastered}</p>
            <p className="text-[10px] text-slate-500">已掌握</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-400">{masteryStats.inProgress}</p>
            <p className="text-[10px] text-slate-500">进行中</p>
          </div>
        </div>
      )}

      {/* Skill tree */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            技能树
          </h2>
          <button
            onClick={() => setShowInput(!showInput)}
            className="btn btn-primary btn-sm"
          >
            ＋ 添加根技能
          </button>
        </div>

        {showInput && (
          <form onSubmit={handleAddRoot} className="mb-3 flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="如：编程语言、系统设计、机器学习..."
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="btn btn-primary btn-sm"
            >
              添加
            </button>
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className="btn btn-ghost btn-sm"
            >
              取消
            </button>
          </form>
        )}

        {skills.length === 0 && !showInput ? (
          <div className="rounded-xl border border-dashed border-slate-800 py-10 text-center">
            <p className="text-sm text-slate-500">还没有添加任何技能</p>
            <p className="mt-1 text-xs text-slate-600">
              添加根技能（如"前端开发"），再为其添加子技能（如"React"、"CSS"），
              然后关联学习目标，完成度将自动计算。
            </p>
            <button
              onClick={() => setShowInput(true)}
              className="btn btn-primary btn-sm mt-3"
            >
              添加第一个技能
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {flat.map((node) => (
              <SkillRow
                key={node.id}
                node={node}
                onAddChild={handleAddChild}
                onDelete={handleDelete}
                onRename={rename}
                onToggleLink={toggleLinkGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      {skills.length > 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-400">验证方法：</span>
            点击技能旁的「🔗 关联」→ 选择一个学习目标 → 去「首页」完成该目标 →
            回到此页面，技能掌握度会自动更新。关联了 N 个目标的技能，完成度 = 已完成目标数 / N × 100%。
          </p>
        </div>
      )}
    </div>
  );
}
