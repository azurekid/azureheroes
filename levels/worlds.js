(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const G = AH.LevelGenerator;
  const WORLDS = AH.WorldOrder.map((slug) => AH.Worlds[slug].world);
  const BUILD = { run: G.makeRun, fly: G.makeFly };
  const Levels = (AH.Levels = {});
  Levels.worlds = WORLDS;
  Levels.ids = WORLDS.map((world) => world.id);
  Levels.meta = function (id) { return WORLDS.filter((world) => world.id === id)[0]; };
  Levels.make = function (id) {
    const m = Levels.meta(id);
    const body = m.theme === 'rack' ? G.makeDataCenter(m) : BUILD[m.mode](m);
    const L = Object.assign({
      id: m.id, name: m.name, region: m.region, regionName: m.regionName, city: m.city, landmarks: m.landmarks, hint: m.hint,
      height: 360, mode: m.mode, theme: m.theme, tint: m.tint, ground: m.ground || null, water: !!m.water, rail: m.rail || null, ambient: m.ambient || null, mfaTokens: []
    }, body);
    if (L.bonus && L.bonus.enemies) L.enemies.push(...L.bonus.enemies);
    if (m.opt.skyClimb) G.addSkyRoute(L);
    const detective = L.enemies.find(enemy => enemy.type === 'hacker' && !enemy.skyCarrier);
    if (detective) detective.appearance = 'detective';
    L.enemies.forEach((enemy) => { enemy.skin = m.region; });
    L.time = m.mode === 'fly' ? Math.round(L.width / L.scroll + 90) : Math.round(L.width / 1000 * (m.theme === 'rack' ? 30 : 26) + 110);
    G.addMission(L);
    L.time += m.mode === 'fly' ? 45 : 90;
    if (L.skyRoute) L.time += 45;
    return L;
  };
})();
