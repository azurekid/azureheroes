/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.hero.2'] = function (C) {
    const { GOLD_SUIT, HERO_DEF, HERO_GEAR, HERO_HAIR, HERO_HAIR_STYLES, HERO_HATS, HERO_REGIONAL_HAIR, HERO_SKIN, HERO_SUIT, density, ell, glow, lg, limb, line, poly, reg2, regArt, rng, rrect, shade } = C;
    const lit = (...args) => C.lit(...args);

    Object.assign(C, { applyLook, heroCape, heroLeg, heroEmblem, heroBust, heroTorso, heroOutfit, heroHDTorso, hatBack, underHat, hairBack, hairFront, heroHat, heroGear, heroClog, hackerFace, hackerVisor, hackerHood, hackerTerminal, heroHead, heroShoulder, heroArm, hero, regHero });
    const H = {};

    let FEM = false, HAIR = 'swoop', HAT = 'none', GEAR = 'none';

    const known = (list, k) => list.some((x) => x[0] === k);

    function applyLook(L) {
        const S = L.suit === 'gold' ? GOLD_SUIT : HERO_SUIT[L.suit] || HERO_SUIT[0];
        Object.assign(H, S);
        H.outfit = S.outfit || null;
        H.guide = !!L.guide;
        const s = HERO_SKIN[L.skin] || HERO_SKIN[1], h = HERO_HAIR[L.hairCol] || HERO_HAIR[0];
        H.skinL = s[0]; H.skin = s[1]; H.skinD = s[2];
        H.hairL = h[0]; H.hair = h[1]; H.hairD = h[2];
        FEM = L.body === 'f'; HAIR = HERO_HAIR_STYLES.indexOf(L.hair) >= 0 ? L.hair : 'swoop';
        const hat = L.hair === 'hijab' ? 'hijab' : known(HERO_HATS, L.hat) ? L.hat : 'none';
        HAT = hat === 'none' && H.outfit === 'hacker' ? 'hackerhood' : hat;
        GEAR = known(HERO_GEAR, L.gear) ? L.gear : 'none';
      }

    applyLook(HERO_DEF.m);

    function heroCape(g, f, len) {
        if (H.guide) return;
        const cx = (x) => Math.max(0.6, x);
        const L = len;
        const pts = [[12, 14], [20, 15], [19.5, 24], [17.5, L - 7], [15.5, L - 1.5], [13, L - 5], [10.5 - f * 0.45, L], [7.5 - f * 0.7, L - 4.5],
          [4.5 - f * 0.85, L - 0.5], [3.5 - f * 0.6, L - 9], [6 - f * 0.4, 25], [9, 17]].map((p) => [cx(p[0]), p[1]]);
        poly(g, pts, lg(g, 3, 14, 20, L, [[0, H.capeD], [0.45, H.cape], [1, H.capeL]]));
        g.lineCap = 'round';
        [[8, 17, 6 - f * 0.3, L - 6], [12, 17, 10 - f * 0.4, L - 3], [16, 18, 15, L - 6]].forEach((l) => line(g, cx(l[0]), l[1], cx(l[2]), l[3], 0.9, 'rgba(8,10,50,0.5)'));
        g.globalAlpha = 0.5; [[10, 17, 8.5 - f * 0.3, L - 10], [15, 18, 14, L - 12]].forEach((l) => line(g, cx(l[0]), l[1], cx(l[2]), l[3], 0.7, H.capeL)); g.globalAlpha = 1;
        line(g, cx(4.5 - f * 0.85), L - 0.8, cx(10.5 - f * 0.45), L - 0.6, 0.7, H.cuff);
      }

    function heroLeg(g, l, back) {
        const c = back ? [H.suitD, H.suitD, H.suitM] : [H.suitM, H.suit, H.suitL];
        const w = FEM ? 0.88 : 1;
        limb(g, l[0], 29, l[1], l[2], 6.4 * w, c[0], c[1], c[2]);
        limb(g, l[1], l[2], l[3], l[4] - 4, 5.6 * w, c[0], c[1], c[2]);
        ell(g, l[1], l[2], 3.3 * w, 3.2 * w, back ? H.suitD : H.suitM);
        const bx = l[3], by = l[4];
        poly(g, [[bx - 2.8, by - 8], [bx + 2.6, by - 8], [bx + 3, by - 3.5], [bx + 6.2, by - 1.6], [bx + 6, by + 0.2], [bx - 3, by + 0.2]], lg(g, 0, by - 8, 0, by, [[0, H.bootL], [0.3, H.boots], [1, '#0a0620']]));
        if (FEM) rrect(g, bx - 3, by - 1.6, 2, 1.8, 0.4, '#0a0620');
        rrect(g, bx - 3.2, by - 9, 6.6, 2.2, 0.8, H.cuff);
        line(g, bx - 2.4, by - 0.2, bx + 5.6, by - 0.2, 0.9, '#0a0620');
        if (H.outfit === 'hacker') line(g, bx - 2.4, by - 1.6, bx + 5.2, by - 1.6, 0.6, '#d36870');
        if (GEAR === 'clogs') heroClog(g, bx, by);
      }

    function heroEmblem(g, cx, cy, s) {
        if (H.guide) return;
        const gl = g.createRadialGradient(cx, cy, 0.5, cx, cy, 6.5 * s);
        gl.addColorStop(0, 'rgba(159,240,255,0.95)'); gl.addColorStop(0.5, 'rgba(79,200,255,0.5)'); gl.addColorStop(1, 'rgba(79,200,255,0)');
        g.fillStyle = gl; g.fillRect(cx - 8, cy - 6.6, 16, 14);
        g.save(); g.translate(cx, cy); g.scale(s, s);
        poly(g, [[0, -4], [3.4, 4.4], [1.6, 4.4], [0.9, 2.4], [-0.9, 2.4], [-1.6, 4.4], [-3.4, 4.4]], '#ffffff');
        poly(g, [[0, -1.4], [0.7, 0.8], [-0.7, 0.8]], H.suit);
        line(g, -2.6, 3.2, 2.6, 3.2, 0.5, '#bff4ff');
        g.restore();
      }

    function heroBust(g, lit, shade) {
        [[13.1, 0.42], [18.9, 0.3]].forEach(([x, a]) => {
          g.globalAlpha = a; ell(g, x, 19.2, 3.4, 2.6, lg(g, 0, 16.8, 0, 21.8, [[0, lit], [0.6, lit], [1, shade]])); g.globalAlpha = 1;
        });
        g.strokeStyle = 'rgba(10,6,40,0.62)'; g.lineWidth = 0.8; g.lineCap = 'round';
        g.beginPath(); g.moveTo(9.8, 20); g.quadraticCurveTo(12.8, 22.9, 15.6, 21.4); g.stroke();
        g.beginPath(); g.moveTo(16.4, 21.4); g.quadraticCurveTo(19.2, 22.9, 22.2, 20); g.stroke();
        g.globalAlpha = 0.5; ell(g, 12.4, 18.2, 1.3, 0.7, '#ffffff', -0.3); g.globalAlpha = 0.3; ell(g, 18.2, 18.2, 1.2, 0.6, '#ffffff', -0.3); g.globalAlpha = 1;
      }

    function heroTorso(g) {
        const sh = lg(g, 8, 14, 24, 30, [[0, H.suitL], [0.35, H.suit], [1, H.suitD]]);
        if (FEM) {
          // heroine silhouette: narrower shoulders, tapered waist, wider hips
          poly(g, [[9.2, 15.4], [11.8, 13.8], [20.2, 13.8], [22.8, 15.4], [23.1, 18.4], [22.2, 21.4], [20.2, 24.6], [21.6, 28], [22.6, 30.8], [9.4, 30.8], [10.4, 28], [11.8, 24.6], [9.8, 21.4], [8.9, 18.4]], sh);
          heroBust(g, H.suitL, H.suitD);
          line(g, 12, 23.4, 12.6, 26.4, 0.6, 'rgba(10,6,40,0.35)'); line(g, 20, 23.4, 19.4, 26.4, 0.6, 'rgba(10,6,40,0.35)');
          rrect(g, 11.6, 23.4, 8.8, 2, 0.8, lg(g, 0, 23, 0, 26, [[0, '#ffffff'], [1, H.cuff]]));
          rrect(g, 14.8, 23, 2.4, 2.8, 0.6, '#ffe14a');
          poly(g, [[10.6, 27.6], [21.4, 27.6], [22.6, 30.8], [9.4, 30.8]], lg(g, 0, 27, 0, 31, [[0, H.suitL], [1, H.suitM]]));
          line(g, 9.6, 30.6, 22.4, 30.6, 0.6, H.cuff);
          heroEmblem(g, 16, 18.4, 0.8);
          if (density.hd) heroHDTorso(g, true);
          return;
        }
        poly(g, [[8, 15], [11, 13.6], [21, 13.6], [24, 15], [22.5, 22], [20.5, 29.5], [11.5, 29.5], [9.5, 22]], sh);
        g.globalAlpha = 0.35; ell(g, 13.2, 19.5, 4, 3.2, H.suitL); g.globalAlpha = 0.25; ell(g, 19, 19.5, 4, 3.2, H.suitL); g.globalAlpha = 1;
        line(g, 16, 16, 16, 25, 0.6, 'rgba(10,6,40,0.45)');
        for (let i = 0; i < 3; i++) line(g, 13.4, 23.4 + i * 1.8, 18.6, 23.4 + i * 1.8, 0.5, 'rgba(10,6,40,0.4)');
        line(g, 10, 17, 9.8, 22, 0.8, 'rgba(10,6,40,0.45)');
        rrect(g, 10.5, 27.6, 11, 2.6, 0.8, lg(g, 0, 27, 0, 30, [[0, '#ffffff'], [1, H.cuff]]));
        rrect(g, 14.6, 27.2, 2.8, 3.2, 0.6, '#ffe14a');
        heroEmblem(g, 16, 19.6, 1);
        if (density.hd) heroHDTorso(g, false);
      }

    function heroOutfit(g, pose) {
        if (!H.outfit) return;
        g.save();
        if (pose === 'fly') { g.translate(16, 22); g.rotate(Math.PI / 2); g.scale(0.65, 0.65); g.translate(-16, -22); }
        const hem = H.outfit === 'kimono' ? 36 : H.outfit === 'kurta' ? 35 : H.outfit === 'hacker' ? 31.4 : H.outfit === 'cowboy' ? 31 : H.outfit === 'coat' || H.outfit === 'trail' ? 34 : H.outfit === 'varsity' ? 31 : 29;
        const mid = H.outfit === 'hacker' ? H.suitM : H.suit;
        poly(g, [[9, 15], [12, 14], [20, 14], [23, 15], [21, 25], [23, hem], [9, hem], [11, 25]], lg(g, 9, 14, 23, hem, [[0, H.suitL], [0.35, mid], [1, H.suitD]]));
        const stripe = (y, c, w) => line(g, 10.5, y, 21.5, y, w || 1, c);
        if (FEM) heroBust(g, H.suitL, H.suitD);
        if (H.outfit === 'kimono') {
          poly(g, [[10, 15], [14, 14], [21, 24], [18, 26]], H.cuff);
          line(g, 21, 14.5, 14, 24, 1.5, H.cuff);
          rrect(g, 10, 24, 12, 4.5, 0.3, H.cape);
          line(g, 10, 26.2, 22, 26.2, 0.7, '#ffe14a');
          [[12, 31], [20, 33], [19, 18]].forEach(([x, y]) => { ell(g, x, y, 1, 1, H.suitL); line(g, x - 1, y, x + 1, y, 0.4, H.cuff); });
          line(g, 16, 29, 15, 35, 0.6, H.suitL);
        } else if (H.outfit === 'coat' || H.outfit === 'trail') {
          poly(g, [[12, 14], [16, 19], [14, 24], [10, 16]], H.capeD);
          poly(g, [[20, 14], [16, 19], [18, 24], [22, 16]], H.capeD);
          line(g, 16, 23, 16, hem, 0.7, H.cuff);
          [24, 27, 30].forEach((y) => ell(g, 18, y, 0.65, 0.65, '#ffe14a'));
          [11, 18].forEach((x) => rrect(g, x, 27, 3, 2, 0.2, H.capeD));
          if (H.outfit === 'trail') { stripe(25, H.cuff, 2); line(g, 9, 17, 14, 24, 1.7, H.cape); }
        } else if (H.outfit === 'breton' || H.outfit === 'gondolier') {
          [17, 20, 23, 26].forEach((y) => stripe(y, '#f4f4eb', 1.7));
          poly(g, [[12, 14], [16, 19], [20, 14]], '#f4f4eb');
          if (H.outfit === 'gondolier') { stripe(28, H.cape, 2.5); poly(g, [[19, 27], [23, 28], [22, 33]], H.capeL); }
        } else if (H.outfit === 'vest') {
          poly(g, [[14, 14], [18, 14], [18, 28], [14, 28]], H.capeD);
          [10, 18].forEach((x) => { rrect(g, x, 20, 4, 5, 0.5, H.cape); line(g, x, 21, x + 4, 21, 0.7, H.cuff); });
          stripe(27, '#ffe14a');
        } else if (H.outfit === 'charro') {
          poly(g, [[12, 14], [16, 19], [20, 14], [20, 25], [12, 25]], '#f4f4eb');
          [10.5, 21].forEach((x) => { line(g, x, 16, x, 27, 1, H.cuff); [18, 21, 24].forEach((y) => ell(g, x, y, 0.6, 0.6, '#ffe14a')); });
          poly(g, [[12, 15], [16, 16], [20, 15], [19, 18], [16, 17], [13, 18]], H.cape);
          stripe(28, H.cape, 2);
        } else if (H.outfit === 'cowboy') {
          // denim western shirt: pointed yoke, pearl snaps, leather vest, tooled belt and buckle
          g.strokeStyle = H.cuff; g.lineWidth = 0.4; g.beginPath(); g.moveTo(10, 17); g.lineTo(13, 18.6); g.lineTo(16, 17.2); g.lineTo(19, 18.6); g.lineTo(22, 17); g.stroke();
          line(g, 16, 15, 16, 27, 0.5, H.suitD);
          [18.6, 21, 23.4].forEach((y) => ell(g, 16, y, 0.45, 0.45, '#f4f4ff'));
          poly(g, [[13, 14], [16, 16.2], [14.4, 17.4]], H.suitL); poly(g, [[19, 14], [16, 16.2], [17.6, 17.4]], H.suitL);
          const vest = lg(g, 9, 14, 23, 28, [[0, H.capeL], [0.5, H.cape], [1, H.capeD]]);
          poly(g, [[9.6, 15], [12.8, 14.2], [14.8, 20.6], [14.2, 26.8], [10.4, 26.8], [10, 21.6]], vest);
          poly(g, [[22.4, 15], [19.2, 14.2], [17.2, 20.6], [17.8, 26.8], [21.6, 26.8], [22, 21.6]], vest);
          line(g, 11, 22.4, 13.4, 22.4, 0.4, H.capeD); line(g, 18.6, 22.4, 21, 22.4, 0.4, H.capeD);
          const st = [], sx = 12.2, sy = 19.2; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.55 : 1.3; st.push([sx + Math.cos(a) * r, sy + Math.sin(a) * r]); }
          poly(g, st, '#ffe14a');
          rrect(g, 10.2, 27.8, 11.6, 1.8, 0.3, '#3a1a08');
          rrect(g, 14.3, 27.3, 3.4, 2.8, 0.6, lg(g, 0, 26, 0, 29, [[0, '#ffffff'], [1, '#9aa0b8']]));
          ell(g, 16, 28.7, 0.9, 0.7, '#e0a020');
        } else if (H.outfit === 'kurta') {
          // long ivory kurta with side slits and an embroidered hem, under a maroon Nehru jacket
          line(g, 10.6, 30, 10.2, hem, 0.5, H.suitD); line(g, 21.4, 30, 21.8, hem, 0.5, H.suitD);
          line(g, 9.4, hem - 1.2, 22.6, hem - 1.2, 0.9, H.cuff);
          for (let x = 10.4; x < 22; x += 1.6) ell(g, x, hem - 2.4, 0.35, 0.35, H.cape);
          poly(g, [[10, 15], [12.6, 14], [19.4, 14], [22, 15], [21.6, 27.6], [16, 28.4], [10.4, 27.6]], lg(g, 9, 14, 23, 28, [[0, H.capeL], [0.45, H.cape], [1, H.capeD]]));
          line(g, 16, 15.4, 16, 28.2, 0.5, H.capeD);
          [17.4, 19.8, 22.2, 24.6].forEach((y) => ell(g, 16.7, y, 0.5, 0.5, H.cuff));
          rrect(g, 13, 13.2, 6, 1.8, 0.6, H.cape); line(g, 13.2, 13.3, 18.8, 13.3, 0.35, H.cuff);
          line(g, 11.2, 23.4, 13.8, 23.4, 0.45, H.capeD);
          poly(g, [[18.6, 18.2], [20.6, 18.2], [19.6, 16.8]], H.cuff);
        } else if (H.outfit === 'hacker') {
          line(g, 16.2, 15, 16.2, 30, 0.7, '#ec8a85');
          line(g, 11, 25, 14.5, 25, 0.7, '#321321');
          line(g, 18, 25, 21.5, 25, 0.7, '#321321');
          line(g, 18.2, 18.2, 19.4, 19.3, 0.6, '#ff637a');
          line(g, 19.4, 19.3, 18.2, 20.4, 0.6, '#ff637a');
          line(g, 20, 20.4, 21, 20.4, 0.6, '#ffbd9b');
          stripe(hem - 0.6, H.suitD, 0.8);
        } else if (H.outfit === 'hoodie') {
          ell(g, 16, 16, 6, 3.4, H.capeD);
          poly(g, [[12, 14], [16, 18], [20, 14], [18, 20], [14, 20]], H.suitL);
          [14, 18].forEach((x) => line(g, x, 18, x, 23, 0.6, '#ffffff'));
          rrect(g, 12, 24, 8, 3.5, 1.2, H.suitD);
          stripe(29, H.cuff, 1.5);
        } else if (H.outfit === 'varsity') {
          poly(g, [[10, 15], [12, 14], [15, 15], [15, 30], [10, 30], [9, 25]], H.capeD);
          poly(g, [[22, 15], [20, 14], [17, 15], [17, 30], [22, 30], [23, 25]], H.capeD);
          poly(g, [[12, 15], [16, 17], [20, 15], [20, 29], [12, 29]], H.suitM);
          line(g, 16, 16, 16, 29, 0.8, H.cuff);
          for (let y = 18; y < 28; y += 3) ell(g, 16, y, 0.55, 0.55, '#ffe14a');
          [10.5, 21.5].forEach((x) => { line(g, x, 16, x + (x < 16 ? 1 : -1), 18, 0.6, H.cuff); line(g, x, 28.5, x + (x < 16 ? 1 : -1), 30, 0.6, H.cuff); });
          line(g, 11, 19.5, 11, 23, 0.7, H.cuff); line(g, 11, 19.5, 13, 23, 0.7, H.cuff); line(g, 13, 19.5, 13, 23, 0.7, H.cuff);
          line(g, 14, 19.5, 14, 21, 0.7, H.cuff); line(g, 14, 21, 15, 23, 0.7, H.cuff); line(g, 15, 23, 15, 21, 0.7, H.cuff); line(g, 14, 19.5, 15, 21, 0.7, H.cuff);
          stripe(30.2, H.cuff, 1.2);
        } else {
          line(g, 16, 15, 16, 28, 1, '#ffffff');
          [10, 22].forEach((x) => line(g, x, 16, x + (x < 16 ? 2 : -2), 28, H.outfit === 'tracksuit' ? 2 : 1, H.cuff));
          [12, 18].forEach((x) => rrect(g, x, 23, 2.5, 2.5, 0.3, H.capeD));
          stripe(28, H.cuff, 1.5);
          if (H.outfit === 'tracksuit') stripe(19, H.cape, 3);
        }
        if (density.hd) { line(g, 10, hem - 1, 22, hem - 1, 0.25, H.cuff); }
        g.restore();
      }

    function heroHDTorso(g, fem) {
        g.lineCap = 'round';
        g.globalAlpha = 0.7;
        line(g, fem ? 10.2 : 9.2, 16, fem ? 11.6 : 10.6, 26, 0.25, H.cuff);
        line(g, fem ? 21.8 : 22.8, 16, fem ? 20.4 : 21.4, 26, 0.25, H.cuff);
        g.globalAlpha = 0.45;
        for (let x = 11.6; x < 20.6; x += 0.9) line(g, x, fem ? 15.2 : 14.8, x + 0.4, fem ? 15.2 : 14.8, 0.18, H.suitL);
        g.globalAlpha = 1;
        const by = fem ? 24.4 : 28.9;
        [12.4, 13.6, 18.4, 19.6].forEach((x) => ell(g, x, by, 0.28, 0.28, '#fff6c0'));
        line(g, 15.2, by - 0.6, 16.8, by - 0.6, 0.2, '#fffbe0');
      }

    const hairG = (g, x0, y0, x1, y1) => lg(g, x0, y0, x1, y1, [[0, H.hairL], [0.5, H.hair], [1, H.hairD]]);

    const HAT_LINE = { cowboy: 4.8, sombrero: 4.6, bowler: 5.8, beret: 4.6, crown: 3.2, cork: 4.6, boater: 4.6, cap: 5.8, nycap: 5.8, tricorn: 5.2, hijab: 99, hackerhood: 99 };

    function hatBack(g) {
        if (HAT !== 'hijab') return;
        ell(g, 16.4, 7.4, 7.4, 7.8, hairG(g, 9, 0, 24, 15));
        poly(g, [[9.4, 8], [8.6, 14.6], [10.6, 18.4], [16, 19], [22.4, 17.4], [22.8, 13], [20, 14.6], [14, 14.6]], hairG(g, 8, 8, 22, 19));
        line(g, 10.4, 12, 11.6, 17.4, 0.6, H.hairL);
      }

    function underHat(g, draw) {
        const y = HAT_LINE[HAT];
        if (y === undefined) { draw(g); return; }
        g.save(); g.beginPath(); g.rect(-40, y, 112, 120); g.clip(); draw(g); g.restore();
      }

    function hairBack(g) {
        if (['canalbraid', 'ribbonbraid'].includes(HAIR)) {
          for (let y = 7; y < 22; y += 2) { ell(g, 10 + Math.sin(y) * 0.6, y, 1.6, 1.3, H.hair); line(g, 9, y, 11, y + 1, 0.5, H.hairL); }
          if (HAIR === 'ribbonbraid') { poly(g, [[7, 18], [10, 19], [13, 18], [12, 22], [10, 20], [8, 22]], H.cuff); }
        } else if (HAIR === 'tidybun') {
          ell(g, 10, 5, 3.1, 3.1, hairG(g, 7, 2, 13, 8));
          line(g, 8, 5, 12, 5, 0.7, H.hairL);
        } else if (['waves', 'curls', 'coils', 'boroughwaves'].includes(HAIR)) {
          for (let i = 0; i < 7; i++) ell(g, 10 + Math.sin(i) * 1.2, 5 + i * 1.9, HAIR === 'coils' ? 1.7 : 2.3, 2, hairG(g, 8, 3, 13, 18));
        }
        if (HAIR === 'long') {
          poly(g, [[12.6, 4.4], [9.2, 7.6], [5.6, 13], [4.8, 20.6], [7.6, 23.4], [9.8, 17.6], [11.4, 12], [13, 9]], hairG(g, 5, 4, 13, 22));
          line(g, 9.4, 9, 7, 19, 0.6, H.hairL);
        } else if (HAIR === 'pony') {
          poly(g, [[12.4, 3], [8.6, 3.6], [5, 6.4], [3, 11.4], [3.6, 17.6], [5.6, 14], [7.4, 10], [10.4, 7.6], [12.6, 7]], hairG(g, 3, 3, 12, 17));
          line(g, 8.6, 5.4, 5, 12.4, 0.6, H.hairL);
          ell(g, 11.6, 4.6, 1.5, 1.5, H.cuff);
        } else if (HAIR === 'braids') {
          [[12, 0], [10, 1.2], [8, 2.4]].forEach(function (b, i) {
            for (let y = 6 + i; y < 22 - i; y += 2.2) ell(g, b[0] - (y - 6) * 0.12, y, 1.5, 1.3, (y | 0) % 2 ? H.hair : H.hairD);
            ell(g, b[0] - (22 - i - 6) * 0.12, 22.6 - i, 1, 1, H.cuff);
          });
        } else if (HAIR === 'bob') {
          poly(g, [[12.4, 2.4], [10, 5.4], [9.4, 10.6], [10.6, 14.6], [14, 15], [13.6, 9]], hairG(g, 9, 2, 14, 15));
        } else if (HAIR === 'afro') {
          ell(g, 15.6, 5.4, 8.8, 7.6, hairG(g, 7, -2, 24, 13));
          const r = rng(5); for (let i = 0; i < 26; i++) ell(g, 8 + r() * 15, -1 + r() * 12, 0.9, 0.9, i % 2 ? H.hairL : H.hairD);
        }
      }

    function hairFront(g) {
        const cap = [[11, 8.6], [10.8, 4], [13.6, 1.2], [18, 0.5], [22, 2.2], [22.8, 5.2], [20.6, 3.8], [17.6, 3.2], [14.8, 4.4], [13.2, 9.6]];
        if (HERO_REGIONAL_HAIR.some((x) => x[0] === HAIR)) {
          poly(g, cap, hairG(g, 11, 1, 22, 8));
          if (['canalbraid', 'ribbonbraid', 'tidybun'].includes(HAIR)) {
            [13, 15, 17, 19].forEach((x) => line(g, x, 2, x - 1, 5, 0.65, H.hairL));
          } else if (['waves', 'curls', 'coils', 'boroughwaves'].includes(HAIR)) {
            for (let i = 0; i < 6; i++) {
              const x = 11 + i * 1.9, y = 2.7 + Math.sin(i * 1.7) + (HAIR === 'boroughwaves' && i > 2 ? 0.8 : 0);
              ell(g, x, y, HAIR === 'coils' ? 1.1 : 1.7, HAIR === 'waves' || HAIR === 'boroughwaves' ? 1.2 : 1.8, H.hair);
              line(g, x - 0.5, y - 0.5, x + 0.4, y - 0.5, 0.5, H.hairL);
            }
            if (HAIR === 'boroughwaves') {
              line(g, 15.6, 1.4, 20.8, 2.4, 0.55, H.hairD);
              ell(g, 12, 4.7, 1.5, 1.2, H.hairL);
            }
          } else if (HAIR === 'sidepart') {
            line(g, 16, 1.5, 13, 6, 1, H.hairD); line(g, 17, 2, 22, 4, 0.8, H.hairL);
          } else if (HAIR === 'surfcrop') {
            poly(g, [[11, 4], [12, 1], [15, 2], [17, 0.6], [19, 2.3], [22, 1.5], [21, 5]], H.hairL);
          } else if (HAIR === 'undercut') {
            poly(g, [[11, 4], [14, 3], [13, 9], [11, 9]], H.hairD);
            poly(g, [[13, 3], [18, 0.6], [23, 2], [21, 4.5], [16, 4]], H.hairL);
          } else if (HAIR === 'swept') {
            poly(g, [[10, 5], [12, 1], [18, 0.6], [23, 2], [19, 3], [13, 6]], H.hairL);
            line(g, 12, 3, 20, 1.7, 0.6, H.hair);
          }
        } else if (HAIR === 'swoop') {
          poly(g, [[11.2, 8.4], [11, 4.4], [13.4, 1.6], [17.6, 0.8], [21.6, 2.4], [22.4, 5], [20.6, 4.2], [17.6, 3.2], [14.6, 4.6], [13.4, 8.2]], hairG(g, 11, 1, 22, 8));
          line(g, 14, 3.4, 19.4, 2.2, 0.7, H.hairL);
        } else if (HAIR === 'buzz') {
          poly(g, [[11.6, 8.4], [11.4, 4.4], [13.6, 2.2], [17.6, 1.6], [21, 2.6], [22, 4.6], [19, 3.6], [14.6, 4.4], [13.4, 8.4]], hairG(g, 11, 1, 22, 8));
          const r = rng(9); for (let i = 0; i < 10; i++) ell(g, 12 + r() * 9, 2.4 + r() * 2, 0.35, 0.35, H.hairL);
        } else if (HAIR === 'afro') {
          ell(g, 15.6, 2.6, 6.8, 3.4, hairG(g, 9, 0, 22, 6));
          ell(g, 12.4, 6, 2.2, 3.2, H.hair);
          const r = rng(7); for (let i = 0; i < 10; i++) ell(g, 10 + r() * 11, 0.6 + r() * 4, 0.7, 0.7, H.hairL);
        } else if (HAIR === 'bob') {
          poly(g, [[11, 9], [10.6, 3.6], [13.6, 1], [18, 0.4], [22.2, 2], [23, 6.4], [21.4, 5.2], [19.8, 6], [18.2, 4.8], [16.4, 5.8], [14.8, 4.6], [13.4, 10]], hairG(g, 11, 0, 23, 9));
          line(g, 13.6, 2.6, 19.6, 1.6, 0.7, H.hairL);
        } else {
          poly(g, cap, hairG(g, 11, 1, 22, 8));
          line(g, 14, 3, 19.6, 1.8, 0.7, H.hairL);
          if (HAIR === 'long') poly(g, [[20.4, 3.6], [22.8, 5], [22.6, 7], [21.2, 5.4]], H.hair);
        }
      }

    function heroHat(g) {
        const V = (y0, y1, c) => lg(g, 0, y0, 0, y1, c);
        if (HAT === 'cowboy') {
          poly(g, [[12.6, 4.8], [12.8, 1.6], [14.6, 0.5], [16.8, 1.5], [19, 0.5], [21, 1.6], [21.2, 4.8]], V(0.5, 5, [[0, '#f2c27e'], [0.6, '#c8884a'], [1, '#8a5428']]));
          line(g, 12.8, 4, 21, 4, 1, '#5a3014');
          poly(g, [[7.4, 3.2], [9.4, 4.8], [16.8, 5.4], [24.4, 4.8], [26.4, 3.2], [26, 4.6], [24, 6.2], [16.8, 6.8], [9.8, 6.2], [7.8, 4.6]], V(3, 7, [[0, '#e0a868'], [1, '#7a4620']]));
          line(g, 14, 1.4, 14.6, 3.6, 0.5, 'rgba(255,240,200,0.6)');
        } else if (HAT === 'sombrero') {
          poly(g, [[12.6, 5.4], [13.6, 1.6], [16.8, 0.3], [20, 1.6], [21, 5.4]], V(0.3, 5.2, [[0, '#fff0a8'], [1, '#d8a040']]));
          line(g, 13, 3.8, 20.6, 3.8, 1, '#d0203a'); for (let x = 13.6; x < 20.4; x += 1.4) ell(g, x, 3.8, 0.35, 0.35, '#2ab04a');
          poly(g, [[3.2, 3.4], [5.4, 5.2], [16.8, 6], [28.2, 5.2], [30.4, 3.4], [30, 5.2], [27.6, 7], [16.8, 7.6], [6, 7], [3.6, 5.2]], V(3.4, 7.6, [[0, '#ffe08a'], [1, '#b07a24']]));
          for (let x = 5.4; x < 28.6; x += 2.2) line(g, x, 6.1 + Math.abs(x - 16.8) * -0.03, x + 1.1, 6.9, 0.5, '#d0203a');
        } else if (HAT === 'bowler') {
          g.save(); g.beginPath(); g.rect(0, -2, 32, 8); g.clip();
          ell(g, 16.8, 5.7, 6.1, 5.4, lg(g, 10, 0, 23, 6, [[0, '#827790'], [0.35, '#40384f'], [0.75, '#201a2a'], [1, '#0a0610']]));
          g.restore();
          rrect(g, 10.8, 4.3, 12, 1.4, 0.5, '#702838');
          line(g, 11.2, 4.6, 22.4, 4.6, 0.35, '#d08088');
          poly(g, [[8.4, 4.2], [10, 5.2], [16.8, 5.6], [23.6, 5.2], [25.2, 4.2], [24.9, 5.6], [23, 6.4], [16.8, 6.6], [10.6, 6.4], [8.7, 5.6]], '#16101e');
          line(g, 9.3, 5.6, 24.3, 5.6, 0.4, 'rgba(180,160,210,0.65)');
          ell(g, 14.8, 1.8, 1.7, 0.8, 'rgba(255,255,255,0.3)', -0.4);
        } else if (HAT === 'beret') {
          ell(g, 17.4, 3.2, 6.8, 2.6, V(0.6, 5.8, [[0, '#ff5a6a'], [0.5, '#c81e3a'], [1, '#6a0a1a']]), -0.12);
          line(g, 11.2, 4.8, 22, 5, 0.9, '#6a0a1a');
          line(g, 17.6, 0.8, 17.9, 0.1, 0.8, '#6a0a1a');
        } else if (HAT === 'crown') {
          poly(g, [[12.2, 5.2], [12, 1.4], [14, 3], [15.4, 0.4], [16.8, 2.6], [18.2, 0.4], [19.6, 3], [21.6, 1.4], [21.4, 5.2]], V(0.4, 5.2, [[0, '#ffd060'], [0.5, '#ff8a10'], [1, '#c04a00']]));
          line(g, 12.2, 4.6, 21.4, 4.6, 0.8, '#ffe8a0');
          [[12, 1.4], [15.4, 0.6], [18.2, 0.6], [21.6, 1.4]].forEach((p) => ell(g, p[0], p[1] + 0.2, 0.6, 0.6, '#fff4c0'));
        } else if (HAT === 'hachimaki') {
          rrect(g, 11, 3.6, 12, 1.8, 0.8, V(3.6, 5.4, [[0, '#ffffff'], [1, '#c8d0e8']]));
          ell(g, 20.4, 4.5, 1, 0.8, '#e0102a');
          poly(g, [[11.4, 4], [8.4, 5.4], [6.4, 8.6], [8.2, 8], [10.6, 5.6]], '#e8ecf8');
          poly(g, [[11.4, 4.8], [9, 7.6], [8.6, 10.6], [10, 9.4], [11.6, 6]], '#c8d0e8');
        } else if (HAT === 'cork') {
          poly(g, [[13, 4.8], [13.2, 1.6], [15, 0.8], [16.8, 1.8], [18.6, 0.8], [20.6, 1.6], [20.8, 4.8]], V(0.8, 4.8, [[0, '#e8d4a0'], [1, '#a08850']]));
          line(g, 13.2, 4, 20.6, 4, 0.9, '#3a2410');
          poly(g, [[9, 4.4], [16.8, 5.2], [24.6, 4.4], [24.8, 5.4], [16.8, 6.4], [8.8, 5.4]], '#b09a60');
          [[9.6, 9.6], [11.2, 8.4], [23, 8.4], [24.4, 9.8]].forEach((c) => { line(g, c[0], 5.4, c[0], c[1], 0.3, '#3a2410'); rrect(g, c[0] - 0.6, c[1], 1.2, 1.8, 0.3, '#d8a868'); });
        } else if (HAT === 'boater') {
          rrect(g, 12.6, 1.2, 8.6, 3.8, 0.6, V(1.2, 5, [[0, '#fff2b0'], [1, '#d0a848']]));
          for (let y = 1.8; y < 3.6; y += 0.9) line(g, 12.8, y, 21, y, 0.3, 'rgba(150,100,30,0.5)');
          rrect(g, 12.6, 3.4, 8.6, 1.4, 0.3, '#d0203a');
          poly(g, [[12.8, 3.6], [11, 5.6], [10.4, 8.4], [11.6, 7], [13, 4.6]], '#a01828');
          poly(g, [[8.6, 4.6], [25, 4.6], [24.6, 5.8], [9, 5.8]], V(4.6, 5.8, [[0, '#ffe8a0'], [1, '#b08a3a']]));
        } else if (HAT === 'plumes') {
          const F = [['#ff3aa8', -3.1], ['#ffd020', -2.8], ['#2ad06a', -2.5], ['#3ad8ff', -2.2], ['#ff7a1a', -1.9], ['#c84aff', -1.6]];
          F.forEach((f) => { const a = f[1], x = 15 + Math.cos(a) * 5, y = 4.2 + Math.sin(a) * 3.4; ell(g, x, y, 4.6, 1.1, f[0], Math.atan2(Math.sin(a) * 3.4, Math.cos(a) * 5)); line(g, 15.6, 3.4, x + Math.cos(a) * 3, y + Math.sin(a) * 3, 0.3, 'rgba(255,255,255,0.7)'); });
          rrect(g, 11.2, 3.4, 11.6, 1.8, 0.7, V(3.4, 5.2, [[0, '#fff0a0'], [1, '#d09020']]));
          ell(g, 19.6, 4.3, 1, 0.9, '#3ad8ff'); ell(g, 15, 4.3, 0.7, 0.7, '#ff3aa8');
        } else if (HAT === 'cap' || HAT === 'nycap') {
          // crown sits low on the scalp: band slants from y 5.7 at the brow to y 7.4 behind the ear
          g.save(); g.beginPath(); g.moveTo(9, -2); g.lineTo(26, -2); g.lineTo(26, 5.7); g.lineTo(21.6, 5.7); g.lineTo(10.4, 7.4); g.lineTo(9, 7.4); g.closePath(); g.clip();
          ell(g, 16.6, 6.4, 6.3, 5.9, lg(g, 12, 0.5, 20, 7, [[0, '#8adcff'], [0.35, '#2a8af0'], [0.75, '#1260c8'], [1, '#0a3a8a']]));
          g.strokeStyle = 'rgba(8,40,110,0.55)'; g.lineWidth = 0.35; g.beginPath(); g.moveTo(16.6, 0.6); g.quadraticCurveTo(13.4, 2.6, 12.2, 6.8); g.moveTo(16.6, 0.6); g.quadraticCurveTo(19.8, 2.4, 21.4, 5.6); g.stroke();
          g.restore();
          line(g, 10.6, 7.2, 21.8, 5.6, 0.7, '#0a2e70');
          // curved visor jutting forward over the glasses, lit top and shadowed underside
          poly(g, [[20.6, 4.9], [24.2, 4.6], [26.8, 5.2], [27.2, 5.9], [24.6, 6.2], [20.8, 6.2]], V(4.6, 6.2, [[0, '#4aa8ff'], [0.55, '#1a6ad8'], [1, '#08286a']]));
          line(g, 21, 6.25, 26.8, 6, 0.45, 'rgba(4,16,48,0.7)');
          line(g, 21.2, 5, 25.6, 4.9, 0.3, 'rgba(200,236,255,0.6)');
          [['#f25022', 0, 0], ['#7fba00', 1, 0], ['#00a4ef', 0, 1], ['#ffb900', 1, 1]].forEach((q) => { g.fillStyle = q[0]; g.fillRect(17.2 + q[1], 2.6 + q[2], 0.9, 0.9); });
          ell(g, 16.6, 0.7, 0.8, 0.45, '#0a3a8a');
          ell(g, 14.2, 2.4, 1.4, 0.6, 'rgba(255,255,255,0.3)', -0.5);
        } else if (HAT === 'hijab') {
          // scarf frames the face (forehead band, cheek and chin wrap) in the scarf colour picked in Hero Lab
          poly(g, [[11, 10.6], [10.6, 4.4], [13.4, 1], [18, 0.2], [22.4, 2.2], [23.4, 6], [21.8, 4.6], [18, 3.4], [14.6, 4.6], [13.2, 10.6]], hairG(g, 10, 0, 23, 10));
          poly(g, [[12.2, 11], [13.2, 14.6], [17, 15.6], [21.4, 13.8], [21.6, 12.6], [19.8, 14], [16.8, 14.2], [14.2, 13]], hairG(g, 12, 11, 21, 16));
          line(g, 13.8, 3.2, 21, 2.6, 0.6, H.hairL);
          line(g, 11.6, 5.6, 12.2, 10, 0.35, H.hairD);
        } else if (HAT === 'tricorn') {
          poly(g, [[9.4, 5.6], [10.6, 1.2], [13.6, 3], [16.8, 0.4], [20, 3], [23, 1.2], [24.2, 5.6], [16.8, 6.4]], V(0.4, 6.4, [[0, '#4a4070'], [0.5, '#1c1834'], [1, '#0a0818']]));
          g.strokeStyle = '#e8c060'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(10.6, 1.4); g.lineTo(13.6, 3.2); g.lineTo(16.8, 0.6); g.lineTo(20, 3.2); g.lineTo(23, 1.4); g.stroke();
          ell(g, 21.4, 3.6, 0.9, 0.9, '#ffffff');
        }
      }

    function heroGear(g, pose) {
        const fly = pose === 'fly';
        if (HERO_GEAR.some((x) => x[0] === GEAR && x[3] !== undefined)) {
          g.save();
          if (fly) { g.translate(16, 22); g.rotate(Math.PI / 2); g.scale(0.65, 0.65); g.translate(-16, -22); }
          if (GEAR === 'tulip') {
            line(g, 20, 18, 20, 23, 0.7, '#4dff7a');
            poly(g, [[18, 18], [18, 15.5], [19.5, 17], [20.5, 15.5], [21, 17], [22, 16], [22, 18], [20, 20]], '#ff8a30');
          } else if (GEAR === 'watch') {
            line(g, 16, 23, 21, 25, 0.5, '#ffe14a'); ell(g, 21, 26, 1.8, 1.8, '#ffe14a'); ell(g, 21, 26, 1.2, 1.2, '#fff8df');
            line(g, 21, 26, 21, 25, 0.4, '#322040');
          } else if (GEAR === 'neckerchief' || GEAR === 'silverbow') {
            const c = GEAR === 'silverbow' ? '#e8ecff' : '#ff6a8a';
            poly(g, [[11, 14], [16, 15.5], [21, 14], [20, 18], [16, 16.5], [12, 18]], c);
            line(g, 16, 16, 15, 20, 1, c);
          } else if (GEAR === 'obi') {
            line(g, 10, 26, 22, 26, 0.9, '#ffe8a0');
            poly(g, [[19, 25], [22, 24], [23, 27], [20, 27], [21, 31], [19, 30]], '#ffb0dc');
          } else if (GEAR === 'shell' || GEAR === 'compass') {
            line(g, 12, 14, 16, 21, 0.6, '#ffe14a'); line(g, 16, 21, 20, 14, 0.6, '#ffe14a');
            ell(g, 16, 21, 2, 1.8, GEAR === 'shell' ? '#fff0d0' : '#ffe14a');
            if (GEAR === 'compass') { line(g, 16, 19.5, 16, 22.5, 0.6, '#d0203a'); line(g, 14.5, 21, 17.5, 21, 0.5, '#16339e'); }
            else [15, 16, 17].forEach((x) => line(g, 16, 22, x, 20, 0.4, '#c98e6a'));
          } else if (GEAR === 'ribbon') {
            poly(g, [[11, 14], [21, 14], [20, 16], [12, 16]], '#e02030');
            poly(g, [[12, 15], [14, 16], [11, 23], [9, 22]], '#f4f4eb');
          } else if (GEAR === 'wristbands') {
            [9, 23].forEach((x) => { rrect(g, x - 1.4, 22, 2.8, 3.5, 0.5, '#ffe14a'); line(g, x - 1, 23.7, x + 1, 23.7, 0.8, '#2a6aff'); });
          } else if (GEAR === 'satchel') {
            line(g, 11, 14, 21, 27, 1.8, '#c8884a');
            rrect(g, 17, 25, 7, 6, 1, '#70442a'); rrect(g, 17, 25, 7, 2.5, 0.5, '#c8884a'); ell(g, 20.5, 27.5, 0.6, 0.6, '#ffe14a');
          } else if (GEAR === 'messenger') {
            line(g, 10, 14, 21, 27, 1.5, '#d7c19a');
            rrect(g, 16.5, 23.8, 7.8, 7, 1, '#915b38');
            rrect(g, 16.5, 23.8, 7.8, 2.1, 0.7, '#c98c55');
            line(g, 18, 27, 23, 27, 0.5, '#f2d89b');
            ell(g, 20.5, 26.4, 0.55, 0.55, '#ffe14a');
          }
          g.restore();
          return;
        }
        if (GEAR === 'scarf') {
          if (fly) { rrect(g, 20.6, 18.4, 3, 5, 1, '#d0203a'); poly(g, [[21, 19], [12, 15.4], [11, 17.4], [21, 21.4]], '#d0203a'); for (let x = 13; x < 20; x += 2.4) line(g, x, 16, x + 0.4, 18.6, 1, '#ffffff'); return; }
          rrect(g, 12.6, 12.4, 8.4, 3, 1.2, '#d0203a'); for (let x = 13.6; x < 21; x += 2.4) line(g, x, 12.6, x, 15.2, 0.9, '#ffffff');
          rrect(g, 12.2, 14, 2.8, 9.4, 0.8, '#d0203a'); for (let y = 15.4; y < 23; y += 2.4) line(g, 12.4, y, 14.8, y, 0.9, '#ffffff');
          for (let x = 12.6; x < 15; x += 0.8) line(g, x, 23.4, x, 24.6, 0.3, '#ffffff');
        } else if (GEAR === 'bandana') {
          if (fly) { poly(g, [[20.4, 18.2], [24, 18.6], [21.6, 22.4]], '#d0203a'); return; }
          poly(g, [[13, 12.6], [21.2, 12.6], [18.2, 18], [15.6, 16.8]], lg(g, 0, 12, 0, 18, [[0, '#ff4a4a'], [1, '#a01020']]));
          [[15.2, 13.6], [18.4, 13.8], [17, 15.6], [19.6, 13.2]].forEach((p) => ell(g, p[0], p[1], 0.4, 0.4, '#ffffff'));
        } else if (GEAR === 'lei') {
          const C = ['#ff3aa8', '#ffd020', '#ffffff', '#ff7a1a', '#c84aff'];
          for (let i = 0; i <= 10; i++) {
            const t = i / 10, x = fly ? 22.4 - Math.sin(t * Math.PI) * 4 : 11.6 + t * 9.6, y = fly ? 17.6 + t * 8 : 13.6 + Math.sin(t * Math.PI) * 5.4;
            ell(g, x, y, 1.15, 1.15, C[i % 5]); ell(g, x, y, 0.35, 0.35, '#ffe14a');
          }
        } else if (GEAR === 'serape') {
          if (fly) { [['#d0203a', 17.4], ['#ffd020', 18.6], ['#2ab04a', 19.8], ['#3ad8ff', 21]].forEach((s) => line(g, 10, s[1] - 1.2, 22, s[1] - 1.8, 1.2, s[0])); return; }
          poly(g, [[8.4, 15.6], [11.6, 13.4], [20.4, 13.4], [23.6, 15.6], [22.4, 19.4], [16, 22.6], [9.6, 19.4]], '#7a1a2a');
          g.save(); g.beginPath(); g.moveTo(8.4, 15.6); g.lineTo(11.6, 13.4); g.lineTo(20.4, 13.4); g.lineTo(23.6, 15.6); g.lineTo(22.4, 19.4); g.lineTo(16, 22.6); g.lineTo(9.6, 19.4); g.closePath(); g.clip();
          ['#d0203a', '#ffd020', '#2ab04a', '#3ad8ff', '#ff7a1a', '#ffffff'].forEach((c, i) => line(g, 6, 14.4 + i * 1.6, 26, 14.4 + i * 1.6, 0.9, c));
          g.restore();
          for (let x = 10.6; x < 22; x += 1.2) line(g, x, 19.8 + (1 - Math.abs(x - 16) / 6) * 2.4, x, 21 + (1 - Math.abs(x - 16) / 6) * 2.4, 0.3, '#ffd020');
          rrect(g, 14.6, 13, 3.6, 1.6, 0.6, '#3a0a14');
        }
      }

    function heroClog(g, bx, by) {
        poly(g, [[bx - 3.2, by - 4.4], [bx + 2.4, by - 4.6], [bx + 6.6, by - 2], [bx + 6.8, by + 0.4], [bx - 3.2, by + 0.4]], lg(g, 0, by - 5, 0, by + 1, [[0, '#fff090'], [0.5, '#f0c020'], [1, '#a07008']]));
        line(g, bx - 2.6, by - 4, bx + 2.2, by - 4.1, 0.5, '#fffbe0');
        ell(g, bx + 3.4, by - 2.4, 0.9, 0.6, '#d08a10');
      }

    function hackerFace(g) {
        rrect(g, 12, 4.7, 10.2, 8, 3, '#1a101e');
      }

    function hackerVisor(g) {
        rrect(g, 13.2, 6.7, 7.8, 2.6, 0.8, '#d63c5c');
        line(g, 13.8, 7.2, 20.4, 7.2, 0.5, '#ffe5d1');
      }

    function hackerHood(g) {
        ell(g, 17, 7.8, 7.7, 7.6, lg(g, 10, 0, 24, 15, [[0, '#d47782'], [0.4, '#713449'], [1, '#240e1e']]));
        hackerFace(g);
        poly(g, [[11, 4.7], [12.4, 2.4], [16, 1.4], [20, 2], [22.9, 5.2], [21, 4.8], [17.6, 3.7], [14.2, 4.4], [12.5, 7.2], [11.6, 11]], '#5b293e');
        line(g, 12.5, 4, 15, 2.8, 0.6, '#ffc4bc');
        line(g, 15, 2.8, 19.5, 3.1, 0.6, '#ffc4bc');
        hackerVisor(g);
      }

    function hackerTerminal(g) {
        rrect(g, 1, 14.8, 10.5, 9.5, 1.2, '#c2b9c9');
        rrect(g, 2.1, 15.8, 8.3, 7.3, 0.6, '#24121e');
        line(g, 3, 17.1, 4.9, 18.6, 0.8, '#ff637a');
        line(g, 4.9, 18.6, 3, 20.1, 0.8, '#ff637a');
        line(g, 6, 20.3, 8.9, 20.3, 0.7, '#ffbd9b');
        poly(g, [[0.3, 24], [11.5, 24], [13.2, 25.8], [1.4, 25.8]], '#8b8293');
        ell(g, 1.3, 17, 0.8, 0.8, '#ff637a');
      }

    function heroHead(g, dx, dy, skipBack) {
        dx = dx || 0; dy = dy || 0;
        g.save(); g.translate(dx, dy);
        if (H.outfit === 'hacker') {
          if (HAT === 'hackerhood') {
            hackerHood(g);
          } else {
            if (!skipBack) { hatBack(g); underHat(g, hairBack); }
            rrect(g, 14.2, 11.6, 4.4, 3.6, 1, H.suitD);
            ell(g, 16.8, 8, 5.2, 5.6, '#1a101e');
            underHat(g, hairFront);
            hackerFace(g);
            heroHat(g);
            hackerVisor(g);
          }
          g.restore();
          return;
        }
        if (!skipBack) { hatBack(g); underHat(g, hairBack); }
        rrect(g, 14.2, 11.6, 4.4, 3.6, 1, H.skinD);
        ell(g, 16.8, 8, 5.2, 5.6, lg(g, 12, 3, 21, 13, [[0, H.skinL], [1, H.skin]]));
        poly(g, FEM ? [[12.4, 9], [21.2, 9], [20.2, 12.6], [17.6, 14], [14.2, 12.8]] : [[12.4, 9], [21.2, 9], [20, 13], [17.2, 14.4], [14, 13]], lg(g, 0, 9, 0, 14, [[0, H.skin], [1, H.skinD]]));
        if (FEM && HAT !== 'hijab') { ell(g, 13.4, 10.6, 0.8, 0.8, '#ffe14a'); }
        underHat(g, hairFront);
        rrect(g, 13.2, 6.6, 9.4, 3.4, 1.2, '#06103a');
        poly(g, [[14, 7.2], [18.6, 7.2], [18, 9.4], [14.4, 9.4]], lg(g, 14, 7, 18, 10, [[0, '#9ff0ff'], [1, '#1a8fe0']]));
        poly(g, [[19.2, 7.2], [22, 7.2], [21.6, 9.4], [19, 9.4]], lg(g, 19, 7, 22, 10, [[0, '#9ff0ff'], [1, '#1a8fe0']]));
        line(g, 14.6, 7.5, 16.4, 7.5, 0.6, '#ffffff');
        if (density.hd) {
          ell(g, 16.6, 8.4, 0.55, 0.5, 'rgba(6,16,58,0.85)'); ell(g, 20.6, 8.4, 0.45, 0.45, 'rgba(6,16,58,0.85)');
          ell(g, 16.4, 8.2, 0.18, 0.18, '#ffffff'); ell(g, 20.4, 8.2, 0.15, 0.15, '#ffffff');
          line(g, 19.3, 7.5, 21.4, 7.5, 0.25, 'rgba(255,255,255,0.8)');
          line(g, 13.4, 6.9, 22.2, 6.9, 0.2, '#3a6aff');
        }
        if (HAT !== 'hijab') line(g, 19.4, 5.8, 22, 5.6, 0.7, H.hairD);
        line(g, 20.2, 10.4, 20.8, 11.4, 0.5, H.skinD);
        if (FEM) {
          // natural lips: a soft rose line with a faint lower-lip tint instead of a glossy pink shape
          g.globalAlpha = 0.3; ell(g, 19.1, 12.6, 1.1, 0.35, '#c0606a'); g.globalAlpha = 1;
          g.strokeStyle = 'rgba(150,62,70,0.85)'; g.lineWidth = 0.42; g.lineCap = 'round';
          g.beginPath(); g.moveTo(17.9, 12.25); g.quadraticCurveTo(19.1, 12.55, 20.3, 12.15); g.stroke();
          line(g, 22.4, 7, 23.4, 6.2, 0.45, '#0a0620'); line(g, 22.4, 8, 23.6, 7.6, 0.45, '#0a0620');
          g.globalAlpha = 0.2; ell(g, 20.4, 11, 1.3, 0.8, '#f08a8a'); g.globalAlpha = 1;
        } else line(g, 17.6, 12.5, 20.6, 12.1, 0.7, '#7a3a34');
        heroHat(g);
        g.restore();
      }

    function heroShoulder(g, x, y, big) {
        const r = FEM ? 0.86 : 1;
        ell(g, x, y, (big ? 3.6 : 3.2) * r, 3 * r, lg(g, x - 3, y - 3, x + 3, y + 3, [[0, H.suitL], [1, H.suitM]]));
      }

    function heroArm(g, sh, el, hand, front, fist) {
        const c = front ? [H.suitM, H.suit, H.suitL] : [H.suitD, H.suitD, H.suitM];
        const w = FEM ? 0.88 : 1;
        limb(g, sh[0], sh[1], el[0], el[1], 5 * w, c[0], c[1], c[2]);
        if (H.outfit === 'kimono') {
          poly(g, [[sh[0] - 2, sh[1]], [sh[0] + 2, sh[1]], [el[0] + 2, el[1] + 3], [el[0] - 3, el[1] + 3]], c[1]);
          line(g, el[0] - 3, el[1] + 3, el[0] + 2, el[1] + 3, 0.8, H.cuff);
        }
        limb(g, el[0], el[1], hand[0], hand[1], 4.4 * w, c[0], c[1], c[2]);
        const dx = hand[0] - el[0], dy = hand[1] - el[1], d = Math.hypot(dx, dy) || 1;
        const cxp = hand[0] - (dx / d) * 1.6, cyp = hand[1] - (dy / d) * 1.6;
        ell(g, cxp, cyp, 2.8 * w, 2.8 * w, GEAR === 'wristbands' ? '#ffe14a' : front ? H.cuff : H.suitM);
        ell(g, hand[0] + (dx / d) * 1.2, hand[1] + (dy / d) * 1.2, (fist ? 2.9 : 2.5) * w, (fist ? 2.9 : 2.5) * w, front ? H.skin : H.skinD);
      }

    function hero(o) {
        return function (g) {
          if (H.outfit !== 'hacker') heroCape(g, o.flare, o.capeLen);
          const backHair = HAT !== 'hackerhood' && (HAIR === 'long' || HAIR === 'braids');
          if (backHair) { g.save(); g.translate(o.hx || 0, o.hy || 0); hatBack(g); underHat(g, hairBack); g.restore(); }
          const back = H.outfit === 'hacker' ? [[10, 16], [7, 20], [8.3, 21.3]] : o.back;
          heroArm(g, back[0], back[1], back[2], false, false);
          heroLeg(g, o.legs[0], true);
          heroLeg(g, o.legs[1], false);
          heroTorso(g);
          heroOutfit(g, 'stand');
          if (H.outfit !== 'hacker') {
            heroShoulder(g, 22.6, 15.6, true);
            heroShoulder(g, 9.4, 15.6, false);
          }
          heroGear(g, 'stand');
          heroArm(g, o.front[0], o.front[1], o.front[2], true, o.fist);
          if (H.outfit === 'hacker') hackerTerminal(g);
          heroHead(g, o.hx, o.hy, backHair);
          if (o.punchFx) {
            const gr = g.createRadialGradient(30, o.punchFx, 0, 30, o.punchFx, 5);
            gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.5, 'rgba(127,232,255,0.55)'); gr.addColorStop(1, 'rgba(127,232,255,0)');
            g.fillStyle = gr; g.fillRect(24, o.punchFx - 6, 8, 12);
          }
        };
      }

    const HERO_FRAMES = ['idle', 'run0', 'run1', 'run2', 'run3', 'jump', 'attack', 'shield', 'fly', 'duck', 'slide'];

    function regHero(P, look, only) {
        applyLook(look);
        const reg2 = (key, w, h, fn, opt) => {
          if (!only || only.indexOf(key.slice(P.length)) >= 0) regArt(key, w, h, (g) => {
            // Leave an outline margin for extended hands, hair and flight headwear.
            g.save(); g.translate(1.7, 3); g.scale(0.88, 0.92); fn(g); g.restore();
          }, opt);
        };
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
        ['duck', 'slide'].forEach(function (pose) {
          reg2(P + pose, 32, 48, function (g) {
            g.save();
            g.translate(pose === 'slide' ? 2 : 0, 25);
            g.scale(0.9, 0.46);
            hero({ flare: 5, capeLen: 40, legs: [[13, 9, 37, 5, 47], [19, 25, 38, 30, 47]], back: BK, front: [[22.6, 16], [26, 20], [30, 25]], fist: true })(g);
            g.restore();
            if (pose === 'slide') {
              line(g, 1, 44, 9, 44, 1, '#7fe8ff');
              line(g, 0, 47, 7, 47, 1, '#27e0ff');
            }
          });
        });
        reg2(P + 'fly', 32, 48, function (g) {
          // horizontal superhero flight pose facing right
          if (H.outfit !== 'hacker') {
            poly(g, [[14, 18], [2, 14], [0.8, 20], [1.6, 26], [14, 26]], lg(g, 0, 14, 14, 26, [[0, H.capeD], [0.5, H.cape], [1, H.capeL]]));
            line(g, 12, 19, 3, 16.5, 0.8, 'rgba(8,16,70,0.55)'); line(g, 12, 22, 2.4, 22, 0.8, 'rgba(8,16,70,0.55)');
            line(g, 12, 25, 3, 26, 0.7, 'rgba(120,170,255,0.5)');
          }
    const CL = GEAR === 'clogs' ? (y0, y1) => lg(g, 0, y0, 0, y1, [[0, '#fff090'], [1, '#c09010']]) : null;
          limb(g, 7, 25, 1.4, 28, 5.4, H.suitD, H.suitD, H.suitM);                                      // back leg
          poly(g, [[0.4, 26], [3.6, 25], [4.6, 31], [0.6, 31.4]], CL ? CL(25, 31) : lg(g, 0, 25, 4, 31, [[0, H.bootL], [1, H.boots]]));
          limb(g, 8, 24, 3, 26, 5.6, H.suitM, H.suit, H.suitL);                                         // front leg
          poly(g, [[0, 23.6], [3.4, 23.2], [4.2, 29], [0.4, 29.4]], CL ? CL(23, 29) : lg(g, 0, 23, 4, 29, [[0, H.bootL], [1, H.boots]]));
          poly(g, [[8, 19], [12, 17.4], [23, 18.4], [25, 21], [23, 26.4], [9, 26]], lg(g, 8, 17, 22, 26, [[0, H.suitL], [0.4, H.suit], [1, H.suitD]]));
          rrect(g, 13.2, 18, 2.6, 8.4, 1, lg(g, 0, 18, 0, 27, [[0, '#e6f6ff'], [1, '#6a8fc8']]));
          const gl = g.createRadialGradient(19.6, 22, 0.5, 19.6, 22, 5);
          gl.addColorStop(0, 'rgba(159,240,255,0.95)'); gl.addColorStop(1, 'rgba(79,200,255,0)');
          g.fillStyle = gl; g.fillRect(14, 16, 12, 12);
          poly(g, [[22, 20], [19, 24], [20.2, 24], [20.9, 22.6], [22.4, 22.6]], '#ffffff');
          heroOutfit(g, 'fly');
          if (H.outfit !== 'hacker') ell(g, 24, 18.6, 3.2, 3, lg(g, 21, 16, 26, 21, [[0, H.suitL], [1, H.suitM]]));
          limb(g, 24, 18.6, 28.4, 17.6, 4.6, H.suitM, H.suit, H.suitL);                                 // reaching arm
          limb(g, 28.4, 17.6, 31.4, 16.6, 4, H.suitM, H.suit, H.suitL);
          ell(g, 30, 17, 2.6, 2.6, GEAR === 'wristbands' ? '#ffe14a' : H.cuff); ell(g, 31.3, 16.8, 2.5, 2.5, H.skin);
          rrect(g, 21.6, 20.6, 3.6, 3, 1, H.outfit === 'hacker' ? H.suitD : H.skinD);                        // neck
          heroGear(g, 'fly');
          if (H.outfit === 'hacker') {
            g.save(); g.translate(5, 11); g.scale(0.65, 0.65); hackerTerminal(g); g.restore();
          }
          g.save(); g.translate(11, 11.4); g.scale(0.75, 0.75);
          heroHead(g, 0, 0);
          g.restore();
        });
        applyLook(HERO_DEF.m);
      }

    regHero('hero_', HERO_DEF.m);

    regHero('hero_f_', HERO_DEF.f);

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

    Object.assign(C, { H, FEM, HAIR, HAT, GEAR, known, hairG, HAT_LINE, HERO_FRAMES });
  };
})();
