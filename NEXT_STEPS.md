# Prochaines étapes : Déploiement en production

## État actuel
✅ Code préparé et prêt au déploiement
✅ Backend compilé et testé
✅ Frontend compilé et testé  
✅ PR #2 créée avec tous les fichiers
✅ Configuration Render.yaml complète
✅ Script de test préparé

## Option 1 : Déployer sur Render (recommandé - tel que demandé)

### Étapes rapides (5 minutes)

1. **Aller sur https://render.com**

2. **Créer un nouveau service Blueprint**
   - Cliquez "New" → "Blueprint"
   - Sélectionnez le repo: `lanickmohamed/AfriIAgenenis`
   - Branch: `claude/afria-marketing-render-deploy-5kv38r`
   - Render détecte automatiquement `render.yaml` et configure tous les services

3. **Configurer les variables d'environnement requis**
   Dans le Dashboard Render → afria-marketing-api → Environment:
   
   ```
   OPENAI_API_KEY = [Votre clé API OpenAI - sk-...]
   WHATSAPP_VERIFY_TOKEN = [Votre token WhatsApp]
   WHATSAPP_ACCESS_TOKEN = [Votre token d'accès]
   WHATSAPP_PHONE_NUMBER_ID = [ID du numéro]
   WHATSAPP_APP_SECRET = [Secret de l'app]
   ```

4. **Attendre le déploiement**
   - API (backend): ~2 minutes
   - Frontend: ~1 minute
   - Database: ~1 minute
   - Total: ~5 minutes

5. **Récupérer les URLs**
   - Frontend: `https://afria-marketing-team.onrender.com`
   - API: `https://afria-marketing-api.onrender.com`

6. **Tester le déploiement**
   ```bash
   chmod +x test-deployment.sh
   ./test-deployment.sh https://afria-marketing-team.onrender.com
   ```

---

## Option 2 : Déployer sur Vercel (plus rapide - alternative)

Si vous préférez un déploiement ultra-rapide (30 secondes):

1. **Aller sur https://vercel.com** et se connecter
2. **Importer le repo GitHub**: 
   - "Add New..." → "Project"
   - Sélectionnez `lanickMohamed/AfriIAgenenis`
   - Confirm l'import
3. **Vercel détecte** `vercel.json` et configure automatiquement
4. **URL finale**: `https://afriiagenenis.vercel.app` (ou votre custom domain)
5. **Tester**: `./test-deployment.sh https://afriiagenenis.vercel.app`

**Note**: Vercel fonctionne avec Node.js et React - parfait pour ce projet.

---

## Configuration WhatsApp après déploiement

Une fois déployé, il faut connecter WhatsApp Cloud API:

1. Allez dans **Facebook Business Manager → WhatsApp App Settings**
2. **Webhook Settings**:
   - Callback URL: `https://afria-marketing-api.onrender.com/webhooks/whatsapp`
   - Verify Token: La valeur que vous avez définie dans `WHATSAPP_VERIFY_TOKEN`
3. **Subscribe aux événements**:
   - ✓ messages
   - ✓ message_status
   - ✓ message_template_status_update

---

## Vérification de production

### Checklist avant de déclarer "live"

- [ ] URL du frontend chargeable
- [ ] Dashboard accessible (GET `/dashboard`)
- [ ] Simulateur fonctionne
- [ ] Test message → agent répond
- [ ] Logs du backend sans erreurs
- [ ] Database connectée correctement
- [ ] Variables d'environnement configurées

### Commande de test complète

```bash
# Une fois déployé, testez avec:
bash test-deployment.sh https://afria-marketing-team.onrender.com

# Sortie attendue:
# ✅ Backend opérationnel
# ✅ Dashboard accessible  
# ✅ Agent a répondu
# ✅ Frontend accessible
```

---

## Limites actuelles (à configurer)

Sans configuration :
- ❌ Qualifications IA (besoin OPENAI_API_KEY)
- ❌ Envoi de messages WhatsApp (besoin tokens)
- ❌ Synchronisation Google Calendar (optionnel)

Avec configuration minimale (OPENAI_API_KEY):
- ✅ Dashboard fonctionnel
- ✅ Simulateur IA opérationnel
- ✅ Audit logging actif

---

## Support

**Problèmes courants**:

```
"Backend ne répond pas"
→ Vérifiez que DATABASE_URL est défini dans Render

"CORS error au frontend"  
→ Vérifiez que FRONTEND_ORIGIN = https://afria-marketing-team.onrender.com

"Agent ne répond pas"
→ Vérifiez que OPENAI_API_KEY est défini

"Database error"
→ Attendez 1 minute après création, puis redémarrez le backend
```

Pour les logs détaillés, allez dans:
**Render Dashboard → afria-marketing-api → Logs**

---

## Prochaines étapes après déploiement

1. ✅ Déployer (vous êtes ici)
2. 🔄 Configurer WhatsApp Cloud API
3. 🔄 Tester avec des prospects réels
4. 🔄 Peaufiner les prompts IA
5. 🔄 Activer le pricing PME (après FDC)
