CREATE DATABASE IF NOT EXISTS `Apna society` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `Apna society`;

-- ============================================================================

--  Live Synced MySQL Dump - Updated at: 2026-11-05T11:08:13.152Z

--  Target Host: auth-db1947.hstgr.io | Database: u762329739_apnaaentrydb

-- ============================================================================



-- ============================================================================
--  Apnaentry Society (Westend Heights D...) - MySQL 8.0+ / MariaDB Schema
--  WARNING: this script drops and recreates every table.
--  Run with:  npm run db:setup   or import directly in phpMyAdmin
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS service_requests;
DROP TABLE IF EXISTS gate_updates;
DROP TABLE IF EXISTS unit_bills;
DROP TABLE IF EXISTS poll_votes;
DROP TABLE IF EXISTS community_polls;
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
  pin_code         VARCHAR(16)  NOT NULL DEFAULT '107864',
  gender           VARCHAR(24)  NOT NULL DEFAULT 'Male',
  date_of_birth    VARCHAR(32)  NOT NULL DEFAULT 'Not Available',
  blood_group      VARCHAR(16)  NOT NULL DEFAULT 'O+',
  govt_id_number   VARCHAR(64)  NOT NULL DEFAULT '********435E',
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

-- ============================================================================
--  Community Corner Polls & Candidate Votes (Mobile UI)
-- ============================================================================
CREATE TABLE community_polls (
  id                VARCHAR(64)  NOT NULL,
  society_id        VARCHAR(64)  NOT NULL,
  author_name       VARCHAR(120) NOT NULL,
  author_initial    VARCHAR(8)   NOT NULL DEFAULT 'E',
  group_name        VARCHAR(160) NOT NULL,
  publish_timestamp VARCHAR(64)  NOT NULL,
  title             VARCHAR(200) NOT NULL,
  subtitle          VARCHAR(255) NOT NULL,
  expires_on        VARCHAR(64)  NOT NULL,
  responses_count   INT UNSIGNED NOT NULL DEFAULT 0,
  min_select        INT UNSIGNED NOT NULL DEFAULT 15,
  max_select        INT UNSIGNED NOT NULL DEFAULT 15,
  candidates_json   JSON         NOT NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_polls_society (society_id, created_at),
  CONSTRAINT fk_polls_society FOREIGN KEY (society_id) REFERENCES societies (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE poll_votes (
  id                       VARCHAR(64) NOT NULL,
  poll_id                  VARCHAR(64) NOT NULL,
  user_id                  VARCHAR(64) NOT NULL,
  unit                     VARCHAR(32) NOT NULL,
  selected_candidates_json JSON        NOT NULL,
  created_at               TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_poll_user_vote (poll_id, user_id),
  CONSTRAINT fk_votes_poll FOREIGN KEY (poll_id) REFERENCES community_polls (id) ON DELETE CASCADE,
  CONSTRAINT fk_votes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================================
--  Bills & Payments (Statement, Dues, Payment History)
-- ============================================================================
CREATE TABLE unit_bills (
  id             VARCHAR(64)   NOT NULL,
  society_id     VARCHAR(64)   NOT NULL,
  unit           VARCHAR(32)   NOT NULL,
  user_id        VARCHAR(64)   NOT NULL,
  invoice_no     VARCHAR(64)   NOT NULL,
  title          VARCHAR(190)  NOT NULL,
  category       ENUM('Statement', 'Dues', 'Payment history') NOT NULL DEFAULT 'Dues',
  billing_period VARCHAR(64)   NOT NULL,
  amount         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status         ENUM('unpaid', 'paid', 'overdue') NOT NULL DEFAULT 'unpaid',
  due_date       DATE          NOT NULL,
  paid_at        DATETIME      NULL,
  payment_method VARCHAR(64)   NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bills_unit (society_id, unit, status),
  CONSTRAINT fk_bills_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_bills_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================================
--  Gate Updates (Cab, Exit pass, School bus) & Helpdesk Service Requests
-- ============================================================================
CREATE TABLE gate_updates (
  id          VARCHAR(64)  NOT NULL,
  society_id  VARCHAR(64)  NOT NULL,
  unit        VARCHAR(32)  NOT NULL,
  user_id     VARCHAR(64)  NOT NULL,
  update_type ENUM('Cab', 'Exit pass', 'School bus') NOT NULL,
  details     VARCHAR(255) NOT NULL,
  pass_code   VARCHAR(32)  NOT NULL,
  status      ENUM('active', 'completed', 'expired') NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_gate_updates_unit (society_id, unit, status),
  CONSTRAINT fk_gate_updates_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_gate_updates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE service_requests (
  id          VARCHAR(64)  NOT NULL,
  society_id  VARCHAR(64)  NOT NULL,
  unit        VARCHAR(32)  NOT NULL,
  user_id     VARCHAR(64)  NOT NULL,
  desk_type   ENUM('Service Desk', 'Request Desk', 'Helpdesk') NOT NULL DEFAULT 'Helpdesk',
  category    VARCHAR(120) NOT NULL,
  title       VARCHAR(190) NOT NULL,
  description TEXT         NOT NULL,
  status      ENUM('open', 'in_progress', 'resolved') NOT NULL DEFAULT 'open',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_service_requests_unit (society_id, unit, status),
  CONSTRAINT fk_service_requests_society FOREIGN KEY (society_id) REFERENCES societies (id),
  CONSTRAINT fk_service_requests_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;



SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `societies` (`id`, `name`, `address`, `total_households`, `total_units`, `next_maintenance_date`, `next_maintenance_note`, `created_at`) VALUES
  ('soc_green_valley_01', 'Westend Heights D... (Apnaentry Society)', 'Green Valley Road, Powai, Mumbai 400076', 248, 180, '2026-11-11', 'Quarterly fire safety audit & lift servicing', '2026-11-05 12:48:22');

INSERT INTO `users` (`id`, `society_id`, `name`, `email`, `phone`, `password_hash`, `role`, `unit`, `wing`, `floor`, `avatar`, `membership_type`, `pin_code`, `gender`, `date_of_birth`, `blood_group`, `govt_id_number`, `bio`, `interests`, `is_phone_public`, `is_email_public`, `is_active`, `deleted_at`, `created_at`, `updated_at`) VALUES
  ('usr_a701', 'soc_green_valley_01', 'Dr. Anita Roy', 'dr.anita@example.com', '+91 98333 99887', '$2b$12$cAMNZEh0yKAF8myqFQsXPuW2f5SDCQu3QYlRcFDWvGrt43QN/7WKG', 'resident', 'A-701', 'A Wing', '7th Floor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'Owner', '107864', 'Male', 'Not Available', 'O+', '********435E', 'Consultant Pediatrician at Apollo Hospital. Available for medical advice during society emergencies.', '["Medicine","Classical Music","Yoga"]', 0, 0, 1, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('usr_adm_01', 'soc_green_valley_01', 'Rajesh Nair', 'secretary@greenvalley.org', '+91 98200 11223', '$2b$12$cAMNZEh0yKAF8myqFQsXPuW2f5SDCQu3QYlRcFDWvGrt43QN/7WKG', 'admin', 'C-402', 'C Wing', '4th Floor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'Owner', '107864', 'Male', 'Not Available', 'O+', '********435E', 'Management Committee Secretary. Dedicated to transparent community operations.', '["Governance","Tennis","Solar Energy"]', 1, 1, 1, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('usr_b302', 'soc_green_valley_01', 'Sunita Patel', 'patels@example.com', '+91 98444 88776', '$2b$12$cAMNZEh0yKAF8myqFQsXPuW2f5SDCQu3QYlRcFDWvGrt43QN/7WKG', 'resident', 'B-302', 'B Wing', '3rd Floor', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', 'Owner', '107864', 'Male', 'Not Available', 'O+', '********435E', 'Retired senior educator. Active in community book exchanges.', '["Reading","Horticulture","Chess"]', 0, 0, 1, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('usr_b804', 'soc_green_valley_01', 'Kunal Singhal', 'kunal@example.com', '+91 98111 44556', '$2b$12$cAMNZEh0yKAF8myqFQsXPuW2f5SDCQu3QYlRcFDWvGrt43QN/7WKG', 'resident', 'B-804', 'B Wing', '8th Floor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'Tenant', '107864', 'Male', 'Not Available', 'O+', '********435E', 'Tech entrepreneur and marathon enthusiast.', '["Running","Cycling","Startups"]', 0, 0, 1, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('usr_c201', 'soc_green_valley_01', 'Ravi Deshmukh', 'ravi.deshmukh@example.com', '+91 98777 66554', '$2b$12$cAMNZEh0yKAF8myqFQsXPuW2f5SDCQu3QYlRcFDWvGrt43QN/7WKG', 'resident', 'C-201', 'C Wing', '2nd Floor', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80', 'Owner', '107864', 'Male', 'Not Available', 'O+', '********435E', 'Chartered accountant and society finance volunteer.', '["Finance","Cricket","Photography"]', 0, 0, 1, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('usr_d1102', 'soc_green_valley_01', 'Devika Krishnan', 'devika.k@example.com', '+91 98666 22110', '$2b$12$cAMNZEh0yKAF8myqFQsXPuW2f5SDCQu3QYlRcFDWvGrt43QN/7WKG', 'resident', 'D-1102', 'D Wing', '11th Floor', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', 'Owner', '107864', 'Male', 'Not Available', 'O+', '********435E', 'Environmental economist and terrace composting coordinator.', '["Zero Waste","Trekking","Table Tennis"]', 0, 0, 1, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('usr_fac_01', 'soc_green_valley_01', 'Anand Verma', 'facility@greenvalley.org', '+91 98999 55667', '$2b$12$cAMNZEh0yKAF8myqFQsXPuW2f5SDCQu3QYlRcFDWvGrt43QN/7WKG', 'facility', 'Clubhouse Desk', 'Clubhouse', 'Ground', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', 'Owner', '107864', 'Male', 'Not Available', 'O+', '********435E', 'Operations and Facility Manager overseeing amenities, safety, and hygiene.', '[]', 0, 0, 1, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('usr_res_01', 'soc_green_valley_01', 'Priya Sharma', 'priya.sharma@example.com', '+91 98765 43210', '$2b$12$cAMNZEh0yKAF8myqFQsXPuW2f5SDCQu3QYlRcFDWvGrt43QN/7WKG', 'resident', 'A-1204', 'A Wing', '12th Floor', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Owner', '107864', 'Male', 'Not Available', 'O+', '********435E', 'Architect & design enthusiast. Living in Green Valley Residency for 4 years.', '["Badminton","Sustainable Living","Book Club","Gardening"]', 0, 0, 1, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('usr_sec_01', 'soc_green_valley_01', 'Vikram Singh', 'security.gate1@greenvalley.org', '+91 98111 22334', '$2b$12$cAMNZEh0yKAF8myqFQsXPuW2f5SDCQu3QYlRcFDWvGrt43QN/7WKG', 'security', 'Gate 1 Terminal', 'Main Gate', 'Ground', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'Owner', '107864', 'Male', 'Not Available', 'O+', '********435E', 'Chief Security Officer on duty at Gate 1.', '[]', 0, 0, 1, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24');

INSERT INTO `rate_limits` (`bucket_key`, `hits`, `reset_at`, `updated_at`) VALUES
  ('demo:login:ip:::1', 1, '2026-11-05 11:18:11', '2026-11-05 16:38:11');

INSERT INTO `sessions` (`id`, `user_id`, `token_hash`, `ip`, `user_agent`, `expires_at`, `revoked_at`, `created_at`) VALUES
  ('15719eb9-422d-4d7b-a035-117b5651b79d', 'usr_a701', '56dbccec29b5fd35e0a71180b73bc6f382c65c8138021ebe27ff573b5e02f0b8', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-11-05 15:52:15', '2026-11-05 09:22:04', '2026-11-05 13:22:15'),
  ('16321e8e-2227-412b-b4d3-ef5c5cc05cdb', 'usr_a701', '817eb938c90b03666232fe396c83a53d5bf9341e9b50768b06a658d042656200', '::1', 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Edg/156.0.0.0 Mobile Safari/537.36', '2026-11-05 19:08:11', NULL, '2026-11-05 16:38:11'),
  ('fc88db28-97bc-4a27-9fd5-4e17b8a688a3', 'usr_a701', 'fbea2907ab0b2404bfdaf9c32e06da888dd78cb711bbe4df59ce16ba78ebd732', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0', '2026-11-05 15:21:56', '2026-11-05 07:51:50', '2026-11-05 12:51:56');

INSERT INTO `visitors` (`id`, `society_id`, `resident_id`, `resident_name`, `name`, `phone`, `visit_date`, `arrival_time`, `departure_time`, `purpose`, `visitor_count`, `vehicle_type`, `vehicle_number`, `unit`, `status`, `pass_code`, `notes`, `approved_at`, `entry_time`, `exit_time`, `created_at`, `updated_at`) VALUES
  ('vis_01', 'soc_green_valley_01', 'usr_res_01', 'Priya Sharma', 'Rohan Mehta', '+91 98765 12345', '2026-11-05', '2:00 PM', '2:30 PM', 'Meeting', 1, 'Car', 'MH 02 EF 1234', 'A-1204', 'expected', 'V-9421', 'Discussing interior blueprints', '2026-11-05 06:48:20', NULL, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('vis_02', 'soc_green_valley_01', 'usr_res_01', 'Priya Sharma', 'Sneha Kapoor', '+91 98222 33445', '2026-11-05', '3:00 PM', NULL, 'Family Visit', 2, 'Car', 'MH 01 AB 9988', 'A-1204', 'pending', 'V-8812', 'Sister visiting with niece', NULL, NULL, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('vis_03', 'soc_green_valley_01', 'usr_res_01', 'Priya Sharma', 'Amit Sharma', '+91 98333 44556', '2026-11-05', '5:30 PM', NULL, 'Delivery', 1, 'Two-Wheeler', 'MH 04 XY 7711', 'A-1204', 'expected', 'V-7104', 'Furniture package delivery', '2026-11-05 06:18:20', NULL, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('vis_04', 'soc_green_valley_01', 'usr_b804', 'Kunal Singhal', 'Rahul Joshi', '+91 98444 55667', '2026-11-05', '10:12 AM', NULL, 'Guest', 1, 'Two-Wheeler', 'MH 02 AA 1122', 'B-804', 'checked_in', 'V-6590', NULL, '2026-11-05 05:18:20', '10:12 AM', NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('vis_05', 'soc_green_valley_01', 'usr_c201', 'Ravi Deshmukh', 'Maya Sen', '+91 98555 66778', '2026-11-04', '4:00 PM', NULL, 'Commercial Soliciting', 1, 'None', '', 'C-201', 'denied', 'V-5510', 'Resident declined unsolicited sales presentation', NULL, NULL, NULL, '2026-11-05 12:48:24', '2026-11-05 12:48:24');

INSERT INTO `amenities` (`id`, `society_id`, `name`, `category`, `description`, `location`, `capacity`, `operating_hours`, `slot_duration_minutes`, `cover_image`, `gallery_images`, `rules`, `facilities`, `status`, `booking_horizon_days`, `created_at`, `updated_at`) VALUES
  ('amenity_badminton', 'soc_green_valley_01', 'Badminton Court', 'Sports', 'Two indoor BWF-standard synthetic wooden courts equipped with anti-glare LED illumination and spectator seating gallery.', 'Clubhouse - 1st Floor', 16, '6:00 AM - 11:00 PM', 60, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80"]', '["Non-marking gum sole shoes are strictly enforced on the court surface.","Bookings are valid for 60 minutes only per slot.","Please bring your own racquets and shuttlecocks.","Turn off high-power court lighting upon leaving."]', '["Yonex-certified court matting","Pro LED flicker-free sports lighting","Viewing gallery","Water cooler dispenser"]', 'available', 7, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('amenity_banquet', 'soc_green_valley_01', 'Banquet Hall', 'Events', 'Opulent pillar-less celebration hall with acoustic ceiling panels, stage lighting, dedicated buffet catering corridor, and restrooms.', 'Clubhouse - Ground Floor West', 200, '9:00 AM - 11:00 PM', 240, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"]', '["Music and public sound systems must cease by 10:00 PM as per local quiet hours.","Deep cleaning fee applies if catering leftovers are not cleared by vendor.","Bookings must be requested at least 48 hours in advance."]', '["Dedicated food preparation kitchen","PA audio system & wireless microphones","Bridal/host green room","Central air conditioning"]', 'available', 30, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('amenity_clubhouse', 'soc_green_valley_01', 'Clubhouse Lounge', 'Indoor', 'Sophisticated multi-tier community lounge featuring plush seating, coffee bar setup, library reading corner, and Wi-Fi connectivity.', 'Clubhouse Central Complex', 100, '8:00 AM - 11:00 PM', 120, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"]', '["Maintain conversational volume levels in the library nook.","No wet swimwear permitted inside the carpeted lounge.","Private events require prior written permission from the administrator."]', '["High-speed Wi-Fi","Espresso machine & pantry counter","Books & magazine archive","Conference discussion table"]', 'available', 14, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('amenity_games', 'soc_green_valley_01', 'Indoor Games Arena', 'Indoor', 'Recreation zone featuring 2 championship Billiards/Snooker tables, 3 Table Tennis tables, and Carrom and Chess tables.', 'Clubhouse - 2nd Floor', 25, '9:00 AM - 10:00 PM', 60, 'https://images.unsplash.com/photo-1538356111053-748a48e1acb8?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1538356111053-748a48e1acb8?auto=format&fit=crop&w=800&q=80"]', '["Treat table felts with care; do not sit or lean excessively on snooker rails.","Sign out cues and balls at the facility desk."]', '["Full size 12ft snooker table","Stiga table tennis tables","Carrom boards & coins","Air conditioning"]', 'available', 7, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('amenity_gym', 'soc_green_valley_01', 'Gym & Fitness Studio', 'Fitness', 'Fully equipped modern gymnasium with commercial-grade cardio machines, free weights area, resistance stations, and dedicated stretching zone.', 'Wing B - Ground Floor', 30, '6:00 AM - 10:00 PM', 60, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80"]', '["Clean indoor athletic shoes and workout towel are strictly required.","Re-rack all dumbbells and weights after use.","Sanitize workout stations with provided disinfectant wipes after use.","Personal trainers from outside require committee registration."]', '["Treadmills & Ellipticals","Free weights dumbbell rack 2kg-40kg","Central AC & surround audio system","Locker facilities"]', 'available', 5, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('amenity_pool', 'soc_green_valley_01', 'Swimming Pool', 'Fitness', 'Temperature-controlled semi-Olympic swimming pool featuring an integrated kids splash pool, comfortable lounging deck, and certified lifeguard supervision.', 'Clubhouse Building - Ground Floor', 50, '6:00 AM - 10:00 PM', 60, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=800&q=80"]', '["Proper synthetic swimming attire is mandatory at all times.","Showers must be taken prior to pool entry.","Children under 12 must be accompanied by an adult.","No glassware or food permitted within 5 meters of the pool rim.","Maximum 4 guests allowed per household booking."]', '["Clean and well-maintained water","Changing rooms and hot water shower facilities","Lifeguard on duty during active slots","First-aid station"]', 'available', 7, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('amenity_tennis', 'soc_green_valley_01', 'Tennis Court', 'Sports', 'Regulation hard court with acrylic cushioning, high-perimeter safety mesh, and automated court lighting timer.', 'Outdoor Sports Enclave - South Wing', 12, '6:00 AM - 9:00 PM', 60, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80"]', '["Regulation tennis shoes only; no running or flat-bottom street shoes.","Singles/Doubles play max 60 minutes when other residents are waiting."]', '["Regulation height nets","Night match flood lights","Ball retriever carts","Benches with shade canopies"]', 'available', 7, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('amenity_terrace', 'soc_green_valley_01', 'Rooftop Terrace', 'Outdoor', 'Scenic landscaped sky deck offering panoramic 360-degree city views, open-air wooden pergola seating, and ambient warm string lighting.', 'Wing A - 18th Floor Terrace', 40, '8:00 AM - 10:00 PM', 120, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80"]', '["No fireworks or hazardous open-flame cooking permitted.","Children must be supervised around railings at all times.","Maximum 1 booking per household per month on weekends."]', '["Pergola wooden gazebos","Warm festoon lighting","Handwash sinks","Telescope viewing station"]', 'available', 14, '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('amenity_yoga', 'soc_green_valley_01', 'Yoga & Meditation Studio', 'Fitness', 'Tranquil studio space with natural bamboo flooring, full mirror walls, soothing acoustic diffusers, and meditation bolsters.', 'Clubhouse - 2nd Floor East', 20, '5:30 AM - 9:00 PM', 60, 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"]', '["Maintain complete silence inside the sanctuary.","Remove footwear at the entrance shoe cabinet.","Return mats and meditation blocks to their racks after practice."]', '["Premium cork and rubber yoga mats","Meditation zafus & bolsters","Aroma diffusers","Bluetooth ambient sound system"]', 'available', 7, '2026-11-05 12:48:24', '2026-11-05 12:48:24');

INSERT INTO `bookings` (`id`, `society_id`, `booking_reference`, `amenity_id`, `amenity_name`, `amenity_image`, `unit`, `user_id`, `user_name`, `booking_date`, `time_slot`, `guest_count`, `status`, `qr_token`, `notes`, `created_at`, `updated_at`) VALUES
  ('bk_01', 'soc_green_valley_01', 'BK-7842', 'amenity_pool', 'Swimming Pool', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=400&q=80', 'A-1204', 'usr_res_01', 'Priya Sharma', '2026-11-05', '7:00 AM - 8:00 AM', 2, 'confirmed', 'RES-BK-7842-POOL-CONFIRMED', 'Morning swim workout', '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('bk_02', 'soc_green_valley_01', 'BK-6901', 'amenity_badminton', 'Badminton Court', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&q=80', 'A-1204', 'usr_res_01', 'Priya Sharma', '2026-11-06', '6:00 PM - 7:00 PM', 3, 'confirmed', 'RES-BK-6901-BADM-CONFIRMED', 'Doubles match with neighbors', '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('bk_03', 'soc_green_valley_01', 'BK-5520', 'amenity_banquet', 'Banquet Hall', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80', 'C-402', 'usr_adm_01', 'Rajesh Nair', '2026-11-07', '6:00 PM - 10:00 PM', 75, 'confirmed', 'ADM-BK-5520-BANQ-CONFIRMED', 'Daughter graduation family dinner', '2026-11-05 12:48:24', '2026-11-05 12:48:24'),
  ('bk_449bf357-5dfa-4cda-bf87-484d86607537', 'soc_green_valley_01', 'BK-7884', 'amenity_gym', 'Gym & Fitness Studio', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', 'A-701', 'usr_a701', 'Dr. Anita Roy', '2026-11-05', '6:00 AM - 7:00 AM', 2, 'cancelled', 'SOCIETY|BK-7884|amenity_gym|2026-11-05', NULL, '2026-11-05 13:04:37', '2026-11-05 13:21:22');

INSERT INTO `notices` (`id`, `society_id`, `title`, `body`, `category`, `priority`, `publish_date`, `expiry_date`, `author`, `attachment_name`, `attachment_size`, `requires_acknowledgement`, `acknowledged_baseline`, `created_by`, `created_at`) VALUES
  ('not_01', 'soc_green_valley_01', 'Water Supply Shutdown - Overhead Tank Cleaning', 'Please note that the overhead storage water tanks across Wings A, B, and C will undergo scheduled deep hydraulic scrubbing and chlorination. Water supply will be temporarily paused between 10:00 AM and 2:00 PM tomorrow. Residents are kindly requested to store adequate water for daily morning and afternoon requirements.', 'Water Shutdown', 'urgent', '2026-11-05', '2026-11-06', 'Society Maintenance Committee', 'Tank_Cleaning_Schedule.pdf', '420 KB', 1, 184, NULL, '2026-11-05 12:48:24'),
  ('not_02', 'soc_green_valley_01', 'Annual General Body Meeting (AGM) 2026 Notification', 'The 12th Annual General Body Meeting of Green Valley Residency Co-operative Housing Society will be convened in the Clubhouse Banquet Hall. The agenda includes audited financial review, election of vacant committee seats, and solar rooftop rollout discussion.', 'AGM Notification', 'high', '2026-11-03', NULL, 'Management Committee Secretary', 'AGM_Agenda_And_Financials_2026.pdf', '2.1 MB', 0, 215, 'usr_adm_01', '2026-11-05 12:48:24'),
  ('not_03', 'soc_green_valley_01', 'Cultural Evening & Garba Raas Celebration', 'Join fellow residents for a joyful evening of traditional music, dandiya beats, and delicious multi-cuisine food stalls at the Central Garden Courtyard this Saturday starting at 6:30 PM. Traditional dress is encouraged!', 'Events', 'normal', '2026-11-02', NULL, 'Cultural Sub-Committee', NULL, NULL, 0, 0, NULL, '2026-11-05 12:48:24'),
  ('not_04', 'soc_green_valley_01', 'Society Parking & EV Charger Operational Guidelines', 'To ensure orderly traffic circulation, residents are requested to park strictly within their allotted numbered bays. Dual 22kW EV fast chargers in Basement 1 are now live and can be booked via the gate security console.', 'General Rules', 'normal', '2026-10-31', NULL, 'Security & Infrastructure Team', NULL, NULL, 1, 198, NULL, '2026-11-05 12:48:24');

INSERT INTO `notice_acknowledgements` (`notice_id`, `user_id`, `acknowledged_at`) VALUES
  ('not_04', 'usr_res_01', '2026-11-05 12:48:24');

INSERT INTO `notice_reads` (`notice_id`, `user_id`, `read_at`) VALUES
  ('not_02', 'usr_res_01', '2026-11-05 12:48:24'),
  ('not_04', 'usr_res_01', '2026-11-05 12:48:24');

INSERT INTO `events` (`id`, `society_id`, `title`, `description`, `category`, `event_date`, `event_time`, `venue`, `capacity`, `cover_image`, `organizer`, `attendees_baseline`, `deadline`, `created_by`, `created_at`) VALUES
  ('evt_01', 'soc_green_valley_01', 'Diwali Grand Community Celebration', 'Annual festival of lights gathering featuring earthen diya lighting ceremony, laser light illumination show, children rangoli competition, and grand society community dinner.', 'Festival', '2026-11-09', '6:00 PM - 10:30 PM', 'Central Amphitheater & Party Lawn', 350, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', 'Green Valley Cultural Committee', 142, '2026-11-08', 'usr_adm_01', '2026-11-05 12:48:24'),
  ('evt_02', 'soc_green_valley_01', 'Sunday Morning Yoga & Breathwork Session', 'Invigorating 75-minute Hatha yoga and guided pranayama session led by certified international instructor Master Ananya Deshpande. Suitable for all fitness levels.', 'Wellness', '2026-11-10', '7:00 AM - 8:15 AM', 'Clubhouse Rooftop Terrace', 30, 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80', 'Health & Wellness Sub-Committee', 22, '2026-11-09', 'usr_adm_01', '2026-11-05 12:48:24'),
  ('evt_03', 'soc_green_valley_01', 'Children''s Creative Pottery & Art Workshop', 'Hands-on clay modeling, ceramic painting, and creative crafts workshop for children aged 5 to 14. All materials and protective aprons will be supplied.', 'Kids & Family', '2026-11-16', '4:00 PM - 6:30 PM', 'Clubhouse Activity Room 102', 25, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', 'Youth Development Committee', 19, '2026-11-14', 'usr_adm_01', '2026-11-05 12:48:24'),
  ('evt_04', 'soc_green_valley_01', 'Annual Society Badminton & Tennis Tournament', 'Inter-wing sports tournament across Men, Women, Juniors, and Senior Citizens categories. Trophy presentation and sports dinner on the final day.', 'Sports', '2026-11-23', '8:00 AM - 6:00 PM', 'Indoor Badminton & Tennis Enclave', 80, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', 'Sports Committee', 56, '2026-11-19', 'usr_adm_01', '2026-11-05 12:48:24');

INSERT INTO `event_rsvps` (`event_id`, `user_id`, `status`, `updated_at`) VALUES
  ('evt_01', 'usr_adm_01', 'attending', '2026-11-05 12:48:24'),
  ('evt_01', 'usr_res_01', 'attending', '2026-11-05 12:48:24'),
  ('evt_03', 'usr_res_01', 'tentative', '2026-11-05 12:48:24');

INSERT INTO `albums` (`id`, `society_id`, `title`, `category`, `cover_image`, `album_date`, `created_at`) VALUES
  ('alb_01', 'soc_green_valley_01', 'Diwali Celebration', 'Festivals', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', '2026-10-16', '2026-11-05 12:48:24'),
  ('alb_02', 'soc_green_valley_01', 'Sports Tournament', 'Sports', 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80', '2026-09-26', '2026-11-05 12:48:24'),
  ('alb_03', 'soc_green_valley_01', 'Clubhouse Grand Opening', 'Clubhouse', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', '2026-08-17', '2026-11-05 12:48:24'),
  ('alb_04', 'soc_green_valley_01', 'Children''s Day Carnival', 'Events', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80', '2026-10-24', '2026-11-05 12:48:24'),
  ('alb_05', 'soc_green_valley_01', 'Cultural Evening & Garba', 'Festivals', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80', '2026-10-01', '2026-11-05 12:48:24'),
  ('alb_06', 'soc_green_valley_01', 'Rooftop Stargazing Party', 'Clubhouse', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80', '2026-07-18', '2026-11-05 12:48:24');

INSERT INTO `media_items` (`id`, `album_id`, `url`, `title`, `uploader_id`, `uploader_name`, `status`, `media_date`, `created_at`) VALUES
  ('m1', 'alb_01', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', 'Grand Amphitheater Diyas', NULL, 'Priya Sharma', 'approved', '2026-10-16', '2026-11-05 12:48:24'),
  ('m10', 'alb_06', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', 'Telescope Moon Session', NULL, 'Dr. Anita Roy', 'approved', '2026-07-18', '2026-11-05 12:48:24'),
  ('m2', 'alb_01', 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1200&q=80', 'Children Rangoli Competition', NULL, 'Sunita Patel', 'approved', '2026-10-16', '2026-11-05 12:48:24'),
  ('m3', 'alb_01', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80', 'Festive Lights on Wing A', NULL, 'Kunal Singhal', 'approved', '2026-10-16', '2026-11-05 12:48:24'),
  ('m4', 'alb_02', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', 'Badminton Finals Rally', NULL, 'Anand Verma', 'approved', '2026-09-26', '2026-11-05 12:48:24'),
  ('m5', 'alb_02', 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80', 'Junior Tennis Doubles', NULL, 'Rajesh Nair', 'approved', '2026-09-26', '2026-11-05 12:48:24'),
  ('m6', 'alb_03', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'Ribbon Cutting Ceremony', NULL, 'Rajesh Nair', 'approved', '2026-08-17', '2026-11-05 12:48:24'),
  ('m7', 'alb_03', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'First Dip in the New Pool', NULL, 'Priya Sharma', 'approved', '2026-08-17', '2026-11-05 12:48:24'),
  ('m8', 'alb_04', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 'Pottery Wheel Fun', NULL, 'Devika Krishnan', 'approved', '2026-10-24', '2026-11-05 12:48:24'),
  ('m9', 'alb_05', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', 'Courtyard Dandiya Beats', NULL, 'Priya Sharma', 'approved', '2026-10-01', '2026-11-05 12:48:24');

INSERT INTO `notifications` (`id`, `society_id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `created_at`) VALUES
  ('notif_01', 'soc_green_valley_01', 'usr_res_01', 'Visitor Approval Requested', 'Sneha Kapoor is waiting at Gate 1 requesting entry to Flat A-1204.', 'visitor', '/visitors', 0, '2026-11-05 12:48:24'),
  ('notif_02', 'soc_green_valley_01', 'usr_res_01', 'Booking Confirmed', 'Swimming Pool reserved for today 7:00 AM - 8:00 AM (Ref: BK-7842).', 'booking', '/bookings', 0, '2026-11-05 12:48:24'),
  ('notif_03', 'soc_green_valley_01', 'usr_res_01', 'Urgent Maintenance Notice', 'Overhead tank cleaning tomorrow 10:00 AM - 2:00 PM. Please acknowledge.', 'notice', '/notices', 0, '2026-11-05 12:48:24'),
  ('notif_04', 'soc_green_valley_01', 'usr_res_01', 'Diwali Celebration RSVP', 'Your RSVP for Diwali Grand Community Celebration is marked as Attending.', 'event', '/events', 1, '2026-11-05 12:48:24'),
  ('notif_05', 'soc_green_valley_01', 'usr_adm_01', 'New visitor awaiting approval', 'A walk-in visitor is waiting for resident approval at Gate 1.', 'visitor', '/admin/visitors', 0, '2026-11-05 12:48:24'),
  ('notif_06', 'soc_green_valley_01', 'usr_adm_01', 'Gallery moderation pending', 'A resident submitted a new photo for the community gallery.', 'admin', '/admin/gallery', 0, '2026-11-05 12:48:24'),
  ('notif_1bef727f-8b61-4d8a-aad4-8ab3f61a6436', 'soc_green_valley_01', 'usr_a701', 'Amenity Reservation Confirmed', 'Gym & Fitness Studio on 2026-11-05 (6:00 AM - 7:00 AM) is confirmed. Reference BK-7884.', 'booking', '/bookings', 1, '2026-11-05 13:04:38');

INSERT INTO `security_logs` (`id`, `society_id`, `visitor_id`, `visitor_name`, `unit`, `gate`, `entry_time`, `exit_time`, `status`, `guard_id`, `guard_name`, `pass_code`, `created_at`) VALUES
  ('log_01', 'soc_green_valley_01', 'vis_04', 'Rahul Joshi', 'B-804', 'Gate 1 - Main Entrance', '10:12 AM', NULL, 'entry', 'usr_sec_01', 'Vikram Singh', 'V-6590', '2026-11-05 12:48:24'),
  ('log_02', 'soc_green_valley_01', 'vis_02', 'Sneha Kapoor', 'A-1204', 'Gate 1 - Main Entrance', NULL, NULL, 'denied', 'usr_sec_01', 'Vikram Singh', 'V-8812', '2026-11-05 12:48:24'),
  ('log_03', 'soc_green_valley_01', 'vis_03', 'Amit Sharma', 'A-1204', 'Gate 2 - Service Gate', '09:30 AM', NULL, 'entry', 'usr_sec_01', 'Vikram Singh', 'V-7104', '2026-11-05 12:48:24'),
  ('log_04', 'soc_green_valley_01', NULL, 'Prakash Courier', 'C-501', 'Gate 1 - Main Entrance', '09:15 AM', '09:28 AM', 'exit', 'usr_sec_01', 'Vikram Singh', 'V-4421', '2026-11-05 12:48:24');

INSERT INTO `facility_check_ins` (`id`, `society_id`, `booking_id`, `booking_reference`, `amenity_name`, `resident_name`, `unit`, `time_slot`, `attendee_count`, `status`, `checked_in_at`, `created_at`) VALUES
  ('fac_01', 'soc_green_valley_01', 'bk_01', 'BK-7842', 'Swimming Pool', 'Priya Sharma', 'A-1204', '7:00 AM - 8:00 AM', 2, 'checked_in', '07:05 AM', '2026-11-05 12:48:24'),
  ('fac_02', 'soc_green_valley_01', NULL, 'BK-7719', 'Gym & Fitness Studio', 'Kunal Singhal', 'B-804', '6:00 AM - 7:00 AM', 1, 'completed', '06:02 AM', '2026-11-05 12:48:24');

INSERT INTO `audit_logs` (`id`, `society_id`, `actor_id`, `actor_name`, `action`, `details`, `ip`, `created_at`) VALUES
  ('aud_01', 'soc_green_valley_01', 'usr_sec_01', 'Vikram Singh', 'Pass Verified & Entry Logged', 'Verified pass V-6590 for visitor Rahul Joshi -> Flat B-804', NULL, '2026-11-05 12:48:24'),
  ('aud_02', 'soc_green_valley_01', 'usr_res_01', 'Priya Sharma', 'Amenity Booking Created', 'Reserved Swimming Pool 7:00 AM - 8:00 AM (Ref: BK-7842)', NULL, '2026-11-05 12:48:24'),
  ('aud_03', 'soc_green_valley_01', 'usr_adm_01', 'Rajesh Nair', 'Notice Published', 'Published high priority notice "AGM 2026 Notification"', NULL, '2026-11-05 12:48:24'),
  ('aud_04', 'soc_green_valley_01', 'usr_fac_01', 'Anand Verma', 'Facility Maintenance Schedule Updated', 'Scheduled hydraulic tank maintenance for tomorrow', NULL, '2026-11-05 12:48:24'),
  ('aud_13a2ab29-1220-4021-a194-a09597df3d78', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Demo Role Login', 'Demo session started as resident.', '::1', '2026-11-05 16:38:12'),
  ('aud_203ca123-6bdd-4c1c-8195-5196dd260755', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Booking Cancelled', 'Cancelled reservation BK-7884 for Gym & Fitness Studio.', '::1', '2026-11-05 13:21:22'),
  ('aud_22d790b8-24ac-4294-99e7-f2f5eac6f37c', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Poll Vote Submitted', 'Dr. Anita Roy (A-701) voted for 4 candidates in poll poll_01', '::1', '2026-11-05 13:22:35'),
  ('aud_2fcaec62-047b-4ac2-8231-ee262d6c6fd9', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Maintenance Bill Paid', 'Dr. Anita Roy (Flat A-701) paid maintenance dues via Instant UPI', '::1', '2026-11-05 13:26:12'),
  ('aud_5134a423-f4fa-4b74-9376-82386d1d807b', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Maintenance Bill Paid', 'Dr. Anita Roy (Flat A-701) paid maintenance dues via Instant UPI', '::1', '2026-11-05 12:52:02'),
  ('aud_7576f984-9582-42a0-b73b-f36b9d8341b4', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Demo Role Login', 'Demo session started as resident.', '::1', '2026-11-05 12:51:56'),
  ('aud_7e71c438-86ae-44e9-bf48-743d40d7e741', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Logout', 'Dr. Anita Roy signed out.', '::1', '2026-11-05 13:21:50'),
  ('aud_aa4cd216-ee04-4d48-818d-bba2a4537299', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Poll Vote Submitted', 'Dr. Anita Roy (A-701) voted for 5 candidates in poll poll_01', '::1', '2026-11-05 13:23:08'),
  ('aud_b3654a9a-d7fc-468a-846b-463a929b5c50', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Amenity Booked', 'Booked Gym & Fitness Studio on 2026-11-05 (6:00 AM - 7:00 AM) - BK-7884.', '::1', '2026-11-05 13:04:38'),
  ('aud_d28513c6-e5c2-4d79-a9bc-75292390610d', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Demo Role Login', 'Demo session started as resident.', '::1', '2026-11-05 13:22:15'),
  ('aud_dad8b186-20ff-42e4-9b4d-f896ef8c4ecd', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Poll Vote Submitted', 'Dr. Anita Roy (A-701) voted for 6 candidates in poll poll_01', '::1', '2026-11-05 13:23:54'),
  ('aud_e58c0c00-c405-4188-92e1-0a2640de1ed0', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Community Poll Created', 'Dr. Anita Roy published new poll "ABC"', '::1', '2026-11-05 13:25:01'),
  ('aud_f6f3280f-f1e4-448a-a7c8-d62005ca1c82', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'Logout', 'Dr. Anita Roy signed out.', '::1', '2026-11-05 14:52:04');

INSERT INTO `community_polls` (`id`, `society_id`, `author_name`, `author_initial`, `group_name`, `publish_timestamp`, `title`, `subtitle`, `expires_on`, `responses_count`, `min_select`, `max_select`, `candidates_json`, `created_at`) VALUES
  ('poll_01', 'soc_green_valley_01', 'Executive Committee WHCA...', 'E', 'All Owners', '10 Aug 2022, 09:05 PM', 'TEST POLL', 'CHOOSE ONLY 15 CANDIDATES', '11 Aug 2026', 2, 15, 15, '["01 CANDIDATE A","02 CANDIDATE B","03 CANDIDATE C","04 CANDIDATE D","05 CANDIDATE E","06 CANDIDATE F","07 CANDIDATE G","08 CANDIDATE H","09 CANDIDATE I","10 CANDIDATE J","11 CANDIDATE K","12 CANDIDATE L","13 CANDIDATE M","14 CANDIDATE N","15 CANDIDATE O","16 CANDIDATE P","17 CANDIDATE Q","18 CANDIDATE R"]', '2026-11-05 12:48:24'),
  ('poll_bc600a6d-c985-4271-a175-438e45590bff', 'soc_green_valley_01', 'Dr. Anita Roy (A-701)', 'D', 'Owners & Residents Group', '5 Nov 2026, 1:25 pm', 'ABC', 'abc', '30 Nov 2026, 06:00 PM', 0, 1, 3, '["01 OPTION 1","02 OPTION 2","03 OPTION 3"]', '2026-11-05 13:25:01');

INSERT INTO `poll_votes` (`id`, `poll_id`, `user_id`, `unit`, `selected_candidates_json`, `created_at`) VALUES
  ('vote_01', 'poll_01', 'usr_adm_01', 'C-402', '["01 CANDIDATE A","02 CANDIDATE B","03 CANDIDATE C","04 CANDIDATE D","05 CANDIDATE E","06 CANDIDATE F","07 CANDIDATE G","08 CANDIDATE H","09 CANDIDATE I","10 CANDIDATE J","11 CANDIDATE K","12 CANDIDATE L","13 CANDIDATE M","14 CANDIDATE N","15 CANDIDATE O"]', '2026-11-05 12:48:24'),
  ('vote_9503800d-e584-4012-b551-6f040652652b', 'poll_01', 'usr_a701', 'A-701', '["01 CANDIDATE A","02 CANDIDATE B","03 CANDIDATE C","04 CANDIDATE D","05 CANDIDATE E","06 CANDIDATE F"]', '2026-11-05 13:22:35');

INSERT INTO `unit_bills` (`id`, `society_id`, `unit`, `user_id`, `invoice_no`, `title`, `category`, `billing_period`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `created_at`) VALUES
  ('bill_01', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'INV-2026-1101', 'Monthly Society Maintenance Statement', 'Statement', 'November 2026', '4850.00', 'paid', '2026-11-15', '2026-11-05 13:26:12', 'Instant UPI', '2026-11-05 12:48:24'),
  ('bill_02', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'INV-2026-1102', 'Sinking Fund & EV Infrastructure Dues', 'Dues', 'Q4 2026', '1500.00', 'unpaid', '2026-11-20', NULL, NULL, '2026-11-05 12:48:24'),
  ('bill_03', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'INV-2026-1001', 'October Maintenance & Water Charges', 'Payment history', 'October 2026', '4850.00', 'paid', '2026-10-16', '2026-11-05 12:48:24', 'UPI (GPay)', '2026-11-05 12:48:24');

INSERT INTO `gate_updates` (`id`, `society_id`, `unit`, `user_id`, `update_type`, `details`, `pass_code`, `status`, `created_at`) VALUES
  ('gu_01', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'Cab', 'Uber Premier (MH 02 EZ 4091) expected at Main Gate', 'CAB-4091', 'active', '2026-11-05 12:48:24'),
  ('gu_02', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'Exit pass', 'Domestic help carrying 2 carton boxes approved by Priya Sharma', 'EXT-8820', 'active', '2026-11-05 12:48:24'),
  ('gu_03', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'School bus', 'Route #4 Yellow School Bus drop-off alert at 3:15 PM', 'BUS-0004', 'active', '2026-11-05 12:48:24');

INSERT INTO `service_requests` (`id`, `society_id`, `unit`, `user_id`, `desk_type`, `category`, `title`, `description`, `status`, `created_at`) VALUES
  ('sr_01', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'Helpdesk', 'Plumbing', 'Kitchen RO inlet pressure check', 'Low water pressure in kitchen sink line since morning.', 'open', '2026-11-05 12:48:24'),
  ('sr_02', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'Service Desk', 'Electrical', 'Balcony LED fixture replacement', 'Requesting society electrician to inspect balcony spot light.', 'in_progress', '2026-11-05 12:48:24');

SET FOREIGN_KEY_CHECKS = 1;

