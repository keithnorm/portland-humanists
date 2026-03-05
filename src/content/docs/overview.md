---
title: "How This Site Works"
description: "An overview of the technology behind your new website"
order: 1
---

Welcome! This guide will walk you through everything you need to get your new site fully set up.

## The Big Picture

Your new site is built with a set of modern tools that work together. Here's how to think about each one:

| Service | What it does | You'll visit |
|---------|-------------|--------------|
| **GitHub** | Stores all the site's code and content | github.com |
| **Netlify** | Hosts the website — makes it available at your domain | netlify.com |
| **Tina Cloud** | Powers the CMS editor your team uses to update content | tina.io |
| **Vimeo / YouTube** | Hosts your video recordings (linked from events) | vimeo.com or youtube.com |

## How They Connect

![Architecture diagram showing how Tina CMS, GitHub, Netlify, and your domain connect](/architecture.png)

When your team adds or edits content through the CMS editor:

1. You make a change in **Tina CMS** (e.g., add a new Sunday program)
2. Tina saves the change as a file in your **GitHub** repository
3. **Netlify** automatically detects the new commit and starts a build
4. About 60 seconds later, the updated site is live at your domain

No one needs to manually deploy anything. It's fully automatic.

## What This Guide Covers

The remaining steps — which you'll do on your own accounts — are:

1. [Getting the Code into Your GitHub](/docs/github)
2. [Setting Up Tina CMS](/docs/tina-setup)
3. [Deploying Your Site on Netlify](/docs/netlify-setup)
4. [Managing Your Site Day-to-Day](/docs/managing-content)

Each section is a step-by-step walkthrough. You can bookmark this page and return to it anytime.
