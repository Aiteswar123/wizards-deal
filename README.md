# Wizard's Deal

An online table for playing Monopoly Deal: Harry Potter edition with 2 to 12 friends, each on their own phone or computer.

- Create a table, share the 4-letter code, and friends join from their own devices.
- Each player is dealt a different character at random from twelve: Harry, Hermione, Draco, Luna, Cedric, Lupin, Hagrid, Umbridge, Cho, Ron, Peeves or Moaning Myrtle.
- Bigger tables shuffle in more decks: one for up to 5 players, two for 6 to 10, three for 11 or 12.
- Everyone sits around one table: items and banks are visible to all, your hand is visible only to you.
- The server runs every move through the rules engine, so other players' hands never reach your browser.

The same site also hosts **Grand Line UNO**, a pirate-themed UNO for 2 to 12 players with stacking (+2 on +2, +4 on +2 or +4), its own one-minute turn clock and its own leaderboard ("Most Wanted"). Pick the game at the top of the home page.

Fan-made and unofficial; not affiliated with Hasbro or Warner Bros. Some item card names are stand-ins. Grand Line UNO is fan-made with original artwork, inspired by UNO and One Piece; not affiliated with Mattel, Eiichiro Oda, Shueisha or Toei Animation.

## Project layout

| File | What it is |
| --- | --- |
| `index.html` | The whole game screen: home, lobby and the round table |
| `engine.js` | The rules engine, shared by the browser and the server |
| `uno.js` | Grand Line UNO's rules engine, shared the same way |
| `uno-ui.js` | Grand Line UNO's table screen, cards and home-page pieces |
| `uno-crew.js` | The crew of the Sunwake: portraits on the number cards' wanted posters |
| `uno-art.js` | Card art: each player's own pictures on the number cards, kept in their browser |
| `uno-faces.js` | Card fronts: the classic WANTED poster or one of ten designs, chosen by each player in their own browser |
| `uno-backs.js` | The Card design panel and the card backs, chosen by each player in their own browser |
| `uno-photo.js` | Crew photos: players' own photos on seats, a claimed card and the winner's poster, shared at the table |
| `radio.js` | The ship's radio: your own songs, or the official soundtrack via Spotify's player |
| `sfx.js` | Sound effects, spoken spells and generative music |
| `api/game.js` | Vercel serverless function: tables, moves, hidden hands |
| `dev.js` | Local dev server with an in-memory store (not deployed) |

## Run locally

```bash
npm run dev
```

Open http://localhost:8766. To try several players in one browser, add `?as=name` to the URL in each tab, for example `?as=ron` and `?as=ginny`.

## Deploy to Vercel

1. Import this repository in Vercel (or run `npx vercel deploy --prod`).
2. In the Vercel project, open **Storage**, add **Upstash Redis** (the free plan works), and connect it to the project. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. Redeploy. Without the Redis store the site shows a "database isn't connected" message instead of letting games start.
