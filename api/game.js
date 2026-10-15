// Wizard's Deal game server: one Vercel function that stores each table in Redis
// and runs every move through the shared rules engine.
require("../engine.js");
const E = globalThis.Engine;

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

const TTL = 60 * 60 * 48;
const key = code => "wd:game:" + code;
const load = async code => { const v = await redis(["GET", key(code)]); return v ? JSON.parse(v) : null; };
const save = (code, g) => redis(["SET", key(code), JSON.stringify(g), "EX", String(TTL)]);

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
  return out;
}
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const cleanNick = n => String(n || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 20);
const okId = s => typeof s === "string" && /^[a-z0-9]{8,40}$/i.test(s);

async function lobbies() {
  const codes = await redis(["ZRANGEBYSCORE", "wd:lobbies", String(Date.now() - 6 * 3600e3), "+inf"]);
  if (!codes || !codes.length) return [];
  const docs = await redis(["MGET", ...codes.slice(0, 30).map(key)]);
  return docs.map(d => d && JSON.parse(d)).filter(g => g && g.status === "lobby" && g.players.length < E.MAX_PLAYERS)
    .map(g => ({ code: g.code, host: (g.players.find(p => p.uid === g.host) || {}).nick || "A wizard", count: g.players.length }));
}

// Applies anything the turn clock says has run out (a turn ending, an unanswered spell) and saves it.
// Every device polls about once a second, so time runs out on schedule even if nobody acts.
async function settleClock(code, g) {
  if (!g || !E.expire(g, Date.now())) return g;
  return withLock(code, async () => {
    const cur = await load(code);
    const next = cur && E.expire(cur, Date.now());
    if (!next) return cur;
    next.tokens = cur.tokens; next.v = (cur.v || 0) + 1; next.updated = Date.now();
    await save(code, next);
    return next;
  });
}

async function handle(req) {
  const q = req.method === "GET" ? req.query : (req.body || {});
  if (req.method === "GET") {
    if (q.list) return { lobbies: await lobbies() };
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
    const g = { status: "lobby", code, host: pid, created: Date.now(), v: 1, players: [{ uid: pid, nick: cleanNick(q.nick) }], tokens: { [pid]: token } };
    await save(code, g);
    await redis(["ZADD", "wd:lobbies", String(g.created), code]);
    return { game: view(g, pid) };
  }

  const code = String(q.code || "").toUpperCase();
  if (!/^[A-Z]{4}$/.test(code)) throw Object.assign(new Error("Enter the 4-letter game code."), { status: 400 });

  return withLock(code, async () => {
    const loaded = await load(code);
    if (!loaded) throw Object.assign(new Error(`No game with code ${code}.`), { status: 404 });
    const g = E.expire(loaded, Date.now()) || loaded;   // anything overdue happens before this move
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
          if (g.players.length >= E.MAX_PLAYERS) fail(`That table is full (${E.MAX_PLAYERS} players).`);
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
        next = Object.assign({ code, host: g.host, created: g.created, tokens: g.tokens }, E.newGame(g.players));
        await redis(["ZREM", "wd:lobbies", code]);
        break;
      case "again":
        if (g.host !== pid || g.status !== "over") fail("Only the table owner can start a rematch.");
        next = { status: "lobby", code, host: g.host, created: Date.now(), tokens: g.tokens, players: g.players.map(p => ({ uid: p.uid, nick: p.nick })) };
        await redis(["ZADD", "wd:lobbies", String(next.created), code]);
        break;
      case "act": {
        if (seat < 0) fail("You're watching this game.");
        const r = E.apply(g, seat, q.action || {});
        if (r.error) fail(r.error);
        next = r.state; next.tokens = g.tokens;
        break;
      }
      default: fail("Unknown request.");
    }
    const before = next === g ? JSON.parse(JSON.stringify(g)) : g;
    E.syncClock(before, next, Date.now());
    next.v = (g.v || 0) + 1; next.updated = Date.now();
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
