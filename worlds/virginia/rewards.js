/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['virginia'] = AH.Worlds['virginia'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['eastus'] = content;

  world.rewards = {
    hair: ['coils', 'CROWN COILS', 'VIRGINIA', 9],
    suit: { name: 'GOLD DEFENDER', unlock: 9, suit: '#e8ecf8', suitD: '#7a80a8', suitM: '#b8c0dc', suitL: '#ffffff', cape: '#e0a010', capeL: '#ffe070', capeD: '#7a4a04', boots: '#3a3a6a', bootL: '#8a8ac8', cuff: '#ffd84a' },
    outfit: ['TRAIL COAT', 'trail'],
    gear: ['compass', 'TRAIL COMPASS', 'VIRGINIA', 9],
    classicHat: ['tricorn', 'TRICORN', 'VIRGINIA, USA']
  };
})();
