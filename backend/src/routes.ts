import { Router, type Request } from 'express';
import { db } from './db';
import { capabilities, config } from './config';
import { extractIncomingMessages, verifyWebhookSignature } from './services/whatsapp';
import { processTextMessage, processWhatsAppMessage } from './services/agent';
import { bookCalendarEvent, listAvailableSlots } from './services/calendar';
import { createAppointment, findProspectByPhone, writeAuditLog } from './repository';

export const routes = Router();

routes.get('/health', (_req, res) => res.json({ ok: true, service: 'afriagenesis-whatsapp-agent', capabilities }));

routes.get('/dashboard', async (_req, res, next) => {
  try {
    const [prospects, conversations, appointments, metrics] = await Promise.all([
      db.query(`SELECT id, phone, name, company, industry, stage, score, intent, last_contact_at AS "lastContactAt" FROM prospects ORDER BY last_contact_at DESC LIMIT 8`),
      db.query(`SELECT c.id, c.prospect_id AS "prospectId", p.phone, c.direction, c.message_type AS type, c.content, c.created_at AS "createdAt" FROM conversations c JOIN prospects p ON p.id=c.prospect_id ORDER BY c.created_at DESC LIMIT 8`),
      db.query(`SELECT a.id, a.prospect_id AS "prospectId", p.name, p.phone, a.meeting_type AS "meetingType", a.scheduled_at AS "scheduledAt", a.duration_minutes AS "durationMinutes", a.status, a.meeting_link AS "meetingLink" FROM appointments a JOIN prospects p ON p.id=a.prospect_id WHERE a.scheduled_at >= NOW() AND a.status='scheduled' ORDER BY a.scheduled_at LIMIT 5`),
      db.query(`SELECT COUNT(*)::int AS prospects, COUNT(*) FILTER (WHERE stage IN ('qualified','appointment_proposed','appointment_booked','won'))::int AS qualified, COUNT(*) FILTER (WHERE stage IN ('appointment_booked','won'))::int AS appointments, MAX(last_contact_at) AS last_activity, COUNT(*) FILTER (WHERE last_contact_at::date=CURRENT_DATE)::int AS processed_today FROM prospects`)
    ]);
    const m = metrics.rows[0] || {};
    const prospectCount = Number(m.prospects || 0);
    const appointmentCount = Number(m.appointments || 0);
    res.json({
      kpis: { prospects: prospectCount, qualified: Number(m.qualified || 0), appointments: appointmentCount, conversionRate: prospectCount ? Math.round((appointmentCount / prospectCount) * 100) : 0 },
      recentProspects: prospects.rows,
      recentConversations: conversations.rows,
      upcomingAppointments: appointments.rows,
      agent: {
        state: capabilities.openai && capabilities.whatsapp ? 'online' : capabilities.openai || capabilities.whatsapp ? 'degraded' : 'offline',
        lastActivity: m.last_activity || null, processedToday: Number(m.processed_today || 0),
        openaiConfigured: capabilities.openai, whatsappConfigured: capabilities.whatsapp, calendarConfigured: capabilities.calendar
      }
    });
  } catch (error) { next(error); }
});

routes.get('/prospects', async (_req, res, next) => {
  try { const result = await db.query(`SELECT id, phone, name, company, industry, stage, score, intent, last_contact_at AS "lastContactAt" FROM prospects ORDER BY last_contact_at DESC`); res.json(result.rows); }
  catch (error) { next(error); }
});

routes.post('/simulator/message', async (req, res, next) => {
  try {
    const phone = String(req.body?.phone || '').trim();
    const message = String(req.body?.message || '').trim();
    if (!phone || !message) return res.status(400).json({ error: 'phone et message sont obligatoires' });
    const result = await processTextMessage(phone, message, undefined, false);
    res.json(result);
  } catch (error) { next(error); }
});

routes.get('/calendar/slots', async (req, res, next) => {
  try { res.json({ slots: (await listAvailableSlots(Number(req.query.days || 7), Number(req.query.duration || 30))).map((date) => date.toISOString()) }); }
  catch (error) { next(error); }
});

routes.post('/appointments', async (req, res, next) => {
  try {
    const phone = String(req.body?.phone || '').trim();
    const scheduledAt = new Date(String(req.body?.scheduledAt || ''));
    const explicitConfirmation = req.body?.explicitConfirmation === true;
    if (!phone || Number.isNaN(scheduledAt.getTime())) return res.status(400).json({ error: 'phone et scheduledAt sont obligatoires' });
    if (!explicitConfirmation) return res.status(409).json({ error: 'Confirmation explicite du prospect obligatoire avant réservation' });
    const prospect = await findProspectByPhone(phone);
    if (!prospect) return res.status(404).json({ error: 'Prospect introuvable' });
    const meetingType = String(req.body?.meetingType || 'discovery');
    const durationMinutes = Math.max(15, Math.min(120, Number(req.body?.durationMinutes || 30)));
    const calendar: { eventId?: string; meetingLink?: string | null } = capabilities.calendar ? await bookCalendarEvent({ name: prospect.name || phone, phone, email: prospect.email, scheduledAt, durationMinutes, meetingType, description: `Rendez-vous confirmé via l'agent WhatsApp afrIAgenesis®. Besoin : ${prospect.intent || 'à préciser'}` }) : {};
    const appointment = await createAppointment({ prospectId: prospect.id, googleEventId: calendar.eventId, meetingType, scheduledAt, durationMinutes, meetingLink: calendar.meetingLink });
    await writeAuditLog('human-approved-workflow', 'appointment_booked', 'prospect', prospect.id, { explicitConfirmation, scheduledAt: scheduledAt.toISOString() });
    res.status(201).json(appointment);
  } catch (error) { next(error); }
});

routes.get('/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode']; const token = req.query['hub.verify_token']; const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === config.WHATSAPP_VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

routes.post('/webhooks/whatsapp', async (req: Request & {rawBody?:Buffer}, res, next) => {
  try {
    if (!verifyWebhookSignature(req.rawBody || Buffer.from(''), req.header('x-hub-signature-256'))) return res.status(401).json({ error: 'Signature WhatsApp invalide' });
    const messages = extractIncomingMessages(req.body);
    res.sendStatus(200);
    for (const message of messages) processWhatsAppMessage(message).catch((error) => console.error('Traitement WhatsApp échoué', error));
  } catch (error) { next(error); }
});