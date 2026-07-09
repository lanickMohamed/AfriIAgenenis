function cover() {
  const logo       = 'https://raw.githubusercontent.com/lanickMohamed/AfriIAgenenis/main/assets/images/logo.jpg';
  const text       = 'Chargement du diagnostic PI-SPI...';
  const entreprise = 'afrIAgenesis®';

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap');

    #cover-overlay {
      position:        fixed;
      inset:           0;
      background:      #0A0E1A;
      display:         flex;
      flex-direction:  column;
      align-items:     center;
      justify-content: center;
      z-index:         99999;
      animation:       coverSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      font-family:     'Space Grotesk', sans-serif;
    }

    #cover-overlay.hide {
      animation: coverSlideOut 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    @keyframes coverSlideIn {
      from { transform: translateY(40px); opacity: 0; }
      to   { transform: translateY(0);   opacity: 1; }
    }

    @keyframes coverSlideOut {
      from { transform: translateY(0);     opacity: 1; }
      to   { transform: translateY(-40px); opacity: 0; }
    }

    #cover-spinner-wrap {
      position:        relative;
      width:           110px;
      height:          110px;
      display:         flex;
      align-items:     center;
      justify-content: center;
    }

    #cover-logo {
      width:         64px;
      height:        64px;
      object-fit:    cover;
      border-radius: 50%;
      border:        2px solid rgba(212, 168, 83, 0.3);
    }

    #cover-svg {
      position:  absolute;
      inset:     0;
      width:     100%;
      height:    100%;
      animation: coverSpin 1.2s linear infinite;
    }

    @keyframes coverSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    #cover-text {
      margin-top:     20px;
      font-size:      13px;
      font-weight:    500;
      color:          #8892A4;
      letter-spacing: 0.3px;
      font-family:    'Space Grotesk', sans-serif;
    }

    #cover-badge {
      margin-top:     12px;
      font-size:      10px;
      font-weight:    500;
      color:          #D4A853;
      background:     rgba(212, 168, 83, 0.1);
      border:         1px solid rgba(212, 168, 83, 0.2);
      padding:        4px 12px;
      border-radius:  999px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-family:    'Space Mono', monospace;
    }

    #cover-brand {
      position:       absolute;
      bottom:         24px;
      font-size:      11px;
      color:          #8892A4;
      font-family:    'Space Grotesk', sans-serif;
      letter-spacing: 0.2px;
      text-align:     center;
      line-height:    1.6;
    }

    #cover-brand strong {
      display:     block;
      color:       #D4A853;
      font-size:   13px;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'cover-overlay';

  // Spinner + logo
  const spinnerWrap = document.createElement('div');
  spinnerWrap.id = 'cover-spinner-wrap';

  const img = document.createElement('img');
  img.id  = 'cover-logo';
  img.src = logo;
  img.alt = 'afrIAgenesis logo';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'cover-svg';
  svg.setAttribute('viewBox', '0 0 110 110');

  // Arc extérieur gold
  const arcGold = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  arcGold.setAttribute('cx', '55');
  arcGold.setAttribute('cy', '55');
  arcGold.setAttribute('r', '50');
  arcGold.setAttribute('fill', 'none');
  arcGold.setAttribute('stroke', 'rgba(212,168,83,0.15)');
  arcGold.setAttribute('stroke-width', '2');

  // Arc animé gold
  const arcSpin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  arcSpin.setAttribute('cx', '55');
  arcSpin.setAttribute('cy', '55');
  arcSpin.setAttribute('r', '50');
  arcSpin.setAttribute('fill', 'none');
  arcSpin.setAttribute('stroke', '#D4A853');
  arcSpin.setAttribute('stroke-width', '3');
  arcSpin.setAttribute('stroke-linecap', 'round');
  arcSpin.setAttribute('stroke-dasharray', '80 235');

  svg.appendChild(arcGold);
  svg.appendChild(arcSpin);
  spinnerWrap.appendChild(img);
  spinnerWrap.appendChild(svg);

  // Texte chargement
  const label = document.createElement('p');
  label.id          = 'cover-text';
  label.textContent = text;

  // Badge PI-SPI
  const badge = document.createElement('div');
  badge.id          = 'cover-badge';
  badge.textContent = 'PI-SPI Readiness Checker™';

  // Branding bas de page
  const brand = document.createElement('p');
  brand.id        = 'cover-brand';
  brand.innerHTML = `<span>propulsé par</span><strong>${entreprise}</strong>`;

  overlay.appendChild(spinnerWrap);
  overlay.appendChild(label);
  overlay.appendChild(badge);
  overlay.appendChild(brand);
  document.body.appendChild(overlay);

  // Logique dismiss identique au modèle Beronda
  const maxDuration = 60000;
  const minDuration = 1500;

  const dismiss = () => {
    overlay.classList.add('hide');
    overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
  };

  const pageReady = new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });

  const minWait = new Promise(resolve => setTimeout(resolve, minDuration));
  const maxWait = new Promise(resolve => setTimeout(resolve, maxDuration));

  Promise.race([
    Promise.all([pageReady, minWait ]),
    maxWait
  ]).then(dismiss);
}

cover();