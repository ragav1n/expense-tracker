-- Add currency to buckets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'buckets' AND column_name = 'currency'
    ) THEN
        ALTER TABLE buckets 
        ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
    END IF;
END $$;
