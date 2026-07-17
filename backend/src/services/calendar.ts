import { google } from 'googleapis';
import { config } from '../config';

function calendarClient() {
  if (!config.GOOGLE_CLIENT_EMAIL || !config.GOOGLE_PRIVATE_KEY) throw new Error('Google Calendar non configuré');
  const auth = new google.auth.JWT({
    email: config.GOOGLE_CLIENT_EMAIL,
    key: config.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
  return google.calendar({ version: 'v3', auth });
}

export async function listAvailableSlots(days = 7, durationMinutes = 30) {
  const calendar = calendarClient();
  const from = new Date();
  const to = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  const busy = await calendar.freebusy.query({ requestBody: { timeMin: from.toISOString(), timeMax: to.toISOString(), timeZone: config.BUSINESS_TIMEZONE, items: [{ id: config.GOOGLE_CALENDAR_ID }] } });
  const occupied = busy.data.calendars?.[config.GOOGLE_CALENDAR_ID]?.busy || [];
  const slots: Date[] = [];

  for (let day = 1; day <= days && slots.length < 3; day++) {
    const date = new Date(from);
    date.setDate(date.getDate() + day);
    if ([0,6].includes(date.getDay())) continue;
    const [startHour = 9, startMinute = 0] = config.BUSINESS_HOURS_START.split(':').map(Number);
    const [endHour = 18, endMinute = 0] = config.BUSINESS_HOURS_END.split(':').map(Number);
    date.setHours(startHour, startMinute, 0, 0);
    const endOfDay = new Date(date); endOfDay.setHours(endHour, endMinute, 0, 0);
    while (date.getTime() + durationMinutes * 60000 <= endOfDay.getTime() && slots.length < 3) {
      const end = new Date(date.getTime() + durationMinutes * 60000);
      const collision = occupied.some((item) => item.start && item.end && date < new Date(item.end) && end > new Date(item.start));
      if (!collision) slots.push(new Date(date));
      date.setMinutes(date.getMinutes() + 60);
    }
  }
  return slots;
}

export async function bookCalendarEvent(input: {name:string; phone:string; email?:string|null; scheduledAt:Date; durationMinutes:number; meetingType:string; description:string}) {
  const calendar = calendarClient();
  const end = new Date(input.scheduledAt.getTime() + input.durationMinutes * 60000);
  const response = await calendar.events.insert({
    calendarId: config.GOOGLE_CALENDAR_ID,
    conferenceDataVersion: 1,
    requestBody: {
      summary: `${input.meetingType} — ${input.name || input.phone}`,
      description: input.description,
      start: { dateTime: input.scheduledAt.toISOString(), timeZone: config.BUSINESS_TIMEZONE },
      end: { dateTime: end.toISOString(), timeZone: config.BUSINESS_TIMEZONE },
      attendees: input.email ? [{ email: input.email, displayName: input.name }] : undefined,
      conferenceData: { createRequest: { requestId: `afria-${Date.now()}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } }
    }
  });
  return { eventId: response.data.id || undefined, meetingLink: response.data.hangoutLink || response.data.htmlLink || null };
}