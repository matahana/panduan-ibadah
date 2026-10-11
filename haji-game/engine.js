/* Mesin Perjalanan Haji 3D: renderer, dunia, kamera, kontrol, HUD, modal, kuis, layar rujukan,
   dan mekanik khusus (thawaf, sa'i, wukuf, kerikil, lempar jumrah). Alur tahap ada di game.js. */
window.HG = (function () {
  'use strict';
  const T = THREE, W = WORLD, D = DATA, U = UI, L = W.L, PI = Math.PI, wrapPi = W.wrapPi;
  const $ = id => document.getElementById(id), el = U.el, esc = U.esc, shuffle = U.shuffle;
  const CANCEL = { cancel: true };
  const KEY = 'haji3d.v1';
  const store = { get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }, set(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } } };
  const saved = store.get();
  const touchy = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const S = {
    gender: saved.gender || 'pria', speed: saved.speed || 1, speech: saved.speech !== false, ambient: !!saved.ambient,
    joy: saved.joy !== undefined ? saved.joy : touchy, shadows: saved.shadows !== false,
    cam: 'third', camDist: 4.2, topH: 70, pitch: .28, fpPitch: 0, yaw: 0,
    cur: null, targets: [], inter: null, modal: null, screen: null, ref: null, hud: false, fresh: false,
    mode: null, miqat: null, prepWrong: 0, asalWrong: 0, quizOk: 0, quizAll: 0, dist: 0, time: 0, started: false, ihram: false,
    th: null, sai: null, wuk: null, run: false, stageIdx: 0, dayId: null, clock: 6, peb: 0, pebAll: 0, collect: false,
    thrown: { ula: 0, wustha: 0, aqabah: 0 }, log: [], flags: {}, did: {}, proj: []
  };
  const P = { pos: new T.Vector3(), heading: 0, phase: 0, moving: false, speedNow: 0 };
  let token = 0;
  const G = p => { const t = token; return Promise.resolve(p).then(v => { if (t !== token) throw CANCEL; return v; }); };
  const wait = ms => G(new Promise(r => setTimeout(r, ms)));

  /* ---------- Renderer ---------- */
  const cv = $('gl'); let R;
  try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { $('load').innerHTML = '<div style="padding:24px"><h2>WebGL tidak tersedia</h2><p>Peramban atau perangkat ini tidak mendukung grafik 3D (WebGL). Coba Chrome, Edge, atau Safari terbaru.</p></div>'; return null; }
  R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = .78; R.shadowMap.enabled = S.shadows; R.shadowMap.type = T.PCFSoftShadowMap;
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  const cam = new T.PerspectiveCamera(62, 1, .15, 3000);
  function resize() { R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();

  /* ---------- Dunia ---------- */
  const hw = W.buildHaram();
  [hw.crowd, hw.crowdH].forEach(c => c.agents.forEach(a => { a.v *= 2.4; }));
  const WORLDS = { haram: hw };
  const MIQAT_CFG = {
    makkah: { title: 'MAKKAH — IHRAM HAJI', sub: 'مكة المكرمة', masjid: 'MASJID', masjidAr: 'مسجد', ruang: 'RUANG IHRAM', ruangAr: 'غرفة الإحرام', arah: 'MINA →', arahAr: 'منى' },
    tanim: { title: `TAN'IM — MIQAT UMRAH`, sub: 'التنعيم', masjid: `MASJID 'AISYAH`, masjidAr: 'مسجد عائشة', ruang: 'RUANG IHRAM', ruangAr: 'غرفة الإحرام', arah: 'MASJIDIL HARAM →', arahAr: 'المسجد الحرام' }
  };
  function getWorld(name) {
    if (WORLDS[name]) return WORLDS[name];
    let w;
    if (name === 'arafah') w = W.buildArafah(); else if (name === 'muzd') w = W.buildMuzdalifah(); else if (name === 'mina') w = W.buildMina();
    else if (name === 'makkah') w = W.buildMiqat('Makkah', MIQAT_CFG.makkah);
    else if (name === 'tanim') w = W.buildMiqat(`Tan'im`, MIQAT_CFG.tanim);
    else if (name.indexOf('miqat:') === 0) { const m = D.MIQAT.find(m => m.id === name.slice(6)) || D.MIQAT[2]; w = W.buildMiqat(m.nama); }
    else throw new Error('dunia?' + name);
    w.key = name; WORLDS[name] = w; return w;
  }
  const avatar = { a: null, build() { const old = this.a && this.a.group.parent; if (this.a && old) old.remove(this.a.group); const mode = this.a ? this.a.mode : 'normal', idh = this.a ? this.a.idhtiba : false; this.a = W.makePerson({ female: S.gender === 'wanita' }); this.a.setMode(mode === 'plain' ? 'normal' : mode, idh); if (old) old.add(this.a.group); } };
  avatar.build();
  const beacon = W.makeBeacon();
  const marker = new T.Mesh(new T.RingGeometry(.55, .75, 24), new T.MeshBasicMaterial({ color: 0xff7a1a, side: T.DoubleSide, fog: false, depthTest: false, transparent: true, opacity: .9 }));
  marker.rotation.x = -PI / 2; marker.position.y = .15; marker.renderOrder = 5; marker.visible = false;
  const world = () => WORLDS[S.cur];
  function useScene(name) {
    if (S.cur === name) return WORLDS[name];
    const w = getWorld(name);
    if (avatar.a.group.parent) avatar.a.group.parent.remove(avatar.a.group);
    if (beacon.parent) beacon.parent.remove(beacon); if (marker.parent) marker.parent.remove(marker);
    S.cur = name; w.scene.add(avatar.a.group, beacon, marker); w.setTop(S.cam === 'top'); avatar.a.group.visible = S.cam !== 'first'; return w;
  }
  function place(pos, yaw) { P.pos.copy(pos); P.pos.y = 0; if (yaw !== undefined) { S.yaw = yaw; P.heading = Math.atan2(-Math.sin(yaw), -Math.cos(yaw)); } }
  const faceYaw = (from, to) => Math.atan2(-(to.x - from.x), -(to.z - from.z));
  function ensureScene(name, pos, yaw, force) { const ch = S.cur !== name; useScene(name); if (ch || S.fresh || force) place(pos, yaw); S.fresh = false; return world(); }

  /* ---------- UI dasar ---------- */
  function toast(html, ms) { const d = el('div', '', html); $('toast').appendChild(d); while ($('toast').children.length > 3) $('toast').firstChild.remove(); setTimeout(() => d.remove(), ms || 3800); }
  function speak(text) {
    if (!S.speech || !('speechSynthesis' in window)) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ar-SA'; u.rate = .8; const v = speechSynthesis.getVoices().find(v => /^ar/i.test(v.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) { }
  }
  const doaBlock = id => U.doaBlock(typeof id === 'string' ? D.DOA[id] : id);
  function modal(o) {
    return new Promise(res => {
      const veil = el('div', 'veil'), d = el('div', 'dlg' + (o.wide ? ' wide' : ''));
      d.innerHTML = `<h2>${o.title || ''}</h2>${o.sub ? `<div class="sub">${o.sub}</div>` : ''}${o.html || ''}`;
      const row = el('div', 'row');
      const close = v => { veil.remove(); if (S.modal === veil) S.modal = null; res(v); };
      if (o.speak && S.speech && 'speechSynthesis' in window) { const b = el('button', 'btn ghost', '🔊 Dengar'); b.onclick = () => speak(o.speak); row.appendChild(b); }
      (o.buttons || [{ label: 'Lanjut', value: true, pri: true }]).forEach(b => { const x = el('button', 'btn' + (b.pri ? ' pri' : '') + (b.ghost ? ' ghost' : ''), b.label); x.onclick = () => close(b.value); row.appendChild(x); });
      d.appendChild(row); veil.appendChild(d); $('modalHost').appendChild(veil); S.modal = veil;
      if (o.build) o.build(d, close, row);
      d.scrollTop = 0;
    });
  }
  function closeAllUI() { $('modalHost').innerHTML = ''; $('screenHost').innerHTML = ''; S.modal = null; S.screen = null; closeRef(); }
  function fade(to) { return new Promise(r => { const f = $('fade'); f.style.pointerEvents = to ? 'auto' : 'none'; f.style.opacity = to; setTimeout(r, 520); }); }
  function screen(html, cls) { const sc = el('div', 'scr' + (cls ? ' ' + cls : '')), in_ = el('div', 'in', html); sc.appendChild(in_); $('screenHost').appendChild(sc); S.screen = sc; return { sc, in_, close() { sc.remove(); if (S.screen === sc) S.screen = null; } }; }

  /* ---------- Kuis (pilihan diacak) ---------- */
  function quizPool(kats, n) {
    const pool = D.KUIS.filter(k => !kats || kats.includes(k.kat));
    return shuffle(pool).slice(0, n).map(x => { const idx = shuffle([0, 1, 2]); return { q: x.q, o: idx.map(i => x.o[i]), a: idx.indexOf(x.a), why: x.why, kat: x.kat }; });
  }
  async function quiz(items, title) {
    let right = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const ans = await G(modal({
        title, sub: `Soal ${i + 1} dari ${items.length}`,
        html: `<div class="prog"><b style="width:${i / items.length * 100}%"></b></div><p><b>${esc(it.q)}</b></p><div id="opts"></div><div class="fb" id="fbk"></div>`,
        buttons: [], build(d, close, row) {
          const opts = d.querySelector('#opts'); let done = false;
          it.o.forEach((t, k) => {
            const b = el('button', 'opt', esc(t)); b.onclick = () => {
              if (done) return; done = true; const ok = k === it.a;
              b.classList.add(ok ? 'good' : 'wrong'); if (!ok) opts.children[it.a].classList.add('good');
              d.querySelector('#fbk').innerHTML = (ok ? '✅ Benar. ' : '❌ Kurang tepat. ') + esc(it.why || '');
              const nx = el('button', 'btn pri', i === items.length - 1 ? 'Selesai' : 'Lanjut'); nx.onclick = () => close(ok); row.appendChild(nx);
            }; opts.appendChild(b);
          });
        }
      }));
      if (ans) right++;
    }
    S.quizOk += right; S.quizAll += items.length; return right;
  }
  const binItems = (arr, n) => shuffle(arr).slice(0, n).map(x => ({ q: x.q, o: ['Boleh', 'Dilarang', 'Tergantung niat'], a: x.ok ? 0 : 1, why: x.why }));
  /* pilihan 2 (Boleh/Dilarang) tanpa opsi ketiga */
  async function quizBin(arr, n, title) {
    const items = binItems(arr, n).map(i => ({ q: i.q, o: i.o.slice(0, 2), a: i.a, why: i.why }));
    return quiz(items, title);
  }
  async function mini(kats, n, title) { const r = await quiz(quizPool(kats, n), title || 'Kuis'); return r; }

  /* ---------- HUD ---------- */
  const FASE = D.FASE;
  function setChips(g) { $('chips').innerHTML = FASE.map((l, i) => `<i class="${i < g ? 'on' : i === g ? 'cur' : ''}" title="${esc(l)}"></i>`).join(''); }
  function obj(stage, text, sub) { $('stg').textContent = stage; $('obj').textContent = text; $('sub').textContent = sub || ''; }
  function ring(n, max, txt) { const r = $('ring'); if (n === null) { r.classList.add('hidden'); return; } r.classList.remove('hidden'); $('ringN').textContent = n; $('ringArc').style.strokeDashoffset = 119.4 * (1 - Math.min(1, n / max)); $('ringTxt').innerHTML = txt || ''; }
  function showHud(on) { S.hud = on; ['hud', 'btns'].forEach(i => $(i).classList.toggle('hidden', !on)); $('joy').classList.toggle('hidden', !on || !S.joy); $('run').classList.toggle('hidden', !on || !S.joy); if (!on) { $('action').classList.add('hidden'); $('arrow').classList.add('hidden'); $('wukbar').classList.add('hidden'); } }
  const fmtClock = h => { h = ((h % 24) + 24) % 24; const hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
  function drawDay() { const h = D.HARI[S.dayId]; $('day').innerHTML = h ? `<b>${esc(h.tgl)}</b><span>${esc(h.nama)}</span><span>🕒 ${fmtClock(S.clock)}</span>` : (S.mode ? `<b>${esc(D.MODE[S.mode].nama)}</b>` : ''); }
  function setDay(id) { S.dayId = id; const h = D.HARI[id]; if (h && h.jam !== undefined) S.clock = h.jam; drawDay(); }
  function setClock(h) { S.clock = h; drawDay(); }

  /* ---------- Target / suar ---------- */
  function goTo(t) { return new Promise(res => { t.res = res; S.targets = [t]; beacon.visible = !t.quiet; if (!t.quiet) beacon.position.set(t.pos.x, 0, t.pos.z); }); }
  function clearTargets() { S.targets = []; S.inter = null; beacon.visible = false; $('action').classList.add('hidden'); $('arrow').classList.add('hidden'); }
  function doAction() {
    if (S.modal || S.screen || S.ref) return; const t = S.inter; if (!t) return;
    if (t.repeat) { t.fn && t.fn(); return; }
    clearTargets(); t.res();
  }

  /* ---------- Kerikil, lemparan ---------- */
  function pickPebbles() {
    const w = world(); if (!w || !w.pebbles) return;
    for (let i = 0; i < w.pebbles.length; i++) {
      const p = w.pebbles[i]; if (!p.on) continue;
      if (Math.hypot(p.x - P.pos.x, p.z - P.pos.z) < 1.7 && w.take(i)) {
        S.peb++; S.pebAll++; ring(S.peb, 7, `kerikil terkumpul<br><small>minimal 7 · sampai 49/70 bila ingin sekaligus</small>`);
        if ([1, 7, 21, 49, 70].includes(S.peb)) toast(S.peb === 7 ? '<b>7 kerikil</b> — cukup untuk Jumrah \'Aqabah. Boleh terus mengumpulkan sampai 49 (nafar awal) atau 70 (nafar tsani).' : `Kerikil: <b>${S.peb}</b>`, 3200);
      }
    }
  }
  function throwPebble(jid, speedMul) {
    const w = world(); if (!w || !w.jInfo) return;
    const j = w.jInfo.find(x => x.id === jid), m = new T.Mesh(new T.SphereGeometry(.14, 6, 5), new T.MeshBasicMaterial({ color: 0xfff0b8 }));
    const from = new T.Vector3(P.pos.x, 1.5, P.pos.z), to = new T.Vector3(j.x + (Math.random() - .5) * 5, .4, (Math.random() - .5) * 20);
    m.position.copy(from); w.scene.add(m); S.proj.push({ m, from, to, t: 0, dur: .55 / (speedMul || 1), w });
    S.peb = Math.max(0, S.peb - 1); S.thrown[jid]++;
  }
  function updateProj(dt) {
    for (let i = S.proj.length - 1; i >= 0; i--) {
      const q = S.proj[i]; q.t += dt / q.dur; const k = Math.min(1, q.t);
      q.m.position.lerpVectors(q.from, q.to, k); q.m.position.y += Math.sin(k * PI) * 6;
      if (q.t >= 1) { q.w.scene.remove(q.m); S.proj.splice(i, 1); }
    }
  }

  /* ---------- Wukuf ---------- */
  function startWukuf(dur) {
    const a = WORLDS.arafah; S.wuk = { on: true, t: 0, dur, stage: '', out: false, doaN: 0 };
    return new Promise(res => { S.wuk.done = res; });
  }
  function updateWukuf(dt) {
    const k = S.wuk, a = WORLDS.arafah; if (!k || !k.on || S.cur !== 'arafah') return;
    const ok = a.inArafah(P.pos) && !a.inUranah(P.pos); k.out = !ok;
    if (ok) k.t = Math.min(1, k.t + dt / k.dur);
    const stage = k.t < .35 ? 'zenith' : k.t < .8 ? 'day' : 'sunset';
    if (stage !== k.stage) { k.stage = stage; a.env.set(stage, false, .6); }
    S.clock = 12.3 + k.t * 5.85; if ((S._dc = (S._dc || 0) + dt) > .5) { S._dc = 0; drawDay(); }
    const wb = $('wukbar'); wb.classList.remove('hidden'); wb.classList.toggle('warn', k.out);
    wb.innerHTML = `<b>Wukuf di Arafah</b> · ${Math.floor(k.t * 100)}% · ${fmtClock(S.clock)}${k.out ? `<div style="color:#f2b9b2">⚠ ${a.inUranah(P.pos) ? `Anda di Wadi 'Uranah — BUKAN Arafah. Waktu wukuf berhenti.` : 'Di luar batas Arafah. Waktu wukuf berhenti.'}</div>` : ''}<div class="prog"><b style="width:${k.t * 100}%"></b></div>`;
    ring(Math.round(k.t * 100), 100, 'persen wukuf<br><small>hingga matahari terbenam</small>');
    if (k.t >= 1) { k.on = false; wb.classList.add('hidden'); k.done && k.done(); }
  }

  /* ---------- Layar rujukan (buku doa, rukun, dam, peta, kalender) ---------- */
  const REF_TABS = [['rukun', 'Rukun & Wajib'], ['dam', 'Dam & Fidyah'], ['badal', 'Badal / Wakil'], ['larangan', 'Larangan Ihram'], ['hari', 'Kalender Hari'], ['peta', 'Peta'], ['doa', 'Doa'], ['rujukan', 'Rujukan']];
  function closeRef() { if (S.ref) { S.ref.remove(); S.ref = null; } }
  function openRef(tab, o) {
    o = o || {}; closeRef();
    const sc = el('div', 'scr'); sc.style.zIndex = 25; S.ref = sc;
    const in_ = el('div', 'in'); sc.appendChild(in_); $('screenHost').appendChild(sc);
    let cur = tab || 'rukun', kat = 'semua', lvl = 0;
    function draw() {
      const body = () => {
        switch (cur) {
          case 'rukun': return U.rukunHtml();
          case 'dam': return U.damHtml();
          case 'badal': return U.badalHtml();
          case 'larangan': return U.larangHtml();
          case 'hari': return U.calendarHtml(S.mode);
          case 'peta': return `<div class="sec"><h3>Peta skematis Makkah – Armuzna</h3><div id="pmap">${U.mapSvg({ leg: o.leg || (D.HARI[S.dayId] && D.HARI[S.dayId].leg), here: S.cur === 'haram' ? 'haram' : S.cur === 'mina' ? 'mina' : S.cur === 'muzd' ? 'muzd' : S.cur === 'arafah' ? 'jabal' : null })}</div><p class="disc">Posisi dan jarak perkiraan; bukan peta survei. Rute sebenarnya diatur pemerintah Saudi (bus, kereta Masyair, dan skema Murur/Tanazul dapat berubah tiap tahun). Jarak jalan raya: Makkah–Mina ± 6 km, Mina–Arafah ± 14 km, Arafah–Muzdalifah ± 9 km, Muzdalifah–Mina ± 5 km.</p></div>`;
          case 'doa': return `<div class="sec"><h3>Buku doa</h3><div id="fk">${D.KAT_DOA.map(([v, t]) => `<button class="chip${kat === v ? ' sel' : ''}" data-k="${v}">${esc(t)}</button>`).join('')}</div><div id="fl">${D.LVL_DOA.map(([v, t]) => `<button class="chip${lvl === v ? ' sel' : ''}" data-l="${v}">${esc(t)}</button>`).join('')}</div><p class="disc">Tingkat 1 = doa sederhana/umum; 2 = lazim dan berdalil sahih/hasan; 3 = lanjutan, atsar, atau yang derajatnya diperselisihkan (ada lencana statusnya). Boleh berdoa dengan bahasa sendiri.</p>${U.doaBookHtml(kat, lvl)}</div>`;
          case 'rujukan': return U.rujukanHtml();
        }
        return '';
      };
      in_.innerHTML = `<h1>Pusat Rujukan</h1><div class="tabs">${REF_TABS.map(([v, t]) => `<button class="chip${cur === v ? ' sel' : ''}" data-t="${v}">${esc(t)}</button>`).join('')}<button class="chip" id="rx" style="margin-left:auto">✕ Tutup</button></div>${body()}<p class="disc">Prototipe DRAF · susunan mengikuti mazhab Syafi'i dengan catatan mazhab lain · belum ditinjau ulama · tidak menggantikan bimbingan manasik resmi.</p>`;
      in_.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { cur = b.dataset.t; draw(); sc.scrollTop = 0; });
      in_.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { kat = b.dataset.k; draw(); });
      in_.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { lvl = +b.dataset.l; draw(); });
      in_.querySelector('#rx').onclick = () => { closeRef(); o.onClose && o.onClose(); };
    }
    draw();
  }

  /* ---------- Kamera ---------- */
  function setCam(m) { S.cam = m; marker.visible = m === 'top'; avatar.a.group.visible = m !== 'first'; world() && world().setTop(m === 'top'); }
  function cycleCam() { setCam(S.cam === 'third' ? 'first' : S.cam === 'first' ? 'top' : 'third'); toast({ third: 'Kamera orang ketiga', first: 'Kamera orang pertama', top: 'Kamera dari atas' }[S.cam], 1400); }
  function updateCamera() {
    const p = P.pos, c = Math.cos(S.yaw), s = Math.sin(S.yaw);
    if (S.cam === 'first') { cam.position.set(p.x, 1.66, p.z); cam.rotation.set(S.fpPitch, S.yaw, 0, 'YXZ'); }
    else if (S.cam === 'third') { const d = S.camDist, cp = Math.cos(S.pitch), sp = Math.sin(S.pitch); cam.position.set(p.x + s * cp * d, 1.45 + sp * d, p.z + c * cp * d); cam.lookAt(p.x, 1.35, p.z); }
    else { const H = S.topH; cam.position.set(p.x + s * H * .28, H, p.z + c * H * .28); cam.lookAt(p.x, 0, p.z); }
    const w = world(); if (w.sun) { const o = w.sun.userData.off; w.sun.position.set(p.x + o.x, o.y, p.z + o.z); w.sun.target.position.set(p.x, 0, p.z); }
  }

  /* ---------- Input ---------- */
  const keys = {}; let jx = 0, jy = 0;
  function toggleFull() { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } catch (e) { } }
  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase(); keys[k] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (S.modal || S.screen || S.ref) { if (k === 'escape' && S.ref) closeRef(); return; }
    if (k === 'c') cycleCam(); if (k === ' ' || k === 'enter') doAction(); if (k === 'escape') HG.stageMenu && HG.stageMenu();
    if (k === 'f') toggleFull(); if (k === 'b') openRef('doa'); if (k === 'm') openRef('peta'); if (k === 'r') openRef('rukun');
  });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  (function () {
    const j = $('joy'), knob = j.firstElementChild; let id = null;
    const mv = e => { const r = j.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy), max = r.width * .38; if (m > max) { dx *= max / m; dy *= max / m; } knob.style.transform = `translate(${dx}px,${dy}px)`; jx = dx / max; jy = dy / max; };
    j.addEventListener('pointerdown', e => { id = e.pointerId; j.setPointerCapture(id); mv(e); e.preventDefault(); });
    j.addEventListener('pointermove', e => { if (e.pointerId === id) mv(e); });
    const up = e => { if (e.pointerId === id) { id = null; jx = jy = 0; knob.style.transform = ''; } };
    j.addEventListener('pointerup', up); j.addEventListener('pointercancel', up);
    $('run').addEventListener('click', () => { S.run = !S.run; $('run').classList.toggle('on', S.run); });
  })();
  (function () {
    const lp = $('lookpad'), ptr = new Map(); let pinch = 0;
    lp.addEventListener('pointerdown', e => { lp.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
    lp.addEventListener('pointermove', e => {
      const p = ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (ptr.size >= 2) { const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y); zoom((pinch - d) * .03); pinch = d; return; }
      if (S.modal || S.screen || S.ref) return;
      S.yaw -= dx * .0055;
      if (S.cam === 'first') S.fpPitch = Math.max(-1.2, Math.min(1.2, S.fpPitch - dy * .004)); else if (S.cam === 'third') S.pitch = Math.max(-.1, Math.min(1.2, S.pitch + dy * .004));
    });
    const up = e => { ptr.delete(e.pointerId); };
    lp.addEventListener('pointerup', up); lp.addEventListener('pointercancel', up);
    lp.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY * .01); }, { passive: false });
    function zoom(d) { if (S.cam === 'top') S.topH = Math.max(22, Math.min(260, S.topH * (1 + d * .08))); else S.camDist = Math.max(1.8, Math.min(12, S.camDist * (1 + d * .08))); }
  })();
  $('action').addEventListener('click', doAction);
  $('bCam').onclick = cycleCam; $('bFull').onclick = toggleFull;
  $('bMap').onclick = () => { if (!S.modal && !S.ref) openRef('peta'); }; $('bDoa').onclick = () => { if (!S.modal && !S.ref) openRef('doa'); }; $('bRef').onclick = () => { if (!S.modal && !S.ref) openRef('rukun'); };
  document.body.classList.toggle('nojoy', !S.joy);

  /* ---------- Suara latar ---------- */
  let actx = null, anode = null;
  function ambient(on) {
    try {
      if (!on) { anode && anode.stop(); anode = null; return; }
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const len = actx.sampleRate * 3, buf = actx.createBuffer(1, len, actx.sampleRate), ch = buf.getChannelData(0); let last = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; ch[i] = last * 3.5; }
      const src = actx.createBufferSource(); src.buffer = buf; src.loop = true; const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; const g = actx.createGain(); g.gain.value = .22;
      src.connect(f); f.connect(g); g.connect(actx.destination); src.start(); anode = src;
    } catch (e) { }
  }
  function persist() { store.set({ gender: S.gender, speed: S.speed, speech: S.speech, ambient: S.ambient, joy: S.joy, shadows: S.shadows }); }
  function settings() {
    modal({
      title: 'Pengaturan', html: '<div id="st"></div>', buttons: [{ label: 'Tutup', value: true, pri: true }],
      build(d) {
        const h = d.querySelector('#st');
        const group = (lbl, list, key, fn) => { const w = el('div', '', `<p><b>${lbl}</b></p>`), box = el('div'); const r = () => { box.innerHTML = ''; list.forEach(([v, t]) => { const b = el('button', 'chip' + (S[key] === v ? ' sel' : ''), t); b.onclick = () => { S[key] = v; persist(); fn && fn(v); r(); }; box.appendChild(b); }); }; r(); w.appendChild(box); h.appendChild(w); };
        group('Kecepatan jalan', [[1, 'Normal'], [2, '×2'], [4, '×4']], 'speed');
        group('Kamera', [['third', 'Orang ketiga'], ['first', 'Orang pertama'], ['top', 'Dari atas']], 'cam', v => setCam(v));
        group('Suara doa (sintesis suara peramban)', [[true, 'Hidup'], [false, 'Mati']], 'speech');
        group('Dengung keramaian', [[true, 'Hidup'], [false, 'Mati']], 'ambient', v => ambient(v));
        group('Joystick layar', [[true, 'Tampil'], [false, 'Sembunyi']], 'joy', () => { document.body.classList.toggle('nojoy', !S.joy); showHud(S.hud); });
        group('Bayangan (matikan bila patah-patah)', [[true, 'Hidup'], [false, 'Mati']], 'shadows', v => { R.shadowMap.enabled = v; Object.values(WORLDS).forEach(w => w.scene.traverse(o => { if (o.material) o.material.needsUpdate = true; })); });
        if (!S.started || S.stageIdx <= 1) group('Jenis kelamin (mengatur pakaian dan tata cara)', [['pria', 'Pria'], ['wanita', 'Wanita']], 'gender', () => avatar.build());
      }
    });
  }
  $('bSet').onclick = () => { if (!S.modal && !S.ref) settings(); };
  $('bHome').onclick = () => { if (!S.modal && !S.ref) HG.stageMenu && HG.stageMenu(); };
  if (S.ambient) document.addEventListener('pointerdown', function f() { ambient(true); document.removeEventListener('pointerdown', f); }, { once: true });

  /* ---------- Minimap ---------- */
  const mctx = $('mini').getContext('2d');
  function drawMini() {
    if (!S.hud) return; const w = world(); if (!w) return; const c = mctx, Wd = 264; c.clearRect(0, 0, Wd, Wd); c.save(); c.beginPath(); c.arc(Wd / 2, Wd / 2, Wd / 2 - 2, 0, 7); c.clip();
    c.fillStyle = 'rgba(20,24,18,.82)'; c.fillRect(0, 0, Wd, Wd);
    const p = P.pos, inMasa = S.cur === 'haram' && p.x > 66;
    const base = S.cur === 'haram' ? (inMasa ? 140 : 80) : S.cur === 'arafah' ? 120 : S.cur === 'muzd' ? 100 : S.cur === 'mina' ? 110 : 90;
    const R_ = S.cam === 'top' ? S.topH * 1.3 : base, sc = Wd / 2 / R_, cy = Math.cos(S.yaw), sy = Math.sin(S.yaw);
    const mp = (x, z) => { const dx = x - p.x, dz = z - p.z; return [Wd / 2 + (dx * cy - dz * sy) * sc, Wd / 2 + (dx * sy + dz * cy) * sc]; };
    const rect = (x0, z0, x1, z1, fill) => { const a = mp(x0, z0), b = mp(x1, z0), d = mp(x1, z1), e = mp(x0, z1); c.fillStyle = fill; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.lineTo(...d); c.lineTo(...e); c.closePath(); c.fill(); };
    const seg = (x0, z0, x1, z1, col, lw) => { const a = mp(x0, z0), b = mp(x1, z1); c.strokeStyle = col; c.lineWidth = lw || 2; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); };
    if (S.cur === 'haram') {
      const [kx, kz] = mp(0, 0); c.strokeStyle = '#8c8570'; c.lineWidth = 2; c.beginPath(); c.arc(kx, kz, L.mataf * sc, 0, 7); c.stroke();
      c.strokeStyle = '#d8d0bb'; c.lineWidth = Math.max(2, 10 * sc); c.beginPath(); c.arc(kx, kz, 67 * sc, 0, 7); c.stroke();
      c.fillStyle = '#000'; c.strokeStyle = '#f1d36b'; c.lineWidth = 1.5; c.fillRect(kx - 3, kz - 3, 6, 6); c.strokeRect(kx - 4, kz - 4, 8, 8);
      rect(L.hallX0, L.marwahZ, L.hallX1, L.safaZ + 6, 'rgba(190,185,160,.45)');
      L.zHijau.forEach(z => seg(L.hallX0, z, L.hallX1, z, '#25e068', 2));
    } else if (S.cur === 'arafah') {
      const B = w.B; rect(B.u0, -270, B.bx0, 270, 'rgba(176,90,70,.55)'); rect(B.bx0, B.bz0, B.bx1, B.bz1, 'rgba(120,130,90,.28)'); seg(B.bx0, -270, B.bx0, 270, '#35c46a', 3);
      const [jx_, jz_] = mp(w.jr.x, w.jr.z); c.fillStyle = '#9a8a7e'; c.beginPath(); c.arc(jx_, jz_, 32 * sc, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(jx_ - 2, jz_ - 2, 4, 4);
      rect(-219, -52, -125, 12, '#e9e3d0');
    } else if (S.cur === 'muzd') {
      rect(-200, -210, w.B.x0, 210, 'rgba(176,90,70,.55)'); seg(w.B.x0, -210, w.B.x0, 210, '#e2685a', 3); rect(20, -164, 60, -136, '#e9e3d0');
      const [rx, rz] = mp(w.rest.x, w.rest.z); c.fillStyle = 'rgba(120,140,200,.6)'; c.fillRect(rx - 8, rz - 5, 16, 10);
      c.fillStyle = '#fff4c8'; w.pebbles.forEach(q => { if (!q.on) return; const [x, y] = mp(q.x, q.z); if (Math.hypot(x - Wd / 2, y - Wd / 2) < Wd / 2 - 4) c.fillRect(x - 1, y - 1, 2.4, 2.4); });
    } else if (S.cur === 'mina') {
      rect(-195, -60, 235, 60, 'rgba(200,195,180,.3)'); c.lineCap = 'round';
      w.jInfo.forEach(j => seg(j.x, -14, j.x, 14, '#fff', Math.max(3, 3 * sc * 6)));
    }
    S.targets.forEach(t => { let [x, y] = mp(t.pos.x, t.pos.z); const dx = x - Wd / 2, dy = y - Wd / 2, m = Math.hypot(dx, dy), lim = Wd / 2 - 14; if (m > lim) { x = Wd / 2 + dx / m * lim; y = Wd / 2 + dy / m * lim; } c.fillStyle = '#f1d36b'; c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill(); c.stroke(); });
    if (w.q) { const qx = w.q.x * cy - w.q.z * sy, qz = w.q.x * sy + w.q.z * cy, x = Wd / 2 + qx * (Wd / 2 - 18), y = Wd / 2 + qz * (Wd / 2 - 18); c.fillStyle = '#000'; c.strokeStyle = '#f1d36b'; c.lineWidth = 2; c.fillRect(x - 6, y - 6, 12, 12); c.strokeRect(x - 6, y - 6, 12, 12); c.fillStyle = '#f1d36b'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.fillText('K', x, y + 3.5); }
    c.translate(Wd / 2, Wd / 2); c.rotate(S.cam === 'first' ? 0 : relHead()); c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -12); c.lineTo(8, 9); c.lineTo(0, 5); c.lineTo(-8, 9); c.closePath(); c.fill(); c.stroke();
    c.restore(); c.fillStyle = '#f1d36b'; c.font = 'bold 20px sans-serif'; c.textAlign = 'center'; c.fillText('N', Wd / 2 + sy * (Wd / 2 - 18), Wd / 2 - cy * (Wd / 2 - 18) + 7);
  }
  function relHead() { const hx = Math.sin(P.heading), hz = Math.cos(P.heading), cy = Math.cos(S.yaw), sy = Math.sin(S.yaw); const sxv = hx * cy - hz * sy, syv = hx * sy + hz * cy; return Math.atan2(sxv, -syv); }

  /* ---------- Per frame ---------- */
  const clock = new T.Clock(); let tAcc = 0, miniT = 0, warnT = 0;
  function saiEnd(atMarwah) {
    const s = S.sai; s.lap++; s.dir = atMarwah ? 1 : -1; ring(s.lap, 7, 'lintasan selesai<br><small>' + (s.lap >= 7 ? 'selesai' : s.dir < 0 ? 'Shafa → Marwah' : 'Marwah → Shafa') + '</small>');
    if (s.lap >= 7) { s.done && s.done(); return; }
    obj(s.stage || `Sa'i`, `Lintasan ${s.lap + 1} dari 7: ${s.dir < 0 ? 'Shafa → Marwah' : 'Marwah → Shafa'}`, S.gender === 'pria' ? 'Di zona hijau, pria berlari kecil.' : 'Berjalan biasa.');
    toast(`Lintasan ${s.lap} selesai di ${atMarwah ? 'Marwah' : 'Shafa'}.<div class="ar">${D.DOA.dzikirSafa.ar.split('،')[0]}</div><small>Hadap Ka'bah, berdoa; lalu lanjutkan.</small>`, 5000);
  }
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05); tAcc += dt; if (S.started) S.time += dt;
    const w = world(); if (!w) return;
    const busy = !!(S.modal || S.screen || S.ref) || !S.hud;
    let ix = 0, iz = 0;
    if (!busy) {
      if (keys['w'] || keys['arrowup']) iz += 1; if (keys['s'] || keys['arrowdown']) iz -= 1; if (keys['a'] || keys['arrowleft']) ix -= 1; if (keys['d'] || keys['arrowright']) ix += 1;
      ix += jx; iz -= jy; if (keys['q']) S.yaw += 1.8 * dt; if (keys['e']) S.yaw -= 1.8 * dt;
    }
    const len = Math.hypot(ix, iz); if (len > 1) { ix /= len; iz /= len; }
    P.moving = len > .08;
    if (P.moving) {
      const c = Math.cos(S.yaw), s = Math.sin(S.yaw), vx = -s * iz + c * ix, vz = -c * iz - s * ix;
      let sp = ((keys['shift'] || S.run) ? 8.4 : 4.2) * Math.min(1, len) * S.speed;
      if (S.sai && S.sai.on && S.gender === 'pria') { const inG = P.pos.z < L.zHijau[1] && P.pos.z > L.zHijau[0]; if (inG && !S.sai.inGreen) toast('Zona hijau — pria berlari kecil.', 2200); S.sai.inGreen = inG; if (inG) sp *= 1.45; }
      const nx = P.pos.x + vx * sp * dt, nz = P.pos.z + vz * sp * dt, ox = P.pos.x, oz = P.pos.z;
      P.pos.x = nx; P.pos.z = nz; w.collide(w, P.pos);
      S.dist += Math.hypot(P.pos.x - ox, P.pos.z - oz) / S.speed;
      const tgt = Math.atan2(vx, vz); P.heading += wrapPi(tgt - P.heading) * Math.min(1, dt * 12); P.speedNow = sp; P.phase += dt * (4 + sp * 1.1);
    } else { P.speedNow = 0; }
    avatar.a.walk(P.phase, P.moving ? Math.min(.9, .35 + P.speedNow * .05) : 0);
    marker.position.x = P.pos.x; marker.position.z = P.pos.z; avatar.a.group.position.x = P.pos.x; avatar.a.group.position.z = P.pos.z; avatar.a.group.rotation.y = P.heading;
    if (!P.moving) avatar.a.group.position.y = 0;
    // thawaf
    const th = S.th;
    if (th && th.on && S.cur === 'haram') {
      const r = Math.hypot(P.pos.x, P.pos.z), phi = Math.atan2(-P.pos.z, P.pos.x);
      if (r > 10 && r < L.ringIn - 2) {
        const d = wrapPi(phi - th.prev); th.prev = phi;
        if (Math.abs(d) < .6) {
          th.cum += d;
          if (th.cum > th.maxCum) th.maxCum = th.cum;
          else if (th.maxCum - th.cum > .8 && tAcc - th.warn > 5) { th.warn = tAcc; toast("Arah terbalik. Thawaf berlawanan arah jarum jam, Ka'bah di kiri."); }
          const rel = ((phi - L.phi0) % (PI * 2) + PI * 2) % (PI * 2), lap = Math.floor(Math.max(0, th.cum) / (PI * 2));
          th.lm.forEach(m => { const key = lap + m.n; if (!th.seen[key] && th.prevRel < m.rel && rel >= m.rel && rel - th.prevRel < 1) { th.seen[key] = 1; toast(m.n + (m.doa ? `<div class="ar">${D.DOA.rabbana.ar}</div>` : ''), m.doa ? 5200 : 2500); } });
          th.prevRel = rel;
          const laps = Math.min(7, lap);
          if (laps > th.laps) { th.laps = laps; ring(laps, 7, "putaran selesai<br><small>Ka'bah di kiri</small>"); if (laps < 7) { obj(th.stage, `Putaran ${laps + 1} dari 7`, laps < 3 && th.ramal && S.gender === 'pria' ? 'Ramal: langkah cepat-pendek pada putaran 1–3.' : "Jaga Ka'bah di sebelah kiri."); toast(`Putaran ${laps} selesai`, 1800); } else { th.on = false; th.done && th.done(); } }
        } else th.prev = phi;
      } else th.prev = Math.atan2(-P.pos.z, P.pos.x);
      if (r < 11.2 && tAcc - th.warn > 5) { th.warn = tAcc; toast("Terlalu dekat Ka'bah/Hijr; mundur ke jalur thawaf."); }
    }
    const sa = S.sai;
    if (sa && sa.on && S.cur === 'haram' && P.pos.x > L.hallX0 - 2) {
      if (sa.dir < 0 && P.pos.z <= L.marwahZ + 7) saiEnd(true);
      else if (sa.dir > 0 && P.pos.z >= L.safaZ - 7) saiEnd(false);
    }
    if (S.wuk && S.wuk.on) updateWukuf(dt);
    if (S.collect && S.cur === 'muzd' && !busy) pickPebbles();
    if (S.cur === 'arafah' && !busy && !(S.wuk && S.wuk.on) && w.inUranah(P.pos) && tAcc - warnT > 7) { warnT = tAcc; toast(`Anda berada di Wadi 'Uranah — bukan bagian Arafah.`, 3200); }
    if (S.cur === 'muzd' && !busy && P.pos.x < w.B.x0 && tAcc - warnT > 7) { warnT = tAcc; toast('Wadi Muhassir — bukan bagian Muzdalifah. Percepat langkah.', 3200); }
    updateProj(dt);
    // interaksi
    let near = null, nd = 1e9;
    S.targets.forEach(t => { const d = Math.hypot(t.pos.x - P.pos.x, t.pos.z - P.pos.z); if (d < nd) { nd = d; near = t; } });
    const okNeed = !near || !near.need || near.need();
    const showA = near && !busy && nd <= near.r && okNeed; S.inter = showA ? near : null;
    if (near && !busy && nd <= near.r && !okNeed && near.needMsg && tAcc - warnT > 4) { warnT = tAcc; toast(near.needMsg, 2800); }
    const ab = $('action'); ab.classList.toggle('hidden', !showA); if (showA && ab.textContent !== near.label) ab.textContent = near.label;
    const ar = $('arrow');
    if (near && !busy && !showA && !near.quiet) { ar.classList.remove('hidden'); const vx = near.pos.x - P.pos.x, vz = near.pos.z - P.pos.z, c = Math.cos(S.yaw), s = Math.sin(S.yaw), rx = vx * c - vz * s, fx = -vx * s - vz * c; ar.firstElementChild.style.transform = `rotate(${Math.atan2(rx, fx)}rad)`; $('arrTxt').textContent = Math.round(nd) + ' m'; } else ar.classList.add('hidden');
    if (beacon.visible) { const k = 1 + Math.sin(tAcc * 3) * .12; beacon.userData.rg.scale.setScalar(k); beacon.userData.rg2.scale.setScalar(2 - k); }
    w.update(dt, tAcc); updateCamera();
    if ((miniT += dt) > .08) { miniT = 0; drawMini(); }
    R.render(w.scene, cam);
  }

  const hav = (a, b) => { const r = PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r, q = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.sqrt(q)); };

  const HG = {
    T, W, D, U, L, S, P, $, el, esc, shuffle, CANCEL, G, wait, store, persist, touchy, cam, R, hw, WORLDS, getWorld, avatar, beacon, marker, world, useScene, place, faceYaw, ensureScene,
    toast, speak, doaBlock, modal, closeAllUI, fade, screen, quiz, quizPool, quizBin, mini, binItems, setChips, obj, ring, showHud, setDay, setClock, drawDay, fmtClock, goTo, clearTargets, doAction,
    throwPebble, startWukuf, openRef, closeRef, setCam, cycleCam, settings, ambient, frame, hav, newToken() { return ++token; }, getToken() { return token; }, stageMenu: null
  };
  return HG;
})();
