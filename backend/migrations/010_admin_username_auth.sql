ALTER TABLE admins
  ADD COLUMN username VARCHAR(32);

UPDATE admins
SET username = 'legacy_admin_' || id;

ALTER TABLE admins
  ALTER COLUMN username SET NOT NULL,
  ADD CONSTRAINT admins_username_unique UNIQUE (username),
  ADD CONSTRAINT admins_username_format
    CHECK (username ~ '^[a-z0-9][a-z0-9_-]{2,31}$'),
  DROP CONSTRAINT admins_email_lowercase,
  DROP COLUMN email;
