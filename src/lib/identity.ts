/**
 * Netlify Identity session handling for members-only pages.
 *
 * The login page obtains a JWT from the Identity widget and POSTs it to
 * /api/members/session, which validates it and sets an HttpOnly cookie.
 * This module validates that cookie on each request (SSR middleware).
 *
 * In dev (`astro dev` / `netlify dev` locally), a "dev" token is accepted
 * so the prototype can be demoed without Identity enabled on a real site.
 */

export interface MemberUser {
  id: string;
  email: string;
  name: string;
}

export const SESSION_COOKIE = 'hgp_member_session';
export const REFRESH_COOKIE = 'hgp_member_refresh';
export const DISPLAY_COOKIE = 'hgp_member_display';
/** How long a login lasts on a device (refresh-token cookie lifetime). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const DEV_TOKEN_PREFIX = 'dev:';

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

/** Validate an Identity JWT against the site's GoTrue endpoint. */
export async function validateToken(token: string, origin: string): Promise<MemberUser | null> {
  if (import.meta.env.DEV && token.startsWith(DEV_TOKEN_PREFIX)) {
    const [, name, email] = token.split(':');
    return { id: 'dev-user', name: name || 'Dev Member', email: email || 'dev@example.org' };
  }
  // Allow overriding the Identity endpoint (e.g. testing a branch deploy
  // against the production site's Identity instance).
  const apiBase = import.meta.env.IDENTITY_API_URL || `${origin}/.netlify/identity`;
  try {
    const res = await fetch(`${apiBase}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
    };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: Request, origin: string): Promise<MemberUser | null> {
  const token = parseCookies(request.headers.get('cookie'))[SESSION_COOKIE];
  if (!token) return null;
  return validateToken(token, origin);
}

export function getRefreshToken(request: Request): string | null {
  return parseCookies(request.headers.get('cookie'))[REFRESH_COOKIE] ?? null;
}

/** Exchange a refresh token for a new access token (GoTrue rotates the
    refresh token on every use — always store the returned one). */
export async function refreshSession(
  refreshToken: string,
  origin: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const apiBase = import.meta.env.IDENTITY_API_URL || `${origin}/.netlify/identity`;
  try {
    const res = await fetch(`${apiBase}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const tokens = await res.json();
    return { accessToken: tokens.access_token, refreshToken: tokens.refresh_token };
  } catch {
    return null;
  }
}
