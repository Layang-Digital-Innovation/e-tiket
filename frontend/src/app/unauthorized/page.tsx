'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  const getRedirectPath = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'event_organizer':
        return '/organizer/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="mx-auto h-24 w-24 text-red-500">
          <ShieldX className="h-24 w-24" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            403
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Akses Ditolak
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          {user && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Role Anda: <span className="font-medium">{user.role}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href={getRedirectPath()}
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-500">
          Jika Anda yakin ini adalah kesalahan, silakan hubungi administrator.
        </div>
      </div>
    </div>
  );
}