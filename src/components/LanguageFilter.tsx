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
        const isSelected = selectedLanguage === lang;
        return (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'bg-black text-white border border-black shadow-[1px_1px_0_0_#FF7905]'
                : 'bg-white text-slate-700 border border-slate-300 hover:border-black hover:bg-orange-50'
            }`}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
