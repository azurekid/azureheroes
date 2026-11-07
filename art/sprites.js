/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.sprites.130'] = function (C) {
    const { AMB_BIRDS, COINS, D, FIGHT_FRAMES, FIGHT_POSE, FLAT, HERO_DEF, HERO_FRAMES, HERO_GEAR, HERO_HAIR, HERO_HAIR_STYLES, HERO_HATS, HERO_REGIONAL_HAIR, HERO_SKIN, HERO_SUIT, MAP, MP, R, SC, billKeys, cargoBox, cloudCabinet, cloudDeck, defs, density, glow, hairUnlock, hero, lookOpen, metroBlock, metroDeck, obSize, reg, reg2, regHero, skinKeys, suitOpen, tubeBlock, wardrobeFor, wardrobeOpen } = C;

    Object.assign(C, { patchScaling });
    const sceneryKeys = {};

    const sceneryStars = C.sceneryRegistry('sceneryStars');
    const panoramaLandmarks = C.sceneryRegistry('panoramaLandmarks');
    const sceneryRoutes = C.sceneryRegistry('sceneryRoutes');
    const environments = C.sceneryRegistry('environments');
    const groundFaces = C.sceneryRegistry('groundFace');

    Object.keys(SC).forEach(function (r) {
        sceneryKeys[r] = Object.keys(SC[r]);
        Object.keys(SC[r]).forEach(function (k) { const d = SC[r][k]; reg2(k, d[0], d[1], function (g, w, h) { d[2](g, w, h, MP[r]); }, FLAT); });
      });

    reg('title_burst', 8, 8, function (g) { R(g, '#ffffff', 0, 0, 8, 8); }, true);

    [['coin0', '#ffb000'], ['coin1', '#ffb000'], ['coin2', '#ffb000'], ['coin3', '#ffb000'], ['mfa', '#27e0ff'], ['ring', '#ffb000'],
        ['blast', '#27e0ff'], ['laser_emit', '#ff2a4a'], ['portal', '#27e0ff']
      ].forEach(function (e) { defs[e[0]] = glow(defs[e[0]], e[1], 4); });

    let patched = false;

    function patchScaling() {
        if (patched) return;
        patched = true;
        const GO = Phaser.GameObjects;
        // TileSprites swap in their own texture key, so scale the tiling at creation instead
        const ts = GO.GameObjectFactory.prototype.tileSprite;
        GO.GameObjectFactory.prototype.tileSprite = function (x, y, w, h, key, frame) {
          const t = ts.call(this, x, y, w, h, key, frame);
          if (defs[key]) t.setTileScale(1 / D, 1 / D);
          return t;
        };
        [GO.Image, GO.Sprite].forEach(function (C) {
          const orig = C.prototype.setTexture;
          C.prototype.setTexture = function (key, frame) {
            orig.call(this, key, frame);
            if (!this._hr && defs[key]) {
              this._hr = true;
              if (this.setTileScale) this.setTileScale(1 / D, 1 / D);
              else this.setScale(this.scaleX / D, this.scaleY / D);
            }
            return this;
          };
        });
      }

    AH.Art = {
        keys: Object.keys(defs),
        textureKeys: Object.keys(defs),
        textureCanvas: function (key) { return defs[key]; },
        scenerySizes: Object.fromEntries(Object.values(SC).flatMap((pieces) => Object.entries(pieces).map(([key, value]) => [key, value.slice(0, 2)]))),
        fighter: { frames: FIGHT_FRAMES, poses: FIGHT_POSE, width: 64, height: 80 },
        MAP: MAP,
        D: D,
        skinKeys: skinKeys,
        obSize: obSize,
        sceneryKeys: sceneryKeys,
        sceneryStars: sceneryStars,
        sceneryRoutes: sceneryRoutes,
        environments: environments,
        groundFaces: groundFaces,
        panoramaLandmarks: panoramaLandmarks,
        billKeys: billKeys,
        buildCloudPlatform: function (scene, p) {
          const variant = Math.abs(Math.round(p.x / 100)) % 4;
          const key = 'cloud_platform_' + p.cloudKind + '_' + p.w + '_' + p.h + '_' + variant + (p.lowTunnel ? '_duct' : '');
          if (!scene.textures.exists(key)) {
            if (!defs[key]) reg2(key, p.w, p.h, function (g) {
              if (p.cloudKind === 'metro') {
                if (p.h <= 24) metroDeck(g, p.w, p.h, p.lowTunnel); else metroBlock(g, p.w, p.h, variant);
              } else if (p.cloudKind === 'tube') {
                tubeBlock(g, p.w, p.h, p.lowTunnel);
              } else if (p.h <= 24) {
                cloudDeck(g, p.w, p.h, p.cloudKind, p.lowTunnel);
              } else if (p.cloudKind === 'docker' || p.cloudKind === 'aks') {
                const rows = Math.max(1, Math.round(p.h / 48)), height = p.h / rows;
                for (let row = 0; row < rows; row++) {
                  cargoBox(g, 0, row * height, p.w, height, variant + row,
                    p.cloudKind === 'aks' ? 'AKS' : 'AZURE');
                }
              } else if (p.cloudKind === 'entra' || p.cloudKind === 'functions') {
                cloudCabinet(g, 0, 0, p.w, p.h, p.cloudKind);
              } else {
                cargoBox(g, 0, 0, p.w, p.h, variant, 'BUILD');
              }
            }, FLAT);
            scene.textures.addCanvas(key, defs[key]);
          }
          return key;
        },
        hero: {
          skins: HERO_SKIN.map((c) => c[1]), hairCols: HERO_HAIR.map((c) => c[1]), styles: HERO_HAIR_STYLES, hats: HERO_HATS, gear: HERO_GEAR,
          suits: HERO_SUIT.map((c) => c.suit), suitNames: HERO_SUIT.map((c) => c.name), suitUnlock: HERO_SUIT.map((c) => c.unlock), def: HERO_DEF,
          hairNames: Object.assign({ swoop: 'SWOOP', buzz: 'BUZZ CUT', afro: 'AFRO', long: 'LONG', pony: 'PONYTAIL', braids: 'BRAIDS', bob: 'BOB' }, Object.fromEntries(HERO_REGIONAL_HAIR.map((x) => [x[0], x[1]]))),
          hairUnlock: HERO_HAIR_STYLES.map(hairUnlock), gearUnlock: HERO_GEAR.map((gear) => {
            const item = AH.WorldOrder.flatMap((slug, i) => C.regionalItems(i)).find((x) => x.category === 'gear' && x.value === gear[0]);
            return item ? item.region : -1;
          }),
          wardrobeOpen: wardrobeOpen, wardrobeFor: wardrobeFor, regionalItems: C.regionalItems, lookOpen: lookOpen,
          wardrobeRegions: (category, value) => AH.WorldOrder.map((slug, i) => i)
            .filter(i => C.regionalItems(i).some(item => item.category === category && item.value === value)),
          hatUnlock: HERO_HATS.map((hat) => {
            const item = AH.WorldOrder.flatMap((slug, i) => C.regionalItems(i)).find((x) => x.category === 'hat' && x.value === hat[0]);
            return item ? item.region : -1;
          }),
          hackerSuit: HERO_SUIT.findIndex((suit) => suit.outfit === 'hacker'),
          suitOpen: suitOpen,
          // Regional suit indexes, retained for legacy callers.
          suitsFor: (i) => HERO_SUIT.map((c, k) => (c.unlock === i ? k : -1)).filter((k) => k >= 0)
        },
        // saved Hero Lab look, falling back to the classic hero / heroine presets; locked suits fall back to the default
        lookOf: function (data) {
          const L = data && data.look;
          const out = L && (L.body === 'm' || L.body === 'f') ? Object.assign({}, HERO_DEF[L.body], L) : Object.assign({}, HERO_DEF[data && data.hero === 'f' ? 'f' : 'm']);
          // older saves stored the hijab as a hairstyle; it is headwear now
          if (out.hair === 'hijab') { out.hair = HERO_DEF[out.body].hair; out.hat = 'hijab'; }
          if (!suitOpen(out.suit, data)) out.suit = HERO_DEF[out.body].suit;
          if (!wardrobeOpen('hair', out.hair, data)) out.hair = HERO_DEF[out.body].hair;
          if (!wardrobeOpen('gear', out.gear, data)) out.gear = HERO_DEF[out.body].gear;
          if (!wardrobeOpen('hat', out.hat, data)) out.hat = HERO_DEF[out.body].hat;
          return out;
        },
        buildGuide: function (scene, region, variant) {
          const index = AH.WorldOrder.findIndex((slug) => AH.Worlds[slug].world.region === region);
          if (index < 0) throw new Error('UNKNOWN GUIDE REGION: ' + region);
          const prefix = 'checkpoint_local_' + region + '_' + variant + '_', key = prefix + 'idle';
          if (!scene.textures.exists(key)) {
            const items = C.regionalItems(index), look = Object.assign({}, HERO_DEF[variant % 2 ? 'f' : 'm'], wardrobeFor(index), {
              hat: (items.find((x) => x.category === 'hat') || {}).value || 'none',
              skin: (index + variant) % HERO_SKIN.length, guide: true
            });
            try { regHero(prefix, look, ['idle']); } finally { C.applyLook(HERO_DEF.m); }
            scene.textures.addCanvas(key, defs[key]);
          }
          return key;
        },
        HD: 8,
        // high-density (HD x) portrait frame for Title / Hero Lab; not auto-scaled, so callers setScale(size / HD)
        buildHeroHD: function (scene, look, frame) {
          frame = frame || 'idle';
          const P = 'hd_' + [look.body, look.skin, look.hair, look.hairCol, look.suit, look.hat || 'none', look.gear || 'none'].join('_') + '_';
          if (!scene.textures.exists(P + frame)) {
            density.value = AH.Art.HD; density.hd = true;
            try { regHero(P, look, [frame]); } finally { density.value = D; density.hd = false; }
            scene.textures.addCanvas(P + frame, defs[P + frame]);
            delete defs[P + frame];
          }
          return P + frame;
        },
        // draws the hero frames for a look once and returns the texture prefix (frames: idle run0-3 jump attack shield fly)
        buildHero: function (scene, look) {
          const P = 'hl_' + [look.body, look.skin, look.hair, look.hairCol, look.suit, look.hat || 'none', look.gear || 'none'].join('_') + '_';
          if (!scene.textures.exists(P + 'idle')) {
            regHero(P, look);
            HERO_FRAMES.forEach(function (f) { if (!scene.textures.exists(P + f)) scene.textures.addCanvas(P + f, defs[P + f]); });
          }
          if (!scene.anims.exists(P + 'run')) scene.anims.create({ key: P + 'run', frames: [0, 1, 2, 3].map((i) => ({ key: P + 'run' + i })), frameRate: 12, repeat: -1 });
          return P;
        },
        generate: function (scene) {
          patchScaling();
          Object.keys(defs).forEach(function (k) {
            if (!scene.textures.exists(k)) scene.textures.addCanvas(k, defs[k]);
          });
          const a = scene.anims;
          const mk = (key, frames, rate) => {
            if (!a.exists(key)) a.create({ key, frames: frames.map((f) => ({ key: f })), frameRate: rate, repeat: -1 });
          };
          mk('coin_spin', ['coin0', 'coin1', 'coin2', 'coin3'], 8);
          mk('robot_walk', ['robot_0', 'robot_1'], 5);
          mk('hacker_walk', ['hacker_0', 'hacker_1'], 5);
          mk('detective_walk', ['detective_0', 'detective_1'], 5);
          mk('drone_fly', ['drone_0', 'drone_1'], 16);
          mk('spider_crawl', ['spider_0', 'spider_1'], 8);
          mk('phish_swim', ['phish_0', 'phish_1'], 6);
          mk('ram_run', ['ram_0', 'ram_1'], 8);
          mk('botnet_float', ['botnet_0', 'botnet_1'], 3);
          ['bug', 'image', 'rbac', 'endpoint', 'guest'].forEach((k) => mk(k + '_move', [k + '_0', k + '_1'], 6));
          skinKeys.forEach((k) => mk(k, [k + '_0', k + '_1'], k.slice(-5) === 'drone' ? 16 : k.slice(-6) === 'spider' ? 8 : 5));
          Object.keys(COINS).forEach((r) => mk('coin_' + r, [0, 1, 2, 3].map((i) => 'coin_' + r + i), 8));
          mk('hero_run', ['hero_run0', 'hero_run1', 'hero_run2', 'hero_run3'], 12);
          mk('bike_ride', ['bike_ride0', 'bike_ride1'], 10);
          mk('amb_heli', ['amb_heli_0', 'amb_heli_1'], 18);
          Object.keys(AMB_BIRDS).forEach((k) => mk('amb_bird_' + k, ['amb_bird_' + k + '_0', 'amb_bird_' + k + '_1'], 7));
          mk('hero_f_run', ['hero_f_run0', 'hero_f_run1', 'hero_f_run2', 'hero_f_run3'], 12);
        }
      };

    Object.assign(C, { sceneryKeys, sceneryStars, panoramaLandmarks, sceneryRoutes, patched });
  };

  const C = AH.ArtModules.context;
  AH.ArtModules.stages['art.core.0'](C);
  AH.ArtModules.stages['art.wardrobe.1'](C);
  AH.ArtModules.stages['art.hero.2'](C);
  AH.ArtModules.stages['art.enemies.3'](C);
  AH.ArtModules.stages['art.map.4'](C);
  AH.ArtModules.stages['art.guardian.5'](C);
  AH.ArtModules.stages['art.items.6'](C);
  AH.ArtModules.stages['art.tiles.7'](C);
  AH.ArtModules.stages['art.backgrounds.8'](C);
  AH.ArtModules.stages['art.landscape.9'](C);
  AH.ArtModules.stages['worlds.amsterdam.scenery.10'](C);
  AH.ArtModules.stages['worlds.london.scenery.11'](C);
  AH.ArtModules.stages['worlds.tokyo.scenery.12'](C);
  AH.ArtModules.stages['worlds.sydney.scenery.13'](C);
  AH.ArtModules.stages['worlds.rio.scenery.14'](C);
  AH.ArtModules.stages['worlds.virginia.scenery.15'](C);
  AH.ArtModules.stages['art.landscape.16'](C);
  AH.ArtModules.stages['worlds.rio.scenery.17'](C);
  AH.ArtModules.stages['art.landscape.18'](C);
  AH.ArtModules.stages['worlds.new-york.scenery.19'](C);
  AH.ArtModules.stages['art.landscape.20'](C);
  AH.ArtModules.stages['worlds.amsterdam.scenery.21'](C);
  AH.ArtModules.stages['worlds.london.scenery.22'](C);
  AH.ArtModules.stages['worlds.tokyo.scenery.23'](C);
  AH.ArtModules.stages['worlds.sydney.scenery.24'](C);
  AH.ArtModules.stages['worlds.rio.scenery.25'](C);
  AH.ArtModules.stages['worlds.new-york.scenery.26'](C);
  AH.ArtModules.stages['art.font.27'](C);
  AH.ArtModules.stages['art.skins.28'](C);
  AH.ArtModules.stages['worlds.amsterdam.sprites.29'](C);
  AH.ArtModules.stages['worlds.london.sprites.30'](C);
  AH.ArtModules.stages['worlds.sydney.sprites.31'](C);
  AH.ArtModules.stages['worlds.virginia.sprites.32'](C);
  AH.ArtModules.stages['worlds.amsterdam.sprites.33'](C);
  AH.ArtModules.stages['worlds.tokyo.sprites.34'](C);
  AH.ArtModules.stages['art.skins.35'](C);
  AH.ArtModules.stages['worlds.sydney.sprites.36'](C);
  AH.ArtModules.stages['worlds.rio.sprites.37'](C);
  AH.ArtModules.stages['worlds.virginia.sprites.38'](C);
  AH.ArtModules.stages['worlds.amsterdam.sprites.39'](C);
  AH.ArtModules.stages['worlds.london.sprites.40'](C);
  AH.ArtModules.stages['worlds.sydney.sprites.41'](C);
  AH.ArtModules.stages['art.skins.42'](C);
  AH.ArtModules.stages['art.fighter.43'](C);
  AH.ArtModules.stages['art.projectiles.44'](C);
  AH.ArtModules.stages['worlds.amsterdam.sprites.45'](C);
  AH.ArtModules.stages['worlds.london.sprites.46'](C);
  AH.ArtModules.stages['worlds.paris.sprites.47'](C);
  AH.ArtModules.stages['worlds.tokyo.sprites.48'](C);
  AH.ArtModules.stages['worlds.sydney.sprites.49'](C);
  AH.ArtModules.stages['worlds.venice.sprites.50'](C);
  AH.ArtModules.stages['worlds.rio.sprites.51'](C);
  AH.ArtModules.stages['worlds.mexico-city.sprites.52'](C);
  AH.ArtModules.stages['worlds.virginia.sprites.53'](C);
  AH.ArtModules.stages['worlds.new-york.sprites.54'](C);
  AH.ArtModules.stages['art.projectiles.55'](C);
  AH.ArtModules.stages['worlds.amsterdam.sprites.56'](C);
  AH.ArtModules.stages['worlds.london.sprites.57'](C);
  AH.ArtModules.stages['worlds.paris.sprites.58'](C);
  AH.ArtModules.stages['worlds.tokyo.sprites.59'](C);
  AH.ArtModules.stages['worlds.sydney.sprites.60'](C);
  AH.ArtModules.stages['worlds.venice.sprites.61'](C);
  AH.ArtModules.stages['worlds.rio.sprites.62'](C);
  AH.ArtModules.stages['worlds.mexico-city.sprites.63'](C);
  AH.ArtModules.stages['worlds.virginia.sprites.64'](C);
  AH.ArtModules.stages['worlds.new-york.sprites.65'](C);
  AH.ArtModules.stages['art.pickups.66'](C);
  AH.ArtModules.stages['art.street.67'](C);
  AH.ArtModules.stages['worlds.amsterdam.art.68'](C);
  AH.ArtModules.stages['worlds.new-york.art.69'](C);
  AH.ArtModules.stages['worlds.sydney.art.70'](C);
  AH.ArtModules.stages['art.obstacles.71'](C);
  AH.ArtModules.stages['worlds.amsterdam.art.72'](C);
  AH.ArtModules.stages['worlds.new-york.art.73'](C);
  AH.ArtModules.stages['art.bonus.74'](C);
  AH.ArtModules.stages['worlds.london.art.75'](C);
  AH.ArtModules.stages['art.bonus.76'](C);
  AH.ArtModules.stages['art.challenges.77'](C);
  AH.ArtModules.stages['worlds.paris.art.78'](C);
  AH.ArtModules.stages['worlds.london.art.79'](C);
  AH.ArtModules.stages['art.branding.80'](C);
  AH.ArtModules.stages['art.scenery.81'](C);
  AH.ArtModules.stages['worlds.new-york.scenery.82'](C);
  AH.ArtModules.stages['worlds.amsterdam.scenery.83'](C);
  AH.ArtModules.stages['art.scenery.84'](C);
  AH.ArtModules.stages['worlds.amsterdam.scenery.85'](C);
  AH.ArtModules.stages['art.ambient.86'](C);
  AH.ArtModules.stages['worlds.redmond.transit'](C);
  AH.ArtModules.stages['worlds.amsterdam.scenery.87'](C);
  AH.ArtModules.stages['worlds.tokyo.scenery.88'](C);
  AH.ArtModules.stages['worlds.new-york.scenery.89'](C);
  AH.ArtModules.stages['worlds.new-york.scenery.90'](C);
  AH.ArtModules.stages['art.ambient.90'](C);
  AH.ArtModules.stages['worlds.venice.art.91'](C);
  AH.ArtModules.stages['worlds.venice.scenery.92'](C);
  AH.ArtModules.stages['worlds.venice.art.93'](C);
  AH.ArtModules.stages['worlds.venice.sprites.94'](C);
  AH.ArtModules.stages['worlds.venice.art.95'](C);
  AH.ArtModules.stages['worlds.venice.sprites.96'](C);
  AH.ArtModules.stages['worlds.venice.art.97'](C);
  AH.ArtModules.stages['worlds.venice.scenery.98'](C);
  AH.ArtModules.stages['worlds.redmond.art.99'](C);
  AH.ArtModules.stages['worlds.redmond.sprites.100'](C);
  AH.ArtModules.stages['worlds.redmond.art.101'](C);
  AH.ArtModules.stages['worlds.redmond.sprites.102'](C);
  AH.ArtModules.stages['worlds.redmond.art.103'](C);
  AH.ArtModules.stages['worlds.redmond.scenery.104'](C);
  AH.ArtModules.stages['worlds.mexico-city.art.105'](C);
  AH.ArtModules.stages['worlds.mexico-city.sprites.106'](C);
  AH.ArtModules.stages['worlds.mexico-city.art.107'](C);
  AH.ArtModules.stages['worlds.mexico-city.sprites.108'](C);
  AH.ArtModules.stages['worlds.mexico-city.art.109'](C);
  AH.ArtModules.stages['worlds.mexico-city.sprites.110'](C);
  AH.ArtModules.stages['worlds.mexico-city.art.111'](C);
  AH.ArtModules.stages['worlds.mexico-city.scenery.112'](C);
  AH.ArtModules.stages['worlds.paris.art.113'](C);
  AH.ArtModules.stages['worlds.paris.scenery.114'](C);
  AH.ArtModules.stages['worlds.paris.art.115'](C);
  AH.ArtModules.stages['worlds.paris.sprites.116'](C);
  AH.ArtModules.stages['worlds.paris.art.117'](C);
  AH.ArtModules.stages['worlds.paris.sprites.118'](C);
  AH.ArtModules.stages['worlds.paris.art.119'](C);
  AH.ArtModules.stages['worlds.paris.scenery.120'](C);
  AH.ArtModules.stages['worlds.amsterdam.scenery.121'](C);
  AH.ArtModules.stages['worlds.london.scenery.122'](C);
  AH.ArtModules.stages['worlds.tokyo.scenery.123'](C);
  AH.ArtModules.stages['worlds.sydney.scenery.124'](C);
  AH.ArtModules.stages['worlds.rio.scenery.125'](C);
  AH.ArtModules.stages['worlds.paris.scenery.126'](C);
  AH.ArtModules.stages['worlds.amsterdam.scenery.127'](C);
  AH.ArtModules.stages['worlds.tokyo.scenery.128'](C);
  AH.ArtModules.stages['worlds.sydney.scenery.129'](C);
  AH.ArtModules.stages['art.missions'](C);
  AH.ArtModules.stages['art.sprites.130'](C);
})();
