/* Azure Heroes 2027 - every sprite, tile, background and the pixel font is drawn here with code.
 * Art is rendered at 2x density (D): game logic keeps using 640x360 units, textures carry twice the pixels. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});

  const NAVY = '#0a0720';
  const D = 2;
  const defs = {};
  // density used by reg2; raised temporarily to build the high-density Hero Lab / title portraits
  let DEN = D, HDX = false;

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
  function reg2(key, w, h, fn, opt) { regArt(key, w, h, fn, opt); }
  function regArt(key, w, h, fn, opt) {
    opt = opt || {};
    let c = cv(w * DEN, h * DEN);
    const g = c.getContext('2d');
    g.scale(DEN, DEN);
    fn(g, w, h);
    crisp(c);
    if (opt.shade !== 0) shade(c, opt.shade === undefined ? 0.6 : opt.shade);
    if (!opt.noOutline) { outline(c); if (DEN > D) outline(c); }
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
  // Hero Lab: body type, skin tone, hair style, hair colour and suit colour are all parameters of the same rig.
  const HERO_SKIN = [
    ['#ffe4cc', '#f6c6a0', '#c98e6a'], ['#ffd2ad', '#eaa77c', '#b8764e'], ['#f8d09a', '#d8a06a', '#9c6a3a'],
    ['#dca476', '#b47a4a', '#7a4c2a'], ['#b47c52', '#86522e', '#52301a'], ['#8e5c3c', '#603b24', '#3a2014']
  ];
  const HERO_HAIR = [
    ['#4a4a7a', '#1a1840', '#07072a'], ['#a8744a', '#5e3820', '#2a160c'], ['#ee8a52', '#a8381e', '#4e1208'],
    ['#fff4b0', '#e8c060', '#9a7224'], ['#ffb0dc', '#d0609a', '#5a1f4f'], ['#ffffff', '#c4c8e8', '#6a6a9a']
  ];
  const HERO_HAIR_STYLES = ['swoop', 'buzz', 'afro', 'long', 'pony', 'braids', 'bob'];
  const HERO_REGIONAL_HAIR = [
    ['canalbraid', 'CANAL BRAID', 'AMSTERDAM', 0], ['sidepart', 'TAILORED PART', 'LONDON', 1],
    ['waves', 'SEINE WAVES', 'PARIS', 2], ['tidybun', 'TIDY BUN', 'TOKYO', 3],
    ['surfcrop', 'SURF CROP', 'SYDNEY', 4], ['swept', 'LAGOON SWEEP', 'VENICE', 5],
    ['curls', 'RIO CURLS', 'RIO', 6], ['ribbonbraid', 'RIBBON BRAID', 'MEXICO CITY', 7],
    ['undercut', 'CAMPUS UNDERCUT', 'REDMOND', 8], ['coils', 'CROWN COILS', 'VIRGINIA', 9]
  ];
  HERO_HAIR_STYLES.push(...HERO_REGIONAL_HAIR.map((x) => x[0]));
  const HERO_SUIT = [
    { suit: '#2f6bff', suitD: '#16339e', suitM: '#2455e0', suitL: '#6fb4ff', cape: '#2447c9', capeL: '#4f82ff', capeD: '#101e70', boots: '#0f1c66', bootL: '#3a58d8', cuff: '#8fd6ff' },
    { suit: '#ff4fa0', suitD: '#9a1458', suitM: '#e0367f', suitL: '#ffa6d2', cape: '#c8237a', capeL: '#ff6ab8', capeD: '#5e0838', boots: '#5e0838', bootL: '#e04898', cuff: '#ffc8e6' },
    { suit: '#8a4aff', suitD: '#3e168e', suitM: '#6a32e0', suitL: '#c4a0ff', cape: '#5a28c0', capeL: '#9a6aff', capeD: '#260a60', boots: '#260a60', bootL: '#7a48e0', cuff: '#d8c4ff' },
    { suit: '#14b8a8', suitD: '#06564e', suitM: '#0e8e82', suitL: '#7ff0e0', cape: '#0a7a8a', capeL: '#2ac8d8', capeD: '#04363e', boots: '#04363e', bootL: '#1aa0a0', cuff: '#b8fff4' },
    { suit: '#ffb020', suitD: '#9a5a08', suitM: '#e08a10', suitL: '#ffe08a', cape: '#d0401a', capeL: '#ff7a3a', capeD: '#5e1404', boots: '#5e1404', bootL: '#d8601a', cuff: '#fff0b8' },
    // region suits: unlock = index in AH.Levels.ids that must be cleared first
    { name: 'ORANJE', unlock: 0, suit: '#ff7a10', suitD: '#9a3a04', suitM: '#e05e08', suitL: '#ffc070', cape: '#1a3aa8', capeL: '#4a72ff', capeD: '#0a1650', boots: '#0a1650', bootL: '#3a5ad8', cuff: '#ffffff' },
    { name: 'ROYAL GUARD', unlock: 1, suit: '#d0202a', suitD: '#6a0a10', suitM: '#a8141e', suitL: '#ff7a7a', cape: '#20202e', capeL: '#4a4a62', capeD: '#08080e', boots: '#08080e', bootL: '#3a3a4e', cuff: '#ffd84a' },
    { name: 'TRICOLORE', unlock: 2, suit: '#2448c0', suitD: '#0e1a60', suitM: '#1a34a0', suitL: '#7aa0ff', cape: '#e02030', capeL: '#ff6a6a', capeD: '#6a0810', boots: '#0e1a60', bootL: '#3a5ad8', cuff: '#ffffff' },
    { name: 'NEON', unlock: 3, suit: '#3a1a6a', suitD: '#140628', suitM: '#2a1050', suitL: '#ff4fd0', cape: '#08a8c8', capeL: '#5af0ff', capeD: '#043a50', boots: '#140628', bootL: '#ff4fd0', cuff: '#5af0ff' },
    { name: 'REEF', unlock: 4, suit: '#18c0c8', suitD: '#06585e', suitM: '#0e9098', suitL: '#9ff8f0', cape: '#ff6a52', capeL: '#ffa890', capeD: '#7a200e', boots: '#06585e', bootL: '#2ad0d0', cuff: '#ffe8a0' },
    { name: 'CARNEVALE', unlock: 5, suit: '#e0a820', suitD: '#7a4a04', suitM: '#c0860c', suitL: '#fff0a0', cape: '#6a1a9a', capeL: '#a85aff', capeD: '#2a0644', boots: '#2a0644', bootL: '#8a3ad8', cuff: '#ffffff' },
    { name: 'SAMBA', unlock: 6, suit: '#18a040', suitD: '#06481a', suitM: '#0e7a30', suitL: '#8af0a0', cape: '#ffd020', capeL: '#fff07a', capeD: '#8a6a04', boots: '#06481a', bootL: '#2ac860', cuff: '#2a6aff' },
    { name: 'LUCHADOR', unlock: 7, suit: '#d81a7a', suitD: '#6a0636', suitM: '#a8105c', suitL: '#ff8ac8', cape: '#ffc020', capeL: '#fff07a', capeD: '#8a5a04', boots: '#14142a', bootL: '#4a4a7a', cuff: '#2ae0a0' },
    { name: 'XBOX', unlock: 8, suit: '#107c10', suitD: '#04380a', suitM: '#0a5e0e', suitL: '#7ae07a', cape: '#202024', capeL: '#4a4a52', capeD: '#08080a', boots: '#08080a', bootL: '#3a3a42', cuff: '#9bf09b' },
    { name: 'GOLD DEFENDER', unlock: 9, suit: '#e8ecf8', suitD: '#7a80a8', suitM: '#b8c0dc', suitL: '#ffffff', cape: '#e0a010', capeL: '#ffe070', capeD: '#7a4a04', boots: '#3a3a6a', bootL: '#8a8ac8', cuff: '#ffd84a' },
    // classic outfits open from the start (appended so saved suit indexes stay valid)
    { name: 'COWBOY', unlock: -1, outfit: 'cowboy', suit: '#3a6ab0', suitD: '#1a3460', suitM: '#2a5090', suitL: '#8ab0e0', cape: '#8a4a1c', capeL: '#c07a3a', capeD: '#4a2208', boots: '#5a2e10', bootL: '#a0602a', cuff: '#f0d8a0' },
    { name: 'INDIA KURTA', unlock: -1, outfit: 'kurta', suit: '#f4ead2', suitD: '#a8946a', suitM: '#d8c8a0', suitL: '#ffffff', cape: '#8a1a3a', capeL: '#c8406a', capeD: '#4a0820', boots: '#5a2a10', bootL: '#a0602a', cuff: '#e8b030' },
    { name: 'CLOUD HACKER', unlock: -1, outfit: 'hacker', suit: '#190d20', suitD: '#160d1b', suitM: '#3d2035', suitL: '#704052', cape: '#713449', capeL: '#d47782', capeD: '#240e1e', boots: '#160d1b', bootL: '#3d2035', cuff: '#321321' }
  ];
  // Gold Mode easter-egg suit: drawn only for gold runs, never listed in Hero Lab or saved
  const GOLD_SUIT = { name: 'GOLDEN HERO', unlock: -1, suit: '#ffc828', suitD: '#8a5204', suitM: '#e09a10', suitL: '#fff3a8', cape: '#ffd848', capeL: '#fffac8', capeD: '#a86808', boots: '#7a4804', bootL: '#ffd848', cuff: '#ffffff' };
  const SUIT_BASE = ['AZURE', 'ROSE', 'VIOLET', 'TEAL', 'SUNSET'];
  HERO_SUIT.forEach((c, i) => { if (!c.name) { c.name = SUIT_BASE[i]; c.unlock = -1; } });
  const HERO_OUTFITS = [
    ['CANAL JACKET', 'jacket'], ['FORMAL COAT', 'coat'], ['BRETON TOP', 'breton'],
    ['KIMONO', 'kimono'], ['REEF VEST', 'vest'], ['GONDOLIER', 'gondolier'],
    ['RIO TRACKSUIT', 'tracksuit'], ['CHARRO JACKET', 'charro'],
    ['CAMPUS HOODIE', 'hoodie'], ['TRAIL COAT', 'trail']
  ];
  HERO_OUTFITS.forEach((x, i) => { HERO_SUIT[i + 5].name = x[0]; HERO_SUIT[i + 5].outfit = x[1]; });
  // suits unlock when the level with that index is cleared (Save.unlocked >= index + 2)
  const suitOpen = (i, unlocked) => !!HERO_SUIT[i] && (HERO_SUIT[i].unlock < 0 || (unlocked || 1) >= HERO_SUIT[i].unlock + 2);
  // local wardrobe: [key, name, where it comes from]
  const HERO_HATS = [['none', 'NONE', 'NO HAT'], ['cowboy', 'COWBOY HAT', 'TEXAS, USA'], ['sombrero', 'SOMBRERO', 'MEXICO'],
    ['bowler', 'BOWLER HAT', 'LONDON, UK'], ['beret', 'BERET', 'PARIS, FRANCE'], ['crown', 'ORANGE CROWN', "KING'S DAY, NL"],
    ['hachimaki', 'HACHIMAKI', 'TOKYO, JAPAN'], ['cork', 'CORK HAT', 'OUTBACK, AUSTRALIA'], ['boater', 'GONDOLIER HAT', 'VENICE, ITALY'],
    ['plumes', 'CARNAVAL PLUMES', 'RIO, BRAZIL'], ['cap', 'AZURE CAP', 'REDMOND, USA'], ['tricorn', 'TRICORN', 'VIRGINIA, USA'], ['hijab', 'HIJAB', 'WORLDWIDE']];
  const HERO_GEAR = [['none', 'NONE', 'NO EXTRA'], ['clogs', 'WOODEN CLOGS', 'NETHERLANDS'], ['scarf', 'FOOTBALL SCARF', 'LONDON, UK'],
    ['serape', 'SERAPE', 'MEXICO'], ['lei', 'FLOWER GARLAND', 'RIO, BRAZIL'], ['bandana', 'BANDANA', 'TEXAS, USA'],
    ['tulip', 'TULIP PIN', 'AMSTERDAM', 0], ['watch', 'POCKET WATCH', 'LONDON', 1],
    ['neckerchief', 'SILK NECKERCHIEF', 'PARIS', 2], ['obi', 'OBI CORD', 'TOKYO', 3],
    ['shell', 'SHELL PENDANT', 'SYDNEY', 4], ['ribbon', 'LAGOON RIBBON', 'VENICE', 5],
    ['wristbands', 'SPORT WRISTBANDS', 'RIO', 6], ['silverbow', 'SILVER BOW', 'MEXICO CITY', 7],
    ['satchel', 'CAMPUS SATCHEL', 'REDMOND', 8], ['compass', 'TRAIL COMPASS', 'VIRGINIA', 9]];
  const hairUnlock = (key) => { const x = HERO_REGIONAL_HAIR.find((x) => x[0] === key); return x ? x[3] : -1; };
  const wardrobeOpen = (category, value, unlocked) => {
    if (category === 'suit') return suitOpen(value, unlocked);
    if (category === 'hair') return HERO_HAIR_STYLES.includes(value) && (hairUnlock(value) < 0 || (unlocked || 1) >= hairUnlock(value) + 2);
    const list = category === 'gear' ? HERO_GEAR : category === 'hat' ? HERO_HATS : [];
    const item = list.find((x) => x[0] === value);
    return !!item && (item[3] === undefined || (unlocked || 1) >= item[3] + 2);
  };
  const wardrobeFor = (i) => ({
    suit: HERO_SUIT.findIndex((x) => x.unlock === i),
    hair: (HERO_REGIONAL_HAIR.find((x) => x[3] === i) || [null])[0],
    gear: (HERO_GEAR.find((x) => x[3] === i) || [null])[0]
  });
  const lookOpen = (look, unlocked) => ['suit', 'hair', 'hat', 'gear'].every((k) => wardrobeOpen(k, look[k], unlocked));
  const HERO_DEF = { m: { body: 'm', skin: 1, hair: 'swoop', hairCol: 0, suit: 0, hat: 'none', gear: 'none' }, f: { body: 'f', skin: 1, hair: 'long', hairCol: 4, suit: 1, hat: 'none', gear: 'none' } };
  const H = {};
  let FEM = false, HAIR = 'swoop', HAT = 'none', GEAR = 'none';
  const known = (list, k) => list.some((x) => x[0] === k);
  function applyLook(L) {
    const S = L.suit === 'gold' ? GOLD_SUIT : HERO_SUIT[L.suit] || HERO_SUIT[0];
    Object.assign(H, S);
    H.outfit = S.outfit || null;
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
  // l = [hipX, kneeX, kneeY, footX, footY]
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
    const gl = g.createRadialGradient(cx, cy, 0.5, cx, cy, 6.5 * s);
    gl.addColorStop(0, 'rgba(159,240,255,0.95)'); gl.addColorStop(0.5, 'rgba(79,200,255,0.5)'); gl.addColorStop(1, 'rgba(79,200,255,0)');
    g.fillStyle = gl; g.fillRect(cx - 8, cy - 6.6, 16, 14);
    g.save(); g.translate(cx, cy); g.scale(s, s);
    poly(g, [[0, -4], [3.4, 4.4], [1.6, 4.4], [0.9, 2.4], [-0.9, 2.4], [-1.6, 4.4], [-3.4, 4.4]], '#ffffff');
    poly(g, [[0, -1.4], [0.7, 0.8], [-0.7, 0.8]], H.suit);
    line(g, -2.6, 3.2, 2.6, 3.2, 0.5, '#bff4ff');
    g.restore();
  }
  // modest athletic bust: soft volume and an underbust shadow, no cleavage; shared by suits and outfits
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
      if (HDX) heroHDTorso(g, true);
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
    if (HDX) heroHDTorso(g, false);
  }
  function heroOutfit(g, pose) {
    if (!H.outfit) return;
    g.save();
    if (pose === 'fly') { g.translate(16, 22); g.rotate(Math.PI / 2); g.scale(0.65, 0.65); g.translate(-16, -22); }
    const hem = H.outfit === 'kimono' ? 36 : H.outfit === 'kurta' ? 35 : H.outfit === 'hacker' ? 31.4 : H.outfit === 'cowboy' ? 31 : H.outfit === 'coat' || H.outfit === 'trail' ? 34 : 29;
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
    } else {
      line(g, 16, 15, 16, 28, 1, '#ffffff');
      [10, 22].forEach((x) => line(g, x, 16, x + (x < 16 ? 2 : -2), 28, H.outfit === 'tracksuit' ? 2 : 1, H.cuff));
      [12, 18].forEach((x) => rrect(g, x, 23, 2.5, 2.5, 0.3, H.capeD));
      stripe(28, H.cuff, 1.5);
      if (H.outfit === 'tracksuit') stripe(19, H.cape, 3);
    }
    if (HDX) { line(g, 10, hem - 1, 22, hem - 1, 0.25, H.cuff); }
    g.restore();
  }
  // fine piping, stitching and studs only visible on the high-density portraits
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
  // long styles hang behind the head and shoulders
  // Head-space y of each hat's lower band: hair above it is hidden so the hat covers the top of the hair.
  // Headbands (hachimaki, plumes) leave hair visible above them.
  const HAT_LINE = { cowboy: 4.8, sombrero: 4.6, bowler: 5.8, beret: 4.6, crown: 3.2, cork: 4.6, boater: 4.6, cap: 5.8, tricorn: 5.2, hijab: 99, hackerhood: 99 };
  // Head coverings that hang behind the head draw with the back hair.
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
    } else if (['waves', 'curls', 'coils'].includes(HAIR)) {
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
      } else if (['waves', 'curls', 'coils'].includes(HAIR)) {
        for (let i = 0; i < 6; i++) {
          const x = 11 + i * 1.9, y = 2.7 + Math.sin(i * 1.7);
          ell(g, x, y, HAIR === 'coils' ? 1.1 : 1.7, HAIR === 'waves' ? 1.2 : 1.8, H.hair);
          line(g, x - 0.5, y - 0.5, x + 0.4, y - 0.5, 0.5, H.hairL);
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
  // headwear in head space (face looks right, glasses at y 6.6, canvas top is y 0)
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
    } else if (HAT === 'cap') {
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
  // wearable extras in body space; pose 'fly' uses the horizontal flight rig
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
    if (HDX) {
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

  // The laptop and its firing port face left, like the shared shooter behavior.
  function hackerFrame(step) {
    return function (g) {
      const stride = step ? 2 : -1;
      limb(g, 13, 25, 11 + stride, 32, 5, '#190d20', '#3d2035', '#704052');
      limb(g, 21, 25, 22 - stride, 32, 5, '#190d20', '#3d2035', '#704052');
      rrect(g, 7 + stride, 32, 8, 4.5, 1.4, '#160d1b');
      rrect(g, 19 - stride, 32, 8, 4.5, 1.4, '#160d1b');
      line(g, 8 + stride, 34.8, 14 + stride, 34.8, 0.6, '#d36870');
      line(g, 20 - stride, 34.8, 26 - stride, 34.8, 0.6, '#d36870');
      limb(g, 11, 16, 7, 22, 4.5, '#240f1c', '#633047', '#b95a68');
      limb(g, 24, 16, 26, 23, 4.5, '#240f1c', '#633047', '#b95a68');
      rrect(g, 9, 12, 16, 16, 3.2, lg(g, 9, 12, 25, 28, [[0, '#c76b78'], [0.35, '#713449'], [1, '#28101e']]));
      line(g, 17, 15, 17, 26, 0.7, '#ec8a85');
      line(g, 11, 24, 15, 24, 0.7, '#321321');
      line(g, 19, 24, 23, 24, 0.7, '#321321');
      hackerHood(g);
      ell(g, 8.3, 21.3, 2.2, 2.1, '#dfa59c');
      hackerTerminal(g);
    };
  }
  reg2('hacker_0', 32, 37, hackerFrame(0), { shade: 0.5 });
  reg2('hacker_1', 32, 37, hackerFrame(1), { shade: 0.5 });

  /* climb walls: a steel grip rail tile on the wall face and a WALL JUMP marker at its foot */
  reg2('climb_face', 10, 16, function (g) {
    rrect(g, 0, 0, 10, 16, 0, lg(g, 0, 0, 10, 0, [[0, '#2a2e48'], [0.5, '#5a6288'], [1, '#1c1f34']]));
    line(g, 2, 0, 2, 16, 0.8, '#8a92b8');
    rrect(g, 0.6, 5, 9.4, 3.4, 1.2, lg(g, 0, 5, 0, 8.4, [[0, '#ffe680'], [1, '#d89a10']]));
    line(g, 1.4, 5.6, 9, 5.6, 0.5, '#fff6c0');
    ell(g, 2.4, 13, 0.7, 0.7, '#9aa2c8'); ell(g, 7.6, 13, 0.7, 0.7, '#9aa2c8');
  });
  reg2('climb_sign', 18, 26, function (g) {
    line(g, 9, 14, 9, 26, 1.6, '#5a6080');
    rrect(g, 1, 1, 16, 14, 2.4, '#ffd23f');
    rrect(g, 2.4, 2.4, 13.2, 11.2, 1.6, '#1a1c2c');
    poly(g, [[9, 3.6], [13.6, 8.4], [10.6, 8.4], [10.6, 12.4], [7.4, 12.4], [7.4, 8.4], [4.4, 8.4]], '#ffd23f');
    line(g, 13, 5, 15, 3, 0.8, '#ffd23f');
  }, { shade: 0.3 });

  // Pipeline bug: a six-legged beetle (faces right) with a cracked build-red shell and feelers.
  function bugFrame(f) {
    return function (g) {
      const a = f ? 1.6 : -1.6;
      // legs: three per side, alternating tripod gait
      [[11, 15, -1], [16, 16, 0], [20, 15, 1]].forEach((L, i) => {
        const s = (i % 2 ? a : -a);
        line(g, L[0], L[1], L[0] - 3 + L[2] * 2 + s, 19, 1.6, '#2a0d14');
        line(g, L[0] - 3 + L[2] * 2 + s, 19, L[0] - 5 + L[2] * 4 + s, 23.4, 1.3, '#2a0d14');
        line(g, L[0] + 1, L[1], L[0] + 3 + L[2] * 2 - s, 19.4, 1.4, '#4a1a24');
        line(g, L[0] + 3 + L[2] * 2 - s, 19.4, L[0] + 5 + L[2] * 3 - s, 23.4, 1.1, '#4a1a24');
      });
      // abdomen + wing cases
      ell(g, 12, 13.4, 10, 6.8, lg(g, 2, 6, 22, 20, [[0, '#ff8a5a'], [0.45, '#d8283a'], [1, '#5a0a1c']]));
      line(g, 12.6, 7, 13.4, 19.6, 0.8, '#3a0610');
      ell(g, 8.4, 10.4, 3.6, 1.6, 'rgba(255,230,200,0.55)', -0.3);
      // black spots like a ladybird gone wrong + a red-X crack
      [[7, 14], [10.6, 17], [16.4, 11.2], [17, 16.4], [8.2, 10.6]].forEach((p) => ell(g, p[0], p[1], 1.4, 1.2, '#1a0408'));
      line(g, 14.6, 12.4, 16.6, 14.4, 0.7, '#ffd0a0'); line(g, 16.6, 12.4, 14.6, 14.4, 0.7, '#ffd0a0');
      // thorax and head
      ell(g, 22.6, 12.6, 3.6, 4.4, lg(g, 19, 8, 26, 17, [[0, '#5a3048'], [1, '#1a0814']]));
      ell(g, 27, 12.8, 3.6, 3.4, lg(g, 24, 9, 30, 16, [[0, '#4a2840'], [1, '#140610']]));
      eyeGlow(g, 28.4, 11.4, 0.9, E.red);
      ell(g, 28.4, 11.4, 1.2, 1.2, E.red); ell(g, 28.2, 11, 0.4, 0.4, '#ffffff');
      // mandibles and twitching feelers
      line(g, 30, 14.2, 31.6, 15.4, 0.9, '#1a0408');
      line(g, 27.6, 9.8, 29.6 + f, 4.6, 0.7, '#2a0d14'); line(g, 29.6 + f, 4.6, 31.4, 2.6 + f, 0.7, '#2a0d14');
      line(g, 26.4, 9.8, 26 - f, 4, 0.7, '#2a0d14'); line(g, 26 - f, 4, 27.4 - f, 1.6, 0.7, '#2a0d14');
      ell(g, 31.4, 2.6 + f, 0.8, 0.8, '#ff9a5a'); ell(g, 27.4 - f, 1.6, 0.8, 0.8, '#ff9a5a');
    };
  }

  // Public endpoint: an open laptop (faces left) whose screen broadcasts a public globe, firing from an open port.
  function laptopFrame(f) {
    return function (g) {
      // screen lid leaning back, screen glow
      poly(g, [[6, 21.6], [10, 2], [30, 2.4], [28.4, 21.6]], lg(g, 6, 2, 30, 22, [[0, '#cfd6ea'], [1, '#6a7290']]));
      poly(g, [[8.4, 19.6], [11.6, 4], [28.2, 4.4], [26.8, 19.6]], lg(g, 8, 4, 28, 20, [[0, f ? '#4a0a20' : '#2a0814'], [1, '#100410']]));
      // red public globe on screen
      const cx = 18.6, cy = 11.6;
      ell(g, cx, cy, 5.4, 5.4, f ? '#ff3a5a' : '#e0203f');
      g.strokeStyle = '#ffd0d8'; g.lineWidth = 0.7;
      g.beginPath(); g.ellipse(cx, cy, 2.2, 5.4, 0, 0, Math.PI * 2); g.stroke();
      line(g, cx - 5.4, cy, cx + 5.4, cy, 0.7, '#ffd0d8');
      line(g, cx - 4.6, cy - 2.6, cx + 4.6, cy - 2.6, 0.5, '#ffd0d8'); line(g, cx - 4.6, cy + 2.6, cx + 4.6, cy + 2.6, 0.5, '#ffd0d8');
      // open lock / warning pip in the screen corner and a webcam eye
      poly(g, [[23.6, 18.6], [25.6, 15], [27.4, 18.6]], '#ffd23f'); line(g, 25.5, 16.2, 25.5, 17.4, 0.6, '#3a1a00');
      eyeGlow(g, 20, 3.2, 0.6, E.red); ell(g, 20, 3.2, 0.7, 0.7, E.red);
      // keyboard base
      poly(g, [[2, 22], [30, 22], [31.4, 26.4], [0.6, 26.4]], lg(g, 0, 22, 0, 27, [[0, '#e4e8f4'], [1, '#7a80a0']]));
      for (let k = 0; k < 6; k++) rrect(g, 4.4 + k * 4.2, 22.8, 3.2, 1.4, 0.4, '#5a6080');
      rrect(g, 13, 24.6, 7, 1.2, 0.4, '#8a90b0');
      line(g, 0.6, 26.8, 31.4, 26.8, 0.8, '#3a3e58');
      // exposed port on the left edge: cable stub that recoils when firing
      rrect(g, 0, 10.4 - f * 0.6, 8 - f * 2, 3.4, 1, '#2a2e48');
      rrect(g, 0.4, 11 - f * 0.6, 2, 2.2, 0.5, f ? '#ffd23f' : '#ff507a');
      txt(g, '443', 11.6, 20.2, 0.32, '#ffb0c0');
    };
  }

  function registerCloudEnemies() {
    ['bug', 'image', 'rbac', 'endpoint', 'guest'].forEach(function (kind, ki) {
      const height = kind === 'rbac' ? 37 : kind === 'guest' || kind === 'bug' ? 24 : 28;
      for (let f = 0; f < 2; f++) reg2(kind + '_' + f, 32, height, function (g, w, h) {
        const col = ['#ff7a50', '#f0b040', '#c090ff', '#ff507a', '#70e0c0'][ki];
        if (kind === 'bug') { bugFrame(f)(g, w, h); return; }
        if (kind === 'endpoint') { laptopFrame(f)(g, w, h); return; }
        if (kind === 'rbac') {
          robotFrame(f)(g);
          rrect(g, 6, 15, 20, 13, 2, '#4a2080');
          txt(g, 'RBAC', 7, 18, 0.7, '#ffffff');
          poly(g, [[7, 2], [10, 6], [16, 0], [22, 6], [25, 2], [24, 9], [8, 9]], '#ffd23f');
        } else {
          for (let i = 0; i < 3; i++) {
            const x = 6 + i * 9, d = (f + i) % 2 ? 2 : 0;
            line(g, x, h - 9, x - 4, h - 2 - d, 2, col);
            line(g, x, h - 9, x + 3, h - 2 + d, 2, col);
          }
          rrect(g, 3, 5, 26, h - 8, 3, '#182844');
          g.strokeStyle = col; g.lineWidth = 1.5; g.strokeRect(4, 6, 24, h - 10);
          if (kind === 'image') {
            for (let x = 7; x < 27; x += 6) line(g, x, 8, x, 21, 1, col);
            txt(g, '!', 14, 11, 1, '#ff507a');
          } else if (kind === 'guest') {
            ell(g, 12, 11, 3, 3, col);
            rrect(g, 7, 15, 10, 4, 1, col);
            txt(g, '?', 21, 10, 1, '#ff507a');
          }
        }
      }, { shade: 0.4 });
    });
  }

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

  // Phish: hopping fish with a fake e-mail fin and a lure hook
  function phishFrame(f) {
    return function (g) {
      const t = f ? 2.4 : -2.4;
      poly(g, [[4, 12], [-0.4 + 0.4, 6 + t], [1, 12], [-0.4 + 0.4, 18 + t]], lg(g, 0, 6, 4, 18, [[0, '#ff7ad9'], [1, '#7a1a8a']]));
      ell(g, 16, 13, 12.4, 8, lg(g, 4, 5, 28, 21, [[0, '#7df9ff'], [0.45, '#2a8ad8'], [1, '#1a2a70']]));
      ell(g, 16, 16.6, 9, 3.6, 'rgba(240,250,255,0.35)');
      for (let i = 0; i < 4; i++) line(g, 9 + i * 3.6, 9 + (i % 2), 9 + i * 3.6, 17 - (i % 2), 0.6, 'rgba(10,30,80,0.45)');
      // envelope dorsal fin
      rrect(g, 10, 1.4, 11, 7.4, 1, '#f4f0ff');
      poly(g, [[10.4, 1.8], [15.5, 5.6], [20.6, 1.8]], 'rgba(80,60,140,0.0)');
      line(g, 10.4, 1.8, 15.5, 5.6, 0.8, '#ff2a4a'); line(g, 20.6, 1.8, 15.5, 5.6, 0.8, '#ff2a4a');
      ell(g, 20.6, 1.6, 1.6, 1.6, '#ff2a4a');
      // lure hook from the head
      line(g, 25, 7, 28, 1.8, 0.7, '#e8e8f8'); line(g, 28, 1.8, 30.4, 3.4, 0.6, '#e8e8f8');
      eyeGlow(g, 30.4, 4.6, 1.4, '#ffd23f'); ell(g, 30.4, 4.6, 1.3, 1.3, '#ffd23f');
      // eye and grin
      ell(g, 23, 10.6, 2.8, 2.8, '#14062a'); eyeGlow(g, 23, 10.6, 1.4, E.red);
      ell(g, 23, 10.6, 1.5, 1.5, E.red); ell(g, 22.5, 10, 0.5, 0.5, '#fff');
      poly(g, [[22, 16], [28.4, 14.4], [26.6, 17.6]], '#14062a');
      for (let i = 0; i < 3; i++) poly(g, [[23 + i * 1.8, 15.6 - i * 0.3], [24 + i * 1.8, 17 - i * 0.3], [24.8 + i * 1.8, 15.2 - i * 0.3]], '#fff');
      poly(g, [[13, 20], [17, 23.4 - (f ? 1 : 0)], [19, 19.6]], '#7a1a8a');
    };
  }
  reg2('phish_0', 32, 24, phishFrame(0), { shade: 0.45 });
  reg2('phish_1', 32, 24, phishFrame(1), { shade: 0.45 });

  // Ransomware ram: armoured charger with a padlock flank and curled horns
  function ramFrame(f) {
    return function (g) {
      const a = f ? 2 : -2;
      [[7, a], [11, -a], [20, -a], [24, a]].forEach((l, i) => {
        limb(g, l[0], 18, l[0] + l[1] * 0.6, 26.4, 3.2, i % 2 ? '#3a1050' : '#5a1470', '#7a1a8a', null);
        rrect(g, l[0] + l[1] * 0.6 - 2, 26, 4, 2, 0.8, '#14062a');
      });
      rrect(g, 3, 9, 25, 12, 5, lg(g, 3, 9, 28, 21, [[0, '#ffb04a'], [0.4, '#e0503a'], [1, '#5a1430']]));
      for (let i = 0; i < 5; i++) ell(g, 6 + i * 4.6, 10.4, 2.6, 2.2, 'rgba(255,240,220,0.5)');
      // padlock badge
      rrect(g, 11, 12.6, 8, 6.4, 1.2, '#ffd23f');
      g.lineWidth = 1.1; g.strokeStyle = '#ffd23f'; g.beginPath(); g.arc(15, 12.6, 2.6, Math.PI, 0); g.stroke();
      ell(g, 15, 15.4, 1, 1, '#14062a'); rrect(g, 14.6, 15.6, 0.8, 2, 0.3, '#14062a');
      // head + horns
      rrect(g, 24, 6.6, 8, 9.6, 3, lg(g, 24, 6, 32, 16, [[0, '#d0c8e8'], [1, '#5c6080']]));
      g.lineWidth = 2.4; g.strokeStyle = '#f0d890'; g.beginPath(); g.arc(25.6, 7.4, 4, Math.PI * 0.9, Math.PI * 2.3); g.stroke();
      g.lineWidth = 0.8; g.strokeStyle = '#8a6a30'; g.beginPath(); g.arc(25.6, 7.4, 2.6, Math.PI, Math.PI * 2.1); g.stroke();
      eyeGlow(g, 29.6, 10, 1.2, E.red); ell(g, 29.6, 10, 1.3, 1.3, E.red);
      ell(g, 31, 14.4, 1, 0.8, '#14062a');
      line(g, 3.4, 12, 0.6, 9 + (f ? 1 : -1), 1.2, '#e0503a');
    };
  }
  reg2('ram_0', 32, 28, ramFrame(0), { shade: 0.5 });
  reg2('ram_1', 32, 28, ramFrame(1), { shade: 0.5 });

  // Botnet: a storm cloud of infected bots that drops DDoS bombs
  function botnetFrame(f) {
    return function (g) {
      const c = lg(g, 0, 2, 0, 18, [[0, '#8a7ab0'], [0.5, '#4a3a78'], [1, '#22164a']]);
      [[9, 11, 7, 6], [16, 8, 8, 7], [24, 11, 7, 6], [13, 14, 9, 4.6], [20, 14, 9, 4.6]].forEach((e) => ell(g, e[0], e[1], e[2], e[3], c));
      ell(g, 14, 5, 4, 1.6, 'rgba(255,255,255,0.25)');
      // bot faces blinking inside the cloud
      [[10, 11], [16, 9], [22, 11]].forEach((p, i) => {
        rrect(g, p[0] - 2.4, p[1] - 1.6, 4.8, 3.2, 1, '#14062a');
        const on = (i + f) % 2 === 0;
        ell(g, p[0] - 1, p[1], 0.7, 0.7, on ? E.red : '#7df9ff'); ell(g, p[0] + 1, p[1], 0.7, 0.7, on ? E.red : '#7df9ff');
      });
      // lightning + bomb bay
      poly(g, [[7, 17], [5, 21], [7, 21], [5.6, 24], [9.4, 19.4], [7.4, 19.4], [8.6, 17]], f ? '#ffd23f' : 'rgba(255,210,63,0.35)');
      rrect(g, 13, 17, 6, 3.4, 1, '#14062a'); ell(g, 16, 19.4, 1.6, 1, '#ff7ad9');
      poly(g, [[25, 17], [27, 21], [25.4, 21], [26.8, 24], [23, 19.4], [24.8, 19.4], [23.6, 17]], f ? 'rgba(255,210,63,0.35)' : '#ffd23f');
    };
  }
  reg2('botnet_0', 32, 24, botnetFrame(0), { shade: 0.4 });
  reg2('botnet_1', 32, 24, botnetFrame(1), { shade: 0.4 });

  /* World map for the level select: equirectangular, lon -135..165, lat 72..-50 */
  const MAP = { w: 640, h: 236, lon0: -135, lon1: 165, lat0: 72, lat1: -50 };
  MAP.proj = (lon, lat) => [(lon - MAP.lon0) / (MAP.lon1 - MAP.lon0) * MAP.w, (MAP.lat0 - lat) / (MAP.lat0 - MAP.lat1) * MAP.h];
  const LAND = [
    // North America
    [[-135, 58], [-130, 55], [-124, 48], [-124, 40], [-117, 32], [-110, 23], [-105, 20], [-97, 16], [-92, 15], [-88, 13], [-83, 9], [-78, 8], [-80, 10], [-84, 15], [-87, 21], [-90, 21], [-97, 22], [-97, 27], [-94, 29.5], [-89, 30], [-84, 30], [-82, 26], [-80, 25], [-80, 31], [-76, 35], [-74, 40], [-70, 42], [-66, 44], [-61, 46], [-56, 50], [-60, 55], [-62, 58], [-65, 60], [-70, 62], [-78, 62], [-78, 58], [-82, 55], [-88, 56], [-93, 59], [-95, 62], [-90, 66], [-82, 68], [-85, 70], [-95, 72], [-135, 72]],
    [[-73, 72], [-55, 60], [-43, 60], [-38, 65], [-22, 70], [-20, 72]],
    [[-22, 64], [-14, 64.5], [-13.5, 65.5], [-18, 66.5], [-24, 65.5]],
    // South America
    [[-80, 8], [-77, 8], [-72, 12], [-63, 11], [-60, 8], [-52, 5], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -14], [-41, -22], [-48, -26], [-49, -29], [-53, -34], [-58, -35], [-62, -39], [-65, -42], [-66, -47], [-69, -51], [-73, -50], [-74, -42], [-73, -35], [-71, -28], [-70, -18], [-76, -14], [-81, -6], [-80, -2], [-78, 2]],
    // Eurasia
    [[-9, 37], [-9, 43], [-2, 43.5], [-1.5, 46], [-4.5, 48], [-1, 49], [2, 51], [4, 52], [5, 53.4], [8, 54], [8.5, 57], [10.5, 57.5], [10.5, 55], [13, 54.5], [18, 54.8], [21, 55], [21, 57], [24, 59.5], [28, 60], [22, 60.5], [21.5, 63], [25, 65.5], [22, 65.8], [17, 62], [18.5, 60], [16, 56], [12.5, 56], [11, 58.5], [7, 58], [5, 61], [5, 62], [10, 64], [14, 68], [18, 70], [25, 71], [30, 70], [40, 68], [44, 68], [55, 68.5], [60, 70], [70, 72], [165, 72], [165, 66], [160, 60], [156, 51], [155, 57], [142, 59], [136, 54], [141, 52], [140, 48], [135, 43], [130, 42.5], [129, 35], [126, 35], [126, 37.7], [125, 39.5], [121, 39], [122, 37], [119, 35], [121, 32], [122, 30], [120, 26], [115, 22.5], [110, 21], [108, 21.5], [106, 19], [109, 15], [109, 11], [105, 9], [103, 10.5], [100, 13.5], [99, 10], [100, 7], [103, 4], [104, 1.5], [101, 3], [98, 8], [98, 15], [94, 17], [92, 22], [90, 22], [87, 21.5], [80, 15], [80, 10], [77, 8], [76, 11], [73, 17], [72.5, 21], [70, 22.5], [67, 24.8], [62, 25], [57, 25.8], [56, 27], [51, 28], [48, 30], [50, 26.5], [51, 24], [56, 24.5], [57, 23.5], [59.5, 22.5], [55, 17], [52, 15.5], [45, 13], [43, 13], [39, 21], [35, 28], [33, 30], [34, 31.5], [35, 33], [36, 36], [32, 36.5], [30, 36.2], [27, 37], [26, 39.5], [26, 41], [23, 40.5], [22, 37], [21, 39], [19.5, 41.5], [16, 43.5], [13.5, 45.5], [12.3, 45], [14, 42], [16, 41], [18.5, 40], [16, 38], [15.7, 40], [12, 42], [10, 44], [7, 43.5], [3, 43], [3, 41.5], [0, 39.5], [-0.5, 38], [-2, 36.7], [-5.5, 36]],
    [[-5.5, 50], [1.5, 51], [1.7, 52.7], [0, 53.5], [-1.5, 55], [-2, 57], [-1.8, 57.6], [-4, 58.6], [-5, 58.5], [-6, 57], [-5.5, 55.5], [-4.8, 54.8], [-3, 54], [-4.7, 53.3], [-4.5, 52.2], [-5.3, 51.7], [-3.5, 51.4], [-5.7, 50]],
    [[-6, 52], [-6, 54], [-7.5, 55.3], [-10, 54], [-10, 51.5]],
    // Africa
    [[-17, 21], [-16, 24], [-13, 27.5], [-9.5, 30], [-9, 32.5], [-6, 35.8], [0, 35.8], [10, 37], [11, 33.5], [15, 32], [20, 30.5], [20, 32], [24, 32], [29, 31], [32, 31], [34, 28], [36, 22], [38, 18], [39.5, 15.5], [43, 12.5], [44, 11], [51, 12], [51, 10], [48, 5], [42, -1], [40, -5], [39, -8], [40.5, -11], [40.5, -15], [35, -22], [35, -25], [32.5, -28], [30, -31], [27, -33.7], [22, -34], [18.5, -34], [18, -31], [16.5, -28.5], [15, -26], [14.5, -22], [12, -17], [13.5, -12], [12, -6], [9, -1], [9.5, 3.5], [7, 4.5], [5, 6], [1, 6], [-4, 5], [-7.5, 4.5], [-11, 7], [-13, 9], [-15, 11], [-17, 14.5]],
    [[44, -25], [47, -25], [50, -15], [49, -12], [43.5, -17]],
    // Japan, islands of Asia-Pacific
    [[130, 31], [131.5, 31.5], [132, 34], [135, 33.6], [137, 34.5], [140, 35], [141, 38], [142, 40], [141.5, 41.5], [140, 40.5], [139.5, 38], [137, 37], [135.5, 35.6], [133, 35.5], [130.8, 34]],
    [[140, 42], [141.5, 41.8], [145.5, 43.3], [142, 45.5], [141.5, 43.5]],
    [[95, 5.5], [98, 4], [104, -2], [106, -6], [103, -5], [100, -1], [95.5, 3]],
    [[105.5, -6], [114.5, -7.5], [114, -8.7], [106, -7.5]],
    [[109, 1.5], [111, -3], [116, -4], [118, 1], [117.5, 5], [116, 7], [113, 3.5]],
    [[131, -1.5], [138, -1.5], [147, -6], [150, -10.5], [143, -9], [141, -9], [137.5, -8], [134, -4]],
    [[120, 18], [122, 18], [124, 13], [126, 7], [122, 7], [121, 14]],
    [[80, 6], [82, 7.5], [80, 9.8], [79.8, 8]],
    // Australia
    [[114, -22], [114, -26], [115, -33.5], [117.5, -35], [123, -34], [129, -31.5], [135, -35], [138, -35], [140, -38], [146, -39], [150, -37.5], [153, -32], [153.5, -28], [153, -25], [150, -22], [146, -19], [145.5, -15], [143.5, -14], [142.5, -10.7], [141.5, -13], [141.5, -16.5], [139.5, -17.5], [136, -15], [136.7, -12], [132.5, -11.5], [130, -13], [129, -15], [126, -14], [122, -17.5], [120, -20], [116.5, -20.7]],
    [[145, -41], [148, -41], [147.5, -43.5], [146, -43.5]]
  ];
  reg2('world_map', MAP.w, MAP.h, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, MAP.h, [[0, '#0d1446'], [0.5, '#101a5a'], [1, '#0a0f38']]);
    g.fillRect(0, 0, MAP.w, MAP.h);
    // lat/lon grid
    for (let lon = -120; lon <= 165; lon += 15) { const x = MAP.proj(lon, 0)[0]; line(g, x, 0, x, MAP.h, 0.4, lon % 45 === 0 ? 'rgba(39,224,255,0.22)' : 'rgba(39,224,255,0.09)'); }
    for (let lat = 60; lat >= -45; lat -= 15) { const y = MAP.proj(0, lat)[1]; line(g, 0, y, MAP.w, y, 0.4, lat === 0 ? 'rgba(255,122,217,0.3)' : 'rgba(39,224,255,0.09)'); }
    const path = (pts) => { g.beginPath(); pts.forEach((p, i) => { const q = MAP.proj(p[0], p[1]); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.closePath(); };
    // glow, fill, rim
    g.save(); g.shadowColor = 'rgba(39,224,255,0.8)'; g.shadowBlur = 6;
    LAND.forEach((pts) => { path(pts); g.fillStyle = '#2a1f7a'; g.fill(); });
    g.restore();
    const fill = lg(g, 0, 0, 0, MAP.h, [[0, '#5a3fc0'], [0.45, '#3d2c9a'], [1, '#2a1f72']]);
    LAND.forEach((pts) => { path(pts); g.fillStyle = fill; g.fill(); });
    // halftone dots clipped to land
    g.save();
    g.beginPath();
    LAND.forEach((pts) => pts.forEach((p, i) => { const q = MAP.proj(p[0], p[1]); if (i) g.lineTo(q[0], q[1]); else { g.closePath(); g.moveTo(q[0], q[1]); } }));
    g.closePath(); g.clip();
    for (let y = 1; y < MAP.h; y += 3) for (let x = (y % 6 ? 1.5 : 0); x < MAP.w; x += 3) ell(g, x, y, 0.55, 0.55, 'rgba(160,140,255,0.35)');
    g.restore();
    LAND.forEach((pts) => { path(pts); g.lineWidth = 0.7; g.strokeStyle = '#7fe8ff'; g.stroke(); });
    // scanline sheen
    for (let y = 0; y < MAP.h; y += 2) { g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, y, MAP.w, 0.5); }
  });
  reg2('map_plane', 14, 8, function (g) {
    poly(g, [[0, 3], [11, 2.6], [14, 4], [11, 5.4], [0, 5]], '#f4f6ff');
    poly(g, [[5, 4], [8, 0], [9.4, 0], [8, 4]], '#c9d6ff'); poly(g, [[5, 4], [8, 8], [9.4, 8], [8, 4]], '#9aa8e0');
    poly(g, [[0, 4], [1, 1], [2.6, 1], [2.4, 4]], '#27e0ff');
  });

  reg2('ebomb', 10, 12, function (g) {
    ell(g, 5, 7, 4.2, 4.4, lg(g, 1, 3, 9, 11, [[0, '#ff9acb'], [0.5, '#c02cc9'], [1, '#3a0a4a']]));
    ell(g, 3.8, 5.6, 1.2, 1, 'rgba(255,255,255,0.6)');
    rrect(g, 3.6, 1.6, 2.8, 2, 0.6, '#5c6080');
    line(g, 5, 1.6, 6.4, 0.2, 0.7, '#ffd23f');
  });

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
      if (on) { [['#f25022', 5.6, 4.8], ['#7fba00', 8.4, 5.2], ['#00a4ef', 5.6, 7.6], ['#ffb900', 8.4, 8]].forEach(function (q) { g.fillStyle = q[0]; g.fillRect(q[1], q[2], 2.4, 2.4); }); }
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
  reg2('blast_spread', 24, 14, function (g) {
    poly(g, [[1, 7], [15, 2], [23, 7], [15, 12]], lg(g, 0, 0, 24, 0, [[0, 'rgba(255,154,58,0)'], [0.6, '#ff9a3a'], [1, '#fff3b0']]));
    ell(g, 18, 7, 4, 3, '#fff3b0');
    line(g, 11, 7, 22, 7, 1, '#ffffff');
  }, { shade: 0, noOutline: true });
  reg2('blast_pierce', 38, 10, function (g) {
    rrect(g, 1, 2, 35, 6, 3, '#8150df');
    line(g, 0, 5, 37, 5, 3, '#c9a0ff');
    line(g, 6, 5, 37, 5, 1, '#ffffff');
    poly(g, [[31, 0], [38, 5], [31, 10], [34, 5]], '#f0d8ff');
  }, { shade: 0, noOutline: true });
  reg2('charge_fx', 32, 32, function (g) {
    const glow = g.createRadialGradient(16, 16, 1, 16, 16, 16);
    glow.addColorStop(0, '#ffffff'); glow.addColorStop(0.3, '#7fe8ff'); glow.addColorStop(1, 'rgba(39,224,255,0)');
    ell(g, 16, 16, 15, 15, glow);
    g.strokeStyle = '#d9ffff'; g.lineWidth = 1;
    g.beginPath(); g.arc(16, 16, 11, -0.5, 2.2); g.stroke();
    g.beginPath(); g.arc(16, 16, 14, 2.7, 5.2); g.stroke();
  }, { shade: 0, noOutline: true });
  reg2('boss_target', 68, 90, function (g) {
    g.strokeStyle = '#4dff7a'; g.lineWidth = 2;
    for (const [x, y, dx, dy] of [[2, 2, 1, 1], [66, 2, -1, 1], [2, 88, 1, -1], [66, 88, -1, -1]]) {
      g.beginPath(); g.moveTo(x, y + dy * 15); g.lineTo(x, y); g.lineTo(x + dx * 12, y); g.stroke();
    }
    poly(g, [[27, 0], [41, 0], [34, 8]], '#4dff7a');
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
  /* time of day: regional skies are the sunset look; these generic skies cover the rest of the day */
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

  // pointed gothic opening (lit pane or dark recess)
  function gothWin(g, x, y, w, h, c) {
    poly(g, [[x, y + h], [x, y + w * 0.6], [x + w / 2, y], [x + w, y + w * 0.6], [x + w, y + h]], c);
    if (c[0] === '#') { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + w * 0.2, y + w * 0.6, Math.max(0.5, w * 0.2), h - w * 0.6); }
  }

  // Elizabeth Tower: buttressed shaft, gilded clock stage, arcaded belfry, slate spire with lantern
  function bigBen(g, cx, base, s, P) {
    const stone = lg(g, cx - 13 * s, 0, cx + 13 * s, 0, [[0, '#9a86c8'], [0.35, '#d8c4a8'], [0.7, '#a890b8'], [1, '#4a3a88']]);
    const dark = 'rgba(30,16,70,0.55)', gold = '#ffd23f';
    // shaft
    g.fillStyle = stone; g.fillRect(cx - 10 * s, base - 106 * s, 20 * s, 106 * s);
    g.fillStyle = 'rgba(20,10,60,0.25)'; g.fillRect(cx + 4 * s, base - 106 * s, 6 * s, 106 * s);
    [-10, -1, 8].forEach(function (o) { g.fillStyle = 'rgba(255,240,220,0.32)'; g.fillRect(cx + o * s, base - 106 * s, 2 * s, 106 * s); });
    for (let y = 12; y < 104; y += 15) {
      g.fillStyle = 'rgba(255,236,200,0.5)'; g.fillRect(cx - 10.5 * s, base - y * s, 21 * s, 0.9);
      [-7, -3, 2, 6].forEach(function (o, k) { gothWin(g, cx + o * s - 0.7 * s, base - (y + 11) * s, 1.6 * s, 8 * s, (y + k) % 3 ? dark : P.win[(y + k) % P.win.length]); });
    }
    // clock stage with gilded frame
    const fy = base - 120 * s;
    g.fillStyle = stone; g.fillRect(cx - 13 * s, base - 136 * s, 26 * s, 31 * s);
    g.fillStyle = 'rgba(20,10,60,0.25)'; g.fillRect(cx + 6 * s, base - 136 * s, 7 * s, 31 * s);
    g.fillStyle = '#b8902a'; g.fillRect(cx - 11.5 * s, fy - 11.5 * s, 23 * s, 23 * s);
    g.fillStyle = gold; g.fillRect(cx - 11 * s, fy - 11 * s, 22 * s, 0.9); g.fillRect(cx - 11 * s, fy + 10.5 * s, 22 * s, 0.9);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { ell(g, cx + c[0] * 9 * s, fy + c[1] * 9 * s, 1.4 * s, 1.4 * s, gold); });
    ell(g, cx, fy, 12.5 * s, 12.5 * s, 'rgba(255,214,110,0.22)');
    ell(g, cx, fy, 9.6 * s, 9.6 * s, gold); ell(g, cx, fy, 8.4 * s, 8.4 * s, '#fff6d0');
    ell(g, cx, fy, 5.6 * s, 5.6 * s, 'rgba(255,230,160,0.55)');
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6;
      line(g, cx + Math.sin(a) * 6.4 * s, fy - Math.cos(a) * 6.4 * s, cx + Math.sin(a) * 7.8 * s, fy - Math.cos(a) * 7.8 * s, k % 3 ? 0.6 : 1, '#3a2408');
    }
    line(g, cx, fy, cx, fy - 6 * s, 1, '#2a1404'); line(g, cx, fy, cx + 3.8 * s, fy + 1.4 * s, 1.2, '#2a1404');
    ell(g, cx, fy, 1, 1, '#2a1404');
    g.fillStyle = gold; g.fillRect(cx - 13.5 * s, base - 106 * s, 27 * s, 1.2); g.fillRect(cx - 13.5 * s, base - 137 * s, 27 * s, 1.4);
    // corner pinnacles on the clock stage
    [-12, 12].forEach(function (o) { g.fillStyle = stone; g.fillRect(cx + o * s - 1.2 * s, base - 142 * s, 2.4 * s, 6 * s); poly(g, [[cx + o * s - 1.4 * s, base - 142 * s], [cx + o * s, base - 147 * s], [cx + o * s + 1.4 * s, base - 142 * s]], gold); });
    // belfry arcade
    g.fillStyle = stone; g.fillRect(cx - 11 * s, base - 153 * s, 22 * s, 16 * s);
    for (let k = 0; k < 4; k++) { gothWin(g, cx - 9.4 * s + k * 5 * s, base - 151 * s, 3.4 * s, 12 * s, 'rgba(12,6,40,0.85)'); lit(g, cx - 8.6 * s + k * 5 * s, base - 145 * s, 1.8 * s, 5 * s, P.win[k % P.win.length]); }
    g.fillStyle = gold; g.fillRect(cx - 11.5 * s, base - 154 * s, 23 * s, 1);
    for (let k = 0; k <= 11; k++) g.fillRect(cx - 11 * s + k * 2 * s, base - 156 * s, 0.7, 2 * s);
    // slate spire with gilded ribs, dormers and lantern
    const slate = lg(g, cx - 12 * s, 0, cx + 12 * s, 0, [[0, '#2a2a6a'], [0.45, '#5a5aa8'], [1, '#1a1450']]);
    poly(g, [[cx - 12 * s, base - 156 * s], [cx - 5 * s, base - 178 * s], [cx + 5 * s, base - 178 * s], [cx + 12 * s, base - 156 * s]], slate);
    [-12, -4, 4, 12].forEach(function (o) { line(g, cx + o * s, base - 156 * s, cx + o * 0.42 * s, base - 178 * s, 0.7, gold); });
    [-6, 6].forEach(function (o) { poly(g, [[cx + o * s - 2 * s, base - 160 * s], [cx + o * s, base - 165 * s], [cx + o * s + 2 * s, base - 160 * s]], '#d8c4a8'); lit(g, cx + o * s - 0.6 * s, base - 163 * s, 1.2 * s, 2.4 * s, gold); });
    g.fillStyle = '#d8c4a8'; g.fillRect(cx - 4 * s, base - 186 * s, 8 * s, 8 * s);
    lit(g, cx - 2.6 * s, base - 185 * s, 1.6 * s, 5 * s, gold); lit(g, cx + 1 * s, base - 185 * s, 1.6 * s, 5 * s, gold);
    poly(g, [[cx - 4.5 * s, base - 186 * s], [cx, base - 199 * s], [cx + 4.5 * s, base - 186 * s]], slate);
    line(g, cx, base - 199 * s, cx, base - 206 * s, 1, gold);
    ell(g, cx, base - 203 * s, 1.3, 1.3, gold); lit(g, cx - 1.4, base - 208 * s, 2.8, 2.8, gold);
    rim(g, cx - 10 * s, base - 106 * s, 106 * s, 'rgba(255,255,255,0.35)');
  }

  // Palace of Westminster: perpendicular gothic bays, pinnacle forest, slate roof, Victoria Tower stub
  function parliament(g, x0, x1, base, P) {
    const stone = silFill(g, base - 50, base, '#c8b4b0', '#5a4a98');
    g.fillStyle = 'rgba(40,30,90,0.9)'; poly(g, [[x0, base - 32], [x0 + 6, base - 39], [x1 - 6, base - 39], [x1, base - 32]], '#3a3a80');
    g.fillStyle = stone; g.fillRect(x0, base - 32, x1 - x0, 32);
    g.fillStyle = 'rgba(255,236,200,0.5)'; g.fillRect(x0, base - 32, x1 - x0, 1); g.fillRect(x0, base - 17, x1 - x0, 0.8);
    for (let x = x0 + 3; x < x1 - 3; x += 6) {
      g.fillStyle = 'rgba(30,16,70,0.35)'; g.fillRect(x + 4.4, base - 32, 0.8, 32);
      lit(g, x + 1, base - 28, 2.4, 8, P.win[Math.floor((x * 7) % P.win.length)]);
      gothWin(g, x + 1, base - 14, 2.4, 9, (x | 0) % 3 ? 'rgba(20,10,60,0.6)' : P.win[1]);
    }
    for (let x = x0 + 5; x < x1 - 2; x += 12) {
      g.fillStyle = '#c8b4b0'; g.fillRect(x - 1, base - 44, 2, 12);
      poly(g, [[x - 1.6, base - 44], [x, base - 50], [x + 1.6, base - 44]], '#3a3a80');
      g.fillStyle = '#ffd23f'; g.fillRect(x - 0.3, base - 52, 0.6, 2);
    }
    const vx = x1 - 26;
    if (vx > x0 + 40) {
      g.fillStyle = stone; g.fillRect(vx, base - 70, 18, 70);
      g.fillStyle = 'rgba(20,10,60,0.25)'; g.fillRect(vx + 12, base - 70, 6, 70);
      for (let y = base - 64; y < base - 34; y += 10) { gothWin(g, vx + 4, y, 2.4, 7, P.win[0]); gothWin(g, vx + 10, y, 2.4, 7, 'rgba(20,10,60,0.6)'); }
      [vx, vx + 18].forEach(function (x) { g.fillStyle = '#c8b4b0'; g.fillRect(x - 1, base - 78, 2.4, 8); poly(g, [[x - 1.4, base - 78], [x + 0.2, base - 84], [x + 1.8, base - 78]], '#3a3a80'); });
      g.fillStyle = '#ffd23f'; g.fillRect(vx + 8.6, base - 86, 0.8, 16); g.fillRect(vx + 6, base - 85, 6, 2.6);
    }
  }

  // Tower Bridge: gothic towers with turrets, blue and white walkways and suspension chains, bascule deck on piers
  function towerBridge(g, x0, x1, base, P) {
    const tw = [x0 + 34, x1 - 34], deck = base - 30;
    const stone = lg(g, 0, base - 104, 0, base, [[0, '#d8c8c0'], [0.5, '#a894c0'], [1, '#5a4a98']]);
    const blue = '#2a7ad8', pale = '#dff0ff';
    // river piers
    tw.forEach(function (tx) {
      poly(g, [[tx - 16, deck + 4], [tx + 16, deck + 4], [tx + 18, base], [tx - 18, base]], '#3a2e78');
      g.fillStyle = 'rgba(160,200,255,0.4)'; g.fillRect(tx - 18, base - 3, 36, 1);
    });
    // side-span suspension chains (blue with white edge) and hangers
    [[x0, tw[0] - 13, 1], [x1, tw[1] + 13, -1]].forEach(function (c) {
      const sx = c[0], ex = c[1], top = base - 74;
      const cpx = sx + (ex - sx) * 0.55, cpy = deck + 6;
      g.lineCap = 'round';
      [[2.6, blue], [0.8, pale]].forEach(function (st, i) { g.strokeStyle = st[1]; g.lineWidth = st[0]; g.beginPath(); g.moveTo(sx, deck - 2 - i); g.quadraticCurveTo(cpx, cpy - i, ex, top - i); g.stroke(); });
      for (let i = 1; i < 8; i++) {
        const t = i / 8, hx = (1 - t) * (1 - t) * sx + 2 * t * (1 - t) * cpx + t * t * ex, hy = (1 - t) * (1 - t) * (deck - 2) + 2 * t * (1 - t) * cpy + t * t * top;
        line(g, hx, hy, hx, deck, 0.6, 'rgba(223,240,255,0.7)');
      }
      g.fillStyle = '#c8b4b0'; g.fillRect(sx + (c[2] > 0 ? 0 : -6), deck - 10, 6, 10);
    });
    // road deck and central bascules (blue girders, rivets, lamps)
    g.fillStyle = '#3a3a80'; g.fillRect(x0, deck, x1 - x0, 5);
    g.fillStyle = blue; g.fillRect(x0, deck + 1, x1 - x0, 2.4);
    for (let x = x0 + 2; x < x1; x += 4) { g.fillStyle = pale; g.fillRect(x, deck + 1.8, 0.8, 0.8); }
    const mid = (tw[0] + tw[1]) / 2;
    g.fillStyle = '#10082a'; g.fillRect(mid - 0.5, deck - 1, 1, 7);
    g.fillStyle = 'rgba(255,236,200,0.6)'; g.fillRect(x0, deck - 0.8, x1 - x0, 0.8);
    for (let x = tw[0] + 18; x < tw[1] - 14; x += 18) { g.fillStyle = '#1a1450'; g.fillRect(x, deck - 7, 0.8, 7); lit(g, x - 0.8, deck - 9, 2.4, 2, '#ffe9a0'); }
    // high-level walkways: twin latticed girders
    const wy0 = base - 80, wy1 = base - 70, wl = tw[0] + 13, wr = tw[1] - 13;
    g.fillStyle = 'rgba(42,122,216,0.22)'; g.fillRect(wl, wy0, wr - wl, wy1 - wy0 + 3);
    g.fillStyle = blue; g.fillRect(wl, wy0, wr - wl, 2.4); g.fillRect(wl, wy1, wr - wl, 2.6);
    g.fillStyle = pale; g.fillRect(wl, wy0, wr - wl, 0.7); g.fillRect(wl, wy1, wr - wl, 0.7);
    g.strokeStyle = 'rgba(160,210,255,0.85)'; g.lineWidth = 0.6;
    for (let x = wl; x < wr - 1; x += 5) { g.beginPath(); g.moveTo(x, wy0 + 2.4); g.lineTo(x + 2.5, wy1); g.lineTo(x + 5, wy0 + 2.4); g.stroke(); }
    for (let x = wl + 4; x < wr - 3; x += 9) lit(g, x, wy1 + 0.6, 2, 1.4, P.win[0]);
    // gothic towers
    tw.forEach(function (tx) {
      g.fillStyle = stone; g.fillRect(tx - 13, base - 86, 26, deck - (base - 86));
      g.fillStyle = 'rgba(20,10,60,0.28)'; g.fillRect(tx + 6, base - 86, 7, deck - (base - 86));
      g.fillStyle = 'rgba(255,240,220,0.55)'; [base - 86, base - 66, base - 48].forEach(function (y) { g.fillRect(tx - 13.5, y, 27, 1); });
      gothWin(g, tx - 7, deck - 15, 14, 15, '#14082e');
      g.fillStyle = 'rgba(255,214,110,0.3)'; g.fillRect(tx - 6, deck - 4, 12, 4);
      [-6, 3].forEach(function (o, i) { gothWin(g, tx + o, base - 63, 3, 11, P.win[i]); gothWin(g, tx + o, base - 82, 3, 12, P.win[(i + 1) % P.win.length]); });
      // corner turrets with spirelets and gilded finials
      [-12, 12].forEach(function (o) {
        g.fillStyle = '#e0d0c8'; g.fillRect(tx + o - 2, base - 96, 4, 12);
        g.fillStyle = 'rgba(20,10,60,0.3)'; g.fillRect(tx + o + 0.6, base - 96, 1.4, 12);
        poly(g, [[tx + o - 2.6, base - 96], [tx + o, base - 106], [tx + o + 2.6, base - 96]], '#3a3a80');
        g.fillStyle = '#ffd23f'; g.fillRect(tx + o - 0.3, base - 109, 0.6, 3);
      });
      // steep central slate roof with dormer and spire
      poly(g, [[tx - 10, base - 86], [tx - 3, base - 104], [tx + 3, base - 104], [tx + 10, base - 86]], '#34347c');
      line(g, tx - 6, base - 86, tx - 1.6, base - 104, 0.5, 'rgba(160,190,255,0.7)'); line(g, tx + 6, base - 86, tx + 1.6, base - 104, 0.5, 'rgba(160,190,255,0.7)');
      poly(g, [[tx - 3, base - 92], [tx, base - 97], [tx + 3, base - 92]], '#e0d0c8'); lit(g, tx - 0.8, base - 94, 1.6, 2, P.win[0]);
      g.fillStyle = '#3a3a80'; g.fillRect(tx - 0.8, base - 112, 1.6, 8);
      g.fillStyle = '#ffd23f'; g.fillRect(tx - 0.3, base - 115, 0.6, 3);
      rim(g, tx - 13, base - 86, deck - (base - 86), 'rgba(255,255,255,0.35)');
    });
  }

  // London Eye: trussed double rim, cable spokes, 32 glass capsules, A-frame and back-stay on the South Bank pier
  function londonEye(g, cx, base, s, P) {
    const cy = base - 58 * s, R = 43 * s, Ri = R - 3.4 * s, n = 32;
    // A-frame legs and back-stay cables
    const legs = [cx - 20 * s, cx + 20 * s];
    line(g, cx + 34 * s, base, cx, cy, 0.6, 'rgba(220,230,255,0.55)'); line(g, cx + 30 * s, base, cx, cy, 0.6, 'rgba(220,230,255,0.45)');
    legs.forEach(function (lx) { line(g, lx, base, cx, cy, 3 * s, '#c8d0ff'); line(g, lx + 0.8, base, cx + 0.4, cy, 0.8, '#ffffff'); });
    line(g, cx - 10 * s, base - 29 * s, cx + 10 * s, base - 29 * s, 1.2, '#c8d0ff');
    // cable spokes
    g.strokeStyle = 'rgba(200,210,255,0.55)'; g.lineWidth = 0.45;
    for (let k = 0; k < 64; k++) { const a = k * Math.PI * 2 / 64; g.beginPath(); g.moveTo(cx + Math.cos(a) * 3 * s, cy + Math.sin(a) * 3 * s); g.lineTo(cx + Math.cos(a) * Ri, cy + Math.sin(a) * Ri); g.stroke(); }
    // trussed rim
    g.strokeStyle = '#e8ecff'; g.lineWidth = 1.3; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, Ri, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(232,236,255,0.8)'; g.lineWidth = 0.5; g.beginPath();
    for (let k = 0; k <= 96; k++) { const a = k * Math.PI * 2 / 96, r = k % 2 ? R : Ri; const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; if (k) g.lineTo(px, py); else g.moveTo(px, py); }
    g.stroke();
    g.strokeStyle = 'rgba(39,224,255,0.45)'; g.lineWidth = 2.2; g.beginPath(); g.arc(cx, cy, R + 0.6, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
    // capsules mounted outside the rim, always level
    for (let k = 0; k < n; k++) {
      const a = k * Math.PI * 2 / n, px = cx + Math.cos(a) * (R + 3.2 * s), py = cy + Math.sin(a) * (R + 3.2 * s);
      line(g, cx + Math.cos(a) * R, cy + Math.sin(a) * R, px, py, 0.6, '#e8ecff');
      ell(g, px, py, 3 * s, 2.1 * s, '#e8ecff');
      ell(g, px, py, 2.4 * s, 1.5 * s, k % 8 === 3 ? '#ff9aff' : '#9ad8ff');
      g.fillStyle = 'rgba(255,240,180,0.85)'; g.fillRect(px - 1.6 * s, py - 0.3 * s, 3.2 * s, 0.6 * s);
    }
    // hub and spindle
    ell(g, cx, cy, 4.2 * s, 4.2 * s, '#c8d0ff'); ell(g, cx, cy, 2.6 * s, 2.6 * s, '#5a5aa8'); ell(g, cx, cy, 1.2 * s, 1.2 * s, P.accent);
    // boarding pier
    g.fillStyle = '#3a2e78'; g.fillRect(cx - 26 * s, base - 4 * s, 52 * s, 4 * s);
    g.fillStyle = '#e8ecff'; g.fillRect(cx - 26 * s, base - 4 * s, 52 * s, 0.8);
    for (let k = 0; k < 6; k++) lit(g, cx - 22 * s + k * 9 * s, base - 2.8 * s, 2 * s, 1.4 * s, P.win[k % P.win.length]);
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
  /* landmark-free far skylines used in levels (the landmark strip carries the famous buildings) */
  function farPlain(region) {
    const P = PAL[region];
    return function (g, w, h) {
      const base = h - 6;
      if (region === 'westeurope') { skyline(w, h, 161, '#2a1070', P.accent, 22, 50, 0.2, P.win)(g); canalHouses(g, 0, 640, base, rng(171), P, 40, 70, false); }
      else if (region === 'japaneast') { fuji(g, 190, base, 0.95, P); skyline(w, h, 167, '#2a1070', P.accent, 18, 54, 0.3, P.win)(g); }
      else if (region === 'brazilsouth') {
        [[0, 120, 70], [150, 340, 95], [330, 520, 60], [480, 660, 85]].forEach(function (m) { poly(g, [[m[0], base], [(m[0] + m[1]) / 2 - 10, base - m[2]], [(m[0] + m[1]) / 2 + 12, base - m[2] + 6], [m[1], base]], '#3a1a6a'); });
        g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, 'rgba(255,230,120,0)'], [1, 'rgba(255,230,120,0.4)']]); g.fillRect(0, h - 26, w, 26);
      } else { skyline(w, h, 163 + region.length, '#2a1a78', P.accent, 26, 80, 0.22, P.win)(g); skyline(w, h, 263 + region.length, '#341a80', P.accent, 10, 40, 0.3, P.win)(g); }
    };
  }
  ['westeurope', 'uksouth', 'japaneast', 'australiaeast', 'brazilsouth'].forEach(function (k) { reg2('bg_farp_' + k, 640, 220, farPlain(k), FLAT); });

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
    '*': '...../#.#.#/.###./#####/.###./#.#.#/.....', '_': '...../...../...../...../...../...../#####', ' ': '...../...../...../...../...../...../.....'
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
  // registers en_<region>_<type>_0/1 for every type listed in SKINS[region]
  function regSkins(r) {
    Object.keys(SKINS[r]).forEach(function (t) {
      skinKeys.push('en_' + r + '_' + t);
      for (let f = 0; f < 2; f++) reg2('en_' + r + '_' + t + '_' + f, SKIN_SIZE[t][0], SKIN_SIZE[t][1], SKINS[r][t](f), { shade: 0.5 });
    });
  }
  Object.keys(SKINS).forEach(regSkins);

  /* ---- street-fighter bosses: one 64x80 rig, faces left, feet on y 79.
     Frames per kind: _0/_1 guard bob, _walk, _attack jab, _kick, _jump dive kick, _upper, _stun. */
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
  // torso frame along the spine: at(t, w) -> point, t 0 = hip .. 1 = shoulder, w > 0 = back side
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

  /* ---- boss roster: fictional cyber-crime fighters, each a full outfit on the shared rig */
  const FBLACK = fPal('#44444f', '#22222b', '#0a0a10');
  fighterReg('kraker', { // Amsterdam: Muay Thai access broker
    skin: FSKIN.tan, top: 'bare', tattoo: true, accent: '#ff7a1a', legs: 'shorts', legC: fPal('#ffa040', '#e8650c', '#8a3404'),
    feet: 'bare', hands: 'wraps', hair: 'buzz', hairC: '#2a1e14', face: 'balaclava', glowEyes: true, scar: true,
    front: function (g, P, T) {
      const r = T.at(-0.06, -T.W.h + 1.6);
      g.strokeStyle = '#ffd23f'; g.lineWidth = 0.8; g.beginPath(); g.arc(r[0], r[1] + 2.6, 2, 0, Math.PI * 2); g.stroke();
      [-1.4, 0.4, 2].forEach((o, i) => { line(g, r[0] + o, r[1] + 4, r[0] + o * 1.6, r[1] + 8 - i * 0.6, 0.9, i === 1 ? '#ff7a1a' : '#d8dce8'); });
    }
  });
  fighterReg('kingpin', { // London: bare-knuckle phishing boss
    skin: FSKIN.pale, top: 'waistcoat', topC: fPal('#5e5e70', '#3a3a4a', '#1a1a24'), top2: fPal('#ffffff', '#dadae6', '#8a8aa0'), tie: '#8a1020',
    sleeve: 'rolled', sleeveC: fPal('#ffffff', '#dadae6', '#8a8aa0'), legs: 'pants', legC: fPal('#50505e', '#30303c', '#14141c'),
    feet: 'boots', footC: fPal('#7a5434', '#4a2e18', '#1e1008'), hands: 'brass', hair: 'slick', hairC: '#3a2a1c',
    hat: 'flatcap', hatC: fPal('#8e7e5c', '#5e5038', '#2a2416'), facial: 'mustache', accent: '#27d0ff',
    front: function (g, P, T, S) {
      if (S.stun) return;
      const p = T.at(0.5, 3.2);
      rrect(g, p[0] - 1, p[1] - 3.4, 5, 3.4, 0.5, 'rgba(39,208,255,0.9)'); line(g, p[0] - 1, p[1] - 3.4, p[0] + 1.5, p[1] - 1.6, 0.5, '#ffffff'); line(g, p[0] + 4, p[1] - 3.4, p[0] + 1.5, p[1] - 1.6, 0.5, '#ffffff');
      rrect(g, p[0] - 1.6, p[1] - 0.6, 6.2, 2.6, 0.4, '#24242e');
    }
  });
  fighterReg('savate', { // Paris: savate spoofer
    fem: true, skin: FSKIN.pale, top: 'stripe', topC: fPal('#ffffff', '#ececf4', '#9a9ab0'), top2: fPal('#3a4aa0', '#1e2a70', '#0c1236'),
    sleeve: 'long', sleeveC: fPal('#3a4aa0', '#1e2a70', '#0c1236'), legs: 'tights', legC: FBLACK, feet: 'shoes', footC: fPal('#5a2a3a', '#2a0e18', '#0a0206'),
    hands: 'fingerless', handC: FBLACK, hair: 'ponytail', hairC: '#2a1810', hat: 'beret', hatC: fPal('#ff5a6a', '#d01a2a', '#6a0a12'),
    face: 'domino', glowEyes: true, accent: '#ff3aa8', browC: '#2a1810',
    front: function (g, P) {
      const hx = P.head[0], hy = P.head[1];
      rrect(g, hx - 4.4, hy + 7, 9, 2.6, 1.2, '#d01a2a'); limb(g, hx + 3, hy + 8.4, hx + 8, hy + 14, 2, '#6a0a12', '#d01a2a', null);
    }
  });
  fighterReg('ronin', { // Tokyo: hovering rootkit ronin
    air: true, plate: ['#4a4a6a', '#0a0a1a', 'rgba(255,42,58,0.55)'], skin: FSKIN.olive, top: 'gi', topC: fPal('#4e4e8e', '#2a2a5e', '#121232'),
    top2: fPal('#ff5a5a', '#c81a2a', '#5a0a10'), sleeve: 'gi', sleeveC: fPal('#4e4e8e', '#2a2a5e', '#121232'), legs: 'gi', legC: fPal('#3e3e4e', '#22222e', '#0e0e16'),
    belt: '#c81a2a', feet: 'sandal', hands: 'wraps', hair: 'topknot', hairC: '#121014', face: 'oni', glowEyes: true, accent: '#ff2a3a',
    back: function (g, P, T) {
      const a = T.at(0.05, T.W.h + 2), b = T.at(1.42, T.W.s - 2);
      limb(g, a[0], a[1], b[0], b[1], 2.6, '#000000', '#1a1a24', '#4a4a5a');
      const h = fAt(a, b, 0.78); limb(g, h[0], h[1], b[0], b[1], 2.2, '#5a0a10', '#c81a2a', null);
    }
  });
  fighterReg('brawler', { // Sydney: botnet brawler
    skin: FSKIN.tan, top: 'tank', topC: fPal('#fff06a', '#e8c014', '#8a6a04'), legs: 'shorts', legC: fPal('#3ad07a', '#14904a', '#064a22'),
    feet: 'boots', footC: fPal('#9a7a54', '#5a3e24', '#2a1a0c'), hands: 'gloves', handC: fPal('#ff6a6a', '#d01a2a', '#5a0a10'),
    hair: 'buzz', hairC: '#b0642a', face: 'shades', facial: 'beard', accent: '#2ae07a'
  });
  fighterReg('gladiator', { // Rome: ransomware gladiator
    skin: FSKIN.olive, top: 'harness', legs: 'skirt', legC: fPal('#a8703a', '#7a4a1e', '#3a200a'), feet: 'greaves', footC: fPal('#f0f0f8', '#a8acc0', '#4a4e64'),
    hands: 'cestus', handC: fPal('#a8703a', '#7a4a1e', '#3a200a'), manica: true, hat: 'helmet', hair: 'none', facial: 'beard', hairC: '#2a1a10',
    belt: '#5a3214', buckle: true, accent: '#ff3a2a',
    front: function (g, P, T, S) {
      if (S.stun) return;
      const p = T.at(-0.1, -T.W.h + 2.4); line(g, p[0], p[1] - 4, p[0], p[1] - 2.6, 0.6, '#d8dce8');
      g.strokeStyle = '#ffd23f'; g.lineWidth = 0.9; g.beginPath(); g.arc(p[0], p[1] - 1.6, 1.6, Math.PI, 0); g.stroke();
      rrect(g, p[0] - 2.4, p[1] - 1.4, 4.8, 3.8, 0.6, '#ff3a2a'); ell(g, p[0], p[1] + 0.4, 0.6, 0.8, '#2a0408');
    }
  });
  fighterReg('capoeira', { // Rio: hovering cryptojacker
    air: true, plate: ['#fff06a', '#14904a', 'rgba(255,210,63,0.55)'], skin: FSKIN.deep, top: 'bare', legs: 'pants', legC: fPal('#ffffff', '#e2e2ec', '#8a8aa0'),
    belt: '#ffd23f', legStripe: '#14b04a', feet: 'bare', hands: 'bare', hair: 'dreads', hairC: '#1a1008', hat: 'bandana', hatC: fPal('#5aff9a', '#14b04a', '#06501e'),
    face: 'shades', accent: '#ffd23f', tattoo: true
  });
  fighterReg('luchador', { // Mexico City: zero-day luchador
    air: true, plate: ['#27e0ff', '#5a0a34', 'rgba(39,224,255,0.55)'], skin: FSKIN.brown, top: 'bare', legs: 'tights', legC: fPal('#ff5ab8', '#d01a7a', '#5a0a34'),
    legStripe: '#27e0ff', feet: 'boots', footC: fPal('#ff5ab8', '#d01a7a', '#5a0a34'), hands: 'fingerless', handC: FBLACK, hair: 'none',
    face: 'lucha', faceC: fPal('#ff6ac8', '#d01a7a', '#5a0a34'), belt: '#c89a20', buckle: true, accent: '#27e0ff'
  });
  fighterReg('enforcer', { // New York: DDoS enforcer
    skin: FSKIN.brown, top: 'jacket', topC: fPal('#4a4a56', '#26262e', '#0c0c12'), top2: fPal('#ff4a4a', '#c81a1a', '#5a0808'), sleeve: 'long',
    sleeveC: fPal('#4a4a56', '#26262e', '#0c0c12'), legs: 'pants', legC: fPal('#5a7ab8', '#34508a', '#162444'), feet: 'boots', footC: FBLACK,
    hands: 'fingerless', handC: FBLACK, hair: 'mohawk', hairC: '#2a1a10', face: 'shades', facial: 'stubble', accent: '#ff2a3a',
    front: function (g, P, T) {
      const a = T.at(-0.04, -T.W.h + 1), b = T.at(-0.04, T.W.h - 1);
      g.strokeStyle = '#d8dce8'; g.lineWidth = 0.8; g.setLineDash([1.2, 0.8]); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 6, b[0], b[1]); g.stroke(); g.setLineDash([]);
    }
  });

  /* ---- boss projectiles (22x12, travel left; the scene flips them) */
  function trail(g, y, col) { [0, 1, 2].forEach((i) => line(g, 14 + i * 2, y - 2 + i * 2, 21, y - 2 + i * 2, 0.8, col)); }
  reg2('bolt_kraker', 22, 12, function (g) {
    trail(g, 6, 'rgba(255,122,26,0.7)');
    rrect(g, 2, 2.2, 12, 7.6, 1.4, lg(g, 0, 2, 0, 10, [[0, '#ffb060'], [1, '#c84a04']]));
    rrect(g, 4, 4, 3.4, 2.8, 0.6, lg(g, 0, 4, 0, 7, GOLD)); line(g, 9, 4.6, 12.6, 4.6, 0.7, '#ffffff'); line(g, 9, 7, 11.6, 7, 0.7, 'rgba(255,255,255,0.6)');
  }, Object.assign({ glow: '#ff7a1a' }, BOLT));
  reg2('bolt_kingpin', 22, 12, function (g) {
    trail(g, 6, 'rgba(39,208,255,0.7)');
    rrect(g, 2, 2.4, 11.6, 7.4, 0.8, '#f4f8ff'); line(g, 2, 2.6, 7.8, 6.6, 0.8, '#7a8aa8'); line(g, 13.6, 2.6, 7.8, 6.6, 0.8, '#7a8aa8');
    g.strokeStyle = '#27d0ff'; g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(16, 1.6); g.lineTo(16, 7); g.arc(13.8, 7, 2.2, 0, Math.PI * 0.85); g.stroke();
  }, Object.assign({ glow: '#27d0ff' }, BOLT));
  reg2('bolt_savate', 22, 12, function (g) {
    trail(g, 6, 'rgba(255,58,168,0.6)');
    ell(g, 8, 6, 6.4, 5.6, lg(g, 2, 0, 14, 12, [[0, '#ffffff'], [0.4, '#ff6ac8'], [1, '#a0105a']]));
    g.globalCompositeOperation = 'destination-out'; ell(g, 11, 6, 5.4, 5, '#000'); g.globalCompositeOperation = 'source-over';
  }, Object.assign({ glow: '#ff3aa8' }, BOLT));
  reg2('bolt_ronin', 22, 12, function (g) {
    trail(g, 6, 'rgba(255,42,58,0.6)');
    fStar(g, 8, 6, 5.6, lg(g, 2, 0, 14, 12, [[0, '#ffffff'], [0.5, '#b4b8c8'], [1, '#4a4e64']]));
    ell(g, 8, 6, 1.6, 1.6, '#ff2a3a'); ell(g, 8, 6, 0.6, 0.6, '#1a0408');
  }, Object.assign({ glow: '#ff2a3a' }, BOLT));
  reg2('bolt_brawler', 22, 12, function (g) {
    trail(g, 7, 'rgba(42,224,122,0.6)');
    line(g, 3, 2.4, 8, 2.4, 0.8, '#d8dce8'); line(g, 9, 2.4, 14, 2.4, 0.8, '#d8dce8'); line(g, 5.4, 2.4, 6.4, 4.6, 0.8, '#5a5e70'); line(g, 11.6, 2.4, 10.6, 4.6, 0.8, '#5a5e70');
    rrect(g, 4, 4.4, 9.6, 4.6, 1.6, lg(g, 0, 4, 0, 9, [[0, '#5aff9a'], [1, '#0a6a30']])); ell(g, 6, 6.6, 1.2, 1.2, '#ff2a3a');
  }, Object.assign({ glow: '#2ae07a' }, BOLT));
  reg2('bolt_gladiator', 22, 12, function (g) {
    trail(g, 7, 'rgba(255,58,42,0.6)');
    g.strokeStyle = '#d8dce8'; g.lineWidth = 1.4; g.beginPath(); g.arc(8, 5, 3, Math.PI, 0); g.stroke();
    rrect(g, 3.6, 5, 8.8, 6, 1, lg(g, 0, 5, 0, 11, GOLD)); ell(g, 8, 7.4, 1, 1.2, '#4a1004'); g.fillStyle = '#4a1004'; g.fillRect(7.6, 7.6, 0.8, 2);
  }, Object.assign({ glow: '#ff3a2a' }, BOLT));
  reg2('bolt_capoeira', 22, 12, function (g) {
    trail(g, 6, 'rgba(255,210,63,0.6)');
    ell(g, 8, 6, 5.4, 5.4, lg(g, 3, 1, 13, 11, GOLD)); ell(g, 8, 6, 4, 4, 'rgba(255,255,255,0.18)');
    g.strokeStyle = '#7a4a04'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(7, 3); g.lineTo(7, 9); g.moveTo(7, 3); g.quadraticCurveTo(10.6, 3.2, 7, 6); g.quadraticCurveTo(11.4, 6.4, 7, 9); g.stroke();
  }, Object.assign({ glow: '#ffd23f' }, BOLT));
  reg2('bolt_luchador', 22, 12, function (g) {
    poly(g, [[10, 2], [21, 4], [17, 6], [21, 8], [10, 10]], 'rgba(39,224,255,0.55)');
    ell(g, 7.6, 6, 5.6, 4.8, lg(g, 2, 1, 13, 11, [[0, '#ffb0e8'], [0.5, '#ff5ab8'], [1, '#8a0a4a']]));
    [3.6, 5.6, 7.6].forEach((y) => line(g, 3.4, y + 0.4, 6.4, y + 0.4, 0.6, '#5a0a34'));
  }, Object.assign({ glow: '#27e0ff' }, BOLT));
  reg2('bolt_enforcer', 22, 12, function (g) {
    [[2, 3.4, 1], [8, 4, 0.85], [14, 4.6, 0.6]].forEach(function (b) {
      g.globalAlpha = b[2]; rrect(g, b[0], b[1], 5.4, 5.4 - (b[1] - 3.4) * 2, 0.8, lg(g, 0, 3, 0, 9, [[0, '#ff7a7a'], [1, '#a80a14']]));
      g.fillStyle = '#ffffff'; g.fillRect(b[0] + 1.2, b[1] + 1.2, 1.2, 0.8); g.fillRect(b[0] + 3, b[1] + 1.2, 1.2, 0.8);
    });
    g.globalAlpha = 1;
  }, Object.assign({ glow: '#ff2a3a' }, BOLT));

  /* ---- regional Azure Credit coins (currency symbol on the face) */
  const COINS = { westeurope: '\u20AC', uksouth: '\u00A3', japaneast: '\u00A5', australiaeast: 'A$', brazilsouth: 'R$', eastus: '$' };
  // registers coin_<region>0..3 with the currency glyph COINS[region]
  function regCoins(r) {
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
  }
  Object.keys(COINS).forEach(regCoins);

  /* ---- local props: scenery that never collides */
  const PROPS = {
    tulips: [24, 26, function (g) {
      poly(g, [[6, 17], [18, 17], [16, 25.6], [8, 25.6]], lg(g, 0, 17, 0, 26, [[0, '#e0804a'], [1, '#8a3a1a']]));
      [[7, 5, '#ff2a6a'], [12, 2, '#ffd23f'], [17, 5, '#ff7a2a']].forEach((t) => { line(g, t[0], 17, t[0], t[1] + 3, 1.2, '#2fa84a'); poly(g, [[t[0] - 3, t[1] - 1], [t[0] - 1.6, t[1] + 4], [t[0], t[1] + 1], [t[0] + 1.6, t[1] + 4], [t[0] + 3, t[1] - 1], [t[0], t[1] + 5.6]], t[2]); });
    }],
    bike: [48, 30, function (g) {
      g.save(); g.scale(1.5, 1.5);
      [[7, 14], [25, 14]].forEach((w) => { g.lineWidth = 1.4; g.strokeStyle = '#14062a'; g.beginPath(); g.arc(w[0], w[1], 5.4, 0, 7); g.stroke(); g.lineWidth = 0.5; g.strokeStyle = '#c4e6ff'; g.beginPath(); g.arc(w[0], w[1], 3, 0, 7); g.stroke(); });
      line(g, 7, 14, 14, 6, 1.4, '#ff7a2a'); line(g, 14, 6, 22, 6, 1.4, '#ff7a2a'); line(g, 14, 6, 17, 14, 1.4, '#ff7a2a'); line(g, 17, 14, 7, 14, 1.4, '#ff7a2a'); line(g, 22, 6, 25, 14, 1.4, '#ff7a2a'); line(g, 17, 14, 22, 6, 1.4, '#ff7a2a');
      line(g, 21, 6, 22.6, 2.6, 1.2, '#14062a'); line(g, 20, 2.6, 25, 2.6, 1.2, '#14062a'); rrect(g, 11.4, 3, 6, 1.8, 0.8, '#14062a');
      rrect(g, 20.6, 8, 6.6, 4.6, 1, '#8a5a2a');
      g.restore();
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

  /* ------------------------------------------------------------------ POWER-UP ICONS (20x20 orbs) */
  const PU = {
    copilot: ['#ffffff', '#7fe8ff', function (g) { rrect(g, 5, 7, 10, 7, 3, '#1a3fb0'); ell(g, 8, 10.4, 1.3, 1.6, '#9ff0ff'); ell(g, 12, 10.4, 1.3, 1.6, '#9ff0ff'); line(g, 10, 7, 10, 4.5, 1, '#1a3fb0'); ell(g, 10, 4, 1.2, 1.2, '#ff7ad9'); }],
    defender: ['#9ff0ff', '#1a8fe0', function (g) { poly(g, [[10, 3.5], [15.5, 5.5], [15, 11], [10, 16], [5, 11], [4.5, 5.5]], '#ffffff'); poly(g, [[10, 6], [13, 7.2], [12.6, 10.4], [10, 13], [7.4, 10.4], [7, 7.2]], '#1a8fe0'); }],
    actions: ['#7dffa0', '#1c8f44', function (g) { poly(g, [[6.5, 4.5], [15.5, 10], [6.5, 15.5]], '#ffffff'); line(g, 4.5, 10, 7, 10, 1.2, '#d6ffe0'); }],
    powerbi: ['#ffe14a', '#c27a00', function (g) { rrect(g, 4.5, 11, 3, 5, 0.6, '#fff3b0'); rrect(g, 8.5, 7, 3, 9, 0.6, '#ffffff'); rrect(g, 12.5, 4, 3, 12, 0.6, '#fff3b0'); }],
    teams: ['#c9a0ff', '#5a2fd0', function (g) { rrect(g, 4, 5, 12, 3.4, 1, '#ffffff'); rrect(g, 8.3, 5, 3.4, 11, 1, '#ffffff'); }],
    spread: ['#ffd878', '#a54818', function (g) {
      rrect(g, 4, 8, 7, 4, 1, '#ffffff');
      for (const y of [5, 10, 15]) { line(g, 10, 10, 16, y, 1, '#fff3b0'); ell(g, 16, y, 1.4, 1.4, '#ffffff'); }
    }],
    pierce: ['#e4bdff', '#6134ad', function (g) {
      rrect(g, 3, 8, 7, 5, 1, '#ffffff');
      line(g, 9, 10, 18, 10, 2, '#c9a0ff');
      poly(g, [[14, 5], [18, 10], [14, 15], [16, 10]], '#ffffff');
    }]
  };
  Object.keys(PU).forEach((k) => {
    const d = PU[k];
    reg2('pu_' + k, 20, 20, function (g) {
      ell(g, 10, 10, 9, 9, lg(g, 3, 2, 17, 18, [[0, d[0]], [1, d[1]]]));
      ell(g, 10, 10, 7.6, 7.6, 'rgba(10,10,60,0.35)');
      d[2](g);
      ell(g, 6.5, 5.5, 2.2, 1.3, 'rgba(255,255,255,0.7)');
    }, { shade: 0, glow: d[0] });
  });

  /* ------------------------------------------------------------------ STREET LEVEL: region ground, water, bridges, boats, obstacles, scenery, Microsoft branding */
  const MSC = ['#f25022', '#7fba00', '#00a4ef', '#ffb900'];
  function msLogo(g, x, y, s) {
    const q = s * 0.47, gp = s * 0.06;
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (p, i) { g.fillStyle = MSC[i]; g.fillRect(x + p[0] * (q + gp), y + p[1] * (q + gp), q, q); });
  }
  // pixel-font text on a hi-res canvas: scale 0.5 = one real pixel per font pixel
  function txt(g, str, x, y, scale, col, shadow) {
    const c = drawText(str, 1, col, shadow || null);
    g.imageSmoothingEnabled = false;
    g.drawImage(c, x, y, c.width * scale, c.height * scale);
  }
  function txtW(str, scale) { return str.length * 6 * scale; }

  /* ---- ground tiles that match each city (top 32x8, body 32x32) */
  reg2('quay_top', 32, 8, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ffe0b8'], [0.2, '#b48aa0'], [1, '#4a2e62']]); g.fillRect(0, 0, 32, 8);
    for (let r = 0; r < 2; r++) for (let x = r ? -2 : 0; x < 32; x += 4) {
      ell(g, x + 2, 2.8 + r * 2.7, 1.8, 1.15, r ? '#7a5a86' : '#a8829c');
      g.fillStyle = 'rgba(255,230,190,0.55)'; g.fillRect(x + 1.1, 2 + r * 2.7, 1.4, 0.5);
    }
    g.fillStyle = '#2a1636'; g.fillRect(0, 7.2, 32, 0.8);
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
    for (let x = 0; x < 32; x += 4) { g.fillStyle = 'rgba(60,24,10,0.6)'; g.fillRect(x, 0, 0.5, 6); g.fillStyle = 'rgba(255,230,180,0.3)'; g.fillRect(x + 0.6, 0.8, 0.5, 4); }
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
  }, FLAT);
  reg2('grass', 32, 32, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#2a7a2a'], [1, '#6a4a2a']]); g.fillRect(0, 0, 32, 32);
    const r = rng(12); for (let i = 0; i < 14; i++) ell(g, r() * 32, r() * 32, 1 + r(), 0.7, 'rgba(20,40,10,0.4)');
  }, FLAT);
  /* rails / street furniture strips drawn along the edge of a walkway (16 wide, tile horizontally) */
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

  /* ---- canal / river / harbour water (tiles horizontally, animated by the scene) */
  const WATER = {
    westeurope: ['#4a2a9a', '#120838', '#ffb07a', '#ff7ad9'],
    uksouth: ['#2a3a8a', '#080c30', '#ffd0a0', '#8ab4ff'],
    australiaeast: ['#1a6aaa', '#061840', '#ffe070', '#7fe8ff']
  };
  // c = [surface, deep, highlight 1, highlight 2]
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

  /* ---- bridges (160x100, walkable deck surface at y = 30) */
  function bridgeArt(kind) {
    return function (g) {
      const D0 = 30;
      if (kind === 'westeurope') {
        g.fillStyle = lg(g, 0, D0, 0, 100, [[0, '#9a4040'], [1, '#4a1838']]); g.fillRect(0, D0, 160, 70);
        for (let y = D0 + 8; y < 100; y += 3.2) { g.fillStyle = 'rgba(30,8,30,0.4)'; g.fillRect(0, y, 160, 0.5); }
        g.save(); g.globalCompositeOperation = 'destination-out'; ell(g, 80, 104, 62, 62, '#000'); g.restore();
        g.fillStyle = '#d8b8c8'; g.fillRect(0, D0, 160, 6); g.fillRect(0, D0 - 9, 160, 2.4);
        for (let x = 4; x < 160; x += 10) { g.fillStyle = '#2a1a3a'; g.fillRect(x, D0 - 7, 1.2, 7); }
        for (let a = 0.12; a < 0.9; a += 0.055) { const t = Math.PI * (1 + a); lit(g, 80 + Math.cos(t) * 64 - 0.8, 104 + Math.sin(t) * 64 - 0.8, 1.6, 1.6, '#ffe9a0'); }
        [12, 148].forEach(function (x) { g.fillStyle = '#1a0a2a'; g.fillRect(x - 0.8, D0 - 26, 1.6, 20); ell(g, x, D0 - 27, 3, 3, '#ffe9a0'); glowRect(g, '#ffd070', x - 4, D0 - 31, 8, 8); });
      } else if (kind === 'uksouth') {
        g.fillStyle = '#c8c4e0'; [0, 148].forEach(function (x) { g.fillRect(x, D0, 12, 70); });
        g.strokeStyle = '#2a8a5a'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(12, 96); g.quadraticCurveTo(80, 34, 148, 96); g.stroke();
        g.strokeStyle = '#1a5a3a'; g.lineWidth = 0.8;
        for (let x = 20; x < 144; x += 8) { const t = (x - 12) / 136, y = 96 - 4 * t * (1 - t) * 62 * 0.95; g.beginPath(); g.moveTo(x, y); g.lineTo(x, D0 + 10); g.stroke(); }
        g.fillStyle = lg(g, 0, D0, 0, D0 + 10, [[0, '#4ac88a'], [1, '#1a5a3a']]); g.fillRect(0, D0, 160, 10);
        g.fillStyle = '#ffd23f'; g.fillRect(0, D0 + 8, 160, 1);
        g.fillStyle = '#1a5a3a'; g.fillRect(0, D0 - 8, 160, 1.6); for (let x = 3; x < 160; x += 5) g.fillRect(x, D0 - 7, 0.8, 7);
        [20, 80, 140].forEach(function (x) { g.fillStyle = '#1a3a2a'; g.fillRect(x - 0.8, D0 - 26, 1.6, 20); [-3, 0, 3].forEach(function (o) { ell(g, x + o, D0 - 27 + Math.abs(o) * 0.6, 1.6, 1.8, '#fff0b0'); }); glowRect(g, '#ffd070', x - 5, D0 - 31, 10, 8); });
      } else {
        g.strokeStyle = '#7a84b8'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(4, D0 + 4); g.quadraticCurveTo(80, -28, 156, D0 + 4); g.stroke();
        g.lineWidth = 1.4; g.beginPath(); g.moveTo(10, D0 + 4); g.quadraticCurveTo(80, -14, 150, D0 + 4); g.stroke();
        g.strokeStyle = 'rgba(160,170,230,0.7)'; g.lineWidth = 0.7;
        for (let x = 16; x < 148; x += 8) { const t = (x - 4) / 152, y = D0 + 4 - 4 * t * (1 - t) * 46; g.beginPath(); g.moveTo(x, y); g.lineTo(x, D0); g.stroke(); }
        g.fillStyle = lg(g, 0, D0, 0, D0 + 8, [[0, '#a8b0e0'], [1, '#3a3a70']]); g.fillRect(0, D0, 160, 8);
        for (let x = 4; x < 160; x += 8) lit(g, x, D0 + 2, 1.4, 1.4, '#ffe9a0');
        g.fillStyle = '#4a4a80'; [8, 152].forEach(function (x) { g.fillRect(x - 4, D0 + 8, 8, 62); });
      }
    };
  }
  ['westeurope', 'uksouth', 'australiaeast'].forEach(function (k) { reg2('bridge_' + k, 160, 100, bridgeArt(k), { shade: 0.2, noOutline: true }); });

  /* ---- boats you can ride across wide water gaps (120x36, deck at y = 6) */
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
    westeurope: { hull: ['#2a3aa8', '#0a1048'], stripe: '#ffffff', cab: ['#c8f0ff', '#4a7ad8'], roof: '#e8f4ff', win: ['#ffe9a0', '#bff0ff'], logo: true, name: 'AZURE' },
    uksouth: { hull: ['#1a1a4a', '#06061c'], stripe: '#ff3a3a', cab: ['#e0e0f0', '#6a6a9a'], roof: '#ffffff', win: ['#ffe9a0', '#ffd0a0'], logo: true, name: 'CLIPPER' },
    australiaeast: { hull: ['#1a8a4a', '#0a3a20'], stripe: '#ffd23f', cab: ['#fff4c0', '#d8a83a'], roof: '#1a8a4a', win: ['#bff0ff', '#ffe9a0'], logo: true, name: 'FERRY' }
  };
  Object.keys(BOATS).forEach(function (k) { reg2('boat_' + k, 120, 36, boatArt(BOATS[k]), { shade: 0.35 }); });
  reg2('houseboat', 90, 30, function (g) {
    poly(g, [[0, 18], [90, 18], [86, 30], [4, 30]], lg(g, 0, 18, 0, 30, [[0, '#2a4a3a'], [1, '#0a1a14']]));
    rrect(g, 8, 4, 70, 15, 1.6, lg(g, 0, 4, 0, 19, [[0, '#4a8a6a'], [1, '#1a4a3a']]));
    poly(g, [[6, 5], [45, -1], [80, 5]], '#6a2a3a');
    for (let x = 14; x < 74; x += 11) lit(g, x, 9, 5, 5, x % 2 ? '#ffd070' : '#ff9a6a');
    ell(g, 82, 14, 4, 3, '#ff7ad9'); ell(g, 6, 15, 3, 2.4, '#ffd23f');
  }, { shade: 0.3 });

  function canalBoat(g) {
    poly(g, [[1, 25], [145, 25], [155, 30], [145, 43], [14, 43], [3, 35]], lg(g, 0, 25, 0, 43, [[0, '#f4f0e2'], [1, '#246b95']]));
    line(g, 10, 36, 148, 36, 2, '#c72f40');
    rrect(g, 17, 9, 118, 20, 7, '#c0d5d9');
    for (let x = 20; x < 130; x += 14) {
      poly(g, [[x, 27], [x + 1, 14], [x + 5, 10], [x + 12, 10], [x + 12, 27]], lg(g, 0, 10, 0, 27, [[0, '#b8ecf1'], [1, '#39728c']]));
      line(g, x + 2, 15, x + 11, 12, 0.8, '#e8ffff');
      ell(g, x + 7, 22, 2, 2, '#d6a17f'); g.fillStyle = '#283b68'; g.fillRect(x + 4, 24, 6, 3);
    }
    line(g, 15, 29, 136, 29, 1, '#ffffff');
    txt(g, 'AMSTERDAM CANAL CRUISE', 32, 32, 0.6, '#153d69');
    ell(g, 142, 31, 3, 3, '#e97736'); ell(g, 142, 31, 1.5, 1.5, '#fff0cc');
    [12, 147].forEach((x) => { line(g, x, 20, x, 27, 0.8, '#d9e7ea'); });
    g.fillStyle = 'rgba(230,250,255,0.65)'; g.fillRect(4, 44, 148, 0.8);
  }
  reg2('amb_canalboat', 156, 46, canalBoat, { shade: 0.25 });

  function outback4x4(g) {
    wheels(g, [19, 68], 35, 8);
    rrect(g, 9, 11, 64, 24, 2, lg(g, 0, 11, 0, 35, [[0, '#aab78b'], [0.6, '#668464'], [1, '#344f42']]));
    g.fillStyle = '#d6cbb0'; g.fillRect(9, 9, 64, 4); g.fillRect(12, 12, 3, 10);
    [17, 34, 51].forEach((x) => { rrect(g, x, 14, 13, 10, 1, '#162d39'); lit(g, x + 1, 15, 11, 7, '#b8dee2'); line(g, x + 2, 16, x + 9, 16, 0.7, '#efffff'); });
    g.fillStyle = '#5c7558'; g.fillRect(3, 25, 13, 10); g.fillStyle = '#d7d0ac'; g.fillRect(1, 31, 10, 3);
    g.fillStyle = '#273d37'; g.fillRect(2, 26, 4, 5); ell(g, 3, 26, 2, 2, '#fff1aa');
    [33, 50, 67].forEach((x) => line(g, x, 13, x, 33, 0.7, '#324a39'));
    g.fillStyle = '#d2d3bb'; g.fillRect(36, 25, 4, 1.2); g.fillRect(53, 25, 4, 1.2);
    line(g, 12, 5, 70, 5, 2, '#293e36'); line(g, 12, 8, 70, 8, 1, '#293e36');
    [17, 36, 58, 68].forEach((x) => line(g, x, 5, x, 11, 1, '#293e36'));
    rrect(g, 21, 0, 22, 5, 1, '#bda073'); rrect(g, 46, 1, 17, 4, 1, '#566b58');
    line(g, 26, 0, 26, 5, 1, '#394b3d'); line(g, 38, 0, 38, 5, 1, '#394b3d');
    line(g, 9, 23, 9, 10, 2.4, '#24382e'); line(g, 9, 10, 6, 8, 2.4, '#24382e');
    ell(g, 78, 26, 7, 9, '#1b2926'); ell(g, 78, 26, 3.2, 5, '#8e9b86');
    g.fillStyle = '#304138'; g.fillRect(73, 35, 14, 3);
    txt(g, 'OUTBACK', 37, 29, 0.5, '#e4dfc5');
    for (let x = 13; x < 74; x += 7) { g.fillStyle = 'rgba(223,160,91,0.65)'; g.fillRect(x, 32 + x % 3, 2.8, 1); }
  }

  /* ---- solid street obstacles: jump over or stand on them */
  const OBST = {
    bus: [96, 56, function (g) {
      rrect(g, 1, 2, 94, 46, 4, lg(g, 0, 2, 0, 48, [[0, '#ff5a5a'], [0.5, '#d81a2a'], [1, '#8a0a1a']]));
      for (let r = 0; r < 2; r++) for (let x = 6; x < 90; x += 12) { g.fillStyle = '#1a0a2a'; g.fillRect(x, 6 + r * 20, 10, 10); lit(g, x + 0.6, 6.6 + r * 20, 8.8, 8.8, r ? '#ffd090' : '#ffe9c0'); }
      g.fillStyle = '#ffe9c0'; g.fillRect(1, 18, 94, 1); g.fillRect(1, 38, 94, 1);
      rrect(g, 20, 40, 56, 7, 1, '#ffffff'); msLogo(g, 22, 41, 5); txt(g, 'MICROSOFT AZURE', 29, 41.6, 0.5, '#0a3a8a');
      [18, 78].forEach(function (x) { ell(g, x, 49, 6.6, 6.6, '#14082a'); ell(g, x, 49, 2.8, 2.8, '#b8b8d8'); });
      g.fillStyle = '#1a0a2a'; g.fillRect(84, 8, 10, 3); txt(g, '27', 85, 8.4, 0.5, '#ffe14a');
    }],
    cab: [48, 28, function (g) {
      poly(g, [[2, 14], [10, 4], [36, 4], [44, 13], [47, 15], [47, 24], [1, 24], [1, 15]], lg(g, 0, 4, 0, 24, [[0, '#5a5a7a'], [0.4, '#22223a'], [1, '#0a0a18']]));
      g.fillStyle = 'rgba(160,200,255,0.75)'; poly(g, [[11, 6], [22, 6], [22, 13], [5, 13]], g.fillStyle); poly(g, [[24, 6], [35, 6], [42, 13], [24, 13]], 'rgba(160,200,255,0.75)');
      rrect(g, 20, 1.6, 8, 3, 1, '#ffd23f'); txt(g, 'TAXI', 21, 2, 0.4, '#1a0a2a');
      [11, 37].forEach(function (x) { ell(g, x, 24, 4.4, 4.4, '#0a0614'); ell(g, x, 24, 2, 2, '#a8a8c8'); });
      ell(g, 45.4, 17, 1.6, 1.4, '#fff6c0');
    }],
    flowers: [56, 34, function (g) {
      for (let x = 0; x < 56; x += 7) poly(g, [[x, 2], [x + 7, 2], [x + 7, 8], [x + 3.5, 10], [x, 8]], (x / 7) % 2 ? '#ffffff' : '#2a8a4a');
      g.fillStyle = '#6a3a2a'; g.fillRect(3, 8, 1.6, 18); g.fillRect(51.4, 8, 1.6, 18);
      rrect(g, 1, 18, 54, 12, 1.4, lg(g, 0, 18, 0, 30, [[0, '#a86a3a'], [1, '#5a2a1a']]));
      const cols = ['#ff2a6a', '#ffd23f', '#ff7a2a', '#ff7ad9', '#ffffff'];
      for (let i = 0; i < 9; i++) { const x = 5 + i * 5.6; rrect(g, x - 2.2, 14, 4.4, 5, 0.6, '#3a6aa8'); for (let k = 0; k < 3; k++) ell(g, x - 1.4 + k * 1.4, 12 - (k % 2), 1.2, 1.4, cols[(i + k) % cols.length]); }
      [10, 46].forEach(function (x) { ell(g, x, 30.6, 3, 3, '#1a0a2a'); });
    }],
    bikes: [60, 24, function (g) {
      g.fillStyle = '#9a9ac0'; g.fillRect(2, 20, 56, 1.6);
      [[10, '#ff7a2a'], [30, '#27e0ff'], [50, '#ffd23f']].forEach(function (b) {
        const x = b[0];
        [[x - 7, 16], [x + 7, 16]].forEach(function (w) { g.lineWidth = 1.2; g.strokeStyle = '#14062a'; g.beginPath(); g.arc(w[0], w[1], 5, 0, 7); g.stroke(); });
        line(g, x - 7, 16, x - 1, 8, 1.2, b[1]); line(g, x - 1, 8, x + 5, 8, 1.2, b[1]); line(g, x - 1, 8, x + 1, 16, 1.2, b[1]); line(g, x + 1, 16, x - 7, 16, 1.2, b[1]); line(g, x + 5, 8, x + 7, 16, 1.2, b[1]);
        line(g, x + 5, 8, x + 6, 4, 1, '#14062a'); rrect(g, x - 3, 5.6, 4.4, 1.6, 0.6, '#14062a');
      });
    }],
    icecream: [64, 38, function (g) {
      rrect(g, 1, 6, 62, 26, 3, lg(g, 0, 6, 0, 32, [[0, '#ffffff'], [1, '#c8b8ff']]));
      rrect(g, 0, 2, 40, 5, 1.6, '#ff7ad9'); poly(g, [[44, 6], [56, 6], [63, 16], [44, 16]], 'rgba(150,220,255,0.85)');
      g.fillStyle = '#1a0a2a'; g.fillRect(8, 11, 28, 12); lit(g, 9, 12, 26, 10, '#ffe9a0');
      txt(g, 'GELATO', 10, 14.6, 0.5, '#ff2a9a');
      poly(g, [[14, -0.4], [20, -0.4], [17, 6]], '#e8a050'); ell(g, 17, -1, 3.4, 3, '#ff9ad8');
      g.fillStyle = '#27e0ff'; g.fillRect(1, 26, 62, 2);
      [14, 50].forEach(function (x) { ell(g, x, 32, 5, 5, '#14082a'); ell(g, x, 32, 2, 2, '#b8b8d8'); });
    }],
    outback4x4: [88, 44, outback4x4],
    lifeguard: [34, 52, function (g) {
      [[6, 52, 10, 22], [28, 52, 24, 22]].forEach(function (l) { line(g, l[0], l[1], l[2], l[3], 1.8, '#e8e0f8'); });
      line(g, 8, 40, 26, 40, 1.2, '#e8e0f8');
      rrect(g, 4, 10, 26, 14, 1.4, lg(g, 0, 10, 0, 24, [[0, '#ffe14a'], [1, '#e89400']]));
      poly(g, [[1, 11], [17, 1], [33, 11]], '#ff2a4a'); g.fillStyle = 'rgba(10,10,40,0.7)'; g.fillRect(8, 13, 18, 6);
      txt(g, 'SURF', 11, 19.4, 0.5, '#ff2a4a');
    }]
  };
  const obSize = {};
  // solid street obstacle ob_<name> (w x h); the generator reads the size from AH.Art.obSize
  function regOb(k, w, h, fn) {
    const scale = { cab: 1.5, taxi: 1.5, bikes: 1.4, vespa: 1.3, fiat: 1.3 }[k] || 1;
    obSize[k] = [Math.round(w * scale), Math.round(h * scale)];
    reg2('ob_' + k, obSize[k][0], obSize[k][1], function (g) {
      g.save(); g.scale(scale, scale); fn(g, w, h); g.restore();
    }, { shade: 0.45 });
  }
  Object.keys(OBST).forEach(function (k) { regOb(k, OBST[k][0], OBST[k][1], OBST[k][2]); });
  regOb('herring', 88, 62, function (g) {
    rrect(g, 3, 26, 82, 31, 2, '#e8e4d8');
    g.fillStyle = '#194a9a'; g.fillRect(4, 41, 80, 14);
    [6, 80].forEach(function (x) { g.fillStyle = '#d4d8e0'; g.fillRect(x, 8, 2, 35); });
    for (let x = 0; x < 88; x += 11) {
      g.fillStyle = x % 22 ? '#ffffff' : '#2168ba';
      g.fillRect(x, 8, 11, 9);
    }
    rrect(g, 8, 0, 72, 10, 1, '#194a9a');
    txt(g, 'HOLLANDSE HARING', 11, 2, 0.7, '#ffffff');
    txt(g, 'VERSE VIS', 19, 44, 1, '#ffffff');
    for (let x = 14; x < 76; x += 18) {
      ell(g, x, 30, 6, 2, '#75a9c5');
      poly(g, [[x + 5, 30], [x + 9, 27], [x + 9, 33]], '#a8d8e8');
    }
    ell(g, 46, 22, 5, 5, '#d6a078');
    g.fillStyle = '#ffffff'; g.fillRect(40, 15, 12, 3);
    [15, 73].forEach(function (x) { ell(g, x, 58, 4, 4, '#182844'); });
  });

  /* ---- ride-on Azure bike (40x26), two wheel frames */
  function bikeArt(f) {
    return function (g) {
      [[8, 19], [32, 19]].forEach(function (w) {
        g.lineWidth = 2; g.strokeStyle = '#0a0620'; g.beginPath(); g.arc(w[0], w[1], 6.4, 0, 7); g.stroke();
        g.lineWidth = 0.5; g.strokeStyle = '#c4e6ff';
        for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4 + f * Math.PI / 8; g.beginPath(); g.moveTo(w[0] - Math.cos(a) * 5.4, w[1] - Math.sin(a) * 5.4); g.lineTo(w[0] + Math.cos(a) * 5.4, w[1] + Math.sin(a) * 5.4); g.stroke(); }
        ell(g, w[0], w[1], 1.2, 1.2, '#ffffff');
      });
      const fr = '#1a8fff';
      line(g, 8, 19, 17, 10, 1.8, fr); line(g, 17, 10, 28, 10, 1.8, fr); line(g, 17, 10, 20, 19, 1.8, fr); line(g, 20, 19, 8, 19, 1.8, fr); line(g, 28, 10, 32, 19, 1.8, fr); line(g, 20, 19, 28, 10, 1.4, fr);
      line(g, 28, 10, 29, 4.6, 1.4, '#0a0620'); line(g, 26.4, 4.4, 31, 4.4, 1.4, '#0a0620');
      rrect(g, 13.6, 7.6, 7, 2.2, 1, '#0a0620');
      rrect(g, 30, 6, 9, 7, 1.2, lg(g, 30, 6, 30, 13, [[0, '#ffffff'], [1, '#a8b8e0']])); msLogo(g, 32.2, 7.4, 4.6);
      ell(g, 38.4, 10.6, 1.2, 1.2, '#fff6c0'); glowRect(g, '#fff6c0', 37.4, 9.6, 2.2, 2.2);
      g.fillStyle = '#ff7ad9'; g.fillRect(6, 9.4, 4, 1.2);
    };
  }
  reg2('bike_ride0', 40, 26, bikeArt(0), { shade: 0.35 });
  reg2('bike_ride1', 40, 26, bikeArt(1), { shade: 0.35 });

  /* ---- London K6 telephone box (secret level entrance) */
  reg2('booth', 30, 62, function (g) {
    rrect(g, 2, 8, 26, 54, 1.4, lg(g, 2, 0, 28, 0, [[0, '#ff6a5a'], [0.5, '#e81a2a'], [1, '#8a0a14']]));
    g.fillStyle = '#c8101e'; g.beginPath(); g.moveTo(1, 9); g.quadraticCurveTo(15, -1, 29, 9); g.fill();
    ell(g, 15, 3, 2.4, 2, '#ffd23f');
    g.fillStyle = '#14081e'; g.fillRect(4, 10, 22, 5); txt(g, 'TELEPHONE', 4.6, 11, 0.4, '#ffffff');
    g.fillStyle = '#7a0a14'; g.fillRect(4, 17, 22, 38);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) lit(g, 5.4 + c * 6.6, 18.4 + r * 6, 5.4, 4.8, '#ffe9b0');
    g.fillStyle = '#c8101e'; g.fillRect(14.4, 17, 1.2, 38);
    g.fillStyle = '#5a0a10'; g.fillRect(1, 56, 28, 6);
  }, { shade: 0.4 });

  /* ---- secret Bliss-style bonus room */
  reg2('bonus_bg', 640, 360, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 300, [[0, '#0a4ad8'], [0.6, '#4a9aff'], [1, '#bfe4ff']]); g.fillRect(0, 0, 640, 360);
    const r = rng(5);
    for (let i = 0; i < 11; i++) { const cx = r() * 640, cy = 30 + r() * 150, w = 30 + r() * 60; for (let k = 0; k < 5; k++) ell(g, cx + k * w / 5, cy - Math.sin(k) * 4, w / 4, 6 + r() * 4, 'rgba(255,255,255,0.75)'); }
    g.globalAlpha = 0.22; msLogo(g, 250, 40, 140); g.globalAlpha = 1;
    g.beginPath(); g.moveTo(0, 250); g.bezierCurveTo(160, 170, 420, 160, 640, 230); g.lineTo(640, 360); g.lineTo(0, 360); g.closePath();
    g.fillStyle = lg(g, 0, 170, 0, 360, [[0, '#8ae04a'], [0.4, '#3aa82a'], [1, '#1a5a1a']]); g.fill();
    g.fillStyle = 'rgba(255,255,200,0.3)'; for (let i = 0; i < 60; i++) g.fillRect(r() * 640, 220 + r() * 120, 3 + r() * 6, 0.6);
  }, FLAT);
  /* ---- retro desktop bonus room (teal desktop, icons, pixel windows, taskbar floor) */
  reg2('bonus_bg_retro', 640, 360, function (g) {
    g.fillStyle = '#0a8a8a'; g.fillRect(0, 0, 640, 360);
    g.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = 0; y < 360; y += 2) g.fillRect(0, y, 640, 1);
    const icon = function (x, y, kind, label) {
      if (kind === 0) { g.fillStyle = '#d8d8d8'; g.fillRect(x, y, 22, 16); g.fillStyle = '#1a3aa8'; g.fillRect(x + 2, y + 2, 18, 11); g.fillStyle = '#a8a8a8'; g.fillRect(x + 6, y + 16, 10, 4); }
      else if (kind === 1) { g.fillStyle = '#e8e8e8'; g.fillRect(x + 3, y + 2, 16, 18); g.fillStyle = '#a8a8a8'; for (let i = 0; i < 4; i++) g.fillRect(x + 6 + i * 3.4, y + 4, 1, 15); }
      else if (kind === 2) { g.fillStyle = '#ffd23f'; g.fillRect(x, y + 4, 22, 15); g.fillStyle = '#e8a820'; g.fillRect(x, y + 2, 9, 4); }
      else { msLogo(g, x + 2, y + 1, 18); }
      txt(g, label, x + 11 - txtW(label, 0.5) / 2, y + 24, 0.5, '#ffffff');
    };
    [[0, 'MY PC'], [1, 'RECYCLE'], [2, 'PROJECTS'], [3, 'AZURE'], [2, 'GAMES']].forEach(function (d, i) { icon(16, 16 + i * 44, d[0], d[1]); });
    const win = function (x, y, w, h, title) {
      g.fillStyle = '#c0c0c0'; g.fillRect(x, y, w, h);
      g.fillStyle = '#ffffff'; g.fillRect(x, y, w, 1); g.fillRect(x, y, 1, h);
      g.fillStyle = '#404040'; g.fillRect(x, y + h - 1, w, 1); g.fillRect(x + w - 1, y, 1, h);
      g.fillStyle = lg(g, x, 0, x + w, 0, [[0, '#0a1a8a'], [1, '#1a8ad8']]); g.fillRect(x + 2, y + 2, w - 4, 9);
      txt(g, title, x + 5, y + 4, 0.5, '#ffffff');
      g.fillStyle = '#c0c0c0'; [0, 1, 2].forEach(function (k) { g.fillRect(x + w - 11 - k * 9, y + 3, 7, 6); });
      g.fillStyle = '#ffffff'; g.fillRect(x + 3, y + 13, w - 6, h - 16);
    };
    win(110, 40, 230, 140, 'AZURE PORTAL.EXE');
    g.fillStyle = '#27a0ff'; g.fillRect(114, 56, 222, 14); txt(g, 'MICROSOFT AZURE', 120, 60, 0.6, '#ffffff');
    for (let i = 0; i < 6; i++) { g.fillStyle = ['#27a0ff', '#7dff7a', '#ffd23f', '#ff7ad9', '#c9a0ff', '#ff9a40'][i]; g.fillRect(122 + (i % 3) * 70, 82 + Math.floor(i / 3) * 44, 56, 34); }
    win(380, 70, 200, 110, 'MINESWEEPER');
    for (let r = 0; r < 6; r++) for (let c = 0; c < 12; c++) { g.fillStyle = (r * 7 + c * 3) % 11 === 0 ? '#ff2a4a' : '#bdbdbd'; g.fillRect(388 + c * 15.5, 88 + r * 14.5, 14, 13); }
    win(250, 150, 180, 70, 'CLIPPY.TXT');
    txt(g, 'IT LOOKS LIKE YOU', 260, 172, 0.6, '#14082a'); txt(g, 'FOUND A SECRET!', 260, 184, 0.6, '#14082a');
  }, FLAT);
  reg2('retro_top', 32, 8, function (g) {
    g.fillStyle = '#c0c0c0'; g.fillRect(0, 0, 32, 8); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 32, 1.2); g.fillStyle = '#808080'; g.fillRect(0, 7, 32, 1);
  }, FLAT);
  reg2('retro', 32, 32, function (g) {
    g.fillStyle = '#c0c0c0'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#a0a0a0'; g.fillRect(0, 0, 32, 2);
    g.fillStyle = '#d8d8d8'; g.fillRect(3, 6, 26, 10); g.fillStyle = '#808080'; g.fillRect(3, 15, 26, 1); g.fillRect(28, 6, 1, 10);
    msLogo(g, 5, 8, 6); txt(g, 'START', 13, 9, 0.5, '#14082a');
  }, FLAT);
  reg2('retro_plat', 80, 20, function (g) {
    g.fillStyle = '#c0c0c0'; g.fillRect(0, 2, 80, 18); g.fillStyle = '#ffffff'; g.fillRect(0, 2, 80, 1); g.fillStyle = '#404040'; g.fillRect(0, 19, 80, 1); g.fillRect(79, 2, 1, 18);
    g.fillStyle = lg(g, 0, 0, 80, 0, [[0, '#0a1a8a'], [1, '#1a8ad8']]); g.fillRect(2, 4, 76, 8);
    txt(g, 'OK', 6, 6, 0.5, '#ffffff'); g.fillStyle = '#c0c0c0'; g.fillRect(70, 5, 6, 6);
  }, { shade: 0.3 });

  /* ---- Xbox bonus arena (black and green, glowing sphere) */
  reg2('bonus_bg_xbox', 640, 360, function (g) {
    g.fillStyle = '#050a05'; g.fillRect(0, 0, 640, 360);
    const rg = g.createRadialGradient(320, 140, 10, 320, 140, 320); rg.addColorStop(0, 'rgba(60,220,60,0.55)'); rg.addColorStop(0.5, 'rgba(16,124,16,0.25)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 640, 360);
    g.strokeStyle = 'rgba(80,255,80,0.22)'; g.lineWidth = 0.8;
    for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(320 + i * 14, 230); g.lineTo(320 + i * 70, 360); g.stroke(); }
    for (let k = 0; k < 7; k++) { const y = 230 + k * k * 2.9; g.beginPath(); g.moveTo(0, y); g.lineTo(640, y); g.stroke(); }
    ell(g, 320, 130, 62, 62, lg(g, 0, 68, 0, 192, [[0, '#f4fff4'], [0.6, '#c8d8c8'], [1, '#7a8a7a']]));
    g.save(); g.beginPath(); g.arc(320, 130, 62, 0, Math.PI * 2); g.clip();
    g.strokeStyle = '#107c10'; g.lineWidth = 15; g.lineCap = 'round';
    g.beginPath(); g.moveTo(278, 84); g.quadraticCurveTo(320, 128, 362, 176); g.stroke();
    g.beginPath(); g.moveTo(362, 84); g.quadraticCurveTo(320, 128, 278, 176); g.stroke();
    g.restore();
    ell(g, 300, 104, 20, 10, 'rgba(255,255,255,0.35)');
    const r = rng(9);
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(125,255,122,' + (0.2 + r() * 0.5) + ')'; g.fillRect(r() * 640, r() * 220, 1.4, 1.4); }
  }, FLAT);
  reg2('xbox_top', 32, 8, function (g) {
    g.fillStyle = '#0c140c'; g.fillRect(0, 0, 32, 8); g.fillStyle = '#7dff7a'; g.fillRect(0, 0, 32, 1.4); g.fillStyle = 'rgba(125,255,122,0.35)'; g.fillRect(0, 1.4, 32, 2);
  }, FLAT);
  reg2('xbox', 32, 32, function (g) {
    g.fillStyle = '#0a100a'; g.fillRect(0, 0, 32, 32); g.strokeStyle = 'rgba(16,124,16,0.8)'; g.lineWidth = 0.8; g.strokeRect(0.5, 0.5, 31, 31);
    ell(g, 16, 16, 5, 5, '#107c10'); line(g, 13, 13, 19, 19, 1.2, '#0a100a'); line(g, 19, 13, 13, 19, 1.2, '#0a100a');
  }, FLAT);
  reg2('xbox_plat', 80, 20, function (g) {
    rrect(g, 0, 2, 80, 16, 3, '#0c140c'); g.fillStyle = '#7dff7a'; g.fillRect(2, 2, 76, 1.6);
    g.fillStyle = 'rgba(125,255,122,0.45)'; g.fillRect(2, 15, 76, 1);
    for (let i = 0; i < 4; i++) { ell(g, 14 + i * 17, 10, 3, 3, ['#7dff7a', '#ff4a4a', '#4ab4ff', '#ffd23f'][i]); }
  }, { shade: 0.3, glow: '#7dff7a' });
  /* ---- Azure warp pipe and themed underground cloud challenges */
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
  }, { shade: 0.3, glow: '#27e0ff' });
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

  /* ---- Paris Metro challenge (francecentral): tiled station, Guimard entrances, Ligne 14 trains */
  function metroTiles(g, x, y, w, h, light, dark) {
    g.fillStyle = dark; g.fillRect(x, y, w, h);
    for (let ty = y, row = 0; ty < y + h; ty += 5, row++) {
      for (let tx = x - (row % 2 ? 5 : 0); tx < x + w; tx += 10) {
        const lx = Math.max(x, tx), rw = Math.min(x + w, tx + 9.2) - lx;
        if (rw <= 0) continue;
        g.fillStyle = light; g.fillRect(lx, ty, rw, 4.2);
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(lx, ty, rw, 0.7);
        g.fillStyle = 'rgba(80,70,70,0.18)'; g.fillRect(lx, ty + 3.4, rw, 0.8);
      }
    }
  }
  function metroRoundel(g, x, y, r) {
    ell(g, x, y, r, r, '#f4efe2'); ell(g, x, y, r * 0.84, r * 0.84, '#1f3f8a');
    txt(g, 'M', x - txtW('M', r / 7) / 2, y - r * 0.5, r / 7, '#ffffff');
  }
  function metroPoster(g, x, y, w, h, k) {
    rrect(g, x - 3, y - 3, w + 6, h + 6, 1, '#b99a5c'); g.fillStyle = '#f1e2b6'; g.fillRect(x - 2, y - 2, w + 4, 1);
    const P2 = [
      ['AZURE FRONT DOOR', '#0f6cbd', '#5fd0ff'], ['GITHUB COPILOT', '#24292f', '#9be9a8'],
      ['VISIT PARIS', '#e86a7a', '#ffd38a'], ['MICROSOFT TEAMS', '#4b53bc', '#c5c9ff'], ['DDOS PROTECTION', '#1b4f72', '#ffb35c']
    ][k % 5];
    g.fillStyle = lg(g, 0, y, 0, y + h, [[0, P2[1]], [1, '#16182e']]); g.fillRect(x, y, w, h);
    if (k % 5 === 2) {
      const ex = x + w * 0.7;
      poly(g, [[ex - 9, y + h - 4], [ex - 1.4, y + 10], [ex + 1.4, y + 10], [ex + 9, y + h - 4]], P2[2]);
      poly(g, [[ex - 5, y + h - 4], [ex, y + h - 14], [ex + 5, y + h - 4]], P2[1]);
      ell(g, x + 16, y + 18, 8, 8, '#fff1c8');
    } else if (k % 5 === 1) {
      ell(g, x + w * 0.7, y + h * 0.48, 11, 9, '#e8e8f0'); ell(g, x + w * 0.66, y + h * 0.48, 2, 2.4, '#24292f'); ell(g, x + w * 0.74, y + h * 0.48, 2, 2.4, '#24292f');
      g.fillStyle = P2[2]; for (let i = 0; i < 4; i++) g.fillRect(x + 8, y + 14 + i * 6, 14 + (i * 7) % 12, 2);
    } else {
      for (let i = 0; i < 4; i++) { g.strokeStyle = P2[2]; g.globalAlpha = 0.85 - i * 0.18; g.lineWidth = 2; g.beginPath(); g.arc(x + w * 0.72, y + h * 0.55, 6 + i * 6, Math.PI, Math.PI * 1.9); g.stroke(); }
      g.globalAlpha = 1; msLogo(g, x + w * 0.72 - 5, y + h * 0.55 - 5, 10);
    }
    txt(g, P2[0], x + w / 2 - txtW(P2[0], 0.62) / 2, y + h - 9, 0.62, '#ffffff', '#101020');
  }
  reg2('cloud_floor_metro', 128, 64, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 12, [[0, '#e6dece'], [0.25, '#7a7268'], [1, '#4f4a4a']]); g.fillRect(0, 0, 128, 12);
    const r = rng(1414);
    for (let n = 0; n < 70; n++) { g.fillStyle = r() < 0.5 ? 'rgba(255,240,220,0.22)' : 'rgba(30,24,30,0.3)'; g.fillRect(r() * 128, 3 + r() * 8, 1, 0.8); }
    g.fillStyle = '#f3efe4'; g.fillRect(0, 0, 128, 1.6);
    g.fillStyle = '#262126'; g.fillRect(0, 12, 128, 2.4);
    metroTiles(g, 0, 14.4, 128, 50, '#d9d1c2', '#8e8578');
    g.fillStyle = lg(g, 0, 14, 0, 64, [[0, 'rgba(10,12,30,0.1)'], [1, 'rgba(10,12,30,0.72)']]); g.fillRect(0, 14, 128, 50);
    g.fillStyle = '#1f3f8a'; g.fillRect(0, 22, 128, 3); g.fillStyle = '#e8c56d'; g.fillRect(0, 21.4, 128, 0.6);
  }, FLAT);
  reg2('challenge_sign_metro', 248, 36, function (g) {
    rrect(g, 0, 0, 248, 36, 4, '#13306e');
    g.strokeStyle = '#f2efe6'; g.lineWidth = 1.4; g.strokeRect(3, 3, 242, 30);
    metroRoundel(g, 16, 18, 9);
    line(g, 6, 2, 242, 2, 0.6, 'rgba(255,255,255,0.4)');
  }, FLAT);
  reg2('challenge_far_metro', 640, 360, function (g) {
    // receding tunnel mouth glimpsed above the station vault
    g.fillStyle = lg(g, 0, 0, 0, 360, [[0, '#0d0f1e'], [0.5, '#1d2034'], [1, '#2a2638']]); g.fillRect(0, 0, 640, 360);
    for (let x = 0; x < 640; x += 80) {
      g.fillStyle = 'rgba(255,210,140,0.12)'; ell(g, x + 40, 40, 30, 10, 'rgba(255,210,140,0.12)');
      lit(g, x + 36, 38, 8, 2, '#ffd99a');
      line(g, x, 66, x + 80, 66, 1, 'rgba(160,150,170,0.25)');
    }
  }, FLAT);
  const STATIONS = ['CHATELET', 'ABBESSES', 'BASTILLE'];
  for (let variant = 0; variant < 3; variant++) {
    reg2('challenge_bg_metro' + (variant ? '_' + variant : ''), 640, 360, function (g) {
      // barrel vault of bevelled white tiles, lamp strip, framed posters and an enamel station plate
      metroTiles(g, 0, 40, 640, 196, '#f1ebdd', '#b8ae9f');
      g.fillStyle = lg(g, 0, 40, 0, 236, [[0, 'rgba(14,16,34,0.85)'], [0.22, 'rgba(14,16,34,0.35)'], [0.5, 'rgba(255,214,150,0.06)'], [1, 'rgba(30,24,40,0.35)']]); g.fillRect(0, 40, 640, 196);
      g.fillStyle = '#121426'; g.fillRect(0, 0, 640, 40);
      g.fillStyle = '#3a3448'; g.fillRect(0, 38, 640, 3);
      for (let x = 20 + variant * 13; x < 640; x += 70) {
        g.fillStyle = '#2b2a38'; g.fillRect(x, 64, 34, 4);
        glowRect(g, '#ffe3a8', x - 6, 66, 46, 8); lit(g, x + 2, 67, 30, 2, '#fff2c8');
      }
      // posters in bevelled-tile frames; plates sit low in the gaps, clear of the room's stage signs
      const order = [variant, variant + 2, variant + 4];
      [36, 248, 460].forEach(function (px, i) { metroPoster(g, px, 150, 140, 70, order[i]); });
      const st = STATIONS[variant];
      [[189, 0], [401, 1]].forEach(function (q) {
        const nx = q[0], plate = q[1] ? 'SORTIE' : st;
        rrect(g, nx, 168, 46, 14, 3, q[1] ? '#e9e3d4' : '#13306e');
        g.strokeStyle = q[1] ? '#1f3f8a' : '#f2efe6'; g.lineWidth = 0.8; g.strokeRect(nx + 2, 170, 42, 10);
        const sc = Math.min(0.8, 38 / txtW(plate, 1));
        txt(g, plate, nx + 23 - txtW(plate, sc) / 2, 172.5, sc, q[1] ? '#1f3f8a' : '#ffffff');
      });
      // benches, a ticket machine and line roundels along the platform wall
      [[96, '#c84a4a'], [520, '#3c8f6a']].forEach(function (b) {
        g.fillStyle = '#2a2836'; g.fillRect(b[0], 226, 2, 10); g.fillRect(b[0] + 30, 226, 2, 10);
        for (let k = 0; k < 4; k++) rrect(g, b[0] + k * 8, 220, 7, 7, 1.5, b[1]);
      });
      const tm = variant === 1 ? 414 : 202;
      rrect(g, tm, 196, 18, 40, 2, '#3b4d6e'); lit(g, tm + 3, 200, 12, 7, '#9fe7ff'); g.fillStyle = '#ffd36a'; g.fillRect(tm + 4, 212, 10, 2);
      [[608, '#62259d', '14'], [628, '#ffcd00', '1'], [588, '#be418d', '4']].forEach(function (c, i) {
        if (i > variant) return;
        ell(g, c[0], 140, 8, 8, c[1]); txt(g, c[2], c[0] - txtW(c[2], 0.9) / 2, 137, 0.9, i === 1 ? '#1d1d1d' : '#ffffff');
      });
      // track bed: platform edge across the rails, ballast and the third rail
      g.fillStyle = '#d9d2c2'; g.fillRect(0, 236, 640, 3);
      g.fillStyle = lg(g, 0, 239, 0, 300, [[0, '#191823'], [1, '#2a2632']]); g.fillRect(0, 239, 640, 61);
      const r = rng(2200 + variant);
      for (let n = 0; n < 260; n++) { g.fillStyle = 'rgba(150,140,140,' + (0.12 + r() * 0.2) + ')'; g.fillRect(r() * 640, 262 + r() * 36, 1.6, 1.2); }
      for (let x = 0; x < 640; x += 18) { g.fillStyle = '#3a3036'; g.fillRect(x, 276, 12, 4); }
      g.fillStyle = '#9da3ad'; g.fillRect(0, 273, 640, 2); g.fillRect(0, 281, 640, 2);
      g.fillStyle = '#c9b06a'; g.fillRect(0, 266, 640, 1.4);
    }, FLAT);
  }
  reg2('challenge_train_metro', 360, 74, function (g) {
    // Two-car automatic Ligne 14 train: rounded cab, lit windows, double doors, purple line livery.
    [0, 180].forEach(function (ox, car) {
      const x = ox + 2, w = 176;
      rrect(g, x, 6, w, 60, car ? 6 : 6, lg(g, 0, 6, 0, 66, [[0, '#f4f6f8'], [0.55, '#cfd6de'], [1, '#7c8696']]));
      if (!car) { poly(g, [[x, 12], [x - 2, 30], [x + 2, 60], [x + 10, 64], [x + 10, 8]], '#e9eef3'); }
      g.fillStyle = '#62259d'; g.fillRect(x + 2, 46, w - 4, 4); g.fillStyle = '#9f6fd6'; g.fillRect(x + 2, 46, w - 4, 0.8);
      g.fillStyle = '#1b1f2e'; g.fillRect(x + 4, 16, w - 8, 22);
      for (let k = 0; k < 4; k++) {
        const dx = x + 14 + k * 42;
        g.fillStyle = '#b7c0cc'; g.fillRect(dx, 12, 16, 50); g.fillStyle = '#7d8696'; g.fillRect(dx + 7.6, 12, 0.8, 50);
        lit(g, dx + 2, 18, 5, 18, '#ffeab0'); lit(g, dx + 9, 18, 5, 18, '#ffeab0');
        if (k < 3) for (let wv = 0; wv < 2; wv++) {
          const wx = dx + 20 + wv * 11; lit(g, wx, 18, 9, 18, '#ffe1a0');
          ell(g, wx + 4.5, 30, 2, 2.4, wv ? '#5a3c4c' : '#3c3c5c'); g.fillStyle = 'rgba(40,30,50,0.8)'; g.fillRect(wx + 2, 32, 5, 4);
        }
      }
      g.fillStyle = '#3a3f4e'; g.fillRect(x + 6, 64, w - 12, 5);
      [x + 24, x + w - 24].forEach(function (bx) { ell(g, bx - 8, 70, 4, 4, '#1a1a22'); ell(g, bx + 8, 70, 4, 4, '#1a1a22'); g.fillStyle = '#2a2a36'; g.fillRect(bx - 14, 64, 28, 4); });
    });
    g.fillStyle = '#4a4f5e'; g.fillRect(176, 20, 8, 40);
    // front cab: dark windscreen, headlights and the line roundel
    rrect(g, 360 - 22, 14, 18, 26, 4, '#1b1f2e'); lit(g, 360 - 19, 16, 10, 8, '#7fd3ff');
    ell(g, 360 - 10, 54, 2.4, 2, '#fff6c8'); glowRect(g, '#fff6c8', 360 - 14, 50, 8, 8);
    ell(g, 360 - 30, 42, 6, 6, '#62259d'); txt(g, '14', 360 - 30 - txtW('14', 0.7) / 2, 39.4, 0.7, '#ffffff');
    txt(g, 'AZURE LIGNE 14', 196, 52.4, 0.6, '#3a2a5a');
  }, FLAT);
  // Guimard entrance: green cast-iron balustrade (walkable coping) plus a lamp-lit METROPOLITAIN arch behind the hero.
  reg2('pipe_metro', 44, 46, function (g) {
    g.fillStyle = lg(g, 0, 0, 44, 0, [[0, '#1e3f33'], [0.35, '#4f8a68'], [1, '#183329']]); g.fillRect(2, 5, 40, 41);
    g.fillStyle = '#d8cdb5'; g.fillRect(0, 0, 44, 5); g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, 44, 1.2); g.fillStyle = '#8f846f'; g.fillRect(0, 4.2, 44, 1);
    g.fillStyle = '#132a22'; g.fillRect(5, 9, 34, 30);
    for (let x = 7; x < 38; x += 3) line(g, x, 10, x, 38, 0.8, '#5d9a74');
    g.strokeStyle = '#7fbf92'; g.lineWidth = 1;
    for (let x = 9; x < 38; x += 9) { g.beginPath(); g.ellipse(x + 2, 20, 3.4, 6, 0, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = '#e9dfc4'; rrect(g, 9, 30, 26, 8, 1.5, '#e9dfc4');
    txt(g, 'METRO', 22 - txtW('METRO', 0.6) / 2, 31.6, 0.6, '#1f4d3a');
    g.fillStyle = '#0d1d18'; g.fillRect(2, 43, 40, 3);
  }, { shade: 0.3 });
  reg2('pipe_metro_top', 64, 72, function (g) {
    const stem = function (sx, dir) {
      g.strokeStyle = '#1f4a38'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(sx, 72); g.bezierCurveTo(sx, 44, sx - dir * 6, 26, sx + dir * 2, 10); g.stroke();
      g.strokeStyle = '#6fae84'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx - 0.8, 72); g.bezierCurveTo(sx - 0.8, 44, sx - dir * 6 - 0.8, 26, sx + dir * 2 - 0.8, 10); g.stroke();
      ell(g, sx + dir * 2, 8, 4.4, 6, '#ff8a3c'); ell(g, sx + dir * 2, 7, 2.6, 3.6, '#ffd08a');
      glowRect(g, '#ff9a4a', sx + dir * 2 - 7, 1, 14, 14);
      line(g, sx + dir * 2 - 3, 14, sx + dir * 2 + 3, 14, 1.2, '#1f4a38');
    };
    stem(8, -1); stem(56, 1);
    g.strokeStyle = '#1f4a38'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(8, 34); g.quadraticCurveTo(32, 22, 56, 34); g.stroke();
    rrect(g, 9, 14, 46, 11, 2, '#e9dfc4');
    g.strokeStyle = '#2d6a4f'; g.lineWidth = 1; g.strokeRect(10.5, 15.5, 43, 8);
    txt(g, 'METROPOLITAIN', 32 - txtW('METROPOLITAIN', 0.48) / 2, 17.4, 0.48, '#1f4d3a');
  }, { shade: 0.2 });
  function metroBlock(g, w, h, variant) {
    // tiled station pillar: white bevelled tiles, green cast-iron cap and a line roundel
    metroTiles(g, 0, 0, w, h, '#e9e1d0', '#9d9384');
    g.fillStyle = lg(g, 0, 0, w, 0, [[0, 'rgba(20,20,40,0.35)'], [0.3, 'rgba(255,255,255,0)'], [1, 'rgba(20,20,40,0.45)']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#2d5d47'; g.fillRect(0, 0, w, 6); g.fillStyle = '#7fbf92'; g.fillRect(0, 0, w, 1.2);
    for (let x = 4; x < w - 2; x += 8) ell(g, x, 3.6, 1, 1, '#c9dcae');
    g.fillStyle = '#2d5d47'; g.fillRect(0, h - 4, w, 4);
    if (w >= 40 && h >= 40) metroRoundel(g, w / 2, h / 2 + 2, 8);
    else if (w >= 40) { g.fillStyle = ['#62259d', '#ffcd00', '#be418d', '#3c8f6a'][variant % 4]; g.fillRect(4, h / 2, w - 8, 3); }
  }
  function metroDeck(g, w, h, low) {
    // riveted green iron footbridge with lattice
    g.fillStyle = lg(g, 0, 0, 0, h, [[0, '#8fc6a0'], [0.15, '#3f7a5b'], [1, '#183329']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#d8cdb5'; g.fillRect(0, 0, w, 2.4); g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, 0.8);
    g.save(); g.beginPath(); g.rect(2, 4, w - 4, h - (low ? 11 : 6)); g.clip();
    for (let x = -h; x < w + h; x += 8) { line(g, x, 4, x + h, h, 0.8, '#7fbf92'); line(g, x + h, 4, x, h, 0.8, '#2a5642'); }
    g.restore();
    for (let x = 4; x < w - 2; x += 7) ell(g, x, 3.4, 0.9, 0.9, '#e7e0c4');
    if (low) {
      g.save(); g.beginPath(); g.rect(2, h - 7, w - 4, 6); g.clip();
      g.fillStyle = '#e8c56d'; g.fillRect(2, h - 7, w - 4, 6);
      for (let x = -6; x < w; x += 12) poly(g, [[x, h - 1], [x + 6, h - 7], [x + 12, h - 7], [x + 6, h - 1]], '#13306e');
      g.restore();
    }
  }

  /* ---- London Underground: deep-bore tunnels, tiled platforms and Tube stock */
  function tubeRoundel(g, x, y, r, label) {
    ell(g, x, y, r, r, '#d72f40'); ell(g, x, y, r * 0.63, r * 0.63, '#ede9df');
    g.fillStyle = '#183d78'; g.fillRect(x - r * 1.3, y - r * 0.23, r * 2.6, r * 0.46);
    if (label) { const s = Math.min(0.7, r * 2.35 / txtW(label, 1)); txt(g, label, x - txtW(label, s) / 2, y - 2.5 * s, s, '#ffffff'); }
  }
  function tubeBlock(g, w, h, low) {
    metroTiles(g, 0, 0, w, h, '#ddd9ca', '#817f79');
    g.fillStyle = '#183d78'; g.fillRect(0, 0, w, Math.min(5, h)); g.fillRect(0, h - 4, w, 4);
    line(g, 0, 0.8, w, 0.8, 1.2, '#fff0b3');
    if (h <= 24) {
      g.fillStyle = '#61717f'; g.fillRect(0, 5, w, Math.max(0, h - 9));
      for (let x = 5; x < w; x += 14) { line(g, x, 6, x + 6, h - 5, 0.7, '#a0acaf'); ell(g, x, 3, 0.7, 0.7, '#ffffff'); }
    } else if (w >= 40) tubeRoundel(g, w / 2, h / 2, Math.min(12, w / 4, h / 4), '');
    if (low) {
      g.fillStyle = '#efc34b'; g.fillRect(0, h - 5, w, 5);
      for (let x = 0; x < w; x += 10) poly(g, [[x, h], [x + 4, h - 5], [x + 8, h - 5], [x + 4, h]], '#26344f');
    }
  }
  reg2('cloud_floor_tube', 128, 64, function (g) {
    tubeBlock(g, 128, 64, false);
    g.fillStyle = '#777c80'; g.fillRect(0, 0, 128, 9);
    g.fillStyle = '#f1ca48'; g.fillRect(0, 1, 128, 2);
    for (let x = 3; x < 128; x += 5) { ell(g, x, 5, 0.5, 0.5, '#c0bba5'); line(g, x, 10, x, 14, 0.6, '#a7a69c'); }
    txt(g, 'MIND THE GAP', 36, 16, 0.65, '#183d78');
    g.fillStyle = 'rgba(10,18,37,0.4)'; g.fillRect(0, 34, 128, 30);
  }, FLAT);
  reg2('challenge_sign_tube', 248, 36, function (g) {
    rrect(g, 0, 0, 248, 36, 3, '#183d78');
    g.strokeStyle = '#ebe9dc'; g.lineWidth = 1; g.strokeRect(2, 2, 244, 32);
    tubeRoundel(g, 17, 18, 10, '');
  }, FLAT);
  reg2('challenge_far_tube', 640, 360, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 360, [[0, '#080e1c'], [0.55, '#26303c'], [1, '#131c2a']]); g.fillRect(0, 0, 640, 360);
    for (let x = -160; x < 800; x += 320) {
      for (let r = 150; r >= 30; r -= 18) { g.strokeStyle = r % 36 ? '#4a535e' : '#1a2532'; g.lineWidth = 4; g.beginPath(); g.ellipse(x + 160, 205, r, r * 0.86, 0, 0, Math.PI * 2); g.stroke(); }
      line(g, x + 10, 286, x + 310, 286, 2, '#9e9c92');
      line(g, x + 10, 293, x + 310, 293, 2, '#3c4653');
    }
  }, FLAT);
  for (let variant = 0; variant < 3; variant++) reg2('challenge_bg_tube' + (variant ? '_' + variant : ''), 640, 360, function (g) {
    const station = ['WESTMINSTER', 'BAKER STREET', 'PICCADILLY'][variant];
    metroTiles(g, 0, 140, 640, 125, '#b8b8b0', '#707781');
    for (let x = 0; x < 640; x += 128) {
      g.strokeStyle = '#626c79'; g.lineWidth = 9; g.beginPath(); g.arc(x + 64, 140, 60, Math.PI, 0); g.stroke();
      g.strokeStyle = '#c1c5be'; g.lineWidth = 2; g.beginPath(); g.arc(x + 64, 140, 55, Math.PI, 0); g.stroke();
      g.fillStyle = '#53616d'; g.fillRect(x, 137, 8, 128);
      lit(g, x + 26, 143, 71, 2.6, '#f0ecd3');
    }
    g.fillStyle = '#183d78'; g.fillRect(0, 160, 640, 3);
    g.fillStyle = '#ac3747'; g.fillRect(0, 164, 640, 1.4);
    tubeRoundel(g, 118, 201, 26, station);
    metroPoster(g, 208, 177, 69, 64, variant === 2 ? 3 : variant);
    rrect(g, 304, 178, 126, 54, 2, '#dfded2');
    txt(g, 'PLAN YOUR JOURNEY', 312, 183, 0.65, '#233955');
    ['#d73343', '#2981a6', '#d2ad31', '#288969'].forEach((color, i) => {
      line(g, 313, 201 + i * 6, 345 + i * 9, 201 + i * 6, 1.8, color);
      line(g, 345 + i * 9, 201 + i * 6, 365 + i * 9, 195 + i * 6, 1.8, color);
      line(g, 365 + i * 9, 195 + i * 6, 418, 195 + i * 6, 1.8, color);
      ell(g, 345 + i * 9, 201 + i * 6, 1.7, 1.7, '#f4f1e4');
    });
    rrect(g, 460, 162, 162, 24, 2, '#222a32');
    txt(g, 'WAY OUT', 473, 168, 1, '#f6d348');
    poly(g, [[591, 169], [601, 174], [591, 179], [591, 176], [581, 176], [581, 172], [591, 172]], '#f6d348');
    g.fillStyle = '#192431'; g.fillRect(461, 197, 160, 65);
    for (let step = 0; step < 7; step++) { line(g, 474 + step * 9, 258 - step * 7, 617, 258 - step * 7, 1.4, '#75818a'); }
    rrect(g, 19, 220, 32, 41, 2, '#35527a'); lit(g, 24, 225, 22, 15, '#92d8e6');
    txt(g, 'TICKETS', 22, 247, 0.6, '#faf1ce');
    [177, 298].forEach((x) => { g.fillStyle = '#6e463b'; g.fillRect(x, 246, 72, 4); line(g, x + 6, 250, x + 6, 263, 2, '#283d53'); line(g, x + 66, 250, x + 66, 263, 2, '#283d53'); });
    g.fillStyle = '#b7b4a1'; g.fillRect(0, 264, 640, 5); g.fillStyle = '#e0bf54'; g.fillRect(0, 269, 640, 1.5);
    g.fillStyle = '#171d2a'; g.fillRect(0, 272, 640, 28);
    for (let x = 0; x < 640; x += 13) line(g, x, 279, x + 4, 297, 2, '#414652');
    line(g, 0, 284, 640, 284, 1.8, '#a7a99e'); line(g, 0, 296, 640, 296, 1.5, '#777d83');
    txt(g, 'MIND THE GAP', 343, 259, 0.6, '#3b4150');
  }, FLAT);
  reg2('challenge_train_tube', 360, 76, function (g) {
    for (let car = 0; car < 2; car++) {
      const x = car * 181;
      rrect(g, x + 2, 9, 174, 54, 16, lg(g, 0, 9, 0, 63, [[0, '#e5e6de'], [0.6, '#f1f0df'], [1, '#b2b5b4']]));
      g.fillStyle = '#153b72'; g.fillRect(x + 7, 52, 164, 10);
      for (let d = 0; d < 3; d++) {
        const dx = x + 25 + d * 49;
        rrect(g, dx, 20, 21, 32, 2, '#bd293c'); lit(g, dx + 3, 23, 6, 17, '#a6ccd7'); lit(g, dx + 12, 23, 6, 17, '#a6ccd7');
        line(g, dx + 10.5, 22, dx + 10.5, 51, 0.7, '#721c2b');
        if (d < 2) { rrect(g, dx + 25, 23, 20, 18, 2, '#253646'); lit(g, dx + 27, 25, 16, 14, '#d6dfd8'); ell(g, dx + 35, 34, 2.4, 2.6, '#6d5957'); }
      }
      wheels(g, [x + 34, x + 141], 66, 5);
      tubeRoundel(g, x + 98, 47, 5, '');
      rrect(g, x + 3, 19, 18, 34, 7, '#c72f43'); rrect(g, x + 6, 23, 12, 18, 4, '#233b4d');
      ell(g, x + 8, 48, 1.8, 1.8, '#fff2b8'); ell(g, x + 17, 48, 1.8, 1.8, '#fff2b8');
      txt(g, 'BAKERLOO', x + 54, 13, 0.6, '#253c52');
    }
  }, FLAT);
  reg2('pipe_tube', 44, 46, function (g) {
    metroTiles(g, 2, 5, 40, 41, '#c8c6ba', '#777f83');
    g.fillStyle = '#183d78'; g.fillRect(0, 0, 44, 5); g.fillStyle = '#f3d16b'; g.fillRect(0, 0, 44, 1);
    g.fillStyle = '#25374a'; g.fillRect(8, 10, 28, 29);
    for (let y = 16; y < 40; y += 5) line(g, 9, y, 35, y, 1, '#aeb8b6');
    tubeRoundel(g, 22, 26, 10, '');
  }, { shade: 0.2 });
  reg2('pipe_tube_top', 70, 80, function (g) {
    [9, 61].forEach((x) => { g.fillStyle = '#243b48'; g.fillRect(x, 28, 2, 52); ell(g, x + 1, 27, 3, 3, '#e1c88c'); });
    tubeRoundel(g, 35, 28, 22, 'UNDERGROUND');
    rrect(g, 15, 55, 40, 9, 1, '#202d3f'); txt(g, 'SUBWAY', 22, 57, 0.65, '#ffffff');
    line(g, 10, 71, 61, 71, 1.3, '#748c8e');
  }, { shade: 0.2 });

  ['pipelines', 'aks', 'actions', 'docker', 'entra', 'functions'].forEach(function (theme, i) {
    const dock = theme === 'docker' || theme === 'aks';
    const facility = theme === 'entra' || theme === 'functions';
    const accent = ['#7dc1d0', '#8fceb8', '#bfb0df', '#e9b875', '#82cfc1', '#dec284'][i];
    reg2('cloud_floor_' + theme, 128, 64, function (g) {
      g.fillStyle = lg(g, 0, 0, 0, 64, [[0, '#566778'], [0.12, '#324456'], [1, '#182533']]); g.fillRect(0, 0, 128, 64);
      g.fillStyle = '#c2bb9d'; g.fillRect(0, 0, 128, 2);
      g.fillStyle = '#1c2a36'; g.fillRect(0, 9, 128, 4);
      for (let x = 0; x < 128; x += 32) {
        g.strokeStyle = '#10212d'; g.lineWidth = 1; g.strokeRect(x + 2, 18, 28, 38);
        line(g, x + 4, 20, x + 28, 20, 0.8, '#576773');
        for (const y of [5, 48]) ell(g, x + 8, y, 1.2, 1.2, '#a9b5b3');
        for (let k = 0; k < 4; k++) line(g, x + 6, 28 + k * 5, x + 24, 28 + k * 5, 1.2, '#0f202c');
      }
      const r = rng(700 + i);
      for (let n = 0; n < 60; n++) { g.fillStyle = 'rgba(195,173,128,0.15)'; g.fillRect(r() * 128, 14 + r() * 50, 1 + r() * 6, 0.7); }
      g.fillStyle = accent; g.fillRect(88, 5, 12, 1);
    }, FLAT);
    reg2('challenge_sign_' + theme, 248, 36, function (g) {
      rrect(g, 0, 0, 248, 36, 3, '#172834');
      g.strokeStyle = '#697e88'; g.lineWidth = 1; g.strokeRect(1, 1, 246, 34);
      g.fillStyle = accent; g.fillRect(8, 6, 3, 24);
      for (const x of [4, 243]) for (const y of [4, 31]) ell(g, x, y, 1, 1, '#aeb8af');
      line(g, 13, 3, 237, 3, 0.8, '#cad2c3');
    }, FLAT);
    reg2('challenge_far_' + theme, 640, 360, function (g) {
      if (facility) { cloudFacility(g, theme, 0, true); return; }
      g.fillStyle = lg(g, 0, 0, 0, 360, dock ?
        [[0, '#19273f'], [0.38, '#715770'], [0.62, '#d19a7b'], [1, '#243f51']] :
        [[0, '#17283e'], [0.52, '#425a6b'], [1, '#887d79']]);
      g.fillRect(0, 0, 640, 360);
      if (dock) {
        ell(g, 474, 144, 28, 28, '#efd1aa');
        for (let n = 0; n < 8; n++) {
          ell(g, n * 100, 89 + n % 3 * 17, 70, 4, 'rgba(206,187,190,0.2)');
        }
        for (let x = 0; x < 640; x += 64) {
          g.fillStyle = '#555469'; g.fillRect(x, 183 - x % 38, 54, 59 + x % 38);
          for (let wx = x + 5; wx < x + 50; wx += 10) lit(g, wx, 199, 2, 3, '#baa47e');
        }
        dockCrane(g, 40, 130, 244, 110, '#5c6076');
        dockCrane(g, 342, 110, 244, 134, '#636378');
        g.fillStyle = lg(g, 0, 235, 0, 360, [[0, '#384e5d'], [1, '#122d40']]); g.fillRect(0, 235, 640, 125);
        poly(g, [[110, 239], [313, 239], [285, 259], [136, 259]], '#283749');
        cargoBox(g, 144, 214, 60, 24, 1, ''); cargoBox(g, 205, 214, 60, 24, 3, '');
        g.fillStyle = '#3a4655'; g.fillRect(269, 209, 20, 30);
        const r = rng(530 + i);
        for (let n = 0; n < 180; n++) {
          g.fillStyle = n % 3 ? 'rgba(218,184,147,0.19)' : 'rgba(126,168,181,0.3)';
          g.fillRect(r() * 640, 242 + r() * 92, 3 + r() * 35, 0.7);
        }
      } else {
        for (let x = 8; x < 640; x += 104) {
          g.fillStyle = '#233b4c'; g.fillRect(x, 92, 92, 146);
          g.fillStyle = lg(g, x, 92, x, 238, [[0, '#759297'], [0.6, '#b6b59e'], [1, '#5d777e']]);
          g.fillRect(x + 4, 96, 84, 138);
          for (let y = 122; y < 238; y += 28) line(g, x + 4, y, x + 88, y, 2, '#425a65');
          line(g, x + 45, 96, x + 45, 234, 2, '#425a65');
          poly(g, [[x + 12, 237], [x + 60, 237], [x + 90, 300], [x - 20, 300]], 'rgba(231,208,158,0.08)');
        }
        for (let x = 12; x < 640; x += 160) {
          g.fillStyle = '#3b505d'; g.fillRect(x, 225, 125, 45);
          for (let y = 231; y < 266; y += 9) line(g, x + 8, y, x + 116, y, 1, '#61727b');
        }
      }
    }, FLAT);
    for (let variant = 0; variant < 3; variant++) {
      reg2('challenge_bg_' + theme + (variant ? '_' + variant : ''), 640, 360, function (g) {
        if (facility) cloudFacility(g, theme, variant, false);
        else if (dock) {
          dockCrane(g, 58 + variant * 32, 82, 280, 220, '#3c5361');
          dockCrane(g, 430 - variant * 24, 62, 280, 150, '#6b5b52');
          g.fillStyle = '#273e4c'; g.fillRect(0, 264, 640, 36);
          line(g, 0, 265, 640, 265, 2, '#70818a');
          for (let x = 8; x < 640; x += 160) {
            const stack = (Math.floor((x - 8) / 160) + variant) % 3;
            cargoBox(g, x, 222, 138, 40, stack, theme === 'aks' ? 'AKS FREIGHT' : 'AZURE CARGO');
            if (stack !== 1) cargoBox(g, x + 12, 183, 118, 38, stack + 1, 'CONTAINER');
          }
          const lx = 398 + variant * 45;
          line(g, lx, 163, lx, 264, 3, '#324851');
          line(g, lx - 18, 163, lx + 18, 163, 2, '#758b8e');
          for (const dx of [-16, 12]) {
            lit(g, lx + dx, 164, 6, 3, '#f3cf92');
            poly(g, [[lx + dx, 168], [lx + dx - 25, 264], [lx + dx + 35, 264]], 'rgba(242,207,146,0.06)');
          }
        } else {
          for (const x of [5, 632]) {
            g.fillStyle = lg(g, x, 0, x + 8, 0, [[0, '#344c5e'], [0.4, '#80918c'], [1, '#283d50']]); g.fillRect(x, 46, 8, 254);
            for (let y = 60; y < 300; y += 24) ell(g, x + 4, y, 1, 1, '#b1b8a5');
          }
          g.fillStyle = '#263d50'; g.fillRect(0, 48, 640, 8);
          for (let x = 12; x < 640; x += 40) {
            line(g, x, 56, x + 20, 74, 2, '#59717e'); line(g, x + 20, 74, x + 40, 56, 2, '#59717e');
          }
          line(g, 0, 74, 640, 74, 2, '#243a4b');
          for (const x of [110 + variant * 36, 490 - variant * 24]) {
            line(g, x, 76, x, 160, 1, '#8e9b95'); line(g, x + 7, 76, x + 7, 160, 1, '#4d6371');
            rrect(g, x - 8, 157, 24, 13, 2, '#b29364');
            line(g, x + 4, 170, x + 4, 186, 2, '#9ba89f');
            ell(g, x + 7, 186, 4, 4, '#83918d');
          }
          rrect(g, 377, 168, 210, 78, 3, '#304957');
          for (let x = 389; x < 570; x += 58) {
            rrect(g, x, 178, 48, 35, 2, '#192c3b');
            g.fillStyle = '#69a1a1'; g.fillRect(x + 3, 181, 42, 27);
            for (let n = 0; n < 4; n++) {
              g.fillStyle = n === variant ? '#dbbf87' : '#375e73'; g.fillRect(x + 7, 186 + n * 5, 18 + n * 4, 2);
            }
          }
          txt(g, theme === 'actions' ? 'GITHUB ACTIONS - RUNNER 0' + (variant + 1) : 'AZURE PIPELINES - BUILD LAB', 386, 221, 1, '#c6d9cd');
          line(g, 374, 246, 374, 271, 3, '#243a47'); line(g, 590, 246, 590, 271, 3, '#243a47');
          workshopArm(g, 220 + variant * 14, 267, false);
          workshopArm(g, 325 - variant * 8, 267, true);
          if (theme === 'pipelines') {
            for (const x of [40, 113]) {
              rrect(g, x, 177, 52, 83, 12, lg(g, x, 0, x + 52, 0, [[0, '#344d5a'], [0.4, '#9da99c'], [1, '#3f5b69']]));
              ell(g, x + 26, 208, 12, 12, '#263c4a'); ell(g, x + 26, 208, 9, 9, '#b7c9bd');
              line(g, x + 26, 208, x + 31, 203, 1.5, '#ad724c');
              line(g, x + 26, 177, x + 26, 157, 7, '#657d81');
            }
          } else {
            cargoBox(g, 34, 239, 59, 29, variant, '');
            cargoBox(g, 102, 243, 48, 25, variant + 1, '');
          }
          g.save(); g.translate(0, 272); cloudDeck(g, 640, 16, theme, false); g.restore();
        }
        const r = rng(940 + i * 10 + variant);
        for (let n = 0; n < 70; n++) {
          g.fillStyle = 'rgba(225,201,158,0.08)'; g.fillRect(r() * 640, 280 + r() * 20, r() * 22, 0.7);
        }
      }, FLAT);
    }
  });
  reg2('cloud_plat', 80, 20, function (g) {
    [[12, 12, 12], [30, 8, 14], [50, 9, 13], [68, 12, 11]].forEach(function (c) { ell(g, c[0], c[1], c[2], c[2] * 0.7, '#ffffff'); });
    g.fillStyle = '#ffffff'; g.fillRect(4, 10, 72, 8);
    g.fillStyle = 'rgba(160,200,255,0.8)'; g.fillRect(4, 16, 72, 2);
  }, { shade: 0.5 });
  // Azure cloud stairway platform: soft puffs over a glowing blue underside (stretched to the platform width).
  reg2('sky_cloud', 120, 20, function (g) {
    [[14, 11, 11], [34, 7, 12], [56, 5, 13], [78, 7, 12], [98, 9, 11], [110, 12, 8]].forEach(function (c) {
      ell(g, c[0], c[1] + 1, c[2], c[2] * 0.62, '#c8dcff');
      ell(g, c[0] - 1, c[1], c[2] * 0.92, c[2] * 0.56, lg(g, 0, c[1] - c[2] * 0.6, 0, c[1] + c[2] * 0.5, [[0, '#ffffff'], [1, '#e2eeff']]));
    });
    rrect(g, 3, 9, 114, 8, 4, lg(g, 0, 9, 0, 17, [[0, '#eef5ff'], [0.55, '#9cc8ff'], [1, '#2f86e0']]));
    g.fillStyle = 'rgba(80,224,255,0.95)'; g.fillRect(6, 16.6, 108, 1.2);
    [18, 40, 62, 84, 104].forEach(function (x, i) { g.fillStyle = i % 2 ? '#0078d4' : '#50e6ff'; g.fillRect(x, 13, 3, 1.2); g.fillRect(x + 1, 12, 1.2, 3); });
  }, { shade: 0.4, glow: '#50c8ff' });

  /* ---- Microsoft brand pieces */
  reg2('ms_logo', 16, 16, function (g) { msLogo(g, 0.5, 0.5, 15); }, FLAT);
  reg2('clippy', 20, 30, function (g) {
    g.lineCap = 'round'; g.strokeStyle = '#c8cce8'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(7, 26); g.lineTo(7, 9); g.arc(11, 9, 4, Math.PI, 0); g.lineTo(15, 22); g.arc(11.5, 22, 3.5, 0, Math.PI); g.lineTo(8, 12); g.stroke();
    g.strokeStyle = '#7a7ea8'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(7.6, 26); g.lineTo(7.6, 9); g.stroke();
    [[6, 12], [14, 12]].forEach(function (e) { ell(g, e[0], e[1], 2.6, 3, '#ffffff'); ell(g, e[0] + 0.6, e[1] + 0.4, 1.2, 1.4, '#14082a'); });
    line(g, 3.6, 8, 7.4, 8.6, 0.8, '#14082a'); line(g, 12.6, 8.6, 16.4, 8, 0.8, '#14082a');
  }, { shade: 0.3 });
  reg2('ach_icon', 16, 16, function (g) {
    ell(g, 8, 8, 7.6, 7.6, lg(g, 0, 0, 0, 16, [[0, '#9aff7a'], [1, '#107c10']]));
    poly(g, [[4.6, 4], [11.4, 4], [10.6, 8.4], [8, 10], [5.4, 8.4]], '#ffffff'); g.fillStyle = '#ffffff'; g.fillRect(7.2, 9.6, 1.6, 2); g.fillRect(5.6, 11.4, 4.8, 1.2);
  }, FLAT);
  reg2('ebolt', 12, 6, function (g) {
    ell(g, 6, 3, 5.6, 2.6, 'rgba(255,90,60,0.6)'); ell(g, 7, 3, 3.6, 1.8, '#ff9a5a'); ell(g, 8, 3, 1.8, 1.1, '#ffffff');
  }, { shade: 0, noOutline: true, glow: '#ff5a3c' });

  /* ---- neon billboards for Microsoft products (posts included, base at the bottom) */
  const BILLS = [
    ['AZURE', '#27e0ff'], ['MICROSOFT 365', '#ff9a40'], ['XBOX GAME PASS', '#7dff7a'], ['COPILOT', '#c9a0ff'], ['TEAMS', '#9a8cff'],
    ['GITHUB', '#ffffff'], ['VS CODE', '#4ab4ff'], ['WINDOWS 11', '#4ad8ff'], ['POWER BI', '#ffd23f'], ['EDGE', '#4dffb0'],
    ['DEFENDER', '#7fe8ff'], ['AZURE AI', '#ff7ad9'], ['MINECRAFT', '#7dff7a'], ['OUTLOOK', '#4ab4ff'], ['BING', '#27e0ff']
  ];
  const billKeys = [];
  BILLS.forEach(function (b, i) {
    const tw = txtW(b[0], 1), w = Math.round(tw + 24), h = 50;
    billKeys.push('bb_' + i);
    reg2('bb_' + i, w, h, function (g) {
      g.fillStyle = '#1a1036'; g.fillRect(w * 0.25 - 1, 18, 2.4, h - 18); g.fillRect(w * 0.75 - 1, 18, 2.4, h - 18);
      g.fillStyle = 'rgba(10,6,30,0.92)'; rrect(g, 0.5, 0.5, w - 1, 19, 2, g.fillStyle);
      g.strokeStyle = b[1]; g.lineWidth = 1; g.globalAlpha = 0.35; g.strokeRect(-0.5, -0.5, w + 1, 21); g.globalAlpha = 1; g.strokeRect(1, 1, w - 2, 18);
      msLogo(g, 4.5, 5.5, 9);
      txt(g, b[0], 17, 6.6, 1, b[1]);
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(2, 2, w - 4, 2);
    }, FLAT);
  });

  /* ---- region midground set pieces (base at the bottom; scene lays them out at random) */
  const MP = {
    westeurope: { top: '#4a2a9a', bot: '#7a3aa8', accent: '#ffb07a', win: ['#ffd070', '#ff9a6a', '#ffe9a0'] },
    uksouth: { top: '#3a3a90', bot: '#5a4aa8', accent: '#a8c8ff', win: ['#ffe9a0', '#ffc070', '#bfe8ff'] },
    japaneast: { top: '#4a1a80', bot: '#6a2a9a', accent: '#ff7a9a', win: ['#ffd0e0', '#ff7a9a', '#7fe8ff'] },
    australiaeast: { top: '#3a3a98', bot: '#6a4aa8', accent: '#ffd070', win: ['#ffe9a0', '#ffb060', '#7fe8ff'] },
    brazilsouth: { top: '#4a2a90', bot: '#7a3a9a', accent: '#d8ff80', win: ['#ffe14a', '#ff7ad9', '#7dff7a'] }
  };
  function tree(g, x, base, h, leaf) {
    g.fillStyle = '#2a1430'; g.fillRect(x - 1.2, base - h * 0.45, 2.4, h * 0.45);
    [[0, -0.7, 0.36], [-0.22, -0.55, 0.28], [0.22, -0.55, 0.28], [0, -0.92, 0.22]].forEach(function (c) { ell(g, x + c[0] * h, base + c[1] * h, c[2] * h, c[2] * h * 0.85, leaf); });
    ell(g, x - h * 0.1, base - h * 0.8, h * 0.12, h * 0.08, 'rgba(255,255,255,0.18)');
  }
  function lamp(g, x, base, h, col) { g.fillStyle = '#14082a'; g.fillRect(x - 0.6, base - h, 1.2, h); ell(g, x, base - h, 2.2, 2.6, col); glowRect(g, col, x - 4, base - h - 4, 8, 8); }
  function palm(g, x, base, h) {
    g.strokeStyle = '#5a3a2a'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + h * 0.18, base - h * 0.5, x + h * 0.06, base - h); g.stroke();
    const tx = x + h * 0.06, ty = base - h;
    for (let k = 0; k < 7; k++) { const a = -Math.PI * 0.95 + k * Math.PI * 0.3; g.strokeStyle = k % 2 ? '#2a9a5a' : '#1a7a4a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * h * 0.25, ty + Math.sin(a) * h * 0.25 - 6, tx + Math.cos(a) * h * 0.42, ty + Math.sin(a) * h * 0.18 + 6); g.stroke(); }
    ell(g, tx, ty + 2, 2.6, 2.6, '#6a3a1a');
  }
  const SC = {
    westeurope: {
      sc_we_row1: [170, 140, function (g, w, h, P) { canalHouses(g, 0, w, h, rng(301), P, 80, 125, false); for (let x = 20; x < w; x += 45) tree(g, x, h, 46, '#3a7a4a'); }],
      sc_we_row2: [140, 150, function (g, w, h, P) { canalHouses(g, 0, w, h, rng(302), P, 90, 135, false); lamp(g, 30, h, 34, '#ffd070'); lamp(g, 110, h, 34, '#ffd070'); }],
      sc_we_row3: [200, 130, function (g, w, h, P) { canalHouses(g, 0, w, h, rng(303), P, 70, 110, false); for (let x = 35; x < w; x += 60) tree(g, x, h, 40, '#4a8a3a'); }],
      sc_we_rijks: [210, 150, function (g, w, h, P) {
        const f = silFill(g, h - 120, h, '#a8483a', '#5a1a3a');
        g.fillStyle = f; g.fillRect(10, h - 80, 190, 80); g.fillRect(60, h - 110, 24, 110); g.fillRect(126, h - 110, 24, 110);
        poly(g, [[56, h - 110], [72, h - 140], [88, h - 110]], '#3a5a6a'); poly(g, [[122, h - 110], [138, h - 140], [154, h - 110]], '#3a5a6a');
        poly(g, [[6, h - 80], [105, h - 100], [204, h - 80]], '#3a4a6a');
        for (let x = 18; x < 196; x += 11) { lit(g, x, h - 70, 5, 10, P.win[(x / 11 | 0) % 3]); lit(g, x, h - 45, 5, 10, P.win[(x / 11 + 1 | 0) % 3]); }
        g.fillStyle = '#1a0a2a'; g.beginPath(); g.ellipse(105, h - 10, 12, 18, 0, Math.PI, 0); g.fill(); g.fillRect(93, h - 10, 24, 10);
        txt(g, 'I AMSTERDAM', 60, h - 8, 1, '#ff2a4a', '#ffffff');
      }],
      sc_we_mill: [130, 150, function (g, w, h, P) { g.fillStyle = lg(g, 0, h - 20, 0, h, [[0, '#3a7a3a'], [1, '#1a3a2a']]); g.beginPath(); g.ellipse(65, h, 70, 20, 0, Math.PI, 0); g.fill(); windmill(g, 65, h - 16, 1.4, P); }],
      sc_we_kerk: [150, 210, function (g, w, h, P) { westerkerk(g, 75, h, 1.2, P); canalHouses(g, 0, 50, h, rng(305), P, 60, 90, false); canalHouses(g, 100, 150, h, rng(306), P, 60, 90, false); }],
      sc_we_magere: [220, 90, function (g, w, h, P) {
        g.fillStyle = '#f0e8ff'; g.fillRect(0, h - 40, 220, 4);
        [60, 160].forEach(function (x) { g.fillRect(x - 3, h - 80, 6, 80); g.fillRect(x - 14, h - 80, 28, 3); line(g, x - 12, h - 78, x - 40, h - 40, 1, '#f0e8ff'); line(g, x + 12, h - 78, x + 40, h - 40, 1, '#f0e8ff'); });
        g.strokeStyle = '#f0e8ff'; g.lineWidth = 1.4; [40, 110, 180].forEach(function (x) { g.beginPath(); g.ellipse(x, h, 32, 34, 0, Math.PI, 0); g.stroke(); });
        for (let x = 4; x < 220; x += 6) lit(g, x, h - 42, 1.4, 1.4, '#ffe9a0');
      }]
    },
    uksouth: {
      sc_uk_bigben: [190, 272, function (g, w, h, P) { parliament(g, 30, 190, h, P); bigBen(g, 28, h, 1.28, P); }],
      sc_uk_eye: [150, 180, function (g, w, h, P) { londonEye(g, 75, h, 1.4, P); }],
      sc_uk_stpauls: [170, 170, function (g, w, h, P) {
        const f = silFill(g, h - 160, h, '#c8c0f0', '#5a4aa8');
        g.fillStyle = f; g.fillRect(10, h - 60, 150, 60); g.fillRect(55, h - 90, 60, 30);
        g.beginPath(); g.ellipse(85, h - 90, 32, 40, 0, Math.PI, 0); g.fill();
        g.fillRect(80, h - 140, 10, 14); poly(g, [[78, h - 140], [85, h - 152], [92, h - 140]], f);
        lit(g, 84, h - 156, 2, 3, '#ffd23f');
        [20, 150].forEach(function (x) { g.fillStyle = f; g.fillRect(x - 8, h - 100, 16, 40); poly(g, [[x - 8, h - 100], [x, h - 118], [x + 8, h - 100]], f); });
        for (let x = 16; x < 156; x += 8) { g.fillStyle = 'rgba(60,40,140,0.6)'; g.fillRect(x, h - 56, 1.6, 50); }
        for (let k = -4; k <= 4; k++) { g.fillStyle = 'rgba(60,40,140,0.5)'; g.fillRect(85 + k * 6, h - 88, 1, 26); }
      }],
      sc_uk_gherkin: [80, 200, function (g, w, h, P) {
        g.beginPath(); g.moveTo(22, h); g.bezierCurveTo(4, h - 110, 20, h - 180, 40, h - 196); g.bezierCurveTo(60, h - 180, 76, h - 110, 58, h); g.closePath();
        g.fillStyle = lg(g, 10, 0, 70, 0, [[0, '#1a6a8a'], [0.5, '#7fe8ff'], [1, '#1a3a6a']]); g.fill();
        g.save(); g.clip(); g.strokeStyle = 'rgba(10,30,60,0.6)'; g.lineWidth = 1.2;
        for (let k = -12; k < 12; k++) { g.beginPath(); g.moveTo(k * 12, h); g.lineTo(k * 12 + 80, h - 200); g.stroke(); }
        g.restore();
      }],
      sc_uk_terrace: [180, 110, function (g, w, h, P) {
        for (let x = 0; x < w; x += 30) {
          const hh = 70 + ((x * 7) % 30);
          g.fillStyle = silFill(g, h - hh, h, x % 60 ? '#5a3a8a' : '#4a3a7a', P.bot); g.fillRect(x, h - hh, 30, hh);
          g.fillStyle = '#2a1a4a'; g.fillRect(x + 4, h - hh - 8, 6, 8); g.fillRect(x + 20, h - hh - 8, 6, 8);
          for (let y = h - hh + 8; y < h - 12; y += 14) for (let k = 0; k < 3; k++) lit(g, x + 4 + k * 9, y, 4, 8, P.win[(x + y + k) % 3]);
          g.fillStyle = ['#ff2a4a', '#2a8a5a', '#2a4ab8'][(x / 30) % 3]; g.fillRect(x + 12, h - 12, 6, 12);
        }
      }],
      sc_uk_tbridge: [240, 120, function (g, w, h, P) { towerBridge(g, 0, 240, h, P); }],
      sc_uk_shard: [60, 210, function (g, w, h, P) { shard(g, 30, h, 1.45, P); }]
    },
    australiaeast: {
      sc_au_opera: [200, 130, function (g, w, h, P) { operaHouse(g, 18, h, 1.15, P); }],
      sc_au_bridge: [300, 170, function (g, w, h, P) { harbourBridge(g, 0, 300, h, P); }],
      sc_au_tower: [60, 210, function (g, w, h, P) { sydneyTower(g, 30, h, 1.45, P); }],
      sc_au_luna: [130, 120, function (g, w, h, P) {
        [12, 118].forEach(function (x) { g.fillStyle = silFill(g, h - 100, h, '#ffd23f', '#e8508a'); g.fillRect(x - 7, h - 100, 14, 100); lit(g, x - 2, h - 106, 4, 6, '#ff2a4a'); });
        ell(g, 65, h - 62, 42, 46, '#ffd8b0'); ell(g, 65, h - 62, 38, 42, '#ffe9c8');
        ell(g, 50, h - 74, 7, 8, '#ffffff'); ell(g, 80, h - 74, 7, 8, '#ffffff'); ell(g, 50, h - 72, 3.4, 4, '#2a6aff'); ell(g, 80, h - 72, 3.4, 4, '#2a6aff');
        g.fillStyle = '#c8102e'; g.beginPath(); g.ellipse(65, h - 36, 26, 22, 0, 0, Math.PI); g.fill(); g.fillStyle = '#1a0a2a'; g.fillRect(40, h - 36, 50, 36);
        for (let x = 44; x < 88; x += 8) { g.fillStyle = '#ffffff'; g.fillRect(x, h - 36, 6, 6); }
        txt(g, 'LUNA PARK', 38, h - 116, 1, '#ffe14a', '#c8102e');
      }],
      sc_au_palms: [150, 130, function (g, w, h, P) { palm(g, 20, h, 100); palm(g, 70, h, 120); palm(g, 120, h, 90); }],
      sc_au_city: [160, 170, function (g, w, h, P) { skyline(w, h, 401, '#2a2a80', P.accent, 60, 160, 0.3, P.win)(g); }]
    },
    japaneast: {
      sc_jp_neon1: [110, 230, function (g, w, h, P) {
        g.fillStyle = silFill(g, h - 220, h, '#3a1a7a', '#1a0a40'); g.fillRect(10, h - 220, 90, 220);
        const r = rng(501);
        for (let y = h - 210; y < h - 6; y += 8) for (let x = 16; x < 92; x += 7) if (r() < 0.5) lit(g, x, y, 4, 4, P.win[Math.floor(r() * 3)]);
        [['#ff2a9a', 4], ['#27e0ff', 96]].forEach(function (s) { glowRect(g, s[0], s[1], h - 180, 10, 90); g.fillStyle = s[0]; g.fillRect(s[1], h - 180, 10, 90); for (let k = 0; k < 6; k++) { g.fillStyle = '#ffffff'; g.fillRect(s[1] + 2, h - 172 + k * 14, 6, 2); g.fillRect(s[1] + 4, h - 176 + k * 14, 2, 10); } });
        g.fillStyle = 'rgba(10,6,30,0.9)'; g.fillRect(20, h - 120, 70, 26); msLogo(g, 24, h - 115, 16); txt(g, 'XBOX', 44, h - 112, 1, '#7dff7a');
      }],
      sc_jp_neon2: [90, 180, function (g, w, h, P) {
        g.fillStyle = silFill(g, h - 170, h, '#5a1a6a', '#200a40'); g.fillRect(5, h - 170, 80, 170);
        for (let y = h - 160; y < h - 10; y += 22) { const c = ['#ff7ad9', '#ffe14a', '#27e0ff', '#7dff7a'][(y / 22 | 0) % 4]; glowRect(g, c, 10, y, 70, 10); g.fillStyle = c; g.fillRect(10, y, 70, 10); g.fillStyle = 'rgba(10,4,30,0.8)'; for (let x = 14; x < 76; x += 9) g.fillRect(x, y + 2, 5, 6); }
      }],
      sc_jp_skytree: [70, 260, function (g, w, h, P) {
        poly(g, [[15, h], [31, h - 200], [33, h - 250], [37, h - 250], [39, h - 200], [55, h]], lg(g, 15, 0, 55, 0, [[0, '#a8b8ff'], [0.5, '#ffffff'], [1, '#6a6ad8']]));
        g.strokeStyle = 'rgba(40,40,120,0.6)'; g.lineWidth = 0.6; for (let y = h; y > h - 200; y -= 8) { const k = (h - y) / 200, hw = 20 - k * 16; g.beginPath(); g.moveTo(35 - hw, y); g.lineTo(35 + hw, y - 8); g.moveTo(35 + hw, y); g.lineTo(35 - hw, y - 8); g.stroke(); }
        rrect(g, 26, h - 150, 18, 8, 2, '#c8d8ff'); rrect(g, 28, h - 196, 14, 6, 2, '#c8d8ff');
        for (let k = 0; k < 4; k++) lit(g, 27 + k * 4.4, h - 147, 2, 2, '#7fe8ff');
        lit(g, 34, h - 254, 2, 3, '#ff2a4a');
      }],
      sc_jp_tower: [90, 230, function (g, w, h, P) { tokyoTower(g, 45, h, 1.12, P); }],
      sc_jp_shrine: [200, 150, function (g, w, h, P) { pagoda(g, 140, h, 1.3, P); torii(g, 50, h, 1.1, P); }],
      sc_jp_sakura: [160, 100, function (g, w, h, P) { for (let x = 25; x < w; x += 55) tree(g, x, h, 70, '#ffa8d8'); const r = rng(9); for (let i = 0; i < 40; i++) ell(g, r() * w, h - r() * 90, 1, 0.7, '#ffd8ec'); }]
    },
    brazilsouth: {
      sc_br_favela: [200, 140, function (g, w, h, P) { favelaHills(w, h, 601)(g, w, h); }],
      sc_br_palms: [150, 130, function (g, w, h, P) { palm(g, 25, h, 110); palm(g, 85, h, 90); palm(g, 130, h, 120); }],
      sc_br_selaron: [140, 120, function (g, w, h, P) {
        const cols = ['#ff2a4a', '#ffd23f', '#2a8aff', '#3ac84a', '#ffffff'];
        for (let s = 0; s < 10; s++) { const y = h - (s + 1) * 10, x = s * 10; g.fillStyle = cols[s % 5]; g.fillRect(x, y, 140 - x, 10); for (let k = x; k < 140; k += 5) { g.fillStyle = cols[(k / 5 + s) % 5 | 0]; g.globalAlpha = 0.6; g.fillRect(k + 0.5, y + 0.5, 4, 4); g.globalAlpha = 1; } g.fillStyle = 'rgba(10,6,30,0.35)'; g.fillRect(x, y + 8, 140 - x, 2); }
        txt(g, 'RIO', 100, h - 118, 1, '#ffffff', '#ff2a4a');
      }],
      sc_br_christ: [220, 180, function (g, w, h, P) { corcovado(g, 110, h, 0.95, P); }],
      sc_br_sugar: [260, 110, function (g, w, h, P) { sugarloaf(g, 170, h, 0.95, P); }],
      sc_br_arcos: [200, 80, function (g, w, h, P) {
        g.fillStyle = '#f0e8ff'; g.fillRect(0, h - 80, 200, 80);
        g.save(); g.globalCompositeOperation = 'destination-out';
        for (let x = 4; x < 200; x += 20) { g.beginPath(); g.ellipse(x + 8, h - 44, 7, 9, 0, Math.PI, 0); g.fill(); g.fillRect(x + 1, h - 44, 14, 44); g.beginPath(); g.ellipse(x + 8, h - 66, 5, 5, 0, Math.PI, 0); g.fill(); g.fillRect(x + 3, h - 66, 10, 12); }
        g.restore();
        g.fillStyle = '#ffd23f'; g.fillRect(0, h - 82, 200, 2);
      }]
    }
  };
  /* detailed Amsterdam canal house: type = step | bell | neck | spout | cornice | clock */
  const GRACHT_COLS = ['#8a3a5a', '#5a2a6a', '#3a4a7a', '#6a3a4a', '#cfc0ec', '#2a4a5a', '#7a4a3a', '#4a2a4a'];
  function gracht(g, x, base, w, h, type, col, P, r) {
    const top = base - h, trim = '#f4ecff';
    g.fillStyle = silFill(g, top, base, col, P.bot); g.fillRect(x, top, w, h);
    g.fillStyle = 'rgba(0,0,12,0.22)'; g.fillRect(x + w - 3, top, 3, h);
    const gw = type === 'cornice' ? w : w * 0.7, gx = x + (w - gw) / 2;
    if (type === 'step') {
      for (let k = 0; k < 5; k++) { const sw = w - k * w * 0.18, sx = x + (w - sw) / 2, sy = top - (k + 1) * 4; g.fillStyle = col; g.fillRect(sx, sy, sw, 4.2); g.fillStyle = trim; g.fillRect(sx, sy, 1.4, 1); g.fillRect(sx + sw - 1.4, sy, 1.4, 1); }
      g.fillStyle = trim; g.fillRect(x + w / 2 - 0.6, top - 24, 1.2, 4);
    } else if (type === 'bell') {
      g.fillStyle = col; g.beginPath(); g.moveTo(x, top); g.bezierCurveTo(x + 1, top - 10, gx, top - 8, gx + 1, top - 14); g.bezierCurveTo(gx + gw * 0.3, top - 24, gx + gw * 0.7, top - 24, gx + gw - 1, top - 14); g.bezierCurveTo(x + w - gx + x, top - 8, x + w - 1, top - 10, x + w, top); g.closePath(); g.fill();
      g.strokeStyle = trim; g.lineWidth = 1; g.stroke();
      ell(g, x + w / 2, top - 12, 2.2, 2.2, P.win[0]);
    } else if (type === 'neck') {
      g.fillStyle = col; g.fillRect(gx, top - 14, gw, 14); poly(g, [[gx - 1, top - 14], [x + w / 2, top - 20], [gx + gw + 1, top - 14]], col);
      g.strokeStyle = trim; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x, top); g.quadraticCurveTo(gx - 3, top - 2, gx, top - 10); g.moveTo(x + w, top); g.quadraticCurveTo(gx + gw + 3, top - 2, gx + gw, top - 10); g.stroke();
      poly(g, [[gx - 1, top - 14], [x + w / 2, top - 20], [gx + gw + 1, top - 14]], 'rgba(0,0,0,0)'); g.fillStyle = trim; g.fillRect(gx - 1, top - 14.6, gw + 2, 1);
    } else if (type === 'spout') {
      poly(g, [[x, top], [x + w / 2, top - 16], [x + w, top]], col);
      g.strokeStyle = trim; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x, top); g.lineTo(x + w / 2, top - 16); g.lineTo(x + w, top); g.stroke();
      g.fillStyle = '#2a1a3a'; g.fillRect(x + w / 2 - 2, top - 8, 4, 6);
    } else if (type === 'cornice') {
      g.fillStyle = trim; g.fillRect(x - 1, top - 3, w + 2, 3);
      g.fillStyle = col; g.fillRect(x + w * 0.3, top - 9, w * 0.4, 6);
      g.fillStyle = trim; g.beginPath(); g.ellipse(x + w / 2, top - 9, w * 0.2, 4, 0, Math.PI, 0); g.fill();
      for (let k = 2; k < w - 2; k += 4) { g.fillStyle = 'rgba(30,10,50,0.5)'; g.fillRect(x + k, top - 2, 1, 2); }
    } else { // clock gable
      g.fillStyle = col; g.fillRect(gx + 2, top - 18, gw - 4, 18); g.beginPath(); g.ellipse(x + w / 2, top - 18, gw / 2 - 2, 6, 0, Math.PI, 0); g.fill();
      g.strokeStyle = trim; g.lineWidth = 0.9; g.beginPath(); g.arc(gx, top - 4, 4, -Math.PI / 2, 0); g.moveTo(gx + gw, top - 8); g.arc(gx + gw, top - 4, 4, Math.PI, -Math.PI / 2); g.stroke();
      ell(g, x + w / 2, top - 14, 2.6, 2.6, trim);
    }
    if (type !== 'cornice') { g.fillStyle = '#e8e0f8'; g.fillRect(x + w / 2 - 0.5, top - 4, 1, 3); g.fillRect(x + w / 2 - 0.5, top - 4, 4, 1); }
    const cols = w > 28 ? 3 : 2, cw = (w - 6) / cols;
    for (let wy = top + 5, row = 0; wy < base - 16; wy += 14, row++) {
      for (let c = 0; c < cols; c++) {
        const wx = x + 3 + c * cw + cw / 2 - 2.6;
        g.fillStyle = trim; g.fillRect(wx - 0.8, wy - 0.8, 6.8, 10.6);
        if (r() < 0.7) lit(g, wx, wy, 5.2, 9, P.win[Math.floor(r() * P.win.length)]); else { g.fillStyle = '#140a30'; g.fillRect(wx, wy, 5.2, 9); }
        g.fillStyle = trim; g.fillRect(wx, wy + 4, 5.2, 0.7); g.fillRect(wx + 2.3, wy, 0.7, 9);
      }
    }
    const dx = x + w / 2 - 3;
    g.fillStyle = ['#1a6a4a', '#2a2a6a', '#7a1a2a', '#1a1a2a'][Math.floor(r() * 4)]; g.fillRect(dx, base - 12, 6, 12);
    g.fillStyle = trim; g.fillRect(dx - 1, base - 13, 8, 1); lit(g, dx + 1, base - 12, 4, 2, '#ffe9a0');
    g.fillStyle = '#4a3a5a'; g.fillRect(dx - 3, base - 2, 12, 2); g.fillRect(dx - 2, base - 4, 10, 2);
    if (r() < 0.5) { g.fillStyle = '#3a8a3a'; g.fillRect(x + 3, base - 18, 6, 2); ell(g, x + 4, base - 19, 1, 1, '#ff5a8a'); ell(g, x + 7, base - 19, 1, 1, '#ffe14a'); }
  }
  const GTYPES = ['step', 'bell', 'neck', 'spout', 'cornice', 'clock'];
  function grachtRow(g, x0, x1, base, seed, P, hmin, hmax) {
    const r = rng(seed); let x = x0, last = -1;
    while (x < x1 - 18) {
      const w = Math.min(x1 - x, 22 + Math.floor(r() * 12)), h = hmin + Math.floor(r() * (hmax - hmin));
      let t; do { t = Math.floor(r() * GTYPES.length); } while (t === last); last = t;
      gracht(g, x, base, w, h, GTYPES[t], GRACHT_COLS[Math.floor(r() * GRACHT_COLS.length)], P, r);
      x += w + 0.6;
    }
  }
  function bikeSil(g, x, base, col) {
    g.strokeStyle = col; g.lineWidth = 0.9;
    g.beginPath(); g.arc(x, base - 3, 3, 0, Math.PI * 2); g.moveTo(x + 13, base - 3); g.arc(x + 10, base - 3, 3, 0, Math.PI * 2);
    g.moveTo(x, base - 3); g.lineTo(x + 4, base - 8); g.lineTo(x + 9, base - 8); g.lineTo(x + 10, base - 3); g.moveTo(x + 4, base - 8); g.lineTo(x + 5, base - 3); g.lineTo(x + 9, base - 8); g.moveTo(x + 9, base - 8); g.lineTo(x + 8.5, base - 10); g.stroke();
  }
  function plane(g, x, y, s, ang) {
    g.save(); g.translate(x, y); g.rotate(ang || 0); g.scale(s, s);
    rrect(g, -40, -5, 80, 10, 5, '#f4f4ff'); g.fillStyle = '#2a8aff'; g.fillRect(-36, 1, 72, 2.4);
    poly(g, [[-6, 0], [6, 0], [-10, 22], [-18, 22]], '#d8d8f0'); poly(g, [[-6, -2], [6, -2], [-14, -14], [-20, -14]], '#c8c8e8');
    poly(g, [[-30, -4], [-38, -4], [-44, -20], [-38, -20]], '#2a8aff'); poly(g, [[-34, 0], [-28, 0], [-42, 8], [-46, 8]], '#d8d8f0');
    for (let k = -26; k < 30; k += 5) lit(g, k, -2.6, 2, 2, '#7fe8ff');
    poly(g, [[34, -5], [42, -1], [40, 2], [32, 2]], '#14143a');
    ell(g, -2, 12, 5, 2.4, '#b8b8d8');
    g.restore();
  }
  const SC_EXTRA = {
    westeurope: {
      sc_we_row1: [170, 150, function (g, w, h, P) { grachtRow(g, 0, w, h, 301, P, 80, 120); for (let x = 22; x < w; x += 52) tree(g, x, h, 48, '#3a7a4a'); bikeSil(g, 40, h, '#14082a'); bikeSil(g, 120, h, '#14082a'); }],
      sc_we_row2: [150, 160, function (g, w, h, P) { grachtRow(g, 0, w, h, 302, P, 90, 132); lamp(g, 30, h, 34, '#ffd070'); lamp(g, 115, h, 34, '#ffd070'); }],
      sc_we_row3: [200, 140, function (g, w, h, P) { grachtRow(g, 0, w, h, 303, P, 74, 112); for (let x = 36; x < w; x += 64) tree(g, x, h, 42, '#4a8a3a'); }],
      sc_we_row4: [180, 150, function (g, w, h, P) { grachtRow(g, 0, w, h, 304, P, 84, 128); for (let x = 8; x < w - 14; x += 26) bikeSil(g, x, h, '#1a0a3a'); }],
      sc_we_row5: [130, 160, function (g, w, h, P) { grachtRow(g, 0, w, h, 305, P, 96, 140); lamp(g, 64, h, 36, '#ffd070'); }],
      sc_we_centraal: [290, 175, function (g, w, h, P) {
        g.fillStyle = 'rgba(200,210,255,0.35)'; g.beginPath(); g.ellipse(150, h - 50, 150, 40, 0, Math.PI, 0); g.fill();
        g.strokeStyle = 'rgba(40,30,80,0.6)'; g.lineWidth = 0.8; for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(10 + k * 20, h - 50); g.lineTo(10 + k * 20, h - 50 - Math.sqrt(Math.max(0, 1 - Math.pow((k * 20 - 140) / 150, 2))) * 40); g.stroke(); }
        const brick = silFill(g, h - 160, h, '#a8483a', '#5a1a3a');
        g.fillStyle = brick; g.fillRect(6, h - 64, 278, 64);
        for (let k = 0; k < 4; k++) { const bx = 6 + k * 70 + (k > 1 ? 10 : 0); poly(g, [[bx, h - 64], [bx + 25, h - 82], [bx + 50, h - 64]], brick); g.fillStyle = '#f0e0d0'; g.fillRect(bx, h - 65, 50, 1.2); }
        g.fillStyle = brick; g.fillRect(118, h - 96, 54, 96); poly(g, [[114, h - 96], [145, h - 118], [176, h - 96]], brick);
        ell(g, 145, h - 106, 6, 6, '#ffd890'); ell(g, 145, h - 106, 4.6, 4.6, '#f4ecff');
        line(g, 145, h - 106, 145, h - 109, 0.7, '#14082a'); line(g, 145, h - 106, 147.4, h - 106, 0.7, '#14082a');
        [[60, 'clock'], [230, 'vane']].forEach(function (t) {
          const tx = t[0]; g.fillStyle = brick; g.fillRect(tx - 11, h - 124, 22, 124);
          poly(g, [[tx - 13, h - 124], [tx, h - 150], [tx + 13, h - 124]], '#3a5a6a'); g.fillStyle = '#ffd23f'; g.fillRect(tx - 0.6, h - 162, 1.2, 12);
          if (t[1] === 'clock') { ell(g, tx, h - 112, 7, 7, '#ffd23f'); ell(g, tx, h - 112, 5.6, 5.6, '#f4ecff'); line(g, tx, h - 112, tx, h - 116, 0.8, '#14082a'); line(g, tx, h - 112, tx + 3, h - 112, 0.8, '#14082a'); }
          else { poly(g, [[tx, h - 162], [tx + 7, h - 160], [tx, h - 158]], '#ffd23f'); lit(g, tx - 4, h - 116, 8, 10, P.win[1]); }
          for (let y = h - 96; y < h - 14; y += 16) { lit(g, tx - 6, y, 4, 9, P.win[0]); lit(g, tx + 2, y, 4, 9, P.win[2]); }
        });
        for (let x = 14; x < 280; x += 9) { if (x > 112 && x < 176) continue; if ((x > 46 && x < 76) || (x > 216 && x < 246)) continue; g.fillStyle = '#f0e0d0'; g.fillRect(x - 0.6, h - 52, 6.2, 13); lit(g, x, h - 51, 5, 11, P.win[(x / 9 | 0) % 3]); g.fillStyle = '#f0e0d0'; g.fillRect(x - 0.6, h - 28, 6.2, 11); lit(g, x, h - 27, 5, 9, P.win[(x / 9 + 1 | 0) % 3]); }
        g.fillStyle = '#f0e0d0'; g.fillRect(6, h - 34, 278, 1.2);
        g.fillStyle = '#1a0a2a'; [126, 140, 154].forEach(function (x) { g.beginPath(); g.ellipse(x + 5, h - 16, 5, 6, 0, Math.PI, 0); g.fill(); g.fillRect(x, h - 16, 10, 16); });
        txt(g, 'CENTRAAL', 121, h - 92, 1, '#ffe14a', '#3a0a1a');
      }],
      sc_we_schiphol: [300, 175, function (g, w, h, P) {
        g.fillStyle = '#2a2a5a'; g.fillRect(0, h - 4, w, 4);
        g.fillStyle = silFill(g, h - 90, h, '#c8d0f8', '#4a4aa8'); g.fillRect(150, h - 132, 12, 132);
        g.fillStyle = '#d8e0ff'; g.beginPath(); g.moveTo(140, h - 132); g.lineTo(172, h - 132); g.lineTo(168, h - 152); g.lineTo(144, h - 152); g.closePath(); g.fill();
        g.fillStyle = '#7fe8ff'; g.fillRect(143, h - 148, 26, 10); g.fillStyle = '#2a2a6a'; for (let k = 0; k < 6; k++) g.fillRect(145 + k * 4.4, h - 148, 0.8, 10);
        g.fillStyle = '#e8e8ff'; g.fillRect(146, h - 158, 20, 6); lit(g, 155, h - 166, 2, 6, '#ff2a4a');
        g.fillStyle = silFill(g, h - 50, h, '#5a5ab0', '#2a2a6a'); g.fillRect(10, h - 46, 280, 42);
        g.fillStyle = 'rgba(160,220,255,0.5)'; g.fillRect(14, h - 40, 272, 24);
        g.strokeStyle = 'rgba(30,30,80,0.7)'; g.lineWidth = 0.7; for (let x = 14; x < 286; x += 8) { g.beginPath(); g.moveTo(x, h - 40); g.lineTo(x, h - 16); g.stroke(); }
        for (let x = 18; x < 286; x += 16) lit(g, x, h - 36, 6, 6, P.win[(x / 16 | 0) % 3]);
        g.fillStyle = '#d8d8f8'; g.beginPath(); g.moveTo(6, h - 46); g.quadraticCurveTo(150, h - 62, 294, h - 46); g.lineTo(294, h - 44); g.lineTo(6, h - 44); g.fill();
        g.fillStyle = '#ffd23f'; g.fillRect(40, h - 14, 80, 10); txt(g, 'SCHIPHOL', 44, h - 12.4, 1, '#14145a');
        g.fillStyle = '#2a2aa8'; g.fillRect(190, h - 14, 70, 10); txt(g, 'GATES D-E', 194, h - 12.4, 1, '#ffffff');
        plane(g, 80, h - 128, 0.8, -0.22);
        plane(g, 250, h - 80, 0.55, 0);
      }],
      sc_we_mshq: [190, 175, function (g, w, h, P) {
        g.fillStyle = silFill(g, h - 150, h, '#3a4aa0', '#1a1a5a'); g.fillRect(14, h - 140, 104, 140); g.fillRect(100, h - 100, 80, 100);
        const glass = lg(g, 0, h - 140, 0, h, [[0, 'rgba(140,220,255,0.6)'], [1, 'rgba(60,90,200,0.3)']]);
        g.fillStyle = glass; g.fillRect(18, h - 134, 96, 130); g.fillRect(104, h - 94, 72, 90);
        g.strokeStyle = 'rgba(200,240,255,0.5)'; g.lineWidth = 0.6;
        for (let y = h - 130; y < h; y += 8) { g.beginPath(); g.moveTo(18, y); g.lineTo(114, y); g.stroke(); }
        for (let y = h - 90; y < h; y += 8) { g.beginPath(); g.moveTo(104, y); g.lineTo(176, y); g.stroke(); }
        const r = rng(717); for (let y = h - 128; y < h - 8; y += 8) for (let x = 22; x < 112; x += 6) if (r() < 0.45) lit(g, x, y + 2, 4, 4, P.win[Math.floor(r() * 3)]);
        for (let y = h - 88; y < h - 8; y += 8) for (let x = 108; x < 174; x += 6) if (r() < 0.45) lit(g, x, y + 2, 4, 4, P.win[Math.floor(r() * 3)]);
        g.fillStyle = 'rgba(10,6,30,0.9)'; g.fillRect(16, h - 160, 100, 18); glowRect(g, '#ffffff', 16, h - 160, 100, 18);
        msLogo(g, 20, h - 157, 12); txt(g, 'MICROSOFT', 36, h - 154, 1, '#ffffff');
        g.fillStyle = '#14082a'; g.fillRect(64, h - 142, 2, 2); g.fillRect(64, h - 142, 1, 0);
        g.fillStyle = 'rgba(10,6,30,0.85)'; g.fillRect(110, h - 112, 62, 12); txt(g, 'AZURE', 124, h - 109, 1, '#27e0ff');
        g.fillStyle = '#ff9a40'; g.fillRect(150, h - 120, 2, 8); g.fillRect(150, h - 120, 10, 6);
        txt(g, 'SCHIPHOL HQ', 30, h - 14, 1, '#ffe14a', '#1a0a3a');
        g.fillStyle = '#1a1a3a'; g.fillRect(56, h - 12, 22, 12); lit(g, 58, h - 10, 18, 9, '#bff0ff');
      }],
      sc_we_amstel: [240, 140, function (g, w, h, P) {
        const f = silFill(g, h - 110, h, '#f0e8ff', '#8a7ac8');
        g.fillStyle = f; g.fillRect(8, h - 80, 224, 80);
        g.fillStyle = '#3a3a6a'; g.beginPath(); g.moveTo(4, h - 80); g.lineTo(14, h - 100); g.lineTo(226, h - 100); g.lineTo(236, h - 80); g.closePath(); g.fill();
        for (let x = 22; x < 222; x += 20) { g.fillStyle = f; g.fillRect(x, h - 100, 8, 9); poly(g, [[x - 1, h - 100], [x + 4, h - 105], [x + 9, h - 100]], f); lit(g, x + 2, h - 98, 4, 5, P.win[0]); }
        g.fillStyle = f; g.fillRect(96, h - 108, 48, 108); poly(g, [[92, h - 108], [120, h - 126], [148, h - 108]], f);
        g.strokeStyle = '#8a7ac8'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(98, h - 110); g.lineTo(120, h - 123); g.lineTo(142, h - 110); g.stroke();
        [100, 140].forEach(function (x) { g.fillStyle = '#14082a'; g.fillRect(x - 0.4, h - 140, 0.8, 32); g.fillStyle = '#ff2a4a'; g.fillRect(x, h - 140, 9, 2); g.fillStyle = '#ffffff'; g.fillRect(x, h - 138, 9, 2); g.fillStyle = '#2a4ab8'; g.fillRect(x, h - 136, 9, 2); });
        for (let y = h - 72; y < h - 14; y += 18) for (let x = 14; x < 228; x += 12) { if (x > 92 && x < 146 && y > h - 30) continue; g.fillStyle = '#c8b8f0'; g.fillRect(x - 1, y - 1, 7, 12); lit(g, x, y, 5, 10, P.win[(x + y) % 3]); }
        for (let x = 98; x < 144; x += 6) { g.fillStyle = '#ffffff'; g.fillRect(x, h - 30, 2, 30); }
        g.fillStyle = '#1a1a4a'; g.fillRect(108, h - 22, 24, 22); lit(g, 110, h - 20, 20, 18, '#ffd890');
        g.fillStyle = '#2a1a5a'; g.fillRect(70, h - 92, 100, 10); txt(g, 'AMSTEL HOTEL', 85, h - 90, 1, '#ffd23f');
        for (let x = 10; x < 232; x += 6) lit(g, x, h - 81, 1.4, 1.4, '#ffe9a0');
      }],
      sc_we_wallen: [210, 175, function (g, w, h, P) {
        const K = { top: P.top, bot: P.bot, accent: '#ff5a7a', win: ['#ff3a5a', '#ff6a8a', '#ffd070'] };
        g.fillStyle = silFill(g, h - 175, h, '#5a3a7a', '#2a1a4a'); g.fillRect(96, h - 120, 34, 120);
        poly(g, [[92, h - 120], [113, h - 140], [134, h - 120]], '#3a5a6a'); g.fillStyle = '#5a3a7a'; g.fillRect(106, h - 160, 14, 22);
        poly(g, [[104, h - 160], [113, h - 175], [122, h - 160]], '#3a5a6a'); ell(g, 113, h - 150, 3.6, 3.6, '#ffd23f');
        grachtRow(g, 0, 96, h, 311, K, 80, 118); grachtRow(g, 130, 210, h, 312, K, 80, 118);
        g.strokeStyle = '#2a0a1a'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(0, h - 70); g.quadraticCurveTo(105, h - 56, 210, h - 70); g.stroke();
        for (let k = 0; k < 14; k++) { const lx = 6 + k * 15, ly = h - 70 + Math.sin(k / 13 * Math.PI) * 13; glowRect(g, '#ff2a4a', lx - 3, ly - 1, 6, 8); ell(g, lx, ly + 3, 2.4, 3.2, '#ff3a4a'); g.fillStyle = '#ffd070'; g.fillRect(lx - 0.5, ly + 1, 1, 4); }
        g.fillStyle = 'rgba(255,40,80,0.18)'; g.fillRect(0, h - 40, w, 40);
        txt(g, 'OUDE KERK', 86, h - 12, 1, '#ffe14a', '#3a0a1a');
      }],
      sc_we_ophaal: [150, 120, function (g, w, h, P) {
        const W = '#f4ecff';
        g.fillStyle = W; g.fillRect(14, h - 34, 4, 34); g.fillRect(132, h - 34, 4, 34);
        g.fillRect(0, h - 36, 40, 3); g.fillRect(110, h - 36, 40, 3);
        [[40, -1], [110, 1]].forEach(function (b) {
          const hx = b[0], s = b[1];
          g.fillStyle = W; g.fillRect(hx - 2 + (s > 0 ? -6 : 0), h - 100, 4, 66); g.fillRect(hx - 2 + (s > 0 ? -6 : 0) + 8 * -s * 0, h - 100, 4, 66);
          g.save(); g.translate(hx, h - 36); g.rotate(s * -1.15); g.fillStyle = '#e8e0f8'; g.fillRect(s > 0 ? -34 : 0, -3, 34, 4);
          g.fillStyle = '#5a4a8a'; for (let k = 0; k < 34; k += 4) g.fillRect((s > 0 ? -34 : 0) + k, -5, 0.8, 2); g.restore();
          g.save(); g.translate(hx + (s > 0 ? -4 : 0), h - 100); g.fillStyle = W; g.fillRect(s > 0 ? 0 : -30, 0, 34, 3); g.restore();
          line(g, hx + s * -30, h - 98, hx + s * -30 + s * 6, h - 64, 0.6, '#14082a');
        });
        for (let x = 4; x < 146; x += 6) lit(g, x, h - 39, 1.4, 1.4, '#ffe9a0');
        g.strokeStyle = '#ffe9a0'; g.lineWidth = 0.6; g.beginPath(); g.ellipse(75, h, 30, 22, 0, Math.PI, 0); g.stroke();
      }]
    },
    uksouth: {
      sc_uk_buckingham: [240, 110, function (g, w, h, P) {
        const f = silFill(g, h - 80, h, '#d8d0f0', '#6a5ab0');
        g.fillStyle = f; g.fillRect(6, h - 56, 228, 56); g.fillRect(90, h - 66, 60, 66);
        poly(g, [[86, h - 66], [120, h - 78], [154, h - 66]], f);
        for (let x = 94; x < 148; x += 7) { g.fillStyle = '#ffffff'; g.fillRect(x, h - 62, 2.4, 40); }
        for (let y = h - 50; y < h - 8; y += 14) for (let x = 12; x < 228; x += 10) { if (x > 88 && x < 152) continue; lit(g, x, y, 5, 9, P.win[(x + y) % 3]); }
        g.fillStyle = '#14082a'; g.fillRect(119.4, h - 96, 1.2, 18); g.fillStyle = '#c8102e'; g.fillRect(120.6, h - 96, 14, 9); g.fillStyle = '#ffd23f'; g.fillRect(124, h - 94, 6, 5); g.fillStyle = '#2a4ab8'; g.fillRect(126, h - 92, 4, 2);
        [24, 216].forEach(function (x) { g.fillStyle = '#c8102e'; g.fillRect(x - 5, h - 18, 10, 18); poly(g, [[x - 6, h - 18], [x, h - 24], [x + 6, h - 18]], '#14082a'); g.fillStyle = '#14082a'; g.fillRect(x - 2, h - 15, 4, 6); });
        g.fillStyle = '#ffd23f'; g.fillRect(118, h - 14, 4, 14); ell(g, 120, h - 18, 3, 4, '#ffd23f');
        g.fillStyle = '#14082a'; for (let x = 0; x < w; x += 4) g.fillRect(x, h - 8, 0.8, 8); g.fillRect(0, h - 8, w, 0.8);
      }],
      sc_uk_towerldn: [170, 140, function (g, w, h, P) {
        const f = silFill(g, h - 120, h, '#e0d8f8', '#6a5ab0');
        g.fillStyle = '#6a5a9a'; g.fillRect(0, h - 40, 170, 40); for (let x = 0; x < 170; x += 8) g.fillRect(x, h - 44, 5, 4);
        g.fillStyle = f; g.fillRect(40, h - 100, 90, 100);
        [[40, 1], [130, 0], [40, 0], [130, 1]].slice(0, 4).forEach(function (t, i) { const tx = i < 2 ? (i === 0 ? 44 : 126) : (i === 2 ? 70 : 100); g.fillStyle = f; g.fillRect(tx - 7, h - 122, 14, 22); if (i === 0 || i === 1) { g.beginPath(); g.ellipse(tx, h - 122, 7, 8, 0, Math.PI, 0); g.fill(); g.fillStyle = '#ffd23f'; g.fillRect(tx - 0.5, h - 134, 1, 5); } else { for (let k = -6; k < 7; k += 4) g.fillRect(tx + k, h - 126, 2.6, 4); } });
        for (let x = 46; x < 128; x += 6) g.fillRect(x, h - 104, 3.6, 4);
        for (let y = h - 90; y < h - 20; y += 18) for (let x = 52; x < 122; x += 14) { g.fillStyle = '#1a0a2a'; g.beginPath(); g.ellipse(x + 2.5, y, 2.5, 3, 0, Math.PI, 0); g.fill(); lit(g, x, y, 5, 9, P.win[(x + y) % 3]); }
        txt(g, 'TOWER OF LONDON', 40, h - 12, 1, '#ffe14a', '#1a0a3a');
      }]
    },
    australiaeast: {
      sc_au_bondi: [230, 100, function (g, w, h, P) {
        g.fillStyle = silFill(g, h - 60, h, '#f0e8ff', '#8a7ac8'); g.fillRect(130, h - 56, 96, 56);
        for (let y = h - 50; y < h - 10; y += 12) for (let x = 136; x < 222; x += 10) lit(g, x, y, 6, 7, P.win[(x + y) % 3]);
        g.fillStyle = '#2a8aff'; g.fillRect(130, h - 66, 96, 10); txt(g, 'ICEBERGS', 150, h - 64, 1, '#ffffff');
        g.fillStyle = '#c8c0e0'; g.fillRect(0, h - 18, 130, 18); g.fillStyle = '#27c8ff'; g.fillRect(6, h - 16, 118, 12);
        g.fillStyle = 'rgba(255,255,255,0.7)'; for (let x = 10; x < 120; x += 22) g.fillRect(x, h - 14, 1, 10);
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.moveTo(0, h - 18); for (let x = 0; x <= 130; x += 10) g.quadraticCurveTo(x + 5, h - 30 - (x % 20 ? 4 : 0), x + 10, h - 18); g.lineTo(0, h - 18); g.fill();
        palm(g, 120, h - 18, 60);
        txt(g, 'BONDI', 34, h - 46, 2, '#ffe14a', '#c8102e');
      }],
      sc_au_wharf: [220, 90, function (g, w, h, P) {
        for (let k = 0; k < 5; k++) { const x = 6 + k * 43; g.fillStyle = '#2a8a5a'; g.fillRect(x, h - 40, 38, 40); poly(g, [[x - 2, h - 40], [x + 19, h - 54], [x + 40, h - 40]], '#ffd23f'); txt(g, String(k + 2), x + 16, h - 34, 1, '#ffffff'); lit(g, x + 6, h - 22, 26, 8, P.win[k % 3]); }
        g.fillStyle = '#1a0a2a'; g.fillRect(0, h - 4, w, 4);
        txt(g, 'CIRCULAR QUAY', 60, h - 70, 1, '#ffe14a', '#1a0a3a');
      }]
    },
    japaneast: {
      sc_jp_shibuya: [190, 200, function (g, w, h, P) {
        g.fillStyle = silFill(g, h - 190, h, '#3a1a7a', '#1a0a40'); g.fillRect(10, h - 170, 90, 170); g.fillRect(100, h - 190, 80, 190);
        [[16, h - 160, 78, 46, '#27e0ff'], [106, h - 182, 68, 40, '#ff7ad9'], [106, h - 130, 68, 30, '#7dff7a']].forEach(function (s, i) {
          glowRect(g, s[4], s[0], s[1], s[2], s[3]); g.fillStyle = '#0a0a2a'; g.fillRect(s[0], s[1], s[2], s[3]);
          g.fillStyle = lg(g, s[0], s[1], s[0] + s[2], s[1] + s[3], [[0, s[4]], [1, '#2a0a5a']]); g.fillRect(s[0] + 2, s[1] + 2, s[2] - 4, s[3] - 4);
          if (i === 0) { msLogo(g, s[0] + 6, s[1] + 12, 20); txt(g, 'AZURE', s[0] + 32, s[1] + 18, 1, '#ffffff'); }
          if (i === 1) txt(g, 'COPILOT', s[0] + 12, s[1] + 16, 1, '#ffffff');
          if (i === 2) txt(g, 'XBOX', s[0] + 22, s[1] + 11, 1, '#0a2a0a');
        });
        const r = rng(531); for (let y = h - 100; y < h - 20; y += 8) for (let x = 16; x < 176; x += 7) if (r() < 0.4) lit(g, x, y, 4, 4, P.win[Math.floor(r() * 3)]);
        g.fillStyle = '#f4ecff'; for (let x = 0; x < w; x += 10) g.fillRect(x, h - 6, 6, 6);
      }],
      sc_jp_lanterns: [170, 110, function (g, w, h, P) {
        for (let k = 0; k < 4; k++) { const x = k * 42; g.fillStyle = silFill(g, h - 80, h, '#5a2a4a', '#2a0a2a'); g.fillRect(x, h - 70 - k % 2 * 10, 40, 70 + k % 2 * 10); poly(g, [[x - 3, h - 70 - k % 2 * 10], [x + 20, h - 82 - k % 2 * 10], [x + 43, h - 70 - k % 2 * 10]], '#2a1a3a'); g.fillStyle = '#ffd890'; g.fillRect(x + 6, h - 30, 28, 30); g.fillStyle = '#2a1a5a'; g.fillRect(x + 6, h - 30, 28, 8); }
        g.strokeStyle = '#14082a'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, h - 46); g.quadraticCurveTo(85, h - 36, 170, h - 46); g.stroke();
        for (let k = 0; k < 11; k++) { const x = 8 + k * 15, y = h - 46 + Math.sin(k / 10 * Math.PI) * 9; glowRect(g, '#ff3a3a', x - 4, y, 8, 10); ell(g, x, y + 5, 3.4, 4.6, '#ff2a2a'); g.fillStyle = '#1a0a0a'; g.fillRect(x - 3, y + 1, 6, 1); g.fillRect(x - 3, y + 9, 6, 1); }
      }]
    },
    brazilsouth: {
      sc_br_maracana: [260, 90, function (g, w, h, P) {
        g.fillStyle = silFill(g, h - 60, h, '#d8d0f0', '#6a5ab0'); g.beginPath(); g.ellipse(130, h - 10, 126, 50, 0, Math.PI, 0); g.fill(); g.fillRect(4, h - 10, 252, 10);
        g.fillStyle = '#f4ecff'; g.beginPath(); g.ellipse(130, h - 44, 120, 14, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#2a8a3a'; g.beginPath(); g.ellipse(130, h - 44, 90, 9, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(60,40,140,0.6)'; g.lineWidth = 0.8; for (let x = 12; x < 250; x += 9) { g.beginPath(); g.moveTo(x, h - 32 + Math.abs(x - 130) / 8); g.lineTo(x, h); g.stroke(); }
        [30, 230].forEach(function (x) { g.fillStyle = '#14082a'; g.fillRect(x, h - 86, 2, 40); g.fillStyle = '#ffffff'; g.fillRect(x - 6, h - 90, 14, 6); glowRect(g, '#ffffff', x - 6, h - 90, 14, 6); });
        txt(g, 'MARACANA', 106, h - 22, 1, '#ffe14a', '#1a0a3a');
      }],
      sc_br_copa: [220, 70, function (g, w, h, P) {
        g.fillStyle = '#f4ecff'; g.fillRect(0, h - 10, w, 10); g.fillStyle = '#14082a';
        for (let x = 0; x < w; x += 14) { g.beginPath(); g.moveTo(x, h - 10); g.quadraticCurveTo(x + 3.5, h - 4, x + 7, h - 7); g.quadraticCurveTo(x + 10.5, h - 10, x + 14, h - 4); g.lineTo(x + 14, h); g.quadraticCurveTo(x + 10.5, h - 6, x + 7, h - 3); g.quadraticCurveTo(x + 3.5, h, x, h - 6); g.fill(); }
        [[30, '#ff2a4a'], [90, '#ffd23f'], [150, '#2a8aff'], [200, '#3ac84a']].forEach(function (u) { g.fillStyle = '#ffffff'; g.fillRect(u[0] - 0.5, h - 34, 1, 24); g.fillStyle = u[1]; g.beginPath(); g.ellipse(u[0], h - 34, 14, 6, 0, Math.PI, 0); g.fill(); });
        g.fillStyle = '#2a8a5a'; g.fillRect(110, h - 30, 22, 20); poly(g, [[106, h - 30], [121, h - 40], [136, h - 30]], '#ffd23f'); txt(g, 'COCO', 110, h - 26, 0.5, '#ffffff');
        palm(g, 60, h - 10, 56); palm(g, 176, h - 10, 64);
        txt(g, 'COPACABANA', 70, h - 62, 1, '#ffe14a', '#c8102e');
      }]
    }
  };
  Object.keys(SC_EXTRA).forEach(function (r) { Object.keys(SC_EXTRA[r]).forEach(function (k) { SC[r][k] = SC_EXTRA[r][k]; }); });

  /* gameplay pull-up bridge (Amsterdam ophaalbrug): white gantry + liftable deck leaf */
  reg2('draw_leaf', 32, 10, function (g) {
    g.fillStyle = '#e8e0f8'; g.fillRect(0, 2, 32, 6); g.fillStyle = '#b8b0d8'; g.fillRect(0, 6, 32, 2);
    g.fillStyle = '#8a6a4a'; g.fillRect(0, 1, 32, 1.4); g.fillStyle = '#5a4a8a'; for (let x = 1; x < 32; x += 4) g.fillRect(x, 2.6, 0.7, 3.4);
    g.fillStyle = '#f4ecff'; g.fillRect(0, 0, 32, 0.8); for (let x = 2; x < 32; x += 8) g.fillRect(x, -0, 1, 2);
  }, { shade: 0.2, noOutline: true });
  reg2('draw_gantry', 44, 86, function (g) {
    const W = '#f4ecff';
    g.fillStyle = W; g.fillRect(4, 18, 4, 68); g.fillRect(36, 18, 4, 68); g.fillRect(0, 16, 44, 4);
    line(g, 6, 20, 38, 50, 1.1, W); line(g, 38, 20, 6, 50, 1.1, W);
    g.fillStyle = '#e8e0f8'; g.fillRect(2, 8, 40, 4); g.fillStyle = '#6a5a9a'; g.fillRect(2, 11, 40, 1);
    g.fillStyle = '#3a2a5a'; g.fillRect(30, 4, 12, 10);
    lit(g, 20, 0, 4, 4, '#ff2a4a');
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(36, 18, 4, 68);
  }, { shade: 0.25 });
  /* ---- ambient life: things that move in the background (planes, birds, balloons, traffic, balls, particles).
     Art faces LEFT (they travel right-to-left; the scene flips them for the other direction). */
  reg2('amb_plane', 72, 22, function (g) {
    poly(g, [[60, 9], [70, 1], [72, 1], [70, 11]], lg(g, 60, 0, 72, 12, [[0, '#2f6bff'], [1, '#0a2a8a']]));
    rrect(g, 4, 8, 66, 9, 4.4, lg(g, 0, 8, 0, 17, [[0, '#ffffff'], [0.6, '#d8e0f4'], [1, '#8a94c0']]));
    poly(g, [[4, 12.6], [0.4, 13.6], [4, 15.6]], '#c8d0ea');
    rrect(g, 5, 9.4, 4, 2.4, 1, '#14205a');
    for (let x = 12; x < 58; x += 3.2) ell(g, x, 11.4, 0.8, 0.9, '#2a4aa8');
    g.fillStyle = '#2f6bff'; g.fillRect(8, 14.4, 60, 1.2);
    msLogo(g, 63, 3.4, 4.4);
    txt(g, 'AZURE AIR', 24, 13.8, 0.4, '#2f6bff');
    poly(g, [[30, 14], [46, 14], [52, 21], [46, 21.4]], lg(g, 30, 14, 52, 21, [[0, '#a8b0d8'], [1, '#5a6290']]));
    rrect(g, 38, 17.4, 7, 3, 1.4, '#6a7298');
    poly(g, [[62, 13], [68, 13], [70, 17], [66, 17]], '#8a94c0');
    ell(g, 6.4, 16, 0.9, 0.9, '#ff2a4a'); ell(g, 70.6, 1.6, 0.9, 0.9, '#ffffff');
  }, { shade: 0.3 });
  for (let f = 0; f < 2; f++) reg2('amb_heli_' + f, 44, 20, function (g) {
    line(g, f ? 4 : 10, 2.4, f ? 40 : 34, 2.4, 1, '#14082a');
    rrect(g, 20, 2, 2, 4, 0.6, '#14082a');
    ell(g, 16, 11, 9, 6.4, lg(g, 8, 5, 24, 17, [[0, '#ff5a6a'], [1, '#9a1a3a']]));
    poly(g, [[22, 9], [40, 9.6], [40, 12], [22, 13.6]], '#c02a4a');
    poly(g, [[38, 5], [42, 5], [41, 12], [38, 12]], '#c02a4a');
    ell(g, 41, 9.6, 3, 3, 'rgba(255,255,255,0.35)');
    ell(g, 11.6, 9.4, 4.6, 3.6, lg(g, 7, 6, 15, 13, [[0, '#d8f4ff'], [1, '#4a8ac8']]));
    line(g, 8, 18.4, 24, 18.4, 1, '#14082a'); line(g, 12, 16, 11, 18.4, 0.8, '#14082a'); line(g, 20, 16, 21, 18.4, 0.8, '#14082a');
    ell(g, 6, 12, 1, 1, '#ffffff');
  }, { shade: 0.3 });
  [['#ff2a6a', '#ffd23f', '#ff7a2a'], ['#27e0ff', '#ffffff', '#2f6bff'], ['#7dff7a', '#ffe14a', '#c04bff'], ['#f25022', '#7fba00', '#00a4ef']].forEach(function (c, i) {
    reg2('amb_balloon_' + i, 28, 42, function (g) {
      g.save(); g.beginPath(); g.ellipse(14, 13, 12.6, 13, 0, 0, Math.PI * 2); g.clip();
      for (let k = 0; k < 7; k++) { g.fillStyle = c[k % 3]; g.beginPath(); g.ellipse(14, 13, 12.6 * (1 - k / 7), 13, 0, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(0, 8, 28, 2); g.fillStyle = 'rgba(10,6,40,0.25)'; g.fillRect(0, 18, 28, 2);
      g.restore();
      poly(g, [[4, 21], [24, 21], [18, 29], [10, 29]], c[0]);
      ell(g, 9, 7, 3, 4, 'rgba(255,255,255,0.4)');
      line(g, 10.4, 29, 11, 35, 0.5, '#2a1a3a'); line(g, 17.6, 29, 17, 35, 0.5, '#2a1a3a');
      rrect(g, 10, 34.6, 8, 6, 1, lg(g, 0, 35, 0, 41, [[0, '#c8864a'], [1, '#5a3020']]));
      if (i === 3) msLogo(g, 10.2, 9.4, 7.6);
      ell(g, 14, 31.4, 1.6, 1.6, 'rgba(255,200,80,0.8)');
    }, { shade: 0.35 });
  });
  reg2('amb_blimp', 96, 32, function (g) {
    ell(g, 48, 14, 44, 12.6, lg(g, 0, 2, 0, 27, [[0, '#f4f4ff'], [0.5, '#b8bcd8'], [1, '#5a5e88']]));
    poly(g, [[82, 12], [95, 2], [95, 12]], '#107c10'); poly(g, [[82, 16], [95, 26], [95, 16]], '#107c10');
    rrect(g, 38, 24, 20, 6, 2, '#3a3e60'); for (let x = 41; x < 56; x += 4) lit(g, x, 25.4, 2.4, 2.6, '#ffe9a0');
    ell(g, 22, 14, 7.4, 7.4, lg(g, 15, 7, 29, 21, [[0, '#7dff7a'], [1, '#107c10']]));
    line(g, 18.4, 10.2, 25.6, 17.8, 1.8, '#ffffff'); line(g, 25.6, 10.2, 18.4, 17.8, 1.8, '#ffffff');
    txt(g, 'XBOX', 34, 8.6, 1, '#107c10');
    txt(g, 'GAME PASS', 34, 16, 0.5, '#2a2e50');
  }, { shade: 0.3 });
  const AMB_BIRDS = {
    gull: ['#ffffff', '#c8c8e0', '#ffb030'], pigeon: ['#9a98c0', '#5a587a', '#ff9a6a'], parrot: ['#ff3a3a', '#2a8aff', '#ffd23f'],
    crow: ['#2a2a4a', '#10102a', '#3a3a5a'], cockatoo: ['#ffffff', '#d8d8ee', '#ffd23f'], crane: ['#ffffff', '#20203a', '#ff2a3a']
  };
  Object.keys(AMB_BIRDS).forEach(function (k) {
    const c = AMB_BIRDS[k];
    for (let f = 0; f < 2; f++) reg2('amb_bird_' + k + '_' + f, 16, 12, function (g) {
      const u = f ? -4.4 : 3.6;
      poly(g, [[7, 6.4], [9.4, 6.2], [5, 6 + u], [3.4, 6.4 + u * 0.8]], c[1]);
      ell(g, 8, 7, 4.6, 1.8, c[0]);
      poly(g, [[12, 7], [15, 7.6], [12, 8.2]], c[2]);
      ell(g, 3.6, 7, 1.8, 1, c[1]);
      poly(g, [[7.6, 6.6], [10.4, 6.4], [12, 6 + u], [9.4, 5.8 + u * 0.7]], c[0]);
      if (k === 'crane') ell(g, 3, 3, 1, 1, c[2]);
      ell(g, 11.6, 6.4, 0.5, 0.5, '#0a0620');
    }, { shade: 0.2 });
  });
  function carBody(g, w, h, top, bot, roofX0, roofX1, roofY, glass) {
    poly(g, [[1, h - 9], [3, h - 13], [roofX0, h - 13], [roofX0 + 4, roofY], [roofX1 - 3, roofY], [roofX1, h - 13], [w - 3, h - 12], [w - 1, h - 9], [w - 1, h - 5], [1, h - 5]], lg(g, 0, roofY, 0, h - 4, [[0, top], [1, bot]]));
    poly(g, [[roofX0 + 2, h - 13], [roofX0 + 5, roofY + 1.6], [roofX1 - 4, roofY + 1.6], [roofX1 - 1.4, h - 13]], glass || 'rgba(160,210,255,0.85)');
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(3, h - 12.4, w - 6, 0.6);
    ell(g, 1.8, h - 9.4, 1.2, 1, '#fff6c0'); glowRect(g, '#fff6c0', -2, h - 12, 6, 5); ell(g, w - 1.6, h - 9, 1, 1.2, '#ff2a4a');
  }
  function wheels(g, xs, y, r) { xs.forEach(function (x) { ell(g, x, y, r, r, '#0a0614'); ell(g, x, y, r * 0.45, r * 0.45, '#b8b8d8'); }); }
  const CARS = {
    taxi: [46, 20, function (g, w, h) { carBody(g, w, h, '#ffe14a', '#d89a10', 12, 34, 4); rrect(g, 19, 1.4, 9, 3, 1, '#14082a'); txt(g, 'TAXI', 20, 1.8, 0.4, '#ffe14a'); g.fillStyle = '#14082a'; for (let x = 4; x < 42; x += 4) g.fillRect(x, h - 8, 2, 1.2); wheels(g, [10, 36], h - 4, 4); }],
    pickup: [56, 24, function (g, w, h) { carBody(g, w, h, '#c8202a', '#5a0a14', 8, 26, 4); g.fillStyle = '#5a0a14'; g.fillRect(28, h - 15, 26, 3); g.fillStyle = '#d8d8e8'; g.fillRect(0, h - 7, 6, 2); g.fillRect(w - 5, h - 7, 5, 2); wheels(g, [11, 44], h - 4.4, 5); }],
    muscle: [50, 18, function (g, w, h) { carBody(g, w, h, '#2a4aff', '#0a1460', 16, 34, 4); g.fillStyle = '#ffffff'; g.fillRect(2, h - 11, w - 4, 1.2); g.fillRect(2, h - 9, w - 4, 1.2); wheels(g, [10, 40], h - 4, 4.2); }],
    schoolbus: [78, 30, function (g, w, h) { rrect(g, 1, 2, w - 2, h - 8, 3, lg(g, 0, 2, 0, h - 6, [[0, '#ffe14a'], [1, '#d88a00']])); for (let x = 12; x < w - 6; x += 9) { g.fillStyle = '#14082a'; g.fillRect(x, 5, 7, 7); lit(g, x + 0.5, 5.5, 6, 6, '#c8e8ff'); } g.fillStyle = '#14082a'; g.fillRect(1, 15, w - 2, 1); g.fillRect(2, 4, 6, 12); txt(g, 'SCHOOL BUS', 20, 17, 0.5, '#14082a'); ell(g, 2, 19, 1.2, 1.2, '#fff6c0'); wheels(g, [14, 62], h - 5, 5); }],
    redbus: [62, 34, function (g, w, h) { rrect(g, 1, 1, w - 2, h - 7, 3, lg(g, 0, 1, 0, h - 6, [[0, '#ff5a5a'], [1, '#8a0a1a']])); for (let r = 0; r < 2; r++) for (let x = 5; x < w - 6; x += 8) { g.fillStyle = '#1a0a2a'; g.fillRect(x, 4 + r * 12, 6, 6); lit(g, x + 0.5, 4.5 + r * 12, 5, 5, '#ffe9c0'); } g.fillStyle = '#ffe9c0'; g.fillRect(1, 13, w - 2, 0.8); wheels(g, [12, 50], h - 5, 4.6); }],
    cab: [42, 20, function (g, w, h) { carBody(g, w, h, '#4a4a6a', '#0a0a18', 9, 30, 3); rrect(g, 17, 0.6, 7, 2.6, 1, '#ffd23f'); wheels(g, [9, 33], h - 4, 4); }],
    mini: [34, 18, function (g, w, h) { carBody(g, w, h, '#7fe8ff', '#2a8aa8', 7, 26, 3, 'rgba(230,250,255,0.85)'); ell(g, 17, 9, 2, 2, '#ffffff'); wheels(g, [8, 26], h - 4, 3.6); }],
    citroen: [38, 20, function (g, w, h) { poly(g, [[2, h - 6], [3, h - 11], [10, h - 13], [13, 4], [26, 3], [33, h - 12], [37, h - 10], [37, h - 6]], lg(g, 0, 3, 0, h, [[0, '#ff8ab8'], [1, '#a82a6a']])); poly(g, [[14, 5.4], [25, 4.6], [30, h - 12], [12, h - 12]], 'rgba(200,230,255,0.85)'); line(g, 21, 5, 21, h - 12, 0.8, '#a82a6a'); wheels(g, [9, 30], h - 4.4, 3.8); }],
    vespa: [24, 20, function (g) { ell(g, 15, 13, 6.4, 3.6, '#ff3a3a'); poly(g, [[4, 6], [7, 6], [8, 15], [5, 15]], '#ff3a3a'); line(g, 3, 5, 8, 5, 1, '#14082a'); ell(g, 13, 7, 3, 3.4, '#2a1a3a'); ell(g, 13.6, 3.6, 2.6, 2.6, '#ffffff'); rrect(g, 11, 2.6, 5, 1.6, 0.8, '#7fe8ff'); wheels(g, [5, 19], 17, 3); }],
    tram: [112, 42, function (g, w) {
      rrect(g, 1, 10, w - 2, 25, 4, lg(g, 0, 10, 0, 35, [[0, '#f3f5ef'], [1, '#afbfc7']]));
      g.fillStyle = '#1967b2'; g.fillRect(2, 29, w - 4, 5);
      for (let x = 6; x < w - 9; x += 13) { rrect(g, x, 14, 10, 12, 1, '#182b42'); lit(g, x + 1, 15, 8, 9, '#c2dfe5'); }
      [24, 76].forEach((x) => { g.fillStyle = '#2178bc'; g.fillRect(x, 13, 12, 21); line(g, x + 6, 15, x + 6, 33, 0.6, '#dcecf4'); });
      g.fillStyle = '#384851'; g.fillRect(52, 11, 6, 23); for (let x = 53; x < 58; x += 1.5) line(g, x, 12, x, 32, 0.5, '#9aa5a5');
      line(g, 39, 10, 49, 3, 1.1, '#263c51'); line(g, 49, 3, 60, 10, 1.1, '#263c51'); line(g, 44, 2, 56, 2, 1, '#263c51');
      rrect(g, 84, 11, 21, 4, 1, '#142935'); txt(g, 'CENTRAAL', 86, 11.6, 0.36, '#ffd672');
      txt(g, 'AMSTERDAM', 6, 30, 0.45, '#ffffff'); wheels(g, [15, 42, 69, 97], 37, 3.7);
      ell(g, 4, 29, 1.6, 1.2, '#fff0bd');
    }],
    outback4x4: [62, 31, function (g) { g.save(); g.scale(62 / 88, 62 / 88); outback4x4(g); g.restore(); }],
    cyclist: [26, 24, function (g) { [[5, 19], [21, 19]].forEach((wv) => { g.lineWidth = 1.2; g.strokeStyle = '#14062a'; g.beginPath(); g.arc(wv[0], wv[1], 4.4, 0, 7); g.stroke(); }); line(g, 5, 19, 12, 12, 1.2, '#ff7a2a'); line(g, 12, 12, 19, 12, 1.2, '#ff7a2a'); line(g, 12, 12, 14, 19, 1.2, '#ff7a2a'); line(g, 19, 12, 21, 19, 1.2, '#ff7a2a'); limb(g, 14, 9, 13, 16, 2.4, '#2a3a8a', '#3a5ad8'); limb(g, 13, 4, 15, 10, 4, '#ff4fa0', '#ff8ac8'); line(g, 12, 5, 7, 10, 1.4, '#ffd2ad'); ell(g, 12.6, 1.8, 2.2, 2.2, '#c98a66'); ell(g, 12.6, 0.8, 2.4, 1.4, '#ffe14a'); }]
  };
  Object.keys(CARS).forEach(function (k) { reg2('amb_car_' + k, CARS[k][0], CARS[k][1], function (g, w, h) { CARS[k][2](g, w, h); }, { shade: 0.35 }); });
  function commuterTrain(g, dutch) {
    const body = dutch ? '#f5cb3d' : '#c8d6db', stripe = dutch ? '#23538d' : '#ed8a24';
    for (let car = 0; car < 2; car++) {
      const x = car * 124;
      rrect(g, x + 2, 5, 119, 32, 6, lg(g, 0, 5, 0, 37, [[0, dutch ? '#ffe46b' : '#f1f3eb'], [0.5, body], [1, dutch ? '#c08e21' : '#7b8b94']]));
      g.fillStyle = stripe; g.fillRect(x + 4, dutch ? 12 : 29, 114, dutch ? 13 : 4);
      for (let win = 0; win < 6; win++) { const wx = x + 13 + win * 16; rrect(g, wx, 14, 11, 9, 1, '#19354b'); lit(g, wx + 1, 15, 9, 6, '#b7d9de'); }
      [29, 92].forEach((dx) => {
        g.fillStyle = dutch ? '#e5b72c' : '#9baab0'; g.fillRect(x + dx, 10, 13, 25);
        lit(g, x + dx + 2, 14, 9, 11, '#b2d8de'); line(g, x + dx + 6.5, 12, x + dx + 6.5, 34, 0.7, '#4e616a');
      });
      wheels(g, [x + 25, x + 99], 40, 4);
      line(g, x + 42, 5, x + 49, 0, 0.8, '#364e5d'); line(g, x + 49, 0, x + 57, 5, 0.8, '#364e5d');
      txt(g, dutch ? 'AMSTERDAM' : 'GINZA LINE G01', x + 47, 7, 0.46, '#19384e');
      lit(g, x + 4, 13, 6, 12, '#a6cfdf'); ell(g, x + 5, 31, 1.5, 1, '#fff6b8');
    }
    g.fillStyle = '#344654'; g.fillRect(121, 13, 5, 21);
  }
  reg2('amb_train_nltrain', 248, 46, (g) => commuterTrain(g, true), { shade: 0.25 });
  reg2('amb_train_tokyometro', 248, 46, (g) => commuterTrain(g, false), { shade: 0.25 });
  reg2('amb_rail', 128, 22, function (g) {
    g.fillStyle = '#526674'; g.fillRect(0, 1, 128, 4);
    line(g, 0, 0.5, 128, 0.5, 0.8, '#87969a');
    for (let x = 4; x < 128; x += 8) line(g, x, 0, x + 2, 3, 0.7, '#455968');
    g.fillStyle = lg(g, 0, 5, 0, 22, [[0, '#697d85'], [1, '#455d6c']]); g.fillRect(60, 5, 5, 17);
    poly(g, [[55, 5], [70, 5], [65, 10], [60, 10]], '#596f7b');
    line(g, 61, 10, 61, 22, 0.6, '#819298');
  }, FLAT);
  reg2('amb_football', 10, 6, function (g) { ell(g, 5, 3, 4.6, 2.6, lg(g, 0, 0, 0, 6, [[0, '#c8682a'], [1, '#5a2a10']])); line(g, 3, 3, 7, 3, 0.5, '#ffffff'); [4, 5, 6].forEach((x) => line(g, x, 2.4, x, 3.6, 0.4, '#ffffff')); }, { shade: 0.2 });
  reg2('amb_baseball', 6, 6, function (g) { ell(g, 3, 3, 2.6, 2.6, '#ffffff'); g.strokeStyle = '#ff2a3a'; g.lineWidth = 0.4; g.beginPath(); g.arc(0.6, 3, 1.8, -1, 1); g.stroke(); g.beginPath(); g.arc(5.4, 3, 1.8, 2.1, 4.2); g.stroke(); }, { shade: 0.2 });
  reg2('amb_petal', 5, 4, function (g) { ell(g, 2.5, 2, 2.2, 1.4, '#ffc0dc', 0.4); ell(g, 2, 1.6, 0.8, 0.5, '#ffffff'); }, FLAT);
  reg2('amb_leaf', 6, 5, function (g) { ell(g, 3, 2.5, 2.6, 1.6, '#ff8a2a', -0.5); line(g, 1, 4, 5, 1, 0.3, '#8a3a10'); }, FLAT);
  reg2('amb_confetti', 3, 3, function (g) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 3, 3); }, FLAT);
  // far-bank boulevard the background traffic drives on (tiles horizontally)
  reg2('amb_road', 64, 8, function (g) {
    g.fillStyle = '#748793'; g.fillRect(0, 0, 64, 1);
    g.fillStyle = lg(g, 0, 1, 0, 6, [[0, '#455b6d'], [1, '#344858']]); g.fillRect(0, 1, 64, 5);
    g.fillStyle = '#8c9b9d'; for (let x = 3; x < 64; x += 20) g.fillRect(x, 3.4, 6, 0.5);
    g.fillStyle = '#5c7180'; g.fillRect(0, 6, 64, 2);
  }, FLAT);
  reg2('amb_trail', 8, 2, function (g) { g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(0, 0, 8, 2); }, FLAT);

  {
  const R = 'italynorth';
  const IT = {
    top: '#8b3c58', bot: '#412349', accent: '#ffc36b',
    win: ['#ffe6a0', '#ffad62', '#b9f4e5']
  };
  SKIES[R] = {
    stops: [[0, '#170c39'], [0.3, '#4d236e'], [0.54, '#ad4a78'], [0.74, '#ec855e'], [0.9, '#ffc16e'], [1, '#ffe0a0']],
    sun: { x: 430, y: 212, r: 68, c: ['#fff8bc', '#ffc565', '#ed7765'] },
    halo: ['rgba(255,204,120,0.58)', 'rgba(255,110,135,0.2)'],
    cl: ['rgba(123,67,133,0.5)', 'rgba(255,170,151,0.6)', 'rgba(255,220,171,0.48)'],
    hz: 'rgba(255,193,113,0.48)', stars: 92, seed: 29
  };
  reg2('bg_sky_' + R, 640, 360, makeSky(SKIES[R]), FLAT);
  PAL[R] = IT;

  function italyHouses(g, w, h, near) {
    const colors = ['#d66e53', '#e4a45e', '#be5e68', '#e5c080', '#b95252', '#d98967'];
    const r = rng(414 + (near ? 1 : 0));
    for (let x = -8, i = 0; x < w + 10; i++) {
      const bw = 34 + r() * 30, bh = (near ? 36 : 24) + r() * (near ? 55 : 36), y = h - bh;
      g.fillStyle = colors[i % colors.length]; g.fillRect(x, y, bw, bh);
      poly(g, [[x - 3, y], [x + bw * 0.5, y - 10 - r() * 8], [x + bw + 3, y]], i % 2 ? '#7a3545' : '#963e43');
      g.fillStyle = 'rgba(255,221,167,0.24)'; g.fillRect(x + 2, y + 2, 2, bh - 2);
      for (let wy = y + 9; wy < h - 7; wy += 13) for (let wx = x + 7; wx < x + bw - 4; wx += 13) {
        g.fillStyle = '#653047'; g.fillRect(wx - 1, wy - 1, 7, 9); lit(g, wx, wy, 5, 7, IT.win[(i + wx) % 3]);
        g.fillStyle = '#6f3642'; g.fillRect(wx - 1, wy + 6, 7, 1);
      }
      if (i % 3 === 1) { g.fillStyle = '#3e2342'; g.fillRect(x + bw * 0.44, h - 22, 8, 22); ell(g, x + bw * 0.5, h - 22, 4, 4, '#3e2342'); }
      x += bw - 1;
    }
  }
  function cypress(g, x, base, s, pot) {
    g.fillStyle = '#71394a'; g.fillRect(x - 1.5 * s, base - 34 * s, 3 * s, 34 * s);
    for (let j = 0; j < 5; j++) {
      const yy = base - (8 + j * 6) * s, ww = (10 - j * 1.15) * s;
      poly(g, [[x, yy - 10 * s], [x - ww, yy + 2 * s], [x + ww, yy + 2 * s]], j % 2 ? '#28644c' : '#347659');
      line(g, x, yy - 8 * s, x, yy + 1 * s, 0.7 * s, 'rgba(175,213,151,0.5)');
    }
    poly(g, [[x - 8 * s, base - 5 * s], [x + 8 * s, base - 5 * s], [x + 6 * s, base], [x - 6 * s, base]], pot || '#a94f3f');
    g.fillStyle = '#efb175'; g.fillRect(x - 7 * s, base - 5 * s, 14 * s, 1.2 * s);
  }
  function drawColosseum(g, cx, base, s, P) {
    const c = silFill(g, base - 60 * s, base, '#e8b17a', '#8b4b50');
    g.fillStyle = c; g.fillRect(cx - 36 * s, base - 48 * s, 72 * s, 48 * s);
    for (let tier = 0; tier < 3; tier++) {
      const y = base - (46 - tier * 14) * s; g.fillStyle = tier === 2 ? '#d9a06d' : '#bd765e';
      g.fillRect(cx - 37 * s, y, 74 * s, 12 * s);
      for (let i = 0; i < 7; i++) {
        const x = cx - 31 * s + i * 10.2 * s;
        g.fillStyle = '#653b4a'; g.fillRect(x, y + 2 * s, 5.6 * s, 9 * s);
        ell(g, x + 2.8 * s, y + 2.1 * s, 2.8 * s, 2.8 * s, '#653b4a');
        line(g, x - 1 * s, y + 11 * s, x + 7 * s, y + 11 * s, 0.9 * s, '#f2c586');
      }
      g.fillStyle = 'rgba(255,222,170,0.55)'; g.fillRect(cx - 37 * s, y + 11 * s, 74 * s, 1.2 * s);
    }
    g.fillStyle = '#79505a'; g.fillRect(cx + 18 * s, base - 62 * s, 18 * s, 14 * s);
    poly(g, [[cx + 16 * s, base - 62 * s], [cx + 29 * s, base - 72 * s], [cx + 38 * s, base - 60 * s]], '#a7554e');
    g.fillStyle = '#a15c52'; g.fillRect(cx - 39 * s, base - 1.2 * s, 80 * s, 2 * s);
  }
  function drawPisa(g, cx, base, s, P) {
    g.save(); g.translate(cx, base); g.rotate(-0.15);
    g.fillStyle = '#e5d0aa'; g.fillRect(-10 * s, -67 * s, 20 * s, 67 * s);
    for (let k = 0; k < 6; k++) {
      const y = -63 * s + k * 10.4 * s;
      g.fillStyle = k % 2 ? '#d0b38c' : '#f2dfbd'; g.fillRect(-12 * s, y, 24 * s, 3.2 * s);
      for (let j = 0; j < 4; j++) { const x = (-8 + j * 5.2) * s; g.fillStyle = '#977b72'; g.fillRect(x, y + 3.4 * s, 2.2 * s, 5.2 * s); ell(g, x + 1.1 * s, y + 3.5 * s, 1.1 * s, 1.1 * s, '#977b72'); }
      g.fillStyle = '#f2dfbd'; g.fillRect(-13 * s, y + 8 * s, 26 * s, 2 * s);
    }
    g.fillStyle = '#ad675d'; g.fillRect(-9 * s, -72 * s, 18 * s, 5 * s);
    ell(g, 0, -72 * s, 8 * s, 5 * s, '#e8d5b3');
    g.fillStyle = '#c9ae8b'; g.fillRect(-15 * s, -1.5 * s, 30 * s, 2 * s);
    g.restore();
  }
  function drawDuomo(g, cx, base, s, P) {
    const stone = lg(g, cx - 40 * s, base - 72 * s, cx + 42 * s, base, [[0, '#fff1d2'], [0.5, '#d6c6b7'], [1, '#a78e91']]);
    g.fillStyle = stone; g.fillRect(cx - 37 * s, base - 35 * s, 74 * s, 35 * s);
    for (let k = 0; k < 5; k++) {
      const x = cx - 33 * s + k * 16 * s;
      g.fillStyle = '#967f86'; g.fillRect(x, base - 29 * s, 5 * s, 13 * s); ell(g, x + 2.5 * s, base - 29 * s, 2.5 * s, 2.5 * s, '#967f86');
      line(g, x - 2 * s, base - 31 * s, x + 7 * s, base - 31 * s, 1.1 * s, '#f6e5c5');
      poly(g, [[x - 2 * s, base - 35 * s], [x + 2.5 * s, base - 44 * s], [x + 7 * s, base - 35 * s]], '#e6d4c2');
    }
    poly(g, [[cx - 30 * s, base - 36 * s], [cx - 20 * s, base - 47 * s], [cx - 10 * s, base - 36 * s]], '#e8d7c6');
    poly(g, [[cx + 10 * s, base - 36 * s], [cx + 20 * s, base - 47 * s], [cx + 30 * s, base - 36 * s]], '#e8d7c6');
    g.fillStyle = '#f3e5cf'; g.fillRect(cx - 2 * s, base - 55 * s, 4 * s, 20 * s);
    for (let k = 0; k < 5; k++) {
      const x = cx - 30 * s + k * 15 * s, top = base - (53 + (k === 2 ? 19 : 0)) * s;
      line(g, x, base - 34 * s, x, top + 4 * s, 1.2 * s, '#f1dfca');
      poly(g, [[x - 3 * s, top + 5 * s], [x, top], [x + 3 * s, top + 5 * s]], '#fff0d6');
      ell(g, x, top + 5 * s, 1.4 * s, 1.4 * s, '#d58a70');
    }
    line(g, cx, base - 75 * s, cx, base - 70 * s, 1 * s, '#fff1d0');
    g.fillStyle = '#fff0d8'; g.fillRect(cx - 39 * s, base - 2 * s, 78 * s, 2 * s);
  }
  function drawStMarks(g, cx, base, s, P) {
    const stone = lg(g, cx - 46 * s, base - 55 * s, cx + 46 * s, base, [[0, '#e9c696'], [0.6, '#bd8b69'], [1, '#795064']]);
    g.fillStyle = stone; g.fillRect(cx - 44 * s, base - 34 * s, 88 * s, 34 * s);
    for (let i = 0; i < 5; i++) {
      const x = cx - 37 * s + i * 18 * s;
      g.fillStyle = '#70445a'; g.fillRect(x, base - 26 * s, 10 * s, 26 * s); ell(g, x + 5 * s, base - 26 * s, 5 * s, 5 * s, '#70445a');
      line(g, x - 2 * s, base - 31 * s, x + 12 * s, base - 31 * s, 1.5 * s, '#f4d5a5');
      ell(g, x + 5 * s, base - 42 * s, 4 * s, 4 * s, i % 2 ? '#d8a777' : '#f1d4a0');
    }
    poly(g, [[cx - 46 * s, base - 34 * s], [cx, base - 57 * s], [cx + 46 * s, base - 34 * s]], '#dca978');
    for (let i = 0; i < 4; i++) poly(g, [[cx - 31 * s + i * 20 * s, base - 38 * s], [cx - 24 * s + i * 20 * s, base - 50 * s], [cx - 17 * s + i * 20 * s, base - 38 * s]], '#f1d6ac');
    g.fillStyle = '#c04742'; g.fillRect(cx + 47 * s, base - 66 * s, 13 * s, 66 * s);
    for (let y = base - 60 * s; y < base - 3 * s; y += 12 * s) { g.fillStyle = '#e2b27d'; g.fillRect(cx + 45 * s, y, 17 * s, 2 * s); }
    g.fillStyle = '#9b514b'; g.fillRect(cx + 45 * s, base - 69 * s, 17 * s, 4 * s);
    poly(g, [[cx + 46 * s, base - 69 * s], [cx + 53 * s, base - 79 * s], [cx + 61 * s, base - 69 * s]], '#d8a26f');
    line(g, cx + 53 * s, base - 84 * s, cx + 53 * s, base - 79 * s, 1 * s, '#ffe0a0');
  }
  function drawRialto(g, x, base, w, s, P) {
    g.fillStyle = '#bc8062'; g.fillRect(x, base - 15 * s, w, 15 * s);
    poly(g, [[x, base - 15 * s], [x + w * .5, base - 50 * s], [x + w, base - 15 * s]], '#d8a077');
    g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(x + w * .5, base - 3 * s, w * .28, 17 * s, 0, Math.PI, 0); g.fill(); g.restore();
    g.fillStyle = '#e9be8c'; g.fillRect(x - 2 * s, base - 19 * s, w + 4 * s, 5 * s);
    for (let j = 0; j < 5; j++) {
      const bx = x + 4 * s + j * (w - 8 * s) / 5;
      g.fillStyle = j % 2 ? '#c65048' : '#e5a56d'; g.fillRect(bx, base - 34 * s, 12 * s, 15 * s);
      poly(g, [[bx - 1 * s, base - 34 * s], [bx + 6 * s, base - 40 * s], [bx + 13 * s, base - 34 * s]], '#a34947');
      lit(g, bx + 3 * s, base - 29 * s, 5 * s, 7 * s, IT.win[j % 3]);
    }
    line(g, x + 3 * s, base - 20 * s, x + w - 3 * s, base - 20 * s, 1.2 * s, '#f8deb4');
    for (let px = x + 3 * s; px < x + w; px += 7 * s) line(g, px, base - 19 * s, px, base - 24 * s, 0.7 * s, '#74495a');
  }
  function drawTrevi(g, cx, base, s, P) {
    const stone = lg(g, cx - 44 * s, base - 60 * s, cx + 44 * s, base, [[0, '#f4ddba'], [0.5, '#c6a889'], [1, '#806079']]);
    g.fillStyle = stone; g.fillRect(cx - 42 * s, base - 42 * s, 84 * s, 42 * s);
    g.fillStyle = '#e5ccaa'; g.fillRect(cx - 47 * s, base - 45 * s, 94 * s, 4 * s);
    poly(g, [[cx - 45 * s, base - 45 * s], [cx, base - 63 * s], [cx + 45 * s, base - 45 * s]], '#d1b18f');
    g.fillStyle = '#7ce5d2'; g.fillRect(cx - 34 * s, base - 13 * s, 68 * s, 13 * s);
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(cx - 32 * s, base - 12 * s, 64 * s, 1.3 * s);
    for (let side of [-1, 1]) {
      g.fillStyle = '#a78a84'; g.fillRect(cx + side * 26 * s - 5 * s, base - 37 * s, 10 * s, 24 * s);
      ell(g, cx + side * 26 * s, base - 37 * s, 5 * s, 5 * s, '#a78a84');
      poly(g, [[cx + side * 26 * s - 7 * s, base - 42 * s], [cx + side * 26 * s, base - 48 * s], [cx + side * 26 * s + 7 * s, base - 42 * s]], '#e7cfaf');
      ell(g, cx + side * 26 * s, base - 8 * s, 4 * s, 2 * s, '#9cf6df');
    }
    ell(g, cx, base - 40 * s, 9 * s, 13 * s, '#c69983');
    ell(g, cx, base - 54 * s, 6 * s, 7 * s, '#e5c6a6');
    poly(g, [[cx - 4 * s, base - 55 * s], [cx + 3 * s, base - 58 * s], [cx + 7 * s, base - 49 * s], [cx + 3 * s, base - 45 * s]], '#a1837c');
    for (let j = 0; j < 3; j++) { g.fillStyle = 'rgba(118,240,222,0.8)'; g.fillRect(cx - (10 + j * 4) * s, base - (21 + j * 4) * s, 2 * s, 8 * s); }
  }
  function drawFlorence(g, cx, base, s, P) {
    const stone = lg(g, cx - 40 * s, base - 58 * s, cx + 40 * s, base, [[0, '#fff0d0'], [0.5, '#dbbf9c'], [1, '#916579']]);
    g.fillStyle = stone; g.fillRect(cx - 35 * s, base - 24 * s, 70 * s, 24 * s);
    for (let i = 0; i < 5; i++) { const x = cx - 28 * s + i * 14 * s; g.fillStyle = '#8b5a66'; g.fillRect(x, base - 18 * s, 5 * s, 12 * s); ell(g, x + 2.5 * s, base - 18 * s, 2.5 * s, 2.5 * s, '#8b5a66'); }
    ell(g, cx, base - 45 * s, 31 * s, 19 * s, '#b95e47');
    g.fillStyle = '#cb7351'; g.fillRect(cx - 31 * s, base - 47 * s, 62 * s, 5 * s);
    for (let i = 0; i < 11; i++) { const x = cx - 27 * s + i * 5.4 * s; line(g, x, base - 47 * s, x + (x - cx) * .1, base - (55 - Math.abs(x - cx) * .14) * s, 0.9 * s, '#f0b77b'); }
    ell(g, cx, base - 57 * s, 13 * s, 7 * s, '#c76a4a');
    g.fillStyle = '#f3dfbd'; g.fillRect(cx - 7 * s, base - 64 * s, 14 * s, 5 * s);
    poly(g, [[cx - 6 * s, base - 64 * s], [cx, base - 71 * s], [cx + 6 * s, base - 64 * s]], '#d88963');
    line(g, cx, base - 76 * s, cx, base - 70 * s, 1 * s, '#fff0d0');
  }

  reg2('bg_far_' + R, 640, 220, function (g, w, h) {
    skyline(w, h, 301, '#54305b', IT.accent, 24, 58, 0.18, IT.win)(g);
    const base = h - 5;
    drawColosseum(g, 100, base, 0.66, IT);
    drawPisa(g, 295, base, 0.72, IT);
    drawDuomo(g, 465, base, 0.66, IT);
    drawFlorence(g, 585, base, 0.64, IT);
    g.fillStyle = 'rgba(255,195,118,0.16)'; g.fillRect(0, h - 16, w, 16);
  }, FLAT);
  reg2('bg_farp_' + R, 640, 220, function (g, w, h) {
    const base = h - 4;
    g.fillStyle = '#54375b';
    poly(g, [[0, base], [0, 152], [90, 133], [170, 155], [265, 126], [355, 151], [455, 131], [550, 157], [640, 136], [640, base]], '#59405f');
    g.fillStyle = '#6d4b68';
    poly(g, [[0, base], [0, 177], [120, 157], [230, 177], [360, 152], [500, 177], [640, 156], [640, base]], '#6b4c62');
    for (let x = 35; x < 640; x += 125) cypress(g, x, base - 5, 0.8, '#75404a');
    italyHouses(g, w, h, false);
    g.fillStyle = '#51334f'; for (let x = 0; x < w; x += 22) g.fillRect(x, base - 2, 12, 2);
  }, FLAT);
  reg2('bg_near_' + R, 640, 190, function (g, w, h) {
    italyHouses(g, w, h, true);
    for (let x = 25; x < 640; x += 118) {
      g.fillStyle = '#382543'; g.fillRect(x, h - 48, 2, 48);
      ell(g, x + 1, h - 47, 7, 5, '#315845'); ell(g, x + 1, h - 54, 5, 5, '#3a6a4c');
    }
    g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, 'rgba(239,135,104,0)'], [1, 'rgba(239,135,104,0.28)']]); g.fillRect(0, h - 26, w, 26);
  }, FLAT);

  function centurion(f) {
    return function (g) {
      const step = f ? 2 : 0;
      limb(g, 12, 28, 11 + step, 35, 4.5, '#572c2a', '#aa5440', '#e9b46f');
      limb(g, 20, 28, 21 - step, 35, 4.5, '#572c2a', '#aa5440', '#e9b46f');
      rrect(g, 6, 34, 9, 3, 1, '#442b38'); rrect(g, 17, 34, 9, 3, 1, '#442b38');
      limb(g, 7, 15, 3, 23, 4, '#814638', '#d07848', '#f3c27b');
      limb(g, 25, 15, 28, 23, 4, '#814638', '#d07848', '#f3c27b');
      rrect(g, 7, 13, 18, 16, 3, lg(g, 7, 13, 25, 29, [[0, '#d9a54f'], [0.5, '#9e533d'], [1, '#542b3d']]));
      line(g, 10, 14, 22, 27, 1.1, '#f4d08a'); line(g, 22, 14, 10, 27, 1.1, '#f4d08a');
      ell(g, 16, 10, 7.5, 6.8, '#d6a36e'); rrect(g, 10, 8, 12, 6, 2, '#4a3041'); eyes(g, 12.5, 19.5, 11, 1.15);
      poly(g, [[7, 8], [9, 2], [14, 0], [20, 2], [24, 8], [21, 7], [19, 5], [12, 5], [10, 8]], '#b98549');
      g.fillStyle = '#bd342e'; g.fillRect(14, 0, 4, 9); poly(g, [[18, 1], [29, 0], [26, 4], [18, 4]], '#e34c3b');
      ell(g, 5, 21, 5.5, 7, lg(g, 0, 15, 10, 28, [[0, '#e4c47f'], [1, '#866444']]));
      line(g, 5, 15, 5, 27, 0.7, '#f7e4ae'); line(g, 1, 21, 9, 21, 0.7, '#f7e4ae');
      if (f) ell(g, 27.5, 29, 1.3, 1.3, '#ffd58c');
    };
  }
  function pigeon(f) {
    return function (g) {
      const flap = f ? -4 : 4;
      ell(g, 16, 14, 9, 6.5, lg(g, 7, 8, 25, 20, [[0, '#9aa5a8'], [1, '#4b5964']]));
      poly(g, [[14, 13], [7, 8 + flap], [2, 11], [10, 16]], '#75848a');
      poly(g, [[18, 13], [27, 8 + flap], [31, 11], [22, 16]], '#bdc3b3');
      ell(g, 24, 10, 4.5, 4, '#aab4aa'); poly(g, [[27, 10], [32, 12], [27, 13]], '#dd9a50');
      eyeGlow(g, 25.3, 9.2, 0.9, EYE); ell(g, 25.3, 9.2, 1, 1, EYE);
      line(g, 14, 18, 13, 22, 0.8, '#dfaa63'); line(g, 18, 18, 19, 22, 0.8, '#dfaa63');
      g.fillStyle = '#00aeb0'; g.fillRect(13, 13, 6, 2); ell(g, 16, 14, 2, 1.2, '#65f5df');
    };
  }
  function pizzaCrawler(f) {
    return function (g) {
      for (let i = 0; i < 4; i++) limb(g, 7 + i * 6, 14, 6 + i * 7 + ((f + i) % 2 ? 2 : -2), 19, 1.8, '#67403c', '#d4a05b', null);
      poly(g, [[3, 16], [27, 4], [29, 16]], lg(g, 3, 4, 29, 16, [[0, '#f7d56d'], [0.5, '#eaa849'], [1, '#bf4d37']]));
      poly(g, [[5, 14], [27, 5], [28, 8], [8, 16]], '#fff0b4');
      [[12, 11, 1.8], [19, 9, 1.6], [21, 14, 1.3], [14, 15, 1]].forEach((q) => ell(g, q[0], q[1], q[2], q[2], '#bd352e'));
      eyes(g, 25, 29, 12, 0.85);
    };
  }
  SKINS[R] = { robot: centurion, drone: pigeon, spider: pizzaCrawler };
  regSkins(R);
  COINS[R] = '\u20AC'; regCoins(R);

  reg2('prop_cypress', 22, 34, function (g) { cypress(g, 11, 34, 0.82, '#a64b3c'); }, { shade: 0.4 });
  reg2('prop_amphora', 24, 30, function (g) {
    ell(g, 12, 18, 9, 11, lg(g, 3, 8, 21, 28, [[0, '#e5b46e'], [0.45, '#a85d43'], [1, '#66364a']]));
    g.fillStyle = '#d99a58'; g.fillRect(9, 3, 6, 5); g.fillRect(8, 1, 8, 3);
    ell(g, 4, 14, 4, 5, '#bb7650'); ell(g, 20, 14, 4, 5, '#bb7650');
    g.fillStyle = '#f0c27b'; g.fillRect(7, 12, 10, 1); g.fillRect(8, 22, 8, 1);
    poly(g, [[6, 27], [18, 27], [20, 30], [4, 30]], '#71384a');
  }, { shade: 0.4 });

  reg2('itcanal_top', 32, 8, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#f1d3a4'], [0.45, '#d4a475'], [1, '#a96e60']]); g.fillRect(0, 0, 32, 8);
    g.fillStyle = 'rgba(255,255,255,0.48)'; g.fillRect(0, 0, 32, 1);
    g.fillStyle = '#bd4c3b'; g.fillRect(0, 1, 32, 1.2);
    for (let x = 2; x < 32; x += 8) { line(g, x, 3, x - 2, 7, 0.5, 'rgba(105,65,57,0.6)'); }
  }, FLAT);
  reg2('itcanal', 32, 32, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#bb8c73'], [1, '#67475a']]); g.fillRect(0, 0, 32, 32);
    g.fillStyle = 'rgba(246,211,164,0.28)'; g.fillRect(0, 0, 32, 2);
    for (let y = 5; y < 32; y += 8) { g.fillStyle = 'rgba(82,49,62,0.35)'; g.fillRect(0, y, 32, 0.7); }
    for (let x = 3; x < 32; x += 10) line(g, x, 3, x - 3, 10, 0.6, 'rgba(255,224,184,0.3)');
  }, FLAT);
  reg2('rail_itcanal', 16, 12, function (g) {
    g.fillStyle = '#423844'; g.fillRect(0, 9, 16, 2);
    line(g, 0, 1, 16, 1, 1.5, '#d4c7b1'); line(g, 0, 4, 16, 4, 1, '#81766f');
    [2, 8, 14].forEach((x) => { g.fillStyle = '#c8b79c'; g.fillRect(x - 0.6, 1, 1.2, 9); ell(g, x, 0.8, 1.3, 1, '#f2dfbf'); });
    g.fillStyle = '#f1d5a7'; g.fillRect(0, 0, 16, 0.7);
  }, FLAT);
  regWater(R, ['#32c6c1', '#075c70', '#9dfff0', '#43dfd0']);
  reg2('bridge_' + R, 160, 100, function (g) {
    g.fillStyle = lg(g, 0, 30, 0, 100, [[0, '#c88665'], [0.55, '#a35f58'], [1, '#694158']]); g.fillRect(0, 30, 160, 70);
    g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(80, 105, 48, 56, 0, Math.PI, 0); g.fill(); g.restore();
    g.fillStyle = '#8b4b4a'; g.fillRect(0, 27, 160, 4);
    g.fillStyle = '#e6bc8e'; g.fillRect(0, 30, 160, 6); g.fillStyle = '#b44b40'; g.fillRect(0, 36, 160, 1.5);
    poly(g, [[0, 30], [80, -1], [160, 30]], 'rgba(255,221,173,0.38)');
    g.fillStyle = '#bd7758';
    for (let i = 0; i < 6; i++) {
      const x = 4 + i * 26; g.fillRect(x, 12, 21, 16);
      poly(g, [[x - 2, 12], [x + 10, 4], [x + 23, 12]], i % 2 ? '#9a4c4a' : '#c4614c');
      lit(g, x + 7, 17, 7, 8, IT.win[i % 3]);
    }
    g.fillStyle = '#f0d5aa'; g.fillRect(0, 28, 160, 2);
    g.strokeStyle = '#ddd0b6'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(2, 27); g.quadraticCurveTo(80, -7, 158, 27); g.stroke();
    for (let x = 6; x < 158; x += 9) { const t = (x - 2) / 156, y = 27 - 34 * t * (1 - t); line(g, x, y, x, 27, 0.8, '#ddd0b6'); ell(g, x, y, 1.2, 1.2, '#f5e1bd'); }
    [8, 152].forEach((x) => { g.fillStyle = '#6b3f4a'; g.fillRect(x - 2, 10, 4, 19); ell(g, x, 8, 3, 3, '#ffd480'); glowRect(g, '#ffc967', x - 4, 4, 8, 8); });
  }, { shade: 0.2, noOutline: true });
  reg2('boat_' + R, 120, 36, boatArt({ hull: ['#a83f3d', '#55233f'], stripe: '#ffe2a0', cab: ['#f8ebd3', '#d4b287'], roof: '#fff3d4', win: ['#ffe9a0', '#9af3e3'], logo: false, name: 'ACTV AZURE' }), { shade: 0.35 });

  regOb('vespa', 52, 34, function (g) {
    ell(g, 12, 29, 5, 5, '#262437'); ell(g, 41, 29, 5, 5, '#262437');
    ell(g, 12, 29, 2, 2, '#c7c3b5'); ell(g, 41, 29, 2, 2, '#c7c3b5');
    poly(g, [[10, 27], [14, 15], [25, 11], [34, 13], [43, 21], [45, 28], [37, 30], [18, 30]], lg(g, 9, 12, 45, 30, [[0, '#ff7157'], [0.4, '#d73936'], [1, '#782d3e']]));
    rrect(g, 24, 8, 10, 5, 2, '#dbe5e0'); line(g, 30, 11, 36, 6, 1, '#413343'); line(g, 34, 6, 40, 6, 1, '#413343');
    ell(g, 44, 20, 2.2, 2, '#fff2bd'); glowRect(g, '#ffe5a0', 42, 18, 4, 4);
    g.fillStyle = '#f1d6a1'; g.fillRect(19, 17, 14, 1); rrect(g, 25, 13, 6, 2, 1, '#f3d2a3');
    line(g, 16, 19, 12, 28, 2, '#e4ddd0');
  });
  regOb('fiat', 60, 34, function (g) {
    ell(g, 13, 30, 5, 5, '#232332'); ell(g, 47, 30, 5, 5, '#232332');
    ell(g, 13, 30, 2.2, 2.2, '#d3c9b0'); ell(g, 47, 30, 2.2, 2.2, '#d3c9b0');
    rrect(g, 2, 16, 56, 14, 5, lg(g, 0, 15, 0, 31, [[0, '#ffcf70'], [0.45, '#e6a84d'], [1, '#a65344']]));
    poly(g, [[10, 17], [17, 7], [40, 7], [49, 17]], '#d8e6db');
    g.fillStyle = '#514357'; g.fillRect(19, 9, 8, 7); g.fillRect(29, 9, 10, 7);
    g.fillStyle = '#ffeac0'; g.fillRect(4, 19, 4, 3); g.fillRect(52, 19, 4, 3); rrect(g, 25, 17, 10, 2, 0.7, '#f6e4b7');
    g.fillStyle = '#a2433c'; g.fillRect(13, 27, 34, 2);
  });
  regOb('gelato', 68, 38, function (g) {
    g.fillStyle = '#543d4c'; g.fillRect(20, 33, 2, 5); g.fillRect(48, 33, 2, 5);
    rrect(g, 6, 12, 56, 23, 3, lg(g, 6, 12, 6, 35, [[0, '#fff0d1'], [1, '#d8af8d']]));
    g.fillStyle = '#c74e46'; g.fillRect(4, 8, 60, 5); g.fillStyle = '#ffe3a7'; g.fillRect(4, 7, 60, 1.5);
    for (let x = 7; x < 62; x += 8) { g.fillStyle = (x % 2 ? '#c64b48' : '#fff0d1'); poly(g, [[x, 13], [x + 7, 13], [x + 7, 19], [x + 3.5, 21], [x, 19]], g.fillStyle); }
    g.fillStyle = '#514050'; g.fillRect(13, 22, 42, 8); txt(g, 'GELATO', 16, 23.8, 0.65, '#ffe6ad');
    ell(g, 23, 5, 5, 5, '#ed78aa'); ell(g, 33, 4, 5, 5, '#a9df76'); ell(g, 43, 5, 5, 5, '#f7d467');
    line(g, 19, 0, 17, 9, 1.3, '#694049'); line(g, 50, 0, 53, 9, 1.3, '#694049');
  });
  reg2('secret_' + R, 30, 62, function (g) {
    g.fillStyle = '#c8a47a'; g.fillRect(2, 6, 26, 56);
    poly(g, [[0, 8], [15, 0], [30, 8]], '#e1c49b');
    g.fillStyle = '#8f655f'; g.fillRect(5, 11, 20, 51);
    g.fillStyle = '#75e7d4'; g.fillRect(7, 34, 16, 25); g.fillStyle = 'rgba(255,255,255,0.65)'; g.fillRect(8, 35, 14, 2);
    for (let side of [0, 1]) {
      const x = side ? 22 : 8; g.fillStyle = '#d8b98f'; g.fillRect(x, 14, 3, 20); ell(g, x + 1.5, 14, 2, 2, '#d8b98f');
    }
    ell(g, 15, 23, 5.5, 9, '#d4a981'); ell(g, 15, 13, 4, 4, '#e5c5a1');
    poly(g, [[12, 14], [12, 10], [17, 9], [19, 15], [17, 19], [15, 16]], '#a48272');
    line(g, 15, 20, 15, 28, 0.7, '#f5e1c5');
    g.fillStyle = '#e4d0ad'; g.fillRect(3, 58, 24, 4);
    g.fillStyle = '#a67a60'; g.fillRect(5, 7, 20, 2);
    g.fillStyle = '#b8fff0'; g.globalAlpha = 0.7; g.fillRect(7, 34, 16, 25); g.globalAlpha = 1;
    glowRect(g, '#47e6d0', 7, 31, 16, 26);
  }, { shade: 0.3 });

  MP[R] = { top: '#b76a62', bot: '#6b3a58', accent: '#ffd094', win: ['#ffe8a6', '#ffb46e', '#a8f4e0'] };
  SC[R] = {
    sc_it_colosseum: [210, 170, function (g, w, h, P) { italyHouses(g, 0, 70, true); drawColosseum(g, 108, h, 1.65, P); txt(g, 'ROMA', 164, h - 9, 1, '#ffe5ad'); }],
    sc_it_pisa: [150, 190, function (g, w, h, P) { g.fillStyle = '#759455'; g.fillRect(0, h - 18, w, 18); cypress(g, 20, h, 1, '#9a5843'); drawPisa(g, 82, h, 1.65, P); }],
    sc_it_milano: [230, 185, function (g, w, h, P) { drawDuomo(g, 115, h, 1.7, P); txt(g, 'MILANO', 89, h - 9, 1, '#fff0d7'); }],
    sc_it_sanmarco: [220, 180, function (g, w, h, P) { drawStMarks(g, 98, h, 1.35, P); txt(g, 'SAN MARCO', 115, h - 10, 1, '#ffe3a1'); }],
    sc_it_rialto: [250, 145, function (g, w, h, P) { g.fillStyle = '#28b8b2'; g.fillRect(0, h - 48, w, 48); drawRialto(g, 12, h - 4, 226, 1.45, P); }],
    sc_it_trevi: [180, 160, function (g, w, h, P) { drawTrevi(g, 90, h, 1.5, P); txt(g, 'TREVI', 72, h - 5, 1, '#fff0cf'); }],
    sc_it_firenze: [210, 170, function (g, w, h, P) { drawFlorence(g, 106, h, 1.55, P); txt(g, 'FIRENZE', 80, h - 8, 1, '#ffe2a4'); }],
    sc_it_burano: [240, 150, function (g, w, h, P) { const cols = ['#e86f62', '#49b4a1', '#e2b64e', '#7a83cb', '#e49b58']; for (let i = 0; i < 5; i++) { const x = i * 48; g.fillStyle = cols[i]; g.fillRect(x, h - 93 - (i % 2) * 13, 48, 93 + (i % 2) * 13); poly(g, [[x - 2, h - 93 - (i % 2) * 13], [x + 24, h - 108 - (i % 2) * 13], [x + 50, h - 93 - (i % 2) * 13]], i % 2 ? '#85424b' : '#a84a45'); lit(g, x + 10, h - 72, 10, 18, P.win[i % 3]); lit(g, x + 28, h - 72, 10, 18, P.win[(i + 1) % 3]); g.fillStyle = '#f4d5a4'; g.fillRect(x + 23, h - 32, 6, 32); } g.fillStyle = '#2c989b'; g.fillRect(0, h - 8, w, 8); }],
    sc_it_pizzeria: [190, 135, function (g, w, h, P) { g.fillStyle = '#c57059'; g.fillRect(5, h - 78, 180, 78); poly(g, [[0, h - 78], [94, h - 120], [190, h - 78]], '#7d3947'); g.fillStyle = '#f1cf9b'; g.fillRect(18, h - 67, 154, 12); txt(g, 'PIZZERIA', 61, h - 65, 1.2, '#b84238'); g.fillStyle = '#593344'; g.fillRect(70, h - 48, 52, 48); ell(g, 96, h - 27, 19, 19, '#713d44'); ell(g, 96, h - 27, 12, 12, '#ffad56'); ell(g, 96, h - 27, 7, 7, '#ffe28a'); glowRect(g, '#ff9d4e', 84, h - 40, 24, 24); for (let x = 20; x < 175; x += 22) lit(g, x, h - 43, 13, 15, P.win[(x / 22 | 0) % 3]); }],
    sc_it_msoffice: [220, 185, function (g, w, h, P) { g.fillStyle = '#59415b'; g.fillRect(12, h - 128, 196, 128); g.fillRect(148, h - 160, 58, 32); for (let y = h - 118; y < h - 10; y += 12) for (let x = 20; x < 202; x += 15) lit(g, x, y, 9, 7, P.win[(x + y) % 3]); g.fillStyle = '#251f42'; g.fillRect(45, h - 152, 114, 20); glowRect(g, '#5fb8ff', 45, h - 152, 114, 20); msLogo(g, 50, h - 148, 13); txt(g, 'MICROSOFT', 69, h - 146, 1, '#ffffff'); txt(g, 'MILANO', 84, h - 11, 1, '#ffe6a5'); }],
    sc_it_canalcafe: [195, 115, function (g, w, h, P) { g.fillStyle = '#d18b65'; g.fillRect(4, h - 57, 187, 57); g.fillStyle = '#a94943'; g.fillRect(0, h - 61, w, 5); g.fillStyle = '#f4d8a8'; g.fillRect(14, h - 53, 167, 8); txt(g, 'CAFFE  VENEZIA', 46, h - 52, 0.85, '#963f42'); g.fillStyle = '#593d50'; g.fillRect(20, h - 38, 45, 38); g.fillRect(74, h - 38, 45, 38); g.fillRect(128, h - 38, 45, 38); [24, 78, 132].forEach((x) => lit(g, x, h - 34, 36, 22, '#9ae7d3')); }],
    sc_it_cypressyard: [155, 150, function (g, w, h, P) { g.fillStyle = '#99754f'; g.fillRect(0, h - 16, w, 16); cypress(g, 34, h, 1.15, '#ad5843'); cypress(g, 78, h, 0.9, '#dfb16e'); cypress(g, 122, h, 1.2, '#8e4d49'); for (let x = 0; x < w; x += 18) { g.fillStyle = '#bd9a70'; g.fillRect(x, h - 17, 9, 1); } }]
  };
}
  {
  const R = 'westus2';
  const rdPal = { top: '#174d53', bot: '#102d48', accent: '#55d6a1', win: ['#9df4dc', '#ffd06e', '#e7a9ff'] };

  SKIES[R] = {
    stops: [[0, '#100b32'], [0.3, '#22265e'], [0.55, '#514477'], [0.73, '#9a5d83'], [0.88, '#dc8c82'], [1, '#f4c38e']],
    sun: { x: 470, y: 205, r: 58, c: ['#fff0c4', '#efad87', '#bd6b91'] },
    halo: ['rgba(255,195,150,0.5)', 'rgba(125,110,210,0.2)'],
    cl: ['rgba(77,105,155,0.55)', 'rgba(190,130,165,0.55)', 'rgba(200,225,230,0.45)'],
    hz: 'rgba(170,207,190,0.45)', stars: 105, seed: 29, stripes: false
  };
  reg2('bg_sky_' + R, 640, 360, makeSky(SKIES[R]), FLAT);
  PAL[R] = rdPal;

  function rdRainier(g, cx, base, s) {
    const snow = '#e9f4f3', shade = '#a4c4c6';
    poly(g, [[cx - 170 * s, base], [cx - 108 * s, base - 42 * s], [cx - 68 * s, base - 93 * s], [cx - 28 * s, base - 144 * s], [cx - 8 * s, base - 151 * s], [cx + 16 * s, base - 126 * s], [cx + 56 * s, base - 101 * s], [cx + 92 * s, base - 50 * s], [cx + 165 * s, base]], '#41566d');
    poly(g, [[cx - 69 * s, base - 94 * s], [cx - 28 * s, base - 144 * s], [cx - 8 * s, base - 151 * s], [cx + 17 * s, base - 126 * s], [cx + 38 * s, base - 111 * s], [cx + 15 * s, base - 112 * s], [cx + 3 * s, base - 123 * s], [cx - 9 * s, base - 108 * s], [cx - 26 * s, base - 117 * s]], snow);
    poly(g, [[cx - 68 * s, base - 94 * s], [cx - 28 * s, base - 144 * s], [cx - 9 * s, base - 151 * s], [cx - 37 * s, base - 109 * s], [cx - 47 * s, base - 113 * s]], '#ffffff');
    poly(g, [[cx - 165 * s, base], [cx - 90 * s, base - 36 * s], [cx - 65 * s, base - 28 * s], [cx - 18 * s, base]], '#314757');
    poly(g, [[cx + 15 * s, base], [cx + 56 * s, base - 52 * s], [cx + 85 * s, base - 34 * s], [cx + 158 * s, base]], '#32495a');
    line(g, cx - 95 * s, base - 48 * s, cx - 52 * s, base - 20 * s, 1.1, 'rgba(222,246,240,0.6)');
    line(g, cx + 28 * s, base - 96 * s, cx + 74 * s, base - 52 * s, 1, 'rgba(223,244,238,0.58)');
    g.fillStyle = '#294c46'; g.fillRect(cx - 176 * s, base - 4 * s, 350 * s, 4 * s);
  }
  function rdNeedle(g, cx, base, s, P) {
    const shaft = lg(g, cx - 9 * s, 0, cx + 9 * s, 0, [[0, '#b8d5d6'], [0.48, '#5e9d9e'], [1, '#244c59']]);
    poly(g, [[cx - 3 * s, base], [cx - 5 * s, base - 91 * s], [cx - 1 * s, base - 108 * s], [cx + 2 * s, base - 108 * s], [cx + 5 * s, base - 91 * s], [cx + 3 * s, base]], shaft);
    g.fillStyle = '#264c57'; g.fillRect(cx - 13 * s, base - 92 * s, 26 * s, 2 * s);
    g.fillStyle = '#a5d7cf'; g.fillRect(cx - 10 * s, base - 94 * s, 20 * s, 2 * s);
    poly(g, [[cx - 18 * s, base - 94 * s], [cx - 12 * s, base - 104 * s], [cx + 12 * s, base - 104 * s], [cx + 18 * s, base - 94 * s]], '#4c777b');
    ell(g, cx, base - 99 * s, 11 * s, 5 * s, '#f2c99a');
    ell(g, cx, base - 100 * s, 8.5 * s, 3.8 * s, '#75aaa6');
    g.fillStyle = P.accent; g.fillRect(cx - 0.6 * s, base - 117 * s, 1.2 * s, 10 * s);
    glowRect(g, '#8ef0c4', cx - 1.5 * s, base - 118 * s, 3 * s, 2 * s);
    for (let k = -2; k <= 2; k++) { g.fillStyle = 'rgba(223,255,239,0.6)'; g.fillRect(cx + k * 3 * s, base - 91 * s, 1 * s, 8 * s); }
  }
  function rdColumbia(g, cx, base, s, P) {
    const f = lg(g, cx - 20 * s, 0, cx + 20 * s, 0, [[0, '#54818c'], [0.45, '#315a70'], [1, '#20374f']]);
    poly(g, [[cx - 18 * s, base], [cx - 13 * s, base - 114 * s], [cx - 4 * s, base - 139 * s], [cx + 5 * s, base - 139 * s], [cx + 14 * s, base - 114 * s], [cx + 19 * s, base]], f);
    g.fillStyle = '#a8d7ce'; g.fillRect(cx - 13 * s, base - 114 * s, 27 * s, 1.2 * s);
    for (let y = base - 108 * s; y < base - 8 * s; y += 9 * s) {
      g.fillStyle = 'rgba(165,220,218,0.35)'; g.fillRect(cx - (12 - (base - y) * 0.02) * s, y, (24 - (base - y) * 0.04) * s, 0.6 * s);
      if ((y / s | 0) % 3 !== 0) { lit(g, cx - 8 * s, y + 2 * s, 2.2 * s, 3.4 * s, P.win[0]); lit(g, cx + 4 * s, y + 2 * s, 2.2 * s, 3.4 * s, P.win[1]); }
    }
    g.fillStyle = '#8bc5bd'; g.fillRect(cx - 4 * s, base - 144 * s, 8 * s, 3 * s);
    g.fillStyle = '#d5eee3'; g.fillRect(cx - 0.7 * s, base - 153 * s, 1.4 * s, 9 * s);
    for (let x = cx - 9 * s; x <= cx + 9 * s; x += 6 * s) g.fillStyle = P.accent, g.fillRect(x, base - 149 * s, 1.5 * s, 2 * s);
    g.fillStyle = '#263d52'; g.fillRect(cx - 22 * s, base - 2 * s, 44 * s, 2 * s);
  }
  reg2('bg_far_' + R, 640, 220, function (g, w, h) {
    const base = h - 4;
    skyline(w, h, 291, '#1d3454', rdPal.accent, 28, 72, 0.24, rdPal.win)(g);
    rdRainier(g, 140, base - 5, 0.77);
    rdColumbia(g, 472, base, 0.85, rdPal);
    rdNeedle(g, 300, base, 0.9, rdPal);
    // Low Sound-facing skyline silhouettes bridge Seattle and the distant campus.
    for (let x = 14; x < 640; x += 34) {
      const bh = 22 + ((x * 7) % 29);
      g.fillStyle = '#21364e'; g.fillRect(x, base - bh, 26, bh);
      g.fillStyle = 'rgba(168,222,210,0.36)'; g.fillRect(x + 2, base - bh, 22, 0.8);
      for (let y = base - bh + 6; y < base - 4; y += 9) if ((x + y) % 3 < 1) lit(g, x + 5, y, 3, 4, rdPal.win[(x + y) % 3 | 0]);
    }
    g.fillStyle = 'rgba(240,198,154,0.16)'; g.fillRect(0, h - 28, w, 28);
  }, FLAT);
  reg2('bg_farp_' + R, 640, 220, function (g, w, h) {
    const r = rng(329), base = h - 5;
    // Continuous, landmark-free rolling foothills with evergreen ranks.
    g.fillStyle = '#21394c'; g.beginPath(); g.moveTo(0, base - 30);
    for (let x = 0; x <= w; x += 32) g.quadraticCurveTo(x + 16, base - 44 - r() * 20, x + 32, base - 28 - r() * 14);
    g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
    g.fillStyle = '#1a3142'; g.beginPath(); g.moveTo(0, base - 10);
    for (let x = 0; x <= w; x += 24) g.quadraticCurveTo(x + 12, base - 28 - r() * 14, x + 24, base - 8 - r() * 7);
    g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
    for (let x = -6; x < w + 20; x += 13) {
      const th = 22 + r() * 28, tx = x + r() * 5;
      g.fillStyle = '#142d3a'; g.fillRect(tx + 5, base - th * 0.38, 2, th * 0.38);
      poly(g, [[tx, base - th * 0.28], [tx + 6, base - th], [tx + 12, base - th * 0.28]], r() > 0.5 ? '#1b493f' : '#1a403d');
      poly(g, [[tx + 1, base - th * 0.48], [tx + 6, base - th * 0.83], [tx + 11, base - th * 0.48]], '#205149');
    }
    // Repeated low glass campus blocks, deliberately generic and without landmark silhouettes.
    for (let x = 4; x < w; x += 92) {
      const bw = 36 + (x % 3) * 8, bh = 22 + (x % 4) * 4;
      g.fillStyle = '#294957'; g.fillRect(x, base - bh, bw, bh);
      g.fillStyle = 'rgba(119,193,184,0.55)'; g.fillRect(x + 2, base - bh + 3, bw - 4, bh - 5);
      g.fillStyle = 'rgba(17,42,58,0.75)';
      for (let wx = x + 6; wx < x + bw - 2; wx += 8) for (let wy = base - bh + 6; wy < base - 4; wy += 7) g.fillRect(wx, wy, 4, 3);
      g.fillStyle = '#a5c9b9'; g.fillRect(x, base - bh, bw, 1);
    }
    g.fillStyle = 'rgba(93,172,137,0.17)'; g.fillRect(0, h - 14, w, 14);
  }, FLAT);
  reg2('bg_near_' + R, 640, 190, function (g, w, h) {
    const r = rng(337);
    g.fillStyle = '#101d34'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#142939'; g.beginPath(); g.moveTo(0, h - 38);
    for (let x = 0; x <= w; x += 48) g.quadraticCurveTo(x + 24, h - 56 - r() * 18, x + 48, h - 34 - r() * 8);
    g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
    for (let x = -5; x < w + 20; x += 17) {
      const hh = 35 + r() * 34;
      g.fillStyle = '#102733'; g.fillRect(x + 7, h - hh * 0.46, 2.5, hh * 0.46);
      poly(g, [[x, h - hh * 0.27], [x + 8, h - hh], [x + 16, h - hh * 0.27]], '#163d38');
      poly(g, [[x + 1, h - hh * 0.51], [x + 8, h - hh * 0.82], [x + 15, h - hh * 0.51]], '#1a4940');
    }
    g.fillStyle = 'rgba(74,203,159,0.28)'; g.fillRect(0, h - 6, w, 6);
    for (let x = 12; x < w; x += 47) lit(g, x, h - 12 - (x % 3) * 2, 1.6, 1.6, '#67e3b2');
  }, FLAT);

  function rdBug(f) {
    return function (g) {
      const step = f ? 2 : -1;
      for (let i = 0; i < 3; i++) {
        limb(g, 9 + i * 5, 27, 5 + i * 4 + (i % 2 ? step : -step), 34, 2.3, '#153e3d', '#2ca875', '#7ce4bc');
        limb(g, 22 + i * 2, 27, 26 + i * 3 - (i % 2 ? step : -step), 34, 2.3, '#153e3d', '#2ca875', '#7ce4bc');
      }
      ell(g, 16, 23, 12, 9, lg(g, 4, 13, 28, 32, [[0, '#65d2a4'], [0.55, '#187d67'], [1, '#113f4e']]));
      g.strokeStyle = '#8cf0c4'; g.lineWidth = 0.7; g.beginPath(); g.ellipse(16, 22, 8.2, 6.2, -0.3, 0, Math.PI * 2); g.stroke();
      poly(g, [[6, 20], [3, 13], [9, 17]], '#267e67'); poly(g, [[25, 20], [29, 13], [23, 17]], '#267e67');
      line(g, 10, 15, 8, 8, 1.2, '#4cd6a0'); line(g, 22, 15, 25, 8, 1.2, '#4cd6a0');
      ell(g, 7.5, 7, 2, 2, '#ff445b'); ell(g, 25.8, 7, 2, 2, '#ff445b');
      rrect(g, 8, 19, 16, 8, 2, '#102e4c');
      txt(g, '404', 10, 20.4, 0.55, '#ff6b73');
      eyes(g, 11.6, 20.4, 17, 1.7);
      for (let x = 7; x <= 25; x += 6) line(g, x, 30, x - 2, 35, 1.3, '#54b98e');
    };
  }
  function rdCrow(f) {
    return function (g) {
      const flap = f ? -5 : 4;
      ell(g, 16, 14, 11, 6, lg(g, 5, 7, 27, 21, [[0, '#354b67'], [0.55, '#18263c'], [1, '#0c1428']]));
      poly(g, [[12, 13], [6, 9 + flap], [2, 4 + flap], [5, 16], [13, 18]], '#263b54');
      poly(g, [[17, 12], [23, 8 + flap], [29, 5 + flap], [25, 17], [17, 18]], '#41566e');
      poly(g, [[7, 17], [0.5, 20], [8, 20]], '#11192b');
      ell(g, 24, 11, 5.2, 4.3, '#263a54');
      poly(g, [[27, 10], [32, 12], [27, 14]], '#70b5ad');
      eyeGlow(g, 24.7, 9.8, 1.2, '#ff5364'); ell(g, 24.7, 9.8, 1.1, 1.1, '#ff5364');
      rrect(g, 11, 14, 12, 4, 1, '#51d1a2');
      g.fillStyle = '#e2fff0'; g.fillRect(14, 15, 5, 1); g.fillRect(16, 16.8, 4, 0.7);
      g.fillStyle = '#768ca4'; g.fillRect(15, 4, 1, 4); ell(g, 15.5, 3, 1.4, 1.4, '#a4f6df');
    };
  }
  function rdBlueScreen(f) {
    return function (g) {
      for (let i = 0; i < 4; i++) {
        const x = 7 + i * 5.5, a = (f + i) % 2 ? 2 : -2;
        limb(g, x, 15, x + a, 19, 1.8, '#244b73', '#4b8ac4', '#a8e3ff');
      }
      rrect(g, 4, 5, 25, 12, 2, lg(g, 4, 4, 29, 18, [[0, '#67b9ee'], [0.5, '#1766aa'], [1, '#103263']]));
      g.fillStyle = '#0a1e3b'; g.fillRect(7, 7, 19, 8);
      txt(g, 'ERROR', 8, 8.2, 0.55, '#a9eaff');
      line(g, 8, 16, 25, 16, 0.6, '#7ee8ff');
      eyes(g, 24, 28, 9, 1.2);
      for (let i = 0; i < 4; i++) line(g, 8 + i * 5, 17, 5 + i * 6, 20, 1.4, '#2d5a80');
      line(g, 10, 4, 7, 1, 0.8, '#65c6f4'); line(g, 23, 4, 26, 1, 0.8, '#65c6f4');
      ell(g, 7, 1, 1.1, 1.1, '#ff4c61'); ell(g, 26, 1, 1.1, 1.1, '#ff4c61');
    };
  }
  SKINS[R] = { robot: rdBug, drone: rdCrow, spider: rdBlueScreen };
  regSkins(R);

  COINS[R] = '$';
  regCoins(R);


  reg2('prop_coffee', 26, 30, function (g) {
    glowRect(g, '#8ee2c1', 2, 2, 22, 25);
    rrect(g, 4, 8, 17, 19, 2, lg(g, 4, 8, 21, 27, [[0, '#edf0e3'], [0.55, '#b9d1c5'], [1, '#698a83']]));
    rrect(g, 2, 6, 21, 4, 1.3, '#243a46');
    g.fillStyle = '#f2f1e4'; g.fillRect(6, 10, 13, 2);
    txt(g, 'COFFEE', 5, 14, 0.55, '#244d4d');
    g.fillStyle = '#7b4739'; g.fillRect(7, 22, 10, 2);
    g.strokeStyle = '#d6eee0'; g.lineWidth = 1.3; g.beginPath(); g.arc(21, 17, 4, -1.2, 1.2); g.stroke();
    g.fillStyle = '#f3d09a'; g.fillRect(10, 4, 1, 2); g.fillRect(14, 3, 1, 3);
  }, { shade: 0.4 });
  reg2('prop_mailbox', 20, 32, function (g) {
    g.fillStyle = '#46525f'; g.fillRect(9, 17, 2, 15);
    rrect(g, 2, 6, 16, 16, 4, lg(g, 2, 4, 18, 22, [[0, '#77b4e2'], [0.48, '#246da2'], [1, '#153d69']]));
    ell(g, 10, 7, 7.8, 3, '#77b4e2');
    g.fillStyle = '#c9e8f4'; g.fillRect(5, 11, 10, 1.5);
    g.fillStyle = '#f5f2df'; g.fillRect(14, 8, 2, 5); g.fillRect(14, 8, 3, 1.5);
    g.fillStyle = '#182a40'; g.fillRect(5, 16, 9, 0.7);
  }, { shade: 0.4 });

  reg2('rd_top', 32, 8, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#b7e879'], [0.28, '#60b95a'], [1, '#2e7045']]); g.fillRect(0, 0, 32, 8);
    for (let x = 0; x < 32; x += 2) { g.fillStyle = x % 4 ? 'rgba(235,255,183,0.7)' : 'rgba(31,111,59,0.75)'; g.fillRect(x, 0, 0.7, 1.2 + (x % 3) * 0.6); }
    g.fillStyle = '#254c43'; g.fillRect(0, 7, 32, 1);
  }, FLAT);
  reg2('rd', 32, 32, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#3c7b4a'], [0.35, '#2c6248'], [1, '#234d49']]); g.fillRect(0, 0, 32, 32);
    const r = rng(407);
    for (let i = 0; i < 20; i++) { const x = r() * 32, y = 2 + r() * 28; g.fillStyle = i % 2 ? 'rgba(144,197,107,0.38)' : 'rgba(23,66,54,0.55)'; g.fillRect(x, y, 2 + r() * 3, 0.8); }
    g.fillStyle = 'rgba(205,226,161,0.25)'; g.fillRect(0, 0, 32, 1);
  }, FLAT);
  reg2('rail_rd', 16, 12, function (g) {
    g.fillStyle = lg(g, 0, 1, 0, 11, [[0, '#3f8a53'], [0.5, '#27694b'], [1, '#17433d']]);
    g.beginPath(); g.moveTo(0, 11); g.lineTo(0, 7); g.quadraticCurveTo(3, 1, 8, 5); g.quadraticCurveTo(12, 0, 16, 6); g.lineTo(16, 11); g.closePath(); g.fill();
    g.fillStyle = 'rgba(167,217,129,0.45)'; g.fillRect(0, 9.8, 16, 0.7);
    // Campus path bollards repeat as small Microsoft-coloured beacons above the hedge.
    [[2, '#f25022'], [6, '#7fba00'], [10, '#00a4ef'], [14, '#ffb900']].forEach(function (b) {
      g.fillStyle = '#283940'; g.fillRect(b[0], 5.2, 1.5, 5.7);
      g.fillStyle = b[1]; g.fillRect(b[0] - 0.35, 4.2, 2.2, 1.6); glowRect(g, b[1], b[0] - 1.4, 3.2, 4, 3);
    });
  }, FLAT);
  regWater(R, ['#17617b', '#071d38', '#8ccab7', '#396d67']);
  reg2('bridge_' + R, 160, 100, function (g) {
    const deck = lg(g, 0, 30, 0, 100, [[0, '#b7c8c0'], [0.25, '#778d8d'], [1, '#344c59']]);
    // SR 520 inspired flat concrete causeway and pontoons, not a cable or arch bridge.
    g.fillStyle = deck; g.fillRect(0, 30, 160, 68);
    g.fillStyle = '#d1d9cb'; g.fillRect(0, 27, 160, 5);
    g.fillStyle = '#526e71'; g.fillRect(0, 32, 160, 1);
    g.fillStyle = '#e5eee0'; g.fillRect(0, 27, 160, 0.8);
    for (let x = 5; x < 160; x += 12) {
      g.fillStyle = '#263b49'; g.fillRect(x, 24, 1, 4);
      g.fillStyle = '#eef4da'; g.fillRect(x - 1, 22, 3, 2); glowRect(g, '#c9ef9a', x - 2, 20, 5, 5);
      g.fillStyle = 'rgba(31,54,62,0.72)'; g.fillRect(x + 3, 38, 1, 43);
    }
    for (let x = 14; x < 160; x += 24) { g.fillStyle = '#607e84'; g.fillRect(x, 55, 17, 29); g.fillStyle = '#9db9ae'; g.fillRect(x + 2, 57, 13, 1); g.fillStyle = '#162f42'; g.fillRect(x + 3, 62, 2, 19); }
    [28, 77, 126].forEach(function (x) {
      poly(g, [[x - 12, 72], [x - 9, 66], [x + 10, 66], [x + 14, 72], [x + 10, 87], [x - 8, 87]], lg(g, x - 10, 67, x + 12, 88, [[0, '#9ab8ad'], [1, '#426a70']]));
      g.fillStyle = '#b7d0bc'; g.fillRect(x - 8, 70, 17, 1);
      g.fillStyle = '#071d38'; g.fillRect(x - 5, 74, 2, 1); g.fillRect(x + 2, 74, 2, 1);
    });
    g.fillStyle = 'rgba(14,39,56,0.7)'; g.fillRect(0, 96, 160, 4);
  }, { shade: 0.2, noOutline: true });
  reg2('boat_' + R, 120, 36, boatArt({ hull: ['#eff4ea', '#51836d'], stripe: '#178c57', cab: ['#ffffff', '#b5d5c9'], roof: '#f5f2e7', win: ['#9ed3d0', '#e9d99b'], logo: false, name: 'AZURE FERRY' }), { shade: 0.35 });

  regOb('pickup', 88, 44, function (g) {
    // Large modern US pickup, high hood, crew cab and open cargo bed.
    g.fillStyle = '#1c2736'; g.fillRect(4, 35, 80, 5);
    poly(g, [[3, 22], [9, 16], [30, 15], [39, 5], [63, 5], [72, 17], [84, 20], [86, 34], [2, 34]], lg(g, 0, 5, 0, 35, [[0, '#8fb6bd'], [0.45, '#347b85'], [1, '#193d52']]));
    poly(g, [[40, 8], [60, 8], [68, 17], [39, 17]], 'rgba(164,224,225,0.78)');
    g.fillStyle = '#193047'; g.fillRect(43, 9, 1.4, 8); g.fillRect(61, 9, 1.4, 8);
    g.fillStyle = '#627f81'; g.fillRect(7, 18, 27, 4); g.fillRect(3, 23, 33, 2);
    g.fillStyle = '#253c4a'; g.fillRect(69, 20, 13, 9); g.fillStyle = '#6e9a91'; g.fillRect(70, 21, 10, 1);
    g.fillStyle = '#eff2d5'; g.fillRect(81, 23, 3, 3); glowRect(g, '#fff0bd', 79, 21, 5, 5);
    g.fillStyle = '#d74748'; g.fillRect(3, 26, 2.2, 2.2);
    [20, 68].forEach(function (x) { ell(g, x, 35, 8, 8, '#111827'); ell(g, x, 35, 3.6, 3.6, '#a9c1bf'); ell(g, x, 35, 1.5, 1.5, '#eff2dc'); });
    g.fillStyle = '#c0d0c3'; g.fillRect(44, 31, 14, 2); g.fillStyle = '#b7d8c2'; g.fillRect(8, 27, 15, 1);
    txt(g, 'USA', 46, 26, 0.65, '#d9f5d6');
  });
  regOb('schoolbus', 96, 56, function (g) {
    rrect(g, 1, 3, 94, 47, 5, lg(g, 0, 3, 0, 50, [[0, '#ffe45c'], [0.52, '#edb728'], [1, '#a96a16']]));
    g.fillStyle = '#ffef90'; g.fillRect(3, 4, 89, 2);
    g.fillStyle = '#16283b'; g.fillRect(4, 10, 88, 13);
    for (let x = 7; x < 88; x += 12) { g.fillStyle = '#172d3f'; g.fillRect(x, 11, 10, 11); g.fillStyle = 'rgba(160,218,225,0.82)'; g.fillRect(x + 1, 12, 8, 9); g.fillStyle = '#d6f1e4'; g.fillRect(x + 2, 12, 1, 7); }
    g.fillStyle = '#f2cf45'; g.fillRect(3, 25, 90, 12);
    g.fillStyle = '#253d43'; g.fillRect(4, 26, 88, 1.3); g.fillRect(4, 35, 88, 1.3);
    txt(g, 'SCHOOL BUS', 14, 28, 0.78, '#283747');
    g.fillStyle = '#fff5c3'; g.fillRect(2, 38, 92, 3);
    g.fillStyle = '#ef4c45'; g.fillRect(2, 43, 5, 4); g.fillRect(89, 43, 5, 4);
    g.fillStyle = '#eff4d8'; g.fillRect(89, 26, 4, 5); g.fillRect(3, 26, 4, 5);
    [20, 76].forEach(function (x) { ell(g, x, 50, 7, 7, '#13202e'); ell(g, x, 50, 3, 3, '#a9b5b0'); });
    g.fillStyle = '#283848'; g.fillRect(4, 52, 88, 2);
  });
  regOb('taxi', 48, 28, function (g) {
    poly(g, [[1, 14], [8, 5], [34, 5], [43, 14], [47, 16], [47, 24], [1, 24]], lg(g, 0, 4, 0, 24, [[0, '#ffe54c'], [0.55, '#e4ad20'], [1, '#a56a11']]));
    poly(g, [[10, 7], [21, 7], [21, 14], [5, 14]], 'rgba(161,224,228,0.85)'); poly(g, [[23, 7], [33, 7], [40, 14], [23, 14]], 'rgba(161,224,228,0.82)');
    rrect(g, 19, 1.6, 11, 3.6, 1, '#e7ca55'); txt(g, 'TAXI', 20, 2.3, 0.55, '#183548');
    g.fillStyle = '#243847'; g.fillRect(3, 16, 42, 2); g.fillStyle = '#fff0a2'; g.fillRect(43, 17, 3, 2);
    [11, 37].forEach(function (x) { ell(g, x, 24, 4.6, 4.6, '#101827'); ell(g, x, 24, 2, 2, '#aababa'); });
  });
  reg2('secret_' + R, 30, 62, function (g) {
    glowRect(g, '#6dff42', 1, 1, 28, 59);
    rrect(g, 3, 4, 24, 58, 2, lg(g, 3, 4, 27, 62, [[0, '#a5ff63'], [0.22, '#38c939'], [0.72, '#147c32'], [1, '#073a26']]));
    rrect(g, 6, 8, 18, 50, 1.5, '#0b382d');
    g.fillStyle = '#61f05c'; g.fillRect(7, 9, 16, 1.2); g.fillRect(7, 56, 16, 1.2);
    ell(g, 15, 29, 12, 12, 'rgba(91,255,73,0.22)'); ell(g, 15, 29, 9, 9, '#5fe943'); ell(g, 15, 29, 7.4, 7.4, '#158c3c');
    line(g, 10, 24, 20, 34, 2.4, '#f2fff1'); line(g, 20, 24, 10, 34, 2.4, '#f2fff1');
    g.fillStyle = '#b6ff92'; g.fillRect(14, 15, 2, 2); g.fillRect(14, 42, 2, 2); g.fillRect(6, 28, 2, 2); g.fillRect(22, 28, 2, 2);
    g.fillStyle = '#efffde'; g.fillRect(24, 39, 1.2, 1.2); glowRect(g, '#72ff5a', 22, 37, 5, 5);
    g.fillStyle = '#143626'; g.fillRect(2, 58, 26, 4);
  }, { shade: 0.3 });

  MP[R] = { top: '#174d53', bot: '#294c58', accent: '#68dbac', win: ['#c5edcd', '#f4d28f', '#b8c5ff'] };
  SC[R] = {
    sc_rd_microsoft: [200, 175, function (g, w, h, P) {
      const f = silFill(g, h - 142, h, '#8eb8ad', '#304d59');
      g.fillStyle = '#152c3e'; g.fillRect(7, h - 150, 186, 15);
      msLogo(g, 17, h - 147, 11); txt(g, 'MICROSOFT', 35, h - 143, 1, '#f5f5e9');
      g.fillStyle = f; g.fillRect(15, h - 130, 170, 130);
      const glass = lg(g, 0, h - 130, 0, h, [[0, '#8bbdb5'], [0.35, '#477a83'], [1, '#263f55']]);
      g.fillStyle = glass; g.fillRect(19, h - 126, 162, 126);
      g.strokeStyle = 'rgba(211,247,226,0.48)'; g.lineWidth = 0.7;
      for (let y = h - 122; y < h; y += 11) { g.beginPath(); g.moveTo(19, y); g.lineTo(181, y); g.stroke(); }
      for (let x = 30; x < 180; x += 15) { g.beginPath(); g.moveTo(x, h - 126); g.lineTo(x, h); g.stroke(); }
      const r = rng(701); for (let y = h - 120; y < h - 6; y += 11) for (let x = 23; x < 178; x += 15) if (r() < 0.43) lit(g, x + 3, y + 2, 6, 5, P.win[Math.floor(r() * 3)]);
      g.fillStyle = 'rgba(255,255,255,0.46)'; g.fillRect(20, h - 125, 3, 120);
      g.fillStyle = '#1c3e4c'; g.fillRect(4, h - 4, 192, 4);
    }],
    sc_rd_commons: [230, 145, function (g, w, h, P) {
      // Open campus plaza, central reflecting pool, flags and a planted perimeter.
      g.fillStyle = '#293f52'; g.fillRect(0, h - 24, 230, 24);
      g.fillStyle = '#91aa9c'; g.fillRect(4, h - 26, 222, 3);
      for (let x = 8; x < 225; x += 24) { g.fillStyle = x % 48 ? '#607d73' : '#d4cda1'; g.fillRect(x, h - 24, 12, 1); }
      ell(g, 116, h - 19, 38, 8, '#1a6072'); ell(g, 116, h - 20, 34, 5, '#5cafa3');
      g.fillStyle = '#c2d5c4'; g.fillRect(12, h - 65, 206, 3);
      for (let x = 30; x < 210; x += 44) { g.fillStyle = '#253b4c'; g.fillRect(x, h - 110, 1.5, 45); poly(g, [[x + 2, h - 108], [x + 19, h - 103], [x + 2, h - 97]], x % 3 ? '#d4b8e4' : '#e8d58a'); }
      // Low modern plaza canopy.
      g.fillStyle = '#375b60'; g.fillRect(38, h - 91, 154, 4); g.fillStyle = '#9ec8b7'; g.fillRect(38, h - 92, 154, 1);
      for (let x = 44; x < 190; x += 20) { g.fillStyle = '#435f62'; g.fillRect(x, h - 88, 2, 23); }
      txt(g, 'THE COMMONS', 72, h - 57, 1, '#eff3da', '#1d3746');
      for (let x = 12; x < 220; x += 34) tree(g, x, h - 25, 27 + (x % 3) * 3, '#27684e');
      g.fillStyle = 'rgba(240,219,168,0.38)'; g.fillRect(0, h - 5, 230, 2);
    }],
    sc_rd_building92: [190, 160, function (g, w, h, P) {
      g.fillStyle = '#213a4c'; g.fillRect(6, h - 108, 178, 108);
      g.fillStyle = '#6ca59e'; g.fillRect(10, h - 104, 170, 100);
      g.fillStyle = 'rgba(12,36,55,0.55)'; g.fillRect(10, h - 66, 170, 6);
      for (let x = 16; x < 180; x += 12) { g.fillStyle = 'rgba(218,244,224,0.42)'; g.fillRect(x, h - 100, 1, 35); g.fillRect(x, h - 55, 1, 46); }
      for (let y = h - 95; y < h - 10; y += 17) for (let x = 18; x < 174; x += 17) lit(g, x, y, 5, 7, P.win[(x + y) % 3]);
      g.fillStyle = '#132c3d'; g.fillRect(8, h - 133, 174, 22); msLogo(g, 13, h - 130, 13);
      txt(g, 'BUILDING 92', 32, h - 126, 1, '#f2f1db');
      g.fillStyle = '#b6d6c3'; g.fillRect(5, h - 4, 182, 4);
      g.fillStyle = '#35534e'; g.fillRect(73, h - 25, 43, 20); g.fillStyle = '#c4e7d4'; g.fillRect(77, h - 23, 35, 18);
      for (let x = 80; x < 112; x += 7) g.fillStyle = '#41616a', g.fillRect(x, h - 23, 1, 18);
      txt(g, 'VISITOR CENTER', 35, h - 12, 0.75, '#ecf4df');
    }],
    sc_rd_sports: [260, 140, function (g, w, h, P) {
      // New glass campus block and an adjacent cricket/soccer practice field.
      g.fillStyle = '#284959'; g.fillRect(5, h - 96, 120, 96);
      g.fillStyle = lg(g, 5, h - 96, 5, h, [[0, '#83bab2'], [1, '#28465a']]); g.fillRect(9, h - 92, 112, 92);
      g.strokeStyle = 'rgba(223,246,229,0.48)'; g.lineWidth = 0.8;
      for (let y = h - 84; y < h; y += 12) { g.beginPath(); g.moveTo(9, y); g.lineTo(121, y); g.stroke(); }
      for (let x = 18; x < 120; x += 16) { g.beginPath(); g.moveTo(x, h - 92); g.lineTo(x, h); g.stroke(); }
      for (let y = h - 84; y < h - 4; y += 17) for (let x = 15; x < 116; x += 16) if ((x + y) % 4) lit(g, x + 3, y + 2, 5, 6, P.win[(x + y) % 3]);
      // Field at foreground with white boundary and center circle.
      g.fillStyle = '#20684b'; g.fillRect(128, h - 42, 126, 31);
      g.fillStyle = '#94d479'; g.fillRect(131, h - 39, 120, 25);
      g.strokeStyle = '#e6f4ce'; g.lineWidth = 1; g.strokeRect(134, h - 37, 113, 21);
      g.beginPath(); g.moveTo(190, h - 37); g.lineTo(190, h - 16); g.stroke(); g.beginPath(); g.ellipse(190, h - 26.5, 8, 7, 0, 0, Math.PI * 2); g.stroke();
      g.strokeRect(134, h - 33, 11, 13); g.strokeRect(236, h - 33, 11, 13);
      // Cricket practice wickets and pavilion.
      g.fillStyle = '#f7eed4'; [175, 181, 187].forEach((x) => g.fillRect(x, h - 12, 1.2, 7));
      g.fillStyle = '#dae7d2'; g.fillRect(131, h - 48, 116, 5); txt(g, 'CAMPUS FIELD', 154, h - 46.5, 0.65, '#244958');
      tree(g, 10, h - 42, 40, '#1d5948'); tree(g, 251, h - 42, 34, '#28664b');
    }],
    sc_rd_needle: [100, 200, function (g, w, h, P) { rdNeedle(g, 50, h - 4, 1.5, P); }],
    sc_rd_rainier: [260, 190, function (g, w, h, P) { rdRainier(g, 130, h - 2, 1.12); for (let x = 8; x < 260; x += 24) tree(g, x, h - 1, 22 + (x % 3) * 3, '#1c5747'); }],
    sc_rd_seattle: [280, 170, function (g, w, h, P) {
      skyline(w, h, 713, '#20384f', P.accent, 45, 120, 0.25, P.win)(g);
      rdColumbia(g, 87, h - 4, 0.9, P); rdNeedle(g, 217, h - 3, 0.92, P);
      g.fillStyle = '#1c344b'; g.fillRect(0, h - 5, 280, 5);
      g.fillStyle = 'rgba(139,206,190,0.28)'; g.fillRect(0, h - 7, 280, 1);
    }],
    sc_rd_ballpark: [250, 140, function (g, w, h, P) {
      // Retractable-roof ballpark silhouette, intentionally generic and named BALLPARK.
      g.fillStyle = '#253a4e'; g.beginPath(); g.ellipse(125, h - 19, 120, 45, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#617e83'; g.beginPath(); g.ellipse(125, h - 34, 112, 22, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#243c4b'; g.beginPath(); g.ellipse(125, h - 39, 85, 15, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#476b62'; g.beginPath(); g.ellipse(125, h - 21, 56, 17, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#e5d7aa'; g.beginPath(); g.moveTo(125, h - 19); g.lineTo(59, h - 8); g.lineTo(125, h - 4); g.lineTo(191, h - 8); g.closePath(); g.fill();
      g.fillStyle = '#2c7753'; g.beginPath(); g.ellipse(125, h - 16, 41, 11, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#bfd6c0'; g.lineWidth = 1; g.beginPath(); g.ellipse(125, h - 22, 98, 16, 0, Math.PI, 0); g.stroke();
      g.fillStyle = '#b6c8b7'; g.fillRect(26, h - 61, 198, 2); for (let x = 29; x < 224; x += 12) { g.fillStyle = x % 3 ? '#304b5b' : '#455f6b'; g.fillRect(x, h - 59, 7, 24); lit(g, x + 1, h - 54, 5, 5, P.win[x % 3]); }
      txt(g, 'BALLPARK', 94, h - 70, 1, '#f0d998', '#24374b');
      g.fillStyle = '#b7d1bb'; [24, 228].forEach((x) => { g.fillRect(x, h - 84, 2, 20); g.fillRect(x - 8, h - 84, 18, 2); });
      g.fillStyle = '#f5f0d8'; g.fillRect(0, h - 4, 250, 4);
    }],
    sc_rd_stadium: [260, 165, function (g, w, h, P) {
      // Open American-football bowl with original twin arch trusses; no league marks.
      g.fillStyle = '#273d51'; g.beginPath(); g.moveTo(5, h - 5); g.lineTo(20, h - 92); g.quadraticCurveTo(130, h - 149, 240, h - 92); g.lineTo(255, h - 5); g.closePath(); g.fill();
      for (let i = 0; i < 8; i++) { const x = 26 + i * 28, y = h - 31 - Math.abs(3.5 - i) * 8; g.fillStyle = i % 2 ? '#627d80' : '#77908a'; g.fillRect(x, y, 18, 24); g.fillStyle = '#e0cf93'; g.fillRect(x, y, 18, 1); for (let j = 0; j < 3; j++) lit(g, x + 3 + j * 5, y + 5, 2, 4, P.win[(i + j) % 3]); }
      g.fillStyle = '#245b46'; g.fillRect(53, h - 15, 154, 9); g.strokeStyle = '#d8e5be'; g.lineWidth = 0.7; g.strokeRect(56, h - 14, 148, 7); g.beginPath(); g.moveTo(130, h - 14); g.lineTo(130, h - 7); g.stroke();
      g.strokeStyle = '#9fb9b1'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, h - 91); g.quadraticCurveTo(130, h - 163, 240, h - 91); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.moveTo(38, h - 82); g.quadraticCurveTo(130, h - 144, 222, h - 82); g.stroke();
      g.strokeStyle = '#839f9d'; g.lineWidth = 0.7;
      for (let x = 37; x < 224; x += 12) { const t = (x - 20) / 220, y = h - 91 - Math.sin(t * Math.PI) * 72; g.beginPath(); g.moveTo(x, y); g.lineTo(x, h - 19 - Math.abs(130 - x) * 0.12); g.stroke(); }
      [20, 238].forEach((x) => { g.fillStyle = '#e6ddbd'; g.fillRect(x, h - 99, 2, 26); g.fillRect(x - 6, h - 99, 14, 2); });
      txt(g, 'STADIUM', 96, h - 50, 1, '#ecf0d9', '#1b3042');
      g.fillStyle = '#9fc4b0'; g.fillRect(0, h - 4, 260, 4);
    }],
    sc_rd_market: [190, 160, function (g, w, h, P) {
      g.fillStyle = '#385963'; g.fillRect(8, h - 98, 174, 98);
      g.fillStyle = '#a7b9a2'; g.fillRect(5, h - 103, 180, 7);
      g.fillStyle = '#274556'; g.fillRect(15, h - 89, 160, 9); txt(g, 'PUBLIC MARKET', 28, h - 87, 0.8, '#f3d876', '#263c4b');
      glowRect(g, '#ffd85a', 22, h - 93, 146, 19);
      for (let x = 20; x < 180; x += 12) { g.fillStyle = 'rgba(216,231,201,0.5)'; g.fillRect(x, h - 73, 1, 67); }
      for (let x = 23; x < 175; x += 21) { g.fillStyle = '#2b7d75'; g.fillRect(x, h - 45, 17, 27); g.fillStyle = '#e6d69d'; g.fillRect(x, h - 47, 17, 3); }
      g.fillStyle = '#a85e61'; g.fillRect(13, h - 5, 172, 5);
      for (let x = 20; x < 180; x += 10) lit(g, x, h - 34, 4, 6, P.win[(x / 10 | 0) % 3]);
      g.fillStyle = '#395c57'; g.fillRect(0, h - 115, 190, 3);
    }],
    sc_rd_coffee: [120, 100, function (g, w, h, P) {
      g.fillStyle = '#294858'; g.fillRect(7, h - 57, 106, 57); g.fillStyle = '#759e91'; g.fillRect(11, h - 54, 98, 51);
      g.fillStyle = '#1a3444'; g.fillRect(10, h - 76, 100, 18); glowRect(g, '#8ce3c2', 10, h - 76, 100, 18);
      txt(g, 'COFFEE', 26, h - 72, 1, '#f4dfaa', '#193a46');
      rrect(g, 48, h - 48, 27, 27, 3, '#eef0dc'); rrect(g, 44, h - 51, 35, 5, 1.4, '#e5d29e');
      g.strokeStyle = '#d1e8d8'; g.lineWidth = 2; g.beginPath(); g.arc(77, h - 38, 7, -1.3, 1.3); g.stroke();
      g.fillStyle = '#754c3b'; g.fillRect(53, h - 44, 17, 5); txt(g, 'JAVA', 54, h - 43, 0.55, '#f4dfb2');
      for (let x = 18; x < 105; x += 24) lit(g, x, h - 14, 13, 8, P.win[(x / 24 | 0) % 3]);
      g.fillStyle = '#203c49'; g.fillRect(0, h - 3, 120, 3);
    }],
    sc_rd_forest: [210, 190, function (g, w, h, P) {
      g.fillStyle = '#25394b'; g.fillRect(0, h - 8, 210, 8);
      for (let i = 0; i < 8; i++) {
        const x = 7 + i * 28, th = 82 + (i * 17 % 65);
        g.fillStyle = '#283d43'; g.fillRect(x + 10, h - th * 0.33, 3, th * 0.33);
        poly(g, [[x, h - th * 0.25], [x + 11, h - th * 0.63], [x + 22, h - th * 0.25]], '#194e42');
        poly(g, [[x + 1, h - th * 0.44], [x + 11, h - th * 0.81], [x + 21, h - th * 0.44]], '#1d5d49');
        poly(g, [[x + 3, h - th * 0.65], [x + 11, h - th], [x + 19, h - th * 0.65]], '#246b4c');
        g.fillStyle = 'rgba(163,218,147,0.28)'; g.fillRect(x + 10, h - th + 4, 1, th * 0.23);
      }
      g.fillStyle = '#254641'; g.fillRect(0, h - 7, 210, 1);
    }]
  };
}
  {
  const MX = 'mexicocentral';
  const mxPal = { top: '#89304d', bot: '#d45a3c', accent: '#ffd15a', win: ['#ffcc62', '#ff8b57', '#5ee4d0'] };
  SKIES[MX] = {
    stops: [[0, '#220b43'], [0.28, '#55205f'], [0.52, '#a93368'], [0.72, '#ef554a'], [0.88, '#ff963f'], [1, '#ffd45e']],
    sun: { x: 426, y: 210, r: 78, c: ['#fff8b0', '#ffbd45', '#ef4760'] },
    halo: ['rgba(255,195,95,0.65)', 'rgba(255,80,130,0.24)'],
    cl: ['rgba(126,45,104,0.52)', 'rgba(255,116,119,0.62)', 'rgba(255,207,136,0.55)'],
    hz: 'rgba(255,174,90,0.55)', stars: 82, seed: 29, stripes: false
  };
  reg2('bg_sky_' + MX, 640, 360, makeSky(SKIES[MX]), FLAT);
  PAL[MX] = { top: '#71304f', bot: '#a94b58', accent: '#ffc15a', win: ['#ffe08a', '#ff985f', '#62e1d4'] };
  MP[MX] = { top: '#6f2a4a', bot: '#a94a52', accent: '#ffcb58', win: ['#ffcf68', '#ff9261', '#5ce1d4'] };

  function mxVolcano(g, cx, base, s, snow) {
    poly(g, [[cx-118*s,base],[cx-73*s,base-35*s],[cx-42*s,base-67*s],[cx-12*s,base-99*s],[cx+6*s,base-109*s],[cx+24*s,base-87*s],[cx+45*s,base-61*s],[cx+83*s,base-33*s],[cx+120*s,base]], lg(g,cx,base-110*s,cx,base,[[0,'#5b315e'],[0.55,'#49264f'],[1,'#291b48']]));
    poly(g, [[cx-19*s,base-89*s],[cx-7*s,base-104*s],[cx+6*s,base-109*s],[cx+17*s,base-94*s],[cx+5*s,base-98*s],[cx-1*s,base-90*s],[cx-9*s,base-96*s]], snow || '#e5b7a0');
    g.strokeStyle='rgba(255,178,132,0.55)'; g.lineWidth=1.1*s; g.beginPath(); g.moveTo(cx-118*s,base); g.lineTo(cx-42*s,base-67*s); g.lineTo(cx-12*s,base-99*s); g.stroke();
  }
  function mxPyramid(g, x, base, w, h, color) {
    const c=color||'#bd654a';
    poly(g,[[x,base],[x+w/2,base-h],[x+w,base]],lg(g,x,base-h,x+w,base,[[0,'#e28b5b'],[0.45,c],[1,'#773c50']]));
    for(let i=1;i<=7;i++){const y=base-i*h/8, half=w*i/16;g.fillStyle=i%2?'rgba(255,203,112,0.78)':'rgba(67,36,55,0.58)';g.fillRect(x+w/2-half,y,half*2,2.1);g.fillStyle='rgba(255,226,164,0.5)';g.fillRect(x+w/2-half,y,half*2,0.65);}
    const stairW=Math.max(5,w*0.055);g.fillStyle='#f0bd77';g.fillRect(x+w/2-stairW/2,base-h+8,stairW,h-8);
    for(let y=base-h+12;y<base;y+=9){g.fillStyle='rgba(92,43,52,0.65)';g.fillRect(x+w/2-stairW/2,y,stairW,1);}
    g.fillStyle='#47283f';g.fillRect(x+w/2-5,base-15,10,15);g.fillStyle='#ffd06a';g.fillRect(x+w/2-4,base-14,1,7);g.fillRect(x+w/2+2,base-14,1,7);
  }
  function mxAngel(g,cx,base,s) {
    const gold=lg(g,cx-13*s,base-120*s,cx+13*s,base,[[0,'#fff0a0'],[0.4,'#e4a948'],[1,'#8e563e']]);
    g.fillStyle='#6b4352';g.fillRect(cx-10*s,base-85*s,20*s,85*s);g.fillStyle='#f6c76c';g.fillRect(cx-13*s,base-86*s,26*s,3*s);g.fillRect(cx-15*s,base-4*s,30*s,4*s);
    for(let y=base-72*s;y<base-9*s;y+=13*s){g.fillStyle='rgba(255,215,132,0.6)';g.fillRect(cx-6*s,y,12*s,2*s);}
    // winged Victory, lifted arm and spread wings
    poly(g,[[cx-5*s,base-94*s],[cx-27*s,base-107*s],[cx-42*s,base-126*s],[cx-20*s,base-119*s],[cx-8*s,base-110*s],[cx-2*s,base-98*s]],gold);
    poly(g,[[cx+5*s,base-94*s],[cx+26*s,base-107*s],[cx+39*s,base-128*s],[cx+22*s,base-118*s],[cx+8*s,base-109*s],[cx+2*s,base-98*s]],gold);
    ell(g,cx,base-101*s,5*s,7*s,'#edc16c');line(g,cx+2*s,base-108*s,cx+8*s,base-137*s,2*s,'#ffe27b');ell(g,cx+9*s,base-139*s,3*s,4*s,'#ffd85e');
    poly(g,[[cx-4*s,base-96*s],[cx+5*s,base-96*s],[cx+7*s,base-82*s],[cx-6*s,base-82*s]],'#e4a948');
  }
  function mxBellas(g,x,base,w,h) {
    const domeY=base-h*0.72;g.fillStyle=lg(g,x,base-h,x+w,base,[[0,'#ffb65c'],[1,'#a94e54']]);
    g.fillRect(x+12,base-h*0.55,w-24,h*0.55);g.fillRect(x+4,base-h*0.51,w-8,5);g.fillRect(x+8,base-h*0.2,w-16,4);
    for(let i=0;i<7;i++){const xx=x+20+i*(w-40)/6;g.fillStyle='#f2bd6d';g.fillRect(xx,base-h*0.47,5,h*0.26);g.fillStyle='#542d4b';g.fillRect(xx+1,base-h*0.45,3,h*0.23);}
    [x+w*0.3,x+w*0.7].forEach((cx)=>{ell(g,cx,domeY, w*0.17,h*0.24,lg(g,cx-w*.17,domeY-h*.24,cx+w*.17,domeY,[[0,'#ffc86b'],[1,'#b85c50']]));g.fillStyle='#ffe29a';g.fillRect(cx-w*.17,domeY,w*.34,2);g.fillStyle='#ffe29a';g.fillRect(cx-1,domeY-h*.34,2,h*.11);});
    g.fillStyle='#f8c56d';g.fillRect(x,base-3,w,3);g.fillStyle='#50304a';g.fillRect(x+w*.43,base-h*.19,w*.14,h*.19);
  }
  function mxTower(g,cx,base,h) {
    const w=h*.34;poly(g,[[cx-w/2,base],[cx-w*.38,base-h*.74],[cx-w*.24,base-h*.84],[cx-w*.14,base-h*.94],[cx,base-h],[cx+w*.14,base-h*.94],[cx+w*.24,base-h*.84],[cx+w*.38,base-h*.74],[cx+w/2,base]],lg(g,cx-w/2,base-h,cx+w/2,base,[[0,'#9bdbd8'],[0.35,'#527d91'],[0.7,'#dda35a'],[1,'#4d395d']]));
    g.save();g.beginPath();g.moveTo(cx-w/2,base);g.lineTo(cx-w*.38,base-h*.74);g.lineTo(cx-w*.24,base-h*.84);g.lineTo(cx-w*.14,base-h*.94);g.lineTo(cx,base-h);g.lineTo(cx+w*.14,base-h*.94);g.lineTo(cx+w*.24,base-h*.84);g.lineTo(cx+w*.38,base-h*.74);g.lineTo(cx+w/2,base);g.closePath();g.clip();
    for(let y=base-h*.9;y<base;y+=8){g.fillStyle='rgba(24,38,64,0.55)';g.fillRect(cx-w/2,y,w,1.3);for(let xx=cx-w*.36;xx<cx+w*.36;xx+=7){lit(g,xx,y+2,3,3,['#ffd36a','#58e2d4','#ff8965'][Math.abs(Math.floor(xx+y))%3]);}}
    g.restore();g.fillStyle='#ffcb68';g.fillRect(cx-1,base-h-5,2,6);
  }
  function mxCathedral(g,x,base,w,h) {
    const body=lg(g,x,base-h,x+w,base,[[0,'#e8c995'],[0.55,'#ad766f'],[1,'#65435a']]);g.fillStyle=body;g.fillRect(x+15,base-h*.62,w-30,h*.62);
    for(let i=0;i<3;i++){const cx=x+w*(.23+i*.27),r=w*.095;g.beginPath();g.arc(cx,base-h*.62,r,r*.75,Math.PI,0);g.fill();g.fillRect(cx-r,base-h*.62,r*2,h*.62);g.fillStyle='#392844';g.fillRect(cx-r*.56,base-h*.5,r*1.12,h*.48);g.fillStyle=body;}
    for(const cx of [x+29,x+w/2,x+w-29]){g.fillStyle='#e6ca94';g.fillRect(cx-8,base-h*.78,16,h*.78);g.fillRect(cx-12,base-h*.8,24,4);poly(g,[[cx-12,base-h*.8],[cx,base-h*.98],[cx+12,base-h*.8]],'#d6ae77');g.fillStyle='#4b3150';g.fillRect(cx-2,base-h*.74,4,10);}
    g.fillStyle='#f2d89e';g.fillRect(x+8,base-h*.64,w-16,4);g.fillRect(x+6,base-5,w-12,5);
  }
  function mxAgave(g,cx,base,s,col) {
    const green=col||'#367d65';for(let i=-4;i<=4;i++){const ang=i*.21, len=(30+Math.abs(i)*3)*s;g.save();g.translate(cx,base);g.rotate(ang);poly(g,[[-2*s,0],[-1.3*s,-len*.72],[0,-len],[2*s,-len*.68],[2*s,0]],i%2?'#286754':green);line(g,0,-len*.1,0,-len*.83,.55,'rgba(169,230,174,.6)');g.restore();}
    ell(g,cx,base,9*s,3*s,'#315544');
  }
  function mxStreet(g,w,h,P) {
    g.fillStyle=lg(g,0,h*.45,0,h,[[0,'#532c56'],[1,'#231b42']]);g.fillRect(0,h*.45,w,h*.55);
    for(let x=0;x<w;x+=34){const bh=55+(x*13%39);g.fillStyle=x%2?'#713c5b':'#8c4a59';g.fillRect(x,h-bh,30,bh);g.fillStyle='#d27a55';g.fillRect(x,h-bh,30,2);for(let y=h-bh+10;y<h-16;y+=14)for(let xx=x+5;xx<x+27;xx+=10)lit(g,xx,y,4,5,P.win[(x+xx+y)%3]);}
  }
  reg2('bg_far_' + MX,640,220,function(g,w,h){
    const base=h-5;skyline(w,h,293,'#653455',PAL[MX].accent,22,55,.18,PAL[MX].win)(g);
    mxVolcano(g,480,base-8,.72,'#e5b7a0');mxPyramid(g,15,base,188,104,'#ba644d');mxAngel(g,355,base,.88);
    g.fillStyle=lg(g,0,h-28,0,h,[[0,'rgba(255,205,105,0)'],[1,'rgba(255,182,89,.38)']]);g.fillRect(0,h-28,w,28);
  },FLAT);
  reg2('bg_farp_' + MX,640,220,function(g,w,h){
    const base=h-2;mxVolcano(g,310,base,1.0,'#c79aa0');
    const hills=[[0,base,150,82],[112,base,305,56],[280,base,450,72],[430,base,640,88]];
    hills.forEach((v,i)=>{poly(g,[[v[0],base],[v[0]+(v[2]-v[0])*.42,base-v[3]],[v[0]+(v[2]-v[0])*.55,base-v[3]+7],[v[2],base]],i%2?'#513257':'#60375a');g.strokeStyle='rgba(255,190,115,.28)';g.lineWidth=1;g.beginPath();g.moveTo(v[0],base);g.lineTo(v[0]+(v[2]-v[0])*.42,base-v[3]);g.stroke();});
    mxAgave(g,44,base,1.15);mxAgave(g,584,base,1.05);mxAgave(g,220,base,.66,'#315d54');mxAgave(g,414,base,.72,'#315d54');
    g.fillStyle='rgba(255,157,92,.18)';g.fillRect(0,h-12,w,12);
  },FLAT);
  reg2('bg_near_' + MX,640,150,function(g,w,h){
    mxStreet(g,w,h,{win:PAL[MX].win});mxAgave(g,34,h,1.15,'#142d39');mxAgave(g,605,h,1.2,'#142d39');mxAgave(g,180,h,0.65,'#193d45');mxAgave(g,470,h,.7,'#193d45');
    g.fillStyle='rgba(17,12,39,.32)';g.fillRect(0,h-18,w,18);g.fillStyle='rgba(255,104,126,.25)';g.fillRect(0,h-20,w,2);
  },FLAT);

  function mxRobot(f) {
    return function(g){const bob=f?1:0;
      poly(g,[[8,13],[17,15],[17,25],[14,33],[4,29],[6,20]],lg(g,4,13,17,33,[[0,'#f34b66'],[.5,'#c93459'],[1,'#68264d']]));line(g,7,18,14,27,1,'#ffd05b');line(g,8,24,13,29,1,'#25cbbd');
      poly(g,[[4,9],[8,3],[24,3],[29,10],[25,14],[7,14]],'#301d42');
      poly(g,[[3,12],[11,8],[22,9],[29,14],[27,19],[22,18],[19,15],[16,18],[10,16],[6,20]],f?'#15a99e':'#ffb52e');
      limb(g,11,26,10+(f?2:-2),34,4,'#4a293e','#e24c55','#ffcf69');limb(g,21,26,22+(f?-2:2),34,4,'#4a293e','#15a99e','#7df3d8');
      rrect(g,6,14+bob,20,14,4,lg(g,6,14,26,28,[[0,'#ffe08b'],[.5,'#e5a84e'],[1,'#9f4d50']]));
      rrect(g,9,16+bob,14,8,2,'#322143');ell(g,12,20+bob,2.3,1.8,'#2ee5d2');ell(g,20,20+bob,2.3,1.8,'#fb496b');line(g,12,24+bob,21,24+bob,1.1,'#fff1c1');
      g.fillStyle='#e84462';g.fillRect(4,26,24,3);line(g,14,11,21,6,2,'#f9d44f');poly(g,[[13,9],[18,6],[22,9],[18,11]],'#20c6b7');
      ell(g,16,5,3.8,2.4,'#e93d60');ell(g,16,4,2.2,1.2,'#ffd36a');
    };
  }
  function mxDrone(f) {
    return function(g){const flap=f?0:1;
      ell(g,16,13,9,4.4,lg(g,7,9,25,18,[[0,'#14b8ac'],[1,'#176c78']]));
      poly(g,[[12,12],[6,4-flap*2],[2,2],[5,11],[11,15]],'#ee4267');poly(g,[[19,12],[25,4-flap*2],[30,2],[27,11],[21,15]],'#ffca55');
      poly(g,[[8,13],[1,9],[4,16],[12,17]],'#d33a63');poly(g,[[22,13],[31,8],[28,16],[20,17]],'#f38c3e');
      ell(g,25,12,3,2.5,'#ff854e');poly(g,[[27,12],[32,13],[27,14]],'#ffd24f');ell(g,25,11,1,1,'#fff4c4');
      line(g,14,11,17,13,1.5,'#fff0ac');line(g,14,14,18,14,1,'#ff5570');ell(g,5,19,1.4,1.4,'#55ffe4');ell(g,27,19,1.4,1.4,'#55ffe4');
    };
  }
  function mxSpider(f) {
    return function(g){
      for(let i=0;i<4;i++){const dx=(f?2:-2)*(i%2?1:-1);limb(g,9+i*4,12,6+i*5+dx,18,1.8,'#653642','#e24b45','#ffb74d');}
      g.strokeStyle='#d84949';g.lineWidth=2.4;g.beginPath();g.moveTo(9,10);g.quadraticCurveTo(2,7,5,3);g.lineTo(9,2);g.stroke();poly(g,[[8,3],[11,0],[12,4]],'#ffd25b');ell(g,8,4,1.2,1.2,'#24cbbd');
      ell(g,14,12,8,5,lg(g,6,7,22,18,[[0,'#ffb743'],[.5,'#dc4b4d'],[1,'#713247']]));
      ell(g,22,12,5,4,'#25203e');eyes(g,21,25,11,1.05);poly(g,[[9,8],[6,3],[11,6],[14,2],[17,7]],'#d43f45');
      line(g,12,14,21,10,.8,'#ffd46a');ell(g,10,12,1.3,1.3,'#27dbca');
    };
  }
  SKINS[MX] = { robot: mxRobot, drone: mxDrone, spider: mxSpider };
  regSkins(MX);
  COINS[MX] = 'MX$';
  regCoins(MX);


  reg2('adobe',32,32,function(g){
    const rows=[0,8,16,24];
    rows.forEach((y,r)=>{g.fillStyle=lg(g,0,y,32,y+8,[[0,r%2?'#d18457':'#c97a50'],[.45,'#9f594b'],[1,'#75434b']]);g.fillRect(0,y,32,8);g.fillStyle='rgba(255,219,143,.55)';g.fillRect(0,y,32,.8);g.fillStyle='rgba(64,39,54,.42)';g.fillRect(0,y+7,32,1);const shift=r%2?0:8;for(let x=shift-8;x<32;x+=16){g.strokeStyle='rgba(255,205,139,.32)';g.lineWidth=.65;g.strokeRect(x+1,y+1,14,5.4);g.fillStyle=(r+x)%3?'#19a99d':'#d94557';poly(g,[[x+7,y+1.6],[x+10,y+3.4],[x+7,y+5.4],[x+4,y+3.4]],g.fillStyle);g.fillStyle='#ffd362';g.fillRect(x+6.5,y+2.7,1,1);}});
  },FLAT);
  reg2('adobe_top',32,8,function(g){
    g.fillStyle=lg(g,0,0,0,8,[[0,'#ffd182'],[.45,'#b96b4e'],[1,'#75404a']]);g.fillRect(0,0,32,8);g.fillStyle='#ffdf98';g.fillRect(0,0,32,1.2);g.fillStyle='#704050';g.fillRect(0,6.8,32,1.2);
    for(let x=2;x<32;x+=6){g.fillStyle='#1bb7ad';poly(g,[[x,2],[x+2,4],[x,6],[x-2,4]],g.fillStyle);g.fillStyle='#e84b5c';g.fillRect(x+2,3,1,2);}
  },FLAT);

  function mxPinata(g,w,h){
    for(let i=0;i<5;i++){const x=w/2+Math.cos(i*Math.PI*2/5)*8,y=14+Math.sin(i*Math.PI*2/5)*8;line(g,w/2,14,x,y,1,'#ffd45d');}
    const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?8:15;pts.push([w/2+Math.cos(a)*r,14+Math.sin(a)*r]);}poly(g,pts,lg(g,6,0,25,h,[[0,'#ef4a67'],[.28,'#ffc841'],[.53,'#25cbbd'],[.78,'#f27538'],[1,'#953a79']]));
    for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;ell(g,w/2+Math.cos(a)*10,14+Math.sin(a)*10,2,2,'#ffe59b');}
    line(g,15,28,11,34,1.4,'#f34d65');line(g,16,28,17,35,1.4,'#26c8b7');line(g,17,28,23,34,1.4,'#ffcf49');
  }
  reg2('prop_pinata',30,36,mxPinata,{shade:.4});
  reg2('prop_papel',38,22,function(g,w,h){
    line(g,0,1,w,1,1,'#f4d77e');for(let i=0;i<5;i++){const x=i*8;poly(g,[[x+1,3],[x+7,3],[x+7,17],[x+4,20],[x+1,17]],['#eb4770','#ffb53d','#1cc8b5','#bf56a1','#f07140'][i]);
      g.strokeStyle='rgba(255,240,190,.78)';g.lineWidth=.65;g.strokeRect(x+2.5,5,3,8);line(g,x+4,4,x+4,14,.55,'#fff0c0');line(g,x+2,9,x+6,9,.55,'#fff0c0');}
  },{shade:.35});

  function mxPyramidPiece(g,w,h,kind){
    const top=kind==='chichen'?34:45, base=h-4;
    mxPyramid(g,kind==='chichen'?23:18,base,w-(kind==='chichen'?46:36),base-top,kind==='chichen'?'#d59a62':'#bc674e');
    if(kind==='chichen'){
      const cx=w/2;g.fillStyle='#4c2b43';g.fillRect(cx-2,base-top+7,4,base-top-7);
      for(let y=base-4;y>base-top+10;y-=6){g.fillStyle='#f2c583';g.fillRect(cx-5,y,10,1.2);}
      poly(g,[[cx-7,base-top+8],[cx,base-top-3],[cx+7,base-top+8]],'#8e4850');
    }
  }
  function mxAngelPiece(g,w,h){mxAngel(g,w*.5,h-3,.93);}
  function mxBellasPiece(g,w,h){mxBellas(g,5,h-3,w-10,Math.min(126,h-12));}
  function mxTowerPiece(g,w,h){mxTower(g,w/2,h-3,h-10);}
  function mxCathedralPiece(g,w,h){mxCathedral(g,4,h-3,w-8,h-12);}
  function mxBoatPiece(g,w,h){
    // Trajinera hull with the local MARIA arch overhead
    line(g,25,15,w-22,15,2,'#ffd76b');for(let x=36;x<w-24;x+=13)line(g,x,15,x-5,4,.8,'#efc477');
    g.strokeStyle='#f2d28c';g.lineWidth=3;g.beginPath();g.moveTo(w*.27,17);g.quadraticCurveTo(w*.5,-4,w*.73,17);g.stroke();
    txt(g,'MARIA',w*.39,1,1,'#ffdb68','#872d57');
    poly(g,[[12,18],[w-12,18],[w-22,35],[24,35]],lg(g,0,18,0,36,[[0,'#ef455d'],[.5,'#24bcb1'],[1,'#e39445']]));
    for(let x=27;x<w-22;x+=16){g.fillStyle=['#ffd053','#fe7890','#6ce2d2'][Math.floor(x/16)%3];g.fillRect(x,21,9,7);g.fillStyle='rgba(255,241,190,.75)';g.fillRect(x,21,9,1);}
    line(g,7,37,w-5,37,1,'#27d0c4');
  }
  function mxPapelPiece(g,w,h){
    const street=h-4;
    g.fillStyle='#37233f';g.fillRect(0,street-23,w,27);g.fillStyle='#dc8551';g.fillRect(0,street-24,w,2);
    for(let i=0;i<7;i++){const x=i*31,bh=24+(i*17%20),col=['#d34a59','#cf7946','#487b76','#a9436c'][i%4];g.fillStyle=col;g.fillRect(x,street-24-bh,29,bh);g.fillStyle='#ffd16a';g.fillRect(x,street-24-bh,29,1.4);for(let y=street-20-bh;y<street-28;y+=9){g.fillStyle='#342547';g.fillRect(x+5,y,5,5);g.fillStyle='#ffe18a';g.fillRect(x+6,y+1,3,3);g.fillStyle='#30c5b5';g.fillRect(x+18,y+1,5,5);}}
    g.fillStyle='#221d38';g.fillRect(0,street-4,w,8);g.fillStyle='#ffd166';g.fillRect(0,street-4,w,1.3);
    line(g,2,12,w-2,4,1.2,'#ffd976');for(let i=0;i<8;i++){const x=8+i*25,y=11-i*1.15;poly(g,[[x-9,y],[x+9,y-1],[x+8,y+13],[x,y+18],[x-8,y+13]],['#ef4267','#ffbd42','#27c5b6','#a84a91'][i%4]);g.strokeStyle='rgba(255,244,197,.8)';g.lineWidth=.7;g.strokeRect(x-4,y+2,8,8);line(g,x,y+1,x,y+11,.5,'#fff0b0');}
  }
  function mxMariachi(g,w,h){
    const xs=[w*.25,w*.5,w*.75];xs.forEach((x,i)=>{const c=['#ec485d','#17a99e','#e4a63c'][i];g.fillStyle=c;g.fillRect(x-10,h-48,20,30);g.fillStyle='#f5cb6b';g.fillRect(x-10,h-20,20,3);ell(g,x,h-55,7,7,'#c98761');
      poly(g,[[x-8,h-58],[x-14,h-62],[x,h-66],[x+14,h-62],[x+8,h-58]],'#22203b');g.fillStyle='#f6d05f';g.fillRect(x-9,h-59,18,1.5);line(g,x-8,h-46,x-16,h-33,3,c);line(g,x+8,h-46,x+15,h-35,3,c);
      if(i===0){line(g,x+6,h-41,x+20,h-30,1.4,'#f5d477');line(g,x+19,h-30,x+22,h-19,1,'#e9c27a');}else if(i===1){line(g,x+7,h-45,x+18,h-45,1.6,'#ebd79a');line(g,x+18,h-48,x+18,h-41,1,'#ebd79a');}else{ell(g,x+17,h-41,7,5,'#f0c64c');line(g,x+11,h-40,x+6,h-32,1,'#f0c64c');}
    });g.fillStyle='#482a48';g.fillRect(4,h-15,w-8,15);g.fillStyle='#f3c45f';g.fillRect(7,h-15,w-14,2);
  }
  function mxOffice(g,w,h){
    g.fillStyle=lg(g,10,0,w-10,h,[[0,'#659b9d'],[.5,'#476b80'],[1,'#352c53']]);g.fillRect(12,18,w-24,h-20);g.fillStyle='#ffc45d';g.fillRect(9,17,w-18,3);
    for(let y=26;y<h-12;y+=12)for(let x=20;x<w-18;x+=13){g.fillStyle='#1e2b4a';g.fillRect(x,y,8,7);lit(g,x+1,y+1,6,5,['#51d4cf','#ffcc62','#f98169'][(x+y)%3]);}
    g.fillStyle='#f5d078';g.fillRect(w/2-23,h-35,46,24);msLogo(g,w/2-17,h-30,13);txt(g,'MICROSOFT',w/2-13,h-19,.72,'#fff0c8','#5a3151');g.fillStyle='#f3c465';g.fillRect(w/2-2,5,4,13);
  }
  function mxMarket(g,w,h){
    g.fillStyle='#673854';g.fillRect(6,h-55,w-12,55);poly(g,[[4,h-54],[w/2,h-93],[w-4,h-54]],'#e3a34f');
    for(let x=12;x<w-12;x+=22){g.fillStyle=(x%2)?'#e84966':'#21b8a8';g.fillRect(x,h-55,12,54);g.fillStyle='rgba(255,224,142,.7)';g.fillRect(x,h-55,12,2);}
    txt(g,'MERCADO',w/2-25,h-42,1,'#ffdf74','#6a2c51');
  }
  function mxBarrio(g,w,h){
    for(let x=0;x<w;x+=32){const bh=45+(x*17%55);g.fillStyle=['#743d59','#a54856','#48516f','#b65b4b'][x/32%4|0];g.fillRect(x,h-bh,30,bh);g.fillStyle='#e8a45b';g.fillRect(x,h-bh,30,2);for(let y=h-bh+9;y<h-9;y+=13){g.fillStyle='#ffd06a';g.fillRect(x+5,y,5,5);g.fillStyle='#46c8b8';g.fillRect(x+18,y+3,5,5);}}
  }
  function mxAgavesPiece(g,w,h){mxAgave(g,27,h-4,.8);mxAgave(g,64,h-5,1.15);mxAgave(g,104,h-4,.92);}
  function mxDesertPiece(g,w,h){
    const base=h-3;for(let i=0;i<4;i++){const x=8+i*31,hh=37+(i*19%34);g.fillStyle=i%2?'#5c3551':'#733b52';g.beginPath();g.moveTo(x,base);g.lineTo(x+7,base-hh);g.lineTo(x+20,base-hh-5);g.lineTo(x+28,base-hh*.48);g.lineTo(x+38,base);g.fill();}mxAgave(g,31,base,.65,'#376454');mxAgave(g,105,base,.7,'#376454');
  }
  function mxBandstand(g,w,h){
    const base=h-5;g.fillStyle='#402947';g.fillRect(10,base-24,w-20,24);g.fillStyle='#e3b457';g.fillRect(6,base-27,w-12,4);g.fillStyle='#ab4a57';g.fillRect(16,base-66,w-32,39);for(let x=22;x<w-20;x+=17){g.fillStyle='#eecb7e';g.fillRect(x,base-65,4,38);}
    poly(g,[[4,base-66],[w/2,base-94],[w-4,base-66]],'#edaa4d');g.fillStyle='#ffd778';g.fillRect(w/2-2,base-99,4,8);for(let x=18;x<w-20;x+=18){lit(g,x,base-20,4,6,'#ffdf71');}
  }
  SC[MX] = {
    sc_mx_pyramidsun:[230,185,function(g,w,h){mxPyramidPiece(g,w,h,'sun');}],
    sc_mx_chichenitza:[200,175,function(g,w,h){mxPyramidPiece(g,w,h,'chichen');}],
    sc_mx_angel:[110,210,function(g,w,h){mxAngelPiece(g,w,h);}],
    sc_mx_bellasartes:[220,155,function(g,w,h){mxBellasPiece(g,w,h);}],
    sc_mx_latinoamericana:[120,210,function(g,w,h){mxTowerPiece(g,w,h);}],
    sc_mx_cathedral:[240,160,function(g,w,h){mxCathedralPiece(g,w,h);}],
    sc_mx_trajinera:[230,125,function(g,w,h){mxBoatPiece(g,w,h);}],
    sc_mx_papelpikado:[210,120,function(g,w,h){mxPapelPiece(g,w,h);}],
    sc_mx_mariachi:[190,145,function(g,w,h){mxMariachi(g,w,h);}],
    sc_mx_microsoft:[220,155,function(g,w,h){mxOffice(g,w,h);}],
    sc_mx_agaves:[140,125,function(g,w,h){mxAgavesPiece(g,w,h);}],
    sc_mx_mercado:[200,130,function(g,w,h){mxMarket(g,w,h);}],
    sc_mx_barrio:[190,155,function(g,w,h){mxBarrio(g,w,h);}],
    sc_mx_mesquite:[150,115,function(g,w,h){mxDesertPiece(g,w,h);}],
    sc_mx_bandstand:[190,140,function(g,w,h){mxBandstand(g,w,h);}]
  };
}
  {
  const R = 'francecentral', P = 'fr';
  const FP = { top: '#533079', bot: '#8b477e', accent: '#ffd17a', win: ['#ffe6a4', '#ffc28e', '#e7ccff'] };

  SKIES[R] = {
    stops: [[0, '#160b3b'], [0.28, '#432064'], [0.5, '#a33c8c'], [0.68, '#df5c91'], [0.84, '#ff9b72'], [1, '#ffe0a2']],
    sun: { x: 470, y: 218, r: 68, c: ['#fff3bd', '#ffbd79', '#f35c9d'] },
    halo: ['rgba(255,205,145,0.6)', 'rgba(248,105,174,0.22)'],
    cl: ['rgba(154,91,178,0.55)', 'rgba(255,151,179,0.6)', 'rgba(255,219,168,0.52)'],
    hz: 'rgba(255,194,142,0.5)', stars: 105, seed: 33
  };
  reg2('bg_sky_' + R, 640, 360, makeSky(SKIES[R]), FLAT);
  PAL[R] = FP;

  function frEiffel(g, cx, base, s, P) {
    // Puddled-iron lattice: splayed legs over the great arch, two platforms, tapering spire and beacon.
    const X = function (u) { return cx + u * s; }, Y = function (v) { return base - v * s; };
    function shape() {
      g.beginPath();
      g.moveTo(X(-38), Y(0)); g.quadraticCurveTo(X(-25), Y(26), X(-21), Y(44));
      g.quadraticCurveTo(X(-14), Y(68), X(-10), Y(90)); g.quadraticCurveTo(X(-5), Y(124), X(-2.3), Y(150));
      g.lineTo(X(2.3), Y(150)); g.quadraticCurveTo(X(5), Y(124), X(10), Y(90));
      g.quadraticCurveTo(X(14), Y(68), X(21), Y(44)); g.quadraticCurveTo(X(25), Y(26), X(38), Y(0));
      g.lineTo(X(27), Y(0)); g.bezierCurveTo(X(23), Y(21), X(10), Y(30), X(0), Y(30));
      g.bezierCurveTo(X(-10), Y(30), X(-23), Y(21), X(-27), Y(0)); g.closePath();
      g.moveTo(X(13), Y(50)); g.quadraticCurveTo(X(6), Y(70), X(3), Y(86)); g.lineTo(X(-3), Y(86));
      g.quadraticCurveTo(X(-6), Y(70), X(-13), Y(50)); g.closePath();
    }
    shape(); g.fillStyle = lg(g, X(-38), 0, X(38), 0, [[0, '#4d2b4f'], [0.45, '#8a5560'], [0.7, '#a2685d'], [1, '#4a2a4c']]); g.fill('evenodd');
    g.save(); shape(); g.clip('evenodd');
    for (let k = -80; k < 80; k += 4.2) {
      line(g, X(k), Y(0), X(k + 52), Y(156), 0.55 * s, 'rgba(255,206,132,0.5)');
      line(g, X(k), Y(0), X(k - 52), Y(156), 0.55 * s, 'rgba(255,206,132,0.5)');
    }
    for (let v = 6; v < 150; v += 7) line(g, X(-40), Y(v), X(40), Y(v), 0.5 * s, 'rgba(52,26,56,0.55)');
    g.fillStyle = 'rgba(255,240,190,0.18)'; g.fillRect(X(-40), Y(160), 40 * s, 160 * s);
    g.restore();
    shape(); g.strokeStyle = '#f2c56d'; g.lineWidth = 1.1 * s; g.stroke();
    // first and second floor galleries with warm windows, top cabin and beacon
    g.fillStyle = '#3c2345'; g.fillRect(X(-25), Y(49), 50 * s, 7 * s);
    g.fillStyle = '#e8b862'; g.fillRect(X(-26), Y(49), 52 * s, 1.4 * s); g.fillRect(X(-25), Y(43), 50 * s, 1 * s);
    for (let u = -22; u < 22; u += 4) lit(g, X(u), Y(47), 1.8 * s, 2.4 * s, P.win[(u + 30) % 3]);
    for (let u = -24; u <= 24; u += 3) line(g, X(u), Y(52), X(u), Y(49), 0.5 * s, '#f3d08a');
    g.fillStyle = '#3c2345'; g.fillRect(X(-13), Y(94), 26 * s, 5 * s);
    g.fillStyle = '#e8b862'; g.fillRect(X(-14), Y(94), 28 * s, 1.2 * s);
    for (let u = -11; u < 11; u += 3.5) lit(g, X(u), Y(92.6), 1.5 * s, 2 * s, P.win[(Math.round(u) + 30) % 3]);
    g.fillStyle = '#4a2b4c'; g.fillRect(X(-4), Y(155), 8 * s, 7 * s);
    lit(g, X(-2.6), Y(153), 5.2 * s, 2.2 * s, '#ffe7a0');
    g.fillStyle = '#e8b862'; g.fillRect(X(-4.6), Y(155.5), 9.2 * s, 1 * s);
    line(g, X(0), Y(155), X(0), Y(170), 1 * s, '#d6a961');
    glowRect(g, '#fff3a0', X(-3), Y(172), 6 * s, 4 * s); ell(g, X(0), Y(170.5), 1.4 * s, 1.4 * s, '#fff6c4');
    // arch filigree and sparkling lights along the edges
    g.strokeStyle = 'rgba(255,220,140,0.85)'; g.lineWidth = 0.8 * s; g.beginPath();
    g.moveTo(X(-22), Y(4)); g.bezierCurveTo(X(-18), Y(20), X(-8), Y(26), X(0), Y(26)); g.bezierCurveTo(X(8), Y(26), X(18), Y(20), X(22), Y(4)); g.stroke();
    [[-33, 8], [-24, 30], [-19, 58], [-13, 80], [-8, 108], [-5, 128], [-3, 142]].forEach(function (q) {
      [-1, 1].forEach(function (sd) { ell(g, X(q[0] * sd), Y(q[1]), 0.9 * s, 0.9 * s, '#fff0b0'); });
    });
    g.fillStyle = '#2c1c3c'; g.fillRect(X(-40), Y(1.5), 16 * s, 1.5 * s); g.fillRect(X(24), Y(1.5), 16 * s, 1.5 * s);
  }
  function frArc(g, cx, base, s, P) {
    const w = 88 * s, h = 70 * s, x = cx - w / 2, y = base - h;
    g.fillStyle = silFill(g, y, base, '#d6a86e', '#71456d');
    g.fillRect(x, y + 13 * s, w, h - 13 * s);
    poly(g, [[x - 5 * s, y + 16 * s], [cx, y - 2 * s], [x + w + 5 * s, y + 16 * s], [x + w, y + 24 * s], [x, y + 24 * s]], '#e4b96e');
    g.fillStyle = '#f1d089'; g.fillRect(x - 3 * s, y + 20 * s, w + 6 * s, 4 * s);
    g.fillStyle = '#8d526e'; g.fillRect(cx - 12 * s, y + 30 * s, 24 * s, 37 * s);
    g.fillStyle = '#261a43'; g.fillRect(cx - 7 * s, y + 36 * s, 14 * s, 31 * s);
    g.fillStyle = '#f0ce84'; g.fillRect(cx - 10 * s, y + 63 * s, 20 * s, 4 * s);
    for (let i = 0; i < 7; i++) {
      const px = x + (8 + i * 12) * s;
      line(g, px, y + 24 * s, px + 2 * s, y + 31 * s, 1.2 * s, '#f6d88e');
      ell(g, px + 1 * s, y + 28 * s, 1.7 * s, 2.2 * s, i % 2 ? '#f2bd76' : '#c98375');
    }
    for (let i = 0; i < 5; i++) {
      const px = x + (7 + i * 18) * s;
      lit(g, px, y + 43 * s, 3 * s, 10 * s, P.win[i % P.win.length]);
    }
    line(g, x - 4 * s, base - 2 * s, x + w + 4 * s, base - 2 * s, 2 * s, '#e8c77d');
  }
  function frSacre(g, cx, base, s, P) {
    // Montmartre butte: wooded slopes, the long white stairway and the Romano-Byzantine basilica.
    const X = function (u) { return cx + u * s; }, Y = function (v) { return base - v * s; };
    const stone = function (top, bot) { return lg(g, 0, Y(top), 0, Y(bot), [[0, '#fff9ee'], [0.6, '#ecdcd4'], [1, '#b39cb2']]); };
    function dome(dx, y0, r, h) {
      g.beginPath(); g.moveTo(X(dx - r), Y(y0));
      g.bezierCurveTo(X(dx - r), Y(y0 + h * 0.58), X(dx - r * 0.42), Y(y0 + h), X(dx), Y(y0 + h));
      g.bezierCurveTo(X(dx + r * 0.42), Y(y0 + h), X(dx + r), Y(y0 + h * 0.58), X(dx + r), Y(y0)); g.closePath();
      g.fillStyle = lg(g, X(dx - r), 0, X(dx + r), 0, [[0, '#c9b4c6'], [0.38, '#fffaf2'], [0.7, '#eadbd6'], [1, '#9f86a4']]); g.fill();
      [-0.62, -0.25, 0.12, 0.5].forEach(function (k) {
        g.strokeStyle = 'rgba(146,112,146,0.45)'; g.lineWidth = 0.6 * s; g.beginPath();
        g.moveTo(X(dx + k * r), Y(y0)); g.quadraticCurveTo(X(dx + k * r * 0.9), Y(y0 + h * 0.6), X(dx), Y(y0 + h)); g.stroke();
      });
      g.fillStyle = '#d8c6c8'; g.fillRect(X(dx - r - 0.6), Y(y0 + 0.4), (2 * r + 1.2) * s, 1.4 * s);
    }
    function lantern(dx, y0, w, h) {
      g.fillStyle = stone(y0 + h, y0); g.fillRect(X(dx - w / 2), Y(y0 + h), w * s, h * s);
      for (let u = -w / 2 + 1; u < w / 2; u += 2) line(g, X(dx + u), Y(y0 + h - 1), X(dx + u), Y(y0 + 1), 0.4 * s, '#a28aa2');
      dome(dx, y0 + h, w / 2 + 0.4, w * 0.9);
      line(g, X(dx), Y(y0 + h + w * 0.9), X(dx), Y(y0 + h + w * 0.9 + 6), 0.9 * s, '#e3c27a');
      line(g, X(dx - 1.6), Y(y0 + h + w * 0.9 + 4), X(dx + 1.6), Y(y0 + h + w * 0.9 + 4), 0.7 * s, '#e3c27a');
    }
    // the butte with trees and the stair
    g.beginPath(); g.moveTo(X(-64), Y(0)); g.quadraticCurveTo(X(-46), Y(17), X(-28), Y(22)); g.lineTo(X(28), Y(22));
    g.quadraticCurveTo(X(46), Y(17), X(64), Y(0)); g.closePath();
    g.fillStyle = lg(g, 0, Y(22), 0, Y(0), [[0, '#5f7a63'], [0.6, '#3f4f55'], [1, '#2b2442']]); g.fill();
    [[-56, 3], [-48, 8], [-40, 12], [-33, 16], [-23, 6], [-17, 12], [17, 12], [23, 6], [33, 16], [40, 12], [48, 8], [56, 3]].forEach(function (t, i) {
      ell(g, X(t[0]), Y(t[1]), 4.6 * s, 3.8 * s, i % 2 ? '#4e7656' : '#3c6150');
      ell(g, X(t[0] - 1), Y(t[1] + 1.2), 2.6 * s, 1.6 * s, 'rgba(184,214,150,0.5)');
    });
    poly(g, [[X(-9), Y(0)], [X(9), Y(0)], [X(5), Y(22)], [X(-5), Y(22)]], '#e2d3cc');
    for (let v = 2; v < 22; v += 2.2) line(g, X(-9 + v * 0.18), Y(v), X(9 - v * 0.18), Y(v), 0.5 * s, '#a58fa3');
    [-10, 10].forEach(function (u) { lamp(g, X(u), Y(0), 9 * s, '#ffd78a'); });
    // campanile behind the right flank
    g.fillStyle = stone(86, 30); g.fillRect(X(27), Y(86), 11 * s, 56 * s);
    for (let v = 40; v < 82; v += 13) { g.fillStyle = '#5a3f62'; g.fillRect(X(30), Y(v + 7), 5 * s, 7 * s); ell(g, X(32.5), Y(v + 7), 2.5 * s, 2 * s, '#5a3f62'); }
    g.fillStyle = '#d8c6c8'; g.fillRect(X(26), Y(87), 13 * s, 1.6 * s);
    lantern(32.5, 87, 9, 5);
    // nave, flanking domes and the great ovoid dome on its colonnaded drum
    g.fillStyle = stone(58, 22); g.fillRect(X(-34), Y(58), 68 * s, 36 * s);
    g.fillStyle = '#d6c4c6'; g.fillRect(X(-35), Y(58.5), 70 * s, 1.6 * s); g.fillRect(X(-34), Y(46), 68 * s, 1 * s);
    for (let u = -30; u <= 30; u += 6) if (Math.abs(u) > 18) { g.fillStyle = '#6d4c70'; g.fillRect(X(u - 1.3), Y(55), 2.6 * s, 6 * s); ell(g, X(u), Y(55), 1.3 * s, 1 * s, '#6d4c70'); }
    [-24, 24].forEach(function (dx) {
      g.fillStyle = stone(68, 58); g.fillRect(X(dx - 6.5), Y(68), 13 * s, 10 * s);
      for (let u = -5; u <= 5; u += 2.5) line(g, X(dx + u), Y(67), X(dx + u), Y(59), 0.6 * s, '#a58fa3');
      dome(dx, 68, 7.5, 15);
      lantern(dx, 83, 3.6, 3);
    });
    g.fillStyle = stone(82, 58); g.fillRect(X(-14), Y(82), 28 * s, 24 * s);
    g.fillStyle = '#d6c4c6'; g.fillRect(X(-15), Y(82.5), 30 * s, 1.8 * s); g.fillRect(X(-15), Y(71), 30 * s, 1 * s);
    for (let u = -12; u <= 12; u += 3) {
      line(g, X(u), Y(81), X(u), Y(72), 0.9 * s, '#fffaf0'); line(g, X(u + 0.9), Y(81), X(u + 0.9), Y(72), 0.6 * s, '#9e86a0');
      if (u < 12) { g.fillStyle = '#5a3f62'; g.fillRect(X(u + 1.2), Y(68), 1.4 * s, 6 * s); }
    }
    dome(0, 82, 15, 31);
    lantern(0, 113, 6, 6);
    // portico with three arches and two bronze riders
    g.fillStyle = stone(46, 22); g.fillRect(X(-19), Y(46), 38 * s, 24 * s);
    poly(g, [[X(-20), Y(46)], [X(0), Y(52)], [X(20), Y(46)]], '#f2e6df');
    g.fillStyle = '#d6c4c6'; g.fillRect(X(-20), Y(46), 40 * s, 1.2 * s);
    [-11, 0, 11].forEach(function (u) {
      g.fillStyle = '#3e2a4e'; g.fillRect(X(u - 4), Y(39), 8 * s, 17 * s); ell(g, X(u), Y(39), 4 * s, 4 * s, '#3e2a4e');
      lit(g, X(u - 2), Y(32), 4 * s, 7 * s, P.win[(u + 33) % 3]);
    });
    [-23, 23].forEach(function (u) {
      g.fillStyle = '#e6d6cf'; g.fillRect(X(u - 3), Y(32), 6 * s, 10 * s);
      ell(g, X(u), Y(35), 3.2 * s, 2 * s, '#4d6e65'); line(g, X(u + (u < 0 ? 2 : -2)), Y(35), X(u + (u < 0 ? 3 : -3)), Y(39), 1.2 * s, '#4d6e65');
      ell(g, X(u), Y(38), 1.2 * s, 1.4 * s, '#5c8075');
    });
  }
  function frMontparnasse(g, cx, base, s, P) {
    poly(g, [[cx - 19 * s, base], [cx - 13 * s, base - 128 * s], [cx - 6 * s, base - 146 * s], [cx + 6 * s, base - 146 * s], [cx + 13 * s, base - 128 * s], [cx + 19 * s, base]], lg(g, cx - 19 * s, base - 146 * s, cx + 19 * s, base, [[0, '#675278'], [0.55, '#332748'], [1, '#1c1834']]));
    g.fillStyle = '#e9a6ac'; g.fillRect(cx - 20 * s, base - 128 * s, 40 * s, 2.5 * s);
    for (let y = 0; y < 12; y++) for (let x = 0; x < 5; x++) lit(g, cx - 11 * s + x * 5 * s, base - 119 * s + y * 9.2 * s, 2 * s, 3.6 * s, P.win[(x + y) % 3]);
    line(g, cx, base - 146 * s, cx, base - 157 * s, 1.4 * s, '#e6c57f');
    glowRect(g, '#fff0a0', cx - 2 * s, base - 160 * s, 4 * s, 3 * s);
  }
  function frNotreDame(g, cx, base, s, P) {
    const x = cx - 56 * s, y = base - 66 * s;
    g.fillStyle = silFill(g, y, base, '#9f6b78', '#482c59'); g.fillRect(x + 3 * s, y + 30 * s, 106 * s, 36 * s);
    g.fillRect(x, y + 4 * s, 31 * s, 62 * s); g.fillRect(x + 81 * s, y + 4 * s, 31 * s, 62 * s);
    g.fillStyle = '#d6a66f'; g.fillRect(x - 2 * s, y + 27 * s, 116 * s, 4 * s);
    for (let t = 0; t < 2; t++) {
      const tx = x + 3 * s + t * 81 * s;
      g.fillRect(tx, y, 31 * s, 5 * s); g.fillRect(tx + 5 * s, y - 6 * s, 21 * s, 7 * s);
      for (let k = 0; k < 4; k++) g.fillRect(tx + (4 + k * 7) * s, y + 8 * s, 2.5 * s, 13 * s);
      ell(g, tx + 15.5 * s, y + 23 * s, 6 * s, 6 * s, '#291b45');
      ell(g, tx + 15.5 * s, y + 23 * s, 4 * s, 4 * s, '#d4a266');
      line(g, tx + 15.5 * s, y - 6 * s, tx + 15.5 * s, y - 14 * s, 1.2 * s, '#e8c679');
    }
    ell(g, cx, y + 43 * s, 11 * s, 11 * s, '#25163e'); ell(g, cx, y + 43 * s, 8.5 * s, 8.5 * s, '#c67b93');
    for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4; line(g, cx, y + 43 * s, cx + Math.cos(an) * 8 * s, y + 43 * s + Math.sin(an) * 8 * s, 1 * s, '#f3d17f'); }
    g.fillStyle = '#2c1b42'; g.fillRect(cx - 5 * s, y + 52 * s, 10 * s, 14 * s);
    for (let i = 0; i < 8; i++) lit(g, x + 8 * s + i * 14 * s, y + 35 * s, 3 * s, 8 * s, P.win[i % 3]);
  }
  function frMoulin(g, cx, base, s, P) {
    // The red cabaret: bulb-lit facade and marquee, rooftop windmill with lattice sails strung with lights.
    const X = function (u) { return cx + u * s; }, Y = function (v) { return base - v * s; };
    g.fillStyle = lg(g, 0, Y(42), 0, Y(0), [[0, '#ef4c68'], [0.55, '#b3264a'], [1, '#55163a']]);
    g.fillRect(X(-50), Y(42), 100 * s, 42 * s);
    g.fillStyle = '#6e1838'; g.fillRect(X(-52), Y(44), 104 * s, 3 * s);
    for (let u = -48; u <= 48; u += 4) { glowRect(g, '#ffe39a', X(u - 1.2), Y(44.6), 2.4 * s, 2.4 * s); ell(g, X(u), Y(43.4), 0.9 * s, 0.9 * s, '#fff2c0'); }
    for (let u = -44; u <= 44; u += 11) if (u < -30 || u > -6) {
      lit(g, X(u - 2.5), Y(38), 5 * s, 7 * s, P.win[(u + 66) % 3]);
      g.fillStyle = '#ffd2a0'; g.fillRect(X(u - 3.2), Y(31), 6.4 * s, 0.8 * s);
    }
    // marquee sign framed by chasing bulbs
    const sw = 78, sh = 12, sy = 27;
    glowRect(g, '#ff315f', X(-sw / 2 - 2), Y(sy + 2), (sw + 4) * s, (sh + 4) * s);
    rrect(g, X(-sw / 2), Y(sy), sw * s, sh * s, 1.5 * s, '#2a0d24');
    for (let u = -sw / 2 + 2; u < sw / 2; u += 4) { ell(g, X(u), Y(sy - 0.8), 0.8 * s, 0.8 * s, '#fff1b0'); ell(g, X(u), Y(sy - sh + 0.8), 0.8 * s, 0.8 * s, '#fff1b0'); }
    const sc = Math.min(1.05 * s, (sw - 8) * s / 72);
    txt(g, 'MOULIN ROUGE', cx - txtW('MOULIN ROUGE', sc) / 2, Y(sy) + (sh * s - 7 * sc) / 2, sc, '#fff2b0', '#c11d4c');
    // entrance and posters
    g.fillStyle = '#2a0d24'; g.fillRect(X(-9), Y(13), 18 * s, 13 * s);
    g.fillStyle = lg(g, 0, Y(12), 0, Y(0), [[0, '#ffd68f'], [1, '#c4523d']]); g.fillRect(X(-7), Y(11), 14 * s, 11 * s);
    poly(g, [[X(-13), Y(13)], [X(13), Y(13)], [X(10), Y(16)], [X(-10), Y(16)]], '#ffcf7c');
    [-33, -23, 23, 33].forEach(function (u, i) {
      rrect(g, X(u - 3.5), Y(13), 7 * s, 10 * s, 0.6 * s, i % 2 ? '#ffd27a' : '#f7f0d8');
      ell(g, X(u), Y(9), 2 * s, 2.2 * s, i % 2 ? '#c63158' : '#202a5a');
      poly(g, [[X(u - 2.5), Y(6)], [X(u), Y(9)], [X(u + 2.5), Y(6)]], i % 2 ? '#202a5a' : '#c63158');
    });
    // windmill tower and conical roof
    const mx = -18;
    poly(g, [[X(mx - 10), Y(44)], [X(mx + 10), Y(44)], [X(mx + 7.5), Y(68)], [X(mx - 7.5), Y(68)]], lg(g, X(mx - 10), 0, X(mx + 10), 0, [[0, '#7c1d40'], [0.45, '#e54a68'], [1, '#6b1838']]));
    for (let v = 48; v < 66; v += 4) line(g, X(mx - 9 + (v - 44) * 0.1), Y(v), X(mx + 9 - (v - 44) * 0.1), Y(v), 0.5 * s, 'rgba(70,10,30,0.5)');
    lit(g, X(mx - 2), Y(54), 4 * s, 5 * s, '#ffe3a0');
    poly(g, [[X(mx - 10), Y(68)], [X(mx), Y(80)], [X(mx + 10), Y(68)]], lg(g, X(mx - 10), 0, X(mx + 10), 0, [[0, '#4e1630'], [0.5, '#93324f'], [1, '#3d1027']]));
    g.fillStyle = '#ffd27a'; g.fillRect(X(mx - 10.5), Y(68.4), 21 * s, 1 * s);
    const hx = X(mx + 1), hy = Y(64);
    for (let k = 0; k < 4; k++) {
      g.save(); g.translate(hx, hy); g.rotate(k * Math.PI / 2 + 0.42);
      g.fillStyle = '#5b1430'; g.fillRect(0, -0.7 * s, 33 * s, 1.4 * s);
      g.strokeStyle = '#f6d8b6'; g.lineWidth = 0.7 * s; g.strokeRect(7 * s, 0.6 * s, 25 * s, 6 * s);
      for (let j = 0; j < 7; j++) line(g, (7 + j * 4) * s, 0.6 * s, (7 + j * 4) * s, 6.6 * s, 0.5 * s, '#f0c7a8');
      line(g, 7 * s, 3.6 * s, 32 * s, 3.6 * s, 0.4 * s, '#f0c7a8');
      for (let j = 0; j < 8; j++) { glowRect(g, '#ffd86a', (7.4 + j * 3.4) * s, 6.0 * s, 1.4 * s, 1.4 * s); ell(g, (8 + j * 3.4) * s, 6.6 * s, 0.6 * s, 0.6 * s, '#fff4c0'); }
      g.restore();
    }
    ell(g, hx, hy, 3.4 * s, 3.4 * s, '#3a0d22'); ell(g, hx, hy, 2.2 * s, 2.2 * s, '#ffd978');
  }
  function frWallace(g, cx, base, s) {
    const green = '#47795d', dark = '#234840', light = '#a4bf83';
    g.fillStyle = '#c9ab73'; g.fillRect(cx - 16 * s, base - 4 * s, 32 * s, 4 * s);
    g.fillStyle = dark; g.fillRect(cx - 12 * s, base - 42 * s, 24 * s, 38 * s);
    g.fillStyle = green; g.fillRect(cx - 9 * s, base - 39 * s, 18 * s, 31 * s);
    // Four cast-iron caryatids support the domed roof.
    [-10, -4, 4, 10].forEach(function (dx, i) {
      line(g, cx + dx * s, base - 39 * s, cx + dx * s * 1.1, base - 12 * s, 1.6 * s, i % 2 ? light : green);
      ell(g, cx + dx * s, base - 40 * s, 2.2 * s, 2.6 * s, '#d6c58e');
      line(g, cx + dx * s - 2 * s, base - 35 * s, cx + dx * s + 2 * s, base - 35 * s, 0.8 * s, light);
    });
    ell(g, cx, base - 43 * s, 15 * s, 4 * s, dark);
    ell(g, cx, base - 47 * s, 12 * s, 7 * s, green);
    poly(g, [[cx - 12 * s, base - 47 * s], [cx, base - 60 * s], [cx + 12 * s, base - 47 * s]], light);
    ell(g, cx, base - 61 * s, 2.2 * s, 2.2 * s, '#e0bf6c');
    g.fillStyle = '#2c594d'; g.fillRect(cx - 5 * s, base - 23 * s, 10 * s, 11 * s);
    for (let x = -8; x <= 8; x += 16) { ell(g, cx + x * s, base - 27 * s, 1.6 * s, 1.6 * s, '#d4c184'); line(g, cx + x * s, base - 27 * s, cx + x * s, base - 21 * s, 0.8 * s, light); }
    line(g, cx - 13 * s, base - 7 * s, cx + 13 * s, base - 7 * s, 1.4 * s, light);
  }
  function frHaussmann(g, x0, base, w, P) {
    // Haussmann block: limestone facades, wrought-iron balconies, zinc mansards with dormers and chimney pots.
    const stone = P.stone || ['#f6e6cc', '#dcc0a6', '#8f6e83'], zinc = P.zinc || ['#a9b8d0', '#6f7c9c', '#3c3f62'];
    const widths = [w * 0.36, w * 0.31, w * 0.33]; let x = x0;
    widths.forEach(function (bw, index) {
      const hh = index === 1 ? 82 : 70, top = base - hh, eave = top + 16;
      // zinc mansard and chimney stacks with terracotta pots
      [0.22, 0.74].forEach(function (f, k) {
        if (k && bw < 50) return;
        const cxp = x + bw * f;
        g.fillStyle = stone[1]; g.fillRect(cxp - 4, top - 5, 8, 10);
        g.fillStyle = stone[0]; g.fillRect(cxp - 4.6, top - 6, 9.2, 1.4);
        for (let j = 0; j < 3; j++) { g.fillStyle = '#c56f4f'; g.fillRect(cxp - 3.4 + j * 2.5, top - 9, 1.6, 3.2); g.fillStyle = '#e89a6f'; g.fillRect(cxp - 3.4 + j * 2.5, top - 9, 1.6, 0.6); }
      });
      poly(g, [[x - 1.5, eave], [x + 3, top + 3], [x + bw - 3, top + 3], [x + bw + 1.5, eave]], lg(g, 0, top + 3, 0, eave, [[0, zinc[0]], [0.5, zinc[1]], [1, zinc[2]]]));
      for (let zx = x + 3; zx < x + bw - 2; zx += 3) line(g, zx, top + 4, zx + (zx - x - bw / 2) * 0.05, eave - 1, 0.35, 'rgba(230,240,255,0.25)');
      g.fillStyle = zinc[0]; g.fillRect(x + 3, top + 2.4, bw - 6, 1);
      const cols = Math.max(2, Math.floor(bw / 13)), step = (bw - 8) / cols;
      for (let c = 0; c < cols; c++) {
        const wx = x + 4 + c * step + step / 2 - 2.4;
        if (c % 2 === 0) {
          g.fillStyle = stone[1]; g.fillRect(wx - 1, top + 7, 6.8, 9);
          ell(g, wx + 2.4, top + 7, 3.4, 2.4, stone[0]);
          lit(g, wx + 0.6, top + 8.6, 3.6, 5, P.win[(c + index + 1) % P.win.length]);
        }
      }
      // limestone facade, cornice and string courses
      g.fillStyle = lg(g, x, eave, x + bw, base, [[0, stone[0]], [0.6, stone[1]], [1, stone[2]]]);
      g.fillRect(x, eave, bw, hh - 16);
      g.fillStyle = stone[0]; g.fillRect(x - 1.5, eave, bw + 3, 1.8);
      g.fillStyle = 'rgba(40,24,52,0.35)'; g.fillRect(x - 1, eave + 1.8, bw + 2, 1); g.fillRect(x + bw - 1, eave, 1, hh - 16);
      const rows = Math.floor((hh - 16 - 14) / 12);
      for (let row = 0; row < rows; row++) {
        const wy = eave + 4 + row * 12;
        for (let c = 0; c < cols; c++) {
          const wx = x + 4 + c * step + step / 2 - 2.4;
          lit(g, wx, wy, 4.8, 8, P.win[(row + c + index) % P.win.length]);
          g.fillStyle = 'rgba(52,32,60,0.55)'; g.fillRect(wx + 2.2, wy, 0.5, 8);
          g.fillStyle = stone[0]; g.fillRect(wx - 0.8, wy - 1.4, 6.4, 1.2);
        }
        if (row === 0 || row === rows - 1) {
          // continuous wrought-iron balcony
          line(g, x + 1, wy + 8, x + bw - 1, wy + 8, 0.9, '#2a1d38');
          line(g, x + 1, wy + 5.4, x + bw - 1, wy + 5.4, 0.6, '#2a1d38');
          for (let bx = x + 2; bx < x + bw - 1; bx += 1.6) line(g, bx, wy + 5.4, bx, wy + 8, 0.35, '#2a1d38');
        }
      }
      // rusticated ground floor with arched shopfronts
      const gy = base - 13;
      g.fillStyle = stone[2]; g.fillRect(x, gy, bw, 13);
      for (let ry = gy + 3; ry < base; ry += 3) line(g, x, ry, x + bw, ry, 0.35, 'rgba(255,240,220,0.18)');
      for (let c = 0; c < cols; c += 2) {
        const sx = x + 4 + c * step + step / 2 - 4;
        g.fillStyle = '#2a1a36'; g.fillRect(sx, gy + 3, 8 + (c + 1 < cols ? step : 0) * 0.5, 10);
        lit(g, sx + 1, gy + 5, 6 + (c + 1 < cols ? step : 0) * 0.5, 7, P.win[(c + index) % P.win.length]);
      }
      x += bw;
    });
  }
  function frCafe(g, x, base, w, P) {
    const x0 = x - w / 2;
    g.fillStyle = '#432a57'; g.fillRect(x0 + 8, base - 53, w - 16, 53);
    poly(g, [[x0 + 4, base - 43], [x0 + w - 4, base - 43], [x0 + w - 10, base - 24], [x0 + 10, base - 24]], '#e8c796');
    const stripes = Math.floor((w - 20) / 12);
    for (let i = 0; i < stripes; i++) { g.fillStyle = i % 2 ? '#f5e1c2' : '#cf5675'; g.fillRect(x0 + 10 + i * ((w - 20) / stripes), base - 42, (w - 20) / stripes, 17); }
    g.fillStyle = '#f4e3c9'; g.fillRect(x0 + 10, base - 25, w - 20, 2);
    txt(g, 'CAFE', x0 + w / 2 - 12, base - 19, 0.8, '#ffe5a7', '#241832');
    g.fillStyle = '#231831'; g.fillRect(x0 + 13, base - 15, w - 26, 15);
    for (let px = x0 + 20; px < x0 + w - 15; px += 16) lit(g, px, base - 12, 5, 9, P.win[Math.floor(px) % 3]);
    g.fillStyle = '#a87a70'; g.fillRect(x0 + 14, base - 1, w - 28, 1);
  }
  function frBoulang(g, x, base, w, P) {
    // Corner boulangerie: painted wooden shopfront, gold fascia, striped awning and a window full of bread.
    const x0 = x - w / 2, top = base - 128, shop = base - 64;
    const stone = P.stone || ['#f6e6cc', '#dcc0a6', '#8f6e83'], zinc = P.zinc || ['#a9b8d0', '#6f7c9c', '#3c3f62'];
    poly(g, [[x0 - 1, top + 16], [x0 + 4, top + 2], [x0 + w - 4, top + 2], [x0 + w + 1, top + 16]], lg(g, 0, top, 0, top + 16, [[0, zinc[0]], [1, zinc[2]]]));
    for (let c = 0; c < 4; c++) {
      const dx = x0 + 14 + c * (w - 28) / 3 - 4;
      g.fillStyle = stone[1]; g.fillRect(dx, top + 6, 8, 10); ell(g, dx + 4, top + 6, 4, 3, stone[0]);
      lit(g, dx + 1.6, top + 8, 4.8, 6, P.win[c % 3]);
    }
    g.fillStyle = lg(g, 0, top + 16, 0, shop, [[0, stone[0]], [1, stone[1]]]); g.fillRect(x0, top + 16, w, shop - top - 16);
    g.fillStyle = stone[0]; g.fillRect(x0 - 2, top + 16, w + 4, 2);
    for (let row = 0; row < 2; row++) for (let c = 0; c < 5; c++) {
      const wx = x0 + 10 + c * (w - 26) / 4, wy = top + 22 + row * 16;
      lit(g, wx, wy, 6, 11, P.win[(row + c) % 3]);
      g.fillStyle = stone[0]; g.fillRect(wx - 1, wy - 1.6, 8, 1.4);
      line(g, wx - 2, wy + 11, wx + 8, wy + 11, 0.9, '#2a1d38');
      for (let bx = wx - 1.5; bx < wx + 8; bx += 1.5) line(g, bx, wy + 8, bx, wy + 11, 0.35, '#2a1d38');
    }
    // painted shopfront with gold lettering
    g.fillStyle = '#1d4b57'; g.fillRect(x0 + 2, shop, w - 4, 52);
    g.fillStyle = '#123540'; g.fillRect(x0 + 2, shop + 16, w - 4, 2);
    rrect(g, x0 + 5, shop + 2, w - 10, 13, 1.5, '#163e49');
    g.strokeStyle = '#e6c06a'; g.lineWidth = 0.8; g.strokeRect(x0 + 6.5, shop + 3.5, w - 13, 10);
    const sc = Math.min(1.25, (w - 22) / 66);
    txt(g, 'BOULANGERIE', x - txtW('BOULANGERIE', sc) / 2, shop + 3.6 + (10 - 7 * sc) / 2, sc, '#ffe08a', '#0b2129');
    // scalloped striped awning
    const aw = shop + 18;
    poly(g, [[x0 + 3, aw], [x0 + w - 3, aw], [x0 + w + 2, aw + 9], [x0 - 2, aw + 9]], '#f3ead8');
    const n = Math.round((w + 4) / 8);
    for (let k = 0; k < n; k++) {
      const sx = x0 - 2 + k * (w + 4) / n, sw = (w + 4) / n;
      if (k % 2 === 0) poly(g, [[sx + 2, aw], [sx + sw + 2, aw], [sx + sw, aw + 9], [sx, aw + 9]], '#2f7da0');
      ell(g, sx + sw / 2, aw + 9, sw / 2, 2.4, k % 2 ? '#f3ead8' : '#2f7da0');
    }
    // bread-filled windows either side of the door
    const door = 18, ww = (w - 16 - door) / 2, wy = aw + 13;
    [x0 + 6, x0 + 10 + ww + door].forEach(function (wx, side) {
      g.fillStyle = '#0f2c34'; g.fillRect(wx - 1, wy - 1, ww + 2, base - wy - 3);
      g.fillStyle = lg(g, 0, wy, 0, base - 6, [[0, '#ffe2a8'], [1, '#d48a4c']]); g.fillRect(wx, wy, ww, base - wy - 6);
      glowRect(g, '#ffd58a', wx, wy, ww, base - wy - 6);
      line(g, wx, wy + 8, wx + ww, wy + 8, 0.8, '#8a5a3a');
      for (let b = 0; b < 4; b++) {
        const bx = wx + 4 + b * (ww - 8) / 3;
        g.save(); g.translate(bx, wy + 4); g.rotate(-0.9 + b * 0.15);
        ell(g, 0, 0, 6, 1.6, '#c9843f'); for (let c = -3; c <= 3; c += 3) line(g, c - 0.8, -0.6, c + 0.8, 0.6, 0.5, '#f4cf8d');
        g.restore();
      }
      for (let b = 0; b < 3; b++) {
        const bx = wx + 5 + b * (ww - 10) / 2, by = wy + 13;
        ell(g, bx, by, 4, 2.4, '#d08a3e'); ell(g, bx - 0.8, by - 0.8, 2.4, 1, '#f2c27a');
        ell(g, bx + (side ? 0 : 1), by + 4.8, 3.4, 3, '#a66a34'); line(g, bx - 1.6, by + 4, bx + 1.6, by + 5, 0.5, '#e8b56d');
      }
      line(g, wx, wy + 18, wx + ww, wy + 18, 0.8, '#8a5a3a');
    });
    const dx = x - door / 2;
    g.fillStyle = '#123540'; g.fillRect(dx, wy - 2, door, base - wy + 2);
    g.fillStyle = 'rgba(255,214,150,0.75)'; g.fillRect(dx + 3, wy + 1, door - 6, 14);
    ell(g, dx + door - 4, wy + 22, 0.9, 0.9, '#e6c06a');
    g.fillStyle = '#e6c06a'; g.fillRect(x0 + 2, base - 4, w - 4, 1);
    // chalkboard
    poly(g, [[x0 + w - 14, base], [x0 + w - 10, base - 15], [x0 + w - 3, base - 15], [x0 + w + 1, base]], '#3a2a24');
    g.fillStyle = '#25302c'; g.fillRect(x0 + w - 11, base - 14, 9, 10);
    txt(g, 'PAIN', x0 + w - 10.5, base - 11, 0.32, '#f4f1e6');
  }
  function frOffice(g, x, base, w, P) {
    const x0 = x - w / 2, bw = Math.min(w - 12, 130), left = x - bw / 2, h = 86;
    g.fillStyle = lg(g, left, base - h, left + bw, base, [[0, '#735481'], [0.55, '#493858'], [1, '#28223b']]);
    g.fillRect(left, base - h, bw, h);
    g.fillStyle = '#f0bc72'; g.fillRect(left, base - h, bw, 2);
    for (let row = 0; row < 5; row++) for (let col = 0; col < 9; col++) {
      const wx = left + 6 + col * ((bw - 14) / 9), wy = base - h + 8 + row * 13;
      lit(g, wx, wy, 5.6, 7.5, P.win[(row + col) % 3]);
    }
    rrect(g, x - 32, base - 32, 64, 18, 2, '#fff7ed');
    msLogo(g, x - 26, base - 28, 9);
    txt(g, 'MICROSOFT', x - 14, base - 25, 0.44, '#332642');
    g.fillStyle = '#f7e8d5'; g.fillRect(x - 15, base - 9, 30, 9);
  }

  reg2('bg_far_' + R, 640, 220, function (g, w, h) {
    skyline(w, h, 301, '#3f275f', FP.accent, 27, 68, 0.22, FP.win)(g);
    const base = h - 5;
    frSacre(g, 90, base, 0.86, FP);
    frArc(g, 245, base, 0.96, FP);
    frMontparnasse(g, 404, base, 0.9, FP);
    frEiffel(g, 552, base, 0.9, FP);
    g.fillStyle = lg(g, 0, h - 35, 0, h, [[0, 'rgba(255,183,126,0)'], [1, 'rgba(255,183,126,0.35)']]); g.fillRect(0, h - 35, w, 35);
  }, FLAT);
  reg2('bg_farp_' + R, 640, 220, function (g, w, h) {
    // Landmark-free, seamless band of mansard rooftops, chimneys and tiny dormers.
    const base = h - 5;
    for (let tile = 0; tile < 640; tile += 160) {
      // Repeat the same background block and foreground roof module exactly every 160px.
      [[8, 92, 48], [62, 116, 35], [112, 82, 54]].forEach(function (b, i) {
        g.fillStyle = i % 2 ? '#49345f' : '#3f2b56'; g.fillRect(tile + b[0], base - b[1], b[2], b[1]);
        g.fillStyle = 'rgba(255,209,122,0.48)'; g.fillRect(tile + b[0], base - b[1], b[2], 1);
        for (let wy = base - b[1] + 8; wy < base - 5; wy += 10) lit(g, tile + b[0] + 6, wy, 2.4, 3.2, FP.win[(i + wy) % 3]);
      });
      frHaussmann(g, tile, base, 160, { win: FP.win, stone: ['#a98096', '#7f5d80', '#4a3462'], zinc: ['#69698f', '#4b476f', '#2f2a4c'] });
      [24, 80, 136].forEach(function (offset, i) {
        const x = tile + offset;
        g.fillStyle = '#59405d'; g.fillRect(x, base - 83 - (i % 2) * 4, 4, 18 + (i % 2) * 5);
        g.fillStyle = '#d49a71'; g.fillRect(x - 1, base - 84 - (i % 2) * 4, 6, 1.2);
        poly(g, [[x + 4, base - 73], [x + 9, base - 82 - (i % 2) * 4], [x + 14, base - 73]], '#352641');
        lit(g, x + 7, base - 72, 4, 7, FP.win[i % 3]);
      });
    }
  }, FLAT);
  reg2('bg_near_' + R, 640, 190, function (g, w, h) {
    const dark = { top: '#1e1238', bot: '#24133f', accent: '#774566', win: ['#ffcc7c', '#d982a1', '#b69bdf'], stone: ['#4a3260', '#35234c', '#1f1438'], zinc: ['#3a3866', '#29254f', '#171233'] };
    for (let tile = 0; tile < 640; tile += 160) {
      frHaussmann(g, tile, h - 3, 160, dark);
      [24, 80, 136].forEach(function (offset, i) { lamp(g, tile + offset, h - 3, 35 + (i % 2) * 8, i % 2 ? '#ffd58b' : '#f5a8bd'); });
    }
    g.fillStyle = lg(g, 0, h - 24, 0, h, [[0, 'rgba(219,102,161,0)'], [1, 'rgba(219,102,161,0.25)']]); g.fillRect(0, h - 24, w, 24);
  }, FLAT);

  // Regional enemy skins: a bereted mime-bot, pigeon/baguette drones and crawling croissant-bots.
  SKINS[R] = {
    robot: function (f) { return function (g) {
      const step = f ? 2 : 0;
      limb(g, 12, 28, 11 + step, 35, 4.5, '#222039', '#5a4868', '#d9cae6');
      limb(g, 21, 28, 22 - step, 35, 4.5, '#222039', '#5a4868', '#d9cae6');
      rrect(g, 7 + step, 34, 8, 3, 1, '#241835'); rrect(g, 18 - step, 34, 8, 3, 1, '#241835');
      rrect(g, 7, 13, 18, 16, 3, lg(g, 7, 13, 25, 29, [[0, '#f5e8dc'], [0.45, '#172238'], [0.55, '#f5e8dc'], [1, '#172238']]));
      for (let y = 15; y < 28; y += 5) { line(g, 8, y, 24, y, 2.5, '#283d5a'); line(g, 8, y + 1.2, 24, y + 1.2, 0.6, '#8fc2d0'); }
      ell(g, 16, 10.4, 9, 8.4, lg(g, 8, 3, 24, 17, [[0, '#fff9ee'], [1, '#aaa0b5']]));
      rrect(g, 5.6, 4.6, 20.8, 4.2, 2, lg(g, 5, 3, 27, 9, [[0, '#242039'], [0.5, '#100f20'], [1, '#51415d']]));
      ell(g, 16, 5, 2, 1.2, '#dcd0df');
      ell(g, 13, 10.8, 1.5, 1.8, '#e63760'); ell(g, 19, 10.8, 1.5, 1.8, '#e63760');
      line(g, 12, 13, 20, 13, 0.8, '#46313d');
      limb(g, 7, 17, 4, 25, 4, '#a99ab1', '#e2d7e5', '#fff'); limb(g, 25, 17, 28, 25, 4, '#a99ab1', '#e2d7e5', '#fff');
      ell(g, 4, 26, 2.4, 2.4, '#dad0dc'); ell(g, 28, 26, 2.4, 2.4, '#dad0dc');
      line(g, 16, 1, 16, -1, 1, '#dce4ef'); ell(g, 16, 1, 1.2, 1.2, EYE);
    }; },
    drone: function (f) { return function (g) {
      const wing = f ? -3 : 3;
      ell(g, 16, 13, 12, 6.3, lg(g, 4, 8, 27, 19, [[0, '#9da9c0'], [0.55, '#4c4a66'], [1, '#272039']]));
      ell(g, 24, 10, 5.7, 4.8, '#69758b'); ell(g, 25, 8.5, 1.1, 1.1, '#ff3d5c');
      poly(g, [[28, 11], [32, 12], [28, 14]], '#d4a646');
      line(g, 8, 10, 2, 7 + wing, 2, '#a8b7c8'); line(g, 17, 9, 12, 2 + wing, 2, '#a8b7c8');
      ell(g, 2, 7 + wing, 2.2, 1.1, '#dce4ef'); ell(g, 12, 2 + wing, 2.5, 1.2, '#dce4ef');
      // Tech baguette cargo pod with laser eyes.
      poly(g, [[9, 13], [19, 10], [23, 12], [19, 16], [10, 17]], lg(g, 8, 10, 23, 17, [[0, '#f4d18c'], [1, '#a75d37']]));
      for (let i = 0; i < 3; i++) line(g, 12 + i * 3, 12 + i * 0.2, 13 + i * 3, 15, 0.7, '#fff1c6');
      eyeGlow(g, 22, 13, 1.5, EYE);
    }; },
    spider: function (f) { return function (g) {
      const bob = f ? 1 : 0;
      for (let i = 0; i < 4; i++) {
        const dx = i * 5;
        limb(g, 8 + dx, 13, 5 + dx + (i % 2 ? 2 : -1), 19, 1.8, '#5d3d5a', '#b07867', '#edcc98');
      }
      ell(g, 15, 12 - bob, 11.5, 6.4, lg(g, 4, 5, 26, 19, [[0, '#e9bc83'], [0.5, '#c98559'], [1, '#70445c']]));
      poly(g, [[5, 14], [10, 6], [25, 5], [30, 12], [24, 17], [9, 17]], 'rgba(255,238,200,0.36)');
      for (let i = 0; i < 4; i++) ell(g, 10 + i * 4, 11 + (i % 2) * 2, 1.2, 1, '#9f613d');
      eyeGlow(g, 23, 9, 1.1, EYE); ell(g, 28, 10, 1.2, 1.2, EYE);
      poly(g, [[25, 15], [31, 14], [28, 18]], '#fff0d1');
    }; }
  };
  regSkins(R);
  COINS[R] = '\u20AC'; regCoins(R);


  const props = {
    easel: [28, 38, function (g) {
      line(g, 14, 12, 5, 37, 1.8, '#6a3d34'); line(g, 14, 12, 24, 37, 1.8, '#8d5941'); line(g, 8, 27, 21, 27, 1.4, '#b78352');
      rrect(g, 3, 1, 22, 20, 1, '#6b3f42'); rrect(g, 5, 3, 18, 16, 0.5, '#f6dfbd');
      poly(g, [[6, 17], [10, 10], [14, 14], [18, 6], [22, 17]], '#bd5384'); ell(g, 11, 8, 2, 2, '#ffd26e');
      line(g, 14, 21, 14, 35, 1, '#d5a56b');
    }],
    macarons: [28, 26, function (g) {
      [[14, 20, '#ed648c'], [14, 14, '#80c6a9'], [14, 8, '#dba1d1'], [14, 2, '#f0ca78']].forEach(function (q) {
        ell(g, q[0], q[1], 10.5, 4.8, q[2]); ell(g, q[0], q[1] - 1.2, 9.6, 3.2, lg(g, 4, q[1] - 4, 24, q[1] + 3, [[0, '#fff2d6'], [0.45, q[2]], [1, '#74415f']]));
        g.fillStyle = 'rgba(255,255,255,0.65)'; g.fillRect(6, q[1] - 2, 10, 0.7);
      });
    }]
  };
  Object.keys(props).forEach(function (k) { reg2('prop_' + k, props[k][0], props[k][1], props[k][2], { shade: 0.4 }); });

  // Paris ground: wet granite cobbles; the green book-box rail doubles as a recognizable quay edge.
  reg2('quai_paris_top', 32, 8, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 8, [[0, '#ddd2c2'], [0.2, '#8d8390'], [1, '#3c354b']]); g.fillRect(0, 0, 32, 8);
    for (let x = 0; x < 32; x += 5) { ell(g, x + 2.5, 2.4, 2.2, 1.5, x % 2 ? '#8a7f90' : '#a99aac'); line(g, x + 1, 2, x + 3, 1.8, 0.5, 'rgba(255,245,219,0.65)'); }
    g.fillStyle = '#3e263d'; g.fillRect(0, 7, 32, 1);
    g.fillStyle = '#bfd19a'; g.globalAlpha = 0.48; g.fillRect(0, 0, 32, 0.8); g.globalAlpha = 1;
  }, FLAT);
  reg2('quai_paris', 32, 32, function (g) {
    g.fillStyle = lg(g, 0, 0, 0, 32, [[0, '#6f6174'], [0.45, '#53485e'], [1, '#31283f']]); g.fillRect(0, 0, 32, 32);
    const r = rng(414);
    for (let y = 0; y < 32; y += 6) {
      const off = (y / 6) % 2 ? 3 : 0;
      for (let x = off; x < 34; x += 8) {
        g.fillStyle = 'rgba(20,14,34,0.45)'; g.fillRect(x, y, 7.4, 5.3);
        g.fillStyle = 'rgba(214,197,196,' + (0.12 + r() * 0.22) + ')'; g.fillRect(x + 0.7, y + 0.5, 5.8, 0.7);
        g.fillStyle = 'rgba(173,146,164,0.25)'; g.fillRect(x + 1, y + 2, 5.6, 0.8);
      }
    }
    g.fillStyle = '#b9a79c'; g.fillRect(0, 0, 32, 1.2);
    g.fillStyle = 'rgba(88,135,86,0.24)'; g.fillRect(0, 29, 32, 3);
  }, FLAT);
  reg2('rail_quai_paris', 16, 14, function (g) {
    // Repeated dark-green bouquiniste boxes with pale trim and tiny gilded books.
    g.fillStyle = '#182a34'; g.fillRect(0, 4, 16, 10);
    g.fillStyle = '#2e6750'; g.fillRect(1, 2, 14, 10);
    g.fillStyle = '#47795d'; g.fillRect(1, 2, 14, 1.2);
    g.fillStyle = '#203b39'; g.fillRect(3, 5, 10, 6.6);
    for (let x = 4; x < 12; x += 2) { g.fillStyle = x % 4 ? '#cfb873' : '#b56c6e'; g.fillRect(x, 6, 1.1, 4.4); g.fillStyle = '#f0d7a1'; g.fillRect(x, 6, 0.4, 3.4); }
    g.fillStyle = '#d2bd8c'; g.fillRect(0, 1, 16, 1); g.fillRect(1, 12, 14, 1);
    g.fillStyle = '#e2ca91'; g.fillRect(0, 13, 2, 1); g.fillRect(14, 13, 2, 1);
  }, FLAT);
  regWater(R, ['#54a995', '#123f54', '#b9e8ca', '#edc891']);

  // Gold filigree Pont Alexandre III-style bridge, with arched metalwork and statue lamps; deck at y=30.
  reg2('bridge_' + R, 160, 100, function (g) {
    const gold = '#e4b756', hi = '#fff0a4', dark = '#5c3964';
    g.fillStyle = 'rgba(29,20,47,0.66)'; g.fillRect(0, 30, 160, 7);
    g.fillStyle = '#c9a66c'; g.fillRect(0, 28, 160, 2);
    g.fillStyle = '#ead089'; g.fillRect(0, 28, 160, 0.8);
    // graceful arch, spandrel lattice and deck balustrade
    g.strokeStyle = dark; g.lineWidth = 7; g.beginPath(); g.moveTo(6, 31); g.quadraticCurveTo(80, 104, 154, 31); g.stroke();
    g.strokeStyle = gold; g.lineWidth = 4; g.beginPath(); g.moveTo(6, 30); g.quadraticCurveTo(80, 99, 154, 30); g.stroke();
    g.strokeStyle = hi; g.lineWidth = 0.8; g.beginPath(); g.moveTo(7, 29); g.quadraticCurveTo(80, 97, 153, 29); g.stroke();
    for (let x = 10; x < 151; x += 8) {
      const t = (x - 6) / 148, y = 30 + 70 * (1 - 4 * t * (1 - t));
      line(g, x, y, x, 27, 0.8, '#bd9957');
    }
    g.fillStyle = '#b9934e'; g.fillRect(0, 23, 160, 2); g.fillStyle = '#f2d382'; g.fillRect(0, 23, 160, 0.8);
    for (let x = 8; x < 158; x += 7) { g.fillStyle = '#f2d382'; g.fillRect(x, 19, 1, 5); ell(g, x + 0.5, 18, 1, 1.4, '#fff0a4'); }
    // four monumental pylons and gold winged ornaments
    [9, 45, 115, 151].forEach(function (x, i) {
      g.fillStyle = lg(g, x - 7, 0, x + 7, 0, [[0, '#fff0b2'], [0.5, '#c99a4e'], [1, '#68445d']]);
      g.fillRect(x - 5, 8, 10, 20); g.fillRect(x - 7, 25, 14, 3);
      poly(g, [[x - 8, 10], [x, 1], [x + 8, 10]], '#d5aa5a');
      ell(g, x, 2, 3, 3, '#ffe38c');
      line(g, x, 2, x + (i % 2 ? 6 : -6), -7, 1.3, '#f6d982');
      ell(g, x + (i % 2 ? 6 : -6), -8, 3, 1.5, '#f5d377');
      line(g, x - 4, 12, x + 4, 12, 0.8, '#fff0a4');
      lit(g, x - 1.5, 17, 3, 4, '#ffe2a0');
    });
    for (let x = 54; x < 108; x += 9) { ell(g, x, 26, 2.4, 2.4, '#f1d48a'); }
  }, { shade: 0.2, noOutline: true });

  // Bateau-mouche: long glass-roofed Seine tour boat, open stern deck, walkable roof line at y=6.
  reg2('boat_' + R, 120, 36, function (g) {
    poly(g, [[2, 20], [117, 20], [110, 30], [104, 32], [16, 32], [6, 27]], lg(g, 0, 20, 0, 32, [[0, '#f7f1e6'], [0.35, '#d9cfc4'], [0.4, '#2f4c78'], [1, '#182644']]));
    g.fillStyle = '#e1b55e'; g.fillRect(4, 24, 110, 1);
    g.fillStyle = '#efe6d8'; g.fillRect(14, 17, 96, 4);
    // glazed saloon: curved glass roof, slim mullions, passengers' silhouettes
    poly(g, [[16, 18], [18, 9], [24, 6], [100, 6], [106, 9], [108, 18]], lg(g, 0, 6, 0, 18, [[0, '#d8f2f6'], [0.4, '#8fc4d4'], [1, '#3d6b8a']]));
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(24, 6.6, 76, 0.9);
    for (let x = 22; x < 106; x += 6) line(g, x, 7, x - 1, 18, 0.6, '#e6eef0');
    for (let x = 27; x < 100; x += 9) { ell(g, x, 15.2, 1.5, 1.7, x % 2 ? '#4a3a5a' : '#704a5a'); g.fillStyle = 'rgba(40,34,60,0.7)'; g.fillRect(x - 1.8, 16.4, 3.6, 1.6); }
    g.fillStyle = '#f6efe2'; g.fillRect(22, 5, 80, 1.6);
    // open stern deck with rail, flag mast and wheelhouse
    g.fillStyle = '#3c2f4a'; g.fillRect(6, 13, 9, 1); for (let x = 6; x <= 14; x += 2) line(g, x, 13, x, 18, 0.5, '#e8dccb');
    line(g, 4, 20, 4, 8, 0.8, '#d7c7b2'); poly(g, [[4, 8], [10, 9.5], [4, 11]], '#3f8ff0');
    rrect(g, 104, 10, 9, 9, 1.4, '#f2eadc'); lit(g, 106, 11.6, 5, 3.6, '#bfe8f3');
    rrect(g, 42, 21, 38, 6, 1, '#1d2b4a'); txt(g, 'BATEAU AZURE', 61 - txtW('BATEAU AZURE', 0.5) / 2, 22.2, 0.5, '#ffe7a6');
    for (let x = 18; x < 104; x += 7) ell(g, x, 28.4, 0.9, 0.9, '#9fd8f0');
    ell(g, 112, 21, 1.4, 1.2, '#fff1b1'); glowRect(g, '#fff1b1', 110, 19, 4, 4);
  }, { shade: 0.35 });

  // Seine-side bakery stall: striped awning, gold sign, baskets of baguettes and croissants.
  regOb('bakery', 88, 62, function (g) {
    rrect(g, 3, 28, 82, 28, 2, '#1d4b57');
    g.strokeStyle = '#e6c06a'; g.lineWidth = 0.8; g.strokeRect(6, 40, 76, 13);
    txt(g, 'PAIN CHAUD', 44 - txtW('PAIN CHAUD', 0.9) / 2, 43, 0.9, '#ffe08a', '#0b2129');
    [7, 79].forEach(function (x) { g.fillStyle = '#d9c8a4'; g.fillRect(x, 9, 2, 20); });
    for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#f3ead8' : '#2f7da0'; g.fillRect(2 + k * 10.5, 8, 10.5, 8); ell(g, 7.25 + k * 10.5, 16, 5.25, 2.2, k % 2 ? '#f3ead8' : '#2f7da0'); }
    rrect(g, 12, 0, 64, 9, 1.4, '#163e49');
    txt(g, 'BOULANGERIE', 44 - txtW('BOULANGERIE', 0.8) / 2, 1.6, 0.8, '#ffe08a');
    // counter of bread
    g.fillStyle = '#8a5a3a'; g.fillRect(4, 27, 80, 3);
    rrect(g, 9, 21, 22, 7, 2, '#b9874e');
    for (let b = 0; b < 4; b++) { g.save(); g.translate(13 + b * 5, 19); g.rotate(-0.5 + b * 0.25); ell(g, 0, 0, 1.8, 7, '#d0883f'); for (let c = -4; c <= 4; c += 4) line(g, -0.8, c - 0.6, 0.8, c + 0.6, 0.45, '#f6d496'); g.restore(); }
    for (let b = 0; b < 3; b++) { const bx = 42 + b * 9; ell(g, bx, 24.5, 4.2, 2.6, '#d58e3f'); ell(g, bx - 0.8, 23.6, 2.4, 1, '#f5c97e'); ell(g, bx - 4, 25.6, 1.4, 1.2, '#c97c35'); ell(g, bx + 4, 25.6, 1.4, 1.2, '#c97c35'); }
    ell(g, 73, 24, 6, 4, '#a76a33'); line(g, 69, 23, 77, 25, 0.6, '#e8b56d'); line(g, 70, 25.6, 76, 22, 0.6, '#e8b56d');
    [15, 73].forEach(function (x) { ell(g, x, 57, 4.4, 4.4, '#182844'); ell(g, x, 57, 1.6, 1.6, '#c9b98d'); });
  });

  const parisObs = {
    vespa: [62, 36, function (g, w, h) {
      ell(g, 14, 29, 6, 6, '#1f1b34'); ell(g, 14, 29, 3.4, 3.4, '#ccd0d5'); ell(g, 49, 29, 6, 6, '#1f1b34'); ell(g, 49, 29, 3.4, 3.4, '#ccd0d5');
      poly(g, [[9, 26], [18, 20], [28, 22], [38, 17], [47, 19], [52, 24], [49, 28], [20, 28], [15, 25]], lg(g, 9, 17, 52, 29, [[0, '#ffd568'], [0.5, '#4bc8b2'], [1, '#1d6874']]));
      ell(g, 26, 20, 7, 3, '#e9ece7'); line(g, 26, 19, 25, 12, 1.2, '#342444'); line(g, 23, 12, 30, 12, 1.5, '#c6a75e');
      ell(g, 48, 21, 2, 1.5, '#fff6c1'); line(g, 16, 18, 13, 16, 1.4, '#d6b870');
    }],
    cafe: [78, 48, function (g, w, h) {
      // little café table with two chairs as a solid, flat obstacle.
      g.fillStyle = '#37263e'; g.fillRect(5, 43, 68, 3);
      g.fillStyle = '#d28c53'; g.fillRect(20, 25, 38, 4); line(g, 39, 29, 39, 43, 2, '#d0a76e');
      g.fillStyle = '#ead3ad'; g.fillRect(16, 18, 45, 6);
      for (let x = 17; x < 60; x += 8) { g.fillStyle = x % 2 ? '#d34f70' : '#f2e4cc'; g.fillRect(x, 18, 4, 6); }
      line(g, 13, 28, 9, 43, 2, '#b08a69'); line(g, 9, 28, 13, 28, 2, '#b08a69');
      line(g, 66, 29, 66, 44, 2, '#b08a69'); line(g, 61, 29, 69, 29, 2, '#b08a69'); line(g, 61, 30, 61, 44, 2, '#b08a69');
      ell(g, 34, 15, 5, 2.2, '#fff3d4'); rrect(g, 35, 11, 7, 4, 1.5, '#6a4771');
    }],
    kiosk: [56, 58, function (g, w, h) {
      // Parisian Morris column with poster panels and a domed green crown.
      g.fillStyle = '#293c3b'; g.fillRect(18, 10, 20, 46); g.fillStyle = '#47745a'; g.fillRect(21, 14, 14, 37);
      ell(g, 28, 12, 12, 5.5, '#46745b'); ell(g, 28, 8, 9, 5, '#6b9670');
      rrect(g, 22, 17, 12, 15, 2, '#203e40'); rrect(g, 24, 19, 8, 11, 1, '#edb9a2');
      txt(g, 'THEATRE', 23.2, 20, 0.28, '#fff1c5', '#5a294e');
      rrect(g, 22, 34, 12, 14, 1, '#284440');
      for (let y = 36; y < 46; y += 4) { g.fillStyle = y % 2 ? '#d14f78' : '#e8cc8d'; g.fillRect(24, y, 8, 2.6); }
      g.fillStyle = '#d8bc82'; g.fillRect(16, 54, 24, 3); g.fillRect(18, 50, 20, 2);
    }]
  };
  Object.keys(parisObs).forEach(function (k) { obSize[k] = parisObs[k].slice(0, 2); regOb(k, parisObs[k][0], parisObs[k][1], parisObs[k][2]); });

  reg2('secret_' + R, 30, 62, function (g) {
    // Guimard Art Nouveau Metro surround: cast green iron vines and METROPOLITAIN nameplate.
    const iron = '#38775f', light = '#9cbd83', dark = '#1c4a48';
    g.fillStyle = 'rgba(15,9,36,0.72)'; g.fillRect(8, 23, 14, 39);
    rrect(g, 7, 21, 16, 42, 8, iron); g.fillStyle = '#201831'; g.fillRect(10, 31, 10, 31);
    g.fillStyle = '#76a777'; g.fillRect(7, 20, 16, 3); g.fillStyle = '#dbcb8b'; g.fillRect(1, 16.5, 28, 6);
    g.save(); g.translate(3.3, 17.8); g.scale(0.72, 1); txt(g, 'METROPOLITAIN', 0, 0, 0.4, '#fff1b4', '#214437'); g.restore();
    // iconic sweeping Guimard canopy and stems
    g.strokeStyle = dark; g.lineWidth = 3; g.beginPath(); g.moveTo(7, 22); g.quadraticCurveTo(2, 9, 7, 3); g.quadraticCurveTo(15, -1, 23, 4); g.quadraticCurveTo(29, 10, 23, 22); g.stroke();
    g.strokeStyle = light; g.lineWidth = 1.4; g.beginPath(); g.moveTo(7, 21); g.quadraticCurveTo(1, 9, 7, 3); g.quadraticCurveTo(15, -2, 23, 4); g.quadraticCurveTo(29, 10, 23, 21); g.stroke();
    line(g, 7, 20, 7, 28, 2.4, iron); line(g, 23, 20, 23, 28, 2.4, iron);
    for (let i = 0; i < 3; i++) {
      const x = 7 + i * 8;
      g.beginPath(); g.moveTo(x, 17); g.bezierCurveTo(x - 4, 12, x + 3, 9, x, 5); g.strokeStyle = light; g.lineWidth = 0.8; g.stroke();
      ell(g, x + (i % 2 ? 2 : -2), 8, 1.6, 2, '#91bd7c');
    }
    // Repaint the full station name over the ironwork so it remains legible at game scale.
    rrect(g, 1, 16, 28, 8, 1.2, '#214a40'); g.strokeStyle = '#d7c58c'; g.lineWidth = 0.7; g.strokeRect(1, 16, 28, 8);
    g.save(); g.translate(2.8, 18.1); g.scale(0.63, 1); txt(g, 'METROPOLITAIN', 0, 0, 0.48, '#fff1b4', '#183a34'); g.restore();
    g.fillStyle = '#b4c78c'; g.fillRect(12, 39, 1, 16); g.fillRect(17, 39, 1, 16);
    ell(g, 15, 35, 2.4, 2.4, '#e8c77a');
    g.fillStyle = '#d7c58c'; g.fillRect(6, 60, 18, 2);
  }, { shade: 0.3 });

  // Landmark strip: one unique sprite per famous place, plus distinct street and Microsoft office pieces.
  MP[R] = FP;
  SC[R] = {
    sc_fr_eiffel: [176, 200, function (g, w, h, P) {
      frEiffel(g, w / 2, h - 2, 1.1, P);
      // Champ-de-Mars lawn, clipped trees and lamps keep the great arch visible
      g.fillStyle = lg(g, 0, h - 9, 0, h, [[0, '#6f9a68'], [1, '#2f4a45']]); g.fillRect(0, h - 8, w, 8);
      [8, 22, 36, 140, 154, 168].forEach(function (x, i) { g.fillStyle = '#3a2a3a'; g.fillRect(x - 0.8, h - 12, 1.6, 6); ell(g, x, h - 15, 7, 5.4, i % 2 ? '#4f7a58' : '#40664f'); ell(g, x - 2, h - 17, 3, 1.8, 'rgba(190,220,150,0.45)'); });
      [56, 120].forEach(function (x) { lamp(g, x, h - 4, 18, '#ffd98a'); });
    }],
    sc_fr_arc: [176, 142, function (g, w, h, P) { frHaussmann(g, 0, h - 2, w, P); frArc(g, w / 2, h - 2, 1.45, P); }],
    sc_fr_louvre: [194, 146, function (g, w, h, P) {
      frHaussmann(g, 0, h - 2, w, P);
      const base = h - 30, x = w / 2;
      g.fillStyle = '#6f4a67'; g.fillRect(13, base - 59, w - 26, 57);
      g.fillStyle = '#d9ad73'; g.fillRect(11, base - 62, w - 22, 4);
      for (let i = 0; i < 13; i++) { const px = 21 + i * 12; g.fillStyle = '#d6b783'; g.fillRect(px, base - 53, 2.6, 34); }
      // glass pyramid, gold frame and cool lit panes
      poly(g, [[x - 39, base], [x, base - 52], [x + 39, base]], 'rgba(106,202,210,0.55)');
      line(g, x - 39, base, x, base - 52, 2, '#e8c778'); line(g, x + 39, base, x, base - 52, 2, '#e8c778'); line(g, x - 39, base, x + 39, base, 2, '#e8c778');
      line(g, x - 19, base, x, base - 52, 0.8, '#e4ebdf'); line(g, x + 19, base, x, base - 52, 0.8, '#e4ebdf'); line(g, x - 26, base - 17, x + 26, base - 17, 0.8, '#f5df9b');
      glowRect(g, '#83e7e5', x - 17, base - 28, 34, 22);
    }],
    sc_fr_notredame: [178, 160, function (g, w, h, P) { frNotreDame(g, w / 2, h - 2, 1.28, P); }],
    sc_fr_sacrecoeur: [176, 180, function (g, w, h, P) { frSacre(g, w / 2, h - 2, 1.32, P); }],
    sc_fr_moulinrouge: [154, 148, function (g, w, h, P) { frHaussmann(g, 0, h - 2, w, P); frMoulin(g, w / 2, h - 2, 1.28, P); }],
    sc_fr_haussmann: [210, 142, function (g, w, h, P) { frHaussmann(g, 0, h - 2, w, P); }],
    sc_fr_rooftops: [230, 150, function (g, w, h, P) {
      // Typical Paris roofscape: a stepped back row of zinc mansards behind a front block, with a cat on the ridge.
      const back = { win: P.win, stone: ['#c9a7b4', '#a17f97', '#5e4568'], zinc: ['#7f8cad', '#5b6488', '#343659'] };
      frHaussmann(g, -30, h - 30, 150, back); frHaussmann(g, 110, h - 22, 140, back);
      frHaussmann(g, 0, h - 2, w, P);
      const cx = 132, cy = h - 92;
      ell(g, cx, cy, 4.6, 3, '#231a2e'); ell(g, cx + 4.4, cy - 3, 2.4, 2.2, '#231a2e');
      poly(g, [[cx + 3, cy - 4.4], [cx + 3.6, cy - 7], [cx + 4.6, cy - 4.8]], '#231a2e'); poly(g, [[cx + 5, cy - 4.6], [cx + 6, cy - 7], [cx + 6.4, cy - 4.2]], '#231a2e');
      g.strokeStyle = '#231a2e'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(cx - 4, cy); g.quadraticCurveTo(cx - 9, cy - 1, cx - 8, cy - 7); g.stroke();
      ell(g, cx + 5.2, cy - 3.2, 0.5, 0.5, '#ffe58a');
    }],
    sc_fr_cafe: [146, 130, function (g, w, h, P) { frHaussmann(g, 0, h - 2, 146, P); frCafe(g, 73, h - 2, 100, P); }],
    sc_fr_boulangerie: [150, 140, function (g, w, h, P) { frBoulang(g, 75, h - 2, 140, P); }],
    sc_fr_microsoft_office: [232, 172, function (g, w, h, P) { frOffice(g, w / 2, h - 2, w, P); txt(g, 'ISSY', 95, h - 14, 0.38, '#d4eaff', '#201b34'); }],
    sc_fr_wallace_fountain: [104, 126, function (g, w, h) { frWallace(g, w / 2, h - 2, 1.4); lamp(g, 14, h - 2, 27, '#ffd287'); }]
  };
}
  /* national landmarks: westeurope */
{
  Object.assign(SC.westeurope, {
    sc_we_kinderdijk: [250, 190, function (g, w, h, P) {
      g.fillStyle = lg(g, 0, h - 26, 0, h, [[0, '#477a62'], [1, '#173b43']]);
      g.fillRect(0, h - 26, w, 26);
      g.fillStyle = '#294c58'; g.fillRect(0, h - 17, w, 10);
      for (let i = 0; i < 3; i++) {
        const x = 43 + i * 82, top = h - (112 + (i === 1 ? 18 : 0));
        poly(g, [[x - 19, h - 20], [x - 12, top + 23], [x + 12, top + 23], [x + 20, h - 20]], lg(g, x - 16, top, x + 17, h, [[0, '#d7b87e'], [0.55, '#835264'], [1, '#34264d']]));
        poly(g, [[x - 13, top + 25], [x + 13, top + 25], [x + 10, top + 53], [x - 10, top + 53]], '#503650');
        for (let row = 0; row < 2; row++) for (let col = -1; col <= 1; col++) lit(g, x + col * 7 - 1.5, top + 31 + row * 10, 3, 5, P.win[(i + row + col + 3) % 3]);
        ell(g, x, top + 21, 21, 5, '#d8b676');
        for (let b = 0; b < 4; b++) {
          const a = b * Math.PI / 2 + 0.18;
          const bx = x + Math.cos(a) * 51, by = top + 21 + Math.sin(a) * 51;
          line(g, x, top + 21, bx, by, 4, '#211d43');
          line(g, x, top + 21, bx, by, 1.4, P.accent);
          ell(g, bx, by, 2.2, 2.2, '#fff0bd');
        }
        ell(g, x, top + 21, 5, 5, P.accent);
      }
      line(g, 0, h - 17, w, h - 17, 1, '#8ad4c4');
    }],
    sc_we_erasmus: [250, 165, function (g, w, h, P) {
      const deck = h - 30;
      g.fillStyle = lg(g, 0, deck, 0, h, [[0, '#355477'], [1, '#172b50']]); g.fillRect(0, deck, w, h - deck);
      // The Swan's long, sloping white pylon is the bridge's defining silhouette.
      line(g, 127, deck, 172, 14, 12, '#a9c7e9');
      line(g, 128, deck, 173, 14, 3, P.accent);
      line(g, 20, deck - 8, 235, deck - 8, 9, '#1b2451');
      line(g, 20, deck - 11, 235, deck - 11, 3, '#d7eaff');
      line(g, 128, deck - 12, 239, deck - 11, 2, '#c6d9ee');
      for (let x = 32; x <= 226; x += 16) {
        const t = (x - 128) / 111;
        const y = deck - 13 - Math.max(0, t) * 2;
        line(g, 128, 22, x, y, 1.1, '#89a9d2');
      }
      for (let x = 32; x < 230; x += 23) lit(g, x, deck - 7, 3, 2, P.win[(x / 23 | 0) % 3]);
      line(g, 10, h - 5, 240, h - 5, 2, '#6d7da8');
      ell(g, 40, deck + 14, 20, 3, '#78bed2'); ell(g, 205, deck + 14, 25, 3, '#78bed2');
    }],
    sc_we_cubes: [210, 170, function (g, w, h, P) {
      g.fillStyle = lg(g, 0, h - 25, 0, h, [[0, '#563c76'], [1, '#242344']]); g.fillRect(0, h - 25, w, 25);
      const cubes = [[58, h - 68, 0], [112, h - 82, 1], [163, h - 60, 2]];
      cubes.forEach(function (c, i) {
        const x = c[0], y = c[1], shift = c[2] * 2;
        line(g, x - 5, h - 22, x - 5, y + 24, 5, '#332746');
        line(g, x + 5, h - 22, x + 5, y + 24, 5, '#332746');
        poly(g, [[x, y], [x + 24, y - 22], [x + 48, y], [x + 24, y + 23]], '#ffd178');
        poly(g, [[x, y], [x + 24, y + 23], [x + 24, y + 57], [x, y + 34]], lg(g, x, y, x + 25, y + 57, [[0, '#e99d73'], [1, '#914a79']]));
        poly(g, [[x + 24, y + 23], [x + 48, y], [x + 48, y + 34], [x + 24, y + 57]], lg(g, x + 24, y, x + 48, y + 58, [[0, '#8f78bd'], [1, '#39406c']]));
        line(g, x + 1, y + 2, x + 23, y + 22, 1.5, P.accent);
        lit(g, x + 7, y + 22 + shift, 4, 7, P.win[i % 3]); lit(g, x + 31, y + 23, 4, 7, P.win[(i + 1) % 3]);
      });
    }],
    sc_we_euromast: [120, 225, function (g, w, h, P) {
      const cx = 59;
      g.fillStyle = '#382e5e'; g.fillRect(17, h - 20, 88, 8);
      poly(g, [[cx - 9, h - 19], [cx - 5, 68], [cx + 5, 68], [cx + 10, h - 19]], lg(g, cx - 8, 68, cx + 9, h, [[0, '#d5d9ee'], [0.48, '#806eaa'], [1, '#40305f']]));
      line(g, cx - 3, 68, cx - 3, h - 20, 1.7, P.accent);
      g.fillStyle = '#29244f'; g.fillRect(cx - 29, 66, 58, 8);
      ell(g, cx, 57, 30, 14, '#a6c4df'); ell(g, cx, 55, 24, 11, '#534d88');
      line(g, cx - 23, 62, cx - 23, 69, 2, '#ecdbb1'); line(g, cx + 23, 62, cx + 23, 69, 2, '#ecdbb1');
      for (let x = cx - 19; x <= cx + 19; x += 8) lit(g, x, 53, 4, 4, P.win[(x / 8 | 0) % 3]);
      ell(g, cx, 77, 12, 4, '#e2c6a0');
      line(g, cx, 41, cx, 4, 2, P.accent); ell(g, cx, 4, 2, 2, '#fff0bd');
      line(g, 16, h - 11, 104, h - 11, 2, P.accent);
    }],
    sc_we_domtower: [130, 245, function (g, w, h, P) {
      const x = 64;
      const fill = lg(g, x - 28, h - 205, x + 30, h, [[0, '#b9a2c9'], [0.48, '#74588d'], [1, '#342b5c']]);
      g.fillStyle = fill; g.fillRect(x - 25, h - 174, 50, 174);
      for (let y = h - 172; y < h - 16; y += 30) { line(g, x - 24, y, x + 24, y, 2, P.accent); }
      g.fillStyle = '#30254d'; g.fillRect(x - 31, h - 205, 62, 33);
      for (let j = 0; j < 4; j++) {
        const wx = x - 21 + j * 14;
        g.fillRect(wx, h - 200, 6, 24); poly(g, [[wx - 1, h - 200], [wx + 3, h - 207], [wx + 7, h - 200]], '#d7bdd7');
      }
      g.fillStyle = '#59456f'; g.fillRect(x - 21, h - 231, 42, 26);
      ell(g, x, h - 231, 27, 8, '#d1b3c9');
      poly(g, [[x - 21, h - 229], [x, h - 245], [x + 21, h - 229]], '#c6a6c7');
      for (let i = -1; i <= 1; i++) { ell(g, x + i * 14, h - 188, 4, 5, '#201c49'); lit(g, x + i * 14 - 1, h - 190, 2, 3, P.win[(i + 4) % 3]); }
      g.fillStyle = '#392a58'; g.fillRect(x - 31, h - 7, 62, 7);
      line(g, x - 30, h - 8, x + 30, h - 8, 2, P.accent);
    }],
    sc_we_peacepalace: [230, 160, function (g, w, h, P) {
      const base = h - 14;
      g.fillStyle = lg(g, 0, base - 87, 0, h, [[0, '#d2b6aa'], [0.55, '#765375'], [1, '#302747']]);
      g.fillRect(18, base - 75, 194, 75);
      g.fillRect(7, base - 54, 216, 54);
      poly(g, [[11, base - 75], [57, base - 108], [104, base - 75]], '#8a687b');
      poly(g, [[126, base - 75], [174, base - 108], [220, base - 75]], '#8a687b');
      g.fillStyle = '#52415f'; g.fillRect(97, base - 97, 36, 97);
      poly(g, [[94, base - 97], [115, base - 125], [136, base - 97]], '#ddbd88');
      g.fillStyle = '#4d4268'; g.fillRect(108, base - 119, 14, 22);
      for (let x = 26; x < 208; x += 13) {
        g.fillRect(x, base - 60, 5, 29); lit(g, x + 1, base - 54, 3, 8, P.win[(x / 13 | 0) % 3]);
        g.fillRect(x, base - 90, 4, 14);
      }
      g.fillStyle = '#b2939b'; g.fillRect(4, base - 11, 222, 11);
      line(g, 5, base - 12, 225, base - 12, 2, P.accent);
      ell(g, 12, base - 15, 9, 5, '#387454'); ell(g, 216, base - 15, 9, 5, '#387454');
    }]
  });
}
  /* national landmarks: uksouth */
{
  Object.assign(SC.uksouth, {
    sc_uk_stonehenge: [210, 155, function (g, w, h, P) {
      g.fillStyle = lg(g, 0, h - 28, 0, h, [[0, '#62764a'], [1, '#263c40']]); g.fillRect(0, h - 28, w, 28);
      const stones = [[28, 56, 23], [65, 36, 27], [110, 30, 26], [154, 43, 26], [183, 63, 24]];
      stones.forEach(function (s, i) {
        const x = s[0], top = h - s[1], sw = s[2];
        poly(g, [[x, top + 8], [x + 4, top], [x + sw - 3, top + 2], [x + sw, h - 26], [x + 2, h - 26]], lg(g, x, top, x + sw, h, [[0, '#c8b7a3'], [0.48, '#766b83'], [1, '#3a3b59']]));
        line(g, x + 4, top + 4, x + sw - 4, top + 5, 1.2, i % 2 ? P.accent : '#e5cda9');
      });
      [[51, h - 96, 58], [97, h - 102, 62], [142, h - 89, 61]].forEach(function (b, i) {
        poly(g, [[b[0], b[1] + 8], [b[0] + 5, b[1]], [b[0] + b[2] - 4, b[1] + 1], [b[0] + b[2], b[1] + 9], [b[0] + b[2] - 2, b[1] + 14], [b[0] + 1, b[1] + 13]], '#a89a9c');
        line(g, b[0] + 4, b[1] + 2, b[0] + b[2] - 5, b[1] + 3, 1.5, P.accent);
      });
      ell(g, 104, h - 23, 64, 5, 'rgba(255,215,145,0.22)');
    }],
    sc_uk_edinburgh: [230, 205, function (g, w, h, P) {
      poly(g, [[8, h - 23], [29, h - 66], [56, h - 82], [77, h - 119], [109, h - 141], [145, h - 151], [181, h - 119], [211, h - 49], [226, h - 23]], lg(g, 0, h - 151, 0, h, [[0, '#88749a'], [0.5, '#544568'], [1, '#252441']]));
      const base = h - 48;
      g.fillStyle = lg(g, 34, base - 83, 177, h, [[0, '#c3a9a7'], [0.45, '#805b77'], [1, '#322b54']]);
      g.fillRect(40, base - 39, 139, 39); g.fillRect(54, base - 76, 115, 38);
      poly(g, [[42, base - 76], [95, base - 99], [151, base - 76]], '#a88493');
      g.fillStyle = '#4a3a60'; g.fillRect(67, base - 127, 42, 53);
      poly(g, [[63, base - 127], [88, base - 158], [113, base - 127]], '#c7a8a0');
      g.fillStyle = '#3e3459'; g.fillRect(79, base - 148, 18, 22);
      for (let x = 49; x < 172; x += 15) { lit(g, x, base - 29, 5, 9, P.win[(x / 15 | 0) % 3]); lit(g, x + 2, base - 65, 4, 8, P.win[(x / 15 + 1 | 0) % 3]); }
      for (let x = 46; x < 178; x += 26) { line(g, x, base - 3, x, base - 22, 1.3, P.accent); }
      line(g, 24, h - 21, 221, h - 21, 3, P.accent);
    }],
    sc_uk_angel: [250, 185, function (g, w, h, P) {
      const cx = 124, foot = h - 16;
      g.fillStyle = lg(g, 0, foot - 18, 0, h, [[0, '#607554'], [1, '#283d48']]); g.fillRect(0, foot - 18, w, 18);
      // Broad, slightly swept wings and the upright body give the sculpture its unmistakable outline.
      poly(g, [[cx - 7, foot - 60], [cx - 31, foot - 95], [cx - 94, foot - 134], [cx - 108, foot - 139], [cx - 98, foot - 120], [cx - 40, foot - 70], [cx - 17, foot - 40]], lg(g, 18, foot - 140, cx - 10, foot - 30, [[0, '#d3a9a5'], [0.45, '#855b81'], [1, '#383058']]));
      poly(g, [[cx + 7, foot - 60], [cx + 31, foot - 95], [cx + 94, foot - 134], [cx + 108, foot - 139], [cx + 98, foot - 120], [cx + 40, foot - 70], [cx + 17, foot - 40]], lg(g, cx + 10, foot - 140, 231, foot - 30, [[0, '#d3a9a5'], [0.5, '#80618b'], [1, '#37335e']]));
      poly(g, [[cx - 13, foot - 100], [cx + 13, foot - 100], [cx + 18, foot - 38], [cx + 31, foot - 8], [cx - 30, foot - 8], [cx - 17, foot - 38]], '#4a3b68');
      ell(g, cx, foot - 111, 12, 14, '#d4b8aa');
      poly(g, [[cx - 13, foot - 97], [cx + 13, foot - 97], [cx + 10, foot - 68], [cx - 10, foot - 68]], '#a16b88');
      line(g, cx - 10, foot - 89, cx + 9, foot - 89, 2, P.accent);
      line(g, 16, foot - 17, 235, foot - 17, 2, '#a9bd84');
      line(g, 20, foot - 10, 230, foot - 10, 1, P.accent);
    }],
    sc_uk_liver: [190, 215, function (g, w, h, P) {
      const base = h - 15;
      g.fillStyle = lg(g, 0, base - 125, 0, h, [[0, '#c7b1a2'], [0.55, '#735878'], [1, '#2c294e']]);
      g.fillRect(18, base - 110, 154, 110);
      g.fillRect(30, base - 135, 32, 25); g.fillRect(128, base - 135, 32, 25);
      [46, 144].forEach(function (x, i) {
        g.fillStyle = '#554269'; g.fillRect(x - 12, base - 165, 24, 32);
        poly(g, [[x - 12, base - 165], [x, base - 194], [x + 12, base - 165]], '#c8a9a1');
        g.fillStyle = '#28244a'; g.fillRect(x - 7, base - 185, 14, 19);
        ell(g, x, base - 116, 10, 10, '#d7c294');
        line(g, x - 6, base - 116, x + 6, base - 116, 1, '#40365c');
        lit(g, x - 2, base - 118, 4, 4, P.win[i]);
      });
      // The Liver Birds sit atop the twin towers as small outward-facing silhouettes.
      [46, 144].forEach(function (x, i) {
        ell(g, x, base - 198, 5, 7, '#c49b78');
        poly(g, [[x - 3, base - 199], [x - 18, base - 205], [x - 9, base - 195]], '#d0aa81');
        poly(g, [[x + 3, base - 199], [x + 18, base - 205], [x + 9, base - 195]], '#d0aa81');
        line(g, x - 2, base - 190, x + 2, base - 190, 1, P.accent);
      });
      for (let x = 25; x < 166; x += 12) for (let y = base - 100; y < base - 25; y += 19) lit(g, x, y, 4, 7, P.win[(x / 12 + y / 19 | 0) % 3]);
      line(g, 13, base - 4, 179, base - 4, 2, P.accent);
    }],
    sc_uk_blackpool: [130, 225, function (g, w, h, P) {
      const cx = 65, base = h - 13;
      g.fillStyle = '#393457'; g.fillRect(24, base - 8, 82, 8);
      // Four lattice legs spread to a wide base beneath the narrow red tower.
      line(g, cx - 5, base - 192, 34, base - 9, 5, '#b35d77');
      line(g, cx + 5, base - 192, 96, base - 9, 5, '#b35d77');
      line(g, 34, base - 9, 96, base - 9, 4, '#d08b88');
      line(g, cx, base - 194, cx - 8, base - 10, 4, '#de8b86');
      line(g, cx, base - 194, cx + 8, base - 10, 4, '#de8b86');
      for (let y = base - 165; y > base - 184; y -= 9) line(g, cx - (base - y) * 0.16, y, cx + (base - y) * 0.16, y - 1, 2, '#e2aaa0');
      g.fillStyle = '#45385e'; g.fillRect(cx - 18, base - 190, 36, 8);
      poly(g, [[cx - 16, base - 190], [cx, base - 210], [cx + 16, base - 190]], '#c27783');
      line(g, cx, base - 210, cx, base - 220, 2, P.accent);
      for (let y = base - 170; y < base - 30; y += 27) {
        const half = 4 + (base - y) * 0.045;
        line(g, cx - half, y, cx + half, y, 1.3, P.accent);
      }
      line(g, 26, base - 9, 105, base - 9, 2, '#efb894');
    }],
    sc_uk_glenfinnan: [270, 165, function (g, w, h, P) {
      const viaductTop = h - 71;
      poly(g, [[0, h - 20], [27, h - 90], [65, h - 119], [93, h - 77], [132, h - 112], [168, h - 96], [205, h - 132], [260, h - 100], [270, h - 20]], lg(g, 0, h - 132, 0, h, [[0, '#526b73'], [0.56, '#384660'], [1, '#25334d']]));
      // Long stone viaduct with repeated rounded arches.
      g.fillStyle = lg(g, 0, viaductTop, 0, h, [[0, '#b39b9f'], [0.5, '#735c79'], [1, '#34314f']]);
      g.fillRect(12, viaductTop, 246, 12);
      for (let x = 23; x < 250; x += 38) {
        g.fillRect(x, viaductTop + 9, 8, h - viaductTop - 9);
        g.beginPath(); g.ellipse(x + 4, viaductTop + 26, 15, 18, 0, Math.PI, 0); g.fill();
        g.fillRect(x - 11, viaductTop + 26, 30, h - viaductTop - 26);
        g.fillStyle = '#27304a'; g.beginPath(); g.ellipse(x + 4, viaductTop + 27, 11, 14, 0, Math.PI, 0); g.fill();
        g.fillRect(x - 7, viaductTop + 27, 22, h - viaductTop - 27);
        g.fillStyle = '#735c79';
      }
      line(g, 9, viaductTop, 261, viaductTop, 2, P.accent);
      // Steam locomotive and two coaches crossing the curved arches.
      g.fillStyle = '#202747'; g.fillRect(78, viaductTop - 26, 61, 16);
      g.fillStyle = '#a84861'; g.fillRect(86, viaductTop - 21, 31, 11);
      g.fillStyle = '#303457'; g.fillRect(119, viaductTop - 32, 20, 22);
      g.fillStyle = '#252344'; g.fillRect(141, viaductTop - 23, 42, 13); g.fillRect(187, viaductTop - 23, 42, 13);
      for (let x = 87; x < 230; x += 14) lit(g, x, viaductTop - 20, 5, 4, P.win[(x / 14 | 0) % 3]);
      for (let x = 90; x < 224; x += 20) ell(g, x, viaductTop - 8, 5, 5, '#171a37');
      g.fillStyle = '#42456c'; g.fillRect(92, viaductTop - 35, 18, 4); ell(g, 101, viaductTop - 41, 5, 7, 'rgba(220,210,220,0.55)');
    }]
  });
}
  /* national landmarks: japaneast */
{
  Object.assign(SC.japaneast, {
    sc_jp_himeji: [220, 210, function (g, w, h, P) {
      const wall = lg(g, 0, h - 190, 0, h, [[0, '#f4efff'], [0.55, '#b8c5f0'], [1, '#514e9b']]);
      const roof = '#25234e';
      g.fillStyle = wall; g.fillRect(30, h - 64, 160, 64); g.fillRect(48, h - 105, 124, 41);
      g.fillRect(66, h - 147, 88, 42); g.fillRect(83, h - 181, 54, 34);
      [[26, h - 64, 168], [43, h - 105, 134], [61, h - 147, 98], [78, h - 181, 64], [90, h - 194, 40]].forEach(function (r, i) {
        poly(g, [[r[0] - 8, r[1]], [r[0] + r[2] * 0.18, r[1] - 5], [r[0] + r[2] * 0.5, r[1] - 13], [r[0] + r[2] * 0.82, r[1] - 5], [r[0] + r[2] + 8, r[1]], [r[0] + r[2], r[1] + 4], [r[0], r[1] + 4]], roof);
        line(g, r[0] + 3, r[1], r[0] + r[2] - 3, r[1], 1.2, P.accent);
        if (i < 4) { const cols = [4, 3, 2, 1][i], step = r[2] / (cols + 1); for (let k = 1; k <= cols; k++) lit(g, r[0] + step * k - 2, r[1] + 13, 4, 8, P.win[(k + i) % 3]); }
      });
      g.fillStyle = roof; g.fillRect(106, h - 202, 8, 8); poly(g, [[104, h - 202], [110, h - 210], [116, h - 202]], '#d9bb67');
      for (let x = 38; x < 190; x += 14) { line(g, x, h - 61, x + 7, h - 52, 1, 'rgba(80,90,160,0.65)'); }
      txt(g, 'HIMEJI', 86, h - 18, 1, '#ffe8a0', '#24204e');
    }],
    sc_jp_osakacastle: [210, 190, function (g, w, h, P) {
      const stone = lg(g, 0, h - 130, 0, h, [[0, '#b9c9e8'], [1, '#51527f']]);
      g.fillStyle = stone; g.fillRect(24, h - 52, 162, 52); g.fillRect(43, h - 91, 124, 39); g.fillRect(61, h - 127, 88, 36); g.fillRect(78, h - 157, 54, 30);
      for (let x = 30; x < 182; x += 18) { lit(g, x, h - 40, 6, 9, P.win[(x / 18 | 0) % 3]); if (x < 164) lit(g, x + 9, h - 79, 5, 8, P.win[(x / 18 + 1 | 0) % 3]); }
      [[18, h - 52, 174], [38, h - 91, 134], [56, h - 127, 98], [73, h - 157, 64], [87, h - 170, 36]].forEach(function (r, i) {
        const y = r[1]; poly(g, [[r[0] - 7, y], [r[0] + 6, y - 2], [r[0] + r[2] * 0.5, y - 14], [r[0] + r[2] - 6, y - 2], [r[0] + r[2] + 7, y], [r[0] + r[2], y + 4], [r[0], y + 4]], i % 2 ? '#23756f' : '#2a887b');
        line(g, r[0] + 2, y, r[0] + r[2] - 2, y, 1.3, P.accent);
        if (i < 4) { ell(g, r[0] + r[2] / 2, y - 6, 3, 2, '#f1cb55'); }
      });
      g.fillStyle = '#d7b84f'; g.fillRect(100, h - 177, 12, 4); poly(g, [[101, h - 173], [105, h - 181], [109, h - 173]], '#f1cf68');
      txt(g, 'OSAKA', 86, h - 14, 1, '#ffe8a0', '#1d2345');
    }],
    sc_jp_miyajima: [220, 145, function (g, w, h, P) {
      g.fillStyle = lg(g, 0, h - 50, 0, h, [[0, '#276b9a'], [1, '#142b68']]); g.fillRect(0, h - 48, w, 48);
      for (let y = h - 37; y < h - 5; y += 11) line(g, 7 + (y % 13), y, w - 9, y, 0.7, 'rgba(130,220,255,0.5)');
      const red = '#d94a4f';
      g.fillStyle = red; g.fillRect(68, h - 90, 9, 89); g.fillRect(145, h - 90, 9, 89);
      g.fillStyle = '#822f55'; g.fillRect(64, h - 91, 17, 7); g.fillRect(141, h - 91, 17, 7);
      poly(g, [[38, h - 106], [62, h - 112], [109, h - 113], [164, h - 109], [185, h - 104], [184, h - 98], [160, h - 101], [105, h - 104], [62, h - 103], [39, h - 100]], '#e56b65');
      line(g, 42, h - 102, 181, h - 102, 2, '#ffd38a');
      g.fillStyle = '#3e3972'; g.fillRect(105, h - 107, 3, 7); poly(g, [[100, h - 107], [106, h - 115], [113, h - 107]], '#3e3972');
      ell(g, 37, h - 26, 34, 15, '#292b61'); ell(g, 186, h - 24, 42, 19, '#30336b');
      for (let x = 15; x < 215; x += 16) ell(g, x, h - 10 - (x % 3) * 2, 5, 2, 'rgba(255,205,130,0.65)');
      txt(g, 'MIYAJIMA', 82, h - 18, 1, '#ffe8a0', '#16254b');
    }],
    sc_jp_fushimi: [230, 190, function (g, w, h, P) {
      g.fillStyle = '#171a42'; g.fillRect(0, h - 8, w, 8);
      for (let i = 0; i < 6; i++) {
        const depth = i / 5, scale = 1 - depth * 0.66, cx = 114 + (i % 2 ? 3 : -3) * depth;
        const base = h - 10 - depth * 78, top = base - 82 * scale, half = 82 * scale;
        g.fillStyle = '#c94c4d'; g.fillRect(cx - half * 0.72, top + 8 * scale, 9 * scale, base - top - 8 * scale); g.fillRect(cx + half * 0.61, top + 8 * scale, 9 * scale, base - top - 8 * scale);
        poly(g, [[cx - half, top + 8 * scale], [cx - half * 0.68, top], [cx + half * 0.68, top], [cx + half, top + 8 * scale], [cx + half * 0.9, top + 12 * scale], [cx - half * 0.9, top + 12 * scale]], '#f06a55');
        g.fillStyle = '#f18b59'; g.fillRect(cx - half * 0.9, top + 12 * scale, half * 1.8, 4 * scale);
        if (i < 3) { txt(g, 'INARI', cx - 11 * scale, top + 26 * scale, 0.65 * scale, '#ffe5a0', '#8e2647'); }
      }
      ell(g, 24, h - 25, 30, 21, '#26365f'); ell(g, 207, h - 32, 34, 25, '#26365f');
      line(g, 114, h - 10, 114, h - 86, 1, P.accent);
      txt(g, 'FUSHIMI INARI', 72, h - 13, 1, '#ffe8a0', '#24204e');
    }],
    sc_jp_kinkakuji: [190, 155, function (g, w, h, P) {
      g.fillStyle = lg(g, 0, h - 45, 0, h, [[0, '#286995'], [1, '#172e68']]); g.fillRect(0, h - 40, w, 40);
      for (let x = 5; x < w; x += 25) line(g, x, h - 20 - (x % 4), x + 16, h - 20 - (x % 4), 0.7, 'rgba(155,225,255,0.6)');
      const gold = lg(g, 45, h - 130, 155, h - 35, [[0, '#fff1a0'], [0.45, '#e3b846'], [1, '#8a573e']]);
      g.fillStyle = gold; g.fillRect(56, h - 81, 80, 46); g.fillRect(66, h - 111, 60, 30); g.fillRect(78, h - 132, 36, 21);
      poly(g, [[47, h - 81], [65, h - 95], [96, h - 101], [145, h - 81], [136, h - 77], [56, h - 77]], '#2b3059');
      poly(g, [[60, h - 111], [73, h - 123], [96, h - 128], [132, h - 111], [125, h - 107], [66, h - 107]], '#30315c');
      poly(g, [[73, h - 132], [85, h - 143], [96, h - 147], [120, h - 132], [113, h - 128], [78, h - 128]], '#34325e');
      line(g, 55, h - 79, 137, h - 79, 1.4, P.accent); line(g, 65, h - 109, 127, h - 109, 1.2, '#fff0a0');
      for (let x = 64; x < 131; x += 16) lit(g, x, h - 68, 6, 10, P.win[(x / 16 | 0) % 3]);
      g.fillStyle = '#d4ad4b'; g.fillRect(94, h - 151, 3, 7); poly(g, [[91, h - 151], [95, h - 157], [99, h - 151]], '#ffe594');
      ell(g, 22, h - 33, 38, 17, '#253d62'); ell(g, 168, h - 34, 36, 16, '#29385e');
      txt(g, 'KINKAKUJI', 69, h - 13, 1, '#ffe8a0', '#1d254b');
    }],
    sc_jp_shinkansen: [250, 125, function (g, w, h, P) {
      g.fillStyle = '#494a79'; g.fillRect(0, h - 29, w, 29); g.fillStyle = '#a8b7db'; g.fillRect(0, h - 32, w, 4);
      for (let x = 10; x < w; x += 21) { line(g, x, h - 26, x + 12, h - 3, 2, '#777fa9'); }
      const body = lg(g, 27, h - 86, 27, h - 32, [[0, '#f5f4ff'], [0.5, '#a9c5ed'], [1, '#59669b']]);
      g.fillStyle = body; g.beginPath(); g.moveTo(20, h - 52); g.quadraticCurveTo(55, h - 60, 82, h - 92); g.lineTo(208, h - 92); g.quadraticCurveTo(228, h - 89, 237, h - 72); g.lineTo(237, h - 40); g.quadraticCurveTo(235, h - 32, 222, h - 32); g.lineTo(32, h - 32); g.quadraticCurveTo(20, h - 34, 20, h - 44); g.closePath(); g.fill();
      g.strokeStyle = P.accent; g.lineWidth = 1.4; g.beginPath(); g.moveTo(27, h - 50); g.quadraticCurveTo(64, h - 58, 84, h - 87); g.lineTo(229, h - 87); g.stroke();
      g.fillStyle = '#e83f59'; g.beginPath(); g.moveTo(22, h - 48); g.quadraticCurveTo(58, h - 54, 78, h - 72); g.lineTo(235, h - 72); g.lineTo(237, h - 63); g.quadraticCurveTo(60, h - 61, 22, h - 48); g.fill();
      for (let x = 99; x < 211; x += 22) { lit(g, x, h - 82, 13, 8, '#b9edff'); }
      for (let x = 59; x < 220; x += 39) { ell(g, x, h - 31, 8, 4, '#211f48'); ell(g, x, h - 31, 4, 2, '#d4deff'); }
      g.fillStyle = '#343960'; g.fillRect(0, h - 3, w, 3); txt(g, 'SHINKANSEN', 104, h - 42, 1, '#fff1a0', '#30335c');
    }]
  });
}
  /* national landmarks: australiaeast */
{
  Object.assign(SC.australiaeast, {
    sc_au_uluru: [340, 210, function (g, w, h) {
      g.beginPath(); g.moveTo(3, h - 8); g.lineTo(14, h - 62);
      g.quadraticCurveTo(26, h - 118, 63, h - 143); g.quadraticCurveTo(99, h - 165, 165, h - 163);
      g.quadraticCurveTo(233, h - 164, 270, h - 145); g.quadraticCurveTo(300, h - 126, 313, h - 91);
      g.quadraticCurveTo(330, h - 67, 337, h - 10); g.closePath();
      g.fillStyle = lg(g, 0, h - 165, 80, h, [[0, '#e3a06a'], [0.38, '#c46e49'], [1, '#894739']]); g.fill();
      g.save(); g.clip();
      const r = rng(1287);
      for (let x = 22; x < w; x += 8) {
        const top = h - 159 + r() * 18;
        g.strokeStyle = x % 16 ? 'rgba(106,54,39,0.42)' : 'rgba(247,173,110,0.5)'; g.lineWidth = 1 + r() * 2;
        g.beginPath(); g.moveTo(x, top); g.bezierCurveTo(x + 4, top + 32, x - 5, h - 54, x + 6, h - 12); g.stroke();
      }
      for (let y = h - 140; y < h - 15; y += 14) line(g, 10, y, w - 10, y + 9, 0.6, 'rgba(242,160,103,0.18)');
      g.restore();
      poly(g, [[0, h - 14], [75, h - 22], [167, h - 9], [268, h - 19], [340, h - 13], [340, h], [0, h]], '#bd7851');
      for (let x = 7; x < w; x += 21) { ell(g, x, h - 7 - x % 5, 5, 1.4, '#88835c'); line(g, x, h - 9, x + 1, h - 13, 0.7, '#c1ad79'); }
      txt(g, 'ULURU', 146, h - 9, 0.9, '#f3d09a', '#7f4e3a');
    }],
    sc_au_flinders: [220, 190, function (g, w, h, P) {
      const stone = lg(g, 0, h - 160, 0, h, [[0, '#d9c9c4'], [0.5, '#907a9d'], [1, '#3a315f']]);
      g.fillStyle = stone; g.fillRect(22, h - 79, 176, 79); g.fillRect(35, h - 103, 151, 24); g.fillRect(51, h - 129, 116, 26);
      g.fillStyle = '#34294f'; g.fillRect(96, h - 178, 30, 49); poly(g, [[91, h - 178], [111, h - 190], [131, h - 178]], '#47375f');
      g.fillStyle = stone; g.fillRect(99, h - 169, 24, 32); g.fillStyle = '#282348'; g.beginPath(); g.arc(111, h - 154, 9, Math.PI, 0); g.fill(); g.fillRect(102, h - 154, 18, 10);
      ell(g, 111, h - 157, 6, 6, '#f4cf77'); ell(g, 111, h - 157, 4, 4, '#5a3b69'); line(g, 111, h - 157, 111, h - 160, 0.8, '#fff1ab'); line(g, 111, h - 157, 114, h - 156, 0.8, '#fff1ab');
      for (let x = 35; x < 187; x += 14) { lit(g, x, h - 69, 7, 11, P.win[(x / 14 | 0) % 3]); lit(g, x + 5, h - 94, 6, 9, P.win[(x / 14 + 1 | 0) % 3]); }
      for (let x = 48; x < 175; x += 20) { g.fillStyle = '#35305f'; g.fillRect(x, h - 127, 9, 15); poly(g, [[x - 2, h - 127], [x + 4.5, h - 138], [x + 11, h - 127]], '#4a3a68'); }
      line(g, 22, h - 80, 198, h - 80, 1.5, P.accent); txt(g, 'FLINDERS ST', 72, h - 14, 1, '#ffe8a0', '#292146');
    }],
    sc_au_apostles: [250, 150, function (g, w, h, P) {
      g.fillStyle = lg(g, 0, h - 61, 0, h, [[0, '#3e8eb0'], [1, '#132c66']]); g.fillRect(0, h - 60, w, 60);
      for (let y = h - 51; y < h - 5; y += 12) line(g, 5 + y % 9, y, w - 8, y, 0.8, 'rgba(148,225,255,0.5)');
      const stack = function (x, base, wid, high, shade) {
        g.fillStyle = shade; g.beginPath(); g.moveTo(x - wid / 2, base); g.lineTo(x - wid / 2 + 3, base - high * 0.55); g.quadraticCurveTo(x - wid / 2 + 4, base - high, x, base - high); g.quadraticCurveTo(x + wid / 2 - 3, base - high * 0.91, x + wid / 2 - 2, base - high * 0.48); g.lineTo(x + wid / 2, base); g.closePath(); g.fill();
        line(g, x - wid * 0.24, base - high * 0.76, x - wid * 0.18, base - 4, 1, 'rgba(255,190,126,0.7)');
      };
      stack(25, h - 44, 30, 52, '#bd705d'); stack(67, h - 43, 35, 75, '#d17b60'); stack(113, h - 45, 40, 96, '#c67561'); stack(161, h - 43, 34, 78, '#b56361'); stack(205, h - 44, 32, 60, '#cc745c');
      g.fillStyle = '#322957'; g.beginPath(); g.moveTo(0, h - 17); g.quadraticCurveTo(56, h - 39, 110, h - 27); g.quadraticCurveTo(172, h - 44, 250, h - 20); g.lineTo(250, h); g.lineTo(0, h); g.closePath(); g.fill();
      line(g, 4, h - 17, 247, h - 20, 1.4, P.accent); txt(g, 'TWELVE APOSTLES', 76, h - 10, 1, '#ffe8a0', '#1b2451');
    }],
    sc_au_storybridge: [270, 165, function (g, w, h, P) {
      g.fillStyle = '#244477'; g.fillRect(0, h - 28, w, 28); g.fillStyle = '#d7d2ef'; g.fillRect(0, h - 32, w, 4);
      const top = h - 128, deck = h - 35;
      g.fillStyle = '#33345f'; g.fillRect(20, top + 12, 18, h - top - 40); g.fillRect(232, top + 12, 18, h - top - 40);
      g.fillStyle = '#4d426f'; g.fillRect(16, top + 9, 26, 7); g.fillRect(228, top + 9, 26, 7);
      g.strokeStyle = '#34335f'; g.lineWidth = 8; g.beginPath(); g.moveTo(33, deck); g.quadraticCurveTo(135, top - 5, 239, deck); g.stroke();
      g.strokeStyle = P.accent; g.lineWidth = 1.5; g.beginPath(); g.moveTo(34, deck - 2); g.quadraticCurveTo(135, top, 238, deck - 2); g.stroke();
      g.strokeStyle = '#77739a'; g.lineWidth = 1.2;
      for (let i = 0; i <= 12; i++) { const x = 38 + i * 16; const t = (x - 33) / 206; const y = top - 1 + 4 * Math.pow((t - 0.5) * 2, 2); g.beginPath(); g.moveTo(x, y); g.lineTo(x, deck - 1); g.stroke(); }
      g.fillStyle = '#3a3b67'; g.fillRect(5, deck, 260, 7); line(g, 8, deck, 262, deck, 1.3, '#ffe09a');
      for (let x = 12; x < 263; x += 20) lit(g, x, deck + 8, 3, 4, '#ffd58a');
      txt(g, 'STORY BRIDGE', 99, h - 14, 1, '#ffe8a0', '#25244b');
    }],
    sc_au_q1: [95, 250, function (g, w, h, P) {
      const cx = 48;
      g.fillStyle = lg(g, 28, 0, 68, 0, [[0, '#d8edff'], [0.3, '#a9c6ed'], [0.65, '#5c6eae'], [1, '#29284f']]);
      g.beginPath(); g.moveTo(cx - 9, h); g.lineTo(cx - 17, h - 128); g.quadraticCurveTo(cx - 13, h - 179, cx - 7, h - 198); g.lineTo(cx - 4, h - 204); g.lineTo(cx + 4, h - 204); g.lineTo(cx + 7, h - 198); g.quadraticCurveTo(cx + 13, h - 179, cx + 17, h - 128); g.lineTo(cx + 9, h); g.closePath(); g.fill();
      g.fillStyle = '#39335f'; g.fillRect(cx - 20, h - 206, 40, 12); g.fillRect(cx - 15, h - 216, 30, 8); ell(g, cx, h - 219, 10, 4, '#6d5f8c');
      line(g, cx - 19, h - 202, cx + 19, h - 202, 1.5, P.accent);
      for (let y = h - 190; y < h - 16; y += 13) { line(g, cx - 10 + (h - y) * 0.015, y, cx + 10 - (h - y) * 0.015, y, 0.6, 'rgba(235,244,255,0.55)'); if (y % 2) lit(g, cx - 3, y + 2, 5, 3, P.win[(y / 13 | 0) % 3]); }
      g.fillStyle = '#36335f'; g.fillRect(cx - 16, h - 6, 32, 6); txt(g, 'Q1', cx - 7, h - 22, 1, '#ffe8a0', '#25244b');
    }],
    sc_au_byronlighthouse: [155, 175, function (g, w, h, P) {
      g.fillStyle = '#252f62'; g.fillRect(0, h - 19, w, 19);
      g.fillStyle = '#35536f'; g.beginPath(); g.moveTo(0, h - 19); g.quadraticCurveTo(40, h - 45, 79, h - 28); g.quadraticCurveTo(120, h - 47, 155, h - 21); g.lineTo(155, h); g.lineTo(0, h); g.closePath(); g.fill();
      const tower = lg(g, 61, h - 141, 93, h - 15, [[0, '#fff0ce'], [0.5, '#d7c8c0'], [1, '#72628d']]);
      g.fillStyle = tower; g.beginPath(); g.moveTo(67, h - 23); g.lineTo(71, h - 133); g.lineTo(85, h - 133); g.lineTo(90, h - 23); g.closePath(); g.fill();
      g.fillStyle = '#ede0d4'; g.fillRect(67, h - 139, 23, 8); g.fillStyle = '#34315d'; g.fillRect(70, h - 153, 17, 14); g.fillStyle = '#f2dfbd'; g.fillRect(73, h - 151, 11, 8);
      g.fillStyle = '#352f5e'; g.beginPath(); g.moveTo(67, h - 153); g.lineTo(78, h - 165); g.lineTo(90, h - 153); g.closePath(); g.fill();
      g.fillStyle = '#f5dc9a'; g.fillRect(75, h - 149, 7, 5); glowRect(g, '#ffe9a0', 76, h - 149, 5, 4); line(g, 78, h - 149, 31, h - 165, 1, 'rgba(255,233,160,0.55)'); line(g, 82, h - 149, 129, h - 166, 1, 'rgba(255,233,160,0.55)');
      line(g, 68, h - 21, 91, h - 21, 1.5, P.accent); g.fillStyle = '#4a416c'; g.fillRect(61, h - 19, 38, 8);
      for (let x = 9; x < 150; x += 15) ell(g, x, h - 14 - (x % 3), 5, 2, '#7ab3c1');
      txt(g, 'BYRON BAY', 47, h - 10, 1, '#ffe8a0', '#25244b');
    }]
  });
}
  /* national landmarks: brazilsouth */
{
  Object.assign(SC.brazilsouth, {
    sc_br_brasilia: [160, 210, function (g, w, h, P) {
      const cx = w / 2, base = h - 4, top = h - 166;
      g.fillStyle = silFill(g, top, base, '#e6d9d4', '#74526d');
      g.beginPath(); g.moveTo(cx - 58, base); g.bezierCurveTo(cx - 26, base - 42, cx - 58, top + 39, cx - 46, top); g.lineTo(cx + 46, top); g.bezierCurveTo(cx + 58, top + 39, cx + 26, base - 42, cx + 58, base); g.closePath(); g.fill();
      for (let i = 0; i <= 16; i++) {
        const a = Math.PI * i / 16, bx = cx - 58 + 116 * i / 16, tx = cx - 46 + 92 * i / 16;
        g.beginPath(); g.moveTo(bx, base); g.quadraticCurveTo(cx + Math.cos(a) * 17, base - 63, tx, top); g.strokeStyle = i % 2 ? '#f0d9ce' : P.accent; g.lineWidth = i % 2 ? 2 : 1.15; g.stroke();
      }
      g.fillStyle = '#231536'; g.fillRect(cx - 24, base - 4, 48, 4);
      ell(g, cx, top + 1, 48, 4, '#f2d9d4');
      g.fillStyle = silFill(g, h - 177, h - 163, '#d7c6d6', '#72506d'); g.fillRect(cx - 3, h - 180, 6, 14);
      poly(g, [[cx - 3, h - 180], [cx, h - 188], [cx + 3, h - 180]], P.accent);
      line(g, cx, h - 186, cx, h - 198, 1.4, P.accent); line(g, cx - 5, h - 193, cx + 5, h - 193, 1.1, P.accent);
      for (let i = 0; i < 7; i++) lit(g, cx - 21 + i * 7, base - 16, 2.2, 4, P.win[i % 3]);
    }],
    sc_br_congress: [230, 150, function (g, w, h, P) {
      const base = h - 4;
      g.fillStyle = silFill(g, h - 72, base, '#d7c9d6', '#664c72'); g.fillRect(10, h - 62, 210, 58);
      g.fillStyle = '#dacbd2'; g.fillRect(64, h - 139, 25, 77); g.fillRect(142, h - 139, 25, 77);
      g.fillStyle = '#f2d8d1'; g.fillRect(60, h - 141, 33, 3); g.fillRect(138, h - 141, 33, 3);
      for (let y = h - 128; y < h - 68; y += 12) { lit(g, 70, y, 4, 7, P.win[0]); lit(g, 79, y, 4, 7, P.win[2]); lit(g, 148, y, 4, 7, P.win[1]); lit(g, 157, y, 4, 7, P.win[0]); }
      ell(g, 112, h - 70, 38, 17, '#60445f'); ell(g, 112, h - 77, 33, 14, lg(g, 0, h - 91, 0, h - 65, [[0, '#d8b7c8'], [1, '#79536e']]));
      ell(g, 112, h - 83, 27, 9, '#241634');
      ell(g, 190, h - 70, 22, 12, '#5d4260'); ell(g, 190, h - 73, 19, 9, lg(g, 0, h - 82, 0, h - 64, [[0, '#f0d6d1'], [1, '#77506f']]));
      ell(g, 190, h - 78, 13, 5, '#251637');
      g.fillStyle = '#eee0dd'; g.fillRect(18, h - 61, 194, 2);
      for (let x = 26; x < 207; x += 15) lit(g, x, h - 48, 5, 8, P.win[(x / 15 | 0) % 3]);
      txt(g, 'BRASILIA', 91, h - 8, 0.62, '#fff0b2', '#392044');
    }],
    sc_br_iguazu: [240, 150, function (g, w, h, P) {
      const base = h - 5;
      g.fillStyle = lg(g, 0, h - 110, 0, base, [[0, '#71a35f'], [1, '#173d43']]);
      poly(g, [[0, h - 118], [28, h - 110], [51, h - 118], [76, h - 108], [101, h - 119], [128, h - 112], [154, h - 120], [179, h - 109], [205, h - 116], [240, h - 108], [240, base], [0, base]], lg(g, 0, h - 115, 0, base, [[0, '#577d5d'], [1, '#223d45']]));
      for (let i = 0; i < 7; i++) {
        const x = 15 + i * 33, top = h - 110 - (i % 3) * 4, width = 17 + (i % 2) * 5;
        g.fillStyle = lg(g, x, top, x + width, base, [[0, '#dcf8ef'], [0.35, '#72dbe1'], [1, '#236e87']]);
        g.beginPath(); g.moveTo(x, top); g.bezierCurveTo(x + 2, top + 27, x - 4, base - 34, x + 3, base); g.lineTo(x + width - 2, base); g.bezierCurveTo(x + width + 4, base - 34, x + width - 2, top + 25, x + width, top); g.closePath(); g.fill();
        ell(g, x + width / 2, top + 3, width * 0.75, 4, 'rgba(220,255,255,0.65)');
      }
      for (let i = 0; i < 26; i++) { const x = (i * 47) % 236, y = h - 26 - ((i * 31) % 90); ell(g, x, y, 1.4 + (i % 3) * 0.6, 1, i % 2 ? '#b9fff0' : '#f0f9ff'); }
      for (let x = -6; x < w + 12; x += 24) { ell(g, x, h - 121 + (x % 3) * 3, 17, 15, '#1d5244'); ell(g, x - 4, h - 127 + (x % 3) * 3, 9, 8, '#46794e'); }
      line(g, 0, h - 116, w, h - 116, 1.5, P.accent);
      txt(g, 'IGUAZU', 95, h - 8, 0.7, '#ecffff', '#18405a');
    }],
    sc_br_amazontheatre: [190, 160, function (g, w, h, P) {
      const base = h - 4;
      g.fillStyle = silFill(g, h - 88, base, '#e3b3bd', '#75476e'); g.fillRect(28, h - 80, 134, 76);
      g.fillStyle = '#f1d8d1'; g.fillRect(22, h - 86, 146, 8); g.fillRect(40, h - 93, 110, 7);
      g.fillStyle = '#d9bec7'; g.fillRect(12, h - 75, 20, 71); g.fillRect(158, h - 75, 20, 71);
      for (let x = 16; x < 177; x += 9) lit(g, x, h - 56, 4, 8, P.win[(x / 9 | 0) % 3]);
      g.beginPath(); g.moveTo(29, h - 89); g.lineTo(42, h - 120); g.quadraticCurveTo(95, h - 139, 148, h - 120); g.lineTo(162, h - 89); g.closePath();
      g.fillStyle = lg(g, 30, h - 137, 160, h - 88, [[0, '#e0cfdb'], [0.52, '#976681'], [1, '#4e3c66']]); g.fill();
      g.save(); g.beginPath(); g.moveTo(29, h - 89); g.lineTo(42, h - 120); g.quadraticCurveTo(95, h - 139, 148, h - 120); g.lineTo(162, h - 89); g.closePath(); g.clip();
      const cols = ['#e9bf69', '#e65e62', '#55b6a0', '#6576bb', '#dbd1e0'];
      for (let y = h - 132; y < h - 92; y += 8) for (let x = 37; x < 158; x += 9) { g.fillStyle = cols[((x / 9 | 0) + (y / 8 | 0)) % cols.length]; g.fillRect(x, y, 7.5, 6); }
      g.restore();
      g.strokeStyle = '#f4d794'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(29, h - 89); g.lineTo(42, h - 120); g.quadraticCurveTo(95, h - 139, 148, h - 120); g.lineTo(162, h - 89); g.stroke();
      g.fillStyle = '#251536'; g.fillRect(79, h - 42, 33, 38); poly(g, [[75, h - 42], [95, h - 61], [116, h - 42]], '#e6c6d2');
      for (let x = 85; x < 108; x += 10) lit(g, x, h - 35, 4, 8, P.win[1]);
      txt(g, 'MANAUS', 73, h - 8, 0.58, '#fff1b4', '#422141');
    }],
    sc_br_masp: [200, 125, function (g, w, h, P) {
      const base = h - 5;
      g.fillStyle = '#e15d78'; g.fillRect(18, h - 102, 164, 8); g.fillRect(27, h - 94, 10, 86); g.fillRect(163, h - 94, 10, 86);
      g.fillStyle = lg(g, 24, h - 86, 177, h - 27, [[0, '#583c78'], [0.5, '#38294e'], [1, '#251936']]); g.fillRect(24, h - 86, 153, 55);
      for (let y = h - 77; y < h - 40; y += 11) for (let x = 33; x < 170; x += 12) lit(g, x, y, 5, 6, P.win[(x + y) % 3]);
      g.fillStyle = '#f0b887'; g.fillRect(16, h - 30, 168, 5);
      g.fillStyle = '#3a294c'; g.fillRect(0, h - 25, 200, 20);
      for (let x = 5; x < 197; x += 14) { g.fillStyle = '#493251'; g.fillRect(x, h - 21, 8, 16); lit(g, x + 1, h - 20, 5, 11, P.win[(x / 14 | 0) % 3]); }
      line(g, 23, h - 90, 177, h - 90, 1.1, P.accent);
      txt(g, 'MASP', 79, h - 8, 0.72, '#fff0b2', '#351c3e');
    }],
    sc_br_ouropreto: [190, 190, function (g, w, h, P) {
      const base = h - 4;
      g.fillStyle = '#3e3a58'; g.beginPath(); g.moveTo(0, base); g.lineTo(0, h - 25); g.lineTo(36, h - 37); g.lineTo(72, h - 26); g.lineTo(109, h - 41); g.lineTo(152, h - 24); g.lineTo(w, h - 35); g.lineTo(w, base); g.closePath(); g.fill();
      g.fillStyle = silFill(g, h - 113, base, '#e9d8cd', '#815773'); g.fillRect(29, h - 106, 132, 103);
      g.fillStyle = '#d7c5c8'; g.fillRect(23, h - 112, 144, 9); g.fillRect(32, h - 119, 126, 7);
      [49, 141].forEach(function (x, i) {
        g.fillStyle = silFill(g, h - 157, h - 104, '#f0ddd0', '#8d5d77'); g.fillRect(x - 12, h - 153, 24, 49);
        poly(g, [[x - 15, h - 153], [x, h - 165], [x + 15, h - 153]], '#d7bdd0');
        ell(g, x, h - 156, 8, 5, '#28203f'); line(g, x, h - 165, x, h - 176, 1.2, P.accent);
        lit(g, x - 2, h - 149, 4, 6, P.win[i]);
      });
      poly(g, [[90, h - 119], [95, h - 143], [100, h - 119]], '#d8c0ce');
      ell(g, 95, h - 126, 7, 7, '#33203f'); ell(g, 95, h - 126, 4, 4, P.accent);
      for (let x = 43; x < 152; x += 14) { lit(g, x, h - 91, 5, 8, P.win[(x / 14 | 0) % 3]); lit(g, x, h - 72, 5, 8, P.win[(x / 14 | 0) % 3]); }
      poly(g, [[78, base], [79, h - 64], [95, h - 78], [111, h - 64], [112, base]], '#281a3e');
      for (let x = 35; x < 158; x += 18) g.fillRect(x, h - 24, 2, 18);
      txt(g, 'OURO PRETO', 62, h - 8, 0.58, '#fff0b6', '#3e2347');
    }]
  });
}
  /* national landmarks: francecentral */
{
  Object.assign(SC.francecentral, {
    sc_fr_montsaintmichel: [190, 210, function (g, w, h, P) {
      const cx = w / 2, base = h - 5;
      g.fillStyle = lg(g, 0, h - 33, 0, base, [[0, '#52a8b8'], [1, '#193d60']]);
      for (let x = 0; x < w; x += 22) { line(g, x, h - 27 + (x % 3) * 2, x + 12, h - 27 + (x % 3) * 2, 0.8, 'rgba(206,246,255,0.65)'); }
      poly(g, [[cx - 71, base], [cx - 55, h - 43], [cx - 38, h - 74], [cx - 18, h - 88], [cx + 28, h - 88], [cx + 51, h - 60], [cx + 75, base]], lg(g, 0, h - 90, 0, base, [[0, '#c6a579'], [1, '#543d5f']]));
      g.fillStyle = '#d4bd9b'; g.fillRect(cx - 38, h - 102, 75, 20); g.fillRect(cx - 28, h - 119, 56, 21); g.fillRect(cx - 20, h - 139, 41, 22); g.fillRect(cx - 12, h - 159, 25, 22);
      for (let x = cx - 36; x < cx + 35; x += 12) lit(g, x, h - 96, 4, 7, P.win[(x / 12 | 0) % 3]);
      for (let x = cx - 25; x < cx + 25; x += 12) lit(g, x, h - 114, 4, 7, P.win[(x / 12 | 0) % 3]);
      for (let x = cx - 18; x < cx + 18; x += 12) lit(g, x, h - 134, 4, 7, P.win[(x / 12 | 0) % 3]);
      g.fillStyle = '#d7bd99'; g.fillRect(cx - 7, h - 171, 14, 14); poly(g, [[cx - 12, h - 171], [cx, h - 184], [cx + 12, h - 171]], '#ead4af');
      g.fillStyle = '#4c3658'; g.fillRect(cx - 5, h - 186, 10, 17); poly(g, [[cx - 7, h - 186], [cx, h - 195], [cx + 7, h - 186]], P.accent);
      line(g, cx, h - 194, cx, h - 203, 1.2, P.accent);
      line(g, cx - 60, h - 51, cx + 58, h - 51, 1.2, P.accent);
    }],
    sc_fr_pontdugard: [230, 140, function (g, w, h, P) {
      const base = h - 4, arch = '#a998a9';
      g.fillStyle = silFill(g, h - 108, base, '#d3b39f', '#5a4668');
      g.fillRect(10, h - 35, 210, 31); g.fillRect(18, h - 76, 194, 22); g.fillRect(28, h - 109, 174, 18);
      for (let i = 0; i < 6; i++) {
        const x = 10 + i * 36;
        g.fillStyle = '#281d3b'; g.beginPath(); g.ellipse(x + 15, h - 4, 15, 29, 0, Math.PI, 0); g.fill(); g.fillRect(x, h - 4, 30, 29);
        g.fillStyle = '#281d3b'; g.beginPath(); g.ellipse(x + 15, h - 54, 11, 18, 0, Math.PI, 0); g.fill(); g.fillRect(x + 4, h - 54, 22, 18);
      }
      for (let i = 0; i < 9; i++) {
        const x = 27 + i * 21;
        g.fillStyle = '#281d3b'; g.beginPath(); g.ellipse(x + 7, h - 90, 6, 9, 0, Math.PI, 0); g.fill(); g.fillRect(x + 1, h - 90, 12, 9);
      }
      g.fillStyle = arch; g.fillRect(8, h - 110, 214, 3); g.fillRect(16, h - 78, 198, 3); g.fillRect(8, h - 38, 214, 3);
      for (let x = 14; x < 222; x += 13) line(g, x, h - 109, x, h - 103, 1, P.accent);
      g.fillStyle = lg(g, 0, h - 13, 0, base, [[0, '#3796aa'], [1, '#1b3c58']]); g.fillRect(0, h - 13, w, 9);
      line(g, 0, h - 13, w, h - 13, 1.5, '#e4c58e');
    }],
    sc_fr_carcassonne: [220, 150, function (g, w, h, P) {
      const base = h - 4, wall = lg(g, 0, h - 94, 0, base, [[0, '#d2ae88'], [0.55, '#9a6c76'], [1, '#503d62']]);
      g.fillStyle = wall; g.fillRect(12, h - 78, 196, 74);
      for (let i = 0; i < 8; i++) {
        const x = 8 + i * 27, hh = 86 + (i % 3) * 10;
        g.fillStyle = wall; g.fillRect(x, h - hh, 19, hh);
        poly(g, [[x - 2, h - hh], [x + 9.5, h - hh - 15], [x + 21, h - hh]], '#77516d');
        g.fillStyle = '#30203e'; g.fillRect(x + 5, h - hh + 12, 8, 17); lit(g, x + 7, h - hh + 14, 4, 10, P.win[i % 3]);
        g.fillStyle = '#d2ae88'; for (let k = 0; k < 4; k++) g.fillRect(x + k * 5, h - hh + 2, 3, 4);
      }
      g.fillStyle = '#281d3b'; g.fillRect(92, h - 41, 36, 37); g.beginPath(); g.ellipse(110, h - 41, 18, 13, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#bb946f'; g.fillRect(88, h - 43, 44, 4);
      for (let x = 102; x < 120; x += 10) lit(g, x, h - 32, 4, 8, P.win[(x / 10 | 0) % 3]);
      line(g, 10, h - 77, 209, h - 77, 1.4, P.accent);
      txt(g, 'CARCASSONNE', 77, h - 8, 0.55, '#fff0b1', '#3e2943');
    }],
    sc_fr_chambord: [230, 160, function (g, w, h, P) {
      const base = h - 4;
      g.fillStyle = silFill(g, h - 89, base, '#e1c9bb', '#765273'); g.fillRect(14, h - 68, 202, 64);
      g.fillStyle = '#d8c0b9'; g.fillRect(4, h - 77, 222, 11);
      for (let x = 20; x < 216; x += 18) { lit(g, x, h - 52, 5, 9, P.win[(x / 18 | 0) % 3]); }
      [23, 60, 99, 138, 177, 208].forEach(function (x, i) {
        const hh = [53, 78, 112, 94, 76, 55][i];
        g.fillStyle = silFill(g, h - hh, h - 65, '#d7beb7', '#795576'); g.fillRect(x - 12, h - hh + 13, 24, hh - 13);
        poly(g, [[x - 15, h - hh + 14], [x, h - hh - 3], [x + 15, h - hh + 14]], i % 2 ? '#9a7185' : '#c69a7f');
        g.fillStyle = '#d5b9ab'; g.fillRect(x - 2, h - hh - 10, 4, 10);
        if (i % 2 === 0) lit(g, x - 2, h - hh + 24, 4, 8, P.win[i % 3]);
      });
      g.fillStyle = '#d7bca9'; g.fillRect(91, h - 122, 48, 58); poly(g, [[87, h - 122], [115, h - 150], [143, h - 122]], '#bb8c82');
      g.fillStyle = '#241a3b'; g.fillRect(108, h - 112, 14, 48); g.fillStyle = '#d9bd9e'; g.fillRect(112, h - 111, 6, 46);
      poly(g, [[108, h - 112], [115, h - 126], [122, h - 112]], P.accent);
      for (let i = 0; i < 7; i++) { const x = 49 + i * 23; poly(g, [[x, h - 65], [x + 7, h - 78], [x + 14, h - 65]], '#8c657a'); }
      line(g, 8, h - 66, 222, h - 66, 1.2, P.accent);
    }],
    sc_fr_strasbourg: [150, 240, function (g, w, h, P) {
      const cx = w / 2, base = h - 4;
      g.fillStyle = silFill(g, h - 108, base, '#d6c1bd', '#664a74'); g.fillRect(24, h - 93, 102, 89);
      g.fillStyle = '#d9c1b6'; g.fillRect(16, h - 101, 118, 9);
      for (let x = 33; x < 121; x += 14) lit(g, x, h - 78, 5, 8, P.win[(x / 14 | 0) % 3]);
      g.fillStyle = '#d7c2b9'; g.fillRect(cx - 28, h - 136, 56, 42);
      poly(g, [[cx - 44, h - 133], [cx, h - 165], [cx + 44, h - 133]], '#b88e98');
      g.fillStyle = '#31213f'; g.fillRect(cx - 8, h - 125, 16, 31); ell(g, cx, h - 130, 12, 12, '#2b1c3d'); ell(g, cx, h - 130, 8, 8, '#dda77c');
      for (let i = 0; i < 6; i++) line(g, cx - 7, h - 131 + i * 2, cx + 7, h - 131 + i * 2, 0.6, '#2b1c3d');
      g.fillStyle = lg(g, cx - 20, h - 204, cx + 20, h - 156, [[0, '#d8c7c1'], [0.5, '#9a6a87'], [1, '#473456']]);
      poly(g, [[cx - 19, h - 159], [cx - 9, h - 174], [cx - 5, h - 190], [cx - 2, h - 206], [cx + 2, h - 206], [cx + 5, h - 190], [cx + 9, h - 174], [cx + 19, h - 159]], g.fillStyle);
      for (let y = h - 178; y < h - 158; y += 6) line(g, cx - 10 + (h - y) * 0.15, y, cx + 10 - (h - y) * 0.15, y, 1.1, '#e1bf8a');
      g.fillStyle = '#d9c1ad'; g.fillRect(cx - 3, h - 212, 6, 8); line(g, cx, h - 212, cx, h - 222, 1.2, P.accent);
      line(g, 18, h - 101, 132, h - 101, 1.5, P.accent);
    }],
    sc_fr_provence: [240, 110, function (g, w, h, P) {
      const base = h - 4;
      g.fillStyle = lg(g, 0, h - 65, 0, base, [[0, '#92a06a'], [1, '#58475c']]); g.fillRect(0, h - 30, w, 26);
      poly(g, [[0, h - 49], [44, h - 75], [88, h - 45], [126, h - 69], [171, h - 41], [209, h - 64], [240, h - 46], [240, base], [0, base]], '#5a4764');
      for (let row = 0; row < 7; row++) {
        const y = h - 12 - row * 9, spread = row * 3;
        g.strokeStyle = row % 2 ? '#6d46a0' : '#9d71c0'; g.lineWidth = row % 2 ? 2.2 : 1.6;
        g.beginPath(); g.moveTo(8 + spread, y); g.quadraticCurveTo(116, y - 10 - row, 232 - spread, y); g.stroke();
        for (let x = 18 + row * 4; x < 228 - row * 4; x += 18) { ell(g, x + ((row * 5) % 8), y - 2, 2.3, 1.8, row % 2 ? '#c29adb' : '#9d78cc'); }
      }
      for (let x = 12; x < 235; x += 43) { g.fillStyle = '#342d48'; g.fillRect(x, h - 55 - (x % 3) * 2, 2, 27); ell(g, x + 1, h - 60 - (x % 3) * 2, 6, 8, '#465441'); }
      txt(g, 'PROVENCE', 88, h - 8, 0.62, '#fff0ba', '#372141');
    }]
  });
}
  Object.assign(SC.westeurope, {
    sc_nl_transit: [280, 150, function (g, w, h) {
      g.fillStyle = '#af7558'; g.fillRect(22, 38, 236, 97);
      for (let y = 42; y < 130; y += 6) for (let x = 25 + y % 12; x < 255; x += 16) line(g, x, y, x + 12, y, 0.6, '#d7ab84');
      poly(g, [[15, 40], [62, 18], [113, 40]], '#624952'); poly(g, [[166, 40], [216, 18], [265, 40]], '#624952');
      g.fillStyle = '#d7c3a0'; g.fillRect(120, 11, 40, 124);
      poly(g, [[114, 13], [140, 0], [166, 13]], '#375968');
      ell(g, 140, 32, 13, 13, '#efe2b7'); ell(g, 140, 32, 10, 10, '#334f5c');
      line(g, 140, 32, 140, 24, 1, '#fff0bd'); line(g, 140, 32, 147, 35, 1, '#fff0bd');
      for (let x = 33; x < 252; x += 28) {
        rrect(g, x, 55, 17, 35, 7, '#324f62'); lit(g, x + 2, 60, 13, 25, '#dfd3a6'); line(g, x + 8.5, 58, x + 8.5, 88, 1, '#685655');
      }
      rrect(g, 63, 94, 155, 16, 2, '#1d5386'); txt(g, 'STATION SLOTERDIJK', 75, 99, 1, '#f5efcc');
      g.fillStyle = '#555c61'; g.fillRect(0, 136, w, 14); line(g, 0, 137, w, 137, 1.5, '#d8d0b4');
      [18, 262].forEach((x) => { line(g, x, 99, x, 136, 1.5, '#314556'); rrect(g, x - 8, 95, 16, 12, 1, '#1965a4'); txt(g, 'TRAM', x - 6, 99, 0.5, '#ffffff'); });
    }],
    sc_nl_canalcruise: [260, 115, function (g, w, h) {
      g.fillStyle = '#497588'; g.fillRect(0, 54, w, 61);
      for (let x = 0; x < w; x += 43) {
        g.fillStyle = ['#875449', '#b2886e', '#665260'][x / 43 % 3 | 0]; g.fillRect(x + 2, 14, 37, 45);
        poly(g, [[x, 14], [x + 20, 0], [x + 41, 14]], '#545365');
        for (let y = 22; y < 54; y += 14) { lit(g, x + 9, y, 7, 9, '#dbc496'); lit(g, x + 25, y, 7, 9, '#b7ccd2'); }
      }
      g.fillStyle = '#b7b7a5'; g.fillRect(0, 57, w, 3);
      for (let x = 8; x < w; x += 20) line(g, x, 63 + x % 9, x + 15, 63 + x % 9, 0.7, '#a3c8d0');
      g.save(); g.translate(45, 65); canalBoat(g); g.restore();
      txt(g, 'RONDVAART', 100, 49, 0.7, '#f9edd4');
    }]
  });
  Object.assign(SC.japaneast, {
    sc_jp_metro: [320, 180, function (g, w, h) {
      g.fillStyle = '#4c626f'; g.fillRect(3, 73, 314, 75);
      poly(g, [[0, 74], [36, 34], [282, 34], [320, 74]], lg(g, 0, 34, 0, 74, [[0, '#9aa9ae'], [1, '#3c5664']]));
      for (let x = 20; x < 308; x += 24) { line(g, x, 48, x, 128, 2, '#c2c7bf'); line(g, x, 49, x + 18, 66, 0.8, '#d6d3c4'); }
      g.fillStyle = '#202f40'; g.fillRect(15, 76, 290, 39);
      for (let x = 25; x < 300; x += 29) lit(g, x, 79, 20, 3, '#f4dfb1');
      rrect(g, 72, 43, 175, 23, 2, '#e3e5da');
      ell(g, 86, 54, 8, 8, '#e9982e'); txt(g, 'G', 82.4, 50.3, 1, '#283d53');
      txt(g, 'SHIBUYA - G01', 101, 48, 1.25, '#1e4057');
      g.save(); g.translate(35, 83); commuterTrain(g, false); g.restore();
      g.fillStyle = '#91a0a5'; g.fillRect(0, 127, 320, 6);
      for (let x = 22; x < 314; x += 72) { g.fillStyle = '#606f79'; g.fillRect(x, 133, 12, 47); line(g, x + 2, 135, x + 2, 178, 1, '#a7b3b0'); }
      rrect(g, 198, 139, 103, 17, 1, '#087caa'); txt(g, 'TOKYO METRO', 207, 144, 0.9, '#ffffff');
      g.fillStyle = '#283b4c'; g.fillRect(0, 172, w, 8);
      [51, 120, 184].forEach((x) => { ell(g, x, 161, 2, 2.5, '#caa18c'); line(g, x, 164, x, 171, 3, '#3f5b77'); });
    }],
    sc_jp_billboards: [300, 240, function (g, w, h) {
      const ads = [['AZURE', '#147cb3'], ['COPILOT', '#5a589d'], ['GITHUB', '#255341'], ['XBOX', '#287647'], ['TEAMS', '#6555a3'], ['TOKYO', '#ad416c']];
      [10, 110, 211].forEach((x, i) => {
        const top = [22, 0, 35][i], bw = i === 1 ? 93 : 80;
        g.fillStyle = lg(g, 0, top, 0, h, [[0, '#414f69'], [1, '#18283d']]); g.fillRect(x, top, bw, h - top - 26);
        for (let y = top + 8; y < 198; y += 10) for (let wx = x + 5; wx < x + bw - 4; wx += 10) lit(g, wx, y, 5, 4, '#a9bdc8');
        for (let ad = 0; ad < 2; ad++) {
          const a = ads[i * 2 + ad], y = top + 12 + ad * 76;
          rrect(g, x + 3, y, bw - 6, 62, 2, '#b4cccd');
          g.fillStyle = lg(g, 0, y, 0, y + 60, [[0, a[1]], [1, '#152a42']]); g.fillRect(x + 5, y + 2, bw - 10, 58);
          if (!i && !ad) msLogo(g, x + 26, y + 8, 22);
          else { ell(g, x + bw / 2, y + 24, 15, 12, 'rgba(217,243,235,0.2)'); txt(g, ad ? 'CLOUD' : 'AI', x + 24, y + 18, 1, '#e6ece2'); }
          txt(g, a[0], x + bw / 2 - txtW(a[0], 1.1) / 2, y + 43, 1.1, '#ffffff');
        }
      });
      g.fillStyle = '#29364a'; g.fillRect(0, 215, w, 25);
      for (let x = -20; x < 300; x += 22) poly(g, [[x, 240], [x + 13, 220], [x + 23, 220], [x + 10, 240]], '#c1c9c5');
      const r = rng(754);
      for (let i = 0; i < 29; i++) {
        const x = 9 + r() * 280, y = 216 + r() * 14;
        ell(g, x, y - 5, 1.5, 1.8, '#bfa493'); line(g, x, y - 3, x + 1, y + 1, 2.8, ['#314a66', '#a16b75', '#c4b397'][i % 3]);
        line(g, x, y + 1, x - 1.5, y + 4, 0.7, '#1b293e'); line(g, x + 1, y + 1, x + 2.5, y + 4, 0.7, '#1b293e');
      }
      [4, 294].forEach((x) => { line(g, x, 193, x, 232, 1.3, '#58717c'); rrect(g, x - 3, 190, 6, 13, 1, '#193443'); ell(g, x, 199, 1.7, 1.7, '#7dbb89'); });
    }],
    sc_jp_sakura: [260, 160, function (g, w, h) {
      const r = rng(912);
      for (let t = 0; t < 3; t++) {
        const x = 43 + t * 85, top = 33 + (t % 2) * 13;
        limb(g, x, h, x - 5, top + 44, 7, '#644d5a', '#a6807a');
        [[-30, 7], [24, -4], [-7, -15], [37, 21]].forEach(([dx, dy]) => {
          line(g, x - 4, top + 52, x + dx, top + dy + 17, 2.4, '#725662');
          for (let i = 0; i < 27; i++) {
            const bx = x + dx + (r() - 0.5) * 45, by = top + dy + (r() - 0.5) * 24;
            ell(g, bx, by, 4 + r() * 5, 2.6 + r() * 3, ['#d885b3', '#efb1ca', '#f7d4df', '#ffe6e7'][i % 4]);
            ell(g, bx + 1, by - 1, 0.8, 0.7, '#fff0e6');
          }
        });
      }
      g.fillStyle = '#6e6667'; g.fillRect(0, h - 9, w, 9);
      for (let i = 0; i < 60; i++) ell(g, r() * w, h - r() * 18, 1.5, 0.6, '#f3c9df');
      line(g, 0, h - 10, w, h - 10, 1, '#c1bba7');
    }]
  });
  Object.assign(SC.australiaeast, {
    sc_au_beach: [360, 170, function (g, w, h) {
      g.fillStyle = lg(g, 0, 30, 0, h, [[0, '#348baf'], [0.45, '#65becb'], [1, '#bcdfce']]); g.fillRect(0, 48, w, 122);
      poly(g, [[0, 170], [0, 123], [64, 117], [147, 129], [227, 98], [300, 84], [360, 90], [360, 170]], lg(g, 0, 90, 0, 170, [[0, '#e9c78e'], [1, '#c19e79']]));
      for (let wave = 0; wave < 4; wave++) {
        g.strokeStyle = wave % 2 ? '#bde7df' : '#f1f5df'; g.lineWidth = wave % 2 ? 1 : 2;
        g.beginPath(); g.moveTo(0, 66 + wave * 13); g.bezierCurveTo(120, 52 + wave * 16, 176, 113 + wave * 5, 360, 56 + wave * 7); g.stroke();
      }
      g.fillStyle = '#c9d6c6'; g.fillRect(263, 57, 91, 28); g.fillStyle = '#f0efda'; g.fillRect(265, 47, 87, 11);
      for (let x = 270; x < 350; x += 13) lit(g, x, 61, 8, 12, '#7dadae');
      txt(g, 'BONDI SURF', 273, 50, 0.8, '#226879');
      palm(g, 336, 121, 106);
      [[42, 137, '#d87b66'], [126, 145, '#598da6'], [219, 129, '#d9ac51']].forEach(([x, y, color]) => {
        line(g, x, y, x, y - 22, 0.9, '#765d55');
        poly(g, [[x - 16, y - 20], [x, y - 30], [x + 16, y - 20]], color);
        ell(g, x + 10, y + 3, 12, 2, '#e8d8ae');
      });
      [181, 249].forEach((x) => { line(g, x, 143, x, 108, 1, '#e9dfc2'); poly(g, [[x, 108], [x + 14, 113], [x, 117]], '#cf4750'); poly(g, [[x, 117], [x + 14, 113], [x + 14, 120], [x, 124]], '#efc24c'); });
      ell(g, 196, 146, 3, 17, '#e9d8ae', 0.24); line(g, 196, 131, 197, 160, 0.8, '#dc755c');
      txt(g, 'SYDNEY BEACH', 16, 156, 0.85, '#5e6057');
    }],
    sc_au_outback: [340, 170, function (g, w, h) {
      poly(g, [[0, 85], [35, 63], [76, 72], [122, 42], [162, 62], [211, 51], [257, 70], [298, 56], [340, 84], [340, 170], [0, 170]], lg(g, 0, 60, 0, 170, [[0, '#bc7159'], [1, '#b35c43']]));
      g.fillStyle = '#d39365'; g.beginPath(); g.moveTo(86, 170); g.quadraticCurveTo(112, 132, 229, 97); g.quadraticCurveTo(165, 133, 154, 170); g.closePath(); g.fill();
      const r = rng(303);
      for (let i = 0; i < 70; i++) {
        const x = r() * w, y = 97 + r() * 72; ell(g, x, y, 2 + r() * 5, 1, '#916e4b');
        if (i % 5 === 0) { line(g, x, y, x - 2, y - 4, 0.6, '#a49a68'); line(g, x, y, x + 2, y - 6, 0.6, '#c8b47d'); }
      }
      [28, 284].forEach((x, i) => {
        line(g, x, 133, x + 7, 50 + i * 18, 5, '#797264'); line(g, x + 5, 80, x - 17, 57, 2.2, '#87816c'); line(g, x + 6, 75, x + 26, 43, 2, '#87816c');
        [[-15, 55], [8, 38], [30, 44], [11, 65]].forEach(([dx, y]) => ell(g, x + dx, y + i * 18, 22, 8, '#6d8068', -0.1));
      });
      g.fillStyle = '#e5cda4'; g.fillRect(185, 90, 93, 30); poly(g, [[179, 91], [193, 80], [271, 80], [284, 91]], '#81685c');
      rrect(g, 193, 96, 77, 12, 1, '#66473e'); txt(g, 'OUTBACK ROADHOUSE', 197, 100, 0.65, '#ffe1a3');
      g.save(); g.translate(188, 120); g.scale(0.9, 0.9); outback4x4(g); g.restore();
      line(g, 163, 99, 163, 137, 1.6, '#625a4a'); rrect(g, 139, 94, 48, 16, 1, '#d3a442'); txt(g, 'ULURU', 148, 99, 0.9, '#4e4b3b');
    }]
  });

  /* @@REGION_FRAGMENTS@@ */
  const sceneryKeys = {};
  // Signature landmarks open the strip and appear about twice as often as other local pieces.
  const sceneryStars = { francecentral: ['sc_fr_eiffel', 'sc_fr_sacrecoeur', 'sc_fr_moulinrouge'] };
  // Landmarks already painted in each bg_far_<region> panorama; the street strip skips these copies.
  const panoramaLandmarks = {
    westeurope: ['sc_we_mill', 'sc_we_kerk'],
    uksouth: ['sc_uk_bigben', 'sc_uk_eye', 'sc_uk_tbridge', 'sc_uk_shard'],
    japaneast: ['sc_jp_tower'],
    australiaeast: ['sc_au_opera', 'sc_au_bridge', 'sc_au_tower'],
    brazilsouth: ['sc_br_christ', 'sc_br_sugar'],
    italynorth: ['sc_it_colosseum', 'sc_it_pisa', 'sc_it_milano', 'sc_it_firenze'],
    westus2: ['sc_rd_rainier', 'sc_rd_needle'],
    mexicocentral: ['sc_mx_pyramidsun', 'sc_mx_angel'],
    francecentral: ['sc_fr_eiffel', 'sc_fr_sacrecoeur', 'sc_fr_arc']
  };
  const sceneryRoutes = {
    westeurope: [[0, 'sc_we_centraal'], [0.18, 'sc_we_schiphol'], [0.36, 'sc_nl_canalcruise'], [0.52, 'sc_nl_transit', 270], [0.68, 'sc_we_centraal'], [0.84, 'sc_we_schiphol']],
    japaneast: [[0, 'sc_jp_billboards'], [0.15, 'sc_jp_metro', 325], [0.34, 'sc_jp_sakura', 300], [0.56, 'sc_jp_shibuya'], [0.76, 'sc_jp_sakura', 300]],
    australiaeast: [[0, 'sc_au_beach', 270], [0.23, 'sc_au_outback', 270], [0.42, 'sc_au_uluru', 260], [0.62, 'sc_au_outback', 270], [0.81, 'sc_au_beach', 270]]
  };
  Object.keys(SC).forEach(function (r) {
    sceneryKeys[r] = Object.keys(SC[r]);
    Object.keys(SC[r]).forEach(function (k) { const d = SC[r][k]; reg2(k, d[0], d[1], function (g, w, h) { d[2](g, w, h, MP[r]); }, FLAT); });
  });

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
    MAP: MAP,
    D: D,
    skinKeys: skinKeys,
    obSize: obSize,
    sceneryKeys: sceneryKeys,
    sceneryStars: sceneryStars,
    sceneryRoutes: sceneryRoutes,
    panoramaLandmarks: panoramaLandmarks,
    billKeys: billKeys,
    buildCloudPlatform: function (scene, p) {
      const variant = Math.abs(Math.round(p.x / 100)) % 4;
      const key = 'cloud_platform_' + p.cloudKind + '_' + p.w + '_' + p.h + '_' + variant + (p.lowTunnel ? '_duct' : '');
      if (!scene.textures.exists(key)) {
        if (!defs[key]) reg2(key, p.w, p.h, function (g) {
          if (p.cloudKind === 'metro') {
            if (p.h <= 24) metroDeck(g, p.w, p.h, p.lowTunnel); else metroBlock(g, p.w, p.h, variant);
          } else if (p.cloudKind === 'tube') {
            tubeBlock(g, p.w, p.h, p.lowTunnel);
          } else if (p.h <= 24) {
            cloudDeck(g, p.w, p.h, p.cloudKind, p.lowTunnel);
          } else if (p.cloudKind === 'docker' || p.cloudKind === 'aks') {
            const rows = Math.max(1, Math.round(p.h / 48)), height = p.h / rows;
            for (let row = 0; row < rows; row++) {
              cargoBox(g, 0, row * height, p.w, height, variant + row,
                p.cloudKind === 'aks' ? 'AKS' : 'AZURE');
            }
          } else if (p.cloudKind === 'entra' || p.cloudKind === 'functions') {
            cloudCabinet(g, 0, 0, p.w, p.h, p.cloudKind);
          } else {
            cargoBox(g, 0, 0, p.w, p.h, variant, 'BUILD');
          }
        }, FLAT);
        scene.textures.addCanvas(key, defs[key]);
      }
      return key;
    },
    hero: {
      skins: HERO_SKIN.map((c) => c[1]), hairCols: HERO_HAIR.map((c) => c[1]), styles: HERO_HAIR_STYLES, hats: HERO_HATS, gear: HERO_GEAR,
      suits: HERO_SUIT.map((c) => c.suit), suitNames: HERO_SUIT.map((c) => c.name), suitUnlock: HERO_SUIT.map((c) => c.unlock), def: HERO_DEF,
      hairNames: Object.assign({ swoop: 'SWOOP', buzz: 'BUZZ CUT', afro: 'AFRO', long: 'LONG', pony: 'PONYTAIL', braids: 'BRAIDS', bob: 'BOB' }, Object.fromEntries(HERO_REGIONAL_HAIR.map((x) => [x[0], x[1]]))),
      hairUnlock: HERO_HAIR_STYLES.map(hairUnlock), gearUnlock: HERO_GEAR.map((x) => x[3] === undefined ? -1 : x[3]),
      wardrobeOpen: wardrobeOpen, wardrobeFor: wardrobeFor, lookOpen: lookOpen,
      suitOpen: suitOpen,
      // suit indexes newly opened by clearing level index i
      suitsFor: (i) => HERO_SUIT.map((c, k) => (c.unlock === i ? k : -1)).filter((k) => k >= 0)
    },
    // saved Hero Lab look, falling back to the classic hero / heroine presets; locked suits fall back to the default
    lookOf: function (data) {
      const L = data && data.look;
      const out = L && (L.body === 'm' || L.body === 'f') ? Object.assign({}, HERO_DEF[L.body], L) : Object.assign({}, HERO_DEF[data && data.hero === 'f' ? 'f' : 'm']);
      // older saves stored the hijab as a hairstyle; it is headwear now
      if (out.hair === 'hijab') { out.hair = HERO_DEF[out.body].hair; out.hat = 'hijab'; }
      if (!suitOpen(out.suit, data && data.unlocked)) out.suit = HERO_DEF[out.body].suit;
      if (!wardrobeOpen('hair', out.hair, data && data.unlocked)) out.hair = HERO_DEF[out.body].hair;
      if (!wardrobeOpen('gear', out.gear, data && data.unlocked)) out.gear = HERO_DEF[out.body].gear;
      if (!wardrobeOpen('hat', out.hat, data && data.unlocked)) out.hat = HERO_DEF[out.body].hat;
      return out;
    },
    HD: 8,
    // high-density (HD x) portrait frame for Title / Hero Lab; not auto-scaled, so callers setScale(size / HD)
    buildHeroHD: function (scene, look, frame) {
      frame = frame || 'idle';
      const P = 'hd_' + [look.body, look.skin, look.hair, look.hairCol, look.suit, look.hat || 'none', look.gear || 'none'].join('_') + '_';
      if (!scene.textures.exists(P + frame)) {
        DEN = AH.Art.HD; HDX = true;
        try { regHero(P, look, [frame]); } finally { DEN = D; HDX = false; }
        scene.textures.addCanvas(P + frame, defs[P + frame]);
        delete defs[P + frame];
      }
      return P + frame;
    },
    // draws the hero frames for a look once and returns the texture prefix (frames: idle run0-3 jump attack shield fly)
    buildHero: function (scene, look) {
      const P = 'hl_' + [look.body, look.skin, look.hair, look.hairCol, look.suit, look.hat || 'none', look.gear || 'none'].join('_') + '_';
      if (!scene.textures.exists(P + 'idle')) {
        regHero(P, look);
        HERO_FRAMES.forEach(function (f) { if (!scene.textures.exists(P + f)) scene.textures.addCanvas(P + f, defs[P + f]); });
      }
      if (!scene.anims.exists(P + 'run')) scene.anims.create({ key: P + 'run', frames: [0, 1, 2, 3].map((i) => ({ key: P + 'run' + i })), frameRate: 12, repeat: -1 });
      return P;
    },
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
      mk('hacker_walk', ['hacker_0', 'hacker_1'], 5);
      mk('drone_fly', ['drone_0', 'drone_1'], 16);
      mk('spider_crawl', ['spider_0', 'spider_1'], 8);
      mk('phish_swim', ['phish_0', 'phish_1'], 6);
      mk('ram_run', ['ram_0', 'ram_1'], 8);
      mk('botnet_float', ['botnet_0', 'botnet_1'], 3);
      ['bug', 'image', 'rbac', 'endpoint', 'guest'].forEach((k) => mk(k + '_move', [k + '_0', k + '_1'], 6));
      skinKeys.forEach((k) => mk(k, [k + '_0', k + '_1'], k.slice(-5) === 'drone' ? 16 : k.slice(-6) === 'spider' ? 8 : 5));
      Object.keys(COINS).forEach((r) => mk('coin_' + r, [0, 1, 2, 3].map((i) => 'coin_' + r + i), 8));
      mk('hero_run', ['hero_run0', 'hero_run1', 'hero_run2', 'hero_run3'], 12);
      mk('bike_ride', ['bike_ride0', 'bike_ride1'], 10);
      mk('amb_heli', ['amb_heli_0', 'amb_heli_1'], 18);
      Object.keys(AMB_BIRDS).forEach((k) => mk('amb_bird_' + k, ['amb_bird_' + k + '_0', 'amb_bird_' + k + '_1'], 7));
      mk('hero_f_run', ['hero_f_run0', 'hero_f_run1', 'hero_f_run2', 'hero_f_run3'], 12);
    }
  };
})();
