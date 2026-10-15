/* The sky behind every screen: a Quidditch match at night, drawn for realism rather than cartoon.
   A deep starfield with the Milky Way and a cratered moon, soft moonlit cloud, a stadium in silhouette lit by floodlight
   beams through haze with shaded house banners, backlit riders on broomsticks with motion blur, and the Golden Snitch.
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

  // Stadium: silhouetted stands and towers, shaded hanging banners, lit box windows, floodlight masts and haze.
  function paintStadium() {
    const [c, g] = layer();
    const base = H, small = W < 600, standH = small ? 30 : 46;
    const sg = g.createLinearGradient(0, base - standH - 30, 0, base);
    sg.addColorStop(0, "rgba(8,8,14,.0)"); sg.addColorStop(.4, "rgba(8,8,14,.85)"); sg.addColorStop(1, "#040407");
    g.fillStyle = sg; g.fillRect(0, base - standH - 30, W, standH + 30);
    const unit = small ? 40 : 58, count = Math.ceil(W / unit) + 1;
    for (let i = 0; i < count; i++) {
      const w = unit * (.58 + rnd() * .18), x = i * unit + (rnd() - .5) * unit * .2, h = (small ? 50 : 78) + rnd() * (small ? 44 : 80), top = base - h;
      const tg = g.createLinearGradient(x, 0, x + w, 0);
      tg.addColorStop(0, "#0b0a12"); tg.addColorStop(.5, "#13111c"); tg.addColorStop(1, "#08070d");
      g.fillStyle = tg; g.fillRect(x, top, w, h);
      // a conical roof, dark, with a thin rim of floodlight on one edge
      g.fillStyle = "#0c0b13"; g.beginPath(); g.moveTo(x - 2, top); g.lineTo(x + w / 2, top - w * .85); g.lineTo(x + w + 2, top); g.closePath(); g.fill();
      g.strokeStyle = "rgba(255,236,200,.18)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x + w / 2, top - w * .85); g.lineTo(x + w + 2, top); g.stroke();
      // a hanging house banner, shaded like cloth, with a notched hem
      const bc = BANNERS[i % 4], bw = w * .62, bx = x + (w - bw) / 2, by = top + 6, bh = Math.min(h * .55, w * 1.3);
      const cg = g.createLinearGradient(bx, 0, bx + bw, 0);
      cg.addColorStop(0, "rgba(0,0,0,.55)"); cg.addColorStop(.35, "rgba(0,0,0,0)"); cg.addColorStop(.7, "rgba(255,255,255,.08)"); cg.addColorStop(1, "rgba(0,0,0,.5)");
      g.fillStyle = bc; g.globalAlpha = .75;
      g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + bw, by); g.lineTo(bx + bw, by + bh); g.lineTo(bx + bw / 2, by + bh - bw * .35); g.lineTo(bx, by + bh); g.closePath(); g.fill();
      g.globalAlpha = 1; g.fillStyle = cg; g.fill();
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(x, top, w, 3);
      // lit box seats
      for (let k = 0; k < 3; k++) if (rnd() < .5) { g.fillStyle = `rgba(255,${190 + rnd() * 40 | 0},120,${.35 + rnd() * .3})`; g.fillRect(x + 3 + k * (w - 6) / 3, base - h * .28, (w - 6) / 3 - 2, 3); }
    }
    // floodlight masts
    lamps = [.18, .39, .61, .82].map(f => ({ x: W * f + (rnd() - .5) * 20, y: base - (small ? 150 : 230) - rnd() * 30 }));
    lamps.forEach(l => {
      g.strokeStyle = "#0d0c14"; g.lineWidth = small ? 2 : 3; g.beginPath(); g.moveTo(l.x, base); g.lineTo(l.x, l.y); g.stroke();
      g.fillStyle = "#14121c"; g.fillRect(l.x - 12, l.y - 4, 24, 8);
      for (let k = 0; k < 4; k++) { g.fillStyle = "#fffbe9"; g.fillRect(l.x - 10 + k * 5.4, l.y - 2, 3.6, 3.6); }
    });
    // goal hoops: thin metal rings on tall posts, catching the light
    const hoopSet = (cx, s) => [[-22, 1.2], [0, 1.55], [22, 1.0]].forEach(([dx, hk]) => {
      const x = cx + dx * s, topY = base - H * .2 * hk * s, r = 9 * s;
      g.strokeStyle = "#2a241a"; g.lineWidth = 2.4 * s; g.beginPath(); g.moveTo(x, base); g.lineTo(x, topY + r); g.stroke();
      g.beginPath(); g.arc(x, topY, r, 0, TAU); g.stroke();
      g.strokeStyle = "rgba(240,206,120,.55)"; g.lineWidth = 1 * s; g.beginPath(); g.arc(x, topY, r, -2.2, -.6); g.stroke();
      g.beginPath(); g.moveTo(x + 1, topY + r); g.lineTo(x + 1, base); g.stroke();
    });
    hoopSet(W * .1, small ? .7 : 1); hoopSet(W * .9, small ? .7 : 1);
    // ground haze
    const hz = g.createLinearGradient(0, base - standH * 2.2, 0, base);
    hz.addColorStop(0, "rgba(200,205,225,0)"); hz.addColorStop(.6, "rgba(200,205,225,.05)"); hz.addColorStop(1, "rgba(200,205,225,.09)");
    g.fillStyle = hz; g.fillRect(0, base - standH * 2.2, W, standH * 2.2);
    stad = c;
  }

  function newFlyer(first) {
    const far = rnd() < .5, s = far ? .35 + rnd() * .25 : .8 + rnd() * .5, dir = rnd() < .5 ? 1 : -1;
    return { s, dir, far, tint: BANNERS[Math.floor(rnd() * 4)], p: rnd() * TAU, amp: 8 + rnd() * 22,
      y0: H * (.12 + rnd() * .45), x: first ? rnd() * W : (dir > 0 ? -90 : W + 90), v: (far ? 40 : 110) + rnd() * 80, wait: first ? 0 : 1500 + rnd() * 5000 };
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
    colKey = ""; seed(); paintStadium(); readColours(performance.now(), true);
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
  function riderShape(fl) {
    ctx.beginPath();
    ctx.moveTo(26, -1); ctx.lineTo(-22, 3); ctx.lineTo(-44, -2); ctx.lineTo(-47, 6); ctx.lineTo(-40, 12); ctx.lineTo(-22, 6); ctx.lineTo(26, 1.5); ctx.closePath();   // broom
    ctx.moveTo(9, -18); ctx.bezierCurveTo(12, -22, 4, -26, 2, -21);                                   // head
    ctx.bezierCurveTo(-2, -18, -4, -14, -6, -10);
    ctx.bezierCurveTo(-16, -10 + fl, -28, -4 + fl, -36, 2 + fl);                                      // cloak streaming
    ctx.bezierCurveTo(-26, 2, -16, 4, -9, 3);
    ctx.lineTo(-6, 9); ctx.lineTo(0, 11); ctx.lineTo(-1, 3);                                           // leg
    ctx.lineTo(13, 1); ctx.lineTo(14, -2); ctx.lineTo(4, -9);                                          // arm to the handle
    ctx.bezierCurveTo(7, -13, 9, -15, 9, -18); ctx.closePath();
  }
  function rider(f, t) {
    const y = f.y0 + Math.sin(f.x * .005 + f.p) * f.amp, fl = Math.sin(t * .016 + f.p) * 3.2;
    for (let k = 2; k >= 0; k--) {
      ctx.save();
      ctx.translate(f.x - f.dir * k * 7 * f.s, y); ctx.scale(f.dir * f.s, f.s); ctx.rotate(-.06 + Math.sin(t * .003 + f.p) * .05);
      riderShape(fl);
      ctx.globalAlpha = (f.far ? .55 : .95) * (k ? .12 / k : 1);
      ctx.fillStyle = k ? "#0a0910" : f.tint; ctx.fill();
      if (!k) {
        ctx.globalAlpha = f.far ? .55 : .9; ctx.fillStyle = "rgba(6,5,10,.7)"; ctx.fill();                // shade the tint down to a lit silhouette
        ctx.globalAlpha = f.far ? .25 : .45; ctx.strokeStyle = "rgba(255,240,210,.9)"; ctx.lineWidth = .9 / f.s;
        ctx.beginPath(); ctx.moveTo(-36, 2 + fl); ctx.bezierCurveTo(-28, -4 + fl, -16, -10 + fl, -6, -10); ctx.bezierCurveTo(-4, -14, -2, -18, 2, -21); ctx.bezierCurveTo(4, -26, 12, -22, 9, -18); ctx.stroke();
      }
      ctx.restore();
    }
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
    beams(t);
    for (const f of flyers) if (f.far && f.wait <= 0) rider(f, t);
    ctx.globalAlpha = 1;
    if (stad) ctx.drawImage(stad, 0, 0, W, H);
    for (const f of flyers) if (!f.far && f.wait <= 0) rider(f, t);
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
