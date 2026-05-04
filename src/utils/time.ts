/**
 * Accepts either an ISO string or a Date (Astro coerces datetime frontmatter fields to Date).
 * The timezone parameter is kept for API compatibility.
 */
export function parseInTimezone(dateTimeStr: Date | string, _timezone?: string): Date {
  return dateTimeStr instanceof Date ? dateTimeStr : new Date(dateTimeStr);
}
