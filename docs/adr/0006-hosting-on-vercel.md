# 0006. Host the app on Vercel for now

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The app has to reach two iPhones over HTTPS: service workers and "Add to Home Screen"
installs need a secure origin (ADR 0005). It is a static build (`dist/`) with client-side
routes. There is no backend yet. The original learning plan includes AWS
(S3 + CloudFront + CDK), but the family needs a working app soon.

## Decision

- Deploy the static build to **Vercel**, connected to the GitHub repository:
  every push to `main` deploys production, every pull request gets a preview URL.
- `vercel.json` makes the setup explicit instead of relying on dashboard settings:
  - all routes rewrite to `index.html` (files that exist are served first), so a deep
    link like `/tareas` works on first load;
  - hashed files in `/assets` are cached for a year (`immutable`), while `index.html`,
    the service worker and the manifest are always revalidated, so updates reach phones;
  - basic security headers (`nosniff`, `Referrer-Policy`, `X-Frame-Options`,
    `Permissions-Policy`);
  - the Cypress binary is not downloaded during the Vercel install.
- GitHub Actions stays the quality gate (lint, types, unit, build, E2E).
- AWS (S3 + CloudFront + Route 53 + ACM with CDK) stays planned as a later learning phase.

## Alternatives considered

- **AWS S3 + CloudFront with CDK now:** the most to learn, but needs an AWS account,
  a certificate and a CloudFront function for SPA routes before anyone can use the app.
- **GitHub Pages:** free, but no custom headers and no proper SPA rewrites
  (needs a `404.html` trick).
- **Netlify / Cloudflare Pages:** equivalent to Vercel; Vercel is already used for the
  portfolio, so there is nothing new to learn just to deploy.

## Consequences

**Positive**

- HTTPS, CDN and preview deployments with almost no setup.
- Caching rules match the service worker: new versions are detected, old assets stay cached.

**Negative**

- Vendor-specific config (`vercel.json`); moving to AWS means translating it
  (CloudFront cache policies and functions).
- A free plan has usage limits (far above what two people need).
- No Content Security Policy yet: the inline anti-flash script needs a hash first
  (planned with the security work).

**When to revisit**

- During the AWS learning phase, or if a backend needs to live next to the frontend.
