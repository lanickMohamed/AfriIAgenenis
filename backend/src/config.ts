import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/afriagenesis_whatsapp'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  OPENAI_TRANSCRIPTION_MODEL: z.string().default('gpt-4o-mini-transcribe'),
  OPENAI_TTS_MODEL: z.string().default('gpt-4o-mini-tts'),
  OPENAI_TTS_VOICE: z.string().default('alloy'),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_GRAPH_VERSION: z.string().default('v23.0'),
  GOOGLE_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().default('primary'),
  BUSINESS_TIMEZONE: z.string().default('Africa/Porto-Novo'),
  BUSINESS_HOURS_START: z.string().default('09:00'),
  BUSINESS_HOURS_END: z.string().default('18:00')
});

export const config = envSchema.parse(process.env);

export const capabilities = {
  openai: Boolean(config.OPENAI_API_KEY),
  whatsapp: Boolean(config.WHATSAPP_ACCESS_TOKEN && config.WHATSAPP_PHONE_NUMBER_ID && config.WHATSAPP_VERIFY_TOKEN),
  calendar: Boolean(config.GOOGLE_CLIENT_EMAIL && config.GOOGLE_PRIVATE_KEY)
};