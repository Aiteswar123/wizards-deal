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
- **Top bar** (`.board`): your house banner, the wordmark, the table code, Leave, and a "Latest" commentary line.
- **The table** (`.table`): a round, lacquered oak table. The rim uses a real wood-grain texture (stretched fractal noise) with lacquer highlights, and has 36 brass studs with their own highlights plus a metallic gold inlay. Its cloth (`--felt`) is in your house colour with a fine noise texture, and a ring in the four house colours sits around the piles. When it becomes your move, a glint sweeps across once (`.flash`). On phones it is slightly taller than wide (and taller still with five players).
- **Seats around the table**: every player sits on a name plate on the rim (`plateHTML`). Each plate shows their shield, name, character, three set pips that light as sets complete, cards in hand and Galleons banked, plus an "On turn" or "Responding" tag. You sit at the bottom. On wide screens everyone sits evenly round the circle (`seatAngle`, `seatAt`). On phones (≤760px) opponents fill the top half so their cards clear the piles, and with five players the other players' cards become compact chips.
- **Played cards on the table** (`playedHTML`): in front of each plate, that player's items lie on the cloth as small foil cards stacked by colour, with "2/3" counts and a check on complete sets. Hovering a stack lists the item names. Full detail sits in the side panel.
- **Players' cards side panel** (`.side`): every other player's cards in full (shield, hand and set counts, every set with item names and charge, bank). A "Players' cards" button in the top bar and a Hide button show and hide it. It sits beside the table from 1000px and slides in from the right as a drawer on phones (tap outside or press Escape to close). It starts open on wide screens and closed on phones, and remembers your choice on the device (`wd-side`).
- **Sets at one fixed scale**: every set shows fixed-width slots (`.slots`) on a shared baseline, so progress compares across players at a glance.
- **Stamps** (`.stamp`): blocked spells and chosen cards are stamped, never silently removed ("Protego", "Blocked", "Chosen", "Full time").
- **Quidditch night sky** (`sky.js`): a canvas behind every screen showing a Quidditch match at night, drawn to look real rather than cartoon. It has:
  - a deep starfield with a range of brightness and colour, plus a few scintillating bright stars
  - the Milky Way with a dust lane
  - a moon with shading and soft craters
  - moonlit cloud and the odd shooting star
  - a stadium in silhouette with shaded hanging house banners, lit box seats, floodlight masts whose beams sweep slowly through the haze, and metal goal hoops catching the light
  - riders on broomsticks as backlit silhouettes with motion blur (far ones behind the stadium, near ones in front)
  - the Golden Snitch, a polished gold sphere with blurred wings

  The static layers are painted once per size or house change; only the moving parts are drawn each frame. The sky takes its light from `--board`, `--stand` and `--crest`. It runs at about 30fps, stops while the tab is hidden, and holds a single still frame when reduced motion is on.
- **Collector's cards**: every card has a gold-foil frame (`--foil`) and an art window with a drawn emblem. Each item set has its own emblem (tankard, orb, potion, Snitch, Sorting Hat, Time-Turner, locket, wand, train, Hallows), and each spell has one too. Wilds use a star, Galleons a coin. Icons use a 24px grid and a 1.6 stroke. Hand cards tilt in 3D toward the pointer (`--rx`, `--ry`), and a foil shine follows it (`--mx`, `--my`); spells and the any-colour wild get a holographic shine.
- **Card back**: the draw pile is a foil-framed back lit in your house colour, with a blackletter W and the count in a pill.
- **Home showcase**: a fan of three real cards (Elder Wand, Stupefy, 10 Galleons) floats beside the title and tilts toward the pointer.
- **House shields** (`shield(ch)`): an inline SVG shield in the house field colour with a metal band and the character's initial. Used wherever a player is named.
- **House banner** (`.houseband`): the first thing on your screen in a game, a full-width band in your house colour with your shield, the house name, your character and the house trait.
- **House bar**: your own seat opens with "House Gryffindor" and the house trait.
- **Floating candles**: the home screen has Great Hall candles that bob and flicker (authored SVG, `CANDLES`).
- **Spell cut-in**: the burst and the scarf use the caster's house colours, and the sorting reveal names your house.

## Layout

- One column at every width: top bar, the table with everyone around it, then the action panel and your hand, your seat in detail, table talk, and how to play. With the side panel open on a wide screen, the table, panel and seat share the left column and the side panel takes a sticky right column.
- On phones the table turns into a tall oval, with opponents along the top and sides. From 1000px the action panel and the hand sit side by side, and the hand wraps instead of scrolling.
- 16px side gutter; the scoreboard bleeds to the edges.

## Shape and depth

Corners are 4px for controls, 6–8px for panels and cards, and capsule-shaped for the pitch. Depth comes from soft offset shadows (`0 18px 30px -18px`). The only glows are real light sources: scoreboard bulbs, candles and stars.

## Motion

Exponential ease-out (`--ease`): floodlight sweep, bulb light-up, card lift, toast rise, and the spell cut-in ("replay on the big screen"). Reduced motion turns all of it off.
