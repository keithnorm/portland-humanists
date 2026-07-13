import { defineMiddleware } from 'astro:middleware';
import {
  getUserFromRequest,
  getRefreshToken,
  refreshSession,
  validateToken,
  SESSION_COOKIE,
  REFRESH_COOKIE,
  SESSION_MAX_AGE,
  type MemberUser,
} from './lib/identity';

const PUBLIC_MEMBER_PATHS = new Set(['/members/login', '/api/members/session', '/api/members/login']);

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname.replace(/\/$/, '') || '/';
  const isMemberArea = path.startsWith('/members') || path.startsWith('/api/members');
  if (!isMemberArea || PUBLIC_MEMBER_PATHS.has(path)) return next();

  let user: MemberUser | null = await getUserFromRequest(context.request, context.url.origin);

  // Access token expired (1 hour) — transparently renew with the refresh
  // token so members stay logged in for SESSION_MAX_AGE per device.
  if (!user) {
    const refreshToken = getRefreshToken(context.request);
    if (refreshToken) {
      const renewed = await refreshSession(refreshToken, context.url.origin);
      if (renewed) {
        user = await validateToken(renewed.accessToken, context.url.origin);
        if (user) {
          const opts = {
            path: '/',
            httpOnly: true,
            sameSite: 'lax' as const,
            secure: context.url.protocol === 'https:',
            maxAge: SESSION_MAX_AGE,
          };
          context.cookies.set(SESSION_COOKIE, renewed.accessToken, opts);
          context.cookies.set(REFRESH_COOKIE, renewed.refreshToken, opts);
        }
      }
    }
  }

  if (!user) {
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect(`/members/login?redirect=${encodeURIComponent(context.url.pathname)}`);
  }

  context.locals.member = user;
  return next();
});
