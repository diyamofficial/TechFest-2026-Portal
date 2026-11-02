# HASH 2026 — Backend

Express + MongoDB (Mongoose) API for the HASH 2026 frontend. Events are seeded into the `events` collection on first start; seats and registrations persist in MongoDB.

## Run

Needs a running MongoDB (local `mongod` or an Atlas URI).

```
npm install
npm start          # http://localhost:5000
```

Set these environment variables if you need to change (see `.env.example`): `PORT`, `MONGODB_URI`, `CORS_ORIGIN`, `ADMIN_KEY` (defaults: 5000, mongodb://127.0.0.1:27017/hash2026, http://localhost:5173; `ADMIN_KEY` is optional and off by default).

Collections: `events`, `registrations`, `counters` (participant ID sequence). To reset, drop the database; events reseed on next start.

Run the frontend at the same time (`npm run dev` in the frontend folder) — Vite proxies `/api` to `localhost:5000`.

## Endpoints (all under `/api`)

| Method | Path | Used by |
|---|---|---|
| GET | `/health` | — |
| GET | `/events?search=&category=` | Events page, Registration checkboxes |
| GET | `/events/categories` | Events filter |
| GET | `/events/:id` | — |
| POST | `/events/:id/reserve` | "Reserve a seat" button |
| GET | `/departments` | Registration dropdown |
| POST | `/registrations` | Registration form |
| GET | `/registrations` (header `x-admin-key`) | admin |
| GET | `/home/tracks`, `/home/updates` | Home |
| GET | `/schedule` | Events day-flow table |
| GET | `/gallery` | Gallery |
| GET | `/contact`, `/contact/coordinators` | Contact |

`POST /registrations` body: `{ name, email, phone, department, events: ["Build Sprint"] }`.
Success `201` returns `participantId` (`HASH26-0001`) and `totalFee`. Errors: `400` `{errors:{field:msg}}`, `409` duplicate / sold out.

## Postman

Import `postman/HASH-2026.postman_collection.json` and `postman/HASH-2026.local.postman_environment.json`, select the environment, run the collection in order (requests include test scripts).

## Auth (added)

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/signup` | `{ name, email, password }` → `{ token, user }` |
| POST | `/auth/login` | user sign in |
| POST | `/auth/admin/login` | admin sign in |
| GET | `/auth/me` | Bearer token |
| GET | `/my/registrations` | Bearer token (own registrations) |
| GET | `/admin/summary` | admin Bearer token: stats, users, registrations, events |

Login/signup set an **httpOnly cookie** (`hash_token`); the token is not returned in the JSON body. `Authorization: Bearer <token>` is still accepted for scripts. `POST /registrations` requires a login; registration is stored with the user's `userId`. `GET /registrations` accepts an admin session or, only if `ADMIN_KEY` is set, the `x-admin-key` header.
Admin account is auto-seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (dev defaults `admin@hash.local` / `admin123`).

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/logout` | clears the cookie |
| GET / POST | `/feedback` | latest 20 / add feedback `{ name?, message }` (max 500 chars, rate limited) |

## Production (`NODE_ENV=production`)
The server refuses to start unless `JWT_SECRET` (32+ chars), `ADMIN_PASSWORD` (10+ chars), `MONGODB_URI` and `CORS_ORIGIN` are set. Also see `COOKIE_SAMESITE` and `TRUST_PROXY` in `.env.example`. Security middleware: helmet, express-mongo-sanitize, CORS + Origin (CSRF) check, rate limits, 10 kb body limit. Tests: `npm test`.
