import 'dotenv/config';
import pg from 'pg';
import { config } from './config';

const { Pool } = pg;
export const db = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

export async function initializeDatabase() {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS prospects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone VARCHAR(32) UNIQUE NOT NULL,
      name VARCHAR(120),
      email VARCHAR(180),
      company VARCHAR(180),
      industry VARCHAR(120),
      stage VARCHAR(40) NOT NULL DEFAULT 'new',
      score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
      intent TEXT,
      needs JSONB NOT NULL DEFAULT '[]'::jsonb,
      missing_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
      last_contact_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
      whatsapp_message_id VARCHAR(180),
      direction VARCHAR(16) NOT NULL CHECK (direction IN ('inbound','outbound')),
      message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text','audio')),
      content TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS conversations_whatsapp_message_id_idx
      ON conversations(whatsapp_message_id)
      WHERE whatsapp_message_id IS NOT NULL;

    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
      google_event_id VARCHAR(255),
      meeting_type VARCHAR(80) NOT NULL DEFAULT 'discovery',
      scheduled_at TIMESTAMPTZ NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
      meeting_link TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor VARCHAR(100) NOT NULL,
      action VARCHAR(120) NOT NULL,
      entity_type VARCHAR(80),
      entity_id VARCHAR(100),
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function closeDatabase() {
  await db.end();
}