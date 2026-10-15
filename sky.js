/* The enchanted ceiling: a night sky of drifting cloud, twinkling stars and floating candles behind every screen.
   It takes its light from the page's house colours (--stand, --board, --crest), so it fades with the sorting.
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
  let W = 0, H = 0, dpr = 1, stars = [], clouds = [], candles = [], cloudSprite = null;
  let col = { stand: "#17132b", board: "#0b0916", crest: "#d8b25a" }, candleAlpha = 1, lastCol = 0, last = 0, raf = 0, shoot = null, nextShoot = 6000;

  function readColours(now) {
    if (now - lastCol < 200) return;
    lastCol = now;
    const cs = getComputedStyle(root);
    col.stand = cs.getPropertyValue("--stand").trim() || col.stand;
    col.board = cs.getPropertyValue("--board").trim() || col.board;
    col.crest = cs.getPropertyValue("--crest").trim() || col.crest;
  }

  // One soft cloud, drawn once and reused at different sizes.
  function makeCloud() {
    const c = document.createElement("canvas"); c.width = 256; c.height = 128;
    const g = c.getContext("2d");
    for (let i = 0; i < 9; i++) {
      const x = 40 + Math.random() * 176, y = 50 + Math.random() * 30, r = 26 + Math.random() * 34;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, "rgba(255,255,255,.55)"); rg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    return c;
  }

  function seed() {
    const rnd = Math.random;
    const n = Math.min(260, Math.round(W * H / 7000));
    stars = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H * .92, r: rnd() * 1.1 + .35, p: rnd() * 6.28, s: .5 + rnd() * 1.8 }));
    clouds = Array.from({ length: W < 600 ? 4 : 7 }, () => ({ x: rnd() * W, y: H * (.04 + rnd() * .62), w: W * (.35 + rnd() * .45), v: 3 + rnd() * 7, a: .05 + rnd() * .07 }));
    // Candles float in the upper ceiling, clear of the title column on wide screens.
    const nc = W < 600 ? 5 : 10;
    candles = Array.from({ length: nc }, (_, i) => {
      let x = (i + .5) / nc * W + (rnd() - .5) * W / nc * .6;
      if (W >= 860 && x < W * .42) x = W * .42 + rnd() * W * .55;
      return { x, y: 24 + rnd() * Math.min(H * (W < 600 ? .1 : .32), W < 600 ? 70 : 300), s: .65 + rnd() * .55, p: rnd() * 6.28 };
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    draw(performance.now(), 0);
  }

  function candle(c, t) {
    const s = c.s, x = c.x, y = c.y + Math.sin(t * .00055 + c.p) * 7 * s;
    const fl = 1 + Math.sin(t * .011 + c.p * 3) * .12 + Math.sin(t * .023 + c.p) * .06;
    const glow = ctx.createRadialGradient(x, y - 2 * s, 0, x, y - 2 * s, 30 * s);
    glow.addColorStop(0, "rgba(255,206,120,.30)"); glow.addColorStop(1, "rgba(255,206,120,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y - 2 * s, 30 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffbf45";
    ctx.beginPath(); ctx.ellipse(x, y - 4 * s * fl, 2.3 * s, 5.2 * s * fl, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff4d0";
    ctx.beginPath(); ctx.ellipse(x, y - 2.6 * s, 1 * s, 2.4 * s, 0, 0, Math.PI * 2); ctx.fill();
    const body = ctx.createLinearGradient(x - 3.5 * s, 0, x + 3.5 * s, 0);
    body.addColorStop(0, "#f7efd9"); body.addColorStop(.6, "#e9dcbc"); body.addColorStop(1, "#c9b991");
    ctx.fillStyle = body;
    ctx.fillRect(x - 3.5 * s, y + 1.5 * s, 7 * s, 30 * s);
  }

  function draw(t, dt) {
    readColours(t);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, col.board); sky.addColorStop(.7, col.stand); sky.addColorStop(1, col.stand);
    ctx.globalAlpha = 1; ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // house-coloured light pooling at the top
    const pool = ctx.createRadialGradient(W / 2, -H * .15, 0, W / 2, -H * .15, Math.max(W, H) * .75);
    pool.addColorStop(0, col.crest); pool.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = .16; ctx.fillStyle = pool; ctx.fillRect(0, 0, W, H);
    // stars
    ctx.fillStyle = "#fff6df";
    for (const s of stars) {
      ctx.globalAlpha = .25 + .55 * (.5 + .5 * Math.sin(t * .001 * s.s + s.p));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    // shooting star, now and then
    if (dt && !shoot && (nextShoot -= dt) < 0) { shoot = { x: Math.random() * W * .7, y: Math.random() * H * .35, life: 0 }; nextShoot = 9000 + Math.random() * 12000; }
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
    // drifting cloud, lit by the house colour
    cloudSprite = cloudSprite || makeCloud();
    for (const c of clouds) {
      c.x += c.v * dt / 1000; if (c.x - c.w / 2 > W) c.x = -c.w / 2;
      ctx.globalAlpha = c.a; ctx.drawImage(cloudSprite, c.x - c.w / 2, c.y, c.w, c.w / 2);
    }
    const want = root.dataset.screen === "game" ? 0 : 1;
    candleAlpha += (want - candleAlpha) * (dt ? Math.min(1, dt / 400) : 1);
    if (candleAlpha > .02) { ctx.globalAlpha = candleAlpha; for (const c of candles) candle(c, t); }
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
