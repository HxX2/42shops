# Contributing to 42 Shops

Thanks for helping out. This guide covers setup and what makes a pull request easy to merge.

## Setup

1. Fork the repo and clone your fork.
2. Create your own 42 OAuth app (see the README) with `http://localhost:3000/api/auth/callback` as a redirect URI.
3. Install and run:

   ```bash
   npm install
   cp .env.example .env.local   # fill in your own credentials
   npm run dev
   ```

Never commit `.env.local` or any secret. It is already in `.gitignore`.

## Before opening a pull request

- Run `npm run typecheck` and `npm run build`; both must pass.
- Keep secrets and API calls in server-only files under `lib/`. Client components must never import `lib/env.ts` or `lib/ft-api.ts`.
- Only pass whitelisted fields from the 42 API to client components.
- Respect the 42 API rate limit. New API calls should go through the cached helpers in `lib/ft-api.ts`.
- Keep animations purposeful and make sure they still work with reduced motion turned on.
- Include a screenshot or short clip for visual changes.

## Commit and PR style

- One focused change per pull request.
- Describe what changed and why in the PR description.
- Reference the related issue if there is one.

## Reporting bugs

Open an issue with the steps to reproduce, what you expected, what happened, and your browser. For security problems, use a private security advisory instead of a public issue.
