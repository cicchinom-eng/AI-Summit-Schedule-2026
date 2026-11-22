/* Large Language Monsters - tiny engine: canvas, pixel buffers, bitmap font, input, save.
   Nothing in here knows about the game itself. */
(function () {
  'use strict';
  var W = 160, H = 144;
  // Four shades, lightest to darkest.
  var PAL = ['#e4f2b4', '#93c25e', '#3c6f52', '#11241d'];
  var RGB = PAL.map(function (h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  });
  var cv = document.getElementById('screen');
  var ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  /* ---------- Pix: a tiny paletted pixel buffer used to draw all art in code ----------
     Values: 0 = transparent, 1..4 = palette shade (1 lightest, 4 darkest). */
  function Pix(w, h) { this.w = w; this.h = h; this.d = new Uint8Array(w * h); }
  Pix.prototype.set = function (x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c;
  };
  Pix.prototype.get = function (x, y) {
    return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? 0 : this.d[y * this.w + x];
  };
  Pix.prototype.rect = function (x, y, w, h, c) {
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c);
  };
  Pix.prototype.inEll = function (x, y, cx, cy, rx, ry) {
    var dx = (x - cx) / (rx + 0.5), dy = (y - cy) / (ry + 0.5);
    return dx * dx + dy * dy <= 1;
  };
  Pix.prototype.ell = function (cx, cy, rx, ry, c) {
    for (var y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++)
      for (var x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++)
        if (this.inEll(x, y, cx, cy, rx, ry)) this.set(x, y, c);
  };
  // Shade the lower-right crescent of an ellipse, only over pixels of colour `from`.
  Pix.prototype.shade = function (cx, cy, rx, ry, c, from) {
    for (var y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++)
      for (var x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++)
        if (this.inEll(x, y, cx, cy, rx, ry) && !this.inEll(x, y, cx - 2, cy - 2, rx, ry) && this.get(x, y) === from)
          this.set(x, y, c);
  };
  Pix.prototype.line = function (x0, y0, x1, y1, c, t) {
    t = t || 1;
    var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx - dy;
    for (var n = 0; n < 400; n++) {
      this.rect(x0, y0, t, t, c);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  };
  Pix.prototype.tri = function (x1, y1, x2, y2, x3, y3, c) {
    var minX = Math.min(x1, x2, x3), maxX = Math.max(x1, x2, x3), minY = Math.min(y1, y2, y3), maxY = Math.max(y1, y2, y3);
    function edge(ax, ay, bx, by, px, py) { return (px - ax) * (by - ay) - (py - ay) * (bx - ax); }
    for (var y = minY; y <= maxY; y++) for (var x = minX; x <= maxX; x++) {
      var a = edge(x1, y1, x2, y2, x, y), b = edge(x2, y2, x3, y3, x, y), d = edge(x3, y3, x1, y1, x, y);
      if ((a >= 0 && b >= 0 && d >= 0) || (a <= 0 && b <= 0 && d <= 0)) this.set(x, y, c);
    }
  };
  // Give the drawing a 1px outline: any empty pixel touching a filled one.
  Pix.prototype.outline = function (c) {
    var add = [], x, y;
    for (y = 0; y < this.h; y++) for (x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push(y * this.w + x);
    }
    for (var i = 0; i < add.length; i++) this.d[add[i]] = c;
  };
  Pix.prototype.flip = function () {
    var p = new Pix(this.w, this.h);
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) p.d[y * this.w + x] = this.d[y * this.w + (this.w - 1 - x)];
    return p;
  };
  Pix.prototype.silhouette = function (c) {
    var p = new Pix(this.w, this.h);
    for (var i = 0; i < this.d.length; i++) p.d[i] = this.d[i] ? c : 0;
    return p;
  };
  Pix.prototype.toCanvas = function () {
    var c = document.createElement('canvas'); c.width = this.w; c.height = this.h;
    var g = c.getContext('2d'), im = g.createImageData(this.w, this.h);
    for (var i = 0; i < this.d.length; i++) {
      var v = this.d[i];
      if (v) { var q = RGB[v - 1]; im.data[i * 4] = q[0]; im.data[i * 4 + 1] = q[1]; im.data[i * 4 + 2] = q[2]; im.data[i * 4 + 3] = 255; }
    }
    g.putImageData(im, 0, 0);
    return c;
  };

  /* ---------- Bitmap font (5x7, column-encoded, ASCII 32..126), drawn proportionally ---------- */
  var FONT =
    '0000000000' + '00005F0000' + '0007000700' + '147F147F14' + '242A7F2A12' + '2313086462' + '3649552250' + '0005030000' +
    '001C224100' + '0041221C00' + '14083E0814' + '08083E0808' + '0050300000' + '0808080808' + '0060600000' + '2010080402' +
    '3E5149453E' + '00427F4000' + '4261514946' + '2141454B31' + '1814127F10' + '2745454539' + '3C4A494930' + '0171090503' +
    '3649494936' + '064949291E' + '0036360000' + '0056360000' + '0814224100' + '1414141414' + '0041221408' + '0201510906' +
    '324979413E' + '7E1111117E' + '7F49494936' + '3E41414122' + '7F4141221C' + '7F49494941' + '7F09090901' + '3E4149497A' +
    '7F0808087F' + '00417F4100' + '2040413F01' + '7F08142241' + '7F40404040' + '7F020C027F' + '7F0408107F' + '3E4141413E' +
    '7F09090906' + '3E4151215E' + '7F09192946' + '4649494931' + '01017F0101' + '3F4040403F' + '1F2040201F' + '3F4038403F' +
    '6314081463' + '0708700807' + '6151494543' + '007F414100' + '0204081020' + '0041417F00' + '0402010204' + '4040404040' +
    '0001020400' + '2054545478' + '7F48444438' + '3844444420' + '384444487F' + '3854545418' + '087E090102' + '0C5252523E' +
    '7F08040478' + '00447D4000' + '2040443D00' + '7F10284400' + '00417F4000' + '7C04180478' + '7C08040478' + '3844444438' +
    '7C14141408' + '081414187C' + '7C08040408' + '4854545420' + '043F444020' + '3C4040207C' + '1C2040201C' + '3C4030403C' +
    '4428102844' + '0C5050503C' + '4464544C44' + '0008364100' + '00007F0000' + '0041360800' + '0804081008';
  var glyphs = [], atlas = [];
  (function buildFont() {
    var n = FONT.length / 10, cols = [], i, k, c;
    for (i = 0; i < n; i++) {
      var g = [];
      for (k = 0; k < 5; k++) g.push(parseInt(FONT.substr(i * 10 + k * 2, 2), 16));
      cols.push(g);
      var a = 0, b = 4;
      while (a < 4 && !g[a]) a++;
      while (b > a && !g[b]) b--;
      glyphs.push({ x: a, w: b - a + 1 });
    }
    for (c = 0; c < 4; c++) {
      var can = document.createElement('canvas'); can.width = n * 6; can.height = 8;
      var gx = can.getContext('2d'); gx.fillStyle = PAL[c];
      for (i = 0; i < n; i++) for (k = 0; k < 5; k++) for (var r = 0; r < 7; r++)
        if (cols[i][k] & (1 << r)) gx.fillRect(i * 6 + k, r, 1, 1);
      atlas.push(can);
    }
  })();
  function glyphIndex(str, i) { var k = str.charCodeAt(i) - 32; return (k < 0 || k > 94) ? 31 : k; }
  function text(str, x, y, c, scale) {
    c = c == null ? 3 : c; scale = scale || 1; str = String(str);
    var at = atlas[c], cx = Math.round(x); y = Math.round(y);
    for (var i = 0; i < str.length; i++) {
      var k = glyphIndex(str, i);
      if (k === 0) { cx += 3 * scale; continue; }
      var g = glyphs[k];
      ctx.drawImage(at, k * 6 + g.x, 0, g.w, 8, cx, y, g.w * scale, 8 * scale);
      cx += (g.w + 1) * scale;
    }
    return cx;
  }
  function measure(str) {
    str = String(str); var w = 0;
    for (var i = 0; i < str.length; i++) { var k = glyphIndex(str, i); w += k === 0 ? 3 : glyphs[k].w + 1; }
    return w;
  }
  function textC(str, cx, y, c, scale) { return text(str, cx - (measure(str) * (scale || 1)) / 2, y, c, scale); }
  function wrap(str, maxW) {
    var out = [];
    String(str).split('\n').forEach(function (par) {
      var line = '';
      par.split(' ').forEach(function (word) {
        var t = line ? line + ' ' + word : word;
        if (line && measure(t) > maxW) { out.push(line); line = word; } else line = t;
      });
      out.push(line);
    });
    return out;
  }

  /* ---------- Drawing helpers ---------- */
  function rect(x, y, w, h, c) { ctx.fillStyle = PAL[c]; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  function spr(img, x, y) { if (img) ctx.drawImage(img, Math.round(x), Math.round(y)); }
  function box(x, y, w, h) {
    rect(x + 1, y, w - 2, h, 3); rect(x, y + 1, w, h - 2, 3);
    rect(x + 1, y + 1, w - 2, h - 2, 0);
    rect(x + 3, y + 2, w - 6, 1, 1); rect(x + 3, y + h - 3, w - 6, 1, 1);
    rect(x + 2, y + 3, 1, h - 6, 1); rect(x + w - 3, y + 3, 1, h - 6, 1);
  }
  function cursor(x, y, c) { c = c == null ? 3 : c; rect(x, y, 1, 7, c); rect(x + 1, y + 1, 1, 5, c); rect(x + 2, y + 2, 1, 3, c); rect(x + 3, y + 3, 1, 1, c); }
  function more(x, y) { rect(x, y, 7, 1, 3); rect(x + 1, y + 1, 5, 1, 3); rect(x + 2, y + 2, 3, 1, 3); rect(x + 3, y + 3, 1, 1, 3); }
  function pips(x, y, n) {
    for (var k = 0; k < 5; k++) { rect(x + k * 6, y, 5, 6, 3); if (k >= n) rect(x + k * 6 + 1, y + 1, 3, 4, 0); }
  }
  var ICONS = {
    text: ['1111111', '1..1..1', '...1...', '...1...', '...1...', '...1...', '..111..'],
    image: ['.......', '..111..', '.1...1.', '1..1..1', '.1...1.', '..111..', '.......'],
    audio: ['...1...', '..11..1', '1111.1.', '1111.1.', '1111.1.', '..11..1', '...1...'],
    video: ['1111111', '1.....1', '1.1...1', '1.11..1', '1.1...1', '1.....1', '1111111']
  };
  function icon(name, x, y, c) {
    var rows = ICONS[name]; if (!rows) return;
    for (var j = 0; j < 7; j++) for (var i = 0; i < 7; i++) if (rows[j][i] === '1') rect(x + i, y + j, 1, 1, c == null ? 3 : c);
  }
  // Screen fade (dither towards the lightest shade). level 0..4
  var fades = [null];
  (function () {
    var tests = [null,
      function (x, y) { return x % 2 === 0 && y % 2 === 0; },
      function (x, y) { return (x + y) % 2 === 0; },
      function (x, y) { return !(x % 2 === 1 && y % 2 === 1); }];
    for (var l = 1; l <= 3; l++) {
      var p = new Pix(W, H);
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) if (tests[l](x, y)) p.d[y * W + x] = 1;
      fades.push(p.toCanvas());
    }
  })();
  function fade(level) { if (level >= 4) rect(0, 0, W, H, 0); else if (level > 0) ctx.drawImage(fades[level], 0, 0); }

  /* ---------- Input: keyboard + touch, with held state and "just pressed" edges ---------- */
  var held = {}, just = {}, rep = {};
  var KEYS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
    z: 'a', Z: 'a', Enter: 'a', x: 'b', X: 'b', b: 'b', B: 'b', Backspace: 'b', Escape: 'menu', ' ': 'menu'
  };
  var hooks = { onUpdate: null, onDraw: null, onMuteKey: null, onFirstInput: null };
  // On-screen hints name the key you actually press: Z/X on a keyboard, A/B on touch.
  var touchMode = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  function label(k) { return touchMode ? k.toUpperCase() : (k === 'a' ? 'Z' : 'X'); }
  function press(k) { if (!held[k]) { held[k] = true; just[k] = true; rep[k] = 0; } }
  function release(k) { held[k] = false; }
  function typing() { var el = document.activeElement; return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'); }
  function overlayOpen() { return !!document.querySelector('.overlay:not([hidden])'); }
  window.addEventListener('keydown', function (e) {
    if (typing() || overlayOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'm' || e.key === 'M') { if (!e.repeat && hooks.onMuteKey) hooks.onMuteKey(); return; }
    var k = KEYS[e.key];
    if (k) { e.preventDefault(); touchMode = false; if (!e.repeat) press(k); }
  });
  window.addEventListener('keyup', function (e) { var k = KEYS[e.key]; if (k) release(k); });
  window.addEventListener('blur', function () { for (var k in held) held[k] = false; });

  function bindButton(el, key) {
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault(); if (overlayOpen()) return;
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
      el.classList.add('on'); if (e.pointerType === 'touch') touchMode = true; buzz(8); press(key);
    });
    var up = function () { el.classList.remove('on'); release(key); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-key]'), function (el) { bindButton(el, el.getAttribute('data-key')); });
  bindButton(cv, 'a'); // tapping the screen counts as A

  var dpad = document.getElementById('dpad');
  if (dpad) {
    var dirs = ['up', 'right', 'down', 'left'], active = null;
    var lastDir = null;
    var setDir = function (d) {
      if (d !== lastDir) { lastDir = d; dpad.setAttribute('data-dir', d || ''); if (d) buzz(6); }
      dirs.forEach(function (k) {
        var el = dpad.querySelector('.' + k);
        if (k === d) { press(k); if (el) el.classList.add('on'); } else { release(k); if (el) el.classList.remove('on'); }
      });
    };
    var track = function (e) {
      var r = dpad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.sqrt(dx * dx + dy * dy) < r.width * 0.12) { setDir(null); return; }
      setDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    };
    dpad.addEventListener('pointerdown', function (e) {
      e.preventDefault(); if (overlayOpen()) return;
      touchMode = true; active = e.pointerId; try { dpad.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
      track(e);
    });
    dpad.addEventListener('pointermove', function (e) { if (e.pointerId === active) track(e); });
    var end = function (e) { if (e.pointerId === active) { active = null; setDir(null); } };
    dpad.addEventListener('pointerup', end); dpad.addEventListener('pointercancel', end); dpad.addEventListener('lostpointercapture', end);
    dpad.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  document.addEventListener('dblclick', function (e) { if (!typing()) e.preventDefault(); });

  /* ---------- Crisp scaling: snap to whole device pixels ---------- */
  function fit() {
    var stage = document.getElementById('stage'); if (!stage) return;
    var bezel = document.getElementById('bezel');
    // Everything around the canvas (lens padding, caption) is "chrome" we must leave room for.
    var chromeW = bezel.offsetWidth - cv.offsetWidth, chromeH = bezel.offsetHeight - cv.offsetHeight;
    var aw = stage.clientWidth - chromeW - 2, ah = stage.clientHeight - chromeH - 2;
    var dpr = window.devicePixelRatio || 1;
    var s = Math.min(aw / W, ah / H);
    var snapped = Math.floor(s * dpr) / dpr;
    if (snapped >= 1) s = snapped;
    if (!(s > 0.5)) s = 1;
    cv.style.width = Math.round(W * s * dpr) / dpr + 'px';
    cv.style.height = Math.round(H * s * dpr) / dpr + 'px';
    var lcd = document.getElementById('lcd');
    if (lcd) { lcd.style.backgroundSize = s + 'px ' + s + 'px'; lcd.style.opacity = s >= 2 ? 1 : 0; }
  }
  function buzz(ms) { if (touchMode && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* fine */ } } }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', function () { setTimeout(fit, 250); });
  if (window.ResizeObserver) new ResizeObserver(fit).observe(document.getElementById('stage'));

  /* ---------- Main loop (fixed 60 updates per second) ---------- */
  var last = 0, acc = 0, STEP = 1000 / 60;
  function tickOnce() {
    ['up', 'down', 'left', 'right'].forEach(function (k) {
      if (held[k]) { rep[k]++; if (rep[k] > 20 && rep[k] % 7 === 0) just[k] = true; }
    });
    if (hooks.onUpdate) hooks.onUpdate();
    for (var k in just) just[k] = false;
  }
  function frame(t) {
    acc += Math.min(100, t - last); last = t;
    var n = 0;
    while (acc >= STEP && n < 5) { tickOnce(); acc -= STEP; n++; }
    if (hooks.onDraw) hooks.onDraw();
    requestAnimationFrame(frame);
  }

  /* ---------- Save (localStorage can throw in private mode, so everything is guarded) ---------- */
  var KEY = 'large-language-monsters.save.v1';
  function save(obj) { try { localStorage.setItem(KEY, JSON.stringify(obj)); return true; } catch (e) { return false; } }
  function load() { try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) { /* fine */ } }

  window.E = {
    W: W, H: H, PAL: PAL, Pix: Pix, ctx: ctx, canvas: cv,
    text: text, textC: textC, measure: measure, wrap: wrap,
    rect: rect, spr: spr, box: box, cursor: cursor, more: more, pips: pips, icon: icon, fade: fade,
    held: held, just: just, hooks: hooks, fit: fit, label: label,
    save: save, load: load, clear: clear, press: press, release: release,
    step: function (n) { for (var i = 0; i < (n || 1); i++) tickOnce(); if (hooks.onDraw) hooks.onDraw(); },
    start: function () { fit(); requestAnimationFrame(function (t) { last = t; requestAnimationFrame(frame); }); }
  };
})();
