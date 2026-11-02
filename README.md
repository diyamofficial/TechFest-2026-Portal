# HASH 2026 - MBCET Tech Fest portal

React + Vite frontend (`hash-frontend/frontend`) and Express + MongoDB API (`hash-backend/backend`).

- Lab steps and checklist: [`docs/EXPERIMENT_STEPS.md`](docs/EXPERIMENT_STEPS.md)
- What changed / security note: [`docs/CHANGES_AND_SECURITY_NOTE.md`](docs/CHANGES_AND_SECURITY_NOTE.md)
- Report template: [`docs/DEPLOYMENT_REPORT_TEMPLATE.md`](docs/DEPLOYMENT_REPORT_TEMPLATE.md)

## Run locally
```
cd hash-backend/backend  && cp .env.example .env && npm install && npm start
cd hash-frontend/frontend && npm install && npm run dev      # http://localhost:5173
npm test                                                     # in hash-backend/backend
```
CI: `.github/workflows/ci.yml` (tests + build on every push).
