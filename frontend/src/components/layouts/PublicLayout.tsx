import { ReactNode, Suspense } from 'react';
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
      <Suspense fallback={null}>
        <NavigationProgress className='bg-gray-200! dark:bg-gray-700'/>
      </Suspense>
      <main className="pt-0">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
