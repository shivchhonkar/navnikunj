import { Pool, type PoolClient, type QueryResultRow } from 'pg';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superAdmin', 'admin', 'editor')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE constraint_name text;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'users' AND con.contype = 'c' AND pg_get_constraintdef(con.oid) ILIKE '%role%';
  IF constraint_name IS NOT NULL AND constraint_name <> 'users_role_check' THEN
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('superAdmin', 'admin', 'editor'));

CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stats (
  sort_order INTEGER PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'heart',
  image TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE programs ADD COLUMN IF NOT EXISTS image TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('blog', 'news', 'event')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  post_date TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  pan TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS donors_pan_unique ON donors (pan) WHERE pan <> '';

CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  donor_id TEXT REFERENCES donors (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  pan TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12, 2) NOT NULL,
  order_id TEXT NOT NULL DEFAULT '',
  payment_id TEXT NOT NULL DEFAULT '',
  method TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('created', 'paid', 'failed')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '',
  availability TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'active', 'inactive')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  entity_type TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS images_entity_idx ON images (entity_type, entity_id);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('overview', 'donations', 'donors', 'volunteers', 'events')),
  period_start TEXT NOT NULL DEFAULT '',
  period_end TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by TEXT REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const SCHEMA_VERSION = 3;
const globalDb = globalThis as unknown as { navnikunjPool?: Pool; navnikunjReady?: Promise<void> | null; navnikunjSchema?: number };

function connectionConfig() {
  const databaseUrl = process.env.DATABASE_URL?.replace(/([?&])schema=[^&]*/g, '$1').replace(/\?&/, '?').replace(/[?&]$/, '');
  if (databaseUrl) return { connectionString: databaseUrl };
  return {
    host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
    port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
    user: process.env.DB_USER || process.env.PGUSER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
    database: process.env.DB_NAME || process.env.PGDATABASE || 'navnikunj',
  };
}

export function getPool() {
  if (!globalDb.navnikunjPool) {
    globalDb.navnikunjPool = new Pool({
      ...connectionConfig(),
      max: 10,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalDb.navnikunjPool;
}

function explain(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown database error';
  if (/password authentication failed|no password supplied|SASL|28P01/i.test(message)) {
    return new Error('PostgreSQL rejected the login for database "navnikunj". Set PGPASSWORD or DATABASE_URL in .env.');
  }
  if (/ECONNREFUSED|ENOTFOUND|timeout/i.test(message)) {
    return new Error('Could not reach PostgreSQL for database "navnikunj". Confirm it is running on localhost port 5432.');
  }
  return error instanceof Error ? error : new Error(message);
}

export async function ready() {
  if (globalDb.navnikunjSchema === SCHEMA_VERSION && globalDb.navnikunjReady) return globalDb.navnikunjReady;
  globalDb.navnikunjSchema = SCHEMA_VERSION;
  globalDb.navnikunjReady = getPool().query(SCHEMA).then(() => undefined).catch((error) => {
    globalDb.navnikunjReady = null;
    globalDb.navnikunjSchema = 0;
    throw explain(error);
  });
  return globalDb.navnikunjReady;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  await ready();
  try {
    return await getPool().query<T>(text, params);
  } catch (error) {
    throw explain(error);
  }
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>) {
  await ready();
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* connection already failed */ }
    throw explain(error);
  } finally {
    client.release();
  }
}
