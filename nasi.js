// Nasi Lemak: the rules engine, shared by the browser and the server (like engine.js and uno.js).
// Follows Faculty of Fun's "Nasi Lemak The Game" rulebook: 50 ingredient cards (Rice, Egg, Peanuts, Sambal Bilis,
// Cucumber, 10 each), 25 action cards and a separate pile of 15 Nasi Lemak cards (8 with one pack, 7 with two).
// Deal 7. On your turn draw 2, then make up to 3 moves: make a Nasi Lemak, trade, or play an action card.
// First to 5 packs on their own turn wins; a pack with a Fly on it doesn't count.
(function (G) {
  "use strict";
  // Up to 10 players: from 6 players on, a second full deck (and a second Nasi Lemak pile) is shuffled in.
  const MAX_PLAYERS = 10, HAND = 7, MOVES = 3, GOAL = 5, TURN_MS = 120000, RESPOND_MS = 30000;
  const ING = {
    rice: { n: "Rice", ms: "Nasi" }, egg: { n: "Egg", ms: "Telur" }, peanut: { n: "Peanuts", ms: "Kacang" },
    sambal: { n: "Sambal Bilis", ms: "Sambal Bilis" }, cucumber: { n: "Cucumber", ms: "Timun" }
  };
  const ING_KEYS = Object.keys(ING);
  const ACTIONS = {
    supplier:   { n: "Supplier", ms: "Pembekal", count: 3, d: "Name an ingredient. Every other player gives you all of theirs." },
    thief:      { n: "Thief", ms: "Pencuri", count: 3, d: "Steal one random card from every other player's hand." },
    wholesaler: { n: "Wholesaler", ms: "Pemborong", count: 3, d: "Turn over the top 3 cards of the draw pile and keep the ingredients." },
    officer:    { n: "Officer", ms: "Pegawai", count: 3, d: "Look at another player's hand and take any 2 cards." },
    makcik:     { n: "Mak Cik Nasi Lemak", ms: "Mak Cik Nasi Lemak", count: 3, d: "Make a Nasi Lemak with only 3 different ingredients." },
    fly:        { n: "Fly", ms: "Lalat", count: 5, d: "Put a fly on another player's Nasi Lemak. It doesn't count until the fly is gone." },
    swatter:    { n: "Fly Swatter", ms: "Pemukul Lalat", count: 2, d: "Swat a fly off one of your Nasi Lemak." },
    fan:        { n: "Fan", ms: "Kipas", count: 3, d: "Fan the fly off one of your Nasi Lemak onto another player's." }
  };
  const tradable = t => !!ING[t] || t === "swatter" || t === "fan";

  const BASE = 75, NL_BASE = 15, DECKS = 2;
  const CARDS = [], NLC = [];
  for (let d = 0; d < DECKS; d++) {
    ING_KEYS.forEach(t => { for (let i = 0; i < 10; i++) CARDS.push({ t, kind: "ing" }); });
    for (const t in ACTIONS) for (let i = 0; i < ACTIONS[t].count; i++) CARDS.push({ t, kind: "act" });
    for (let i = 0; i < 8; i++) NLC.push({ packs: 1 });
    for (let i = 0; i < 7; i++) NLC.push({ packs: 2 });
  }
  CARDS.forEach((c, i) => { c.id = i; });
  NLC.forEach((c, i) => { c.id = i; });

  const card = id => CARDS[id];
  const typeOf = id => CARDS[id].t;
  const cardName = t => (ING[t] || ACTIONS[t]).n;
  const isIng = id => CARDS[id].kind === "ing";
  const decksFor = n => n <= 5 ? 1 : 2;
  const packsOf = n => (NLC[n] ? NLC[n].packs : 0);
  // Packs that count: a Nasi Lemak with a Fly on it scores nothing until the fly is gone.
  const packs = p => p.nl.reduce((t, e) => t + (e.fly == null ? packsOf(e.n) : 0), 0);

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1) : Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const clone = s => JSON.parse(JSON.stringify(s));
  const log = (s, m) => { s.log.push(m); if (s.log.length > 60) s.log.splice(0, s.log.length - 60); };
  const take = (arr, id) => { const i = arr.indexOf(id); if (i < 0) return false; arr.splice(i, 1); return true; };
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

  function newGame(players) {
    const n = players.length;
    const s = { kind: "nasi", status: "play", players: players.map(p => ({ uid: p.uid, nick: p.nick, hand: [], nl: [], made: 0, moved: 0 })),
      deck: shuffle(CARDS.filter(c => c.id < BASE * decksFor(n)).map(c => c.id)), discard: [], nlPile: shuffle(NLC.filter(c => c.id < NL_BASE * decksFor(n)).map(c => c.id)),
      turn: Math.floor(Math.random() * n), drew: false, moves: 0, pending: null, winner: null, turnN: 1, last: null, seq: 0, log: [] };
    for (let k = 0; k < HAND; k++) for (const P of s.players) P.hand.push(s.deck.pop());
    log(s, `The stalls are open. @${s.turn} goes first.`);
    return s;
  }

  function drawOne(s) {
    if (!s.deck.length) {
      if (!s.discard.length) return null;
      s.deck = shuffle(s.discard); s.discard = [];
      log(s, "The discard pile was shuffled into a new draw pile.");
    }
    return s.deck.pop();
  }
  function drawN(s, p, n) { let got = 0; for (let i = 0; i < n; i++) { const id = drawOne(s); if (id == null) break; s.players[p].hand.push(id); got++; } return got; }
  const stamp = (s, o) => { s.seq = (s.seq || 0) + 1; s.last = Object.assign({ n: s.seq }, o); };

  // When the Nasi Lemak pile has run out, the game ends after that turn: most packs wins, then most Nasi Lemak cards.
  function finishByPile(s) {
    const order = s.players.map((p, i) => i).sort((x, y) => packs(s.players[y]) - packs(s.players[x]) || s.players[y].nl.length - s.players[x].nl.length || x - y);
    s.status = "over"; s.winner = order[0]; s.pending = null;
    log(s, `The Nasi Lemak pile is empty. @${s.winner} sold the most and wins!`);
  }
  function advance(s) {
    if (!s.nlPile.length) return finishByPile(s);
    s.turn = (s.turn + 1) % s.players.length; s.drew = false; s.moves = 0; s.pending = null; s.turnN++;
    log(s, `@${s.turn}'s turn.`);
  }
  function checkWin(s, a) {
    if (s.status === "play" && packs(s.players[a]) >= GOAL) { s.status = "over"; s.winner = a; s.pending = null; log(s, `@${a} has ${GOAL} packs of Nasi Lemak and wins!`); }
  }

  // Applies one action by seat a. Returns { state } or { error }.
  function apply(s0, a, act) {
    const s = clone(s0), P = s.players[a];
    const err = m => ({ error: m });
    if (s.status === "paused") return err("The game is paused. Vote to continue first.");
    if (s.status !== "play") return err("The game is over.");
    if (!P) return err("You're not at this table.");
    const t = act && act.t, pd = s.pending;

    // The player asked to trade answers on someone else's turn.
    if (t === "answer") {
      if (!pd || pd.k !== "trade" || pd.to !== a) return err("There's no trade waiting for you.");
      const T = s.players[pd.from];
      if (!act.yes) {
        s.pending = null; stamp(s, { k: "trade", p: pd.from, q: a, ok: false });
        log(s, `@${a} turned down @${pd.from}'s trade.`);
        return { state: s };
      }
      const got = [], pool = P.hand.slice();
      for (const w of pd.want) for (let i = 0; i < w.n; i++) {
        const id = pool.find(x => typeOf(x) === w.t && !got.includes(x));
        if (id == null) return err(`You don't have enough ${cardName(w.t)} for this trade.`);
        got.push(id);
      }
      if (!pd.give.every(id => T.hand.includes(id))) { s.pending = null; log(s, "The trade fell through."); return { state: s }; }
      pd.give.forEach(id => { take(T.hand, id); P.hand.push(id); });
      got.forEach(id => { take(P.hand, id); T.hand.push(id); });
      s.pending = null; s.moves++; T.moved = (T.moved || 0) + 1;
      stamp(s, { k: "trade", p: pd.from, q: a, ok: true, gave: pd.give.length, got: got.length });
      log(s, `@${pd.from} and @${a} made a trade: ${plural(pd.give.length, "card")} for ${plural(got.length, "card")}.`);
      return { state: s };
    }

    if (s.turn !== a) return err("It's not your turn.");
    if (pd && pd.k === "trade") {
      if (t === "cancel") { s.pending = null; log(s, `@${a} withdrew the trade offer.`); return { state: s }; }
      return err("Wait for the answer to your trade, or withdraw it.");
    }
    if (pd && pd.k === "officer") {
      if (t !== "take") return err("Pick the cards you want to take first.");
      const T = s.players[pd.to], want = Math.min(2, T.hand.length), ids = Array.isArray(act.cards) ? act.cards : [];
      if (ids.length !== want || new Set(ids).size !== want || !ids.every(id => T.hand.includes(id))) return err(`Pick ${plural(want, "card")} from their hand.`);
      ids.forEach(id => { take(T.hand, id); P.hand.push(id); });
      s.pending = null;
      stamp(s, { k: "officer", p: a, q: pd.to, count: ids.length });
      log(s, `@${a} took ${plural(ids.length, "card")} from @${pd.to}.`);
      return { state: s };
    }

    if (t === "draw") {
      if (s.drew) return err("You've already drawn this turn.");
      const n = drawN(s, a, 2); s.drew = true;
      stamp(s, { k: "draw", p: a, count: n });
      log(s, `@${a} drew ${plural(n, "card")}.`);
      return { state: s };
    }
    if (!s.drew) return err("Draw your 2 cards first.");
    if (t === "end") { advance(s); return { state: s }; }
    if (s.moves >= MOVES) return err(`You've used your ${MOVES} moves. End your turn.`);

    if (t === "make") {
      if (!s.nlPile.length) return err("The Nasi Lemak pile is empty.");
      const ids = Array.isArray(act.cards) ? act.cards : [], mk = act.makcik;
      const need = mk != null ? 3 : 5;
      if (mk != null && (!P.hand.includes(mk) || typeOf(mk) !== "makcik")) return err("That Mak Cik card isn't in your hand.");
      if (ids.length !== need || new Set(ids).size !== need || !ids.every(id => P.hand.includes(id) && isIng(id))) return err(`Pick ${need} ingredients from your hand.`);
      if (new Set(ids.map(typeOf)).size !== need) return err(need === 5 ? "You need one of each: Rice, Egg, Peanuts, Sambal Bilis and Cucumber." : "Mak Cik needs 3 different ingredients.");
      [...ids, ...(mk != null ? [mk] : [])].forEach(id => { take(P.hand, id); s.discard.push(id); });
      const n = s.nlPile.pop();
      P.nl.push({ n, fly: null }); P.made = (P.made || 0) + 1; P.moved = (P.moved || 0) + 1; s.moves++;
      stamp(s, { k: "make", p: a, makcik: mk != null });
      log(s, `@${a} wrapped a Nasi Lemak${mk != null ? " with Mak Cik's help" : ""}!`);
      checkWin(s, a);
      return { state: s };
    }

    if (t === "trade") {
      const q = act.p, Q = s.players[q];
      if (q === a || !Q) return err("Choose another player to trade with.");
      const give = Array.isArray(act.give) ? act.give : [];
      const want = (Array.isArray(act.want) ? act.want : []).filter(w => w && w.n > 0);
      if (new Set(give).size !== give.length || !give.every(id => P.hand.includes(id))) return err("Offer cards from your hand.");
      if (!give.every(id => tradable(typeOf(id)))) return err("Only ingredients, Fly Swatters and Fans can be traded.");
      if (!want.every(w => tradable(w.t) && Number.isInteger(w.n) && w.n <= 10)) return err("Ask only for ingredients, Fly Swatters or Fans.");
      if (!give.length && !want.length) return err("Offer or ask for at least one card.");
      s.pending = { k: "trade", from: a, to: q, give, want };
      stamp(s, { k: "offer", p: a, q });
      log(s, `@${a} offered @${q} a trade.`);
      return { state: s };
    }

    if (t === "play") {
      const id = act.card;
      if (!P.hand.includes(id) || isIng(id)) return err("That isn't an action card in your hand.");
      const k = typeOf(id), others = s.players.map((x, i) => i).filter(i => i !== a);
      const Q = s.players[act.p];
      const needOther = () => (act.p === a || !Q) ? "Choose another player." : null;
      let discard = true, info = {};
      switch (k) {
        case "makcik": return err("Use Mak Cik when you make a Nasi Lemak.");
        case "supplier": {
          if (!ING[act.ing]) return err("Name an ingredient.");
          let n = 0;
          others.forEach(i => { const O = s.players[i]; O.hand.filter(x => typeOf(x) === act.ing).forEach(x => { take(O.hand, x); P.hand.push(x); n++; }); });
          info = { ing: act.ing, count: n };
          log(s, `@${a} called for ${ING[act.ing].n} and collected ${n}.`);
          break;
        }
        case "thief": {
          let n = 0;
          others.forEach(i => { const O = s.players[i]; if (!O.hand.length) return; const x = O.hand[Math.floor(Math.random() * O.hand.length)]; take(O.hand, x); P.hand.push(x); n++; });
          info = { count: n };
          log(s, `@${a} sent the Thief round and stole ${plural(n, "card")}.`);
          break;
        }
        case "wholesaler": {
          const shown = [];
          take(P.hand, id); s.discard.push(id); discard = false;
          for (let i = 0; i < 3; i++) { const x = drawOne(s); if (x == null) break; shown.push(x); if (isIng(x)) P.hand.push(x); else s.discard.push(x); }
          info = { shown };
          log(s, `@${a} called the Wholesaler: ${shown.length ? shown.map(x => cardName(typeOf(x))).join(", ") : "nothing left"}. They keep the ingredients.`);
          break;
        }
        case "officer": {
          const e = needOther(); if (e) return err(e);
          if (!Q.hand.length) return err("That player has no cards in hand.");
          s.pending = { k: "officer", from: a, to: act.p };
          info = { q: act.p };
          log(s, `@${a} sent the Officer to inspect @${act.p}'s hand.`);
          break;
        }
        case "fly": {
          const e = needOther(); if (e) return err(e);
          const slot = Q.nl[act.slot];
          if (!slot || slot.fly != null) return err("Choose one of their Nasi Lemak without a fly.");
          take(P.hand, id); slot.fly = id; discard = false;
          info = { q: act.p, slot: act.slot };
          log(s, `@${a} landed a Fly on @${act.p}'s Nasi Lemak!`);
          break;
        }
        case "swatter": {
          const slot = P.nl[act.slot];
          if (!slot || slot.fly == null) return err("Choose one of your Nasi Lemak with a fly on it.");
          s.discard.push(slot.fly); slot.fly = null;
          info = { slot: act.slot };
          log(s, `@${a} swatted the fly off their Nasi Lemak.`);
          break;
        }
        case "fan": {
          const from = P.nl[act.slot];
          if (!from || from.fly == null) return err("Choose one of your Nasi Lemak with a fly on it.");
          const e = needOther(); if (e) return err(e);
          const to = Q.nl[act.to];
          if (!to || to.fly != null) return err("Choose one of their Nasi Lemak without a fly.");
          to.fly = from.fly; from.fly = null;
          info = { q: act.p, slot: act.slot, to: act.to };
          log(s, `@${a} fanned the fly over to @${act.p}'s Nasi Lemak.`);
          break;
        }
        default: return err("Unknown card.");
      }
      if (discard) { take(P.hand, id); s.discard.push(id); }
      s.moves++; P.moved = (P.moved || 0) + 1;
      stamp(s, Object.assign({ k, p: a }, info));
      checkWin(s, a);
      return { state: s };
    }
    return err("Unknown move.");
  }

  // ---- turn clock: two minutes a turn; a trade offer waits 30 seconds for an answer ----
  function syncClock(prev, s, now) {
    if (s.status !== "play") { s.clock = null; return s; }
    const fresh = !prev || prev.status !== "play" || !prev.clock || prev.created !== s.created || prev.turnN !== s.turnN;
    const c = fresh ? { turn: s.turn, left: TURN_MS, since: now, resp: null, wait: [] } : Object.assign({}, prev.clock);
    const tr = s.pending && s.pending.k === "trade";
    const same = tr && prev && prev.pending && prev.pending.k === "trade" && prev.pending.to === s.pending.to && c.resp;
    c.resp = tr ? (same ? c.resp : now + RESPOND_MS) : null;
    c.wait = tr ? [s.pending.to] : [];
    s.clock = c;
    return s;
  }
  function expire(s0, now) {
    const c = s0.clock;
    if (s0.status !== "play" || !c) return null;
    let s = s0, changed = false;
    const run = (seat, act) => { const r = apply(s, seat, act); if (!r.error) { s = r.state; changed = true; } return !r.error; };
    if (s.pending && s.pending.k === "trade" && c.resp && now >= c.resp) {
      const q = s.pending.to;
      if (run(q, { t: "answer", yes: false })) log(s, `@${q} didn't answer in time.`);
    }
    if (now - c.since >= c.left) {
      const a = s.turn;
      if (s === s0) s = clone(s0);
      log(s, `@${a} ran out of time.`); changed = true;
      if (s.pending && s.pending.k === "trade") s.pending = null;
      if (s.pending && s.pending.k === "officer") { const T = s.players[s.pending.to]; run(a, { t: "take", cards: shuffle(T.hand.slice()).slice(0, Math.min(2, T.hand.length)) }); }
      if (!s.drew) run(a, { t: "draw" });
      if (s.status === "play" && s.turn === a) { if (!run(a, { t: "end" })) { s.pending = null; advance(s); } }
    }
    return changed ? syncClock(s0, s, now) : null;
  }
  const waitingOn = s => s.status !== "play" ? [] : s.pending && s.pending.k === "trade" ? [s.pending.to] : [s.turn];

  // ---- ranking (its own Hall of Fame: Stall Champions) ----
  // Winner 100; the rest place by packs, then Nasi Lemak cards: 2nd 60, 3rd 45, everyone else 30.
  // Everyone also gets 5 EXP per Nasi Lemak they made, up to 25.
  const XP = { win: 100, second: 60, third: 45, rest: 30, perMake: 5, makeCap: 25 };
  function awards(s) {
    if (s.status !== "over" || s.winner == null) return [];
    const others = s.players.map((p, i) => i).filter(i => i !== s.winner)
      .sort((x, y) => packs(s.players[y]) - packs(s.players[x]) || s.players[y].nl.length - s.players[x].nl.length);
    const order = [s.winner, ...others];
    return s.players.map((p, i) => {
      const place = order.indexOf(i) + 1;
      const parts = { place: place === 1 ? XP.win : place === 2 ? XP.second : place === 3 ? XP.third : XP.rest, made: Math.min(XP.makeCap, XP.perMake * (p.made || 0)) };
      return { p: i, nick: p.nick || "", place, packs: packs(p), made: p.made || 0, parts, xp: parts.place + parts.made, won: place === 1 };
    });
  }

  G.Nasi = { MAX_PLAYERS, BASE, NL_BASE, HAND, MOVES, GOAL, TURN_MS, RESPOND_MS, ING, ING_KEYS, ACTIONS, CARDS, NLC, XP, card, typeOf, cardName, isIng, tradable,
    packs, packsOf, decksFor, newGame, apply, syncClock, expire, waitingOn, awards, shuffle };
})(typeof window !== "undefined" ? window : globalThis);
