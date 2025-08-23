import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function admin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const dbg = process.env.DEBUG_API === '1';
  try {
    const c = admin();

    // Who am I?
    const who = await c.rpc('debug_whoami');
    if (who.error) throw new Error('whoami: ' + who.error.message);

    // Can I read teams?
    const q = await c.from('teams').select('id').limit(1);
    if (q.error) throw new Error('teams: ' + q.error.message);

    return new Response(
      `OK\nwhoami=${JSON.stringify(who.data)}\nsampleCount=${q.data?.length ?? 0}`,
      { status: 200, headers: { 'content-type': 'text/plain' } }
    );
  } catch (e: any) {
    const msg = e?.message || String(e);
    const stack = dbg && e?.stack ? `\n${e.stack}` : '';
    return new Response(`ERROR: ${msg}${stack}`, {
      status: 500,
      headers: { 'content-type': 'text/plain' },
    });
  }
}
