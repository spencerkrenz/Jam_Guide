-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all claims" ON jam_claims;
DROP POLICY IF EXISTS "Admins can update claims" ON jam_claims;

-- Re-create "Admins can view all claims" with case-insensitive email check
CREATE POLICY "Admins can view all claims" 
ON jam_claims FOR SELECT 
USING (
  lower(auth.jwt() ->> 'email') IN ('spencerkrenz@gmail.com', 'spencer@jamguide.org')
);

-- Re-create "Admins can update claims" with case-insensitive email check
CREATE POLICY "Admins can update claims" 
ON jam_claims FOR UPDATE 
USING (
  lower(auth.jwt() ->> 'email') IN ('spencerkrenz@gmail.com', 'spencer@jamguide.org')
);

-- Fix jams update policy for admins
DROP POLICY IF EXISTS "Admins can update any jam" ON jams;

CREATE POLICY "Admins can update any jam" 
ON jams FOR UPDATE 
USING (
  lower(auth.jwt() ->> 'email') IN ('spencerkrenz@gmail.com', 'spencer@jamguide.org')
);

-- Ensure the table has RLS enabled
ALTER TABLE jam_claims ENABLE ROW LEVEL SECURITY;
