import { NextResponse } from 'next/server';
import { createSupabaseRoute, createSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = { 
  name?: string; 
  description?: string; 
  memberEmails?: string[];
};

function missingEnv() {
  const miss: string[] = [];
  if (!process.env.SUPABASE_URL) miss.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) miss.push('SUPABASE_SERVICE_ROLE_KEY');
  return miss;
}

export async function POST(req: Request) {
  try {
    console.log('Team creation request received');
    
    const miss = missingEnv();
    if (miss.length) {
      console.error('Missing environment variables:', miss);
      return NextResponse.json(
        { error: `Missing env: ${miss.join(', ')}` },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const name = (body?.name || '').trim();
    const description = body?.description?.trim() || null;
    const memberEmails = body?.memberEmails || [];

    console.log('Request data:', { name, description, memberEmails });

    if (!name) {
      console.log('Validation failed: Team name is required');
      return NextResponse.json({ error: 'Missing team name' }, { status: 400 });
    }

    // Generate unique team code
    let teamCode = '';
    let isUnique = false;
    
    console.log('Generating unique team code...');
    while (!isUnique) {
      teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      // Check if code exists in database
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
    console.log('Team code generated:', teamCode);

    // Try with user session (RLS) if logged in
    try {
      const supabase = createSupabaseRoute();
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;

      if (userId) {
        console.log('Creating team with authenticated user:', userId);
        const { data, error } = await supabase
          .from('teams')
          .insert({ 
            name, 
            description, 
            code: teamCode,
            owner_id: userId 
          })
          .select('*')
          .single();
        
        if (error) throw error;
        
        // Add team members
        await addTeamMembers(teamCode, memberEmails);
        
        console.log('Team created successfully with RLS');
        return NextResponse.json({ 
          success: true, 
          team: data, 
          mode: 'RLS' 
        }, { status: 201 });
      }
    } catch (e) {
      console.warn('RLS insert failed or no user; falling back to admin.', e);
    }

    // Fallback: service-role (no auth required)
    console.log('Creating team with admin privileges');
    const admin = createSupabaseAdmin();
    const { data, error } = await admin
      .from('teams')
      .insert({ 
        name, 
        description, 
        code: teamCode,
        owner_id: null 
      })
      .select('*')
      .single();

    if (error) {
      console.error('Admin team creation failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add team members
    await addTeamMembers(teamCode, memberEmails);
    
    console.log('Team creation completed successfully with admin');
    return NextResponse.json({ 
      success: true, 
      team: data, 
      mode: 'ADMIN' 
    }, { status: 201 });

  } catch (e: any) {
    console.error('Create team failed:', e);
    return NextResponse.json({ 
      success: false,
      error: e?.message || 'Failed to create team' 
    }, { status: 500 });
  }
}

async function addTeamMembers(teamCode: string, memberEmails: string[]) {
  if (!memberEmails || memberEmails.length === 0) return;
  
  console.log('Adding team members:', memberEmails);
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
          console.log('Creating new user for email:', email);
          const { data: newUser, error: userError } = await admin
            .from('users')
            .insert({
              email: email.trim(),
              name: email.split('@')[0]
            })
            .select('id')
            .single();
          
          if (userError) {
            console.error('Failed to create user:', userError);
            continue;
          }
          user = newUser;
        }

        // Add to team members
        const { error: memberError } = await admin
          .from('team_members')
          .insert({
            team_code: teamCode,
            user_id: user.id,
            role: 'member'
          });
        
        if (memberError) {
          console.error('Failed to add team member:', memberError);
        } else {
          console.log('Member added successfully:', email);
        }
      } catch (error) {
        console.error('Error processing member email:', email, error);
      }
    }
  }
}
