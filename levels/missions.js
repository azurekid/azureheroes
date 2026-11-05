(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const G = (AH.LevelGenerator = AH.LevelGenerator || {});
  const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const separated = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) >= 100;

  function clear(L, x, floor, support, flight, lift = 20, allowEnemies = false) {
    const height = Math.max(56, lift + 16);
    const box = { x: x - 28, y: floor - height, w: 56, h: height };
    if (flight) { box.y = floor - 24; box.h = 48; }
    if (box.y < 48 || box.y + box.h > 340) return false;
    if (L.platforms.some((p) => p !== support && intersects(box, p))) return false;
    if ([].concat(L.obstacles || [], L.lasers || [], L.gates || [],
      (L.cables || []).map((p) => ({ x: p.x, y: p.y - 12, w: p.w, h: 12 })))
      .some((p) => intersects(box, p))) return false;
    if ((L.pipes || []).some((p) => Math.abs(x - p.x) < 82)) return false;
    if ((L.terminals || []).some((p) => Math.abs(x - p.x) < 60)) return false;
    if (L.secret && Math.abs(x - L.secret.x) < 60) return false;
    if ([].concat(L.coins || [], L.mfaTokens || [], L.powerups || [], L.vehicles || [])
      .some((p) => Math.abs(x - p.x) < 20 && Math.abs((flight ? floor : floor - lift) - p.y) < 36)) return false;
    return allowEnemies || !(L.enemies || []).some((e) => {
      const airborne = e.type === 'drone' || e.type === 'botnet';
      const nearHeight = airborne ? (flight || (e.y < floor && floor - e.y < 240)) : Math.abs(e.y - floor) < 64;
      return nearHeight && Math.abs(x - e.x) < (e.range || 0) + 70;
    });
  }

  function groundSpots(L, platforms, lo, hi, allowEnemies = false) {
    const supports = platforms.filter((p) => !p.pipe && !p.ceil && !p.bridge && !p.lowTunnel && p.w >= 72 && p.x < hi && p.x + p.w > lo);
    // Solid street/rack floors already form the traversable baseline. Admit upper
    // ledges only through single jumps: v=440, g=1100, run=190 (no boost needed).
    const reached = new Set(supports.filter((p) => !p.float && p.h >= 80));
    let changed = true;
    while (changed) {
      changed = false;
      for (const p of supports) {
        if (reached.has(p)) continue;
        if (Array.from(reached).some((q) => {
          const rise = q.y - p.y;
          if (rise < 0 || rise > 80) return false;
          const gap = Math.max(0, p.x - q.x - q.w, q.x - p.x - p.w) + 28;
          const landingTime = (440 + Math.sqrt(440 * 440 - 2200 * rise)) / 1100;
          return gap < 190 * landingTime;
        })) { reached.add(p); changed = true; }
      }
    }
    const spots = [];
    for (const p of supports) {
      if (!reached.has(p)) continue;
      const start = Math.ceil(Math.max(lo, p.x + 36));
      const end = Math.floor(Math.min(hi, p.x + p.w - 36));
      const upper = !!p.float || p.h < 80;
      for (let x = start; x <= end; x += 16) {
        // A short hop above an upper ledge avoids covering its existing coin
        // trail. The 64px pickup height is below the unboosted 88px jump apex.
        for (const lift of upper ? [64, 20] : [20]) {
          if (clear(L, x, p.y, p, false, lift, allowEnemies)) spots.push({
            x, y: p.y - lift, upper,
            side: x - p.x <= 68 || p.x + p.w - x <= 68
          });
        }
      }
    }
    return spots;
  }

  function flightSpots(L, end) {
    const tops = L.platforms.filter((p) => p.y === 0).sort((a, b) => a.x - b.x);
    const spots = [];
    for (let i = 0; i + 1 < tops.length; i++) {
      const a = tops[i], b = tops[i + 1];
      const bottomA = L.platforms.find((p) => p.x === a.x && p.y > 0);
      const bottomB = L.platforms.find((p) => p.x === b.x && p.y > 0);
      if (!bottomA || !bottomB) continue;
      const x = Math.round((a.x + a.w + b.x) / 2);
      if (x + 80 >= end) continue;
      const middle = Math.round((a.h + bottomA.y + b.h + bottomB.y) / 4);
      for (const offset of [0, -40, 40, -64, 64]) {
        const y = Math.max(80, Math.min(290, middle + offset));
        if (clear(L, x, y, null, true)) spots.push({ x, y, upper: offset !== 0 });
      }
    }
    return spots;
  }

  G.addMission = function (L) {
    L.enemies.forEach((enemy) => { delete enemy.bossToken; });
    const end = Math.min(L.width, L.boss ? L.boss.left : L.width - 400) - 180;
    const fly = L.mode === 'fly';
    const spots = fly ? flightSpots(L, end) : groundSpots(L, L.platforms, 320, end);
    const used = [], objectives = [], gems = [];
    function choose(pool, target, lo, hi, upper, description) {
      const options = pool.filter((p) => p.x >= lo && p.x <= hi && used.every((q) => separated(p, q)));
      options.sort((a, b) => {
        const score = (p) => Math.abs(p.x - target) - (upper && p.upper ? end * 2 : 0);
        return score(a) - score(b) || a.x - b.x || a.y - b.y;
      });
      if (!options.length) throw new Error('MISSION PLACEMENT FAILED: ' + description + ' IN LEVEL ' + L.id);
      const p = { x: options[0].x, y: options[0].y };
      used.push(p);
      return p;
    }
    const cachePool = fly ? spots : spots.filter((p) => p.upper || p.side);
    const cache = choose(cachePool, end * 0.22, 400, end * 0.4, true, 'CACHE');
    const relayPool = fly ? spots : spots.filter((p) => !p.upper);
    const relay = choose(relayPool, end * 0.55, Math.max(cache.x + 240, end * 0.42), end * 0.72, false, 'RELAY');
    objectives.push(Object.assign({ id: 'mission-cache', kind: 'cache', label: 'DEPLOYMENT CACHE',
      tip: fly ? 'RECOVER THE CACHE BETWEEN ROCKS.' : 'CHECK THE UPPER AND SIDE ROUTES.', required: true }, cache));
    objectives.push(Object.assign({ id: 'mission-relay', kind: 'relay', label: 'STABILIZE RELAY',
      tip: fly ? 'CACHE FIRST. BLAST THE RELAY.' : 'CACHE FIRST. HOLD E / SHIELD HERE.', required: true }, relay));
    const scan = choose(relayPool, end * 0.73, relay.x + 140, end, false, 'SCAN');
    objectives.push(Object.assign({ id: 'mission-scan', kind: 'scan', label: 'BONUS SECURITY SCAN',
      tip: fly ? 'TOUCH THE SCAN FOR BONUS SCORE.' : 'HOLD S / DOWN TO SCAN FOR BONUS.', required: false }, scan));

    const zones = fly ? [] : (L.pipeZones || []).slice(0, 2);
    const mainCount = 6 - zones.length;
    for (let i = 0; i < mainCount; i++) {
      const p = choose(spots, end * (0.12 + i * 0.68 / (mainCount - 1)), 320, end, true, 'GEM ' + (i + 1));
      gems.push(Object.assign({ id: 'mission-gem-' + (i + 1) }, p));
    }
    zones.forEach((zone, i) => {
      const pool = groundSpots(L, zone.platforms, zone.x + 110, zone.x + zone.w - 180);
      const p = choose(pool, zone.x + zone.w * 0.4, zone.x + 110, zone.x + zone.w - 180, true, 'UNDERGROUND GEM');
      gems.push(Object.assign({ id: 'mission-gem-' + (gems.length + 1), zone: i }, p));
    });
    L.mission = { objectives, gems, gemQuota: 2 };
    const tokenSpots = fly ? spots : groundSpots(L, L.platforms, 320, end, true)
      .filter((p) => !p.upper);
    const carriers = L.enemies.filter((enemy) => enemy.x > 400 && enemy.x < end &&
      (fly ? enemy.type === 'drone' : ['robot', 'rbac', 'endpoint', 'hacker'].includes(enemy.type) &&
        L.platforms.some((p) => !p.float && !p.pipe && p.h >= 80 &&
          Math.abs(p.y - enemy.y) < 2 && enemy.x >= p.x + 32 && enemy.x <= p.x + p.w - 32) &&
        tokenSpots.some((p) => Math.abs(p.x - enemy.x) <= 160 && p.y === enemy.y - 20)));
    const tokens = [];
    for (let i = 0; i < 3; i++) {
      const options = carriers.filter((e) => !e.bossToken).sort((a, b) =>
        Math.abs(a.x - end * (0.25 + i * 0.25)) - Math.abs(b.x - end * (0.25 + i * 0.25)));
      const enemy = options[0];
      if (!enemy) throw new Error('TOKEN CARRIER PLACEMENT FAILED IN LEVEL ' + L.id);
      const spot = tokenSpots.filter((p) => fly || p.y === enemy.y - 20)
        .sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0];
      enemy.bossToken = { id: 'boss-token-' + (i + 1), x: spot.x, y: spot.y - (fly ? 0 : 4) };
      tokens.push(enemy.bossToken);
    }
    L.mission.tokens = tokens;
    L.mission.tokenQuota = 3;
    const rooms = (L.pipeZones || []).map((z, i) => ({
      pool: groundSpots(L, z.platforms, z.x + 100, z.x + z.w - 150),
      lo: z.x + 100, hi: z.x + z.w - 150, zone: i
    }));
    if (L.bonus) {
      const B = L.bonus;
      rooms.push({ pool: groundSpots(L, [B.floor, ...B.clouds], B.x + 100, B.exit.x - 70),
        lo: B.x + 100, hi: B.exit.x - 70, bonus: true });
    }
    L.wardrobeSpots = Array.from({ length: 6 }, (_, i) => {
      const room = rooms.length ? rooms[i % rooms.length] :
        { pool: fly ? spots : groundSpots(L, L.platforms, 320, end, true), lo: 320, hi: end };
      const target = room.lo + (room.hi - room.lo) * (0.12 + Math.floor(i / Math.max(1, rooms.length)) * (rooms.length ? 0.25 : 0.15));
      const point = choose(room.pool, target, room.lo, room.hi, true, 'WARDROBE CACHE');
      if (room.zone !== undefined) point.zone = room.zone;
      if (room.bonus) point.bonus = true;
      return point;
    });
    return L;
  };
})();
