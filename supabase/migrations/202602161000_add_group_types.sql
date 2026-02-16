-- Add type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'type') THEN
        ALTER TABLE groups ADD COLUMN type text NOT NULL DEFAULT 'other';
    END IF;
END $$;

-- Add constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'groups_type_check') THEN
        ALTER TABLE groups ADD CONSTRAINT groups_type_check CHECK (type IN ('home', 'trip', 'couple', 'other'));
    END IF;
END $$;

-- Add start_date and end_date columns if not exist
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS start_date timestamptz,
ADD COLUMN IF NOT EXISTS end_date timestamptz;

-- Add comment
COMMENT ON COLUMN groups.type IS 'Type of group: home, trip, couple, other';
