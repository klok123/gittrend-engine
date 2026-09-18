import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

export function getDbPool(): Pool | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!pool) {
    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.DATABASE_URL?.includes('localhost')
        ? false
        : { rejectUnauthorized: false }, // Essential for Neon / Supabase serverless connections
    };

    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('[DB_POOL_ERROR] Unexpected error on idle client:', err.message);
    });
  }

  return pool;
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const activePool = getDbPool();
  if (!activePool) {
    throw new Error('[DB_ERROR] DATABASE_URL is not configured. Configure DATABASE_URL in .env to use PostgreSQL.');
  }

  const start = Date.now();
  const res = await activePool.query(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === 'development' && duration > 500) {
    console.warn(`[DB_SLOW_QUERY] ${duration}ms: ${text.slice(0, 100)}...`);
  }

  return res.rows;
}
