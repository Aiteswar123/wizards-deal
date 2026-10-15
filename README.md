# Wizard's Deal

An online table for playing Monopoly Deal: Harry Potter edition with 2 to 12 friends, each on their own phone or computer.

- Create a table, share the 4-letter code, and friends join from their own devices.
- Each player is dealt a different character at random from twelve: Harry, Hermione, Draco, Luna, Cedric, Lupin, Hagrid, Umbridge, Cho, Ron, Peeves or Moaning Myrtle.
- Bigger tables shuffle in more decks: one for up to 5 players, two for 6 to 10, three for 11 or 12.
- Everyone sits around one table: items and banks are visible to all, your hand is visible only to you.
- The server runs every move through the rules engine, so other players' hands never reach your browser.

Fan-made and unofficial; not affiliated with Hasbro or Warner Bros. Some item card names are stand-ins.

## Project layout

| File | What it is |
| --- | --- |
| `index.html` | The whole game screen: home, lobby and the round table |
| `engine.js` | The rules engine, shared by the browser and the server |
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
