// Local dev server: serves the static files and the /api/game function with an in-memory store.
const http = require("http"), fs = require("fs"), path = require("path");
const handler = require("./api/game.js");
const PORT = process.env.PORT || 8766;
http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname === "/api/game") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
      req.query = Object.fromEntries(u.searchParams);
      try { req.body = body ? JSON.parse(body) : {}; } catch { req.body = {}; }
      res.status = c => { res.statusCode = c; return res; };
      res.json = o => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); };
      handler(req, res);
    });
    return;
  }
  const f = path.join(__dirname, u.pathname === "/" ? "index.html" : u.pathname);
  fs.readFile(f, (e, d) => {
    if (e) { res.statusCode = 404; return res.end("Not found"); }
    const types = { ".js": "text/javascript", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".md": "text/plain; charset=utf-8" };
    res.setHeader("Content-Type", types[path.extname(f)] || "text/html; charset=utf-8");
    res.end(d);
  });
}).listen(PORT, () => console.log("Wizard's Deal on http://localhost:" + PORT));
