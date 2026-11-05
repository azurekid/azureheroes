/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['sydney'] = AH.Worlds['sydney'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['australiaeast'] = content;

  AH.ArtModules.stages['worlds.sydney.art.70'] = function (C) {
    const { ell, lg, line, lit, rrect, txt, wheels } = C;

    Object.assign(C, { outback4x4 });
    function outback4x4(g) {
        wheels(g, [19, 68], 35, 8);
        rrect(g, 9, 11, 64, 24, 2, lg(g, 0, 11, 0, 35, [[0, '#aab78b'], [0.6, '#668464'], [1, '#344f42']]));
        g.fillStyle = '#d6cbb0'; g.fillRect(9, 9, 64, 4); g.fillRect(12, 12, 3, 10);
        [17, 34, 51].forEach((x) => { rrect(g, x, 14, 13, 10, 1, '#162d39'); lit(g, x + 1, 15, 11, 7, '#b8dee2'); line(g, x + 2, 16, x + 9, 16, 0.7, '#efffff'); });
        g.fillStyle = '#5c7558'; g.fillRect(3, 25, 13, 10); g.fillStyle = '#d7d0ac'; g.fillRect(1, 31, 10, 3);
        g.fillStyle = '#273d37'; g.fillRect(2, 26, 4, 5); ell(g, 3, 26, 2, 2, '#fff1aa');
        [33, 50, 67].forEach((x) => line(g, x, 13, x, 33, 0.7, '#324a39'));
        g.fillStyle = '#d2d3bb'; g.fillRect(36, 25, 4, 1.2); g.fillRect(53, 25, 4, 1.2);
        line(g, 12, 5, 70, 5, 2, '#293e36'); line(g, 12, 8, 70, 8, 1, '#293e36');
        [17, 36, 58, 68].forEach((x) => line(g, x, 5, x, 11, 1, '#293e36'));
        rrect(g, 21, 0, 22, 5, 1, '#bda073'); rrect(g, 46, 1, 17, 4, 1, '#566b58');
        line(g, 26, 0, 26, 5, 1, '#394b3d'); line(g, 38, 0, 38, 5, 1, '#394b3d');
        line(g, 9, 23, 9, 10, 2.4, '#24382e'); line(g, 9, 10, 6, 8, 2.4, '#24382e');
        ell(g, 78, 26, 7, 9, '#1b2926'); ell(g, 78, 26, 3.2, 5, '#8e9b86');
        g.fillStyle = '#304138'; g.fillRect(73, 35, 14, 3);
        txt(g, 'OUTBACK', 37, 29, 0.5, '#e4dfc5');
        for (let x = 13; x < 74; x += 7) { g.fillStyle = 'rgba(223,160,91,0.65)'; g.fillRect(x, 32 + x % 3, 2.8, 1); }
      }
  };

  content.parts['bridge'] = function (C) {
    const lg = (...args) => C.lg(...args);
    const lit = (...args) => C.lit(...args);

    return function (g) {
    const D0 = 30;
    
            g.strokeStyle = '#7a84b8'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(4, D0 + 4); g.quadraticCurveTo(80, -28, 156, D0 + 4); g.stroke();
            g.lineWidth = 1.4; g.beginPath(); g.moveTo(10, D0 + 4); g.quadraticCurveTo(80, -14, 150, D0 + 4); g.stroke();
            g.strokeStyle = 'rgba(160,170,230,0.7)'; g.lineWidth = 0.7;
            for (let x = 16; x < 148; x += 8) { const t = (x - 4) / 152, y = D0 + 4 - 4 * t * (1 - t) * 46; g.beginPath(); g.moveTo(x, y); g.lineTo(x, D0); g.stroke(); }
            g.fillStyle = lg(g, 0, D0, 0, D0 + 8, [[0, '#a8b0e0'], [1, '#3a3a70']]); g.fillRect(0, D0, 160, 8);
            for (let x = 4; x < 160; x += 8) lit(g, x, D0 + 2, 1.4, 1.4, '#ffe9a0');
            g.fillStyle = '#4a4a80'; [8, 152].forEach(function (x) { g.fillRect(x - 4, D0 + 8, 8, 62); });
          
    };
  };

  content.parts['SKIES_australiaeast'] = function (C) {

    return { stops: [[0, '#061a3a'], [0.3, '#1a3a7a'], [0.5, '#5a3a9a'], [0.68, '#ff5a8a'], [0.84, '#ff9a40'], [1, '#ffe070']], sun: { x: 360, y: 228, r: 80, c: ['#fffbb0', '#ffc840', '#ff7a30'] }, halo: ['rgba(255,230,120,0.6)', 'rgba(255,120,80,0.2)'], cl: ['rgba(60,80,170,0.5)', 'rgba(255,120,150,0.65)', 'rgba(255,220,140,0.5)'], hz: 'rgba(255,220,120,0.55)', stars: 120, seed: 13 };
  };

  content.parts['PAL_australiaeast'] = function (C) {

    return { top: '#2a2a80', bot: '#5a3a9a', accent: '#ffc860', win: ['#ffe9a0', '#ff9a40', '#7fe8ff'] };
  };

  content.parts['WATER_australiaeast'] = function (C) {

    return ['#1a6aaa', '#061840', '#ffe070', '#7fe8ff'];
  };

  content.parts['BOATS_australiaeast'] = function (C) {

    return { hull: ['#1a8a4a', '#0a3a20'], stripe: '#ffd23f', cab: ['#fff4c0', '#d8a83a'], roof: '#1a8a4a', win: ['#bff0ff', '#ffe9a0'], logo: true, name: 'FERRY' };
  };

  content.parts['CARS_outback4x4'] = function (C) {
    const { outback4x4 } = C;

    return [62, 31, function (g) { g.save(); g.scale(62 / 88, 62 / 88); outback4x4(g); g.restore(); }];
  };
})();
