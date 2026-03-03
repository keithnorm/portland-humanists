/**
 * fix-speaker-remote.mjs
 *
 * Migrates existing event files where `location: Zoom` (meaning the speaker
 * is remote) to:
 *   - location: "Friendly House & Zoom"  (attendees can still come in person)
 *   - speakerRemote: true
 *
 * Run: node scripts/fix-speaker-remote.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const EVENTS_DIR = './src/content/events';

const files = readdirSync(EVENTS_DIR).filter(f => f.endsWith('.md'));
let updated = 0;

for (const file of files) {
  const filePath = join(EVENTS_DIR, file);
  const content = readFileSync(filePath, 'utf-8');

  // Match frontmatter location field that is exactly "Zoom" (case-insensitive, optional quotes)
  const locationMatch = content.match(/^location:\s*["']?(.+?)["']?\s*$/m);
  if (!locationMatch) continue;

  const locationValue = locationMatch[1].trim();
  if (locationValue.toLowerCase() !== 'zoom') continue;

  // Already has speakerRemote? Skip.
  if (/^speakerRemote:/m.test(content)) {
    console.log(`⚠ skipped (already has speakerRemote): ${file}`);
    continue;
  }

  // Replace the location line and insert speakerRemote after it
  const updated_content = content.replace(
    /^(location:\s*["']?).+?(["']?\s*)$/m,
    `location: "Friendly House & Zoom"\nspeakerRemote: true`
  );

  writeFileSync(filePath, updated_content);
  console.log(`✓ updated: ${file}`);
  updated++;
}

console.log(`\nDone — updated ${updated} of ${files.length} event files.`);
