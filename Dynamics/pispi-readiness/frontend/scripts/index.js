const DEADLINE = new Date('2026-06-30T23:59:59');

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
  document.getElementById('btn-scroll-checker')?.addEventListener('click', () => {
    document.getElementById('checker').scrollIntoView({ behavior: 'smooth' });
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
  { id: 'infra_sandbox', name: 'Tests sandbox BCEAO réussis',        weight: 10, cat: 'Technique'     },
  { id: 'reg_dossier',   name: 'Dossier de connexion BCEAO soumis',  weight: 10, cat: 'Réglementaire' },
  { id: 'reg_kyc',       name: 'KYC & LCB-FT adapté PI-SPI',        weight: 10, cat: 'Réglementaire' },
  { id: 'reg_sla',       name: 'SLA < 10 secondes documenté',         weight:  5, cat: 'Réglementaire' },
  { id: 'reg_incident',  name: 'Plan de gestion des incidents',      weight:  5, cat: 'Réglementaire' },
  { id: 'org_equipe',    name: 'Équipe projet PI-SPI désignée',      weight:  5, cat: 'Gouvernance'   },
  { id: 'org_formation', name: 'Formation des équipes réalisée',     weight:  3, cat: 'Gouvernance'   },
  { id: 'org_budget',    name: "Budget d'intégration validé",        weight:  2, cat: 'Gouvernance'   },
];


// FIX 1 — toggle : e.preventDefault() bloque le double check natif du label
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
  // FIX 2 — innerHTML pour garder l'icône FA
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


function makeRoundImage(dataUrl, size) {
  const canvas = document.createElement('canvas');
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  return new Promise(resolve => {
    img.onload = () => {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

function generatePDF() {
  const institutionInput = document.getElementById('pdf-institution');
  const institution = institutionInput.value.trim();

  if (!institution) {
    institutionInput.style.borderColor = 'var(--danger)';
    institutionInput.focus();
    institutionInput.placeholder = 'Ce champ est obligatoire';
    setTimeout(() => {
      institutionInput.style.borderColor = '';
      institutionInput.placeholder = 'Ex : Banque de l\'Afrique Solidaire';
    }, 3000);
    return;
  }
  institutionInput.style.borderColor = '';

  const contact  = document.getElementById('pdf-contact').value.trim() || 'Direction Générale';
  const type     = document.getElementById('pdf-type').value;
  const pays     = document.getElementById('pdf-pays').value;
  const score    = getTotalScore();
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const daysLeft = Math.max(0, Math.floor((DEADLINE - now) / 86400000));
  const refNum   = 'PISPI-' + now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 9000) + 1000);

  let tierColor, tierLabel, tierBg, recommendation, offerName, offerPrice, offerDesc;
  if (score >= 70) {
    tierColor = [22,163,74]; tierBg = [220,252,231]; tierLabel = 'PRET — Conformite satisfaisante';
    recommendation = "Votre institution presente un bon niveau de preparation PI-SPI. Nous recommandons un audit de validation finale pour securiser la connexion avant le 30 juin 2026.";
    offerName = 'Bronze — Audit & Validation'; offerPrice = '250 000 FCFA';
    offerDesc = 'Validation finale, soumission dossier BCEAO, rapport certifie.';
  } else if (score >= 40) {
    tierColor = [180,83,9]; tierBg = [254,243,199]; tierLabel = 'PARTIEL — Lacunes significatives';
    recommendation = "Des actions correctives urgentes sont necessaires. Notre Offre Gold peut combler les ecarts en 15 jours ouvrables.";
    offerName = 'Gold — Integration Assistee'; offerPrice = '750 000 FCFA';
    offerDesc = 'Integration technique complete, tests sandbox valides, accompagnement BCEAO.';
  } else {
    tierColor = [185,28,28]; tierBg = [254,226,226]; tierLabel = 'CRITIQUE — Risque de sanction BCEAO';
    recommendation = "Situation d'urgence reglementaire. Mobilisation d'urgence disponible sous 72 heures.";
    offerName = 'Platinum — Conformite Totale'; offerPrice = '1 500 000 FCFA';
    offerDesc = 'Mobilisation urgence 72h, gouvernance complete, support 12 mois.';
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, M = 18;
  const logoUrl = 'https://raw.githubusercontent.com/lanickMohamed/AfriIAgenenis/main/assets/images/logo.jpg';

  // Dessine le header gold avec logo rond + texte sur toutes les pages
  // logoRound  : dataUrl PNG circulaire
  // logoSize   : taille mm du logo dans le header (grand sur p1, petit sur p2/p3)
  // headerText : texte à gauche après le logo
  // rightText  : texte à droite (ref ou numéro de page)
  function drawHeader(logoRound, logoSize, headerText, rightText) {
    const logoX    = M;
    const logoY    = (12 - logoSize) / 2;        // centré verticalement dans la barre de 12mm
    const textX    = M + logoSize + 3;            // texte juste après le logo + 3mm de gap
    const textY    = 8;

    doc.setFillColor(212, 168, 83);
    doc.rect(0, 0, W, 12, 'F');

    if (logoRound) {
      doc.addImage(logoRound, 'PNG', logoX, logoY, logoSize, logoSize);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(headerText, textX, textY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(rightText, W - M, textY, { align: 'right' });
  }

  const addPages = async (logoDataUrl) => {
    const roundLogo = logoDataUrl ? await makeRoundImage(logoDataUrl, 200) : null;

    // ── PAGE 1 ──────────────────────────────────────────────
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, 297, 'F');

    // header p1 : logo 10mm, texte "afrIAgenesis(r)", ref à droite
    drawHeader(roundLogo, 10, 'afrIAgenesis(r)', 'Ref: ' + refNum + '   |   CONFIDENTIEL');


    doc.setFont('helvetica', 'bold'); doc.setFontSize(32); doc.setTextColor(20, 20, 20);
    doc.text('RAPPORT DE', M, 38); doc.text('CONFORMITE', M, 52);
    doc.setTextColor(180, 120, 20); doc.text('PI-SPI', M, 66);
    doc.setDrawColor(212, 168, 83); doc.setLineWidth(1); doc.line(M, 72, 120, 72);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(80, 80, 80);
    doc.text('Plateforme Interoperable du Systeme de Paiement Instantane', M, 80);
    doc.text("Banque Centrale des Etats de l'Afrique de l'Ouest (BCEAO)", M, 87);

    const cx = 168, cy = 52, r = 24;
    doc.setFillColor(...tierBg); doc.circle(cx, cy, r, 'F');
    doc.setDrawColor(...tierColor); doc.setLineWidth(2); doc.circle(cx, cy, r, 'S');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(...tierColor);
    doc.text(String(score), cx, cy + 4, { align: 'center' });
    doc.setFontSize(8); doc.setTextColor(80, 80, 80); doc.text('/100', cx, cy + 11, { align: 'center' });
    doc.setFillColor(...tierColor); doc.roundedRect(cx - 20, cy + 16, 40, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(255, 255, 255);
    const tierShort = score >= 70 ? 'PRET' : score >= 40 ? 'PARTIEL' : 'CRITIQUE';
    doc.text(tierShort, cx, cy + 21, { align: 'center' });

    doc.setFillColor(248, 248, 248); doc.roundedRect(M, 96, W - 2 * M, 52, 3, 3, 'F');
    doc.setDrawColor(212, 168, 83); doc.setLineWidth(0.5); doc.line(M, 96, M, 148);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(180, 120, 20);
    doc.text('INSTITUTION EVALUEE', M + 6, 105);
    doc.setFontSize(13); doc.setTextColor(20, 20, 20);
    doc.text(institution.length > 45 ? institution.substring(0, 45) + '...' : institution, M + 6, 115);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
    doc.text(type + ' — ' + pays, M + 6, 122);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(180, 120, 20);
    doc.text('PREPARE POUR', M + 6, 133);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(20, 20, 20);
    doc.text(contact, M + 6, 141);

    doc.setFillColor(254, 226, 226); doc.roundedRect(M, 158, W - 2 * M, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(185, 28, 28);
    doc.text('DEADLINE REGLEMENTAIRE BCEAO : 30 juin 2026', M + 6, 166);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 20, 20);
    doc.text('Connexion obligatoire — ' + daysLeft + ' jours restants', M + 6, 173);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
    doc.text('Rapport genere le : ' + dateStr, M, 188);

    doc.setFillColor(212, 168, 83); doc.rect(0, 285, W, 12, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
    doc.text('+229 01 61 10 73 73  |  lanickconsult@gmail.com', W / 2, 293, { align: 'center' });

    // ── PAGE 2 ──────────────────────────────────────────────
    doc.addPage();
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, 297, 'F');

    drawHeader(roundLogo, 10, 'afrIAgenesis(r) — PI-SPI Readiness Checker', 'Page 2/3');

    let y = 22;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(20, 20, 20);
    doc.text('SYNTHESE EXECUTIVE', M, y); y += 5;
    doc.setDrawColor(212, 168, 83); doc.setLineWidth(0.8); doc.line(M, y, W - M, y); y += 8;

    doc.setFillColor(...tierBg); doc.roundedRect(M, y, W - 2 * M, 28, 3, 3, 'F');
    doc.setFillColor(...tierColor); doc.rect(M, y, 5, 28, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...tierColor);
    doc.text('SCORE GLOBAL DE CONFORMITE PI-SPI', M + 10, y + 9);
    doc.setFontSize(24); doc.setTextColor(20, 20, 20);
    doc.text(score + '/100', M + 10, y + 23);
    doc.setFontSize(10); doc.setTextColor(...tierColor);
    doc.text(tierLabel, M + 55, y + 23); y += 36;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(180, 120, 20);
    doc.text('VERDICT', M, y); y += 6;
    doc.setFillColor(252, 252, 248); doc.roundedRect(M, y, W - 2 * M, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40, 40, 40);
    doc.text(doc.splitTextToSize(recommendation, W - 2 * M - 10), M + 6, y + 7); y += 30;

    const domains = [
      { label: 'Infrastructure\ntechnique',  max: 60, ids: ['infra_api', 'infra_mtls', 'infra_oauth', 'infra_sandbox'] },
      { label: 'Conformite\nreglementaire',  max: 30, ids: ['reg_dossier', 'reg_kyc', 'reg_sla', 'reg_incident'] },
      { label: 'Gouvernance\norganisation',  max: 10, ids: ['org_equipe', 'org_formation', 'org_budget'] },
    ];
    const colW = (W - 2 * M - 8) / 3;
    domains.forEach((d, i) => {
      const ds  = d.ids.reduce((a, id) => a + (scores[id] || 0), 0);
      const pct = Math.round((ds / d.max) * 100);
      const col = pct >= 70 ? [22, 163, 74] : pct >= 40 ? [180, 83, 9] : [185, 28, 28];
      const bg  = pct >= 70 ? [220, 252, 231] : pct >= 40 ? [254, 243, 199] : [254, 226, 226];
      const ox  = M + i * (colW + 4);
      doc.setFillColor(...bg); doc.roundedRect(ox, y, colW, 30, 3, 3, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(...col);
      doc.text(ds + '/' + d.max, ox + colW / 2, y + 14, { align: 'center' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(80, 80, 80);
      doc.text(doc.splitTextToSize(d.label, colW - 4), ox + colW / 2, y + 22, { align: 'center' });
    }); y += 38;

    doc.setFillColor(255, 251, 235); doc.roundedRect(M, y, W - 2 * M, 26, 3, 3, 'F');
    doc.setDrawColor(212, 168, 83); doc.setLineWidth(0.8); doc.roundedRect(M, y, W - 2 * M, 26, 3, 3, 'S');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(180, 120, 20);
    doc.text(offerName, M + 8, y + 10);
    doc.setFontSize(10); doc.setTextColor(20, 20, 20); doc.text(offerPrice, W - M - 8, y + 10, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
    doc.text(offerDesc, M + 8, y + 20); y += 34;

    doc.setFillColor(212, 168, 83); doc.roundedRect(M, y, W - 2 * M, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
    doc.text('Contacter afrIAgenesis(r) maintenant', W / 2, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('+229 01 61 10 73 73  |  lanickconsult@gmail.com', W / 2, y + 15, { align: 'center' });

    doc.setFillColor(212, 168, 83); doc.rect(0, 285, W, 12, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
    doc.text('Page 2/3 — ' + dateStr, W - M, 293, { align: 'right' });

    // ── PAGE 3 ──────────────────────────────────────────────
    doc.addPage();
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, 297, 'F');

    drawHeader(roundLogo, 10, 'afrIAgenesis(r) — Rapport Technique', 'Page 3/3');

    y = 22;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(20, 20, 20);
    doc.text('RAPPORT TECHNIQUE DETAILLE', M, y); y += 8;
    doc.setDrawColor(212, 168, 83); doc.setLineWidth(0.8); doc.line(M, y, W - M, y); y += 8;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(180, 120, 20);
    doc.text("DETAIL DES " + ALL_CRITERIA.length + " CRITERES D'EVALUATION", M, y); y += 6;

    doc.setFillColor(30, 30, 30); doc.rect(M, y, W - 2 * M, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(255, 255, 255);
    doc.text('STATUT', M + 4, y + 5.5);
    doc.text('CRITERE', M + 32, y + 5.5);
    doc.text('CATEGORIE', M + 122, y + 5.5);
    doc.text('POIDS', W - M - 12, y + 5.5); y += 8;

    ALL_CRITERIA.forEach((c, i) => {
      const ok = !!scores[c.id];
      doc.setFillColor(...(i % 2 === 0 ? [250, 250, 250] : [255, 255, 255]));
      doc.rect(M, y, W - 2 * M, 9, 'F');
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2); doc.line(M, y + 9, W - M, y + 9);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
      if (ok) { doc.setTextColor(22, 163, 74);  doc.text('CONFORME', M + 4, y + 6); }
      else    { doc.setTextColor(185, 28, 28);  doc.text('GAP',      M + 4, y + 6); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(30, 30, 30);
      doc.text(c.name, M + 32, y + 6);
      doc.setFontSize(7); doc.setTextColor(100, 100, 100); doc.text(c.cat, M + 122, y + 6);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(180, 120, 20);
      doc.text(c.weight + 'pts', W - M - 14, y + 6); y += 9;
    });

    doc.setFillColor(212, 168, 83); doc.rect(0, 285, W, 12, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
    doc.text('afrIAgenesis(r) | CEA Consulting SAS', M, 293);
    doc.text('Page 3/3 — ' + dateStr, W - M, 293, { align: 'right' });

    const filename = 'PISPI-Rapport-' + institution.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30) + '-' + now.getFullYear() + '.pdf';
    doc.save(filename);
    closePdfModal();
  };

  fetch(logoUrl)
    .then(r => r.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => addPages(reader.result);
      reader.onerror  = () => addPages(null);
      reader.readAsDataURL(blob);
    })
    .catch(() => addPages(null));
}


const CHAT_KB = {
  'pi-spi':   "PI-SPI est l'infrastructure de paiement instantané BCEAO permettant des virements 24h/7j en moins de 5 secondes dans l'espace UEMOA.",
  'concerne': "122 institutions sont concernées : 59 banques, 9 EME, 11 SFD et 1 Établissement de Paiement dans les 8 pays UEMOA.",
  'sanction': "Les institutions non connectées au 30 juin 2026 s'exposent à des sanctions administratives et une suspension d'agrément.",
  'delai':    "Une intégration complète prend 3 à 6 semaines. L'offre Gold afrIAgenesis® peut la ramener à 15 jours ouvrables.",
  'cout':     "Offres dès 250 000 FCFA (Bronze), 750 000 FCFA (Gold), 1 500 000 FCFA (Platinum).",
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