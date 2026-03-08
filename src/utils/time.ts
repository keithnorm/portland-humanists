/**
 * Parse a naive datetime string ("YYYY-MM-DD HH:mm") as if it's in the given IANA timezone.
 * Returns a proper UTC Date.
 */
export function parseInTimezone(dateTimeStr: string, timezone: string): Date {
  const [date, time] = dateTimeStr.split(' ');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  // Treat the naive time as UTC to get a probe timestamp
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Compute the wall-clock difference between UTC and the target timezone at this moment
  const utcWall = new Date(probe.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzWall = new Date(probe.toLocaleString('en-US', { timeZone: timezone }));
  const offsetMs = utcWall.getTime() - tzWall.getTime();

  return new Date(probe.getTime() + offsetMs);
}
