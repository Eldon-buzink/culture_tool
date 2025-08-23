import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function makeAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const debug = process.env.DEBUG_API === '1';
  try {
    // 1) quick ping: select 1
    const admin = makeAdmin();
    const { data: ping, error: pingErr } = await admin.rpc('pg_sleep', { seconds: 0 }).then(
      () => ({ data: [{ ok: true }], error: null }),
      (e) => ({ data: null, error: e })
    );
    if (pingErr) throw pingErr;

    // 2) can we read teams table?
    const { data, error } = await admin.from('teams').select('id').limit(1);
    if (error) throw error;

    return NextResponse.json({ ok: true, readable: true, sampleCount: data?.length ?? 0 });
  } catch (e: any) {
    const msg = e?.message || String(e);
    return NextResponse.json(
      debug ? { ok: false, error: msg, stack: e?.stack } : { ok: false, error: msg },
      { status: 500 }
    );
  }
}
