(function(global) {
  'use strict';

  const screens = {};
  let flashTimer = null;

  function register(name, id) {
    const el = document.getElementById(id);
    if (!el) throw new Error('UI screen not found: ' + id);
    screens[name] = el;
  }

  function show(name) {
    for (const key in screens) {
      screens[key].classList.toggle('active', key === name);
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function flashVowelName(name) {
    const el = document.getElementById('round-flash');
    if (!el) return;
    el.textContent = name;
    el.classList.add('show');
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => el.classList.remove('show'), 1000);
  }

  global.NikudUI = { register, show, setText, flashVowelName };
})(window);
