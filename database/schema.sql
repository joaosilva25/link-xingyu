-- Todas as datas são gravadas em UTC pela aplicação.

CREATE TABLE IF NOT EXISTS banner_images (
  id CHAR(36) NOT NULL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL,
  data LONGBLOB NOT NULL,
  created_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS banners (
  id CHAR(36) NOT NULL PRIMARY KEY,
  internal_name VARCHAR(200) NOT NULL,
  image_url VARCHAR(2048) NOT NULL,
  image_path VARCHAR(255) NULL,
  destination_url VARCHAR(2048) NULL,
  alt_text VARCHAR(500) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  publish_at DATETIME(3) NULL,
  unpublish_at DATETIME(3) NULL,
  open_new_tab TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  deleted_at DATETIME(3) NULL,
  KEY banners_public_idx (deleted_at, enabled, sort_order),
  KEY banners_image_path_idx (image_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS banner_clicks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  banner_id CHAR(36) NOT NULL,
  clicked_at DATETIME(3) NOT NULL,
  referrer VARCHAR(500) NULL,
  user_agent VARCHAR(500) NULL,
  KEY banner_clicks_banner_id_idx (banner_id),
  KEY banner_clicks_clicked_at_idx (clicked_at),
  KEY banner_clicks_banner_clicked_at_idx (banner_id, clicked_at),
  CONSTRAINT banner_clicks_banner_fk FOREIGN KEY (banner_id) REFERENCES banners (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
