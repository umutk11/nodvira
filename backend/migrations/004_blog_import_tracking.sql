ALTER TABLE blog_posts
  ADD COLUMN import_source VARCHAR(40),
  ADD COLUMN import_checksum CHAR(64),
  ADD COLUMN imported_at TIMESTAMPTZ;

ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_import_metadata_complete CHECK (
    (import_source IS NULL AND import_checksum IS NULL AND imported_at IS NULL)
    OR
    (import_source IS NOT NULL AND import_checksum IS NOT NULL AND imported_at IS NOT NULL)
  );

CREATE INDEX blog_posts_import_source_idx
  ON blog_posts (import_source)
  WHERE import_source IS NOT NULL;

