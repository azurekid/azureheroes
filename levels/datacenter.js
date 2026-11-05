(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const G = (AH.LevelGenerator = AH.LevelGenerator || {});
  const { rnd, ri, pick, clamp, shuffle, powerKinds, POWER_RUN, clearWeapons } = G;

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

  G.makeDataCenter = makeDataCenter;
})();
