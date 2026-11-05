/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['mexico-city'] = AH.Worlds['mexico-city'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['mexicocentral'] = content;

  world.rewards = {
    hair: ['ribbonbraid', 'RIBBON BRAID', 'MEXICO CITY', 7],
    suit: { name: 'LUCHADOR', unlock: 7, suit: '#d81a7a', suitD: '#6a0636', suitM: '#a8105c', suitL: '#ff8ac8', cape: '#ffc020', capeL: '#fff07a', capeD: '#8a5a04', boots: '#14142a', bootL: '#4a4a7a', cuff: '#2ae0a0' },
    outfit: ['CHARRO JACKET', 'charro'],
    gear: ['silverbow', 'SILVER BOW', 'MEXICO CITY', 7],
    classicHat: ['sombrero', 'SOMBRERO', 'MEXICO'],
    classicGear: ['serape', 'SERAPE', 'MEXICO']
  };
})();
