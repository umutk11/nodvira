ALTER TABLE projects
  ADD COLUMN import_source VARCHAR(40),
  ADD COLUMN import_checksum CHAR(64),
  ADD COLUMN imported_at TIMESTAMPTZ,
  ADD COLUMN deleted_at TIMESTAMPTZ;

ALTER TABLE projects
  ADD CONSTRAINT projects_import_metadata_complete CHECK (
    (import_source IS NULL AND import_checksum IS NULL AND imported_at IS NULL)
    OR
    (import_source IS NOT NULL AND import_checksum IS NOT NULL AND imported_at IS NOT NULL)
  );

CREATE INDEX projects_admin_listing_idx
  ON projects (deleted_at, status, sort_order, updated_at DESC);

CREATE INDEX projects_import_source_idx
  ON projects (import_source)
  WHERE import_source IS NOT NULL;

