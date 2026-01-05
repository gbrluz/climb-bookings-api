-- Create a view that extracts latitude and longitude from location geometry
CREATE OR REPLACE VIEW clubs_with_coordinates AS
SELECT
  id,
  owner_id,
  name,
  city,
  state,
  address,
  phone,
  images,
  commission_rate,
  created_at,
  location,
  ST_Y(location::geometry) as latitude,
  ST_X(location::geometry) as longitude
FROM clubs;

-- Grant permissions
GRANT SELECT ON clubs_with_coordinates TO anon, authenticated;
