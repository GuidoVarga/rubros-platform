CREATE OR REPLACE FUNCTION update_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_location_trigger
BEFORE INSERT OR UPDATE ON "Business"
FOR EACH ROW EXECUTE FUNCTION update_location();