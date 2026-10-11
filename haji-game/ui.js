/* Komponen tampilan statis (HTML) Perjalanan Haji 3D: peta, kartu hari, tabel rujukan, buku doa. */
window.UI = (function () {
  const D = DATA;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- Peta Makkah–Armuzna (skematis) ---------- */
  const px = lon => (lon - 39.74) * 2078, py = lat => (21.5 - lat) * 2224;
  const P = {}; Object.keys(D.TITIK).forEach(k => { P[k] = [px(D.TITIK[k].lon), py(D.TITIK[k].lat)]; });
  function mapSvg(o) {
    o = o || {};
    const here = o.here, leg = o.leg && D.RUTE[o.leg];
    const line = (a, b, cls, extra) => `<line x1="${P[a][0].toFixed(0)}" y1="${P[a][1].toFixed(0)}" x2="${P[b][0].toFixed(0)}" y2="${P[b][1].toFixed(0)}" ${extra || ''} class="${cls || ''}"/>`;
    let s = `<svg viewBox="0 0 600 400" role="img" aria-label="Peta skematis Makkah, Mina, Muzdalifah, dan Arafah"><rect width="600" height="400" fill="#2b2616"/>`;
    // bentang alam skematis
    s += `<g opacity=".9"><circle cx="${P.haram[0]}" cy="${P.haram[1]}" r="44" fill="#5a4c30"/><ellipse cx="304" cy="192" rx="56" ry="15" transform="rotate(32 304 192)" fill="#4a5a3a"/><ellipse cx="365" cy="238" rx="56" ry="17" transform="rotate(38 365 238)" fill="#5a4a3a"/><ellipse cx="490" cy="330" rx="76" ry="52" fill="#4d4330"/><circle cx="${P.tanim[0]}" cy="${P.tanim[1]}" r="10" fill="#54482e"/></g>`;
    s += `<rect x="438" y="312" width="22" height="30" fill="#a8483a" opacity=".55"/><text x="444" y="362" fill="#e9a99c" font-size="11" text-anchor="end">Wadi 'Uranah (bukan Arafah)</text>`;
    s += `<rect x="334" y="205" width="16" height="12" fill="#a8483a" opacity=".6" transform="rotate(35 342 211)"/><text x="324" y="206" fill="#e9a99c" font-size="11" text-anchor="end">Wadi Muhassir</text>`;
    // rute pasif
    Object.keys(D.RUTE).forEach(k => { const r = D.RUTE[k]; s += line(r.dari, r.ke, '', 'stroke="rgba(241,211,107,.28)" stroke-width="2.4" stroke-dasharray="3 5"'); });
    if (leg) s += line(leg.dari, leg.ke, 'route', 'stroke="#f1d36b" stroke-width="5" stroke-linecap="round" stroke-dasharray="14 14"');
    // titik
    const lab = { haram: [0, 62, 'middle'], tanim: [14, 5, 'start'], mina: [-6, -16, 'end'], muzd: [12, 4, 'start'], namirah: [-10, -12, 'end'], jabal: [10, 26, 'start'] };
    Object.keys(P).forEach(k => {
      const [x, y] = P[k], isHere = here === k, l = lab[k];
      s += `<g><circle cx="${x}" cy="${y}" r="${isHere ? 10 : 6}" fill="${isHere ? '#fff' : '#f1d36b'}" stroke="${isHere ? '#f1d36b' : '#000'}" stroke-width="${isHere ? 4 : 2}"/><text x="${x + l[0]}" y="${y + l[1]}" text-anchor="${l[2]}" fill="#fff" font-size="12" stroke="#000" stroke-width="3" paint-order="stroke">${esc(D.TITIK[k].nama)}</text></g>`;
    });
    s += `<g stroke="#fff" fill="#fff"><line x1="30" y1="372" x2="130" y2="372" stroke-width="3"/><text x="30" y="362" font-size="11" stroke="none">± 5 km</text></g>`;
    s += `<g fill="#f1d36b" font-size="13"><text x="570" y="30" text-anchor="end">U ↑</text></g>`;
    if (leg) s += `<text x="20" y="28" fill="#f1d36b" font-size="14" stroke="#000" stroke-width="3" paint-order="stroke">${esc(leg.nama)} · ± ${leg.jarak} km (jalan raya, perkiraan)</text>`;
    s += `</svg>`;
    return s;
  }

  /* ---------- Doa ---------- */
  function doaBlock(d, o) {
    o = o || {};
    return `<div class="ar">${d.ar}</div><div class="lat">${esc(d.lat)}</div><div class="arti">${esc(d.arti)}</div>${d.sumber ? `<div class="src">${esc(d.sumber)} <span class="bdg ${d.st}">${esc(D.ST[d.st])}</span></div>` : ''}`;
  }
  function doaBookHtml(kat, lvl) {
    const list = D.DOA_LIST.filter(d => (!kat || kat === 'semua' || d.kat.includes(kat)) && (!lvl || d.lvl === lvl));
    if (!list.length) return '<p class="sub">Tidak ada doa pada filter ini.</p>';
    return list.map(d => `<div class="doaI"><h4>${esc(d.judul)} <span class="tag">Tingkat ${d.lvl}</span></h4>${doaBlock(d)}</div>`).join('');
  }

  /* ---------- Kalender hari ---------- */
  const KT = { r: 'RUKUN', w: 'WAJIB', s: 'SUNNAH', i: 'INFO' };
  const TL = [['d8', '8 Dz'], ['d9', '9 Dz'], ['n10', 'Malam 10'], ['d10', '10 Dz'], ['d11', '11 Dz'], ['d12', '12 Dz'], ['d13', '13 Dz']];
  function dayHtml(id, mode, o) {
    o = o || {};
    const h = D.HARI[id]; if (!h) return '';
    const idx = TL.findIndex(t => t[0] === id);
    const items = h.item.filter(i => !i.m || !mode || i.m.includes(mode));
    return (idx >= 0 && !o.noTl ? `<div class="tl">${TL.map((t, i) => `<div class="${i === idx ? 'cur' : i < idx ? 'done' : ''}">${t[1]}</div>`).join('')}</div>` : '') +
      `<div class="sec"><h3>${esc(h.tgl)} — ${esc(h.nama)}</h3><p style="color:var(--mut)">${esc(h.ringkas)}</p>${items.map(i => `<div class="item"><span class="w">${esc(i.w)}</span><span><span class="kt ${i.k}">${KT[i.k]}</span>${esc(i.t)}</span></div>`).join('')}<div class="note" style="font-size:.82rem">${esc(h.dalil)}</div></div>`;
  }
  function calendarHtml(mode) {
    return `<div class="tl" style="flex-wrap:wrap">${TL.map(t => `<div>${t[1]}</div>`).join('')}</div>` + ['pra', 'd8', 'd9', 'n10', 'd10', 'd11', 'd12', 'd13', 'umrah2', 'wada'].map(i => (i === 'umrah2' && mode && mode !== 'ifrad') ? '' : dayHtml(i, mode, { noTl: true })).join('');
  }

  /* ---------- Rukun, wajib, dam, badal ---------- */
  function rukunHtml() {
    return `<div class="sec"><h3>Membedakan rukun, wajib, sunnah</h3><p><span class="kt r">RUKUN</span>Tidak dikerjakan = ibadah <b>tidak sah</b> dan <b>tidak bisa diganti dam</b>; harus dikerjakan (bahkan kembali ke Makkah).</p><p><span class="kt w">WAJIB</span>Ditinggalkan = ibadah <b>tetap sah</b> tetapi berdosa bila sengaja, dan wajib <b>dam/fidyah</b>.</p><p><span class="kt s">SUNNAH</span>Ditinggalkan = tidak berdosa dan tanpa dam; pahala berkurang.</p></div>
    <div class="sec"><h3>6 rukun haji (Syafi'i / Kemenag RI)</h3><table class="tbl"><tr><th>#</th><th>Rukun</th><th>Keterangan</th><th>Perbedaan mazhab lain</th></tr>${D.RUKUN_HAJI.map((r, i) => `<tr><td>${i + 1}</td><td class="k"><b>${esc(r.n)}</b></td><td>${esc(r.d)}</td><td>${esc(r.m)}</td></tr>`).join('')}</table></div>
    <div class="sec"><h3>7 wajib haji</h3><table class="tbl"><tr><th>#</th><th>Wajib</th><th>Keterangan</th><th>Bila ditinggalkan</th></tr>${D.WAJIB_HAJI.map((r, i) => `<tr><td>${i + 1}</td><td class="k"><b>${esc(r.n)}</b></td><td>${esc(r.d)}</td><td>${esc(r.dam)}</td></tr>`).join('')}</table></div>
    <div class="sec"><h3>Rukun dan wajib umrah</h3><p><b>Rukun (5):</b> ${D.RUKUN_UMRAH.map(r => esc(r.n)).join(' · ')}.</p><p><b>Wajib (2):</b> ${D.WAJIB_UMRAH.map(r => esc(r.n)).join(' · ')}. Tidak ada wukuf, mabit, atau jumrah pada umrah.</p></div>
    <div class="sec"><h3>Sunnah haji (contoh)</h3><ul>${D.SUNNAH_HAJI.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  }
  function damHtml() {
    return D.DAM.map(g => `<div class="sec"><h3>${esc(g.grup)}</h3><table class="tbl"><tr><th>Terlewat / dilanggar</th><th>Jenis</th><th>Akibat</th><th>Jika tak mampu</th><th>Bisa dibadalkan / catatan</th></tr>${g.rows.map(r => `<tr><td><b>${esc(r.x)}</b></td><td>${esc(r.j)}</td><td>${esc(r.s)}</td><td>${esc(r.p)}</td><td>${esc(r.b)}</td></tr>`).join('')}</table></div>`).join('') + `<div class="sec"><h3>Catatan satuan</h3><p>${esc(D.MUD_CAT)}</p><p class="disc">Tabel mengikuti mazhab Syafi'i dengan catatan mazhab lain; rincian kasus tertentu (haid, sakit, lupa, terpaksa) ditanyakan pada pembimbing atau lembaga fatwa. Bila ragu, mintalah fatwa sebelum membayar.</p></div>`;
  }
  function badalHtml() {
    return `<div class="sec"><h3>Apa yang bisa dibadalkan atau diwakilkan?</h3><p>“Badal haji” = haji atas nama orang lain. Selain itu ada perbuatan tertentu dalam haji yang boleh diwakilkan, dan ada yang tidak boleh sama sekali.</p><table class="tbl"><tr><th>Ibadah / kondisi</th><th>Bisa?</th><th>Keterangan</th><th>Dasar</th></tr>${D.BADAL.map(r => `<tr><td><b>${esc(r.x)}</b></td><td class="k">${esc(r.b)}</td><td>${esc(r.k)}</td><td>${esc(r.d)}</td></tr>`).join('')}</table></div>`;
  }
  function larangHtml() {
    return `<div class="sec"><h3>Boleh atau dilarang saat ihram?</h3><table class="tbl"><tr><th>Perbuatan</th><th>Hukum</th><th>Alasan</th></tr>${D.LARANGAN.map(r => `<tr><td>${esc(r.q)}</td><td class="k">${r.ok ? '✅ Boleh' : '⛔ Dilarang'}</td><td>${esc(r.why)}</td></tr>`).join('')}</table></div>`;
  }
  function rujukanHtml() {
    return D.RUJUKAN.map(g => `<div class="sec"><h3>${esc(g.g)}</h3><ul>${g.r.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('') + `<div class="sec"><p class="disc">${esc(D.RUJUKAN_CATATAN)}</p></div>`;
  }
  function modeCompareHtml() {
    const rows = [['Niat di miqat', 'Umrah', 'Haji', 'Umrah + haji'], ['Thawaf/sa\'i awal', 'Thawaf umrah + sa\'i umrah', 'Thawaf qudum (sunnah) + sa\'i haji (boleh langsung)', 'Thawaf qudum + sa\'i (sekali untuk dua)'], ['Tahalul sebelum haji', 'Ya (setelah umrah)', 'Tidak', 'Tidak'], ['Ihram haji', '8 Dzulhijjah dari Makkah', 'Sejak miqat', 'Sejak miqat'], ['Dam nusuk (hadyu)', 'Wajib', 'Tidak wajib', 'Wajib'], ['Jumlah sa\'i', '2 (umrah + haji)', '1', '1'], ['Umrah setelah haji', 'Tak perlu (sudah umrah)', 'Opsional (mis. dari Tan\'im)', 'Tak perlu']];
    return `<table class="tbl"><tr><th></th><th>Tamattu'</th><th>Ifrad</th><th>Qiran</th></tr>${rows.map(r => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('')}</table>`;
  }

  return { esc, el, shuffle, mapSvg, doaBlock, doaBookHtml, dayHtml, calendarHtml, rukunHtml, damHtml, badalHtml, larangHtml, rujukanHtml, modeCompareHtml, P };
})();
