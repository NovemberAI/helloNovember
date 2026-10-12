import { readFile } from 'node:fs/promises';

const resendApi = 'https://api.resend.com';
const from = process.env.RESEND_FROM || 'NovemberAI <waitlist@shashwatraj.com>';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const logo = readFile(new URL('./email-logo.png', import.meta.url)).then(file => file.toString('base64'));

const json = (body, status = 200) => Response.json(body, { status });

function resend(path, body) {
  return fetch(`${resendApi}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
}

const html = `<!doctype html>
<html><body style="margin:0;padding:40px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0d2140;text-align:center">
<img src="cid:november-logo" alt="NovemberAI" width="64" height="64" style="display:block;margin:0 auto 24px">
<p style="margin:0;font-size:16px;line-height:1.6">You’ve been added to the NovemberAI waitlist.</p>
</body></html>`;

export async function POST(request) {
  if (!process.env.RESEND_API_KEY) return json({ error: 'Waitlist is not configured.' }, 500);

  let email;
  try {
    ({ email } = await request.json());
  } catch {
    return json({ error: 'Send an email address.' }, 400);
  }
  email = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (email.length > 254 || !emailPattern.test(email)) return json({ error: 'Enter a valid email address.' }, 400);

  // Resend accepts duplicate creates, so look the contact up first to avoid emailing someone twice.
  const existing = await resend(`/contacts/${encodeURIComponent(email)}`);
  if (existing.ok) return json({ ok: true, alreadyJoined: true });
  const contact = existing.status === 404 ? await resend('/contacts', { email, unsubscribed: false }) : existing;
  if (!contact.ok) {
    console.error('Resend contact failed', contact.status, await contact.text());
    return json({ error: 'Could not join the waitlist. Try again in a moment.' }, 502);
  }

  const sent = await resend('/emails', {
    from,
    to: [email],
    subject: 'You’re on the NovemberAI waitlist',
    html,
    text: 'You’ve been added to the NovemberAI waitlist.',
    attachments: [{ content: await logo, filename: 'november.png', content_id: 'november-logo' }],
  });
  if (!sent.ok) console.error('Resend email failed', sent.status, await sent.text());

  return json({ ok: true });
}
