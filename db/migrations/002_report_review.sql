ALTER TABLE cachis.reports
  ADD COLUMN resolved_at timestamptz,
  ADD COLUMN resolved_by text,
  ADD COLUMN resolution text CHECK (resolution IN ('dismissed','paused'));

CREATE INDEX reports_open_idx ON cachis.reports(created_at DESC) WHERE resolved_at IS NULL;
CREATE INDEX reports_reporter_recent_idx ON cachis.reports(reporter_id,created_at DESC);
