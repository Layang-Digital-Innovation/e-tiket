'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileDropdown, LoginStatusIndicator } from './auth/LoginStatus';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const isEO = pathname.startsWith('/eo');
  const isPublic = pathname.startsWith('/event');
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-gradient-to-b font-heebo from-black/40 to-black/0 fixed w-full z-50">
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
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:block">{user.firstName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Pengaturan
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : !isAuthPage && (
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