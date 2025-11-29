-- 1. Add owner_id column to jams table
ALTER TABLE jams ADD COLUMN owner_id UUID REFERENCES auth.users(id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE jams ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy: Everyone can view jams
CREATE POLICY "Everyone can view jams" 
ON jams FOR SELECT 
USING (true);

-- 4. Create Policy: Users can update their own jams
CREATE POLICY "Users can update their own jams" 
ON jams FOR UPDATE 
USING (auth.uid() = owner_id);

-- 5. Create jam_claims table
CREATE TABLE IF NOT EXISTS jam_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jam_id BIGINT REFERENCES jams(id) NOT NULL, -- Changed from UUID to BIGINT to match jams.id
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  phone_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable RLS on jam_claims
ALTER TABLE jam_claims ENABLE ROW LEVEL SECURITY;

-- 7. Policy: Users can insert their own claims
CREATE POLICY "Users can create claims" 
ON jam_claims FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 8. Policy: Users can view their own claims
CREATE POLICY "Users can view own claims" 
ON jam_claims FOR SELECT 
USING (auth.uid() = user_id);

-- 9. Policy: Admins can update any jam (Replace 'your_email@example.com' with your actual email)
-- This is required for the "Approve" button to work in the admin panel.
CREATE POLICY "Admins can update any jam" 
ON jams FOR UPDATE 
USING (auth.jwt() ->> 'email' IN ('spencerkrenz@gmail.com', 'your_email@example.com'));



-- 10. Policy: Admins can view all claims
CREATE POLICY "Admins can view all claims" 
ON jam_claims FOR SELECT 
USING (auth.jwt() ->> 'email' IN ('spencerkrenz@gmail.com', 'spencer@jamguide.org'));

-- 11. Policy: Admins can update claims (to approve/reject)
CREATE POLICY "Admins can update claims" 
ON jam_claims FOR UPDATE 
USING (auth.jwt() ->> 'email' IN ('spencerkrenz@gmail.com', 'spencer@jamguide.org'));
