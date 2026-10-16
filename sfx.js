// Sound effects for Wizard's Deal, synthesised live with the Web Audio API (no sound files, nothing to license).
// Every sound runs through a soft hall reverb and a limiter. Sound is on by default and remembered per device
// ("wd-sound"); browsers only allow audio after the first tap or key press, so the context starts then.
(function () {
  "use strict";
  let ctx = null, out = null, wet = null, noiseBuf = null;
  const KEY = "wd-sound";
  const read = () => { try { const v = localStorage.getItem(KEY); return v == null ? true : v === "1"; } catch (e) { return true; } };
  let on = read();

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -14; lim.knee.value = 8; lim.ratio.value = 6; lim.attack.value = .003; lim.release.value = .2;
    const master = ctx.createGain(); master.gain.value = .55; master.connect(lim); lim.connect(ctx.destination);
    out = ctx.createGain(); out.connect(master);
    // a stone-hall reverb from decaying stereo noise
    const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const conv = ctx.createConvolver(); conv.buffer = ir;
    wet = ctx.createGain(); wet.gain.value = .28; wet.connect(conv); conv.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return ctx;
  }
  const unlock = () => { if (!on) return; init(); if (ctx && ctx.state === "suspended") ctx.resume(); };
  addEventListener("pointerdown", unlock, { capture: true, passive: true });
  addEventListener("keydown", unlock, { capture: true });

  const ready = () => on && !document.hidden && ctx && ctx.state === "running";
  // route a node to the dry bus and, a little, to the hall
  function send(node, rev = 1) { node.connect(out); if (rev > 0) { const g = ctx.createGain(); g.gain.value = rev; node.connect(g); g.connect(wet); } }

  // A tone with an attack/decay envelope. Optional pitch glide (to), vibrato, and pan.
  function tone(f, t, dur, o = {}) {
    const osc = ctx.createOscillator(), g = ctx.createGain(), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    osc.type = o.type || "sine"; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.glide || dur));
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vib; lg.gain.value = f * (o.vibAmt || .02); l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + .05); }
    const v = o.vol ?? .2, a = o.att ?? .004;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(g);
    let last = g; if (p) { p.pan.value = o.pan || 0; g.connect(p); last = p; }
    send(last, o.rev ?? 1);
    osc.start(t); osc.stop(t + dur + .05);
  }
  // A bell: a few inharmonic partials decaying at different rates.
  function bell(f, t, o = {}) {
    const v = o.vol ?? .12, d = o.dur ?? 1.6;
    [[1, 1, 1], [2.01, .5, .7], [3.0, .28, .5], [4.17, .16, .35], [5.43, .1, .25]].forEach(([r, a, dd]) => tone(f * r, t, d * dd, { vol: v * a, att: .002, pan: o.pan, rev: o.rev ?? 1.2 }));
  }
  // Filtered noise: card swishes, whooshes, thuds.
  function noise(t, dur, o = {}) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = o.filter || "bandpass"; f.Q.value = o.q ?? 1.2;
    f.frequency.setValueAtTime(o.f || 2000, t); if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const g = ctx.createGain(), v = o.vol ?? .2, a = o.att ?? .005;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f); f.connect(g);
    let last = g; if (ctx.createStereoPanner && o.pan) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p); last = p; }
    send(last, o.rev ?? .6);
    src.start(t, Math.random() * .5); src.stop(t + dur + .05);
  }
  const now = () => ctx.currentTime + .01;
  const jit = (x, k = .04) => x * (1 + (Math.random() * 2 - 1) * k);
  // D major pentatonic, for anything that sparkles
  const PENTA = [587.3, 659.3, 740, 880, 987.8, 1174.7, 1318.5, 1480, 1760, 1975.5, 2349.3];
  function sparkle(t, n, o = {}) {
    for (let i = 0; i < n; i++) { const f = PENTA[Math.floor(Math.random() * PENTA.length)] * (o.oct || 1); tone(f, t + i * (o.gap || .045) + Math.random() * .02, .35, { vol: (o.vol || .05) * (1 - i / (n * 1.6)), pan: Math.random() * 1.2 - .6, rev: 1.6, type: "triangle" }); }
  }

  const S = {
    // light wooden tap for buttons
    tap() { const t = now(); noise(t, .05, { f: 2800, q: 2, vol: .08, rev: .2 }); tone(jit(520, .05), t, .06, { vol: .05, type: "triangle", rev: .2 }); },
    // pick up a card in your hand
    pick() { const t = now(); noise(t, .09, { f: 3500, to: 6000, q: 1.5, vol: .07, rev: .2 }); },
    // cards dealt into your hand: quick flicks off the pile
    draw(n = 1) { const t = now(); for (let i = 0; i < Math.min(n, 5); i++) { const s = t + i * .11; noise(s, .12, { f: jit(1800), to: 4200, q: 1.1, vol: .13, att: .01, rev: .3, pan: .15 }); noise(s + .07, .05, { f: 900, q: 1, vol: .06, rev: .2 }); } },
    // a card laid on the table: paper slap and a soft thud on the cloth
    place(o = {}) { const t = now(), v = o.soft ? .45 : 1; noise(t, .16, { f: 1400, to: 500, q: .8, vol: .16 * v, att: .003, rev: .4, pan: o.pan }); tone(jit(110), t, .14, { to: 70, vol: .14 * v, rev: .3 }); },
    // Galleons: bright inharmonic clinks
    coins(n = 3, o = {}) { const t = now(), k = Math.min(Math.max(n, 1), 8); for (let i = 0; i < k; i++) { const s = t + (o.delay || 0) + i * .075 + Math.random() * .03, f = jit(2350, .08);
      tone(f, s, .22, { vol: .06, att: .001, pan: o.pan, rev: .8 }); tone(f * 2.76, s, .12, { vol: .035, att: .001, pan: o.pan, rev: .8 }); tone(f * 5.4, s, .06, { vol: .02, att: .001, pan: o.pan, rev: .8 }); noise(s, .03, { f: 7000, q: 3, vol: .05, rev: .3 }); } },
    // a set completed: a rising peal of bells
    set() { const t = now(); [587.3, 740, 880, 1174.7].forEach((f, i) => bell(f, t + i * .11, { vol: .1, dur: 1.8, pan: (i - 1.5) * .2 })); sparkle(t + .4, 8, { vol: .04 }); },
    // your turn: two soft chimes, like the castle bell
    turn() { const t = now(); bell(880, t, { vol: .11, dur: 2 }); bell(1318.5, t + .18, { vol: .09, dur: 2.2 }); tone(220, t, 1.2, { vol: .05, att: .08, rev: 1.4 }); },
    // someone else's turn begins: a quiet single note
    turnOther() { const t = now(); bell(659.3, t, { vol: .04, dur: 1.1 }); },
    // the sorting reveal
    reveal() { const t = now(); for (let i = 0; i < 14; i++) tone(PENTA[i % PENTA.length] * (i >= PENTA.length ? 2 : 1), t + i * .06, .9, { vol: .045, type: "triangle", pan: Math.sin(i) * .5, rev: 1.8 }); bell(293.7, t + .9, { vol: .12, dur: 3 }); bell(440, t + .9, { vol: .08, dur: 3 }); tone(146.8, t + .8, 2.6, { vol: .08, att: .3, rev: 1.6 }); },
    // a spell: a whoosh from the wand, its own colour, and, if it lands, a hit
    spell(k, o = {}) {
      const t = now();
      noise(t, .55, { f: 400, to: 5200, q: 2.2, vol: .14, att: .12, rev: 1, pan: -.3 });
      const hit = t + .55, many = o.targets > 1;
      switch (k) {
        case "stupefy": tone(1400, hit, .35, { to: 180, type: "sawtooth", vol: .07, rev: .8 }); noise(hit, .3, { f: 3000, to: 300, q: .9, vol: .2, rev: 1 }); break;
        case "petrificus": for (let i = 0; i < 10; i++) tone(jit(3200, .3), hit + i * .03, .18, { vol: .04, type: "square", rev: 1.4, pan: Math.random() - .5 }); tone(196, hit, .9, { vol: .08, rev: 1.2 }); break;
        case "protego": [196, 294, 392].forEach(f => tone(f, t + .2, 1.4, { vol: .07, att: .25, vib: 5, vibAmt: .01, rev: 1.6, type: "triangle" })); bell(784, hit, { vol: .1, dur: 1.4 }); break;
        case "obliviate": tone(1760, t + .3, 1.1, { to: 220, glide: 1, vol: .06, type: "triangle", vib: 7, vibAmt: .03, rev: 1.8 }); sparkle(hit, 6, { vol: .03 }); break;
        case "levicorpus": case "wingardium": tone(294, t + .2, .9, { to: 1175, vol: .07, type: "triangle", rev: 1.6 }); sparkle(hit, 8, { vol: .04 }); break;
        case "accio2": case "accioAny": tone(1175, t + .25, .6, { to: 440, vol: .07, type: "triangle", rev: 1.3 }); noise(hit, .25, { f: 4000, to: 900, vol: .1, rev: .8 }); break;
        case "confundo": [440, 466, 523].forEach((f, i) => tone(f, t + .3 + i * .05, .8, { vol: .05, vib: 9 + i * 3, vibAmt: .06, type: "triangle", rev: 1.4 })); break;
        case "alohomora": noise(hit, .04, { f: 2200, q: 4, vol: .18, rev: .5 }); noise(hit + .08, .05, { f: 1600, q: 4, vol: .14, rev: .5 }); bell(1174.7, hit + .12, { vol: .09 }); break;
        case "geminio": bell(987.8, hit, { vol: .08, pan: -.4 }); bell(987.8 * 1.5, hit + .09, { vol: .07, pan: .4 }); break;
        case "reparo": [587.3, 740, 880, 1174.7].forEach((f, i) => tone(f, t + .25 + i * .07, .5, { vol: .05, type: "triangle", rev: 1.4 })); break;
        default: sparkle(hit, 8, { vol: .045 });
      }
      if (o.targets && k !== "protego") noise(hit + .05, .22, { filter: "lowpass", f: 900, q: .7, vol: many ? .2 : .16, rev: .7, pan: .3 });
    },
    // the game is won: a fanfare of bells (bigger for the winner)
    win(mine) { const t = now(), v = mine ? 1 : .6, ch = [293.7, 370, 440, 587.3];
      ch.forEach((f, i) => bell(f * 2, t + i * .14, { vol: .1 * v, dur: 2.4 }));
      ch.forEach(f => tone(f, t + .6, 2.6, { vol: .045 * v, att: .15, type: "triangle", rev: 1.6 }));
      if (mine) { sparkle(t + .7, 16, { vol: .045, gap: .07 }); [1174.7, 1480, 1760].forEach((f, i) => bell(f, t + 1.2 + i * .12, { vol: .07, dur: 2 })); } },
    // a player sits down in the lobby: a soft owl-post hoot
    join() { const t = now(); tone(392, t, .32, { to: 350, vol: .07, att: .04, rev: 1.2 }); tone(392, t + .38, .45, { to: 330, vol: .06, att: .04, rev: 1.2 }); },
    // last seconds on your clock
    tick(urgent) { const t = now(); noise(t, .035, { f: urgent ? 3600 : 2600, q: 5, vol: urgent ? .12 : .08, rev: .3 }); tone(urgent ? 1046 : 784, t, .05, { vol: .03, type: "square", rev: .2 }); },
    // something you can't do
    error() { const t = now(); tone(196, t, .18, { vol: .07, type: "triangle", rev: .4 }); tone(164.8, t + .12, .22, { vol: .07, type: "triangle", rev: .4 }); }
  };

  window.Sfx = new Proxy(S, { get(target, k) {
    if (k === "enabled") return on;
    if (k === "toggle") return () => { on = !on; try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {} if (on) { unlock(); setTimeout(() => window.Sfx.tap(), 60); } else if (ctx) ctx.suspend(); return on; };
    const fn = target[k]; if (typeof fn !== "function") return fn;
    return (...a) => { if (!ready()) return; try { fn(...a); } catch (e) {} };
  } });
})();
