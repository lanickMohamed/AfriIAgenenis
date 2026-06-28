import { capabilities } from '../config';
import { analyzeLead, synthesizeSpeech, transcribeAudio } from './openai';
import { downloadAudio, sendAudio, sendText } from './whatsapp';
import { findProspectByPhone, getConversationHistory, saveConversation, upsertProspect, writeAuditLog } from '../repository';
import type { IncomingWhatsAppMessage } from '../types';

export async function processTextMessage(phone: string, content: string, whatsappMessageId?: string, sendReply = true) {
  let prospect = await findProspectByPhone(phone);
  if (!prospect) prospect = await upsertProspect(phone);

  await saveConversation({ prospectId: prospect.id, whatsappMessageId, direction: 'inbound', type: 'text', content });
  const history = await getConversationHistory(prospect.id);
  const analysis = await analyzeLead(content, history.map((item) => ({ direction: String(item.direction), content: String(item.content) })));
  prospect = await upsertProspect(phone, analysis);

  await saveConversation({ prospectId: prospect.id, direction: 'outbound', type: 'text', content: analysis.reply, metadata: {analysis} });
  await writeAuditLog('commercial-agent', 'lead_analyzed', 'prospect', prospect.id, { score: analysis.score, stage: analysis.stage, safetyFlags: analysis.safetyFlags });

  if (sendReply && capabilities.whatsapp) await sendText(phone, analysis.reply);
  return { reply: analysis.reply, prospect, analysis };
}

export async function processWhatsAppMessage(message: IncomingWhatsAppMessage) {
  if (message.type === 'text' && message.text) return processTextMessage(message.from, message.text, message.id, true);

  if (message.type === 'audio' && message.audioId) {
    let prospect = await findProspectByPhone(message.from);
    if (!prospect) prospect = await upsertProspect(message.from);
    const audio = await downloadAudio(message.audioId);
    const transcription = await transcribeAudio(audio.buffer, audio.mimeType);
    await saveConversation({ prospectId: prospect.id, whatsappMessageId: message.id, direction: 'inbound', type: 'audio', content: transcription, metadata: { source: 'whatsapp_audio' } });
    const history = await getConversationHistory(prospect.id);
    const analysis = await analyzeLead(transcription, history.map((item) => ({ direction: String(item.direction), content: String(item.content) })));
    prospect = await upsertProspect(message.from, analysis);
    await saveConversation({ prospectId: prospect.id, direction: 'outbound', type: 'text', content: analysis.reply, metadata: { analysis } });
    await writeAuditLog('commercial-agent', 'voice_lead_analyzed', 'prospect', prospect.id, { transcription, score: analysis.score });

    if (capabilities.whatsapp) {
      if (capabilities.openai) {
        try { await sendAudio(message.from, await synthesizeSpeech(analysis.reply)); }
        catch { await sendText(message.from, analysis.reply); }
      } else await sendText(message.from, analysis.reply);
    }
    return { reply: analysis.reply, prospect, analysis, transcription };
  }

  if (capabilities.whatsapp) await sendText(message.from, 'Merci. Pour le moment, je peux traiter les messages texte et les notes vocales.');
  return null;
}