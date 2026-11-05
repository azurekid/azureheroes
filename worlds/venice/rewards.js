/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['venice'] = AH.Worlds['venice'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['italynorth'] = content;

  world.rewards = {
    hair: ['swept', 'LAGOON SWEEP', 'VENICE', 5],
    suit: { name: 'CARNEVALE', unlock: 5, suit: '#e0a820', suitD: '#7a4a04', suitM: '#c0860c', suitL: '#fff0a0', cape: '#6a1a9a', capeL: '#a85aff', capeD: '#2a0644', boots: '#2a0644', bootL: '#8a3ad8', cuff: '#ffffff' },
    outfit: ['GONDOLIER', 'gondolier'],
    gear: ['ribbon', 'LAGOON RIBBON', 'VENICE', 5],
    classicHat: ['boater', 'GONDOLIER HAT', 'VENICE, ITALY']
  };
})();
