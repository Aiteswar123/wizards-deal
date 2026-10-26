/* Hitman: the table screen, home masthead and rules. A contract dossier in a dark room: charcoal and blood red,
   brass gold, paper files, a sniper's scope when someone draws the Hitman.
   Uses the page's shared helpers: S, me, mySeat, nameOf, esc, fmt, act, flash, netDown, sndBtn, $app. */
(function () {
  "use strict";
  const H = window.Hitman;
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Semi+Condensed:wght@500;600;700&display=swap";
  document.head.appendChild(font);
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet"; sheet.href = "hitman.css";
  document.head.appendChild(sheet);

  // ---- card emblems: one 24px grid, 1.8 stroke, round joins ----
  const ICON = {
    angel: '<circle cx="12" cy="5" r="2.6"/><ellipse cx="12" cy="3.2" rx="4.2" ry="1.1"/><path d="M12 8v9M8.5 21h7M12 10c-3-2.5-7-2-9 1 3 0 5 1 6.5 3M12 10c3-2.5 7-2 9 1-3 0-5 1-6.5 3"/>',
    attack: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
    bottom: '<rect x="5" y="3" width="14" height="4" rx="1"/><rect x="5" y="9" width="14" height="4" rx="1"/><path d="M12 15v6M8.5 18 12 21.5 15.5 18"/>',
    cancel: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
    chain: '<rect x="2.5" y="8.5" width="10" height="7" rx="3.5"/><rect x="11.5" y="8.5" width="10" height="7" rx="3.5"/>',
    future: '<path d="M2 12c3-5 6.5-7 10-7s7 2 10 7c-3 5-6.5 7-10 7s-7-2-10-7z"/><circle cx="12" cy="12" r="3.2"/>',
    hitman: '<path d="M5.5 9.5h13M7.5 9.5 8.6 4.6c.2-.9 1-1.3 1.8-1l1.6.6 1.6-.6c.8-.3 1.6.1 1.8 1l1.1 4.9"/><path d="M8 12.5c0 3 1.8 5 4 5s4-2 4-5"/><path d="M4 22c1-3 4.2-4.5 8-4.5s7 1.5 8 4.5M12 17.5v4.5"/>',
    inferno: '<path d="M12 22c-4 0-6.5-2.7-6.5-6.2 0-3.7 3.2-5.6 3.6-9.8 2.8 1.6 4.4 4 4.4 6.6 1-1 1.6-2.4 1.6-3.8 2.3 1.9 3.4 4.4 3.4 7 0 3.5-2.5 6.2-6.5 6.2z"/><path d="M12 22c-1.7 0-2.8-1.2-2.8-2.8 0-1.8 1.6-2.6 2-4.6 1.6 1 2.6 2.6 2.6 4 .4-.4.7-.9.7-1.6 1 .9 1.3 1.8 1.3 2.4 0 1.6-1.5 2.6-3.8 2.6z"/>',
    mirror: '<path d="M12 3v18"/><path d="M9 6 4 12l5 6zM15 6l5 6-5 6z"/>',
    redirect: '<path d="M4 18V12a5 5 0 0 1 5-5h10"/><path d="M15.5 3.5 19 7l-3.5 3.5"/><circle cx="4" cy="20" r="1.4"/>',
    reverse: '<path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5"/>',
    shuffle: '<path d="M3 7h3.5c4.5 0 6.5 10 11 10H21M3 17h3.5c1.7 0 2.9-1.4 3.9-3.2M14 10.2c1-1.8 2.2-3.2 3.9-3.2H21"/><path d="M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5"/>',
    skip: '<path d="M5 6l6 6-6 6M12 6l6 6-6 6"/>',
    steal: '<path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10M10 9V4a1.5 1.5 0 0 1 3 0v6M13 9.5V5a1.5 1.5 0 0 1 3 0v6.5M16 10a1.5 1.5 0 0 1 3 0v3.5c0 4.4-3 7.5-7 7.5s-6-2.6-7.4-5.4L3 12.7a1.4 1.4 0 0 1 2.3-1.6L7 13"/>',
    superattack: '<circle cx="9" cy="12" r="5.5"/><circle cx="16" cy="12" r="5.5"/><path d="M9 4v3M9 17v3M16 4v3M16 17v3"/>'
  };
  // the kind pip in each card's corner
  const PIP = {
    quick: '<path d="M13 2 5 13.5h6L10 22l9-12h-6.2z" fill="currentColor" stroke="none"/>',
    target: '<circle cx="12" cy="12" r="6.5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
    support: '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
    wild: '<path d="M12 3l2.6 6.1L21 9.6l-4.9 4.3 1.5 6.5L12 17l-5.6 3.4 1.5-6.5L3 9.6l6.4-.5z" fill="currentColor" stroke="none"/>',
    death: '<path d="M6 6l12 12M18 6 6 18"/>'
  };
  const svg = (paths, cls) => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ""} fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const KIND_LABEL = { quick: "Quick play", target: "Target", support: "Support", wild: "Wild", death: "Death" };

  function cardHTML(id, o = {}) {
    if (id == null || id < 0) return `<div class="hm-card back${o.small ? " small" : ""}"><span class="hm-cback">${svg(ICON.hitman)}</span></div>`;
    const t = H.typeOf(id), T = H.TYPES[t], tag = o.tag || "div";
    return `<${tag} class="hm-card k-${T.kind} t-${t}${o.small ? " small" : ""} ${o.cls || ""}" title="${esc(T.n)}: ${esc(T.d)}" ${o.attrs || ""}>
      <span class="hm-pip" aria-label="${KIND_LABEL[T.kind]}">${svg(PIP[T.kind])}</span>${svg(ICON[t], "hm-em")}<b>${esc(T.n)}</b>${o.small ? "" : `<i>${KIND_LABEL[T.kind]}</i>`}</${tag}>`;
  }

  // ---- the scope: the authored moment when someone draws a Hitman ----
  const fxEl = document.createElement("div");
  fxEl.className = "hm-fx"; fxEl.hidden = true; fxEl.setAttribute("role", "status"); fxEl.setAttribute("aria-live", "assertive");
  document.body.appendChild(fxEl);
  const fx = { seen: null, code: null, timer: null };
  function fxShow(kind, who) {
    const words = { hitman: ["Hitman", `${who} drew the Hitman`], save: ["Saved", `${who} survived with an Angel`], dead: ["Eliminated", `${who} is out`] }[kind];
    fxEl.className = `hm-fx fx-${kind}`;
    fxEl.innerHTML = `<div class="hm-scope"><span class="hm-ret"></span></div><div class="hm-fxtxt"><b>${esc(words[0])}</b><span>${esc(words[1])}</span></div>`;
    fxEl.hidden = false;
    clearTimeout(fx.timer); fx.timer = setTimeout(() => { fxEl.hidden = true; }, kind === "hitman" ? 1500 : 1900);
  }
  function fxObserve(v) {
    const L = S.last;
    if (fx.code !== S.code) { fx.code = S.code; fx.seen = null; }
    if (!L) { if (fx.seen === null) fx.seen = 0; return; }
    if (fx.seen === null || L.n < fx.seen) { fx.seen = L.n; return; }
    if (L.n === fx.seen) return;
    fx.seen = L.n;
    if (L.k === "hitman" || L.k === "save" || L.k === "dead") fxShow(L.k, L.p === v ? "You" : nameOf(L.p));
  }

  // ---- your look for this table: nothing to sync, but the page asks every game for it ----
  const ui = { sel: null, redirect: false, save: null, key: "" };
  function reset() { ui.sel = null; ui.redirect = false; ui.save = null; ui.key = ""; }
  const alive = () => S.players.map((p, i) => i).filter(i => S.players[i].alive);
  const nm = (i, v) => i === v ? "you" : nameOf(i);
  const hitmenLeft = () => Math.max(0, alive().length - 1 - (S.pending && S.pending.k === "hitman" ? 1 : 0));

  function panelHTML(v) {
    const P = S.players[v], pd = S.pending;
    if (S.status !== "play") return `<h3>Contract closed</h3><p class="hm-muted">Thanks for playing.</p>`;
    if (!P.alive) return `<h3>You're out</h3><p class="hm-muted">You drew the Hitman. Stay and watch who's left standing.</p>`;
    // a Hitman in your hand
    if (pd && pd.k === "hitman" && pd.p === v) {
      const savers = H.saverOf(S, v), pick = ui.save != null && savers.includes(ui.save) ? ui.save : savers[0];
      return `<div class="hm-alarm"><h3>You drew the Hitman</h3>
        <p>Use ${savers.length > 1 ? "a card" : H.typeOf(pick) === "mirror" ? "your Mirror (it copies the Angel just played)" : "your Angel"} to survive, then choose where the Hitman goes back into the deck.</p>
        ${savers.length > 1 ? `<div class="hm-row">${savers.map(id => `<button class="hm-chip${id === pick ? " on" : ""}" data-h="saver" data-id="${id}">${esc(H.cardName(H.typeOf(id)))}</button>`).join("")}</div>` : ""}
        <div class="hm-pos">${[["top", "On top"], ["second", "2nd"], ["third", "3rd"], ["bottom", "Bottom"], ["random", "Random"]].map(([k, l]) => `<button class="hm-btn${k === "top" ? " red" : ""}" data-h="save" data-pos="${k}" data-id="${pick}">${l}</button>`).join("")}</div>
        <p class="hm-muted small">Answer within <b data-clock="resp">0:25</b> or it goes back at random.</p></div>`;
    }
    if (pd && pd.k === "hitman") return `<h3>${esc(nameOf(pd.p))} drew the Hitman</h3><p class="hm-muted">Will they survive?</p>`;
    // a Steal: pick the card to hand over
    if (pd && pd.k === "give" && pd.from === v) return `<h3>${esc(nameOf(pd.to))} is stealing from you</h3><p class="hm-muted">Tap the card you'll hand over. Answer within <b data-clock="resp">0:25</b> or a random one goes.</p>`;
    if (pd && pd.k === "give") return `<h3>${esc(nameOf(pd.to))} is stealing from ${esc(nameOf(pd.from))}</h3><p class="hm-muted">They're choosing which card to hand over.</p>`;
    // the reaction window: what's on the table and how you can answer it
    if (pd && pd.k === "window") return windowHTML(v);
    if (S.turn !== v) return `<h3>${esc(nameOf(S.turn))}'s turn</h3><p class="hm-muted">Hold your Cancels: you can answer any card they play.</p>`;
    if (ui.sel != null) return selectedHTML(v);
    const left = S.left > 1 ? `<p class="hm-owe">You must take <b>${S.left}</b> turns.</p>` : "";
    return `<h3>Your turn</h3>${left}<p class="hm-muted">Draw to end your turn, or play cards first. Tap a card in your hand to play it.</p>
      <div class="hm-row"><button class="hm-btn red big" data-h="draw">${svg(ICON.hitman)}Draw a card</button></div>`;
  }
  function selectedHTML(v) {
    const id = ui.sel, t = H.typeOf(id), T = H.TYPES[t];
    const as = t === "mirror" ? S.lastPlayed : null, eff = as || t;
    const head = `<h3>${esc(T.n)}${as ? ` <small>as ${esc(H.cardName(as))}</small>` : ""}</h3><p class="hm-muted small">${esc(as ? H.TYPES[as].d : T.d)}</p>`;
    const back = `<button class="hm-btn ghost" data-h="unsel">Back</button>`;
    if (t === "angel") return head + `<p class="hm-muted">Keep it. It saves you when you draw a Hitman.</p><div class="hm-row">${back}</div>`;
    if (["cancel", "inferno", "chain", "redirect"].includes(t)) return head + `<p class="hm-muted">Save it to answer a card someone plays.</p><div class="hm-row">${back}</div>`;
    if (t === "mirror" && (!as || as === "angel")) return head + `<p class="hm-muted">${as === "angel" ? "A Mirror right after an Angel only saves you from a Hitman." : "Nothing to copy yet."}</p><div class="hm-row">${back}</div>`;
    if (H.locked(S, t) || (as && H.locked(S, as))) return head + `<p class="hm-muted">Chained for now.</p><div class="hm-row">${back}</div>`;
    if (H.TARGET.includes(eff)) {
      const tg = alive().filter(i => i !== v && (eff !== "steal" || S.players[i].hand.length));
      return head + `<p class="hm-cap">Choose your target</p><div class="hm-targets">${tg.map(i => `<button class="hm-btn target" data-h="play" data-p="${i}">${svg(ICON.attack)}${esc(nameOf(i))}<small>${S.players[i].hand.length} cards</small></button>`).join("") || `<p class="hm-muted">Nobody to target.</p>`}</div><div class="hm-row">${back}</div>`;
    }
    return head + `<div class="hm-row"><button class="hm-btn red" data-h="play">Play ${esc(as ? `Mirror as ${H.cardName(as)}` : T.n)}</button>${back}</div>`;
  }
  function windowHTML(v) {
    const st = S.pending.stack, base = st[0], top = st[st.length - 1], P = S.players[v];
    const line = e => `<li class="${e.t === "cancel" || e.t === "inferno" ? "neg" : ""}">${cardHTML(e.card, { small: true })}<span><b>${esc(nm(e.by, v))}</b> ${e === base ? "played" : "answered with"} ${esc(e.as ? `Mirror as ${H.cardName(e.as)}` : H.cardName(e.t))}${e.p != null ? ` on <b>${esc(nm(e.p, v))}</b>` : ""}</span></li>`;
    const mine = P.hand.filter(id => H.QUICK.includes(H.typeOf(id)) && !H.locked(S, H.typeOf(id)));
    const can = id => { const k = H.typeOf(id), tt = top.t;
      if (k === "cancel") return tt !== "cancel" && !(tt === "steal" && !top.as);
      if (k === "inferno") return tt !== "mirror" && tt !== "inferno";
      if (k === "redirect") return H.TARGET.includes(base.as || base.t);
      return true; };
    const seen = new Set(), answers = mine.filter(id => { const k = H.typeOf(id); if (seen.has(k) || !can(id)) return false; seen.add(k); return true; });
    let act = "";
    if (ui.redirect) {
      const tg = alive().filter(i => !((base.as || base.t) === "steal" && i === base.by));
      act = `<p class="hm-cap">Send it to</p><div class="hm-targets">${tg.map(i => `<button class="hm-btn target" data-h="quick" data-k="redirect" data-p="${i}">${esc(nm(i, v))}</button>`).join("")}</div><div class="hm-row"><button class="hm-btn ghost" data-h="noredirect">Back</button></div>`;
    } else if (answers.length) act = `<div class="hm-row">${answers.map(id => { const k = H.typeOf(id); return `<button class="hm-btn quick" data-h="quick" data-k="${k}" data-id="${id}">${svg(ICON[k])}${esc(H.cardName(k))}</button>`; }).join("")}</div>`;
    else act = `<p class="hm-muted small">You have no Quick Play card to answer with.</p>`;
    return `<h3>Answer it?</h3><ol class="hm-stack">${st.map(line).join("")}</ol>
      <div class="hm-window"><span>Goes through in <b data-clock="resp">0:08</b></span></div>${act}`;
  }

  function seatHTML(i, v) {
    const O = S.players[i], on = S.status === "play" && S.turn === i && O.alive, pd = S.pending;
    const tags = [];
    if (!O.alive) tags.push(`<span class="hm-tag dead">Out</span>`);
    else if (on) tags.push(`<span class="hm-tag on">${S.left > 1 ? `On turn ×${S.left}` : "On turn"}</span>`);
    if (O.alive && S.owed && S.owed[i]) tags.push(`<span class="hm-tag owe">Owes ${S.owed[i]}</span>`);
    if (pd && pd.k === "hitman" && pd.p === i) tags.push(`<span class="hm-tag dead">Hitman!</span>`);
    const place = !O.alive ? S.players.length - S.out.indexOf(i) : 0;
    return `<article class="hm-seat${i === v ? " mine" : ""}${on ? " on" : ""}${O.alive ? "" : " out"}">
      <div class="hm-mug" aria-hidden="true"><span>${esc((nameOf(i) || "?").trim().charAt(0).toUpperCase())}</span>${svg(ICON.attack, "hm-x")}</div>
      <div class="hm-who"><b>${esc(i === v ? "You" : nameOf(i))}</b><span>${O.alive ? `${O.hand.length} card${O.hand.length === 1 ? "" : "s"}` : `Placed ${place}${place === 2 ? "nd" : place === 3 ? "rd" : "th"}`}</span></div>
      <div class="hm-tags">${tags.join("")}</div>${O.alive ? "" : `<span class="hm-stampout" aria-hidden="true">Eliminated</span>`}</article>`;
  }

  function render() {
    const v = mySeat(), P = S.players[v], pd = S.pending;
    const waiting = H.waitingOn(S);
    document.title = waiting.includes(v) && v >= 0 ? "Your move · Hitman" : "Hitman";
    const key = `${S.code}:${S.step}:${S.status}:${pd ? pd.k + (pd.stack ? pd.stack.length : "") : ""}`;
    if (key !== ui.key) { ui.key = key; ui.sel = null; ui.redirect = false; }
    if (P && ui.sel != null && !P.hand.includes(ui.sel)) ui.sel = null;
    const deckN = S.deck.length, hl = hitmenLeft(), death = deckN ? Math.round(100 * hl / deckN) : 0;
    const top = S.discard[S.discard.length - 1];
    const locks = Object.entries(S.locks || {});
    const say = S.status === "over" ? (S.winner === v ? "You're the last one standing" : `${esc(nameOf(S.winner))} wins`)
      : pd && pd.k === "hitman" ? `${esc(nm(pd.p, v))} drew the Hitman`
      : S.turn === v ? "Your turn" : `${esc(nameOf(S.turn))}'s turn`;
    const peek = S.peek && S.peek.p === v && S.peek.cards.length ? `<section class="hm-peek"><span class="hm-cap">The next cards, top first · only you can see them</span><div class="hm-peekrow">${S.peek.cards.map((id, k) => `<div class="hm-peekc">${cardHTML(id, { small: true })}<small>${["Top", "2nd", "3rd"][k]}</small></div>`).join("")}</div></section>` : "";
    const giving = pd && pd.k === "give" && pd.from === v;
    $app.innerHTML = `<div class="hm">
      <header class="hm-top"><span class="hm-mark">Hitman</span><span class="hm-code">Table ${esc(S.code)}</span><span class="grow"></span>${netDown ? `<span class="hm-muted">Reconnecting…</span>` : ""}${typeof sndBtn === "function" ? sndBtn() : ""}<button class="hm-btn ghost small" data-a="home">Leave table</button></header>
      <p class="hm-ticker">${fmt(S.log[S.log.length - 1] || "")}</p>
      ${S.status === "over" ? winHTML(v) : ""}
      <section class="hm-room" aria-label="The table">
        <div class="hm-seats">${S.players.map((_, i) => seatHTML(i, v)).join("")}</div>
        <div class="hm-deckbox">
          <div class="hm-pile"><div class="hm-deck">${cardHTML(-1)}<span class="hm-count">${deckN}</span></div><span class="hm-cap">Deck</span></div>
          <div class="hm-gauge" style="--d:${death}"><span class="hm-dial"><b>${death}%</b><small>Death</small></span><p><b>${hl}</b> Hitm${hl === 1 ? "a" : "e"}n left<br><b>${alive().length}</b> alive</p></div>
          <div class="hm-pile">${top != null ? cardHTML(top) : `<div class="hm-card ghost"></div>`}<span class="hm-cap">Last played</span></div>
          <div class="hm-status"><b class="hm-say">${say}</b>
            <span class="hm-dir">${svg(S.dir > 0 ? ICON.skip : '<path d="M19 6l-6 6 6 6M12 6l-6 6 6 6"/>')}${S.dir > 0 ? "Clockwise" : "Anticlockwise"}</span>
            ${S.clock && !pd ? `<span class="hm-clock">${svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>')}<b data-clock="turn">0:20</b></span>` : ""}
            ${locks.length ? `<span class="hm-locks">${locks.map(([t, n]) => `<span class="hm-lock">${svg(ICON.chain)}${esc(H.cardName(t))} · ${n}</span>`).join("")}</span>` : ""}</div>
        </div>
      </section>
      ${P ? `<div class="hm-zone">
        <section class="hm-panel${(pd && pd.k === "hitman" && pd.p === v) ? " alarm" : ""}" aria-live="polite">${panelHTML(v)}</section>
        <div class="hm-handwrap"><span class="hm-cap">Your hand · ${P.hand.length} cards · only you can see it</span>
          <div class="hm-hand">${P.hand.slice().sort((a, b) => H.typeOf(a).localeCompare(H.typeOf(b)) || a - b).map(id => cardHTML(id, { tag: "button", cls: (ui.sel === id ? "sel" : "") + (giving ? " give" : ""), attrs: `data-h="card" data-id="${id}"` })).join("") || `<p class="hm-muted">No cards in hand.</p>`}</div>
          ${peek}</div>
      </div>` : `<p class="hm-muted" style="margin-top:1rem">You're watching this game.</p>`}
      <section class="hm-log"><span class="hm-cap">Wire</span><ol>${S.log.slice(-25).map(m => `<li>${fmt(m)}</li>`).join("")}</ol></section>
      ${rulesHTML()}</div>`;
    fxObserve(v);
  }

  function winHTML(v) {
    const order = [S.winner, ...S.out.slice().reverse()];
    return `<div class="hm-win"><span class="hm-wincap">Contract complete</span><h2>${S.winner === v ? "You survived" : esc(nameOf(S.winner)) + " survived"}</h2>
      <ol class="hm-places">${order.map((i, k) => `<li><b>${k + 1}</b>${esc(nm(i, v))}</li>`).join("")}</ol>
      <div class="hm-row" style="justify-content:center">${S.host === me ? `<button class="hm-btn red" data-a="again">New contract</button>` : `<span class="hm-muted">The table owner can start a rematch.</span>`}<button class="hm-btn ghost" data-a="home">Leave table</button></div></div>`;
  }

  function mastHTML() {
    const fan = ["hitman", "angel", "attack", "cancel", "future"].map((t, k) => cardHTML(H.CARDS.find(c => c.t === t).id, { cls: `fan f${k}` })).join("");
    return `<header class="hm-mast hm"><div><h1>Hitman</h1>
      <p>One of these cards is a Hitman. Take turns drawing from the deck and don't be the one who finds it. Hold an Angel to survive, play Attacks, Skips and Cancels to push the danger onto everyone else. Last one standing wins. 2 to 10 players, each on their own phone or computer.</p></div>
      <div class="hm-mastfan" aria-hidden="true"><span class="hm-reticle"></span>${fan}</div></header>`;
  }
  function rulesHTML() {
    const rows = Object.entries(H.TYPES).map(([k, T]) => `<li>${svg(ICON[k])}<span><b>${esc(T.n)}</b> <em>${KIND_LABEL[T.kind]}</em>${T.count ? ` · ${T.count} per deck` : ""}<br>${esc(T.d)}</span></li>`).join("");
    return `<details class="hm-rules hm"><summary>How to play Hitman</summary><div class="cols">
      <div><h3>The contract</h3><ul class="plain">
        <li>Everyone starts with an <b>Angel</b> and ${H.START} more cards. The deck hides one <b>Hitman</b> fewer than the players still in.</li>
        <li>On your turn, play as many cards as you like, then <b>draw a card</b> to end it. Skip, Reverse, Bottom and Attack also end it.</li>
        <li>Draw a Hitman and you're out, unless you play an <b>Angel</b>: you survive and choose where the Hitman goes back into the deck, even right on top.</li>
        <li>After any card is played, everyone gets ${H.REACT_MS / 1000} seconds to answer with a <b>Quick Play</b> card: Cancel, Inferno, Chain, Redirect or Shuffle. Each answer gives the table the full ${H.REACT_MS / 1000} seconds again.</li>
        <li>Draw a Hitman, or have a card stolen, and you get ${H.RESPOND_MS / 1000} seconds to choose.</li>
        <li>You have ${H.TURN_MS / 1000} seconds a draw. Run out and you draw.</li>
        <li><b>Last one standing wins.</b> With 6 or more players, a second deck is shuffled in.</li></ul></div>
      <div><h3>The cards</h3><ul class="hm-cardlist">${rows}</ul></div></div>
      <p class="hm-muted small">Based on the Roblox game Hitman Card Game by Hitman Studio, itself inspired by Exploding Kittens. Fan-made and unofficial.</p></details>`;
  }
  function lobbyHTML() { return ""; }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-h]");
    if (!b || b.disabled || !S || S.kind !== "hitman" || view !== "game") return;
    const d = b.dataset, v = mySeat(), pd = S.pending, num = k => d[k] != null && d[k] !== "" ? +d[k] : undefined;
    switch (d.h) {
      case "card": {
        const id = +d.id;
        if (pd && pd.k === "give" && pd.from === v) return act({ t: "give", card: id });
        if (pd && pd.k === "window") {
          const k = H.typeOf(id);
          if (!H.QUICK.includes(k)) return flash("Only Quick Play cards can answer a card: Cancel, Inferno, Chain, Redirect or Shuffle.");
          if (k === "redirect") { ui.redirect = true; return render(); }
          return act({ t: "play", card: id });
        }
        if (S.turn !== v || pd) return flash(pd ? "Wait for the table to finish." : "Wait for your turn. You can still answer cards with Quick Play.");
        ui.sel = ui.sel === id ? null : id; return render();
      }
      case "unsel": ui.sel = null; return render();
      case "draw": return act({ t: "draw" });
      case "play": return act({ t: "play", card: ui.sel, p: num("p") });
      case "saver": ui.save = +d.id; return render();
      case "save": return act({ t: "save", card: +d.id, pos: d.pos });
      case "quick": {
        const P = S.players[v], id = d.id != null ? +d.id : P.hand.find(x => H.typeOf(x) === d.k);
        if (d.k === "redirect" && d.p == null) { ui.redirect = true; return render(); }
        return act({ t: "play", card: id, p: num("p") });
      }
      case "noredirect": ui.redirect = false; return render();
    }
  });

  window.HitmanUI = { render, mastHTML, rulesHTML, cardHTML, reset, lobbyHTML };
})();
