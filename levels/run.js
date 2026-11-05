(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const G = (AH.LevelGenerator = AH.LevelGenerator || {});
  const { rnd, ri, pick, clamp, shuffle, POWER_RUN, powerKinds, clearWeapons, OB_SIZE } = G;

  const CHALLENGES = G.CHALLENGES, makeBonus = G.makeBonus, makePipeZone = G.makePipeZone;

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
      const Z = makePipeZone(width + Math.max(1200, 400 + G.bonusWidth(o.secret) + 160) + k * 4400, zoneThemes[k % zoneThemes.length]);
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

  G.makeRun = makeRun;
})();
