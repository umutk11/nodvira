CREATE TABLE IF NOT EXISTS uploaded_files (
  id BIGSERIAL PRIMARY KEY,
  stored_name VARCHAR(100) NOT NULL UNIQUE,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(40) NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  public_path TEXT NOT NULL UNIQUE,
  created_by BIGINT NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS uploaded_files_active_created_idx
  ON uploaded_files (created_at DESC)
  WHERE deleted_at IS NULL;
