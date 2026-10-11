/* Dunia 3D: Masjidil Haram (skematis), area miqat, avatar, dan jamaah.
   Sumbu: x = timur, z = selatan, y = atas. Semua bentuk bangunan hanya skematis, bukan model survei. */
window.WORLD = (function () {
  const T = THREE, PI = Math.PI;
  let seed = 20240611;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const wrapPi = a => { while (a > PI) a -= 2 * PI; while (a < -PI) a += 2 * PI; return a; };

  function tex(w, h, fn, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    fn(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    if (rep) t.repeat.set(rep[0], rep[1]);
    return t;
  }
  const lam = (c, o) => new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}));

  /* ---------- Geometri Ka'bah ---------- */
  const K = { a: 11.03, b: 12.84, h: 13.1, th: PI / 4 };
  const kw = (lx, lz) => new T.Vector3(lx * Math.cos(K.th) + lz * Math.sin(K.th), 0, -lx * Math.sin(K.th) + lz * Math.cos(K.th));
  const aswad = kw(K.a / 2, K.b / 2);
  const L = {
    ringIn: 62, ringOut: 72, ringH: 30, mataf: 58,
    safaZ: 30, marwahZ: -364, hallX0: 74, hallX1: 104, hallH: 14,
    phi0: Math.atan2(-aswad.z, aswad.x),
    gates: [{ phi: 0, w: 9.5 }, { phi: -3 * PI / 4, w: 14 }],
    zHijau: [-207, -127],
    maqam: kw(17, 2.5),
    corners: { aswad: aswad, yamani: kw(-K.a / 2, K.b / 2), syami: kw(-K.a / 2, -K.b / 2), iraqi: kw(K.a / 2, -K.b / 2) },
    barber: new T.Vector3(89, 0, -390)
  };
  const dirOut = L.maqam.clone().normalize();
  L.sholat = L.maqam.clone().add(dirOut.clone().multiplyScalar(6.5));
  L.zamzam = new T.Vector3(Math.cos(0.55) * 52, 0, -Math.sin(0.55) * 52);
  L.start = new T.Vector3(Math.cos(L.gates[1].phi) * 120, 0, -Math.sin(L.gates[1].phi) * 120);
  L.gateIn = new T.Vector3(Math.cos(L.gates[1].phi) * 68, 0, -Math.sin(L.gates[1].phi) * 68);
  L.garis = new T.Vector3(Math.cos(L.phi0) * 24, 0, -Math.sin(L.phi0) * 24);
  L.safa = new T.Vector3(89, 0, L.safaZ - 1.5);
  L.marwah = new T.Vector3(89, 0, L.marwahZ + 1.5);

  /* ---------- Tekstur ---------- */
  function marbleTex(base, rep) {
    return tex(256, 256, (g, w, h) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${150 + rnd() * 90 | 0},${145 + rnd() * 90 | 0},${135 + rnd() * 90 | 0},${0.04 + rnd() * 0.07})`; g.fillRect(rnd() * w, rnd() * h, 10 + rnd() * 50, 10 + rnd() * 50); }
      g.strokeStyle = 'rgba(110,105,95,.4)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
      g.strokeStyle = 'rgba(110,105,95,.15)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    }, rep);
  }
  const goldBand = () => tex(1024, 128, (g, w, h) => {
    g.fillStyle = '#0b0a08'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#dcb54c'; g.lineWidth = 6; g.strokeRect(5, 5, w - 10, h - 10); g.lineWidth = 2; g.strokeRect(14, 14, w - 28, h - 28);
    for (let i = 0; i < 4; i++) {
      const x = w / 4 * (i + .5); g.lineWidth = 3; g.strokeRect(x - 100, 26, 200, h - 52);
      g.lineWidth = 4; g.beginPath();
      for (let k = 0; k < 30; k++) { const px = x - 88 + k * 6, py = h / 2 + Math.sin(k * 1.1 + i * 2) * 20 * (k % 4 ? 1 : -.6); k ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.stroke();
      g.beginPath(); g.arc(x, h / 2, 9, 0, 7); g.fillStyle = '#dcb54c'; g.fill();
    }
  });
  const facadeTex = () => tex(384, 1024, (g, w, h) => {
    g.fillStyle = '#ece8df'; g.fillRect(0, 0, w, h);
    // balustrade
    g.fillStyle = '#d8d3c6'; g.fillRect(0, 0, w, 56); g.fillStyle = '#7a756a'; for (let x = 8; x < w; x += 24) g.fillRect(x, 20, 12, 26);
    // lengkung besar hitam
    const arch = (x0, x1, y0, y1, col, pointed) => { g.fillStyle = col; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0 + (y1 - y0) * .35); g.quadraticCurveTo(x0, y0, (x0 + x1) / 2, y0); g.quadraticCurveTo(x1, y0, x1, y0 + (y1 - y0) * .35); g.lineTo(x1, y1); g.closePath(); g.fill(); };
    arch(60, 324, 90, 380, '#16130f');
    g.fillStyle = '#c7a24a'; g.fillRect(0, 392, w, 14);
    // arkade batu pasir
    g.fillStyle = '#c99a58'; g.fillRect(0, 406, w, 280);
    for (let i = 0; i < 3; i++) { const x0 = 18 + i * 120; arch(x0, x0 + 104, 430, 686, '#1b140d'); g.fillStyle = '#e4cf9d'; g.fillRect(x0 + 104, 430, 14, 256); }
    // lantai dasar
    g.fillStyle = '#f3f1ea'; g.fillRect(0, 686, w, 338);
    for (let i = 0; i < 4; i++) { const x0 = 24 + i * 90; g.fillStyle = '#17140f'; g.fillRect(x0, 720, 66, 262); g.fillStyle = '#9d988b'; g.fillRect(x0 + 66, 700, 24, 300); }
    g.fillStyle = '#b8b2a2'; g.fillRect(0, 990, w, 34);
  });
  const clockTex = () => tex(256, 256, (g, w, h) => {
    g.fillStyle = '#1d4d3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f5f1e3'; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.fill();
    g.strokeStyle = '#c9a24e'; g.lineWidth = 8; g.stroke(); g.fillStyle = '#222';
    for (let i = 0; i < 12; i++) { const a = i * PI / 6; g.fillRect(128 + Math.sin(a) * 86 - 4, 128 - Math.cos(a) * 86 - 4, 8, 8); }
    g.strokeStyle = '#111'; g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 60); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(128, 128); g.lineTo(176, 148); g.stroke();
  });
  function signTex(txt, sub, bg, fg) {
    return tex(1024, 256, (g, w, h) => {
      g.fillStyle = bg || '#0e3b2c'; g.fillRect(0, 0, w, h); g.strokeStyle = fg || '#f1d36b'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
      g.fillStyle = fg || '#f1d36b'; g.textAlign = 'center'; g.font = 'bold 96px system-ui,sans-serif'; g.fillText(txt, w / 2, 130);
      g.font = '52px "Noto Naskh Arabic","Amiri",serif'; g.fillStyle = '#fff'; g.fillText(sub || '', w / 2, 205);
    });
  }

  /* ---------- Langit ---------- */
  function sky() {
    const m = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      uniforms: { sunDir: { value: new T.Vector3(0.45, 0.62, -0.35).normalize() } },
      vertexShader: 'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform vec3 sunDir; varying vec3 vP; void main(){ vec3 d=normalize(vP); float h=clamp(d.y,0.,1.); vec3 c=mix(vec3(.86,.93,.97),vec3(.30,.58,.88),pow(h,.55)); float s=max(dot(d,sunDir),0.); c+=vec3(1.,.92,.75)*(pow(s,600.)*3.+pow(s,10.)*.25); gl_FragColor=vec4(c,1.); }'
    });
    const mesh = new T.Mesh(new T.SphereGeometry(1800, 24, 16), m); mesh.renderOrder = -10; mesh.frustumCulled = false; return mesh;
  }

  /* ---------- Avatar ---------- */
  function makePerson(o) {
    o = o || {};
    const g = new T.Group();
    const skinM = lam(o.skin || 0xc48a5e), hairM = lam(0x241710), white = lam(0xfbfbfb, { side: T.DoubleSide });
    const shirtM = lam(0x3d6ea8), pantsM = lam(0x2e2f3a), robeM = lam(0x6b4a8a, { side: T.DoubleSide });
    const torso = new T.Mesh(new T.CapsuleGeometry(0.17, 0.42, 4, 10), skinM); torso.scale.z = .72; torso.position.y = 1.27;
    const head = new T.Mesh(new T.SphereGeometry(0.12, 14, 12), skinM); head.position.y = 1.7;
    const hair = new T.Mesh(new T.SphereGeometry(0.128, 14, 10, 0, PI * 2, 0, PI * .55), hairM); hair.position.set(0, 1.715, -.012); hair.rotation.x = -.15;
    const mkLimb = (x, y, rad, len, mat) => { const p = new T.Group(); p.position.set(x, y, 0); const m = new T.Mesh(new T.CapsuleGeometry(rad, len, 3, 8), mat); m.position.y = -len / 2 - rad * .6; p.add(m); g.add(p); return { p, m }; };
    const legL = mkLimb(-.1, .9, .085, .62, skinM), legR = mkLimb(.1, .9, .085, .62, skinM);
    const armL = mkLimb(-.235, 1.5, .058, .48, skinM), armR = mkLimb(.235, 1.5, .058, .48, skinM);
    g.add(torso, head, hair);
    // pakaian ihram pria
    const izar = new T.Mesh(new T.CylinderGeometry(0.2, 0.27, 0.88, 14, 1, true), white); izar.position.y = .52;
    const ridaL = new T.Mesh(new T.CapsuleGeometry(.205, .44, 4, 10), white); ridaL.position.set(0, 1.27, 0); ridaL.scale.z = .8;
    const ridaR = new T.Mesh(new T.SphereGeometry(.12, 10, 8), white); ridaR.position.set(.2, 1.5, 0); ridaR.scale.set(1, .7, .9);
    // wanita
    const robe = new T.Mesh(new T.CylinderGeometry(0.2, 0.34, 1.32, 16, 1, true), white); robe.position.y = .72;
    const robeTop = new T.Mesh(new T.CapsuleGeometry(.2, .36, 4, 10), white); robeTop.position.set(0, 1.3, 0); robeTop.scale.z = .8;
    const hijab = new T.Mesh(new T.SphereGeometry(0.15, 16, 12), white); hijab.position.set(0, 1.69, -.02); hijab.scale.set(1.05, 1.18, 1.1);
    const hijabBody = new T.Mesh(new T.CapsuleGeometry(.19, .1, 4, 10), white); hijabBody.position.set(0, 1.5, -.02); hijabBody.scale.z = .9;
    const face = new T.Mesh(new T.SphereGeometry(0.095, 12, 10), skinM); face.position.set(0, 1.69, .07);
    const iH = [izar, ridaL, ridaR], fH = [robe, robeTop, hijab, hijabBody, face];
    const female = !!o.female;
    if (female) { g.add(robe, robeTop, hijab, hijabBody, face); head.visible = false; hair.visible = false; } else { g.add(izar, ridaL, ridaR); }
    g.traverse(m => { if (m.isMesh) m.castShadow = true; });
    const api = {
      group: g, mode: 'ihram', idhtiba: false,
      setMode(mode, idh) {
        this.mode = mode; this.idhtiba = !!idh;
        const ih = mode === 'ihram', nm = ih ? skinM : shirtM;
        if (female) {
          const rc = ih ? 0xfbfbfb : 0x6b4a8a, hc = ih ? 0xfbfbfb : 0xe9dff2;
          robe.material.color.set(rc); robeTop.material.color.set(rc); hijab.material.color.set(hc); hijabBody.material.color.set(hc);
          armL.m.material = armR.m.material = robe.material;
        } else {
          izar.visible = ridaL.visible = ih; ridaR.visible = ih && !this.idhtiba;
          torso.material = armL.m.material = armR.m.material = nm;
          legL.m.material = legR.m.material = ih ? skinM : pantsM;
          hair.visible = mode !== 'halq';
        }
      },
      walk(phase, amp) {
        const s = Math.sin(phase) * amp;
        legL.p.rotation.x = s; legR.p.rotation.x = -s; armL.p.rotation.x = -s * .8; armR.p.rotation.x = s * .8;
        g.position.y = Math.abs(Math.cos(phase)) * .03 * (amp > .05 ? 1 : 0);
      }
    };
    api.setMode('ihram');
    return api;
  }

  /* ---------- Kerumunan (instanced) ---------- */
  function makeCrowd(n, hallMode) {
    const bodyG = new T.CylinderGeometry(0.17, 0.27, 1.4, 10), headG = new T.SphereGeometry(0.12, 8, 6);
    const bm = new T.InstancedMesh(bodyG, lam(0xffffff), n), hm = new T.InstancedMesh(headG, lam(0xffffff), n);
    const agents = [], cols = [0xffffff, 0xf7f7f2, 0xffffff, 0xeeeeee, 0x1b1b1f, 0x2b2b33, 0x1b1b1f];
    const c = new T.Color();
    for (let i = 0; i < n; i++) {
      const dark = rnd() < .3;
      const a = { r: 16 + rnd() * 34, phi: rnd() * PI * 2, v: 0.9 + rnd() * 0.7, kneel: false, x: 0, z: 0, dir: rnd() < .5 ? 1 : -1, lane: 76 + rnd() * 26, zz: L.marwahZ + 10 + rnd() * 380 };
      agents.push(a);
      bm.setColorAt(i, c.set(dark ? cols[4 + (rnd() * 3 | 0)] : cols[(rnd() * 4) | 0]));
      hm.setColorAt(i, c.set(dark ? 0x1b1b1f : (rnd() < .5 ? 0xb88257 : 0x8d5b3a)));
    }
    bm.instanceColor.needsUpdate = hm.instanceColor.needsUpdate = true;
    bm.frustumCulled = hm.frustumCulled = false;
    const m4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3(1, 1, 1), s2 = new T.Vector3(1, 1, 1);
    function put(i, x, z, bob, kneel, dark) {
      if (kneel) { p.set(x, .32, z); s2.set(1, .5, 1.1); m4.compose(p, q, s2); bm.setMatrixAt(i, m4); p.set(x, .62, z + .25); m4.compose(p, q, s); hm.setMatrixAt(i, m4); }
      else { p.set(x, .72 + bob, z); m4.compose(p, q, s); bm.setMatrixAt(i, m4); p.set(x, 1.56 + bob, z); m4.compose(p, q, s); hm.setMatrixAt(i, m4); }
    }
    return {
      bm, hm, agents,
      update(dt, t) {
        for (let i = 0; i < n; i++) {
          const a = agents[i];
          if (a.kneel) { put(i, a.x, a.z, 0, true); continue; }
          let x, z;
          if (hallMode) {
            a.zz += a.dir * a.v * dt; if (a.zz > L.safaZ - 2) { a.zz = L.safaZ - 2; a.dir = -1; } if (a.zz < L.marwahZ + 2) { a.zz = L.marwahZ + 2; a.dir = 1; }
            x = a.lane; z = a.zz;
          } else { a.phi += a.v / a.r * dt; x = Math.cos(a.phi) * a.r; z = -Math.sin(a.phi) * a.r; }
          a.x = x; a.z = z;
          put(i, x, z, Math.abs(Math.sin(t * 5 + i)) * .03, false);
        }
        bm.instanceMatrix.needsUpdate = hm.instanceMatrix.needsUpdate = true;
      }
    };
  }

  /* ---------- Masjidil Haram ---------- */
  function buildHaram() {
    const scene = new T.Scene();
    scene.background = new T.Color(0xcfe7f4);
    scene.fog = new T.Fog(0xd5e9f4, 180, 1100);
    const sk = sky(); scene.add(sk);
    scene.add(new T.HemisphereLight(0xffffff, 0xcdbf9f, .8));
    const sun = new T.DirectionalLight(0xfff0d6, 1.05);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 220 });
    sun.shadow.bias = -0.0006; sun.userData.off = new T.Vector3(45, 62, -35);
    scene.add(sun, sun.target);
    const colliders = [], roofs = [];
    const add = (m, shadow, parent) => { m.castShadow = !!shadow; m.receiveShadow = true; (parent || scene).add(m); return m; };

    // tanah dan mataf
    add(new T.Mesh(new T.PlaneGeometry(1400, 1400), new T.MeshLambertMaterial({ map: marbleTex('#d9d5cb', [260, 260]) })).rotateX(-PI / 2));
    const mataf = add(new T.Mesh(new T.CircleGeometry(L.mataf, 72), new T.MeshLambertMaterial({ map: marbleTex('#f1eee6', [30, 30]) })).rotateX(-PI / 2)); mataf.position.y = .03;
    [22, 36, 50].forEach(r => { const rg = add(new T.Mesh(new T.RingGeometry(r - .12, r + .12, 96), new T.MeshBasicMaterial({ color: 0xb7b09e }))); rg.rotation.x = -PI / 2; rg.position.y = .05; });
    // garis Hajar Aswad
    const gl = add(new T.Mesh(new T.BoxGeometry(46, .05, .7), new T.MeshBasicMaterial({ color: 0x7a4b1e }))); gl.position.set(Math.cos(L.phi0) * 33, .07, -Math.sin(L.phi0) * 33); gl.rotation.y = L.phi0;
    const gl2 = add(new T.Mesh(new T.BoxGeometry(.5, 3.2, .5), new T.MeshBasicMaterial({ color: 0x35c46a }))); gl2.position.set(Math.cos(L.phi0) * 57, 1.6, -Math.sin(L.phi0) * 57);

    // Ka'bah
    const kaaba = new T.Group(); kaaba.rotation.y = K.th; scene.add(kaaba);
    const kis = new T.MeshStandardMaterial({ color: 0x0b0b0d, roughness: .9, metalness: .05 });
    const base = add(new T.Mesh(new T.BoxGeometry(K.a + 1.1, .7, K.b + 1.1), lam(0xe9e5dc)), true, kaaba); base.position.y = .35;
    const body = add(new T.Mesh(new T.BoxGeometry(K.a, K.h, K.b), kis), true, kaaba); body.position.y = K.h / 2 + .7;
    const gt = goldBand(); gt.repeat.set(2, 1);
    const band = add(new T.Mesh(new T.BoxGeometry(K.a + .06, 1.5, K.b + .06), new T.MeshStandardMaterial({ map: gt, roughness: .5, metalness: .35 })), false, kaaba); band.position.y = 10.2;
    const goldM = new T.MeshStandardMaterial({ color: 0xd9a826, roughness: .35, metalness: .85, emissive: 0x3a2a00 });
    const door = add(new T.Mesh(new T.BoxGeometry(.1, 5.2, 3.0), goldM), false, kaaba); door.position.set(K.a / 2 + .04, 2.25 + 2.6 + .7, 3.6);
    const doorArch = add(new T.Mesh(new T.BoxGeometry(.06, 5.8, 3.5), new T.MeshStandardMaterial({ color: 0x7a5a12, roughness: .6 })), false, kaaba); doorArch.position.set(K.a / 2 + .02, 5.5, 3.6);
    // sudut vertikal emas halus
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => { const e = add(new T.Mesh(new T.BoxGeometry(.18, K.h, .18), goldM), false, kaaba); e.position.set(sx * K.a / 2, K.h / 2 + .7, sz * K.b / 2); });
    // Hajar Aswad
    const ha = new T.Group(); ha.position.set(K.a / 2, 2.2, K.b / 2); kaaba.add(ha);
    const stone = new T.Mesh(new T.SphereGeometry(.36, 12, 10), lam(0x1a1210)); stone.scale.set(1, 1.3, .5); ha.add(stone);
    const hring = new T.Mesh(new T.TorusGeometry(.42, .08, 8, 20), new T.MeshStandardMaterial({ color: 0xcfcfcf, metalness: .9, roughness: .25 })); hring.scale.y = 1.3; ha.add(hring);
    ha.rotation.y = PI / 4; ha.position.add(new T.Vector3(.12, 0, .12).applyAxisAngle(new T.Vector3(0, 1, 0), 0));
    // Hijr Ismail
    const hijrPos = kw(0, -K.b / 2);
    const hijr = new T.Group(); hijr.position.set(hijrPos.x, 0, hijrPos.z); scene.add(hijr);
    const arc = new T.Mesh(new T.CylinderGeometry(4.6, 4.6, 1.5, 28, 1, true, 0, PI), lam(0xf5f3ec, { side: T.DoubleSide }));
    arc.position.y = .75; arc.castShadow = arc.receiveShadow = true;
    // arah tonjolan: ke luar dari dinding barat laut (lokal -z)
    hijr.add(arc); hijr.rotation.y = 3 * PI / 4;
    const hcap = new T.Mesh(new T.TorusGeometry(4.6, .17, 6, 28, PI), lam(0xffffff)); hcap.rotation.x = -PI / 2; hcap.position.y = 1.5; hijr.add(hcap);
    // lentera emas
    const lampG = new T.Group();
    const lb = new T.Mesh(new T.CylinderGeometry(.4, .5, .9, 10), goldM), ls = new T.Mesh(new T.CylinderGeometry(.09, .12, 2.2, 8), goldM), lh = new T.Mesh(new T.CylinderGeometry(.52, .36, 1.5, 10), goldM), lt = new T.Mesh(new T.SphereGeometry(.4, 10, 8, 0, PI * 2, 0, PI / 2), goldM);
    lb.position.y = .45; ls.position.y = 1.9; lh.position.y = 3.7; lt.position.y = 4.45; lampG.add(lb, ls, lh, lt);
    for (let i = 0; i < 12; i++) { const ph = i / 12 * PI * 2; if (Math.abs(wrapPi(ph - L.phi0)) < .12) continue; const lg = lampG.clone(); lg.position.set(Math.cos(ph) * 33, 0, -Math.sin(ph) * 33); lg.traverse(m => { if (m.isMesh) m.castShadow = true; }); scene.add(lg); colliders.push({ t: 'c', x: lg.position.x, z: lg.position.z, r: .8 }); }

    // Maqam Ibrahim
    const mq = new T.Group(); mq.position.copy(L.maqam); scene.add(mq);
    const mb = add(new T.Mesh(new T.BoxGeometry(2.6, .6, 2.6), lam(0xe9e5dc)), true, mq); mb.position.y = .3;
    const mg = add(new T.Mesh(new T.CylinderGeometry(.95, 1.05, 1.9, 8), new T.MeshLambertMaterial({ color: 0x9fd0e6, transparent: true, opacity: .55 })), false, mq); mg.position.y = 1.55;
    for (let i = 0; i < 8; i++) { const bar = add(new T.Mesh(new T.BoxGeometry(.07, 1.9, .07), goldM), false, mq); const a = i / 8 * PI * 2 + PI / 8; bar.position.set(Math.sin(a) * 1.0, 1.55, Math.cos(a) * 1.0); }
    const mc = add(new T.Mesh(new T.ConeGeometry(1.3, 1.2, 8), goldM), true, mq); mc.position.y = 3.1;
    colliders.push({ t: 'c', x: L.maqam.x, z: L.maqam.z, r: 1.9 });
    // karpet shalat tempat shalat belakang Maqam
    const pr = add(new T.Mesh(new T.PlaneGeometry(2.2, 1.4), lam(0x2c8a4f))); pr.rotation.x = -PI / 2; pr.position.set(L.sholat.x, .08, L.sholat.z); pr.rotation.z = Math.atan2(L.sholat.x, L.sholat.z) * 0;
    colliders.push({ t: 'c', x: 0, z: 0, r: 9.3 }, { t: 'c', x: hijrPos.x * 1, z: hijrPos.z * 1, r: 0 });
    // Hijr: lingkaran pendek pada pusat tonjolan
    const hc = hijrPos.clone().add(hijrPos.clone().normalize().multiplyScalar(1.6)); colliders[colliders.length - 1] = { t: 'c', x: hc.x, z: hc.z, r: 5.6 };

    // karpet hijau dengan jamaah sujud
    const carpets = [];
    [1.05, 2.9, -1.15, -2.4].forEach(ph => {
      for (let i = 0; i < 3; i++) {
        const r = 54.2 + i * 1.7, p2 = ph + i * .01;
        const cp = add(new T.Mesh(new T.PlaneGeometry(2.0, 11), lam(0x2d7d46)));
        cp.rotation.order = 'YXZ'; cp.rotation.x = -PI / 2; cp.rotation.y = p2; cp.position.set(Math.cos(p2) * r, .06, -Math.sin(p2) * r);
        carpets.push({ r, p: p2 });
      }
    });

    // Zamzam
    const zz = new T.Group(); zz.position.copy(L.zamzam); scene.add(zz);
    const zr = add(new T.Mesh(new T.BoxGeometry(7, .3, 5), lam(0xf4f2ea)), true, zz); zr.position.y = 3.6;
    [[-3, -2], [3, -2], [-3, 2], [3, 2]].forEach(([x, z]) => { const po = add(new T.Mesh(new T.CylinderGeometry(.18, .18, 3.6, 8), lam(0xd9d4c6)), true, zz); po.position.set(x, 1.8, z); });
    for (let i = 0; i < 5; i++) { const ck = add(new T.Mesh(new T.CylinderGeometry(.38, .38, .95, 12), lam(0xdfe9ee)), true, zz); ck.position.set(-2.6 + i * 1.3, .5, 0); const tp = add(new T.Mesh(new T.CylinderGeometry(.4, .4, .12, 12), lam(0x2f6fa8)), false, zz); tp.position.set(-2.6 + i * 1.3, 1.02, 0); }
    const zs = add(new T.Mesh(new T.PlaneGeometry(5, 1.25), new T.MeshBasicMaterial({ map: signTex('ZAMZAM', 'ماء زمزم', '#0d3a5c') })), false, zz); zs.position.set(0, 3.0, 2.6);
    colliders.push({ t: 'r', x0: L.zamzam.x - 3.6, x1: L.zamzam.x + 3.6, z0: L.zamzam.z - 0.9, z1: L.zamzam.z + 0.9 });

    // cincin bangunan (fasad dalam)
    const gates = L.gates.map(g => ({ phi: g.phi, a: g.w / ((L.ringIn + L.ringOut) / 2) }));
    const segs = []; // busur utuh di antara gerbang (urut phi)
    const sorted = gates.slice().sort((a, b) => a.phi - b.phi);
    for (let i = 0; i < sorted.length; i++) {
      const g0 = sorted[i], g1 = sorted[(i + 1) % sorted.length];
      const s0 = g0.phi + g0.a; let s1 = g1.phi - g1.a; if (s1 <= s0) s1 += PI * 2;
      segs.push([s0, s1]);
    }
    const fac = facadeTex(), nb = Math.round(PI * 2 * L.ringIn / 11);
    segs.forEach(([p0, p1]) => {
      const len = p1 - p0, ft = fac.clone(); ft.needsUpdate = true; ft.repeat.set(len / (PI * 2) * nb, 1);
      const inner = new T.Mesh(new T.CylinderGeometry(L.ringIn, L.ringIn, L.ringH, 64, 1, true, p0 + PI / 2, len), new T.MeshLambertMaterial({ map: ft, side: T.BackSide }));
      inner.position.y = L.ringH / 2; inner.receiveShadow = true; scene.add(inner);
      const outer = new T.Mesh(new T.CylinderGeometry(L.ringOut, L.ringOut, L.ringH, 64, 1, true, p0 + PI / 2, len), lam(0xddd5c2)); outer.position.y = L.ringH / 2; scene.add(outer);
      const roof = new T.Mesh(new T.RingGeometry(L.ringIn - .4, L.ringOut, 48, 1, p0, len), lam(0xcfc9ba, { side: T.DoubleSide })); roof.rotation.x = -PI / 2; roof.position.y = L.ringH; scene.add(roof); roofs.push(roof);
    });
    // minaret
    const minM = lam(0xece4d0), capM = goldM;
    for (let i = 0; i < 10; i++) {
      const ph = (25 + 36 * i) * PI / 180, x = Math.cos(ph) * 67, z = -Math.sin(ph) * 67;
      const mn = new T.Group(); mn.position.set(x, 0, z); scene.add(mn);
      const sh = new T.Mesh(new T.CylinderGeometry(2.2, 3.1, 95, 12), minM); sh.position.y = 47.5; mn.add(sh);
      [48, 76].forEach(y => { const bl = new T.Mesh(new T.CylinderGeometry(3.4, 3.4, 1.6, 12), capM); bl.position.y = y; mn.add(bl); });
      const tp = new T.Mesh(new T.ConeGeometry(2.4, 9, 12), capM); tp.position.y = 99.5; mn.add(tp);
    }
    // menara jam (skematis, lebih rendah dari aslinya)
    const clk = new T.Group(); clk.position.set(-30, 0, 270); scene.add(clk);
    const cb = new T.Mesh(new T.BoxGeometry(80, 60, 70), lam(0xe7dfcd)); cb.position.y = 30; clk.add(cb);
    const ct = new T.Mesh(new T.BoxGeometry(36, 250, 36), lam(0xcfc6b0)); ct.position.y = 175; clk.add(ct);
    const ch = new T.Mesh(new T.BoxGeometry(52, 52, 52), lam(0xf3efe2)); ch.position.y = 285; clk.add(ch);
    const ctx = clockTex(), cm = new T.MeshBasicMaterial({ map: ctx });
    [[0, 26.2, 0], [0, -26.2, PI], [26.2, 0, PI / 2], [-26.2, 0, -PI / 2]].forEach(([x, z, r]) => { const p = new T.Mesh(new T.PlaneGeometry(40, 40), cm); p.position.set(x, 285, z); p.rotation.y = r; clk.add(p); });
    const sp = new T.Mesh(new T.ConeGeometry(14, 60, 8), goldM); sp.position.y = 340; clk.add(sp);
    // bukit di kejauhan
    for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2 + rnd() * .3, d = 900 + rnd() * 250; const h = new T.Mesh(new T.ConeGeometry(130 + rnd() * 120, 90 + rnd() * 120, 6), lam(new T.Color().setHSL(.09, .25, .42 + rnd() * .08))); h.position.set(Math.cos(a) * d, 40, Math.sin(a) * d); scene.add(h); }

    // Mas'a (Shafa-Marwah)
    const hallLen = L.safaZ - L.marwahZ + 12, hallZc = (L.safaZ + L.marwahZ) / 2, hx = (L.hallX0 + L.hallX1) / 2, hw = L.hallX1 - L.hallX0;
    add(new T.Mesh(new T.PlaneGeometry(hw, hallLen), new T.MeshLambertMaterial({ map: marbleTex('#efece4', [hw / 4, hallLen / 4]) })).rotateX(-PI / 2)).position.set(hx, .04, hallZc);
    const ceil = new T.Mesh(new T.BoxGeometry(hw + 2, .8, hallLen + 2), lam(0xd9d4c6)); ceil.position.set(hx, L.hallH + .4, hallZc); scene.add(ceil); roofs.push(ceil);
    const ceilL = new T.Mesh(new T.PlaneGeometry(hw - 4, hallLen - 4), new T.MeshBasicMaterial({ color: 0xfffbea })); ceilL.rotation.x = PI / 2; ceilL.position.set(hx, L.hallH - .02, hallZc); scene.add(ceilL); roofs.push(ceilL);
    const wallM = lam(0xece7da), wall = (x0, x1, z0, z1) => {
      const m = new T.Mesh(new T.BoxGeometry(x1 - x0, L.hallH, z1 - z0), wallM); m.position.set((x0 + x1) / 2, L.hallH / 2, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m);
      colliders.push({ t: 'r', x0, x1, z0, z1 });
    };
    wall(L.hallX1, L.hallX1 + 1, L.marwahZ - 1, L.safaZ + 6);
    wall(L.hallX0 - 1, L.hallX0, L.marwahZ - 1, -10); wall(L.hallX0 - 1, L.hallX0, 10, L.safaZ + 6);
    wall(L.hallX0, L.hallX1, L.safaZ + 6, L.safaZ + 7);
    wall(L.hallX0, 81, L.marwahZ - 1, L.marwahZ); wall(97, L.hallX1, L.marwahZ - 1, L.marwahZ);
    const colG = new T.CylinderGeometry(.7, .7, L.hallH, 10), cols = new T.InstancedMesh(colG, lam(0xf7f4ec), 60), mm = new T.Matrix4();
    let ci = 0; for (let z = L.safaZ - 4; z > L.marwahZ + 4; z -= 14) [80, 98].forEach(x => { mm.makeTranslation(x, L.hallH / 2, z); cols.setMatrixAt(ci++, mm); colliders.push({ t: 'c', x, z, r: .8 }); }); cols.count = ci; cols.castShadow = false; scene.add(cols);
    // penanda hijau
    const grM = new T.MeshBasicMaterial({ color: 0x25e068 });
    L.zHijau.forEach(z => { [L.hallX0 + .5, L.hallX1 - .5].forEach(x => { const p = new T.Mesh(new T.BoxGeometry(.5, L.hallH, .5), grM); p.position.set(x, L.hallH / 2, z); scene.add(p); }); const st = new T.Mesh(new T.PlaneGeometry(hw, .7), new T.MeshBasicMaterial({ color: 0x25e068, transparent: true, opacity: .55 })); st.rotation.x = -PI / 2; st.position.set(hx, .06, z); scene.add(st); });
    const gz = new T.Mesh(new T.PlaneGeometry(hw, L.zHijau[1] - L.zHijau[0] > 0 ? 80 : 80), new T.MeshBasicMaterial({ color: 0x25e068, transparent: true, opacity: .08 })); gz.rotation.x = -PI / 2; gz.position.set(hx, .05, (L.zHijau[0] + L.zHijau[1]) / 2);
    scene.add(gz);
    // pembatas tengah
    const rail = new T.Mesh(new T.BoxGeometry(.12, 1.0, hallLen - 14), new T.MeshLambertMaterial({ color: 0xb9b3a2, transparent: true, opacity: .8 })); rail.position.set(hx, .5, hallZc); scene.add(rail);
    // bukit Shafa & Marwah
    function hill(z, label, sub) {
      const g = new T.Group(); g.position.set(89, 0, z); scene.add(g);
      for (let i = 0; i < 9; i++) { const rk = new T.Mesh(new T.DodecahedronGeometry(1 + rnd() * 1.4, 0), lam(new T.Color().setHSL(.09, .12, .42 + rnd() * .1))); rk.position.set((rnd() - .5) * 14, .8 + rnd() * 1.2, (rnd() - .5) * 3); rk.scale.set(1.4, .9 + rnd() * .6, 1); rk.castShadow = true; g.add(rk); }
      const sg = new T.Mesh(new T.PlaneGeometry(10, 2.5), new T.MeshBasicMaterial({ map: signTex(label, sub) })); sg.position.set(0, 7.5, z > 0 ? -2.5 : 2.5); sg.rotation.y = z > 0 ? PI : 0; g.add(sg);
      const ring = new T.Mesh(new T.TorusGeometry(2, .15, 6, 24), new T.MeshBasicMaterial({ color: 0xf1d36b })); ring.rotation.x = -PI / 2; ring.position.set(0, .15, z > 0 ? -2.5 : 2.5); g.add(ring);
    }
    hill(L.safaZ + 2.6, 'SHAFA', 'الصفا'); hill(L.marwahZ - 2.6, 'MARWAH', 'المروة');
    // area tahalul
    const bb = new T.Group(); bb.position.copy(L.barber); scene.add(bb);
    const bbox = add(new T.Mesh(new T.BoxGeometry(9, 4, 5), lam(0xf0e7d0)), true, bb); bbox.position.y = 2;
    const broof = add(new T.Mesh(new T.BoxGeometry(10.5, .5, 7), lam(0x1f6f5a)), true, bb); broof.position.y = 4.3;
    const bsg = new T.Mesh(new T.PlaneGeometry(7, 1.75), new T.MeshBasicMaterial({ map: signTex('TAHALUL', 'الحلق والتقصير', '#4a2a10') })); bsg.position.set(0, 3.3, 2.55); bb.add(bsg);
    colliders.push({ t: 'r', x0: L.barber.x - 4.5, x1: L.barber.x + 4.5, z0: L.barber.z - 2.5, z1: L.barber.z + 2.5 });
    add(new T.Mesh(new T.PlaneGeometry(60, 90), new T.MeshLambertMaterial({ map: marbleTex('#e6e1d4', [15, 22]) })).rotateX(-PI / 2)).position.set(89, .035, -410);

    const crowd = makeCrowd(150, false), crowdH = makeCrowd(46, true);
    // jamaah sujud pada karpet
    carpets.forEach((c, i) => { const a = crowd.agents[i * 3 % 150]; a.kneel = true; a.x = Math.cos(c.p) * c.r + (rnd() - .5) * 3; a.z = -Math.sin(c.p) * c.r + (rnd() - .5) * 3; });
    crowd.agents.forEach(a => { if (!a.kneel) a.r = Math.min(a.r, 50); });
    scene.add(crowd.bm, crowd.hm, crowdH.bm, crowdH.hm);

    return {
      scene, sun, colliders, crowd, crowdH, L, K,
      update(dt, t) { crowd.update(dt, t); crowdH.update(dt, t); },
      setTop(top) { roofs.forEach(r => r.visible = !top); },
      collide: collideHaram
    };
  }

  /* ---------- Tabrakan ---------- */
  const PR = .35;
  function collideHaram(w, p) {
    const gates = L.gates;
    for (const c of w.colliders) {
      if (c.t === 'c') { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + PR; if (d < m && d > 1e-4) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; } }
      else { // persegi
        const x0 = c.x0 - PR, x1 = c.x1 + PR, z0 = c.z0 - PR, z1 = c.z1 + PR;
        if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) {
          const dl = p.x - x0, dr = x1 - p.x, dt = p.z - z0, db = z1 - p.z, m = Math.min(dl, dr, dt, db);
          if (m === dl) p.x = x0; else if (m === dr) p.x = x1; else if (m === dt) p.z = z0; else p.z = z1;
        }
      }
    }
    const r = Math.hypot(p.x, p.z);
    if (r > L.ringIn - PR && r < L.ringOut + PR) {
      const ph = Math.atan2(-p.z, p.x); let inGate = false;
      for (const g of gates) { if (Math.abs(wrapPi(ph - g.phi)) * r < g.w - PR) inGate = true; }
      if (!inGate) { const to = r < (L.ringIn + L.ringOut) / 2 ? L.ringIn - PR : L.ringOut + PR; p.x *= to / r; p.z *= to / r; }
    }
    p.x = Math.max(-170, Math.min(150, p.x)); p.z = Math.max(-450, Math.min(180, p.z));
  }

  /* ---------- Miqat ---------- */
  function buildMiqat(name) {
    const scene = new T.Scene(); scene.background = new T.Color(0xd8e8f0); scene.fog = new T.Fog(0xe6dfc9, 120, 700);
    scene.add(sky(), new T.HemisphereLight(0xffffff, 0xd5bd8a, 1.0));
    const sun = new T.DirectionalLight(0xfff0d6, .9); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 200 }); sun.userData.off = new T.Vector3(40, 60, -30); scene.add(sun, sun.target);
    const colliders = [];
    const sand = tex(256, 256, (g, w, h) => { g.fillStyle = '#d9c08a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 800; i++) { g.fillStyle = `rgba(${150 + rnd() * 80 | 0},${120 + rnd() * 70 | 0},${70 + rnd() * 50 | 0},.12)`; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 6, 2 + rnd() * 3); } }, [60, 60]);
    const gnd = new T.Mesh(new T.PlaneGeometry(1400, 1400), new T.MeshLambertMaterial({ map: sand })); gnd.rotation.x = -PI / 2; gnd.receiveShadow = true; scene.add(gnd);
    const road = new T.Mesh(new T.PlaneGeometry(16, 900), lam(0x4a4a50)); road.rotation.x = -PI / 2; road.position.set(0, .03, -300); scene.add(road);
    const dash = new T.Mesh(new T.PlaneGeometry(.35, 900), new T.MeshBasicMaterial({ color: 0xf5f0d0 })); dash.rotation.x = -PI / 2; dash.position.set(0, .05, -300); scene.add(dash);
    const box = (w, h, d, x, y, z, c, shadow) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), lam(c)); m.position.set(x, y, z); m.castShadow = !!shadow; m.receiveShadow = true; scene.add(m); return m; };
    // masjid
    box(26, 9, 18, -38, 4.5, -12, 0xf3efe3, true); const dome = new T.Mesh(new T.SphereGeometry(7, 20, 12, 0, PI * 2, 0, PI / 2), lam(0xe4ddc8)); dome.position.set(-38, 9, -12); dome.castShadow = true; scene.add(dome);
    const mn = new T.Mesh(new T.CylinderGeometry(1.4, 1.8, 28, 12), lam(0xf3efe3)); mn.position.set(-54, 14, -20); mn.castShadow = true; scene.add(mn);
    const mc = new T.Mesh(new T.ConeGeometry(1.7, 5, 12), lam(0xd9a826)); mc.position.set(-54, 30.5, -20); scene.add(mc);
    colliders.push({ t: 'r', x0: -51, x1: -25, z0: -21, z1: -3 }, { t: 'c', x: -54, z: -20, r: 2.2 });
    const msg = new T.Mesh(new T.PlaneGeometry(14, 3.5), new T.MeshBasicMaterial({ map: signTex('MASJID', 'مسجد الميقات', '#0e3b2c') })); msg.position.set(-38, 5.2, -2.9); scene.add(msg);
    // ruang ihram
    box(14, 5, 10, 28, 2.5, -18, 0xeee5ce, true); box(15, .5, 11, 28, 5.2, -18, 0x1f6f5a, true);
    const rs = new T.Mesh(new T.PlaneGeometry(10, 2.5), new T.MeshBasicMaterial({ map: signTex('RUANG IHRAM', 'غرفة الإحرام', '#5a3a12') })); rs.position.set(28, 3.6, -12.9); scene.add(rs);
    colliders.push({ t: 'r', x0: 21, x1: 35, z0: -23, z1: -13 });
    // gerbang miqat
    const gateG = new T.Group(); gateG.position.set(0, 0, -90); scene.add(gateG);
    [-9, 9].forEach(x => { const p = new T.Mesh(new T.BoxGeometry(2, 11, 2), lam(0xf4f1e6)); p.position.set(x, 5.5, 0); p.castShadow = true; gateG.add(p); colliders.push({ t: 'c', x, z: -90, r: 1.5 }); });
    const bn = new T.Mesh(new T.BoxGeometry(22, 3.6, 1.2), lam(0x0e3b2c)); bn.position.set(0, 11, 0); gateG.add(bn);
    const mq = new T.Mesh(new T.PlaneGeometry(21, 3.4), new T.MeshBasicMaterial({ map: signTex('MIQAT ' + name.toUpperCase(), 'ميقات', '#0e3b2c') })); mq.position.set(0, 11, .65); gateG.add(mq);
    const mq2 = mq.clone(); mq2.position.z = -.65; mq2.rotation.y = PI; gateG.add(mq2);
    const line = new T.Mesh(new T.PlaneGeometry(16, .8), new T.MeshBasicMaterial({ color: 0xf1d36b })); line.rotation.x = -PI / 2; line.position.set(0, .07, -90); scene.add(line);
    // papan arah ke Makkah
    const dir = new T.Mesh(new T.PlaneGeometry(10, 2.5), new T.MeshBasicMaterial({ map: signTex('MAKKAH →', 'مكة المكرمة', '#12365a') })); dir.position.set(10, 4, -140); dir.rotation.y = -.3; scene.add(dir);
    const pole = new T.Mesh(new T.CylinderGeometry(.15, .15, 4, 6), lam(0x555555)); pole.position.set(10, 2, -140.2); scene.add(pole);
    // pohon kurma
    for (let i = 0; i < 18; i++) { const x = (rnd() - .5) * 220, z = 20 - rnd() * 180; if (Math.abs(x) < 14 || (x > 14 && x < 44 && z < -10 && z > -28) || (x < -22 && x > -60 && z < 0 && z > -30)) continue; const tr = new T.Mesh(new T.CylinderGeometry(.3, .45, 5, 6), lam(0x6b5236)); tr.position.set(x, 2.5, z); tr.castShadow = true; scene.add(tr); const lf = new T.Mesh(new T.ConeGeometry(3, 2.6, 7), lam(0x3f7a3a)); lf.position.set(x, 6, z); scene.add(lf); colliders.push({ t: 'c', x, z, r: .6 }); }
    for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2, d = 700 + rnd() * 150; const h = new T.Mesh(new T.ConeGeometry(120 + rnd() * 80, 80 + rnd() * 60, 6), lam(0x8c7457)); h.position.set(Math.cos(a) * d, 30, Math.sin(a) * d); scene.add(h); }
    return {
      scene, sun, colliders, spawn: new T.Vector3(0, 0, 40), ihram: new T.Vector3(28, 0, -10.5), line: new T.Vector3(0, 0, -86),
      update() { }, setTop() { },
      collide(w, p) { for (const c of w.colliders) { if (c.t === 'c') { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + PR; if (d < m && d > 1e-4) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; } } else { const x0 = c.x0 - PR, x1 = c.x1 + PR, z0 = c.z0 - PR, z1 = c.z1 + PR; if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) { const dl = p.x - x0, dr = x1 - p.x, dt = p.z - z0, db = z1 - p.z, m = Math.min(dl, dr, dt, db); if (m === dl) p.x = x0; else if (m === dr) p.x = x1; else if (m === dt) p.z = z0; else p.z = z1; } } } p.x = Math.max(-150, Math.min(150, p.x)); p.z = Math.max(-300, Math.min(120, p.z)); }
    };
  }

  /* ---------- Suar tujuan ---------- */
  function makeBeacon() {
    const g = new T.Group();
    const col = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 60, 20, 1, true), new T.MeshBasicMaterial({ color: 0xf1d36b, transparent: true, opacity: .28, depthWrite: false, side: T.DoubleSide, fog: false }));
    col.position.y = 30; const rg = new T.Mesh(new T.RingGeometry(1.4, 2.0, 32), new T.MeshBasicMaterial({ color: 0xf1d36b, side: T.DoubleSide, fog: false })); rg.rotation.x = -PI / 2; rg.position.y = .12;
    const rg2 = new T.Mesh(new T.RingGeometry(2.2, 2.4, 32), new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide, transparent: true, opacity: .6, fog: false })); rg2.rotation.x = -PI / 2; rg2.position.y = .13;
    g.add(col, rg, rg2); g.userData = { col, rg, rg2 };
    return g;
  }

  return { THREE: T, L, K, kw, wrapPi, buildHaram, buildMiqat, makePerson, makeBeacon, collideHaram };
})();
