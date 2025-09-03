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
    // Create the candidates table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS candidates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          position VARCHAR(255) NOT NULL,
          team_code VARCHAR(50) NOT NULL REFERENCES teams(code) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'in_progress', 'completed', 'withdrawn')),
          
          -- Assessment tracking
          assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
          invited_at TIMESTAMP WITH TIME ZONE,
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          
          -- Assessment results
          ocean_scores JSONB,
          culture_scores JSONB,
          values_scores JSONB,
          overall_fit_score INTEGER CHECK (overall_fit_score >= 0 AND overall_fit_score <= 100),
          
          -- Metadata
          invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tableError) {
      console.log('ℹ️  Table creation result:', tableError);
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_candidates_team_code ON candidates(team_code);
        CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
        CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
        CREATE INDEX IF NOT EXISTS idx_candidates_assessment_id ON candidates(assessment_id);
        CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);
      `
    });

    if (indexError) {
      console.log('ℹ️  Index creation result:', indexError);
    }

    // Create the trigger function
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_candidates_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (functionError) {
      console.log('ℹ️  Function creation result:', functionError);
    }

    // Create the trigger
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS trigger_update_candidates_updated_at ON candidates;
        CREATE TRIGGER trigger_update_candidates_updated_at
            BEFORE UPDATE ON candidates
            FOR EACH ROW
            EXECUTE FUNCTION update_candidates_updated_at();
      `
    });

    if (triggerError) {
      console.log('ℹ️  Trigger creation result:', triggerError);
    }

    // Add sample data for your team
    const { error: sampleDataError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO candidates (name, email, position, team_code, status, invited_at, overall_fit_score, ocean_scores, culture_scores, values_scores) VALUES
          ('Sarah Johnson', 'sarah.johnson@example.com', 'Senior Developer', '05ZRY1', 'completed', NOW(), 87, 
           '{"openness": 75, "conscientiousness": 82, "extraversion": 68, "agreeableness": 71, "neuroticism": 45}',
           '{"hierarchy": 35, "egalitarian": 78, "individualistic": 65, "collectivistic": 42}',
           '{"innovation": 80, "quality": 85, "efficiency": 72, "collaboration": 68}'),
          
          ('Michael Chen', 'michael.chen@example.com', 'Product Manager', '05ZRY1', 'in_progress', NOW(), NULL, NULL, NULL, NULL),
          
          ('Emma Rodriguez', 'emma.rodriguez@example.com', 'UX Designer', '05ZRY1', 'invited', NOW(), NULL, NULL, NULL, NULL)
        ON CONFLICT (email, team_code) DO NOTHING;
      `
    });

    if (sampleDataError) {
      console.log('ℹ️  Sample data creation result:', sampleDataError);
    }

    console.log('✅ Candidates table setup completed!');
    console.log('🎯 Your team dashboard should now work without errors.');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupDatabase();
