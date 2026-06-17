import type { APIRoute } from 'astro';
import { google } from 'googleapis';

export const prerender = false;

function getAuth() {
  const email = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = import.meta.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !privateKey) {
    throw new Error('Google service account credentials are not configured');
  }
  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

/** Verifies read + write access to the booking calendar. */
export const GET: APIRoute = async () => {
  const calendarId = import.meta.env.GOOGLE_CALENDAR_ID;
  const serviceAccount = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!calendarId || !serviceAccount) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'GOOGLE_CALENDAR_ID or GOOGLE_SERVICE_ACCOUNT_EMAIL is missing',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const calendar = google.calendar({ version: 'v3', auth: getAuth() });
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86_400_000);

  try {
    await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: tomorrow.toISOString(),
        items: [{ id: calendarId }],
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'freebusy query failed';
    return new Response(
      JSON.stringify({
        ok: false,
        readAccess: false,
        writeAccess: false,
        calendarId,
        serviceAccount,
        error: message,
        fix: `Share this calendar with ${serviceAccount} (Make changes to events).`,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let writeAccess = false;
  let writeError = '';

  try {
    const test = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: '[TEST] DriveClean calendar write check',
        start: { dateTime: '2030-06-01T10:00:00', timeZone: 'America/New_York' },
        end: { dateTime: '2030-06-01T11:00:00', timeZone: 'America/New_York' },
      },
    });
    writeAccess = true;
    if (test.data.id) {
      await calendar.events.delete({ calendarId, eventId: test.data.id });
    }
  } catch (err) {
    const apiMessage =
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error
        ?.message;
    writeError = apiMessage ?? (err instanceof Error ? err.message : 'insert failed');
  }

  return new Response(
    JSON.stringify({
      ok: writeAccess,
      readAccess: true,
      writeAccess,
      calendarId,
      serviceAccount,
      error: writeAccess ? undefined : writeError,
      fix: writeAccess
        ? undefined
        : `In Google Calendar → Settings for this calendar → Share with ${serviceAccount} → permission must be "Make changes to events" (not read-only).`,
    }),
    {
      status: writeAccess ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
