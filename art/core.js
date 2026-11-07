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

    Object.assign(C, { cv, R, outline, crisp, shade, glow, upscale, reg, reg2, regArt, disc, rng, lerpCol, lg, poly, ell, rrect, limb, line, depthFace, depthGround, sprayTag, registerGraffiti, registerForeground });
    const NAVY = '#0a0720';

    const D = 2;

    const defs = {};

    const density = { value: D, hd: false };

    function sprayTag(g, text, x, y, scale, paint, edge, glyphs, style) {
        const width = glyphs ? text.length * 10 * scale : C.txtW(text, scale), height = (glyphs ? 9 : 7) * scale;
        const draw = (dx, dy, color) => {
          if (!glyphs && !style) { C.txt(g, text, dx, dy, scale, color); return; }
          g.fillStyle = color;
          Array.from(text).forEach((ch, i) => {
            const rows = glyphs ? glyphs[ch] : C.glyph(ch);
            if (!rows) throw new Error('UNKNOWN DECORATIVE GLYPH: ' + ch);
            g.save();
            g.translate(dx + i * (glyphs ? 10 : 6) * scale, dy);
            if (style === 'wild') {
              g.translate(0, i % 2 ? scale * 0.5 : 0);
              g.rotate(i % 2 ? 0.08 : -0.08);
              g.transform(1, 0, -0.25, 1, 0, 0);
            }
            rows.forEach((row, ry) => Array.from(row).forEach((pixel, rx) => {
              if (pixel !== '1' && pixel !== '#') return;
              if (style === 'bubble') rrect(g, (rx - 0.18) * scale, (ry - 0.18) * scale,
                1.36 * scale, 1.36 * scale, 0.55 * scale, color);
              else g.fillRect(rx * scale, (ry + (style === 'stencil' && ry === 3 ? 0.25 : 0)) * scale,
                scale, scale * (style === 'stencil' && ry === 3 ? 0.7 : 1));
            }));
            g.restore();
          });
        };
        g.save();
        g.translate(x, y);
        g.transform(1, style === 'stencil' ? 0 : -0.06, style === 'wild' ? 0.3 : 0.16, 1, 0, 0);
        g.shadowColor = paint; g.shadowBlur = 5;
        g.globalAlpha = 0.55;
        draw(0, 0, paint);
        if (style === 'wild') {
          line(g, 0, height + 1, width, height - 1, 1, edge);
          poly(g, [[width - 3, height - 4], [width + 5, height - 1], [width - 2, height + 3]], paint);
        }
        g.shadowBlur = 0;
        g.globalAlpha = 0.9;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]])
          draw(dx, dy, edge);
        draw(0, 0, paint);
        for (let i = 0; i < 100; i++) {
          const sx = (i * 37 % 101) / 101 * (width + 10) - 5;
          const sy = (i * 61 % 103) / 103 * (height + 10) - 5;
          g.globalAlpha = i % 3 ? 0.18 : 0.35;
          ell(g, sx, sy, i % 4 ? 0.35 : 0.65, 0.35, paint);
        }
        g.globalAlpha = 0.75;
        for (let i = 0; i < text.length; i++) {
          const dx = i * (glyphs ? 10 : 6) * scale + 2;
          line(g, dx, height - 1, dx, height + 3 + i % 3 * 2, 0.8, paint);
          ell(g, dx, height + 3 + i % 3 * 2, 0.6, 0.9, paint);
        }
        g.restore();
      }

    function registerGraffiti(region, design) {
        return design.tags.map((tag, variant) => {
          const key = 'graffiti_' + region + '_' + variant;
          const style = ['bubble', 'stencil', 'wild'][variant];
          const brand = variant === 1 ? 'AZUREKID' : 'AZURE HEROES';
          reg2(key, 320, 64, function (g) {
            sprayTag(g, brand, 12, 10, variant === 1 ? 3.1 : 2.7, design.paint, '#24304c', null, style);
            sprayTag(g, tag, 18, 39, design.glyphs ? 1.8 : 2, design.accent, '#25304b', design.glyphs, style);
            octocat(g, 279, 24, 1);
            if (variant === 1) copilot(g, 235, 22, 1);
          }, { shade: 0, noOutline: true });
          reg2(key + '_front', 320, 24, function (g) {
            sprayTag(g, brand, 8, 6, 1.6, design.paint, '#24304c', null, style);
            sprayTag(g, tag, 132, 7, design.glyphs ? 1.1 : 1, design.accent, '#25304b', design.glyphs, style);
            octocat(g, 295, 7, 0.32);
            if (variant === 1) copilot(g, 265, 8, 0.4);
          }, { shade: 0, noOutline: true });
          return key;
        });
        function octocat(g, x, y, scale) {
            g.save(); g.translate(x, y); g.scale(scale, scale);
            g.shadowColor = design.accent; g.shadowBlur = 3;
            poly(g, [[-17, -9], [-16, -19], [-5, -14], [5, -14], [16, -19],
              [17, -9], [20, -1], [17, 9], [7, 13], [-7, 13], [-17, 9], [-20, -1]], design.accent);
            ell(g, 0, 2, 14, 9, '#26334b');
            ell(g, -6, 0, 2, 3, design.paint); ell(g, 6, 0, 2, 3, design.paint);
            line(g, -3, 6, 3, 6, 1, design.paint);
            for (const dx of [-8, -3, 3, 8]) line(g, dx, 12, dx * 1.5, 22, 3, design.accent);
            g.beginPath(); g.moveTo(-9, 16); g.bezierCurveTo(-24, 17, -25, 8, -29, 9);
            g.strokeStyle = design.accent; g.lineWidth = 3; g.stroke();
            line(g, -14, 27, 13, 27, 1, design.accent);
            g.restore();
        }
        function copilot(g, x, y, scale) {
            g.save(); g.translate(x, y); g.scale(scale, scale);
            g.shadowColor = design.paint; g.shadowBlur = 3;
            rrect(g, -15, -10, 30, 24, 6, design.paint);
            rrect(g, -18, -6, 36, 12, 4, '#25304b');
            for (const dx of [-12, 2]) {
              rrect(g, dx, -4, 10, 8, 3, design.accent);
              line(g, dx + 2, -2, dx + 7, -2, 1, '#f1f4ff');
            }
            line(g, -9, 8, -4, 11, 1, '#25304b'); line(g, 4, 11, 9, 8, 1, '#25304b');
            line(g, 0, -10, 0, -16, 2, design.accent);
            ell(g, 0, -18, 3, 2, design.accent);
            g.restore();
        }
      }

    function registerForeground(region, design) {
        reg2('bg_fore_' + region, 960, 200, function (g) {
          for (let i = 0; i < 8; i++) {
            const x = i * 120, top = 70 + i * 23 % 65, width = 96;
            g.fillStyle = lg(g, x, top, x + width, 200, [[0, design.wall], [1, design.roof]]);
            g.fillRect(x, top, width, 200 - top);
            depthFace(g, x, top, width, 200, 9, design.roof, design.accent);
            if (design.shape === 'gable') {
              poly(g, [[x - 3, top], [x + 48, top - 42], [x + 99, top]], design.roof);
              line(g, x + 4, top - 1, x + 48, top - 37, 2, design.accent);
              rrect(g, x + 42, top - 21, 12, 14, 1, design.light);
            } else if (design.shape === 'terrace') {
              g.fillStyle = design.accent; g.fillRect(x - 2, top - 5, width + 4, 5);
              for (let c = 12; c < width; c += 24) {
                g.fillStyle = design.roof; g.fillRect(x + c, top - 19, 8, 15);
              }
            } else if (design.shape === 'rack') {
              for (let y = top + 10; y < 198; y += 18) {
                g.fillStyle = design.roof; g.fillRect(x + 8, y, 73, 13);
                for (let c = 12; c < 78; c += 10) line(g, x + c, y + 4, x + c + 5, y + 4, 1, design.accent);
              }
            } else {
              g.fillStyle = design.roof; g.fillRect(x - 3, top - 6, width + 6, 6);
              line(g, x + 22, top - 5, x + 22, top - 30, 1, design.accent);
              line(g, x + 12, top - 26, x + 34, top - 26, 1, design.accent);
            }
            if (design.shape !== 'rack') for (let y = top + 15; y < 182; y += 25) for (let c = 12; c < 84; c += 24) {
              g.fillStyle = design.roof; g.fillRect(x + c, y, 15, 18);
              g.fillStyle = (i + c / 12) % 3 ? design.light : design.accent;
              g.fillRect(x + c + 2, y + 2, 11, 12);
              line(g, x + c + 7, y + 2, x + c + 7, y + 14, 1, design.wall);
              line(g, x + c, y + 18, x + c + 15, y + 18, 2, design.accent);
            }
            if (design.detail === 'balcony') {
              for (let y = top + 36; y < 189; y += 28) {
                line(g, x + 8, y, x + 85, y, 2, design.roof);
                for (let c = 12; c < 85; c += 10) line(g, x + c, y, x + c, y - 8, 1, design.roof);
              }
            } else if (design.detail === 'lantern') {
              line(g, x + 85, top + 8, x + 106, top + 8, 1, design.roof);
              rrect(g, x + 96, top + 10, 12, 18, 3, design.accent);
              line(g, x + 102, top + 12, x + 102, top + 27, 1, design.light);
            } else if (design.detail === 'palm') {
              line(g, x + 108, 198, x + 103, top + 28, 5, design.roof);
              for (const dx of [-28, -14, 14, 28]) poly(g,
                [[x + 103, top + 25], [x + 103 + dx, top + 15], [x + 103 + dx * 0.8, top + 35]],
                design.accent);
            } else {
              line(g, x + 8, top + 3, x + 117, top + 16, 1, design.roof);
              rrect(g, x + 67, top + 23, 20, 8, 1, design.accent);
            }
            line(g, x, 198, x + 116, 198, 2, design.roof);
          }
        }, { shade: 0, noOutline: true });
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
