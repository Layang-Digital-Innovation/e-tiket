'use client';

import { ReactNode } from 'react';
import AdminSidebar from '../sidebar/AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../ui/sidebar';
import NavigationProgress from '../ui/navigation-progress';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Admin Dashboard</span>
            </div>
          </header>
          <NavigationProgress />
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
