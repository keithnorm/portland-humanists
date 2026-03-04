import { defineCollection, z } from 'astro:content';

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    presenter: z.string(),
    presenterTitle: z.string().optional().default(''),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string(),
    speakerRemote: z.boolean().optional().default(false),
    zoomLink: z.string().optional(),
    description: z.string(),
    image: z.string().optional(),
    youtubeId: z.string().optional(),
    vimeoId: z.string().optional(),
    status: z.enum(['upcoming', 'past']).optional(), // deprecated: filtering is now endTime-based
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pageLayout: z.enum(['standard', 'about']).default('standard'),
    heroGradient: z.string().optional(),
    parent: z.string().optional(), // For sub-pages: specify parent page slug
    showInNav: z.boolean().default(false), // Whether to show in navigation
    navOrder: z.number().default(999), // Order in navigation (lower numbers first)
    contactInfo: z.object({
      email: z.string().optional(),
      location: z.string().optional(),
      address: z.string().optional(),
    }).optional(),
  }),
});

export const collections = {
  events,
  pages,
};
