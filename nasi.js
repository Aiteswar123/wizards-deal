// Nasi Lemak: the rules engine, shared by the browser and the server (like engine.js and uno.js).
// Follows Faculty of Fun's "Nasi Lemak The Game" rulebook: 50 ingredient cards (Rice, Egg, Peanuts, Sambal Bilis,
// Cucumber, 10 each), 25 action cards and a separate pile of 15 Nasi Lemak cards (8 with one pack, 7 with two).
// Deal 7. On your turn draw 2, then make up to 3 moves: make a Nasi Lemak, trade, or play an action card.
// Twist: every round a Kopitiam event is flipped for the whole table (EVENTS) and bends one rule until the next round.
// First to 5 packs on their own turn wins; a pack with a Fly on it doesn't count.
(function (G) {
  "use strict";
  // Up to 10 players: from 6 players on, a second full deck (and a second Nasi Lemak pile) is shuffled in.
  const MAX_PLAYERS = 10, HAND = 7, MOVES = 3, GOAL = 5, TURN_MS = 180000, RESPOND_MS = 30000;
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
  // Card designs each player can show the table (nasi-ui.js draws them): fronts for the cards you play, backs for your hand.
  const STYLES = { faces: ["classic", "batik", "songket", "kopitiam", "pasar", "kampung", "boboiboy"], backs: ["daun", "batik", "songket", "jubin", "wau", "boboiboy"] };
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
  // a wrapped Nasi Lemak's packs: its card, plus a Lunch Rush bonus if it earned one
  const entryPacks = e => packsOf(e.n) + (e.bonus || 0);
  // Packs that count: a Nasi Lemak with a Fly on it scores nothing until the fly is gone.
  const packs = p => p.nl.reduce((t, e) => t + (e.fly == null ? entryPacks(e) : 0), 0);

  // ---- Kopitiam events: each round (every player's turn once, from the first player) flips one for the whole table ----
  const EVENTS = {
    hujan:   { n: "Hujan Lebat", ms: "Heavy rain", d: "No trading this round." },
    rush:    { n: "Lunch Rush", ms: "Waktu makan tengah hari", d: "The first Nasi Lemak wrapped this round is worth +1 pack." },
    pasar:   { n: "Pasar Malam", ms: "Night market", d: "Trades don't use a move this round." },
    kenduri: { n: "Kenduri", ms: "Feast", d: "Draw 3 cards instead of 2 this round." },
    raya:    { n: "Hari Raya Open House", ms: "Rumah terbuka", d: "Everyone's friends: no Thief, Officer, Supplier, Fly or Fan this round." },
    lewat:   { n: "Buka Lewat", ms: "Open late", d: "4 moves instead of 3 this round." }
  };
  const EVENT_KEYS = Object.keys(EVENTS);
  const RAYA_BLOCKS = ["thief", "officer", "supplier", "fly", "fan"];
  const evk = s => s.event && s.event.k;
  const movesFor = s => MOVES + (evk(s) === "lewat" ? 1 : 0);
  // an empty hand at the start of your turn draws one extra card
  const emptyHanded = s => { const P = s.players[s.turn]; return !!P && !s.drew && !P.hand.length; };
  const drawFor = s => (evk(s) === "kenduri" ? 3 : 2) + (emptyHanded(s) ? 1 : 0);
  // the next event from a shuffled stack, never the one just played
  function flipEvent(s) {
    if (!s.events || !s.events.length) s.events = shuffle(EVENT_KEYS.slice());
    if (s.events[s.events.length - 1] === evk(s) && s.events.length > 1) s.events.unshift(s.events.pop());
    s.round = (s.round || 0) + 1;
    s.event = { k: s.events.pop(), round: s.round };
    const E = EVENTS[s.event.k];
    log(s, `Round ${s.round} · Kopitiam event: ${E.n}. ${E.d}`);
  }

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
    const s = { kind: "nasi", status: "play", players: players.map(p => Object.assign({ uid: p.uid, nick: p.nick, hand: [], nl: [], made: 0, moved: 0 }, p.face ? { face: p.face } : {}, p.back ? { back: p.back } : {})),
      deck: shuffle(CARDS.filter(c => c.id < BASE * decksFor(n)).map(c => c.id)), discard: [], nlPile: shuffle(NLC.filter(c => c.id < NL_BASE * decksFor(n)).map(c => c.id)),
      turn: Math.floor(Math.random() * n), drew: false, moves: 0, pending: null, winner: null, turnN: 1, last: null, seq: 0, log: [] };
    for (let k = 0; k < HAND; k++) for (const P of s.players) P.hand.push(s.deck.pop());
    log(s, `The stalls are open. @${s.turn} goes first.`);
    s.first = s.turn; flipEvent(s);
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
  const toDiscard = (s, id, a) => { s.discard.push(id); s.by = s.by || {}; s.by[id] = a; };
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
    // back round to the first player: a new round and a new event
    if (s.turn === (s.first != null ? s.first : 0)) flipEvent(s);
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

    // Open market: while a player's trade is up, everyone else bids with cards from their own hand.
    // An empty bid takes yours back. Bids are public, so players can outbid each other.
    if (t === "bid") {
      if (!pd || pd.k !== "market") return err("There's no market open right now.");
      if (pd.from === a) return err("You can't bid on your own trade.");
      const ids = Array.isArray(act.cards) ? act.cards : [];
      if (new Set(ids).size !== ids.length || !ids.every(id => P.hand.includes(id))) return err("Bid with cards from your hand.");
      if (!ids.every(id => tradable(typeOf(id)))) return err("Only ingredients, Fly Swatters and Fans can be traded.");
      if (ids.length > 10) return err("Bid at most 10 cards.");
      const had = pd.bids[a] != null;
      if (ids.length) pd.bids[a] = ids; else delete pd.bids[a];
      stamp(s, { k: "bid", p: a, q: pd.from });
      log(s, ids.length ? `@${a} ${had ? "changed their bid" : "bid"}: ${ids.map(id => cardName(typeOf(id))).join(", ")}.` : `@${a} took back their bid.`);
      return { state: s };
    }

    if (s.turn !== a) return err("It's not your turn.");
    if (pd && (pd.k === "market" || pd.k === "trade")) {
      if (t === "cancel") { s.pending = null; log(s, `@${a} closed the market.`); return { state: s }; }
      if (t !== "accept" || pd.k !== "market") return err("Take a bid, or close the market first.");
      const q = act.p, bid = pd.bids[q], Q = s.players[q];
      if (!bid || !Q) return err("That player hasn't bid.");
      if (!pd.give.every(id => P.hand.includes(id))) { s.pending = null; log(s, "The trade fell through."); return { state: s }; }
      if (!bid.every(id => Q.hand.includes(id))) { delete pd.bids[q]; return err("That bid is no longer good."); }
      pd.give.forEach(id => { take(P.hand, id); Q.hand.push(id); });
      bid.forEach(id => { take(Q.hand, id); P.hand.push(id); });
      s.pending = null; if (evk(s) !== "pasar") s.moves++; P.moved = (P.moved || 0) + 1;
      stamp(s, { k: "trade", p: a, q, ok: true, gave: pd.give.length, got: bid.length });
      log(s, `@${a} took @${q}'s bid: ${pd.give.length ? pd.give.map(id => cardName(typeOf(id))).join(", ") : "nothing"} for ${bid.map(id => cardName(typeOf(id))).join(", ")}.`);
      return { state: s };
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
      const empty = emptyHanded(s), n = drawN(s, a, drawFor(s)); s.drew = true;
      stamp(s, { k: "draw", p: a, count: n });
      log(s, `@${a} drew ${plural(n, "card")}${empty ? " (empty hand: one extra)" : ""}.`);
      return { state: s };
    }
    if (!s.drew) return err(`Draw your ${drawFor(s)} cards first.`);
    if (t === "end") {
      // hand limit: anything over HAND cards goes on the discard pile before the turn passes
      const extra = P.hand.length - HAND, dump = Array.isArray(act.discard) ? act.discard : [];
      if (extra > 0) {
        if (dump.length !== extra || new Set(dump).size !== extra || !dump.every(id => P.hand.includes(id))) return err(`You can keep ${HAND} cards. Pick ${plural(extra, "card")} to discard.`);
        dump.forEach(id => { take(P.hand, id); toDiscard(s, id, a); });
        stamp(s, { k: "discard", p: a, count: extra });
        log(s, `@${a} discarded ${plural(extra, "card")} to keep ${HAND}.`);
      }
      advance(s); return { state: s };
    }
    if (s.moves >= movesFor(s)) return err(`You've used your ${movesFor(s)} moves. End your turn.`);

    if (t === "make") {
      if (!s.nlPile.length) return err("The Nasi Lemak pile is empty.");
      const ids = Array.isArray(act.cards) ? act.cards : [], mk = act.makcik;
      const need = mk != null ? 3 : 5;
      if (mk != null && (!P.hand.includes(mk) || typeOf(mk) !== "makcik")) return err("That Mak Cik card isn't in your hand.");
      if (ids.length !== need || new Set(ids).size !== need || !ids.every(id => P.hand.includes(id) && isIng(id))) return err(`Pick ${need} ingredients from your hand.`);
      if (new Set(ids.map(typeOf)).size !== need) return err(need === 5 ? "You need one of each: Rice, Egg, Peanuts, Sambal Bilis and Cucumber." : "Mak Cik needs 3 different ingredients.");
      [...ids, ...(mk != null ? [mk] : [])].forEach(id => { take(P.hand, id); toDiscard(s, id, a); });
      const n = s.nlPile.pop(), rush = evk(s) === "rush" && s.event.used == null;
      P.nl.push(Object.assign({ n, fly: null }, rush ? { bonus: 1 } : {})); P.made = (P.made || 0) + 1; P.moved = (P.moved || 0) + 1; s.moves++;
      if (rush) s.event.used = a;
      stamp(s, { k: "make", p: a, makcik: mk != null, rush });
      log(s, `@${a} wrapped a Nasi Lemak${mk != null ? " with Mak Cik's help" : ""}!${rush ? " Lunch Rush: +1 pack." : ""}`);
      checkWin(s, a);
      return { state: s };
    }

    if (t === "trade") {
      if (evk(s) === "hujan") return err("Hujan Lebat: no trading this round.");
      const give = Array.isArray(act.give) ? act.give : [];
      const want = (Array.isArray(act.want) ? act.want : []).filter(w => w && w.n > 0);
      if (new Set(give).size !== give.length || !give.every(id => P.hand.includes(id))) return err("Offer cards from your hand.");
      if (!give.every(id => tradable(typeOf(id)))) return err("Only ingredients, Fly Swatters and Fans can be traded.");
      if (!want.every(w => tradable(w.t) && Number.isInteger(w.n) && w.n <= 10)) return err("Ask only for ingredients, Fly Swatters or Fans.");
      if (!give.length && !want.length) return err("Offer or ask for at least one card.");
      s.pending = { k: "market", from: a, give, want, bids: {} };
      stamp(s, { k: "market", p: a });
      log(s, `@${a} opened the market: giving ${give.length ? give.map(id => cardName(typeOf(id))).join(", ") : "nothing"}${want.length ? `, looking for ${want.map(w => `${w.n} ${cardName(w.t)}`).join(", ")}` : ""}. Place your bids!`);
      return { state: s };
    }

    if (t === "play") {
      const id = act.card;
      if (!P.hand.includes(id) || isIng(id)) return err("That isn't an action card in your hand.");
      const k = typeOf(id), others = s.players.map((x, i) => i).filter(i => i !== a);
      if (evk(s) === "raya" && RAYA_BLOCKS.includes(k)) return err(`Hari Raya Open House: no ${cardName(k)} this round.`);
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
          take(P.hand, id); toDiscard(s, id, a); discard = false;
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
          toDiscard(s, slot.fly, a); slot.fly = null;
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
      if (discard) { take(P.hand, id); toDiscard(s, id, a); }
      s.moves++; P.moved = (P.moved || 0) + 1;
      stamp(s, Object.assign({ k, p: a }, info));
      checkWin(s, a);
      return { state: s };
    }
    return err("Unknown move.");
  }

  // ---- turn clock: three minutes a turn; the market stays open until the trader takes a bid, closes it, or runs out of time ----
  function syncClock(prev, s, now) {
    if (s.status !== "play") { s.clock = null; return s; }
    const fresh = !prev || prev.status !== "play" || !prev.clock || prev.created !== s.created || prev.turnN !== s.turnN;
    const c = fresh ? { turn: s.turn, left: TURN_MS, since: now, resp: null, wait: [] } : Object.assign({}, prev.clock);
    c.resp = null; c.wait = [];
    s.clock = c;
    return s;
  }
  function expire(s0, now) {
    const c = s0.clock;
    if (s0.status !== "play" || !c) return null;
    let s = s0, changed = false;
    const run = (seat, act) => { const r = apply(s, seat, act); if (!r.error) { s = r.state; changed = true; } return !r.error; };
    if (now - c.since >= c.left) {
      const a = s.turn;
      if (s === s0) s = clone(s0);
      log(s, `@${a} ran out of time.`); changed = true;
      if (s.pending && (s.pending.k === "market" || s.pending.k === "trade")) s.pending = null;
      if (s.pending && s.pending.k === "officer") { const T = s.players[s.pending.to]; run(a, { t: "take", cards: shuffle(T.hand.slice()).slice(0, Math.min(2, T.hand.length)) }); }
      if (!s.drew) run(a, { t: "draw" });
      // out of time with too many cards: random ones go to the discard pile
      const P = s.players[a], dump = shuffle(P.hand.slice()).slice(0, Math.max(0, P.hand.length - HAND));
      if (s.status === "play" && s.turn === a) { if (!run(a, { t: "end", discard: dump })) { s.pending = null; advance(s); } }
    }
    return changed ? syncClock(s0, s, now) : null;
  }
  // during a market the trader decides; everyone who hasn't bid yet may still want to
  const waitingOn = s => s.status !== "play" ? [] : s.pending && s.pending.k === "market"
    ? [s.turn, ...s.players.map((p, i) => i).filter(i => i !== s.turn && s.pending.bids[i] == null)] : [s.turn];

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

  G.Nasi = { STYLES, MAX_PLAYERS, BASE, NL_BASE, HAND, MOVES, GOAL, TURN_MS, RESPOND_MS, ING, ING_KEYS, ACTIONS, CARDS, NLC, XP, card, typeOf, cardName, isIng, tradable,
    packs, packsOf, entryPacks, EVENTS, RAYA_BLOCKS, movesFor, drawFor, decksFor, newGame, apply, syncClock, expire, waitingOn, awards, shuffle };
})(typeof window !== "undefined" ? window : globalThis);
