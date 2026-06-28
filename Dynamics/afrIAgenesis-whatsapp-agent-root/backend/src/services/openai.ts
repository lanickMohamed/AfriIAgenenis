import OpenAI, { toFile } from 'openai';
import { config } from '../config';
import type { LeadAnalysis } from '../types';

const client = config.OPENAI_API_KEY ? new OpenAI({ apiKey: config.OPENAI_API_KEY }) : null;

const fallbackAnalysis = (message: string): LeadAnalysis => {
  const lower = message.toLowerCase();
  const appointmentRequested = /(rendez-vous|rdv|rencontr|disponib)/i.test(message);
  const needs = [
    /(commande|restaurant|menu)/i.test(message) ? 'Automatisation des commandes' : null,
    /(devis|prix|tarif)/i.test(message) ? 'Création et suivi des devis' : null,
    /(support|sav|réclamation)/i.test(message) ? 'Support client' : null,
    /(relance|prospect|vente)/i.test(message) ? 'Suivi commercial et relances' : null
  ].filter((item): item is string => Boolean(item));
  const score = Math.min(85, 30 + needs.length * 15 + (appointmentRequested ? 20 : 0));
  return {
    name: null, email: null, company: null,
    industry: /(restaurant|menu|commande)/i.test(message) ? 'Restauration' : null,
    intent: lower.includes('chatbot') || lower.includes('automatis') ? 'Mettre en place un agent commercial WhatsApp' : 'Demande commerciale',
    needs, budgetRange: null, timeline: null,
    urgency: /(urgent|rapidement|cette semaine)/i.test(message) ? 'high' : 'medium',
    score, stage: score >= 60 ? (appointmentRequested ? 'appointment_proposed' : 'qualified') : 'new',
    missingFields: ['nom', 'entreprise', 'budget', 'délai'],
    appointmentRequested, explicitBookingConfirmation: false,
    safetyFlags: [],
    reply: appointmentRequested
      ? "Merci, votre besoin est bien identifié. Je peux vous proposer des créneaux de rendez-vous. Pouvez-vous préciser votre nom, votre entreprise et le délai souhaité ?"
      : "Merci pour votre message. J’ai commencé à qualifier votre besoin. Pouvez-vous préciser votre activité, les tâches à automatiser et le délai souhaité ?"
  };
};

function safeParseAnalysis(text: string, originalMessage: string): LeadAnalysis {
  try {
    const parsed = JSON.parse(text) as Partial<LeadAnalysis>;
    const fallback = fallbackAnalysis(originalMessage);
    return {
      ...fallback,
      ...parsed,
      needs: Array.isArray(parsed.needs) ? parsed.needs.map(String) : fallback.needs,
      missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields.map(String) : fallback.missingFields,
      safetyFlags: Array.isArray(parsed.safetyFlags) ? parsed.safetyFlags.map(String) : [],
      score: Math.max(0, Math.min(100, Number(parsed.score ?? fallback.score)))
    };
  } catch {
    return fallbackAnalysis(originalMessage);
  }
}

export async function analyzeLead(message: string, history: Array<{direction:string;content:string}>): Promise<LeadAnalysis> {
  if (!client) return fallbackAnalysis(message);

  const system = `Tu es l'agent commercial d'afrIAgenesis®. Qualifie un prospect WhatsApp avec sobriété et précision.
Règles obligatoires :
- Ne promets jamais qu'un chatbot a déjà été créé ou déployé.
- Ne réserve jamais un rendez-vous sans confirmation explicite du prospect.
- Ne demande que les informations nécessaires.
- N'effectue aucun paiement, engagement contractuel, suppression ou export de données.
- Réponds en français professionnel, chaleureux, maximum 80 mots.
- Retourne uniquement un objet JSON valide avec les clés : name, email, company, industry, intent, needs, budgetRange, timeline, urgency, score, stage, missingFields, appointmentRequested, explicitBookingConfirmation, reply, safetyFlags.
- stage doit être : new, qualified, appointment_proposed, appointment_booked, won ou lost.
- score est un entier de 0 à 100.`;

  const response = await client.chat.completions.create({
    model: config.OPENAI_MODEL,
    response_format: { type: 'json_object' },
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `Historique récent : ${JSON.stringify(history)}\n\nNouveau message : ${message}` }
    ]
  });

  return safeParseAnalysis(response.choices[0]?.message?.content || '{}', message);
}

export async function transcribeAudio(buffer: Buffer, mimeType = 'audio/ogg') {
  if (!client) throw new Error('OPENAI_API_KEY absente : transcription indisponible');
  const extension = mimeType.includes('mpeg') ? 'mp3' : mimeType.includes('wav') ? 'wav' : 'ogg';
  const file = await toFile(buffer, `whatsapp-audio.${extension}`, { type: mimeType });
  const result = await client.audio.transcriptions.create({
    model: config.OPENAI_TRANSCRIPTION_MODEL,
    file,
    language: 'fr'
  });
  return result.text;
}

export async function synthesizeSpeech(text: string) {
  if (!client) throw new Error('OPENAI_API_KEY absente : synthèse vocale indisponible');
  const result = await client.audio.speech.create({
    model: config.OPENAI_TTS_MODEL,
    voice: config.OPENAI_TTS_VOICE as 'alloy',
    input: text,
    response_format: 'mp3'
  });
  return Buffer.from(await result.arrayBuffer());
}