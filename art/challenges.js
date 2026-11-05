/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.challenges.77'] = function (C) {
    const { FLAT, ell, glow, lg, limb, line, lit, poly, reg2, registerCloudEnemies, rng, rrect, shade, txt } = C;

    Object.assign(C, { cargoBox, dockCrane, workshopArm, cloudDeck, cloudCabinet, cloudFacility });
    reg2('pipe', 44, 46, function (g) {
        const body = lg(g, 4, 0, 40, 0, [[0, '#0a3a9a'], [0.25, '#5ac8ff'], [0.45, '#2a8af0'], [1, '#0a2a7a']]);
        g.fillStyle = body; g.fillRect(4, 13, 36, 33);
        g.fillStyle = lg(g, 0, 0, 44, 0, [[0, '#0a3a9a'], [0.22, '#8ae0ff'], [0.45, '#3a9aff'], [1, '#0a2a7a']]); rrect(g, 0, 0, 44, 14, 2, g.fillStyle);
        g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(8, 2, 3, 10); g.fillRect(10, 15, 2.4, 29);
        g.fillStyle = '#04123a'; g.fillRect(0, 13, 44, 1.2); g.fillRect(3, 2, 38, 2.6);
        g.fillStyle = 'rgba(39,224,255,0.9)'; g.fillRect(4, 13.6, 36, 0.8);
        // pipelines rocket badge
        ell(g, 22, 29, 8, 8, 'rgba(255,255,255,0.92)');
        poly(g, [[22, 22.5], [25.4, 27], [25.4, 32.5], [18.6, 32.5], [18.6, 27]], '#0a5ad8');
        poly(g, [[18.6, 30], [16, 34], [18.6, 33]], '#0a5ad8'); poly(g, [[25.4, 30], [28, 34], [25.4, 33]], '#0a5ad8');
        ell(g, 22, 27.6, 1.5, 1.5, '#7fe8ff'); poly(g, [[20.4, 33], [23.6, 33], [22, 36.4]], '#ff9a40');
      }, { shade: 0.3 });

    reg2('pbrick_top', 32, 8, function (g) {
        g.fillStyle = '#2a6ae0'; g.fillRect(0, 0, 32, 8); g.fillStyle = '#8ad8ff'; g.fillRect(0, 0, 32, 1.4);
        g.fillStyle = '#0a2a7a'; g.fillRect(0, 7, 32, 1); g.fillRect(15.4, 1.4, 1, 6);
      }, FLAT);

    reg2('pbrick', 32, 32, function (g) {
        g.fillStyle = '#123a9a'; g.fillRect(0, 0, 32, 32);
        for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) {
          const x = c * 16 + (r % 2) * 8, y = r * 8;
          g.fillStyle = (r + c) % 3 === 0 ? '#1e4ab8' : '#1a44a8'; g.fillRect(x + 0.6, y + 0.6, 14.8, 6.8);
          g.fillStyle = 'rgba(138,216,255,0.35)'; g.fillRect(x + 0.6, y + 0.6, 14.8, 0.8);
        }
      }, FLAT);

    registerCloudEnemies();

    const CARGO_PAINT = [
        ['#5498a5', '#245260', '#132e3c'], ['#d47d58', '#8a3d36', '#482c36'],
        ['#c5ad62', '#87703f', '#433c32'], ['#6c85bd', '#3c4b79', '#252b47']
      ];

    function cargoBox(g, x, y, w, h, color, label) {
        const c = CARGO_PAINT[color % CARGO_PAINT.length], door = Math.max(14, w * 0.23);
        g.fillStyle = lg(g, x, y, x, y + h, [[0, c[0]], [0.18, c[1]], [1, c[2]]]);
        g.fillRect(x, y, w, h);
        for (let rx = x + 5; rx < x + w - door; rx += 6) {
          line(g, rx, y + 5, rx, y + h - 4, 1.5, 'rgba(0,0,0,0.28)');
          line(g, rx + 1.5, y + 5, rx + 1.5, y + h - 4, 0.7, 'rgba(255,230,200,0.28)');
        }
        g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x + w - door, y + 3, door - 3, h - 6);
        line(g, x + w - door, y + 3, x + w - door, y + h - 3, 1.5, c[2]);
        for (const dx of [w - door + 4, w - 5]) {
          line(g, x + dx, y + 5, x + dx, y + h - 5, 1.3, '#a5b0aa');
          [0.3, 0.72].forEach((t) => {
            g.fillStyle = '#283440'; g.fillRect(x + dx - 2, y + h * t, 4, 3);
            line(g, x + dx - 1, y + h * t, x + dx + 2, y + h * t, 0.7, '#c2b9a2');
          });
        }
        g.strokeStyle = c[2]; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2);
        line(g, x + 2, y + 2, x + w - 2, y + 2, 1.5, '#d7c6a0');
        line(g, x + 3, y + h - 3, x + w - 3, y + h - 3, 2, '#1b2935');
        for (const dx of [2, w - 6]) for (const dy of [3, h - 6]) {
          g.fillStyle = '#33444b'; g.fillRect(x + dx, y + dy, 4, 3);
          g.fillStyle = '#c0c6b6'; g.fillRect(x + dx + 1, y + dy, 1, 1);
        }
        const r = rng(Math.round(w * 31 + h * 7 + color));
        for (let i = 0; i < w * h / 110; i++) {
          g.fillStyle = i % 2 ? 'rgba(226,188,135,0.3)' : 'rgba(20,25,30,0.28)';
          g.fillRect(x + 4 + r() * (w - 8), y + 5 + r() * (h - 10), 1 + r() * 3, 0.7);
        }
        if (w >= 64 && h >= 32) {
          txt(g, label, x + 9, y + 12, 1, '#e2e4d8');
          txt(g, 'AZ 2704', x + 9, y + h - 12, 0.5, '#c6c6b3');
          g.fillStyle = '#ded7ac'; g.fillRect(x + w - door - 10, y + h - 13, 6, 6);
          txt(g, '!', x + w - door - 8, y + h - 12, 0.5, '#44352e');
        }
      }

    function dockCrane(g, x, y, base, span, color) {
        for (const dx of [0, span * 0.58]) {
          line(g, x + dx, y, x + dx - 16, base, 5, color);
          line(g, x + dx + 3, y, x + dx - 13, base, 1, '#7b8e9a');
          for (let cy = y + 16; cy < base - 20; cy += 22) {
            line(g, x + dx - 9, cy, x + dx + 6, cy + 18, 1, color);
          }
        }
        g.fillStyle = color; g.fillRect(x - 24, y, span + 45, 7);
        for (let dx = -20; dx < span; dx += 24) {
          line(g, x + dx, y, x + dx + 18, y - 15, 1.6, color);
          line(g, x + dx + 18, y - 15, x + dx + 24, y, 1.6, color);
        }
        line(g, x - 20, y - 15, x + span + 20, y - 15, 2, color);
        const hook = x + span * 0.8;
        g.fillStyle = '#a08d62'; g.fillRect(hook - 8, y + 5, 16, 8);
        line(g, hook - 4, y + 13, hook - 4, y + 76, 0.8, '#b8b0a0');
        line(g, hook + 4, y + 13, hook + 4, y + 76, 0.8, '#b8b0a0');
        poly(g, [[hook - 10, y + 76], [hook + 10, y + 76], [hook + 6, y + 85], [hook - 6, y + 85]], '#c5a35b');
        lit(g, x + 10, y - 20, 3, 3, '#ffb46a');
      }

    function workshopArm(g, x, y, flip) {
        g.save(); g.translate(x, y); g.scale(flip ? -1 : 1, 1);
        rrect(g, -13, -9, 26, 9, 2, '#24343f');
        limb(g, 0, -9, -18, -38, 9, '#6d482f', '#d2a363', '#f3d09a');
        limb(g, -18, -38, 14, -52, 7, '#805334', '#bd854e', '#e4bb83');
        for (const p of [[0, -9], [-18, -38], [14, -52]]) {
          ell(g, p[0], p[1], 5, 5, '#3c4a50'); ell(g, p[0], p[1], 2, 2, '#b8c2bb');
        }
        line(g, 14, -52, 22, -39, 3, '#a5b4b1');
        line(g, 22, -39, 16, -32, 2, '#71878d'); line(g, 22, -39, 28, -34, 2, '#71878d');
        g.restore();
      }

    function cloudDeck(g, w, h, theme, low) {
        const edge = theme === 'actions' ? '#b9b1cb' : '#9aafb5';
        g.fillStyle = lg(g, 0, 0, 0, h, [[0, edge], [0.18, '#576772'], [0.55, '#263643'], [1, '#101f2a']]);
        g.fillRect(0, 0, w, h);
        line(g, 1, 1, w - 1, 1, 1.4, '#e3ded0');
        g.fillStyle = '#15232c'; g.fillRect(3, 4, w - 6, 5);
        for (let x = 7; x < w - 4; x += 8) {
          ell(g, x, 6, 2, 2, '#687a83'); line(g, x - 1, 5, x + 1, 5, 0.7, '#c0c4bb');
        }
        if (low) {
          g.save(); g.beginPath(); g.rect(2, h - 7, w - 4, 6); g.clip();
          g.fillStyle = '#d1ae63'; g.fillRect(2, h - 7, w - 4, 6);
          for (let x = -6; x < w; x += 12) poly(g, [[x, h - 1], [x + 6, h - 7], [x + 12, h - 7], [x + 6, h - 1]], '#26313b');
          g.restore();
        } else {
          for (let x = 4; x < w; x += 22) {
            line(g, x, h - 3, Math.min(w - 3, x + 10), 10, 1, '#84969b');
          }
        }
        [4, w - 5].forEach((x) => { ell(g, x, h - 4, 1.3, 1.3, '#d8d1b5'); });
      }

    function cloudCabinet(g, x, y, w, h, theme) {
        const identity = theme === 'entra', accent = identity ? '#87d4c7' : '#e5c27b';
        rrect(g, x, y, w, h, 2, lg(g, x, y, x + w, y, [[0, '#243a4b'], [0.4, '#627988'], [1, '#1e3345']]));
        g.strokeStyle = '#b2c4c9'; g.lineWidth = 0.8; g.strokeRect(x + 2, y + 2, w - 4, h - 4);
        for (let cx = x + 7; cx < x + w - 5; cx += 22) {
          rrect(g, cx, y + 6, Math.min(16, x + w - cx - 4), h - 12, 1, '#172d3d');
          for (let cy = y + 12; cy < y + h - 8; cy += 9) {
            line(g, cx + 2, cy, Math.min(cx + 12, x + w - 6), cy, 1, '#536d7a');
            lit(g, cx + 3, cy + 2, 2, 1, accent);
          }
        }
        if (w >= 50 && h >= 35) {
          const cx = x + w / 2, cy = y + h / 2;
          ell(g, cx, cy, 12, 12, '#244254');
          if (identity) {
            rrect(g, cx - 6, cy - 1, 12, 9, 2, accent);
            g.strokeStyle = accent; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy - 1, 4, Math.PI, 0); g.stroke();
            ell(g, cx, cy + 3, 1.4, 1.4, '#153244');
          } else poly(g, [[cx + 2, cy - 10], [cx - 6, cy + 1], [cx, cy + 1], [cx - 2, cy + 10], [cx + 7, cy - 2], [cx + 1, cy - 2]], accent);
        }
      }

    function cloudFacility(g, theme, variant, far) {
        const identity = theme === 'entra', accent = identity ? '#82cfc1' : '#dec284';
        if (far) {
          g.fillStyle = lg(g, 0, 0, 0, 360, [[0, identity ? '#17283f' : '#2c2342'], [0.65, '#304a59'], [1, '#172c3c']]);
          g.fillRect(0, 0, 640, 360);
          for (let x = 0; x < 640; x += 80) {
            poly(g, [[x, 56], [x + 76, 56], [x + 65, 260], [x + 10, 260]], '#203747');
            line(g, x + 6, 65, x + 14, 255, 2, '#4a6575');
            for (let y = 84; y < 250; y += 24) line(g, x + 18, y, x + 62, y, 0.7, '#3f5b6b');
          }
          poly(g, [[0, 280], [640, 280], [640, 360], [0, 360]], '#1a3040');
          for (let x = -320; x < 960; x += 80) line(g, 320 + (x - 320) * 0.35, 280, x, 360, 1, '#38515d');
          for (const y of [290, 312, 345]) line(g, 0, y, 640, y, 1, '#38515d');
          return;
        }
        for (const x of [18, 616]) {
          g.fillStyle = '#243e50'; g.fillRect(x, 46, 8, 254);
          line(g, x + 2, 46, x + 2, 300, 1, '#718591');
          for (let y = 62; y < 300; y += 26) ell(g, x + 4, y, 1.3, 1.3, '#90a4ae');
        }
        line(g, 0, 66, 640, 66, 5, '#263e50');
        line(g, 0, 71, 640, 71, 1, accent);
        if (identity) {
          const cx = 355 + variant * 30;
          ell(g, cx, 181, 73, 78, '#172c3b');
          ell(g, cx, 181, 66, 71, '#4f6979');
          ell(g, cx, 181, 58, 63, lg(g, cx - 60, 120, cx + 60, 245, [[0, '#516f80'], [1, '#203b4f']]));
          for (let n = 0; n < 8; n++) {
            const a = n * Math.PI / 4;
            ell(g, cx + Math.cos(a) * 62, 181 + Math.sin(a) * 67, 3, 3, '#94aaa8');
          }
          cloudCabinet(g, cx - 22, 153, 44, 58, theme);
          cloudCabinet(g, 62, 154, 102, 110, theme);
          line(g, 164, 198, cx - 74, 198, 3, accent);
          for (const x of [193, 224, 255]) {
            ell(g, x, 198, 3, 3, '#bddad3');
            line(g, x, 203, x, 232, 1, '#537581');
          }
          txt(g, 'ENTRA ID - ACCESS VAULT', 236, 89, 1, '#b7d2cf');
          txt(g, ['VERIFY IDENTITY', 'LEAST PRIVILEGE', 'REVIEW ACCESS'][variant], 222, 270, 1, accent);
        } else {
          const cx = 272 + variant * 36;
          for (const x of [72, 496]) {
            line(g, x, 80, x, 261, 9, '#4d6176');
            line(g, x - 2, 80, x - 2, 261, 2, accent);
            cloudCabinet(g, x - 28, 192, 56, 70, theme);
          }
          ell(g, cx, 190, 65, 65, '#1c3045');
          g.strokeStyle = '#788a99'; g.lineWidth = 5;
          g.beginPath(); g.ellipse(cx, 190, 59, 59, 0, 0, Math.PI * 2); g.stroke();
          g.strokeStyle = '#bca578'; g.lineWidth = 2;
          g.beginPath(); g.ellipse(cx, 190, 50, 50, 0, 0, Math.PI * 2); g.stroke();
          ell(g, cx, 190, 33, 38, lg(g, cx - 30, 152, cx + 30, 225, [[0, '#d6bd89'], [0.5, '#755973'], [1, '#354b67']]));
          poly(g, [[cx + 6, 161], [cx - 15, 193], [cx + 1, 193], [cx - 6, 218], [cx + 19, 183], [cx + 3, 183]], '#ead4a6');
          for (let n = 0; n < 8; n++) {
            const a = n * Math.PI / 4;
            ell(g, cx + Math.cos(a) * 58, 190 + Math.sin(a) * 58, 3, 3, accent);
          }
          line(g, 86, 260, 490, 260, 4, '#3e5b6c');
          txt(g, 'AZURE FUNCTIONS - EVENT REACTOR', 195, 91, 1, '#d5c9b9');
          txt(g, ['TRIGGER', 'PROCESS', 'OBSERVE'][variant], cx - 26, 271, 1, accent);
        }
      }

    Object.assign(C, { CARGO_PAINT });
  };
})();
