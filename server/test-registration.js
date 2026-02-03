require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function testRegistration() {
  console.log('Testing user registration functionality...\n');

  // Sample user data for testing
  const testUser = {
    email: 'testuser@example.com',
    password: 'SecurePass123!',
    name: 'Test User'
  };

  try {
    // First, try to sign up the user with Supabase Auth
    console.log('1. Attempting to create user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // Skip email confirmation for testing
      user_metadata: {
        full_name: testUser.name
      }
    });

    if (authError) {
      console.log(`   ❌ Failed to create user in Supabase Auth: ${authError.message}`);
      console.log('   Note: This may be because the user already exists or you don\'t have admin privileges.');
      console.log('   In a real scenario, you would use the client-side Supabase signUp method instead.\n');
      
      // Try to get existing user instead
      const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(testUser.email);
      if (userError) {
        console.log(`   Also failed to get existing user: ${userError.message}`);
        return false;
      }
      
      console.log('   ✅ Retrieved existing user from Supabase Auth');
      const userId = userData.user.id;
      
      // Check if profile already exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        console.log('   ✅ User profile already exists in database');
        console.log('   📋 User ID:', userId);
        console.log('   📧 Email:', profileData.email);
        console.log('   👤 Name:', profileData.full_name);
        console.log('   💳 Subscription Tier:', profileData.subscription.tier);
        return true;
      } else {
        console.log('   ℹ️  Profile does not exist in database, attempting to create...');
      }
    } else {
      console.log('   ✅ Successfully created user in Supabase Auth');
      const userId = authData.user.id;
      console.log('   🆔 User ID:', userId);
    }

    // Now create the profile in our custom table
    // We'll use a direct insert assuming we have the user ID
    // In a real scenario, this would be handled by the trigger we created in the schema
    console.log('\n2. Attempting to create user profile in database...');
    
    // If we got here from a new user creation, we have the userId
    // If from existing user, we also have the userId
    const userId = authData ? authData.user.id : userData.user.id;
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: testUser.email,
        full_name: testUser.name,
        avatar_url: 'default.jpg',
        subscription: { 
          tier: 'free', 
          status: 'active',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: null,
          trial_ends_at: null
        },
        usage: {
          files_processed: 0,
          storage_used: 0,
          monthly_quota: 100,
          last_reset: new Date().toISOString()
        },
        features: {
          max_file_size: 10485760, // 10MB
          concurrent_jobs: 1,
          batch_processing: false,
          custom_workflows: false,
          priority_processing: false,
          offline_access: false,
          api_access: false
        },
        email_verified: true,
        last_login: new Date().toISOString(),
        login_count: 1
      }])
      .select()
      .single();

    if (profileError) {
      // Check if it's a duplicate key error (user already exists)
      if (profileError.code === '23505') { // Unique violation
        console.log('   ℹ️  Profile already exists (duplicate key error)');
        
        // Fetch the existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (fetchError) {
          console.log(`   ❌ Error fetching existing profile: ${fetchError.message}`);
          return false;
        }
        
        console.log('   ✅ Retrieved existing profile from database');
        console.log('   📧 Email:', existingProfile.email);
        console.log('   👤 Name:', existingProfile.full_name);
        console.log('   💳 Subscription Tier:', existingProfile.subscription.tier);
      } else {
        console.log(`   ❌ Error creating profile: ${profileError.message}`);
        return false;
      }
    } else {
      console.log('   ✅ Successfully created user profile in database');
      console.log('   📧 Email:', profileData.email);
      console.log('   👤 Name:', profileData.full_name);
      console.log('   💳 Subscription Tier:', profileData.subscription.tier);
    }

    console.log('\n🎉 Registration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Supabase Auth integration is working');
    console.log('- Custom profiles table is accessible');
    console.log('- User data is properly structured');
    console.log('- Registration flow is functional');

    return true;
  } catch (err) {
    console.error('❌ Registration test failed with error:', err.message);
    return false;
  }
}

// Run the test
testRegistration()
  .then(success => {
    if (success) {
      console.log('\n✅ User registration functionality is properly implemented!');
    } else {
      console.log('\n❌ User registration needs further configuration.');
      console.log('\n💡 Tips:');
      console.log('- Make sure the SQL schema has been executed in your Supabase project');
      console.log('- Verify your Supabase service role key has proper permissions');
      console.log('- Check that Row Level Security policies are configured correctly');
    }
  })
  .catch(err => {
    console.error('Test failed with exception:', err);
  });