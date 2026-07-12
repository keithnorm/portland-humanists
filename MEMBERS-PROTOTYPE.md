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

## Preview deployment (done July 2026)

Keith's fork (`origin/main`) auto-deploys to a preview Netlify site with
Identity enabled and Blobs loaded. Verified end-to-end, including old-password
login.

## Going live: runbook

When the committee approves, moving to the production site
(portlandhumanists.org, deploys from the `hgp` remote):

1. **Fresh data**: download a new **Live**-environment DB backup from
   Pantheon (dashboard.pantheon.io → Backups; the `dev` environment is a
   stale clone — do not use it), then:
   ```
   python3 scripts/extract-members-from-dump.py <dump.sql> --status active
   python3 scripts/extract-auth-from-dump.py <dump.sql>
   python3 scripts/extract-content-from-dump.py <dump.sql>
   ```
2. **Merge the code**: push the prototype history to the live repo
   (`git push hgp main`) — this ends the deliberate origin/hgp divergence.
   Netlify rebuilds the live site; the `/members` routes and the
   `auth-bridge` function deploy with it. No env-var changes needed
   (Tina vars already set; Blobs/functions need none).
3. **Netlify dashboard, live site**:
   - Enable **Identity**; set registration to **Invite only**.
   - Optional: enable Google as an external provider (gives members
     Google-account 2FA, relevant to the RFP's 2FA line).
   - Identity emails send from no-reply@netlify.com (custom sender/templates
     require the Pro plan; fine to skip).
4. **Load Blobs into the LIVE site** (link the CLI to the live site first —
   `npx netlify-cli unlink && npx netlify-cli link`):
   ```
   npx netlify-cli blobs:set members-data directory   --input .data/directory.json
   npx netlify-cli blobs:set members-data auth-bridge --input .data/auth-bridge.json
   npx netlify-cli blobs:set members-data videos      --input .data/videos.json
   npx netlify-cli blobs:set members-data documents   --input .data/documents.json
   ```
5. **Vimeo**: add `portlandhumanists.org` (and `www.`) to the allowed embed
   domains in the HGP Vimeo account settings, or private videos won't play.
6. **Test before announcing**: Keith logs in with old credentials; one
   regular (non-admin) member does the same; make a reading signup; check
   the auth-bridge function log for errors.
7. **Announce**: members log in with their old members-site username/email
   and password. ~56 active members never had a website login — invite them
   from the Identity dashboard ("Forgot your password? / Have an invite?"
   covers both flows on the login page).
8. **Afterwards**: decide the fate of members.portlandhumanists.org
   (currently a DNS CNAME to Pantheon `live-hgp7`) — e.g. repoint it to
   redirect to /members once content migration is complete. The Pantheon
   DB dump and site mirror are archived locally in `hgp-archive/`
   (gitignored). The preview site can be kept as a staging environment.

Reminder: never commit member data — both repos are public. All private data
lives in `.data/` (gitignored) locally and Netlify Blobs in production.

## Notes / open questions

- Identity JWTs last 1 hour; the login page silently refreshes the session
  cookie when you revisit. Acceptable for a weekly-use site.
- Old members site also has: renewal form, newsletters, minutes, bylaws,
  library, photo gallery — shown as "coming later" chips on the dashboard.
  PDFs could be Blobs-served behind the same gate.
- If per-member profile editing is wanted ("update my phone number"), add a
  small form that writes the member's own directory entry.
