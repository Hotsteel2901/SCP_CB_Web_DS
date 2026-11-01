/* scps.js — 追加收容物：SCP-049 / 049-2 / 939 / 966 / 372 / 1048 / 513-1 / 035 / 066
   以及房间级别的事件（SCP-012、205、895、970、1123、789-J）。 */
window.SCP = window.SCP || {};
(function (S) {
  const A = S.audio;
  const $ = function (id) { return document.getElementById(id); };

  /* -------------------------------------------------- 追加音效（合成） */
  A.spell049 = function () {
    A.tone({ wave: 'sine', f0: 180, f1: 120, vol: 0.12, dur: 0.5 });
    A.tone({ wave: 'triangle', f0: 90, vol: 0.1, dur: 0.7, delay: 0.1 });
  };
  A.roar939 = function () {
    A.burst({ f0: 420, f1: 90, q: 1.2, vol: 0.32, dur: 0.9, type: 'lowpass' });
    A.tone({ wave: 'sawtooth', f0: 260, f1: 120, vol: 0.14, dur: 0.8 });
  };
  A.whisper939 = function () {
    A.burst({ f0: 1400, f1: 700, q: 4, vol: 0.07, dur: 1.4, type: 'bandpass' });
  };
  A.scream1048 = function () {
    for (let i = 0; i < 4; i++)
      A.tone({ wave: 'square', f0: 2400 + i * 400, f1: 3200, vol: 0.12, dur: 1.2, delay: i * 0.05 });
  };
  A.quack = function () {
    A.tone({ wave: 'sawtooth', f0: 700, f1: 260, vol: 0.1, dur: 0.18 });
    A.tone({ wave: 'square', f0: 420, f1: 200, vol: 0.06, dur: 0.12, delay: 0.14 });
  };
  A.bell = function () {
    A.tone({ wave: 'sine', f0: 520, vol: 0.18, dur: 1.6 });
    A.tone({ wave: 'sine', f0: 780, vol: 0.1, dur: 1.2, delay: 0.02 });
    A.tone({ wave: 'sine', f0: 1240, vol: 0.06, dur: 0.9, delay: 0.04 });
  };
  A.zombie = function () {
    A.burst({ f0: 260, f1: 140, q: 2, vol: 0.16, dur: 0.6, type: 'lowpass' });
  };
  A.sting372 = function () {
    A.tone({ wave: 'square', f0: 1200, f1: 2000, vol: 0.07, dur: 0.07 });
    A.burst({ f0: 2600, f1: 900, q: 3, vol: 0.05, dur: 0.2, type: 'bandpass' });
  };
  A.achievement = function () {
    A.tone({ wave: 'triangle', f0: 660, vol: 0.1, dur: 0.14 });
    A.tone({ wave: 'triangle', f0: 990, vol: 0.1, dur: 0.18, delay: 0.12 });
  };

  /* -------------------------------------------------- 模型 */
  function humanoid(mats, o) {
    const opts = Object.assign({}, o, {
      torso: (mats && mats.torso) || (mats && mats.skin),
      pants: (mats && mats.skin),
      sleeve: (mats && mats.torso) || (mats && mats.skin),
      skin: (mats && mats.skin) || undefined
    });
    return S.models.humanoid(opts);
  }

  function build049(T) { return S.models.build049(T); }
  function build939(T) { return S.models.build939(T); }
  function build966(T) { return S.models.build966(T); }
  function build513_1() { return S.models.build513_1(); }
  function buildBear(T, ears) { return S.models.buildBear(T, ears); }
  function buildDuck() { return S.models.buildDuck(); }

  /* -------------------------------------------------- 主逻辑 */
  S.attachScps = function (game) {
    const W = game.world, L = game.layout, T = game.TEX, G = game;
    const N = game.npcs;
    const rng = game.rng;
    const EXTRA = { list: [], near: {} };
    N.extra = EXTRA;

    function cellOf(x, z) { return L.get(S.colOf(x), S.rowOf(z)); }
    function dist2(ax, az, bx, bz) { return Math.hypot(ax - bx, az - bz); }
    function face(m, x, z, tx, tz) { m.position.set(x, 0, z); m.rotation.y = Math.atan2(tx - x, tz - z); }
    function seenByPlayer(x, z, y) {
      if (G.blinking || G.dead || G.area !== 'facility') return false;
      const dx = x - G.player.x, dz = z - G.player.z;
      const d = Math.hypot(dx, dz);
      if (d > 26) return false;
      if (!S.losClear(L, G.player.x, G.player.z, x, z, 0.25)) return false;
      G.camera.updateMatrixWorld();
      const v = new THREE.Vector3(x, y || 1.0, z).project(G.camera);
      return v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1;
    }
    function spot(x, z, min, max) {
      for (let i = 0; i < 60; i++) {
        const a = rng.range(0, 6.28), r = rng.range(min, max);
        const tx = x + Math.cos(a) * r, tz = z + Math.sin(a) * r;
        if (W.isWalkable(tx, tz, 0.5)) return { x: tx, z: tz };
      }
      return null;
    }
    function stepToward(e, tx, tz, spd, dt, radius) {
      const dx = tx - e.x, dz = tz - e.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.001) return 0;
      const move = Math.min(spd * dt, d);
      let nx = e.x + dx / d * move, nz = e.z + dz / d * move;
      const res = S.resolveCircle(nx, nz, radius || 0.34, W.collidersNear(nx, nz, 'facility'));
      nx = res.x; nz = res.z;
      const moved = Math.hypot(nx - e.x, nz - e.z);
      e.x = nx; e.z = nz;
      return moved;
    }
    function walkAnim(e, t, amp) {
      const u = e.mesh.userData;
      if (!u || !u.legL) return;
      const sw = Math.sin(t * 6) * (amp || 0.3);
      u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
      u.armL.rotation.x = sw * 0.6; u.armR.rotation.x = -sw * 0.6;
    }

    /* ---------------------------------------------------- SCP-049 */
    if (W.spawn.p049) {
      const m = build049(T);
      const e = {
        mesh: m, x: W.spawn.p049.x, z: W.spawn.p049.z, speed: 1.45,
        state: 'idle', t: 0, repath: 0, path: null, spoken: 0, touched: 0
      };
      face(m, e.x, e.z, e.x, e.z + 1);
      game.scene.add(m);
      EXTRA.list.push(e);
      e.update = function (dt) {
        const d = dist2(e.x, e.z, G.player.x, G.player.z);
        if (game.state !== 'play' || game.area !== 'facility' || G.notarget) { m.visible = false; return; }
        m.visible = true;
        e.t += dt;
        e.spoken -= dt;
        if (e.state === 'idle' && d < 14) {
          e.state = 'follow';
          if (e.spoken <= 0) { A.spell049(); e.spoken = 20; G.subtitle('SCP-049：“我能感觉到瘟疫在你体内流动。”'); }
          G.msg('SCP-049 注意到了你', '#c9a13b');
          game.achv('a049');
        }
        if (e.state === 'follow') {
          e.repath -= dt;
          const my = cellOf(e.x, e.z), pl = cellOf(G.player.x, G.player.z);
          if (my && pl && (e.repath <= 0 || !e.path)) {
            e.path = S.findPath(L, my, pl, function () { return true; });
            if (e.path && e.path.length > 1) e.path.shift();
            e.repath = 1.2;
          }
          let tx = G.player.x, tz = G.player.z;
          if (e.path && e.path.length && my !== pl) {
            tx = S.worldX(e.path[0].c); tz = S.worldZ(e.path[0].r);
            if (dist2(e.x, e.z, tx, tz) < 1.2) { e.path.shift(); }
          }
          const moved = stepToward(e, tx, tz, e.speed * (game.keter ? 1.15 : 1), dt, 0.34);
          walkAnim(e, e.t, moved > 0.001 ? 0.32 : 0);
          face(m, e.x, e.z, G.player.x, G.player.z);
          if (d < 1.5 && e.touched <= 0 && !G.god) {
            e.touched = 60;
            if (G.worn.scp148 || G.worn.scp714) {
              G.subtitle('SCP-049 的手停在半空——它退开了。');
            } else if (G.inv.has('scp500')) {
              G.msg('SCP-049 触碰了你。万灵药也许还来得及。', '#c33');
            } else {
              G.msg('SCP-049 触碰了你。你感觉体内有什么东西正在改变。', '#c33');
            }
            A.spell049();
            game.infect049();
          }
        } else {
          walkAnim(e, e.t, 0);
        }
      };
    }

    /* ---------------------------------------------------- SCP-939 */
    EXTRA.p939 = [];
    if (W.spawn.p939) {
      for (const sp of W.spawn.p939) {
        const m = build939(T);
        const e = {
          mesh: m, x: sp.x, z: sp.z, home: { x: sp.x, z: sp.z }, speed: 3.6,
          state: 'patrol', t: 0, target: null, repath: 0, path: null, warn: 0, cool: 0
        };
        m.position.set(e.x, 0, e.z);
        game.scene.add(m);
        EXTRA.p939.push(e);
        e.update = function (dt) {
          if (game.state !== 'play' || game.area !== 'facility' || G.notarget || !G.breach) { m.visible = false; return; }
          m.visible = true;
          e.t += dt; e.cool -= dt; e.warn -= dt;
          const d = dist2(e.x, e.z, G.player.x, G.player.z);
          const sprinting = G.keys['ShiftLeft'] && (G.keys['KeyW'] || G.keys['KeyA'] || G.keys['KeyS'] || G.keys['KeyD']);
          const hearing = sprinting ? 26 : ((G.keys['KeyW'] || G.keys['KeyA'] || G.keys['KeyS'] || G.keys['KeyD']) ? 13 : 4.5);
          if (e.state !== 'chase' && d < hearing) {
            e.state = 'chase';
            e.target = { x: G.player.x, z: G.player.z };
            A.roar939();
            if (e.warn <= 0) { e.warn = 25; G.subtitle('（有什么东西在黑暗中回应了你的脚步声）'); }
            EXTRA.p939.forEach(function (o) { if (o !== e) { o.state = 'chase'; o.target = { x: G.player.x, z: G.player.z }; } });
          }
          if (e.state === 'chase') {
            if (e.cool <= 0) { e.cool = 0.6; e.target = { x: G.player.x, z: G.player.z }; }
            const moved = stepToward(e, e.target.x, e.target.z, e.speed * (game.keter ? 1.1 : 1), dt, 0.4);
            walkAnim(e, e.t, moved > 0.001 ? 0.5 : 0.05);
            face(m, e.x, e.z, e.target.x, e.target.z);
            if (dist2(e.x, e.z, e.target.x, e.target.z) < 1.0 && d > 22) e.state = 'patrol';
            if (d < 1.2 && !G.god && !G.notarget) { A.roar939(); G.die('d939'); }
          } else {
            if (dist2(e.x, e.z, e.home.x, e.home.z) > 1.2) {
              const moved = stepToward(e, e.home.x, e.home.z, 1.1, dt, 0.4);
              walkAnim(e, e.t, moved > 0.001 ? 0.25 : 0);
            } else {
              walkAnim(e, e.t, 0);
              if (rng.chance(dt * 0.03)) A.whisper939();
            }
            m.position.set(e.x, 0, e.z);
          }
        };
      }
    }

    /* ---------------------------------------------------- SCP-966 */
    EXTRA.p966 = [];
    if (W.spawn.p966) {
      for (const sp of W.spawn.p966) {
        const m = build966(T);
        const e = {
          mesh: m, x: sp.x, z: sp.z, home: { x: sp.x, z: sp.z },
          speed: 0.95, t: rng.range(0, 6), active: false, atk: 0
        };
        m.position.set(e.x, 0, e.z);
        game.scene.add(m);
        EXTRA.p966.push(e);
        e.update = function (dt) {
          if (game.state !== 'play' || game.area !== 'facility' || G.notarget || !G.breach) { m.visible = false; return; }
          const d = dist2(e.x, e.z, G.player.x, G.player.z);
          m.visible = !!G.worn.nvg;
          if (d > 30) { m.visible = false; return; }
          e.active = d < 18;
          if (!e.active) return;
          e.t += dt;
          const observed = G.worn.nvg && seenByPlayer(e.x, e.z, 1.0);
          const sp = observed ? 0.12 : (G.blinking ? e.speed * 2.2 : e.speed);
          stepToward(e, G.player.x, G.player.z, sp, dt, 0.32);
          face(m, e.x, e.z, G.player.x, G.player.z);
          e.atk -= dt;
          if (d < 1.0 && !G.god && e.atk <= 0) {
            e.atk = 1.2;
            G.damage(G.worn.scp148 ? 3 : 9, 'd966');
            A.whisper939();
            if (!G.dead) G.subtitle('（有什么东西贴上了你的后颈）');
          }
        };
      }
    }

    /* ---------------------------------------------------- SCP-372 */
    if (W.spawn.p372) {
      const sp = W.spawn.p372;
      const e = { x: sp.x, z: sp.z, cool: rng.range(20, 45), show: 0 };
      const m = build966(T);
      m.traverse(function (o) { if (o.material) { o.material = o.material.clone(); o.material.opacity = 0.5; } });
      m.visible = false;
      game.scene.add(m);
      EXTRA.p372 = e;
      e.update = function (dt) {
        if (game.state !== 'play' || game.area !== 'facility') { m.visible = false; return; }
        if (dist2(G.player.x, G.player.z, sp.x, sp.z) > 30 && !m.visible) { e.cool = Math.max(e.cool, 8); return; }
        e.cool -= dt;
        if (e.show > 0) {
          e.show -= dt;
          if (e.show <= 0) m.visible = false;
        } else if (e.cool <= 0) {
          e.cool = rng.range(35, 80);
          const side = rng.pick([-1, 1]);
          const ang = G.player.yaw + side * rng.range(1.5, 2.2);
          const px = G.player.x - Math.sin(ang) * rng.range(5, 9);
          const pz = G.player.z - Math.cos(ang) * rng.range(5, 9);
          if (W.isWalkable(px, pz, 0.4)) {
            e.x = px; e.z = pz;
            e.show = rng.range(0.6, 1.3);
            m.visible = true;
            face(m, e.x, e.z, G.player.x, G.player.z);
            A.sting372();
            game.achv('a372');
          }
        }
      };
    }

    /* ---------------------------------------------------- SCP-035 被占有者 */
    if (W.spawn.possessed) {
      const m = humanoid({ skin: new THREE.MeshLambertMaterial({ color: 0xcfc8bc }),
        torso: new THREE.MeshLambertMaterial({ color: 0xe6e2d6 }) },
        { legLen: 0.95, torsoH: 0.8, armLen: 0.9 });
      const maskM = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10),
        new THREE.MeshLambertMaterial({ color: 0xf0ece0 }));
      maskM.position.y = 2.0;
      maskM.scale.set(1, 1.2, 0.6);
      m.add(maskM);
      const e = { mesh: m, x: W.spawn.possessed.x, z: W.spawn.possessed.z, t: 0, hit: 0, laugh: 0 };
      m.position.set(e.x, 0, e.z);
      game.scene.add(m);
      EXTRA.list.push(e);
      e.update = function (dt) {
        if (game.state !== 'play' || game.area !== 'facility' || G.notarget || !G.breach) { m.visible = false; return; }
        m.visible = true;
        e.t += dt;
        const d = dist2(e.x, e.z, G.player.x, G.player.z);
        if (d < 22) {
          e.laugh -= dt;
          if (e.laugh <= 0) { e.laugh = rng.range(6, 14); A.laugh106(); G.subtitle('“别害怕——我只是想和你聊聊。”'); }
          if (d > 1.6) {
            const moved = stepToward(e, G.player.x, G.player.z, 1.5, dt, 0.34);
            walkAnim(e, e.t, moved > 0.001 ? 0.35 : 0);
            face(m, e.x, e.z, G.player.x, G.player.z);
          } else m.position.set(e.x, 0, e.z);
          if (d < 1.3 && e.hit <= 0 && !G.god) {
            e.hit = 2.4;
            G.damage(22, 'd035');
            if (!G.dead) G.subtitle('（它把手按在你的脸上）');
          }
          game.achv('a035');
        } else walkAnim(e, e.t, 0);
        e.hit -= dt;
      };
    }

    /* ---------------------------------------------------- SCP-1048 / 1048-A */
    const bear = { mesh: buildBear(T, false), t: 0, cool: 12, on: false };
    bear.mesh.visible = false;
    game.scene.add(bear.mesh);
    EXTRA.bear = bear;
    game.achv1048 = function () { game.achv('a1048'); };
    EXTRA.bear.update = function (dt) {
      if (game.state !== 'play' || game.area !== 'facility' || !G.breach) { bear.mesh.visible = false; return; }
      bear.t += dt;
      if (G.time < 100) return;
      if (bear.cool > 0) { bear.cool -= dt; return; }
      bear.cool = rng.range(45, 95);
      const p = spot(G.player.x, G.player.z, 4, 8);
      if (!p) return;
      bear.mesh.position.set(p.x, 0, p.z);
      bear.mesh.visible = true;
      bear.on = true;
      bear.x = p.x; bear.z = p.z;
      bear.life = 30;
      A.quack();
    };
    EXTRA.bear.check = function (dt) {
      if (!bear.on) return;
      bear.life -= dt;
      if (bear.life <= 0) { bear.on = false; bear.mesh.visible = false; return; }
      const m = bear.mesh;
      m.rotation.y = Math.atan2(G.player.x - m.position.x, G.player.z - m.position.z);
      if (dist2(m.position.x, m.position.z, G.player.x, G.player.z) < 3.2 && !seenByPlayer(m.position.x, m.position.z, 0.7)) {
        bear.on = false;
        m.visible = false;
        game.achv('a1048');
      }
      if (dist2(m.position.x, m.position.z, G.player.x, G.player.z) > 26) { bear.on = false; m.visible = false; }
    };

    /* 1048-A：长满耳朵的熊，靠得太近会被尖叫杀死 */
    const bearA = { mesh: buildBear(T, true), placed: false };
    bearA.mesh.visible = false;
    game.scene.add(bearA.mesh);
    EXTRA.bearA = bearA;
    EXTRA.bearA.update = function (dt) {
      if (game.state !== 'play' || game.area !== 'facility' || G.notarget || !G.breach) { bearA.mesh.visible = false; return; }
      if (!bearA.placed) {
        if (G.time < 150) return;
        bearA.placed = true;
        const cells = [];
        for (const c of L.cells.values()) if (c.visited && !c.special) cells.push(c);
        if (!cells.length) return;
        const c = rng.pick(cells);
        bearA.mesh.position.set(S.worldX(c.c), 0, S.worldZ(c.r));
        bearA.mesh.visible = true;
      }
      const d = dist2(bearA.mesh.position.x, bearA.mesh.position.z, G.player.x, G.player.z);
      bearA.mesh.rotation.y = Math.atan2(G.player.x - bearA.mesh.position.x, G.player.z - bearA.mesh.position.z);
      if (d < 9 && !bearA.warned) { bearA.warned = true; A.whisper939(); G.msg('你听到了耳朵摩擦的声音。', '#c33'); }
      if (d < 2.6 && !G.god) { A.scream1048(); G.die('d1048'); }
    };

    /* ---------------------------------------------------- SCP-513-1 */
    EXTRA.stalker = null;
    game.spawnStalker = function () {
      if (EXTRA.stalker) return;
      const m = build513_1();
      m.visible = false;
      game.scene.add(m);
      const e = { mesh: m, t: 0, life: 100, seenT: 0, x: G.player.x, z: G.player.z - 6 };
      EXTRA.stalker = e;
      EXTRA.list.push(e);
      e.update = function (dt) {
        if (game.state !== 'play' || game.area !== 'facility') { m.visible = false; return; }
        e.t += dt; e.life -= dt;
        if (e.life <= 0) { m.visible = false; EXTRA.stalker = null; return; }
        const d = dist2(e.x, e.z, G.player.x, G.player.z);
        if (d > 34) {
          const p = spot(G.player.x, G.player.z, 12, 20);
          if (p) { e.x = p.x; e.z = p.z; }
        }
        const observed = seenByPlayer(e.x, e.z, 1.9);
        m.visible = observed || d < 12;
        if (observed) {
          e.seenT += dt;
          if (e.seenT > 0.5) {
            e.seenT = 0;
            const p = spot(G.player.x, G.player.z, 6, 11);
            if (p) { e.x = p.x; e.z = p.z; }
            A.sting372();
          }
        } else {
          e.seenT = 0;
          stepToward(e, G.player.x, G.player.z, 2.2, dt, 0.34);
          if (d < 3) {
            G.damage(3.5 * dt, 'd513');
            if (rng.chance(dt * 0.4)) A.whisper939();
          }
        }
        face(m, e.x, e.z, G.player.x, G.player.z);
      };
    };

    /* ---------------------------------------------------- SCP-049-2 感染体 */
    EXTRA.zombies = [];
    (function () {
      const spawns = (W.spawn.zombies || []).slice();
      if (W.rooms && W.rooms.medbay2) {
        spawns.push({ x: W.rooms.medbay2.cx + 2.2, z: W.rooms.medbay2.cz + 2.0 });
      }
      if (W.rooms && W.rooms.medbay) {
        spawns.push({ x: W.rooms.medbay.cx - 2.2, z: W.rooms.medbay.cz + 2.0 });
      }
      for (const sp of spawns) {
        const skin = new THREE.MeshLambertMaterial({ color: 0x8a9a72 });
        const m = humanoid({ skin: skin, torso: new THREE.MeshLambertMaterial({ color: 0xe4e0d4 }) },
          { legLen: 0.95, torsoH: 0.75, armLen: 0.95 });
        const e = {
          mesh: m, x: sp.x, z: sp.z, home: { x: sp.x, z: sp.z }, t: rng.range(0, 6),
          hit: 0, moan: rng.range(2, 8), wander: null
        };
        m.position.set(e.x, 0, e.z);
        game.scene.add(m);
        EXTRA.zombies.push(e);
        e.update = function (dt) {
          if (game.state !== 'play' || game.area !== 'facility' || G.notarget) { m.visible = false; return; }
          m.visible = true;
          e.t += dt; e.hit -= dt; e.moan -= dt;
          const d = dist2(e.x, e.z, G.player.x, G.player.z);
          if (d > 34) { m.visible = false; return; }
          if (e.moan <= 0) { e.moan = rng.range(5, 13); if (d < 20) A.zombie(); }
          if (d < 13) {
            const moved = stepToward(e, G.player.x, G.player.z, 0.85 * (game.keter ? 1.2 : 1), dt, 0.32);
            walkAnim(e, e.t, moved > 0.001 ? 0.28 : 0);
            face(m, e.x, e.z, G.player.x, G.player.z);
            if (d < 1.3 && e.hit <= 0 && !G.god) {
              e.hit = 1.6;
              G.damage(11, 'd0492');
              A.zombie();
            }
          } else {
            if (dist2(e.x, e.z, e.home.x, e.home.z) > 1.5) {
              const moved = stepToward(e, e.home.x, e.home.z, 0.5, dt, 0.32);
              walkAnim(e, e.t, moved > 0.001 ? 0.2 : 0);
            } else walkAnim(e, e.t, 0);
            m.position.set(e.x, 0, e.z);
          }
        };
      }
    })();

    /* ---------------------------------------------------- 房间事件 */
    const EV = (W.events || []).slice();
    const flags = {};
    function inRoom(cx, cz, r) { return dist2(G.player.x, G.player.z, cx, cz) < r; }

    EXTRA.roomEvents = function (dt) {
      if (game.state !== 'play' || game.area !== 'facility') return;
      for (const ev of EV) {
        if (ev.type === 'testroom173') {
          if (ev.done) continue;
          if (inRoom(ev.cx, ev.cz, 3.4) && N.p173.active) {
            ev.done = true;
            A.doorBreak();
            G.subtitle('（玻璃在一声巨响中碎裂——SCP-173 冲进了测试室）');
            N.p173.x = ev.cx + 2.6; N.p173.z = ev.cz;
            N.p173.path = null;
          }
        } else if (ev.type === 'closet173') {
          if (ev.done) continue;
          if (inRoom(ev.cx, ev.cz, 3.6) && N.p173.active) {
            ev.done = true;
            A.neckSnap();
            G.subtitle('（两声颈椎断裂的脆响，从你身后的房间里传来）');
            const sc = spot(ev.cx, ev.cz, 3, 4);
            if (sc) { N.p173.x = sc.x; N.p173.z = sc.z; N.p173.path = null; }
          }
        } else if (ev.type === 'compulsion012') {
          const d = dist2(G.player.x, G.player.z, ev.cx, ev.cz);
          if (d < 5 && !G.worn.scp714 && !G.worn.scp148) {
            G.damage(4.5 * dt, 'd012');
            if (!flags['012']) { flags['012'] = 1; game.achv('a012'); G.subtitle('乐谱……还差一段。你的手腕在发痒。'); }
            $('damageVg').style.opacity = '0.55';
          }
        } else if (ev.type === 'lamps205') {
          const d = dist2(G.player.x, G.player.z, ev.cx, ev.cz);
          if (d < 12) {
            game.achv('a205');
            if (rng.chance(dt * 0.35)) {
              A.sting372();
              $('flash').style.opacity = '0.35';
              setTimeout(function () { $('flash').style.opacity = '0'; }, 120);
              G.damage(5, 'd205');
              G.subtitle('（灯下站着一个不存在的人）');
            }
          }
        } else if (ev.type === 'skull1123') {
          const d = dist2(G.player.x, G.player.z, ev.cx, ev.cz);
          if (d < 4.5) {
            game.achv('a1123');
            if (d < 1.6 && !flags.skull) {
              flags.skull = 1;
              $('flash').style.opacity = '1';
              setTimeout(function () { $('flash').style.opacity = '0'; }, 900);
              G.damage(28, 'd1123');
              G.subtitle('你看见了不属于你的记忆。有人在雪地里数着尸体。');
              A.rumble(2.2, 0.25);
            }
          }
        } else if (ev.type === 'pipes106') {
          if (ev.done) continue;
          if (inRoom(ev.cx, ev.cz, 4) && N.p106.state === 'off' && !N.p106.disabled) {
            ev.done = true;
            const p = W.spawn.pipes106;
            N.p106.x = p.x; N.p106.z = p.z; N.p106.y = 0;
            N.p106.state = 'chase'; N.p106.t = 0; N.p106.unseen = 0;
            N.p106.chaseLimit = 90;
            N.p106.mesh.visible = true;
            A.crack106();
            G.subtitle('（墙壁像皮肤一样裂开，一只手臂伸了出来）');
          }
        } else if (ev.type === 'recursive') {
          const d = dist2(G.player.x, G.player.z, ev.cx, ev.cz);
          if (d < 4.5) {
            game.achv('a970');
            if (ev.armed === undefined) ev.armed = true;
            const goingN = G.lookDir.z < -0.35;
            if (goingN && ev.armed) {
              ev.armed = false;
              ev.loops = (ev.loops || 0) + 1;
              const cell = ev.cell;
              G.player.x = S.worldX(cell.c); G.player.z = S.worldZ(cell.r) + 5.0;
              A.flicker();
              G.subtitle(ev.loops < 3 ? '（走廊……又回到了起点）' : '（第三圈。也许该往回走）');
            } else if (!goingN) {
              ev.armed = true;
            }
          }
        } else if (ev.type === 'buttghost') {
          const d = dist2(G.player.x, G.player.z, ev.cx, ev.cz);
          if (d < 2.2 && !flags.butt) {
            flags.butt = 1;
            A.quack();
            $('flash').style.opacity = '0.2';
            setTimeout(function () { $('flash').style.opacity = '0'; }, 140);
            G.subtitle('“把我的屁股还给我！”');
            G.msg('SCP-789-J', '#7fbf6a');
            game.achv('a789');
          }
        } else if (ev.type === 'offices') {
          if (flags.offices) continue;
          if (inRoom(ev.cx, ev.cz, 6)) {
            flags.offices = 1;
            game.achv('aHarp');
            setTimeout(function () { game.achv('aMaynard'); }, 1500);
          }
        }
      }
      EXTRA.bear.check(dt);
    };

    /* 鸭子 */
    if (W.spawn.duck) {
      const m = buildDuck();
      m.position.set(W.spawn.duck.x, 1.15, W.spawn.duck.z);
      game.scene.add(m);
      const e = { mesh: m, cool: rng.range(3, 9), base: 1.15 };
      EXTRA.list.push({
        update: function (dt) {
          if (game.area !== 'facility') return;
          const d = dist2(m.position.x, m.position.z, G.player.x, G.player.z);
          e.cool -= dt;
          if (d < 10 && e.cool <= 0) { e.cool = rng.range(9, 22); A.quack(); }
          m.rotation.y = Math.atan2(G.player.x - m.position.x, G.player.z - m.position.z);
          m.position.y = e.base + Math.sin(G.time * 2) * 0.03;
        }
      });
    }

    /* ---------------------------------------------------- 统一更新入口 */
    N.updateExtras = function (dt) {
      for (const e of EXTRA.list) if (e.update) e.update(dt);
      for (const e of EXTRA.p939) e.update(dt);
      for (const e of EXTRA.p966) e.update(dt);
      for (const e of EXTRA.zombies) e.update(dt);
      if (EXTRA.p372) EXTRA.p372.update(dt);
      if (EXTRA.stalker) EXTRA.stalker.update(dt);
      EXTRA.bear.update(dt);
      EXTRA.bearA.update(dt);
      EXTRA.roomEvents(dt);
      if (G.infect && G.infect.t049 > 0) {
        G.infect.t049 -= dt;
        if (G.infect.t049 <= 0 && !G.dead) G.die('d049');
      }
      if (G.infect && G.infect.t008 > 0) {
        G.infect.t008 -= dt;
        if (G.infect.t008 <= 0 && !G.dead) G.die('d008');
      }
    };

    /* ----------------------------------------------- 房间追加交互（106 召回） */
    const c106 = W.rooms && W.rooms.chamber106;
    if (c106) {
      const cx = c106.cx, cz = c106.cz;
      W.interact.push({
        x: cx - 2.6, z: cz + 2.6, y: 0.6, r: 2.0,
        hint: function () { return G.recallBait ? '股骨破坏器已启动' : '[E] 放置股骨破坏器（引诱 SCP-106）'; },
        action: function () { G.placeFemur(); }
      });
      W.interact.push({
        x: cx + 2.6, z: cz + 2.6, y: 1.2, r: 2.0,
        hint: function () { return G.contained106 ? '收容平台已锁定' : '[E] 启动召回程序 RP-106-N'; },
        action: function () { G.recall106(); }
      });
    }
    const pj = W.rooms && W.rooms.roompj;
    if (pj) {
      W.interact.push({
        x: pj.cx, z: pj.cz - 1.6, y: 0.6, r: 2.0,
        hint: function () { return '[E] 读取监控屏上的维护通道密码'; },
        action: function () {
          G.tunnelCode = true;
          G.msg('维护通道密码：4471', '#7fbf6a');
          G.subtitle('屏幕上滚动着一串数字：4471');
          game.achv('a372');
        }
      });
    }
    const st = W.rooms && W.rooms.storage939;
    if (st) {
      W.interact.push({
        x: st.cx, z: st.cz + 3.0, y: 0.8, r: 2.0,
        hint: function () { return '[E] 捡起肉块（也许能引开它们）'; },
        action: function () {
          if (G.inv.add('hand')) {
            G.msg('你捡起了一块生肉');
            for (const e of EXTRA.p939) { e.state = 'patrol'; }
          } else G.msg('背包已满');
        }
      });
    }
  };
})(window.SCP);
