# Branding Updates - Logo Integration

## Changes Made

### 1. Logo Integration
- **Added logo to navigation header** at [src/components/Navigation.astro](src/components/Navigation.astro)
- Logo displays at `h-12` (48px height) with auto width
- Logo paired with site name on desktop (hidden on smaller screens to save space)
- Logo is clickable and links to homepage

### 2. Color Scheme Update

Updated the entire site to match the navy blue from your logo:

#### New Brand Colors
- **Primary Navy**: `#1e3a5f` (main brand color from logo)
- **Navy Light**: `#2a4d7f` (hover states, lighter navy)
- **Navy Dark**: `#162d4a` (darker accents)
- **Light Blue**: `#4a90e2` (accent from logo figures)
- **Gold**: `#f4b942` (gold/yellow from logo)

#### Created Tailwind Config
File: [tailwind.config.mjs](tailwind.config.mjs)
- Added custom `brand` color palette
- Colors can now be used as: `bg-brand-navy`, `text-brand-navy`, etc.
- Also supports arbitrary values: `bg-[#1e3a5f]`

### 3. Updated Components

#### Navigation ([src/components/Navigation.astro](src/components/Navigation.astro))
- Logo in header
- Site name uses navy: `text-[#1e3a5f]`
- Nav links hover to navy: `hover:text-[#1e3a5f]`
- Active page highlighted in navy
- "Join Us" button: navy background `bg-[#1e3a5f]`
- Dropdown hovers: light blue-grey background `bg-[#e8eef5]`

#### Homepage ([src/pages/index.astro](src/pages/index.astro))
- Hero gradient: `from-[#1e3a5f] via-[#2a4d7f] to-[#4a90e2]`
- Icon backgrounds: light grey-blue `bg-[#e8eef5]`
- Icon colors: navy `text-[#1e3a5f]`
- Links and buttons: navy colors
- CTA buttons match brand

#### About Page ([src/content/pages/about.md](src/content/pages/about.md))
- Hero gradient: `from-[#1e3a5f] to-[#2a4d7f]`
- Ten Commitments cards: light blue-grey background
- Heading colors: dark navy `text-[#162d4a]`

#### Dynamic Pages ([src/pages/[...slug].astro](src/pages/[...slug].astro))
- All text colors updated to navy
- Card backgrounds: light blue-grey
- Consistent with brand throughout

#### Other Pages
- **Events page**: Navy accents and links
- **Recordings page**: Navy colors
- **Join page**: Navy buttons and accents
- **Event detail pages**: Navy throughout

### 4. CMS Configuration
Updated [public/admin/config.yml](public/admin/config.yml):
- Default hero gradient now uses navy colors
- New pages will automatically use brand colors

## Color Mapping

Old (Generic Blue) → New (Logo Navy)
- `blue-600` → `#1e3a5f` (primary)
- `blue-700` → `#1e3a5f` (same as primary)
- `blue-900` → `#162d4a` (darker)
- `indigo-700` → `#2a4d7f` (lighter navy)
- `indigo-800` → `#4a90e2` (light blue accent)
- `blue-100` → `#c8d9ec` (very light)
- `blue-50` → `#f4f7fb` (lightest backgrounds)

## Logo Specs

**File**: `public/logo.png`
**Display**:
- Height: 48px (Tailwind class: `h-12`)
- Width: Auto-scaled to maintain aspect ratio
- Format: PNG with transparent background
- Alt text: "Humanists of Greater Portland"

**Colors Extracted from Logo**:
- Background: Dark navy `#1e3a5f`
- Figures: Light blue `#4a90e2` and Gold `#f4b942`
- Text: Gold `#f4b942`

## Testing

✅ **Navigation**: Logo displays correctly with navy colors
✅ **Homepage**: Hero section uses logo gradient
✅ **About Page**: Ten Commitments grid with navy theme
✅ **Sub-pages**: Dropdowns use navy hover states
✅ **All Pages**: Consistent navy branding throughout
✅ **CMS**: Default colors match brand

## Responsive Behavior

- **Desktop (lg+)**: Logo + site name displayed
- **Mobile/Tablet**: Logo only (name hidden to save space)
- Logo scales proportionally on all screen sizes

## Future Customization

To change colors site-wide, update [tailwind.config.mjs](tailwind.config.mjs):

```js
colors: {
  'brand': {
    'navy': '#1e3a5f',       // Change primary color here
    'navy-light': '#2a4d7f', // Change hover color here
    // ... etc
  },
}
```

Then use these classes throughout the site:
- `bg-brand-navy`
- `text-brand-navy`
- `hover:bg-brand-navy-light`

## Notes

- All changes maintain existing functionality
- Colors are fully editable through CMS for new pages
- Logo file can be replaced at `public/logo.png` without code changes
- Brand colors are now consistently applied across entire site
