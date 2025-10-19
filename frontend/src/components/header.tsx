'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const isEO = pathname.startsWith('/eo');
  const isPublic = pathname.startsWith('/event');
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-primary fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold font-heebo text-white">
              eventkadin
            </Link>
          </div>

          <nav className="flex items-center space-x-6">
            {isAdmin && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/admin/dashboard'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/organizers"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/admin/organizers'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Event Organizers
                </Link>
                <Link
                  href="/admin/events"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/admin/events'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Events
                </Link>
              </>
            )}

            {isEO && (
              <>
                <Link
                  href="/eo/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/eo/dashboard'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/eo/events"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/eo/events'
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  My Events
                </Link>
              </>
            )}

            {!isAdmin && !isEO && !isPublic && !isAuthPage && (
              <Link
                href="/events"
                className="px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                Jelajahi Event
              </Link>
            )}

            {/* Authentication Section */}
            {
              !isAuthPage && (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}