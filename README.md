<div align="center">

<img src=".github/assets/logo.png" alt="42 Shops logo" width="128" height="128" />

# 42 Shops

**Every 42 campus shop, in one place.**

Pick a country, pick a campus, and see what's for sale, what's in stock, and what your wallet can afford.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Motion](https://img.shields.io/badge/Motion-12-fff312?logo=framer&logoColor=black)](https://motion.dev)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis-00e9a3?logo=upstash&logoColor=white)](https://upstash.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-2f6bff.svg)](LICENSE)

<img src=".github/assets/screenshot-landing.png" alt="42 Shops landing page" width="860" />

</div>

---

## Why

Each 42 campus runs its own intra shop, and you can normally only see your own. 42 Shops reads the public 42 API and lets any student browse every campus's shop, compare prices, and check what their wallet (₳) covers, all behind a 42 sign-in.

## Features

- **Every campus, grouped by country.** Live search by campus, city or country, with a jump bar for country codes.
- **Your campus and the most viewed one, up front.** Your home campus is pinned at the top, next to the campus students open most.
- **Full shop view.** Filter by *In stock*, *In budget*, *Unavailable* or *All*, sort by price, name or newest, and search within a shop.
- **Wallet aware.** Your current ₳ balance is shown everywhere, with a progress bar for items you can't afford yet.
- **Campus switcher.** Press <kbd>⌘ K</kbd> (or <kbd>Ctrl K</kbd>) to jump to any campus from the keyboard.
- **42 sign-in only.** Nothing is visible without signing in through 42 OAuth.
- **Secrets stay on the server.** The API secret never reaches the browser, product images are proxied through the server, and shop data is cached so the 42 API is barely touched.
- **Motion where it helps.** Shared-element transitions from card to detail view, layout animations when filtering, springy micro-interactions, draggable pixel stickers. Respects `prefers-reduced-motion`.

## Screenshots

> Screenshots use sample shop data.

| Campus directory | Campus shop |
| --- | --- |
| <img src=".github/assets/screenshot-campuses.png" alt="Campus directory grouped by country" /> | <img src=".github/assets/screenshot-shop.png" alt="A campus shop with filters" /> |
| **Product details** | **Campus switcher <kbd>⌘ K</kbd> / <kbd>Ctrl K</kbd>** |
| <img src=".github/assets/screenshot-product.png" alt="Product detail view" /> | <img src=".github/assets/screenshot-switcher.png" alt="Command palette campus switcher" /> |

## Tech stack

| | |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) App Router, Turbopack, React Server Components |
| UI | [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [lucide-react](https://lucide.dev) |
| Animation | [Motion](https://motion.dev) (`motion/react`) |
| Auth | 42 OAuth 2.0, signed JWT session cookie via [jose](https://github.com/panva/jose) |
| Storage | [Upstash Redis](https://upstash.com) for campus view counts |
| Fonts | Instrument Serif, Geist, Silkscreen, Kalam (self-hosted via Fontsource) |
| Data | [42 API v2](https://api.intra.42.fr/apidoc) |

## Getting started

### Prerequisites

- Node.js **20.9** or newer
- A 42 intra account (to create an OAuth app)
- An [Upstash Redis](https://upstash.com) database for production (optional locally)

### 1. Create a 42 OAuth app

Go to [profile.intra.42.fr/oauth/applications](https://profile.intra.42.fr/oauth/applications) and create a new application:

| Field | Value |
| --- | --- |
| Name | `42 Shops` (or anything unique) |
| Image | `.github/assets/logo.png` |
| Application type | Campus Tool |
| Redirect URI | One per line, no trailing slash:<br>`http://localhost:3000/api/auth/callback`<br>`https://YOUR-DOMAIN/api/auth/callback` |
| Scopes | **Access the user public data** only |

Copy the **UID** and **SECRET** from the app page.

### 2. Install and configure

```bash
git clone https://github.com/HxX2/42shops.git
cd 42shops
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see below), then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with 42.

### Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `FT_CLIENT_ID` | Yes | Your 42 app's UID. |
| `FT_CLIENT_SECRET` | Yes | Your 42 app's secret. Read on the server only. |
| `SESSION_SECRET` | Yes | At least 32 random characters, used to sign session cookies. Generate with `openssl rand -base64 48`. |
| `APP_URL` | Recommended | Public URL without trailing slash, e.g. `https://42-shops.vercel.app`. `APP_URL` + `/api/auth/callback` must be listed in your 42 app's redirect URIs. Falls back to the request origin. |
| `UPSTASH_REDIS_REST_URL` | In production | REST URL of your Upstash Redis database. `KV_REST_API_URL` also works. |
| `UPSTASH_REDIS_REST_TOKEN` | In production | REST token of the same database. `KV_REST_API_TOKEN` also works. |

### Campus view counts

The "Most viewed" campus is counted in Redis so every server instance shares the same numbers and they survive deploys.

- **On Vercel:** open your project, go to **Storage → Create Database → Upstash Redis**, and connect it to the project. The Redis variables are added for you; redeploy afterwards.
- **Locally:** you can leave the Redis variables empty. Counts are then kept in memory and reset when the dev server restarts.

A signed-in student counts once per campus every 15 minutes. Until any views are recorded, the campus with the most students (other than your own) is shown instead.

## Security

- **The client secret never leaves the server.** Files that use it import `server-only`, so the build fails if client code ever imports them.
- **Only whitelisted fields reach the browser.** API responses are normalized on the server; tokens and extra fields are dropped.
- **Product images are proxied.** The browser loads them from `/api/images`, which fetches them from 42's CDN with the app token. Only product and user image paths are allowed.
- **The user's 42 token is used once** to read `/v2/me`, then discarded. It is never stored.
- **Sessions** are HS256-signed JWTs in an `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookie, valid for 7 days.
- **OAuth `state`** is random, stored in a short-lived cookie, and compared in constant time. Post-login redirects only accept same-site paths.
- **Two layers of auth.** `proxy.ts` blocks `/shops/*` and `/api/images/*` without a valid session (pages redirect to sign-in, API routes return `401`), and every page verifies the session again.
- **Security headers** (CSP, `X-Frame-Options: DENY`, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`.

Found a vulnerability? Please open a private security advisory on GitHub instead of a public issue.

## Caching and rate limits

The 42 API allows about **2 requests per second per app**. To stay well under it, results are cached on the server and shared by all visitors:

| Data | Cached for |
| --- | --- |
| Campus list | 12 hours |
| A campus's products | 20 minutes |
| A user's wallet | 2 minutes |
| Product images | 7 days |
| GitHub star count | 1 hour |

`429 Too Many Requests` responses are retried with backoff, and pagination pauses between pages.

## Project structure

```
.
├── app/
│   ├── page.tsx                 # Landing and sign-in
│   ├── not-found.tsx            # 404
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Starts 42 OAuth
│   │   │   ├── callback/route.ts    # Exchanges code, creates session
│   │   │   └── logout/route.ts      # Clears session
│   │   └── images/[[...path]]/route.ts  # Proxies product images from 42's CDN
│   └── shops/
│       ├── layout.tsx           # Signed-in shell (header, wallet, GitHub stars)
│       ├── page.tsx             # Campus directory (home + most viewed)
│       └── [campusId]/page.tsx  # A campus shop, records a view
├── components/                  # UI, animations, pixel art
├── lib/
│   ├── ft-api.ts                # 42 API client (server only, cached)
│   ├── campus-views.ts          # View counts in Upstash Redis
│   ├── github.ts                # Repo star count
│   ├── session-core.ts          # JWT sign/verify (shared with proxy)
│   ├── session.ts               # Session helpers for server components
│   └── env.ts                   # Lazy, server-only env access
├── proxy.ts                     # Auth guard for /shops and /api/images
└── next.config.ts               # Security headers
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | Type-check without emitting |

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and what makes a good pull request.

Ideas that would help:

- Translations (French, Arabic, Spanish, Japanese…)
- Price history or "new in shop" highlights
- Comparing the same item across campuses
- Better handling for campuses with unusual shop data

## Disclaimer

42 Shops is an **unofficial, community project**. It is not affiliated with, endorsed by, or run by 42 or the 42 Network. "42" is a trademark of its owner. Use of the 42 API is subject to [42's API terms of use](https://api.intra.42.fr/apidoc); respect them and the rate limits if you deploy your own instance.

## License

[MIT](LICENSE)