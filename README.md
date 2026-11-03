# Smart Residential Society Management & Amenities Booking System

A state-of-the-art, production-grade frontend built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Three.js**.

---

## 🌟 Overview & Key Features

The platform provides dedicated, art-directed experiences tailored for 4 distinct society roles:

### 1. 🏠 Resident Experience (`resident`)
- **Interactive Home Dashboard**:
  - Warm personalized greeting with unit identifier: *Flat A-1204 • Green Valley Residency*.
  - Live weather & date widget (*28°C Mumbai*).
  - Hero banner with quick action CTAs (*Book an Amenity*, *Invite a Visitor*).
  - 4 Quick Action cards & Today's Overview counters (*Expected Visitors: 2*, *Upcoming Bookings: 1*, *Unread Notices: 3*, *Upcoming Events: 2*).
  - **1-Tap Visitor Approval Widget**: Live gate requests (e.g. *Sneha Kapoor waiting at Gate 1*) with immediate **Approve Entry** / **Deny** actions that update state across screens.
  - **Upcoming Booking with Digital Pass**: View confirmed reservations with high-entropy QR codes.
  - Urgent Notice Banner (*Water Supply Shutdown*) with direct **Acknowledge Receipt** action.
  - Upcoming community event cards with live RSVP toggles (*Attending*, *Maybe*).
- **Visitor Management (`/visitors`)**:
  - Filter tabs: *Expected*, *Pending*, *Completed*, *Denied*, *All*.
  - Instant pre-approval form (*Full Name*, *Phone*, *Arrival Date/Time*, *Vehicle Type & Reg*, *Notes*).
  - Generated Digital QR Gate Passes with 1-click clipboard copy and print view.
- **Amenities Discovery & Live Slot Booking (`/amenities`)**:
  - Category filters (*All*, *Sports*, *Fitness*, *Indoor*, *Outdoor*, *Events*).
  - 9+ high-end society facilities (*Swimming Pool*, *Gym & Fitness Studio*, *Badminton Courts*, *Clubhouse Lounge*, *Banquet Hall*, *Rooftop Terrace*, *Tennis Court*, *Indoor Games*, *Yoga Studio*).
  - Dynamic availability calendar with selectable time slots (e.g., 6:00 AM, 7:00 AM, 8:00 AM) that prevent duplicate bookings.
  - Multi-step checkout drawer with attendee counters, cancellation policy reminders, and celebration confetti on confirmation.
- **My Reservations (`/bookings`)**:
  - Track active, completed, and cancelled bookings.
  - Modal with admission barcode / QR pass for facility reception.
  - 1-click slot cancellation with confirmation dialog that releases slots back to availability.
- **Notices & Circulars (`/notices`)**:
  - Urgency categorization (*Urgent*, *Important*, *General*).
  - Downloadable PDF attachments and mandatory committee acknowledgement tracking.
- **Events & Community (`/events`)**:
  - RSVP toggles with real-time attendee counts.
- **Member Directory (`/directory`)**:
  - Privacy-preserving resident directory with wing filters (*A Wing*, *B Wing*, *C Wing*, *D Wing*) where phone numbers and emails are masked by default.
- **Community Photo Gallery (`/gallery`)**:
  - Album collections (*Festivals*, *Sports*, *Clubhouse*, *Events*).
  - Full-screen lightbox with keyboard navigation (`←`, `→`, `Esc`).
  - Resident photo contribution modal submitting to the admin moderation queue.
- **Household Profile & Settings (`/profile`)**:
  - Profile customization and directory privacy toggles (*Make Phone Public*, *Make Email Public*).

---

### 2. 🏛️ Society Administrator (`admin`)
- **Executive Operations Dashboard**:
  - Key operational KPIs: *Total Residents (248)*, *Expected Visitors (12)*, *Pending Approvals (3)*, *Today's Bookings (18)*.
  - **Recharts Analytics**: Weekly booking trends bar chart and facility category distribution donut chart.
  - Real-time society activity feed.
- **Resident & Unit Management**:
  - Unit roster with member roles (*Homeowner*, *Tenant*), portal status, and onboarding modal.
- **Amenity Administration**:
  - Capacity configuration, operating hours, slot intervals, and maintenance/closure toggles.
- **Content Moderation**:
  - Approve or reject resident-submitted gallery photos.
- **Audit Logs & Export**:
  - Searchable audit trail with actor, action, timestamp, and CSV export.

---

### 3. 🛡️ Security Guard Terminal (`security`)
- **Gate 1 Console**:
  - High-contrast, dark-teal gate terminal interface optimized for outdoor touch devices.
  - Large touch targets: **Scan Pass**, **Register Walk-in Visitor**, **Manual Lookup**, **Today's Gate Log**.
  - **Optical QR Scanner Simulator**: Camera viewfinder with one-click test simulation.
  - **Pass Verification Screen**: Immediate status feedback (*Valid Pass*, *Already Checked In*, *Denied*, *Expired*).
  - **Walk-in Visitor Registration**: Creates pending approval requests routed instantly to residents.
  - Real-time entry & exit timestamp logs.

---

### 4. 🏊 Facility Manager (`facility`)
- **Recreation Operations Console**:
  - Today's facility reservation schedule across pools, courts, and halls.
  - Quick booking lookup by reference (`BK-XXXX`).
  - Physical check-in and attendance verification.

---

## 🎨 Design System Tokens

- **Primary Deep Teal**: `#116D68`
- **Dark Teal**: `#0B4E4A`
- **Secondary Teal**: `#248F84`
- **Mint Accent**: `#DDF4ED`
- **Pale Mint Background**: `#F2FAF7`
- **Main App Background**: `#F7F8F6`
- **Card Background**: `#FFFFFF`
- **Primary Text**: `#182B2A`
- **Secondary Text**: `#697875`
- **Border**: `#E4EBE7`
- **Status Success**: `#198754`
- **Status Warning**: `#D97706`
- **Status Error**: `#DC4444`

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI & Components**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **3D Graphics**: Three.js (interactive architectural model)
- **Icons**: Lucide React
- **Charts**: Recharts
- **QR Codes**: `qrcode.react`
- **Micro-interactions**: `canvas-confetti`
- **Database**: MySQL 8.0+ with `mysql2/promise`
- **Auth**: bcrypt password hashes + `jose` JWT in an HTTP-only cookie backed by revocable `sessions` rows
- **Validation**: Zod schemas on every write endpoint

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start MySQL

With Homebrew (fastest when a bottle is available for your macOS version):

```bash
brew install mysql
brew services start mysql
```

If Homebrew has no prebuilt bottle for your machine (older macOS versions
build MySQL and LLVM from source, which needs many GB and hours), use the
official prebuilt archive instead:

```bash
curl -LO https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.31-macos12-x86_64.tar.gz
tar xzf mysql-8.0.31-macos12-x86_64.tar.gz
./mysql-8.0.31-macos12-x86_64/bin/mysqld --initialize-insecure \
  --basedir="$PWD/mysql-8.0.31-macos12-x86_64" --datadir="$PWD/data"
./mysql-8.0.31-macos12-x86_64/bin/mysqld \
  --basedir="$PWD/mysql-8.0.31-macos12-x86_64" --datadir="$PWD/data" --daemonize
```

The app expects MySQL on `127.0.0.1:3306` (see `.env.local`).

### 3. Create `.env.local`

```bash
cp .env.example .env.local
```

Set at minimum:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=apnaa_society
JWT_SECRET=<at least 32 random characters>
NEXT_PUBLIC_DATA_SOURCE=api
```

Generate a strong secret with `openssl rand -base64 48`.

### 4. Create the schema and seed demo data

```bash
npm run db:setup   # creates the database, applies db/schema.sql, seeds demo data
npm run db:check   # verifies the connection and database
```

`db:setup` drops and recreates every table. Never run it against a database
that holds real data.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo credentials

Every seeded account uses the password **`Apnaa@12345`**:

| Role | Email | Phone |
| --- | --- | --- |
| Resident | `priya.sharma@example.com` | `+91 98765 43210` |
| Committee admin | `secretary@greenvalley.org` | `+91 98200 11223` |
| Security guard | `security.gate1@greenvalley.org` | `+91 98111 22334` |
| Facility manager | `facility@greenvalley.org` | `+91 98999 55667` |

Use the password form, the mobile OTP form (development builds return the code
in the API response), or the floating demo role switcher.

### Production build

```bash
npm run build
npm start
```

Set `ALLOW_DEMO_LOGIN=false` in production. The demo role switcher and
`POST /api/v1/auth/demo` will then return `403`.

---

## 🗄️ MySQL Backend

The frontend talks to secured Next.js route handlers in `src/app/api/v1`.
There is no separate PHP/Express service. Set `NEXT_PUBLIC_DATA_SOURCE=api`
to read and write MySQL; set it to `mock` to return to the original in-memory
demo without a database.

### Structure

```text
db/schema.sql              Authoritative schema (drops/recreates tables)
scripts/db-setup.mjs       Creates database + applies schema + seeds
scripts/seed.mjs           Idempotent demo seed data
src/lib/server/            DB pool, auth, RBAC, validation, audit, rate limits
src/app/api/v1/            REST endpoints consumed by src/lib/api
```

### Least-privilege production user

The seed script needs DDL rights, so it runs as an admin user. The app itself
should run as a dedicated user with only DML rights:

```sql
CREATE USER 'apnaa_app'@'localhost' IDENTIFIED BY 'replace-with-a-long-random-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON apnaa_society.* TO 'apnaa_app'@'localhost';
FLUSH PRIVILEGES;
```

Then point `DB_USER` / `DB_PASSWORD` at that account.

### Security model

- **Passwords** are hashed with bcrypt (cost 12); plaintext is never stored.
- **Sessions** use a signed JWT in an `HttpOnly`, `SameSite=Lax` cookie. Every
  request also checks a revocable row in `sessions`, so suspension and logout
  take effect immediately.
- **RBAC** is enforced server-side on every endpoint. Residents only receive
  their own visitors and bookings; admins, security, and facility staff receive
  only the data their role needs.
- **Validation** uses Zod with strict length/format limits. All SQL is
  parameterised.
- **Rate limits** are stored in MySQL and applied to login, OTP, and write
  endpoints.
- **CSRF**: state-changing requests reject cross-origin `Origin` headers.
- **Audit logs** record sensitive actions (approvals, bookings, resident
  changes, moderation, check-ins).
- **Directory privacy**: phone and email are masked server-side unless the
  resident opted in, is viewing their own record, or is an admin.
- **Headers**: CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, and
  `Referrer-Policy` are set in `next.config.ts`.

### Useful commands

```bash
npm run db:setup   # reset schema + seed (destructive)
npm run db:seed    # seed an empty schema
npm run db:check   # connection smoke test
npm run lint
npm run build
```

