(function () {
  var root = document.documentElement;

  // Lingua IT / EN
  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    document.querySelectorAll('.lang').forEach(function (b) {
      b.textContent = lang === 'it' ? 'EN' : 'IT';
      b.setAttribute('aria-label', lang === 'it' ? 'Switch to English' : 'Passa all\'italiano');
    });
    try { localStorage.setItem('voga-lang', lang); } catch (e) {}
    // Etichette per lettori di schermo e testi alternativi delle foto nella lingua giusta
    document.querySelectorAll('[data-label-en]').forEach(function (el) {
      if (!el.hasAttribute('data-label-it')) el.setAttribute('data-label-it', el.getAttribute('aria-label') || '');
      el.setAttribute('aria-label', el.getAttribute(lang === 'en' ? 'data-label-en' : 'data-label-it'));
    });
    document.querySelectorAll('img[data-alt-en]').forEach(function (im) {
      if (!im.hasAttribute('data-alt-it')) im.setAttribute('data-alt-it', im.getAttribute('alt') || '');
      im.setAttribute('alt', im.getAttribute(lang === 'en' ? 'data-alt-en' : 'data-alt-it'));
    });
    updateStatus();
  }
  var saved = null;
  try { saved = localStorage.getItem('voga-lang'); } catch (e) {}
  document.querySelectorAll('.lang').forEach(function (b) {
    b.addEventListener('click', function () {
      setLang(root.getAttribute('data-lang') === 'it' ? 'en' : 'it');
    });
  });

  // Menu su telefono
  var head = document.querySelector('.site-head');
  var toggle = document.querySelector('.menu-toggle');
  if (toggle && head) {
    toggle.addEventListener('click', function () {
      var open = head.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Aperto ora: bar e tabaccheria lun-sab 05:30-20:00, ora italiana
  function updateStatus() {
    var els = document.querySelectorAll('[data-status]');
    if (!els.length) return;
    var parts = {};
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
        .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) { return; }
    var mins = parseInt(parts.hour, 10) % 24 * 60 + parseInt(parts.minute, 10);
    var sunday = parts.weekday === 'Sun';
    var open = !sunday && mins >= 330 && mins < 1200;
    var en = root.getAttribute('data-lang') === 'en';
    var text;
    // Vale per bar e tabaccheria (stessi orari); la Shell è sempre aperta
    if (open) text = en ? 'Open now · until 8 pm' : 'Aperti ora · fino alle 20:00';
    else if (sunday) text = en ? 'Closed today · back Monday at 5:30 am' : 'Chiusi oggi · riapriamo lunedì alle 5:30';
    else if (mins < 330) text = en ? 'Closed · we open at 5:30 am' : 'Chiusi · apriamo alle 5:30';
    else text = parts.weekday === 'Sat'
      ? (en ? 'Closed · back Monday at 5:30 am' : 'Chiusi · riapriamo lunedì alle 5:30')
      : (en ? 'Closed · back tomorrow at 5:30 am' : 'Chiusi · riapriamo domani alle 5:30');
    els.forEach(function (el) {
      el.setAttribute('data-state', open ? 'open' : 'closed');
      var t = el.querySelector('.txt-status');
      if (t) t.textContent = text;
    });
  }

  setLang(saved === 'en' ? 'en' : 'it');
  // Aggiornamento allineato all'inizio di ogni minuto (prima poteva restare indietro fino a 59 secondi)
  setTimeout(function () { updateStatus(); setInterval(updateStatus, 60000); }, 60000 - Date.now() % 60000 + 50);
})();
