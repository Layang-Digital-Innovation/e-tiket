import { ReactNode } from 'react';
import Header from '@/components/header';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex pt-16">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
