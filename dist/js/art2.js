/* art2.js — 追加的程序化贴图与物品图标（无外部素材） */
window.SCP = window.SCP || {};
(function (S) {
  function cv(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return [c, c.getContext('2d')];
  }
  function tex(c) {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  }
  function noise(x, w, h, a, n) {
    for (let i = 0; i < n; i++) {
      const g = Math.floor(Math.random() * 255);
      x.fillStyle = 'rgba(' + g + ',' + g + ',' + g + ',' + a + ')';
      x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
  }
  function grain(x, w, h, base, spread, n) {
    for (let i = 0; i < n; i++) {
      const g = base + Math.random() * spread;
      x.fillStyle = 'rgba(' + (g | 0) + ',' + (g | 0) + ',' + (g | 0) + ',' + (0.06 + Math.random() * 0.2) + ')';
      x.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 1 + Math.random() * 4);
    }
  }

  const baseTex = S.buildTextures;
  S.buildTextures = function () {
    const T = baseTex();

    /* --- 高清化基础环境贴图（512px）：更接近原作的混凝土 / 金属质感 --- */
    function panel(w, h, base, grid, lineCol, opt) {
      const o = opt || {};
      const [c, x] = cv(w, h);
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      const cell = w / grid;
      for (let i = 0; i < grid; i++) {
        for (let j = 0; j < grid; j++) {
          const v = -8 + Math.random() * 16;
          x.fillStyle = 'rgba(' + (v > 0 ? '255,255,255,' : '0,0,0,') + Math.abs(v) / 200 + ')';
          x.fillRect(i * cell + 2, j * cell + 2, cell - 4, cell - 4);
          if (o.bevel) {
            x.strokeStyle = 'rgba(255,255,255,.10)';
            x.lineWidth = 2;
            x.strokeRect(i * cell + 4, j * cell + 4, cell - 8, cell - 8);
            x.strokeStyle = 'rgba(0,0,0,.22)';
            x.beginPath();
            x.moveTo(i * cell + 4, j * cell + cell - 4);
            x.lineTo(i * cell + cell - 4, j * cell + cell - 4);
            x.lineTo(i * cell + cell - 4, j * cell + 4);
            x.stroke();
          }
          if (o.bolts) {
            x.fillStyle = 'rgba(20,20,22,.45)';
            for (const o2 of [[8, 8], [cell - 10, 8], [8, cell - 10], [cell - 10, cell - 10]]) {
              x.beginPath();
              x.arc(i * cell + o2[0], j * cell + o2[1], 2.4, 0, 7);
              x.fill();
            }
          }
        }
      }
      x.strokeStyle = lineCol; x.lineWidth = 3;
      for (let i = 0; i <= grid; i++) {
        x.beginPath(); x.moveTo(i * cell, 0); x.lineTo(i * cell, h); x.stroke();
        x.beginPath(); x.moveTo(0, i * cell); x.lineTo(w, i * cell); x.stroke();
      }
      grain(x, w, h, o.grain || 90, o.spread || 70, o.dots || 5000);
      for (let i = 0; i < (o.stains || 26); i++) {
        x.fillStyle = 'rgba(38,32,24,' + (0.02 + Math.random() * 0.06) + ')';
        x.beginPath();
        x.ellipse(Math.random() * w, Math.random() * h, 4 + Math.random() * 22, 3 + Math.random() * 16, Math.random() * 3, 0, 7);
        x.fill();
      }
      if (o.scuff) {
        for (let i = 0; i < 60; i++) {
          x.strokeStyle = 'rgba(30,28,24,' + (0.05 + Math.random() * 0.12) + ')';
          x.lineWidth = 1 + Math.random() * 2;
          const x0 = Math.random() * w, y0 = h * (0.6 + Math.random() * 0.4);
          x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + (Math.random() - 0.5) * 40, y0 - Math.random() * 90); x.stroke();
        }
      }
      if (o.rust) {
        for (let i = 0; i < 40; i++) {
          x.strokeStyle = 'rgba(96,54,24,' + (0.05 + Math.random() * 0.16) + ')';
          x.lineWidth = 1 + Math.random() * 4;
          const x0 = Math.random() * w, y0 = Math.random() * h * 0.5;
          x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + (Math.random() - 0.5) * 12, y0 + 40 + Math.random() * 150); x.stroke();
        }
      }
      noise(x, w, h, 0.05, 2600);
      return tex(c);
    }
    T.lczWall = panel(512, 512, '#8f897c', 2, '#514c44', { bevel: true, bolts: true, scuff: true, stains: 26, grain: 132, spread: 64 });
    T.lczFloor = panel(512, 512, '#6f6d67', 4, '#4c4a45', { bevel: true, scuff: true, stains: 30, grain: 108, spread: 50, dots: 11000 });
    T.hczWall = panel(512, 512, '#2b3037', 2, '#171b21', { bevel: true, bolts: true, rust: true, stains: 20, grain: 40, spread: 36, dots: 5200 });
    T.hczFloor = panel(512, 512, '#2b3037', 4, '#1d2229', { bevel: true, rust: true, stains: 30, grain: 32, spread: 40, dots: 5200 });
    T.ezWall = (function () {
      const [c, x] = cv(512, 512);
      x.fillStyle = '#d6cfbf'; x.fillRect(0, 0, 512, 512);
      x.fillStyle = 'rgba(120,130,140,.9)'; x.fillRect(0, 300, 512, 212);
      x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(0, 296, 512, 6);
      x.fillStyle = 'rgba(20,22,26,.5)'; x.fillRect(0, 505, 512, 7);
      for (let i = 0; i < 6; i++) {
        x.fillStyle = 'rgba(60,66,74,.35)';
        x.fillRect(i * 85 + 4, 304, 3, 204);
      }
      grain(x, 512, 512, 150, 70, 4000);
      noise(x, 512, 512, 0.04, 2200);
      return tex(c);
    })();
    T.ezFloor = (function () {
      const [c, x] = cv(512, 512);
      x.fillStyle = '#4a5058'; x.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const v = Math.random() * 18;
        x.fillStyle = 'rgba(' + (60 + v | 0) + ',' + (66 + v | 0) + ',' + (74 + v | 0) + ',1)';
        x.fillRect(i * 128 + 2, j * 128 + 2, 124, 124);
      }
      x.strokeStyle = 'rgba(20,22,26,.6)'; x.lineWidth = 3;
      for (let i = 0; i <= 4; i++) {
        x.beginPath(); x.moveTo(i * 128, 0); x.lineTo(i * 128, 512); x.stroke();
        x.beginPath(); x.moveTo(0, i * 128); x.lineTo(512, i * 128); x.stroke();
      }
      grain(x, 512, 512, 60, 60, 9000);
      for (let i = 0; i < 24; i++) {
        x.fillStyle = 'rgba(20,18,16,' + (0.04 + Math.random() * 0.1) + ')';
        x.beginPath(); x.ellipse(Math.random() * 512, Math.random() * 512, 8 + Math.random() * 40, 6 + Math.random() * 24, 0, 0, 7); x.fill();
      }
      return tex(c);
    })();
    T.ceil = (function () {
      const [c, x] = cv(512, 512);
      x.fillStyle = '#8f9296'; x.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        x.fillStyle = 'rgba(' + (150 + Math.random() * 20 | 0) + ',' + (152 + Math.random() * 20 | 0) + ',' + (156 + Math.random() * 18 | 0) + ',1)';
        x.fillRect(i * 256 + 4, j * 256 + 4, 248, 248);
        for (let k = 0; k < 900; k++) {
          const g = 110 + Math.random() * 90;
          x.fillStyle = 'rgba(' + (g | 0) + ',' + (g | 0) + ',' + (g | 0) + ',.5)';
          x.fillRect(i * 256 + 8 + Math.random() * 240, j * 256 + 8 + Math.random() * 240, 2, 2);
        }
      }
      x.fillStyle = '#4a4d52';
      for (let i = 0; i <= 2; i++) {
        x.fillRect(i * 256 - 3, 0, 6, 512);
        x.fillRect(0, i * 256 - 3, 512, 6);
      }
      return tex(c);
    })();
    T.door = panel(256, 256, '#4a5058', 1, '#2c3138', { bevel: true, bolts: true, rust: true, stains: 12, grain: 60, spread: 50, dots: 1800 });
    T.doorBig = panel(256, 256, '#3d434b', 1, '#252a30', { bevel: true, bolts: true, rust: true, stains: 14, grain: 50, spread: 44, dots: 1800 });

    /* --- 更接近原作的 SCP-173 面部：空洞眼窝 + 喷漆痕迹 --- */
    {
      const [c, x] = cv(256, 256);
      x.clearRect(0, 0, 256, 256);
      /* 眼窝：喷漆形成的深色空洞，边缘带腐蚀色 */
      for (const ex of [86, 170]) {
        const grd = x.createRadialGradient(ex, 106, 6, ex, 106, 34);
        grd.addColorStop(0, 'rgba(6,5,4,.98)');
        grd.addColorStop(0.55, 'rgba(24,18,14,.9)');
        grd.addColorStop(0.8, 'rgba(70,40,26,.45)');
        grd.addColorStop(1, 'rgba(90,60,40,0)');
        x.fillStyle = grd;
        x.beginPath(); x.ellipse(ex, 106, 34, 40, 0, 0, 7); x.fill();
        x.fillStyle = 'rgba(10,8,6,.95)';
        x.beginPath(); x.ellipse(ex, 106, 19, 26, 0, 0, 7); x.fill();
        /* 下坠的锈色痕迹 */
        x.fillStyle = 'rgba(96,36,22,.5)';
        x.beginPath(); x.ellipse(ex + 2, 140, 9, 12, 0, 0, 7); x.fill();
        x.fillStyle = 'rgba(96,36,22,.28)';
        x.fillRect(ex - 4, 142, 8, 22 + Math.random() * 18);
      }
      /* 嘴：横向裂口 + 竖向齿痕 */
      const mg = x.createRadialGradient(128, 190, 4, 128, 190, 52);
      mg.addColorStop(0, 'rgba(8,6,5,.98)');
      mg.addColorStop(0.7, 'rgba(20,14,10,.75)');
      mg.addColorStop(1, 'rgba(40,26,16,0)');
      x.fillStyle = mg;
      x.beginPath(); x.ellipse(128, 190, 52, 24, 0, 0, 7); x.fill();
      x.fillStyle = 'rgba(6,5,4,.95)';
      x.beginPath();
      x.moveTo(88, 182); x.lineTo(168, 182); x.lineTo(154, 202); x.lineTo(102, 202);
      x.closePath(); x.fill();
      x.fillStyle = 'rgba(150,140,120,.55)';
      for (let i = 0; i < 7; i++) x.fillRect(94 + i * 10, 183, 4, 15 + (i % 2) * 4);
      /* 喷漆飞溅与划痕 */
      for (let i = 0; i < 40; i++) {
        x.fillStyle = 'rgba(20,16,12,' + (0.05 + Math.random() * 0.18) + ')';
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 12, 2 + Math.random() * 9, Math.random() * 3, 0, 7);
        x.fill();
      }
      x.strokeStyle = 'rgba(48,36,26,.35)'; x.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        x.beginPath();
        x.moveTo(Math.random() * 256, Math.random() * 256);
        x.lineTo(Math.random() * 256, Math.random() * 256);
        x.stroke();
      }
      T.face173 = tex(c);
    }

    /* --- SCP-049 瘟疫医生 --- */
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#141416'; x.fillRect(0, 0, 256, 256);
      grain(x, 256, 256, 20, 40, 2600);
      x.fillStyle = 'rgba(70,66,60,.35)';
      for (let i = 0; i < 30; i++) {
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 10 + Math.random() * 30, 4 + Math.random() * 10, Math.random() * 3, 0, 7);
        x.fill();
      }
      T.skin049 = tex(c);
    }
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#d8d2c2'; x.fillRect(0, 0, 256, 256);
      grain(x, 256, 256, 170, 70, 1800);
      x.fillStyle = '#5a6a4a';
      x.beginPath(); x.ellipse(128, 150, 40, 28, 0, 0, 7); x.fill();
      x.fillStyle = '#1a1a16';
      x.beginPath(); x.ellipse(52, 96, 22, 16, 0, 0, 7); x.fill();
      x.beginPath(); x.ellipse(204, 96, 22, 16, 0, 0, 7); x.fill();
      T.mask049 = tex(c);
    }

    /* --- SCP-939 红色肉块 --- */
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#6a1a18'; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 260; i++) {
        const r = 70 + Math.random() * 90;
        x.fillStyle = 'rgba(' + (r | 0) + ',' + (r * 0.25 | 0) + ',' + (r * 0.22 | 0) + ',' + (0.2 + Math.random() * 0.5) + ')';
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 6 + Math.random() * 26, 5 + Math.random() * 18, Math.random() * 3, 0, 7);
        x.fill();
      }
      x.fillStyle = 'rgba(20,4,4,.7)';
      for (let i = 0; i < 40; i++) {
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 10, 3 + Math.random() * 10, 0, 0, 7);
        x.fill();
      }
      noise(x, 256, 256, 0.12, 1400);
      T.skin939 = tex(c);
    }

    /* --- SCP-966 近乎透明的轮廓 --- */
    {
      const [c, x] = cv(128, 128);
      x.clearRect(0, 0, 128, 128);
      x.strokeStyle = 'rgba(210,230,220,.55)'; x.lineWidth = 2;
      for (let i = 0; i < 26; i++) {
        x.beginPath();
        x.moveTo(Math.random() * 128, Math.random() * 128);
        x.lineTo(Math.random() * 128, Math.random() * 128);
        x.stroke();
      }
      x.fillStyle = 'rgba(180,220,200,.18)';
      x.beginPath(); x.ellipse(64, 60, 26, 44, 0, 0, 7); x.fill();
      T.skin966 = tex(c);
    }

    /* --- SCP-1048 建造者熊 --- */
    {
      const [c, x] = cv(128, 128);
      x.fillStyle = '#6b5136'; x.fillRect(0, 0, 128, 128);
      grain(x, 128, 128, 70, 60, 900);
      x.fillStyle = 'rgba(40,28,18,.5)';
      for (let i = 0; i < 8; i++) {
        x.beginPath();
        x.ellipse(20 + i * 13, 64, 6, 40, 0.4, 0, 7);
        x.fill();
      }
      T.bear = tex(c);
    }
    {
      const [c, x] = cv(128, 128);
      x.fillStyle = '#7a6a5a'; x.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 200; i++) {
        x.fillStyle = 'rgba(' + (150 + Math.random() * 90 | 0) + ',' + (120 + Math.random() * 60 | 0) + ',' + (110 + Math.random() * 50 | 0) + ',.5)';
        x.beginPath();
        x.ellipse(Math.random() * 128, Math.random() * 128, 3 + Math.random() * 8, 3 + Math.random() * 8, Math.random() * 3, 0, 7);
        x.fill();
      }
      x.fillStyle = '#3a2a22';
      x.beginPath(); x.ellipse(64, 66, 8, 10, 0, 0, 7); x.fill();
      T.bearEars = tex(c);
    }

    /* --- 862/1499 异界 --- */
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#0a0806'; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 400; i++) {
        const g = 20 + Math.random() * 60;
        x.fillStyle = 'rgba(' + (g | 0) + ',' + (g * 0.4 | 0) + ',' + (g * 0.4 | 0) + ',' + (0.15 + Math.random() * 0.4) + ')';
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 22, 4 + Math.random() * 22, 0, 0, 7);
        x.fill();
      }
      x.fillStyle = 'rgba(150,20,20,.35)';
      for (let i = 0; i < 30; i++) {
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 8, 2 + Math.random() * 8, 0, 0, 7);
        x.fill();
      }
      T.otherGround = tex(c);
    }
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#1a1c1e'; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 500; i++) {
        const g = 20 + Math.random() * 50;
        x.fillStyle = 'rgba(' + (g | 0) + ',' + (g | 0) + ',' + (g | 0) + ',' + (0.2 + Math.random() * 0.5) + ')';
        x.beginPath();
        x.ellipse(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 20, 3 + Math.random() * 20, 0, 0, 7);
        x.fill();
      }
      T.forestGround = tex(c);
    }
    {
      const [c, x] = cv(128, 256);
      x.fillStyle = '#2a2620'; x.fillRect(0, 0, 128, 256);
      for (let i = 0; i < 60; i++) {
        const g = 25 + Math.random() * 40;
        x.strokeStyle = 'rgba(' + (g | 0) + ',' + (g * 0.9 | 0) + ',' + (g * 0.8 | 0) + ',.8)';
        x.lineWidth = 2 + Math.random() * 8;
        x.beginPath();
        x.moveTo(20 + Math.random() * 88, 256);
        x.lineTo(20 + Math.random() * 88, Math.random() * 40);
        x.stroke();
      }
      T.bark = tex(c);
    }
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#3b3026'; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 18; i++) {
        x.strokeStyle = 'rgba(20,16,12,.7)'; x.lineWidth = 2;
        x.beginPath(); x.moveTo(0, i * 15 + 4); x.lineTo(256, i * 15 + 4); x.stroke();
      }
      grain(x, 256, 256, 40, 60, 1500);
      T.wood = tex(c);
    }

    /* --- 特殊房间物件 --- */
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#2b2f36'; x.fillRect(0, 0, 256, 256);
      grain(x, 256, 256, 30, 50, 2200);
      x.fillStyle = '#0f1318';
      x.fillRect(26, 30, 204, 150);
      x.fillStyle = '#5a6a78';
      for (let i = 0; i < 40; i++) x.fillRect(32 + Math.random() * 190, 36 + Math.random() * 138, 3 + Math.random() * 30, 2 + Math.random() * 6);
      x.strokeStyle = '#7f8a96'; x.lineWidth = 4; x.strokeRect(26, 30, 204, 150);
      T.monitor = tex(c);
    }
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#3a5a8a'; x.fillRect(0, 0, 256, 256);
      x.fillStyle = '#101820';
      x.beginPath(); x.ellipse(128, 96, 74, 58, 0, 0, 7); x.fill();
      x.fillStyle = '#243a52';
      x.beginPath(); x.ellipse(128, 96, 62, 46, 0, 0, 7); x.fill();
      x.fillStyle = '#c8ccd0';
      x.font = 'bold 26px monospace'; x.textAlign = 'center';
      x.fillText('SCP-294', 128, 92);
      x.font = '16px monospace'; x.fillStyle = '#7fd0a0';
      x.fillText('DRINK DISPENSER', 128, 118);
      x.fillStyle = '#181c20'; x.fillRect(40, 164, 176, 60);
      x.fillStyle = '#2a3038'; x.fillRect(48, 172, 160, 44);
      T.vending294 = tex(c);
    }
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#5a4630'; x.fillRect(0, 0, 256, 256);
      grain(x, 256, 256, 60, 70, 2000);
      x.strokeStyle = 'rgba(30,20,12,.6)'; x.lineWidth = 3;
      for (let i = 0; i < 10; i++) {
        x.beginPath(); x.moveTo(0, i * 26); x.lineTo(256, i * 26 + 6); x.stroke();
      }
      x.fillStyle = 'rgba(20,14,8,.55)';
      x.beginPath(); x.ellipse(128, 200, 60, 26, 0, 0, 7); x.fill();
      T.coffin = tex(c);
    }
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#20242a'; x.fillRect(0, 0, 256, 256);
      grain(x, 256, 256, 30, 40, 1200);
      x.fillStyle = '#7a2020'; x.fillRect(20, 20, 216, 26);
      x.fillStyle = '#d0c8b8'; x.font = 'bold 22px monospace';
      x.fillText('A-01', 28, 40);
      x.fillStyle = '#c9a13b'; x.fillRect(20, 60, 216, 8);
      for (let i = 0; i < 4; i++) {
        x.fillStyle = i < 2 ? '#4ad07a' : '#4a4f55';
        x.fillRect(30 + i * 52, 96, 40, 22);
      }
      x.strokeStyle = '#111'; x.lineWidth = 6;
      for (let i = 0; i < 6; i++) {
        x.beginPath(); x.moveTo(20 + i * 40, 140); x.lineTo(20 + i * 40, 240); x.stroke();
      }
      T.powerbox = tex(c);
    }
    {
      const [c, x] = cv(256, 256);
      x.fillStyle = '#3a3d42'; x.fillRect(0, 0, 256, 256);
      grain(x, 256, 256, 40, 40, 1400);
      x.fillStyle = '#c8b040';
      x.beginPath();
      x.moveTo(128, 30); x.lineTo(200, 60); x.lineTo(200, 130);
      x.quadraticCurveTo(140, 210, 128, 226);
      x.quadraticCurveTo(116, 210, 56, 130);
      x.lineTo(56, 60);
      x.closePath(); x.fill();
      x.fillStyle = '#181818';
      x.beginPath(); x.arc(128, 124, 34, 0, 7); x.fill();
      x.beginPath(); x.arc(128, 124, 20, 0, 7); x.fillStyle = '#c8b040'; x.fill();
      x.fillStyle = '#181818'; x.font = 'bold 20px monospace'; x.textAlign = 'center';
      x.fillText('☢', 128, 132);
      T.warhead = tex(c);
    }

    return T;
  };

  const baseIcons = S.buildIcons;
  S.buildIcons = function () {
    const I = baseIcons();
    function icon(id, draw) {
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      const x = c.getContext('2d');
      draw(x);
      I[id] = c.toDataURL();
      I[id + '_tex'] = new THREE.CanvasTexture(c);
    }
    icon('hazmat', x => {
      x.fillStyle = '#c8a02a'; x.fillRect(14, 14, 36, 42);
      x.fillStyle = '#e8e0c0'; x.beginPath(); x.arc(32, 20, 12, 0, 7); x.fill();
      x.fillStyle = '#3a3a3a'; x.beginPath(); x.arc(32, 20, 8, 0, 7); x.fill();
      x.fillStyle = '#2a2a2a'; x.fillRect(20, 40, 24, 6);
    });
    icon('vest', x => {
      x.fillStyle = '#2a3038'; x.fillRect(16, 10, 32, 44);
      x.fillStyle = '#3a4650'; x.fillRect(16, 10, 32, 10);
      x.fillStyle = '#556'; x.fillRect(22, 26, 20, 22);
      x.fillStyle = '#7fbf6a'; x.fillRect(20, 34, 24, 4);
    });
    icon('heavyvest', x => {
      x.fillStyle = '#20262c'; x.fillRect(14, 10, 36, 46);
      x.fillStyle = '#333d46'; x.fillRect(14, 10, 36, 12);
      x.fillStyle = '#46525c'; x.fillRect(20, 28, 24, 24);
      x.fillStyle = '#c9a13b'; x.fillRect(18, 36, 28, 4);
    });
    icon('nvg', x => {
      x.fillStyle = '#22262a'; x.fillRect(12, 20, 40, 18);
      x.fillStyle = '#0f2a18'; x.beginPath(); x.arc(22, 29, 7, 0, 7); x.fill();
      x.beginPath(); x.arc(42, 29, 7, 0, 7); x.fill();
      x.fillStyle = '#7fff9f'; x.beginPath(); x.arc(22, 29, 3, 0, 7); x.fill();
      x.beginPath(); x.arc(42, 29, 3, 0, 7); x.fill();
      x.fillStyle = '#555'; x.fillRect(28, 10, 8, 10);
    });
    icon('snav_ult', x => {
      x.fillStyle = '#1a1e24'; x.fillRect(8, 6, 48, 52);
      x.fillStyle = '#062a12'; x.fillRect(12, 10, 40, 34);
      x.strokeStyle = '#4ae07a'; x.lineWidth = 2;
      x.strokeRect(16, 16, 12, 10); x.strokeRect(34, 24, 12, 10);
      x.fillStyle = '#4ae07a'; x.fillRect(30, 20, 5, 5);
      x.fillStyle = '#c33'; x.fillRect(44, 14, 4, 4);
      x.fillStyle = '#444'; x.fillRect(14, 48, 36, 6);
    });
    icon('scp500', x => {
      x.fillStyle = '#d8d4c8'; x.fillRect(20, 20, 24, 30);
      x.fillStyle = '#c33'; x.beginPath(); x.ellipse(32, 32, 8, 8, 0, 0, 7); x.fill();
      x.fillStyle = '#888'; x.fillRect(24, 14, 16, 8);
    });
    icon('scp714', x => {
      x.strokeStyle = '#3ad07a'; x.lineWidth = 5;
      x.beginPath(); x.arc(32, 38, 13, 0, 7); x.stroke();
      x.fillStyle = '#7ff0a8'; x.beginPath(); x.arc(32, 20, 6, 0, 7); x.fill();
    });
    icon('scp427', x => {
      x.strokeStyle = '#8a7a4a'; x.lineWidth = 2;
      x.beginPath(); x.moveTo(20, 12); x.lineTo(32, 26); x.lineTo(44, 12); x.stroke();
      x.fillStyle = '#c9a13b'; x.beginPath(); x.arc(32, 40, 12, 0, 7); x.fill();
      x.fillStyle = '#ffe8a0'; x.beginPath(); x.arc(32, 40, 6, 0, 7); x.fill();
    });
    icon('key860', x => {
      x.fillStyle = '#3a6ad0'; x.beginPath(); x.arc(22, 24, 10, 0, 7); x.fill();
      x.fillStyle = '#4a7ae0'; x.fillRect(28, 30, 22, 6);
      x.fillRect(44, 34, 5, 8); x.fillRect(36, 34, 5, 7);
    });
    icon('mask1499', x => {
      x.fillStyle = '#4a5240'; x.beginPath(); x.ellipse(32, 32, 20, 24, 0, 0, 7); x.fill();
      x.fillStyle = '#8a9a78'; x.beginPath(); x.ellipse(24, 26, 7, 8, 0, 0, 7); x.fill();
      x.beginPath(); x.ellipse(40, 26, 7, 8, 0, 0, 7); x.fill();
      x.fillStyle = '#2a2f26'; x.beginPath(); x.arc(32, 48, 8, 0, 7); x.fill();
    });
    icon('scp148', x => {
      x.fillStyle = '#8a8f96'; x.beginPath();
      x.moveTo(14, 44); x.lineTo(22, 18); x.lineTo(46, 16); x.lineTo(52, 40); x.closePath(); x.fill();
      x.fillStyle = '#b8bec6'; x.fillRect(20, 26, 28, 8);
    });
    icon('scp513', x => {
      x.fillStyle = '#7a5a2a'; x.beginPath();
      x.moveTo(20, 16); x.lineTo(44, 16); x.lineTo(40, 40); x.lineTo(24, 40); x.closePath(); x.fill();
      x.fillStyle = '#4a3a1a'; x.beginPath(); x.arc(32, 46, 6, 0, 7); x.fill();
      x.fillStyle = '#c9a13b'; x.fillRect(30, 8, 4, 10);
    });
    icon('scp1123', x => {
      x.fillStyle = '#d8d2c0'; x.beginPath(); x.arc(32, 28, 16, 0, 7); x.fill();
      x.fillStyle = '#1a1a1a';
      x.beginPath(); x.ellipse(25, 26, 4, 5, 0, 0, 7); x.fill();
      x.beginPath(); x.ellipse(39, 26, 4, 5, 0, 0, 7); x.fill();
      x.fillRect(24, 38, 16, 4);
      x.fillStyle = '#c8c2b0'; x.fillRect(24, 44, 16, 10);
    });
    icon('cup', x => {
      x.fillStyle = '#e8e4da'; x.beginPath();
      x.moveTo(20, 18); x.lineTo(44, 18); x.lineTo(40, 52); x.lineTo(24, 52); x.closePath(); x.fill();
      x.strokeStyle = '#999'; x.strokeRect(20, 18, 24, 34);
    });
    icon('syringe', x => {
      x.fillStyle = '#dfe8ee'; x.fillRect(22, 22, 20, 26);
      x.fillStyle = '#8ad0a0'; x.fillRect(22, 34, 20, 14);
      x.fillStyle = '#888'; x.fillRect(30, 10, 4, 12);
      x.fillRect(26, 48, 12, 4);
    });
    icon('cigarette', x => {
      x.fillStyle = '#e8e4da'; x.fillRect(18, 28, 28, 8);
      x.fillStyle = '#c88a3a'; x.fillRect(40, 28, 8, 8);
      x.fillStyle = '#666'; x.fillRect(14, 28, 5, 8);
    });
    icon('joint', x => {
      x.fillStyle = '#e8e4da'; x.fillRect(16, 30, 24, 7);
      x.fillStyle = '#4a7a2a'; x.fillRect(38, 30, 12, 7);
      x.fillStyle = '#888'; x.fillRect(12, 30, 5, 7);
    });
    icon('card', x => {
      x.fillStyle = '#f0f0f0'; x.fillRect(16, 18, 32, 28);
      x.fillStyle = '#c33'; x.font = 'bold 18px monospace'; x.fillText('A', 26, 40);
    });
    icon('mastercard', x => {
      x.fillStyle = '#222'; x.fillRect(10, 20, 44, 26);
      x.fillStyle = '#e8a020'; x.beginPath(); x.arc(26, 33, 9, 0, 7); x.fill();
      x.fillStyle = '#c33'; x.beginPath(); x.arc(38, 33, 9, 0, 7); x.fill();
    });
    icon('hand', x => {
      x.fillStyle = '#c8a088'; x.fillRect(24, 26, 16, 22);
      for (let i = 0; i < 4; i++) x.fillRect(24 + i * 4, 12, 3, 16);
      x.fillStyle = '#8a1a1a'; x.fillRect(24, 44, 16, 6);
    });
    icon('electronics', x => {
      x.fillStyle = '#2a5a3a'; x.fillRect(14, 20, 36, 24);
      x.fillStyle = '#c9a13b';
      for (let i = 0; i < 5; i++) x.fillRect(18 + i * 7, 24, 4, 4);
      x.fillStyle = '#888'; x.fillRect(14, 44, 36, 4);
    });
    icon('battery18', x => {
      x.fillStyle = '#1a3a5a'; x.fillRect(16, 12, 32, 44);
      x.fillStyle = '#2a7ae0'; x.fillRect(16, 12, 32, 14);
      x.fillStyle = '#999'; x.fillRect(26, 6, 12, 6);
      x.fillStyle = '#dfe'; x.font = 'bold 14px monospace'; x.fillText('18V', 18, 46);
    });
    icon('keycard_omni', x => {
      x.fillStyle = '#0a0a0a'; x.fillRect(6, 16, 52, 34);
      x.fillStyle = '#e8e8e8'; x.fillRect(9, 19, 46, 28);
      x.fillStyle = '#c9a13b'; x.fillRect(12, 24, 14, 18);
      x.fillStyle = '#000'; x.font = 'bold 16px monospace'; x.fillText('OMNI', 28, 40);
    });
    I.finenvg = I.nvg;
    I.heavyvest = I.heavyvest || I.vest;
    I.scrap = I.scrap || I.electronics;
    return I;
  };
})(window.SCP);
