-- Public visitor stats: live visitors + total views (privacy-friendly: IPs are
-- SHA-256 hashed with a salt, raw IPs are never stored).
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page TEXT NOT NULL DEFAULT '/',
  ip_hash CHAR(64) NOT NULL,
  ua TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_ip_page_time ON page_views (ip_hash, page, created_at DESC);
