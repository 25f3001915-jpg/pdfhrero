const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create a single Supabase client for the entire app
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

module.exports = { supabase };