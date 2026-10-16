// Grand Line UNO: card fronts. Each player picks how the front of every card looks on their own screen (this browser
// only, like the card backs): the classic WANTED poster or one of ten full designs that keep only the picture. The
// choice is kept in localStorage; uno-ui.js asks UnoFaces.render for the markup and keeps the classic poster itself.
(function () {
  "use strict";
  const KEY = "wd-face";
  const FACES = [
    { k: "classic", n: "Classic Wanted" }, { k: "f1", n: "Full-Art Holo" }, { k: "f2", n: "Royal Playing Card" }, { k: "f3", n: "Art Deco" },
    { k: "f4", n: "Manga Panel" }, { k: "f5", n: "Swiss Minimal" }, { k: "f6", n: "Neon Glass" }, { k: "f7", n: "Captain's Log" },
    { k: "f8", n: "Tarot of the Seas" }, { k: "f9", n: "Rookie Card" }, { k: "f10", n: "Egghead HUD" }
  ];
  const valid = k => FACES.some(f => f.k === k);
  let cur = "f9";
  try { const s = localStorage.getItem(KEY); if (valid(s)) cur = s; } catch (e) { /* storage blocked: keep the default */ }

  // Every face sizes itself from the card's width with container units (cqw). The poster's gold rule (::before) is
  // switched off; ::after stays the game's foil sheen. Decorations live in their own spans.
  const F = ".ucard.face";
  const css = `
${F}{container-type:inline-size;--grad:linear-gradient(160deg,var(--cl),var(--cc) 45%,var(--cd));background:#000;border-radius:calc(var(--w)*.075);
  box-shadow:0 calc(var(--w)*.012) calc(var(--w)*.02) rgba(0,0,0,.5),0 calc(var(--w)*.1) calc(var(--w)*.22) calc(var(--w)*-.06) rgba(0,0,0,.8)}
${F}.c-w{--cc:#e7a20f;--cl:#ffe68f;--cd:#2a1a00;--grad:conic-gradient(from 45deg,#e23a4c 0 25%,#3d84f0 0 50%,#1fb071 0 75%,#f7c03a 0)}
${F}::before{content:none}
${F} .q-pic{position:absolute;overflow:hidden;display:block}
${F} .q-pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
${F} .q-pic img + svg{display:none}
${F} .q-pic > svg{position:absolute;left:6%;top:6%;width:88%;height:88%}
${F} .q-mk{display:inline-grid;place-items:center;line-height:1}
${F} .q-mk svg{width:1em;height:1em;display:block}
${F} .q-dec,${F} .q-fx{position:absolute;pointer-events:none;display:block}
/* a small value in the top-left corner, for faces whose main value sits where a fanned hand covers it */
${F} .q-cx{position:absolute;left:5cqw;top:5cqw;z-index:4;min-width:19cqw;height:19cqw;padding:0 2.5cqw;border-radius:4cqw;display:grid;place-items:center;font:400 13cqw/1 "Bebas Neue",sans-serif}
${F} .q-cx svg{width:11cqw;height:11cqw}

/* 1 Full-Art Holo */
${F}.f1 .q-pic{inset:0}
${F}.f1 .q-pic::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),transparent 22%,transparent 55%,rgba(0,0,0,.75))}
${F}.f1 .q-dec{inset:3.5cqw;border-radius:5cqw;border:.9cqw solid transparent;z-index:2;
  background:linear-gradient(135deg,#fff1c2,#c9952f,#fff8dc,#9c6a16,#f6dc93) border-box;-webkit-mask:linear-gradient(#000 0 0) padding-box exclude,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) padding-box exclude,linear-gradient(#000 0 0)}
${F}.f1 .q-ix{position:absolute;z-index:3;display:flex;flex-direction:column;align-items:center;gap:1cqw;font:400 17cqw/.85 "Bebas Neue",sans-serif;color:#fff;text-shadow:0 .8cqw 2cqw rgba(0,0,0,.7)}
${F}.f1 .q-ix i{display:block;width:9cqw;height:2.4cqw;border-radius:2cqw;background:var(--grad);box-shadow:0 0 0 .5cqw rgba(255,255,255,.8)}
${F}.f1 .q-ix.q-tl{left:8cqw;top:7cqw}${F}.f1 .q-ix.q-br{right:8cqw;bottom:7cqw;transform:rotate(180deg)}
${F}.f1 .q-plate{position:absolute;z-index:3;left:12cqw;right:22cqw;bottom:9cqw;padding:2.6cqw 3cqw;border-radius:3cqw;background:color-mix(in srgb,var(--cc) 35%,rgba(10,10,20,.35));
  backdrop-filter:blur(6px) saturate(1.4);-webkit-backdrop-filter:blur(6px) saturate(1.4);border:.5cqw solid rgba(255,255,255,.35);font:400 7.6cqw/1 "Bebas Neue",sans-serif;letter-spacing:.06em;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${F}.f1 .q-fx{inset:0;z-index:4;mix-blend-mode:color-dodge;opacity:.4;
  background:radial-gradient(circle at var(--mx,50%) var(--my,35%),rgba(255,255,255,.5),transparent 40%),repeating-linear-gradient(115deg,#ff6fb5 0%,#ffcf5c 7%,#6dffbf 14%,#5cc0ff 21%,#b58cff 28%,#ff6fb5 35%) 50% 50%/320% 320%;
  animation:fHolo 9s linear infinite}
@keyframes fHolo{to{background-position:center,320% 160%}}

/* 2 Royal Playing Card */
${F}.f2{background:radial-gradient(120% 90% at 30% 10%,#fffdf6,#f3ead6 70%,#e6d8b8)}
${F}.f2 .q-dec{inset:3cqw;border-radius:5cqw;border:.7cqw solid var(--cc);box-shadow:inset 0 0 0 1.4cqw #fffdf6,inset 0 0 0 1.8cqw color-mix(in srgb,var(--cc) 60%,transparent)}
${F}.f2 .q-ov{position:absolute;left:50%;top:50%;width:78cqw;height:116cqw;transform:translate(-50%,-50%) rotate(28deg);border-radius:50%;padding:2.2cqw;z-index:1;display:block;
  background:conic-gradient(from var(--fa),#fff1c2,#c9952f,#fff8dc,#9c6a16,#f6dc93,#c9952f,#fff1c2);animation:fTurn 8s linear infinite;box-shadow:0 2cqw 5cqw rgba(0,0,0,.35)}
${F}.f2 .q-ovi{position:relative;display:block;width:100%;height:100%;border-radius:50%;overflow:hidden;background:var(--grad)}
${F}.f2 .q-ovi .q-pic{inset:-22%;transform:rotate(-28deg)}
${F}.f2 .q-ix{position:absolute;z-index:2;display:flex;flex-direction:column;align-items:center;font:900 15cqw/.9 "Playfair Display",serif;color:var(--cc);text-shadow:0 .4cqw 0 #fff}
${F}.f2.c-w .q-ix{color:#2a1a00}
${F}.f2 .q-ix small{display:block;font:800 4cqw/1 var(--label);letter-spacing:.14em;color:#3a2a14;margin-top:1cqw;writing-mode:vertical-rl;text-transform:uppercase;max-height:34cqw;overflow:hidden}
${F}.f2 .q-ix.q-tl{left:7cqw;top:7cqw}${F}.f2 .q-ix.q-br{right:7cqw;bottom:7cqw;transform:rotate(180deg)}

/* 3 Art Deco */
${F}.f3{background:linear-gradient(180deg,#141414,#050505)}
${F}.f3 .q-dec{inset:3cqw;border:.6cqw solid #d6a640;box-shadow:inset 0 0 0 1.4cqw #050505,inset 0 0 0 1.8cqw #8c6316;
  clip-path:polygon(8cqw 0,calc(100% - 8cqw) 0,calc(100% - 8cqw) 3cqw,calc(100% - 3cqw) 3cqw,calc(100% - 3cqw) 8cqw,100% 8cqw,100% calc(100% - 8cqw),calc(100% - 3cqw) calc(100% - 8cqw),calc(100% - 3cqw) calc(100% - 3cqw),calc(100% - 8cqw) calc(100% - 3cqw),calc(100% - 8cqw) 100%,8cqw 100%,8cqw calc(100% - 3cqw),3cqw calc(100% - 3cqw),3cqw calc(100% - 8cqw),0 calc(100% - 8cqw),0 8cqw,3cqw 8cqw,3cqw 3cqw,8cqw 3cqw)}
${F}.f3 .q-rays{position:absolute;left:50%;top:44cqw;width:170cqw;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;display:block;
  background:repeating-conic-gradient(from var(--fa),color-mix(in srgb,var(--cc) 70%,transparent) 0 4deg,transparent 4deg 12deg);animation:fTurn 40s linear infinite;
  -webkit-mask:radial-gradient(circle,#000 20%,transparent 62%);mask:radial-gradient(circle,#000 20%,transparent 62%)}
${F}.f3 .q-pic{left:17cqw;right:17cqw;top:14cqw;height:72cqw;border-radius:33cqw 33cqw 2cqw 2cqw;border:.8cqw solid #e8c46e;box-shadow:0 0 0 1.2cqw #050505,0 0 0 1.7cqw #b07a1e;background:var(--grad)}
${F}.f3 .q-nm{position:absolute;left:6cqw;right:6cqw;top:95cqw;text-align:center;font:700 6.2cqw/1.1 "Cinzel",serif;letter-spacing:.14em;color:#f6dc93;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${F}.f3 .q-nm::after{content:"";display:block;margin:2cqw auto 0;width:40cqw;height:.5cqw;background:linear-gradient(90deg,transparent,#d6a640,transparent)}
${F}.f3 .q-med{position:absolute;left:50%;bottom:8cqw;transform:translateX(-50%);width:26cqw;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;isolation:isolate;
  background:radial-gradient(circle at 35% 30%,#fff6cf,#d6a640 45%,#7a5410);box-shadow:0 0 0 1cqw #050505,0 0 0 1.5cqw #d6a640,0 1.5cqw 3cqw rgba(0,0,0,.6);font:900 13cqw/1 "Cinzel",serif;color:#2a1a00}
${F}.f3 .q-med i{position:absolute;inset:-4cqw;border-radius:50%;background:var(--grad);z-index:-1;-webkit-mask:radial-gradient(circle,transparent 62%,#000 63%);mask:radial-gradient(circle,transparent 62%,#000 63%)}
${F}.f3 .q-cx{background:radial-gradient(circle at 35% 30%,#fff6cf,#d6a640 45%,#7a5410);color:#2a1a00;font-family:"Cinzel",serif;font-weight:900;font-size:10cqw;border-radius:50%;box-shadow:0 0 0 .8cqw #050505,0 0 0 1.3cqw var(--cc)}

/* 4 Manga Panel */
${F}.f4{background:radial-gradient(circle,color-mix(in srgb,var(--cc) 45%,transparent) 28%,transparent 32%) 0 0/4cqw 4cqw,#fffaf0;box-shadow:inset 0 0 0 1.6cqw #111,0 calc(var(--w)*.1) calc(var(--w)*.22) calc(var(--w)*-.06) rgba(0,0,0,.8)}
${F}.f4 .q-speed{position:absolute;inset:-30%;display:block;background:repeating-conic-gradient(from var(--fa) at 50% 45%,rgba(0,0,0,.85) 0 .8deg,transparent .8deg 7deg);
  -webkit-mask:radial-gradient(circle at 50% 45%,transparent 26%,#000 60%);mask:radial-gradient(circle at 50% 45%,transparent 26%,#000 60%);animation:fJitter .45s steps(2) infinite}
${F}.f4 .q-pic{left:9cqw;right:9cqw;top:12cqw;height:84cqw;transform:rotate(-3deg);border:1.6cqw solid #111;background:var(--grad);box-shadow:2.2cqw 2.4cqw 0 #111}
${F}.f4 .q-burst{position:absolute;z-index:2;right:2cqw;bottom:22cqw;width:38cqw;aspect-ratio:1;display:grid;place-items:center;font:400 17cqw/1 "Bangers",cursive;color:#111;
  background:var(--cl);clip-path:polygon(50% 0,61% 22%,85% 10%,78% 35%,100% 42%,80% 58%,95% 82%,68% 76%,58% 100%,45% 78%,22% 95%,25% 70%,0 62%,20% 47%,5% 22%,32% 28%);animation:fPop 1.6s ease-in-out infinite}
${F}.f4.c-w .q-burst{background:#ffd23f}
${F}.f4 .q-cap{position:absolute;left:6cqw;right:6cqw;bottom:6cqw;z-index:2;padding:2.2cqw 3cqw;background:#111;color:#fff;font:400 8.6cqw/1 "Bangers",cursive;letter-spacing:.06em;transform:rotate(-1.5deg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${F}.f4 .q-cx{background:#111;color:#fff;font-family:"Bangers",cursive;box-shadow:0 0 0 .8cqw var(--cl)}

/* 5 Swiss Minimal */
${F}.f5{background:var(--grad)}
${F}.f5 .q-big{position:absolute;right:-6cqw;bottom:-14cqw;font:400 112cqw/.8 "Bebas Neue",sans-serif;color:rgba(255,255,255,.16)}
${F}.f5 .q-pic{left:8cqw;right:8cqw;top:8cqw;height:84cqw;border-radius:4cqw;box-shadow:0 3cqw 6cqw rgba(0,0,0,.35);background:rgba(0,0,0,.15)}
${F}.f5 .q-val{position:absolute;left:8cqw;bottom:20cqw;font:400 26cqw/.8 "Bebas Neue",sans-serif;color:#fff}
${F}.f5 .q-nm{position:absolute;left:8cqw;right:8cqw;bottom:9cqw;font:800 5.4cqw/1 var(--label);letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.92);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${F}.f5 .q-cx{background:rgba(0,0,0,.35);color:#fff;backdrop-filter:blur(4px)}
${F}.f5 .q-fx{inset:0;z-index:3;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.22) 45%,transparent 60%) 0 0/250% 100% no-repeat;animation:fSweep 6s ease-in-out infinite}
@keyframes fSweep{0%,50%{background-position:150% 0}100%{background-position:-50% 0}}

/* 6 Neon Glass */
${F}.f6{background:#05070d}
${F}.f6 .q-bg{position:absolute;inset:-10%;display:block;filter:blur(10px) brightness(.55) saturate(1.4)}
${F}.f6 .q-bg .q-pic{inset:0}
${F}.f6 .q-dec{inset:5cqw;border-radius:6cqw;background:rgba(255,255,255,.07);border:.5cqw solid rgba(255,255,255,.22);box-shadow:inset 0 1cqw 3cqw rgba(255,255,255,.08)}
${F}.f6 > .q-pic{left:10cqw;right:10cqw;top:10cqw;height:82cqw;border-radius:4.5cqw;box-shadow:0 0 0 .5cqw rgba(255,255,255,.3),0 0 6cqw color-mix(in srgb,var(--cc) 70%,transparent)}
${F}.f6 .q-val{position:absolute;left:10cqw;bottom:13cqw;font:900 21cqw/1 "Orbitron",sans-serif;color:#fff;text-shadow:0 0 2cqw var(--cl),0 0 6cqw var(--cc)}
${F}.f6 .q-nm{position:absolute;left:10cqw;right:8cqw;bottom:36cqw;font:700 5cqw/1 "Orbitron",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--cl);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${F}.f6 .q-fx{inset:0;border-radius:inherit;padding:1cqw;z-index:3;background:conic-gradient(from var(--fa),transparent 0 60%,var(--cl) 75%,#fff 80%,var(--cc) 85%,transparent 95%);animation:fTurn 3.5s linear infinite;
  -webkit-mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);filter:drop-shadow(0 0 2cqw var(--cl))}

/* 7 Captain's Log */
${F}.f7{background:linear-gradient(color-mix(in srgb,var(--cc) 55%,transparent),color-mix(in srgb,var(--cd) 70%,transparent)),url(assets/brown_leather.jpg) center/180%;background-blend-mode:multiply}
${F}.f7.c-w{background:linear-gradient(rgba(60,30,10,.4),rgba(20,10,4,.7)),url(assets/brown_leather.jpg) center/180%}
${F}.f7 .q-dec{inset:4cqw;border-radius:5cqw;border:.6cqw dashed rgba(255,236,200,.7);box-shadow:0 0 0 1.4cqw rgba(0,0,0,.25),inset 0 0 0 1.2cqw rgba(0,0,0,.2)}
${F}.f7 .q-port{position:absolute;left:50%;top:44cqw;width:80cqw;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;padding:7cqw;display:block;
  background:radial-gradient(circle,transparent 55%,rgba(0,0,0,.3) 56%,transparent 58%),radial-gradient(circle at 30% 25%,#fff3c4,#d6a640 35%,#7a5410 70%,#3b2808);box-shadow:0 2cqw 5cqw rgba(0,0,0,.6),inset 0 0 0 .6cqw rgba(255,255,255,.3)}
${F}.f7 .q-port .q-pic{position:relative;width:100%;height:100%;border-radius:50%;background:var(--grad);box-shadow:inset 0 0 4cqw rgba(0,0,0,.6)}
${F}.f7 .q-port .q-pic::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(130deg,transparent 35%,rgba(255,255,255,.45) 45%,transparent 55%) 0 0/300% 100% no-repeat;animation:fGlint 5s ease-in-out infinite}
${F}.f7 .q-plate{position:absolute;left:14cqw;right:14cqw;bottom:9cqw;height:38cqw;border-radius:3cqw;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2cqw;
  background:linear-gradient(180deg,#f3d98c,#c9952f 50%,#8c6316);box-shadow:0 1.4cqw 3cqw rgba(0,0,0,.5),inset 0 .5cqw 0 rgba(255,255,255,.5);color:#1e1204;text-shadow:0 .5cqw 0 rgba(255,240,200,.7)}
${F}.f7 .q-plate b{font:400 26cqw/.8 "Pirata One",serif}
${F}.f7 .q-plate .q-nm{display:block;font:800 5.4cqw/1 var(--label);letter-spacing:.14em;text-transform:uppercase;max-width:66cqw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${F}.f7 .q-cx{background:linear-gradient(180deg,#f3d98c,#c9952f 50%,#8c6316);color:#1e1204;font-family:"Pirata One",serif;font-size:14cqw;box-shadow:0 1cqw 2cqw rgba(0,0,0,.5)}
@keyframes fGlint{0%,55%{background-position:120% 0}100%{background-position:-60% 0}}

/* 8 Tarot of the Seas */
${F}.f8{background:radial-gradient(120% 80% at 50% 0%,color-mix(in srgb,var(--cc) 75%,#000),var(--cd) 55%,#020208)}
${F}.f8.c-w{background:radial-gradient(120% 80% at 50% 0%,#3a2a70,#14082e 55%,#020208)}
${F}.f8 .q-stars{position:absolute;inset:0;display:block;background:radial-gradient(circle,#fff 0 .35cqw,transparent .7cqw) 0 0/13cqw 15cqw,radial-gradient(circle,#ffe9a8 0 .3cqw,transparent .6cqw) 6cqw 8cqw/17cqw 19cqw;animation:fTwinkle 3s ease-in-out infinite alternate}
${F}.f8 .q-stars + .q-stars{background-position:4cqw 3cqw,11cqw 12cqw;animation-delay:-1.5s}
${F}.f8 .q-dec{inset:4cqw;border:.5cqw solid #d6a640;border-radius:3cqw;box-shadow:inset 0 0 0 1.4cqw transparent,inset 0 0 0 1.8cqw rgba(214,166,64,.6)}
${F}.f8 .q-rn{position:absolute;left:0;right:0;top:8cqw;text-align:center;font:700 9cqw/1 "Cinzel",serif;color:#f6dc93;letter-spacing:.1em;display:flex;justify-content:center}
${F}.f8 .q-pic{left:15cqw;right:15cqw;top:22cqw;height:78cqw;border-radius:35cqw 35cqw 1.5cqw 1.5cqw;border:.7cqw solid #e8c46e;box-shadow:0 0 0 1.5cqw rgba(0,0,0,.4),0 0 0 2cqw #b07a1e,0 0 8cqw color-mix(in srgb,var(--cl) 40%,transparent);background:var(--grad)}
${F}.f8 .q-ban{position:absolute;left:8cqw;right:8cqw;bottom:10cqw;height:15cqw;display:grid;place-items:center;font:700 5.6cqw/1 "Cinzel",serif;letter-spacing:.08em;color:#2a1a00;text-transform:uppercase;
  background:linear-gradient(180deg,#f6dc93,#c9952f);clip-path:polygon(0 0,100% 0,94% 50%,100% 100%,0 100%,6% 50%);white-space:nowrap;overflow:hidden;padding:0 9cqw}
${F}.f8 .q-cx{background:linear-gradient(180deg,#f6dc93,#c9952f);color:#2a1a00;font-family:"Cinzel",serif;font-weight:700;font-size:9cqw}
@keyframes fTwinkle{from{opacity:.25}to{opacity:1}}

/* 9 Rookie Card */
${F}.f9{background:#0b0b10}
${F}.f9 .q-pic{inset:0 0 18% 0;background:var(--grad)}
${F}.f9 .q-pic::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.3),transparent 26%)}
${F}.f9 .q-band{position:absolute;left:-10%;right:-10%;bottom:-4cqw;height:52cqw;transform:skewY(-9deg);display:block;background:var(--grad);box-shadow:0 -1.2cqw 0 #fff,0 -2.6cqw 0 color-mix(in srgb,var(--cc) 60%,#000)}
${F}.f9 .q-fx{left:-10%;right:-10%;bottom:44cqw;height:3cqw;transform:skewY(-9deg);background:linear-gradient(90deg,#9c6a16,#fff8dc,#c9952f,#fff1c2,#9c6a16) 0 0/200% 100%;animation:fFoil 3s linear infinite}
${F}.f9 .q-num{position:absolute;right:6cqw;bottom:6cqw;font:400 40cqw/.8 "Bebas Neue",sans-serif;color:#fff;transform:skewX(-8deg);text-shadow:1.2cqw 1.2cqw 0 rgba(0,0,0,.35)}
${F}.f9 .q-nm{position:absolute;left:7cqw;bottom:13cqw;max-width:50cqw;font:400 9cqw/.9 "Bebas Neue",sans-serif;letter-spacing:.04em;color:#fff;transform:skewX(-8deg);text-transform:uppercase}
${F}.f9 .q-cx{background:var(--grad);color:#fff;box-shadow:0 0 0 1cqw #fff,0 1.5cqw 3cqw rgba(0,0,0,.5);text-shadow:0 .5cqw 1cqw rgba(0,0,0,.4)}
@keyframes fFoil{to{background-position:200% 0}}

/* 10 Egghead HUD */
${F}.f10{background:linear-gradient(rgba(120,220,255,.06) 1px,transparent 1px) 0 0/6cqw 6cqw,linear-gradient(90deg,rgba(120,220,255,.06) 1px,transparent 1px) 0 0/6cqw 6cqw,radial-gradient(120% 90% at 50% 20%,#0d2236,#03080f)}
${F}.f10 .q-dec{inset:4cqw;filter:drop-shadow(0 0 1.5cqw var(--cl));background-repeat:no-repeat;
  background-image:linear-gradient(var(--cl),var(--cl)),linear-gradient(var(--cl),var(--cl)),linear-gradient(var(--cl),var(--cl)),linear-gradient(var(--cl),var(--cl)),linear-gradient(var(--cl),var(--cl)),linear-gradient(var(--cl),var(--cl)),linear-gradient(var(--cl),var(--cl)),linear-gradient(var(--cl),var(--cl));
  background-position:0 0,0 0,100% 0,100% 0,0 100%,0 100%,100% 100%,100% 100%;background-size:12cqw .8cqw,.8cqw 12cqw,12cqw .8cqw,.8cqw 12cqw,12cqw .8cqw,.8cqw 12cqw,12cqw .8cqw,.8cqw 12cqw}
${F}.f10 .q-pic{left:10cqw;right:10cqw;top:12cqw;height:80cqw;border:.5cqw solid color-mix(in srgb,var(--cl) 60%,transparent);background:var(--grad)}
${F}.f10 .q-pic::before{content:"";position:absolute;inset:0;z-index:1;background:repeating-linear-gradient(180deg,rgba(0,0,0,.25) 0 1px,transparent 1px 3px)}
${F}.f10 .q-pic::after{content:"";position:absolute;left:0;right:0;height:22%;z-index:2;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--cl) 55%,transparent),transparent);animation:fBeam 2.6s ease-in-out infinite}
${F}.f10 .q-hex{position:absolute;right:7cqw;bottom:8cqw;width:30cqw;aspect-ratio:1/1.1;display:grid;place-items:center;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);background:var(--cl);font:900 14cqw/1 "Orbitron",sans-serif;color:#03080f}
${F}.f10 .q-id{position:absolute;left:10cqw;bottom:10cqw;max-width:52cqw;font:500 4cqw/1.5 "Orbitron",sans-serif;letter-spacing:.08em;color:var(--cl);text-transform:uppercase}
${F}.f10 .q-id b{display:block;font-weight:700;font-size:5.4cqw;color:#e9fbff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${F}.f10 .q-id i{display:inline-block;width:1.6cqw;height:1.6cqw;border-radius:50%;background:var(--cl);margin-right:1.4cqw;animation:fBlink 1s steps(2) infinite}
${F}.f10 .q-cx{background:var(--cl);color:#03080f;font-family:"Orbitron",sans-serif;font-weight:900;font-size:9cqw;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);border-radius:0;width:19cqw;padding:0}
@keyframes fBeam{0%{top:-22%}100%{top:100%}}
@keyframes fBlink{50%{opacity:.15}}

@property --fa{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes fTurn{to{--fa:360deg}}
@keyframes fJitter{to{--fa:3deg}}
@keyframes fPop{50%{transform:scale(1.08) rotate(4deg)}}
@media (prefers-reduced-motion:reduce){${F} *,${F} *::before,${F} *::after{animation:none!important}}
/* tiny cards (the rules list) keep the picture and the value */
.mini ${F} :is(.q-nm,.q-plate,.q-cap,.q-ban,.q-id,.q-rn,.q-ix.q-br,.q-big,.q-fx){display:none}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
  // the markup of each face from the card's parts: p.art (the picture), p.val (number or sign), p.name, p.num (0-9 or null)
  const R = {
    f1: p => `${pic(p)}<span class="q-dec"></span><span class="q-ix q-tl">${p.val}<i></i></span><span class="q-ix q-br">${p.val}<i></i></span><span class="q-plate">${p.name}</span><span class="q-fx"></span>`,
    f2: p => `<span class="q-dec"></span><span class="q-ov"><span class="q-ovi">${pic(p)}</span></span><span class="q-ix q-tl">${p.val}<small>${p.name}</small></span><span class="q-ix q-br">${p.val}<small>${p.name}</small></span>`,
    f3: p => `<span class="q-rays"></span>${pic(p)}<span class="q-dec"></span><span class="q-nm">${p.name}</span><span class="q-med"><i></i>${p.val}</span><span class="q-cx">${p.val}</span>`,
    f4: p => `<span class="q-speed"></span>${pic(p)}<span class="q-burst">${p.val}</span><span class="q-cap">${p.name}</span><span class="q-cx">${p.val}</span>`,
    f5: p => `<span class="q-big">${p.val}</span>${pic(p)}<span class="q-val">${p.val}</span><span class="q-nm">${p.name}</span><span class="q-cx">${p.val}</span><span class="q-fx"></span>`,
    f6: p => `<span class="q-bg">${pic(p)}</span><span class="q-dec"></span>${pic(p)}<span class="q-nm">${p.name}</span><span class="q-val">${p.val}</span><span class="q-fx"></span>`,
    f7: p => `<span class="q-dec"></span><span class="q-port">${pic(p)}</span><span class="q-plate"><b>${p.val}</b><span class="q-nm">${p.name}</span></span><span class="q-cx">${p.val}</span>`,
    f8: p => `<span class="q-stars"></span><span class="q-stars"></span><span class="q-dec"></span><span class="q-rn">${p.num != null ? ROMAN[p.num] : p.val}</span>${pic(p)}<span class="q-ban">${p.name}</span><span class="q-cx">${p.val}</span>`,
    f9: p => `${pic(p)}<span class="q-band"></span><span class="q-fx"></span><span class="q-cx">${p.val}</span><span class="q-nm">${p.name}</span><span class="q-num">${p.val}</span>`,
    f10: p => `${pic(p)}<span class="q-dec"></span><span class="q-id"><i></i>Bounty ID<b>${p.name}</b></span><span class="q-hex">${p.val}</span><span class="q-cx">${p.val}</span>`
  };
  const pic = p => `<span class="q-pic">${p.art}</span>`;

  window.UnoFaces = {
    list: FACES, get: () => cur,
    set(k) { if (!valid(k)) return; cur = k; try { localStorage.setItem(KEY, k); } catch (e) { /* not remembered, still applied */ } },
    // the inside of a card in face k (the card element gets the classes "face k"), or null for the classic poster,
    // which uno-ui.js draws itself
    render(k, p) { return R[k] ? R[k](Object.assign({}, p, { val: `<span class="q-mk">${p.val}</span>` })) : null; }
  };
})();
