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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-black border-2 border-black rounded font-mono text-xs font-bold shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
      >
        <Award className="h-4 w-4 text-[#FF7905]" />
        <span>Get README Badge</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border-2 border-black rounded-lg p-6 shadow-[6px_6px_0_0_#000] animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-black border border-transparent hover:border-black rounded transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-5 w-5 text-[#FF7905]" />
              <h3 className="font-mono font-bold text-lg text-black">Embed GitTrend Badge</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-sans">
              Display live star momentum & verified velocity directly in your repository's <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">README.md</code>.
            </p>

            {/* Badge Live Preview */}
            <div className="p-4 bg-slate-100 border border-slate-300 rounded-md mb-4 flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Live Badge Preview</span>
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
                <span className="text-xs font-mono font-bold text-slate-700">Markdown Format</span>
                <button
                  onClick={() => copyToClipboard(markdownCode, 'markdown')}
                  className="flex items-center gap-1 text-xs font-mono font-bold text-[#FF7905] hover:text-black transition-colors cursor-pointer"
                >
                  {copiedFormat === 'markdown' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-2.5 bg-slate-900 text-slate-100 font-mono text-xs rounded border border-black overflow-x-auto select-all">
                {markdownCode}
              </pre>
            </div>

            {/* HTML Snippet */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold text-slate-700">HTML Format</span>
                <button
                  onClick={() => copyToClipboard(htmlCode, 'html')}
                  className="flex items-center gap-1 text-xs font-mono font-bold text-[#FF7905] hover:text-black transition-colors cursor-pointer"
                >
                  {copiedFormat === 'html' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-2.5 bg-slate-900 text-slate-100 font-mono text-xs rounded border border-black overflow-x-auto select-all">
                {htmlCode}
              </pre>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-black text-white font-mono text-xs font-bold rounded border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-slate-800 transition-colors cursor-pointer"
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
