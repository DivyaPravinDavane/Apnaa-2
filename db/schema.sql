-- ============================================================================
--  Apnaa Smart Society - MySQL 8.0+ schema
--  WARNING: this script drops and recreates every table.
--  Run with:  npm run db:setup
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS facility_check_ins;
DROP TABLE IF EXISTS security_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS media_items;
DROP TABLE IF EXISTS albums;
DROP TABLE IF EXISTS event_rsvps;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS notice_reads;
DROP TABLE IF EXISTS notice_acknowledgements;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS visitors;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS societies;

CREATE TABLE societies (
  id                    VARCHAR(64)  NOT NULL,
  name                  VARCHAR(160) NOT NULL,
  address               VARCHAR(255) NULL,
  total_households      INT UNSIGNED NOT NULL DEFAULT 0,
  total_units           INT UNSIGNED NOT NULL DEFAULT 0,
  next_maintenance_date DATE         NULL,
  next_maintenance_note VARCHAR(255) NULL,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE users (
  id               VARCHAR(64)  NOT NULL,
  society_id       VARCHAR(64)  NOT NULL,
  name             VARCHAR(120) NOT NULL,
  email            VARCHAR(190) NOT NULL,
  phone            VARCHAR(32)  NOT NULL,
  password_hash    VARCHAR(255) NULL,
  role             ENUM('resident', 'admin', 'security', 'facility') NOT NULL DEFAULT 'resident',
  unit             VARCHAR(32)  NOT NULL DEFAULT '',
  wing             VARCHAR(64)  NOT NULL DEFAULT '',
  floor            VARCHAR(32)  NOT NULL DEFAULT '',
  avatar           VARCHAR(512) NOT NULL DEFAULT '',
  membership_type  ENUM('Owner', 'Tenant', 'Family Member') NOT NULL DEFAULT 'Owner',
  bio              TEXT         NULL,
  interests        JSON         NULL,
  is_phone_public  TINYINT(1)   NOT NULL DEFAULT 0,
  is_email_public  TINYINT(1)   NOT NULL DEFAULT 0,
  is_active        TINYINT(1)   NOT NULL DEFAULT 1,
  -- Soft-deleted accounts stay in the table so visitor/booking/audit history
  -- keeps its foreign keys, but they disappear from every list and login path.
  deleted_at       DATETIME     NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone),
  KEY idx_users_society_role (society_id, role),
  KEY idx_users_unit (society_id, unit),
  CONSTRAINT fk_users_society FOREIGN KEY (society_id) REFERENCES societies (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE rate_limits (
  bucket_key  VARCHAR(190) NOT NULL,
  hits        INT UNSIGNED NOT NULL DEFAULT 0,
  reset_at    DATETIME     NOT NULL,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (bucket_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE otp_codes (
  id          CHAR(36)     NOT NULL,
  user_id     VARCHAR(64)  NULL,
  mobile      VARCHAR(32)  NOT NULL,
  code_hash   VARCHAR(255) NOT NULL,
  expires_at  DATETIME     NOT NULL,
  attempts    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  consumed_at DATETIME     NULL,
  request_ip  VARCHAR(64)  NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_otp_mobile_created (mobile, created_at),
  CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE sessions (
  id          CHAR(36)     NOT NULL,
  user_id     VARCHAR(64)  NOT NULL,
  token_hash  CHAR(64)     NOT NULL,
  ip          VARCHAR(64)  NULL,
  user_agent  VARCHAR(255) NULL,
  expires_at  DATETIME     NOT NULL,
  revoked_at  DATETIME     NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expiry (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE visitors (
  id              VARCHAR(64)  NOT NULL,
  society_id      VARCHAR(64)  NOT NULL,
  resident_id     VARCHAR(64)  NOT NULL,
  resident_name   VARCHAR(120) NOT NULL,
  name            VARCHAR(120) NOT NULL,
  phone           VARCHAR(32)  NOT NULL,
  visit_date      DATE         NOT NULL,
  arrival_time    VARCHAR(16)  NOT NULL,
  departure_time  VARCHAR(16)  NULL,
  purpose         VARCHAR(160) NOT NULL DEFAULT 'Visit',
  visitor_count   INT UNSIGNED NOT NULL DEFAULT 1,
  vehicle_type    ENUM('None', 'Two-Wheeler', 'Car') NOT NULL DEFAULT 'None',
  vehicle_number  VARCHAR(32)  NOT NULL DEFAULT '',
  unit            VARCHAR(32)  NOT NULL,
  status          ENUM('expected', 'pending', 'approved', 'denied', 'checked_in', 'checked_out', 'cancelled', 'expired')
                  NOT NULL DEFAULT 'expected',
  pass_code       VARCHAR(32)  NOT NULL,
  notes           TEXT         NULL,
  approved_at     DATETIME     NULL,
  entry_time      VARCHAR(16)  NULL,
  exit_time       VARCHAR(16)  NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_visitors_pass_code (pass_code),
  KEY idx_visitors_society_status (society_id, status),
  KEY idx_visitors_resident (resident_id, visit_date),
  KEY idx_visitors_visit_date (society_id, visit_date),
  CONSTRAINT fk_visitors_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_visitors_resident FOREIGN KEY (resident_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE amenities (
  id                    VARCHAR(64)  NOT NULL,
  society_id            VARCHAR(64)  NOT NULL,
  name                  VARCHAR(120) NOT NULL,
  category              ENUM('Sports', 'Fitness', 'Indoor', 'Outdoor', 'Events') NOT NULL,
  description           TEXT         NOT NULL,
  location              VARCHAR(160) NOT NULL,
  capacity              INT UNSIGNED NOT NULL DEFAULT 1,
  operating_hours       VARCHAR(64)  NOT NULL,
  slot_duration_minutes INT UNSIGNED NOT NULL DEFAULT 60,
  cover_image           VARCHAR(512) NOT NULL DEFAULT '',
  gallery_images        JSON         NULL,
  rules                 JSON         NULL,
  facilities            JSON         NULL,
  status                ENUM('available', 'closed', 'maintenance') NOT NULL DEFAULT 'available',
  booking_horizon_days  INT UNSIGNED NOT NULL DEFAULT 7,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_amenities_society (society_id, status),
  CONSTRAINT fk_amenities_society FOREIGN KEY (society_id) REFERENCES societies (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE bookings (
  id                VARCHAR(64)  NOT NULL,
  society_id        VARCHAR(64)  NOT NULL,
  booking_reference VARCHAR(32)  NOT NULL,
  amenity_id        VARCHAR(64)  NOT NULL,
  amenity_name      VARCHAR(120) NOT NULL,
  amenity_image     VARCHAR(512) NOT NULL DEFAULT '',
  unit              VARCHAR(32)  NOT NULL,
  user_id           VARCHAR(64)  NOT NULL,
  user_name         VARCHAR(120) NOT NULL,
  booking_date      DATE         NOT NULL,
  time_slot         VARCHAR(32)  NOT NULL,
  guest_count       INT UNSIGNED NOT NULL DEFAULT 1,
  status            ENUM('confirmed', 'checked_in', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  qr_token          VARCHAR(128) NOT NULL,
  notes             TEXT         NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- A slot can only have one active (non-cancelled) booking. Multiple NULLs are
  -- allowed, so cancelled bookings do not block the slot.
  active_slot_key   VARCHAR(190)
                    GENERATED ALWAYS AS (
                      CASE
                        WHEN status <> 'cancelled'
                        THEN CONCAT(amenity_id, '|', booking_date, '|', time_slot)
                        ELSE NULL
                      END
                    ) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_reference (booking_reference),
  UNIQUE KEY uq_bookings_qr_token (qr_token),
  UNIQUE KEY uq_bookings_active_slot (active_slot_key),
  KEY idx_bookings_user (user_id, booking_date),
  KEY idx_bookings_society_date (society_id, booking_date),
  CONSTRAINT fk_bookings_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_bookings_amenity FOREIGN KEY (amenity_id) REFERENCES amenities (id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE notices (
  id                        VARCHAR(64)  NOT NULL,
  society_id                VARCHAR(64)  NOT NULL,
  title                     VARCHAR(200) NOT NULL,
  body                      TEXT         NOT NULL,
  category                  ENUM('Water Shutdown', 'Maintenance', 'Security Alert', 'AGM Notification', 'General Rules', 'Events') NOT NULL,
  priority                  ENUM('urgent', 'high', 'normal') NOT NULL DEFAULT 'normal',
  publish_date              DATE         NOT NULL,
  expiry_date               DATE         NULL,
  author                    VARCHAR(120) NOT NULL,
  attachment_name           VARCHAR(190) NULL,
  attachment_size           VARCHAR(32)  NULL,
  requires_acknowledgement  TINYINT(1)   NOT NULL DEFAULT 0,
  acknowledged_baseline     INT UNSIGNED NOT NULL DEFAULT 0,
  created_by                VARCHAR(64)  NULL,
  created_at                TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notices_society_date (society_id, publish_date),
  CONSTRAINT fk_notices_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_notices_author FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE notice_acknowledgements (
  notice_id       VARCHAR(64) NOT NULL,
  user_id         VARCHAR(64) NOT NULL,
  acknowledged_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notice_id, user_id),
  CONSTRAINT fk_ack_notice FOREIGN KEY (notice_id) REFERENCES notices (id) ON DELETE CASCADE,
  CONSTRAINT fk_ack_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE notice_reads (
  notice_id VARCHAR(64) NOT NULL,
  user_id   VARCHAR(64) NOT NULL,
  read_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notice_id, user_id),
  CONSTRAINT fk_read_notice FOREIGN KEY (notice_id) REFERENCES notices (id) ON DELETE CASCADE,
  CONSTRAINT fk_read_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE events (
  id          VARCHAR(64)  NOT NULL,
  society_id  VARCHAR(64)  NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT         NOT NULL,
  category    VARCHAR(64)  NOT NULL,
  event_date  DATE         NOT NULL,
  event_time  VARCHAR(64)  NOT NULL,
  venue       VARCHAR(160) NOT NULL,
  capacity    INT UNSIGNED NOT NULL DEFAULT 0,
  cover_image VARCHAR(512) NOT NULL DEFAULT '',
  organizer   VARCHAR(160) NOT NULL,
  attendees_baseline INT UNSIGNED NOT NULL DEFAULT 0,
  deadline    DATE         NULL,
  created_by  VARCHAR(64)  NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_events_society_date (society_id, event_date),
  CONSTRAINT fk_events_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_events_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE event_rsvps (
  event_id   VARCHAR(64) NOT NULL,
  user_id    VARCHAR(64) NOT NULL,
  status     ENUM('attending', 'tentative', 'not_attending') NOT NULL,
  updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id, user_id),
  CONSTRAINT fk_rsvp_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT fk_rsvp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE albums (
  id          VARCHAR(64)  NOT NULL,
  society_id  VARCHAR(64)  NOT NULL,
  title       VARCHAR(160) NOT NULL,
  category    VARCHAR(64)  NOT NULL,
  cover_image VARCHAR(512) NOT NULL DEFAULT '',
  album_date  DATE         NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_albums_society (society_id, album_date),
  CONSTRAINT fk_albums_society FOREIGN KEY (society_id) REFERENCES societies (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE media_items (
  id           VARCHAR(64)  NOT NULL,
  album_id     VARCHAR(64)  NOT NULL,
  url          VARCHAR(512) NOT NULL,
  title        VARCHAR(190) NOT NULL,
  uploader_id  VARCHAR(64)  NULL,
  uploader_name VARCHAR(120) NOT NULL,
  status       ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'pending',
  media_date   DATE         NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_media_album_status (album_id, status),
  CONSTRAINT fk_media_album FOREIGN KEY (album_id) REFERENCES albums (id) ON DELETE CASCADE,
  CONSTRAINT fk_media_uploader FOREIGN KEY (uploader_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id         VARCHAR(64)  NOT NULL,
  society_id VARCHAR(64)  NOT NULL,
  user_id    VARCHAR(64)  NOT NULL,
  title      VARCHAR(190) NOT NULL,
  message    TEXT         NOT NULL,
  type       ENUM('visitor', 'booking', 'notice', 'event', 'admin') NOT NULL DEFAULT 'admin',
  link       VARCHAR(190) NULL,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE security_logs (
  id           VARCHAR(64)  NOT NULL,
  society_id   VARCHAR(64)  NOT NULL,
  visitor_id   VARCHAR(64)  NULL,
  visitor_name VARCHAR(120) NOT NULL,
  unit         VARCHAR(32)  NOT NULL,
  gate         VARCHAR(120) NOT NULL,
  entry_time   VARCHAR(16)  NULL,
  exit_time    VARCHAR(16)  NULL,
  status       ENUM('entry', 'exit', 'denied') NOT NULL,
  guard_id     VARCHAR(64)  NULL,
  guard_name   VARCHAR(120) NOT NULL,
  pass_code    VARCHAR(32)  NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_security_logs_society (society_id, created_at),
  CONSTRAINT fk_security_logs_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_security_logs_visitor FOREIGN KEY (visitor_id) REFERENCES visitors (id) ON DELETE SET NULL,
  CONSTRAINT fk_security_logs_guard FOREIGN KEY (guard_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE facility_check_ins (
  id                VARCHAR(64)  NOT NULL,
  society_id        VARCHAR(64)  NOT NULL,
  booking_id        VARCHAR(64)  NULL,
  booking_reference VARCHAR(32)  NOT NULL,
  amenity_name      VARCHAR(120) NOT NULL,
  resident_name     VARCHAR(120) NOT NULL,
  unit              VARCHAR(32)  NOT NULL,
  time_slot         VARCHAR(32)  NOT NULL,
  attendee_count    INT UNSIGNED NOT NULL DEFAULT 1,
  status            ENUM('checked_in', 'completed') NOT NULL DEFAULT 'checked_in',
  checked_in_at     VARCHAR(16)  NOT NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_facility_society (society_id, created_at),
  CONSTRAINT fk_facility_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_facility_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id          VARCHAR(64)  NOT NULL,
  society_id  VARCHAR(64)  NOT NULL,
  actor_id    VARCHAR(64)  NULL,
  actor_name  VARCHAR(120) NOT NULL,
  action      VARCHAR(160) NOT NULL,
  details     TEXT         NOT NULL,
  ip          VARCHAR(64)  NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_society (society_id, created_at),
  CONSTRAINT fk_audit_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
