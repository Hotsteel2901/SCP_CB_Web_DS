/* fx.js — 渲染增强：程序化法线贴图 / 环境反射 / 接触阴影 / 后期叠加 / 动态分辨率
   目标：在不加载任何外部素材的前提下，把 Lambert 时代的平光画面提升到 PBR 观感，
   同时给移动端留出足够的分级与降级空间。 */
window.SCP = window.SCP || {};
(function (S) {
  const FX = {};
  S.fx = FX;

  const IS_TOUCH = (function () {
    try { return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window; } catch (e) { return false; }
  })();
  FX.isTouch = IS_TOUCH;

  const NAV = navigator;
  const MEM = NAV.deviceMemory || (NAV.userAgentData && NAV.userAgentData.deviceMemory) || 4;
  FX.lowPower = IS_TOUCH && (MEM <= 4 || Math.min(screen.width, screen.height) <= 480);

  /* ---------------------------------------------------------------- 画布工具 */
  function cv(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  FX.cv = cv;

  /* 由彩色画布生成法线贴图（Sobel 梯度）。strength 越大凹凸越明显。 */
  FX.normalFrom = function (src, strength) {
    const w = Math.min(256, src.width), h = Math.min(256, src.height);
    const c = cv(w, h);
    const x = c.getContext('2d');
    x.drawImage(src, 0, 0, w, h);
    const img = x.getImageData(0, 0, w, h);
    const d = img.data;
    const lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      lum[i] = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) / 255;
    }
    const out = x.createImageData(w, h);
    const st = (strength || 1) * 2.2;
    for (let y = 0; y < h; y++) {
      for (let xx = 0; xx < w; xx++) {
        const l = lum[y * w + ((xx - 1 + w) % w)];
        const r = lum[y * w + ((xx + 1) % w)];
        const u = lum[((y - 1 + h) % h) * w + xx];
        const dn = lum[((y + 1) % h) * w + xx];
        let nx = (l - r) * st, ny = (u - dn) * st, nz = 1;
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len; ny /= len; nz /= len;
        const i = (y * w + xx) * 4;
        out.data[i] = (nx * 0.5 + 0.5) * 255;
        out.data[i + 1] = (ny * 0.5 + 0.5) * 255;
        out.data[i + 2] = (nz * 0.5 + 0.5) * 255;
        out.data[i + 3] = 255;
      }
    }
    x.putImageData(out, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 2;
    return t;
  };

  /* 标准材质工厂：自动补 normalMap / roughness，兼容性优先 */
  FX.std = function (opts) {
    const o = Object.assign({ roughness: 0.82, metalness: 0.06 }, opts || {});
    if (o.map && !o.normalMap && o.normalStrength !== 0) {
      try {
        const key = '__nm_' + (o.map.uuid || o.map.id);
        if (!FX[key]) FX[key] = FX.normalFrom(o.map.image, o.normalStrength || 1);
        o.normalMap = FX[key];
        o.normalScale = new THREE.Vector2(o.normalScale2 || 0.55, o.normalScale2 || 0.55);
      } catch (e) { /* canvas 不可用则忽略 */ }
    }
    if (o.envMapIntensity === undefined) o.envMapIntensity = 0.28;
    return new THREE.MeshStandardMaterial(o);
  };

  /* 简单布料/皮肤材质：无贴图时给一点粗糙的噪点，避免纯色塑料感 */
  let noiseTex = null;
  FX.noiseMap = function () {
    if (noiseTex) return noiseTex;
    const c = cv(128, 128), x = c.getContext('2d');
    const img = x.createImageData(128, 128);
    for (let i = 0; i < 128 * 128; i++) {
      const v = 150 + Math.random() * 105;
      img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    noiseTex = new THREE.CanvasTexture(c);
    noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
    return noiseTex;
  };

  /* ---------------------------------------------------------------- 环境反射 */
  FX.initEnvironment = function (renderer, scene) {
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileCubemapShader();
      const envScene = new THREE.Scene();
      const geo = new THREE.SphereGeometry(20, 16, 12);
      const c = cv(64, 64), x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, 0, 64);
      g.addColorStop(0, '#5d6871');
      g.addColorStop(0.42, '#343c44');
      g.addColorStop(0.55, '#1b2025');
      g.addColorStop(1, '#07090b');
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
      const tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding;
      const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide });
      envScene.add(new THREE.Mesh(geo, mat));
      // 两条冷白灯带，让金属有方向性的高光
      for (const px of [-6, 6]) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 40), new THREE.MeshBasicMaterial({ color: 0x6d7f8c }));
        bar.position.set(px, 10, 0);
        envScene.add(bar);
      }
      const rt = pmrem.fromScene(envScene, 0.04);
      scene.environment = rt.texture;
      FX.envRT = rt;
      geo.dispose(); mat.dispose(); tex.dispose();
      pmrem.dispose();
    } catch (e) { /* 环境贴图失败不影响游戏 */ }
  };

  /* ---------------------------------------------------------------- 接触阴影 */
  let shadowTex = null;
  FX.shadowTexture = function () {
    if (shadowTex) return shadowTex;
    const c = cv(64, 64), x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 2, 32, 32, 31);
    g.addColorStop(0, 'rgba(0,0,0,0.62)');
    g.addColorStop(0.45, 'rgba(0,0,0,0.34)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    shadowTex = new THREE.CanvasTexture(c);
    return shadowTex;
  };
  FX.blobShadow = function (r, opacity) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(r * 2, r * 2),
      new THREE.MeshBasicMaterial({
        map: FX.shadowTexture(), transparent: true, opacity: opacity === undefined ? 0.8 : opacity,
        depthWrite: false, color: 0x000000
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.012;
    m.renderOrder = 1;
    m.name = 'blobShadow';
    return m;
  };

  /* ---------------------------------------------------------------- 后期叠加（DOM） */
  FX.initPost = function () {
    if (document.getElementById('vignette')) return;
    const v = document.createElement('div');
    v.id = 'vignette';
    v.className = 'fxLayer';
    const grain = document.createElement('div');
    grain.id = 'grain';
    grain.className = 'fxLayer';
    const scan = document.createElement('div');
    scan.id = 'scanlines';
    scan.className = 'fxLayer';
    document.body.appendChild(v);
    document.body.appendChild(grain);
    document.body.appendChild(scan);
  };
  FX.vignette = function (v) {
    const el = document.getElementById('vignette');
    if (el) el.style.opacity = String(v);
  };
  FX.damagePulse = function (amount) {
    const el = document.getElementById('damageVg');
    if (el) el.style.opacity = String(Math.min(0.95, amount));
  };
  FX.setGrain = function (v) {
    const el = document.getElementById('grain');
    if (el) el.style.opacity = String(v);
  };

  /* ---------------------------------------------------------------- 画质分级 / 动态分辨率 */
  FX.quality = IS_TOUCH ? (FX.lowPower ? 'low' : 'medium') : 'high';
  FX.scale = 1;
  FX.minScale = IS_TOUCH ? 0.55 : 0.7;

  FX.applyQuality = function (renderer, camera, scene, q) {
    FX.quality = q;
    if (q === 'low') {
      FX.scale = 0.72;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2) * FX.scale);
      if (scene.fog) { scene.fog.near = 1.2; scene.fog.far = 20; }
      FX.setGrain(0.12);
    } else if (q === 'medium') {
      FX.scale = 0.9;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5) * FX.scale);
      if (scene.fog) { scene.fog.near = 1.6; scene.fog.far = 25; }
      FX.setGrain(0.16);
    } else {
      FX.scale = 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      FX.setGrain(0.18);
    }
    if (camera) { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  };

  FX.tune = function (renderer, dt, camera) {
    FX._fps = (FX._fps || 60) * 0.94 + (1 / Math.max(dt, 0.001)) * 0.06;
    FX._t = (FX._t || 0) + dt;
    if (FX._t < 1.5) return;
    FX._t = 0;
    if (FX._fps < 42 && FX.scale > FX.minScale) {
      FX.scale = Math.max(FX.minScale, FX.scale - 0.1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * FX.scale);
      if (camera) { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
    } else if (FX._fps > 58 && FX.scale < 1 && !IS_TOUCH) {
      FX.scale = Math.min(1, FX.scale + 0.05);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * FX.scale);
      if (camera) { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
    }
  };

  /* ---------------------------------------------------------------- 杂项 */
  FX.dpr = function () { return Math.min(window.devicePixelRatio || 1, IS_TOUCH ? 1.5 : 2); };
})(window.SCP);
