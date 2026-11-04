/* Level 4 - Data Center Infiltration. Hack both terminals to open the Sec Gates, then face the CyberGuardian. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Levels = AH.Levels || {};

  const F = 300;
  const floor = function (x, w) { return { x: x, y: F, w: w, h: 100 }; };
  const rack = function (x, y, w) { return { x: x, y: y, w: w, h: F - y }; };

  AH.Levels[4] = {
    id: 4,
    name: 'Data Center Infiltration',
    width: 5800,
    height: 360,
    mode: 'run',
    theme: 'rack',
    time: 220,
    spawn: { x: 60, y: 250 },
    platforms: [
      floor(0, 1000), rack(520, 250, 120), rack(760, 250, 90),
      floor(1100, 1300), rack(1500, 240, 140), rack(1750, 250, 100),
      floor(2500, 1500), rack(2900, 250, 120), rack(3300, 240, 140),
      floor(4100, 1700), rack(4500, 250, 120)
    ],
    lasers: [],
    cables: [
      { x: 330, y: F, w: 40 }, { x: 880, y: F, w: 36 }, { x: 1250, y: F, w: 40 }, { x: 1950, y: F, w: 40 },
      { x: 2700, y: F, w: 40 }, { x: 3150, y: F, w: 40 }, { x: 3550, y: F, w: 40 }, { x: 4300, y: F, w: 40 }, { x: 4800, y: F, w: 40 }
    ],
    coins: [
      { x: 250, y: 270 }, { x: 580, y: 215 }, { x: 800, y: 215 }, { x: 1200, y: 270 }, { x: 1570, y: 205 },
      { x: 1800, y: 215 }, { x: 2600, y: 270 }, { x: 2960, y: 215 }, { x: 3360, y: 205 }, { x: 4560, y: 215 }
    ],
    mfaTokens: [{ x: 560, y: 205 }, { x: 1570, y: 195 }, { x: 3360, y: 195 }],
    enemies: [
      { type: 'spider', x: 900, y: F, range: 90 },
      { type: 'robot', x: 1850, y: F, range: 100 },
      { type: 'spider', x: 2200, y: F, range: 70 },
      { type: 'spider', x: 3050, y: F, range: 100 },
      { type: 'drone', x: 4400, y: 200, range: 0 }
    ],
    terminals: [{ id: 1, x: 2050, y: F }, { id: 2, x: 3750, y: F }],
    gates: [{ id: 1, x: 2300, y: 0, w: 20, h: F }, { id: 2, x: 3950, y: 0, w: 20, h: F }],
    checkpoints: [{ x: 2560, y: F }, { x: 4160, y: F }, { x: 4980, y: F }],
    boss: { trigger: 5200, left: 5160, right: 5800, floor: F },
    exit: { x: 5720, y: 210, w: 40, h: 90 }
  };
})();
