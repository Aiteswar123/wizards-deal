/* The sky behind every screen: a Quidditch match at night. Stars and drifting cloud, a stadium of house towers with
   waving pennants and goal hoops along the horizon, players flying past on broomsticks, and the Golden Snitch darting about.
   It takes its light from the page's house colours (--stand, --board, --crest), so it changes with the sorting.
   Runs at about 30fps, stops while the tab is hidden, and holds one still frame for reduced motion. */
(function () {
  "use strict";
  const cv = document.createElement("canvas");
  cv.id = "sky"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const still = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  const root = document.documentElement;
  const HOUSE = [["#ae0001", "#eeba30"], ["#ecb939", "#2b2420"], ["#2a4fb0", "#c48a4b"], ["#1f6b40", "#c0c7cf"]];
  const rnd = Math.random;
  let W = 0, H = 0, dpr = 1, stars = [], clouds = [], towers = [], flyers = [], snitch = null, cloudSprite = null;
  let col = { stand: "#17132b", board: "#0b0916", crest: "#d8b25a" }, lastCol = 0, last = 0, raf = 0, shoot = null, nextShoot = 7000;

  function readColours(now) {
    if (now - lastCol < 200) return;
    lastCol = now;
    const cs = getComputedStyle(root);
    col.stand = cs.getPropertyValue("--stand").trim() || col.stand;
    col.board = cs.getPropertyValue("--board").trim() || col.board;
    col.crest = cs.getPropertyValue("--crest").trim() || col.crest;
  }

  function makeCloud() {
    const c = document.createElement("canvas"); c.width = 256; c.height = 128;
    const g = c.getContext("2d");
    for (let i = 0; i < 9; i++) {
      const x = 40 + rnd() * 176, y = 50 + rnd() * 30, r = 26 + rnd() * 34, rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, "rgba(255,255,255,.5)"); rg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    return c;
  }

  function newFlyer(first) {
    const far = rnd() < .45, s = far ? .45 + rnd() * .3 : .85 + rnd() * .55, dir = rnd() < .5 ? 1 : -1;
    return { s, dir, far, house: HOUSE[Math.floor(rnd() * 4)], p: rnd() * 6.28, amp: 10 + rnd() * 26,
      y0: H * (.08 + rnd() * .5), x: first ? rnd() * W : (dir > 0 ? -80 : W + 80), v: (far ? 45 : 95) + rnd() * 70, wait: first ? 0 : rnd() * 4000 };
  }

  function seed() {
    const n = Math.min(240, Math.round(W * H / 7500));
    stars = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H * .8, r: rnd() * 1.1 + .35, p: rnd() * 6.28, s: .5 + rnd() * 1.8 }));
    clouds = Array.from({ length: W < 600 ? 3 : 6 }, () => ({ x: rnd() * W, y: H * (.04 + rnd() * .5), w: W * (.35 + rnd() * .45), v: 3 + rnd() * 7, a: .04 + rnd() * .06 }));
    // the stadium: a row of towers of varying height, each with a house roof, canopy and pennant
    const unit = W < 600 ? 34 : 48, count = Math.ceil(W / unit) + 1;
    towers = Array.from({ length: count }, (_, i) => ({ x: i * unit + (rnd() - .5) * unit * .25, w: unit * (.62 + rnd() * .2), h: (W < 600 ? 46 : 70) + rnd() * (W < 600 ? 40 : 70),
      house: HOUSE[i % 4], p: rnd() * 6.28, lit: Array.from({ length: 3 }, () => rnd() < .55) }));
    flyers = Array.from({ length: W < 600 ? 2 : 4 }, () => newFlyer(true));
    snitch = { x: W * .6, y: H * .3, vx: 0, vy: 0, tx: W * .5, ty: H * .25, next: 0, trail: [] };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    draw(performance.now(), 0);
  }

  function stadium(t) {
    const base = H + 2;
    ctx.globalAlpha = 1; ctx.fillStyle = "rgba(4,4,10,.55)";
    ctx.fillRect(0, base - (W < 600 ? 34 : 50), W, 60);
    for (const tw of towers) {
      const top = base - tw.h, [roof, trim] = tw.house;
      const g = ctx.createLinearGradient(0, top, 0, base);
      g.addColorStop(0, "#1c1626"); g.addColorStop(1, "#08070d");
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(tw.x, top, tw.w, tw.h);
      ctx.fillStyle = roof; ctx.globalAlpha = .9; ctx.fillRect(tw.x, top, tw.w, 6);
      ctx.fillStyle = trim; ctx.globalAlpha = .7; ctx.fillRect(tw.x, top + 6, tw.w, 2);
      ctx.globalAlpha = .55; ctx.fillStyle = "#ffcf7a";
      tw.lit.forEach((on, k) => { if (on) ctx.fillRect(tw.x + 4 + k * (tw.w - 8) / 3, top + 14, (tw.w - 8) / 3 - 3, 5); });
      ctx.globalAlpha = .95; ctx.fillStyle = roof;
      ctx.beginPath(); ctx.moveTo(tw.x - 3, top); ctx.lineTo(tw.x + tw.w / 2, top - tw.w * .9); ctx.lineTo(tw.x + tw.w + 3, top); ctx.closePath(); ctx.fill();
      const px = tw.x + tw.w / 2, py = top - tw.w * .9, wave = Math.sin(t * .004 + tw.p) * 3;
      ctx.globalAlpha = 1; ctx.strokeStyle = "#2a2333"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 14); ctx.stroke();
      ctx.fillStyle = trim;
      ctx.beginPath(); ctx.moveTo(px, py - 14); ctx.quadraticCurveTo(px + 7, py - 13 + wave, px + 15, py - 10 + wave); ctx.lineTo(px, py - 7); ctx.closePath(); ctx.fill();
    }
    // goal hoops at each end of the pitch
    const hoopSet = (cx, s) => {
      [[-22, 1.25], [0, 1.6], [22, 1.05]].forEach(([dx, hk]) => {
        const x = cx + dx * s, top = base - H * .2 * hk * s, r = 9 * s;
        ctx.globalAlpha = .9; ctx.strokeStyle = "#d9b45a"; ctx.lineWidth = 2.2 * s;
        ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, top + r); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, top, r, 0, Math.PI * 2); ctx.stroke();
      });
    };
    const hs = W < 600 ? .7 : 1;
    hoopSet(W * .12, hs); hoopSet(W * .88, hs);
    ctx.globalAlpha = 1;
  }

  function rider(f, t) {
    const y = f.y0 + Math.sin(f.x * .006 + f.p) * f.amp, [robe, trim] = f.house, fl = Math.sin(t * .014 + f.p) * 3;
    ctx.save();
    ctx.globalAlpha = f.far ? .5 : .92;
    ctx.translate(f.x, y); ctx.scale(f.dir * f.s, f.s); ctx.rotate(-.08 + Math.sin(t * .003 + f.p) * .06);
    ctx.strokeStyle = "#7a5330"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-26, 5); ctx.lineTo(24, 0); ctx.stroke();
    ctx.fillStyle = "#c39553";
    ctx.beginPath(); ctx.moveTo(-24, 4); ctx.lineTo(-42, -3); ctx.lineTo(-44, 7); ctx.lineTo(-39, 13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = robe;
    ctx.beginPath(); ctx.moveTo(1, -15); ctx.quadraticCurveTo(-16, -12 + fl, -32, -5 + fl); ctx.lineTo(-12, 3); ctx.lineTo(6, 1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-6, -11 + fl * .5); ctx.quadraticCurveTo(-18, -9 + fl, -30, -4 + fl); ctx.stroke();
    ctx.fillStyle = "#17121f";
    ctx.beginPath(); ctx.ellipse(1, -7, 5, 8.5, -.55, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#17121f"; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-7, 7); ctx.lineTo(-2, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -9); ctx.lineTo(13, 1); ctx.stroke();
    ctx.fillStyle = "#e6c39d";
    ctx.beginPath(); ctx.arc(6, -17, 3.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function moveSnitch(dt, t) {
    const sn = snitch;
    if (t > sn.next) { sn.tx = W * (.1 + rnd() * .8); sn.ty = H * (.08 + rnd() * .55); sn.next = t + 500 + rnd() * 1300; }
    // steer toward the target at about 380px/s, easing the turn so it darts rather than teleports
    const dx = sn.tx - sn.x, dy = sn.ty - sn.y, d = Math.hypot(dx, dy) || 1, sp = Math.min(380, d * 3);
    const k = Math.min(1, dt / 220);
    sn.vx += (dx / d * sp - sn.vx) * k; sn.vy += (dy / d * sp - sn.vy) * k;
    sn.x += sn.vx * dt / 1000; sn.y += sn.vy * dt / 1000;
    sn.trail.push([sn.x, sn.y]); if (sn.trail.length > 14) sn.trail.shift();
  }
  function drawSnitch(t) {
    const sn = snitch;
    ctx.strokeStyle = "#ffd76a"; ctx.lineWidth = 1.4;
    for (let i = 1; i < sn.trail.length; i++) {
      ctx.globalAlpha = i / sn.trail.length * .35;
      ctx.beginPath(); ctx.moveTo(sn.trail[i - 1][0], sn.trail[i - 1][1]); ctx.lineTo(sn.trail[i][0], sn.trail[i][1]); ctx.stroke();
    }
    const glow = ctx.createRadialGradient(sn.x, sn.y, 0, sn.x, sn.y, 16);
    glow.addColorStop(0, "rgba(255,215,106,.45)"); glow.addColorStop(1, "rgba(255,215,106,0)");
    ctx.globalAlpha = 1; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sn.x, sn.y, 16, 0, Math.PI * 2); ctx.fill();
    const wingH = 2 + Math.abs(Math.sin(t * .05)) * 5;
    ctx.fillStyle = "rgba(245,242,230,.85)";
    ctx.beginPath(); ctx.ellipse(sn.x - 7, sn.y - 2, 7, wingH, -.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sn.x + 7, sn.y - 2, 7, wingH, .35, 0, Math.PI * 2); ctx.fill();
    const ball = ctx.createRadialGradient(sn.x - 1, sn.y - 1, 0, sn.x, sn.y, 3.6);
    ball.addColorStop(0, "#fff3c2"); ball.addColorStop(1, "#d9a425");
    ctx.fillStyle = ball; ctx.beginPath(); ctx.arc(sn.x, sn.y, 3.6, 0, Math.PI * 2); ctx.fill();
  }

  function draw(t, dt) {
    readColours(t);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, col.board); sky.addColorStop(.75, col.stand); sky.addColorStop(1, col.stand);
    ctx.globalAlpha = 1; ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // floodlight and house light rising from the pitch
    const pool = ctx.createRadialGradient(W / 2, H * 1.05, 0, W / 2, H * 1.05, Math.max(W, H) * .8);
    pool.addColorStop(0, col.crest); pool.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = .14; ctx.fillStyle = pool; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff6df";
    for (const s of stars) {
      ctx.globalAlpha = .22 + .5 * (.5 + .5 * Math.sin(t * .001 * s.s + s.p));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    if (dt && !shoot && (nextShoot -= dt) < 0) { shoot = { x: rnd() * W * .7, y: rnd() * H * .3, life: 0 }; nextShoot = 9000 + rnd() * 12000; }
    if (shoot) {
      shoot.life += dt; const k = shoot.life / 900;
      if (k >= 1) shoot = null;
      else {
        const x = shoot.x + k * 260, y = shoot.y + k * 110, g = ctx.createLinearGradient(x - 90, y - 38, x, y);
        g.addColorStop(0, "rgba(255,246,220,0)"); g.addColorStop(1, "rgba(255,246,220,.9)");
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(x - 90, y - 38); ctx.lineTo(x, y); ctx.stroke();
      }
    }
    cloudSprite = cloudSprite || makeCloud();
    for (const c of clouds) {
      c.x += c.v * dt / 1000; if (c.x - c.w / 2 > W) c.x = -c.w / 2;
      ctx.globalAlpha = c.a; ctx.drawImage(cloudSprite, c.x - c.w / 2, c.y, c.w, c.w / 2);
    }
    for (const f of flyers) {
      if (f.wait > 0) { f.wait -= dt; continue; }
      f.x += f.dir * f.v * dt / 1000;
      if ((f.dir > 0 && f.x > W + 90) || (f.dir < 0 && f.x < -90)) Object.assign(f, newFlyer(false));
    }
    // far riders fly behind the stadium, near riders in front of it
    for (const f of flyers) if (f.far && f.wait <= 0) rider(f, t);
    stadium(t);
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
  new MutationObserver(() => { if (still.matches) setTimeout(() => draw(performance.now() + 1000, 0), 950); }).observe(root, { attributes: true, attributeFilter: ["data-house"] });
  resize();
  start();
})();
