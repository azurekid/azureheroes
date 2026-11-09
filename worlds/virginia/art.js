/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['virginia'] = AH.Worlds['virginia'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['eastus'] = content;
  content.parts.foreground_eastus = () => ({
    shape: 'rack', detail: 'cable', roof: '#293149', wall: '#53566e',
    light: '#9fb2c7', accent: '#7f9fba'
  });
  content.parts.graffiti_eastus = () => ({
    tags: ['VIRGINIA CLOUD', 'CREATE CONNECT', 'BUILD THE FUTURE'], paint: '#9bbdf5', accent: '#ef9acb'
  });

  content.parts['SKIES_eastus'] = function (C) {

    return { stops: [[0, '#05051c'], [0.4, '#14104a'], [0.7, '#2c1a7a'], [1, '#5a2aa0']], sun: { x: 500, y: 92, r: 34, c: ['#ffffff', '#d8e0ff', '#a0b0f0'] }, halo: ['rgba(160,190,255,0.5)', 'rgba(120,120,255,0.15)'], cl: ['rgba(40,40,120,0.55)', 'rgba(140,120,255,0.5)', 'rgba(180,200,255,0.4)'], hz: 'rgba(160,120,255,0.45)', stars: 170, seed: 19, stripes: false };
  };

  content.parts['PAL_eastus'] = function (C) {

    return { top: '#2a2488', bot: '#4a3aa8', accent: '#8ab4ff', win: ['#ffe9a0', '#9ad8ff', '#ff9aff'] };
  };

  content.parts['CARS_pickup'] = function (C) {
    const { carBody, wheels } = C;

    return [56, 24, function (g, w, h) { carBody(g, w, h, '#c8202a', '#5a0a14', 8, 26, 4); g.fillStyle = '#5a0a14'; g.fillRect(28, h - 15, 26, 3); g.fillStyle = '#d8d8e8'; g.fillRect(0, h - 7, 6, 2); g.fillRect(w - 5, h - 7, 5, 2); wheels(g, [11, 44], h - 4.4, 5); }];
  };

  content.parts['CARS_muscle'] = function (C) {
    const { carBody, wheels } = C;

    return [50, 18, function (g, w, h) { carBody(g, w, h, '#2a4aff', '#0a1460', 16, 34, 4); g.fillStyle = '#ffffff'; g.fillRect(2, h - 11, w - 4, 1.2); g.fillRect(2, h - 9, w - 4, 1.2); wheels(g, [10, 40], h - 4, 4.2); }];
  };

  content.parts['CARS_schoolbus'] = function (C) {
    const { ell, lg, lit, rrect, txt, wheels } = C;

    return [78, 30, function (g, w, h) { rrect(g, 1, 2, w - 2, h - 8, 3, lg(g, 0, 2, 0, h - 6, [[0, '#ffe14a'], [1, '#d88a00']])); for (let x = 12; x < w - 6; x += 9) { g.fillStyle = '#14082a'; g.fillRect(x, 5, 7, 7); lit(g, x + 0.5, 5.5, 6, 6, '#c8e8ff'); } g.fillStyle = '#14082a'; g.fillRect(1, 15, w - 2, 1); g.fillRect(2, 4, 6, 12); txt(g, 'SCHOOL BUS', 20, 17, 0.5, '#14082a'); ell(g, 2, 19, 1.2, 1.2, '#fff6c0'); wheels(g, [14, 62], h - 5, 5); }];
  };
})();
