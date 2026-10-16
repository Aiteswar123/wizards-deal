/* Monopoly Deal: Harry Potter edition — rules engine.
   Pure functions over a plain JSON game state, so every device computes the same result.
   apply(state, seat, action) returns {state} or {error}. */
(function (G) {
  "use strict";

  const COLORS = {
    brown:  { n: "Brown",      size: 2, rent: [1, 2],       hex: "#9a6644" },
    sky:    { n: "Light blue", size: 3, rent: [1, 2, 3],    hex: "#7cc4e6" },
    pink:   { n: "Pink",       size: 3, rent: [1, 2, 4],    hex: "#e58fb8" },
    orange: { n: "Orange",     size: 3, rent: [1, 3, 5],    hex: "#e8934a" },
    red:    { n: "Red",        size: 3, rent: [2, 3, 6],    hex: "#d65050" },
    yellow: { n: "Yellow",     size: 3, rent: [2, 4, 6],    hex: "#e6c74a" },
    green:  { n: "Green",      size: 3, rent: [2, 4, 7],    hex: "#4fa36b" },
    blue:   { n: "Dark blue",  size: 2, rent: [3, 8],       hex: "#4a6be0" },
    black:  { n: "Black",      size: 4, rent: [1, 2, 3, 4], hex: "#6b6578" },
    silver: { n: "Silver",     size: 2, rent: [1, 2],       hex: "#c3c6d4" }
  };
  const COLOR_KEYS = Object.keys(COLORS);

  const ITEM_SETS = {
    brown:  { val: 1, names: ["Butterbeer", "Chocolate Frog"] },
    sky:    { val: 1, names: ["Remembrall", "Sneakoscope", "Deluminator"] },
    pink:   { val: 2, names: ["Pygmy Puff", "Love Potion", "Bertie Bott's Beans"] },
    orange: { val: 2, names: ["Quaffle", "Bludger", "Golden Snitch"] },
    red:    { val: 3, names: ["Sword of Gryffindor", "Sorting Hat", "Marauder's Map"] },
    yellow: { val: 3, names: ["Hufflepuff's Cup", "Time-Turner", "Golden Egg"] },
    green:  { val: 4, names: ["Polyjuice Potion", "Slytherin's Locket", "Mandrake"] },
    blue:   { val: 4, names: ["Felix Felicis", "Elder Wand"] },
    black:  { val: 2, names: ["Hogwarts Express", "Knight Bus", "Flying Ford Anglia", "Nimbus 2000"] },
    silver: { val: 2, names: ["Invisibility Cloak", "Resurrection Stone"] }
  };

  const SPELLS = {
    accio2:     { n: "Accio",              val: 1, d: "Pick one of this card's two colours. Every other player pays you the charge for your items of that colour." },
    accioAny:   { n: "Accio",              val: 3, d: "Pick any colour you have items in. Every other player pays you the charge for it." },
    alohomora:  { n: "Alohomora",          val: 2, d: "Every other player pays you 2 points." },
    stupefy:    { n: "Stupefy",            val: 3, d: "One player of your choice pays you 5 points." },
    levicorpus: { n: "Levicorpus",         val: 3, d: "Take one item from another player. Not from a complete set." },
    confundo:   { n: "Confundo",           val: 3, d: "Swap one of your items with another player's. Neither can be in a complete set." },
    wingardium: { n: "Wingardium Leviosa", val: 3, d: "Send another player's item to the discard pile. Not from a complete set." },
    obliviate:  { n: "Obliviate",          val: 5, d: "Take a complete set from another player." },
    petrificus: { n: "Petrificus Totalus", val: 2, d: "Freeze another player's character ability. They free it by discarding 10+ points from their hand." },
    protego:    { n: "Protego",            val: 4, d: "Block a spell cast at you. Play it any time, even on someone else's turn." },
    geminio:    { n: "Geminio",            val: 1, d: "Draw two more cards." },
    reparo:     { n: "Reparo",             val: 2, d: "Take any card from the discard pile and put it in front of you." }
  };
  const PAY_KINDS = ["accio2", "accioAny", "alohomora", "stupefy"];

  const CHARS = {
    harry:    { n: "Harry Potter",     d: "Choose one colour. Nobody can take or banish your items of that colour, and you never have to pay with them." },
    hermione: { n: "Hermione Granger", d: "Play up to four cards on your turn instead of three." },
    draco:    { n: "Draco Malfoy",     d: "Levicorpus and Confundo can take items from complete sets." },
    luna:     { n: "Luna Lovegood",    d: "Draw three cards at the start of your turn instead of two." },
    cedric:   { n: "Cedric Diggory",   d: "You may draw your cards from the top of the discard pile instead." },
    lupin:    { n: "Remus Lupin",      d: "At the start of your turn you may skip drawing. If you do, you can play up to 5 cards this turn." },
    hagrid:   { n: "Rubeus Hagrid",    d: "At the start of your turn, copy another player's character power for this turn (not Cho's Snitch). A power you copy can't be copied again for your next 3 turns." },
    umbridge: { n: "Dolores Umbridge", d: "Any player with more complete sets than you can play at most 2 cards on their turn." },
    cho:      { n: "Cho Chang",        d: "Catch the Snitch, twice per game: when a player would win by completing their third set, send the card that completed it back to their hand." },
    ron:      { n: "Ron Weasley",      d: "At the start of your turn, draw one card from the pile and one at random from an opponent's hand of your choice." },
    peeves:   { n: "Peeves",           d: "Once per turn, blind-swap a random card from your hand with a random card from an opponent's hand." },
    myrtle:   { n: "Moaning Myrtle",   d: "At the start of your turn you may draw 3 cards instead, keep 2, and put the third back into the deck." }
  };

  // ---- deck: 106 playing cards (plus 5 character cards = 111) ----
  const CARDS = [];
  const add = o => { o.id = CARDS.length; CARDS.push(o); };
  for (const col of COLOR_KEYS) for (const name of ITEM_SETS[col].names) add({ type: "item", col, name, val: ITEM_SETS[col].val });
  [["blue","green",4],["green","black",4],["sky","black",4],["sky","brown",1],["pink","orange",2],["pink","orange",2],["red","yellow",3],["red","yellow",3],["silver","black",2]]
    .forEach(([a, b, v]) => add({ type: "wild", cols: [a, b], name: "Wild item", val: v }));
  add({ type: "any", name: "Every-colour wild", val: 0 });
  add({ type: "any", name: "Every-colour wild", val: 0 });
  [[1,6],[2,5],[3,3],[4,3],[5,2],[10,1]].forEach(([v, n]) => { for (let i = 0; i < n; i++) add({ type: "point", name: v + " Galleon" + (v > 1 ? "s" : ""), val: v }); });
  [["blue","green"],["brown","sky"],["pink","orange"],["black","silver"],["red","yellow"]].forEach(cols => { for (let i = 0; i < 2; i++) add({ type: "spell", k: "accio2", cols }); });
  const spellCounts = { accioAny: 3, geminio: 10, reparo: 2, alohomora: 3, confundo: 3, stupefy: 3, levicorpus: 3, protego: 3, wingardium: 3, petrificus: 2, obliviate: 2 };
  for (const k in spellCounts) for (let i = 0; i < spellCounts[k]; i++) add({ type: "spell", k });
  CARDS.forEach(c => { if (c.type === "spell") { c.name = SPELLS[c.k].n; c.val = SPELLS[c.k].val; } });
  // Bigger tables shuffle in more decks, like playing with a doubled Monopoly Deal deck: ids BASE..2*BASE-1 are the
  // second deck and so on. One deck for up to 5 players, two for 6 to 10, three for 11 or 12.
  const BASE = CARDS.length, MAX_PLAYERS = 12;
  for (let d = 1; d < 3; d++) for (let i = 0; i < BASE; i++) CARDS.push(Object.assign({}, CARDS[i], { id: d * BASE + i }));
  const decksFor = n => n <= 5 ? 1 : n <= 10 ? 2 : 3;

  // ---- helpers ----
  const card = id => CARDS[id];
  const isItem = c => c.type === "item" || c.type === "wild" || c.type === "any";
  const colsFor = c => c.type === "item" ? [c.col] : c.type === "wild" ? c.cols : c.type === "any" ? COLOR_KEYS : [];
  const active = (p, ch) => p.char === ch && p.petrified == null;
  // has: the character's own power, or the one Hagrid copied for this turn
  const has = (p, ch) => active(p, ch) || (active(p, "hagrid") && p.copy === ch);
  // plays per turn: Lupin's skipped draw gives 5, Hermione 4, everyone else 3; Umbridge caps anyone ahead of her at 2
  function maxPlays(p, s) {
    let m = p.turnPlays || (has(p, "hermione") ? 4 : 3);
    if (s && s.players.some(u => u !== p && active(u, "umbridge") && completeCols(u).length < completeCols(p).length)) m = Math.min(m, 2);
    return m;
  }
  const umbridgeLimits = (p, s) => s.players.some(u => u !== p && active(u, "umbridge") && completeCols(u).length < completeCols(p).length);
  const colCount = (p, col) => p.table.filter(t => t.col === col).length;
  const complete = (p, col) => colCount(p, col) >= COLORS[col].size && p.table.some(t => t.col === col && card(t.c).type !== "any");
  const completeCols = p => COLOR_KEYS.filter(col => complete(p, col));
  const rent = (p, col) => { const n = Math.min(colCount(p, col), COLORS[col].size); return n ? COLORS[col].rent[n - 1] : 0; };
  const bankTotal = p => p.bank.reduce((s, id) => s + card(id).val, 0);
  const worth = p => bankTotal(p) + p.table.reduce((s, t) => s + card(t.c).val, 0);
  // Harry's own power, or Hagrid on a turn he copied it
  const harryGuards = (p, col) => has(p, "harry") && p.harryCol === col;
  const canTake = (target, entry, thief) => !harryGuards(target, entry.col) && (!complete(target, entry.col) || has(thief, "draco"));
  const canBanish = (target, entry) => !harryGuards(target, entry.col) && !complete(target, entry.col);
  // character powers that change numbers
  const handLimit = () => 7;
  // Hagrid may copy a character once its 3-turn cooldown has passed
  const copyReady = (p, ch) => !(p.copied && p.copied[ch] != null) || (p.turnNo || 0) - p.copied[ch] > 3;
  const canObliviate = (target, col) => complete(target, col) && !harryGuards(target, col);
  // What a player can pay debts with: their bank and table, except items Harry is protecting.
  const payable = p => [...p.bank, ...p.table.filter(e => !harryGuards(p, e.col)).map(e => e.c)];
  const entryOf = (p, id) => p.table.find(t => t.c === id);
  const clone = o => JSON.parse(JSON.stringify(o));

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function drawN(s, p, n) {
    for (let i = 0; i < n; i++) {
      if (!s.deck.length) {
        if (!s.discard.length) break;
        s.deck = shuffle(s.discard); s.discard = [];
        log(s, "The discard pile was shuffled into a new draw pile.");
      }
      p.hand.push(s.deck.pop());
    }
  }
  function log(s, m) { s.log.push(m); if (s.log.length > 40) s.log.splice(0, s.log.length - 40); }
  // Every spell cast (and every Protego) is stamped so each screen can play the cut-in once.
  function stamp(s, p, k, extra) { s.lastCast = Object.assign({ n: ((s.lastCast && s.lastCast.n) || 0) + 1, p, k }, extra || {}); }
  const take = (arr, id) => { const i = arr.indexOf(id); if (i < 0) return false; arr.splice(i, 1); return true; };

  function newGame(players) {
    const chars = shuffle(Object.keys(CHARS));
    players = players.map((p, i) => Object.assign({}, p, { char: chars[i] }));
    const s = {
      status: "play", turn: 0, drew: false, plays: 0, pending: null, winner: null,
      deck: shuffle(CARDS.slice(0, BASE * decksFor(players.length)).map(c => c.id)), discard: [], log: [],
      players: players.map(p => ({ uid: p.uid, nick: p.nick || "", char: p.char, hand: [], bank: [], table: [], harryCol: null, petrified: null }))
    };
    s.players.forEach(p => drawN(s, p, 5));
    s.players.forEach((p, i) => log(s, `@${i} is ${CHARS[p.char].n}.`));
    log(s, "The game begins. @0 goes first.");
    return s;
  }

  // ---- the one entry point ----
  function apply(s0, a, act) {
    const s = clone(s0);
    const P = s.players[a];
    const fail = m => ({ error: m });
    if (s.status !== "play") return fail("The game is over.");
    if (!P) return fail("You are not in this game.");
    const myTurn = s.turn === a;
    if (s.snitch && act.t !== "snitch") return fail("Waiting for Cho Chang to decide on the Snitch.");
    if (s.peek && s.peek.p === a && act.t !== "keep") return fail("Choose the 2 cards you keep first.");
    const canPlay = () => myTurn && s.drew && !s.pending && s.plays < maxPlays(P, s);

    switch (act.t) {
      case "draw": {
        if (!myTurn || s.drew || s.pending || s.peek) return fail("You can't draw now.");
        const n = P.hand.length === 0 ? 5 : has(P, "luna") ? 3 : 2;
        const holders = s.players.map((q, i) => i).filter(i => i !== a && s.players[i].hand.length);
        if (act.src === "skip") {
          if (!has(P, "lupin")) return fail("Only Lupin can skip drawing.");
          P.turnPlays = 5; s.drew = true;
          log(s, `@${a} skipped drawing to play up to 5 cards.`);
          break;
        }
        if (act.src === "myrtle") {
          if (!has(P, "myrtle")) return fail("Only Moaning Myrtle can look at three.");
          const look = { hand: [] }; drawN(s, look, 3);
          s.peek = { p: a, cards: look.hand };
          log(s, `@${a} looked at the top ${look.hand.length} cards.`);
          return finish(s, a, null, s0);
        }
        if (has(P, "ron") && holders.length && act.src !== "ron") return fail("Choose whose hand to draw from.");
        if (act.src === "ron") {
          if (!has(P, "ron")) return fail("Only Ron draws from another hand.");
          const T = s.players[act.p];
          if (act.p === a || !T || !T.hand.length) return fail("Choose a player who has cards.");
          drawN(s, P, n - 1);
          const pick = T.hand[Math.floor(Math.random() * T.hand.length)];
          take(T.hand, pick); P.hand.push(pick);
          log(s, `@${a} drew ${n - 1} card${n - 1 === 1 ? "" : "s"} and took one from @${act.p}'s hand.`);
          s.drew = true;
          break;
        }
        if (act.src === "discard") {
          if (!has(P, "cedric")) return fail("Only Cedric can draw from the discard pile.");
          const k = Math.min(n, s.discard.length);
          for (let i = 0; i < k; i++) P.hand.push(s.discard.pop());
          drawN(s, P, n - k);
          log(s, `@${a} drew ${n} cards, ${k} from the discard pile.`);
        } else {
          drawN(s, P, n);
          log(s, `@${a} drew ${n} cards.`);
        }
        s.drew = true;
        break;
      }
      case "bank": {
        const c = card(act.card);
        if (!canPlay()) return fail("You can't play a card now.");
        if (!P.hand.includes(act.card) || isItem(c)) return fail("That card can't go in the bank.");
        take(P.hand, act.card); P.bank.push(act.card); s.plays++;
        log(s, `@${a} banked ${c.name} (${c.val}).`);
        break;
      }
      case "place": {
        const c = card(act.card);
        if (!canPlay()) return fail("You can't play a card now.");
        if (!P.hand.includes(act.card) || !isItem(c)) return fail("That isn't an item card.");
        if (!colsFor(c).includes(act.col)) return fail("Pick a colour this card allows.");
        take(P.hand, act.card); P.table.push({ c: act.card, col: act.col }); s.plays++;
        log(s, `@${a} played ${c.type === "item" ? c.name : "a wild item"} as ${COLORS[act.col].n}.`);
        break;
      }
      case "cast": {
        const r = cast(s, a, act);
        if (r) return fail(r);
        break;
      }
      case "respond": return finish(s, a, respond(s, a, act), s0);
      case "counter": return finish(s, a, counter(s, a, act), s0);
      case "recolor": {
        if (!myTurn || s.pending) return fail("You can only move wild items on your own turn.");
        const e = entryOf(P, act.card);
        if (!e || !colsFor(card(e.c)).includes(act.col) || card(e.c).type === "item") return fail("That item can't change colour.");
        e.col = act.col;
        break;
      }
      case "keep": {
        const pk = s.peek;
        if (!pk || pk.p !== a) return fail("Nothing to keep.");
        const want = Math.min(2, pk.cards.length), ids = act.cards || [];
        if (ids.length !== want || new Set(ids).size !== want || !ids.every(id => pk.cards.includes(id))) return fail(`Choose ${want} of the cards.`);
        ids.forEach(id => P.hand.push(id));
        pk.cards.filter(id => !ids.includes(id)).forEach(id => s.deck.splice(Math.floor(Math.random() * (s.deck.length + 1)), 0, id));
        s.peek = null; s.drew = true;
        log(s, `@${a} kept ${want} and put the rest back into the deck.`);
        break;
      }
      case "copy": {
        if (!myTurn || s.drew || s.pending || !active(P, "hagrid")) return fail("Hagrid copies a power at the start of his turn.");
        if (P.copy) return fail("You've already copied a power this turn.");
        if (act.ch === "hagrid" || act.ch === "cho" || !s.players.some((q, i) => i !== a && q.char === act.ch)) return fail("Copy another player's character (Cho's Snitch can't be copied).");
        if (!copyReady(P, act.ch)) return fail("You copied that power too recently.");
        P.copy = act.ch; P.copied = Object.assign({}, P.copied, { [act.ch]: P.turnNo || 0 });
        log(s, `@${a} copied ${CHARS[act.ch].n}'s power for this turn.`);
        break;
      }
      case "peeves": {
        if (!myTurn || !s.drew || s.pending || !has(P, "peeves")) return fail("Peeves swaps on his own turn, after drawing.");
        if (P.peeved) return fail("Peeves has already swapped this turn.");
        const T = s.players[act.p];
        if (act.p === a || !T || !T.hand.length || !P.hand.length) return fail("You both need a card in hand.");
        const mine = P.hand[Math.floor(Math.random() * P.hand.length)], theirs = T.hand[Math.floor(Math.random() * T.hand.length)];
        take(P.hand, mine); take(T.hand, theirs); P.hand.push(theirs); T.hand.push(mine); P.peeved = true;
        log(s, `@${a} and @${act.p} blind-swapped a card.`);
        break;
      }
      case "snitch": {
        const sn = s.snitch;
        if (!sn || sn.cho !== a) return fail("Nothing to catch.");
        s.snitch = null;
        if (act.use) {
          const T = s.players[sn.p], e = entryOf(T, sn.c);
          if (e) { T.table.splice(T.table.indexOf(e), 1); T.hand.push(sn.c); }
          P.snitches = (P.snitches || 0) + 1;
          log(s, `@${a} caught the Snitch! @${sn.p}'s winning card goes back to their hand.`);
          return finish(s, a, null, s);
        }
        s.status = "over"; s.winner = sn.p; log(s, `@${sn.p} completed three sets and wins!`);
        return { state: s };
      }
      case "harry": {
        if (!myTurn || !has(P, "harry")) return fail("Only Harry can choose a protected colour, on his turn.");
        if (!COLORS[act.col]) return fail("Unknown colour.");
        P.harryCol = act.col;
        log(s, `@${a} now protects ${COLORS[act.col].n} items.`);
        break;
      }
      case "unpetrify": {
        if (!myTurn || s.pending || P.petrified == null) return fail("Nothing to unfreeze.");
        const ids = act.cards || [];
        if (new Set(ids).size !== ids.length || !ids.every(id => P.hand.includes(id))) return fail("Pick cards from your hand.");
        if (ids.reduce((t, id) => t + card(id).val, 0) < 10) return fail("You need to discard at least 10 points.");
        ids.forEach(id => { take(P.hand, id); s.discard.push(id); });
        s.discard.push(P.petrified); P.petrified = null;
        log(s, `@${a} broke free of Petrificus Totalus.`);
        break;
      }
      case "end": {
        if (!myTurn || !s.drew || s.pending) return fail("You can't end your turn yet.");
        const extra = P.hand.length - handLimit(P);
        if (extra > 0) {
          const ids = act.discard || [];
          if (ids.length !== extra || new Set(ids).size !== extra || !ids.every(id => P.hand.includes(id))) return fail(`Discard exactly ${extra} card${extra > 1 ? "s" : ""} first.`);
          ids.forEach(id => { take(P.hand, id); s.discard.push(id); });
        }
        P.turnPlays = 0; P.copy = null; P.peeved = false; P.turnNo = (P.turnNo || 0) + 1;
        s.turn = (s.turn + 1) % s.players.length; s.drew = false; s.plays = 0;
        log(s, `@${s.turn}'s turn.`);
        break;
      }
      default: return fail("Unknown action.");
    }
    return finish(s, a, null, s0);
  }

  // A third complete set wins, unless Cho can catch the Snitch: then the game waits for her answer.
  function finish(s, a, err, s0) {
    if (err && typeof err === "string") return { error: err };
    if (s.status === "play" && !s.snitch) {
      const order = [a, ...s.players.map((_, i) => i).filter(i => i !== a)];
      for (const i of order) if (completeCols(s.players[i]).length >= 3) {
        const before = s0 && s0.players[i] ? s0.players[i].table.map(e => e.c + ":" + e.col) : [];
        const added = s.players[i].table.filter(e => !before.includes(e.c + ":" + e.col)).pop();
        const cho = s.players.findIndex((q, k) => k !== i && active(q, "cho") && (q.snitches || 0) < 2);
        if (cho >= 0 && added && complete(s.players[i], added.col)) {
          s.snitch = { p: i, c: added.c, cho };
          log(s, `@${i} is about to win! @${cho} can catch the Snitch.`);
          break;
        }
        s.status = "over"; s.winner = i; log(s, `@${i} completed three sets and wins!`); break;
      }
    }
    return { state: s };
  }

  function cast(s, a, act) {
    const P = s.players[a];
    const c = card(act.card);
    if (!(s.turn === a && s.drew && !s.pending && s.plays < maxPlays(P, s))) return "You can't play a card now.";
    if (!P.hand.includes(act.card) || c.type !== "spell") return "That isn't a spell in your hand.";
    const k = c.k;
    if (k === "protego") return "Protego can only be played to block a spell.";
    const others = s.players.map((_, i) => i).filter(i => i !== a);
    const T = s.players[act.p];
    const needTarget = () => (act.p === a || !T) ? "Choose another player." : null;
    let tg = null, prm = {};

    switch (k) {
      case "geminio": break;
      case "reparo": {
        if (!s.discard.includes(act.pick)) return "Choose a card from the discard pile.";
        const pc = card(act.pick);
        if (isItem(pc) && !colsFor(pc).includes(act.col)) return "Pick a colour for that item.";
        break;
      }
      case "alohomora": tg = others.map(p => ({ p, amt: 2, st: "respond" })); break;
      case "accio2": {
        if (!c.cols.includes(act.col) || !colCount(P, act.col)) return "Pick a colour on this card that you have items in.";
        tg = others.map(p => ({ p, amt: rent(P, act.col), st: "respond" })); prm.col = act.col; break;
      }
      case "accioAny": {
        if (!COLORS[act.col] || !colCount(P, act.col)) return "Pick a colour you have items in.";
        tg = others.map(p => ({ p, amt: rent(P, act.col), st: "respond" })); prm.col = act.col; break;
      }
      case "stupefy": { const e = needTarget(); if (e) return e; tg = [{ p: act.p, amt: 5, st: "respond" }]; break; }
      case "petrificus": {
        const e = needTarget(); if (e) return e;
        if (T.petrified != null) return "That character is already frozen.";
        tg = [{ p: act.p, st: "respond" }]; break;
      }
      case "levicorpus": case "wingardium": {
        const e = needTarget(); if (e) return e;
        const en = entryOf(T, act.target);
        if (!en) return "Choose one of their items.";
        if (k === "levicorpus" ? !canTake(T, en, P) : !canBanish(T, en)) return "That item is protected.";
        tg = [{ p: act.p, st: "respond" }]; prm.target = act.target; break;
      }
      case "confundo": {
        const e = needTarget(); if (e) return e;
        const theirs = entryOf(T, act.target), mine = entryOf(P, act.mine);
        if (!theirs || !mine) return "Choose one of their items and one of yours.";
        if (!canTake(T, theirs, P)) return "Their item is protected.";
        if (complete(P, mine.col)) return "You can't give away an item from your complete set.";
        tg = [{ p: act.p, st: "respond" }]; prm.target = act.target; prm.mine = act.mine; break;
      }
      case "obliviate": {
        const e = needTarget(); if (e) return e;
        if (!COLORS[act.col] || !canObliviate(T, act.col)) return "Choose one of their complete sets that isn't protected.";
        tg = [{ p: act.p, st: "respond" }]; prm.col = act.col; break;
      }
      default: return "Unknown spell.";
    }

    take(P.hand, act.card); s.plays++; P.casts = (P.casts || 0) + 1;
    stamp(s, a, k, { col: prm.col || null, t: tg ? (tg.length > 1 ? -1 : tg[0].p) : null });
    const label = k === "accio2" || k === "accioAny" ? `Accio (${COLORS[prm.col].n})` : c.name;
    if (k === "geminio") {
      drawN(s, P, 2); s.discard.push(act.card);
      log(s, `@${a} cast Geminio and drew two cards.`);
    } else if (k === "reparo") {
      take(s.discard, act.pick);
      const pc = card(act.pick);
      if (isItem(pc)) P.table.push({ c: act.pick, col: act.col }); else P.bank.push(act.pick);
      s.discard.push(act.card);
      log(s, `@${a} cast Reparo and recovered ${pc.name} from the discard pile.`);
    } else {
      s.pending = { k, caster: a, card: act.card, prm, tg };
      const who = tg.length > 1 ? "everyone" : `@${tg[0].p}`;
      log(s, `@${a} cast ${label} on ${who}.`);
    }
    return null;
  }

  function respond(s, a, act) {
    const pd = s.pending;
    const t = pd && pd.tg.find(x => x.p === a && x.st === "respond");
    if (!t) return "Nothing for you to answer.";
    const P = s.players[a], C = s.players[pd.caster];
    if (act.choice === "protego") {
      const pid = P.hand.find(id => card(id).k === "protego");
      if (pid == null) return "You have no Protego.";
      take(P.hand, pid); s.discard.push(pid); t.st = "counter";
      stamp(s, a, "protego", { t: pd.caster });
      log(s, `@${a} blocked it with Protego!`);
    } else if (act.choice === "accept") {
      if (PAY_KINDS.includes(pd.k)) {
        const ids = act.pay || [];
        if (new Set(ids).size !== ids.length) return "Each card can be paid once.";
        const owned = payable(P);
        if (!ids.every(id => owned.includes(id))) return P.table.some(e => ids.includes(e.c) && harryGuards(P, e.col))
          ? "Your protected items can't be used to pay." : "Pay only with cards in your bank or on the table.";
        const sum = ids.reduce((x, id) => x + card(id).val, 0);
        const allValuable = owned.filter(id => card(id).val > 0).every(id => ids.includes(id));
        if (sum < t.amt && !allValuable) return `Pick at least ${t.amt} points.`;
        ids.forEach(id => {
          if (take(P.bank, id)) C.bank.push(id);
          else { const e = entryOf(P, id); P.table.splice(P.table.indexOf(e), 1); C.table.push({ c: id, col: e.col }); }
        });
        log(s, `@${a} paid @${pd.caster} ${sum} point${sum === 1 ? "" : "s"}.`);
      } else {
        effect(s, pd, t);
      }
      t.st = "done";
    } else return "Choose to accept or block.";
    settle(s);
    return null;
  }

  function counter(s, a, act) {
    const pd = s.pending;
    if (!pd || pd.caster !== a) return "Nothing for you to answer.";
    const t = pd.tg.find(x => x.p === act.p && x.st === "counter");
    if (!t) return "That player hasn't blocked you.";
    const P = s.players[a];
    if (act.choice === "protego") {
      const pid = P.hand.find(id => card(id).k === "protego");
      if (pid == null) return "You have no Protego.";
      take(P.hand, pid); s.discard.push(pid); t.st = "respond";
      stamp(s, a, "protego", { t: act.p });
      log(s, `@${a} answered with their own Protego!`);
    } else {
      t.st = "done"; t.blocked = true;
      log(s, `@${a}'s spell on @${t.p} was blocked.`);
    }
    settle(s);
    return null;
  }

  function effect(s, pd, t) {
    const C = s.players[pd.caster], T = s.players[t.p];
    const fizzle = () => log(s, "The spell fizzled: its target had changed.");
    switch (pd.k) {
      case "levicorpus": {
        const e = entryOf(T, pd.prm.target);
        if (!e || !canTake(T, e, C)) return fizzle();
        T.table.splice(T.table.indexOf(e), 1); C.table.push(e);
        log(s, `@${pd.caster} took ${card(e.c).name} from @${t.p}.`); break;
      }
      case "wingardium": {
        const e = entryOf(T, pd.prm.target);
        if (!e || !canBanish(T, e)) return fizzle();
        T.table.splice(T.table.indexOf(e), 1); s.discard.push(e.c);
        log(s, `@${t.p}'s ${card(e.c).name} floated off to the discard pile.`); break;
      }
      case "confundo": {
        const th = entryOf(T, pd.prm.target), mi = entryOf(C, pd.prm.mine);
        if (!th || !mi || !canTake(T, th, C) || complete(C, mi.col)) return fizzle();
        T.table.splice(T.table.indexOf(th), 1); C.table.splice(C.table.indexOf(mi), 1);
        C.table.push(th); T.table.push(mi);
        log(s, `@${pd.caster} swapped ${card(mi.c).name} for @${t.p}'s ${card(th.c).name}.`); break;
      }
      case "obliviate": {
        const col = pd.prm.col;
        if (!canObliviate(T, col)) return fizzle();
        const set = T.table.filter(e => e.col === col).sort((x, y) => (card(x.c).type === "any") - (card(y.c).type === "any")).slice(0, COLORS[col].size);
        set.forEach(e => { T.table.splice(T.table.indexOf(e), 1); C.table.push(e); });
        log(s, `@${pd.caster} took @${t.p}'s whole ${COLORS[col].n} set!`); break;
      }
      case "petrificus": {
        if (T.petrified != null) return fizzle();
        t.applied = true;
        log(s, `@${t.p}'s character is frozen by Petrificus Totalus.`); break;
      }
    }
  }

  function settle(s) {
    const pd = s.pending;
    if (!pd.tg.every(t => t.st === "done")) return;
    const t = pd.tg[0];
    if (pd.k === "petrificus" && t.applied) s.players[t.p].petrified = pd.card;
    else s.discard.push(pd.card);
    s.pending = null;
  }

  /** Who has to act right now: pending responders first, otherwise the current player. */
  function waitingOn(s) {
    if (s.status !== "play") return [];
    if (s.snitch) return [s.snitch.cho];
    if (s.pending) {
      const r = s.pending.tg.filter(t => t.st === "respond").map(t => t.p);
      if (s.pending.tg.some(t => t.st === "counter")) r.push(s.pending.caster);
      return r;
    }
    return [s.turn];
  }

  // ---- turn clock ----
  // Each turn has 3 minutes. While a spell waits for answers the turn clock pauses and the players asked share a
  // 30-second window. The server calls syncClock after every change and expire whenever it reads a table, so time
  // runs out even if nobody acts. All times are server milliseconds.
  const TURN_MS = 180000, RESPOND_MS = 30000;
  const shuffled = a => shuffle(a.slice());
  // What a player pays when their time runs out: bank notes first, then items outside complete sets, then complete
  // sets, at random within each group, until the debt is covered. Items Harry protects are never taken.
  function autoPay(P, amt) {
    const open = P.table.filter(e => !harryGuards(P, e.col));
    const order = [...shuffled(P.bank), ...shuffled(open.filter(e => !complete(P, e.col)).map(e => e.c)), ...shuffled(open.filter(e => complete(P, e.col)).map(e => e.c))];
    const pay = []; let sum = 0;
    for (const id of order) { if (sum >= amt) break; if (card(id).val > 0) { pay.push(id); sum += card(id).val; } }
    return pay;
  }
  function syncClock(prev, s, now) {
    if (s.status !== "play") { s.clock = null; return s; }
    const fresh = !prev || prev.status !== "play" || !prev.clock || prev.created !== s.created;
    const c = fresh ? { turn: -1 } : Object.assign({}, prev.clock);
    const wait = (s.pending || s.snitch) ? waitingOn(s) : [];
    if (fresh || c.turn !== s.turn) Object.assign(c, { turn: s.turn, left: TURN_MS, since: s.pending ? null : now, resp: null, wait: [] });
    if (wait.length) {
      if (c.since != null) { c.left = Math.max(0, c.left - (now - c.since)); c.since = null; }   // pause the turn
      if (c.resp == null || wait.some(p => !(c.wait || []).includes(p))) c.resp = now + RESPOND_MS;   // someone new must answer
    } else {
      c.resp = null;
      if (c.since == null) c.since = now;   // resume the turn
    }
    c.wait = wait;
    s.clock = c;
    return s;
  }
  // The draw a player would have made: Myrtle keeps the first two she looked at, Ron takes from a random opponent.
  function autoDraw(s, a) {
    const P = s.players[a];
    if (s.peek && s.peek.p === a) { const r = apply(s, a, { t: "keep", cards: s.peek.cards.slice(0, 2) }); return r.error ? s : r.state; }
    if (s.drew) return s;
    const holders = s.players.map((q, i) => i).filter(i => i !== a && s.players[i].hand.length);
    const act = has(P, "ron") && holders.length ? { t: "draw", src: "ron", p: holders[Math.floor(Math.random() * holders.length)] } : { t: "draw", src: "deck" };
    const r = apply(s, a, act); return r.error ? s : r.state;
  }
  // Applies whatever the clock says is overdue. Returns the new state, or null when nothing has run out.
  function expire(s0, now) {
    let s = s0, changed = false;
    for (let guard = 0; guard < 8 && s.status === "play" && s.clock; guard++) {
      const c = s.clock, pd = s.pending;
      let next = null;
      if (s.snitch && c.resp != null && now >= c.resp) {
        const r = apply(s, s.snitch.cho, { t: "snitch", use: false });   // out of time: the win stands
        if (r.error) break;
        next = r.state;
      } else if (pd && c.resp != null && now >= c.resp) {
        next = clone(s);
        for (const t of next.pending.tg.filter(x => x.st === "respond")) {
          if (!next.pending) break;
          const P = next.players[t.p];
          log(next, `@${t.p} ran out of time to answer.`);
          const r = apply(next, t.p, PAY_KINDS.includes(pd.k) ? { t: "respond", choice: "accept", pay: autoPay(P, t.amt) } : { t: "respond", choice: "accept" });
          if (!r.error) next = r.state;
        }
        if (next.pending) for (const t of next.pending.tg.filter(x => x.st === "counter")) {
          if (!next.pending) break;
          log(next, `@${next.pending.caster} ran out of time and let it go.`);
          const r = apply(next, next.pending.caster, { t: "counter", p: t.p, choice: "yield" });
          if (!r.error) next = r.state;
        }
      } else if (!pd && c.since != null && now - c.since >= c.left) {
        const a = s.turn;
        next = clone(s);
        log(next, `@${a} ran out of time.`);
        next = autoDraw(next, a);
        const P = next.players[a], extra = P.hand.length - handLimit(P);
        const r = apply(next, a, { t: "end", discard: extra > 0 ? shuffled(P.hand).slice(0, extra) : [] });
        if (r.error) break;
        next = r.state;
      }
      if (!next) break;
      s = syncClock(s, next, now); changed = true;
    }
    return changed ? s : null;
  }

  // ---- ranking ----
  // EXP for a finished game. Places: the winner first, then everyone else by complete sets, then total value on the table.
  // Winner 100; 2nd 60; 3rd 45; everyone else 30. Everyone adds 10 per complete set,
  // 3 per spell cast (up to 15) and 1 per Galleon in the bank (up to 25).
  const XP = { win: 100, second: 60, third: 45, rest: 30, perSet: 10, perCast: 3, castCap: 15, perGalleon: 1, galleonCap: 25 };
  function awards(s) {
    if (s.status !== "over" || s.winner == null) return [];
    const n = s.players.length, others = s.players.map((p, i) => i).filter(i => i !== s.winner)
      .sort((x, y) => completeCols(s.players[y]).length - completeCols(s.players[x]).length || worth(s.players[y]) - worth(s.players[x]));
    const order = [s.winner, ...others];
    return s.players.map((p, i) => {
      const place = order.indexOf(i) + 1, sets = completeCols(p).length, casts = p.casts || 0, galleons = bankTotal(p);
      const parts = { place: place === 1 ? XP.win : place === 2 ? XP.second : place === 3 ? XP.third : XP.rest,
        sets: XP.perSet * sets, spells: Math.min(XP.castCap, XP.perCast * casts), galleons: Math.min(XP.galleonCap, XP.perGalleon * galleons) };
      return { p: i, nick: p.nick || "", place, sets, casts, galleons, parts, xp: parts.place + parts.sets + parts.spells + parts.galleons, won: place === 1 };
    });
  }
  // Level 2 at 100 EXP; each level needs 50 more than the last (100, 150, 200...).
  function levelFor(xp) {
    let level = 1, need = 100, floor = 0;
    while (xp >= floor + need) { floor += need; level++; need += 50; }
    return { level, into: xp - floor, need };
  }

  G.Engine = { XP, awards, levelFor, BASE, MAX_PLAYERS, decksFor, handLimit, has, copyReady, umbridgeLimits, TURN_MS, RESPOND_MS, autoPay, syncClock, expire, COLORS, COLOR_KEYS, SPELLS, CHARS, CARDS, PAY_KINDS, card, isItem, colsFor, active, maxPlays, colCount, complete, completeCols, rent, bankTotal, worth, canTake, canBanish, canObliviate, payable, harryGuards, newGame, apply, waitingOn, shuffle };
})(typeof window !== "undefined" ? window : globalThis);
