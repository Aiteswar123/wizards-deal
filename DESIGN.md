# Design: the Great Hall, in house colours

High-end rather than casino: matte surfaces, stone and candlelight, aged-pewter card edges, no light-bulb glows. Type is Grenze Gotisch for display and Alegreya Sans / Alegreya Sans SC for everything else.

Every game is a match, played in your house colours. A bulb-lit stadium scoreboard races everyone to three sets across the top, the shared table is a floodlit Quidditch pitch, and your hand sits at the thumb. All tokens live as CSS custom properties on `:root` in `index.html`.

## Colour: your house paints your screen

Each player's screen takes the colours of their own character's Hogwarts house. `render()` sets `data-house` on `<html>` (`HOUSE` maps Harry, Hermione, Ron, Lupin and Hagrid to Gryffindor, Draco and Umbridge to Slytherin, Luna, Cho and Myrtle to Ravenclaw, Cedric and Peeves to Hufflepuff). Before the sorting (home, lobby, spectators) the screen is the Great Hall at night (`hogwarts`). The main tokens are registered with `@property`, so when the sorting reveal lands the page fades into the house colours.

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
- **The table** (`.table`, `tableGeom`, `tableSVG`): its shape follows the player count: two at a long table, three at a triangle, four at a square, five at a pentagon, and so on up to a twelve-sided table. From six players the table grows (`.table.many`), the seats become compact (shield, name, set pips) and the other players' cards become small chips. It is drawn as SVG with rounded corners: carved grey stone with mottling and a soft top light, a carved groove, softly glowing runes along every edge (`RUNES`, neutral letter forms only), and a slate top warmed by your house colour (`--felt`), with an inner shadow and a faint ring in the four house colours around the piles. When it becomes your move, a glint sweeps across the cloth once (`.flash`). Wide and narrow (≤760px) screens each get their own geometry. On phones the shape is stretched upright to use the height, and the triangle grows larger on desktop.
- **Seats around the table**: every player sits at the middle of their own side on a name plate (`plateHTML`). Each plate shows their shield, name, character, three set pips that light as sets complete, cards in hand and Galleons banked, plus an "On turn" or "Responding" tag. You always take the bottom side and the others follow clockwise. On phones, left and right seats of a square or pentagon move their plate up to the corner of their side, and a triangle's slanted seats move theirs down to the base corners, so their cards stay visible.
- **Played cards on the table** (`playedHTML`): that player's items lie on the cloth along their own edge, turned to follow it, as small foil cards stacked by colour, with "2/3" counts and a check on complete sets. Hovering a stack lists the item names. Full detail sits in the side panel.
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
- **Turn clock** (`.tclock`, `data-clock`): a countdown at the top of the table's centre, with a bar draining in the live colour, plus the time on the active player's plate ("On turn · 2:41"). While a spell waits for answers it switches to "Time to answer" in the warning colour, and the panel says "Answer within 0:24". The last 30 seconds of a turn and the last 10 of an answer blink red. It updates four times a second from server timestamps (`clockOffset`) without re-rendering.
- **Spell duel cut-in** (`cutin.js`): every cast plays as a duel on every screen. The caster stands on the left and the target on the right, mirrored to face them. The spell leaves the caster's wand as a bolt in its own colour, aimed from the measured wand tip to the target's chest; the target recoils with an impact flash, and the text reads "Luna Lovegood casts / Stupefy! / on Harry Potter". Spells on everyone split the bolt across up to five opponents (+N for more). Protego raises the blocker's shield and deflects the bolt. Self spells (Geminio, Reparo) light the caster alone.
- **Game feel**: a "Your turn" banner sweeps in when your move begins. Buttons and options have a raised edge and press down when tapped. Cards that land on the table pop in. The plate of the player on turn has a pulsing ring of light.
- **In-game motion** (`fxAfterRender`): after each new game state the page compares it with the last one and animates the change. Dealt cards fly from the draw pile into your hand, flipping over. Cards you play fly to the table, bank or discard. Other players' new items fly from their seat. Galleons fly from payer to payee with a "+N Galleons" label. Completed sets burst with sparkles and "Set complete!". The player now on turn pops, the panel slides in with its options staggered, and a win sets off fireworks in the winner's house colours. Everything is skipped when reduced motion is on.
- **Hall of Fame** (`.ranks`): on the home page, every player ranked by total EXP, with medals for the top three, a level and a gold progress bar to the next level, plus EXP, wins, games and win rate. Your own row is highlighted. At full time the winner panel lists each player's place, EXP earned, level and any "Level up!" (`.awards`).
- **Wizarding-world details** (inspired by the films' graphic design and Harry Potter web experiments):
  - **Engraved corners:** gilt corner flourishes on the panels.
  - **Daily Prophet:** the latest move printed as a newsprint headline that slides in.
  - **Hogwarts letter:** the lobby code on a parchment envelope with green-ink lettering and a wax seal, unfolding once when the lobby opens.
  - **Marauder's Map footsteps:** ink footprints walk from one seat to the next when the turn passes.
  - **Lumos:** a soft wand-light trail behind the mouse on desktop.
- **House-points hourglass** (`hourglass()`): the turn clock is a Great Hall hourglass. Gems in the current player's house colour drain from the top bulb to the bottom as time runs out, a stream of gems falls through the neck, and it turns to the warning colour while a spell waits for answers.
- **Owl post** (`sky.js`): owls (snowy, tawny, barn) cross the enchanted ceiling carrying sealed letters, replacing broom riders.
- **Parchment cards and spellbook panel**: cards have a parchment face with an engraved double inner rule and names in the gothic wizarding face. The action panel is a dark leather spellbook page with a gilt double rule, a grain texture and an illuminated first letter on its heading.
- **House common rooms** (`drawAtmos` in `sky.js`): once you are sorted, the ceiling takes on your common room, crossfading with the house:
  - **Gryffindor tower:** firelight from below and rising embers (fire).
  - **Slytherin dungeon under the lake:** green water-light rippling in bands, and bubbles (water).
  - **Ravenclaw tower's star-painted dome:** constellations that draw themselves segment by segment (air).
  - **Hufflepuff's cellar:** golden light shafts from the round windows, and drifting seeds (earth).
- **House animals** (`EMBLEM`, `emblem()`): the lion, serpent, eagle and badger as single-colour emblems. Your house's animal rides in the house banner and breathes faintly as a watermark on the table cloth.
- **Real textures** (`assets/`, all CC0, listed in `assets/CREDITS.md`):
  - **Stone** (Poly Haven, castle_wall_slates) on the table rim under the runes.
  - **Wood** (Poly Haven, medieval_wood) on the home and Hall of Fame panels, like the Great Hall's long tables.
  - **Leather** (Poly Haven, brown_leather) on the spellbook panel.
  - **Parchment** (ambientCG, Paper005) on the cards, the Daily Prophet line and the Hogwarts letter.
- **Optional crests**: a `crest-<house>.png` placed in `assets/` (only with the rights to use it) replaces the drawn shield and emblem for that house.
- **A painted place behind each screen** (`paintCastle`, `paintHall`, `paintCommon` in `sky.js`): each scene is painted once per size, cached, and crossfaded when the screen or house changes. Windows and ceilings are cut out so the night sky shows through.
  - **Home: Hogwarts across the Black Lake.** The castle on its cliff with lit windows that twinkle, mountains behind, its reflection broken by ripples, the moon's path on the water, Forbidden Forest pines, and Hagrid's hut with smoke from its chimney.
  - **Lobby: the Great Hall.** Stone walls, Gothic windows with leaded glass and moonlight on the floor, house banners on a gilt beam, flickering wall torches, floating candles, the four long tables, and a ceiling that dissolves into the night sky.
  - **Game: your common room.**
    - Gryffindor: scarlet tapestries, tower windows and a roaring fireplace with armchairs.
    - Slytherin: dungeon arches, windows looking out under the lake, green lamps and leather sofas.
    - Ravenclaw: a bronze-ribbed dome painted with twinkling stars, arched windows with blue silk drapes, and bookshelves.
    - Hufflepuff: wood panelling, round windows at grass level, a round door, trailing plants and copper lamps.
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

## Sound

`sfx.js` makes every sound live with the Web Audio API, so there are no sound files and nothing to license. Sounds pass through a soft stone-hall reverb and a limiter, and are tuned to D major pentatonic so overlapping sounds stay in key.

- **Taps**: a light wooden click on buttons; a paper flick when you pick up a card.
- **Cards**: quick flicks as cards are dealt into your hand; a paper slap and soft thud when an item is laid (quieter when another player lays one).
- **Galleons**: bright metal clinks when you bank or anyone pays, one clink per Galleon up to eight.
- **Moments**: a rising peal of bells on a complete set, two castle-bell chimes on "Your turn", one quiet note when another player's turn starts, a shimmering glissando at the sorting, a soft owl hoot when someone joins the lobby, and a bell fanfare at the win (bigger for the winner).
- **Spoken spells**: the caster calls the spell aloud ("Stupefy!", "Wingardium Leviosa!") from recorded clips in `assets/voice`: a male and a female British voice generated with Piper neural speech, phonetically steered to the film pronunciations. Female clips play for Hermione, Luna, Cho, Myrtle and Umbridge, male for the rest. Playback speed sets the character (lower and slower for Hagrid and Lupin, higher and quicker for Peeves, Myrtle and Umbridge), with a touch of random variation each time. Each call is shaped like a shout in a stone hall: warmed, compressed, doubled with a short slapback, and sent into the reverb. The browser's speech voice stands in only if a clip hasn't loaded. Under the voice, a soft reversed-cymbal swell and rising drone build into a deep boom and a brass-like stab, minor for curses and major for helpful charms (Protego, Wingardium, Accio, Alohomora, Geminio, Reparo). The music dips while the spell plays.
- **Spells**: a whoosh from the wand, then a sound for each spell (Stupefy zaps, Petrificus crackles like ice, Protego hums as a shield, Obliviate slides away, Levicorpus and Wingardium rise, Accio pulls, Confundo wobbles, Alohomora unlocks, Geminio doubles, Reparo rebuilds), plus a hit on the targets. Each plays with its cut-in.
- **Clock**: a soft tick through the last ten seconds when the running clock is yours, sharper in the last five.

**Music**: an original waltz in E minor, generated as it plays so it never loops. Soft strings hold each bar's chord, a low bass marks the downbeat, a harp glissando opens each 8-bar phrase, and a celesta improvises a line that steps through E harmonic minor and lands on chord tones on the strong beats. It plays fullest on home, a little softer in the lobby, and quieter and sparser during a game. It dips under spells, sets, the sorting and the win so those read clearly. It has its own bus and reverb.

Two buttons (top bar in a game, top right on home and lobby) switch music (note icon) and sound effects (speaker icon) on and off independently. Each setting is remembered per device (`wd-music`, `wd-sound`). Audio starts after the first tap, as browsers require, and stays silent while the tab is hidden. Sounds still play with reduced motion.


## Grand Line UNO

A pirate theme of its own, entirely original artwork (no official One Piece art or logos). When a UNO table or the UNO home page is showing, `<html data-game="uno">` swaps the tokens to a sea palette (deep navy `--stand #0a2236`, gold `--crest #f2c14e`, straw-hat red `--band #c8281e`, live yellow `--live #ffd23f`) and the display face to **Pirata One**.

- **Scene** (`sky.js`, `paintSea`): the Grand Line at sunset: violet-to-amber sky, low sun with glitter on the water, lit streaky clouds, a palm island, and a three-masted ship with a straw-hat skull on its sail sailing slowly across, bobbing and rolling. Gulls drift by. The Hogwarts riders, Snitch and candles are hidden at sea.
- **Cards: Marine WANTED posters.** Each card is a poster on aged parchment (`assets/parchment.jpg`, darkened at the edges, with a thin printed rule) pasted onto a board in the card's colour (Red `#c92a24`, Yellow `#e8a812`, Green `#25884a`, Blue `#1b5fc0`; Wilds on a four-colour board). The poster reads, top to bottom: **WANTED** (Rye), a "photo" box in the card's colour with halftone print dots holding the numeral (Alfa Slab One, cream with an ink outline) or an illustration, **DEAD OR ALIVE**, the name (the sea for number cards, such as EAST BLUE; the item for action cards; it shrinks to fit), the bounty in Berries (points × 10,000,000, with the posters' trailing dash, and a drawn Berry sign), and MARINE at the foot. A wax-seal pip in the card's colour sits on the photo's top-left corner with the value or a small mark, so a fanned hand stays readable. Number cards carry a crew portrait in the photo box (`uno-crew.js`), one crew member per number: 0 Monkey D. Luffy, 1 Roronoa Zoro, 2 Nami, 3 Usopp, 4 Sanji, 5 Tony Tony Chopper, 6 Nico Robin, 7 Franky, 8 Brook, 9 Jinbe. They are original chibi-style fan drawings built from signature traits (straw hat and scar, three swords and earrings, curly brow and cigarette, pink hat and blue nose, afro and top hat, tusks), not copies of official art. The numeral sits large in the photo's lower right, and the poster names the pirate. Action cards are One Piece items, all original drawings: **Seastone Cuffs** (Skip), **Log Pose** (Reverse), **Den Den Mushi** (Draw 2, backup called in), **Devil Fruit** (Wild, swirl-patterned) and **Conqueror's Haki** (Wild Draw 4, a black-and-red crackle). Shared SVG gradients live once in a zero-size SVG. The back is a black Jolly Roger flag (straw-hat skull) inside a rope border, lettered GRAND LINE / UNO. The rules list shows tiny cards with only the photo.
- **Table**: an oval ship's deck (wood texture, brass rim). Players sit around it clockwise, you at the bottom, each with a Jolly Roger flag in their own colour, their card count as a fan of backs, an "UNO!" tag at one card, and a Catch! button when they forgot to call. The draw pile and discard sit in the middle, with a glowing compass ring in the current colour, slowly turning direction arrows (reversed by Log Pose), and a pulsing +N badge while a stack builds.
- **Your side**: the turn call and help line, action buttons (Draw, Take N, Play it / Keep it, UNO!, Catch), the one-minute clock, and your hand sorted by colour. On your turn, playable cards lift with a live-colour ring and the rest dim. Wilds open a colour chooser on parchment.
- **Motion and sound**: played cards fly from the player to the pile and land with a flash; action cards get a cut-in banner, sparks and a dramatic sting; draws fly from the deck; "Your turn", "UNO!" and "Caught!" banners; fireworks and a WANTED poster with everyone's EXP when the voyage ends. At sea the music becomes an original 6/8 shanty in D dorian (fiddle, squeezebox, plucked bass, a wave at each verse).
