/* Nasi Lemak: the table screen, home masthead and rules. A night-market hawker stall:
   banana-leaf green, sambal red, coconut cream and turmeric, with drawn ingredient icons.
   Uses the page's shared helpers: S, me, mySeat, nameOf, esc, fmt, act, call, flash, netDown, sndBtn, $app. */
(function () {
  "use strict";
  const N = window.Nasi;
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Bungee&family=Figtree:wght@400;600;800&display=swap";
  document.head.appendChild(font);

  const css = document.createElement("style");
  css.textContent = `
  html[data-game=nasi]{--nl-night:#14100b;--nl-wood:#2a1d12;--nl-leaf:#2f6b3a;--nl-leaf2:#1d4a28;--nl-sambal:#c8372d;--nl-cream:#f6efdf;--nl-ink:#2a1a10;
    --nl-turmeric:#e3a72f;--nl-text:#f6efdf;--nl-muted:#cdbfa6;--nl-line:#4a3624;color-scheme:dark}
  html[data-game=nasi] body{background:radial-gradient(ellipse 90% 60% at 50% -10%,#4a2a14 0%,var(--nl-night) 60%) fixed,var(--nl-night)}
  html[data-game=nasi] #sky{display:none}
  .nl{font-family:"Figtree","Segoe UI",system-ui,sans-serif;color:var(--nl-text)}
  .nl h1,.nl h2,.nl h3,.nl .mark{font-family:"Bungee","Arial Black",system-ui,sans-serif;font-weight:400;letter-spacing:.01em;margin:0;line-height:1.05}
  .nl ::selection{background:var(--nl-turmeric);color:var(--nl-ink)}
  .nl-top{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;padding-block:1rem;border-bottom:1px dashed var(--nl-line)}
  .nl-top .mark{font-size:1.35rem;color:var(--nl-turmeric)}
  .nl-top .grow{flex:1}
  .nl-code{font-weight:800;letter-spacing:.18em;color:var(--nl-muted)}
  .nl-ticker{margin:.75rem 0 0;font-size:.92rem;color:var(--nl-muted)}
  .nl-ticker b{color:var(--nl-text)}
  .nl-btn{appearance:none;border:1px solid var(--nl-line);background:#3a2817;color:var(--nl-text);border-radius:10px;padding:.6rem 1rem;font:800 .95rem/1 "Figtree",system-ui,sans-serif;cursor:pointer}
  .nl-btn:hover:not(:disabled){border-color:var(--nl-turmeric)}
  .nl-btn.go{background:var(--nl-turmeric);color:var(--nl-ink);border-color:var(--nl-turmeric)}
  .nl-btn.red{background:var(--nl-sambal);border-color:var(--nl-sambal);color:#fff}
  .nl-btn.small{padding:.4rem .7rem;font-size:.85rem}
  .nl-btn:disabled{opacity:.45;cursor:not-allowed}
  .nl-btn:focus-visible,.nl-card:focus-visible,.nl-opt:focus-visible{outline:2px solid var(--nl-turmeric);outline-offset:2px}
  .nl-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
  .nl-muted{color:var(--nl-muted)}
  /* the night market: every player's hawker stall in a ring around the shared banana-leaf table */
  .nl-market{position:relative;height:clamp(34rem,72vh,44rem);margin-top:1rem}
  .nl-felt{position:absolute;inset:24% 20%;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;text-align:center;padding:1rem 1.6rem;
    background:radial-gradient(ellipse at 50% 45%,#4a9a55 0%,var(--nl-leaf) 45%,var(--nl-leaf2) 82%);border:14px solid #6b4423;
    box-shadow:inset 0 0 50px rgba(0,0,0,.45),0 30px 50px -30px rgba(0,0,0,.9)}
  .nl-felt::after{content:"";position:absolute;inset:8px;border-radius:50%;border:1px dashed rgba(207,233,192,.35);pointer-events:none}
  .nl-stall{position:absolute;transform:translate(-50%,-50%);width:clamp(9.5rem,16vw,12.5rem);display:flex;flex-direction:column;z-index:1;filter:drop-shadow(0 14px 18px rgba(0,0,0,.55))}
  .nl-market.many .nl-stall{width:clamp(8.5rem,12.5vw,10.5rem)}
  /* striped awning with a scalloped edge */
  .nl-awning{height:1.6rem;border-radius:8px 8px 0 0;background:repeating-linear-gradient(90deg,var(--awn) 0 14px,var(--nl-cream) 14px 28px);
    -webkit-mask:radial-gradient(circle 7px at 7px 100%,transparent 6.5px,#000 7px) 0 0/14px 100% repeat-x;mask:radial-gradient(circle 7px at 7px 100%,transparent 6.5px,#000 7px) 0 0/14px 100% repeat-x}
  .nl-sign{margin:-.15rem .5rem 0;padding:.25rem .5rem;border-radius:4px;background:var(--nl-cream);color:var(--nl-ink);text-align:center;display:flex;flex-direction:column;align-items:center;
    box-shadow:0 0 0 2px #6b4423 inset}
  .nl-sign b{font-family:"Bungee","Arial Black",sans-serif;font-weight:400;font-size:.82rem;line-height:1.15;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .nl-open{font:800 .62rem/1 "Figtree",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:var(--nl-sambal);border-radius:3px;padding:.15rem .35rem;margin-top:.15rem}
  .nl-counter{position:relative;margin-top:.55rem;padding:.45rem .5rem .5rem;border-radius:0 0 10px 10px;
    background:repeating-linear-gradient(90deg,#4a3220 0 22px,#432d1c 22px 44px);display:flex;flex-direction:column;gap:.3rem}
  .nl-counter::before{content:"";position:absolute;left:-.2rem;right:-.2rem;top:-.35rem;height:.4rem;border-radius:3px;background:#8a5a2e}
  .nl-stall.on .nl-counter{box-shadow:0 0 0 2px var(--nl-turmeric),0 0 24px -4px rgba(227,167,47,.7)}
  .nl-stall.wait .nl-counter{box-shadow:0 0 0 2px var(--nl-sambal)}
  .nl-stall.me .nl-sign{background:#fff6dc}
  .nl-stall .nl-pack{width:2.2rem;height:2.1rem}
  .nl-stall .nl-packs{min-height:2.1rem;gap:.25rem}
  .nl-stall .nl-pack .cnt{display:none}
  .nl-stall .nl-empty{font-size:.75rem;margin:0}
  .nl-stall .nl-stats{font-size:.72rem}
  @media (max-width:760px){.nl-market{height:auto;display:flex;flex-wrap:wrap;gap:.7rem}
    .nl-felt{position:relative;inset:auto;flex:1 1 100%;border-radius:24px;min-height:11rem;order:-1;border-width:8px}
    .nl-market .nl-stall,.nl-market.many .nl-stall{position:static;transform:none;width:calc(50% - .35rem)}}
  .nl-who{display:flex;align-items:baseline;gap:.5rem;margin-top:.35rem;min-width:0}
  .nl-who b{font-size:1.05rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .nl-who span{font-size:.8rem;color:var(--nl-muted);white-space:nowrap}
  .nl-stats{display:flex;flex-wrap:wrap;gap:.3rem;font-size:.8rem;font-variant-numeric:tabular-nums}
  .nl-stats span{background:rgba(0,0,0,.25);border-radius:999px;padding:.15rem .55rem;color:var(--nl-muted)}
  .nl-stats b{color:var(--nl-text)}
  .nl-packs{display:flex;flex-wrap:wrap;gap:.4rem;min-height:3rem;align-items:flex-end}
  .nl-pack{position:relative;width:3.1rem;height:3rem;flex:none}
  .nl-pack svg{width:100%;height:100%;filter:drop-shadow(0 6px 8px rgba(0,0,0,.45))}
  .nl-pack .cnt{position:absolute;right:-.3rem;top:-.3rem;min-width:1.25rem;height:1.25rem;border-radius:999px;background:var(--nl-cream);color:var(--nl-ink);font:800 .72rem/1.25rem "Figtree",sans-serif;text-align:center;padding:0 .2rem}
  .nl-pack.flied svg{filter:grayscale(.7) brightness(.7) drop-shadow(0 6px 8px rgba(0,0,0,.45))}
  .nl-pack .fly{position:absolute;left:50%;top:40%;width:1.6rem;height:1.6rem;transform:translate(-50%,-50%)}
  .nl-empty{font-size:.85rem;color:var(--nl-muted)}
  .nl-piles{display:flex;gap:.9rem;align-items:flex-end}
  .nl-pile{display:flex;flex-direction:column;align-items:center;gap:.25rem;font-size:.78rem;color:#dfe9d6;font-variant-numeric:tabular-nums}
  .nl-back{width:3.6rem;height:5rem;border-radius:8px;display:grid;place-items:center;font:800 1rem/1 "Figtree",sans-serif;color:var(--nl-cream);
    background:radial-gradient(circle at 50% 40%,#3c8a4a 0%,#1d4a28 75%);border:2px solid #9bc88f;box-shadow:0 10px 16px -10px rgba(0,0,0,.7)}
  .nl-back.gold{background:radial-gradient(circle at 50% 40%,#f1c75a 0%,#a97416 75%);border-color:#ffe39b;color:var(--nl-ink)}
  .nl-say{font-family:"Bungee","Arial Black",sans-serif;font-size:clamp(1.2rem,3vw,1.7rem);line-height:1.1;color:#fff}
  .nl-sub{font-size:.9rem;color:#dfe9d6;margin-top:.25rem}
  .nl-dots{display:inline-flex;gap:5px;vertical-align:middle;margin-left:.4rem}
  .nl-dots i{width:.65rem;height:.65rem;border-radius:50%;border:1.5px solid var(--nl-turmeric)}
  .nl-dots i.used{background:var(--nl-turmeric)}
  /* your stall */
  .nl-zone{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,24rem);grid-template-areas:"mine panel" "hand hand";gap:1rem;margin-top:1rem}
  .nl-mine{grid-area:mine;min-width:0}
  .nl-panel{grid-area:panel;align-self:start;background:#2a1d12;border:1px solid var(--nl-turmeric);border-radius:14px;padding:1rem;display:flex;flex-direction:column;gap:.7rem;min-width:0}
  .nl-panel h3{font-size:1.15rem;color:var(--nl-turmeric)}
  .nl-opts{display:flex;flex-direction:column;gap:.4rem}
  .nl-opt{appearance:none;text-align:left;background:#3a2817;color:var(--nl-text);border:1px solid var(--nl-line);border-radius:10px;padding:.55rem .75rem;font:600 .95rem/1.3 "Figtree",sans-serif;cursor:pointer}
  .nl-opt:hover:not(:disabled){border-color:var(--nl-turmeric)}
  .nl-opt:disabled{opacity:.45;cursor:not-allowed}
  .nl-opt small{display:block;color:var(--nl-muted);font-weight:400;font-size:.8rem}
  .nl-handwrap{grid-area:hand;min-width:0}
  .nl-hand{display:flex;gap:.55rem;overflow-x:auto;padding:.7rem .2rem 1rem}
  .nl-score{font-family:"Bungee",sans-serif;font-size:1.4rem;color:var(--nl-turmeric)}
  .nl-score small{font-family:"Figtree",sans-serif;font-size:.9rem;color:var(--nl-muted)}
  @media (max-width:820px){.nl-zone{grid-template-columns:minmax(0,1fr);grid-template-areas:"panel" "hand" "mine"}}
  /* cards */
  .nl-card{appearance:none;flex:none;position:relative;width:6.6rem;min-height:9rem;border-radius:12px;padding:.45rem .5rem .55rem;display:flex;flex-direction:column;align-items:center;gap:.2rem;text-align:center;
    background:var(--nl-cream);color:var(--nl-ink);border:2px solid transparent;font:600 .78rem/1.15 "Figtree",sans-serif;cursor:pointer;transition:transform .15s,border-color .15s;box-shadow:0 10px 18px -12px rgba(0,0,0,.8)}
  .nl-card::before{content:"";position:absolute;inset:0 0 auto 0;height:.55rem;border-radius:10px 10px 0 0;background:var(--band,var(--nl-leaf))}
  .nl-card.act{background:#fbe9c8}
  .nl-card svg{width:4.2rem;height:4.2rem;margin-top:.45rem}
  .nl-card b{font-family:"Bungee",sans-serif;font-weight:400;font-size:.78rem;line-height:1.1}
  .nl-card i{font-style:normal;font-size:.7rem;opacity:.7}
  button.nl-card:hover{transform:translateY(-4px)}
  .nl-card.sel{border-color:var(--nl-turmeric);transform:translateY(-10px)}
  .nl-card.give{border-color:var(--nl-sambal);transform:translateY(-10px)}
  .nl-card.small{width:3.6rem;min-height:5rem;padding:.25rem;cursor:default}
  .nl-card.small svg{width:2.3rem;height:2.3rem;margin-top:.35rem}
  .nl-card.small b{font-size:.55rem}
  .nl-card.small i{display:none}
  .nl-steps{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:.3rem .5rem;align-items:center;font-size:.9rem}
  .nl-steps button{width:2rem;height:2rem;padding:0}
  .nl-win{text-align:center;padding:1.6rem 1rem;margin-top:1rem;border-radius:16px;border:1px solid var(--nl-turmeric);background:#2a1d12;display:flex;flex-direction:column;gap:.7rem;align-items:center}
  .nl-win h2{font-size:clamp(1.8rem,6vw,3rem);color:var(--nl-turmeric)}
  .nl-log{margin-top:1.2rem;padding:.8rem 1rem;border-radius:14px;background:#1d150d;border:1px solid var(--nl-line)}
  .nl-log ol{list-style:none;margin:.5rem 0 0;padding:0;display:flex;flex-direction:column-reverse;gap:.2rem;font-size:.88rem;color:var(--nl-muted);max-height:11rem;overflow:auto}
  .nl-log b{color:var(--nl-text)}
  .nl-cap{font:800 .7rem/1 "Figtree",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--nl-turmeric)}
  /* home */
  .nl-mast{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:1.5rem;align-items:center;padding-block:2.2rem 1.6rem}
  .nl-mast h1{font-size:clamp(2.6rem,9vw,5.2rem);color:var(--nl-cream)}
  .nl-mast h1 span{display:block;color:var(--nl-sambal)}
  .nl-mast p{max-width:58ch;color:var(--nl-muted);font-size:1.05rem;margin-top:.8rem}
  .nl-mastfan{display:flex;justify-content:center}
  .nl-mastfan .nl-card{cursor:default;margin-left:-1.6rem}
  .nl-mastfan .nl-card:first-child{margin-left:0}
  .nl-mastfan .nl-card:nth-child(odd){transform:rotate(-6deg)}
  .nl-mastfan .nl-card:nth-child(even){transform:rotate(5deg) translateY(-.4rem)}
  @media (max-width:760px){.nl-mast{grid-template-columns:minmax(0,1fr)}.nl-mastfan{display:none}}
  .nl-rules{margin-top:2rem;border:1px solid var(--nl-line);border-radius:14px;padding:0 1.2rem;background:#1d150d}
  .nl-rules summary{cursor:pointer;padding:1rem 0;font-family:"Bungee",sans-serif;font-size:1.15rem;color:var(--nl-turmeric)}
  .nl-rules .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr));gap:1.2rem;padding-bottom:1.2rem}
  .nl-rules h3{font-size:1rem;color:var(--nl-cream);margin-bottom:.4rem}
  .nl-rules li{font-size:.92rem;margin-bottom:.35rem;color:var(--nl-muted)}
  .nl-rules li b{color:var(--nl-text)}
  html[data-game=nasi] .pz-bar{left:auto;right:16px}
  .gamepick{max-width:46rem;flex-wrap:wrap}
  .gamepick button{min-width:min(100%,12rem)}
  .gamepick .gp-nasi b{font-family:"Bungee","Arial Black",sans-serif;font-size:1.1rem}
  @media (prefers-reduced-motion:reduce){.nl-card{transition:none}}`;
  document.head.appendChild(css);

  // ---- drawn icons (one stroke family, filled shapes) ----
  const ICON = {
    rice: `<ellipse cx="32" cy="44" rx="22" ry="8" fill="#e9e2cf"/><path d="M12 42c2-14 12-22 20-22s18 8 20 22z" fill="#fffdf6" stroke="#c9bfa6" stroke-width="1.5"/><g fill="#e9e2cf"><ellipse cx="25" cy="31" rx="2" ry="1"/><ellipse cx="33" cy="27" rx="2" ry="1"/><ellipse cx="40" cy="33" rx="2" ry="1"/><ellipse cx="29" cy="37" rx="2" ry="1"/></g>`,
    egg: `<ellipse cx="32" cy="34" rx="18" ry="22" fill="#fffdf6" stroke="#d9cfb8" stroke-width="1.5"/><circle cx="32" cy="36" r="9" fill="#f2a524"/><circle cx="29" cy="33" r="2.5" fill="#ffd27a"/>`,
    peanut: `<g transform="rotate(-25 32 32)"><path d="M32 10c8 0 11 7 9 13-1 4 2 7 2 12 0 10-6 17-11 17s-11-7-11-17c0-5 3-8 2-12-2-6 1-13 9-13z" fill="#d9a35b" stroke="#a8742f" stroke-width="1.5"/><path d="M26 22h12M25 33h14M27 43h10" stroke="#a8742f" stroke-width="1.4" stroke-linecap="round"/></g>`,
    sambal: `<path d="M10 40c0-12 10-20 22-20s22 8 22 20c0 7-10 10-22 10S10 47 10 40z" fill="#c8372d"/><path d="M16 36c4-6 10-9 16-9" stroke="#e86a4c" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#f1d7a8"><path d="M22 40l8-3 1 2-8 3z"/><path d="M34 42l9-2v2l-9 2z"/><path d="M28 34l7 1-1 2-7-1z"/></g>`,
    cucumber: `<circle cx="24" cy="36" r="14" fill="#5e9e3c"/><circle cx="24" cy="36" r="11" fill="#d7efb5"/><circle cx="40" cy="28" r="14" fill="#5e9e3c"/><circle cx="40" cy="28" r="11" fill="#d7efb5"/><g fill="#9cc56a"><circle cx="40" cy="25" r="1.5"/><circle cx="37" cy="30" r="1.5"/><circle cx="43" cy="31" r="1.5"/><circle cx="24" cy="33" r="1.5"/><circle cx="21" cy="38" r="1.5"/><circle cx="27" cy="39" r="1.5"/></g>`,
    supplier: `<rect x="12" y="24" width="40" height="26" rx="3" fill="#a8742f"/><path d="M12 32h40M12 42h40M24 24v26M40 24v26" stroke="#7a5220" stroke-width="2"/><path d="M22 24l10-10 10 10" fill="none" stroke="#2f6b3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    thief: `<circle cx="32" cy="32" r="18" fill="#3a2a1f"/><path d="M14 30h36v8H14z" fill="#141010"/><circle cx="25" cy="34" r="2.6" fill="#fff"/><circle cx="39" cy="34" r="2.6" fill="#fff"/><path d="M20 18c6-6 18-6 24 0" stroke="#141010" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    wholesaler: `<rect x="8" y="30" width="22" height="20" rx="2" fill="#c98f3f"/><rect x="34" y="30" width="22" height="20" rx="2" fill="#a8742f"/><rect x="20" y="12" width="22" height="18" rx="2" fill="#d9a35b"/><path d="M19 30v20M45 30v20M31 12v18" stroke="#7a5220" stroke-width="2"/>`,
    officer: `<path d="M14 26l18-10 18 10-4 6H18z" fill="#1f3b6e"/><rect x="18" y="31" width="28" height="5" fill="#16294c"/><circle cx="32" cy="22" r="3.5" fill="#e3a72f"/><circle cx="32" cy="46" r="9" fill="#e9c49e"/>`,
    makcik: `<path d="M14 54c0-14 8-26 18-26s18 12 18 26z" fill="#2f6b3a"/><circle cx="32" cy="28" r="11" fill="#e2b98f"/><path d="M19 30c0-12 6-18 13-18s13 6 13 18c-3-6-8-9-13-9s-10 3-13 9z" fill="#c8372d"/><path d="M27 31q5 4 10 0" stroke="#6b3b22" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
    fly: `<ellipse cx="22" cy="24" rx="10" ry="6" fill="#cfe6f5" opacity=".85" transform="rotate(-30 22 24)"/><ellipse cx="42" cy="24" rx="10" ry="6" fill="#cfe6f5" opacity=".85" transform="rotate(30 42 24)"/><ellipse cx="32" cy="36" rx="8" ry="12" fill="#1d2420"/><circle cx="32" cy="24" r="6" fill="#1d2420"/><circle cx="29" cy="23" r="2.2" fill="#b3261e"/><circle cx="35" cy="23" r="2.2" fill="#b3261e"/>`,
    swatter: `<rect x="14" y="10" width="26" height="26" rx="4" fill="#d94a3a" transform="rotate(-20 27 23)"/><g stroke="#a12f22" stroke-width="1.5" transform="rotate(-20 27 23)"><path d="M14 19h26M14 27h26M23 10v26M31 10v26"/></g><path d="M33 38l14 16" stroke="#7a5220" stroke-width="4" stroke-linecap="round"/>`,
    fan: `<path d="M32 46L14 20a26 26 0 0 1 36 0z" fill="#e3a72f"/><path d="M32 46L20 18M32 46V16M32 46l12-28" stroke="#a8742f" stroke-width="1.6"/><path d="M14 20a26 26 0 0 1 36 0" fill="none" stroke="#c8372d" stroke-width="3"/><path d="M32 46v10" stroke="#7a5220" stroke-width="4" stroke-linecap="round"/>`
  };
  // each stall's awning colour: sambal red, pandan green, turmeric, bunga telang blue, teh tarik brown
  const AWNING = ["#c8372d", "#3f8a4c", "#e3a72f", "#3d5fbf", "#9a5a2e"];
  const BAND = { rice: "#e9e2cf", egg: "#f2a524", peanut: "#d9a35b", sambal: "#c8372d", cucumber: "#5e9e3c" };
  const svg = (t, cls) => `<svg viewBox="0 0 64 64" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${ICON[t] || ""}</svg>`;
  const parcel = (packs, show) => `<svg viewBox="0 0 64 60" aria-hidden="true"><path d="M8 40l24-30 24 30-24 16z" fill="#2f6b3a"/><path d="M8 40l24 16 24-16-24-8z" fill="#3f8a4c"/><path d="M32 10v22" stroke="#1d4a28" stroke-width="2"/><path d="M14 36l18-6 18 6" stroke="#cfe9c0" stroke-width="2" fill="none"/><rect x="28" y="22" width="8" height="18" fill="#f6efdf" opacity=".9"/>${show ? `<text x="32" y="36" text-anchor="middle" font-family="Figtree,sans-serif" font-weight="800" font-size="11" fill="#2a1a10">${packs}</text>` : ""}</svg>`;

  function cardHTML(id, o = {}) {
    if (id == null || id < 0) return `<div class="nl-back">?</div>`;
    const t = N.typeOf(id), ing = N.ING[t], A = N.ACTIONS[t];
    const tag = o.tag || "div";
    return `<${tag} class="nl-card ${ing ? "ing" : "act"} ${o.cls || ""}" style="--band:${ing ? BAND[t] : t === "fly" ? "#1d2420" : "#c8372d"}" ${o.attrs || ""}>${svg(t)}<b>${esc(ing ? ing.n : A.n)}</b><i>${esc(ing ? ing.ms : A.ms)}</i></${tag}>`;
  }
  const packsHTML = (p, mine) => p.nl.length ? `<div class="nl-packs">${p.nl.map((e, k) => `<span class="nl-pack${e.fly != null ? " flied" : ""}" title="${e.fly != null ? "A fly is on this Nasi Lemak: it doesn't count" : mine || e.n >= 0 ? N.packsOf(e.n) + " pack" + (N.packsOf(e.n) > 1 ? "s" : "") : "Face down"}">${parcel(e.n >= 0 ? N.packsOf(e.n) : "", e.n >= 0)}${e.fly != null ? svg("fly", "fly") : ""}<span class="cnt">${k + 1}</span></span>`).join("")}</div>` : `<p class="nl-empty">No Nasi Lemak yet.</p>`;

  const ui = { sel: null, step: {}, trade: null, take: [], key: "" };
  function reset() { ui.sel = null; ui.step = {}; ui.trade = null; ui.take = []; ui.key = ""; }
  const opt = (a, data, label, sub, dis) => `<button class="nl-opt" data-n="${a}" ${Object.entries(data).map(([k, x]) => `data-${k}="${esc(x)}"`).join(" ")}${dis ? " disabled" : ""}>${label}${sub ? `<small>${sub}</small>` : ""}</button>`;
  const others = v => S.players.map((_, i) => i).filter(i => i !== v);
  const nm = (i, v) => i === v ? "you" : nameOf(i);
  const ingsOf = P => { const by = {}; P.hand.filter(N.isIng).forEach(id => { (by[N.typeOf(id)] = by[N.typeOf(id)] || []).push(id); }); return by; };
  const countIn = (P, t) => P.hand.filter(id => N.typeOf(id) === t).length;

  function panelHTML(v) {
    const P = S.players[v], pd = S.pending;
    if (S.status !== "play") return `<h3>Stalls closed</h3><p class="nl-muted">Thanks for playing.</p>`;
    if (pd && pd.k === "trade" && pd.to === v) {
      const T = S.players[pd.from];
      const can = pd.want.every(w => countIn(P, w.t) >= w.n);
      return `<h3>${esc(nameOf(pd.from))} wants to trade</h3>
        <p><b>They give you:</b> ${pd.give.length ? pd.give.map(id => esc(N.cardName(N.typeOf(id)))).join(", ") : "nothing"}</p>
        <p><b>They want:</b> ${pd.want.length ? pd.want.map(w => `${w.n} ${esc(N.cardName(w.t))}`).join(", ") : "nothing"}</p>
        ${can ? "" : `<p class="nl-muted">You don't have everything they're asking for.</p>`}
        <div class="nl-row"><button class="nl-btn go" data-n="answer" data-yes="1" ${can ? "" : "disabled"}>Accept</button><button class="nl-btn" data-n="answer" data-yes="0">Decline</button>
        ${S.clock && S.clock.resp ? `<span class="nl-muted">Answer within <b data-clock="resp">0:30</b></span>` : ""}</div>${T ? "" : ""}`;
    }
    if (S.turn !== v) {
      const w = pd && pd.k === "trade" ? `${esc(nameOf(pd.to))} is deciding on a trade with ${esc(nameOf(pd.from))}.` : `Your turn comes soon. Plan which ingredients you still need.`;
      return `<h3>${esc(nameOf(S.turn))}'s turn</h3><p class="nl-muted">${w}</p>`;
    }
    if (pd && pd.k === "trade") return `<h3>Waiting for ${esc(nameOf(pd.to))}</h3><p class="nl-muted">They have 30 seconds to accept or decline your offer.</p><div class="nl-row"><button class="nl-btn" data-n="cancel">Withdraw offer</button></div>`;
    if (pd && pd.k === "officer") {
      const hand = pd.hand || [], need = Math.min(2, hand.length);
      return `<h3>${esc(nameOf(pd.to))}'s hand</h3><p class="nl-muted">Only you can see these. Tap ${need} to take.</p>
        <div class="nl-hand" style="padding-top:.2rem">${hand.map(id => cardHTML(id, { tag: "button", cls: ui.take.includes(id) ? "sel" : "", attrs: `data-n="pick" data-id="${id}"` })).join("")}</div>
        <div class="nl-row"><button class="nl-btn go" data-n="take" ${ui.take.length === need ? "" : "disabled"}>Take ${need} card${need === 1 ? "" : "s"}</button></div>`;
    }
    if (!S.drew) return `<h3>Your turn</h3><p class="nl-muted">Start by drawing 2 cards. Drawing isn't one of your 3 moves.</p><div class="nl-row"><button class="nl-btn go" data-n="draw">Draw 2 cards</button></div>`;
    const left = N.MOVES - S.moves, end = `<button class="nl-btn" data-n="end">End turn</button>`;
    if (left <= 0) return `<h3>All 3 moves used</h3><p class="nl-muted">End your turn when you're ready.</p><div class="nl-row">${end}</div>`;
    if (ui.trade) return tradeHTML(v) ;
    if (ui.sel != null) return selectedHTML(v) + `<div class="nl-row"><button class="nl-btn small" data-n="unsel">Cancel</button>${end}</div>`;
    const by = ingsOf(P), types = Object.keys(by).length, mk = P.hand.find(id => N.typeOf(id) === "makcik");
    const missing = N.ING_KEYS.filter(t => !by[t]).map(t => N.ING[t].n);
    return `<h3>${left} move${left === 1 ? "" : "s"} left</h3>
      <div class="nl-opts">
        ${opt("make", {}, "Make a Nasi Lemak", types === 5 ? "Uses one of each ingredient" : `Still missing: ${missing.join(", ")}`, types < 5 || !S.nlPile.length)}
        ${mk != null ? opt("make", { mk }, "Make one with Mak Cik", types >= 3 ? "Uses Mak Cik plus 3 different ingredients" : "You need 3 different ingredients", types < 3 || !S.nlPile.length) : ""}
        ${opt("tradeopen", {}, "Trade with a player", "Offer ingredients, Fly Swatters or Fans")}
      </div>
      <p class="nl-muted" style="font-size:.88rem">Or tap an action card in your hand to play it.</p>
      <div class="nl-row">${end}</div>`;
  }

  function selectedHTML(v) {
    const P = S.players[v], id = ui.sel, t = N.typeOf(id), A = N.ACTIONS[t], st = ui.step;
    const head = `<h3>${esc(A.n)}</h3><p class="nl-muted" style="font-size:.9rem">${esc(A.d)}</p>`;
    const none = m => `<p class="nl-muted">${m}</p>`;
    let body = "";
    switch (t) {
      case "makcik": body = none("Use the “Make one with Mak Cik” button once you have 3 different ingredients."); break;
      case "supplier": body = N.ING_KEYS.map(k => opt("play", { ing: k }, `Call for ${esc(N.ING[k].n)}`, `You hold ${countIn(P, k)}`)).join(""); break;
      case "thief": body = opt("play", {}, "Send the Thief", "One random card from each other player"); break;
      case "wholesaler": body = opt("play", {}, "Call the Wholesaler", `${S.deck.length} cards in the draw pile`); break;
      case "officer": body = others(v).map(p => opt("play", { p }, `Inspect ${esc(nameOf(p))}`, `${S.players[p].hand.length} cards in hand`, !S.players[p].hand.length)).join(""); break;
      case "fly": {
        const list = []; others(v).forEach(p => S.players[p].nl.forEach((e, k) => { if (e.fly == null) list.push(opt("play", { p, slot: k }, `${esc(nameOf(p))} · Nasi Lemak ${k + 1}`, "Land the fly here")); }));
        body = list.join("") || none("Nobody has a Nasi Lemak without a fly yet.");
        break;
      }
      case "swatter": {
        const list = P.nl.map((e, k) => e.fly != null ? opt("play", { slot: k }, `Swat the fly off Nasi Lemak ${k + 1}`) : "").join("");
        body = list || none("None of your Nasi Lemak has a fly. Keep this for later.");
        break;
      }
      case "fan": {
        if (st.slot == null) { const list = P.nl.map((e, k) => e.fly != null ? opt("step", { slot: k }, `Fan the fly off Nasi Lemak ${k + 1}`) : "").join(""); body = list || none("None of your Nasi Lemak has a fly. Keep this for later."); }
        else { const list = []; others(v).forEach(p => S.players[p].nl.forEach((e, k) => { if (e.fly == null) list.push(opt("play", { slot: st.slot, p, to: k }, `Onto ${esc(nameOf(p))}'s Nasi Lemak ${k + 1}`)); }));
          body = list.join("") || none("Nobody else has a Nasi Lemak without a fly."); }
        break;
      }
    }
    return head + `<div class="nl-opts">${body}</div>`;
  }

  function tradeHTML(v) {
    const P = S.players[v], tr = ui.trade;
    const types = [...N.ING_KEYS, "swatter", "fan"];
    if (tr.p == null) return `<h3>Trade with…</h3><div class="nl-opts">${others(v).map(p => opt("tradeto", { p }, esc(nameOf(p)), `${S.players[p].hand.length} cards in hand`)).join("")}</div><div class="nl-row"><button class="nl-btn small" data-n="tradeclose">Cancel</button></div>`;
    const giveN = tr.give.length, wantN = Object.values(tr.want).reduce((a, b) => a + b, 0);
    return `<h3>Trade with ${esc(nameOf(tr.p))}</h3>
      <p class="nl-muted" style="font-size:.88rem"><b>You give:</b> tap ingredients, Fly Swatters or Fans in your hand. ${giveN ? `${giveN} picked.` : "Nothing picked yet."}</p>
      <p class="nl-muted" style="font-size:.88rem;margin-bottom:-.2rem"><b>You ask for:</b></p>
      <div class="nl-steps">${types.map(t => `<span>${esc(N.cardName(t))}</span><button class="nl-btn small" data-n="want" data-t="${t}" data-d="-1" aria-label="Fewer ${esc(N.cardName(t))}" ${tr.want[t] ? "" : "disabled"}>−</button><b style="text-align:center;min-width:1.2rem">${tr.want[t] || 0}</b><button class="nl-btn small" data-n="want" data-t="${t}" data-d="1" aria-label="More ${esc(N.cardName(t))}">+</button>`).join("")}</div>
      <div class="nl-row"><button class="nl-btn go" data-n="tradesend" ${giveN || wantN ? "" : "disabled"}>Send offer</button><button class="nl-btn small" data-n="tradeclose">Cancel</button></div>
      <p class="nl-muted" style="font-size:.82rem">A trade only uses a move if they accept.</p>`;
  }

  function render() {
    const v = mySeat(), P = S.players[v], n = S.players.length;
    const myTurn = S.status === "play" && S.turn === v, pd = S.pending;
    const waiting = N.waitingOn(S);
    document.title = waiting.includes(v) && v >= 0 ? "Your move · Nasi Lemak" : "Nasi Lemak";
    const key = `${S.code}:${S.turnN}:${S.status}:${pd ? pd.k + pd.from + pd.to : ""}`;
    if (key !== ui.key) { ui.key = key; ui.sel = null; ui.step = {}; ui.trade = null; ui.take = []; }
    if (P && ui.sel != null && !P.hand.includes(ui.sel)) { ui.sel = null; ui.step = {}; }
    if (ui.trade && P) ui.trade.give = ui.trade.give.filter(id => P.hand.includes(id));
    const topId = S.discard[S.discard.length - 1];
    const say = S.status === "over" ? `${esc(S.winner === v ? "You win!" : nameOf(S.winner) + " wins!")}`
      : pd && pd.k === "trade" ? `${esc(nm(pd.from, v))} → ${esc(nm(pd.to, v))}: trade offer`
      : myTurn ? (S.drew ? "Your turn" : "Your turn: draw 2") : `${esc(nameOf(S.turn))}'s turn`;
    const sub = S.status !== "play" ? "" : `${S.drew ? `${S.moves} of ${N.MOVES} moves` : "Drawing"}<span class="nl-dots">${Array.from({ length: N.MOVES }, (_, i) => `<i class="${i < S.moves ? "used" : ""}"></i>`).join("")}</span>${S.clock ? ` · <b data-clock="turn">2:00</b> left` : ""}`;
    const last = S.log[S.log.length - 1] || "";
    const myPacks = P ? N.packs(P) : 0;
    $app.innerHTML = `<div class="nl">
      <header class="nl-top"><span class="mark">Nasi Lemak</span><span class="nl-code">TABLE ${esc(S.code)}</span><span class="grow"></span>${netDown ? `<span class="nl-muted">Reconnecting…</span>` : ""}${typeof sndBtn === "function" ? sndBtn() : ""}<button class="nl-btn small" data-a="home">Leave table</button></header>
      <p class="nl-ticker">${fmt(last)}</p>
      ${S.status === "over" ? winHTML(v) : ""}
      <section class="nl-market${n >= 7 ? " many" : ""}" aria-label="The night market">
        ${S.players.map((O, i) => {
          // you sit at the bottom; everyone else's stall goes round the table clockwise
          const k = v >= 0 ? (i - v + n) % n : i, ang = Math.PI / 2 + k * 2 * Math.PI / n;
          const x = 50 + Math.cos(ang) * 42, y = 50 + Math.sin(ang) * 40, on = S.turn === i && S.status === "play";
          return `<article class="nl-stall${i === v ? " me" : ""}${on ? " on" : ""}${waiting.includes(i) && pd ? " wait" : ""}" style="left:${x}%;top:${y}%;--awn:${AWNING[i % AWNING.length]}">
            <div class="nl-awning" aria-hidden="true"></div>
            <div class="nl-sign"><b>${esc(i === v ? "You" : nameOf(i))}</b>${on ? `<span class="nl-open">Serving</span>` : ""}</div>
            <div class="nl-counter">
              <div class="nl-stats"><span><b>${O.hand.length}</b> cards</span><span><b>${O.nl.length}</b> wrapped</span>${S.status === "over" || i === v ? `<span><b>${N.packs(O)}</b> packs</span>` : ""}</div>
              ${O.nl.length ? packsHTML(O, i === v) : `<p class="nl-empty">Nothing wrapped yet</p>`}</div></article>`; }).join("")}
        <div class="nl-felt">
          <div class="nl-piles"><div class="nl-pile"><div class="nl-back">${S.deck.length}</div>Draw pile</div>
            <div class="nl-pile">${topId != null ? cardHTML(topId, { cls: "small" }) : `<div class="nl-back" style="opacity:.35"></div>`}Discard</div>
            <div class="nl-pile"><div class="nl-back gold">${S.nlPile.length}</div>Nasi Lemak</div></div>
          <div class="nl-say">${say}</div><div class="nl-sub">${sub}</div>
        </div>
      </section>
      ${P ? `<div class="nl-zone">
        <section class="nl-mine"><span class="nl-cap">Your stall</span>
          <p class="nl-score" style="margin:.4rem 0">${myPacks} <small>of ${N.GOAL} packs${P.nl.some(e => e.fly != null) ? " · a fly is spoiling one" : ""}</small></p>
          ${packsHTML(P, true)}</section>
        <section class="nl-panel" aria-live="polite">${panelHTML(v)}</section>
        <div class="nl-handwrap"><span class="nl-cap">Your hand · ${P.hand.length} cards · only you can see it</span>
          <div class="nl-hand">${handOrder(P.hand).map(id => { const g = ui.trade && ui.trade.p != null && ui.trade.give.includes(id), s = ui.sel === id;
            return cardHTML(id, { tag: "button", cls: g ? "give" : s ? "sel" : "", attrs: `data-n="card" data-id="${id}"` }); }).join("") || `<p class="nl-empty">No cards in hand.</p>`}</div></div>
      </div>` : `<p class="nl-muted" style="margin-top:1rem">You're watching this game.</p>`}
      <section class="nl-log"><span class="nl-cap">At the stalls</span><ol>${S.log.slice(-25).map(m => `<li>${fmt(m)}</li>`).join("")}</ol></section>
      ${rulesHTML()}</div>`;
  }
  const handOrder = h => h.slice().sort((a, b) => { const A = N.card(a), B = N.card(b); return (A.kind === B.kind ? 0 : A.kind === "ing" ? -1 : 1) || A.t.localeCompare(B.t) || a - b; });

  function winHTML(v) {
    const rows = S.players.map((p, i) => ({ i, packs: N.packs(p), cards: p.nl.length })).sort((a, b) => b.packs - a.packs || b.cards - a.cards);
    return `<div class="nl-win"><h2>${S.winner === v ? "You win!" : esc(nameOf(S.winner)) + " wins!"}</h2>
      <p class="nl-muted">${rows.map(r => `${esc(nm(r.i, v))}: ${r.packs} pack${r.packs === 1 ? "" : "s"}`).join(" · ")}</p>
      <div class="nl-row" style="justify-content:center">${S.host === me ? `<button class="nl-btn go" data-a="again">Open the stalls again</button>` : `<span class="nl-muted">The table owner can start a rematch.</span>`}<button class="nl-btn" data-a="home">Leave table</button></div></div>`;
  }

  function mastHTML() {
    const fan = [0, 10, 20, 30, 40].map(id => cardHTML(id)).join("");
    return `<header class="nl-mast nl"><div><h1>Nasi<span>Lemak</span></h1>
      <p>Run a Nasi Lemak stall in a hungry village. Collect rice, egg, peanuts, sambal bilis and cucumber, wrap your packs, and sabotage your neighbours with flies, thieves and officers. First to 5 packs wins. 2 to 10 players, each on their own phone or computer.</p></div>
      <div class="nl-mastfan" aria-hidden="true">${fan}</div></header>`;
  }
  function rulesHTML() {
    const acts = Object.entries(N.ACTIONS).map(([k, a]) => `<li><b>${esc(a.n)}</b> (${a.count}): ${esc(a.d)}</li>`).join("");
    return `<details class="nl-rules nl"><summary>How to play Nasi Lemak</summary><div class="cols">
      <div><h3>Your turn</h3><ul>
        <li>Draw 2 cards. This isn't a move.</li>
        <li>Then make up to 3 moves, in any order: <b>make a Nasi Lemak</b>, <b>trade</b>, or <b>play an action card</b>.</li>
        <li><b>Make a Nasi Lemak</b> with one each of Rice, Egg, Peanuts, Sambal Bilis and Cucumber. You take the top card of the Nasi Lemak pile, face down: it holds 1 or 2 packs.</li>
        <li><b>Trade</b> only on your turn, with anyone, on any terms: 2 for 1 is fine. Ingredients, Fly Swatters and Fans can be traded. It counts as a move only if they accept.</li>
        <li><b>Win</b> with 5 packs on your turn. A Nasi Lemak with a Fly on it doesn't count. If the Nasi Lemak pile runs out, the most packs wins.</li></ul></div>
      <div><h3>Action cards</h3><ul>${acts}</ul></div>
      <div><h3>The deck</h3><ul><li>50 ingredients: 10 each of Rice, Egg, Peanuts, Sambal Bilis and Cucumber.</li><li>25 action cards.</li><li>15 Nasi Lemak cards: 8 with one pack, 7 with two.</li><li>Each player starts with 7 cards.</li><li>With 6 to 10 players, a second full deck and a second Nasi Lemak pile are shuffled in.</li></ul>
        <p class="nl-muted" style="font-size:.85rem">Based on Nasi Lemak The Game by Faculty of Fun. Fan-made and unofficial.</p></div>
    </div></details>`;
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-n]");
    if (!b || b.disabled || !S || S.kind !== "nasi" || view !== "game") return;
    const d = b.dataset, v = mySeat(), P = S.players[v], num = k => d[k] != null && d[k] !== "" ? +d[k] : undefined;
    switch (d.n) {
      case "card": {
        const id = +d.id;
        if (ui.trade && ui.trade.p != null) {
          if (!N.tradable(N.typeOf(id))) return flash("Only ingredients, Fly Swatters and Fans can be traded.");
          const k = ui.trade.give.indexOf(id); if (k >= 0) ui.trade.give.splice(k, 1); else ui.trade.give.push(id);
          return render();
        }
        if (S.turn !== v || !S.drew || S.pending) return flash(S.turn !== v ? "Wait for your turn to play cards." : !S.drew ? "Draw your 2 cards first." : "Finish the current move first.");
        if (N.isIng(id)) return flash("Ingredients are used when you make a Nasi Lemak or trade.");
        ui.sel = ui.sel === id ? null : id; ui.step = {}; return render();
      }
      case "unsel": ui.sel = null; ui.step = {}; return render();
      case "step": ui.step.slot = num("slot"); return render();
      case "draw": return act({ t: "draw" });
      case "end": return act({ t: "end" });
      case "make": {
        const by = ingsOf(P), mk = num("mk");
        const pickTypes = mk != null ? Object.keys(by).sort((x, y) => by[y].length - by[x].length).slice(0, 3) : N.ING_KEYS;
        return act(mk != null ? { t: "make", makcik: mk, cards: pickTypes.map(t => by[t][0]) } : { t: "make", cards: N.ING_KEYS.map(t => by[t][0]) });
      }
      case "play": return act({ t: "play", card: ui.sel, ing: d.ing, p: num("p"), slot: num("slot"), to: num("to") });
      case "tradeopen": ui.trade = { p: null, give: [], want: {} }; ui.sel = null; return render();
      case "tradeto": ui.trade.p = num("p"); return render();
      case "tradeclose": ui.trade = null; return render();
      case "want": { const t = d.t, w = ui.trade.want; w[t] = Math.max(0, Math.min(10, (w[t] || 0) + +d.d)); return render(); }
      case "tradesend": { const tr = ui.trade; return act({ t: "trade", p: tr.p, give: tr.give, want: Object.entries(tr.want).filter(([, x]) => x > 0).map(([t, x]) => ({ t, n: x })) }); }
      case "cancel": return act({ t: "cancel" });
      case "answer": return act({ t: "answer", yes: d.yes === "1" });
      case "pick": { const id = +d.id, need = Math.min(2, (S.pending && S.pending.hand || []).length); const k = ui.take.indexOf(id);
        if (k >= 0) ui.take.splice(k, 1); else if (ui.take.length < need) ui.take.push(id); return render(); }
      case "take": return act({ t: "take", cards: ui.take });
    }
  });

  window.NasiUI = { render, mastHTML, rulesHTML, cardHTML, reset };
})();
