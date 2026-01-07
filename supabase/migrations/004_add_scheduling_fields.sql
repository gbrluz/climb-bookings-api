-- Add scheduling-related fields to clubs table
ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS opening_time TIME NOT NULL DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS closing_time TIME NOT NULL DEFAULT '22:00',
  ADD COLUMN IF NOT EXISTS zip_code VARCHAR(9),
  ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT false;

-- Add comment to explain the columns
COMMENT ON COLUMN clubs.opening_time IS 'Club opening time in HH:mm format';
COMMENT ON COLUMN clubs.closing_time IS 'Club closing time in HH:mm format';
COMMENT ON COLUMN clubs.zip_code IS 'Brazilian ZIP code (CEP) in format XXXXX-XXX or XXXXXXXX';
COMMENT ON COLUMN clubs.has_parking IS 'Whether the club has parking available';

-- Add slot_duration field to courts table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'courts'
  ) THEN
    ALTER TABLE courts
      ADD COLUMN IF NOT EXISTS slot_duration INTEGER NOT NULL DEFAULT 90;

    COMMENT ON COLUMN courts.slot_duration IS 'Duration of each time slot in minutes (30-180, multiple of 15)';

    -- Add constraint to ensure slot_duration is within valid range and multiple of 15
    ALTER TABLE courts
      DROP CONSTRAINT IF EXISTS courts_slot_duration_check;

    ALTER TABLE courts
      ADD CONSTRAINT courts_slot_duration_check
      CHECK (slot_duration >= 30 AND slot_duration <= 180 AND slot_duration % 15 = 0);
  END IF;
END $$;

-- Add check constraint for opening/closing times (closing must be after opening)
-- Note: This will be validated at application level since comparing TIME types
-- across midnight is complex in PostgreSQL
