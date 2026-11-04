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
  function makeRun(m) {
    const o = m.opt;
    const P = [{ x: 0, y: 280, w: 420, h: 120 }];
    let y = 280;
    for (let i = 1; i <= o.count; i++) {
      const prev = P[P.length - 1];
      const gap = ri(o.gapMin, o.gapMax);
      const maxRise = gap > 140 ? 20 : 30;
      y = clamp(y + ri(-maxRise, 45), 225, 290);
      const w = i === o.count ? 480 : ri(o.minW, o.maxW);
      P.push({ x: prev.x + prev.w + gap, y: y, w: w, h: 400 - y });
    }
    const last = P[P.length - 1];
    const n = P.length;

    // checkpoints first so hazards never share their rooftop
    const cpIdx = [];
    for (let i = o.cpEvery; i < n - 2; i += o.cpEvery) cpIdx.push(i);
    const free = [];
    for (let i = 2; i < n - 1; i++) if (cpIdx.indexOf(i) < 0) free.push(i);
    shuffle(free);

    const lasers = [], enemies = [], used = {};
    const laserN = Math.round(free.length * o.laserRate), robotN = Math.round(free.length * o.robotRate), droneN = Math.round(free.length * o.droneRate);
    let k = 0;
    for (let c = 0; c < laserN && k < free.length; k++) {
      const p = P[free[k]];
      if (p.w < 220) continue;
      used[free[k]] = 1; c++;
      lasers.push({ x: Math.round(p.x + p.w * rnd(0.42, 0.62)), y: p.y - 56, w: 6, h: 56, on: ri(1200, 1700), off: ri(900, 1300), phase: ri(0, 1500) });
    }
    for (let c = 0; c < robotN && k < free.length; k++, c++) {
      const p = P[free[k]], range = Math.min(60, p.w / 2 - 60);
      used[free[k]] = 1;
      enemies.push({ type: 'robot', x: Math.round(p.x + p.w * rnd(0.4, 0.6)), y: p.y, range: Math.round(range) });
    }
    for (let c = 0; c < droneN && k < free.length; k++, c++) {
      const p = P[free[k]];
      used[free[k]] = 1;
      enemies.push({ type: 'drone', x: Math.round(p.x + p.w * rnd(0.3, 0.7)), y: p.y - ri(90, 130), range: 0 });
    }

    const coins = [];
    for (let i = 1; i < n; i++) {
      if (Math.random() < 0.55) coins.push({ x: Math.round(P[i].x + P[i].w * rnd(0.2, 0.8)), y: P[i].y - ri(36, 46) });
      const gs = P[i - 1].x + P[i - 1].w, ge = P[i].x;
      if (ge - gs > 130 && Math.random() < 0.7) coins.push({ x: Math.round((gs + ge) / 2), y: Math.min(P[i].y, P[i - 1].y) - 110 });
    }
    const tokenIdx = shuffle(free.slice()).slice(0, Math.max(3, Math.round(n / 6)));
    const mfaTokens = tokenIdx.map((i) => ({ x: Math.round(P[i].x + P[i].w * rnd(0.15, 0.3)), y: P[i].y - 50 }));

    return {
      width: last.x + last.w, platforms: P, lasers: lasers, coins: coins, mfaTokens: mfaTokens, enemies: enemies,
      checkpoints: cpIdx.map((i) => ({ x: P[i].x + 40, y: P[i].y })),
      spawn: { x: 60, y: 230 },
      exit: { x: last.x + last.w - 90, y: last.y - 90, w: 40, h: 90 }
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
    return {
      width: lastX + 700, platforms: P, lasers: [], coins: coins, mfaTokens: mfaTokens, rings: rings, enemies: enemies,
      scroll: o.scroll, checkpoints: cps, spawn: { x: 120, y: 190 },
      exit: { x: lastX + 640, y: 0, w: 60, h: 360 }
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
    return {
      width: width, platforms: platforms, lasers: [], cables: cables, coins: coins, mfaTokens: mfaTokens, enemies: enemies,
      terminals: terminals, gates: gates, checkpoints: checkpoints, spawn: { x: 60, y: 250 },
      boss: { trigger: bossLeft + 40, left: bossLeft, right: width, floor: F },
      exit: { x: width - 80, y: 210, w: 40, h: 90 }
    };
  }

  /* ---------------------------------------------------------------- WORLD TABLE */
  const WORLDS = [
    {
      id: 1, region: 'westeurope', regionName: 'WEST EUROPE', city: 'AMSTERDAM', name: 'Amsterdam Canal Run', mode: 'run', theme: 'roof',
      tint: 0xffc0a0, landmarks: 'WINDMILLS - CANAL HOUSES - WESTERKERK', hint: 'RUN RIGHT. SPACE TO JUMP, PRESS AGAIN TO DOUBLE JUMP. F = AZURE BLAST',
      opt: { count: 20, gapMin: 100, gapMax: 175, minW: 220, maxW: 320, cpEvery: 7, laserRate: 0.3, robotRate: 0.25, droneRate: 0.05 }
    },
    {
      id: 2, region: 'uksouth', regionName: 'UK SOUTH', city: 'LONDON', name: 'London Thames Run', mode: 'run', theme: 'roof',
      tint: 0xb4c8ff, landmarks: 'BIG BEN - TOWER BRIDGE - LONDON EYE - THE SHARD', hint: 'TIME THE RED LASERS. DOUBLE JUMP THE WIDE GAPS ACROSS THE THAMES',
      opt: { count: 26, gapMin: 105, gapMax: 185, minW: 210, maxW: 310, cpEvery: 7, laserRate: 0.32, robotRate: 0.25, droneRate: 0.1 }
    },
    {
      id: 3, region: 'japaneast', regionName: 'JAPAN EAST', city: 'TOKYO', name: 'Tokyo Skyway Pursuit', mode: 'fly', theme: 'rock',
      tint: 0xff9ab0, landmarks: 'MOUNT FUJI - TOKYO TOWER - TORII - PAGODA', hint: 'FLY WITH ARROWS / WASD. DODGE DRONES, FLY THROUGH GOLD RINGS. SHIFT = BOOST',
      opt: { cols: 28, spaceMin: 260, spaceMax: 320, halfMin: 68, halfMax: 86, rings: 8, coins: 8, drones: 6, scroll: 100, cpEvery: 8 }
    },
    {
      id: 4, region: 'australiaeast', regionName: 'AUSTRALIA EAST', city: 'SYDNEY', name: 'Sydney Harbour Run', mode: 'run', theme: 'roof',
      tint: 0xffe0a0, landmarks: 'OPERA HOUSE - HARBOUR BRIDGE - SYDNEY TOWER', hint: 'LASERS AND DRONES ABOVE THE HARBOUR. STAY SHARP. F = AZURE BLAST',
      opt: { count: 32, gapMin: 110, gapMax: 195, minW: 200, maxW: 300, cpEvery: 8, laserRate: 0.35, robotRate: 0.25, droneRate: 0.15 }
    },
    {
      id: 5, region: 'brazilsouth', regionName: 'BRAZIL SOUTH', city: 'RIO', name: 'Rio Sugarloaf Pursuit', mode: 'fly', theme: 'rock',
      tint: 0xb8ff9a, landmarks: 'CHRIST THE REDEEMER - SUGARLOAF - COPACABANA', hint: 'NARROW PASSES AND MORE DRONES. KEEP YOUR BOOST METER READY. SHIFT = BOOST',
      opt: { cols: 36, spaceMin: 250, spaceMax: 310, halfMin: 66, halfMax: 80, rings: 9, coins: 9, drones: 10, scroll: 110, cpEvery: 9 }
    },
    {
      id: 6, region: 'eastus', regionName: 'EAST US', city: 'VIRGINIA', name: 'Virginia Data Center', mode: 'run', theme: 'rack',
      tint: 0xffffff, landmarks: 'CAPITOL - WASHINGTON MONUMENT - LINCOLN MEMORIAL', hint: 'STAND ON HACK TERMINALS TO OPEN SEC GATES. HOLD E TO RAISE THE MFA SHIELD',
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
    L.time = m.mode === 'fly' ? Math.round(L.width / L.scroll + 50) : Math.round(L.width / 1000 * (m.theme === 'rack' ? 30 : 26) + 70);
    return L;
  };
})();
