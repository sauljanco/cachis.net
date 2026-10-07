ALTER TABLE cachis.leads
  ADD COLUMN next_step text NOT NULL DEFAULT '' CHECK (char_length(next_step) <= 300),
  ADD COLUMN follow_up_at timestamptz;

CREATE INDEX leads_due_idx ON cachis.leads(follow_up_at)
  WHERE follow_up_at IS NOT NULL AND status NOT IN ('Cerrado','Perdido');
