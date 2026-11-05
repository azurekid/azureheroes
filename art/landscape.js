/* Shared, code-drawn assets for Azure Heroes 2027. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  AH.ArtModules.stages['art.landscape.9'] = function (C) {
    const { glowRect, lg } = C;

    Object.assign(C, { silFill, lit, rim });
    function silFill(g, y0, y1, a, b) { return lg(g, 0, y0, 0, y1, [[0, a], [1, b]]); }

    function lit(g, x, y, w, h, c) { glowRect(g, c, x, y, w, h); g.fillStyle = c; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x, y, w, Math.min(0.8, h)); }

    function rim(g, x, y, h, c) { g.fillStyle = c; g.fillRect(x, y, 0.9, h); }
  };

  AH.ArtModules.stages['art.landscape.16'] = function (C) {

    Object.assign(C, { palms });
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
  };

  AH.ArtModules.stages['art.landscape.18'] = function (C) {

    const PAL = {
    westeurope: C.part('amsterdam', 'PAL_westeurope'),
    uksouth: C.part('london', 'PAL_uksouth'),
    japaneast: C.part('tokyo', 'PAL_japaneast'),
    australiaeast: C.part('sydney', 'PAL_australiaeast'),
    brazilsouth: C.part('rio', 'PAL_brazilsouth'),
    eastus: C.part('virginia', 'PAL_eastus'),
    eastus2: C.part('new-york', 'PAL_eastus2')
    };

    Object.assign(C, { PAL });
  };

  AH.ArtModules.stages['art.landscape.20'] = function (C) {
    const { FLAT, PAL, reg2, skyline } = C;

    Object.assign(C, { farLayer, farPlain });
    function farLayer(region) { return C.regionPart(region, 'panorama'); }

    ['westeurope', 'uksouth', 'japaneast', 'australiaeast', 'brazilsouth', 'eastus', 'eastus2'].forEach(function (k) {
        reg2('bg_far_' + k, 640, 220, farLayer(k), FLAT);
      });

    function farPlain(region) {
      const local = C.regionPart(region, 'plainPanorama', true);
      if (local) return local;
      const P = PAL[region];
      return function (g, w, h) {
        skyline(w, h, 163 + region.length, '#2a1a78', P.accent, 26, 80, 0.22, P.win)(g); skyline(w, h, 263 + region.length, '#341a80', P.accent, 10, 40, 0.3, P.win)(g);
      };
    }

    ['westeurope', 'uksouth', 'japaneast', 'australiaeast', 'brazilsouth', 'eastus2'].forEach(function (k) { reg2('bg_farp_' + k, 640, 220, farPlain(k), FLAT); });
  };
})();
