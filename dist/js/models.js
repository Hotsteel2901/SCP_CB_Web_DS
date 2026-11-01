/* models.js — 高精度程序化模型库
   替换原先的方块人：所有收容物、D 级人员、MTF 都改为多段式解剖结构，
   带关节、衣褶、接触阴影与法线细节；同一材质在多个实例间共享，draw call 仍然可控。 */
window.SCP = window.SCP || {};
(function (S) {
  const M = {};
  S.models = M;
  const FX = S.fx;

  /* ------------------------------------------------------------------ 工具 */
  function cyl(rt, rb, h, seg, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 10), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }
  function sph(r, mat, x, y, z, seg) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg || 12, Math.max(6, (seg || 12) - 3)), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }
  function box(w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }
  function lathe(pts, mat, seg) {
    const v = pts.map((p) => new THREE.Vector2(p[0], p[1]));
    return new THREE.Mesh(new THREE.LatheGeometry(v, seg || 20), mat);
  }
  M.cyl = cyl; M.sph = sph; M.box = box;

  function cv(w, h) { return FX.cv(w, h); }
  function tex(c, rep) {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (rep) t.repeat.set(rep[0], rep[1]);
    t.anisotropy = 2;
    return t;
  }
  function grain(x, w, h, n, a) {
    for (let i = 0; i < n; i++) {
      x.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '0,0,0,' : '255,255,255,') + (a * Math.random()) + ')';
      const s = 1 + Math.random() * 2;
      x.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  }

  /* ------------------------------------------------------------------ 材质 */
  const MAT = {};
  M.mats = MAT;

  function buildMaterials(T) {
    if (MAT.ready) return MAT;

    /* SCP-173：被岁月侵蚀的混凝土，带锈迹与缺口 */
    {
      const c = cv(256, 256), x = c.getContext('2d');
      x.fillStyle = '#8b8476';
      x.fillRect(0, 0, 256, 256);
      /* 大面积色斑：浇筑不均留下的深浅 */
      for (let i = 0; i < 900; i++) {
        const v = 108 + Math.random() * 64;
        x.fillStyle = 'rgba(' + v + ',' + (v - 6) + ',' + (v - 20) + ',' + (0.06 + Math.random() * 0.16) + ')';
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 26, 2 + Math.random() * 16, Math.random() * 3, 0, 7);
        x.fill();
      }
      /* 竖向流痕：雨水与渗液长期冲刷的痕迹 */
      for (let i = 0; i < 44; i++) {
        const sx = Math.random() * 256, sw = 1 + Math.random() * 7;
        const sy = Math.random() * 200, sh = 24 + Math.random() * 100;
        const gv = x.createLinearGradient(0, sy, 0, sy + sh);
        gv.addColorStop(0, 'rgba(56,48,36,0)');
        gv.addColorStop(0.35, 'rgba(56,48,36,' + (0.05 + Math.random() * 0.11) + ')');
        gv.addColorStop(1, 'rgba(56,48,36,0)');
        x.fillStyle = gv;
        x.fillRect(sx, sy, sw, sh);
      }
      /* 裂纹 */
      for (let i = 0; i < 30; i++) {
        x.strokeStyle = 'rgba(52,44,32,' + (0.10 + Math.random() * 0.26) + ')';
        x.lineWidth = 0.8 + Math.random() * 2.6;
        const x0 = Math.random() * 256, y0 = Math.random() * 256;
        x.beginPath();
        x.moveTo(x0, y0);
        x.lineTo(x0 + (Math.random() - 0.5) * 60, y0 + 20 + Math.random() * 70);
        x.stroke();
      }
      /* 崩口留下的浅坑：一圈暗边 + 略亮的坑底 */
      for (let i = 0; i < 20; i++) {
        const px = Math.random() * 256, py = Math.random() * 256, pr = 2 + Math.random() * 10;
        const gg = x.createRadialGradient(px, py, pr * 0.2, px, py, pr);
        gg.addColorStop(0, 'rgba(196,188,170,0.5)');
        gg.addColorStop(0.72, 'rgba(96,88,74,0.42)');
        gg.addColorStop(1, 'rgba(96,88,74,0)');
        x.fillStyle = gg;
        x.beginPath(); x.arc(px, py, pr, 0, 7); x.fill();
      }
      /* 气孔 */
      for (let i = 0; i < 900; i++) {
        x.fillStyle = 'rgba(58,52,42,' + (0.10 + Math.random() * 0.22) + ')';
        x.beginPath();
        x.arc(Math.random() * 256, Math.random() * 256, 0.4 + Math.random() * 1.5, 0, 7);
        x.fill();
      }
      /* 底部积尘与潮痕（flipY：画布底 = 模型底） */
      const ga = x.createLinearGradient(0, 256, 0, 96);
      ga.addColorStop(0, 'rgba(34,29,22,0.62)');
      ga.addColorStop(0.55, 'rgba(34,29,22,0.16)');
      ga.addColorStop(1, 'rgba(34,29,22,0)');
      x.fillStyle = ga;
      x.fillRect(0, 96, 256, 160);
      grain(x, 256, 256, 3400, 0.10);
      MAT.concrete173 = FX.std({ map: tex(c, [2, 3]), roughness: 0.97, metalness: 0.02, color: 0xa9a294, normalStrength: 1.15, normalScale2: 0.42 });
      const c2 = cv(128, 128), y2 = c2.getContext('2d');
      y2.fillStyle = '#9d9788';
      y2.fillRect(0, 0, 128, 128);
      grain(y2, 128, 128, 1600, 0.14);
      MAT.rebar = new THREE.MeshStandardMaterial({ color: 0x5d4a35, roughness: 0.72, metalness: 0.65 });
      MAT.chip = new THREE.MeshStandardMaterial({ color: 0x8b8474, roughness: 0.98 });
    }

    /* SCP-173 的面部：深陷的眼窝、张开的嘴、从孔洞流下的污痕 */
    {
      const c = cv(256, 320), x = c.getContext('2d');
      x.clearRect(0, 0, 256, 320);
      // 眼窝
      for (const ex of [78, 178]) {
        const g = x.createRadialGradient(ex, 108, 4, ex, 108, 44);
        g.addColorStop(0, 'rgba(4,4,4,1)');
        g.addColorStop(0.55, 'rgba(8,8,8,0.98)');
        g.addColorStop(0.82, 'rgba(20,18,14,0.75)');
        g.addColorStop(1, 'rgba(30,28,22,0)');
        x.fillStyle = g;
        x.beginPath();
        x.ellipse(ex, 112, 47, 22, (ex < 128 ? -0.13 : 0.13), 0, 7);
        x.fill();
        // 眼窝边缘的崩裂
        for (let i = 0; i < 5; i++) {
          x.strokeStyle = 'rgba(18,16,12,0.5)';
          x.lineWidth = 1 + Math.random() * 2;
          x.beginPath();
          x.moveTo(ex + (Math.random() - 0.5) * 54, 108 + (Math.random() - 0.5) * 30);
          x.lineTo(ex + (Math.random() - 0.5) * 80, 108 + (Math.random() - 0.5) * 70);
          x.stroke();
        }
      }
      // 鼻腔
      x.fillStyle = 'rgba(10,9,7,0.9)';
      x.beginPath();
      x.moveTo(128, 138);
      x.lineTo(116, 176);
      x.lineTo(140, 176);
      x.closePath();
      x.fill();
      // 嘴：张开的黑洞
      const mg = x.createRadialGradient(128, 224, 3, 128, 224, 40);
      mg.addColorStop(0, 'rgba(2,2,2,1)');
      mg.addColorStop(0.7, 'rgba(6,6,6,0.98)');
      mg.addColorStop(1, 'rgba(20,18,14,0)');
      x.fillStyle = mg;
      x.beginPath();
      x.ellipse(128, 224, 31, 27, 0, 0, 7);
      x.fill();
      // 嘴边的裂纹
      for (let i = 0; i < 7; i++) {
        const a = -0.9 + i * 0.3;
        x.strokeStyle = 'rgba(16,14,10,0.42)';
        x.lineWidth = 1 + Math.random() * 1.6;
        x.beginPath();
        x.moveTo(128 + Math.cos(a) * 36, 228 + Math.sin(a) * 28);
        x.lineTo(128 + Math.cos(a) * (58 + Math.random() * 26), 228 + Math.sin(a) * (48 + Math.random() * 30));
        x.stroke();
      }
      // 污痕
      for (let i = 0; i < 18; i++) {
        x.strokeStyle = 'rgba(32,28,20,' + (0.05 + Math.random() * 0.16) + ')';
        x.lineWidth = 1 + Math.random() * 3;
        const x0 = 60 + Math.random() * 136;
        x.beginPath();
        x.moveTo(x0, 150 + Math.random() * 40);
        x.lineTo(x0 + (Math.random() - 0.5) * 8, x0 > 120 ? 290 : 300);
        x.stroke();
      }
      MAT.face173 = new THREE.MeshStandardMaterial({
        map: tex(c), transparent: true, roughness: 0.95, metalness: 0,
        alphaTest: 0.03, polygonOffset: true, polygonOffsetFactor: -3
      });
    }

    /* SCP-106：湿滑的腐肉与黑色黏液 */
    {
      const c = cv(256, 256), x = c.getContext('2d');
      x.fillStyle = '#20241c';
      x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 700; i++) {
        const v = 18 + Math.random() * 46;
        x.fillStyle = 'rgba(' + (v + 16) + ',' + (v + 20) + ',' + (v + 6) + ',' + (0.1 + Math.random() * 0.35) + ')';
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 18, 2 + Math.random() * 10, Math.random() * 3, 0, 7);
        x.fill();
      }
      for (let i = 0; i < 40; i++) {
        x.fillStyle = 'rgba(4,6,3,' + (0.2 + Math.random() * 0.5) + ')';
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 22, 3 + Math.random() * 14, Math.random() * 3, 0, 7);
        x.fill();
      }
      grain(x, 256, 256, 2200, 0.12);
      MAT.flesh106 = FX.std({ map: tex(c), roughness: 0.34, metalness: 0.12, color: 0x8f9682, normalStrength: 1.6 });
      MAT.slime = new THREE.MeshStandardMaterial({ color: 0x0b0d09, roughness: 0.22, metalness: 0.3, transparent: true, opacity: 0.94 });
    }

    /* SCP-096：苍白、失血、皮肤紧绷 */
    {
      const c = cv(256, 256), x = c.getContext('2d');
      x.fillStyle = '#d6cfc2';
      x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 500; i++) {
        const v = 170 + Math.random() * 60;
        x.fillStyle = 'rgba(' + v + ',' + (v - 8) + ',' + (v - 20) + ',' + (0.05 + Math.random() * 0.14) + ')';
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 20, 2 + Math.random() * 12, Math.random() * 3, 0, 7);
        x.fill();
      }
      for (let i = 0; i < 30; i++) {
        x.strokeStyle = 'rgba(96,42,36,' + (0.06 + Math.random() * 0.16) + ')';
        x.lineWidth = 1 + Math.random() * 2;
        const x0 = Math.random() * 256, y0 = Math.random() * 256;
        x.beginPath();
        x.moveTo(x0, y0);
        x.bezierCurveTo(x0 + 10, y0 + 14, x0 - 8, y0 + 30, x0 + 4, y0 + 52);
        x.stroke();
      }
      grain(x, 256, 256, 2600, 0.09);
      MAT.pale096 = FX.std({ map: tex(c), roughness: 0.78, metalness: 0.02, normalStrength: 1.2 });
      MAT.blood = new THREE.MeshStandardMaterial({ color: 0x5e1410, roughness: 0.6 });
    }

    /* SCP-049：黑色长袍 */
    {
      const c = cv(128, 128), x = c.getContext('2d');
      x.fillStyle = '#15171a';
      x.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 90; i++) {
        x.strokeStyle = 'rgba(58,62,68,' + (0.05 + Math.random() * 0.14) + ')';
        x.lineWidth = 1 + Math.random() * 2;
        const y0 = Math.random() * 128;
        x.beginPath();
        x.moveTo(0, y0);
        x.bezierCurveTo(40, y0 + 6, 80, y0 - 6, 128, y0 + 2);
        x.stroke();
      }
      grain(x, 128, 128, 700, 0.07);
      MAT.robe049 = FX.std({ map: tex(c), roughness: 0.88, metalness: 0.02, color: 0xc9c9c9 });
      MAT.mask049 = FX.std({ color: 0xd9d2c2, roughness: 0.55, metalness: 0.05 });
      MAT.lens = new THREE.MeshStandardMaterial({ color: 0x101410, roughness: 0.16, metalness: 0.5 });
    }

    /* SCP-939：暗红皮革 + 无眼头部 */
    {
      const c = cv(256, 256), x = c.getContext('2d');
      x.fillStyle = '#6d2a24';
      x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 420; i++) {
        const v = 60 + Math.random() * 80;
        x.fillStyle = 'rgba(' + (v + 40) + ',' + (v * 0.42 | 0) + ',' + (v * 0.34 | 0) + ',' + (0.08 + Math.random() * 0.22) + ')';
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 16, 2 + Math.random() * 10, Math.random() * 3, 0, 7);
        x.fill();
      }
      for (let i = 0; i < 80; i++) {
        x.strokeStyle = 'rgba(38,12,10,' + (0.1 + Math.random() * 0.3) + ')';
        x.lineWidth = 1 + Math.random() * 2;
        const x0 = Math.random() * 256, y0 = Math.random() * 256;
        x.beginPath();
        x.moveTo(x0, y0);
        x.lineTo(x0 + (Math.random() - 0.5) * 30, y0 + 10 + Math.random() * 40);
        x.stroke();
      }
      grain(x, 256, 256, 2200, 0.1);
      MAT.hide939 = FX.std({ map: tex(c), roughness: 0.72, metalness: 0.04, color: 0xd8b8b0, normalStrength: 1.8 });
      MAT.teeth = new THREE.MeshStandardMaterial({ color: 0xd9d0ba, roughness: 0.42 });
    }

    /* 人体：皮肤 / D 级橙色连体服 / MTF 作战服 */
    {
      const c = cv(128, 128), x = c.getContext('2d');
      x.fillStyle = '#b9a58e';
      x.fillRect(0, 0, 128, 128);
      grain(x, 128, 128, 900, 0.1);
      MAT.skin = FX.std({ map: tex(c), roughness: 0.85, metalness: 0.02 });
      MAT.suit = FX.std({ color: 0xb35a22, roughness: 0.92, metalness: 0.02 });
      MAT.suitDark = FX.std({ color: 0x8a4218, roughness: 0.94 });
      MAT.cloth = FX.std({ color: 0x2b3138, roughness: 0.95 });
      MAT.vest = FX.std({ color: 0x1b2026, roughness: 0.86, metalness: 0.08 });
      MAT.rubber = FX.std({ color: 0x101214, roughness: 0.72 });
      MAT.steel = FX.std({ color: 0x7d858c, roughness: 0.4, metalness: 0.85 });
      MAT.white = FX.std({ color: 0xd6d2c6, roughness: 0.8 });
    }

    MAT.ready = true;
    return MAT;
  }
  M.buildMaterials = buildMaterials;

  /* ------------------------------------------------------------------ 通用人形 */
  /* opts: legLen, torsoH, armLen, shoulderW, waistW, headH, skin, torso, pants, headMat, hair */
  M.humanoid = function (opts) {
    const o = opts || {};
    const mats = o.mats || MAT;
    const skin = o.skin || mats.skin;
    const torsoMat = o.torso || o.skin || mats.skin;
    const pants = o.pants || torsoMat;
    const legLen = o.legLen !== undefined ? o.legLen : 0.92;
    const torsoH = o.torsoH !== undefined ? o.torsoH : 0.7;
    const shoulderW = o.shoulderW || 0.46;
    const waistW = o.waistW || 0.34;
    const armLen = o.armLen || 0.76;
    const g = new THREE.Group();

    const legGeoU = new THREE.CylinderGeometry(0.105, 0.085, legLen * 0.55, 8);
    const legGeoL = new THREE.CylinderGeometry(0.085, 0.062, legLen * 0.5, 8);
    const shoeGeo = new THREE.BoxGeometry(0.17, 0.1, 0.3);

    for (const s of [-1, 1]) {
      const leg = new THREE.Group();
      leg.name = s < 0 ? 'legL' : 'legR';
      leg.position.set(s * 0.115, legLen, 0);
      const upper = new THREE.Mesh(legGeoU, pants);
      upper.position.y = -legLen * 0.275;
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), pants);
      knee.position.y = -legLen * 0.55;
      const lower = new THREE.Mesh(legGeoL, pants);
      lower.position.y = -legLen * 0.78;
      const shoe = new THREE.Mesh(shoeGeo, o.shoe || mats.rubber || pants);
      shoe.position.set(0, -legLen + 0.02, 0.06);
      leg.add(upper, knee, lower, shoe);
      g.add(leg);
    }

    const hips = new THREE.Mesh(new THREE.CylinderGeometry(waistW * 0.62, waistW * 0.5, torsoH * 0.22, 8), pants);
    hips.position.y = legLen + torsoH * 0.1;
    hips.scale.z = 0.72;
    g.add(hips);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(shoulderW * 0.5, waistW * 0.62, torsoH * 0.8, 10), torsoMat);
    torso.position.y = legLen + torsoH * 0.52;
    torso.scale.z = 0.66;
    torso.name = 'torso';
    g.add(torso);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(shoulderW * 0.5, 10, 8), torsoMat);
    chest.position.y = legLen + torsoH * 0.86;
    chest.scale.set(1.02, 0.52, 0.68);
    g.add(chest);

    const neck = cyl(0.062, 0.075, 0.12, 8, skin, 0, legLen + torsoH + 0.05, 0);
    g.add(neck);

    const head = new THREE.Group();
    head.name = 'head';
    head.position.y = legLen + torsoH + 0.16;
    const skull = sph(0.115, skin, 0, 0.05, 0, 10);
    skull.scale.set(0.94, 1.12, 0.98);
    head.add(skull);
    // 下颌
    const jaw = box(0.13, 0.075, 0.1, skin, 0, -0.055, 0.035);
    jaw.name = 'jaw';
    head.add(jaw);
    // 简单的眼部阴影，让远景也能读出“脸”
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x151515, transparent: true, opacity: 0.85 });
    for (const s of [-1, 1]) {
      const e = box(0.032, 0.014, 0.01, eyeMat, s * 0.042, 0.065, 0.108);
      head.add(e);
    }
    if (o.headMat) {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.118, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), o.headMat);
      hair.position.set(0, 0.075, -0.005);
      head.add(hair);
    }
    g.add(head);

    const armGeoU = new THREE.CylinderGeometry(0.062, 0.052, armLen * 0.52, 8);
    const armGeoL = new THREE.CylinderGeometry(0.052, 0.042, armLen * 0.5, 8);
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.name = s < 0 ? 'armL' : 'armR';
      arm.position.set(s * (shoulderW * 0.5 + 0.035), legLen + torsoH * 0.86, 0);
      const upper = new THREE.Mesh(armGeoU, o.sleeve || torsoMat);
      upper.position.y = -armLen * 0.26;
      upper.rotation.z = s * 0.04;
      const elbow = sph(0.055, o.sleeve || torsoMat, 0, -armLen * 0.52, 0, 8);
      const lower = new THREE.Mesh(armGeoL, skin);
      lower.position.y = -armLen * 0.75;
      const hand = sph(0.055, skin, 0, -armLen - 0.01, 0.02, 8);
      hand.scale.set(0.9, 1.25, 0.7);
      arm.add(upper, elbow, lower, hand);
      g.add(arm);
    }

    g.userData = {
      legL: g.getObjectByName('legL'),
      legR: g.getObjectByName('legR'),
      armL: g.getObjectByName('armL'),
      armR: g.getObjectByName('armR'),
      head: head,
      torso: torso,
      leg: g.getObjectByName('legL'),
      leg2: g.getObjectByName('legR'),
      arm: g.getObjectByName('armL'),
      arm2: g.getObjectByName('armR')
    };
    return g;
  };

  M.dclass = function () {
    const g = M.humanoid({ torso: MAT.suit, pants: MAT.suit, sleeve: MAT.suit, headMat: new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 0.9 }) });
    // 胸前 D 级标识条
    const tag = box(0.1, 0.06, 0.01, MAT.white, 0, 1.38, 0.15);
    g.add(tag);
    addShadow(g, 0.36);
    return g;
  };

  M.mtf = function () {
    const g = M.humanoid({ torso: MAT.cloth, pants: MAT.cloth, sleeve: MAT.cloth, shoulderW: 0.5 });
    const u = g.userData;
    // 防弹背心
    const vest = box(0.44, 0.42, 0.3, MAT.vest, 0, 1.36, 0);
    g.add(vest);
    for (let i = 0; i < 3; i++) {
      const pouch = box(0.09, 0.1, 0.06, MAT.rubber, -0.14 + i * 0.14, 1.3, 0.18);
      g.add(pouch);
    }
    // 头盔 + 护目镜
    const helmet = sph(0.145, MAT.vest, 0, 1.98, -0.005, 12);
    helmet.scale.set(1, 0.92, 1.06);
    g.add(helmet);
    const visor = box(0.19, 0.06, 0.02, new THREE.MeshBasicMaterial({ color: 0x2b3f4a }), 0, 1.96, 0.125);
    g.add(visor);
    // 步枪（斜挎）
    const rifle = new THREE.Group();
    rifle.add(box(0.055, 0.09, 0.62, MAT.rubber, 0, 0, 0.1));
    rifle.add(box(0.03, 0.05, 0.3, MAT.steel, 0, 0.02, -0.25));
    rifle.add(box(0.04, 0.14, 0.08, MAT.rubber, 0, -0.1, 0.02));
    rifle.position.set(-0.22, 1.24, 0.24);
    rifle.rotation.x = 0.12;
    rifle.rotation.y = 0.1;
    g.add(rifle);
    addShadow(g, 0.4);
    return g;
  };

  function addShadow(g, r, op) {
    try { g.add(FX.blobShadow(r || 0.4, op === undefined ? 0.75 : op)); } catch (e) { }
  }
  M.addShadow = addShadow;

  /* 用低频噪声把规则几何“凿”出细微起伏：远看是雕刻的石料，近看不会像塑料球 */
  function roughen(mesh, amp, seed) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    const sd = seed || 0;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n =
        Math.sin(v.x * 5.3 + sd * 1.7) * Math.cos(v.z * 4.1 - sd) * 0.55 +
        Math.sin(v.y * 7.7 + sd * 2.3) * Math.cos(v.x * 6.1 + sd) * 0.3 +
        Math.sin((v.x + v.z) * 11.3 + sd) * 0.15;
      const len = Math.hypot(v.x, v.z) || 1;
      v.x += (v.x / len) * n * amp;
      v.z += (v.z / len) * n * amp;
      v.y += n * amp * 0.5;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return mesh;
  }
  M.roughen = roughen;

  /* Catmull-Rom 重采样：让 Lathe 的侧影更圆润，同时给顶点级细节提供足够密度 */
  function resample(prof, n) {
    const pts = prof.map((p) => new THREE.Vector2(p[0], p[1]));
    const out = [];
    const seg = pts.length - 1;
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * seg;
      const k = Math.min(seg - 1, Math.floor(t));
      const f = t - k;
      const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(seg, k + 2)];
      const f2 = f * f, f3 = f2 * f;
      const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f2 + (-a + 3 * b - 3 * c + d) * f3);
      out.push([cr(p0.x, p1.x, p2.x, p3.x), cr(p0.y, p1.y, p2.y, p3.y)]);
    }
    return out;
  }
  M.resample = resample;

  /* 顶点级崩口：在表面挑若干点做碗状凹陷，做出石料被磕掉一块的真实轮廓，
     比贴图更有效——侧光下的明暗边界会跟着凹坑走。 */
  function pockmark(mesh, count, seed, rMin, rMax, dMin, dMax) {
    const geo = mesh.geometry;
    if (!geo || !geo.attributes.position) return mesh;
    geo.computeVertexNormals();
    const pos = geo.attributes.position, nor = geo.attributes.normal;
    const n = pos.count;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      P[i * 3] = pos.getX(i); P[i * 3 + 1] = pos.getY(i); P[i * 3 + 2] = pos.getZ(i);
      N[i * 3] = nor.getX(i); N[i * 3 + 1] = nor.getY(i); N[i * 3 + 2] = nor.getZ(i);
    }
    let sd = Math.abs(Math.floor(seed || 11)) % 2147483647 || 11;
    const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    const hits = [];
    const rc = rMin || 0.08, rx = rMax || 0.18, dc = dMin || 0.01, dx = dMax || 0.03;
    for (let k = 0; k < count; k++) {
      const i = Math.floor(rnd() * n);
      hits.push({ x: P[i * 3], y: P[i * 3 + 1], z: P[i * 3 + 2], r: rc + rnd() * (rx - rc), d: dc + rnd() * (dx - dc) });
    }
    for (let i = 0; i < n; i++) {
      const px = P[i * 3], py = P[i * 3 + 1], pz = P[i * 3 + 2];
      let off = 0;
      for (let k = 0; k < hits.length; k++) {
        const h = hits[k];
        const ddx = px - h.x, ddy = py - h.y, ddz = pz - h.z;
        const dd = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);
        if (dd < h.r) { const t = 1 - dd / h.r; off -= h.d * t * t; }
      }
      if (off !== 0) pos.setXYZ(i, px + N[i * 3] * off, py + N[i * 3 + 1] * off, pz + N[i * 3 + 2] * off);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return mesh;
  }
  M.pockmark = pockmark;

  /* ------------------------------------------------------------------ SCP-173 */
  M.build173 = function (T) {
    const m = buildMaterials(T);
    const g = new THREE.Group();
    const con = m.concrete173;

    /* 侧影：近乎笔直的柱体，只在肩部收拢——原作雕塑是一整块浇筑体，不是花瓶。
       底部有一圈薄台阶（运输底座留下的痕迹），往上到胸口略外扩，肩部收进，直接接头部。 */
    const prof = [
      [0.286, 0.000], [0.312, 0.022], [0.310, 0.066], [0.296, 0.130],
      [0.281, 0.240], [0.272, 0.380], [0.271, 0.520], [0.277, 0.680],
      [0.286, 0.840], [0.294, 0.990], [0.297, 1.120], [0.291, 1.240],
      [0.276, 1.360], [0.254, 1.470], [0.236, 1.560], [0.222, 1.640]
    ];
    const body = lathe(resample(prof, 48), con, 56);
    body.scale.z = 0.93;
    roughen(body, 0.007, 1.3);
    pockmark(body, 17, 9173, 0.070, 0.170, 0.010, 0.026);
    g.add(body);

    /* 头：与肩部大幅重叠，杜绝“雪人脖子”；向下压、略前倾 */
    const HY = 1.786, HR = 0.276;
    const head = sph(HR, con, 0, HY, 0.030, 28);
    head.scale.set(1.0, 1.18, 0.96);
    head.rotation.x = -0.10;
    roughen(head, 0.005, 7.7);
    pockmark(head, 6, 1734, 0.042, 0.090, 0.006, 0.015);
    g.add(head);

    /* 面部：球面切片 + 透明贴图；theta 范围下移到赤道附近，五官才不会“爬”到头顶 */
    const faceTex = MAT.face173 ? MAT.face173.map : T.face173;
    if (faceTex) {
      const fm = MAT.face173 || new THREE.MeshStandardMaterial({
        map: faceTex, transparent: true, roughness: 0.9, metalness: 0.0,
        alphaTest: 0.04, polygonOffset: true, polygonOffsetFactor: -2
      });
      const face = new THREE.Mesh(new THREE.SphereGeometry(HR * 1.014, 30, 22, Math.PI * 0.5 - 0.70, 1.40, 1.00, 1.00), fm);
      face.position.set(0, HY, 0.030);
      face.scale.set(1.0, 1.18, 0.96);
      face.rotation.x = -0.10;
      g.add(face);
    }

    /* 手臂：肩点在柱体外沿，上臂几乎垂直，肘部前折，双手抬到胸前合拢 */
    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.name = s < 0 ? 'armL' : 'armR';
      const shoulder = sph(0.098, con, s * 0.250, 1.390, 0.005, 14);
      shoulder.scale.set(1.05, 0.95, 1);
      const upper = cyl(0.090, 0.078, 0.40, 14, con, s * 0.300, 1.190, 0.008);
      upper.rotation.z = s * 0.10;
      const elbow = sph(0.084, con, s * 0.338, 0.985, 0.020, 14);
      const fore = cyl(0.079, 0.064, 0.36, 14, con, s * 0.330, 0.955, 0.150);
      fore.rotation.x = -1.14;
      fore.rotation.z = s * 0.10;
      const hand = sph(0.086, con, s * 0.252, 0.930, 0.302, 14);
      hand.scale.set(0.80, 1.12, 0.94);
      hand.rotation.set(-0.42, s * -0.35, 0);
      for (let f = 0; f < 4; f++) {
        const fg = cyl(0.017, 0.014, 0.10, 6, con, s * (0.226 - f * 0.006), 0.905, 0.360 + f * 0.012);
        fg.rotation.x = -1.46;
        fg.rotation.z = s * 0.12;
        arm.add(fg);
      }
      arm.add(shoulder, upper, elbow, fore, hand);
      g.add(arm);
    }

    /* 外露钢筋：从肩背的断口里戳出来 */
    const rebarDef = [
      [-0.19, 1.44, -0.10, 0.55, -0.42],
      [0.18, 1.42, -0.12, -0.5, -0.46],
      [0.23, 1.30, 0.04, -0.9, 0.22],
      [-0.22, 1.28, 0.07, 0.85, 0.3],
      [0.05, 1.49, -0.14, -0.2, -0.75]
    ];
    for (let i = 0; i < rebarDef.length; i++) {
      const d = rebarDef[i];
      const rb = cyl(0.016, 0.012, 0.20 + (i % 2) * 0.12, 6, m.rebar, d[0], d[1], d[2]);
      rb.rotation.set(d[3], 0, d[4]);
      g.add(rb);
    }

    addShadow(g, 0.46, 0.88);
    g.userData.height = 2.12;
    return g;
  };

  /* ------------------------------------------------------------------ SCP-106 */
  M.build106 = function (T) {
    const m = buildMaterials(T);
    const g = new THREE.Group();
    const f = m.flesh106;
    const hips = new THREE.Group();
    hips.position.y = 1.02;
    g.add(hips);

    const torso = lathe([[0.20, 0], [0.24, 0.15], [0.25, 0.35], [0.22, 0.55], [0.26, 0.72], [0.22, 0.86], [0.12, 0.95]], f, 14);
    torso.position.y = 0.02;
    torso.rotation.x = 0.2;
    torso.scale.z = 0.72;
    hips.add(torso);

    // 肋骨轮廓
    for (let i = 0; i < 5; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.17 - i * 0.012, 0.012, 4, 12, Math.PI * 1.2), m.slime);
      r.position.set(0, 0.2 + i * 0.11, 0.06);
      r.rotation.x = Math.PI / 2;
      r.rotation.z = 0.2;
      hips.add(r);
    }

    const neck = cyl(0.055, 0.08, 0.2, 8, f, 0, 0.99, 0.1);
    neck.rotation.x = 0.4;
    hips.add(neck);

    const headG = new THREE.Group();
    headG.name = 'head';
    headG.position.set(0, 1.08, 0.16);
    const skull = sph(0.135, f, 0, 0, 0, 12);
    skull.scale.set(0.92, 1.18, 1.0);
    headG.add(skull);
    const jaw = box(0.11, 0.13, 0.1, f, 0, -0.11, 0.045);
    jaw.rotation.x = 0.25;
    headG.add(jaw);
    const mouth = new THREE.MeshBasicMaterial({ color: 0x050605 });
    headG.add(box(0.075, 0.045, 0.01, mouth, 0, -0.055, 0.128));
    for (const s of [-1, 1]) {
      const eye = sph(0.022, new THREE.MeshBasicMaterial({ color: 0xc9d6a8 }), s * 0.05, 0.035, 0.115, 6);
      headG.add(eye);
    }
    hips.add(headG);

    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.name = s < 0 ? 'armL' : 'armR';
      arm.position.set(s * 0.24, 0.86, 0.02);
      const upper = cyl(0.052, 0.042, 0.44, 8, f, 0, -0.2, 0);
      upper.rotation.z = s * 0.16;
      const elbow = sph(0.05, f, s * 0.05, -0.42, 0.02, 8);
      const fore = cyl(0.042, 0.03, 0.46, 8, f, s * 0.075, -0.63, 0.06);
      fore.rotation.z = s * 0.1;
      const hand = sph(0.052, f, s * 0.085, -0.87, 0.1, 8);
      hand.scale.set(0.8, 1.4, 0.6);
      // 长指
      for (let i = 0; i < 3; i++) {
        const fg = cyl(0.009, 0.005, 0.12, 4, f, s * (0.06 + i * 0.02), -0.96, 0.12);
        fg.rotation.x = -0.3;
        arm.add(fg);
      }
      arm.add(upper, elbow, fore, hand);
      hips.add(arm);

      const leg = new THREE.Group();
      leg.name = s < 0 ? 'legL' : 'legR';
      leg.position.set(s * 0.11, 0.02, 0);
      leg.add(cyl(0.07, 0.055, 0.5, 8, f, 0, -0.26, 0));
      leg.add(cyl(0.055, 0.04, 0.46, 8, f, 0, -0.72, 0.02));
      const foot = box(0.11, 0.06, 0.26, m.slime, 0, -0.97, 0.07);
      leg.add(foot);
      hips.add(leg);
    }

    // 身上滴落的黑泥
    for (let i = 0; i < 9; i++) {
      const d = sph(0.018 + Math.random() * 0.03, m.slime,
        (Math.random() - 0.5) * 0.4, 0.2 + Math.random() * 0.9, (Math.random() - 0.5) * 0.3, 6);
      d.scale.y = 1.8;
      hips.add(d);
    }

    g.userData = {
      legL: hips.getObjectByName('legL'), legR: hips.getObjectByName('legR'),
      armL: hips.getObjectByName('armL'), armR: hips.getObjectByName('armR'),
      head: headG, torso: torso
    };
    addShadow(g, 0.42, 0.7);
    g.userData.height = 2.1;
    return g;
  };

  /* ------------------------------------------------------------------ SCP-096 */
  M.build096 = function (T) {
    const m = buildMaterials(T);
    const g = new THREE.Group();
    const p = m.pale096;
    const hips = new THREE.Group();
    hips.name = 'hips';
    hips.position.y = 1.05;
    g.add(hips);

    const torso = lathe([[0.14, 0], [0.17, 0.2], [0.19, 0.42], [0.22, 0.62], [0.2, 0.8], [0.12, 0.9]], p, 12);
    torso.scale.z = 0.7;
    hips.add(torso);

    const neck = cyl(0.045, 0.06, 0.16, 8, p, 0, 0.94, 0);
    hips.add(neck);

    const headG = new THREE.Group();
    headG.name = 'head';
    headG.position.set(0, 1.1, 0.01);
    const skull = sph(0.145, p, 0, 0.02, 0, 12);
    skull.scale.set(0.9, 1.22, 1.0);
    headG.add(skull);
    const jaw = box(0.12, 0.16, 0.11, p, 0, -0.15, 0.04);
    jaw.name = 'jaw';
    headG.add(jaw);
    const mouth = new THREE.MeshBasicMaterial({ color: 0x2a0808 });
    headG.add(box(0.09, 0.09, 0.012, mouth, 0, -0.15, 0.098));
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    for (const s of [-1, 1]) headG.add(box(0.035, 0.05, 0.01, eyeMat, s * 0.055, 0.02, 0.135));
    // 面部贴图（如果有）
    if (T.face096) {
      const fm = new THREE.MeshStandardMaterial({
        map: T.face096, transparent: true, roughness: 0.8, alphaTest: 0.05,
        polygonOffset: true, polygonOffsetFactor: -2
      });
      const face = new THREE.Mesh(new THREE.SphereGeometry(0.147, 18, 14, Math.PI * 0.5 - 0.5, 1.0, 1.0, 0.95), fm);
      face.scale.set(0.9, 1.22, 1.0);
      headG.add(face);
    }
    hips.add(headG);

    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.name = s < 0 ? 'armL' : 'armR';
      arm.position.set(s * 0.2, 0.86, 0);
      const upper = cyl(0.044, 0.036, 0.52, 8, p, 0, -0.26, 0);
      const elbow = sph(0.038, p, 0, -0.52, 0, 8);
      const fore = cyl(0.036, 0.026, 0.5, 8, p, 0, -0.78, 0.01);
      const hand = sph(0.045, p, 0, -1.04, 0.01, 8);
      hand.scale.set(0.8, 1.5, 0.55);
      for (let i = 0; i < 3; i++) {
        const fg = cyl(0.008, 0.004, 0.11, 4, p, s * (0.02 + i * 0.015), -1.11, 0.02);
        arm.add(fg);
      }
      arm.add(upper, elbow, fore, hand);
      hips.add(arm);

      const leg = new THREE.Group();
      leg.name = s < 0 ? 'legL' : 'legR';
      leg.position.set(s * 0.095, 0.02, 0);
      leg.add(cyl(0.058, 0.045, 0.55, 8, p, 0, -0.28, 0));
      leg.add(cyl(0.045, 0.032, 0.52, 8, p, 0, -0.8, 0.01));
      const foot = box(0.09, 0.045, 0.22, p, 0, -1.06, 0.06);
      leg.add(foot);
      hips.add(leg);
    }

    g.userData = {
      legL: hips.getObjectByName('legL'), legR: hips.getObjectByName('legR'),
      armL: hips.getObjectByName('armL'), armR: hips.getObjectByName('armR'),
      head: headG, torso: torso, jaw: jaw
    };
    addShadow(g, 0.3, 0.55);
    g.userData.height = 2.45;
    return g;
  };

  /* ------------------------------------------------------------------ SCP-049 */
  M.build049 = function (T) {
    const m = buildMaterials(T);
    const g = new THREE.Group();
    const robe = m.robe049;
    // 长袍：下摆更宽，肩部收窄
    const prof = [[0.02, 0.0], [0.42, 0.0], [0.40, 0.12], [0.35, 0.35], [0.30, 0.62], [0.26, 0.85], [0.24, 1.0], [0.26, 1.12], [0.2, 1.2]];
    const body = lathe(prof, robe, 18);
    body.scale.z = 0.8;
    g.add(body);
    // 衣褶
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const fold = cyl(0.012, 0.02, 0.85, 4, robe, Math.cos(a) * 0.33, 0.48, Math.sin(a) * 0.27);
      fold.rotation.z = Math.cos(a) * 0.08;
      fold.rotation.x = Math.sin(a) * 0.08;
      g.add(fold);
    }
    // 肩部披风
    const shoulders = sph(0.28, robe, 0, 1.16, 0, 12);
    shoulders.scale.set(1.15, 0.55, 0.9);
    g.add(shoulders);

    const headG = new THREE.Group();
    headG.name = 'head';
    headG.position.set(0, 1.34, 0.02);
    const hood = sph(0.17, robe, 0, 0, -0.02, 12);
    hood.scale.set(1, 1.12, 1.05);
    headG.add(hood);
    // 面具
    const mask = sph(0.135, m.mask049, 0, -0.01, 0.055, 14);
    mask.scale.set(0.94, 1.02, 0.8);
    headG.add(mask);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.34, 10), m.mask049);
    beak.position.set(0, -0.04, 0.23);
    beak.rotation.x = Math.PI / 2 + 0.22;
    headG.add(beak);
    for (const s of [-1, 1]) {
      const lens = sph(0.035, m.lens, s * 0.055, 0.035, 0.155, 8);
      headG.add(lens);
    }
    // 帽子
    const brim = cyl(0.3, 0.3, 0.022, 16, robe, 0, 0.19, -0.01);
    headG.add(brim);
    headG.add(cyl(0.155, 0.175, 0.22, 12, robe, 0, 0.3, -0.01));
    g.add(headG);

    for (const s of [-1, 1]) {
      const arm = new THREE.Group();
      arm.name = s < 0 ? 'armL' : 'armR';
      arm.position.set(s * 0.27, 1.09, 0.02);
      const upper = cyl(0.055, 0.048, 0.4, 8, robe, 0, -0.18, 0);
      upper.rotation.z = s * 0.12;
      const fore = cyl(0.048, 0.038, 0.38, 8, robe, s * 0.02, -0.54, 0.04);
      const cuff = cyl(0.055, 0.06, 0.08, 8, m.mask049, s * 0.02, -0.72, 0.05);
      const hand = sph(0.045, m.mask049, s * 0.02, -0.78, 0.05, 8);
      hand.scale.set(0.9, 1.2, 0.7);
      arm.add(upper, fore, cuff, hand);
      g.add(arm);
    }
    // 医疗包
    const bag = box(0.2, 0.16, 0.1, m.mask049, 0.26, 0.78, 0.14);
    bag.rotation.z = 0.2;
    g.add(bag);

    g.userData = {
      legL: null, legR: null,
      armL: g.getObjectByName('armL'), armR: g.getObjectByName('armR'),
      head: headG
    };
    addShadow(g, 0.45, 0.8);
    g.userData.height = 2.0;
    return g;
  };

  /* ------------------------------------------------------------------ SCP-939 */
  M.build939 = function (T) {
    const m = buildMaterials(T);
    const g = new THREE.Group();
    const h = m.hide939;
    // 躯干：低伏的四足/半直立混合体
    const body = sph(0.36, h, 0, 0.86, 0, 14);
    body.scale.set(0.78, 0.72, 1.6);
    g.add(body);
    const neck = cyl(0.16, 0.22, 0.46, 10, h, 0, 0.95, 0.66);
    neck.rotation.x = 1.05;
    g.add(neck);
    const headG = new THREE.Group();
    headG.position.set(0, 1.03, 0.92);
    const head = sph(0.22, h, 0, 0, 0, 12);
    head.scale.set(0.86, 0.78, 1.5);
    headG.add(head);
    // 巨大的下颌
    const jaw = new THREE.Group();
    jaw.name = 'jaw';
    jaw.position.set(0, -0.07, 0.06);
    const jawMesh = box(0.26, 0.1, 0.42, h, 0, 0, 0.16);
    jaw.add(jawMesh);
    // 牙
    for (let i = 0; i < 8; i++) {
      const t = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.08, 4), m.teeth);
      t.position.set(-0.1 + (i % 4) * 0.065, 0.055, 0.02 + Math.floor(i / 4) * 0.24);
      jaw.add(t);
    }
    headG.add(jaw);
    for (let i = 0; i < 8; i++) {
      const t = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.08, 4), m.teeth);
      t.position.set(-0.1 + (i % 4) * 0.065, -0.05, 0.02 + Math.floor(i / 4) * 0.24);
      t.rotation.x = Math.PI;
      headG.add(t);
    }
    g.add(headG);

    // 背脊骨刺
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.05 - i * 0.003, 0.24 - i * 0.018, 4), h);
      sp.position.set(0, 1.16 - i * 0.02, 0.5 - i * 0.2);
      sp.rotation.x = -0.25;
      g.add(sp);
    }
    // 尾部
    const tail = cyl(0.045, 0.1, 0.8, 8, h, 0, 0.86, -0.9);
    tail.rotation.x = Math.PI / 2 + 0.25;
    g.add(tail);

    for (const s of [-1, 1]) {
      for (const fz of [0.52, -0.5]) {
        const leg = new THREE.Group();
        leg.name = 'leg_' + s + '_' + fz;
        leg.position.set(s * 0.27, 0.82, fz);
        const upper = cyl(0.075, 0.06, 0.42, 8, h, 0, -0.21, 0);
        upper.rotation.z = s * 0.18;
        const lower = cyl(0.06, 0.042, 0.44, 8, h, s * 0.07, -0.58, 0.03);
        const foot = box(0.14, 0.06, 0.26, h, s * 0.1, -0.8, 0.1);
        leg.add(upper, lower, foot);
        g.add(leg);
      }
    }
    addShadow(g, 0.6, 0.7);
    g.userData.height = 1.45;
    g.userData.jaw = jaw;
    return g;
  };

  /* ------------------------------------------------------------------ 其它收容物 */
  M.build966 = function (T) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xd8e0e4, transparent: true, opacity: 0.34, depthWrite: false,
      roughness: 0.9, emissive: 0x2a3a40, emissiveIntensity: 0.4
    });
    const g = M.humanoid({ torso: mat, pants: mat, sleeve: mat, skin: mat, headMat: null, shoulderW: 0.4, waistW: 0.28 });
    g.userData.noShadow = true;
    return g;
  };

  M.build513_1 = function () {
    const mat = new THREE.MeshStandardMaterial({ color: 0x07070b, roughness: 0.98, metalness: 0 });
    const g = M.humanoid({ torso: mat, pants: mat, sleeve: mat, skin: mat, shoulderW: 0.36, waistW: 0.26, legLen: 1.2, torsoH: 0.9, armLen: 1.3 });
    const eye = new THREE.MeshBasicMaterial({ color: 0xe6e6e6 });
    for (const ox of [-0.045, 0.045]) {
      const e = sph(0.014, eye, ox, 2.18, 0.13, 6);
      g.add(e);
    }
    g.userData.noShadow = true;
    return g;
  };

  M.buildBear = function (T, ears) {
    const mat = T.bearEars ? new THREE.MeshStandardMaterial({ map: ears ? T.bearEars : T.bear, roughness: 0.92 }) : new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.92 });
    const g = new THREE.Group();
    const body = sph(0.3, mat, 0, 0.32, 0, 12);
    body.scale.set(1, 1.18, 0.9);
    g.add(body);
    const head = sph(0.22, mat, 0, 0.74, 0.02, 12);
    g.add(head);
    for (const ox of [-0.16, 0.16]) {
      const ear = sph(0.085, mat, ox, 0.93, 0, 8);
      g.add(ear);
    }
    if (!ears) {
      const eye = new THREE.MeshBasicMaterial({ color: 0x0b0b0b });
      for (const ox of [-0.07, 0.07]) g.add(sph(0.025, eye, ox, 0.77, 0.19, 6));
      const muzzle = sph(0.08, new THREE.MeshStandardMaterial({ color: 0xd8c8a8, roughness: 0.9 }), 0, 0.7, 0.2, 8);
      muzzle.scale.set(1, 0.75, 0.7);
      g.add(muzzle);
      g.add(sph(0.026, new THREE.MeshBasicMaterial({ color: 0x141414 }), 0, 0.72, 0.27, 6));
    } else {
      // 1048-A：全身耳朵
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2;
        const b = Math.acos(2 * Math.random() - 1);
        const r = 0.22 + Math.random() * 0.12;
        const ear = sph(0.045 + Math.random() * 0.03,
          new THREE.MeshStandardMaterial({ color: 0x9a7a68, roughness: 0.85 }),
          Math.sin(b) * Math.cos(a) * r, 0.34 + Math.cos(b) * r * 1.2, Math.sin(b) * Math.sin(a) * r * 0.9, 6);
        ear.scale.set(1, 1.6, 0.5);
        g.add(ear);
      }
    }
    addShadow(g, 0.3, 0.6);
    return g;
  };

  M.buildDuck = function () {
    const mat = new THREE.MeshStandardMaterial({ color: 0xe0c020, roughness: 0.65 });
    const g = new THREE.Group();
    const body = sph(0.2, mat, 0, 0.2, 0, 10);
    body.scale.set(1.3, 0.85, 1);
    g.add(body);
    const head = sph(0.12, mat, 0.16, 0.36, 0, 10);
    g.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.15, 8),
      new THREE.MeshStandardMaterial({ color: 0xe07020, roughness: 0.7 }));
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.3, 0.35, 0);
    g.add(beak);
    const eye = new THREE.MeshBasicMaterial({ color: 0x111111 });
    for (const oz of [-0.06, 0.06]) g.add(sph(0.018, eye, 0.2, 0.4, oz, 6));
    addShadow(g, 0.18, 0.5);
    return g;
  };

  /* ------------------------------------------------------------------ 环境道具 */
  M.makeDesk = function (m, w) {
    const g = new THREE.Group();
    const W = w || 1.6;
    const top = box(W, 0.06, 0.8, m.wood || m.dark, 0, 0.75, 0);
    g.add(top);
    for (const sx of [-W / 2 + 0.08, W / 2 - 0.08]) {
      g.add(box(0.05, 0.72, 0.66, m.dark, sx, 0.37, 0));
    }
    g.add(box(W - 0.2, 0.5, 0.05, m.dark, 0, 0.45, -0.33));
    return g;
  };

  M.makeChair = function (m) {
    const g = new THREE.Group();
    g.add(box(0.44, 0.06, 0.44, m.dark, 0, 0.45, 0));
    g.add(box(0.44, 0.5, 0.05, m.dark, 0, 0.7, -0.2));
    for (const sx of [-0.18, 0.18]) for (const sz of [-0.18, 0.18]) g.add(cyl(0.02, 0.02, 0.45, 5, m.metal, sx, 0.22, sz));
    return g;
  };

  M.makeCrate = function (m, s) {
    const g = new THREE.Group();
    const S = s || 1;
    g.add(box(0.9 * S, 0.8 * S, 0.9 * S, m.wood || m.dark, 0, 0.4 * S, 0));
    for (const y of [0.12, 0.68]) for (const dz of [-1, 1]) g.add(box(0.94 * S, 0.08, 0.04, m.metal, 0, y * S, dz * 0.46 * S));
    return g;
  };

  M.makeBarrel = function (m) {
    const g = new THREE.Group();
    g.add(cyl(0.3, 0.3, 0.9, 12, m.rust || m.metal, 0, 0.45, 0));
    for (const y of [0.18, 0.45, 0.72]) g.add(cyl(0.315, 0.315, 0.04, 12, m.dark, 0, y, 0));
    return g;
  };

  M.makeTerminal = function (m, screenMat) {
    const g = new THREE.Group();
    g.add(box(0.5, 0.08, 0.4, m.dark, 0, 0.78, 0));
    g.add(box(0.5, 0.4, 0.34, m.dark, 0, 1.0, -0.02));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), screenMat || m.screen);
    scr.position.set(0, 1.02, 0.16);
    g.add(scr);
    g.add(box(0.44, 0.06, 0.16, m.dark, 0, 0.82, 0.1));
    g.add(cyl(0.03, 0.05, 0.74, 6, m.dark, 0, 0.38, 0));
    return g;
  };

  M.makeLampFixture = function (m) {
    const g = new THREE.Group();
    g.add(box(0.62, 0.05, 0.28, m.dark, 0, 0, 0));
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.2), m.lightPanel);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.03;
    glow.name = 'lampGlow';
    g.add(glow);
    return g;
  };
})(window.SCP);
