# GitHub OAuth Setup for Decap CMS

This guide walks you through setting up GitHub OAuth authentication for Decap CMS, replacing the deprecated Netlify Identity.

## Why GitHub OAuth?

- ✅ **Free and actively maintained** - No cost, no deprecation concerns
- ✅ **Simple setup** - No additional services needed
- ✅ **Secure** - Users authenticate with GitHub, no password management
- ✅ **Direct repo access** - Users need repo access to edit content (good security model)

## Prerequisites

- GitHub account with access to `keithnorm/portland-humanists` repository
- Netlify site deployed at: `https://bejewelled-mermaid-b48033.netlify.app`

---

## Step 1: Create GitHub OAuth App

1. **Go to GitHub OAuth Apps settings:**
   - Visit: https://github.com/settings/developers
   - Click **"OAuth Apps"** in the left sidebar
   - Click **"New OAuth App"** button

2. **Fill in the application details:**

   ```
   Application name: Portland Humanists CMS
   Homepage URL: https://bejewelled-mermaid-b48033.netlify.app
   Application description: Content management for Portland Humanists website
   Authorization callback URL: https://api.netlify.com/auth/done
   ```

   ⚠️ **Important:** The callback URL must be exactly `https://api.netlify.com/auth/done`

3. **Click "Register application"**

4. **Save your credentials:**
   - You'll see a **Client ID** - copy this
   - Click **"Generate a new client secret"**
   - Copy the **Client Secret** immediately (you can't see it again!)

---

## Step 2: Configure Netlify with OAuth Credentials

1. **Go to your Netlify site dashboard:**
   - Visit: https://app.netlify.com/sites/bejewelled-mermaid-b48033/configuration/general

2. **Navigate to Access & security → OAuth:**
   - In the left sidebar, click **"Access & security"**
   - Scroll down to **"OAuth"** section
   - Click **"Install provider"**

3. **Add GitHub as a provider:**
   - Select **"GitHub"** from the provider list
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Click **"Install"**

---

## Step 3: Grant Repository Access to CMS Users

Users who need to edit content must have write access to the GitHub repository.

### To add a new CMS user:

1. **Go to repository settings:**
   - Visit: https://github.com/keithnorm/portland-humanists/settings/access

2. **Click "Invite a collaborator"**

3. **Enter their GitHub username** and select permission level:
   - **Write** - Can edit content via CMS (recommended for most users)
   - **Admin** - Full control (for administrators only)

4. **They'll receive an email invitation** to accept

### Important Notes:

- ✅ Users must have a GitHub account
- ✅ Users must accept the repository invitation before accessing CMS
- ✅ You can revoke access anytime by removing them as collaborators
- ✅ All edits are tracked with their GitHub username (great audit trail!)

---

## Step 4: Test the CMS

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Switch to GitHub OAuth backend for Decap CMS"
   git push
   ```

2. **Wait for Netlify to deploy** (1-2 minutes)

3. **Visit the CMS:**
   - Go to: https://bejewelled-mermaid-b48033.netlify.app/admin/
   - Click **"Login with GitHub"**
   - Authorize the OAuth app
   - You should see the CMS dashboard!

---

## Step 5: Disable Netlify Identity (Optional Cleanup)

Since you're no longer using Netlify Identity, you can disable it:

1. Go to: https://app.netlify.com/sites/bejewelled-mermaid-b48033/identity
2. Click **"Settings and usage"**
3. Scroll down and click **"Disable Identity"**

This prevents confusion and removes unused services.

---

## Local Development

For local development with `npx decap-server`:

1. **Uncomment the local backend line in `public/admin/config.yml`:**
   ```yaml
   # For local development with decap-server, uncomment the following line:
   local_backend: true
   ```

2. **Run the development server:**
   ```bash
   npx decap-server
   ```

3. **In another terminal, run Astro:**
   ```bash
   npm run dev
   ```

4. **Visit:** http://localhost:4321/admin/
   - Login with any email (it's bypassed in local mode)

5. **Remember to comment out `local_backend: true` before pushing to production!**

---

## Troubleshooting

### "Error: Failed to load settings from /.netlify/identity"
- This error is harmless - it's looking for the old Identity config
- Can be ignored since you're using GitHub OAuth now

### "Unable to access - check your repo permissions"
- Make sure you've been added as a collaborator to the repository
- Check that you accepted the GitHub repository invitation

### "OAuth app not found"
- Verify the OAuth app callback URL is exactly: `https://api.netlify.com/auth/done`
- Make sure you installed the provider in Netlify's OAuth settings

### Changes not appearing on the site
- Check that your commit was successful in GitHub
- Verify Netlify deployed successfully (check the Deploys tab)
- Clear your browser cache

---

## User Management Summary

**To give someone CMS access:**
1. Add them as a collaborator to the GitHub repo (Write permission)
2. Share the CMS URL: `https://bejewelled-mermaid-b48033.netlify.app/admin/`
3. They login with their GitHub account

**To remove CMS access:**
1. Remove them as a collaborator from the GitHub repo

**Benefits of this approach:**
- ✅ No invitation emails to manage
- ✅ No separate password system
- ✅ Users already have GitHub accounts (or can create free ones)
- ✅ Clear audit trail of who edited what
- ✅ No deprecated services to worry about

---

## Next Steps

1. ✅ Create GitHub OAuth App (Step 1)
2. ✅ Configure Netlify OAuth (Step 2)
3. ✅ Commit and push changes
4. ✅ Test CMS access
5. ✅ Add client collaborators to repository
6. ✅ Clean up by disabling Netlify Identity

That's it! Your CMS is now using modern, maintained authentication that will work long-term.
