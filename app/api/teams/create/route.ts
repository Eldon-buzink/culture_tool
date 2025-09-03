import { NextResponse } from 'next/server';
import { createSupabaseRoute, createSupabaseAdmin } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = { name?: string; description?: string; memberEmails?: string[] };

function needEnv() {
  const miss: string[] = [];
  if (!process.env.SUPABASE_URL) miss.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) miss.push('SUPABASE_SERVICE_ROLE_KEY');
  return miss;
}

export async function POST(req: Request) {
  const debug = process.env.DEBUG_API === '1';
  try {
    if (debug) console.log('Team creation request received');
    
    const miss = needEnv();
    if (miss.length) {
      if (debug) console.error('Missing environment variables:', miss);
      return NextResponse.json({ error: `Missing env: ${miss.join(', ')}` }, { status: 500 });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const name = (body?.name || '').trim();
    const description = body?.description?.trim() || null;
    const memberEmails = body?.memberEmails || [];
    
    if (debug) console.log('Request data:', { name, description, memberEmails });
    
    if (!name) {
      if (debug) console.log('Validation failed: Team name is required');
      return NextResponse.json({ error: 'Missing team name' }, { status: 400 });
    }

    // Generate unique team code
    let teamCode = '';
    let isUnique = false;
    
    if (debug) console.log('Generating unique team code...');
    while (!isUnique) {
      teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const admin = createSupabaseAdmin();
      const { data: existingTeam } = await admin
        .from('teams')
        .select('id')
        .eq('code', teamCode)
        .single();
      
      if (!existingTeam) {
        isUnique = true;
      }
    }
    if (debug) console.log('Team code generated:', teamCode);

    // Try RLS path (only works if user is logged in via Supabase Auth)
    try {
      const supabase = createSupabaseRoute();
      const { data: u, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      const userId = u?.user?.id ?? null;
      
      if (userId) {
        if (debug) console.log('Creating team with authenticated user:', userId);
        const { data, error } = await supabase
          .from('teams')
          .insert({ 
            name, 
            description, 
            code: teamCode
          })
          .select('*')
          .single();
        
        if (error) throw error;
        
            // Add team members if any
    if (memberEmails.length > 0) {
      await addTeamMembers(teamCode, data.id, memberEmails, debug);
    }
        
        if (debug) console.log('Team created successfully with RLS');
        return NextResponse.json({ 
          ok: true, 
          team: data, 
          mode: 'RLS' 
        }, { status: 201 });
      }
    } catch (e: any) {
      if (debug) console.error('RLS path failed (will fallback to admin):', e?.message || e);
    }

    // Fallback admin (bypasses RLS). Only for setup/testing; lock down later.
    if (debug) console.log('Creating team with admin privileges');
    const admin = createSupabaseAdmin();
    const { data, error } = await admin
      .from('teams')
      .insert({ 
        name, 
        description, 
        code: teamCode
      })
      .select('*')
      .single();
    
    if (error) {
      if (debug) console.error('Admin team creation failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Add team members if any
    if (memberEmails.length > 0) {
      await addTeamMembers(teamCode, data.id, memberEmails, debug);
    }
    
    if (debug) console.log('Team creation completed successfully with admin');
    return NextResponse.json({ 
      ok: true, 
      team: data, 
      mode: 'ADMIN' 
    }, { status: 201 });

  } catch (e: any) {
    if (debug) {
      console.error('Create team failed:', e);
      return NextResponse.json({ 
        error: e?.message || 'Failed to create team', 
        stack: e?.stack 
      }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}

export async function GET() {
  const debug = process.env.DEBUG_API === '1';
  try {
    // minimal check that envs are present
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }
    // try a lightweight query
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.from('teams').select('id').limit(1);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, sampleCount: data?.length ?? 0 });
  } catch (e: any) {
    if (debug) return NextResponse.json({ ok: false, error: e?.message, stack: e?.stack }, { status: 500 });
    return NextResponse.json({ ok: false, error: 'Diagnostics failed' }, { status: 500 });
  }
}

async function addTeamMembers(teamCode: string, teamId: string, memberEmails: string[], debug: boolean) {
  if (!memberEmails || memberEmails.length === 0) return;

  if (debug) console.log('Adding team members:', memberEmails);
  const admin = createSupabaseAdmin();

  for (const email of memberEmails) {
    if (email && email.trim() && email.includes('@')) {
      try {
        // Find or create user
        let { data: user } = await admin
          .from('users')
          .select('id')
          .eq('email', email.trim())
          .single();

        if (!user) {
          if (debug) console.log('Creating new user for email:', email);
          const { data: newUser, error: userError } = await admin
            .from('users')
            .insert({
              email: email.trim(),
              name: email.split('@')[0]
            })
            .select('id')
            .single();

          if (userError) {
            if (debug) console.error('Failed to create user:', userError);
            continue;
          }
          user = newUser;
        }

        // Add to team members
        const { error: memberError } = await admin
          .from('team_members')
          .insert({
            team_id: teamId, // Use the passed team ID
            user_id: user.id,
            role: 'member'
          });

        if (memberError) {
          if (debug) console.error('Failed to add team member:', memberError);
        } else {
          if (debug) console.log('Member added successfully:', email);
          
          // Create an assessment for this team member
          try {
            const { data: assessment, error: assessmentError } = await admin
              .from('assessments')
              .insert({
                user_id: user.id,
                team_id: teamId,
                title: 'Team Assessment',
                description: 'Assessment for team collaboration and culture fit',
                type: 'team',
                status: 'invited'
              })
              .select('id')
              .single();

            if (assessmentError) {
              if (debug) console.error('Failed to create assessment for member:', assessmentError);
            } else {
              if (debug) console.log('Assessment created for member:', assessment.id);
            }
          } catch (assessmentErr) {
            if (debug) console.error('Error creating assessment for member:', assessmentErr);
          }
        }
      } catch (error) {
        if (debug) console.error('Error processing member email:', email, error);
      }
    }
  }
}
