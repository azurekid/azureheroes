/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['paris'] = AH.Worlds['paris'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['francecentral'] = content;

  world.rewards = {
    hair: ['waves', 'SEINE WAVES', 'PARIS', 2],
    suit: { name: 'TRICOLORE', unlock: 2, suit: '#2448c0', suitD: '#0e1a60', suitM: '#1a34a0', suitL: '#7aa0ff', cape: '#e02030', capeL: '#ff6a6a', capeD: '#6a0810', boots: '#0e1a60', bootL: '#3a5ad8', cuff: '#ffffff' },
    outfit: ['BRETON TOP', 'breton'],
    gear: ['neckerchief', 'SILK NECKERCHIEF', 'PARIS', 2],
    classicHat: ['beret', 'BERET', 'PARIS, FRANCE']
  };
})();
