# Experiment 4 - Security, Version Control, CI/CD and Cloud Deployment

**Name:**            **Register No.:**            **Date:**

## Aim
To prepare the HASH 2026 (TechFest) portal for production by implementing security, version control, performance optimization and cloud deployment.

## Question
(Copy the full question with sub-divisions 1-9 from the manual.)

## 1. Application architecture
```
 Browser  --HTTPS-->  Netlify (React + Vite static site, CDN)
                          |  /api/*  (proxy, same-origin cookie)
                          v
                      Render Web Service (Node + Express API)  --TLS-->  MongoDB Atlas (M0)
                          ^
 GitHub (main) --push--> GitHub Actions CI (test + build) --> auto-deploy to Render and Netlify
```
(Redraw as a neat diagram: React -> Server -> Database.)

| Part | Platform | URL |
|---|---|---|
| Frontend | Netlify | https://........netlify.app |
| Backend API | Render | https://........onrender.com/api/health |
| Database | MongoDB Atlas | cluster ........ (db `hash2026`) |
| Repository | GitHub | https://github.com/........ |

## 2. Security note
For each row: description, **before screenshot**, fix (code snippet), **after screenshot**.
(Use the table in `CHANGES_AND_SECURITY_NOTE.md` and the screenshots from `security-demo/README.md`.)

1. NoSQL injection - Before: ____  After: ____
2. XSS in feedback - Before: ____  After: ____
3. Cookie flags (httpOnly, secure, sameSite) - screenshot
4. CSRF explanation + blocked request screenshot
5. Security headers (Helmet) - screenshot of response headers (Network tab or `curl -I`)
6. Rate limiting, validation, secrets handling

## 3. Git evidence
- Screenshot of `git log --oneline --graph --all` (branch, merge, conflict resolution)
- Screenshot of the conflict markers and the resolved file
- GitHub repository page

## 4. CI/CD pipeline
- Screenshot: red run (broken test) and green run
- Pipeline description: push -> GitHub Actions (npm ci, npm test, npm run build) -> Render and Netlify auto-deploy on `main`

## 5. Deployment
- Atlas cluster + user + network access screenshot (hide password)
- Render service + environment variable names (hide values)
- Netlify site + environment/redirect settings
- Atlas document created from the live site
- Live site with https lock

## 6. Performance optimization
(Table of file sizes before/after, from `EXPERIMENT_STEPS.md` section F; list of techniques.)

## 7. Browser DevTools and Lighthouse analysis
| Metric | Before | After |
|---|---|---|
| Performance | | |
| Accessibility | | |
| Best Practices | | |
| SEO | | |
| LCP / CLS / TBT | | |
| Page weight (Network tab) | | |

The 4 (or more) Lighthouse suggestions fixed: 1. ... 2. ... 3. ... 4. ...
Observations from Network / Performance / Application tabs: ...

## 8. Cross-device / browser verification
| Device / browser | Home | Login | Register | Admin | Refresh on /events | Notes |
|---|---|---|---|---|---|---|
| Chrome desktop | | | | | | |
| Firefox / Edge | | | | | | |
| Safari / iPhone | | | | | | |
| Android Chrome | | | | | | |

## Result
Thus the Security, Version Control, CI/CD and Cloud Deployment was developed and its output verified successfully.
