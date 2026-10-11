/* Pemutar bacaan: (1) rekaman ayat dari EveryAyah bila online, (2) suara Arab peramban, (3) suara lain membaca latin.
   Dibuat tahan terhadap kebiasaan Chrome Android: daftar suara terlambat muncul, cancel() lalu speak() langsung bisa hilang. */
window.AUDIO = (function () {
  const syn = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voices = [], token = 0, el = null, listeners = [], rate = 0.85, lastErr = '';
  const load = () => { try { voices = syn ? syn.getVoices() || [] : []; } catch (e) { voices = []; } };
  if (syn) { load(); try { syn.addEventListener('voiceschanged', load); } catch (e) { syn.onvoiceschanged = load; } }
  const find = lang => voices.find(v => new RegExp('^' + lang, 'i').test(v.lang)) || null;
  const pad = n => String(n).padStart(3, '0');
  const url = (s, a) => `https://everyayah.com/data/Alafasy_128kbps/${pad(s)}${pad(a)}.mp3`;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const emit = state => listeners.forEach(f => { try { f(state); } catch (e) { } });
  const note = (what, e) => { lastErr += (lastErr ? '; ' : '') + what + ': ' + ((e && (e.name || e.message)) || e || 'gagal'); };

  /* Daftar suara di Chrome Android sering kosong pada panggilan pertama; tunggu sebentar. */
  function ready(ms) {
    return new Promise(res => {
      load(); if (!syn || voices.length) return res();
      let done = false; const fin = () => { if (done) return; done = true; load(); res(); };
      try { syn.addEventListener('voiceschanged', fin, { once: true }); } catch (e) { }
      setTimeout(fin, ms || 1500);
    });
  }
  function stop() {
    token++; let was = false;
    try { if (syn) { was = syn.speaking || syn.pending; syn.cancel(); } } catch (e) { }
    if (el) { try { el.pause(); } catch (e) { } el = null; }
    emit(null); return was;
  }
  function sayOne(text, lang, voice, t) {
    return new Promise((res, rej) => {
      if (t !== token) return res();
      const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate; u.volume = 1; if (voice) u.voice = voice;
      let done = false, started = false;
      const fin = err => { if (done) return; done = true; clearTimeout(wd); clearTimeout(st); err ? rej(err) : res(); };
      u.onstart = () => { started = true; };
      u.onend = () => fin();
      u.onerror = e => fin(e.error === 'canceled' || e.error === 'interrupted' ? null : new Error(e.error || 'tts'));
      const wd = setTimeout(() => fin(), 5000 + text.length * 220);
      const st = setTimeout(() => { if (!started && !syn.speaking) fin(new Error('tidak-mulai')); }, 4000);
      try { syn.speak(u); try { syn.resume(); } catch (e) { } } catch (e) { fin(e); }
    });
  }
  async function say(text, lang, voice, t) {
    const parts = text.split(lang.startsWith('ar') ? /[،.؛]/ : /[.;]/).map(s => s.trim()).filter(Boolean);
    for (const c of parts) { if (t !== token) return; await sayOne(c, lang, voice, t); }
  }
  function playUrl(u, t) {
    return new Promise((res, rej) => {
      if (t !== token) return res();
      const a = new Audio(); el = a; a.preload = 'auto'; a.src = u;
      let playing = false;
      const to = setTimeout(() => { if (!playing) { try { a.pause(); } catch (e) { } rej(new Error('lambat/offline')); } }, 9000);
      a.onplaying = () => { playing = true; clearTimeout(to); };
      a.onended = () => { clearTimeout(to); res(); };
      a.onerror = () => { clearTimeout(to); rej(new Error('rekaman-tak-terbuka')); };
      a.onabort = () => { clearTimeout(to); res(); };
      const p = a.play(); if (p && p.catch) p.catch(e => { clearTimeout(to); rej(e); });
    });
  }
  async function playQuran(list, t) { for (const [s, a] of list) { if (t !== token) return; await playUrl(url(s, a), t); } }
  const cleanLat = s => s.replace(/\(\d+x\)/g, ' ').replace(/[āĀ]/g, 'a').replace(/[īĪ]/g, 'i').replace(/[ūŪ]/g, 'u').replace(/['’]/g, '');

  /* Mengembalikan mode yang dipakai: quran | ar | latin | none | stopped */
  async function play(item, opts) {
    const was = stop(); const t = token; opts = opts || {}; lastErr = ''; emit(item.id || item.ar);
    let mode = 'none';
    try {
      if (item.qur && navigator.onLine !== false && !opts.noQuran) { try { await playQuran(item.qur, t); mode = 'quran'; } catch (e) { note('rekaman', e); } }
      if (mode === 'none' && t === token) {
        if (!syn) note('suara', 'peramban tanpa mesin suara');
        else {
          if (was) await wait(120);
          await ready(1500);
          const ar = find('ar');
          if (ar && item.ar) { try { await say(item.ar, ar.lang || 'ar-SA', ar, t); mode = 'ar'; } catch (e) { note('suara Arab', e); } }
          if (mode === 'none' && t === token && item.lat) {
            const v = find('id') || find('en') || voices[0] || null;
            try { await say(cleanLat(item.lat), v ? v.lang : 'id-ID', v, t); mode = 'latin'; } catch (e) { note('suara latin', e); }
          }
        }
      }
    } finally { if (t === token) emit(null); }
    return t === token ? mode : 'stopped';
  }
  function info() {
    load(); const langs = [...new Set(voices.map(v => v.lang))].slice(0, 8);
    return { tts: !!syn, ar: !!find('ar'), id: !!find('id'), n: voices.length, langs, online: navigator.onLine !== false, arName: (find('ar') || {}).name || '', last: lastErr };
  }
  return { play, stop, info, on: f => listeners.push(f), setRate: r => { rate = r; }, getRate: () => rate, last: () => lastErr };
})();
