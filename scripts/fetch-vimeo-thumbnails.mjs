#!/usr/bin/env node
// One-time migration: fetches Vimeo thumbnail URLs and stores them in event frontmatter.
// Run from the project root: node scripts/fetch-vimeo-thumbnails.mjs

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const EVENTS_DIR = join(fileURLToPath(import.meta.url), '../../src/content/events');

const files = (await readdir(EVENTS_DIR)).filter(f => f.endsWith('.md'));

let updated = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const filePath = join(EVENTS_DIR, file);
  const content = await readFile(filePath, 'utf8');

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) { skipped++; continue; }
  const frontmatter = fmMatch[1];

  const vimeoIdMatch = frontmatter.match(/^vimeoId:\s*(.+)$/m);
  if (!vimeoIdMatch) { skipped++; continue; }
  if (/^vimeoThumbnail:/m.test(frontmatter)) {
    console.log(`  skip ${file} (already has thumbnail)`);
    skipped++;
    continue;
  }

  const vimeoId = vimeoIdMatch[1].trim().replace(/^["']|["']$/g, '');

  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const thumbnailUrl = data.thumbnail_url;
    if (!thumbnailUrl) throw new Error('No thumbnail_url in response');

    // Insert vimeoThumbnail on the line immediately after vimeoId
    const newContent = content.replace(
      /^(vimeoId:\s*.+)$/m,
      `$1\nvimeoThumbnail: ${thumbnailUrl}`
    );

    await writeFile(filePath, newContent, 'utf8');
    console.log(`✓ ${file}`);
    updated++;
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${failed} failed`);
