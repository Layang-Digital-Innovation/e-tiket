'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import naikKelas from "@/assets/naik_kelas_putih3.png"
import { Button } from './ui/button';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-primary fixed w-full z-50 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center py-3 sm:py-0">
          <div className="flex items-center justify-between sm:justify-start">
            <Link href="/">
              <Image
                src={naikKelas}
                alt="naik kelas"
                className="object-contain aspect-square"
                width={50}
                height={50}
              />
            </Link>
            {/* Hamburger button - mobile only  */}
            <button
              type="button"
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <nav
            className={`items-center text-sm sm:space-x-6 sm:flex ${
              isOpen ? 'flex flex-col space-y-2 sm:space-y-0 sm:flex-row mt-2 sm:mt-0' : 'hidden'
            }`}
          >
            <Link
              href="/events"
              className="px-3 w-full py-2 rounded-md md:w-auto text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Jelajahi Event
            </Link>

         <Button asChild className="bg-white text-primary hover:bg-white/10 w-full md:w-auto">
<Link
                href="/login"
              >
                Masuk
              </Link>
         </Button>
              
          </nav>
        </div>
      </div>
    </header>
  );
}