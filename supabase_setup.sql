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
