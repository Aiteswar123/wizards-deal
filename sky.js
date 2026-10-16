/* The world behind every screen, drawn for realism rather than cartoon: Hogwarts across the Black Lake on the home
   page, the Great Hall in the lobby, and your house's common room in a game, all under one night sky.
   A deep starfield with the Milky Way and a cratered moon, soft moonlit cloud, the four house banners hanging from
   the ceiling, floating candles, owls carrying letters across the night, and the Golden Snitch.
   Static layers (sky, stars, Milky Way, moon, stadium) are painted once per size or house change; only the moving parts
   are drawn each frame. Runs at about 30fps, stops while the tab is hidden, and holds one still frame for reduced motion. */
(function () {
  "use strict";
  const cv = document.createElement("canvas");
  cv.id = "sky"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const still = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  const root = document.documentElement;
  const BANNERS = ["#7d1018", "#b8891f", "#1d3a86", "#1a5636"];   // Gryffindor, Hufflepuff, Ravenclaw, Slytherin, muted as cloth in floodlight
  const rnd = Math.random, TAU = Math.PI * 2;
  let W = 0, H = 0, dpr = 1, bg = null, stad = null, bright = [], clouds = [], cloudSprites = [], flyers = [], lamps = [], snitch = null;
  let col = { stand: "#17132b", board: "#0b0916", crest: "#d8b25a" }, colKey = "", lastCol = 0, last = 0, raf = 0, shoot = null, nextShoot = 8000;

  const layer = () => { const c = document.createElement("canvas"); c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, g]; };
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2;

  function readColours(now, force) {
    if (!force && now - lastCol < 200) return;
    lastCol = now;
    const cs = getComputedStyle(root);
    col.stand = cs.getPropertyValue("--stand").trim() || col.stand;
    col.board = cs.getPropertyValue("--board").trim() || col.board;
    col.crest = cs.getPropertyValue("--crest").trim() || col.crest;
    const key = col.stand + col.board + col.crest;
    if (key !== colKey) { colKey = key; paintSky(); }
  }

  // Sky: night gradient tinted by the house, the Milky Way, a deep field of faint stars, and the moon.
  function paintSky() {
    const [c, g] = layer();
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#030308"); grad.addColorStop(.45, col.board); grad.addColorStop(1, col.stand);
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    // the Milky Way: a diagonal band of soft glow and dust
    const x0 = -W * .1, y0 = H * .78, x1 = W * 1.1, y1 = H * .02, len = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / len, ny = (x1 - x0) / len, band = Math.min(W, H) * .16;
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 140; i++) {
      const t = rnd(), o = gauss() * band, x = x0 + (x1 - x0) * t + nx * o, y = y0 + (y1 - y0) * t + ny * o, r = band * (.25 + rnd() * .5);
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, `rgba(${rnd() < .5 ? "190,200,255" : "255,226,200"},${.018 + rnd() * .02})`); rg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    const dust = Math.min(5000, Math.round(W * H / 220));
    for (let i = 0; i < dust; i++) {
      const t = rnd(), o = gauss() * band * .9, x = x0 + (x1 - x0) * t + nx * o, y = y0 + (y1 - y0) * t + ny * o;
      g.fillStyle = `rgba(235,238,255,${.08 + rnd() * .3})`; g.fillRect(x, y, .7, .7);
    }
    g.globalCompositeOperation = "source-over";
    // a dark dust lane through the band
    for (let i = 0; i < 40; i++) {
      const t = rnd(), o = gauss() * band * .25, x = x0 + (x1 - x0) * t + nx * o, y = y0 + (y1 - y0) * t + ny * o, r = band * (.12 + rnd() * .2);
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, "rgba(2,2,6,.22)"); rg.addColorStop(1, "rgba(2,2,6,0)");
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    // the deep field: many faint stars, a power-law of brightness, a range of colour temperatures
    const n = Math.min(2200, Math.round(W * H / 700));
    for (let i = 0; i < n; i++) {
      const b = Math.pow(rnd(), 3), x = rnd() * W, y = rnd() * H * .85, tint = rnd();
      g.fillStyle = tint < .15 ? `rgba(255,214,170,${.15 + b * .7})` : tint < .35 ? `rgba(190,210,255,${.15 + b * .7})` : `rgba(255,255,250,${.12 + b * .7})`;
      const s = .5 + b * 1.1; g.fillRect(x, y, s, s);
    }
    // the moon: limb darkening, maria and craters, and a wide halo
    const mx = W * (W < 600 ? .78 : .66), my = H * .12, mr = Math.max(18, Math.min(W, H) * .045);
    const halo = g.createRadialGradient(mx, my, mr * .8, mx, my, mr * 7);
    halo.addColorStop(0, "rgba(220,226,255,.16)"); halo.addColorStop(1, "rgba(220,226,255,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(mx, my, mr * 7, 0, TAU); g.fill();
    const disc = g.createRadialGradient(mx - mr * .3, my - mr * .3, mr * .1, mx, my, mr);
    disc.addColorStop(0, "#f6f2e7"); disc.addColorStop(.7, "#e2dccb"); disc.addColorStop(1, "#b9b19c");
    g.fillStyle = disc; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.clip();
    [[-.3, -.15, .42, .18], [.2, .25, .34, .14], [.35, -.3, .22, .12], [-.1, .4, .2, .1]].forEach(([dx, dy, r, a]) => {
      const m = g.createRadialGradient(mx + dx * mr, my + dy * mr, 0, mx + dx * mr, my + dy * mr, r * mr);
      m.addColorStop(0, `rgba(120,112,100,${a})`); m.addColorStop(1, "rgba(120,112,100,0)");
      g.fillStyle = m; g.beginPath(); g.arc(mx + dx * mr, my + dy * mr, r * mr, 0, TAU); g.fill();
    });
    // craters: soft shaded hollows, darker on the side away from the light with a faint lit rim opposite
    for (let i = 0; i < 18; i++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * mr * .85, r = mr * (.025 + rnd() * .06), cx = mx + Math.cos(a) * d, cy = my + Math.sin(a) * d;
      const sh = g.createRadialGradient(cx + r * .25, cy + r * .25, 0, cx, cy, r);
      sh.addColorStop(0, "rgba(110,102,90,.22)"); sh.addColorStop(1, "rgba(110,102,90,0)");
      g.fillStyle = sh; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
      const lit = g.createRadialGradient(cx - r * .45, cy - r * .45, 0, cx - r * .45, cy - r * .45, r * .6);
      lit.addColorStop(0, "rgba(255,252,240,.12)"); lit.addColorStop(1, "rgba(255,252,240,0)");
      g.fillStyle = lit; g.beginPath(); g.arc(cx - r * .45, cy - r * .45, r * .6, 0, TAU); g.fill();
    }
    g.restore();
    bg = c;
  }

  // Cloud: many soft lobes, lit from above by the moon and shadowed underneath.
  function makeCloud() {
    const c = document.createElement("canvas"); c.width = 420; c.height = 170;
    const g = c.getContext("2d");
    for (let i = 0; i < 46; i++) {
      const x = 50 + rnd() * 320, y = 70 + gauss() * 26, r = 18 + rnd() * 46, lit = y < 80;
      const rg = g.createRadialGradient(x, y - r * .3, 0, x, y, r);
      rg.addColorStop(0, lit ? "rgba(214,220,238,.16)" : "rgba(120,126,150,.14)"); rg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    return c;
  }

  // The Great Hall: four house banners hang from the enchanted ceiling, with a faint stone gloom rising from below.
  function paintStadium() {
    const [c, g] = layer();
    const gloom = g.createLinearGradient(0, H * .62, 0, H);
    gloom.addColorStop(0, "rgba(6,6,10,0)"); gloom.addColorStop(1, "rgba(6,6,10,.7)");
    g.fillStyle = gloom; g.fillRect(0, H * .62, W, H * .38);
    // banners frame the hall at its edges, clear of the page's content column
    const small = W < 600, bw = Math.max(small ? 22 : 38, W * (small ? .05 : .04)), bh = Math.min(H * (small ? .16 : .26), small ? 150 : 260);
    (small ? [[.04, 0], [.96, 2]] : [[.025, 0], [.075, 3], [.925, 2], [.975, 1]]).forEach(([fx, hi]) => {
      const x = W * fx - bw / 2, col = BANNERS[hi];
      // the rod
      g.fillStyle = "#6e5a34"; g.fillRect(x - 6, 2, bw + 12, 4);
      // the cloth, shaded into soft folds, with a notched hem
      g.fillStyle = col; g.globalAlpha = .62;
      g.beginPath(); g.moveTo(x, 6); g.lineTo(x + bw, 6); g.lineTo(x + bw, bh); g.lineTo(x + bw / 2, bh - bw * .32); g.lineTo(x, bh); g.closePath(); g.fill();
      const fold = g.createLinearGradient(x, 0, x + bw, 0);
      fold.addColorStop(0, "rgba(0,0,0,.5)"); fold.addColorStop(.3, "rgba(0,0,0,.05)"); fold.addColorStop(.55, "rgba(255,255,255,.07)"); fold.addColorStop(.75, "rgba(0,0,0,.18)"); fold.addColorStop(1, "rgba(0,0,0,.55)");
      g.globalAlpha = 1; g.fillStyle = fold; g.fill();
      // a woven gold border and a simple diamond emblem
      g.strokeStyle = "rgba(214,180,100,.55)"; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x + 4, 10); g.lineTo(x + bw - 4, 10); g.lineTo(x + bw - 4, bh - 6); g.lineTo(x + bw / 2, bh - bw * .32 - 4); g.lineTo(x + 4, bh - 6); g.closePath(); g.stroke();
      const ey = bh * .42;
      g.fillStyle = "rgba(214,180,100,.5)"; g.beginPath(); g.moveTo(x + bw / 2, ey - bw * .28); g.lineTo(x + bw * .78, ey); g.lineTo(x + bw / 2, ey + bw * .28); g.lineTo(x + bw * .22, ey); g.closePath(); g.fill();
    });
    lamps = [];
    stad = c;
  }

  // ---- each house's common room, layered over the ceiling once you're sorted ----
  // Gryffindor tower: firelight and rising embers. Slytherin dungeon under the lake: rippling green water-light and
  // bubbles. Ravenclaw tower's star-painted dome: constellations drawing themselves. Hufflepuff's earthy cellar:
  // golden light shafts and drifting seeds. It fades in and out with the house, so the sorting crossfades.
  let embers = [], bubbles = [], seeds = [], consts = [], atmos = { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 0 };
  function seedAtmos() {
    const n = W < 600 ? .5 : 1;
    embers = Array.from({ length: Math.round(70 * n) }, () => ({ x: rnd() * W, y: H + rnd() * H, v: 20 + rnd() * 50, r: .8 + rnd() * 1.8, p: rnd() * TAU, life: rnd() }));
    bubbles = Array.from({ length: Math.round(40 * n) }, () => ({ x: rnd() * W, y: H + rnd() * H, v: 14 + rnd() * 30, r: 1.5 + rnd() * 4, p: rnd() * TAU }));
    seeds = Array.from({ length: Math.round(45 * n) }, () => ({ x: rnd() * W, y: rnd() * H, vx: 6 + rnd() * 14, vy: -3 + rnd() * 6, r: 1 + rnd() * 1.6, p: rnd() * TAU }));
    // a handful of constellations: a chain of stars in a small region, revealed segment by segment
    consts = Array.from({ length: W < 600 ? 3 : 6 }, (_, i) => { const cx = W * (.1 + .8 * rnd()), cy = H * (.08 + .55 * rnd()), k = 4 + Math.floor(rnd() * 3);
      let x = cx, y = cy; return { pts: Array.from({ length: k }, () => { x += (rnd() - .4) * 70; y += (rnd() - .5) * 50; return [x, y]; }), off: i * 2.3 }; });
  }
  function drawAtmos(t, dt) {
    const want = root.dataset.screen === "game" ? root.dataset.house : "";
    for (const k in atmos) atmos[k] += ((k === want ? 1 : 0) - atmos[k]) * (dt ? Math.min(1, dt / 900) : 1);
    const sec = dt / 1000;
    if (atmos.gryffindor > .01) {
      const a = atmos.gryffindor, fl = .85 + .15 * Math.sin(t * .004) * Math.sin(t * .0023);
      const g = ctx.createRadialGradient(W / 2, H * 1.15, 0, W / 2, H * 1.15, Math.max(W, H) * .9);
      g.addColorStop(0, `rgba(255,120,40,${.38 * a * fl})`); g.addColorStop(.45, `rgba(200,40,30,${.16 * a})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const e of embers) {
        e.y -= e.v * sec; e.x += Math.sin(t * .0015 + e.p) * 12 * sec; e.life -= sec * .12;
        if (e.y < -10 || e.life <= 0) { e.y = H + 10; e.x = rnd() * W; e.life = 1; }
        ctx.globalAlpha = a * Math.min(1, e.life * 1.4) * .9; ctx.fillStyle = e.life > .6 ? "#ffd27a" : "#ff7a2e";
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    if (atmos.slytherin > .01) {
      const a = atmos.slytherin;
      ctx.globalAlpha = .08 * a; ctx.fillStyle = "#0e5a3a"; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      // caustics: soft wavering bands of light, as through lake water
      for (let i = 0; i < 9; i++) {
        const y = H * (i / 9) + Math.sin(t * .0006 + i) * 30, amp = 18 + i * 3;
        ctx.globalAlpha = .07 * a; ctx.strokeStyle = "#7dffc2"; ctx.lineWidth = 10 + (i % 3) * 8;
        ctx.beginPath();
        for (let x = -20; x <= W + 20; x += 24) ctx.lineTo(x, y + Math.sin(x * .012 + t * .0011 + i * 1.7) * amp);
        ctx.stroke();
      }
      for (const b of bubbles) {
        b.y -= b.v * sec; b.x += Math.sin(t * .002 + b.p) * 10 * sec;
        if (b.y < -10) { b.y = H + 10; b.x = rnd() * W; }
        ctx.globalAlpha = .35 * a; ctx.strokeStyle = "#b8ffe0"; ctx.lineWidth = .8;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.stroke();
        ctx.globalAlpha = .5 * a; ctx.fillStyle = "#e8fff4"; ctx.beginPath(); ctx.arc(b.x - b.r * .35, b.y - b.r * .35, b.r * .25, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    if (atmos.ravenclaw > .01) {
      const a = atmos.ravenclaw;
      ctx.globalAlpha = .04 * a; ctx.fillStyle = "#1d3fa8"; ctx.fillRect(0, 0, W, H);
      for (const c of consts) {
        const cycle = ((t / 1000 + c.off) % 14) / 14, reveal = Math.min(1, cycle * 2.2), fade = cycle > .8 ? (1 - cycle) / .2 : 1, n = c.pts.length - 1;
        ctx.globalAlpha = .55 * a * fade; ctx.strokeStyle = "#cfa86a"; ctx.lineWidth = .9; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(c.pts[0][0], c.pts[0][1]);
        for (let i = 1; i <= n; i++) { const f = Math.max(0, Math.min(1, reveal * n - (i - 1))); if (!f) break;
          const [x0, y0] = c.pts[i - 1], [x1, y1] = c.pts[i]; ctx.lineTo(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f); }
        ctx.stroke(); ctx.setLineDash([]);
        c.pts.forEach(([x, y], i) => { ctx.globalAlpha = a * fade * (.6 + .4 * Math.sin(t * .003 + i)); ctx.fillStyle = "#fff4dc";
          ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill(); ctx.globalAlpha *= .3; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); });
      }
    }
    if (atmos.hufflepuff > .01) {
      const a = atmos.hufflepuff;
      ctx.globalAlpha = .04 * a; ctx.fillStyle = "#b8860b"; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 4; i++) {   // light shafts slanting down from round windows
        const x = W * (.15 + i * .25) + Math.sin(t * .0003 + i) * 20, sh = ctx.createLinearGradient(x, 0, x + W * .15, H);
        sh.addColorStop(0, `rgba(255,214,120,${.13 * a})`); sh.addColorStop(1, "rgba(255,214,120,0)");
        ctx.globalAlpha = 1; ctx.fillStyle = sh; ctx.beginPath(); ctx.moveTo(x - 30, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + W * .2, H); ctx.lineTo(x + W * .08, H); ctx.closePath(); ctx.fill();
      }
      for (const d of seeds) {
        d.x += d.vx * sec; d.y += (d.vy + Math.sin(t * .001 + d.p) * 6) * sec;
        if (d.x > W + 10) { d.x = -10; d.y = rnd() * H; }
        ctx.globalAlpha = .7 * a; ctx.fillStyle = "#fff0b8"; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
        ctx.globalAlpha = .25 * a; ctx.strokeStyle = "#fff0b8"; ctx.lineWidth = .6;
        for (let k = 0; k < 5; k++) { const ang = k * TAU / 5 + d.p; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + Math.cos(ang) * 4, d.y + Math.sin(ang) * 4); ctx.stroke(); }
      }
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.globalAlpha = 1;
  }

  // Floating candles of the Great Hall: they bob and flicker, and fade out during a game so nothing peeks between panels.
  let candles = [], candleAlpha = 1;
  function seedCandles() {
    const nc = W < 600 ? 6 : 14;
    candles = Array.from({ length: nc }, (_, i) => ({ x: (i + .5) / nc * W + (rnd() - .5) * W / nc * .6, y: 30 + rnd() * Math.min(H * .4, 320), s: .6 + rnd() * .5, p: rnd() * TAU }));
  }
  function candle(cd, t) {
    const s = cd.s, x = cd.x, y = cd.y + Math.sin(t * .00055 + cd.p) * 7 * s;
    const fl = 1 + Math.sin(t * .011 + cd.p * 3) * .12 + Math.sin(t * .023 + cd.p) * .06;
    const glow = ctx.createRadialGradient(x, y - 2 * s, 0, x, y - 2 * s, 30 * s);
    glow.addColorStop(0, "rgba(255,206,120,.28)"); glow.addColorStop(1, "rgba(255,206,120,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y - 2 * s, 30 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = "#ffbf45"; ctx.beginPath(); ctx.ellipse(x, y - 4 * s * fl, 2.3 * s, 5.2 * s * fl, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#fff4d0"; ctx.beginPath(); ctx.ellipse(x, y - 2.6 * s, 1 * s, 2.4 * s, 0, 0, TAU); ctx.fill();
    const body = ctx.createLinearGradient(x - 3.5 * s, 0, x + 3.5 * s, 0);
    body.addColorStop(0, "#f7efd9"); body.addColorStop(.6, "#e9dcbc"); body.addColorStop(1, "#c9b991");
    ctx.fillStyle = body; ctx.fillRect(x - 3.5 * s, y + 1.5 * s, 7 * s, 30 * s);
  }

  function newFlyer(first) {
    const far = rnd() < .5, s = far ? .35 + rnd() * .25 : .8 + rnd() * .5, dir = rnd() < .5 ? 1 : -1;
    return { s, dir, far, owl: Math.floor(rnd() * OWLS.length), tint: BANNERS[Math.floor(rnd() * 4)], p: rnd() * TAU, amp: 8 + rnd() * 22,
      y0: H * (.12 + rnd() * .45), x: first ? rnd() * W : (dir > 0 ? -90 : W + 90), v: (far ? 30 : 70) + rnd() * 50, wait: first ? 0 : 2500 + rnd() * 7000 };
  }

  function seed() {
    bright = Array.from({ length: Math.min(70, Math.round(W * H / 22000)) }, () => ({ x: rnd() * W, y: rnd() * H * .75, r: .8 + rnd() * 1.1, p: rnd() * TAU, s: .4 + rnd() * 1.4, warm: rnd() < .25 }));
    cloudSprites = [makeCloud(), makeCloud(), makeCloud()];
    clouds = Array.from({ length: W < 600 ? 3 : 6 }, (_, i) => ({ x: rnd() * W, y: H * (.08 + rnd() * .5), w: W * (.4 + rnd() * .5), v: 2 + rnd() * 5, a: .5 + rnd() * .4, s: cloudSprites[i % 3] }));
    flyers = Array.from({ length: W < 600 ? 2 : 4 }, () => newFlyer(true));
    snitch = { x: W * .6, y: H * .3, vx: 0, vy: 0, tx: W * .5, ty: H * .25, next: 0, trail: [] };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = Math.max(1, innerWidth); H = Math.max(1, innerHeight);   // a hidden or zero-size window would otherwise break the first paint
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    colKey = ""; for (const k in scenes) delete scenes[k]; seed(); seedCandles(); seedAtmos(); paintStadium(); readColours(performance.now(), true);
    draw(performance.now(), 0);
  }

  // Floodlight beams: soft cones rising through the haze, each slowly sweeping.
  function beams(t) {
    ctx.globalCompositeOperation = "lighter";
    lamps.forEach((l, i) => {
      const sweep = Math.sin(t * .00025 + i * 1.7) * .18, ang = -Math.PI / 2 + (l.x < W / 2 ? .38 : -.38) + sweep, len = H * 1.1, spread = .09;
      const ex1 = l.x + Math.cos(ang - spread) * len, ey1 = l.y + Math.sin(ang - spread) * len, ex2 = l.x + Math.cos(ang + spread) * len, ey2 = l.y + Math.sin(ang + spread) * len;
      const g = ctx.createLinearGradient(l.x, l.y, (ex1 + ex2) / 2, (ey1 + ey2) / 2);
      g.addColorStop(0, "rgba(255,248,225,.1)"); g.addColorStop(.35, "rgba(255,248,225,.03)"); g.addColorStop(1, "rgba(255,248,225,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(ex1, ey1); ctx.lineTo(ex2, ey2); ctx.closePath(); ctx.fill();
      const glow = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 40);
      glow.addColorStop(0, "rgba(255,250,230,.5)"); glow.addColorStop(1, "rgba(255,250,230,0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(l.x, l.y, 40, 0, TAU); ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";
  }

  // A rider on a broom, in silhouette: robe tinted by house, a rim of floodlight on the top edge, motion-blurred.
  // Owl post: owls cross the enchanted ceiling with letters, as at breakfast in the Great Hall. Snowy, tawny and barn owls,
  // lit by candlelight from below; far owls are small and dim, near ones larger, with a slow wingbeat.
  const OWLS = [["#f2f0ea", "#c9c4b8"], ["#8a6a48", "#5c4430"], ["#d9c29c", "#9c7e58"], ["#6b5844", "#43362a"]];
  function rider(f, t) {
    const y = f.y0 + Math.sin(f.x * .005 + f.p) * f.amp, flap = Math.sin(t * .012 + f.p), [body, wing] = OWLS[f.owl || 0];
    ctx.save();
    ctx.translate(f.x, y); ctx.scale(f.dir * f.s, f.s); ctx.globalAlpha = f.far ? .55 : .95;
    // wings: far wing behind, near wing in front, beating together
    const wingPath = (dy, tip) => { ctx.beginPath(); ctx.moveTo(-4, -2); ctx.quadraticCurveTo(-10, -14 + dy * .6, -28, tip); ctx.quadraticCurveTo(-18, -2 + dy * .2, -6, 4); ctx.closePath(); };
    ctx.fillStyle = wing; wingPath(flap * 10, -10 + flap * 16); ctx.fill();
    // body and head
    const g = ctx.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, body); g.addColorStop(1, wing);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 11, 8, -.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -6, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f2b73a"; ctx.beginPath(); ctx.arc(12.5, -7.5, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2a2018"; ctx.beginPath(); ctx.moveTo(15.8, -5.5); ctx.lineTo(18, -4.2); ctx.lineTo(15.4, -3.6); ctx.closePath(); ctx.fill();
    // tail
    ctx.fillStyle = wing; ctx.beginPath(); ctx.moveTo(-10, -1); ctx.lineTo(-19, 2); ctx.lineTo(-10, 4); ctx.closePath(); ctx.fill();
    // the letter, held in the talons, with a red seal
    ctx.save(); ctx.translate(2, 11); ctx.rotate(.12 + Math.sin(t * .004 + f.p) * .08);
    ctx.fillStyle = "#e8dcbc"; ctx.fillRect(-6, 0, 12, 8);
    ctx.strokeStyle = "rgba(120,90,40,.6)"; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(0, 4.5); ctx.lineTo(6, 0); ctx.stroke();
    ctx.fillStyle = "#9b1c22"; ctx.beginPath(); ctx.arc(0, 4.4, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = "#3a2c1e"; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(1, 6); ctx.lineTo(1, 11); ctx.moveTo(4, 6); ctx.lineTo(4, 11); ctx.stroke();
    // near wing, and candlelight catching the underside
    ctx.fillStyle = wing; wingPath(-flap * 10, -12 - flap * 16); ctx.fill();
    ctx.globalAlpha = (f.far ? .2 : .35); ctx.fillStyle = "#ffcf8a"; ctx.beginPath(); ctx.ellipse(0, 4, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function moveSnitch(dt, t) {
    const sn = snitch;
    if (t > sn.next) { sn.tx = W * (.1 + rnd() * .8); sn.ty = H * (.1 + rnd() * .5); sn.next = t + 600 + rnd() * 1400; }
    const dx = sn.tx - sn.x, dy = sn.ty - sn.y, d = Math.hypot(dx, dy) || 1, sp = Math.min(360, d * 3), k = Math.min(1, dt / 240);
    sn.vx += (dx / d * sp - sn.vx) * k; sn.vy += (dy / d * sp - sn.vy) * k;
    sn.x += sn.vx * dt / 1000; sn.y += sn.vy * dt / 1000;
    sn.trail.push([sn.x, sn.y]); if (sn.trail.length > 12) sn.trail.shift();
  }
  function drawSnitch(t) {
    const sn = snitch;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 1; i < sn.trail.length; i++) {
      ctx.globalAlpha = i / sn.trail.length * .18; ctx.strokeStyle = "#ffd97a"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sn.trail[i - 1][0], sn.trail[i - 1][1]); ctx.lineTo(sn.trail[i][0], sn.trail[i][1]); ctx.stroke();
    }
    const glow = ctx.createRadialGradient(sn.x, sn.y, 0, sn.x, sn.y, 12);
    glow.addColorStop(0, "rgba(255,214,110,.35)"); glow.addColorStop(1, "rgba(255,214,110,0)");
    ctx.globalAlpha = 1; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sn.x, sn.y, 12, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    // wings beat too fast to see: draw a fan of faint positions for the blur
    for (let k = 0; k < 4; k++) {
      const ph = Math.sin(t * .06 + k * .8), a = .35 + ph * .45;
      ctx.globalAlpha = .13; ctx.fillStyle = "#f3f0e6";
      ctx.beginPath(); ctx.ellipse(sn.x - 6, sn.y - 1, 7, 2.2, -a, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sn.x + 6, sn.y - 1, 7, 2.2, a, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const ball = ctx.createRadialGradient(sn.x - 1, sn.y - 1.2, .2, sn.x, sn.y, 3.2);
    ball.addColorStop(0, "#fffbe8"); ball.addColorStop(.35, "#f0c75a"); ball.addColorStop(1, "#8a6214");
    ctx.fillStyle = ball; ctx.beginPath(); ctx.arc(sn.x, sn.y, 3.2, 0, TAU); ctx.fill();
  }

  // ================= scenes: a painted place behind each screen =================
  // Home: Hogwarts on its cliff across the Black Lake. Lobby: inside the Great Hall. Game: your house's common room.
  // Each scene is painted once per size into its own canvas (windows and the enchanted ceiling are cut out so the sky
  // shows through), cached, and crossfaded when the screen or house changes; small animations run on top.
  const scenes = {}, sdata = {};
  let curScene = "", prevScene = "", sceneMix = 1;
  const sceneKey = () => { const sc = root.dataset.screen; if (root.dataset.game === "uno") return "sea"; return sc === "game" ? (root.dataset.house && root.dataset.house !== "hogwarts" ? root.dataset.house : "hall") : sc === "lobby" ? "hall" : "castle"; };
  const cut = (g, fn) => { g.save(); g.globalCompositeOperation = "destination-out"; g.beginPath(); fn(); g.fill(); g.restore(); };
  const gothic = (g, x, y, w, h) => { g.moveTo(x, y + h); g.lineTo(x, y + w * .55); g.quadraticCurveTo(x, y + w * .05, x + w / 2, y); g.quadraticCurveTo(x + w, y + w * .05, x + w, y + w * .55); g.lineTo(x + w, y + h); g.closePath(); };
  const roundTop = (g, x, y, w, h) => { g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); };
  function stone(g, x0, y0, x1, y1, bh, base, seed) {
    g.fillStyle = base; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    let r = seed || 1; const R = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let y = y0, row = 0; y < y1; y += bh, row++) {
      const off = row % 2 ? 0 : bh * 1.1;
      for (let x = x0 - off; x < x1; x += bh * 2.2) {
        const v = R(); g.fillStyle = `rgba(${v < .5 ? "0,0,0" : "255,240,220"},${.03 + R() * .06})`; g.fillRect(x + 1, y + 1, bh * 2.2 - 2, bh - 2);
        g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, bh * 2.2 - 1, bh - 1);
      }
    }
  }
  function banner(g, x, y, bw, bh, colr) {
    g.fillStyle = "#6e5a34"; g.fillRect(x - 5, y - 3, bw + 10, 4);
    g.fillStyle = colr; g.globalAlpha = .9;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + bw, y); g.lineTo(x + bw, y + bh); g.lineTo(x + bw / 2, y + bh - bw * .32); g.lineTo(x, y + bh); g.closePath(); g.fill();
    const fold = g.createLinearGradient(x, 0, x + bw, 0);
    fold.addColorStop(0, "rgba(0,0,0,.5)"); fold.addColorStop(.3, "rgba(0,0,0,.05)"); fold.addColorStop(.55, "rgba(255,255,255,.08)"); fold.addColorStop(.75, "rgba(0,0,0,.2)"); fold.addColorStop(1, "rgba(0,0,0,.55)");
    g.globalAlpha = 1; g.fillStyle = fold; g.fill();
    g.strokeStyle = "rgba(214,180,100,.6)"; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x + 4, y + 4); g.lineTo(x + bw - 4, y + 4); g.lineTo(x + bw - 4, y + bh - 6); g.lineTo(x + bw / 2, y + bh - bw * .32 - 4); g.lineTo(x + 4, y + bh - 6); g.closePath(); g.stroke();
    const ey = y + bh * .4; g.fillStyle = "rgba(214,180,100,.55)";
    g.beginPath(); g.moveTo(x + bw / 2, ey - bw * .26); g.lineTo(x + bw * .78, ey); g.lineTo(x + bw / 2, ey + bw * .26); g.lineTo(x + bw * .22, ey); g.closePath(); g.fill();
  }
  const vignette = (g, a) => { const v = g.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .2, W / 2, H * .55, Math.max(W, H) * .75); v.addColorStop(0, `rgba(0,0,0,${a})`); v.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = v; g.fillRect(0, 0, W, H); };
  const edgeDark = g => { const e = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .45, W / 2, H / 2, Math.max(W, H) * .8); e.addColorStop(0, "rgba(0,0,0,0)"); e.addColorStop(1, "rgba(0,0,0,.55)"); g.fillStyle = e; g.fillRect(0, 0, W, H); };

  // ---- Hogwarts across the Black Lake ----
  function paintCastle() {
    const [c, g] = layer(), small = W < 700, s = Math.min(1.25, Math.max(.55, W / 1300));
    const horizon = H * (small ? .6 : .5), cx = W * (small ? .5 : .6);
    const win = [];
    // far mountains in two layers
    [[horizon - H * .1, "#0e1426", .9, 60], [horizon - H * .04, "#0a0f1d", 1, 34]].forEach(([y, colr, a, amp], k) => {
      g.globalAlpha = a; g.fillStyle = colr; g.beginPath(); g.moveTo(0, horizon + 2);
      for (let x = 0; x <= W + 40; x += 40) g.lineTo(x, y - Math.abs(Math.sin(x * .004 + k * 2)) * amp - Math.sin(x * .013 + k) * amp * .3);
      g.lineTo(W, horizon + 2); g.closePath(); g.fill();
    });
    g.globalAlpha = 1;
    // the castle on its cliff, drawn by a function so the lake can mirror it
    let rr = 7; const R = () => (rr = (rr * 9301 + 49297) % 233280) / 233280;
    const towers = [];
    const cliffTop = horizon - H * .1;
    const add = (dx, w, h, roof) => towers.push({ x: cx + dx * s, w: w * s, h: h * s, roof });
    add(-170, 26, 120, "cone"); add(-128, 20, 90, "cone"); add(-92, 70, 70, "hall"); add(-40, 22, 150, "cone"); add(-12, 30, 110, "flat");
    add(20, 90, 80, "hall"); add(70, 16, 210, "cone"); add(100, 28, 130, "cone"); add(132, 22, 100, "flat"); add(160, 18, 150, "cone"); add(190, 30, 90, "cone");
    if (!small) { add(-215, 18, 80, "cone"); add(232, 22, 110, "cone"); }
    function drawCastle(gg, mirror) {
      // the cliff
      gg.fillStyle = "#05070d"; gg.beginPath(); gg.moveTo(cx - 290 * s, horizon + 1);
      gg.lineTo(cx - 250 * s, cliffTop + 30 * s); gg.lineTo(cx - 180 * s, cliffTop + 8 * s); gg.lineTo(cx - 60 * s, cliffTop); gg.lineTo(cx + 120 * s, cliffTop + 4 * s);
      gg.lineTo(cx + 250 * s, cliffTop + 22 * s); gg.lineTo(cx + 300 * s, horizon + 1); gg.closePath(); gg.fill();
      for (const t of towers) {
        const top = cliffTop + 6 * s - t.h, x = t.x - t.w / 2;
        gg.fillStyle = "#070912"; gg.fillRect(x, top, t.w, t.h);
        if (t.roof === "cone") { gg.beginPath(); gg.moveTo(x - 2 * s, top); gg.lineTo(t.x, top - t.w * 1.5); gg.lineTo(x + t.w + 2 * s, top); gg.closePath(); gg.fill(); }
        else if (t.roof === "hall") { gg.beginPath(); gg.moveTo(x, top); gg.lineTo(t.x, top - t.w * .28); gg.lineTo(x + t.w, top); gg.closePath(); gg.fill(); }
        else { for (let k = 0; k < t.w; k += 6 * s) gg.fillRect(x + k, top - 4 * s, 3 * s, 4 * s); }
        if (!mirror) { gg.strokeStyle = "rgba(170,182,225,.16)"; gg.lineWidth = 1; gg.beginPath(); gg.moveTo(x + .5, top); gg.lineTo(x + .5, top + t.h); gg.stroke(); }
      }
      // the bridge
      gg.fillStyle = "#070912"; const by = cliffTop - 10 * s;
      gg.fillRect(cx - 260 * s, by, 110 * s, 6 * s);
      for (let k = 0; k < 4; k++) { gg.beginPath(); gg.moveTo(cx - 260 * s + k * 28 * s, by + 6 * s); gg.lineTo(cx - 260 * s + k * 28 * s, horizon); gg.lineTo(cx - 252 * s + k * 28 * s, horizon); gg.lineTo(cx - 252 * s + k * 28 * s, by + 6 * s); gg.fill(); }
    }
    drawCastle(g, false);
    // lit windows: warm, many, some in rows on the halls
    for (const t of towers) {
      const top = cliffTop + 6 * s - t.h;
      if (t.roof === "hall") { for (let k = 0; k < 5; k++) { const wx = t.x - t.w / 2 + (k + .5) * t.w / 5 - 2 * s; win.push([wx, top + t.h * .3, 3.5 * s, 12 * s, .9]); } }
      for (let y = top + 8 * s; y < top + t.h - 6 * s; y += 11 * s) { if (R() < .55) win.push([t.x - 1.5 * s + (R() - .5) * t.w * .5, y, 2.6 * s, 4.2 * s, .5 + R() * .45]); }
    }
    for (const [x, y, w, h, a] of win) { g.globalAlpha = a; g.fillStyle = "#ffcf7a"; g.fillRect(x, y, w, h); g.globalAlpha = a * .25; g.fillStyle = "#ffb04a"; g.fillRect(x - w, y - h * .4, w * 3, h * 1.8); }
    g.globalAlpha = 1;
    // the Black Lake: deep water, the castle and its windows reflected and broken by ripples, the moon's path
    const lake = g.createLinearGradient(0, horizon, 0, H);
    lake.addColorStop(0, "#0b1226"); lake.addColorStop(1, "#02040a");
    g.fillStyle = lake; g.fillRect(0, horizon, W, H - horizon);
    g.save(); g.translate(0, horizon * 2); g.scale(1, -1); g.globalAlpha = .55; drawCastle(g, true); g.restore();
    g.globalAlpha = 1;
    for (const [x, y, w, h, a] of win) { const ry = horizon + (horizon - y); g.globalAlpha = a * .35; g.fillStyle = "#ffbf5a"; g.fillRect(x - 1, ry, w + 2, h * 2.4); }
    const fade = g.createLinearGradient(0, horizon, 0, H); fade.addColorStop(0, "rgba(6,10,22,.35)"); fade.addColorStop(1, "rgba(2,4,10,.9)");
    g.globalAlpha = 1; g.fillStyle = fade; g.fillRect(0, horizon, W, H - horizon);
    // the shore and the edge of the Forbidden Forest, with Hagrid's hut
    g.fillStyle = "#020306";
    g.beginPath(); g.moveTo(0, H); g.lineTo(0, H * .86); g.quadraticCurveTo(W * .18, H * .84, W * .34, H * .93); g.lineTo(W * .34, H); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(W, H); g.lineTo(W, H * .88); g.quadraticCurveTo(W * .88, H * .9, W * .8, H * .96); g.lineTo(W * .8, H); g.closePath(); g.fill();
    const pine = (x, y, h) => { g.beginPath(); for (let k = 0; k < 4; k++) { const ty = y - h + k * h * .22, w = h * (.16 + k * .07); g.moveTo(x, ty); g.lineTo(x - w, ty + h * .32); g.lineTo(x + w, ty + h * .32); } g.fill(); g.fillRect(x - h * .02, y - h * .1, h * .04, h * .12); };
    for (let k = 0; k < (small ? 6 : 12); k++) pine(W * (.01 + k * (small ? .045 : .022)), H * (.87 + (k % 3) * .012), H * (.12 + ((k * 37) % 7) * .012));
    for (let k = 0; k < (small ? 3 : 6); k++) pine(W * (.99 - k * .025), H * (.9 + (k % 2) * .01), H * (.1 + ((k * 23) % 5) * .012));
    const hx = W * (small ? .3 : .22), hy = H * .875;
    g.beginPath(); g.moveTo(hx - 22, hy); g.lineTo(hx - 22, hy - 16); g.quadraticCurveTo(hx, hy - 40, hx + 22, hy - 16); g.lineTo(hx + 22, hy); g.closePath(); g.fill();
    g.fillRect(hx + 8, hy - 38, 6, 14);
    g.fillStyle = "#ffbe5c"; g.fillRect(hx - 12, hy - 13, 6, 6); g.globalAlpha = .3; g.fillRect(hx - 18, hy - 18, 18, 16); g.globalAlpha = 1;
    edgeDark(g);
    sdata.castle = { win, horizon, cx, s, chimney: [hx + 11, hy - 38] };
    return c;
  }

  // ---- the Great Hall ----
  function paintHall() {
    const [c, g] = layer(), small = W < 700;
    const beamY = H * .2;
    stone(g, 0, 0, W, H, small ? 18 : 24, "#25201b", 3);
    const warm = g.createLinearGradient(0, H, 0, 0); warm.addColorStop(0, "rgba(255,170,80,.12)"); warm.addColorStop(1, "rgba(0,0,0,.25)"); g.fillStyle = warm; g.fillRect(0, 0, W, H);
    // the enchanted ceiling: the roof dissolves into the night sky
    g.save(); g.globalCompositeOperation = "destination-out";
    const ceil = g.createLinearGradient(0, 0, 0, beamY + 30); ceil.addColorStop(0, "rgba(0,0,0,1)"); ceil.addColorStop(.85, "rgba(0,0,0,1)"); ceil.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = ceil; g.fillRect(0, 0, W, beamY + 30); g.restore();
    // the great beam with a gilt edge
    g.fillStyle = "#1a120b"; g.fillRect(0, beamY, W, 14); g.fillStyle = "rgba(214,180,100,.5)"; g.fillRect(0, beamY + 14, W, 2);
    // tall Gothic windows letting in moonlight
    const ww = Math.max(small ? 46 : 62, W * (small ? .12 : .06)), wy = H * .28, wh = H * .5;
    const xs = small ? [.12, .88] : [.06, .2, .8, .94];
    const lights = [];
    xs.forEach(fx => {
      const x = W * fx - ww / 2;
      cut(g, () => gothic(g, x, wy, ww, wh));
      g.fillStyle = "rgba(110,135,200,.14)"; g.beginPath(); gothic(g, x, wy, ww, wh); g.fill();
      g.strokeStyle = "#0d0a07"; g.lineWidth = 3; g.beginPath(); gothic(g, x, wy, ww, wh); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.moveTo(x + ww / 2, wy + 4); g.lineTo(x + ww / 2, wy + wh); g.moveTo(x, wy + wh * .55); g.lineTo(x + ww, wy + wh * .55); g.stroke();
      g.strokeStyle = "rgba(20,16,12,.55)"; g.lineWidth = .8;
      for (let k = -wh; k < wh; k += 12) { g.beginPath(); g.moveTo(x, wy + ww * .5 + k); g.lineTo(x + ww, wy + ww * .5 + k + ww); g.moveTo(x + ww, wy + ww * .5 + k); g.lineTo(x, wy + ww * .5 + k + ww); g.stroke(); }
      g.strokeStyle = "rgba(170,160,140,.35)"; g.lineWidth = 6; g.beginPath(); gothic(g, x - 5, wy - 5, ww + 10, wh + 5); g.stroke();
      // moonlight falling on the floor
      const ml = g.createLinearGradient(x, wy + wh, x, H); ml.addColorStop(0, "rgba(160,180,240,.12)"); ml.addColorStop(1, "rgba(160,180,240,0)");
      g.fillStyle = ml; g.beginPath(); g.moveTo(x, wy + wh); g.lineTo(x + ww, wy + wh); g.lineTo(x + ww * 1.6, H); g.lineTo(x + ww * .4, H); g.closePath(); g.fill();
    });
    // house banners hanging from the beam, between the windows
    const bw = Math.max(26, W * .035), bh = H * .32;
    (small ? [[.32, 0], [.68, 2]] : [[.13, 0], [.27, 3], [.73, 2], [.87, 1]]).forEach(([fx, hi]) => banner(g, W * fx - bw / 2, beamY + 18, bw, bh, BANNERS[hi]));
    // wall torches
    const torches = (small ? [.24, .76] : [.13, .27, .73, .87]).map(fx => [W * fx, H * .66]);
    for (const [x, y] of torches) { g.fillStyle = "#2a1d10"; g.fillRect(x - 3, y, 6, 18); g.fillRect(x - 7, y + 16, 14, 4); }
    // the floor and the four long house tables, running away toward the staff table
    const fy = H * .82, fl = g.createLinearGradient(0, fy, 0, H); fl.addColorStop(0, "#15100b"); fl.addColorStop(1, "#070503");
    g.fillStyle = fl; g.fillRect(0, fy, W, H - fy);
    const vx = W / 2, vy = H * .7;
    [-.38, -.13, .13, .38].forEach(o => {
      const bx = W / 2 + o * W * 1.3, w = W * .06, nx = vx + o * W * .18;
      g.fillStyle = "#3a2614"; g.beginPath(); g.moveTo(bx - w, H); g.lineTo(bx + w, H); g.lineTo(nx + w * .18, fy); g.lineTo(nx - w * .18, fy); g.closePath(); g.fill();
      g.strokeStyle = "rgba(255,200,120,.18)"; g.lineWidth = 1; g.stroke();
    });
    g.fillStyle = "#2e1e10"; g.fillRect(W * .35, fy - 6, W * .3, 8);
    vignette(g, .35); edgeDark(g);
    sdata.hall = { torches };
    return c;
  }

  // ---- the four common rooms ----
  function paintCommon(house) {
    const [c, g] = layer(), small = W < 700, d = { lamps: [], stars: [] };
    if (house === "gryffindor") {
      stone(g, 0, 0, W, H, small ? 18 : 24, "#3a1714", 5);
      // tall windows high on the tower wall
      const ww = small ? 40 : 56, wh = H * .3;
      [[.07, H * .06], [.93, H * .06]].forEach(([fx, y]) => { const x = W * fx - ww / 2; cut(g, () => roundTop(g, x, y, ww, wh)); g.strokeStyle = "#1a0c08"; g.lineWidth = 3; g.beginPath(); roundTop(g, x, y, ww, wh); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + ww / 2, y); g.lineTo(x + ww / 2, y + wh); g.stroke(); });
      // scarlet tapestries with gold borders
      (small ? [.2, .8] : [.17, .3, .7, .83]).forEach((fx, k) => {
        const tw = small ? 40 : 70, x = W * fx - tw / 2, y = H * .08, th = H * .52;
        g.fillStyle = "#8e1a1f"; g.fillRect(x, y, tw, th);
        const f = g.createLinearGradient(x, 0, x + tw, 0); f.addColorStop(0, "rgba(0,0,0,.45)"); f.addColorStop(.5, "rgba(255,255,255,.06)"); f.addColorStop(1, "rgba(0,0,0,.45)"); g.fillStyle = f; g.fillRect(x, y, tw, th);
        g.strokeStyle = "#d9a83e"; g.lineWidth = 2; g.strokeRect(x + 5, y + 5, tw - 10, th - 10);
        g.fillStyle = "rgba(217,168,62,.55)"; for (let yy = y + 30; yy < y + th - 20; yy += 34) { g.beginPath(); g.moveTo(x + tw / 2, yy - 9); g.lineTo(x + tw / 2 + 8, yy); g.lineTo(x + tw / 2, yy + 9); g.lineTo(x + tw / 2 - 8, yy); g.closePath(); g.fill(); }
        g.fillStyle = "#d9a83e"; for (let k2 = 0; k2 < tw; k2 += 6) g.fillRect(x + k2, y + th, 2, 8);
      });
      // the great fireplace
      const fw = Math.min(W * .4, 520), fh = H * .3, fx = W / 2 - fw / 2, fy0 = H - fh;
      g.fillStyle = "#4a3a30"; g.fillRect(fx - 26, fy0 - 26, fw + 52, fh + 26);
      g.fillStyle = "#2d211b"; g.fillRect(fx - 40, fy0 - 40, fw + 80, 16);
      cut(g, () => roundTop(g, fx, fy0, fw, fh + 4));
      g.fillStyle = "#120604"; g.beginPath(); roundTop(g, fx, fy0, fw, fh + 4); g.fill();
      d.fire = [W / 2, H - 6, fw * .7];
      // armchairs either side of the fire
      [[W / 2 - fw * .85, 1], [W / 2 + fw * .85, -1]].forEach(([x, dir]) => { g.fillStyle = "#5a1416"; g.beginPath(); g.ellipse(x, H - 30, 48, 26, 0, 0, TAU); g.fill(); g.fillRect(x - 46, H - 30, 92, 30); g.beginPath(); g.ellipse(x + dir * 10, H - 66, 40, 44, 0, 0, TAU); g.fill(); g.fillStyle = "rgba(255,140,60,.18)"; g.beginPath(); g.ellipse(x - dir * 20, H - 60, 18, 40, 0, 0, TAU); g.fill(); });
      vignette(g, .3); edgeDark(g);
    }
    if (house === "slytherin") {
      stone(g, 0, 0, W, H, small ? 18 : 22, "#1c2a24", 8);
      // windows looking out under the lake
      const ww = small ? 50 : 80, wh = H * .2;
      (small ? [.25, .75] : [.12, .32, .68, .88]).forEach(fx => {
        const x = W * fx - ww / 2, y = H * .05;
        cut(g, () => roundTop(g, x, y, ww, wh));
        const water = g.createLinearGradient(0, y, 0, y + wh); water.addColorStop(0, "#2f8a6a"); water.addColorStop(1, "#08261c");
        g.fillStyle = water; g.beginPath(); roundTop(g, x, y, ww, wh); g.fill();
        g.strokeStyle = "rgba(200,255,230,.25)"; g.lineWidth = 1; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x + ww * (.15 + k * .22), y); g.lineTo(x + ww * (.05 + k * .22), y + wh); g.stroke(); }
        g.strokeStyle = "#0b120f"; g.lineWidth = 4; g.beginPath(); roundTop(g, x, y, ww, wh); g.stroke();
        d.lamps.push([x + ww / 2, y + wh + 40]);
      });
      // low stone arches along the dungeon
      const aw = small ? 120 : 220;
      for (let x = -aw / 2; x < W + aw; x += aw) {
        g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = 16; g.beginPath(); g.arc(x, H * .62, aw * .55, Math.PI, 0); g.stroke();
        g.strokeStyle = "rgba(160,190,175,.12)"; g.lineWidth = 2; g.beginPath(); g.arc(x, H * .62, aw * .55 - 8, Math.PI, 0); g.stroke();
        g.fillStyle = "#121b17"; g.fillRect(x - 12, H * .62, 24, H * .38);
      }
      // hanging lamps on chains
      for (const [x, y] of d.lamps) { g.strokeStyle = "#2a2a2a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, H * .27); g.lineTo(x, y - 10); g.stroke(); g.fillStyle = "#1d2b25"; g.beginPath(); g.moveTo(x - 8, y - 10); g.lineTo(x + 8, y - 10); g.lineTo(x + 5, y + 10); g.lineTo(x - 5, y + 10); g.closePath(); g.fill(); }
      // black leather sofas
      [[W * .18, 1], [W * .82, -1]].forEach(([x]) => { g.fillStyle = "#0a0f0d"; g.fillRect(x - 70, H - 46, 140, 46); g.beginPath(); g.ellipse(x, H - 50, 74, 18, 0, Math.PI, 0); g.fill(); });
      vignette(g, .3); edgeDark(g);
    }
    if (house === "ravenclaw") {
      g.fillStyle = "#16213f"; g.fillRect(0, 0, W, H);
      // the domed ceiling, painted with stars, ribbed in bronze
      const domeH = H * .42, dome = g.createRadialGradient(W / 2, 0, 0, W / 2, 0, Math.max(W, domeH) * .9);
      dome.addColorStop(0, "#1c2f6e"); dome.addColorStop(1, "#0b1433");
      g.fillStyle = dome; g.fillRect(0, 0, W, domeH);
      g.strokeStyle = "rgba(196,138,75,.55)"; g.lineWidth = 2;
      for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(W / 2, -H * .2); g.quadraticCurveTo(W / 2 + k * W * .12, domeH * .3, W / 2 + k * W * .16, domeH); g.stroke(); }
      for (let i = 0; i < (small ? 40 : 110); i++) { const x = rnd() * W, y = rnd() * domeH * .95, r = 1 + rnd() * 2.2; d.stars.push([x, y, r, rnd() * TAU]);
        g.fillStyle = "rgba(240,210,150,.85)"; g.beginPath(); g.moveTo(x, y - r * 2); g.lineTo(x + r * .5, y - r * .5); g.lineTo(x + r * 2, y); g.lineTo(x + r * .5, y + r * .5); g.lineTo(x, y + r * 2); g.lineTo(x - r * .5, y + r * .5); g.lineTo(x - r * 2, y); g.lineTo(x - r * .5, y - r * .5); g.closePath(); g.fill(); }
      g.fillStyle = "#b07a3e"; g.fillRect(0, domeH, W, 6); g.fillStyle = "#3a2a18"; g.fillRect(0, domeH + 6, W, 4);
      // arched windows round the tower, with blue silk drapes
      const ww = small ? 44 : 64, wh = H * .32;
      (small ? [.1, .9] : [.08, .22, .78, .92]).forEach(fx => {
        const x = W * fx - ww / 2, y = domeH + 26;
        cut(g, () => gothic(g, x, y, ww, wh));
        g.strokeStyle = "#0a1026"; g.lineWidth = 3; g.beginPath(); gothic(g, x, y, ww, wh); g.stroke();
        g.strokeStyle = "rgba(196,138,75,.6)"; g.lineWidth = 2; g.beginPath(); gothic(g, x - 4, y - 4, ww + 8, wh + 4); g.stroke();
        g.fillStyle = "#2a4aa0"; [[x - 14, 1], [x + ww + 14, -1]].forEach(([dx, dir]) => { g.beginPath(); g.moveTo(dx, y - 6); g.quadraticCurveTo(dx + dir * 20, y + wh * .5, dx + dir * 4, y + wh + 10); g.lineTo(dx - dir * 6, y + wh + 10); g.quadraticCurveTo(dx - dir * 2, y + wh * .5, dx - dir * 8, y - 6); g.closePath(); g.fill(); });
      });
      // bookshelves low on the walls
      for (let x = 0; x < W; x += small ? 70 : 110) { if (x > W * .3 && x < W * .7) continue; g.fillStyle = "#1a1410"; g.fillRect(x, H * .8, (small ? 60 : 96), H * .2); for (let k = 0; k < 4; k++) for (let b = 0; b < 8; b++) { g.fillStyle = ["#2a3f7a", "#6a4a24", "#3a2a5a", "#7a5a2a"][(k + b) % 4]; g.fillRect(x + 4 + b * (small ? 7 : 11), H * .82 + k * H * .045, small ? 5 : 8, H * .035); } }
      vignette(g, .32); edgeDark(g);
    }
    if (house === "hufflepuff") {
      g.fillStyle = "#3a2a14"; g.fillRect(0, 0, W, H);
      // warm wooden panelling
      for (let x = 0; x < W; x += 46) { g.fillStyle = `rgba(${x % 92 ? "0,0,0" : "255,220,150"},.06)`; g.fillRect(x, H * .3, 46, H * .7); g.strokeStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.moveTo(x, H * .3); g.lineTo(x, H); g.stroke(); }
      // low ceiling beams with trailing plants
      g.fillStyle = "#1e1408"; g.fillRect(0, 0, W, H * .06); for (let x = 30; x < W; x += small ? 120 : 200) { g.fillRect(x, 0, 18, H * .3); }
      for (let x = 60; x < W; x += small ? 90 : 140) { g.strokeStyle = "#3f6b2a"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, H * .06); for (let y = H * .06; y < H * .06 + 40 + (x % 5) * 14; y += 6) g.lineTo(x + Math.sin(y * .1) * 5, y); g.stroke(); g.fillStyle = "#5c8a3a"; for (let y = H * .1; y < H * .06 + 40 + (x % 5) * 14; y += 10) { g.beginPath(); g.ellipse(x + Math.sin(y * .1) * 5 + 4, y, 4, 2.4, .5, 0, TAU); g.fill(); } }
      // round windows looking out at grass level
      const r = small ? 34 : 54;
      (small ? [.18, .82] : [.12, .3, .7, .88]).forEach(fx => {
        const x = W * fx, y = H * .2;
        cut(g, () => g.arc(x, y, r, 0, TAU));
        g.fillStyle = "#3f7a2c"; g.beginPath(); g.arc(x, y, r, Math.PI * .15, Math.PI * .85); g.closePath(); g.fill();
        g.strokeStyle = "#1a1206"; g.lineWidth = 6; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
        g.strokeStyle = "#c98f32"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 5, 0, TAU); g.stroke();
        g.lineWidth = 2; g.strokeStyle = "#1a1206"; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke();
        d.lamps.push([x, y + r + 36]);
      });
      // the round door
      const dr = small ? 46 : 70, dx = W * (small ? .12 : .08), dy = H - dr * .2;
      g.fillStyle = "#6a4518"; g.beginPath(); g.arc(dx, dy, dr, 0, TAU); g.fill();
      g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2; for (let k = -dr; k < dr; k += 12) { g.beginPath(); g.moveTo(dx + k, dy - Math.sqrt(dr * dr - k * k)); g.lineTo(dx + k, dy + Math.sqrt(dr * dr - k * k)); g.stroke(); }
      g.strokeStyle = "#c98f32"; g.lineWidth = 3; g.beginPath(); g.arc(dx, dy, dr, 0, TAU); g.stroke(); g.fillStyle = "#e0b14a"; g.beginPath(); g.arc(dx, dy, 5, 0, TAU); g.fill();
      // copper lamps
      for (const [x, y] of d.lamps) { g.strokeStyle = "#5a3a16"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x, y - 8); g.stroke(); g.fillStyle = "#b8742a"; g.beginPath(); g.arc(x, y, 7, Math.PI, 0); g.fill(); }
      vignette(g, .3); edgeDark(g);
    }
    sdata[house] = d;
    return c;
  }
  // ---- the Grand Line by day (UNO screens), painted the way the anime paints it: a deep blue sky piled with cel-shaded
  // cumulus, the Red Line climbing through the clouds with Reverse Mountain, Zunesha wading with Zou on its back, a sky
  // island, a palm island and a bright sea. The ship, the Sea King, waves, gulls and sparkle move on top ----
  function paintSea() {
    const [c, g] = layer(), small = W < 700, horizon = H * (small ? .5 : .55);
    const sunX = W * (small ? .82 : .8), sunY = horizon * .2, sunR = Math.min(W, H) * .04;
    let rr = 11; const R = () => (rr = (rr * 9301 + 49297) % 233280) / 233280;
    // the sky: deep ultramarine overhead, paling to a bright haze at the horizon
    const sky = g.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#0a3a92"); sky.addColorStop(.4, "#1f6fd6"); sky.addColorStop(.78, "#6dbcf2"); sky.addColorStop(1, "#d6f1ff");
    g.fillStyle = sky; g.fillRect(0, 0, W, horizon + 1);
    // the sun: a white disc, a wide glare and faint rays
    const glow = g.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(W, H) * .5);
    glow.addColorStop(0, "rgba(255,255,240,.95)"); glow.addColorStop(.06, "rgba(255,250,222,.6)"); glow.addColorStop(.22, "rgba(255,244,210,.16)"); glow.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = glow; g.fillRect(0, 0, W, horizon);
    g.save(); g.globalCompositeOperation = "lighter";
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + .2; g.fillStyle = "rgba(255,250,225,.045)"; g.beginPath(); g.moveTo(sunX, sunY); g.arc(sunX, sunY, Math.max(W, H) * .7, a, a + .05); g.closePath(); g.fill(); }
    g.restore();
    g.fillStyle = "#fffef6"; g.beginPath(); g.arc(sunX, sunY, sunR, 0, TAU); g.fill();

    // an anime cumulus: a flat base, piled round lobes, white where the sun strikes and a cool blue in shadow,
    // a darker underside; far ones fade toward the sky
    function cumulus(x, base, w, h, far = 0) {
      // lobes piled in rows that narrow toward the top, so tall towers billow and wide banks stay low
      const lobes = [], rows = Math.max(1, Math.round(h / (w * .3)));
      for (let ri = 0; ri <= rows; ri++) {
        const fy = ri / rows, rw = w * (1 - fy * .6), ry = base - h * fy * .78, r0 = Math.min(w * .2, h * .3) * (1 - fy * .25), m = Math.max(2, Math.round(rw / (r0 * 1.25)));
        for (let k = 0; k < m; k++) lobes.push([x - rw / 2 + (k + .5) / m * rw + (R() - .5) * r0 * .5, ry - r0 * (.35 + R() * .35), r0 * (.75 + R() * .45)]);
      }
      lobes.push([x + (R() - .5) * w * .1, base - h * .82, Math.min(w * .2, h * .3) * .8]);
      const dir = Math.sign(sunX - x) || 1;
      g.save();
      g.beginPath(); g.rect(x - w, -H, w * 2, base + H); g.clip();
      g.beginPath(); lobes.forEach(([lx, ly, r]) => { g.moveTo(lx + r, ly); g.arc(lx, ly, r, 0, TAU); }); g.clip();
      g.globalAlpha = 1 - far * .45;
      g.fillStyle = far ? "#b9d6f3" : "#a3c2ea"; g.fillRect(x - w, base - h * 1.4, w * 2, h * 1.5);
      g.fillStyle = "#ffffff"; lobes.forEach(([lx, ly, r]) => { g.beginPath(); g.arc(lx + dir * r * .16, ly - r * .2, r * .84, 0, TAU); g.fill(); });
      const ug = g.createLinearGradient(0, base - h * .32, 0, base);
      ug.addColorStop(0, "rgba(120,160,215,0)"); ug.addColorStop(1, far ? "rgba(160,195,235,.8)" : "rgba(110,150,210,.95)");
      g.fillStyle = ug; g.fillRect(x - w, base - h * .32, w * 2, h * .33);
      g.restore();
    }
    // a far bank of cloud along the horizon
    for (let x = -W * .05; x < W * 1.05; x += W * (.1 + R() * .08)) cumulus(x, horizon - 1, W * (.12 + R() * .1), horizon * (.07 + R() * .08), 1);

    // the Red Line: a wall of red rock that rings the world, climbing far above the clouds on the left, lit from the right,
    // fading into haze toward the sea. Reverse Mountain stands out of it, with the four seas' currents running up its face
    const rx1 = W * (small ? .34 : .27), rtop = horizon * .2, mx = rx1 * .58, mtop = horizon * .02;
    const rg = g.createLinearGradient(0, 0, 0, horizon);
    rg.addColorStop(0, "#a8383a"); rg.addColorStop(.5, "#c2524a"); rg.addColorStop(.85, "#d9877a"); rg.addColorStop(1, "#e6b4a8");
    g.fillStyle = rg; g.beginPath(); g.moveTo(-4, horizon + 1); g.lineTo(-4, rtop + 8);
    for (let x = 0; x <= rx1 * .9; x += Math.max(3, W * .008)) {
      const near = Math.max(0, 1 - Math.abs(x - mx) / (rx1 * .3)), peak = (1 - Math.cos(near * Math.PI)) / 2;
      g.lineTo(x, rtop + (R() - .5) * 6 - peak * (rtop - mtop));
    }
    g.bezierCurveTo(rx1 * .96, rtop + horizon * .1, rx1 * 1.02, horizon * .6, rx1 * 1.06, horizon + 1); g.closePath(); g.fill();
    g.save(); g.clip();
    for (let k = 0; k < 60; k++) { const x = R() * rx1 * 1.05, w = 1 + R() * 3; g.fillStyle = R() < .5 ? "rgba(90,20,30,.18)" : "rgba(255,190,170,.14)"; g.fillRect(x, rtop - 30 + R() * 40, w, horizon); }
    const lit = g.createLinearGradient(rx1 * .8, 0, rx1 * 1.06, 0); lit.addColorStop(0, "rgba(255,200,170,0)"); lit.addColorStop(1, "rgba(255,214,190,.55)");
    g.fillStyle = lit; g.fillRect(rx1 * .8, 0, rx1 * .3, horizon);
    g.strokeStyle = "rgba(200,235,255,.85)"; g.lineWidth = Math.max(1.4, W / 800);
    for (let k = 0; k < 4; k++) { const bx = mx - rx1 * .2 + k * rx1 * .13; g.beginPath(); g.moveTo(bx, horizon); g.quadraticCurveTo(bx + (mx - bx) * .25, horizon * .45, mx + (k - 1.5) * 1.5, mtop + 6); g.stroke(); }
    g.restore();
    const haze = g.createLinearGradient(0, horizon * .45, 0, horizon);
    haze.addColorStop(0, "rgba(214,241,255,0)"); haze.addColorStop(1, "rgba(214,241,255,.6)");
    g.fillStyle = haze; g.fillRect(0, horizon * .45, rx1 * 1.1, horizon * .55 + 1);
    // a belt of cloud wrapped round the Red Line's waist
    cumulus(rx1 * .5, horizon * .58, rx1 * 1.3, horizon * .12);

    // a tall tower of cumulus to the right, behind Zunesha
    cumulus(W * (small ? .96 : .9), horizon - 2, W * (small ? .42 : .3), horizon * .5);
    // Zunesha: the vast elephant, wading far out with the forests of Zou on its back, pale with distance
    // (drawn on its own layer so the haze can lie over the animal alone, then laid onto the scene)
    const zx = W * (small ? .63 : .6), zh = horizon * (small ? .4 : .46), zs = zh / 100, zb = horizon + 1, [zc] = layer();
    { const g = zc.getContext("2d");
    g.save(); g.translate(zx, zb); g.scale(zs, zs);
    const hide = "#8ea6c8", shade = "#748db4";
    g.fillStyle = shade;   // far legs
    g.beginPath(); g.moveTo(-26, -40); g.lineTo(-20, 0); g.lineTo(-8, 0); g.lineTo(-10, -40); g.fill();
    g.beginPath(); g.moveTo(26, -40); g.lineTo(30, 0); g.lineTo(42, 0); g.lineTo(40, -40); g.fill();
    g.fillStyle = hide;    // body
    g.beginPath(); g.ellipse(8, -52, 46, 26, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-30, -44); g.lineTo(-34, 0); g.lineTo(-20, 0); g.lineTo(-16, -40); g.fill();   // near legs
    g.beginPath(); g.moveTo(36, -44); g.lineTo(40, 0); g.lineTo(54, 0); g.lineTo(50, -44); g.fill();
    g.beginPath(); g.ellipse(-40, -58, 16, 18, -.2, 0, TAU); g.fill();   // head
    g.strokeStyle = hide; g.lineWidth = 8; g.lineCap = "round";        // trunk, curling down into the sea
    g.beginPath(); g.moveTo(-52, -52); g.bezierCurveTo(-64, -40, -60, -20, -66, -4); g.stroke();
    g.strokeStyle = "#e9eef5"; g.lineWidth = 3; g.beginPath(); g.moveTo(-48, -46); g.quadraticCurveTo(-58, -40, -60, -30); g.stroke();   // tusk
    g.fillStyle = shade; g.beginPath(); g.moveTo(-34, -72); g.bezierCurveTo(-12, -82, -6, -50, -18, -36); g.bezierCurveTo(-26, -40, -32, -52, -34, -72); g.fill();   // ear
    g.fillStyle = "#5d7299"; g.beginPath(); g.arc(-46, -62, 1.6, 0, TAU); g.fill();
    // Zou on its back: a forested island with cliffs, trees and mist
    g.fillStyle = "#7f98a6"; g.beginPath(); g.moveTo(-26, -72); g.quadraticCurveTo(8, -86, 46, -70); g.lineTo(40, -64); g.quadraticCurveTo(8, -74, -22, -66); g.closePath(); g.fill();
    for (let k = 0; k < 26; k++) { const t = k / 25, x = -26 + t * 72, y = -76 - Math.sin(t * Math.PI) * 10 - R() * 8, r = 4 + R() * 6;
      g.fillStyle = R() < .5 ? "#6f9a8f" : "#5c887f"; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    for (let k = 0; k < 5; k++) { const x = -10 + k * 12 + R() * 4, h = 14 + R() * 10; g.fillStyle = "#567f78"; g.beginPath(); g.moveTo(x - 3, -82); g.lineTo(x, -82 - h); g.lineTo(x + 3, -82); g.fill(); }
    // haze over it, thickest at the waterline and fading out on every side so it leaves no edge
    g.save(); g.globalCompositeOperation = "source-atop";
    const mist = g.createLinearGradient(0, -100, 0, 0); mist.addColorStop(0, "rgba(214,241,255,.12)"); mist.addColorStop(1, "rgba(214,241,255,.6)");
    g.fillStyle = mist; g.fillRect(-90, -120, 180, 122);
    g.restore();
    g.restore(); }
    g.drawImage(zc, 0, 0, W, H);
    // foam round its legs where they meet the sea
    g.save(); g.translate(zx, zb); g.scale(zs, zs); g.fillStyle = "#e6f4ff"; g.globalAlpha = .7;
    for (const [x, w] of [[-48, 12], [-27, 10], [-14, 9], [35, 10], [47, 10]]) { g.beginPath(); g.ellipse(x, 0, w, 2.4, 0, 0, TAU); g.fill(); }
    g.restore();

    // drifting puffs higher up
    cumulus(W * .5, horizon * .34, W * (small ? .3 : .18), horizon * .1);
    cumulus(W * (small ? .2 : .44), horizon * .12, W * .14, horizon * .06);
    cumulus(W * (small ? .7 : .66), horizon * .44, W * .2, horizon * .08);
    // a sky island on its own cloud, with a little temple and a palm on top
    const kx = W * (small ? .42 : .4), ky = horizon * (small ? .26 : .24), kw = W * (small ? .3 : .16);
    cumulus(kx, ky, kw, kw * .32);
    g.fillStyle = "#5fa36f"; g.beginPath(); g.moveTo(kx - kw * .3, ky - kw * .22); g.quadraticCurveTo(kx, ky - kw * .42, kx + kw * .28, ky - kw * .22); g.closePath(); g.fill();
    g.fillStyle = "#f3eee0"; g.fillRect(kx - kw * .06, ky - kw * .4, kw * .1, kw * .1);
    g.fillStyle = "#e4cfa0"; g.beginPath(); g.moveTo(kx - kw * .08, ky - kw * .4); g.lineTo(kx - kw * .01, ky - kw * .47); g.lineTo(kx + kw * .06, ky - kw * .4); g.fill();
    g.strokeStyle = "#7a5638"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(kx + kw * .16, ky - kw * .28); g.quadraticCurveTo(kx + kw * .17, ky - kw * .4, kx + kw * .21, ky - kw * .48); g.stroke();
    g.fillStyle = "#3f8a52"; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .6; g.beginPath(); g.ellipse(kx + kw * .21 + Math.cos(a) * kw * .04, ky - kw * .48 + Math.sin(a) * kw * .025, kw * .05, kw * .012, a, 0, TAU); g.fill(); }

    // the sea: pale at the horizon, then the deep ultramarine of the anime ocean, with brush-stroke wave crests
    const sea = g.createLinearGradient(0, horizon, 0, H);
    sea.addColorStop(0, "#7cc6f2"); sea.addColorStop(.05, "#2f8ad8"); sea.addColorStop(.35, "#1561be"); sea.addColorStop(1, "#05276a");
    g.fillStyle = sea; g.fillRect(0, horizon, W, H - horizon);
    g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(0, horizon, W, 1);
    for (let k = 0; k < (small ? 260 : 420); k++) {
      const d = Math.pow(R(), 1.6), y = horizon + 3 + d * (H - horizon), w = 4 + d * 46 * (.5 + R()), x = R() * W;
      g.globalAlpha = .12 + d * .3; g.strokeStyle = R() < .72 ? "#ffffff" : "#0a3c86"; g.lineWidth = .6 + d * 1.6;
      g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x, y - 1.5 - d * 4, x + w / 2, y); g.stroke();
    }
    g.globalAlpha = 1;
    // the sun's path on the water
    for (let k = 0; k < 60; k++) { const d = k / 60, y = horizon + 3 + d * d * (H - horizon) * .9, w = (8 + d * 70) * (.4 + R() * .8);
      g.globalAlpha = .55 * (1 - d); g.fillStyle = "#ffffff"; g.fillRect(sunX + (R() - .5) * (20 + d * 120) - w / 2, y, w, 1 + d * 2); }
    g.globalAlpha = 1;

    // a palm island off to the right, in front of the far clouds
    const ix = W * (small ? .9 : .9), iw = W * (small ? .24 : .14), iy = horizon + 2;
    g.fillStyle = "#f2dfae"; g.beginPath(); g.ellipse(ix, iy, iw * .55, iw * .06, 0, 0, TAU); g.fill();
    g.fillStyle = "#3f9a5c"; g.beginPath(); g.moveTo(ix - iw * .45, iy); g.quadraticCurveTo(ix - iw * .15, iy - iw * .26, ix + iw * .05, iy - iw * .24); g.quadraticCurveTo(ix + iw * .3, iy - iw * .2, ix + iw * .45, iy); g.closePath(); g.fill();
    g.fillStyle = "#2f7d48"; g.beginPath(); g.moveTo(ix - iw * .45, iy); g.quadraticCurveTo(ix - iw * .1, iy - iw * .12, ix + iw * .45, iy); g.closePath(); g.fill();
    const palm = (x, y, h, lean) => { g.strokeStyle = "#8a5a3a"; g.lineWidth = Math.max(2, iw * .02); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + lean * .5, y - h * .6, x + lean, y - h); g.stroke();
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .5; g.fillStyle = k % 2 ? "#2f8a4a" : "#3fa35a"; g.beginPath(); g.moveTo(x + lean, y - h); g.quadraticCurveTo(x + lean + Math.cos(a) * h * .3, y - h + Math.sin(a) * h * .3 - 4, x + lean + Math.cos(a) * h * .55, y - h + Math.sin(a) * h * .2 + 7); g.quadraticCurveTo(x + lean + Math.cos(a) * h * .25, y - h + Math.sin(a) * h * .12, x + lean, y - h); g.fill(); } };
    palm(ix - iw * .08, iy - iw * .2, iw * .38, iw * .05); palm(ix + iw * .1, iy - iw * .2, iw * .3, -iw * .06);

    vignette(g, .08); edgeDark(g);
    sdata.sea = { horizon, sunX, sunR, small, gulls: Array.from({ length: small ? 4 : 7 }, () => ({ x: R() * W, y: horizon * (.25 + R() * .45), s: .6 + R() * .8, v: 12 + R() * 18, p: R() * 6 })) };
    return c;
  }
  // a pirate ship under full sail, with a lion figurehead and a straw hat Jolly Roger on the main sail and the black flag
  function ship(x, y, s, t) {
    const bob = Math.sin(t * .0011) * 3 * s, roll = Math.sin(t * .0009) * .025;
    ctx.save(); ctx.translate(x, y + bob); ctx.rotate(roll); ctx.scale(s, s);
    ctx.fillStyle = "#2a1712";
    ctx.beginPath(); ctx.moveTo(-120, -10); ctx.lineTo(110, -14); ctx.quadraticCurveTo(140, -16, 150, -34); ctx.lineTo(156, -30); ctx.quadraticCurveTo(140, 20, 90, 26); ctx.lineTo(-90, 26); ctx.quadraticCurveTo(-118, 18, -128, -22); ctx.lineTo(-120, -10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#c9873a"; ctx.fillRect(-112, -6, 214, 3);
    for (let k = 0; k < 6; k++) { ctx.fillStyle = "#14090a"; ctx.beginPath(); ctx.arc(-80 + k * 32, 6, 4, 0, TAU); ctx.fill(); }
    // the figurehead: a lion's head in a sunburst mane
    ctx.fillStyle = "#e8742a"; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; ctx.beginPath(); ctx.ellipse(156 + Math.cos(a) * 9, -38 + Math.sin(a) * 9, 5, 2.6, a, 0, TAU); ctx.fill(); }
    ctx.fillStyle = "#f6c64a"; ctx.beginPath(); ctx.arc(156, -38, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = "#3a1e10"; ctx.beginPath(); ctx.arc(153, -40, 1.3, 0, TAU); ctx.arc(159, -40, 1.3, 0, TAU); ctx.fill(); ctx.fillRect(154.5, -36, 3, 1.4);
    ctx.strokeStyle = "#1c0f0c"; ctx.lineWidth = 4;
    [[-50, 150], [30, 185], [95, 120]].forEach(([mx, mh]) => { ctx.beginPath(); ctx.moveTo(mx, -12); ctx.lineTo(mx, -12 - mh); ctx.stroke(); });
    const sail = (mx, top, w, h) => { const bel = 10 + Math.sin(t * .0016 + mx) * 2; const sg = ctx.createLinearGradient(mx - w / 2, 0, mx + w / 2, 0); sg.addColorStop(0, "#d8c6a2"); sg.addColorStop(.5, "#fff1d0"); sg.addColorStop(1, "#c9b088");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(mx - w / 2, top); ctx.lineTo(mx + w / 2, top); ctx.quadraticCurveTo(mx + w / 2 + bel, top + h / 2, mx + w / 2, top + h); ctx.lineTo(mx - w / 2, top + h); ctx.quadraticCurveTo(mx - w / 2 + bel, top + h / 2, mx - w / 2, top); ctx.fill(); };
    sail(-50, -150, 74, 56); sail(-50, -88, 86, 58); sail(30, -186, 84, 62); sail(30, -116, 100, 76); sail(95, -120, 58, 44);
    // the main sail carries a straw hat Jolly Roger: crossbones and a grinning skull in ink, wearing a straw hat
    ctx.save(); ctx.translate(30, -76); strawSkull(ctx, 1, "#1a1310", "#fff1d0"); ctx.restore();
    // and the same on the black flag at the masthead
    const wv = k => Math.sin(t * .006 + k * .9) * 2.5;
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.moveTo(30, -199);
    for (let k = 0; k <= 7; k++) ctx.lineTo(30 + k * 6, -199 + wv(k));
    for (let k = 7; k >= 0; k--) ctx.lineTo(30 + k * 6, -175 + wv(k));
    ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(51, -186 + wv(3.5)); strawSkull(ctx, .42, "#f1ead8", "#111"); ctx.restore();
    ctx.restore();
  }
  // a straw hat skull and crossbones, centred on the skull; ink is the bone colour, hole the colour behind it
  function strawSkull(g, s, ink, hole) {
    g.save(); g.scale(s, s);
    g.strokeStyle = ink; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(-20, -6); g.lineTo(20, 24); g.moveTo(20, -6); g.lineTo(-20, 24); g.stroke();
    g.fillStyle = ink; for (const [x, y] of [[-20, -6], [20, -6], [-20, 24], [20, 24]]) { g.beginPath(); g.arc(x - 2, y, 3.2, 0, TAU); g.arc(x + 2, y, 3.2, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(0, 4, 12.5, 0, TAU); g.fill(); g.fillRect(-7.5, 10, 15, 9);
    g.fillStyle = hole; g.beginPath(); g.ellipse(-4.8, 4, 3.4, 3.8, 0, 0, TAU); g.ellipse(4.8, 4, 3.4, 3.8, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(0, 10, 1.4, 1.8, 0, 0, TAU); g.fill();
    g.fillRect(-6, 15, 12, 1.2); for (let k = -1; k <= 1; k++) g.fillRect(k * 3.3 - .5, 13.5, 1, 5);
    // the straw hat: a wide brim and a round crown with a red band
    g.fillStyle = "#f2c14e"; g.beginPath(); g.ellipse(0, -7, 19, 4.2, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-10, -7); g.quadraticCurveTo(-10, -20, 0, -20); g.quadraticCurveTo(10, -20, 10, -7); g.closePath(); g.fill();
    g.fillStyle = "#c8281e"; g.fillRect(-10, -10.5, 20, 3.2);
    g.restore();
  }
  // a News Coo: a gull in a cap with a satchel of newspapers, flapping across the sunset
  function newsCoo(x, y, f, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = "#2a1a2e"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-11, -f); ctx.quadraticCurveTo(-6, -4 - f / 2, -2, -1); ctx.moveTo(11, -f); ctx.quadraticCurveTo(6, -4 - f / 2, 2, -1); ctx.stroke();
    ctx.fillStyle = "#f1e9de"; ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -2, 2.3, 0, TAU); ctx.fill();
    ctx.fillStyle = "#f2a31c"; ctx.beginPath(); ctx.moveTo(7, -2); ctx.lineTo(10, -1.4); ctx.lineTo(7, -.6); ctx.fill();
    ctx.fillStyle = "#2c4a8a"; ctx.beginPath(); ctx.arc(5, -3.2, 2, Math.PI, 0); ctx.fill(); ctx.fillRect(5, -3.6, 3.2, .9);
    ctx.fillStyle = "#8a5a2b"; ctx.fillRect(-3, 1.6, 4.4, 3.4);
    ctx.fillStyle = "#efe6d0"; ctx.fillRect(-2.4, .8, 3.2, 1.2);
    ctx.restore();
  }
  // a Sea King: every half minute or so a vast serpent rises out of the water, arches its coils, and sinks again
  function seaKing(d, t, a) {
    const cyc = 28000, p = ((t + 9000) % cyc) / cyc, e = p < .12 ? p / .12 : p < .5 ? 1 : p < .62 ? 1 - (p - .5) / .12 : 0;
    if (e <= 0) return;
    const ease = e * e * (3 - 2 * e), y0 = d.horizon + (H - d.horizon) * (d.small ? .4 : .34), x0 = W * (d.small ? .18 : .24), s = Math.max(.7, Math.min(1.25, W / 1200));
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.rect(0, 0, W, y0); ctx.clip();
    ctx.translate(x0, y0 + (1 - ease) * 140 * s); ctx.scale(s, s);
    const sway = Math.sin(t * .0012) * 4;
    const body = ctx.createLinearGradient(0, -150, 0, 0); body.addColorStop(0, "#5b4a86"); body.addColorStop(1, "#2a2350");
    // two coils arching out of the sea behind the neck
    ctx.lineCap = "round";
    for (const [cx, r] of [[110, 26], [175, 18]]) { ctx.strokeStyle = "#2f2858"; ctx.lineWidth = 20 * r / 26; ctx.beginPath(); ctx.arc(cx, 4, r, Math.PI, 0); ctx.stroke();
      ctx.strokeStyle = "rgba(255,170,120,.35)"; ctx.lineWidth = 4 * r / 26; ctx.beginPath(); ctx.arc(cx, 4, r + 6 * r / 26, Math.PI * 1.15, Math.PI * 1.6); ctx.stroke(); }
    // the neck and its dorsal fin
    ctx.strokeStyle = body; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(20, 6); ctx.quadraticCurveTo(-10 + sway, -70, 26 + sway, -128); ctx.stroke();
    ctx.fillStyle = "#c2566e"; ctx.beginPath(); ctx.moveTo(30, -10); for (let k = 0; k <= 6; k++) ctx.lineTo(36 + k * 1.5 + sway * k / 6, -18 - k * 17 + (k % 2 ? -8 : 6)); ctx.lineTo(22 + sway, -118); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,190,140,.4)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(8, 0); ctx.quadraticCurveTo(-22 + sway, -70, 14 + sway, -122); ctx.stroke();
    // the head: a long snout, a glowing eye, a jaw of teeth and a fin crest
    ctx.save(); ctx.translate(26 + sway, -134); ctx.rotate(-.18 + Math.sin(t * .0009) * .05);
    ctx.fillStyle = "#4a3c78"; ctx.beginPath(); ctx.moveTo(-18, 8); ctx.quadraticCurveTo(-20, -18, 8, -20); ctx.quadraticCurveTo(46, -18, 62, -4); ctx.quadraticCurveTo(40, 2, 8, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#3a2f64"; ctx.beginPath(); ctx.moveTo(-14, 8); ctx.quadraticCurveTo(20, 20, 56, 4); ctx.quadraticCurveTo(30, 6, 0, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff4dc"; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(14 + k * 7, 4); ctx.lineTo(17 + k * 7, 10); ctx.lineTo(20 + k * 7, 4); ctx.fill(); }
    ctx.fillStyle = "#c2566e"; ctx.beginPath(); ctx.moveTo(-14, -10); ctx.lineTo(-34, -30); ctx.lineTo(-10, -20); ctx.lineTo(-22, -40); ctx.lineTo(4, -20); ctx.closePath(); ctx.fill();
    const eg = ctx.createRadialGradient(14, -8, 0, 14, -8, 8); eg.addColorStop(0, "#fff7b0"); eg.addColorStop(.5, "#ffc93c"); eg.addColorStop(1, "rgba(255,170,40,0)");
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(14, -8, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = "#1a1030"; ctx.beginPath(); ctx.ellipse(14, -8, 1.2, 3, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.restore();
    // foam where it breaks the surface
    ctx.save(); ctx.globalAlpha = a * ease * .55; ctx.strokeStyle = "#e6f2ff"; ctx.lineWidth = 1.5;
    for (const [fx, fw] of [[20, 26], [110, 34], [175, 24]]) { ctx.beginPath(); ctx.ellipse(x0 + fx * s, y0, (fw + Math.sin(t * .004 + fx) * 3) * s, 3.5 * s, 0, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  function getScene(key) {
    if (!scenes[key]) scenes[key] = key === "sea" ? paintSea() : key === "castle" ? paintCastle() : key === "hall" ? paintHall() : paintCommon(key);
    return scenes[key];
  }
  // small motion on top of each scene
  function animScene(key, t, a) {
    const d = sdata[key]; if (!d || a <= .01) return;
    if (key === "sea") {
      ctx.globalAlpha = a;
      ctx.strokeStyle = "#1c2c48"; ctx.lineWidth = 1.6;
      d.gulls.forEach((gl, i) => { const x = (gl.x + t * .001 * gl.v) % (W + 60) - 30, y = gl.y + Math.sin(t * .0008 + gl.p) * 8, f = Math.sin(t * .008 + gl.p) * 4 * gl.s, w = 9 * gl.s;
        if (i < 2) return newsCoo(x, y, f, gl.s * 1.5);
        ctx.beginPath(); ctx.moveTo(x - w, y - f); ctx.quadraticCurveTo(x - w / 2, y - 3 - f / 2, x, y); ctx.quadraticCurveTo(x + w / 2, y - 3 - f / 2, x + w, y - f); ctx.stroke(); });
      // the sun's glitter on the water
      ctx.globalCompositeOperation = "lighter";
      for (let k = 0; k < 34; k++) { const y = d.horizon + 3 + (k * k) * (H - d.horizon) / 1300, x = d.sunX + Math.sin(t * .0014 + k * 1.9) * (6 + k * 2.6), w = d.sunR * (.5 + k * .06) * (.6 + .4 * Math.sin(t * .003 + k));
        ctx.globalAlpha = a * .55 * (1 - k / 38); ctx.fillStyle = "#ffffff"; ctx.fillRect(x - w / 2, y, w, 1.6); }
      ctx.globalCompositeOperation = "source-over";
      // the ship, sailing slowly across
      const span = W + 520, sx = ((t * .012) % span) - 260, sy = d.horizon + (H - d.horizon) * (d.small ? .1 : .12), sc = Math.max(.45, Math.min(1, W / 1500)) * (d.small ? .7 : 1);
      ctx.globalAlpha = a; ship(sx, sy, sc, t);
      // a Sea King surfaces now and then, nearer than the ship
      seaKing(d, t, a);
      // a straw hat drifting on the swell
      const hx = W + 80 - ((t * .006) % (W + 160)), hy = d.horizon + (H - d.horizon) * .62 + Math.sin(t * .0013) * 4, hs = Math.max(.6, Math.min(1.2, W / 1100));
      ctx.globalAlpha = a; ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.sin(t * .0011) * .08); ctx.scale(hs, hs);
      ctx.fillStyle = "rgba(4,16,30,.35)"; ctx.beginPath(); ctx.ellipse(0, 6, 30, 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "#e9b84a"; ctx.beginPath(); ctx.ellipse(0, 0, 28, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "#f4cd63"; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-14, -18, 0, -18); ctx.quadraticCurveTo(14, -18, 14, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#c8281e"; ctx.fillRect(-14, -5, 28, 4);
      ctx.strokeStyle = "rgba(150,100,30,.5)"; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(0, 0, 21, 5, 0, 0, TAU); ctx.stroke();
      ctx.restore();
      // rolling swell lines in front
      ctx.strokeStyle = "rgba(235,248,255,.2)"; ctx.lineWidth = 1.4;
      for (let k = 0; k < 9; k++) { const y = d.horizon + (H - d.horizon) * (.2 + k * .09), amp = 3 + k * 1.2, off = t * .0006 * (1 + k * .15);
        ctx.globalAlpha = a * (.4 + k * .05); ctx.beginPath(); for (let x = 0; x <= W; x += 18) ctx.lineTo(x, y + Math.sin(x * .012 + off + k) * amp); ctx.stroke(); }
      ctx.globalAlpha = 1; return;
    }
    if (key === "castle") {
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < d.win.length; i += 3) { const [x, y, w, h] = d.win[i], f = .5 + .5 * Math.sin(t * .0013 * (1 + i % 5) + i); ctx.globalAlpha = a * f * .45; ctx.fillStyle = "#ffd88a"; ctx.fillRect(x - w * .6, y - h * .3, w * 2.2, h * 1.6); }
      // the moon's path and ripples on the lake
      for (let k = 0; k < 26; k++) { const y = d.horizon + 6 + (k * k) * (H - d.horizon) / 700, x = W * (W < 600 ? .78 : .66) + Math.sin(t * .0012 + k * 1.7) * (8 + k * 2.2), w = 10 + k * 3.2;
        ctx.globalAlpha = a * .35 * (1 - k / 30); ctx.fillStyle = "#d8def5"; ctx.fillRect(x - w / 2, y, w, 1.2); }
      ctx.globalCompositeOperation = "source-over";
      // smoke curling from Hagrid's chimney
      const [cx0, cy0] = d.chimney;
      for (let k = 0; k < 6; k++) { const p = ((t * .00012 + k / 6) % 1); ctx.globalAlpha = a * .18 * (1 - p); ctx.fillStyle = "#9aa0b4"; ctx.beginPath(); ctx.arc(cx0 + Math.sin(p * 6 + k) * 6 + p * 20, cy0 - p * 70, 4 + p * 14, 0, TAU); ctx.fill(); }
    }
    if (key === "hall") {
      for (const [x, y] of d.torches) { const fl = 1 + Math.sin(t * .013 + x) * .15 + Math.sin(t * .029 + y) * .08;
        const gl = ctx.createRadialGradient(x, y - 6, 0, x, y - 6, 60); gl.addColorStop(0, `rgba(255,170,70,${.35 * a})`); gl.addColorStop(1, "rgba(255,170,70,0)"); ctx.globalAlpha = 1; ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y - 6, 60, 0, TAU); ctx.fill();
        ctx.globalAlpha = a; ctx.fillStyle = "#ff9a3a"; ctx.beginPath(); ctx.ellipse(x, y - 8 * fl, 5, 12 * fl, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#ffe6a6"; ctx.beginPath(); ctx.ellipse(x, y - 5, 2.2, 6, 0, 0, TAU); ctx.fill(); }
    }
    if (key === "gryffindor" && d.fire) {
      const [x, y, w] = d.fire;
      const gl = ctx.createRadialGradient(x, y, 0, x, y, w * 1.2); gl.addColorStop(0, `rgba(255,150,60,${.4 * a})`); gl.addColorStop(1, "rgba(255,90,30,0)");
      ctx.globalAlpha = 1; ctx.fillStyle = gl; ctx.fillRect(x - w * 1.2, y - w * 1.2, w * 2.4, w * 1.2);
      ctx.globalCompositeOperation = "lighter";
      for (let k = 0; k < 9; k++) { const fx = x + (k - 4) * w / 10, h = (40 + (k % 3) * 22) * (1 + .25 * Math.sin(t * .012 + k * 1.3)), sway = Math.sin(t * .008 + k) * 6;
        ctx.globalAlpha = a * .8; ctx.fillStyle = k % 2 ? "#ff7a26" : "#ffb347";
        ctx.beginPath(); ctx.moveTo(fx - 14, y); ctx.quadraticCurveTo(fx - 10 + sway, y - h * .6, fx + sway * 1.6, y - h); ctx.quadraticCurveTo(fx + 10 + sway, y - h * .6, fx + 14, y); ctx.closePath(); ctx.fill(); }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = a; ctx.fillStyle = "#2a1408"; ctx.fillRect(x - w * .4, y - 8, w * .8, 8);
    }
    if ((key === "slytherin" || key === "hufflepuff") && d.lamps) {
      const colr = key === "slytherin" ? "120,255,170" : "255,190,90";
      for (const [x, y] of d.lamps) { const f = .75 + .25 * Math.sin(t * .004 + x);
        const gl = ctx.createRadialGradient(x, y, 0, x, y, 70); gl.addColorStop(0, `rgba(${colr},${.32 * a * f})`); gl.addColorStop(1, `rgba(${colr},0)`);
        ctx.globalAlpha = 1; ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 70, 0, TAU); ctx.fill(); ctx.globalAlpha = a; ctx.fillStyle = `rgb(${colr})`; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); }
    }
    if (key === "ravenclaw" && d.stars) {
      ctx.globalCompositeOperation = "lighter";
      for (const [x, y, r, p] of d.stars) { const f = .5 + .5 * Math.sin(t * .002 + p); ctx.globalAlpha = a * f * .4; ctx.fillStyle = "#ffe0a0"; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, TAU); ctx.fill(); }
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.globalAlpha = 1;
  }
  function drawScenes(t, dt) {
    const key = sceneKey();
    if (key !== curScene) { prevScene = curScene; curScene = key; sceneMix = prevScene ? 0 : 1; }
    sceneMix = Math.min(1, sceneMix + (dt ? dt / 900 : 1));
    if (prevScene && sceneMix < 1) { ctx.globalAlpha = 1 - sceneMix; ctx.drawImage(getScene(prevScene), 0, 0, W, H); animScene(prevScene, t, 1 - sceneMix); }
    ctx.globalAlpha = sceneMix; ctx.drawImage(getScene(curScene), 0, 0, W, H); animScene(curScene, t, sceneMix);
    ctx.globalAlpha = 1;
  }

  function draw(t, dt) {
    readColours(t);
    if (bg) ctx.drawImage(bg, 0, 0, W, H);
    // a few bright stars that scintillate
    for (const s of bright) {
      const a = .45 + .4 * Math.sin(t * .0016 * s.s + s.p) * Math.sin(t * .0007 * s.s + s.p * 2);
      ctx.globalAlpha = Math.max(.15, a);
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.2);
      g.addColorStop(0, s.warm ? "rgba(255,226,190,1)" : "rgba(235,242,255,1)"); g.addColorStop(.3, s.warm ? "rgba(255,226,190,.35)" : "rgba(235,242,255,.35)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3.2, 0, TAU); ctx.fill();
    }
    if (dt && !shoot && (nextShoot -= dt) < 0) { shoot = { x: rnd() * W * .7, y: rnd() * H * .3, life: 0 }; nextShoot = 12000 + rnd() * 15000; }
    if (shoot) {
      shoot.life += dt; const k = shoot.life / 700;
      if (k >= 1) shoot = null;
      else {
        const x = shoot.x + k * 300, y = shoot.y + k * 120, g = ctx.createLinearGradient(x - 110, y - 44, x, y);
        g.addColorStop(0, "rgba(255,250,235,0)"); g.addColorStop(1, "rgba(255,250,235,.8)");
        ctx.globalAlpha = Math.sin(k * Math.PI); ctx.strokeStyle = g; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x - 110, y - 44); ctx.lineTo(x, y); ctx.stroke();
      }
    }
    for (const c of clouds) {
      c.x += c.v * dt / 1000; if (c.x - c.w / 2 > W) c.x = -c.w / 2;
      ctx.globalAlpha = c.a; ctx.drawImage(c.s, c.x - c.w / 2, c.y, c.w, c.w * .4);
    }
    ctx.globalAlpha = 1;
    for (const f of flyers) {
      if (f.wait > 0) { f.wait -= dt; continue; }
      f.x += f.dir * f.v * dt / 1000;
      if ((f.dir > 0 && f.x > W + 100) || (f.dir < 0 && f.x < -100)) Object.assign(f, newFlyer(false));
    }
    const atSea = curScene === "sea";
    if (!atSea) for (const f of flyers) if (f.far && f.wait <= 0) rider(f, t);
    ctx.globalAlpha = 1;
    drawScenes(t, dt);
    const want = curScene === "hall" ? 1 : 0;
    candleAlpha += (want - candleAlpha) * (dt ? Math.min(1, dt / 400) : 1);
    if (candleAlpha > .02) { ctx.globalAlpha = candleAlpha; for (const cd of candles) candle(cd, t); ctx.globalAlpha = 1; }
    if (!atSea) { for (const f of flyers) if (!f.far && f.wait <= 0) rider(f, t); drawAtmos(t, dt); }
    if (dt) moveSnitch(dt, t);
    if (!atSea) drawSnitch(t);
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return;
    const dt = last ? Math.min(now - last, 100) : 0;
    last = now;
    draw(now, dt);
  }
  function start() { cancelAnimationFrame(raf); last = 0; if (!document.hidden && !still.matches) raf = requestAnimationFrame(frame); else draw(performance.now(), 0); }

  addEventListener("resize", () => { clearTimeout(resize.h); resize.h = setTimeout(resize, 150); });
  document.addEventListener("visibilitychange", () => document.hidden ? cancelAnimationFrame(raf) : start());
  if (still.addEventListener) still.addEventListener("change", start);
  // Hold a still frame through a house change so reduced-motion screens still pick up the new colours.
  new MutationObserver(() => { if (still.matches) setTimeout(() => { readColours(performance.now(), true); draw(performance.now(), 0); }, 950); }).observe(root, { attributes: true, attributeFilter: ["data-house", "data-game"] });
  resize();
  start();
})();
