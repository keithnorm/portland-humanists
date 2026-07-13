import type { APIRoute } from 'astro';
import {
  validateToken,
  SESSION_COOKIE,
  REFRESH_COOKIE,
  DISPLAY_COOKIE,
  SESSION_MAX_AGE,
} from '../../../lib/identity';

export const prerender = false;

function cookie(name: string, value: string, maxAge: number, secure: string, httpOnly = true) {
  return `${name}=${encodeURIComponent(value)}; Path=/; ${httpOnly ? 'HttpOnly; ' : ''}SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

// Establishes the member session: the login page POSTs the Identity tokens
// here; we validate the access token and store both in HttpOnly cookies.
// The middleware renews the access token via the refresh token, so a login
// lasts SESSION_MAX_AGE per device.
export const POST: APIRoute = async ({ request, url }) => {
  let token: string | undefined, refresh_token: string | undefined;
  try {
    ({ token, refresh_token } = await request.json());
  } catch { /* fall through */ }
  if (!token) return new Response(JSON.stringify({ error: 'missing token' }), { status: 400 });

  const user = await validateToken(token, url.origin);
  if (!user) return new Response(JSON.stringify({ error: 'invalid token' }), { status: 401 });

  const secure = url.protocol === 'https:' ? '; Secure' : '';
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', cookie(SESSION_COOKIE, token, SESSION_MAX_AGE, secure));
  if (refresh_token) headers.append('Set-Cookie', cookie(REFRESH_COOKIE, refresh_token, SESSION_MAX_AGE, secure));
  // Display-only cookie (not HttpOnly): lets the nav on static public pages
  // show the logged-in state. Carries nothing sensitive and grants nothing.
  headers.append('Set-Cookie', cookie(DISPLAY_COOKIE, user.name, SESSION_MAX_AGE, secure, false));
  return new Response(JSON.stringify({ ok: true, user }), { status: 200, headers });
};

export const DELETE: APIRoute = async ({ url }) => {
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', cookie(SESSION_COOKIE, '', 0, secure));
  headers.append('Set-Cookie', cookie(REFRESH_COOKIE, '', 0, secure));
  headers.append('Set-Cookie', cookie(DISPLAY_COOKIE, '', 0, secure, false));
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
