'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { OrganicTrustResult } from '../engine/repo-intelligence';

interface TrustScoreGaugeProps {
  trust: OrganicTrustResult;
}

export function TrustScoreGauge({ trust }: TrustScoreGaugeProps) {
  const { score, grade, forkRatioPercent, anomalyStatus, signals, summary } = trust;

  // Grade color scheme
  const gradeColors = {
    'A+': { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-700' },
    'A': { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-800' },
    'B': { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-800' },
    'C': { bg: 'bg-amber-500', text: 'text-black', border: 'border-amber-700' },
    'F': { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-800' },
  }[grade];

  return (
    <div className="bg-white border-2 border-black rounded-lg p-5 shadow-[3px_3px_0_0_#000] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-black" />
            <h3 className="font-mono font-bold text-base text-black">Organic Trust & Fraud Audit</h3>
          </div>
          <div
            className={`font-mono text-xs font-extrabold px-2.5 py-1 rounded border-2 ${gradeColors.bg} ${gradeColors.text} ${gradeColors.border} shadow-[1px_1px_0_0_#000]`}
          >
            GRADE {grade}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-1">
          Independent algorithmic audit of star authenticity, fork dispersion, and community traction
        </p>

        {/* Score & Progress Section */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
              Organic Confidence Index
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-extrabold text-black">{score}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mt-2 border border-slate-300">
            <div
              className={`h-full transition-all duration-500 ${
                score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>

          {/* Fork Ratio Metric */}
          <div className="flex justify-between items-center text-xs font-mono mt-3 text-slate-600 border-t border-slate-200 pt-2">
            <span>Community Fork Ratio:</span>
            <span className="font-bold text-slate-900">{forkRatioPercent}%</span>
          </div>
        </div>

        {/* Summary Statement */}
        <p className="text-xs text-slate-700 mt-3 italic font-medium bg-slate-100/70 p-2.5 rounded border border-slate-200">
          "{summary}"
        </p>
      </div>

      {/* Audit Signals Breakdown */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
          Verified Evidence Signals
        </div>
        <div className="space-y-1.5">
          {signals.map((sig, idx) => {
            const isNegative = sig.includes('Low Fork') || sig.includes('Flagged') || sig.includes('Extreme Influx');
            const isReview = sig.includes('Review');

            return (
              <div key={idx} className="flex items-start gap-2 text-xs">
                {isNegative ? (
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                ) : isReview ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <span className={isNegative ? 'text-rose-900 font-medium' : isReview ? 'text-amber-900' : 'text-slate-700'}>
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
