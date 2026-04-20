(function(global) {
  'use strict';

  let hebrewVoice = null;
  let voicesReady = false;

  // Chrome historically exposed Hebrew as "iw" (deprecated ISO code) alongside "he".
  const HEBREW_LANG_RE = /^(he|iw)(-|_|$)/i;

  function refreshVoices() {
    if (!('speechSynthesis' in window)) { voicesReady = true; return; }
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return;
    hebrewVoice = voices.find(v => HEBREW_LANG_RE.test(v.lang)) || null;
    voicesReady = true;
  }

  if ('speechSynthesis' in window) {
    refreshVoices();
    // Safari/Firefox populate voices asynchronously.
    speechSynthesis.addEventListener('voiceschanged', refreshVoices);
  }

  function isHebrewSupported() {
    refreshVoices();
    return !!hebrewVoice;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return false;
    refreshVoices();
    if (!hebrewVoice) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = hebrewVoice.lang || 'he-IL';
    u.voice = hebrewVoice;
    u.rate = 0.85;
    u.pitch = 1.0;
    speechSynthesis.speak(u);
    return true;
  }

  global.NikudAudio = { speak, isHebrewSupported };
})(window);
