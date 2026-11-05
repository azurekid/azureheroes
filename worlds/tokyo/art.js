/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['tokyo'] = AH.Worlds['tokyo'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['japaneast'] = content;

  content.parts['commuterTrain'] = function (C) {

    return { body: '#c8d6db', stripe: '#ed8a24', top: '#f1f3eb', bottom: '#7b8b94', stripeY: 29, stripeH: 4, door: '#9baab0', label: 'GINZA LINE G01' };
  };

  content.parts['SKIES_japaneast'] = function (C) {

    return { stops: [[0, '#12062e'], [0.3, '#3a0a5a'], [0.55, '#9a1a5a'], [0.75, '#e83a4a'], [0.9, '#ff8a5a'], [1, '#ffc880']], sun: { x: 420, y: 140, r: 66, c: ['#ff9a80', '#ff2a3a', '#c0103a'] }, halo: ['rgba(255,80,90,0.55)', 'rgba(255,60,120,0.2)'], cl: ['rgba(110,30,120,0.55)', 'rgba(255,100,130,0.65)', 'rgba(255,190,160,0.5)'], hz: 'rgba(255,160,110,0.5)', stars: 120, seed: 11, stripes: false };
  };

  content.parts['PAL_japaneast'] = function (C) {

    return { top: '#34106a', bot: '#5a1a8a', accent: '#ff6a8a', win: ['#ffd0e0', '#ff7a9a', '#ffe9a0'] };
  };
})();
