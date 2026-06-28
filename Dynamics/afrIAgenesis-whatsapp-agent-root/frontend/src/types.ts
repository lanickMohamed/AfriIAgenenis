export type AgentStatus = {
  state: 'online' | 'degraded' | 'offline';
  lastActivity: string | null;
  processedToday: number;
  openaiConfigured: boolean;
  whatsappConfigured: boolean;
  calendarConfigured: boolean;
};

export type Dashboard = {
  kpis: {
    prospects: number;
    qualified: number;
    appointments: number;
    conversionRate: number;
  };
  recentProspects: Prospect[];
  recentConversations: Conversation[];
  upcomingAppointments: Appointment[];
  agent: AgentStatus;
};

export type Prospect = {
  id: string;
  phone: string;
  name: string | null;
  company: string | null;
  industry: string | null;
  stage: string;
  score: number;
  intent: string | null;
  lastContactAt: string;
};

export type Conversation = {
  id: string;
  prospectId: string;
  phone: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'audio';
  content: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  prospectId: string;
  name: string | null;
  phone: string;
  meetingType: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  meetingLink: string | null;
};
