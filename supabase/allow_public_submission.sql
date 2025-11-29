-- Allow anyone (public) to insert new jams
-- This allows anonymous submissions as well as authenticated ones.
-- If authenticated, the app logic will attach the owner_id.

DROP POLICY IF EXISTS "Enable insert for everyone" ON jams;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON jams;

CREATE POLICY "Enable insert for everyone" 
ON jams FOR INSERT 
TO public 
WITH CHECK (true);
