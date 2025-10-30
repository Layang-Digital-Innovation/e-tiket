"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  Loader2,
  QrCode,
  Ticket,
  DollarSign,
} from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '../ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store/auth.store';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function OrganizerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'EO';
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || 'EO';
  };

  const isPathActive = (href: string) => {
    // Exact match for dashboard/management items
    // if (href.startsWith('/admin/') || href.startsWith('/organizer/')) {
    //   return pathname === href;
    // }
    // Partial match for operational items (checkin, redeem can have dynamic paths)
    return pathname.startsWith(href);
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/organizer/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Events',
      href: '/organizer/events',
      icon: Calendar,
    },
    {
      name: 'Payout',
      href: '/organizer/payout',
      icon: DollarSign,
    }
  ];

  const operationalItems = [
    {
      name: 'Check-in',
      href: '/checkin',
      icon: QrCode,
    },
    {
      name: 'Redeem',
      href: '/redeem',
      icon: Ticket,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">Organizer Panel</span>
            <span className="text-xs text-muted-foreground">Event Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2 py-2">
          {/* Management Section */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isPathActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Operational Section */}
          <div className="mt-6 pt-6 border-t border-sidebar-border">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operasional</p>
            <div className="space-y-1 mt-2">
              {operationalItems.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-lg border border-sidebar-border p-2">
          {isLoggingOut ? (
            // Loading state
            <>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="text-sm font-medium text-muted-foreground">
                  Logging out...
                </span>
                <span className="text-xs text-muted-foreground">
                  Please wait
                </span>
              </div>
            </>
          ) : (
            // Normal state
            <>
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage 
                  src={user?.profileImage} 
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : 'Event Organizer'}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email || 'organizer@example.com'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout} 
                disabled={isLoggingOut}
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
