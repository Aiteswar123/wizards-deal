// Grand Line UNO: the crew of the Sunwake, an original pirate crew, one per number card 0 to 9. They appear in the
// photo box of each wanted poster. Every portrait is a chibi bust in a 100 x 82 box, sized to the poster's photo.
(function () {
  "use strict";
  const INK = "#24170e", SKIN = "#f6cfa6", SKIN_S = "#e2a97c", TAN = "#d9a172", DARK = "#8a5a3c";
  const O = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  const neck = (s = SKIN) => `<path d="M43 52v11h14V52" fill="${s}" ${O}/><path d="M43 57c4 2 10 2 14 0" stroke="${SKIN_S}" stroke-width="2" fill="none" opacity=".7"/>`;
  const torso = (fill, extra = "") => `<path d="M12 82c2-13 16-20 38-20s36 7 38 20z" fill="${fill}" ${O}/>${extra}`;
  const head = (s = SKIN) => `<path d="M33 38c0-13 7-21 17-21s17 8 17 21c0 11-7 19-17 19s-17-8-17-19z" fill="${s}" ${O}/>`;
  const ears = (s = SKIN) => `<ellipse cx="32.5" cy="41" rx="3.2" ry="4.4" fill="${s}" ${O}/><ellipse cx="67.5" cy="41" rx="3.2" ry="4.4" fill="${s}" ${O}/>`;
  const eye = (x, y = 40, c = INK, rx = 2.5, ry = 3.4) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/><circle cx="${x + .8}" cy="${y - 1.2}" r=".95" fill="#fff"/>`;
  const line = (d, w = 2.2, c = INK) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const svg = body => `<svg viewBox="0 0 100 82" aria-hidden="true">${body}</svg>`;

  const CREW = [
    // the captain: a black tricorn with a white plume, dark waves of hair, a short beard and a red coat
    { name: "Captain Rook Halloway", art: svg(
      `<path d="M30 40c-4 10-3 22 2 30M70 40c4 10 3 22-2 30" stroke="#2a1a14" stroke-width="9" fill="none" stroke-linecap="round"/>` +
      torso("#9e1f1f", `<path d="M40 62l10 16 10-16" fill="#f4efe2" ${O}/><circle cx="36" cy="72" r="2" fill="#e8b83c" stroke="${INK}" stroke-width="1"/><circle cx="64" cy="72" r="2" fill="#e8b83c" stroke="${INK}" stroke-width="1"/><path d="M24 66l8 16M76 66l-8 16" stroke="#e8b83c" stroke-width="2.5"/>`) +
      neck() + ears() + head() +
      `<path d="M35 46c2 9 8 13 15 13s13-4 15-13c-4 4-9 5-15 5s-11-1-15-5z" fill="#2a1a14" ${O}/>` +
      eye(43, 40) + eye(57, 40) + line("M39 35l7-1M54 34l7 1", 2.4) + line("M45 49q5 2 10-1", 2) +
      `<circle cx="67.5" cy="46" r="2" fill="none" stroke="#e8b83c" stroke-width="1.6"/>` +
      `<path d="M16 26c10-4 22-6 34-6s24 2 34 6c-4 4-10 6-14 4-6 4-14 5-20 5s-14-1-20-5c-4 2-10 0-14-4z" fill="#1d1712" ${O}/><path d="M24 25c8-12 18-16 26-16s18 4 26 16" fill="#1d1712" ${O}/>` +
      line("M20 27c10-3 20-4 30-4s20 1 30 4", 1.8, "#e8b83c") +
      `<path d="M62 14c8-8 20-8 24-2-6 0-10 2-14 6-2-3-6-4-10-4z" fill="#f4efe2" ${O}/>`) },
    // the navigator: teal braids, brass goggles, freckles, a navy waistcoat
    { name: "Kaia Storm", art: svg(
      `<path d="M31 42c-4 8-6 18-4 30M69 42c4 8 6 18 4 30" stroke="#1f9a92" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="4 2"/>` +
      torso("#1d2f5a", `<path d="M42 62l8 10 8-10" fill="#f4efe2" ${O}/><circle cx="50" cy="76" r="1.6" fill="#e8b83c"/>`) +
      neck(TAN) + head(TAN) +
      `<path d="M32 38c0-15 8-22 18-22s18 7 18 22c-3-6-8-10-13-11 1 3-1 5-5 6 0-3-2-5-4-5-5 1-10 5-14 10z" fill="#24b0a6" ${O}/>` +
      `<path d="M33 27h34" stroke="#5a3a20" stroke-width="3.5"/><circle cx="43" cy="26" r="4.6" fill="#9fd8f0" ${O}/><circle cx="57" cy="26" r="4.6" fill="#9fd8f0" ${O}/><path d="M41.5 24.5l2 2M55.5 24.5l2 2" stroke="#fff" stroke-width="1.4"/>` +
      eye(43, 40, "#3a2a1a", 2.6, 3.6) + eye(57, 40, "#3a2a1a", 2.6, 3.6) +
      `<g fill="${DARK}" opacity=".55"><circle cx="40" cy="46" r=".9"/><circle cx="43" cy="47" r=".9"/><circle cx="57" cy="47" r=".9"/><circle cx="60" cy="46" r=".9"/></g>` +
      line("M45 50q5 3.5 10 0", 2)) },
    // the bosun: bald with an anchor tattoo, a full dark beard, a hook, a striped shirt
    { name: "Bastian Ironhook", art: svg(
      torso("#f4efe2", `<path d="M18 72h64M15 78h70" stroke="#1d3f7a" stroke-width="3.5"/>`) +
      `<path d="M80 82V62" stroke="#5a3a20" stroke-width="7" stroke-linecap="round"/><path d="M80 60c0-8 8-10 10-4 2 5-3 9-7 7" stroke="#9aa6ad" stroke-width="4" fill="none" stroke-linecap="round"/>` +
      neck("#c98a5e") + ears("#c98a5e") + head("#c98a5e") +
      line("M48 22v7M45 25h6M45 28q3 3 6 0", 1.6, "#2c5a8a") +
      `<path d="M34 44c1 12 7 18 16 18s15-6 16-18c-4 3-8 4-16 4s-12-1-16-4z" fill="#2a1a14" ${O}/><path d="M43 49q7-3 14 0" stroke="#c98a5e" stroke-width="2.6" fill="none"/>` +
      eye(43, 39, INK, 2.2, 2.6) + eye(57, 39, INK, 2.2, 2.6) + line("M38 34l9 2M62 34l-9 2", 3.2)) },
    // the cabin boy: an oversized red knit cap, freckles and a gap-toothed grin
    { name: "Pip Marrow", art: svg(
      torso("#c9a35c", `<path d="M40 62l10 8 10-8" fill="none" stroke="${INK}" stroke-width="2"/><path d="M47 70l-3 6M53 70l3 6" stroke="#7a5a33" stroke-width="2"/>`) +
      neck() + ears() + head() +
      `<path d="M30 34c0-16 9-24 20-24s20 8 20 24z" fill="#c92a24" ${O}/><path d="M30 34h40v5H30z" fill="#e8574a" ${O}/><path d="M36 14c-4-6 0-10 4-8" stroke="${INK}" stroke-width="2" fill="#c92a24"/><circle cx="37" cy="9" r="4" fill="#f4efe2" ${O}/>` +
      eye(43, 44) + eye(57, 44) +
      `<g fill="#c9784a"><circle cx="40" cy="49" r="1"/><circle cx="43" cy="50" r="1"/><circle cx="57" cy="50" r="1"/><circle cx="60" cy="49" r="1"/></g>` +
      `<path d="M42 51q8 7 16 0z" fill="#fff" ${O}/><path d="M50 51v3.5" stroke="${INK}" stroke-width="1.6"/>`) },
    // the sharpshooter: a lilac bob, a brass scope-glass over one eye, a high black collar
    { name: "Selene Vex", art: svg(
      `<path d="M30 40c0-18 9-25 20-25s20 7 20 25v12H30z" fill="#a98bd8" ${O}/>` +
      torso("#1b1622", `<path d="M38 62h24v8H38z" fill="#2c2433" ${O}/><path d="M50 62v20" stroke="#6b5a8a" stroke-width="1.6"/>`) +
      neck() + head() +
      `<path d="M32 36c2-12 9-18 18-18s16 6 18 18c-8 1-14-2-18-8-4 6-10 8-18 8z" fill="#b89ae2" ${O}/>` +
      eye(43, 41, "#4a3a6a", 2.4, 3.2) + `<circle cx="57" cy="41" r="6" fill="rgba(160,220,255,.35)" stroke="#c9952f" stroke-width="2.6"/><circle cx="57" cy="41" r="2" fill="#4a3a6a"/><path d="M63 41h6" stroke="#c9952f" stroke-width="2.4"/>` +
      line("M46 50q4 1.5 8-1", 2)) },
    // the cook: a tall white toque, a grey walrus moustache, rosy cheeks, an apron
    { name: "Old Barnaby", art: svg(
      torso("#f4efe2", `<path d="M34 64h32v18H34z" fill="#e8dcc0" ${O}/><path d="M40 64l-6-4M60 64l6-4" stroke="${INK}" stroke-width="2"/>`) +
      neck() + ears() + head() +
      `<path d="M34 30c-6-2-6-12 0-14 0-8 10-10 14-5 4-5 14-3 14 5 6 2 6 12 0 14z" fill="#fbf8f0" ${O}/><path d="M34 26h32v6H34z" fill="#fbf8f0" ${O}/>` +
      eye(43, 39, INK, 2, 2.4) + eye(57, 39, INK, 2, 2.4) + line("M39 35l7 0M54 35l7 0", 2.4, "#9a9a9a") +
      `<path d="M38 47c4-3 8-3 12 0 4-3 8-3 12 0-2 4-6 6-12 5-6 1-10-1-12-5z" fill="#c8c4bc" ${O}/>` +
      `<ellipse cx="38" cy="44" rx="3" ry="1.8" fill="#f08a8a" opacity=".7"/><ellipse cx="62" cy="44" rx="3" ry="1.8" fill="#f08a8a" opacity=".7"/>`) },
    // the diver: curls held up with a shell clip, a dive mask on the forehead, a yellow suit collar
    { name: "Tamsin Reef", art: svg(
      `<circle cx="36" cy="24" r="9" fill="#2a1a14"/><circle cx="50" cy="18" r="10" fill="#2a1a14"/><circle cx="64" cy="24" r="9" fill="#2a1a14"/>` +
      torso("#e8b412", `<path d="M38 62h24" stroke="${INK}" stroke-width="2"/><path d="M50 62v20" stroke="#8a6a0a" stroke-width="2"/>`) +
      neck("#9a6440") + ears("#9a6440") + head("#9a6440") +
      `<path d="M33 30c4-6 10-8 17-8s13 2 17 8z" fill="#2a1a14" ${O}/>` +
      `<rect x="36" y="24" width="28" height="9" rx="4.5" fill="rgba(170,230,255,.6)" stroke="#2c6a8a" stroke-width="2.6"/><path d="M33 28h3M64 28h3" stroke="#2c6a8a" stroke-width="2.6"/>` +
      `<path d="M62 18l6-3 2 6z" fill="#f29a9a" stroke="${INK}" stroke-width="1.4"/>` +
      eye(43, 41) + eye(57, 41) + line("M45 49q5 3 10 0", 2)) },
    // the ship's doctor: hair in a bun, round spectacles, a white coat, a stethoscope
    { name: "Dr. Juno Pell", art: svg(
      `<circle cx="50" cy="15" r="7" fill="#5a2e1a" ${O}/>` +
      torso("#fbf8f0", `<path d="M42 62l8 12 8-12" fill="#7ab0d8" ${O}/><path d="M38 64c0 10 6 12 12 12s12-2 12-12" stroke="#4a4a52" stroke-width="2.4" fill="none"/><circle cx="50" cy="77" r="2.6" fill="#9aa6ad" stroke="${INK}" stroke-width="1"/>`) +
      neck() + ears() + head() +
      `<path d="M33 36c0-12 7-18 17-18s17 6 17 18c-6-6-11-9-17-9s-11 3-17 9z" fill="#5a2e1a" ${O}/>` +
      `<circle cx="43" cy="40" r="5.2" fill="rgba(255,255,255,.35)" stroke="${INK}" stroke-width="1.8"/><circle cx="57" cy="40" r="5.2" fill="rgba(255,255,255,.35)" stroke="${INK}" stroke-width="1.8"/><path d="M48.2 40h3.6" stroke="${INK}" stroke-width="1.8"/>` +
      eye(43, 40, "#3a5a3a", 1.8, 2.4) + eye(57, 40, "#3a5a3a", 1.8, 2.4) + line("M46 49q4 2 8 0", 2)) },
    // the musician: a flat cap, a curled moustache, a bow tie, a fiddle's scroll at his shoulder
    { name: "Gideon Gale", art: svg(
      `<path d="M78 82l6-40" stroke="#7a4a22" stroke-width="5" stroke-linecap="round"/><path d="M84 42c-2-6 4-8 5-4 1 3-3 4-3 2" stroke="#7a4a22" stroke-width="3" fill="none"/>` +
      torso("#3a4a3a", `<path d="M44 62l6 6 6-6" fill="#f4efe2" ${O}/><path d="M43 65l7 3 7-3-7 3z" fill="#c62b25" stroke="${INK}" stroke-width="1.4"/>`) +
      neck() + ears() + head() +
      `<path d="M30 32c2-10 10-14 20-14s20 4 22 14c-8-2-14-2-22-2s-14 0-20 2z" fill="#6b5a3a" ${O}/><path d="M28 32c8-3 16-4 26-4" stroke="${INK}" stroke-width="2.2" fill="none"/>` +
      eye(43, 40, INK, 2, 2.4) + eye(57, 40, INK, 2, 2.4) +
      `<path d="M50 47c-3 0-6 3-11 1 1 3 6 4 11 0 5 4 10 3 11 0-5 2-8-1-11-1z" fill="#3a2a1a" stroke="${INK}" stroke-width="1.2"/>`) },
    // the ship's parrot, with a little blue bandana
    { name: "Moko the Parrot", art: svg(
      `<path d="M22 82c4-18 14-26 28-26s24 8 28 26z" fill="#2f9a52" ${O}/><path d="M30 78c6-8 12-12 20-12" stroke="#1f6a38" stroke-width="2.2" fill="none"/><path d="M70 78c-6-8-12-12-20-12" stroke="#1f6a38" stroke-width="2.2" fill="none"/>` +
      `<path d="M30 44c0-16 9-26 20-26s20 10 20 26c0 10-8 16-20 16s-20-6-20-16z" fill="#d6342c" ${O}/>` +
      `<path d="M50 44c-8 0-12 4-12 9 3-2 6-3 12-3z" fill="#f2c94c" ${O}/><path d="M50 44c6 0 10 6 6 14-2-6-4-8-6-9z" fill="#3a2a1a" ${O}/>` +
      `<circle cx="40" cy="36" r="6" fill="#fbf8f0" ${O}/><circle cx="60" cy="36" r="6" fill="#fbf8f0" ${O}/>` + eye(40.5, 36, INK, 2.4, 2.8) + eye(60.5, 36, INK, 2.4, 2.8) +
      `<path d="M31 30c4-8 11-12 19-12s15 4 19 12c-6-2-12-3-19-3s-13 1-19 3z" fill="#1f6fd1" ${O}/><path d="M68 28l8 2-3 6z" fill="#1f6fd1" ${O}/>` +
      `<g fill="#fff"><circle cx="40" cy="24" r="1.2"/><circle cx="50" cy="22" r="1.2"/><circle cx="60" cy="24" r="1.2"/></g>`) }
  ];
  window.UnoCrew = CREW;
})();
