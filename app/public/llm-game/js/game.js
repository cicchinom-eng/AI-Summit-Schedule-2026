/* Large Language Monsters - game logic: scenes, overworld, desk battles, binder, ending.
   Facts live in models.js and story text in content.js; nothing here needs editing to update facts. */
(function () {
  'use strict';
  const D = window.LLM_DATA, C = window.CONTENT, SP = window.SPR, W = E.W, H = E.H;
  const M = {}; D.models.forEach(m => { M[m.id] = m; });
  const TOTAL = D.models.length;
  const sfx = n => Sound.sfx(n);
  let S = fresh(), tick = 0, booted = false;

  function fresh() {
    return { v: 1, name: 'Teacher', map: 'home', x: 4, y: 5, dir: 'down', team: [], bench: [], size: 0, cards: {}, stamps: {}, flags: {}, prog: {}, lead: null, steps: 0, lastTask: null };
  }
  function fmt(t) { return String(t).replace(/\{P\}/g, S.name).replace(/\{DATE\}/g, D.factsAsOf).replace(/\{KA\}/g, E.label('a')).replace(/\{KB\}/g, E.label('b')); }
  function fill(t, o) { t = fmt(t); for (const k in o) t = t.split('{' + k + '}').join(o[k]); return t; }
  function fillAll(t, o) { return Array.isArray(t) ? t.map(x => fill(x, o)) : fill(t, o); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function helper(id) {
    const m = M[id], sz = m.sizes ? m.sizes[S.size] : null;
    return { id: id, m: m, nick: m.short, sub: sz ? sz.name + ' size' : C.areaTag[m.area], stats: sz ? sz.stats : m.stats, local: m.local, reads: m.reads || [], makes: m.makes || [], spr: SP.portrait(id, S.size) };
  }
  const owned = id => S.team.includes(id) || S.bench.includes(id);
  const cardCount = () => D.models.filter(m => S.cards[m.id]).length;
  const stampCount = () => Object.keys(S.stamps).length;

  /* ============================ scene stack + async helpers ============================ */
  const stack = [], timers = [];
  let fade = 0, busy = 0;
  const push = s => { stack.push(s); return s; };
  const pop = s => { const i = stack.indexOf(s); if (i >= 0) stack.splice(i, 1); };
  const top = () => stack[stack.length - 1];
  const wait = n => new Promise(r => timers.push({ n: n, r: r }));
  async function fadeTo(a, b) { const d = a < b ? 1 : -1; for (let f = a; f !== b + d; f += d) { fade = f; await wait(3); } }
  async function run(fn) { busy++; try { await fn(); } catch (e) { console.error(e); } finally { busy--; } }

  E.hooks.onUpdate = function () {
    tick++;
    for (let i = timers.length - 1; i >= 0; i--) if (--timers[i].n <= 0) timers.splice(i, 1)[0].r();
    for (let i = 0; i < stack.length; i++) if (stack[i].tick) stack[i].tick();
    const t = top(); if (t && t.update) t.update();
  };
  E.hooks.onDraw = function () {
    let i = stack.length - 1;
    while (i > 0 && !stack[i].opaque) i--;
    if (i < 0) E.rect(0, 0, W, H, 0);
    for (; i >= 0 && i < stack.length; i++) if (stack[i].draw) stack[i].draw();
    if (fade) E.fade(fade);
  };
  E.hooks.onMuteKey = () => Sound.toggle();
  document.getElementById('btnSound').addEventListener('click', () => Sound.toggle());

  /* ---------- dialogue box with typewriter text ---------- */
  function say(text) {
    return new Promise(res => {
      const pages = [];
      (Array.isArray(text) ? text : [text]).forEach(t => {
        const lines = E.wrap(fmt(t), 142);
        for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
      });
      if (!pages.length) { res(); return; }
      let p = 0, n = 0;
      const len = () => pages[p].reduce((a, l) => a + l.length, 0);
      const sc = {
        kind: 'say',
        update() {
          if (n < len()) {
            const before = n;
            n += (E.held.a || E.held.b) ? 3 : 1;
            if ((n >> 1) !== (before >> 1)) sfx('text');
            if ((E.just.a || E.just.b) && before > 3) n = len();
          } else if (E.just.a || E.just.b) {
            p++;
            if (p >= pages.length) { pop(sc); res(); } else { n = 0; sfx('next'); }
          }
        },
        draw() {
          E.box(2, 101, 156, 41);
          let left = n;
          pages[Math.min(p, pages.length - 1)].forEach((l, k) => {
            if (left <= 0) return;
            E.text(l.slice(0, left), 9, 106 + k * 10, 3); left -= l.length;
          });
          if (n >= len() && (tick >> 4) % 2) E.more(145, 134);
        }
      };
      push(sc);
    });
  }

  /* ---------- a list of choices; resolves to the index, or -1 if cancelled ---------- */
  function choose(prompt, opts, o) {
    o = o || {};
    return new Promise(res => {
      let i = o.start || 0;
      const maxW = o.w || 150;
      const lines = opts.map(t => E.wrap(fmt(t), maxW - 20));
      const w = Math.min(156, Math.max.apply(null, lines.map(l => Math.max.apply(null, l.map(E.measure)))) + 22);
      const hh = lines.reduce((a, l) => a + l.length * 9 + 2, 0) + 8;
      const pl = prompt ? E.wrap(fmt(prompt), 142) : null;
      const x = 158 - w, y = Math.max(1, o.top ? 14 : (pl ? 99 : 142) - hh);
      const sc = {
        kind: 'choose',
        update() {
          if (E.just.up) { i = (i + opts.length - 1) % opts.length; sfx('move'); }
          if (E.just.down) { i = (i + 1) % opts.length; sfx('move'); }
          if (E.just.a) { sfx('select'); pop(sc); res(i); }
          else if ((E.just.b || E.just.menu) && o.cancel !== false) { sfx('back'); pop(sc); res(-1); }
        },
        draw() {
          if (pl) { E.box(2, 101, 156, 41); pl.slice(0, 3).forEach((l, k) => E.text(l, 9, 106 + k * 10, 3)); }
          E.box(x, y, w, hh);
          let yy = y + 5;
          lines.forEach((l, k) => {
            if (k === i) E.cursor(x + 6, yy);
            l.forEach(t => { E.text(t, x + 14, yy, 3); yy += 9; });
            yy += 2;
          });
        }
      };
      push(sc);
    });
  }

  /* ================================== overworld ================================== */
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const SOLID = 'TWfSRBwkmMxl#bdhVeoq', ENC = '~CLF', MOVE = 12;
  const P = { x: 4, y: 5, dir: 'down', moving: false, t: 0, tx: 0, ty: 0 };
  let map = null, banner = 0, cool = 0;
  Object.keys(C.maps).forEach(k => { const m = C.maps[k]; m.id = k; m.h = m.rows.length; m.w = m.rows[0].length; });

  function tileAt(x, y) { return (y < 0 || y >= map.h || x < 0 || x >= map.w) ? '#' : map.rows[y][x]; }
  function npcs() { return (map.npcs || []).filter(n => (!n.when || S.flags[n.when]) && (!n.unless || !S.flags[n.unless])); }
  function npcAt(x, y) { return npcs().find(n => n.x === x && n.y === y); }
  function walkable(x, y) { return y >= 0 && y < map.h && x >= 0 && x < map.w && SOLID.indexOf(tileAt(x, y)) < 0 && !npcAt(x, y); }
  function setMap(id, x, y, dir) {
    map = C.maps[id]; S.map = id; P.x = x; P.y = y; P.dir = dir || P.dir; P.moving = false; banner = 120; cool = 3;
    Sound.tune('walk', map.tune || 0);
  }
  function save() { S.x = P.x; S.y = P.y; S.dir = P.dir; return E.save(S); }

  const OW = {
    opaque: true,
    update() {
      if (banner > 0) banner--;
      if (busy) return;
      if (P.moving) {
        if (++P.t < MOVE) return;
        P.moving = false; P.x = P.tx; P.y = P.ty; arrive();
        if (busy || top() !== OW) return;
      }
      if (E.just.menu) { run(pauseMenu); return; }
      if (E.just.a) { interact(); return; }
      const d = ['up', 'down', 'left', 'right'].find(k => E.held[k]);
      if (d) {
        P.dir = d;
        const nx = P.x + DIRS[d][0], ny = P.y + DIRS[d][1];
        if (walkable(nx, ny)) { P.moving = true; P.t = 0; P.tx = nx; P.ty = ny; }
      }
    },
    draw() {
      let px = P.x * 16, py = P.y * 16;
      if (P.moving) { px += (P.tx - P.x) * 16 * P.t / MOVE; py += (P.ty - P.y) * 16 * P.t / MOVE; }
      const camX = Math.round(Math.max(0, Math.min(map.w * 16 - W, px + 8 - W / 2)));
      const camY = Math.round(Math.max(0, Math.min(map.h * 16 - H, py + 8 - H / 2)));
      const x0 = camX >> 4, y0 = camY >> 4;
      for (let ty = y0; ty <= y0 + 9 && ty < map.h; ty++) for (let tx = x0; tx <= x0 + 10 && tx < map.w; tx++) {
        const ch = map.rows[ty][tx], fr = SP.tiles[ch] || SP.tiles['.'];
        E.spr(fr[(tick >> 5) % fr.length], tx * 16 - camX, ty * 16 - camY);
        if (ch === 'k' && ty > 0 && 'cCm'.indexOf(map.rows[ty - 1][tx]) >= 0) E.spr(SP.cloudEdge, tx * 16 - camX, ty * 16 - camY);
      }
      const ents = npcs().map(n => ({ y: n.y * 16, x: n.x * 16, img: SP.people[n.spr][n.dir || 'down'][0], bob: n.spr === 'ghost' ? Math.round(Math.sin(tick / 20) * 2) : 0 }));
      const f = P.moving ? (P.t < MOVE / 2 ? ((S.steps & 1) ? 1 : 2) : 0) : 0;
      ents.push({ y: py, x: px, img: SP.people.player[P.dir][f], bob: 0 });
      ents.sort((a, b) => a.y - b.y).forEach(e => E.spr(e.img, e.x - camX, e.y - camY - 3 + e.bob));
      if (banner > 0) {
        const w = E.measure(map.name) + 14, bx = (W - w) >> 1, by = banner > 108 ? 3 - (banner - 108) * 2 : banner < 12 ? 3 - (12 - banner) * 2 : 3;
        E.box(bx, by, w, 15); E.text(map.name, bx + 7, by + 4, 3);
      }
    }
  };

  function arrive() {
    S.steps++;
    const w = map.warps.find(q => q.x === P.x && q.y === P.y);
    if (w) { run(() => warp(w)); return; }
    if (S.map === 'town' && P.y === 1 && (P.x === 9 || P.x === 10) && !S.team.length) {
      run(async () => { await say(C.text.gate); P.dir = 'down'; P.y = 2; });
      return;
    }
    if (ENC.indexOf(tileAt(P.x, P.y)) >= 0 && S.team.length && map.area) {
      cool--;
      if (!S.flags.firstBattle || (cool <= 0 && Math.random() < 0.2)) { cool = 4; run(wild); }
    }
  }
  async function warp(w) {
    sfx('warp');
    await fadeTo(1, 4); setMap(w.to, w.tx, w.ty, w.dir); save(); await fadeTo(3, 0);
  }
  function interact() {
    const x = P.x + DIRS[P.dir][0], y = P.y + DIRS[P.dir][1], n = npcAt(x, y);
    if (n) { n.dir = OPP[P.dir]; sfx('select'); run(() => talk(n)); return; }
    const sign = map.signs && map.signs[x + ',' + y];
    if (sign) { sfx('select'); run(() => say(sign)); return; }
    const fl = C.flavor[tileAt(x, y)];
    if (fl) run(() => say(Array.isArray(fl) ? pick(fl) : fl));
  }
  async function talk(n) {
    if (n.act) return ACT[n.act](n);
    n._i = n._i || 0;
    await say(n.lines[n._i % n.lines.length]); n._i++;
  }

  /* ================================== story scripts ================================== */
  const ACT = {
    async token() {
      const T = C.text.token;
      if (!S.team.length) {
        await say(T.intro);
        let c;
        for (;;) { c = await choose(T.ask, T.options, { cancel: false, w: 156 }); if (c !== 2) break; await say(T.more); }
        const id = c === 0 ? 'claude' : 'gemma';
        S.team.push(id); S.cards[id] = true; S.lead = id; sfx('recruit');
        await say(fillAll(T.gave, { N: M[id].short.toUpperCase() }));
        save(); return;
      }
      const c = await choose(T.menu, T.menuOpts);
      if (c === 0) { S.prog.tip = (S.prog.tip || 0); await say(T.tips[S.prog.tip % T.tips.length]); S.prog.tip++; }
      else if (c === 1) {
        if (!S.bench.length) { await say(T.noBench); return; }
        const a = await choose(T.swapWho, S.bench.map(id => M[id].short).concat(['Never mind']));
        if (a < 0 || a >= S.bench.length) return;
        const b = await choose(T.swapFor, S.team.map(id => M[id].short).concat(['Never mind']));
        if (b < 0 || b >= S.team.length) return;
        const inId = S.bench[a], outId = S.team[b];
        S.team[b] = inId; S.bench[a] = outId; if (S.lead === outId) S.lead = inId;
        sfx('recruit'); await say(fill(T.swapped, { A: M[inId].short, B: M[outId].short })); save();
      }
    },
    async mentor(n) {
      const key = n.key, m = C.mentors[key];
      if (S.stamps[key]) { await say(m.after); return; }
      if (!S.prog[key + 'Met']) { await say(m.intro); S.prog[key + 'Met'] = 1; }
      if (await choose(m.ask, ['Bring it on!', 'Not yet']) !== 0) return;
      for (let i = S.prog[key] || 0; i < m.tasks.length; i++) {
        const r = await battle(C.tasks[m.tasks[i]], {});
        if (r !== 'win') { await say(m.hint[i]); save(); return; }
        S.prog[key] = i + 1; save();
        if (i < m.tasks.length - 1) await say(m.between[i]);
      }
      S.stamps[key] = true; sfx('stamp');
      await say(m.win.concat(['Stamps: ' + stampCount() + ' of 3.' + (stampCount() === 3 ? ' The Benchmark Tower awaits in the Inbox Fields!' : '')]));
      save();
    },
    async guard() {
      if (S.flags.towerOpen) { await say(C.text.guardAfter); return; }
      if (stampCount() < 3) { await say(fill(C.text.guardNo, { V: stampCount() })); return; }
      await say(C.text.guardYes); S.flags.towerOpen = true; sfx('warp'); save();
    },
    async proctor() {
      const T = C.tower;
      if (S.flags.done) { await say(T.after); return; }
      if (!S.prog.towerMet) { await say(T.intro); S.prog.towerMet = 1; }
      if (await choose(T.ask, ['Begin', 'Not yet']) !== 0) return;
      for (let i = S.prog.tower || 0; i < T.tasks.length; i++) {
        const r = await battle(C.tasks[T.tasks[i]], {});
        if (r !== 'win') { await say(T.hint); save(); return; }
        S.prog.tower = i + 1; save();
        await say(T.between[i]);
      }
      if (await battle(C.tasks.hype, {}) === 'win') await ending();
    },
    async sora() {
      if (S.cards.sora) { await say(C.text.soraAfter); return; }
      await say(C.text.sora); S.cards.sora = true; sfx('recruit'); await say(C.text.soraGot); save();
    }
  };

  async function wild() {
    const area = C.areas[map.area];
    const hasVideo = S.team.some(id => M[id].makes.includes('video'));
    const pool = area.tasks.map(id => C.tasks[id]).filter(t => hasVideo || !t.parts.some(p => p.type === 'video'));
    let t;
    if (!S.flags.firstBattle) t = C.tasks[S.team[0] === 'gemma' ? 'budget' : 'pdf'];
    else { let n = 0; do { t = pick(pool); } while (t.id === S.lastTask && ++n < 8); }
    S.lastTask = t.id;
    await battle(t, {
      wild: true,
      after: async v => { const next = area.llms.find(id => !owned(id)); if (next) await recruit(next, v, area.job); }
    });
    S.flags.firstBattle = true; save();
  }

  /* ================================== desk battles ================================== */
  function movesFor(v) {
    return C.moves.map(m => {
      if (m.id !== 'teacher') return m;
      if (v.task.boss) return v.ready ? { id: 'teacher', name: 'RIGHT TOOL' } : { id: 'teacher', name: '? ? ?', locked: true };
      return { id: 'teacher', name: v.task.teacherMove ? v.task.teacherMove.name : m.name };
    });
  }
  function moveDesc(m, h) {
    const s = h.stats || {}, T = C.moveHelp[m.id];
    if (m.locked) return 'A move you have not remembered yet...';
    if (m.id === 'senses') return fill(T, { V: h.reads.join(', ') });
    if (m.id === 'local') return fill(T, { V: { yes: 'yes', server: 'big servers only', no: 'no' }[h.local] });
    if (m.id === 'video') return fill(T, { V: h.makes.join(', ') });
    return fill(T, { V: s[m.id] });
  }
  // The whole rule book: how well does this helper's move fit this task?
  function resolve(v, h, mv) {
    const t = mv.id, task = v.task, X = C.moveText;
    const miss = text => ({ dmg: 0, grade: 'none', text: text });
    if (task.boss) {
      if (t === 'teacher' && v.ready) return { part: v.parts[0], dmg: 99, grade: 'great', text: task.use };
      return miss(task.taunts[v.tries % task.taunts.length]);
    }
    const open = v.parts.filter(p => p.hp > 0), cur = open[0];
    const part = open.find(p => p.type === t);
    const texty = h.makes.includes('text');
    if (!part) {
      if (t === 'teacher') return { part: cur, dmg: 1, grade: 'ok', text: X.verifyAny };
      if (cur.type === 'teacher') return miss(cur.miss);
      if (cur.type === 'video' && !h.makes.includes('video')) return miss(X.video.none);
      if (cur.type === 'local' && h.local === 'no') return miss(X.local.none);
      if (!texty && t !== 'video') return miss(X.videoOnly);
      return miss(X.wrong + ' ' + X.hint[cur.type]);
    }
    const hit = (g, text) => ({ part: part, dmg: { great: 3, ok: 2, poor: 1 }[g], grade: g, text: part[g] || text });
    if (t === 'teacher') return { part: part, dmg: part.hp, grade: 'great', text: (task.teacherMove || X.teacher).text };
    if (t === 'video') {
      if (!h.makes.includes('video')) return miss(X.video.none);
      if (part.local && h.local !== 'yes') return miss(X.video.cloudOnly);
      return hit('great', X.video.great);
    }
    if (!texty) return miss(X.videoOnly);
    if (t === 'local') {
      if (h.local === 'yes') return hit('great', X.local.great);
      if (h.local === 'server') return part.modest ? miss(X.local.tooBig) : hit('ok', X.local.ok);
      return miss(X.local.none);
    }
    if (t === 'senses') return h.reads.includes(part.sense) ? hit('great', X.senses.great) : miss(X.senses.none);
    const s = h.stats[t], g = s >= 4 ? 'great' : s === 3 ? 'ok' : 'poor';
    return hit(g, X[t][g]);
  }

  function battleView(v) {
    return {
      kind: 'battle', v: v, opaque: true,
      tick() {
        if (v.shake > 0) v.shake--; if (v.hop > 0) v.hop--; if (v.stampT > 0) v.stampT--;
        v.parts.forEach(p => { if (p.show > p.hp) p.show = Math.max(p.hp, p.show - 0.12); });
      },
      draw() {
        const t = v.task;
        E.rect(0, 0, W, H, 0);
        for (let y = 26; y < 68; y += 8) for (let x = ((y >> 3) & 1) * 4 + 2; x < W; x += 8) E.rect(x, y, 1, 1, 1);
        E.rect(0, 70, W, 2, 3); E.rect(0, 72, W, 72, 1); E.rect(0, 74, W, 1, 0);
        E.rect(0, 0, W, 11, 3); E.text(t.name, 4, 2, 0);
        if (!t.boss) for (let i = 0; i < v.maxTurns; i++) {
          const x = W - 9 - i * 8;
          E.rect(x, 2, 7, 7, 0); E.rect(x + 1, 3, 5, 5, i < v.turns ? 1 : 3);
          if (i < v.turns) { E.rect(x + 3, 4, 1, 2, 3); E.rect(x + 3, 5, 2, 1, 3); }
        }
        const n = v.parts.length, bw = ((W - 8 - (n - 1) * 6) / n) | 0;
        v.parts.forEach((p, i) => {
          const x = 4 + i * (bw + 6), lw = E.measure(p.label) + 3, w = bw - lw;
          E.text(p.label, x, 13, 3);
          E.rect(x + lw, 14, w, 5, 3); E.rect(x + lw + 1, 15, w - 2, 3, 0); E.rect(x + lw + 1, 15, Math.round((w - 2) * p.show / p.max), 3, 2);
        });
        const h = helper(v.hid), hy = v.hop > 0 ? -Math.round(Math.sin(v.hop / 14 * Math.PI) * 5) : 0;
        E.box(3, 21, 60, 61); E.spr(h.spr, 13, 22 + hy); E.textC(h.nick, 33, 62, 3); E.textC(h.sub, 33, 70, 2);
        const sx = v.slide + (v.shake ? ((v.shake >> 1) & 1 ? 2 : -2) : 0);
        if (v.guest) {
          E.rect(104 + sx, 70, 32, 1, 2);
          E.spr(SP.portrait(v.guest, 1), 100 + sx, 30 + Math.round(Math.sin(tick / 12) * 1.5));
        } else if (!v.gone || (v.goneT++ < 24 && (v.goneT >> 2) % 2)) {
          const sp = SP.task[t.sprite];
          E.rect(120 - sp.width / 2 + 3 + sx, 70, sp.width - 6, 1, 2);
          E.spr(sp, 120 - sp.width / 2 + sx, 70 - sp.height + Math.round(Math.sin(tick / 16) * 1.5));
        }
        if (v.stampT > 0 && v.stamp) {
          const lab = C.grades[v.stamp], w = E.measure(lab) + 9, x = 96 - (w >> 1), y = 24 + (v.stampT > 44 ? (v.stampT - 44) : 0);
          E.rect(x - 1, y - 1, w + 2, 15, 0); E.rect(x, y, w, 13, 3);
          if (v.stamp !== 'great') E.rect(x + 1, y + 1, w - 2, 11, 0);
          E.text(lab, x + 5, y + 3, v.stamp === 'great' ? 0 : 3);
        }
      }
    };
  }
  function moveGrid(v) {
    return new Promise(res => {
      let i = v.lastMove || 0;
      const sc = {
        kind: 'grid',
        update() {
          if (E.just.left || E.just.right) { i ^= 1; sfx('move'); }
          if (E.just.up) { i = (i + 6) % 8; sfx('move'); }
          if (E.just.down) { i = (i + 2) % 8; sfx('move'); }
          if (E.just.a) { v.lastMove = i; sfx('select'); pop(sc); res(i); }
          else if (E.just.b) { sfx('back'); pop(sc); res(-1); }
        },
        draw() {
          const mv = movesFor(v), h = helper(v.hid);
          E.text(E.label('b') + ': switch helper', 70, 73, 2);
          E.box(2, 82, 156, 61);
          mv.forEach((m, k) => {
            const x = k % 2 ? 87 : 13, y = 87 + (k >> 1) * 8;
            if (k === i) E.cursor(x - 6, y);
            E.text(m.name, x, y, 3);
          });
          E.rect(6, 120, 148, 1, 1);
          E.wrap(moveDesc(mv[i], h), 144).slice(0, 2).forEach((l, k) => E.text(l, 8, 123 + k * 8, 2));
        }
      };
      push(sc);
    });
  }
  async function moveMenu(v, o) {
    for (;;) {
      const i = await moveGrid(v);
      if (i >= 0) { const mv = movesFor(v)[i]; if (mv.locked) { await say(C.text.locked); continue; } return mv; }
      const r = await teamScene({ battle: true, wild: o.wild, cur: v.hid });
      if (r === 'flee') return 'flee';
      if (r) v.hid = r;
    }
  }
  async function battle(task, o) {
    const n = task.parts.length, hp = n > 1 ? 3 : 6, turns = task.boss ? 0 : (n > 1 ? 5 : 4);
    const v = {
      task: task, parts: task.parts.map(p => Object.assign({}, p, { hp: hp, max: hp, show: hp })), turns: turns, maxTurns: turns,
      hid: S.team.includes(S.lead) ? S.lead : S.team[0], slide: 80, shake: 0, hop: 0, stamp: null, stampT: 0, gone: false, goneT: 0, guest: null, tries: 0, ready: false, lastMove: 0
    };
    sfx('appear');
    fade = 2; await wait(4); fade = 0; await wait(4); fade = 2; await wait(4);
    await fadeTo(3, 4);
    const view = push(battleView(v));
    Sound.tune('battle', task.boss ? 3 : 0);
    await fadeTo(3, 0);
    while (v.slide > 0) { v.slide = Math.max(0, v.slide - 6); await wait(1); }
    await say(task.intro);
    let result;
    for (;;) {
      const mv = await moveMenu(v, o);
      if (mv === 'flee') { await say(C.text.flee); result = 'flee'; break; }
      const h = helper(v.hid); S.lead = v.hid;
      const r = resolve(v, h, mv);
      v.hop = 14; sfx('use'); await wait(16);
      if (r.dmg > 0) { r.part.hp = Math.max(0, r.part.hp - r.dmg); v.shake = 14; }
      v.stamp = r.grade; v.stampT = 50; sfx(r.grade === 'great' ? 'great' : r.grade === 'none' ? 'nope' : 'hit');
      await wait(36);
      const part = r.part || v.parts.find(p => p.hp > 0) || v.parts[0];
      await say(fill(r.text, { N: h.nick.toUpperCase(), S: C.senseWord[part.sense] || 'that', T: task.name }));
      if (task.boss && !v.ready && r.dmg === 0 && ++v.tries >= 2) { v.ready = true; sfx('recruit'); await say(task.learn); }
      if (v.parts.every(p => p.hp <= 0)) {
        v.gone = true; sfx('win'); await wait(34);
        await say(task.boss ? task.finale : fill(C.text.cleared, { T: task.name }));
        if (task.lesson && !S.flags['L_' + task.id]) { S.flags['L_' + task.id] = 1; await say(task.lesson); }
        result = 'win';
        if (o.after) await o.after(v);
        break;
      }
      if (!task.boss && --v.turns <= 0) { sfx('nope'); await say(fill(C.text.timeup, { T: task.name })); result = 'lose'; break; }
    }
    await fadeTo(1, 4); pop(view); Sound.tune('walk', map.tune || 0); await fadeTo(3, 0);
    return result;
  }

  /* ---------- recruiting: write a clear, specific Welcome Prompt ---------- */
  async function recruit(id, v, job) {
    const m = M[id], o = { N: m.short.toUpperCase(), J: job };
    v.guest = id; v.slide = 80; sfx('appear');
    while (v.slide > 0) { v.slide = Math.max(0, v.slide - 6); await wait(1); }
    await say(fill(C.text.appear, o));
    for (let tries = 0; tries < 2; tries++) {
      const opts = [['good', fill(pick(C.text.promptGood), { N: m.short, J: job })], ['vague', pick(C.text.promptVague)], ['bossy', pick(C.text.promptBossy)]]
        .sort(() => Math.random() - 0.5);
      if (!tries) await say(fill(C.text.promptQ, o));
      const c = await choose(null, opts.map(q => q[1]).concat([C.text.promptSkip]), { w: 156, cancel: false });
      if (c === 3) { await say(fill(C.text.skipped, o)); return; }
      if (opts[c][0] === 'good') {
        sfx('great'); await say(fill(C.text.goodPrompt, o));
        S.cards[id] = true;
        if (S.team.length < 6) { S.team.push(id); sfx('recruit'); await say(fill(C.text.joined, o)); }
        else {
          const k = await choose(C.text.full, S.team.map(t => M[t].short).concat(['Send ' + m.short]), { cancel: false });
          if (k < S.team.length) { const out = S.team[k]; S.bench.push(out); S.team[k] = id; if (S.lead === out) S.lead = id; sfx('recruit'); await say(fill(C.text.joined, o)); }
          else { S.bench.push(id); await say(fill(C.text.benched, o)); }
          await say(C.text.fullNote);
        }
        return;
      }
      sfx('nope');
      await say(fill(opts[c][0] === 'vague' ? C.text.vagueFail : C.text.bossyFail, o));
    }
    await say(fill(C.text.leaves, o));
  }

  /* ================================== team screen ================================== */
  function ioIcons(list, x, y) { list.forEach((k, i) => E.icon(k, x + i * 10, y, 3)); }
  function teamScene(o) {
    o = o || {};
    return new Promise(res => {
      let i = Math.max(0, S.team.indexOf(o.cur));
      const extra = o.wild ? 1 : 0;
      const sc = {
        kind: 'team', opaque: true,
        update() {
          const n = S.team.length + extra;
          if (E.just.up) { i = (i + n - 1) % n; sfx('move'); }
          if (E.just.down) { i = (i + 1) % n; sfx('move'); }
          if (i < S.team.length && M[S.team[i]].sizes) {
            if (E.just.left && S.size > 0) { S.size--; sfx('move'); }
            if (E.just.right && S.size < 2) { S.size++; sfx('move'); }
          }
          if (E.just.a) { sfx('select'); pop(sc); res(i < S.team.length ? S.team[i] : 'flee'); }
          else if (E.just.b || E.just.menu) { sfx('back'); pop(sc); res(null); }
        },
        draw() {
          E.rect(0, 0, W, H, 0); E.rect(0, 0, W, 11, 3);
          E.text(o.battle ? 'SWITCH HELPER' : 'YOUR TEAM', 4, 2, 0);
          S.team.forEach((id, k) => { const y = 17 + k * 11; if (k === i) E.cursor(4, y); E.text(M[id].short, 11, y, 3); });
          if (o.wild) { const y = 20 + S.team.length * 11; if (i === S.team.length) E.cursor(4, y); E.text('WALK AWAY', 11, y, 2); }
          if (i < S.team.length) {
            const h = helper(S.team[i]);
            E.box(82, 13, 76, 88); E.spr(h.spr, 100, 15); E.textC(h.sub, 120, 56, 2);
            [['CTX', 'context'], ['REA', 'reasoning'], ['SPD', 'speed'], ['THR', 'thrift']].forEach((r, k) => {
              E.text(r[0], 89, 66 + k * 8, 3); E.pips(114, 66 + k * 8, h.stats[r[1]]);
            });
            E.box(2, 103, 156, 39);
            E.text('LOCAL: ' + { yes: 'yes', server: 'big servers only', no: 'no (cloud only)' }[h.local], 8, 108, 3);
            E.text('IN', 8, 118, 3); ioIcons(h.reads, 22, 118); E.text('OUT', 82, 118, 3); ioIcons(h.makes, 104, 118);
            E.text(fmt(h.m.sizes ? '< > size dial   {KA}: ' + (o.battle ? 'pick' : 'card') : '{KA}: ' + (o.battle ? 'pick' : 'card') + '   {KB}: back'), 8, 129, 2);
          } else {
            E.box(2, 103, 156, 39); E.text('Set this task aside for now.', 8, 113, 3);
          }
        }
      };
      push(sc);
    });
  }

  /* ================================== model card binder ================================== */
  // Card text flows onto as many pages as it needs, so longer facts in models.js never overflow.
  function textPages(m) {
    const items = [], MAXH = 114;
    const add = (label, body) => {
      items.push({ h: 12, label: label });
      E.wrap(body, 150).forEach(l => items.push({ h: 9, text: l }));
      items.push({ h: 4 });
    };
    add('KNOWN FOR', m.knownFor); add('CAVEAT', m.caveat); add('CLASSROOM ANGLE', m.classroom);
    items.push({ h: 9, text: 'Facts as of ' + D.factsAsOf + '.', dim: true });
    const pages = [[]]; let y = 0;
    items.forEach(it => {
      if (y + it.h + (it.label ? 18 : 0) > MAXH && y > 0) { pages.push([]); y = 0; }
      if (y === 0 && !it.label && !it.text) return;
      pages[pages.length - 1].push(it); y += it.h;
    });
    return pages;
  }
  function drawCard(m, page, pages) {
    const isC = !!m.sizes, stats = isC ? m.sizes[S.size].stats : m.stats;
    E.rect(0, 0, W, H, 0); E.rect(0, 0, W, 11, 3);
    E.text(E.measure(m.name) > 118 ? m.short : m.name, 4, 2, 0);
    const pg = (page + 1) + '/' + (pages.length + 1); E.text(pg, W - 4 - E.measure(pg), 2, 1);
    if (page === 0) {
      E.box(3, 14, 46, 46); E.spr(SP.portrait(m.id, S.size), 6, 17);
      let y = 15;
      E.wrap(m.maker, 104).slice(0, 2).forEach(l => { E.text(l, 53, y, 3); y += 9; });
      y += 2;
      E.wrap(m.category, 104).slice(0, isC ? 1 : 3).forEach(l => { E.text(l, 53, y, 2); y += 9; });
      if (isC) {
        // The size dial: three tabs, the current one filled in.
        E.text('SIZE DIAL', 53, 38, 3);
        let x = 53;
        m.sizes.forEach((z, i) => {
          const w = E.measure(z.name) + 5;
          if (i === S.size) { E.rect(x, 47, w, 11, 3); E.text(z.name, x + 3, 49, 0); }
          else { E.rect(x, 47, w, 11, 2); E.rect(x + 1, 48, w - 2, 9, 0); E.text(z.name, x + 3, 49, 2); }
          x += w + 2;
        });
      }
      if (stats) {
        [['CONTEXT', 'context'], ['REASONING', 'reasoning'], ['SPEED', 'speed'], ['THRIFT', 'thrift']].forEach((r, i) => {
          E.text(r[0], 5, 64 + i * 9, 3); E.pips(70, 64 + i * 9, stats[r[1]]);
        });
      } else { E.box(5, 66, 150, 26); E.textC('RETIRED IN 2026', 80, 71, 3); E.textC('No stats. Gone but not forgotten.', 80, 81, 2); }
      E.text('OPENNESS', 5, 101, 3); E.text(m.openness, 84, 101, 2);
      E.text('RUNS LOCALLY', 5, 110, 3); E.text({ yes: 'yes', server: 'big servers', no: 'no' }[m.local], 84, 110, 2);
      E.text('IN', 5, 120, 3); ioIcons(m.reads || [], 20, 120); E.text('OUT', 84, 120, 3); ioIcons(m.makes || [], 106, 120);
    } else {
      let y = 15;
      (pages[page - 1] || []).forEach(it => {
        if (it.label) { E.rect(4, y, E.measure(it.label) + 6, 9, 2); E.text(it.label, 7, y + 1, 0); }
        else if (it.text) E.text(it.text, 5, y, it.dim ? 2 : 3);
        y += it.h;
      });
    }
    E.rect(0, 132, W, 1, 1);
    E.text(fmt(page === 0 ? (isC ? '{KA}: size dial   < > page   {KB}: back' : '{KA}: explain   < > page   {KB}: back') : '< > page   ^ v card   {KB}: back'), 4, 135, 2);
  }
  function cardScene(ids, k) {
    return new Promise(res => {
      let page = 0, tip = 0, cache = {};
      const pagesOf = id => cache[id] || (cache[id] = textPages(M[id]));
      const count = () => pagesOf(ids[k]).length + 1;
      const sc = {
        opaque: true,
        update() {
          if (E.just.left) { page = (page + count() - 1) % count(); sfx('move'); }
          if (E.just.right) { page = (page + 1) % count(); sfx('move'); }
          if (E.just.up && ids.length > 1) { k = (k + ids.length - 1) % ids.length; page = Math.min(page, 1); sfx('move'); }
          if (E.just.down && ids.length > 1) { k = (k + 1) % ids.length; page = Math.min(page, 1); sfx('move'); }
          if (E.just.a) {
            if (page === 0) {
              const m = M[ids[k]];
              const explain = () => { const h = D.statHelp[tip++ % D.statHelp.length]; say(h[0] + ': ' + h[1]); };
              sfx('select');
              if (m.sizes) {
                choose('Turn the size dial and watch the stats change!', m.sizes.map(z => z.name + ' size').concat(['Explain the stats']), { start: S.size })
                  .then(c => { if (c >= 0 && c < m.sizes.length) { S.size = c; sfx('great'); } else if (c === m.sizes.length) explain(); });
              } else explain();
            }
            else { page = (page + 1) % count(); sfx('move'); }
          } else if (E.just.b || E.just.menu) { sfx('back'); pop(sc); res(); }
        },
        draw() { drawCard(M[ids[k]], page, pagesOf(ids[k])); }
      };
      push(sc);
    });
  }
  function binder(o) {
    o = o || {};
    return new Promise(res => {
      let i = 0, first = 0;
      const list = D.models, has = id => o.all || S.cards[id], ROWS = 10;
      const sc = {
        opaque: true,
        update() {
          if (E.just.up) { i = (i + list.length - 1) % list.length; sfx('move'); }
          if (E.just.down) { i = (i + 1) % list.length; sfx('move'); }
          if (i < first) first = i; if (i >= first + ROWS) first = i - ROWS + 1;
          if (E.just.a) {
            if (has(list[i].id)) { sfx('select'); const ids = list.filter(m => has(m.id)).map(m => m.id); cardScene(ids, ids.indexOf(list[i].id)); }
            else sfx('nope');
          } else if (E.just.b || E.just.menu) { sfx('back'); pop(sc); res(); }
        },
        draw() {
          E.rect(0, 0, W, H, 0); E.rect(0, 0, W, 11, 3); E.text('MODEL CARD BINDER', 4, 2, 0);
          const cnt = (o.all ? TOTAL : cardCount()) + '/' + TOTAL; E.text(cnt, W - 4 - E.measure(cnt), 2, 1);
          for (let r = 0; r < ROWS && first + r < list.length; r++) {
            const m = list[first + r], y = 15 + r * 10, k = first + r;
            if (k === i) E.cursor(3, y);
            E.text((k < 9 ? '0' : '') + (k + 1), 10, y, 2);
            E.text(has(m.id) ? m.short : '? ? ? ?', 25, y, has(m.id) ? 3 : 2);
          }
          if (first > 0) E.text('^', 88, 15, 2);
          if (first + ROWS < list.length) E.text('v', 88, 105, 2);
          const m = list[i];
          E.box(100, 14, 56, 58);
          E.spr(has(m.id) ? SP.portrait(m.id, S.size) : SP.shadow(m.id), 108, 17);
          E.textC(has(m.id) ? C.areaTag[m.area] : '???', 128, 60, 2);
          E.wrap(has(m.id) ? m.maker : 'Found in ' + C.areaName[m.area], 58).slice(0, 4).forEach((l, k) => E.text(l, 100, 76 + k * 9, 2));
          E.rect(0, 118, W, 1, 1);
          E.text(fmt('{KA}: open card   {KB}: back'), 4, 122, 3);
          E.text('Facts as of ' + D.factsAsOf, 4, 133, 2);
        }
      };
      push(sc);
    });
  }

  /* ================================== pause menu ================================== */
  function goal() {
    if (!S.team.length) return 'GOAL: Visit Ms. Token at the library, the building on the left side of town.';
    if (!S.flags.firstBattle) return 'GOAL: Walk north to the Inbox Fields and step into the paper piles.';
    if (stampCount() < 3) {
      const need = [['cloud', 'Cloud City (north)'], ['woods', 'the Woods (west)'], ['studio', 'Pixel Studio (east)']].filter(q => !S.stamps[q[0]]).map(q => q[1]);
      return 'GOAL: Earn mentor stamps. Still to visit: ' + need.join(', ') + '.';
    }
    if (!S.flags.done) return 'GOAL: Climb the Benchmark Tower in the Inbox Fields.';
    return 'You did it! Keep exploring to fill your binder: ' + cardCount() + ' of ' + TOTAL + ' cards.';
  }
  async function pauseMenu() {
    sfx('select');
    let last = 0;
    for (;;) {
      const c = await choose(null, ['TEAM', 'BINDER', 'GOAL', 'SAVE', 'SOUND: ' + (Sound.muted ? 'OFF' : 'ON'), 'QUIT TO TITLE', 'CLOSE'], { start: last, top: true });
      last = Math.max(0, c);
      if (c === 0) { if (!S.team.length) { await say('No helpers yet! Go see Ms. Token.'); continue; } for (;;) { const id = await teamScene({}); if (!id) break; await cardScene([id], 0); } }
      else if (c === 1) await binder({});
      else if (c === 2) await say(goal());
      else if (c === 3) await say(save() ? C.text.saved : C.text.saveFail);
      else if (c === 4) Sound.toggle();
      else if (c === 5) { if (await choose('Save and return to the title screen?', ['Yes', 'No']) === 0) { save(); await fadeTo(1, 4); title(); await fadeTo(3, 0); return; } }
      else return;
    }
  }

  /* ================================== title, name, credits ================================== */
  function askName() {
    return new Promise(res => {
      const dlg = document.getElementById('nameDlg'), form = document.getElementById('nameForm'), inp = document.getElementById('nameInput');
      dlg.hidden = false; inp.value = ''; setTimeout(() => { try { inp.focus(); } catch (e) { /* fine */ } }, 50);
      form.onsubmit = ev => {
        ev.preventDefault();
        const v = inp.value.replace(/[^\x20-\x7E]/g, '').trim().slice(0, 12) || 'Teacher';
        inp.blur(); dlg.hidden = true; res(v);
      };
    });
  }
  function title() {
    stack.length = 0;
    Sound.tune('title', 0);
    const hasSave = !!E.load();
    const items = (hasSave ? ['CONTINUE'] : []).concat(['NEW GAME', 'CARD BINDER', 'CREDITS']);
    const parade = D.models.map(m => m.id);
    let i = 0, lock = false, t0 = booted ? tick - 200 : tick;
    booted = true;
    const sc = {
      opaque: true,
      update() {
        if (lock) return;
        if (tick - t0 < 70) { if (E.just.a || E.just.b) t0 = tick - 200; return; }
        if (E.just.up) { i = (i + items.length - 1) % items.length; sfx('move'); }
        if (E.just.down) { i = (i + 1) % items.length; sfx('move'); }
        if (E.just.a) { sfx('select'); lock = true; act(items[i]).then(() => { lock = false; }); }
      },
      draw() {
        E.rect(0, 0, W, H, 0);
        for (let x = 0; x < W; x += 16) E.spr(SP.tiles['.'][0], x, 80);
        E.rect(0, 79, W, 1, 3);
        // Opening flourish: the logo drops in, then three helpers hop up one by one.
        const a = tick - t0, drop = Math.max(0, 26 - a), ly = -Math.round(drop * drop / 12);
        const bounce = a >= 26 && a < 38 ? -Math.round(Math.sin((a - 26) / 12 * Math.PI) * 3) : 0;
        E.textC('LARGE LANGUAGE', 80, 5 + ly, 2);
        E.textC('MONSTERS', 81, 16 + ly + bounce, 1, 2); E.textC('MONSTERS', 80, 15 + ly + bounce, 3, 2);
        if (a > 34) E.textC('Right Tool, Right Job', 80, 32, 2);
        const base = (tick / 240) | 0;
        for (let k = 0; k < 3; k++) {
          const id = parade[(base * 3 + k) % parade.length], start = 30 + k * 10;
          if (a < start) continue;
          const up = Math.min(1, (a - start) / 12), hop = up < 1 ? Math.round((1 - up) * 44 - Math.sin(up * Math.PI) * 10) : 0;
          E.ctx.save(); E.ctx.beginPath(); E.ctx.rect(0, 0, W, 80); E.ctx.clip();
          E.spr(SP.portrait(id, 1), 14 + k * 46, 40 + hop + Math.round(Math.sin(tick / 14 + k * 2) * 2));
          E.ctx.restore();
        }
        if (a >= 70) {
          const hh = items.length * 9 + 9, y = 84;
          E.box(36, y, 88, hh);
          items.forEach((t, k) => { if (k === i) E.cursor(44, y + 5 + k * 9); E.text(t, 52, y + 5 + k * 9, 3); });
        }
        E.textC('Facts as of ' + D.factsAsOf, 80, 134, 3);
      }
    };
    async function act(what) {
      if (what === 'CARD BINDER') { await binder({ all: true }); return; }
      if (what === 'CREDITS') { await credits(); return; }
      if (what === 'CONTINUE') {
        S = Object.assign(fresh(), E.load());
        if (!C.maps[S.map]) { S.map = 'town'; S.x = 9; S.y = 8; }
        await fadeTo(1, 4); stack.length = 0; setMap(S.map, S.x, S.y, S.dir); push(OW); await fadeTo(3, 0);
        return;
      }
      if (hasSave && await choose('Start over? Your saved game will be replaced.', ['No, keep it', 'Yes, start fresh']) !== 1) return;
      const name = await askName();
      S = fresh(); S.name = name;
      await fadeTo(1, 4); stack.length = 0; setMap('home', 4, 5, 'down'); push(OW); await fadeTo(3, 0);
      run(async () => { await say(C.text.opening); save(); });
    }
    push(sc);
  }
  function credits() {
    return new Promise(res => {
      const lines = C.text.credits.map(fmt);
      let y = H;
      const sc = {
        opaque: true,
        update() {
          y -= E.held.a ? 1.5 : 0.35;
          if (E.just.b || E.just.menu || y < -lines.length * 11 - 10) { pop(sc); res(); }
        },
        draw() {
          E.rect(0, 0, W, H, 0);
          lines.forEach((l, k) => { const yy = Math.round(y + k * 11); if (yy > -10 && yy < H) E.textC(l, 80, yy, k === 0 ? 3 : 2); });
          E.rect(0, 0, W, 9, 3); E.text('CREDITS', 4, 1, 0); E.text(fmt('{KB}: skip'), W - 4 - E.measure('B: skip'), 1, 1);
        }
      };
      push(sc);
    });
  }

  /* ================================== ending ================================== */
  function endScene() {
    let page = 0, done;
    const sc = {
      opaque: true, finished: new Promise(r => { done = r; }),
      update() { if (E.just.a || E.just.b) { sfx('next'); if (++page > 2) { page = 2; done(); } } },
      draw() {
        E.rect(0, 0, W, H, 0);
        if (page === 0) {
          E.textC('YOU DID IT,', 80, 8, 2); E.textC(S.name.toUpperCase() + '!', 80, 19, 3, 2);
          E.spr(SP.task.hype, 60, 38 + Math.round(Math.sin(tick / 20) * 2));
          E.textC('THE HYPE CYCLE is now a', 80, 82, 3); E.textC('calm, useful plateau.', 80, 91, 3);
          E.box(20, 103, 120, 26);
          E.textC('MODEL CARDS  ' + cardCount() + ' / ' + TOTAL, 80, 108, 3);
          E.textC('MENTOR STAMPS  ' + stampCount() + ' / 3', 80, 118, 3);
        } else {
          E.rect(0, 0, W, 11, 3); E.text('WHAT YOU LEARNED', 4, 2, 0); E.text(page + '/2', W - 4 - E.measure(page + '/2'), 2, 1);
          let y = 20;
          C.text.learned.forEach((t, k) => {
            if (((k / 3) | 0) !== page - 1) return;
            E.text((k + 1) + '.', 4, y, 2);
            E.wrap(t, 138).forEach(l => { E.text(l, 16, y, 3); y += 10; });
            y += 8;
          });
        }
        if ((tick >> 4) % 2) E.more(149, 136);
      }
    };
    return sc;
  }
  function showCert() {
    return new Promise(res => {
      const el = document.getElementById('cert');
      document.getElementById('certName').textContent = S.name;
      document.getElementById('certDate').textContent = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      document.getElementById('certCount').textContent = cardCount() + ' of ' + TOTAL + ' model cards';
      document.getElementById('certFacts').textContent = 'Model facts in this game were current as of ' + D.factsAsOf + '. The field moves fast: verify before you teach.';
      try { document.getElementById('certSeal').src = SP.portrait(S.team[0] || 'gemma', S.size).toDataURL(); } catch (e) { /* fine */ }
      el.hidden = false; el.scrollTop = 0;
      document.getElementById('certPrint').onclick = () => window.print();
      document.getElementById('certClose').onclick = () => { el.hidden = true; res(); };
    });
  }
  async function ending() {
    S.flags.done = true; save();
    Sound.tune('title', 0);
    await fadeTo(1, 4);
    const sc = push(endScene());
    await fadeTo(3, 0);
    await sc.finished;
    await showCert();
    await credits();
    await fadeTo(1, 4); title(); await fadeTo(3, 0);
  }

  /* ================================== boot ================================== */
  window.LLMG = {
    get state() { return S; }, stack: stack, P: P,
    give(id) { if (!S.team.includes(id)) S.team.push(id); S.cards[id] = true; },
    go(id, x, y) { setMap(id, x, y, 'down'); },
    battle(id) { return run(() => battle(C.tasks[id], { wild: true })); },
    cert: showCert, ending: () => run(ending)
  };
  if (/[?&]sheet/.test(location.search)) {
    // Art contact sheet for checking sprites: open index.html?sheet
    const c = document.createElement('canvas'); c.width = 480; c.height = 300;
    c.style.cssText = 'position:fixed;left:0;top:0;width:960px;height:600px;image-rendering:pixelated;z-index:99;background:' + E.PAL[0];
    document.body.appendChild(c);
    const g = c.getContext('2d'); let x = 0, y = 0;
    const put = (img, step) => { if (x + img.width > 480) { x = 0; y += step; } g.drawImage(img, x, y); x += img.width + 2; };
    Object.keys(SP.llm).forEach(k => put(SP.llm[k], 42)); x = 0; y += 42;
    Object.keys(SP.task).forEach(k => put(SP.task[k], 42)); x = 0; y += 42;
    Object.keys(SP.tiles).forEach(k => SP.tiles[k].forEach(t => put(t, 18))); x = 0; y += 18;
    Object.keys(SP.people).forEach(k => ['down', 'up', 'left', 'right'].forEach(d => put(SP.people[k][d][0], 18)));
  }
  document.getElementById('nameForm').addEventListener('submit', ev => ev.preventDefault());
  // Home-screen and tab icons, drawn from the game's own art (no image files).
  try {
    const ic = document.createElement('canvas'); ic.width = ic.height = 180;
    const g = ic.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = E.PAL[3]; g.fillRect(0, 0, 180, 180); g.fillStyle = E.PAL[0]; g.fillRect(14, 14, 152, 152);
    g.drawImage(SP.portrait('gemini', 1), 30, 28, 120, 120);
    const url = ic.toDataURL('image/png');
    document.querySelector('link[rel="icon"]').href = url;
    const l = document.createElement('link'); l.rel = 'apple-touch-icon'; l.href = url; document.head.appendChild(l);
  } catch (e) { /* icons are a nicety */ }
  title();
  E.start();
})();
