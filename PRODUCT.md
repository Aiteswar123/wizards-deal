# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Groups of 2 to 5 friends playing Monopoly Deal: Harry Potter edition together. They play equally often in the same room (each on their own phone, talking out loud) and apart (usually on laptops with a voice or video call running). Each player sees one shared table plus their own private hand.

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

- Static `index.html` + `engine.js` + `cutin.js`, served by `dev.js` locally and a Vercel function (`api/game.js`) with Upstash Redis in production. No build step, no framework.
- Views: home (name, create/join, open tables, how to play), lobby (code, seats, start), game (opponents around the table, draw/discard piles, your character/table/bank, action panel, hand, table talk log, winner).
- 10 item colours with fixed hexes in `engine.js`; 12 spells; 5 characters (Harry, Hermione, Draco, Luna, Cedric); points are Galleons.
- Rules and game flow are not to change.

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
