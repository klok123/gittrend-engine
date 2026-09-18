'use client';

import React from 'react';

interface TimeFilterProps {
  selected: 'today' | 'week' | 'month';
  onChange: (value: 'today' | 'week' | 'month') => void;
}

export function TimeFilter({ selected, onChange }: TimeFilterProps) {
  const options: Array<{ id: 'today' | 'week' | 'month'; label: string }> = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 border border-black/10 rounded-md">
      {options.map((opt) => {
        const isActive = selected === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-md transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-[#FF7905] text-black border-[1.5px] border-black shadow-[1.5px_1.5px_0_0_#000] font-bold'
                : 'bg-transparent text-slate-600 hover:text-black hover:bg-white/60'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
