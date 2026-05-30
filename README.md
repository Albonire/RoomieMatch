
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

3. Run the app:
   `npm run dev`

## Deploy Backend On Railway

1. Push this repo to GitHub and create a new Railway project from that repo.
2. In Railway service settings, use:
   - Start Command: `npm start`
   - Node environment: auto-detected from `package.json`
3. Add service environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=<long-random-secret>`
   - `DB_PATH=/app/data/roomiematch.db` (recommended with volume)
4. Add a Railway volume and mount it at `/app/data` so SQLite survives redeploys.
5. Enable auto-deploy from `main` (default) to get CI/CD on each push.

Notes:
- The backend now reads database path from `DB_PATH` and binds to `PORT` automatically.
- `JWT_SECRET` is required in production.
