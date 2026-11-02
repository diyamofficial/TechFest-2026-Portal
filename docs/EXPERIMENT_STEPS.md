# Experiment 4 - what YOU need to do (step by step)

The code is already prepared (security fixes, tests, CI file, deploy configs, performance work).
What is left is the part that needs *your* accounts and *your* screenshots.
Numbers in brackets = the step numbers in the lab manual.

Folder layout used below (repo root = the `exp4` folder):
```
exp4/
  .github/workflows/ci.yml      <- CI pipeline (already written)
  render.yaml                   <- optional Render blueprint
  hash-backend/backend/         <- Express + MongoDB API
  hash-frontend/frontend/       <- React + Vite site
  docs/                         <- these notes + report template
```

---------------------------------------------------------------------------------------

## A. Setup and test copy  [1, 2]
1. Create free accounts: GitHub, MongoDB Atlas, Render, Netlify (or Vercel). Check `git --version` and `node -v` (20+).
2. Unzip, then install:
   ```
   cd hash-backend/backend  && npm install
   cd ../../hash-frontend/frontend && npm install
   ```
3. Make the **test copy** for the attack demos: copy the whole `exp4` folder to `exp4-test`.
   (The demos in `security-demo/` run from the copy; the "after" is the real code.)
4. Run it locally once: MongoDB running locally (or an Atlas URI in `hash-backend/backend/.env`),
   `npm start` in the backend, `npm run dev` in the frontend -> http://localhost:5173.

## B. Security demos with before/after screenshots  [3, 4, 5]
Follow `hash-backend/backend/security-demo/README.md`. Screenshots to take:

| # | Vulnerability | BEFORE screenshot | AFTER screenshot |
|---|---|---|---|
| 1 | NoSQL injection login bypass [3] | curl with `{"$ne":null}` -> `LOGGED IN` | same curl with `SANITIZE=on` -> `login failed`; and real API -> `400` + server log line |
| 2 | XSS in feedback box [4] | `dangerouslySetInnerHTML` + `<img src=x onerror=alert('XSS')>` -> alert pops up | real code: payload shown as plain text |
| 3 | Token theft via XSS [5] | (old code) `localStorage.getItem("hash_token")` in console returns the token | DevTools -> Application -> Cookies: `hash_token` is HttpOnly/Secure/SameSite; `document.cookie` does not show it |
| 4 | CSRF [5] | explain in record | `csrf-attacker.html` -> `403 Cross-site request blocked` |
| 5 | Brute force | - | 11 wrong logins -> `429` |

Notes for the "before" shots: the original code's token was in `localStorage` (you can show this
from your original zip), and its default secrets (`changeme`, `admin123`) were public in the code.

**CSRF in two lines (for the record):** a fake page on another site makes your browser send a request to
our API, and the browser automatically attaches your login cookie. `SameSite` tells the browser not to attach
the cookie to requests started by other sites; our server also checks the `Origin` header and rejects other sites.

## C. Git: version control, branching, merge, conflict  [6-10]
Run in the repo root (`exp4`, not in `exp4-test`). Use a clear message every time.
```
git init -b main
git add .
git status                      # node_modules and .env must NOT be listed (see .gitignore)
git commit -m "first version: HASH 2026 portal with security fixes"
```
**Branch + merge [8]**
```
git checkout -b feature-page
#  edit something small, e.g. the footer text in hash-frontend/frontend/src/App.jsx
git add . && git commit -m "feat: update footer text"
git checkout main
git merge feature-page
git log --oneline --graph --all          # screenshot
```
**Merge conflict on purpose [9]**  (change the SAME line on two branches)
```
git checkout -b conflict-a
#  edit the line  <p>That page doesn't exist. ...</p>  in src/pages/NotFound.jsx  -> "Oops A"
git commit -am "notfound text A"
git checkout main
git checkout -b conflict-b
#  edit the SAME line -> "Oops B"
git commit -am "notfound text B"
git checkout main
git merge conflict-a                     # fast-forward / clean
git merge conflict-b                     # CONFLICT -> screenshot of the message
#  open the file, you will see <<<<<<< HEAD ... ======= ... >>>>>>> conflict-b
#  keep the correct line, delete the 3 marker lines, then:
git add hash-frontend/frontend/src/pages/NotFound.jsx
git commit -m "resolve merge conflict in NotFound text"
git log --oneline --graph --all          # screenshot
```
**Upload to GitHub [10]**: create an EMPTY repo on github.com (no README), then run the two commands GitHub shows:
```
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
git push --all                           # pushes the other branches so the graph shows on GitHub
```
Screenshot: GitHub repo page + Insights -> Network (or the Branches page).

## D. CI pipeline  [11]
`.github/workflows/ci.yml` is already in the project: on every push it installs, runs the backend tests (`npm test`)
and builds the frontend (`npm run build`).
1. Push your branch -> GitHub -> **Actions** tab -> it should be green.
2. For the "red then green" screenshots, on a branch such as `ci-demo`:
   - in `hash-backend/backend/test/security.test.js` change `assert.equal(res.status, 200)` in the first test to `201`
   - `git commit -am "break test on purpose" && git push`  -> **red** (screenshot)
   - change it back, `git commit -am "fix test" && git push` -> **green** (screenshot)
   - merge to main: `git checkout main && git merge ci-demo && git push`

## E. Cloud deployment  [12-15]
**Order matters** (the three services need each other's URLs): Atlas -> Render -> Netlify -> go back and finish Render's CORS value.

### 1) MongoDB Atlas [12]
- Create a free **M0** cluster -> Database Access: add a user + password (use letters/digits only,
  or URL-encode special characters) -> Network Access: allow `0.0.0.0/0` (Render's free tier has no fixed IP;
  mention in the report that this is acceptable only because the DB is password protected).
- Connect -> Drivers -> copy the string and add the DB name:
  `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/hash2026?retryWrites=true&w=majority`

### 2) Backend on Render [13]
- New -> **Web Service** -> connect the GitHub repo.
  - Root Directory: `hash-backend/backend`
  - Build Command: `npm ci`   Start Command: `npm start`
  - Health Check Path: `/api/health`
- Environment variables (**the code reads `MONGODB_URI`, not `MONGO_URI` as the manual says**):

  | Key | Value |
  |---|---|
  | `NODE_ENV` | `production` |
  | `MONGODB_URI` | your Atlas string |
  | `JWT_SECRET` | 48+ random chars: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
  | `ADMIN_EMAIL` | e.g. your email |
  | `ADMIN_PASSWORD` | a strong password (10+ chars) - this is your admin login |
  | `CORS_ORIGIN` | your Netlify URL (fill in after step 3; no trailing slash) |
  | `COOKIE_SAMESITE` | `lax` (Option A below) or `none` (Option B) |
  | `TRUST_PROXY` | `2` (Option A) or `1` (Option B) |

  In production the server **refuses to start** if the secrets are missing/default - that is intentional.
- Open `https://<your-api>.onrender.com/api/health` -> `{"status":"ok",...}`. Free Render sleeps after ~15 min idle;
  the first request can take ~30-60 s. Hit `/api/health` before testing / running Lighthouse.

### 3) Frontend on Netlify [14]  (Vercel works too)
- Add new site -> Import from GitHub. **Base directory** `hash-frontend/frontend`, build `npm run build`, publish `dist`
  (these are already in `netlify.toml`).
- **Option A - recommended: proxy the API through Netlify** (cookies stay first-party, so login also works in Safari/iPhone):
  1. In `hash-frontend/frontend/netlify.toml` un-comment the `/api/*` redirect block and put in your Render URL.
  2. Do NOT set `VITE_API_URL`.
  3. Render env: `COOKIE_SAMESITE=lax`, `TRUST_PROXY=2`.
- **Option B - direct calls**: set Netlify env `VITE_API_URL=https://<your-api>.onrender.com/api`, Render env
  `COOKIE_SAMESITE=none`, `TRUST_PROXY=1`. Works in Chrome/Edge/Firefox, but **Safari and some mobile browsers block
  these cross-site cookies, so login fails there**. Use B only if you cannot use A.
- The SPA redirect rule (`/* -> /index.html`) is already in `netlify.toml`, so refreshing `/events`, `/contact` works.
  (Vercel: `vercel.json` has the same rule; for Option A on Vercel add a rewrite `/api/:path*` -> your Render URL.)
- Go back to Render and set `CORS_ORIGIN` to the final Netlify URL (e.g. `https://hash-2026.netlify.app`) -> it redeploys.
- Pushing to `main` now redeploys both services automatically = your **automated deployment pipeline** (CD).
  Write that in the report: GitHub -> (CI tests) -> Render + Netlify auto-deploy.

### 4) Test the live site [15]
Open the Netlify URL (lock symbol / `https://`) -> Login page -> sign up -> in Atlas: Browse Collections ->
`hash2026.users` shows the new user. Register for a track -> `registrations` shows the entry. Log in as admin at
`/admin/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## F. Performance  [16, 17]
**Already done in the code** (list these as your optimizations):
route-level lazy loading (`React.lazy` for Events, Gallery, Contact, Login, Admin...), `loading="lazy"` on gallery images,
vendor chunk split, background video loaded only after page load (and skipped on data-saver/reduced-motion),
image compression (event1.jpg 1.9 MB -> 137 KB), hero video 8.8 MB -> 1.6 MB, logos resized, width/height on images
(no layout shift), gzip on API responses, long-term cache headers (`netlify.toml`), `npm run build` minification.

| File | Before | After |
|---|---|---|
| `public/images/event1.jpg` | 1,881 KB | 137 KB |
| `public/videos/hero-bg.mp4` | 8,772 KB | 1,597 KB |
| `public/images/logo-mark.png` | 56 KB | 11 KB |
| `public/images/logo.png` | 135 KB | 18 KB |
| Whole `public/` folder | 11.2 MB | 2.0 MB |
| Production build `dist/` total | ~11.4 MB | ~2.2 MB |
| First-load JS (gzip) | 60.4 KB (one bundle) | 57.8 KB initial + small per-page chunks loaded on demand |

**To get a genuine Lighthouse "before"** (because the optimized files are already in your code):
1. Create a branch `perf-baseline`, copy `event1.jpg` and `hero-bg.mp4` (and the two logos) from your ORIGINAL zip
   over the optimized ones, commit, push, and deploy that branch (Netlify -> Site configuration -> Branch deploys,
   or deploy preview).
2. Chrome **Incognito** -> that URL -> F12 -> **Lighthouse** -> Mobile -> Analyze -> save the report (Save as HTML) = BEFORE.
3. Same on the `main` deployment = AFTER. Also run Desktop. Warm the Render API first (`/api/health`).
4. Lighthouse will still list a few suggestions. Fix **at least 4** and re-run. Typical ones for this site:
   serve images in WebP/AVIF, set explicit sizes, reduce unused CSS, add `meta description` (done), add
   `rel=preconnect` (done), improve colour contrast / button labels (Accessibility), enable text compression (Netlify does it).
   Write which 4 you picked and the score change in the report.

**DevTools analysis [7]** - screenshot + 2-3 lines each: Network tab (Disable cache, throttle "Fast 4G": total transferred,
largest file, number of requests, `lazy` chunks appearing only when you visit a page), Performance tab (LCP, long tasks),
Application tab (cookie flags), Console (no errors), Lighthouse.

## G. Cross-device / cross-browser check  [8 of the question]
Open the live URL on: Chrome, Edge/Firefox, Safari or an iPhone (if you have one), an Android phone.
Also Chrome DevTools -> device toolbar (iPhone 12, Pixel 7, iPad). Check: nav menu on mobile, login, registration, admin,
gallery, refresh on `/events` (no 404), dark/light toggle. Put a ✔/✘ table + 2-3 screenshots in the report.

## H. Report [18 / question 9]
Fill in `docs/DEPLOYMENT_REPORT_TEMPLATE.md` and export to PDF/Word for your record. It must contain:
Aim + full question with sub-divisions, security note (each vulnerability + fix + before/after screenshots), Git evidence,
green CI screenshot, the three live URLs (frontend, API, Atlas), Lighthouse before/after, architecture diagram,
live-site screenshots, Result.

---------------------------------------------------------------------------------------

## Final checklist
- [ ] `.env` is NOT in GitHub (check the repo page) and no real password is in any committed file
- [ ] Git graph shows branch, merge and the resolved conflict
- [ ] Green CI run
- [ ] Frontend URL is https and the lock icon shows
- [ ] API `/api/health` works, Atlas shows the new user
- [ ] Lighthouse before/after saved
- [ ] Admin password changed from the default
