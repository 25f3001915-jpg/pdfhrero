-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table to store user profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT DEFAULT 'default.jpg',
  
  -- Subscription System
  subscription JSONB DEFAULT '{"tier": "free", "status": "active", "stripe_customer_id": null, "stripe_subscription_id": null, "current_period_end": null, "trial_ends_at": null}',
  
  -- Usage Tracking
  usage JSONB DEFAULT '{"files_processed": 0, "storage_used": 0, "monthly_quota": 100, "last_reset": "' || CURRENT_DATE || '"}',
  
  -- Feature Access Control
  features JSONB DEFAULT '{"max_file_size": 10485760, "concurrent_jobs": 1, "batch_processing": false, "custom_workflows": false, "priority_processing": false, "offline_access": false, "api_access": false}',
  
  -- OAuth Integration
  google_id TEXT,
  
  -- Email Verification
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Security & Activity
  last_login TIMESTAMPTZ DEFAULT NOW(),
  login_count INTEGER DEFAULT 0,
  active_sessions INTEGER DEFAULT 0,
  
  -- Custom Workflows Count
  saved_workflows_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create processing_history table
CREATE TABLE IF NOT EXISTS processing_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  operation TEXT,
  original_files TEXT[],
  result_file TEXT,
  processing_time INTEGER, -- in milliseconds
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'completed',
  error TEXT,
  performance_metrics JSONB,
  is_batch_operation BOOLEAN DEFAULT FALSE,
  size_reduction NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  tier TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT,
  description TEXT,
  steps JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create processing_stats table for analytics
CREATE TABLE IF NOT EXISTS processing_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  operation_type TEXT,
  file_size BIGINT,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own processing history" ON processing_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own processing history" ON processing_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own workflows" ON workflows
  FOR SELECT USING (user_id = auth.uid());

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update updated_at column
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at 
    BEFORE UPDATE ON workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_processing_history_user_id ON processing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_history_created_at ON processing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_history_operation ON processing_history(operation);
CREATE INDEX IF NOT EXISTS idx_processing_history_status ON processing_history(status);

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_is_public ON workflows(is_public);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'default.jpg')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create user profile when a new user signs up via Supabase Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();