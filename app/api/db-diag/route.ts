import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function admin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const c = admin();
  const projectUrl = process.env.SUPABASE_URL || '';
  const projectIdHint = projectUrl.replace('https://', '').split('.')[0]; // just a hint, not secret

  // 1) whoami
  const who = await c.rpc('debug_whoami');
  const whoMsg = who.error ? `whoami_error=${who.error.message}` : `whoami=${JSON.stringify(who.data)}`;

  // 2) try teams read, but DO NOT throw—print error text
  const q = await c.from('teams').select('id').limit(1);
  const teamsMsg = q.error ? `teams_error=${q.error.message}` : `teams_ok sampleCount=${q.data?.length ?? 0}`;

  // 3) echo which project URL we're hitting (safe prefix only)
  return new Response(
    `project=${projectIdHint}\n${whoMsg}\n${teamsMsg}`,
    { status: 200, headers: { 'content-type': 'text/plain' } }
  );
}
