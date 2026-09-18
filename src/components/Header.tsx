'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Compass, Sparkles, Gem, BookOpen, Search, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Explore', icon: Compass },
    { href: '/rising', label: 'Rising', icon: Sparkles },
    { href: '/hidden-gems', label: 'Hidden Gems', icon: Gem },
    { href: '/methodology', label: 'Methodology', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-black">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 bg-[#FF7905] border-2 border-black rounded-md px-2.5 py-1 shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:-translate-y-px transition-all duration-150"
          >
            <TrendingUp className="h-5 w-5 text-black stroke-[2.5]" />
            <span className="font-extrabold text-lg text-black tracking-tight font-mono">
              GitTrend
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all duration-150 font-semibold ${
                    isActive
                      ? 'text-black bg-orange-100 border-[1.5px] border-black font-bold shadow-[1px_1px_0_0_#000]'
                      : 'text-slate-600 hover:text-black hover:bg-orange-50 border-[1.5px] border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search & Mobile Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white border-[1.5px] border-black rounded-md shadow-[1.5px_1.5px_0_0_#000] hover:bg-orange-50 transition-all cursor-pointer text-slate-600"
              aria-label="Search repositories"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline text-[10px] font-mono bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-black border-[1.5px] border-black rounded-md hover:bg-orange-50"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t-2 border-black flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md font-semibold ${
                    isActive
                      ? 'text-black bg-orange-100 border border-black font-bold'
                      : 'text-slate-700 hover:bg-orange-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
