const DEADLINE = new Date('2026-09-30T23:59:59');

function updateCountdown() {
  const now  = new Date();
  const diff = DEADLINE - now;
  if (diff <= 0) {
    document.getElementById('nav-countdown').textContent = 'DÉLAI DÉPASSÉ';
    document.getElementById('countdown-days').textContent = '0';
    return;
  }
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);
  const pad   = (n) => String(n).padStart(2, '0');
  document.getElementById('nav-countdown').textContent =
    `J-${days} ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  document.getElementById('countdown-days').textContent = days;
}
updateCountdown();
setInterval(updateCountdown, 1000);


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-scroll-checker')?.forEach(el =>{
    el.addEventListener('click', () => {
      document.getElementById('checker').scrollIntoView({ behavior: 'smooth' });
    });
  });
  document.getElementById('btn-scroll-offres')?.addEventListener('click', () => {
    document.getElementById('offres').scrollIntoView({ behavior: 'smooth' });
  });


  document.addEventListener('click', (e) => {
    const panel = document.getElementById('chatbot-panel');
    const fab   = document.getElementById('chatbot-fab');
    if (panel.classList.contains('open') && !panel.contains(e.target) && !fab.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
});


let currentStep = 1;
const TOTAL_STEPS = 3;
let scores = {};

const STEP_TITLES = [
  'Étape 1 / 3 — Infrastructure technique',
  'Étape 2 / 3 — Conformité réglementaire',
  'Étape 3 / 3 — Organisation & gouvernance',
];

const ALL_CRITERIA = [
  { id: 'infra_api',     name: 'Intégration API REST PI-SPI',       weight: 20, cat: 'Technique'     },
  { id: 'infra_mtls',    name: 'Certificat mTLS déployé',            weight: 15, cat: 'Technique'     },
  { id: 'infra_oauth',   name: 'OAuth 2.0 Client Credentials',       weight: 15, cat: 'Technique'     },
  { id: 'infra_sandbox', name: ' Tests sandbox BCEAO réussis',        weight: 10, cat: 'Technique'     },
  { id: 'reg_dossier',   name: 'Dossier de connexion BCEAO soumis',  weight: 10, cat: 'Réglementaire' },
  { id: 'reg_kyc',       name: 'KYC & LCB-FT adapté PI-SPI',        weight: 10, cat: 'Réglementaire' },
  { id: 'reg_sla',       name: 'SLA < 10 secondes documenté',         weight:  5, cat: 'Réglementaire' },
  { id: 'reg_incident',  name: 'Plan de gestion des incidents',      weight:  5, cat: 'Réglementaire' },
  { id: 'org_equipe',    name: 'Équipe projet PI-SPI désignée',      weight:  5, cat: 'Gouvernance'   },
  { id: 'org_formation', name: 'Formation des équipes réalisée',     weight:  3, cat: 'Gouvernance'   },
  { id: 'org_budget',    name: "Budget d'intégration validé",        weight:  2, cat: 'Gouvernance'   },
];



function toggle(e, label, id, weight) {
  e.preventDefault();
  label.classList.toggle('checked');
  if (label.classList.contains('checked')) {
    scores[id] = weight;
  } else {
    delete scores[id];
  }
}

function getTotalScore() {
  return Object.values(scores).reduce((a, b) => a + b, 0);
}

function updateProgress(step) {
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = `Étape ${step} sur ${TOTAL_STEPS}`;
  document.getElementById('step-title').textContent = STEP_TITLES[step - 1] || 'Résultats';
}

function nextStep() {
  document.getElementById('step-' + currentStep).classList.remove('active');
  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    document.getElementById('step-' + currentStep).classList.add('active');
    document.getElementById('btn-prev').style.display = 'inline-flex';
    if (currentStep === TOTAL_STEPS) {
      // FIX 2 — innerHTML pour garder l'icône FA dans le bouton
      document.getElementById('btn-next').innerHTML = 'Voir mes résultats <i class="fa-solid fa-arrow-right"></i>';
    }
    updateProgress(currentStep);
  } else {
    showResults();
  }
}

function prevStep() {
  document.getElementById('step-' + currentStep).classList.remove('active');
  currentStep--;
  document.getElementById('step-' + currentStep).classList.add('active');
  if (currentStep === 1) document.getElementById('btn-prev').style.display = 'none';
  // FIX 2 — innerHTML pour garder l'icône FA dans le bouton
  document.getElementById('btn-next').innerHTML = 'Suivant <i class="fa-solid fa-arrow-right"></i>';
  updateProgress(currentStep);
}

function showResults() {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    document.getElementById('step-' + i)?.classList.remove('active');
  }
  document.getElementById('checker-nav').style.display  = 'none';
  document.getElementById('result-panel').style.display = 'block';
  document.getElementById('step-title').textContent     = 'Votre diagnostic PI-SPI';
  document.getElementById('progress-fill').style.width  = '100%';
  document.getElementById('progress-label').textContent = 'Analyse complète';

  const score    = getTotalScore();
  const daysLeft = Math.max(0, Math.floor((DEADLINE - new Date()) / 86400000));
  const ringFill = document.getElementById('ring-fill');
  const circum   = 427;

  let ringColor = '#EF4444';
  if (score >= 70)      ringColor = '#22C55E';
  else if (score >= 40) ringColor = '#F59E0B';
  ringFill.style.stroke = ringColor;

  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + 2, score);
    document.getElementById('score-display').textContent = current;
    ringFill.style.strokeDashoffset = circum - (current / 100) * circum;
    if (current >= score) clearInterval(timer);
  }, 20);

  // FIX 2 — innerHTML avec icônes FA à la place des emojis
  const verdictBox = document.getElementById('verdict-box');
  if (score >= 70) {
    verdictBox.className = 'result-verdict verdict-pret';
    verdictBox.innerHTML = `
      <div class="verdict-title" style="color:var(--success)">
        <i class="fa-solid fa-circle-check"></i> Prêt pour la connexion PI-SPI
      </div>
      <div class="verdict-text">Votre institution présente un niveau de préparation satisfaisant. Nous pouvons vous accompagner pour la validation finale et la soumission du dossier BCEAO.</div>`;
  } else if (score >= 40) {
    verdictBox.className = 'result-verdict verdict-partiel';
    verdictBox.innerHTML = `
      <div class="verdict-title" style="color:var(--warning)">
        <i class="fa-solid fa-triangle-exclamation"></i> Préparation partielle — Action urgente requise
      </div>
      <div class="verdict-text">Des lacunes importantes subsistent. Avec ${daysLeft} jours restants, une intervention spécialisée est nécessaire. Notre offre Gold peut combler les écarts en 15 jours ouvrables.</div>`;
  } else {
    verdictBox.className = 'result-verdict verdict-critique';
    verdictBox.innerHTML = `
      <div class="verdict-title" style="color:var(--danger)">
        <i class="fa-solid fa-circle-xmark"></i> Situation critique — Risque de sanction BCEAO
      </div>
      <div class="verdict-text">Votre institution n'est pas prête pour PI-SPI. Sans intervention immédiate, vous risquez des sanctions et une suspension d'agrément. Notre équipe peut mobiliser une réponse d'urgence en 72h.</div>`;
  }

  // FIX 2 — icônes FA dans la gaps list
  const gapsList = document.getElementById('gaps-list');
  gapsList.innerHTML = '';
  ALL_CRITERIA.forEach((c) => {
    const li = document.createElement('li');
    if (scores[c.id]) {
      li.className = 'gap-ok';
      li.innerHTML = `<span class="gap-icon"><i class="fa-solid fa-check"></i></span> ${c.name} — <span style="color:var(--success)">Conforme</span>`;
    } else {
      li.innerHTML = `<span class="gap-icon"><i class="fa-solid fa-triangle-exclamation"></i></span> ${c.name} — <span style="color:var(--warning)">Action requise</span>`;
    }
    gapsList.appendChild(li);
  });
}

function resetChecker() {
  scores = {};
  currentStep = 1;
  document.getElementById('result-panel').style.display = 'none';
  document.getElementById('checker-nav').style.display  = 'flex';
  document.getElementById('btn-prev').style.display     = 'none';

  document.getElementById('btn-next').innerHTML = 'Suivant <i class="fa-solid fa-arrow-right"></i>';
  document.querySelectorAll('.criteria-item').forEach((el) => el.classList.remove('checked'));
  document.getElementById('step-1').classList.add('active');
  for (let i = 2; i <= TOTAL_STEPS; i++) {
    document.getElementById('step-' + i).classList.remove('active');
  }
  updateProgress(1);
}


function openPdfModal()  { document.getElementById('pdf-modal').style.display = 'flex'; }
function closePdfModal() { document.getElementById('pdf-modal').style.display = 'none'; }




const CHAT_KB = {
  'pi-spi':   "PI-SPI est l'infrastructure de paiement instantané BCEAO permettant des virements 24h/7j en moins de 5 secondes dans l'espace UEMOA.",
  'concerne': "154 institutions sont concernées : 59 banques, 9 EME, 11 SFD et 1 Établissement de Paiement dans les 8 pays UEMOA.",
  'delai':    "Une intégration complète prend 3 à 6 semaines. L'offre Gold afrIAgenesis® peut la ramener à 15 jours ouvrables.",
  'cout':     "Offres dès 150 000 FCFA (Bronze), 500 000 FCFA (Gold), 750 000 FCFA (Platinum).",
  'mtls':     "Oui, mTLS est obligatoire. Il requiert un certificat client avec votre clientId obtenu sur developer.pispi.bceao.int.",
  'default':  "Contactez notre équipe : +229 01 61 10 73 73 ou lanickconsult@gmail.com.",
};

function toggleChat() {
  document.getElementById('chatbot-panel').classList.toggle('open');
}

function ask(q) {
  document.getElementById('chat-input').value = q;
  sendChat();
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const q = input.value.trim();
  if (!q) return;
  const msgs = document.getElementById('chat-messages');
  const userMsg = document.createElement('div');
  userMsg.className = 'msg msg-user';
  userMsg.textContent = q;
  msgs.appendChild(userMsg);
  input.value = '';
  setTimeout(() => {
    const qLow = q.toLowerCase();
    let answer = CHAT_KB.default;
    if      (qLow.includes('pi-spi') || qLow.includes("qu'est"))   answer = CHAT_KB['pi-spi'];
    else if (qLow.includes('concern') || qLow.includes('qui'))     answer = CHAT_KB['concerne'];
    else if (qLow.includes('sanction') || qLow.includes('risque')) answer = CHAT_KB['sanction'];
    else if (qLow.includes('délai')   || qLow.includes('temps'))   answer = CHAT_KB['delai'];
    else if (qLow.includes('coût')    || qLow.includes('fcfa'))    answer = CHAT_KB['cout'];
    else if (qLow.includes('mtls')    || qLow.includes('certif'))  answer = CHAT_KB['mtls'];
    const botMsg = document.createElement('div');
    botMsg.className = 'msg msg-bot';
    botMsg.textContent = answer;
    msgs.appendChild(botMsg);
    msgs.scrollTop = msgs.scrollHeight;
  }, 600);
  msgs.scrollTop = msgs.scrollHeight;
}