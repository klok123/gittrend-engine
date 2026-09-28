'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Eye } from 'lucide-react';

interface Stats {
  totalViews: number;
  liveVisitors: number;
}

export function VisitorStats() {
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Record this page view (fire-and-forget).
    try {
      fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pathname || '/' }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Analytics must never break the page.
    }

    const load = async () => {
      try {
        const res = await fetch('/api/views', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && !data.disabled) {
          setStats({
            totalViews: data.totalViews ?? 0,
            liveVisitors: data.liveVisitors ?? 0,
          });
        }
      } catch {
        // Silently ignore — badge just stays hidden.
      }
    };

    load();
    const timer = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pathname]);

  if (!stats) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title="Anonymous visitor counts — IPs are hashed, never stored."
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="text-emerald-400">{stats.liveVisitors} online</span>
      <span className="text-slate-600">·</span>
      <Eye className="h-3.5 w-3.5 text-[#FF7905]" />
      <span>{stats.totalViews.toLocaleString('en-US')} total views</span>
    </span>
  );
}
