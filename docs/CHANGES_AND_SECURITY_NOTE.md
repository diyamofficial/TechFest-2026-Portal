# What was changed in the code, and why

## Security note (vulnerability -> fix)

| # | Weakness in the original code | Fix | Where |
|---|---|---|---|
| 1 | NoSQL injection: operator objects (`{"$ne":null}`) in JSON bodies/queries could reach MongoDB | `express-mongo-sanitize` strips `$`/`.` keys; routes accept plain strings only (`typeof` checks); sanitized attempts are logged | `src/app.js`, `src/routes.js` |
| 2 | No security headers (clickjacking, MIME sniffing, no HSTS, `X-Powered-By` leak) | `helmet()` (CSP, HSTS, nosniff, frameguard...) on the API; CSP + headers on the frontend host | `src/app.js`, `netlify.toml`, `vercel.json` |
| 3 | XSS: user text could be shown as HTML | Feedback feature renders user text as plain text (React escaping, no `dangerouslySetInnerHTML`); CSP blocks inline scripts; 500-char limit | `components/FeedbackSection.jsx`, `netlify.toml` |
| 4 | Login token kept in `localStorage` (readable by any injected script) and returned in the JSON body | Token only in an **httpOnly + Secure + SameSite** cookie; frontend never sees it; `/auth/logout` clears it | `src/auth.js`, `src/routes.js`, `src/api.js`, `AuthContext.jsx` |
| 5 | CSRF (cookie auth makes it possible) | `SameSite` cookie + server rejects state-changing requests whose `Origin` is not in `CORS_ORIGIN`; CORS limited to the frontend with credentials | `src/app.js` |
| 6 | Public default secrets in source (`JWT_SECRET`, `ADMIN_PASSWORD=admin123`, `ADMIN_KEY=changeme` accepted as a working key) | Production refuses to start with missing/default secrets; `x-admin-key` works only if `ADMIN_KEY` is set explicitly (constant-time compare) | `src/config.js`, `src/auth.js`, `server.js` |
| 7 | Brute-force login, seat-draining, spam | `express-rate-limit`: 10 failed logins / 15 min, 30 seat reserves / 15 min, 10 feedback posts / hour, 300 requests / 15 min overall | `src/app.js` |
| 8 | Large/garbage payloads, unbounded fields | JSON body limit 10 kb, length limits on name/email/password/search, event id validation, password minimum raised 6 -> 8 | `src/app.js`, `src/routes.js` |
| 9 | Vulnerable dependency (`qs` via Express) | `npm audit fix` -> 0 vulnerabilities in the API; CI runs `npm audit` | `package-lock.json`, `ci.yml` |
| 10 | `.env` risk | `.gitignore` at repo root + backend/frontend ignore `.env` and `node_modules` | `.gitignore` |

**Known / accepted:** `npm audit` reports 2 moderate issues in `react-router` 6.x (open redirect with user-supplied
link targets, SSR hydration). The site uses neither; the fix needs the v7 major upgrade. Also: `POST /events/:id/reserve`
is still anonymous (rate limited); making it login-only is the next hardening step.

## Backend changes
- `src/app.js` (new): app factory with all middleware (helmet, compression, CORS, CSRF guard, body limit, cookie-parser, mongoSanitize, rate limits).
- `server.js`: now only loads `.env`, checks production config, connects to MongoDB and listens.
- `src/config.js` (new): production safety check, allowed origins.
- `src/auth.js`: cookie helpers; Bearer header still accepted (Postman / scripts).
- `src/routes.js`: input validation, cookie login/logout, `GET/POST /api/feedback`.
- `src/db.js`: `Feedback` model.
- `test/security.test.js` (new): 14 tests, no database needed (`npm test`).
- `security-demo/` (new): before/after demos.
- New packages: `helmet`, `express-mongo-sanitize`, `cookie-parser`, `compression`, `express-rate-limit`.

## Frontend changes
- `src/api.js`, `context/AuthContext.jsx`: cookie auth (`credentials: "include"`), no token in `localStorage`.
- `components/FeedbackSection.jsx` + Contact page: feedback box used for the XSS demo.
- `App.jsx`: `React.lazy` route splitting; `components/BgVideo.jsx`: video loads after page load.
- `vite.config.js`: vendor chunk. `netlify.toml`, `vercel.json`: SPA redirect, security headers, caching.
- Images and hero video compressed.

## Behaviour changes to be aware of
- Existing logged-in sessions end (token storage moved to a cookie) - just log in again.
- Passwords must be 8+ characters at sign-up (old accounts with 6-7 char passwords can still log in).
- Registration/login requests must come from the origin listed in `CORS_ORIGIN`.
- Locally, `.env` still works unchanged (`NODE_ENV` is not `production`, so dev defaults apply).

## Tested here vs. not tested here
Tested in this environment: backend unit/API tests (14 passing), frontend production build, `npm audit`.
**Not tested** (no MongoDB/Render/Netlify access here): the live database flows (signup/login/registration/feedback against MongoDB),
the demo script against a real database, cookies in real browsers, and the deployments. Run through `EXPERIMENT_STEPS.md` section A first
and tell me if anything fails.
