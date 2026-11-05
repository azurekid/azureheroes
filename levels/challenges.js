(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const G = (AH.LevelGenerator = AH.LevelGenerator || {});
  const { ri, pick, clamp, shuffle } = G;

  const BONUS = { cloud: ['grass', 'cloud_plat'], retro: ['retro', 'retro_plat'], xbox: ['xbox', 'xbox_plat'] };
  const REGIONAL_BONUS = {};
  (AH.WorldOrder || []).forEach((slug) => {
    const room = AH.Worlds[slug].bonus;
    if (room) {
      BONUS[room.theme] = [room.floor, room.platform];
      REGIONAL_BONUS[room.theme] = room;
    }
  });
  function bonusWidth(theme) { return REGIONAL_BONUS[theme] ? REGIONAL_BONUS[theme].width : 640; }
  function makeBonus(x, theme) {
    const T = BONUS[theme] ? theme : 'cloud';
    const regional = REGIONAL_BONUS[T], width = bonusWidth(T);
    const clouds = [], coins = [];
    let cx = x + 90;
    for (let k = 0; k < (regional ? 8 : 4); k++) {
      const cy = ri(170, 225) - (k % 2) * 40;
      clouds.push({ x: cx, y: cy, w: 80, h: 16, cloud: BONUS[T][1] });
      for (let c = 0; c < 3; c++) coins.push({ x: cx + 16 + c * 24, y: cy - 24 });
      cx += ri(110, 130);
    }
    for (let c = 0; c < 14; c++) coins.push({ x: x + 60 + c * (regional ? 80 : 36), y: 300 - 30 - Math.round(Math.sin(c / 13 * Math.PI) * 50) });
    const room = {
      x: x, w: width, theme: T, floor: { x: x, y: 300, w: width, h: 100, bliss: BONUS[T][0] }, clouds: clouds, coins: coins,
      token: { x: clouds[2].x + 40, y: clouds[2].y - 60 }, power: { kind: pick(['copilot', 'powerbi', 'defender']), x: clouds[1].x + 40, y: clouds[1].y - 50 },
      exit: { x: x + width - 50, y: 300 }
    };
    if (regional) {
      room.enemies = regional.threats.map((enemy) => ({ ...enemy, x: x + enemy.x }));
      room.presentation = { title: regional.title, y: regional.y, shadow: regional.shadow,
        sub: regional.sub, subShadow: regional.subShadow, ach: regional.ach };
      room.music = regional.music;
    }
    return room;
  }

  const CHALLENGES = {
    pipelines: { name: 'AZURE PIPELINES', hint: 'FIX BUGS. TEST BEFORE YOU DEPLOY.', stages: ['BUILD', 'TEST', 'SCAN', 'APPROVE', 'DEPLOY'], tips: ['COMPILE CLEAN', 'CATCH PIPELINE BUGS', 'DEFENDER FOR CLOUD', 'REVIEW PERMISSIONS', 'SHIP WITH AZURE'], threats: ['bug', 'bug', 'image', 'rbac', 'endpoint'] },
    aks: { name: 'AKS CONTAINER CLUSTER', hint: 'CLIMB PODS AND SECURE THE CLUSTER.', stages: ['NODE POOL', 'POD HOP', 'RBAC', 'INGRESS', 'HEALTH CHECK'], tips: ['SCALE WITH AKS', 'ISOLATE WORKLOADS', 'LEAST PRIVILEGE', 'USE PRIVATE LINK', 'AZURE MONITOR'], threats: ['image', 'bug', 'rbac', 'endpoint', 'guest'] },
    actions: { name: 'GITHUB ACTIONS', hint: 'RACE RUNNERS. REVIEW GUEST ACCESS.', stages: ['CHECKOUT', 'RUNNER', 'UNIT TEST', 'IDENTITY', 'RELEASE'], tips: ['REVIEW YOUR CODE', 'HOSTED RUNNERS', 'FIX FAILING TESTS', 'ENTRA ACCESS REVIEWS', 'DEPLOY TO AZURE'], threats: ['guest', 'bug', 'bug', 'rbac', 'endpoint'] },
    docker: { name: 'DOCKER IMAGE DOCK', hint: 'CLIMB CONTAINERS. PATCH UNSAFE IMAGES.', stages: ['DOCKERFILE', 'BUILD IMAGE', 'SCAN IMAGE', 'REGISTRY', 'CONTAINER APPS'], tips: ['SMALL TRUSTED BASE', 'REBUILD AND PATCH', 'DEFENDER FOR CLOUD', 'AZURE CONTAINER REGISTRY', 'RUN ON AZURE'], threats: ['image', 'bug', 'image', 'endpoint', 'rbac'] },
    entra: { name: 'ENTRA ACCESS VAULT', hint: 'VERIFY IDENTITIES. GRANT LEAST PRIVILEGE.', stages: ['SIGN IN', 'MFA', 'ACCESS POLICY', 'ROLE REVIEW', 'GUEST CLEANUP'], tips: ['VERIFY EVERY REQUEST', 'USE STRONG MFA', 'CONDITIONAL ACCESS', 'LEAST PRIVILEGE', 'REVIEW STALE GUESTS'], threats: ['guest', 'phish', 'endpoint', 'rbac', 'guest'] },
    functions: { name: 'AZURE FUNCTIONS REACTOR', hint: 'HANDLE EVENTS. SECURE EVERY TRIGGER.', stages: ['TRIGGER', 'BINDING', 'EXECUTE', 'RETRY', 'OBSERVE'], tips: ['VALIDATE INPUT EVENTS', 'USE MANAGED IDENTITY', 'KEEP FUNCTIONS SMALL', 'MAKE RETRIES SAFE', 'AZURE MONITOR'], threats: ['endpoint', 'rbac', 'bug', 'image', 'bug'] }
  };
  (AH.WorldOrder || []).forEach((slug) => {
    const city = AH.Worlds[slug];
    if (city && city.challenges) Object.assign(CHALLENGES, city.challenges);
  });
  function makePipeZone(x0, theme) {
    const C = CHALLENGES[theme], F = 300;
    const widths = Array.from({ length: 5 }, () => ri(560, 660));
    const W = widths.reduce((a, b) => a + b, 400);
    const platforms = [{ x: x0, y: F, w: W, h: 100, pipeFloor: true, cloudKind: theme },
      { x: x0, y: -60, w: W, h: 90, pipeFloor: true, ceil: true }];
    const coins = [], enemies = [], lasers = [], stages = [], powerups = [];
    const layouts = shuffle(['steps', 'catwalk', 'duct', 'split', 'security', 'arena', 'switchback']).slice(0, 5);
    // Keep a duck/roof choice without turning every educational bay into a tunnel.
    if (!layouts.includes('duct')) layouts[ri(0, 4)] = 'duct';
    const lessons = shuffle(C.stages.map((name, i) => ({ name, tip: C.tips[i], threat: C.threats[i] })));
    let x = x0 + 200, token;
    lessons.forEach((lesson, i) => {
      const w = widths[i], layout = layouts[i], start = platforms.length;
      const add = (dx, y, pw, h, flags) => platforms.push(Object.assign({ x: x + dx, y, w: pw, h, cloudKind: theme }, flags));
      const groundEnemy = (dx, type = lesson.threat) => enemies.push({ type, x: x + dx, y: F, range: type === 'endpoint' ? 0 : 20 });
      stages.push({ x, name: lesson.name, tip: lesson.tip, layout });
      if (layout === 'steps') {
        add(60, 252, 70, 48); add(130, 204, 110, 96); add(240, 252, 70, 48);
        groundEnemy(370); groundEnemy(w - 60, 'image');
      } else if (layout === 'catwalk') {
        add(50, 220, 100, 14); add(200, 158, 160, 14); add(w - 140, 220, 90, 14);
        groundEnemy(180); groundEnemy(w - 60, 'rbac');
      } else if (layout === 'duct') {
        add(180, 254, ri(140, 180), 20, { lowTunnel: true });
        for (let c = 0; c < 4; c++) coins.push({ x: x + 192 + c * 36, y: 289 });
        groundEnemy(90); groundEnemy(w - 80, 'guest');
      } else if (layout === 'split') {
        add(40, 240, 100, 14); add(180, 180, 110, 14);
        add(330, 220, 90, 14); add(w - 110, 150, 70, 14);
        groundEnemy(250); groundEnemy(w - 60, 'bug');
      } else if (layout === 'security') {
        add(60, 228, 100, 14); add(320, 164, 100, 14);
        [240, w - 100].forEach((dx, j) => lasers.push({ x: x + dx, y: F - 84 + j * 24, w: 6, h: 84 - j * 24, on: ri(900, 1200), off: ri(1400, 1800), phase: ri(0, 1800) }));
        groundEnemy(190); groundEnemy(w - 45, 'endpoint');
      } else if (layout === 'arena') {
        add(60, 246, 70, 54); add(210, 180, 130, 14); add(w - 150, 246, 70, 54);
        groundEnemy(170); groundEnemy(w - 200, 'image');
        enemies.push({ type: 'endpoint', x: x + 275, y: 180, range: 0 });
      } else {
        add(60, 240, 90, 14); add(190, 180, 90, 14); add(320, 126, 100, 14);
        groundEnemy(160); groundEnemy(w - 65, 'rbac');
      }
      const route = platforms.slice(start);
      route.forEach((p) => {
        for (let c = 0; c < 3; c++) coins.push({ x: p.x + p.w * (c + 1) / 4, y: p.y - 24 });
      });
      for (let c = 0; c < 3; c++) {
        const cx = x + w - 110 + c * 28;
        const cy = Math.min(270, ...route.filter((p) => cx + 8 > p.x && cx - 8 < p.x + p.w).map((p) => p.y - 24));
        coins.push({ x: cx, y: cy });
      }
      const reward = route.reduce((a, b) => a.y < b.y ? a : b);
      if (i === 2) token = { x: reward.x + reward.w / 2, y: reward.y - 26 };
      if (i !== 2) powerups.push({ kind: ['spread', 'defender', '', 'pierce', 'teams'][i], x: reward.x + reward.w / 2, y: reward.y - 26 });
      x += w;
    });
    platforms.push({ x: x0 + W - 112, y: F - 46, w: 44, h: 46, pipe: true, theme });
    return {
      x: x0, w: W, theme, music: C.music, name: C.name, hint: C.hint, stages, powerups,
      timeBonus: Math.ceil(W / 150) + 60, platforms, coins, enemies, lasers,
      token,
      entry: { x: x0 + 70, y: 250 }, exit: { x: x0 + W - 90, y: F - 46 }
    };
  }

  Object.assign(G, { BONUS, CHALLENGES, makeBonus, makePipeZone, bonusWidth });
})();
