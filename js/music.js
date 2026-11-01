/* music.js — 自适应配乐引擎（重写）
 *
 * 设计目标：不是"随机氛围音"，而是一套真正按乐理写作、可分析的配乐系统。
 *
 * 1) 调性布局：整部作品围绕 A 小调展开，随区域做近关系转调——
 *      LCZ  A 自然小调  →  HCZ  D 弗里几亚（下属方向，降二级制造压迫）
 *      EZ   F 利底亚/大调（关系大调，希望感）  →  Pocket  B 洛克里亚（减五度）
 *      Chase A 和声小调（导音升高，属功能明确）  →  Ending  C 大调 / D 小调
 * 2) 和声：每首曲子给出功能进行（i–VI–III–VII 等），和弦由音阶堆叠三度生成；
 *    声部连接使用"最小运动 + 避免平行五/八度 + 解决导音"的评分式算法挑选排列，
 *    因此任意两小节之间的和弦连接都是可演奏的。
 * 3) 动机：全作共用一个四音动机（0–2–1–4 级），在各曲中以原型 / 逆行 / 倒影 /
 *    扩增变形出现；旋律由动机 + 和弦音 + 级进规则生成，句尾落在和弦音上。
 * 4) 织体：低音持续音、和声铺底、琶音、主旋律、对位大提琴、打击乐分层，
 *    由 tension（0–1）控制密度与不协和度，切换场景时交叉淡入淡出。
 */
window.SCP = window.SCP || {};
(function (S) {
  const A = S.audio;
  const MUS = {};
  S.music = MUS;

  const MODES = {
    ionian: [0, 2, 4, 5, 7, 9, 11],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
    harmonic: [0, 2, 3, 5, 7, 8, 11]
  };
  const MODE_CN = {
    ionian: '伊奥尼亚（大调）', dorian: '多利亚', phrygian: '弗里几亚',
    lydian: '利底亚', mixolydian: '混合利底亚', aeolian: '爱奥利亚（自然小调）',
    locrian: '洛克里亚', harmonic: '和声小调'
  };
  const QUALITY = {
    m: [0, 3, 7], M: [0, 4, 7], d: [0, 3, 6], a: [0, 4, 8],
    m7: [0, 3, 7, 10], M7: [0, 4, 7, 11], d7: [0, 3, 6, 10], m7b5: [0, 3, 6, 10],
    sus4: [0, 5, 7], add9: [0, 4, 7, 14]
  };

  /* ------------------------------------------------------------------ 曲目 */
  // 进行写作 [根音级数, 性质, 附加音(可选)]；级数 0 = 主音
  const CUES = {
    menu: {
      name: 'SITE-19', cn: '站点主题', bpm: 46, root: 45, mode: 'aeolian',
      prog: [[0, 'm7'], [5, 'M7'], [2, 'M7'], [6, 'M7']],
      bars: 16, feel: 'still',
      melody: 0.55, pad: 0.5, piano: 0.5, cello: 0.16, bass: 0.3, drone: 0.2, perc: 0, tension: 0
    },
    lcz: {
      name: 'LIGHT CONTAINMENT', cn: '轻收容区', bpm: 50, root: 45, mode: 'aeolian',
      prog: [[0, 'm9'], [5, 'M7'], [3, 'm7'], [4, 'm7']],
      bars: 16, feel: 'walk',
      melody: 0.42, pad: 0.42, piano: 0.34, cello: 0.14, bass: 0.32, drone: 0.24, perc: 0.08, tension: 0.05
    },
    hcz: {
      name: 'HEAVY CONTAINMENT', cn: '重收容区', bpm: 54, root: 50, mode: 'phrygian',
      prog: [[0, 'm'], [1, 'M'], [6, 'M'], [0, 'm']],
      bars: 16, feel: 'heavy',
      melody: 0.3, pad: 0.34, piano: 0.18, cello: 0.34, bass: 0.38, drone: 0.4, perc: 0.16, tension: 0.18
    },
    ez: {
      name: 'ENTRANCE ZONE', cn: '入口区', bpm: 60, root: 53, mode: 'lydian',
      prog: [[0, 'M7'], [5, 'm7'], [3, 'M7'], [4, 'M']],
      bars: 16, feel: 'open',
      melody: 0.46, pad: 0.4, piano: 0.4, cello: 0.2, bass: 0.28, drone: 0.16, perc: 0.06, tension: 0.03
    },
    chase: {
      name: 'CONTAINMENT BREACH', cn: '追逐', bpm: 126, root: 45, mode: 'harmonic',
      prog: [[0, 'm'], [5, 'M'], [1, 'd'], [4, 'M']],
      bars: 8, feel: 'run',
      melody: 0.3, pad: 0.36, piano: 0.2, cello: 0.3, bass: 0.5, drone: 0.2, perc: 0.55, tension: 0.85
    },
    pocket: {
      name: 'POCKET DIMENSION', cn: '口袋维度', bpm: 42, root: 47, mode: 'locrian',
      prog: [[0, 'd'], [4, 'd'], [1, 'M'], [0, 'd']],
      bars: 8, feel: 'void',
      melody: 0.2, pad: 0.3, piano: 0.24, cello: 0.12, bass: 0.42, drone: 0.55, perc: 0.05, tension: 0.5
    },
    endingGood: {
      name: 'EVACUATION', cn: '撤离', bpm: 58, root: 48, mode: 'ionian',
      prog: [[0, 'M'], [3, 'M'], [0, 'M'], [4, 'M']],
      bars: 12, feel: 'open',
      melody: 0.5, pad: 0.46, piano: 0.52, cello: 0.28, bass: 0.24, drone: 0.1, perc: 0.08, tension: 0
    },
    endingBad: {
      name: 'ALPHA WARHEAD', cn: '核爆', bpm: 44, root: 50, mode: 'aeolian',
      prog: [[0, 'm'], [5, 'M'], [3, 'm'], [4, 'M']],
      bars: 8, feel: 'doom',
      melody: 0.28, pad: 0.34, piano: 0.26, cello: 0.46, bass: 0.4, drone: 0.5, perc: 0.22, tension: 0.6
    }
  };
  MUS.CUES = CUES;

  /* ------------------------------------------------------------------ 工具 */
  const m2f = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const NOTE_CN = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const keyName = (midi) => NOTE_CN[((midi % 12) + 12) % 12] + Math.floor(midi / 12 - 1);

  /* ------------------------------------------------------------------ 引擎 */
  function Engine(ctx, out) {
    this.ctx = ctx;
    this.out = out;
    this.cue = null;
    this.cueName = '';
    this.prevVoicing = null;
    this.bar = 0;
    this.nextBarTime = 0;
    this.running = false;
    this.tension = 0;
    this.level = 0.9;
    this.motifIndex = 0;
    this.active = new Set();
    this.nodes = [];
    this.info = { name: '—', key: '—', bpm: 0, progression: '—', chord: '—', bar: 0, mode: '—' };
    this.mix = { pad: 0.4, piano: 0.3, cello: 0.2, bass: 0.3, drone: 0.2, perc: 0.1, melody: 0.4 };
    this.buildBuses();
    this.buildInstruments();
  }

  Engine.prototype.buildBuses = function () {
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -20;
    this.comp.knee.value = 26;
    this.comp.ratio.value = 3.2;
    this.comp.attack.value = 0.02;
    this.comp.release.value = 0.32;
    this.master.connect(this.comp);
    this.comp.connect(this.out);

    // 卷积混响：程序生成的指数衰减噪声脉冲响应
    this.verb = ctx.createConvolver();
    this.verb.buffer = this.makeIR(2.6, 2.4);
    this.verbGain = ctx.createGain();
    this.verbGain.gain.value = 0.36;
    this.verb.connect(this.verbGain);
    this.verbGain.connect(this.master);

    // 附点八分延迟
    this.delay = ctx.createDelay(1.5);
    this.delay.delayTime.value = 0.44;
    this.delayFb = ctx.createGain();
    this.delayFb.gain.value = 0.28;
    this.delayFilt = ctx.createBiquadFilter();
    this.delayFilt.type = 'lowpass';
    this.delayFilt.frequency.value = 2100;
    this.delayGain = ctx.createGain();
    this.delayGain.gain.value = 0.22;
    this.delay.connect(this.delayFb);
    this.delayFb.connect(this.delayFilt);
    this.delayFilt.connect(this.delay);
    this.delay.connect(this.delayGain);
    this.delayGain.connect(this.master);
    this.delayGain.connect(this.verb);
  };

  Engine.prototype.makeIR = function (sec, decay) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (i < 240 ? i / 240 : 1);
      }
    }
    return buf;
  };

  Engine.prototype.buildInstruments = function () {
    const ctx = this.ctx;
    const mk = (name, gainVal, verbSend, delaySend) => {
      const g = ctx.createGain();
      g.gain.value = gainVal;
      g.connect(this.master);
      if (verbSend) {
        const s = ctx.createGain();
        s.gain.value = verbSend;
        g.connect(s); s.connect(this.verb);
      }
      if (delaySend) {
        const s = ctx.createGain();
        s.gain.value = delaySend;
        g.connect(s); s.connect(this.delay);
      }
      this.nodes.push({ name, gain: g });
      return g;
    };
    this.bus = {
      pad: mk('pad', 0.5, 0.55, 0),
      piano: mk('piano', 0.4, 0.5, 0.32),
      cello: mk('cello', 0.4, 0.4, 0),
      bass: mk('bass', 0.55, 0.06, 0),
      drone: mk('drone', 0.4, 0.3, 0),
      perc: mk('perc', 0.5, 0.22, 0),
      melody: mk('melody', 0.42, 0.5, 0.28),
      tension: mk('tension', 0.0, 0.2, 0)
    };
  };

  /* 基础音色 ------------------------------------------------------------- */
  Engine.prototype.padNote = function (t, midi, dur, vel) {
    const ctx = this.ctx;
    const f = m2f(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.16, t + 1.6);
    g.gain.setValueAtTime(vel * 0.16, t + Math.max(1.7, dur - 1.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 2.2);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(420, t);
    filt.frequency.linearRampToValueAtTime(900, t + 1.4);
    filt.Q.value = 0.5;
    filt.connect(g);
    for (const det of [-7, 0, 7]) {
      const o = ctx.createOscillator();
      o.type = det === 0 ? 'triangle' : 'sawtooth';
      o.frequency.value = f;
      o.detune.value = det;
      const og = ctx.createGain();
      og.gain.value = det === 0 ? 0.6 : 0.3;
      o.connect(og); og.connect(filt);
      o.start(t); o.stop(t + dur + 2.4);
    }
    // 轻微的立体声展开
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = ((midi % 5) - 2) * 0.09; g.connect(pan); pan.connect(this.bus.pad); }
    else g.connect(this.bus.pad);
    g.connect(this.verb);
  };

  Engine.prototype.pianoNote = function (t, midi, dur, vel) {
    const ctx = this.ctx;
    const f = m2f(midi);
    const car = ctx.createOscillator();
    car.type = 'sine';
    car.frequency.value = f;
    const mod = ctx.createOscillator();
    mod.type = 'sine';
    mod.frequency.value = f * 2.002;
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(f * 1.6, t);
    modGain.gain.exponentialRampToValueAtTime(f * 0.05, t + 0.7);
    mod.connect(modGain); modGain.connect(car.frequency);
    const g = ctx.createGain();
    const len = Math.max(0.6, dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.22, t + 0.006);
    g.gain.exponentialRampToValueAtTime(vel * 0.05, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + 1.1);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 3200;
    car.connect(filt); filt.connect(g);
    g.connect(this.bus.piano);
    car.start(t); mod.start(t);
    car.stop(t + len + 1.3); mod.stop(t + len + 1.3);
  };

  Engine.prototype.celloNote = function (t, midi, dur, vel) {
    const ctx = this.ctx;
    const f = m2f(midi);
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    const vib = ctx.createOscillator();
    vib.frequency.value = 4.6;
    const vg = ctx.createGain();
    vg.gain.value = f * 0.006;
    vib.connect(vg); vg.connect(o.frequency);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(520, t);
    filt.frequency.linearRampToValueAtTime(1150, t + 0.5);
    filt.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.18, t + 0.28);
    g.gain.setValueAtTime(vel * 0.17, t + Math.max(0.4, dur - 0.4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.9);
    o.connect(filt); filt.connect(g); g.connect(this.bus.cello);
    o.start(t); vib.start(t);
    o.stop(t + dur + 1.0); vib.stop(t + dur + 1.0);
  };

  Engine.prototype.bassNote = function (t, midi, dur, vel) {
    const ctx = this.ctx;
    const f = m2f(midi);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = f;
    o2.detune.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.26, t + 0.08);
    g.gain.setValueAtTime(vel * 0.24, t + Math.max(0.2, dur - 0.18));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 260;
    o.connect(filt); o2.connect(filt); filt.connect(g);
    g.connect(this.bus.bass);
    o.start(t); o2.start(t);
    o.stop(t + dur + 0.4); o2.stop(t + dur + 0.4);
  };

  Engine.prototype.droneNote = function (t, midi, dur, vel) {
    const ctx = this.ctx;
    const f = m2f(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.09, t + 3.2);
    g.gain.setValueAtTime(vel * 0.09, t + Math.max(3.3, dur - 2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 3);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 150 + this.tension * 220;
    filt.connect(g);
    for (const det of [-4, 4]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
      o.connect(filt);
      o.start(t); o.stop(t + dur + 3.2);
    }
    g.connect(this.bus.drone);
  };

  Engine.prototype.arpNote = function (t, midi, dur, vel) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = m2f(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.11, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.25, dur));
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 2600; filt.Q.value = 2;
    o.connect(filt); filt.connect(g);
    g.connect(this.bus.piano);
    g.connect(this.delay);
    o.start(t); o.stop(t + Math.max(0.3, dur) + 0.1);
  };

  Engine.prototype.choirNote = function (t, midi, dur, vel) {
    const ctx = this.ctx;
    const f = m2f(midi);
    const o = ctx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.08, t + 0.9);
    g.gain.setValueAtTime(vel * 0.08, t + Math.max(1, dur - 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.4);
    const formants = [[700, 6], [1220, 9], [2600, 12]];
    for (const [fq, q] of formants) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = fq * (f / 220); bp.Q.value = q;
      const bg = ctx.createGain(); bg.gain.value = 0.5;
      o.connect(bp); bp.connect(bg); bg.connect(g);
    }
    g.connect(this.bus.tension);
    g.connect(this.verb);
    o.start(t); o.stop(t + dur + 1.5);
  };

  /* 打击乐 --------------------------------------------------------------- */
  Engine.prototype.taiko = function (t, vel) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(132, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.34);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.5, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g); g.connect(this.bus.perc);
    o.start(t); o.stop(t + 0.55);
    // 鼓皮噪声
    const n = ctx.createBufferSource();
    n.buffer = A._noise || (A._noise = this.makeNoise());
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 1.1;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(vel * 0.16, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    n.connect(f); f.connect(ng); ng.connect(this.bus.perc);
    n.start(t); n.stop(t + 0.2);
  };

  Engine.prototype.metalHit = function (t, vel, fq) {
    const ctx = this.ctx;
    const n = ctx.createBufferSource();
    n.buffer = A._noise || (A._noise = this.makeNoise());
    n.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = fq || 2600; f.Q.value = 16;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.14, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    n.connect(f); f.connect(g); g.connect(this.bus.perc);
    g.connect(this.verb);
    n.start(t); n.stop(t + 0.65);
  };

  Engine.prototype.makeNoise = function () {
    const ctx = this.ctx;
    const len = ctx.sampleRate * 2;
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };

  /* ------------------------------------------------------------------ 和声 */
  Engine.prototype.scale = function () {
    return MODES[this.cue.mode] || MODES.aeolian;
  };
  Engine.prototype.degToMidi = function (deg, octaveBase) {
    const sc = this.scale();
    const oct = Math.floor(deg / 7);
    const idx = ((deg % 7) + 7) % 7;
    return this.cue.root + sc[idx] + 12 * (oct + (octaveBase || 0));
  };
  Engine.prototype.chordAt = function (bar) {
    const c = this.cue;
    const p = c.prog[bar % c.prog.length];
    const rootDeg = p[0], q = p[1], extra = p[2];
    const root = this.degToMidi(rootDeg, 1);
    const iv = (QUALITY[q] || QUALITY.m).slice();
    if (extra) iv.push(extra);
    const notes = iv.map((n) => root + n);
    return { root: this.degToMidi(rootDeg, 0), notes, quality: q, deg: rootDeg };
  };

  /* 声部连接：在若干八度排列中挑最平滑、且无平行五/八度的 */
  Engine.prototype.voice = function (chord, prev) {
    const tones = [];
    for (const n of chord.notes) {
      for (let k = -1; k <= 1; k++) tones.push(n + 12 * k);
    }
    tones.sort((a, b) => a - b);
    const target = 3 + (chord.notes.length > 3 ? 1 : 0);
    const cands = [];
    const N = tones.length;
    function pick(start, arr) {
      if (arr.length === target) { cands.push(arr.slice()); return; }
      for (let i = start; i < N; i++) {
        if (arr.length && tones[i] - arr[arr.length - 1] > 12) continue;
        if (tones[i] < 48 || tones[i] > 84) continue;
        arr.push(tones[i]); pick(i + 1, arr); arr.pop();
      }
    }
    pick(0, []);
    if (!cands.length) return chord.notes.map((n) => n + 12);
    if (!prev) return cands[Math.floor(cands.length / 2)];
    let best = null, bestScore = 1e9;
    for (const c of cands) {
      let score = 0;
      const n = Math.min(prev.length, c.length);
      for (let i = 0; i < n; i++) score += Math.abs(c[i] - prev[i]);
      // 平行五度 / 八度惩罚
      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = Math.abs(prev[j] - prev[i]) % 12;
          const b = Math.abs(c[j] - c[i]) % 12;
          if ((a === 7 && b === 7) || (a === 0 && b === 0)) score += 8;
        }
      }
      // 低音过近惩罚
      if (c[0] < 50) score += (50 - c[0]) * 0.6;
      if (score < bestScore) { bestScore = score; best = c; }
    }
    return best || cands[0];
  };

  /* ------------------------------------------------------------------ 动机 */
  // 级进动机：0–2–1–4（主–三–二–五），节奏 1 : 1 : 0.5 : 1.5
  const MOTIF = [
    { d: 0, r: 1.0, a: 1 },
    { d: 2, r: 1.0, a: 0.85 },
    { d: 1, r: 0.5, a: 0.7 },
    { d: 4, r: 1.5, a: 0.95 }
  ];
  function transformMotif(kind) {
    let m = MOTIF.map((x) => ({ d: x.d, r: x.r, a: x.a }));
    if (kind === 'retro') m = m.reverse();
    else if (kind === 'inv') {
      const pivot = m[0].d;
      m = m.map((x) => ({ d: pivot - (x.d - pivot), r: x.r, a: x.a }));
    } else if (kind === 'aug') m = m.map((x) => ({ d: x.d, r: x.r * 2, a: x.a * 0.9 }));
    else if (kind === 'dim') m = m.map((x) => ({ d: x.d, r: Math.max(0.5, x.r * 0.5), a: x.a }));
    else if (kind === 'up') m = m.map((x) => ({ d: x.d + 2, r: x.r, a: x.a }));
    return m;
  }

  /* 依据和弦音 + 音阶 + 动机生成 2 小节旋律（返回 {t(beats), midi, dur, vel}） */
  Engine.prototype.melodyPhrase = function (chord, beatsPerBar, variant) {
    const m = transformMotif(variant);
    const sc = this.scale();
    const out = [];
    let beat = 0;
    let prevMidi = null;
    const chordPcs = chord.notes.map((n) => ((n % 12) + 12) % 12);
    for (let i = 0; i < m.length * 2; i++) {
      const cell = m[i % m.length];
      if (beat >= beatsPerBar * 2 - 0.01) break;
      // 音高：动机级数 → 音阶；若落在非和弦音且处于强拍，则就近吸附到和弦音
      let midi = this.degToMidi(cell.d + (i >= m.length ? 0 : 0), 2);
      const strong = Math.abs(beat - Math.round(beat)) < 0.01 && Math.round(beat) % 2 === 0;
      if (strong) {
        let best = midi, bd = 99;
        for (const t of chord.notes) {
          for (const off of [-12, 0, 12, 24]) {
            const cand = t + off;
            const d = Math.abs(cand - midi);
            if (d < bd && cand > 55 && cand < 88) { bd = d; best = cand; }
          }
        }
        if (bd <= 7) midi = best;
      }
      // 避免大跳与重复
      if (prevMidi !== null) {
        if (Math.abs(midi - prevMidi) > 9) midi += midi > prevMidi ? -12 : 12;
        if (midi === prevMidi && i % 2 === 1) midi += 2;
      }
      const dur = Math.max(0.25, cell.r * (variant === 'aug' ? 1 : 1));
      out.push({ t: beat, midi, dur, vel: cell.a });
      prevMidi = midi;
      beat += cell.r;
      if (i % 4 === 3) beat += 0.5; // 句读呼吸
    }
    return out;
  };

  /* ------------------------------------------------------------------ 排程 */
  Engine.prototype.startCue = function (name) {
    const cue = CUES[name];
    if (!cue) return;
    this.cue = cue;
    this.cueName = name;
    this.bar = 0;
    this.prevVoicing = null;
    this.beat = 60 / cue.bpm;
    this.barLen = this.beat * 4;
    const now = this.ctx.currentTime;
    this.nextBarTime = now + 0.12;
    this.info = {
      name: cue.name, cn: cue.cn, key: keyName(cue.root) + ' ' + (cue.mode === 'ionian' ? 'major' : cue.mode === 'lydian' ? 'lydian' : 'minor'),
      bpm: cue.bpm, progression: cue.prog.map((p) => this.roman(p[0], p[1])).join(' – '),
      chord: '—', bar: 0, mode: MODE_CN[cue.mode] || cue.mode, total: cue.bars
    };
    MUS.info = this.info;
    // 交叉淡入
    const g = this.master.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.linearRampToValueAtTime(Math.max(0.02, this.level), now + 2.2);
  };

  Engine.prototype.roman = function (deg, q) {
    const R = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const sc = this.scale();
    // 判断该级三和弦性质是否与音阶自然三度一致
    const root = sc[deg % 7];
    const third = (sc[(deg + 2) % 7] - root + 12) % 12;
    let s = R[deg % 7];
    if (third === 3) s = s.toLowerCase();
    if (q && q.indexOf('d') === 0) s += '°';
    if (q && q.indexOf('M') === 0 && third === 4) { /* 大三和弦 */ }
    if (q === 'M7') s += 'maj7';
    else if (q === 'm7') s += '7';
    else if (q === 'M') s += '';
    return s;
  };

  Engine.prototype.scheduleBar = function (t, bar) {
    const cue = this.cue;
    const chord = this.chordAt(bar);
    const voicing = this.voice(chord, this.prevVoicing);
    this.prevVoicing = voicing;
    const barBeats = 4;
    const beat = this.beat;
    const barLen = this.barLen;
    const tension = this.tension;
    const section = Math.floor(bar / 4) % 4; // A A' B A''
    const variant = ['orig', 'retro', 'inv', 'aug'][section];

    this.info.chord = this.chordName(chord, voicing);
    this.info.bar = (bar % cue.bars) + 1;

    // --- 和声铺底
    if (cue.pad > 0) {
      for (const n of voicing) this.padNote(t, n, barLen * 0.96, cue.pad * (0.9 + Math.random() * 0.1));
      if (tension > 0.55) this.choirNote(t + beat * 0.5, voicing[voicing.length - 1] + 12, barLen, (tension - 0.5) * 0.7);
    }
    // --- 低音：根音为主，第三拍给五度
    if (cue.bass > 0) {
      const rootM = chord.root;
      this.bassNote(t, rootM, beat * 1.8, cue.bass);
      if (cue.feel === 'run') {
        for (let i = 0; i < 4; i++) this.bassNote(t + i * beat, rootM + (i % 2 ? 7 : 0), beat * 0.8, cue.bass * 0.7);
      } else if (cue.feel !== 'void') {
        this.bassNote(t + beat * 2, rootM + (cue.feel === 'heavy' ? 0 : 7), beat * 1.7, cue.bass * 0.75);
      }
    }
    // --- 持续音
    if (cue.drone > 0) this.droneNote(t, chord.root, barLen, cue.drone);

    // --- 钢琴织体 / 琶音
    if (cue.piano > 0) {
      if (cue.feel === 'run') {
        const pattern = [0, 2, 1, 3, 2, 1, 0, 2];
        for (let i = 0; i < 8; i++) {
          this.arpNote(t + i * beat * 0.5, voicing[pattern[i] % voicing.length] + 12, beat * 0.42, cue.piano * 0.85);
        }
      } else if (cue.feel === 'void') {
        this.pianoNote(t + beat * 1.5 + Math.random(), voicing[0] + 12, 1.6, cue.piano * 0.7);
        if (Math.random() < 0.6) this.pianoNote(t + beat * 3.2, voicing[2] + 12, 1.2, cue.piano * 0.5);
      } else {
        this.pianoNote(t, voicing[0], 2.2, cue.piano * 0.8);
        this.pianoNote(t + beat * 2, voicing[2] ? voicing[2] + 12 : voicing[0] + 12, 1.8, cue.piano * 0.55);
        if (section >= 2) this.pianoNote(t + beat * 3, voicing[1], 1.2, cue.piano * 0.4);
      }
    }

    // --- 旋律（A 段进入，B 段换对位，A'' 扩增）
    if (cue.melody > 0 && bar % 4 !== 3 && bar >= 2) {
      const phrase = this.melodyPhrase(chord, barBeats, variant);
      const oct = section === 2 ? 12 : 0;
      for (const n of phrase) {
        if (Math.random() < 0.12 && tension < 0.3) continue;
        this.pianoNote(t + n.t * beat, n.midi + oct, n.dur * beat * 0.9, cue.melody * n.vel);
      }
    }
    // --- 对位大提琴：在 B 段以反向进行呼应
    if (cue.cello > 0 && (section === 1 || section === 3) && bar % 2 === 0) {
      const low = voicing[0] - 12;
      this.celloNote(t + beat * 0.5, low, barLen * 0.45, cue.cello);
      if (bar % 4 === 2) this.celloNote(t + beat * 2.5, low + 5, barLen * 0.4, cue.cello * 0.8);
    }

    // --- 打击乐
    if (cue.perc > 0) {
      if (cue.feel === 'run') {
        this.taiko(t, cue.perc);
        this.taiko(t + beat * 2, cue.perc * 0.8);
        if (tension > 0.4) this.taiko(t + beat, cue.perc * 0.45);
        for (let i = 0; i < 8; i++) if (i % 2 === 0 || tension > 0.6) this.metalHit(t + i * beat * 0.5, cue.perc * 0.28, 2800 + (i % 4) * 300);
      } else if (cue.feel === 'heavy') {
        this.taiko(t, cue.perc * 1.2);
        if (bar % 2 === 1) this.metalHit(t + beat * 3.5, cue.perc * 0.5, 1800);
        if (tension > 0.35) this.metalHit(t + beat * 2, cue.perc * 0.3, 3200);
      } else if (cue.feel === 'walk' && bar % 4 === 0) {
        this.metalHit(t + beat * 3.5, cue.perc * 0.6, 2400);
      } else if (cue.feel === 'open' && bar % 4 === 2) {
        this.metalHit(t + beat * 2, cue.perc * 0.4, 3000);
      } else if (cue.feel === 'doom') {
        this.taiko(t, cue.perc);
      }
    }

    // --- 张力层：小二度簇 + 高频震颤
    if (tension > 0.45) {
      const pc = chord.root + 1;
      this.choirNote(t, pc + 24, barLen * 0.8, (tension - 0.45) * 0.5);
    }
  };

  Engine.prototype.chordName = function (chord, voicing) {
    const rootName = NOTE_CN[((chord.root % 12) + 12) % 12];
    const q = { m: 'm', M: '', d: '°', a: '+', m7: 'm7', M7: 'maj7', d7: '°7', sus4: 'sus4', add9: 'add9', m9: 'm9' }[chord.quality] || '';
    return rootName + q;
  };

  Engine.prototype.pump = function () {
    if (!this.running || !this.cue) return;
    const now = this.ctx.currentTime;
    const horizon = now + 0.9;
    let guard = 0;
    while (this.nextBarTime < horizon && guard++ < 8) {
      this.scheduleBar(this.nextBarTime, this.bar);
      this.bar++;
      this.nextBarTime += this.barLen;
    }
  };

  Engine.prototype.setMix = function (cue, tension) {
    const c = cue;
    const bus = this.bus;
    const set = (b, v) => { if (b) b.gain.setTargetAtTime(v, this.ctx.currentTime, 1.2); };
    set(bus.pad, c.pad * 0.55);
    set(bus.piano, c.piano * 0.55);
    set(bus.cello, c.cello * 0.5);
    set(bus.bass, c.bass * 0.55);
    set(bus.drone, c.drone * 0.5);
    set(bus.perc, c.perc * 0.45);
    set(bus.melody, c.melody * 0.4);
    set(bus.tension, clamp((tension - 0.3) * 0.35, 0, 0.22));
  };

  /* ------------------------------------------------------------------ 对外 */
  let engine = null;
  let pending = null;

  MUS.init = function () {
    A.init();
    if (!A.ctx || engine) return;
    engine = new Engine(A.ctx, A.musBus || A.ctx.destination);
    MUS._engine = engine;
  };
  MUS.start = function () {
    MUS.init();
    if (!engine) return;
    if (!engine.running) {
      engine.running = true;
      engine.timer = setInterval(() => engine.pump(), 120);
    }
    MUS.setScene(engine.cueName || 'menu', true);
  };
  MUS.stop = function () {
    if (!engine) return;
    engine.running = false;
    if (engine.timer) { clearInterval(engine.timer); engine.timer = null; }
    engine.master.gain.setTargetAtTime(0.0001, A.ctx.currentTime, 0.4);
  };
  MUS.setScene = function (name, force) {
    if (!engine || !CUES[name]) return;
    if (!force && engine.cueName === name) return;
    engine.startCue(name);
    engine.setMix(CUES[name], engine.tension);
  };
  MUS.setTension = function (v) {
    if (!engine) return;
    engine.tension = clamp(v, 0, 1);
    if (engine.cue) engine.setMix(engine.cue, engine.tension);
  };
  MUS.info = { name: '—', key: '—', bpm: 0, progression: '—', chord: '—', bar: 0, mode: '—' };

  /* 兼容旧接口：game.js 通过 A.makeBgm() 拿到控制器 */
  A.makeBgm = function () {
    return {
      start() { MUS.start(); },
      stop() { MUS.stop(); },
      set(v, t) {
        if (!engine) return;
        engine.level = clamp(v, 0, 1) * 0.95;
        engine.master.gain.setTargetAtTime(engine.level, A.ctx.currentTime, t || 0.5);
      },
      setDanger(v, t) { MUS.setTension(v); void t; },
      setScene(n) { MUS.setScene(n); }
    };
  };
})(window.SCP);
