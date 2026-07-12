import { defineMiddleware } from 'astro:middleware';
import { getUserFromRequest } from './lib/identity';

const PUBLIC_MEMBER_PATHS = new Set(['/members/login', '/api/members/session', '/api/members/login']);

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname.replace(/\/$/, '') || '/';
  const isMemberArea = path.startsWith('/members') || path.startsWith('/api/members');
  if (!isMemberArea || PUBLIC_MEMBER_PATHS.has(path)) return next();

  const user = await getUserFromRequest(context.request, context.url.origin);
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
