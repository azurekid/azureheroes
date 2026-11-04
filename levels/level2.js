/* Level 2 - Rooftop Run. Platforms every 200-350px, gaps <= 200px (>130px needs a double jump). */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Levels = AH.Levels || {};

  // [gap, rooftop top y, width]
  const steps = [
    [110, 280, 240], [120, 260, 220], [190, 240, 220], [110, 250, 280], [200, 230, 200], [120, 270, 240], [100, 240, 280],
    [200, 260, 220], [120, 250, 260], [110, 230, 280], [200, 250, 200], [120, 260, 320], [130, 240, 480]
  ];
  const platforms = [{ x: 0, y: 280, w: 420, h: 120 }];
  steps.forEach(function (s) {
    const prev = platforms[platforms.length - 1];
    platforms.push({ x: prev.x + prev.w + s[0], y: s[1], w: s[2], h: 400 - s[1] });
  });
  const P = platforms;
  const last = P[P.length - 1];

  const lasers = [1, 3, 4, 6, 8, 10, 12].map(function (i, n) {
    const p = P[i];
    return { x: Math.round(p.x + p.w * 0.55), y: p.y - 56, w: 6, h: 56, on: 1500, off: 1100, phase: n * 450 };
  });
  const coins = [1, 3, 5, 7, 9, 11].map(function (i) {
    return { x: Math.round(P[i].x + P[i].w * 0.3), y: P[i].y - 40 };
  });
  [2, 4, 7, 10].forEach(function (i) {
    // high coin above the gap that precedes platform i - rewards the double jump
    const gapStart = P[i - 1].x + P[i - 1].w, gapEnd = P[i].x;
    coins.push({ x: Math.round((gapStart + gapEnd) / 2), y: Math.min(P[i].y, P[i - 1].y) - 110 });
  });
  const mfaTokens = [2, 6, 10].map(function (i) {
    return { x: Math.round(P[i].x + P[i].w * 0.2), y: P[i].y - 50 };
  });
  const rng = function (i, f, r) { return { x: Math.round(P[i].x + P[i].w * f), range: r }; };
  const enemies = [
    { type: 'robot', x: rng(1, 0.3, 0).x, y: P[1].y, range: 55 },
    { type: 'robot', x: rng(4, 0.25, 0).x, y: P[4].y, range: 50 },
    { type: 'drone', x: Math.round(P[6].x + P[6].w * 0.5), y: P[6].y - 100, range: 0 },
    { type: 'robot', x: rng(9, 0.3, 0).x, y: P[9].y, range: 60 }
  ];

  AH.Levels[2] = {
    id: 2,
    name: 'Rooftop Run',
    width: last.x + last.w,
    height: 360,
    mode: 'run',
    theme: 'roof',
    time: 150,
    spawn: { x: 60, y: 230 },
    platforms: platforms,
    lasers: lasers,
    coins: coins,
    mfaTokens: mfaTokens,
    enemies: enemies,
    checkpoints: [{ x: P[5].x + 40, y: P[5].y }, { x: P[9].x + 40, y: P[9].y }],
    exit: { x: last.x + last.w - 90, y: last.y - 90, w: 40, h: 90 }
  };
})();
