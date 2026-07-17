import { db } from './db';
import type { LeadAnalysis, Prospect } from './types';

function mapProspect(row: Record<string, unknown>): Prospect {
  return {
    id: String(row.id), phone: String(row.phone), name: row.name ? String(row.name) : null,
    email: row.email ? String(row.email) : null, company: row.company ? String(row.company) : null,
    industry: row.industry ? String(row.industry) : null, stage: row.stage as Prospect['stage'],
    score: Number(row.score), intent: row.intent ? String(row.intent) : null,
    needs: Array.isArray(row.needs) ? row.needs.map(String) : [],
    missingFields: Array.isArray(row.missing_fields) ? row.missing_fields.map(String) : [],
    lastContactAt: new Date(String(row.last_contact_at)), createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at))
  };
}

export async function findProspectByPhone(phone: string) {
  const result = await db.query('SELECT * FROM prospects WHERE phone = $1 LIMIT 1', [phone]);
  return result.rows[0] ? mapProspect(result.rows[0]) : null;
}

export async function upsertProspect(phone: string, analysis?: LeadAnalysis) {
  const result = await db.query(`
    INSERT INTO prospects (phone, name, email, company, industry, stage, score, intent, needs, missing_fields, last_contact_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,NOW())
    ON CONFLICT (phone) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, prospects.name),
      email = COALESCE(EXCLUDED.email, prospects.email),
      company = COALESCE(EXCLUDED.company, prospects.company),
      industry = COALESCE(EXCLUDED.industry, prospects.industry),
      stage = EXCLUDED.stage,
      score = GREATEST(prospects.score, EXCLUDED.score),
      intent = COALESCE(EXCLUDED.intent, prospects.intent),
      needs = CASE WHEN EXCLUDED.needs = '[]'::jsonb THEN prospects.needs ELSE EXCLUDED.needs END,
      missing_fields = EXCLUDED.missing_fields,
      last_contact_at = NOW(),
      updated_at = NOW()
    RETURNING *
  `, [
    phone, analysis?.name ?? null, analysis?.email ?? null, analysis?.company ?? null,
    analysis?.industry ?? null, analysis?.stage ?? 'new', analysis?.score ?? 0,
    analysis?.intent ?? null, JSON.stringify(analysis?.needs ?? []), JSON.stringify(analysis?.missingFields ?? [])
  ]);
  return mapProspect(result.rows[0]);
}

export async function saveConversation(input: {
  prospectId: string; whatsappMessageId?: string; direction: 'inbound'|'outbound';
  type: 'text'|'audio'; content: string; metadata?: Record<string, unknown>;
}) {
  const result = await db.query(`
    INSERT INTO conversations (prospect_id, whatsapp_message_id, direction, message_type, content, metadata)
    VALUES ($1,$2,$3,$4,$5,$6::jsonb)
    ON CONFLICT (whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL DO NOTHING
    RETURNING *
  `, [input.prospectId, input.whatsappMessageId ?? null, input.direction, input.type, input.content, JSON.stringify(input.metadata ?? {})]);
  return result.rows[0] ?? null;
}

export async function getConversationHistory(prospectId: string, limit = 12) {
  const result = await db.query(`SELECT direction, message_type, content, created_at FROM conversations WHERE prospect_id=$1 ORDER BY created_at DESC LIMIT $2`, [prospectId, limit]);
  return result.rows.reverse();
}

export async function createAppointment(input: {
  prospectId: string; googleEventId?: string; meetingType: string; scheduledAt: Date;
  durationMinutes: number; meetingLink?: string | null;
}) {
  const result = await db.query(`
    INSERT INTO appointments (prospect_id, google_event_id, meeting_type, scheduled_at, duration_minutes, meeting_link)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
  `, [input.prospectId, input.googleEventId ?? null, input.meetingType, input.scheduledAt, input.durationMinutes, input.meetingLink ?? null]);
  await db.query(`UPDATE prospects SET stage='appointment_booked', updated_at=NOW() WHERE id=$1`, [input.prospectId]);
  return result.rows[0];
}

export async function writeAuditLog(actor: string, action: string, entityType?: string, entityId?: string, payload: Record<string, unknown> = {}) {
  await db.query(`INSERT INTO audit_logs (actor, action, entity_type, entity_id, payload) VALUES ($1,$2,$3,$4,$5::jsonb)`,
    [actor, action, entityType ?? null, entityId ?? null, JSON.stringify(payload)]);
}