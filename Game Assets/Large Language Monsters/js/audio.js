/* Large Language Monsters - tiny original chiptune + blips (Web Audio). Muted by default. */
window.Sound = (function () {
  'use strict';
  var ac = null, master = null, timer = null, step = 0, nextT = 0, cur = null, shift = 0;
  var S = { muted: true };

  var SFX = {
    move: [[880, 0.03]], select: [[660, 0.04], [990, 0.06]], back: [[440, 0.04], [330, 0.06]],
    text: [[1300, 0.012, 0.012]], next: [[990, 0.03]], use: [[523, 0.05], [784, 0.08]],
    hit: [[220, 0.05], [160, 0.09]], great: [[523, 0.06], [659, 0.06], [784, 0.06], [1047, 0.14]],
    nope: [[196, 0.1], [147, 0.16]], win: [[659, 0.08], [784, 0.08], [1047, 0.08], [1319, 0.2]],
    appear: [[784, 0.05], [988, 0.05], [1175, 0.1]],
    recruit: [[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.09], [784, 0.09], [1047, 0.25]],
    warp: [[330, 0.05], [262, 0.08]], stamp: [[392, 0.08], [523, 0.08], [659, 0.08], [784, 0.3]], bump: [[110, 0.04]]
  };
  // Original melodies, written as MIDI note numbers (0 = rest), eight steps per bar.
  var TUNES = {
    walk: {
      bpm: 126,
      lead: [76, 0, 79, 76, 72, 0, 74, 76, 77, 0, 81, 77, 74, 0, 76, 77, 79, 0, 76, 72, 74, 0, 67, 0, 69, 72, 76, 74, 72, 0, 0, 0],
      bass: [48, 0, 55, 0, 48, 0, 55, 0, 53, 0, 60, 0, 50, 0, 57, 0, 48, 0, 55, 0, 55, 0, 50, 0, 45, 0, 53, 0, 48, 0, 55, 0]
    },
    battle: {
      bpm: 164,
      lead: [69, 72, 76, 72, 69, 72, 76, 81, 67, 71, 74, 71, 67, 71, 74, 79, 65, 69, 72, 69, 65, 69, 72, 77, 64, 68, 71, 68, 76, 0, 76, 0],
      bass: [45, 0, 45, 45, 45, 0, 45, 0, 43, 0, 43, 43, 43, 0, 43, 0, 41, 0, 41, 41, 41, 0, 41, 0, 40, 0, 40, 40, 40, 0, 52, 0]
    },
    title: {
      bpm: 104,
      lead: [72, 0, 76, 79, 84, 0, 79, 0, 77, 0, 81, 84, 81, 0, 77, 0, 76, 0, 79, 84, 88, 0, 84, 0, 86, 84, 81, 79, 84, 0, 0, 0],
      bass: [48, 0, 0, 55, 48, 0, 0, 55, 53, 0, 0, 60, 53, 0, 0, 60, 48, 0, 0, 55, 48, 0, 0, 55, 55, 0, 0, 50, 48, 0, 0, 0]
    }
  };
  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function ensure() {
    if (!ac) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { ac = new AC(); master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination); } catch (e) { ac = null; return false; }
    }
    if (ac.state === 'suspended') { try { ac.resume(); } catch (e) { /* fine */ } }
    return true;
  }
  function tone(freq, when, dur, type, vol) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(master); o.start(when); o.stop(when + dur + 0.02);
  }
  function tickMusic() {
    if (!ac || !cur) return;
    var t = TUNES[cur], len = 60 / t.bpm / 2;
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05;
    while (nextT < ac.currentTime + 0.2) {
      var i = step % t.lead.length;
      if (t.lead[i]) tone(hz(t.lead[i] + shift), nextT, len * 0.9, 'square', 0.028);
      if (t.bass[i]) tone(hz(t.bass[i] + shift), nextT, len * 1.6, 'triangle', 0.07);
      nextT += len; step++;
    }
  }
  S.sfx = function (name) {
    if (S.muted || !SFX[name] || !ensure()) return;
    var t = ac.currentTime + 0.005;
    SFX[name].forEach(function (n) { tone(n[0], t, n[1], 'square', n[2] || 0.04); t += n[1]; });
  };
  S.tune = function (name, sh) {
    sh = sh || 0;
    if (cur === name && shift === sh) return;
    cur = name; shift = sh; step = 0; nextT = 0;
  };
  S.setMuted = function (m) {
    S.muted = m;
    var btn = document.getElementById('btnSound');
    if (btn) { btn.textContent = m ? 'SOUND OFF' : 'SOUND ON'; btn.setAttribute('aria-pressed', m ? 'false' : 'true'); }
    if (!m && ensure()) { if (!timer) timer = setInterval(tickMusic, 60); nextT = 0; }
    else if (timer) { clearInterval(timer); timer = null; }
  };
  S.toggle = function () { S.setMuted(!S.muted); if (!S.muted) S.sfx('select'); };
  return S;
})();
