# Deploying to Netlify

This site runs on Astro (static) + TinaCMS. The build process is:
`tinacms build` → regenerates the GraphQL client to point at Tina Cloud → `astro build` → outputs to `dist/`.

---

## 1. Tina Cloud — one-time setup at app.tina.io

### Connect your GitHub repo
1. Log in at [app.tina.io](https://app.tina.io)
2. Open your project (client ID: `d3fb1e42-f55a-488c-b542-05cf88701448`)
3. Go to **Configuration** → confirm the GitHub repo and branch (`main`) are connected
4. If not connected, click **Connect to GitHub** and authorize the repo

### Add your Netlify URL as an authorized origin
This is required for visual editing to work on the live site.

1. In your Tina Cloud project, go to **Configuration → Site URLs** (or **Authorized Domains**)
2. Add your Netlify URL, e.g. `https://portland-humanists.netlify.app`
3. If you have a custom domain, add that too (e.g. `https://portlandhumanists.org`)
4. Save

Without this step, the Tina edit toolbar will not appear on the production site.

### Verify your token
1. Go to **Tokens** in the Tina Cloud project settings
2. Copy the **read-only** token (this is correct — write access comes from the GitHub App connection, not the token)
3. This should match what's already in your local `.env` as `TINA_TOKEN`

---

## 2. Netlify — environment variables

In the Netlify dashboard → **Site configuration → Environment variables**, add:

| Variable | Value |
|---|---|
| `TINA_PUBLIC_CLIENT_ID` | `d3fb1e42-f55a-488c-b542-05cf88701448` |
| `TINA_TOKEN` | *(your token from app.tina.io — keep secret)* |

These are already in your local `.env` file. Netlify needs them set separately in the dashboard — it does not read your `.env` file.

---

## 3. Build settings (already in netlify.toml)

These are already configured and committed:

```toml
[build]
  command = "npm run build"   # runs: tinacms build && astro build
  publish = "dist"
```

No changes needed in the Netlify dashboard build settings.

---

## 4. Deploy

Push to `main` — Netlify auto-deploys on every push.

```bash
git add -A
git commit -m "Switch to TinaCMS"
git push origin main
```

Watch the build log in the Netlify dashboard. A successful build looks like:

```
$ npm run build
> tinacms build     ← regenerates client pointing at Tina Cloud
> astro build       ← generates static HTML to dist/
```

If the build fails with a Tina auth error, double-check that `TINA_TOKEN` is set in Netlify env vars.

---

## 5. Post-deploy — test visual editing

1. Visit your live site URL (e.g. `https://portland-humanists.netlify.app/about`)
2. You should see a **Tina** pencil/edit icon in the bottom-left corner
3. Click it → Tina admin sidebar opens on the right
4. Edit a field → the page updates live
5. Click **Save** → Tina commits the change to the `main` branch → Netlify redeploys automatically (takes ~1–2 min)

---

## 6. Tina admin panel

Editors can also use the full admin panel at:

```
https://your-site.netlify.app/admin/index.html
```

This gives the full form-based editor for all collections (Pages, Sunday Programs, Site Settings).

---

## Troubleshooting

**Build error: "Tina Cloud request failed"**
→ Check `TINA_TOKEN` and `TINA_PUBLIC_CLIENT_ID` are set in Netlify env vars

**No edit button on live site**
→ Check that your Netlify URL is added to **Authorized Domains** in the Tina Cloud project settings

**Edit button appears but changes don't save**
→ Confirm your GitHub repo is connected in Tina Cloud (writes go through the GitHub App, not the token)

**Content looks wrong after deploy**
→ `tinacms build` regenerates `tina/__generated__/client.ts` fresh each build — never commit that file with a localhost URL
