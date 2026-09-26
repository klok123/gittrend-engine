'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { OrganicTrustResult } from '../engine/repo-intelligence';

interface TrustScoreGaugeProps {
  trust: OrganicTrustResult;
}

export function TrustScoreGauge({ trust }: TrustScoreGaugeProps) {
  const { score, grade, forkRatioPercent, anomalyStatus, signals, summary } = trust;

  // Grade color scheme
  const gradeColors = {
    'A+': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    'A': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    'B': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40' },
    'C': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
    'F': { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40' },
  }[grade];

  return (
    <div className="bg-[#131313] border border-white/10 rounded-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="font-mono font-bold text-base text-white">Organic Trust &amp; Fraud Audit</h3>
          </div>
          <div
            className={`font-mono text-xs font-extrabold px-3 py-1 rounded-full border ${gradeColors.bg} ${gradeColors.text} ${gradeColors.border}`}
          >
            GRADE {grade}
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-1">
          Independent algorithmic audit of star authenticity, fork dispersion, and community traction
        </p>

        {/* Score & Progress Section */}
        <div className="mt-4 p-4 bg-[#1B1B1B] border border-white/10 rounded-xl">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Organic Confidence Index
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-extrabold text-white">{score}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden mt-2.5 border border-white/10">
            <div
              className={`h-full transition-all duration-500 ${
                score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>

          {/* Fork Ratio Metric */}
          <div className="flex justify-between items-center text-xs font-mono mt-3 text-slate-400 border-t border-white/5 pt-2">
            <span>Community Fork Ratio:</span>
            <span className="font-bold text-white">{forkRatioPercent}%</span>
          </div>
        </div>

        {/* Summary Statement */}
        <p className="text-xs text-slate-300 mt-3 italic font-medium bg-white/[0.02] p-3 rounded-lg border border-white/5 leading-relaxed">
          &ldquo;{summary}&rdquo;
        </p>
      </div>

      {/* Audit Signals Breakdown */}
      <div className="mt-5 pt-3.5 border-t border-white/10">
        <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          Verified Evidence Signals
        </div>
        <div className="space-y-2">
          {signals.map((sig, idx) => {
            const isNegative = sig.includes('Low Fork') || sig.includes('Flagged') || sig.includes('Extreme Influx');
            const isReview = sig.includes('Review');

            return (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                {isNegative ? (
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                ) : isReview ? (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span className={isNegative ? 'text-rose-300 font-medium' : isReview ? 'text-amber-300' : 'text-slate-300'}>
                  {sig}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
