import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mwxvgrcqfyxxvacqdkwt.supabase.co'; // Fallback to known URL from backend .env if missing
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHZncmNxZnl4eHZhY3Fka3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDY0ODksImV4cCI6MjA4NTUyMjQ4OX0.4AQ6TYWrasTRbqtvcnr_QdKm73Yg-iqqh4z02KpLsjY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
