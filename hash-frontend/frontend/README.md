# HASH 2026 — MBCET

React + Vite site for HASH, MBCET's IEDC tech fest.

## Run it

```
npm install
npm run dev
```

Build for production: `npm run build` (output in `dist/`). Deployed API: set `VITE_API_URL` (see `.env.example` and `netlify.toml`).

## Before you launch — placeholder content to replace

Everything below runs and looks right, but the facts are placeholders. Search-and-swap these:

- `src/data/events.js` — track names, fees, seat counts.
- `src/pages/Events.jsx` — the "Day flow" table (currently Morning/Afternoon/Evening, no dates).
- `src/pages/Contact.jsx` — coordinators (only Diya is filled in), venue dates, sponsor section.
- `src/pages/Home.jsx` — hero copy, "Updates" list.
- `src/pages/Gallery.jsx` — photos in `public/images/` are stock/sample, not real HASH photos.
- `public/videos/hero-bg.mp4` — the hero background loop (compressed to ~9MB for web; swap for a different clip if you want, keep it under ~10MB for load speed).

## Structure

```
src/
  components/   Navbar, EventCard, EventList
  pages/        Home, Events, Registration, Gallery, Contact, NotFound
  context/      ThemeContext (dark/light toggle)
  data/         events.js
public/
  images/       logo + gallery/sponsor images
  videos/       hero-bg.mp4
```
