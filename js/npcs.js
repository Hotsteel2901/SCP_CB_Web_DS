window.SCP = window.SCP || {};
(function (S) {
  const A = S.audio;

  function build173(T) {
    const grp = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ map: T.skin173 });
    const pts = [];
    pts.push(new THREE.Vector2(0.34, 0));
    pts.push(new THREE.Vector2(0.42, 0.12));
    pts.push(new THREE.Vector2(0.30, 0.5));
    pts.push(new THREE.Vector2(0.42, 1.05));
    pts.push(new THREE.Vector2(0.36, 1.45));
    pts.push(new THREE.Vector2(0.18, 1.62));
    const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), skin);
    grp.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 12), skin);
    head.scale.set(1, 1.15, 0.92);
    head.position.y = 1.86;
    grp.add(head);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.62),
      new THREE.MeshLambertMaterial({ map: T.face173, transparent: true }));
    face.position.set(0, 1.87, 0.3);
    grp.add(face);
    const armG = new THREE.SphereGeometry(0.16, 8, 8);
    const a1 = new THREE.Mesh(armG, skin);
    a1.scale.set(1, 2.2, 1);
    a1.position.set(-0.42, 1.15, 0.05);
    a1.rotation.z = 0.5;
    grp.add(a1);
    const a2 = a1.clone();
    a2.position.x = 0.42;
    a2.rotation.z = -0.5;
    grp.add(a2);
    return grp;
  }

  function humanoid(mats, opts) {
    const o = opts || {};
    const grp = new THREE.Group();
    const sk = mats.skin;
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, o.legLen || 0.95, 0.22), sk);
    legL.position.set(-0.14, (o.legLen || 0.95) / 2, 0);
    const legR = legL.clone(); legR.position.x = 0.14;
    grp.add(legL); grp.add(legR);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(o.torsoW || 0.52, o.torsoH || 0.72, 0.28), mats.torso || sk);
    torso.position.y = (o.legLen || 0.95) + (o.torsoH || 0.72) / 2;
    grp.add(torso);
    const armGeo = new THREE.BoxGeometry(0.14, o.armLen || 0.78, 0.16);
    armGeo.translate(0, -(o.armLen || 0.78) / 2, 0);
    const armL = new THREE.Mesh(armGeo, sk);
    armL.position.set(-(o.torsoW || 0.52) / 2 - 0.09, (o.legLen || 0.95) + (o.torsoH || 0.72) - 0.06, 0);
    const armR = armL.clone(); armR.position.x = (o.torsoW || 0.52) / 2 + 0.09;
    grp.add(armL); grp.add(armR);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, o.headH || 0.34, 0.3), sk);
    head.position.y = (o.legLen || 0.95) + (o.torsoH || 0.72) + (o.headH || 0.34) / 2 + 0.05;
    grp.add(head);
    grp.userData = { legL, legR, armL, armR, head, torso };
    return grp;
  }

  function build106(T) {
    const skin = new THREE.MeshLambertMaterial({ map: T.skin106, transparent: true, opacity: 0.96 });
    const g = humanoid({ skin }, { legLen: 1.05, torsoH: 0.8, armLen: 0.9 });
    g.userData.head.scale.set(1, 1.2, 1);
    return g;
  }

  function build096(T) {
    const skin = new THREE.MeshLambertMaterial({ map: T.skin096 });
    const g = humanoid({ skin }, { legLen: 1.15, torsoH: 0.85, armLen: 1.35, torsoW: 0.5, headH: 0.42 });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4),
      new THREE.MeshLambertMaterial({ map: T.face096 }));
    face.position.set(0, 2.2, 0.16);
    g.add(face);
    g.userData.face = face;
    return g;
  }

  function buildDClass() {
    const skin = new THREE.MeshLambertMaterial({ color: 0xc2c2b8 });
    const torso = new THREE.MeshLambertMaterial({ color: 0xb85c1e });
    return humanoid({ skin, torso }, {});
  }

  S.createNpcs = function (game) {
    const T = game.TEX;
    const W = game.world;
    const L = game.layout;
    const N = {};

    N.p173 = {
      mesh: build173(T),
      x: W.spawn.p173.x, z: W.spawn.p173.z,
      active: false, scripted: true, speed: 23,
      path: null, pathT: 0, repath: 0,
      scrape: null, moving: false
    };
    N.p173.mesh.position.set(N.p173.x, 0, N.p173.z);
    game.scene.add(N.p173.mesh);

    N.p106 = {
      mesh: build106(T),
      x: 0, z: 0, y: -3, speed: 4.2,
      state: 'off', t: 0,
      nextPuddle: game.rng.range(170, 270),
      puddle: null, puddleLife: 0,
      chaseLimit: 0, unseen: 0,
      postCooldown: 0, disabled: false, announced: false
    };
    N.p106.mesh.visible = false;
    game.scene.add(N.p106.mesh);

    N.p096 = {
      mesh: build096(T),
      x: W.spawn.p096 ? W.spawn.p096.x : 0,
      z: W.spawn.p096 ? W.spawn.p096.z : 0,
      state: 'idle', t: 0, yaw: game.rng.range(0, 6.28),
      path: null, repath: 0, sob: null, scream: null, stun: 0
    };
    N.p096.mesh.position.set(N.p096.x, 0, N.p096.z);
    N.p096.mesh.rotation.y = N.p096.yaw;
    N.p096.sitPose = true;
    N.p096.mesh.scale.y = 0.62;
    N.p096.mesh.rotation.x = 0.5;
    game.scene.add(N.p096.mesh);

    N.dclass = [];
    for (let i = 0; i < 2; i++) {
      const m = buildDClass();
      const px = W.spawn.chamber.x + (i === 0 ? -1.2 : 1.2);
      const pz = W.spawn.chamber.z - 0.6;
      m.position.set(px, 0, pz);
      m.rotation.y = Math.PI;
      game.scene.add(m);
      N.dclass.push({ mesh: m, dead: false, x: px, z: pz });
    }

    N.pass173 = function (door) {
      if (door.broken) return true;
      return door.open || door.amount > 0.7;
    };
    N.pass096 = function (door) { return true; };

    function cellOf(x, z) { return L.get(S.colOf(x), S.rowOf(z)); }

    N.update173 = function (dt) {
      const p = N.p173;
      const g = game;
      if (!p.active || g.area !== 'facility') {
        p.mesh.position.set(p.x, 0, p.z);
        if (p.scrape) p.scrape.set(0, 0.1);
        return;
      }
      const px = g.player.x, pz = g.player.z;
      let d = S.dist2d(p.x, p.z, px, pz);
      const observed = g.canSee173();
      const playing = !g.dead && g.state === 'play' && !g.notarget;
      let moved = false;

      function teleportCloser() {
        const myCell = cellOf(p.x, p.z);
        const plCell = cellOf(px, pz);
        if (!myCell || !plCell) return;
        const minKeep = g.keter ? 7.5 : 15.5;
        let best = null, bestD = d - 0.6;
        for (let dc = -1; dc <= 1; dc++) {
          for (let dr = -1; dr <= 1; dr++) {
            if (!dc && !dr) continue;
            const cell = L.get(myCell.c + dc, myCell.r + dr);
            if (!cell || cell === plCell) continue;
            const tx = S.worldX(cell.c), tz = S.worldZ(cell.r);
            const dp = S.dist2d(tx, tz, px, pz);
            if (dp < minKeep) continue;
            if (S.losClear(L, px, pz, tx, tz, 0.25)) continue;
            if (dp < bestD) { bestD = dp; best = { tx, tz }; }
          }
        }
        if (best) { p.x = best.tx; p.z = best.tz; p.path = null; }
      }

      function teleportFar() {
        const plCell = cellOf(px, pz);
        if (!plCell) return;
        const cands = [];
        for (let dc = -3; dc <= 3; dc++) {
          for (let dr = -3; dr <= 3; dr++) {
            const ring = Math.max(Math.abs(dc), Math.abs(dr));
            if (ring < 2 || ring > 3) continue;
            const cell = L.get(plCell.c + dc, plCell.r + dr);
            if (!cell) continue;
            const tx = S.worldX(cell.c), tz = S.worldZ(cell.r);
            if (S.losClear(L, px, pz, tx, tz, 0.25)) continue;
            cands.push({ tx, tz });
          }
        }
        if (cands.length) {
          const t = cands[Math.floor(g.rng.next() * cands.length)];
          p.x = t.tx; p.z = t.tz; p.path = null;
        }
      }

      if (playing && !observed && d < 26) {
        p.repath -= dt;
        const myCell = cellOf(p.x, p.z);
        const plCell = cellOf(px, pz);
        if (myCell && plCell) {
          if (p.repath <= 0 || !p.path) {
            p.path = S.findPath(L, myCell, plCell, N.pass173);
            if (p.path && p.path.length > 1) p.path.shift();
            p.repath = 0.6;
          }
          let tx = px, tz = pz;
          if (p.path && p.path.length && myCell !== plCell) {
            const nxt = p.path[0];
            tx = S.worldX(nxt.c); tz = S.worldZ(nxt.r);
            if (S.dist2d(p.x, p.z, tx, tz) < 1.2) {
              p.path.shift();
              if (p.path.length) { tx = S.worldX(p.path[0].c); tz = S.worldZ(p.path[0].r); }
              else { tx = px; tz = pz; }
            }
          }
          const spd = p.speed;
          const dx = tx - p.x, dz = tz - p.z;
          const dd = Math.hypot(dx, dz);
          if (dd > 0.05) {
            let remaining = Math.min(spd * dt, dd, 4);
            const ux = dx / dd, uz = dz / dd;
            let nx = p.x, nz = p.z;
            while (remaining > 0.0001) {
              const st = Math.min(0.2, remaining);
              remaining -= st;
              const res = S.resolveCircle(nx + ux * st, nz + uz * st, 0.33, W.collidersNear(nx, nz, 'facility'));
              nx = res.x; nz = res.z;
            }
            const npd = S.dist2d(nx, nz, px, pz);
            if (npd < 0.5 && npd > 0.0001) {
              const k = 0.5 - npd;
              nx += (nx - px) / npd * k;
              nz += (nz - pz) / npd * k;
            }
            if (Math.hypot(nx - p.x, nz - p.z) > 0.005) moved = true;
            p.x = nx; p.z = nz;
          }
        }
        if (g.keter) {
          p.breakT = (p.breakT === undefined ? g.rng.range(5, 10) : p.breakT - dt);
          if (p.breakT <= 0) {
            p.breakT = g.rng.range(8, 16);
            if ((p.breaks || 0) < 5) {
              for (const door of L.doors) {
                if (door.broken || door.open || door.locked || door.checkpoint || door.level > 0) continue;
                if (Math.abs(door.x - p.x) < 2.4 && Math.abs(door.z - p.z) < 2.4) {
                  door.broken = true; door.open = true; door.amount = 1;
                  W.updateDoor(door);
                  S.audio.doorBreak();
                  g.subtitle('（金属门被硬生生撞开的巨响）');
                  p.breaks = (p.breaks || 0) + 1;
                  p.path = null;
                  break;
                }
              }
            }
          }
        }
        d = S.dist2d(p.x, p.z, px, pz);
        if (d < 0.9 && !g.introLock173 && S.losClear(L, px, pz, p.x, p.z, 0.25)) {
          g.kill173();
        }
      }

      if (playing) {
        p.reloc = (p.reloc === undefined ? 3 : p.reloc - dt);
        if (p.reloc <= 0) {
          p.reloc = g.rng.range(1.1, 2.2);
          if (d > 48) {
            if (g.rng.chance(0.45)) teleportFar();
          } else if (d > 26) {
            if (g.rng.chance(0.5)) teleportCloser();
          }
        }
      }

      p.moving = moved;
      if (p.scrape) p.scrape.set(moved ? S.clamp(1.6 - d / 18, 0, 0.5) : 0, 0.08);
      p.mesh.position.set(p.x, 0, p.z);
      p.mesh.rotation.y = Math.atan2(px - p.x, pz - p.z);
    };

    N.removePuddle106 = function () {
      const p = N.p106;
      if (p.puddle) { W.removePuddle(p.puddle); p.puddle = null; }
    };

    N.spawnPuddle106 = function (force) {
      const p = N.p106, g = game;
      if (p.puddle) N.removePuddle106();
      let x = 0, z = 0;
      if (force) {
        const fx = g.player.x + g.lookDir.x * 4.5;
        const fz = g.player.z + g.lookDir.z * 4.5;
        if (W.isWalkable(fx, fz, 0.55) && S.dist2d(fx, fz, g.player.x, g.player.z) > 2.5) {
          x = fx; z = fz;
        } else {
          for (let i = 0; i < 24; i++) {
            const a = i / 24 * Math.PI * 2;
            const tx = g.player.x + Math.cos(a) * 4;
            const tz = g.player.z + Math.sin(a) * 4;
            if (W.isWalkable(tx, tz, 0.55)) { x = tx; z = tz; break; }
          }
        }
        if (!x && !z) return false;
      } else {
        const pc = S.colOf(g.player.x), pr = S.rowOf(g.player.z);
        const cands = [];
        for (let dc = -3; dc <= 3; dc++) {
          for (let dr = -3; dr <= 3; dr++) {
            const ring = Math.max(Math.abs(dc), Math.abs(dr));
            if (ring > 3) continue;
            const cell = L.get(pc + dc, pr + dr);
            if (!cell || (cell.special && cell.special.type === 'chamber173')) continue;
            const cx = S.worldX(cell.c), cz = S.worldZ(cell.r);
            for (let k = 0; k < 6; k++) {
              const tx = cx + g.rng.range(-3.1, 3.1);
              const tz = cz + g.rng.range(-3.1, 3.1);
              if (S.dist2d(tx, tz, g.player.x, g.player.z) < 4.5) continue;
              if (!W.isWalkable(tx, tz, 0.55)) continue;
              cands.push({ x: tx, z: tz, ring });
            }
          }
        }
        if (!cands.length) return false;
        const weights = cands.map(c => c.ring === 0 ? 4 : c.ring === 1 ? 3 : c.ring === 2 ? 1.6 : 0.9);
        let total = 0;
        for (const w of weights) total += w;
        let r = g.rng.next() * total;
        let pick = cands[0];
        for (let i = 0; i < cands.length; i++) {
          r -= weights[i];
          if (r <= 0) { pick = cands[i]; break; }
        }
        x = pick.x; z = pick.z;
      }
      p.puddle = W.addPuddle(x, z, g.rng.range(1.8, 2.5));
      p.x = x; p.z = z;
      p.state = 'puddle';
      p.t = 0;
      p.puddleLife = force ? 9999 : g.rng.range(45, 80);
      return true;
    };

    N.reset106 = function (cooldown) {
      const p = N.p106, g = game;
      N.removePuddle106();
      p.state = 'off';
      p.mesh.visible = false;
      p.y = -3;
      p.t = 0;
      p.unseen = 0;
      p.nextPuddle = cooldown !== undefined
        ? cooldown
        : (p.disabled ? Infinity : (p.postCooldown > 0 ? p.postCooldown : g.rng.range(190, 320)));
      p.postCooldown = 0;
    };

    N.update106 = function (dt) {
      const p = N.p106, g = game;
      const inPlay = g.state === 'play' && !g.dead && !g.notarget;
      const inFacility = g.area === 'facility';

      if (p.state === 'off') {
        p.mesh.visible = false;
        if (!inPlay || !inFacility || !g.breach || p.disabled) return;
        p.t += dt;
        if (p.t >= p.nextPuddle) {
          if (N.spawnPuddle106(false)) {
            p.t = 0;
          } else {
            p.t = 0;
            p.nextPuddle = g.rng.range(8, 16);
          }
        }
        return;
      }

      if (p.state === 'puddle') {
        if (!inPlay || !inFacility || !g.breach || p.disabled) { N.reset106(); return; }
        p.t += dt;
        const pu = p.puddle;
        if (pu) {
          pu.t += dt;
          const s = 1 + Math.sin(pu.t * 1.8) * 0.05;
          pu.mesh.scale.set(s, s, 1);
          pu.mesh.rotation.z += dt * 0.05;
        }
        const dp = S.dist2d(g.player.x, g.player.z, p.x, p.z);
        if (dp < 6 && g.rng.chance(dt * 0.6)) A.drip106();
        if (dp < (pu ? pu.size / 2 + 0.35 : 1.2)) {
          p.y = -2.6;
          p.state = 'rising';
          p.t = 0;
          A.crack106();
          setTimeout(() => { if (p.state === 'rising') A.laugh106(); }, 700);
          g.subtitle('（脚下的地面渗出一滩黑色黏液…有什么东西正在爬出来）');
          W.addDecal(T.corrosion, p.x + g.rng.range(-0.9, 0.9), p.z + g.rng.range(-0.9, 0.9), g.rng.range(1.2, 2.2));
          if (!p.announced) {
            p.announced = true;
            g.announce('Warning. SCP One-Zero-Six has breached containment.', 'SCP-106 已突破收容。');
          }
          return;
        }
        if (p.t > p.puddleLife) N.reset106();
        return;
      }

      if (p.state === 'rising') {
        if (!inFacility) return;
        p.t += dt;
        p.y += dt * 1.25;
        const u = p.mesh.userData;
        const sw = Math.sin(p.t * 2.6) * 0.2;
        u.armL.rotation.x = sw; u.armR.rotation.x = -sw;
        if (p.y >= 0) {
          p.y = 0;
          p.state = 'chase';
          p.t = 0;
          p.unseen = 0;
          p.chaseLimit = g.rng.range(35, 50);
        }
      } else if (p.state === 'chase') {
        if (!inFacility) {
          p.state = 'sinking';
          p.t = 0;
          return;
        }
        p.t += dt;
        const px = g.player.x, pz = g.player.z;
        const dx = px - p.x, dz = pz - p.z;
        const d = Math.hypot(dx, dz);
        const spd = p.speed * (g.keter ? 1.12 : 1);
        if (d > 0.01) {
          p.x += dx / d * spd * dt;
          p.z += dz / d * spd * dt;
        }
        p.mesh.rotation.y = Math.atan2(dx, dz);
        const seen = g.canSee106();
        if (seen) p.unseen = Math.max(0, p.unseen - dt * 0.6);
        else p.unseen += dt;
        if ((p.unseen > p.chaseLimit || p.t > 120) && d > 5) {
          p.state = 'sinking';
          p.t = 0;
        }
        if (d < 1.05 && !g.dead && !g.notarget) {
          p.state = 'sinking';
          p.t = 0;
          p.postCooldown = g.rng.range(280, 400);
          g.toPocketDimension();
          return;
        }
        if (g.rng.chance(dt * 0.08)) W.addDecal(T.corrosion, p.x, p.z, 1.2);
        if (g.rng.chance(dt * 0.05)) A.laugh106();
      } else if (p.state === 'sinking') {
        if (!inFacility) { N.reset106(); return; }
        p.t += dt;
        p.y -= dt * 1.0;
        if (p.y <= -2.6) {
          N.reset106();
          return;
        }
      }

      const bob = Math.sin(p.t * 6) * 0.03;
      p.mesh.visible = true;
      p.mesh.position.set(p.x, p.y + bob, p.z);
      const u = p.mesh.userData;
      const sw = p.state === 'chase' ? Math.sin(p.t * 3.4) * 0.35 : 0;
      u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
      u.armL.rotation.x = sw * 0.5; u.armR.rotation.x = -sw * 0.5;
    };

    N.update096 = function (dt) {
      const p = N.p096;
      const g = game;
      if (!W.spawn.p096) return;
      p.t += dt;
      const px = g.player.x, pz = g.player.z;
      const d = S.dist2d(p.x, p.z, px, pz);
      if (p.state === 'idle') {
        if (p.sob) p.sob.set(S.clamp(0.5 - d / 26, 0, 0.35), 0.2);
        if (g.state === 'play' && g.area === 'facility' && !g.blinking && !g.notarget && d < 24) {
          const dirX = (p.x - px) / d, dirZ = (p.z - pz) / d;
          const dot = dirX * g.lookDir.x + dirZ * g.lookDir.z;
          if (dot > 0.55 && S.losClear(L, px, pz, p.x, p.z, 0.25)) {
            p.seen = (p.seen || 0) + dt;
            if (p.seen > 0.25) {
              p.state = 'enrage'; p.t = 0;
              p.mesh.scale.y = 1;
              p.mesh.rotation.x = 0;
              S.audio.scream096Start();
              if (p.sob) p.sob.set(0, 0.1);
              g.subtitle('你看到了它的脸。');
              g.msg('SCP-096 已被触发', '#c33');
            }
          } else p.seen = 0;
        } else p.seen = 0;
      } else if (p.state === 'enrage') {
        p.mesh.rotation.y += Math.sin(p.t * 22) * 0.06;
        const u = p.mesh.userData;
        u.armL.rotation.x = -2.6 + Math.sin(p.t * 14) * 0.2;
        u.armR.rotation.x = -2.6 - Math.sin(p.t * 14) * 0.2;
        if (p.t > 11) {
          p.state = 'chase'; p.t = 0;
          p.scream = S.audio.makeScream();
          p.scream.set(0.32, 0.4);
          g.msg('跑。', '#c33');
        }
      } else if (p.state === 'chase') {
        if (p.stun > 0) {
          p.stun -= dt;
        } else {
          p.repath -= dt;
          const myCell = cellOf(p.x, p.z);
          const plCell = cellOf(px, pz);
          if (myCell && plCell && g.area === 'facility') {
            if (p.repath <= 0 || !p.path) {
              p.path = S.findPath(L, myCell, plCell, N.pass096);
              if (p.path && p.path.length > 1) p.path.shift();
              p.repath = 0.5;
            }
            let tx = px, tz = pz;
            if (p.path && p.path.length && myCell !== plCell) {
              const nxt = p.path[0];
              tx = S.worldX(nxt.c); tz = S.worldZ(nxt.r);
              if (S.dist2d(p.x, p.z, tx, tz) < 1.0) {
                p.path.shift();
                if (p.path.length) { tx = S.worldX(p.path[0].c); tz = S.worldZ(p.path[0].r); }
                else { tx = px; tz = pz; }
              }
            }
            const spd = 8.6;
            const dx = tx - p.x, dz = tz - p.z;
            const dd = Math.hypot(dx, dz);
            if (dd > 0.01) {
              p.x += dx / dd * Math.min(spd * dt, dd);
              p.z += dz / dd * Math.min(spd * dt, dd);
            }
            p.mesh.rotation.y = Math.atan2(px - p.x, pz - p.z);
            for (const door of L.doors) {
              if (!door.broken && door.amount < 0.9 && Math.abs(door.x - p.x) < 1.6 && Math.abs(door.z - p.z) < 1.6) {
                door.broken = true; door.amount = 1; door.open = true;
                W.updateDoor(door);
                S.audio.doorBreak();
              }
            }
            if (W.tesla && Math.abs(p.z - W.tesla.z) < 1 && Math.abs(p.x - W.tesla.x) < 2 && W.tesla.state === 'zap') {
              p.stun = 4;
            }
            const u = p.mesh.userData;
            const sw = Math.sin(p.t * 14) * 0.7;
            u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
            u.armL.rotation.x = -2.4; u.armR.rotation.x = -2.4;
            if (d < 1.15 && !g.dead && !g.notarget) g.kill096();
          }
        }
        if (p.scream) p.scream.set(S.clamp(0.5 - d / 40, 0.05, 0.4), 0.3);
        if (g.rng.chance(dt * 0.5)) S.audio.heartbeat();
      }
      p.mesh.position.set(p.x, 0, p.z);
    };

    N.killDClass = function (i) {
      const dc = N.dclass[i];
      if (!dc || dc.dead) return;
      dc.dead = true;
      dc.mesh.rotation.x = -Math.PI / 2;
      dc.mesh.position.y = 0.25;
      dc.mesh.position.x = dc.x + game.rng.range(-0.5, 0.5);
      dc.mesh.position.z = dc.z + game.rng.range(-0.3, 0.6);
      W.addDecal(T.blood, dc.mesh.position.x, dc.mesh.position.z, 2.4);
      S.audio.neckSnap();
    };

    return N;
  };
})(window.SCP);
