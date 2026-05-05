import { useState, useEffect, lazy, Suspense, Component, type ReactNode } from 'react';
import { useGoalStore } from '@/stores/goalStore';
import Layout from '@/components/layout/Layout';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const BoardPage = lazy(() => import('@/pages/BoardPage'));
const ReflectionPage = lazy(() => import('@/pages/ReflectionPage'));
const SkillsPage = lazy(() => import('@/pages/SkillsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// ──── Error boundary ────

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="m-4 rounded-xl border border-red-500/40 bg-red-950/20 p-6 text-center">
          <p className="text-sm font-semibold text-red-400">页面渲染出错</p>
          <p className="mt-1 text-xs text-red-300/70">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-600"
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ──── Lazy page loader ────

const Spinner = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
  </div>
);

function PageContent({ page }: { page: string }) {
  return (
    <ErrorBoundary key={page}>
      <Suspense fallback={<Spinner />}>
        {page === 'board'     && <BoardPage />}
        {page === 'reflect'   && <ReflectionPage />}
        {page === 'skills'    && <SkillsPage />}
        {page === 'settings'  && <SettingsPage />}
        {page === 'dashboard' && <DashboardPage />}
      </Suspense>
    </ErrorBoundary>
  );
}

// ──── App ────

export default function App() {
  const [page, setPage] = useState('dashboard');
  const loadAll = useGoalStore((s) => s.loadAll);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <Layout activePage={page} onNavigate={setPage}>
      <PageContent page={page} />
    </Layout>
  );
}
