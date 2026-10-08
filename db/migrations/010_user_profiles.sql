BEGIN;
CREATE TABLE IF NOT EXISTS cachis.user_profiles (
  user_id text PRIMARY KEY,
  first_name text NOT NULL CHECK (char_length(first_name) BETWEEN 2 AND 60),
  last_name text NOT NULL DEFAULT '' CHECK (char_length(last_name) <= 60),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 24),
  address text NOT NULL DEFAULT '' CHECK (char_length(address) <= 160),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Estos datos personales solo los lee y modifica el servidor tras verificar
-- la sesión y comparar user_id con el propietario autenticado.
REVOKE ALL ON cachis.user_profiles FROM PUBLIC;
COMMIT;
