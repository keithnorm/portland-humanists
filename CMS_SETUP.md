# Decap CMS Setup Guide

This guide covers how to use the CMS locally for testing and how to deploy for production use.

## Local Development (For Testing)

### 1. Install Decap Server

```bash
npm install -g decap-server
```

### 2. Run Both Servers

You need two terminal windows running simultaneously:

**Terminal 1 - Astro Dev Server:**
```bash
npm run dev
```

**Terminal 2 - Decap Proxy Server:**
```bash
decap-server
```

### 3. Access the CMS

Open your browser and go to:
```
http://localhost:4321/admin
```

You'll see the Decap CMS interface where you can:
- Add/edit Sunday Programs (events)
- Create new pages
- Update site settings

**Note:** In local mode, changes are made directly to your local files. Commit them to Git when ready.

---

## Production Deployment (For Real Use)

### Step 1: Initialize Git Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial Portland Humanists site"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/portland-humanists.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Netlify

1. **Go to [Netlify](https://netlify.com)** and sign up/login

2. **Click "Add new site" → "Import an existing project"**

3. **Connect to GitHub** and select your `portland-humanists` repository

4. **Build settings** (Netlify should auto-detect these):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

5. **Wait for deployment** - Your site will be live at `https://random-name-123.netlify.app`

### Step 3: Enable Netlify Identity & Git Gateway

1. In Netlify, go to your site dashboard

2. **Enable Identity:**
   - Click "Identity" in the top menu
   - Click "Enable Identity"

3. **Enable Git Gateway:**
   - Still in Identity, click "Settings and usage"
   - Scroll down to "Services" → "Git Gateway"
   - Click "Enable Git Gateway"

4. **Configure Registration (Optional):**
   - Under Identity → Settings → Registration preferences
   - Set to "Invite only" (recommended)

### Step 4: Invite Users

1. In Netlify Identity, click "Invite users"

2. Enter email addresses for people who should have CMS access

3. They'll receive an invitation email to set up their account

4. They can then log in at `https://your-site.netlify.app/admin`

### Step 5: Disable Local Mode

Once deployed, edit `public/admin/config.yml` and comment out the local backend line:

```yaml
# For local development, uncomment the following line:
# local_backend: true
```

Commit and push this change:
```bash
git add public/admin/config.yml
git commit -m "Disable local backend for production"
git push
```

---

## Using the CMS

### Adding a New Sunday Program

1. Log in to `/admin`
2. Click "Sunday Programs" → "New Sunday Programs"
3. Fill in the form:
   - **Title:** The program title
   - **Publish Date:** When it will happen
   - **Presenter Name & Title:** Speaker information
   - **Start/End Time:** Program schedule
   - **Location:** Usually "Friendly House & Zoom"
   - **Zoom Link:** For virtual attendance (optional)
   - **Description:** Short summary (shows in listings)
   - **Featured Image:** Optional banner image
   - **YouTube Video ID:** Add AFTER the event (e.g., "3V4BxC1Tvy0")
   - **Status:** "upcoming" or "past"
   - **Body:** Full program details in markdown

4. Click "Publish" → "Publish now"

### Editing Existing Content

1. Go to `/admin`
2. Click the collection (Sunday Programs, Pages, etc.)
3. Click the item you want to edit
4. Make changes
5. Click "Publish" → "Publish now"

### Managing Past Events

When an event is over:
1. Edit the event
2. Change Status to "past"
3. Add the YouTube Video ID if recorded
4. Update and publish

---

## Custom Domain Setup

1. In Netlify: Domain settings → Add custom domain
2. Add `portlandhumanists.org`
3. Follow DNS configuration instructions
4. Enable HTTPS (automatic via Let's Encrypt)

---

## Troubleshooting

**Problem:** CMS won't load locally
- **Solution:** Make sure both `npm run dev` AND `decap-server` are running

**Problem:** Can't log in to production CMS
- **Solution:** Make sure Netlify Identity is enabled and you've been invited

**Problem:** Changes not showing up
- **Solution:** In production, Netlify needs to rebuild. Check build logs.

**Problem:** "Git Gateway not configured"
- **Solution:** Enable Git Gateway in Netlify Identity settings

---

## Need Help?

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Netlify Identity Documentation](https://docs.netlify.com/visitor-access/identity/)
