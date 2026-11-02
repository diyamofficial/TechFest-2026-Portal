# Security demos (use in your TEST COPY, take screenshots)

Everything here is for the lab record. Do the "before" in the test copy of the project,
then show the "after" with the fixed code.

## 1. NoSQL injection (login bypass)

1. Make sure MongoDB is running (local or Atlas URI in `.env`).
2. **Before** - start the vulnerable demo server:
   ```
   node security-demo/nosql-injection-demo.js
   ```
3. Normal attacker guess (should fail):
   ```
   curl -X POST http://localhost:5050/login -H "Content-Type: application/json" -d "{\"email\":\"victim@demo.com\",\"password\":\"wrong\"}"
   ```
4. Injection (logs in WITHOUT knowing the password):
   ```
   curl -X POST http://localhost:5050/login -H "Content-Type: application/json" -d "{\"email\":\"victim@demo.com\",\"password\":{\"$ne\":null}}"
   ```
   -> `{"result":"LOGGED IN","as":"victim@demo.com"}`   (screenshot = BEFORE)
   (On Linux/macOS use single quotes around the JSON instead of escaping the quotes.)
5. **After** - stop it, run with the protection on:
   ```
   SANITIZE=on node security-demo/nosql-injection-demo.js
   ```
   (PowerShell: `$env:SANITIZE="on"; node security-demo/nosql-injection-demo.js`)
   Repeat step 4 -> `login failed`. The server log prints nothing special, but the `$ne`
   key was stripped by `express-mongo-sanitize`.   (screenshot = AFTER)

### And on the real API
The real routes (`src/routes.js`) also check `typeof email === "string"` and the app uses
`helmet()` + `mongoSanitize()` (see `src/app.js`). Show it:
```
curl -i -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":{"$ne":null},"password":{"$ne":null}}'
```
-> `400 Email and password are required` and the server console prints
`[security] NoSQL operator removed from "email"`.

## 2. XSS (script injection) in the feedback box

Feedback box = Contact page -> "Feedback".

**Before (vulnerable):** in the TEST COPY edit `src/components/FeedbackSection.jsx`, change
```jsx
<p>{f.message}</p>
```
to
```jsx
<p dangerouslySetInnerHTML={{ __html: f.message }} />
```
Run the app and submit this as feedback:
```
<img src=x onerror="alert('XSS')">
```
An alert box pops up (screenshot = BEFORE). Reload the page: it pops up again for every visitor.

> Why not `<script>alert('hi')</script>`? Browsers do NOT run `<script>` tags that are inserted through
> `innerHTML`/`dangerouslySetInnerHTML`, so use the `<img onerror>` payload for the working demo.
> You can still type the `<script>` text from the manual: it is the "after" test below.

**After (fixed, the real code):** revert to `<p>{f.message}</p>`. Submit
`<script>alert('hi')</script>` and `<img src=x onerror="alert('XSS')">` -> they appear as plain text,
nothing runs (screenshot = AFTER). Extra layers: Helmet's CSP on the API, and the CSP header in
`netlify.toml` (`script-src 'self'`) which blocks inline scripts on the deployed site.

## 3. Cookies & CSRF

* Log in on the site, press F12 -> Application -> Cookies: `hash_token` shows **HttpOnly**, **Secure**
  (on https) and **SameSite**. In the Console run `document.cookie` -> the token is NOT listed
  (screenshot). Compare with the old code, which kept the token in `localStorage` where
  `localStorage.getItem("hash_token")` could read it.
* CSRF: open `security-demo/csrf-attacker.html` (double-click) while logged in. Press the button.
  The API answers **403 Cross-site request blocked**.

## 4. Other protections to mention
Rate limiting (try 11 wrong logins -> `429 Too many requests`), request body limit (10 kb),
input type/length validation, production refuses default secrets, `npm audit` clean on the API.
