BEGIN;
CREATE SCHEMA IF NOT EXISTS cachis;
CREATE TABLE IF NOT EXISTS cachis.locations (
 id text PRIMARY KEY,
 name text NOT NULL,
 kind text NOT NULL CHECK (kind IN ('country','department','municipality','community')),
 parent_id text REFERENCES cachis.locations(id)
);
INSERT INTO cachis.locations(id,name,kind,parent_id) VALUES
 ('BO','Bolivia','country',NULL),
 ('BO-S','Santa Cruz','department','BO'),
 ('BO-S-SJ','San Julián','municipality','BO-S')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS cachis.listings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id text NOT NULL,
 title text NOT NULL CHECK (char_length(title) BETWEEN 8 AND 100),
 category text NOT NULL CHECK (category IN ('Motos','Vehículos','Lotes','Casas y departamentos')),
 operation text NOT NULL CHECK (operation IN ('Venta','Alquiler','Anticrético')),
 price numeric(14,2) NOT NULL CHECK (price>0 AND price<=999999999),
 currency char(3) NOT NULL DEFAULT 'BOB' CHECK (currency='BOB'),
 location_id text NOT NULL DEFAULT 'BO-S-SJ' REFERENCES cachis.locations(id),
 zone text NOT NULL CHECK (char_length(zone) BETWEEN 2 AND 100),
 description text NOT NULL CHECK (char_length(description) BETWEEN 20 AND 3000),
 contact_name text NOT NULL CHECK (char_length(contact_name) BETWEEN 2 AND 80),
 whatsapp text NOT NULL CHECK (whatsapp ~ '^591[67][0-9]{7}$'),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published','paused','closed','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (operation='Venta' OR category='Casas y departamentos')
);
CREATE INDEX IF NOT EXISTS listings_public_recent_idx ON cachis.listings(created_at DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS listings_owner_idx ON cachis.listings(owner_id,created_at DESC);
CREATE INDEX IF NOT EXISTS listings_category_price_idx ON cachis.listings(category,operation,price) WHERE status='published';
CREATE TABLE IF NOT EXISTS cachis.property_details (
 listing_id uuid PRIMARY KEY REFERENCES cachis.listings(id) ON DELETE CASCADE,
 area_m2 numeric(12,2) CHECK(area_m2>0),
 bedrooms smallint CHECK(bedrooms>=0),
 bathrooms smallint CHECK(bathrooms>=0),
 term_months smallint CHECK(term_months>0)
);
CREATE TABLE IF NOT EXISTS cachis.vehicle_details (
 listing_id uuid PRIMARY KEY REFERENCES cachis.listings(id) ON DELETE CASCADE,
 brand text,
 model text,
 year smallint CHECK(year BETWEEN 1900 AND 2100),
 mileage integer CHECK(mileage>=0),
 engine_cc integer CHECK(engine_cc>0)
);
CREATE TABLE IF NOT EXISTS cachis.listing_photos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 listing_id uuid NOT NULL REFERENCES cachis.listings(id) ON DELETE CASCADE,
 object_key text NOT NULL UNIQUE,
 position smallint NOT NULL CHECK(position BETWEEN 0 AND 4),
 UNIQUE(listing_id,position)
);
CREATE TABLE IF NOT EXISTS cachis.reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 listing_id uuid NOT NULL REFERENCES cachis.listings(id),
 reporter_id text NOT NULL,
 reason text NOT NULL CHECK(char_length(reason) BETWEEN 10 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(listing_id,reporter_id)
);
CREATE TABLE IF NOT EXISTS cachis.moderation_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 listing_id uuid NOT NULL REFERENCES cachis.listings(id),
 moderator_id text NOT NULL,
 decision text NOT NULL CHECK(decision IN ('published','rejected')),
 created_at timestamptz NOT NULL DEFAULT now()
);
-- Esquema privado: acceso exclusivamente mediante el servidor, consultas con
-- propietario explícito y autorización de sesión. No exponer en Data API.
REVOKE ALL ON SCHEMA cachis FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA cachis FROM PUBLIC;
COMMIT;
