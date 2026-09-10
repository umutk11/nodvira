ALTER TABLE admins
  ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'admin',
  ADD COLUMN last_login_at TIMESTAMPTZ,
  ADD COLUMN failed_login_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN locked_until TIMESTAMPTZ,
  ADD CONSTRAINT admins_role_valid CHECK (role IN ('admin')),
  ADD CONSTRAINT admins_failed_login_count_valid CHECK (failed_login_count >= 0);

CREATE TABLE admin_sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX admin_sessions_expire_idx ON admin_sessions (expire);

