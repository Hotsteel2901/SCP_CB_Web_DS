window.SCP = window.SCP || {};
(function (S) {
  const A = {};
  S.audio = A;
  let ctx = null, master, sfxBus, musBus;
  A.volume = 0.8;

  A.init = function () {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = A.volume;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 0.5; musBus.connect(master);
    A.ctx = ctx;
  };
  A.setVolume = function (v) {
    A.volume = v;
    if (master) master.gain.value = v;
  };
  A.resume = function () { if (ctx && ctx.state === 'suspended') ctx.resume(); };

  function noiseBuffer(sec) {
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  let sharedNoise = null;
  function getNoise() {
    if (!sharedNoise) sharedNoise = noiseBuffer(2);
    return sharedNoise;
  }
  function env(g, t0, a, peak, d, sustain, r, end) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), t0 + a + d);
    if (r !== undefined) g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d + r);
    if (end !== undefined) { }
  }
  function burst(opts) {
    if (!ctx) return;
    const t = ctx.currentTime + (opts.delay || 0);
    const src = ctx.createBufferSource();
    src.buffer = getNoise();
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = opts.type || 'bandpass';
    f.frequency.setValueAtTime(opts.f0 || 800, t);
    if (opts.f1) f.frequency.exponentialRampToValueAtTime(opts.f1, t + (opts.dur || 0.2));
    f.Q.value = opts.q || 1;
    const g = ctx.createGain();
    env(g, t, opts.a || 0.005, opts.vol || 0.3, (opts.dur || 0.2) * 0.6, 0.001, (opts.dur || 0.2) * 0.4);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t);
    src.stop(t + (opts.dur || 0.2) + 0.4);
  }
  function tone(opts) {
    if (!ctx) return;
    const t = ctx.currentTime + (opts.delay || 0);
    const o = ctx.createOscillator();
    o.type = opts.wave || 'sine';
    o.frequency.setValueAtTime(opts.f0 || 440, t);
    if (opts.f1) o.frequency.exponentialRampToValueAtTime(opts.f1, t + (opts.dur || 0.3));
    const g = ctx.createGain();
    env(g, t, opts.a || 0.01, opts.vol || 0.2, (opts.dur || 0.3) * 0.7, 0.001, (opts.dur || 0.3) * 0.3);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + (opts.dur || 0.3) + 0.3);
  }
  A.burst = burst; A.tone = tone;

  A.footstep = function (sprint, zone) {
    const base = zone === 'HCZ' ? 300 : 500;
    burst({ f0: base + Math.random() * 200, q: 1.2, vol: sprint ? 0.16 : 0.09, dur: 0.09, type: 'lowpass' });
    burst({ f0: 1500 + Math.random() * 600, q: 3, vol: sprint ? 0.05 : 0.03, dur: 0.05 });
  };
  A.pickup = function () { tone({ wave: 'triangle', f0: 660, f1: 990, vol: 0.12, dur: 0.09 }); };
  A.uiClick = function () { tone({ wave: 'square', f0: 300, vol: 0.05, dur: 0.04 }); };
  A.beepOk = function () { tone({ wave: 'sine', f0: 880, vol: 0.14, dur: 0.1 }); tone({ wave: 'sine', f0: 1320, vol: 0.12, dur: 0.12, delay: 0.1 }); };
  A.beepDeny = function () { tone({ wave: 'square', f0: 220, vol: 0.14, dur: 0.16 }); tone({ wave: 'square', f0: 180, vol: 0.14, dur: 0.2, delay: 0.16 }); };
  A.doorMove = function (big) {
    burst({ f0: big ? 120 : 200, f1: big ? 90 : 160, q: 2, vol: big ? 0.34 : 0.22, dur: big ? 1.0 : 0.5, type: 'lowpass', a: 0.03 });
    burst({ f0: 2600, q: 8, vol: 0.05, dur: big ? 0.9 : 0.45 });
    tone({ wave: 'sawtooth', f0: big ? 70 : 110, f1: big ? 55 : 90, vol: 0.06, dur: big ? 0.9 : 0.4 });
  };
  A.doorThud = function () { burst({ f0: 90, q: 1, vol: 0.3, dur: 0.15, type: 'lowpass' }); };
  A.doorBreak = function () {
    burst({ f0: 300, f1: 80, q: 1, vol: 0.5, dur: 0.4, type: 'lowpass' });
    burst({ f0: 2000, q: 2, vol: 0.25, dur: 0.3 });
  };
  A.neckSnap = function () {
    burst({ f0: 900, f1: 300, q: 2, vol: 0.6, dur: 0.07 });
    burst({ f0: 600, f1: 200, q: 2, vol: 0.6, dur: 0.09, delay: 0.07 });
    burst({ f0: 150, q: 1, vol: 0.4, dur: 0.3, delay: 0.12, type: 'lowpass' });
  };
  A.sting = function () {
    tone({ wave: 'sawtooth', f0: 110, f1: 108, vol: 0.22, dur: 1.6, a: 0.02 });
    tone({ wave: 'sawtooth', f0: 116.5, f1: 113, vol: 0.2, dur: 1.6, a: 0.02 });
    tone({ wave: 'triangle', f0: 440, f1: 220, vol: 0.1, dur: 1.2, a: 0.01 });
    burst({ f0: 3000, f1: 500, q: 1, vol: 0.12, dur: 1.0 });
  };
  A.rumble = function (dur, vol) {
    burst({ f0: 60, f1: 45, q: 1, vol: vol || 0.4, dur: dur || 2, type: 'lowpass', a: 0.2 });
  };
  A.zap = function () {
    burst({ f0: 4000, f1: 800, q: 0.5, vol: 0.5, dur: 0.35, type: 'highpass' });
    tone({ wave: 'square', f0: 120, f1: 60, vol: 0.3, dur: 0.3 });
    burst({ f0: 8000, q: 1, vol: 0.3, dur: 0.15 });
  };
  A.teslaCharge = function () { tone({ wave: 'sawtooth', f0: 200, f1: 1400, vol: 0.15, dur: 0.4, a: 0.02 }); };
  A.flicker = function () {
    burst({ f0: 3500, q: 6, vol: 0.08, dur: 0.06 });
    tone({ wave: 'square', f0: 100, vol: 0.05, dur: 0.05, delay: 0.03 });
  };
  A.crack106 = function () {
    burst({ f0: 200, f1: 60, q: 1, vol: 0.45, dur: 1.4, type: 'lowpass', a: 0.05 });
    tone({ wave: 'sawtooth', f0: 55, f1: 38, vol: 0.25, dur: 2.2, a: 0.1 });
  };
  A.drip106 = function () {
    burst({ f0: 900, f1: 220, q: 3, vol: 0.07, dur: 0.18, type: 'bandpass' });
  };
  A.laugh106 = function () {
    for (let i = 0; i < 4; i++)
      tone({ wave: 'sawtooth', f0: 160 - i * 18, f1: 110 - i * 14, vol: 0.12, dur: 0.24, delay: i * 0.26, a: 0.02 });
  };
  A.pdMoan = function () {
    tone({ wave: 'sine', f0: 90, f1: 60, vol: 0.3, dur: 2.4, a: 0.4 });
    tone({ wave: 'sine', f0: 135, f1: 92, vol: 0.18, dur: 2.4, a: 0.4 });
  };
  A.scream096Start = function () {
    for (let i = 0; i < 6; i++) {
      tone({ wave: 'sawtooth', f0: 700 + i * 60, f1: 500 + i * 40, vol: 0.1, dur: 1.6, delay: i * 0.05, a: 0.02 });
    }
    burst({ f0: 1800, f1: 900, q: 1, vol: 0.3, dur: 1.8 });
  };
  A.heartbeat = function () {
    burst({ f0: 70, q: 1, vol: 0.4, dur: 0.1, type: 'lowpass' });
    burst({ f0: 60, q: 1, vol: 0.3, dur: 0.09, delay: 0.16, type: 'lowpass' });
  };
  A.elevator = function () {
    burst({ f0: 90, f1: 70, q: 1, vol: 0.3, dur: 4.5, type: 'lowpass', a: 0.5 });
    tone({ wave: 'triangle', f0: 55, vol: 0.12, dur: 4.5, a: 0.5 });
  };
  A.alarmPing = function () {
    tone({ wave: 'sine', f0: 1100, vol: 0.1, dur: 0.4 });
    tone({ wave: 'sine', f0: 880, vol: 0.1, dur: 0.5, delay: 0.45 });
  };

  A.loop = function (build) {
    if (!ctx) return { stop: () => { }, set: () => { } };
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(sfxBus);
    const nodes = build(g);
    return {
      set(v, t) { g.gain.setTargetAtTime(v, ctx.currentTime, t || 0.1); },
      stop() {
        g.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
        setTimeout(() => { try { nodes.forEach(n => n.stop && n.stop()); } catch (e) { } }, 800);
      }
    };
  };

  A.makeAmbience = function () {
    return A.loop(g => {
      const src = ctx.createBufferSource();
      src.buffer = getNoise(); src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 140; f.Q.value = 0.5;
      const hum = ctx.createOscillator();
      hum.type = 'sine'; hum.frequency.value = 50;
      const hg = ctx.createGain(); hg.gain.value = 0.25;
      src.connect(f); f.connect(g);
      hum.connect(hg); hg.connect(g);
      src.start(); hum.start();
      return [src, hum];
    });
  };
  A.makeScrape = function () {
    return A.loop(g => {
      const src = ctx.createBufferSource();
      src.buffer = getNoise(); src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 2.5;
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass'; f2.frequency.value = 210; f2.Q.value = 2;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 11;
      const lg = ctx.createGain(); lg.gain.value = 300;
      lfo.connect(lg); lg.connect(f.frequency);
      src.connect(f); f.connect(g);
      src.connect(f2); f2.connect(g);
      src.start(); lfo.start();
      return [src, lfo];
    });
  };
  A.makeSob = function () {
    return A.loop(g => {
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = 300;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.7;
      const lg = ctx.createGain(); lg.gain.value = 90;
      lfo.connect(lg); lg.connect(o.frequency);
      const trem = ctx.createOscillator(); trem.frequency.value = 5;
      const tg = ctx.createGain(); tg.gain.value = 0.5;
      const tbase = ctx.createGain(); tbase.gain.value = 0.5;
      const vg = ctx.createGain();
      trem.connect(tg);
      const sum = ctx.createGain();
      tg.connect(sum.gain); 
      o.connect(sum); sum.connect(g);
      o.start(); lfo.start(); trem.start();
      return [o, lfo, trem];
    });
  };
  A.makeScream = function () {
    return A.loop(g => {
      const nodes = [];
      for (let i = 0; i < 5; i++) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = 480 + i * 130 + Math.random() * 40;
        const og = ctx.createGain(); og.gain.value = 0.16;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 4 + i;
        const lg = ctx.createGain(); lg.gain.value = 30;
        lfo.connect(lg); lg.connect(o.frequency);
        o.connect(og); og.connect(g);
        o.start(); lfo.start();
        nodes.push(o, lfo);
      }
      const src = ctx.createBufferSource();
      src.buffer = getNoise(); src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1200;
      const ng = ctx.createGain(); ng.gain.value = 0.4;
      src.connect(f); f.connect(ng); ng.connect(g);
      src.start(); nodes.push(src);
      return nodes;
    });
  };
  A.makeGasHiss = function () {
    return A.loop(g => {
      const src = ctx.createBufferSource();
      src.buffer = getNoise(); src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 3000;
      src.connect(f); f.connect(g);
      src.start();
      return [src];
    });
  };
  A.makePdDrone = function () {
    return A.loop(g => {
      const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 48;
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 49.3;
      const o3 = ctx.createOscillator(); o3.type = 'triangle'; o3.frequency.value = 96.5;
      const g3 = ctx.createGain(); g3.gain.value = 0.25;
      o1.connect(g); o2.connect(g);
      o3.connect(g3); g3.connect(g);
      o1.start(); o2.start(); o3.start();
      return [o1, o2, o3];
    });
  };
  A.makeAlarm = function () {
    return A.loop(g => {
      const o = ctx.createOscillator();
      o.type = 'square';
      const lfo = ctx.createOscillator();
      lfo.type = 'square'; lfo.frequency.value = 1.1;
      const lg = ctx.createGain(); lg.gain.value = 160;
      o.frequency.value = 620;
      lfo.connect(lg); lg.connect(o.frequency);
      const og = ctx.createGain(); og.gain.value = 0.25;
      o.connect(og); og.connect(g);
      o.start(); lfo.start();
      return [o, lfo];
    });
  };
  A.makeBgm = function () {
    if (!ctx) return { set() { }, setDanger() { }, stop() { } };
    const m2f = m => 440 * Math.pow(2, (m - 69) / 12);
    const BPM = 54, BEAT = 60 / BPM, BAR = BEAT * 4;

    // D 小调：Dm9 | Bbmaj(add9) | Gm9 | A7 | Dm9 | Bbmaj(add9) | Fmaj9 | A7
    const CHORDS = [
      { notes: [50, 53, 57, 62, 64], bass: 38 },   // Dm9
      { notes: [58, 61, 65, 69, 72], bass: 46 },   // Bb(add9)
      { notes: [55, 58, 62, 66, 69], bass: 43 },   // Gm9
      { notes: [57, 61, 64, 67, 71], bass: 45 },   // A7
      { notes: [50, 53, 57, 62, 64], bass: 38 },   // Dm9
      { notes: [58, 61, 65, 69, 74], bass: 46 },   // Bb(add9) + C6
      { notes: [53, 57, 60, 64, 67], bass: 41 },   // Fmaj9
      { notes: [57, 61, 64, 67, 71], bass: 45 }    // A7
    ];

    // 每小节旋律 [拍点, MIDI, 时值(拍), 音量]，前两小节留白作为呼吸
    const MELODY = [
      [[0, 69, 1, 0.7], [1, 67, 1, 0.6], [2, 65, 0.5, 0.6], [2.5, 64, 0.5, 0.55], [3, 62, 1, 0.7]],
      [[0.5, 67, 1, 0.55], [1.5, 65, 0.5, 0.55], [2, 64, 0.5, 0.55], [3, 62, 1.5, 0.65]],
      [[0, 65, 0.75, 0.6], [0.75, 64, 0.5, 0.55], [1.5, 62, 0.75, 0.6], [2.5, 65, 0.5, 0.55], [3, 67, 1, 0.7]],
      [[0, 69, 2, 0.75], [2.5, 62, 0.75, 0.55], [3.25, 60, 0.75, 0.5]],
      [[0, 69, 0.75, 0.7], [1, 67, 0.5, 0.6], [1.5, 65, 0.5, 0.6], [2, 64, 0.5, 0.6], [2.5, 62, 0.5, 0.6], [3, 60, 1, 0.65]],
      [[0.5, 65, 1, 0.6], [1.5, 67, 0.5, 0.55], [2, 65, 0.5, 0.55], [3, 62, 1.5, 0.7]],
      [[0, 60, 0.75, 0.55], [1, 62, 0.5, 0.55], [1.5, 64, 0.5, 0.55], [2, 65, 0.5, 0.6], [2.5, 67, 0.5, 0.65], [3, 69, 1.5, 0.8]],
      [[0, 71, 1.5, 0.7], [2, 69, 1, 0.6], [3, 64, 1, 0.55]],
      [[0, 72, 1, 0.65], [1, 71, 1, 0.6], [2, 69, 0.5, 0.6], [2.5, 67, 0.5, 0.55], [3, 65, 1, 0.7]],
      [[0.5, 69, 1, 0.6], [1.5, 67, 0.5, 0.55], [2, 65, 0.5, 0.55], [3, 64, 1.5, 0.65]],
      [[0, 65, 0.75, 0.6], [0.75, 64, 0.5, 0.55], [1.5, 62, 0.75, 0.6], [2.5, 60, 0.5, 0.55], [3, 62, 1, 0.65]],
      [[0, 67, 2, 0.75], [2.5, 69, 1, 0.6], [3.5, 72, 0.5, 0.55]],
      [[0, 72, 0.75, 0.65], [1, 69, 0.5, 0.6], [1.5, 67, 0.5, 0.6], [2, 65, 0.5, 0.6], [2.5, 64, 0.5, 0.6], [3, 62, 1, 0.65]],
      [[0.5, 64, 1, 0.6], [1.5, 65, 0.5, 0.55], [2, 67, 0.5, 0.6], [3, 69, 1.5, 0.7]],
      [[0, 71, 1, 0.65], [1, 69, 0.5, 0.6], [1.5, 67, 0.5, 0.6], [2, 65, 0.5, 0.6], [2.5, 64, 0.5, 0.55], [3, 62, 1.5, 0.7]],
      [[0, 69, 2, 0.7], [2, 71, 1, 0.6], [3, 64, 1, 0.55]]
    ];

    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(musBus);

    // 两段延迟：回声(附点八分) + 空间(2.4拍)
    const echo = ctx.createDelay(2); echo.delayTime.value = BEAT * 0.75;
    const echoFb = ctx.createGain(); echoFb.gain.value = 0.34;
    const echoDamp = ctx.createBiquadFilter(); echoDamp.type = 'lowpass'; echoDamp.frequency.value = 1500;
    const echoWet = ctx.createGain(); echoWet.gain.value = 0.5;
    echo.connect(echoFb); echoFb.connect(echoDamp); echoDamp.connect(echo);
    echo.connect(echoWet); echoWet.connect(g);

    const space = ctx.createDelay(4); space.delayTime.value = BEAT * 2.4;
    const spaceFb = ctx.createGain(); spaceFb.gain.value = 0.42;
    const spaceDamp = ctx.createBiquadFilter(); spaceDamp.type = 'lowpass'; spaceDamp.frequency.value = 950;
    const spaceWet = ctx.createGain(); spaceWet.gain.value = 0.32;
    space.connect(spaceFb); spaceFb.connect(spaceDamp); spaceDamp.connect(space);
    space.connect(spaceWet); spaceWet.connect(g);

    const active = new Set();
    function track(node) { active.add(node); node.onended = () => active.delete(node); }

    function padChord(t, chord, vel) {
      chord.notes.forEach(midi => {
        const dur = BAR * 2;
        for (const det of [-5, 5]) {
          const o = ctx.createOscillator();
          o.type = 'triangle'; o.frequency.value = m2f(midi); o.detune.value = det;
          const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 640; f.Q.value = 0.6;
          const og = ctx.createGain();
          og.gain.setValueAtTime(0.0001, t);
          og.gain.linearRampToValueAtTime(vel * 0.10, t + 2.6);
          og.gain.setValueAtTime(vel * 0.10, t + dur - 1.5);
          og.gain.linearRampToValueAtTime(0.0001, t + dur + 3.5);
          const send = ctx.createGain(); send.gain.value = 0.16;
          o.connect(f); f.connect(og); og.connect(g); og.connect(send); send.connect(space);
          o.start(t); o.stop(t + dur + 4.2);
          track(o);
        }
      });
    }

    function bassNote(t, midi, vel) {
      const dur = BAR + 0.8;
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = m2f(midi);
      const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = m2f(midi); o2.detune.value = 4;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300;
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.linearRampToValueAtTime(vel * 0.32, t + 0.15);
      og.gain.setValueAtTime(vel * 0.32, t + dur - 0.6);
      og.gain.linearRampToValueAtTime(0.0001, t + dur + 1.2);
      o.connect(f); o2.connect(f); f.connect(og); og.connect(g);
      o.start(t); o.stop(t + dur + 1.5);
      o2.start(t); o2.stop(t + dur + 1.5);
      track(o); track(o2);
    }

    function pluck(t, midi, vel, lenBeats) {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = m2f(midi);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400;
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.linearRampToValueAtTime(vel * 0.26, t + 0.02);
      og.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.8, lenBeats * BEAT * 0.85));
      const echoSend = ctx.createGain(); echoSend.gain.value = 0.85;
      const spaceSend = ctx.createGain(); spaceSend.gain.value = 0.35;
      o.connect(f); f.connect(og);
      og.connect(g); og.connect(echoSend); og.connect(spaceSend);
      echoSend.connect(echo); spaceSend.connect(space);
      o.start(t); o.stop(t + 3.5);
      track(o);
    }

    function shimmer(t, midi) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = m2f(midi);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.linearRampToValueAtTime(0.045, t + 3.5);
      og.gain.setValueAtTime(0.045, t + 5.5);
      og.gain.linearRampToValueAtTime(0.0001, t + 9);
      const dry = ctx.createGain(); dry.gain.value = 0.25;
      const send = ctx.createGain(); send.gain.value = 0.8;
      o.connect(og); og.connect(dry); og.connect(send);
      dry.connect(g); send.connect(space);
      o.start(t); o.stop(t + 9.5);
      track(o);
    }

    // 危险层：低频心跳 + 不协和簇
    const dg = ctx.createGain(); dg.gain.value = 0; dg.connect(g);
    let dangerVal = 0, pulseTimer = null, droneOscs = [];
    function thump(t, fq, vol) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = fq;
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.linearRampToValueAtTime(vol, t + 0.02);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      o.connect(og); og.connect(dg);
      o.start(t); o.stop(t + 0.5);
      track(o);
    }
    function startDanger() {
      pulseTimer = setInterval(() => {
        const t = ctx.currentTime + 0.05;
        thump(t, 62, 0.5 * dangerVal);
        thump(t + 0.24, 50, 0.34 * dangerVal);
      }, 1100);
      for (const m of [38, 39, 43]) {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = m2f(m);
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 210; f.Q.value = 1.4;
        const og = ctx.createGain(); og.gain.value = 0.055;
        o.connect(f); f.connect(og); og.connect(dg);
        o.start();
        droneOscs.push(o);
      }
    }
    function stopDanger() {
      if (pulseTimer) { clearInterval(pulseTimer); pulseTimer = null; }
      droneOscs.forEach(o => { try { o.stop(); } catch (e) { } });
      droneOscs = [];
    }

    let running = false, timer = null, nextBar = 0, barIdx = 0;
    function scheduleBar(t, bi) {
      const sec = bi % 16;
      const chord = CHORDS[Math.floor(sec / 2) % CHORDS.length];
      if (sec % 2 === 0) padChord(t, chord, 1);
      bassNote(t, chord.bass, 1);
      if (bi >= 2 && MELODY[sec]) {
        for (const ev of MELODY[sec]) {
          pluck(t + ev[0] * BEAT, ev[1], ev[3], ev[2]);
        }
      }
      if (sec === 3 || sec === 11) {
        shimmer(t + 0.5 * BEAT, chord.notes[3] + 12);
        shimmer(t + 2.5 * BEAT, chord.notes[0] + 24);
      }
    }
    function pump() {
      if (!running) return;
      while (nextBar < ctx.currentTime + 1.3) {
        scheduleBar(nextBar, barIdx);
        barIdx++;
        nextBar += BAR;
      }
    }

    return {
      set(v, t) {
        g.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.55, ctx.currentTime, t || 0.5);
      },
      setDanger(v, t) {
        v = Math.max(0, Math.min(1, v));
        dangerVal = v;
        dg.gain.setTargetAtTime(v * 0.55, ctx.currentTime, t || 0.5);
        if (v > 0.08 && !pulseTimer) startDanger();
        else if (v <= 0.08 && pulseTimer) stopDanger();
      },
      stop() {
        running = false;
        if (timer) { clearInterval(timer); timer = null; }
        stopDanger();
        g.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
        setTimeout(() => {
          active.forEach(o => { try { o.stop(); } catch (e) { } });
          active.clear();
        }, 700);
      },
      start() {
        if (running || !ctx) return;
        running = true;
        nextBar = ctx.currentTime + 0.08;
        barIdx = 0;
        pump();
        timer = setInterval(pump, 150);
      }
    };
  };
  A.makeRadioMusic = function () {
    return A.loop(g => {
      const nodes = [];
      const chords = [[110, 130.8, 164.8], [98, 116.5, 146.8], [87.3, 110, 130.8], [103.8, 123.5, 155.6]];
      let ci = 0;
      const oscs = chords[0].map(fq => {
        const o = ctx.createOscillator();
        o.type = 'triangle'; o.frequency.value = fq;
        const og = ctx.createGain(); og.gain.value = 0.13;
        o.connect(og); og.connect(g);
        o.start();
        nodes.push(o);
        return o;
      });
      const iv = setInterval(() => {
        ci = (ci + 1) % chords.length;
        oscs.forEach((o, i) => o.frequency.setTargetAtTime(chords[ci][i], ctx.currentTime, 1.5));
      }, 7000);
      nodes.push({ stop: () => clearInterval(iv) });
      return nodes;
    });
  };
  A.makeStatic = function () {
    return A.loop(g => {
      const src = ctx.createBufferSource();
      src.buffer = getNoise(); src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 0.4;
      src.connect(f); f.connect(g);
      src.start();
      return [src];
    });
  };

  let voiceOn = true;
  A.setVoice = function (v) { voiceOn = v; };
  A.speak = function (text, opts) {
    if (!voiceOn || !window.speechSynthesis) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = (opts && opts.rate) || 0.88;
      u.pitch = (opts && opts.pitch) || 0.45;
      u.volume = Math.min(1, A.volume + 0.1);
      const vs = speechSynthesis.getVoices();
      const en = vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang));
      if (en) u.voice = en;
      speechSynthesis.speak(u);
    } catch (e) { }
  };
  A.stopSpeak = function () { try { speechSynthesis.cancel(); } catch (e) { } };
})(window.SCP);
