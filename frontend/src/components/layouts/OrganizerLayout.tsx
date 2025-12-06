'use client';

import { ReactNode, Suspense } from 'react';
import OrganizerSidebar from '../sidebar/OrganizerSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../ui/sidebar';
import NavigationProgress from '../ui/navigation-progress';

interface OrganizerLayoutProps {
  children: ReactNode;
}

export default function OrganizerLayout({ children }: OrganizerLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <OrganizerSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Event Organizer Dashboard</span>
            </div>
          </header>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
