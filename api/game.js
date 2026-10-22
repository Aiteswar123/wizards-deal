// Wizard's Deal game server: one Vercel function that stores each table in Redis
// and runs every move through the shared rules engine.
require("../engine.js");
require("../uno.js");
require("../nasi.js");
const E = globalThis.Engine, U = globalThis.Uno, N = globalThis.Nasi;
// Each table plays one game: Wizard's Deal (the default) or Grand Line UNO (kind "uno"). ENG picks its rules engine.
const ENG = g => g && g.kind === "uno" ? U : g && g.kind === "nasi" ? N : E;
const KINDS = ["uno", "nasi"];

// ---- storage: Upstash Redis over REST (Vercel Marketplace), or memory for local dev ----
const R_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const R_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const mem = globalThis.__wdMem || (globalThis.__wdMem = { kv: new Map(), z: new Map() });

async function redis(cmd) {
  if (!R_URL) return memRedis(cmd);
  const r = await fetch(R_URL, { method: "POST", headers: { Authorization: "Bearer " + R_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
function memRedis([op, ...a]) {
  const now = Date.now();
  const live = k => { const e = mem.kv.get(k); if (e && e.exp && e.exp < now) { mem.kv.delete(k); return null; } return e; };
  switch (op) {
    case "GET": { const e = live(a[0]); return e ? e.v : null; }
    case "SET": {
      const nx = a.includes("NX"), px = a.indexOf("PX"), ex = a.indexOf("EX");
      if (nx && live(a[0])) return null;
      mem.kv.set(a[0], { v: a[1], exp: px > 0 ? now + +a[px + 1] : ex > 0 ? now + 1000 * a[ex + 1] : 0 });
      return "OK";
    }
    case "DEL": return mem.kv.delete(a[0]) ? 1 : 0;
    case "ZADD": mem.z.set(a[2], +a[1]); return 1;
    case "ZREM": return mem.z.delete(a[1]) ? 1 : 0;
    case "ZRANGEBYSCORE": return [...mem.z.entries()].filter(([, s]) => s >= +a[1]).sort((x, y) => y[1] - x[1]).map(([k]) => k);
    case "MGET": return a.map(k => { const e = live(k); return e ? e.v : null; });
  }
  throw new Error("unsupported " + op);
}

// Photos and live games are kept a week; a paused game is kept a month so it can be finished later.
const TTL = 60 * 60 * 24 * 30;
const gameTTL = g => (g.status === "paused" ? 30 : 7) * 24 * 3600;
// Crew photos: each player's own small JPEG for a table, kept beside the table (not in it, so polls stay light).
const photoKey = (code, uid) => "wd:photo:" + code + ":" + uid;
const PHOTO_MAX = 90000;   // characters of data URL, about 65 KB of JPEG
const okPhoto = d => typeof d === "string" && d.length <= PHOTO_MAX && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(d);
const key = code => "wd:game:" + code;
const load = async code => { const v = await redis(["GET", key(code)]); return v ? JSON.parse(v) : null; };
const save = (code, g) => redis(["SET", key(code), JSON.stringify(g), "EX", String(gameTTL(g))]);

async function withLock(code, fn) {
  const lk = "wd:lock:" + code, me = Math.random().toString(36).slice(2);
  for (let i = 0; i < 40; i++) {
    if (await redis(["SET", lk, me, "NX", "PX", "5000"])) {
      try { return await fn(); } finally { await redis(["DEL", lk]); }
    }
    await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
  }
  throw Object.assign(new Error("The table is busy. Try again."), { status: 409 });
}

// ---- what each player is allowed to see ----
function view(g, pid) {
  const out = JSON.parse(JSON.stringify(g));
  delete out.tokens;
  if (Array.isArray(out.deck)) out.deck = out.deck.map(() => -1);
  if (out.players) out.players.forEach(p => { if (p.uid !== pid && Array.isArray(p.hand)) p.hand = p.hand.map(() => -1); });
  // Moaning Myrtle's three cards are for her eyes only
  if (out.peek && out.players[out.peek.p] && out.players[out.peek.p].uid !== pid) out.peek.cards = out.peek.cards.map(() => -1);
  // UNO: which card the player on turn just drew is theirs to know
  if (out.kind === "uno" && out.drew != null && out.players[out.turn] && out.players[out.turn].uid !== pid) out.drew = -1;
  // Nasi Lemak: each Nasi Lemak card lies face down (only its owner knows 1 or 2 packs) until the game ends;
  // the Officer sees the inspected hand, nobody else does
  if (out.kind === "nasi") {
    if (Array.isArray(out.nlPile)) out.nlPile = out.nlPile.map(() => -1);
    if (out.status !== "over") out.players.forEach(p => { if (p.uid !== pid && Array.isArray(p.nl)) p.nl.forEach(e => { e.n = -1; }); });
    const pd = out.pending;
    if (pd && pd.k === "officer" && out.players[pd.from] && out.players[pd.from].uid === pid) pd.hand = g.players[pd.to].hand.slice();
  }
  return out;
}
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const cleanNick = n => String(n || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 20);
const okId = s => typeof s === "string" && /^[a-z0-9]{8,40}$/i.test(s);

async function lobbies() {
  const codes = await redis(["ZRANGEBYSCORE", "wd:lobbies", String(Date.now() - 6 * 3600e3), "+inf"]);
  if (!codes || !codes.length) return [];
  const docs = await redis(["MGET", ...codes.slice(0, 30).map(key)]);
  return docs.map(d => d && JSON.parse(d)).filter(g => g && g.status === "lobby" && g.players.length < ENG(g).MAX_PLAYERS)
    .map(g => ({ code: g.code, kind: g.kind || "deal", host: (g.players.find(p => p.uid === g.host) || {}).nick || "A wizard", count: g.players.length }));
}

// ---- ranking: one shared record of every player, matched by name (ignoring capitals and spaces) ----
const RANK_KEY = "wd:ranking";
// UNO has its own Hall of Fame
const rankKey = kind => kind === "uno" ? "wd:uno:ranking" : kind === "nasi" ? "wd:nasi:ranking" : RANK_KEY;
const profileKey = nick => String(nick || "").trim().toLowerCase().replace(/s+/g, " ");
async function loadRanking(kind) { const v = await redis(["GET", rankKey(kind)]); return v ? JSON.parse(v) : {}; }
// One-time corrections to records made under older EXP rules. Each runs once, marked done by its own key.
const RANK_FIXES = [
  // The winner's +10 per player beyond 2 was removed; the one game won before that was a 7-player game (+50).
  { id: "winner-flat-100", xp: { ryuzzzzz: -50 } }
];
async function fixRanking() {
  if (fixRanking.done) return;
  for (const f of RANK_FIXES) {
    const flag = "wd:fix:" + f.id;
    if (await redis(["GET", flag])) continue;
    await withLock("RANKING", async () => {
      if (await redis(["GET", flag])) return;
      const r = await loadRanking();
      for (const [k, d] of Object.entries(f.xp)) if (r[k]) r[k].xp = Math.max(0, r[k].xp + d);
      await redis(["SET", RANK_KEY, JSON.stringify(r)]);
      await redis(["SET", flag, String(Date.now())]);
    });
  }
  fixRanking.done = true;
}
// Adds a finished game's EXP to everyone's record, once per game.
async function recordGame(g) {
  if (g.status !== "over" || g.recorded) return;
  await fixRanking();
  const list = ENG(g).awards(g);
  g.recorded = true; g.awards = list;
  await withLock(g.kind === "uno" ? "UNORANK" : g.kind === "nasi" ? "NASIRANK" : "RANKING", async () => {
    const r = await loadRanking(g.kind);
    for (const a of list) {
      const k = profileKey(a.nick); if (!k) continue;
      const p = r[k] || { name: a.nick, xp: 0, games: 0, wins: 0 };
      const before = E.levelFor(p.xp).level;
      p.name = a.nick; p.xp += a.xp; p.games += 1; p.wins += a.won ? 1 : 0; p.last = Date.now();
      a.total = p.xp; a.level = E.levelFor(p.xp).level; a.levelUp = a.level > before;
      r[k] = p;
    }
    await redis(["SET", rankKey(g.kind), JSON.stringify(r)]);
  });
}
// The overall ranking adds each player's Wizard's Deal and Grand Line UNO records together, matched by name.
async function overallRanking() {
  await fixRanking();
  const [deal, uno, nasi] = await Promise.all([loadRanking("deal"), loadRanking("uno"), loadRanking("nasi")]);
  const all = {};
  for (const [src, r] of [["deal", deal], ["uno", uno], ["nasi", nasi]]) for (const [k, p] of Object.entries(r)) {
    const t = all[k] || (all[k] = { name: p.name, xp: 0, games: 0, wins: 0, deal: 0, uno: 0, nasi: 0, last: -1 });
    t.xp += p.xp; t.games += p.games; t.wins += p.wins; t[src] = p.xp;
    if ((p.last || 0) > t.last) { t.last = p.last || 0; t.name = p.name; }   // show the name they used most recently
  }
  return Object.values(all).sort((a, b) => b.xp - a.xp || b.wins - a.wins).slice(0, 100)
    .map(p => Object.assign({ name: p.name, xp: p.xp, games: p.games, wins: p.wins, deal: p.deal, uno: p.uno, nasi: p.nasi }, E.levelFor(p.xp)));
}
async function ranking(kind) {
  if (kind === "all") return overallRanking();
  if (!KINDS.includes(kind)) await fixRanking();
  const r = await loadRanking(kind);
  return Object.values(r).sort((a, b) => b.xp - a.xp || b.wins - a.wins).slice(0, 100)
    .map(p => Object.assign({ name: p.name, xp: p.xp, games: p.games, wins: p.wins }, E.levelFor(p.xp)));
}

// Applies anything the turn clock says has run out (a turn ending, an unanswered spell) and saves it.
// Every device polls about once a second, so time runs out on schedule even if nobody acts.
async function settleClock(code, g) {
  if (!g || !ENG(g).expire(g, Date.now())) return g;
  return withLock(code, async () => {
    const cur = await load(code);
    const next = cur && ENG(cur).expire(cur, Date.now());
    if (!next) return cur;
    next.tokens = cur.tokens; next.v = (cur.v || 0) + 1; next.updated = Date.now();
    await recordGame(next);
    await save(code, next);
    return next;
  });
}

async function handle(req) {
  const q = req.method === "GET" ? req.query : (req.body || {});
  if (req.method === "GET") {
    if (q.list) return { lobbies: await lobbies() };
    // a player's crew photo at a table (UNO): fetched once per version and cached by the browser
    if (q.photo) {
      const code = String(q.code || "").toUpperCase(), uid = String(q.uid || "");
      if (!/^[A-Z]{4}$/.test(code) || !okId(uid)) return { photo: null };
      return { photo: await redis(["GET", photoKey(code, uid)]) };
    }
    if (q.ranking) return { ranking: await ranking(KINDS.includes(q.kind) || q.kind === "all" ? q.kind : "deal") };
    const code = String(q.code || "").toUpperCase();
    const g = await settleClock(code, await load(code));
    if (!g) return { gone: true };
    if (q.v && +q.v === g.v) return { same: true, v: g.v, now: Date.now() };
    return { game: view(g, q.pid), now: Date.now() };
  }

  const { op, pid, token } = q;
  if (!okId(pid) || !okId(token)) throw Object.assign(new Error("Missing player id."), { status: 400 });

  if (op === "create") {
    let code;
    for (let i = 0; i < 10; i++) {
      code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
      if (!(await load(code))) break;
    }
    const g = { status: "lobby", kind: KINDS.includes(q.kind) ? q.kind : undefined, code, host: pid, created: Date.now(), v: 1, players: [{ uid: pid, nick: cleanNick(q.nick) }], tokens: { [pid]: token } };
    await save(code, g);
    await redis(["ZADD", "wd:lobbies", String(g.created), code]);
    return { game: view(g, pid) };
  }

  const code = String(q.code || "").toUpperCase();
  if (!/^[A-Z]{4}$/.test(code)) throw Object.assign(new Error("Enter the 4-letter game code."), { status: 400 });

  return withLock(code, async () => {
    const loaded = await load(code);
    if (!loaded) throw Object.assign(new Error(`No game with code ${code}.`), { status: 404 });
    const g = ENG(loaded).expire(loaded, Date.now()) || loaded;   // anything overdue happens before this move
    if (g !== loaded) g.v = (loaded.v || 0) + 1;
    g.tokens = g.tokens || {};
    const seat = g.players.findIndex(p => p.uid === pid);
    if (seat >= 0 && g.tokens[pid] !== token) throw Object.assign(new Error("That seat belongs to another device."), { status: 403 });
    const fail = m => { throw Object.assign(new Error(m), { status: 400 }); };
    let next = g;

    switch (op) {
      case "join":
        if (seat < 0) {
          if (g.status !== "lobby") return { game: view(g, pid), watching: true };
          if (g.players.length >= ENG(g).MAX_PLAYERS) fail(`That table is full (${ENG(g).MAX_PLAYERS} players).`);
          g.players.push({ uid: pid, nick: cleanNick(q.nick) }); g.tokens[pid] = token;
        }
        break;
      case "nick":
        if (seat < 0) fail("You're not at this table.");
        g.players[seat].nick = cleanNick(q.nick);
        break;
      case "leave":
        if (seat < 0) break;
        if (g.status !== "lobby") fail("You can't leave a game in progress.");
        g.players.splice(seat, 1); delete g.tokens[pid];
        if (g.host === pid && g.players.length) g.host = g.players[0].uid;
        if (!g.players.length) { g.status = "closed"; await redis(["ZREM", "wd:lobbies", code]); }
        break;
      case "start":
        if (g.host !== pid || g.status !== "lobby") fail("Only the table owner can start the game.");
        if (g.players.length < 2) fail("You need at least 2 players.");
        next = Object.assign({ code, host: g.host, created: g.created, tokens: g.tokens }, ENG(g).newGame(g.players), g.kind ? { kind: g.kind } : {});
        next.players.forEach((p, i) => { const o = g.players[i]; if (o.photoV) p.photoV = o.photoV; if (o.card != null) p.card = o.card; if (o.face) p.face = o.face; if (o.back) p.back = o.back; });
        await redis(["ZREM", "wd:lobbies", code]);
        break;
      case "again":
        if (g.host !== pid || g.status !== "over") fail("Only the table owner can start a rematch.");
        next = { status: "lobby", kind: g.kind, recorded: false, code, host: g.host, created: Date.now(), tokens: g.tokens, players: g.players.map(p => Object.assign({ uid: p.uid, nick: p.nick }, p.photoV ? { photoV: p.photoV } : {}, p.card != null ? { card: p.card } : {}, p.face ? { face: p.face } : {}, p.back ? { back: p.back } : {})) };
        await redis(["ZADD", "wd:lobbies", String(next.created), code]);
        break;
      case "photo": {
        if (seat < 0) fail("You're not at this table.");
        if (q.data == null) { await redis(["DEL", photoKey(code, pid)]); delete g.players[seat].photoV; break; }
        if (!okPhoto(q.data)) fail("That photo is too large or not a JPEG.");
        await redis(["SET", photoKey(code, pid), q.data, "EX", String(TTL)]);
        g.players[seat].photoV = Date.now();
        break;
      }
      case "card": {
        if (seat < 0) fail("You're not at this table.");
        const n = q.n == null ? null : +q.n;
        if (n != null && !(Number.isInteger(n) && n >= 0 && n <= 9)) fail("Pick a number from 0 to 9.");
        const other = n == null ? -1 : g.players.findIndex((p, i) => i !== seat && p.card === n);
        if (other >= 0) fail(`${g.players[other].nick || "Another player"} already has card ${n}.`);
        if (n == null) delete g.players[seat].card; else g.players[seat].card = n;
        break;
      }
      // a player's card designs, shown to the whole table (Grand Line UNO); allowed in the lobby and during play
      case "style": {
        if (seat < 0) fail("You're not at this table.");
        if (!U.STYLES.faces.includes(q.face) || !U.STYLES.backs.includes(q.back)) fail("Unknown card design.");
        g.players[seat].face = q.face; g.players[seat].back = q.back;
        break;
      }
      case "vote": {
        // Pause or continue once more than half the table agrees. The turn clock stops while paused.
        if (seat < 0) fail("You're watching this game.");
        const kind = q.kind === "resume" ? "resume" : "pause";
        if (kind === "pause" && g.status !== "play") fail("Only a game in progress can be paused.");
        if (kind === "resume" && g.status !== "paused") fail("This game isn't paused.");
        const n = g.players.length, need = Math.floor(n / 2) + 1, now = Date.now();
        const say = m => { g.log = g.log || []; g.log.push(m); if (g.log.length > 60) g.log.splice(0, g.log.length - 60); };
        if (!g.vote || g.vote.kind !== kind || (kind === "pause" && now - g.vote.at > 10 * 60e3)) {
          if (q.yes === false) fail("There's no vote to answer.");
          g.vote = { kind, by: seat, at: now, yes: [], no: [] };
          say(kind === "pause" ? `@${seat} asked to pause the game.` : `@${seat} is back and ready to continue.`);
        }
        const v = g.vote;
        v.yes = v.yes.filter(x => x !== seat); v.no = v.no.filter(x => x !== seat);
        (q.yes === false ? v.no : v.yes).push(seat);
        if (v.yes.length >= need) {
          g.status = kind === "pause" ? "paused" : "play";
          if (kind === "pause") g.pausedAt = now; else delete g.pausedAt;
          g.vote = null;
          say(kind === "pause" ? "The table agreed: the game is paused. Every hand is saved for 30 days." : "The table is back: the game continues!");
        } else if (v.no.length > n - need) {
          g.vote = null;
          say(kind === "pause" ? "Not enough players wanted to pause, so the game goes on." : "Not enough players are back yet, so the game stays paused.");
        }
        break;
      }
      case "act": {
        if (seat < 0) fail("You're watching this game.");
        const r = ENG(g).apply(g, seat, q.action || {});
        if (r.error) fail(r.error);
        next = r.state; next.tokens = g.tokens;
        break;
      }
      default: fail("Unknown request.");
    }
    const before = next === g ? JSON.parse(JSON.stringify(g)) : g;
    ENG(next).syncClock(before, next, Date.now());
    next.v = (g.v || 0) + 1; next.updated = Date.now();
    await recordGame(next);
    await save(code, next);
    return { game: view(next, pid), now: Date.now() };
  });
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (process.env.VERCEL && !R_URL) {
    return res.status(503).json({ error: "The game database isn't connected yet. The site owner needs to add a Redis store to this Vercel project." });
  }
  try {
    const out = await handle(req);
    res.status(200).json(out);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.status ? e.message : "Something went wrong on the server. Try again." });
    if (!e.status) console.error(e);
  }
};
