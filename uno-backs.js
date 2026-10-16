// Grand Line UNO: the Card design panel and the card backs. Each player picks the fronts (uno-faces.js) and the back of
// the cards they see (this browser only). The backs: the Sunwake's
// Jolly Roger, or one of five more One Piece themed backs, all original drawings: a straw hat, a Marine gull and
// anchor, a snail phone, a chart of the Grand Line and a swirled Devil Fruit. The choice is kept in localStorage.
(function () {
  "use strict";
  const KEY = "wd-back", INK = "#24170e";
  let cur = "sunwake";
  try { cur = localStorage.getItem(KEY) || "sunwake"; } catch (e) { /* storage blocked: keep the default */ }
  const css = `
.backbtn{display:inline-grid;place-items:center;width:2.4rem;padding:0}
.backbtn svg{width:1.15rem;height:1.15rem;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.sndfix .backbtn{display:none}
html[data-game=uno] .sndfix .backbtn{display:inline-grid}
/* straw hat: a sun-bleached straw weave */
.ucard.uback.b-strawhat .fl{background:repeating-linear-gradient(45deg,rgba(120,70,10,.22) 0 2px,transparent 2px 6px),repeating-linear-gradient(-45deg,rgba(255,240,190,.25) 0 2px,transparent 2px 6px),radial-gradient(120% 80% at 50% 40%,#f4cf6e,#c98d24 75%)}
.ucard.uback.b-strawhat .bt{color:#b3121b;text-shadow:0 calc(var(--w)*.008) 0 #fff1c4}
.ucard.uback.b-strawhat .bt2{color:#7a1a10}
/* marine: white sailcloth with navy rules */
.ucard.uback.b-marine .fl{background:repeating-linear-gradient(0deg,transparent 0 calc(var(--w)*.09),rgba(31,79,160,.14) calc(var(--w)*.09) calc(var(--w)*.1)),radial-gradient(120% 80% at 50% 40%,#ffffff,#d9e2ee 80%);box-shadow:inset 0 0 0 calc(var(--w)*.03) #1f4fa0,inset 0 0 calc(var(--w)*.1) rgba(0,0,0,.25)}
.ucard.uback.b-marine .bt{color:#1f4fa0;text-shadow:0 calc(var(--w)*.008) 0 #fff}
.ucard.uback.b-marine .bt2{color:#1f4fa0}
/* snail phone: a lagoon */
.ucard.uback.b-denden .fl{background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.25),transparent 30%),repeating-radial-gradient(circle at 50% 120%,rgba(255,255,255,.08) 0 3px,transparent 3px 10px),radial-gradient(120% 80% at 50% 40%,#3fc1b0,#0d5a63 80%)}
.ucard.uback.b-denden .bt{color:#ffe9b5;text-shadow:0 calc(var(--w)*.008) 0 #0a3a40}
.ucard.uback.b-denden .bt2{color:#d8fff6}
/* the Grand Line: an old sea chart */
.ucard.uback.b-chart .fl{background:repeating-linear-gradient(0deg,rgba(60,30,10,.12) 0 1px,transparent 1px calc(var(--w)*.12)),repeating-linear-gradient(90deg,rgba(60,30,10,.12) 0 1px,transparent 1px calc(var(--w)*.12)),#e8d3a1 url(assets/parchment.jpg) center/calc(var(--w)*3);box-shadow:inset 0 0 calc(var(--w)*.14) rgba(90,50,10,.7)}
.ucard.uback.b-chart .bt{color:#5a2a10;text-shadow:0 calc(var(--w)*.008) 0 #fff3c8}
.ucard.uback.b-chart .bt2{color:#5a2a10}
/* devil fruit: a violet swirl */
.ucard.uback.b-fruit .fl{background:repeating-conic-gradient(from 0deg at 50% 45%,rgba(255,255,255,.06) 0 10deg,transparent 10deg 20deg),radial-gradient(120% 80% at 50% 42%,#8e3fc0,#2a0a40 78%)}
.ucard.uback.b-fruit .bt{color:#ffd23f;text-shadow:0 calc(var(--w)*.008) 0 #3f1460}
.ucard.uback.b-fruit .bt2{color:#e6c8ff}
/* the small card backs fanned at each seat follow the chosen design */
html[data-back=strawhat] .useat .fanb i{background:linear-gradient(#f0c662,#b37a1c);border-color:#b3121b}
html[data-back=marine] .useat .fanb i{background:linear-gradient(#fff,#cdd8e8);border-color:#1f4fa0}
html[data-back=denden] .useat .fanb i{background:linear-gradient(#3fc1b0,#0d5a63);border-color:#ffe9b5}
html[data-back=chart] .useat .fanb i{background:linear-gradient(#efdcae,#c9a76a);border-color:#5a2a10}
html[data-back=fruit] .useat .fanb i{background:linear-gradient(#8e3fc0,#2a0a40);border-color:#ffd23f}
.dback{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(3,8,14,.72);backdrop-filter:blur(3px);padding:12px}
.dback[hidden]{display:none}
.dback .box{width:min(44rem,100%);max-height:calc(100vh - 24px);overflow:auto;background:#efe0bb url(assets/parchment.jpg) center/600px;color:#2b1a10;border-radius:14px;padding:1rem 1.1rem 1.2rem;box-shadow:0 0 0 2px #6b4423,0 0 0 4px #c9952f,0 30px 60px rgba(0,0,0,.7)}
.dback header{display:flex;align-items:center;gap:.6rem;margin-bottom:.3rem}
.dback h3{font:400 1.8rem/1 "Pirata One",serif;color:#2b1a10;flex:1}
.dback .x{appearance:none;border:0;background:none;color:#5a3a20;width:2.4rem;height:2.4rem;display:grid;place-items:center;border-radius:8px}
.dback .x svg{width:1.25rem;height:1.25rem;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.dback p.lead{font:500 .9rem/1.4 var(--body);color:#5a3a20;margin-bottom:.8rem}
.dback .opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(7.4rem,1fr));gap:.8rem}
.dback .opt{appearance:none;border:2px solid transparent;background:rgba(255,255,255,.3);border-radius:12px;padding:.6rem .4rem .5rem;display:flex;flex-direction:column;align-items:center;gap:.45rem;cursor:pointer;color:#2b1a10}
.dback .opt .ucard{--w:96px;flex:none;height:calc(var(--w)*1.48)}
.dback .opt b{font:400 1.1rem/1 "Pirata One",serif}
.dback .opt[aria-pressed=true]{border-color:#2b1a10;background:rgba(255,255,255,.6);box-shadow:0 0 0 2px #c9952f}
.dback h4{font:400 1.35rem/1 "Pirata One",serif;color:#2b1a10;margin:1.1rem 0 .6rem}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // the art for each back, drawn in a 60 x 60 box like the Jolly Roger
  const ART = {
    strawhat: `<svg viewBox="0 0 60 60" aria-hidden="true">
      <ellipse cx="30" cy="38" rx="27" ry="9" fill="#f2cf72" stroke="${INK}" stroke-width="2"/>
      <path d="M8 37c6 3 14 4 22 4s16-1 22-4" stroke="#b9862c" stroke-width="1.2" fill="none"/>
      <path d="M16 36c0-13 6-21 14-21s14 8 14 21c-4 2-9 3-14 3s-10-1-14-3z" fill="#f6d77e" stroke="${INK}" stroke-width="2"/>
      <path d="M16.3 31c4 1.6 8.6 2.4 13.7 2.4s9.7-.8 13.7-2.4l.3 5c-4 2-9 3-14 3s-10-1-14-3z" fill="#c8281e" stroke="${INK}" stroke-width="1.6"/>
      <g stroke="#b9862c" stroke-width=".9" fill="none" opacity=".8"><path d="M20 22c3-1 6-1.5 10-1.5s7 .5 10 1.5"/><path d="M18 27c4-1 8-1.5 12-1.5s8 .5 12 1.5"/><path d="M24 17l1 13M30 15v15M36 17l-1 13"/></g>
      <path d="M22 20c2-3 4-4 7-4.5" stroke="#fff6d6" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/></svg>`,
    marine: `<svg viewBox="0 0 60 60" aria-hidden="true">
      <g fill="none" stroke="#1f4fa0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="30" cy="22" r="3.4"/><path d="M30 25.5V52"/><path d="M21 31h18"/><path d="M14 40c2 8 8 12 16 12s14-4 16-12"/><path d="M10 43l4-4 5 3M50 43l-4-4-5 3"/></g>
      <path d="M6 14c6-6 14-7 20-2l4 4 4-4c6-5 14-4 20 2-7-2-13-1-17 3l-7 6-7-6c-4-4-10-5-17-3z" fill="#fff" stroke="#1f4fa0" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="30" cy="15" r="2.6" fill="#fff" stroke="#1f4fa0" stroke-width="1.6"/><path d="M32 15l3 1-3 1" fill="#f2b51c"/></svg>`,
    denden: `<svg viewBox="0 0 60 60" aria-hidden="true">
      <path d="M6 48c0-5 4-8 10-8h24c6 0 10-3 12-8 3 1 4 4 3 8-1 6-6 9-13 9H10c-2 0-4 0-4-1z" fill="#9ccc4a" stroke="${INK}" stroke-width="2"/>
      <path d="M46 34c1-6 0-11-2-15M50 33c2-5 3-10 2-14" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="44" cy="18" r="3.4" fill="#fff" stroke="${INK}" stroke-width="1.6"/><circle cx="44.6" cy="18.4" r="1.4" fill="${INK}"/>
      <circle cx="52" cy="18" r="3.4" fill="#fff" stroke="${INK}" stroke-width="1.6"/><circle cx="52.6" cy="18.4" r="1.4" fill="${INK}"/>
      <path d="M47 41c2 1 4 1 6-1" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="26" cy="31" r="14" fill="#f2c14e" stroke="${INK}" stroke-width="2"/>
      <circle cx="26" cy="31" r="9" fill="#fbe7b0" stroke="${INK}" stroke-width="1.4"/>
      <g fill="${INK}"><circle cx="26" cy="24.5" r="1.3"/><circle cx="32" cy="28" r="1.3"/><circle cx="32" cy="34" r="1.3"/><circle cx="26" cy="37.5" r="1.3"/><circle cx="20" cy="34" r="1.3"/><circle cx="20" cy="28" r="1.3"/></g>
      <path d="M12 16c0-3 2-5 5-5h18c3 0 5 2 5 5v2c0 1-1 2-2 2h-3c-1 0-2-1-2-2v-1H21v1c0 1-1 2-2 2h-5c-1 0-2-1-2-2z" fill="#2b2b2b" stroke="${INK}" stroke-width="1.6"/>
      <path d="M33 18c2 1 3 3 2 5" stroke="#2b2b2b" stroke-width="1.6" fill="none"/></svg>`,
    chart: `<svg viewBox="0 0 60 60" aria-hidden="true">      <circle cx="30" cy="30" r="25" fill="#3a8fc4" stroke="${INK}" stroke-width="2"/>
      <g clip-path="url(#glc)">
        <rect x="0" y="23" width="60" height="14" fill="#1d5f8f" opacity=".55"/>
        <rect x="0" y="27" width="60" height="6" fill="#8fd3f0"/>
        <path d="M0 24.5h60M0 35.5h60" stroke="#e8f6ff" stroke-width=".9" stroke-dasharray="2 2"/>
        <rect x="26.5" y="0" width="7" height="60" fill="#a8432a" stroke="${INK}" stroke-width="1.2"/>
        <path d="M27.5 8l2-2 2 3 1-1M28 50l2 2 2-3" stroke="#d97a52" stroke-width="1" fill="none"/>
        <g fill="#d9b36b" stroke="${INK}" stroke-width=".8"><circle cx="12" cy="30" r="1.6"/><circle cx="19" cy="29.5" r="1.3"/><circle cx="41" cy="30.5" r="1.5"/><circle cx="49" cy="29.5" r="1.3"/></g>
        <path d="M5 30c3-1 6 1 9 0s5-1 6 0" stroke="#fbf1d8" stroke-width=".8" fill="none" stroke-dasharray="1.5 1.5"/></g>
      <g transform="translate(47 47)"><circle r="7" fill="#fbf1d8" stroke="${INK}" stroke-width="1.2"/><path d="M0-6l1.6 6L0 6l-1.6-6z" fill="#b3121b"/><path d="M-6 0l6-1.6L6 0 0 1.6z" fill="${INK}" opacity=".6"/></g></svg>`,
    fruit: `<svg viewBox="0 0 60 60" aria-hidden="true">
      <path d="M30 14c0-4 2-7 5-9" stroke="#3f6b23" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M33 9c6-3 12-1 13 4-6 1-10 0-13-4z" fill="#5c9a33" stroke="${INK}" stroke-width="1.6"/>
      <path d="M30 14c-12 0-21 8-21 20 0 11 9 19 21 19s21-8 21-19c0-12-9-20-21-20z" fill="url(#dfA)" stroke="${INK}" stroke-width="2"/>
      <g stroke="#e6c8ff" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".9">
        <path d="M18 26c3-3 7-2 7 1s-4 3-4 1"/><path d="M33 22c3-3 8-2 8 2s-5 4-5 1"/><path d="M14 38c3-3 7-2 7 1s-4 3-4 1"/><path d="M28 34c4-4 10-3 10 2s-6 5-6 1"/><path d="M40 42c3-3 7-2 7 1s-4 3-4 1"/><path d="M24 46c3-3 7-2 7 1s-4 3-4 1"/></g>
      <path d="M16 24c3-4 7-6 11-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/></svg>`
  };
  // the chart's clip, defined once in a visible zero-size SVG (ids repeated per card would break when the first copy is hidden)
  document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><clipPath id="glc"><circle cx="30" cy="30" r="25"/></clipPath></defs></svg>');
  const DESIGNS = [
    { k: "sunwake", n: "The Sunwake", top: "GRAND LINE" },
    { k: "strawhat", n: "Straw Hat", top: "STRAW HAT" },
    { k: "marine", n: "Marine", top: "JUSTICE" },
    { k: "denden", n: "Snail Phone", top: "PURU PURU" },
    { k: "chart", n: "Grand Line Chart", top: "RED LINE" },
    { k: "fruit", n: "Devil Fruit", top: "AKUMA NO MI" }
  ];
  const valid = k => DESIGNS.some(d => d.k === k);
  if (!valid(cur)) cur = "sunwake";
  document.documentElement.dataset.back = cur;

  // the inner markup of a back; uno-ui.js wraps it in the card element. null means the Sunwake's own back
  function inner(k = cur) {
    if (k === "sunwake" || !ART[k]) return null;
    const d = DESIGNS.find(x => x.k === k);
    return { cls: "b-" + k, html: `<span class="fl">${ART[k]}</span><span class="bt2">${d.top}</span><span class="bt">UNO</span>` };
  }

  const ICON = '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 9l3-3 3 3M12 6v8M8 17h8"/>';
  const ICON_X = '<path d="M6 6l12 12M18 6L6 18"/>';
  const dlg = document.createElement("div"); dlg.className = "dback"; dlg.hidden = true; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-label", "Card design");
  document.body.appendChild(dlg);
  // the fronts are shown on Luffy's red 0, so every design is compared on the same card
  const sample = () => window.Uno ? Uno.CARDS.find(k => k.c === "r" && k.v === "0").id : 0;
  function html() {
    const F = window.UnoFaces, U = window.UnoUI;
    return `<div class="box"><header><h3>Card design</h3><button class="x" data-b="close" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON_X}</svg></button></header>
      <p class="lead">Choose how the cards look on your screen. It stays in this browser; every player picks their own, and nobody else's game changes.</p>
      ${F && U ? `<h4>Card fronts</h4><div class="opts">${F.list.map(d => `<button class="opt" data-b="face" data-k="${d.k}" aria-pressed="${d.k === F.get()}">${U.cardHTML(sample(), { face: d.k })}<b>${d.n}</b></button>`).join("")}</div>` : ""}
      <h4>Card backs</h4><div class="opts">${DESIGNS.map(d => `<button class="opt" data-b="pick" data-k="${d.k}" aria-pressed="${d.k === cur}">${U ? U.backHTML(d.k) : ""}<b>${d.n}</b></button>`).join("")}</div></div>`;
  }
  function open() { dlg.hidden = false; dlg.innerHTML = html(); }
  function close() { dlg.hidden = true; if (typeof render === "function") render(); }
  // redraw in place, keeping the panel's scroll position
  function redraw() { const box = dlg.querySelector(".box"), y = box ? box.scrollTop : 0; dlg.innerHTML = html(); const nb = dlg.querySelector(".box"); if (nb) nb.scrollTop = y; }
  function set(k) {
    if (!valid(k)) return;
    cur = k; document.documentElement.dataset.back = k;
    try { localStorage.setItem(KEY, k); } catch (e) { /* not remembered, still applied */ }
    redraw();
  }
  dlg.addEventListener("click", e => {
    if (e.target === dlg) return close();
    const b = e.target.closest("[data-b]"); if (!b) return;
    if (b.dataset.b === "close") return close();
    if (window.Sfx && b.dataset.b !== "close") Sfx.tap();
    if (b.dataset.b === "pick") set(b.dataset.k);
    if (b.dataset.b === "face" && window.UnoFaces) { UnoFaces.set(b.dataset.k); redraw(); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !dlg.hidden) close(); });
  document.addEventListener("click", e => { if (e.target.closest("[data-deckback]")) open(); });

  window.UnoBacks = {
    inner, get: () => cur,
    button: () => `<button class="btn ghost small backbtn" data-deckback aria-label="Card design: choose how the fronts and backs of the cards look" title="Card design"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON}</svg></button>`
  };
})();
