-- Create buckets table
CREATE TABLE IF NOT EXISTS buckets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    budget NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'trip', -- 'trip', 'event', 'project', 'other'
    icon TEXT,
    color TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE buckets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'buckets' AND policyname = 'Users can manage their own buckets'
    ) THEN
        CREATE POLICY "Users can manage their own buckets" ON buckets
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add bucket_id to transactions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'bucket_id'
    ) THEN
        ALTER TABLE transactions 
        ADD COLUMN bucket_id UUID REFERENCES buckets(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable Realtime for buckets
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'buckets') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE buckets;
    END IF;
END $$;
