import type { APIRoute } from 'astro';
import { getSignups, setSignups } from '../../../lib/membersStore';

export const prerender = false;

// Handles reading sign-up sheet actions. Gated by middleware; the acting
// member comes from locals, never from the form.
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const member = locals.member!;
  const form = await request.formData();
  const action = form.get('action');
  const slug = form.get('slug');

  if (typeof slug !== 'string' || !slug || (action !== 'signup' && action !== 'cancel')) {
    return new Response('Bad request', { status: 400 });
  }

  const signups = await getSignups();
  const existing = signups.find(s => s.eventSlug === slug);
  let msg: string;

  if (action === 'signup') {
    if (existing) {
      msg = existing.email === member.email
        ? 'You are already signed up for that date.'
        : `Sorry — ${existing.name} just signed up for that date.`;
    } else {
      signups.push({
        eventSlug: slug,
        userId: member.id,
        name: member.name,
        email: member.email,
        signedUpAt: new Date().toISOString(),
      });
      await setSignups(signups);
      msg = "You're signed up — thank you!";
    }
  } else {
    if (existing && existing.email === member.email) {
      await setSignups(signups.filter(s => s.eventSlug !== slug));
      msg = 'Your signup has been cancelled.';
    } else {
      msg = "You aren't signed up for that date.";
    }
  }

  return redirect(`/members/readings?msg=${encodeURIComponent(msg)}`, 303);
};
