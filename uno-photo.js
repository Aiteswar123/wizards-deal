// Grand Line UNO: crew photos. Each player can add their own photo (a selfie, or a picture they drew) at a table.
// Everyone at that table sees it: on the player's seat, on the number card they claim (one player per number) and on
// the WANTED poster if they win. The photo is cropped square and shrunk to a small JPEG on the device, sent to the
// table, and kept with it for two days. It is also remembered on this device and added to every UNO table you join.
(function () {
  "use strict";
  const LSK = "wd-photo", SIZE = 240;
  const lsGet = () => { try { return localStorage.getItem(LSK); } catch (e) { return null; } };
  const lsSet = v => { try { v ? localStorage.setItem(LSK, v) : localStorage.removeItem(LSK); } catch (e) {} };
  const cache = new Map(), pending = new Set(), tried = new Set();
  const css = `
.photobtn{display:inline-grid;place-items:center;width:2.4rem;padding:0}
.photobtn svg{width:1.15rem;height:1.15rem;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.useat .flag img.pface{width:100%;height:100%;border-radius:50%;object-fit:cover}
.uwin .poster .wface{width:7.5rem;height:6.2rem;margin:.5rem auto .2rem;border:3px solid #24170e;object-fit:cover;display:block;filter:sepia(.25) contrast(1.05)}
.lobbyphoto{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;padding:.8rem 1rem;border:1px dashed var(--line-2);border-radius:10px}
.lobbyphoto .face{width:4.2rem;height:4.2rem;border-radius:50%;object-fit:cover;background:var(--stand-3);display:grid;place-items:center;flex:none;box-shadow:0 0 0 3px var(--crest)}
.lobbyphoto p{flex:1;min-width:12rem;font-size:.92rem;color:var(--muted)}
.lobbyphoto p b{color:var(--chalk)}
.cphoto{position:fixed;inset:0;z-index:61;display:grid;place-items:center;background:rgba(3,8,14,.72);backdrop-filter:blur(3px);padding:12px}
.cphoto[hidden]{display:none}
.cphoto .box{width:min(30rem,100%);max-height:calc(100vh - 24px);overflow:auto;background:#efe0bb url(assets/parchment.jpg) center/600px;color:#2b1a10;border-radius:14px;padding:1rem 1.1rem 1.2rem;box-shadow:0 0 0 2px #6b4423,0 0 0 4px #c9952f,0 30px 60px rgba(0,0,0,.7)}
.cphoto header{display:flex;align-items:center;margin-bottom:.4rem}
.cphoto h3{font:400 1.8rem/1 "Pirata One",serif;color:#2b1a10;flex:1}
.cphoto .x{appearance:none;border:0;background:none;color:#5a3a20;width:2.4rem;height:2.4rem;display:grid;place-items:center;border-radius:8px}
.cphoto .x svg{width:1.25rem;height:1.25rem;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.cphoto p{font:500 .9rem/1.4 var(--body);color:#5a3a20;margin:.2rem 0 .8rem}
.cphoto .me{display:flex;align-items:center;gap:1rem;margin-bottom:.9rem}
.cphoto .me .face{width:5.5rem;height:5.5rem;border-radius:50%;object-fit:cover;border:3px solid #24170e;background:#d9c49a;flex:none}
.cphoto .me .acts{display:flex;gap:.4rem;flex-wrap:wrap}
.cphoto .s{appearance:none;border:1px solid rgba(60,32,10,.4);background:rgba(255,255,255,.45);color:#2b1a10;border-radius:7px;padding:.5rem .7rem;font:700 .75rem/1 var(--label);letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
.cphoto .s.go{background:#2b1a10;color:#ffe9b5;border-color:#2b1a10}
.cphoto label.s:focus-within{outline:2px solid #2b1a10;outline-offset:2px}
.cphoto h4{font:700 .85rem/1 var(--label);letter-spacing:.08em;text-transform:uppercase;margin:.4rem 0 .5rem;color:#4a2e18}
.cphoto .nums{display:grid;grid-template-columns:repeat(5,1fr);gap:.4rem}
.cphoto .nums button{appearance:none;min-height:3.2rem;border-radius:8px;border:1px solid rgba(60,32,10,.4);background:rgba(255,255,255,.45);color:#2b1a10;font:400 1.3rem/1 "Alfa Slab One",serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15rem}
.cphoto .nums button small{font:600 .62rem/1 var(--label);letter-spacing:.03em;max-width:95%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cphoto .nums button[aria-pressed=true]{background:#2b1a10;color:#ffe9b5;border-color:#2b1a10}
.cphoto .nums button:disabled{opacity:.45}
.cphoto canvas{width:min(100%,16rem);aspect-ratio:1;border-radius:50%;border:3px solid #24170e;background:#222;touch-action:none;cursor:grab;display:block;margin:0 auto}
.cphoto .row{display:flex;gap:.6rem;align-items:center;margin:.7rem 0;flex-wrap:wrap}
.cphoto .row input[type=range]{flex:1;accent-color:#6b4423}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const ICON = '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.6"/>';
  const X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const dlg = document.createElement("div"); dlg.className = "cphoto"; dlg.hidden = true; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-label", "Crew photo");
  document.body.appendChild(dlg);
  // S (the table) is a script-level variable in index.html, not a window property
  const table = () => typeof S !== "undefined" ? S : null;
  const T = () => { const s = table(); return s && s.kind === "uno" && s.players ? s : null; };
  const seat = () => { const s = T(); return s ? s.players.findIndex(p => p.uid === me) : -1; };
  const rerender = () => { if (typeof render === "function" && table()) render(); if (!dlg.hidden && !C.cropping) draw(); };

  // fetch every player's photo once per version
  function sync() {
    const s = T(); if (!s) return;
    s.players.forEach(p => {
      if (!p.photoV) { cache.delete(p.uid); return; }
      const c = cache.get(p.uid), k = p.uid + ":" + p.photoV;
      if ((c && c.v === p.photoV) || pending.has(k)) return;
      pending.add(k);
      fetch(`/api/game?photo=1&code=${encodeURIComponent(s.code)}&uid=${encodeURIComponent(p.uid)}&v=${p.photoV}`).then(r => r.json())
        .then(j => { if (j.photo) { cache.set(p.uid, { v: p.photoV, src: j.photo }); rerender(); } }).catch(() => {}).finally(() => pending.delete(k));
    });
    // bring this device's photo to a table it joins
    const i = seat(), mine = lsGet();
    if (i >= 0 && mine && !s.players[i].photoV && !tried.has(s.code)) { tried.add(s.code); call("photo", { data: mine }); }
  }
  const src = i => { const s = T(), p = s && s.players[i]; if (!p || !p.photoV) return null; const c = cache.get(p.uid); return c && c.v === p.photoV ? c.src : null; };
  function forCard(n) { const s = T(); if (!s) return null; const i = s.players.findIndex(p => p.card === n); const f = i >= 0 ? src(i) : null; return f ? { src: f, name: s.players[i].nick || "Pirate" } : null; }

  // ---- the dialog: your photo and your card ----
  const C = { img: null, scale: 1, min: 1, x: 0, y: 0, cropping: false };
  function draw() {
    const s = T(), i = seat(), p = s && i >= 0 ? s.players[i] : null, face = (i >= 0 && src(i)) || lsGet();
    let html = `<header><h3>${C.cropping ? "Fit your photo" : "Crew photo"}</h3><button class="x" data-p="close" aria-label="Close">${X}</button></header>`;
    if (C.cropping) {
      html += `<canvas width="${SIZE}" height="${SIZE}" aria-label="Drag to move your photo"></canvas>
        <div class="row"><span>Zoom</span><input type="range" min="1" max="4" step=".01" value="${(C.scale / C.min).toFixed(2)}" aria-label="Zoom"></div>
        <div class="row" style="justify-content:flex-end"><button class="s" data-p="cancel">Cancel</button><button class="s go" data-p="save">Use this photo</button></div>`;
    } else {
      html += `<p>Use a selfie or something you drew. Everyone at this table sees it on your seat, on the number card you claim, and on the WANTED poster if you win.</p>
        <div class="me">${face ? `<img class="face" src="${face}" alt="Your crew photo">` : `<span class="face" aria-hidden="true"></span>`}
          <div class="acts"><label class="s go">${face ? "Change photo" : "Choose photo"}<input type="file" accept="image/*" hidden></label>${face ? `<button class="s" data-p="remove">Remove</button>` : ""}</div></div>
        ${s && p ? `<h4>Your number card</h4><div class="nums">${Array.from({ length: 10 }, (_, n) => { const o = s.players.findIndex((q, k) => k !== i && q.card === n);
          return `<button data-p="card" data-n="${n}" aria-pressed="${p.card === n}" ${o >= 0 ? "disabled" : ""}>${n}<small>${o >= 0 ? esc(s.players[o].nick || "taken") : p.card === n ? "yours" : "free"}</small></button>`; }).join("")}</div>
          ${p.card != null ? `<div class="row"><button class="s" data-p="card" data-n="">Give back card ${p.card}</button></div>` : ""}`
          : `<p>Join an UNO table to claim a number card.</p>`}`;
    }
    dlg.innerHTML = `<div class="box">${html}</div>`;
    if (C.cropping) { drawCrop(); wire(); }
  }
  function drawCrop() {
    const cv = dlg.querySelector("canvas"); if (!cv || !C.img) return;
    const g = cv.getContext("2d"), w = C.img.width * C.scale, h = C.img.height * C.scale;
    C.x = Math.min(0, Math.max(SIZE - w, C.x)); C.y = Math.min(0, Math.max(SIZE - h, C.y));
    g.fillStyle = "#222"; g.fillRect(0, 0, SIZE, SIZE); g.drawImage(C.img, C.x, C.y, w, h);
  }
  function wire() {
    const cv = dlg.querySelector("canvas"); let d = null; const k = () => SIZE / cv.getBoundingClientRect().width;
    cv.addEventListener("pointerdown", e => { d = { x: e.clientX, y: e.clientY, cx: C.x, cy: C.y }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", e => { if (!d) return; C.x = d.cx + (e.clientX - d.x) * k(); C.y = d.cy + (e.clientY - d.y) * k(); drawCrop(); });
    cv.addEventListener("pointerup", () => { d = null; });
  }
  function zoom(z) { const c = SIZE / 2, ox = (c - C.x) / C.scale, oy = (c - C.y) / C.scale; C.scale = C.min * Math.max(1, Math.min(4, z)); C.x = c - ox * C.scale; C.y = c - oy * C.scale; drawCrop(); }
  function load(file) {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); C.img = img; C.min = Math.max(SIZE / img.width, SIZE / img.height); C.scale = C.min; C.x = (SIZE - img.width * C.scale) / 2; C.y = (SIZE - img.height * C.scale) / 2; C.cropping = true; draw(); };
    img.onerror = () => { URL.revokeObjectURL(url); flash("That file couldn't be opened as a picture."); };
    img.src = url;
  }
  async function commit() {
    const out = document.createElement("canvas"); out.width = SIZE; out.height = SIZE;
    out.getContext("2d").drawImage(C.img, C.x, C.y, C.img.width * C.scale, C.img.height * C.scale);
    let q = .85, data = out.toDataURL("image/jpeg", q);
    while (data.length > 85000 && q > .4) { q -= .1; data = out.toDataURL("image/jpeg", q); }
    lsSet(data); C.cropping = false; C.img = null;
    if (T() && seat() >= 0) await call("photo", { data });
    draw(); rerender();
  }
  dlg.addEventListener("change", e => { if (e.target.type === "file" && e.target.files[0]) load(e.target.files[0]); });
  dlg.addEventListener("input", e => { if (e.target.type === "range") zoom(+e.target.value); });
  dlg.addEventListener("click", async e => {
    if (e.target === dlg) { dlg.hidden = true; return; }
    const b = e.target.closest("[data-p]"); if (!b) return;
    switch (b.dataset.p) {
      case "close": dlg.hidden = true; return;
      case "cancel": C.cropping = false; C.img = null; return draw();
      case "save": return commit();
      case "remove": lsSet(null); if (T() && seat() >= 0) await call("photo", { data: null }); return draw();
      case "card": await call("card", { n: b.dataset.n === "" ? null : +b.dataset.n }); return draw();
    }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !dlg.hidden) dlg.hidden = true; });
  document.addEventListener("click", e => { if (e.target.closest("[data-crewphoto]")) { dlg.hidden = false; C.cropping = false; draw(); } });

  window.UnoPhoto = {
    sync, src, forCard,
    button: () => `<button class="btn ghost small photobtn" data-crewphoto aria-label="Crew photo: add your photo for this table" title="Crew photo"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON}</svg></button>`,
    lobbyHTML() {
      const i = seat(), face = (i >= 0 && src(i)) || lsGet(), p = T() && i >= 0 ? S.players[i] : null;
      return `<div class="lobbyphoto">${face ? `<img class="face" src="${face}" alt="">` : `<span class="face" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">${ICON}</svg></span>`}
        <p><b>Your crew photo.</b> ${face ? `Everyone here sees it on your seat${p && p.card != null ? ` and on card ${p.card}` : ", and on a number card once you claim one"}.` : "Add a selfie or a drawing; everyone at the table sees it on your seat, your number card and the WANTED poster."}</p>
        <button class="btn small" data-crewphoto>${face ? "Photo and card" : "Add your photo"}</button></div>`;
    }
  };
})();
