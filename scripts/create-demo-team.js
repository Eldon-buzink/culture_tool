#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from local.env
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', 'local.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key.trim()] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Could not read local.env file:', error.message);
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in local.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDemoTeam() {
  try {
    console.log('Creating demo team with 2 members...');

    // 1. Create the demo team
    const teamData = {
      name: 'Demo Team Alpha',
      code: 'DEMO2024',
      description: 'A demo team with 2 completed assessments for testing the dashboard'
    };

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .upsert(teamData, { onConflict: 'code' })
      .select()
      .single();

    if (teamError) {
      console.error('Error creating team:', teamError);
      return;
    }

    console.log('✓ Team created:', team.name, '(Code:', team.code, ')');

    // 2. Create demo users
    const users = [
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@demo.com'
      },
      {
        name: 'Marcus Johnson',
        email: 'marcus.johnson@demo.com'
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'email' })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        continue;
      }
      createdUsers.push(user);
      console.log('✓ User created:', user.name);
    }

    // 3. Add users to team
    for (const user of createdUsers) {
      // Check if member already exists
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (!existingMember) {
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            team_id: team.id,
            user_id: user.id,
            role: 'member',
            joined_at: new Date().toISOString()
          });

        if (memberError) {
          console.error('Error adding team member:', memberError);
        } else {
          console.log('✓ Added', user.name, 'to team');
        }
      } else {
        console.log('✓', user.name, 'already in team');
      }
    }

    // 4. Create assessments for each user
    const assessments = [];
    
    // Generate proper UUIDs for assessments
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    for (const user of createdUsers) {
      const assessmentId = generateUUID();
      
      // Check if assessment already exists for this user
      const { data: existingAssessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('team_id', team.id)
        .single();

      let assessment;
      if (!existingAssessment) {
        const { data: newAssessment, error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            id: assessmentId,
            user_id: user.id,
            team_id: team.id,
            status: 'completed',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (assessmentError) {
          console.error('Error creating assessment:', assessmentError);
          continue;
        }
        assessment = newAssessment;
      } else {
        assessment = existingAssessment;
      }

      assessments.push({ assessment, user });
      console.log('✓ Assessment created for', user.name);
    }

    // 5. Create assessment results with diverse but realistic scores
    const sampleResults = [
      // Sarah Chen - Creative & Collaborative Leader
      {
        oceanScores: {
          openness: 78,
          conscientiousness: 72,
          extraversion: 68,
          agreeableness: 75,
          neuroticism: 35
        },
        cultureScores: {
          powerDistance: 25,
          individualism: 45,
          masculinity: 40,
          uncertaintyAvoidance: 35,
          longTermOrientation: 70,
          indulgence: 60
        },
        valuesScores: {
          innovation: 82,
          collaboration: 78,
          autonomy: 65,
          quality: 75,
          customerFocus: 70
        }
      },
      // Marcus Johnson - Analytical & Structured Performer  
      {
        oceanScores: {
          openness: 55,
          conscientiousness: 85,
          extraversion: 45,
          agreeableness: 62,
          neuroticism: 28
        },
        cultureScores: {
          powerDistance: 45,
          individualism: 70,
          masculinity: 65,
          uncertaintyAvoidance: 75,
          longTermOrientation: 80,
          indulgence: 40
        },
        valuesScores: {
          innovation: 58,
          collaboration: 65,
          autonomy: 78,
          quality: 88,
          customerFocus: 72
        }
      }
    ];

    for (let i = 0; i < assessments.length; i++) {
      const { assessment, user } = assessments[i];
      const results = sampleResults[i];

      const { error: resultsError } = await supabase
        .from('assessment_results')
        .upsert({
          assessment_id: assessment.id,
          user_id: user.id,
          ocean_scores: results.oceanScores,
          culture_scores: results.cultureScores,
          values_scores: results.valuesScores,
          created_at: new Date().toISOString()
        }, { onConflict: 'assessment_id' });

      if (resultsError) {
        console.error('Error creating assessment results:', resultsError);
      } else {
        console.log('✓ Assessment results created for', user.name);
      }
    }

    console.log('\n🎉 Demo team setup complete!');
    console.log('📊 Team Dashboard URL: http://localhost:3001/team/DEMO2024/dashboard');
    console.log('\nTeam Details:');
    console.log('- Team Name:', team.name);
    console.log('- Team Code:', team.code);
    console.log('- Members:', createdUsers.length);
    console.log('- Sarah Chen: Creative & Collaborative Leader (High Openness, High Collaboration)');
    console.log('- Marcus Johnson: Analytical & Structured Performer (High Conscientiousness, High Quality Focus)');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createDemoTeam();
