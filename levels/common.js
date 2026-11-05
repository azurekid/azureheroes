(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const G = (AH.LevelGenerator = AH.LevelGenerator || {});
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  };
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

  const OB_SIZE = { bus: [96, 56], cab: [72, 42], flowers: [56, 34], bikes: [84, 34], herring: [88, 62], bakery: [88, 62], hotdog: [64, 52], icecream: [64, 38], lifeguard: [34, 52], outback4x4: [88, 44], vespa: [68, 44], fiat: [78, 44], cafe: [78, 40], kiosk: [44, 64], gelato: [68, 38], pickup: [88, 44], schoolbus: [96, 56], taxi: [72, 42] };

  Object.assign(G, { rnd, ri, pick, clamp, shuffle, POWER_RUN, POWER_FLY, powerKinds, clearWeapons, OB_SIZE });
})();
