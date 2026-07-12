import type { APIRoute } from 'astro';
import { validateToken, SESSION_COOKIE } from '../../../lib/identity';

export const prerender = false;

// Establishes the member session: the login page POSTs the Identity JWT
// here; we validate it and store it in an HttpOnly cookie for SSR gating.
export const POST: APIRoute = async ({ request, url }) => {
  let token: string | undefined;
  try {
    ({ token } = await request.json());
  } catch { /* fall through */ }
  if (!token) return new Response(JSON.stringify({ error: 'missing token' }), { status: 400 });

  const user = await validateToken(token, url.origin);
  if (!user) return new Response(JSON.stringify({ error: 'invalid token' }), { status: 401 });

  const secure = url.protocol === 'https:' ? '; Secure' : '';
  return new Response(JSON.stringify({ ok: true, user }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Identity JWTs expire after 1 hour; the login page silently refreshes.
      'Set-Cookie': `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${secure}`,
    },
  });
};

export const DELETE: APIRoute = async ({ url }) => {
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
    },
  });
};
