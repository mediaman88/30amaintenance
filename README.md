# 30A Maintenance

Marketing site for a remodeling and property maintenance business on Scenic 30A,
built to run your Instagram photos as the project gallery.

Next.js 16 · React 19 · Tailwind CSS 4 · deploys to Vercel.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Three things to do before launch, in order:

1. **Edit `site.config.ts`** — phone, email, hours, service area, license
   number. Everything marked `TODO` is a placeholder. This one file drives the
   whole site.
2. **Pull in your Instagram photos** — see below.
3. **Wire up the contact form** — see [Contact form](#contact-form).

---

## Pulling in your Instagram photos

There are two routes. **Option B is faster and has no expiry**, so start there
unless you want the site to keep syncing on its own.

Either way, photos are **downloaded into `public/gallery/` and committed to the
repo**. That's deliberate:

- Instagram's CDN links are signed and expire within days — hotlinking means a
  gallery full of broken images next week.
- Local files are served from Vercel's edge and optimised by `next/image`, so
  the gallery loads far faster.
- Your site keeps working if Instagram is down, if a post gets deleted, or if
  Meta changes the API again.

### Option A — the API (auto-syncing)

Meta shut down the old Instagram Basic Display API on **4 December 2024**. The
current route is the **Instagram API with Instagram Login**, which needs your
account to be a **Business or Creator** account (free to switch, in the
Instagram app under Settings → Account type).

1. Switch `@30a.maintenance` to a Business or Creator account if it isn't
   already.
2. Go to <https://developers.facebook.com/apps> → **Create app** → use case
   **Other** → type **Business**.
3. In the app, add the product **Instagram** → **API setup with Instagram
   login**.
4. Under *Generate access tokens*, connect your Instagram account and generate
   a token. Make sure the `instagram_business_basic` permission is included.
5. Copy `.env.example` to `.env.local` and paste the token in:

   ```bash
   cp .env.example .env.local
   # then set IG_ACCESS_TOKEN=...
   ```

6. Pull the photos:

   ```bash
   npm run sync:instagram
   ```

   Test on a few first with `npm run sync:instagram -- --limit=5`.

7. Commit what it downloaded:

   ```bash
   git add -A && git commit -m "Sync Instagram photos" && git push
   ```

Vercel redeploys on push and the new photos are live.

**About token expiry.** The token from step 4 is short-lived (1 hour). To get a
60-day one, put `IG_SHORT_TOKEN` and `IG_APP_SECRET` in `.env.local` and run
`npm run token:exchange`. Before those 60 days are up, `npm run token:refresh`
extends it another 60. If you let it lapse, just generate a new short-lived
token and exchange it again.

The token only ever lives on your machine — it is **not** needed in Vercel,
because the photos are already in the repo by the time you deploy.

### Option B — the data export (no API, no expiry)

This gets **every photo you've ever posted**, including old ones, with captions
and dates, and needs no developer account at all.

> **Handing this off to someone non-technical?**
> `docs/instagram-export-guide.html` is a plain-English, phone-first walkthrough
> of steps 1–3 below, written for the account owner rather than a developer.
> Open it in a browser or send them the published link.

1. In the Instagram app: **Settings → Accounts Centre → Your information and
   permissions → Download your information**.
2. Request a download of **Posts**, format **JSON**, quality **High**.
3. Meta emails you a zip, usually within a few hours.
4. Unzip it into a folder called `import` in this project.
5. Run it:

   ```bash
   npm run import:export
   ```

6. Commit and push.

The importer handles carousel posts, pulls captions and post dates out of the
export's JSON, and fixes the mangled emoji encoding Instagram's exports are
known for.

### Re-running

Both scripts are safe to re-run. `sync:instagram` skips photos it already has,
so routine syncs only download what's new. Add `--force` to re-download
everything.

### Curating the gallery

The gallery shows everything in `data/instagram.json`. To drop a photo, delete
its entry from that file and delete the file from `public/gallery/`. To change
what a photo says, edit its `caption` / `alt` — the sync script won't overwrite
your edits unless you pass `--force`.

### Filters

The category chips on the gallery page are built from your hashtags. The
mapping lives in `TAG_TO_CATEGORY` in `lib/gallery.ts` — add your own hashtags
there and they'll group correctly. Anything unmapped just shows under "All".
A category needs at least two photos before it appears as a filter.

---

## Contact form

Submissions post to `/api/contact`, which sends mail through
[Resend](https://resend.com) (free tier is plenty for a contact form).

1. Sign up at Resend and verify your sending domain.
2. In Vercel → Project → Settings → Environment Variables, add:
   - `RESEND_API_KEY`
   - `CONTACT_FROM_EMAIL` — an address on your verified domain
3. Redeploy.

Until those are set, the form doesn't pretend to work: it tells the visitor it
couldn't send and shows your email address as a clickable fallback. Nothing is
silently lost.

The endpoint includes a honeypot field, basic rate limiting, and server-side
validation.

---

## Deploying to Vercel

The repo is already Vercel-shaped — no config file needed.

1. Vercel → **Add New → Project** → import this GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Build command and output
   directory need no changes.
3. Add environment variables:
   - `NEXT_PUBLIC_SITE_URL` — your real domain, e.g. `https://30amaintenance.com`
     (this drives canonical URLs, `sitemap.xml`, and link previews)
   - `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` if you're using the form
4. Deploy. Every push to `main` redeploys automatically.

Point your domain at it under Project → Settings → Domains.

---

## Project layout

```
site.config.ts          all business info — edit this first
data/instagram.json     photo manifest (generated by the sync scripts)
public/gallery/         the downloaded photos themselves

app/
  page.tsx              home
  services/             services
  gallery/              photo gallery
  about/                about
  contact/              contact form
  api/contact/route.ts  form handler
  sitemap.ts robots.ts  SEO

components/
  GalleryGrid.tsx       filterable grid + lightbox
  ContactForm.tsx       form with validation
  Header/Footer/…

lib/gallery.ts          reads the manifest, hashtag → category mapping

scripts/
  sync-instagram.mjs    Option A — pull via the API
  import-export.mjs     Option B — pull from a data export
  exchange-token.mjs    short-lived token → 60-day token
  refresh-token.mjs     extend a 60-day token
```

---

## Things worth knowing

- **Photos are the site.** The home page hero uses your most recent photo
  automatically. Until you sync, it falls back to a gradient — nothing breaks,
  but the site is far better with real work on it.
- **Alt text is generated from your captions**, with hashtags, @mentions, links
  and emoji stripped out. Good captions on Instagram give you good accessibility
  and SEO here for free.
- **No fake content.** There are no invented testimonials, review counts, or
  license numbers anywhere in this repo. `testimonials` in `site.config.ts` is
  an empty array and that whole section stays hidden until you add real ones.
  The license badge stays hidden until you fill in `licenseNumber`.
- **Don't commit `.env.local`.** It's gitignored. If a token ever does get
  pushed, revoke it in the Meta dashboard.
