// Grand Line UNO: the table screen, home-page pieces and motion. Loaded before index.html's main script; it uses that
// script's shared helpers (S, me, act, esc, nameOf, mySeat, ghost, box, fireworks...) only when called, by which time
// they exist. The look is an original pirate theme: a ship's deck at sunset, Jolly Roger flags, bounty posters.
(function () {
  "use strict";
  const U = window.Uno;
  const css = `
:root[data-game=uno]{--stand:#0a2236;--stand-2:#0f2f4a;--stand-3:#14405f;--line:#1d4f73;--line-2:#2a6890;--board:#06131f;--board-2:#0b1d2e;--bulb-off:#183a55;
  --live:#ffd23f;--live-ink:#2a1a00;--crest:#f2c14e;--muted:#bcd6e6;--dim:#8db3c9;--band:#c8281e;--band-ink:#fbe7b0;--felt:#7a5230;
  --magic:"Pirata One","Grenze Gotisch",serif}
:root[data-game=uno] body{background-image:none;background-color:#071526}
.gamepick{display:flex;gap:.5rem;justify-content:center;margin:.9rem auto 0;max-width:30rem;position:relative;z-index:2}
.gamepick button{flex:1;display:flex;flex-direction:column;align-items:center;gap:.1rem;padding:.55rem .8rem;border-radius:10px;border:1px solid var(--line-2);background:color-mix(in srgb,var(--board) 75%,transparent);color:var(--muted);backdrop-filter:blur(4px)}
.gamepick button b{font:400 1.35rem/1 var(--magic);color:var(--chalk)}
.gamepick button span{font:600 .72rem/1.2 var(--label);letter-spacing:.08em;text-transform:uppercase}
.gamepick button[aria-pressed=true]{border-color:var(--crest);box-shadow:0 0 0 1px var(--crest),0 8px 24px -10px var(--crest);color:var(--crest)}
.gamepick .gp-uno b{font-family:"Pirata One",serif}
.umast{display:grid;grid-template-columns:1.1fr .9fr;gap:1.5rem;align-items:center;max-width:72rem;margin:1.6rem auto 1.2rem}
.umast h1{font:400 clamp(3rem,9vw,6.2rem)/.9 "Pirata One",serif;color:#fff3d6;text-shadow:0 3px 0 #7a2a16,0 10px 30px rgba(0,0,0,.6)}
.umast h1 span{display:block;color:#ffd23f;font-size:1.1em}
.umast p{margin-top:.9rem;max-width:34rem;color:#f1e3c6;text-shadow:0 1px 8px rgba(0,0,0,.7)}
.umast .fanu{position:relative;height:13rem}
.umast .fanu .ucard{position:absolute;left:50%;top:50%;--w:96px}
@media (max-width:760px){.umast{grid-template-columns:1fr}.umast .fanu{height:9.5rem}.umast .fanu .ucard{--w:72px}}
.tagkind{font:600 .66rem/1 var(--label);letter-spacing:.08em;text-transform:uppercase;padding:.2rem .4rem;border-radius:3px;background:var(--stand-3);color:var(--crest);margin-left:.4rem}
/* cards */
.ucard{--w:74px;--cc:#444;width:var(--w);aspect-ratio:5/7.4;border-radius:calc(var(--w)*.12);position:relative;flex:none;display:block;padding:0;border:0;
  background:#fbf3e0;box-shadow:0 1px 0 rgba(255,255,255,.4) inset,0 6px 14px -6px rgba(0,0,0,.7),0 1px 2px rgba(0,0,0,.5);color:#fff;font-family:"Pirata One",serif;transition:transform .18s var(--ease),filter .18s,box-shadow .18s}
.ucard .uf{position:absolute;inset:calc(var(--w)*.055);border-radius:calc(var(--w)*.08);background:var(--cc);overflow:hidden;
  background-image:radial-gradient(circle at 30% 18%,rgba(255,255,255,.28),transparent 45%),repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 3px,transparent 3px 9px)}
.ucard.c-r{--cc:#d6342c}.ucard.c-y{--cc:#f2b51c}.ucard.c-g{--cc:#2f9a52}.ucard.c-b{--cc:#1f6fd1}
.ucard.c-w .uf{background:conic-gradient(from 45deg,#d6342c 0 25%,#1f6fd1 0 50%,#2f9a52 0 75%,#f2b51c 0)}
.ucard .port{position:absolute;left:50%;top:50%;width:76%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:#fbf3e0;
  box-shadow:0 0 0 calc(var(--w)*.035) #6b4423,0 0 0 calc(var(--w)*.055) #d9b07a,inset 0 calc(var(--w)*.03) calc(var(--w)*.06) rgba(0,0,0,.25);display:grid;place-items:center}
.ucard .big{font-size:calc(var(--w)*.56);line-height:1;color:var(--cc);text-shadow:calc(var(--w)*.012) calc(var(--w)*.02) 0 rgba(0,0,0,.35);-webkit-text-stroke:calc(var(--w)*.01) rgba(0,0,0,.35)}
.ucard.c-w .big{color:#2b1a10}
.ucard .port svg{width:82%;height:82%}
.ucard .cn{position:absolute;font-size:calc(var(--w)*.2);line-height:1;color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.6)}
.ucard .cn.tl{left:calc(var(--w)*.1);top:calc(var(--w)*.08)}.ucard .cn.br{right:calc(var(--w)*.1);bottom:calc(var(--w)*.08);transform:rotate(180deg)}
.ucard .nm{position:absolute;left:0;right:0;bottom:calc(var(--w)*.1);text-align:center;font:700 calc(var(--w)*.1)/1 var(--label);letter-spacing:.06em;text-transform:uppercase;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.8)}
.ucard.back .uf{background:#2a160d;background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 2px,transparent 2px 11px),radial-gradient(circle at 50% 45%,#5a3018,#1c0c06 75%)}
.ucard.back .port{background:#120a07;box-shadow:0 0 0 calc(var(--w)*.03) #c9873a}
.ucard.back .bt{position:absolute;left:0;right:0;bottom:calc(var(--w)*.12);text-align:center;font-size:calc(var(--w)*.16);color:#ffd23f;text-shadow:0 2px 0 #7a2a16}
/* the table */
.ugame{max-width:84rem;margin:0 auto}
.ugame .board .mark{font-family:"Pirata One",serif;font-weight:400}
.uticker{margin-top:.55rem;padding:.45rem .8rem;border-radius:4px;background:#f3e2bd url(assets/parchment.jpg) center/cover;color:#2b1a10;font-size:.95rem;min-height:2.1rem;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.uticker b{color:#8a1d12}
.udeck{position:relative;margin:1rem auto 0;width:min(100%,62rem);aspect-ratio:16/8.6;max-height:max(20rem,50vh);border-radius:50%;
  background:#6b4423 url(assets/medieval_wood.jpg) center/420px;box-shadow:0 0 0 10px #3b220f,0 0 0 13px #c9873a,0 0 0 16px #2a160b,0 30px 60px -10px rgba(0,0,0,.8),inset 0 0 80px rgba(0,0,0,.65)}
.udeck::before{content:"";position:absolute;inset:9%;border-radius:50%;border:2px dashed rgba(255,226,170,.22)}
@media (max-width:760px){.ucolname .sea{display:none}.udeck{aspect-ratio:1/1.08;width:100%;max-height:max(22rem,56vh);margin-top:.8rem}}
.ucenter{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:clamp(.8rem,3vw,2rem)}
.ucenter .ucard{--w:clamp(64px,9vw,96px)}
.upile{position:relative;display:grid;place-items:center}
.upile .cnt{position:absolute;bottom:-1.5rem;left:0;right:0;text-align:center;font:600 .75rem/1 var(--label);color:#f6e7c4;letter-spacing:.06em;text-shadow:0 1px 3px #000}
button.ucard.drawme{cursor:pointer;animation:bob 1.6s ease-in-out infinite}
button.ucard.drawme:hover{transform:translateY(-6px) rotate(-2deg)}
@keyframes bob{50%{transform:translateY(-5px)}}
.udisc{position:relative;width:clamp(64px,9vw,96px);aspect-ratio:5/7.4}
.udisc .ucard{position:absolute;inset:0}
.ucompass{position:absolute;left:50%;top:50%;width:calc(100% + 4.2rem);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;
  border:3px solid var(--cur,#fff);box-shadow:0 0 22px var(--cur),inset 0 0 22px var(--cur);opacity:.85;transition:border-color .5s,box-shadow .5s}
.udir{position:absolute;left:50%;top:50%;width:calc(100% + 6.6rem);aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none;animation:spin 14s linear infinite;opacity:.55}
.udir.ccw{animation-direction:reverse}
@keyframes spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
.ustack{position:absolute;right:-2.2rem;top:-1.6rem;font:400 2rem/1 "Pirata One",serif;color:#fff;background:#b3121b;border:3px solid #ffd23f;border-radius:50%;width:3.4rem;height:3.4rem;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0,0,0,.6);animation:pulse 1s ease-in-out infinite}
@keyframes pulse{50%{transform:scale(1.12)}}
.ucolname{position:absolute;bottom:-2.9rem;left:-3rem;right:-3rem;text-align:center;font:700 .74rem/1 var(--label);letter-spacing:.08em;text-transform:uppercase;color:#fff;text-shadow:0 1px 3px #000}
/* seats */
.useat{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:.2rem;min-width:5.5rem;z-index:2}
.useat .flag{width:3.1rem;height:3.1rem;border-radius:50%;background:#111;display:grid;place-items:center;box-shadow:0 0 0 3px var(--fc),0 6px 14px rgba(0,0,0,.6);transition:box-shadow .3s}
.useat .flag svg{width:82%;height:82%}
.useat .nm{font:700 .82rem/1.1 var(--label);color:#fff8e6;background:rgba(10,8,6,.72);padding:.2rem .5rem;border-radius:999px;max-width:9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.useat .fanb{display:flex;height:1.6rem}
.useat .fanb i{width:1.05rem;height:1.55rem;border-radius:3px;background:linear-gradient(#5a3018,#1c0c06);border:1px solid #c9873a;margin-left:-.62rem;box-shadow:0 1px 3px rgba(0,0,0,.6)}
.useat .fanb i:first-child{margin-left:0}
.useat .cc{font:700 .72rem/1 var(--label);color:#ffe9b5;text-shadow:0 1px 2px #000}
.useat.on .flag{box-shadow:0 0 0 3px var(--live),0 0 0 7px color-mix(in srgb,var(--live) 35%,transparent),0 0 26px var(--live)}
.useat.on .nm{background:var(--live);color:var(--live-ink)}
.useat .unob{font:400 .95rem/1 "Pirata One",serif;color:#fff;background:#c8281e;border:2px solid #ffd23f;padding:.15rem .45rem;border-radius:6px;transform:rotate(-6deg)}
.useat .catch{font:700 .72rem/1 var(--label);text-transform:uppercase;letter-spacing:.06em;padding:.35rem .55rem;border-radius:6px;border:0;background:#ffd23f;color:#2a1a00;animation:pulse .8s infinite}
.useat .tk{font:700 .72rem/1 var(--label);color:var(--live-ink);background:var(--live);border-radius:3px;padding:.15rem .35rem}
.udeck.many .useat .flag{width:2.4rem;height:2.4rem}.udeck.many .useat .fanb{display:none}
/* my side */
.ume{margin-top:1.4rem;background:color-mix(in srgb,var(--board) 82%,transparent);border:1px solid var(--line-2);border-radius:14px;padding:.8rem .9rem 1rem;backdrop-filter:blur(6px);box-shadow:0 20px 40px -20px #000}
.ume.live{border-color:var(--live);box-shadow:0 0 0 1px var(--live),0 20px 40px -20px #000}
.ubar{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}
.ubar .say{font:400 1.35rem/1.1 var(--magic);color:var(--chalk);flex:1;min-width:12rem}
.ume.live .ubar .say{color:var(--live)}
.ubar .say small{display:block;font:500 .85rem/1.3 var(--body);color:var(--muted);margin-top:.2rem}
.ubtn{appearance:none;border:0;border-radius:8px;min-height:2.8rem;padding:.5rem 1rem;font:700 .9rem/1 var(--label);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;background:var(--stand-3);color:var(--chalk);box-shadow:0 3px 0 rgba(0,0,0,.45)}
.ubtn.go{background:var(--live);color:var(--live-ink)}
.ubtn.uno{background:#c8281e;color:#fff;border:2px solid #ffd23f;font:400 1.3rem/1 "Pirata One",serif;letter-spacing:.02em;text-transform:none}
.ubtn.uno[aria-pressed=true]{background:#ffd23f;color:#7a1a10}
.ubtn.uno.loud{animation:pulse .7s infinite}
.uclock{font:700 .95rem/1 var(--label);color:var(--chalk);background:var(--stand-3);border-radius:6px;padding:.45rem .6rem;font-variant-numeric:tabular-nums}
.uclock.low,.uclock .low{color:var(--bad)}
.uhand{display:flex;justify-content:safe center;padding:1.6rem .4rem .4rem;overflow-x:auto;overflow-y:visible;scrollbar-width:thin}
.uhand .ucard{--w:clamp(66px,8.4vw,92px);margin-left:var(--ov,-18px);cursor:default}
.uhand .ucard:first-child{margin-left:0}
.uhand.mine-turn .ucard.ok{cursor:pointer;transform:translateY(-14px);box-shadow:0 0 0 3px var(--live),0 14px 24px -8px rgba(0,0,0,.8)}
.uhand.mine-turn .ucard.ok:hover{transform:translateY(-24px) rotate(-2deg);z-index:3}
.uhand.mine-turn .ucard.no{filter:brightness(.55) saturate(.6)}
.uhand .ucard.justdrew{box-shadow:0 0 0 3px #fff,0 0 22px #fff}
/* colour picker */
.upick{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(3,8,14,.7);backdrop-filter:blur(3px)}
.upick .box{background:#f3e2bd url(assets/parchment.jpg) center/cover;color:#2b1a10;border-radius:14px;padding:1.2rem;width:min(92vw,24rem);box-shadow:0 30px 60px #000;text-align:center}
.upick h3{font:400 1.8rem/1 "Pirata One",serif;margin-bottom:.8rem;color:#2b1a10}
.upick .cols{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.upick .cols button{min-height:4.2rem;border-radius:10px;border:3px solid rgba(0,0,0,.25);color:#fff;font:400 1.3rem/1 "Pirata One",serif;text-shadow:0 1px 2px rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25rem}
.upick .cols button small{font:600 .7rem/1 var(--label);letter-spacing:.06em;text-transform:uppercase;opacity:.9}
.upick .cancel{margin-top:.8rem;background:none;border:0;color:#5a3a20;text-decoration:underline}
/* winner */
.uwin{position:fixed;inset:0;z-index:55;display:grid;place-items:center;background:rgba(3,8,14,.55);padding:16px}
.uwin .poster{width:min(94vw,30rem);background:#ecd9ae url(assets/parchment.jpg) center/cover;color:#2b1a10;border-radius:6px;padding:1.2rem 1.3rem 1.3rem;text-align:center;box-shadow:0 30px 70px #000;transform:rotate(-1.2deg)}
.uwin .poster .w{font:400 3rem/1 "Pirata One",serif;letter-spacing:.06em;color:#3b1d0e}
.uwin .poster .who{font:400 2.2rem/1.05 "Pirata One",serif;color:#8a1d12;margin:.3rem 0}
.uwin .poster .bty{font:700 .9rem/1 var(--label);letter-spacing:.12em;text-transform:uppercase;color:#5a3a20}
.uwin ol{list-style:none;margin:.9rem 0;padding:0;text-align:left}
.uwin li{display:grid;grid-template-columns:1.6rem 1fr auto;gap:.5rem;align-items:baseline;padding:.35rem 0;border-bottom:1px dashed rgba(60,30,10,.3)}
.uwin li .xp{font:700 .9rem/1 var(--label);color:#2f6b2f}
.uwin li small{display:block;color:#6b4a2a;font-size:.78rem}
.uwin li .lvup{color:#b3121b;font-weight:700}
.uwin .row{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap}
.uwin .btn{color:#2b1a10;border-color:#5a3a20;background:rgba(255,255,255,.35)}
.uwin .btn.primary{background:#2b1a10;color:#ffe9b5;border-color:#2b1a10}
.urules{max-width:72rem;margin:1.2rem auto}
.urules .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:1.2rem}
.urules li{margin:.35rem 0}
.urules .mini{display:inline-block;vertical-align:middle;margin-right:.45rem}
.urules .mini .ucard{--w:30px}
@media (prefers-reduced-motion:reduce){.udir,.ustack,button.ucard.drawme,.useat .catch,.ubtn.uno.loud{animation:none}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ---- card art ----
  const GLYPH = {
    skip: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="46" cy="56" r="27" fill="#1b1b1b"/><circle cx="37" cy="46" r="8" fill="rgba(255,255,255,.35)"/><path d="M64 35q8-12 18-8" stroke="#6b4a2a" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="84" cy="26" r="6" fill="#ffb43a"/><circle cx="84" cy="26" r="3" fill="#fff6c8"/></svg>',
    rev: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="24" fill="#f4ead0" stroke="#3a2a1a" stroke-width="5"/><path d="M50 30 56 50 50 70 44 50Z" fill="#c62b25"/><path d="M50 30 56 50H44Z" fill="#7a1a10"/><path d="M14 44a37 37 0 0 1 52-28" stroke="#3a2a1a" stroke-width="6" fill="none"/><path d="M60 8l10 9-12 5Z" fill="#3a2a1a"/><path d="M86 56a37 37 0 0 1-52 28" stroke="#3a2a1a" stroke-width="6" fill="none"/><path d="M40 92 30 83l12-5Z" fill="#3a2a1a"/></svg>',
    d2: '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="20" width="36" height="50" rx="5" fill="#f3e2bd" stroke="#3a2a1a" stroke-width="4" transform="rotate(-10 40 45)"/><rect x="42" y="30" width="36" height="50" rx="5" fill="#f3e2bd" stroke="#3a2a1a" stroke-width="4" transform="rotate(8 60 55)"/><text x="61" y="64" text-anchor="middle" font-family="Pirata One,serif" font-size="30" fill="#8a1d12" transform="rotate(8 60 55)">+2</text></svg>',
    wild: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 30q6-16 20-18" stroke="#3b6b2a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60 18q14-8 22 2-12 8-22-2Z" fill="#4f8f36"/><circle cx="50" cy="60" r="29" fill="#8c3fb0"/><path d="M28 54q10-12 22 0t22 0M26 68q12-12 24 0t24 0M34 42q8-8 16 0t16 0" stroke="#e2b6f5" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="40" cy="48" r="5" fill="rgba(255,255,255,.35)"/></svg>',
    w4: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 58 34 86 22 68 46 96 56 66 62 76 92 50 72 24 92 34 62 4 56 32 46 14 22 42 34Z" fill="#111" stroke="#c8281e" stroke-width="4" stroke-linejoin="round"/><text x="50" y="62" text-anchor="middle" font-family="Pirata One,serif" font-size="30" fill="#ffd23f">+4</text></svg>'
  };
  const SKULL = (hat = "#e8b83c", band = "#c62b25") => `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M14 16 46 46M46 16 14 46" stroke="#f1e6cc" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="31" r="12" fill="#f1e6cc"/><rect x="23" y="37" width="14" height="9" rx="2" fill="#f1e6cc"/><circle cx="25.5" cy="31" r="3.3" fill="#111"/><circle cx="34.5" cy="31" r="3.3" fill="#111"/><path d="M28.5 37h3l-1.5 2.4z" fill="#111"/><ellipse cx="30" cy="21" rx="19" ry="4.6" fill="${hat}"/><path d="M20 21a10 8 0 0 1 20 0z" fill="${hat}"/><rect x="20.4" y="17.6" width="19.2" height="3" fill="${band}"/></svg>`;
  const short = v => v === "skip" ? "⊘" : v === "rev" ? "⇄" : v === "d2" ? "+2" : v === "w4" ? "+4" : v === "wild" ? "W" : v;
  function cardHTML(id, o = {}) {
    if (id == null || id < 0) return `<${o.tag || "div"} class="ucard back ${o.cls || ""}" ${o.attrs || ""}><span class="uf"></span><span class="port">${SKULL()}</span><span class="bt">UNO</span></${o.tag || "div"}>`;
    const c = U.card(id), K = U.KINDS[c.v], g = o.tag || "div";
    return `<${g} class="ucard c-${c.c} v-${c.v} ${o.cls || ""}" ${o.attrs || ""} aria-label="${esc(U.label(id))}"><span class="uf"></span>
      <span class="cn tl">${short(c.v)}</span><span class="port">${K ? GLYPH[c.v] : `<span class="big">${c.v}</span>`}</span><span class="cn br">${short(c.v)}</span>
      ${K ? `<span class="nm">${K.alias}</span>` : ""}</${g}>`;
  }
  const FLAG_COLORS = ["#e8b83c", "#c8281e", "#2f9a52", "#1f6fd1", "#8c3fb0", "#f08a24", "#21a3a3", "#e05a9a", "#9aa4ad", "#6b4423", "#d6d03a", "#4a5bd6"];
  const flagFor = i => SKULL(FLAG_COLORS[i % 12], i % 2 ? "#111" : "#c62b25");

  // ---- home page pieces ----
  const FAN = [[2, "-24deg", -96, 14], [24 + 26, "-8deg", -34, -4], [104, "8deg", 30, -4], [105 + 2, "22deg", 92, 14]];
  function mastHTML() {
    const pick = c => U.CARDS.find(k => k.c === c.c && k.v === c.v).id;
    const fan = [{ c: "r", v: "7" }, { c: "b", v: "rev" }, { c: "w", v: "wild" }, { c: "w", v: "w4" }].map(pick);
    return `<header class="umast"><div><h1>Grand Line<span>UNO</span></h1>
      <p>Set sail with up to 12 friends, each on their own phone or computer. Match the colour or the symbol, fire Cannonballs and Bounties at your rivals, stack the draws to sink them, and be the first crew to empty your hand. Don't forget to shout UNO!</p></div>
      <div class="fanu" aria-hidden="true">${fan.map((id, i) => cardHTML(id, { attrs: `style="transform:translate(calc(-50% + ${FAN[i][2]}px),calc(-50% + ${FAN[i][3]}px)) rotate(${FAN[i][1]})"` })).join("")}</div></header>`;
  }
  function rulesHTML() {
    const ex = v => cardHTML(U.CARDS.find(k => k.v === v && (v === "wild" || v === "w4" || k.c === "r")).id);
    const X = U.XP;
    return `<details class="ref urules"><summary>How to play Grand Line UNO</summary><div class="cols">
      <div><h3>Your turn</h3><ul>
        <li>Play one card that matches the top card's <b>colour</b> or <b>number/symbol</b>, or play a Wild.</li>
        <li>Can't (or won't) play? <b>Draw one card</b>. If it fits, you may play it straight away; otherwise your turn passes.</li>
        <li>Each turn has <b>${U.TURN_MS / 1000} seconds</b>. If time runs out you draw (or take the stack) and pass.</li>
        <li>When you play your second-to-last card, press <b>UNO!</b> first. If you forget, anyone can <b>Catch</b> you before the next move and you draw 2.</li>
        <li><b>Win</b> by playing your last card.</li></ul></div>
      <div><h3>The cards</h3><ul>
        <li><span class="mini">${ex("skip")}</span><b>Cannonball</b> (Skip): the next player loses their turn.</li>
        <li><span class="mini">${ex("rev")}</span><b>Log Pose</b> (Reverse): play turns the other way. With two players it acts like a Skip.</li>
        <li><span class="mini">${ex("d2")}</span><b>Bounty</b> (Draw 2): the next player draws 2, unless they stack.</li>
        <li><span class="mini">${ex("wild")}</span><b>Devil Fruit</b> (Wild): choose the next colour.</li>
        <li><span class="mini">${ex("w4")}</span><b>Haki</b> (Wild Draw 4): choose the colour; the next player draws 4, unless they stack.</li></ul></div>
      <div><h3>Stacking</h3><ul>
        <li>Hit by a Draw 2? Answer with another <b>Draw 2</b> or a <b>Wild Draw 4</b> to pass the pile on, bigger.</li>
        <li>Hit by a Wild Draw 4? Only another <b>Wild Draw 4</b> passes it on.</li>
        <li>The player who can't (or won't) stack draws the whole pile and loses their turn.</li></ul>
        <h3 style="margin-top:1rem">EXP (its own Hall of Fame)</h3><ul>
        <li>Winner: <b>${X.win}</b>, plus 1 EXP for every ${X.haulPer} points left in the other hands (up to ${X.haulCap}).</li>
        <li>Everyone else places by fewest points left in hand: 2nd <b>${X.second}</b>, 3rd <b>${X.third}</b>, the rest <b>${X.rest}</b>.</li>
        <li>Everyone: <b>+${X.perPlay}</b> per card played, up to ${X.playCap}.</li>
        <li class="muted">Card points: numbers score their face value, action cards 20, Wilds 50. Levels work like Wizard's Deal: Level 2 at 100 EXP, each level needing 50 more.</li></ul></div>
    </div></details>`;
  }

  // ---- the table ----
  const ui = { pick: null, uno: false, prev: null, rects: new Map() };
  function sortHand(h) { const ord = { r: 0, y: 1, g: 2, b: 3, w: 4 }, vo = v => isNaN(+v) ? ({ skip: 10, rev: 11, d2: 12, wild: 13, w4: 14 })[v] : +v;
    return h.slice().sort((a, b) => { const A = U.card(a), B = U.card(b); return ord[A.c] - ord[B.c] || vo(A.v) - vo(B.v) || a - b; }); }
  function seatPos(k, n, phone) {
    const a = Math.PI / 2 + k * 2 * Math.PI / n, rx = phone ? 41 : 46, ry = phone ? 44 : 43;
    return [50 + Math.cos(a) * rx, 50 + Math.sin(a) * ry];
  }
  function render() {
    // remember where my cards were, so a played card can fly from its spot
    ui.rects = new Map([...document.querySelectorAll(".uhand .ucard[data-id]")].map(el => [+el.dataset.id, { rect: el.getBoundingClientRect(), html: el.outerHTML.replace(/^<button/, "<div").replace(/<\/button>$/, "</div>") }]));
    const v = mySeat(), P = S.players[v], n = S.players.length, phone = matchMedia("(max-width:760px)").matches;
    const myTurn = S.status === "play" && S.turn === v, topId = S.discard[S.discard.length - 1], col = U.COLORS[S.col];
    document.title = myTurn ? "Your move · Grand Line UNO" : "Grand Line UNO";
    if (!P || P.hand.length !== 2) ui.uno = false;
    const seats = S.players.map((p, i) => {
      const k = v >= 0 ? (i - v + n) % n : i, [x, y] = seatPos(k, n, phone), on = S.status === "play" && S.turn === i, cnt = p.hand.length;
      const catchable = S.unoMiss === i && i !== v && v >= 0;
      return `<div class="useat${on ? " on" : ""}" data-p="${i}" style="left:${x}%;top:${y}%;--fc:${FLAG_COLORS[i % 12]}">
        <span class="flag">${flagFor(i)}</span><span class="nm">${i === v ? "You" : esc(nameOf(i))}</span>
        ${i !== v ? `<span class="fanb">${Array.from({ length: Math.min(cnt, 8) }, () => "<i></i>").join("")}</span>` : ""}
        <span class="cc">${cnt} card${cnt === 1 ? "" : "s"}${on && S.clock ? ` · <span data-clock="turn">1:00</span>` : ""}</span>
        ${cnt === 1 && S.unoMiss !== i ? `<span class="unob">UNO!</span>` : ""}
        ${catchable ? `<button class="catch" data-u="catch" data-p="${i}">Catch!</button>` : ""}</div>`;
    }).join("");
    const under = S.discard.slice(-3, -1).map((id, k) => cardHTML(id, { attrs: `style="transform:rotate(${((id * 37) % 24) - 12}deg)"` })).join("");
    const canDraw = myTurn && (S.stack > 0 || S.drew == null);
    let say = "", btns = "";
    if (S.status === "play") {
      if (myTurn) {
        if (S.stack > 0) { say = `Hit for +${S.stack}!<small>Stack a ${S.stackKind === "d2" ? "Bounty (+2) or Haki (+4)" : "Haki (+4)"} to pass it on, or take all ${S.stack}.</small>`; btns = `<button class="ubtn go" data-u="draw">Take ${S.stack} cards</button>`; }
        else if (S.drew != null) { say = `You drew a card that fits<small>Play it now, or keep it and end your turn.</small>`; btns = `<button class="ubtn go" data-u="play" data-id="${S.drew}">Play it</button><button class="ubtn" data-u="pass">Keep it</button>`; }
        else { say = `Your turn<small>Match ${col ? `<b style="color:${col.hex}">${col.n}</b>` : "the colour"} or the symbol, play a Wild, or draw.</small>`; btns = `<button class="ubtn" data-u="draw">Draw a card</button>`; }
        if (P.hand.length === 2) btns += `<button class="ubtn uno" data-u="arm" aria-pressed="${ui.uno}">${ui.uno ? "UNO called!" : "UNO!"}</button>`;
      } else if (v >= 0) say = `${esc(nameOf(S.turn))} is on turn<small>${S.stack > 0 ? `They face +${S.stack}.` : "Watch for anyone who forgets to call UNO."}</small>`;
      else say = `You're watching<small>${esc(nameOf(S.turn))} is on turn.</small>`;
      if (S.unoMiss === v && v >= 0) btns = `<button class="ubtn uno loud" data-u="uno">UNO!</button>` + btns;
      else if (S.unoMiss != null && v >= 0) btns = `<button class="ubtn go" data-u="catch" data-p="${S.unoMiss}">Catch ${esc(nameOf(S.unoMiss))}!</button>` + btns;
      if (S.clock && myTurn) btns += `<span class="uclock tclock">⏳ <b data-clock="turn">1:00</b></span>`;
    }
    const hand = P ? sortHand(P.hand) : [];
    const handHTML = hand.map(id => { const ok = myTurn && U.playable(S, id) && (S.drew == null || S.drew === id);
      return cardHTML(id, { tag: "button", cls: `${myTurn ? (ok ? "ok" : "no") : ""}${S.drew === id ? " justdrew" : ""}`, attrs: `data-u="play" data-id="${id}" ${ok ? "" : 'aria-disabled="true"'}` }); }).join("");
    const ov = hand.length > 14 ? -46 : hand.length > 9 ? -34 : hand.length > 6 ? -24 : -12;
    const last = S.log[S.log.length - 1] || "";
    $app.innerHTML = `<div class="ugame">
      <header class="board"><div class="board-top"><span class="mark">Grand Line UNO</span><span class="tcode"><span class="tl2">Table </span><b>${esc(S.code)}</b></span><span class="grow"></span>${netDown ? `<span class="conn">Reconnecting…</span>` : ""}${sndBtn()}<button class="btn ghost small" data-a="home">Leave table</button></div>
        <div class="uticker">${fmt(last)}</div></header>
      <section class="udeck${n >= 7 ? " many" : ""}" aria-label="The table">
        ${seats}
        <div class="ucenter">
          <div class="upile">${cardHTML(-1, { tag: canDraw ? "button" : "div", cls: canDraw ? "drawme" : "", attrs: canDraw ? `data-u="draw" aria-label="Draw"` : "" })}<span class="cnt">${S.deck.length} in deck</span></div>
          <div class="upile"><div class="udisc" style="--cur:${col ? col.hex : "#fff"}">
            <svg class="udir${S.dir < 0 ? " ccw" : ""}" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4a46 46 0 0 1 40 23" stroke="#ffe9b5" stroke-width="2.4" fill="none"/><path d="M91 20l-1 9-8-3z" fill="#ffe9b5"/><path d="M50 96a46 46 0 0 1-40-23" stroke="#ffe9b5" stroke-width="2.4" fill="none"/><path d="M9 80l1-9 8 3z" fill="#ffe9b5"/></svg>
            <span class="ucompass"></span>${under}${cardHTML(topId, { cls: "top" })}${S.stack > 0 ? `<span class="ustack">+${S.stack}</span>` : ""}
            <span class="ucolname">${col ? `${col.n}<span class="sea"> · ${col.sea}</span>` : ""}</span></div></div>
        </div>
      </section>
      ${v >= 0 ? `<section class="ume${myTurn ? " live" : ""}"><div class="ubar"><p class="say">${say}</p>${btns}</div>
        <div class="uhand${myTurn ? " mine-turn" : ""}" style="--ov:${ov}px">${handHTML || `<p class="muted">No cards left.</p>`}</div></section>`
        : `<section class="ume"><div class="ubar"><p class="say">${say}</p></div></section>`}
      ${ui.pick != null ? pickHTML() : ""}
      ${S.status === "over" ? winHTML(v) : ""}
    </div>`;
    motion(v);
  }
  function pickHTML() {
    return `<div class="upick" role="dialog" aria-label="Choose a colour"><div class="box"><h3>Choose the next colour</h3><div class="cols">
      ${U.COLOR_KEYS.map(c => `<button data-u="col" data-c="${c}" style="background:${U.COLORS[c].hex}">${U.COLORS[c].n}<small>${U.COLORS[c].sea}</small></button>`).join("")}</div>
      <button class="cancel" data-u="nopick">Cancel</button></div></div>`;
  }
  function winHTML(v) {
    const w = S.winner, aw = (S.awards || []).slice().sort((a, b) => a.place - b.place);
    return `<div class="uwin"><div class="poster"><div class="w">WANTED</div><div class="bty">Winner of the voyage</div><div class="who">${w === v ? "You" : esc(nameOf(w))}</div>
      ${aw.length ? `<ol>${aw.map(a => `<li><b>${a.place}</b><span>${a.p === v ? "You" : esc(nameOf(a.p))}<small>${a.place === 1 ? "Emptied their hand" : `${a.left} points left in hand`} · ${a.played} cards played</small></span>
        <span class="xp">+${a.xp} EXP${a.level ? `<small>Level ${a.level}${a.levelUp ? ` <span class="lvup">Level up!</span>` : ""}</small>` : ""}</span></li>`).join("")}</ol>` : ""}
      <div class="row">${S.host === me ? `<button class="btn primary" data-a="again">Set sail again</button>` : `<span class="muted">The table owner can start a rematch.</span>`}<button class="btn" data-a="home">Leave table</button></div></div></div>`;
  }

  // ---- motion and sound: compare this state with the last one ----
  function motion(v) {
    const snap = { code: S.code, created: S.created, status: S.status, turn: S.turn, last: S.last ? JSON.stringify(S.last) : "", hand: v >= 0 ? S.players[v].hand.slice() : [] };
    const prev = ui.prev, same = prev && prev.code === snap.code && prev.created === snap.created;
    ui.prev = snap;
    if (!same) return;
    const calm = noMotion(), L = S.last;
    if (snap.last !== prev.last && L) {
      const disc = box(document.querySelector(".udisc .top")), pile = box(document.querySelector(".upile .ucard.back")), seat = i => box(document.querySelector(`.useat[data-p="${i}"] .flag`));
      if (L.k === "play") {
        const c = U.card(L.card), from = L.p === v && ui.rects.get(L.card) ? ui.rects.get(L.card).rect : seat(L.p);
        const top = document.querySelector(".udisc .top");
        if (!calm && from && disc && top) { top.style.opacity = "0"; ghost(cardHTML(L.card), from, disc, { w: disc.width, h: disc.height, end: 1, mid: 1.15, spin: 16, arc: 60, dur: 520, land: () => { top.style.opacity = ""; top.animate([{ transform: "scale(1.25)", filter: "brightness(1.8)" }, { transform: "none", filter: "none" }], { duration: 360, easing: "ease-out" }); } }); }
        if (window.Sfx) Sfx.place();
        const K = U.KINDS[c.v], who = nameOf(L.p), colr = U.COLORS[L.col] ? U.COLORS[L.col].hex : "#ffd23f";
        if (K) {
          const sub = c.v === "skip" ? `${who} fires at the next player` : c.v === "rev" ? "The course turns around" : c.v === "d2" ? `The bounty stands at +${S.stack}` : c.v === "w4" ? `+${S.stack} · the sea turns ${U.COLORS[L.col].n}` : `The sea turns ${U.COLORS[L.col].n}`;
          if (window.CutIn) CutIn.banner(`${K.alias}!`, sub, colr);
          if (window.Sfx) setTimeout(() => Sfx.spell("u-" + c.v, { targets: c.v === "rev" || c.v === "wild" ? 0 : 1 }), 120);
          if (!calm && disc) burst(disc, colr, c.v === "w4" ? 30 : 18);
        }
      } else if (L.k === "draw") {
        if (window.Sfx) Sfx.draw(Math.min(L.count, 5));
        const to = L.p === v ? box(document.querySelector(".uhand")) : seat(L.p);
        if (!calm && pile && to) for (let k = 0; k < Math.min(L.count, 6); k++) ghost(cardHTML(-1), pile, to, { w: pile.width, h: pile.height, end: .4, delay: k * 90, dur: 560, arc: 40, fade: true });
        if (L.count >= 4 && !calm && to) floatText(to, `+${L.count}`, "#ff6b6b");
      } else if (L.k === "catch") {
        if (window.CutIn) CutIn.banner("Caught!", `${nameOf(L.q)} forgot to call UNO · +2`, "#ffd23f");
        if (window.Sfx) Sfx.error();
      } else if (L.k === "uno") {
        if (window.CutIn) CutIn.banner("UNO!", `${nameOf(L.p)} has one card left`, "#c8281e");
        if (window.Sfx) Sfx.set();
      }
    }
    // an UNO called together with the play
    if (snap.last !== prev.last && L && L.k === "play" && S.players[L.p].hand.length === 1 && S.unoMiss !== L.p && window.CutIn) CutIn.banner("UNO!", `${nameOf(L.p)} has one card left`, "#c8281e");
    if (snap.status === "play" && snap.turn !== prev.turn) {
      if (snap.turn === v) { if (window.CutIn) CutIn.banner("Your turn", S.stack > 0 ? `Facing +${S.stack}` : "", "#c8281e"); }
      else if (window.Sfx) Sfx.turnOther();
      if (!calm) { const fl = document.querySelector(`.useat[data-p="${snap.turn}"] .flag`); if (fl) fl.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 600, easing: "cubic-bezier(.3,.7,.2,1)" }); }
    }
    // new cards in my hand slide up from the deck
    const added = snap.hand.filter(id => !prev.hand.includes(id)), pile = box(document.querySelector(".upile .ucard.back"));
    if (!calm && pile) added.forEach((id, k) => { const el = document.querySelector(`.uhand .ucard[data-id="${id}"]`); if (!el) return; const r = box(el);
      el.animate([{ transform: `translate(${pile.left - r.left}px,${pile.top - r.top}px) scale(.6) rotateY(180deg)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 600, delay: k * 90, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }); });
    if (snap.status === "over" && prev.status !== "over") { fireworks(["#ffd23f", "#c8281e", "#1f6fd1", "#2f9a52", "#fff3c8"]); if (window.Sfx) setTimeout(() => Sfx.win(S.winner === v), 300); }
  }

  // ---- clicks ----
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-u]"); if (!b || !S || S.kind !== "uno") return;
    const d = b.dataset, v = mySeat();
    if (window.Sfx) Sfx.tap();
    switch (d.u) {
      case "play": {
        const id = +d.id;
        if (S.turn !== v || !U.playable(S, id) || (S.drew != null && S.drew !== id)) { if (S.turn === v) { flash(S.stack > 0 ? `Stack a draw card or take ${S.stack}.` : "That card doesn't match."); if (window.Sfx) Sfx.error(); } return; }
        if (U.card(id).c === "w") { ui.pick = id; return render(); }
        return send({ t: "play", card: id, uno: ui.uno });
      }
      case "col": { const id = ui.pick; ui.pick = null; render(); return send({ t: "play", card: id, col: d.c, uno: ui.uno }); }
      case "nopick": ui.pick = null; return render();
      case "draw": return send({ t: "draw" });
      case "pass": return send({ t: "pass" });
      case "arm": ui.uno = !ui.uno; if (ui.uno && window.Sfx) Sfx.set(); return render();
      case "uno": return send({ t: "uno" });
      case "catch": return send({ t: "catch", p: +d.p });
    }
  });
  async function send(action) { await act(action); ui.uno = false; }

  window.UnoUI = { render, mastHTML, rulesHTML, cardHTML, reset() { ui.prev = null; ui.pick = null; ui.uno = false; } };
})();
