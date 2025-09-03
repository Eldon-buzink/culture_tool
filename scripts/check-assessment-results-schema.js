const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
  // Load environment variables from .env.local
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
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
    process.exit(1);
  }

  console.log('🔍 Checking assessment_results table schema...');
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  try {
    // Try to get the table structure by attempting different column combinations
    console.log('\n📋 Testing different column combinations...');
    
    // Test basic columns
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id, assessment_id')
        .limit(1);
      
      if (error) {
        console.log('❌ Error with basic columns:', error.message);
      } else {
        console.log('✅ Basic columns work: id, assessment_id');
      }
    } catch (err) {
      console.log('❌ Exception with basic columns:', err.message);
    }

    // Test with user_id
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id, assessment_id, user_id')
        .limit(1);
      
      if (error) {
        console.log('❌ Error with user_id:', error.message);
      } else {
        console.log('✅ user_id column exists');
      }
    } catch (err) {
      console.log('❌ Exception with user_id:', err.message);
    }

    // Test with ocean_scores
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id, assessment_id, ocean_scores')
        .limit(1);
      
      if (error) {
        console.log('❌ ocean_scores column does not exist:', error.message);
      } else {
        console.log('✅ ocean_scores column exists');
      }
    } catch (err) {
      console.log('❌ Exception with ocean_scores:', err.message);
    }

    // Test with culture_scores
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id, assessment_id, culture_scores')
        .limit(1);
      
      if (error) {
        console.log('❌ culture_scores column does not exist:', error.message);
      } else {
        console.log('✅ culture_scores column exists');
      }
    } catch (err) {
      console.log('❌ Exception with culture_scores:', err.message);
    }

    // Test with values_scores
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id, assessment_id, values_scores')
        .limit(1);
      
      if (error) {
        console.log('❌ values_scores column does not exist:', error.message);
      } else {
        console.log('✅ values_scores column exists');
      }
    } catch (err) {
      console.log('❌ Exception with values_scores:', err.message);
    }

    // Try to get all columns
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ Error selecting all columns:', error.message);
      } else if (data && data.length > 0) {
        console.log('\n📊 Actual columns in assessment_results table:');
        console.log(Object.keys(data[0]).join(', '));
      } else {
        console.log('\n📊 Table exists but has no data');
      }
    } catch (err) {
      console.log('❌ Exception selecting all columns:', err.message);
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkSchema();
