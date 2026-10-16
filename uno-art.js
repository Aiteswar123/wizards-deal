// Grand Line UNO: card art. Each player can put their own picture (and a name) on any number card, 0 to 9.
// Pictures are cropped to the poster's photo box, shrunk to a small JPEG and kept in this browser's storage only:
// they are never uploaded, and other players see their own cards. Numbers left empty keep the Sunwake crew.
(function () {
  "use strict";
  const KEY = "wd-art", W = 366, H = 300;   // the photo box is about 1.22 : 1
  let art = {};
  try { art = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { art = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(art)); return true; } catch (e) { return false; } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const css = `
.artbtn{display:inline-grid;place-items:center;width:2.4rem;padding:0}
.artbtn svg{width:1.15rem;height:1.15rem;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.sndfix .artbtn{display:none}
html[data-game=uno] .sndfix .artbtn{display:inline-grid}
.ucard .ph img.custom{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cart{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(3,8,14,.72);backdrop-filter:blur(3px);padding:12px}
.cart[hidden]{display:none}
.cart .box{width:min(44rem,100%);max-height:calc(100vh - 24px);overflow:auto;background:#efe0bb url(assets/parchment.jpg) center/600px;color:#2b1a10;border-radius:14px;padding:1rem 1.1rem 1.2rem;box-shadow:0 0 0 2px #6b4423,0 0 0 4px #c9952f,0 30px 60px rgba(0,0,0,.7)}
.cart header{display:flex;align-items:center;gap:.6rem;margin-bottom:.3rem}
.cart h3{font:400 1.8rem/1 "Pirata One",serif;color:#2b1a10;flex:1}
.cart .x{appearance:none;border:0;background:none;color:#5a3a20;width:2.4rem;height:2.4rem;display:grid;place-items:center;border-radius:8px}
.cart .x svg{width:1.25rem;height:1.25rem;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.cart p.lead{font:500 .9rem/1.4 var(--body);color:#5a3a20;margin-bottom:.8rem}
.cart .slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(7.4rem,1fr));gap:.8rem}
.cart .slot{display:flex;flex-direction:column;align-items:center;gap:.4rem}
.cart .slot .ucard{--w:96px;flex:none;height:calc(var(--w)*1.48)}
.cart .slot .acts{display:flex;gap:.3rem;flex-wrap:wrap;justify-content:center}
.cart button.s,.cart label.s{appearance:none;border:1px solid rgba(60,32,10,.4);background:rgba(255,255,255,.45);color:#2b1a10;border-radius:7px;padding:.4rem .55rem;font:700 .72rem/1 var(--label);letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
.cart label.s.go,.cart button.s.go{background:#2b1a10;color:#ffe9b5;border-color:#2b1a10}
.cart label.s:focus-within{outline:2px solid #2b1a10;outline-offset:2px}
.cart .crop{display:grid;gap:.7rem;justify-items:center}
.cart .crop canvas{width:min(100%,26rem);aspect-ratio:${W}/${H};border:3px solid #24170e;border-radius:4px;background:#222;touch-action:none;cursor:grab}
.cart .crop canvas:active{cursor:grabbing}
.cart .crop .row{display:flex;gap:.6rem;align-items:center;width:min(100%,26rem);flex-wrap:wrap}
.cart .crop input[type=range]{flex:1;accent-color:#6b4423}
.cart .crop input[type=text]{flex:1;min-width:10rem;padding:.55rem .6rem;border-radius:8px;border:1px solid rgba(60,32,10,.45);background:rgba(255,255,255,.6);color:#2b1a10;font:600 .95rem var(--body)}
.cart .crop .hint{font:500 .8rem/1.3 var(--body);color:#6b4a2a}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const ICON_ART = '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 18c1.4-2.6 3-3.6 5-3.6s3.6 1 5 3.6"/>';
  const ICON_X = '<path d="M6 6l12 12M18 6L6 18"/>';
  const dlg = document.createElement("div"); dlg.className = "cart"; dlg.hidden = true; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-label", "Card art");
  document.body.appendChild(dlg);
  const C = { n: null, img: null, scale: 1, min: 1, x: 0, y: 0, name: "" };

  function refresh() { if (typeof render === "function") render(); }
  function slotsHTML() {
    const U = window.Uno, cols = "rygbrygbry";
    return `<header><h3>Card art</h3><button class="x" data-c="close" aria-label="Close">${'<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON_X + "</svg>"}</button></header>
      <p class="lead">Put your own picture on any number card. Pictures stay in this browser on this device, are never uploaded, and only you see them. Every player sets up their own. Numbers left empty keep the Sunwake crew.</p>
      <div class="slots">${Array.from({ length: 10 }, (_, n) => {
        const id = U.CARDS.find(k => k.c === cols[n] && k.v === String(n)).id;
        return `<div class="slot">${UnoUI.cardHTML(id)}<div class="acts"><label class="s go">${art[n] ? "Change" : "Choose picture"}<input type="file" accept="image/*" data-n="${n}" hidden></label>${art[n] ? `<button class="s" data-c="rename" data-n="${n}">Rename</button><button class="s" data-c="remove" data-n="${n}">Remove</button>` : ""}</div></div>`;
      }).join("")}</div>`;
  }
  function cropHTML() {
    return `<header><h3>Fit the picture · ${C.n}</h3><button class="x" data-c="back" aria-label="Back to all cards">${'<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON_X + "</svg>"}</button></header>
      <div class="crop"><canvas width="${W}" height="${H}" aria-label="Drag to move the picture"></canvas>
        <div class="row"><span class="hint">Zoom</span><input type="range" min="1" max="4" step=".01" value="${(C.scale / C.min).toFixed(2)}" aria-label="Zoom"></div>
        <div class="row"><input type="text" maxlength="22" placeholder="Name on the poster" value="${esc(C.name)}" aria-label="Name on the poster"></div>
        <p class="hint">Drag the picture to place it. The poster shows exactly what is in the frame.</p>
        <div class="row" style="justify-content:flex-end"><button class="s" data-c="back">Cancel</button><button class="s go" data-c="save">Save to card ${C.n}</button></div></div>`;
  }
  function show(html) { dlg.querySelector(".box") ? (dlg.querySelector(".box").innerHTML = html) : (dlg.innerHTML = `<div class="box">${html}</div>`); }
  function open() { dlg.hidden = false; show(slotsHTML()); }
  function close() { dlg.hidden = true; refresh(); }

  // the crop editor: the picture covers the frame; drag to pan, slide to zoom
  function drawCrop() {
    const cv = dlg.querySelector(".crop canvas"); if (!cv || !C.img) return;
    const g = cv.getContext("2d"), iw = C.img.width * C.scale, ih = C.img.height * C.scale;
    C.x = Math.min(0, Math.max(W - iw, C.x)); C.y = Math.min(0, Math.max(H - ih, C.y));
    g.fillStyle = "#222"; g.fillRect(0, 0, W, H); g.drawImage(C.img, C.x, C.y, iw, ih);
  }
  function startCrop(n, file) {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      C.n = n; C.img = img; C.min = Math.max(W / img.width, H / img.height); C.scale = C.min;
      C.x = (W - img.width * C.scale) / 2; C.y = (H - img.height * C.scale) / 2;
      C.name = art[n] && art[n].name || "";
      show(cropHTML()); drawCrop(); wireCanvas();
    };
    img.onerror = () => { URL.revokeObjectURL(url); alert("That file couldn't be opened as a picture."); };
    img.src = url;
  }
  function wireCanvas() {
    const cv = dlg.querySelector(".crop canvas"); let drag = null;
    const k = () => W / cv.getBoundingClientRect().width;
    cv.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, cx: C.x, cy: C.y }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", e => { if (!drag) return; C.x = drag.cx + (e.clientX - drag.x) * k(); C.y = drag.cy + (e.clientY - drag.y) * k(); drawCrop(); });
    cv.addEventListener("pointerup", () => { drag = null; });
    cv.addEventListener("wheel", e => { e.preventDefault(); zoomTo(C.scale / C.min * (e.deltaY < 0 ? 1.08 : 1 / 1.08)); const r = dlg.querySelector(".crop input[type=range]"); if (r) r.value = (C.scale / C.min).toFixed(2); }, { passive: false });
  }
  function zoomTo(z) {
    z = Math.max(1, Math.min(4, z));
    const cx = W / 2, cy = H / 2, ox = (cx - C.x) / C.scale, oy = (cy - C.y) / C.scale;   // keep the frame's centre fixed
    C.scale = C.min * z; C.x = cx - ox * C.scale; C.y = cy - oy * C.scale; drawCrop();
  }
  function commit() {
    const out = document.createElement("canvas"); out.width = W; out.height = H;
    out.getContext("2d").drawImage(C.img, C.x, C.y, C.img.width * C.scale, C.img.height * C.scale);
    const name = (dlg.querySelector(".crop input[type=text]") || {}).value || "";
    art[C.n] = { src: out.toDataURL("image/jpeg", .84), name: name.trim().slice(0, 22) };
    if (!save()) alert("This browser couldn't store the picture (storage is full or blocked). It will show until you reload.");
    C.img = null; show(slotsHTML()); refresh();
  }

  dlg.addEventListener("change", e => { const f = e.target; if (f.type === "file" && f.files[0]) startCrop(+f.dataset.n, f.files[0]); });
  dlg.addEventListener("input", e => { if (e.target.type === "range") zoomTo(+e.target.value); });
  dlg.addEventListener("click", e => {
    if (e.target === dlg) return close();
    const b = e.target.closest("[data-c]"); if (!b) return;
    const n = +b.dataset.n;
    switch (b.dataset.c) {
      case "close": return close();
      case "back": C.img = null; return show(slotsHTML());
      case "save": return commit();
      case "remove": delete art[n]; save(); show(slotsHTML()); return refresh();
      case "rename": { const v = prompt("Name on the poster for card " + n, art[n].name || ""); if (v != null) { art[n].name = v.trim().slice(0, 22); save(); show(slotsHTML()); refresh(); } return; }
    }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !dlg.hidden) close(); });
  document.addEventListener("click", e => { if (e.target.closest("[data-cardart]")) open(); });

  window.UnoArt = {
    get: n => art[n] || null,
    button: () => `<button class="btn ghost small artbtn" data-cardart aria-label="Card art: put your own pictures on the number cards" title="Card art"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON_ART}</svg></button>`
  };
})();
