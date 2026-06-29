const API = "http://localhost:5050/speak";

const IMG = {
  salutation : "../assets/scenarios/salutation.png",
  ami        : "../assets/scenarios/dialogue.png",
  repas      : "../assets/scenarios/repas.png",
  accord     : "../assets/scenarios/dialogue2.png",
  transport  : "../assets/scenarios/transport.png",
  recit      : "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=600&q=80",
  retour     : "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",
  gratitude  : "https://images.unsplash.com/photo-1474314170902-f596b7e67d16?w=600&q=80",
  maison     : "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=600&q=80",
  invitation : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
  identite   : "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80",
  ecole      : "https://images.unsplash.com/photo-1497375638960-ca368c7231d4?w=600&q=80",
  vision     : "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
  inclusion  : "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80",
  souverain  : "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80",
};

const PHRASES = [
  { icon: "fa-hands",             fon: "Mi fon gandji a ?",        fr: "Comment allez-vous ?",             scenario: { label: "Salutation", desc: "Une rencontre traditionnelle au Bénin",            img: IMG.salutation } },
  { icon: "fa-comments",          fon: "à fon gandji a ?",         fr: "Comment tu vas ?",                 scenario: { label: "Salutation", desc: "Entre amis dans la rue",                           img: IMG.ami        } },
  { icon: "fa-face-smile",        fon: "Gne déssou moufon gandji", fr: "Moi aussi je vais bien !",         scenario: { label: "Réponse",    desc: "La réponse positive à une salutation",             img: IMG.accord     } },
  { icon: "fa-utensils",          fon: "Elo noudouwè",             fr: "Il mange",                         scenario: { label: "Quotidien",  desc: "Scène de repas en famille",                        img: IMG.repas      } },
  { icon: "fa-motorcycle",        fon: "do quai quai wa don",      fr: "Prends un taxi moto et viens là",  scenario: { label: "Transport",  desc: "Les zemijans, taxi-motos emblématiques de Cotonou", img: IMG.transport  } },
  { icon: "fa-clock-rotate-left", fon: "Edo nou mi dayi",          fr: "Il me l'avait dit avant",          scenario: { label: "Récit",      desc: "Se souvenir d'un conseil passé",                   img: IMG.recit      } },
  { icon: "fa-house",             fon: "MoulèKowa",                fr: "Je suis déjà de retour",           scenario: { label: "Retour",     desc: "Rentrer à la maison",                              img: IMG.retour     } },
  { icon: "fa-hands-praying",     fon: "Midokpè nou mawu",         fr: "On remercie Dieu",                 scenario: { label: "Gratitude",  desc: "La foi au cœur de la vie quotidienne",             img: IMG.gratitude  } },
  { icon: "fa-lightbulb",         fon: "tà zogbain en",            fr: "Allume la lampe",                  scenario: { label: "Maison",     desc: "Le soir tombé, la vie continue",                   img: IMG.maison     } },
  { icon: "fa-hand-point-right",  fon: "quin klain wa",            fr: "Viens s'il te plaît",              scenario: { label: "Invitation", desc: "L'hospitalité béninoise",                          img: IMG.invitation } },
  { icon: "fa-user",              fon: "Mou ni",                   fr: "Je suis",                          scenario: { label: "Identité",   desc: "Se présenter en Fon",                              img: IMG.identite   } },
  { icon: "fa-school",            fon: "Ali yi azomè",             fr: "Ali est parti à l'école",          scenario: { label: "École",      desc: "L'éducation, pilier de l'avenir",                  img: IMG.ecole      } },
];

const SPEECHES = [
  {
    icon    : "fa-microphone",
    text    : "Monsieur le Ministre, aujourd'hui, l'intelligence artificielle apprend des centaines de langues du monde, mais très peu de langues africaines. Pourtant, une langue n'est pas seulement un moyen de communiquer ; c'est une culture, une identité et un patrimoine. Notre ambition est de créer une intelligence artificielle capable de comprendre et de parler nos langues africaines afin que chaque citoyen puisse accéder au numérique dans la langue qu'il maîtrise le mieux. Nous ne voulons pas seulement utiliser l'IA, nous voulons construire une IA qui nous ressemble.",
    label   : "🎙 Discours I",
    scenario: { label: "Vision",       desc: "L'IA au service des langues africaines",            img: IMG.vision    }
  },
  {
    icon    : "fa-microphone",
    text    : "Imaginez un agriculteur, une commerçante ou une mère de famille qui puisse dialoguer avec une intelligence artificielle dans sa langue maternelle, sans barrière linguistique. Ce projet vise à rendre les services numériques accessibles à tous, y compris à ceux qui ne parlent ni français ni anglais. Une IA qui parle nos langues, c'est une IA qui inclut toute la population.",
    label   : "🎙 Discours II",
    scenario: { label: "Inclusion",    desc: "Le numérique pour tous, en toutes langues",         img: IMG.inclusion }
  },
  {
    icon    : "fa-microphone",
    text    : "L'Afrique ne doit pas être uniquement consommatrice des technologies de demain ; elle doit en être créatrice. En développant une intelligence artificielle qui comprend et parle les langues africaines, nous posons les bases d'une souveraineté numérique fondée sur nos cultures, nos langues et nos réalités. C'est un investissement dans notre patrimoine, dans notre jeunesse et dans l'avenir de notre continent.",
    label   : "🎙 Discours III",
    scenario: { label: "Souveraineté", desc: "L'Afrique créatrice de son propre futur numérique", img: IMG.souverain }
  },
];

// ── DOM refs
const bubbleFon     = document.getElementById("bubble-fon");
const bubbleFr      = document.getElementById("bubble-fr");
const bubbleBox     = document.getElementById("speech-bubble");
const avatarRing    = document.getElementById("avatar-ring");
const avatarStatus  = document.getElementById("avatar-status");
const phrasesList   = document.getElementById("phrases-list");
const scenarioLabel = document.getElementById("scenario-label");
const scenarioDesc  = document.getElementById("scenario-desc");
const scenarioImg   = document.getElementById("scenario-img");
const scenarioPH    = document.getElementById("scenario-placeholder");

let currentActive = null;

// ── build phrases list
PHRASES.forEach((p) => {
  const el = document.createElement("div");
  el.className = "phrase-item";
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <i class="fa-solid ${p.icon}" style="color:var(--gold);font-size:0.85rem;width:16px;flex-shrink:0;"></i>
      <div>
        <div class="p-fon">${p.fon}</div>
        <div class="p-fr">${p.fr}</div>
      </div>
    </div>`;
  el.addEventListener("click", () => speak(p.fon, p.fr, p.scenario, el));
  phrasesList.appendChild(el);
});

const sep = document.createElement("div");
sep.style.cssText = "margin:10px 0 6px;font-size:10px;letter-spacing:2px;color:var(--gold);padding:0 4px;opacity:.7;";
sep.textContent = "── DISCOURS ──";
phrasesList.appendChild(sep);

SPEECHES.forEach((s) => {
  const el = document.createElement("div");
  el.className = "phrase-item speech-item";
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <i class="fa-solid ${s.icon}" style="color:var(--gold);font-size:0.85rem;width:16px;flex-shrink:0;"></i>
      <div>
        <div class="p-fon">${s.label}</div>
        <div class="p-fr">${s.text.substring(0, 60)}…</div>
      </div>
    </div>`;
  el.addEventListener("click", () => speakText(s.text, s.text, s.scenario, el));
  phrasesList.appendChild(el);
});

// ── speaking state
function setSpeaking(on) {
  bubbleBox.classList.toggle("speaking", on);
  avatarRing.classList.toggle("speaking", on);
  avatarStatus.textContent = on ? "EN TRAIN DE PARLER" : ".....";
}

// ── scenario + image
function setScenario(s) {
  scenarioLabel.textContent = s.label;
  scenarioDesc.textContent  = s.desc;
  if (s.img) {
    scenarioImg.style.opacity = "0";
    scenarioImg.style.display = "block";
    scenarioImg.src = s.img;
    scenarioImg.onload = () => {
      scenarioPH.style.display = "none";
      scenarioImg.style.opacity = "1";
    };
  }
}

// ── speak Fon phrase
async function speak(fon, fr, scenario, el) {
  if (currentActive) currentActive.classList.remove("active");
  currentActive = el;
  el.classList.add("active");

  bubbleFon.textContent = fon;
  bubbleFr.textContent  = fr;
  setScenario(scenario);
  setSpeaking(true);

  try {
    const res   = await fetch(API, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ text: fon })
    });
    const blob  = await res.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.onended = () => setSpeaking(false);
    audio.onerror = () => setSpeaking(false);
    await audio.play();
  } catch (e) {
    console.error(e);
    setSpeaking(false);
  }
}

// ── speak long text (discours)
async function speakText(textToSpeak, displayText, scenario, el) {
  if (currentActive) currentActive.classList.remove("active");
  currentActive = el;
  el.classList.add("active");

  bubbleFon.textContent = displayText.substring(0, 120) + "…";
  bubbleFr.textContent  = "";
  setScenario(scenario);
  setSpeaking(true);

  try {
    const res   = await fetch(API, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ text: textToSpeak })
    });
    const blob  = await res.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.onended = () => setSpeaking(false);
    audio.onerror = () => setSpeaking(false);
    await audio.play();
  } catch (e) {
    console.error(e);
    setSpeaking(false);
  }
}