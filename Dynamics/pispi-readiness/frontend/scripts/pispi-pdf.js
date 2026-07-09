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

  // Palette sobre : noir/gris pour le texte, or uniquement en filet et en accents ponctuels.
  const INK      = [20, 20, 20];
  const INK_MUT  = [90, 90, 90];
  const GOLD     = [180, 140, 45];
  const LINE     = [190, 190, 190];
  const HAIRLINE = [225, 225, 225];

  let tierLabel, tierCode, recommendation, offerName, offerPrice, offerDesc;
  if (score >= 70) {
    tierLabel = 'CONFORME'; tierCode = 'NIVEAU I';
    recommendation = "L'institution presente un niveau de preparation satisfaisant au regard du referentiel PI-SPI. Il est recommande de proceder a un audit de validation finale afin de securiser la connexion avant l'echeance reglementaire.";
    offerName = 'Offre Bronze — Audit et Validation'; offerPrice = '150 000 FCFA';
    offerDesc = 'Validation finale, constitution du dossier de soumission BCEAO, rapport certifie.';
  } else if (score >= 40) {
    tierLabel = 'CONFORMITE PARTIELLE'; tierCode = 'NIVEAU II';
    recommendation = "Des ecarts significatifs ont ete releves. Des actions correctives sont necessaires dans les meilleurs delais. L'offre Gold permet une mise a niveau encadree sous 15 jours ouvres.";
    offerName = 'Offre Gold — Integration Assistee'; offerPrice = '500 000 FCFA';
    offerDesc = 'Integration technique complete, tests en environnement sandbox, accompagnement BCEAO.';
  } else {
    tierLabel = 'NON CONFORME'; tierCode = 'NIVEAU III';
    recommendation = "La situation presente un risque reglementaire eleve. Une mobilisation d'urgence est disponible sous 72 heures pour engager la mise en conformite.";
    offerName = 'Offre Platinum — Conformite Totale'; offerPrice = '750 000 FCFA';
    offerDesc = 'Mobilisation d\'urgence sous 72h, gouvernance complete, support sur 12 mois.';
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 20;
  const logoUrl = 'https://raw.githubusercontent.com/lanickMohamed/AfriIAgenenis/main/assets/images/logo.jpg';

  // ── En-tête institutionnel commun ─────────────────────────
  // Sobre : filet fin au milieu, titre au-dessus, sous-titre en dessous, symétrique gauche/droite.
  function drawHeader(logo, pageLabel) {
    if (logo) {
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
      doc.circle(M + 4.5, 12.5, 4.7, 'S');
      doc.addImage(logo, 'PNG', M, 8, 9, 9);
    }
    doc.setFont('times', 'bold'); doc.setFontSize(10); doc.setTextColor(...INK);
    doc.text('AFRIAGENESIS', logo ? M + 12 : M, 9.5);

    doc.setFont('courier', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...INK_MUT);
    doc.text('REF. ' + refNum, W - M, 9.5, { align: 'right' });

    doc.setDrawColor(...GOLD); doc.setLineWidth(0.6);
    doc.line(M, 13.5, W - M, 13.5);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...INK_MUT);
    doc.text('CEA CONSULTING SAS — CONSEIL EN CONFORMITE REGLEMENTAIRE', logo ? M + 12 : M, 18);
    doc.setFontSize(7);
    doc.text(pageLabel, W - M, 18, { align: 'right' });
  }

  // ── Pied de page institutionnel commun ────────────────────
  function drawFooter(pageNum) {
    doc.setDrawColor(...HAIRLINE); doc.setLineWidth(0.3);
    doc.line(M, H - 16, W - M, H - 16);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...INK_MUT);
    doc.text('Document confidentiel — usage strictement reserve au destinataire', M, H - 11);
    doc.text('+229 01 61 10 73 73  |  lanickconsult@gmail.com', M, H - 7);
    doc.text('Page ' + pageNum + '/3', W - M, H - 7, { align: 'right' });
  }

  // Ligne de "formulaire" : libellé à gauche (gris, petites majuscules), valeur à droite/alignée.
  function formRow(label, value, x, y, w, opts = {}) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...INK_MUT);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont(opts.font || 'helvetica', opts.style || 'normal'); doc.setFontSize(opts.size || 10);
    doc.setTextColor(...INK);
    doc.text(String(value), x, y + 6);
    doc.setDrawColor(...HAIRLINE); doc.setLineWidth(0.3);
    doc.line(x, y + 8.5, x + w, y + 8.5);
  }

  const addPages = async (logoDataUrl) => {
    const roundLogo = logoDataUrl ? await makeRoundImage(logoDataUrl, 240) : null;

    // ── PAGE 1 — PAGE DE GARDE ──────────────────────────────
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
    drawHeader(roundLogo, 'CONFIDENTIEL');

    let y = 46;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...INK_MUT);
    doc.text('RAPPORT D\'AUDIT', M, y); y += 9;
    doc.setFont('times', 'bold'); doc.setFontSize(24); doc.setTextColor(...INK);
    doc.text('Conformite Interoperabilite', M, y); y += 9;
    doc.text('du Systeme de Paiement Instantane', M, y); y += 3;
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
    doc.line(M, y + 4, M + 90, y + 4); y += 12;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...INK_MUT);
    doc.text("Referentiel PI-SPI — Banque Centrale des Etats de l'Afrique de l'Ouest (BCEAO)", M, y);
    y += 16;

    // Bloc "Fiche d'identification" — cadre rectangulaire, angles droits
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
    doc.rect(M, y, W - 2 * M, 40);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...INK);
    doc.text('FICHE D\'IDENTIFICATION', M + 5, y + 7);
    doc.setDrawColor(...HAIRLINE); doc.line(M, y + 10, W - M, y + 10);

    const colW1 = (W - 2 * M - 10) / 2;
    formRow('Institution evaluee', institution.length > 40 ? institution.substring(0, 40) + '…' : institution, M + 5, y + 18, colW1);
    formRow('Type d\'etablissement', type, M + 5, y + 30, colW1);
    formRow('Destinataire', contact, M + 15 + colW1, y + 18, colW1 - 10);
    formRow('Pays / Zone', pays, M + 15 + colW1, y + 30, colW1 - 10);
    y += 48;

    // Bloc "Résultat de l'évaluation" — présenté en table, pas en jauge circulaire
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
    doc.rect(M, y, W - 2 * M, 34);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...INK);
    doc.text('RESULTAT DE L\'EVALUATION', M + 5, y + 7);
    doc.setDrawColor(...HAIRLINE); doc.line(M, y + 10, W - M, y + 10);

    doc.setDrawColor(...HAIRLINE);
    doc.line(M + 55, y + 10, M + 55, y + 34);
    doc.line(M + 110, y + 10, M + 110, y + 34);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...INK_MUT);
    doc.text('SCORE OBTENU', M + 5, y + 16);
    doc.setFont('times', 'bold'); doc.setFontSize(20); doc.setTextColor(...INK);
    doc.text(score + ' / 100', M + 5, y + 28);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...INK_MUT);
    doc.text('CLASSIFICATION', M + 60, y + 16);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...INK);
    doc.text(tierCode, M + 60, y + 24);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(tierLabel, M + 60, y + 30);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...INK_MUT);
    doc.text('ECHEANCE RESTANTE', M + 115, y + 16);
    doc.setFont('times', 'bold'); doc.setFontSize(14); doc.setTextColor(...INK);
    doc.text(String(daysLeft) + ' jours', M + 115, y + 26);
    y += 42;

    // Encadré échéance réglementaire — filet gauche or, pas de fond coloré
    doc.setFillColor(...GOLD); doc.rect(M, y, 1.2, 22, 'F');
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
    doc.rect(M, y, W - 2 * M, 22);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...INK);
    doc.text('ECHEANCES REGLEMENTAIRES BCEAO', M + 6, y + 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...INK_MUT);
    doc.text('Banques et Etablissements de Monnaie Electronique : 30 septembre 2026', M + 6, y + 14);
    doc.text('Institutions de Microfinance (SFD) : 30 juin 2027', M + 6, y + 19);
    y += 30;

    doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(...INK_MUT);
    doc.text('Document genere le ' + dateStr + ' — Reference ' + refNum, M, y);

    drawFooter(1);

    // ── PAGE 2 — SYNTHESE EXECUTIVE ─────────────────────────
    doc.addPage();
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
    drawHeader(roundLogo, 'SYNTHESE EXECUTIVE');

    y = 26;
    doc.setFont('times', 'bold'); doc.setFontSize(15); doc.setTextColor(...INK);
    doc.text('I. Synthese Executive', M, y); y += 3;
    doc.setDrawColor(...HAIRLINE); doc.setLineWidth(0.3); doc.line(M, y, W - M, y); y += 9;

    // Tableau récapitulatif score / niveau
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
    doc.rect(M, y, W - 2 * M, 12);
    doc.setDrawColor(...HAIRLINE);
    doc.line(M + 45, y, M + 45, y + 12);
    doc.line(M + 100, y, M + 100, y + 12);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...INK_MUT);
    doc.text('SCORE GLOBAL', M + 4, y + 5);
    doc.text('NIVEAU', M + 49, y + 5);
    doc.text('APPRECIATION', M + 104, y + 5);
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(...INK);
    doc.text(score + '/100', M + 4, y + 10);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(tierCode, M + 49, y + 10);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(tierLabel, M + 104, y + 10);
    y += 20;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...INK);
    doc.text('Avis motive', M, y); y += 5;
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
    const recLines = doc.splitTextToSize(recommendation, W - 2 * M - 8);
    doc.rect(M, y, W - 2 * M, recLines.length * 4.6 + 6);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...INK);
    doc.text(recLines, M + 4, y + 6);
    y += recLines.length * 4.6 + 14;

    // Répartition par domaine — table à grille, pas de badges colorés
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...INK);
    doc.text('Repartition par domaine d\'evaluation', M, y); y += 5;

    const domains = [
      { label: 'Infrastructure technique', max: 60, ids: ['infra_api', 'infra_mtls', 'infra_oauth', 'infra_sandbox'] },
      { label: 'Conformite reglementaire', max: 30, ids: ['reg_dossier', 'reg_kyc', 'reg_sla', 'reg_incident'] },
      { label: 'Gouvernance et organisation', max: 10, ids: ['org_equipe', 'org_formation', 'org_budget'] },
    ];
    const tW = W - 2 * M;
    const c1 = tW * 0.46, c2 = tW * 0.16, c3 = tW * 0.16, c4 = tW * 0.22;
    const rowH = 8;

    doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
    doc.rect(M, y, tW, rowH);
    doc.setFillColor(245, 245, 245); doc.rect(M, y, tW, rowH, 'F');
    doc.setDrawColor(...LINE); doc.rect(M, y, tW, rowH);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...INK_MUT);
    doc.text('DOMAINE', M + 3, y + 5.5);
    doc.text('SCORE', M + c1 + 3, y + 5.5);
    doc.text('MAX.', M + c1 + c2 + 3, y + 5.5);
    doc.text('STATUT', M + c1 + c2 + c3 + 3, y + 5.5);
    y += rowH;

    domains.forEach((d, i) => {
      const ds = d.ids.reduce((a, id) => a + (scores[id] || 0), 0);
      const pct = Math.round((ds / d.max) * 100);
      const statut = pct >= 70 ? 'Conforme' : pct >= 40 ? 'Partiel' : 'A corriger';
      if (i % 2 === 1) { doc.setFillColor(250, 250, 250); doc.rect(M, y, tW, rowH, 'F'); }
      doc.setDrawColor(...HAIRLINE); doc.setLineWidth(0.3);
      doc.rect(M, y, tW, rowH);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...INK);
      doc.text(d.label, M + 3, y + 5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(String(ds), M + c1 + 3, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.text(String(d.max), M + c1 + c2 + 3, y + 5.5);
      doc.text(statut, M + c1 + c2 + c3 + 3, y + 5.5);
      y += rowH;
    });
    // Bordures verticales de la table
    doc.setDrawColor(...HAIRLINE); doc.setLineWidth(0.3);
    const tableTop = y - rowH * (domains.length + 1);
    [c1, c1 + c2, c1 + c2 + c3].forEach(off => doc.line(M + off, tableTop, M + off, y));
    y += 10;

    // Recommandation commerciale — présentée comme une ligne de devis, sobre
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
    doc.rect(M, y, W - 2 * M, 24);
    doc.setFillColor(...GOLD); doc.rect(M, y, 1.2, 24, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...INK_MUT);
    doc.text('PRESTATION RECOMMANDEE', M + 6, y + 6);
    doc.setFont('times', 'bold'); doc.setFontSize(10); doc.setTextColor(...INK);
    doc.text(offerName, M + 6, y + 13);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(offerPrice, W - M - 6, y + 13, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...INK_MUT);
    doc.text(doc.splitTextToSize(offerDesc, W - 2 * M - 12), M + 6, y + 19);
    y += 32;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...INK_MUT);
    doc.text('Contact : +229 01 61 10 73 73  |  lanickconsult@gmail.com', M, y);

    drawFooter(2);

    // ── PAGE 3 — DETAIL TECHNIQUE ────────────────────────────
    doc.addPage();
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
    drawHeader(roundLogo, 'ANNEXE TECHNIQUE');

    y = 26;
    doc.setFont('times', 'bold'); doc.setFontSize(15); doc.setTextColor(...INK);
    doc.text('II. Detail des Criteres d\'Evaluation', M, y); y += 3;
    doc.setDrawColor(...HAIRLINE); doc.setLineWidth(0.3); doc.line(M, y, W - M, y); y += 3;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...INK_MUT);
    doc.text(ALL_CRITERIA.length + ' criteres reglementaires et techniques evalues', M, y); y += 8;

    const cc1 = 20, cc2 = 88, cc3 = 38, cc4 = tW - cc1 - cc2 - cc3;
    doc.setFillColor(...INK); doc.rect(M, y, tW, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(255, 255, 255);
    doc.text('STATUT', M + 3, y + 5.5);
    doc.text('CRITERE', M + cc1 + 3, y + 5.5);
    doc.text('CATEGORIE', M + cc1 + cc2 + 3, y + 5.5);
    doc.text('POIDS', M + cc1 + cc2 + cc3 + cc4 - 3, y + 5.5, { align: 'right' });
    y += 8;
    const tableStart = y;

    ALL_CRITERIA.forEach((c, i) => {
      const ok = !!scores[c.id];
      if (i % 2 === 1) { doc.setFillColor(248, 248, 248); doc.rect(M, y, tW, 8, 'F'); }
      doc.setDrawColor(...HAIRLINE); doc.setLineWidth(0.3);
      doc.line(M, y + 8, W - M, y + 8);

      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      doc.setTextColor(...(ok ? [40, 100, 60] : [140, 40, 40]));
      doc.text(ok ? 'CONFORME' : 'ECART', M + 3, y + 5.5);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...INK);
      doc.text(doc.splitTextToSize(c.name, cc2 - 6)[0], M + cc1 + 3, y + 5.5);
      doc.setFontSize(7); doc.setTextColor(...INK_MUT);
      doc.text(c.cat, M + cc1 + cc2 + 3, y + 5.5);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...INK);
      doc.text(c.weight + ' pts', M + cc1 + cc2 + cc3 + cc4 - 3, y + 5.5, { align: 'right' });
      y += 8;
    });

    // Cadre et séparateurs verticaux de la table
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
    doc.rect(M, tableStart, tW, y - tableStart);
    doc.setDrawColor(...HAIRLINE); doc.setLineWidth(0.3);
    [cc1, cc1 + cc2, cc1 + cc2 + cc3].forEach(off => doc.line(M + off, tableStart, M + off, y));
    y += 10;

    // Bloc de validation formelle
    doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
    doc.rect(M, y, W - 2 * M, 22);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...INK_MUT);
    doc.text('ETABLI PAR', M + 5, y + 7);
    doc.text('DATE D\'ETABLISSEMENT', M + 90, y + 7);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...INK);
    doc.text('AfrIAgenesis® — Plateforme PI-SPI Readiness Checker™', M + 5, y + 15);
    doc.text(dateStr, M + 90, y + 15);

    drawFooter(3);

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