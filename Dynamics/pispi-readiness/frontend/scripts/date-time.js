
const MONTHS_FR = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

const DAYS_FR = [
  'Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'
];

/**
 * @param {Date} date
 * @returns {string}
 */
function getDate(date = new Date()) {
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * @param {Date} date
 * @returns {string}
 */
function getDay(date = new Date()) {
  return DAYS_FR[date.getDay()];
}

/**
 * @param {Date} date
 * @param {boolean} withMinutes
 * @returns {string}
 */
function getHour(date = new Date(), withMinutes = false) {
  const h = String(date.getHours()).padStart(2, '0');
  if (!withMinutes) return h;
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * @param {Date} date
 * @returns {string}
 */
function getMin(date = new Date()) {
  return String(date.getMinutes()).padStart(2, '0');
}

/**
 * @param {Date} date
 * @returns {string}
 */
function getSec(date = new Date()) {
  return String(date.getSeconds()).padStart(2, '0');
}

/**
 * @param {Date|string} target  
 * @returns {{ d: number, h: number, m: number, s: number, expired: boolean }}
 */
function getTimeLeft(target) {
  let diff = Math.max(0, new Date(target) - new Date());
  const expired = diff === 0;

  const d = Math.floor(diff / 86400000); diff %= 86400000;
  const h = Math.floor(diff / 3600000);  diff %= 3600000;
  const m = Math.floor(diff / 60000);    diff %= 60000;
  const s = Math.floor(diff / 1000);

  return { d, h, m, s, expired };
}