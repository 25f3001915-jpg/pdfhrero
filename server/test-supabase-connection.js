require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Check if the password placeholder still exists in the DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes('[YOUR-PASSWORD]')) {
  console.log('❌ Supabase connection failed: [YOUR-PASSWORD] placeholder detected in DATABASE_URL');
  console.log('Please update your .env file with the actual Supabase database password');
  console.log('\nExpected format:');
  console.log('DATABASE_URL="postgresql://postgres:actual_password_here@db.your_project.supabase.co:5432/postgres"');
  process.exit(1);
}

// Create a separate client just for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('Testing Supabase connection...');

  try {
    // Test basic connection by fetching a non-existent user
    // This will verify that we can reach the database
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log('Connection details:');
    console.log('- URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('- anon key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('- Data fetch test:', data !== undefined);
    
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Supabase integration is properly configured!');
      console.log('\nNext steps:');
      console.log('1. Execute the SQL schema in your Supabase dashboard');
      console.log('2. Update your application to use the new auth controller');
      console.log('3. Test user registration and login functionality');
    } else {
      console.log('\n❌ Please check your Supabase configuration');
      console.log('- Ensure your DATABASE_URL is correct');
      console.log('- Verify your SUPABASE_ANON_KEY is valid');
      console.log('- Confirm your Supabase project is active');
    }
  })
  .catch(err => {
    console.error('Test failed with exception:', err);
  });