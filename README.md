# Aziki Medical Systems Ltd — website

Corporate website for **Aziki Medical Systems Ltd**, a Nigerian medical equipment
supplier, installer and service provider based in Abuja.

The design follows the structure and tone of the Mindray global site
(mindray.com/en) — full-bleed hero, hover mega-menu, generous whitespace,
image-led category cards, dark corporate footer — recoloured to Aziki's brand
indigo (`#2f3293`) and gold (`#fcc514`), taken from the corporate logo.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** (tokens defined in `src/app/globals.css`, no config file)
- **TypeScript**
- Every route is prerendered as static HTML — no database, no server runtime required.

## Requirements

**Node.js 20.9 or newer** (Node 22 LTS recommended) — `npm` ships with it.
Check what you have:

```bash
node -v
npm -v
```

If either prints `command not found`, install Node first:

- **macOS** — download the macOS installer (`.pkg`) from https://nodejs.org and
  double-click it; no terminal needed. (`brew install node@22` also works, but
  only if you already have Homebrew — it is not preinstalled on macOS.)
- **Windows** — the LTS installer from https://nodejs.org, then reopen the terminal
- **Linux (Debian/Ubuntu)** — `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs`
- **Any OS, multiple versions** — [nvm](https://github.com/nvm-sh/nvm) (or
  [nvm-windows](https://github.com/coreybutler/nvm-windows)), then `nvm use` in
  this folder to pick up the version in `.nvmrc`

## Running it

```bash
cd aziki-medical-website   # the folder containing package.json
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## Project layout

```
src/
  app/
    layout.tsx              root layout, fonts, metadata, JSON-LD
    page.tsx                home
    products/               products index + /products/[slug]
    solutions/              solutions index + /solutions/[slug]
    support/                service & support
    projects/               executed projects
    about/                  company, mission, chairman, leadership, certifications
    contact/                contact details + enquiry form
    icon.png                favicon (generated from the logo)
    sitemap.ts, robots.ts
  components/
    Header.tsx              sticky header, mega menu, mobile drawer
    Footer.tsx
    HomeHero.tsx            homepage hero carousel
    PageHero.tsx            inner-page hero with breadcrumbs
    Sections.tsx            stats, partners, CTA, category cards, pillars
    ContactForm.tsx
    ScrollReveal.tsx        progressive-enhancement scroll animation
    ui.tsx                  buttons, arrow links, section headings
  data/
    site.ts                 ALL site content lives here
public/images/              logo, photography, partner logos, certificates
```

### Editing content

Almost everything the client will want to change — company details, phone
numbers, product categories, services, projects, leadership, partners,
certifications, navigation — is in **`src/data/site.ts`**. Adding a product
category or service to those arrays automatically creates its detail page, adds
it to the mega menu, the footer and the sitemap.

### Images

Photography and the logo were extracted from the company brochure and converted
to WebP in `public/images/`. `imagePosition` on each product category is a
Tailwind `object-position` class, used to crop the same photo differently where
categories share an image.

## Before going live

1. **Contact form backend.** `ContactForm.tsx` currently composes the enquiry and
   opens the visitor's mail client (`mailto:`), so the site works on static
   hosting with no server. Replace `handleSubmit` with a POST to a Next.js API
   route, Formspree, Resend or similar once the client has a mailbox to receive
   submissions.
2. **Founding year.** The brochure states three different dates — "since 1996"
   (cover), "since 1999" / "Founded in 1999" (chairman's message and About), and
   "since 2019" (page 6). The CAC certificate in the brochure incorporates
   *Aziki Medical Systems Ltd* on 10 May 2019 (RC 1583937), while the 2007
   Mindray training certificate names the predecessor firm *Dynamic Medical
   Systems Ltd*. The site currently uses **1999** (`company.founded` in
   `src/data/site.ts`). Confirm with the client and change in one place.
3. **Photography.** The stock and brochure images are placeholders for the real
   thing. Real installation, team and facility photos will lift the site more
   than any code change.
4. **Leadership roles.** Two roles were listed as "Role-in-Organization" in the
   brochure and have been given working titles — confirm before launch.
5. **Domain and analytics.** `siteUrl` in `src/app/layout.tsx` and
   `src/app/sitemap.ts` / `robots.ts` is set to `https://www.azikimedical.com`.

## Deploying to Vercel

No local setup needed — Vercel builds from GitHub.

1. Sign in at [vercel.com](https://vercel.com) with **Continue with GitHub**.
2. **Add New… → Project**, then **Import** this repository. Grant Vercel access
   to it if prompted.
3. Leave every build setting alone. Vercel detects Next.js and uses
   `npm install` / `npm run build` with the repo root as the root directory.
   No environment variables are required for the first deploy.
4. **Deploy.** The first build takes a couple of minutes and ends on a live
   `*.vercel.app` URL.

Every push to the default branch redeploys production automatically; any other
branch or pull request gets its own preview URL.

### Connecting azikimedical.com

1. Project → **Settings → Domains → Add**, enter `www.azikimedical.com` (add
   the apex `azikimedical.com` too and let Vercel redirect it to `www`).
2. Vercel shows the DNS records to create at the domain registrar — usually a
   `CNAME` for `www` and an `A` record for the apex. Propagation is typically
   minutes, and the TLS certificate is issued automatically.
3. Then set `NEXT_PUBLIC_SITE_URL=https://www.azikimedical.com` under
   **Settings → Environment Variables** and redeploy, so canonical URLs,
   Open Graph tags, `sitemap.xml` and `robots.txt` use the real domain. Until
   that variable is set the deployment's own URL is used (see
   `src/lib/site-url.ts` and `.env.example`), so nothing ever points at a
   domain that does not resolve yet.

### Other hosts

Netlify, Cloudflare Pages and Render all work with the default Next.js build
settings (`npm run build`).
