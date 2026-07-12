# Members-Only Area — Prototype

Prototype of the members-only functionality for HGP: member login, membership
list, reading sign-up sheets, and members-only videos. Lives on the
`members-prototype` branch; not deployed to the live site.

## Architecture (all-Netlify, no new vendors)

| Concern | Choice | Why |
| --- | --- | --- |
| Login | **Netlify Identity** (invite-only) | Free, unlimited invite-only users, managed from the Netlify dashboard. Deprecation was reversed Feb 2026 — it is a supported product. |
| Private data | **Netlify Blobs** (`members-data` store) | Zero-provisioning JSON store, works on all plans. The repo is public, so member contact info can never live in git/Tina. Exportable as plain JSON — minimal lock-in. |
| Videos | Unlisted YouTube, list stored in Blobs | Unlisted IDs must not be committed to the public repo. |
| Gating | Astro middleware (`src/middleware.ts`) | Validates the Identity JWT (HttpOnly cookie) on every `/members/*` and `/api/members/*` request. |

## Pages

- `/members/login` — Identity widget login (plus a dev-only fake login in `astro dev`)
- `/members` — dashboard; also previews old-site sections to migrate later
- `/members/directory` — searchable membership list
- `/members/readings` — sign-up sheet for readings at upcoming Sunday programs (one reader per program, self-service cancel)
- `/members/videos` — members-only recordings

## Trying it locally

```
npm run dev   # then visit /members — use the orange "dev-only login"
```

Data reads/writes fall back to gitignored `.data/*.json` locally; seed data is
fake. Sign up for a reading, reload, cancel — state persists in `.data/signups.json`.

## Deploying for real (later)

1. Enable **Identity** on the Netlify site; set registration to **Invite only**.
2. Invite members by email from the Netlify dashboard (Site → Identity).
3. Netlify Blobs needs no setup; the `members-data` store is created on first write.
4. Load real data into Blobs (directory, videos) with a local import script —
   e.g. scraped from the old members site with an authenticated session. Never
   commit member data to the repo.

## Notes / open questions

- Identity JWTs last 1 hour; the login page silently refreshes the session
  cookie when you revisit. Acceptable for a weekly-use site.
- Old members site also has: renewal form, newsletters, minutes, bylaws,
  library, photo gallery — shown as "coming later" chips on the dashboard.
  PDFs could be Blobs-served behind the same gate.
- If per-member profile editing is wanted ("update my phone number"), add a
  small form that writes the member's own directory entry.
