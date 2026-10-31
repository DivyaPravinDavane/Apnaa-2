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

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🔄 PHP REST API Integration Guide

The frontend features a typed API client in `src/lib/api/index.ts`:

1. Copy `.env.example` to `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_DATA_SOURCE=api
   ```
2. The PHP backend should implement endpoints corresponding to:
   - `POST /api/v1/auth/otp/verify`
   - `GET /api/v1/visitors`, `POST /api/v1/visitors/{id}/approve`
   - `GET /api/v1/amenities`, `POST /api/v1/bookings`
   - `GET /api/v1/notices`, `POST /api/v1/notices/{id}/acknowledge`
   - `PUT /api/v1/events/{id}/rsvp`
   - `POST /api/v1/passes/{token}/check-in`
