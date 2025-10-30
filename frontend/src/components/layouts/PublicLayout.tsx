import { ReactNode } from 'react';
import Header from '@/components/header';
import { Toaster } from 'sonner';
import NavigationProgress from '../ui/navigation-progress';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <NavigationProgress className='bg-violet-300'/>
      <main className="pt-16">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
