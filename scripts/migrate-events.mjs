import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ARCHIVE = './hgp-archive/hgp-site/www.portlandhumanists.org/content';
const OUT = './src/content/events';
const CUTOFF = '2025-01-01';

let count = 0;
let skipped = 0;

for (const file of readdirSync(ARCHIVE).filter(f => f.endsWith('.html'))) {
  const html = readFileSync(join(ARCHIVE, file), 'utf-8');
  if (!html.includes('node-type-vimeo')) { skipped++; continue; }

  // Date from the field-name-field-date section (not the sidebar widget dates)
  const fieldDateSection = html.match(/field-name-field-date[\s\S]{0,500}?content="([^"]+)"/);
  if (!fieldDateSection) { console.warn(`  SKIP (no date): ${file}`); skipped++; continue; }
  const isoDate = fieldDateSection[1];
  const dateOnly = isoDate.slice(0, 10);
  if (dateOnly < CUTOFF) { skipped++; continue; }

  // Title from h1.page-title or <title> tag
  const titleMatch = html.match(/<h1[^>]*class="[^"]*page-title[^"]*"[^>]*>([^<]+)</)
    || html.match(/<title>([^|<]+)/);
  const title = (titleMatch ? titleMatch[1] : file).trim().replace(/ \| .*$/, '').trim();

  // Presenter name — text is in field-item even div (not <p>)
  const presenterMatch = html.match(/field-name-field-presenter[\s\S]{0,400}?field-item even[^>]*>([\s\S]*?)<\/div>/);
  const presenter = presenterMatch
    ? presenterMatch[1].replace(/&amp;/g, '&').replace(/<[^>]+>/g, '').trim()
    : '';

  // Body text — extract only the field-name-body section
  const bodySection = html.match(/field-name-body[\s\S]{0,2000}?field-name-field-presenter/);
  const bodyHtml = bodySection ? bodySection[0] : '';
  const bodyParas = [...bodyHtml.matchAll(/<p[^>]*>([\s\S]+?)<\/p>/g)]
    .map(m => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 10);

  const description = bodyParas[0] || '';
  const allParas = bodyParas.join('\n\n');

  // Video IDs
  const ytMatch = html.match(/youtube\.com\/embed\/([^"?/ ]+)/);
  const vmMatch = html.match(/player\.vimeo\.com\/video\/([^"?/ ]+)/);
  const youtubeId = ytMatch ? ytMatch[1] : '';
  const vimeoId = vmMatch ? vmMatch[1] : '';

  // Slug matching Tina's slugify formula
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filename = `${dateOnly}-${slug}.md`;

  // Escape a string for use in YAML quoted value
  const esc = str => str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '');

  const lines = [
    '---',
    `title: "${esc(title)}"`,
    `date: ${isoDate}`,
    `presenter: "${esc(presenter)}"`,
    `presenterTitle: ""`,
    `startTime: "${dateOnly} 09:45"`,
    `endTime: "${dateOnly} 11:30"`,
    `location: "Friendly House & Zoom"`,
    `description: "${esc(description)}"`,
    youtubeId ? `youtubeId: "${youtubeId}"` : null,
    vimeoId ? `vimeoId: "${vimeoId}"` : null,
    `status: "past"`,
    '---',
    '',
    allParas,
  ].filter(l => l !== null).join('\n');

  writeFileSync(join(OUT, filename), lines);
  console.log(`✓ ${filename}`);
  count++;
}

console.log(`\nDone: ${count} events created, ${skipped} files skipped.`);
