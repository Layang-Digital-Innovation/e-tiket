'use client';

import Link from 'next/link';

export default function Header() {

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
              <Link
                href="/events"
                className="px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                Jelajahi Event
              </Link>

    
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
          </nav>
        </div>
      </div>
    </header>
  );
}