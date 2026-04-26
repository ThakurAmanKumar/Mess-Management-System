SmartMess - Deployment Checklist

1) Environment variables (required)
- MONGO_URI: MongoDB connection string
- JWT_SECRET: Secret for JWT tokens
- NODE_ENV=production
- PORT (optional, default 5000)

Optional (recommended)
- SMTP_* for email (if used)
- SENTRY_DSN or other monitoring DSN

2) Build frontend
- From project root or `frontend` folder:

```bash
cd frontend
npm ci
npm run build
```

This produces `frontend/dist`.

3) Start backend (serves API + frontend in production)
- Install dependencies and start the server:

```bash
cd backend
npm ci
NODE_ENV=production MONGO_URI="<uri>" JWT_SECRET="<secret>" npm start
```

- The backend will serve the static frontend from `frontend/dist` when `NODE_ENV=production`.

4) Process manager
- Use `pm2`, `systemd`, or your host's process manager. Example with pm2:

```bash
npm i -g pm2
pm2 start src/server.js --name smartmess --env production
pm2 save
```

5) Reverse proxy & TLS
- Put behind Nginx or your provider's load balancer and enable HTTPS.
- Set `X-Forwarded-*` headers correctly if using Express trust proxy.

6) Database & admin
- Ensure database is reachable from the host and run any seed scripts:

```bash
cd backend
npm run create-admin -- --email="er.thakuramankumar@gmail.com" --password="aman1234"
```

7) CORS & security
- Currently CORS allows all origins for simplicity. For production, restrict `cors.origin` to your frontend host(s).
- Rotate `JWT_SECRET` periodically.

8) Smoke tests
- After deployment, hit these endpoints:
  - `GET /api/health`
  - `GET /api/menu/today`
  - `POST /api/ratings` (authenticated)

9) CI/CD
- For automated deploys, build frontend in CI and upload `frontend/dist` to the server or let the backend build step run.

If you want, I can:
- Add a `heroku-postbuild` or an npm script to build frontend during deploy.
- Create `ecosystem.config.js` for `pm2`.
- Restrict CORS to a configured origin list.

Which of those should I do next?