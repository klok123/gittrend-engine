'use client';

import React from 'react';

interface LanguageFilterProps {
  languages: string[];
  selectedLanguage: string;
  onSelect: (lang: string) => void;
}

export function LanguageFilter({
  languages,
  selectedLanguage,
  onSelect,
}: LanguageFilterProps) {
  const allOptions = ['All', ...languages];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
      {allOptions.map((lang) => {
        const isSelected = selectedLanguage.toLowerCase() === lang.toLowerCase();
        return (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'bg-white text-black font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-[#11131F] text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
            }`}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
