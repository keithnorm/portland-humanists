#!/usr/bin/env node
/**
 * Import the membership list from a saved copy of the old Drupal site's
 * membership page into the members-prototype data store.
 *
 * Usage:
 *   1. In your browser (logged in to the old members site), open the
 *      "Membership list" page (/membership-sortable) and save it:
 *      File > Save Page As... -> .data/raw-members.html
 *      (or: curl -b 'SESSxxx=yyy' <url> > .data/raw-members.html)
 *   2. Preview what would be imported (prints headers + first 3 rows only):
 *      node scripts/import-members.mjs .data/raw-members.html --dry-run
 *   3. If the column mapping looks right, import for the local demo:
 *      node scripts/import-members.mjs .data/raw-members.html
 *      -> writes .data/directory.json (gitignored; used by astro dev)
 *
 * IMPORTANT: never commit the saved HTML or the output JSON — the repo is
 * public. Both live under .data/ which is gitignored.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

// Map old-site column headers (lowercased, trimmed) to MemberRecord fields.
// Adjust after a --dry-run shows the real headers.
const COLUMN_MAP = {
  'name': 'name',
  'member name': 'name',
  'email': 'email',
  'e-mail': 'email',
  'phone': 'phone',
  'telephone': 'phone',
  'city': 'city',
  'member since': 'memberSince',
  'joined': 'memberSince',
  'activities': 'interests',
  'interests': 'interests',
};

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function cellText(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function parseTables(html) {
  const tables = [];
  for (const t of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const rows = [];
    for (const tr of t[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
      const cells = [...tr[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(m => cellText(m[1]));
      if (cells.length) rows.push(cells);
    }
    if (rows.length > 1) tables.push(rows);
  }
  // The membership table is almost certainly the biggest one on the page.
  return tables.sort((a, b) => b.length - a.length)[0] ?? null;
}

const [, , inputPath, ...flags] = process.argv;
const dryRun = flags.includes('--dry-run');

if (!inputPath) {
  console.error('Usage: node scripts/import-members.mjs <saved-page.html> [--dry-run]');
  process.exit(1);
}

const html = await fs.readFile(inputPath, 'utf8');
const rows = parseTables(html);
if (!rows) {
  console.error('No table found in that file. Is it the right page, saved while logged in?');
  process.exit(1);
}

const headers = rows[0].map(h => h.toLowerCase());
const fields = headers.map(h => COLUMN_MAP[h] ?? null);

console.log(`Found table: ${rows.length - 1} data rows`);
console.log('Columns:', headers.map((h, i) => `${h} -> ${fields[i] ?? 'IGNORED'}`).join(' | '));

const members = rows.slice(1).map((cells, i) => {
  const rec = { id: `m${i + 1}` };
  cells.forEach((val, col) => {
    if (fields[col] && val) rec[fields[col]] = val;
  });
  return rec;
}).filter(r => r.name);

console.log(`Mapped ${members.length} members with a name.`);

if (dryRun) {
  console.log('\nFirst 3 records (dry run — nothing written):');
  console.log(JSON.stringify(members.slice(0, 3), null, 2));
  console.log('\nIf columns are mismapped, adjust COLUMN_MAP in this script and re-run.');
} else {
  await fs.mkdir('.data', { recursive: true });
  const out = path.join('.data', 'directory.json');
  await fs.writeFile(out, JSON.stringify(members, null, 2));
  console.log(`Wrote ${out} (gitignored). The local prototype now uses this data.`);
}
