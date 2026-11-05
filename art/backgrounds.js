/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.backgrounds.8'] = function (C) {
    const { FLAT, depthFace, depthGround, ell, glowRect, lerpCol, lg, line, poly, reg2, rng } = C;

    Object.assign(C, { skyline, mesas, makeSky });
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
        for (let x = -160; x <= 800; x += 80) line(g, 320 + (x - 320) * 0.6, 80, x, 120, 0.7, '#35225d');
        for (const y of [86, 98, 116]) line(g, 0, y, 640, y, 0.7, '#35225d');
        for (let x = 0; x < 640; x += 160) {
          g.fillStyle = lg(g, x, 0, x + 12, 0, [[0, '#4a2aa8'], [1, '#1a0c4a']]); g.fillRect(x, 20, 12, 100);
          depthFace(g, x, 20, 12, 120, 4, '#160e37', '#7954b2');
          g.fillStyle = '#ff7ad9'; g.fillRect(x, 20, 12, 1.4);
          glowRect(g, '#ff7ad9', x + 4, 30, 4, 4); g.fillStyle = '#ff7ad9'; g.fillRect(x + 4, 30, 4, 4);
          g.fillStyle = lg(g, 0, 40, 0, 50, [[0, '#5a3ac8'], [1, '#1a0c4a']]); g.fillRect(x, 40, 160, 10);
          depthFace(g, x, 40, 160, 50, 3, '#20133e', '#76539a');
          g.fillStyle = 'rgba(39,224,255,0.6)'; g.fillRect(x + 20, 43, 30, 1);
          g.fillStyle = 'rgba(255,122,217,0.6)'; g.fillRect(x + 80, 46, 40, 1);
          for (let k = 0; k < 4; k++) { g.lineWidth = 1.6; g.strokeStyle = ['#27e0ff', '#ff7ad9', '#ffd23f', '#4dff7a'][k]; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x + 12, 52 + k * 5); g.quadraticCurveTo(x + 80, 66 + k * 5, x + 160, 52 + k * 5); g.stroke(); g.globalAlpha = 1; }
          depthGround(g, x + 27, 119, 108, 8, '#100b2c', '#44345c');
          g.fillStyle = '#24213f'; g.fillRect(x + 31, 65, 92, 48);
          depthFace(g, x + 31, 65, 92, 113, 7, '#14112b', '#57436f');
          for (let cx = x + 36; cx < x + 111; cx += 23) {
            g.fillStyle = '#100f28'; g.fillRect(cx, 75, 18, 33);
            for (let y = 79; y < 106; y += 6) {
              line(g, cx + 2, y, cx + 15, y, 0.8, '#4f4068');
              g.fillStyle = '#5c929b'; g.fillRect(cx + 2, y + 2, 1.5, 1);
            }
          }
        }
      }, FLAT);

    const SKIES = {
    title: { stops: [[0, '#0d0430'], [0.3, '#2c1070'], [0.5, '#6a2aa8'], [0.66, '#d6379a'], [0.8, '#ff7a59'], [0.92, '#ffb85e'], [1, '#ffd98a']], sun: { x: 450, y: 215, r: 74, c: ['#fff6a0', '#ffb347', '#ff4fa0'] }, halo: ['rgba(255,210,120,0.55)', 'rgba(255,100,160,0.2)'], cl: ['rgba(120,50,190,0.5)', 'rgba(255,122,217,0.65)', 'rgba(255,200,150,0.5)'], hz: 'rgba(255,200,120,0.5)', stars: 160, seed: 3 },
    westeurope: C.part('amsterdam', 'SKIES_westeurope'),
    uksouth: C.part('london', 'SKIES_uksouth'),
    japaneast: C.part('tokyo', 'SKIES_japaneast'),
    australiaeast: C.part('sydney', 'SKIES_australiaeast'),
    brazilsouth: C.part('rio', 'SKIES_brazilsouth'),
    eastus: C.part('virginia', 'SKIES_eastus'),
    eastus2: C.part('new-york', 'SKIES_eastus2')
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

    const W_CL = ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.55)'];

    const TOD_SKIES = {
        night: { stops: [[0, '#02030f'], [0.45, '#0a0c30'], [0.8, '#1c1a5a'], [1, '#3a2a7a']], sun: { x: 480, y: 76, r: 20, c: ['#ffffff', '#eef0ff', '#c0c6f0'] }, halo: ['rgba(200,210,255,0.45)', 'rgba(120,130,255,0.12)'], cl: ['rgba(30,30,90,0.6)', 'rgba(110,110,200,0.35)', 'rgba(200,210,255,0.3)'], hz: 'rgba(90,70,200,0.4)', stars: 280, seed: 23, stripes: false },
        sunrise: { stops: [[0, '#1a1a5a'], [0.35, '#5a4aa8'], [0.62, '#ff8ab0'], [0.82, '#ffb080'], [1, '#ffe8b0']], sun: { x: 170, y: 268, r: 56, c: ['#fffbe0', '#ffd080', '#ff8a6a'] }, halo: ['rgba(255,220,160,0.6)', 'rgba(255,150,170,0.25)'], cl: ['rgba(150,110,200,0.5)', 'rgba(255,170,190,0.7)', 'rgba(255,230,190,0.6)'], hz: 'rgba(255,210,160,0.6)', stars: 30, seed: 29, stripes: false },
        morning: { stops: [[0, '#3a7ae0'], [0.5, '#7ab8ff'], [0.85, '#c8e4ff'], [1, '#fff0d8']], sun: { x: 190, y: 150, r: 32, c: ['#ffffff', '#fff6c0', '#ffe080'] }, halo: ['rgba(255,250,200,0.6)', 'rgba(255,240,200,0.2)'], cl: W_CL, hz: 'rgba(255,245,225,0.55)', stars: 0, seed: 31, stripes: false },
        day: { stops: [[0, '#1a5ad8'], [0.5, '#4a9aff'], [0.88, '#a8d8ff'], [1, '#dcf2ff']], sun: { x: 430, y: 56, r: 28, c: ['#ffffff', '#ffffe0', '#fff2a0'] }, halo: ['rgba(255,255,220,0.65)', 'rgba(255,255,255,0.15)'], cl: W_CL, hz: 'rgba(230,245,255,0.55)', stars: 0, seed: 37, stripes: false },
        afternoon: { stops: [[0, '#2a5ac8'], [0.45, '#6aa0f0'], [0.8, '#ffd8a0'], [1, '#ffc080']], sun: { x: 480, y: 160, r: 40, c: ['#ffffff', '#ffe8a0', '#ffb050'] }, halo: ['rgba(255,230,160,0.6)', 'rgba(255,200,120,0.2)'], cl: ['rgba(255,240,220,0.7)', 'rgba(255,220,180,0.85)', 'rgba(255,255,255,0.5)'], hz: 'rgba(255,210,150,0.55)', stars: 0, seed: 41, stripes: false }
      };

    reg2('tod_wash', 8, 220, function (g) { g.fillStyle = lg(g, 0, 0, 0, 220, [[0, 'rgba(255,255,255,0)'], [0.45, 'rgba(255,255,255,1)'], [0.85, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0.4)']]); g.fillRect(0, 0, 8, 220); }, FLAT);

    Object.keys(TOD_SKIES).forEach(function (k) { reg2('bg_sky_tod_' + k, 640, 360, makeSky(TOD_SKIES[k]), FLAT); });

    Object.keys(SKIES).forEach(function (k) { if (k !== 'title') reg2('bg_sky_' + k, 640, 360, makeSky(SKIES[k]), FLAT); });

    Object.assign(C, { SKIES, W_CL, TOD_SKIES });
  };
})();
