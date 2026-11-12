# Meetup

Meetup is a meeting application with a React/Vite client and an Express, Socket.IO, and Neon-backed server.

## Requirements

- Node.js 20.19 or later, or 22.12 or later
- npm
- Clerk and Neon accounts/configuration

## Run locally

Use two terminals from the project root. On Windows PowerShell, set up and run the backend first:

```powershell
cd server
npm ci
Copy-Item .env.example .env
```

Fill in the required Clerk and Neon values in `server/.env`, then start the backend:

```powershell
npm start
```

The API listens on `http://localhost:3000`. Keep this terminal running.

In a second terminal, set up and run the frontend:

```powershell
cd client
npm ci
Copy-Item .env.example .env
npm run dev
```

Set `VITE_CLERK_PUBLISHABLE_KEY` in `client/.env` before starting Vite. `VITE_BASE_URL` should be `http://localhost:3000` for local development. The development site is normally available at `http://localhost:5173`; the server's `ORIGINS` value must include the frontend's origin.

## Deploy to Vercel

The included `client/vercel.json` is for the frontend SPA. Import the repository into Vercel and set the project's Root Directory to `client`. Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_BASE_URL` in the Vercel project's environment variables; `VITE_BASE_URL` must be the public URL of the deployed backend.

## Deploy the frontend to Render

For a Render Static Site, set the Root Directory to `client`, the build command to `npm run build`, and the publish directory to `dist`. In the Render Dashboard, add a **Rewrite** rule with source `/*` and destination `/index.html`. This lets React Router handle routes such as `/dashboard` after Clerk redirects back from sign-in. Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_BASE_URL` in the site's environment variables.

### Does the backend need a Vercel config file?

No—not for the existing deployment setup. Deploy the Express/Socket.IO backend separately to a host that supports a continuously running Node.js process and persistent WebSocket connections. Add the variables from `server/.env.example` to that host's environment settings, and set `ORIGINS` to the deployed frontend's origin.

Adding a `vercel.json` to the server would not by itself make this `server.listen()` and Socket.IO server work as a Vercel Function. Hosting both parts on Vercel would require adapting the backend and its real-time communication to Vercel's supported deployment model; the current server is intended to run as a persistent Node.js service.

## GitHub and secrets

Commit both npm lockfiles and the `.env.example` files. Never commit `.env` files or put server secrets in client variables: Vite variables are included in the browser bundle. Rotate any credentials that may already have been published.
