/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.street.67'] = function (C) {
    const { FLAT, ell, glowRect, lg, line, lit, msLogo, poly, reg2, rng, rrect, shade, txt } = C;

    Object.assign(C, { regWater, bridgeArt, boatArt });
    reg2('quay_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ffe0b8'], [0.2, '#b48aa0'], [1, '#4a2e62']]); g.fillRect(0, 0, 32, 8);
        for (let r = 0; r < 2; r++) for (let x = r ? -2 : 0; x < 32; x += 4) {
          ell(g, x + 2, 2.8 + r * 2.7, 1.8, 1.15, r ? '#7a5a86' : '#a8829c');
          g.fillStyle = 'rgba(255,230,190,0.55)'; g.fillRect(x + 1.1, 2 + r * 2.7, 1.4, 0.5);
        }
        g.fillStyle = '#2a1636'; g.fillRect(0, 7.2, 32, 0.8);
        poly(g, [[0, 0], [27, 0], [32, 4], [5, 4]], 'rgba(224,195,169,0.25)');
        for (const x of [8, 24]) line(g, x, 0.5, x + 5, 4, 0.6, '#73506b');
        line(g, 0, 4.8, 32, 4.8, 0.6, '#57354c');
      }, FLAT);

    reg2('quay', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#8e3c3c'], [1, '#4a1a40']]); g.fillRect(0, 0, 32, 32);
        const r = rng(41);
        for (let y = 0; y < 32; y += 3.2) {
          const row = Math.round(y / 3.2), off = (row % 2) * 3;
          for (let x = off - 6; x < 32; x += 6) { g.fillStyle = 'rgba(255,170,140,' + (0.05 + r() * 0.16) + ')'; g.fillRect(x + 0.4, y + 0.4, 5.2, 2.4); }
          g.fillStyle = 'rgba(30,8,30,0.5)'; g.fillRect(0, y, 32, 0.5);
          for (let x = off; x < 32; x += 6) g.fillRect(x, y, 0.5, 3.2);
        }
        g.fillStyle = 'rgba(200,170,190,0.85)'; g.fillRect(0, 0, 32, 1.2);
        g.fillStyle = 'rgba(80,140,90,0.35)'; g.fillRect(0, 28, 32, 4);
      }, FLAT);

    reg2('embank_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#f0e8ff'], [0.2, '#a8a4c8'], [1, '#4a4878']]); g.fillRect(0, 0, 32, 8);
        g.fillStyle = 'rgba(30,26,70,0.6)'; g.fillRect(0, 4.4, 32, 0.6); g.fillRect(15.6, 0, 0.6, 4.4); g.fillRect(7.6, 4.4, 0.6, 3.6); g.fillRect(23.6, 4.4, 0.6, 3.6);
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(1, 1, 12, 0.5); g.fillRect(17, 1, 12, 0.5);
        g.fillStyle = '#ffd890'; g.globalAlpha = 0.35; g.fillRect(0, 0, 32, 1); g.globalAlpha = 1;
        poly(g, [[0, 0], [27, 0], [32, 4], [5, 4]], 'rgba(219,219,224,0.2)');
        for (const x of [8, 24]) line(g, x, 0.5, x + 5, 4, 0.7, '#68647d');
      }, FLAT);

    reg2('embank', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#6a6a9a'], [1, '#2a2a58']]); g.fillRect(0, 0, 32, 32);
        for (let y = 0; y < 32; y += 8) {
          const off = (y / 8) % 2 ? 8 : 0;
          for (let x = off - 16; x < 32; x += 16) {
            g.fillStyle = lg(g, 0, y, 0, y + 8, [[0, 'rgba(200,200,255,0.25)'], [1, 'rgba(10,10,40,0.25)']]); g.fillRect(x + 0.6, y + 0.6, 14.8, 6.8);
            g.fillStyle = 'rgba(15,12,45,0.7)'; g.fillRect(x, y, 0.7, 8);
          }
          g.fillStyle = 'rgba(15,12,45,0.7)'; g.fillRect(0, y, 32, 0.7);
        }
      }, FLAT);

    reg2('pier_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ffe2a8'], [0.25, '#c8864a'], [1, '#6a3a2a']]); g.fillRect(0, 0, 32, 8);
        for (let x = -4; x < 32; x += 8) {
          line(g, x, 0, x + 7, 6, 0.8, '#724a30');
          line(g, x + 1, 0, x + 8, 6, 0.6, '#e1b477');
        }
        g.fillStyle = '#3a1a12'; g.fillRect(0, 6, 32, 2);
      }, FLAT);

    reg2('pier', 32, 32, function (g) {
        g.fillStyle = 'rgba(14,10,46,0.55)'; g.fillRect(0, 0, 32, 32);
        line(g, 4, 0, 28, 32, 1.6, '#5a3226'); line(g, 28, 0, 4, 32, 1.6, '#5a3226');
        [3, 19].forEach(function (x) { g.fillStyle = lg(g, x, 0, x + 6, 0, [[0, '#a8683e'], [1, '#4a2418']]); g.fillRect(x, 0, 6, 32); g.fillStyle = 'rgba(255,220,170,0.3)'; g.fillRect(x + 0.6, 0, 0.6, 32); });
        g.fillStyle = 'rgba(39,224,255,0.25)'; g.fillRect(0, 26, 32, 1);
      }, FLAT);

    reg2('neon_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ffd0f0'], [0.2, '#ff3aa0'], [0.45, '#3a1a7a'], [1, '#1a0a40']]); g.fillRect(0, 0, 32, 8);
        for (let x = 1; x < 32; x += 8) lit(g, x, 4.6, 4, 1, x % 16 ? '#27e0ff' : '#ffe14a');
        poly(g, [[0, 0], [27, 0], [32, 3.5], [5, 3.5]], '#65467e');
        for (const x of [8, 24]) line(g, x, 0.5, x + 5, 3.5, 0.7, '#c78eb7');
      }, FLAT);

    reg2('neon', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 32, 0, [[0, '#2a1260'], [1, '#140838']]); g.fillRect(0, 0, 32, 32);
        const r = rng(53), cols = ['#ff7ad9', '#27e0ff', '#ffe9a0', '#ff5a6a'];
        for (let y = 2; y < 32; y += 5) for (let x = 2; x < 24; x += 5) { if (r() < 0.55) lit(g, x, y, 3, 3, cols[Math.floor(r() * 4)]); else { g.fillStyle = 'rgba(5,2,20,0.7)'; g.fillRect(x, y, 3, 3); } }
        glowRect(g, '#ff3aa0', 26.5, 0, 3, 32); g.fillStyle = '#ff3aa0'; g.fillRect(26.5, 0, 3, 32);
        for (let y = 2; y < 32; y += 6) { g.fillStyle = '#ffffff'; g.fillRect(27.3, y, 1.4, 3); g.fillRect(26.9, y + 1.2, 2.2, 0.6); }
      }, FLAT);

    reg2('grass_top', 32, 8, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#d8ff9a'], [0.3, '#5ac83a'], [1, '#2a7a2a']]); g.fillRect(0, 0, 32, 8);
        for (let x = 0; x < 32; x += 2) { g.fillStyle = 'rgba(255,255,200,0.5)'; g.fillRect(x, 0, 0.6, 1.4 + (x % 3)); }
        poly(g, [[0, 0], [26, 0], [32, 4], [6, 4]], 'rgba(172,218,101,0.24)');
        for (const x of [7, 20]) line(g, x, 1, x + 4, 3.5, 0.6, '#4c9d37');
      }, FLAT);

    reg2('grass', 32, 32, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#2a7a2a'], [1, '#6a4a2a']]); g.fillRect(0, 0, 32, 32);
        const r = rng(12); for (let i = 0; i < 14; i++) ell(g, r() * 32, r() * 32, 1 + r(), 0.7, 'rgba(20,40,10,0.4)');
      }, FLAT);

    reg2('rail_embank', 16, 14, function (g) {
        g.fillStyle = lg(g, 0, 0, 0, 3, [[0, '#f0ecff'], [1, '#8a88b8']]); g.fillRect(0, 0, 16, 2.6);
        for (let x = 2; x < 16; x += 4) { ell(g, x, 6.4, 1.3, 2.4, '#b8b4dc'); g.fillStyle = '#8a88b8'; g.fillRect(x - 0.7, 2.6, 1.4, 9); }
        g.fillStyle = '#6a6898'; g.fillRect(0, 11.4, 16, 2.6);
      }, FLAT);

    reg2('rail_pier', 16, 12, function (g) {
        g.fillStyle = lg(g, 0, 0, 4, 0, [[0, '#c8864a'], [1, '#5a3020']]); g.fillRect(0, 0, 2.6, 12);
        g.strokeStyle = '#f0e0c0'; g.lineWidth = 0.7;
        [2.4, 6.4].forEach(function (y) { g.beginPath(); g.moveTo(2.6, y); g.quadraticCurveTo(9, y + 2.4, 16, y); g.stroke(); });
      }, FLAT);

    reg2('rail_quay', 16, 10, function (g) {
        rrect(g, 6, 1, 3.4, 9, 1.4, lg(g, 6, 0, 9.4, 0, [[0, '#c84a3a'], [1, '#5a1414']]));
        g.fillStyle = '#ffd8c0'; [3, 5, 7].forEach(function (y) { g.fillRect(6.6, y, 2.2, 0.5); });
      }, FLAT);

    const WATER = {
    westeurope: C.part('amsterdam', 'WATER_westeurope'),
    uksouth: C.part('london', 'WATER_uksouth'),
    australiaeast: C.part('sydney', 'WATER_australiaeast')
    };

    function regWater(k, c) {
        reg2('water_' + k, 64, 40, function (g) {
          g.fillStyle = lg(g, 0, 0, 0, 40, [[0, c[0]], [1, c[1]]]); g.fillRect(0, 0, 64, 40);
          const r = rng(k.length * 7);
          for (let i = 0; i < 26; i++) {
            const y = 3 + r() * 34, x = r() * 64, w = 4 + r() * 12;
            g.fillStyle = i % 3 ? 'rgba(255,255,255,' + (0.1 + (1 - y / 40) * 0.25) + ')' : c[i % 2 ? 2 : 3];
            g.globalAlpha = i % 3 ? 1 : 0.5 * (1 - y / 44); g.fillRect(x, y, w, 0.6); if (x + w > 64) g.fillRect(x - 64, y, w, 0.6); g.globalAlpha = 1;
          }
          g.fillStyle = c[2]; g.globalAlpha = 0.85; for (let x = 0; x < 64; x += 1) g.fillRect(x, 0.6 + Math.sin(x / 64 * Math.PI * 4) * 0.6, 1, 0.9); g.globalAlpha = 1;
          g.fillStyle = 'rgba(255,255,255,0.8)'; for (let x = 0; x < 64; x += 16) g.fillRect(x + 3, 0.4, 5, 0.5);
        }, FLAT);
      }

    Object.keys(WATER).forEach(function (k) { regWater(k, WATER[k]); });

    function bridgeArt(kind) { return C.regionPart(kind, 'bridge'); }

    ['westeurope', 'uksouth', 'australiaeast'].forEach(function (k) { reg2('bridge_' + k, 160, 100, bridgeArt(k), { shade: 0.2, noOutline: true }); });

    function boatArt(o) {
        return function (g) {
          poly(g, [[2, 18], [112, 18], [119, 22], [114, 34], [8, 34], [0, 24]], lg(g, 0, 18, 0, 34, [[0, o.hull[0]], [1, o.hull[1]]]));
          g.fillStyle = o.stripe; g.fillRect(3, 24, 112, 1.6);
          g.fillStyle = lg(g, 0, 6, 0, 18, [[0, o.cab[0]], [1, o.cab[1]]]); rrect(g, 10, 6, 96, 13, 3, g.fillStyle);
          for (let x = 14; x < 102; x += 8) { g.fillStyle = 'rgba(10,8,40,0.7)'; g.fillRect(x, 9, 6, 6); lit(g, x + 0.6, 9.6, 4.8, 4.8, o.win[(x / 8) % o.win.length | 0]); }
          g.fillStyle = o.roof; g.fillRect(8, 5, 100, 2.4); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(8, 5, 100, 0.6);
          if (o.logo) { msLogo(g, 54, 26.4, 6); }
          if (o.name) txt(g, o.name, 64, 27.6, 0.5, '#ffffff');
          g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(0, 33, 120, 0.8);
        };
      }

    const BOATS = {
    westeurope: C.part('amsterdam', 'BOATS_westeurope'),
    uksouth: C.part('london', 'BOATS_uksouth'),
    australiaeast: C.part('sydney', 'BOATS_australiaeast')
    };

    Object.keys(BOATS).forEach(function (k) { reg2('boat_' + k, 120, 36, boatArt(BOATS[k]), { shade: 0.35 }); });

    Object.assign(C, { WATER, BOATS });
  };
})();
