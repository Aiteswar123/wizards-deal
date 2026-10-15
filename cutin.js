/* Spell cut-in: a duel. A slanted panel bursts across the screen with the caster on the left and their target
   on the right; the spell leaves the caster's wand as a bolt in its own colour and strikes the target, who recoils.
   Spells on everyone split the bolt across every opponent; Protego shows the blocker's shield deflecting it;
   self spells (Geminio, Reparo) light the caster alone. Plays once per cast on every player's screen. */
(function () {
  "use strict";
  const E = window.Engine;
  const LOOK = {
    harry:    { c: "#c8282e", c2: "#eeba30", hair: "#1c1612", skin: "#ecc9a6" },
    hermione: { c: "#b3202a", c2: "#eeba30", hair: "#6b4423", skin: "#e9c4a0" },
    draco:    { c: "#2a9d5c", c2: "#c0c7cf", hair: "#ece4c4", skin: "#f1d8c4" },
    luna:     { c: "#3a64c8", c2: "#c48a4b", hair: "#f0dc9a", skin: "#f0d6c0" },
    cedric:   { c: "#ecb939", c2: "#2b2420", hair: "#5a3a22", skin: "#e6c09c" },
    ron:      { c: "#c8282e", c2: "#eeba30", hair: "#c4521f", skin: "#f3d2b6" },
    lupin:    { c: "#9e2a2b", c2: "#d8b25a", hair: "#8a7358", skin: "#e6c8ad" },
    hagrid:   { c: "#8b1a1f", c2: "#eeba30", hair: "#2b1d14", skin: "#e2bb98" },
    umbridge: { c: "#1f6b40", c2: "#e9a1c0", hair: "#7a5a3a", skin: "#f0d2c2" },
    cho:      { c: "#3a64c8", c2: "#c48a4b", hair: "#141016", skin: "#efd2b2" },
    peeves:   { c: "#ecb939", c2: "#2b2420", hair: "#d6551e", skin: "#efdccc" },
    myrtle:   { c: "#2f5bb8", c2: "#c48a4b", hair: "#3d2c22", skin: "#e8eef2" }
  };
  // House colours: they paint the burst and the scarf. The house name joins the sorting reveal.
  const HOUSE = { harry: "Gryffindor", hermione: "Gryffindor", ron: "Gryffindor", lupin: "Gryffindor", hagrid: "Gryffindor",
    draco: "Slytherin", umbridge: "Slytherin", luna: "Ravenclaw", cho: "Ravenclaw", myrtle: "Ravenclaw", cedric: "Hufflepuff", peeves: "Hufflepuff" };
  const SPARK = { stupefy: "#ff5a4f", petrificus: "#bfe7ff", obliviate: "#b98cff", protego: "#9fd8ff", levicorpus: "#ffd36b",
    confundo: "#ff9df0", wingardium: "#c6ffb0", accio2: "#ffe08a", accioAny: "#ffe08a", alohomora: "#ffcf7a", geminio: "#8affea", reparo: "#ffffff" };
  const CALL = { accio2: "Accio!", accioAny: "Accio!", alohomora: "Alohomora!", stupefy: "Stupefy!", levicorpus: "Levicorpus!", confundo: "Confundo!",
    wingardium: "Wingardium Leviosa!", obliviate: "Obliviate!", petrificus: "Petrificus Totalus!", protego: "Protego!", geminio: "Geminio!", reparo: "Reparo!" };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Authored figures: one robed body, each character told apart by hair, glasses, scarf and colours.
  function hairBack(ch, L) {
    if (ch === "hermione") return [[82,112,30],[158,112,30],[92,80,32],[148,80,32],[120,66,34],[76,146,24],[164,146,24],[88,170,18],[152,170,18]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${L.hair}"/>`).join("");
    if (ch === "hagrid") return [[78,110,34],[162,110,34],[120,72,40],[86,150,30],[154,150,30],[100,178,28],[140,178,28],[120,190,30]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${L.hair}"/>`).join("");
    if (ch === "myrtle") return `<path d="M82 104 Q66 124 70 156 Q74 170 82 162 Q80 136 92 116 Z M158 104 Q174 124 170 156 Q166 170 158 162 Q160 136 148 116 Z" fill="${L.hair}"/>`;
    if (ch === "luna" || ch === "cho") return `<path d="M76 112 Q76 66 120 66 Q164 66 164 112 L172 214 Q160 222 150 212 L146 126 Q120 108 94 126 L90 212 Q80 222 68 214 Z" fill="${L.hair}"/>`;
    return "";
  }
  function hairFront(ch, L) {
    switch (ch) {
      case "harry": return `<path d="M78 116 Q76 72 120 70 Q166 70 162 116 L154 98 L150 110 L142 92 L134 104 L126 88 L118 102 L108 88 L102 104 L92 92 L88 110 Z" fill="${L.hair}"/>
        <g fill="rgba(200,230,255,.12)" stroke="#141018" stroke-width="3.2"><circle cx="106" cy="125" r="11"/><circle cx="134" cy="125" r="11"/></g><path d="M117 125 h6" stroke="#141018" stroke-width="3"/><path d="M99 119 l4 -2 M127 119 l4 -2" stroke="#fff" stroke-width="1.6" opacity=".6"/>
        <path d="M112 90 l6 7 -4 2 6 8" fill="none" stroke="#9b2424" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      case "hermione": return `<path d="M82 112 Q86 76 120 74 Q154 76 158 112 Q146 92 120 92 Q96 92 82 112 Z" fill="${L.hair}"/>`;
      case "draco": return `<path d="M80 114 Q78 70 120 70 Q162 70 160 114 Q152 90 122 88 Q98 88 80 114 Z" fill="${L.hair}"/><path d="M96 84 Q120 78 150 90" stroke="#fff8dc" stroke-width="2" fill="none" opacity=".6"/>`;
      case "luna": return `<path d="M82 112 Q86 76 120 74 Q154 76 158 112 Q140 96 120 96 Q100 96 82 112 Z" fill="${L.hair}"/><circle cx="80" cy="146" r="5.5" fill="#ff8a3d"/><path d="M80 140 l-3 -6 m3 6 l3 -6" stroke="#4fa36b" stroke-width="2"/>`;
      case "ron": case "lupin": return `<path d="M80 114 Q78 70 120 70 Q162 70 160 114 Q150 92 130 90 L126 98 L118 88 L110 98 Q96 92 80 114 Z" fill="${L.hair}"/>`;
      case "cho": return `<path d="M82 112 Q86 76 120 74 Q154 76 158 112 Q146 92 120 92 Q96 92 82 112 Z" fill="${L.hair}"/>`;
      case "hagrid": return `<path d="M84 128 Q120 200 156 128 Q150 172 120 176 Q90 172 84 128 Z" fill="${L.hair}"/>`;
      case "umbridge": return `<path d="M80 114 Q80 74 120 72 Q160 74 160 114 Q150 96 120 94 Q90 96 80 114 Z" fill="${L.hair}"/><path d="M84 92 Q120 60 156 92 L150 84 Q120 66 90 84 Z" fill="#e9a1c0"/><circle cx="148" cy="88" r="6" fill="#e9a1c0"/>`;
      case "myrtle": return `<path d="M82 112 Q86 76 120 74 Q154 76 158 112 Q146 92 120 92 Q96 92 82 112 Z" fill="${L.hair}"/><g fill="rgba(200,230,255,.14)" stroke="#2a2a3a" stroke-width="3"><circle cx="106" cy="125" r="11"/><circle cx="134" cy="125" r="11"/></g><path d="M117 125 h6" stroke="#2a2a3a" stroke-width="3"/>`;
      case "peeves": return `<path d="M78 114 Q76 72 120 70 Q166 70 162 114 L156 96 L150 108 L144 88 L136 102 L128 84 L120 100 L110 84 L104 102 L94 90 L88 108 Z" fill="${L.hair}"/>`;
      case "cedric": return `<path d="M80 114 Q80 72 120 72 Q160 72 160 114 Q156 94 134 90 Q132 96 120 96 Q100 96 80 114 Z" fill="${L.hair}"/>`;
    }
    return "";
  }
  // Per-character faces: eye colour and the details people know them by.
  const FACE = {
    harry: { eye: "#3f8f4f" }, hermione: { eye: "#7a4a24", brow: "#5a3218" }, draco: { eye: "#8c96a6", brow: "#d8cfa8", smirk: true },
    luna: { eye: "#8fb6e8", big: true, brow: "#e0c27a" }, cedric: { eye: "#6d7a8a" }, ron: { eye: "#4f86c6", freckles: true },
    lupin: { eye: "#b0873a", scars: true, tired: true }, hagrid: { eye: "#1a1410" }, umbridge: { eye: "#6a4a2a", smirk: true, robe: "#d97aa6" },
    cho: { eye: "#3a2618" }, peeves: { eye: "#2a1a30", grin: true, ghost: false }, myrtle: { eye: "#8c9aa8", ghost: true }
  };
  const shade = (hex, t) => { const n = parseInt(hex.slice(1), 16), m = t < 0 ? 0 : 255, a = Math.abs(t);
    const ch = s => Math.round(((n >> s) & 255) * (1 - a) + m * a); return "#" + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, "0")).join(""); };
  let figN = 0;
  // A character drawn as a little portrait, facing right with the wand raised; mood is "cast" (shouting the spell),
  // "hit" (struck) or "proud" (the sorting reveal). The wand tip stays at (250,74) so the duel's bolts line up.
  function figure(ch, spark, mood) {
    const id = "f" + (++figN), L = LOOK[ch] || LOOK.harry, F = FACE[ch] || {}, skin = L.skin, hair = L.hair;
    const robe = F.robe || "#1d1828", eye = F.eye || "#4a3a2a", brow = F.brow || shade(hair, -.25);
    const mouth = mood === "hit" ? `<ellipse cx="120" cy="147" rx="4.5" ry="5.5" fill="#5a1e24"/>`
      : mood === "cast" ? `<path d="M110 143 Q120 141 130 143 Q128 154 120 155 Q112 154 110 143 Z" fill="#5a1e24"/><path d="M113 150 Q120 148 127 150 Q124 154 120 154 Q116 154 113 150 Z" fill="#d86a6a"/><path d="M111 143.5 Q120 142 129 143.5" stroke="#fff" stroke-width="2" fill="none"/>`
      : F.grin ? `<path d="M106 142 Q120 156 134 142 Q120 150 106 142 Z" fill="#5a1e24"/><path d="M108 143 Q120 150 132 143" stroke="#fff" stroke-width="2" fill="none"/>`
      : F.smirk ? `<path d="M110 146 Q122 148 131 142" stroke="#7a3a34" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      : `<path d="M110 144 Q120 152 130 144" stroke="#7a3a34" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    const eyeY = 125, er = F.big ? 7.2 : 6.2, look = mood === "hit" ? -1.5 : 1.6;
    const oneEye = x => `<ellipse cx="${x}" cy="${eyeY}" rx="${er}" ry="${er * (F.tired ? .72 : .86)}" fill="#fbf8f2"/>
      <circle cx="${x + look}" cy="${eyeY + .5}" r="${er * .62}" fill="${eye}"/><circle cx="${x + look}" cy="${eyeY + .5}" r="${er * .3}" fill="#120e14"/>
      <circle cx="${x + look + 1.6}" cy="${eyeY - 1.4}" r="1.3" fill="#fff"/><path d="M${x - er} ${eyeY - 1} Q${x} ${eyeY - er - 1.5} ${x + er} ${eyeY - 1}" stroke="#2a1c1c" stroke-width="1.6" fill="none"/>`;
    const browY = mood === "hit" ? 110 : mood === "cast" ? 114 : 113, browTilt = mood === "cast" ? 3 : mood === "hit" ? -3 : 0;
    const brows = `<path d="M98 ${browY + browTilt} Q106 ${browY - 3} 113 ${browY}" stroke="${brow}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M127 ${browY} Q134 ${browY - 3} 142 ${browY + browTilt}" stroke="${brow}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    const extras = (F.freckles ? [[102, 137], [107, 140], [99, 141], [138, 137], [133, 140], [141, 141]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#b8643a" opacity=".7"/>`).join("") : "")
      + (F.scars ? `<path d="M96 114 L112 140 M100 112 L114 134" stroke="#c98f86" stroke-width="1.8" opacity=".75"/>` : "")
      + (ch === "peeves" ? `<path d="M80 94 Q118 52 160 92 L152 74 Q120 40 90 74 Z" fill="#7a3fb0"/><path d="M90 74 Q76 60 66 70 M152 74 Q168 58 178 68" stroke="#7a3fb0" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="64" cy="72" r="5" fill="#f2c94c"/><circle cx="180" cy="70" r="5" fill="#f2c94c"/><path d="M110 166 L120 172 L130 166 L130 178 L120 172 L110 178 Z" fill="#e8742a"/>` : "");
    const tie = `<path d="M108 166 L120 196 L132 166 Z" fill="#f4f1ea"/><path d="M116 172 L124 172 L127 206 L120 214 L113 206 Z" fill="${L.c}"/>
      <path d="M115 180 L125 186 M114 191 L126 197 M114 201 L125 206" stroke="${L.c2}" stroke-width="2.6"/>`;
    const body = `<path d="M58 320 L78 178 Q120 150 162 178 L188 320 Z" fill="url(#rb${id})"/>
      <path d="M58 320 L78 178 Q120 150 162 178 L188 320" fill="none" stroke="${L.c}" stroke-width="3.5"/>
      <path d="M96 200 Q92 260 84 318 M146 204 Q152 262 160 318 M120 214 L120 320" stroke="#000" stroke-width="2.4" opacity=".28" fill="none"/>
      <path d="M86 236 Q120 248 156 236" stroke="#fff" stroke-width="1.4" opacity=".07" fill="none"/>
      ${tie}
      <path d="M92 222 L108 222 L108 236 Q100 244 92 236 Z" fill="${L.c}" stroke="${L.c2}" stroke-width="1.6"/><path d="M96 228 l4 4 4 -4" stroke="${L.c2}" stroke-width="1.4" fill="none"/>`;
    const arm = `<path d="M158 186 Q196 170 218 128" stroke="url(#rb${id})" stroke-width="22" stroke-linecap="round" fill="none"/>
      <path d="M160 178 Q194 164 212 128" stroke="${L.c}" stroke-width="2.4" fill="none" opacity=".75"/>
      <path d="M206 138 L224 126" stroke="${L.c}" stroke-width="7" stroke-linecap="round"/>`;
    const ghost = F.ghost ? ` opacity=".86"` : "";
    return `<svg viewBox="0 0 270 320" class="ci-fig" aria-hidden="true"><defs>
      <radialGradient id="sp${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${spark}"/><stop offset="1" stop-color="${spark}" stop-opacity="0"/></radialGradient>
      <radialGradient id="sk${id}" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="${shade(skin, .28)}"/><stop offset=".55" stop-color="${skin}"/><stop offset="1" stop-color="${shade(skin, -.2)}"/></radialGradient>
      <linearGradient id="hr${id}" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${shade(hair, .22)}"/><stop offset=".5" stop-color="${hair}"/><stop offset="1" stop-color="${shade(hair, -.3)}"/></linearGradient>
      <linearGradient id="rb${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(robe, .14)}"/><stop offset=".6" stop-color="${robe}"/><stop offset="1" stop-color="${shade(robe, -.35)}"/></linearGradient>
      <radialGradient id="bl${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff8f8f" stop-opacity=".45"/><stop offset="1" stop-color="#ff8f8f" stop-opacity="0"/></radialGradient>
    </defs><g${ghost}>
      ${hairBack(ch, { hair: `url(#hr${id})` })}
      ${body}${arm}
      <path d="M108 146 L132 146 L132 168 Q120 174 108 168 Z" fill="${shade(skin, -.18)}"/>
      <circle cx="82" cy="126" r="7.5" fill="${shade(skin, -.08)}"/><circle cx="158" cy="126" r="7.5" fill="${shade(skin, -.08)}"/>
      <ellipse cx="120" cy="121" rx="38" ry="40" fill="url(#sk${id})"/>
      <ellipse cx="102" cy="139" rx="8" ry="5" fill="url(#bl${id})"/><ellipse cx="138" cy="139" rx="8" ry="5" fill="url(#bl${id})"/>
      ${oneEye(106)}${oneEye(134)}${brows}
      <path d="M121 127 Q117 135 119 138 Q122 139 124 137" stroke="${shade(skin, -.3)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${mouth}${extras}
      ${hairFront(ch, { hair: `url(#hr${id})` })}
      <circle cx="220" cy="124" r="10" fill="url(#sk${id})"/>
      <path d="M222 122 L248 78" stroke="#3a2412" stroke-width="5.5" stroke-linecap="round"/><path d="M223 120 L231 106" stroke="#7a5230" stroke-width="7" stroke-linecap="round"/>
      <circle class="ci-spark" cx="250" cy="74" r="30" fill="url(#sp${id})"/></g>
    </svg>`;
  }
  const layer = document.createElement("div");
  layer.className = "ci"; layer.hidden = true;
  layer.setAttribute("role", "status"); layer.setAttribute("aria-live", "polite");
  document.body.appendChild(layer);
  const queue = []; let playing = false, timer = null;
  const reduce = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  function finish() {
    clearTimeout(timer); layer.classList.remove("reveal"); layer.classList.remove("on", "out"); layer.hidden = true; playing = false;
    if (queue.length) setTimeout(next, 80);
  }
  layer.addEventListener("click", finish);

  function next() {
    const job = queue.shift(); if (!job) return;
    playing = true;
    if (job.reveal) return showReveal(job);
    if (job.banner) return showBanner(job);
    return showDuel(job);
  }

  const charName = ch => E.CHARS[ch] ? E.CHARS[ch].n : "";
  const streaksHTML = n => Array.from({ length: n }, (_, i) => `<i style="top:${4 + i * (92 / n)}%;animation-delay:${(i * 37) % 260}ms;opacity:${0.2 + (i % 4) * 0.13}"></i>`).join("");
  function play(hold) {
    layer.hidden = false; void layer.offsetWidth; layer.classList.add("on");
    timer = setTimeout(() => { layer.classList.add("out"); timer = setTimeout(finish, reduce() ? 150 : 380); }, reduce() ? Math.min(hold, 1400) : hold);
  }

  // The duel: caster left, target(s) right, a bolt between them.
  function showDuel(job) {
    const L = LOOK[job.ch] || LOOK.harry, spark = SPARK[job.k] || "#fff", block = job.k === "protego", self = !job.targets.length;
    const many = job.targets.length > 1, shown = job.targets.slice(0, 5), extra = job.targets.length - shown.length;
    layer.style.setProperty("--ci", L.c); layer.style.setProperty("--ci2", spark);
    const verb = block ? (job.you ? "You block" : `${job.name} blocks`) : (job.you ? "You cast" : `${job.name} casts`);
    const on = self ? "" : block ? `and turns away ${shown[0].name}'s spell`
      : many ? `on everyone${job.col ? " · " + E.COLORS[job.col].n : ""}` : `on ${shown[0].name}${job.col ? " · " + E.COLORS[job.col].n : ""}`;
    layer.innerHTML = `<div class="ci-band ci-duel${block ? " block" : ""}${self ? " self" : ""}${many ? " many" : ""}"><div class="ci-burst"></div><div class="ci-streaks">${streaksHTML(14)}</div>
      <div class="d-caster"><div class="d-fig">${figure(job.ch, spark, "cast")}</div>${block ? `<i class="d-shield"></i>` : ""}<span class="d-name">${esc(charName(job.ch))}</span></div>
      ${self ? "" : `<div class="d-targets">${shown.map((t, i) => `<div class="d-target" style="--d:${i * 70}ms;--tc:${(LOOK[t.ch] || LOOK.harry).c}"><div class="d-fig">${figure(t.ch, block ? (SPARK.stupefy) : "#ffffff00", block ? "cast" : "hit")}</div><i class="d-hit"></i><span class="d-name">${esc(t.name)}</span></div>`).join("")}${extra > 0 ? `<span class="d-more">+${extra}</span>` : ""}</div>`}
      <svg class="d-bolts" aria-hidden="true"></svg>
      <div class="d-text"><span class="ci-who">${esc(verb)}</span><span class="ci-call">${esc(CALL[job.k] || "Spell!")}</span>${on ? `<span class="d-on">${esc(on)}</span>` : ""}</div></div>`;
    play(self ? 1700 : 2300);
    // aim once the panel has finished sliding in (the bolt itself fires at 0.55s)
    if (!self) setTimeout(() => aim(block), reduce() ? 30 : 400);
  }
  // Draw the bolts from the real wand tip to each target's chest, measured on screen.
  function aim(block) {
    const band = layer.querySelector(".ci-band"), svg = layer.querySelector(".d-bolts");
    if (!band || !svg) return;
    const B = band.getBoundingClientRect(), pt = (el, fx, fy) => { const r = el.getBoundingClientRect(); return [r.left - B.left + r.width * fx, r.top - B.top + r.height * fy]; };
    const casterFig = band.querySelector(".d-caster .d-fig");
    const wand = pt(casterFig, 250 / 270, 74 / 320);
    const targets = [...band.querySelectorAll(".d-target .d-fig")];
    svg.setAttribute("viewBox", `0 0 ${B.width} ${B.height}`);
    const spark = getComputedStyle(layer).getPropertyValue("--ci2").trim() || "#fff";
    svg.innerHTML = targets.map((t, i) => {
      // targets face left (mirrored), so their wand tip is on their left; their chest is the hit point
      const chest = pt(t, .5, .62), twand = pt(t, 1 - 250 / 270, 74 / 320);
      const [a, b] = block ? [twand, [wand[0] + 40, wand[1] + 10]] : [wand, chest];
      const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 30 - i * 10;
      const d = `M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
      const deflect = block ? `<path class="d-deflect" d="M${b[0].toFixed(1)},${b[1].toFixed(1)} q60,-90 160,-140" pathLength="1"/>` : "";
      return `<g style="--d:${i * 70}ms;--sp:${spark}"><path class="d-glow" d="${d}" pathLength="1"/><path class="d-core" d="${d}" pathLength="1"/>${deflect}</g>`;
    }).join("");
  }
  // A short banner: "Your turn".
  function showBanner(job) {
    layer.style.setProperty("--ci", job.color || "#ffb23e"); layer.style.setProperty("--ci2", "#fff3c8");
    layer.innerHTML = `<div class="ci-band ci-banner"><div class="ci-burst"></div><div class="ci-streaks">${streaksHTML(10)}</div>
      <div class="d-text"><span class="ci-call">${esc(job.text)}</span>${job.sub ? `<span class="d-on">${esc(job.sub)}</span>` : ""}</div></div>`;
    play(1050);
  }

  // Game start: each player is shown the character they were dealt and its power.
  function showReveal(job) {
    const L = LOOK[job.ch] || LOOK.harry, C = E.CHARS[job.ch];
    layer.style.setProperty("--ci", L.c); layer.style.setProperty("--ci2", "#ffe9a8");
    const streaks = Array.from({ length: 10 }, (_, i) => `<i style="top:${6 + i * 9}%;animation-delay:${(i * 53) % 300}ms;opacity:${0.2 + (i % 3) * 0.15}"></i>`).join("");
    layer.innerHTML = `<div class="ci-band ci-tall"><div class="ci-burst"></div><div class="ci-streaks">${streaks}</div>
      <div class="ci-art">${figure(job.ch, "#ffe9a8", "proud")}</div>
      <div class="ci-text"><span class="ci-who">The sorting is done. You are</span><span class="ci-call">${esc(C.n)}</span><span class="ci-char">House ${esc(HOUSE[job.ch] || "")}</span>
        <span class="ci-power"><b>Your power:</b> ${esc(C.d)}</span>
        ${job.others.length ? `<span class="ci-others">${job.others.map(o => `${esc(o.name)}: ${esc(E.CHARS[o.ch].n)}`).join(" · ")}</span>` : ""}
        <button class="ci-go" type="button">Let's play</button></div></div>`;
    layer.classList.add("reveal");
    layer.hidden = false;
    void layer.offsetWidth;
    layer.classList.add("on");
    timer = setTimeout(() => { layer.classList.add("out"); timer = setTimeout(finish, 380); }, 9000);
  }

  let seen = null;
  window.CutIn = {
    /** Call with every fresh game state. */
    observe(S, nameOf, meSeat) {
      if (!S || S.status === "lobby") { seen = 0; return; }
      const lc = S.lastCast;
      if (!lc) { if (seen === null) seen = 0; return; }
      if (seen === null) { seen = lc.n; return; }   // joined mid-game: don't replay old casts
      if (lc.n < seen) seen = 0;                   // a rematch restarted the count
      if (lc.n <= seen) return;
      seen = lc.n;
      const P = S.players[lc.p]; if (!P) return;
      const tgt = i => ({ ch: S.players[i].char, name: i === meSeat ? "you" : nameOf(i) });
      const targets = lc.t == null ? [] : lc.t === -1 ? S.players.map((_, i) => i).filter(i => i !== lc.p).map(tgt) : S.players[lc.t] ? [tgt(lc.t)] : [];
      queue.push({ ch: P.char, name: nameOf(lc.p), you: lc.p === meSeat, k: lc.k, col: lc.col, targets });
      if (!playing) next();
    },
    /** Show the dealt character once per game on this device. */
    reveal(S, nameOf, meSeat) {
      if (!S || S.status !== "play" || meSeat < 0) return;
      const key = "wd-reveal-" + S.code + "-" + S.created;
      try { if (localStorage.getItem(key)) return; localStorage.setItem(key, "1"); } catch (e) {}
      const others = S.players.map((p, i) => ({ name: nameOf(i), ch: p.char, i })).filter(o => o.i !== meSeat);
      queue.unshift({ reveal: true, ch: S.players[meSeat].char, others });
      if (!playing) next();
    },
    /** A short banner, such as "Your turn". */
    banner(text, sub, color) { if (queue.some(j => j.banner)) return; queue.push({ banner: true, text, sub, color }); if (!playing) next(); },
    _fig: (ch, spark, mood) => figure(ch, spark, mood),
    preview(ch, k, targetChars) { queue.push({ ch, name: charName(ch), k, targets: (targetChars || []).map(t => ({ ch: t, name: charName(t) })) }); if (!playing) next(); }
  };
})();
