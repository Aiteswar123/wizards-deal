/* Nasi Lemak: the table screen, home masthead and rules. A night-market hawker stall:
   banana-leaf green, sambal red, coconut cream and turmeric, with drawn ingredient icons.
   Uses the page's shared helpers: S, me, mySeat, nameOf, esc, fmt, act, call, flash, netDown, sndBtn, $app. */
(function () {
  "use strict";
  const N = window.Nasi;
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Lilita+One&family=Baloo+2:wght@500;600;700;800&display=swap";
  document.head.appendChild(font);

  const sheet = document.createElement("link");
  sheet.rel = "stylesheet"; sheet.href = "nasi.css";
  document.head.appendChild(sheet);

  // ---- drawn icons (one stroke family, filled shapes) ----
  const ICON = {
    rice: `<ellipse cx="32" cy="44" rx="22" ry="8" fill="#e9e2cf"/><path d="M12 42c2-14 12-22 20-22s18 8 20 22z" fill="#fffdf6" stroke="#c9bfa6" stroke-width="1.5"/><g fill="#e9e2cf"><ellipse cx="25" cy="31" rx="2" ry="1"/><ellipse cx="33" cy="27" rx="2" ry="1"/><ellipse cx="40" cy="33" rx="2" ry="1"/><ellipse cx="29" cy="37" rx="2" ry="1"/></g>`,
    egg: `<ellipse cx="32" cy="34" rx="18" ry="22" fill="#fffdf6" stroke="#d9cfb8" stroke-width="1.5"/><circle cx="32" cy="36" r="9" fill="#f2a524"/><circle cx="29" cy="33" r="2.5" fill="#ffd27a"/>`,
    peanut: `<g transform="rotate(-25 32 32)"><path d="M32 10c8 0 11 7 9 13-1 4 2 7 2 12 0 10-6 17-11 17s-11-7-11-17c0-5 3-8 2-12-2-6 1-13 9-13z" fill="#d9a35b" stroke="#a8742f" stroke-width="1.5"/><path d="M26 22h12M25 33h14M27 43h10" stroke="#a8742f" stroke-width="1.4" stroke-linecap="round"/></g>`,
    sambal: `<path d="M10 40c0-12 10-20 22-20s22 8 22 20c0 7-10 10-22 10S10 47 10 40z" fill="#c8372d"/><path d="M16 36c4-6 10-9 16-9" stroke="#e86a4c" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#f1d7a8"><path d="M22 40l8-3 1 2-8 3z"/><path d="M34 42l9-2v2l-9 2z"/><path d="M28 34l7 1-1 2-7-1z"/></g>`,
    cucumber: `<circle cx="24" cy="36" r="14" fill="#5e9e3c"/><circle cx="24" cy="36" r="11" fill="#d7efb5"/><circle cx="40" cy="28" r="14" fill="#5e9e3c"/><circle cx="40" cy="28" r="11" fill="#d7efb5"/><g fill="#9cc56a"><circle cx="40" cy="25" r="1.5"/><circle cx="37" cy="30" r="1.5"/><circle cx="43" cy="31" r="1.5"/><circle cx="24" cy="33" r="1.5"/><circle cx="21" cy="38" r="1.5"/><circle cx="27" cy="39" r="1.5"/></g>`,
    supplier: `<rect x="12" y="24" width="40" height="26" rx="3" fill="#a8742f"/><path d="M12 32h40M12 42h40M24 24v26M40 24v26" stroke="#7a5220" stroke-width="2"/><path d="M22 24l10-10 10 10" fill="none" stroke="#2f6b3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    thief: `<circle cx="32" cy="32" r="18" fill="#3a2a1f"/><path d="M14 30h36v8H14z" fill="#141010"/><circle cx="25" cy="34" r="2.6" fill="#fff"/><circle cx="39" cy="34" r="2.6" fill="#fff"/><path d="M20 18c6-6 18-6 24 0" stroke="#141010" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    wholesaler: `<rect x="8" y="30" width="22" height="20" rx="2" fill="#c98f3f"/><rect x="34" y="30" width="22" height="20" rx="2" fill="#a8742f"/><rect x="20" y="12" width="22" height="18" rx="2" fill="#d9a35b"/><path d="M19 30v20M45 30v20M31 12v18" stroke="#7a5220" stroke-width="2"/>`,
    officer: `<path d="M14 26l18-10 18 10-4 6H18z" fill="#1f3b6e"/><rect x="18" y="31" width="28" height="5" fill="#16294c"/><circle cx="32" cy="22" r="3.5" fill="#e3a72f"/><circle cx="32" cy="46" r="9" fill="#e9c49e"/>`,
    makcik: `<path d="M14 54c0-14 8-26 18-26s18 12 18 26z" fill="#2f6b3a"/><circle cx="32" cy="28" r="11" fill="#e2b98f"/><path d="M19 30c0-12 6-18 13-18s13 6 13 18c-3-6-8-9-13-9s-10 3-13 9z" fill="#c8372d"/><path d="M27 31q5 4 10 0" stroke="#6b3b22" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
    fly: `<ellipse cx="22" cy="24" rx="10" ry="6" fill="#cfe6f5" opacity=".85" transform="rotate(-30 22 24)"/><ellipse cx="42" cy="24" rx="10" ry="6" fill="#cfe6f5" opacity=".85" transform="rotate(30 42 24)"/><ellipse cx="32" cy="36" rx="8" ry="12" fill="#1d2420"/><circle cx="32" cy="24" r="6" fill="#1d2420"/><circle cx="29" cy="23" r="2.2" fill="#b3261e"/><circle cx="35" cy="23" r="2.2" fill="#b3261e"/>`,
    swatter: `<rect x="14" y="10" width="26" height="26" rx="4" fill="#d94a3a" transform="rotate(-20 27 23)"/><g stroke="#a12f22" stroke-width="1.5" transform="rotate(-20 27 23)"><path d="M14 19h26M14 27h26M23 10v26M31 10v26"/></g><path d="M33 38l14 16" stroke="#7a5220" stroke-width="4" stroke-linecap="round"/>`,
    fan: `<path d="M32 46L14 20a26 26 0 0 1 36 0z" fill="#e3a72f"/><path d="M32 46L20 18M32 46V16M32 46l12-28" stroke="#a8742f" stroke-width="1.6"/><path d="M14 20a26 26 0 0 1 36 0" fill="none" stroke="#c8372d" stroke-width="3"/><path d="M32 46v10" stroke="#7a5220" stroke-width="4" stroke-linecap="round"/>`
  };
  // each stall's awning colour: sambal red, pandan green, sunshine orange, bunga telang blue, ube purple
  const AWNING = ["#ff4b3e", "#34c25a", "#ff8a1f", "#3d7bff", "#a35bff"];
  const BAND = { rice: "#bfe7ff", egg: "#ffd23f", peanut: "#e0a35c", sambal: "#ff4b3e", cucumber: "#34c25a" };
  const svg = (t, cls) => `<svg viewBox="0 0 64 64" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${ICON[t] || ""}</svg>`;
  // A nasi lemak bungkus: banana leaf folded into a pyramid over newspaper, tied with a red rubber band.
  const INK = "#3d2414";
  const parcel = (packs, show) => `<svg class="parcel" viewBox="0 0 64 60" aria-hidden="true">
    <path d="M6 44 L32 10 L58 44 L32 56 Z" fill="#f4ecd8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M10 42 L32 14 L54 42 L32 52 Z" fill="#34c25a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M32 14 L32 52" stroke="#1f8f3c" stroke-width="2.4"/><path d="M18 34 L32 40 L46 34" stroke="#8be09d" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M12 39 Q32 31 52 39" stroke="#ff4b3e" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M24 18 l4 -4 M40 18 l-4 -4" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    ${show ? `<circle cx="32" cy="27" r="8" fill="#ffd23f" stroke="${INK}" stroke-width="2.5"/><text x="32" y="31" text-anchor="middle" font-family="Lilita One,Arial Black,sans-serif" font-size="12" fill="${INK}">${packs}</text>` : ""}</svg>`;

  // ---- behind the Nasi Lemak world: a sun-dappled kampung out of focus, sunbeams, swaying leaves and a wooden deck ----
  const leaf = (c, v) => `<svg viewBox="0 0 100 100"><g fill="${c}"><path d="M8 8 C40 6 70 22 92 54 C62 52 30 40 8 8Z"/><path d="M6 10 C10 44 26 74 58 94 C52 62 38 32 6 10Z" opacity=".85"/></g><path d="M8 8 C38 26 60 48 90 54 M8 8 C24 38 38 62 56 92" stroke="${v}" stroke-width="1.6" fill="none" opacity=".7"/></svg>`;
  const scene = document.createElement("div");
  scene.className = "k-scene"; scene.setAttribute("aria-hidden", "true");
  scene.innerHTML = `<div class="k-bokeh"></div><div class="k-beams"></div>
    <div class="k-leaf" style="left:-3rem;top:-2.5rem;--t:7s">${leaf("#3f8d3c", "#2a6a2c")}</div>
    <div class="k-leaf" style="right:-3.5rem;top:-3rem;--r:90deg;--o:100% 0;--t:8.5s">${leaf("#4a9a45", "#2a6a2c")}</div>
    <div class="k-leaf" style="right:-4rem;top:38vh;--r:150deg;--o:100% 50%;--t:9.5s;opacity:.85">${leaf("#3a7f37", "#245a26")}</div>
    <div class="k-deck"></div>`;
  document.body.prepend(scene);

  // ---- comic power burst: plays once on every screen when someone wraps a Nasi Lemak or plays an action card ----
  const fxEl = document.createElement("div");
  fxEl.className = "k-fx"; fxEl.hidden = true; fxEl.setAttribute("role", "status"); fxEl.setAttribute("aria-live", "polite");
  document.body.appendChild(fxEl);
  const FX = {
    make:       { call: "Siap!",       icon: null,        fx: "#ff8a1f", fx2: "#ffd23f", say: "wrapped a Nasi Lemak" },
    supplier:   { call: "Supplier!",   icon: "supplier",  fx: "#34c25a", fx2: "#c8f5b4", say: "called the Supplier" },
    thief:      { call: "Thief!",      icon: "thief",     fx: "#a35bff", fx2: "#e3cfff", say: "sent the Thief round every stall" },
    wholesaler: { call: "Wholesaler!", icon: "wholesaler", fx: "#ff8a1f", fx2: "#ffe0a8", say: "called the Wholesaler" },
    officer:    { call: "Officer!",    icon: "officer",   fx: "#3d7bff", fx2: "#cfe0ff", say: "sent the Officer to inspect" },
    fly:        { call: "Bzzz!",       icon: "fly",       fx: "#5b4f78", fx2: "#d9d3ea", say: "landed a Fly on" },
    swatter:    { call: "Swat!",       icon: "swatter",   fx: "#ff4b3e", fx2: "#ffd0cb", say: "swatted the fly away" },
    fan:        { call: "Whoosh!",     icon: "fan",       fx: "#ffb52e", fx2: "#fff1b8", say: "fanned the fly over to" },
    trade:      { call: "Deal!",       icon: null,        fx: "#34c25a", fx2: "#d6f7c9", say: "made a trade with" }
  };
  const fx = { seen: null, code: null, queue: [], timer: null };
  function fxPlay() {
    const job = fx.queue.shift();
    if (!job) { fxEl.hidden = true; return; }
    const F = FX[job.k];
    fxEl.style.setProperty("--fx", F.fx); fxEl.style.setProperty("--fx2", F.fx2);
    const art = F.icon ? svg(F.icon) : parcel("", false);
    fxEl.innerHTML = `<div class="kfx-rays"></div><div class="kfx-panel"><div class="kfx-icon">${art}</div><div class="kfx-txt"><span class="kfx-call">${esc(F.call)}</span><span class="kfx-who"><b>${esc(job.by)}</b> ${esc(F.say)}${job.to ? ` <b>${esc(job.to)}</b>` : ""}</span></div></div>`;
    fxEl.hidden = false;
    clearTimeout(fx.timer);
    fx.timer = setTimeout(fxPlay, 1500);
  }
  function fxObserve(v) {
    const L = S.last;
    if (fx.code !== S.code) { fx.code = S.code; fx.seen = null; }
    if (!L) { if (fx.seen === null) fx.seen = 0; return; }
    if (fx.seen === null || L.n < fx.seen) { fx.seen = L.n; return; }   // arriving mid-game: don't replay old moments
    if (L.n === fx.seen) return;
    fx.seen = L.n;
    const k = L.k === "trade" ? (L.ok ? "trade" : null) : L.k;
    if (!FX[k]) return;
    const who = i => (i === v ? "you" : nameOf(i));
    fx.queue.push({ k, by: L.p === v ? "You" : nameOf(L.p), to: L.q != null && k !== "supplier" && k !== "thief" ? who(L.q) : "" });
    if (fxEl.hidden) fxPlay();
  }

  // ---- card designs: each player picks a front and a back; the table sees them on your played cards and your stall ----
  const FACES = { classic: "Classic", batik: "Batik", songket: "Songket", kopitiam: "Kopitiam", pasar: "Pasar Malam", kampung: "Kampung", boboiboy: "BoBoiBoy Elemental" };
  const BACKS = { daun: "Banana Leaf", batik: "Batik", songket: "Songket", jubin: "Kopitiam Tile", wau: "Wau", boboiboy: "BoBoiBoy Cap" };
  const store = { get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* not remembered, still applied */ } } };
  let myFace = store.get("nl-face", "classic"), myBack = store.get("nl-back", "daun");
  if (!FACES[myFace]) myFace = "classic";
  if (!BACKS[myBack]) myBack = "daun";
  const faceOf = i => { const v = typeof mySeat === "function" ? mySeat() : -1; if (i === v) return myFace; const p = S && S.players && S.players[i]; return p && FACES[p.face] ? p.face : "classic"; };
  const backOf = i => { const v = typeof mySeat === "function" ? mySeat() : -1; if (i === v) return myBack; const p = S && S.players && S.players[i]; return p && BACKS[p.back] ? p.back : "daun"; };
  let styleSent = "";
  function syncStyle() {
    if (typeof S === "undefined" || !S || S.kind !== "nasi" || !S.players || typeof call !== "function") return;
    const v = mySeat(); if (v < 0) return;
    const P = S.players[v];
    if (P.face === myFace && P.back === myBack) { styleSent = ""; return; }
    const k = `${S.code}:${myFace}:${myBack}`; if (styleSent === k) return;
    styleSent = k; call("style", { face: myFace, back: myBack });
  }
  const designEl = document.createElement("div");
  designEl.className = "nl-design"; designEl.hidden = true;
  designEl.setAttribute("role", "dialog"); designEl.setAttribute("aria-modal", "true"); designEl.setAttribute("aria-label", "Card design");
  document.body.appendChild(designEl);
  function designHTML() {
    return `<div class="nl-designbox nl"><header><h2>Card design</h2><button class="nl-btn small" data-nd="close">Done</button></header>
      <p class="nl-muted">Everyone at the table sees your fronts on the cards you play, and your backs on your stall.</p>
      <h3>Fronts</h3><div class="nl-designrow">${Object.entries(FACES).map(([k, n]) => `<button class="nl-designopt" data-nd="face" data-k="${k}" aria-pressed="${k === myFace}">${cardHTML(11, { face: k })}<span>${n}</span></button>`).join("")}</div>
      <h3>Backs</h3><div class="nl-designrow">${Object.entries(BACKS).map(([k, n]) => `<button class="nl-designopt" data-nd="back" data-k="${k}" aria-pressed="${k === myBack}"><span class="nl-backcard b-${k}"></span><span>${n}</span></button>`).join("")}</div></div>`;
  }
  function openDesign() { designEl.innerHTML = designHTML(); designEl.hidden = false; designEl.querySelector("[data-nd=close]").focus(); }
  designEl.addEventListener("click", e => {
    if (e.target === designEl) { designEl.hidden = true; return; }
    const b = e.target.closest("[data-nd]"); if (!b) return;
    if (b.dataset.nd === "close") { designEl.hidden = true; return; }
    if (b.dataset.nd === "face") { myFace = b.dataset.k; store.set("nl-face", myFace); }
    if (b.dataset.nd === "back") { myBack = b.dataset.k; store.set("nl-back", myBack); }
    designEl.innerHTML = designHTML();
    syncStyle(); if (typeof window.render === "function" && S) window.render();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !designEl.hidden) designEl.hidden = true; });
  // the lobby's card-design corner (index.html places it under the code)
  function lobbyHTML() {
    return `<div class="nl-lobbydesign nl"><div class="nl-lobbyprev">${cardHTML(11, { face: myFace })}<span class="nl-backcard b-${myBack}"></span></div>
      <div><b>Your card design</b><p class="nl-muted">${FACES[myFace]} fronts · ${BACKS[myBack]} backs. Everyone sees them.</p><button class="nl-btn small" data-nd-open="1">Change design</button></div></div>`;
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-nd-open]")) openDesign(); });

  // BoBoiBoy Elemental fronts: each ingredient is one of BoBoiBoy's elements, shown on a Power Watch badge
  const ELEMENT = { rice: "light", egg: "lightning", peanut: "earth", sambal: "fire", cucumber: "leaf", fly: "water" };
  const GLYPH = {
    lightning: '<path d="M13.5 2 4.5 13.5h6l-1.5 8.5 9.5-12.5h-6.2z"/>',
    wind: '<path d="M3 8.5h10.5a3 3 0 1 0-3-3M3 12.5h14.5a3.2 3.2 0 1 1-3.2 3.2M3 16.5h7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    earth: '<path d="M12 2.5 20.5 9l-3 12.5h-11L3.5 9z"/><path d="M3.5 9h17M12 2.5 8.5 9l3.5 12.5L15.5 9z" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>',
    fire: '<path d="M12 2c1.8 4.2 6.5 6.2 6.5 11.5a6.5 6.5 0 0 1-13 0c0-3 1.8-5 3-6.8.8 1.8 1.2 3 3 4 .2-3.2-1.2-5.2.5-8.7z"/>',
    water: '<path d="M12 2.5c4.2 5.2 7 8.4 7 12.3a7 7 0 0 1-14 0c0-3.9 2.8-7.1 7-12.3z"/>',
    leaf: '<path d="M4.5 19.5C4.5 9.5 10.5 4 20.5 3.5c0 10-5.5 16-16 16z"/><path d="M4.5 19.5 14 10" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.4" stroke-linecap="round"/>',
    light: '<circle cx="12" cy="12" r="4.6"/><path d="M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4M4.8 4.8l2.4 2.4M16.8 16.8l2.4 2.4M4.8 19.2l2.4-2.4M16.8 7.2l2.4-2.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
  };
  const badge = el => `<span class="bb-badge bb-${el}" aria-hidden="true"><svg viewBox="0 0 24 24"><g fill="currentColor">${GLYPH[el]}</g></svg></span>`;
  function cardHTML(id, o = {}) {
    if (id == null || id < 0) return `<div class="nl-back">?</div>`;
    const t = N.typeOf(id), ing = N.ING[t], A = N.ACTIONS[t];
    const tag = o.tag || "div";
    const el = o.face === "boboiboy" ? ELEMENT[t] || "wind" : null;
    return `<${tag} class="nl-card ${ing ? "ing" : "act"} f-${o.face || "classic"}${el ? " el-" + el : ""} ${o.cls || ""}" style="--band:${ing ? BAND[t] : t === "fly" ? "#8f86ad" : "#ff8a1f"};${o.style || ""}" ${o.attrs || ""}>${el ? badge(el) : ""}${svg(t)}<b>${esc(ing ? ing.n : A.n)}</b><i>${esc(ing ? ing.ms : A.ms)}</i></${tag}>`;
  }
  const packsHTML = (p, mine, fresh = Infinity) => p.nl.length ? `<div class="nl-packs">${p.nl.map((e, k) => `<span class="nl-pack${e.fly != null ? " flied" : ""}${k >= fresh ? " fresh" : ""}" title="${e.fly != null ? "A fly is on this Nasi Lemak: it doesn't count" : mine || e.n >= 0 ? N.entryPacks(e) + " pack" + (N.entryPacks(e) > 1 ? "s" : "") : "Face down"}${e.bonus ? " (Lunch Rush +1)" : ""}">${parcel(e.n >= 0 ? N.entryPacks(e) : "", e.n >= 0)}${e.fly != null ? svg("fly", "fly") : ""}${e.bonus ? `<span class="nl-rush" aria-hidden="true">+1</span>` : ""}<span class="cnt">${k + 1}</span></span>`).join("")}</div>` : `<p class="nl-empty">No Nasi Lemak yet.</p>`;

  const ui = { sel: null, step: {}, trade: null, take: [], key: "" };
  const ev = () => S.event && S.event.k;
  // the round's Kopitiam event, chalked on the board; it flips over when a new round starts
  function eventHTML() {
    if (!S.event || S.status !== "play") return "";
    const E = N.EVENTS[S.event.k], flip = ui.evRound != null && ui.evRound !== S.event.round;
    ui.evRound = S.event.round;
    const used = S.event.k === "rush" && S.event.used != null ? ` <em>Claimed by ${esc(nm(S.event.used, mySeat()))}.</em>` : "";
    return `<aside class="nl-event ev-${S.event.k}${flip ? " flip" : ""}" aria-live="polite"><span class="nl-evtag">Round ${S.event.round} · Kopitiam event</span>
      <b>${esc(E.n)}</b><i>${esc(E.ms)}</i><p>${esc(E.d)}${used}</p></aside>`;
  }
  function reset() { ui.sel = null; ui.step = {}; ui.trade = null; ui.take = []; ui.key = ""; }
  const opt = (a, data, label, sub, dis) => `<button class="nl-opt" data-n="${a}" ${Object.entries(data).map(([k, x]) => `data-${k}="${esc(x)}"`).join(" ")}${dis ? " disabled" : ""}>${label}${sub ? `<small>${sub}</small>` : ""}</button>`;
  const others = v => S.players.map((_, i) => i).filter(i => i !== v);
  const nm = (i, v) => i === v ? "you" : nameOf(i);
  const ingsOf = P => { const by = {}; P.hand.filter(N.isIng).forEach(id => { (by[N.typeOf(id)] = by[N.typeOf(id)] || []).push(id); }); return by; };
  const countIn = (P, t) => P.hand.filter(id => N.typeOf(id) === t).length;

  function panelHTML(v) {
    const P = S.players[v], pd = S.pending;
    if (S.status !== "play") return `<h3>Stalls closed</h3><p class="nl-muted">Thanks for playing.</p>`;
    if (pd && pd.k === "trade" && pd.to === v) {
      const T = S.players[pd.from];
      const can = pd.want.every(w => countIn(P, w.t) >= w.n);
      return `<h3>${esc(nameOf(pd.from))} wants to trade</h3>
        <p><b>They give you:</b> ${pd.give.length ? pd.give.map(id => esc(N.cardName(N.typeOf(id)))).join(", ") : "nothing"}</p>
        <p><b>They want:</b> ${pd.want.length ? pd.want.map(w => `${w.n} ${esc(N.cardName(w.t))}`).join(", ") : "nothing"}</p>
        ${can ? "" : `<p class="nl-muted">You don't have everything they're asking for.</p>`}
        <div class="nl-row"><button class="nl-btn go" data-n="answer" data-yes="1" ${can ? "" : "disabled"}>Accept</button><button class="nl-btn" data-n="answer" data-yes="0">Decline</button>
        ${S.clock && S.clock.resp ? `<span class="nl-muted">Answer within <b data-clock="resp">0:30</b></span>` : ""}</div>${T ? "" : ""}`;
    }
    if (S.turn !== v) {
      const w = pd && pd.k === "trade" ? `${esc(nameOf(pd.to))} is deciding on a trade with ${esc(nameOf(pd.from))}.` : `Your turn comes soon. Plan which ingredients you still need.`;
      return `<h3>${esc(nameOf(S.turn))}'s turn</h3><p class="nl-muted">${w}</p>`;
    }
    if (pd && pd.k === "trade") return `<h3>Waiting for ${esc(nameOf(pd.to))}</h3><p class="nl-muted">They have 30 seconds to accept or decline your offer.</p><div class="nl-row"><button class="nl-btn" data-n="cancel">Withdraw offer</button></div>`;
    if (pd && pd.k === "officer") {
      const hand = pd.hand || [], need = Math.min(2, hand.length);
      return `<h3>${esc(nameOf(pd.to))}'s hand</h3><p class="nl-muted">Only you can see these. Tap ${need} to take.</p>
        <div class="nl-hand" style="padding-top:.2rem">${hand.map(id => cardHTML(id, { tag: "button", face: faceOf(pd.to), cls: ui.take.includes(id) ? "sel" : "", attrs: `data-n="pick" data-id="${id}"` })).join("")}</div>
        <div class="nl-row"><button class="nl-btn go" data-n="take" ${ui.take.length === need ? "" : "disabled"}>Take ${need} card${need === 1 ? "" : "s"}</button></div>`;
    }
    const dn = N.drawFor(S), mv = N.movesFor(S);
    if (!S.drew) return `<h3>Your turn</h3><p class="nl-muted">Start by drawing ${dn} cards. Drawing isn't one of your ${mv} moves.</p><div class="nl-row"><button class="nl-btn go" data-n="draw">Draw ${dn} cards</button></div>`;
    const left = mv - S.moves, end = `<button class="nl-btn" data-n="end">End turn</button>`;
    if (left <= 0) return `<h3>All ${mv} moves used</h3><p class="nl-muted">End your turn when you're ready.</p><div class="nl-row">${end}</div>`;
    if (ui.trade) return tradeHTML(v) ;
    if (ui.sel != null) return selectedHTML(v) + `<div class="nl-row"><button class="nl-btn small" data-n="unsel">Cancel</button>${end}</div>`;
    const by = ingsOf(P), types = Object.keys(by).length, mk = P.hand.find(id => N.typeOf(id) === "makcik");
    const missing = N.ING_KEYS.filter(t => !by[t]).map(t => N.ING[t].n);
    return `<h3>${left} move${left === 1 ? "" : "s"} left</h3>
      <div class="nl-opts">
        ${opt("make", {}, "Make a Nasi Lemak", types === 5 ? "Uses one of each ingredient" : `Still missing: ${missing.join(", ")}`, types < 5 || !S.nlPile.length)}
        ${mk != null ? opt("make", { mk }, "Make one with Mak Cik", types >= 3 ? "Uses Mak Cik plus 3 different ingredients" : "You need 3 different ingredients", types < 3 || !S.nlPile.length) : ""}
        ${opt("tradeopen", {}, "Trade with a player", ev() === "hujan" ? "Hujan Lebat: no trading this round" : ev() === "pasar" ? "Pasar Malam: trades are free this round" : "Offer ingredients, Fly Swatters or Fans", ev() === "hujan")}
      </div>
      <p class="nl-muted" style="font-size:.88rem">Or tap an action card in your hand to play it.</p>
      <div class="nl-row">${end}</div>`;
  }

  function selectedHTML(v) {
    const P = S.players[v], id = ui.sel, t = N.typeOf(id), A = N.ACTIONS[t], st = ui.step;
    const head = `<h3>${esc(A.n)}</h3><p class="nl-muted" style="font-size:.9rem">${esc(A.d)}</p>`;
    const none = m => `<p class="nl-muted">${m}</p>`;
    let body = "";
    if (ev() === "raya" && N.RAYA_BLOCKS.includes(t)) return head + none("Hari Raya Open House: everyone's friends this round. Keep this card for the next one.");
    switch (t) {
      case "makcik": body = none("Use the “Make one with Mak Cik” button once you have 3 different ingredients."); break;
      case "supplier": body = N.ING_KEYS.map(k => opt("play", { ing: k }, `Call for ${esc(N.ING[k].n)}`, `You hold ${countIn(P, k)}`)).join(""); break;
      case "thief": body = opt("play", {}, "Send the Thief", "One random card from each other player"); break;
      case "wholesaler": body = opt("play", {}, "Call the Wholesaler", `${S.deck.length} cards in the draw pile`); break;
      case "officer": body = others(v).map(p => opt("play", { p }, `Inspect ${esc(nameOf(p))}`, `${S.players[p].hand.length} cards in hand`, !S.players[p].hand.length)).join(""); break;
      case "fly": {
        const list = []; others(v).forEach(p => S.players[p].nl.forEach((e, k) => { if (e.fly == null) list.push(opt("play", { p, slot: k }, `${esc(nameOf(p))} · Nasi Lemak ${k + 1}`, "Land the fly here")); }));
        body = list.join("") || none("Nobody has a Nasi Lemak without a fly yet.");
        break;
      }
      case "swatter": {
        const list = P.nl.map((e, k) => e.fly != null ? opt("play", { slot: k }, `Swat the fly off Nasi Lemak ${k + 1}`) : "").join("");
        body = list || none("None of your Nasi Lemak has a fly. Keep this for later.");
        break;
      }
      case "fan": {
        if (st.slot == null) { const list = P.nl.map((e, k) => e.fly != null ? opt("step", { slot: k }, `Fan the fly off Nasi Lemak ${k + 1}`) : "").join(""); body = list || none("None of your Nasi Lemak has a fly. Keep this for later."); }
        else { const list = []; others(v).forEach(p => S.players[p].nl.forEach((e, k) => { if (e.fly == null) list.push(opt("play", { slot: st.slot, p, to: k }, `Onto ${esc(nameOf(p))}'s Nasi Lemak ${k + 1}`)); }));
          body = list.join("") || none("Nobody else has a Nasi Lemak without a fly."); }
        break;
      }
    }
    return head + `<div class="nl-opts">${body}</div>`;
  }

  function tradeHTML(v) {
    const P = S.players[v], tr = ui.trade;
    const types = [...N.ING_KEYS, "swatter", "fan"];
    if (tr.p == null) return `<h3>Trade with…</h3><div class="nl-opts">${others(v).map(p => opt("tradeto", { p }, esc(nameOf(p)), `${S.players[p].hand.length} cards in hand`)).join("")}</div><div class="nl-row"><button class="nl-btn small" data-n="tradeclose">Cancel</button></div>`;
    const giveN = tr.give.length, wantN = Object.values(tr.want).reduce((a, b) => a + b, 0);
    return `<h3>Trade with ${esc(nameOf(tr.p))}</h3>
      <p class="nl-muted" style="font-size:.88rem"><b>You give:</b> tap ingredients, Fly Swatters or Fans in your hand. ${giveN ? `${giveN} picked.` : "Nothing picked yet."}</p>
      <p class="nl-muted" style="font-size:.88rem;margin-bottom:-.2rem"><b>You ask for:</b></p>
      <div class="nl-steps">${types.map(t => `<span>${esc(N.cardName(t))}</span><button class="nl-btn small" data-n="want" data-t="${t}" data-d="-1" aria-label="Fewer ${esc(N.cardName(t))}" ${tr.want[t] ? "" : "disabled"}>−</button><b style="text-align:center;min-width:1.2rem">${tr.want[t] || 0}</b><button class="nl-btn small" data-n="want" data-t="${t}" data-d="1" aria-label="More ${esc(N.cardName(t))}">+</button>`).join("")}</div>
      <div class="nl-row"><button class="nl-btn go" data-n="tradesend" ${giveN || wantN ? "" : "disabled"}>Send offer</button><button class="nl-btn small" data-n="tradeclose">Cancel</button></div>
      <p class="nl-muted" style="font-size:.82rem">${ev() === "pasar" ? "Pasar Malam: this trade won't use a move." : "A trade only uses a move if they accept."}</p>`;
  }

  function render() {
    const v = mySeat(), P = S.players[v], n = S.players.length;
    const myTurn = S.status === "play" && S.turn === v, pd = S.pending;
    const waiting = N.waitingOn(S);
    document.title = waiting.includes(v) && v >= 0 ? "Your move · Nasi Lemak" : "Nasi Lemak";
    const key = `${S.code}:${S.turnN}:${S.status}:${pd ? pd.k + pd.from + pd.to : ""}`;
    if (key !== ui.key) { ui.key = key; ui.sel = null; ui.step = {}; ui.trade = null; ui.take = []; }
    if (P && ui.sel != null && !P.hand.includes(ui.sel)) { ui.sel = null; ui.step = {}; }
    if (ui.trade && P) ui.trade.give = ui.trade.give.filter(id => P.hand.includes(id));
    const topId = S.discard[S.discard.length - 1];
    const say = S.status === "over" ? `${esc(S.winner === v ? "You win!" : nameOf(S.winner) + " wins!")}`
      : pd && pd.k === "trade" ? `${esc(nm(pd.from, v))} → ${esc(nm(pd.to, v))}: trade offer`
      : myTurn ? (S.drew ? "Your turn" : `Your turn: draw ${N.drawFor(S)}`) : `${esc(nameOf(S.turn))}'s turn`;
    const sub = S.status !== "play" ? "" : `${S.drew ? `${S.moves} of ${N.movesFor(S)} moves` : "Drawing"}<span class="nl-dots">${Array.from({ length: N.movesFor(S) }, (_, i) => `<i class="${i < S.moves ? "used" : ""}"></i>`).join("")}</span>${S.clock ? ` · <b data-clock="turn">${N.TURN_MS / 60000}:00</b> left` : ""}`;
    const last = S.log[S.log.length - 1] || "";
    const myPacks = P ? N.packs(P) : 0;
    // what's new since the last screen: cards drop into your hand, freshly wrapped packs pop onto counters
    const sameGame = ui.game === S.code + ":" + S.created;
    const prevHand = sameGame ? ui.hand : null, prevPacks = sameGame ? ui.packs : null;
    ui.game = S.code + ":" + S.created; ui.hand = P ? P.hand.slice() : []; ui.packs = S.players.map(p => p.nl.length);
    const stamp = myTurn && !S.drew && ui.stampTurn !== S.turnN;
    if (myTurn) ui.stampTurn = S.turnN;
    let fresh = 0;
    $app.innerHTML = `<div class="nl">
      <header class="nl-top"><span class="mark">Nasi Lemak</span><span class="nl-code">TABLE ${esc(S.code)}</span><span class="grow"></span>${netDown ? `<span class="nl-muted">Reconnecting…</span>` : ""}<button class="nl-btn small" data-nd-open="1">Card design</button>${typeof sndBtn === "function" ? sndBtn() : ""}<button class="nl-btn small" data-a="home">Leave table</button></header>
      <p class="nl-ticker">${fmt(last)}</p>
      ${eventHTML()}
      ${S.status === "over" ? winHTML(v) : ""}
      <section class="nl-market${n >= 7 ? " many" : ""}" aria-label="The night market">
        ${S.players.map((O, i) => {
          // you sit at the bottom; everyone else's stall goes round the table clockwise
          const k = v >= 0 ? (i - v + n) % n : i, ang = Math.PI / 2 + k * 2 * Math.PI / n;
          const x = 50 + Math.cos(ang) * 42, y = 50 + Math.sin(ang) * 40, on = S.turn === i && S.status === "play";
          return `<article class="nl-stall${i === v ? " me" : ""}${on ? " on" : ""}${waiting.includes(i) && pd ? " wait" : ""}" style="left:${x}%;top:${y}%;--awn:${AWNING[i % AWNING.length]}">
            <div class="nl-awning" aria-hidden="true"></div>
            <div class="nl-sign"><b>${esc(i === v ? "You" : nameOf(i))}</b>${on ? `<span class="nl-open">Serving</span>` : ""}</div>
            <div class="nl-counter">
              <div class="nl-minis" aria-hidden="true">${Array.from({ length: Math.min(O.hand.length, 7) }, () => `<i class="nl-mini b-${backOf(i)}"></i>`).join("")}</div>
              <div class="nl-stats"><span><b>${O.hand.length}</b> cards</span><span><b>${O.nl.length}</b> wrapped</span>${S.status === "over" || i === v ? `<span><b>${N.packs(O)}</b> packs</span>` : ""}</div>
              ${O.nl.length ? packsHTML(O, i === v, prevPacks ? prevPacks[i] : Infinity) : `<p class="nl-empty">Nothing wrapped yet</p>`}</div></article>`; }).join("")}
        <div class="nl-felt${stamp ? " yourturn" : ""}"><span class="nl-leafmat" aria-hidden="true"></span>
          <div class="nl-piles"><div class="nl-pile"><div class="nl-back">${S.deck.length}</div>Draw pile</div>
            <div class="nl-pile">${topId != null ? cardHTML(topId, { cls: "small", face: S.by && S.by[topId] != null ? faceOf(S.by[topId]) : "classic" }) : `<div class="nl-back" style="opacity:.35"></div>`}Discard</div>
            <div class="nl-pile"><div class="nl-back gold">${S.nlPile.length}</div>Nasi Lemak</div></div>
          <div class="nl-say">${say}</div><div class="nl-sub">${sub}</div>
        </div>
      </section>
      ${P ? `<div class="nl-zone">
        <section class="nl-mine"><span class="nl-cap">Your stall</span>
          <p class="nl-score" style="margin:.4rem 0">${myPacks} <small>of ${N.GOAL} packs${P.nl.some(e => e.fly != null) ? " · a fly is spoiling one" : ""}</small></p>
          <div class="nl-meter" aria-hidden="true">${Array.from({ length: N.GOAL }, (_, k) => `<i class="${k < myPacks ? "on" : ""}"></i>`).join("")}</div>
          ${packsHTML(P, true, prevPacks && prevPacks[v] != null ? prevPacks[v] : Infinity)}</section>
        <section class="nl-panel" aria-live="polite">${panelHTML(v)}</section>
        <div class="nl-handwrap"><span class="nl-cap">Your hand · ${P.hand.length} cards · only you can see it</span>
          <div class="nl-hand">${handOrder(P.hand).map(id => { const g = ui.trade && ui.trade.p != null && ui.trade.give.includes(id), s = ui.sel === id, isNew = !prevHand || !prevHand.includes(id);
            return cardHTML(id, { tag: "button", cls: (g ? "give" : s ? "sel" : "") + (isNew ? " fresh" : ""), attrs: `data-n="card" data-id="${id}"`, face: myFace, style: isNew ? `--d:${fresh++}` : "" }); }).join("") || `<p class="nl-empty">No cards in hand.</p>`}</div></div>
      </div>` : `<p class="nl-muted" style="margin-top:1rem">You're watching this game.</p>`}
      <section class="nl-log"><span class="nl-cap">At the stalls</span><ol>${S.log.slice(-25).map(m => `<li>${fmt(m)}</li>`).join("")}</ol></section>
      ${rulesHTML()}</div>`;
    fxObserve(v);
    syncStyle();
  }
  const handOrder = h => h.slice().sort((a, b) => { const A = N.card(a), B = N.card(b); return (A.kind === B.kind ? 0 : A.kind === "ing" ? -1 : 1) || A.t.localeCompare(B.t) || a - b; });

  function winHTML(v) {
    const rows = S.players.map((p, i) => ({ i, packs: N.packs(p), cards: p.nl.length })).sort((a, b) => b.packs - a.packs || b.cards - a.cards);
    return `<div class="nl-win"><h2>${S.winner === v ? "You win!" : esc(nameOf(S.winner)) + " wins!"}</h2>
      <p class="nl-muted">${rows.map(r => `${esc(nm(r.i, v))}: ${r.packs} pack${r.packs === 1 ? "" : "s"}`).join(" · ")}</p>
      <div class="nl-row" style="justify-content:center">${S.host === me ? `<button class="nl-btn go" data-a="again">Open the stalls again</button>` : `<span class="nl-muted">The table owner can start a rematch.</span>`}<button class="nl-btn" data-a="home">Leave table</button></div></div>`;
  }

  function mastHTML() {
    const fan = [0, 10, 20, 30, 40].map((id, k) => cardHTML(id, { style: `--d:${k};--r:${[-8, -3, 2, 6, 10][k]}deg` })).join("");
    return `<header class="nl-mast nl"><div><h1>Nasi<span>Lemak</span></h1>
      <p>Run a Nasi Lemak stall in a hungry village. Collect rice, egg, peanuts, sambal bilis and cucumber, wrap your packs, and sabotage your neighbours with flies, thieves and officers. First to 5 packs wins. 2 to 10 players, each on their own phone or computer.</p></div>
      <figure class="nl-kiosk"><img src="assets/nasi-kiosk.jpg" alt="Tok Aba serving at Tok Aba's Kokotiam" width="495" height="470"><figure class="nl-crew"><img src="assets/nasi-crew.jpg" alt="BoBoiBoy, Ochobot, Gopal, Fang, Yaya and Ying" width="526" height="384"><figcaption>Tok Aba's regulars</figcaption></figure><div class="nl-mastfan" aria-hidden="true">${fan}</div></figure></header>`;
  }
  function rulesHTML() {
    const acts = Object.entries(N.ACTIONS).map(([k, a]) => `<li><b>${esc(a.n)}</b> (${a.count}): ${esc(a.d)}</li>`).join("");
    return `<details class="nl-rules nl"><summary>How to play Nasi Lemak</summary><div class="cols">
      <div><h3>Your turn</h3><ul>
        <li>Draw 2 cards. This isn't a move.</li>
        <li>Then make up to 3 moves, in any order: <b>make a Nasi Lemak</b>, <b>trade</b>, or <b>play an action card</b>.</li>
        <li><b>Make a Nasi Lemak</b> with one each of Rice, Egg, Peanuts, Sambal Bilis and Cucumber. You take the top card of the Nasi Lemak pile, face down: it holds 1 or 2 packs.</li>
        <li><b>Trade</b> only on your turn, with anyone, on any terms: 2 for 1 is fine. Ingredients, Fly Swatters and Fans can be traded. It counts as a move only if they accept.</li>
        <li><b>Win</b> with 5 packs on your turn. A Nasi Lemak with a Fly on it doesn't count. If the Nasi Lemak pile runs out, the most packs wins.</li></ul>
        <h3>Kopitiam events</h3><ul><li>Each round, once everyone has had a turn, a new event is flipped on the board. It changes one rule for the whole table until the next round.</li>
        ${Object.values(N.EVENTS).map(E => `<li><b>${esc(E.n)}</b>: ${esc(E.d)}</li>`).join("")}</ul></div>
      <div><h3>Action cards</h3><ul>${acts}</ul></div>
      <div><h3>The deck</h3><ul><li>50 ingredients: 10 each of Rice, Egg, Peanuts, Sambal Bilis and Cucumber.</li><li>25 action cards.</li><li>15 Nasi Lemak cards: 8 with one pack, 7 with two.</li><li>Each player starts with 7 cards.</li><li>With 6 to 10 players, a second full deck and a second Nasi Lemak pile are shuffled in.</li></ul>
        <p class="nl-muted" style="font-size:.85rem">Based on Nasi Lemak The Game by Faculty of Fun. Fan-made and unofficial.</p></div>
    </div></details>`;
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-n]");
    if (!b || b.disabled || !S || S.kind !== "nasi" || view !== "game") return;
    const d = b.dataset, v = mySeat(), P = S.players[v], num = k => d[k] != null && d[k] !== "" ? +d[k] : undefined;
    switch (d.n) {
      case "card": {
        const id = +d.id;
        if (ui.trade && ui.trade.p != null) {
          if (!N.tradable(N.typeOf(id))) return flash("Only ingredients, Fly Swatters and Fans can be traded.");
          const k = ui.trade.give.indexOf(id); if (k >= 0) ui.trade.give.splice(k, 1); else ui.trade.give.push(id);
          return render();
        }
        if (S.turn !== v || !S.drew || S.pending) return flash(S.turn !== v ? "Wait for your turn to play cards." : !S.drew ? `Draw your ${N.drawFor(S)} cards first.` : "Finish the current move first.");
        if (N.isIng(id)) return flash("Ingredients are used when you make a Nasi Lemak or trade.");
        ui.sel = ui.sel === id ? null : id; ui.step = {}; return render();
      }
      case "unsel": ui.sel = null; ui.step = {}; return render();
      case "step": ui.step.slot = num("slot"); return render();
      case "draw": return act({ t: "draw" });
      case "end": return act({ t: "end" });
      case "make": {
        const by = ingsOf(P), mk = num("mk");
        const pickTypes = mk != null ? Object.keys(by).sort((x, y) => by[y].length - by[x].length).slice(0, 3) : N.ING_KEYS;
        return act(mk != null ? { t: "make", makcik: mk, cards: pickTypes.map(t => by[t][0]) } : { t: "make", cards: N.ING_KEYS.map(t => by[t][0]) });
      }
      case "play": return act({ t: "play", card: ui.sel, ing: d.ing, p: num("p"), slot: num("slot"), to: num("to") });
      case "tradeopen": ui.trade = { p: null, give: [], want: {} }; ui.sel = null; return render();
      case "tradeto": ui.trade.p = num("p"); return render();
      case "tradeclose": ui.trade = null; return render();
      case "want": { const t = d.t, w = ui.trade.want; w[t] = Math.max(0, Math.min(10, (w[t] || 0) + +d.d)); return render(); }
      case "tradesend": { const tr = ui.trade; return act({ t: "trade", p: tr.p, give: tr.give, want: Object.entries(tr.want).filter(([, x]) => x > 0).map(([t, x]) => ({ t, n: x })) }); }
      case "cancel": return act({ t: "cancel" });
      case "answer": return act({ t: "answer", yes: d.yes === "1" });
      case "pick": { const id = +d.id, need = Math.min(2, (S.pending && S.pending.hand || []).length); const k = ui.take.indexOf(id);
        if (k >= 0) ui.take.splice(k, 1); else if (ui.take.length < need) ui.take.push(id); return render(); }
      case "take": return act({ t: "take", cards: ui.take });
    }
  });

  window.NasiUI = { render, mastHTML, rulesHTML, cardHTML, reset, syncStyle, lobbyHTML };
})();
