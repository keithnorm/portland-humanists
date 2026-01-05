# Sub-Pages and Dynamic Navigation Guide

Your site now supports hierarchical pages with automatic sub-navigation! Here's how it works:

## How Sub-Pages Work

### Creating a Top-Level Page
When you create a page in the CMS without specifying a parent, it becomes a top-level page:

```yaml
---
title: About Us
parent: # Leave blank for top-level
showInNav: true
navOrder: 2
---
```

### Creating a Sub-Page
To make a page a child of another page, set the `parent` field to the parent's slug:

```yaml
---
title: Our History
parent: about  # This makes it a child of /about
showInNav: true
navOrder: 1
---
```

The sub-page will be accessible at `/our-history` (not `/about/our-history`).

## Navigation Fields

### Parent Page
- **Field**: `parent`
- **Type**: Text (optional)
- **Usage**: Enter the parent page slug (e.g., "about")
- **Leave blank** for top-level pages

### Show in Navigation
- **Field**: `showInNav`
- **Type**: Boolean
- **Default**: `true`
- **Usage**: Uncheck to hide a page from the navigation menu

### Navigation Order
- **Field**: `navOrder`
- **Type**: Number
- **Default**: `999`
- **Usage**: Lower numbers appear first (1, 2, 3...)
- **Note**: Sub-pages are also ordered within their dropdown

## How the Navigation Works

1. **Automatic Dropdown Menus**: When a page has children, a dropdown arrow appears
2. **Hover to Reveal**: Hover over the parent to see sub-pages
3. **Sorted Order**: Pages appear in order based on `navOrder`
4. **Active States**: Current page is highlighted in blue

## Examples

### Example 1: About Section with Sub-Pages

**Parent Page** (`about.md`):
```yaml
---
title: About Us
showInNav: true
navOrder: 2
# No parent = top-level page
---
```

**Child Pages**:
```yaml
# our-history.md
---
title: Our History
parent: about
navOrder: 1
---

# our-team.md
---
title: Our Team
parent: about
navOrder: 2
---

# our-values.md
---
title: Our Values
parent: about
navOrder: 3
---
```

**Result**: Navigation shows "About Us" with dropdown containing:
- Our History
- Our Team
- Our Values

### Example 2: Resources Section

```yaml
# resources.md
---
title: Resources
showInNav: true
navOrder: 4
---

# recommended-reading.md
---
title: Recommended Reading
parent: resources
---

# local-groups.md
---
title: Local Groups
parent: resources
---
```

**Result**: "Resources" dropdown with "Recommended Reading" and "Local Groups"

## Creating Sub-Pages in Decap CMS

1. Go to `/admin`
2. Click **"Pages"** → **"New Pages"**
3. Fill in the fields:
   - **Title**: Your page title
   - **Description**: Brief description
   - **Page Layout**: Choose "standard" or "about"
   - **Parent Page**: Enter parent slug (e.g., "about")
   - **Show in Navigation**: Check to show in nav
   - **Navigation Order**: Set order (1, 2, 3...)
4. Click **"Publish"** → **"Publish now"**

## URL Structure

- **Top-level pages**: `/page-name`
- **Sub-pages**: `/sub-page-name` (NOT `/parent/sub-page`)

Sub-pages are "flat" in the URL structure but hierarchical in the navigation.

## Navigation Order Reference

Current static navigation items:
- **Home**: `navOrder: 1`
- **Events**: `navOrder: 3`
- **Recordings**: `navOrder: 4`
- **Join Us**: `navOrder: 5`

Your custom pages with `navOrder: 2` will appear between Home and Events.

## Tips

1. **Keep It Simple**: 1-2 levels of hierarchy is usually enough
2. **Consistent Ordering**: Use gaps (10, 20, 30) so you can insert pages later
3. **Hide Drafts**: Set `showInNav: false` for pages you're working on
4. **Test Locally**: Changes are immediate when using `decap-server`

## Troubleshooting

**Sub-page doesn't show in dropdown?**
- Check that `parent` field matches the parent's slug exactly
- Ensure `showInNav` is `true`
- Verify the parent page exists

**Navigation order is wrong?**
- Lower `navOrder` numbers appear first
- Check for duplicate numbers
- Default is `999` if not specified

**Dropdown doesn't work?**
- This is hover-based on desktop
- May need mobile menu implementation for phone users
