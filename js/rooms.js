/* rooms.js — 原作房间扩展（依据 Data/rooms.ini 的房间清单实现）
   每个 builder 接收 (cell, cx, cz, ctx)，ctx 由 map.js 提供。 */
window.SCP = window.SCP || {};
(function (S) {
  const R = {};
  S.ROOMS = R;
  const H = 4;
  const IN = 1.8;

  function screen(ctx, x, y, z, ry, w, h, tex) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w || 1.4, h || 1.0),
      new THREE.MeshBasicMaterial({ map: tex || ctx.T.monitor }));
    m.position.set(x, y, z);
    m.rotation.y = ry || 0;
    ctx.scene.add(m);
    return m;
  }
  function sprite(ctx, id, x, y, z, sc) {
    const mat = new THREE.SpriteMaterial({
      map: ctx.game.ICONS[id + '_tex'] || ctx.game.ICONS['doc_tex'], transparent: true
    });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(sc || 0.8, sc || 0.8, 1);
    sp.position.set(x, y, z);
    ctx.scene.add(sp);
    return sp;
  }
  function it(ctx, x, z, y, r, hint, action) {
    ctx.W.interact.push({ x: x, z: z, y: y || 1.2, r: r || 1.8, hint: hint, action: action });
  }
  function sgn(ctx, l1, l2, o, x, y, z, ry, w, h) {
    ctx.addSign(S.makeSignTex(l1, l2, o), x, y, z, ry, w, h);
  }
  function lit(ctx, col, i, d, x, y, z) { return ctx.addLight(col, i, d, x, y, z); }

  /* ==================================================================== LCZ */

  R.dcell = function (cell, cx, cz, ctx) {
    const m = ctx.mats, T = ctx.T;
    for (let i = 0; i < 3; i++) {
      const ox = -2.6 + i * 2.6;
      ctx.addBox(m.metal, 0.25, 2.6, 2.6, cx + ox, 1.3, cz - 2.6, 0, true, cell);
      ctx.addBox(m.metal, 2.2, 0.25, 0.25, cx + ox + 0.1, 2.5, cz - 1.4, 0, false, cell);
      for (let b = 0; b < 5; b++)
        ctx.addBox(m.dark, 0.1, 2.4, 0.1, cx + ox - 0.95 + b * 0.48, 1.2, cz - 1.35, 0, false, cell);
      ctx.addBox(m.white, 2.0, 0.35, 0.8, cx + ox, 0.2, cz - 2.6, 0, true, cell);
    }
    ctx.addBox(m.metal, 3.0, 1.0, 0.8, cx, 0.5, cz + 3.0, 0, true, cell);
    ctx.addPickup('dori', cx - 1.0, 0.6, cz + 3.0);
    ctx.addPickup('cigarette', cx + 0.6, 0.6, cz + 3.0);
    sgn(ctx, 'D 级人员居住区', 'CLASS-D QUARTERS', { border: '#c9a13b' }, cx, 3.2, cz - 8 * 0.5 + 0.3, 0, 2.6, 0.6);
    lit(ctx, 0xffe0b0, 0.5, 10, cx, H - 0.7, cz);
  };

  R.archive = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (let i = 0; i < 4; i++) {
      const oz = -3 + i * 2;
      ctx.addBox(m.metal, 5.2, 2.2, 0.5, cx, 1.1, cz + oz, 0, true, cell);
      ctx.addBox(m.wood, 5.0, 0.12, 0.45, cx, 1.6, cz + oz, 0, false, cell);
      ctx.addBox(m.wood, 5.0, 0.12, 0.45, cx, 2.0, cz + oz, 0, false, cell);
      for (let b = 0; b < 6; b++)
        if (Math.random() < 0.7) ctx.addBox(m.navy, 0.35, 0.28, 0.3, cx - 2.3 + b * 0.9, 0.45 + (Math.random() < 0.5 ? 0 : 1.6), cz + oz, 0, false, cell);
    }
    ctx.addPickup('keycard1', cx - 2.2, 2.15, cz - 3);
    ctx.addPickup('gasmask', cx + 2.2, 2.15, cz - 3);
    ctx.addPickup('snav', cx - 2.2, 2.55, cz - 1);
    ctx.addPickup('battery', cx + 2.2, 2.55, cz - 1);
    ctx.addPickup('doc173', cx - 2.2, 2.15, cz + 1);
    ctx.addPickup('dsc', cx + 2.2, 2.15, cz + 1);
    ctx.addPickup('firstaid', cx - 2.2, 0.45, cz + 3);
    ctx.addPickup('dori', cx + 2.2, 0.45, cz + 3);
    ctx.addDecal(ctx.T.blood, cx + 1.4, cz + 3.2, 1.6);
    sgn(ctx, '档案室', 'ARCHIVE', { border: '#7fbf6a' }, cx, 3.2, cz - 4 + 0.28, 0, 2.0, 0.5);
  };

  R.surveillance = function (cell, cx, cz, ctx) {
    const m = ctx.mats, T = ctx.T;
    ctx.addBox(m.metal, 4.6, 1.0, 1.0, cx, 0.5, cz - 2.6, 0, true, cell);
    for (let i = 0; i < 4; i++) {
      screen(ctx, cx - 1.6 + i * 1.1, 1.9, cz - 2.95, 0, 0.95, 0.7);
      ctx.addBox(m.dark, 0.9, 0.7, 0.12, cx - 1.6 + i * 1.1, 1.9, cz - 3.0, 0, false, cell);
    }
    ctx.addBox(m.white, 1.0, 0.5, 1.0, cx - 2.2, 0.25, cz - 1.6, 0, true, cell);
    ctx.addPickup('dmtf', cx - 2.6, 1.0, cz - 2.6);
    ctx.addPickup('battery', cx + 2.6, 1.0, cz - 2.6);
    ctx.addBox(m.dark, 1.6, 1.4, 0.5, cx + 2.8, 1.9, cz + 3.0, 0, true, cell);
    it(ctx, cx + 2.8, cz + 3.0, 1.9, 2.0,
      function () { return ctx.game.power ? '[E] 监控终端（区域供电正常）' : '[E] 监控终端（无供电）'; },
      function () { ctx.game.useSurveillance(); });
    lit(ctx, 0x8ab0d0, 0.7, 10, cx, H - 0.7, cz - 2);
    sgn(ctx, '监控室', 'SURVEILLANCE', { border: '#7fbf6a' }, cx, 3.2, cz - 4 + 0.28, 0, 2.0, 0.5);
  };

  R.testroom = function (cell, cx, cz, ctx) {
    const m = ctx.mats, T = ctx.T;
    ctx.addBox(m.metal, 0.3, 2.6, 5.0, cx + 2.0, 1.3, cz, 0, true, cell);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 1.3),
      new THREE.MeshLambertMaterial({ color: 0x9fc4d8, transparent: true, opacity: 0.28 }));
    glass.position.set(cx + 2.0, 2.0, cz);
    glass.rotation.y = Math.PI / 2;
    ctx.scene.add(glass);
    ctx.addBox(m.dark, 2.4, 0.9, 1.0, cx - 2.4, 0.45, cz - 2.6, 0, true, cell);
    ctx.addBox(m.dark, 1.2, 0.9, 0.6, cx - 0.4, 0.45, cz - 2.6, 0, true, cell);
    ctx.addBox(m.metal, 0.4, 2.4, 0.4, cx - 3.4, 1.2, cz + 2.4, 0, true, cell);
    ctx.addPickup('keycard2', cx - 2.4, 1.15, cz - 2.6);
    ctx.addPickup('syringe', cx - 0.4, 1.15, cz - 2.6);
    ctx.addPickup('drand2', cx - 0.4, 0.55, cz + 3.0);
    ctx.addDecal(ctx.T.blood, cx + 1.0, cz + 2.0, 2.2);
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'testroom173', cell: cell, cx: cx, cz: cz, done: false });
    sgn(ctx, '测试室 02', 'TESTING ROOM — 观察窗', { border: '#c9a13b' }, cx - 3.0, 3.2, cz - 4 + 0.28, 0, 2.4, 0.55);
  };

  R.room012 = function (cell, cx, cz, ctx) {
    const m = ctx.mats, T = ctx.T;
    ctx.addBox(m.dark, 2.0, 0.9, 1.2, cx, 0.45, cz - 2.4, 0, true, cell);
    ctx.addBox(m.white, 1.2, 0.06, 0.9, cx, 0.93, cz - 2.4, 0.1, false, cell);
    for (let i = 0; i < 6; i++) {
      ctx.addBox(m.white, 0.02, 0.5, 0.8, cx - 2.4 + i * 0.9, 1.35, cz - 2.4, 0, false, cell);
    }
    ctx.addDecal(ctx.T.blood, cx, cz + 1.0, 3.2);
    ctx.addDecal(ctx.T.blood, cx - 2.0, cz + 2.2, 2.0);
    ctx.addPickup('d012', cx + 2.6, 0.5, cz + 2.6);
    lit(ctx, 0xff6060, 0.6, 9, cx, H - 0.6, cz - 2);
    ctx.W.spawn.hazard012 = { x: cx, z: cz };
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'compulsion012', cx: cx, cz: cz, done: false });
    sgn(ctx, 'SCP-012', '未完成的乐谱 · EUCLID', { border: '#c33', fg2: '#c33' }, cx, 3.2, cz - 4 + 0.28, 0, 2.4, 0.6);
  };

  R.room205 = function (cell, cx, cz, ctx) {
    const m = ctx.mats, T = ctx.T;
    for (const ox of [-2.2, 2.2]) {
      ctx.addBox(m.dark, 0.5, 0.5, 0.5, cx + ox, 0.25, cz, 0, true, cell);
      ctx.addBox(m.metal, 0.15, 2.4, 0.15, cx + ox, 1.2, cz, 0, false, cell);
      const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.6, 12),
        new THREE.MeshBasicMaterial({ color: 0xfff0c0 }));
      lamp.position.set(cx + ox, 2.4, cz);
      ctx.scene.add(lamp);
      ctx.addBox(m.white, 0.7, 1.2, 0.1, cx + ox, 1.6, cz + 0.6, 0, false, cell);
    }
    ctx.corpse(cx + 1.0, cz + 2.6, m.navy, 1.4);
    ctx.addPickup('eyedrops', cx, 0.5, cz + 3.0);
    ctx.addPickup('d012', cx - 1.0, 0.5, cz + 3.0);
    lit(ctx, 0xffeecc, 0.8, 9, cx, 2.6, cz);
    ctx.W.spawn.hazard205 = { x: cx, z: cz };
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'lamps205', cx: cx, cz: cz, done: false });
    sgn(ctx, 'SCP-205', '影灯 · EUCLID', { border: '#c9a13b' }, cx, 3.2, cz - 4 + 0.28, 0, 2.2, 0.55);
  };

  R.roompj = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 2.6, 0.4, 2.6, cx, 3.6, cz - 1.6, 0, false, cell);
    ctx.addBox(m.metal, 3.4, 0.2, 3.4, cx, 0.1, cz - 1.6, 0, false, cell);
    for (const o of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 0.2], [1.6, 0.2]]) {
      ctx.addBox(m.metal, 0.2, 3.6, 0.2, cx + o[0], 1.8, cz + o[1], 0, true, cell);
    }
    ctx.addBox(m.dark, 1.0, 1.0, 1.0, cx, 0.6, cz - 1.6, 0.4, true, cell);
    ctx.addPickup('dstrange', cx + 2.8, 0.5, cz + 2.8);
    ctx.addPickup('eyedrops', cx - 2.8, 0.5, cz + 2.8);
    ctx.W.spawn.p372 = { x: cx, z: cz };
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'pj372', cx: cx, cz: cz, done: false });
    sgn(ctx, 'SCP-372', '周边跳跃者 · SAFE', { border: '#7fbf6a' }, cx, 3.2, cz - 4 + 0.28, 0, 2.4, 0.6);
  };

  R.room1123 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 1.4, 1.1, 1.4, cx, 0.55, cz - 1.2, 0.5, true, cell);
    ctx.addBox(m.white, 1.0, 0.08, 1.0, cx, 1.12, cz - 1.2, 0.5, false, cell);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10),
      new THREE.MeshLambertMaterial({ map: ctx.T.skin096 }));
    skull.position.set(cx, 1.42, cz - 1.2);
    skull.scale.set(1, 1.1, 1.2);
    ctx.scene.add(skull);
    ctx.addBox(m.dark, 0.7, 1.6, 0.6, cx + 2.8, 0.8, cz + 2.8, 0, true, cell);
    ctx.addPickup('d1123', cx + 2.8, 1.7, cz + 2.8);
    ctx.addPickup('firstaid', cx - 2.8, 0.5, cz + 2.8);
    lit(ctx, 0xd0d8ff, 0.6, 9, cx, H - 0.7, cz);
    ctx.W.spawn.hazard1123 = { x: cx, z: cz - 1.2 };
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'skull1123', cx: cx, cz: cz - 1.2, done: false });
    sgn(ctx, 'SCP-1123', '暴行头骨 · SAFE', { border: '#c9a13b' }, cx, 3.2, cz - 4 + 0.28, 0, 2.4, 0.6);
  };

  R.room1162 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.dark, 3.6, 2.6, 0.5, cx, 1.3, cz - 3.2, 0, true, cell);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.42, 16),
      new THREE.MeshBasicMaterial({ color: 0x050505 }));
    hole.position.set(cx, 1.5, cz - 3.2 + 0.27);
    ctx.scene.add(hole);
    ctx.addBox(m.metal, 1.0, 0.8, 1.0, cx, 0.4, cz + 2.6, 0, true, cell);
    ctx.addPickup('d1162', cx, 1.0, cz + 2.6);
    lit(ctx, 0xd8d0b0, 0.55, 9, cx, H - 0.7, cz);
    it(ctx, cx, cz - 3.0, 1.5, 1.8,
      function () { return '[E] 把手伸进洞里'; },
      function () { ctx.game.hole1162(); });
  };

  R.roomscps2 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (const ox of [-2.6, 2.6]) {
      ctx.addBox(m.dark, 2.0, 1.6, 2.0, cx + ox, 0.8, cz - 2.2, 0, true, cell);
      ctx.addBox(m.white, 1.6, 0.1, 1.6, cx + ox, 1.65, cz - 2.2, 0, false, cell);
      ctx.addBox(m.metal, 2.0, 1.2, 0.2, cx + ox, 2.2, cz - 3.1, 0, false, cell);
    }
    ctx.addPickup('mask1499', cx - 2.6, 1.9, cz - 2.2);
    ctx.addPickup('scp500', cx + 2.6, 1.9, cz - 2.2);
    ctx.addPickup('d1499', cx - 2.6, 0.5, cz + 2.6);
    ctx.addPickup('d500', cx + 2.6, 0.5, cz + 2.6);
    lit(ctx, 0xbcd8e8, 0.6, 10, cx, H - 0.7, cz);
    sgn(ctx, 'SCP-500 / SCP-1499', '收容间 — SAFE', { border: '#7fbf6a' }, cx, 3.2, cz - 4 + 0.28, 0, 3.2, 0.6);
  };

  R.storage939 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 5.0, 0.2, 5.0, cx, 2.8, cz, 0, false, cell);
    for (let i = 0; i < 6; i++) {
      const ox = -2.6 + (i % 3) * 2.6, oz = -2.6 + Math.floor(i / 3) * 5.2;
      ctx.addBox(m.dark, 1.6, 2.2, 1.0, cx + ox, 1.1, cz + oz, 0, true, cell);
      ctx.addBox(m.copper, 1.4, 0.1, 0.8, cx + ox, 2.25, cz + oz, 0, false, cell);
    }
    for (let i = 0; i < 5; i++) {
      const px = cx + ctx.rng.range(-3, 3), pz = cz + ctx.rng.range(-3, 3);
      const meat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.5),
        new THREE.MeshLambertMaterial({ color: 0x7a1a18 }));
      meat.position.set(px, 2.2, pz);
      ctx.scene.add(meat);
    }
    ctx.addDecal(ctx.T.blood, cx + 1.5, cz + 1.5, 3.0);
    ctx.addDecal(ctx.T.blood, cx - 2.0, cz - 1.0, 2.4);
    ctx.addPickup('d939', cx - 2.6, 1.0, cz - 2.6);
    ctx.addPickup('firstaid', cx + 2.6, 1.0, cz + 2.6);
    lit(ctx, 0xff8080, 0.5, 10, cx, H - 0.8, cz);
    ctx.addDecal(ctx.T.blood, cx, cz, 2.0);
    ctx.W.spawn.p939 = [
      { x: cx - 2.0, z: cz + 2.0 }, { x: cx + 2.4, z: cz - 2.4 }, { x: cx + 0.4, z: cz + 3.2 }
    ];
    sgn(ctx, 'SCP-939', '多声之物 · EUCLID — 保持安静', { border: '#c33', fg2: '#c33' }, cx, 3.2, cz - 4 + 0.28, 0, 3.4, 0.62);
  };

  R.recursive = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (let i = 0; i < 4; i++) {
      ctx.addBox(m.dark, 0.3, H, 0.3, cx - 3.0 + i * 2.0, H / 2, cz - 3.0, 0, false, cell);
      ctx.addBox(m.dark, 0.3, H, 0.3, cx - 3.0 + i * 2.0, H / 2, cz + 3.0, 0, false, cell);
    }
    ctx.addBox(m.dark, 0.6, 1.0, 0.6, cx + 2.6, 0.5, cz + 2.6, 0, true, cell);
    ctx.addPickup('d970', cx + 2.6, 1.15, cz + 2.6);
    ctx.addPickup('dsn', cx - 2.6, 0.5, cz - 2.6);
    lit(ctx, 0x9aa0b0, 0.35, 8, cx, H - 0.8, cz);
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'recursive', cell: cell, cx: cx, cz: cz, done: false, loops: 0 });
    sgn(ctx, '走廊 970', '循环空间现象', { border: '#7f8a95' }, cx, 3.2, cz - 4 + 0.28, 0, 2.4, 0.55);
  };

  R.closets = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (let i = 0; i < 3; i++)
      ctx.addBox(m.metal, 0.4, 2.6, 2.4, cx - 2.8 + i * 2.8, 1.3, cz - 3.0, 0, true, cell);
    ctx.addBox(m.metal, 1.2, 0.7, 1.2, cx - 1.6, 0.35, cz + 2.6, 0, true, cell);
    ctx.addBox(m.metal, 1.2, 0.7, 1.2, cx + 1.6, 0.35, cz + 2.6, 0, true, cell);
    ctx.corpse(cx - 0.8, cz + 0.6, m.orange, 1.1);
    ctx.corpse(cx + 1.4, cz - 1.2, m.white, 3.6);
    ctx.addPickup('gasmask', cx + 1.6, 1.0, cz + 2.6);
    ctx.addPickup('battery', cx - 1.6, 1.0, cz + 2.6);
    ctx.addPickup('battery', cx + 2.4, 0.5, cz + 0.4);
    ctx.addPickup('dl1', cx - 2.4, 0.5, cz + 0.4);
    ctx.W.spawn.hazard173closet = { x: cx, z: cz };
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'closet173', cx: cx, cz: cz, done: false });
    sgn(ctx, '储藏走廊', 'STORAGE HALL', { border: '#c9a13b' }, cx, 3.15, cz - 4 + 0.28, 0, 2.4, 0.55);
  };

  /* ==================================================================== HCZ */

  R.room055 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 3.6, 0.3, 3.6, cx, 0.15, cz - 1.2, 0, false, cell);
    ctx.addBox(m.white, 1.0, 0.9, 1.0, cx, 0.55, cz - 1.2, 0.3, true, cell);
    ctx.addBox(m.white, 0.6, 0.1, 0.6, cx, 1.05, cz - 1.2, 0.3, false, cell);
    for (let i = 0; i < 4; i++)
      ctx.addBox(m.dark, 0.3, H, 0.3, cx - 3.2 + (i % 2) * 6.4, H / 2, cz - 3.2 + Math.floor(i / 2) * 6.4, 0, true, cell);
    ctx.addPickup('dstrange', cx + 2.8, 0.5, cz + 2.8);
    ctx.addPickup('eyedrops', cx - 2.8, 0.5, cz + 2.8);
    ctx.addLight(0xc8d0d8, 0.5, 10, cx, H - 0.7, cz);
    ctx.W.interact.push({
      x: cx, z: cz - 1.2, y: 1.1, r: 1.8,
      hint: function () { return '[E] 检查展台'; },
      action: function () {
        ctx.game.achv('a055');
        ctx.game.msg('展台上什么都没有。', '#7f8a95');
        ctx.game.subtitle('你确信这个房间里曾经收容过什么东西——但你想不起来是什么，也想不起来为什么想不起来。');
      }
    });
    ctx.addSign(S.makeSignTex('SCP-055', '「反模因」— 收容状态：不清楚', { border: '#7f8a95' }),
      cx, 3.2, cz - 4 + 0.28, 0, 3.0, 0.6);
  };

  R.room008 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.dark, 2.6, 2.4, 2.6, cx, 1.2, cz - 2.0, 0.6, true, cell);
    for (let i = 0; i < 3; i++)
      ctx.addBox(m.white, 0.2, 2.0, 0.2, cx - 1.0 + i, 1.0, cz - 2.0 + (i % 2) * 1.2, 0, false, cell);
    ctx.addBox(m.metal, 2.0, 1.8, 0.6, cx + 2.8, 0.9, cz + 2.6, 0, true, cell);
    ctx.addPickup('hazmat', cx + 2.8, 2.0, cz + 2.6);
    ctx.addPickup('d008', cx - 2.8, 0.5, cz + 2.6);
    ctx.addPickup('syringe', cx - 2.8, 0.5, cz + 1.4);
    ctx.addDecal(ctx.T.blood, cx + 1.0, cz + 0.5, 2.6);
    ctx.addDecal(ctx.T.corrosion, cx - 1.4, cz + 2.0, 2.0);
    lit(ctx, 0x9adf80, 0.6, 10, cx, H - 0.8, cz);
    ctx.W.gasCells.add(S.key(cell.c, cell.r));
    ctx.W.bioCells = ctx.W.bioCells || new Set();
    ctx.W.bioCells.add(S.key(cell.c, cell.r));
    ctx.W.spawn.zombies = [{ x: cx + 2.0, z: cz + 2.0, home: { x: cx + 2.0, z: cz + 2.0 } }];
    sgn(ctx, 'SCP-008', '僵尸瘟疫 · 生化危害', { border: '#c33', fg2: '#c33' }, cx, 3.2, cz - 4 + 0.28, 0, 3.0, 0.62);
  };

  R.room035 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.dark, 2.0, 1.4, 2.0, cx, 0.7, cz - 2.2, 0, true, cell);
    const mask = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 12),
      new THREE.MeshLambertMaterial({ color: 0xe8e4d8 }));
    mask.position.set(cx, 1.7, cz - 2.2);
    mask.scale.set(1, 1.2, 0.6);
    ctx.scene.add(mask);
    ctx.addBox(m.white, 0.9, 0.1, 0.9, cx, 1.42, cz - 2.2, 0, false, cell);
    ctx.addPickup('d035', cx - 2.8, 0.5, cz + 2.8);
    ctx.addPickup('d035a', cx + 2.8, 0.5, cz + 2.8);
    ctx.addPickup('vest', cx + 2.8, 0.5, cz - 0.2);
    ctx.addDecal(ctx.T.blood, cx + 1.0, cz + 1.6, 2.4);
    lit(ctx, 0xffd0d0, 0.5, 9, cx, H - 0.7, cz);
    ctx.W.spawn.possessed = { x: cx + 1.6, z: cz + 2.4 };
    ctx.W.spawn.hazard035 = { x: cx, z: cz - 2.2 };
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'mask035', cx: cx, cz: cz - 2.2, done: false });
    sgn(ctx, 'SCP-035', '占有面具 · KETER', { border: '#c33', fg2: '#c33' }, cx, 3.2, cz - 4 + 0.28, 0, 2.6, 0.6);
  };

  R.room049 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 3.4, 0.9, 2.0, cx, 0.45, cz - 1.6, 0, true, cell);
    ctx.addBox(m.white, 2.0, 0.08, 1.0, cx, 0.95, cz - 1.6, 0, false, cell);
    ctx.addBox(m.dark, 0.6, 2.4, 0.6, cx - 2.4, 1.2, cz - 2.8, 0, true, cell);
    ctx.addBox(m.dark, 0.6, 2.4, 0.6, cx + 2.4, 1.2, cz - 2.8, 0, true, cell);
    ctx.addBox(m.dark, 5.4, 0.4, 0.6, cx, 3.6, cz - 2.8, 0, false, cell);
    ctx.addPickup('d049', cx + 2.8, 0.5, cz + 2.8);
    ctx.addPickup('syringe', cx - 2.8, 0.5, cz + 2.8);
    ctx.addPickup('firstaid', cx - 2.8, 0.5, cz + 1.4);
    ctx.addDecal(ctx.T.blood, cx - 1.2, cz + 1.0, 2.8);
    lit(ctx, 0xd8d0c0, 0.55, 10, cx, H - 0.7, cz);
    ctx.W.spawn.p049 = { x: cx, z: cz + 2.4 };
    sgn(ctx, 'SCP-049', '瘟疫医生 · EUCLID', { border: '#c9a13b' }, cx, 3.2, cz - 4 + 0.28, 0, 2.6, 0.6);
  };

  R.room513 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.wood, 1.4, 1.0, 1.4, cx, 0.5, cz - 2.0, 0.3, true, cell);
    ctx.addBox(m.copper, 0.5, 0.5, 0.5, cx, 1.25, cz - 2.0, 0.3, false, cell);
    ctx.addBox(m.metal, 0.15, 2.4, 0.15, cx - 1.6, 1.2, cz + 2.8, 0, false, cell);
    ctx.addBox(m.metal, 0.15, 2.4, 0.15, cx + 1.6, 1.2, cz + 2.8, 0, false, cell);
    ctx.addBox(m.dark, 3.4, 0.3, 1.0, cx, 2.4, cz + 2.8, 0, true, cell);
    ctx.addPickup('scp513', cx, 1.75, cz - 2.0);
    ctx.addPickup('d513', cx - 2.6, 0.5, cz + 2.8);
    ctx.addPickup('vest', cx + 2.6, 0.5, cz + 2.8);
    lit(ctx, 0xc8c0a0, 0.5, 9, cx, H - 0.7, cz);
    sgn(ctx, 'SCP-513', '陈旧牛铃 · EUCLID', { border: '#c9a13b' }, cx, 3.2, cz - 4 + 0.28, 0, 2.6, 0.6);
  };

  R.coffin = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 4.4, 0.4, 3.4, cx, 0.2, cz - 1.4, 0, true, cell);
    const cf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 2.2),
      new THREE.MeshLambertMaterial({ map: ctx.T.coffin }));
    cf.position.set(cx, 0.75, cz - 1.4);
    ctx.scene.add(cf);
    ctx.addBox(m.dark, 1.6, 1.6, 0.3, cx + 3.0, 1.6, cz + 2.8, 0, true, cell);
    screen(ctx, cx + 3.0, 1.7, cz + 2.63, Math.PI, 1.3, 1.0);
    ctx.addPickup('d895', cx - 3.0, 0.5, cz + 2.8);
    ctx.addPickup('eyedrops', cx - 3.0, 0.5, cz + 1.4);
    lit(ctx, 0xb0c0d8, 0.45, 9, cx, H - 0.8, cz);
    it(ctx, cx + 2.6, cz + 2.8, 1.7, 2.0,
      function () { return '[E] 查看监控画面'; },
      function () { ctx.game.watchCoffinFeed(); });
    sgn(ctx, 'SCP-895', '陈旧棺材 · EUCLID', { border: '#c9a13b' }, cx, 3.2, cz - 4 + 0.28, 0, 2.6, 0.6);
  };

  R.room966 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 4.6, 0.3, 4.6, cx, 0.15, cz, 0, false, cell);
    for (let i = 0; i < 4; i++) {
      const ox = -2.4 + (i % 2) * 4.8, oz = -2.4 + Math.floor(i / 2) * 4.8;
      ctx.addBox(m.white, 1.6, 0.5, 0.9, cx + ox, 0.35, cz + oz, i * 1.5, true, cell);
      ctx.addBox(m.metal, 0.2, 2.6, 0.2, cx + ox + 1.0, 1.3, cz + oz, 0, true, cell);
    }
    ctx.addPickup('d966', cx + 2.8, 0.5, cz + 2.8);
    ctx.addPickup('nvg', cx - 2.8, 0.5, cz + 2.8);
    ctx.addPickup('syringe', cx - 2.8, 0.5, cz - 2.8);
    ctx.addDecal(ctx.T.blood, cx + 0.6, cz + 0.6, 2.2);
    lit(ctx, 0x8090a8, 0.4, 9, cx, H - 0.8, cz);
    ctx.W.spawn.p966 = [
      { x: cx - 2.0, z: cz - 2.0 }, { x: cx + 2.0, z: cz + 2.0 }
    ];
    sgn(ctx, 'SCP-966', '睡眠杀手 · 需夜视设备', { border: '#c33', fg2: '#c33' }, cx, 3.2, cz - 4 + 0.28, 0, 3.2, 0.62);
  };

  R.testroom682 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 7.0, 0.4, 7.0, cx, 0.2, cz, 0, false, cell);
    for (let i = 0; i < 4; i++) {
      ctx.addBox(m.dark, 0.5, 4.4, 0.5, cx - 3.2 + (i % 2) * 6.4, 2.2, cz - 3.2 + Math.floor(i / 2) * 6.4, 0, true, cell);
    }
    ctx.addBox(m.metal, 5.0, 0.3, 1.2, cx, 3.4, cz - 1.0, 0, false, cell);
    ctx.addBox(m.orange, 1.4, 2.4, 1.4, cx - 3.0, 1.2, cz + 3.0, 0.4, true, cell);
    ctx.addDecal(ctx.T.blood, cx + 1.6, cz + 1.6, 3.6);
    ctx.addDecal(ctx.T.blood, cx - 1.0, cz + 2.6, 2.6);
    ctx.addPickup('d682', cx - 3.0, 2.6, cz + 3.0);
    ctx.addPickup('heavyvest', cx + 3.4, 0.5, cz + 3.4);
    ctx.addPickup('battery18', cx + 3.4, 0.5, cz + 2.0);
    lit(ctx, 0xffe0a0, 0.6, 12, cx, H - 0.7, cz);
    ctx.W.spawn.hazard173test = { x: cx + 2.0, z: cz - 2.0 };
    sgn(ctx, '测试大厅 01', 'TESTING HALL — SCP-682 相关', { border: '#c33', fg2: '#c33' }, cx, 3.3, cz - 4 + 0.28, 0, 3.6, 0.62);
  };

  R.nuke = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.dark, 6.0, 0.3, 6.0, cx, 0.15, cz, 0, false, cell);
    for (const oz of [-2.0, 2.0]) {
      ctx.addBox(m.dark, 2.2, 2.6, 2.2, cx - 2.4, 1.3, cz + oz, 0, true, cell);
      ctx.addBox(m.dark, 2.2, 2.6, 2.2, cx + 2.4, 1.3, cz + oz, 0, true, cell);
      const term = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6),
        new THREE.MeshBasicMaterial({ map: ctx.T.warhead }));
      term.position.set(cx - 2.4, 1.1, cz + oz - 1.11);
      term.rotation.y = Math.PI;
      ctx.scene.add(term);
      const term2 = term.clone(); term2.position.x = cx + 2.4; ctx.scene.add(term2);
      ctx.addBox(m.orange, 1.0, 0.2, 1.0, cx - 2.4, 2.7, cz + oz, 0, false, cell);
      ctx.addBox(m.orange, 1.0, 0.2, 1.0, cx + 2.4, 2.7, cz + oz, 0, false, cell);
    }
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.7),
      new THREE.MeshLambertMaterial({ map: ctx.T.powerbox }));
    box.position.set(cx, 1.0, cz + 3.4);
    ctx.scene.add(box);
    ctx.addPickup('dndp', cx, 0.5, cz - 3.2);
    ctx.addPickup('keycard5', cx, 0.5, cz + 3.0);
    lit(ctx, 0xff9060, 0.5, 10, cx, H - 0.6, cz);
    it(ctx, cx - 1.0, cz + 3.2, 1.3, 2.0,
      function () { return ctx.game.warheadsOn ? '[E] 拉下闸门：关闭阿尔法核弹头' : '阿尔法核弹头已关闭'; },
      function () { ctx.game.toggleWarheads(); });
    it(ctx, cx + 1.0, cz + 3.2, 1.3, 2.0,
      function () { return ctx.game.remoteDet ? '[E] 取消远程引爆' : '[E] 启动远程引爆'; },
      function () { ctx.game.toggleRemoteDet(); });
    sgn(ctx, '核弹头井', 'WARHEAD SILO — 5 级权限', { border: '#c33', fg2: '#c33' }, cx, 3.3, cz - 4 + 0.28, 0, 3.0, 0.62);
  };

  R.pipes = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (let i = 0; i < 5; i++) {
      ctx.addBox(m.copper, 0.3, 0.3, 7.4, cx - 2.8 + i * 1.4, 3.4, cz, 0, false, cell);
      ctx.addBox(m.copper, 0.3, 0.3, 7.4, cx - 2.8 + i * 1.4, 0.35, cz, 0, false, cell);
    }
    ctx.addDecal(ctx.T.corrosion, cx + 1.0, cz - 1.0, 2.8);
    ctx.addDecal(ctx.T.corrosion, cx - 1.6, cz + 1.6, 2.0);
    ctx.addPickup('d106ir', cx - 2.6, 0.5, cz - 2.6);
    ctx.addPickup('battery', cx + 2.6, 0.5, cz + 2.6);
    lit(ctx, 0xa0b0c0, 0.35, 8, cx, H - 0.8, cz);
    ctx.W.spawn.pipes106 = { x: cx + 2.0, z: cz - 1.0 };
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'pipes106', cx: cx, cz: cz, done: false });
    sgn(ctx, '管道走廊', 'PIPE CORRIDOR — 注意腐蚀痕迹', { border: '#c9a13b' }, cx, 3.2, cz - 4 + 0.28, 0, 3.2, 0.6);
  };

  R.tunnelgate = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 6.0, 3.0, 0.5, cx, 1.5, cz - 3.4, 0, true, cell);
    for (let i = 0; i < 6; i++)
      ctx.addBox(m.dark, 0.5, 3.0, 0.3, cx - 2.5 + i * 1.0, 1.5, cz - 3.1, 0, false, cell);
    ctx.addBox(m.metal, 0.6, 2.0, 0.6, cx - 2.8, 1.0, cz - 2.4, 0, true, cell);
    ctx.addBox(m.metal, 0.6, 2.0, 0.6, cx + 2.8, 1.0, cz - 2.4, 0, true, cell);
    ctx.addBox(m.copper, 2.2, 2.2, 1.2, cx + 2.8, 1.1, cz + 2.6, 0, true, cell);
    ctx.addPickup('dl2', cx - 2.8, 0.5, cz + 2.6);
    ctx.addPickup('firstaid', cx - 2.0, 0.5, cz + 0.4);
    lit(ctx, 0xffb060, 0.5, 10, cx, H - 0.7, cz);
    it(ctx, cx - 2.4, cz - 2.6, 1.2, 1.8,
      function () { return ctx.game.tunnelCode ? '[E] 输入维护通道密码' : '[E] 输入密码（需要密码）'; },
      function () { ctx.game.useTunnelKeypad(); });
    it(ctx, cx + 2.6, cz + 2.6, 1.2, 2.0,
      function () { return ctx.game.tunnelCode ? (ctx.game.power ? '[E] 维护电梯 → 入口区' : '电梯未通电') : '需要密码'; },
      function () { ctx.game.useTunnelElevator(); });
    sgn(ctx, '维护通道', 'MAINTENANCE TUNNEL — 需要密码', { border: '#c9a13b' }, cx, 3.2, cz - 4 + 0.28, 0, 3.0, 0.6);
  };

  /* ==================================================================== EZ */

  R.room079 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (let i = 0; i < 4; i++)
      ctx.addBox(m.server, 1.2, 2.4, 0.9, cx - 2.6 + i * 1.7, 1.2, cz - 3.0, 0, true, cell);
    ctx.addBox(m.dark, 2.2, 1.4, 1.2, cx, 0.7, cz + 1.6, 0, true, cell);
    const scr = screen(ctx, cx, 1.55, cz + 1.0, 0, 1.8, 1.1,
      S.makeSignTex('SCP-079', 'OLD AI', { border: '#7fbf6a', fg2: '#7fbf6a' }));
    scr.material = new THREE.MeshBasicMaterial({ color: 0x9fe0b2 });
    ctx.addPickup('d079', cx - 2.6, 0.5, cz + 2.8);
    ctx.addPickup('battery18', cx + 2.6, 0.5, cz + 2.8);
    lit(ctx, 0x80ffa0, 0.5, 10, cx, H - 0.7, cz);
    it(ctx, cx, cz + 1.0, 1.5, 2.2,
      function () { return '[E] 操作终端 — 与 SCP-079 对话'; },
      function () { ctx.game.talk079(); });
    sgn(ctx, 'SCP-079', '老旧人工智能 · EUCLID', { border: '#7fbf6a' }, cx, 3.2, cz - 4 + 0.28, 0, 2.6, 0.6);
  };

  R.cafeteria = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (let i = 0; i < 3; i++) {
      ctx.addBox(m.wood, 2.4, 0.1, 1.0, cx - 2.4 + i * 2.4, 0.8, cz + 1.4, 0, true, cell);
      ctx.addBox(m.metal, 0.12, 0.8, 0.9, cx - 3.2 + i * 2.4, 0.4, cz + 1.4, 0, false, cell);
      ctx.addBox(m.metal, 0.12, 0.8, 0.9, cx - 1.6 + i * 2.4, 0.4, cz + 1.4, 0, false, cell);
    }
    ctx.addBox(m.dark, 2.0, 2.6, 1.0, cx + 2.8, 1.3, cz - 3.0, 0, true, cell);
    const vm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.8),
      new THREE.MeshLambertMaterial({ map: ctx.T.vending294 }));
    vm.position.set(cx - 2.6, 1.2, cz - 3.0);
    ctx.scene.add(vm);
    ctx.addPickup('cup', cx - 2.6, 0.5, cz - 1.6);
    ctx.addPickup('doc_ez', cx + 1.0, 1.0, cz + 1.4);
    ctx.addPickup('drand1', cx - 1.0, 1.0, cz + 1.4);
    lit(ctx, 0xffe8c0, 0.7, 11, cx, H - 0.6, cz);
    it(ctx, cx - 2.6, cz - 3.0, 1.4, 2.2,
      function () { return '[E] 使用 SCP-294（输入饮料名称）'; },
      function () { ctx.game.open294(); });
    sgn(ctx, '员工餐厅', 'CAFETERIA — SCP-294', { border: '#7fbf6a' }, cx, 3.2, cz - 4 + 0.28, 0, 3.0, 0.6);
  };

  R.eleccenter = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.dark, 5.6, 2.8, 0.6, cx, 1.4, cz - 3.2, 0, true, cell);
    for (let i = 0; i < 4; i++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5),
        new THREE.MeshLambertMaterial({ map: ctx.T.powerbox }));
      box.position.set(cx - 2.1 + i * 1.4, 1.6, cz - 3.2 + 0.45);
      ctx.scene.add(box);
      ctx.addBox(m.metal, 0.12, 0.7, 0.12, cx - 2.1 + i * 1.4, 1.1, cz - 3.2 + 0.7, 0, false, cell);
    }
    ctx.addBox(m.server, 1.4, 2.2, 0.8, cx + 3.0, 1.1, cz + 2.6, 0, true, cell);
    ctx.addPickup('battery18', cx + 3.0, 2.4, cz + 2.6);
    ctx.addPickup('dl2', cx - 3.2, 0.5, cz + 2.8);
    lit(ctx, 0xffd080, 0.6, 11, cx, H - 0.6, cz - 1);
    for (let i = 0; i < 4; i++) {
      (function (idx) {
        it(ctx, cx - 2.1 + idx * 1.4, cz - 2.4, 1.1, 1.5,
          function () { return ctx.game.elec.up[idx] ? '闸门已推上 (' + ctx.game.elec.count + '/4)' : '[E] 推上闸门 (' + ctx.game.elec.count + '/4)'; },
          function () { ctx.game.useElec(idx); });
      })(i);
    }
    sgn(ctx, '电子中心', 'ELECTRICAL CENTER — 4 个闸门', { border: '#c9a13b' }, cx, 3.3, cz - 4 + 0.28, 0, 3.2, 0.62);
  };

  R.gateaentrance = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 4.4, H, 0.5, cx, H / 2, cz - 3.2, 0, true, cell);
    sgn(ctx, 'A 大门', 'GATE A — 电梯', { border: '#7fbf6a' }, cx, 3.3, cz - 2.9, 0, 2.6, 0.62);
    ctx.addBox(m.metal, 0.5, H, 2.6, cx - 2.2, H / 2, cz - 1.9, 0, true, cell);
    ctx.addBox(m.metal, 0.5, H, 2.6, cx + 2.2, H / 2, cz - 1.9, 0, true, cell);
    ctx.addBox(m.dark, 1.4, 1.2, 0.6, cx + 3.0, 0.6, cz + 2.6, 0, true, cell);
    ctx.addPickup('dmtf', cx + 3.0, 1.35, cz + 2.6);
    ctx.addPickup('firstaid', cx - 3.0, 0.5, cz + 2.8);
    lit(ctx, 0xcfe8d0, 0.7, 11, cx, H - 0.6, cz - 1);
    it(ctx, cx, cz - 2.0, 1.4, 2.2,
      function () { return ctx.game.power ? '[E] 启动电梯 — A 大门地表' : '电梯未通电（需要电子中心）'; },
      function () { ctx.game.gateA(); });
  };

  R.offices = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (let i = 0; i < 3; i++) {
      const ox = -2.6 + i * 2.6;
      ctx.addBox(m.ezWall, 0.3, H, 3.0, cx + ox - 1.2, H / 2, cz - 1.6, 0, true, cell);
      ctx.addBox(m.wood, 1.4, 0.1, 0.8, cx + ox, 0.8, cz - 2.4, 0, true, cell);
      ctx.addBox(m.white, 0.6, 0.7, 0.5, cx + ox, 0.35, cz - 1.0, 0.4, true, cell);
      const nm = ['哈普 HARP', '梅纳德 MAYNARD', '吉尔斯 GEARS'][i];
      ctx.addSign(S.makeSignTex(nm, '办公室', { border: '#7fbf6a' }), cx + ox - 0.6, 2.4, cz - 3.02, 0, 1.2, 0.4);
    }
    ctx.addBox(m.server, 1.2, 2.0, 0.8, cx + 3.2, 1.0, cz + 3.0, 0, true, cell);
    ctx.addPickup('keycard4', cx - 2.6, 0.95, cz - 2.4);
    ctx.addPickup('dobj', cx, 0.95, cz - 2.4);
    ctx.addPickup('dsc', cx + 2.6, 0.95, cz - 2.4);
    ctx.addPickup('nvg', cx + 3.2, 2.2, cz + 3.0);
    lit(ctx, 0xfff0d0, 0.75, 12, cx, H - 0.6, cz);
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'offices', cx: cx, cz: cz, done: false });
    sgn(ctx, '行政区办公室', 'ADMINISTRATIVE OFFICES', { border: '#7fbf6a' }, cx, 3.3, cz - 4 + 0.28, 0, 3.2, 0.6);
  };

  R.sroom = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.wood, 2.4, 0.1, 1.2, cx + 1.0, 0.85, cz - 1.6, 0.3, true, cell);
    ctx.addBox(m.dark, 0.7, 1.2, 0.7, cx - 1.6, 0.6, cz - 2.2, 0.4, true, cell);
    ctx.addBox(m.server, 1.0, 1.6, 0.7, cx + 3.2, 0.8, cz + 2.8, 0, true, cell);
    ctx.addPickup('joint', cx + 1.0, 1.0, cz - 1.6);
    ctx.addPickup('joint', cx - 1.6, 1.3, cz - 2.2);
    ctx.addPickup('drand1', cx + 3.2, 1.8, cz + 2.8);
    ctx.addPickup('cigarette', cx - 2.8, 0.5, cz + 2.8);
    lit(ctx, 0xd8ffd0, 0.5, 9, cx, H - 0.8, cz);
    sgn(ctx, '办公区 420-J', 'STAFF OFFICE', { border: '#7fbf6a' }, cx, 3.2, cz - 4 + 0.28, 0, 2.6, 0.6);
  };

  R.toilets = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (let i = 0; i < 3; i++) {
      const ox = -2.6 + i * 2.6;
      ctx.addBox(m.white, 0.25, 2.4, 2.4, cx + ox - 1.1, 1.2, cz - 2.6, 0, true, cell);
      ctx.addBox(m.white, 0.8, 0.6, 1.0, cx + ox - 0.2, 0.3, cz - 2.8, 0, true, cell);
      ctx.addBox(m.white, 0.8, 1.0, 0.25, cx + ox - 0.2, 1.6, cz - 3.3, 0, false, cell);
    }
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.14, 12), m.white);
      b.position.set(cx - 2.6 + i * 2.6, 0.85, cz + 2.4);
      ctx.scene.add(b);
    }
    ctx.addPickup('card', cx - 2.6, 0.9, cz + 2.4);
    ctx.addPickup('dbn', cx + 1.4, 0.5, cz - 1.0);
    ctx.addDecal(ctx.T.blood, cx + 2.6, cz + 0.6, 1.8);
    ctx.corpse(cx + 2.8, cz - 0.4, m.navy, 2.0);
    lit(ctx, 0xe8f0e8, 0.5, 9, cx, H - 0.8, cz);
    ctx.W.spawn.hazard789 = { x: cx - 2.6, z: cz + 2.4 };
    ctx.W.events = ctx.W.events || [];
    ctx.W.events.push({ type: 'buttghost', cx: cx - 2.6, cz: cz + 2.4, done: false });
    sgn(ctx, '洗手间', 'RESTROOM — SCP-789-J', { border: '#7f8a95' }, cx, 3.2, cz - 4 + 0.28, 0, 2.6, 0.55);
  };

  R.offices2 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.wood, 2.8, 0.1, 1.4, cx, 0.85, cz - 1.4, 0, true, cell);
    ctx.addBox(m.metal, 0.15, 0.85, 1.3, cx - 1.2, 0.42, cz - 1.4, 0, false, cell);
    ctx.addBox(m.metal, 0.15, 0.85, 1.3, cx + 1.2, 0.42, cz - 1.4, 0, false, cell);
    ctx.addBox(m.dark, 0.6, 1.1, 0.6, cx + 2.4, 0.55, cz + 1.6, 0.6, true, cell);
    ctx.addBox(m.metal, 0.15, 1.0, 0.15, cx - 2.6, 1.0, cz + 2.8, 0, false, cell);
    ctx.addBox(m.metal, 0.15, 1.0, 0.15, cx - 1.6, 1.0, cz + 2.8, 0, false, cell);
    ctx.addBox(m.white, 1.0, 1.1, 1.0, cx - 2.1, 0.55, cz + 2.8, 0.4, true, cell);
    ctx.addPickup('ddan', cx, 1.1, cz - 1.4);
    ctx.addPickup('eyedrops', cx + 2.4, 1.2, cz + 1.6);
    ctx.addPickup('scrap', cx - 2.1, 1.3, cz + 2.8);
    lit(ctx, 0xfff0d8, 0.6, 10, cx, H - 0.7, cz);
    ctx.W.spawn.duck = { x: cx - 2.1, z: cz + 2.8 };
    sgn(ctx, '办公室 2 层', 'OFFICES — 2F', { border: '#7fbf6a' }, cx, 3.2, cz - 4 + 0.28, 0, 2.4, 0.55);
  };

  R.servers3 = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    for (let i = 0; i < 6; i++) {
      const ox = -2.8 + (i % 3) * 2.8, oz = -2.6 + Math.floor(i / 3) * 5.2;
      ctx.addBox(m.server, 1.0, 2.6, 1.0, cx + ox, 1.3, cz + oz, 0, true, cell);
    }
    ctx.addBox(m.metal, 0.4, 0.4, 7.0, cx, 2.9, cz, 0, false, cell);
    ctx.addBox(m.metal, 0.4, 0.4, 7.0, cx + 0.6, 3.2, cz, 0, false, cell);
    ctx.addPickup('electronics', cx - 2.8, 0.5, cz + 2.6);
    ctx.addPickup('hand', cx + 2.8, 0.5, cz - 2.6);
    ctx.addPickup('d106_2', cx, 0.5, cz + 3.2);
    lit(ctx, 0x88ffaa, 0.4, 9, cx, H - 0.8, cz);
    ctx.W.spawn.hazard173servers = { x: cx - 2.0, z: cz + 2.0 };
    sgn(ctx, '服务器机房 B', 'SERVER ROOM B', { border: '#7fbf6a' }, cx, 3.2, cz - 4 + 0.28, 0, 2.6, 0.55);
  };
})(window.SCP);
