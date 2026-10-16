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
.umast .fanu .ucard{position:absolute;left:50%;top:50%;--w:104px}
@media (max-width:760px){.umast{grid-template-columns:1fr}.umast .fanu{height:9.5rem}.umast .fanu .ucard{--w:72px}}
.tagkind{font:600 .66rem/1 var(--label);letter-spacing:.08em;text-transform:uppercase;padding:.2rem .4rem;border-radius:3px;background:var(--stand-3);color:var(--crest);margin-left:.4rem}
/* cards: every card is a Marine WANTED poster, pinned inside a lacquered, gold-ruled board */
.ucard{--w:74px;--cc:#444;--ink:#24170e;--gold:linear-gradient(135deg,#f9e7a8 0%,#c9952f 22%,#fff3c6 46%,#a8721c 66%,#f4d98c 84%,#b5822a 100%);
  width:var(--w);aspect-ratio:5/7.4;border-radius:calc(var(--w)*.09);position:relative;flex:none;display:block;padding:0;border:0;isolation:isolate;
  background:
    repeating-radial-gradient(circle at 50% 118%,rgba(255,255,255,.075) 0 calc(var(--w)*.006),transparent calc(var(--w)*.006) calc(var(--w)*.03)),
    repeating-radial-gradient(circle at 50% -18%,rgba(0,0,0,.09) 0 calc(var(--w)*.006),transparent calc(var(--w)*.006) calc(var(--w)*.03)),
    linear-gradient(150deg,rgba(255,255,255,.3),rgba(255,255,255,0) 32%,rgba(0,0,0,0) 62%,rgba(0,0,0,.35)),
    linear-gradient(165deg,var(--cl) -30%,var(--cc) 42%,var(--cd) 125%);
  box-shadow:inset 0 calc(var(--w)*.008) 0 rgba(255,255,255,.35),inset 0 calc(var(--w)*-.01) 0 rgba(0,0,0,.35),inset 0 0 0 calc(var(--w)*.01) rgba(0,0,0,.25),
    0 calc(var(--w)*.01) calc(var(--w)*.015) rgba(0,0,0,.45),0 calc(var(--w)*.09) calc(var(--w)*.2) calc(var(--w)*-.06) rgba(0,0,0,.7);
  color:var(--ink);transition:transform .22s var(--ease),filter .18s,box-shadow .22s;overflow:hidden}
.ucard.c-r{--cc:#b8241f;--cl:#ff7a5c;--cd:#5e0c0a}.ucard.c-y{--cc:#d99a0c;--cl:#ffe07a;--cd:#7a4a00}.ucard.c-g{--cc:#1f7a42;--cl:#5fd48a;--cd:#0a3a1d}.ucard.c-b{--cc:#1a55ad;--cl:#5ca4ff;--cd:#0a2556}
.ucard.c-w{--cc:#1d140d;--cl:#3a2a1d;--cd:#000;background:
    repeating-radial-gradient(circle at 50% 118%,rgba(255,255,255,.08) 0 calc(var(--w)*.006),transparent calc(var(--w)*.006) calc(var(--w)*.03)),
    linear-gradient(150deg,rgba(255,255,255,.28),rgba(255,255,255,0) 32%,rgba(0,0,0,.35)),
    conic-gradient(from 45deg,#b8241f 0 25%,#1a55ad 0 50%,#1f7a42 0 75%,#d99a0c 0)}
/* the gold-leaf rule around the poster */
.ucard::before{content:"";position:absolute;inset:calc(var(--w)*.038);border-radius:calc(var(--w)*.05);padding:calc(var(--w)*.011);background:var(--gold);z-index:0;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);
  filter:drop-shadow(0 calc(var(--w)*.006) 0 rgba(0,0,0,.4))}
/* foil: a holographic sheen on Wilds, the live discard and cards you point at */
.ucard::after{content:"";position:absolute;inset:0;border-radius:inherit;z-index:3;pointer-events:none;opacity:0;mix-blend-mode:soft-light;
  background:linear-gradient(115deg,transparent 28%,rgba(255,255,255,.85) 42%,rgba(255,190,240,.7) 48%,rgba(150,230,255,.7) 54%,transparent 68%) 0 0/260% 260%;
  transition:opacity .3s}
.ucard.c-w::after,.udisc .top::after{opacity:.9;animation:foil 5.5s cubic-bezier(.4,0,.2,1) infinite}
.uhand .ucard:hover::after,.uhand .ucard:focus-visible::after{opacity:1;animation:foil 1.6s cubic-bezier(.4,0,.2,1) both}
@keyframes foil{0%{background-position:120% 0}60%,100%{background-position:-60% 0}}
/* the poster: deckled parchment, a fold, an inner printed rule, pinned with a brass tack */
.ucard .pw{position:absolute;inset:calc(var(--w)*.062);z-index:1;clip-path:polygon(0.0% 0.54%,7.1% 0.62%,14.3% 0.13%,21.4% 0.27%,28.6% 0.49%,35.7% 0.56%,42.9% 0.09%,50.0% 0.97%,57.1% 0.65%,64.3% 0.45%,71.4% 0.31%,78.6% 0.86%,85.7% 0.72%,92.9% 0.08%,99.45% 0.0%,99.74% 5.0%,99.26% 10.0%,99.83% 15.0%,99.38% 20.0%,99.46% 25.0%,99.81% 30.0%,99.94% 35.0%,98.97% 40.0%,98.93% 45.0%,99.87% 50.0%,99.51% 55.0%,98.95% 60.0%,99.79% 65.0%,99.54% 70.0%,99.39% 75.0%,99.26% 80.0%,99.69% 85.0%,99.81% 90.0%,98.92% 95.0%,100.0% 99.51%,92.9% 99.74%,85.7% 99.40%,78.6% 99.64%,71.4% 99.83%,64.3% 99.15%,57.1% 99.61%,50.0% 99.61%,42.9% 99.91%,35.7% 98.98%,28.6% 99.74%,21.4% 99.03%,14.3% 99.48%,7.1% 99.74%,0.66% 100.0%,0.44% 95.0%,0.83% 90.0%,0.72% 85.0%,0.15% 80.0%,0.25% 75.0%,0.50% 70.0%,0.10% 65.0%,0.05% 60.0%,0.45% 55.0%,0.75% 50.0%,0.71% 45.0%,1.05% 40.0%,0.36% 35.0%,0.48% 30.0%,0.55% 25.0%,0.48% 20.0%,0.92% 15.0%,0.50% 10.0%,0.48% 5.0%);
  background:
    linear-gradient(180deg,transparent 46.6%,rgba(80,45,15,.13) 47.2%,rgba(255,250,235,.22) 47.8%,transparent 49%),
    radial-gradient(120% 100% at 50% 45%,transparent 55%,rgba(110,62,20,.42)),
    #e8d3a1 url(assets/parchment.jpg) center/calc(var(--w)*3)}
.ucard .pw::after{content:"";position:absolute;inset:calc(var(--w)*.032);border:calc(var(--w)*.005) solid rgba(36,23,14,.6);outline:calc(var(--w)*.003) solid rgba(36,23,14,.35);outline-offset:calc(var(--w)*.012);pointer-events:none}
.ucard .tack{position:absolute;left:50%;top:calc(var(--w)*.058);width:calc(var(--w)*.075);height:calc(var(--w)*.075);margin-left:calc(var(--w)*-.0375);border-radius:50%;z-index:2;
  background:radial-gradient(circle at 35% 30%,#fff4c8,#d9a640 45%,#7a5212 100%);box-shadow:0 calc(var(--w)*.012) calc(var(--w)*.018) rgba(0,0,0,.55)}
.ucard .wt{position:absolute;left:0;right:0;top:calc(var(--w)*.072);text-align:center;font:400 calc(var(--w)*.158)/1 "Rye",serif;letter-spacing:.03em;color:var(--ink);
  text-shadow:0 calc(var(--w)*.004) 0 rgba(255,245,220,.5)}
.ucard .ph{position:absolute;left:calc(var(--w)*.09);right:calc(var(--w)*.09);top:calc(var(--w)*.255);height:calc(var(--w)*.585);
  border:calc(var(--w)*.014) solid var(--ink);display:grid;place-items:center;overflow:hidden;
  box-shadow:0 0 0 calc(var(--w)*.006) rgba(255,248,226,.6),inset 0 0 0 calc(var(--w)*.008) rgba(255,255,255,.22),inset 0 calc(var(--w)*-.05) calc(var(--w)*.09) rgba(0,0,0,.35);
  background:radial-gradient(circle,rgba(0,0,0,.18) 26%,transparent 30%) 0 0/calc(var(--w)*.04) calc(var(--w)*.04),radial-gradient(120% 90% at 50% 30%,var(--cl),var(--cc) 58%,var(--cd))}
.ucard .ph::after{content:"";position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;background:linear-gradient(180deg,rgba(255,226,170,.25),rgba(120,70,20,.28))}
.ucard.c-w .ph{background:radial-gradient(circle,rgba(0,0,0,.2) 26%,transparent 30%) 0 0/calc(var(--w)*.04) calc(var(--w)*.04),conic-gradient(from 45deg,#e2493c 0 25%,#3a7ee0 0 50%,#38a862 0 75%,#f4c13a 0)}
.ucard .ph svg{width:96%;height:96%;filter:drop-shadow(0 calc(var(--w)*.012) 0 rgba(0,0,0,.35))}
.ucard .ph.crew{place-items:end center}
.ucard .ph.crew svg{width:100%;height:100%;filter:none}
.ucard .ph img.custom + svg{display:none}
.ucard .numc{position:absolute;right:calc(var(--w)*.015);bottom:calc(var(--w)*-.035);z-index:1;font:400 calc(var(--w)*.26)/1 "Alfa Slab One",serif;color:#fbf1d8;-webkit-text-stroke:calc(var(--w)*.014) var(--ink);paint-order:stroke fill;text-shadow:calc(var(--w)*.012) calc(var(--w)*.016) 0 rgba(0,0,0,.45);transform:rotate(-6deg)}
.ucard .num{font:400 calc(var(--w)*.5)/1 "Alfa Slab One",serif;color:#fbf1d8;-webkit-text-stroke:calc(var(--w)*.016) var(--ink);paint-order:stroke fill;
  text-shadow:calc(var(--w)*.018) calc(var(--w)*.026) 0 rgba(0,0,0,.4);transform:rotate(-4deg);margin-top:calc(var(--w)*.02)}
.ucard .doa{position:absolute;left:calc(var(--w)*.12);right:calc(var(--w)*.12);top:calc(var(--w)*.865);padding:calc(var(--w)*.012) 0;text-align:center;
  font:400 calc(var(--w)*.06)/1 "Alfa Slab One",serif;letter-spacing:.09em;color:var(--ink);white-space:nowrap;
  border-top:calc(var(--w)*.012) double rgba(36,23,14,.8);border-bottom:calc(var(--w)*.012) double rgba(36,23,14,.8)}
.ucard .who{position:absolute;left:calc(var(--w)*.05);right:calc(var(--w)*.05);top:calc(var(--w)*.98);text-align:center;font:400 calc(var(--w)*var(--ws,.092))/1 "Alfa Slab One",serif;letter-spacing:.03em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:clip}
.ucard .bty{position:absolute;left:0;right:0;top:calc(var(--w)*1.09);display:flex;justify-content:center;align-items:center;gap:calc(var(--w)*.015);font:400 calc(var(--w)*.068)/1 "Alfa Slab One",serif;color:#5a140f;font-variant-numeric:tabular-nums;white-space:nowrap}
.ucard .bty svg{width:calc(var(--w)*.075);height:calc(var(--w)*.1)}
.ucard .mar{position:absolute;left:0;right:0;bottom:calc(var(--w)*.06);text-align:center;font:700 calc(var(--w)*.046)/1 var(--label);letter-spacing:.34em;color:rgba(36,23,14,.72)}
/* the wax seal: colour and value, hand-pressed, readable when the hand is fanned */
.ucard .pip{position:absolute;width:calc(var(--w)*.26);height:calc(var(--w)*.25);border-radius:47% 53% 44% 56% / 55% 45% 55% 45%;display:grid;place-items:center;z-index:2;
  background:radial-gradient(circle at 34% 28%,color-mix(in srgb,var(--cl) 80%,#fff),var(--cc) 52%,var(--cd));
  box-shadow:inset 0 0 0 calc(var(--w)*.022) rgba(0,0,0,.16),inset 0 calc(var(--w)*.012) calc(var(--w)*.014) rgba(255,255,255,.35),inset 0 calc(var(--w)*-.014) calc(var(--w)*.02) rgba(0,0,0,.3),
    0 calc(var(--w)*.014) calc(var(--w)*.022) rgba(0,0,0,.55);
  font:400 calc(var(--w)*.15)/1 "Alfa Slab One",serif;color:#fbf1d8;-webkit-text-stroke:calc(var(--w)*.006) var(--ink);paint-order:stroke fill;text-shadow:0 calc(var(--w)*-.005) 0 rgba(0,0,0,.35)}
.ucard .pip svg{width:66%;height:66%}
.ucard .pip.tl{left:calc(var(--w)*.03);top:calc(var(--w)*.2)}
.ucard.c-w .pip{background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.4),transparent 45%),conic-gradient(from 45deg,#b8241f 0 25%,#1a55ad 0 50%,#1f7a42 0 75%,#d99a0c 0)}
/* the back: a woven black flag with a gold compass rose under the Jolly Roger, in a twisted rope border */
.ucard.uback{--cc:#3a2410;--cl:#6b4521;--cd:#1a0f06;
  background:repeating-linear-gradient(55deg,#e0b878 0 calc(var(--w)*.012),#a8783e calc(var(--w)*.012) calc(var(--w)*.03),#6b4521 calc(var(--w)*.03) calc(var(--w)*.042),#c99a5a calc(var(--w)*.042) calc(var(--w)*.054))}
.ucard.uback::before{inset:calc(var(--w)*.06)}
.ucard.uback .fl{position:absolute;inset:calc(var(--w)*.075);border-radius:calc(var(--w)*.045);z-index:1;overflow:hidden;
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(255,255,255,.02) 0 1px,transparent 1px 3px),radial-gradient(120% 80% at 50% 42%,#2c2822,#0a0907 72%);
  box-shadow:inset 0 0 calc(var(--w)*.14) #000;display:grid;place-items:center}
.ucard.uback .rose{position:absolute;width:118%;left:-9%;top:50%;transform:translateY(-52%);opacity:.32}
.ucard.uback .fl > svg:not(.rose){width:64%;position:relative;filter:drop-shadow(0 calc(var(--w)*.02) calc(var(--w)*.03) rgba(0,0,0,.8))}
.ucard.uback .bt{position:absolute;left:0;right:0;bottom:calc(var(--w)*.13);z-index:2;text-align:center;font:400 calc(var(--w)*.14)/1 "Rye",serif;color:#e8c77a;letter-spacing:.08em;
  text-shadow:0 calc(var(--w)*.008) 0 #5a3a10,0 calc(var(--w)*-.004) 0 #fff3c8}
.ucard.uback .bt2{position:absolute;left:0;right:0;top:calc(var(--w)*.14);z-index:2;text-align:center;font:700 calc(var(--w)*.058)/1 var(--label);color:#d4b06a;letter-spacing:.34em}
/* tiny cards (the rules list) show only the picture */
.mini .ucard .wt,.mini .ucard .doa,.mini .ucard .who,.mini .ucard .bty,.mini .ucard .mar,.mini .ucard .pip,.mini .ucard .tack{display:none}
.mini .ucard .ph{top:calc(var(--w)*.3);height:calc(var(--w)*.8)}
@media (prefers-reduced-motion:reduce){.ucard::after{animation:none!important}}
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
.ucenter .ucard{--w:clamp(76px,10.5vw,116px)}
.upile{position:relative;display:grid;place-items:center}
.upile .cnt{position:absolute;bottom:-1.5rem;left:0;right:0;text-align:center;font:600 .75rem/1 var(--label);color:#f6e7c4;letter-spacing:.06em;text-shadow:0 1px 3px #000}
button.ucard.drawme{cursor:pointer;animation:bob 1.6s ease-in-out infinite}
button.ucard.drawme:hover{transform:translateY(-6px) rotate(-2deg)}
@keyframes bob{50%{transform:translateY(-5px)}}
.udisc{position:relative;width:clamp(76px,10.5vw,116px);aspect-ratio:5/7.4}
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
.urules .mini .ucard{--w:34px}
@media (prefers-reduced-motion:reduce){.udir,.ustack,button.ucard.drawme,.useat .catch,.ubtn.uno.loud{animation:none}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ---- card art: Marine WANTED posters ----
  // The poster's "photo" holds the numeral, or for action cards an illustration of a One Piece item, drawn here:
  // Seastone Cuffs (Skip), Log Pose (Reverse), Message Gull (Draw 2), Devil Fruit (Wild), Conqueror's Haki (Wild Draw 4).
  const INK = "#24170e";
  const ART = {
    skip: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M38 52c4-3 8-3 12 0s8 3 12 0" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M38 52c4-3 8-3 12 0s8 3 12 0" stroke="#8a969c" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g><circle cx="27" cy="54" r="18" fill="url(#ssA)" stroke="${INK}" stroke-width="3.5"/><circle cx="27" cy="54" r="9" fill="#1b2a33" stroke="${INK}" stroke-width="3"/><path d="M15 44a16 16 0 0 1 14-7" stroke="#e8f1f4" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/><rect x="21" y="32" width="12" height="7" rx="2" fill="#56636a" stroke="${INK}" stroke-width="2.5"/></g>
      <g><circle cx="73" cy="54" r="18" fill="url(#ssA)" stroke="${INK}" stroke-width="3.5"/><circle cx="73" cy="54" r="9" fill="#1b2a33" stroke="${INK}" stroke-width="3"/><path d="M61 44a16 16 0 0 1 14-7" stroke="#e8f1f4" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/><rect x="67" y="32" width="12" height="7" rx="2" fill="#56636a" stroke="${INK}" stroke-width="2.5"/></g>
      <path d="M27 82v6M73 82v6M20 88h60" stroke="${INK}" stroke-width="3" opacity=".35"/></svg>`,
    rev: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M8 62c10-6 22-8 42-8s32 2 42 8v14c-10-6-22-8-42-8S18 70 8 76z" fill="#8a5a2b" stroke="${INK}" stroke-width="3"/><path d="M14 66c10-4 20-5 36-5s26 1 36 5" stroke="#c99256" stroke-width="2" fill="none"/>
      <ellipse cx="50" cy="60" rx="20" ry="6" fill="#c08a3e" stroke="${INK}" stroke-width="3"/>
      <path d="M31 58a19 21 0 1 1 38 0z" fill="rgba(220,240,255,.55)" stroke="${INK}" stroke-width="3"/><path d="M36 46a14 15 0 0 1 10-10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>
      <path d="M50 34l4 18-4 4-4-4z" fill="#c62b25" stroke="${INK}" stroke-width="1.5"/><circle cx="50" cy="52" r="2.6" fill="${INK}"/>
      <path d="M86 32A40 40 0 0 0 30 14" stroke="#fbf1d8" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M28 6l-6 10 11 3z" fill="#fbf1d8"/>
      <path d="M14 32A40 40 0 0 1 30 14" stroke="#fbf1d8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0"/></svg>`,
    d2: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 52c-14-18-30-24-44-20 10 4 18 10 22 20z" fill="#f4f0e6" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M14 34c6 2 12 6 16 12" stroke="#9aa4ad" stroke-width="2" fill="none"/>
      <path d="M50 52c14-18 30-24 44-20-10 4-18 10-22 20z" fill="#f4f0e6" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M86 34c-6 2-12 6-16 12" stroke="#9aa4ad" stroke-width="2" fill="none"/>
      <path d="M8 32l-4-3 6-1zM92 32l4-3-6-1z" fill="${INK}"/>
      <ellipse cx="50" cy="56" rx="13" ry="9" fill="#fbf8f0" stroke="${INK}" stroke-width="3"/><circle cx="58" cy="50" r="7" fill="#fbf8f0" stroke="${INK}" stroke-width="3"/><circle cx="60" cy="49" r="1.8" fill="${INK}"/>
      <path d="M64 51l9 2-9 3z" fill="#f2b51c" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M38 60l-8 4 9 1z" fill="#c8c4bc" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <g transform="rotate(-8 72 70)"><rect x="60" y="62" width="26" height="17" rx="2" fill="#efe1bd" stroke="${INK}" stroke-width="2.6"/><path d="M60 62l13 9 13-9" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="73" cy="71" r="3.6" fill="#b3121b" stroke="${INK}" stroke-width="1.4"/></g>
      <path d="M71 56l2 6" stroke="${INK}" stroke-width="2"/>
      <text x="20" y="84" text-anchor="middle" font-family="Alfa Slab One,serif" font-size="24" fill="#fbf1d8" stroke="${INK}" stroke-width="3" paint-order="stroke">+2</text></svg>`,
    wild: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 28c0-8 4-14 10-18M50 28c-2-6-8-10-14-10" stroke="#3f6b23" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M58 12c10-4 20 0 22 8-10 2-18 0-22-8z" fill="#5c9a33" stroke="${INK}" stroke-width="2.5"/>
      <path d="M50 28c-12 0-20 8-20 18 0 4 2 7 4 9-6 4-10 10-10 17 0 12 12 20 26 20s26-8 26-20c0-7-4-13-10-17 2-2 4-5 4-9 0-10-8-18-20-18z" fill="#f2b51c" stroke="${INK}" stroke-width="3.5"/>
      <g stroke="#b3121b" stroke-width="3.2" fill="none" stroke-linejoin="round"><path d="M34 44l5-4 5 4 5-4 5 4 5-4 5 4"/><path d="M28 70l6-5 6 5 6-5 6 5 6-5 6 5 6-5"/><path d="M32 82l6-4 6 4 6-4 6 4 6-4 6 4"/></g>
      <circle cx="50" cy="56" r="4" fill="#b3121b" stroke="${INK}" stroke-width="1.6"/>
      <path d="M36 36c3-4 7-6 11-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/></svg>`,
    w4: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="52" r="46" fill="url(#hkA)"/>
      <g stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M50 52 36 30 42 22 30 4"/><path d="M50 52 70 36 66 26 86 14"/><path d="M50 52 76 62 84 56 98 72"/><path d="M50 52 28 66 20 60 4 76"/><path d="M50 52 54 76 46 84 52 98"/></g>
      <g stroke="#ff3b2f" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M50 52 36 30 42 22 30 4"/><path d="M50 52 70 36 66 26 86 14"/><path d="M50 52 76 62 84 56 98 72"/><path d="M50 52 28 66 20 60 4 76"/><path d="M50 52 54 76 46 84 52 98"/></g>
      <circle cx="50" cy="52" r="18" fill="${INK}" stroke="#ff3b2f" stroke-width="2.5"/><text x="50" y="60" text-anchor="middle" font-family="Alfa Slab One,serif" font-size="21" fill="#fbf1d8">+4</text></svg>`
  };
  // action cards that carry a picture instead of the drawing; if a file is missing the drawing shows through
  // (the Wild's flag has a see-through background, so the four-colour board shows behind it)
  const ART_IMG = { skip: { img: "assets/card-skip.jpg", pos: "50% 50%", zoom: 1.8, at: "51% 60%" }, rev: { img: "assets/card-rev.png", pos: "42% 50%", zoom: 1.15, at: "42% 50%" }, wild: { img: "assets/card-wild.png", fit: "contain", zoom: .94 },
    d2: { img: "assets/card-d2.jpg", pos: "50% 22%", mark: "+2" },
    w4: { img: "assets/card-w4.png", pos: "47% 15%", zoom: 1.1, at: "47% 20%", mark: "+4" } };
  const imgHTML = a => `<img class="custom" src="${a.img}" style="${a.fit ? `object-fit:${a.fit};` : ""}object-position:${a.pos || "50% 50%"}${a.zoom ? `;transform:scale(${a.zoom});transform-origin:${a.at || "50% 50%"}` : ""}" alt="" onerror="this.remove()">`;
  // gradients the card art shares, defined once in a visible zero-size SVG (ids repeated per card would break when the first copy is hidden)
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="ssA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9c4c9"/><stop offset=".55" stop-color="#6f7f88"/><stop offset="1" stop-color="#3b474e"/></linearGradient><radialGradient id="dfA" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#c58ae6"/><stop offset=".6" stop-color="#7d33a8"/><stop offset="1" stop-color="#3f1460"/></radialGradient><radialGradient id="hkA"><stop offset="0" stop-color="#ff5240"/><stop offset=".45" stop-color="#8a0c14"/><stop offset="1" stop-color="#1a0204" stop-opacity="0"/></radialGradient></defs></svg>`);
  // small single-colour marks for the wax-seal pip
  const PIP = {
    skip: `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="#fbf1d8" stroke-width="2.6"><circle cx="7" cy="13" r="4.5"/><circle cx="17" cy="13" r="4.5"/><path d="M10.5 11.5h3"/></g></svg>`,
    rev: `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="#fbf1d8" stroke-width="2.6" stroke-linecap="round"><path d="M5 9h12l-3-3M19 15H7l3 3"/></g></svg>`,
    d2: "+2", w4: "+4",
    wild: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c-5-2-9 1-8.5 6 .5 4 4 7 8.5 7s8-3 8.5-7C21 8 17 5 12 7z" fill="#fbf1d8"/><path d="M12 7c0-2 1-4 3-5" stroke="#fbf1d8" stroke-width="2" fill="none"/></svg>`
  };
  const BERRY = `<svg viewBox="0 0 12 16" aria-hidden="true"><path d="M3 3h4.2a2.6 2.6 0 0 1 0 5.2H3zM3 8.2h5a2.9 2.9 0 0 1 0 5.8H3z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 1v14M8 1v2M8 13v2" stroke="currentColor" stroke-width="1.6"/></svg>`;
  const SKULL = (band = "#c8281e") => `<svg viewBox="0 0 60 60" aria-hidden="true"><g stroke-linecap="round"><path d="M12 48 44 14" stroke="#d8dde0" stroke-width="3.4"/><path d="M48 48 16 14" stroke="#d8dde0" stroke-width="3.4"/><path d="M14 42l4 4M46 42l-4 4" stroke="#c9952f" stroke-width="4"/></g><circle cx="30" cy="31" r="12" fill="#f1e6cc"/><rect x="23" y="37" width="14" height="9" rx="2" fill="#f1e6cc"/><circle cx="25.5" cy="31.5" r="3.3" fill="#111"/><circle cx="34.5" cy="31.5" r="3.3" fill="#111"/><path d="M28.5 37.5h3l-1.5 2.4z" fill="#111"/><path d="M26 42.5v3M30 42.5v3M34 42.5v3" stroke="#111" stroke-width="1"/><path d="M17.6 27c1-8 6-12 12.4-12s11.4 4 12.4 12c-4-2-8-3-12.4-3s-8.4 1-12.4 3z" fill="${band}"/><path d="M41 22l7-3-2 6 5 1-6 3z" fill="${band}"/></svg>`;
  // a compass rose, engraved faintly behind the Jolly Roger on the back
  const ROSE = '<svg class="rose" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#d4b06a" stroke-width=".7"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="16"/></g><g fill="#d4b06a"><path d="M50 4l5 42-5 4-5-4zM50 96l5-42-5-4-5 4zM4 50l42-5 4 5-4 5zM96 50l-42-5-4 5 4 5z"/><path d="M50 50l22-22-18 26zM50 50l-22 22 18-26zM50 50l22 22-26-18zM50 50L28 28l26 18z" opacity=".6"/></g></svg>';
  // bounties: points x 10,000,000 Berries, written the way the posters write them, with a trailing dash
  const bounty = id => (U.points(id) * 10000000 || 1000).toLocaleString("en-US") + "-";
  // the back of a card in the chosen deck design (uno-backs.js); the Sunwake's Jolly Roger is the default
  function backHTML(k, o = {}) {
    const g = o.tag || "div", b = window.UnoBacks ? UnoBacks.inner(k) : null;
    return `<${g} class="ucard uback ${b ? b.cls : ""} ${o.cls || ""}" ${o.attrs || ""}>${b ? b.html : `<span class="fl">${ROSE}${SKULL()}</span><span class="bt2">GRAND LINE</span><span class="bt">UNO</span>`}</${g}>`;
  }
  function cardHTML(id, o = {}) {
    const g = o.tag || "div";
    if (id == null || id < 0) return backHTML(window.UnoBacks ? UnoBacks.get() : "sunwake", o);
    const c = U.card(id), K = U.KINDS[c.v], pip = K ? PIP[c.v] : c.v;
    // a player's own picture for this number (Card art, this browser only) takes the photo box; otherwise the Sunwake crew
    const mine = !K && window.UnoArt ? UnoArt.get(+c.v) || (window.UnoPhoto ? UnoPhoto.forCard(+c.v) : null) : null, crew = !K && window.UnoCrew ? UnoCrew[+c.v] : null;
    const who = K ? K.alias : mine && mine.name ? mine.name : crew ? crew.name : U.COLORS[c.c].sea;
    return `<${g} class="ucard c-${c.c} v-${c.v} ${o.cls || ""}" ${o.attrs || ""} aria-label="${esc(U.label(id))}"><span class="pw">
        <span class="wt">WANTED</span>
        <span class="ph${crew || mine ? " crew" : ""}">${K ? (ART_IMG[c.v] ? imgHTML(ART_IMG[c.v]) : "") + ART[c.v] + (ART_IMG[c.v] && ART_IMG[c.v].mark ? `<span class="numc">${ART_IMG[c.v].mark}</span>` : "") : mine ? `<img class="custom" src="${mine.src}" alt=""><span class="numc">${c.v}</span>` : crew ? `${crew.img ? imgHTML(crew) : ""}${crew.art}<span class="numc">${c.v}</span>` : `<span class="num">${c.v}</span>`}</span>
        <span class="doa">DEAD OR ALIVE</span><span class="who" style="--ws:${who.length > 13 ? .056 : who.length > 10 ? .068 : .092}">${esc(who.toUpperCase())}</span>
        <span class="bty">${BERRY}${bounty(id)}</span><span class="mar">MARINE</span></span>
      <span class="tack"></span><span class="pip tl">${pip}</span></${g}>`;
  }
  const FLAG_COLORS = ["#e8b83c", "#c8281e", "#2f9a52", "#1f6fd1", "#8c3fb0", "#f08a24", "#21a3a3", "#e05a9a", "#9aa4ad", "#6b4423", "#d6d03a", "#4a5bd6"];
  const flagFor = i => SKULL(FLAG_COLORS[i % 12]);

  // ---- home page pieces ----
  const FAN = [[2, "-24deg", -96, 14], [24 + 26, "-8deg", -34, -4], [104, "8deg", 30, -4], [105 + 2, "22deg", 92, 14]];
  function mastHTML() {
    const pick = c => U.CARDS.find(k => k.c === c.c && k.v === c.v).id;
    const fan = [{ c: "r", v: "7" }, { c: "b", v: "rev" }, { c: "w", v: "wild" }, { c: "w", v: "w4" }].map(pick);
    return `<header class="umast"><div><h1>Grand Line<span>UNO</span></h1>
      <p>Set sail with up to 12 friends, each on their own phone or computer. Match the colour or the symbol, cuff your rivals with Seastone, send for backup by Message Gull, stack the draws to sink them, and be the first crew to empty your hand. Don't forget to shout UNO!</p></div>
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
        <li><span class="mini">${ex("skip")}</span><b>Seastone Cuffs</b> (Skip): the next player is cuffed and loses their turn.</li>
        <li><span class="mini">${ex("rev")}</span><b>Log Pose</b> (Reverse): the course swings round and play turns the other way. With two players it acts like a Skip.</li>
        <li><span class="mini">${ex("d2")}</span><b>Message Gull</b> (Draw 2): a gull flies in with word of backup; the next player draws 2, unless they stack.</li>
        <li><span class="mini">${ex("wild")}</span><b>Devil Fruit</b> (Wild): choose the next colour.</li>
        <li><span class="mini">${ex("w4")}</span><b>Conqueror's Haki</b> (Wild Draw 4): choose the colour; the next player draws 4, unless they stack.</li></ul></div>
      <div><h3>Stacking</h3><ul>
        <li>Hit by a Message Gull? Answer with another <b>Message Gull</b> or a <b>Conqueror's Haki</b> to pass the pile on, bigger.</li>
        <li>Hit by Conqueror's Haki? Only another <b>Conqueror's Haki</b> passes it on.</li>
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
        <span class="flag">${window.UnoPhoto && UnoPhoto.src(i) ? `<img class="pface" src="${UnoPhoto.src(i)}" alt="">` : flagFor(i)}</span><span class="nm">${i === v ? "You" : esc(nameOf(i))}</span>
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
        if (S.stack > 0) { say = `Hit for +${S.stack}!<small>Stack a ${S.stackKind === "d2" ? "Message Gull (+2) or Conqueror's Haki (+4)" : "Conqueror's Haki (+4)"} to pass it on, or take all ${S.stack}.</small>`; btns = `<button class="ubtn go" data-u="draw">Take ${S.stack} cards</button>`; }
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
      <header class="board"><div class="board-top"><span class="mark">Grand Line UNO</span><span class="tcode"><span class="tl2">Table </span><b>${esc(S.code)}</b></span><span class="grow"></span>${netDown ? `<span class="conn">Reconnecting…</span>` : ""}${window.UnoPhoto && v >= 0 ? UnoPhoto.button() : ""}${window.UnoArt ? UnoArt.button() : ""}${window.UnoBacks ? UnoBacks.button() : ""}${window.Radio ? Radio.button() : ""}${sndBtn()}<button class="btn ghost small" data-a="home">Leave table</button></div>
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
    return `<div class="uwin"><div class="poster"><div class="w">WANTED</div>${window.UnoPhoto && UnoPhoto.src(w) ? `<img class="wface" src="${UnoPhoto.src(w)}" alt="">` : ""}<div class="bty">Winner of the voyage</div><div class="who">${w === v ? "You" : esc(nameOf(w))}</div>
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
      const disc = box(document.querySelector(".udisc .top")), pile = box(document.querySelector(".upile .ucard.uback")), seat = i => box(document.querySelector(`.useat[data-p="${i}"] .flag`));
      if (L.k === "play") {
        const c = U.card(L.card), from = L.p === v && ui.rects.get(L.card) ? ui.rects.get(L.card).rect : seat(L.p);
        const top = document.querySelector(".udisc .top");
        if (!calm && from && disc && top) { top.style.opacity = "0"; ghost(cardHTML(L.card), from, disc, { w: disc.width, h: disc.height, end: 1, mid: 1.15, spin: 16, arc: 60, dur: 520, land: () => { top.style.opacity = ""; top.animate([{ transform: "scale(1.25)", filter: "brightness(1.8)" }, { transform: "none", filter: "none" }], { duration: 360, easing: "ease-out" }); } }); }
        if (window.Sfx) Sfx.place();
        const K = U.KINDS[c.v], who = nameOf(L.p), colr = U.COLORS[L.col] ? U.COLORS[L.col].hex : "#ffd23f";
        if (K) {
          const sub = c.v === "skip" ? `${who} cuffs the next pirate · they lose a turn` : c.v === "rev" ? "The needle swings · the course turns around" : c.v === "d2" ? `Backup is on its way · +${S.stack}` : c.v === "w4" ? `+${S.stack} · the sea turns ${U.COLORS[L.col].n}` : `The sea turns ${U.COLORS[L.col].n}`;
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
    const added = snap.hand.filter(id => !prev.hand.includes(id)), pile = box(document.querySelector(".upile .ucard.uback"));
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

  window.UnoUI = { render, mastHTML, rulesHTML, cardHTML, backHTML, reset() { ui.prev = null; ui.pick = null; ui.uno = false; } };
})();
