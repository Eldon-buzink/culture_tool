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

  // 2) check key tables directly
  let tablesInfo = '';
  
  // Check users table
  try {
    const usersCheck = await c.from('users').select('id').limit(1);
    tablesInfo += `users_ok=${usersCheck.error ? 'no' : 'yes'}`;
  } catch (e) {
    tablesInfo += 'users_ok=error';
  }
  
  // Check teams table
  try {
    const teamsCheck = await c.from('teams').select('id').limit(1);
    tablesInfo += `\nteams_ok=${teamsCheck.error ? 'no' : 'yes'}`;
  } catch (e) {
    tablesInfo += '\nteams_ok=error';
  }
  
  // Check team_members table
  try {
    const teamMembersCheck = await c.from('team_members').select('id').limit(1);
    tablesInfo += `\nteam_members_ok=${teamMembersCheck.error ? 'no' : 'yes'}`;
  } catch (e) {
    tablesInfo += '\nteam_members_ok=error';
  }
  
  // Check assessments table
  try {
    const assessmentsCheck = await c.from('assessments').select('id').limit(1);
    tablesInfo += `\nassessments_ok=${assessmentsCheck.error ? 'no' : 'yes'}`;
  } catch (e) {
    tablesInfo += '\nassessments_ok=error';
  }
  
  // Check assessment_responses table
  try {
    const responsesCheck = await c.from('assessment_responses').select('id').limit(1);
    tablesInfo += `\nassessment_responses_ok=${responsesCheck.error ? 'no' : 'yes'}`;
  } catch (e) {
    tablesInfo += '\nassessment_responses_ok=error';
  }
  
  // Check assessment_results table
  try {
    const resultsCheck = await c.from('assessment_results').select('id').limit(1);
    tablesInfo += `\nassessment_results_ok=${resultsCheck.error ? 'no' : 'yes'}`;
  } catch (e) {
    tablesInfo += '\nassessment_results_ok=error';
  }

  return new Response(
    `project=${projectIdHint}\n${whoMsg}\n${tablesInfo}`,
    { status: 200, headers: { 'content-type': 'text/plain' } }
  );
}
