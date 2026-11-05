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
    return shuffle(out.slice(0, n).concat(['spread', 'pierce']));
  }
  function clearWeapons(powerups, solids, y) {
    powerups.filter((p) => p.kind === 'spread' || p.kind === 'pierce').forEach((p, i) => {
      if (solids.some((s) => p.x + 12 > s.x && p.x - 12 < s.x + s.w && p.y + 12 > s.y && p.y - 12 < s.y + s.h)) {
        p.x = 160 + i * 100;
        p.y = y;
      }
    });
  }

  // Climb walls rise beyond double-jump height (about 160px) so they need wall jumps; TOP_Y keeps the hero below the HUD.
  const TOP_Y = 106, CLIMB_LOW = 150, CLIMB_MIN = 164, CLIMB_MAX = 186;
  // Street walkways stay low (about one tile band above the water) so landmarks remain visible above them.
  // Height comes from narrow climb towers and cloud stairways, not from tall solid ground blocks.
  const STREET_Y = 300, GROUND_MIN_Y = 258, TOWER_W = [120, 160];

  // Terrain mixes plain gaps with steps (walls to jump up), drops, floating upper-tier platforms and stepping stones over wide gaps.
  function makeRun(m) {
    const o = m.opt;
    const P = [{ x: 0, y: STREET_Y, w: 420, h: 400 - STREET_Y }];
    const bridges = [], movers = [], ledges = [], span = {};
    const wallRate = o.wallRate === undefined ? 0.16 : o.wallRate, stairRate = o.stairRate === undefined ? 0.1 : o.stairRate;
    let y = STREET_Y, lastKind = '';
    for (let i = 1; i <= o.count; i++) {
      const prev = P[P.length - 1];
      const r = Math.random();
      let kind = i > 1 && r < Math.max(0.28, o.stepRate) ? 'step' : i > 1 && r < Math.max(0.28, o.stepRate) + Math.max(0.24, o.dropRate) ? 'drop' : 'gap';
      if (i === 1) kind = 'gap';
      if (o.water && i > 1 && i < o.count) {
        const r2 = Math.random();
        if (r2 < o.boatRate) kind = 'boat';
        else if (r2 < o.boatRate + o.bridgeRate) kind = 'bridge';
      }
      // vertical sections: a marked climb wall (wall jumps) or ledge stairs over a pit up to a high rooftop
      if (i > 2 && i < o.count - 1 && kind !== 'boat' && kind !== 'bridge' && lastKind !== 'wall' && lastKind !== 'stairs') {
        const r3 = Math.random();
        if (r3 < wallRate && y - CLIMB_LOW >= TOP_Y) kind = 'wall';
        else if (r3 < wallRate + stairRate && y - 96 >= TOP_Y) kind = 'stairs';
      }
      // after a climb the route drops back to the low street so walls stay features, not a raised walkway
      if (lastKind === 'wall' || lastKind === 'stairs') kind = 'drop';
      let gap = 0, ny = y;
      if (kind === 'wall') ny = Math.max(TOP_Y, y - ri(CLIMB_MIN, CLIMB_MAX));
      if (kind === 'stairs') { gap = ri(160, 190); ny = Math.max(TOP_Y, y - ri(96, 124)); }
      if (kind === 'bridge') { gap = ri(120, 190); ny = y; }
      if (kind === 'boat') { gap = ri(240, 300); ny = clamp(y + ri(-20, 20), 250, 300); }
      if (kind === 'step') { ny = y - ri(20, 36); if (ny < GROUND_MIN_Y) kind = 'drop'; }
      if (kind === 'drop') { gap = ri(50, 110); ny = lastKind === 'wall' || lastKind === 'stairs' ? ri(282, STREET_Y) : Math.min(STREET_Y, y + ri(24, 42)); if (ny - y < 20) kind = 'gap'; }
      if (kind === 'gap') {
        gap = ri(o.gapMin, o.gapMax);
        const maxRise = gap > 140 ? 20 : 30;
        ny = clamp(y + ri(-maxRise, 30), GROUND_MIN_Y, STREET_Y);
      }
      // the last rooftops come back down so the boss arena stays at street height
      if (i >= o.count - 1) ny = Math.max(ny, 200);
      const wallFrom = y;
      y = ny;
      lastKind = kind;
      const w = i === o.count ? 480 : kind === 'wall' || kind === 'stairs' ? ri(TOWER_W[0], TOWER_W[1]) : ri(o.minW, o.maxW);
      P.push({ x: prev.x + prev.w + gap, y: y, w: w, h: 400 - y });
      if (kind === 'wall') Object.assign(P[P.length - 1], { climb: true, wallFrom: wallFrom });
      if (kind === 'wall' || kind === 'stairs') P[P.length - 1].tower = true;
      if (kind === 'stairs') {
        const gs = prev.x + prev.w;
        ledges.push({ x: gs + 18, y: wallFrom - 52, w: 52, h: 14, float: true, ledge: true },
          { x: gs + gap - 74, y: wallFrom - 100, w: 50, h: 14, float: true, ledge: true });
        span[i] = 'stairs';
      }
      // spanned gaps: a walkable bridge deck, or a boat that shuttles across the water
      if (kind === 'bridge') { bridges.push({ x: prev.x + prev.w, y: y, w: gap, h: 14, bridge: true, draw: Math.random() < (o.drawRate || 0) }); span[i] = 'bridge'; }
      if (kind === 'boat') { movers.push({ x0: prev.x + prev.w + 6, x1: prev.x + prev.w + gap - 118, y: 296, w: 112, speed: ri(48, 64) }); span[i] = 'boat'; }
    }
    const n = P.length;

    // checkpoints first so hazards never share their rooftop
    const cpIdx = [];
    for (let i = o.cpEvery; i < n - 1; i += o.cpEvery) cpIdx.push(i);
    cpIdx.push(n - 1);
    const free = [];
    for (let i = 2; i < n - 1; i++) if (cpIdx.indexOf(i) < 0) free.push(i);
    const pipeAt = {}, pipePairs = [];
    const want = o.pipes === undefined ? 2 : o.pipes;
    free.filter((i) => i < n * 0.7 && P[i].y >= 150).forEach((i) => {
      if (pipePairs.length >= want || pipeAt[i] || pipePairs.some((q) => Math.abs(q[0] - i) < 6)) return;
      const j = free.find((j) => j >= i + 4 && j <= i + 9 && !pipeAt[j] && P[j].y >= 150);
      if (j !== undefined) { pipePairs.push([i, j]); pipeAt[i] = pipeAt[j] = 1; }
    });
    for (let i = free.length - 1; i >= 0; i--) if (pipeAt[free[i]]) free.splice(i, 1);
    shuffle(free);

    const lasers = [], enemies = [], used = {}, hackerAt = {};
    const hackerPlatforms = free.filter((i) => P[i].w >= 200).slice(0, Math.max(1, Math.floor(free.length / 9)));
    hackerPlatforms.forEach((i) => {
      const p = P[i];
      hackerAt[i] = 1;
      used[i] = 1;
      enemies.push({ type: 'hacker', x: Math.round(p.x + p.w * 0.25), y: p.y, range: 24 });
    });
    const share = (rate) => Math.round(free.length * rate);
    let k = 0;
    const take = (count, fn, minW) => {
      for (let c = 0; c < count && k < free.length; k++) {
        const p = P[free[k]];
        if (hackerAt[free[k]] || p.w < minW) continue;
        used[free[k]] = 1; c++;
        fn(p);
      }
    };
    const lasered = {};
    const shoot = () => Math.random() < (o.shootRate || 0);
    take(share(o.laserRate), (p) => { lasered[P.indexOf(p)] = 1; lasers.push({ x: Math.round(p.x + p.w * rnd(0.42, 0.62)), y: p.y - 56, w: 6, h: 56, on: ri(1200, 1700), off: ri(900, 1300), phase: ri(0, 1500) }); }, 220);
    take(share(o.robotRate), (p) => enemies.push({ type: 'robot', x: Math.round(p.x + p.w * rnd(0.4, 0.6)), y: p.y, range: Math.round(Math.min(60, p.w / 2 - 60)), shoot: shoot() }), 200);
    take(share(o.spiderRate || 0), (p) => enemies.push({ type: 'spider', x: Math.round(p.x + p.w * rnd(0.4, 0.6)), y: p.y, range: Math.round(Math.min(70, p.w / 2 - 50)) }), 200);
    // cyber-threat trio: Phish hoppers, Ransomware rams, Botnet bombers
    take(share(o.phishRate === undefined ? 0.06 : o.phishRate), (p) => enemies.push({ type: 'phish', x: Math.round(p.x + p.w * rnd(0.4, 0.6)), y: p.y, range: Math.round(Math.min(60, p.w / 2 - 60)) }), 200);
    take(share(o.ramRate === undefined ? 0.06 : o.ramRate), (p) => enemies.push({ type: 'ram', x: Math.round(p.x + p.w / 2), y: p.y, range: Math.round(Math.min(80, p.w / 2 - 70)) }), 240);
    shuffle(free.slice()).slice(0, share(o.botnetRate === undefined ? 0.05 : o.botnetRate)).forEach((i) => enemies.push({ type: 'botnet', x: Math.round(P[i].x + P[i].w / 2), y: Math.max(70, P[i].y - ri(150, 175)), range: 140 }));
    // drones hover above rooftops without claiming them; extra walkers double up on long rooftops
    shuffle(free.slice()).slice(0, share(o.droneRate)).forEach((i) => enemies.push({ type: 'drone', x: Math.round(P[i].x + P[i].w * rnd(0.3, 0.7)), y: Math.max(80, P[i].y - ri(90, 130)), range: 0 }));
    free.forEach((i) => {
      const p = P[i];
      if (hackerAt[i] || p.w < 250 || Math.random() > (o.extraRate || 0)) return;
      const t = pick(['robot', 'robot', 'spider', 'spider', 'phish']);
      enemies.push({ type: t, x: Math.round(p.x + p.w * rnd(0.72, 0.85)), y: p.y, range: 26, shoot: t === 'robot' && shoot() });
    });
    bridges.forEach((b) => { if (!b.draw && Math.random() < 0.5) enemies.push({ type: 'robot', x: Math.round(b.x + b.w / 2), y: b.y, range: Math.max(10, Math.round(b.w / 2 - 34)), shoot: shoot() }); });

    // Azure cloud stairways: chains of cloud platforms rising from the street toward the sky, rewards on top
    const floaters = [], coins = [], SKY = 'sky_cloud';
    const stairway = (i) => {
      const p = P[i], next = P[i + 1], limit = next.tower || pipeAt[i + 1] || lasered[i + 1] ? next.x - 24 : next.x + next.w * 0.6;
      let cx = Math.round(p.x + p.w * rnd(0.12, 0.25)), cy = p.y - ri(62, 74), made = 0;
      const steps = ri(2, 4);
      for (let k = 0; k < steps && cy >= 104; k++) {
        const top = k === steps - 1 || cy - 60 < 104, cw = top ? ri(110, 150) : ri(64, 90);
        if (cx + cw > limit) break;
        floaters.push({ x: cx, y: cy, w: cw, h: 14, float: true, cloud: SKY, sky: k + 1 });
        made++;
        cx += cw + ri(26, 50); cy -= ri(48, 60);
      }
      return made > 1;
    };
    const skyBase = [];
    for (let i = 1; i < n - 1; i++) if (!pipeAt[i] && !lasered[i] && cpIdx.indexOf(i) < 0 && !P[i].tower && P[i].w >= 180 && !P[i + 1].tower) skyBase.push(i);
    let chains = 0;
    skyBase.forEach((i, j) => { if ((j % 3 === 0 || Math.random() < o.floatRate) && (j === 0 || skyBase[j - 1] !== i - 1 || Math.random() < 0.5) && stairway(i)) chains++; });
    shuffle(skyBase.slice()).forEach((i) => { if (chains < 3 && !floaters.some((f) => f.x >= P[i].x && f.x < P[i].x + P[i].w) && stairway(i)) chains++; });
    floaters.forEach((f) => { if (f.w >= 80 && Math.random() < (o.floatEnemyRate || 0)) enemies.push({ type: 'robot', x: Math.round(f.x + f.w / 2), y: f.y, range: Math.round(f.w / 2 - 22), shoot: shoot() }); });
    shuffle(free.filter((i) => !lasered[i] && !hackerAt[i])).slice(0, Math.ceil(free.length * 0.65) - hackerPlatforms.length).forEach((i, j) => {
      const p = P[i], type = ['bug', 'guest', 'rbac', 'endpoint', 'image'][j % 5];
      enemies.push({ type, x: Math.round(p.x + p.w * 0.25), y: p.y, range: type === 'endpoint' ? 0 : 24 });
    });
    for (let i = 1; i < n; i++) {
      const gs = P[i - 1].x + P[i - 1].w, ge = P[i].x;
      if (span[i]) continue;
      if (ge - gs > 140 && Math.random() < o.stoneRate) floaters.push({ x: Math.round((gs + ge) / 2 - 30), y: Math.min(P[i - 1].y, P[i].y) + ri(14, 30), w: 60, h: 14, float: true, stone: true, cloud: SKY });
    }
    floaters.forEach((f) => { if (!f.stone) for (let c = 0; c < 3; c++) coins.push({ x: Math.round(f.x + f.w * (0.2 + c * 0.3)), y: f.y - 24 }); });
    for (let i = 1; i < n; i++) {
      if (!used[i] && Math.random() < 0.55) coins.push({ x: Math.round(P[i].x + P[i].w * rnd(0.2, 0.8)), y: P[i].y - ri(36, 46) });
      const gs = P[i - 1].x + P[i - 1].w, ge = P[i].x;
      if (span[i] === 'bridge') { for (let c = 0; c < 3; c++) coins.push({ x: Math.round(gs + (ge - gs) * (0.25 + c * 0.25)), y: P[i].y - 30 }); continue; }
      if (span[i] === 'boat') { for (let c = 0; c < 3; c++) coins.push({ x: Math.round(gs + (ge - gs) * (0.3 + c * 0.2)), y: 262 }); continue; }
      if (span[i] === 'stairs') { ledges.filter((l) => l.x > gs && l.x < ge).forEach((l) => coins.push({ x: l.x + l.w / 2, y: l.y - 24 })); continue; }
      if (P[i].climb) { for (let c = 0; c < 3; c++) coins.push({ x: P[i].x - 16, y: P[i].wallFrom - 50 - c * 36 }); continue; }
      if (ge - gs > 130 && Math.random() < 0.7) coins.push({ x: Math.round((gs + ge) / 2), y: Math.max(70, Math.min(P[i].y, P[i - 1].y) - 110) });
    }
    const tokenIdx = shuffle(free.slice()).slice(0, Math.max(3, Math.round(n / 6)));
    const mfaTokens = tokenIdx.map((i) => ({ x: Math.round(P[i].x + P[i].w * rnd(0.15, 0.3)), y: P[i].y - 50 }));

    const spots = shuffle(floaters.filter((f) => !f.stone).map((f) => ({ x: f.x + f.w / 2, y: f.y - 34 }))).sort((a, b) => a.y - b.y);
    shuffle(free.slice()).forEach((i) => spots.push({ x: Math.round(P[i].x + P[i].w * rnd(0.55, 0.8)), y: P[i].y - 44 }));
    const powerups = powerKinds(o.power, POWER_RUN).map((kind, i) => Object.assign({ kind: kind }, spots[i]));

    const props = [];
    for (let i = 1; i < n; i++) {
      if (used[i] || cpIdx.indexOf(i) >= 0 || Math.random() > 0.6) continue;
      props.push({ kind: pick(o.props), x: Math.round(P[i].x + P[i].w * rnd(0.12, 0.9)), y: P[i].y });
    }

    // street obstacles (solid, stand on them), ride-on bikes, the secret phone box and moored houseboats
    const open = free.filter((i) => !lasered[i] && !hackerAt[i] && P[i].w >= 240);
    shuffle(open);
    let oc = 0;
    const secret = o.secret ? open.filter((i) => i >= 3 && i < n * 0.6)[0] : undefined;
    const vehicles = [], obstacles = [];
    let sx = null;
    if (secret !== undefined) sx = { x: Math.round(P[secret].x + P[secret].w * 0.78), y: P[secret].y };
    // warp pipes (Azure Pipelines): entry pipe -> underground stage -> exit pipe further ahead
    open.forEach((i) => {
      if (i === secret || pipeAt[i]) return;
      const p = P[i];
      if (vehicles.length < (o.bikes || 0) && i < n * 0.75) { vehicles.push({ kind: 'bike', x: Math.round(p.x + p.w * 0.3), y: p.y }); return; }
      if (oc < Math.round(open.length * (o.obstacleRate || 0))) {
        oc++;
        const kind = o.stand && oc === 1 ? o.stand : pick(o.obstacles), sz = (AH.Art && AH.Art.obSize && AH.Art.obSize[kind]) || OB_SIZE[kind];
        const ox = Math.round(p.x + p.w * rnd(0.3, 0.6) - sz[0] / 2);
        obstacles.push({ kind: kind, x: ox, y: p.y - sz[1], w: sz[0], h: sz[1] });
        coins.push({ x: ox + sz[0] / 2, y: Math.max(60, p.y - sz[1] - 26) });
      }
    });
    clearWeapons(powerups, P.concat(floaters, obstacles), 230);
    const deco = [];
    if (o.water) for (let i = 1; i < n; i++) {
      const gs = P[i - 1].x + P[i - 1].w, ge = P[i].x;
      if (!span[i] && ge - gs >= 120 && Math.random() < 0.55) deco.push({ key: 'houseboat', x: Math.round((gs + ge) / 2), y: 336 });
    }

    // boss arena: flat platform at the height of the last rooftop
    const last = P[n - 1];
    const arena = { x: last.x + last.w + 120, y: last.y, w: 760, h: 400 - last.y };
    P.push(arena);
    const width = arena.x + arena.w;
    const pipes = [], pipeZones = [], pipeSolids = [];
    // Shared themes rotate everywhere; a world's own regional theme (opt.pipeTheme) always takes the first pipe.
    const zoneThemes = shuffle(Object.keys(CHALLENGES).filter((k) => !CHALLENGES[k].region));
    if (o.pipeTheme && CHALLENGES[o.pipeTheme]) zoneThemes.unshift(o.pipeTheme);
    pipePairs.forEach((q, k) => {
      const a = P[q[0]], b = P[q[1]];
      const ex = Math.round(a.x + a.w * 0.62 - 22), bx = Math.round(b.x + b.w * 0.4 - 22);
      // Reserve enough space for the longest room; rooms must never overlap each other.
      const Z = makePipeZone(width + 1200 + k * 4400, zoneThemes[k % zoneThemes.length]);
      pipeSolids.push({ x: ex, y: a.y - 46, w: 44, h: 46, pipe: true, theme: Z.theme }, { x: bx, y: b.y - 46, w: 44, h: 46, pipe: true, theme: Z.theme });
      for (let c = 0; c < 3; c++) coins.push({ x: ex + 22, y: Math.max(60 + c * 22, a.y - 70 - c * 22) });
      Z.back = { x: bx + 22, y: b.y - 46 };
      pipes.push({ x: ex + 22, y: a.y - 46, zone: k });
      pipeZones.push(Z);
      Z.coins.forEach((c) => coins.push(c));
      Z.enemies.forEach((e) => enemies.push(e));
      Z.lasers.forEach((l) => lasers.push(l));
      Z.powerups.forEach((p) => powerups.push(p));
      mfaTokens.push(Z.token);
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if ((Math.abs(e.x - ex - 22) < 80 && Math.abs(e.y - a.y) < 60) ||
            (Math.abs(e.x - bx - 22) < 80 && Math.abs(e.y - b.y) < 60)) enemies.splice(i, 1);
      }
    });
    return {
      pipes: pipes, pipeZones: pipeZones,
      width: width, platforms: P.concat(floaters, ledges, bridges, pipeSolids, [].concat.apply([], pipeZones.map((z) => z.platforms))), lasers: lasers, coins: coins, mfaTokens: mfaTokens, powerups: powerups, props: props, enemies: enemies,
      movers: movers, obstacles: obstacles, vehicles: vehicles, deco: deco,
      secret: sx ? Object.assign(sx, { name: o.secretName || 'PHONE BOX' }) : sx, bonus: sx ? makeBonus(width + 400, typeof o.secret === 'string' ? o.secret : 'cloud') : null,
      checkpoints: cpIdx.map((i) => ({ x: P[i].x + 40, y: P[i].y })),
      spawn: { x: 60, y: 230 },
      boss: Object.assign({ trigger: arena.x + 40, left: arena.x, right: arena.x + 640, floor: arena.y }, m.boss),
      exit: { x: arena.x + 570, y: arena.y - 90, w: 40, h: 90 }
    };
  }

  const OB_SIZE = { bus: [96, 56], cab: [72, 42], flowers: [56, 34], bikes: [84, 34], herring: [88, 62], bakery: [88, 62], hotdog: [64, 52], icecream: [64, 38], lifeguard: [34, 52], outback4x4: [88, 44], vespa: [68, 44], fiat: [78, 44], cafe: [78, 40], kiosk: [44, 64], gelato: [68, 38], pickup: [88, 44], schoolbus: [96, 56], taxi: [72, 42] };

  // Secret bonus room: one screen of floating platforms over a themed floor, packed with credits.
  // Themes: cloud (Bliss hill), retro (classic desktop), xbox (Game Pass arena).
  const BONUS = { cloud: ['grass', 'cloud_plat'], retro: ['retro', 'retro_plat'], xbox: ['xbox', 'xbox_plat'] };
  function makeBonus(x, theme) {
    const T = BONUS[theme] ? theme : 'cloud';
    const clouds = [], coins = [];
    let cx = x + 90;
    for (let k = 0; k < 4; k++) {
      const cy = ri(170, 225) - (k % 2) * 40;
      clouds.push({ x: cx, y: cy, w: 80, h: 16, cloud: BONUS[T][1] });
      for (let c = 0; c < 3; c++) coins.push({ x: cx + 16 + c * 24, y: cy - 24 });
      cx += ri(110, 130);
    }
    for (let c = 0; c < 14; c++) coins.push({ x: x + 60 + c * 36, y: 300 - 30 - Math.round(Math.sin(c / 13 * Math.PI) * 50) });
    return {
      x: x, w: 640, theme: T, floor: { x: x, y: 300, w: 640, h: 100, bliss: BONUS[T][0] }, clouds: clouds, coins: coins,
      token: { x: clouds[2].x + 40, y: clouds[2].y - 60 }, power: { kind: pick(['copilot', 'powerbi', 'defender']), x: clouds[1].x + 40, y: clouds[1].y - 50 },
      exit: { x: x + 590, y: 300 }
    };
  }

  const CHALLENGES = {
    pipelines: { name: 'AZURE PIPELINES', hint: 'FIX BUGS. TEST BEFORE YOU DEPLOY.', stages: ['BUILD', 'TEST', 'SCAN', 'APPROVE', 'DEPLOY'], tips: ['COMPILE CLEAN', 'CATCH PIPELINE BUGS', 'DEFENDER FOR CLOUD', 'REVIEW PERMISSIONS', 'SHIP WITH AZURE'], threats: ['bug', 'bug', 'image', 'rbac', 'endpoint'] },
    aks: { name: 'AKS CONTAINER CLUSTER', hint: 'CLIMB PODS AND SECURE THE CLUSTER.', stages: ['NODE POOL', 'POD HOP', 'RBAC', 'INGRESS', 'HEALTH CHECK'], tips: ['SCALE WITH AKS', 'ISOLATE WORKLOADS', 'LEAST PRIVILEGE', 'USE PRIVATE LINK', 'AZURE MONITOR'], threats: ['image', 'bug', 'rbac', 'endpoint', 'guest'] },
    actions: { name: 'GITHUB ACTIONS', hint: 'RACE RUNNERS. REVIEW GUEST ACCESS.', stages: ['CHECKOUT', 'RUNNER', 'UNIT TEST', 'IDENTITY', 'RELEASE'], tips: ['REVIEW YOUR CODE', 'HOSTED RUNNERS', 'FIX FAILING TESTS', 'ENTRA ACCESS REVIEWS', 'DEPLOY TO AZURE'], threats: ['guest', 'bug', 'bug', 'rbac', 'endpoint'] },
    docker: { name: 'DOCKER IMAGE DOCK', hint: 'CLIMB CONTAINERS. PATCH UNSAFE IMAGES.', stages: ['DOCKERFILE', 'BUILD IMAGE', 'SCAN IMAGE', 'REGISTRY', 'CONTAINER APPS'], tips: ['SMALL TRUSTED BASE', 'REBUILD AND PATCH', 'DEFENDER FOR CLOUD', 'AZURE CONTAINER REGISTRY', 'RUN ON AZURE'], threats: ['image', 'bug', 'image', 'endpoint', 'rbac'] },
    entra: { name: 'ENTRA ACCESS VAULT', hint: 'VERIFY IDENTITIES. GRANT LEAST PRIVILEGE.', stages: ['SIGN IN', 'MFA', 'ACCESS POLICY', 'ROLE REVIEW', 'GUEST CLEANUP'], tips: ['VERIFY EVERY REQUEST', 'USE STRONG MFA', 'CONDITIONAL ACCESS', 'LEAST PRIVILEGE', 'REVIEW STALE GUESTS'], threats: ['guest', 'phish', 'endpoint', 'rbac', 'guest'] },
    metro: { region: 'francecentral', music: 'metro', name: 'PARIS METRO - LIGNE 14', hint: 'RIDE THE LINES. ROUTE TRAFFIC SAFELY.', stages: ['TICKET GATE', 'QUAI', 'CORRESPONDANCE', 'RUSH HOUR', 'SORTIE'], tips: ['FRONT DOOR WAF', 'LOAD BALANCE TRAFFIC', 'ROUTE WITH FRONT DOOR', 'DDOS PROTECTION', 'PRIVATE ENDPOINTS'], threats: ['guest', 'bug', 'endpoint', 'bug', 'rbac'] },
    tube: { region: 'uksouth', music: 'metro', name: 'LONDON UNDERGROUND', hint: 'MIND THE GAP. KEEP YOUR NETWORK PRIVATE.', stages: ['TICKET HALL', 'BAKER STREET', 'INTERCHANGE', 'WESTMINSTER', 'WAY OUT'], tips: ['ENTRA ACCESS REVIEWS', 'AZURE MONITOR', 'ROUTE WITH FRONT DOOR', 'PRIVATE ENDPOINTS', 'LEAST PRIVILEGE'], threats: ['guest', 'bug', 'endpoint', 'rbac', 'bug'] },
    functions: { name: 'AZURE FUNCTIONS REACTOR', hint: 'HANDLE EVENTS. SECURE EVERY TRIGGER.', stages: ['TRIGGER', 'BINDING', 'EXECUTE', 'RETRY', 'OBSERVE'], tips: ['VALIDATE INPUT EVENTS', 'USE MANAGED IDENTITY', 'KEEP FUNCTIONS SMALL', 'MAKE RETRIES SAFE', 'AZURE MONITOR'], threats: ['endpoint', 'rbac', 'bug', 'image', 'bug'] }
  };
  function makePipeZone(x0, theme) {
    const C = CHALLENGES[theme], F = 300;
    const widths = Array.from({ length: 5 }, () => ri(560, 660));
    const W = widths.reduce((a, b) => a + b, 400);
    const platforms = [{ x: x0, y: F, w: W, h: 100, pipeFloor: true, cloudKind: theme },
      { x: x0, y: -60, w: W, h: 90, pipeFloor: true, ceil: true }];
    const coins = [], enemies = [], lasers = [], stages = [], powerups = [];
    const layouts = shuffle(['steps', 'catwalk', 'duct', 'split', 'security', 'arena', 'switchback']).slice(0, 5);
    // Keep a duck/roof choice without turning every educational bay into a tunnel.
    if (!layouts.includes('duct')) layouts[ri(0, 4)] = 'duct';
    const lessons = shuffle(C.stages.map((name, i) => ({ name, tip: C.tips[i], threat: C.threats[i] })));
    let x = x0 + 200, token;
    lessons.forEach((lesson, i) => {
      const w = widths[i], layout = layouts[i], start = platforms.length;
      const add = (dx, y, pw, h, flags) => platforms.push(Object.assign({ x: x + dx, y, w: pw, h, cloudKind: theme }, flags));
      const groundEnemy = (dx, type = lesson.threat) => enemies.push({ type, x: x + dx, y: F, range: type === 'endpoint' ? 0 : 20 });
      stages.push({ x, name: lesson.name, tip: lesson.tip, layout });
      if (layout === 'steps') {
        add(60, 252, 70, 48); add(130, 204, 110, 96); add(240, 252, 70, 48);
        groundEnemy(370); groundEnemy(w - 60, 'image');
      } else if (layout === 'catwalk') {
        add(50, 220, 100, 14); add(200, 158, 160, 14); add(w - 140, 220, 90, 14);
        groundEnemy(180); groundEnemy(w - 60, 'rbac');
      } else if (layout === 'duct') {
        add(180, 254, ri(140, 180), 20, { lowTunnel: true });
        for (let c = 0; c < 4; c++) coins.push({ x: x + 192 + c * 36, y: 289 });
        groundEnemy(90); groundEnemy(w - 80, 'guest');
      } else if (layout === 'split') {
        add(40, 240, 100, 14); add(180, 180, 110, 14);
        add(330, 220, 90, 14); add(w - 110, 150, 70, 14);
        groundEnemy(250); groundEnemy(w - 60, 'bug');
      } else if (layout === 'security') {
        add(60, 228, 100, 14); add(320, 164, 100, 14);
        [240, w - 100].forEach((dx, j) => lasers.push({ x: x + dx, y: F - 84 + j * 24, w: 6, h: 84 - j * 24, on: ri(900, 1200), off: ri(1400, 1800), phase: ri(0, 1800) }));
        groundEnemy(190); groundEnemy(w - 45, 'endpoint');
      } else if (layout === 'arena') {
        add(60, 246, 70, 54); add(210, 180, 130, 14); add(w - 150, 246, 70, 54);
        groundEnemy(170); groundEnemy(w - 200, 'image');
        enemies.push({ type: 'endpoint', x: x + 275, y: 180, range: 0 });
      } else {
        add(60, 240, 90, 14); add(190, 180, 90, 14); add(320, 126, 100, 14);
        groundEnemy(160); groundEnemy(w - 65, 'rbac');
      }
      const route = platforms.slice(start);
      route.forEach((p) => {
        for (let c = 0; c < 3; c++) coins.push({ x: p.x + p.w * (c + 1) / 4, y: p.y - 24 });
      });
      for (let c = 0; c < 3; c++) {
        const cx = x + w - 110 + c * 28;
        const cy = Math.min(270, ...route.filter((p) => cx + 8 > p.x && cx - 8 < p.x + p.w).map((p) => p.y - 24));
        coins.push({ x: cx, y: cy });
      }
      const reward = route.reduce((a, b) => a.y < b.y ? a : b);
      if (i === 2) token = { x: reward.x + reward.w / 2, y: reward.y - 26 };
      if (i !== 2) powerups.push({ kind: ['spread', 'defender', '', 'pierce', 'teams'][i], x: reward.x + reward.w / 2, y: reward.y - 26 });
      x += w;
    });
    platforms.push({ x: x0 + W - 112, y: F - 46, w: 44, h: 46, pipe: true, theme });
    return {
      x: x0, w: W, theme, music: C.music, name: C.name, hint: C.hint, stages, powerups,
      timeBonus: Math.ceil(W / 150) + 60, platforms, coins, enemies, lasers,
      token,
      entry: { x: x0 + 70, y: 250 }, exit: { x: x0 + W - 90, y: F - 46 }
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
    for (let d = 0; d < (o.botnets === undefined ? 3 : o.botnets); d++) enemies.push({ type: 'botnet', x: 1600 + Math.round((lastX - 2400) * (d + 0.5) / 3), y: ri(60, 90), range: 160 });
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

      const en = s.boss ? 3 : ri(5, 7);
      const threats = ['spider', 'robot', 'drone', 'bug', 'rbac', 'endpoint', 'guest', 'image'];
      if (!s.boss) threats.push('hacker');
      for (let e = 0; e < en; e++) {
        const firstHacker = s.i === 0 && e === 0;
        const t = firstHacker ? 'hacker' : pick(threats);
        const range = t === 'drone' || t === 'endpoint' ? 0 : ri(40, 70);
        const half = t === 'hacker' ? range + 95 : 36;
        const ex = firstHacker ? ri(s.x + 400, s.x + 760) : take(s, half, s.x + 260, limit);
        if (firstHacker) s.occ.push([ex - half, ex + half]);
        if (ex !== null) enemies.push({ type: t, x: ex, y: t === 'drone' ? ri(180, 230) : F, range: range, shoot: t === 'robot' && Math.random() < 0.4 });
      }
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
      for (let c = 0; c < ri(2, 3); c++) coins.push({ x: Math.round(rnd(s.x + 220, limit)), y: ri(262, 275) });
    });
    // guarantee at least 3 MFA tokens, on the floor if no rack carried one
    for (let i = 0; mfaTokens.length < 3; i++) {
      const s = secs[(i + 1) % secs.length];
      mfaTokens.push({ x: Math.round(rnd(s.x + 260, s.x + s.len * 0.5)), y: 262 });
    }
    const spots = shuffle(platforms.filter((q) => q.y < F && q.h < 80).map((q) => ({ x: q.x + q.w / 2, y: q.y - 36 })));
    secs.forEach((q) => { if (!q.boss) spots.push({ x: Math.round(rnd(q.x + 300, q.x + q.len * 0.5)), y: 262 }); });
    while (spots.length < 6) spots.push({ x: 120 + spots.length % 2 * 100, y: 262 });
    const powerups = powerKinds(4, POWER_RUN).map((kind, i) => Object.assign({ kind: kind }, spots[i]));
    clearWeapons(powerups, platforms, 262);
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
      id: 1, region: 'westeurope', ambient: { sky: ['plane', 'plane', 'balloon'], birds: 'gull', road: ['tram', 'cyclist', 'cyclist', 'mini'], rail: ['nltrain'], railY: 234, water: ['canalboat'] }, regionName: 'WEST EUROPE', city: 'AMSTERDAM', name: 'Amsterdam Canal Run', mode: 'run', theme: 'roof',
      tint: 0xffc0a0, landmarks: 'AMSTERDAM - SCHIPHOL - MICROSOFT HQ - KINDERDIJK - ROTTERDAM - UTRECHT - THE HAGUE', hint: 'RIDE CANAL BOATS, MIND THE PULL-UP BRIDGES, GRAB THE AZURE BIKE', ground: 'quay', water: true, rail: 'quay',
      boss: { kind: 'kraker', name: 'DE KRAKER: ACCESS BROKER', proj: 'kraker' },
      opt: { count: 24, gapMin: 100, gapMax: 175, minW: 220, maxW: 340, cpEvery: 7, laserRate: 0.2, robotRate: 0.34, spiderRate: 0.24, droneRate: 0.16, stepRate: 0.14, dropRate: 0.12, floatRate: 0.55, stoneRate: 0.45, power: 4, props: ['tulips', 'bike'], water: true, bridgeRate: 0.2, drawRate: 0.6, boatRate: 0.14, obstacles: ['flowers', 'bikes'], stand: 'herring', obstacleRate: 0.3, bikes: 2, extraRate: 0.35, floatEnemyRate: 0.3, shootRate: 0.3 }
    },
    {
      id: 2, region: 'uksouth', ambient: { sky: ['plane', 'heli'], birds: 'pigeon', road: ['redbus', 'cab', 'cab', 'cyclist'] }, regionName: 'UK SOUTH', city: 'LONDON', name: 'London Thames Run', mode: 'run', theme: 'roof',
      tint: 0xb4c8ff, landmarks: 'BIG BEN - THAMES - UNDERGROUND - STONEHENGE - EDINBURGH - LIVERPOOL - BLACKPOOL', hint: 'RIDE THE UNDERGROUND PIPES. THE RED PHONE BOX HIDES A SECRET!', ground: 'embank', water: true, rail: 'embank',
      boss: { kind: 'kingpin', name: 'THE PHISHING KINGPIN', proj: 'kingpin' },
      opt: { count: 28, gapMin: 105, gapMax: 185, minW: 210, maxW: 330, cpEvery: 7, laserRate: 0.22, robotRate: 0.36, spiderRate: 0.25, droneRate: 0.2, stepRate: 0.16, dropRate: 0.12, floatRate: 0.55, stoneRate: 0.5, power: 5, props: ['postbox', 'phone'], water: true, bridgeRate: 0.12, boatRate: 0.14, obstacles: ['bus', 'cab', 'cab'], obstacleRate: 0.35, bikes: 1, secret: true, pipeTheme: 'tube', extraRate: 0.4, floatEnemyRate: 0.35, shootRate: 0.35 }
    },
    {
      id: 3, region: 'francecentral', ambient: { sky: ['plane', 'balloon', 'heli'], birds: 'pigeon', road: ['citroen', 'vespa', 'cyclist', 'cab'], water: ['region'] }, regionName: 'FRANCE CENTRAL', city: 'PARIS', name: 'Paris Seine Run', mode: 'run', theme: 'roof',
      tint: 0xffc7d7, landmarks: 'EIFFEL TOWER - SACRE-COEUR - MOULIN ROUGE - LOUVRE - MONT-SAINT-MICHEL - CARCASSONNE',
      hint: 'RIDE THE METRO PIPES. A GHOST STATION HIDES A RETRO SECRET!', ground: 'quai_paris', water: true, rail: 'quai_paris',
      boss: { kind: 'savate', name: 'MADAME SAVATE: SPOOFER', proj: 'savate' },
      opt: {
        count: 24, gapMin: 105, gapMax: 185, minW: 210, maxW: 330, cpEvery: 7,
        laserRate: 0.18, robotRate: 0.34, spiderRate: 0.24, droneRate: 0.2,
        stepRate: 0.16, dropRate: 0.13, floatRate: 0.52, stoneRate: 0.45, power: 5,
        props: ['easel', 'macarons'], water: true, bridgeRate: 0.12, boatRate: 0.24,
        obstacles: ['vespa', 'cafe', 'kiosk'], stand: 'bakery', obstacleRate: 0.32, secret: 'retro', secretName: 'GHOST STATION', pipeTheme: 'metro',
        extraRate: 0.38, floatEnemyRate: 0.34, shootRate: 0.28
      }
    },
    {
      id: 4, region: 'japaneast', ambient: { sky: ['plane', 'heli'], birds: 'crane', fx: 'petals', road: ['taxi', 'mini', 'cab', 'schoolbus', 'vespa'], roadY: 326, roadRate: 2.6, roadMax: 3, rail: ['tokyometro'], railY: 274 }, regionName: 'JAPAN EAST', city: 'TOKYO', name: 'Tokyo Skyway Pursuit', mode: 'fly', theme: 'neon',
      tint: 0xffffff, landmarks: 'MOUNT FUJI - TOKYO TOWER - HIMEJI - OSAKA CASTLE - MIYAJIMA - KYOTO - SHINKANSEN', hint: 'FLY WITH ARROWS / WASD. DODGE DRONES, FLY THROUGH GOLD RINGS. SHIFT = BOOST',
      boss: { kind: 'ronin', name: 'RONIN ROOTKIT', proj: 'ronin', air: true },
      opt: { cols: 28, spaceMin: 260, spaceMax: 320, halfMin: 68, halfMax: 86, rings: 8, coins: 8, drones: 14, scroll: 100, cpEvery: 8, props: ['lantern', 'carp'] }
    },
    {
      id: 5, region: 'australiaeast', ambient: { sky: ['plane', 'heli', 'balloon'], birds: 'cockatoo', road: ['outback4x4', 'pickup', 'muscle', 'mini'] }, regionName: 'AUSTRALIA EAST', city: 'SYDNEY', name: 'Sydney Harbour Run', mode: 'run', theme: 'roof',
      tint: 0xffe0a0, landmarks: 'SYDNEY BEACH - OPERA HOUSE - HARBOUR BRIDGE - OUTBACK - ULURU - TWELVE APOSTLES', hint: 'FROM SYDNEY SURF TO THE RED OUTBACK. HOP FERRIES AND EXPEDITION 4X4S!', ground: 'pier', water: true, rail: 'pier',
      boss: { kind: 'brawler', name: 'THE BOTNET BRAWLER', proj: 'brawler' },
      opt: { count: 34, gapMin: 110, gapMax: 195, minW: 200, maxW: 320, cpEvery: 8, laserRate: 0.22, robotRate: 0.38, spiderRate: 0.28, droneRate: 0.24, stepRate: 0.18, dropRate: 0.15, floatRate: 0.55, stoneRate: 0.5, power: 6, props: ['surf', 'sign'], water: true, bridgeRate: 0.1, boatRate: 0.16, obstacles: ['icecream', 'lifeguard', 'outback4x4'], stand: 'outback4x4', obstacleRate: 0.3, extraRate: 0.45, floatEnemyRate: 0.4, shootRate: 0.4 }
    },
    {
      id: 6, region: 'italynorth', ambient: { sky: ['plane', 'heli'], birds: 'pigeon', road: ['vespa', 'vespa', 'mini', 'citroen'] }, regionName: 'ITALY', city: 'VENICE', name: 'Venice Lagoon Run', mode: 'run', theme: 'roof',
      tint: 0xffc19b, landmarks: 'RIALTO - ST MARK\'S - GRAND CANAL - BURANO',
      hint: 'RACE VENICE TURQUOISE CANALS. SEEK THE TREVI PORTAL!',
      ground: 'itcanal', water: true, rail: 'itcanal',
      boss: { kind: 'gladiator', name: 'MAXIMUS THE RANSOMER', proj: 'gladiator' },
      opt: {
        count: 28, gapMin: 100, gapMax: 180, minW: 210, maxW: 320, cpEvery: 7,
        laserRate: 0.2, robotRate: 0.34, spiderRate: 0.24, droneRate: 0.2,
        stepRate: 0.15, dropRate: 0.12, floatRate: 0.55, stoneRate: 0.45, power: 5,
        props: ['cypress', 'amphora'], water: true, bridgeRate: 0.13, boatRate: 0.15,
        obstacles: ['vespa', 'fiat', 'gelato'], obstacleRate: 0.28, bikes: 1,
        secret: 'cloud', secretName: 'TREVI PORTAL', extraRate: 0.4, floatEnemyRate: 0.35, shootRate: 0.35
      }
    },
    {
      id: 7, region: 'brazilsouth', ambient: { sky: ['heli', 'balloon', 'plane'], birds: 'parrot', fx: 'confetti' }, regionName: 'BRAZIL SOUTH', city: 'RIO', name: 'Rio Sugarloaf Pursuit', mode: 'fly', theme: 'rock',
      tint: 0xb8ff9a, landmarks: 'CHRIST THE REDEEMER - SUGARLOAF - BRASILIA - IGUAZU - MANAUS - SAO PAULO', hint: 'NARROW PASSES AND MORE DRONES. KEEP YOUR BOOST METER READY. SHIFT = BOOST',
      boss: { kind: 'capoeira', name: 'CAPOEIRA CRYPTOJACKER', proj: 'capoeira', air: true },
      opt: { cols: 36, spaceMin: 250, spaceMax: 310, halfMin: 66, halfMax: 80, rings: 9, coins: 9, drones: 18, scroll: 110, cpEvery: 9, props: ['balloon', 'kite'] }
    },
    {
      id: 8, region: 'mexicocentral', ambient: { sky: ['balloon', 'balloon', 'balloon', 'plane'], birds: 'parrot', fx: 'confetti' }, regionName: 'MEXICO CENTRAL', city: 'MEXICO CITY', name: 'Mexico City Skyway', mode: 'fly', theme: 'adobe',
      tint: 0xffffff, landmarks: 'TEOTIHUACAN - CHICHEN ITZA - ANGEL - BELLAS ARTES - XOCHIMILCO',
      hint: 'SOAR ABOVE THE PYRAMIDS. THREAD THE ADOBE PILLARS!',
      boss: { kind: 'luchador', name: 'EL LUCHADOR ZERO-DAY', proj: 'luchador', air: true },
      opt: { cols: 32, spaceMin: 255, spaceMax: 310, halfMin: 68, halfMax: 84, rings: 9, coins: 9, drones: 16, scroll: 105, cpEvery: 8, props: ['pinata', 'papel'] }
    },
    {
      id: 9, region: 'westus2', ambient: { sky: ['plane', 'blimp', 'heli'], birds: 'crow', road: ['taxi', 'pickup', 'schoolbus', 'muscle'], balls: ['football', 'baseball'], fx: 'leaves' }, regionName: 'WEST US 2', city: 'REDMOND', name: 'Redmond Campus Lake Run', mode: 'run', theme: 'roof',
      tint: 0x9bd5c7, landmarks: 'MICROSOFT CAMPUS - SPACE NEEDLE - MT RAINIER - SEATTLE',
      hint: 'RUN THE LAKEFRONT. AN XBOX-GREEN DOOR HIDES A BONUS.',
      ground: 'rd', water: true, rail: 'rd',
      boss: { kind: 'enforcer', name: 'THE DDOS ENFORCER', proj: 'enforcer' },
      opt: {
        count: 24, gapMin: 100, gapMax: 170, minW: 210, maxW: 290, cpEvery: 8,
        laserRate: 0.18, robotRate: 0.34, spiderRate: 0.24, droneRate: 0.2,
        stepRate: 0.15, dropRate: 0.12, floatRate: 0.52, stoneRate: 0.45,
        power: 5, props: ['coffee', 'mailbox'], water: true, bridgeRate: 0.12,
        boatRate: 0.15, obstacles: ['pickup', 'schoolbus', 'taxi'], obstacleRate: 0.3,
        secret: 'xbox', secretName: 'XBOX DOOR', extraRate: 0.35, floatEnemyRate: 0.3, shootRate: 0.3
      }
    },
    {
      id: 10, region: 'eastus', regionName: 'EAST US', city: 'VIRGINIA', name: 'Virginia Data Center', mode: 'run', theme: 'rack',
      tint: 0xffffff, landmarks: 'CAPITOL - WASHINGTON MONUMENT - LINCOLN MEMORIAL', hint: 'STAND ON HACK TERMINALS TO OPEN SEC GATES. HOLD E TO RAISE THE MFA SHIELD',
      boss: { kind: 'guardian', name: 'HIGH-RISK CYBERGUARDIAN' },
      opt: { sections: 4 }
    },
    {
      id: 11, region: 'eastus2', regionName: 'EAST US 2', city: 'NEW YORK', name: 'New York Hudson Run', mode: 'run', theme: 'roof',
      ambient: { sky: ['heli', 'plane'], birds: 'pigeon', road: ['taxi', 'taxi', 'mtabus'], roadRate: 6.5, roadMax: 2, rail: ['nycmetro'], railY: 238, water: ['region'] },
      tint: 0xffe6c6, landmarks: 'STATUE OF LIBERTY - EMPIRE STATE - CHRYSLER - BROOKLYN BRIDGE - TIMES SQUARE',
      hint: 'NEW YORK CITY - HOSTED IN AZURE EAST US 2. DEFEND THE HUDSON CLOUD ROUTE!',
      ground: 'quay', water: true, rail: 'quay',
      boss: { kind: 'broker', name: 'ZERO DAY BOXER', proj: 'broker' },
      opt: {
        count: 28, gapMin: 100, gapMax: 180, minW: 220, maxW: 320, cpEvery: 7,
        laserRate: 0.18, robotRate: 0.3, spiderRate: 0.32, droneRate: 0.24,
        stepRate: 0.16, dropRate: 0.14, wallRate: 0.16, stairRate: 0.14,
        floatRate: 0.55, stoneRate: 0.5, power: 6, props: ['hydrant', 'newsbox'],
        water: true, bridgeRate: 0.12, boatRate: 0.14,
        obstacles: ['taxi', 'hotdog'], stand: 'hotdog', obstacleRate: 0.34, bikes: 1,
        secret: 'cloud', secretName: 'SKYLINE CLOUD', extraRate: 0.4,
        floatEnemyRate: 0.35, shootRate: 0.3
      }
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
      height: 360, mode: m.mode, theme: m.theme, tint: m.tint, ground: m.ground || null, water: !!m.water, rail: m.rail || null, ambient: m.ambient || null, mfaTokens: []
    }, body);
    L.enemies.forEach((e) => { e.skin = m.region; });
    L.time = m.mode === 'fly' ? Math.round(L.width / L.scroll + 90) : Math.round(L.width / 1000 * (m.theme === 'rack' ? 30 : 26) + 110);
    return L;
  };
})();
