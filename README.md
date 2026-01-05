# Portland Humanists Website - Proof of Concept

A modern, static website built with Astro, Tailwind CSS, and Decap CMS for the Humanists of Greater Portland.

## Features

- 🚀 **Fast & Modern**: Built with Astro for optimal performance
- 🎨 **Beautiful Design**: Custom Tailwind CSS theme with mobile-first responsive design
- ✏️ **Easy Content Management**: Decap CMS for non-technical content editing
- 📅 **Event Management**: Showcase upcoming Sunday programs with details and Zoom links
- 🎥 **YouTube Integration**: Display past program recordings
- 💳 **Streamlined Membership**: Modern signup flow with integrated payment
- 📱 **Mobile Friendly**: Fully responsive design that works on all devices

## Project Structure

```
/
├── public/
│   ├── admin/           # Decap CMS admin interface
│   └── uploads/         # Media uploads from CMS
├── src/
│   ├── content/         # Content collections
│   │   ├── events/      # Sunday programs/events
│   │   ├── pages/       # Static pages
│   │   └── settings/    # Site settings
│   ├── layouts/         # Layout components
│   │   └── BaseLayout.astro
│   ├── pages/           # Route pages
│   │   ├── index.astro        # Homepage
│   │   ├── events.astro       # Events listing
│   │   ├── recordings.astro   # Past recordings
│   │   ├── join.astro         # Membership signup
│   │   └── about.astro        # About page
│   └── styles/          # Global styles
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Start the dev server:

```bash
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321) to see the site.

### Content Management

Access the CMS at [http://localhost:4321/admin](http://localhost:4321/admin)

**Note**: For local development, you'll need to enable local backend mode in the CMS config.

## Deployment to Netlify

### Quick Deploy

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Netlify will automatically detect the build settings from `netlify.toml`
4. Deploy!

### Enable Decap CMS Authentication

After deploying to Netlify:

1. Go to Netlify dashboard → Site settings → Identity
2. Enable Identity service
3. Set registration to "Invite only"
4. Enable Git Gateway under Services
5. Invite users who should have CMS access

## Key Pages

- **Homepage** (`/`): Hero section, what is humanism, featured upcoming event, recent recordings
- **Events** (`/events`): List of all Sunday programs (upcoming and past)
- **Recordings** (`/recordings`): Archive of YouTube recordings
- **Join** (`/join`): Membership signup form with payment integration
- **About** (`/about`): Information about the organization

## Content Management

### Adding a New Event

1. Go to `/admin` in your browser
2. Click "Sunday Programs"
3. Click "New Sunday Programs"
4. Fill in the event details:
   - Title, date, presenter information
   - Start/end times
   - Zoom link
   - Description
5. Set status to "upcoming" or "past"
6. After recording, add the YouTube video ID
7. Save and publish

### Editing Site Settings

1. Go to `/admin`
2. Click "Site Settings"
3. Update contact info, social media links, meeting details
4. Save changes

## Technology Stack

- **[Astro](https://astro.build)**: Modern static site generator
- **[Tailwind CSS](https://tailwindcss.com)**: Utility-first CSS framework
- **[Decap CMS](https://decapcms.org)**: Git-based content management
- **[Netlify](https://netlify.com)**: Hosting and deployment

## Benefits Over Drupal

### Cost Savings
- ✅ No $20k upgrade cost
- ✅ Free hosting on Netlify
- ✅ No ongoing maintenance costs
- ✅ No security patches required

### Performance
- ✅ Lightning-fast static site
- ✅ Better SEO with instant page loads
- ✅ Works perfectly on mobile devices
- ✅ No database queries = faster response

### Ease of Use
- ✅ Simple, intuitive CMS interface
- ✅ Content editing doesn't require technical knowledge
- ✅ Live preview of changes
- ✅ Version control built-in with Git

### Security
- ✅ No server-side code = no vulnerabilities
- ✅ No database to hack
- ✅ Automatic HTTPS
- ✅ DDoS protection included

## What You Keep from Drupal

- ✅ Event management and calendar
- ✅ Content pages (About, etc.)
- ✅ Member signup and management
- ✅ YouTube video integration
- ✅ Contact forms
- ✅ All your existing content (migrated)

## Future Enhancements

Possible additions after proof of concept approval:

- Calendar integration (Google Calendar, iCal)
- Newsletter signup with Mailchimp/SendGrid
- Discussion forum integration
- Advanced search functionality
- Member portal with login
- Donation integration (Stripe/PayPal)
- Event RSVP system

## Support

For questions or issues, contact [your-email@example.com]

## License

© 2025 Humanists of Greater Portland. All rights reserved.
