interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: '今日焦点', icon: '🎯' },
  { id: 'board',     label: '任务看板', icon: '📋' },
  { id: 'reflect',   label: '周期复盘', icon: '🔄' },
  { id: 'skills',    label: '技能图谱', icon: '🧠' },
  { id: 'settings',  label: '设置',     icon: '⚙️' },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden w-[240px] flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950 md:flex">
      <div className="flex h-12 items-center border-b border-slate-800 px-4">
        <h1 className="text-lg font-semibold tracking-tight">LearnFlow</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              activePage === item.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
