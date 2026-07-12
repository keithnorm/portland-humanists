import type { APIRoute } from 'astro';
import { verifyDrupalPassword } from '../../../lib/drupalHash';
import { readKey, getDirectory } from '../../../lib/membersStore';
import { SESSION_COOKIE } from '../../../lib/identity';

export const prerender = false;

interface BridgeAccount {
  username: string;
  email: string;
  hash: string;
}

// DEV-ONLY twin of netlify/functions/auth-bridge.ts: verifies old-site
// credentials against .data/auth-bridge.json and issues a dev session, so
// the "log in with your old password" flow is testable without a deployed
// Identity instance. Returns 404 in production builds.
export const POST: APIRoute = async ({ request, url }) => {
  if (!import.meta.env.DEV) return new Response('Not found', { status: 404 });

  let login = '', password = '';
  try {
    ({ login = '', password = '' } = await request.json());
  } catch { /* fall through */ }
  login = login.trim().toLowerCase();
  if (!login || !password) return new Response(JSON.stringify({ error: 'missing credentials' }), { status: 400 });

  const accounts = await readKey<BridgeAccount[]>('auth-bridge');
  const account = accounts?.find?.(a => a.email === login || a.username.toLowerCase() === login);
  if (!account || !verifyDrupalPassword(password, account.hash)) {
    return new Response(JSON.stringify({ error: 'Invalid login or password' }), { status: 401 });
  }

  const directory = await getDirectory();
  const name = directory.find(m => m.email?.toLowerCase() === account.email)?.name || account.username;

  const token = `dev:${name}:${account.email}`;
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${secure}`);
  headers.append('Set-Cookie', `hgp_member_display=${encodeURIComponent(name)}; Path=/; SameSite=Lax; Max-Age=3600${secure}`);
  return new Response(JSON.stringify({ ok: true, name }), { status: 200, headers });
};
