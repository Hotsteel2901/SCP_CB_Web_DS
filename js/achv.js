/* achv.js — 成就系统（本地存档 + 提示条 + 成就列表） */
window.SCP = window.SCP || {};
(function (S) {
  const $ = function (id) { return document.getElementById(id); };
  const G = S.game;
  const KEY = 'scpcb_web_achv_v1';
  let unlocked = {};
  try { unlocked = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { unlocked = {}; }
  let queue = [], showing = false;
  G.consoleUsed = false;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(unlocked)); } catch (e) { }
  }
  G.achvUnlocked = unlocked;
  G.achvCount = function () {
    let n = 0;
    for (const a of S.ACHIEVEMENTS) if (unlocked[a.id]) n++;
    return n;
  };

  function toast(a) {
    queue.push(a);
    if (showing) return;
    next();
  }
  function next() {
    if (!queue.length) { showing = false; return; }
    showing = true;
    const a = queue.shift();
    const el = $('achvToast');
    $('achvToastIcon').textContent = '✦';
    $('achvToastName').textContent = a.en + ' · ' + a.zh;
    $('achvToastDesc').textContent = a.desc;
    el.classList.remove('hidden');
    el.style.opacity = '1';
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { el.classList.add('hidden'); next(); }, 600);
    }, 3200);
  }

  G.achv = function (id) {
    if (!id || unlocked[id]) return false;
    const a = S.ACHIEVEMENTS.filter(function (x) { return x.id === id; })[0];
    if (!a) return false;
    unlocked[id] = Date.now();
    save();
    toast(a);
    if (S.audio.achievement) S.audio.achievement();
    return true;
  };

  G.renderAchv = function () {
    const grid = $('achvGrid');
    grid.innerHTML = '';
    let n = 0;
    for (const a of S.ACHIEVEMENTS) {
      const on = !!unlocked[a.id];
      if (on) n++;
      const d = document.createElement('div');
      d.className = 'achv' + (on ? ' on' : '');
      d.innerHTML = '<div class="ai">' + (on ? '✦' : '✧') + '</div>' +
        '<div class="an">' + (on ? a.en : '???') + '</div>' +
        '<div class="ad">' + (on ? a.zh + '：' + a.desc : '尚未解锁') + '</div>';
      grid.appendChild(d);
    }
    $('achvCount').textContent = n + ' / ' + S.ACHIEVEMENTS.length + ' 已解锁';
  };
  G.openAchv = function () {
    G.renderAchv();
    $('achv').classList.remove('hidden');
    G.uiOpen++;
    document.exitPointerLock && document.exitPointerLock();
  };
  G.closeAchv = function () {
    $('achv').classList.add('hidden');
    G.uiOpen = Math.max(0, G.uiOpen - 1);
    if (G.state === 'play' && G.uiOpen === 0) {
      const c = $('c');
      if (c.requestPointerLock) c.requestPointerLock();
    }
  };
  addEventListener('DOMContentLoaded', function () {
    const b1 = $('achvBtn'), b2 = $('achvCloseBtn');
    if (b1) b1.onclick = function () { G.openAchv(); };
    if (b2) b2.onclick = function () { G.closeAchv(); };
  });
})(window.SCP);
