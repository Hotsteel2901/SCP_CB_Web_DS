/* mobile.js — 触屏输入与移动端 UI
   左侧虚拟摇杆、右侧拖拽视角、右下角动作键；不依赖指针锁定，
   所有交互都走 Pointer Events，因此也能在带触摸屏的笔记本上使用。 */
window.SCP = window.SCP || {};
(function (S) {
  const FX = S.fx;
  const MB = {};
  S.mobile = MB;
  let G = null;
  let enabled = false;
  let els = {};

  const SENS = 0.0036;

  function el(tag, cls, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function build() {
    if (document.getElementById('touchUI')) return;
    const root = el('div', '', document.body);
    root.id = 'touchUI';

    // 摇杆
    const stick = el('div', '', root);
    stick.id = 'stickBase';
    const knob = el('div', '', stick);
    knob.id = 'stickKnob';

    // 动作键
    const btns = el('div', '', root);
    btns.id = 'touchBtns';

    const mk = (id, label, sub, cls) => {
      const b = el('button', 'tbtn ' + (cls || ''), btns);
      b.id = id;
      b.innerHTML = '<span class="tb-main">' + label + '</span>' + (sub ? '<span class="tb-sub">' + sub + '</span>' : '');
      b.type = 'button';
      return b;
    };
    mk('tInteract', 'E', '互动', 'primary');
    mk('tBlink', '◉', '眨眼');
    mk('tSprint', '»', '冲刺');
    const side = el('div', '', root);
    side.id = 'touchSide';
    const mkSide = (id, label) => {
      const b = el('button', 'tbtn side', side);
      b.id = id;
      b.type = 'button';
      b.textContent = label;
      return b;
    };
    mkSide('tInv', '背包');
    mkSide('tMap', '地图');
    mkSide('tNvg', '夜视');
    mkSide('tPause', '暂停');

    const hint = el('div', '', root);
    hint.id = 'touchHint';
    hint.textContent = '左侧拖动移动 · 右侧拖动视角';
    setTimeout(() => { hint.style.opacity = '0'; }, 6000);

    els = { root, stick, knob, btns, side, hint };
  }

  function buzz(ms) {
    try { navigator.vibrate && navigator.vibrate(ms || 8); } catch (e) { }
  }

  MB.init = function (game) {
    G = game;
    build();
    if (!FX.isTouch) return;
    enabled = true;
    document.body.classList.add('touch');
    els.root.classList.remove('hidden');
    bind();
    // 首次点击尝试进入全屏
    const fs = () => {
      const d = document.documentElement;
      if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen().catch(() => { });
      window.removeEventListener('pointerdown', fs);
    };
    window.addEventListener('pointerdown', fs, { once: true });
  };

  function bind() {
    const canvas = document.getElementById('c');
    let joyId = null, joyOX = 0, joyOY = 0;
    let lookId = null, lookX = 0, lookY = 0;

    const resetJoy = () => {
      joyId = null;
      els.stick.style.opacity = '0';
      els.knob.style.transform = 'translate(-50%,-50%)';
      if (G) { G.touchAxis.x = 0; G.touchAxis.y = 0; }
    };

    canvas.addEventListener('pointerdown', (e) => {
      if (!enabled || G.state !== 'play' || G.uiOpen > 0) return;
      if (e.pointerType === 'mouse' && !FX.isTouch) return;
      const w = innerWidth, h = innerHeight;
      const left = e.clientX < w * 0.46 && e.clientY > h * 0.32;
      if (left && joyId === null) {
        joyId = e.pointerId;
        joyOX = e.clientX; joyOY = e.clientY;
        els.stick.style.left = joyOX + 'px';
        els.stick.style.top = joyOY + 'px';
        els.stick.style.opacity = '1';
        canvas.setPointerCapture(e.pointerId);
      } else if (lookId === null) {
        lookId = e.pointerId;
        lookX = e.clientX; lookY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!enabled) return;
      if (e.pointerId === joyId) {
        let dx = e.clientX - joyOX, dy = e.clientY - joyOY;
        const max = 58;
        const len = Math.hypot(dx, dy);
        if (len > max) { dx = dx / len * max; dy = dy / len * max; }
        els.knob.style.transform = 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px))';
        G.touchAxis.x = dx / max;
        G.touchAxis.y = dy / max;
      } else if (e.pointerId === lookId) {
        const dx = e.clientX - lookX, dy = e.clientY - lookY;
        lookX = e.clientX; lookY = e.clientY;
        if (G.state === 'play' && G.uiOpen === 0) {
          G.player.yaw -= dx * SENS;
          G.player.pitch = S.clamp(G.player.pitch - dy * SENS, -1.45, 1.45);
        }
      }
    });

    const up = (e) => {
      if (e.pointerId === joyId) resetJoy();
      if (e.pointerId === lookId) lookId = null;
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    const tap = (id, fn, repeat) => {
      const b = document.getElementById(id);
      if (!b) return;
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault(); e.stopPropagation();
        buzz();
        b.classList.add('down');
        fn();
        if (repeat) {
          b._rep = setInterval(fn, 380);
        }
      });
      const end = (e) => {
        b.classList.remove('down');
        if (b._rep) { clearInterval(b._rep); b._rep = null; }
      };
      b.addEventListener('pointerup', end);
      b.addEventListener('pointercancel', end);
      b.addEventListener('pointerleave', end);
    };

    tap('tInteract', () => { if (G.state === 'play' && G.uiOpen === 0) G.doInteract(); });
    tap('tBlink', () => { if (G.state === 'play' && G.uiOpen === 0 && !G.blinking) G.doBlink(0.32); });
    tap('tSprint', () => {
      G.touchSprint = !G.touchSprint;
      document.getElementById('tSprint').classList.toggle('on', G.touchSprint);
    });
    tap('tInv', () => G.toggleInventory());
    tap('tMap', () => G.toggleSnav());
    tap('tNvg', () => G.toggleNvg());
    tap('tPause', () => G.pauseGame());

    window.addEventListener('resize', () => {
      if (G) G.touchAxis.x = G.touchAxis.y = 0;
    });
  }

  MB.setVisible = function (v) {
    if (!els.root) return;
    els.root.style.display = v ? '' : 'none';
  };

  MB.setSprint = function (v) {
    if (G) G.touchSprint = !!v;
    const b = document.getElementById('tSprint');
    if (b) b.classList.toggle('on', !!v);
  };
})(window.SCP);
