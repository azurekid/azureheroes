/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['rio'] = AH.Worlds['rio'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['brazilsouth'] = content;
  content.parts.foreground_brazilsouth = () => ({
    shape: 'flat', detail: 'palm', roof: '#3d3b55', wall: '#886876',
    light: '#d4ba8f', accent: '#839b79'
  });
  content.parts.graffiti_brazilsouth = () => ({
    tags: ['SALVE RIO', 'ARTE NA RUA', 'JUNTOS SOMOS MAIS'], paint: '#c4ec7b', accent: '#ffbf72'
  });

  content.parts['SKIES_brazilsouth'] = function (C) {

    return { stops: [[0, '#1a0a40'], [0.32, '#5a1a8a'], [0.55, '#c02a8a'], [0.72, '#ff6a50'], [0.88, '#ffc030'], [1, '#d8ff70']], sun: { x: 420, y: 222, r: 70, c: ['#fffaa0', '#ffd030', '#ff8a30'] }, halo: ['rgba(255,240,120,0.6)', 'rgba(255,120,60,0.2)'], cl: ['rgba(130,40,150,0.5)', 'rgba(255,110,150,0.65)', 'rgba(255,230,120,0.5)'], hz: 'rgba(230,255,120,0.5)', stars: 90, seed: 17 };
  };

  content.parts['PAL_brazilsouth'] = function (C) {

    return { top: '#3a1a7a', bot: '#6a2a8a', accent: '#c8ff70', win: ['#ffe14a', '#ff7ad9', '#4dff7a'] };
  };
})();
