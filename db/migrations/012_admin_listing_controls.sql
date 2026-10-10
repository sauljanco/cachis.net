ALTER TABLE cachis.listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE cachis.listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('pending','published','paused','closed','rejected','deleted'));

ALTER TABLE cachis.reports DROP CONSTRAINT IF EXISTS reports_resolution_check;
ALTER TABLE cachis.reports ADD CONSTRAINT reports_resolution_check
  CHECK (resolution IN ('dismissed','paused','removed'));

CREATE TABLE IF NOT EXISTS cachis.listing_admin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES cachis.listings(id),
  admin_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('pause','resume','delete','whatsapp_updated')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS listing_admin_events_listing_idx
  ON cachis.listing_admin_events(listing_id,created_at DESC);
REVOKE ALL ON cachis.listing_admin_events FROM PUBLIC;
