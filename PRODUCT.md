# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Groups of 2 to 12 friends playing Monopoly Deal: Harry Potter edition together. They play equally often in the same room (each on their own phone, talking out loud) and apart (usually on laptops with a voice or video call running). Each player sees one shared table plus their own private hand.

## Product Purpose

An online table for the card game: one player creates a table, shares a 4-letter code, friends join from their own devices, and the server runs every move through the rules engine. Success is a game that feels like sitting around a real card table: everyone can read the state of the table at a glance, knows whose move it is, and can play their turn without hunting for controls.

## Positioning

Each player holds a real private hand on their own device while the table (items, banks, discard, turn state) is shared and authoritative; other players' hands never reach the browser. Characters are dealt at random with their own powers, and spells play out as moments every player sees.

## Operating Context

- Phone first: the phone screen is the primary table; desktop is a roomier version of it.
- Sessions are social and long-ish (a game takes many turns); players glance away and back, often while talking.
- Polling every ~1.2s keeps every device in sync; reconnects happen.
- `?as=name` gives a separate identity per tab for local testing.

## Capabilities and Constraints

- Static `index.html` + `engine.js` + `cutin.js` + `sky.js` + `sfx.js` (synthesised sound effects and generative music, each toggled per device), served by `dev.js` locally and a Vercel function (`api/game.js`) with Upstash Redis in production. No build step, no framework.
- Views: home (name, create/join, open tables, how to play), lobby (code, seats, start), game (opponents around the table, draw/discard piles, your character/table/bank, action panel, hand, table talk log, winner).
- 10 item colours with fixed hexes in `engine.js`; 12 spells; points are Galleons.
- 2 to 12 players. The deck grows with the table: one 106-card deck for up to 5 players, two for 6 to 10, three for 11 or 12 (`decksFor`).
- 12 characters, each in a house. The original five: Harry, Hermione, Draco, Luna and Cedric. The seven added, with powers specified by the owner: Remus Lupin (skip drawing for 5 plays), Rubeus Hagrid (copy another power each turn, 3-turn cooldown per power, not Cho), Dolores Umbridge (anyone with more complete sets than her plays at most 2 cards a turn), Cho Chang (Catch the Snitch twice per game: undo a winning third set by sending its card back to hand), Ron Weasley (draws 1 from the pile plus 1 at random from a chosen opponent's hand), Peeves (once a turn, blind-swap a random card with an opponent; uses no play), Moaning Myrtle (may draw 3, keep 2, return the third to the deck). Peeves has no house in the books and plays in Hufflepuff colours. A frozen character loses its power.
- Rules and game flow change only on request. Added rules so far: Harry never has to pay with his protected colour. Each turn has 3 minutes; when it runs out the turn ends (drawing first if needed, discarding at random down to 7). A spell that needs answers pauses the turn clock and gives the players asked one shared 30-second window. If someone doesn't answer, a payment is made automatically (bank notes first, then items outside complete sets, then complete sets, random within each, never Harry's protected colour), other spells go through, and a blocked caster lets it go. The server enforces the clock on every poll.

- Ranking: every finished game gives every player EXP (winner 100; 2nd 60; 3rd 45; others 30; +10 per complete set; +3 per spell cast up to 15; +1 per Galleon in the bank at the end, up to 25). Places after the winner go by complete sets, then table value. Levels: Level 2 at 100 EXP, each level needing 50 more than the last. One shared Hall of Fame (`wd:ranking`) keyed by player name, ignoring capitals and extra spaces; each game is recorded once (`recorded`). Unfinished games give nothing.
- Overall ranking: a third view on the home page ("Overall", next to the chosen game's list, remembered per device as `wd-rank`) adds each player's Wizard's Deal and Grand Line UNO records together by name: EXP, games and wins summed, level from the combined EXP, with each game's EXP shown under the name. Served by `GET ?ranking=1&kind=all`; each game's own list is unchanged.

- Grand Line UNO (`uno.js`, `uno-ui.js`): a second game, with cards drawn as Marine WANTED posters and action cards named for One Piece items (Seastone Cuffs, Log Pose, Message Gull, Devil Fruit, Conqueror's Haki); the number cards show the crew of the Sunwake, an original crew, crew photos let each player share their own photo with the table (seat, a claimed number card, the winner's poster), Card art lets each player put their own pictures on number cards (kept in their own browser only), and the Ship's Radio plays players' own songs or the official soundtrack through Spotify's player on the same site, chosen with the picker at the top of the home page (remembered per device, `wd-game`). Tables carry `kind: "uno"`; the server picks the rules engine per table. Rules: match colour or symbol; Wilds choose the colour; when you can't (or won't) play, draw until a card fits and play it (a Wild in hand may be played instead of drawing); stacking lets a Draw 2 or a Wild Draw 4, in any colour, answer either one; whoever doesn't stack draws the whole pile and loses the turn. Nobody goes out on a power card: a last card that is a Skip, Reverse, Draw 2 or Wild can't be played (draw until a card fits instead), and cards played together can't empty a hand with power cards. Calling UNO: press it before playing your second-to-last card, or call late; anyone can Catch a player who forgot until the next move, for +2. One minute per turn (on timeout: take the stack, or draw until a card fits and it is played for you, a Wild taking the colour held most). One deck for up to 6, two for 7 to 10, three for 11 or 12. Its own leaderboard (`wd:uno:ranking`, "Most Wanted"): winner 100 + 1 per 10 points left in other hands (up to 50); others by fewest points left: 60 / 45 / 30; everyone +2 per card played (up to 20).
- Hitman (`hitman.js`, `hitman-ui.js`): a fourth game, after the Roblox "Hitman Card Game" by Hitman Studio (itself inspired by Exploding Kittens). Take turns drawing; draw a Hitman and you're out unless you play an Angel, which also lets you put the Hitman back anywhere in the deck. The deck always holds one Hitman fewer than the players alive. Everyone starts with an Angel and 5 cards. Cards: Angel, Attack (stacks 2, 4, 6...), Bottom, Cancel, Chain (locks the card for 3 turns), Future (top 3), Inferno (cancels and burns every copy back into the deck), Mirror (copies the last card; after an Angel it can save you), Redirect, Reverse, Shuffle, Skip, Steal (the victim picks the card) and Super Attack (4+ players). After each card everyone gets a 3.5-second window to answer with Quick Play cards (Cancel, Inferno, Chain, Redirect, Shuffle); Cancel and Inferno stop the card under them, so they can stop each other. 20 seconds a draw (then you draw), 12 seconds to save yourself or hand over a stolen card. Card counts per deck are our own (the game doesn't publish them); a second deck joins at 6 players. Its own ranking, "The Agency" (`wd:hitman:ranking`): survivor 100, then 60 / 45 / 30 by how long you lasted, +8 per Hitman survived (up to 24), +1 per card played (up to 15).

## Brand Commitments

- Harry Potter flavour stays: spell names, the five characters, Galleons, and the spell cut-in moment.
- Name "Wizard's Deal" (not marked binding by the user, but kept unless they rename it).
- Fan-made and unofficial; not affiliated with Hasbro or Warner Bros. The disclaimer stays.

## Evidence on Hand

No artwork, logos or photography exist; the cut-in characters are authored SVG in `cutin.js`. No player counts, reviews or press. Do not invent any.

## Product Principles

1. The table state is readable at a glance from across a sofa: whose turn, what everyone holds, how close anyone is to winning.
2. Your move is unmissable; everyone else's move is visible but quiet.
3. Spells are events: the moment someone casts, everyone should feel it.
4. Phone thumbs first: every action reachable without precision tapping.

## Accessibility & Inclusion

Colour is never the only carrier of meaning for item sets (names accompany swatches). Respect reduced motion. Readable on small phones.
