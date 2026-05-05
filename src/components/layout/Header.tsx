const now = new Date();
const dayLabel = now.toLocaleDateString('zh-CN', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur">
      <h1 className="text-lg font-semibold tracking-tight">LearnFlow</h1>
      <span className="text-sm text-slate-400">{dayLabel}</span>
    </header>
  );
}
