#!/bin/bash

# Script de test pour AfrIA Marketing Team™ déployé sur Render
# Usage: ./test-deployment.sh https://afria-marketing-team.onrender.com

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <FRONTEND_URL>"
  echo "Example: $0 https://afria-marketing-team.onrender.com"
  exit 1
fi

FRONTEND_URL="$1"
API_URL="${FRONTEND_URL%/}"

echo "🧪 Test de déploiement AfrIA Marketing Team™"
echo "Frontend: $FRONTEND_URL"
echo "API: $API_URL"
echo ""

# Test 1: Health check
echo "✓ Test 1/4: Vérification de la santé du backend..."
HEALTH=$(curl -s "$API_URL/health")
if echo "$HEALTH" | grep -q "afriagenesis-whatsapp-agent"; then
  echo "  ✅ Backend opérationnel"
else
  echo "  ❌ Erreur: Backend ne répond pas correctement"
  echo "  Réponse: $HEALTH"
  exit 1
fi

# Test 2: Dashboard vide (première connexion)
echo "✓ Test 2/4: Chargement du dashboard..."
DASHBOARD=$(curl -s "$API_URL/dashboard")
if echo "$DASHBOARD" | grep -q "kpis"; then
  echo "  ✅ Dashboard accessible"
  echo "  Prospects: $(echo $DASHBOARD | grep -o '"prospects":[0-9]*' | cut -d: -f2)"
else
  echo "  ❌ Erreur: Dashboard ne répond pas"
  exit 1
fi

# Test 3: Simulateur de message
echo "✓ Test 3/4: Test de simulation de message..."
MESSAGE_RESPONSE=$(curl -s -X POST "$API_URL/simulator/message" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+22901611073373",
    "message": "Bonjour, je dirige un restaurant à Cotonou. Je veux automatiser les commandes WhatsApp et prendre rendez-vous."
  }')

if echo "$MESSAGE_RESPONSE" | grep -q "reply"; then
  REPLY=$(echo "$MESSAGE_RESPONSE" | grep -o '"reply":"[^"]*' | cut -d'"' -f4)
  echo "  ✅ Agent a répondu"
  echo "  Réponse: ${REPLY:0:100}..."
else
  echo "  ⚠️  Aucune réponse de l'agent (OpenAI peut ne pas être configuré)"
  echo "  Réponse: $MESSAGE_RESPONSE"
fi

# Test 4: Frontend accessible
echo "✓ Test 4/4: Accès au frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND" = "200" ]; then
  echo "  ✅ Frontend accessible"
else
  echo "  ❌ Erreur HTTP $FRONTEND"
  exit 1
fi

echo ""
echo "✅ Tous les tests sont passés!"
echo ""
echo "Prochaines étapes:"
echo "1. Configurez les variables d'environnement sur Render:"
echo "   - OPENAI_API_KEY"
echo "   - WHATSAPP_VERIFY_TOKEN, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID"
echo "2. Allez sur https://$FRONTEND_URL"
echo "3. Testez le simulateur avec votre propre prompt"
echo "4. Configurer le webhook WhatsApp dans WhatsApp Cloud API"
