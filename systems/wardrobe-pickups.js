/* Collectible city clothing: optional exploration rewards, independent of boss access. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  AH.WardrobePickups = class WardrobePickups {
    constructor(scene) {
      this.scene = scene;
      const region = AH.Levels.ids.indexOf(scene.levelId);
      this.items = AH.Art.hero.regionalItems(region).filter((item) =>
        !AH.Art.hero.wardrobeOpen(item.category, item.value, AH.Save.data)).map((item, i) => {
        const spot = scene.L.wardrobeSpots[i];
        if (!spot) throw new Error('MISSING REGIONAL WARDROBE PLACEMENT: ' + item.id);
        const sprite = scene.add.image(spot.x, spot.y, 'wardrobe_cache_' + item.category).setDepth(28);
        const label = new AH.PixelText(scene, spot.x, spot.y - 28, item.name,
          { scale: 1, color: '#ffb8e3', ox: 0.5 }).setDepth(29);
        scene.tweens.add({ targets: sprite, alpha: 0.65, yoyo: true, repeat: -1, duration: 900 });
        return { ...item, spot, sprite, label, collected: false };
      });
    }
    update(player) {
      const scene = this.scene;
      if (scene.state !== 'play' || scene.warping || player.health <= 0) return;
      for (const item of this.items) {
        if (item.collected) continue;
        const p = item.spot;
        const inZone = p.bonus ? scene.inBonus : p.zone !== undefined
          ? scene.inPipe === scene.L.pipeZones[p.zone] : !scene.inPipe && !scene.inBonus;
        if (!inZone) continue;
        const b = player.body;
        if (b.x >= p.x + 20 || b.x + b.width <= p.x - 20 || b.y >= p.y + 20 || b.y + b.height <= p.y - 20) continue;
        const sandbox = AH.Gold.run();
        const saved = sandbox ? false : AH.Save.collectWardrobe(item.id);
        item.collected = true; item.sprite.setVisible(false); item.label.setVisible(false);
        scene.toast(sandbox ? 'HACKER SANDBOX - WARDROBE NOT SAVED' : (saved ? 'COLLECTED: ' : 'ALREADY OWNED: ') + item.name);
        AH.Audio.play('unlock');
      }
    }
  };
})();
