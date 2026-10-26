// Hitman: the rules engine, shared by the browser and the server (like engine.js, uno.js and nasi.js).
// Follows the Roblox "Hitman Card Game" (Hitman Studio), itself inspired by Exploding Kittens: take turns drawing,
// avoid the Hitman. Drawing a Hitman knocks you out unless you hold an Angel, which saves you and lets you choose where
// the Hitman goes back into the deck. The deck always holds one Hitman fewer than the players still alive. Last one
// standing wins. Original deck: Angel, Attack, Bottom, Cancel, Chain, Future, Hitman, Inferno, Mirror, Redirect, Reverse,
// Shuffle, Skip, Steal, plus Super Attack with 4 or more players. Room defaults from the game: 5 starting cards plus a
// starter Angel each. Card counts aren't published, so the deck below is our own.
// Quick Play cards (Cancel, Inferno, Chain, Redirect, Shuffle) can be played by anyone during the short reaction window
// that follows each card; Cancel and Inferno stop the card directly under them, so they can stop each other in turn.
(function (G) {
  "use strict";
  const MAX_PLAYERS = 10, START = 5, TURN_MS = 20000, RESPOND_MS = 25000, REACT_MS = 8000, LOCK_TURNS = 3;
  const TYPES = {
    angel:       { n: "Angel", kind: "support", d: "Saves you when you draw a Hitman. Then you choose where the Hitman goes back into the deck." },
    attack:      { n: "Attack", kind: "target", count: 5, d: "Ends your turn. The player you choose takes 2 turns. If you were attacked, the turns stack onto them: yours plus 2. You can attack yourself: your turn goes on and the turns stack onto you." },
    bottom:      { n: "Bottom", kind: "support", count: 3, d: "Draw from the bottom of the deck instead of the top." },
    cancel:      { n: "Cancel", kind: "quick", count: 4, d: "Play it any time, even on someone else's turn, to stop the card just played. It can't stop an Angel, a Steal or another Cancel." },
    chain:       { n: "Chain", kind: "quick", count: 2, d: "Play it on top of the card just played: nobody can play that card for 3 turns." },
    future:      { n: "Future", kind: "support", count: 4, d: "Look at the top 3 cards of the deck. Only you see them." },
    hitman:      { n: "Hitman", kind: "death", d: "Draw this and you're out, unless you have an Angel." },
    inferno:     { n: "Inferno", kind: "quick", count: 2, d: "Stops the card just played, like Cancel, and burns every copy of that card in everyone's hands back into the deck. It can't stop a Mirror or another Inferno." },
    mirror:      { n: "Mirror", kind: "wild", count: 3, d: "Copies the last card played (never Cancel). A Mirror right after an Angel can save you from a Hitman." },
    redirect:    { n: "Redirect", kind: "quick", count: 2, d: "When someone plays an Attack or a Steal, play this to choose who it hits instead." },
    reverse:     { n: "Reverse", kind: "support", count: 3, d: "End your turn without drawing, and reverse the direction of play." },
    shuffle:     { n: "Shuffle", kind: "quick", count: 4, d: "Shuffle the whole deck. Play it any time, even on someone else's turn." },
    skip:        { n: "Skip", kind: "support", count: 4, d: "End your turn without drawing a card." },
    steal:       { n: "Steal", kind: "target", count: 4, d: "Take a card from the player you choose. They pick which card you get." },
    superattack: { n: "Super Attack", kind: "support", count: 2, min: 4, d: "Every other player takes 2 turns when their turn comes. Your turn goes on. Only in games of 4 or more." }
  };
  const QUICK = ["cancel", "inferno", "chain", "redirect", "shuffle"];
  const TARGET = ["attack", "steal"];
  const EXTRA_ANGELS = 2;

  // Two full decks, numbered so card ids never move: the actions and extra Angels per deck, then a starter Angel
  // for every seat, then the Hitmen.
  const CARDS = [];
  for (let d = 0; d < 2; d++) {
    for (const t in TYPES) for (let i = 0; i < (TYPES[t].count || 0); i++) CARDS.push({ t, deck: d });
    for (let i = 0; i < EXTRA_ANGELS; i++) CARDS.push({ t: "angel", deck: d });
  }
  for (let i = 0; i < MAX_PLAYERS; i++) CARDS.push({ t: "angel", starter: i });
  for (let i = 0; i < MAX_PLAYERS - 1; i++) CARDS.push({ t: "hitman", hit: i });
  CARDS.forEach((c, i) => { c.id = i; });

  const typeOf = id => CARDS[id].t;
  const cardName = t => TYPES[t].n;
  const decksFor = n => n <= 5 ? 1 : 2;
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1) : Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const rnd = n => Math.floor(Math.random() * n);
  const clone = s => JSON.parse(JSON.stringify(s));
  const log = (s, m) => { s.log.push(m); if (s.log.length > 60) s.log.splice(0, s.log.length - 60); };
  const take = (arr, id) => { const i = arr.indexOf(id); if (i < 0) return false; arr.splice(i, 1); return true; };
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const stamp = (s, o) => { s.seq = (s.seq || 0) + 1; s.last = Object.assign({ n: s.seq }, o); };
  const alive = s => s.players.map((p, i) => i).filter(i => s.players[i].alive);
  const hitmenLeft = s => s.deck.filter(id => typeOf(id) === "hitman").length;
  const locked = (s, t) => (s.locks && s.locks[t]) > 0;
  // the deck's top is its last card
  const putBack = (s, id, pos) => {
    const n = s.deck.length;
    const at = pos === "top" ? n : pos === "second" ? Math.max(0, n - 1) : pos === "third" ? Math.max(0, n - 2) : pos === "bottom" ? 0 : rnd(n + 1);
    s.deck.splice(at, 0, id);
    return at;
  };

  function newGame(players) {
    const n = players.length, decks = decksFor(n);
    const pool = shuffle(CARDS.filter(c => c.deck != null && c.deck < decks && (!TYPES[c.t].min || n >= TYPES[c.t].min)).map(c => c.id));
    const s = { kind: "hitman", status: "play",
      players: players.map((p, i) => ({ uid: p.uid, nick: p.nick, hand: [CARDS.find(c => c.starter === i).id], alive: true, played: 0, saves: 0 })),
      deck: pool, discard: [], out: [], turn: rnd(n), dir: 1, left: 1, owed: {}, locks: {}, pending: null, peek: null, lastPlayed: null,
      winner: null, turnN: 1, step: 1, last: null, seq: 0, log: [] };
    for (let k = 0; k < START; k++) for (const P of s.players) P.hand.push(s.deck.pop());
    CARDS.filter(c => c.hit != null && c.hit < n - 1).forEach(c => s.deck.push(c.id));
    shuffle(s.deck);
    log(s, `The contracts are out. ${n - 1 === 1 ? "1 Hitman hides" : `${n - 1} Hitmen hide`} in the deck. @${s.turn} goes first.`);
    return s;
  }

  // the next living player in the direction of play
  function nextAlive(s, from) {
    const n = s.players.length;
    for (let k = 1; k <= n; k++) { const i = ((from + s.dir * k) % n + n) % n; if (s.players[i].alive) return i; }
    return from;
  }
  // hand the turn to player i, with any turns they owe (Attack stacks, Super Attack)
  function giveTurn(s, i, base) {
    const owed = s.owed[i] || 0;
    s.turn = i; s.left = base ? base + owed : owed || 1; delete s.owed[i];
    for (const t in s.locks) if (--s.locks[t] <= 0) delete s.locks[t];
    s.turnN++; s.step++;
    if (s.left > 1) log(s, `@${i} must take ${s.left} turns.`);
  }
  // one turn's worth is done (a draw, a Skip, a Bottom): the next turn may be theirs again, or pass on
  function endOne(s) {
    s.left -= 1; s.step++;
    if (s.left > 0) return;
    giveTurn(s, nextAlive(s, s.turn));
  }
  function eliminate(s, a, hit) {
    const P = s.players[a];
    P.alive = false; s.out.push(a);
    s.discard.push(...P.hand); P.hand = [];
    s.gone = (s.gone || []).concat(hit);
    delete s.owed[a];
    stamp(s, { k: "dead", p: a });
    log(s, `@${a} drew a Hitman. Eliminated!`);
    const left = alive(s);
    if (left.length === 1) { s.status = "over"; s.winner = left[0]; s.pending = null; log(s, `@${left[0]} is the last one standing and wins!`); return; }
    if (s.turn === a) giveTurn(s, nextAlive(s, a));
  }
  // draw from the top (or the bottom): a Hitman stops everything until it's dealt with
  function drawCard(s, a, fromBottom) {
    const id = fromBottom ? s.deck.shift() : s.deck.pop();
    s.peek = null;
    if (id == null) { endOne(s); return; }
    const P = s.players[a];
    if (typeOf(id) !== "hitman") {
      P.hand.push(id); stamp(s, { k: "draw", p: a, bottom: !!fromBottom });
      log(s, `@${a} drew ${fromBottom ? "from the bottom" : "a card"}.`);
      endOne(s); return;
    }
    stamp(s, { k: "hitman", p: a });
    if (saverOf(s, a).length) { s.pending = { k: "hitman", p: a, id }; log(s, `@${a} drew a Hitman!`); return; }
    eliminate(s, a, id);
  }
  // the cards that can save player a from a Hitman: Angels, or a Mirror right after an Angel; Chain can lock either
  const saverOf = (s, a) => s.players[a].hand.filter(id => (typeOf(id) === "angel" && !locked(s, "angel")) || (typeOf(id) === "mirror" && s.lastPlayed === "angel" && !locked(s, "mirror")));

  // what a stacked card does once its reaction window closes unanswered
  function resolve(s, e, target) {
    const a = e.by, t = e.as || e.t;
    if (s.status !== "play") return;
    switch (t) {
      case "attack": {
        const stack = s.left > 1 ? s.left + 2 : 2;
        stamp(s, { k: "attack", p: a, q: target, n: stack });
        // attacking yourself on your own turn: the turn goes on and the turns stack onto you
        if (target === s.turn) { s.left = stack; log(s, `@${target} took the Attack: ${stack} turns to play.`); break; }
        log(s, `@${a} attacked @${target}: ${stack} turns.`);
        giveTurn(s, target, stack);
        break;
      }
      case "skip": stamp(s, { k: "skip", p: a }); log(s, `@${a} skipped.`); endOne(s); break;
      case "reverse":
        s.dir *= -1; stamp(s, { k: "reverse", p: a }); log(s, `@${a} reversed the order of play.`); endOne(s); break;
      case "bottom": drawCard(s, a, true); break;
      case "future": s.peek = { p: a, cards: s.deck.slice(-3).reverse() }; stamp(s, { k: "future", p: a }); log(s, `@${a} looked into the future.`); break;
      case "shuffle": shuffle(s.deck); s.peek = null; stamp(s, { k: "shuffle", p: a }); log(s, `@${a} shuffled the deck.`); break;
      case "steal": {
        const T = s.players[target];
        if (!T || !T.alive || !T.hand.length) { log(s, `@${a} tried to steal, but @${target} had nothing.`); break; }
        s.pending = { k: "give", from: target, to: a };
        stamp(s, { k: "steal", p: a, q: target });
        log(s, `@${a} is stealing from @${target}.`);
        break;
      }
      case "superattack":
        alive(s).filter(i => i !== a).forEach(i => { s.owed[i] = (s.owed[i] || 0) + 2; });
        stamp(s, { k: "superattack", p: a }); log(s, `@${a} played a Super Attack: everyone else takes 2 turns.`);
        break;
    }
  }
  // close a reaction window: Cancels and Infernos stop the card under them (top down, so they can stop each other),
  // Chains lock, the last live Redirect picks the target, Shuffles shuffle, then the bottom card does its thing
  function closeWindow(s) {
    const st = s.pending.stack; s.pending = null;
    const live = st.map(() => true);
    for (let i = st.length - 1; i > 0; i--) if (live[i] && (st[i].t === "cancel" || st[i].t === "inferno")) live[i - 1] = false;
    let target = st[0].p;
    const chains = [];
    for (let i = 1; i < st.length; i++) {
      if (!live[i]) continue;
      const e = st[i], under = st[i - 1], ut = under.as && under.t === "mirror" ? "mirror" : under.t;
      if (e.t === "chain") chains.push([ut, e.by]);
      if (e.t === "redirect") target = e.p;
      if (e.t === "shuffle") resolve(s, e);
      if (e.t === "inferno") {
        const burn = [under.card];
        s.players.forEach(P => P.hand.filter(id => typeOf(id) === ut).forEach(id => { take(P.hand, id); burn.push(id); }));
        burn.forEach(id => { take(s.discard, id); putBack(s, id, "random"); });
        s.peek = null;
        log(s, `@${e.by}'s Inferno burned ${plural(burn.length, cardName(ut))} back into the deck.`);
      }
      if (e.t === "cancel" || e.t === "inferno") stamp(s, { k: e.t, p: e.by, q: under.by });
    }
    if (live[0]) resolve(s, st[0], target);
    else log(s, `@${st[0].by}'s ${cardName(st[0].as || st[0].t)} was stopped.`);
    // locks start after the card is done, so a Skip that passes the turn doesn't eat one of the three
    chains.forEach(([ut, by]) => { s.locks[ut] = LOCK_TURNS; log(s, `@${by} chained ${cardName(ut)}: nobody can play it for ${LOCK_TURNS} turns.`); });
    s.step++;
  }

  // Applies one action by seat a. Returns { state } or { error }.
  function apply(s0, a, act) {
    const s = clone(s0), P = s.players[a];
    const err = m => ({ error: m });
    if (s.status === "paused") return err("The game is paused. Vote to continue first.");
    if (s.status !== "play") return err("The game is over.");
    if (!P) return err("You're not at this table.");
    if (!P.alive) return err("You've been eliminated. Watch the rest of the game.");
    const t = act && act.t, pd = s.pending;

    // A Hitman drawn: save yourself with an Angel (or a Mirror after an Angel), and put the Hitman back where you like
    if (pd && pd.k === "hitman") {
      if (pd.p !== a) return err("Wait while they deal with their Hitman.");
      if (t !== "save") return err("Use an Angel to survive the Hitman.");
      const id = act.card, ok = saverOf(s, a);
      if (!ok.includes(id)) return err("That card can't save you.");
      const pos = ["top", "second", "third", "bottom", "random"].includes(act.pos) ? act.pos : "random";
      take(P.hand, id); s.discard.push(id); s.by = s.by || {}; s.by[id] = a;
      putBack(s, pd.id, pos); s.pending = null; s.peek = null;
      s.lastPlayed = "angel"; P.saves++; P.played++;
      stamp(s, { k: "save", p: a, mirror: typeOf(id) === "mirror" });
      log(s, `@${a} survived with ${typeOf(id) === "mirror" ? "a Mirrored Angel" : "an Angel"} and slipped the Hitman back into the deck.`);
      endOne(s);
      return { state: s };
    }
    // Steal: the robbed player picks the card to hand over
    if (pd && pd.k === "give") {
      if (pd.from !== a) return err(`Wait while @${pd.from} picks a card to hand over.`);
      if (t !== "give" || !P.hand.includes(act.card)) return err("Pick one of your cards to hand over.");
      take(P.hand, act.card); s.players[pd.to].hand.push(act.card);
      s.pending = null; s.step++;
      stamp(s, { k: "gave", p: a, q: pd.to });
      log(s, `@${a} handed a card to @${pd.to}.`);
      return { state: s };
    }

    // Quick Play: anyone still in can answer the card just played while its window is open
    if (t === "play" && QUICK.includes(typeOf(act.card)) && pd && pd.k === "window") {
      const id = act.card, k = typeOf(id), top = pd.stack[pd.stack.length - 1], base = pd.stack[0];
      if (!P.hand.includes(id)) return err("That card isn't in your hand.");
      if (locked(s, k)) return err(`${cardName(k)} is chained for now.`);
      const topT = top.t;
      if (k === "cancel" && (topT === "cancel" || (topT === "steal" && !top.as))) return err(`Cancel can't stop ${topT === "cancel" ? "another Cancel" : "a Steal"}.`);
      if (k === "inferno" && (topT === "mirror" || topT === "inferno")) return err(`Inferno can't stop ${topT === "mirror" ? "a Mirror" : "another Inferno"}.`);
      const e = { t: k, by: a, card: id };
      if (k === "redirect") {
        if (!TARGET.includes(base.as || base.t)) return err("Redirect only works on an Attack or a Steal.");
        const q = act.p;
        if (!s.players[q] || !s.players[q].alive) return err("Choose a player who's still in.");
        if ((base.as || base.t) === "steal" && q === base.by) return err("A Steal can't be turned on the player stealing.");
        e.p = q;
      }
      take(P.hand, id); s.discard.push(id); s.by = s.by || {}; s.by[id] = a; P.played++;
      pd.stack.push(e); pd.n = (pd.n || 0) + 1;
      stamp(s, { k: "quick", p: a, t: k });
      log(s, `@${a} played ${cardName(k)}${k === "redirect" ? ` on to @${e.p}` : ""}!`);
      return { state: s };
    }

    if (s.turn !== a) return err("It's not your turn.");
    if (pd && pd.k === "window") return err("Wait a moment: the table can still answer that card.");

    if (t === "draw") { drawCard(s, a, false); return { state: s }; }

    if (t === "play") {
      const id = act.card;
      if (!P.hand.includes(id)) return err("That card isn't in your hand.");
      let k = typeOf(id);
      if (locked(s, k)) return err(`${cardName(k)} is chained for ${plural(s.locks[k], "more turn")}.`);
      if (k === "angel") return err("Keep your Angel: it saves you when you draw a Hitman.");
      if (k === "cancel" || k === "inferno" || k === "chain" || k === "redirect") return err(`Save ${cardName(k)} to answer a card someone plays.`);
      let as = null;
      if (k === "mirror") {
        as = s.lastPlayed;
        if (!as || as === "angel" || as === "cancel") return err(as === "angel" ? "A Mirror after an Angel only works when you draw a Hitman." : "There's no card to copy yet.");
        if (locked(s, as)) return err(`${cardName(as)} is chained, so the Mirror can't copy it.`);
      }
      const eff = as || k, e = { t: k, by: a, card: id };
      if (as) e.as = as;
      if (TARGET.includes(eff)) {
        const q = act.p;
        if ((q === a && eff !== "attack") || !s.players[q] || !s.players[q].alive) return err(eff === "attack" ? "Choose a player who's still in." : "Choose another player who's still in.");
        if (eff === "steal" && !s.players[q].hand.length) return err("They have no cards to steal.");
        e.p = q;
      }
      take(P.hand, id); s.discard.push(id); s.by = s.by || {}; s.by[id] = a; P.played++;
      s.lastPlayed = eff;
      s.pending = { k: "window", stack: [e], n: 0 };
      stamp(s, { k: "play", p: a, t: k, as, q: e.p });
      log(s, `@${a} played ${as ? `a Mirror as ${cardName(as)}` : cardName(k)}${e.p != null ? ` on @${e.p}` : ""}.`);
      return { state: s };
    }
    return err("Unknown move.");
  }

  // ---- clocks: 20 seconds a draw, 8 seconds to answer each card, 25 seconds to save yourself or hand a card over ----
  function syncClock(prev, s, now) {
    if (s.status !== "play") { s.clock = null; return s; }
    const fresh = !prev || prev.status !== "play" || !prev.clock || prev.created !== s.created || prev.step !== s.step || prev.turn !== s.turn;
    const c = fresh ? { turn: s.turn, left: TURN_MS, since: now, resp: null, wait: [] } : Object.assign({}, prev.clock);
    const pd = s.pending, ppd = prev && prev.pending;
    if (!pd) { c.resp = null; c.react = null; }
    else if (pd.k === "window") {
      // every new answer gives the table the full window again
      const same = ppd && ppd.k === "window" && ppd.stack.length === pd.stack.length && c.react;
      c.react = same ? c.react : now + REACT_MS; c.resp = c.react;
    } else {
      const same = ppd && ppd.k === pd.k && c.resp && !c.react;
      c.react = null; c.resp = same ? c.resp : now + RESPOND_MS;
    }
    c.wait = waitingOn(s);
    s.clock = c;
    return s;
  }
  function expire(s0, now) {
    const c = s0.clock;
    if (s0.status !== "play" || !c) return null;
    let s = s0;
    const pd = s0.pending;
    if (pd && c.resp != null && now >= c.resp) {
      s = clone(s0);
      if (pd.k === "window") closeWindow(s);
      else if (pd.k === "hitman") {
        // out of time with a Hitman: the first card that can save you does, and the Hitman goes back at random
        const r = apply(s, pd.p, { t: "save", card: saverOf(s, pd.p)[0], pos: "random" });
        if (r.error) { s.pending = null; eliminate(s, pd.p, pd.id); } else s = r.state;
      } else if (pd.k === "give") {
        const H = s.players[pd.from].hand;
        const r = apply(s, pd.from, { t: "give", card: H[rnd(H.length)] });
        if (!r.error) s = r.state; else s.pending = null;
      }
      return syncClock(s0, s, now);
    }
    if (!pd && now - c.since >= c.left) {
      // out of time on your turn: you draw
      s = clone(s0);
      log(s, `@${s.turn} ran out of time and had to draw.`);
      drawCard(s, s.turn, false);
      return syncClock(s0, s, now);
    }
    return null;
  }
  const waitingOn = s => s.status !== "play" ? [] : s.pending && s.pending.k === "hitman" ? [s.pending.p]
    : s.pending && s.pending.k === "give" ? [s.pending.from] : [s.turn];

  // ---- ranking (its own list: The Agency) ----
  // Last one standing 100; the rest place by how long they lasted: 2nd 60, 3rd 45, everyone else 30.
  // Everyone also gets 8 EXP per Hitman they survived (up to 24) and 1 per card played (up to 15).
  const XP = { win: 100, second: 60, third: 45, rest: 30, perSave: 8, saveCap: 24, perPlay: 1, playCap: 15 };
  function awards(s) {
    if (s.status !== "over" || s.winner == null) return [];
    const order = [s.winner, ...s.out.slice().reverse()];
    return s.players.map((p, i) => {
      const place = order.indexOf(i) + 1;
      const parts = { place: place === 1 ? XP.win : place === 2 ? XP.second : place === 3 ? XP.third : XP.rest,
        saves: Math.min(XP.saveCap, XP.perSave * (p.saves || 0)), played: Math.min(XP.playCap, XP.perPlay * (p.played || 0)) };
      return { p: i, nick: p.nick || "", place, saves: p.saves || 0, parts, xp: parts.place + parts.saves + parts.played, won: place === 1 };
    });
  }

  G.Hitman = { MAX_PLAYERS, START, TURN_MS, RESPOND_MS, REACT_MS, LOCK_TURNS, TYPES, QUICK, TARGET, CARDS, XP, typeOf, cardName, decksFor,
    hitmenLeft, alive, locked, saverOf, newGame, apply, syncClock, expire, waitingOn, awards, shuffle };
})(typeof window !== "undefined" ? window : globalThis);
