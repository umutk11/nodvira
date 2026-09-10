ALTER TABLE contact_requests
  ADD COLUMN notification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN notification_sent_at TIMESTAMPTZ,
  ADD COLUMN notification_error VARCHAR(500),
  ADD CONSTRAINT contact_requests_notification_status_valid
    CHECK (notification_status IN ('pending', 'sent', 'failed'));

CREATE INDEX contact_requests_notification_idx
  ON contact_requests (notification_status, created_at DESC);
