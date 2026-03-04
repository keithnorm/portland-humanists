import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: "d3fb1e42-f55a-488c-b542-05cf88701448",
  token: process.env.TINA_TOKEN as string,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },

  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN as string,
      stopwordLanguages: ['eng'],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100,
  },

  schema: {
    collections: [
      // Sunday Programs / Events
      {
        name: "events",
        label: "Sunday Programs",
        path: "src/content/events",
        format: "md",
        ui: {
          router: ({ document }) => document._sys.filename ? `/events/${document._sys.filename}` : undefined,
          filename: {
            readonly: false,
            slugify: (values) => {
              const date = values?.date
                ? new Date(values.date).toISOString().split("T")[0]
                : "undated";
              const slug = (values?.title ?? "program")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              return `${date}-${slug}`;
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Publish Date",
            required: true,
          },
          {
            type: "string",
            name: "presenter",
            label: "Presenter Name",
            required: true,
          },
          {
            type: "string",
            name: "presenterTitle",
            label: "Presenter Title",
          },
          {
            type: "string",
            name: "startTime",
            label: "Start Time",
            required: true,
            ui: {
              description: "Format: YYYY-MM-DD HH:mm (e.g. 2025-03-02 10:00)",
            },
          },
          {
            type: "string",
            name: "endTime",
            label: "End Time",
            required: true,
            ui: {
              description: "Format: YYYY-MM-DD HH:mm (e.g. 2025-03-02 12:00)",
            },
          },
          {
            type: "string",
            name: "location",
            label: "Location (attendees)",
            required: true,
            ui: {
              description: "Where attendees can join — e.g. 'Friendly House & Zoom' or 'Zoom only'",
            },
          },
          {
            type: "boolean",
            name: "speakerRemote",
            label: "Speaker is remote",
            ui: {
              description: "Check if the speaker is presenting via Zoom rather than in person at Friendly House",
            },
          },
          {
            type: "string",
            name: "zoomLink",
            label: "Zoom Link",
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "image",
            name: "image",
            label: "Featured Image",
          },
          {
            type: "string",
            name: "youtubeId",
            label: "YouTube Video ID",
            ui: {
              description:
                "Add after the event is recorded and uploaded to YouTube",
            },
          },
          {
            type: "string",
            name: "vimeoId",
            label: "Vimeo Video ID",
            ui: {
              description: "Vimeo ID from the video URL (e.g. 991684225)",
            },
          },
          {
            type: "string",
            name: "status",
            label: "Status",
            required: true,
            options: [
              { label: "Upcoming", value: "upcoming" },
              { label: "Past", value: "past" },
            ],
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },

      // Static Pages
      {
        name: "pages",
        label: "Pages",
        path: "src/content/pages",
        format: "md",
        ui: {
          router: ({ document }) => document._sys.filename ? `/${document._sys.filename}` : undefined,
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "pageLayout",
            label: "Page Layout",
            options: [
              { label: "Standard", value: "standard" },
              { label: "About", value: "about" },
            ],
            ui: {
              description:
                "Choose 'about' for pages that need the Ten Commitments grid",
            },
          },
          {
            type: "string",
            name: "parent",
            label: "Parent Page",
            ui: {
              description:
                "For sub-pages: enter the parent page slug (e.g. 'about'). Leave blank for top-level pages.",
            },
          },
          {
            type: "boolean",
            name: "showInNav",
            label: "Show in Navigation",
          },
          {
            type: "number",
            name: "navOrder",
            label: "Navigation Order",
            ui: {
              description: "Lower numbers appear first (e.g. 1, 2, 3...)",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
          {
            type: "object",
            name: "contactInfo",
            label: "Contact Information",
            ui: {
              description: "Only used with the 'about' layout",
            },
            fields: [
              {
                type: "string",
                name: "email",
                label: "Email",
              },
              {
                type: "string",
                name: "location",
                label: "Location Name",
              },
              {
                type: "string",
                name: "address",
                label: "Address",
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
        ],
      },

      // Site Settings
      {
        name: "settings",
        label: "Site Settings",
        path: "src/content/settings",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
          include: "general",
        },
        fields: [
          {
            type: "string",
            name: "siteTitle",
            label: "Site Title",
            required: true,
          },
          {
            type: "string",
            name: "siteDescription",
            label: "Site Description",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "contactEmail",
            label: "Contact Email",
            required: true,
          },
          {
            type: "object",
            name: "socialMedia",
            label: "Social Media Links",
            fields: [
              {
                type: "string",
                name: "facebook",
                label: "Facebook URL",
              },
              {
                type: "string",
                name: "youtube",
                label: "YouTube URL",
              },
              {
                type: "string",
                name: "meetup",
                label: "Meetup URL",
              },
            ],
          },
          {
            type: "string",
            name: "colorTheme",
            label: "Color Theme",
            options: [
              { label: "Navy (Default)", value: "navy" },
              { label: "Teal", value: "teal" },
              { label: "Forest Green", value: "forest" },
              { label: "Slate", value: "slate" },
              { label: "Burgundy", value: "burgundy" },
            ],
            ui: {
              description: "Site-wide color theme for backgrounds, buttons, and accents",
            },
          },
          {
            type: "string",
            name: "customBaseColor",
            label: "Custom Base Color",
            ui: {
              description: "Override the theme with any hex color (e.g. #2d6a4f). All other colors are derived automatically. Leave blank to use the selected theme above.",
            },
          },
          {
            type: "object",
            name: "meetingInfo",
            label: "Meeting Information",
            fields: [
              {
                type: "string",
                name: "time",
                label: "Regular Meeting Time",
              },
              {
                type: "string",
                name: "locationName",
                label: "Location Name",
              },
              {
                type: "string",
                name: "locationAddress",
                label: "Location Address",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "defaultZoomLink",
                label: "Default Zoom Link",
              },
            ],
          },
        ],
      },

      // Join Page
      {
        name: "joinPage",
        label: "Join Page",
        path: "src/content/join",
        format: "json",
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => "/join",
        },
        match: { include: "join" },
        fields: [
          { type: "string", name: "heroHeading", label: "Hero Heading", required: true },
          { type: "string", name: "heroTagline", label: "Hero Tagline", required: true, ui: { component: "textarea" } },
          { type: "string", name: "benefitsHeading", label: "Benefits Heading" },
          {
            type: "object", name: "benefits", label: "Member Benefits", list: true,
            ui: { description: "Checkmark items in the sidebar" },
            fields: [
              { type: "string", name: "title", label: "Title", required: true },
              { type: "string", name: "description", label: "Description", required: true, ui: { component: "textarea" } },
            ],
          },
          { type: "string", name: "personalInfoHeading", label: "Personal Info Section Heading" },
          {
            type: "object", name: "personalFields", label: "Personal Info Form Fields", list: true,
            ui: { description: "Add, remove, or reorder fields in the Personal Information section" },
            fields: [
              { type: "string", name: "label", label: "Field Label", required: true },
              { type: "string", name: "fieldName", label: "Field Name (no spaces)", required: true, ui: { description: "Internal name used for form submission, e.g. firstName, zipCode" } },
              {
                type: "string", name: "fieldType", label: "Field Type",
                options: [
                  { label: "Text", value: "text" },
                  { label: "Email", value: "email" },
                  { label: "Phone", value: "tel" },
                  { label: "Number", value: "number" },
                  { label: "Long Text", value: "textarea" },
                ],
              },
              { type: "boolean", name: "required", label: "Required" },
              { type: "string", name: "placeholder", label: "Placeholder Text" },
            ],
          },
          { type: "string", name: "philosophyText", label: "Philosophical Agreement Text", ui: { component: "textarea" } },
          { type: "string", name: "membershipNote", label: "Membership Note (amber box)", ui: { component: "textarea" } },
          {
            type: "object", name: "membershipTiers", label: "Membership Tiers", list: true,
            ui: { description: "The radio button options for membership level" },
            fields: [
              { type: "string", name: "tierName", label: "Tier Name", required: true },
              { type: "string", name: "tierSubtitle", label: "Subtitle" },
              { type: "string", name: "priceRange", label: "Price Range" },
            ],
          },
          { type: "string", name: "communicationPrefsHeading", label: "Communication Preferences Heading" },
          {
            type: "object", name: "communicationFields", label: "Communication Preference Checkboxes", list: true,
            ui: { description: "Add or remove communication preference checkboxes" },
            fields: [
              { type: "string", name: "label", label: "Label", required: true },
              { type: "string", name: "description", label: "Description" },
              { type: "string", name: "fieldName", label: "Field Name (no spaces)", required: true },
              { type: "boolean", name: "defaultChecked", label: "Checked by default" },
            ],
          },
          { type: "string", name: "questionsHeading", label: "Questions Section Heading" },
          { type: "string", name: "questionsBody", label: "Questions Body Text (before email link)", ui: { component: "textarea" } },
          { type: "string", name: "membershipEmail", label: "Membership Email Address" },
          { type: "string", name: "questionsFootnote", label: "Questions Footnote", ui: { component: "textarea" } },
        ],
      },

      // Homepage content
      {
        name: "homepage",
        label: "Homepage",
        path: "src/content/homepage",
        format: "json",
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => "/",
        },
        match: { include: "home" },
        fields: [
          {
            type: "string",
            name: "heroHeading",
            label: "Hero Heading",
            required: true,
          },
          {
            type: "string",
            name: "heroTagline",
            label: "Hero Tagline",
            required: true,
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "humanismHeading",
            label: "\"What is Humanism?\" Heading",
          },
          {
            type: "string",
            name: "humanismBody1",
            label: "Humanism Paragraph 1",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "humanismBody2",
            label: "Humanism Paragraph 2",
            ui: { component: "textarea" },
          },
          {
            type: "object",
            name: "features",
            label: "Feature Cards",
            list: true,
            ui: { description: "The three value cards (Science & Reason, Community, Compassion)" },
            fields: [
              { type: "string", name: "title", label: "Title", required: true },
              { type: "string", name: "description", label: "Description", required: true, ui: { component: "textarea" } },
            ],
          },
          {
            type: "string",
            name: "ctaHeading",
            label: "CTA Heading",
            ui: { description: "The 'Ready to Join' section heading" },
          },
          {
            type: "string",
            name: "ctaBody",
            label: "CTA Body",
            ui: { component: "textarea" },
          },
        ],
      },
    ],
  },
});
