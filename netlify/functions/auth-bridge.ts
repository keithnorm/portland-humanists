/**
 * Lazy-migration login bridge (production only; dev uses /api/members/login).
 *
 * Members log in with their old Drupal site credentials (username or email +
 * password). Flow:
 *   1. Resolve the login to an email and try Netlify Identity directly —
 *      already-migrated members authenticate normally.
 *   2. Otherwise verify the password against the Drupal 7 hash held in the
 *      Netlify Blobs `auth-bridge` key.
 *   3. On a match, create the Identity account with that same password via
 *      the GoTrue admin API (admin token comes from the function's Identity
 *      client context), then log in as usual.
 *
 * After first login the account lives entirely in Netlify Identity; the
 * Drupal hash is never consulted again for that member.
 *
 * v1 function signature on purpose: clientContext.identity (admin token) is
 * only provided to v1-style handlers.
 */
import type { Handler } from '@netlify/functions';
import { connectLambda, getStore } from '@netlify/blobs';
import { verifyDrupalPassword } from '../../src/lib/drupalHash';

interface BridgeAccount {
  username: string;
  email: string;
  hash: string;
}

const fail = (status: number, error: string) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ error }),
});

async function tokenGrant(identityUrl: string, email: string, password: string) {
  const res = await fetch(`${identityUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'password', username: email, password }),
  });
  return res.ok ? res.json() : null;
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') return fail(405, 'method not allowed');

  // v1 (Lambda-compat) functions don't get automatic Blobs configuration;
  // this reads the Blobs context from the event. (v1 is required here for
  // clientContext.identity — see header comment.)
  connectLambda(event as any);

  const identity = (context.clientContext as any)?.identity as { url: string; token: string } | undefined;
  if (!identity?.url) return fail(500, 'Identity is not enabled for this site');

  let login = '', password = '';
  try {
    ({ login = '', password = '' } = JSON.parse(event.body || '{}'));
  } catch { /* fall through to validation */ }
  login = login.trim().toLowerCase();
  if (!login || !password) return fail(400, 'missing credentials');

  const store = getStore('members-data');
  const accounts = ((await store.get('auth-bridge', { type: 'json' })) ?? []) as BridgeAccount[];
  const account = accounts.find(
    a => a.email === login || a.username.toLowerCase() === login
  );
  const email = login.includes('@') ? login : account?.email;

  // Already migrated (or Identity-native) members log in directly.
  if (email) {
    const tokens = await tokenGrant(identity.url, email, password);
    if (tokens) return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tokens) };
  }

  // Not in Identity — check the old site's credentials.
  if (!account?.email) {
    console.log(`bridge: no old-site account for "${login}"`);
    return fail(401, 'Invalid login or password');
  }
  if (!verifyDrupalPassword(password, account.hash)) {
    console.log(`bridge: Drupal hash mismatch for "${login}"`);
    return fail(401, 'Invalid login or password');
  }

  // Old credentials are good: create the Identity account with them.
  const directory = ((await store.get('directory', { type: 'json' })) ?? []) as { name: string; email?: string }[];
  const fullName = directory.find(m => m.email?.toLowerCase() === account.email)?.name || account.username;

  const created = await fetch(`${identity.url}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${identity.token}` },
    body: JSON.stringify({
      email: account.email,
      password,
      confirm: true,
      user_metadata: { full_name: fullName, migrated_from_drupal: true },
    }),
  });
  if (!created.ok) {
    const detail = await created.text().catch(() => '');
    console.log(`bridge: admin create failed for "${login}": ${created.status} ${detail.slice(0, 300)}`);
    // The requester has proven they hold the old password, so a slightly
    // more specific hint here is acceptable and saves a support email.
    if (created.status === 422 && /already|exists|registered/i.test(detail)) {
      return fail(401, 'This email already has a new account — use "Forgot your password?" below.');
    }
    if (/password/i.test(detail)) {
      return fail(401, 'Your old password doesn\'t meet the new minimum length — use "Forgot your password?" below to set a new one.');
    }
    return fail(401, 'Invalid login or password');
  }
  console.log(`bridge: migrated "${login}" -> ${account.email}`);

  const tokens = await tokenGrant(identity.url, account.email, password);
  if (!tokens) return fail(500, 'Account created but login failed — try again');
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tokens) };
};
