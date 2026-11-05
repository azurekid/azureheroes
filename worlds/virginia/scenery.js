/* Local artwork and appearance data; shared drawing rigs live in art/. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.Worlds = AH.Worlds || {};
  const world = AH.Worlds['virginia'] = AH.Worlds['virginia'] || {};
  const content = world.art = world.art || { parts: {} };
  AH.ArtModules.regions['eastus'] = content;

  AH.ArtModules.stages['worlds.virginia.scenery.15'] = function (C) {
    const { lg, lit, poly, silFill } = C;

    Object.assign(C, { capitol, monument, lincoln, vaReturn, vaTerrace });
    // Virginia depth: marble returns in violet dusk, lit cornices and stepped Mall terraces.
    function vaReturn(g, x, top, width, base, depth, roof) {
        C.depthFace(g, x, top, width, base, depth, 'rgba(48,26,120,0.45)', roof === false ? 'rgba(0,0,0,0)' : 'rgba(255,244,255,0.42)');
      }

    function vaTerrace(g, x, base, width, depth) {
        C.depthGround(g, x, base, width, depth, '#3a2a86', 'rgba(232,222,255,0.55)');
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
        vaReturn(g, cx + 34 * s, base - 22 * s, 40 * s, base, 6 * s); vaReturn(g, cx - 74 * s, base - 22 * s, 40 * s, base, 6 * s);
        vaReturn(g, cx - 34 * s, base - 36 * s, 68 * s, base, 6 * s, false); vaReturn(g, cx - 20 * s, base - 52 * s, 40 * s, base - 36 * s, 4 * s, false);
        vaTerrace(g, cx - 80 * s, base + 2, 160 * s, 6 * s);
      }

    function monument(g, cx, base, s, P) {
        poly(g, [[cx - 6.5 * s, base], [cx - 3.6 * s, base - 128 * s], [cx, base - 142 * s], [cx + 3.6 * s, base - 128 * s], [cx + 6.5 * s, base]], lg(g, cx - 6 * s, 0, cx + 6 * s, 0, [[0, '#ffffff'], [0.5, '#d8d0ff'], [1, '#8a7ae0']]));
        g.strokeStyle = 'rgba(100,70,200,0.4)'; g.lineWidth = 0.5; for (let k = 1; k < 14; k++) { const y = base - k * 9 * s; g.beginPath(); g.moveTo(cx - (6.4 - k * 0.2) * s, y); g.lineTo(cx + (6.4 - k * 0.2) * s, y); g.stroke(); }
        lit(g, cx - 1.4, base - 146 * s, 2.8, 3, '#ff2a4a');
        const hz = g.createRadialGradient(cx, base - 144 * s, 0, cx, base - 144 * s, 14); hz.addColorStop(0, 'rgba(255,40,70,0.55)'); hz.addColorStop(1, 'rgba(255,40,70,0)'); g.fillStyle = hz; g.fillRect(cx - 14, base - 160 * s, 28, 32);
        poly(g, [[cx + 1.5 * s, base - 128 * s], [cx + 3.6 * s, base - 128 * s], [cx + 6.5 * s, base], [cx + 2.4 * s, base]], 'rgba(60,34,140,0.32)');
        vaTerrace(g, cx - 16 * s, base + 2, 32 * s, 5 * s);
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
        vaReturn(g, cx - 40 * s, base - 56 * s, 80 * s, base - 46 * s, 3 * s); vaReturn(g, cx - 46 * s, base - 46 * s, 92 * s, base - 14 * s, 5 * s, false);
        vaReturn(g, cx - 52 * s, base - 14 * s, 104 * s, base, 4 * s, false);
        vaTerrace(g, cx - 58 * s, base + 2, 116 * s, 6 * s);
      }
  };

  content.parts['panorama'] = function (C) {
    const { PAL } = C;
    const capitol = (...args) => C.capitol(...args);
    const lincoln = (...args) => C.lincoln(...args);
    const monument = (...args) => C.monument(...args);
    const skyline = (...args) => C.skyline(...args);

    return function (g, w, h) {
    const P = PAL['eastus'];
    const base = h - 6;
    
            skyline(w, h, 77, '#2a1a78', P.accent, 20, 46, 0.25, P.win)(g);
            C.depthGround(g, 20, h, 600, 6, '#211448', 'rgba(110,190,150,0.32)');
            capitol(g, 130, base, 1.0, P); monument(g, 320, base, 0.95, P); lincoln(g, 510, base, 0.85, P);
            C.poly(g, [[352, h - 1], [458, h - 1], [452, h - 4], [358, h - 4]], 'rgba(160,205,255,0.55)');
            C.line(g, 360, h - 2.5, 450, h - 2.5, 0.6, 'rgba(255,240,255,0.6)');
          
    };
  };
})();
