/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.fighter.43'] = function (C) {
    const { GOLD, ell, eyeGlow, lerpCol, lg, limb, line, poly, reg2, rrect, shade } = C;

    Object.assign(C, { fPal, fDark, fAt, fUnit, fLimb, fStar, fFrame, fTorsoPath, fTorso, fHand, fArm, fFoot, fLeg, fHead, fighterReg, hoverPlate });
    const FIGHT_POSE = {
        idle: { hip: [33, 51], sh: [31, 30], head: [29, 18], fk: [24, 64], ff: [19, 78], bk: [41, 64], bf: [46, 78], fe: [22, 38], fh: [17, 28], be: [38, 40], bh: [28, 32] },
        walk: { hip: [32, 50], sh: [30, 29], head: [28, 17], fk: [22, 62], ff: [13, 77], bk: [40, 64], bf: [49, 78], fe: [20, 37], fh: [15, 27], be: [37, 39], bh: [27, 31] },
        attack: { hip: [35, 51], sh: [27, 30], head: [23, 19], fk: [21, 63], ff: [13, 78], bk: [43, 64], bf: [52, 78], fe: [15, 30], fh: [4, 29], be: [32, 39], bh: [22, 33] },
        kick: { hip: [37, 49], sh: [43, 30], head: [47, 18], fk: [21, 47], ff: [6, 44], bk: [37, 63], bf: [37, 78], fe: [37, 37], fh: [31, 31], be: [49, 38], bh: [54, 46] },
        jump: { hip: [36, 40], sh: [43, 22], head: [47, 11], fk: [24, 50], ff: [12, 62], bk: [42, 52], bf: [50, 58], fe: [36, 30], fh: [30, 26], be: [50, 30], bh: [54, 22] },
        upper: { hip: [32, 48], sh: [30, 27], head: [34, 15], fk: [24, 61], ff: [20, 78], bk: [39, 62], bf: [45, 77], fe: [21, 18], fh: [18, 6], be: [39, 37], bh: [35, 42] },
        stun: { hip: [34, 53], sh: [37, 33], head: [40, 22], fk: [28, 66], ff: [23, 78], bk: [40, 66], bf: [45, 78], fe: [30, 43], fh: [27, 53], be: [44, 43], bh: [45, 53] }
      };

    FIGHT_POSE.bob = {};

    Object.keys(FIGHT_POSE.idle).forEach(function (k) {
        const v = FIGHT_POSE.idle[k], foot = k === 'ff' || k === 'bf', knee = k === 'fk' || k === 'bk';
        FIGHT_POSE.bob[k] = [v[0] + (k === 'fk' ? -0.7 : k === 'bk' ? 0.7 : 0), v[1] + (foot ? 0 : knee ? 1 : 1.7)];
      });

    const FIGHT_FRAMES = [['_0', 'idle'], ['_1', 'bob'], ['_walk', 'walk'], ['_attack', 'attack'], ['_kick', 'kick'], ['_jump', 'jump'], ['_upper', 'upper'], ['_stun', 'stun']];

    const FSKIN = {
        tan: { l: '#ecb48a', m: '#c27f56', d: '#7a4a2e' },
        pale: { l: '#f6d4bc', m: '#d8a486', d: '#925e46' },
        olive: { l: '#deb084', m: '#b07e54', d: '#6a442a' },
        brown: { l: '#c48c5e', m: '#8c5a36', d: '#4c2e1a' },
        deep: { l: '#9c6a48', m: '#6a4228', d: '#38200f' }
      };

    function fPal(l, m, d) { return { l: l, m: m, d: d }; }

    function fDark(c) { return { l: c.m, m: c.d, d: lerpCol(c.d, '#000000', 0.4) }; }

    function fAt(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

    function fUnit(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; }

    function fLimb(g, a, b, w, c) { limb(g, a[0], a[1], b[0], b[1], w, c.d, c.m, c.l); }

    function fStar(g, x, y, r, col) {
        poly(g, [[x, y - r], [x + r * 0.3, y - r * 0.3], [x + r, y], [x + r * 0.3, y + r * 0.3], [x, y + r], [x - r * 0.3, y + r * 0.3], [x - r, y], [x - r * 0.3, y - r * 0.3]], col);
      }

    function fFrame(P, F) {
        const h = P.hip, s = P.sh, dx = s[0] - h[0], dy = s[1] - h[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        const W = F.fem ? { s: 7.4, c: 7.8, w: 4.9, h: 7.6 } : { s: 10.6, c: 10.6, w: 7.4, h: 7.8 };
        return { W: W, at: function (t, w) { return [h[0] + dx * t + nx * w, h[1] + dy * t + ny * w]; } };
      }

    function fTorsoPath(g, T) {
        const W = T.W, at = T.at, pts = [at(1, W.s), at(0.72, W.c), at(0.35, W.w), at(0, W.h), at(0, -W.h), at(0.35, -W.w), at(0.72, -W.c), at(1, -W.s)];
        g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => g.lineTo(p[0], p[1])); g.closePath();
        return pts;
      }

    function fTorso(g, P, F, T) {
        const W = T.W, at = T.at, sk = F.skin, top = F.topC, acc = F.accent, sh = P.sh, hp = P.hip;
        const grad = (c) => lg(g, sh[0] - 10, sh[1], hp[0] + 10, hp[1], [[0, c.l], [0.55, c.m], [1, c.d]]);
        const body = F.top === 'bare' || F.top === 'tank' || F.top === 'harness' ? sk : F.top === 'waistcoat' ? F.top2 : top;
        fTorsoPath(g, T); g.fillStyle = grad(body); g.fill();
        g.save(); fTorsoPath(g, T); g.clip();
        if (body === sk) {
          // pecs, abs and a lit edge on the bare chest
          g.globalAlpha = 0.55;
          const c1 = at(0.78, -W.c + 1.5), c2 = at(0.7, 0), c3 = at(0.78, W.c - 1.5);
          g.strokeStyle = sk.d; g.lineWidth = 0.9; g.beginPath(); g.moveTo(c1[0], c1[1]); g.quadraticCurveTo(at(0.6, -4)[0], at(0.6, -4)[1], c2[0], c2[1]);
          g.quadraticCurveTo(at(0.6, 4)[0], at(0.6, 4)[1], c3[0], c3[1]); g.stroke();
          [0.48, 0.32, 0.17].forEach(function (t) { const a = at(t, -2.6), b = at(t, 2.6); line(g, a[0], a[1], b[0], b[1], 0.7, sk.d); });
          const m1 = at(0.62, 0), m2 = at(0.08, 0); line(g, m1[0], m1[1], m2[0], m2[1], 0.6, sk.d);
          g.globalAlpha = 1;
          const e1 = at(0.95, -W.s + 1.2), e2 = at(0.4, -W.w + 0.6); line(g, e1[0], e1[1], e2[0], e2[1], 1, 'rgba(255,240,220,0.45)');
          if (F.tattoo) {
            g.globalAlpha = 0.9;
            const t1 = at(0.86, 1.5), t2 = at(0.72, 4.5), t3 = at(0.5, 4.5), t4 = at(0.62, -5), t5 = at(0.82, -5.5);
            [[t1, t2], [t2, t3], [t4, t5]].forEach((s) => line(g, s[0][0], s[0][1], s[1][0], s[1][1], 0.7, acc));
            [t3, t5, t1].forEach((p) => ell(g, p[0], p[1], 0.9, 0.9, '#ffffff'));
            g.globalAlpha = 1;
          }
        }
        if (F.top === 'tank') {
          const pts = [at(1.02, -W.s + 2.6), at(1.02, -W.s + 4.4), at(0.8, -2.4), at(0.8, 2.4), at(1.02, W.s - 4.4), at(1.02, W.s - 2.6), at(0.7, W.c), at(0, W.h + 1), at(0, -W.h - 1), at(0.7, -W.c)];
          poly(g, pts, grad(top));
          const lp = at(0.52, -1.5); rrect(g, lp[0] - 3.4, lp[1] - 2.4, 6.8, 4.6, 1, acc); ell(g, lp[0], lp[1] - 0.2, 1.4, 1.4, '#0a1a10');
        } else if (F.top === 'waistcoat') {
          const pts = [at(1.02, -W.s), at(1.02, -3.4), at(0.55, 0), at(1.02, 3.4), at(1.02, W.s), at(0, W.h + 1), at(-0.06, 0), at(0, -W.h - 1)];
          poly(g, pts, grad(top));
          const n1 = at(1.02, -0.6), n2 = at(0.7, -0.4); line(g, n1[0], n1[1], n2[0], n2[1], 2, F.tie || '#7a1020');
          [0.46, 0.32, 0.18].forEach((t) => { const p = at(t, -0.3); ell(g, p[0], p[1], 0.8, 0.8, '#ffd23f'); });
          const w1 = at(0.3, -0.3), w2 = at(0.22, -W.w), w3 = at(0.36, -W.w + 1);
          g.strokeStyle = '#ffd23f'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(w1[0], w1[1]); g.quadraticCurveTo(w2[0], w2[1] + 2, w3[0], w3[1]); g.stroke();
          for (let i = 0; i < 6; i++) { const a = at(0.15 + i * 0.13, W.s - 2), b = at(0.15 + i * 0.13, -W.s + 2); line(g, a[0], a[1], b[0], b[1], 0.3, 'rgba(255,255,255,0.12)'); }
        } else if (F.top === 'jacket') {
          const pts = [at(1.04, -3.4), at(0.6, -1.4), at(0, -2.4), at(0, 2.6), at(0.6, 1.4), at(1.04, 3.4)];
          poly(g, pts, lg(g, sh[0], sh[1], hp[0], hp[1], [[0, F.top2.l], [1, F.top2.d]]));
          const lp = at(0.66, 0); fStar(g, lp[0], lp[1], 2.2, acc);
          [[1.02, -W.s + 0.6, 0.72, -3.6, 1.04, -3.4], [1.02, W.s - 0.6, 0.72, 3.6, 1.04, 3.4]].forEach(function (q) {
            const a = at(q[0], q[1]), b = at(q[2], q[3]), c = at(q[4], q[5]); poly(g, [a, b, c], top.l);
          });
          for (let i = 0; i < 4; i++) { const p = at(0.2 + i * 0.18, -2.6); ell(g, p[0], p[1], 0.5, 0.5, '#d8dce8'); }
          const z = at(0.95, 2.8), z2 = at(0.05, 2.8); line(g, z[0], z[1], z2[0], z2[1], 0.5, '#c8ccd8');
        } else if (F.top === 'stripe') {
          for (let y = sh[1] - 12; y < hp[1] + 4; y += 3.2) { g.fillStyle = F.top2.m; g.fillRect(0, y, 64, 1.4); }
          const n1 = at(1.02, -W.s + 1.6), n2 = at(0.94, 0), n3 = at(1.02, W.s - 1.6);
          poly(g, [n1, n2, n3], sk.m);
        } else if (F.top === 'gi') {
          const a = at(1.02, -4), b = at(0.45, 1.4), c = at(1.02, 3.4);
          poly(g, [a, b, c], sk.m); line(g, a[0], a[1], b[0], b[1], 1.6, F.top2.l); line(g, c[0], c[1], b[0], b[1], 1.4, F.top2.m);
          const f1 = at(0.8, W.s), f2 = at(0.2, W.h); line(g, f1[0], f1[1], f2[0], f2[1], 0.6, 'rgba(0,0,0,0.35)');
        } else if (F.top === 'harness') {
          const a = at(1, -W.s + 1), b = at(0.08, W.h - 1); line(g, a[0], a[1], b[0], b[1], 2.4, '#5a3214'); line(g, a[0], a[1], b[0], b[1], 0.6, '#a8703a');
          const r = at(0.6, 0.6); ell(g, r[0], r[1], 2, 2, '#d8c070'); ell(g, r[0], r[1], 1, 1, '#5a3214');
        }
        g.restore();
        // belt
        const b1 = at(0.06, -W.h - 0.6), b2 = at(0.06, W.h + 0.6), b3 = at(-0.08, W.h + 0.8), b4 = at(-0.08, -W.h - 0.8);
        poly(g, [b1, b2, b3, b4], F.belt || '#1a1a22');
        if (F.buckle) { const k = at(-0.01, -1.2); rrect(g, k[0] - 3.2, k[1] - 2, 6.4, 4, 1, lg(g, k[0], k[1] - 2, k[0], k[1] + 2, GOLD)); ell(g, k[0], k[1], 1.3, 1.2, F.accent); }
      }

    function fHand(g, e, h, F, back) {
        const u = fUnit(e, h), x = h[0] + u[0] * 1.3, y = h[1] + u[1] * 1.3, sk = back ? fDark(F.skin) : F.skin;
        const wx = h[0] - u[0] * 2.2, wy = h[1] - u[1] * 2.2, px = -u[1], py = u[0];
        if (F.hands === 'gloves') {
          const c = back ? fDark(F.handC) : F.handC;
          ell(g, wx, wy, 3.4, 3.4, '#f2f2f2');
          ell(g, x, y, 5.2, 4.8, lg(g, x - 5, y - 5, x + 5, y + 5, [[0, c.l], [0.5, c.m], [1, c.d]]));
          ell(g, x - 1.6, y - 1.8, 1.8, 1.1, 'rgba(255,255,255,0.55)');
          return;
        }
        const fist = F.hands === 'fingerless' || F.hands === 'cestus' ? (back ? fDark(F.handC) : F.handC) : sk;
        ell(g, x, y, 3.6, 3.3, lg(g, x - 3, y - 3, x + 3, y + 3, [[0, fist.l], [0.6, fist.m], [1, fist.d]]));
        if (F.hands === 'fingerless') { ell(g, x + u[0] * 2, y + u[1] * 2, 2, 1.8, sk.m); }
        if (F.hands === 'wraps' || F.hands === 'brass') line(g, wx + px * 2.6, wy + py * 2.6, wx - px * 2.6, wy - py * 2.6, 2.2, F.wrapC || '#f4f0e8');
        if (F.hands === 'wraps') line(g, x + px * 2.8, y + py * 2.8, x - px * 2.8, y - py * 2.8, 1.2, F.wrapC || '#f4f0e8');
        if (F.hands === 'brass') { line(g, x + u[0] * 2 + px * 3, y + u[1] * 2 + py * 3, x + u[0] * 2 - px * 3, y + u[1] * 2 - py * 3, 1.6, '#e8c050'); }
        if (F.hands === 'cestus') { [-1.6, 1.6].forEach((o) => ell(g, x + u[0] * 2 + px * o, y + u[1] * 2 + py * o, 0.8, 0.8, '#e8e8f0')); }
      }

    function fArm(g, s, e, h, F, back) {
        const sk = back ? fDark(F.skin) : F.skin, sl = F.sleeveC && (back ? fDark(F.sleeveC) : F.sleeveC);
        const uw = F.fem ? 5.4 : 8, fw = F.fem ? 4.6 : 6.8;
        const kind = F.sleeve || 'none';
        if (kind === 'long') { fLimb(g, s, e, uw + 0.6, sl); fLimb(g, e, h, fw + 0.6, sl); }
        else if (kind === 'gi') { fLimb(g, e, fAt(e, h, 0.4), fw, sk); fLimb(g, fAt(e, h, 0.35), h, fw - 0.4, sk); fLimb(g, s, e, uw + 2, sl); fLimb(g, e, fAt(e, h, 0.38), fw + 3, sl); }
        else if (kind === 'rolled') { fLimb(g, e, h, fw, sk); fLimb(g, s, e, uw + 0.6, sl); const c = fAt(s, e, 0.96); ell(g, c[0], c[1], 3.6, 3.2, sl.l); }
        else {
          fLimb(g, s, e, uw, sk); fLimb(g, e, h, fw, sk);
          if (!F.fem) { const m = fAt(s, e, 0.45); ell(g, m[0], m[1], uw * 0.42, uw * 0.36, 'rgba(255,240,220,0.22)'); }
          if (kind === 'short') fLimb(g, s, fAt(s, e, 0.5), uw + 1.4, sl);
        }
        if (F.manica && !back) { for (let i = 0; i < 3; i++) { const p = fAt(s, e, 0.15 + i * 0.3); ell(g, p[0], p[1], 3.8, 2.4, i % 2 ? '#c8ccd8' : '#9aa0b4'); } }
        if (F.tattoo && !back) { const a = fAt(s, e, 0.25), b = fAt(s, e, 0.8); line(g, a[0], a[1], b[0], b[1], 0.6, F.accent); }
        fHand(g, e, h, F, back);
      }

    function fFoot(g, k, f, F, back) {
        const u = fUnit(k, f), side = Math.abs(u[0]) > Math.abs(u[1]);
        const sk = back ? fDark(F.skin) : F.skin, fc = F.footC && (back ? fDark(F.footC) : F.footC);
        const cx = side ? f[0] + u[0] * 0.6 : f[0] - 2.4, cy = side ? f[1] : f[1] - 1.5, rx = side ? 2.4 : 4.6, ry = side ? 4.4 : 2.3;
        const kind = F.feet || 'bare';
        if (kind === 'bare' || kind === 'sandal') {
          ell(g, cx, cy, rx, ry, lg(g, cx - rx, cy - ry, cx + rx, cy + ry, [[0, sk.l], [1, sk.d]]));
          const a = fAt(k, f, 0.86); ell(g, a[0], a[1], 3.6, 1.6, kind === 'sandal' ? '#6a3a14' : (F.wrapC || '#f4f0e8'));
        } else {
          ell(g, cx, cy, rx + 0.6, ry + 0.4, lg(g, cx - rx, cy - ry, cx + rx, cy + ry, [[0, fc.l], [0.5, fc.m], [1, fc.d]]));
          if (!side) { g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(cx - rx - 0.6, cy + ry - 0.6, rx * 2 + 1.2, 1); }
        }
      }

    function fLeg(g, hp, k, f, F, back) {
        const sk = back ? fDark(F.skin) : F.skin, lc = back ? fDark(F.legC) : F.legC;
        const tw = F.fem ? 7 : 9.4, sw = F.fem ? 5.4 : 7.2, legs = F.legs;
        const boot = F.feet === 'boots' || F.feet === 'greaves';
        if (legs === 'shorts' || legs === 'skirt') {
          fLimb(g, hp, k, tw, sk); fLimb(g, k, f, sw, sk);
          if (legs === 'shorts') {
            const m = fAt(hp, k, 0.66); fLimb(g, hp, m, tw + 3.6, lc);
            const u = fUnit(hp, k), px = -u[1] * (tw + 3.6) / 2, py = u[0] * (tw + 3.6) / 2;
            line(g, m[0] + px, m[1] + py, m[0] - px, m[1] - py, 1.2, F.accent);
          }
        } else {
          const w2 = legs === 'gi' ? 2.6 : legs === 'tights' ? -0.6 : 0.8;
          fLimb(g, hp, k, tw + w2, lc); fLimb(g, k, fAt(k, f, boot ? 0.6 : 0.92), sw + w2, lc);
          if (legs === 'gi') { const a = fAt(k, f, 0.86); ell(g, a[0], a[1], 4.6, 2.2, lc.m); }
          if (F.legStripe) { line(g, hp[0] + 2, hp[1], k[0] + 2, k[1], 0.8, F.legStripe); line(g, k[0] + 2, k[1], f[0] + 1.5, f[1] - 3, 0.8, F.legStripe); }
        }
        if (boot) {
          const c = back ? fDark(F.footC) : F.footC;
          fLimb(g, fAt(k, f, F.feet === 'greaves' ? 0.12 : 0.5), fAt(k, f, 0.9), sw + 1.2, c);
          if (F.feet === 'greaves') { const m = fAt(k, f, 0.4); ell(g, m[0] - 1, m[1], 2, 4, 'rgba(255,255,255,0.35)'); }
        }
        fFoot(g, k, f, F, back);
      }

    function fHead(g, P, F, S) {
        const hx = P.head[0], hy = P.head[1], sk = F.skin, hc = F.hairC || '#1a1410', acc = F.accent;
        // hair that hangs behind the head
        if (F.hair === 'ponytail') { limb(g, hx + 4, hy - 3, hx + 11, hy + 6, 4, '#000', hc, null); limb(g, hx + 11, hy + 6, hx + 9, hy + 15, 3, '#000', hc, null); ell(g, hx + 5, hy - 3, 2, 2, F.accent); }
        if (F.hair === 'mullet') poly(g, [[hx + 2, hy - 2], [hx + 7.4, hy - 1], [hx + 8, hy + 9], [hx + 3, hy + 7]], hc);
        if (F.hair === 'dreads') [0, 1, 2, 3].forEach((i) => limb(g, hx + 1 + i * 1.8, hy - 4, hx + 4 + i * 2.6, hy + 9 + (i % 2) * 2, 2, '#000', hc, null));
        if (F.hat === 'helmet') poly(g, [[hx - 8, hy - 7], [hx - 4, hy - 15], [hx + 4, hy - 16], [hx + 10, hy - 11], [hx + 11, hy - 4], [hx + 7, hy - 8], [hx, hy - 10]], lg(g, hx, hy - 16, hx, hy - 6, [[0, '#ff4a3a'], [1, '#8a1010']]));
        limb(g, P.sh[0] + 1, P.sh[1] + 1, hx + 1, hy + 4.6, F.fem ? 4.6 : 6.4, sk.d, sk.m, null);
        ell(g, hx, hy, 6.3, 7.4, lg(g, hx - 6, hy - 7, hx + 6, hy + 7, [[0, sk.l], [0.6, sk.m], [1, sk.d]]));
        if (!F.fem) poly(g, [[hx - 6.2, hy + 1], [hx - 5.4, hy + 6], [hx - 1.6, hy + 8], [hx + 3.8, hy + 6.6], [hx + 6, hy + 1.6]], lg(g, hx, hy, hx, hy + 8, [[0, sk.m], [1, sk.d]]));
        ell(g, hx + 4.6, hy + 0.6, 1.4, 2.2, sk.d);
        // hair caps, clipped to the skull
        g.save(); g.beginPath(); g.ellipse(hx, hy, 6.9, 8, 0, 0, Math.PI * 2); g.clip();
        const hairline = [[hx - 9, hy - 12], [hx + 9, hy - 12], [hx + 9, hy + 4], [hx + 3.4, hy + 3.2], [hx + 2.6, hy - 1.6], [hx - 2, hy - 3.2], [hx - 9, hy - 3.8]];
        if (F.hair === 'buzz') { g.globalAlpha = 0.85; poly(g, hairline, hc); g.globalAlpha = 1; }
        else if (F.hair === 'mohawk') { g.globalAlpha = 0.35; poly(g, hairline, hc); g.globalAlpha = 1; }
        else if (F.hair && F.hair !== 'none') poly(g, hairline, lg(g, hx, hy - 8, hx, hy + 3, [[0, lerpCol(hc, '#ffffff', 0.25)], [1, hc]]));
        if (F.face === 'balaclava') { g.fillStyle = '#121218'; g.fillRect(hx - 9, hy + 1.2, 18, 10); g.fillStyle = acc; g.fillRect(hx - 9, hy + 1.2, 18, 0.7); }
        if (F.face === 'lucha') {
          g.fillStyle = lg(g, hx, hy - 8, hx, hy + 8, [[0, F.faceC.l], [1, F.faceC.d]]); g.fillRect(hx - 9, hy - 10, 18, 20);
          poly(g, [[hx - 7, hy - 1], [hx - 3, hy - 4.6], [hx + 3, hy - 4.6], [hx + 4.6, hy - 0.4], [hx + 1, hy + 1.6], [hx - 1.4, hy - 1], [hx - 4, hy + 1.6]], acc);
          line(g, hx - 1, hy - 8, hx - 1, hy - 4.6, 1.2, acc);
        }
        g.restore();
        if (F.hair === 'mohawk') { for (let i = 0; i < 5; i++) poly(g, [[hx - 5 + i * 2.6, hy - 5.6], [hx - 4.6 + i * 2.6, hy - 12 - (i % 2) * 2], [hx - 2.2 + i * 2.6, hy - 6.2]], i % 2 ? acc : lerpCol(acc, '#000000', 0.25)); }
        if (F.hair === 'topknot') { ell(g, hx + 1.4, hy - 8.8, 2.6, 2.2, hc); line(g, hx - 0.4, hy - 7, hx + 3.2, hy - 7, 1, acc); }
        if (F.hair === 'slick' || F.hair === 'ponytail') line(g, hx - 4, hy - 5.6, hx + 3, hy - 6.6, 0.7, 'rgba(255,255,255,0.4)');
        // face
        const ex1 = hx - 4, ex2 = hx + 0.8, ey = hy - 0.4;
        const masked = F.face === 'shades' || F.face === 'domino' || F.face === 'lucha' || F.face === 'balaclava' || F.face === 'oni';
        if (F.face === 'lucha') { [ex1, ex2].forEach((x) => ell(g, x, ey, 2.2, 1.6, '#ffffff')); }
        if (S.stun) {
          [ex1, ex2].forEach((x) => { line(g, x - 1.2, ey - 1, x + 1.2, ey + 1, 0.7, '#2a1a1a'); line(g, x - 1.2, ey + 1, x + 1.2, ey - 1, 0.7, '#2a1a1a'); });
        } else {
          [ex1, ex2].forEach((x, i) => {
            if (masked && F.glowEyes) eyeGlow(g, x, ey, 1.1, acc);
            ell(g, x, ey, i ? 1.3 : 1.5, 0.9, masked && F.glowEyes ? acc : '#f4f0ea');
            ell(g, x - 0.3, ey, 0.6, 0.7, masked && F.glowEyes ? '#ffffff' : '#20140e');
          });
        }
        if (F.face !== 'lucha') {
          line(g, hx - 6.2, hy - 3.1, hx - 2.6, hy - 1.9, 1.1, F.browC || hc); line(g, hx - 0.6, hy - 2, hx + 2.8, hy - 3.1, 1.1, F.browC || hc);
          poly(g, [[hx - 2.2, hy - 1.4], [hx - 4.2, hy + 2.4], [hx - 2.2, hy + 2.8]], sk.d);
        }
        if (F.scar) line(g, hx + 0.4, hy - 4.4, hx + 2, hy + 1.6, 0.6, '#c8504a');
        if (F.facial === 'stubble') { g.globalAlpha = 0.32; poly(g, [[hx - 6, hy + 3], [hx - 1.6, hy + 7.8], [hx + 4.6, hy + 5.6], [hx + 5, hy + 2.4], [hx - 1, hy + 3.6]], hc); g.globalAlpha = 1; }
        if (F.facial === 'beard') poly(g, [[hx - 6, hy + 2.6], [hx - 4.8, hy + 8], [hx - 1, hy + 10.4], [hx + 4.4, hy + 7.4], [hx + 5, hy + 2], [hx + 1, hy + 4.6], [hx - 3, hy + 3.6]], hc);
        if (F.facial === 'mustache') { g.strokeStyle = hc; g.lineWidth = 1.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx - 6.6, hy + 2.6); g.quadraticCurveTo(hx - 3, hy + 2.4, hx + 0.8, hy + 4); g.stroke(); }
        if (F.face !== 'balaclava' && F.face !== 'oni') {
          if (S.atk) ell(g, hx - 3, hy + 4.8, 1.6, 1.2, '#3a0e0e');
          else line(g, hx - 4.6, hy + 4.8, hx - 1, hy + 4.4, 0.8, '#4a1e18');
        }
        if (F.face === 'domino') { poly(g, [[hx - 7, hy - 2.4], [hx + 3.6, hy - 2.6], [hx + 5.8, hy - 0.8], [hx + 3.6, hy + 1.4], [hx - 1.6, hy + 0.6], [hx - 6.8, hy + 1.2]], '#121218'); [ex1, ex2].forEach((x) => { if (!S.stun) { eyeGlow(g, x, ey, 0.9, acc); ell(g, x, ey, 1.1, 0.7, acc); } }); }
        if (F.face === 'shades') {
          poly(g, [[hx - 7.2, hy - 2.2], [hx + 4.6, hy - 2.4], [hx + 5, hy + 0.4], [hx - 1, hy + 1.2], [hx - 6.6, hy + 1.2]], '#0a0a12');
          if (!S.stun) { g.fillStyle = acc; g.fillRect(hx - 6.6, hy - 0.8, 10.6, 0.8); eyeGlow(g, hx - 3.4, hy - 0.4, 1.2, acc); }
        }
        if (F.face === 'oni') {
          poly(g, [[hx - 6.6, hy + 1.2], [hx + 4.6, hy + 1], [hx + 5.2, hy + 4.8], [hx + 1, hy + 9], [hx - 4, hy + 8.6], [hx - 6.4, hy + 5]], lg(g, hx, hy, hx, hy + 9, [[0, '#ff3a3a'], [1, '#7a0a14']]));
          for (let i = 0; i < 4; i++) poly(g, [[hx - 5 + i * 2.2, hy + 4.6], [hx - 4 + i * 2.2, hy + 7], [hx - 3 + i * 2.2, hy + 4.6]], '#f4f0e0');
          line(g, hx - 5.6, hy + 4.4, hx + 3.6, hy + 4.4, 0.6, '#2a0408');
        }
        // headwear
        if (F.hat === 'flatcap') {
          ell(g, hx + 0.6, hy - 4.6, 7.4, 3.8, lg(g, hx - 6, hy - 8, hx + 6, hy - 1, [[0, F.hatC.l], [0.6, F.hatC.m], [1, F.hatC.d]]));
          poly(g, [[hx - 6.6, hy - 3.6], [hx - 11, hy - 2], [hx - 10, hy - 1], [hx - 4, hy - 1.8]], F.hatC.d); ell(g, hx + 0.4, hy - 8, 0.9, 0.7, F.hatC.l);
          line(g, hx - 5, hy - 6.6, hx + 6, hy - 5.4, 0.4, 'rgba(255,255,255,0.25)');
        }
        if (F.hat === 'beret') { ell(g, hx + 2, hy - 5.8, 7.6, 3, F.hatC.m, -0.18); ell(g, hx + 0.6, hy - 6.6, 5, 1.4, F.hatC.l, -0.18); line(g, hx + 2, hy - 8.6, hx + 2.6, hy - 10, 1, F.hatC.d); }
        if (F.hat === 'bandana') { rrect(g, hx - 6.6, hy - 5.6, 13.2, 2.6, 1, F.hatC.m); limb(g, hx + 6, hy - 4.4, hx + 10, hy - 1, 1.6, F.hatC.d, F.hatC.m, null); limb(g, hx + 6, hy - 4.4, hx + 10.6, hy - 5.6, 1.6, F.hatC.d, F.hatC.m, null); }
        if (F.hat === 'helmet') {
          g.save(); g.beginPath(); g.ellipse(hx, hy, 7.6, 8.6, 0, 0, Math.PI * 2); g.clip();
          poly(g, [[hx - 9, hy - 10], [hx + 9, hy - 10], [hx + 9, hy + 9], [hx + 2.6, hy + 9], [hx + 1.4, hy + 0.4], [hx - 2.6, hy - 3.2], [hx - 9, hy - 3.6]], lg(g, hx - 7, hy - 8, hx + 7, hy + 6, [[0, '#f4f4fa'], [0.4, '#b4b8c8'], [1, '#4a4e64']]));
          g.restore();
          rrect(g, hx - 7.8, hy - 4.6, 15.6, 1.8, 0.8, lg(g, 0, hy - 5, 0, hy - 3, GOLD));
          line(g, hx + 2, hy - 2, hx + 3, hy + 7, 0.6, 'rgba(0,0,0,0.45)');
        }
      }

    function fighterReg(kind, F) {
        FIGHT_FRAMES.forEach(function (m) {
          reg2('boss_' + kind + m[0], 64, 80, function (g) {
            const P = FIGHT_POSE[m[1]], S = { atk: m[1] === 'attack' || m[1] === 'kick' || m[1] === 'upper' || m[1] === 'jump', stun: m[1] === 'stun', pose: m[1] };
            const T = fFrame(P, F), W = T.W, acc = F.accent;
            if (F.air) hoverPlate(g, F.plate[0], F.plate[1], F.plate[2], m[1] === 'jump' ? -8 : 0);
            if (F.back) F.back(g, P, T, S);
            fArm(g, T.at(0.94, W.s - 2.4), P.be, P.bh, F, true);
            fLeg(g, T.at(0, 3), P.bk, P.bf, F, true);
            fLeg(g, T.at(0, -3), P.fk, P.ff, F, false);
            if (F.legs !== 'skirt') ell(g, P.hip[0], P.hip[1] + 1, W.h + 1.6, 4.4, lg(g, 0, P.hip[1] - 4, 0, P.hip[1] + 5, [[0, F.legC.l], [1, F.legC.d]]));
            else { for (let i = -3; i <= 3; i++) { const a = T.at(-0.02, i * 2.4); rrect(g, a[0] - 1.1, a[1], 2.2, 7.4, 0.6, i % 2 ? '#8a5228' : '#6a3a18'); } }
            fTorso(g, P, F, T);
            fHead(g, P, F, S);
            fArm(g, T.at(0.94, -W.s + 2.4), P.fe, P.fh, F, false);
            if (F.front) F.front(g, P, T, S);
            // motion: speed lines and impact flashes in the strike frames
            g.globalAlpha = 0.75;
            if (m[1] === 'attack') { for (let i = 0; i < 3; i++) line(g, P.fh[0] + 6 + i, P.fh[1] - 3 + i * 3, P.fh[0] + 16 - i * 2, P.fh[1] - 3 + i * 3, 0.8, acc); fStar(g, P.fh[0] - 3, P.fh[1], 4, 'rgba(255,255,255,0.85)'); }
            if (m[1] === 'kick') {
              // swept arc of the kicking foot, from the floor up to the strike
              const hx = P.hip[0], hy = P.hip[1], r = Math.hypot(P.ff[0] - hx, P.ff[1] - hy), a1 = Math.atan2(P.ff[1] - hy, P.ff[0] - hx), a0 = a1 - 1.05;
              g.globalAlpha = 0.35; g.fillStyle = acc; g.beginPath(); g.arc(hx, hy, r + 3, a0, a1, false); g.arc(hx, hy, r - 6, a1, a0, true); g.closePath(); g.fill();
              g.globalAlpha = 0.85; g.strokeStyle = acc; g.lineWidth = 1; g.beginPath(); g.arc(hx, hy, r + 3, a0, a1, false); g.stroke();
              fStar(g, P.ff[0] - 3, P.ff[1], 4, 'rgba(255,255,255,0.85)');
            }
            if (m[1] === 'jump') { for (let i = 0; i < 4; i++) line(g, 44 + i * 4, 44 + i * 3, 56 + i * 2, 34 + i * 3, 0.8, acc); }
            if (m[1] === 'upper') { for (let i = 0; i < 3; i++) line(g, P.fh[0] - 3 + i * 3, P.fh[1] + 8, P.fh[0] - 3 + i * 3, P.fh[1] + 18 - i * 2, 0.8, acc); eyeGlow(g, P.fh[0], P.fh[1] - 1, 2.2, acc); }
            g.globalAlpha = 1;
            if (S.stun) {
              g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(70,70,100,0.3)'; g.fillRect(0, 0, 64, 80); g.globalCompositeOperation = 'source-over';
              const hx = P.head[0], hy = P.head[1] - 11;
              [[-8, 0], [7, -2], [-1, -5]].forEach((p) => fStar(g, hx + p[0], hy + p[1], 3.2, '#ffd23f'));
            }
          }, { shade: 0.45 });
        });
      }

    function hoverPlate(g, c1, c2, glowCol, dy) {
        dy = dy || 0;
        ell(g, 32, 77 + dy, 24, 3.4, glowCol);
        ell(g, 32, 73.6 + dy, 20, 3.6, lg(g, 12, 70 + dy, 52, 77 + dy, [[0, c1], [1, c2]]));
        [[18, 77.6], [32, 78], [46, 77.6]].forEach((p) => ell(g, p[0], p[1] + dy, 3, 1.6, 'rgba(255,255,255,0.8)'));
      }

    const BOLT = { noOutline: true, shade: 0 };

    Object.assign(C, { FIGHT_POSE, FIGHT_FRAMES, FSKIN, BOLT });
  };
})();
