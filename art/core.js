/* Shared canvas tools and ordered, local artwork factories. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const stages = {};
  const regions = {};
  const context = {
    part: function (slug, name) {
      return AH.Worlds[slug].art.parts[name](context);
    },
    regionPart: function (region, name, optional) {
      const factory = regions[region].parts[name];
      return factory ? factory(context) : optional ? null : undefined;
    },
    sceneryRegistry: function (name) {
      return Object.fromEntries(AH.WorldOrder.map(function (slug, index) {
        const world = AH.Worlds[slug];
        const content = world.art;
        const region = world.world.region;
        const part = name + '_' + region;
        const order = content.registryOrder && content.registryOrder[name];
        return { slug: slug, region: region, part: part, order: order === undefined ? index : order, content: content };
      }).filter(function (entry) {
        return !!entry.content.parts[entry.part];
      }).sort(function (a, b) {
        return a.order - b.order;
      }).map(function (entry) {
        return [entry.region, context.part(entry.slug, entry.part)];
      }));
    }
  };
  AH.ArtModules = { stages: stages, context: context, regions: regions };
})();

/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.core.0'] = function (C) {

    Object.assign(C, { cv, R, outline, crisp, shade, glow, upscale, reg, reg2, regArt, disc, rng, lerpCol, lg, poly, ell, rrect, limb, line, depthFace, depthGround, sprayTag });
    const NAVY = '#0a0720';

    const D = 2;

    const defs = {};

    const density = { value: D, hd: false };

    function sprayTag(g, text, x, y, scale, paint, edge) {
        const width = C.txtW(text, scale), height = 7 * scale;
        g.save();
        g.translate(x, y);
        g.transform(1, -0.06, 0.16, 1, 0, 0);
        g.shadowColor = paint; g.shadowBlur = 5;
        g.globalAlpha = 0.55;
        C.txt(g, text, 0, 0, scale, paint);
        g.shadowBlur = 0;
        g.globalAlpha = 0.9;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]])
          C.txt(g, text, dx, dy, scale, edge);
        C.txt(g, text, 0, 0, scale, paint);
        for (let i = 0; i < 100; i++) {
          const sx = (i * 37 % 101) / 101 * (width + 10) - 5;
          const sy = (i * 61 % 103) / 103 * (height + 10) - 5;
          g.globalAlpha = i % 3 ? 0.18 : 0.35;
          ell(g, sx, sy, i % 4 ? 0.35 : 0.65, 0.35, paint);
        }
        g.globalAlpha = 0.75;
        for (let i = 0; i < text.length; i++) {
          const dx = i * 6 * scale + 2;
          line(g, dx, height - 1, dx, height + 3 + i % 3 * 2, 0.8, paint);
          ell(g, dx, height + 3 + i % 3 * 2, 0.6, 0.9, paint);
        }
        g.restore();
      }

    function depthFace(g, x, top, width, base, depth, side, roof) {
        const d = Math.min(depth, width / 3, (base - top) / 3);
        poly(g, [[x + width - d, top], [x + width, top + d], [x + width, base], [x + width - d, base]], side);
        poly(g, [[x, top], [x + width - d, top], [x + width, top + d], [x + d, top + d]], roof);
      }

    function depthGround(g, x, base, width, depth, front, top) {
        const d = Math.min(depth, width / 4);
        g.fillStyle = front; g.fillRect(x, base - d, width, d);
        poly(g, [[x, base - d], [x + width - d, base - d], [x + width, base - d / 2], [x + d, base - d / 2]], top);
        for (let tx = x + d; tx < x + width - d; tx += 24) {
          line(g, tx, base - d, tx + d, base - d / 2, 0.6, 'rgba(20,25,40,0.3)');
        }
        line(g, x + d, base - d / 2, x + width, base - d / 2, 0.8, 'rgba(240,226,204,0.45)');
      }

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

    function crisp(c) {
        const g = c.getContext('2d');
        const img = g.getImageData(0, 0, c.width, c.height);
        for (let i = 3; i < img.data.length; i += 4) img.data[i] = img.data[i] > 110 ? 255 : 0;
        g.putImageData(img, 0, 0);
      }

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

    function reg2(key, w, h, fn, opt) { regArt(key, w, h, fn, opt); }

    function regArt(key, w, h, fn, opt) {
        opt = opt || {};
        let c = cv(w * density.value, h * density.value);
        const g = c.getContext('2d');
        g.scale(density.value, density.value);
        fn(g, w, h);
        crisp(c);
        if (opt.shade !== 0) shade(c, opt.shade === undefined ? 0.6 : opt.shade);
        if (!opt.noOutline) { outline(c); if (density.value > D) outline(c); }
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

    Object.assign(C, { NAVY, D, defs, density });
  };
})();
