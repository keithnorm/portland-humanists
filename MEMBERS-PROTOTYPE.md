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

## Login bridge: old passwords keep working

Members log in with their **old Drupal site username/email and password**.
`netlify/functions/auth-bridge.ts` implements lazy migration:

1. Try Netlify Identity directly (already-migrated members).
2. Otherwise verify the password against the Drupal 7 hash
   (`src/lib/drupalHash.ts`, a port of Drupal's `password.inc`) stored in the
   Blobs `auth-bridge` key — extracted from the Pantheon DB dump by
   `scripts/extract-auth-from-dump.py`.
3. On a match, create the Identity account with that same password via the
   GoTrue admin API and log in. Drupal is out of the loop from then on.

Members without an old website account (or who forget their password) use the
"Forgot your password? / Have an invite?" flow instead. The bridge function is
v1-style on purpose — only v1 handlers receive the Identity admin token.

## Trying it locally

```
# One-time seeding from the Pantheon DB dump:
python3 scripts/extract-members-from-dump.py <dump.sql> --status active
python3 scripts/extract-auth-from-dump.py <dump.sql>

npm run dev   # visit /members, log in with real old-site credentials
```

Dev uses gitignored `.data/*.json` for everything (directory, signups,
auth bridge); `/api/members/login` is the dev twin of the bridge function.
Sign up for a reading, reload, cancel — state persists in `.data/signups.json`.

## Deploying for real (later)

1. Create a Netlify site from this branch (a separate site, not the live one,
   for the committee preview). Copy the Tina env vars from the live site.
2. Enable **Identity** on the site; set registration to **Invite only**.
3. Load the private data into Blobs from your machine:
   ```
   netlify blobs:set members-data directory   --input .data/directory.json
   netlify blobs:set members-data auth-bridge --input .data/auth-bridge.json
   ```
4. Tell members: log in with your old username and password. Invite the
   ~50 active members who never had a website account from the dashboard.
5. Never commit member data to the repo — it is public.

## Notes / open questions

- Identity JWTs last 1 hour; the login page silently refreshes the session
  cookie when you revisit. Acceptable for a weekly-use site.
- Old members site also has: renewal form, newsletters, minutes, bylaws,
  library, photo gallery — shown as "coming later" chips on the dashboard.
  PDFs could be Blobs-served behind the same gate.
- If per-member profile editing is wanted ("update my phone number"), add a
  small form that writes the member's own directory entry.
