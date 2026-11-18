// Shared display helpers for Sunday programs (homepage, events list, archive).

/**
 * Descriptions often start with a venue note like "From FH." or
 * "From FH and over Zoom." — editor shorthand for where the speaker presents.
 * That reads as noise on the page, so strip it; badges carry the venue instead.
 */
export function cleanDescription(description: string | undefined): string {
  if (!description) return '';
  return description.replace(/^\s*From (FH|Friendly House)( and over Zoom)?\.\s*/i, '').trim();
}

export type AttendanceBadge = { label: string; kind: 'in-person' | 'zoom' | 'remote-speaker' };

/** Badges for how people can attend, derived from the location text. */
export function attendanceBadges(location: string | undefined, speakerRemote?: boolean): AttendanceBadge[] {
  const lower = (location ?? '').toLowerCase();
  const badges: AttendanceBadge[] = [];
  if (lower.includes('friendly house')) badges.push({ label: 'In person · Friendly House', kind: 'in-person' });
  if (lower.includes('zoom')) badges.push({ label: 'Live on Zoom', kind: 'zoom' });
  if (speakerRemote) badges.push({ label: 'Speaker joins remotely', kind: 'remote-speaker' });
  return badges;
}

export type VideoRef = {
  youtubeId?: string;
  vimeoId?: string;
  vimeoHash?: string;
  vimeoThumbnail?: string;
};

export function hasVideo(v: VideoRef): boolean {
  return Boolean(v.youtubeId || v.vimeoId);
}

/** Thumbnail URL for a recording, or undefined if there is none to show. */
export function videoThumbnail(v: VideoRef): string | undefined {
  if (v.youtubeId) return `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
  return v.vimeoThumbnail || undefined;
}

export function videoEmbedUrl(v: VideoRef): string | undefined {
  if (v.youtubeId) return `https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`;
  if (v.vimeoId) return `https://player.vimeo.com/video/${v.vimeoId}?${v.vimeoHash ? `h=${v.vimeoHash}&` : ''}autoplay=1`;
  return undefined;
}

export function videoPageUrl(v: VideoRef): string | undefined {
  if (v.youtubeId) return `https://www.youtube.com/watch?v=${v.youtubeId}`;
  if (v.vimeoId) return `https://vimeo.com/${v.vimeoId}`;
  return undefined;
}

/** A past program this recent with no video yet is probably still being edited. */
export const RECORDING_PENDING_DAYS = 45;

export function initials(name: string | undefined): string {
  if (!name) return '';
  const first = name.split(/,| and | & |\(/)[0].trim();
  const parts = first.split(/\s+/).filter(p => /^[A-Za-z]/.test(p) && !/^(dr|mr|ms|mrs|prof)\.?$/i.test(p));
  return (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
}
