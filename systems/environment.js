/* Outdoor lighting and city-owned, full-viewport scenic sections. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const CYCLE = 240;
  const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  function mix(a, b, t) {
    let color = 0;
    for (const shift of [16, 8, 0]) color |= Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t) << shift;
    return color;
  }
  function sample(seconds, order) {
    const phase = ((seconds % CYCLE + CYCLE) % CYCLE) / CYCLE * order.length;
    const index = Math.floor(phase);
    return { from: order[index], to: order[(index + 1) % order.length], blend: smooth(phase - index) };
  }
  function weight(section, progress) {
    return smooth((progress - section.start) / section.fade) * smooth((section.end - progress) / section.fade);
  }
  class Environment {
    constructor(scene, palette, order) {
      this.scene = scene; this.palette = palette; this.order = order;
      this.seconds = Math.max(0, order.indexOf(scene.tod)) / order.length * CYCLE;
      this.strip = scene.children.list.filter((o) => o.depth === -18 && o.setTint);
      this.sections = ((AH.Art.environments || {})[scene.L.region] || []).map((section) => ({
        ...section,
        image: scene.add.image(0, 0, section.key).setOrigin(0).setScrollFactor(0).setDepth(-17.5).setAlpha(0)
      }));
      this.replacedKeys = new Set(this.sections.flatMap((section) => section.replaces || []));
      if (scene.tod) {
        this.skyBlend = scene.add.image(0, 0, scene.sky.texture.key).setOrigin(0).setScrollFactor(0).setDepth(-29.9);
        this.wash = scene.add.image(0, 110, 'tod_wash').setOrigin(0).setDisplaySize(640, 220)
          .setScrollFactor(0).setDepth(-16.9).setBlendMode(Phaser.BlendModes.ADD);
        this.dark = scene.add.rectangle(0, 0, 640, 360, 0x06041c, 1).setOrigin(0).setScrollFactor(0).setDepth(900);
      }
      this.update(0);
    }
    update(dt) {
      const s = this.scene, outdoors = !s.inPipe && !s.inBonus;
      if (outdoors && !s.warping && s.state === 'play') this.seconds += dt;
      const progress = (s.cameras.main.scrollX + 320) / s.L.width;
      let total = 0;
      const weights = this.sections.map((section) => {
        const alpha = outdoors ? weight(section, progress) : 0;
        total += alpha; return alpha;
      });
      const coverage = Math.min(1, total);
      this.sections.forEach((section, i) => section.image.setAlpha(weights[i] / Math.max(1, total)));
      s.far.setAlpha(1 - coverage); s.near.setAlpha(1 - coverage);
      if (s.fore) s.fore.setAlpha(1 - coverage);
      this.strip.forEach((o) => o.setAlpha(this.replacedKeys.has(o.texture.key) ? 0 : 1 - coverage));
      if (s.road) s.road.setAlpha(0.55 * (1 - coverage));
      if (s.railLine) s.railLine.setAlpha(0.7 * (1 - coverage));
      (s.amb || []).forEach((o) => { if (o.img.depth > -24) o.img.setAlpha(1 - coverage); });
      if (!this.skyBlend) return;
      const state = sample(this.seconds, this.order), a = this.palette[state.from], b = this.palette[state.to], t = state.blend;
      const sky = (name) => name === 'sunset' ? 'bg_sky_' + s.L.region : 'bg_sky_tod_' + name;
      if (s.sky.texture.key !== sky(state.from)) s.sky.setTexture(sky(state.from));
      if (this.skyBlend.texture.key !== sky(state.to)) this.skyBlend.setTexture(sky(state.to));
      this.skyBlend.setAlpha(t);
      s.far.setTint(mix(a.far, b.far, t)); s.near.setTint(mix(a.near, b.near, t));
      if (s.fore) s.fore.setTint(mix(a.near, b.near, t));
      const tint = mix(a.strip, b.strip, t);
      this.strip.forEach((o) => o.setTint(tint));
      this.sections.forEach((section) => section.image.setTint(tint));
      if (s.road) s.road.setTint(mix(a.near, b.near, t));
      if (s.railLine) s.railLine.setTint(mix(a.near, b.near, t));
      const wa = a.wash || [0xffffff, 0], wb = b.wash || [0xffffff, 0];
      this.wash.setVisible(outdoors).setTint(mix(wa[0], wb[0], t)).setAlpha(wa[1] * (1 - t) + wb[1] * t);
      this.dark.setVisible(outdoors).setAlpha((a.dark || 0) * (1 - t) + (b.dark || 0) * t);
    }
  }
  Object.assign(Environment, { CYCLE, sample, weight });
  AH.Environment = Environment;
})();
