-- Chef Patrick's Kitchen — MySQL / MariaDB schema.
-- Run through `npm run db:setup` (scripts/db-setup.mjs), which creates the database, applies this
-- file, loads database/seed.sql and creates the first admin user.

SET NAMES utf8mb4;

-- ---------- staff accounts and sessions ----------

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,             -- bcrypt
  role          ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  CHAR(64) PRIMARY KEY,                -- sha256 of the cookie token; the token itself is never stored
  user_id     INT UNSIGNED NOT NULL,
  expires_at  DATETIME NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- menu ----------

CREATE TABLE IF NOT EXISTS menu_categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(80) NOT NULL UNIQUE,
  name       VARCHAR(80) NOT NULL,
  position   INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_items (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(160) NOT NULL,
  note         VARCHAR(40) NULL,                   -- e.g. "+₱25"
  price        DECIMAL(10,2) NULL,                 -- internal; the public menu shows no prices
  image        VARCHAR(255) NULL,
  sold         INT UNSIGNED NOT NULL DEFAULT 0,    -- staff-maintained count for "Popular menu items"
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  is_demo      TINYINT(1) NOT NULL DEFAULT 0,
  position     INT NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
  INDEX idx_items_category (category_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- catering packages ----------

CREATE TABLE IF NOT EXISTS packages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(60) NOT NULL,
  tier        VARCHAR(20) NOT NULL DEFAULT 'gold',
  guests      INT UNSIGNED NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  for_who     VARCHAR(300) NOT NULL DEFAULT '',
  inclusions  JSON NOT NULL,
  sample_menu JSON NOT NULL,
  popular     TINYINT(1) NOT NULL DEFAULT 0,
  position    INT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- bookings ----------

CREATE TABLE IF NOT EXISTS reservations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(190) NOT NULL,
  phone       VARCHAR(40) NOT NULL,
  event_date  DATE NOT NULL,
  event_time  CHAR(5) NOT NULL,                    -- HH:mm
  guests      INT UNSIGNED NOT NULL,
  event_type  VARCHAR(30) NOT NULL,
  message     TEXT NULL,
  status      ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  notes       TEXT NULL,
  is_demo     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_res_status (status, created_at),
  INDEX idx_res_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  event_type     VARCHAR(30) NOT NULL,
  event_date     DATE NOT NULL,
  event_time     CHAR(5) NULL,
  location       VARCHAR(160) NOT NULL DEFAULT '',
  guests         INT UNSIGNED NOT NULL DEFAULT 0,
  amount         DECIMAL(12,2) NOT NULL DEFAULT 0,  -- contract value; feeds the revenue report
  status         ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  notes          TEXT NULL,
  reservation_id INT UNSIGNED NULL,
  is_demo        TINYINT(1) NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
  INDEX idx_events_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(190) NOT NULL,
  phone       VARCHAR(40) NULL,
  subject     VARCHAR(120) NOT NULL,
  message     TEXT NOT NULL,
  status      ENUM('new','in_progress','resolved') NOT NULL DEFAULT 'new',
  admin_note  TEXT NULL,
  is_demo     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_inq_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- website content ----------

CREATE TABLE IF NOT EXISTS gallery (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  src        VARCHAR(255) NOT NULL,
  width      INT UNSIGNED NOT NULL,
  height     INT UNSIGNED NOT NULL,
  alt        VARCHAR(200) NOT NULL,
  caption    VARCHAR(80) NULL,
  position   INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS venue_areas (
  id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  position INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS venues (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  area_id     INT UNSIGNED NULL,                   -- NULL = one of CPK's own halls
  name        VARCHAR(120) NOT NULL,
  address     VARCHAR(200) NULL,
  min_guests  INT UNSIGNED NOT NULL DEFAULT 0,
  max_guests  INT UNSIGNED NOT NULL,
  position    INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_venues_area FOREIGN KEY (area_id) REFERENCES venue_areas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote      VARCHAR(400) NOT NULL,
  author     VARCHAR(80) NOT NULL,
  event      VARCHAR(80) NOT NULL DEFAULT '',
  published  TINYINT(1) NOT NULL DEFAULT 1,
  is_sample  TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurant info, contact, social links, SEO, appearance, kiddie menu: one JSON value per key.
CREATE TABLE IF NOT EXISTS settings (
  `key`      VARCHAR(40) PRIMARY KEY,
  value      JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
