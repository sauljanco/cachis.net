CREATE TABLE cachis.leads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 listing_id uuid REFERENCES cachis.listings(id) ON DELETE SET NULL,
 contact_name text NOT NULL CHECK (char_length(contact_name) BETWEEN 2 AND 80),
 phone text CHECK (phone ~ '^591[67][0-9]{7}$'),
 interest text NOT NULL CHECK (char_length(interest) BETWEEN 5 AND 300),
 source text NOT NULL CHECK (source IN ('WhatsApp','Facebook','Presencial','Otro')),
 status text NOT NULL DEFAULT 'Nuevo' CHECK (status IN ('Nuevo','Contactado','Calificado','Visita/demo','Negociación','Cerrado','Perdido')),
 notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 1000),
 created_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_active_updated_idx ON cachis.leads(updated_at DESC) WHERE status NOT IN ('Cerrado','Perdido');
CREATE INDEX leads_listing_idx ON cachis.leads(listing_id) WHERE listing_id IS NOT NULL;
REVOKE ALL ON cachis.leads FROM PUBLIC;
