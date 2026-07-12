import type { APIRoute } from 'astro';
import { getDirectory, setDirectory } from '../../../lib/membersStore';

export const prerender = false;

const EDITABLE = ['phone', 'address', 'city', 'state', 'interests'] as const;
const HIDEABLE = ['email', 'phone', 'address', 'city', 'state', 'interests'];

// Members may edit their own directory entry only; the acting member comes
// from the session (locals), and the record is matched by session email.
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const member = locals.member!;
  const form = await request.formData();

  const directory = await getDirectory();
  let me = directory.find(m => m.email?.toLowerCase() === member.email.toLowerCase());
  if (!me) {
    me = { id: `u-${member.id}`, name: member.name, email: member.email };
    directory.push(me);
  }

  const newName = form.get('name');
  if (typeof newName === 'string' && newName.trim()) me.name = newName.trim().slice(0, 120);

  for (const key of EDITABLE) {
    const value = form.get(key);
    if (typeof value === 'string') {
      const trimmed = value.trim().slice(0, 200);
      if (trimmed) me[key] = trimmed;
      else delete me[key];
    }
  }
  me.hidden = HIDEABLE.filter(key => form.get(`hide_${key}`) !== null);
  if (me.hidden.length === 0) delete me.hidden;

  await setDirectory(directory);
  return redirect(`/members/profile?msg=${encodeURIComponent('Profile saved.')}`, 303);
};
