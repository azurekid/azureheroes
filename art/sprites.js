/* Azure Heroes 2027 - every sprite, tile, background and the pixel font is drawn here with code. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const NAVY = '#0a0720';
  const defs = {};

  function cv(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  function R(g, col, x, y, w, h) {
    g.fillStyle = col;
    g.fillRect(x, y, w, h);
  }
  function outline(c, col) {
    const g = c.getContext('2d');
    const w = c.width, h = c.height;
    const img = g.getImageData(0, 0, w, h);
    const src = new Uint8ClampedArray(img.data);
    const rgb = col || [10, 7, 32];
    const a = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : src[(y * w + x) * 4 + 3]);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (a(x, y) > 40) continue;
        if (a(x - 1, y) > 40 || a(x + 1, y) > 40 || a(x, y - 1) > 40 || a(x, y + 1) > 40) {
          const i = (y * w + x) * 4;
          img.data[i] = rgb[0]; img.data[i + 1] = rgb[1]; img.data[i + 2] = rgb[2]; img.data[i + 3] = 255;
        }
      }
    }
    g.putImageData(img, 0, 0);
  }
  // Lighting pass: rim light on top/left edges, shade on bottom/right edges, vertical gradient and fine dither.
  function shade(c) {
    const g = c.getContext('2d');
    const w = c.width, h = c.height;
    const img = g.getImageData(0, 0, w, h);
    const src = new Uint8ClampedArray(img.data);
    const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : src[(y * w + x) * 4 + 3]);
    const mix = (i, amt) => {
      for (let k = 0; k < 3; k++) {
        const v = img.data[i + k];
        img.data[i + k] = Math.max(0, Math.min(255, amt > 0 ? v + (255 - v) * amt : v * (1 + amt)));
      }
    };
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (A(x, y) < 200) continue;
        const i = (y * w + x) * 4;
        let amt = 0.12 - (y / h) * 0.2;
        if (A(x, y - 1) < 40) amt += 0.34;
        else if (A(x, y - 2) < 40) amt += 0.14;
        if (A(x - 1, y) < 40) amt += 0.22;
        if (A(x, y + 1) < 40) amt -= 0.34;
        else if (A(x, y + 2) < 40) amt -= 0.14;
        if (A(x + 1, y) < 40) amt -= 0.22;
        if ((x + y) % 2 === 0) amt += 0.035;
        mix(i, amt);
      }
    }
    g.putImageData(img, 0, 0);
  }
  function glow(c, color, blur) {
    const o = cv(c.width + blur * 4, c.height + blur * 4);
    const g = o.getContext('2d');
    g.shadowColor = color;
    g.shadowBlur = blur;
    g.drawImage(c, blur * 2, blur * 2);
    g.drawImage(c, blur * 2, blur * 2);
    g.shadowBlur = 0;
    g.drawImage(c, blur * 2, blur * 2);
    return o;
  }
  function reg(key, w, h, fn, noOutline, glowCol) {
    let c = cv(w, h);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    fn(g, w, h);
    if (!noOutline) { shade(c); outline(c); }
    if (glowCol) c = glow(c, glowCol, 4);
    defs[key] = c;
  }
  function disc(g, col, cx, cy, r) {
    g.fillStyle = col;
    for (let y = -r; y <= r; y++) {
      const hw = Math.floor(Math.sqrt(r * r - y * y));
      g.fillRect(cx - hw, cy + y, hw * 2 + 1, 1);
    }
  }
  function rng(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function lerpCol(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
    return 'rgb(' + ch(16) + ',' + ch(8) + ',' + ch(0) + ')';
  }

  /* ------------------------------------------------------------------ HERO (32x48) */
  const H = {
    suit: '#2f6bff', suitD: '#1b3fb5', suitL: '#5aa2ff', glow: '#7fe8ff', skin: '#f2b48c', skinD: '#c98a66',
    hair: '#13123a', glass: '#27e0ff', boots: '#12206e', belt: '#a9defc', cuff: '#6fc7ff',
    cape: '#2447c9', capeL: '#3d6bff', capeD: '#16257a'
  };

  function heroCape(g, flare, len) {
    for (let y = 14; y <= len; y++) {
      const t = (y - 14) / (len - 14);
      let xr = Math.round(13 - t * flare * 0.55);
      let xl = Math.round(xr - 4 - t * 6 - t * flare * 0.45);
      xl = Math.max(1, xl);
      xr = Math.max(xl + 2, xr);
      R(g, H.cape, xl, y, xr - xl + 1, 1);
      R(g, H.capeL, xr - 2, y, 3, 1);
      R(g, H.capeD, xl, y, 2, 1);
    }
  }
  function heroLegs(g, legs) {
    const base = [11, 17];
    legs.forEach((l, i) => {
      const x = base[i] + l[0];
      const bottom = 47 - l[1];
      R(g, i === 0 ? H.suitD : H.suit, x, 29, 5, bottom - 4 - 29);
      R(g, H.boots, x - 1, bottom - 4, 7, 4);
      R(g, H.suitL, x + 3, 29, 1, bottom - 4 - 29);
    });
  }
  function heroTorso(g) {
    for (let y = 14; y <= 29; y++) {
      const hw = y < 18 ? 8 : y < 24 ? 7 : 5;
      R(g, H.suit, 16 - hw, y, hw * 2, 1);
      R(g, H.suitD, 16 - hw, y, 2, 1);
      R(g, H.suitL, 16 + hw - 3, y, 2, 1);
    }
    R(g, H.belt, 10, 28, 12, 2);
    R(g, '#ffffff', 15, 28, 2, 2);
    // glowing A
    g.globalAlpha = 0.35;
    R(g, H.glow, 11, 15, 10, 9);
    g.globalAlpha = 1;
    const A = ['...#...', '..###..', '..#.#..', '.#...#.', '.#####.', '#.....#', '#.....#'];
    A.forEach((row, ry) => {
      for (let rx = 0; rx < 7; rx++) if (row[rx] === '#') R(g, '#e8fbff', 12 + rx, 16 + ry, 1, 1);
    });
  }
  function heroHead(g, dx, dy) {
    dx = dx || 0; dy = dy || 0;
    R(g, H.skin, 14 + dx, 13 + dy, 4, 2);
    R(g, H.skin, 12 + dx, 6 + dy, 9, 8);
    R(g, H.skinD, 12 + dx, 12 + dy, 9, 1);
    R(g, H.hair, 11 + dx, 3 + dy, 11, 4);
    R(g, H.hair, 13 + dx, 1 + dy, 7, 3);
    R(g, H.hair, 11 + dx, 6 + dy, 2, 4);
    R(g, '#0a1a40', 13 + dx, 7 + dy, 9, 3);
    R(g, H.glass, 14 + dx, 8 + dy, 7, 2);
    R(g, '#ffffff', 15 + dx, 8 + dy, 1, 1);
    R(g, '#b05a4a', 17 + dx, 12 + dy, 3, 1);
  }
  function heroBackArm(g, y0, len) {
    R(g, H.suitD, 7, y0, 4, len);
    R(g, H.skinD, 7, y0 + len, 4, 3);
  }
  function arm(g, x, y, w, h, fist) {
    R(g, H.suit, x, y, w, h);
    R(g, H.suitL, x, y, w, 1);
    R(g, H.cuff, x + (w > h ? w - 5 : 0), y + (w > h ? 0 : h - 4), w > h ? 3 : w, w > h ? h : 3);
    if (fist) R(g, H.skin, fist[0], fist[1], fist[2], fist[3]);
  }
  function hero(o) {
    return function (g) {
      heroCape(g, o.flare, o.capeLen);
      if (o.backArm) heroBackArm(g, o.backArm[0], o.backArm[1]);
      heroLegs(g, o.legs);
      heroTorso(g);
      if (o.arm === 'down') arm(g, 22, 15, 4, 13, [22, 28, 4, 3]);
      if (o.arm === 'run') { arm(g, 22, 15, 4, 6, null); arm(g, 24, 18, 6, 4, [29, 18, 3, 4]); }
      if (o.arm === 'up') arm(g, 22, 4, 4, 12, [22, 1, 4, 3]);
      if (o.arm === 'punch') { arm(g, 22, 16, 8, 4, [29, 15, 3, 6]); g.globalAlpha = 0.55; R(g, H.glow, 28, 13, 4, 10); g.globalAlpha = 1; }
      if (o.arm === 'shield') { arm(g, 22, 14, 7, 5, [28, 13, 3, 5]); }
      heroHead(g, o.hx, o.hy);
    };
  }
  reg('hero_idle', 32, 48, hero({ flare: 2, capeLen: 40, legs: [[0, 0], [0, 0]], arm: 'down', backArm: [15, 12] }));
  const runLegs = [[[-3, 0], [3, 3]], [[0, 0], [0, 2]], [[3, 3], [-3, 0]], [[0, 2], [0, 0]]];
  runLegs.forEach((l, i) => reg('hero_run' + i, 32, 48, hero({ flare: 8, capeLen: 38, legs: l, arm: 'run', backArm: [15, 9], hx: 1 })));
  reg('hero_jump', 32, 48, hero({ flare: 6, capeLen: 40, legs: [[-2, 5], [3, 0]], arm: 'up', backArm: [14, 9] }));
  reg('hero_attack', 32, 48, hero({ flare: 5, capeLen: 38, legs: [[-3, 0], [3, 0]], arm: 'punch', backArm: [15, 10], hx: 1 }));
  reg('hero_shield', 32, 48, hero({ flare: 0, capeLen: 40, legs: [[-1, 0], [3, 0]], arm: 'shield', backArm: [15, 11] }));
  reg('hero_fly', 32, 48, function (g) {
    for (let x = 0; x < 16; x++) {
      const t = x / 16;
      R(g, H.cape, x, 17 + Math.round(t * 2), 14 - Math.round(t * 0), 9 - Math.round(t * 3));
    }
    R(g, H.capeL, 0, 17, 14, 2);
    R(g, H.capeD, 0, 24, 14, 2);
    R(g, H.suitD, 4, 26, 13, 4);
    R(g, H.boots, 1, 25, 4, 6);
    R(g, H.suit, 12, 19, 14, 9);
    R(g, H.suitL, 12, 19, 14, 2);
    R(g, H.belt, 15, 19, 2, 9);
    g.globalAlpha = 0.4; R(g, H.glow, 18, 21, 6, 6); g.globalAlpha = 1;
    R(g, '#e8fbff', 20, 22, 1, 3); R(g, '#e8fbff', 21, 21, 1, 1); R(g, '#e8fbff', 22, 22, 1, 3); R(g, '#e8fbff', 21, 23, 1, 1);
    R(g, H.suit, 25, 21, 5, 4);
    R(g, H.cuff, 28, 21, 2, 4);
    R(g, H.skin, 30, 21, 2, 4);
    R(g, H.skin, 23, 15, 7, 7);
    R(g, H.hair, 22, 13, 8, 4);
    R(g, H.hair, 22, 15, 2, 5);
    R(g, '#0a1a40', 25, 17, 6, 3);
    R(g, H.glass, 26, 18, 4, 1);
    R(g, '#b05a4a', 28, 21, 2, 1);
  });
  reg('shield_fx', 20, 52, function (g) {
    g.globalAlpha = 0.45;
    R(g, '#27e0ff', 4, 6, 12, 40);
    R(g, '#27e0ff', 8, 2, 8, 48);
    g.globalAlpha = 1;
    R(g, '#e8fbff', 12, 8, 2, 36);
    R(g, '#7fe8ff', 8, 4, 6, 2);
    R(g, '#7fe8ff', 8, 46, 6, 2);
    R(g, '#7fe8ff', 14, 10, 3, 32);
    // padlock
    R(g, '#ffffff', 10, 22, 6, 6);
    R(g, '#ffffff', 11, 19, 1, 3); R(g, '#ffffff', 14, 19, 1, 3); R(g, '#ffffff', 12, 18, 2, 1);
  });

  /* ------------------------------------------------------------------ ENEMIES */
  function robotFrame(step) {
    return function (g) {
      const P1 = '#7b3fe4', P2 = '#53279e', P3 = '#a678ff', RED = '#ff2a4a';
      const o = step ? 2 : 0;
      R(g, P2, 9 + o, 26, 5, 8); R(g, '#2a1a5e', 8 + o, 32, 7, 3);
      R(g, P2, 18 - o, 26, 5, 8); R(g, '#2a1a5e', 17 - o, 32, 7, 3);
      R(g, P1, 6, 12, 20, 15); R(g, P3, 6, 12, 20, 2); R(g, P2, 6, 24, 20, 3);
      R(g, RED, 14, 17, 4, 4);
      R(g, P2, 2, 13, 4, 11); R(g, '#c8c8e8', 2, 24, 4, 4);
      R(g, P2, 26, 13, 4, 11); R(g, '#c8c8e8', 26, 24, 4, 4);
      R(g, P1, 9, 2, 14, 10); R(g, P3, 9, 2, 14, 2);
      R(g, '#1a0a30', 11, 5, 10, 4);
      R(g, RED, 12, 6, 3, 2); R(g, RED, 17, 6, 3, 2);
      R(g, '#c8c8e8', 15, 0, 2, 2);
    };
  }
  reg('robot_0', 32, 37, robotFrame(0));
  reg('robot_1', 32, 37, robotFrame(1));
  function droneFrame(f) {
    return function (g) {
      const G1 = '#b5b8c9', G2 = '#767a94', RED = '#ff2a4a';
      R(g, G2, 15, 3, 2, 4);
      if (f) R(g, '#e8e8f8', 3, 3, 26, 1); else R(g, '#e8e8f8', 8, 3, 16, 1);
      R(g, G1, 7, 7, 18, 9); R(g, '#e8e8f8', 7, 7, 18, 2); R(g, G2, 7, 14, 18, 2);
      R(g, '#1a0a30', 9, 10, 14, 4);
      R(g, RED, 11, 11, 3, 2); R(g, RED, 18, 11, 3, 2);
      R(g, G2, 5, 16, 2, 5); R(g, G2, 25, 16, 2, 5);
      R(g, G1, 3, 20, 6, 2); R(g, G1, 23, 20, 6, 2);
    };
  }
  reg('drone_0', 32, 24, droneFrame(0));
  reg('drone_1', 32, 24, droneFrame(1));
  function spiderFrame(f) {
    return function (g) {
      const P1 = '#c02cc9', P2 = '#7a1a8a', RED = '#ff2a4a';
      const lift = f ? 2 : 0;
      for (let i = 0; i < 4; i++) {
        const lx = 5 + i * 3 + (i % 2 ? lift : 0);
        R(g, P2, lx, 12, 2, 6 - (i % 2 ? 0 : lift ? 1 : 0));
        R(g, P2, 7 + i * 4 - 2, 10 + i % 2, 2, 3);
        R(g, P2, 31 - lx - 2, 12, 2, 6 - (i % 2 ? 0 : lift ? 1 : 0));
      }
      R(g, P1, 9, 4, 14, 9); R(g, '#ff7ad9', 9, 4, 14, 2); R(g, P2, 9, 11, 14, 2);
      R(g, '#1a0a30', 20, 6, 6, 4);
      R(g, RED, 21, 7, 2, 2); R(g, RED, 24, 7, 2, 2);
      R(g, '#ffd23f', 12, 7, 3, 3);
    };
  }
  reg('spider_0', 32, 20, spiderFrame(0));
  reg('spider_1', 32, 20, spiderFrame(1));

  function bossFrame(mode) {
    return function (g) {
      const A1 = '#5b2bb8', A2 = '#3a1a80', A3 = '#9a6bff', RED = '#ff2a4a', STUN = mode === 'stun';
      const eye = STUN ? '#6a6a80' : RED;
      const up = mode === 'attack' ? 10 : 0;
      // legs
      R(g, A2, 18, 58, 10, 18); R(g, '#1a0a40', 14, 74, 16, 6);
      R(g, A2, 36, 58, 10, 18); R(g, '#1a0a40', 34, 74, 16, 6);
      // torso
      R(g, A1, 14, 24, 36, 36); R(g, A3, 14, 24, 36, 3); R(g, A2, 14, 56, 36, 4);
      R(g, A2, 20, 30, 24, 22);
      disc(g, STUN ? '#555570' : '#ff5a7a', 32, 41, 7);
      disc(g, STUN ? '#888899' : '#fff1f3', 32, 41, 3);
      // shoulders
      R(g, A3, 4, 20, 14, 10); R(g, A1, 4, 24, 14, 6);
      R(g, A3, 46, 20, 14, 10); R(g, A1, 46, 24, 14, 6);
      // arms
      R(g, A1, 4, 30 - up, 10, 24); R(g, '#c8c8e8', 3, 52 - up, 12, 8);
      R(g, A1, 50, 30 - up, 10, 24); R(g, '#c8c8e8', 49, 52 - up, 12, 8);
      if (mode === 'attack') { g.globalAlpha = 0.6; disc(g, '#ff5a7a', 9, 50 - up, 6); disc(g, '#ff5a7a', 55, 50 - up, 6); g.globalAlpha = 1; }
      // head
      R(g, A1, 20, 4, 24, 20); R(g, A3, 20, 4, 24, 3);
      R(g, '#12062a', 23, 10, 18, 8);
      R(g, eye, 24, 12, 6, 4); R(g, eye, 34, 12, 6, 4);
      R(g, A2, 26, 20, 12, 4);
      R(g, '#c8c8e8', 30, 0, 4, 4);
      if (STUN) {
        R(g, '#ffd23f', 6, 8, 2, 6); R(g, '#ffd23f', 4, 10, 6, 2);
        R(g, '#ffd23f', 52, 4, 2, 6); R(g, '#ffd23f', 50, 6, 6, 2);
        R(g, '#ffd23f', 44, 0, 2, 4); R(g, '#ffd23f', 42, 2, 6, 2);
      }
    };
  }
  reg('boss_0', 64, 80, bossFrame('idle'));
  reg('boss_attack', 64, 80, bossFrame('attack'));
  reg('boss_stun', 64, 80, bossFrame('stun'));
  reg('bolt', 22, 12, function (g) {
    R(g, '#ff2a4a', 6, 3, 14, 6); R(g, '#ff9fb0', 8, 5, 12, 2);
    R(g, '#ff2a4a', 2, 5, 4, 2); R(g, '#ffffff', 18, 4, 4, 4);
  });

  /* ------------------------------------------------------------------ ITEMS */
  [['coin0', 12], ['coin1', 8], ['coin2', 4], ['coin3', 8]].forEach(function (c) {
    reg(c[0], 14, 14, function (g) {
      const w = c[1], x = 7 - w / 2;
      R(g, '#ffb000', x, 1, w, 12);
      R(g, '#ffd23f', x + 1, 2, Math.max(1, w - 2), 10);
      if (w > 6) { R(g, '#ff9500', 5, 4, 4, 6); R(g, '#fff3a0', 5, 2, 3, 2); }
    });
  });
  reg('mfa', 20, 22, function (g) {
    R(g, '#0b7a75', 2, 1, 16, 14); R(g, '#0b7a75', 4, 15, 12, 3); R(g, '#0b7a75', 7, 18, 6, 3);
    R(g, '#27e0ff', 3, 2, 14, 12); R(g, '#27e0ff', 5, 14, 10, 3); R(g, '#27e0ff', 8, 17, 4, 3);
    R(g, '#e8fbff', 3, 2, 14, 2);
    // key
    R(g, '#0a1a40', 6, 6, 4, 4); R(g, '#27e0ff', 7, 7, 2, 2);
    R(g, '#0a1a40', 10, 7, 6, 2); R(g, '#0a1a40', 13, 9, 1, 2); R(g, '#0a1a40', 15, 9, 1, 2);
  });
  reg('ring', 56, 72, function (g) {
    for (let a = 0; a < 360; a += 2) {
      const rx = 22, ry = 32;
      const x = Math.round(28 + Math.cos(a * Math.PI / 180) * rx), y = Math.round(36 + Math.sin(a * Math.PI / 180) * ry);
      R(g, '#ffb000', x - 2, y - 2, 4, 4);
      R(g, '#ffd23f', x - 1, y - 1, 2, 2);
    }
  });
  reg('laser_emit', 14, 10, function (g) {
    R(g, '#3a3a5c', 0, 2, 14, 8); R(g, '#8a8ab8', 0, 2, 14, 2);
    R(g, '#ff2a4a', 5, 0, 4, 3); R(g, '#ffffff', 6, 1, 2, 1);
  });
  reg('laser_beam', 8, 8, function (g) {
    R(g, 'rgba(255,42,74,0.45)', 0, 0, 8, 8);
    R(g, '#ff2a4a', 2, 0, 4, 8);
    R(g, '#ffffff', 3, 0, 2, 8);
  }, true);
  reg('flag_off', 16, 44, function (g) {
    R(g, '#8a8ab8', 2, 0, 2, 44); R(g, '#555570', 4, 4, 10, 8);
  });
  reg('flag_on', 16, 44, function (g) {
    R(g, '#8a8ab8', 2, 0, 2, 44); R(g, '#27e0ff', 4, 4, 10, 8); R(g, '#e8fbff', 6, 6, 4, 4);
  });
  reg('terminal', 30, 40, function (g) {
    R(g, '#2a2a4c', 2, 14, 26, 26); R(g, '#555580', 2, 14, 26, 3);
    R(g, '#0a1a40', 5, 2, 20, 14); R(g, '#27e0ff', 7, 4, 16, 10);
    R(g, '#0a1a40', 9, 6, 6, 1); R(g, '#0a1a40', 9, 9, 10, 1); R(g, '#0a1a40', 9, 12, 4, 1);
    R(g, '#ff7ad9', 5, 22, 20, 2); R(g, '#7fe8ff', 6, 28, 4, 4); R(g, '#7fe8ff', 12, 28, 4, 4); R(g, '#7fe8ff', 18, 28, 4, 4);
  });
  reg('gate', 20, 16, function (g) {
    R(g, 'rgba(255,42,74,0.35)', 0, 0, 20, 16);
    R(g, '#ff2a4a', 8, 0, 4, 16); R(g, '#ffffff', 9, 0, 2, 16);
    R(g, '#ff2a4a', 0, 6, 20, 2);
  }, true);
  reg('cable', 16, 10, function (g) {
    R(g, '#1a1a3a', 0, 4, 16, 5); R(g, '#ffd23f', 2, 5, 4, 3); R(g, '#ff7ad9', 8, 5, 4, 3);
    R(g, '#ffffff', 5, 0, 1, 4); R(g, '#7fe8ff', 6, 1, 2, 2); R(g, '#ffffff', 11, 1, 1, 3);
  });
  reg('portal', 40, 72, function (g) {
    for (let y = 0; y < 72; y++) {
      const t = Math.sin((y / 72) * Math.PI);
      const hw = Math.round(6 + t * 12);
      R(g, 'rgba(127,232,255,0.55)', 20 - hw, y, hw * 2, 1);
      R(g, '#e8fbff', 20 - Math.round(hw / 2), y, Math.round(hw), 1);
    }
  });
  reg('blast', 24, 14, function (g) {
    g.globalAlpha = 0.45; R(g, '#27e0ff', 0, 2, 24, 10); g.globalAlpha = 1;
    R(g, '#27e0ff', 4, 3, 18, 8); R(g, '#e8fbff', 8, 5, 14, 4); R(g, '#ffffff', 18, 4, 5, 6);
  });
  reg('spark', 4, 4, function (g) { R(g, '#ffffff', 0, 0, 4, 4); }, true);
  reg('spark_y', 4, 4, function (g) { R(g, '#ffd23f', 0, 0, 4, 4); }, true);
  reg('spark_c', 4, 4, function (g) { R(g, '#27e0ff', 0, 0, 4, 4); }, true);
  reg('btn', 56, 56, function (g) {
    disc(g, 'rgba(10,7,32,0.55)', 28, 28, 27);
    for (let a = 0; a < 360; a += 3) {
      R(g, '#27e0ff', Math.round(28 + Math.cos(a * Math.PI / 180) * 26), Math.round(28 + Math.sin(a * Math.PI / 180) * 26), 2, 2);
    }
  }, true);
  reg('btn_down', 56, 56, function (g) {
    disc(g, 'rgba(39,224,255,0.55)', 28, 28, 27);
    for (let a = 0; a < 360; a += 3) {
      R(g, '#ffffff', Math.round(28 + Math.cos(a * Math.PI / 180) * 26), Math.round(28 + Math.sin(a * Math.PI / 180) * 26), 2, 2);
    }
  }, true);

  /* ------------------------------------------------------------------ TILES */
  reg('roof_top', 32, 8, function (g) {
    R(g, '#ffffff', 0, 0, 32, 1); R(g, '#ff7ad9', 0, 1, 32, 2); R(g, '#27e0ff', 0, 3, 32, 1);
    R(g, '#5a3fc0', 0, 4, 32, 2); R(g, '#3b2a8f', 0, 6, 32, 2);
    for (let x = 0; x < 32; x += 8) R(g, '#8a6cff', x, 4, 4, 1);
  }, true);
  reg('roof', 32, 32, function (g) {
    for (let y = 0; y < 32; y += 2) R(g, lerpCol('#3b2a8f', '#1d1050', y / 32), 0, y, 32, 2);
    R(g, 'rgba(255,255,255,0.08)', 0, 0, 1, 32); R(g, 'rgba(0,0,0,0.3)', 31, 0, 1, 32);
    R(g, 'rgba(0,0,0,0.25)', 0, 15, 32, 1);
    for (let y = 4; y < 32; y += 12) for (let x = 4; x < 32; x += 12) {
      const lit = ((x * 7 + y * 3) % 5) < 2;
      R(g, lit ? '#ffb000' : '#4a36a8', x, y, 6, 6);
      if (lit) { R(g, '#fff3a0', x, y, 6, 2); g.globalAlpha = 0.25; R(g, '#ffd23f', x - 1, y - 1, 8, 8); g.globalAlpha = 1; }
      else R(g, '#2a1a70', x, y + 4, 6, 2);
    }
  }, true);
  reg('rack_top', 32, 8, function (g) {
    R(g, '#27e0ff', 0, 0, 32, 2); R(g, '#555580', 0, 2, 32, 6);
  }, true);
  reg('rack', 32, 32, function (g) {
    R(g, '#22224a', 0, 0, 32, 32);
    R(g, '#33336a', 0, 0, 32, 1); R(g, '#12122c', 0, 31, 32, 1);
    for (let y = 3; y < 30; y += 7) {
      R(g, '#12122c', 3, y, 26, 5);
      R(g, '#3a3a7a', 4, y + 1, 12, 1);
      R(g, ((y * 3) % 3) ? '#4dff7a' : '#27e0ff', 22, y + 1, 2, 2);
      R(g, '#ff7ad9', 26, y + 1, 2, 2);
    }
  }, true);
  reg('rock_top', 32, 8, function (g) {
    R(g, '#ff7ad9', 0, 0, 32, 2); R(g, '#7a3fd0', 0, 2, 32, 6);
  }, true);
  reg('rock', 32, 32, function (g) {
    const r = rng(7);
    R(g, '#4a2290', 0, 0, 32, 32);
    for (let i = 0; i < 14; i++) R(g, r() > 0.5 ? '#5e2fb0' : '#381a78', Math.floor(r() * 28), Math.floor(r() * 28), 4 + Math.floor(r() * 6), 3);
  }, true);

  /* ------------------------------------------------------------------ BACKGROUNDS */
  function skyline(w, h, seed, body, accent, minH, maxH, winChance) {
    return function (g) {
      const r = rng(seed);
      const signs = ['#ff2fb0', '#27e0ff', '#ffe14a', '#4dff7a'];
      let x = 0;
      while (x < w) {
        let bw = 28 + Math.floor(r() * 36);
        if (w - x < 56) bw = w - x;
        const bh = minH + Math.floor(r() * (maxH - minH));
        const top = h - bh;
        // body with vertical haze gradient (lighter toward the street)
        for (let y = top; y < h; y += 2) R(g, lerpCol(body, '#5a2aa8', Math.pow((y - top) / bh, 2) * 0.55), x, y, bw, 2);
        R(g, 'rgba(0,0,0,0.28)', x + bw - Math.max(4, bw * 0.28), top, Math.max(4, bw * 0.28), bh);
        R(g, accent, x, top, bw, 2);
        R(g, 'rgba(255,255,255,0.25)', x, top, 1, bh);
        const roof = r();
        if (roof > 0.7 && bw > 20) { R(g, body, x + bw / 2 - 1, top - 14, 2, 14); R(g, '#ff2a4a', x + bw / 2 - 1, top - 14, 2, 2); }
        else if (roof > 0.4 && bw > 24) { R(g, '#2a1070', x + 4, top - 5, 10, 5); R(g, accent, x + 4, top - 5, 10, 1); }
        for (let wy = top + 6; wy < h - 4; wy += 8) {
          for (let wx = x + 4; wx < x + bw - 5; wx += 7) {
            if (r() < winChance) { const c = r() > 0.5 ? '#ff7ad9' : '#52e7ff'; R(g, c, wx, wy, 3, 4); R(g, 'rgba(255,255,255,0.5)', wx, wy, 3, 1); }
          }
        }
        if (r() > 0.72 && bh > 70) {
          const sc = signs[Math.floor(r() * signs.length)], sy = top + 12 + Math.floor(r() * 20);
          R(g, sc, x + 3, sy, 3, 22); R(g, 'rgba(255,255,255,0.7)', x + 3, sy, 1, 22);
          g.globalAlpha = 0.25; R(g, sc, x + 1, sy - 2, 7, 26); g.globalAlpha = 1;
        }
        x += bw;
      }
    };
  }
  reg('bg_sky', 640, 360, function (g) {
    const stops = [[0, '#12063a'], [0.45, '#4b1a8f'], [0.68, '#d6379a'], [0.82, '#ff7a59'], [1, '#ffc15e']];
    for (let y = 0; y < 360; y += 4) {
      const t = y / 360;
      let i = 0;
      while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
      const a = stops[i], b = stops[i + 1];
      R(g, lerpCol(a[1], b[1], Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])))), 0, y, 640, 4);
    }
    const sx = 450, sy = 215, sr = 72;
    for (let y = -sr; y <= sr; y += 2) {
      const hw = Math.floor(Math.sqrt(sr * sr - y * y));
      const t = (y + sr) / (sr * 2);
      R(g, lerpCol('#fff06a', '#ff5fa2', t), sx - hw, sy + y, hw * 2, 2);
    }
    // striping
    for (let i = 0; i < 7; i++) {
      const yy = sy + 6 + i * 9;
      const t = yy / 360;
      let k = 0;
      while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
      R(g, lerpCol(stops[k][1], stops[k + 1][1], Math.min(1, Math.max(0, (t - stops[k][0]) / (stops[k + 1][0] - stops[k][0])))), sx - sr, yy, sr * 2, 1 + Math.floor(i / 2));
    }
    // sun halo
    for (let i = 8; i > 0; i--) { g.globalAlpha = 0.035; disc(g, '#ffd27a', sx, sy, sr + i * 9); }
    g.globalAlpha = 1;
    // pixel clouds with neon underside
    const cr = rng(9);
    for (let i = 0; i < 7; i++) {
      const cx = Math.floor(cr() * 600), cy = 90 + Math.floor(cr() * 110), cw = 60 + Math.floor(cr() * 80);
      R(g, 'rgba(120,50,190,0.55)', cx, cy, cw, 8); R(g, 'rgba(120,50,190,0.55)', cx + 10, cy - 6, cw - 30, 6);
      R(g, 'rgba(255,122,217,0.75)', cx, cy + 6, cw, 2); R(g, 'rgba(255,180,120,0.5)', cx + 10, cy - 6, cw - 30, 1);
    }
    const r = rng(3);
    for (let i = 0; i < 90; i++) {
      const sx2 = Math.floor(r() * 640), sy2 = Math.floor(r() * 150), big = r() > 0.88;
      R(g, '#ffffff', sx2, sy2, 2, 2);
      if (big) { R(g, 'rgba(255,255,255,0.7)', sx2 - 2, sy2, 6, 2); R(g, 'rgba(255,255,255,0.7)', sx2, sy2 - 2, 2, 6); }
    }
  }, true);
  reg('bg_city_far', 640, 220, skyline(640, 220, 11, '#2a1070', '#8a4cff', 60, 170, 0.12), true);
  reg('bg_city_near', 640, 190, skyline(640, 190, 29, '#170a48', '#ff7ad9', 50, 150, 0.22), true);
  function mesas(w, h, seed, col, edge, minH, maxH) {
    return function (g) {
      const r = rng(seed);
      let x = 0;
      while (x < w) {
        let bw = 60 + Math.floor(r() * 90);
        if (w - x < 100) bw = w - x;
        const bh = minH + Math.floor(r() * (maxH - minH));
        R(g, col, x, h - bh, bw, bh);
        R(g, col, x + 10, h - bh - 10, bw - 20, 10);
        R(g, edge, x + 10, h - bh - 10, bw - 20, 2);
        R(g, edge, x, h - bh, bw, 2);
        x += bw;
      }
    };
  }
  reg('bg_mesa_far', 640, 200, mesas(640, 200, 5, '#3a1a80', '#a65cff', 40, 130), true);
  reg('bg_mesa_near', 640, 150, mesas(640, 150, 17, '#1f0e55', '#ff7ad9', 20, 90), true);
  reg('bg_dc', 640, 360, function (g) {
    for (let y = 0; y < 360; y += 4) R(g, lerpCol('#0d0830', '#2a0f5e', y / 360), 0, y, 640, 4);
    for (let x = 0; x < 640; x += 40) R(g, 'rgba(39,224,255,0.07)', x, 0, 2, 360);
    for (let y = 0; y < 360; y += 40) R(g, 'rgba(255,122,217,0.07)', 0, y, 640, 2);
  }, true);
  reg('bg_dc_far', 640, 260, function (g) {
    const r = rng(41);
    for (let x = 0; x < 640; x += 64) {
      R(g, '#1a1048', x + 4, 40, 56, 220);
      R(g, '#2e1a78', x + 4, 40, 56, 3);
      for (let y = 50; y < 250; y += 10) {
        R(g, '#0d0830', x + 8, y, 48, 6);
        for (let k = 0; k < 4; k++) if (r() > 0.45) R(g, r() > 0.5 ? '#4dff7a' : '#27e0ff', x + 12 + k * 8, y + 2, 3, 2);
      }
    }
  }, true);
  reg('bg_dc_near', 640, 120, function (g) {
    R(g, '#150a3a', 0, 80, 640, 40);
    for (let x = 0; x < 640; x += 160) {
      R(g, '#1f1058', x, 20, 12, 100);
      R(g, '#ff7ad9', x, 20, 12, 2);
      R(g, '#1f1058', x, 40, 160, 10);
    }
  }, true);

  /* ------------------------------------------------------------------ PIXEL FONT (5x7) */
  const FONT = {
    A: '.###./#...#/#...#/#####/#...#/#...#/#...#', B: '####./#...#/#...#/####./#...#/#...#/####.',
    C: '.####/#..../#..../#..../#..../#..../.####', D: '####./#...#/#...#/#...#/#...#/#...#/####.',
    E: '#####/#..../#..../####./#..../#..../#####', F: '#####/#..../#..../####./#..../#..../#....',
    G: '.####/#..../#..../#.###/#...#/#...#/.###.', H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
    I: '.###./..#../..#../..#../..#../..#../.###.', J: '..###/...#./...#./...#./...#./#..#./.##..',
    K: '#...#/#..#./#.#../##.../#.#../#..#./#...#', L: '#..../#..../#..../#..../#..../#..../#####',
    M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', N: '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
    O: '.###./#...#/#...#/#...#/#...#/#...#/.###.', P: '####./#...#/#...#/####./#..../#..../#....',
    Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#', R: '####./#...#/#...#/####./#.#../#..#./#...#',
    S: '.####/#..../#..../.###./....#/....#/####.', T: '#####/..#../..#../..#../..#../..#../..#..',
    U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.', V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
    W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#', X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
    Y: '#...#/#...#/.#.#./..#../..#../..#../..#..', Z: '#####/....#/...#./..#../.#.../#..../#####',
    0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.', 1: '..#../.##../..#../..#../..#../..#../.###.',
    2: '.###./#...#/....#/...#./..#../.#.../#####', 3: '####./....#/....#/.###./....#/....#/####.',
    4: '#...#/#...#/#...#/#####/....#/....#/....#', 5: '#####/#..../####./....#/....#/#...#/.###.',
    6: '.###./#..../#..../####./#...#/#...#/.###.', 7: '#####/....#/...#./..#../.#.../.#.../.#...',
    8: '.###./#...#/#...#/.###./#...#/#...#/.###.', 9: '.###./#...#/#...#/.####/....#/....#/.###.',
    ':': '...../..#../..#../...../..#../..#../.....', '%': '##..#/##..#/...#./..#../.#.../#..##/#..##',
    '.': '...../...../...../...../...../.##../.##..', '-': '...../...../...../#####/...../...../.....',
    '!': '..#../..#../..#../..#../..#../...../..#..', '/': '....#/....#/...#./..#../.#.../#..../#....',
    '+': '...../..#../..#../#####/..#../..#../.....', '?': '.###./#...#/....#/...#./..#../...../..#..',
    ',': '...../...../...../...../.##../..#../.#...', "'": '..#../..#../.#.../...../...../...../.....',
    '<': '...#./..#../.#.../#..../.#.../..#../...#.', '>': '.#.../..#../...#./....#/...#./..#../.#...',
    '^': '..#../.#.#./#...#/...../...../...../.....', '=': '...../...../#####/...../#####/...../.....',
    '(': '...#./..#../.#.../.#.../.#.../..#../...#.', ')': '.#.../..#../...#./...#./...#./..#../.#...',
    '*': '...../#.#.#/.###./#####/.###./#.#.#/.....', ' ': '...../...../...../...../...../...../.....'
  };
  const glyphCache = {};
  function glyph(ch) {
    if (glyphCache[ch]) return glyphCache[ch];
    const s = FONT[ch] || FONT['?'];
    return (glyphCache[ch] = s.split('/'));
  }
  function drawText(str, scale, color, shadow) {
    const sh = shadow ? scale : 0;
    const c = cv(Math.max(1, str.length * 6 * scale + sh), 7 * scale + sh);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    for (let pass = shadow ? 0 : 1; pass < 2; pass++) {
      g.fillStyle = pass === 0 ? shadow : color;
      const off = pass === 0 ? sh : 0;
      for (let i = 0; i < str.length; i++) {
        const rows = glyph(str[i]);
        for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) {
          if (rows[y][x] === '#') g.fillRect((i * 6 + x) * scale + off, y * scale + off, scale, scale);
        }
      }
    }
    return c;
  }

  let ptId = 0;
  AH.PixelText = class PixelText {
    constructor(scene, x, y, str, o) {
      this.scene = scene;
      this.o = Object.assign({ scale: 2, color: '#ffffff', shadow: '#1a0a40', ox: 0, oy: 0 }, o || {});
      this.img = scene.add.image(x, y, '__DEFAULT').setOrigin(this.o.ox, this.o.oy);
      this.key = null;
      this.str = null;
      this.setText(str);
      scene.events.once('shutdown', () => this.destroy());
    }
    setText(s) {
      s = String(s);
      if (s === this.str) return this;
      this.str = s;
      this.redraw();
      return this;
    }
    setColor(c) {
      if (c === this.o.color) return this;
      this.o.color = c;
      this.redraw();
      return this;
    }
    redraw() {
      if (!this.img || !this.img.scene) return;
      const key = 'pt' + ptId++;
      this.scene.textures.addCanvas(key, drawText(this.str.toUpperCase(), this.o.scale, this.o.color, this.o.shadow));
      this.img.setTexture(key);
      if (this.key && this.scene.textures.exists(this.key)) this.scene.textures.remove(this.key);
      this.key = key;
    }
    get width() { return this.img.width; }
    get height() { return this.img.height; }
    setPosition(x, y) { this.img.setPosition(x, y); return this; }
    setScrollFactor(v) { this.img.setScrollFactor(v); return this; }
    setDepth(v) { this.img.setDepth(v); return this; }
    setVisible(v) { this.img.setVisible(v); return this; }
    setAlpha(v) { this.img.setAlpha(v); return this; }
    setOrigin(a, b) { this.img.setOrigin(a, b); return this; }
    setScale(v) { this.img.setScale(v); return this; }
    setInteractive(o) { this.img.setInteractive(o); return this; }
    on(e, fn) { this.img.on(e, fn); return this; }
    destroy() {
      if (this.key && this.scene.textures && this.scene.textures.exists(this.key)) this.scene.textures.remove(this.key);
      this.key = null;
      if (this.img) { this.img.destroy(); this.img = null; }
    }
  };

  /* ------------------------------------------------------------------ TITLE ART */
  reg('title_burst', 8, 8, function (g) { R(g, '#ffffff', 0, 0, 8, 8); }, true);

  [['coin0', '#ffb000'], ['coin1', '#ffb000'], ['coin2', '#ffb000'], ['coin3', '#ffb000'], ['mfa', '#27e0ff'], ['ring', '#ffb000'],
    ['blast', '#27e0ff'], ['bolt', '#ff2a4a'], ['laser_emit', '#ff2a4a'], ['portal', '#27e0ff'], ['flag_on', '#27e0ff'], ['terminal', '#27e0ff']
  ].forEach(function (e) { defs[e[0]] = glow(defs[e[0]], e[1], 4); });

  /* ------------------------------------------------------------------ REGISTRATION */
  AH.Art = {
    keys: Object.keys(defs),
    generate: function (scene) {
      Object.keys(defs).forEach(function (k) {
        if (!scene.textures.exists(k)) scene.textures.addCanvas(k, defs[k]);
      });
      const a = scene.anims;
      const mk = (key, frames, rate) => {
        if (!a.exists(key)) a.create({ key, frames: frames.map((f) => ({ key: f })), frameRate: rate, repeat: -1 });
      };
      mk('coin_spin', ['coin0', 'coin1', 'coin2', 'coin3'], 8);
      mk('robot_walk', ['robot_0', 'robot_1'], 5);
      mk('drone_fly', ['drone_0', 'drone_1'], 16);
      mk('spider_crawl', ['spider_0', 'spider_1'], 8);
      mk('hero_run', ['hero_run0', 'hero_run1', 'hero_run2', 'hero_run3'], 12);
    }
  };
})();
