# AfrIA Marketing Team™ - Revenue OS

Plateforme SaaS pour automatiser la qualification commerciale et la prise de rendez-vous via WhatsApp avec IA autonome.

## Structure du projet

- **backend/** - API Express.js pour la gestion des prospects, conversations et intégrations
- **frontend/** - Interface React + Vite pour le pilotage en temps réel

## Déploiement sur Render

### Configuration requise

1. **Variables d'environnement backend** (à configurer dans Render):
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = PostgreSQL connection string
   - `FRONTEND_ORIGIN` = URL du frontend (ex: `https://afria-marketing-team.onrender.com`)
   - `OPENAI_API_KEY` = Clé API OpenAI
   - `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` = Tokens WhatsApp Cloud API
   - `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` = Identifiants Google Calendar (optionnel)

2. **Services Render**:
   - API backend: port 8080, healthcheck: `/`
   - Frontend: static site, redirection SPA

## Développement local

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

Accédez à `http://localhost:5173`

## Architecture

- **WhatsApp Agent**: Reçoit les messages via Cloud API, qualifie automatiquement
- **Dashboard**: Vue temps réel des prospects, conversations, rendez-vous
- **Calendar Integration**: Prend les RDV et les ajoute à Google Calendar
- **Mode souverain**: Tous les appels IA sont journalisés avec contrôle humain