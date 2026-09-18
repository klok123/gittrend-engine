-- ==========================================================
-- 001_init_schema.sql
-- Production DDL for GitHub Trend Engine
-- Compatible with Neon Serverless Postgres, Supabase, & Local Postgres
-- ==========================================================

-- 1. Repositories Master Table
CREATE TABLE IF NOT EXISTS repositories (
    id BIGINT PRIMARY KEY, -- GitHub databaseId
    owner VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(210) NOT NULL UNIQUE,
    description TEXT,
    primary_language VARCHAR(50),
    languages TEXT[] DEFAULT '{}',
    topics TEXT[] DEFAULT '{}',
    total_stars INT NOT NULL DEFAULT 0,
    forks_count INT NOT NULL DEFAULT 0,
    open_issues_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    pushed_at TIMESTAMPTZ NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Daily Snapshot Append-Only Table
CREATE TABLE IF NOT EXISTS repository_snapshots (
    id BIGSERIAL PRIMARY KEY,
    repository_id BIGINT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    stars_count INT NOT NULL,
    forks_count INT NOT NULL,
    snapshot_date DATE NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_repo_daily_snapshot UNIQUE (repository_id, snapshot_date)
);

-- 3. Precomputed Trending Leaderboard (Materialized Cache)
CREATE TABLE IF NOT EXISTS trending_leaderboard (
    repository_id BIGINT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    time_window VARCHAR(10) NOT NULL, -- 'daily', 'weekly', 'monthly'
    stars_gained INT NOT NULL DEFAULT 0,
    rank_score NUMERIC(14, 4) NOT NULL DEFAULT 0,
    breakout_score NUMERIC(14, 4) NOT NULL DEFAULT 0,
    anomaly_score NUMERIC(4, 2) NOT NULL DEFAULT 0,
    anomaly_status VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- 'NORMAL', 'REVIEW', 'ANOMALOUS SIGNAL'
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (repository_id, time_window)
);

-- 4. Ranking Benchmarking Table (Simulation & Validation)
CREATE TABLE IF NOT EXISTS ranking_benchmarks (
    id BIGSERIAL PRIMARY KEY,
    repository_id BIGINT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    model_name VARCHAR(50) NOT NULL,
    computed_score NUMERIC(14, 4) NOT NULL,
    rank_position INT NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Essential Performance Indexes for Sub-10ms Queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_query 
    ON trending_leaderboard(time_window, rank_score DESC, anomaly_status);

CREATE INDEX IF NOT EXISTS idx_repos_lang_stars 
    ON repositories(primary_language, total_stars DESC);

CREATE INDEX IF NOT EXISTS idx_snapshots_lookup 
    ON repository_snapshots(repository_id, snapshot_date DESC);
