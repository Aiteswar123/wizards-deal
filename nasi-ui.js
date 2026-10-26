/* Nasi Lemak: the table screen, home masthead and rules. A night-market hawker stall:
   banana-leaf green, sambal red, coconut cream and turmeric, with drawn ingredient icons.
   Uses the page's shared helpers: S, me, mySeat, nameOf, esc, fmt, act, call, flash, netDown, sndBtn, $app. */
(function () {
  "use strict";
  const N = window.Nasi;
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Lilita+One&family=Baloo+2:wght@500;600;700;800&display=swap";
  document.head.appendChild(font);

  const sheet = document.createElement("link");
  sheet.rel = "stylesheet"; sheet.href = "nasi.css";
  document.head.appendChild(sheet);

  // ---- drawn pictures: the ingredients and the fly are shaded illustrations (their gradients live in one shared <defs>, below);
  // the action icons are flat, outlined emblems ----
  const ICON = {
    rice: `<g><path d="M3 47C14 38 50 38 61 47C50 57 14 57 3 47Z" fill="url(#nlgLeaf)" stroke="#1d5a26" stroke-width="1.4"/><path d="M6 47C20 44.6 44 44.6 58 47M18 45.6 13 50.5M30 45 27 51.6M42 45.4 45 51" stroke="#9edc7e" stroke-width=".9" fill="none" opacity=".75"/><path d="M11 46C10 30 20 17 32 17S54 30 53 46C42 51.5 22 51.5 11 46Z" fill="url(#nlgRice)" stroke="#b7ad95" stroke-width="1.2"/><g fill="#fffefa" stroke="#d3c9b0" stroke-width=".5"><ellipse cx="30.3" cy="35.1" rx="2.2" ry="1.05" transform="rotate(49 30.3 35.1)"/><ellipse cx="30.3" cy="43.1" rx="2.2" ry="1.05" transform="rotate(-22 30.3 43.1)"/><ellipse cx="20.6" cy="33.8" rx="2.2" ry="1.05" transform="rotate(-23 20.6 33.8)"/><ellipse cx="17.3" cy="41.9" rx="2.2" ry="1.05" transform="rotate(-60 17.3 41.9)"/><ellipse cx="35.4" cy="30.7" rx="2.2" ry="1.05" transform="rotate(45 35.4 30.7)"/><ellipse cx="37.5" cy="36.6" rx="2.2" ry="1.05" transform="rotate(-30 37.5 36.6)"/><ellipse cx="36.4" cy="42.5" rx="2.2" ry="1.05" transform="rotate(-54 36.4 42.5)"/><ellipse cx="30.7" cy="31.9" rx="2.2" ry="1.05" transform="rotate(-20 30.7 31.9)"/><ellipse cx="32.7" cy="37.3" rx="2.2" ry="1.05" transform="rotate(57 32.7 37.3)"/><ellipse cx="37.6" cy="31" rx="2.2" ry="1.05" transform="rotate(-49 37.6 31)"/><ellipse cx="39.5" cy="28.5" rx="2.2" ry="1.05" transform="rotate(-12 39.5 28.5)"/><ellipse cx="32.5" cy="20.8" rx="2.2" ry="1.05" transform="rotate(-43 32.5 20.8)"/><ellipse cx="28.4" cy="42.9" rx="2.2" ry="1.05" transform="rotate(28 28.4 42.9)"/><ellipse cx="38.7" cy="25.8" rx="2.2" ry="1.05" transform="rotate(-57 38.7 25.8)"/><ellipse cx="28.3" cy="22" rx="2.2" ry="1.05" transform="rotate(-20 28.3 22)"/><ellipse cx="42" cy="27.3" rx="2.2" ry="1.05" transform="rotate(-48 42 27.3)"/><ellipse cx="25.2" cy="20.4" rx="2.2" ry="1.05" transform="rotate(34 25.2 20.4)"/><ellipse cx="41.3" cy="23.2" rx="2.2" ry="1.05" transform="rotate(-7 41.3 23.2)"/><ellipse cx="30.7" cy="33.1" rx="2.2" ry="1.05" transform="rotate(-22 30.7 33.1)"/><ellipse cx="30.1" cy="25.1" rx="2.2" ry="1.05" transform="rotate(-37 30.1 25.1)"/><ellipse cx="29.1" cy="30.4" rx="2.2" ry="1.05" transform="rotate(31 29.1 30.4)"/><ellipse cx="29.1" cy="25.7" rx="2.2" ry="1.05" transform="rotate(-1 29.1 25.7)"/><ellipse cx="34.8" cy="21.1" rx="2.2" ry="1.05" transform="rotate(-33 34.8 21.1)"/><ellipse cx="21.7" cy="27" rx="2.2" ry="1.05" transform="rotate(14 21.7 27)"/><ellipse cx="43.9" cy="30.4" rx="2.2" ry="1.05" transform="rotate(-51 43.9 30.4)"/><ellipse cx="17.2" cy="35.7" rx="2.2" ry="1.05" transform="rotate(-8 17.2 35.7)"/><ellipse cx="36.4" cy="23.4" rx="2.2" ry="1.05" transform="rotate(53 36.4 23.4)"/><ellipse cx="27.9" cy="36.9" rx="2.2" ry="1.05" transform="rotate(9 27.9 36.9)"/><ellipse cx="46.7" cy="42.1" rx="2.2" ry="1.05" transform="rotate(-7 46.7 42.1)"/><ellipse cx="40.1" cy="24.3" rx="2.2" ry="1.05" transform="rotate(-20 40.1 24.3)"/></g><path d="M18 34C19.5 27 24 21.5 30 20" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/></g>`,
    egg: `<g><ellipse cx="32" cy="39.5" rx="23" ry="15.5" fill="#d9cfb8"/><ellipse cx="32" cy="35.5" rx="23" ry="15.5" fill="url(#nlgWhite)" stroke="#c9bea2" stroke-width="1.2"/><circle cx="32.5" cy="35.5" r="10.5" fill="url(#nlgYolk)" stroke="#c97a10" stroke-width=".8"/><path d="M25.5 33.5C26.5 30 29 28 32 27.6" stroke="#ffe7a0" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9"/><path d="M13 31C16 25.5 21 22.6 27 21.6" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`,
    peanut: `<g><g transform="translate(17 45) rotate(20)"><ellipse rx="6.6" ry="4.6" fill="url(#nlgNut)" stroke="#8a541c" stroke-width=".9"/><path d="M-6 .2Q0 -1.8 6 .2" stroke="#c88a40" stroke-width=".8" fill="none"/><ellipse cx="-2.2" cy="-1.8" rx="2.2" ry=".9" fill="#fff" opacity=".6"/></g><g transform="translate(28 47) rotate(-12)"><ellipse rx="6.6" ry="4.6" fill="url(#nlgSkin)" stroke="#5e1e10" stroke-width=".9"/><path d="M-6 .2Q0 -1.8 6 .2" stroke="#9b3a22" stroke-width=".8" fill="none"/><ellipse cx="-2.2" cy="-1.8" rx="2.2" ry=".9" fill="#fff" opacity=".35"/></g><g transform="translate(40 46) rotate(15)"><ellipse rx="6.6" ry="4.6" fill="url(#nlgNut)" stroke="#8a541c" stroke-width=".9"/><path d="M-6 .2Q0 -1.8 6 .2" stroke="#c88a40" stroke-width=".8" fill="none"/><ellipse cx="-2.2" cy="-1.8" rx="2.2" ry=".9" fill="#fff" opacity=".6"/></g><g transform="translate(50 44) rotate(-25)"><ellipse rx="6.6" ry="4.6" fill="url(#nlgSkin)" stroke="#5e1e10" stroke-width=".9"/><path d="M-6 .2Q0 -1.8 6 .2" stroke="#9b3a22" stroke-width=".8" fill="none"/><ellipse cx="-2.2" cy="-1.8" rx="2.2" ry=".9" fill="#fff" opacity=".35"/></g><g transform="translate(22 37) rotate(-30)"><ellipse rx="6.6" ry="4.6" fill="url(#nlgSkin)" stroke="#5e1e10" stroke-width=".9"/><path d="M-6 .2Q0 -1.8 6 .2" stroke="#9b3a22" stroke-width=".8" fill="none"/><ellipse cx="-2.2" cy="-1.8" rx="2.2" ry=".9" fill="#fff" opacity=".35"/></g><g transform="translate(33 38) rotate(8)"><ellipse rx="6.6" ry="4.6" fill="url(#nlgNut)" stroke="#8a541c" stroke-width=".9"/><path d="M-6 .2Q0 -1.8 6 .2" stroke="#c88a40" stroke-width=".8" fill="none"/><ellipse cx="-2.2" cy="-1.8" rx="2.2" ry=".9" fill="#fff" opacity=".6"/></g><g transform="translate(44 36) rotate(-10)"><ellipse rx="6.6" ry="4.6" fill="url(#nlgNut)" stroke="#8a541c" stroke-width=".9"/><path d="M-6 .2Q0 -1.8 6 .2" stroke="#c88a40" stroke-width=".8" fill="none"/><ellipse cx="-2.2" cy="-1.8" rx="2.2" ry=".9" fill="#fff" opacity=".6"/></g><g transform="translate(28 29) rotate(25)"><ellipse rx="6.6" ry="4.6" fill="url(#nlgNut)" stroke="#8a541c" stroke-width=".9"/><path d="M-6 .2Q0 -1.8 6 .2" stroke="#c88a40" stroke-width=".8" fill="none"/><ellipse cx="-2.2" cy="-1.8" rx="2.2" ry=".9" fill="#fff" opacity=".6"/></g><g transform="translate(38 28) rotate(-20)"><ellipse rx="6.6" ry="4.6" fill="url(#nlgSkin)" stroke="#5e1e10" stroke-width=".9"/><path d="M-6 .2Q0 -1.8 6 .2" stroke="#9b3a22" stroke-width=".8" fill="none"/><ellipse cx="-2.2" cy="-1.8" rx="2.2" ry=".9" fill="#fff" opacity=".35"/></g></g>`,
    sambal: `<g><ellipse cx="32" cy="48" rx="25" ry="5" fill="#3a1208" opacity=".25"/><path d="M8 46C7 34 18 25 32 25S57 34 56 46C44 52.5 20 52.5 8 46Z" fill="url(#nlgSambal)" stroke="#6e150c" stroke-width="1.2"/><g fill="#8e170c" opacity=".55"><circle cx="24" cy="36" r="2.2"/><circle cx="43" cy="33" r="2.6"/><circle cx="47" cy="42" r="2"/><circle cx="30" cy="45" r="1.8"/></g><g fill="none" stroke="#f3c6d6" stroke-width="1.3" stroke-linecap="round"><path d="M42 30q5 1 6 5"/><path d="M13 39q2-4 6-5"/></g><g transform="translate(17 33) rotate(18)"><path d="M0 0C4-2.3 12-2.4 16-.4L20.5-3 19.8 0 20.5 3 16 .4C12 2.3 4 2.2 0 0Z" fill="url(#nlgBilis)" stroke="#6d4a16" stroke-width=".6"/><circle cx="2.3" cy="-.3" r=".9" fill="#2a1a10"/></g><g transform="translate(31 30) rotate(-8)"><path d="M0 0C4-2.3 12-2.4 16-.4L20.5-3 19.8 0 20.5 3 16 .4C12 2.3 4 2.2 0 0Z" fill="url(#nlgBilis)" stroke="#6d4a16" stroke-width=".6"/><circle cx="2.3" cy="-.3" r=".9" fill="#2a1a10"/></g><g transform="translate(38 39) rotate(24)"><path d="M0 0C4-2.3 12-2.4 16-.4L20.5-3 19.8 0 20.5 3 16 .4C12 2.3 4 2.2 0 0Z" fill="url(#nlgBilis)" stroke="#6d4a16" stroke-width=".6"/><circle cx="2.3" cy="-.3" r=".9" fill="#2a1a10"/></g><g transform="translate(20 42) rotate(-16)"><path d="M0 0C4-2.3 12-2.4 16-.4L20.5-3 19.8 0 20.5 3 16 .4C12 2.3 4 2.2 0 0Z" fill="url(#nlgBilis)" stroke="#6d4a16" stroke-width=".6"/><circle cx="2.3" cy="-.3" r=".9" fill="#2a1a10"/></g><g fill="none" stroke="#fff" stroke-linecap="round" opacity=".6"><path d="M15 34q3-5 9-7" stroke-width="2.2"/><path d="M45 31q3 1.5 4.5 4" stroke-width="1.6"/></g></g>`,
    cucumber: `<g><g transform="translate(21 40) rotate(-12)"><ellipse rx="13.5" ry="12.2" fill="#24611f" stroke="#163e14" stroke-width="1"/><ellipse rx="12" ry="10.8" fill="url(#nlgCuc)"/><ellipse rx="6.2" ry="5.6" fill="#effadd" opacity=".9"/><g fill="#bcdc8e"><ellipse cx="4.1" cy="0" rx=".8" ry="1.6" transform="rotate(90 4.1 0)"/><ellipse cx="2.1" cy="3.2" rx=".8" ry="1.6" transform="rotate(150 2.1 3.2)"/><ellipse cx="-2" cy="3.2" rx=".8" ry="1.6" transform="rotate(210 -2 3.2)"/><ellipse cx="-4.1" cy="0" rx=".8" ry="1.6" transform="rotate(270 -4.1 0)"/><ellipse cx="-2.1" cy="-3.2" rx=".8" ry="1.6" transform="rotate(330 -2.1 -3.2)"/><ellipse cx="2.1" cy="-3.2" rx=".8" ry="1.6" transform="rotate(390 2.1 -3.2)"/></g><path d="M-8-6.5Q-4-9.5 1-9.8" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/></g><g transform="translate(43 41) rotate(10)"><ellipse rx="13.5" ry="12.2" fill="#24611f" stroke="#163e14" stroke-width="1"/><ellipse rx="12" ry="10.8" fill="url(#nlgCuc)"/><ellipse rx="6.2" ry="5.6" fill="#effadd" opacity=".9"/><g fill="#bcdc8e"><ellipse cx="4.1" cy="0" rx=".8" ry="1.6" transform="rotate(90 4.1 0)"/><ellipse cx="2.1" cy="3.2" rx=".8" ry="1.6" transform="rotate(150 2.1 3.2)"/><ellipse cx="-2" cy="3.2" rx=".8" ry="1.6" transform="rotate(210 -2 3.2)"/><ellipse cx="-4.1" cy="0" rx=".8" ry="1.6" transform="rotate(270 -4.1 0)"/><ellipse cx="-2.1" cy="-3.2" rx=".8" ry="1.6" transform="rotate(330 -2.1 -3.2)"/><ellipse cx="2.1" cy="-3.2" rx=".8" ry="1.6" transform="rotate(390 2.1 -3.2)"/></g><path d="M-8-6.5Q-4-9.5 1-9.8" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/></g><g transform="translate(32 27) rotate(0)"><ellipse rx="13.5" ry="12.2" fill="#24611f" stroke="#163e14" stroke-width="1"/><ellipse rx="12" ry="10.8" fill="url(#nlgCuc)"/><ellipse rx="6.2" ry="5.6" fill="#effadd" opacity=".9"/><g fill="#bcdc8e"><ellipse cx="4.1" cy="0" rx=".8" ry="1.6" transform="rotate(90 4.1 0)"/><ellipse cx="2.1" cy="3.2" rx=".8" ry="1.6" transform="rotate(150 2.1 3.2)"/><ellipse cx="-2" cy="3.2" rx=".8" ry="1.6" transform="rotate(210 -2 3.2)"/><ellipse cx="-4.1" cy="0" rx=".8" ry="1.6" transform="rotate(270 -4.1 0)"/><ellipse cx="-2.1" cy="-3.2" rx=".8" ry="1.6" transform="rotate(330 -2.1 -3.2)"/><ellipse cx="2.1" cy="-3.2" rx=".8" ry="1.6" transform="rotate(390 2.1 -3.2)"/></g><path d="M-8-6.5Q-4-9.5 1-9.8" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/></g></g>`,
    supplier: `<rect x="12" y="24" width="40" height="26" rx="3" fill="#a8742f"/><path d="M12 32h40M12 42h40M24 24v26M40 24v26" stroke="#7a5220" stroke-width="2"/><path d="M22 24l10-10 10 10" fill="none" stroke="#2f6b3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    thief: `<circle cx="32" cy="32" r="18" fill="#3a2a1f"/><path d="M14 30h36v8H14z" fill="#141010"/><circle cx="25" cy="34" r="2.6" fill="#fff"/><circle cx="39" cy="34" r="2.6" fill="#fff"/><path d="M20 18c6-6 18-6 24 0" stroke="#141010" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    wholesaler: `<rect x="8" y="30" width="22" height="20" rx="2" fill="#c98f3f"/><rect x="34" y="30" width="22" height="20" rx="2" fill="#a8742f"/><rect x="20" y="12" width="22" height="18" rx="2" fill="#d9a35b"/><path d="M19 30v20M45 30v20M31 12v18" stroke="#7a5220" stroke-width="2"/>`,
    officer: `<path d="M14 26l18-10 18 10-4 6H18z" fill="#1f3b6e"/><rect x="18" y="31" width="28" height="5" fill="#16294c"/><circle cx="32" cy="22" r="3.5" fill="#e3a72f"/><circle cx="32" cy="46" r="9" fill="#e9c49e"/>`,
    makcik: `<path d="M14 54c0-14 8-26 18-26s18 12 18 26z" fill="#2f6b3a"/><circle cx="32" cy="28" r="11" fill="#e2b98f"/><path d="M19 30c0-12 6-18 13-18s13 6 13 18c-3-6-8-9-13-9s-10 3-13 9z" fill="#c8372d"/><path d="M27 31q5 4 10 0" stroke="#6b3b22" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
    fly: `<g><g stroke="#1d2420" stroke-width="1.6" stroke-linecap="round"><path d="M26 30 18 36M26 34 19 42M27 38 22 47M38 30 46 36M38 34 45 42M37 38 42 47"/></g><g fill="#e3f4ff" fill-opacity=".62" stroke="#8fb8d0" stroke-width="1"><ellipse cx="19" cy="22" rx="13" ry="6.6" transform="rotate(-26 19 22)"/><ellipse cx="45" cy="22" rx="13" ry="6.6" transform="rotate(26 45 22)"/></g><g stroke="#9cc0d6" stroke-width=".6" fill="none"><path d="M28 25 10 20M27 24 14 14M36 25 54 20M37 24 50 14"/></g><ellipse cx="32" cy="39" rx="8.6" ry="12" fill="url(#nlgFly)" stroke="#0f1f18" stroke-width="1"/><path d="M24.5 37h15M25 42.5h14M26.6 47.5h10.8" stroke="#0f2a22" stroke-width="1.2" opacity=".6"/><ellipse cx="32" cy="27" rx="7.4" ry="6" fill="#2a3a36" stroke="#0f1f18" stroke-width="1"/><circle cx="32" cy="19.5" r="6.2" fill="#1b2420"/><circle cx="28.3" cy="18.5" r="3.9" fill="url(#nlgEye)"/><circle cx="35.7" cy="18.5" r="3.9" fill="url(#nlgEye)"/><ellipse cx="29.6" cy="38" rx="2" ry="4" fill="#bff0d0" opacity=".35"/></g>`,
    swatter: `<rect x="14" y="10" width="26" height="26" rx="4" fill="#d94a3a" transform="rotate(-20 27 23)"/><g stroke="#a12f22" stroke-width="1.5" transform="rotate(-20 27 23)"><path d="M14 19h26M14 27h26M23 10v26M31 10v26"/></g><path d="M33 38l14 16" stroke="#7a5220" stroke-width="4" stroke-linecap="round"/>`,
    guard: `<path d="M32 8l20 7v14c0 13-9 22-20 27-11-5-20-14-20-27V15z" fill="#2f5aa8" stroke="#1b3466" stroke-width="2"/><path d="M32 16l12 4v10c0 8-5 14-12 18-7-4-12-10-12-18V20z" fill="#e3a72f"/><path d="M26 31l5 5 9-10" stroke="#1b3466" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    saji: `<path d="M8 44c0-16 11-28 24-28s24 12 24 28z" fill="#d9a35b" stroke="#8a5a2b" stroke-width="2"/><path d="M14 38c3-10 9-16 18-17M50 38c-3-10-9-16-18-17M32 16v28M20 26l24 0M15 34h34" stroke="#a8742f" stroke-width="1.6" fill="none"/><path d="M8 44h48" stroke="#c8372d" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="14" r="3.5" fill="#c8372d"/>`,
    rahsia: `<path d="M14 26h36l-4 26H18z" fill="#f2efe6" stroke="#9a8f78" stroke-width="2"/><path d="M17 30c4 6 26 6 30 0l-2 12c-5 4-21 4-26 0z" fill="#c8372d"/><path d="M22 18c2-6 6-6 6 0M32 16c2-6 6-6 6 0" stroke="#ffcf3f" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="44" cy="20" r="6" fill="#ffcf3f"/><path d="M44 16v8M40 20h8" stroke="#c8372d" stroke-width="1.8"/>`,
    teleport: `<circle cx="32" cy="32" r="20" fill="#ffd23f" stroke="#a8742f" stroke-width="2"/><circle cx="32" cy="32" r="13" fill="#fff6d0"/><rect x="24" y="27" width="16" height="9" rx="4.5" fill="#1d2420"/><circle cx="28" cy="31.5" r="2.2" fill="#5fd0ff"/><circle cx="36" cy="31.5" r="2.2" fill="#5fd0ff"/><path d="M6 32a26 26 0 0 1 8-18M58 32a26 26 0 0 1-8 18" stroke="#3d7bff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M12 10l2 5 5-1M52 54l-2-5-5 1" stroke="#3d7bff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    lori: `<rect x="6" y="20" width="32" height="22" rx="2" fill="#3d7bff" stroke="#1b3466" stroke-width="2"/><path d="M38 26h10l8 9v7H38z" fill="#ffd23f" stroke="#1b3466" stroke-width="2" stroke-linejoin="round"/><path d="M42 29h5l4 5h-9z" fill="#cfe6f5"/><circle cx="16" cy="45" r="5" fill="#1d2420"/><circle cx="46" cy="45" r="5" fill="#1d2420"/><path d="M22 12c2 3 0 5 2 8M30 10c2 3 0 6 2 9" stroke="#8a8a8a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M44 18l3-6 2 4 3-5" stroke="#c8372d" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    fan: `<path d="M32 46L14 20a26 26 0 0 1 36 0z" fill="#e3a72f"/><path d="M32 46L20 18M32 46V16M32 46l12-28" stroke="#a8742f" stroke-width="1.6"/><path d="M14 20a26 26 0 0 1 36 0" fill="none" stroke="#c8372d" stroke-width="3"/><path d="M32 46v10" stroke="#7a5220" stroke-width="4" stroke-linecap="round"/>`
  };
  const BAND = { rice: "#bfe7ff", egg: "#ffd23f", peanut: "#e0a35c", sambal: "#ff4b3e", cucumber: "#34c25a" };
  // the gradients the illustrations share, defined once for the whole page
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("aria-hidden", "true"); defs.setAttribute("width", "0"); defs.setAttribute("height", "0");
  defs.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  defs.innerHTML = `<defs><radialGradient id="nlgRice" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f3efe4"/><stop offset="1" stop-color="#d8d0bb"/></radialGradient><linearGradient id="nlgLeaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cc456"/><stop offset="1" stop-color="#2a7a2e"/></linearGradient><radialGradient id="nlgWhite" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#f6f1e6"/><stop offset="1" stop-color="#e2d8c2"/></radialGradient><radialGradient id="nlgYolk" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#ffe07a"/><stop offset=".55" stop-color="#f7b42c"/><stop offset="1" stop-color="#e08a12"/></radialGradient><radialGradient id="nlgNut" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffe0a0"/><stop offset=".55" stop-color="#e2a456"/><stop offset="1" stop-color="#b8742c"/></radialGradient><radialGradient id="nlgSkin" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#d9714c"/><stop offset=".6" stop-color="#a23a22"/><stop offset="1" stop-color="#6e2414"/></radialGradient><radialGradient id="nlgSambal" cx=".42" cy=".3" r=".8"><stop offset="0" stop-color="#f2603a"/><stop offset=".5" stop-color="#d22e1c"/><stop offset="1" stop-color="#8e170c"/></radialGradient><linearGradient id="nlgBilis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c8"/><stop offset=".5" stop-color="#e3be70"/><stop offset="1" stop-color="#b98a3a"/></linearGradient><radialGradient id="nlgCuc" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#f4ffe4"/><stop offset=".6" stop-color="#cdeca2"/><stop offset="1" stop-color="#8fca5c"/></radialGradient><linearGradient id="nlgFly" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fd39a"/><stop offset=".5" stop-color="#1f7a5c"/><stop offset="1" stop-color="#0f2f2a"/></linearGradient><radialGradient id="nlgEye" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff9a8a"/><stop offset=".5" stop-color="#d22a1e"/><stop offset="1" stop-color="#6e0f0a"/></radialGradient></defs>`;
  document.body.appendChild(defs);
  const svg = (t, cls) => `<svg viewBox="0 0 64 64" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${ICON[t] || ""}</svg>`;
  // A nasi lemak bungkus: banana leaf folded into a pyramid over newspaper, tied with a red rubber band.
  const INK = "#3d2414";
  const parcel = (packs, show) => `<svg class="parcel" viewBox="0 0 64 60" aria-hidden="true">
    <path d="M6 44 L32 10 L58 44 L32 56 Z" fill="#f4ecd8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M10 42 L32 14 L54 42 L32 52 Z" fill="#34c25a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M32 14 L32 52" stroke="#1f8f3c" stroke-width="2.4"/><path d="M18 34 L32 40 L46 34" stroke="#8be09d" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M12 39 Q32 31 52 39" stroke="#ff4b3e" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M24 18 l4 -4 M40 18 l-4 -4" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    ${show ? `<circle cx="32" cy="27" r="8" fill="#ffd23f" stroke="${INK}" stroke-width="2.5"/><text x="32" y="31" text-anchor="middle" font-family="Lilita One,Arial Black,sans-serif" font-size="12" fill="${INK}">${packs}</text>` : ""}</svg>`;

  // ---- behind the Nasi Lemak world: deep space, nebula, stars, a ringed planet, a shooting star and Ochobot on patrol ----
  const scene = document.createElement("div");
  scene.className = "k-scene"; scene.setAttribute("aria-hidden", "true");
  // one weather layer per Kopitiam event; render() switches on the round's one
  const EV_FX = { hujan: `<i class="rain far"></i><i class="rain"></i><i class="flash"></i>`,
    rush: [12, 34, 58, 80].map((x, k) => `<i class="steam" style="--x:${x}%;--d:${-k * 1.5}s"></i>`).join(""),
    pasar: `<i class="glow"></i><i class="lights"></i><i class="lights two"></i>`,
    kenduri: `<i class="sparkle"></i><i class="bunting two"></i><i class="bunting"></i>`,
    raya: `<i class="ketupat two"></i><i class="ketupat"></i><i class="pelita"></i>`,
    lewat: `<i class="stars"></i><i class="lamp"></i><i class="moon"></i>` };
  scene.innerHTML = `<div class="k-nebula"></div><div class="k-stars far"></div><div class="k-stars"></div>
    <div class="k-planet"></div><div class="k-moon"></div><div class="k-comet"></div>
    <div class="k-ocho"><img src="assets/bb/ochobot.webp" alt="" decoding="async"></div>
    ${Object.entries(EV_FX).map(([k, h]) => `<div class="k-ev ev-${k}">${h}</div>`).join("")}`;
  // stay hidden until nasi.css arrives, or every layer (rain, bulbs, ketupat...) shows unstyled and then fades out
  scene.style.visibility = "hidden";
  const showScene = () => requestAnimationFrame(() => { scene.style.visibility = ""; scene.classList.add("ready"); });
  if (sheet.sheet) showScene(); else { sheet.addEventListener("load", showScene); sheet.addEventListener("error", showScene); }
  document.body.prepend(scene);
  // the background follows the round's event while a game is in play, and goes back to the sunny kampung elsewhere
  function setWeather(k) {
    if ((scene.dataset.ev || "") === (k || "")) return;
    if (k) scene.dataset.ev = k; else delete scene.dataset.ev;
    scene.querySelectorAll(".k-ev").forEach(el => el.classList.toggle("on", el.classList.contains("ev-" + k)));
  }

  // ---- comic power burst: plays once on every screen when someone wraps a Nasi Lemak or plays an action card ----
  const fxEl = document.createElement("div");
  fxEl.className = "k-fx"; fxEl.hidden = true; fxEl.setAttribute("role", "status"); fxEl.setAttribute("aria-live", "polite");
  document.body.appendChild(fxEl);
  const FX = {
    make:       { call: "Siap!",       icon: null,        fx: "#ff8a1f", fx2: "#ffd23f", say: "wrapped a Nasi Lemak" },
    supplier:   { call: "Supplier!",   icon: "supplier",  fx: "#34c25a", fx2: "#c8f5b4", say: "called the Supplier" },
    thief:      { call: "Thief!",      icon: "thief",     fx: "#a35bff", fx2: "#e3cfff", say: "sent the Thief round every stall" },
    wholesaler: { call: "Wholesaler!", icon: "wholesaler", fx: "#ff8a1f", fx2: "#ffe0a8", say: "called the Wholesaler" },
    officer:    { call: "Officer!",    icon: "officer",   fx: "#3d7bff", fx2: "#cfe0ff", say: "sent the Officer to inspect" },
    fly:        { call: "Bzzz!",       icon: "fly",       fx: "#5b4f78", fx2: "#d9d3ea", say: "landed a Fly on" },
    swatter:    { call: "Swat!",       icon: "swatter",   fx: "#ff4b3e", fx2: "#ffd0cb", say: "swatted the fly away" },
    fan:        { call: "Whoosh!",     icon: "fan",       fx: "#ffb52e", fx2: "#fff1b8", say: "fanned the fly over to" },
    guard:      { call: "Jaga!",       icon: "guard",     fx: "#3d7bff", fx2: "#cfe0ff", say: "had Pak Guard stop an attack from" },
    saji:       { call: "Tutup!",      icon: "saji",      fx: "#d9a35b", fx2: "#fff1d6", say: "covered a Nasi Lemak with Tudung Saji" },
    teleport:   { call: "Teleport!",   icon: "teleport",  fx: "#ffd23f", fx2: "#fff6d0", say: "swapped a Nasi Lemak with" },
    lori:       { call: "Rosak!",      icon: "lori",      fx: "#3d7bff", fx2: "#cfe0ff", say: "broke down the lorry of" },
    trade:      { call: "Deal!",       icon: null,        fx: "#34c25a", fx2: "#d6f7c9", say: "made a trade with" }
  };
  const fx = { seen: null, code: null, queue: [], timer: null };
  function fxPlay() {
    const job = fx.queue.shift();
    if (!job) { fxEl.hidden = true; return; }
    const F = FX[job.k];
    fxEl.style.setProperty("--fx", F.fx); fxEl.style.setProperty("--fx2", F.fx2);
    const art = F.icon ? svg(F.icon) : parcel("", false);
    fxEl.innerHTML = `<div class="kfx-rays"></div><div class="kfx-stage">${job.ch ? `<img class="kfx-hero" src="${charSrc(job.ch)}" alt="">` : ""}<div class="kfx-panel"><div class="kfx-icon">${art}</div><div class="kfx-txt"><span class="kfx-call">${esc(F.call)}</span><span class="kfx-who"><b>${esc(job.by)}</b> ${esc(F.say)}${job.to ? ` <b>${esc(job.to)}</b>` : ""}</span></div></div></div>`;
    fxEl.hidden = false;
    clearTimeout(fx.timer);
    fx.timer = setTimeout(fxPlay, 1500);
  }
  function fxObserve(v) {
    const L = S.last;
    if (fx.code !== S.code) { fx.code = S.code; fx.seen = null; }
    if (!L) { if (fx.seen === null) fx.seen = 0; return; }
    if (fx.seen === null || L.n < fx.seen) { fx.seen = L.n; return; }   // arriving mid-game: don't replay old moments
    if (L.n === fx.seen) return;
    fx.seen = L.n;
    const k = L.k === "trade" ? (L.ok ? "trade" : null) : L.k;
    if (!FX[k]) return;
    const who = i => (i === v ? "you" : nameOf(i));
    fx.queue.push({ k, ch: charOf(L.p), by: L.p === v ? "You" : nameOf(L.p), to: L.q != null && k !== "supplier" && k !== "thief" ? who(L.q) : "" });
    if (fxEl.hidden) fxPlay();
  }

  // ---- card designs: each player picks a front and a back; the table sees them on your played cards and your stall ----
  const FACES = { classic: "Classic", batik: "Batik", songket: "Songket", kopitiam: "Kopitiam", pasar: "Pasar Malam", kampung: "Kampung", boboiboy: "BoBoiBoy Elemental" };
  const BACKS = { daun: "Banana Leaf", batik: "Batik", songket: "Songket", jubin: "Kopitiam Tile", wau: "Wau", boboiboy: "BoBoiBoy Cap" };
  const store = { get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* not remembered, still applied */ } } };
  // each player picks a BoBoiBoy character; it stands behind their stall, leaps in on their moves and takes the win.
  // Name, and the colour their stall roof and booth light take.
  const CHARS = {
    halilintar: ["BoBoiBoy Halilintar", "#ff3b4a"], ais: ["BoBoiBoy Ais", "#5fd4ff"], blaze: ["BoBoiBoy Blaze", "#ff8a1f"], solar: ["BoBoiBoy Solar", "#ffc83a"],
    yaya: ["Yaya", "#ff5fb4"], ying: ["Ying", "#ffd23f"], gopal: ["Gopal", "#3ccf63"], fang: ["Fang", "#9b7bff"], ochobot: ["Ochobot", "#ffb21a"],
    tokaba: ["Tok Aba", "#5b8cff"], papazola: ["Papa Zola", "#3f73ff"], adudu: ["Adu Du", "#21c9a6"], probe: ["Probe", "#2fd6c0"]
  };
  const CHAR_KEYS = Object.keys(CHARS);
  // how each full-body picture sits in a round seat portrait so the face shows: width, left and top, in % of the circle
  const CROP = { halilintar: [215, -92, -42], ais: [160, -30, 6], blaze: [175, -62, 0], solar: [165, -36, 2], yaya: [160, -30, 3], ying: [160, -30, 3], gopal: [160, -30, 3],
    fang: [150, -30, -14], ochobot: [125, -8, -50], tokaba: [160, -30, 3], papazola: [175, -18, -12], adudu: [150, -25, 0], probe: [165, -38, -30] };
  const cropStyle = k => { const [w, l, t] = CROP[k] || [160, -30, 3]; return `width:${w}%;left:${l}%;top:${t}%`; };
  const charSrc = k => `assets/bb/${k}.webp`;
  let myFace = store.get("nl-face", "boboiboy"), myBack = store.get("nl-back", "boboiboy"), myChar = store.get("nl-char", "");
  if (!FACES[myFace]) myFace = "boboiboy";
  if (!BACKS[myBack]) myBack = "boboiboy";
  if (!CHARS[myChar]) myChar = "";
  const faceOf = i => { const v = typeof mySeat === "function" ? mySeat() : -1; if (i === v) return myFace; const p = S && S.players && S.players[i]; return p && FACES[p.face] ? p.face : "boboiboy"; };
  const backOf = i => { const v = typeof mySeat === "function" ? mySeat() : -1; if (i === v) return myBack; const p = S && S.players && S.players[i]; return p && BACKS[p.back] ? p.back : "boboiboy"; };
  // someone who hasn't picked gets a character by seat
  const charOf = i => { const v = typeof mySeat === "function" ? mySeat() : -1; if (i === v && myChar) return myChar; const p = S && S.players && S.players[i]; return p && CHARS[p.char] ? p.char : CHAR_KEYS[Math.max(0, i) % CHAR_KEYS.length]; };
  let styleSent = "";
  function syncStyle() {
    if (typeof S === "undefined" || !S || S.kind !== "nasi" || !S.players || typeof call !== "function") return;
    const v = mySeat(); if (v < 0) return;
    const P = S.players[v];
    if (P.face === myFace && P.back === myBack && (P.char || "") === myChar) { styleSent = ""; return; }
    const k = `${S.code}:${myFace}:${myBack}:${myChar}`; if (styleSent === k) return;
    styleSent = k; call("style", { face: myFace, back: myBack, char: myChar });
  }
  const designEl = document.createElement("div");
  designEl.className = "nl-design"; designEl.hidden = true;
  designEl.setAttribute("role", "dialog"); designEl.setAttribute("aria-modal", "true"); designEl.setAttribute("aria-label", "Card design");
  document.body.appendChild(designEl);
  function designHTML() {
    const mine = myChar || charOf(typeof mySeat === "function" ? mySeat() : 0);
    return `<div class="nl-designbox nl"><header><h2>Your look</h2><button class="nl-btn small" data-nd="close">Done</button></header>
      <p class="nl-muted">Everyone at the table sees your character at your stall, your fronts on the cards you play, and your backs on your stall.</p>
      <h3>Your character</h3><div class="nl-chargrid">${CHAR_KEYS.map(k => `<button class="nl-charopt" data-nd="char" data-k="${k}" aria-pressed="${k === mine}" style="--c:${CHARS[k][1]}"><img src="${charSrc(k)}" alt="" loading="lazy" decoding="async"><span>${CHARS[k][0]}</span></button>`).join("")}</div>
      <h3>Fronts</h3><div class="nl-designrow">${Object.entries(FACES).map(([k, n]) => `<button class="nl-designopt" data-nd="face" data-k="${k}" aria-pressed="${k === myFace}">${cardHTML(11, { face: k })}<span>${n}</span></button>`).join("")}</div>
      <h3>Backs</h3><div class="nl-designrow">${Object.entries(BACKS).map(([k, n]) => `<button class="nl-designopt" data-nd="back" data-k="${k}" aria-pressed="${k === myBack}"><span class="nl-backcard b-${k}"></span><span>${n}</span></button>`).join("")}</div></div>`;
  }
  function openDesign() { designEl.innerHTML = designHTML(); designEl.hidden = false; designEl.querySelector("[data-nd=close]").focus(); }
  designEl.addEventListener("click", e => {
    if (e.target === designEl) { designEl.hidden = true; return; }
    const b = e.target.closest("[data-nd]"); if (!b) return;
    if (b.dataset.nd === "close") { designEl.hidden = true; return; }
    if (b.dataset.nd === "char") { myChar = b.dataset.k; store.set("nl-char", myChar); }
    if (b.dataset.nd === "face") { myFace = b.dataset.k; store.set("nl-face", myFace); }
    if (b.dataset.nd === "back") { myBack = b.dataset.k; store.set("nl-back", myBack); }
    designEl.innerHTML = designHTML();
    syncStyle(); if (typeof window.render === "function" && S) window.render();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !designEl.hidden) designEl.hidden = true; });
  // the lobby's card-design corner (index.html places it under the code)
  function lobbyHTML() {
    setWeather("");
    const ch = myChar || charOf(typeof mySeat === "function" ? mySeat() : 0);
    return `<div class="nl-lobbydesign nl"><div class="nl-lobbyprev"><img class="nl-lobbyhero" src="${charSrc(ch)}" alt="">${cardHTML(11, { face: myFace })}<span class="nl-backcard b-${myBack}"></span></div>
      <div><b>${esc(CHARS[ch][0])}</b><p class="nl-muted">${myChar ? "Your character" : "Given by your seat until you pick one"} · ${FACES[myFace]} fronts · ${BACKS[myBack]} backs. Everyone sees them.</p><button class="nl-btn small" data-nd-open="1">Change your look</button></div></div>`;
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-nd-open]")) openDesign(); });

  // BoBoiBoy Elemental fronts: each ingredient is one of BoBoiBoy's elements, shown on a Power Watch badge
  const ELEMENT = { rice: "light", egg: "lightning", peanut: "earth", sambal: "fire", cucumber: "leaf", fly: "water", guard: "earth", saji: "leaf", rahsia: "fire", teleport: "light" };
  const GLYPH = {
    lightning: '<path d="M13.5 2 4.5 13.5h6l-1.5 8.5 9.5-12.5h-6.2z"/>',
    wind: '<path d="M3 8.5h10.5a3 3 0 1 0-3-3M3 12.5h14.5a3.2 3.2 0 1 1-3.2 3.2M3 16.5h7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    earth: '<path d="M12 2.5 20.5 9l-3 12.5h-11L3.5 9z"/><path d="M3.5 9h17M12 2.5 8.5 9l3.5 12.5L15.5 9z" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>',
    fire: '<path d="M12 2c1.8 4.2 6.5 6.2 6.5 11.5a6.5 6.5 0 0 1-13 0c0-3 1.8-5 3-6.8.8 1.8 1.2 3 3 4 .2-3.2-1.2-5.2.5-8.7z"/>',
    water: '<path d="M12 2.5c4.2 5.2 7 8.4 7 12.3a7 7 0 0 1-14 0c0-3.9 2.8-7.1 7-12.3z"/>',
    leaf: '<path d="M4.5 19.5C4.5 9.5 10.5 4 20.5 3.5c0 10-5.5 16-16 16z"/><path d="M4.5 19.5 14 10" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.4" stroke-linecap="round"/>',
    light: '<circle cx="12" cy="12" r="4.6"/><path d="M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4M4.8 4.8l2.4 2.4M16.8 16.8l2.4 2.4M4.8 19.2l2.4-2.4M16.8 7.2l2.4-2.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
  };
  const badge = el => `<span class="bb-badge bb-${el}" aria-hidden="true"><svg viewBox="0 0 24 24"><g fill="currentColor">${GLYPH[el]}</g></svg></span>`;
  // every action card stars a BoBoiBoy character whose powers fit it (the Fly stays a fly)
  const ACT_CHAR = { makcik: "tokaba", supplier: "ying", thief: "adudu", wholesaler: "gopal", officer: "papazola", swatter: "halilintar",
    fan: "yaya", guard: "ais", saji: "solar", rahsia: "blaze", teleport: "ochobot", lori: "fang" };
  function cardHTML(id, o = {}) {
    if (id == null || id < 0) return `<div class="nl-back">?</div>`;
    const t = N.typeOf(id), ing = N.ING[t], A = N.ACTIONS[t];
    const tag = o.tag || "div";
    const el = o.face === "boboiboy" ? ELEMENT[t] || "wind" : null;
    return `<${tag} class="nl-card ${ing ? "ing" : "act"} f-${o.face || "classic"}${el ? " el-" + el : ""} ${o.cls || ""}" style="--band:${ing ? BAND[t] : t === "fly" ? "#8f86ad" : "#ff8a1f"};${o.style || ""}" ${o.attrs || ""}>${el ? badge(el) : ""}${ACT_CHAR[t] ? `<span class="nl-art"><img src="assets/bb/${ACT_CHAR[t]}.webp" alt="" draggable="false"></span><span class="nl-ico">${svg(t)}</span>` : svg(t, "ill")}<b>${esc(ing ? ing.n : A.n)}</b><i>${esc(ing ? ing.ms : A.ms)}</i></${tag}>`;
  }
  const packsHTML = (p, mine, fresh = Infinity) => p.nl.length ? `<div class="nl-packs">${p.nl.map((e, k) => `<span class="nl-pack${e.fly != null ? " flied" : ""}${k >= fresh ? " fresh" : ""}" title="${e.fly != null ? "A fly is on this Nasi Lemak: it doesn't count" : mine || e.n >= 0 ? N.entryPacks(e) + " pack" + (N.entryPacks(e) > 1 ? "s" : "") : "Face down"}${e.bonus ? " (Lunch Rush +1)" : ""}${e.cover != null ? " · under a Tudung Saji" : ""}">${parcel(e.n >= 0 ? N.entryPacks(e) : "", e.n >= 0)}${e.fly != null ? svg("fly", "fly") : ""}${e.bonus ? `<span class="nl-rush" aria-hidden="true">+1</span>` : ""}${e.cover != null ? `<span class="nl-cover" aria-hidden="true">${svg("saji")}</span>` : ""}<span class="cnt">${k + 1}</span></span>`).join("")}</div>` : `<p class="nl-empty">No Nasi Lemak yet.</p>`;

  const ui = { sel: null, step: {}, trade: null, take: [], bid: null, key: "" };
  const ev = () => S.event && S.event.k;
  // the round's Kopitiam event, chalked on the board; it flips over when a new round starts
  function eventHTML() {
    if (!S.event || S.status !== "play") return "";
    const E = N.EVENTS[S.event.k], flip = ui.evRound != null && ui.evRound !== S.event.round;
    ui.evRound = S.event.round;
    const used = S.event.k === "rush" && S.event.used != null ? ` <em>Claimed by ${esc(nm(S.event.used, mySeat()))}.</em>` : "";
    return `<aside class="nl-event ev-${S.event.k}${flip ? " flip" : ""}" aria-live="polite"><span class="nl-evtag">Round ${S.event.round} · Kopitiam event</span>
      <b>${esc(E.n)}</b><i>${esc(E.ms)}</i><p>${esc(E.d)}${used}</p></aside>`;
  }
  function reset() { ui.sel = null; ui.step = {}; ui.trade = null; ui.take = []; ui.dump = null; ui.key = ""; }
  const opt = (a, data, label, sub, dis) => `<button class="nl-opt" data-n="${a}" ${Object.entries(data).map(([k, x]) => `data-${k}="${esc(x)}"`).join(" ")}${dis ? " disabled" : ""}>${label}${sub ? `<small>${sub}</small>` : ""}</button>`;
  const others = v => S.players.map((_, i) => i).filter(i => i !== v);
  const nm = (i, v) => i === v ? "you" : nameOf(i);
  const ingsOf = P => { const by = {}; P.hand.filter(N.isIng).forEach(id => { (by[N.typeOf(id)] = by[N.typeOf(id)] || []).push(id); }); return by; };
  const countIn = (P, t) => P.hand.filter(id => N.typeOf(id) === t).length;

  function panelHTML(v) {
    const P = S.players[v], pd = S.pending;
    if (S.status !== "play") return `<h3>Stalls closed</h3><p class="nl-muted">Thanks for playing.</p>`;
    if (pd && pd.k === "market") return marketHTML(v);
    if (S.turn !== v) return `<h3>${esc(nameOf(S.turn))}'s turn</h3><p class="nl-muted">Your turn comes soon. Plan which ingredients you still need.</p>`;
    if (pd && pd.k === "trade") return `<h3>Old trade offer</h3><div class="nl-row"><button class="nl-btn" data-n="cancel">Withdraw it</button></div>`;
    if (pd && pd.k === "officer") {
      const hand = pd.hand || [], need = Math.min(2, hand.length);
      return `<h3>${esc(nameOf(pd.to))}'s hand</h3><p class="nl-muted">Only you can see these. Tap ${need} to take.</p>
        <div class="nl-hand" style="padding-top:.2rem">${hand.map(id => cardHTML(id, { tag: "button", face: faceOf(pd.to), cls: ui.take.includes(id) ? "sel" : "", attrs: `data-n="pick" data-id="${id}"` })).join("")}</div>
        <div class="nl-row"><button class="nl-btn go" data-n="take" ${ui.take.length === need ? "" : "disabled"}>Take ${need} card${need === 1 ? "" : "s"}</button></div>`;
    }
    const dn = N.drawFor(S), mv = N.movesFor(S);
    if (!S.drew && P.lori) return `<h3>Your lorry broke down</h3><p class="nl-muted">Someone played Lori Rosak on you: no cards this turn. Drawing isn't one of your ${mv} moves.</p><div class="nl-row"><button class="nl-btn go" data-n="draw">Carry on without cards</button></div>`;
    if (!S.drew) return `<h3>Your turn</h3><p class="nl-muted">Start by drawing ${dn} cards${!P.hand.length ? ", one extra because your hand is empty" : ""}. Drawing isn't one of your ${mv} moves.</p><div class="nl-row"><button class="nl-btn go" data-n="draw">Draw ${dn} cards</button></div>`;
    const extra = P.hand.length - N.HAND;
    if (ui.dump && extra > 0) return `<h3>Too many cards</h3><p class="nl-muted">You can keep ${N.HAND}. Tap ${extra} card${extra === 1 ? "" : "s"} in your hand to discard. ${ui.dump.length} of ${extra} picked.</p>
      <div class="nl-row"><button class="nl-btn go" data-n="dumpgo" ${ui.dump.length === extra ? "" : "disabled"}>Discard and end turn</button><button class="nl-btn small" data-n="dumpclose">Back</button></div>`;
    const left = mv - S.moves, end = `<button class="nl-btn" data-n="end">End turn</button>${extra > 0 ? `<span class="nl-muted" style="font-size:.85rem">${extra} over the ${N.HAND}-card limit: you'll discard ${extra === 1 ? "one" : extra} when you end.</span>` : ""}`;
    if (left <= 0) return `<h3>All ${mv} moves used</h3><p class="nl-muted">End your turn when you're ready.</p><div class="nl-row">${end}</div>`;
    if (ui.trade) return tradeHTML(v) ;
    if (ui.sel != null) return selectedHTML(v) + `<div class="nl-row"><button class="nl-btn small" data-n="unsel">Cancel</button>${end}</div>`;
    const by = ingsOf(P), types = Object.keys(by).length, mk = P.hand.find(id => N.typeOf(id) === "makcik"), rh = P.hand.find(id => N.typeOf(id) === "rahsia");
    const missing = N.ING_KEYS.filter(t => !by[t]).map(t => N.ING[t].n);
    return `<h3>${left} move${left === 1 ? "" : "s"} left</h3>
      <div class="nl-opts">
        ${opt("make", {}, "Make a Nasi Lemak", types === 5 ? "Uses one of each ingredient" : `Still missing: ${missing.join(", ")}`, types < 5 || !S.nlPile.length)}
        ${rh != null && types === 4 ? opt("make", { rh }, "Make one with Sambal Rahsia", `It stands in for the ${missing[0]}`, !S.nlPile.length) : ""}
        ${mk != null ? opt("make", { mk }, "Make one with Mak Cik", types >= 3 ? "Uses Mak Cik plus 3 different ingredients" : "You need 3 different ingredients", types < 3 || !S.nlPile.length) : ""}
        ${mk != null && rh != null && types === 2 ? opt("make", { mk, rh }, "Make one with Mak Cik and Sambal Rahsia", "Uses both plus 2 different ingredients", !S.nlPile.length) : ""}
        ${opt("tradeopen", {}, "Open the market", ev() === "hujan" ? "Hujan Lebat: no trading this round" : ev() === "pasar" ? "Pasar Malam: trades are free this round" : "Put cards up for trade and let everyone bid", ev() === "hujan")}
      </div>
      <p class="nl-muted" style="font-size:.88rem">Or tap an action card in your hand to play it.</p>
      <div class="nl-row">${end}</div>`;
  }

  function selectedHTML(v) {
    const P = S.players[v], id = ui.sel, t = N.typeOf(id), A = N.ACTIONS[t], st = ui.step;
    const head = `<h3>${esc(A.n)}</h3><p class="nl-muted" style="font-size:.9rem">${esc(A.d)}</p>`;
    const none = m => `<p class="nl-muted">${m}</p>`;
    let body = "";
    if (ev() === "raya" && N.RAYA_BLOCKS.includes(t)) return head + none("Hari Raya Open House: everyone's friends this round. Keep this card for the next one.");
    switch (t) {
      case "makcik": body = none("Use the “Make one with Mak Cik” button once you have 3 different ingredients."); break;
      case "rahsia": body = none("Use the “Make one with Sambal Rahsia” button once you have 4 different ingredients."); break;
      case "guard": body = none("Keep Pak Guard in your hand. The next attack on you is stopped by itself."); break;
      case "saji": {
        const list = P.nl.map((e, k) => e.fly == null && e.cover == null ? opt("play", { slot: k }, `Cover Nasi Lemak ${k + 1}`, "No fly can land on it again") : "").join("");
        body = list || none("You need a Nasi Lemak with no fly and no cover. Keep this for later.");
        break;
      }
      case "teleport": {
        if (!P.nl.length) { body = none("Wrap a Nasi Lemak first, then swap it."); break; }
        if (st.slot == null) { body = P.nl.map((e, k) => opt("step", { slot: k }, `Send your Nasi Lemak ${k + 1}`, e.fly != null ? "It has a fly on it" : e.cover != null ? "Under a Tudung Saji" : "")).join(""); break; }
        const list = []; others(v).forEach(p => S.players[p].nl.forEach((e, k) => list.push(opt("play", { slot: st.slot, p, to: k }, `For ${esc(nameOf(p))}'s Nasi Lemak ${k + 1}`, e.fly != null ? "It has a fly on it" : "Face down: 1 or 2 packs"))));
        body = list.join("") || none("Nobody else has a Nasi Lemak yet.");
        break;
      }
      case "lori": body = others(v).map(p => opt("play", { p }, `Break down ${esc(nameOf(p))}'s lorry`, S.players[p].lori ? "Already broken down" : "No cards on their next draw", S.players[p].lori)).join(""); break;
      case "supplier": body = N.ING_KEYS.map(k => opt("play", { ing: k }, `Call for ${esc(N.ING[k].n)}`, `You hold ${countIn(P, k)}`)).join(""); break;
      case "thief": body = opt("play", {}, "Send the Thief", "One random card from each other player"); break;
      case "wholesaler": body = opt("play", {}, "Call the Wholesaler", `${S.deck.length} cards in the draw pile`); break;
      case "officer": body = others(v).map(p => opt("play", { p }, `Inspect ${esc(nameOf(p))}`, `${S.players[p].hand.length} cards in hand`, !S.players[p].hand.length)).join(""); break;
      case "fly": {
        const list = []; others(v).forEach(p => S.players[p].nl.forEach((e, k) => { if (e.fly == null && e.cover == null) list.push(opt("play", { p, slot: k }, `${esc(nameOf(p))} · Nasi Lemak ${k + 1}`, "Land the fly here")); }));
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
        else { const list = []; others(v).forEach(p => S.players[p].nl.forEach((e, k) => { if (e.fly == null && e.cover == null) list.push(opt("play", { slot: st.slot, p, to: k }, `Onto ${esc(nameOf(p))}'s Nasi Lemak ${k + 1}`)); }));
          body = list.join("") || none("Nobody else has a Nasi Lemak without a fly."); }
        break;
      }
    }
    return head + `<div class="nl-opts">${body}</div>`;
  }

  function tradeHTML(v) {
    const P = S.players[v], tr = ui.trade;
    const types = [...N.ING_KEYS, ...N.TRADE_ACTS];
    const giveN = tr.give.length, wantN = Object.values(tr.want).reduce((a, b) => a + b, 0);
    return `<h3>Open the market</h3>
      <p class="nl-muted" style="font-size:.88rem"><b>You give:</b> tap ingredients or defence cards in your hand. ${giveN ? `${giveN} picked.` : "Nothing picked yet."}</p>
      <p class="nl-muted" style="font-size:.88rem;margin-bottom:-.2rem"><b>You're looking for</b> (a hint for bidders; you can take any bid):</p>
      <div class="nl-steps">${types.map(t => `<span>${esc(N.cardName(t))}</span><button class="nl-btn small" data-n="want" data-t="${t}" data-d="-1" aria-label="Fewer ${esc(N.cardName(t))}" ${tr.want[t] ? "" : "disabled"}>−</button><b style="text-align:center;min-width:1.2rem">${tr.want[t] || 0}</b><button class="nl-btn small" data-n="want" data-t="${t}" data-d="1" aria-label="More ${esc(N.cardName(t))}">+</button>`).join("")}</div>
      <div class="nl-row"><button class="nl-btn go" data-n="tradesend" ${giveN || wantN ? "" : "disabled"}>Open for bids</button><button class="nl-btn small" data-n="tradeclose">Cancel</button></div>
      <p class="nl-muted" style="font-size:.82rem">Everyone else can bid with their own cards. ${ev() === "pasar" ? "Pasar Malam: the trade won't use a move." : "It only uses a move when you take a bid."}</p>`;
  }

  // the open market: the trader's cards are up, everyone else bids, the trader takes the bid they like
  function marketHTML(v) {
    const pd = S.pending, mine = pd.from === v, P = S.players[v];
    const names = ids => ids.map(id => esc(N.cardName(N.typeOf(id)))).join(", ");
    const covers = ids => pd.want.length > 0 && pd.want.every(w => ids.filter(id => N.typeOf(id) === w.t).length >= w.n);
    const head = `<h3>${mine ? "Your market is open" : `${esc(nameOf(pd.from))}'s market`}</h3>
      <div class="nl-offer"><p><b>${mine ? "You give" : "They give"}</b> ${pd.give.length ? names(pd.give) : "nothing"}</p>
        <p><b>Looking for</b> ${pd.want.length ? pd.want.map(w => `${w.n} ${esc(N.cardName(w.t))}`).join(", ") : "any good offer"}</p></div>`;
    const rows = Object.entries(pd.bids).map(([q, ids]) => `<li class="nl-bid${covers(ids) ? " match" : ""}${+q === v ? " me" : ""}">
      <span><b>${esc(nm(+q, v))}</b>${covers(ids) ? `<em>${mine ? "Has what you want" : "Covers the ask"}</em>` : ""}<br>${names(ids)}</span>
      ${mine ? `<button class="nl-btn go small" data-n="accept" data-p="${q}">Trade</button>` : ""}</li>`).join("");
    const list = `<span class="nl-cap">Bids</span>${rows ? `<ul class="nl-bids">${rows}</ul>` : `<p class="nl-muted">No bids yet.</p>`}`;
    if (mine) return head + list + `<div class="nl-row"><button class="nl-btn" data-n="cancel">Close the market</button></div>
      <p class="nl-muted" style="font-size:.82rem">Take any bid you like. ${ev() === "pasar" ? "Pasar Malam: it won't use a move." : "It uses a move once you trade."}</p>`;
    if (!P) return head + list;
    const sel = ui.bid || [], had = pd.bids[v], fill = fillFor(P, pd.want);
    return head + list + `<p class="nl-muted" style="font-size:.88rem">Tap ingredients or defence cards in your hand to build your bid. ${sel.length ? `<b>${sel.length} picked:</b> ${names(sel)}` : "Nothing picked yet."}</p>
      <div class="nl-row"><button class="nl-btn go" data-n="bid" ${sel.length ? "" : "disabled"}>${had ? "Update my bid" : "Place my bid"}</button>
        ${fill ? `<button class="nl-btn small" data-n="bidfill">Pick what they want</button>` : ""}
        ${had ? `<button class="nl-btn small" data-n="bidclear">Take back my bid</button>` : ""}</div>`;
  }
  // the cards in a hand that cover a market's ask, or null if the hand can't
  function fillFor(P, want) {
    if (!want.length) return null;
    const out = [];
    for (const w of want) { const have = P.hand.filter(id => N.typeOf(id) === w.t).slice(0, w.n); if (have.length < w.n) return null; out.push(...have); }
    return out;
  }

  function render() {
    const v = mySeat(), P = S.players[v], n = S.players.length;
    const myTurn = S.status === "play" && S.turn === v, pd = S.pending;
    const waiting = N.waitingOn(S);
    document.title = waiting.includes(v) && v >= 0 ? "Your move · Nasi Lemak" : "Nasi Lemak";
    const key = `${S.code}:${S.turnN}:${S.status}:${pd ? pd.k + pd.from + pd.to : ""}`;
    if (key !== ui.key) { ui.key = key; ui.sel = null; ui.step = {}; ui.trade = null; ui.take = []; ui.dump = null; }
    if (ui.dump && P) ui.dump = ui.dump.filter(id => P.hand.includes(id));
    if (P && ui.sel != null && !P.hand.includes(ui.sel)) { ui.sel = null; ui.step = {}; }
    if (ui.trade && P) ui.trade.give = ui.trade.give.filter(id => P.hand.includes(id));
    if (pd && pd.k === "market" && P && pd.from !== v) ui.bid = (ui.bid || pd.bids[v] || []).filter(id => P.hand.includes(id)); else ui.bid = null;
    const topId = S.discard[S.discard.length - 1];
    const say = S.status === "over" ? `${esc(S.winner === v ? "You win!" : nameOf(S.winner) + " wins!")}`
      : pd && pd.k === "market" ? `${pd.from === v ? "Your" : esc(nameOf(pd.from)) + "'s"} market is open`
      : myTurn ? (S.drew ? "Your turn" : `Your turn: draw ${N.drawFor(S)}`) : `${esc(nameOf(S.turn))}'s turn`;
    const sub = S.status !== "play" ? "" : `${S.drew ? `${S.moves} of ${N.movesFor(S)} moves` : "Drawing"}<span class="nl-dots">${Array.from({ length: N.movesFor(S) }, (_, i) => `<i class="${i < S.moves ? "used" : ""}"></i>`).join("")}</span>${S.clock ? ` · <b data-clock="turn">${N.TURN_MS / 60000}:00</b> left` : ""}`;
    const last = S.log[S.log.length - 1] || "";
    const myPacks = P ? N.packs(P) : 0;
    // what's new since the last screen: cards drop into your hand, freshly wrapped packs pop onto counters
    const sameGame = ui.game === S.code + ":" + S.created;
    const prevHand = sameGame ? ui.hand : null, prevPacks = sameGame ? ui.packs : null;
    ui.game = S.code + ":" + S.created; ui.hand = P ? P.hand.slice() : []; ui.packs = S.players.map(p => p.nl.length);
    const stamp = myTurn && !S.drew && ui.stampTurn !== S.turnN;
    if (myTurn) ui.stampTurn = S.turnN;
    // everyone sits round the table in seat order: you at the bottom, the others clockwise from your left;
    // layoutRing() then spaces them out so no two stalls (and no stall and the counter) ever touch
    const base = v >= 0 ? v : 0, ring = Array.from({ length: n }, (_, k) => (base + k) % n);
    const stall = (i, k) => {
      const O = S.players[i], on = S.turn === i && S.status === "play", nick = i === v ? "You" : nameOf(i);
      const tag = on ? `<span class="nl-open">${pd && pd.k === "market" ? "Market open" : "Serving"}</span>`
        : pd && pd.k === "market" && pd.bids[i] ? `<span class="nl-open bid">Bid in</span>` : "";
      const ch = charOf(i), fresh = prevPacks ? prevPacks[i] : Infinity;
      // one tiny parcel per Nasi Lemak wrapped: greyed under a fly, capped by a Tudung Saji, dotted for a Lunch Rush +1
      const pks = O.nl.slice(0, 4).map((e, j) => `<span class="nl-pk${e.fly != null ? " flied" : ""}${e.cover != null ? " covered" : ""}${e.bonus ? " bonus" : ""}${j >= fresh ? " fresh" : ""}">${parcel("", false)}${e.fly != null ? svg("fly", "fly") : ""}</span>`).join("") + (O.nl.length > 4 ? `<span class="nl-more">+${O.nl.length - 4}</span>` : "");
      const desc = `${nick}, ${CHARS[ch][0]}: ${O.hand.length} cards, ${O.nl.length} Nasi Lemak wrapped${O.nl.some(e => e.fly != null) ? ", a fly on one" : ""}${S.status === "over" || i === v ? `, ${N.packs(O)} packs` : ""}${O.lori ? ", lorry broken down" : ""}`;
      return `<article class="nl-stall${i === v ? " me" : ""}${on ? " on" : ""}${waiting.includes(i) && pd ? " wait" : ""}" data-k="${k}" style="--awn:${CHARS[ch][1]}" title="${esc(desc)}" aria-label="${esc(desc)}">
        <div class="nl-av"><div class="nl-face"><img src="${charSrc(ch)}" alt="" style="${cropStyle(ch)}"></div>${tag}</div>
        <b class="nl-name">${esc(nick)}</b>
        <div class="nl-line"><span class="nl-cards"><i class="nl-mini b-${backOf(i)}" aria-hidden="true"></i>${O.hand.length}</span>${pks ? `<span class="nl-pks" aria-hidden="true">${pks}</span>` : ""}${S.status === "over" || i === v ? `<span>${N.packs(O)}p</span>` : ""}${O.lori ? `<span class="lori">Lori</span>` : ""}</div></article>`;
    };
    let fresh = 0;
    $app.innerHTML = `<div class="nl">
      <header class="nl-top"><span class="mark">Nasi Lemak</span><span class="nl-code">TABLE ${esc(S.code)}</span><span class="grow"></span>${netDown ? `<span class="nl-muted">Reconnecting…</span>` : ""}<button class="nl-btn small" data-nd-open="1">Your look</button>${S.status === "play" && v >= 0 && !(S.vote && S.vote.kind === "pause") ? `<button class="nl-btn small" data-n="pause" title="Ask the table to pause and finish later">Pause</button>` : ""}${typeof sndBtn === "function" ? sndBtn() : ""}<button class="nl-btn small" data-a="home">Leave table</button></header>
      <p class="nl-ticker">${fmt(last)}</p>
      ${eventHTML()}
      ${S.status === "over" ? winHTML(v) : ""}
      <section class="nl-market nl-ring${n >= 7 ? " many" : ""}" aria-label="The table" data-n="${n}">
        <span class="nl-orbit" aria-hidden="true"></span>
        ${ring.map((i, k) => stall(i, k)).join("")}
        <div class="nl-felt${stamp ? " yourturn" : ""}"><span class="nl-leafmat" aria-hidden="true"></span>
          <div class="nl-piles"><div class="nl-pile"><div class="nl-back">${S.deck.length}</div>Draw pile</div>
            <div class="nl-pile">${topId != null ? cardHTML(topId, { cls: "small", face: S.by && S.by[topId] != null ? faceOf(S.by[topId]) : "boboiboy" }) : `<div class="nl-back" style="opacity:.35"></div>`}Discard</div>
            <div class="nl-pile"><div class="nl-back gold">${S.nlPile.length}</div>Nasi Lemak</div></div>
          <div class="nl-say">${say}</div><div class="nl-sub">${sub}</div>
        </div>
      </section>
      ${P ? `<div class="nl-zone">
        <section class="nl-mine"><span class="nl-cap">Your stall</span>
          <p class="nl-score" style="margin:.4rem 0">${myPacks} <small>of ${N.GOAL} packs${P.nl.some(e => e.fly != null) ? " · a fly is spoiling one" : ""}</small></p>
          <div class="nl-meter" aria-hidden="true">${Array.from({ length: N.GOAL }, (_, k) => `<i class="${k < myPacks ? "on" : ""}"></i>`).join("")}</div>
          ${packsHTML(P, true, prevPacks && prevPacks[v] != null ? prevPacks[v] : Infinity)}</section>
        <section class="nl-panel" aria-live="polite">${panelHTML(v)}</section>
        <div class="nl-handwrap"><span class="nl-cap">Your hand · ${P.hand.length} cards${P.hand.length > N.HAND ? ` · keep ${N.HAND} at the end of your turn` : ""} · only you can see it</span>
          <div class="nl-hand">${handOrder(P.hand).map(id => { const g = (ui.trade && ui.trade.give.includes(id)) || (ui.dump && ui.dump.includes(id)) || (ui.bid && ui.bid.includes(id)), s = ui.sel === id, isNew = !prevHand || !prevHand.includes(id);
            return cardHTML(id, { tag: "button", cls: (g ? "give" : s ? "sel" : "") + (isNew ? " fresh" : ""), attrs: `data-n="card" data-id="${id}"`, face: myFace, style: isNew ? `--d:${fresh++}` : "" }); }).join("") || `<p class="nl-empty">No cards in hand.</p>`}</div></div>
      </div>` : `<p class="nl-muted" style="margin-top:1rem">You're watching this game.</p>`}
      <section class="nl-log"><span class="nl-cap">At the stalls</span><ol>${S.log.slice(-25).map(m => `<li>${fmt(m)}</li>`).join("")}</ol></section>
      ${rulesHTML()}</div>`;
    layoutRing();
    fxObserve(v);
    syncStyle();
    setWeather(S.status === "play" && S.event ? S.event.k : "");
  }
  // Seats the stalls round the counter. Stalls sit on an ellipse as wide as the table allows; the ellipse grows taller,
  // a step at a time, until no two stalls overlap and none touches the counter. Runs after every render and on resize.
  function layoutRing() {
    const ring = $app.querySelector(".nl-ring"); if (!ring) return;
    const seats = [...ring.querySelectorAll(".nl-stall")], felt = ring.querySelector(".nl-felt"), orbit = ring.querySelector(".nl-orbit"), n = seats.length;
    const W = ring.clientWidth, gap = W < 560 ? 10 : 18;
    const sw = Math.max(...seats.map(e => e.offsetWidth)), sh = Math.max(...seats.map(e => e.offsetHeight));
    const ang = k => Math.PI / 2 + k * 2 * Math.PI / n;
    const sideways = seats.some((_, k) => Math.abs(Math.cos(ang(k))) > .55);
    // the counter: as wide as the side stalls allow, never smaller than its piles need. When the side stalls leave it too
    // little room (phones), it takes the full width instead and the side stalls step above or below its edge.
    const small = W < 560, minFw = small ? 196 : 280, between = W - 2 * sw - 2 * gap;
    felt.classList.toggle("small", small);
    const beside = !sideways || between >= minFw;
    const fw = Math.max(minFw, Math.min(beside && sideways ? between : W - 2 * gap, 520));
    const fh = Math.max(small ? 160 : 210, Math.min(fw * .5, 250));
    // seats hug the counter rather than spreading to the screen's edges
    const rx = Math.max(0, Math.min((W - sw) / 2, fw / 2 + sw / 2 + gap + (n > 6 ? 40 : 10)));
    const clearY = fh / 2 + gap + sh / 2;
    const place = (H, ry, k) => {
      const a = ang(k), x = W / 2 + rx * Math.cos(a) - sw / 2;
      let dy = ry * Math.sin(a);
      // a stall level with the counter that can't fit beside it moves to just above (left half) or below (right half) its edge
      if (!beside && Math.abs(dy) < clearY && Math.abs(x + sw / 2 - W / 2) < fw / 2 + sw / 2 + gap) dy = (Math.abs(Math.sin(a)) > 1e-6 ? Math.sign(Math.sin(a)) : (Math.cos(a) < 0 ? -1 : 1)) * clearY;
      return [x, H / 2 + dy - sh / 2];
    };
    const clear = (H, ry) => {
      const pos = seats.map((_, k) => place(H, ry, k));
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++)
        if (Math.abs(pos[a][0] - pos[b][0]) < sw + gap && Math.abs(pos[a][1] - pos[b][1]) < sh + gap) return null;
      // no stall corner or edge midpoint inside the counter's ellipse (with a gap round it)
      const ea = fw / 2 + gap, eb = fh / 2 + gap;
      for (const [x, y] of pos) for (const [px, py] of [[x, y], [x + sw, y], [x, y + sh], [x + sw, y + sh], [x + sw / 2, y], [x + sw / 2, y + sh], [x, y + sh / 2], [x + sw, y + sh / 2]])
        if (((px - W / 2) / ea) ** 2 + ((py - H / 2) / eb) ** 2 < 1) return null;
      return pos;
    };
    let ry = clearY, H = 2 * ry + sh, pos = null;
    for (let i = 0; i < 400 && !(pos = clear(H, ry)); i++) { ry += 6; H = 2 * ry + sh; }
    // A narrow screen can't hold a big table on an oval without making it very tall. Then the stalls run round a
    // rounded rectangle instead: you and your two neighbours along the bottom, everyone else clockwise up the left side,
    // across the top and down the right side, above the counter.
    if (!pos || H > Math.max(W * 1.75, 2 * sh + fh + 4 * gap)) {
      const cols = Math.max(2, Math.min(n, Math.floor((W + gap) / (sw + gap))));
      const bottom = n <= cols ? n : Math.min(cols, 3), upper = n - bottom, rows = Math.ceil(upper / cols);
      const cells = [];
      for (let r = rows - 1; r >= 0; r--) cells.push([r, 0]);
      for (let c = 1; c < cols; c++) cells.push([0, c]);
      for (let r = 1; r < rows; r++) cells.push([r, cols - 1]);
      for (let r = 1; r < rows; r++) for (let c = 1; c < cols - 1; c++) cells.push([r, c]);
      const used = cells.slice(0, upper), cw = (W - cols * sw) / Math.max(1, cols - 1);
      // the top block's rows centre their seats when a row isn't full
      const rowCount = r => used.filter(([rr]) => rr === r).length;
      const xOf = (r, c) => { const m = rowCount(r); const cs = used.filter(([rr]) => rr === r).map(([, cc]) => cc).sort((a, b) => a - b);
        const off = (W - (m * sw + (m - 1) * gap)) / 2; return m < cols ? off + cs.indexOf(c) * (sw + gap) : c * (sw + cw); };
      const topH = rows ? rows * sh + (rows - 1) * gap + gap : 0;
      H = topH + fh + 2 * gap + sh;
      const bx = (W - (bottom * sw + (bottom - 1) * gap)) / 2;
      // bottom row, left to right: your left-hand neighbour, you, your right-hand neighbour
      const bottomKs = bottom === 1 ? [0] : bottom === 2 ? [1, 0] : n <= cols ? Array.from({ length: n }, (_, j) => j) : [1, 0, n - 1];
      const bottomOrder = n <= cols ? [...bottomKs.slice(1).reverse(), 0].reverse() : bottomKs;
      pos = seats.map(() => [0, 0]);
      bottomOrder.forEach((k, j) => { pos[k] = [bx + j * (sw + gap), H - sh]; });
      const upperKs = Array.from({ length: n }, (_, k) => k).filter(k => !bottomOrder.includes(k));
      upperKs.forEach((k, j) => { const [r, c] = used[j]; pos[k] = [xOf(r, c), r * (sh + gap)]; });
      Object.assign(felt.style, { width: `${Math.round(fw)}px`, height: `${Math.round(fh)}px`, left: `${Math.round((W - fw) / 2)}px`, top: `${Math.round(topH + gap)}px` });
      ring.style.height = `${Math.ceil(H)}px`;
      seats.forEach((e, k) => { e.style.left = `${Math.round(pos[k][0])}px`; e.style.top = `${Math.round(pos[k][1])}px`; });
      orbit.hidden = true;
      return;
    }
    // the orbit runs through the middle of every portrait: the seats' oval, raised to the portrait's centre
    const avY = (seats[0].querySelector(".nl-av").offsetTop + seats[0].querySelector(".nl-av").offsetHeight / 2) - sh / 2;
    orbit.hidden = !beside;
    Object.assign(orbit.style, { left: `${Math.round(W / 2 - rx)}px`, top: `${Math.round(H / 2 - ry + avY)}px`, width: `${Math.round(2 * rx)}px`, height: `${Math.round(2 * ry)}px` });
    ring.style.height = `${Math.ceil(H)}px`;
    seats.forEach((e, k) => { e.style.left = `${Math.round(pos[k][0])}px`; e.style.top = `${Math.round(pos[k][1])}px`; });
    Object.assign(felt.style, { width: `${Math.round(fw)}px`, height: `${Math.round(fh)}px`, left: `${Math.round((W - fw) / 2)}px`, top: `${Math.round((H - fh) / 2)}px` });
  }
  let ringTimer = null;
  window.addEventListener("resize", () => { clearTimeout(ringTimer); ringTimer = setTimeout(() => { if (typeof S !== "undefined" && S && S.kind === "nasi" && view === "game") layoutRing(); }, 80); });
  const handOrder = h => h.slice().sort((a, b) => { const A = N.card(a), B = N.card(b); return (A.kind === B.kind ? 0 : A.kind === "ing" ? -1 : 1) || A.t.localeCompare(B.t) || a - b; });

  function winHTML(v) {
    const rows = S.players.map((p, i) => ({ i, packs: N.packs(p), cards: p.nl.length })).sort((a, b) => b.packs - a.packs || b.cards - a.cards);
    return `<div class="nl-win"><img class="nl-winhero" src="${charSrc(charOf(S.winner))}" alt="${esc(CHARS[charOf(S.winner)][0])}"><h2>${S.winner === v ? "You win!" : esc(nameOf(S.winner)) + " wins!"}</h2>
      <p class="nl-muted">${rows.map(r => `${esc(nm(r.i, v))}: ${r.packs} pack${r.packs === 1 ? "" : "s"}`).join(" · ")}</p>
      <div class="nl-row" style="justify-content:center">${S.host === me ? `<button class="nl-btn go" data-a="again">Open the stalls again</button>` : `<span class="nl-muted">The table owner can start a rematch.</span>`}<button class="nl-btn" data-a="home">Leave table</button></div></div>`;
  }

  function mastHTML() {
    setWeather("");
    const fan = [0, 10, 20, 30, 40].map((id, k) => cardHTML(id, { face: "boboiboy", style: `--d:${k};--r:${[-8, -3, 2, 6, 10][k]}deg` })).join("");
    return `<header class="nl-mast nl"><div><h1>Nasi<span>Lemak</span></h1>
      <p>Run a Nasi Lemak stall at Tok Aba's Kokotiam with BoBoiBoy and friends. Collect rice, egg, peanuts, sambal bilis and cucumber, wrap your packs, and sabotage your neighbours with flies, thieves and officers. First to 5 packs wins. 2 to 10 players, each on their own phone or computer.</p></div>
      <figure class="nl-galaxy"><img class="shot" src="assets/bb/crew.webp" alt="BoBoiBoy, Yaya, Gopal, Ochobot, Fang and Ying floating in space" width="670" height="417">
        <img class="pop l" src="assets/bb/blaze.webp" alt="" decoding="async"><img class="pop r" src="assets/bb/ais.webp" alt="" decoding="async"><div class="nl-mastfan" aria-hidden="true">${fan}</div></figure></header>`;
  }
  function rulesHTML() {
    const acts = Object.entries(N.ACTIONS).map(([k, a]) => `<li><b>${esc(a.n)}</b> (${a.count}): ${esc(a.d)}</li>`).join("");
    return `<details class="nl-rules nl"><summary>How to play Nasi Lemak</summary><div class="cols">
      <div><h3>Your turn</h3><ul>
        <li>Draw 2 cards. This isn't a move.</li>
        <li>Then make up to 3 moves, in any order: <b>make a Nasi Lemak</b>, <b>trade</b>, or <b>play an action card</b>.</li>
        <li><b>Make a Nasi Lemak</b> with one each of Rice, Egg, Peanuts, Sambal Bilis and Cucumber. You take the top card of the Nasi Lemak pile, face down: it holds 1 or 2 packs.</li>
        <li><b>Trade</b> by opening the market on your turn: put up the cards you'll give and say what you're looking for. Everyone else bids with cards from their hand, and everyone sees the bids. Take the bid you like best, on any terms: 2 for 1 is fine. Ingredients and defence cards (Fly Swatter, Fan, Pak Guard, Tudung Saji, Sambal Rahsia) can be traded. It counts as a move only when you take a bid.</li>
        <li><b>Empty hand</b>: if you start your turn with no cards, draw 3 instead of 2.</li>
        <li><b>Hand limit</b>: you can hold ${N.HAND} cards. When you end your turn with more, pick the extras to discard. If your time runs out, random ones go.</li>
        <li><b>Win</b> with 5 packs on your turn. A Nasi Lemak with a Fly on it doesn't count. If the Nasi Lemak pile runs out, the most packs wins.</li></ul>
        <h3>Kopitiam events</h3><ul><li>Each round, once everyone has had a turn, a new event is flipped on the board. It changes one rule for the whole table until the next round.</li>
        ${Object.values(N.EVENTS).map(E => `<li><b>${esc(E.n)}</b>: ${esc(E.d)}</li>`).join("")}</ul></div>
      <div><h3>Action cards</h3><ul>${acts}</ul></div>
      <div><h3>The deck</h3><ul><li>50 ingredients: 10 each of Rice, Egg, Peanuts, Sambal Bilis and Cucumber.</li><li>34 action cards: the rulebook's 25 plus our own 9 (2 Pak Guard, 2 Tudung Saji, 2 Sambal Rahsia, 1 Ochobot Teleport, 2 Lori Rosak).</li><li>15 Nasi Lemak cards: 8 with one pack, 7 with two.</li><li>Each player starts with 7 cards.</li><li>With 6 to 10 players, a second full deck and a second Nasi Lemak pile are shuffled in.</li></ul>
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
        if (ui.dump) {
          const k = ui.dump.indexOf(id), extra = P.hand.length - N.HAND;
          if (k >= 0) ui.dump.splice(k, 1); else if (ui.dump.length < extra) ui.dump.push(id); else return flash(`You only need to discard ${extra}.`);
          return render();
        }
        if (ui.bid) {
          if (!N.tradable(N.typeOf(id))) return flash("Only ingredients and defence cards can be traded.");
          const k = ui.bid.indexOf(id); if (k >= 0) ui.bid.splice(k, 1); else ui.bid.push(id);
          return render();
        }
        if (ui.trade) {
          if (!N.tradable(N.typeOf(id))) return flash("Only ingredients and defence cards can be traded.");
          const k = ui.trade.give.indexOf(id); if (k >= 0) ui.trade.give.splice(k, 1); else ui.trade.give.push(id);
          return render();
        }
        if (S.turn !== v || !S.drew || S.pending) return flash(S.turn !== v ? "Wait for your turn to play cards." : !S.drew ? `Draw your ${N.drawFor(S)} cards first.` : "Finish the current move first.");
        if (N.isIng(id)) return flash("Ingredients are used when you make a Nasi Lemak or trade.");
        ui.sel = ui.sel === id ? null : id; ui.step = {}; return render();
      }
      case "unsel": ui.sel = null; ui.step = {}; return render();
      case "step": ui.step.slot = num("slot"); return render();
      case "pause": return call("vote", { kind: "pause", yes: true });
      case "draw": return act({ t: "draw" });
      case "end": if (P && P.hand.length > N.HAND) { ui.dump = []; ui.sel = null; ui.trade = null; return render(); } return act({ t: "end" });
      case "dumpgo": return act({ t: "end", discard: ui.dump });
      case "dumpclose": ui.dump = null; return render();
      case "make": {
        const by = ingsOf(P), mk = num("mk"), rh = num("rh");
        // spend the ingredients you hold most of
        const need = (mk != null ? 3 : 5) - (rh != null ? 1 : 0);
        const pickTypes = Object.keys(by).sort((x, y) => by[y].length - by[x].length).slice(0, need);
        return act({ t: "make", makcik: mk, rahsia: rh, cards: pickTypes.map(t => by[t][0]) });
      }
      case "play": return act({ t: "play", card: ui.sel, ing: d.ing, p: num("p"), slot: num("slot"), to: num("to") });
      case "tradeopen": ui.trade = { give: [], want: {} }; ui.sel = null; return render();
      case "tradeclose": ui.trade = null; return render();
      case "want": { const t = d.t, w = ui.trade.want; w[t] = Math.max(0, Math.min(10, (w[t] || 0) + +d.d)); return render(); }
      case "tradesend": { const tr = ui.trade; return act({ t: "trade", give: tr.give, want: Object.entries(tr.want).filter(([, x]) => x > 0).map(([t, x]) => ({ t, n: x })) }); }
      case "cancel": return act({ t: "cancel" });
      case "bid": return act({ t: "bid", cards: ui.bid || [] });
      case "bidclear": ui.bid = []; return act({ t: "bid", cards: [] });
      case "bidfill": { const f = fillFor(P, S.pending.want); if (f) ui.bid = f; return render(); }
      case "accept": return act({ t: "accept", p: num("p") });
      case "pick": { const id = +d.id, need = Math.min(2, (S.pending && S.pending.hand || []).length); const k = ui.take.indexOf(id);
        if (k >= 0) ui.take.splice(k, 1); else if (ui.take.length < need) ui.take.push(id); return render(); }
      case "take": return act({ t: "take", cards: ui.take });
    }
  });

  window.NasiUI = { render, mastHTML, rulesHTML, cardHTML, reset, syncStyle, lobbyHTML };
})();
