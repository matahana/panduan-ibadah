/* Alur tahap Perjalanan Haji 3D: pilih jenis haji → miqat → ihram → (umrah/qudum) → 8 Dz Mina → 9 Dz Arafah →
   Muzdalifah → 10 Dz jumrah, hadyu, tahalul → thawaf ifadhah → tasyriq → (umrah Tan'im) → thawaf wada'. */
(function () {
  'use strict';
  const H = HG; if (!H) return;
  const { T, W, D, U, L, S, P, $, el, esc, shuffle, CANCEL, G, wait, toast, speak, modal, closeAllUI, fade, screen, quiz, quizPool, quizBin, mini, obj, ring, showHud, setDay, setClock, goTo, clearTargets, hw, avatar, useScene, place, faceYaw, ensureScene, getWorld, throwPebble, startWukuf, openRef, hav, WORLDS, store, persist, fmtClock } = H;
  const PI = Math.PI, doa = H.doaBlock, MODE = () => D.MODE[S.mode] || D.MODE.tamattu;
  const V3 = (x, y, z) => new T.Vector3(x, y, z);
  const isTam = () => S.mode === 'tamattu';
  const afterHalq = () => S.afterHalq || 'normal';
  const log = t => { if (!S.log.includes(t)) S.log.push(t); };
  const setCloth = c => { if (c) avatar.a.setMode(c === 'afterHalq' ? afterHalq() : c); };
  const pretty = d => esc(d.judul);

  /* ---------- Layar bantu ---------- */
  async function dayCard(id, extra) {
    setDay(id); showHud(false);
    const h = D.HARI[id], s = screen(`<h1 style="text-align:center">${esc(h.tgl)}</h1><div style="text-align:center;font-size:1.1rem;color:var(--gold2);margin-bottom:6px">${esc(h.nama)}</div>${h.leg ? `<div id="pmap">${U.mapSvg({ leg: h.leg })}</div>` : ''}${U.dayHtml(id, S.mode)}${extra || ''}<div class="row"><button class="btn ghost" id="refb">📖 Rujukan</button><button class="btn pri" id="ok">Mulai hari ini</button></div><p class="disc">Jam dan skema pergerakan di lapangan diatur pemerintah Saudi dan pembimbing rombongan; urutan di sini adalah urutan ibadah menurut tuntunan.</p>`);
    s.in_.querySelector('#refb').onclick = () => openRef('hari');
    await G(new Promise(r => { s.in_.querySelector('#ok').onclick = () => { s.close(); r(); }; }));
  }
  async function travel(leg, title, note, doaId, secs) {
    await G(fade(1)); showHud(false);
    const d = doaId ? D.DOA[doaId] : null, r = D.RUTE[leg];
    const s = screen(`<div style="text-align:center;padding-top:3vh"><h1>${esc(title)}</h1>${r ? `<div id="pmap">${U.mapSvg({ leg })}</div>` : ''}${d ? `<div class="ar" style="font-size:1.3rem;line-height:2">${d.ar}</div><p class="lat">${esc(d.lat)}</p>` : ''}<p style="color:var(--mut)">${note || ''}</p><div class="prog" style="max-width:340px;margin:14px auto"><b id="tp"></b></div><div class="row"><button class="btn ghost" id="skip">Lewati</button></div></div>`, '');
    s.sc.style.zIndex = 19; s.sc.style.background = 'radial-gradient(ellipse at 50% 10%,#2b2412,#000 75%)';
    if (d) speak(d.ar);
    await G(fade(0));
    await G(new Promise(res => { let k = 0; const iv = setInterval(() => { k += 3 * Math.min(S.speed, 3); s.in_.querySelector('#tp').style.width = Math.min(100, k) + '%'; if (k >= 100) { clearInterval(iv); res(); } }, 110); s.in_.querySelector('#skip').onclick = () => { clearInterval(iv); res(); }; }));
    await G(fade(1)); s.close();
  }
  const sleepMsg = (title, msg, doaId) => modal({ title, html: `<p>${msg}</p>${doaId ? doa(doaId) : ''}`, speak: doaId ? D.DOA[doaId].ar : null, buttons: [{ label: 'Lanjut', value: true, pri: true }] });

  /* =============== Pengantar =============== */
  async function sIntro() {
    showHud(false); closeAllUI();
    await new Promise(res => {
      const s = screen(`<svg class="logo" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#16140f"/><circle cx="256" cy="256" r="196" fill="none" stroke="#c9a24e" stroke-width="10" opacity=".35"/><circle cx="256" cy="256" r="150" fill="none" stroke="#c9a24e" stroke-width="10" opacity=".6"/><circle cx="256" cy="256" r="104" fill="none" stroke="#c9a24e" stroke-width="10" opacity=".9"/><rect x="206" y="206" width="100" height="100" rx="6" fill="#0a0a0a" stroke="#c9a24e" stroke-width="6"/><rect x="206" y="234" width="100" height="14" fill="#c9a24e"/></svg>
      <h1 style="text-align:center">Perjalanan Haji 3D</h1>
      <p style="text-align:center;color:var(--mut)">Miqat, ihram, Masjidil Haram, 8 Dzulhijjah ke Mina, wukuf di Arafah, mabit di Muzdalifah, jumrah dan tahalul, thawaf ifadhah, hari tasyriq, sampai thawaf wada'. Pilih haji <b>tamattu'</b>, <b>ifrad</b>, atau <b>qiran</b>.</p>
      <div class="note dlg" style="margin:14px 0;padding:12px 14px"><b>Cara bermain.</b> Ikuti suar emas dan petunjuk di kiri atas. Gerak: joystick layar atau <b>W A S D / panah</b>; menoleh: seret layar atau <b>Q/E</b>; lari: <b>Shift</b>; ganti kamera (orang ketiga/pertama/dari atas): <b>C</b>; aksi: <b>Spasi/Enter</b>; zoom: roda tetikus. Tombol kanan atas: peta (<b>M</b>), buku doa (<b>B</b>), rukun-wajib-dam (<b>R</b>).</div>
      <p><b>Anda berhaji sebagai:</b></p><div id="gsel"></div>
      <p><b>Kecepatan jalan:</b> <span style="color:var(--mut);font-size:.85rem">(jarak dan waktu diringkas; gunakan Cepat bila ingin singkat)</span></p><div id="ssel"></div>
      <p><label class="chip" id="sp"></label><label class="chip" id="jy"></label></p>
      <div class="row"><button class="btn ghost" id="b1">📖 Buku doa</button><button class="btn ghost" id="b2">📋 Rukun · Wajib · Dam</button><button class="btn ghost" id="b3">🗓 Kalender hari</button></div>
      <div class="row"><button class="btn pri" id="go">Mulai perjalanan</button></div>
      <p class="disc">Prototipe DRAF. Seluruh model bangunan, jarak, dan posisi bersifat skematis (bukan model survei). Susunan tata cara mengikuti mazhab Syafi'i (selaras bimbingan manasik Kemenag RI) dengan catatan mazhab lain; doa, dalil, dan angka dam belum ditinjau ulama. Skema pergerakan di Armuzna diatur pemerintah Saudi dan dapat berubah tiap tahun. Game ini tidak menggantikan bimbingan manasik resmi.</p>`);
      const mk = (host, list, cur, fn) => { host.innerHTML = ''; list.forEach(([v, t]) => { const b = el('button', 'chip' + (v === cur ? ' sel' : ''), t); b.onclick = () => { fn(v); mk(host, list, v, fn); }; host.appendChild(b); }); };
      mk($('gsel'), [['pria', 'Pria'], ['wanita', 'Wanita']], S.gender, v => { S.gender = v; persist(); avatar.build(); });
      mk($('ssel'), [[1, 'Normal'], [2, 'Cepat ×2'], [4, 'Sangat cepat ×4']], S.speed, v => { S.speed = v; persist(); });
      const tog = (id, lbl, key) => { const e = $(id); const r = () => { e.textContent = (S[key] ? '☑ ' : '☐ ') + lbl; e.classList.toggle('sel', S[key]); }; r(); e.onclick = () => { S[key] = !S[key]; persist(); r(); if (key === 'joy') document.body.classList.toggle('nojoy', !S.joy); }; };
      tog('sp', 'Suara bacaan doa', 'speech'); tog('jy', 'Joystick layar', 'joy');
      $('b1').onclick = () => openRef('doa'); $('b2').onclick = () => openRef('rukun'); $('b3').onclick = () => openRef('hari');
      $('go').onclick = () => { s.close(); res(); };
    });
  }

  /* =============== Pilih jenis haji =============== */
  async function sMode() {
    showHud(false); closeAllUI(); clearTargets(); ring(null);
    useScene('haram'); place(L.start, 0);
    await G(new Promise(res => {
      const s = screen(`<h1>Pilih jenis haji</h1><p style="color:var(--mut)">Tiga cara menunaikan haji. Ketiganya sah dan mengikuti tuntunan; yang berbeda adalah urutan dan kewajiban dam. Pilih satu untuk memulai perjalanan.</p><div id="mm"></div><div class="row"><button class="btn ghost" id="cmp">Bandingkan ketiganya</button><button class="btn pri" id="nx" disabled>Lanjut ke miqat</button></div><p class="disc">Umrah dahulu lalu haji = Tamattu'. Haji dahulu lalu umrah = Ifrad (umrah opsional setelah haji). Digabung = Qiran.</p>`);
      const host = s.in_.querySelector('#mm'), nx = s.in_.querySelector('#nx');
      const draw = () => { host.innerHTML = ''; Object.keys(D.MODE).forEach(k => { const m = D.MODE[k]; const b = el('button', 'mode' + (S.mode === k ? ' sel' : ''), `<h3>${m.ikon} ${esc(m.nama)} — ${esc(m.ringkas)}</h3><small>${esc(m.alur)}</small><ul>${m.ciri.map(c => `<li>${esc(c)}</li>`).join('')}</ul><small style="margin-top:6px">${esc(m.mazhab)}</small>`); b.onclick = () => { S.mode = k; draw(); nx.disabled = false; }; host.appendChild(b); }); };
      draw();
      s.in_.querySelector('#cmp').onclick = () => modal({ title: 'Perbandingan jenis haji', wide: true, html: U.modeCompareHtml() + `<p class="disc">Hanafi mewajibkan dua thawaf dan dua sa'i pada qiran; jumhur cukup satu.</p>`, buttons: [{ label: 'Tutup', value: true, pri: true }] });
      nx.onclick = () => { s.close(); res(); };
    }));
    rebuildFlow(); setDay('pra'); log('Jenis haji: ' + MODE().nama);
    await G(modal({ title: MODE().nama, sub: MODE().ringkas, html: `<p>${esc(MODE().alur)}</p><div class="note"><b>Dam nusuk (hadyu):</b> ${MODE().dam ? 'WAJIB' : 'tidak wajib'}.</div>`, buttons: [{ label: 'Pilih miqat', value: true, pri: true }] }));
  }

  /* =============== Peta miqat =============== */
  function mapScreen() {
    return new Promise(res => {
      const x = lon => (lon - 37.4) * 129.8, y = lat => (25.0 - lat) * 140, mk = D.KAABA;
      const coast = D.PANTAI.map(p => `${x(p[1]).toFixed(1)},${y(p[0]).toFixed(1)}`).join(' L');
      let svg = `<svg viewBox="0 0 560 770" preserveAspectRatio="xMidYMid meet"><rect width="560" height="770" fill="#2b2616"/><path d="M0,0 L${coast} L0,770 Z" fill="#0f3547"/><text x="40" y="440" fill="#5f8fa3" font-size="18" font-style="italic">Laut Merah</text>`;
      svg += `<circle cx="${x(mk.lon)}" cy="${y(mk.lat)}" r="22" fill="rgba(241,211,107,.12)" stroke="#f1d36b" stroke-dasharray="4 3"/><text x="${x(mk.lon) - 150}" y="${y(mk.lat) + 36}" fill="#f1d36b" font-size="13" stroke="#000" stroke-width="3" paint-order="stroke">batas Haram (skematis)</text><g id="lnk"></g>`;
      D.SEKITAR.forEach(c => { svg += `<rect x="${x(c.lon) - 5}" y="${y(c.lat) - 5}" width="10" height="10" fill="${c.nama.startsWith('Makkah') ? '#111' : '#9aa'}" stroke="${c.nama.startsWith('Makkah') ? '#f1d36b' : '#fff'}" stroke-width="2"/><text x="${x(c.lon) + (c.nama === 'Madinah' ? -62 : 10)}" y="${y(c.lat) + (c.nama === 'Madinah' ? 20 : 4)}" fill="#cfd8dc" font-size="16" stroke="#000" stroke-width="3" paint-order="stroke">${esc(c.nama)}</text>`; });
      D.MIQAT.forEach(m => { svg += `<g class="mq" data-id="${m.id}"><circle cx="${x(m.lon)}" cy="${y(m.lat)}" r="11"/><text x="${x(m.lon) + 15}" y="${y(m.lat) - 8}">${esc(m.nama)}</text></g>`; });
      svg += '</svg>';
      const s = screen(`<h1>Tahap 1 — Tentukan miqat</h1><p style="color:var(--mut)">Miqat adalah batas yang tidak boleh dilewati orang yang hendak umrah atau haji tanpa berihram. Pilih <b>dari mana Anda datang</b>, lalu <b>sentuh miqat</b> yang sesuai di peta. Anda memilih: <b>${esc(MODE().nama)}</b>.</p><div id="asal"></div><div id="mapwrap">${svg}</div><div id="info" class="dlg" style="margin:0 auto"></div><div class="row"><button class="btn ghost" id="hint">Tampilkan petunjuk</button><button class="btn pri" id="pick" disabled>Pilih miqat ini</button></div><p class="disc">Peta skematis dan koordinat miqat perkiraan; ikuti papan penanda resmi dan arahan pembimbing/maskapai. Hadits dasar: Nabi saw. menetapkan miqat bagi penduduk Madinah, Syam, Najd, dan Yaman (HR. al-Bukhari dan Muslim dari Ibnu 'Abbas).</p>`);
      const in_ = s.in_; let asal = null, sel = null, solved = false;
      const asalHost = in_.querySelector('#asal'), info = in_.querySelector('#info'), pick = in_.querySelector('#pick');
      const drawAsal = () => { asalHost.innerHTML = ''; D.ASAL.forEach(a => { const b = el('button', 'chip' + (asal === a.id ? ' sel' : ''), `<b>${esc(a.label)}</b><br><small style="color:var(--mut)">${esc(a.sub)}</small>`); b.onclick = () => { asal = a.id; drawAsal(); upd(); }; asalHost.appendChild(b); }); };
      const upd = () => {
        in_.querySelectorAll('.mq').forEach(g => g.classList.toggle('sel', g.dataset.id === sel));
        const m = D.MIQAT.find(m => m.id === sel);
        if (!m) { info.innerHTML = '<div class="sub">Sentuh salah satu titik emas pada peta.</div>'; pick.disabled = true; return; }
        info.innerHTML = `<h2>${esc(m.nama)}</h2><div class="sub">${esc(m.alias)} · arah ${esc(m.arah)} · ± ${Math.round(hav(m, mk))} km garis lurus ke Ka'bah</div><p><span class="tag">Untuk</span>${esc(m.untuk)}</p><p style="color:var(--mut);font-size:.9rem">${esc(m.cat)}</p>`;
        pick.disabled = !asal;
        in_.querySelector('#lnk').innerHTML = `<line x1="${x(m.lon)}" y1="${y(m.lat)}" x2="${x(mk.lon)}" y2="${y(mk.lat)}" stroke="#f1d36b" stroke-width="3" stroke-dasharray="8 6"/>`;
      };
      in_.querySelectorAll('.mq').forEach(g => g.onclick = () => { if (solved) return; sel = g.dataset.id; upd(); });
      in_.querySelector('#hint').onclick = () => { if (!asal) { toast('Pilih dulu asal perjalanan Anda.'); return; } const a = D.ASAL.find(a => a.id === asal), m = D.MIQAT.find(m => m.id === a.miqat); toast(`Petunjuk: ${esc(a.label)} → miqat <b>${esc(m.nama)}</b>`, 5000); sel = m.id; upd(); };
      pick.onclick = () => {
        if (!asal) { toast('Pilih asal perjalanan dulu.'); return; }
        const a = D.ASAL.find(a => a.id === asal), m = D.MIQAT.find(m => m.id === sel);
        if (a.miqat === sel) {
          solved = true; S.quizOk++; S.quizAll++;
          info.innerHTML = `<h2>✅ Tepat: ${esc(m.nama)}</h2><p>${esc(a.label)} berihram dari <b>${esc(m.nama)}</b>. ${esc(m.cat)}</p>`;
          pick.textContent = 'Menuju miqat'; pick.disabled = false; pick.onclick = () => { s.close(); res(sel); };
        } else {
          S.asalWrong++; S.quizAll++; const right = D.MIQAT.find(x => x.id === a.miqat);
          info.innerHTML += `<div class="note" style="border-color:var(--bad)">❌ Kurang tepat. ${esc(a.label)} memakai miqat <b>${esc(right.nama)}</b>, bukan ${esc(m.nama)}. Coba lagi atau tekan <i>Tampilkan petunjuk</i>.</div>`;
        }
      };
      drawAsal(); upd();
    });
  }
  async function sMap() {
    showHud(false); closeAllUI(); clearTargets(); ring(null);
    if (!S.started) { S.started = true; S.time = 0; S.dist = 0; }
    useScene('haram'); place(L.start, 0); setDay('pra');
    S.miqat = await G(mapScreen());
  }

  /* =============== Ihram =============== */
  function checklist(intro) {
    return new Promise(res => {
      const items = shuffle(D.PERSIAPAN.filter(i => !i.dynGender || i.dynGender === S.gender));
      const txt = i => i.dyn === 'pakaian' ? (S.gender === 'pria' ? 'Berwudhu dan mengenakan dua kain ihram putih tak berjahit (izar dan rida)' : 'Berwudhu dan mengenakan pakaian yang menutup aurat (wajah dan telapak tangan terbuka)') : i.t;
      const sel = new Set();
      modal({
        title: 'Persiapan ihram', sub: (intro || '') + 'Centang <b>hanya</b> hal yang tepat dilakukan sebelum niat, lalu tekan <i>Periksa</i>.', html: '<div id="list"></div>', buttons: [], build(d, close, row) {
          const list = d.querySelector('#list'), nodes = [];
          items.forEach(i => { const b = el('button', 'opt chk', `<i></i><div><span>${esc(txt(i))}</span><div class="fb"></div></div>`); b.onclick = () => { sel.has(i) ? sel.delete(i) : sel.add(i); b.classList.toggle('sel'); b.classList.remove('wrong', 'good'); b.querySelector('.fb').textContent = ''; }; list.appendChild(b); nodes.push(b); });
          const ck = el('button', 'btn pri', 'Periksa'); row.appendChild(ck);
          ck.onclick = () => {
            let wrong = 0; items.forEach((i, k) => { const bad = sel.has(i) !== i.ok; nodes[k].classList.remove('wrong', 'good'); if (bad) { wrong++; nodes[k].classList.add('wrong'); nodes[k].querySelector('.fb').textContent = (i.ok ? 'Seharusnya dilakukan. ' : 'Jangan dilakukan. ') + i.why; } else if (sel.has(i)) nodes[k].classList.add('good'); });
            if (wrong) { S.prepWrong += wrong; toast(`${wrong} pilihan belum tepat — baca penjelasannya.`); } else { S.quizOk++; S.quizAll++; close(true); res(true); }
          };
        }
      });
    });
  }
  async function dressIhram() {
    await G(fade(1)); avatar.a.setMode('ihram'); await G(fade(0));
    toast(S.gender === 'pria' ? 'Anda kini berpakaian ihram: dua kain putih tak berjahit.' : 'Anda kini berpakaian ihram: busana menutup aurat, wajah dan telapak tangan terbuka.', 4500);
  }
  async function sIhram() {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    const id = S.miqat || 'yalamlam', w = ensureScene('miqat:' + id, getWorld('miqat:' + id).spawn, 0);
    avatar.a.setMode('normal'); setDay('pra');
    const m = D.MIQAT.find(m => m.id === id);
    obj('Tahap 2 — Persiapan ihram', `Miqat ${m.nama}`, 'Berjalan ke Ruang Ihram (bangunan di kanan, suar emas).');
    await G(goTo({ pos: w.ihram, r: 6, label: 'Masuk Ruang Ihram' }));
    await G(checklist());
    await G(dressIhram());
    await G(modal({ title: 'Larangan ihram', sub: 'Sebelum berniat, kenali larangannya.', html: `<p>Setelah niat berlaku larangan: wewangian, memotong kuku/rambut, berburu, akad nikah, hubungan suami-istri, dan bagi pria menutup kepala serta memakai pakaian berjahit; bagi wanita cadar dan sarung tangan. Boleh atau dilarang? Jawab 6 soal berikut.</p><div class="note">Pelanggaran dapat berakibat fidyah (dam) sesuai jenisnya — lihat tabel di <b>Pusat Rujukan</b> (tombol kanan atas atau tombol <b>R</b>).</div>`, buttons: [{ label: 'Mulai kuis', value: true, pri: true }] }));
    const r = await G(quizBin(D.LARANGAN, 6, 'Larangan ihram'));
    await G(modal({ title: `Skor larangan: ${r}/6`, html: r >= 5 ? '<p>Bagus! Anda siap berniat.</p>' : '<p>Tidak apa-apa; ulangi lewat menu <b>Tahap</b> bila ingin berlatih lagi.</p>', buttons: [{ label: 'Menuju garis miqat', value: true, pri: true }] }));
  }
  async function niatSequence(kind, scene, o) {
    o = o || {};
    const m = MODE(), niatId = kind === 'umrah' ? 'niatUmrah' : kind === 'haji' ? 'niatHaji' : kind === 'qiran' ? 'niatQiran' : kind === 'tamattu' ? 'niatTamattu' : 'niatUmrah';
    const idId = kind === 'qiran' ? 'niatQiranId' : (kind === 'haji') ? 'niatHajiId' : 'niatUmrahId';
    await G(modal({
      title: o.title || 'Niat ihram', sub: 'Hadap kiblat atau arah perjalanan, lalu ucapkan.', speak: D.DOA[niatId].ar,
      html: doa(niatId) + '<hr style="border-color:var(--line)">' + doa(idId) + (o.note || '') + `<div class="note"><b>Opsional (isytirath):</b> bila khawatir terhalang sakit, boleh menambahkan syarat:<div class="ar" style="font-size:1.3rem">${D.DOA.mahilli.ar}</div><div class="lat">${esc(D.DOA.mahilli.lat)}</div><div class="src">${esc(D.DOA.mahilli.sumber)}</div></div>`, buttons: [{ label: 'Saya sudah berniat', value: true, pri: true }]
    }));
    await G(modal({
      title: 'Talbiyah', sub: S.gender === 'pria' ? 'Pria mengeraskan suara.' : 'Wanita melirihkan suara.', speak: D.DOA.talbiyah.ar, html: doa('talbiyah') + '<div class="prog"><b id="tb"></b></div><div class="sub" id="tn" style="text-align:center">0 / 3 — tekan <i>Ucapkan</i> tiap kali Anda melafalkan.</div>', buttons: [],
      build(d, close, row) { let n = 0; const say = el('button', 'btn pri', 'Ucapkan talbiyah'), go = el('button', 'btn', 'Lanjut'); go.disabled = true; row.append(say, go); say.onclick = () => { n++; speak(D.DOA.talbiyah.ar); d.querySelector('#tb').style.width = Math.min(100, n / 3 * 100) + '%'; d.querySelector('#tn').textContent = `${Math.min(n, 3)} / 3${n >= 3 ? ' — boleh diteruskan; perbanyak talbiyah sepanjang jalan.' : ''}`; if (n >= 3) { go.disabled = false; go.classList.add('pri'); } }; go.onclick = () => close(true); }
    }));
    S.ihram = true; toast('<b>Anda sudah berihram.</b> Larangan ihram kini berlaku.', 5000);
  }
  async function sNiat() {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    const id = S.miqat || 'yalamlam', w = getWorld('miqat:' + id);
    if (S.cur !== 'miqat:' + id || S.fresh) { useScene('miqat:' + id); place(V3(28, 0, -6), faceYaw(V3(28, 0, -6), w.line)); S.fresh = false; }
    avatar.a.setMode('ihram');
    const m = D.MIQAT.find(m => m.id === id), md = MODE();
    obj('Tahap 3 — Niat ihram', `Menuju garis miqat ${m.nama}`, 'Niat dilakukan sebelum melewati garis miqat.');
    await G(goTo({ pos: w.line, r: 7, label: `Berniat ihram ${md.ringkas.toLowerCase()}` }));
    const kind = md.ihram1 === 'umrah' ? 'tamattu' : md.ihram1;
    const note = S.mode === 'tamattu' ? `<div class="note"><b>Tamattu':</b> Anda berniat <b>umrah</b> sekarang; niat haji dilakukan nanti pada 8 Dzulhijjah dari Makkah. Wajib dam nusuk.</div>` : S.mode === 'ifrad' ? `<div class="note"><b>Ifrad:</b> Anda berniat <b>haji saja</b>. Anda akan tetap berihram sampai 10 Dzulhijjah.</div>` : `<div class="note"><b>Qiran:</b> Anda berniat <b>umrah dan haji sekaligus</b>; satu ihram, satu thawaf dan sa'i, dan wajib dam nusuk.</div>`;
    await G(niatSequence(kind, 'miqat', { note, title: `Niat ihram — ${md.nama}` }));
    await G(modal({ title: 'Anda telah berihram', html: `<p>Teruskan bertalbiyah selama perjalanan menuju Makkah. Jaga larangan ihram.</p><div class="note">Jarak ke Ka'bah dari ${esc(m.nama)} sekitar ${Math.round(hav(m, D.KAABA))} km (garis lurus).</div>`, buttons: [{ label: 'Berangkat ke Makkah', value: true, pri: true }] }));
  }

  /* =============== Masuk Masjidil Haram =============== */
  async function sHaram() {
    clearTargets(); closeAllUI(); ring(null);
    if (S.cur && S.cur.indexOf('miqat:') === 0 && !S.fresh) {
      const m = D.MIQAT.find(m => 'miqat:' + m.id === S.cur), km = m ? Math.round(hav(m, D.KAABA)) : 400;
      await travel(null, 'Perjalanan ke Makkah', `Bertalbiyah sepanjang jalan… ± ${km} km`, 'talbiyah');
      S.fresh = true;
    }
    ensureScene('haram', L.start, faceYaw(L.start, V3(0, 0, 0)), true); setCloth('ihram'); await G(fade(0)); showHud(true);
    obj('Tahap 4 — Masjidil Haram', 'Masuk melalui gerbang dengan kaki kanan', 'Ikuti suar emas ke gerbang barat daya.');
    await G(goTo({ pos: L.gateIn, r: 8, label: 'Masuk Masjidil Haram' }));
    await G(modal({ title: 'Doa masuk masjid', sub: 'Dahulukan kaki kanan.', speak: D.DOA.masukMasjid.ar, html: doa('masukMasjid') + '<div class="note">Saat pertama kali melihat Ka\'bah, berdoalah dengan doa terbaik yang Anda inginkan. Tidak ada doa khusus yang sahih; riwayat atsar \'Umar derajatnya diperselisihkan.</div>' + doa('umarKakbah'), buttons: [{ label: 'Masuk', value: true, pri: true }] }));
  }
  async function enterHaramShort(title) {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    ensureScene('haram', L.start, faceYaw(L.start, V3(0, 0, 0)), true); setCloth('afterHalq'); await G(fade(0));
    obj(title, 'Masuk Masjidil Haram', 'Ikuti suar emas ke gerbang barat daya.');
    await G(goTo({ pos: L.gateIn, r: 8, label: 'Masuk Masjidil Haram' }));
    toast(`Doa masuk masjid: <div class="ar">${D.DOA.masukMasjid.ar}</div>`, 4500);
  }

  /* =============== Thawaf =============== */
  const LM = () => {
    const A = c => Math.atan2(-c.z, c.x), rel = a => ((a - L.phi0) % (PI * 2) + PI * 2) % (PI * 2), hijr = W.kw(0, -W.K.b / 2);
    return [
      { n: "Multazam dan pintu Ka'bah", rel: rel(L.phi0 + .38) }, { n: 'Rukun Iraqi', rel: rel(A(L.corners.iraqi)) },
      { n: 'Hijr Ismail — thawaf harus di luar Hijr', rel: rel(A(hijr)) }, { n: 'Rukun Syami', rel: rel(A(L.corners.syami)) },
      { n: "Rukun Yamani — baca <i>Rabbana atina fid-dunya hasanah…</i>", rel: rel(A(L.corners.yamani)), doa: true }
    ].sort((a, b) => a.rel - b.rel);
  };
  const TV = {
    umrah: { stage: 'Thawaf umrah', ramal: true, ihram: true, nama: 'Thawaf umrah (rukun umrah)' },
    qudum: { stage: 'Thawaf qudum', ramal: true, ihram: true, nama: 'Thawaf qudum (sunnah tiba)' },
    umrah2: { stage: 'Thawaf umrah (setelah haji)', ramal: true, ihram: true, nama: 'Thawaf umrah dari Tan\'im' },
    ifadhah: { stage: 'Thawaf ifadhah', ramal: false, ihram: false, nama: 'Thawaf ifadhah (RUKUN HAJI)' },
    wada: { stage: `Thawaf wada'`, ramal: false, ihram: false, nama: `Thawaf wada' (wajib haji)` }
  };
  async function askRingkas(what) {
    if (!S.did[what]) return false;
    return await G(modal({ title: 'Ulangi atau ringkas?', html: `<p>Anda sudah pernah menjalani ${what === 'thawaf' ? 'thawaf' : what === 'sai' ? "sa'i" : 'bagian ini'} penuh. Ingin mengulang secara lengkap atau meringkas (animasi singkat)?</p>`, buttons: [{ label: 'Ringkas', value: true, pri: true }, { label: 'Ulangi penuh', value: false }] }));
  }
  async function runThawaf(v) {
    const cfg = TV[v]; clearTargets(); closeAllUI(); showHud(true); ring(null);
    const a0 = L.phi0 - .55, sp = V3(Math.cos(a0) * 26, 0, -Math.sin(a0) * 26);
    ensureScene('haram', sp, a0);
    if (cfg.ihram) avatar.a.setMode('ihram', false); else setCloth('afterHalq');
    const ring_ = await askRingkas('thawaf');
    obj(cfg.stage, 'Menuju garis Hajar Aswad', 'Garis cokelat di lantai sejajar sudut Hajar Aswad.');
    if (!ring_) await G(goTo({ pos: L.garis, r: 5.5, label: 'Mulai thawaf (istilam)' })); else place(L.garis, a0);
    await G(modal({
      title: cfg.nama, sub: 'Istilam dan niat thawaf', speak: D.DOA.istilam.ar,
      html: `<p>Menghadap Hajar Aswad${cfg.ihram ? ', <b>berhentilah bertalbiyah</b> (umrah) ' : ' '}lalu ucapkan:</p>${doa('istilam')}${doa('niatThawaf')}<div class="note">Thawaf <b>berlawanan arah jarum jam</b>, Ka'bah di sebelah <b>kiri</b>. Tujuh putaran. ${cfg.ramal ? (S.gender === 'pria' ? '<br><b>Pria:</b> bahu kanan dibuka (idhtiba\') dan pada tiga putaran pertama melangkah cepat-pendek (ramal).' : '<br><b>Wanita:</b> berjalan biasa tanpa ramal/idhtiba\'.') : '<br>Ramal dan idhtiba\' <b>tidak</b> dikerjakan pada thawaf ini (hanya pada thawaf yang diikuti sa\'i).'}${v === 'ifadhah' ? `<br><b>Rukun haji.</b> Dikerjakan setelah tengah malam 10 Dzulhijjah; tidak ada batas akhir namun disegerakan.` : ''}${v === 'wada' ? `<br><b>Wajib haji</b> bagi yang akan meninggalkan Makkah; gugur bagi wanita haid/nifas.` : ''}</div>`, buttons: [{ label: 'Mulai thawaf', value: true, pri: true }]
    }));
    if (ring_) {
      await G(fade(1)); ring(7, 7, 'putaran selesai'); await G(fade(0)); toast('Thawaf 7 putaran (diringkas) selesai.', 3000); ring(null);
    } else {
      const phi = Math.atan2(-P.pos.z, P.pos.x);
      S.th = { on: true, cum: 0, prev: phi, maxCum: 0, laps: 0, lm: LM(), prevRel: ((phi - L.phi0) % (PI * 2) + PI * 2) % (PI * 2), seen: {}, warn: 0, stage: cfg.stage, ramal: cfg.ramal };
      if (cfg.ihram && S.gender === 'pria') avatar.a.setMode('ihram', true);
      obj(cfg.stage, 'Putaran 1 dari 7', "Jaga Ka'bah di sebelah kiri. Tetap di luar Hijr Ismail.");
      ring(0, 7, "putaran selesai<br><small>Ka'bah di kiri</small>");
      toast(cfg.ramal && S.gender === 'pria' ? 'Ramal: langkah cepat-pendek pada putaran 1–3.' : 'Thawaf dimulai. Berjalan biasa.', 4500);
      await G(new Promise(r => { S.th.done = r; }));
      S.th.on = false; ring(null);
    }
    if (cfg.ihram) avatar.a.setMode('ihram', false);
    S.did.thawaf = true;
    await G(modal({ title: 'Thawaf tujuh putaran selesai', html: `<p>Alhamdulillah. ${cfg.ihram ? 'Ratakan kembali kain ihram menutup bahu (pria). ' : ''}Uji pemahaman Anda.</p>`, buttons: [{ label: 'Kuis', value: true, pri: true }] }));
    await G(mini(v === 'ifadhah' ? ['thawaf', 'rukun'] : v === 'wada' ? ['thawaf', 'dam'] : ['thawaf'], S.did.thawaf2 ? 2 : 3, 'Kuis thawaf')); S.did.thawaf2 = true;
  }
  async function runMaqam(withSai) {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    const a = V3(L.sholat.x * 1.8, 0, L.sholat.z * 1.8); ensureScene('haram', a, faceYaw(a, L.sholat));
    obj('Setelah thawaf', 'Shalat dua rakaat di belakang Maqam Ibrahim', 'Bila ramai, shalat di mana saja di Masjidil Haram.');
    await G(goTo({ pos: L.sholat, r: 3.5, label: 'Shalat sunnah thawaf' }));
    await G(modal({ title: 'Shalat dua rakaat thawaf', speak: D.DOA.maqam.ar, html: `<p>Sambil mendekati Maqam Ibrahim:</p>${doa('maqam')}<div class="note">Rakaat pertama sesudah al-Fatihah: <b>al-Kafirun</b>; rakaat kedua: <b>al-Ikhlas</b> (HR. Muslim, hadits Jabir). Bila padat, shalatlah di tempat lain yang lapang tanpa mengganggu thawaf.</div>`, buttons: [{ label: 'Selesai shalat', value: true, pri: true }] }));
    obj('Setelah thawaf', 'Minum air Zamzam', 'Stasiun Zamzam di tepi mataf (suar emas).');
    await G(goTo({ pos: L.zamzam, r: 6, label: 'Minum Zamzam' }));
    await G(modal({ title: 'Minum Zamzam', speak: D.DOA.zamzam.ar, html: `<p>Minumlah sambil menghadap kiblat, berdoa dengan niat baik.</p>${doa('zamzam')}${withSai ? `<div class="note">Disunnahkan kembali ber-istilam (mengusap/mengisyaratkan Hajar Aswad) sebelum keluar menuju Shafa (HR. Muslim, hadits Jabir).</div>` : ''}`, buttons: [{ label: withSai ? 'Menuju Shafa' : 'Lanjut', value: true, pri: true }] }));
  }

  /* =============== Sa'i =============== */
  async function runSai(v) {
    const label = v === 'umrah' ? "Sa'i umrah" : v === 'qudum' ? "Sa'i haji (setelah thawaf qudum)" : "Sa'i haji";
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    const s0 = V3(62, 0, 4); ensureScene('haram', s0, faceYaw(s0, L.safa));
    if (v === 'umrah' || v === 'qudum') avatar.a.setMode('ihram', false); else setCloth('afterHalq');
    const rk = await askRingkas('sai');
    obj(label, 'Menuju bukit Shafa', "Keluar dari gerbang timur mataf; hall Mas'a di timur.");
    if (!rk) await G(goTo({ pos: L.safa, r: 7, label: 'Naik ke Shafa' })); else place(L.safa, faceYaw(L.safa, V3(89, 0, L.marwahZ)));
    await G(modal({
      title: `Mulai ${label.toLowerCase()} di Shafa`, speak: D.DOA.safa.ar,
      html: `<p>Mendekati Shafa bacalah:</p>${doa('safa')}<p>Hadap Ka'bah, bertakbir tiga kali, lalu:</p>${doa('dzikirSafa')}<div class="note">Berjalan dari <b>Shafa ke Marwah = 1</b>, Marwah ke Shafa = 2, … lintasan ketujuh berakhir di <b>Marwah</b>. ${S.gender === 'pria' ? 'Pria berlari kecil di antara dua tanda hijau.' : 'Wanita berjalan biasa, termasuk di zona hijau.'} Jarak sekitar 394 m per lintasan.${v === 'qudum' ? ` Sa'i ini dihitung sebagai <b>sa'i haji</b>; setelah thawaf ifadhah tidak perlu sa'i lagi.` : ''}${S.mode === 'qiran' ? ` Pada qiran, sa'i ini mencukupi umrah dan haji (jumhur).` : ''}</div>`, buttons: [{ label: `Mulai sa'i`, value: true, pri: true }]
    }));
    if (rk) { await G(fade(1)); ring(7, 7, 'lintasan selesai'); await G(fade(0)); place(V3(89, 0, L.marwahZ + 8), faceYaw(V3(89, 0, L.marwahZ + 8), V3(89, 0, L.marwahZ - 30))); toast("Sa'i 7 lintasan (diringkas) selesai.", 3000); ring(null); }
    else {
      S.sai = { on: true, lap: 0, dir: -1, inGreen: false, stage: label };
      obj(label, 'Lintasan 1 dari 7: Shafa → Marwah', S.gender === 'pria' ? 'Di zona hijau, pria berlari kecil.' : 'Berjalan biasa.');
      ring(0, 7, 'lintasan selesai<br><small>Shafa → Marwah</small>');
      await G(new Promise(r => { S.sai.done = r; }));
      S.sai.on = false; ring(null);
    }
    S.did.sai = true;
    const end = v === 'umrah' ? 'Anda berakhir di Marwah. Tinggal <b>tahalul</b>.' : v === 'qudum' ? `Anda berakhir di Marwah. Sa'i haji sudah tertunaikan. <b>Jangan bertahalul</b>: tetap berihram sampai 10 Dzulhijjah.` : 'Anda berakhir di Marwah.';
    await G(modal({ title: `${label} tujuh lintasan selesai`, html: `<p>${end}</p>${doa('rabbighfir')}`, speak: D.DOA.rabbighfir.ar, buttons: [{ label: "Kuis sa'i", value: true, pri: true }] }));
    await G(mini(['sai'], 2, "Kuis sa'i"));
  }

  /* =============== Tahalul (umrah) =============== */
  async function runTahalulUmrah(stageName) {
    clearTargets(); closeAllUI(); showHud(true); ring(null);
    const s0 = V3(89, 0, L.marwahZ + 8); ensureScene('haram', s0, faceYaw(s0, L.barber)); avatar.a.setMode('ihram', false);
    obj(stageName || 'Tahalul umrah', 'Menuju tempat cukur/potong rambut', 'Keluar dari gerbang utara Marwah; suar emas.');
    await G(goTo({ pos: V3(L.barber.x, 0, L.barber.z + 5.5), r: 5, label: 'Tahalul (halq/taqshir)' }));
    const pria = S.gender === 'pria';
    const ch = await G(modal({ title: 'Tahalul umrah', sub: pria ? 'Pilih cara tahalul.' : 'Tahalul wanita: memotong rambut.', html: `<div class="note">Tahalul menutup umrah: <b>halq</b> (mencukur) atau <b>taqshir</b> (memotong). ${pria ? `Halq lebih utama bagi pria; taqshir juga sah. Minimal tiga helai rambut menurut mazhab Syafi'i.` : 'Wanita memotong ujung rambut sepanjang ± satu ruas jari; tidak mencukur gundul.'}${isTam() ? `<br><b>Tamattu':</b> sebaiknya <b>taqshir</b> (dipotong) agar masih ada rambut untuk halq saat tahalul haji pada 10 Dzulhijjah (HR. al-Bukhari dan Muslim).` : ''}</div>${doa('tahalul')}`, speak: D.DOA.tahalul.ar, buttons: pria ? [{ label: 'Halq (cukur)', value: 'halq', pri: !isTam() }, { label: 'Taqshir (potong)', value: 'taqshir', pri: isTam() }] : [{ label: 'Taqshir (potong rambut)', value: 'taqshir', pri: true }] }));
    await G(fade(1)); avatar.a.setMode(ch === 'halq' ? 'halq' : 'normal'); S.ihram = false; S.afterHalq = ch === 'halq' ? 'halq' : 'normal'; await G(fade(0));
    toast('<b>Tahalul selesai.</b> Larangan ihram berakhir.', 5000);
    await G(mini(['tahalul'], 3, 'Kuis tahalul'));
  }

  /* ---- Tamattu': tahalul umrah dan masa bebas ihram ---- */
  async function sTahalulUmrah() { await runTahalulUmrah('Tahalul umrah'); }
  async function sBebas() {
    await G(modal({ title: 'Masa bebas ihram (tamattu\')', html: `<p>Anda telah bertahalul dari umrah: <b>pakaian biasa, wewangian, dan kuku/rambut</b> kembali halal. Anda tinggal di Makkah sampai <b>8 Dzulhijjah</b>.</p><div class="note">Ini yang membedakan tamattu' dari ifrad/qiran: ada jeda tanpa ihram, tetapi Anda <b>wajib dam nusuk</b> (hadyu) pada 10 Dzulhijjah. Perbanyak thawaf sunnah, shalat berjamaah di Masjidil Haram, dan persiapan fisik.</div>`, buttons: [{ label: 'Menuju 8 Dzulhijjah', value: true, pri: true }] }));
    log(`Tamattu': umrah selesai, tahalul`);
  }
  async function sIfradMenunggu() {
    await G(modal({ title: `Menanti 8 Dzulhijjah — tetap berihram`, html: `<p>Karena Anda ${S.mode === 'qiran' ? 'qiran' : 'ifrad'}, Anda <b>tidak bertahalul</b> setelah thawaf dan sa'i. Pakaian ihram dipertahankan dan semua larangan ihram terus berlaku sampai tahalul awal (10 Dzulhijjah).</p><div class="note">Hari-hari ini diisi thawaf sunnah, shalat berjamaah, dan menjaga ihram (tidak memotong kuku/rambut, tidak memakai wewangian).</div>`, buttons: [{ label: 'Menuju 8 Dzulhijjah', value: true, pri: true }] }));
  }

  /* =============== 8 Dz: ihram haji (tamattu') =============== */
  async function sIhramHaji() {
    clearTargets(); closeAllUI(); showHud(false);
    await dayCard('d8');
    showHud(true); setCloth('afterHalq');
    const w = ensureScene('makkah', getWorld('makkah').spawn, 0, true); setDay('d8'); setClock(6.2);
    obj('8 Dzulhijjah — Ihram haji', 'Menuju Ruang Ihram di tempat menginap', 'Tamattu\' berihram haji dari Makkah.');
    await G(goTo({ pos: w.ihram, r: 6, label: 'Masuk Ruang Ihram' }));
    await G(checklist('Persiapan ihram haji. '));
    await G(dressIhram());
    obj('8 Dzulhijjah — Ihram haji', 'Menuju tempat niat', 'Niat haji dilakukan sekarang.');
    await G(goTo({ pos: w.line, r: 7, label: 'Berniat haji' }));
    await G(niatSequence('haji', 'makkah', { title: 'Niat ihram haji (tamattu\')', note: `<div class="note">Anda berniat <b>haji</b> dari Makkah (tempat menginap). Penduduk Makkah berihram dari Makkah (HR. al-Bukhari dan Muslim).</div>` }));
  }

  /* =============== Mina 8 Dz (tarwiyah) =============== */
  async function sMina8() {
    clearTargets(); closeAllUI(); showHud(false);
    if (!isTam()) await dayCard('d8');
    setCloth('ihram');
    await travel('makMina', 'Berangkat ke Mina', 'Bertalbiyah sepanjang jalan. Jarak Makkah–Mina ± 6 km.', 'talbiyah');
    const w = ensureScene('mina', V3(-185, 0, 0), -PI / 2, true); w.env.set('morning', true); showHud(true); setDay('d8'); setClock(9.5); await G(fade(0));
    obj('8 Dzulhijjah — Tarwiyah', 'Menuju tenda di Mina', 'Ikuti suar emas; tenda Anda di sisi selatan.');
    await G(goTo({ pos: w.tent, r: 8, label: 'Masuk tenda' }));
    await G(modal({ title: 'Shalat di Mina', html: `<p>Hari ini sampai Subuh esok Anda shalat <b>Dzuhur, Ashar, Maghrib, Isya, dan Subuh</b> di Mina, pada waktunya masing-masing; yang empat rakaat diqashar menjadi dua, <b>tanpa jamak</b> (HR. Muslim, hadits Jabir).</p><div class="note"><b>Mabit di Mina malam 9 Dzulhijjah</b> hukumnya sunnah menurut Syafi'i. Perbanyak talbiyah, dzikir, dan istirahat untuk menyiapkan wukuf.</div>${doa('talbiyah')}`, speak: D.DOA.talbiyah.ar, buttons: [{ label: 'Bermalam di Mina', value: true, pri: true }] }));
    w.env.set('night'); await G(fade(1)); setClock(22); w.env.set('night', true); await G(wait(500)); await G(fade(0));
    await G(mini(['tarwiyah', 'ihram'], 3, 'Kuis Tarwiyah'));
  }

  /* =============== Arafah (9 Dz) =============== */
  const WUK_DOA = ['arafah', 'tasbih', 'istighfar1', 'sayyidul', 'abubakar', 'afwu', 'rabbana', 'zalamna', 'doaOrtu', 'taqabbal', 'huda', 'tsabbit', 'hajjMabrur'];
  async function sArafah() {
    clearTargets(); closeAllUI(); showHud(false);
    await dayCard('d9');
    await travel('minaArafah', 'Berangkat ke Arafah', 'Setelah terbit matahari 9 Dzulhijjah. Perbanyak talbiyah dan takbir. Jarak Mina–Arafah ± 14 km.', 'talbiyah');
    setCloth('ihram');
    const w = ensureScene('arafah', V3(-51, 0, 52), faceYaw(V3(-51, 0, 52), V3(-105, 0, -20)), true); w.env.set('morning', true); setDay('d9'); setClock(7.5); showHud(true); await G(fade(0));
    obj('9 Dzulhijjah — Arafah', 'Menuju Masjid Namirah', 'Singgah di Namirah hingga zawal, mendengarkan khutbah Arafah.');
    await G(goTo({ pos: V3(w.mhab.x, 0, w.mhab.z), r: 9, label: 'Masuk halaman Masjid Namirah' }));
    w.env.set('zenith'); setClock(11.8);
    await G(modal({ title: 'Khutbah Arafah', sub: 'Hampir zawal', html: `<p>Nabi saw. menyampaikan khutbah di Wadi 'Uranah (Namirah) sebelum shalat. Dalam khutbah wada' beliau menegaskan: <i>“Sesungguhnya darah dan harta kalian haram atas kalian…”</i>, menghapus riba dan tradisi jahiliah, berpesan agar memperlakukan wanita dengan baik, dan <b>berpegang pada Kitabullah dan Sunnah</b> (HR. Muslim, hadits Jabir).</p><div class="note">Bagian barat Masjid Namirah berada di <b>Wadi 'Uranah</b>, di luar Arafah. Shalat berjamaah di Namirah sah, tetapi <b>wukuf harus di dalam batas Arafah</b>.</div>`, buttons: [{ label: 'Lanjut: shalat jamak', value: true, pri: true }] }));
    setClock(12.2);
    await G(modal({ title: 'Shalat Dzuhur dan Ashar — jamak taqdim + qashar', sub: 'Satu adzan, dua iqamah', html: `<p>Setelah zawal, shalat <b>Dzuhur</b> dua rakaat, lalu <b>Ashar</b> dua rakaat, dikerjakan pada waktu Dzuhur dengan <b>satu adzan dan dua iqamah</b>, tanpa shalat sunnah di antaranya (HR. Muslim, hadits Jabir). Syafi'i: jamak dan qashar bagi musafir.</p>${doa('takbir')}`, buttons: [{ label: 'Selesai shalat', value: true, pri: true }] }));
    await G(mini(['arafah'], 2, 'Kuis Arafah — sebelum wukuf'));
    obj('9 Dzulhijjah — Wukuf', 'Menuju area wukuf (di dalam batas Arafah)', `Jangan berdiri di Wadi 'Uranah. Dekat Jabal Rahmah atau mana saja di dalam batas hijau.`);
    await G(goTo({ pos: V3(w.wukuf.x, 0, w.wukuf.z), r: 40, label: 'Mulai wukuf' }));
    S.did.wukuf = true;
    const dur = [80, 46, 28][S.speed === 4 ? 2 : S.speed === 2 ? 1 : 0];
    await G(modal({ title: 'Wukuf di Arafah', html: `<p><b>“Al-hajju Arafah.”</b> Wukuf adalah rukun terbesar. Hadir di Arafah sejak zawal hingga terbit fajar 10 Dzulhijjah sudah sah; sunnahnya bertahan sampai matahari terbenam, <b>berdoa menghadap kiblat</b> (ikon K pada peta mini), mengangkat tangan, dan banyak berdzikir.</p><div class="note">Selama jarum wukuf berjalan, tekan tombol <b>🤲 Berdoa</b> untuk membaca doa dan dzikir. <b>Waktu berhenti</b> bila Anda keluar dari batas Arafah atau berdiri di Wadi 'Uranah.</div>${doa('arafah')}`, speak: D.DOA.arafah.ar, buttons: [{ label: 'Mulai wukuf', value: true, pri: true }] }));
    log('Wukuf di Arafah');
    obj('9 Dzulhijjah — Wukuf', 'Berdoa, berdzikir, dan menghadap kiblat', 'Tetap di dalam batas Arafah hingga matahari terbenam. Tombol 🤲 membuka doa.');
    S.targets = []; const wp = startWukuf(dur);
    const openDoa = async () => { if (S.modal) return; const id = WUK_DOA[S.wuk.doaN++ % WUK_DOA.length], d = D.DOA[id]; await modal({ title: d.judul, sub: `Tingkat ${d.lvl} · ${D.ST[d.st]}`, html: doa(d), speak: d.ar, buttons: [{ label: 'Amin', value: true, pri: true }] }); };
    S.targets = [{ pos: P.pos, r: 1e9, label: '🤲 Berdoa & berdzikir', repeat: true, quiet: true, fn: openDoa }];
    await G(wp); clearTargets(); ring(null); $('wukbar').classList.add('hidden');
    setClock(18.1);
    await G(modal({ title: 'Matahari terbenam', html: `<p>Wukuf Anda tertunaikan. Karena Anda hadir sampai matahari terbenam, kewajiban bertahan sampai maghrib (menurut jumhur) terpenuhi.</p><div class="note">Sekarang <b>bergerak ke Muzdalifah dengan tenang</b> (“as-sakinah, as-sakinah!”, HR. al-Bukhari dan Muslim). <b>Jangan shalat Maghrib di Arafah</b>: “Shalat itu ada di depanmu” — Maghrib dan Isya dijamak di Muzdalifah.</div>`, buttons: [{ label: 'Berangkat ke Muzdalifah', value: true, pri: true }] }));
    await G(mini(['arafah', 'badal'], 3, 'Kuis wukuf'));
  }

  /* =============== Muzdalifah =============== */
  async function sMuzd() {
    clearTargets(); closeAllUI(); showHud(false);
    await dayCard('n10');
    await travel('arafahMuzd', 'Menuju Muzdalifah', 'Tenang dan tertib; bertalbiyah dan berdzikir. Jarak ± 9 km.', 'talbiyah');
    setCloth('ihram'); S.peb = S.peb || 0;
    const w = ensureScene('muzd', V3(255, 0, 5), faceYaw(V3(255, 0, 5), V3(200, 0, 20)), true); w.env.set('dusk', true); setDay('n10'); setClock(18.8); showHud(true); await G(fade(0)); w.env.set('night', false, .5);
    obj('Malam 10 Dzulhijjah — Muzdalifah', 'Menuju area shalat', 'Shalat Maghrib dan Isya dijamak di sini.');
    await G(goTo({ pos: V3(w.prayer.x, 0, w.prayer.z), r: 10, label: 'Shalat Maghrib + Isya (jamak)' }));
    setClock(19.6);
    await G(modal({ title: 'Shalat Maghrib dan Isya — jamak', html: `<p>Maghrib tiga rakaat lalu Isya dua rakaat (qashar), dikerjakan sekaligus dengan <b>satu adzan dan dua iqamah</b>, tanpa shalat sunnah di antaranya (HR. Muslim, hadits Jabir).</p><div class="note">Jamak <b>taqdim</b> (dikerjakan di waktu Maghrib) atau <b>ta'khir</b> (di waktu Isya) sama-sama boleh bila terlambat tiba. Muzdalifah adalah tempat <b>mabit</b> (wajib haji).</div>`, buttons: [{ label: 'Selesai shalat', value: true, pri: true }] }));
    S.collect = true; S.peb = 0; S.pebAll = 0;
    await G(modal({ title: 'Mengumpulkan kerikil jumrah', html: `<p>Jalanilah area Muzdalifah; kerikil yang berpendar akan <b>terambil otomatis</b> bila Anda mendekat.</p><div class="note"><b>Jumlah:</b> 7 untuk Jumrah 'Aqabah (10 Dz) · +21 per hari tasyriq → <b>49</b> (nafar awal) atau <b>70</b> (nafar tsani). <b>Ukuran:</b> seperti biji kacang / ujung jari, sekitar 1 cm. <b>Tempat:</b> boleh dari Muzdalifah atau mana saja; mengambil di Muzdalifah bukan syarat. Nabi saw. menyuruh Ibnu 'Abbas memungut kerikil lontar di pagi 'Aqabah.</div>`, buttons: [{ label: 'Mulai mengumpulkan', value: true, pri: true }] }));
    obj('Malam 10 Dzulhijjah — Muzdalifah', 'Kumpulkan minimal 7 kerikil', 'Lalu menuju tempat mabit.');
    ring(0, 7, `kerikil terkumpul<br><small>minimal 7 · sampai 49/70</small>`);
    await G(goTo({ pos: V3(w.rest.x, 0, w.rest.z), r: 14, label: 'Mabit (bermalam)', need: () => S.peb >= 7, needMsg: 'Kumpulkan minimal 7 kerikil dulu.' }));
    S.collect = false; ring(null);
    log(`Mabit di Muzdalifah; kerikil: ${S.peb}`);
    const pilih = await G(modal({ title: 'Mabit di Muzdalifah', html: `<p>Waktu tengah malam hampir tiba. Mana yang tepat untuk Anda?</p><div class="note">Menurut Syafi'i, mabit (wajib) sah dengan hadir di Muzdalifah pada separuh malam kedua, walau sebentar. Yang sehat sebaiknya menunggu Subuh dan wukuf di Masy'aril Haram; <b>yang lemah, wanita, lansia, dan pendampingnya boleh berangkat setelah tengah malam</b> (HR. al-Bukhari dan Muslim).</div>`, buttons: [{ label: 'Saya sehat: menunggu Subuh', value: 'sehat', pri: true }, { label: 'Saya lemah / pendamping: berangkat setelah tengah malam', value: 'lemah' }, { label: 'Langsung ke Mina sekarang (sebelum tengah malam)', value: 'cepat' }] }));
    let ch = pilih;
    if (ch === 'cepat') {
      await G(modal({ title: 'Belum memenuhi mabit', html: `<p>Berangkat <b>sebelum tengah malam</b> berarti Anda tidak hadir di separuh malam kedua. Mabit di Muzdalifah <b>wajib</b>; meninggalkannya tanpa uzur mewajibkan <b>dam (kambing)</b>.</p><div class="note">Anda diminta tinggal sampai lewat tengah malam atau sampai Subuh.</div>`, buttons: [{ label: 'Pilih ulang', value: true, pri: true }] }));
      ch = await G(modal({ title: 'Pilih cara mabit', html: '<p>Silakan pilih lagi.</p>', buttons: [{ label: 'Menunggu Subuh (sehat)', value: 'sehat', pri: true }, { label: 'Berangkat setelah tengah malam (uzur)', value: 'lemah' }] }));
    }
    await G(fade(1)); w.env.set('night', true); setClock(1.0); await G(wait(500)); await G(fade(0));
    if (ch === 'lemah') {
      S.flags.muzdUzur = true; log('Berangkat dari Muzdalifah setelah tengah malam (rukhsah)');
      await G(modal({ title: 'Rukhsah setelah tengah malam', html: `<p>Anda sudah hadir setelah tengah malam; mabit terpenuhi. Anda berangkat ke Mina lebih awal tanpa dam.</p>${doa('masyaril')}`, buttons: [{ label: 'Lanjut', value: true, pri: true }] }));
    } else {
      await G(fade(1)); w.env.set('dawn', true); setClock(4.9); await G(wait(400)); await G(fade(0));
      await G(modal({ title: 'Shalat Subuh', html: `<p>Shalat Subuh di <b>awal waktu</b> (Nabi saw. shalat Subuh saat fajar jelas; HR. Muslim, Jabir), kemudian menuju Masy'aril Haram.</p>`, buttons: [{ label: 'Selesai shalat', value: true, pri: true }] }));
      obj('10 Dzulhijjah — Masy\'aril Haram', 'Menuju Masy\'aril Haram untuk berdoa', 'Menghadap kiblat (ikon K pada peta mini).');
      showHud(true); await G(goTo({ pos: V3(w.masy.x, 0, w.masy.z), r: 14, label: `Wukuf di Masy'aril Haram` }));
      await G(modal({ title: `Wukuf di Masy'aril Haram`, speak: D.DOA.masyaril.ar, html: `<p>Menghadap kiblat, berdoa, bertakbir, bertahlil, dan bertauhid hingga langit sangat kuning (isfar) — lalu berangkat sebelum matahari terbit.</p>${doa('masyaril')}${doa('takbir')}`, buttons: [{ label: 'Amin', value: true, pri: true }] }));
      w.env.set('isfar'); setClock(5.7); await G(wait(900));
      log(`Wukuf di Masy'aril Haram`);
    }
    await G(mini(['muzd'], 3, 'Kuis Muzdalifah'));
  }

  /* =============== Mina 10 Dz =============== */
  const JN = { ula: 'Jumrah Ula', wustha: 'Jumrah Wustha', aqabah: `Jumrah 'Aqabah` };
  function ensureStock(n) { if (S.peb < n) { const add = n - S.peb; S.peb += add; toast(`Kerikil kurang — Anda mengambil <b>${add}</b> kerikil tambahan di sekitar Mina (boleh; hindari kerikil bekas lemparan).`, 4800); } }
  async function throwSeq(id, o) {
    o = o || {}; const w = getWorld('mina'), spot = w.throwSpot(id), look = V3(spot.x - 10, 0, 0);
    if (!o.auto) { obj(o.stage, `Menuju ${JN[id]}`, 'Berdiri di dekat dinding, lalu tekan tombol Lempar 7 kali.'); await G(goTo({ pos: spot, r: 14, label: `Mulai melempar ${JN[id]}` })); }
    else { place(spot, faceYaw(spot, look)); }
    ensureStock(7); ring(0, 7, `${JN[id]}<br><small>kerikil dilempar</small>`);
    for (let i = 1; i <= 7; i++) {
      obj(o.stage, `${JN[id]}: ${i - 1} dari 7`, 'Setiap lemparan disertai takbir: Allāhu akbar.');
      if (o.auto) await wait(200); else await G(goTo({ pos: spot, r: 14, label: `Lempar ${i}/7 — Allāhu akbar`, quiet: true }));
      throwPebble(id, S.speed); ring(i, 7, `${JN[id]}<br><small>kerikil dilempar</small>`); toast('Allāhu akbar', 800);
      await wait(o.auto ? 160 : 380);
    }
    ring(null); await wait(500);
  }
  async function jumrahDoa(id) {
    const lama = id !== 'aqabah';
    await G(modal({ title: lama ? `Berdoa setelah ${JN[id]}` : `Selesai ${JN[id]}`, html: lama ? `<p>Bergeser sedikit ke samping, <b>menghadap kiblat</b> (ikon K pada peta mini), angkat tangan, dan berdoa lama (HR. al-Bukhari, Ibnu 'Umar: ± selama membaca surat al-Baqarah).</p>${doa('rabbana')}${doa('hajjMabrur')}` : `<p>Setelah Jumrah 'Aqabah Anda <b>tidak berdoa</b> di tempat; langsung pergi (HR. al-Bukhari). Posisi melempar 'Aqabah: <b>Ka'bah di sisi kiri dan Mina di sisi kanan</b> (Ibnu Mas'ud, HR. al-Bukhari dan Muslim).</p>`, speak: lama ? D.DOA.rabbana.ar : null, buttons: [{ label: lama ? 'Selesai berdoa' : 'Lanjut', value: true, pri: true }] }));
  }
  async function sMina10() {
    clearTargets(); closeAllUI(); showHud(false);
    await dayCard('d10');
    await travel('muzdMina', 'Dari Muzdalifah ke Mina', `Melewati Wadi Muhassir: <b>percepat langkah</b> (HR. Muslim, Jabir). Berangkat sebelum matahari terbit; ± 5 km.`, 'talbiyah');
    setCloth('ihram');
    const w = ensureScene('mina', V3(255, 0, 0), faceYaw(V3(255, 0, 0), V3(150, 0, 0)), true); w.env.set('morning', true); setDay('d10'); setClock(6.9); showHud(true); await G(fade(0));
    const stage = '10 Dzulhijjah — Jumrah \'Aqabah';
    if (S.peb < 7) ensureStock(7);
    await throwSeq('aqabah', { stage });
    toast('Talbiyah dihentikan saat mulai melempar \'Aqabah.', 4200);
    await G(jumrahDoa('aqabah'));
    log(`Melempar Jumrah 'Aqabah (7 kerikil)`);
    setClock(8.2);
    // sembelih
    obj('10 Dzulhijjah — Hadyu', MODE().dam ? 'Menuju tempat penyembelihan' : 'Qurban (sunnah) — opsional', MODE().dam ? 'Suar emas di sisi selatan.' : 'Ifrad tidak wajib dam nusuk.');
    if (MODE().dam) {
      await G(goTo({ pos: V3(w.mj.x, 0, w.mj.z - 18), r: 8, label: 'Menyembelih hadyu / dam nusuk' }));
      const c = await G(modal({ title: `Hadyu (dam nusuk) ${isTam() ? "tamattu'" : 'qiran'}`, html: `<p>Anda wajib menyembelih <b>1 kambing</b> atau <b>⅐ unta/sapi</b> di tanah Haram (Mina atau Makkah) pada 10–13 Dzulhijjah (QS. al-Baqarah 196; al-Hajj 33). Daging boleh dimakan sebagian dan dibagikan kepada fakir miskin.</p>${doa('doaDam')}`, buttons: [{ label: 'Saya membayar / menyembelih (sendiri atau lewat lembaga resmi)', value: 'ok', pri: true }, { label: 'Saya tidak mampu: puasa 3 + 7 hari', value: 'puasa' }, { label: 'Saya tunda sampai di Indonesia', value: 'tunda' }] }));
      if (c === 'ok') { log('Dam nusuk (hadyu) ditunaikan'); toast('Hadyu ditunaikan. Boleh diwakilkan dan disembelih di tanah Haram.', 4200); }
      else if (c === 'puasa') { log('Dam nusuk: puasa 3 hari (sebelum 10 Dz) + 7 hari setelah pulang'); await G(modal({ title: 'Puasa pengganti', html: `<p>Bila tidak mampu hadyu: <b>puasa 3 hari dalam masa haji</b> (sebelum Idul Adha) dan <b>7 hari setelah pulang</b> ke tanah air (QS. al-Baqarah 196). Puasa pada hari Id dan tasyriq dilarang menurut Syafi'i (qaul jadid); sebagian ulama membolehkan hari tasyriq bagi yang tak mendapat hadyu.</p>`, buttons: [{ label: 'Paham', value: true, pri: true }] })); }
      else { S.asalWrong++; await G(modal({ title: 'Keliru: tidak boleh ditunda ke tanah air', html: `<p>Dam nusuk harus <b>disembelih di tanah Haram</b> pada waktunya (QS. al-Hajj 33); menunda atau menyembelih di Indonesia tidak sah sebagai hadyu. Gunakan lembaga penyembelihan resmi di Makkah/Mina. Bila tak mampu: puasa 3 + 7 hari.</p>`, buttons: [{ label: 'Saya paham', value: true, pri: true }] })); log('Dam nusuk ditunaikan (setelah dikoreksi)'); }
    } else {
      await G(modal({ title: 'Qurban (opsional) — ifrad', html: `<p>Pada haji ifrad <b>tidak wajib</b> dam nusuk; menyembelih qurban hanya <b>sunnah</b>. Anda dapat melewatinya.</p>`, buttons: [{ label: 'Lewati', value: true, pri: true }] }));
    }
    // cukur
    setClock(9.2);
    obj('10 Dzulhijjah — Tahalul awal', 'Menuju tempat cukur / potong rambut', 'Halq atau taqshir.');
    await G(goTo({ pos: V3(w.cuk.x, 0, w.cuk.z - 8), r: 8, label: 'Tahalul awal (halq/taqshir)' }));
    const pria = S.gender === 'pria';
    const ch = await G(modal({ title: 'Tahalul awal', sub: pria ? 'Pilih cara tahalul.' : 'Tahalul wanita: memotong rambut.', html: `<div class="note"><b>Halq/taqshir</b> adalah rukun haji. Tahalul awal tercapai setelah <b>dua dari tiga</b>: lempar 'Aqabah, halq/taqshir, thawaf ifadhah (+sa'i bila belum). Sekarang semua larangan ihram gugur <b>kecuali hubungan suami-istri</b>.${pria ? ' Halq lebih utama; Nabi saw. mendoakan yang halq tiga kali dan yang taqshir sekali (HR. al-Bukhari dan Muslim).' : ' Wanita memotong ujung rambut sepanjang ruas jari.'}</div>${doa('tahalul')}`, speak: D.DOA.tahalul.ar, buttons: pria ? [{ label: 'Halq (cukur)', value: 'halq', pri: true }, { label: 'Taqshir (potong)', value: 'taqshir' }] : [{ label: 'Taqshir (potong rambut)', value: 'taqshir', pri: true }] }));
    await G(fade(1)); avatar.a.setMode(ch === 'halq' ? 'halq' : 'normal'); S.afterHalq = ch === 'halq' ? 'halq' : 'normal'; await G(fade(0));
    S.flags.tahalulAwal = true; log('Tahalul awal'); toast('<b>Tahalul awal.</b> Larangan ihram gugur kecuali jima\'. Ganti ke pakaian biasa.', 5200);
    await G(modal({ title: 'Urutan 10 Dzulhijjah', html: `<p>Urutan sunnah: <b>lempar → sembelih → cukur → thawaf</b>. Bila tertukar, <i>“lakukan, tidak mengapa”</i> (HR. al-Bukhari dan Muslim, Abdullah bin 'Amr).</p>`, buttons: [{ label: 'Menuju Makkah', value: true, pri: true }] }));
    await G(mini(['mina', 'hadyu', 'tahalul'], 3, 'Kuis 10 Dzulhijjah'));
  }

  /* =============== Thawaf ifadhah (Makkah) =============== */
  async function sIfadhah() {
    clearTargets(); closeAllUI(); showHud(false);
    await travel('minaMak', 'Ke Makkah untuk thawaf ifadhah', 'Dari Mina ke Masjidil Haram. Pakaian biasa setelah tahalul awal. Jarak ± 6 km.');
    setCloth('afterHalq'); setDay('d10'); setClock(13);
    await enterHaramShort('Thawaf ifadhah');
    await runThawaf('ifadhah'); log('Thawaf ifadhah (rukun)');
    const needSai = isTam();
    await runMaqam(needSai);
    if (needSai) { await runSai('haji'); log(`Sa'i haji (tamattu')`); }
    else { await G(modal({ title: `Sa'i tidak diulang`, html: `<p>Anda sudah melaksanakan sa'i setelah <b>thawaf qudum</b> (${S.mode === 'qiran' ? 'qiran' : 'ifrad'}), sehingga setelah thawaf ifadhah tidak perlu sa'i lagi. Bila Anda belum sa'i, kerjakan sekarang.</p>`, buttons: [{ label: 'Lanjut', value: true, pri: true }] })); }
    S.flags.tahalulTsani = true; log('Tahalul tsani');
    await G(modal({ title: 'Tahalul tsani', html: `<p>Setelah <b>lempar 'Aqabah, halq/taqshir, thawaf ifadhah dan sa'i</b> semuanya selesai, Anda mencapai <b>tahalul tsani</b>: <b>seluruh larangan ihram berakhir</b>, termasuk hubungan suami-istri.</p><div class="note">Tinggal: mabit di Mina dan melempar tiga jumrah pada hari tasyriq, lalu thawaf wada'.</div>${doa('tahalul')}`, speak: D.DOA.tahalul.ar, buttons: [{ label: 'Kembali ke Mina', value: true, pri: true }] }));
    await G(mini(['rukun', 'sai'], 3, 'Kuis rukun haji'));
  }

  /* =============== Hari tasyriq =============== */
  async function sTasyriq(day) {
    clearTargets(); closeAllUI(); showHud(false);
    const id = 'd' + day;
    if (day === 13 && S.flags.nafar === 'awal') { await G(modal({ title: '13 Dzulhijjah dilewati', html: '<p>Anda memilih <b>nafar awal</b> dan telah meninggalkan Mina sebelum maghrib 12 Dzulhijjah. Tahap ini tidak berlaku.</p>', buttons: [{ label: 'Lanjut', value: true, pri: true }] })); return; }
    await dayCard(id);
    if (day === 11) await travel('makMina', 'Kembali ke Mina', 'Dari Makkah ke Mina untuk mabit malam 11 dan melempar tiga jumrah. ± 6 km.');
    setCloth('afterHalq');
    const w = ensureScene('mina', V3(60, 0, 70), -PI / 2, true); w.env.set('morning', true); setDay(id); setClock(9); showHud(true); await G(fade(0));
    let auto = false;
    if (day >= 12 || S.did.jumrah) auto = await G(modal({ title: 'Ulangi lengkap atau ringkas?', html: '<p>Anda pernah menjalani lemparan jumrah penuh. Ingin berjalan dan melempar lagi, atau meringkas (langsung melempar tiga jumrah)?</p>', buttons: [{ label: 'Ringkas', value: true, pri: true }, { label: 'Ulangi lengkap', value: false }] }));
    const stage = `${day} Dzulhijjah — Tiga jumrah`;
    // tunggu zawal
    if (!auto) {
      obj(stage, 'Menuju Jumrah Ula', `Waktu melempar hari tasyriq: setelah zawal. Sekarang ${fmtClock(S.clock)}.`);
      await G(goTo({ pos: w.throwSpot('ula'), r: 14, label: 'Siap melempar' }));
    }
    if (auto) setClock(12.3);
    else if (S.clock < 12) {
      const c = await G(modal({ title: `Waktu melempar: ${fmtClock(S.clock)}`, html: `<p>Waktu melempar hari tasyriq adalah <b>setelah zawal</b> (matahari tergelincir, ± 12:00). Nabi saw. melempar setelah zawal (HR. Muslim, hadits Jabir).</p><div class="note">Sebagian ulama kontemporer membolehkan melempar sebelum zawal pada kondisi sangat padat; ikuti arahan pembimbing dan jadwal kloter.</div>`, buttons: [{ label: 'Menunggu hingga zawal', value: 'wait', pri: true }, { label: 'Lempar sekarang', value: 'now' }] }));
      if (c === 'now') { S.asalWrong++; await G(modal({ title: 'Belum waktunya', html: '<p>Menurut mazhab Syafi\'i dan tuntunan Nabi saw., melempar hari tasyriq <b>sebelum zawal tidak sah</b>. Tunggulah.</p>', buttons: [{ label: 'Menunggu', value: true, pri: true }] })); }
      await G(fade(1)); w.env.set('zenith', true); setClock(12.3); await G(wait(400)); await G(fade(0));
    }
    for (const id2 of ['ula', 'wustha', 'aqabah']) {
      await throwSeq(id2, { stage, auto });
      await G(jumrahDoa(id2));
    }
    S.did.jumrah = true; log(`Melempar tiga jumrah ${day} Dzulhijjah (21 kerikil)`);
    if (day === 11) {
      await G(mini(['mina', 'doa'], 3, 'Kuis jumrah'));
      await G(sleepMsg('Mabit di Mina malam 12', `Anda bermalam di Mina (lebih dari separuh malam). Meninggalkan satu malam: 1 mud; dua malam: 2 mud; tiga malam: dam kambing (Syafi'i). Rukhsah bagi pemberi minum, penggembala, dan yang sakit.`));
      log('Mabit di Mina malam 11'); w.env.set('night'); await G(fade(1)); await G(wait(450)); await G(fade(0));
    } else if (day === 12) {
      setClock(15);
      const ch = await G(modal({ title: 'Nafar awal atau tsani?', html: `<p>Hari ini 12 Dzulhijjah, <b>${fmtClock(S.clock)}</b>. QS. al-Baqarah 203: <i>“Barang siapa mempercepat (berangkat) dalam dua hari maka tidak ada dosa baginya, dan barang siapa menangguhkan maka tidak ada dosa pula baginya, bagi orang yang bertakwa.”</i></p><div class="note"><b>Nafar awal:</b> keluar dari Mina sebelum matahari terbenam hari ini. Bila terbenam sementara Anda masih di Mina, menurut Syafi'i wajib mabit malam 13 dan melempar lagi. <b>Nafar tsani</b> (tinggal sampai 13) lebih utama.</div>`, buttons: [{ label: 'Nafar awal (berangkat sekarang)', value: 'awal' }, { label: 'Nafar tsani (tinggal sampai 13)', value: 'tsani', pri: true }] }));
      S.flags.nafar = ch;
      if (ch === 'awal') { log('Nafar awal'); await G(modal({ title: 'Nafar awal', html: `<p>Anda meninggalkan Mina sebelum maghrib. Pastikan <b>kerikil 49</b> sudah terpakai (7 + 21 + 21), dan jangan lupa tahalul tsani sudah dicapai.</p>`, buttons: [{ label: 'Menuju Makkah', value: true, pri: true }] })); }
      else { log('Nafar tsani'); w.env.set('night'); await G(fade(1)); setClock(22); await G(wait(450)); await G(fade(0)); await G(sleepMsg('Mabit di Mina malam 13', 'Anda bermalam lagi untuk nafar tsani.')); }
    } else {
      await G(mini(['mina', 'dam'], 3, 'Kuis tasyriq'));
    }
  }

  /* =============== Umrah dari Tan'im (ifrad) =============== */
  async function sUmrah2() {
    clearTargets(); closeAllUI(); showHud(false);
    if (S.mode !== 'ifrad') { await G(modal({ title: 'Umrah setelah haji', html: `<p>Pada ${MODE().nama} Anda tidak perlu umrah terpisah. Tahap ini dilewati.</p>`, buttons: [{ label: 'Lanjut', value: true, pri: true }] })); return; }
    const yes = await G(modal({ title: 'Umrah setelah haji?', html: `<p>Pada haji ifrad, umrah <b>opsional</b> setelah haji (mis. dari Tan'im). Mayoritas ulama membolehkannya; sebagian salaf tidak menganjurkan berulang-ulang. Ingin mengerjakannya?</p>`, buttons: [{ label: `Ya, umrah dari Tan'im`, value: true, pri: true }, { label: 'Tidak, lanjut thawaf wada\'', value: false }] }));
    if (!yes) { log('Tidak umrah setelah haji'); return; }
    await dayCard('umrah2');
    await travel('makTanim', `Menuju Tan'im`, `Batas Haram terdekat di barat laut Makkah. Dari sini 'Aisyah r.a. berumrah. ± 7 km.`);
    setCloth('afterHalq'); const w = ensureScene('tanim', getWorld('tanim').spawn, 0, true); w.env && w.env.set && 0; setDay('umrah2'); showHud(true); await G(fade(0));
    obj(`Umrah dari Tan'im`, 'Menuju Ruang Ihram', 'Mandi, pakaian ihram, niat umrah.');
    await G(goTo({ pos: w.ihram, r: 6, label: 'Masuk Ruang Ihram' }));
    await G(checklist('Persiapan ihram umrah. '));
    await G(dressIhram());
    await G(goTo({ pos: w.line, r: 7, label: 'Berniat umrah' }));
    await G(niatSequence('umrah', 'tanim', { title: `Niat umrah dari Tan'im`, note: `<div class="note">Penduduk Makkah dan yang berada di Makkah berumrah dari <b>luar Haram</b> (Tan'im / Ji'ranah / Hudaibiyah) (HR. al-Bukhari dan Muslim, kisah 'Aisyah).</div>` }));
    await travel('makTanim', 'Kembali ke Masjidil Haram', 'Bertalbiyah hingga mulai thawaf.', 'talbiyah');
    ensureScene('haram', L.start, faceYaw(L.start, V3(0, 0, 0)), true); avatar.a.setMode('ihram'); showHud(true); await G(fade(0));
    obj('Umrah', 'Masuk Masjidil Haram', 'Ikuti suar emas.'); await G(goTo({ pos: L.gateIn, r: 8, label: 'Masuk Masjidil Haram' }));
    await runThawaf('umrah2'); await runMaqam(true); await runSai('umrah'); await runTahalulUmrah('Tahalul umrah (setelah haji)'); log(`Umrah setelah haji dari Tan'im`);
  }

  /* =============== Thawaf wada' =============== */
  async function sWada() {
    clearTargets(); closeAllUI(); showHud(false);
    await dayCard('wada');
    setCloth('afterHalq'); setDay('wada'); setClock(17);
    await enterHaramShort(`Thawaf wada'`);
    await runThawaf('wada'); log(`Thawaf wada'`);
    clearTargets(); showHud(true);
    const a = V3(L.sholat.x * 1.8, 0, L.sholat.z * 1.8); ensureScene('haram', a, faceYaw(a, L.sholat));
    obj(`Thawaf wada'`, 'Shalat dua rakaat dan berdoa di Multazam', `Antara Hajar Aswad dan pintu Ka'bah (bila memungkinkan).`);
    await G(goTo({ pos: L.sholat, r: 3.5, label: 'Shalat dua rakaat' }));
    await G(modal({ title: `Perpisahan dengan Baitullah`, html: `<p>Shalat dua rakaat, minum Zamzam, dan berdoa. Tidak ada doa khusus yang sahih untuk thawaf wada'; berdoalah dengan doa terbaik Anda.</p>${doa('multazam')}${doa('wadaDoa')}${doa('pulang')}<div class="note">“Hendaknya akhir urusan mereka di Baitullah, kecuali yang diberi keringanan bagi wanita haid” (HR. al-Bukhari dan Muslim, Ibnu 'Abbas).</div>`, speak: D.DOA.wadaDoa.ar, buttons: [{ label: 'Selesai', value: true, pri: true }] }));
    await G(mini(['doa', 'rukun'], 3, 'Kuis doa dan rukun'));
  }

  /* =============== Ringkasan dan ujian akhir =============== */
  async function sSelesai() {
    clearTargets(); showHud(false); closeAllUI();
    const m = D.MIQAT.find(m => m.id === S.miqat) || D.MIQAT[2], min = Math.round(S.time / 60), md = MODE();
    const rukun = ['Ihram', ...(isTam() ? [`Umrah: thawaf, sa'i, tahalul`] : []), 'Wukuf di Arafah', 'Thawaf ifadhah', `Sa'i${isTam() ? ' haji' : ' (setelah qudum)'}`, 'Halq/taqshir', 'Tertib'];
    const wajib = ['Ihram dari miqat', 'Mabit di Muzdalifah', "Jumrah 'Aqabah (10 Dz)", 'Tiga jumrah hari tasyriq', 'Mabit di Mina', `Thawaf wada'`, 'Menjauhi larangan ihram'];
    await G(new Promise(res => {
      const s = screen(`<h1 style="text-align:center">Haji selesai 🕋</h1><div class="ar">تَقَبَّلَ اللّٰهُ مِنَّا وَمِنْكُمْ</div><p style="text-align:center;color:var(--mut)">Semoga Allah menerima haji Anda dan menjadikannya haji yang mabrur.</p>
      <div class="stat"><div><b>${esc(md.nama.replace('Haji ', ''))}</b>jenis haji</div><div><b>${esc(m.nama)}</b>miqat</div><div><b>${min} mnt</b>waktu bermain</div><div><b>${(S.dist / 1000).toFixed(1)} km</b>jarak ditempuh</div><div><b>${S.quizOk}/${S.quizAll}</b>jawaban benar</div><div><b>${S.pebAll}</b>kerikil terkumpul</div></div>
      <div class="sec"><h3>Rukun yang Anda tunaikan (${esc(md.nama)})</h3><p>${rukun.map(esc).join(' · ')}</p><h3 style="margin-top:8px">Wajib</h3><p>${wajib.map(esc).join(' · ')}</p><h3 style="margin-top:8px">Dam</h3><p>${md.dam ? `<b>Dam nusuk (hadyu) wajib</b> pada ${esc(md.nama)}.` : 'Tidak ada dam nusuk (ifrad). Dam lain hanya bila ada wajib/larangan yang terlewat.'} Bila ada wajib yang terlewat, lihat tabel dam di Pusat Rujukan.</p></div>
      <div class="sec"><h3>Catatan perjalanan Anda</h3><ul>${S.log.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>
      <div class="row"><button class="btn pri" id="exam">Ujian akhir (10 soal)</button><button class="btn" id="ref">Pusat rujukan</button></div>
      <div class="row"><button class="btn" id="again">Main lagi</button><button class="btn ghost" id="redo">Pilih tahap</button></div>
      <p class="disc">Game edukasi (DRAF). Rujuk pembimbing manasik resmi untuk keputusan di lapangan.</p>`);
      const in_ = s.in_;
      in_.querySelector('#exam').onclick = async () => { const r = await quiz(quizPool(null, 10), 'Ujian akhir haji'); toast(`Ujian akhir: ${r}/10`, 5000); };
      in_.querySelector('#ref').onclick = () => openRef('rukun');
      in_.querySelector('#again').onclick = () => { s.close(); resetAll(); startFrom(0); };
      in_.querySelector('#redo').onclick = () => { s.close(); res(); H.stageMenu(); };
    }));
  }

  /* =============== Alur per jenis haji =============== */
  const FLOW = [];
  const st = (id, name, g, run, cloth) => ({ id, name, g, run, cloth });
  function buildRest(mode) {
    const F = [];
    F.push(st('miqat', 'Peta dan miqat', 0, sMap, 'normal'), st('ihram', 'Persiapan ihram', 1, sIhram, 'normal'), st('niat', 'Niat dan talbiyah', 1, sNiat, 'ihram'), st('haram', 'Masuk Masjidil Haram', 2, sHaram, 'ihram'));
    if (mode === 'tamattu') {
      F.push(st('thawaf', 'Thawaf umrah', 2, async () => { await runThawaf('umrah'); await runMaqam(true); }, 'ihram'), st('sai', "Sa'i umrah", 2, () => runSai('umrah'), 'ihram'), st('tahalul', 'Tahalul umrah', 2, sTahalulUmrah, 'ihram'), st('bebas', 'Masa bebas ihram', 2, sBebas, 'afterHalq'),
        st('ihramhaji', 'Ihram haji (8 Dz)', 3, sIhramHaji, 'normal'));
    } else {
      F.push(st('thawaf', 'Thawaf qudum', 2, async () => { await runThawaf('qudum'); await runMaqam(true); }, 'ihram'), st('sai', `Sa'i haji (setelah qudum)`, 2, () => runSai('qudum'), 'ihram'), st('menunggu', 'Menanti 8 Dz (tetap ihram)', 2, sIfradMenunggu, 'ihram'));
    }
    F.push(st('mina8', 'Mina — Tarwiyah (8 Dz)', 3, sMina8, 'ihram'), st('arafah', 'Arafah — Wukuf (9 Dz)', 4, sArafah, 'ihram'), st('muzd', 'Muzdalifah — mabit dan kerikil', 5, sMuzd, 'ihram'),
      st('mina10', `Mina — 'Aqabah, hadyu, tahalul awal (10 Dz)`, 6, sMina10, 'ihram'), st('ifadhah', "Thawaf ifadhah dan tahalul tsani", 7, sIfadhah, 'afterHalq'),
      st('tasyriq11', 'Tasyriq — 11 Dz', 8, () => sTasyriq(11), 'afterHalq'), st('tasyriq12', 'Tasyriq — 12 Dz (nafar)', 8, () => sTasyriq(12), 'afterHalq'), st('tasyriq13', 'Tasyriq — 13 Dz (nafar tsani)', 8, () => sTasyriq(13), 'afterHalq'));
    if (mode === 'ifrad') F.push(st('umrah2', `Umrah dari Tan'im (opsional)`, 8, sUmrah2, 'afterHalq'));
    F.push(st('wada', `Thawaf wada'`, 9, sWada, 'afterHalq'), st('selesai', 'Ringkasan dan ujian', 9, sSelesai, 'afterHalq'));
    return F;
  }
  function rebuildFlow() { FLOW.length = 1; buildRest(S.mode).forEach(f => FLOW.push(f)); }
  FLOW.push(st('mode', 'Pilih jenis haji', 0, sMode, 'normal'));

  function resetAll() {
    S.mode = null; S.miqat = null; S.prepWrong = S.asalWrong = S.quizOk = S.quizAll = 0; S.dist = 0; S.time = 0; S.started = false; S.ihram = false; S.th = null; S.sai = null; S.wuk = null; S.collect = false;
    S.peb = 0; S.pebAll = 0; S.thrown = { ula: 0, wustha: 0, aqabah: 0 }; S.log = []; S.flags = {}; S.did = {}; S.afterHalq = null; S.dayId = null; S.clock = 6; avatar.a.setMode('normal'); H.drawDay(); FLOW.length = 1;
  }
  async function startFrom(i) {
    H.newToken(); const my = H.getToken(); clearTargets(); closeAllUI(); S.th = null; S.sai = null; S.wuk = null; S.collect = false; ring(null); $('wukbar').classList.add('hidden');
    if (i >= 1 && !S.mode) { S.mode = 'tamattu'; rebuildFlow(); }
    if (i >= 1 && !S.miqat) S.miqat = 'yalamlam';
    if (!S.started && i > 0) S.started = true;
    S.fresh = true;
    try {
      for (let k = i; k < FLOW.length; k++) {
        if (my !== H.getToken()) return; S.stageIdx = k; const f = FLOW[k];
        H.setChips(f.g); if (k === i || f.cloth) setCloth(f.cloth); S.fresh = k === i ? true : S.fresh;
        await f.run();
      }
    } catch (e) { if (e !== CANCEL) console.error(e); }
  }
  H.stageMenu = async function () {
    const v = await modal({
      title: 'Menu tahap', sub: S.mode ? `${esc(MODE().nama)} · loncat ke tahap mana pun untuk berlatih ulang.` : 'Pilih jenis haji lebih dulu.', html: '<div id="mn" class="grid2"></div>', buttons: [{ label: 'Tutup', value: null, ghost: true }, { label: 'Ganti jenis haji / mulai awal', value: 'reset' }],
      build(d, close) { const h = d.querySelector('#mn'); FLOW.forEach((f, i) => { const b = el('button', 'opt', `${i + 1}. ${esc(f.name)}`); b.onclick = () => close(i); h.appendChild(b); }); }
    });
    if (v === 'reset') { resetAll(); startFrom(0); } else if (typeof v === 'number') startFrom(v);
  };

  /* =============== Mulai =============== */
  async function boot() {
    const h = new URLSearchParams(location.hash.slice(1));
    useScene('haram'); place(L.start, faceYaw(L.start, V3(0, 0, 0)));
    $('load').remove(); H.frame();
    if (h.get('g')) { S.gender = h.get('g'); avatar.build(); }
    if (h.get('speed')) S.speed = +h.get('speed');
    if (h.get('cam')) H.setCam(h.get('cam'));
    if (h.get('mode') && D.MODE[h.get('mode')]) { S.mode = h.get('mode'); rebuildFlow(); }
    if (h.get('stage')) {
      if (!S.mode) { S.mode = 'tamattu'; rebuildFlow(); }
      const i = FLOW.findIndex(f => f.id === h.get('stage')); S.speech = false; S.joy = H.touchy;
      if (i >= 0) { startFrom(i); return; }
    }
    await sIntro(); startFrom(0);
  }
  window.__game = { S, P, FLOW, startFrom, H, D, W, THREE: T, cam: H.cam, R: H.R, avatar, doAction: H.doAction, L, WORLDS, getWorld, throwSeq, runThawaf, runSai, resetAll, rebuildFlow };
  try { speechSynthesis.getVoices(); } catch (e) { }
  boot();
})();
