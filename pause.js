/* Pause by majority: a Pause button, the live vote, and the paused screen.
   Floats over both games (Wizard's Deal and Grand Line UNO) and talks to the server's "vote" op. */
(function () {
  "use strict";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const css = document.createElement("style");
  css.textContent = `
  .pz-bar{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:15;max-width:calc(100% - 32px);
    background:#17131f;color:#f0ebf8;border:1px solid #3a3350;border-radius:12px;padding:.55rem .7rem;display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .8rem;
    box-shadow:0 14px 28px -14px rgba(0,0,0,.8);font:500 .92rem/1.35 "Alegreya Sans","Segoe UI",system-ui,sans-serif}
  .pz-bar.vote{border-color:#f2a36b}
  .pz-bar b{font-weight:800}
  .pz-btn{appearance:none;border:1px solid #3a3350;background:#2c2740;color:#f0ebf8;border-radius:8px;padding:.45rem .85rem;font:700 .88rem/1 inherit;font-family:inherit;cursor:pointer}
  .pz-btn:hover{border-color:#e0b95f}
  .pz-btn.go{background:#e0b95f;color:#1c1505;border-color:#e0b95f}
  .pz-btn:focus-visible{outline:2px solid #e0b95f;outline-offset:2px}
  .pz-muted{color:#b3aac7}
  .pz-over{position:fixed;inset:0;z-index:18;display:grid;place-items:center;padding:16px;background:rgba(10,8,16,.82);backdrop-filter:blur(3px)}
  .pz-card{width:min(32rem,100%);background:#17131f;color:#f0ebf8;border:1px solid #e0b95f;border-radius:16px;padding:1.6rem;display:flex;flex-direction:column;gap:.8rem;
    box-shadow:0 30px 60px -30px rgba(0,0,0,.9);font:400 1rem/1.5 "Alegreya Sans","Segoe UI",system-ui,sans-serif}
  .pz-card h2{margin:0;font:400 clamp(2rem,6vw,2.8rem)/1.05 "IM Fell English SC","Iowan Old Style",Georgia,serif;color:#e0b95f}
  .pz-card ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.3rem}
  .pz-card li{display:flex;justify-content:space-between;gap:.5rem;padding:.35rem .6rem;border-radius:8px;background:#221e30}
  .pz-card li.ok{background:#1f3a2c}
  .pz-card li span:last-child{color:#b3aac7;font-size:.88rem}
  .pz-card li.ok span:last-child{color:#82d6a4}
  .pz-bar[hidden],.pz-over[hidden]{display:none!important}
  @media (prefers-reduced-motion:reduce){.pz-over{backdrop-filter:none}}`;
  document.head.appendChild(css);

  const bar = document.createElement("div"); bar.className = "pz-bar"; bar.hidden = true; bar.setAttribute("aria-live", "polite");
  const over = document.createElement("div"); over.className = "pz-over"; over.hidden = true; over.setAttribute("role", "dialog"); over.setAttribute("aria-label", "Game paused");
  document.body.append(bar, over);
  let lastKey = "", busy = false;

  async function send(kind, yes) {
    if (busy || typeof window.call !== "function") return;
    busy = true;
    try { await window.call("vote", { kind, yes }); } finally { busy = false; }
  }
  function onClick(e) {
    const b = e.target.closest("[data-pz]"); if (!b) return;
    const [kind, yes] = b.dataset.pz.split(":");
    send(kind, yes === "1");
  }
  bar.addEventListener("click", onClick); over.addEventListener("click", onClick);

  window.PauseUI = {
    /** Call after every state change. */
    update(S, seat, nameOf) {
      const show = S && S.players && (S.status === "play" || S.status === "paused");
      if (!show) { bar.hidden = true; over.hidden = true; lastKey = ""; return; }
      const n = S.players.length, need = Math.floor(n / 2) + 1, vt = S.vote;
      const key = JSON.stringify([S.status, vt, seat, S.pausedAt, S.players.map(p => p.nick)]);
      if (key === lastKey) return;
      lastKey = key;

      if (S.status === "paused") {
        bar.hidden = true;
        const ready = vt && vt.kind === "resume" ? vt.yes : [];
        const when = S.pausedAt ? new Date(S.pausedAt).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
        over.innerHTML = `<div class="pz-card"><h2>Game paused</h2>
          <p class="pz-muted">Paused ${esc(when)}. Every hand, bank and table is saved for 30 days. When more than half the table is ready, play picks up exactly where it stopped, with a fresh turn clock.</p>
          <p><b>${ready.length} of ${need}</b> needed are ready.</p>
          <ul>${S.players.map((p, i) => `<li class="${ready.includes(i) ? "ok" : ""}"><span>${esc(i === seat ? "You" : nameOf(i))}</span><span>${ready.includes(i) ? "Ready" : "Not back yet"}</span></li>`).join("")}</ul>
          ${seat < 0 ? "" : ready.includes(seat) ? `<p class="pz-muted">You're ready. Waiting for the others.</p>` : `<div><button class="pz-btn go" data-pz="resume:1">I'm ready to continue</button></div>`}</div>`;
        over.hidden = false;
        return;
      }
      over.hidden = true;
      if (vt && vt.kind === "pause") {
        const voted = vt.yes.includes(seat) || vt.no.includes(seat);
        bar.className = "pz-bar vote";
        bar.innerHTML = `<span><b>${esc(vt.by === seat ? "You" : nameOf(vt.by))}</b> asked to pause · <b>${vt.yes.length} of ${need}</b> needed agree${vt.no.length ? ` · ${vt.no.length} said keep playing` : ""}</span>
          ${seat >= 0 && !voted ? `<span style="display:flex;gap:.4rem"><button class="pz-btn go" data-pz="pause:1">Yes, pause</button><button class="pz-btn" data-pz="pause:0">Keep playing</button></span>` : `<span class="pz-muted">Waiting for the others…</span>`}`;
        bar.hidden = false;
      } else if (seat >= 0) {
        bar.className = "pz-bar";
        bar.innerHTML = `<button class="pz-btn" data-pz="pause:1" title="Ask the table to pause and finish later">Pause game</button>`;
        bar.hidden = false;
      } else bar.hidden = true;
    }
  };
})();
