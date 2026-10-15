# Campus Shops

Browse the intra shop of every 42 campus, grouped by country. Sign-in with your 42 account is required.

Built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 and Motion.

## 1. Create a 42 OAuth app

1. Go to https://profile.intra.42.fr/oauth/applications and create a new app.
2. In **Redirect URI**, put one URI per line, exactly:
   ```
   https://YOUR-PROJECT.vercel.app/api/auth/callback
   http://localhost:3000/api/auth/callback
   ```
3. Scope: `public` is enough.
4. Copy the **UID** and **SECRET**.

## 2. Environment variables

| Name | Required | What it is |
| --- | --- | --- |
| `FT_CLIENT_ID` | yes | The 42 app UID |
| `FT_CLIENT_SECRET` | yes | The 42 app secret. Only read on the server. |
| `SESSION_SECRET` | yes | 32+ random characters used to sign the session cookie. `openssl rand -base64 48` |
| `APP_URL` | recommended | Public URL without trailing slash, e.g. `https://campus-shops.vercel.app`. Must match the redirect URI host. |

Copy `.env.example` to `.env.local` for local development.

## 3. Run locally

```bash
npm install
npm run dev
```

Requires Node.js 20.9 or newer.

## 4. Deploy to Vercel (manual upload)

1. Unzip, then either push the folder to a Git repo and import it at https://vercel.com/new, or run `npx vercel` inside the folder.
2. Framework preset: **Next.js** (auto-detected). No build settings to change.
3. Add the four environment variables in **Project → Settings → Environment Variables**.
4. Deploy. If you changed `APP_URL` after the first deploy, redeploy.
5. Make sure the production URL's `/api/auth/callback` is listed in your 42 app's redirect URIs.

## How the secret stays protected

- `FT_CLIENT_SECRET` is only read inside files that import `server-only`, so a build fails if any client component ever imports them.
- Shop data is fetched on the server with the app's client-credentials token, then cached (campuses 12 h, each shop 20 min, wallets 2 min). The browser only receives whitelisted fields, never tokens.
- The signed-in user's 42 token is used once to read `/v2/me`, then discarded. The session is a signed, httpOnly, SameSite=Lax JWT cookie valid for 7 days.
- `proxy.ts` blocks `/shops/*` without a valid session, and every page verifies the session again.
- OAuth uses a random `state` checked in constant time, and post-login redirects only accept same-site paths.
- Security headers (CSP, frame denial, HSTS, etc.) are set in `next.config.ts`.

## Rate limits

The 42 API allows about 2 requests per second per app. Because results are cached and shared across all visitors, a busy day costs only a few calls per campus. 429 responses are retried with backoff.

## Project layout

```
app/
  page.tsx                  Landing + sign-in
  api/auth/*                login, callback, logout
  shops/page.tsx            Campus directory grouped by country
  shops/[campusId]/page.tsx A campus shop
lib/
  ft-api.ts                 42 API client (server only, cached)
  session*.ts               Signed session cookie
components/                 UI (Motion animations, pixel art, etc.)
proxy.ts                    Auth guard for /shops
```

## Notes

- Product images are loaded from 42's CDN. If one fails, a pixel shopping bag is shown instead.
- Inactive campuses are hidden.
- Unofficial project, not run by 42.
