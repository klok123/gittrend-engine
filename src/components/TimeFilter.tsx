'use client';

import React from 'react';

interface TimeFilterProps {
  selected: 'today' | 'week' | 'month';
  onChange: (value: 'today' | 'week' | 'month') => void;
}

export function TimeFilter({ selected, onChange }: TimeFilterProps) {
  const options: Array<{ id: 'today' | 'week' | 'month'; label: string; sub: string }> = [
    { id: 'today', label: 'Rising now', sub: '+24h' },
    { id: 'week', label: 'This Week', sub: '+7d' },
    { id: 'month', label: 'This Month', sub: '+30d' },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-[#11131F] border border-white/10 rounded-xl">
      {options.map((opt) => {
        const isActive = selected === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono rounded-lg transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-[#FF7905] text-black font-extrabold shadow-[0_0_12px_rgba(255,121,5,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{opt.label}</span>
            <span className={`text-[10px] ${isActive ? 'text-black/70' : 'text-slate-500'}`}>
              {opt.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
