
/**
 * @param {Date|string} deadline 
 * @param {{ days, hours, minutes, seconds }} containers 
 */
function tick(deadline, containers) {
  function update() {
    const { d, h, m, s, expired } = getTimeLeft(deadline);

    document.getElementById(containers.days).textContent    = String(d).padStart(2, '0');
    document.getElementById(containers.hours).textContent   = String(h).padStart(2, '0');
    document.getElementById(containers.minutes).textContent = String(m).padStart(2, '0');
    document.getElementById(containers.seconds).textContent = String(s).padStart(2, '0');

    if (expired) {
      clearInterval(timer);
      document.getElementById(containers.days).textContent    = '00';
      document.getElementById(containers.hours).textContent   = '00';
      document.getElementById(containers.minutes).textContent = '00';
      document.getElementById(containers.seconds).textContent = '00';
    }
  }

  update();
  const timer = setInterval(update, 1000);
  return timer;
}


tick('2026-06-30T00:00:00Z', {
  days:    'days',
  hours:   'hours',
  minutes: 'minutes',
  seconds: 'seconds'
});