import fs from 'fs';
import path from 'path';
import { getDbPool, isDatabaseConfigured } from '../src/lib/db';

async function runMigrations() {
  console.log('--- GitHub Trend Engine: Database Migration Runner ---');

  if (!isDatabaseConfigured()) {
    console.warn('[MIGRATION_SKIPPED] DATABASE_URL is not set in environment.');
    console.warn('To connect your free-tier database:');
    console.warn('  1. Create a free PostgreSQL project at https://neon.tech or https://supabase.com');
    console.warn('  2. Add DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require" to your .env');
    console.warn('  3. Re-run npm run migrate');
    process.exit(0);
  }

  const pool = getDbPool();
  if (!pool) {
    throw new Error('Failed to initialize connection pool.');
  }

  const migrationPath = path.join(__dirname, 'migrations', '001_init_schema.sql');
  console.log(`Loading migration: ${migrationPath}`);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying database schema and indexes...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ Migration successfully applied!');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('[UNHANDLED_ERROR]', err);
  process.exit(1);
});
