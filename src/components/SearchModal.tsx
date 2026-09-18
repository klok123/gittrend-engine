'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Star, GitFork, ArrowUpRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white border-2 border-black rounded-lg shadow-[6px_6px_0_0_#000] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b-2 border-black gap-3 bg-slate-50">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search trending repositories, languages, or topics..."
            autoFocus
            className="flex-1 bg-transparent text-black placeholder-slate-400 font-mono text-sm sm:text-base outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-black rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono font-bold bg-slate-200 border border-black/20 rounded px-2 py-1 text-slate-700 hover:bg-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-sm">
              No repositories found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((repo, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-md transition-all cursor-pointer ${
                    isSelected ? 'bg-orange-50 border border-black/30' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono truncate">
                        {repo.owner} / <span className="text-black font-extrabold">{repo.name}</span>
                      </span>
                      <span
                        className="text-[11px] text-slate-500 font-medium px-1.5 py-0.2 rounded border border-slate-200"
                        style={{ borderColor: repo.languageColor }}
                      >
                        {repo.language}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-sans">
                      {repo.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-600">
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                      {repo.totalStars.toLocaleString()}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                </a>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 text-slate-500 text-[11px] font-mono flex items-center justify-between">
          <span>{filtered.length} repositories matching</span>
          <span>Tip: Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
