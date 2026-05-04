// One-time migration: convert startTime/endTime from 'YYYY-MM-DD HH:mm' to ISO UTC
// Treats existing times as America/Los_Angeles (Pacific).
const { readFileSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');

const files = execSync('ls src/content/events/*.md', { cwd: process.cwd() })
  .toString().trim().split('\n');

const timezone = 'America/Los_Angeles';

function toISO(dateTimeStr) {
  const [date, time] = dateTimeStr.split(' ');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const utcWall = new Date(probe.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzWall = new Date(probe.toLocaleString('en-US', { timeZone: timezone }));
  const offsetMs = utcWall.getTime() - tzWall.getTime();
  return new Date(probe.getTime() + offsetMs).toISOString();
}

let count = 0;
for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  const updated = content.replace(
    /^(startTime|endTime):\s*['"](\d{4}-\d{2}-\d{2} \d{2}:\d{2})['"]/gm,
    (_, field, val) => `${field}: '${toISO(val)}'`
  );
  if (updated !== content) {
    writeFileSync(file, updated);
    count++;
  }
}
console.log(`Migrated ${count} files.`);
