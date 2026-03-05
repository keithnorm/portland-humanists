---
title: "Deploying on Netlify"
description: "Create your Netlify account and deploy the site for the first time"
order: 4
---

Netlify is the service that hosts your website — it's what makes your site available at your domain. Setup takes about 15 minutes.

## How Netlify Credits Work

Netlify uses a credit system to measure usage. The "Personal" plan (currenly $9 per month) includes **1,000 credits per month**. Here's what uses credits:

| Activity | Credit cost |
|----------|------------|
| Each site deploy (content save, code update) | 15 credits |
| Bandwidth | 10 credits per GB served |
| Web requests | 3 credits per 10,000 requests |
| Form submissions (member signup) | 1 credit each |

For a low-traffic organization site that deploys a few times a week, 1,000 credits is comfortably more than enough. As a rough guide: if you deploy 10 times a week (very active), that's 600 credits/month just for deploys — still within your limit with plenty left over for traffic.

Netlify will email you at 50%, 75%, and 100% usage. If you ever hit the limit, the site goes into a paused state until the next billing cycle. You can also enable **auto-recharge** to purchase extra credits automatically if needed (under **Billing → Credits**).

## Step 1: Log In to Netlify

You already have a Netlify Starter plan account. Go to [netlify.com](https://www.netlify.com) and sign in.

If for any reason you need to create a new account, choose **Sign up with GitHub** — this links your accounts automatically and makes the next steps easier.

## Step 2: Import Your Repository

Once you're logged in to Netlify:

1. Click **Add new site** → **Import an existing project**
2. Click **Deploy with GitHub**
3. You may be asked to authorize Netlify to access GitHub — click **Authorize Netlify**
4. You'll see a list of your repositories. Find your HGP repository and click it.

## Step 3: Configure the Build Settings

On the next screen, Netlify asks how to build your site. Enter these settings exactly:

| Setting | Value |
|---------|-------|
| **Branch to deploy** | `main` |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

Leave all other settings at their defaults.

> **Don't click Deploy yet** — you need to complete a few more steps first.

## Step 4: Add Environment Variables

Environment variables are like a private settings panel — they give the site access to external services without putting sensitive information in the code.

Click **Add environment variables** (you'll see this option before deploying, or you can find it later under **Site configuration → Environment variables**).

You need to add four variables. You'll get the Tina values in the [next section](/docs/tina-setup), but you can set up the PayPal one now:

| Variable name | What it is | Where to get it |
|---------------|-----------|----------------|
| `TINA_PUBLIC_CLIENT_ID` | Identifies your Tina Cloud project | app.tina.io → your project → Settings → Configuration |
| `TINA_TOKEN` | Allows the site to read content from Tina Cloud | [Tina Cloud setup →](/docs/tina-setup) |
| `TINA_SEARCH_TOKEN` | Powers the search on your Past Programs page | [Tina Cloud setup →](/docs/tina-setup) |
| `PUBLIC_PAYPAL_CLIENT_ID` | Powers the PayPal buttons on the Join page | See below |

### Getting your PayPal Client ID

1. Go to [developer.paypal.com](https://developer.paypal.com) and log in with your PayPal business account
2. Click **Apps & Credentials**
3. Make sure the toggle in the top right is set to **Live** (not Sandbox)
4. Click your app, or create a new one if needed
5. Copy the **Client ID** — paste it as the value for `PUBLIC_PAYPAL_CLIENT_ID`

> **Sandbox vs. Live:** Sandbox uses fake money for testing. The live site needs the **Live** Client ID so real payments go through.

## Step 5: Enable Forms

Your site has a member signup form on the Join page that submits through Netlify. Form detection happens during the build, so you need to enable it **before** deploying.

1. Go to **Site configuration** → **Forms**
2. Confirm that form detection is **enabled**

After your first deploy, any form submissions will appear under **Forms** in the main Netlify navigation. Your Starter plan includes 100 form submissions per month — more than enough for a membership signup form.

## Step 6: Deploy the Site

Now you're ready. Click **Deploy site**. Netlify will start building your site. This takes about 60–90 seconds.

## Step 7: Analytics (optional)


Your Starter plan includes basic site metrics (visitor counts, page views) with a 7-day lookback window. To access them:

1. Click **Analytics** in the Netlify sidebar

A more detailed server-side Web Analytics add-on may also be available — check [Netlify's pricing page](https://www.netlify.com/pricing/) for current details.

## Step 8: Connect Your Custom Domain (optional, do later)


Once the site is working on the Netlify subdomain, you can point your real domain (portlandhumanists.org) to Netlify:

1. **Site configuration** → **Domain management** → **Add a domain**
2. Enter your domain name
3. Netlify will give you instructions for updating your DNS settings with your domain registrar (wherever you bought the domain)
4. DNS changes can take up to 48 hours to propagate, but usually happen within a few hours

---

**Next step:** [Managing Your Site →](/docs/managing-content)
