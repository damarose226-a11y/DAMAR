-- Dama Rose PostgreSQL schema
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','manager')),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_attempts (
  rate_key TEXT PRIMARY KEY,
  attempts INT NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('بقلاوات','قشاطي','كنافة','نواشف','بوظة')),
  image_data TEXT NOT NULL DEFAULT '',
  is_pick BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  price_omr NUMERIC(10,3) NOT NULL CHECK (price_omr >= 0),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  value_text TEXT NOT NULL DEFAULT '',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check
CHECK (category IN ('بقلاوات','قشاطي','كنافة','نواشف','بوظة'));

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_updated_at ON auth_attempts(updated_at);
CREATE INDEX IF NOT EXISTS idx_products_visible_created ON products(is_visible, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_pick_visible ON products(is_pick, is_visible, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_sort ON product_variants(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_offers_visible_created ON offers(is_visible, created_at DESC);

INSERT INTO settings(key,value) VALUES
  ('whatsapp','+96892415565'),
  ('address','سلطنة عمان، مسقط، شارع 18 نوفمبر، مقابل ستاربكس')
ON CONFLICT (key) DO NOTHING;
