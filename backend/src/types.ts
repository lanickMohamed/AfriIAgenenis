export type LeadStage = 'new' | 'qualified' | 'appointment_proposed' | 'appointment_booked' | 'won' | 'lost';

export type Prospect = {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  stage: LeadStage;
  score: number;
  intent: string | null;
  needs: string[];
  missingFields: string[];
  lastContactAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadAnalysis = {
  name: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  intent: string;
  needs: string[];
  budgetRange: string | null;
  timeline: string | null;
  urgency: 'low' | 'medium' | 'high';
  score: number;
  stage: LeadStage;
  missingFields: string[];
  appointmentRequested: boolean;
  explicitBookingConfirmation: boolean;
  reply: string;
  safetyFlags: string[];
};

export type IncomingWhatsAppMessage = {
  id: string;
  from: string;
  type: 'text' | 'audio' | 'unknown';
  text?: string;
  audioId?: string;
  timestamp?: string;
};