-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_club_by_id(UUID);
DROP FUNCTION IF EXISTS get_clubs_by_owner_id(UUID);
DROP FUNCTION IF EXISTS get_clubs_by_city(TEXT);
DROP FUNCTION IF EXISTS get_all_clubs();

-- Function to get a single club by ID with coordinates
CREATE OR REPLACE FUNCTION get_club_by_id(club_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', c.id,
    'owner_id', c.owner_id,
    'name', c.name,
    'city', c.city,
    'state', c.state,
    'address', c.address,
    'phone', c.phone,
    'images', c.images,
    'commission_rate', c.commission_rate,
    'created_at', c.created_at,
    'latitude', ST_Y(c.location::geometry),
    'longitude', ST_X(c.location::geometry)
  )
  INTO result
  FROM clubs c
  WHERE c.id = club_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get clubs by owner ID with coordinates
CREATE OR REPLACE FUNCTION get_clubs_by_owner_id(p_owner_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', c.id,
      'owner_id', c.owner_id,
      'name', c.name,
      'city', c.city,
      'state', c.state,
      'address', c.address,
      'phone', c.phone,
      'images', c.images,
      'commission_rate', c.commission_rate,
      'created_at', c.created_at,
      'latitude', ST_Y(c.location::geometry),
      'longitude', ST_X(c.location::geometry)
    )
  )
  INTO result
  FROM clubs c
  WHERE c.owner_id = p_owner_id;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to get clubs by city with coordinates
CREATE OR REPLACE FUNCTION get_clubs_by_city(p_city TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', c.id,
      'owner_id', c.owner_id,
      'name', c.name,
      'city', c.city,
      'state', c.state,
      'address', c.address,
      'phone', c.phone,
      'images', c.images,
      'commission_rate', c.commission_rate,
      'created_at', c.created_at,
      'latitude', ST_Y(c.location::geometry),
      'longitude', ST_X(c.location::geometry)
    )
  )
  INTO result
  FROM clubs c
  WHERE c.city ILIKE '%' || p_city || '%';

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to get all clubs with coordinates
CREATE OR REPLACE FUNCTION get_all_clubs()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', c.id,
      'owner_id', c.owner_id,
      'name', c.name,
      'city', c.city,
      'state', c.state,
      'address', c.address,
      'phone', c.phone,
      'images', c.images,
      'commission_rate', c.commission_rate,
      'created_at', c.created_at,
      'latitude', ST_Y(c.location::geometry),
      'longitude', ST_X(c.location::geometry)
    )
  )
  INTO result
  FROM clubs c;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_club_by_id(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_clubs_by_owner_id(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_clubs_by_city(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_all_clubs() TO anon, authenticated;
