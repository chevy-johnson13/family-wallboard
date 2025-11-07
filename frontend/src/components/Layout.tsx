import { ReactNode } from 'react';
import TopBar from './TopBar';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      <Navigation />
    </div>
  );
}

