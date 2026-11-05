'use strict';
// Optional real-browser audio check: Node 22+, Chrome, and an already-running local server.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  if (typeof WebSocket === 'undefined') throw new Error('Audio rendering requires Node 22+ (native WebSocket).');
  const output = process.argv[2];
  if (!output) throw new Error('Usage: node tests/render-audio.js OUTPUT_DIRECTORY [SONG_KEYS...]');
  const origin = `http://127.0.0.1:${process.env.PORT || 8080}`;
  const response = await fetch(origin);
  if (!response.ok) throw new Error(`Local game server returned ${response.status}`);
  const executable = process.env.CHROME_BIN || (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
  const profile = path.resolve('.audio-render-profile-' + process.pid);
  fs.mkdirSync(profile);
  const chrome = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run',
    '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore' });
  let spawnError, socket;
  chrome.on('error', (error) => { spawnError = error; });
  const exited = new Promise((resolve) => chrome.once('exit', resolve));
  try {
    const activePort = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 100 && !fs.existsSync(activePort); i++) {
      if (spawnError) throw spawnError;
      if (chrome.exitCode !== null) throw new Error('Chrome exited before becoming ready.');
      await sleep(100);
    }
    if (!fs.existsSync(activePort)) throw new Error('Chrome did not become ready.');
    const port = fs.readFileSync(activePort, 'utf8').split('\n')[0];
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const target = targets.find((entry) => entry.type === 'page');
    if (!target) throw new Error('Chrome has no page target.');
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    let sequence = 0;
    const pending = new Map(), exceptions = [];
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data), request = pending.get(message.id);
      if (request) {
        pending.delete(message.id); clearTimeout(request.timer);
        if (message.error) request.reject(new Error(JSON.stringify(message.error)));
        else request.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails);
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('Timeout: ' + method)); }, 120000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (expression) => {
      const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    await call('Runtime.enable');
    await call('Page.navigate', { url: origin });
    let ready = false;
    for (let i = 0; i < 100; i++) {
      await sleep(100);
      ready = await evaluate("!!window.AH?.Audio?.SONGS && typeof OfflineAudioContext !== 'undefined'");
      if (ready || exceptions.length) break;
    }
    if (!ready || exceptions.length) throw new Error('Audio startup failed: ' + JSON.stringify(exceptions));
    fs.mkdirSync(output, { recursive: true });
    const live = await evaluate(`(async () => {
      const audio=AH.Audio, routes=[];
      audio.init();
      for (const style of audio.STYLES) {
        audio.setStyle(style);
        for (const kind of ['main','pipe','boss']) {
          audio.music(kind,'uksouth');
          await new Promise(resolve=>setTimeout(resolve,150));
          if (!audio.seq || audio.seq.key!==audio.songFor(kind,'uksouth')) throw new Error('Live routing failed');
          routes.push(audio.seq.key);
        }
      }
      audio.toggle(); audio.toggle();
      audio.music(null);
      return {context:audio.ctx.state,routes,styles:[...audio.STYLES],stopped:audio.seq===null};
    })()`);
    if (exceptions.length || live.context !== 'running' || !live.stopped) {
      throw new Error('Live audio validation failed: ' + JSON.stringify({ live, exceptions }));
    }
    console.log(JSON.stringify({ live }));
    fs.writeFileSync(path.join(output, 'live.json'), JSON.stringify(live, null, 2));
    const keys = process.argv.slice(3);
    if (!keys.length) {
      for (const style of ['trance', 'house', 'pop']) {
        for (const context of ['main', 'pipe', 'boss']) keys.push(`${style}_new-york_${context}`);
      }
    }
    const report = [];
    for (const key of keys) {
      const result = await evaluate(`(async () => {
        const key = ${JSON.stringify(key)}, song = AH.Audio.SONGS[key];
        if (!song) throw new Error('Unknown song: ' + key);
        const rate = 22050, barDuration = song.steps * song.stepDur;
        const loop = song.bars.length * barDuration, length = loop + 4 * barDuration + 2;
        const ctx = new OfflineAudioContext(1, Math.ceil(length * rate), rate);
        const audio = Object.assign({}, AH.Audio, { ctx, muted: false, init() {} });
        audio.master = ctx.createGain(); audio.master.gain.value = 0.5;
        audio.master.connect(ctx.destination);
        audio.sfx = ctx.createGain(); audio.sfx.connect(audio.master);
        audio.buildMusicBus();
        const out = ctx.createGain(), synth = ctx.createGain(), echo = ctx.createGain();
        out.connect(audio.musicBus); synth.connect(out);
        echo.gain.value = song.echo; echo.connect(audio.delay);
        audio.delay.delayTime.value = Math.min(0.9, song.stepDur * song.echoSteps);
        const sequence = { song, out, synth, echo };
        for (let bar = 0; bar < song.bars.length + 4; bar++) {
          song.bars[bar % song.bars.length].ev.forEach((events, step) => {
            const offbeat = Math.floor(step / song.swingEvery) % 2;
            const time = 0.05 + bar * barDuration + step * song.stepDur
              + (offbeat ? song.stepDur * song.swingEvery * song.swing : 0);
            for (const event of events) audio.voice(sequence, event, time);
          });
        }
        const tone = audio.tone, noise = audio.noise;
        let offset = 0;
        audio.tone = function(f,d,t,v,s,delay) { return tone.call(this,f,d,t,v,s,(delay||0)+offset); };
        audio.noise = function(d,v,delay) { return noise.call(this,d,v,(delay||0)+offset); };
        for (const [time, effect] of [[5,'coin'],[7,'blast'],[9,'hit']]) { offset=time; audio.play(effect); }
        const buffer = await ctx.startRendering(), samples = buffer.getChannelData(0);
        let peak=0, sum=0, square=0, delta=0, finite=true;
        const pcm = new Uint8Array(samples.length * 2), view = new DataView(pcm.buffer);
        for (let i=0; i<samples.length; i++) {
          const value=samples[i]; finite=finite && Number.isFinite(value);
          peak=Math.max(peak,Math.abs(value)); sum+=value; square+=value*value;
          if(i) delta=Math.max(delta,Math.abs(value-samples[i-1]));
          view.setInt16(i*2,Math.round(Math.max(-1,Math.min(1,value))*32767),true);
        }
        let binary='';
        for(let i=0;i<pcm.length;i+=8192) binary+=String.fromCharCode(...pcm.subarray(i,i+8192));
        const boundary=Math.round((loop+0.05)*rate);
        return {key, rate, seconds:samples.length/rate, peak, rms:Math.sqrt(square/samples.length),
          dc:sum/samples.length, maxDelta:delta, finite,
          loopDelta:Math.abs(samples[boundary]-samples[boundary-1]), pcm:btoa(binary)};
      })()`);
      const pcm = Buffer.from(result.pcm, 'base64');
      const header = Buffer.alloc(44);
      header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8);
      header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
      header.writeUInt32LE(result.rate, 24); header.writeUInt32LE(result.rate * 2, 28);
      header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36);
      header.writeUInt32LE(pcm.length, 40);
      fs.writeFileSync(path.join(output, key + '.wav'), Buffer.concat([header, pcm]));
      delete result.pcm;
      result.pass = result.finite && result.peak < Math.pow(10, -1 / 20) && result.rms > 0.003
        && Math.abs(result.dc) < 0.001 && result.maxDelta < 0.3 && result.loopDelta < 0.1;
      report.push(result);
      console.log(JSON.stringify(result));
    }
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    if (report.some((result) => !result.pass)) throw new Error('Audio measurements failed; inspect report.json.');
  } finally {
    socket?.close();
    if (chrome.pid && chrome.exitCode === null) {
      chrome.kill('SIGTERM');
      await Promise.race([exited, sleep(3000)]);
      if (chrome.exitCode === null) { chrome.kill('SIGKILL'); await exited; }
    }
    fs.rmSync(profile, { recursive: true, force: true });
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
