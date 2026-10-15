/* Spell cut-in: a slanted panel bursts across the screen with the caster's character,
   their colour and the spell they shouted. Plays once per cast on every player's screen. */
(function () {
  "use strict";
  const E = window.Engine;
  const LOOK = {
    harry:    { c: "#c8282e", c2: "#eeba30", hair: "#1c1612", skin: "#ecc9a6" },
    hermione: { c: "#b3202a", c2: "#eeba30", hair: "#6b4423", skin: "#e9c4a0" },
    draco:    { c: "#2a9d5c", c2: "#c0c7cf", hair: "#ece4c4", skin: "#f1d8c4" },
    luna:     { c: "#3a64c8", c2: "#c48a4b", hair: "#f0dc9a", skin: "#f0d6c0" },
    cedric:   { c: "#ecb939", c2: "#2b2420", hair: "#5a3a22", skin: "#e6c09c" }
  };
  // House colours: they paint the burst and the scarf. The house name joins the sorting reveal.
  const HOUSE = { harry: "Gryffindor", hermione: "Gryffindor", draco: "Slytherin", luna: "Ravenclaw", cedric: "Hufflepuff" };
  const SPARK = { stupefy: "#ff5a4f", petrificus: "#bfe7ff", obliviate: "#b98cff", protego: "#9fd8ff", levicorpus: "#ffd36b",
    confundo: "#ff9df0", wingardium: "#c6ffb0", accio2: "#ffe08a", accioAny: "#ffe08a", alohomora: "#ffcf7a", geminio: "#8affea", reparo: "#ffffff" };
  const CALL = { accio2: "Accio!", accioAny: "Accio!", alohomora: "Alohomora!", stupefy: "Stupefy!", levicorpus: "Levicorpus!", confundo: "Confundo!",
    wingardium: "Wingardium Leviosa!", obliviate: "Obliviate!", petrificus: "Petrificus Totalus!", protego: "Protego!", geminio: "Geminio!", reparo: "Reparo!" };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Authored figures: one robed body, each character told apart by hair, glasses, scarf and colours.
  function hairBack(ch, L) {
    if (ch === "hermione") return [[82,112,30],[158,112,30],[92,80,32],[148,80,32],[120,66,34],[76,146,24],[164,146,24],[88,170,18],[152,170,18]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${L.hair}"/>`).join("");
    if (ch === "luna") return `<path d="M76 112 Q76 66 120 66 Q164 66 164 112 L172 214 Q160 222 150 212 L146 126 Q120 108 94 126 L90 212 Q80 222 68 214 Z" fill="${L.hair}"/>`;
    return "";
  }
  function hairFront(ch, L) {
    switch (ch) {
      case "harry": return `<path d="M78 116 Q76 72 120 70 Q166 70 162 116 L154 98 L150 110 L142 92 L134 104 L126 88 L118 102 L108 88 L102 104 L92 92 L88 110 Z" fill="${L.hair}"/>
        <g fill="none" stroke="#141018" stroke-width="3.2"><circle cx="105" cy="124" r="11"/><circle cx="135" cy="124" r="11"/><path d="M116 124 h8"/></g>
        <path d="M112 90 l6 7 -4 2 6 8" fill="none" stroke="#9b2424" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      case "hermione": return `<path d="M82 112 Q86 76 120 74 Q154 76 158 112 Q146 92 120 92 Q96 92 82 112 Z" fill="${L.hair}"/>`;
      case "draco": return `<path d="M80 114 Q78 70 120 70 Q162 70 160 114 Q152 90 122 88 Q98 88 80 114 Z" fill="${L.hair}"/><path d="M96 84 Q120 78 150 90" stroke="#fff8dc" stroke-width="2" fill="none" opacity=".6"/>`;
      case "luna": return `<path d="M82 112 Q86 76 120 74 Q154 76 158 112 Q140 96 120 96 Q100 96 82 112 Z" fill="${L.hair}"/><circle cx="80" cy="146" r="5.5" fill="#ff8a3d"/><path d="M80 140 l-3 -6 m3 6 l3 -6" stroke="#4fa36b" stroke-width="2"/>`;
      case "cedric": return `<path d="M80 114 Q80 72 120 72 Q160 72 160 114 Q156 94 134 90 Q132 96 120 96 Q100 96 80 114 Z" fill="${L.hair}"/>`;
    }
    return "";
  }
  function figure(ch, spark) {
    const L = LOOK[ch] || LOOK.harry;
    const scarf = ch === "cedric"
      ? `<path d="M92 170 Q120 192 148 170 L146 186 Q120 206 94 186Z" fill="${L.c}"/><path d="M100 178 l6 12 M114 184 l4 12 M128 184 l-2 12 M140 178 l-6 12" stroke="${L.c2}" stroke-width="4"/>`
      : `<path d="M92 170 Q120 192 148 170 L146 186 Q120 206 94 186Z" fill="${L.c}"/><path d="M98 182 Q120 198 142 182" stroke="${L.c2}" stroke-width="3" fill="none"/>`;
    return `<svg viewBox="0 0 270 320" class="ci-fig" aria-hidden="true">
      <defs><radialGradient id="ci-sp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${spark}"/><stop offset="1" stop-color="${spark}" stop-opacity="0"/></radialGradient></defs>
      ${hairBack(ch, L)}
      <path d="M58 320 L78 178 Q120 150 162 178 L188 320 Z" fill="#17131f" stroke="${L.c}" stroke-width="4"/>
      <path d="M120 200 L120 320" stroke="${L.c}" stroke-width="2" opacity=".5"/>
      <path d="M158 186 Q196 170 218 128" stroke="#17131f" stroke-width="22" stroke-linecap="round" fill="none"/>
      <path d="M158 186 Q196 170 218 128" stroke="${L.c}" stroke-width="3" fill="none" opacity=".6"/>
      ${scarf}
      <rect x="108" y="148" width="24" height="20" fill="${L.skin}"/>
      <circle cx="120" cy="120" r="38" fill="${L.skin}"/>
      ${hairFront(ch, L)}
      <circle cx="220" cy="124" r="10" fill="${L.skin}"/>
      <path d="M222 122 L248 78" stroke="#4a2e18" stroke-width="5" stroke-linecap="round"/>
      <circle class="ci-spark" cx="250" cy="74" r="30" fill="url(#ci-sp)"/>
    </svg>`;
  }

  const layer = document.createElement("div");
  layer.className = "ci"; layer.hidden = true;
  layer.setAttribute("role", "status"); layer.setAttribute("aria-live", "polite");
  document.body.appendChild(layer);
  const queue = []; let playing = false, timer = null;
  const reduce = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  function finish() {
    clearTimeout(timer); layer.classList.remove("reveal"); layer.classList.remove("on", "out"); layer.hidden = true; playing = false;
    if (queue.length) setTimeout(next, 80);
  }
  layer.addEventListener("click", finish);

  function next() {
    const job = queue.shift(); if (!job) return;
    playing = true;
    if (job.reveal) return showReveal(job);
    const L = LOOK[job.ch] || LOOK.harry, spark = SPARK[job.k] || "#fff";
    const sub = job.k === "protego" ? `${job.name} block${job.name === "You" ? "" : "s"}${job.target ? " " + job.target : ""}`
      : `${job.name} cast${job.name === "You" ? "" : "s"}${job.target ? " at " + job.target : ""}${job.col ? " · " + E.COLORS[job.col].n : ""}`;
    const streaks = Array.from({ length: 14 }, (_, i) => `<i style="top:${4 + i * 6.8}%;animation-delay:${(i * 37) % 260}ms;opacity:${0.25 + (i % 4) * 0.15}"></i>`).join("");
    layer.style.setProperty("--ci", L.c); layer.style.setProperty("--ci2", spark);
    layer.innerHTML = `<div class="ci-band"><div class="ci-burst"></div><div class="ci-streaks">${streaks}</div>
      <div class="ci-art">${figure(job.ch, spark)}</div>
      <div class="ci-text"><span class="ci-who">${esc(sub)}</span><span class="ci-call">${esc(CALL[job.k] || "Spell!")}</span><span class="ci-char">${esc(E.CHARS[job.ch] ? E.CHARS[job.ch].n : "")}</span></div></div>`;
    layer.hidden = false;
    void layer.offsetWidth;
    layer.classList.add("on");
    timer = setTimeout(() => { layer.classList.add("out"); timer = setTimeout(finish, reduce() ? 150 : 380); }, reduce() ? 1100 : 1400);
  }

  // Game start: each player is shown the character they were dealt and its power.
  function showReveal(job) {
    const L = LOOK[job.ch] || LOOK.harry, C = E.CHARS[job.ch];
    layer.style.setProperty("--ci", L.c); layer.style.setProperty("--ci2", "#ffe9a8");
    const streaks = Array.from({ length: 10 }, (_, i) => `<i style="top:${6 + i * 9}%;animation-delay:${(i * 53) % 300}ms;opacity:${0.2 + (i % 3) * 0.15}"></i>`).join("");
    layer.innerHTML = `<div class="ci-band ci-tall"><div class="ci-burst"></div><div class="ci-streaks">${streaks}</div>
      <div class="ci-art">${figure(job.ch, "#ffe9a8")}</div>
      <div class="ci-text"><span class="ci-who">The sorting is done. You are</span><span class="ci-call">${esc(C.n)}</span><span class="ci-char">House ${esc(HOUSE[job.ch] || "")}</span>
        <span class="ci-power"><b>Your power:</b> ${esc(C.d)}</span>
        ${job.others.length ? `<span class="ci-others">${job.others.map(o => `${esc(o.name)}: ${esc(E.CHARS[o.ch].n)}`).join(" · ")}</span>` : ""}
        <button class="ci-go" type="button">Let's play</button></div></div>`;
    layer.classList.add("reveal");
    layer.hidden = false;
    void layer.offsetWidth;
    layer.classList.add("on");
    timer = setTimeout(() => { layer.classList.add("out"); timer = setTimeout(finish, 380); }, 9000);
  }

  let seen = null;
  window.CutIn = {
    /** Call with every fresh game state. */
    observe(S, nameOf, meSeat) {
      if (!S || S.status === "lobby") { seen = 0; return; }
      const lc = S.lastCast;
      if (!lc) { if (seen === null) seen = 0; return; }
      if (seen === null) { seen = lc.n; return; }   // joined mid-game: don't replay old casts
      if (lc.n < seen) seen = 0;                   // a rematch restarted the count
      if (lc.n <= seen) return;
      seen = lc.n;
      const P = S.players[lc.p]; if (!P) return;
      const who = i => (i === meSeat ? "you" : nameOf(i));
      queue.push({ ch: P.char, name: lc.p === meSeat ? "You" : nameOf(lc.p), k: lc.k, col: lc.col,
        target: lc.t == null ? "" : lc.t === -1 ? "everyone" : who(lc.t) });
      if (!playing) next();
    },
    /** Show the dealt character once per game on this device. */
    reveal(S, nameOf, meSeat) {
      if (!S || S.status !== "play" || meSeat < 0) return;
      const key = "wd-reveal-" + S.code + "-" + S.created;
      try { if (localStorage.getItem(key)) return; localStorage.setItem(key, "1"); } catch (e) {}
      const others = S.players.map((p, i) => ({ name: nameOf(i), ch: p.char, i })).filter(o => o.i !== meSeat);
      queue.unshift({ reveal: true, ch: S.players[meSeat].char, others });
      if (!playing) next();
    },
    preview(ch, k) { queue.push({ ch, name: "Preview", k, target: "everyone" }); if (!playing) next(); }
  };
})();
