// The ship's radio (Grand Line UNO): two ways to play music other than the game's own.
// 1. Your songs: audio files picked from this device. They play only in this browser and are never uploaded.
// 2. Official soundtrack: Spotify's own embedded player, loaded only when asked for, streaming official releases.
// While either is playing, the game's generated music holds (Sfx.hold) and resumes afterwards.
(function () {
  "use strict";
  const ICON = {
    radio: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8l9-5"/><circle cx="8.5" cy="14" r="2.6"/><path d="M14 12h4M14 15h4M14 18h2"/>',
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>', pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>',
    prev: '<path d="M6 5v14"/><path d="M19 5L9 12l10 7z" fill="currentColor"/>', next: '<path d="M18 5v14"/><path d="M5 5l10 7-10 7z" fill="currentColor"/>',
    shuffle: '<path d="M3 7h4c4 0 6 10 10 10h4M3 17h4c1.6 0 2.8-1.6 4-3.6M13 9.6C14.2 8.4 15.4 7 17 7h4"/><path d="M18 4l3 3-3 3M18 14l3 3-3 3"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>', folder: '<path d="M3 7h6l2 2h10v10H3z"/>'
  };
  const ico = (k, cls = "") => `<svg class="ri ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
  // official releases on Spotify, embedded with Spotify's own player
  const SOURCES = [
    { id: "album/1jmR8jrRGykXMhptwhyUY0", n: "ONE PIECE Original Soundtrack \"GEAR5\" (Kohei Tanaka)" },
    { id: "playlist/37i9dQZF1DX9XrA0OT5b6M", n: "ONE PIECE (Spotify playlist)" }
  ];
  const css = `
.radiobtn{display:inline-grid;place-items:center;width:2.4rem;padding:0}
.radiobtn svg{width:1.15rem;height:1.15rem;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.radiobtn[aria-pressed=true]{border-color:var(--crest);color:var(--crest)}
.radiobtn.live{color:var(--live);border-color:var(--live)}
.sndfix .radiobtn{display:none}
html[data-game=uno] .sndfix .radiobtn{display:inline-grid}
.radio{position:fixed;z-index:58;right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));width:min(26rem,calc(100vw - 24px));max-height:min(36rem,calc(100vh - 24px));
  display:flex;flex-direction:column;background:#efe0bb url(assets/parchment.jpg) center/600px;color:#2b1a10;border-radius:14px;box-shadow:0 0 0 2px #6b4423,0 0 0 4px #c9952f,0 30px 60px rgba(0,0,0,.7);overflow:hidden}
.radio[hidden]{display:none}
.radio header{display:flex;align-items:center;gap:.6rem;padding:.8rem .9rem .5rem}
.radio h3{font:400 1.6rem/1 "Pirata One",serif;color:#2b1a10;flex:1}
.radio .rx{appearance:none;border:0;background:none;color:#5a3a20;width:2.4rem;height:2.4rem;display:grid;place-items:center;border-radius:8px}
.radio .rx:hover{background:rgba(90,58,32,.12)}
.radio .ri{width:1.25rem;height:1.25rem;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.radio .tabs{display:flex;gap:.4rem;padding:0 .9rem .6rem}
.radio .tabs button{flex:1;appearance:none;border:1px solid rgba(60,32,10,.35);background:rgba(255,255,255,.35);color:#4a2e18;border-radius:8px;padding:.5rem;font:700 .82rem/1.1 var(--label);letter-spacing:.05em;text-transform:uppercase}
.radio .tabs button[aria-selected=true]{background:#2b1a10;color:#ffe9b5;border-color:#2b1a10}
.radio .pane{padding:0 .9rem .9rem;overflow:auto}
.radio .pane[hidden]{display:none}
.radio .pick{display:flex;align-items:center;justify-content:center;gap:.5rem;min-height:2.8rem;border-radius:8px;background:#2b1a10;color:#ffe9b5;font:700 .9rem/1 var(--label);letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.radio .pick:focus-within{outline:2px solid #2b1a10;outline-offset:3px}
.radio .now{margin:.8rem 0 .5rem;font:400 1.15rem/1.2 "Pirata One",serif;min-height:1.4rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.radio .now small{display:block;font:500 .78rem/1.3 var(--body);color:#6b4a2a}
.radio .ctl{display:flex;align-items:center;gap:.4rem}
.radio .ctl button{appearance:none;border:1px solid rgba(60,32,10,.35);background:rgba(255,255,255,.4);color:#2b1a10;width:2.8rem;height:2.8rem;border-radius:50%;display:grid;place-items:center}
.radio .ctl button.big{width:3.3rem;height:3.3rem;background:#2b1a10;color:#ffe9b5;border-color:#2b1a10}
.radio .ctl button[aria-pressed=true]{background:#c9952f;border-color:#6b4423}
.radio .ctl button:disabled{opacity:.4}
.radio .ctl input[type=range]{flex:1;accent-color:#6b4423;min-width:4rem}
.radio ol{list-style:none;margin:.7rem 0 0;padding:0;max-height:11rem;overflow:auto;border-top:1px dashed rgba(60,32,10,.35)}
.radio li button{width:100%;text-align:left;appearance:none;border:0;background:none;color:#2b1a10;padding:.45rem .2rem;font:500 .9rem/1.25 var(--body);border-bottom:1px dashed rgba(60,32,10,.2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.radio li button[aria-current=true]{font-weight:700;color:#8a1d12}
.radio .note{margin-top:.6rem;font:500 .78rem/1.35 var(--body);color:#6b4a2a}
.radio select{width:100%;margin:.2rem 0 .6rem;padding:.5rem;border-radius:8px;border:1px solid rgba(60,32,10,.4);background:rgba(255,255,255,.55);color:#2b1a10;font:500 .9rem var(--body)}
.radio .embed{border-radius:12px;overflow:hidden;background:#121212;min-height:0}
.radio .embed iframe{display:block;width:100%;height:352px;border:0}
.radio .row2{display:flex;gap:.5rem;flex-wrap:wrap}
.radio .row2 button{appearance:none;flex:1;min-height:2.6rem;border-radius:8px;border:1px solid rgba(60,32,10,.4);background:rgba(255,255,255,.4);color:#2b1a10;font:700 .82rem/1 var(--label);letter-spacing:.05em;text-transform:uppercase}
.radio .row2 button.go{background:#1db954;border-color:#128a3c;color:#06210f}
@media (max-width:480px){.radio .embed iframe{height:232px}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const audio = new Audio(); audio.preload = "auto";
  const R = { tracks: [], i: -1, shuffle: false, tab: "own", embed: false };
  const panel = document.createElement("div");
  panel.className = "radio"; panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Ship's radio");
  document.body.appendChild(panel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const title = f => f.name.replace(/\.[a-z0-9]+$/i, "").replace(/[_]+/g, " ");
  const playing = () => !audio.paused && !audio.ended;
  const busy = () => playing() || R.embed;
  function hold() { if (window.Sfx && Sfx.hold) Sfx.hold(busy()); syncButtons(); }

  function draw() {
    const t = R.tracks[R.i];
    panel.innerHTML = `<header><h3>Ship's Radio</h3><button class="rx" data-r="close" aria-label="Close the radio">${ico("close")}</button></header>
      <div class="tabs" role="tablist"><button role="tab" data-r="tab" data-t="own" aria-selected="${R.tab === "own"}">Your songs</button><button role="tab" data-r="tab" data-t="official" aria-selected="${R.tab === "official"}">Official soundtrack</button></div>
      <div class="pane" ${R.tab === "own" ? "" : "hidden"}>
        <label class="pick">${ico("folder")}<span>${R.tracks.length ? "Add more songs" : "Choose songs from this device"}</span><input type="file" accept="audio/*" multiple hidden></label>
        <p class="now">${t ? esc(title(t)) : "Nothing playing"}<small>${R.tracks.length ? `Song ${R.i + 1} of ${R.tracks.length}` : "Pick songs you have on your phone or computer."}</small></p>
        <div class="ctl"><button data-r="prev" aria-label="Previous song" ${R.tracks.length ? "" : "disabled"}>${ico("prev")}</button>
          <button class="big" data-r="play" aria-label="${playing() ? "Pause" : "Play"}" ${R.tracks.length ? "" : "disabled"}>${ico(playing() ? "pause" : "play")}</button>
          <button data-r="next" aria-label="Next song" ${R.tracks.length ? "" : "disabled"}>${ico("next")}</button>
          <button data-r="shuffle" aria-label="Shuffle" aria-pressed="${R.shuffle}">${ico("shuffle")}</button>
          <input type="range" min="0" max="1" step=".01" value="${audio.volume}" aria-label="Volume"></div>
        ${R.tracks.length ? `<ol>${R.tracks.map((f, k) => `<li><button data-r="song" data-k="${k}" aria-current="${k === R.i}">${k + 1}. ${esc(title(f))}</button></li>`).join("")}</ol>` : ""}
        <p class="note">Your songs play only in this browser and are never uploaded. They stay until you close or reload the page.</p></div>
      <div class="pane" ${R.tab === "official" ? "" : "hidden"}>
        <select aria-label="What to play">${SOURCES.map((s, k) => `<option value="${k}" ${k === (R.src || 0) ? "selected" : ""}>${esc(s.n)}</option>`).join("")}</select>
        ${R.embed ? `<div class="embed"><iframe title="Spotify player" src="https://open.spotify.com/embed/${SOURCES[R.src || 0].id}?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>
          <div class="row2" style="margin-top:.6rem"><button data-r="stopembed">Close the player</button></div>`
          : `<div class="row2"><button class="go" data-r="embed">Open Spotify player</button></div>`}
        <p class="note">Streams the official soundtrack from Spotify. Full songs play when you're signed in to Spotify in this browser; otherwise Spotify plays 30-second previews. The player loads only when you open it.</p></div>`;
  }
  function syncButtons() { document.querySelectorAll(".radiobtn").forEach(b => { b.classList.toggle("live", busy()); b.setAttribute("aria-pressed", String(!panel.hidden)); }); }
  function playAt(k) {
    if (!R.tracks.length) return;
    R.i = (k + R.tracks.length) % R.tracks.length;
    if (audio.src) URL.revokeObjectURL(audio.src);
    audio.src = URL.createObjectURL(R.tracks[R.i]);
    audio.play().catch(() => {}); draw();
  }
  const nextIndex = () => R.shuffle && R.tracks.length > 1 ? (R.i + 1 + Math.floor(Math.random() * (R.tracks.length - 1))) % R.tracks.length : R.i + 1;
  audio.addEventListener("ended", () => { if (R.shuffle || R.i < R.tracks.length - 1) playAt(nextIndex()); else { draw(); hold(); } });
  audio.addEventListener("play", () => { hold(); draw(); });
  audio.addEventListener("pause", () => { hold(); draw(); });

  panel.addEventListener("change", e => {
    if (e.target.type === "file") { const add = [...e.target.files].filter(f => f.type.startsWith("audio/") || /\.(mp3|m4a|aac|ogg|oga|wav|flac|opus|webm)$/i.test(f.name)); const was = R.tracks.length; R.tracks.push(...add); if (add.length && R.i < 0) playAt(was); else draw(); }
    if (e.target.tagName === "SELECT") { R.src = +e.target.value; draw(); }
  });
  panel.addEventListener("input", e => { if (e.target.type === "range") audio.volume = +e.target.value; });
  panel.addEventListener("click", e => {
    const b = e.target.closest("[data-r]"); if (!b) return;
    switch (b.dataset.r) {
      case "close": panel.hidden = true; return syncButtons();
      case "tab": R.tab = b.dataset.t; return draw();
      case "play": if (playing()) audio.pause(); else if (R.i < 0) playAt(0); else audio.play().catch(() => {}); return;
      case "prev": return playAt(audio.currentTime > 3 ? R.i : R.i - 1);
      case "next": return playAt(nextIndex());
      case "shuffle": R.shuffle = !R.shuffle; return draw();
      case "song": return playAt(+b.dataset.k);
      case "embed": if (playing()) audio.pause(); R.embed = true; draw(); return hold();
      case "stopembed": R.embed = false; draw(); return hold();
    }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { panel.hidden = true; syncButtons(); } });
  document.addEventListener("click", e => {
    if (!e.target.closest("[data-radio]")) return;
    panel.hidden = !panel.hidden; if (!panel.hidden) draw(); syncButtons();
  });

  window.Radio = {
    button: () => `<button class="btn ghost small radiobtn${busy() ? " live" : ""}" data-radio aria-pressed="${!panel.hidden}" aria-label="Ship's radio: play your own songs or the official soundtrack" title="Ship's radio">${ico("radio")}</button>`
  };
})();
