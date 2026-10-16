// Grand Line UNO: the crew portraits for the wanted posters on number cards, 0 to 9. Original chibi-style fan
// drawings, each built from a few signature traits (a straw hat, three swords, a curly brow...), not copied from any
// official art. Every portrait is a bust in a 100 x 82 box, sized to the poster's photo.
(function () {
  "use strict";
  const INK = "#24170e", SKIN = "#f6cfa6", SKIN_S = "#e2a97c";
  const O = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  const neck = (s = SKIN) => `<path d="M43 52v11h14V52" fill="${s}" ${O}/><path d="M43 57c4 2 10 2 14 0" stroke="${SKIN_S}" stroke-width="2" fill="none"/>`;
  const torso = (fill, extra = "") => `<path d="M12 82c2-13 16-20 38-20s36 7 38 20z" fill="${fill}" ${O}/>${extra}`;
  const head = (s = SKIN, w = 17) => `<path d="M${50 - w} 38c0-13 ${w * .4} -21 ${w} -21s${w} 8 ${w} 21c0 11-${w * .4} 19-${w} 19s-${w}-8-${w}-19z" fill="${s}" ${O}/>`;
  const ears = (s = SKIN) => `<ellipse cx="32.5" cy="41" rx="3.2" ry="4.4" fill="${s}" ${O}/><ellipse cx="67.5" cy="41" rx="3.2" ry="4.4" fill="${s}" ${O}/>`;
  const eye = (x, y = 40, c = INK, rx = 2.5, ry = 3.4) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/><circle cx="${x + .8}" cy="${y - 1.2}" r=".95" fill="#fff"/>`;
  const brow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  const svg = body => `<svg viewBox="0 0 100 82" aria-hidden="true">${body}</svg>`;

  const CREW = [
    { name: "Monkey D. Luffy", art: svg(
      torso("#d12b2b", `<path d="M43 62l7 20 7-20z" fill="${SKIN}" ${O}/><path d="M46 70l8 8M54 70l-8 8" stroke="#b3442c" stroke-width="2"/>`) + neck() + ears() + head() +
      `<path d="M32 34l3 8 2-7 3 6 1-8 18 0 1 8 3-6 2 7 3-8c-2-8-9-12-18-12s-16 4-18 12z" fill="#16110c" ${O}/>` +
      eye(43) + eye(57) + brow(39.5, 34, 45.5, 33.5) + brow(54.5, 33.5, 60.5, 34) +
      `<path d="M39 46q11 11 22 0z" fill="#fff" ${O}/><path d="M42 49q8 4 16 0" stroke="#d65b5b" stroke-width="2" fill="none"/>` +
      `<path d="M55 44.5q3 1.5 6 0" stroke="#b3442c" stroke-width="1.4" fill="none"/><path d="M56.5 43.5v2.5M59.5 43.5v2.5" stroke="#b3442c" stroke-width="1"/>` +
      `<ellipse cx="50" cy="24" rx="31" ry="6.2" fill="#f2cd52" ${O}/><path d="M34 24c0-11 7-17 16-17s16 6 16 17z" fill="#f2cd52" ${O}/><path d="M34.6 17.5h30.8v4.6H34.6z" fill="#d12b2b" stroke="${INK}" stroke-width="1.8"/>` +
      `<path d="M24 25q26 5 52 0" stroke="#c9a032" stroke-width="1.4" fill="none"/>`) },
    { name: "Roronoa Zoro", art: svg(
      `<path d="M74 82L88 30M80 82L94 36M68 82L80 26" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M85 34l5-12M91 40l5-12M77 30l4-12" stroke="#e8e0cc" stroke-width="3" stroke-linecap="round"/>` +
      torso("#2f6b3b", `<path d="M40 63l10 12 10-12" fill="#f4efe2" ${O}/>`) + neck() + ears() + head() +
      `<path d="M33 35c0-13 7-20 17-20s17 7 17 20c-3-5-6-7-9-8 1 3 0 4-2 5-1-3-4-5-6-5-3 0-7 2-9 5-2-1-3-3-2-5-3 1-5 4-6 8z" fill="#5fae4f" ${O}/>` +
      eye(43, 40, INK, 2.3, 2.6) + brow(39, 35.5, 46, 37) + brow(54, 37, 61, 35.5) +
      `<path d="M54 41q3 1.5 6 0" stroke="${INK}" stroke-width="2.2" fill="none"/><path d="M57 31v16" stroke="#b3442c" stroke-width="1.8"/>` +
      `<path d="M45 49h10" stroke="${INK}" stroke-width="2.2"/>` +
      `<circle cx="69.5" cy="45" r="1.6" fill="#f2cd52" stroke="${INK}" stroke-width=".8"/><circle cx="69.8" cy="48.4" r="1.6" fill="#f2cd52" stroke="${INK}" stroke-width=".8"/><circle cx="69.4" cy="51.8" r="1.6" fill="#f2cd52" stroke="${INK}" stroke-width=".8"/>`) },
    { name: "Nami", art: svg(
      `<path d="M27 42c0-21 10-29 23-29s23 8 23 29c0 16-2 28-5 40H32c-3-12-5-24-5-40z" fill="#f0862c" ${O}/>` +
      torso("#f4efe2", `<path d="M22 70c8-3 16-4 28-4s20 1 28 4M18 76c10-3 20-4 32-4s22 1 32 4" stroke="#2f6fc0" stroke-width="3" fill="none"/>`) + neck() + head() +
      `<path d="M33 36c1-12 8-19 17-19s16 7 17 19c-4-5-9-9-15-10-1 4-5 7-9 8 1-2 1-4 0-6-4 2-7 5-10 8z" fill="#f59a3c" ${O}/>` +
      eye(43, 41, "#7a4a1c", 2.8, 3.8) + eye(57, 41, "#7a4a1c", 2.8, 3.8) + `<path d="M39.5 37.5l-2-1.5M60.5 37.5l2-1.5" stroke="${INK}" stroke-width="1.6"/>` +
      `<path d="M45 48q5 3.5 10 0" stroke="${INK}" stroke-width="2" fill="none"/><ellipse cx="38.5" cy="46" rx="2.6" ry="1.4" fill="#f5a3a3" opacity=".7"/><ellipse cx="61.5" cy="46" rx="2.6" ry="1.4" fill="#f5a3a3" opacity=".7"/>`) },
    { name: "Usopp", art: svg(
      torso("#c9a35c", `<path d="M30 68h40v14H30z" fill="#7a5a33" ${O}/><path d="M36 64v6M64 64v6" stroke="${INK}" stroke-width="2"/>`) + neck("#c98a5e") + ears("#c98a5e") + head("#c98a5e") +
      `<path d="M32 36c-3-6 0-12 5-13 0-6 6-9 11-7 4-4 11-3 13 2 6 0 9 6 7 11 3 3 2 8-1 10-1-6-4-9-8-10h-20c-4 1-7 4-7 7z" fill="#22160f" ${O}/>` +
      `<path d="M32 27h36" stroke="#5a3a20" stroke-width="3.5"/><circle cx="42" cy="26" r="5" fill="#f2d24a" ${O}/><circle cx="58" cy="26" r="5" fill="#f2d24a" ${O}/><circle cx="40.5" cy="24.5" r="1.4" fill="#fff"/><circle cx="56.5" cy="24.5" r="1.4" fill="#fff"/>` +
      eye(43, 39) + eye(57, 39) +
      `<path d="M49 41l22 3-22 4z" fill="#c98a5e" ${O}/>` +
      `<path d="M42 51q8 4 16 0" fill="#b8574f" ${O}/>`) },
    { name: "Sanji", art: svg(
      torso("#1d1d24", `<path d="M42 62l8 20 8-20z" fill="#f4efe2" ${O}/><path d="M48.5 66h3l1 14-2.5 2-2.5-2z" fill="#2c3e6b" stroke="${INK}" stroke-width="1.4"/>`) + neck() + ears() + head() +
      eye(43, 41) + `<path d="M38 36q4-4 8-1 1 2-1 2" stroke="${INK}" stroke-width="2" fill="none"/>` +
      `<path d="M32 38c0-15 8-22 18-22s18 7 18 22c0 6-1 11-3 14-3-4-6-8-7-14-2 3-5 4-8 4 2-3 3-6 3-9-5 4-11 6-17 5z" fill="#f4d35a" ${O}/>` +
      `<path d="M45 49h7" stroke="${INK}" stroke-width="2.2"/><path d="M47.5 52.5c1 1 4 1 5 0" stroke="#d9b54a" stroke-width="2" fill="none"/>` +
      `<path d="M38 50l-10 2" stroke="#f4efe2" stroke-width="3" stroke-linecap="round"/><circle cx="27.6" cy="52.1" r="1.6" fill="#ff6a2a"/><path d="M27 49c-3-3 1-5-1-8s2-5 0-8" stroke="#cfc8bb" stroke-width="1.4" fill="none" opacity=".8"/>`) },
    { name: "Tony Tony Chopper", art: svg(
      torso("#a8693a", `<path d="M36 70h28v12H36z" fill="#f08a2c" ${O}/>`) +
      `<path d="M30 30c-8-4-12-12-10-20M24 20l-8-4M22 14l-6 2M70 30c8-4 12-12 10-20M76 20l8-4M78 14l6 2" stroke="#7a4a22" stroke-width="3.5" fill="none" stroke-linecap="round"/>` +
      `<path d="M31 44c0-12 8-18 19-18s19 6 19 18c0 10-8 17-19 17s-19-7-19-17z" fill="#b8763f" ${O}/>` +
      `<path d="M38 48c0-5 5-7 12-7s12 2 12 7-5 8-12 8-12-3-12-8z" fill="#f2dcc0" ${O}/>` +
      eye(42, 42, INK, 3.4, 4.4) + eye(58, 42, INK, 3.4, 4.4) +
      `<ellipse cx="50" cy="47" rx="4" ry="3" fill="#3f86e0" ${O}/><path d="M46 52q4 3 8 0" stroke="${INK}" stroke-width="1.8" fill="none"/>` +
      `<ellipse cx="50" cy="31" rx="24" ry="5" fill="#f19ac0" ${O}/><path d="M35 31V12c0-3 30-3 30 0v19z" fill="#f19ac0" ${O}/><path d="M35 26h30" stroke="#c65a8a" stroke-width="3"/><path d="M44 15l12 9M56 15l-12 9" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`) },
    { name: "Nico Robin", art: svg(
      `<path d="M29 40c0-20 9-27 21-27s21 7 21 27v42H29z" fill="#1b1622" ${O}/>` +
      torso("#6a3c8c") + neck() + head() +
      `<path d="M32 33c1-11 8-17 18-17s17 6 18 17c-2 2-34 2-36 0z" fill="#1b1622" ${O}/><path d="M33 33l-1 14M67 33l1 14" stroke="#1b1622" stroke-width="4"/>` +
      eye(43, 41, "#3a5fa8", 2.4, 3.2) + eye(57, 41, "#3a5fa8", 2.4, 3.2) + brow(40, 37, 46, 37.5) + brow(54, 37.5, 60, 37) +
      `<path d="M46 49q4 2 8 0" stroke="${INK}" stroke-width="2" fill="none"/>`) },
    { name: "Franky", art: svg(
      torso("#d9473b", `<path d="M36 62l14 20 14-20z" fill="#c98a5e" ${O}/><circle cx="28" cy="72" r="3" fill="#f2cd52"/><circle cx="72" cy="74" r="3" fill="#f2cd52"/><circle cx="22" cy="78" r="2.4" fill="#f2cd52"/>`) + neck("#c98a5e") + ears("#c98a5e") +
      `<path d="M33 38c0-13 7-21 17-21s17 8 17 21c0 13-6 21-17 21s-17-8-17-21z" fill="#c98a5e" ${O}/>` +
      `<path d="M30 30c-2-14 10-24 24-22 12 1 20 8 18 18-6-6-14-6-20-3-6-4-14-4-22 7z" fill="#3fa0e8" ${O}/>` +
      `<path d="M35 38h30v6c0 2-2 3-4 3h-7c-2 0-3-2-4-4-1 2-2 4-4 4h-7c-2 0-4-1-4-3z" fill="#1c1c22" ${O}/><path d="M39 40l4 0" stroke="#7fd0ff" stroke-width="1.6"/>` +
      `<path d="M41 50q9 6 18 0z" fill="#fff" ${O}/><path d="M46 56q4 2 8 0" stroke="${INK}" stroke-width="1.6" fill="none"/>`) },
    { name: "Brook", art: svg(
      `<circle cx="34" cy="28" r="12" fill="#141414"/><circle cx="66" cy="28" r="12" fill="#141414"/><circle cx="50" cy="22" r="16" fill="#141414"/><circle cx="30" cy="40" r="9" fill="#141414"/><circle cx="70" cy="40" r="9" fill="#141414"/>` +
      torso("#1d1d24", `<path d="M44 62l6 8 6-8" fill="#f4efe2" ${O}/><path d="M43 64l7 3 7-3-7 3z" fill="#c62b25" stroke="${INK}" stroke-width="1.4"/>`) +
      `<path d="M47 52v10h6V52" fill="#f4f0e6" ${O}/>` +
      `<path d="M35 38c0-11 7-17 15-17s15 6 15 17c0 7-3 12-7 14v4H42v-4c-4-2-7-7-7-14z" fill="#f4f0e6" ${O}/>` +
      `<ellipse cx="43.5" cy="39" rx="4" ry="4.6" fill="${INK}"/><ellipse cx="56.5" cy="39" rx="4" ry="4.6" fill="${INK}"/><path d="M48.5 46l1.5-3 1.5 3z" fill="${INK}"/>` +
      `<path d="M43 51h14M46 49v5M50 49v5M54 49v5" stroke="${INK}" stroke-width="1.4"/>` +
      `<ellipse cx="50" cy="14" rx="16" ry="3.6" fill="#141414" stroke="#3a3a3a" stroke-width="1.4"/><path d="M40 14V2h20v12z" fill="#141414" stroke="#3a3a3a" stroke-width="1.4"/>`) },
    { name: "Jinbe", art: svg(
      torso("#2b4a7a", `<path d="M38 62l12 20 12-20" fill="none" stroke="#f4efe2" stroke-width="3"/><path d="M18 76q8-4 14 0t14 0M54 76q8-4 14 0t14 0" stroke="#7fb0e8" stroke-width="2" fill="none"/>`) + neck("#5a8fd6") +
      `<path d="M29 40c0-15 9-23 21-23s21 8 21 23c0 12-8 20-21 20s-21-8-21-20z" fill="#5a8fd6" ${O}/>` +
      `<path d="M30 33c1-11 9-17 20-17s19 6 20 17c-6-4-13-6-20-6s-14 2-20 6z" fill="#141414" ${O}/><path d="M60 18c8-4 14 0 16 6-4-2-8-2-12 0z" fill="#141414" ${O}/>` +
      eye(42, 40, INK, 2.2, 2.6) + eye(58, 40, INK, 2.2, 2.6) + `<path d="M37 35l9 2M63 35l-9 2" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M41 52q9-4 18 0" stroke="${INK}" stroke-width="2.4" fill="none"/><path d="M42 51l-1-6 3 5M58 51l1-6-3 5" fill="#fff" stroke="${INK}" stroke-width="1.2"/>` +
      `<ellipse cx="50" cy="46" rx="3" ry="2" fill="#3f6fb0"/>`) }
  ];
  window.UnoCrew = CREW;
})();
