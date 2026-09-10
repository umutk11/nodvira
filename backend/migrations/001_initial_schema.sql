CREATE TABLE admins (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(120),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admins_email_lowercase CHECK (email = LOWER(email))
);

CREATE TABLE contact_requests (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  company VARCHAR(160),
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(40),
  service VARCHAR(40) NOT NULL,
  message TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  admin_note TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  CONSTRAINT contact_requests_service_valid CHECK (
    service IN ('web', 'software', 'network', 'system', 'consulting', 'other')
  ),
  CONSTRAINT contact_requests_status_valid CHECK (
    status IN ('new', 'read', 'closed')
  )
);

CREATE TABLE blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  excerpt VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  image_path TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blog_posts_category_valid CHECK (
    category IN ('web', 'software', 'network', 'system', 'transformation', 'consulting')
  ),
  CONSTRAINT blog_posts_status_valid CHECK (status IN ('draft', 'published')),
  CONSTRAINT blog_posts_slug_valid CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  summary VARCHAR(800) NOT NULL,
  category VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  image_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_category_valid CHECK (
    category IN ('web', 'software', 'network', 'system', 'consulting')
  ),
  CONSTRAINT projects_status_valid CHECK (status IN ('draft', 'published')),
  CONSTRAINT projects_slug_valid CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX contact_requests_status_created_idx
  ON contact_requests (status, created_at DESC);

CREATE INDEX blog_posts_publication_idx
  ON blog_posts (status, published_at DESC);

CREATE INDEX blog_posts_category_idx
  ON blog_posts (category, status, published_at DESC);

CREATE INDEX projects_publication_idx
  ON projects (status, sort_order, published_at DESC);

CREATE INDEX projects_category_idx
  ON projects (category, status, sort_order);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admins_set_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER contact_requests_set_updated_at
BEFORE UPDATE ON contact_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER blog_posts_set_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER projects_set_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

