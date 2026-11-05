/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['amsterdam'] = AH.Worlds['amsterdam'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['westeurope'] = content;

  world.rewards = {
    hair: ['canalbraid', 'CANAL BRAID', 'AMSTERDAM', 0],
    suit: { name: 'ORANJE', unlock: 0, suit: '#ff7a10', suitD: '#9a3a04', suitM: '#e05e08', suitL: '#ffc070', cape: '#1a3aa8', capeL: '#4a72ff', capeD: '#0a1650', boots: '#0a1650', bootL: '#3a5ad8', cuff: '#ffffff' },
    outfit: ['CANAL JACKET', 'jacket'],
    gear: ['tulip', 'TULIP PIN', 'AMSTERDAM', 0],
    classicHat: ['crown', 'ORANGE CROWN', "KING'S DAY, NL"],
    classicGear: ['clogs', 'WOODEN CLOGS', 'NETHERLANDS']
  };
})();
