import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { query, isDatabaseConfigured } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// A visitor counts as "live" if they've loaded a page in the last N minutes.
const LIVE_WINDOW_MINUTES = 5;
// Ignore repeat views from the same visitor+page within N seconds (refresh spam).
const DEDUPE_SECONDS = 60;
const SALT = process.env.VIEWS_SALT || 'repopicks-views-v1';

const BOT_RE =
  /bot|crawler|spider|crawling|slurp|mediapartners|baidu|yandex|duckduckbot|facebot|ia_archiver|ahrefs|semrush|mj12bot/i;

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function hashIp(ip: string): string {
  return createHash('sha256').update(`${SALT}|${ip}`).digest('hex');
}

async function ensureTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS page_views (
      id BIGSERIAL PRIMARY KEY,
      page TEXT NOT NULL DEFAULT '/',
      ip_hash CHAR(64) NOT NULL,
      ua TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_page_views_ip_page_time ON page_views (ip_hash, page, created_at DESC);
  `);
}

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, disabled: true });
    }
    const ua = req.headers.get('user-agent') || '';
    if (BOT_RE.test(ua)) {
      return NextResponse.json({ ok: true, bot: true });
    }

    await ensureTable();

    const ipHash = hashIp(getClientIp(req));
    let page = '/';
    try {
      const body = await req.json();
      if (typeof body.page === 'string' && body.page.startsWith('/')) {
        page = body.page.slice(0, 200);
      }
    } catch {
      // Empty body is fine — counts as a homepage view.
    }

    const recent = await query(
      `SELECT 1 FROM page_views
       WHERE ip_hash = $1 AND page = $2
         AND created_at > NOW() - ($3 * INTERVAL '1 second')
       LIMIT 1`,
      [ipHash, page, DEDUPE_SECONDS]
    );
    if (recent.length === 0) {
      await query(`INSERT INTO page_views (page, ip_hash, ua) VALUES ($1, $2, $3)`, [
        page,
        ipHash,
        ua.slice(0, 200),
      ]);
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ totalViews: 0, liveVisitors: 0, disabled: true });
    }
    await ensureTable();
    const [totalRows, liveRows] = await Promise.all([
      query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM page_views`),
      query<{ count: string }>(
        `SELECT COUNT(DISTINCT ip_hash)::text AS count FROM page_views
         WHERE created_at > NOW() - ($1 * INTERVAL '1 minute')`,
        [LIVE_WINDOW_MINUTES]
      ),
    ]);
    return NextResponse.json(
      {
        totalViews: parseInt(totalRows[0]?.count || '0', 10),
        liveVisitors: parseInt(liveRows[0]?.count || '0', 10),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json(
      { totalViews: 0, liveVisitors: 0, error: message },
      { status: 500 }
    );
  }
}
