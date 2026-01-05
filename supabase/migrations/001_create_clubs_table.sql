-- Create clubs table if not exists
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  images TEXT[],
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clubs_owner_id ON clubs(owner_id);
CREATE INDEX IF NOT EXISTS idx_clubs_city ON clubs(city);
CREATE INDEX IF NOT EXISTS idx_clubs_location ON clubs USING GIST (
  ll_to_earth(latitude, longitude)
);

-- Enable RLS (Row Level Security)
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view clubs" ON clubs
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own clubs" ON clubs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own clubs" ON clubs
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own clubs" ON clubs
  FOR DELETE USING (auth.uid() = owner_id);

-- Function to find nearby clubs
CREATE OR REPLACE FUNCTION get_nearby_clubs(
  lat NUMERIC,
  lon NUMERIC,
  radius_meters NUMERIC
)
RETURNS SETOF clubs AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM clubs
  WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND earth_distance(
      ll_to_earth(latitude, longitude),
      ll_to_earth(lat, lon)
    ) <= radius_meters
  ORDER BY earth_distance(
    ll_to_earth(latitude, longitude),
    ll_to_earth(lat, lon)
  );
END;
$$ LANGUAGE plpgsql;
