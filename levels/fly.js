(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const G = (AH.LevelGenerator = AH.LevelGenerator || {});
  const { ri, pick, clamp, shuffle, powerKinds, POWER_FLY } = G;

  function makeFly(m) {
    const o = m.opt;
    const centers = [], xs = [];
    let c = 190, x = 760;
    for (let i = 0; i < o.cols; i++) {
      c = clamp(c + ri(-120, 120), 135, 285);
      centers.push(c);
      xs.push(x);
      x += ri(o.spaceMin, o.spaceMax);
    }
    const P = [], half = [];
    centers.forEach((ct, i) => {
      const h = ri(o.halfMin, o.halfMax);
      half.push(h);
      P.push({ x: xs[i], y: 0, w: 56, h: ct - h });
      P.push({ x: xs[i], y: ct + h, w: 56, h: 360 - (ct + h) });
    });
    const lastX = xs[xs.length - 1];
    const mid = (i) => ({ x: Math.round((xs[i] + xs[i + 1]) / 2 + 28), y: Math.round((centers[i] + centers[i + 1]) / 2) });

    const idx = shuffle(Array.from({ length: o.cols - 2 }, (_, i) => i + 1));
    const rings = idx.splice(0, o.rings).map((i) => ({ x: mid(i).x, y: mid(i).y, r: 34 }));
    const coins = idx.splice(0, o.coins).map((i) => ({ x: mid(i).x, y: clamp(mid(i).y + ri(-70, 70), 50, 310) }));
    const mfaTokens = idx.splice(0, 3).map((i) => ({ x: mid(i).x, y: clamp(mid(i).y + ri(-50, 50), 60, 300) }));
    const enemies = [];
    for (let d = 0; d < o.drones; d++) {
      const dx = 1100 + Math.round((lastX - 1500) * (d + Math.random() * 0.8) / o.drones);
      enemies.push({ type: 'drone', x: dx, y: ri(110, 270), range: 0 });
    }
    for (let d = 0; d < (o.botnets === undefined ? 3 : o.botnets); d++) enemies.push({ type: 'botnet', x: 1600 + Math.round((lastX - 2400) * (d + 0.5) / 3), y: ri(60, 90), range: 160 });
    const cps = [];
    for (let i = o.cpEvery; i < o.cols - 3; i += o.cpEvery) cps.push({ x: xs[i] + 28, y: Math.round(centers[i]) });
    const powerups = powerKinds(3, POWER_FLY).map((kind, i) => Object.assign({ kind: kind }, { x: mid(idx[i] || 5 + i * 4).x, y: clamp(mid(idx[i] || 5 + i * 4).y, 80, 290) }));
    const props = [];
    for (let px = 500; px < lastX; px += ri(380, 620)) props.push({ kind: pick(o.props), x: px, y: ri(70, 290), float: true });
    const width = lastX + 760;
    return {
      width: width, platforms: P, lasers: [], coins: coins, mfaTokens: mfaTokens, rings: rings, powerups: powerups, props: props, enemies: enemies,
      scroll: o.scroll, checkpoints: cps, spawn: { x: 120, y: 190 },
      boss: Object.assign({ trigger: width - 630, left: width - 640, right: width, floor: 250 }, m.boss),
      exit: { x: width - 70, y: 0, w: 60, h: 360 }
    };
  }

  G.makeFly = makeFly;
})();
