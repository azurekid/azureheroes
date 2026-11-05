/* Device-local adventure persistence, independent of audio. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const KEY = 'azureheroes2027';
  const emptyWardrobe = () => ({ items: [], legacyUnlocked: 1, legacyClassic: false });
  const validItem = (id) => typeof id === 'string' && /^(?:suit:(?:[0-9]|1[0-8])|(?:hair|hat|gear):[a-z][a-z0-9]{0,31})$/.test(id);
  function wardrobe(progress) {
    const w = progress.wardrobe;
    if (!w || typeof w !== 'object') return {
      items: [], legacyUnlocked: Math.max(1, Math.min(12, Math.floor(Number(progress.unlocked) || 1))),
      legacyClassic: Object.keys(progress).length > 0
    };
    return {
      items: [...new Set((Array.isArray(w.items) ? w.items : []).filter(validItem))].slice(0, 128),
      legacyUnlocked: Math.max(1, Math.min(12, Math.floor(Number(w.legacyUnlocked) || 1))),
      legacyClassic: w.legacyClassic === true
    };
  }
  const worldIds = () => AH.Levels ? AH.Levels.ids : (AH.WorldOrder || []).map((slug, i) => i + 1);
  const validIds = (list) => [...new Set((Array.isArray(list) ? list : []).filter(id => worldIds().includes(id)))];
  function route(progress) {
    const ids = worldIds(), r = progress.route;
    if (r && typeof r === 'object') {
      const start = ids.includes(r.start) ? r.start : ids[0];
      const cleared = validIds(r.cleared);
      return { start, cleared, available: validIds([start, ...validIds(r.available), ...cleared]) };
    }
    const unlocked = Math.max(1, Number(progress.unlocked) || 1);
    const cleared = ids.filter((id, i) => i < unlocked - 1);
    return { start: ids[0], cleared, available: ids.filter((id, i) => i < unlocked || id === progress.resume?.id) };
  }
  AH.Save = {
    data: { best: 0, unlocked: 1, bests: {}, muted: false, hero: 'm', resume: null, updated: 0, wardrobe: emptyWardrobe() },
    load() {
      try {
        const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
        this.data = Object.assign({ best: 0, unlocked: 1, bests: {}, muted: false, hero: 'm', resume: null, updated: 0 }, raw);
        this.data.wardrobe = Object.keys(raw).length ? wardrobe(raw) : emptyWardrobe();
        this.data.route = route(raw);
      } catch (e) { /* storage unavailable (private mode) - keep defaults in memory */ }
      return this.data;
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
      if (AH.Online && !(AH.Gold && AH.Gold.run())) AH.Online.pushProgress();
    },
    // where CONTINUE picks the adventure back up: level id plus the score and lives carried into it
    setResume(id, score, lives) {
      this.data.resume = id ? { id: id, score: score || 0, lives: lives || 3 } : null;
      this.data.updated = Date.now();
      this.save();
    },
    recordScore(levelId, score) {
      if (score > this.data.best) this.data.best = score;
      if (score > (this.data.bests[levelId] || 0)) this.data.bests[levelId] = score;
      this.save();
    },
    unlock(n) {
      if (n > this.data.unlocked) { this.data.unlocked = n; this.save(); }
    },
    route() { return route(this.data); },
    worldOpen(id) { return this.route().available.includes(id); },
    worldCleared(id) { return this.route().cleared.includes(id); },
    mergeRoute(progress, startLevel) {
      const local = this.route(), remote = route(progress);
      const start = worldIds().includes(startLevel) ? startLevel : local.start;
      const preserveLocal = local.cleared.length || this.data.resume ||
        Object.keys(this.data.bests || {}).length || this.data.wardrobe?.items.length;
      this.data.route = { start, cleared: validIds([...local.cleared, ...remote.cleared]),
        available: validIds([start, ...(preserveLocal ? local.available : []), ...remote.available]) };
    },
    completeWorld(id) {
      if (!worldIds().includes(id)) throw new Error('UNKNOWN WORLD: ' + id);
      if (AH.Gold && AH.Gold.run()) return null;
      const r = this.route();
      r.cleared = validIds([...r.cleared, id]);
      const remaining = worldIds().filter(world => !r.cleared.includes(world));
      const next = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : null;
      r.available = validIds([...r.available, id, ...(next ? [next] : [])]);
      this.data.route = r;
      this.data.updated = Date.now();
      return next;
    },
    mergeWardrobe(progress) {
      const local = wardrobe(this.data), remote = wardrobe(progress);
      this.data.wardrobe = {
        items: [...new Set([...local.items, ...remote.items])].slice(0, 128),
        legacyUnlocked: Math.max(local.legacyUnlocked, remote.legacyUnlocked),
        legacyClassic: local.legacyClassic || remote.legacyClassic
      };
    },
    collectWardrobe(id) {
      const items = AH.WorldOrder.flatMap((slug, i) => AH.Art.hero.regionalItems(i));
      const item = items.find((item) => item.id === id);
      if (!item) throw new Error('UNKNOWN WARDROBE PICKUP: ' + id);
      if (AH.Gold && AH.Gold.run()) return false;
      if (AH.Art.hero.wardrobeOpen(item.category, item.value, this.data)) return false;
      if (!this.data.wardrobe) this.data.wardrobe = wardrobe(this.data);
      this.data.wardrobe.items.push(id);
      this.data.updated = Date.now();
      this.save();
      return true;
    }
  };
})();
