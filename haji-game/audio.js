/* Pemutar bacaan: (1) rekaman ayat dari EveryAyah bila online, (2) suara Arab peramban, (3) suara Indonesia membaca latin. */
window.AUDIO = (function () {
  const syn = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voices = [], token = 0, el = null, listeners = [];
  const load = () => { try { voices = syn ? syn.getVoices() || [] : []; } catch (e) { voices = []; } };
  if (syn) { load(); try { syn.addEventListener('voiceschanged', load); } catch (e) { syn.onvoiceschanged = load; } }
  const find = lang => voices.find(v => new RegExp('^' + lang, 'i').test(v.lang)) || null;
  const pad = n => String(n).padStart(3, '0');
  const url = (s, a) => `https://everyayah.com/data/Alafasy_128kbps/${pad(s)}${pad(a)}.mp3`;
  let rate = 0.85;
  function emit(state) { listeners.forEach(f => { try { f(state); } catch (e) { } }); }
  function stop() { token++; try { syn && syn.cancel(); } catch (e) { } if (el) { try { el.pause(); } catch (e) { } el = null; } emit(null); }
  function chunks(text, sep) { return text.split(sep).map(s => s.trim()).filter(Boolean); }
  function sayOne(text, lang, voice, t) {
    return new Promise((res, rej) => {
      if (t !== token) return res();
      const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate; if (voice) u.voice = voice;
      let done = false; const fin = (err) => { if (done) return; done = true; clearTimeout(wd); err ? rej(err) : res(); };
      u.onend = () => fin(); u.onerror = e => fin(e.error === 'canceled' || e.error === 'interrupted' ? null : new Error(e.error || 'tts'));
      const wd = setTimeout(() => fin(), 25000);
      syn.speak(u);
    });
  }
  async function say(text, lang, voice, t) {
    for (const c of chunks(text, lang.startsWith('ar') ? /[،.؛]/ : /[.;]/)) { if (t !== token) return; await sayOne(c, lang, voice, t); }
  }
  function playUrl(u, t) {
    return new Promise((res, rej) => {
      if (t !== token) return res();
      const a = new Audio(); el = a; a.preload = 'auto'; a.src = u;
      a.onended = () => res(); a.onerror = () => rej(new Error('audio')); a.onabort = () => res();
      const p = a.play(); if (p && p.catch) p.catch(rej);
    });
  }
  async function playQuran(list, t) { for (const [s, a] of list) { if (t !== token) return; await playUrl(url(s, a), t); } }
  const cleanLat = s => s.replace(/\(\d+x\)/g, ' ').replace(/[āĀ]/g, 'a').replace(/[īĪ]/g, 'i').replace(/[ūŪ]/g, 'u').replace(/['’]/g, '');
  /* Mengembalikan mode yang dipakai: quran | ar | latin | none */
  async function play(item, opts) {
    stop(); const t = token; opts = opts || {}; if (opts.rate) rate = opts.rate; emit(item.id || item.ar);
    let mode = 'none';
    try {
      if (item.qur && navigator.onLine !== false && !opts.noQuran) { try { await playQuran(item.qur, t); mode = 'quran'; } catch (e) { mode = 'none'; } }
      if (mode === 'none' && t === token && syn) {
        const ar = find('ar');
        if (ar) { try { await say(item.ar, 'ar-SA', ar, t); mode = 'ar'; } catch (e) { } }
        if (mode === 'none' && t === token && item.lat && (voices.length || !voices.length)) {
          const id = find('id') || find('en') || null;
          try { await say(cleanLat(item.lat), id ? id.lang : 'id-ID', id, t); mode = 'latin'; } catch (e) { }
        }
      }
    } finally { if (t === token) emit(null); }
    return t === token ? mode : 'stopped';
  }
  function info() { load(); return { tts: !!syn, ar: !!find('ar'), id: !!find('id'), n: voices.length, online: navigator.onLine !== false, arName: (find('ar') || {}).name || '' }; }
  return { play, stop, info, on: f => listeners.push(f), setRate: r => { rate = r; }, getRate: () => rate };
})();
