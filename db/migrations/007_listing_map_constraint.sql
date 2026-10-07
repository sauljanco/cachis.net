ALTER TABLE cachis.listings DROP CONSTRAINT listings_map_point_pair;
ALTER TABLE cachis.listings ADD CONSTRAINT listings_map_point_pair CHECK (
  (latitude IS NULL) = (longitude IS NULL)
  AND (latitude IS NULL OR latitude BETWEEN -90 AND 90)
  AND (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);
