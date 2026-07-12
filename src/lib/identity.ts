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
