# Design: Quidditch Matchday, in house colours

Every game is a match, played in your house colours. A bulb-lit stadium scoreboard races everyone to three sets across the top, the shared table is a floodlit Quidditch pitch, and your hand sits at the thumb. All tokens live as CSS custom properties on `:root` in `index.html`.

## Colour: your house paints your screen

Each player's screen takes the colours of their own character's Hogwarts house. `render()` sets `data-house` on `<html>` (`HOUSE` maps Harry and Hermione to Gryffindor, Draco to Slytherin, Luna to Ravenclaw, Cedric to Hufflepuff). Before the sorting (home, lobby, spectators) the screen is the Great Hall at night (`hogwarts`). The main tokens are registered with `@property`, so when the sorting reveal lands the page fades into the house colours.

| Token | Great Hall | Gryffindor | Slytherin | Ravenclaw | Hufflepuff | Job |
| --- | --- | --- | --- | --- | --- | --- |
| `--stand` | `#17132b` | `#3d0a12` | `#04301f` | `#0b2266` | `#1f1a08` | Page ground |
| `--stand-2` | `#201a3a` | `#520e19` | `#08402a` | `#102d80` | `#2c250b` | Seats, panels |
| `--board` | `#0b0916` | `#22050a` | `#011c12` | `#061545` | `#110e03` | Scoreboard, action panel |
| `--live` | `#ffb23e` | `#ffc94a` | `#6ff0ad` | `#ffab6b` | `#ffd43f` | **Reserved for the live move**: turn call, turn light, selected card, live panel, play lights |
| `--crest` | `#d8b25a` | `#f0c040` | `#d3d9df` | `#d9944f` | `#f2c230` | House metal: wordmark, house name, winner, torchlight glow |
| `--band` / `--band-ink` | none | `#a3121c` / `#f6cf55` | `#1a5c37` / `#e2e7ec` | `#1f3f9e` / `#eaa866` | `#ecb939` / `#1a1400` | House banner across the top of your screen |
| `--muted` / `--dim` | `#b5acd6` / `#8d84b6` | `#f0c4c0` / `#d29d98` | `#b3dccb` / `#8cbfaa` | `#c3d0f5` / `#9fb2e6` | `#e4d6a2` / `#bfae74` | Secondary text, tinted to the house |

Every house also sets `--stand-3`, `--line`, `--line-2`, `--board-2` and `--bulb-off`. These stay the same in every house:

| Token | Value | Job |
| --- | --- | --- |
| `--pitch` / `--pitch-2` | `#2e7d46` / `#286e3d` | The pitch (mown stripes) |
| `--chalk` | `#f4f1e8` | Text, chalk lines, primary buttons, lit bulbs |
| `--galleon` / `--galleon-ink` | `#e2b23a` / `#2b1d00` | Gold Galleon coins and point-card numerals |
| `--card` / `--card-ink` | `#f6f3ea` / `#141a27` | Playing cards and item chips |
| `--spell` / `--spell-face` | `#8e6ad8` / `#efe9fb` | Spell cards, banked spells |
| `--ok` / `--warn` / `--bad` | `#6fd49a` / `#ff9f5e` / `#ff6b6b` | Complete set, responding/frozen, errors and stamps |

House kit colours (`HOUSES`) for jersey stripes and shields: Gryffindor `#c8282e` / `#eeba30`, Slytherin `#2a9d5c` / `#c0c7cf`, Ravenclaw `#3a64c8` / `#c48a4b`, Hufflepuff `#ecb939` / `#3b3226`. Item-set colours come from `engine.js` and always appear with the set's name.

## Type

- **Grenze Gotisch** 700 (`--magic`): the wizarding voice, used for the wordmark, section headings, the turn call, panel headings, the house name, the winner and the spell call. Mixed case, never uppercase.
- **Big Shoulders Display** 700–900 (`--display`): scoreboard, numerals, card values, Galleons.
- **Barlow Condensed** 500–700 (`--label`): labels, buttons, set names, stats. Uppercase, tracked 0.05–0.14em.
- **Barlow** 400–700 (`--body`): running text, options, log.
- Numerals are tabular everywhere they count.

## Signature elements

- **Bulb numerals**: `bulbs(n)` draws a digit cell by cell on a 3×5 bulb grid. Lit bulbs are chalk, or the house live colour for the player on turn. When a player's set count rises, the bulbs light in sequence (`.col.rise`).
- **Scoreboard** (`.board`): one column per player in seat order, with a jersey stripe, name, character, bulb set count, hand count, an "On turn" or "Responding" light, and a "Latest" commentary line.
- **Pitch** (`.pitch`): a capsule of mown stripes with a chalk outline, centre line and circle, and three hoops at each end. When it becomes your move, a floodlight sweeps across once (`.flash`).
- **Sets at one fixed scale**: every set shows fixed-width slots (`.slots`) on a shared baseline, so progress compares across players at a glance.
- **Stamps** (`.stamp`): blocked spells and chosen cards are stamped, never silently removed ("Protego", "Blocked", "Chosen", "Full time").
- **House shields** (`shield(ch)`): an inline SVG shield in the house field colour with a metal band and the character's initial. Used wherever a player is named.
- **House banner** (`.houseband`): the first thing on your screen in a game, a full-width band in your house colour with your shield, the house name, your character and the house trait.
- **House bar**: your own seat opens with "House Gryffindor" and the house trait.
- **Floating candles**: the home screen has Great Hall candles that bob and flicker (authored SVG, `CANDLES`).
- **Spell cut-in**: the burst and the scarf use the caster's house colours, and the sorting reveal names your house.

## Layout

- Phone first, one column in order: scoreboard, pitch, action panel, hand (horizontal scroll with snap), your seat, other players, table talk, how to play.
- From 1000px: two columns, with the pitch, panel, hand and your seat on the left and the other players on the right. The hand wraps instead of scrolling.
- 16px side gutter; the scoreboard bleeds to the edges.

## Shape and depth

Corners are 4px for controls, 6–8px for panels and cards, and capsule-shaped for the pitch. Depth comes from soft offset shadows (`0 18px 30px -18px`). There are no glows, except the bulbs' own radial fill.

## Motion

Exponential ease-out (`--ease`): floodlight sweep, bulb light-up, card lift, toast rise, and the spell cut-in ("replay on the big screen"). Reduced motion turns all of it off.
