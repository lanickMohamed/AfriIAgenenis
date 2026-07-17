# Guide de déploiement AfrIA Marketing Team™ sur Render

## Étapes de déploiement

### 1. Créer les services sur Render.com

#### Étape 1a: Service Backend (API)
1. Allez sur [render.com](https://render.com)
2. Créez un nouveau service Web
   - **Nom**: `afria-marketing-api`
   - **Repository**: `lanickmohamed/AfriIAgenenis`
   - **Branch**: `claude/afria-marketing-render-deploy-5kv38r`
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Root Directory**: `backend`

#### Étape 1b: Service Frontend (Site statique)
1. Créez un nouveau site statique
   - **Nom**: `afria-marketing-team`
   - **Repository**: `lanickmohamed/AfriIAgenenis`
   - **Branch**: `claude/afria-marketing-render-deploy-5kv38r`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

#### Étape 1c: Database PostgreSQL
1. Créez une nouvelle base PostgreSQL
   - **Nom**: `afriagenesis-db`
   - **Database**: `afriagenesis_db`
   - **User**: `afriagenesis_user`
   - **Region**: Ohio (ou votre région préférée)

### 2. Configurer les variables d'environnement

#### Pour le backend (`afria-marketing-api`):

```
NODE_ENV = production
FRONTEND_ORIGIN = https://afria-marketing-team.onrender.com
PORT = 8080
DATABASE_URL = [Copié depuis la DB PostgreSQL]
OPENAI_API_KEY = [Votre clé API OpenAI]
OPENAI_MODEL = gpt-4-mini
WHATSAPP_VERIFY_TOKEN = [Token de vérification WhatsApp]
WHATSAPP_ACCESS_TOKEN = [Token d'accès WhatsApp]
WHATSAPP_PHONE_NUMBER_ID = [ID du numéro WhatsApp]
WHATSAPP_APP_SECRET = [Secret de l'app WhatsApp]
GOOGLE_CLIENT_EMAIL = [Email du compte service Google]
GOOGLE_PRIVATE_KEY = [Clé privée Google]
```

### 3. Déployer avec render.yaml (alternatif)

Render détecte automatiquement `render.yaml` et configure les services selon ce fichier.

**Dans ce repo**:
- Le `render.yaml` à la racine configure tous les services
- Allez sur Render Dashboard → New → Blueprint → selectionnez ce repo
- Render créera automatiquement API, Frontend, et Database

### 4. Connecter le webhook WhatsApp

Une fois le backend en ligne:

1. Allez dans [Facebook Business Manager](https://business.facebook.com) → WhatsApp App Settings
2. Configurez le webhook:
   - **Callback URL**: `https://afria-marketing-api.onrender.com/webhooks/whatsapp`
   - **Verify Token**: La valeur de `WHATSAPP_VERIFY_TOKEN`
3. Subscrivez aux événements: `messages`, `message_status`, `message_template_status_update`

### 5. Tester le déploiement

#### Test 1: Vérifier l'API
```bash
curl https://afria-marketing-api.onrender.com/
```
Doit retourner une réponse 200.

#### Test 2: Vérifier le frontend
Allez sur `https://afria-marketing-team.onrender.com` - vous devriez voir le dashboard.

#### Test 3: Tester l'agent WhatsApp
1. Sur le dashboard, allez au formulaire "Tester la qualification commerciale"
2. Entrez:
   - **Numéro WhatsApp**: `+22901611073373` (ou votre numéro de test)
   - **Message**: `Bonjour, je dirige un restaurant à Cotonou. Je veux automatiser les commandes WhatsApp.`
3. Cliquez "Envoyer au moteur"
4. L'agent devrait répondre avec une qualification et un score

#### Test 4: Tester via WhatsApp réel
Envoyez un message WhatsApp au numéro configuré et attendez la réponse automatique.

## Troubleshooting

### Backend ne démarre pas
- Vérifiez les logs: `render.com → afria-marketing-api → Logs`
- Assurez-vous que `DATABASE_URL` est défini
- Assurez-vous que `FRONTEND_ORIGIN` correspond à votre URL frontend

### Frontend ne charge pas l'API
- Vérifiez que `FRONTEND_ORIGIN` dans le backend inclut `https://afria-marketing-team.onrender.com`
- Vérifiez les CORS dans les logs du backend
- L'URL de l'API doit être accessible publiquement

### Pas de réponse de l'agent
- Vérifiez que `OPENAI_API_KEY` est défini dans le backend
- Vérifiez que WhatsApp est configuré (`WHATSAPP_ACCESS_TOKEN`, etc.)
- Consultez les logs du backend pour les erreurs

## Architecture de sécurité

- **Mode souverain**: Tous les appels IA sont journalisés
- **Permissions minimales**: Le backend ne peut accéder qu'aux ressources nécessaires
- **Contrôle humain**: Les conversations peuvent être audit et les qualifications vérifiées
- **HTTPS obligatoire**: Toutes les communications sont chiffrées

## Coûts estimés (Render)

- Backend Web Service: $7/mois (Starter) - $12/mois (Standard)
- Static Frontend: Gratuit
- PostgreSQL Database: $15/mois (Starter)
- **Total**: ~$22-27/mois avant usage OpenAI/WhatsApp

## Support

Pour les problèmes:
1. Consultez les logs dans Render Dashboard
2. Vérifiez les variables d'environnement
3. Testez avec le simulateur du dashboard
