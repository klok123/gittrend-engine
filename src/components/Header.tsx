'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Compass, Sparkles, Gem, BookOpen, Search, Menu, X, Zap, Archive } from 'lucide-react';

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface HeaderProps {
  onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Explore', icon: Compass },
    { href: '/rising', label: 'Rising Stars', icon: Sparkles },
    { href: '/breakouts', label: 'Breakouts', icon: Zap },
    { href: '/archive', label: 'Archive', icon: Archive },
    { href: '/hidden-gems', label: 'Hidden Gems', icon: Gem },
    { href: '/methodology', label: 'Methodology', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#090A0F]/85 border-b border-white/10">
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group transition-transform duration-150 active:scale-95"
          >
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#FF7905] text-black shadow-[0_0_20px_rgba(255,121,5,0.4)] border border-[#FF7905]">
              <TrendingUp className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-tight font-mono leading-none">
                RepoPicks
              </span>
              <span className="text-[10px] font-mono text-slate-400 leading-none mt-1">
                Handpicked daily
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'text-white bg-white/10 border border-white/15 font-bold shadow-[0_2px_12px_rgba(0,0,0,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#FF7905]' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search & GitHub Link */}
          <div className="flex items-center gap-3">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-[#181A2B] hover:bg-[#20233A] text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              >
                <Search className="h-3.5 w-3.5 text-[#FF7905]" />
                <span>Search</span>
                <kbd className="text-[10px] text-slate-500 bg-black/40 px-1 py-0.5 rounded border border-white/5">
                  /
                </kbd>
              </button>
            )}

            <a
              href="https://www.instagram.com/repopicks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF7905]/10 hover:bg-[#FF7905]/20 text-orange-200 hover:text-white border border-[#FF7905]/30 rounded-lg text-xs font-mono transition-colors"
            >
              <InstagramIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Follow @repopicks</span>
            </a>

            <a
              href="https://github.com/klok123/gittrend-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-mono transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white border border-white/10 rounded-lg"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm font-mono rounded-lg transition-colors ${
                    isActive
                      ? 'text-white bg-white/10 border border-white/15 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4 text-[#FF7905]" />
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
