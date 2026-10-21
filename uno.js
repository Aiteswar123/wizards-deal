// Grand Line UNO: the rules engine, shared by the browser and the server (like engine.js).
// Plays like UNO with stacking: answer a Draw 2 or a Wild Draw 4 with either one, in any colour, to pass
// the growing pile to the next player. A card that fits can take every other card of the same number or symbol with it (not Wilds). Pirate flavour only: the cards are still red, yellow, green and blue numbers,
// Skip, Reverse, Draw 2, Wild and Wild Draw 4.
(function (G) {
  "use strict";
  const MAX_PLAYERS = 12, HAND = 7, TURN_MS = 60000;
  // Colours, named for the seas of the Grand Line world, with fixed hexes.
  const COLORS = { r: { n: "Red", sea: "Red Line", hex: "#d81f38" }, y: { n: "Yellow", sea: "South Blue", hex: "#f0ae16" },
    g: { n: "Green", sea: "West Blue", hex: "#12a065" }, b: { n: "Blue", sea: "East Blue", hex: "#1f66e0" } };
  const COLOR_KEYS = ["r", "y", "g", "b"];
  // the card designs a player can show the table (uno-faces.js, uno-backs.js)
  const STYLES = { faces: ["classic", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10"], backs: ["sunwake", "strawhat", "marine", "denden", "chart", "fruit"] };
  // Action cards and the names printed on their posters.
  const KINDS = { skip: { n: "Skip", alias: "Skip", pts: 20 }, rev: { n: "Reverse", alias: "Reverse", pts: 20 }, d2: { n: "Draw 2", alias: "Draw Two", pts: 20 },
    wild: { n: "Wild", alias: "Wild Card", pts: 50 }, w4: { n: "Wild Draw 4", alias: "Wild Draw Four", pts: 50 } };
  // One deck: per colour one 0, two each of 1-9, Skip, Reverse and Draw 2; plus four Wild and four Wild Draw 4 (108 cards).
  const BASE = 108;
  const CARDS = [];
  for (let d = 0; d < 3; d++) {
    for (const c of COLOR_KEYS) {
      CARDS.push({ c, v: "0" });
      for (let k = 0; k < 2; k++) { for (let n = 1; n <= 9; n++) CARDS.push({ c, v: String(n) }); CARDS.push({ c, v: "skip" }, { c, v: "rev" }, { c, v: "d2" }); }
    }
    for (let k = 0; k < 4; k++) CARDS.push({ c: "w", v: "wild" }, { c: "w", v: "w4" });
  }
  CARDS.forEach((c, i) => { c.id = i; });
  const card = id => CARDS[id];
  const decksFor = n => n <= 6 ? 1 : n <= 10 ? 2 : 3;
  const isWild = c => c.c === "w";
  const points = id => { const c = card(id); return KINDS[c.v] ? KINDS[c.v].pts : +c.v; };
  const label = id => { const c = card(id); return (isWild(c) ? "" : COLORS[c.c].n + " ") + (KINDS[c.v] ? KINDS[c.v].n : c.v); };

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1) : Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const clone = s => JSON.parse(JSON.stringify(s));
  const log = (s, m) => { s.log.push(m); if (s.log.length > 60) s.log.splice(0, s.log.length - 60); };
  const top = s => card(s.discard[s.discard.length - 1]);

  function newGame(players) {
    const n = players.length, deck = shuffle(CARDS.filter(c => c.id < BASE * decksFor(n)).map(c => c.id));
    const s = { kind: "uno", status: "play", players: players.map(p => Object.assign({ uid: p.uid, nick: p.nick, hand: [], played: 0 }, p.face ? { face: p.face } : {}, p.back ? { back: p.back } : {})),
      deck, discard: [], col: null, turn: Math.floor(Math.random() * n), dir: 1, stack: 0, drew: null,
      unoMiss: null, winner: null, turnN: 1, last: null, plays: 0, log: [], by: {} };
    for (let k = 0; k < HAND; k++) for (const P of s.players) P.hand.push(s.deck.pop());
    // flip until a number card starts the discard pile
    let first; do { first = s.deck.pop(); if (KINDS[card(first).v]) s.deck.unshift(first); else break; } while (true);
    s.discard.push(first); s.col = card(first).c;
    log(s, `The voyage begins on ${label(first)}. @${s.turn} goes first.`);
    return s;
  }

  function drawOne(s) {
    if (!s.deck.length) {
      if (s.discard.length <= 1) return null;
      const keep = s.discard.pop(); s.deck = shuffle(s.discard); s.discard = [keep];
      log(s, "The discard pile was shuffled back into the deck.");
    }
    return s.deck.pop();
  }
  function drawN(s, p, n) { let got = 0; for (let i = 0; i < n; i++) { const id = drawOne(s); if (id == null) break; s.players[p].hand.push(id); got++; } return got; }
  const nextSeat = (s, from, steps = 1) => { const n = s.players.length; return ((from + s.dir * steps) % n + n) % n; };
  function advance(s, steps = 1) { s.turn = nextSeat(s, s.turn, steps); s.drew = null; s.turnN++; }

  // Can this card go on the pile right now?
  function playable(s, id) {
    const c = card(id), t = top(s), P = s.players[s.turn];
    // nobody goes out on a power card: a last card that is an action card or a Wild can't be played
    if (KINDS[c.v] && P && P.hand.length === 1 && P.hand[0] === id) return false;
    // a draw pile is passed on by any Draw 2 or Wild Draw 4, whatever its colour and whatever started the pile
    if (s.stack > 0) return c.v === "w4" || c.v === "d2";
    if (isWild(c)) return true;
    return c.c === s.col || c.v === t.v;
  }
  const canPlayAny = (s, p) => s.players[p].hand.some(id => playable(s, id));

  // Applies one action by seat a. Returns { state } or { error }.
  function apply(s0, a, act) {
    const s = clone(s0), P = s.players[a];
    const err = m => ({ error: m });
    if (s.status === "paused") return err("The game is paused. Vote to continue first.");
    if (s.status !== "play") return err("The game is over.");
    if (!P) return err("You're not at this table.");
    const t = act && act.t;

    // Catch a player who forgot to call UNO: they draw 2. Anyone else can do it, any time before the next move.
    if (t === "catch") {
      const q = act.p;
      if (q === a || s.unoMiss !== q || !s.players[q] || s.players[q].hand.length !== 1) return err("There's no one to catch.");
      drawN(s, q, 2); s.unoMiss = null;
      s.last = { k: "catch", p: a, q, n: s.plays };
      log(s, `@${a} caught @${q} without calling UNO! @${q} draws 2.`);
      return { state: s };
    }
    // Call UNO late, before anyone catches you.
    if (t === "uno") {
      if (s.unoMiss !== a) return err("You don't need to call UNO now.");
      s.unoMiss = null; s.last = { k: "uno", p: a, n: s.plays }; log(s, `@${a} called UNO!`);
      return { state: s };
    }

    if (s.turn !== a) return err("It's not your turn.");
    // any move by the player on turn ends the chance to catch the last one
    const missed = s.unoMiss; s.unoMiss = null;

    if (t === "play") {
      const id = act.card;
      if (!P.hand.includes(id)) return err("That card isn't in your hand.");
      if (s.drew != null && id !== s.drew) return err("After drawing you can only play the card you drew.");
      if (KINDS[card(id).v] && P.hand.length === 1) return err(`Your last card can't be a power card. ${s.stack > 0 ? `Take the ${s.stack}.` : "Draw until a card fits."}`);
      if (!playable(s, id)) return err(s.stack > 0 ? `Answer with a Draw 2 or Wild Draw 4, or draw ${s.stack}.` : "That card doesn't match the colour or the symbol.");
      const c = card(id);
      if (isWild(c) && !COLOR_KEYS.includes(act.col)) return err("Choose a colour.");
      // more cards with the same number, in any colour, can go down with it; the last one sets the colour
      const more = Array.isArray(act.more) ? act.more : [];
      if (more.length) {
        if (isWild(c)) return err("Wild cards are played one at a time.");
        if (s.drew != null) return err("After drawing you can only play the card you drew.");
        const seen = new Set([id]);
        for (const m of more) {
          if (seen.has(m) || !P.hand.includes(m)) return err("That card isn't in your hand.");
          if (card(m).v !== c.v) return err("Cards played together must have the same number or symbol.");
          seen.add(m);
        }
        if (KINDS[c.v] && seen.size === P.hand.length) return err("Your last card can't be a power card. Keep one back.");
      }
      // by: who played each card, so every screen can draw it in that player's card design
      s.by = s.by || {};
      for (const x of [id, ...more]) { P.hand.splice(P.hand.indexOf(x), 1); s.discard.push(x); s.by[x] = a; P.played = (P.played || 0) + 1; s.plays++; }
      const lastId = more.length ? more[more.length - 1] : id;
      s.col = isWild(c) ? act.col : card(lastId).c;
      s.last = { k: "play", p: a, card: lastId, cards: [id, ...more], col: s.col, n: s.plays };
      log(s, more.length ? `@${a} played ${[id, ...more].map(label).join(", ")}.` : `@${a} played ${label(id)}${isWild(c) ? ` and chose ${COLORS[s.col].n}` : ""}.`);
      if (!P.hand.length) { s.status = "over"; s.winner = a; log(s, `@${a} played their last card and wins!`); return { state: s }; }
      if (P.hand.length === 1) { if (act.uno) log(s, `@${a} called UNO!`); else s.unoMiss = a; }
      // each card counts: two Skips skip two players, two Draw 2s add 4, two Reverses turn back again
      const n = 1 + more.length;
      let steps = 1;
      if (c.v === "skip") { steps = 1 + n; for (let k = 1; k <= n; k++) log(s, `@${nextSeat(s, a, k)} is skipped.`); }
      if (c.v === "rev") { if (s.players.length === 2) steps = 1 + n; else if (n % 2) s.dir *= -1; }
      if (c.v === "d2" || c.v === "w4") s.stack += (c.v === "d2" ? 2 : 4) * n;
      advance(s, steps);
      return { state: s };
    }
    if (t === "draw") {
      if (s.stack > 0) {
        const n = drawN(s, a, s.stack);
        log(s, `@${a} draws ${n}.`);
        s.last = { k: "draw", p: a, count: n, n: s.plays };
        s.stack = 0; advance(s);
        return { state: s };
      }
      if (s.drew != null) return err("Play the card you drew.");
      // draw until a card fits; that card must then be played. Only an empty deck and discard pile ends it early.
      let id = null, n = 0;
      while ((id = drawOne(s)) != null) { P.hand.push(id); n++; if (playable(s, id)) break; }
      s.last = { k: "draw", p: a, count: n, n: s.plays };
      const many = `${n} card${n === 1 ? "" : "s"}`;
      if (id != null) { s.drew = id; log(s, `@${a} drew ${many} until one fit.`); }
      else { log(s, n ? `@${a} drew ${many}, the deck ran out and nothing fit, so they pass.` : `@${a} couldn't draw and passes.`); advance(s); }
      return { state: s };
    }
    s.unoMiss = missed;
    return err("Unknown move.");
  }

  // ---- turn clock: one minute a turn; when it runs out the player draws (or takes the stack) and passes ----
  function syncClock(prev, s, now) {
    if (s.status !== "play") { s.clock = null; return s; }
    const fresh = !prev || prev.status !== "play" || !prev.clock || prev.created !== s.created || prev.turnN !== s.turnN;
    s.clock = fresh ? { turn: s.turn, left: TURN_MS, since: now, resp: null, wait: [] } : Object.assign({}, prev.clock);
    return s;
  }
  function expire(s0, now) {
    const c = s0.clock;
    if (s0.status !== "play" || !c || now - c.since < c.left) return null;
    const a = s0.turn; let s = clone(s0);
    log(s, `@${a} ran out of time.`);
    // take the stack, or draw until a card fits, then play that card for them (a Wild picks the colour they hold most)
    let r = s.drew == null ? apply(s, a, { t: "draw" }) : { state: s };
    if (!r.error) s = r.state;
    if (s.turn === a && s.drew != null) {
      const counts = {}; s.players[a].hand.forEach(id => { const k = card(id).c; if (k !== "w") counts[k] = (counts[k] || 0) + 1; });
      const col = COLOR_KEYS.slice().sort((x, y) => (counts[y] || 0) - (counts[x] || 0))[0];
      r = apply(s, a, { t: "play", card: s.drew, col }); if (!r.error) s = r.state;
    }
    if (s.turnN === s0.turnN && s.status === "play") { s.unoMiss = null; advance(s); }   // never leave the clock stuck
    return syncClock(s0, s, now);
  }
  const waitingOn = s => s.status === "play" ? [s.turn] : [];

  // ---- ranking (its own Hall of Fame) ----
  // Winner 100, plus 1 EXP for every 10 points left in the other hands (up to 50). The rest place by fewest points
  // left in hand: 2nd 60, 3rd 45, everyone else 30. Everyone gets 2 EXP per card played, up to 20.
  const XP = { win: 100, haulPer: 10, haulCap: 50, second: 60, third: 45, rest: 30, perPlay: 2, playCap: 20 };
  const handPoints = p => p.hand.reduce((t, id) => t + points(id), 0);
  function awards(s) {
    if (s.status !== "over" || s.winner == null) return [];
    const others = s.players.map((p, i) => i).filter(i => i !== s.winner).sort((x, y) => handPoints(s.players[x]) - handPoints(s.players[y]));
    const order = [s.winner, ...others], haul = others.reduce((t, i) => t + handPoints(s.players[i]), 0);
    return s.players.map((p, i) => {
      const place = order.indexOf(i) + 1;
      const parts = { place: place === 1 ? XP.win : place === 2 ? XP.second : place === 3 ? XP.third : XP.rest,
        haul: place === 1 ? Math.min(XP.haulCap, Math.floor(haul / XP.haulPer)) : 0, plays: Math.min(XP.playCap, XP.perPlay * (p.played || 0)) };
      return { p: i, nick: p.nick || "", place, left: handPoints(p), played: p.played || 0, parts, xp: parts.place + parts.haul + parts.plays, won: place === 1 };
    });
  }

  G.Uno = { MAX_PLAYERS, HAND, TURN_MS, RESPOND_MS: 30000, COLORS, COLOR_KEYS, STYLES, KINDS, CARDS, BASE, XP, card, decksFor, points, label, playable,
    canPlayAny, newGame, apply, syncClock, expire, waitingOn, awards, handPoints, top };
})(typeof window !== "undefined" ? window : globalThis);
