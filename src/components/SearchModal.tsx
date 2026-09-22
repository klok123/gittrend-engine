'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, Star, ArrowUpRight, Zap } from 'lucide-react';
import { NormalizedTrendingRepo } from '../../scripts/run-trend-etl';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: NormalizedTrendingRepo[];
}

export function SearchModal({ isOpen, onClose, repositories }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener (⌘K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered repositories based on query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return repositories.slice(0, 10);

    return repositories
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.owner.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          r.language.toLowerCase().includes(q) ||
          r.topics.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 15);
  }, [query, repositories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-2xl bg-[#11131F] border border-white/15 rounded-xl shadow-[0_16px_50px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3 bg-[#181A2B]">
          <Search className="h-5 w-5 text-[#FF7905] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search trending repositories, languages, or topics..."
            autoFocus
            className="flex-1 bg-transparent text-white placeholder-slate-500 font-mono text-sm sm:text-base outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-white rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-mono font-bold bg-white/10 border border-white/10 rounded px-2 py-1 text-slate-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/5 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-sm">
              No repositories found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((repo, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <Link
                  key={repo.id}
                  href={`/repo/${repo.owner}/${repo.name}`}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                    isSelected ? 'bg-white/10 border border-white/15' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono truncate">
                        {repo.owner} / <span className="text-[#FF7905]">{repo.name}</span>
                      </span>
                      <span
                        className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded border border-white/10 bg-black/40"
                      >
                        {repo.language}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-sans">
                      {repo.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Star className="h-3.5 w-3.5 text-[#FF7905] fill-[#FF7905]" />
                      {repo.totalStars.toLocaleString()}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-500" />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0D0E17] border-t border-white/10 text-slate-500 text-[11px] font-mono flex items-center justify-between">
          <span>{filtered.length} repositories matching</span>
          <span>Tip: Click to open intelligence dossier</span>
        </div>
      </div>
    </div>
  );
}
