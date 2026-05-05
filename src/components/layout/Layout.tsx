import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, activePage, onNavigate }: LayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto pb-12 md:pb-0">
          <Header />
          {children}
        </main>
      </div>
      <BottomTabBar activePage={activePage} onNavigate={onNavigate} />
    </div>
  );
}
