BEGIN;

ALTER TABLE cachis.listings DROP CONSTRAINT listings_category_check;
ALTER TABLE cachis.listings ADD CONSTRAINT listings_category_check CHECK (
  category IN ('Motos','Vehículos','Lotes','Terrenos y parcelas','Casas y departamentos','Maquinaria agrícola','Electrónicos','Otros')
);
ALTER TABLE cachis.listings DROP CONSTRAINT listings_check;
ALTER TABLE cachis.listings ADD CONSTRAINT listings_check CHECK (
  operation = 'Venta' OR
  (operation = 'Alquiler' AND category IN ('Casas y departamentos','Terrenos y parcelas','Maquinaria agrícola')) OR
  (operation = 'Anticrético' AND category = 'Casas y departamentos')
);

CREATE TABLE cachis.site_view_counts (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  views bigint NOT NULL DEFAULT 0 CHECK (views >= 0)
);
CREATE TABLE cachis.listing_view_counts (
  listing_id uuid PRIMARY KEY REFERENCES cachis.listings(id) ON DELETE CASCADE,
  views bigint NOT NULL DEFAULT 0 CHECK (views >= 0)
);
CREATE TABLE cachis.view_events (
  visitor_id uuid NOT NULL,
  listing_id uuid REFERENCES cachis.listings(id) ON DELETE CASCADE,
  viewed_on date NOT NULL DEFAULT current_date
);
CREATE UNIQUE INDEX view_events_site_daily_idx ON cachis.view_events(visitor_id, viewed_on) WHERE listing_id IS NULL;
CREATE UNIQUE INDEX view_events_listing_daily_idx ON cachis.view_events(visitor_id, listing_id, viewed_on) WHERE listing_id IS NOT NULL;
CREATE INDEX view_events_date_idx ON cachis.view_events(viewed_on);

REVOKE ALL ON cachis.site_view_counts, cachis.listing_view_counts, cachis.view_events FROM PUBLIC;
COMMIT;
