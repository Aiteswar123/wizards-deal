// Sound effects and background music for Wizard's Deal, synthesised live with the Web Audio API (no sound files,
// nothing to license). The music is generated as it plays: an original slow waltz in E minor on celesta, harp, soft
// strings and a low bass, never the same twice, quieter and sparser during a game. Music and sound effects each have
// their own switch, remembered per device ("wd-music", "wd-sound").
// Every sound runs through a soft hall reverb and a limiter. Sound is on by default and remembered per device
// ("wd-sound"); browsers only allow audio after the first tap or key press, so the context starts then.
(function () {
  "use strict";
  let ctx = null, out = null, wet = null, noiseBuf = null, mGain = null, mBus = null;
  const KEY = "wd-sound", MKEY = "wd-music";
  const read = k => { try { const v = localStorage.getItem(k); return v == null ? true : v === "1"; } catch (e) { return true; } };
  const save = (k, v) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch (e) {} };
  let on = read(KEY), musicOn = read(MKEY);

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
    // the music has its own bus and its own reverb, so muting or ducking it takes the echoes too
    mGain = ctx.createGain(); mGain.gain.value = 0; mGain.connect(master);
    const mConv = ctx.createConvolver(); mConv.buffer = ir; const mWet = ctx.createGain(); mWet.gain.value = .45; mWet.connect(mConv); mConv.connect(mGain);
    mBus = { dry: mGain, wet: mWet };
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return ctx;
  }
  const unlock = () => { if (!on && !musicOn) return; init(); if (ctx && ctx.state === "suspended") ctx.resume(); if (musicOn) startMusic(); loadClips(); };
  addEventListener("pointerdown", unlock, { capture: true, passive: true });
  addEventListener("keydown", unlock, { capture: true });

  const ready = () => on && !document.hidden && ctx && ctx.state === "running";
  // route a node to the dry bus and, a little, to the hall
  function send(node, rev = 1, bus) { node.connect(bus ? bus.dry : out); if (rev > 0) { const g = ctx.createGain(); g.gain.value = rev; node.connect(g); g.connect(bus ? bus.wet : wet); } }

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
    send(last, o.rev ?? 1, o.bus);
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
    send(last, o.rev ?? .6, o.bus);
    src.start(t, Math.random() * .5); src.stop(t + dur + .05);
  }
  const now = () => ctx.currentTime + .01;
  const jit = (x, k = .04) => x * (1 + (Math.random() * 2 - 1) * k);
  // D major pentatonic, for anything that sparkles
  const PENTA = [587.3, 659.3, 740, 880, 987.8, 1174.7, 1318.5, 1480, 1760, 1975.5, 2349.3];
  function sparkle(t, n, o = {}) {
    for (let i = 0; i < n; i++) { const f = PENTA[Math.floor(Math.random() * PENTA.length)] * (o.oct || 1); tone(f, t + i * (o.gap || .045) + Math.random() * .02, .35, { vol: (o.vol || .05) * (1 - i / (n * 1.6)), pan: Math.random() * 1.2 - .6, rev: 1.6, type: "triangle" }); }
  }

  // ---------- spoken spells ----------
  // Each spell is called aloud from a recorded clip in assets/voice: a male and a female British voice, generated with
  // Piper (open-source neural speech) and phonetically steered to the film pronunciations. The caster sets the voice and
  // how it's played: a slower, lower take for Hagrid, a quicker, higher one for Peeves. Each call is shaped like a
  // shout in a stone hall: warmed, compressed, doubled with a short slapback and sent to the reverb. If a clip hasn't
  // loaded yet, the browser's own speech voice stands in.
  const CLIP = { accio2: "accio", accioAny: "accio" };
  const SAY = { stupefy: "Stupefy!", petrificus: "Petrificus Totalus!", protego: "Protego!", obliviate: "Obliviate!", levicorpus: "Levicorpus!",
    wingardium: "Wingardium Leviosa!", accio: "Accio!", confundo: "Confundo!", alohomora: "Alohomora!", geminio: "Geminio!", reparo: "Reparo!" };
  const KIND = { protego: "charm", wingardium: "charm", accio2: "charm", accioAny: "charm", alohomora: "charm", geminio: "charm", reparo: "charm" };
  // voice per caster: [female?, playback rate]; rate moves pitch and pace together, so keep it close to 1
  const CAST = { harry: [0, 1], ron: [0, 1.04], lupin: [0, .94], hagrid: [0, .84], draco: [0, 1.02], cedric: [0, .98], peeves: [0, 1.16],
    hermione: [1, 1], luna: [1, .96], cho: [1, 1.03], myrtle: [1, 1.13], umbridge: [1, 1.09] };
  const clips = {};
  let clipsAsked = false;
  function loadClips() {
    if (clipsAsked || !ctx) return; clipsAsked = true;
    for (const g of ["m", "f"]) for (const k in SAY) {
      const id = g + "-" + k;
      fetch("assets/voice/" + id + ".wav").then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(ab => ctx.decodeAudioData(ab)).then(buf => { clips[id] = buf; }).catch(() => {});
    }
  }
  let shout = null;
  function shoutChain() {
    if (shout) return shout;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 110;
    const pres = ctx.createBiquadFilter(); pres.type = "peaking"; pres.frequency.value = 2800; pres.gain.value = 4; pres.Q.value = .9;
    const warm = ctx.createWaveShaper(), curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(1.6 * x) / Math.tanh(1.6); } warm.curve = curve;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -22; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .12;
    const g = ctx.createGain(); g.gain.value = .95;
    hp.connect(pres); pres.connect(warm); warm.connect(comp); comp.connect(g); send(g, .55);
    // slapback off the far wall
    const d = ctx.createDelay(.3); d.delayTime.value = .095; const dg = ctx.createGain(); dg.gain.value = .16; const dl = ctx.createBiquadFilter(); dl.type = "lowpass"; dl.frequency.value = 2400;
    g.connect(d); d.connect(dl); dl.connect(dg); send(dg, .8);
    return (shout = hp);
  }
  function say(k, ch, t) {
    const [fem, rate] = CAST[ch] || CAST.harry, name = CLIP[k] || k, buf = clips[(fem ? "f-" : "m-") + name];
    if (buf) {
      const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate * (1 + (Math.random() - .5) * .03);
      src.connect(shoutChain()); src.start(t); return;
    }
    if (!window.speechSynthesis || !SAY[name]) return;
    const u = new SpeechSynthesisUtterance(SAY[name]); u.lang = "en-GB"; u.pitch = fem ? 1 : .8; u.rate = .85;
    try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
  }
  function stab(f, t) {
    [-7, 7].forEach(dt => { const osc = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      osc.type = "sawtooth"; osc.frequency.value = f; osc.detune.value = dt;
      lp.type = "lowpass"; lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(500, t + .9);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.028, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 1.1);
      osc.connect(lp); lp.connect(g); send(g, 1.1); osc.start(t); osc.stop(t + 1.2); });
  }
  const mtof0 = n => 440 * Math.pow(2, (n - 69) / 12);

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
      say(k, o.ch, t);
      // the build: a reversed-cymbal swell and a low drone rising into the hit
      noise(t, .62, { filter: "highpass", f: 2500, to: 6000, q: .5, vol: .1, att: .55, rev: 1.2 });
      tone(55, t, .7, { to: 110, vol: .06, att: .5, type: "sawtooth", rev: .6 });
      noise(t, .55, { f: 400, to: 5200, q: 2.2, vol: .14, att: .12, rev: 1, pan: -.3 });
      const hit = t + .55, many = o.targets > 1;
      // the hit: a deep boom and a brass-like stab (minor for curses, major for helpful charms)
      tone(95, hit, 1.4, { to: 32, vol: .3, att: .004, rev: .9 });
      noise(hit, .9, { filter: "lowpass", f: 500, to: 80, q: .5, vol: .28, att: .003, rev: 1.2 });
      const kind = KIND[k] || "curse";
      (kind === "charm" ? [50, 57, 62, 66, 69] : [40, 47, 52, 55, 59]).forEach((n, i) => stab(mtof0(n + (kind === "charm" ? 0 : 12)), hit + i * .008));
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

  // ---------- background music ----------
  // An original generative waltz (3/4, 66 bpm) in E harmonic minor. Each bar has a chord; strings hold it, a bass
  // note marks the downbeat, and a celesta improvises a line over it, stepping through the scale and landing on
  // chord tones on the strong beats. A harp glissando opens each 8-bar phrase.
  const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
  const PROG = [[52, 55, 59, 64], [48, 52, 55, 60], [45, 48, 52, 57], [47, 51, 54, 57], [52, 55, 59, 64], [43, 47, 50, 55], [45, 48, 52, 60], [47, 51, 54, 57]];
  const SCALE = [71, 72, 75, 76, 78, 79, 81, 83, 84, 87, 88];   // B C D# E F# G A B C D# E
  const EIGHTH = 60 / 66 / 2;
  let mTimer = null, nextT = 0, step = 0, mNote = 76;
  function feel() {
    const sc = document.documentElement.dataset.screen;
    return sc === "game" ? { dens: .5, vol: .75 } : sc === "lobby" ? { dens: .65, vol: 1 } : { dens: .72, vol: 1.05 };
  }
  function celesta(n, t, v) { const f = mtof(n), b = mBus, pan = (n - 79) / 14;
    tone(f, t, 2.2, { vol: .05 * v, att: .003, pan, rev: 1, bus: b }); tone(f * 2, t, .9, { vol: .014 * v, att: .002, pan, rev: 1, bus: b }); tone(f * 4.01, t, .22, { vol: .008 * v, att: .001, pan, rev: 1, bus: b }); }
  function strings(ch, t, len) { ch.forEach((n, i) => [-4, 4].forEach(dt => {
    const osc = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    osc.type = "sawtooth"; osc.frequency.value = mtof(n); osc.detune.value = dt;
    lp.type = "lowpass"; lp.frequency.value = 700; lp.Q.value = .3;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.0075, t + 1.1); g.gain.setValueAtTime(.0075, t + len - .2); g.gain.linearRampToValueAtTime(0, t + len + 1.2);
    osc.connect(lp); lp.connect(g); send(g, .9, mBus); osc.start(t); osc.stop(t + len + 1.3); })); }
  // At sea (UNO screens) the music turns into an original jig-like shanty in D dorian, 6/8: a bowed fiddle line over
  // squeezebox chords on the off-beats and a plucked bass on the two strong beats.
  const SEA_PROG = [[50, 53, 57, 62], [48, 52, 55, 60], [50, 53, 57, 62], [45, 48, 52, 57], [50, 53, 57, 62], [41, 45, 48, 53], [48, 52, 55, 60], [50, 53, 57, 62]];
  const SEA_SCALE = [69, 71, 72, 74, 76, 77, 79, 81, 83, 84, 86];
  const SEA_EIGHTH = .21;
  const atSea = () => document.documentElement.dataset.game === "uno";
  function fiddle(n, t, len, v) { const f = mtof(n), pan = (n - 77) / 16;
    [-6, 6].forEach(dt => { const osc = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(), l = ctx.createOscillator(), lg = ctx.createGain();
      osc.type = "sawtooth"; osc.frequency.value = f; osc.detune.value = dt; l.frequency.value = 5.5; lg.gain.value = f * .006; l.connect(lg); lg.connect(osc.frequency);
      lp.type = "lowpass"; lp.frequency.value = 2400; lp.Q.value = .7;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022 * v, t + .03); g.gain.setValueAtTime(.022 * v, t + len * .7); g.gain.exponentialRampToValueAtTime(.0001, t + len + .12);
      const pn = ctx.createStereoPanner ? ctx.createStereoPanner() : null; osc.connect(lp); lp.connect(g); let last = g; if (pn) { pn.pan.value = pan; g.connect(pn); last = pn; }
      send(last, .7, mBus); osc.start(t); l.start(t); osc.stop(t + len + .2); l.stop(t + len + .2); }); }
  function squeeze(ch, t, len) { ch.slice(1).forEach(n => { const osc = ctx.createOscillator(), g = ctx.createGain(), bp = ctx.createBiquadFilter();
      osc.type = "square"; osc.frequency.value = mtof(n + 12); bp.type = "bandpass"; bp.frequency.value = 1100; bp.Q.value = .8;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + len);
      osc.connect(bp); bp.connect(g); send(g, .5, mBus); osc.start(t); osc.stop(t + len + .05); }); }
  function seaStep(t) {
    const bar = Math.floor(step / 6), pos = step % 6, ch = SEA_PROG[bar % SEA_PROG.length], F = feel();
    if (pos === 0 || pos === 3) tone(mtof((pos === 0 ? ch[0] : ch[2]) - 12), t, .32, { vol: .09, att: .004, rev: .4, bus: mBus, type: "triangle" });
    if (pos === 1 || pos === 2 || pos === 4 || pos === 5) squeeze(ch, t, .15);
    if (bar % 8 === 0 && pos === 0) noise(t, .5, { f: 900, to: 300, q: .6, vol: .05, rev: 1, bus: mBus });   // a wave breaks at each new verse
    const strong = pos === 0 || pos === 3;
    if (Math.random() < (strong ? .92 : F.dens + .1)) {
      if (SEA_SCALE.indexOf(mNote) < 0) mNote = 74;
      let idx = SEA_SCALE.indexOf(mNote);
      if (strong) {
        const tones = SEA_SCALE.filter(n => ch.some(c => (n - c) % 12 === 0) && Math.abs(n - mNote) <= 7 && n !== mNote);
        const pool = tones.length ? tones : SEA_SCALE.filter(n => ch.some(c => (n - c) % 12 === 0));
        mNote = pool[Math.floor(Math.random() * pool.length)];
      } else {
        idx = Math.max(0, Math.min(SEA_SCALE.length - 1, idx + [-1, -1, 1, 1, 2, -2][Math.floor(Math.random() * 6)]));
        mNote = SEA_SCALE[idx];
      }
      fiddle(mNote, t, SEA_EIGHTH * (strong ? 1.6 : .9), strong ? 1 : .75);
    }
    step++;
  }
  function scheduleStep(t) {
    if (atSea()) return seaStep(t);
    const bar = Math.floor(step / 6), pos = step % 6, ch = PROG[bar % PROG.length], F = feel();
    if (pos === 0) {
      strings(ch, t, EIGHTH * 6);
      tone(mtof(ch[0] - 12), t, EIGHTH * 5, { vol: .07, att: .02, rev: .6, bus: mBus });
      if (bar % 8 === 0) for (let i = 0; i < 9; i++) { const n = ch[i % 4] + 12 * (1 + Math.floor(i / 4)); tone(mtof(n), t + i * .055, 1.4, { vol: .028, type: "triangle", pan: -.5 + i * .12, rev: 1.3, bus: mBus }); }
    }
    if (pos === 2 || pos === 4) tone(mtof(ch[1]), t, EIGHTH * 1.6, { vol: .025, type: "triangle", att: .01, rev: .7, bus: mBus });   // the waltz "pah"
    const strong = pos === 0 || pos === 2 || pos === 4;
    if (Math.random() < (strong ? F.dens + .2 : F.dens * .6)) {
      let idx = SCALE.indexOf(mNote); if (idx < 0) idx = 3;
      if (strong) {   // land on a chord tone within a fifth, leaning towards the middle of the range
        const tones = SCALE.filter(n => ch.some(c => (n - c) % 12 === 0) && Math.abs(n - mNote) <= 7 && n !== mNote);
        const pool = tones.length ? tones : SCALE.filter(n => ch.some(c => (n - c) % 12 === 0));
        const w = pool.map(n => 1 / (1 + Math.abs(n - 79) / 6)), sum = w.reduce((a, b) => a + b, 0);
        let x = Math.random() * sum; mNote = pool.find((n, i) => (x -= w[i]) <= 0) ?? pool[0];
      } else {
        idx = Math.max(0, Math.min(SCALE.length - 1, idx + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]));
        mNote = SCALE[idx];
      }
      celesta(mNote, t + (Math.random() - .5) * .015, strong ? 1 : .7);
    }
    step++;
  }
  function pump() {
    if (!ctx || document.hidden) return;
    if (nextT < ctx.currentTime) nextT = ctx.currentTime + .1;
    while (nextT < ctx.currentTime + .5) { scheduleStep(nextT); nextT += atSea() ? SEA_EIGHTH : EIGHTH; }
    const want = feel().vol; if (mGain && Math.abs(mGain.gain.value - want) > .01 && !duckUntil) mGain.gain.setTargetAtTime(want, ctx.currentTime, 1.5);
    if (duckUntil && ctx.currentTime > duckUntil) duckUntil = 0;
  }
  let duckUntil = 0;
  // held: another player (the ship's radio) is playing, so the generated music waits
  let held = false;
  function startMusic() {
    if (!ctx || mTimer || held) return;
    step = 0; nextT = ctx.currentTime + .15;
    mGain.gain.cancelScheduledValues(ctx.currentTime); mGain.gain.setValueAtTime(mGain.gain.value, ctx.currentTime); mGain.gain.linearRampToValueAtTime(feel().vol, ctx.currentTime + 3);
    mTimer = setInterval(pump, 120); pump();
  }
  function stopMusic() {
    if (!mTimer) return; clearInterval(mTimer); mTimer = null;
    if (ctx) { mGain.gain.cancelScheduledValues(ctx.currentTime); mGain.gain.setTargetAtTime(0, ctx.currentTime, .3); }
  }
  // dip the music under a big moment so the effect reads clearly
  function duck(len = 2) { if (!mTimer || !ctx) return; const t = ctx.currentTime, v = feel().vol; duckUntil = t + len + 1;
    mGain.gain.cancelScheduledValues(t); mGain.gain.setValueAtTime(mGain.gain.value, t); mGain.gain.linearRampToValueAtTime(v * .3, t + .15); mGain.gain.setValueAtTime(v * .3, t + len); mGain.gain.linearRampToValueAtTime(v, t + len + 1); }
  ["spell", "win", "reveal", "set"].forEach(k => { const f = S[k]; S[k] = (...a) => { duck(k === "win" ? 4 : k === "reveal" ? 3 : k === "spell" ? 2.4 : 1.6); return f(...a); }; });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && ctx) nextT = ctx.currentTime + .1; });

  window.Sfx = new Proxy(S, { get(target, k) {
    if (k === "enabled") return on;
    if (k === "musicEnabled") return musicOn;
    if (k === "hold") return h => { held = !!h; if (held) stopMusic(); else if (musicOn) startMusic(); };
    if (k === "toggle") return () => { on = !on; save(KEY, on); if (on) { unlock(); setTimeout(() => window.Sfx.tap(), 60); } return on; };
    if (k === "toggleMusic") return () => { musicOn = !musicOn; save(MKEY, musicOn); if (musicOn) unlock(); else stopMusic(); return musicOn; };
    const fn = target[k]; if (typeof fn !== "function") return fn;
    return (...a) => { if (!ready()) return; try { fn(...a); } catch (e) {} };
  } });
})();
