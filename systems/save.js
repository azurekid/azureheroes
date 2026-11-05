/* Device-local adventure persistence, independent of audio. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const KEY = 'azureheroes2027';
  AH.Save = {
    data: { best: 0, unlocked: 1, bests: {}, muted: false, hero: 'm', resume: null, updated: 0 },
    load() {
      try {
        const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
        this.data = Object.assign({ best: 0, unlocked: 1, bests: {}, muted: false, hero: 'm', resume: null, updated: 0 }, raw);
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
    }
  };
})();
