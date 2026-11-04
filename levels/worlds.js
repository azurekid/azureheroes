/* Azure region worlds. Each level is a real Azure region with its landmarks, and its layout is generated
   fresh on every play (AH.Levels.make) - obstacles, enemies and pickups land in new places each time.
   Output follows the game-contract Level format. Every generated level is completable by construction:
   run gaps <= 200px (>130px needs the double jump), rises are limited, and flight gaps are >= 130px. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  };

  /* ---------------------------------------------------------------- RUN (rooftops) */
  const POWER_RUN = ['copilot', 'defender', 'actions', 'powerbi', 'teams'];
  const POWER_FLY = ['copilot', 'defender', 'powerbi', 'teams'];
  function powerKinds(n, list) {
    const out = ['copilot', 'teams'];
    while (out.length < n) out.push(pick(list));
    return shuffle(out).slice(0, n);
  }

  // Terrain mixes plain gaps with steps (walls to jump up), drops, floating upper-tier platforms and stepping stones over wide gaps.
  function makeRun(m) {
    const o = m.opt;
    const P = [{ x: 0, y: 270, w: 420, h: 130 }];
    let y = 270;
    for (let i = 1; i <= o.count; i++) {
      const prev = P[P.length - 1];
      const r = Math.random();
      let kind = i > 1 && r < o.stepRate ? 'step' : i > 1 && r < o.stepRate + o.dropRate ? 'drop' : 'gap';
      let gap = 0, ny = y;
      if (kind === 'step') { ny = y - ri(35, 62); if (ny < 195) kind = 'drop'; }
      if (kind === 'drop') { gap = ri(50, 110); ny = y + ri(40, 90); if (ny > 300) kind = 'gap'; }
      if (kind === 'gap') {
        gap = ri(o.gapMin, o.gapMax);
        const maxRise = gap > 140 ? 20 : 30;
        ny = clamp(y + ri(-maxRise, 40), 195, 300);
      }
      y = ny;
      const w = i === o.count ? 480 : ri(o.minW, o.maxW);
      P.push({ x: prev.x + prev.w + gap, y: y, w: w, h: 400 - y });
    }
    const n = P.length;

    // checkpoints first so hazards never share their rooftop
    const cpIdx = [];
    for (let i = o.cpEvery; i < n - 1; i += o.cpEvery) cpIdx.push(i);
    cpIdx.push(n - 1);
    const free = [];
    for (let i = 2; i < n - 1; i++) if (cpIdx.indexOf(i) < 0) free.push(i);
    shuffle(free);

    const lasers = [], enemies = [], used = {};
    const share = (rate) => Math.round(free.length * rate);
    let k = 0;
    const take = (count, fn, minW) => {
      for (let c = 0; c < count && k < free.length; k++) {
        const p = P[free[k]];
        if (p.w < minW) continue;
        used[free[k]] = 1; c++;
        fn(p);
      }
    };
    take(share(o.laserRate), (p) => lasers.push({ x: Math.round(p.x + p.w * rnd(0.42, 0.62)), y: p.y - 56, w: 6, h: 56, on: ri(1200, 1700), off: ri(900, 1300), phase: ri(0, 1500) }), 220);
    take(share(o.robotRate), (p) => enemies.push({ type: 'robot', x: Math.round(p.x + p.w * rnd(0.4, 0.6)), y: p.y, range: Math.round(Math.min(60, p.w / 2 - 60)) }), 200);
    take(share(o.spiderRate || 0), (p) => enemies.push({ type: 'spider', x: Math.round(p.x + p.w * rnd(0.4, 0.6)), y: p.y, range: Math.round(Math.min(70, p.w / 2 - 50)) }), 200);
    take(share(o.droneRate), (p) => enemies.push({ type: 'drone', x: Math.round(p.x + p.w * rnd(0.3, 0.7)), y: p.y - ri(90, 130), range: 0 }), 0);

    // floating upper-tier platforms, stepping stones over wide gaps
    const floaters = [], coins = [];
    for (let i = 1; i < n - 1; i++) {
      const p = P[i];
      if (used[i] || cpIdx.indexOf(i) >= 0 || p.w < 230 || Math.random() > o.floatRate) continue;
      const fw = ri(70, 110), fy = p.y - ri(66, 76);
      if (fy < 120) continue;
      const fx = Math.round(p.x + p.w * rnd(0.3, 0.45));
      floaters.push({ x: fx, y: fy, w: fw, h: 14, float: true });
      if (p.w >= 300 && Math.random() < 0.55) {
        const x2 = fx + fw + ri(30, 55), y2 = fy - ri(52, 66), w2 = ri(60, 90);
        if (y2 >= 110 && x2 + w2 < p.x + p.w - 50) floaters.push({ x: x2, y: y2, w: w2, h: 14, float: true });
      }
    }
    for (let i = 1; i < n; i++) {
      const gs = P[i - 1].x + P[i - 1].w, ge = P[i].x;
      if (ge - gs > 140 && Math.random() < o.stoneRate) floaters.push({ x: Math.round((gs + ge) / 2 - 28), y: Math.min(P[i - 1].y, P[i].y) + ri(14, 30), w: 56, h: 14, float: true, stone: true });
    }
    floaters.forEach((f) => { if (!f.stone) for (let c = 0; c < 3; c++) coins.push({ x: Math.round(f.x + f.w * (0.2 + c * 0.3)), y: f.y - 24 }); });
    for (let i = 1; i < n; i++) {
      if (!used[i] && Math.random() < 0.55) coins.push({ x: Math.round(P[i].x + P[i].w * rnd(0.2, 0.8)), y: P[i].y - ri(36, 46) });
      const gs = P[i - 1].x + P[i - 1].w, ge = P[i].x;
      if (ge - gs > 130 && Math.random() < 0.7) coins.push({ x: Math.round((gs + ge) / 2), y: Math.min(P[i].y, P[i - 1].y) - 110 });
    }
    const tokenIdx = shuffle(free.slice()).slice(0, Math.max(3, Math.round(n / 6)));
    const mfaTokens = tokenIdx.map((i) => ({ x: Math.round(P[i].x + P[i].w * rnd(0.15, 0.3)), y: P[i].y - 50 }));

    const spots = shuffle(floaters.filter((f) => !f.stone).map((f) => ({ x: f.x + f.w / 2, y: f.y - 34 })));
    shuffle(free.slice()).forEach((i) => spots.push({ x: Math.round(P[i].x + P[i].w * rnd(0.55, 0.8)), y: P[i].y - 44 }));
    const powerups = powerKinds(o.power, POWER_RUN).map((kind, i) => Object.assign({ kind: kind }, spots[i]));

    const props = [];
    for (let i = 1; i < n; i++) {
      if (used[i] || cpIdx.indexOf(i) >= 0 || Math.random() > 0.6) continue;
      props.push({ kind: pick(o.props), x: Math.round(P[i].x + P[i].w * rnd(0.12, 0.9)), y: P[i].y });
    }

    // boss arena: flat platform at the height of the last rooftop
    const last = P[n - 1];
    const arena = { x: last.x + last.w + 120, y: last.y, w: 760, h: 400 - last.y };
    P.push(arena);
    return {
      width: arena.x + arena.w, platforms: P.concat(floaters), lasers: lasers, coins: coins, mfaTokens: mfaTokens, powerups: powerups, props: props, enemies: enemies,
      checkpoints: cpIdx.map((i) => ({ x: P[i].x + 40, y: P[i].y })),
      spawn: { x: 60, y: 230 },
      boss: Object.assign({ trigger: arena.x + 40, left: arena.x, right: arena.x + 640, floor: arena.y }, m.boss),
      exit: { x: arena.x + 570, y: arena.y - 90, w: 40, h: 90 }
    };
  }

  /* ---------------------------------------------------------------- FLY (canyon / skyway) */
  function makeFly(m) {
    const o = m.opt;
    const centers = [], xs = [];
    let c = 190, x = 760;
    for (let i = 0; i < o.cols; i++) {
      c = clamp(c + ri(-120, 120), 135, 285);
      centers.push(c);
      xs.push(x);
      x += ri(o.spaceMin, o.spaceMax);
    }
    const P = [], half = [];
    centers.forEach((ct, i) => {
      const h = ri(o.halfMin, o.halfMax);
      half.push(h);
      P.push({ x: xs[i], y: 0, w: 56, h: ct - h });
      P.push({ x: xs[i], y: ct + h, w: 56, h: 360 - (ct + h) });
    });
    const lastX = xs[xs.length - 1];
    const mid = (i) => ({ x: Math.round((xs[i] + xs[i + 1]) / 2 + 28), y: Math.round((centers[i] + centers[i + 1]) / 2) });

    const idx = shuffle(Array.from({ length: o.cols - 2 }, (_, i) => i + 1));
    const rings = idx.splice(0, o.rings).map((i) => ({ x: mid(i).x, y: mid(i).y, r: 34 }));
    const coins = idx.splice(0, o.coins).map((i) => ({ x: mid(i).x, y: clamp(mid(i).y + ri(-70, 70), 50, 310) }));
    const mfaTokens = idx.splice(0, 3).map((i) => ({ x: mid(i).x, y: clamp(mid(i).y + ri(-50, 50), 60, 300) }));
    const enemies = [];
    for (let d = 0; d < o.drones; d++) {
      const dx = 1100 + Math.round((lastX - 1500) * (d + Math.random() * 0.8) / o.drones);
      enemies.push({ type: 'drone', x: dx, y: ri(110, 270), range: 0 });
    }
    const cps = [];
    for (let i = o.cpEvery; i < o.cols - 3; i += o.cpEvery) cps.push({ x: xs[i] + 28, y: Math.round(centers[i]) });
    const powerups = powerKinds(3, POWER_FLY).map((kind, i) => Object.assign({ kind: kind }, { x: mid(idx[i] || 5 + i * 4).x, y: clamp(mid(idx[i] || 5 + i * 4).y, 80, 290) }));
    const props = [];
    for (let px = 500; px < lastX; px += ri(380, 620)) props.push({ kind: pick(o.props), x: px, y: ri(70, 290), float: true });
    const width = lastX + 760;
    return {
      width: width, platforms: P, lasers: [], coins: coins, mfaTokens: mfaTokens, rings: rings, powerups: powerups, props: props, enemies: enemies,
      scroll: o.scroll, checkpoints: cps, spawn: { x: 120, y: 190 },
      boss: Object.assign({ trigger: width - 630, left: width - 640, right: width, floor: 250 }, m.boss),
      exit: { x: width - 70, y: 0, w: 60, h: 360 }
    };
  }

  /* ---------------------------------------------------------------- DATA CENTER + BOSS */
  function makeDataCenter(m) {
    const o = m.opt, F = 300;
    const platforms = [], cables = [], coins = [], enemies = [], terminals = [], gates = [], checkpoints = [], mfaTokens = [];
    const secs = [];
    let x = 0;
    for (let i = 0; i < o.sections + 1; i++) {
      const boss = i === o.sections;
      const len = i === 0 ? 1100 : boss ? 1800 : ri(1300, 1700);
      secs.push({ x: x, len: len, boss: boss, i: i, occ: [] });
      platforms.push({ x: x, y: F, w: len, h: 100 });
      x += len + 100;
    }
    const width = x - 100;
    const bossLeft = width - 640;

    const take = (s, half, lo, hi) => {
      for (let t = 0; t < 60; t++) {
        const px = Math.round(rnd(lo, hi));
        if (s.occ.every((r) => px + half < r[0] || px - half > r[1])) { s.occ.push([px - half, px + half]); return px; }
      }
      return null;
    };

    secs.forEach((s) => {
      const end = s.x + s.len;
      s.occ.push([s.x - 1, s.x + (s.i === 0 ? 300 : 180)]);
      s.occ.push([end - 90, end + 1]);
      const limit = s.boss ? bossLeft - 160 : end - 120;
      if (!s.boss && s.i > 0) {
        const tx = end - ri(300, 480), gx = end - 100;
        terminals.push({ id: s.i, x: tx, y: F });
        gates.push({ id: s.i, x: gx, y: 0, w: 20, h: F });
        s.occ.push([tx - 80, tx + 80], [gx - 40, gx + 60]);
      }
      if (s.i > 0) checkpoints.push({ x: s.x + 60, y: F });
      if (s.boss) { checkpoints.push({ x: bossLeft - 280, y: F }); s.occ.push([bossLeft - 360, bossLeft - 200], [bossLeft - 60, end]); }

      const racks = ri(2, 4);
      for (let r = 0; r < racks; r++) {
        const w = ri(90, 140), ry = ri(240, 255), rx = take(s, w / 2 + 60, s.x + 200, limit);
        if (rx === null) continue;
        platforms.push({ x: rx - w / 2, y: ry, w: w, h: F - ry });
        coins.push({ x: rx, y: ry - 36 });
        if (Math.random() < 0.28 && mfaTokens.length < 5) mfaTokens.push({ x: rx, y: ry - 46 });
      }
      const cn = ri(3, 5);
      for (let c = 0; c < cn; c++) {
        const cx = take(s, 60, s.x + 200, limit);
        if (cx !== null) cables.push({ x: cx - 20, y: F, w: 40 });
      }
      const en = s.boss ? 2 : ri(2, 4);
      for (let e = 0; e < en; e++) {
        const t = pick(['spider', 'spider', 'robot', 'drone']);
        const range = t === 'drone' ? 0 : ri(60, 100);
        const ex = take(s, range + 30, s.x + 260, limit);
        if (ex !== null) enemies.push({ type: t, x: ex, y: t === 'drone' ? ri(180, 230) : F, range: range });
      }
      for (let c = 0; c < ri(2, 3); c++) coins.push({ x: Math.round(rnd(s.x + 220, limit)), y: ri(262, 275) });
    });
    // guarantee at least 3 MFA tokens, on the floor if no rack carried one
    for (let i = 0; mfaTokens.length < 3; i++) {
      const s = secs[(i + 1) % secs.length];
      mfaTokens.push({ x: Math.round(rnd(s.x + 260, s.x + s.len * 0.5)), y: 262 });
    }
    const spots = shuffle(platforms.filter((q) => q.y < F && q.h < 80).map((q) => ({ x: q.x + q.w / 2, y: q.y - 36 })));
    secs.forEach((q) => { if (!q.boss) spots.push({ x: Math.round(rnd(q.x + 300, q.x + q.len * 0.5)), y: 262 }); });
    const powerups = powerKinds(4, POWER_RUN).map((kind, i) => Object.assign({ kind: kind }, spots[i]));
    return {
      width: width, platforms: platforms, powerups: powerups, props: [], lasers: [], cables: cables, coins: coins, mfaTokens: mfaTokens, enemies: enemies,
      terminals: terminals, gates: gates, checkpoints: checkpoints, spawn: { x: 60, y: 250 },
      boss: Object.assign({ trigger: bossLeft + 40, left: bossLeft, right: width, floor: F }, m.boss),
      exit: { x: width - 80, y: 210, w: 40, h: 90 }
    };
  }

  /* ---------------------------------------------------------------- WORLD TABLE */
  const WORLDS = [
    {
      id: 1, region: 'westeurope', regionName: 'WEST EUROPE', city: 'AMSTERDAM', name: 'Amsterdam Canal Run', mode: 'run', theme: 'roof',
      tint: 0xffc0a0, landmarks: 'WINDMILLS - CANAL HOUSES - WESTERKERK', hint: 'RUN RIGHT. SPACE TO JUMP, PRESS AGAIN TO DOUBLE JUMP. F = AZURE BLAST',
      boss: { kind: 'molen', name: 'WINDMILL TITAN', proj: 'molen' },
      opt: { count: 20, gapMin: 100, gapMax: 175, minW: 220, maxW: 340, cpEvery: 7, laserRate: 0.28, robotRate: 0.2, spiderRate: 0.15, droneRate: 0.06, stepRate: 0.14, dropRate: 0.12, floatRate: 0.55, stoneRate: 0.45, power: 4, props: ['tulips', 'bike'] }
    },
    {
      id: 2, region: 'uksouth', regionName: 'UK SOUTH', city: 'LONDON', name: 'London Thames Run', mode: 'run', theme: 'roof',
      tint: 0xb4c8ff, landmarks: 'BIG BEN - TOWER BRIDGE - LONDON EYE - THE SHARD', hint: 'TIME THE RED LASERS. DOUBLE JUMP THE WIDE GAPS ACROSS THE THAMES',
      boss: { kind: 'guard', name: 'BEARSKIN SENTINEL', proj: 'guard' },
      opt: { count: 26, gapMin: 105, gapMax: 185, minW: 210, maxW: 330, cpEvery: 7, laserRate: 0.3, robotRate: 0.2, spiderRate: 0.15, droneRate: 0.1, stepRate: 0.16, dropRate: 0.12, floatRate: 0.55, stoneRate: 0.5, power: 5, props: ['phone', 'postbox'] }
    },
    {
      id: 3, region: 'japaneast', regionName: 'JAPAN EAST', city: 'TOKYO', name: 'Tokyo Skyway Pursuit', mode: 'fly', theme: 'rock',
      tint: 0xff9ab0, landmarks: 'MOUNT FUJI - TOKYO TOWER - TORII - PAGODA', hint: 'FLY WITH ARROWS / WASD. DODGE DRONES, FLY THROUGH GOLD RINGS. SHIFT = BOOST',
      boss: { kind: 'sumo', name: 'SUMO SHOGUN', proj: 'sumo', air: true },
      opt: { cols: 28, spaceMin: 260, spaceMax: 320, halfMin: 68, halfMax: 86, rings: 8, coins: 8, drones: 6, scroll: 100, cpEvery: 8, props: ['lantern', 'carp'] }
    },
    {
      id: 4, region: 'australiaeast', regionName: 'AUSTRALIA EAST', city: 'SYDNEY', name: 'Sydney Harbour Run', mode: 'run', theme: 'roof',
      tint: 0xffe0a0, landmarks: 'OPERA HOUSE - HARBOUR BRIDGE - SYDNEY TOWER', hint: 'LASERS AND DRONES ABOVE THE HARBOUR. STAY SHARP. F = AZURE BLAST',
      boss: { kind: 'roo', name: 'BOXING ROO', proj: 'roo' },
      opt: { count: 32, gapMin: 110, gapMax: 195, minW: 200, maxW: 320, cpEvery: 8, laserRate: 0.32, robotRate: 0.2, spiderRate: 0.15, droneRate: 0.14, stepRate: 0.18, dropRate: 0.15, floatRate: 0.55, stoneRate: 0.5, power: 6, props: ['surf', 'sign'] }
    },
    {
      id: 5, region: 'brazilsouth', regionName: 'BRAZIL SOUTH', city: 'RIO', name: 'Rio Sugarloaf Pursuit', mode: 'fly', theme: 'rock',
      tint: 0xb8ff9a, landmarks: 'CHRIST THE REDEEMER - SUGARLOAF - COPACABANA', hint: 'NARROW PASSES AND MORE DRONES. KEEP YOUR BOOST METER READY. SHIFT = BOOST',
      boss: { kind: 'samba', name: 'CARNAVAL REI', proj: 'samba', air: true },
      opt: { cols: 36, spaceMin: 250, spaceMax: 310, halfMin: 66, halfMax: 80, rings: 9, coins: 9, drones: 10, scroll: 110, cpEvery: 9, props: ['balloon', 'kite'] }
    },
    {
      id: 6, region: 'eastus', regionName: 'EAST US', city: 'VIRGINIA', name: 'Virginia Data Center', mode: 'run', theme: 'rack',
      tint: 0xffffff, landmarks: 'CAPITOL - WASHINGTON MONUMENT - LINCOLN MEMORIAL', hint: 'STAND ON HACK TERMINALS TO OPEN SEC GATES. HOLD E TO RAISE THE MFA SHIELD',
      boss: { kind: 'guardian', name: 'HIGH-RISK CYBERGUARDIAN' },
      opt: { sections: 4 }
    }
  ];

  const BUILD = { run: makeRun, fly: makeFly };
  const Levels = (AH.Levels = {});
  Levels.worlds = WORLDS;
  Levels.ids = WORLDS.map((w) => w.id);
  Levels.meta = function (id) { return WORLDS.filter((w) => w.id === id)[0]; };
  Levels.make = function (id) {
    const m = Levels.meta(id);
    const body = m.theme === 'rack' ? makeDataCenter(m) : BUILD[m.mode](m);
    const L = Object.assign({
      id: m.id, name: m.name, region: m.region, regionName: m.regionName, city: m.city, landmarks: m.landmarks, hint: m.hint,
      height: 360, mode: m.mode, theme: m.theme, tint: m.tint, mfaTokens: []
    }, body);
    L.enemies.forEach((e) => { e.skin = m.region; });
    L.time = m.mode === 'fly' ? Math.round(L.width / L.scroll + 90) : Math.round(L.width / 1000 * (m.theme === 'rack' ? 30 : 26) + 110);
    return L;
  };
})();
