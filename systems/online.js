/* Online services when the game is hosted by server.js on Azure App Service:
   player accounts, cloud progress (resume on any device) and the global high score dashboard.
   On static hosting or file:// the API is missing and the game silently stays in guest mode. */
(function () {
  'use strict';
  const AH = (window.AH = window.AH || {});
  const TOKEN_KEY = 'azureheroes2027_token';

  function req(method, url, body) {
    const o = AH.Online;
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), 8000) : null;
    const headers = { 'content-type': 'application/json' };
    if (o.token) headers.authorization = 'Bearer ' + o.token;
    return fetch(url, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined, signal: ctl ? ctl.signal : undefined })
      .then((r) => r.json().catch(() => ({})).then((j) => {
        if (timer) clearTimeout(timer);
        if (!r.ok) { if (r.status === 401 && o.token && url !== '/api/login') o.forget(); throw new Error(j.error || 'SERVER ERROR'); }
        return j;
      }), (e) => { if (timer) clearTimeout(timer); throw new Error(e && e.name === 'AbortError' ? 'SERVER TIMEOUT' : 'OFFLINE'); });
  }

  AH.Online = {
    available: false,
    token: null,
    profile: null,
    pushTimer: null,

    init() {
      try { this.token = localStorage.getItem(TOKEN_KEY); } catch (e) { this.token = null; }
      if (!/^https?:$/.test(location.protocol)) return Promise.resolve(false);
      return req('GET', '/api/health').then((j) => {
        this.available = !!(j && j.ok);
        if (this.available && this.token) return req('GET', '/api/me').then((m) => this.adopt(m.profile)).catch(() => {});
      }).catch(() => { this.available = false; }).then(() => this.available);
    },

    get name() { return this.profile ? this.profile.name : null; },

    adopt(profile) {
      this.profile = profile;
      const d = AH.Save.data, p = profile.progress || {};
      d.unlocked = Math.max(d.unlocked || 1, p.unlocked || 1);
      Object.keys(p.bests || {}).forEach((k) => { if (p.bests[k] > (d.bests[k] || 0)) d.bests[k] = p.bests[k]; });
      d.best = Math.max(d.best || 0, profile.best || 0);
      if ((p.updated || 0) > (d.updated || 0)) { d.resume = p.resume || null; d.updated = p.updated; }
      AH.Save.save();
      this.pushNow();
    },

    forget() {
      this.token = null;
      this.profile = null;
      try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
    },

    auth(mode, name, password, loc) {
      const d = AH.Save.data;
      return req('POST', '/api/' + mode, { name: name, password: password, location: loc, progress: { unlocked: d.unlocked, bests: d.bests, resume: d.resume, updated: d.updated } })
        .then((j) => {
          this.token = j.token;
          try { localStorage.setItem(TOKEN_KEY, j.token); } catch (e) { /* ignore */ }
          this.adopt(j.profile);
          return j.profile;
        });
    },

    logout() {
      const done = () => this.forget();
      return this.token ? req('POST', '/api/logout').then(done, done) : Promise.resolve(done());
    },

    pushProgress() {
      if (!this.available || !this.token) return;
      clearTimeout(this.pushTimer);
      this.pushTimer = setTimeout(() => this.pushNow(), 1200);
    },

    pushNow() {
      if (!this.available || !this.token) return;
      clearTimeout(this.pushTimer);
      const d = AH.Save.data;
      req('PUT', '/api/progress', { unlocked: d.unlocked, bests: d.bests, resume: d.resume, updated: d.updated }).catch(() => {});
    },

    submitScore(score, level, city) {
      if (!this.available || !this.token || !(score > 0)) return Promise.resolve(null);
      return req('POST', '/api/score', { score: score, level: level, city: city }).then((j) => {
        if (this.profile) this.profile.best = j.best;
        return j;
      }).catch(() => null);
    },

    leaderboard(limit) {
      if (!this.available) return Promise.reject(new Error('OFFLINE'));
      return req('GET', '/api/leaderboard?limit=' + (limit || 10));
    },

    /* HTML form overlay (real text inputs work with mobile keyboards and password managers) */
    openForm(mode) {
      const el = document.getElementById('acct');
      if (!el || !this.available) return Promise.resolve(null);
      const f = el.querySelector('form'), err = el.querySelector('.err'), title = el.querySelector('h2');
      const locRow = el.querySelector('.loc'), swap = el.querySelector('.swap'), submit = el.querySelector('button[type=submit]');
      const E = f.elements;
      const kb = window.AHGame && AHGame.input.keyboard;
      return new Promise((resolve) => {
        const set = (m) => {
          mode = m;
          title.textContent = m === 'register' ? 'NEW HERO' : 'HERO LOGIN';
          locRow.style.display = m === 'register' ? '' : 'none';
          E.loc.required = m === 'register';
          E.pass.autocomplete = m === 'register' ? 'new-password' : 'current-password';
          submit.textContent = m === 'register' ? 'REGISTER' : 'LOG IN';
          swap.textContent = m === 'register' ? 'I ALREADY HAVE AN ACCOUNT' : 'CREATE A NEW ACCOUNT';
          err.textContent = '';
        };
        const close = (v) => {
          el.hidden = true;
          f.onsubmit = null; swap.onclick = null; el.querySelector('.cancel').onclick = null;
          if (kb) kb.enabled = true;
          resolve(v);
        };
        set(mode || 'login');
        if (kb) kb.enabled = false;
        el.hidden = false;
        setTimeout(() => E.hero.focus(), 60);
        swap.onclick = () => set(mode === 'register' ? 'login' : 'register');
        el.querySelector('.cancel').onclick = () => close(null);
        f.onkeydown = (e) => { if (e.key === 'Escape') close(null); e.stopPropagation(); };
        f.onsubmit = (e) => {
          e.preventDefault();
          err.textContent = 'CONNECTING...';
          submit.disabled = true;
          this.auth(mode, E.hero.value, E.pass.value, E.loc.value).then((p) => {
            submit.disabled = false;
            E.pass.value = '';
            close(p);
          }, (x) => { submit.disabled = false; err.textContent = x.message; });
        };
      });
    }
  };
})();
