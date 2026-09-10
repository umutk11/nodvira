ALTER TABLE blog_posts
  ADD COLUMN seo_title VARCHAR(70),
  ADD COLUMN meta_description VARCHAR(180),
  ADD COLUMN image_alt VARCHAR(300),
  ADD COLUMN author_name VARCHAR(160),
  ADD COLUMN reviewer_name VARCHAR(160);

ALTER TABLE projects
  ADD COLUMN seo_title VARCHAR(70),
  ADD COLUMN meta_description VARCHAR(180),
  ADD COLUMN image_alt VARCHAR(300);

UPDATE blog_posts
SET seo_title = LEFT(title || ' | NODVIRA', 70),
    meta_description = LEFT(excerpt, 180),
    image_alt = CASE WHEN image_path IS NULL THEN NULL ELSE LEFT(title || ' kapak görseli', 300) END,
    author_name = 'NODVIRA'
WHERE seo_title IS NULL;

UPDATE projects
SET seo_title = LEFT(title || ' | NODVIRA', 70),
    meta_description = LEFT(summary, 180),
    image_alt = CASE WHEN image_path IS NULL THEN NULL ELSE LEFT(title || ' proje kapak görseli', 300) END
WHERE seo_title IS NULL;
