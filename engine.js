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
    accioAny:   { n: "Accio",              val: 3, d: "Pick any colour you have items in. One player of your choice pays you the charge for it." },
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
    harry:    { n: "Harry Potter",     d: "Choose one colour. Nobody can take or banish your items of that colour." },
    hermione: { n: "Hermione Granger", d: "Play up to four cards on your turn instead of three." },
    draco:    { n: "Draco Malfoy",     d: "Levicorpus and Confundo can take items from complete sets." },
    luna:     { n: "Luna Lovegood",    d: "Draw three cards at the start of your turn instead of two." },
    cedric:   { n: "Cedric Diggory",   d: "You may draw your cards from the top of the discard pile instead." }
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

  // ---- helpers ----
  const card = id => CARDS[id];
  const isItem = c => c.type === "item" || c.type === "wild" || c.type === "any";
  const colsFor = c => c.type === "item" ? [c.col] : c.type === "wild" ? c.cols : c.type === "any" ? COLOR_KEYS : [];
  const active = (p, ch) => p.char === ch && p.petrified == null;
  const maxPlays = p => active(p, "hermione") ? 4 : 3;
  const colCount = (p, col) => p.table.filter(t => t.col === col).length;
  const complete = (p, col) => colCount(p, col) >= COLORS[col].size && p.table.some(t => t.col === col && card(t.c).type !== "any");
  const completeCols = p => COLOR_KEYS.filter(col => complete(p, col));
  const rent = (p, col) => { const n = Math.min(colCount(p, col), COLORS[col].size); return n ? COLORS[col].rent[n - 1] : 0; };
  const bankTotal = p => p.bank.reduce((s, id) => s + card(id).val, 0);
  const worth = p => bankTotal(p) + p.table.reduce((s, t) => s + card(t.c).val, 0);
  const harryGuards = (p, col) => active(p, "harry") && p.harryCol === col;
  const canTake = (target, entry, thief) => !harryGuards(target, entry.col) && (!complete(target, entry.col) || active(thief, "draco"));
  const canBanish = (target, entry) => !harryGuards(target, entry.col) && !complete(target, entry.col);
  const canObliviate = (target, col) => complete(target, col) && !harryGuards(target, col);
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
      deck: shuffle(CARDS.map(c => c.id)), discard: [], log: [],
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
    const canPlay = () => myTurn && s.drew && !s.pending && s.plays < maxPlays(P);

    switch (act.t) {
      case "draw": {
        if (!myTurn || s.drew || s.pending) return fail("You can't draw now.");
        const n = P.hand.length === 0 ? 5 : active(P, "luna") ? 3 : 2;
        if (act.src === "discard") {
          if (!active(P, "cedric")) return fail("Only Cedric can draw from the discard pile.");
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
      case "respond": return finish(s, a, respond(s, a, act));
      case "counter": return finish(s, a, counter(s, a, act));
      case "recolor": {
        if (!myTurn || s.pending) return fail("You can only move wild items on your own turn.");
        const e = entryOf(P, act.card);
        if (!e || !colsFor(card(e.c)).includes(act.col) || card(e.c).type === "item") return fail("That item can't change colour.");
        e.col = act.col;
        break;
      }
      case "harry": {
        if (!myTurn || !active(P, "harry")) return fail("Only Harry can choose a protected colour, on his turn.");
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
        const extra = P.hand.length - 7;
        if (extra > 0) {
          const ids = act.discard || [];
          if (ids.length !== extra || new Set(ids).size !== extra || !ids.every(id => P.hand.includes(id))) return fail(`Discard exactly ${extra} card${extra > 1 ? "s" : ""} first.`);
          ids.forEach(id => { take(P.hand, id); s.discard.push(id); });
        }
        s.turn = (s.turn + 1) % s.players.length; s.drew = false; s.plays = 0;
        log(s, `@${s.turn}'s turn.`);
        break;
      }
      default: return fail("Unknown action.");
    }
    return finish(s, a);
  }

  function finish(s, a, err) {
    if (err && typeof err === "string") return { error: err };
    if (s.status === "play") {
      const order = [a, ...s.players.map((_, i) => i).filter(i => i !== a)];
      for (const i of order) if (completeCols(s.players[i]).length >= 3) {
        s.status = "over"; s.winner = i; log(s, `@${i} completed three sets and wins!`); break;
      }
    }
    return { state: s };
  }

  function cast(s, a, act) {
    const P = s.players[a];
    const c = card(act.card);
    if (!(s.turn === a && s.drew && !s.pending && s.plays < maxPlays(P))) return "You can't play a card now.";
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
        const e = needTarget(); if (e) return e;
        tg = [{ p: act.p, amt: rent(P, act.col), st: "respond" }]; prm.col = act.col; break;
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

    take(P.hand, act.card); s.plays++;
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
        const owned = [...P.bank, ...P.table.map(e => e.c)];
        if (!ids.every(id => owned.includes(id))) return "Pay only with cards in your bank or on the table.";
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
    if (s.pending) {
      const r = s.pending.tg.filter(t => t.st === "respond").map(t => t.p);
      if (s.pending.tg.some(t => t.st === "counter")) r.push(s.pending.caster);
      return r;
    }
    return [s.turn];
  }

  G.Engine = { COLORS, COLOR_KEYS, SPELLS, CHARS, CARDS, PAY_KINDS, card, isItem, colsFor, active, maxPlays, colCount, complete, completeCols, rent, bankTotal, worth, canTake, canBanish, canObliviate, harryGuards, newGame, apply, waitingOn, shuffle };
})(typeof window !== "undefined" ? window : globalThis);
