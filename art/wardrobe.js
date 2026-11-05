/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.wardrobe.1'] = function (C) {

    const HERO_SKIN = [
        ['#ffe4cc', '#f6c6a0', '#c98e6a'], ['#ffd2ad', '#eaa77c', '#b8764e'], ['#f8d09a', '#d8a06a', '#9c6a3a'],
        ['#dca476', '#b47a4a', '#7a4c2a'], ['#b47c52', '#86522e', '#52301a'], ['#8e5c3c', '#603b24', '#3a2014']
      ];

    const HERO_HAIR = [
        ['#4a4a7a', '#1a1840', '#07072a'], ['#a8744a', '#5e3820', '#2a160c'], ['#ee8a52', '#a8381e', '#4e1208'],
        ['#fff4b0', '#e8c060', '#9a7224'], ['#ffb0dc', '#d0609a', '#5a1f4f'], ['#ffffff', '#c4c8e8', '#6a6a9a']
      ];

    const HERO_HAIR_STYLES = ['swoop', 'buzz', 'afro', 'long', 'pony', 'braids', 'bob'];

    const HERO_REGIONAL_HAIR = [
    AH.Worlds['amsterdam'].rewards.hair,
    AH.Worlds['london'].rewards.hair,
    AH.Worlds['paris'].rewards.hair,
    AH.Worlds['tokyo'].rewards.hair,
    AH.Worlds['sydney'].rewards.hair,
    AH.Worlds['venice'].rewards.hair,
    AH.Worlds['rio'].rewards.hair,
    AH.Worlds['mexico-city'].rewards.hair,
    AH.Worlds['redmond'].rewards.hair,
    AH.Worlds['virginia'].rewards.hair,
    AH.Worlds['new-york'].rewards.hair
    ];

    HERO_HAIR_STYLES.push(...HERO_REGIONAL_HAIR.map((x) => x[0]));

    const HERO_SUIT = [
    { suit: '#2f6bff', suitD: '#16339e', suitM: '#2455e0', suitL: '#6fb4ff', cape: '#2447c9', capeL: '#4f82ff', capeD: '#101e70', boots: '#0f1c66', bootL: '#3a58d8', cuff: '#8fd6ff' },
    { suit: '#ff4fa0', suitD: '#9a1458', suitM: '#e0367f', suitL: '#ffa6d2', cape: '#c8237a', capeL: '#ff6ab8', capeD: '#5e0838', boots: '#5e0838', bootL: '#e04898', cuff: '#ffc8e6' },
    { suit: '#8a4aff', suitD: '#3e168e', suitM: '#6a32e0', suitL: '#c4a0ff', cape: '#5a28c0', capeL: '#9a6aff', capeD: '#260a60', boots: '#260a60', bootL: '#7a48e0', cuff: '#d8c4ff' },
    { suit: '#14b8a8', suitD: '#06564e', suitM: '#0e8e82', suitL: '#7ff0e0', cape: '#0a7a8a', capeL: '#2ac8d8', capeD: '#04363e', boots: '#04363e', bootL: '#1aa0a0', cuff: '#b8fff4' },
    { suit: '#ffb020', suitD: '#9a5a08', suitM: '#e08a10', suitL: '#ffe08a', cape: '#d0401a', capeL: '#ff7a3a', capeD: '#5e1404', boots: '#5e1404', bootL: '#d8601a', cuff: '#fff0b8' },
    AH.Worlds['amsterdam'].rewards.suit,
    AH.Worlds['london'].rewards.suit,
    AH.Worlds['paris'].rewards.suit,
    AH.Worlds['tokyo'].rewards.suit,
    AH.Worlds['sydney'].rewards.suit,
    AH.Worlds['venice'].rewards.suit,
    AH.Worlds['rio'].rewards.suit,
    AH.Worlds['mexico-city'].rewards.suit,
    AH.Worlds['redmond'].rewards.suit,
    AH.Worlds['virginia'].rewards.suit,
    { name: 'COWBOY', unlock: -1, outfit: 'cowboy', suit: '#3a6ab0', suitD: '#1a3460', suitM: '#2a5090', suitL: '#8ab0e0', cape: '#8a4a1c', capeL: '#c07a3a', capeD: '#4a2208', boots: '#5a2e10', bootL: '#a0602a', cuff: '#f0d8a0' },
    { name: 'INDIA KURTA', unlock: -1, outfit: 'kurta', suit: '#f4ead2', suitD: '#a8946a', suitM: '#d8c8a0', suitL: '#ffffff', cape: '#8a1a3a', capeL: '#c8406a', capeD: '#4a0820', boots: '#5a2a10', bootL: '#a0602a', cuff: '#e8b030' },
    { name: 'CLOUD HACKER', unlock: -1, outfit: 'hacker', suit: '#190d20', suitD: '#160d1b', suitM: '#3d2035', suitL: '#704052', cape: '#713449', capeL: '#d47782', capeD: '#240e1e', boots: '#160d1b', bootL: '#3d2035', cuff: '#321321' },
    AH.Worlds['new-york'].rewards.suit
    ];

    const GOLD_SUIT = { name: 'GOLDEN HERO', unlock: -1, suit: '#ffc828', suitD: '#8a5204', suitM: '#e09a10', suitL: '#fff3a8', cape: '#ffd848', capeL: '#fffac8', capeD: '#a86808', boots: '#7a4804', bootL: '#ffd848', cuff: '#ffffff' };

    const SUIT_BASE = ['AZURE', 'ROSE', 'VIOLET', 'TEAL', 'SUNSET'];

    HERO_SUIT.forEach((c, i) => { if (!c.name) { c.name = SUIT_BASE[i]; c.unlock = -1; } });

    const HERO_OUTFITS = [
    AH.Worlds['amsterdam'].rewards.outfit,
    AH.Worlds['london'].rewards.outfit,
    AH.Worlds['paris'].rewards.outfit,
    AH.Worlds['tokyo'].rewards.outfit,
    AH.Worlds['sydney'].rewards.outfit,
    AH.Worlds['venice'].rewards.outfit,
    AH.Worlds['rio'].rewards.outfit,
    AH.Worlds['mexico-city'].rewards.outfit,
    AH.Worlds['redmond'].rewards.outfit,
    AH.Worlds['virginia'].rewards.outfit
    ];

    HERO_OUTFITS.forEach((x, i) => { HERO_SUIT[i + 5].name = x[0]; HERO_SUIT[i + 5].outfit = x[1]; });

    const suitOpen = (i, unlocked) => !!HERO_SUIT[i] && (HERO_SUIT[i].unlock < 0 || (unlocked || 1) >= HERO_SUIT[i].unlock + 2);

    const HERO_HATS = [
    ['none', 'NONE', 'NO HAT'],
    ['cowboy', 'COWBOY HAT', 'TEXAS, USA'],
    AH.Worlds['mexico-city'].rewards.classicHat,
    AH.Worlds['london'].rewards.classicHat,
    AH.Worlds['paris'].rewards.classicHat,
    AH.Worlds['amsterdam'].rewards.classicHat,
    AH.Worlds['tokyo'].rewards.classicHat,
    AH.Worlds['sydney'].rewards.classicHat,
    AH.Worlds['venice'].rewards.classicHat,
    AH.Worlds['rio'].rewards.classicHat,
    AH.Worlds['redmond'].rewards.classicHat,
    AH.Worlds['virginia'].rewards.classicHat,
    ['hijab', 'HIJAB', 'WORLDWIDE']
    ];

    const HERO_GEAR = [
    ['none', 'NONE', 'NO EXTRA'],
    AH.Worlds['amsterdam'].rewards.classicGear,
    AH.Worlds['london'].rewards.classicGear,
    AH.Worlds['mexico-city'].rewards.classicGear,
    AH.Worlds['rio'].rewards.classicGear,
    ['bandana', 'BANDANA', 'TEXAS, USA'],
    AH.Worlds['amsterdam'].rewards.gear,
    AH.Worlds['london'].rewards.gear,
    AH.Worlds['paris'].rewards.gear,
    AH.Worlds['tokyo'].rewards.gear,
    AH.Worlds['sydney'].rewards.gear,
    AH.Worlds['venice'].rewards.gear,
    AH.Worlds['rio'].rewards.gear,
    AH.Worlds['mexico-city'].rewards.gear,
    AH.Worlds['redmond'].rewards.gear,
    AH.Worlds['virginia'].rewards.gear,
    AH.Worlds['new-york'].rewards.gear
    ];

    const hairUnlock = (key) => { const x = HERO_REGIONAL_HAIR.find((x) => x[0] === key); return x ? x[3] : -1; };

    const wardrobeOpen = (category, value, unlocked) => {
        if (category === 'suit') return suitOpen(value, unlocked);
        if (category === 'hair') return HERO_HAIR_STYLES.includes(value) && (hairUnlock(value) < 0 || (unlocked || 1) >= hairUnlock(value) + 2);
        const list = category === 'gear' ? HERO_GEAR : category === 'hat' ? HERO_HATS : [];
        const item = list.find((x) => x[0] === value);
        return !!item && (item[3] === undefined || (unlocked || 1) >= item[3] + 2);
      };

    const wardrobeFor = (i) => ({
        suit: HERO_SUIT.findIndex((x) => x.unlock === i),
        hair: (HERO_REGIONAL_HAIR.find((x) => x[3] === i) || [null])[0],
        gear: (HERO_GEAR.find((x) => x[3] === i) || [null])[0]
      });

    const lookOpen = (look, unlocked) => ['suit', 'hair', 'hat', 'gear'].every((k) => wardrobeOpen(k, look[k], unlocked));

    const HERO_DEF = { m: { body: 'm', skin: 1, hair: 'swoop', hairCol: 0, suit: 0, hat: 'none', gear: 'none' }, f: { body: 'f', skin: 1, hair: 'long', hairCol: 4, suit: 1, hat: 'none', gear: 'none' } };

    Object.assign(C, { HERO_SKIN, HERO_HAIR, HERO_HAIR_STYLES, HERO_REGIONAL_HAIR, HERO_SUIT, GOLD_SUIT, SUIT_BASE, HERO_OUTFITS, suitOpen, HERO_HATS, HERO_GEAR, hairUnlock, wardrobeOpen, wardrobeFor, lookOpen, HERO_DEF });
  };
})();
