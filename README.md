# The Ginormous Pour

Rampage-themed head-to-head beer ranking for a tasting night. Everyone loads it
on their phone, registers the beer they brought as a city-smashing monster,
then judges rounds: two beers, drink both, tap the winner, watch the loser get
punched off the roof. At the end of the night the Tower view runs a brawl and
stacks every beer on a skyscraper, champion on the roof.

Plain HTML, CSS, and ES modules. No build step. Hosted on Vercel; shared state
lives in Supabase (Postgres) via its REST API, so nothing needs a client library.

The 2026 planning slideshow that used to live at the repo root is now in
`planning/` and still works from there.

## Deploy in about ten minutes

### 1. Supabase (the shared scoreboard)

1. Create a project at https://supabase.com/dashboard.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, run it.
3. Open **Project Settings → API** and copy the **Project URL** and the
   **anon public** key.

The schema enables row level security so the anon key can only read and add
rows. Nobody can edit or delete from a phone.

### 2. Vercel (the app)

From this folder:

```bash
npx vercel            # first run links or creates the project
npx vercel env add SUPABASE_URL production       # paste the project URL
npx vercel env add SUPABASE_ANON_KEY production  # paste the anon key
npx vercel --prod
```

Or use the dashboard: at https://vercel.com/new import
`nkittur/ginormous-pour-2026`, add the two environment variables under
**Environment Variables**, and deploy. Every later push to `main` redeploys.

`api/config.js` hands those two values to the browser at load time. If you
would rather not use environment variables, paste them into `js/config.js`
instead.

Share the deployed URL with the room. It works on any phone browser.

### Running locally

```bash
npx serve .
```

Without Supabase settings the app runs in **local mode**: everything stays in
that one browser, and the home screen offers a sample lineup so you can try it.

## How ranking works

Every round is one head-to-head result with a margin: Close call, Beatdown, or
Total demolition. Ratings are Elo, replayed from the full match log on every
phone, so the standings are identical everywhere and never depend on who saved
last. The margin sets how much rating moves (K of 16, 28, or 44).

The matchmaker favors beers with the fewest rounds, pairs that have not met,
pairs this judge has not seen, and, once ratings exist, beers close in rating.
Judges can play as many rounds as they like.

## Reset for a new event

In the Supabase SQL editor:

```sql
truncate public.matches, public.raters, public.beers;
```

## Files

- `index.html`, `css/style.css`: the page and its arcade styling
- `js/sprites.js`: all pixel art (eight monsters, explosions, buildings, props)
- `js/elo.js`: ratings, standings, and matchmaking
- `js/store.js`: Supabase and local storage adapters
- `js/app.js`: views: home, bring a beer, judge sign-in, round, roster, tower
- `api/config.js`: Vercel function that exposes the Supabase settings
- `supabase/schema.sql`: tables and row level security policies
- `scripts/build-artifact.mjs`: bundles everything into one file for hosting as a claude.ai artifact
- `planning/`: the 2026 planning slideshow
