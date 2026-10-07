CREATE TABLE cachis.lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES cachis.leads(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('Nota','Llamada','WhatsApp','Visita','Correo','Estado')),
  detail text NOT NULL CHECK (char_length(detail) BETWEEN 3 AND 1000),
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX lead_activities_lead_date_idx ON cachis.lead_activities(lead_id,created_at DESC);
REVOKE ALL ON cachis.lead_activities FROM PUBLIC;
