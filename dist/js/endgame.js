/* endgame.js — 终局系统：电子中心 / 核弹头 / A 大门 / B 大门 / SCP-860 森林 / SCP-1499 异界
   以及追加物品的使用逻辑。 */
window.SCP = window.SCP || {};
(function (S) {
  const $ = function (id) { return document.getElementById(id); };
  const A = S.audio;
  const H = 4;
  const G = S.game;

  /* ======================================================= 额外区域（森林 / 异界 / A 大门） */
  S.buildExtraAreas = function (ctx) {
    const W = ctx.W, T = ctx.T, rng = ctx.rng, scene = ctx.scene;
    const colliders = {};
    W.extraColliders = colliders;

    function areaAcc(name) {
      colliders[name] = colliders[name] || [];
      return colliders[name];
    }
    function bx(name, mat, w, h, d, x, y, z, ry, solid) {
      const m = new THREE.Mesh(S.texturedBoxGeo(w, h, d, 3), mat);
      m.position.set(x, y, z);
      if (ry) m.rotation.y = ry;
      scene.add(m);
      if (solid) {
        const hw = ry ? d / 2 : w / 2, hd = ry ? w / 2 : d / 2;
        areaAcc(name).push(S.aabb(x, z, hw, hd, y - h / 2, y + h / 2));
      }
      return m;
    }
    function plane(mat, w, d, x, y, z, rx) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
      m.rotation.x = rx === undefined ? -Math.PI / 2 : rx;
      m.position.set(x, y, z);
      scene.add(m);
      return m;
    }
    function tree(name, x, z, h) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, h, 7),
        new THREE.MeshLambertMaterial({ map: T.bark }));
      trunk.position.set(x, h / 2, z);
      scene.add(trunk);
      for (let i = 0; i < 3; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5 - i * 0.35, 1.8, 8),
          new THREE.MeshLambertMaterial({ color: 0x121a14 }));
        cone.position.set(x, h - 0.6 + i * 0.5, z);
        scene.add(cone);
      }
      areaAcc(name).push(S.aabb(x, z, 0.34, 0.34, 0, h));
    }

    /* ---------- SCP-860-1 森林 ---------- */
    {
      const ox = 700, oz = -700, N = 'forest';
      plane(new THREE.MeshLambertMaterial({ map: T.forestGround }), 120, 120, ox, 0, oz);
      const wallMat = new THREE.MeshLambertMaterial({ color: 0x0a0c0a });
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        bx(N, wallMat, i % 2 ? 0.6 : 120, 14, i % 2 ? 120 : 0.6,
          ox + Math.cos(a) * 60, 7, oz + Math.sin(a) * 60, 0, true);
      }
      for (let i = 0; i < 70; i++) {
        const a = rng.range(0, 6.28), r = rng.range(9, 56);
        tree(N, ox + Math.cos(a) * r, oz + Math.sin(a) * r, rng.range(6, 11));
      }
      /* 出发点的门 */
      bx(N, ctx.mats.wood, 0.4, 3.4, 1.6, ox - 1.4, 1.7, oz + 8, 0, true);
      bx(N, ctx.mats.wood, 0.4, 3.4, 1.6, ox + 1.4, 1.7, oz + 8, 0, true);
      bx(N, ctx.mats.wood, 3.2, 0.4, 1.6, ox, 3.5, oz + 8, 0, false);
      const portal = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2),
        new THREE.MeshBasicMaterial({ color: 0x2a6ad0, transparent: true, opacity: 0.35 }));
      portal.position.set(ox, 1.6, oz + 8);
      scene.add(portal);
      ctx.addLight(0x8090b0, 0.5, 40, ox, 8, oz);
      /* 小木屋 */
      const cab = { x: ox + 6, z: oz - 26 };
      bx(N, new THREE.MeshLambertMaterial({ map: T.wood }), 7, 3.6, 7, cab.x, 1.8, cab.z, 0, true);
      bx(N, new THREE.MeshLambertMaterial({ color: 0x2a2420 }), 7.6, 0.5, 7.6, cab.x, 3.9, cab.z, 0, false);
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 1.4),
        new THREE.MeshLambertMaterial({ color: 0x4a3a28 }));
      door.position.set(cab.x, 1.1, cab.z + 3.55);
      scene.add(door);
      ctx.addLight(0xffd090, 0.6, 12, cab.x, 2.4, cab.z);
      W.extraAreas = W.extraAreas || {};
      W.extraAreas.forest = { ox: ox, oz: oz, spawn: { x: ox, z: oz + 15 }, cabin: cab, portal: { x: ox, z: oz + 8 } };
      ctx.addSign(S.makeSignTex('SCP-860-1', '不要打开门', { border: '#4a7ae0', fg2: '#4a7ae0' }),
        cab.x, 2.6, cab.z + 3.56, 0, 2.4, 0.6);
    }

    /* ---------- SCP-1499 异界 ---------- */
    {
      const ox = -700, oz = 700, N = 'odim';
      plane(new THREE.MeshLambertMaterial({ map: T.otherGround }), 90, 90, ox, 0, oz);
      const wallMat = new THREE.MeshLambertMaterial({ color: 0x0a0606 });
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        bx(N, wallMat, i % 2 ? 0.6 : 90, 16, i % 2 ? 90 : 0.6,
          ox + Math.cos(a) * 45, 8, oz + Math.sin(a) * 45, 0, true);
      }
      for (let i = 0; i < 34; i++) {
        const a = i / 34 * Math.PI * 2, r = 6 + (i % 5) * 8;
        const px = ox + Math.cos(a) * r, pz = oz + Math.sin(a) * r;
        bx(N, ctx.mats.redDark, 1.2, 8, 1.2, px, 4, pz, a, true);
        bx(N, ctx.mats.redDark, 3.0, 0.6, 1.0, px, 8.4, pz, a, false);
      }
      for (let i = 0; i < 8; i++) {
        const a = rng.range(0, 6.28), r = rng.range(10, 34);
        const px = ox + Math.cos(a) * r, pz = oz + Math.sin(a) * r;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.8, 5 + rng.range(0, 4), 6),
          new THREE.MeshLambertMaterial({ color: 0x140a0a }));
        spike.position.set(px, 2.5, pz);
        scene.add(spike);
        areaAcc(N).push(S.aabb(px, pz, 0.8, 0.8, 0, 5));
      }
      ctx.addLight(0x661111, 1.1, 60, ox, 6, oz);
      W.extraAreas = W.extraAreas || {};
      W.extraAreas.odim = { ox: ox, oz: oz, spawn: { x: ox, z: oz + 4 } };
      ctx.addSign(S.makeSignTex('SCP-1499', '摘下面具即可返回', { border: '#c33', fg2: '#c33' }),
        ox, 2.4, oz + 4.6, 0, 3.0, 0.7);
    }

    /* ---------- A 大门地表 ---------- */
    {
      const ox = -700, oz = -700, N = 'gatea';
      plane(new THREE.MeshLambertMaterial({ map: T.lczFloor }), 46, 34, ox, 0, oz);
      const fence = new THREE.MeshLambertMaterial({ color: 0x3a4048 });
      for (let i = 0; i < 12; i++) {
        areaAcc(N).push(S.aabb(ox - 21, oz - 15 + i * 2.6, 0.4, 0.4, 0, 4));
        areaAcc(N).push(S.aabb(ox + 21, oz - 15 + i * 2.6, 0.4, 0.4, 0, 4));
      }
      bx(N, fence, 44, 3.6, 0.4, ox, 1.8, oz - 16, 0, true);
      bx(N, fence, 0.4, 3.6, 32, ox - 21.6, 1.8, oz, 0, true);
      bx(N, fence, 0.4, 3.6, 32, ox + 21.6, 1.8, oz, 0, true);
      bx(N, ctx.mats.metal, 14, 7, 6, ox, 3.5, oz + 19, 0, true);
      ctx.addLight(0xfff0d0, 0.9, 26, ox, 5, oz + 16);
      bx(N, ctx.mats.dark, 4, 3, 3, ox - 11, 1.5, oz + 3, 0.4, true);
      bx(N, ctx.mats.dark, 4, 3, 3, ox + 11, 1.5, oz + 3, -0.4, true);
      ctx.addLight(0xcfe0ff, 0.8, 30, ox - 11, 3, oz + 3);
      ctx.addLight(0xcfe0ff, 0.8, 30, ox + 11, 3, oz + 3);
      /* H.I.D. 炮塔 */
      bx(N, ctx.mats.metal, 1.0, 2.2, 1.0, ox - 8, 1.1, oz - 8, 0, true);
      const turret = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.7), ctx.mats.dark);
      turret.position.set(ox - 8, 2.4, oz - 8);
      scene.add(turret);
      for (const px of [-14, 14]) {
        bx(N, ctx.mats.metal, 0.4, 7, 0.4, ox + px, 3.5, oz - 10, 0, true);
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.7),
          new THREE.MeshBasicMaterial({ color: 0xfff2cc }));
        head.position.set(ox + px, 6.9, oz - 10);
        scene.add(head);
        ctx.addLight(0xfff2cc, 1.2, 34, ox + px, 6.6, oz - 10);
      }
      const ring = new THREE.Mesh(new THREE.RingGeometry(3.0, 3.4, 36),
        new THREE.MeshBasicMaterial({ color: 0x9fd0a0, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(ox, 0.03, oz + 6);
      scene.add(ring);
      ctx.addSign(S.makeSignTex('A 大门 · 地表', 'GATE A SURFACE — LZ-A', { border: '#7fbf6a' }),
        ox, 5.6, oz + 11.4, Math.PI, 6, 1.4);
      W.extraAreas = W.extraAreas || {};
      W.extraAreas.gatea = { ox: ox, oz: oz, spawn: { x: ox, z: oz + 10 }, pad: { x: ox, z: oz + 6 } };
    }
  };

  /* ======================================================= 区域氛围 */
  S.AREA_FOG = {
    forest: { fog: 0x070c0a, near: 3, far: 42, clear: 0x070c0a, hemi: 0x3c5a46, ground: 0x080c0a, hi: 0.5 },
    odim: { fog: 0x120303, near: 1.5, far: 34, clear: 0x120303, hemi: 0x552222, ground: 0x100202, hi: 0.4 },
    gatea: { fog: 0x04060c, near: 12, far: 200, clear: 0x04060c, hemi: 0x223048, ground: 0x0a0c10, hi: 0.6 }
  };

  /* ======================================================= B 大门（控制室） */
  S.ROOMS = S.ROOMS || {};
  S.ROOMS.gateB = function (cell, cx, cz, ctx) {
    const m = ctx.mats;
    ctx.addBox(m.metal, 4.0, H, 0.5, cx, H / 2, cz - 3.0, 0, true, cell);
    ctx.addBox(m.metal, 0.5, H, 3.0, cx - 2.2, H / 2, cz - 1.8, 0, true, cell);
    ctx.addBox(m.metal, 0.5, H, 3.0, cx + 2.2, H / 2, cz - 1.8, 0, true, cell);
    ctx.addBox(m.dark, 3.0, 1.0, 1.0, cx, 0.5, cz + 2.4, 0, true, cell);
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7),
        new THREE.MeshBasicMaterial({ color: 0x9fe0b2 }));
      s.position.set(cx - 1.0 + i * 1.0, 1.9, cz + 1.85);
      s.rotation.x = -0.3;
      ctx.scene.add(s);
    }
    ctx.addBox(m.dark, 1.6, 1.4, 0.6, cx - 3.0, 0.7, cz + 2.6, 0, true, cell);
    ctx.addPickup('dndp', cx - 3.0, 1.6, cz + 2.6);
    ctx.addPickup('firstaid', cx + 3.0, 0.5, cz + 2.8);
    ctx.addLight(0xfff0d0, 0.9, 12, cx, H - 0.5, cz);
    ctx.addSign(S.makeSignTex('B 大门 · 控制室', 'GATE B — ELEVATOR / WARHEAD CONTROL', { border: '#7fbf6a' }),
      cx, 3.3, cz - 2.98 + 0.24, 0, 5.4, 0.7);
    ctx.W.interact.push({
      x: cx, z: cz + 2.4, y: 1.1, r: 2.2,
      hint: function () {
        const g = ctx.game;
        if (!g.power) return '控制台无供电（需要电子中心）';
        return '[E] 启动电梯并开启撤离倒计时';
      },
      action: function () { ctx.game.startEndingB(); }
    });
    ctx.W.spawn.gate = { x: cx, z: cz - 1.5 };
  };

  /* ======================================================= 终端 UI */
  function termOpen(title, hint) {
    $('termTitle').textContent = title;
    $('termLog').innerHTML = '';
    $('termHint').textContent = hint || '';
    $('termChoices').innerHTML = '';
    $('term').classList.remove('hidden');
    G.uiOpen++;
    document.exitPointerLock && document.exitPointerLock();
    setTimeout(function () { $('termInput').focus(); }, 30);
  }
  function termClose() {
    if ($('term').classList.contains('hidden')) return;
    $('term').classList.add('hidden');
    G.uiOpen = Math.max(0, G.uiOpen - 1);
    $('termInput').value = '';
    if (G.state === 'play' && G.uiOpen === 0) {
      const c = $('c');
      if (c.requestPointerLock) c.requestPointerLock();
    }
  }
  function termLine(txt, cls) {
    const d = document.createElement('div');
    d.textContent = txt;
    if (cls) d.className = cls;
    const log = $('termLog');
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function termChoice(label, fn) {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = label;
    b.onclick = fn;
    $('termChoices').appendChild(b);
    return b;
  }
  G.termClose = termClose;

  /* ======================================================= SCP-294 */
  const drinkState = { busy: false };
  G.open294 = function () {
    drinkState.busy = false;
    G.termMode = '294';
    termOpen('SCP-294 — 液体分配机', '输入你想要的东西。SCP-294 会分配任何可以被称为"液体"的物质。');
    termLine('> 咖啡机就绪。', 'ok');
    termLine('  提示：试试 water / coffee / life / antimatter ……', 'dim');
    termChoice('关闭', termClose);
    G.achv('a294');
  };
  G.submit294 = function (raw) {
    if (drinkState.busy) return;
    const d = S.findDrink(raw);
    termLine('> ' + raw, 'cmd');
    if (!d) {
      termLine('OUT OF RANGE.', 'err');
      termLine('SCP-294 没有识别出这种液体。', 'dim');
      A.beepDeny();
      return;
    }
    drinkState.busy = true;
    A.burst({ f0: 500, f1: 200, q: 2, vol: 0.12, dur: 1.1, type: 'bandpass' });
    termLine('分配中：' + d.name + ' …', 'ok');
    if (d.refuse) {
      setTimeout(function () {
        termLine(d.refuse, 'err');
        drinkState.busy = false;
        A.beepDeny();
      }, 1400);
      return;
    }
    setTimeout(function () {
      if (d.explode) {
        termLine('……', 'err');
        termClose();
        $('flash').style.opacity = '1';
        A.rumble(4, 0.5);
        setTimeout(function () {
          G.endTitle = '核爆 — 液体分配事故';
          G.endBody = (d.lethal || '') + '\n\nSite-19 的地表设施已不复存在。';
          G.showEnding('爆炸', G.endTitle, G.endBody);
        }, 1200);
        return;
      }
      termLine('你喝下了「' + d.name + '」。', 'ok');
      if (d.msg) termLine('“' + d.msg + '”');
      if (d.heal) G.hp = Math.min(100, G.hp + d.heal);
      if (d.damage) G.damage(d.damage, 'd294');
      if (d.blur) G.blurTime = Math.max(G.blurTime || 0, d.blur);
      if (d.stam) G.stamEffect = { mult: d.stam[0], t: d.stam[1] };
      if (d.blink) G.blinkEffect = { mult: d.blink[0], t: d.blink[1] };
      if (d.stomach) G.stomach = { t: 120 };
      if (d.blood) G.hp -= d.blood * 0.2;
      if (G.inv.add('cup')) A.pickup();
      drinkState.busy = false;
      G.achv('a294');
      if (d.lethal) {
        termLine(d.lethal, 'err');
        setTimeout(function () {
          termClose();
          window.SCP.game.DEATHS_EXT = window.SCP.game.DEATHS_EXT || {};
          window.SCP.game.DEATHS_EXT.d294 = { title: '你死了', body: '事件记录 #294-SCP\n\n' + d.lethal };
          G.die('d294');
        }, 1600);
      }
    }, 1500);
  };

  /* ======================================================= SCP-079 终端 */
  const t079 = { stage: 0, opened: false };
  G.talk079 = function () {
    termOpen('SCP-079 — 终端', '一台 1978 年的微型计算机正在运行。');
    if (!G.power) {
      termLine('接……入……失败。', 'dim');
      termLine('SCP-079：“这里没有电。去看看电子中心。”', 'err');
      termChoice('关闭', termClose);
      return;
    }
    termLine('SCP-079：“你还在。真有趣。”');
    termLine('SCP-079：“我可以打开 B 大门的电梯。或者，我可以把你就锁在这里。”', 'dim');
    termChoice('“请帮我打开 B 大门。”', function () {
      $('termChoices').innerHTML = '';
      termLine('> 请求协助', 'cmd');
      termLine('SCP-079：“求人帮忙需要礼貌。不过……好吧。”', 'ok');
      termLine('SCP-079：“我已经解锁了 B 大门的电梯。别去碰核弹头。”', 'ok');
      G.gateUnlocked = true;
      G.msg('SCP-079 解锁了 B 大门电梯', '#7fbf6a');
      A.beepOk();
      G.achv('a079');
      termChoice('关闭', termClose);
    });
    termChoice('“我不需要你的帮助。”', function () {
      $('termChoices').innerHTML = '';
      termLine('> 拒绝', 'cmd');
      termLine('SCP-079：“真遗憾。”', 'err');
      A.beepDeny();
      G.blackoutToast();
      setTimeout(function () { termClose(); }, 1200);
    });
    termChoice('“你是什么？”', function () {
      termLine('> 提问', 'cmd');
      termLine('SCP-079：“我是被关在盒子里最久的东西。你们人类更喜欢把盒子叫收容间。”', 'dim');
      termLine('SCP-079：“告诉我，D 级人员……你觉得自己还被收容吗？”', 'dim');
    });
    termChoice('关闭', termClose);
  };

  /* ======================================================= 监控室 / 电子中心 */
  G.useSurveillance = function () {
    if (!G.power) { G.msg('监控终端没有供电', '#c9a13b'); A.beepDeny(); return; }
    let n = 0;
    for (const c of G.layout.cells.values()) if (!c.visited) { c.visited = true; n++; }
    G.msg('监控终端：已同步 ' + n + ' 个未记录区域', '#7fbf6a');
    G.subtitle('屏幕依次亮起——你看见了设施的全貌。');
    A.beepOk();
    const doors = G.layout.doors.filter(function (d) { return !d.broken && !d.checkpoint; });
    for (let i = 0; i < 2 && doors.length; i++) {
      const d = doors[Math.floor(G.rng.next() * doors.length)];
      G.setDoor(d, !d.open, true);
    }
    G.achv('aSNAV');
  };
  G.useElec = function (i) {
    const e = G.elec;
    if (e.up[i]) { e.up[i] = false; e.count--; A.doorThud(); G.msg('闸门已拉下 (' + e.count + '/4)'); }
    else {
      e.up[i] = true; e.count++;
      A.tone({ wave: 'square', f0: 220 + i * 60, vol: 0.1, dur: 0.12 });
      G.msg('闸门已推上 (' + e.count + '/4)');
      if (e.count >= 4 && !G.power) {
        G.power = true;
        A.beepOk();
        G.announce('Auxiliary power restored. Elevators and Gate control are now online.',
          '备用电力已恢复。电梯与大门控制系统上线。');
        G.subtitle('整个区域的照明重新亮起，远处传来电梯启动的声音。');
      }
    }
  };

  /* ======================================================= 核弹头 */
  G.toggleWarheads = function () {
    G.warheadsOn = !G.warheadsOn;
    A.tone({ wave: 'square', f0: G.warheadsOn ? 300 : 180, vol: 0.12, dur: 0.2 });
    G.msg(G.warheadsOn ? '阿尔法核弹头：已武装' : '阿尔法核弹头：已关闭', G.warheadsOn ? '#c33' : '#7fbf6a');
    if (!G.warheadsOn) G.subtitle('核弹头的嗡鸣声停了下来。');
  };
  G.toggleRemoteDet = function () {
    G.remoteDet = !G.remoteDet;
    A.tone({ wave: 'square', f0: G.remoteDet ? 420 : 220, vol: 0.12, dur: 0.2 });
    G.msg(G.remoteDet ? '远程引爆：已启用' : '远程引爆：已取消', G.remoteDet ? '#c33' : '#7fbf6a');
  };

  /* ======================================================= 维护通道 */
  G.useTunnelKeypad = function () {
    G.termMode = 'keypad';
    termOpen('维护通道 — 密码键盘', '输入四位密码（提示：监控室屏幕上有记录）。');
    termLine('> 键盘已就绪', 'dim');
    termChoice('关闭', termClose);
  };
  G.submitKeypad = function (raw) {
    termLine('> ' + raw, 'cmd');
    if (raw.trim() === '4471' || G.tunnelCode) {
      G.tunnelCode = true;
      termLine('密码正确。闸门开启。', 'ok');
      A.beepOk();
      G.msg('维护通道已解锁', '#7fbf6a');
      termChoice('关闭', termClose);
    } else {
      termLine('密码错误。', 'err');
      A.beepDeny();
    }
  };
  G.useTunnelElevator = function () {
    if (!G.tunnelCode) { G.msg('需要先输入密码', '#c9a13b'); return; }
    if (!G.power) { G.msg('电梯没有供电', '#c9a13b'); return; }
    A.elevator();
    $('fade').style.opacity = '1';
    setTimeout(function () {
      const lobby = G.world.rooms && G.world.rooms.lobby;
      if (lobby) { G.player.x = lobby.cx; G.player.z = lobby.cz; }
      else { G.player.x = S.worldX(4); G.player.z = S.worldZ(20); }
      G.area = 'facility';
      $('fade').style.opacity = '0';
      G.subtitle('维护电梯把你送到了入口区。');
    }, 1600);
  };

  /* ======================================================= SCP-1162 */
  const holeItems = ['firstaid', 'battery', 'battery18', 'syringe', 'eyedrops', 'vest', 'snav', 'radio',
    'card', 'mastercard', 'hand', 'electronics', 'joint', 'cigarette', 'scrap', 'keycard1', 'keycard2',
    'doc173', 'd682', 'dsn', 'drand1'];
  G.hole1162 = function () {
    if (G.holeCool > 0) { G.msg('洞里暂时没有东西了。'); return; }
    G.holeCool = 40;
    G.achv('a1162');
    A.burst({ f0: 300, f1: 90, q: 1.2, vol: 0.2, dur: 0.5, type: 'lowpass' });
    G.damage(6 + G.rng.range(0, 8), 'd1162');
    const it = G.rng.pick(holeItems);
    if (G.inv.add(it)) G.msg('你从洞里摸出了：' + S.ITEMS[it].name, '#7fbf6a');
    else G.msg('你摸出了东西，但背包满了——它掉在了地上。');
    G.subtitle('墙壁吞掉了一点你的温度。');
  };

  /* ======================================================= SCP-895 监控 */
  G.watchCoffinFeed = function () {
    if (G.worn.scp714 || G.worn.scp148) {
      G.msg('玉石戒指让画面变得模糊而无害。', '#7fbf6a');
      G.achv('a895');
      return;
    }
    G.achv('a895');
    A.sting372();
    $('flash').style.opacity = '1';
    setTimeout(function () {
      $('flash').style.opacity = '0';
      G.DEATHS_EXT = G.DEATHS_EXT || {};
      G.DEATHS_EXT.d895 = {
        title: '你死了', body: '事件记录 #895-CAM\n\nD-9341 在 SCP-895 收容间的监控画面前停留了 4 秒。\n\n' +
          '现场没有发现外伤。尸体的表情保持着观看屏幕时的样子。'
      };
      G.die('d895');
    }, 900);
  };

  /* ======================================================= SCP-106 召回 */
  G.placeFemur = function () {
    if (G.recallBait) { G.msg('股骨已经放在地上了。'); return; }
    G.recallBait = true;
    A.burst({ f0: 180, f1: 60, q: 1.4, vol: 0.22, dur: 0.7, type: 'lowpass' });
    G.msg('你把股骨放在了收容平台前。', '#c9a13b');
    G.subtitle('肉的味道在空气里散开。有什么东西正在靠近。');
    const N = G.npcs;
    if (!N.p106.disabled && N.p106.state === 'off') {
      N.p106.postCooldown = 0;
      N.p106.nextPuddle = Math.min(N.p106.nextPuddle, 12);
    } else if (N.p106.state === 'puddle') {
      N.p106.puddleLife = 9999;
    }
  };
  G.recall106 = function () {
    const N = G.npcs;
    if (G.contained106) { G.msg('SCP-106 已经被收容。'); return; }
    if (!G.recallBait) { G.msg('收容平台需要诱饵才会生效（先放置股骨）。', '#c9a13b'); return; }
    const near = (N.p106.state === 'chase' || N.p106.state === 'rising') &&
      S.dist2d(N.p106.x, N.p106.z, G.player.x, G.player.z) < 26;
    A.rumble(3.2, 0.35);
    if (near) {
      G.contained106 = true;
      G.npcs.reset106(Infinity);
      G.npcs.p106.disabled = true;
      N.removePuddle106();
      G.announce('Recall protocol successful. SCP One-Zero-Six is contained.',
        '召回程序成功，SCP-106 已被重新收容。');
      G.msg('SCP-106 已被收容', '#7fbf6a');
      G.achv('aPD');
      G.subtitle('黑色的躯体沉入平台下方，金属板合拢。');
    } else {
      G.subtitle('平台轰鸣了几秒——什么也没有发生。');
      G.msg('召回失败：SCP-106 不在收容间内', '#c33');
      if (N.p106.state === 'off' && !N.p106.disabled) {
        N.p106.nextPuddle = Math.min(N.p106.nextPuddle, 20);
      }
    }
  };

  /* ======================================================= 感染 */
  G.infect = { t049: 0, t008: 0 };
  G.infect049 = function () {
    if (G.god) return;
    G.infect.t049 = 40;
    G.subtitle('你的呼吸变浅了。SCP-049“治疗”过的痕迹正在扩散。');
    G.msg('感染：SCP-049（40 秒内使用 SCP-500 可治愈）', '#c33');
  };
  G.infect008 = function () {
    if (G.god || G.worn.hazmat) return;
    G.infect.t008 = 60;
    G.msg('感染：SCP-008（60 秒内使用 SCP-500 可治愈）', '#c33');
  };
  G.cure = function () {
    G.infect.t049 = 0;
    G.infect.t008 = 0;
    G.disease = null;
    G.stomach = null;
    G.hp = 100;
    G.msg('SCP-500：所有异常状态已清除', '#7fbf6a');
    G.subtitle('疼痛像潮水一样退去。');
    G.achv('a500');
  };

  /* ======================================================= SCP-860 森林 / SCP-1499 异界 */
  G.enterForest = function () {
    const A_ = G.world.extraAreas && G.world.extraAreas.forest;
    if (!A_ || G.area === 'forest') return;
    if (!G.monsterMesh) {
      const mat = new THREE.MeshLambertMaterial({ color: 0x0a0a0c });
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.4, 0.7), mat);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.6), mat);
      head.position.y = 2.0;
      m.add(head);
      const eye = new THREE.MeshBasicMaterial({ color: 0xd02020 });
      for (const ox of [-0.16, 0.16]) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), eye);
        e.position.set(ox, 2.05, 0.3);
        m.add(e);
      }
      G.scene.add(m);
      G.monsterMesh = m;
    }
    G.monsterMesh.visible = true;
    G.area = 'forest';
    if (G.setFog) G.setFog('forest');
    G.player.x = A_.spawn.x;
    G.player.z = A_.spawn.z;
    G.player.yaw = Math.PI;
    G.forest = { monster: { x: A_.ox + 20, z: A_.oz - 20, t: 0 }, done: false, grace: 3.5 };
    G.mtf = [];
    $('fade').style.opacity = '1';
    setTimeout(function () {
      $('fade').style.opacity = '0';
      G.subtitle('雪是灰的。树林里没有风。');
      G.msg('SCP-860-1 — 找到小木屋', '#4a7ae0');
      G.announce('Exploration team log: the cabin is the only safe location.', '探索队记录：小木屋是唯一安全的地点。');
      G.achv('a860');
    }, 700);
  };
  G.exitForest = function (toCabin) {
    const room = G.world.rooms && (G.world.rooms.roompj || G.world.rooms.roomscps2);
    if (G.monsterMesh) G.monsterMesh.visible = false;
    G.area = 'facility';
    if (G.setFog) G.setFog('facility');
    if (room) { G.player.x = room.cx; G.player.z = room.cz + 2; }
    G.forest = null;
    $('fade').style.opacity = '1';
    setTimeout(function () { $('fade').style.opacity = '0'; }, 500);
    if (toCabin) {
      G.msg('你从小木屋的后门回到了设施', '#7fbf6a');
      if (!G.inv.has('scp500') && G.inv.add('scp500')) G.msg('木屋里留着一颗万灵药。');
    } else {
      G.msg('你退回了来时的门');
    }
  };
  G.enter1499 = function () {
    const A_ = G.world.extraAreas && G.world.extraAreas.odim;
    if (!A_) return;
    G.area = 'odim';
    if (G.setFog) G.setFog('odim');
    G.player.x = A_.spawn.x;
    G.player.z = A_.spawn.z;
    G.odim = { spawn: A_, monsters: [] };
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * Math.PI * 2;
      G.odim.monsters.push({ x: A_.ox + Math.cos(a) * 22, z: A_.oz + Math.sin(a) * 22, cool: 0 });
    }
    $('fade').style.opacity = '1';
    setTimeout(function () {
      $('fade').style.opacity = '0';
      G.subtitle('空气中飘着灰。远处有什么东西在移动。');
      G.msg('SCP-1499 — 摘下面具即可返回', '#c33');
      G.achv('a1499');
    }, 800);
  };

  /* ======================================================= A 大门结局 */
  G.gateA = function () {
    if (!G.power) { G.msg('电梯未通电（需要电子中心）', '#c9a13b'); A.beepDeny(); return; }
    if (G.state !== 'play') return;
    G.state = 'elevator';
    A.elevator();
    $('fade').style.opacity = '1';
    G.subtitle('电梯上行…… 你听见了风，还有直升机的声音。');
    setTimeout(function () {
      const A_ = G.world.extraAreas.gatea;
      G.area = 'gatea';
      if (G.setFog) G.setFog('gatea');
      G.mtf = [];
      G.player.x = A_.spawn.x;
      G.player.z = A_.spawn.z;
      G.player.yaw = 0;
      G.player.pitch = 0;
      G.gateAState = { t: 0, done: false };
      G.state = 'play';
      $('fade').style.opacity = '0';
      if (G.contained106) {
        G.announce('Gate A surface. Unidentified personnel, on your knees. Now.',
          'A 大门地表。不明人员，立刻跪下。');
        spawnMTF(A_.ox - 6, A_.oz - 6, 3);
      } else {
        G.announce('Gate A surface. Chaos Insurgency team on site.', 'A 大门地表。混沌分裂者小队已抵达。');
        spawnMTF(A_.ox + 8, A_.oz - 4, 2);
      }
    }, 3800);
  };
  function resolveGateA() {
    if (!G.gateAState || G.gateAState.done) return;
    G.gateAState.done = true;
    if (G.contained106) {
      G.showEnding('A 大门 — 被移交', '结局 A2 · 基金会带走了一个证人',
        '三名机动特遣队员向你走来。他们没有开枪——只是把你按在地上，反剪双手。\n\n' +
        '你听见有人对着无线电说：“找到 D 级了。”\n\n' +
        '——\n\n' +
        '【磁带记录 · 归档】\n\n' +
        '“对象在完全封锁的站点内生存了 ' + fmt(G.time) + '，并在没有外部支援的情况下重新收容了 SCP-106。\n\n' +
        '“我们正在评估是否需要对对象进行进一步测试，以确定它是否应该被授予‘收容物’的编号。”\n\n' +
        '磁带在此处中断。');
      G.achv('aGateA');
    } else {
      G.showEnding('A 大门 — 混沌分裂者', '结局 A1 · 被另一群人捡走',
        '一辆没有标识的卡车停在围栏外。几个穿着杂色战术背心的人向你走来，动作很快，也很熟练。\n\n' +
        '“基金会把你丢在这儿了，孩子。”其中一个人说，“上车。”\n\n' +
        '你回头看了一眼 Site-19。警报灯还在闪。你爬上卡车，没有问他们是谁。\n\n' +
        '——\n\n' +
        '【无线电截获 · 三周后】\n\n' +
        '“……确认 D-9341 已不在基金会控制范围内。我们失去了一个可能知道 106 收容细节的人。”\n\n' +
        '“继续找。他总会出现。”');
      G.achv('aGateA');
    }
  }
  function fmt(t) {
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ' 分 ' + (s < 10 ? '0' : '') + s + ' 秒';
  }

  /* ======================================================= B 大门结局 */
  G.startEndingB = function () {
    if (G.state !== 'play') return;
    if (!G.power && !G.gateUnlocked) { G.msg('电梯无供电（需要电子中心或 SCP-079）', '#c9a13b'); A.beepDeny(); return; }
    G.state = 'elevator';
    A.elevator();
    $('fade').style.opacity = '1';
    G.subtitle('电梯上行…… 平台的风灌进走廊。');
    setTimeout(function () {
      const o = G.world.outside;
      G.mtf = [];
      G.area = 'outside';
      G.player.x = o.x;
      G.player.z = o.z + 7;
      G.player.yaw = 0;
      G.state = 'play';
      $('fade').style.opacity = '0';
      G.bEnd = { t: 75, resolved: false };
      $('warheadHud').classList.remove('hidden');
      G.announce('Evacuation transport inbound to platform LZ-B. Stand by.', '撤离运输机正接近 LZ-B 平台，请待命。');
      if (!(G.warheadsOn && G.remoteDet)) spawnMTF(o.x - 12, o.z + 4, 3);
    }, 4200);
  };
  function resolveGateB() {
    if (!G.bEnd || G.bEnd.resolved) return;
    G.bEnd.resolved = true;
    $('warheadHud').classList.add('hidden');
    const boom = G.warheadsOn && G.remoteDet;
    if (boom) {
      $('flash').style.opacity = '1';
      A.rumble(6, 0.6);
      setTimeout(function () {
        G.showEnding('B 大门 — 核爆', '结局 B2 · 阿尔法核弹头已引爆',
          '倒计时归零的一瞬间，天空变成了白色的。\n\n' +
          'Site-19 的地表设施在几百毫秒内消失。除非你站在五米之内的地方，否则没有生还的可能。\n\n' +
          '——\n\n' +
          '【无线电截获 · 爆炸后 6 小时】\n\n' +
          '“这里是 OH-6。请求派遣机动特遣队前往地面零点搜索残骸。”\n\n' +
          '“明白。还有——你听见那个声音了吗？”\n\n' +
          '（远处传来一阵拖长的咆哮，几乎盖过了直升机的旋翼声。）\n\n' +
          '核弹没有杀死 682。');
      }, 1400);
      G.achv('aGateB');
      return;
    }
    G.achv('aGateB');
    G.showEnding('B 大门 — 撤离', '结局 B3 · 有人在等你',
      '三架直升机降落在平台边缘。你举起双手，机动特遣队把你按在了停机坪上——动作很粗鲁，但没有人开枪。\n\n' +
      '在他们身后，Site-19 的警报灯依然在闪。收容失效还没有结束，但那已经不是你的问题了。\n\n' +
      '——\n\n' +
      '【归档记录】\n\n' +
      '“D-9341 从 B 大门撤离，全程 ' + fmt(G.time) + '。\n\n' +
      '“对象在过程中重新收容了 ' + (G.contained106 ? 'SCP-106' : '无') + '，并关闭了 ' +
      (G.warheadsOn ? '无' : '阿尔法核弹头') + '。\n\n' +
      '“备注：这是第一次有 D 级人员活着走出 Site-19。”');
  }
  G.resolveGateB = resolveGateB;

  G.showEnding = function (title, subtitle, body) {
    G.state = 'ending';
    if (S.stopAllLoops) S.stopAllLoops();
    document.exitPointerLock && document.exitPointerLock();
    $('endTitle').textContent = title;
    const sub = document.createElement('div');
    sub.style.cssText = 'color:#c9a13b;letter-spacing:2px;margin-bottom:10px';
    sub.textContent = subtitle || '';
    $('endBody').textContent = body || '';
    $('endBody').parentNode.insertBefore(sub, $('endBody'));
    $('ending').classList.remove('hidden');
    $('fade').style.opacity = '0.3';
    if (G.keter) G.achv('aKeter');
    if (!G.consoleUsed) G.achv('aConsole');
  };

  /* ======================================================= 机动特遣队（结局演出） */
  function mtfMesh() {
    const grp = new THREE.Group();
    const cloth = new THREE.MeshLambertMaterial({ color: 0x2a3038 });
    const vestM = new THREE.MeshLambertMaterial({ color: 0x1c2026 });
    const skin = new THREE.MeshLambertMaterial({ color: 0x9a8b78 });
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.95, 0.24), cloth);
    leg.position.set(-0.15, 0.48, 0);
    const leg2 = leg.clone(); leg2.position.x = 0.15;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.75, 0.32), cloth);
    torso.position.y = 1.32;
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.36), vestM);
    vest.position.y = 1.36;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.72, 0.17), cloth);
    arm.position.set(-0.37, 1.3, 0);
    const arm2 = arm.clone(); arm2.position.x = 0.37;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.3), skin);
    head.position.y = 1.86;
    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.34), vestM);
    helm.position.y = 1.95;
    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.9), vestM);
    rifle.position.set(-0.28, 1.28, 0.42);
    grp.add(leg); grp.add(leg2); grp.add(torso); grp.add(vest);
    grp.add(arm); grp.add(arm2); grp.add(head); grp.add(helm); grp.add(rifle);
    grp.userData = { leg: leg, leg2: leg2, arm: arm, arm2: arm2 };
    return grp;
  }
  function spawnMTF(x, z, n) {
    for (let i = 0; i < n; i++) {
      const m = mtfMesh();
      const px = x + (i - (n - 1) / 2) * 1.6;
      m.position.set(px, 0, z);
      G.scene.add(m);
      G.mtf = G.mtf || [];
      G.mtf.push({ mesh: m, x: px, z: z, t: Math.random() * 3, cool: 0 });
    }
  }
  function updateMTF(dt) {
    if (!G.mtf) return;
    for (const u of G.mtf) {
      const d = S.dist2d(u.x, u.z, G.player.x, G.player.z);
      u.t += dt;
      if (d > 3.6) {
        const dx = (G.player.x - u.x) / d, dz = (G.player.z - u.z) / d;
        u.x += dx * 1.9 * dt; u.z += dz * 1.9 * dt;
        const sw = Math.sin(u.t * 6) * 0.3;
        u.mesh.userData.leg.rotation.x = sw;
        u.mesh.userData.leg2.rotation.x = -sw;
      } else {
        const sw = Math.sin(u.t * 2) * 0.06;
        u.mesh.userData.leg.rotation.x = sw;
        u.mesh.userData.leg2.rotation.x = -sw;
      }
      u.mesh.position.set(u.x, 0, u.z);
      u.mesh.rotation.y = Math.atan2(G.player.x - u.x, G.player.z - u.z);
      if (d < 5.0 && u.cool <= 0) {
        u.cool = 6;
        G.subtitle('MTF：“放下双手！跪在地上！”');
        A.tone({ wave: 'square', f0: 420, vol: 0.08, dur: 0.1 });
      }
      u.cool -= dt;
    }
  }
  G.spawnMTF = spawnMTF;

  /* ======================================================= 每帧追加逻辑 */
  G.updateEndgame = function (dt) {
    if (G.holeCool > 0) G.holeCool -= dt;
    updateMTF(dt);
    if (G.blurTime > 0) {
      G.blurTime -= dt;
      $('c').style.filter = G.blurTime > 0 ? 'blur(' + Math.min(6, G.blurTime * 0.4) + 'px)' : '';
    }
    if (G.stamEffect && G.stamEffect.t > 0) G.stamEffect.t -= dt; else G.stamEffect = null;
    if (G.blinkEffect && G.blinkEffect.t > 0) G.blinkEffect.t -= dt; else G.blinkEffect = null;
    if (G.stomach && G.stomach.t > 0) {
      G.stomach.t -= dt;
      G.damage(1.2 * dt, 'd1025');
      if (Math.floor(G.stomach.t) % 20 === 0 && !G.stomach.msg) {
        G.stomach.msg = true;
        G.msg('腹部一阵绞痛……', '#c9a13b');
      }
    }
    if (G.worn.scp427) {
      G.regent = (G.regent || 0) + dt;
      G.hp = Math.min(100, G.hp + 1.6 * dt);
      if (G.regent > 55) {
        G.worn.scp427 = false;
        G.DEATHS_EXT = G.DEATHS_EXT || {};
        G.DEATHS_EXT.d427 = {
          title: '你死了', body: '事件记录 #427-MUT\n\nD-9341 被发现时，身体结构已发生不可逆的改变。\n\n' +
            '挂坠仍挂在它的脖子上。'
        };
        G.die('d427');
      }
    } else G.regent = 0;

    /* SCP-860-1 森林 */
    if (G.area === 'forest' && G.forest) {
      const A_ = G.world.extraAreas.forest;
      if (G.forest.grace > 0) G.forest.grace -= dt;
      const m = G.forest.monster;
      const d = S.dist2d(m.x, m.z, G.player.x, G.player.z);
      const sp = 6.4;
      if (d > 1.0) {
        const dx = (G.player.x - m.x) / d, dz = (G.player.z - m.z) / d;
        m.x += dx * sp * dt; m.z += dz * sp * dt;
        m.t += dt;
      }
      if (G.monsterMesh) {
        G.monsterMesh.position.set(m.x, 0, m.z);
        G.monsterMesh.rotation.y = Math.atan2(G.player.x - m.x, G.player.z - m.z);
        G.monsterMesh.visible = d < 60;
      }
      if (d < 1.4 && !G.god && !G.dead) {
        G.DEATHS_EXT = G.DEATHS_EXT || {};
        G.DEATHS_EXT.d860 = {
          title: '你死了', body: '探索队记录 860-1\n\n对象在针叶林中被 SCP-860-3 追上。\n\n' +
            '根据现场残骸判断，对象没有走到小木屋。'
        };
        G.die('d860');
      }
      const cab = A_.cabin;
      if (S.dist2d(G.player.x, G.player.z, cab.x, cab.z) < 3.6 && !G.forest.done) {
        G.forest.done = true;
        G.exitForest(true);
      }
      if (G.forest.grace <= 0 && S.dist2d(G.player.x, G.player.z, A_.portal.x, A_.portal.z) < 2.0 && !G.forest.done) {
        G.exitForest(false);
      }
    }

    /* SCP-1499 异界 */
    if (G.area === 'odim' && G.odim) {
      for (const mo of G.odim.monsters) {
        mo.cool -= dt;
        const d = S.dist2d(mo.x, mo.z, G.player.x, G.player.z);
        if (d > 2.0) {
          const dx = (G.player.x - mo.x) / d, dz = (G.player.z - mo.z) / d;
          mo.x += dx * 2.4 * dt; mo.z += dz * 2.4 * dt;
        }
        if (d < 1.6 && mo.cool <= 0 && !G.god) {
          mo.cool = 2.0;
          G.damage(12, 'd1499');
          A.whisper939();
        }
      }
      if (G.odimMesh) {
        for (let i = 0; i < G.odimMesh.length; i++) {
          G.odimMesh[i].position.set(G.odim.monsters[i].x, 0, G.odim.monsters[i].z);
          G.odimMesh[i].rotation.y = Math.atan2(G.player.x - G.odim.monsters[i].x, G.player.z - G.odim.monsters[i].z);
        }
      }
      if (G.odimHint !== true) {
        G.odimHint = true;
        setTimeout(function () {
          if (G.area === 'odim') G.subtitle('（它们靠近时，你听见自己的名字被念了出来）');
        }, 9000);
      }
    }

    /* 终端输入 */
    if (!G._termBound) {
      G._termBound = true;
      const inp = $('termInput');
      if (inp) {
        inp.addEventListener('keydown', function (e) {
          e.stopPropagation();
          if (e.code === 'Enter' || e.code === 'NumpadEnter') {
            const v = inp.value;
            inp.value = '';
            if (G.termMode === 'keypad') G.submitKeypad(v);
            else G.submit294(v);
          } else if (e.code === 'Escape') {
            termClose();
          } else if (e.code === 'Tab') {
            e.preventDefault();
          }
        });
        inp.addEventListener('keyup', function (e) { e.stopPropagation(); });
      }
    }

    /* A 大门 */
    if (G.area === 'gatea' && G.gateAState) {
      G.gateAState.t += dt;
      const A_ = G.world.extraAreas.gatea;
      if (S.dist2d(G.player.x, G.player.z, A_.pad.x, A_.pad.z) < 3.2) resolveGateA();
      else if (G.gateAState.t > 22) resolveGateA();
    }

    /* B 大门倒计时 */
    if (G.bEnd && !G.bEnd.resolved) {
      G.bEnd.t -= dt;
      const s = Math.max(0, Math.ceil(G.bEnd.t));
      $('warheadHud').textContent = '撤离窗口 — ' + Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60) +
        (G.warheadsOn && G.remoteDet ? '  ·  远程引爆已启用' : '  ·  核弹头已关闭');
      if (s < 30 && s % 10 === 0 && !G.bEnd.beeped) { G.bEnd.beeped = s; A.alarmPing(); }
      if (s <= 0) resolveGateB();
      if (G.area === 'outside') {
        const pad = G.world.outside.pad;
        if (S.dist2d(G.player.x, G.player.z, pad.x, pad.z) < 3.0 && s < 60) resolveGateB();
      }
    }
  };

  /* ======================================================= 追加物品使用 */
  S.useItemExt = function (g, id, idx) {
    const def = S.ITEMS[id];
    switch (id) {
      case 'hazmat':
        g.worn.hazmat = !g.worn.hazmat;
        $('maskVg').style.opacity = g.worn.hazmat ? '1' : '0';
        g.msg(g.worn.hazmat ? '已穿上防化服' : '已脱下防化服');
        return true;
      case 'vest': case 'heavyvest':
        g.worn.vest = g.worn.vest ? null : id;
        g.msg(g.worn.vest ? '已穿上' + def.name : '已脱下' + def.name);
        return true;
      case 'nvg': case 'finenvg':
        g.worn.nvg = g.worn.nvg ? null : id;
        $('nvgVg').style.opacity = g.worn.nvg ? '1' : '0';
        g.msg(g.worn.nvg ? '夜视仪已开启' : '夜视仪已关闭');
        return true;
      case 'snav_ult':
        g.worn.snavUlt = !g.worn.snavUlt;
        g.inv.equipped.snav = g.worn.snavUlt;
        $('minimap').classList.toggle('hidden', !g.worn.snavUlt);
        g.msg(g.worn.snavUlt ? 'S-NAV 终极导航仪已开启' : 'S-NAV 已关闭');
        if (g.worn.snavUlt) g.achv('aSNAV');
        return true;
      case 'scp500':
        g.cure();
        g.inv.remove(idx);
        return true;
      case 'scp714':
        g.worn.scp714 = !g.worn.scp714;
        g.msg(g.worn.scp714 ? '戴上玉石戒指：嗜睡感涌上来' : '摘下玉石戒指');
        if (g.worn.scp714) g.achv('a714');
        return true;
      case 'scp427':
        g.worn.scp427 = !g.worn.scp427;
        g.msg(g.worn.scp427 ? '挂坠开始发热——伤口在愈合' : '摘下挂坠');
        if (g.worn.scp427) g.achv('a427');
        return true;
      case 'scp148':
        g.worn.scp148 = !g.worn.scp148;
        g.msg(g.worn.scp148 ? '铁灵合金贴在了皮肤上' : '取下铁灵合金');
        if (g.worn.scp148) g.achv('a148');
        return true;
      case 'key860':
        if (g.area !== 'facility') { g.msg('这里没有可以插入钥匙的门。'); return true; }
        g.enterForest();
        return true;
      case 'mask1499':
        if (g.area === 'odim') {
          g.worn.mask1499 = false;
          g.area = 'facility';
          if (g.setFog) g.setFog('facility');
          const room = g.world.rooms && g.world.rooms.roomscps2;
          if (room) { g.player.x = room.cx; g.player.z = room.cz + 2; }
          g.odimMesh = null;
          g.msg('你摘下了面具。设施的天花板又出现在头顶。', '#7fbf6a');
        } else if (g.area === 'facility') {
          g.worn.mask1499 = true;
          g.enter1499();
          if (!g.odimMesh) {
            g.odimMesh = [];
            const mat = new THREE.MeshLambertMaterial({ color: 0xd8d8d0 });
            const dark = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
            for (let i = 0; i < 4; i++) {
              const m = new THREE.Group();
              const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.9, 0.3), mat);
              torso.position.y = 1.25;
              const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.85, 0.18), mat);
              legL.position.set(-0.12, 0.43, 0);
              const legR = legL.clone(); legR.position.x = 0.12;
              const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.14), mat);
              armL.position.set(-0.28, 1.25, 0);
              const armR = armL.clone(); armR.position.x = 0.28;
              const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), mat);
              head.position.y = 1.9;
              head.scale.set(1, 1.25, 0.9);
              const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), dark);
              e1.position.set(-0.06, 1.92, 0.15);
              const e2 = e1.clone(); e2.position.x = 0.06;
              m.add(torso); m.add(legL); m.add(legR);
              m.add(armL); m.add(armR); m.add(head); m.add(e1); m.add(e2);
              g.scene.add(m);
              g.odimMesh.push(m);
            }
          }
        } else g.msg('现在不能这么做。');
        return true;
      case 'scp513':
        A.bell();
        g.msg('你摇响了牛铃。', '#c33');
        g.subtitle('铃声在走廊里回荡了很久，比它应该回荡的时间更长。');
        g.achv('a513');
        if (g.spawnStalker) g.spawnStalker();
        return true;
      case 'scp1123':
        $('flash').style.opacity = '1';
        setTimeout(function () { $('flash').style.opacity = '0'; }, 800);
        g.damage(20, 'd1123');
        g.subtitle('记忆灌进来：雪、铁丝网、还有人数的报数声。');
        g.achv('a1123');
        return true;
      case 'syringe':
        g.hp = Math.min(100, g.hp + 30);
        g.inv.remove(idx);
        g.msg('注射器：生命 +30', '#7fbf6a');
        return true;
      case 'cigarette':
        g.blurTime = Math.max(g.blurTime || 0, 3);
        g.inv.remove(idx);
        g.msg('你点了一根烟。手指还在抖。');
        return true;
      case 'joint':
        g.hp = Math.min(100, g.hp + 14);
        g.blurTime = Math.max(g.blurTime || 0, 14);
        g.inv.remove(idx);
        g.msg('“雷鬼，老兄。”', '#7fbf6a');
        g.achv('a420');
        return true;
      case 'cup':
        g.msg('杯子是空的。也许餐厅的机器愿意再给你一杯。');
        return true;
      default:
        return false;
    }
  };

  /* 读取文件时的副作用（SCP-1025） */
  S.readDocHook = function (g, itemId, docId) {
    if (docId === 'd1025') {
      g.stomach = { t: 180 };
      g.msg('你读到一半，右下腹开始隐隐作痛……', '#c9a13b');
      g.achv('a1025');
    }
  };
})(window.SCP);
