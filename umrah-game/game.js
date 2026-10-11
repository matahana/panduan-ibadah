/* Logika game Perjalanan Umrah 3D: alur tahap, kamera, kontrol, UI. */
(function () {
  'use strict';
  const T = THREE, W = WORLD, D = DATA, L = W.L, PI = Math.PI, wrapPi = W.wrapPi;
  const $ = id => document.getElementById(id);
  const CANCEL = { cancel: true };
  const store = { get() { try { return JSON.parse(localStorage.getItem('umrah3d.v1')) || {}; } catch (e) { return {}; } }, set(o) { try { localStorage.setItem('umrah3d.v1', JSON.stringify(o)); } catch (e) { } } };
  const saved = store.get();
  const touchy = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const S = {
    gender: saved.gender || 'pria', speed: saved.speed || 1, speech: saved.speech !== false, ambient: !!saved.ambient,
    joy: saved.joy !== undefined ? saved.joy : touchy, shadows: saved.shadows !== false,
    cam: 'third', camDist: 4.2, topH: 70, pitch: .28, fpPitch: 0, yaw: 0,
    cur: null, targets: [], inter: null, modal: null, screen: null, hud: false, fresh: false,
    miqat: null, prepWrong: 0, asalWrong: 0, quizOk: 0, quizAll: 0, dist: 0, time: 0, started: false, ihram: false,
    th: null, sai: null, run: false, stageIdx: 0
  };
  const P = { pos: new T.Vector3(), heading: 0, phase: 0, moving: false, speedNow: 0 };
  let token = 0;
  const G = p => { const t = token; return Promise.resolve(p).then(v => { if (t !== token) throw CANCEL; return v; }); };

  /* ---------- Renderer ---------- */
  const cv = $('gl');
  let R;
  try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { $('load').innerHTML = '<div style="padding:24px"><h2>WebGL tidak tersedia</h2><p>Peramban atau perangkat ini tidak mendukung grafik 3D (WebGL). Coba Chrome, Edge, atau Safari terbaru.</p></div>'; return; }
  R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = .78; R.shadowMap.enabled = S.shadows; R.shadowMap.type = T.PCFSoftShadowMap;
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  const cam = new T.PerspectiveCamera(62, 1, .15, 3000);
  function resize() { R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();

  /* ---------- Dunia ---------- */
  const hw = W.buildHaram();
  [hw.crowd, hw.crowdH].forEach(c => c.agents.forEach(a => { a.v *= 2.4; }));
  let mw = null;
  const avatar = { a: null, build() { const old = this.a && this.a.group.parent; if (this.a && old) old.remove(this.a.group); const mode = this.a ? this.a.mode : 'plain', idh = this.a ? this.a.idhtiba : false; this.a = W.makePerson({ female: S.gender === 'wanita' }); this.a.setMode(mode === 'plain' ? 'normal' : mode, idh); if (old) old.add(this.a.group); } };
  avatar.build();
  const beacon = W.makeBeacon();
  const marker = new T.Mesh(new T.RingGeometry(.55, .75, 24), new T.MeshBasicMaterial({ color: 0xff7a1a, side: T.DoubleSide, fog: false, depthTest: false, transparent: true, opacity: .9 }));
  marker.rotation.x = -PI / 2; marker.position.y = .15; marker.renderOrder = 5; marker.visible = false;
  function world() { return S.cur === 'miqat' ? mw : hw; }
  function useScene(name) {
    if (S.cur === name) return;
    if (avatar.a.group.parent) avatar.a.group.parent.remove(avatar.a.group);
    if (beacon.parent) beacon.parent.remove(beacon); if (marker.parent) marker.parent.remove(marker);
    S.cur = name; const w = world(); w.scene.add(avatar.a.group, beacon, marker); w.setTop(S.cam === 'top');
  }
  function place(pos, yaw) { P.pos.copy(pos); P.pos.y = 0; if (yaw !== undefined) { S.yaw = yaw; P.heading = Math.atan2(-Math.sin(yaw), -Math.cos(yaw)); } }
  const faceYaw = (from, to) => Math.atan2(-(to.x - from.x), -(to.z - from.z));
  function ensureScene(name, pos, yaw) { const ch = S.cur !== name; useScene(name); if (ch || S.fresh) { place(pos, yaw); } S.fresh = false; }

  /* ---------- UI dasar ---------- */
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
  function toast(html, ms) { const d = el('div', '', html); $('toast').appendChild(d); while ($('toast').children.length > 3) $('toast').firstChild.remove(); setTimeout(() => d.remove(), ms || 3800); }
  function speak(text) {
    if (!S.speech || !('speechSynthesis' in window)) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ar-SA'; u.rate = .8; const v = speechSynthesis.getVoices().find(v => /^ar/i.test(v.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) { }
  }
  function doaBlock(d) {
    return `<div class="ar">${d.ar}</div><div class="lat">${esc(d.lat)}</div><div class="arti">${esc(d.arti)}</div>${d.sumber ? `<div class="src">${esc(d.sumber)}</div>` : ''}`;
  }
  /* modal generik -> Promise(nilai tombol) */
  function modal(o) {
    return new Promise(res => {
      const veil = el('div', 'veil'), d = el('div', 'dlg');
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
  function closeAllUI() { $('modalHost').innerHTML = ''; $('screenHost').innerHTML = ''; S.modal = null; S.screen = null; }
  function fade(to) { return new Promise(r => { const f = $('fade'); f.style.pointerEvents = to ? 'auto' : 'none'; f.style.opacity = to; setTimeout(r, 520); }); }

  /* ---------- Kuis ---------- */
  async function quiz(items, title) {
    let right = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i]; let ans = await G(modal({
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
  const pickQuiz = (arr, n) => shuffle(arr).slice(0, n).map(x => ({ q: x.q, o: x.o, a: x.a, why: x.why }));
  const binItems = (arr, n) => shuffle(arr).slice(0, n).map(x => ({ q: x.q, o: ['Boleh', 'Dilarang'], a: x.ok ? 0 : 1, why: x.why }));

  /* ---------- HUD ---------- */
  function setChips(g) { $('chips').innerHTML = D.LANGKAH.map((l, i) => `<i class="${i < g ? 'on' : i === g ? 'cur' : ''}" title="${l.nama}"></i>`).join(''); }
  function obj(stage, text, sub) { $('stg').textContent = stage; $('obj').textContent = text; $('sub').textContent = sub || ''; }
  function ring(n, max, txt) { const r = $('ring'); if (n === null) { r.classList.add('hidden'); return; } r.classList.remove('hidden'); $('ringN').textContent = n; $('ringArc').style.strokeDashoffset = 119.4 * (1 - Math.min(1, n / max)); $('ringTxt').innerHTML = txt || ''; }
  function showHud(on) { S.hud = on; ['hud', 'btns'].forEach(i => $(i).classList.toggle('hidden', !on)); $('joy').classList.toggle('hidden', !on || !S.joy); $('run').classList.toggle('hidden', !on || !S.joy); if (!on) { $('action').classList.add('hidden'); $('arrow').classList.add('hidden'); } }

  /* ---------- Target / suar ---------- */
  function goTo(t) { return new Promise(res => { t.res = res; S.targets = [t]; beacon.visible = true; beacon.position.set(t.pos.x, 0, t.pos.z); }); }
  function clearTargets() { S.targets = []; S.inter = null; beacon.visible = false; $('action').classList.add('hidden'); $('arrow').classList.add('hidden'); }
  function doAction() { if (S.modal || S.screen) return; const t = S.inter; if (!t) return; clearTargets(); t.res(); }

  /* ---------- Alur tahap ---------- */
  async function sIntro() {
    showHud(false); closeAllUI();
    await new Promise(res => {
      const sc = el('div', 'scr'); const in_ = el('div', 'in');
      in_.innerHTML = `<svg class="logo" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#16140f"/><circle cx="256" cy="256" r="196" fill="none" stroke="#c9a24e" stroke-width="10" opacity=".35"/><circle cx="256" cy="256" r="150" fill="none" stroke="#c9a24e" stroke-width="10" opacity=".6"/><circle cx="256" cy="256" r="104" fill="none" stroke="#c9a24e" stroke-width="10" opacity=".9"/><rect x="206" y="206" width="100" height="100" rx="6" fill="#0a0a0a" stroke="#c9a24e" stroke-width="6"/><rect x="206" y="234" width="100" height="14" fill="#c9a24e"/></svg>
      <h1 style="text-align:center">Perjalanan Umrah 3D</h1>
      <p style="text-align:center;color:var(--mut)">Dari miqat, ihram, thawaf, sa'i, hingga tahalul — berjalan sendiri di Masjidil Haram dengan tampilan orang ketiga, orang pertama, atau dari atas.</p>
      <div class="note dlg" style="margin:14px 0;padding:12px 14px"><b>Cara bermain.</b> Ikuti suar emas dan petunjuk di kiri atas. Gerak: joystick layar atau <b>W A S D / panah</b>; menoleh: seret layar atau tombol <b>Q/E</b>; lari: <b>Shift</b>; ganti kamera: <b>C</b>; aksi: <b>Spasi/Enter</b>; zoom: roda tetikus.</div>
      <p><b>Anda berumrah sebagai:</b></p><div id="gsel"></div>
      <p><b>Kecepatan jalan:</b> <span style="color:var(--mut);font-size:.85rem">(thawaf 7 putaran ±800 m dan sa'i ±2,8 km; gunakan Cepat bila ingin singkat)</span></p><div id="ssel"></div>
      <p><label class="chip" id="sp"></label><label class="chip" id="jy"></label></p>
      <div class="row"><button class="btn pri" id="go">Mulai perjalanan</button></div>
      <p class="disc">Prototipe DRAF. Model Masjidil Haram, jarak, dan posisi bersifat skematis, bukan model survei. Susunan tata cara mengikuti mazhab Syafi'i (selaras bimbingan manasik Kemenag RI); doa dan dalil perlu ditinjau ulama sebelum dipakai sebagai rujukan. Game ini tidak menggantikan bimbingan manasik resmi.</p>`;
      sc.appendChild(in_); $('screenHost').appendChild(sc); S.screen = sc;
      const mk = (host, list, cur, fn) => { host.innerHTML = ''; list.forEach(([v, t]) => { const b = el('button', 'chip' + (v === cur ? ' sel' : ''), t); b.onclick = () => { fn(v); mk(host, list, v, fn); }; host.appendChild(b); }); };
      const save = () => store.set({ gender: S.gender, speed: S.speed, speech: S.speech, ambient: S.ambient, joy: S.joy, shadows: S.shadows });
      mk($('gsel'), [['pria', 'Pria'], ['wanita', 'Wanita']], S.gender, v => { S.gender = v; save(); avatar.build(); });
      mk($('ssel'), [[1, 'Normal'], [2, 'Cepat ×2'], [4, 'Sangat cepat ×4']], S.speed, v => { S.speed = v; save(); });
      const tog = (id, lbl, key) => { const e = $(id); const r = () => { e.textContent = (S[key] ? '☑ ' : '☐ ') + lbl; e.classList.toggle('sel', S[key]); }; r(); e.onclick = () => { S[key] = !S[key]; save(); r(); if (key === 'joy') document.body.classList.toggle('nojoy', !S.joy); }; };
      tog('sp', 'Suara bacaan doa', 'speech'); tog('jy', 'Joystick layar', 'joy');
      $('go').onclick = () => { sc.remove(); S.screen = null; res(); };
    });
  }

  function mapScreen() {
    return new Promise(res => {
      const sc = el('div', 'scr'), in_ = el('div', 'in'); S.screen = sc;
      const x = lon => (lon - 37.4) * 129.8, y = lat => (25.0 - lat) * 140;
      const hav = (a, b) => { const r = PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r, q = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.sqrt(q)); };
      const coast = D.PANTAI.map(p => `${x(p[1]).toFixed(1)},${y(p[0]).toFixed(1)}`).join(' L');
      let svg = `<svg viewBox="0 0 560 770" preserveAspectRatio="xMidYMid meet"><rect width="560" height="770" fill="#2b2616"/><path d="M0,0 L${coast} L0,770 Z" fill="#0f3547"/><text x="40" y="440" fill="#5f8fa3" font-size="18" font-style="italic">Laut Merah</text>`;
      const mk = D.KAABA;
      svg += `<circle cx="${x(mk.lon)}" cy="${y(mk.lat)}" r="22" fill="rgba(241,211,107,.12)" stroke="#f1d36b" stroke-dasharray="4 3"/><text x="${x(mk.lon) - 150}" y="${y(mk.lat) + 36}" fill="#f1d36b" font-size="13" stroke="#000" stroke-width="3" paint-order="stroke">batas Haram (skematis)</text><g id="lnk"></g>`;
      D.SEKITAR.forEach(c => { svg += `<rect x="${x(c.lon) - 5}" y="${y(c.lat) - 5}" width="10" height="10" fill="${c.nama.startsWith('Makkah') ? '#111' : '#9aa'}" stroke="${c.nama.startsWith('Makkah') ? '#f1d36b' : '#fff'}" stroke-width="2"/><text x="${x(c.lon) + (c.nama === 'Madinah' ? -62 : 10)}" y="${y(c.lat) + (c.nama === 'Madinah' ? 20 : 4)}" fill="#cfd8dc" font-size="16" stroke="#000" stroke-width="3" paint-order="stroke">${c.nama}</text>`; });
      D.MIQAT.forEach(m => { svg += `<g class="mq" data-id="${m.id}"><circle cx="${x(m.lon)}" cy="${y(m.lat)}" r="11"/><text x="${x(m.lon) + 15}" y="${y(m.lat) - 8}">${m.nama}</text></g>`; });
      svg += '</svg>';
      in_.innerHTML = `<h1>Tahap 1 — Tentukan miqat</h1><p style="color:var(--mut)">Miqat adalah batas tempat yang tidak boleh dilewati orang yang hendak umrah atau haji tanpa berihram. Pilih <b>dari mana Anda datang</b>, lalu <b>sentuh miqat</b> yang sesuai di peta.</p>
      <div id="asal"></div><div id="mapwrap">${svg}</div><div id="info" class="dlg" style="margin:0 auto"></div><div class="row"><button class="btn ghost" id="hint">Tampilkan petunjuk</button><button class="btn pri" id="pick" disabled>Pilih miqat ini</button></div>
      <p class="disc">Peta skematis dan koordinat miqat hanya perkiraan; ikuti papan penanda resmi, pembimbing rombongan, dan pengumuman maskapai di lapangan. Hadits dasar: Nabi saw. menetapkan miqat bagi penduduk Madinah, Syam, Najd, dan Yaman (HR. al-Bukhari dan Muslim dari Ibnu 'Abbas).</p>`;
      sc.appendChild(in_); $('screenHost').appendChild(sc);
      let asal = null, sel = null, solved = false;
      const asalHost = in_.querySelector('#asal'), info = in_.querySelector('#info'), pick = in_.querySelector('#pick');
      const drawAsal = () => { asalHost.innerHTML = ''; D.ASAL.forEach(a => { const b = el('button', 'chip' + (asal === a.id ? ' sel' : ''), `<b>${a.label}</b><br><small style="color:var(--mut)">${a.sub}</small>`); b.onclick = () => { asal = a.id; drawAsal(); upd(); }; asalHost.appendChild(b); }); };
      const upd = () => {
        in_.querySelectorAll('.mq').forEach(g => g.classList.toggle('sel', g.dataset.id === sel));
        const m = D.MIQAT.find(m => m.id === sel);
        if (!m) { info.innerHTML = '<div class="sub">Sentuh salah satu titik emas pada peta.</div>'; pick.disabled = true; return; }
        const km = hav(m, mk);
        info.innerHTML = `<h2>${m.nama}</h2><div class="sub">${esc(m.alias)} · arah ${esc(m.arah)} · ± ${Math.round(km)} km garis lurus ke Ka'bah</div><p><span class="tag">Untuk</span>${esc(m.untuk)}</p><p style="color:var(--mut);font-size:.9rem">${esc(m.cat)}</p>`;
        pick.disabled = !asal;
        const l = in_.querySelector('#lnk'); l.innerHTML = `<line x1="${x(m.lon)}" y1="${y(m.lat)}" x2="${x(mk.lon)}" y2="${y(mk.lat)}" stroke="#f1d36b" stroke-width="3" stroke-dasharray="8 6"/>`;
      };
      in_.querySelectorAll('.mq').forEach(g => g.onclick = () => { if (solved) return; sel = g.dataset.id; upd(); });
      in_.querySelector('#hint').onclick = () => { if (!asal) { toast('Pilih dulu asal perjalanan Anda.'); return; } const a = D.ASAL.find(a => a.id === asal), m = D.MIQAT.find(m => m.id === a.miqat); toast(`Petunjuk: ${esc(a.label)} → miqat <b>${m.nama}</b>`, 5000); sel = m.id; upd(); };
      pick.onclick = async () => {
        if (!asal) { toast('Pilih asal perjalanan dulu.'); return; }
        const a = D.ASAL.find(a => a.id === asal), m = D.MIQAT.find(m => m.id === sel);
        if (a.miqat === sel) {
          solved = true; S.quizOk++; S.quizAll++; pick.disabled = true;
          info.innerHTML = `<h2>✅ Tepat: ${m.nama}</h2><p>${esc(a.label)} berihram dari <b>${m.nama}</b>. ${esc(m.cat)}</p>`;
          pick.textContent = 'Menuju miqat'; pick.disabled = false; pick.onclick = () => { sc.remove(); S.screen = null; res(sel); };
        } else {
          S.asalWrong++; S.quizAll++;
          const right = D.MIQAT.find(x => x.id === a.miqat);
          info.innerHTML += `<div class="note" style="border-color:var(--bad)">❌ Kurang tepat. ${esc(a.label)} memakai miqat <b>${right.nama}</b>, bukan ${m.nama}. Coba lagi atau tekan <i>Tampilkan petunjuk</i>.</div>`;
        }
      };
      drawAsal(); upd();
    });
  }

  async function sMap() {
    showHud(false); closeAllUI(); clearTargets(); ring(null);
    if (!S.started) { S.started = true; S.time = 0; S.dist = 0; }
    useScene('haram'); place(L.start, 0); showHud(false);
    S.miqat = await G(mapScreen());
  }

  function buildMiqatWorld() {
    const m = D.MIQAT.find(m => m.id === S.miqat) || D.MIQAT[2];
    if (mw && mw.name === m.id) return;
    const was = S.cur === 'miqat'; if (was) { avatar.a.group.parent.remove(avatar.a.group); beacon.parent.remove(beacon); marker.parent.remove(marker); S.cur = null; }
    mw = W.buildMiqat(m.nama); mw.name = m.id;
    if (was) useScene('miqat');
  }

  function checklist() {
    return new Promise(res => {
      const items = shuffle(D.PERSIAPAN.filter(i => !i.dynGender || i.dynGender === S.gender));
      const txt = i => i.dyn === 'pakaian' ? (S.gender === 'pria' ? 'Berwudhu dan mengenakan dua kain ihram putih tak berjahit (izar dan rida)' : 'Berwudhu dan mengenakan pakaian yang menutup aurat (wajah dan telapak tangan terbuka)') : i.t;
      const sel = new Set();
      modal({
        title: 'Persiapan ihram', sub: 'Centang <b>hanya</b> hal yang tepat dilakukan sebelum niat, lalu tekan <i>Periksa</i>.', html: '<div id="list"></div>', buttons: [], build(d, close, row) {
          const list = d.querySelector('#list'); const nodes = [];
          items.forEach(i => { const b = el('button', 'opt chk', `<i></i><div><span>${esc(txt(i))}</span><div class="fb"></div></div>`); b.onclick = () => { sel.has(i) ? sel.delete(i) : sel.add(i); b.classList.toggle('sel'); b.classList.remove('wrong', 'good'); b.querySelector('.fb').textContent = ''; }; list.appendChild(b); nodes.push(b); });
          const ck = el('button', 'btn pri', 'Periksa'); row.appendChild(ck);
          ck.onclick = () => {
            let wrong = 0; items.forEach((i, k) => { const bad = sel.has(i) !== i.ok; nodes[k].classList.remove('wrong', 'good'); if (bad) { wrong++; nodes[k].classList.add('wrong'); nodes[k].querySelector('.fb').textContent = (i.ok ? 'Seharusnya dilakukan. ' : 'Jangan dilakukan. ') + i.why; } else if (sel.has(i)) { nodes[k].classList.add('good'); } });
            if (wrong) { S.prepWrong += wrong; toast(`${wrong} pilihan belum tepat — baca penjelasannya.`); } else { S.quizOk++; S.quizAll++; close(true); res(true); }
          };
        }
      });
    });
  }

  async function sIhram() {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    buildMiqatWorld(); ensureScene('miqat', mw.spawn, 0);
    avatar.a.setMode('normal');
    const m = D.MIQAT.find(m => m.id === S.miqat);
    obj('Tahap 2 — Persiapan ihram', `Miqat ${m.nama}`, 'Berjalan ke Ruang Ihram (bangunan di kanan, suar emas).');
    await G(goTo({ pos: mw.ihram, r: 6, label: 'Masuk Ruang Ihram' }));
    await G(checklist());
    await G(fade(1)); avatar.a.setMode('ihram'); S.ihramDressed = true; await G(fade(0));
    toast(S.gender === 'pria' ? 'Anda kini berpakaian ihram: dua kain putih tak berjahit.' : 'Anda kini berpakaian ihram: busana menutup aurat, wajah dan telapak tangan terbuka.', 4500);
    await G(modal({
      title: 'Larangan ihram', sub: 'Sebelum berniat, kenali larangannya.', html: `<p>Setelah niat, ada larangan yang berlaku: wewangian, memotong kuku/rambut, berburu, akad nikah, hubungan suami-istri, dan bagi pria menutup kepala serta memakai pakaian berjahit; bagi wanita memakai cadar dan sarung tangan. Boleh atau dilarang? Jawab ${Math.min(8, D.LARANGAN.length)} soal berikut.</p><div class="note">Pelanggaran dapat berakibat fidyah (dam) sesuai jenisnya; hukum rinci ditanyakan kepada pembimbing.</div>`, buttons: [{ label: 'Mulai kuis', value: true, pri: true }]
    }));
    const r = await G(quiz(binItems(D.LARANGAN, 8), 'Larangan ihram'));
    await G(modal({ title: `Skor larangan: ${r}/8`, html: r >= 6 ? '<p>Bagus! Anda siap berniat.</p>' : '<p>Tidak apa-apa; ulangi lewat menu <b>Tahap</b> bila ingin berlatih lagi.</p>', buttons: [{ label: 'Menuju garis miqat', value: true, pri: true }] }));
  }

  async function sNiat() {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    buildMiqatWorld(); if (S.cur !== 'miqat' || S.fresh) { useScene('miqat'); place(new T.Vector3(28, 0, -6), faceYaw(new T.Vector3(28, 0, -6), mw.line)); S.fresh = false; }
    if (avatar.a.mode !== 'ihram') avatar.a.setMode('ihram');
    const m = D.MIQAT.find(m => m.id === S.miqat);
    obj('Tahap 3 — Niat ihram', `Menuju garis miqat ${m.nama}`, 'Niat dilakukan sebelum melewati garis miqat.');
    await G(goTo({ pos: mw.line, r: 7, label: 'Berniat ihram umrah' }));
    await G(modal({
      title: 'Niat ihram umrah', sub: 'Hadap kiblat atau arah perjalanan, lalu ucapkan.', speak: D.DOA.niatUmrah.ar,
      html: doaBlock(D.DOA.niatUmrah) + '<hr style="border-color:var(--line)">' + doaBlock(D.DOA.niatId) + `<div class="note"><b>Opsional (isytirath):</b> bila khawatir terhalang sakit, boleh menambahkan syarat:<div class="ar" style="font-size:1.3rem">${D.DOA.mahilli.ar}</div><div class="lat">${esc(D.DOA.mahilli.lat)}</div><div class="src">${esc(D.DOA.mahilli.sumber)}</div></div>`, buttons: [{ label: 'Saya sudah berniat', value: true, pri: true }]
    }));
    await G(modal({
      title: 'Talbiyah', sub: S.gender === 'pria' ? 'Pria mengeraskan suara.' : 'Wanita melirihkan suara.', speak: D.DOA.talbiyah.ar, html: doaBlock(D.DOA.talbiyah) + '<div class="prog"><b id="tb"></b></div><div class="sub" id="tn" style="text-align:center">0 / 3 — tekan <i>Ucapkan</i> tiap kali Anda melafalkan.</div>', buttons: [],
      build(d, close, row) { let n = 0; const say = el('button', 'btn pri', 'Ucapkan talbiyah'), go = el('button', 'btn', 'Lanjut'); go.disabled = true; row.append(say, go); say.onclick = () => { n++; speak(D.DOA.talbiyah.ar); d.querySelector('#tb').style.width = Math.min(100, n / 3 * 100) + '%'; d.querySelector('#tn').textContent = `${Math.min(n, 3)} / 3${n >= 3 ? ' — boleh diteruskan; perbanyak talbiyah sepanjang jalan.' : ''}`; if (n >= 3) { go.disabled = false; go.classList.add('pri'); } }; go.onclick = () => close(true); }
    }));
    S.ihram = true; toast('<b>Anda sudah berihram.</b> Larangan ihram kini berlaku.', 5000);
    await G(modal({ title: 'Anda telah berihram', html: `<p>Teruskan bertalbiyah selama perjalanan menuju Makkah hingga mulai thawaf. Jaga larangan ihram.</p><div class="note">Jarak ke Ka'bah dari ${esc(D.MIQAT.find(x => x.id === S.miqat).nama)} sekitar ${Math.round(hav2())} km (garis lurus).</div>`, buttons: [{ label: 'Berangkat ke Makkah', value: true, pri: true }] }));
  }
  function hav2() { const a = D.MIQAT.find(m => m.id === S.miqat), b = D.KAABA, r = PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r, q = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.sqrt(q)); }

  async function sHaram() {
    clearTargets(); closeAllUI(); ring(null);
    if (S.cur === 'miqat' && !S.fresh) {
      await G(fade(1)); showHud(false);
      const sc = el('div', 'scr'); sc.style.zIndex = 19; sc.style.background = '#000'; sc.innerHTML = `<div class="in" style="text-align:center;padding-top:25vh"><h1>Perjalanan ke Makkah</h1><div class="ar" style="font-size:1.4rem">${D.DOA.talbiyah.ar}</div><p class="lat">${esc(D.DOA.talbiyah.lat)}</p><p style="color:var(--mut)">Bertalbiyah sepanjang jalan… ± ${Math.round(hav2())} km</p><div class="prog" style="max-width:320px;margin:14px auto"><b id="tp"></b></div></div>`;
      $('screenHost').appendChild(sc); speak(D.DOA.talbiyah.ar); S.screen = sc; await G(fade(0));
      await G(new Promise(r => { let k = 0; const iv = setInterval(() => { k += 4; sc.querySelector('#tp').style.width = k + '%'; if (k >= 100) { clearInterval(iv); r(); } }, 130); }));
      await G(fade(1)); sc.remove(); S.screen = null;
      S.fresh = true; ensureScene('haram', L.start, faceYaw(L.start, new T.Vector3(0, 0, 0))); await G(fade(0));
    } else { ensureScene('haram', L.start, faceYaw(L.start, new T.Vector3(0, 0, 0))); }
    avatar.a.setMode('ihram'); showHud(true);
    obj('Tahap 4 — Masjidil Haram', 'Masuk melalui gerbang dengan kaki kanan', 'Ikuti suar emas ke gerbang barat daya.');
    await G(goTo({ pos: L.gateIn, r: 8, label: 'Masuk Masjidil Haram' }));
    await G(modal({
      title: 'Doa masuk masjid', sub: 'Dahulukan kaki kanan.', speak: D.DOA.masukHaram.ar, html: doaBlock(D.DOA.masukHaram) + '<div class="note">Saat pertama kali melihat Ka\'bah, berdoalah dengan doa terbaik yang Anda inginkan; doa mustajab menurut sebagian ulama (derajat riwayatnya diperselisihkan).</div>', buttons: [{ label: 'Masuk', value: true, pri: true }]
    }));
  }

  /* ---- Thawaf ---- */
  const LM = () => {
    const A = c => Math.atan2(-c.z, c.x), rel = a => ((a - L.phi0) % (PI * 2) + PI * 2) % (PI * 2);
    const hijr = W.kw(0, -W.K.b / 2);
    return [
      { n: "Multazam dan pintu Ka'bah", rel: rel(L.phi0 + .38) },
      { n: "Rukun Iraqi", rel: rel(A(L.corners.iraqi)) },
      { n: 'Hijr Ismail — thawaf harus di luar Hijr', rel: rel(A(hijr)) },
      { n: 'Rukun Syami', rel: rel(A(L.corners.syami)) },
      { n: "Rukun Yamani — baca <i>Rabbana atina fid-dunya hasanah…</i>", rel: rel(A(L.corners.yamani)), doa: true }
    ].sort((a, b) => a.rel - b.rel);
  };
  async function sThawaf() {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    const a0 = L.phi0 - .55; const sp = new T.Vector3(Math.cos(a0) * 26, 0, -Math.sin(a0) * 26);
    ensureScene('haram', sp, a0);
    avatar.a.setMode('ihram', false);
    obj('Tahap 5 — Thawaf', 'Menuju garis Hajar Aswad', 'Garis cokelat di lantai sejajar sudut Hajar Aswad.');
    await G(goTo({ pos: L.garis, r: 5.5, label: 'Mulai thawaf (istilam)' }));
    await G(modal({
      title: 'Istilam dan niat thawaf', speak: D.DOA.istilam.ar,
      html: `<p>Menghadap Hajar Aswad, <b>berhentilah bertalbiyah</b> lalu ucapkan:</p>${doaBlock(D.DOA.istilam)}${doaBlock(D.DOA.niatThawaf)}<div class="note">Thawaf <b>berlawanan arah jarum jam</b>, Ka'bah di sebelah <b>kiri</b>. Tujuh putaran. ${S.gender === 'pria' ? '<br><b>Pria:</b> bahu kanan dibuka (idhtiba\') dan, pada tiga putaran pertama, melangkah cepat-pendek (ramal).' : '<br><b>Wanita:</b> berjalan biasa tanpa ramal/idhtiba\'.'}</div>`, buttons: [{ label: 'Mulai thawaf', value: true, pri: true }]
    }));
    const phi = Math.atan2(-P.pos.z, P.pos.x);
    S.th = { on: true, cum: 0, prev: phi, maxCum: 0, laps: 0, lm: LM(), prevRel: ((phi - L.phi0) % (PI * 2) + PI * 2) % (PI * 2), seen: {}, warn: 0 };
    if (S.gender === 'pria') avatar.a.setMode('ihram', true);
    obj('Tahap 5 — Thawaf', 'Putaran 1 dari 7', "Jaga Ka'bah di sebelah kiri. Tetap di luar Hijr Ismail.");
    ring(0, 7, "putaran selesai<br><small>Ka'bah di kiri</small>");
    toast(S.gender === 'pria' ? 'Ramal: langkah cepat-pendek pada putaran 1–3.' : "Thawaf dimulai. Berjalan biasa.", 4500);
    await G(new Promise(r => { S.th.done = r; }));
    S.th.on = false; ring(null); avatar.a.setMode('ihram', false);
    await G(modal({ title: 'Thawaf tujuh putaran selesai', html: "<p>Alhamdulillah. Ratakan kembali kain ihram menutup bahu (pria), lalu uji pemahaman Anda.</p>", buttons: [{ label: 'Kuis thawaf', value: true, pri: true }] }));
    await G(quiz(pickQuiz(D.KUIS.thawaf, 3), 'Kuis thawaf'));
  }

  async function sMaqam() {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    const a = new T.Vector3(L.sholat.x * 1.8, 0, L.sholat.z * 1.8); ensureScene('haram', a, faceYaw(a, L.sholat));
    obj('Tahap 5 — Thawaf (lanjutan)', 'Shalat dua rakaat di belakang Maqam Ibrahim', 'Bila ramai, shalat di mana saja di Masjidil Haram.');
    await G(goTo({ pos: L.sholat, r: 3.5, label: 'Shalat sunnah thawaf' }));
    await G(modal({
      title: 'Shalat dua rakaat thawaf', speak: D.DOA.maqam.ar,
      html: `<p>Sambil mendekati Maqam Ibrahim:</p>${doaBlock(D.DOA.maqam)}<div class="note">Rakaat pertama sesudah al-Fatihah: <b>al-Kafirun</b>; rakaat kedua: <b>al-Ikhlas</b> (HR. Muslim, hadits Jabir). Posisi Maqam di antara Anda dan Ka'bah bila memungkinkan; bila padat, shalatlah di tempat lain yang lapang tanpa mengganggu thawaf.</div>`, buttons: [{ label: 'Selesai shalat', value: true, pri: true }]
    }));
    obj('Tahap 5 — Thawaf (lanjutan)', 'Minum air Zamzam', 'Stasiun Zamzam di tepi mataf (suar emas).');
    await G(goTo({ pos: L.zamzam, r: 6, label: 'Minum Zamzam' }));
    await G(modal({
      title: 'Minum Zamzam', speak: D.DOA.zamzam.ar, html: `<p>Minumlah sambil menghadap kiblat, tiga tegukan, berdoa dengan niat baik.</p>${doaBlock(D.DOA.zamzam)}<div class="note">Disunnahkan kembali mengusap/mengisyaratkan Hajar Aswad (istilam) sebelum keluar menuju Shafa (HR. Muslim, hadits Jabir).</div>`, buttons: [{ label: "Menuju Shafa", value: true, pri: true }]
    }));
  }

  /* ---- Sa'i ---- */
  async function sSai() {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    const s0 = new T.Vector3(62, 0, 4); ensureScene('haram', s0, faceYaw(s0, L.safa));
    avatar.a.setMode('ihram', false);
    obj("Tahap 6 — Sa'i", 'Menuju bukit Shafa', "Keluar dari gerbang timur mataf; hall Mas'a di timur.");
    await G(goTo({ pos: L.safa, r: 7, label: 'Naik ke Shafa' }));
    await G(modal({
      title: "Mulai sa'i di Shafa", speak: D.DOA.safa.ar,
      html: `<p>Mendekati Shafa bacalah:</p>${doaBlock(D.DOA.safa)}<p>Hadap Ka'bah, bertakbir tiga kali, lalu:</p>${doaBlock(D.DOA.dzikirSafa)}<div class="note">Berjalan dari <b>Shafa ke Marwah = 1</b>, Marwah ke Shafa = 2, … lintasan ketujuh berakhir di <b>Marwah</b>. ${S.gender === 'pria' ? 'Pria berlari kecil di antara dua tanda hijau.' : 'Wanita berjalan biasa, termasuk di zona hijau.'} Jarak sekitar 394 m per lintasan.</div>`, buttons: [{ label: "Mulai sa'i", value: true, pri: true }]
    }));
    S.sai = { on: true, lap: 0, dir: -1, inGreen: false };
    obj("Tahap 6 — Sa'i", 'Lintasan 1 dari 7: Shafa → Marwah', S.gender === 'pria' ? 'Di zona hijau, pria berlari kecil.' : 'Berjalan biasa.');
    ring(0, 7, 'lintasan selesai<br><small>Shafa → Marwah</small>');
    await G(new Promise(r => { S.sai.done = r; }));
    S.sai.on = false; ring(null);
    await G(modal({ title: "Sa'i tujuh lintasan selesai", html: `<p>Anda berakhir di Marwah. Tinggal <b>tahalul</b>.</p>${doaBlock(D.DOA.rabbighfir)}`, speak: D.DOA.rabbighfir.ar, buttons: [{ label: "Kuis sa'i", value: true, pri: true }] }));
    await G(quiz(pickQuiz(D.KUIS.sai, 3), "Kuis sa'i"));
  }
  function saiEnd(atMarwah) {
    const s = S.sai; s.lap++; s.dir = atMarwah ? 1 : -1; ring(s.lap, 7, 'lintasan selesai<br><small>' + (s.lap >= 7 ? 'selesai' : s.dir < 0 ? 'Shafa → Marwah' : 'Marwah → Shafa') + '</small>');
    if (s.lap >= 7) { s.done && s.done(); return; }
    obj("Tahap 6 — Sa'i", `Lintasan ${s.lap + 1} dari 7: ${s.dir < 0 ? 'Shafa → Marwah' : 'Marwah → Shafa'}`, S.gender === 'pria' ? 'Di zona hijau, pria berlari kecil.' : 'Berjalan biasa.');
    toast(`Lintasan ${s.lap} selesai di ${atMarwah ? 'Marwah' : 'Shafa'}.<div class="ar">${D.DOA.dzikirSafa.ar.split('،')[0]}</div><small>Hadap Ka'bah, berdoa; lalu lanjutkan.</small>`, 5000);
  }

  async function sTahalul() {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    const s0 = new T.Vector3(89, 0, L.marwahZ + 8); ensureScene('haram', s0, faceYaw(s0, L.barber)); avatar.a.setMode('ihram', false);
    obj('Tahap 7 — Tahalul', 'Menuju tempat cukur/potong rambut', 'Keluar dari gerbang utara Marwah; suar emas.');
    await G(goTo({ pos: new T.Vector3(L.barber.x, 0, L.barber.z + 5.5), r: 5, label: 'Tahalul (halq/taqshir)' }));
    const pria = S.gender === 'pria';
    const ch = await G(modal({
      title: 'Tahalul', sub: pria ? 'Pilih cara tahalul.' : 'Tahalul wanita: memotong rambut.', html: `<div class="note">Tahalul menutup umrah: <b>halq</b> (mencukur) atau <b>taqshir</b> (memotong). ${pria ? 'Halq lebih utama bagi pria; taqshir juga sah. Minimal tiga helai rambut menurut mazhab Syafi\'i.' : 'Wanita memotong ujung rambut sepanjang ± satu ruas jari; tidak mencukur gundul.'}</div>${doaBlock(D.DOA.tahalul)}`, speak: D.DOA.tahalul.ar,
      buttons: pria ? [{ label: 'Halq (cukur)', value: 'halq', pri: true }, { label: 'Taqshir (potong)', value: 'taqshir' }] : [{ label: 'Taqshir (potong rambut)', value: 'taqshir', pri: true }]
    }));
    await G(fade(1)); avatar.a.setMode(ch === 'halq' ? 'halq' : 'normal'); S.ihram = false; S.tahalulCara = ch; await G(fade(0));
    toast('<b>Tahalul selesai.</b> Larangan ihram berakhir.', 5000);
    await G(quiz(pickQuiz(D.KUIS.tahalul, 3), 'Kuis tahalul'));
  }

  async function sSelesai() {
    clearTargets(); showHud(false); closeAllUI();
    const m = D.MIQAT.find(m => m.id === S.miqat) || D.MIQAT[2], min = Math.round(S.time / 60);
    await G(new Promise(res => {
      const sc = el('div', 'scr'), in_ = el('div', 'in'); S.screen = sc;
      in_.innerHTML = `<h1 style="text-align:center">Umrah selesai 🕋</h1><div class="ar">تَقَبَّلَ اللّٰهُ مِنَّا وَمِنْكُمْ</div><p style="text-align:center;color:var(--mut)">Semoga Allah menerima umrah Anda dan kita semua.</p>
      <div class="stat"><div><b>${esc(m.nama)}</b>miqat</div><div><b>${min} mnt</b>waktu bermain</div><div><b>${(S.dist / 1000).toFixed(1)} km</b>jarak ditempuh</div><div><b>${S.quizOk}/${S.quizAll}</b>jawaban benar</div><div><b>${S.prepWrong + S.asalWrong}</b>kekeliruan persiapan</div></div>
      <div class="dlg" style="margin:0 auto"><h2>Rangkuman rukun umrah</h2><p>① Ihram (niat dari miqat) → ② Thawaf 7 putaran → ③ Sa'i 7 lintasan Shafa–Marwah → ④ Tahalul (halq/taqshir) → ⑤ Tertib. Wajib: berihram dari miqat dan menjauhi larangan ihram.</p></div>
      <div class="row"><button class="btn pri" id="again">Main lagi</button><button class="btn" id="redo">Pilih tahap</button></div>
      <p class="disc">Game edukasi (DRAF). Rujuk pembimbing manasik resmi untuk keputusan di lapangan.</p>`;
      sc.appendChild(in_); $('screenHost').appendChild(sc);
      $('again').onclick = () => { sc.remove(); S.screen = null; resetAll(); startFrom(0); };
      $('redo').onclick = () => { sc.remove(); S.screen = null; res(); stageMenu(); };
    }));
  }

  const FLOW = [
    { id: 'map', g: 0, run: sMap }, { id: 'ihram', g: 1, run: sIhram }, { id: 'niat', g: 2, run: sNiat }, { id: 'haram', g: 3, run: sHaram },
    { id: 'thawaf', g: 4, run: sThawaf }, { id: 'maqam', g: 4, run: sMaqam }, { id: 'sai', g: 5, run: sSai }, { id: 'tahalul', g: 6, run: sTahalul }, { id: 'selesai', g: 6, run: sSelesai }
  ];
  function resetAll() { S.miqat = null; S.prepWrong = S.asalWrong = S.quizOk = S.quizAll = 0; S.dist = 0; S.time = 0; S.started = false; S.ihram = false; S.th = null; S.sai = null; avatar.a.setMode('normal'); }
  async function startFrom(i) {
    token++; const my = token; clearTargets(); closeAllUI(); S.th = S.th && null; S.sai = null; ring(null);
    if (i >= 1 && !S.miqat) S.miqat = 'yalamlam';
    if (i >= 2) avatar.a.setMode('ihram'); if (i >= 1 && i < 2) avatar.a.setMode('normal');
    if (!S.started && i > 0) { S.started = true; }
    S.fresh = true;
    try { for (let k = i; k < FLOW.length; k++) { if (my !== token) return; S.stageIdx = k; setChips(FLOW[k].g); await FLOW[k].run(); } }
    catch (e) { if (e !== CANCEL) console.error(e); }
  }
  async function stageMenu() {
    const names = ['Peta dan miqat', 'Persiapan ihram', 'Niat dan talbiyah', 'Masuk Masjidil Haram', 'Thawaf', 'Maqam dan Zamzam', "Sa'i", 'Tahalul'];
    const v = await modal({
      title: 'Menu tahap', sub: 'Loncat ke tahap mana pun untuk berlatih ulang.', html: '<div id="mn" class="grid2"></div>', buttons: [{ label: 'Tutup', value: null, ghost: true }, { label: 'Mulai dari awal', value: 'reset' }],
      build(d, close) { const h = d.querySelector('#mn'); names.forEach((n, i) => { const b = el('button', 'opt', `${i + 1}. ${n}`); b.onclick = () => close(i); h.appendChild(b); }); }
    });
    if (v === 'reset') { resetAll(); startFrom(0); } else if (typeof v === 'number') startFrom(v);
  }
  function settings() {
    modal({
      title: 'Pengaturan', html: '<div id="st"></div>', buttons: [{ label: 'Tutup', value: true, pri: true }],
      build(d) {
        const h = d.querySelector('#st'), save = () => { store.set({ gender: S.gender, speed: S.speed, speech: S.speech, ambient: S.ambient, joy: S.joy, shadows: S.shadows }); };
        const group = (lbl, list, key, fn) => { const w = el('div', '', `<p><b>${lbl}</b></p>`), box = el('div'); const r = () => { box.innerHTML = ''; list.forEach(([v, t]) => { const b = el('button', 'chip' + (S[key] === v ? ' sel' : ''), t); b.onclick = () => { S[key] = v; save(); fn && fn(v); r(); }; box.appendChild(b); }); }; r(); w.appendChild(box); h.appendChild(w); };
        group('Kecepatan jalan', [[1, 'Normal'], [2, '×2'], [4, '×4']], 'speed');
        group('Kamera', [['third', 'Orang ketiga'], ['first', 'Orang pertama'], ['top', 'Dari atas']], 'cam', v => setCam(v));
        group('Suara doa (sintesis suara peramban)', [[true, 'Hidup'], [false, 'Mati']], 'speech');
        group('Dengung keramaian', [[true, 'Hidup'], [false, 'Mati']], 'ambient', v => ambient(v));
        group('Joystick layar', [[true, 'Tampil'], [false, 'Sembunyi']], 'joy', () => { document.body.classList.toggle('nojoy', !S.joy); showHud(S.hud); });
        group('Bayangan (matikan bila patah-patah)', [[true, 'Hidup'], [false, 'Mati']], 'shadows', v => { R.shadowMap.enabled = v; [hw, mw].forEach(w => w && w.scene.traverse(o => { if (o.material) o.material.needsUpdate = true; })); });
        if (!S.started || S.stageIdx === 0) group('Jenis kelamin (mengatur pakaian dan tata cara)', [['pria', 'Pria'], ['wanita', 'Wanita']], 'gender', () => avatar.build());
      }
    });
  }

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

  /* ---------- Kamera ---------- */
  function setCam(m) { S.cam = m; marker.visible = m === 'top'; avatar.a.group.visible = m !== 'first'; world() && world().setTop(m === 'top'); }
  function cycleCam() { setCam(S.cam === 'third' ? 'first' : S.cam === 'first' ? 'top' : 'third'); toast({ third: 'Kamera orang ketiga', first: 'Kamera orang pertama', top: 'Kamera dari atas' }[S.cam], 1400); }
  function updateCamera() {
    const p = P.pos, c = Math.cos(S.yaw), s = Math.sin(S.yaw);
    if (S.cam === 'first') { cam.position.set(p.x, 1.66, p.z); cam.rotation.set(S.fpPitch, S.yaw, 0, 'YXZ'); }
    else if (S.cam === 'third') {
      const d = S.camDist, cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
      cam.position.set(p.x + s * cp * d, 1.45 + sp * d, p.z + c * cp * d); cam.lookAt(p.x, 1.35, p.z);
    } else { const H = S.topH; cam.position.set(p.x + s * H * .28, H, p.z + c * H * .28); cam.lookAt(p.x, 0, p.z); }
    const w = world(); if (w.sun) { const o = w.sun.userData.off; w.sun.position.set(p.x + o.x, o.y, p.z + o.z); w.sun.target.position.set(p.x, 0, p.z); }
  }

  /* ---------- Input ---------- */
  const keys = {}; let jx = 0, jy = 0;
  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase(); keys[k] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (S.modal || S.screen) return;
    if (k === 'c') cycleCam(); if (k === ' ' || k === 'enter' || k === 'e' && false) doAction(); if (k === 'escape') stageMenu();
    if (k === 'f') toggleFull();
  });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  function toggleFull() { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } catch (e) { } }
  // joystick
  (function () {
    const j = $('joy'), knob = j.firstElementChild; let id = null;
    const mv = e => { const r = j.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy), max = r.width * .38; if (m > max) { dx *= max / m; dy *= max / m; } knob.style.transform = `translate(${dx}px,${dy}px)`; jx = dx / max; jy = dy / max; };
    j.addEventListener('pointerdown', e => { id = e.pointerId; j.setPointerCapture(id); mv(e); e.preventDefault(); });
    j.addEventListener('pointermove', e => { if (e.pointerId === id) mv(e); });
    const up = e => { if (e.pointerId === id) { id = null; jx = jy = 0; knob.style.transform = ''; } };
    j.addEventListener('pointerup', up); j.addEventListener('pointercancel', up);
    $('run').addEventListener('click', () => { S.run = !S.run; $('run').classList.toggle('on', S.run); });
  })();
  // menoleh & zoom
  (function () {
    const lp = $('lookpad'), ptr = new Map(); let pinch = 0;
    lp.addEventListener('pointerdown', e => { lp.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
    lp.addEventListener('pointermove', e => {
      const p = ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (ptr.size >= 2) { const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y); zoom((pinch - d) * .03); pinch = d; return; }
      if (S.modal || S.screen) return;
      S.yaw -= dx * .0055;
      if (S.cam === 'first') S.fpPitch = Math.max(-1.2, Math.min(1.2, S.fpPitch - dy * .004)); else if (S.cam === 'third') S.pitch = Math.max(-.1, Math.min(1.2, S.pitch + dy * .004));
    });
    const up = e => { ptr.delete(e.pointerId); };
    lp.addEventListener('pointerup', up); lp.addEventListener('pointercancel', up);
    lp.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY * .01); }, { passive: false });
    function zoom(d) { if (S.cam === 'top') S.topH = Math.max(22, Math.min(260, S.topH * (1 + d * .08))); else S.camDist = Math.max(1.8, Math.min(12, S.camDist * (1 + d * .08))); }
  })();
  $('action').addEventListener('click', doAction);
  $('bSet').onclick = () => { if (!S.modal) settings(); }; $('bHome').onclick = () => { if (!S.modal) stageMenu(); }; $('bCam').onclick = cycleCam; $('bFull').onclick = toggleFull;
  document.body.classList.toggle('nojoy', !S.joy);

  /* ---------- Minimap ---------- */
  const mctx = $('mini').getContext('2d');
  function drawMini() {
    if (!S.hud) return; const c = mctx, Wd = 264; c.clearRect(0, 0, Wd, Wd); c.save(); c.beginPath(); c.arc(Wd / 2, Wd / 2, Wd / 2 - 2, 0, 7); c.clip();
    c.fillStyle = 'rgba(20,24,18,.82)'; c.fillRect(0, 0, Wd, Wd);
    const p = P.pos, inMasa = S.cur === 'haram' && p.x > 66, R_ = S.cam === 'top' ? S.topH * 1.3 : (S.cur === 'miqat' ? 90 : inMasa ? 140 : 80), sc = Wd / 2 / R_, cy = Math.cos(S.yaw), sy = Math.sin(S.yaw);
    const mp = (x, z) => { const dx = x - p.x, dz = z - p.z; return [Wd / 2 + (dx * cy - dz * sy) * sc, Wd / 2 + (dx * sy + dz * cy) * sc]; };
    if (S.cur === 'haram') {
      const [kx, kz] = mp(0, 0); c.strokeStyle = '#8c8570'; c.lineWidth = 2; c.beginPath(); c.arc(kx, kz, L.mataf * sc, 0, 7); c.stroke();
      c.strokeStyle = '#d8d0bb'; c.lineWidth = Math.max(2, 10 * sc); c.beginPath(); c.arc(kx, kz, 67 * sc, 0, 7); c.stroke();
      c.fillStyle = '#000'; c.strokeStyle = '#f1d36b'; c.lineWidth = 1.5;
      c.fillRect(kx - 3, kz - 3, 6, 6); c.strokeRect(kx - 4, kz - 4, 8, 8);
      const a = mp(L.hallX0, L.marwahZ), b = mp(L.hallX1, L.marwahZ), d2 = mp(L.hallX1, L.safaZ + 6), e2 = mp(L.hallX0, L.safaZ + 6);
      c.fillStyle = 'rgba(190,185,160,.45)'; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.lineTo(...d2); c.lineTo(...e2); c.closePath(); c.fill();
      c.fillStyle = '#25e068'; L.zHijau.forEach(z => { const q = mp(L.hallX0, z), q2 = mp(L.hallX1, z); c.strokeStyle = '#25e068'; c.lineWidth = 2; c.beginPath(); c.moveTo(...q); c.lineTo(...q2); c.stroke(); });
    }
    S.targets.forEach(t => { let [x, y] = mp(t.pos.x, t.pos.z); const dx = x - Wd / 2, dy = y - Wd / 2, m = Math.hypot(dx, dy), lim = Wd / 2 - 14; if (m > lim) { x = Wd / 2 + dx / m * lim; y = Wd / 2 + dy / m * lim; } c.fillStyle = '#f1d36b'; c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill(); c.stroke(); });
    c.translate(Wd / 2, Wd / 2); c.rotate(S.cam === 'first' ? 0 : relHead()); c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -12); c.lineTo(8, 9); c.lineTo(0, 5); c.lineTo(-8, 9); c.closePath(); c.fill(); c.stroke();
    c.restore(); c.fillStyle = '#f1d36b'; c.font = 'bold 20px sans-serif'; c.textAlign = 'center'; c.fillText('N', Wd / 2 + sy * (Wd / 2 - 18), Wd / 2 - cy * (Wd / 2 - 18) + 7);
  }
  // sudut avatar relatif terhadap layar: heading model (forward = (sin h, cos h)) vs kamera
  function relHead() { const hx = Math.sin(P.heading), hz = Math.cos(P.heading), cy = Math.cos(S.yaw), sy = Math.sin(S.yaw); const sxv = hx * cy - hz * sy, syv = hx * sy + hz * cy; return Math.atan2(sxv, -syv); }

  /* ---------- Pembaruan per frame ---------- */
  const clock = new T.Clock(); let tAcc = 0, miniT = 0;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05); tAcc += dt; if (S.started) S.time += dt;
    const w = world(); if (!w) return;
    const busy = !!(S.modal || S.screen) || !S.hud;
    // gerak
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
    if (S.cam === 'first' && P.moving === false) { /* diam */ }
    avatar.a.walk(P.phase, P.moving ? Math.min(.9, .35 + P.speedNow * .05) : 0);
    marker.position.x = P.pos.x; marker.position.z = P.pos.z; avatar.a.group.position.x = P.pos.x; avatar.a.group.position.z = P.pos.z; avatar.a.group.rotation.y = P.heading;
    if (!P.moving) avatar.a.group.position.y = 0;
    // thawaf
    const th = S.th;
    if (th && th.on) {
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
          if (laps > th.laps) { th.laps = laps; ring(laps, 7, "putaran selesai<br><small>Ka'bah di kiri</small>"); if (laps < 7) { obj('Tahap 5 — Thawaf', `Putaran ${laps + 1} dari 7`, laps < 3 && S.gender === 'pria' ? 'Ramal: langkah cepat-pendek pada putaran 1–3.' : "Jaga Ka'bah di sebelah kiri."); toast(`Putaran ${laps} selesai`, 1800); } else { th.on = false; th.done && th.done(); } }
        } else th.prev = phi;
      } else th.prev = Math.atan2(-P.pos.z, P.pos.x);
      if (r < 11.2 && tAcc - th.warn > 5) { th.warn = tAcc; toast("Terlalu dekat Ka'bah/Hijr; mundur ke jalur thawaf."); }
    }
    const sa = S.sai;
    if (sa && sa.on && P.pos.x > L.hallX0 - 2) {
      if (sa.dir < 0 && P.pos.z <= L.marwahZ + 7) saiEnd(true);
      else if (sa.dir > 0 && P.pos.z >= L.safaZ - 7) saiEnd(false);
    }
    // interaksi
    let near = null, nd = 1e9;
    S.targets.forEach(t => { const d = Math.hypot(t.pos.x - P.pos.x, t.pos.z - P.pos.z); if (d < nd) { nd = d; near = t; } });
    const showA = near && !busy && nd <= near.r; S.inter = showA ? near : null;
    const ab = $('action'); ab.classList.toggle('hidden', !showA); if (showA && ab.textContent !== near.label) ab.textContent = near.label;
    const ar = $('arrow');
    if (near && !busy && !showA) { ar.classList.remove('hidden'); const vx = near.pos.x - P.pos.x, vz = near.pos.z - P.pos.z, c = Math.cos(S.yaw), s = Math.sin(S.yaw), rx = vx * c - vz * s, fx = -vx * s - vz * c; ar.firstElementChild.style.transform = `rotate(${Math.atan2(rx, fx)}rad)`; $('arrTxt').textContent = Math.round(nd) + ' m'; } else ar.classList.add('hidden');
    if (beacon.visible) { const k = 1 + Math.sin(tAcc * 3) * .12; beacon.userData.rg.scale.setScalar(k); beacon.userData.rg2.scale.setScalar(2 - k); }
    w.update(dt, tAcc); updateCamera();
    if ((miniT += dt) > .08) { miniT = 0; drawMini(); }
    R.render(w.scene, cam);
  }

  /* ---------- Mulai ---------- */
  async function boot() {
    const h = new URLSearchParams(location.hash.slice(1));
    useScene('haram'); place(L.start, faceYaw(L.start, new T.Vector3()));
    $('load').remove(); frame();
    if (h.get('g')) { S.gender = h.get('g'); avatar.build(); }
    if (h.get('speed')) S.speed = +h.get('speed');
    if (h.get('cam')) setCam(h.get('cam'));
    if (h.get('stage')) { const i = FLOW.findIndex(f => f.id === h.get('stage')); S.speech = false; S.joy = touchy; if (i >= 0) { startFrom(i); return; } }
    await sIntro(); startFrom(0);
  }
  window.__game = { S, P, FLOW, startFrom, THREE: T, cam, R, hw, avatar, doAction, L, setCam, LM };
  try { speechSynthesis.getVoices(); } catch (e) { }
  if (S.ambient) document.addEventListener('pointerdown', function f() { ambient(true); document.removeEventListener('pointerdown', f); }, { once: true });
  boot();
})();
