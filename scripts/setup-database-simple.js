const { createClient } = require('@supabase/supabase-js');

async function setupDatabase() {
  // Load environment variables from .env.local
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      // Remove quotes and trim whitespace
      let value = valueParts.join('=').trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      envVars[key.trim()] = value;
    }
  });

  const supabaseUrl = envVars.SUPABASE_URL;
  const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.error('Found keys:', Object.keys(envVars));
    process.exit(1);
  }

  console.log('🚀 Setting up candidates table in Supabase...');
  console.log('📡 Using URL:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  try {
    // First, let's check if the table already exists by trying to query it
    console.log('🔍 Checking if candidates table exists...');
    
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST205') {
        console.log('❌ Candidates table does not exist. Creating it now...');
        console.log('⚠️  Note: You need to create the table manually in your Supabase dashboard.');
        console.log('📋 Copy and paste this SQL into your Supabase SQL editor:');
        console.log('');
        console.log('```sql');
        console.log('-- Create candidates table');
        console.log('CREATE TABLE IF NOT EXISTS candidates (');
        console.log('    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
        console.log('    name VARCHAR(255) NOT NULL,');
        console.log('    email VARCHAR(255) NOT NULL,');
        console.log('    position VARCHAR(255) NOT NULL,');
        console.log('    team_code VARCHAR(50) NOT NULL REFERENCES teams(code) ON DELETE CASCADE,');
        console.log('    status VARCHAR(20) DEFAULT \'invited\' CHECK (status IN (\'invited\', \'in_progress\', \'completed\', \'withdrawn\')),');
        console.log('    assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,');
        console.log('    invited_at TIMESTAMP WITH TIME ZONE,');
        console.log('    started_at TIMESTAMP WITH TIME ZONE,');
        console.log('    completed_at TIMESTAMP WITH TIME ZONE,');
        console.log('    ocean_scores JSONB,');
        console.log('    culture_scores JSONB,');
        console.log('    values_scores JSONB,');
        console.log('    overall_fit_score INTEGER CHECK (overall_fit_score >= 0 AND overall_fit_score <= 100),');
        console.log('    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,');
        console.log('    notes TEXT,');
        console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
        console.log('    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
        console.log(');');
        console.log('');
        console.log('-- Create indexes');
        console.log('CREATE INDEX IF NOT EXISTS idx_candidates_team_code ON candidates(team_code);');
        console.log('CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);');
        console.log('CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);');
        console.log('CREATE INDEX IF NOT EXISTS idx_candidates_assessment_id ON candidates(assessment_id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);');
        console.log('```');
        console.log('');
        console.log('🎯 After creating the table, run this script again to add sample data.');
        return;
      } else if (error) {
        console.log('⚠️  Unexpected error checking table:', error);
        return;
      } else {
        console.log('✅ Candidates table already exists!');
      }
    } catch (err) {
      console.log('❌ Error checking table:', err);
      return;
    }

    // If we get here, the table exists, so let's add sample data
    console.log('📊 Adding sample candidate data...');
    
    const sampleCandidates = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        position: 'Senior Developer',
        team_code: '05ZRY1',
        status: 'completed',
        invited_at: new Date().toISOString(),
        overall_fit_score: 87,
        ocean_scores: {
          openness: 75,
          conscientiousness: 82,
          extraversion: 68,
          agreeableness: 71,
          neuroticism: 45
        },
        culture_scores: {
          hierarchy: 35,
          egalitarian: 78,
          individualistic: 65,
          collectivistic: 42
        },
        values_scores: {
          innovation: 80,
          quality: 85,
          efficiency: 72,
          collaboration: 68
        }
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        position: 'Product Manager',
        team_code: '05ZRY1',
        status: 'in_progress',
        invited_at: new Date().toISOString()
      },
      {
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@example.com',
        position: 'UX Designer',
        team_code: '05ZRY1',
        status: 'invited',
        invited_at: new Date().toISOString()
      }
    ];

    for (const candidate of sampleCandidates) {
      try {
        const { error } = await supabase
          .from('candidates')
          .upsert(candidate, { onConflict: 'email,team_code' });
        
        if (error) {
          console.log(`⚠️  Error adding ${candidate.name}:`, error);
        } else {
          console.log(`✅ Added ${candidate.name}`);
        }
      } catch (err) {
        console.log(`❌ Error adding ${candidate.name}:`, err);
      }
    }

    console.log('');
    console.log('✅ Sample data setup completed!');
    console.log('🎯 Your team dashboard should now work without errors.');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupDatabase();
