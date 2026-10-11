/* Dunia 3D tambahan: Arafah, Muzdalifah, Mina (skematis, bukan model survei), plus langit dengan waktu hari.
   Sumbu: x = timur, z = selatan, y = atas. Skala jarak dipadatkan agar bisa ditempuh dengan berjalan kaki. */
(function () {
  const W = WORLD, T = THREE, PI = Math.PI, H = W.H, lam = H.lam, tex = H.tex, signTex = H.signTex, rnd = H.rnd, PR = H.PR;

  /* ---------- arah kiblat dari koordinat (x timur, z selatan) ---------- */
  function qibla(lat, lon) {
    const dN = 21.4225 - lat, dE = (39.8262 - lon) * Math.cos(lat * PI / 180);
    const v = new T.Vector3(dE, 0, -dN).normalize(); return v;
  }

  /* ---------- Lingkungan: langit + cahaya yang berubah menurut waktu ---------- */
  const C = h => new T.Color(h);
  const PRE = {
    day: { top: 0x4d94e0, hor: 0xdbeaf5, sunCol: 0xfff0d6, sunI: 1.05, hemiS: 0xffffff, hemiG: 0xcdbf9f, hemiI: .8, fog: 0xd8e9f2, off: [45, 62, -35], stars: 0 },
    zenith: { top: 0x3f86d6, hor: 0xe3eef5, sunCol: 0xfff6e0, sunI: 1.15, hemiS: 0xffffff, hemiG: 0xd2c4a2, hemiI: .85, fog: 0xe0ecf2, off: [10, 80, -8], stars: 0 },
    sunset: { top: 0x3b5a9c, hor: 0xf3a45e, sunCol: 0xff9a4a, sunI: .85, hemiS: 0xffc9a0, hemiG: 0x7a5a45, hemiI: .6, fog: 0xe9b88c, off: [-85, 14, 12], stars: 0 },
    dusk: { top: 0x1a2a5e, hor: 0xc9667a, sunCol: 0xff7a5a, sunI: .4, hemiS: 0x8f87b0, hemiG: 0x3a2f3a, hemiI: .45, fog: 0x7d5a7a, off: [-90, 6, 10], stars: .35 },
    night: { top: 0x040818, hor: 0x16203f, sunCol: 0x9fb2ff, sunI: .2, hemiS: 0x5a6aa8, hemiG: 0x1c1c28, hemiI: .42, fog: 0x0d1428, off: [30, 60, -20], stars: 1 },
    dawn: { top: 0x1c2a58, hor: 0xe59a7a, sunCol: 0xffb98a, sunI: .4, hemiS: 0x9aa0c8, hemiG: 0x4a3f40, hemiI: .52, fog: 0x9a8a9a, off: [80, 8, -15], stars: .25 },
    isfar: { top: 0x5e86c4, hor: 0xf6d58f, sunCol: 0xffd68a, sunI: .75, hemiS: 0xffeac8, hemiG: 0xb5a07a, hemiI: .75, fog: 0xf0dcae, off: [80, 14, -15], stars: 0 },
    morning: { top: 0x4a8ddc, hor: 0xe8e2cc, sunCol: 0xffe9c4, sunI: .95, hemiS: 0xffffff, hemiG: 0xcdbf9f, hemiI: .8, fog: 0xe3e6d8, off: [70, 40, -20], stars: 0 }
  };
  function makeEnv(scene, sun, hemi, start) {
    const u = { top: { value: new T.Color() }, hor: { value: new T.Color() }, sunDir: { value: new T.Vector3(0, 1, 0) }, sunCol: { value: new T.Color() }, stars: { value: 0 } };
    const mat = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false, uniforms: u,
      vertexShader: 'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform vec3 top,hor,sunCol,sunDir; uniform float stars; varying vec3 vP; float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} void main(){ vec3 d=normalize(vP); float h=clamp(d.y,0.,1.); vec3 c=mix(hor,top,pow(h,.55)); float s=max(dot(d,sunDir),0.); c+=sunCol*(pow(s,500.)*3.+pow(s,9.)*.28); vec2 uv=vec2(atan(d.z,d.x)*48.,d.y*90.); vec2 g=floor(uv); float r=h21(g); float st=step(.982,r)*smoothstep(.02,.3,h)*stars; c+=vec3(st)*(.55+.45*h21(g+3.)); gl_FragColor=vec4(c,1.); }'
    });
    const sky = new T.Mesh(new T.SphereGeometry(1800, 24, 16), mat); sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
    const cur = { top: new T.Color(), hor: new T.Color(), sunCol: new T.Color(), hemiS: new T.Color(), hemiG: new T.Color(), fog: new T.Color(), sunI: 1, hemiI: 1, stars: 0, off: new T.Vector3() };
    let tgt = PRE[start || 'day'], rate = 1.4;
    function apply() {
      u.top.value.copy(cur.top); u.hor.value.copy(cur.hor); u.sunCol.value.copy(cur.sunCol); u.stars.value = cur.stars;
      u.sunDir.value.copy(cur.off).normalize();
      sun.color.copy(cur.sunCol); sun.intensity = cur.sunI; sun.userData.off.copy(cur.off);
      hemi.color.copy(cur.hemiS); hemi.groundColor.copy(cur.hemiG); hemi.intensity = cur.hemiI;
      scene.background = scene.background || new T.Color(); scene.background.copy(cur.hor);
      if (scene.fog) scene.fog.color.copy(cur.fog);
    }
    function snap() { const p = tgt; cur.top.set(p.top); cur.hor.set(p.hor); cur.sunCol.set(p.sunCol); cur.hemiS.set(p.hemiS); cur.hemiG.set(p.hemiG); cur.fog.set(p.fog); cur.sunI = p.sunI; cur.hemiI = p.hemiI; cur.stars = p.stars; cur.off.set(p.off[0], p.off[1], p.off[2]); apply(); }
    snap();
    return {
      name: start || 'day',
      set(name, instant, speed) { tgt = PRE[name]; this.name = name; rate = speed || 1.4; if (instant) snap(); },
      update(dt) {
        const k = 1 - Math.exp(-dt * rate), p = tgt;
        cur.top.lerp(C(p.top), k); cur.hor.lerp(C(p.hor), k); cur.sunCol.lerp(C(p.sunCol), k); cur.hemiS.lerp(C(p.hemiS), k); cur.hemiG.lerp(C(p.hemiG), k); cur.fog.lerp(C(p.fog), k);
        cur.sunI += (p.sunI - cur.sunI) * k; cur.hemiI += (p.hemiI - cur.hemiI) * k; cur.stars += (p.stars - cur.stars) * k;
        cur.off.lerp(new T.Vector3(p.off[0], p.off[1], p.off[2]), k); apply();
      }
    };
  }
  function baseScene(startTime, fogFar) {
    const scene = new T.Scene(); scene.fog = new T.Fog(0xd8e9f2, 160, fogFar || 1000);
    const hemi = new T.HemisphereLight(0xffffff, 0xcdbf9f, .8); scene.add(hemi);
    const sun = new T.DirectionalLight(0xfff0d6, 1.0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 260 }); sun.shadow.bias = -0.0006; sun.userData.off = new T.Vector3(45, 62, -35);
    scene.add(sun, sun.target);
    const env = makeEnv(scene, sun, hemi, startTime);
    return { scene, sun, hemi, env };
  }

  /* ---------- Tabrakan umum ---------- */
  function makeCollide(b) {
    return function (w, p) {
      for (const c of w.colliders) {
        if (c.t === 'c') { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + PR; if (d < m && d > 1e-4) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; } }
        else {
          const x0 = c.x0 - PR, x1 = c.x1 + PR, z0 = c.z0 - PR, z1 = c.z1 + PR;
          if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) { const dl = p.x - x0, dr = x1 - p.x, dt = p.z - z0, db = z1 - p.z, m = Math.min(dl, dr, dt, db); if (m === dl) p.x = x0; else if (m === dr) p.x = x1; else if (m === dt) p.z = z0; else p.z = z1; }
        }
      }
      p.x = Math.max(b.x0, Math.min(b.x1, p.x)); p.z = Math.max(b.z0, Math.min(b.z1, p.z));
    };
  }

  /* ---------- Tekstur ---------- */
  const sandTex = (base, rep) => tex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${130 + rnd() * 90 | 0},${105 + rnd() * 80 | 0},${70 + rnd() * 60 | 0},.12)`; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 7, 2 + rnd() * 3); }
  }, rep);
  const gravelTex = rep => tex(256, 256, (g, w, h) => {
    g.fillStyle = '#b9ab92'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { const v = 120 + rnd() * 100 | 0; g.fillStyle = `rgba(${v},${v - 8},${v - 24},.35)`; g.beginPath(); g.arc(rnd() * w, rnd() * h, .8 + rnd() * 2.2, 0, 7); g.fill(); }
  }, rep);
  const tentWall = tex(64, 64, (g, w, h) => { g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,115,100,.35)'; g.lineWidth = 2; for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } });
  const rock = (c) => lam(new T.Color().setHSL(.07 + rnd() * .03, .18 + rnd() * .08, .38 + rnd() * .12));

  /* ---------- Bukit batu di kejauhan (lembah Makkah) ---------- */
  function farHills(scene, n, d0, d1, hsl) {
    for (let i = 0; i < n; i++) {
      const a = i / n * PI * 2 + rnd() * .3, d = d0 + rnd() * (d1 - d0);
      const h = new T.Mesh(new T.ConeGeometry(130 + rnd() * 140, 90 + rnd() * 140, 6 + (rnd() * 3 | 0)), lam(new T.Color().setHSL(hsl ? hsl[0] : .07, hsl ? hsl[1] : .22, (hsl ? hsl[2] : .33) + rnd() * .08)));
      h.position.set(Math.cos(a) * d, 40, Math.sin(a) * d); scene.add(h);
    }
  }

  /* ---------- Ladang tenda (instanced) ---------- */
  function tentField(scene, colliders, blocks, tw) {
    let n = 0; const pos = [];
    blocks.forEach(b => {
      const nx = Math.floor((b.x1 - b.x0) / 7), nz = Math.floor((b.z1 - b.z0) / 7);
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) pos.push([b.x0 + 3.6 + i * 7, b.z0 + 3.6 + j * 7]);
      colliders.push({ t: 'r', x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1 });
    });
    n = pos.length;
    const walls = new T.InstancedMesh(new T.BoxGeometry(5.4, 2.6, 5.4).translate(0, 1.3, 0), new T.MeshLambertMaterial({ map: tentWall }), n);
    const roofs = new T.InstancedMesh(new T.ConeGeometry(4.2, 2.4, 4).rotateY(PI / 4).translate(0, 3.8, 0), lam(0xf0ece0), n);
    const m = new T.Matrix4();
    pos.forEach((p, i) => { m.makeTranslation(p[0], 0, p[1]); walls.setMatrixAt(i, m); roofs.setMatrixAt(i, m); });
    walls.castShadow = roofs.castShadow = true; walls.receiveShadow = true; walls.frustumCulled = roofs.frustumCulled = false;
    scene.add(walls, roofs); return n;
  }
  function trees(scene, colliders, pts, sc) {
    sc = sc || 1; const trunkG = new T.CylinderGeometry(.28 * sc, .4 * sc, 4 * sc, 6).translate(0, 2 * sc, 0), crownG = new T.IcosahedronGeometry(2.4 * sc, 1).translate(0, 5.2 * sc, 0);
    const tr = new T.InstancedMesh(trunkG, lam(0x6b5236), pts.length), cr = new T.InstancedMesh(crownG, lam(0x4d8a43), pts.length), m = new T.Matrix4(), col = new T.Color();
    pts.forEach((p, i) => { m.makeTranslation(p[0], 0, p[1]); tr.setMatrixAt(i, m); cr.setMatrixAt(i, m); cr.setColorAt(i, col.setHSL(.27 + rnd() * .05, .4, .3 + rnd() * .1)); colliders.push({ t: 'c', x: p[0], z: p[1], r: .5 * sc }); });
    tr.castShadow = cr.castShadow = true; tr.frustumCulled = cr.frustumCulled = false; scene.add(tr, cr);
  }

  /* ---------- Jamaah (instanced, berjalan lambat / berdiri / bersujud) ---------- */
  function makeFolk(n, rects, opt) {
    opt = opt || {};
    const bodyG = new T.CylinderGeometry(0.17, 0.27, 1.4, 8), headG = new T.SphereGeometry(0.12, 8, 6);
    const bm = new T.InstancedMesh(bodyG, lam(0xffffff), n), hm = new T.InstancedMesh(headG, lam(0xffffff), n), ag = [], c = new T.Color();
    const cols = [0xffffff, 0xf7f7f2, 0xffffff, 0xeeeeee, 0x1b1b1f, 0x2b2b33, 0x1b1b1f];
    for (let i = 0; i < n; i++) {
      const r = rects[(rnd() * rects.length) | 0], dark = rnd() < (opt.dark === undefined ? .3 : opt.dark), a = Math.PI * 2 * rnd();
      ag.push({ x: r.x0 + rnd() * (r.x1 - r.x0), z: r.z0 + rnd() * (r.z1 - r.z0), r, kneel: rnd() < (opt.kneel || 0), lie: rnd() < (opt.lie || 0), v: (opt.walk ? .5 + rnd() * .9 : 0), a, ph: rnd() * 7 });
      bm.setColorAt(i, c.set(dark ? cols[4 + (rnd() * 3 | 0)] : cols[(rnd() * 4) | 0])); hm.setColorAt(i, c.set(dark ? 0x1b1b1f : (rnd() < .5 ? 0xb88257 : 0x8d5b3a)));
    }
    bm.instanceColor.needsUpdate = hm.instanceColor.needsUpdate = true; bm.frustumCulled = hm.frustumCulled = false;
    const m4 = new T.Matrix4(), q = new T.Quaternion(), qL = new T.Quaternion().setFromEuler(new T.Euler(PI / 2, 0, 0)), p = new T.Vector3(), s1 = new T.Vector3(1, 1, 1), sk = new T.Vector3(1, .5, 1.1);
    function put(i, a, t) {
      if (a.lie) { p.set(a.x, .22, a.z); m4.compose(p, qL, s1); bm.setMatrixAt(i, m4); p.set(a.x, .26, a.z - .95); m4.compose(p, q, s1); hm.setMatrixAt(i, m4); }
      else if (a.kneel) { p.set(a.x, .32, a.z); m4.compose(p, q, sk); bm.setMatrixAt(i, m4); p.set(a.x, .62, a.z + .25); m4.compose(p, q, s1); hm.setMatrixAt(i, m4); }
      else { const bob = Math.abs(Math.sin(t * 4 + a.ph)) * (a.v ? .03 : .008); p.set(a.x, .72 + bob, a.z); m4.compose(p, q, s1); bm.setMatrixAt(i, m4); p.set(a.x, 1.56 + bob, a.z); m4.compose(p, q, s1); hm.setMatrixAt(i, m4); }
    }
    ag.forEach((a, i) => put(i, a, 0));
    return {
      bm, hm, agents: ag,
      update(dt, t) {
        for (let i = 0; i < n; i++) {
          const a = ag[i];
          if (a.v && !a.kneel && !a.lie) { a.x += Math.cos(a.a) * a.v * dt; a.z += Math.sin(a.a) * a.v * dt; if (a.x < a.r.x0 || a.x > a.r.x1) { a.a = PI - a.a; a.x = Math.max(a.r.x0, Math.min(a.r.x1, a.x)); } if (a.z < a.r.z0 || a.z > a.r.z1) { a.a = -a.a; a.z = Math.max(a.r.z0, Math.min(a.r.z1, a.z)); } }
          put(i, a, t);
        }
        bm.instanceMatrix.needsUpdate = hm.instanceMatrix.needsUpdate = true;
      }
    };
  }

  /* ---------- Bangunan masjid sederhana ---------- */
  function mosque(scene, colliders, o) {
    const g = new T.Group(); g.position.set(o.x, 0, o.z); scene.add(g);
    const wall = new T.Mesh(new T.BoxGeometry(o.w, o.h, o.d), lam(0xf1ecdd)); wall.position.y = o.h / 2; wall.castShadow = wall.receiveShadow = true; g.add(wall);
    const dome = new T.Mesh(new T.SphereGeometry(o.d * .26, 24, 12, 0, PI * 2, 0, PI / 2), lam(o.dome || 0xe9e3d0)); dome.position.y = o.h; dome.castShadow = true; g.add(dome);
    const gold = lam(0xd9a826);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].slice(0, o.minarets === 2 ? 2 : 4).forEach(([sx, sz], i) => {
      const mx = o.minarets === 2 ? (i ? 1 : -1) * o.w / 2 : sx * o.w / 2, mz = o.minarets === 2 ? o.d / 2 : sz * o.d / 2;
      const sh = new T.Mesh(new T.CylinderGeometry(1.4, 1.9, o.mh || 46, 12), lam(0xf4efe2)); sh.position.set(mx, (o.mh || 46) / 2, mz); sh.castShadow = true; g.add(sh);
      const cp = new T.Mesh(new T.ConeGeometry(1.8, 5, 12), gold); cp.position.set(mx, (o.mh || 46) + 2.5, mz); g.add(cp);
      colliders.push({ t: 'c', x: o.x + mx, z: o.z + mz, r: 2 });
    });
    const sg = new T.Mesh(new T.PlaneGeometry(14, 3.5), new T.MeshBasicMaterial({ map: signTex(o.sign, o.signAr, '#0e3b2c') })); sg.position.set(o.signSide > 0 ? o.w / 2 + .1 : -o.w / 2 - .1, o.h * .6, 0); sg.rotation.y = o.signSide > 0 ? PI / 2 : -PI / 2; g.add(sg);
    colliders.push({ t: 'r', x0: o.x - o.w / 2, x1: o.x + o.w / 2, z0: o.z - o.d / 2, z1: o.z + o.d / 2 });
    return g;
  }
  const post = (scene, x, z, h, col) => { const p = new T.Mesh(new T.BoxGeometry(.5, h, .5), lam(col)); p.position.set(x, h / 2, z); p.castShadow = true; scene.add(p); return p; };

  /* =====================  ARAFAH  ===================== */
  function buildArafah() {
    const { scene, sun, env } = baseScene('day', 1100);
    const colliders = [];
    const q = qibla(21.355, 39.98);
    const B = { bx0: -140, bx1: 430, bz0: -270, bz1: 270, u0: -205, u1: -140 };
    const gnd = new T.Mesh(new T.PlaneGeometry(1800, 1800), new T.MeshLambertMaterial({ map: gravelTex([90, 90]) })); gnd.rotation.x = -PI / 2; gnd.receiveShadow = true; scene.add(gnd);
    // Wadi 'Uranah: lantai merah, ditandai
    const ur = new T.Mesh(new T.PlaneGeometry(B.u1 - B.u0, B.bz1 - B.bz0 + 40), new T.MeshLambertMaterial({ color: 0xb06a50 })); ur.rotation.x = -PI / 2; ur.position.set((B.u0 + B.u1) / 2, .04, 0); scene.add(ur);
    for (let z = B.bz0; z <= B.bz1; z += 54) {
      const rp = post(scene, B.u0, z, 3, 0xcc3b2a); const sg = new T.Mesh(new T.PlaneGeometry(9, 2.25), new T.MeshBasicMaterial({ map: signTex(`WADI 'URANAH`, 'بطن عرنة — ليس من عرفة', '#7a1f14', '#ffe3d6') })); sg.position.set(B.u0 + .1, 4.2, z); sg.rotation.y = -PI / 2; scene.add(sg);
    }
    // batas Arafah
    const sgBorder = new T.MeshBasicMaterial({ map: signTex('BATAS ARAFAH', 'حدود عرفة', '#0e3b2c') });
    const border = (x, z, ry) => { post(scene, x, z, 6, 0xf4f1e6); const s = new T.Mesh(new T.PlaneGeometry(10, 2.5), sgBorder); s.position.set(x, 7.4, z); s.rotation.y = ry; scene.add(s); const s2 = s.clone(); s2.rotation.y = ry + PI; scene.add(s2); };
    for (let z = B.bz0; z <= B.bz1; z += 54) { if (z > -75 && z < 35) continue; border(B.bx0, z, PI / 2); border(B.bx1, z, PI / 2); }
    for (let x = B.bx0 + 60; x < B.bx1; x += 90) { border(x, B.bz0, 0); border(x, B.bz1, 0); }
    // garis batas di tanah
    const line = new T.Mesh(new T.PlaneGeometry(1.2, B.bz1 - B.bz0), new T.MeshBasicMaterial({ color: 0x35c46a })); line.rotation.x = -PI / 2; line.position.set(B.bx0, .06, 0); scene.add(line);

    // Masjid Namirah (sebagian besar di 'Uranah)
    mosque(scene, colliders, { x: -172, z: -20, w: 94, d: 64, h: 16, mh: 52, sign: 'MASJID NAMIRAH', signAr: 'مسجد نمرة', signSide: 1 });
    const court = new T.Mesh(new T.PlaneGeometry(40, 70), new T.MeshLambertMaterial({ map: H.marbleTex('#eeeadf', [10, 17]) })); court.rotation.x = -PI / 2; court.position.set(-105, .045, -20); scene.add(court);
    for (let i = 0; i < 5; i++) { const cp = new T.Mesh(new T.PlaneGeometry(1.4, 26), lam(0x2d7d46)); cp.rotation.x = -PI / 2; cp.position.set(-118 + i * 4.6, .07, -20); scene.add(cp); }
    // area shalat Namirah (target di halaman timur masjid)
    const mhab = { x: -105, z: -20 };

    // Jabal Rahmah
    const jr = { x: 252, z: -92 }, jg = new T.Group(); jg.position.set(jr.x, 0, jr.z); scene.add(jg);
    for (let i = 0; i < 36; i++) {
      const a = rnd() * PI * 2, d = Math.sqrt(rnd()) * 30, hgt = Math.max(1, 21 - d * .62 + rnd() * 3);
      const rk = new T.Mesh(new T.DodecahedronGeometry(3 + rnd() * 4.2, 0), rock()); rk.position.set(Math.cos(a) * d, hgt * .55, Math.sin(a) * d); rk.scale.set(1.2, .9 + rnd() * .5, 1.1); rk.rotation.set(rnd(), rnd(), rnd()); rk.castShadow = rk.receiveShadow = true; jg.add(rk);
    }
    const peak = new T.Mesh(new T.DodecahedronGeometry(7, 0), rock()); peak.position.set(0, 17, 0); peak.scale.set(1.2, .8, 1.2); peak.castShadow = true; jg.add(peak);
    const tugu = new T.Mesh(new T.BoxGeometry(2.2, 11, 2.2), lam(0xf6f3ea)); tugu.position.set(0, 24, 0); tugu.castShadow = true; jg.add(tugu);
    const tb = new T.Mesh(new T.BoxGeometry(4.4, 1.1, 4.4), lam(0xe0dac8)); tb.position.set(0, 19.2, 0); jg.add(tb);
    const jsg = new T.Mesh(new T.PlaneGeometry(14, 3.5), new T.MeshBasicMaterial({ map: signTex('JABAL RAHMAH', 'جبل الرحمة', '#0e3b2c') })); jsg.position.set(-30, 5, 4); jsg.rotation.y = -PI / 2.4; jg.add(jsg);
    colliders.push({ t: 'c', x: jr.x, z: jr.z, r: 34 });

    // tenda, lorong, pohon
    const blocks = []; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { blocks.push({ x0: -100 + i * 56, x1: -58 + i * 56, z0: -258 + j * 42, z1: -230 + j * 42 }); blocks.push({ x0: -100 + i * 56, x1: -58 + i * 56, z0: 86 + j * 42, z1: 114 + j * 42 }); }
    tentField(scene, colliders, blocks);
    const tp = []; for (let x = -90; x < 400; x += 15) { tp.push([x, 72], [x, -72]); } for (let x = -90; x < 400; x += 38) { tp.push([x, 20 + rnd() * 20], [x, -50 - rnd() * 10]); }
    trees(scene, colliders, tp.filter(p => Math.hypot(p[0] - jr.x, p[1] - jr.z) > 45), 1.1);
    // tenda kloter (penanda awal)
    const kl = new T.Group(); kl.position.set(-51, 0, 70); scene.add(kl);
    const klb = new T.Mesh(new T.BoxGeometry(10, 3, 10), lam(0xfaf6e6)); klb.position.y = 1.5; kl.add(klb); const klr = new T.Mesh(new T.ConeGeometry(8, 3.2, 4).rotateY(PI / 4), lam(0xe9e1c8)); klr.position.y = 4.6; kl.add(klr);
    const kls = new T.Mesh(new T.PlaneGeometry(8, 2), new T.MeshBasicMaterial({ map: signTex('TENDA ANDA', 'خيمة', '#1c5a8a') })); kls.position.set(0, 3.6, 5.1); kl.add(kls);
    colliders.push({ t: 'r', x0: -56.5, x1: -45.5, z0: 64.5, z1: 75.5 });
    // titik wukuf (tanda peta) -- tidak menghalangi
    farHills(scene, 18, 760, 1050);

    // jamaah
    const folk = makeFolk(240, [{ x0: -120, x1: 330, z0: -70, z1: 70 }, { x0: 150, x1: 330, z0: -150, z1: 0 }], { kneel: .28, walk: true });
    scene.add(folk.bm, folk.hm);
    // titik pusat area wukuf dekat Jabal Rahmah (selatan lereng)
    const wukuf = { x: 250, z: -42 };
    return {
      name: 'arafah', scene, sun, env, colliders, B, q, jr, mhab, wukuf, start: new T.Vector3(-51, 0, 52), folk,
      inArafah(p) { return p.x >= B.bx0 && p.x <= B.bx1 && p.z >= B.bz0 && p.z <= B.bz1; },
      inUranah(p) { return p.x >= B.u0 && p.x < B.bx0; },
      update(dt, t) { env.update(dt); folk.update(dt, t); }, setTop() { },
      collide: makeCollide({ x0: -330, x1: 520, z0: -310, z1: 310 })
    };
  }

  /* =====================  MUZDALIFAH  ===================== */
  function buildMuzdalifah() {
    const { scene, sun, env } = baseScene('night', 950);
    const colliders = [];
    const q = qibla(21.388, 39.9216);
    const B = { x0: -135, x1: 320, z0: -210, z1: 210, m0: -200 };
    const gnd = new T.Mesh(new T.PlaneGeometry(1800, 1800), new T.MeshLambertMaterial({ map: sandTex('#a89268', [80, 80]) })); gnd.rotation.x = -PI / 2; gnd.receiveShadow = true; scene.add(gnd);
    const mh = new T.Mesh(new T.PlaneGeometry(B.x0 - B.m0, 420), new T.MeshLambertMaterial({ color: 0xa5775a })); mh.rotation.x = -PI / 2; mh.position.set((B.x0 + B.m0) / 2, .04, 0); scene.add(mh);
    for (let z = -200; z <= 200; z += 60) { post(scene, B.x0, z, 3, 0xcc3b2a); const sg = new T.Mesh(new T.PlaneGeometry(9, 2.25), new T.MeshBasicMaterial({ map: signTex('WADI MUHASSIR', 'وادي محسر — أسرعوا', '#7a1f14', '#ffe3d6') })); sg.position.set(B.x0 + .1, 4.2, z); sg.rotation.y = -PI / 2; scene.add(sg); }
    const mq = mosque(scene, colliders, { x: 40, z: -150, w: 40, d: 28, h: 13, mh: 38, minarets: 2, sign: `MASY'ARIL HARAM`, signAr: 'المشعر الحرام', signSide: -1 });
    const mcourt = new T.Mesh(new T.PlaneGeometry(70, 44), new T.MeshLambertMaterial({ map: H.marbleTex('#e8e2d2', [18, 11]) })); mcourt.rotation.x = -PI / 2; mcourt.position.set(40, .045, -112); scene.add(mcourt);
    const masy = { x: 40, z: -110 };
    // tiang lampu menyala
    const lampM = new T.MeshBasicMaterial({ color: 0xffe9a8 }), poleM = lam(0x555a60);
    for (let x = -100; x <= 280; x += 60) for (let z = -120; z <= 180; z += 60) { const pl = new T.Mesh(new T.CylinderGeometry(.18, .22, 11, 6), poleM); pl.position.set(x, 5.5, z); scene.add(pl); const lp = new T.Mesh(new T.SphereGeometry(.9, 8, 6), lampM); lp.position.set(x, 11.4, z); scene.add(lp); colliders.push({ t: 'c', x, z, r: .3 }); }
    // tempat mabit: tikar dan terpal
    const rest = { x: 100, z: 60 }, rg = new T.Group(); rg.position.set(rest.x, 0, rest.z); scene.add(rg);
    for (let i = 0; i < 6; i++) { const mat = new T.Mesh(new T.PlaneGeometry(2.1, 5), lam(i % 2 ? 0x6b7a8f : 0x7a6b8f)); mat.rotation.x = -PI / 2; mat.position.set(-7.5 + i * 3, .05, 0); rg.add(mat); }
    const tarp = new T.Mesh(new T.BoxGeometry(22, .3, 12), lam(0xe9dfc5)); tarp.position.y = 4; tarp.castShadow = true; rg.add(tarp); [[-10, -5], [10, -5], [-10, 5], [10, 5]].forEach(([x, z]) => { const p = new T.Mesh(new T.CylinderGeometry(.14, .14, 4, 6), poleM); p.position.set(x, 2, z); rg.add(p); });
    const rsg = new T.Mesh(new T.PlaneGeometry(8, 2), new T.MeshBasicMaterial({ map: signTex('TEMPAT MABIT', 'مبيت', '#1c5a8a') })); rsg.position.set(0, 5.1, 6.2); rg.add(rsg);
    // area shalat jamak
    const prayer = { x: 200, z: 20 };
    for (let i = 0; i < 4; i++) { const cp = new T.Mesh(new T.PlaneGeometry(2, 30), lam(0x2d7d46)); cp.rotation.x = -PI / 2; cp.position.set(prayer.x - 8 + i * 5.5, .06, prayer.z); scene.add(cp); }
    // pohon & bukit
    const tp = []; for (let i = 0; i < 40; i++) { const x = B.x0 + 20 + rnd() * 420, z = -190 + rnd() * 380; if (Math.hypot(x - 100, z - 60) < 24 || (Math.abs(x - 40) < 44 && z < -90 && z > -170) || (Math.abs(x - 200) < 24 && Math.abs(z - 20) < 24)) continue; tp.push([x, z]); }
    trees(scene, colliders, tp, 1.0);
    farHills(scene, 14, 700, 980, [.07, .15, .22]);
    // kerikil (instanced)
    const NP = 170, pebG = new T.SphereGeometry(.13, 6, 5), pebM = new T.MeshBasicMaterial({ color: 0xfff4c8 }), peb = new T.InstancedMesh(pebG, pebM, NP), halo = new T.InstancedMesh(new T.RingGeometry(.28, .4, 12).rotateX(-PI / 2), new T.MeshBasicMaterial({ color: 0xf1d36b, transparent: true, opacity: .6, depthWrite: false }), NP);
    const pp = [], m = new T.Matrix4();
    for (let i = 0; i < NP; i++) {
      let x, z, k = 0; do { x = -100 + rnd() * 340; z = -95 + rnd() * 250; k++; } while (k < 20 && (Math.hypot(x - rest.x, z - rest.z) < 14 || (Math.abs(x - 40) < 40 && z < -90)));
      pp.push({ x, z, on: true }); m.makeTranslation(x, .13, z); peb.setMatrixAt(i, m); m.makeTranslation(x, .08, z); halo.setMatrixAt(i, m);
    }
    peb.frustumCulled = halo.frustumCulled = false; scene.add(peb, halo);
    const hideM = new T.Matrix4().makeScale(0, 0, 0);
    const folk = makeFolk(220, [{ x0: 60, x1: 150, z0: 30, z1: 90 }, { x0: -90, x1: 250, z0: -90, z1: 150 }], { lie: .4, kneel: .15, walk: false, dark: .35 });
    scene.add(folk.bm, folk.hm);
    return {
      name: 'muzdalifah', scene, sun, env, colliders, B, q, masy, rest, prayer, pebbles: pp, folk, start: new T.Vector3(255, 0, 5),
      take(i) { const p = pp[i]; if (!p.on) return false; p.on = false; peb.setMatrixAt(i, hideM); halo.setMatrixAt(i, hideM); peb.instanceMatrix.needsUpdate = halo.instanceMatrix.needsUpdate = true; return true; },
      inMuzd(p) { return p.x >= B.x0; },
      update(dt, t) { env.update(dt); folk.update(dt, t); halo.material.opacity = .45 + Math.sin(t * 3) * .2; }, setTop() { },
      collide: makeCollide({ x0: -260, x1: 400, z0: -300, z1: 300 })
    };
  }

  /* =====================  MINA  ===================== */
  function buildMina() {
    const { scene, sun, env } = baseScene('morning', 1000);
    const colliders = [];
    const q = qibla(21.4222, 39.8733);
    const J = { ula: 156, wustha: 0, aqabah: -117 }, wallH = 7, wallL = 26;
    const gnd = new T.Mesh(new T.PlaneGeometry(1800, 1800), new T.MeshLambertMaterial({ map: gravelTex([90, 90]) })); gnd.rotation.x = -PI / 2; gnd.receiveShadow = true; scene.add(gnd);
    // lantai kompleks Jamarat
    const plat = new T.Mesh(new T.PlaneGeometry(430, 120), new T.MeshLambertMaterial({ map: H.marbleTex('#dcd7ca', [108, 30]) })); plat.rotation.x = -PI / 2; plat.position.set(20, .04, 0); plat.receiveShadow = true; scene.add(plat);
    const edgeM = lam(0xcfc9b9);
    // pagar tepi lantai Jamarat dengan celah menuju tenda dan area tahalul/penyembelihan
    [-60, 60].forEach(z => [[-195, -172], [-128, 38], [82, 235]].forEach(([a, b]) => { const e = new T.Mesh(new T.BoxGeometry(b - a, 1.2, .8), edgeM); e.position.set((a + b) / 2, .6, z); scene.add(e); colliders.push({ t: 'r', x0: a, x1: b, z0: z - .5, z1: z + .5 }); }));
    // tiga jumrah
    const jInfo = [{ id: 'ula', x: J.ula, n: 'JUMRAH ULA', ar: 'الجمرة الصغرى' }, { id: 'wustha', x: J.wustha, n: 'JUMRAH WUSTHA', ar: 'الجمرة الوسطى' }, { id: 'aqabah', x: J.aqabah, n: `JUMRAH 'AQABAH`, ar: 'جمرة العقبة' }];
    jInfo.forEach(j => {
      const g = new T.Group(); g.position.set(j.x, 0, 0); scene.add(g);
      const basin = new T.Mesh(new T.CircleGeometry(1, 40), new T.MeshLambertMaterial({ color: 0x8c8678 })); basin.scale.set(6.5, 17, 1); basin.rotation.x = -PI / 2; basin.position.y = .06; g.add(basin);
      const rim = new T.Mesh(new T.RingGeometry(.94, 1, 40), new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide })); rim.scale.set(6.5, 17, 1); rim.rotation.x = -PI / 2; rim.position.y = .08; g.add(rim);
      const w = new T.Mesh(new T.BoxGeometry(1.8, wallH, wallL), lam(0xe8e2d0)); w.position.y = wallH / 2; w.castShadow = w.receiveShadow = true; g.add(w);
      const cap = new T.Mesh(new T.BoxGeometry(2.4, .5, wallL + .6), lam(0xb9b09a)); cap.position.y = wallH + .2; g.add(cap);
      const sg = new T.Mesh(new T.PlaneGeometry(9, 2.25), new T.MeshBasicMaterial({ map: signTex(j.n, j.ar, '#0e3b2c') })); sg.position.set(1.05, wallH + 2.2, 0); sg.rotation.y = PI / 2; g.add(sg);
      colliders.push({ t: 'r', x0: j.x - 6.7, x1: j.x + 6.7, z0: -18, z1: 18 });
    });
    // pagar-lorong di sisi utara dan selatan
    // tenda: lembah Mina
    const blocks = [];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) { blocks.push({ x0: -200 + i * 56, x1: -158 + i * 56, z0: -300 + j * 40, z1: -272 + j * 40 }); blocks.push({ x0: -200 + i * 56, x1: -158 + i * 56, z0: 100 + j * 44, z1: 128 + j * 44 }); }
    const tn = tentField(scene, colliders, blocks.filter(b => !(b.x1 > 240 && b.z0 < -150 && b.z0 > -260)));
    // tenda anda
    const kl = new T.Group(); kl.position.set(60, 0, 82); scene.add(kl);
    const klb = new T.Mesh(new T.BoxGeometry(10, 3, 10), lam(0xfaf6e6)); klb.position.y = 1.5; kl.add(klb); const klr = new T.Mesh(new T.ConeGeometry(8, 3.2, 4).rotateY(PI / 4), lam(0xe9e1c8)); klr.position.y = 4.6; kl.add(klr);
    const kls = new T.Mesh(new T.PlaneGeometry(8, 2), new T.MeshBasicMaterial({ map: signTex('TENDA ANDA', 'خيمة', '#1c5a8a') })); kls.position.set(0, 3.6, 5.1); kl.add(kls);
    colliders.push({ t: 'r', x0: 54.5, x1: 65.5, z0: 76.5, z1: 87.5 });
    // penyembelihan hadyu & tempat cukur
    const mj = { x: -150, z: 130 }, mg = new T.Group(); mg.position.set(mj.x, 0, mj.z - 30); scene.add(mg);
    const mb = new T.Mesh(new T.BoxGeometry(12, 5, 10), lam(0xefe6d0)); mb.position.y = 2.5; mb.castShadow = true; mg.add(mb); const mr = new T.Mesh(new T.BoxGeometry(13.5, .6, 12), lam(0x1f6f5a)); mr.position.y = 5.3; mg.add(mr);
    const msg = new T.Mesh(new T.PlaneGeometry(10, 2.5), new T.MeshBasicMaterial({ map: signTex('PENYEMBELIHAN', 'المجزر — الهدي', '#5a1f14') })); msg.position.set(0, 3.6, 5.1); mg.add(msg);
    colliders.push({ t: 'r', x0: mj.x - 6, x1: mj.x + 6, z0: mj.z - 35, z1: mj.z - 25 });
    const cuk = { x: -150, z: 85 }, cg = new T.Group(); cg.position.set(cuk.x, 0, cuk.z - 20); scene.add(cg);
    const cb = new T.Mesh(new T.BoxGeometry(12, 4, 8), lam(0xf0e7d0)); cb.position.y = 2; cb.castShadow = true; cg.add(cb); const cr = new T.Mesh(new T.BoxGeometry(13.5, .5, 9.5), lam(0x4a2a10)); cr.position.y = 4.3; cg.add(cr);
    const csg = new T.Mesh(new T.PlaneGeometry(9, 2.25), new T.MeshBasicMaterial({ map: signTex('TAHALUL', 'الحلق والتقصير', '#4a2a10') })); csg.position.set(0, 3, 4.1); cg.add(csg);
    colliders.push({ t: 'r', x0: cuk.x - 6, x1: cuk.x + 6, z0: cuk.z - 24, z1: cuk.z - 16 });
    mosque(scene, colliders, { x: 300, z: -200, w: 60, d: 36, h: 14, mh: 40, minarets: 2, sign: 'MASJID AL-KHAIF', signAr: 'مسجد الخيف', signSide: -1 });
    const tp = []; for (let x = -180; x < 220; x += 20) { tp.push([x, -68], [x, 68]); }
    trees(scene, colliders, tp.filter(p => !(Math.abs(p[0] - J.aqabah) < 12 || Math.abs(p[0] - J.ula) < 12 || Math.abs(p[0]) < 12)), 1.0);
    // lereng granit di kiri-kanan lembah
    for (let i = 0; i < 26; i++) { const x = -420 + i * 38, side = i % 2 ? 1 : -1; const h = new T.Mesh(new T.ConeGeometry(70 + rnd() * 60, 90 + rnd() * 90, 6), lam(new T.Color().setHSL(.07, .2, .32 + rnd() * .08))); h.position.set(x + rnd() * 20, 35, side * (440 + rnd() * 80)); scene.add(h); }
    farHills(scene, 8, 800, 1000);
    const folk = makeFolk(230, [{ x0: -190, x1: 230, z0: -56, z1: 56 }], { kneel: .08, walk: true });
    scene.add(folk.bm, folk.hm);
    return {
      name: 'mina', scene, sun, env, colliders, J, q, mj, cuk, folk, jInfo, tents: tn, start: new T.Vector3(255, 0, 0), tent: new T.Vector3(60, 0, 74),
      throwSpot(id) { const j = jInfo.find(x => x.id === id); return new T.Vector3(j.x + 10.5, 0, 0); },
      update(dt, t) { env.update(dt); folk.update(dt, t); }, setTop() { },
      collide: makeCollide({ x0: -330, x1: 400, z0: -360, z1: 360 })
    };
  }

  W.buildArafah = buildArafah; W.buildMuzdalifah = buildMuzdalifah; W.buildMina = buildMina; W.qibla = qibla;
})();
