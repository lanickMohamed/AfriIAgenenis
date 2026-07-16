import crypto from 'node:crypto';
import { config } from '../config';
import type { IncomingWhatsAppMessage } from '../types';

const graphBase = `https://graph.facebook.com/${config.WHATSAPP_GRAPH_VERSION}`;

export function verifyWebhookSignature(rawBody: Buffer, signature?: string) {
  if (!config.WHATSAPP_APP_SECRET) return config.NODE_ENV !== 'production';
  if (!signature?.startsWith('sha256=')) return false;
  const expected = `sha256=${crypto.createHmac('sha256', config.WHATSAPP_APP_SECRET).update(rawBody).digest('hex')}`;
  const provided = Buffer.from(signature);
  const target = Buffer.from(expected);
  return provided.length === target.length && crypto.timingSafeEqual(provided, target);
}

export function extractIncomingMessages(payload: unknown): IncomingWhatsAppMessage[] {
  const body = payload as any;
  const messages: IncomingWhatsAppMessage[] = [];
  for (const entry of body?.entry || []) {
    for (const change of entry?.changes || []) {
      for (const message of change?.value?.messages || []) {
        if (message.type === 'text') {
          messages.push({ id: message.id, from: message.from, type: 'text', text: message.text?.body || '', timestamp: message.timestamp });
        } else if (message.type === 'audio') {
          messages.push({ id: message.id, from: message.from, type: 'audio', audioId: message.audio?.id, timestamp: message.timestamp });
        } else {
          messages.push({ id: message.id, from: message.from, type: 'unknown', timestamp: message.timestamp });
        }
      }
    }
  }
  return messages;
}

async function graphRequest(path: string, init?: RequestInit) {
  if (!config.WHATSAPP_ACCESS_TOKEN) throw new Error('WHATSAPP_ACCESS_TOKEN absente');
  const response = await fetch(`${graphBase}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`, ...(init?.headers || {}) }
  });
  if (!response.ok) throw new Error(`WhatsApp Graph API ${response.status}: ${await response.text()}`);
  return response;
}

export async function downloadAudio(mediaId: string) {
  const mediaResponse = await graphRequest(`/${mediaId}`);
  const media = await mediaResponse.json() as {url:string; mime_type?:string};
  const fileResponse = await fetch(media.url, { headers: { Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}` }});
  if (!fileResponse.ok) throw new Error(`Téléchargement audio impossible: ${fileResponse.status}`);
  return { buffer: Buffer.from(await fileResponse.arrayBuffer()), mimeType: media.mime_type || 'audio/ogg' };
}

export async function sendText(to: string, text: string) {
  if (!config.WHATSAPP_PHONE_NUMBER_ID) throw new Error('WHATSAPP_PHONE_NUMBER_ID absent');
  const response = await graphRequest(`/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { preview_url: false, body: text } })
  });
  return response.json();
}

export async function uploadAudio(audio: Buffer) {
  if (!config.WHATSAPP_PHONE_NUMBER_ID) throw new Error('WHATSAPP_PHONE_NUMBER_ID absent');
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('type', 'audio/mpeg');
  form.append('file', new Blob([new Uint8Array(audio)], { type: 'audio/mpeg' }), 'response.mp3');
  const response = await graphRequest(`/${config.WHATSAPP_PHONE_NUMBER_ID}/media`, { method: 'POST', body: form });
  return response.json() as Promise<{id:string}>;
}

export async function sendAudio(to: string, audio: Buffer) {
  if (!config.WHATSAPP_PHONE_NUMBER_ID) throw new Error('WHATSAPP_PHONE_NUMBER_ID absent');
  const media = await uploadAudio(audio);
  const response = await graphRequest(`/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'audio', audio: { id: media.id } })
  });
  return response.json();
}