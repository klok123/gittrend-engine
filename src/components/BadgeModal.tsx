'use client';

import React, { useState } from 'react';
import { Award, Copy, Check, ExternalLink, X } from 'lucide-react';

interface BadgeModalProps {
  owner: string;
  name: string;
}

export function BadgeModal({ owner, name }: BadgeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<'markdown' | 'html' | null>(null);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://clever-volta-lac.vercel.app';
  const badgeUrl = `${siteUrl}/api/badge/${owner}/${name}`;
  const dossierUrl = `${siteUrl}/repo/${owner}/${name}`;

  const markdownCode = `[![GitTrend Momentum](${badgeUrl})](${dossierUrl})`;
  const htmlCode = `<a href="${dossierUrl}"><img src="${badgeUrl}" alt="GitTrend Momentum" /></a>`;

  const copyToClipboard = async (text: string, format: 'markdown' | 'html') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2500);
    } catch (err) {
      console.error('Failed to copy badge snippet:', err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#181A2B] hover:bg-[#202338] text-white border border-white/10 rounded-md font-mono text-xs font-semibold shadow-xs hover:border-white/20 active:translate-y-0.5 transition-all cursor-pointer"
      >
        <Award className="h-4 w-4 text-[#FF7905]" />
        <span>Get README Badge</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#11131F] border border-white/10 rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-100">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white border border-transparent hover:border-white/15 rounded-md transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-5 w-5 text-[#FF7905]" />
              <h3 className="font-mono font-bold text-lg text-white">Embed GitTrend Badge</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Display live star momentum & verified velocity directly in your repository's <code className="bg-white/[0.06] text-slate-200 px-1 py-0.5 rounded font-mono">README.md</code>.
            </p>

            {/* Badge Live Preview */}
            <div className="p-4 bg-[#090A0F] border border-white/10 rounded-lg mb-4 flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Live Badge Preview</span>
              <img
                src={badgeUrl}
                alt="GitTrend Badge Preview"
                className="h-6"
                loading="eager"
              />
            </div>

            {/* Markdown Snippet */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-semibold text-slate-300">Markdown Format</span>
                <button
                  onClick={() => copyToClipboard(markdownCode, 'markdown')}
                  className="flex items-center gap-1 text-xs font-mono font-semibold text-[#FF7905] hover:text-orange-400 transition-colors cursor-pointer"
                >
                  {copiedFormat === 'markdown' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-2.5 bg-[#090A0F] text-slate-200 font-mono text-xs rounded-md border border-white/10 overflow-x-auto select-all">
                {markdownCode}
              </pre>
            </div>

            {/* HTML Snippet */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-semibold text-slate-300">HTML Format</span>
                <button
                  onClick={() => copyToClipboard(htmlCode, 'html')}
                  className="flex items-center gap-1 text-xs font-mono font-semibold text-[#FF7905] hover:text-orange-400 transition-colors cursor-pointer"
                >
                  {copiedFormat === 'html' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-2.5 bg-[#090A0F] text-slate-200 font-mono text-xs rounded-md border border-white/10 overflow-x-auto select-all">
                {htmlCode}
              </pre>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-semibold rounded-md border border-white/15 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
