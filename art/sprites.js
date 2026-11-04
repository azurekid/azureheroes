/* Azure Heroes 2027 - every sprite, tile, background and the pixel font is drawn here with code.
 * Art is rendered at 2x density (D): game logic keeps using 640x360 units, textures carry twice the pixels. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const NAVY = '#0a0720';
  const D = 2;
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
  // Hard-edge the alpha channel so vector shapes keep a crisp pixel-art silhouette.
  function crisp(c) {
    const g = c.getContext('2d');
    const img = g.getImageData(0, 0, c.width, c.height);
    for (let i = 3; i < img.data.length; i += 4) img.data[i] = img.data[i] > 110 ? 255 : 0;
    g.putImageData(img, 0, 0);
  }
  // Lighting pass: rim light on top/left edges, shade on bottom/right edges, vertical gradient and fine dither.
  function shade(c, k) {
    k = k === undefined ? 1 : k;
    const g = c.getContext('2d');
    const w = c.width, h = c.height;
    const img = g.getImageData(0, 0, w, h);
    const src = new Uint8ClampedArray(img.data);
    const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : src[(y * w + x) * 4 + 3]);
    const mix = (i, amt) => {
      for (let q = 0; q < 3; q++) {
        const v = img.data[i + q];
        img.data[i + q] = Math.max(0, Math.min(255, amt > 0 ? v + (255 - v) * amt : v * (1 + amt)));
      }
    };
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (A(x, y) < 200) continue;
        let amt = 0.1 - (y / h) * 0.18;
        if (A(x, y - 1) < 40) amt += 0.36;
        else if (A(x, y - 2) < 40) amt += 0.2;
        else if (A(x, y - 3) < 40) amt += 0.08;
        if (A(x - 1, y) < 40) amt += 0.24;
        else if (A(x - 2, y) < 40) amt += 0.1;
        if (A(x, y + 1) < 40) amt -= 0.36;
        else if (A(x, y + 2) < 40) amt -= 0.2;
        else if (A(x, y + 3) < 40) amt -= 0.08;
        if (A(x + 1, y) < 40) amt -= 0.24;
        else if (A(x + 2, y) < 40) amt -= 0.1;
        if ((x + y) % 2 === 0) amt += 0.03;
        mix((y * w + x) * 4, amt * k);
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
  function upscale(c) {
    const o = cv(c.width * D, c.height * D);
    const g = o.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(c, 0, 0, o.width, o.height);
    return o;
  }
  // 1x pixel-grid design, upscaled 2x then lit and outlined.
  function reg(key, w, h, fn, noOutline, glowCol) {
    let c = cv(w, h);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    fn(g, w, h);
    c = upscale(c);
    if (!noOutline) { shade(c); outline(c); }
    if (glowCol) c = glow(c, glowCol, 6);
    defs[key] = c;
  }
  // Native hi-res design: fn draws in 1x units (context pre-scaled by D), may use paths and gradients.
  function reg2(key, w, h, fn, opt) {
    opt = opt || {};
    let c = cv(w * D, h * D);
    const g = c.getContext('2d');
    g.scale(D, D);
    fn(g, w, h);
    crisp(c);
    if (opt.shade !== 0) shade(c, opt.shade === undefined ? 0.6 : opt.shade);
    if (!opt.noOutline) outline(c);
    if (opt.glow) c = glow(c, opt.glow, 6);
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

  /* ---- vector helpers used by the hi-res sprites (units are 1x pixels) */
  function lg(g, x0, y0, x1, y1, stops) {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s) => gr.addColorStop(s[0], s[1]));
    return gr;
  }
  function poly(g, pts, fill) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
  }
  function ell(g, cx, cy, rx, ry, fill, rot) {
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, rot || 0, 0, Math.PI * 2);
    g.fillStyle = fill;
    g.fill();
  }
  function rrect(g, x, y, w, h, r, fill) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
  }
  // Shaded cylinder from a to b: dark body, mid body, highlight stripe.
  function limb(g, ax, ay, bx, by, w, dark, mid, hi) {
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.strokeStyle = dark; g.lineWidth = w; g.stroke();
    g.beginPath(); g.moveTo(ax - w * 0.08, ay - w * 0.08); g.lineTo(bx - w * 0.08, by - w * 0.08); g.strokeStyle = mid; g.lineWidth = w * 0.72; g.stroke();
    if (hi) { g.beginPath(); g.moveTo(ax - w * 0.2, ay - w * 0.2); g.lineTo(bx - w * 0.2, by - w * 0.2); g.strokeStyle = hi; g.lineWidth = w * 0.22; g.stroke(); }
  }
  function line(g, ax, ay, bx, by, w, col) {
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.strokeStyle = col; g.lineWidth = w; g.stroke();
  }

  /* ------------------------------------------------------------------ HERO (32x48, drawn at 2x density) */
  const H = {
    suit: '#2f6bff', suitD: '#16339e', suitM: '#2455e0', suitL: '#6fb4ff', glow: '#9ff0ff', skin: '#f6bd94', skinD: '#c98a66',
    hair: '#14133f', hairL: '#3a3a8a', boots: '#0f1c66', bootL: '#3a58d8', belt: '#c4e6ff', cuff: '#8fd6ff',
    cape: '#2447c9', capeL: '#4f82ff', capeD: '#101e70'
  };

  function heroCape(g, f, len) {
    const cx = (x) => Math.max(0.6, x);
    const L = len;
    const pts = [[12, 14], [20, 15], [19.5, 24], [17.5, L - 7], [15.5, L - 1.5], [13, L - 5], [10.5 - f * 0.45, L], [7.5 - f * 0.7, L - 4.5],
      [4.5 - f * 0.85, L - 0.5], [3.5 - f * 0.6, L - 9], [6 - f * 0.4, 25], [9, 17]].map((p) => [cx(p[0]), p[1]]);
    poly(g, pts, lg(g, 3, 14, 20, L, [[0, H.capeD], [0.45, H.cape], [1, H.capeL]]));
    // folds
    g.lineCap = 'round';
    [[8, 17, 6 - f * 0.3, L - 6], [12, 17, 10 - f * 0.4, L - 3], [16, 18, 15, L - 6]].forEach((l) => line(g, cx(l[0]), l[1], cx(l[2]), l[3], 0.9, 'rgba(8,16,70,0.55)'));
    [[10, 17, 8.5 - f * 0.3, L - 10], [15, 18, 14, L - 12]].forEach((l) => line(g, cx(l[0]), l[1], cx(l[2]), l[3], 0.7, 'rgba(120,170,255,0.5)'));
    // gold-free neon trim along the bottom hem
    line(g, cx(4.5 - f * 0.85), L - 0.8, cx(10.5 - f * 0.45), L - 0.6, 0.7, 'rgba(127,232,255,0.8)');
  }
  // l = [hipX, kneeX, kneeY, footX, footY]
  function heroLeg(g, l, back) {
    const c = back ? [H.suitD, H.suitD, H.suitM] : [H.suitM, H.suit, H.suitL];
    limb(g, l[0], 29, l[1], l[2], 6.4, c[0], c[1], c[2]);
    limb(g, l[1], l[2], l[3], l[4] - 4, 5.6, c[0], c[1], c[2]);
    ell(g, l[1], l[2], 3.3, 3.2, back ? H.suitD : H.suitM);
    // boot with cuff and toe cap
    const bx = l[3], by = l[4];
    poly(g, [[bx - 2.8, by - 8], [bx + 2.6, by - 8], [bx + 3, by - 3.5], [bx + 6.2, by - 1.6], [bx + 6, by + 0.2], [bx - 3, by + 0.2]], lg(g, 0, by - 8, 0, by, [[0, H.bootL], [0.3, H.boots], [1, '#070f40']]));
    rrect(g, bx - 3.2, by - 9, 6.6, 2.2, 0.8, H.cuff);
    line(g, bx - 2.4, by - 0.2, bx + 5.6, by - 0.2, 0.9, '#050a30');
  }
  function heroTorso(g, o) {
    // trapezoid chest with waist taper
    const sh = lg(g, 8, 14, 24, 30, [[0, H.suitL], [0.35, H.suit], [1, H.suitD]]);
    poly(g, [[8, 15], [11, 13.6], [21, 13.6], [24, 15], [22.5, 22], [20.5, 29.5], [11.5, 29.5], [9.5, 22]], sh);
    // pecs and abs shading
    ell(g, 13.2, 19.5, 4, 3.2, 'rgba(111,180,255,0.35)');
    ell(g, 19, 19.5, 4, 3.2, 'rgba(111,180,255,0.25)');
    line(g, 16, 16, 16, 25, 0.6, 'rgba(10,20,90,0.5)');
    for (let i = 0; i < 3; i++) { line(g, 13.4, 23.4 + i * 1.8, 18.6, 23.4 + i * 1.8, 0.5, 'rgba(10,20,90,0.45)'); }
    line(g, 10, 17, 9.8, 22, 0.8, 'rgba(10,20,90,0.5)');
    // belt + buckle
    rrect(g, 10.5, 27.6, 11, 2.6, 0.8, lg(g, 0, 27, 0, 30, [[0, '#e6f6ff'], [1, '#6a8fc8']]));
    rrect(g, 14.6, 27.2, 2.8, 3.2, 0.6, '#ffe14a');
    // glowing A emblem
    const gl = g.createRadialGradient(16, 19.6, 0.5, 16, 19.6, 6.5);
    gl.addColorStop(0, 'rgba(159,240,255,0.95)'); gl.addColorStop(0.5, 'rgba(79,200,255,0.5)'); gl.addColorStop(1, 'rgba(79,200,255,0)');
    g.fillStyle = gl; g.fillRect(8, 13, 16, 14);
    g.fillStyle = '#ffffff';
    poly(g, [[16, 15.6], [19.4, 24], [17.6, 24], [16.9, 22], [15.1, 22], [14.4, 24], [12.6, 24]], '#ffffff');
    poly(g, [[16, 18.2], [16.7, 20.4], [15.3, 20.4]], '#2f6bff');
    line(g, 13.4, 22.8, 18.6, 22.8, 0.5, '#bff4ff');
  }
  function heroHead(g, dx, dy) {
    dx = dx || 0; dy = dy || 0;
    g.save(); g.translate(dx, dy);
    if (FEM) {
      poly(g, [[12, 5], [9, 8], [5.4, 13], [4.6, 19], [7.4, 21.6], [9.6, 15.6], [11.4, 10.6]], lg(g, 5, 5, 12, 20, [[0, '#d06a9a'], [1, '#5a1f4f']]));
      poly(g, [[11.2, 6], [10.6, 12], [12.4, 15], [13.6, 9]], '#6a2358');
    }
    rrect(g, 14.2, 11.6, 4.4, 3.6, 1, H.skinD);                       // neck
    ell(g, 16.8, 8, 5.2, 5.6, lg(g, 12, 3, 21, 13, [[0, '#ffd2ad'], [1, H.skin]])); // face
    poly(g, [[12.4, 9], [21.2, 9], [20, 13], [17.2, 14.4], [14, 13]], lg(g, 0, 9, 0, 14, [[0, H.skin], [1, H.skinD]])); // jaw
    // hair swoop
    poly(g, [[11.2, 8.4], [11, 4.4], [13.4, 1.6], [17.6, 0.8], [21.6, 2.4], [22.4, 5], [20.6, 4.2], [17.6, 3.2], [14.6, 4.6], [13.4, 8.2]], lg(g, 11, 1, 22, 8, [[0, H.hairL], [0.5, H.hair], [1, '#07072a']]));
    line(g, 14, 3.4, 19.4, 2.2, 0.7, 'rgba(160,170,255,0.7)');
    if (FEM) {
      poly(g, [[11, 8.4], [10.6, 4], [13.4, 1.2], [17.8, 0.4], [22, 2.2], [22.8, 5.4], [20.4, 3.6], [17.6, 3], [14.8, 4.4], [13.2, 9.6]], lg(g, 11, 1, 22, 8, [[0, '#e07cb0'], [0.5, '#7a2a64'], [1, '#3a0f38']]));
      ell(g, 12.2, 3.2, 1.8, 1.6, '#2f6bff');
      line(g, 14, 3, 19.6, 1.8, 0.7, 'rgba(255,190,230,0.75)');
    }
    // sunglasses
    rrect(g, 13.2, 6.6, 9.4, 3.4, 1.2, '#06103a');
    poly(g, [[14, 7.2], [18.6, 7.2], [18, 9.4], [14.4, 9.4]], lg(g, 14, 7, 18, 10, [[0, '#9ff0ff'], [1, '#1a8fe0']]));
    poly(g, [[19.2, 7.2], [22, 7.2], [21.6, 9.4], [19, 9.4]], lg(g, 19, 7, 22, 10, [[0, '#9ff0ff'], [1, '#1a8fe0']]));
    line(g, 14.6, 7.5, 16.4, 7.5, 0.6, '#ffffff');
    // brow, nose, smirk
    line(g, 19.4, 5.8, 22, 5.6, 0.7, H.hair);
    line(g, 20.2, 10.4, 20.8, 11.4, 0.5, H.skinD);
    line(g, 17.6, 12.5, 20.6, 12.1, FEM ? 0.9 : 0.7, FEM ? '#ff3f8f' : '#a24b44');
    if (FEM) line(g, 20.6, 6.4, 22.4, 5.8, 0.5, '#14133f');
    g.restore();
  }
  function heroShoulder(g, x, y, big) {
    ell(g, x, y, big ? 3.6 : 3.2, 3, lg(g, x - 3, y - 3, x + 3, y + 3, [[0, H.suitL], [1, H.suitM]]));
  }
  function heroArm(g, sh, el, hand, front, fist) {
    const c = front ? [H.suitM, H.suit, H.suitL] : [H.suitD, H.suitD, H.suitM];
    limb(g, sh[0], sh[1], el[0], el[1], 5, c[0], c[1], c[2]);
    limb(g, el[0], el[1], hand[0], hand[1], 4.4, c[0], c[1], c[2]);
    const dx = hand[0] - el[0], dy = hand[1] - el[1], d = Math.hypot(dx, dy) || 1;
    const cxp = hand[0] - (dx / d) * 1.6, cyp = hand[1] - (dy / d) * 1.6;
    ell(g, cxp, cyp, 2.8, 2.8, front ? H.cuff : '#5a88c8');
    ell(g, hand[0] + (dx / d) * 1.2, hand[1] + (dy / d) * 1.2, fist ? 2.9 : 2.5, fist ? 2.9 : 2.5, front ? H.skin : H.skinD);
  }
  function hero(o) {
    return function (g) {
      heroCape(g, o.flare, o.capeLen);
      heroArm(g, o.back[0], o.back[1], o.back[2], false, false);
      heroLeg(g, o.legs[0], true);
      heroLeg(g, o.legs[1], false);
      heroTorso(g, o);
      heroShoulder(g, 22.6, 15.6, true);
      heroShoulder(g, 9.4, 15.6, false);
      heroArm(g, o.front[0], o.front[1], o.front[2], true, o.fist);
      heroHead(g, o.hx, o.hy);
      if (o.punchFx) {
        const gr = g.createRadialGradient(30, o.punchFx, 0, 30, o.punchFx, 5);
        gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.5, 'rgba(127,232,255,0.55)'); gr.addColorStop(1, 'rgba(127,232,255,0)');
        g.fillStyle = gr; g.fillRect(24, o.punchFx - 6, 8, 12);
      }
    };
  }
  let FEM = false;
  function regHero(P, fem) {
    FEM = fem;
    const BK = [[10, 16], [9, 22], [10.4, 28]];
    const IDLE_LEGS = [[13, 13.4, 38, 12.4, 47], [19, 19.2, 38, 20, 47]];
    reg2(P + 'idle', 32, 48, hero({ flare: 2, capeLen: 42, legs: IDLE_LEGS, back: BK, front: [[22.6, 16], [23.6, 22], [23.4, 28]], hx: 0 }));
    const RUN = [
      [[13, 9.6, 37, 6, 45], [19, 22, 36, 25.4, 44]],
      [[13, 11.4, 38, 10.6, 46], [19, 21, 38, 22.4, 45]],
      [[13, 17, 36, 21, 44], [19, 15, 38, 9.6, 45]],
      [[13, 14.6, 38, 15.6, 45], [19, 18.6, 38, 18, 46]]
    ];
    RUN.forEach((l, i) => reg2(P + 'run' + i, 32, 48, hero({ flare: 8, capeLen: 40, legs: l, back: [[10, 16], [6, 20], [4, 25]], front: [[22.6, 16], [26, 19], [29.6, 18]], fist: true, hx: 1 })));
    reg2(P + 'jump', 32, 48, hero({ flare: 6, capeLen: 42, legs: [[13, 8, 36, 9, 42], [19, 24, 34, 22, 43]], back: [[10, 16], [7, 12], [8, 7]], front: [[22.6, 16], [25, 11], [26.4, 5]], fist: true }));
    reg2(P + 'attack', 32, 48, hero({ flare: 5, capeLen: 40, legs: [[13, 8, 38, 6.4, 47], [19, 24, 38, 26, 47]], back: [[10, 16], [8, 20], [11, 21]], front: [[22.6, 16.4], [26.4, 18], [30.6, 17.6]], fist: true, hx: 1, punchFx: 17.6 }));
    reg2(P + 'shield', 32, 48, hero({ flare: 0, capeLen: 42, legs: [[13, 12, 38, 9, 47], [19, 21.6, 38, 24, 47]], back: [[10, 16], [8, 22], [11, 26]], front: [[22.6, 16], [26, 15.4], [28.6, 15.8]], fist: true, hx: 0 }));
    reg2(P + 'fly', 32, 48, function (g) {
      // horizontal superhero flight pose facing right
      poly(g, [[14, 18], [2, 14], [0.8, 20], [1.6, 26], [14, 26]], lg(g, 0, 14, 14, 26, [[0, H.capeD], [0.5, H.cape], [1, H.capeL]]));
      line(g, 12, 19, 3, 16.5, 0.8, 'rgba(8,16,70,0.55)'); line(g, 12, 22, 2.4, 22, 0.8, 'rgba(8,16,70,0.55)');
      line(g, 12, 25, 3, 26, 0.7, 'rgba(120,170,255,0.5)');
      limb(g, 7, 25, 1.4, 28, 5.4, H.suitD, H.suitD, H.suitM);                                      // back leg
      poly(g, [[0.4, 26], [3.6, 25], [4.6, 31], [0.6, 31.4]], lg(g, 0, 25, 4, 31, [[0, H.bootL], [1, H.boots]]));
      limb(g, 8, 24, 3, 26, 5.6, H.suitM, H.suit, H.suitL);                                         // front leg
      poly(g, [[0, 23.6], [3.4, 23.2], [4.2, 29], [0.4, 29.4]], lg(g, 0, 23, 4, 29, [[0, H.bootL], [1, H.boots]]));
      poly(g, [[8, 19], [12, 17.4], [23, 18.4], [25, 21], [23, 26.4], [9, 26]], lg(g, 8, 17, 22, 26, [[0, H.suitL], [0.4, H.suit], [1, H.suitD]]));
      rrect(g, 13.2, 18, 2.6, 8.4, 1, lg(g, 0, 18, 0, 27, [[0, '#e6f6ff'], [1, '#6a8fc8']]));
      const gl = g.createRadialGradient(19.6, 22, 0.5, 19.6, 22, 5);
      gl.addColorStop(0, 'rgba(159,240,255,0.95)'); gl.addColorStop(1, 'rgba(79,200,255,0)');
      g.fillStyle = gl; g.fillRect(14, 16, 12, 12);
      poly(g, [[22, 20], [19, 24], [20.2, 24], [20.9, 22.6], [22.4, 22.6]], '#ffffff');
      ell(g, 24, 18.6, 3.2, 3, lg(g, 21, 16, 26, 21, [[0, H.suitL], [1, H.suitM]]));
      limb(g, 24, 18.6, 28.4, 17.6, 4.6, H.suitM, H.suit, H.suitL);                                 // reaching arm
      limb(g, 28.4, 17.6, 31.4, 16.6, 4, H.suitM, H.suit, H.suitL);
      ell(g, 30, 17, 2.6, 2.6, H.cuff); ell(g, 31.3, 16.8, 2.5, 2.5, H.skin);
      rrect(g, 21.6, 20.6, 3.6, 3, 1, H.skinD);                                                      // neck
      g.save(); g.translate(9.4, 10.4);
      heroHead(g, 0, 0);
      g.restore();
    });

    FEM = false;
  }
  regHero('hero_', false);
  regHero('hero_f_', true);
  reg2('shield_fx', 20, 52, function (g) {
    const gr = g.createLinearGradient(2, 0, 18, 0);
    gr.addColorStop(0, 'rgba(39,224,255,0.05)'); gr.addColorStop(0.6, 'rgba(39,224,255,0.4)'); gr.addColorStop(1, 'rgba(180,250,255,0.85)');
    g.beginPath(); g.ellipse(10, 26, 9, 24.5, 0, -Math.PI / 2, Math.PI / 2); g.lineTo(10, 1.5); g.closePath(); g.fillStyle = gr; g.fill();
    g.lineWidth = 1.4; g.strokeStyle = '#e8fbff'; g.beginPath(); g.ellipse(10, 26, 9, 24.5, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.lineWidth = 0.7; g.strokeStyle = 'rgba(232,251,255,0.7)';
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(10, 26 + i * 8); g.lineTo(18.6 - Math.abs(i) * 2.2, 26 + i * 8); g.stroke(); }
    // padlock
    rrect(g, 11.6, 23, 6, 5, 1, '#ffffff');
    g.lineWidth = 1.1; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(14.6, 23, 1.9, Math.PI, 0); g.stroke();
    ell(g, 14.6, 25.4, 0.8, 0.8, '#1a8fe0');
  }, { shade: 0, noOutline: true, glow: '#27e0ff' });

  /* ------------------------------------------------------------------ ENEMIES (hi-res) */
  const E = { p1: '#8a4cf0', p2: '#4a2399', p3: '#c39bff', pd: '#24104f', red: '#ff2a4a', steel: '#d4d6ec', steelD: '#7a7ea0' };
  function eyeGlow(g, x, y, r, col) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r * 2.6);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.25, col); gr.addColorStop(1, 'rgba(255,42,74,0)');
    g.fillStyle = gr; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  }
  function robotFrame(step) {
    return function (g) {
      const o = step ? 2.4 : 0;
      // legs
      limb(g, 12, 25, 10.4 + o, 31, 5.4, E.pd, E.p2, E.p1);
      poly(g, [[6.6 + o, 31], [14.6 + o, 31], [15.4 + o, 36.4], [5.4 + o, 36.4]], lg(g, 0, 31, 0, 37, [[0, E.p1], [1, E.pd]]));
      limb(g, 20, 25, 21.6 - o, 31, 5.4, E.pd, E.p2, E.p1);
      poly(g, [[16.6 - o, 31], [24.6 - o, 31], [25.4 - o, 36.4], [15.4 - o, 36.4]], lg(g, 0, 31, 0, 37, [[0, E.p1], [1, E.pd]]));
      // arms
      limb(g, 5.6, 14.4, 3.4, 22, 4.6, E.pd, E.p2, E.p1);
      ell(g, 3.2, 23.8, 3, 3, lg(g, 0, 21, 0, 27, [[0, E.steel], [1, E.steelD]]));
      limb(g, 26.4, 14.4, 28.6, 22, 4.6, E.pd, E.p2, E.p1);
      ell(g, 28.8, 23.8, 3, 3, lg(g, 0, 21, 0, 27, [[0, E.steel], [1, E.steelD]]));
      // torso
      rrect(g, 7, 12, 18, 15, 3.4, lg(g, 7, 12, 25, 27, [[0, E.p3], [0.35, E.p1], [1, E.pd]]));
      line(g, 9, 24, 23, 24, 0.9, 'rgba(20,6,60,0.7)');
      line(g, 9, 13.4, 23, 13.4, 0.9, 'rgba(232,215,255,0.75)');
      rrect(g, 10.4, 16, 11, 6, 2, '#1a0a30');
      eyeGlow(g, 16, 19, 1.5, E.red);
      ell(g, 16, 19, 1.8, 1.8, E.red); ell(g, 15.6, 18.6, 0.6, 0.6, '#ffffff');
      // rivets
      [[8.8, 14.4], [23.2, 14.4], [8.8, 25], [23.2, 25]].forEach((p) => ell(g, p[0], p[1], 0.6, 0.6, E.steel));
      // shoulder pads
      ell(g, 6, 13.6, 4, 3.4, lg(g, 2, 10, 10, 17, [[0, E.p3], [1, E.p2]]));
      ell(g, 26, 13.6, 4, 3.4, lg(g, 22, 10, 30, 17, [[0, E.p3], [1, E.p2]]));
      // head
      rrect(g, 9.4, 1.6, 13.2, 10.6, 3.4, lg(g, 9, 1, 23, 12, [[0, E.p3], [0.4, E.p1], [1, E.p2]]));
      rrect(g, 11, 4.6, 10, 4.6, 1.8, '#12062a');
      eyeGlow(g, 13.8, 6.9, 1.2, E.red); eyeGlow(g, 18.2, 6.9, 1.2, E.red);
      ell(g, 13.8, 6.9, 1.4, 1.4, E.red); ell(g, 18.2, 6.9, 1.4, 1.4, E.red);
      line(g, 12.6, 5.4, 15, 5.8, 0.6, '#ffb0c0'); line(g, 19.4, 5.4, 17, 5.8, 0.6, '#ffb0c0');
      line(g, 16, 1.8, 16, -0.2, 0.8, E.steel); ell(g, 16, 0.3, 1.2, 1.2, E.red);
      ell(g, 9.2, 7, 1.4, 2.4, E.steelD); ell(g, 22.8, 7, 1.4, 2.4, E.steelD);
    };
  }
  reg2('robot_0', 32, 37, robotFrame(0), { shade: 0.5 });
  reg2('robot_1', 32, 37, robotFrame(1), { shade: 0.5 });

  function droneFrame(f) {
    return function (g) {
      // rotor mast and blades
      line(g, 16, 7, 16, 3.4, 1.4, E.steelD);
      if (f) { poly(g, [[1, 3], [31, 2.6], [31, 3.8], [1, 4.2]], 'rgba(232,232,248,0.8)'); }
      else { poly(g, [[7, 2.2], [25, 3.8], [25, 4.6], [7, 3.2]], E.steel); poly(g, [[5, 4.4], [27, 2.2], [27, 3], [5, 5.2]], 'rgba(212,214,236,0.45)'); }
      ell(g, 16, 3.4, 1.8, 1.2, E.steel);
      // landing skids and legs
      limb(g, 8, 15, 5.4, 20.4, 2, E.steelD, E.steelD, null); limb(g, 24, 15, 26.6, 20.4, 2, E.steelD, E.steelD, null);
      rrect(g, 2.6, 20.4, 7.6, 2, 1, E.steel); rrect(g, 21.8, 20.4, 7.6, 2, 1, E.steel);
      // body
      rrect(g, 6, 6.6, 20, 10.4, 3.6, lg(g, 6, 6, 26, 17, [[0, '#f0f0ff'], [0.4, '#b5b8c9'], [1, '#5c6080']]));
      line(g, 8, 8, 24, 8, 0.8, 'rgba(255,255,255,0.85)');
      line(g, 8, 15.4, 24, 15.4, 0.9, 'rgba(40,40,70,0.6)');
      rrect(g, 8.4, 9.2, 15.2, 5, 2, '#14062a');
      eyeGlow(g, 12.6, 11.7, 1.2, E.red); eyeGlow(g, 19.4, 11.7, 1.2, E.red);
      ell(g, 12.6, 11.7, 1.5, 1.5, E.red); ell(g, 19.4, 11.7, 1.5, 1.5, E.red);
      ell(g, 12.2, 11.2, 0.5, 0.5, '#fff'); ell(g, 19, 11.2, 0.5, 0.5, '#fff');
      // sensor and thruster glow
      ell(g, 16, 16.8, 2.2, 1.2, '#ff7ad9');
      g.globalAlpha = 0.5; ell(g, 16, 18.6, 2, 2.2, '#ff7ad9'); g.globalAlpha = 1;
    };
  }
  reg2('drone_0', 32, 24, droneFrame(0), { shade: 0.5 });
  reg2('drone_1', 32, 24, droneFrame(1), { shade: 0.5 });

  function spiderFrame(f) {
    return function (g) {
      const legs = [[10, 9, 3, 13, 3.4], [13, 10, 6, 17, 4], [19, 10, 25.4, 13, 28.6], [22, 9, 26, 17, 31]];
      void legs;
      for (let i = 0; i < 4; i++) {
        const phase = (i + f) % 2 ? 1.8 : 0;
        const bx = 10 + i * 3.4, fx = 4 + i * 7.6 + (i > 1 ? 1 : 0);
        // left-side legs (behind) and right-side legs
        limb(g, bx, 11, fx - 1, 7.4 - phase * 0.4, 2, '#4a0f5a', '#5a1470', null);
        limb(g, fx - 1, 7.4 - phase * 0.4, fx - 2.6, 18.6 - phase, 1.8, '#4a0f5a', '#5a1470', null);
        limb(g, bx + 1.6, 11.4, fx + 2, 8 + phase * 0.3, 2, '#7a1a8a', '#a722b5', '#ff7ad9');
        limb(g, fx + 2, 8 + phase * 0.3, fx + 0.6, 19 - phase * 0.6, 1.8, '#7a1a8a', '#a722b5', '#ff7ad9');
      }
      // abdomen + carapace
      ell(g, 13, 9.4, 7.6, 5.8, lg(g, 6, 3, 20, 15, [[0, '#ff7ad9'], [0.4, '#c02cc9'], [1, '#4a0f5a']]));
      ell(g, 13, 8.2, 3, 1.8, 'rgba(255,255,255,0.35)');
      poly(g, [[10, 8], [13, 6], [16, 8], [13, 12]], '#ffd23f');
      ell(g, 13, 9, 1.4, 1.4, '#ff2a4a');
      // head
      ell(g, 22.6, 10, 5, 4.4, lg(g, 18, 5, 27, 15, [[0, '#e070ee'], [1, '#6a1a7a']]));
      rrect(g, 21, 7.6, 7, 3.4, 1.4, '#14062a');
      eyeGlow(g, 23.4, 9.2, 0.9, E.red); eyeGlow(g, 26, 9.2, 0.9, E.red);
      ell(g, 23.4, 9.2, 1.1, 1.1, E.red); ell(g, 26, 9.2, 1.1, 1.1, E.red);
      poly(g, [[27, 11.6], [29.6, 13.4], [28, 11]], '#f0f0ff'); poly(g, [[25, 12.4], [26.6, 14.6], [26, 12]], '#f0f0ff');
    };
  }
  reg2('spider_0', 32, 20, spiderFrame(0), { shade: 0.4 });
  reg2('spider_1', 32, 20, spiderFrame(1), { shade: 0.4 });

  function bossFrame(mode) {
    return function (g) {
      const stun = mode === 'stun', atk = mode === 'attack';
      const eye = stun ? '#6a6a80' : '#ff2a4a';
      const up = atk ? 10 : 0;
      const A = { a: '#7a3fe0', b: '#4a1f9a', c: '#b48cff', d: '#1d0a48' };
      // legs
      limb(g, 23, 58, 22, 70, 11, A.d, A.b, A.a);
      poly(g, [[14, 70], [30, 70], [32, 79.6], [11, 79.6]], lg(g, 0, 70, 0, 80, [[0, A.a], [1, A.d]]));
      limb(g, 41, 58, 42, 70, 11, A.d, A.b, A.a);
      poly(g, [[34, 70], [50, 70], [53, 79.6], [32, 79.6]], lg(g, 0, 70, 0, 80, [[0, A.a], [1, A.d]]));
      // arms
      limb(g, 9, 28, 8, 42 - up, 10, A.d, A.b, A.a);
      limb(g, 8, 42 - up, 8, 52 - up, 9, A.d, A.b, A.a);
      ell(g, 8, 56 - up, 6.4, 6, lg(g, 2, 50 - up, 14, 62 - up, [[0, '#f0f0ff'], [1, '#6a6e90']]));
      limb(g, 55, 28, 56, 42 - up, 10, A.d, A.b, A.a);
      limb(g, 56, 42 - up, 56, 52 - up, 9, A.d, A.b, A.a);
      ell(g, 56, 56 - up, 6.4, 6, lg(g, 50, 50 - up, 62, 62 - up, [[0, '#f0f0ff'], [1, '#6a6e90']]));
      if (atk) { [8, 56].forEach((x) => { const gr = g.createRadialGradient(x, 52, 0, x, 52, 9); gr.addColorStop(0, 'rgba(255,200,215,0.95)'); gr.addColorStop(1, 'rgba(255,42,74,0)'); g.fillStyle = gr; g.fillRect(x - 10, 42, 20, 20); }); }
      // torso
      poly(g, [[12, 24], [52, 24], [49, 40], [44, 60], [20, 60], [15, 40]], lg(g, 12, 24, 52, 60, [[0, A.c], [0.3, A.a], [1, A.d]]));
      rrect(g, 19, 29, 26, 24, 4, '#1a0a3a');
      rrect(g, 21, 31, 22, 20, 3, lg(g, 21, 31, 43, 51, [[0, A.b], [1, A.d]]));
      [[23, 34], [23, 38], [23, 42], [39, 34], [39, 38], [39, 42]].forEach((p) => { line(g, p[0], p[1], p[0] + 3, p[1], 0.8, stun ? '#555570' : '#ff7ad9'); });
      const core = stun ? '#555570' : '#ff5a7a';
      const cg = g.createRadialGradient(32, 41, 0, 32, 41, 11);
      cg.addColorStop(0, stun ? 'rgba(160,160,180,0.9)' : 'rgba(255,255,255,0.95)'); cg.addColorStop(0.35, core); cg.addColorStop(1, 'rgba(255,42,74,0)');
      g.fillStyle = cg; g.fillRect(20, 29, 24, 24);
      line(g, 14, 48, 50, 48, 0.8, 'rgba(13,4,40,0.6)');
      rrect(g, 20, 55.4, 24, 3.4, 1.4, '#c4e6ff');
      // shoulder pads
      ell(g, 9.6, 24.6, 8.6, 6.4, lg(g, 2, 18, 18, 31, [[0, A.c], [0.5, A.a], [1, A.b]]));
      ell(g, 54.4, 24.6, 8.6, 6.4, lg(g, 46, 18, 62, 31, [[0, A.c], [0.5, A.a], [1, A.b]]));
      [[5, 22], [9.6, 20], [14, 22]].forEach((p) => ell(g, p[0], p[1], 0.9, 0.9, '#f0f0ff'));
      [[50, 22], [54.4, 20], [59, 22]].forEach((p) => ell(g, p[0], p[1], 0.9, 0.9, '#f0f0ff'));
      // head
      rrect(g, 20, 3, 24, 21, 6, lg(g, 20, 3, 44, 24, [[0, A.c], [0.4, A.a], [1, A.b]]));
      rrect(g, 22.4, 8.6, 19.2, 9, 3, '#0d0424');
      [26.6, 37.4].forEach((x) => { if (!stun) { const eg = g.createRadialGradient(x, 13, 0, x, 13, 6); eg.addColorStop(0, 'rgba(255,255,255,0.95)'); eg.addColorStop(0.3, '#ff2a4a'); eg.addColorStop(1, 'rgba(255,42,74,0)'); g.fillStyle = eg; g.fillRect(x - 7, 6, 14, 14); } ell(g, x, 13, 3.2, 2.6, eye); });
      line(g, 24, 11, 29, 12, 0.9, stun ? '#8a8aa0' : '#ffb0c0'); line(g, 40, 11, 35, 12, 0.9, stun ? '#8a8aa0' : '#ffb0c0');
      rrect(g, 25, 19.4, 14, 3.4, 1.4, A.d);
      for (let i = 0; i < 5; i++) line(g, 27 + i * 2.5, 19.8, 27 + i * 2.5, 22.4, 0.5, '#b48cff');
      line(g, 32, 3.4, 32, 0, 1.1, '#d4d6ec'); ell(g, 32, 0.8, 1.6, 1.6, stun ? '#888' : '#ff2a4a');
      ell(g, 19.4, 13, 2.2, 4, '#6a6e90'); ell(g, 44.6, 13, 2.2, 4, '#6a6e90');
      if (stun) {
        [[7, 10], [53, 6], [45, 2], [20, 1]].forEach((p) => { poly(g, [[p[0], p[1] - 3.4], [p[0] + 1, p[1] - 1], [p[0] + 3.4, p[1]], [p[0] + 1, p[1] + 1], [p[0], p[1] + 3.4], [p[0] - 1, p[1] + 1], [p[0] - 3.4, p[1]], [p[0] - 1, p[1] - 1]], '#ffd23f'); });
      }
    };
  }
  reg2('boss_0', 64, 80, bossFrame('idle'), { shade: 0.5 });
  reg2('boss_attack', 64, 80, bossFrame('attack'), { shade: 0.5 });
  reg2('boss_stun', 64, 80, bossFrame('stun'), { shade: 0.5 });
  reg2('bolt', 22, 12, function (g) {
    const gr = g.createLinearGradient(0, 0, 22, 0);
    gr.addColorStop(0, 'rgba(255,42,74,0)'); gr.addColorStop(0.5, 'rgba(255,42,74,0.7)'); gr.addColorStop(1, '#ff2a4a');
    poly(g, [[0, 6], [8, 3], [18, 2], [21.6, 6], [18, 10], [8, 9]], gr);
    poly(g, [[6, 6], [12, 4.6], [19, 5], [19, 7], [12, 7.4]], '#ffb0c0');
    ell(g, 18, 6, 2.6, 2.6, '#ffffff');
  }, { shade: 0, noOutline: true, glow: '#ff2a4a' });

  /* ------------------------------------------------------------------ ITEMS (hi-res) */
  const FLAT = { shade: 0, noOutline: true };
  [['coin0', 12], ['coin1', 8], ['coin2', 4], ['coin3', 8]].forEach(function (c) {
    reg2(c[0], 14, 14, function (g) {
      const w = c[1] / 2;
      ell(g, 7, 7, w, 6.2, lg(g, 7 - w, 1, 7 + w, 13, [[0, '#fff3a0'], [0.4, '#ffd23f'], [1, '#c77800']]));
      if (w > 3) {
        ell(g, 7, 7, w - 1.3, 4.9, lg(g, 0, 2, 0, 12, [[0, '#ffe680'], [1, '#e89400']]));
        poly(g, [[7, 3.6], [9.4, 9.6], [8.3, 9.6], [7.8, 8.3], [6.2, 8.3], [5.7, 9.6], [4.6, 9.6]], '#a85a00');
        ell(g, 5.2, 3.8, 1.2, 0.7, 'rgba(255,255,255,0.9)', -0.5);
      } else {
        rrect(g, 6.2, 1.4, 1.6, 11.2, 0.6, '#ffe680');
      }
    }, { shade: 0.4 });
  });
  reg2('mfa', 20, 22, function (g) {
    const sh = [[10, 0.8], [18.4, 3], [18, 12.6], [14.4, 18], [10, 21.2], [5.6, 18], [2, 12.6], [1.6, 3]];
    poly(g, sh, lg(g, 2, 1, 18, 21, [[0, '#d8fbff'], [0.35, '#27e0ff'], [1, '#0a6fa8']]));
    poly(g, [[10, 3], [16, 4.6], [15.8, 12], [13, 16], [10, 18.4], [7, 16], [4.2, 12], [4, 4.6]], lg(g, 4, 3, 16, 18, [[0, '#1a5fe0'], [1, '#0a2a80']]));
    // key
    ell(g, 7.6, 9, 2.6, 2.6, '#e8fbff'); ell(g, 7.6, 9, 1.1, 1.1, '#0a2a80');
    rrect(g, 9.4, 8.2, 6, 1.7, 0.6, '#e8fbff'); rrect(g, 12.2, 9.4, 1.3, 2.6, 0.4, '#e8fbff'); rrect(g, 14.2, 9.4, 1.3, 2, 0.4, '#e8fbff');
    poly(g, [[10, 1.6], [13, 2.2], [6, 8], [4, 6]], 'rgba(255,255,255,0.35)');
  }, { shade: 0.4 });
  reg2('ring', 56, 72, function (g) {
    g.lineWidth = 5.4; g.strokeStyle = lg(g, 6, 4, 50, 68, [[0, '#fff3a0'], [0.4, '#ffb000'], [1, '#a85a00']]);
    g.beginPath(); g.ellipse(28, 36, 21.4, 31.4, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.6; g.strokeStyle = '#fff8d0';
    g.beginPath(); g.ellipse(28, 36, 22.6, 32.6, 0, Math.PI * 1.05, Math.PI * 1.55); g.stroke();
    g.lineWidth = 1; g.strokeStyle = 'rgba(120,60,0,0.6)';
    g.beginPath(); g.ellipse(28, 36, 18.8, 28.8, 0, 0.2, Math.PI * 0.9); g.stroke();
  }, { shade: 0.3 });
  reg2('laser_emit', 14, 10, function (g) {
    rrect(g, 0.6, 2, 12.8, 7.6, 1.6, lg(g, 0, 2, 0, 10, [[0, '#b4b8e0'], [0.4, '#5a5e8a'], [1, '#2a2c4c']]));
    rrect(g, 4.6, 0, 4.8, 4, 1.4, '#ff2a4a'); ell(g, 7, 1.4, 1.2, 0.9, '#ffffff');
    [[2, 5.4], [11.4, 5.4], [2, 8], [11.4, 8]].forEach((p) => ell(g, p[0], p[1], 0.5, 0.5, '#e8e8ff'));
  }, { shade: 0.4 });
  reg2('laser_beam', 8, 8, function (g) {
    const gr = g.createLinearGradient(0, 0, 8, 0);
    gr.addColorStop(0, 'rgba(255,42,74,0)'); gr.addColorStop(0.3, 'rgba(255,42,74,0.55)'); gr.addColorStop(0.5, '#ffd0d8'); gr.addColorStop(0.7, 'rgba(255,42,74,0.55)'); gr.addColorStop(1, 'rgba(255,42,74,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 8, 8);
    g.fillStyle = '#ffffff'; g.fillRect(3.4, 0, 1.2, 8);
  }, FLAT);
  function flag(on) {
    return function (g) {
      rrect(g, 2, 0, 2, 44, 0.8, lg(g, 2, 0, 4, 0, [[0, '#e6e8ff'], [1, '#6a6e90']]));
      ell(g, 3, 1, 2, 2, on ? '#e8fbff' : '#9a9ec0');
      poly(g, [[4, 3], [14, 4.6], [12, 7.4], [14, 10.2], [4, 11.4]], on ? lg(g, 4, 3, 14, 11, [[0, '#d8fbff'], [0.5, '#27e0ff'], [1, '#0a7fc8']]) : lg(g, 4, 3, 14, 11, [[0, '#8a8ab0'], [1, '#444466']]));
      if (on) { ell(g, 8, 7.2, 1.6, 1.6, '#ffffff'); }
      rrect(g, 0.4, 41, 5.2, 3, 1, '#555a80');
    };
  }
  reg2('flag_off', 16, 44, flag(false), { shade: 0.4 });
  reg2('flag_on', 16, 44, flag(true), { shade: 0.4 });
  reg2('terminal', 30, 40, function (g) {
    poly(g, [[3, 40], [27, 40], [26, 17], [4, 17]], lg(g, 0, 17, 0, 40, [[0, '#4a4a7c'], [1, '#1c1c3c']]));
    rrect(g, 3, 14, 24, 4, 1.4, '#8a8ab8');
    rrect(g, 4, 1, 22, 15, 2.4, '#0a1230');
    rrect(g, 6, 3, 18, 11, 1.4, lg(g, 6, 3, 24, 14, [[0, '#7fffd0'], [0.5, '#27e0ff'], [1, '#0a8fd8']]));
    [[8, 5, 7], [8, 7.6, 11], [8, 10.2, 5], [14.6, 10.2, 6]].forEach((l) => rrect(g, l[0], l[1], l[2], 1, 0.4, '#06203a'));
    ell(g, 21, 5.6, 1, 1, '#ff7ad9');
    rrect(g, 6, 21, 18, 2, 0.8, '#ff7ad9');
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) rrect(g, 6.4 + i * 6.2, 26 + j * 5.2, 5, 3.6, 1, lg(g, 0, 26 + j * 5, 0, 30 + j * 5, [[0, '#c8f4ff'], [1, '#4a9ac8']]));
  }, { shade: 0.4 });
  reg2('gate', 20, 16, function (g) {
    g.fillStyle = 'rgba(255,42,74,0.22)'; g.fillRect(0, 0, 20, 16);
    for (let x = 1; x < 20; x += 10) {
      const gr = g.createLinearGradient(x, 0, x + 8, 0);
      gr.addColorStop(0, 'rgba(255,42,74,0)'); gr.addColorStop(0.5, '#ff2a4a'); gr.addColorStop(1, 'rgba(255,42,74,0)');
      g.fillStyle = gr; g.fillRect(x, 0, 8, 16);
      g.fillStyle = '#ffffff'; g.fillRect(x + 3.4, 0, 1.2, 16);
    }
    g.fillStyle = 'rgba(255,42,74,0.9)'; g.fillRect(0, 6.6, 20, 1.6);
    g.fillStyle = '#ffd0d8'; g.fillRect(0, 7.2, 20, 0.6);
  }, FLAT);
  reg2('cable', 16, 10, function (g) {
    rrect(g, 0, 3.4, 16, 5.6, 2.4, lg(g, 0, 3, 0, 9, [[0, '#4a4a7a'], [0.5, '#1a1a3a'], [1, '#0a0a1e']]));
    rrect(g, 1.6, 4.6, 4, 3, 1, lg(g, 0, 4, 0, 8, [[0, '#fff3a0'], [1, '#e89400']]));
    rrect(g, 8.4, 4.6, 4, 3, 1, lg(g, 0, 4, 0, 8, [[0, '#ffb0ec'], [1, '#c02cc9']]));
    g.fillStyle = '#ffffff'; g.fillRect(5.4, 0, 1, 4); g.fillRect(11, 1, 1, 3);
    ell(g, 6, 1.6, 1.3, 1.3, '#7fe8ff'); ell(g, 11.5, 1.6, 1, 1, '#ff7ad9');
  }, { shade: 0.4 });
  reg2('portal', 40, 72, function (g) {
    const pts = [];
    for (let y = 0; y <= 72; y += 4) pts.push([20 + (6 + Math.sin((y / 72) * Math.PI) * 13), y]);
    for (let y = 72; y >= 0; y -= 4) pts.push([20 - (6 + Math.sin((y / 72) * Math.PI) * 13), y]);
    poly(g, pts, lg(g, 0, 0, 40, 0, [[0, 'rgba(39,224,255,0.25)'], [0.5, 'rgba(232,251,255,0.9)'], [1, 'rgba(39,224,255,0.25)']]));
    g.lineWidth = 0.8; g.strokeStyle = 'rgba(255,255,255,0.7)';
    for (let i = -2; i <= 2; i++) { g.beginPath(); for (let y = 0; y <= 72; y += 4) { const x = 20 + i * (3 + Math.sin((y / 72) * Math.PI) * 4); y === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  }, FLAT);
  reg2('blast', 24, 14, function (g) {
    const tr = g.createLinearGradient(0, 0, 24, 0);
    tr.addColorStop(0, 'rgba(39,224,255,0)'); tr.addColorStop(0.7, 'rgba(39,224,255,0.65)'); tr.addColorStop(1, '#e8fbff');
    poly(g, [[0, 7], [10, 2.6], [20, 1.4], [23.6, 7], [20, 12.6], [10, 11.4]], tr);
    poly(g, [[8, 7], [14, 4.8], [21, 5], [21, 9], [14, 9.2]], '#e8fbff');
    ell(g, 20, 7, 3.4, 3.4, '#ffffff');
  }, { shade: 0, noOutline: true });
  reg('spark', 4, 4, function (g) { R(g, '#ffffff', 0, 0, 4, 4); }, true);
  reg('spark_y', 4, 4, function (g) { R(g, '#ffd23f', 0, 0, 4, 4); }, true);
  reg('spark_c', 4, 4, function (g) { R(g, '#27e0ff', 0, 0, 4, 4); }, true);
  reg2('btn', 56, 56, function (g) {
    ell(g, 28, 28, 27, 27, 'rgba(10,7,32,0.55)');
    g.lineWidth = 2; g.strokeStyle = '#27e0ff'; g.beginPath(); g.arc(28, 28, 26, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 0.8; g.strokeStyle = 'rgba(232,251,255,0.7)'; g.beginPath(); g.arc(28, 28, 22.6, 0, Math.PI * 2); g.stroke();
  }, FLAT);
  reg2('btn_down', 56, 56, function (g) {
    ell(g, 28, 28, 27, 27, 'rgba(39,224,255,0.55)');
    g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(28, 28, 26, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 0.8; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(28, 28, 22.6, 0, Math.PI * 2); g.stroke();
  }, FLAT);

  /* ------------------------------------------------------------------ TILES (hi-res) */
  function glowRect(g, c, x, y, w, h) {
    g.fillStyle = c; g.globalAlpha = 0.22; g.fillRect(x - 1.2, y - 1.2, w + 2.4, h + 2.4); g.globalAlpha = 1;
  }
  reg2('roof_top', 32, 8, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ffffff'], [0.12, '#ff7ad9'], [0.26, '#27e0ff'], [0.4, '#6a4ad8'], [1, '#2a1a70']]); g.fillRect(0, 0, 32, 8);
    for (let x = 0; x < 32; x += 8) { g.fillStyle = 'rgba(160,130,255,0.55)'; g.fillRect(x, 4, 4, 0.8); g.fillStyle = 'rgba(10,5,50,0.35)'; g.fillRect(x + 4, 5.4, 0.8, 2.6); }
  }, FLAT);
  reg2('roof', 32, 32, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#4a35a8'], [1, '#1a0e4c']]); g.fillRect(0, 0, 32, 32);
    // brick courses
    g.fillStyle = 'rgba(10,5,50,0.35)';
    for (let y = 0; y < 32; y += 4) { g.fillRect(0, y, 32, 0.6); for (let x = (y / 4) % 2 ? 0 : 4; x < 32; x += 8) g.fillRect(x, y, 0.6, 4); }
    g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(0, 0, 0.8, 32);
    for (let wy = 3; wy < 32; wy += 15) for (let wx = 3; wx < 32; wx += 15) {
      const lit = ((wx * 7 + wy * 3) % 5) < 2;
      rrect(g, wx - 0.8, wy - 0.8, 10.6, 10.6, 1, '#120a3c');
      if (lit) {
        glowRect(g, '#ffb000', wx, wy, 9, 9);
        g.fillStyle = lg(g, wx, wy, wx, wy + 9, [[0, '#fff3a0'], [1, '#ff9a20']]); g.fillRect(wx, wy, 9, 9);
        g.fillStyle = 'rgba(90,40,0,0.5)'; g.fillRect(wx + 4.4, wy, 0.7, 9); g.fillRect(wx, wy + 4.4, 9, 0.7);
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(wx + 0.6, wy + 0.6, 3, 1);
      } else {
        g.fillStyle = lg(g, wx, wy, wx + 9, wy + 9, [[0, '#6a56d8'], [1, '#231470']]); g.fillRect(wx, wy, 9, 9);
        g.fillStyle = 'rgba(10,5,60,0.6)'; g.fillRect(wx + 4.4, wy, 0.7, 9); g.fillRect(wx, wy + 4.4, 9, 0.7);
        g.fillStyle = 'rgba(180,200,255,0.4)'; g.fillRect(wx + 0.6, wy + 0.6, 2.4, 0.9);
      }
      g.fillStyle = '#6a56d8'; g.fillRect(wx - 1.4, wy + 9.4, 11.8, 1);
    }
  }, FLAT);
  reg2('rack_top', 32, 8, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#c8f8ff'], [0.15, '#27e0ff'], [0.3, '#6a6aa8'], [1, '#2a2a4c']]); g.fillRect(0, 0, 32, 8);
    for (let x = 2; x < 32; x += 8) { g.fillStyle = 'rgba(10,10,40,0.55)'; g.fillRect(x, 4.4, 5, 0.9); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x, 5.4, 5, 0.5); }
  }, FLAT);
  reg2('rack', 32, 32, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#34346a'], [1, '#1a1a3a']]); g.fillRect(0, 0, 32, 32);
    for (let y = 0; y < 32; y += 8) {
      g.fillStyle = '#0c0c26'; g.fillRect(1.4, y + 0.8, 29.2, 6);
      g.fillStyle = lg(g, 0, y + 1, 0, y + 7, [[0, '#4a4a80'], [1, '#26264c']]); g.fillRect(1.8, y + 1.2, 28.4, 5.2);
      for (let v = 0; v < 6; v++) { g.fillStyle = 'rgba(8,8,30,0.7)'; g.fillRect(4 + v * 1.8, y + 2.2, 0.8, 3.2); }
      const colors = ['#27e0ff', '#ff7ad9', '#4dff7a', '#ffd23f'];
      for (let k = 0; k < 4; k++) { const on = ((y * 3 + k * 5) % 7) < 4; const c = colors[(y / 8 + k) % 4]; if (on) glowRect(g, c, 18 + k * 3, y + 3, 1.6, 1.6); g.fillStyle = on ? c : '#2a2a50'; g.fillRect(18 + k * 3, y + 3, 1.6, 1.6); }
      g.fillStyle = '#8a8ab8'; g.fillRect(27.4, y + 2, 1.4, 1); g.fillRect(27.4, y + 4.4, 1.4, 1);
    }
  }, FLAT);
  reg2('rock_top', 32, 8, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ffe6ff'], [0.12, '#ff7ad9'], [0.3, '#8a5cd8'], [1, '#3a1a80']]); g.fillRect(0, 0, 32, 8);
    const r = rng(77);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(20,8,70,0.4)'; g.fillRect(Math.floor(r() * 28), 3 + Math.floor(r() * 4), 2 + r() * 4, 0.8); }
    for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(Math.floor(r() * 28), 1.6 + Math.floor(r() * 2), 1 + r() * 3, 0.7); }
  }, FLAT);
  reg2('rock', 32, 32, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#5a3aa8'], [0.6, '#33196e'], [1, '#1e0e4c']]); g.fillRect(0, 0, 32, 32);
    const r = rng(91);
    for (let y = 2; y < 32; y += 5) {
      g.fillStyle = 'rgba(14,5,56,0.45)'; g.fillRect(0, y + r() * 2, 32, 0.9);
      g.fillStyle = 'rgba(190,150,255,0.22)'; g.fillRect(0, y + 1 + r() * 2, 32, 0.6);
    }
    for (let i = 0; i < 9; i++) { const x = r() * 28, y = r() * 28; g.fillStyle = 'rgba(14,5,56,0.5)'; g.fillRect(x, y, 1 + r() * 3, 0.8); g.fillStyle = 'rgba(255,150,230,0.35)'; g.fillRect(x + 0.6, y + 1, 1 + r() * 2, 0.6); }
    for (let i = 0; i < 4; i++) { const x = 2 + r() * 26, y = 4 + r() * 24; ell(g, x, y, 1.2, 0.8, 'rgba(39,224,255,0.55)'); }
  }, FLAT);

  /* ------------------------------------------------------------------ BACKGROUNDS (hi-res) */
  function skyline(w, h, seed, body, accent, minH, maxH, winChance, wcols) {
    return function (g) {
      const r = rng(seed);
      const signs = ['#ff2fb0', '#27e0ff', '#ffe14a', '#4dff7a'];
      let x = 0;
      while (x < w) {
        let bw = 26 + Math.floor(r() * 36);
        if (w - x < 54) bw = w - x;
        const bh = minH + Math.floor(r() * (maxH - minH)), top = h - bh;
        g.fillStyle = lg(g, 0, top, 0, h, [[0, body], [0.7, lerpCol(body, '#4a1f90', 0.5)], [1, '#8a3aa8']]); g.fillRect(x, top, bw, bh);
        g.fillStyle = 'rgba(0,0,12,0.3)'; g.fillRect(x + bw * 0.72, top, bw * 0.28, bh);
        g.fillStyle = accent; g.fillRect(x, top, bw, 1.2);
        g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(x, top, 0.9, bh);
        const roof = r();
        if (roof > 0.7 && bw > 20) { g.fillStyle = body; g.fillRect(x + bw / 2 - 0.6, top - 16, 1.2, 16); ell(g, x + bw / 2, top - 16, 1.2, 1.2, '#ff2a4a'); glowRect(g, '#ff2a4a', x + bw / 2 - 1, top - 17, 2, 2); }
        else if (roof > 0.4 && bw > 24) { g.fillStyle = lg(g, 0, top - 6, 0, top, [[0, '#4a2aa0'], [1, '#22106a']]); g.fillRect(x + 4, top - 6, 11, 6); g.fillStyle = accent; g.fillRect(x + 4, top - 6, 11, 0.8); for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(8,4,40,0.6)'; g.fillRect(x + 5.4 + k * 2.4, top - 4.6, 0.8, 3.6); } }
        else if (roof > 0.25 && bw > 30) { g.fillStyle = '#22106a'; g.fillRect(x + bw / 2 - 4, top - 9, 8, 6); g.beginPath(); g.moveTo(x + bw / 2 - 5, top - 9); g.lineTo(x + bw / 2, top - 13); g.lineTo(x + bw / 2 + 5, top - 9); g.fill(); g.fillRect(x + bw / 2 - 3, top - 3, 0.9, 3); g.fillRect(x + bw / 2 + 2, top - 3, 0.9, 3); }
        for (let wy = top + 5; wy < h - 4; wy += 6) {
          for (let wx = x + 3.4; wx < x + bw - 4; wx += 5) {
            if (r() < winChance) {
              const c = wcols ? wcols[Math.floor(r() * wcols.length)] : (r() > 0.5 ? '#ff7ad9' : '#52e7ff');
              glowRect(g, c, wx, wy, 2.6, 3); g.fillStyle = c; g.fillRect(wx, wy, 2.6, 3); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(wx, wy, 2.6, 0.8);
            } else if (r() < 0.12) { g.fillStyle = 'rgba(255,200,100,0.75)'; g.fillRect(wx, wy, 2.6, 3); }
          }
        }
        if (r() > 0.68 && bh > 70) {
          const sc = signs[Math.floor(r() * signs.length)], sy = top + 12 + Math.floor(r() * 24);
          glowRect(g, sc, x + 2, sy, 3, 22);
          g.fillStyle = sc; g.fillRect(x + 2.2, sy, 2.6, 22); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(x + 2.9, sy, 0.9, 22);
          for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(10,4,40,0.6)'; g.fillRect(x + 2.2, sy + 4 + k * 6, 2.6, 0.7); }
        }
        x += bw;
      }
      // street haze at the base
      g.fillStyle = lg(g, 0, h - 30, 0, h, [[0, 'rgba(255,100,200,0)'], [1, 'rgba(255,120,200,0.35)']]); g.fillRect(0, h - 30, w, 30);
    };
  }
  reg2('bg_city_far', 640, 220, skyline(640, 220, 11, '#2a1070', '#8a4cff', 60, 170, 0.12), FLAT);
  reg2('bg_city_near', 640, 190, skyline(640, 190, 29, '#170a48', '#ff7ad9', 50, 150, 0.22), FLAT);

  function mesas(w, h, seed, col, edge, minH, maxH) {
    return function (g) {
      const r = rng(seed);
      const base = minH;
      const pts = [[0, h - base]];
      let x = 0;
      while (x < w - 50) {
        const pw = 40 + r() * 70, ph = minH + r() * (maxH - minH);
        pts.push([x + 6, h - base]); pts.push([x + 14, h - ph]); pts.push([x + pw - 14, h - ph]); pts.push([x + pw - 4, h - base]);
        x += pw;
      }
      pts.push([w, h - base]); pts.push([w, h]); pts.push([0, h]);
      poly(g, pts, lg(g, 0, h - maxH, 0, h, [[0, lerpCol(col, '#7a4ad8', 0.3)], [0.5, col], [1, lerpCol(col, '#ff6ab0', 0.25)]]));
      g.lineWidth = 1; g.strokeStyle = edge;
      g.beginPath(); pts.slice(0, -3).forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
      for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(10,4,50,0.25)'; g.fillRect(r() * w, h - maxH + r() * maxH, 8 + r() * 24, 0.8); }
      for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(255,150,220,0.2)'; g.fillRect(r() * w, h - maxH + r() * maxH, 6 + r() * 16, 0.6); }
    };
  }
  reg2('bg_dc_near', 640, 120, function (g) {
    g.fillStyle = lg(g, 0, 80, 0, 120, [[0, '#1a0c4a'], [1, '#0a0526']]); g.fillRect(0, 80, 640, 40);
    for (let x = 0; x < 640; x += 160) {
      g.fillStyle = lg(g, x, 0, x + 12, 0, [[0, '#4a2aa8'], [1, '#1a0c4a']]); g.fillRect(x, 20, 12, 100);
      g.fillStyle = '#ff7ad9'; g.fillRect(x, 20, 12, 1.4);
      glowRect(g, '#ff7ad9', x + 4, 30, 4, 4); g.fillStyle = '#ff7ad9'; g.fillRect(x + 4, 30, 4, 4);
      g.fillStyle = lg(g, 0, 40, 0, 50, [[0, '#5a3ac8'], [1, '#1a0c4a']]); g.fillRect(x, 40, 160, 10);
      g.fillStyle = 'rgba(39,224,255,0.6)'; g.fillRect(x + 20, 43, 30, 1);
      g.fillStyle = 'rgba(255,122,217,0.6)'; g.fillRect(x + 80, 46, 40, 1);
      for (let k = 0; k < 4; k++) { g.lineWidth = 1.6; g.strokeStyle = ['#27e0ff', '#ff7ad9', '#ffd23f', '#4dff7a'][k]; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x + 12, 52 + k * 5); g.quadraticCurveTo(x + 80, 66 + k * 5, x + 160, 52 + k * 5); g.stroke(); g.globalAlpha = 1; }
    }
  }, FLAT);

  /* ------------------------------------------------------------------ AZURE REGION WORLDS (landmarks) */
  const SKIES = {
    title: { stops: [[0, '#0d0430'], [0.3, '#2c1070'], [0.5, '#6a2aa8'], [0.66, '#d6379a'], [0.8, '#ff7a59'], [0.92, '#ffb85e'], [1, '#ffd98a']], sun: { x: 450, y: 215, r: 74, c: ['#fff6a0', '#ffb347', '#ff4fa0'] }, halo: ['rgba(255,210,120,0.55)', 'rgba(255,100,160,0.2)'], cl: ['rgba(120,50,190,0.5)', 'rgba(255,122,217,0.65)', 'rgba(255,200,150,0.5)'], hz: 'rgba(255,200,120,0.5)', stars: 160, seed: 3 },
    westeurope: { stops: [[0, '#14083a'], [0.35, '#4a1a8a'], [0.58, '#b83a9a'], [0.75, '#ff6a5a'], [0.9, '#ffa860'], [1, '#ffd890']], sun: { x: 330, y: 232, r: 62, c: ['#fff2a0', '#ffb060', '#ff5a8a'] }, halo: ['rgba(255,200,130,0.55)', 'rgba(255,100,140,0.2)'], cl: ['rgba(140,60,170,0.5)', 'rgba(255,130,160,0.65)', 'rgba(255,210,150,0.5)'], hz: 'rgba(255,190,120,0.5)', stars: 110, seed: 5 },
    uksouth: { stops: [[0, '#0a0c30'], [0.35, '#1c2a6a'], [0.58, '#4a4a9a'], [0.75, '#c05a9a'], [0.9, '#ff9a80'], [1, '#ffd0a0']], sun: { x: 500, y: 190, r: 44, c: ['#fff0d8', '#ffc8b8', '#e890c8'] }, halo: ['rgba(255,220,200,0.5)', 'rgba(200,140,255,0.2)'], cl: ['rgba(60,70,150,0.55)', 'rgba(255,160,200,0.55)', 'rgba(200,220,255,0.5)'], hz: 'rgba(255,180,160,0.5)', stars: 80, seed: 7, stripes: false },
    japaneast: { stops: [[0, '#12062e'], [0.3, '#3a0a5a'], [0.55, '#9a1a5a'], [0.75, '#e83a4a'], [0.9, '#ff8a5a'], [1, '#ffc880']], sun: { x: 420, y: 140, r: 66, c: ['#ff9a80', '#ff2a3a', '#c0103a'] }, halo: ['rgba(255,80,90,0.55)', 'rgba(255,60,120,0.2)'], cl: ['rgba(110,30,120,0.55)', 'rgba(255,100,130,0.65)', 'rgba(255,190,160,0.5)'], hz: 'rgba(255,160,110,0.5)', stars: 120, seed: 11, stripes: false },
    australiaeast: { stops: [[0, '#061a3a'], [0.3, '#1a3a7a'], [0.5, '#5a3a9a'], [0.68, '#ff5a8a'], [0.84, '#ff9a40'], [1, '#ffe070']], sun: { x: 360, y: 228, r: 80, c: ['#fffbb0', '#ffc840', '#ff7a30'] }, halo: ['rgba(255,230,120,0.6)', 'rgba(255,120,80,0.2)'], cl: ['rgba(60,80,170,0.5)', 'rgba(255,120,150,0.65)', 'rgba(255,220,140,0.5)'], hz: 'rgba(255,220,120,0.55)', stars: 120, seed: 13 },
    brazilsouth: { stops: [[0, '#1a0a40'], [0.32, '#5a1a8a'], [0.55, '#c02a8a'], [0.72, '#ff6a50'], [0.88, '#ffc030'], [1, '#d8ff70']], sun: { x: 420, y: 222, r: 70, c: ['#fffaa0', '#ffd030', '#ff8a30'] }, halo: ['rgba(255,240,120,0.6)', 'rgba(255,120,60,0.2)'], cl: ['rgba(130,40,150,0.5)', 'rgba(255,110,150,0.65)', 'rgba(255,230,120,0.5)'], hz: 'rgba(230,255,120,0.5)', stars: 90, seed: 17 },
    eastus: { stops: [[0, '#05051c'], [0.4, '#14104a'], [0.7, '#2c1a7a'], [1, '#5a2aa0']], sun: { x: 500, y: 92, r: 34, c: ['#ffffff', '#d8e0ff', '#a0b0f0'] }, halo: ['rgba(160,190,255,0.5)', 'rgba(120,120,255,0.15)'], cl: ['rgba(40,40,120,0.55)', 'rgba(140,120,255,0.5)', 'rgba(180,200,255,0.4)'], hz: 'rgba(160,120,255,0.45)', stars: 170, seed: 19, stripes: false }
  };

  function makeSky(P) {
    return function (g) {
      const sg = lg(g, 0, 0, 0, 360, P.stops);
      g.fillStyle = sg; g.fillRect(0, 0, 640, 360);
      const r = rng(P.seed);
      for (let i = 0; i < P.stars; i++) {
        const x = r() * 640, y = r() * 170, a = 0.35 + r() * 0.65, big = r() > 0.92;
        g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.fillRect(x, y, big ? 1.6 : 0.9, big ? 1.6 : 0.9);
        if (big) { g.fillStyle = 'rgba(200,220,255,0.55)'; g.fillRect(x - 2.2, y + 0.4, 6, 0.7); g.fillRect(x + 0.4, y - 2.2, 0.7, 6); }
      }
      const S = P.sun, sx = S.x, sy = S.y, sr = S.r;
      const halo = g.createRadialGradient(sx, sy, sr * 0.8, sx, sy, sr * 2.6);
      halo.addColorStop(0, P.halo[0]); halo.addColorStop(0.4, P.halo[1]); halo.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = halo; g.fillRect(sx - sr * 3, sy - sr * 3, sr * 6, sr * 6);
      g.save(); g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.clip();
      g.fillStyle = lg(g, 0, sy - sr, 0, sy + sr, [[0, S.c[0]], [0.5, S.c[1]], [1, S.c[2]]]); g.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      ell(g, sx - sr * 0.27, sy - sr * 0.4, sr * 0.46, sr * 0.3, 'rgba(255,255,230,0.28)');
      if (P.stripes !== false) { g.fillStyle = sg; for (let i = 0; i < 9; i++) g.fillRect(sx - sr, sy + 4 + i * 8.4, sr * 2, 0.8 + i * 0.5); }
      g.restore();
      const cr = rng(P.seed + 6);
      for (let i = 0; i < 9; i++) {
        const cx = cr() * 640, cy = 80 + cr() * 130, cw = 40 + cr() * 80;
        for (let k = 0; k < 5; k++) ell(g, cx + k * cw / 5, cy - Math.sin(k * 0.9) * 3, cw / 4, 4 + cr() * 3, P.cl[0]);
        g.fillStyle = P.cl[1]; g.fillRect(cx, cy + 3.6, cw, 1.2);
        g.fillStyle = P.cl[2]; g.fillRect(cx + 6, cy - 4.6, cw * 0.6, 0.8);
      }
      g.fillStyle = lg(g, 0, 290, 0, 360, [[0, 'rgba(255,160,100,0)'], [1, P.hz]]); g.fillRect(0, 290, 640, 70);
    };
  }
  reg2('bg_sky', 640, 360, makeSky(SKIES.title), FLAT);
  Object.keys(SKIES).forEach(function (k) { if (k !== 'title') reg2('bg_sky_' + k, 640, 360, makeSky(SKIES[k]), FLAT); });

  /* ---- shared landmark helpers (units: 1x px, base = ground y, s = scale) */
  function silFill(g, y0, y1, a, b) { return lg(g, 0, y0, 0, y1, [[0, a], [1, b]]); }
  function lit(g, x, y, w, h, c) { glowRect(g, c, x, y, w, h); g.fillStyle = c; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x, y, w, Math.min(0.8, h)); }
  function rim(g, x, y, h, c) { g.fillStyle = c; g.fillRect(x, y, 0.9, h); }

  function windmill(g, cx, base, s, P) {
    const body = silFill(g, base - 78 * s, base, P.top, P.bot);
    poly(g, [[cx - 15 * s, base], [cx - 9 * s, base - 62 * s], [cx + 9 * s, base - 62 * s], [cx + 15 * s, base]], body);
    poly(g, [[cx - 12 * s, base - 62 * s], [cx, base - 78 * s], [cx + 12 * s, base - 62 * s]], P.top);
    g.fillStyle = P.accent; g.fillRect(cx - 11 * s, base - 62 * s, 22 * s, 1.2);
    rim(g, cx - 14 * s, base - 62 * s, 62 * s, 'rgba(255,255,255,0.3)');
    lit(g, cx - 2 * s, base - 20 * s, 4 * s, 7 * s, P.win[0]);
    lit(g, cx - 2 * s, base - 40 * s, 4 * s, 6 * s, P.win[1]);
    const hy = base - 56 * s;
    for (let k = 0; k < 4; k++) {
      g.save(); g.translate(cx, hy); g.rotate(0.35 + k * Math.PI / 2);
      g.strokeStyle = P.top; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(48 * s, 0); g.stroke();
      g.fillStyle = 'rgba(20,8,70,0.55)'; g.fillRect(9 * s, 0.5, 38 * s, 10 * s);
      g.strokeStyle = P.accent; g.lineWidth = 0.6; g.strokeRect(9 * s, 0.5, 38 * s, 10 * s);
      for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(9 * s + i * 6.3 * s, 0.5); g.lineTo(9 * s + i * 6.3 * s, 10.5 * s); g.stroke(); }
      g.restore();
    }
    ell(g, cx, hy, 3 * s, 3 * s, P.accent);
  }

  function canalHouses(g, x0, x1, base, r, P, hmin, hmax, dark) {
    let x = x0;
    const hues = dark ? ['#1a0c4a', '#220f5a', '#2a1468'] : ['#34187a', '#4a1f86', '#5a2a96', '#3c1c80'];
    while (x < x1) {
      const w = 19 + Math.floor(r() * 9), h = hmin + Math.floor(r() * (hmax - hmin)), top = base - h;
      const col = hues[Math.floor(r() * hues.length)], gt = Math.floor(r() * 4);
      g.fillStyle = silFill(g, top, base, col, P.bot); g.fillRect(x, top, w, h);
      g.fillStyle = 'rgba(0,0,12,0.28)'; g.fillRect(x + w * 0.74, top, w * 0.26, h);
      if (gt === 0) { // stepped gable
        for (let k = 0; k < 4; k++) { const sw = w - k * (w * 0.22); g.fillStyle = col; g.fillRect(x + (w - sw) / 2, top - (k + 1) * 3, sw, 3.2); g.fillStyle = P.accent; g.fillRect(x + (w - sw) / 2, top - (k + 1) * 3, sw, 0.6); }
      } else if (gt === 1) { // bell gable
        g.fillStyle = col; g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(x + w * 0.1, top - 8, x + w * 0.3, top - 9); g.quadraticCurveTo(x + w * 0.5, top - 15, x + w * 0.7, top - 9); g.quadraticCurveTo(x + w * 0.9, top - 8, x + w, top); g.fill();
        g.strokeStyle = P.accent; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(x + w * 0.1, top - 8, x + w * 0.3, top - 9); g.quadraticCurveTo(x + w * 0.5, top - 15, x + w * 0.7, top - 9); g.quadraticCurveTo(x + w * 0.9, top - 8, x + w, top); g.stroke();
      } else if (gt === 2) { // spout gable
        poly(g, [[x + 1, top], [x + w / 2, top - 11], [x + w - 1, top]], col);
        g.fillStyle = P.accent; g.fillRect(x + w / 2 - 0.5, top - 13, 1, 4);
      } else { // neck gable with hoist beam
        g.fillStyle = col; g.fillRect(x + 3, top - 7, w - 6, 7); poly(g, [[x + 3, top - 7], [x + w / 2, top - 12], [x + w - 3, top - 7]], col);
        g.fillStyle = P.accent; g.fillRect(x + w / 2 - 0.5, top - 15, 2.5, 0.9); g.fillRect(x + w / 2 - 0.5, top - 15, 0.9, 4);
      }
      g.fillStyle = P.accent; g.fillRect(x, top, w, 0.9);
      rim(g, x, top, h, 'rgba(255,255,255,0.22)');
      for (let wy = top + 6; wy < base - 8; wy += 11) {
        for (let wx = x + 3; wx < x + w - 5; wx += 8) {
          if (r() < 0.62) lit(g, wx, wy, 3.6, 6, P.win[Math.floor(r() * P.win.length)]);
          else { g.fillStyle = 'rgba(8,4,40,0.6)'; g.fillRect(wx, wy, 3.6, 6); }
        }
      }
      x += w + 0.8;
    }
  }

  function westerkerk(g, cx, base, s, P) {
    const f = silFill(g, base - 150 * s, base, P.top, P.bot);
    g.fillStyle = f; g.fillRect(cx - 11 * s, base - 80 * s, 22 * s, 80 * s);
    g.fillRect(cx - 8 * s, base - 108 * s, 16 * s, 28 * s);
    g.fillRect(cx - 6 * s, base - 124 * s, 12 * s, 16 * s);
    [80, 108, 124].forEach(function (yv, i) { g.fillStyle = P.accent; g.fillRect(cx - (11 - i * 2.5) * s, base - yv * s, (22 - i * 5) * s, 1); });
    lit(g, cx - 3 * s, base - 70 * s, 6 * s, 10 * s, P.win[0]);
    ell(g, cx, base - 98 * s, 4.6 * s, 4.6 * s, '#ffe9a0'); ell(g, cx, base - 98 * s, 3.4 * s, 3.4 * s, '#2a1470'); g.fillStyle = '#ffe9a0'; g.fillRect(cx - 0.4, base - 101 * s, 0.8, 3.4 * s); g.fillRect(cx, base - 98 * s, 2.4 * s, 0.8);
    lit(g, cx - 2 * s, base - 120 * s, 4 * s, 8 * s, P.win[1]);
    // imperial crown and spire
    g.fillStyle = P.top; g.beginPath(); g.moveTo(cx - 8 * s, base - 124 * s); g.quadraticCurveTo(cx - 8 * s, base - 140 * s, cx, base - 142 * s); g.quadraticCurveTo(cx + 8 * s, base - 140 * s, cx + 8 * s, base - 124 * s); g.fill();
    g.strokeStyle = '#ffd23f'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(cx - 8 * s, base - 128 * s); g.quadraticCurveTo(cx, base - 146 * s, cx + 8 * s, base - 128 * s); g.stroke();
    g.fillStyle = P.top; g.fillRect(cx - 0.6, base - 162 * s, 1.2, 22 * s);
    lit(g, cx - 1.2, base - 164 * s, 2.4, 2.4, '#ffd23f');
  }

  function bigBen(g, cx, base, s, P) {
    const f = silFill(g, base - 150 * s, base, P.top, P.bot);
    g.fillStyle = f; g.fillRect(cx - 10 * s, base - 105 * s, 20 * s, 105 * s);
    g.fillRect(cx - 13 * s, base - 134 * s, 26 * s, 30 * s);
    g.fillRect(cx - 11 * s, base - 150 * s, 22 * s, 16 * s);
    poly(g, [[cx - 12 * s, base - 150 * s], [cx, base - 178 * s], [cx + 12 * s, base - 150 * s]], P.top);
    g.fillStyle = P.top; g.fillRect(cx - 0.6, base - 196 * s, 1.2, 20 * s);
    lit(g, cx - 1.5, base - 198 * s, 3, 3, '#ffd23f');
    g.fillStyle = P.accent; g.fillRect(cx - 13 * s, base - 134 * s, 26 * s, 1.2); g.fillRect(cx - 11 * s, base - 150 * s, 22 * s, 1);
    // glowing clock face
    const fy = base - 120 * s;
    ell(g, cx, fy, 10.5 * s, 10.5 * s, 'rgba(255,214,110,0.3)'); ell(g, cx, fy, 8.6 * s, 8.6 * s, '#ffe9a0'); ell(g, cx, fy, 7.4 * s, 7.4 * s, '#fff6d0');
    g.strokeStyle = '#6a3a10'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(cx, fy); g.lineTo(cx, fy - 5.5 * s); g.moveTo(cx, fy); g.lineTo(cx + 3.6 * s, fy + 1.6 * s); g.stroke();
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.fillStyle = '#6a3a10'; g.fillRect(cx + Math.sin(a) * 6.4 * s - 0.4, fy - Math.cos(a) * 6.4 * s - 0.4, 0.8, 0.8); }
    for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(8,4,40,0.8)'; g.fillRect(cx - 8 * s + k * 6 * s, base - 146 * s, 3.2 * s, 9 * s); lit(g, cx - 8 * s + k * 6 * s + 0.6, base - 145 * s, 2 * s, 7 * s, P.win[0]); }
    for (let k = 0; k < 4; k++) lit(g, cx - 6 * s, base - 95 * s + k * 20 * s, 3 * s, 8 * s, P.win[1]);
    rim(g, cx - 10 * s, base - 105 * s, 105 * s, 'rgba(255,255,255,0.3)');
  }

  function parliament(g, x0, x1, base, P) {
    const f = silFill(g, base - 50, base, P.top, P.bot);
    g.fillStyle = f; g.fillRect(x0, base - 30, x1 - x0, 30);
    g.fillStyle = P.accent; g.fillRect(x0, base - 30, x1 - x0, 1);
    for (let x = x0 + 5; x < x1 - 4; x += 12) {
      poly(g, [[x - 2.5, base - 30], [x, base - 40], [x + 2.5, base - 30]], P.top);
      g.fillStyle = P.top; g.fillRect(x - 0.4, base - 46, 0.8, 8);
      lit(g, x - 1.4, base - 24, 2.8, 7, P.win[Math.floor((x * 7) % P.win.length)]);
      lit(g, x - 1.4, base - 12, 2.8, 6, P.win[Math.floor((x * 3) % P.win.length)]);
    }
  }

  function towerBridge(g, x0, x1, base, P) {
    const f = silFill(g, base - 90, base, P.top, P.bot);
    const tw = [x0 + 34, x1 - 34];
    // chains and deck
    g.strokeStyle = '#27e0ff'; g.lineWidth = 1.4; g.globalAlpha = 0.85;
    g.beginPath(); g.moveTo(x0, base - 26); g.quadraticCurveTo(x0 + 14, base - 60, tw[0] - 8, base - 70); g.moveTo(x1, base - 26); g.quadraticCurveTo(x1 - 14, base - 60, tw[1] + 8, base - 70); g.stroke(); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(39,224,255,0.45)'; g.lineWidth = 0.6;
    for (let i = 1; i < 7; i++) { const t = i / 7, hx = x0 + (tw[0] - 8 - x0) * t; const hy = base - 26 - (1 - (1 - t) * (1 - t)) * 44 + 3; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx, base - 26); g.stroke(); const hx2 = x1 - (x1 - tw[1] - 8) * t; g.beginPath(); g.moveTo(hx2, hy); g.lineTo(hx2, base - 26); g.stroke(); }
    g.fillStyle = f; g.fillRect(x0, base - 28, x1 - x0, 4);
    g.fillStyle = P.accent; g.fillRect(x0, base - 28, x1 - x0, 0.8);
    g.fillStyle = '#27e0ff'; g.fillRect(tw[0], base - 66, tw[1] - tw[0], 4);
    g.fillStyle = f; g.fillRect(tw[0], base - 68, tw[1] - tw[0], 3);
    for (let x = tw[0] + 6; x < tw[1] - 3; x += 7) lit(g, x, base - 64, 1.6, 2, P.win[0]);
    tw.forEach(function (tx) {
      g.fillStyle = f; g.fillRect(tx - 10, base - 80, 20, 80);
      g.fillStyle = P.accent; g.fillRect(tx - 10, base - 80, 20, 1);
      poly(g, [[tx - 12, base - 80], [tx, base - 98], [tx + 12, base - 80]], P.top);
      [-10, 10].forEach(function (o) { g.fillStyle = P.top; g.fillRect(tx + o - 1.4, base - 90, 2.8, 12); poly(g, [[tx + o - 2, base - 90], [tx + o, base - 98], [tx + o + 2, base - 90]], P.top); });
      lit(g, tx - 3, base - 74, 6, 12, P.win[0]); lit(g, tx - 3, base - 52, 6, 10, P.win[1]);
      rim(g, tx - 10, base - 80, 80, 'rgba(255,255,255,0.28)');
    });
  }

  function londonEye(g, cx, base, s, P) {
    const cy = base - 58 * s, R = 46 * s;
    g.strokeStyle = P.top; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx - 12 * s, base); g.lineTo(cx, cy); g.lineTo(cx + 12 * s, base); g.stroke();
    g.strokeStyle = 'rgba(180,170,255,0.5)'; g.lineWidth = 0.5;
    for (let k = 0; k < 28; k++) { const a = k * Math.PI * 2 / 28; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke(); }
    g.strokeStyle = '#27e0ff'; g.lineWidth = 1.8; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 0.6; g.beginPath(); g.arc(cx, cy, R - 1.6, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 24; k++) { const a = k * Math.PI * 2 / 24; ell(g, cx + Math.cos(a) * (R + 2.4 * s), cy + Math.sin(a) * (R + 2.4 * s), 2 * s, 1.5 * s, k % 3 ? '#ffe9a0' : '#ff7ad9', a); }
    ell(g, cx, cy, 3 * s, 3 * s, P.accent);
  }

  function shard(g, cx, base, s, P) {
    const f = lg(g, cx - 12 * s, 0, cx + 12 * s, 0, [[0, '#5a4ad8'], [0.45, '#b8a0ff'], [1, '#34187a']]);
    poly(g, [[cx - 12 * s, base], [cx - 5 * s, base - 100 * s], [cx - 1 * s, base - 140 * s], [cx + 1 * s, base - 140 * s], [cx + 6 * s, base - 100 * s], [cx + 12 * s, base]], f);
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 0.6;
    for (let k = 1; k < 9; k++) { const y = base - k * 14 * s, w = (12 - k * 1.2) * s; g.beginPath(); g.moveTo(cx - w, y); g.lineTo(cx + w, y); g.stroke(); }
    g.beginPath(); g.moveTo(cx, base); g.lineTo(cx, base - 140 * s); g.stroke();
    lit(g, cx - 1, base - 143 * s, 2, 2.4, '#ff2a4a');
  }

  function fuji(g, cx, base, s, P) {
    const path = function () {
      g.beginPath(); g.moveTo(cx - 190 * s, base);
      g.bezierCurveTo(cx - 100 * s, base - 22 * s, cx - 52 * s, base - 95 * s, cx - 20 * s, base - 122 * s);
      g.lineTo(cx + 20 * s, base - 122 * s);
      g.bezierCurveTo(cx + 52 * s, base - 95 * s, cx + 100 * s, base - 22 * s, cx + 190 * s, base); g.closePath();
    };
    path(); g.fillStyle = lg(g, 0, base - 122 * s, 0, base, [[0, '#7a4ad8'], [0.5, '#4a2a9a'], [1, '#2a1470']]); g.fill();
    g.save(); path(); g.clip();
    const cap = [[cx - 80 * s, base - 78 * s], [cx - 56 * s, base - 70 * s], [cx - 44 * s, base - 86 * s], [cx - 30 * s, base - 72 * s], [cx - 14 * s, base - 90 * s], [cx, base - 74 * s], [cx + 12 * s, base - 88 * s], [cx + 28 * s, base - 70 * s], [cx + 44 * s, base - 84 * s], [cx + 58 * s, base - 68 * s], [cx + 80 * s, base - 78 * s], [cx + 80 * s, base - 130 * s], [cx - 80 * s, base - 130 * s]];
    poly(g, cap, lg(g, 0, base - 122 * s, 0, base - 70 * s, [[0, '#ffffff'], [1, '#ffb0e0']]));
    g.fillStyle = 'rgba(80,40,160,0.3)'; g.fillRect(cx + 4 * s, base - 130 * s, 90 * s, 130 * s);
    g.restore();
    g.strokeStyle = 'rgba(255,150,230,0.7)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(cx - 190 * s, base); g.bezierCurveTo(cx - 100 * s, base - 22 * s, cx - 52 * s, base - 95 * s, cx - 20 * s, base - 122 * s); g.lineTo(cx + 20 * s, base - 122 * s); g.stroke();
  }

  function tokyoTower(g, cx, base, s, P) {
    const half = function (y) { return (30 - y * 0.2) * s; };
    const body = [[cx - 30 * s, base], [cx - half(60) + 0, base - 60 * s], [cx - 10 * s, base - 105 * s], [cx - 4 * s, base - 150 * s], [cx - 1.2 * s, base - 175 * s], [cx + 1.2 * s, base - 175 * s], [cx + 4 * s, base - 150 * s], [cx + 10 * s, base - 105 * s], [cx + half(60), base - 60 * s], [cx + 30 * s, base]];
    poly(g, body, 'rgba(255,90,60,0.92)');
    g.save(); g.beginPath(); g.moveTo(body[0][0], body[0][1]); body.forEach((p) => g.lineTo(p[0], p[1])); g.clip();
    for (let k = 0; k < 14; k++) { const y = base - k * 13 * s; g.fillStyle = k % 2 ? 'rgba(255,240,220,0.9)' : 'rgba(255,90,60,0)'; g.fillRect(cx - 40 * s, y, 80 * s, 6.5 * s); }
    g.strokeStyle = 'rgba(40,10,70,0.85)'; g.lineWidth = 0.9;
    for (let k = 0; k < 8; k++) { const y0 = base - k * 22 * s, w = (28 - k * 3.2) * s; g.beginPath(); g.moveTo(cx - w, y0); g.lineTo(cx + w * 0.8, y0 - 22 * s); g.moveTo(cx + w, y0); g.lineTo(cx - w * 0.8, y0 - 22 * s); g.stroke(); }
    g.fillStyle = 'rgba(30,6,60,0.22)'; g.fillRect(cx + 2 * s, base - 180 * s, 40 * s, 180 * s);
    g.restore();
    g.fillStyle = '#ff5a3c'; g.fillRect(cx - 13 * s, base - 72 * s, 26 * s, 6 * s); g.fillRect(cx - 6.5 * s, base - 108 * s, 13 * s, 5 * s);
    for (let k = 0; k < 7; k++) { lit(g, cx - 12 * s + k * 3.8 * s, base - 70 * s, 2, 2.4, '#ffe9a0'); }
    g.fillStyle = '#ff5a3c'; g.fillRect(cx - 0.5, base - 200 * s, 1, 26 * s);
    lit(g, cx - 1.4, base - 202 * s, 2.8, 2.8, '#ff2a4a');
    glowRect(g, '#ff5a3c', cx - 30 * s, base - 8, 60 * s, 8);
  }

  function torii(g, cx, base, s, P) {
    const red = lg(g, 0, base - 60 * s, 0, base, [[0, '#ff6a50'], [1, '#c0123a']]);
    g.fillStyle = red; g.fillRect(cx - 21 * s, base - 50 * s, 5 * s, 50 * s); g.fillRect(cx + 16 * s, base - 50 * s, 5 * s, 50 * s);
    g.fillRect(cx - 18 * s, base - 40 * s, 36 * s, 3.6 * s);
    poly(g, [[cx - 34 * s, base - 62 * s], [cx - 24 * s, base - 54 * s], [cx + 24 * s, base - 54 * s], [cx + 34 * s, base - 62 * s], [cx + 30 * s, base - 50 * s], [cx - 30 * s, base - 50 * s]], red);
    g.fillStyle = '#1a0a3a'; g.fillRect(cx - 24 * s, base - 54 * s, 48 * s, 2 * s);
    glowRect(g, '#ff3a3a', cx - 34 * s, base - 62 * s, 68 * s, 3);
  }

  function pagoda(g, cx, base, s, P) {
    const tiers = 5; let y = base;
    for (let t = 0; t < tiers; t++) {
      const w = (40 - t * 6) * s, h = 11 * s;
      g.fillStyle = silFill(g, y - h, y, '#4a2aa0', '#241070'); g.fillRect(cx - w * 0.38, y - h, w * 0.76, h);
      lit(g, cx - w * 0.26, y - h + 3 * s, 3 * s, 4.6 * s, P.win[t % P.win.length]); lit(g, cx + w * 0.26 - 3 * s, y - h + 3 * s, 3 * s, 4.6 * s, P.win[(t + 1) % P.win.length]);
      const ry = y - h;
      poly(g, [[cx - w / 2 - 6 * s, ry + 1], [cx - w / 2 + 3 * s, ry - 5 * s], [cx + w / 2 - 3 * s, ry - 5 * s], [cx + w / 2 + 6 * s, ry + 1], [cx + w / 2, ry + 2.5 * s], [cx - w / 2, ry + 2.5 * s]], '#1a0a50');
      g.fillStyle = '#ff7ad9'; g.fillRect(cx - w / 2 - 5 * s, ry + 0.5, w + 10 * s, 0.8);
      y = ry - 4 * s;
    }
    g.fillStyle = '#ffd23f'; g.fillRect(cx - 0.5, y - 14 * s, 1, 14 * s);
    for (let k = 0; k < 4; k++) g.fillRect(cx - 2.2 + k * 0.1, y - 4 * s - k * 2.6 * s, 4.4 - k, 0.8);
  }

  function operaHouse(g, x0, base, s, P) {
    const cream = lg(g, 0, base - 95 * s, 0, base, [[0, '#fff4e8'], [0.5, '#e3c8ff'], [1, '#9a7ae0']]);
    const sail = function (x, w, h, lean, flip) {
      g.save(); if (flip) { g.translate(x * 2 + w, 0); g.scale(-1, 1); }
      g.beginPath(); g.moveTo(x, base - 8 * s); g.quadraticCurveTo(x + w * 0.02, base - h * 0.95, x + lean, base - h - 8 * s);
      g.quadraticCurveTo(x + w * 0.98, base - h * 0.62, x + w, base - 8 * s); g.closePath();
      g.fillStyle = cream; g.fill();
      g.strokeStyle = 'rgba(150,100,255,0.55)'; g.lineWidth = 0.6;
      for (let k = 1; k < 7; k++) { g.beginPath(); g.moveTo(x + lean, base - h - 8 * s); g.lineTo(x + w * (k / 7) + w * 0.06, base - 8 * s); g.stroke(); }
      g.fillStyle = 'rgba(255,122,217,0.3)'; g.fillRect(x, base - 8 * s - 1.4, w, 1.4);
      g.restore();
    };
    g.fillStyle = silFill(g, base - 10 * s, base, '#c8a8ff', '#5a3aa8'); g.fillRect(x0 - 6 * s, base - 9 * s, 160 * s, 9 * s);
    for (let k = 0; k < 14; k++) lit(g, x0 - 2 * s + k * 11 * s, base - 5 * s, 3, 2, P.win[k % P.win.length]);
    sail(x0, 52 * s, 78 * s, 6 * s, false); sail(x0 + 22 * s, 40 * s, 58 * s, 5 * s, false); sail(x0 + 40 * s, 28 * s, 40 * s, 4 * s, false);
    sail(x0 + 66 * s, 62 * s, 96 * s, 8 * s, true); sail(x0 + 92 * s, 44 * s, 72 * s, 6 * s, true); sail(x0 + 112 * s, 34 * s, 50 * s, 4 * s, true);
  }

  function harbourBridge(g, x0, x1, base, P) {
    const f = silFill(g, base - 110, base, P.top, P.bot);
    const mid = (x0 + x1) / 2, deck = base - 30;
    const arcY = function (x, top) { const t = (x - (x0 + 12)) / (x1 - x0 - 24); return (1 - t) * (1 - t) * (base - 20) + 2 * (1 - t) * t * top + t * t * (base - 20); };
    g.strokeStyle = 'rgba(160,130,255,0.55)'; g.lineWidth = 0.7;
    for (let x = x0 + 22; x < x1 - 20; x += 9) { g.beginPath(); g.moveTo(x, arcY(x, base - 160)); g.lineTo(x, deck); g.stroke(); }
    g.strokeStyle = P.top; g.lineWidth = 2.6;
    [-170, -150].forEach(function (c) { g.beginPath(); g.moveTo(x0 + 12, base - 20); g.quadraticCurveTo(mid, base + c + 20, x1 - 12, base - 20); g.stroke(); });
    g.strokeStyle = P.accent; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x0 + 12, base - 20); g.quadraticCurveTo(mid, base - 150, x1 - 12, base - 20); g.stroke();
    g.fillStyle = f; g.fillRect(x0, deck, x1 - x0, 5);
    g.fillStyle = '#ffb347'; for (let x = x0 + 4; x < x1; x += 8) g.fillRect(x, deck - 1.2, 1.4, 1.2);
    g.fillStyle = P.accent; g.fillRect(x0, deck, x1 - x0, 0.8);
    [x0 + 8, x1 - 8].forEach(function (px) { g.fillStyle = f; g.fillRect(px - 8, base - 48, 16, 48); g.fillStyle = P.accent; g.fillRect(px - 8, base - 48, 16, 1); lit(g, px - 1.6, base - 42, 3.2, 8, P.win[0]); lit(g, px - 1.6, base - 24, 3.2, 8, P.win[1]); poly(g, [[px - 9, base - 48], [px, base - 56], [px + 9, base - 48]], P.top); });
  }

  function sydneyTower(g, cx, base, s, P) {
    g.fillStyle = silFill(g, base - 130 * s, base, P.top, P.bot); g.fillRect(cx - 2.4 * s, base - 118 * s, 4.8 * s, 118 * s);
    poly(g, [[cx - 13 * s, base - 98 * s], [cx + 13 * s, base - 98 * s], [cx + 9 * s, base - 82 * s], [cx - 9 * s, base - 82 * s]], '#ffb347');
    ell(g, cx, base - 99 * s, 13 * s, 3 * s, '#ffe9a0');
    for (let k = 0; k < 6; k++) lit(g, cx - 10 * s + k * 3.6 * s, base - 94 * s, 2 * s, 5 * s, k % 2 ? '#fff6c0' : '#ff9a40');
    g.fillStyle = P.top; g.fillRect(cx - 0.5, base - 140 * s, 1, 22 * s);
    lit(g, cx - 1.2, base - 142 * s, 2.4, 2.4, '#ff2a4a');
    for (let k = 0; k < 8; k++) { g.strokeStyle = 'rgba(255,230,150,0.55)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(cx, base - 98 * s); g.lineTo(cx + (k - 3.5) * 10 * s, base - 118 * s - 4 * s); g.stroke(); }
  }

  function corcovado(g, cx, base, s, P) {
    const hill = function () { g.beginPath(); g.moveTo(cx - 120 * s, base); g.bezierCurveTo(cx - 80 * s, base - 14 * s, cx - 50 * s, base - 72 * s, cx - 8 * s, base - 82 * s); g.lineTo(cx + 8 * s, base - 82 * s); g.bezierCurveTo(cx + 50 * s, base - 72 * s, cx + 90 * s, base - 14 * s, cx + 120 * s, base); g.closePath(); };
    const top = base - 82 * s;
    const halo = g.createRadialGradient(cx, top - 28 * s, 4, cx, top - 28 * s, 60 * s); halo.addColorStop(0, 'rgba(255,255,230,0.6)'); halo.addColorStop(1, 'rgba(255,255,230,0)');
    g.fillStyle = halo; g.fillRect(cx - 60 * s, top - 90 * s, 120 * s, 120 * s);
    hill(); g.fillStyle = lg(g, 0, top, 0, base, [[0, '#2a7a4a'], [0.4, '#1a5a5a'], [1, '#2a1470']]); g.fill();
    g.save(); hill(); g.clip(); g.fillStyle = 'rgba(10,4,50,0.3)'; g.fillRect(cx + 6 * s, top, 130 * s, 90 * s); g.fillStyle = 'rgba(160,255,150,0.25)'; g.fillRect(cx - 120 * s, top, 1.4, 90 * s); g.restore();
    // Cristo Redentor
    const st = lg(g, cx - 28 * s, 0, cx + 28 * s, 0, [[0, '#ffffff'], [0.5, '#e6e0ff'], [1, '#a8a0e0']]);
    g.fillStyle = st; g.fillRect(cx - 8 * s, top - 12 * s, 16 * s, 12 * s);
    poly(g, [[cx - 4 * s, top - 14 * s], [cx - 5.4 * s, top - 42 * s], [cx + 5.4 * s, top - 42 * s], [cx + 4 * s, top - 14 * s]], st);
    poly(g, [[cx - 27 * s, top - 38 * s], [cx - 5 * s, top - 43 * s], [cx + 5 * s, top - 43 * s], [cx + 27 * s, top - 38 * s], [cx + 27 * s, top - 35 * s], [cx + 5 * s, top - 38 * s], [cx - 5 * s, top - 38 * s], [cx - 27 * s, top - 35 * s]], st);
    ell(g, cx, top - 47 * s, 3.2 * s, 3.8 * s, st);
    g.fillStyle = 'rgba(80,60,180,0.35)'; g.fillRect(cx + 1.2 * s, top - 42 * s, 3.8 * s, 28 * s);
  }

  function sugarloaf(g, cx, base, s, P) {
    g.beginPath(); g.moveTo(cx - 64 * s, base); g.bezierCurveTo(cx - 66 * s, base - 62 * s, cx - 32 * s, base - 100 * s, cx + 2 * s, base - 100 * s);
    g.bezierCurveTo(cx + 38 * s, base - 100 * s, cx + 60 * s, base - 62 * s, cx + 66 * s, base); g.closePath();
    g.fillStyle = lg(g, cx - 60 * s, 0, cx + 66 * s, 0, [[0, '#7a5ad8'], [0.55, '#4a2a9a'], [1, '#2a1470']]); g.fill();
    g.strokeStyle = 'rgba(255,150,230,0.7)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(cx - 64 * s, base); g.bezierCurveTo(cx - 66 * s, base - 62 * s, cx - 32 * s, base - 100 * s, cx + 2 * s, base - 100 * s); g.stroke();
    // Urca hill + cable car
    g.beginPath(); g.moveTo(cx - 150 * s, base); g.bezierCurveTo(cx - 140 * s, base - 40 * s, cx - 120 * s, base - 50 * s, cx - 102 * s, base - 50 * s); g.bezierCurveTo(cx - 84 * s, base - 50 * s, cx - 64 * s, base - 30 * s, cx - 60 * s, base); g.closePath();
    g.fillStyle = lg(g, 0, base - 50 * s, 0, base, [[0, '#2a7a4a'], [1, '#2a1470']]); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(cx - 102 * s, base - 52 * s); g.lineTo(cx + 2 * s, base - 101 * s); g.stroke();
    lit(g, cx - 50 * s, base - 78 * s, 5 * s, 4 * s, '#ffd23f');
  }

  function capitol(g, cx, base, s, P) {
    const f = silFill(g, base - 100 * s, base, '#c8b8ff', '#5a3aa8');
    g.fillStyle = f; g.fillRect(cx - 74 * s, base - 22 * s, 148 * s, 22 * s);
    g.fillRect(cx - 34 * s, base - 36 * s, 68 * s, 36 * s);
    poly(g, [[cx - 38 * s, base - 36 * s], [cx, base - 46 * s], [cx + 38 * s, base - 36 * s]], f);
    g.fillStyle = f; g.fillRect(cx - 20 * s, base - 52 * s, 40 * s, 16 * s);
    g.beginPath(); g.ellipse(cx, base - 52 * s, 20 * s, 30 * s, 0, Math.PI, 0); g.fillStyle = lg(g, cx - 20 * s, 0, cx + 20 * s, 0, [[0, '#fff4ff'], [0.55, '#c8b8ff'], [1, '#7a5ad0']]); g.fill();
    g.strokeStyle = 'rgba(90,60,180,0.5)'; g.lineWidth = 0.6;
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(cx + k * 2.6 * s, base - 52 * s); g.quadraticCurveTo(cx + k * 2.4 * s, base - 74 * s, cx, base - 82 * s); g.stroke(); }
    g.fillStyle = f; g.fillRect(cx - 4 * s, base - 92 * s, 8 * s, 10 * s); g.fillRect(cx - 1, base - 100 * s, 2, 8 * s);
    lit(g, cx - 1.2, base - 102 * s, 2.4, 2.4, '#ff2a4a');
    for (let k = -7; k <= 7; k++) { g.fillStyle = 'rgba(70,40,150,0.65)'; g.fillRect(cx + k * 4.3 * s - 0.8, base - 34 * s, 1.6, 34 * s); }
    for (let k = 0; k < 14; k++) { if (Math.abs(k - 6.5) > 3) lit(g, cx - 72 * s + k * 10.6 * s, base - 16 * s, 3, 6, P.win[k % P.win.length]); }
    for (let k = -3; k <= 3; k++) { g.fillStyle = 'rgba(70,40,150,0.55)'; g.fillRect(cx + k * 4.6 * s - 0.7, base - 50 * s, 1.4, 14 * s); }
  }

  function monument(g, cx, base, s, P) {
    poly(g, [[cx - 6.5 * s, base], [cx - 3.6 * s, base - 128 * s], [cx, base - 142 * s], [cx + 3.6 * s, base - 128 * s], [cx + 6.5 * s, base]], lg(g, cx - 6 * s, 0, cx + 6 * s, 0, [[0, '#ffffff'], [0.5, '#d8d0ff'], [1, '#8a7ae0']]));
    g.strokeStyle = 'rgba(100,70,200,0.4)'; g.lineWidth = 0.5; for (let k = 1; k < 14; k++) { const y = base - k * 9 * s; g.beginPath(); g.moveTo(cx - (6.4 - k * 0.2) * s, y); g.lineTo(cx + (6.4 - k * 0.2) * s, y); g.stroke(); }
    lit(g, cx - 1.4, base - 146 * s, 2.8, 3, '#ff2a4a');
    const hz = g.createRadialGradient(cx, base - 144 * s, 0, cx, base - 144 * s, 14); hz.addColorStop(0, 'rgba(255,40,70,0.55)'); hz.addColorStop(1, 'rgba(255,40,70,0)'); g.fillStyle = hz; g.fillRect(cx - 14, base - 160 * s, 28, 32);
  }

  function lincoln(g, cx, base, s, P) {
    const f = silFill(g, base - 70 * s, base, '#c8b8ff', '#5a3aa8');
    g.fillStyle = f; g.fillRect(cx - 52 * s, base - 8 * s, 104 * s, 8 * s); g.fillRect(cx - 48 * s, base - 14 * s, 96 * s, 6 * s);
    g.fillRect(cx - 46 * s, base - 46 * s, 92 * s, 4 * s); g.fillRect(cx - 40 * s, base - 56 * s, 80 * s, 10 * s);
    poly(g, [[cx - 46 * s, base - 46 * s], [cx, base - 54 * s], [cx + 46 * s, base - 46 * s]], '#fff4ff');
    for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? '#e6e0ff' : '#b8a8ff'; g.fillRect(cx - 42 * s + k * 10.5 * s, base - 46 * s, 3.2 * s, 32 * s); }
    g.fillStyle = 'rgba(255,200,120,0.5)'; g.fillRect(cx - 38 * s, base - 46 * s, 76 * s, 32 * s);
    for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? '#e6e0ff' : '#b8a8ff'; g.fillRect(cx - 42 * s + k * 10.5 * s, base - 46 * s, 3.2 * s, 32 * s); }
    for (let k = 0; k < 8; k++) lit(g, cx - 38 * s + k * 10.5 * s, base - 53 * s, 3 * s, 4, P.win[k % P.win.length]);
  }

  function palms(g, w, h, r, count, col) {
    for (let i = 0; i < count; i++) {
      const x = r() * w, ph = 40 + r() * 36, lean = (r() - 0.5) * 16;
      g.strokeStyle = col; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + lean * 0.4, h - ph * 0.6, x + lean, h - ph); g.stroke();
      for (let k = 0; k < 7; k++) {
        const a = -Math.PI * 0.95 + k * Math.PI * 0.3;
        g.strokeStyle = col; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + lean, h - ph); g.quadraticCurveTo(x + lean + Math.cos(a) * 12, h - ph + Math.sin(a) * 8 - 4, x + lean + Math.cos(a) * 22, h - ph + Math.sin(a) * 12 + 8); g.stroke();
      }
    }
  }

  function favelaHills(w, h, seed) {
    return function (g) {
      const r = rng(seed);
      const hillPath = function () {
        g.beginPath(); g.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) g.lineTo(x, h - 34 - 30 * Math.sin(x / w * Math.PI * 4 + 1) - 14 * Math.sin(x * 0.07));
        g.lineTo(w, h); g.closePath();
      };
      hillPath(); g.fillStyle = lg(g, 0, h - 90, 0, h, [[0, '#2a7a4a'], [1, '#14083a']]); g.fill();
      g.save(); hillPath(); g.clip();
      const cols = ['#ff7ad9', '#27e0ff', '#ffd23f', '#4dff7a', '#ff8a5a', '#b88cff'];
      for (let i = 0; i < 150; i++) {
        const x = r() * w, y = h - 90 + r() * 90, bw = 6 + r() * 7, bh = 5 + r() * 6, c = cols[Math.floor(r() * cols.length)];
        g.fillStyle = lerpCol('#1a0c4a', c, 0.45); g.fillRect(x, y, bw, bh);
        g.fillStyle = c; g.globalAlpha = 0.5; g.fillRect(x, y, bw, 1); g.globalAlpha = 1;
        if (r() > 0.4) lit(g, x + 1.6, y + 2, 1.8, 2, '#ffe9a0');
      }
      g.restore();
      palms(g, w, h, r, 9, '#0d2a30');
    };
  }

  /* region far layers: skyline base + landmarks. Landmarks stay inside the 640px tile so the parallax repeat is seamless. */
  const PAL = {
    westeurope: { top: '#3a1a80', bot: '#6a2aa0', accent: '#ff9a6a', win: ['#ffd070', '#ff8a5a', '#ffe9a0'] },
    uksouth: { top: '#2a2a78', bot: '#4a3a9a', accent: '#8ab4ff', win: ['#ffe9a0', '#ffc070', '#9ad8ff'] },
    japaneast: { top: '#34106a', bot: '#5a1a8a', accent: '#ff6a8a', win: ['#ffd0e0', '#ff7a9a', '#ffe9a0'] },
    australiaeast: { top: '#2a2a80', bot: '#5a3a9a', accent: '#ffc860', win: ['#ffe9a0', '#ff9a40', '#7fe8ff'] },
    brazilsouth: { top: '#3a1a7a', bot: '#6a2a8a', accent: '#c8ff70', win: ['#ffe14a', '#ff7ad9', '#4dff7a'] },
    eastus: { top: '#2a2488', bot: '#4a3aa8', accent: '#8ab4ff', win: ['#ffe9a0', '#9ad8ff', '#ff9aff'] }
  };

  function farLayer(region) {
    const P = PAL[region];
    return function (g, w, h) {
      const base = h - 6;
      if (region === 'westeurope') {
        skyline(w, h, 61, '#2a1070', P.accent, 26, 60, 0.2, P.win)(g);
        canalHouses(g, 0, 640, base, rng(71), P, 58, 98, false);
        windmill(g, 80, base - 28, 1.0, P); windmill(g, 520, base - 20, 0.8, P);
        westerkerk(g, 300, base - 50, 0.85, P);
      } else if (region === 'uksouth') {
        skyline(w, h, 63, '#2a1a78', P.accent, 34, 90, 0.2, P.win)(g);
        parliament(g, 0, 170, base, P); bigBen(g, 40, base, 0.95, P);
        towerBridge(g, 200, 400, base, P);
        londonEye(g, 490, base, 0.9, P); shard(g, 595, base, 0.85, P);
      } else if (region === 'japaneast') {
        fuji(g, 190, base, 0.95, P);
        skyline(w, h, 67, '#2a1070', P.accent, 18, 54, 0.3, P.win)(g);
        tokyoTower(g, 470, base, 0.8, P);
        skyline(w, h, 68, '#341278', P.accent, 6, 26, 0.35, P.win)(g);
      } else if (region === 'australiaeast') {
        skyline(w, h, 73, '#2a1a78', P.accent, 26, 64, 0.22, P.win)(g);
        operaHouse(g, 18, base, 0.9, P);
        harbourBridge(g, 190, 470, base, P);
        sydneyTower(g, 560, base, 0.8, P);
      } else if (region === 'brazilsouth') {
        corcovado(g, 130, base, 1.0, P);
        sugarloaf(g, 430, base, 0.9, P);
        g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, 'rgba(255,230,120,0)'], [1, 'rgba(255,230,120,0.4)']]); g.fillRect(0, h - 26, w, 26);
      } else {
        skyline(w, h, 77, '#2a1a78', P.accent, 20, 46, 0.25, P.win)(g);
        capitol(g, 130, base, 1.0, P); monument(g, 320, base, 0.95, P); lincoln(g, 510, base, 0.85, P);
      }
    };
  }
  ['westeurope', 'uksouth', 'japaneast', 'australiaeast', 'brazilsouth', 'eastus'].forEach(function (k) {
    reg2('bg_far_' + k, 640, 220, farLayer(k), FLAT);
  });

  /* region near layers */
  reg2('bg_near_westeurope', 640, 190, function (g, w, h) {
    const P = { top: '#170a48', bot: '#2a1068', accent: '#ff7a59', win: ['#ffd070', '#ff8a5a'] };
    canalHouses(g, 0, 640, h - 4, rng(81), P, 40, 86, true);
    g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, 'rgba(255,120,200,0)'], [1, 'rgba(255,120,200,0.35)']]); g.fillRect(0, h - 26, w, 26);
  }, FLAT);
  reg2('bg_near_uksouth', 640, 190, skyline(640, 190, 83, '#170a48', '#8ab4ff', 40, 110, 0.26, PAL.uksouth.win), FLAT);
  reg2('bg_near_japaneast', 640, 150, function (g, w, h) {
    mesas(w, h, 23, '#1f0e55', '#ff6a8a', 20, 80)(g);
    torii(g, 150, h - 14, 0.9, PAL.japaneast); pagoda(g, 430, h - 14, 0.9, PAL.japaneast);
  }, FLAT);
  reg2('bg_near_australiaeast', 640, 190, skyline(640, 190, 89, '#170a48', '#ffc860', 40, 100, 0.28, PAL.australiaeast.win), FLAT);
  reg2('bg_near_brazilsouth', 640, 150, favelaHills(640, 150, 97), FLAT);

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

  /* ------------------------------------------------------------------ REGION ENEMIES, BOSSES, COINS AND PROPS */
  const EYE = '#ff2a4a';
  function eyes(g, x1, x2, y, r) {
    [x1, x2].forEach(function (x) { eyeGlow(g, x, y, r, EYE); ell(g, x, y, r * 1.1, r * 1.1, EYE); ell(g, x - r * 0.3, y - r * 0.4, r * 0.35, r * 0.35, '#ffffff'); });
  }
  const GOLD = [[0, '#fff3a0'], [0.5, '#ffd23f'], [1, '#c77800']];

  // walkers (32x37, art faces left)
  function walkClog(f) {
    return function (g) {
      const o = f ? 2 : 0;
      limb(g, 12, 28, 11 + o, 35, 4.4, '#0f1c66', '#2455e0', '#6fb4ff'); limb(g, 20, 28, 21 - o, 35, 4.4, '#0f1c66', '#2455e0', '#6fb4ff');
      rrect(g, 7 + o, 34, 8, 3, 1.4, '#14133f'); rrect(g, 17 - o, 34, 8, 3, 1.4, '#14133f');
      poly(g, [[5, 17], [8, 10], [24, 10], [27, 17], [26, 29], [6, 29]], lg(g, 5, 10, 27, 29, [[0, '#ffe08a'], [0.5, '#e0a040'], [1, '#8a5018']]));
      rrect(g, 5.4, 17, 21.2, 3, 1, '#2f6bff');
      [[9, 15], [23, 15], [10, 26], [22, 26]].forEach((p) => ell(g, p[0], p[1], 0.8, 0.8, '#fff3c0'));
      line(g, 16, 10, 16, 4, 1.2, '#2fa84a'); poly(g, [[16, 8], [21, 5], [18, 9.6]], '#2fa84a'); poly(g, [[16, 7], [11, 4.6], [14, 8.6]], '#2fa84a');
      poly(g, [[11.6, 4], [12.6, -0.2], [16, 2.2], [19.4, -0.2], [20.4, 4], [16, 6.6]], '#ff2a6a'); ell(g, 16, 3.6, 2, 1.6, '#ff8ab0');
      eyes(g, 12.4, 19.6, 23.4, 1.5);
      line(g, 10.6, 21.4, 14, 22.4, 0.8, '#3a1a08'); line(g, 21.4, 21.4, 18, 22.4, 0.8, '#3a1a08');
    };
  }
  function walkGuard(f) {
    return function (g) {
      const o = f ? 2 : 0;
      limb(g, 12.6, 26, 11.6 + o, 34.6, 5, '#0a0a1c', '#1a1a38', '#3a3a6a'); limb(g, 19.4, 26, 20.4 - o, 34.6, 5, '#0a0a1c', '#1a1a38', '#3a3a6a');
      rrect(g, 7.6 + o, 34, 8.4, 3, 1.4, '#050510'); rrect(g, 16 - o, 34, 8.4, 3, 1.4, '#050510');
      limb(g, 7, 15, 4, 24, 4.4, '#6a0a14', '#c81a2a', '#ff6a7a'); ell(g, 3.6, 25.4, 2.6, 2.6, '#f0f0ff');
      limb(g, 25, 15, 28, 24, 4.4, '#6a0a14', '#c81a2a', '#ff6a7a'); ell(g, 28.4, 25.4, 2.6, 2.6, '#f0f0ff');
      rrect(g, 7, 13, 18, 15, 3, lg(g, 7, 13, 25, 28, [[0, '#ff5a6a'], [0.4, '#c81a2a'], [1, '#6a0a14']]));
      line(g, 9, 14, 23, 26, 1.5, '#f0f0ff'); line(g, 23, 14, 9, 26, 1.5, '#f0f0ff');
      [[16, 17], [16, 21], [16, 25]].forEach((p) => ell(g, p[0], p[1], 0.9, 0.9, '#ffd23f'));
      rrect(g, 7, 25, 18, 2.2, 0.8, '#0a0a1c');
      ell(g, 16, 12, 5, 4.6, lg(g, 11, 8, 21, 16, [[0, '#ffd2ad'], [1, '#c98a66']]));
      rrect(g, 11.6, 10.6, 8.8, 2.8, 1.2, '#14062a'); eyes(g, 14, 18, 12, 1);
      poly(g, [[9, 9], [9.6, 2], [13, 0.2], [19, 0.2], [22.4, 2], [23, 9], [20, 7.4], [12, 7.4]], lg(g, 9, 0, 23, 9, [[0, '#4a4a6a'], [0.4, '#1a1a2a'], [1, '#050510']]));
      line(g, 12, 2.6, 13, 6, 0.6, 'rgba(180,180,220,0.6)'); line(g, 17, 1.4, 17.4, 6, 0.6, 'rgba(180,180,220,0.6)'); line(g, 21, 2.6, 20.4, 6, 0.6, 'rgba(180,180,220,0.6)');
      line(g, 12, 15.6, 20, 15.6, 0.7, '#ffd23f');
    };
  }
  function walkEmu(f) {
    return function (g) {
      const o = f ? 2 : 0;
      limb(g, 15, 25, 12 + o, 35, 2.6, '#5a3a1a', '#8a6a3a', null); limb(g, 19, 25, 20 - o, 35, 2.6, '#5a3a1a', '#8a6a3a', null);
      poly(g, [[8 + o, 35], [14 + o, 35], [14 + o, 36.8], [7 + o, 36.8]], '#3a2410'); poly(g, [[16 - o, 35], [22 - o, 35], [22 - o, 36.8], [15 - o, 36.8]], '#3a2410');
      limb(g, 10, 18, 7, 8, 3.2, '#5a4a3a', '#8a7a62', '#b8a888');
      ell(g, 17, 20, 10.4, 7.4, lg(g, 8, 12, 26, 28, [[0, '#c8b088'], [0.5, '#8a6a3a'], [1, '#4a3016']]));
      ell(g, 27, 17.4, 4, 5, '#6a4a22');
      for (let i = 0; i < 5; i++) line(g, 11 + i * 3.4, 15, 10 + i * 3.4, 24, 0.6, 'rgba(255,230,180,0.35)');
      ell(g, 6.4, 5.6, 3.8, 3, '#8a7a62'); poly(g, [[3.4, 4.6], [0.4, 5.6], [3.4, 6.8]], '#ffb030');
      eyeGlow(g, 7, 4.6, 1, EYE); ell(g, 7, 4.6, 1.1, 1.1, EYE);
    };
  }
  function walkMinute(f) {
    return function (g) {
      const o = f ? 2 : 0;
      limb(g, 12.6, 26, 11.6 + o, 34.6, 5, '#b8b8d0', '#f0f0ff', '#ffffff'); limb(g, 19.4, 26, 20.4 - o, 34.6, 5, '#b8b8d0', '#f0f0ff', '#ffffff');
      rrect(g, 7.6 + o, 33.6, 8.4, 3.4, 1.4, '#14133f'); rrect(g, 16 - o, 33.6, 8.4, 3.4, 1.4, '#14133f');
      limb(g, 7, 15, 4, 24, 4.4, '#101e70', '#2f4fd0', '#6fb4ff'); ell(g, 3.6, 25.4, 2.6, 2.6, '#d4d6ec');
      limb(g, 25, 15, 28, 24, 4.4, '#101e70', '#2f4fd0', '#6fb4ff'); ell(g, 28.4, 25.4, 2.6, 2.6, '#d4d6ec');
      rrect(g, 7, 13, 18, 15, 3, lg(g, 7, 13, 25, 28, [[0, '#6f8cff'], [0.4, '#2f4fd0'], [1, '#14206a']]));
      line(g, 9, 14, 23, 26, 1.4, '#ffffff'); line(g, 23, 14, 9, 26, 1.4, '#ffffff');
      ell(g, 16, 20, 1, 1, '#ffd23f'); ell(g, 16, 24, 1, 1, '#ffd23f');
      rrect(g, 10.4, 6.6, 11.2, 7, 3, lg(g, 10, 6, 22, 14, [[0, '#d4d6ec'], [1, '#7a7ea0']]));
      rrect(g, 11.6, 9, 8.8, 3, 1.2, '#14062a'); eyes(g, 14, 18, 10.6, 1);
      poly(g, [[5, 8], [16, 0.4], [27, 8], [22.4, 8.4], [16, 4.4], [9.6, 8.4]], '#14133f');
      line(g, 6, 7.6, 16, 1.2, 0.7, '#ffffff'); line(g, 26, 7.6, 16, 1.2, 0.7, '#ffffff');
      ell(g, 16, 3.4, 1.2, 1.2, '#ff2a4a');
    };
  }

  // flyers (32x24, art faces right)
  function flyWindmill(f) {
    return function (g) {
      poly(g, [[12, 14], [20, 14], [23, 23.4], [9, 23.4]], lg(g, 9, 14, 23, 24, [[0, '#fff0d0'], [1, '#c8a878']]));
      rrect(g, 14.4, 19, 3.2, 4.4, 1.2, '#8a4a20');
      const a = f ? Math.PI / 4 : 0;
      for (let i = 0; i < 4; i++) {
        const an = a + i * Math.PI / 2, c = Math.cos(an), s = Math.sin(an);
        line(g, 16, 11, 16 + c * 10.4, 11 + s * 10.4, 1.4, '#8a5a30');
        line(g, 16 + c * 4, 11 + s * 4, 16 + c * 10.4, 11 + s * 10.4, 3.6, 'rgba(250,240,215,0.85)');
      }
      poly(g, [[10, 14], [16, 7], [22, 14]], lg(g, 10, 7, 22, 14, [[0, '#ff6a50'], [1, '#a82a1a']]));
      ell(g, 16, 11, 1.8, 1.8, '#4a2a10');
      eyes(g, 13, 19, 17.4, 1);
    };
  }
  function flySushi(f) {
    return function (g) {
      line(g, 16, 8, 16, 4.4, 1.4, '#7a7ea0');
      if (f) poly(g, [[2, 3], [30, 2.6], [30, 3.8], [2, 4.2]], 'rgba(232,232,248,0.8)');
      else { poly(g, [[8, 2.4], [24, 4], [24, 4.8], [8, 3.4]], '#d4d6ec'); poly(g, [[6, 4.6], [26, 2.4], [26, 3.2], [6, 5.4]], 'rgba(212,214,236,0.45)'); }
      rrect(g, 6, 13, 20, 8.4, 3.6, lg(g, 6, 13, 26, 21, [[0, '#ffffff'], [1, '#bcbcd8']]));
      rrect(g, 5, 7.6, 22, 7.4, 3.4, lg(g, 5, 7, 27, 15, [[0, '#ffb080'], [1, '#ff5a3a']]));
      [[10, 8.6, 9, 14], [15, 8.2, 14, 14.4], [21, 8.6, 20, 14]].forEach((l) => line(g, l[0], l[1], l[2], l[3], 0.8, 'rgba(255,235,220,0.8)'));
      rrect(g, 14, 7.4, 4, 14, 1, '#14301f');
      ell(g, 25.6, 19, 2, 1.5, '#6ad84a');
      eyes(g, 10.6, 21.4, 17.2, 1.1);
      g.globalAlpha = 0.6; ell(g, 16, 22.6, 3, 1.2, '#27e0ff'); g.globalAlpha = 1;
    };
  }
  function birdFrame(o) {
    return function (f) {
      return function (g) {
        const up = f ? -6.4 : 5;
        poly(g, [[14, 11], [9, 11 + up * 0.2], [6, 12 + up], [13, 14]], o.wingD);
        poly(g, [[9, 13], [0.8, 10.6], [0.8, 16], [10, 16]], o.tail);
        ell(g, 16, 13.4, 8.4, 5.2, lg(g, 8, 8, 24, 19, [[0, o.body], [1, o.bodyD || o.body]]));
        poly(g, [[15, 11], [11, 9.6], [6.6, 10 + up], [8.4, 13 + up * 0.4], [19, 13.6]], lg(g, 6, 9, 19, 14, [[0, o.wing], [1, o.wingD]]));
        if (o.crest) poly(g, [[21, 7.4], [19.4, 1.6], [23.4, 5.4], [24.4, 0.6], [26, 6.4]], o.crest);
        ell(g, 24, 10.4, 4.2, 3.8, o.head);
        if (o.patch) ell(g, 25.6, 11, 2.4, 2, o.patch);
        poly(g, [[27, 9.6], [31.6, 11], [27.4, 13]], o.beak);
        eyeGlow(g, 25.4, 9.4, 1, EYE); ell(g, 25.4, 9.4, 1.1, 1.1, EYE);
      };
    };
  }
  const birdRaven = birdFrame({ body: '#2a2a5a', bodyD: '#10102a', wing: '#3a3a7a', wingD: '#10102a', head: '#1a1a3a', beak: '#ffb030', tail: '#10102a' });
  const birdCockatoo = birdFrame({ body: '#ffffff', bodyD: '#c8c8e0', wing: '#f0f0ff', wingD: '#a8a8c8', head: '#ffffff', crest: '#ffd23f', beak: '#5a5a70', tail: '#d8d8ee' });
  const birdMacaw = birdFrame({ body: '#ff4a3a', bodyD: '#a81818', wing: '#2a8aff', wingD: '#ffd23f', head: '#ff3a3a', patch: '#f4f4ff', beak: '#e8e8f0', tail: '#2a6aff' });
  const birdEagle = birdFrame({ body: '#7a5028', bodyD: '#3a2410', wing: '#8a5c30', wingD: '#3a2410', head: '#ffffff', beak: '#ffd23f', tail: '#ffffff' });

  // crawlers (32x20, art faces right)
  function crawlCheese(f) {
    return function (g) {
      for (let i = 0; i < 4; i++) limb(g, 8 + i * 5, 15, 8 + i * 5 + ((f + i) % 2 ? 1.4 : -1.4), 19, 1.8, '#7a4a10', '#a86a20', null);
      poly(g, [[3, 16.4], [29, 16.4], [29, 5]], lg(g, 3, 5, 29, 17, [[0, '#fff0a0'], [0.5, '#ffd23f'], [1, '#c98a14']]));
      poly(g, [[3, 16.4], [29, 5], [29, 8], [7, 16.4]], 'rgba(255,255,200,0.55)');
      [[12, 14.4, 1.7], [19, 13, 1.4], [24.6, 14, 1.2], [16, 15.6, 0.9]].forEach((h) => ell(g, h[0], h[1], h[2], h[2] * 0.8, '#b8780e'));
      eyes(g, 24.2, 27.4, 11.4, 0.9);
    };
  }
  function crawlCab(f) {
    return function (g) {
      rrect(g, 2, 8, 28, 8, 2.4, lg(g, 2, 8, 2, 16, [[0, '#5a5a82'], [1, '#10102a']]));
      rrect(g, 8, 3.4, 15, 6, 2.4, lg(g, 8, 3, 8, 9, [[0, '#5a5a82'], [1, '#10102a']]));
      rrect(g, 9.6, 4.8, 5.6, 3.6, 1, '#0d0424'); rrect(g, 16.4, 4.8, 5.4, 3.6, 1, '#0d0424'); eyes(g, 12.4, 19, 6.6, 0.9);
      rrect(g, 13, 1.2, 6, 2.4, 0.8, '#ffd23f'); line(g, 3, 12, 29, 12, 0.9, '#ffd23f');
      ell(g, 29, 10.6, 1.6, 1.6, '#fff3a0'); ell(g, 3, 10.6, 1.2, 1.2, '#ff2a4a');
      [9, 23].forEach((x) => { ell(g, x, 16, 3.4, 3.4, '#0a0418'); ell(g, x, 16, 1.5, 1.5, '#c4e6ff'); const a = f ? 0.8 : 0; line(g, x - Math.cos(a) * 3, 16 - Math.sin(a) * 3, x + Math.cos(a) * 3, 16 + Math.sin(a) * 3, 0.7, '#7a7ea0'); });
    };
  }
  function crawlCroc(f) {
    return function (g) {
      poly(g, [[0.4, 14], [9, 10], [9, 16], [0.4, 16.8]], '#1a6a2a');
      limb(g, 12, 15, 12 + (f ? 2.4 : -2.4), 19, 2.8, '#14501e', '#2a8a3a', null); limb(g, 21, 15, 21 + (f ? -2.4 : 2.4), 19, 2.8, '#14501e', '#2a8a3a', null);
      ell(g, 15, 12, 10.4, 4.6, lg(g, 5, 7, 5, 17, [[0, '#6ad84a'], [0.5, '#2a8a3a'], [1, '#14501e']]));
      for (let i = 0; i < 5; i++) poly(g, [[8 + i * 3.4, 8.6], [9.6 + i * 3.4, 6], [11.2 + i * 3.4, 8.8]], '#14501e');
      poly(g, [[22, 9.2], [31.6, 10.6], [31.6, 14.6], [22, 15.4]], lg(g, 22, 9, 22, 15, [[0, '#4ab83a'], [1, '#1a6a2a']]));
      for (let i = 0; i < 4; i++) poly(g, [[24 + i * 2, 14.8], [25 + i * 2, 12.8], [26 + i * 2, 14.8]], '#ffffff');
      ell(g, 24.6, 9.2, 2, 1.8, '#2a8a3a'); eyeGlow(g, 24.8, 9, 1, EYE); ell(g, 24.8, 9, 1.1, 1.1, EYE);
    };
  }
  function crawlCrab(f) {
    return function (g) {
      for (let i = 0; i < 3; i++) {
        const w = (f + i) % 2 ? 1.4 : 0;
        limb(g, 10 + i * 4, 14, 7 + i * 3.4, 19 - w, 1.6, '#14339e', '#2a6aff', null);
        limb(g, 20 + i * 2, 14, 24 + i * 2.6, 19 - w, 1.6, '#14339e', '#2a6aff', null);
      }
      const c = f ? 1.4 : 0;
      limb(g, 8, 11, 4, 6 - c, 2.4, '#14339e', '#2a6aff', null); ell(g, 3.4, 5 - c, 3, 2.6, lg(g, 1, 2, 6, 8, [[0, '#ffa050'], [1, '#d84a1a']]));
      limb(g, 24, 11, 28, 6 - c * 0.5, 2.4, '#14339e', '#2a6aff', null); ell(g, 28.6, 5 - c * 0.5, 3, 2.6, lg(g, 26, 2, 31, 8, [[0, '#ffa050'], [1, '#d84a1a']]));
      ell(g, 16, 12.4, 11.4, 5.4, lg(g, 5, 7, 25, 18, [[0, '#8ab4ff'], [0.5, '#2a6aff'], [1, '#14339e']]));
      line(g, 12, 9, 12, 5.6, 1, '#14339e'); line(g, 20, 9, 20, 5.6, 1, '#14339e'); eyes(g, 12, 20, 5, 1);
    };
  }

  const SKINS = {
    westeurope: { robot: walkClog, drone: flyWindmill, spider: crawlCheese },
    uksouth: { robot: walkGuard, drone: birdRaven, spider: crawlCab },
    japaneast: { drone: flySushi },
    australiaeast: { robot: walkEmu, drone: birdCockatoo, spider: crawlCroc },
    brazilsouth: { drone: birdMacaw },
    eastus: { robot: walkMinute, drone: birdEagle, spider: crawlCrab }
  };
  const SKIN_SIZE = { robot: [32, 37], drone: [32, 24], spider: [32, 20] };
  const skinKeys = [];
  Object.keys(SKINS).forEach(function (r) {
    Object.keys(SKINS[r]).forEach(function (t) {
      skinKeys.push('en_' + r + '_' + t);
      for (let f = 0; f < 2; f++) reg2('en_' + r + '_' + t + '_' + f, SKIN_SIZE[t][0], SKIN_SIZE[t][1], SKINS[r][t](f), { shade: 0.5 });
    });
  });

  /* ---- local bosses (64x80, three states each) */
  function bossReg(kind, draw) {
    [['_0', 'idle'], ['_attack', 'attack'], ['_stun', 'stun']].forEach(function (m) {
      reg2('boss_' + kind + m[0], 64, 80, function (g) {
        const S = { atk: m[1] === 'attack', stun: m[1] === 'stun', up: m[1] === 'attack' ? 10 : 0, eye: m[1] === 'stun' ? '#6a6a80' : EYE };
        draw(g, S);
        if (S.stun) {
          g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(70,70,100,0.35)'; g.fillRect(0, 0, 64, 80); g.globalCompositeOperation = 'source-over';
          [[7, 10], [53, 6], [45, 2], [20, 1]].forEach((p) => poly(g, [[p[0], p[1] - 3.4], [p[0] + 1, p[1] - 1], [p[0] + 3.4, p[1]], [p[0] + 1, p[1] + 1], [p[0], p[1] + 3.4], [p[0] - 1, p[1] + 1], [p[0] - 3.4, p[1]], [p[0] - 1, p[1] - 1]], '#ffd23f'));
        }
      }, { shade: 0.5 });
    });
  }
  function bEyes(g, S, x1, x2, y, r) {
    [x1, x2].forEach(function (x) {
      if (!S.stun) eyeGlow(g, x, y, r * 1.6, EYE);
      ell(g, x, y, r, r * 0.85, S.eye);
      if (!S.stun) ell(g, x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.3, '#fff');
    });
  }
  function hoverPlate(g, c1, c2, glowCol) {
    ell(g, 32, 77, 24, 3.4, glowCol);
    ell(g, 32, 73.6, 20, 3.6, lg(g, 12, 70, 52, 77, [[0, c1], [1, c2]]));
    [[18, 77.6], [32, 78], [46, 77.6]].forEach((p) => ell(g, p[0], p[1], 3, 1.6, 'rgba(255,255,255,0.8)'));
  }
  const SK = { l: '#f4c8a0', m: '#d89a70', d: '#9a5a3a' };

  // Tokyo: floating sumo wrestler
  bossReg('sumo', function (g, S) {
    const up = S.up;
    limb(g, 23, 58, 22, 69, 12, SK.d, SK.m, SK.l); limb(g, 41, 58, 42, 69, 12, SK.d, SK.m, SK.l);
    ell(g, 21, 71, 8, 3.2, SK.m); ell(g, 43, 71, 8, 3.2, SK.m);
    hoverPlate(g, '#c4e6ff', '#4a6aa8', 'rgba(39,224,255,0.55)');
    ell(g, 32, 50, 25, 20, lg(g, 8, 30, 56, 70, [[0, SK.l], [0.5, SK.m], [1, SK.d]]));
    ell(g, 32, 56, 1.8, 1.4, SK.d); ell(g, 22, 40, 7, 5, 'rgba(255,255,255,0.18)');
    poly(g, [[9, 56], [55, 56], [52, 64], [32, 69], [12, 64]], lg(g, 9, 56, 55, 69, [[0, '#c04bff'], [1, '#4a1a8a']]));
    rrect(g, 9, 55, 46, 3.4, 1.4, '#ffd23f'); poly(g, [[28, 58], [36, 58], [34, 68], [30, 68]], '#ffd23f');
    limb(g, 13, 34, 7, 46 - up, 12, SK.d, SK.m, SK.l); ell(g, 6, 52 - up, 6.4, 6, SK.l);
    limb(g, 51, 34, 57, 46 - up, 12, SK.d, SK.m, SK.l); ell(g, 58, 52 - up, 6.4, 6, SK.l);
    ell(g, 32, 33, 18, 8, lg(g, 14, 26, 50, 40, [[0, SK.l], [1, SK.m]]));
    ell(g, 32, 17, 12, 11, lg(g, 20, 6, 44, 28, [[0, SK.l], [0.6, SK.m], [1, SK.d]]));
    ell(g, 32, 7.6, 6.4, 3.8, '#14133f'); poly(g, [[28.6, 8], [32, 1], [35.4, 8]], '#14133f');
    poly(g, [[20.4, 13], [24, 7.6], [40, 7.6], [43.6, 13], [32, 10.4]], '#14133f');
    ell(g, 24, 22, 3, 2, 'rgba(255,120,120,0.45)'); ell(g, 40, 22, 3, 2, 'rgba(255,120,120,0.45)');
    line(g, 24, 13.6, 29.6, 15.6, 1.4, '#14133f'); line(g, 40, 13.6, 34.4, 15.6, 1.4, '#14133f');
    bEyes(g, S, 27, 37, 17, 2); line(g, 28, 25, 36, 25, 1, '#6a2a2a');
    if (S.atk) { [6, 58].forEach((x) => { const gr = g.createRadialGradient(x, 50, 0, x, 50, 9); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,42,74,0)'); g.fillStyle = gr; g.fillRect(x - 10, 40, 20, 20); }); }
  });

  // Sydney: boxing kangaroo
  bossReg('roo', function (g, S) {
    const up = S.up, B = { l: '#e8a860', m: '#b8702a', d: '#6a3a10' };
    poly(g, [[42, 58], [62, 76], [57, 79.6], [38, 70]], lg(g, 40, 58, 62, 79, [[0, B.m], [1, B.d]]));
    ell(g, 24, 62, 10, 13, lg(g, 14, 50, 34, 74, [[0, B.l], [1, B.d]])); ell(g, 40, 62, 10, 13, lg(g, 30, 50, 50, 74, [[0, B.l], [1, B.d]]));
    poly(g, [[8, 76], [32, 76], [34, 79.6], [4, 79.6]], '#3a2410'); poly(g, [[32, 76], [56, 76], [60, 79.6], [30, 79.6]], '#3a2410');
    ell(g, 32, 44, 16, 20, lg(g, 16, 24, 48, 66, [[0, B.l], [0.5, B.m], [1, B.d]]));
    ell(g, 32, 48, 9, 14, '#f8e0b8'); line(g, 26, 50, 38, 50, 1, '#c8986a');
    rrect(g, 16, 55, 32, 4.4, 2, lg(g, 0, 55, 0, 60, GOLD)); poly(g, [[32, 55.4], [33.4, 57], [32, 58.8], [30.6, 57]], '#ff2a4a');
    limb(g, 15, 38, 9, 48 - up, 8, B.d, B.m, B.l); ell(g, 8, 54 - up, 7.4, 6.6, lg(g, 2, 48, 14, 60, [[0, '#ff7a8a'], [1, '#a8101e']])); ell(g, 6, 51 - up, 2, 1.4, 'rgba(255,255,255,0.7)');
    limb(g, 49, 38, 55, 48 - up, 8, B.d, B.m, B.l); ell(g, 56, 54 - up, 7.4, 6.6, lg(g, 50, 48, 62, 60, [[0, '#ff7a8a'], [1, '#a8101e']])); ell(g, 54, 51 - up, 2, 1.4, 'rgba(255,255,255,0.7)');
    poly(g, [[24, 13], [21, 0.6], [28.6, 9]], B.m); poly(g, [[40, 13], [43, 0.6], [35.4, 9]], B.m);
    poly(g, [[24, 11], [22.4, 3.6], [27, 9]], '#ff9ab0'); poly(g, [[40, 11], [41.6, 3.6], [37, 9]], '#ff9ab0');
    ell(g, 32, 19, 9.6, 10, lg(g, 22, 9, 42, 29, [[0, B.l], [1, B.m]]));
    ell(g, 32, 25.6, 6, 4.4, '#f8e0b8'); ell(g, 32, 23.6, 2, 1.4, '#2a1408');
    rrect(g, 22, 12, 20, 3, 1.4, '#ff2a4a');
    bEyes(g, S, 27.4, 36.6, 17.6, 1.9); line(g, 28.4, 27.6, 35.6, 27.6, 0.8, '#6a3a1a');
  });

  // London: bearskin royal guard
  bossReg('guard', function (g, S) {
    const up = S.up;
    limb(g, 24, 58, 23, 70, 11, '#0a0a1c', '#1a1a38', '#3a3a6a'); limb(g, 40, 58, 41, 70, 11, '#0a0a1c', '#1a1a38', '#3a3a6a');
    poly(g, [[14, 70], [31, 70], [33, 79.6], [10, 79.6]], lg(g, 0, 70, 0, 80, [[0, '#3a3a5a'], [1, '#050510']])); poly(g, [[33, 70], [50, 70], [54, 79.6], [31, 79.6]], lg(g, 0, 70, 0, 80, [[0, '#3a3a5a'], [1, '#050510']]));
    line(g, 57, 22 - up, 57, 78, 2, '#c8c8d8'); poly(g, [[55, 22 - up], [57, 12 - up], [59, 22 - up]], '#ffffff');
    limb(g, 10, 30, 8, 42 - up, 9, '#6a0a14', '#c81a2a', '#ff6a7a'); limb(g, 8, 42 - up, 8, 50 - up, 8, '#6a0a14', '#c81a2a', '#ff6a7a'); ell(g, 8, 55 - up, 6, 5.4, '#f0f0ff');
    limb(g, 54, 30, 56, 42 - up, 9, '#6a0a14', '#c81a2a', '#ff6a7a'); limb(g, 56, 42 - up, 57, 50 - up, 8, '#6a0a14', '#c81a2a', '#ff6a7a'); ell(g, 57, 55 - up, 6, 5.4, '#f0f0ff');
    poly(g, [[13, 26], [51, 26], [48, 62], [16, 62]], lg(g, 12, 26, 52, 62, [[0, '#ff6a7a'], [0.4, '#c81a2a'], [1, '#6a0a14']]));
    line(g, 15, 28, 47, 58, 3, '#f0f0ff'); line(g, 49, 28, 17, 58, 3, '#f0f0ff');
    [30, 38, 46, 54].forEach((y) => { ell(g, 32, y, 1.6, 1.6, '#ffd23f'); });
    rrect(g, 15, 56, 34, 4.4, 1.4, '#0a0a1c'); rrect(g, 29, 55.6, 6, 5.2, 1, lg(g, 0, 55, 0, 61, GOLD));
    ell(g, 10, 27, 8, 4.6, lg(g, 2, 22, 18, 32, GOLD)); ell(g, 54, 27, 8, 4.6, lg(g, 46, 22, 62, 32, GOLD));
    ell(g, 32, 24, 10, 9.6, lg(g, 22, 15, 42, 34, [[0, '#ffd2ad'], [1, '#c98a66']]));
    rrect(g, 23, 20, 18, 6, 2.4, '#0d0424'); bEyes(g, S, 27.6, 36.4, 23, 2);
    line(g, 23, 30, 41, 30, 1.4, '#ffd23f');
    poly(g, [[18, 20], [18.6, 5], [24, 0.8], [40, 0.8], [45.4, 5], [46, 20], [41, 16.4], [23, 16.4]], lg(g, 18, 0, 46, 20, [[0, '#5a5a7a'], [0.4, '#1a1a2a'], [1, '#050510']]));
    [[24, 4, 22.6, 14], [30, 2.6, 29, 15], [36, 2.6, 36.6, 15], [42, 4, 42.4, 14]].forEach((l) => line(g, l[0], l[1], l[2], l[3], 0.9, 'rgba(190,190,230,0.55)'));
    ell(g, 44, 7, 2, 5.4, '#ff2a4a');
  });

  // Amsterdam: windmill titan
  bossReg('molen', function (g, S) {
    const up = S.up, rot = S.atk ? 0.5 : S.stun ? 0.2 : 0.785;
    for (let i = 0; i < 4; i++) {
      const an = rot + i * Math.PI / 2, c = Math.cos(an), s = Math.sin(an);
      line(g, 32, 33, 32 + c * 29, 33 + s * 29, 2.4, '#8a5a30');
      line(g, 32 + c * 10, 33 + s * 10, 32 + c * 29, 33 + s * 29, 7, 'rgba(250,240,215,0.9)');
      line(g, 32 + c * 10, 33 + s * 10, 32 + c * 29, 33 + s * 29, 1, 'rgba(120,80,40,0.8)');
    }
    limb(g, 23, 60, 22, 70, 12, '#6a3a10', '#c8842a', '#ffe08a'); limb(g, 41, 60, 42, 70, 12, '#6a3a10', '#c8842a', '#ffe08a');
    [[11, 79.6, 34], [32, 79.6, 55]].forEach((c) => poly(g, [[c[0] + 3, 70], [c[0] + 23, 70], [c[2] + 0, 78], [c[0] - 2, 79.6]], lg(g, 0, 70, 0, 80, [[0, '#ffe08a'], [0.5, '#e0a040'], [1, '#8a5018']])));
    rrect(g, 12, 74, 22, 2.6, 1, '#2f6bff'); rrect(g, 33, 74, 22, 2.6, 1, '#2f6bff');
    limb(g, 12, 38, 7, 48 - up, 9, '#6a3a10', '#a86a20', '#e0a040'); ell(g, 6, 54 - up, 6.4, 5.6, lg(g, 0, 48, 12, 60, [[0, '#6fa0ff'], [1, '#14339e']]));
    limb(g, 52, 38, 57, 48 - up, 9, '#6a3a10', '#a86a20', '#e0a040'); ell(g, 58, 54 - up, 6.4, 5.6, lg(g, 52, 48, 64, 60, [[0, '#6fa0ff'], [1, '#14339e']]));
    poly(g, [[17, 24], [47, 24], [54, 62], [10, 62]], lg(g, 10, 24, 54, 62, [[0, '#ffb090'], [0.5, '#d86a50'], [1, '#8a2a20']]));
    for (let r = 0; r < 6; r++) { const y = 30 + r * 5.4; line(g, 13, y, 51, y, 0.6, 'rgba(70,10,10,0.5)'); for (let x = (r % 2) * 4 + 14; x < 50; x += 8) line(g, x, y, x, y + 5.4, 0.6, 'rgba(70,10,10,0.4)'); }
    rrect(g, 12, 56, 40, 4, 1, '#f0f0ff'); rrect(g, 27, 49, 10, 13, 4, '#6a3a10');
    const core = S.stun ? '#555570' : '#ff5a7a', cg = g.createRadialGradient(32, 42, 0, 32, 42, 9);
    cg.addColorStop(0, S.stun ? 'rgba(160,160,180,0.9)' : 'rgba(255,255,255,0.95)'); cg.addColorStop(0.4, core); cg.addColorStop(1, 'rgba(255,42,74,0)');
    g.fillStyle = cg; g.fillRect(22, 32, 20, 20);
    ell(g, 32, 33, 3.2, 3.2, '#4a2a10');
    poly(g, [[10, 24], [32, 2], [54, 24]], lg(g, 10, 2, 54, 24, [[0, '#ff6a50'], [1, '#8a1a10']]));
    for (let i = 0; i < 4; i++) line(g, 18 + i * 9, 20 - i * 2.4, 22 + i * 7.4, 22, 0.7, 'rgba(70,10,10,0.5)');
    rrect(g, 21, 19, 22, 6.4, 2.4, '#0d0424'); bEyes(g, S, 27, 37, 22.2, 2.2);
  });

  // Rio: carnival king on a hovering float
  bossReg('samba', function (g, S) {
    const up = S.up, FC = ['#ff2a9a', '#ffd23f', '#27e0ff', '#4dff7a', '#ff7a2a'];
    for (let i = -4; i <= 4; i++) {
      const an = -Math.PI / 2 + i * 0.3, r = 15;
      ell(g, 32 + Math.cos(an) * r, 20 + Math.sin(an) * r * 0.8, 11, 3.6, FC[(i + 4) % 5], an);
      ell(g, 32 + Math.cos(an) * (r + 5), 20 + Math.sin(an) * (r + 5) * 0.8, 3.2, 1.6, '#ffffff', an);
    }
    hoverPlate(g, '#ff7ad9', '#7a1a8a', 'rgba(255,122,217,0.55)');
    limb(g, 26, 58, 25, 70, 8, '#8a4a1a', '#c88040', '#ffc890'); limb(g, 38, 58, 39, 70, 8, '#8a4a1a', '#c88040', '#ffc890');
    poly(g, [[17, 54], [47, 54], [58, 71], [6, 71]], lg(g, 6, 54, 58, 71, [[0, '#ff7ad9'], [0.5, '#c02cc9'], [1, '#4a0f5a']]));
    for (let i = 0; i < 6; i++) line(g, 20 + i * 5, 56, 12 + i * 8, 70, 0.8, 'rgba(255,230,120,0.7)');
    poly(g, [[19, 32], [45, 32], [42, 58], [22, 58]], lg(g, 19, 32, 45, 58, [[0, '#7dffa8'], [0.5, '#1ab85a'], [1, '#0a5a30']]));
    for (let i = 0; i < 5; i++) line(g, 22, 38 + i * 4.4, 42, 38 + i * 4.4, 0.6, 'rgba(255,255,255,0.4)');
    ell(g, 26, 40, 5.6, 4.6, lg(g, 20, 35, 32, 45, GOLD)); ell(g, 38, 40, 5.6, 4.6, lg(g, 32, 35, 44, 45, GOLD));
    rrect(g, 21, 52, 22, 4, 1.4, lg(g, 0, 52, 0, 56, GOLD));
    limb(g, 19, 36, 10, 46 - up, 7, '#8a4a1a', '#c88040', '#ffc890'); limb(g, 45, 36, 54, 46 - up, 7, '#8a4a1a', '#c88040', '#ffc890');
    [8, 56].forEach((x) => { line(g, x, 53 - up, x, 40 - up, 1.4, '#6a3a10'); ell(g, x, 38 - up, 4.4, 5.6, lg(g, x - 4, 32 - up, x + 4, 44 - up, [[0, '#ff7a8a'], [1, '#a8101e']])); ell(g, x, 38 - up, 2, 1, '#ffd23f'); ell(g, x, 54 - up, 3, 3, '#c88040'); });
    ell(g, 32, 23, 8.4, 9, lg(g, 24, 14, 40, 32, [[0, '#d89050'], [1, '#8a4a1a']]));
    rrect(g, 23.4, 18.6, 17.2, 6.4, 3, lg(g, 0, 18, 0, 25, GOLD)); bEyes(g, S, 28, 36, 21.8, 1.8);
    poly(g, [[28, 30.4], [36, 30.4], [32, 33.6]], '#ff2a4a');
    ell(g, 32, 12.4, 3, 2.4, '#ff2a9a'); ell(g, 32, 12.4, 1.2, 1, '#ffffff');
  });

  /* ---- boss projectiles (22x12) */
  const BOLT = { noOutline: true, shade: 0 };
  reg2('bolt_molen', 22, 12, function (g) {
    line(g, 9, 6, 21, 6, 1.4, '#2fa84a'); poly(g, [[14, 6], [18, 2.4], [17, 6.6]], '#2fa84a');
    poly(g, [[2.4, 2], [4, 4.4], [6, 1.4], [8, 4.4], [9.6, 2], [9.2, 8.6], [6, 11], [2.8, 8.6]], '#ff2a6a'); ell(g, 6, 6.6, 2.4, 2.8, '#ff8ab0');
  }, Object.assign({ glow: '#ff2a6a' }, BOLT));
  reg2('bolt_guard', 22, 12, function (g) {
    ell(g, 11, 9.6, 9, 1.6, '#c4e6ff'); poly(g, [[3.6, 3.4], [18.4, 3.4], [16, 9.4], [6, 9.4]], lg(g, 0, 3, 0, 10, [[0, '#ffffff'], [1, '#a8b8e0']]));
    rrect(g, 4.4, 4.6, 13.2, 1.6, 0.6, '#2f6bff'); g.lineWidth = 1.4; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(19, 6, 2.2, -1.5, 1.5); g.stroke();
    line(g, 8, 0.8, 7, 2.6, 0.8, 'rgba(255,255,255,0.7)'); line(g, 13, 0.4, 12, 2.6, 0.8, 'rgba(255,255,255,0.7)');
  }, Object.assign({ glow: '#7fb0ff' }, BOLT));
  reg2('bolt_sumo', 22, 12, function (g) {
    rrect(g, 3, 6, 17, 5, 2.2, '#ffffff');
    rrect(g, 2, 2, 19, 5.6, 2.6, lg(g, 0, 2, 0, 8, [[0, '#ffb080'], [1, '#ff5a3a']]));
    [[7, 2.6, 6, 7], [12, 2.6, 11, 7], [17, 2.6, 16, 7]].forEach((l) => line(g, l[0], l[1], l[2], l[3], 0.7, 'rgba(255,235,220,0.9)'));
    rrect(g, 10, 1.6, 3, 10, 0.8, '#14301f');
  }, Object.assign({ glow: '#ff9a5a' }, BOLT));
  reg2('bolt_roo', 22, 12, function (g) {
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#8a4a10'; g.lineWidth = 3.8; g.beginPath(); g.moveTo(3, 2.4); g.lineTo(10, 9.4); g.lineTo(19.6, 3); g.stroke();
    g.strokeStyle = '#ffc860'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(3, 2.4); g.lineTo(10, 9); g.lineTo(19.6, 3); g.stroke();
    g.strokeStyle = '#ff2a4a'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(8, 7.6); g.lineTo(12, 7.6); g.stroke();
  }, Object.assign({ glow: '#ffb05a' }, BOLT));
  reg2('bolt_samba', 22, 12, function (g) {
    ell(g, 11, 6, 10, 3.2, lg(g, 1, 3, 21, 9, [[0, '#ff2a9a'], [0.5, '#ffd23f'], [1, '#27e0ff']]));
    line(g, 2, 6, 21, 6, 0.8, 'rgba(255,255,255,0.8)'); ell(g, 6, 5, 3, 1, 'rgba(255,255,255,0.5)');
  }, Object.assign({ glow: '#ff7ad9' }, BOLT));

  /* ---- regional Azure Credit coins (currency symbol on the face) */
  const COINS = { westeurope: '\u20AC', uksouth: '\u00A3', japaneast: '\u00A5', australiaeast: 'A$', brazilsouth: 'R$', eastus: '$' };
  Object.keys(COINS).forEach(function (r) {
    [12, 8, 4, 8].forEach(function (cw, i) {
      reg2('coin_' + r + i, 14, 14, function (g) {
        const w = cw / 2;
        ell(g, 7, 7, w, 6.2, lg(g, 7 - w, 1, 7 + w, 13, [[0, '#fff3a0'], [0.4, '#ffd23f'], [1, '#c77800']]));
        if (w > 3) {
          ell(g, 7, 7, w - 1.3, 4.9, lg(g, 0, 2, 0, 12, [[0, '#ffe680'], [1, '#e89400']]));
          g.save(); g.translate(7, 7.4); g.scale(cw / 12, 1);
          g.fillStyle = '#8a4a00'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold ' + (COINS[r].length > 1 ? 5.6 : 8) + 'px monospace';
          g.fillText(COINS[r], 0, 0);
          g.restore();
          ell(g, 5.2, 3.8, 1.2, 0.7, 'rgba(255,255,255,0.9)', -0.5);
        } else rrect(g, 6.2, 1.4, 1.6, 11.2, 0.6, '#ffe680');
      }, { shade: 0.4 });
    });
    ['coin_' + r + '0', 'coin_' + r + '1', 'coin_' + r + '2', 'coin_' + r + '3'].forEach(function (k) { defs[k] = glow(defs[k], '#ffb000', 4); });
  });

  /* ---- local props: scenery that never collides */
  const PROPS = {
    tulips: [24, 26, function (g) {
      poly(g, [[6, 17], [18, 17], [16, 25.6], [8, 25.6]], lg(g, 0, 17, 0, 26, [[0, '#e0804a'], [1, '#8a3a1a']]));
      [[7, 5, '#ff2a6a'], [12, 2, '#ffd23f'], [17, 5, '#ff7a2a']].forEach((t) => { line(g, t[0], 17, t[0], t[1] + 3, 1.2, '#2fa84a'); poly(g, [[t[0] - 3, t[1] - 1], [t[0] - 1.6, t[1] + 4], [t[0], t[1] + 1], [t[0] + 1.6, t[1] + 4], [t[0] + 3, t[1] - 1], [t[0], t[1] + 5.6]], t[2]); });
    }],
    bike: [32, 20, function (g) {
      [[7, 14], [25, 14]].forEach((w) => { g.lineWidth = 1.4; g.strokeStyle = '#14062a'; g.beginPath(); g.arc(w[0], w[1], 5.4, 0, 7); g.stroke(); g.lineWidth = 0.5; g.strokeStyle = '#c4e6ff'; g.beginPath(); g.arc(w[0], w[1], 3, 0, 7); g.stroke(); });
      line(g, 7, 14, 14, 6, 1.4, '#ff7a2a'); line(g, 14, 6, 22, 6, 1.4, '#ff7a2a'); line(g, 14, 6, 17, 14, 1.4, '#ff7a2a'); line(g, 17, 14, 7, 14, 1.4, '#ff7a2a'); line(g, 22, 6, 25, 14, 1.4, '#ff7a2a'); line(g, 17, 14, 22, 6, 1.4, '#ff7a2a');
      line(g, 21, 6, 22.6, 2.6, 1.2, '#14062a'); line(g, 20, 2.6, 25, 2.6, 1.2, '#14062a'); rrect(g, 11.4, 3, 6, 1.8, 0.8, '#14062a');
      rrect(g, 20.6, 8, 6.6, 4.6, 1, '#8a5a2a');
    }],
    phone: [14, 28, function (g) {
      rrect(g, 1, 3, 12, 25, 1.4, lg(g, 1, 3, 13, 28, [[0, '#ff5a5a'], [1, '#a81818']])); rrect(g, 0, 0.8, 14, 3.6, 1.2, '#c81a1a');
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) rrect(g, 2.6 + c * 4.8, 6 + r * 5.6, 3.8, 4.6, 0.5, 'rgba(255,240,170,0.85)');
      rrect(g, 3, 23.4, 8, 3, 0.6, '#7a1010');
    }],
    postbox: [12, 18, function (g) {
      rrect(g, 1, 3, 10, 15, 2, lg(g, 1, 3, 11, 18, [[0, '#ff6a6a'], [1, '#a81818']])); ell(g, 6, 3, 5.4, 2.4, '#c81a1a');
      rrect(g, 2.4, 7, 7.2, 1.8, 0.6, '#14062a'); rrect(g, 1, 14, 10, 1.4, 0.4, '#7a1010');
    }],
    lantern: [16, 24, function (g) {
      line(g, 8, 0, 8, 3, 0.8, '#14062a'); rrect(g, 3.6, 2.4, 8.8, 2.4, 0.8, '#14062a');
      ell(g, 8, 12.4, 6.6, 8, lg(g, 2, 4, 14, 20, [[0, '#ff7a6a'], [0.5, '#e82a2a'], [1, '#8a1010']]));
      [8, 11.6, 15.4].forEach((y) => line(g, 2.8, y + 1, 13.2, y + 1, 0.6, '#5a0a0a'));
      ell(g, 8, 12, 3, 4, 'rgba(255,230,140,0.55)'); rrect(g, 3.6, 19.6, 8.8, 2.4, 0.8, '#14062a'); line(g, 8, 22, 8, 24, 0.8, '#ffd23f');
    }],
    carp: [32, 16, function (g) {
      poly(g, [[2, 2], [9, 8], [2, 14]], '#2a6aff'); ell(g, 18, 8, 12, 6, lg(g, 6, 2, 6, 14, [[0, '#ffb060'], [1, '#e84a1a']]));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) ell(g, 11 + c * 4 + (r % 2) * 2, 5 + r * 2.6, 1.8, 1.4, 'rgba(255,240,200,0.45)');
      ell(g, 26, 6, 2.2, 2.2, '#ffffff'); ell(g, 26.6, 6, 1.1, 1.1, '#14062a'); poly(g, [[16, 2.4], [22, 3], [18, 0.2]], '#2a6aff');
    }],
    surf: [22, 30, function (g) {
      [[6, 4, '#ff2a9a', -0.18], [11, 3, '#27e0ff', 0], [16, 4, '#ffd23f', 0.18]].forEach((b) => { ell(g, b[0], 15, 3.8, 13, b[2], b[3]); line(g, b[0] - b[3] * 12, 4, b[0] + b[3] * 12, 26, 0.7, 'rgba(255,255,255,0.8)'); });
    }],
    sign: [20, 30, function (g) {
      rrect(g, 9, 14, 2.4, 16, 0.6, '#8a8aa8'); poly(g, [[10, 0.6], [19.4, 8], [10, 15.6], [0.6, 8]], '#ffd23f'); poly(g, [[10, 2.6], [17.4, 8], [10, 13.6], [2.6, 8]], '#14062a');
      ell(g, 9, 8.4, 3.2, 2.2, '#ffd23f'); ell(g, 12, 5.4, 1.4, 1.8, '#ffd23f'); poly(g, [[6, 9], [3.4, 11.4], [6.4, 11]], '#ffd23f');
    }],
    balloon: [14, 24, function (g) {
      line(g, 7, 15, 7, 24, 0.7, '#e8e8f8');
      ell(g, 7, 8, 6, 7.4, lg(g, 2, 1, 12, 15, [[0, '#ffb0e0'], [0.5, '#ff2a9a'], [1, '#8a0a5a']])); poly(g, [[5, 15], [9, 15], [7, 17.2]], '#ff2a9a'); ell(g, 4.6, 5, 1.6, 2.6, 'rgba(255,255,255,0.55)');
    }],
    kite: [18, 26, function (g) {
      poly(g, [[9, 0.6], [17.4, 8], [9, 17], [0.6, 8]], lg(g, 0, 0, 18, 17, [[0, '#ffd23f'], [0.5, '#ff7a2a'], [1, '#4dff7a']]));
      line(g, 9, 0.6, 9, 17, 0.6, 'rgba(255,255,255,0.8)'); line(g, 0.6, 8, 17.4, 8, 0.6, 'rgba(255,255,255,0.8)');
      g.lineWidth = 0.8; g.strokeStyle = '#e8e8f8'; g.beginPath(); g.moveTo(9, 17); g.quadraticCurveTo(5, 21, 9, 25); g.stroke();
      [[7.6, 20], [10.4, 23]].forEach((b) => poly(g, [[b[0] - 1.8, b[1] - 1], [b[0] + 1.8, b[1] - 1], [b[0], b[1] + 1.4]], '#ff2a9a'));
    }]
  };
  Object.keys(PROPS).forEach(function (k) { reg2('prop_' + k, PROPS[k][0], PROPS[k][1], PROPS[k][2], { shade: 0.4 }); });

  /* ------------------------------------------------------------------ TITLE ART */
  reg('title_burst', 8, 8, function (g) { R(g, '#ffffff', 0, 0, 8, 8); }, true);

  [['coin0', '#ffb000'], ['coin1', '#ffb000'], ['coin2', '#ffb000'], ['coin3', '#ffb000'], ['mfa', '#27e0ff'], ['ring', '#ffb000'],
    ['blast', '#27e0ff'], ['laser_emit', '#ff2a4a'], ['portal', '#27e0ff'], ['flag_on', '#27e0ff'], ['flag_off', 'rgba(0,0,0,0)'], ['terminal', '#27e0ff']
  ].forEach(function (e) { defs[e[0]] = glow(defs[e[0]], e[1], 4); });

  /* ------------------------------------------------------------------ REGISTRATION */
  // Textures are 2x dense; shrink every game object that uses one so game logic keeps 640x360 units.
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
    D: D,
    skinKeys: skinKeys,
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
      mk('drone_fly', ['drone_0', 'drone_1'], 16);
      mk('spider_crawl', ['spider_0', 'spider_1'], 8);
      skinKeys.forEach((k) => mk(k, [k + '_0', k + '_1'], k.slice(-5) === 'drone' ? 16 : k.slice(-6) === 'spider' ? 8 : 5));
      Object.keys(COINS).forEach((r) => mk('coin_' + r, [0, 1, 2, 3].map((i) => 'coin_' + r + i), 8));
      mk('hero_run', ['hero_run0', 'hero_run1', 'hero_run2', 'hero_run3'], 12);
      mk('hero_f_run', ['hero_f_run0', 'hero_f_run1', 'hero_f_run2', 'hero_f_run3'], 12);
    }
  };
})();
