/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['london'] = AH.Worlds['london'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['uksouth'] = content;

  world.rewards = {
    hair: ['sidepart', 'TAILORED PART', 'LONDON', 1],
    suit: { name: 'ROYAL GUARD', unlock: 1, suit: '#d0202a', suitD: '#6a0a10', suitM: '#a8141e', suitL: '#ff7a7a', cape: '#20202e', capeL: '#4a4a62', capeD: '#08080e', boots: '#08080e', bootL: '#3a3a4e', cuff: '#ffd84a' },
    outfit: ['FORMAL COAT', 'coat'],
    gear: ['watch', 'POCKET WATCH', 'LONDON', 1],
    classicHat: ['bowler', 'BOWLER HAT', 'LONDON, UK'],
    classicGear: ['scarf', 'FOOTBALL SCARF', 'LONDON, UK']
  };
})();
