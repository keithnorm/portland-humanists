/**
 * Parse an ISO datetime string into a Date.
 * The timezone parameter is kept for API compatibility but is not needed —
 * ISO strings already encode UTC offset.
 */
export function parseInTimezone(dateTimeStr: string, _timezone?: string): Date {
  return new Date(dateTimeStr);
}
