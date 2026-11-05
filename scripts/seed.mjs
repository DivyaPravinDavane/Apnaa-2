/**
 * Seed the Apnaa Smart Society MySQL database with demo data.
 *
 * Usage:
 *   npm run db:seed        (assumes the schema already exists)
 *   npm run db:setup       (creates the database, applies schema, then seeds)
 *
 * Credentials for every seeded account:
 *   password: Apnaa@12345
 */
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';

const SOCIETY_ID = 'soc_green_valley_01';
const DEMO_PASSWORD = 'Apnaa@12345';
const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Date helpers - seed data stays useful regardless of when it is installed.
// ---------------------------------------------------------------------------
const DAY = 24 * 60 * 60 * 1000;
const isoDate = (offsetDays = 0) => new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);
const isoDateTime = (offsetMinutes = 0) => new Date(Date.now() + offsetMinutes * 60 * 1000);

const users = [
  {
    id: 'usr_res_01',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'resident',
    unit: 'A-1204',
    wing: 'A Wing',
    floor: '12th Floor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    membership_type: 'Owner',
    bio: 'Architect & design enthusiast. Living in Green Valley Residency for 4 years.',
    interests: ['Badminton', 'Sustainable Living', 'Book Club', 'Gardening'],
    is_phone_public: 0,
    is_email_public: 0,
  },
  {
    id: 'usr_adm_01',
    name: 'Rajesh Nair',
    email: 'secretary@greenvalley.org',
    phone: '+91 98200 11223',
    role: 'admin',
    unit: 'C-402',
    wing: 'C Wing',
    floor: '4th Floor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    membership_type: 'Owner',
    bio: 'Management Committee Secretary. Dedicated to transparent community operations.',
    interests: ['Governance', 'Tennis', 'Solar Energy'],
    is_phone_public: 1,
    is_email_public: 1,
  },
  {
    id: 'usr_sec_01',
    name: 'Vikram Singh',
    email: 'security.gate1@greenvalley.org',
    phone: '+91 98111 22334',
    role: 'security',
    unit: 'Gate 1 Terminal',
    wing: 'Main Gate',
    floor: 'Ground',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    membership_type: 'Owner',
    bio: 'Chief Security Officer on duty at Gate 1.',
    interests: [],
    is_phone_public: 0,
    is_email_public: 0,
  },
  {
    id: 'usr_fac_01',
    name: 'Anand Verma',
    email: 'facility@greenvalley.org',
    phone: '+91 98999 55667',
    role: 'facility',
    unit: 'Clubhouse Desk',
    wing: 'Clubhouse',
    floor: 'Ground',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    membership_type: 'Owner',
    bio: 'Operations and Facility Manager overseeing amenities, safety, and hygiene.',
    interests: [],
    is_phone_public: 0,
    is_email_public: 0,
  },
  {
    id: 'usr_a701',
    name: 'Dr. Anita Roy',
    email: 'dr.anita@example.com',
    phone: '+91 98333 99887',
    role: 'resident',
    unit: 'A-701',
    wing: 'A Wing',
    floor: '7th Floor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    membership_type: 'Owner',
    bio: 'Consultant Pediatrician at Apollo Hospital. Available for medical advice during society emergencies.',
    interests: ['Medicine', 'Classical Music', 'Yoga'],
    is_phone_public: 0,
    is_email_public: 0,
  },
  {
    id: 'usr_b804',
    name: 'Kunal Singhal',
    email: 'kunal@example.com',
    phone: '+91 98111 44556',
    role: 'resident',
    unit: 'B-804',
    wing: 'B Wing',
    floor: '8th Floor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    membership_type: 'Tenant',
    bio: 'Tech entrepreneur and marathon enthusiast.',
    interests: ['Running', 'Cycling', 'Startups'],
    is_phone_public: 0,
    is_email_public: 0,
  },
  {
    id: 'usr_b302',
    name: 'Sunita Patel',
    email: 'patels@example.com',
    phone: '+91 98444 88776',
    role: 'resident',
    unit: 'B-302',
    wing: 'B Wing',
    floor: '3rd Floor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    membership_type: 'Owner',
    bio: 'Retired senior educator. Active in community book exchanges.',
    interests: ['Reading', 'Horticulture', 'Chess'],
    is_phone_public: 0,
    is_email_public: 0,
  },
  {
    id: 'usr_d1102',
    name: 'Devika Krishnan',
    email: 'devika.k@example.com',
    phone: '+91 98666 22110',
    role: 'resident',
    unit: 'D-1102',
    wing: 'D Wing',
    floor: '11th Floor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    membership_type: 'Owner',
    bio: 'Environmental economist and terrace composting coordinator.',
    interests: ['Zero Waste', 'Trekking', 'Table Tennis'],
    is_phone_public: 0,
    is_email_public: 0,
  },
  {
    id: 'usr_c201',
    name: 'Ravi Deshmukh',
    email: 'ravi.deshmukh@example.com',
    phone: '+91 98777 66554',
    role: 'resident',
    unit: 'C-201',
    wing: 'C Wing',
    floor: '2nd Floor',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    membership_type: 'Owner',
    bio: 'Chartered accountant and society finance volunteer.',
    interests: ['Finance', 'Cricket', 'Photography'],
    is_phone_public: 0,
    is_email_public: 0,
  },
];

const amenities = [
  {
    id: 'amenity_pool',
    name: 'Swimming Pool',
    category: 'Fitness',
    description:
      'Temperature-controlled semi-Olympic swimming pool featuring an integrated kids splash pool, comfortable lounging deck, and certified lifeguard supervision.',
    location: 'Clubhouse Building - Ground Floor',
    capacity: 50,
    operating_hours: '6:00 AM - 10:00 PM',
    slot_duration_minutes: 60,
    cover_image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=800&q=80',
    ],
    rules: [
      'Proper synthetic swimming attire is mandatory at all times.',
      'Showers must be taken prior to pool entry.',
      'Children under 12 must be accompanied by an adult.',
      'No glassware or food permitted within 5 meters of the pool rim.',
      'Maximum 4 guests allowed per household booking.',
    ],
    facilities: [
      'Clean and well-maintained water',
      'Changing rooms and hot water shower facilities',
      'Lifeguard on duty during active slots',
      'First-aid station',
    ],
    status: 'available',
    booking_horizon_days: 7,
  },
  {
    id: 'amenity_gym',
    name: 'Gym & Fitness Studio',
    category: 'Fitness',
    description:
      'Fully equipped modern gymnasium with commercial-grade cardio machines, free weights area, resistance stations, and dedicated stretching zone.',
    location: 'Wing B - Ground Floor',
    capacity: 30,
    operating_hours: '6:00 AM - 10:00 PM',
    slot_duration_minutes: 60,
    cover_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    ],
    rules: [
      'Clean indoor athletic shoes and workout towel are strictly required.',
      'Re-rack all dumbbells and weights after use.',
      'Sanitize workout stations with provided disinfectant wipes after use.',
      'Personal trainers from outside require committee registration.',
    ],
    facilities: [
      'Treadmills & Ellipticals',
      'Free weights dumbbell rack 2kg-40kg',
      'Central AC & surround audio system',
      'Locker facilities',
    ],
    status: 'available',
    booking_horizon_days: 5,
  },
  {
    id: 'amenity_badminton',
    name: 'Badminton Court',
    category: 'Sports',
    description:
      'Two indoor BWF-standard synthetic wooden courts equipped with anti-glare LED illumination and spectator seating gallery.',
    location: 'Clubhouse - 1st Floor',
    capacity: 16,
    operating_hours: '6:00 AM - 11:00 PM',
    slot_duration_minutes: 60,
    cover_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    ],
    rules: [
      'Non-marking gum sole shoes are strictly enforced on the court surface.',
      'Bookings are valid for 60 minutes only per slot.',
      'Please bring your own racquets and shuttlecocks.',
      'Turn off high-power court lighting upon leaving.',
    ],
    facilities: [
      'Yonex-certified court matting',
      'Pro LED flicker-free sports lighting',
      'Viewing gallery',
      'Water cooler dispenser',
    ],
    status: 'available',
    booking_horizon_days: 7,
  },
  {
    id: 'amenity_clubhouse',
    name: 'Clubhouse Lounge',
    category: 'Indoor',
    description:
      'Sophisticated multi-tier community lounge featuring plush seating, coffee bar setup, library reading corner, and Wi-Fi connectivity.',
    location: 'Clubhouse Central Complex',
    capacity: 100,
    operating_hours: '8:00 AM - 11:00 PM',
    slot_duration_minutes: 120,
    cover_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    ],
    rules: [
      'Maintain conversational volume levels in the library nook.',
      'No wet swimwear permitted inside the carpeted lounge.',
      'Private events require prior written permission from the administrator.',
    ],
    facilities: [
      'High-speed Wi-Fi',
      'Espresso machine & pantry counter',
      'Books & magazine archive',
      'Conference discussion table',
    ],
    status: 'available',
    booking_horizon_days: 14,
  },
  {
    id: 'amenity_banquet',
    name: 'Banquet Hall',
    category: 'Events',
    description:
      'Opulent pillar-less celebration hall with acoustic ceiling panels, stage lighting, dedicated buffet catering corridor, and restrooms.',
    location: 'Clubhouse - Ground Floor West',
    capacity: 200,
    operating_hours: '9:00 AM - 11:00 PM',
    slot_duration_minutes: 240,
    cover_image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    gallery_images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'],
    rules: [
      'Music and public sound systems must cease by 10:00 PM as per local quiet hours.',
      'Deep cleaning fee applies if catering leftovers are not cleared by vendor.',
      'Bookings must be requested at least 48 hours in advance.',
    ],
    facilities: [
      'Dedicated food preparation kitchen',
      'PA audio system & wireless microphones',
      'Bridal/host green room',
      'Central air conditioning',
    ],
    status: 'available',
    booking_horizon_days: 30,
  },
  {
    id: 'amenity_terrace',
    name: 'Rooftop Terrace',
    category: 'Outdoor',
    description:
      'Scenic landscaped sky deck offering panoramic 360-degree city views, open-air wooden pergola seating, and ambient warm string lighting.',
    location: 'Wing A - 18th Floor Terrace',
    capacity: 40,
    operating_hours: '8:00 AM - 10:00 PM',
    slot_duration_minutes: 120,
    cover_image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    gallery_images: ['https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'],
    rules: [
      'No fireworks or hazardous open-flame cooking permitted.',
      'Children must be supervised around railings at all times.',
      'Maximum 1 booking per household per month on weekends.',
    ],
    facilities: ['Pergola wooden gazebos', 'Warm festoon lighting', 'Handwash sinks', 'Telescope viewing station'],
    status: 'available',
    booking_horizon_days: 14,
  },
  {
    id: 'amenity_tennis',
    name: 'Tennis Court',
    category: 'Sports',
    description:
      'Regulation hard court with acrylic cushioning, high-perimeter safety mesh, and automated court lighting timer.',
    location: 'Outdoor Sports Enclave - South Wing',
    capacity: 12,
    operating_hours: '6:00 AM - 9:00 PM',
    slot_duration_minutes: 60,
    cover_image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    gallery_images: ['https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80'],
    rules: [
      'Regulation tennis shoes only; no running or flat-bottom street shoes.',
      'Singles/Doubles play max 60 minutes when other residents are waiting.',
    ],
    facilities: [
      'Regulation height nets',
      'Night match flood lights',
      'Ball retriever carts',
      'Benches with shade canopies',
    ],
    status: 'available',
    booking_horizon_days: 7,
  },
  {
    id: 'amenity_games',
    name: 'Indoor Games Arena',
    category: 'Indoor',
    description:
      'Recreation zone featuring 2 championship Billiards/Snooker tables, 3 Table Tennis tables, and Carrom and Chess tables.',
    location: 'Clubhouse - 2nd Floor',
    capacity: 25,
    operating_hours: '9:00 AM - 10:00 PM',
    slot_duration_minutes: 60,
    cover_image: 'https://images.unsplash.com/photo-1538356111053-748a48e1acb8?auto=format&fit=crop&w=800&q=80',
    gallery_images: ['https://images.unsplash.com/photo-1538356111053-748a48e1acb8?auto=format&fit=crop&w=800&q=80'],
    rules: [
      'Treat table felts with care; do not sit or lean excessively on snooker rails.',
      'Sign out cues and balls at the facility desk.',
    ],
    facilities: [
      'Full size 12ft snooker table',
      'Stiga table tennis tables',
      'Carrom boards & coins',
      'Air conditioning',
    ],
    status: 'available',
    booking_horizon_days: 7,
  },
  {
    id: 'amenity_yoga',
    name: 'Yoga & Meditation Studio',
    category: 'Fitness',
    description:
      'Tranquil studio space with natural bamboo flooring, full mirror walls, soothing acoustic diffusers, and meditation bolsters.',
    location: 'Clubhouse - 2nd Floor East',
    capacity: 20,
    operating_hours: '5:30 AM - 9:00 PM',
    slot_duration_minutes: 60,
    cover_image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    gallery_images: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80'],
    rules: [
      'Maintain complete silence inside the sanctuary.',
      'Remove footwear at the entrance shoe cabinet.',
      'Return mats and meditation blocks to their racks after practice.',
    ],
    facilities: [
      'Premium cork and rubber yoga mats',
      'Meditation zafus & bolsters',
      'Aroma diffusers',
      'Bluetooth ambient sound system',
    ],
    status: 'available',
    booking_horizon_days: 7,
  },
];

const visitors = [
  {
    id: 'vis_01',
    name: 'Rohan Mehta',
    phone: '+91 98765 12345',
    visit_date: isoDate(0),
    arrival_time: '2:00 PM',
    departure_time: '2:30 PM',
    purpose: 'Meeting',
    visitor_count: 1,
    vehicle_type: 'Car',
    vehicle_number: 'MH 02 EF 1234',
    unit: 'A-1204',
    resident_id: 'usr_res_01',
    resident_name: 'Priya Sharma',
    status: 'expected',
    pass_code: 'V-9421',
    notes: 'Discussing interior blueprints',
    approved_at: isoDateTime(-30),
  },
  {
    id: 'vis_02',
    name: 'Sneha Kapoor',
    phone: '+91 98222 33445',
    visit_date: isoDate(0),
    arrival_time: '3:00 PM',
    departure_time: null,
    purpose: 'Family Visit',
    visitor_count: 2,
    vehicle_type: 'Car',
    vehicle_number: 'MH 01 AB 9988',
    unit: 'A-1204',
    resident_id: 'usr_res_01',
    resident_name: 'Priya Sharma',
    status: 'pending',
    pass_code: 'V-8812',
    notes: 'Sister visiting with niece',
    approved_at: null,
  },
  {
    id: 'vis_03',
    name: 'Amit Sharma',
    phone: '+91 98333 44556',
    visit_date: isoDate(0),
    arrival_time: '5:30 PM',
    departure_time: null,
    purpose: 'Delivery',
    visitor_count: 1,
    vehicle_type: 'Two-Wheeler',
    vehicle_number: 'MH 04 XY 7711',
    unit: 'A-1204',
    resident_id: 'usr_res_01',
    resident_name: 'Priya Sharma',
    status: 'expected',
    pass_code: 'V-7104',
    notes: 'Furniture package delivery',
    approved_at: isoDateTime(-60),
  },
  {
    id: 'vis_04',
    name: 'Rahul Joshi',
    phone: '+91 98444 55667',
    visit_date: isoDate(0),
    arrival_time: '10:12 AM',
    departure_time: null,
    purpose: 'Guest',
    visitor_count: 1,
    vehicle_type: 'Two-Wheeler',
    vehicle_number: 'MH 02 AA 1122',
    unit: 'B-804',
    resident_id: 'usr_b804',
    resident_name: 'Kunal Singhal',
    status: 'checked_in',
    pass_code: 'V-6590',
    notes: null,
    approved_at: isoDateTime(-120),
    entry_time: '10:12 AM',
  },
  {
    id: 'vis_05',
    name: 'Maya Sen',
    phone: '+91 98555 66778',
    visit_date: isoDate(-1),
    arrival_time: '4:00 PM',
    departure_time: null,
    purpose: 'Commercial Soliciting',
    visitor_count: 1,
    vehicle_type: 'None',
    vehicle_number: '',
    unit: 'C-201',
    resident_id: 'usr_c201',
    resident_name: 'Ravi Deshmukh',
    status: 'denied',
    pass_code: 'V-5510',
    notes: 'Resident declined unsolicited sales presentation',
    approved_at: null,
  },
];

const bookings = [
  {
    id: 'bk_01',
    booking_reference: 'BK-7842',
    amenity_id: 'amenity_pool',
    amenity_name: 'Swimming Pool',
    amenity_image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=400&q=80',
    unit: 'A-1204',
    user_id: 'usr_res_01',
    user_name: 'Priya Sharma',
    booking_date: isoDate(0),
    time_slot: '7:00 AM - 8:00 AM',
    guest_count: 2,
    status: 'confirmed',
    qr_token: 'RES-BK-7842-POOL-CONFIRMED',
    notes: 'Morning swim workout',
  },
  {
    id: 'bk_02',
    booking_reference: 'BK-6901',
    amenity_id: 'amenity_badminton',
    amenity_name: 'Badminton Court',
    amenity_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&q=80',
    unit: 'A-1204',
    user_id: 'usr_res_01',
    user_name: 'Priya Sharma',
    booking_date: isoDate(1),
    time_slot: '6:00 PM - 7:00 PM',
    guest_count: 3,
    status: 'confirmed',
    qr_token: 'RES-BK-6901-BADM-CONFIRMED',
    notes: 'Doubles match with neighbors',
  },
  {
    id: 'bk_03',
    booking_reference: 'BK-5520',
    amenity_id: 'amenity_banquet',
    amenity_name: 'Banquet Hall',
    amenity_image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80',
    unit: 'C-402',
    user_id: 'usr_adm_01',
    user_name: 'Rajesh Nair',
    booking_date: isoDate(2),
    time_slot: '6:00 PM - 10:00 PM',
    guest_count: 75,
    status: 'confirmed',
    qr_token: 'ADM-BK-5520-BANQ-CONFIRMED',
    notes: 'Daughter graduation family dinner',
  },
];

const notices = [
  {
    id: 'not_01',
    title: 'Water Supply Shutdown - Overhead Tank Cleaning',
    body: 'Please note that the overhead storage water tanks across Wings A, B, and C will undergo scheduled deep hydraulic scrubbing and chlorination. Water supply will be temporarily paused between 10:00 AM and 2:00 PM tomorrow. Residents are kindly requested to store adequate water for daily morning and afternoon requirements.',
    category: 'Water Shutdown',
    priority: 'urgent',
    publish_date: isoDate(0),
    expiry_date: isoDate(1),
    author: 'Society Maintenance Committee',
    attachment_name: 'Tank_Cleaning_Schedule.pdf',
    attachment_size: '420 KB',
    requires_acknowledgement: 1,
    acknowledged_baseline: 184,
  },
  {
    id: 'not_02',
    title: 'Annual General Body Meeting (AGM) 2026 Notification',
    body: 'The 12th Annual General Body Meeting of Green Valley Residency Co-operative Housing Society will be convened in the Clubhouse Banquet Hall. The agenda includes audited financial review, election of vacant committee seats, and solar rooftop rollout discussion.',
    category: 'AGM Notification',
    priority: 'high',
    publish_date: isoDate(-2),
    expiry_date: null,
    author: 'Management Committee Secretary',
    attachment_name: 'AGM_Agenda_And_Financials_2026.pdf',
    attachment_size: '2.1 MB',
    requires_acknowledgement: 0,
    acknowledged_baseline: 215,
  },
  {
    id: 'not_03',
    title: 'Cultural Evening & Garba Raas Celebration',
    body: 'Join fellow residents for a joyful evening of traditional music, dandiya beats, and delicious multi-cuisine food stalls at the Central Garden Courtyard this Saturday starting at 6:30 PM. Traditional dress is encouraged!',
    category: 'Events',
    priority: 'normal',
    publish_date: isoDate(-3),
    expiry_date: null,
    author: 'Cultural Sub-Committee',
    attachment_name: null,
    attachment_size: null,
    requires_acknowledgement: 0,
    acknowledged_baseline: 0,
  },
  {
    id: 'not_04',
    title: 'Society Parking & EV Charger Operational Guidelines',
    body: 'To ensure orderly traffic circulation, residents are requested to park strictly within their allotted numbered bays. Dual 22kW EV fast chargers in Basement 1 are now live and can be booked via the gate security console.',
    category: 'General Rules',
    priority: 'normal',
    publish_date: isoDate(-5),
    expiry_date: null,
    author: 'Security & Infrastructure Team',
    attachment_name: null,
    attachment_size: null,
    requires_acknowledgement: 1,
    acknowledged_baseline: 198,
  },
];

const events = [
  {
    id: 'evt_01',
    title: 'Diwali Grand Community Celebration',
    description:
      'Annual festival of lights gathering featuring earthen diya lighting ceremony, laser light illumination show, children rangoli competition, and grand society community dinner.',
    category: 'Festival',
    event_date: isoDate(4),
    event_time: '6:00 PM - 10:30 PM',
    venue: 'Central Amphitheater & Party Lawn',
    capacity: 350,
    cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    organizer: 'Green Valley Cultural Committee',
    attendees_baseline: 142,
    deadline: isoDate(3),
  },
  {
    id: 'evt_02',
    title: 'Sunday Morning Yoga & Breathwork Session',
    description:
      'Invigorating 75-minute Hatha yoga and guided pranayama session led by certified international instructor Master Ananya Deshpande. Suitable for all fitness levels.',
    category: 'Wellness',
    event_date: isoDate(5),
    event_time: '7:00 AM - 8:15 AM',
    venue: 'Clubhouse Rooftop Terrace',
    capacity: 30,
    cover_image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    organizer: 'Health & Wellness Sub-Committee',
    attendees_baseline: 22,
    deadline: isoDate(4),
  },
  {
    id: 'evt_03',
    title: "Children's Creative Pottery & Art Workshop",
    description:
      'Hands-on clay modeling, ceramic painting, and creative crafts workshop for children aged 5 to 14. All materials and protective aprons will be supplied.',
    category: 'Kids & Family',
    event_date: isoDate(11),
    event_time: '4:00 PM - 6:30 PM',
    venue: 'Clubhouse Activity Room 102',
    capacity: 25,
    cover_image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    organizer: 'Youth Development Committee',
    attendees_baseline: 19,
    deadline: isoDate(9),
  },
  {
    id: 'evt_04',
    title: 'Annual Society Badminton & Tennis Tournament',
    description:
      'Inter-wing sports tournament across Men, Women, Juniors, and Senior Citizens categories. Trophy presentation and sports dinner on the final day.',
    category: 'Sports',
    event_date: isoDate(18),
    event_time: '8:00 AM - 6:00 PM',
    venue: 'Indoor Badminton & Tennis Enclave',
    capacity: 80,
    cover_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    organizer: 'Sports Committee',
    attendees_baseline: 56,
    deadline: isoDate(14),
  },
];

const albums = [
  {
    id: 'alb_01',
    title: 'Diwali Celebration',
    category: 'Festivals',
    cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    album_date: isoDate(-20),
    media: [
      ['m1', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', 'Grand Amphitheater Diyas', 'Priya Sharma', 'approved'],
      ['m2', 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1200&q=80', 'Children Rangoli Competition', 'Sunita Patel', 'approved'],
      ['m3', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80', 'Festive Lights on Wing A', 'Kunal Singhal', 'approved'],
    ],
  },
  {
    id: 'alb_02',
    title: 'Sports Tournament',
    category: 'Sports',
    cover_image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80',
    album_date: isoDate(-40),
    media: [
      ['m4', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80', 'Badminton Finals Rally', 'Anand Verma', 'approved'],
      ['m5', 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80', 'Junior Tennis Doubles', 'Rajesh Nair', 'approved'],
    ],
  },
  {
    id: 'alb_03',
    title: 'Clubhouse Grand Opening',
    category: 'Clubhouse',
    cover_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    album_date: isoDate(-80),
    media: [
      ['m6', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'Ribbon Cutting Ceremony', 'Rajesh Nair', 'approved'],
      ['m7', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'First Dip in the New Pool', 'Priya Sharma', 'approved'],
    ],
  },
  {
    id: 'alb_04',
    title: "Children's Day Carnival",
    category: 'Events',
    cover_image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    album_date: isoDate(-12),
    media: [
      ['m8', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80', 'Pottery Wheel Fun', 'Devika Krishnan', 'approved'],
    ],
  },
  {
    id: 'alb_05',
    title: 'Cultural Evening & Garba',
    category: 'Festivals',
    cover_image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    album_date: isoDate(-35),
    media: [
      ['m9', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', 'Courtyard Dandiya Beats', 'Priya Sharma', 'approved'],
    ],
  },
  {
    id: 'alb_06',
    title: 'Rooftop Stargazing Party',
    category: 'Clubhouse',
    cover_image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
    album_date: isoDate(-110),
    media: [
      ['m10', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', 'Telescope Moon Session', 'Dr. Anita Roy', 'approved'],
    ],
  },
];

const notifications = [
  ['notif_01', 'usr_res_01', 'Visitor Approval Requested', 'Sneha Kapoor is waiting at Gate 1 requesting entry to Flat A-1204.', 'visitor', '/visitors', 0],
  ['notif_02', 'usr_res_01', 'Booking Confirmed', 'Swimming Pool reserved for today 7:00 AM - 8:00 AM (Ref: BK-7842).', 'booking', '/bookings', 0],
  ['notif_03', 'usr_res_01', 'Urgent Maintenance Notice', 'Overhead tank cleaning tomorrow 10:00 AM - 2:00 PM. Please acknowledge.', 'notice', '/notices', 0],
  ['notif_04', 'usr_res_01', 'Diwali Celebration RSVP', 'Your RSVP for Diwali Grand Community Celebration is marked as Attending.', 'event', '/events', 1],
  ['notif_05', 'usr_adm_01', 'New visitor awaiting approval', 'A walk-in visitor is waiting for resident approval at Gate 1.', 'visitor', '/admin/visitors', 0],
  ['notif_06', 'usr_adm_01', 'Gallery moderation pending', 'A resident submitted a new photo for the community gallery.', 'admin', '/admin/gallery', 0],
];

const securityLogs = [
  ['log_01', 'vis_04', 'Rahul Joshi', 'B-804', 'Gate 1 - Main Entrance', '10:12 AM', null, 'entry', 'usr_sec_01', 'Vikram Singh', 'V-6590'],
  ['log_02', 'vis_02', 'Sneha Kapoor', 'A-1204', 'Gate 1 - Main Entrance', null, null, 'denied', 'usr_sec_01', 'Vikram Singh', 'V-8812'],
  ['log_03', 'vis_03', 'Amit Sharma', 'A-1204', 'Gate 2 - Service Gate', '09:30 AM', null, 'entry', 'usr_sec_01', 'Vikram Singh', 'V-7104'],
  ['log_04', null, 'Prakash Courier', 'C-501', 'Gate 1 - Main Entrance', '09:15 AM', '09:28 AM', 'exit', 'usr_sec_01', 'Vikram Singh', 'V-4421'],
];

const facilityCheckIns = [
  ['fac_01', 'bk_01', 'BK-7842', 'Swimming Pool', 'Priya Sharma', 'A-1204', '7:00 AM - 8:00 AM', 2, 'checked_in', '07:05 AM'],
  ['fac_02', null, 'BK-7719', 'Gym & Fitness Studio', 'Kunal Singhal', 'B-804', '6:00 AM - 7:00 AM', 1, 'completed', '06:02 AM'],
];

const auditLogs = [
  ['aud_01', 'usr_sec_01', 'Vikram Singh', 'Pass Verified & Entry Logged', 'Verified pass V-6590 for visitor Rahul Joshi -> Flat B-804'],
  ['aud_02', 'usr_res_01', 'Priya Sharma', 'Amenity Booking Created', 'Reserved Swimming Pool 7:00 AM - 8:00 AM (Ref: BK-7842)'],
  ['aud_03', 'usr_adm_01', 'Rajesh Nair', 'Notice Published', 'Published high priority notice "AGM 2026 Notification"'],
  ['aud_04', 'usr_fac_01', 'Anand Verma', 'Facility Maintenance Schedule Updated', 'Scheduled hydraulic tank maintenance for tomorrow'],
];

export async function seedDatabase(pool, { reset = false } = {}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (reset) {
      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of [
        'service_requests',
        'gate_updates',
        'unit_bills',
        'poll_votes',
        'community_polls',
        'audit_logs',
        'facility_check_ins',
        'security_logs',
        'notifications',
        'media_items',
        'albums',
        'event_rsvps',
        'events',
        'notice_reads',
        'notice_acknowledgements',
        'notices',
        'bookings',
        'amenities',
        'visitors',
        'sessions',
        'otp_codes',
        'users',
        'societies',
      ]) {
        await conn.query(`TRUNCATE TABLE \`${table}\``);
      }
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    await conn.query(
      `INSERT INTO societies
        (id, name, address, total_households, total_units, next_maintenance_date, next_maintenance_note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        SOCIETY_ID,
        'Westend Heights D... (Apnaentry Society)',
        'Green Valley Road, Powai, Mumbai 400076',
        248,
        180,
        isoDate(6),
        'Quarterly fire safety audit & lift servicing',
      ]
    );

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
    for (const user of users) {
      await conn.query(
        `INSERT INTO users
          (id, society_id, name, email, phone, password_hash, role, unit, wing, floor, avatar,
           membership_type, bio, interests, is_phone_public, is_email_public)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          SOCIETY_ID,
          user.name,
          user.email,
          user.phone,
          passwordHash,
          user.role,
          user.unit,
          user.wing,
          user.floor,
          user.avatar,
          user.membership_type,
          user.bio,
          JSON.stringify(user.interests),
          user.is_phone_public,
          user.is_email_public,
        ]
      );
    }

    for (const amenity of amenities) {
      await conn.query(
        `INSERT INTO amenities
          (id, society_id, name, category, description, location, capacity, operating_hours,
           slot_duration_minutes, cover_image, gallery_images, rules, facilities, status, booking_horizon_days)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          amenity.id,
          SOCIETY_ID,
          amenity.name,
          amenity.category,
          amenity.description,
          amenity.location,
          amenity.capacity,
          amenity.operating_hours,
          amenity.slot_duration_minutes,
          amenity.cover_image,
          JSON.stringify(amenity.gallery_images),
          JSON.stringify(amenity.rules),
          JSON.stringify(amenity.facilities),
          amenity.status,
          amenity.booking_horizon_days,
        ]
      );
    }

    for (const visitor of visitors) {
      await conn.query(
        `INSERT INTO visitors
          (id, society_id, resident_id, resident_name, name, phone, visit_date, arrival_time,
           departure_time, purpose, visitor_count, vehicle_type, vehicle_number, unit, status,
           pass_code, notes, approved_at, entry_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          visitor.id,
          SOCIETY_ID,
          visitor.resident_id,
          visitor.resident_name,
          visitor.name,
          visitor.phone,
          visitor.visit_date,
          visitor.arrival_time,
          visitor.departure_time,
          visitor.purpose,
          visitor.visitor_count,
          visitor.vehicle_type,
          visitor.vehicle_number,
          visitor.unit,
          visitor.status,
          visitor.pass_code,
          visitor.notes,
          visitor.approved_at,
          visitor.entry_time ?? null,
        ]
      );
    }

    for (const booking of bookings) {
      await conn.query(
        `INSERT INTO bookings
          (id, society_id, booking_reference, amenity_id, amenity_name, amenity_image, unit, user_id,
           user_name, booking_date, time_slot, guest_count, status, qr_token, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          booking.id,
          SOCIETY_ID,
          booking.booking_reference,
          booking.amenity_id,
          booking.amenity_name,
          booking.amenity_image,
          booking.unit,
          booking.user_id,
          booking.user_name,
          booking.booking_date,
          booking.time_slot,
          booking.guest_count,
          booking.status,
          booking.qr_token,
          booking.notes,
        ]
      );
    }

    for (const notice of notices) {
      await conn.query(
        `INSERT INTO notices
          (id, society_id, title, body, category, priority, publish_date, expiry_date, author,
           attachment_name, attachment_size, requires_acknowledgement, acknowledged_baseline, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          notice.id,
          SOCIETY_ID,
          notice.title,
          notice.body,
          notice.category,
          notice.priority,
          notice.publish_date,
          notice.expiry_date,
          notice.author,
          notice.attachment_name,
          notice.attachment_size,
          notice.requires_acknowledgement,
          notice.acknowledged_baseline,
          notice.category === 'AGM Notification' ? 'usr_adm_01' : null,
        ]
      );
    }

    for (const event of events) {
      await conn.query(
        `INSERT INTO events
          (id, society_id, title, description, category, event_date, event_time, venue, capacity,
           cover_image, organizer, attendees_baseline, deadline, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.id,
          SOCIETY_ID,
          event.title,
          event.description,
          event.category,
          event.event_date,
          event.event_time,
          event.venue,
          event.capacity,
          event.cover_image,
          event.organizer,
          event.attendees_baseline,
          event.deadline,
          'usr_adm_01',
        ]
      );
    }

    await conn.query(
      `INSERT INTO event_rsvps (event_id, user_id, status) VALUES
        ('evt_01', 'usr_res_01', 'attending'),
        ('evt_01', 'usr_adm_01', 'attending'),
        ('evt_03', 'usr_res_01', 'tentative')`
    );

    for (const album of albums) {
      await conn.query(
        `INSERT INTO albums (id, society_id, title, category, cover_image, album_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [album.id, SOCIETY_ID, album.title, album.category, album.cover_image, album.album_date]
      );
      for (const [id, url, title, uploader, status] of album.media) {
        await conn.query(
          `INSERT INTO media_items
            (id, album_id, url, title, uploader_id, uploader_name, status, media_date)
           VALUES (?, ?, ?, ?, NULL, ?, ?, ?)`,
          [id, album.id, url, title, uploader, status, album.album_date]
        );
      }
    }

    for (const [id, userId, title, message, type, link, isRead] of notifications) {
      await conn.query(
        `INSERT INTO notifications (id, society_id, user_id, title, message, type, link, is_read)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, SOCIETY_ID, userId, title, message, type, link, isRead]
      );
    }

    for (const log of securityLogs) {
      await conn.query(
        `INSERT INTO security_logs
          (id, society_id, visitor_id, visitor_name, unit, gate, entry_time, exit_time, status,
           guard_id, guard_name, pass_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [log[0], SOCIETY_ID, log[1], log[2], log[3], log[4], log[5], log[6], log[7], log[8], log[9], log[10]]
      );
    }

    for (const checkIn of facilityCheckIns) {
      await conn.query(
        `INSERT INTO facility_check_ins
          (id, society_id, booking_id, booking_reference, amenity_name, resident_name, unit,
           time_slot, attendee_count, status, checked_in_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [checkIn[0], SOCIETY_ID, checkIn[1], checkIn[2], checkIn[3], checkIn[4], checkIn[5], checkIn[6], checkIn[7], checkIn[8], checkIn[9]]
      );
    }

    for (const log of auditLogs) {
      await conn.query(
        `INSERT INTO audit_logs (id, society_id, actor_id, actor_name, action, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [log[0], SOCIETY_ID, log[1], log[2], log[3], log[4]]
      );
    }

    await conn.query(
      `INSERT INTO notice_reads (notice_id, user_id) VALUES
        ('not_02', 'usr_res_01'),
        ('not_04', 'usr_res_01')`
    );
    await conn.query(
      `INSERT INTO notice_acknowledgements (notice_id, user_id) VALUES
        ('not_04', 'usr_res_01')`
    );

    
    await conn.query(
      `INSERT INTO community_polls
        (id, society_id, author_name, author_initial, group_name, publish_timestamp, title, subtitle, expires_on, responses_count, min_select, max_select, candidates_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'poll_01',
        SOCIETY_ID,
        'Executive Committee WHCA...',
        'E',
        'All Owners',
        '10 Aug 2022, 09:05 PM',
        'TEST POLL',
        'CHOOSE ONLY 15 CANDIDATES',
        '11 Aug 2026',
        1,
        15,
        15,
        JSON.stringify([
          '01 CANDIDATE A', '02 CANDIDATE B', '03 CANDIDATE C', '04 CANDIDATE D',
          '05 CANDIDATE E', '06 CANDIDATE F', '07 CANDIDATE G', '08 CANDIDATE H',
          '09 CANDIDATE I', '10 CANDIDATE J', '11 CANDIDATE K', '12 CANDIDATE L',
          '13 CANDIDATE M', '14 CANDIDATE N', '15 CANDIDATE O', '16 CANDIDATE P',
          '17 CANDIDATE Q', '18 CANDIDATE R'
        ]),
      ]
    );

    await conn.query(
      `INSERT INTO poll_votes (id, poll_id, user_id, unit, selected_candidates_json)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'vote_01',
        'poll_01',
        'usr_adm_01',
        'C-402',
        JSON.stringify([
          '01 CANDIDATE A', '02 CANDIDATE B', '03 CANDIDATE C', '04 CANDIDATE D', '05 CANDIDATE E',
          '06 CANDIDATE F', '07 CANDIDATE G', '08 CANDIDATE H', '09 CANDIDATE I', '10 CANDIDATE J',
          '11 CANDIDATE K', '12 CANDIDATE L', '13 CANDIDATE M', '14 CANDIDATE N', '15 CANDIDATE O'
        ]),
      ]
    );

    await conn.query(
      `INSERT INTO unit_bills (id, society_id, unit, user_id, invoice_no, title, category, billing_period, amount, status, due_date, paid_at, payment_method)
       VALUES
        ('bill_01', ?, 'A-1204', 'usr_res_01', 'INV-2026-1101', 'Monthly Society Maintenance Statement', 'Statement', 'November 2026', 4850.00, 'unpaid', ?, NULL, NULL),
        ('bill_02', ?, 'A-1204', 'usr_res_01', 'INV-2026-1102', 'Sinking Fund & EV Infrastructure Dues', 'Dues', 'Q4 2026', 1500.00, 'unpaid', ?, NULL, NULL),
        ('bill_03', ?, 'A-1204', 'usr_res_01', 'INV-2026-1001', 'October Maintenance & Water Charges', 'Payment history', 'October 2026', 4850.00, 'paid', ?, NOW(), 'UPI (GPay)')`,
      [SOCIETY_ID, isoDate(10), SOCIETY_ID, isoDate(15), SOCIETY_ID, isoDate(-20)]
    );

    await conn.query(
      `INSERT INTO gate_updates (id, society_id, unit, user_id, update_type, details, pass_code, status)
       VALUES
        ('gu_01', ?, 'A-1204', 'usr_res_01', 'Cab', 'Uber Premier (MH 02 EZ 4091) expected at Main Gate', 'CAB-4091', 'active'),
        ('gu_02', ?, 'A-1204', 'usr_res_01', 'Exit pass', 'Domestic help carrying 2 carton boxes approved by Priya Sharma', 'EXT-8820', 'active'),
        ('gu_03', ?, 'A-1204', 'usr_res_01', 'School bus', 'Route #4 Yellow School Bus drop-off alert at 3:15 PM', 'BUS-0004', 'active')`,
      [SOCIETY_ID, SOCIETY_ID, SOCIETY_ID]
    );

    await conn.query(
      `INSERT INTO service_requests (id, society_id, unit, user_id, desk_type, category, title, description, status)
       VALUES
        ('sr_01', ?, 'A-1204', 'usr_res_01', 'Helpdesk', 'Plumbing', 'Kitchen RO inlet pressure check', 'Low water pressure in kitchen sink line since morning.', 'open'),
        ('sr_02', ?, 'A-1204', 'usr_res_01', 'Service Desk', 'Electrical', 'Balcony LED fixture replacement', 'Requesting society electrician to inspect balcony spot light.', 'in_progress')`,
      [SOCIETY_ID, SOCIETY_ID]
    );

    await conn.commit();
    return { users: users.length, amenities: amenities.length, bookings: bookings.length };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export { DEMO_PASSWORD };

async function main() {
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile?.(file);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const mysql = await import('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'apnaa_society',
    waitForConnections: true,
    connectionLimit: 4,
    timezone: 'Z',
  });
  const result = await seedDatabase(pool, { reset: true });
  console.log('Seed complete:', result);
  console.log(`Demo password for every account: ${DEMO_PASSWORD}`);
  await pool.end();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
}
