/* Level 3 - Sky Canyon Pursuit. Auto-scrolling flight: rocks are hazards, always >= 130px gap to fly through. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Levels = AH.Levels || {};

  const centers = [190, 250, 150, 230, 280, 170, 130, 250, 200, 280, 150, 240, 190, 270, 160, 230, 280, 180, 140, 250];
  const platforms = [];
  centers.forEach(function (c, i) {
    const x = 760 + i * 280;
    platforms.push({ x: x, y: 0, w: 56, h: c - 65 });
    platforms.push({ x: x, y: c + 65, w: 56, h: 360 - (c + 65) });
  });
  const lastX = 760 + (centers.length - 1) * 280;

  // rings sit between rock sections, at the height of the neighbouring gaps
  const rings = [0, 3, 5, 7, 9, 12, 15, 18].map(function (i) {
    const c = (centers[i] + centers[i + 1]) / 2;
    return { x: 760 + i * 280 + 140, y: Math.round(c), r: 34 };
  });
  const coins = [1, 4, 8, 11].map(function (i) {
    return { x: 760 + i * 280 + 140, y: Math.round((centers[i] + centers[i + 1]) / 2) - 70 };
  });
  const mfaTokens = [2, 10, 16].map(function (i) {
    return { x: 760 + i * 280 + 140, y: Math.round((centers[i] + centers[i + 1]) / 2) + 40 };
  });
  const enemies = [
    { type: 'drone', x: 1500, y: 170, range: 0 },
    { type: 'drone', x: 2500, y: 250, range: 0 },
    { type: 'drone', x: 3500, y: 150, range: 0 },
    { type: 'drone', x: 4500, y: 230, range: 0 },
    { type: 'drone', x: 5300, y: 190, range: 0 }
  ];

  AH.Levels[3] = {
    id: 3,
    name: 'Sky Canyon Pursuit',
    width: lastX + 700,
    height: 360,
    mode: 'fly',
    theme: 'rock',
    time: 100,
    scroll: 100,
    spawn: { x: 120, y: 190 },
    platforms: platforms,
    lasers: [],
    coins: coins,
    mfaTokens: mfaTokens,
    rings: rings,
    enemies: enemies,
    checkpoints: [{ x: 2400, y: 190 }, { x: 4000, y: 190 }],
    exit: { x: lastX + 640, y: 0, w: 60, h: 360 }
  };
})();
