
# Database Updates Required

To enable the "Claim Jam" and "Edit Jam" features, you need to update your Supabase database schema.

Please run the following SQL in your Supabase SQL Editor:

```sql
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

-- 5. Create Policy: Admins can update all jams (Optional - replace 'your-admin-email' with your actual email)
-- You can also use a specific user ID or a role.
-- CREATE POLICY "Admins can update all jams" 
-- ON jams FOR UPDATE 
-- USING (auth.jwt() ->> 'email' = 'your-admin-email@example.com');
```

## How to Claim a Jam manually (for now)

Since we haven't built an automated "Claim Approval" system yet, you can manually assign a jam to a user in the Supabase Table Editor:

1.  Go to the `auth.users` table and copy the `id` (UUID) of the user you want to make the host.
2.  Go to the `jams` table.
3.  Find the jam row.
4.  Paste the UUID into the `owner_id` column.
5.  Save.

Now that user will see the "Edit Jam" button when they log in!
