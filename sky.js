/* The sky behind every screen: the enchanted ceiling of the Great Hall, drawn for realism rather than cartoon.
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
      ctx.globalAlpha = .22 * a; ctx.fillStyle = "#0e5a3a"; ctx.fillRect(0, 0, W, H);
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
      ctx.globalAlpha = .12 * a; ctx.fillStyle = "#1d3fa8"; ctx.fillRect(0, 0, W, H);
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
      ctx.globalAlpha = .1 * a; ctx.fillStyle = "#b8860b"; ctx.fillRect(0, 0, W, H);
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
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    colKey = ""; seed(); seedCandles(); seedAtmos(); paintStadium(); readColours(performance.now(), true);
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
    for (const f of flyers) if (f.far && f.wait <= 0) rider(f, t);
    ctx.globalAlpha = 1;
    if (stad) ctx.drawImage(stad, 0, 0, W, H);
    const want = root.dataset.screen === "game" ? 0 : 1;
    candleAlpha += (want - candleAlpha) * (dt ? Math.min(1, dt / 400) : 1);
    if (candleAlpha > .02) { ctx.globalAlpha = candleAlpha; for (const cd of candles) candle(cd, t); ctx.globalAlpha = 1; }
    for (const f of flyers) if (!f.far && f.wait <= 0) rider(f, t);
    drawAtmos(t, dt);
    if (dt) moveSnitch(dt, t);
    drawSnitch(t);
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
  new MutationObserver(() => { if (still.matches) setTimeout(() => { readColours(performance.now(), true); draw(performance.now(), 0); }, 950); }).observe(root, { attributes: true, attributeFilter: ["data-house"] });
  resize();
  start();
})();
