# Design: Quidditch Matchday

Every game is a match. A bulb-lit stadium scoreboard races everyone to three sets across the top, the shared table is a floodlit Quidditch pitch, and your hand sits at the thumb. All tokens live as CSS custom properties on `:root` in `index.html`.

## Colour

| Token | Value | Job |
| --- | --- | --- |
| `--stand` | `#14213f` | Page ground (the stands) |
| `--stand-2` / `--stand-3` | `#1a2a50` / `#22366a` | Seats, panels, default buttons |
| `--line` / `--line-2` | `#2c4078` / `#3a5296` | Borders, scrollbars |
| `--board` / `--board-2` | `#0b0f17` / `#141a27` | Scoreboard, action panel, set tiles, inputs |
| `--bulb-off` | `#222a3b` | Unlit scoreboard bulbs and pips |
| `--pitch` / `--pitch-2` | `#2e7d46` / `#286e3d` | The pitch (mown stripes) |
| `--chalk` | `#f4f1e8` | Text, chalk lines, primary buttons, lit bulbs |
| `--amber` | `#ffb23e` | **Reserved for the live move**: your turn call, turn light, selected card, live panel, play lights. Never decoration. |
| `--card` / `--card-ink` | `#f6f3ea` / `#141a27` | Playing cards and item chips |
| `--spell` / `--spell-face` | `#8e6ad8` / `#efe9fb` | Spell cards, banked spells |
| `--ok` / `--warn` / `--bad` | `#6fd49a` / `#ff9f5e` / `#ff6b6b` | Complete set, responding/frozen, errors and stamps |

Item-set colours come from `engine.js` (`COLORS[*].hex`) and always appear with the set's name. Character jersey colours: Harry `#d65a5a`, Hermione `#d9a441`, Draco `#4fa36b`, Luna `#6f95e0`, Cedric `#e6c74a` (`CHAR_HEX`).

## Type

- **Big Shoulders Display** 700–900 (`--display`): headings, scoreboard, turn call, numerals, card values, Galleons. Uppercase for headings.
- **Barlow Condensed** 500–700 (`--label`): labels, buttons, set names, stats. Uppercase, tracked 0.05–0.14em.
- **Barlow** 400–700 (`--body`): running text, options, log.
- Numerals are tabular everywhere they count.

## Signature elements

- **Bulb numerals**: `bulbs(n)` draws a digit cell by cell on a 3×5 bulb grid. Lit bulbs are chalk, or amber for the player on turn. When a player's set count rises, the bulbs light in sequence (`.col.rise`).
- **Scoreboard** (`.board`): one column per player in seat order, with a jersey stripe, name, character, bulb set count, hand count, an "On turn" or "Responding" light, and a "Latest" commentary line.
- **Pitch** (`.pitch`): a capsule of mown stripes with a chalk outline, centre line and circle, and three hoops at each end. When it becomes your move, a floodlight sweeps across once (`.flash`).
- **Sets at one fixed scale**: every set shows fixed-width slots (`.slots`) on a shared baseline, so progress compares across players at a glance.
- **Stamps** (`.stamp`): blocked spells and chosen cards are stamped, never silently removed ("Protego", "Blocked", "Chosen", "Full time").

## Layout

- Phone first, one column in order: scoreboard, pitch, action panel, hand (horizontal scroll with snap), your seat, other players, table talk, how to play.
- From 1000px: two columns, with the pitch, panel, hand and your seat on the left and the other players on the right. The hand wraps instead of scrolling.
- 16px side gutter; the scoreboard bleeds to the edges.

## Shape and depth

Corners are 4px for controls, 6–8px for panels and cards, and capsule-shaped for the pitch. Depth comes from soft offset shadows (`0 18px 30px -18px`). There are no glows, except the bulbs' own radial fill.

## Motion

Exponential ease-out (`--ease`): floodlight sweep, bulb light-up, card lift, toast rise, and the spell cut-in ("replay on the big screen"). Reduced motion turns all of it off.
