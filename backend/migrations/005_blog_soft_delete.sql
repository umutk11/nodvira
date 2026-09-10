ALTER TABLE blog_posts
  ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX blog_posts_admin_listing_idx
  ON blog_posts (deleted_at, status, updated_at DESC);

