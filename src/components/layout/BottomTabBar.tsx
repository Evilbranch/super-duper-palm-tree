interface BottomTabBarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const tabs = [
  { id: 'dashboard', label: '首页', icon: '🎯' },
  { id: 'board',     label: '看板', icon: '📋' },
  { id: 'reflect',   label: '复盘', icon: '🔄' },
  { id: 'settings',  label: '设置', icon: '⚙️' },
];

export default function BottomTabBar({ activePage, onNavigate }: BottomTabBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-12 items-center justify-around border-t border-slate-800 bg-slate-950/90 backdrop-blur md:hidden"
      style={{ paddingBottom: 'var(--safe-area-bottom)' }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onNavigate(tab.id)}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
            activePage === tab.id ? 'text-white' : 'text-slate-500'
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
