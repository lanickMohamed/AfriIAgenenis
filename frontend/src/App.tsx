import React, { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  Activity,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  Settings,
  Sparkles,
  Users
} from 'lucide-react';
import { api } from './api';
import type { Dashboard } from './types';

const initialDashboard: Dashboard = {
  kpis: { prospects: 0, qualified: 0, appointments: 0, conversionRate: 0 },
  recentProspects: [],
  recentConversations: [],
  upcomingAppointments: [],
  agent: {
    state: 'offline',
    lastActivity: null,
    processedToday: 0,
    openaiConfigured: false,
    whatsappConfigured: false,
    calendarConfigured: false
  }
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }).format(new Date(value));
}

function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    new: 'Nouveau', qualified: 'Qualifié', appointment_proposed: 'RDV proposé',
    appointment_booked: 'RDV confirmé', won: 'Client', lost: 'Perdu'
  };
  return labels[stage] || stage;
}

export default function App() {
  const [dashboard, setDashboard] = useState<Dashboard>(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('+22901611073373');
  const [message, setMessage] = useState("Bonjour, je dirige un restaurant à Cotonou. Je veux automatiser les commandes WhatsApp et prendre rendez-vous.");
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const loadDashboard = async () => {
    try {
      setError('');
      const data = await api.dashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
    const timer = window.setInterval(() => void loadDashboard(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const statusText = useMemo(() => {
    if (dashboard.agent.state === 'online') return 'Agent opérationnel';
    if (dashboard.agent.state === 'degraded') return 'Configuration partielle';
    return 'Agent hors ligne';
  }, [dashboard.agent.state]);

  const simulate = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!phone.trim() || !message.trim()) return;
    try {
      setSending(true);
      setReply('');
      const result = await api.simulateMessage(phone.trim(), message.trim());
      setReply(result.reply);
      await loadDashboard();
    } catch (err) {
      setReply(err instanceof Error ? err.message : 'Erreur lors de la simulation');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div><strong>afrIAgenesis®</strong><span>Revenue OS</span></div>
        </div>
        <nav>
          <a className="active"><LayoutDashboard size={19}/> Pilotage</a>
          <a><Users size={19}/> Prospects</a>
          <a><MessageCircle size={19}/> Conversations</a>
          <a><CalendarClock size={19}/> Rendez-vous</a>
          <a><Bot size={19}/> Agent IA</a>
          <a><Settings size={19}/> Paramètres</a>
        </nav>
        <div className="sidebar-card">
          <Sparkles size={21}/>
          <strong>Mode souverain</strong>
          <span>Journalisation, contrôle humain et permissions minimales activés.</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">CENTRE DE COMMANDE COMMERCIAL</p>
            <h1>Agent WhatsApp autonome</h1>
          </div>
          <div className="topbar-actions">
            <label className="search"><Search size={18}/><input placeholder="Rechercher…" /></label>
            <button className="icon-button" onClick={() => void loadDashboard()} aria-label="Actualiser"><RefreshCw size={18}/></button>
            <div className={`status-pill ${dashboard.agent.state}`}><span></span>{statusText}</div>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <section className="kpi-grid">
          <Kpi icon={<Users/>} title="Prospects" value={dashboard.kpis.prospects} note="Base active" />
          <Kpi icon={<CheckCircle2/>} title="Qualifiés" value={dashboard.kpis.qualified} note="Besoins identifiés" />
          <Kpi icon={<CalendarClock/>} title="Rendez-vous" value={dashboard.kpis.appointments} note="Confirmés" />
          <Kpi icon={<CircleDollarSign/>} title="Conversion" value={`${dashboard.kpis.conversionRate}%`} note="Prospect → RDV" />
        </section>

        <section className="content-grid">
          <div className="panel prospects-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">PIPELINE TEMPS RÉEL</p><h2>Prospects récents</h2></div>
              <button className="text-button">Tout afficher <ChevronRight size={16}/></button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Contact</th><th>Entreprise</th><th>Étape</th><th>Score</th><th>Dernier contact</th></tr></thead>
                <tbody>
                  {dashboard.recentProspects.map((prospect) => (
                    <tr key={prospect.id}>
                      <td><strong>{prospect.name || prospect.phone}</strong><span>{prospect.industry || 'Secteur non précisé'}</span></td>
                      <td>{prospect.company || '—'}</td>
                      <td><span className={`stage stage-${prospect.stage}`}>{stageLabel(prospect.stage)}</span></td>
                      <td><div className="score"><span style={{width: `${prospect.score}%`}}></span></div><small>{prospect.score}/100</small></td>
                      <td>{formatDate(prospect.lastContactAt)}</td>
                    </tr>
                  ))}
                  {!loading && dashboard.recentProspects.length === 0 && <tr><td colSpan={5} className="empty">Aucun prospect pour le moment.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel agent-panel">
            <div className="agent-orb"><Bot size={34}/></div>
            <p className="eyebrow">ÉTAT DE L'AGENT</p>
            <h2>{statusText}</h2>
            <p className="muted">{dashboard.agent.processedToday} conversation(s) traitée(s) aujourd'hui.</p>
            <div className="checks">
              <Check label="Intelligence OpenAI" ok={dashboard.agent.openaiConfigured}/>
              <Check label="WhatsApp Cloud API" ok={dashboard.agent.whatsappConfigured}/>
              <Check label="Google Calendar" ok={dashboard.agent.calendarConfigured}/>
            </div>
            <div className="activity-line"><Activity size={17}/> Dernière activité : {dashboard.agent.lastActivity ? formatDate(dashboard.agent.lastActivity) : 'aucune'}</div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel simulator-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">BAC À SABLE</p><h2>Tester la qualification commerciale</h2></div>
              <Headphones size={23}/>
            </div>
            <form onSubmit={simulate}>
              <div className="field-row">
                <label>Numéro WhatsApp<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
                <label>Message du prospect<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}/></label>
              </div>
              <button className="primary-button" disabled={sending}>{sending ? 'Analyse en cours…' : <><Send size={17}/> Envoyer au moteur</>}</button>
            </form>
            {reply && <div className="agent-reply"><div className="avatar"><Bot size={18}/></div><p>{reply}</p></div>}
          </div>

          <div className="panel appointments-panel">
            <div className="panel-heading"><div><p className="eyebrow">AGENDA</p><h2>Prochains rendez-vous</h2></div></div>
            <div className="appointment-list">
              {dashboard.upcomingAppointments.map((appointment) => (
                <article key={appointment.id}>
                  <div className="date-box"><strong>{new Date(appointment.scheduledAt).getDate()}</strong><span>{new Intl.DateTimeFormat('fr-FR',{month:'short'}).format(new Date(appointment.scheduledAt))}</span></div>
                  <div><strong>{appointment.name || appointment.phone}</strong><span>{appointment.meetingType} · {appointment.durationMinutes} min</span></div>
                </article>
              ))}
              {dashboard.upcomingAppointments.length === 0 && <p className="empty">Aucun rendez-vous planifié.</p>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({icon, title, value, note}:{icon:React.ReactNode,title:string,value:string|number,note:string}) {
  return <article className="kpi-card"><div className="kpi-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong><small>{note}</small></div></article>;
}

function Check({label, ok}:{label:string,ok:boolean}) {
  return <div className="check-row"><span className={ok ? 'ok' : 'not-ok'}>{ok ? '✓' : '!'}</span><span>{label}</span><small>{ok ? 'Configuré' : 'À configurer'}</small></div>;
}