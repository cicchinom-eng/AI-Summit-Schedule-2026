/* Large Language Monsters - all pixel art, drawn in code. No image files anywhere.
   Colours: 1 lightest .. 4 darkest, 0 transparent. Every creature here is an original design. */
window.SPR = (function () {
  'use strict';
  var Pix = E.Pix;
  var S = { tiles: {}, people: {}, llm: {}, sil: {}, task: {} };

  /* ---------- small shared bits ---------- */
  function eye(p, x, y) { p.rect(x - 1, y - 2, 3, 4, 4); p.set(x - 1, y - 2, 1); }
  function smile(p, x, y, w) {
    w = w || 2; p.set(x - w, y, 4); p.set(x + w, y, 4);
    for (var i = -(w - 1); i <= w - 1; i++) p.set(x + i, y + 1, 4);
  }
  function blush(p, x, y) { p.rect(x, y, 2, 1, 3); }
  function star(p, x, y, c) { p.rect(x - 2, y, 5, 1, c); p.rect(x, y - 2, 1, 5, c); p.rect(x - 1, y - 1, 3, 3, c); }
  function note(p, x, y, c) { p.rect(x, y, 1, 5, c); p.rect(x + 1, y, 3, 1, c); p.ell(x - 1, y + 5, 1, 1, c); }

  /* ================= LLM PORTRAITS (40x40) =================
     Each function draws the body; anything it returns is drawn AFTER the outline pass
     (for sparkles, rays and other bits that should stay thin). */
  var L = {};

  // GPT (OpenAI): a round all-rounder with a gear antenna and a wrench. Tools and agents!
  L.gpt56 = function (p) {
    p.line(20, 12, 20, 7, 4); p.ell(20, 5, 3, 3, 2); p.set(20, 5, 4);
    p.rect(34, 18, 2, 13, 3); p.rect(33, 14, 4, 5, 3); p.rect(34, 14, 2, 2, 0);
    p.ell(20, 24, 13, 12, 1); p.shade(20, 24, 13, 12, 2, 1);
    p.ell(13, 36, 4, 2, 2); p.ell(27, 36, 4, 2, 2);
    eye(p, 15, 22); eye(p, 25, 22); smile(p, 20, 27, 3); blush(p, 9, 26); blush(p, 29, 26);
  };

  // Claude: a bookish tufted critter with a quill. Drawn in three sizes for the size dial.
  L.claude = function (p, s) {
    var R = [8, 10, 12][s == null ? 1 : s], cx = 19, cy = 34 - R;
    p.line(cx + R - 3, cy - R + 5, cx + R + 5, cy - R - 4, 1, 2);
    p.line(cx + R - 1, cy - R + 5, cx + R + 6, cy - R - 3, 3);
    p.tri(cx - R + 1, cy - R + 6, cx - R + 1, cy - R - 2, cx - R + 7, cy - R + 2, 2);
    p.tri(cx + R - 1, cy - R + 6, cx + R - 1, cy - R - 2, cx + R - 7, cy - R + 2, 2);
    p.ell(cx, cy, R, R, 2); p.ell(cx, cy + 2, R - 3, R - 3, 1);
    eye(p, cx - 4, cy - 1); eye(p, cx + 4, cy - 1); smile(p, cx, cy + 3, 2);
    p.rect(cx - 8, 33, 16, 5, 1); p.rect(cx, 33, 1, 5, 4);
    p.rect(cx - 6, 35, 4, 1, 3); p.rect(cx + 3, 35, 4, 1, 3);
  };

  // Gemini: big eyes, big ears and twin star antennae. It takes in everything.
  L.gemini = function (p) {
    p.line(15, 15, 11, 7, 4); p.line(25, 15, 29, 7, 4);
    star(p, 11, 5, 1); star(p, 29, 5, 1);
    p.ell(7, 21, 4, 6, 2); p.ell(7, 21, 2, 3, 3); p.ell(33, 21, 4, 6, 2); p.ell(33, 21, 2, 3, 3);
    p.ell(20, 25, 12, 11, 1); p.shade(20, 25, 12, 11, 2, 1);
    p.ell(15, 23, 3, 4, 4); p.rect(13, 20, 2, 2, 1); p.ell(25, 23, 3, 4, 4); p.rect(23, 20, 2, 2, 1);
    smile(p, 20, 30, 2);
    p.ell(14, 37, 3, 1, 2); p.ell(26, 37, 3, 1, 2);
  };

  // Grok: zippy, with goggles and a lightning-bolt tail. Real-time speedster.
  L.grok = function (p) {
    p.tri(10, 19, 8, 6, 17, 13, 2); p.tri(30, 19, 32, 6, 23, 13, 2);
    p.tri(11, 15, 10, 10, 14, 13, 3); p.tri(29, 15, 30, 10, 26, 13, 3);
    p.line(30, 31, 36, 25, 1, 2); p.line(36, 25, 33, 23, 1, 2); p.line(33, 23, 37, 16, 1, 2);
    p.ell(20, 25, 11, 10, 2); p.ell(20, 30, 7, 4, 1);
    p.rect(10, 19, 21, 7, 4); p.rect(12, 20, 7, 5, 1); p.rect(22, 20, 7, 5, 1);
    p.rect(15, 21, 2, 3, 4); p.rect(25, 21, 2, 3, 4);
    smile(p, 20, 30, 2);
    p.ell(15, 36, 3, 1, 3); p.ell(25, 36, 3, 1, 3);
  };

  // DeepSeek: a deep-sea lantern fish. It seeks. Deeply.
  L.deepseek = function (p) {
    p.tri(9, 25, 2, 17, 2, 33, 2);
    p.tri(12, 17, 18, 9, 23, 16, 3);
    p.line(25, 15, 29, 8, 4); p.line(29, 8, 33, 10, 4); p.ell(34, 12, 2, 2, 1);
    p.ell(21, 25, 13, 10, 2); p.ell(22, 30, 9, 4, 1);
    p.ell(27, 21, 3, 3, 1); p.rect(27, 20, 2, 3, 4);
    smile(p, 28, 28, 2);
    p.tri(14, 27, 10, 33, 18, 31, 3);
    return function () { p.set(37, 9, 3); p.set(38, 12, 3); p.set(37, 15, 3); p.set(34, 8, 3); };
  };

  // Qwen: a calm, balanced cat with a monocle (it has vision).
  L.qwen = function (p) {
    p.ell(33, 31, 3, 3, 2); p.ell(35, 27, 2, 3, 2);
    p.tri(9, 20, 9, 8, 17, 14, 1); p.tri(31, 20, 31, 8, 23, 14, 1);
    p.tri(11, 16, 11, 12, 14, 14, 3); p.tri(29, 16, 29, 12, 26, 14, 3);
    p.ell(20, 26, 12, 11, 1); p.shade(20, 26, 12, 11, 2, 1);
    p.set(12, 24, 4); p.set(13, 23, 4); p.set(14, 23, 4); p.set(15, 23, 4); p.set(16, 24, 4);
    p.ell(25, 23, 4, 4, 4); p.ell(25, 23, 3, 3, 1); p.rect(24, 22, 2, 3, 4);
    p.line(29, 26, 30, 33, 3);
    p.rect(19, 27, 2, 1, 4); smile(p, 20, 28, 2);
    p.rect(8, 27, 3, 1, 3); p.rect(8, 29, 3, 1, 3);
  };

  // Gemma: a tiny cheerful gem.
  L.gemma = function (p) {
    p.rect(16, 34, 3, 4, 3); p.rect(22, 34, 3, 4, 3);
    p.tri(20, 8, 8, 20, 32, 20, 1); p.tri(8, 20, 32, 20, 20, 36, 2);
    p.line(8, 20, 32, 20, 3); p.line(15, 20, 20, 9, 3); p.line(25, 20, 20, 9, 3);
    eye(p, 16, 25); eye(p, 24, 25); smile(p, 20, 29, 2);
    return function () { p.rect(31, 8, 5, 1, 3); p.rect(33, 6, 1, 5, 3); p.set(6, 11, 3); p.rect(5, 12, 3, 1, 3); p.set(6, 13, 3); };
  };

  // gpt-oss: a friendly blob popping out of an open box. Open weights, get it?
  L.gptoss = function (p) {
    p.ell(20, 18, 8, 8, 1); eye(p, 17, 17); eye(p, 23, 17); smile(p, 20, 21, 1);
    p.tri(9, 24, 3, 17, 15, 24, 2); p.tri(31, 24, 37, 17, 25, 24, 2);
    p.rect(9, 24, 22, 13, 2); p.rect(9, 24, 22, 1, 3); p.rect(27, 25, 4, 12, 3);
    p.rect(13, 29, 11, 5, 1); p.rect(15, 30, 7, 1, 3); p.rect(15, 32, 5, 1, 3);
  };

  // Mistral: a gust of wind in a beret. "Small" in name only.
  L.mistral = function (p) {
    p.ell(7, 32, 4, 3, 1); p.ell(3, 35, 2, 2, 1);
    p.ell(20, 26, 13, 10, 1); p.shade(20, 26, 13, 10, 2, 1);
    p.line(25, 31, 29, 30, 3); p.line(29, 30, 30, 27, 3); p.set(29, 26, 3); p.set(28, 26, 3);
    eye(p, 15, 25); eye(p, 23, 25); p.ell(19, 30, 1, 1, 4);
    blush(p, 10, 28);
    p.ell(20, 15, 11, 3, 3); p.ell(21, 13, 8, 3, 3); p.rect(21, 8, 2, 3, 3);
    return function () { p.rect(35, 22, 4, 1, 3); p.rect(34, 26, 5, 1, 3); p.rect(36, 30, 3, 1, 3); };
  };

  // Kimi: a sleepy crescent moon with a little rocket. A moonshot!
  L.kimi = function (p) {
    p.ell(17, 22, 13, 14, 1); p.ell(25, 19, 11, 12, 0);
    p.shade(17, 22, 13, 14, 2, 1);
    eye(p, 9, 22); p.set(8, 27, 4); p.set(9, 28, 4); p.set(10, 28, 4); p.set(11, 27, 4);
    p.rect(27, 16, 6, 10, 2); p.tri(27, 15, 30, 10, 33, 15, 3); p.rect(29, 18, 2, 2, 1);
    p.tri(26, 26, 23, 29, 26, 22, 3); p.tri(33, 26, 36, 29, 33, 22, 3);
    p.rect(29, 26, 2, 3, 1);
    return function () { p.set(36, 8, 3); p.set(22, 6, 3); p.rect(29, 31, 2, 1, 3); p.set(30, 33, 3); };
  };

  // GLM: a big gentle golem with a gear in its chest. Built for agent work.
  L.glm = function (p) {
    p.rect(4, 21, 5, 11, 3); p.rect(31, 21, 5, 11, 3); p.rect(12, 33, 6, 5, 3); p.rect(22, 33, 6, 5, 3);
    p.rect(19, 4, 2, 4, 4); p.ell(20, 3, 1, 1, 1);
    p.rect(9, 19, 22, 15, 2); p.rect(12, 7, 16, 12, 2); p.rect(10, 10, 2, 5, 3); p.rect(28, 10, 2, 5, 3);
    p.rect(14, 10, 5, 5, 1); p.rect(21, 10, 5, 5, 1); p.rect(16, 12, 2, 2, 4); p.rect(22, 12, 2, 2, 4);
    p.rect(16, 16, 8, 1, 4);
    p.ell(20, 26, 4, 4, 1); p.ell(20, 26, 1, 1, 4);
    p.rect(19, 21, 2, 1, 1); p.rect(19, 31, 2, 1, 1); p.rect(15, 25, 1, 2, 1); p.rect(25, 25, 1, 2, 1);
  };

  // Olmo: a glass box. You can see exactly what is inside.
  L.olmo = function (p) {
    p.rect(17, 6, 6, 3, 2);
    p.rect(11, 35, 5, 3, 3); p.rect(24, 35, 5, 3, 3);
    p.rect(8, 9, 24, 26, 1);
    p.line(10, 15, 15, 10, 2); p.line(10, 19, 19, 10, 2);
    p.ell(15, 28, 3, 3, 3); p.ell(15, 28, 1, 1, 1);
    p.rect(14, 24, 2, 1, 3); p.rect(14, 32, 2, 1, 3); p.rect(11, 27, 1, 2, 3); p.rect(19, 27, 1, 2, 3);
    p.ell(25, 27, 4, 4, 2); p.ell(25, 27, 2, 2, 1); p.set(25, 27, 4);
    eye(p, 15, 17); eye(p, 25, 17); smile(p, 20, 20, 2);
    p.rect(8, 34, 24, 1, 3); p.rect(31, 9, 1, 26, 2);
  };

  // Nemotron Nano: a tiny chip bug. Small, quick, efficient.
  L.nemotron = function (p) {
    for (var i = 0; i < 4; i++) { p.rect(7, 16 + i * 4, 4, 2, 3); p.rect(29, 16 + i * 4, 4, 2, 3); }
    p.rect(14, 31, 2, 5, 3); p.rect(24, 31, 2, 5, 3); p.rect(12, 36, 4, 1, 3); p.rect(24, 36, 4, 1, 3);
    p.line(15, 13, 12, 7, 4); p.line(25, 13, 28, 7, 4); p.ell(12, 6, 1, 1, 1); p.ell(28, 6, 1, 1, 1);
    p.rect(11, 13, 18, 18, 3); p.rect(13, 15, 14, 14, 2);
    p.rect(14, 17, 5, 5, 1); p.rect(21, 17, 5, 5, 1); p.rect(16, 19, 2, 2, 4); p.rect(22, 19, 2, 2, 4);
    smile(p, 20, 25, 2);
  };

  // Kling: a bouncy phone-shaped clip maker.
  L.kling = function (p) {
    p.line(11, 22, 6, 17, 3, 2); p.line(28, 22, 33, 16, 3, 2);
    p.rect(14, 34, 3, 4, 3); p.rect(23, 34, 3, 4, 3);
    p.rect(11, 6, 18, 29, 3); p.rect(13, 9, 14, 20, 1);
    eye(p, 17, 15); eye(p, 23, 15); smile(p, 20, 19, 2);
    p.tri(18, 22, 18, 27, 23, 24, 3);
    p.rect(18, 31, 4, 2, 1);
    return function () { p.rect(3, 30, 3, 1, 3); p.rect(34, 30, 3, 1, 3); p.rect(5, 34, 2, 1, 3); p.rect(33, 34, 2, 1, 3); };
  };

  // Veo: a camera with one big friendly lens and a watermark sparkle.
  L.veo = function (p) {
    p.line(14, 31, 10, 38, 4); p.line(20, 31, 20, 38, 4); p.line(26, 31, 30, 38, 4);
    p.ell(13, 10, 5, 5, 3); p.ell(13, 10, 1, 1, 1); p.ell(25, 10, 5, 5, 3); p.ell(25, 10, 1, 1, 1);
    p.tri(30, 21, 37, 15, 37, 31, 3);
    p.rect(8, 14, 23, 18, 2);
    p.ell(19, 23, 7, 7, 4); p.ell(19, 23, 5, 5, 1); p.ell(19, 23, 2, 2, 4); p.set(17, 21, 3); p.set(18, 22, 1);
    p.rect(26, 16, 3, 2, 1);
    return function () { p.rect(33, 6, 5, 1, 3); p.rect(35, 4, 1, 5, 3); p.set(4, 8, 3); p.rect(3, 9, 3, 1, 3); p.set(4, 10, 3); };
  };

  // Wan: a snail whose shell is a film reel. Slow and steady renders the frame.
  L.wan = function (p) {
    p.rect(30, 31, 8, 6, 3); p.set(32, 32, 1); p.set(35, 32, 1); p.set(32, 35, 1); p.set(35, 35, 1);
    p.line(6, 24, 4, 17, 4); p.line(10, 24, 12, 17, 4); p.ell(4, 16, 1, 1, 1); p.ell(12, 16, 1, 1, 1);
    p.ell(8, 28, 5, 6, 1); p.rect(6, 31, 26, 6, 1);
    p.ell(23, 21, 10, 10, 2);
    p.ell(23, 15, 2, 2, 1); p.ell(17, 21, 2, 2, 1); p.ell(29, 21, 2, 2, 1); p.ell(23, 27, 2, 2, 1); p.ell(23, 21, 1, 1, 4);
    p.rect(6, 26, 2, 3, 4); p.set(6, 26, 1);
    p.set(5, 31, 4); p.set(6, 32, 4); p.set(7, 32, 4); p.set(8, 31, 4);
  };

  // Seedance: a sprouting seed, mid-dance.
  L.seedance = function (p) {
    p.line(20, 19, 20, 11, 3, 2); p.ell(14, 9, 5, 3, 1); p.ell(27, 8, 5, 3, 1);
    p.line(11, 9, 17, 9, 3); p.line(24, 8, 30, 8, 3);
    p.line(12, 25, 6, 18, 3, 2); p.line(28, 27, 34, 31, 3, 2);
    p.line(17, 35, 13, 37, 3, 2); p.line(23, 35, 27, 36, 3, 2);
    p.ell(20, 27, 9, 9, 2); p.ell(20, 29, 6, 6, 1);
    eye(p, 16, 26); eye(p, 24, 26); smile(p, 20, 30, 2);
    return function () { note(p, 34, 13, 3); };
  };

  // Runway: a clapperboard with scissors for a tail. Lights, camera, edit!
  L.runway = function (p) {
    p.line(31, 28, 37, 22, 1, 2); p.line(31, 28, 37, 33, 1, 2);
    p.rect(10, 35, 4, 3, 3); p.rect(24, 35, 4, 3, 3);
    for (var i = 0; i < 24; i++) p.rect(7 + i, 13 - Math.round(i * 0.3), 1, 4, ((i >> 2) % 2) ? 1 : 4);
    p.rect(7, 18, 24, 17, 2);
    for (var k = 0; k < 24; k++) p.rect(7 + k, 17, 1, 3, ((k >> 2) % 2) ? 4 : 1);
    eye(p, 14, 26); eye(p, 24, 26); smile(p, 19, 30, 2);
  };

  // Luma: a glowing bulb. HDR means it shines very, very precisely.
  L.luma = function (p) {
    p.rect(15, 28, 10, 6, 3); p.rect(15, 30, 10, 1, 4); p.rect(15, 32, 10, 1, 4); p.rect(18, 34, 4, 3, 4);
    p.ell(20, 18, 11, 11, 1); p.shade(20, 18, 11, 11, 2, 1);
    eye(p, 16, 17); eye(p, 24, 17); smile(p, 20, 22, 2); blush(p, 11, 20); blush(p, 27, 20);
    return function () {
      p.line(20, 1, 20, 4, 3); p.line(6, 5, 8, 7, 3); p.line(34, 5, 32, 7, 3);
      p.line(2, 18, 5, 18, 3); p.line(35, 18, 38, 18, 3); p.line(5, 30, 7, 28, 3); p.line(35, 30, 33, 28, 3);
    };
  };

  // LTX: a little projector bot with a speaker. Video AND sound, on a school PC.
  L.ltx = function (p) {
    p.ell(13, 11, 5, 5, 3); p.ell(13, 11, 1, 1, 1); p.ell(24, 11, 4, 4, 3); p.ell(24, 11, 1, 1, 1);
    p.rect(12, 31, 3, 6, 3); p.rect(23, 31, 3, 6, 3); p.rect(10, 37, 7, 1, 3); p.rect(21, 37, 7, 1, 3);
    p.rect(7, 16, 22, 15, 2); p.rect(29, 19, 4, 9, 3); p.ell(34, 23, 2, 4, 1);
    eye(p, 12, 21); eye(p, 19, 21); smile(p, 15, 25, 2);
    for (var y = 0; y < 3; y++) for (var x = 0; x < 3; x++) p.set(22 + x * 2, 23 + y * 2, 4);
    return function () { note(p, 33, 5, 3); p.set(38, 20, 3); p.set(39, 23, 3); p.set(38, 26, 3); };
  };

  // Sora: a friendly retired ghost with a little halo.
  L.sora = function (p) {
    p.ell(20, 18, 12, 12, 1); p.rect(8, 18, 25, 15, 1);
    for (var x = 8; x < 33; x++) { var k = (x - 8) % 8; if (k < 5) { p.set(x, 33, 1); if (k > 0 && k < 4) p.set(x, 34, 1); } }
    for (var y = 27; y < 35; y++) for (var xx = 8; xx < 33; xx++) if ((xx + y) % 2 === 0 && p.get(xx, y) === 1) p.set(xx, y, 2);
    p.ell(15, 18, 2, 3, 4); p.ell(25, 18, 2, 3, 4); p.set(14, 16, 1); p.set(24, 16, 1);
    p.ell(20, 24, 2, 1, 4);
    blush(p, 10, 22); blush(p, 29, 22);
    return function () { p.rect(15, 2, 10, 1, 3); p.rect(13, 3, 2, 1, 3); p.rect(25, 3, 2, 1, 3); p.rect(15, 4, 10, 1, 3); };
  };

  function makeLLM(fn, arg) {
    var p = new Pix(40, 40), post = fn(p, arg);
    p.outline(4);
    if (post) post();
    return p;
  }
  Object.keys(L).forEach(function (id) {
    if (id === 'claude') {
      for (var s = 0; s < 3; s++) { var q = makeLLM(L.claude, s); S.llm['claude' + s] = q.toCanvas(); S.sil['claude' + s] = q.silhouette(2).toCanvas(); }
    } else { var p = makeLLM(L[id]); S.llm[id] = p.toCanvas(); S.sil[id] = p.silhouette(2).toCanvas(); }
  });
  S.portrait = function (id, size) { return id === 'claude' ? S.llm['claude' + (size == null ? 1 : size)] : S.llm[id]; };
  S.shadow = function (id) { return id === 'claude' ? S.sil.claude1 : S.sil[id]; };

  /* ================= TASK MONSTERS (32x32, boss 40x40) ================= */
  function face(p, x, y, c) {
    c = c || 4;
    p.rect(x - 4, y, 2, 3, c); p.rect(x + 3, y, 2, 3, c);
    p.line(x - 6, y - 3, x - 2, y - 2, c); p.line(x + 6, y - 3, x + 2, y - 2, c);
    p.rect(x - 2, y + 5, 5, 1, c);
  }
  var T = {};
  T.pdf = function (p) {
    p.rect(11, 3, 17, 23, 3); p.rect(8, 5, 17, 23, 2); p.rect(5, 7, 17, 23, 1);
    p.tri(17, 7, 21, 7, 21, 11, 3);
    face(p, 13, 14); p.rect(8, 23, 11, 1, 3); p.rect(8, 26, 8, 1, 3);
  };
  T.puzzle = function (p) {
    p.rect(6, 11, 19, 17, 2); p.ell(15, 8, 3, 3, 2); p.ell(27, 19, 3, 3, 2); p.ell(6, 19, 3, 3, 0);
    face(p, 17, 16);
  };
  T.budget = function (p) {
    p.rect(8, 25, 3, 5, 3); p.rect(19, 25, 3, 5, 3);
    p.tri(7, 13, 8, 6, 13, 10, 2);
    p.ell(15, 18, 11, 9, 2); p.shade(15, 18, 11, 9, 3, 2);
    p.ell(26, 19, 4, 3, 1); p.set(25, 19, 4); p.set(27, 19, 4);
    p.rect(11, 10, 7, 1, 4);
    p.rect(17, 14, 2, 3, 4); p.line(14, 12, 19, 13, 4);
    p.set(3, 16, 4); p.set(2, 15, 4); p.set(2, 13, 4); p.set(3, 14, 4);
  };
  T.whiteboard = function (p) {
    p.line(7, 23, 5, 30, 4); p.line(24, 23, 26, 30, 4);
    p.rect(2, 4, 28, 19, 3); p.rect(4, 6, 24, 15, 1);
    p.line(6, 8, 11, 8, 3); p.line(21, 8, 26, 9, 3); p.line(6, 18, 9, 17, 3);
    face(p, 16, 12);
  };
  T.quiz = function (p) {
    p.rect(14, 4, 4, 4, 3); p.rect(12, 2, 8, 2, 3);
    p.ell(16, 18, 11, 11, 3); p.ell(16, 18, 9, 9, 1);
    p.set(16, 10, 4); p.set(16, 26, 4); p.set(8, 18, 4); p.set(24, 18, 4);
    face(p, 16, 15);
  };
  T.records = function (p) {
    p.rect(4, 7, 11, 4, 2); p.rect(3, 10, 26, 18, 2); p.rect(3, 12, 26, 1, 3);
    face(p, 13, 17);
    p.ell(24, 20, 2, 2, 4); p.ell(24, 20, 1, 1, 2); p.rect(21, 21, 7, 6, 4); p.set(24, 23, 1); p.set(24, 24, 1);
  };
  T.factcheck = function (p) {
    p.tri(8, 20, 5, 29, 15, 22, 1);
    p.ell(16, 13, 13, 10, 1);
    p.rect(11, 11, 2, 3, 4); p.rect(19, 11, 2, 3, 4); p.line(9, 8, 14, 8, 4); p.line(17, 6, 22, 8, 4);
    p.rect(13, 17, 6, 1, 4); p.set(19, 16, 4);
  };
  T.binder = function (p) {
    p.rect(6, 3, 20, 26, 3); p.rect(6, 3, 4, 26, 4); p.rect(13, 6, 10, 5, 1);
    p.set(8, 8, 1); p.set(8, 15, 1); p.set(8, 22, 1);
    face(p, 18, 17, 1);
  };
  T.recording = function (p) {
    p.rect(3, 8, 26, 17, 3); p.rect(6, 11, 20, 9, 1);
    p.ell(11, 15, 3, 3, 4); p.ell(11, 15, 1, 1, 1); p.ell(21, 15, 3, 3, 4); p.ell(21, 15, 1, 1, 1);
    p.rect(13, 22, 6, 1, 1); p.rect(8, 25, 16, 2, 2);
  };
  T.bus = function (p) {
    p.rect(2, 9, 28, 15, 2); p.rect(2, 9, 28, 2, 3); p.rect(2, 20, 28, 1, 3);
    p.rect(5, 12, 5, 6, 1); p.rect(12, 12, 5, 6, 1); p.rect(19, 12, 5, 6, 1); p.rect(26, 12, 4, 6, 1);
    p.rect(13, 14, 2, 3, 4); p.rect(20, 14, 2, 3, 4); p.line(12, 12, 15, 13, 4); p.line(23, 12, 20, 13, 4);
    p.ell(9, 25, 3, 3, 4); p.ell(23, 25, 3, 3, 4); p.set(9, 25, 1); p.set(23, 25, 1);
  };
  T.nowifi = function (p) {
    p.rect(6, 5, 20, 15, 3); p.rect(8, 7, 16, 11, 1);
    p.rect(3, 21, 26, 3, 2); p.rect(3, 23, 26, 1, 3);
    p.rect(12, 9, 8, 1, 4); p.rect(14, 11, 4, 1, 4); p.rect(15, 13, 2, 2, 4);
    p.line(10, 16, 21, 8, 4);
  };
  T.license = function (p) {
    p.rect(8, 6, 16, 21, 1); p.ell(16, 5, 9, 2, 2); p.ell(16, 27, 9, 2, 2);
    face(p, 16, 12); p.rect(11, 21, 6, 1, 3); p.rect(11, 23, 4, 1, 3);
    p.ell(21, 22, 2, 2, 3);
  };
  T.trailer = function (p) {
    for (var i = 0; i < 24; i++) p.rect(4 + i, 8, 1, 4, ((i >> 2) % 2) ? 1 : 4);
    p.rect(4, 13, 24, 15, 3);
    face(p, 16, 18, 1);
  };
  T.classpc = function (p) {
    p.rect(14, 21, 4, 3, 4); p.rect(9, 24, 14, 3, 2);
    p.rect(4, 3, 24, 18, 3); p.rect(6, 5, 20, 14, 1);
    face(p, 16, 10);
  };
  T.clipreal = function (p) {
    p.rect(3, 6, 18, 17, 4); p.rect(6, 8, 12, 13, 1);
    for (var i = 0; i < 5; i++) { p.set(4, 8 + i * 3, 1); p.set(19, 8 + i * 3, 1); }
    p.tri(8, 12, 8, 9, 11, 12, 3); p.tri(16, 12, 16, 9, 13, 12, 3); p.rect(8, 12, 9, 6, 3);
    p.line(25, 24, 29, 28, 4, 2);
    p.ell(21, 19, 6, 6, 4); p.ell(21, 19, 4, 4, 1); p.rect(20, 18, 2, 3, 4);
  };
  // The boss: the famous "hype curve" (peak, trough, plateau) as a show-off serpent.
  T.hype = function (p) {
    for (var x = 2; x < 38; x++) {
      var t = (x - 2) / 36;
      var y = 31 - 18 * Math.exp(-Math.pow((t - 0.3) / 0.2, 2)) - 8 / (1 + Math.exp(-(t - 0.82) * 14));
      p.rect(x, Math.round(y), 1, 9, 2); p.rect(x, Math.round(y), 1, 2, 1); p.rect(x, Math.round(y) + 7, 1, 2, 3);
    }
    p.ell(13, 11, 8, 7, 1);
    p.rect(6, 8, 15, 4, 4); p.rect(8, 9, 4, 2, 2); p.rect(15, 9, 4, 2, 2);
    smile(p, 13, 15, 3);
    return function () {
      p.rect(26, 3, 2, 6, 3); p.rect(26, 11, 2, 2, 3); p.rect(31, 1, 2, 6, 3); p.rect(31, 9, 2, 2, 3); p.rect(36, 3, 2, 6, 3); p.rect(36, 11, 2, 2, 3);
    };
  };
  Object.keys(T).forEach(function (id) {
    var p = new Pix(id === 'hype' ? 40 : 32, id === 'hype' ? 40 : 32), post = T[id](p);
    p.outline(4); if (post) post();
    S.task[id] = p.toCanvas();
  });

  /* ================= TILES (16x16) ================= */
  function tile(ch, frames) {
    S.tiles[ch] = frames.map(function (fn) { var p = new Pix(16, 16); fn(p); return p.toCanvas(); });
  }
  function grass(p) {
    p.rect(0, 0, 16, 16, 2);
    [[2, 3], [9, 2], [13, 8], [5, 10], [11, 13], [1, 14]].forEach(function (q) { p.set(q[0], q[1], 3); p.set(q[0] + 1, q[1] - 1, 3); });
    [[6, 5], [14, 11], [3, 8]].forEach(function (q) { p.set(q[0], q[1], 1); });
  }
  function forest(p) {
    p.rect(0, 0, 16, 16, 2);
    [[2, 3], [9, 2], [13, 8], [5, 10], [11, 13], [1, 14], [7, 7], [14, 3], [3, 12], [10, 9]].forEach(function (q) { p.set(q[0], q[1], 3); p.set(q[0] + 1, q[1] - 1, 3); });
  }
  function cloudFloor(p) { p.rect(0, 0, 16, 16, 1); [[3, 4], [11, 2], [7, 10], [13, 13], [1, 12]].forEach(function (q) { p.rect(q[0], q[1], 3, 1, 2); }); }
  function studioFloor(p) { p.rect(0, 0, 16, 16, 1); p.rect(0, 0, 8, 8, 2); p.rect(8, 8, 8, 8, 2); }
  function floor(p) { p.rect(0, 0, 16, 16, 1); p.rect(0, 7, 16, 1, 2); p.rect(0, 15, 16, 1, 2); p.rect(5, 0, 1, 7, 2); p.rect(11, 8, 1, 7, 2); }
  function wall(p) { p.rect(0, 0, 16, 16, 1); p.rect(0, 7, 16, 1, 2); p.rect(0, 15, 16, 1, 3); p.rect(4, 0, 1, 7, 2); p.rect(12, 8, 1, 7, 2); }
  function inWall(p) { p.rect(0, 0, 16, 16, 3); p.rect(0, 0, 16, 2, 4); p.rect(0, 13, 16, 1, 4); p.rect(0, 14, 16, 2, 2); }
  function sheet(p, x, y) { p.rect(x, y, 6, 7, 4); p.rect(x + 1, y + 1, 4, 5, 1); p.rect(x + 2, y + 3, 2, 1, 3); }

  tile('.', [grass]);
  tile(',', [function (p) {
    grass(p);
    [[4, 4], [11, 10]].forEach(function (q) { p.rect(q[0] - 1, q[1], 3, 1, 1); p.rect(q[0], q[1] - 1, 1, 3, 1); p.set(q[0], q[1], 4); });
  }]);
  tile('p', [function (p) { p.rect(0, 0, 16, 16, 1); [[3, 2], [10, 5], [6, 11], [13, 13], [1, 8]].forEach(function (q) { p.set(q[0], q[1], 2); }); }]);
  tile('T', [function (p) {
    grass(p);
    p.rect(6, 11, 4, 5, 4); p.rect(7, 11, 2, 4, 3);
    p.ell(8, 6, 7, 6, 4); p.ell(8, 6, 6, 5, 3); p.ell(6, 4, 3, 2, 2); p.set(5, 3, 1); p.set(11, 8, 2); p.set(9, 9, 2);
  }]);
  function water(f) {
    return function (p) {
      p.rect(0, 0, 16, 16, 3);
      p.rect((2 + f * 3) % 16, 4, 4, 1, 2); p.rect((10 + f * 3) % 16, 10, 4, 1, 2); p.rect((6 + f * 3) % 16, 13, 2, 1, 1); p.rect((13 + f * 3) % 16, 6, 2, 1, 1);
    };
  }
  tile('W', [water(0), water(1)]);
  tile('f', [function (p) {
    grass(p);
    p.rect(0, 5, 16, 1, 4); p.rect(0, 6, 16, 2, 1); p.rect(0, 8, 16, 1, 4);
    [2, 10].forEach(function (x) { p.rect(x - 1, 2, 5, 12, 4); p.rect(x, 3, 3, 10, 1); });
  }]);
  function pile(f) { return function (p) { grass(p); sheet(p, 1, 1); sheet(p, 8, 3 + f); sheet(p, 3, 8 - f); }; }
  tile('~', [pile(0), pile(1)]);
  tile('S', [function (p) {
    grass(p);
    p.rect(7, 9, 2, 6, 4); p.rect(2, 2, 12, 8, 4); p.rect(3, 3, 10, 6, 1); p.rect(5, 5, 6, 1, 3); p.rect(5, 7, 4, 1, 3);
  }]);
  tile('R', [function (p) {
    p.rect(0, 0, 16, 16, 3);
    p.rect(0, 7, 16, 1, 4); p.rect(0, 15, 16, 1, 4);
    p.rect(3, 0, 1, 7, 4); p.rect(11, 0, 1, 7, 4); p.rect(7, 8, 1, 7, 4); p.rect(15, 8, 1, 7, 4);
    p.rect(0, 0, 16, 1, 2);
  }]);
  tile('B', [wall]);
  tile('w', [function (p) { wall(p); p.rect(3, 3, 10, 9, 4); p.rect(4, 4, 8, 7, 2); p.rect(8, 4, 1, 7, 4); p.rect(4, 7, 8, 1, 4); p.set(5, 5, 1); p.set(6, 5, 1); }]);
  tile('D', [function (p) { wall(p); p.rect(3, 1, 10, 15, 4); p.rect(4, 2, 8, 14, 3); p.rect(5, 3, 6, 5, 2); p.rect(10, 10, 1, 2, 1); }]);
  tile('c', [cloudFloor]);
  tile('k', [function (p) { p.rect(0, 0, 16, 16, 3); p.rect(2, 5, 5, 1, 2); p.rect(10, 12, 4, 1, 2); p.set(13, 3, 1); p.set(5, 10, 2); }]);
  function puffs(f) {
    return function (p) {
      cloudFloor(p);
      [[5, 6 + f], [11, 11 - f], [12, 4]].forEach(function (q) { p.ell(q[0], q[1], 4, 3, 3); p.ell(q[0], q[1] - 1, 4, 3, 1); p.ell(q[0], q[1] - 1, 3, 2, 1); });
    };
  }
  tile('C', [puffs(0), puffs(1)]);
  tile('m', [function (p) {
    cloudFloor(p);
    p.rect(4, 0, 8, 14, 4); p.rect(5, 0, 6, 13, 1); p.rect(7, 0, 1, 13, 2); p.rect(9, 0, 1, 13, 2);
    p.rect(3, 12, 10, 4, 4); p.rect(4, 13, 8, 2, 2);
  }]);
  tile('g', [forest]);
  tile('L', [function (p) {
    forest(p);
    [[2, 2, 3], [9, 1, 4], [5, 6, 4], [11, 7, 3], [1, 10, 4], [7, 11, 3], [12, 12, 4]].forEach(function (q) {
      p.rect(q[0] + 1, q[1], 2, 1, q[2]); p.rect(q[0], q[1] + 1, 4, 1, q[2]); p.rect(q[0] + 1, q[1] + 2, 2, 1, q[2]); p.set(q[0] + 1, q[1] + 1, 1);
    });
  }]);
  tile('M', [function (p) {
    forest(p);
    p.rect(6, 9, 5, 6, 4); p.rect(7, 9, 3, 5, 1);
    p.ell(8, 6, 6, 4, 4); p.ell(8, 6, 5, 3, 1); p.set(6, 5, 3); p.set(10, 6, 3); p.set(8, 4, 3); p.set(12, 7, 3); p.set(4, 7, 3);
  }]);
  tile('s', [studioFloor]);
  tile('x', [function (p) { p.rect(0, 0, 16, 16, 4); p.rect(0, 7, 16, 1, 3); p.rect(0, 15, 16, 1, 3); p.rect(5, 0, 1, 7, 3); p.rect(12, 8, 1, 7, 3); }]);
  tile('F', [function (p) {
    studioFloor(p);
    [[1, 2, 10], [5, 8, 10], [2, 12, 7]].forEach(function (q) {
      p.rect(q[0], q[1], q[2], 4, 4);
      for (var i = 1; i < q[2] - 1; i += 3) p.rect(q[0] + i, q[1] + 1, 2, 2, 1);
    });
  }]);
  tile('l', [function (p) {
    studioFloor(p);
    p.rect(7, 6, 2, 9, 4); p.rect(4, 14, 8, 1, 4); p.rect(3, 1, 10, 6, 4); p.rect(4, 2, 8, 4, 3); p.rect(5, 3, 6, 2, 1);
  }]);
  tile('_', [floor]);
  tile('#', [inWall]);
  tile('b', [function (p) {
    p.rect(0, 0, 16, 16, 4);
    [1, 8].forEach(function (y0) {
      for (var x = 1; x < 15; x += 2) { var h = 5 + ((x * 7 + y0) % 2); p.rect(x, y0 + 6 - h, 2, h, [1, 2, 3][(x + y0) % 3]); }
    });
  }]);
  tile('d', [function (p) { floor(p); p.rect(0, 3, 16, 10, 4); p.rect(1, 4, 14, 7, 2); p.rect(1, 11, 14, 1, 3); p.rect(4, 5, 4, 4, 1); p.rect(10, 6, 3, 2, 3); }]);
  tile('r', [function (p) { p.rect(0, 0, 16, 16, 2); [[4, 4], [12, 4], [4, 12], [12, 12], [8, 8], [0, 8], [8, 0]].forEach(function (q) { p.set(q[0], q[1], 3); p.set(q[0] + 1, q[1], 1); }); }]);
  tile('E', [function (p) { floor(p); p.rect(2, 6, 12, 10, 4); p.rect(3, 7, 10, 9, 2); p.rect(3, 9, 10, 1, 3); p.rect(3, 12, 10, 1, 3); }]);
  tile('e', [function (p) { floor(p); p.rect(2, 1, 12, 14, 4); p.rect(3, 2, 10, 12, 2); p.rect(4, 3, 8, 4, 1); p.rect(3, 8, 10, 1, 3); p.rect(3, 11, 10, 1, 3); }]);
  tile('h', [function (p) { floor(p); p.rect(3, 3, 10, 12, 4); p.rect(4, 4, 8, 6, 3); p.rect(4, 11, 8, 3, 2); }]);
  tile('V', [function (p) { inWall(p); p.rect(0, 2, 16, 11, 4); p.rect(0, 3, 16, 9, 1); p.set(4, 6, 2); p.set(11, 9, 2); p.set(8, 5, 2); }]);
  tile('o', [function (p) { floor(p); p.rect(5, 10, 6, 5, 4); p.rect(6, 11, 4, 3, 3); p.ell(8, 6, 5, 5, 4); p.ell(8, 6, 4, 4, 2); p.set(7, 4, 1); p.set(6, 6, 3); p.set(10, 7, 3); }]);
  tile('q', [function (p) { inWall(p); p.rect(2, 2, 12, 10, 4); p.rect(3, 3, 10, 8, 1); p.rect(4, 8, 2, 3, 3); p.rect(7, 6, 2, 5, 3); p.rect(10, 4, 2, 7, 3); }]);
  // Soft scalloped edge drawn where cloud meets open sky.
  (function () { var p = new Pix(16, 16); p.ell(4, 0, 4, 3, 2); p.ell(12, 0, 4, 3, 2); p.ell(4, -1, 4, 3, 1); p.ell(12, -1, 4, 3, 1); S.cloudEdge = p.toCanvas(); })();

  /* ================= PEOPLE (16x16, drawn from a few options) ================= */
  function person(o, dir, f) {
    var p = new Pix(16, 16), sk = 1, sh = o.shirt || 2, hr = o.hair || 4, st = o.style || 'short';
    if (dir === 'side') {
      if (f) { p.rect(5, 13, 2, 2, 4); p.rect(9, 13, 2, 2, 4); } else p.rect(7, 13, 2, 2, 4);
    } else { p.rect(5, 13, 2, f === 1 ? 1 : 2, 4); p.rect(9, 13, 2, f === 2 ? 1 : 2, 4); }
    p.rect(4, 9, 8, 4, sh);
    if (o.apron) p.rect(6, 10, 4, 3, 1);
    if (dir === 'side') p.rect(7, 10, 2, 2, sk);
    else { p.rect(3, 9, 1, 3, sh); p.rect(12, 9, 1, 3, sh); p.set(3, 12, sk); p.set(12, 12, sk); }
    p.rect(4, 2, 8, 7, sk); p.rect(5, 1, 6, 1, sk);
    if (st === 'cap') {
      p.rect(4, 1, 8, 2, 3); p.rect(5, 0, 6, 1, 3);
      if (dir === 'down') p.rect(4, 3, 8, 1, 4); else if (dir === 'side') p.rect(8, 3, 6, 1, 4); else p.rect(4, 2, 8, 3, 3);
    } else if (st !== 'bald') {
      p.rect(4, 1, 8, 2, hr); p.rect(5, 0, 6, 1, hr); p.rect(4, 3, 1, 2, hr); p.rect(11, 3, 1, 2, hr);
      if (st === 'long') { p.rect(3, 3, 1, 6, hr); p.rect(12, 3, 1, 6, hr); }
      if (st === 'bun') p.rect(12, 0, 2, 3, hr);
      if (dir === 'up') p.rect(4, 2, 8, st === 'long' ? 7 : 5, hr);
      if (dir === 'side') p.rect(4, 3, 3, st === 'long' ? 6 : 3, hr);
    } else if (dir === 'up') p.rect(5, 6, 6, 1, 2);
    if (dir === 'down') {
      p.rect(6, 5, 1, 2, 4); p.rect(9, 5, 1, 2, 4);
      if (o.glasses) { p.rect(5, 5, 6, 1, 3); p.rect(6, 5, 1, 2, 4); p.rect(9, 5, 1, 2, 4); }
    } else if (dir === 'side') { p.rect(10, 5, 1, 2, 4); if (o.glasses) p.rect(8, 5, 4, 1, 3); }
    p.outline(4);
    return p;
  }
  function people(id, o) {
    var set = { down: [], up: [], left: [], right: [] };
    for (var f = 0; f < 3; f++) {
      set.down.push(person(o, 'down', f).toCanvas()); set.up.push(person(o, 'up', f).toCanvas());
      var s = person(o, 'side', f ? 1 : 0); set.right.push(s.toCanvas()); set.left.push(s.flip().toCanvas());
    }
    S.people[id] = set;
  }
  people('player', { style: 'cap', shirt: 2 });
  people('token', { style: 'bun', hair: 3, shirt: 3, glasses: true, apron: true });
  people('kid', { style: 'short', hair: 4, shirt: 1 });
  people('kid2', { style: 'long', hair: 3, shirt: 2 });
  people('gardener', { style: 'cap', shirt: 3, apron: true });
  people('hiker', { style: 'short', hair: 3, shirt: 3 });
  people('traveler', { style: 'long', hair: 4, shirt: 1 });
  people('guard', { style: 'cap', shirt: 4 });
  people('suit', { style: 'short', hair: 4, shirt: 4, glasses: true });
  people('vega', { style: 'long', hair: 4, shirt: 3 });
  people('ramos', { style: 'short', hair: 4, shirt: 1, glasses: true });
  people('reel', { style: 'cap', shirt: 1, glasses: true });
  people('proctor', { style: 'bald', shirt: 4, glasses: true });
  function single(id, fn) {
    var p = new Pix(16, 16); fn(p); p.outline(4);
    var c = p.toCanvas(), f = p.flip().toCanvas();
    S.people[id] = { down: [c, c, c], up: [c, c, c], left: [f, f, f], right: [c, c, c] };
  }
  single('cat', function (p) {
    p.line(12, 11, 14, 6, 2); p.ell(9, 11, 4, 3, 2); p.ell(5, 8, 3, 3, 2);
    p.set(3, 4, 2); p.set(3, 5, 2); p.set(7, 4, 2); p.set(7, 5, 2);
    p.set(4, 8, 4); p.set(6, 8, 4); p.rect(6, 13, 1, 2, 2); p.rect(11, 13, 1, 2, 2);
  });
  single('ghost', function (p) {
    p.ell(8, 6, 5, 5, 1); p.rect(3, 6, 11, 7, 1);
    p.rect(3, 13, 2, 1, 1); p.rect(7, 13, 3, 1, 1); p.rect(12, 13, 2, 1, 1);
    p.rect(6, 5, 1, 3, 4); p.rect(10, 5, 1, 3, 4); p.rect(7, 10, 3, 1, 4);
  });

  return S;
})();
