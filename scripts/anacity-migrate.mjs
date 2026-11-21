import mysql from 'mysql2/promise';

async function main() {
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile?.(file);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }

  const host = process.env.DB_HOST || 'auth-db1947.hstgr.io';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'u762329739_apnaaentry';
  const password = process.env.DB_PASSWORD || 'Apna$@123';
  const database = process.env.DB_NAME || 'u762329739_apnaaentrydb';

  console.log(`Connecting to ${host}:${port}/${database}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS vehicles (
      id VARCHAR(64) NOT NULL,
      society_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      unit VARCHAR(32) NOT NULL,
      vehicle_type ENUM('Car', 'Two-Wheeler', 'EV') NOT NULL DEFAULT 'Car',
      make_model VARCHAR(120) NOT NULL,
      vehicle_number VARCHAR(32) NOT NULL,
      parking_slot VARCHAR(32) NOT NULL DEFAULT '',
      is_locked TINYINT(1) NOT NULL DEFAULT 0,
      last_movement VARCHAR(120) NOT NULL DEFAULT 'In Parking Slot',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_vehicles_unit (society_id, unit)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS domestic_staff (
      id VARCHAR(64) NOT NULL,
      society_id VARCHAR(64) NOT NULL,
      unit VARCHAR(32) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      name VARCHAR(120) NOT NULL,
      role VARCHAR(64) NOT NULL,
      phone VARCHAR(32) NOT NULL,
      pass_code VARCHAR(32) NOT NULL,
      status ENUM('inside', 'outside', 'on_leave') NOT NULL DEFAULT 'outside',
      entry_time VARCHAR(32) NULL,
      exit_time VARCHAR(32) NULL,
      rating DECIMAL(2,1) NOT NULL DEFAULT 4.8,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_staff_unit (society_id, unit)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS utility_readings (
      id VARCHAR(64) NOT NULL,
      society_id VARCHAR(64) NOT NULL,
      unit VARCHAR(32) NOT NULL,
      meter_type ENUM('water', 'gas', 'electricity') NOT NULL,
      meter_number VARCHAR(64) NOT NULL,
      previous_reading DECIMAL(10,2) NOT NULL DEFAULT 0,
      current_reading DECIMAL(10,2) NOT NULL DEFAULT 0,
      units_consumed DECIMAL(10,2) NOT NULL DEFAULT 0,
      recorded_by_name VARCHAR(120) NOT NULL,
      recorded_date DATE NOT NULL,
      status ENUM('billed', 'pending') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_utility_unit (society_id, unit)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS committee_actions (
      id VARCHAR(64) NOT NULL,
      society_id VARCHAR(64) NOT NULL,
      title VARCHAR(190) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(64) NOT NULL,
      assigned_to VARCHAR(120) NOT NULL,
      assigned_role VARCHAR(64) NOT NULL DEFAULT 'Committee Member',
      due_date DATE NOT NULL,
      priority ENUM('urgent', 'high', 'medium', 'low') NOT NULL DEFAULT 'medium',
      status ENUM('open', 'in_progress', 'completed') NOT NULL DEFAULT 'open',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_actions_society (society_id, status)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS community_discussions (
      id VARCHAR(64) NOT NULL,
      society_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      author_name VARCHAR(120) NOT NULL,
      author_unit VARCHAR(32) NOT NULL,
      author_role VARCHAR(64) NOT NULL DEFAULT 'Resident',
      group_type ENUM('Forum', 'Interest Group') NOT NULL DEFAULT 'Forum',
      group_name VARCHAR(120) NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      likes_count INT UNSIGNED NOT NULL DEFAULT 0,
      comments_count INT UNSIGNED NOT NULL DEFAULT 0,
      image_url VARCHAR(512) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_discussions_society (society_id, group_type)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS local_services (
      id VARCHAR(64) NOT NULL,
      society_id VARCHAR(64) NOT NULL,
      title VARCHAR(120) NOT NULL,
      category VARCHAR(64) NOT NULL,
      provider_name VARCHAR(120) NOT NULL,
      rating DECIMAL(2,1) NOT NULL DEFAULT 4.9,
      eta VARCHAR(32) NOT NULL DEFAULT '15 mins',
      price_starting VARCHAR(32) NOT NULL DEFAULT '₹99',
      phone VARCHAR(32) NOT NULL DEFAULT '1800-200-4455',
      icon VARCHAR(64) NOT NULL DEFAULT 'Store',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `;

  await conn.query(sql);
  console.log('ANACITY feature tables created/verified successfully!');

  // Seed sample initial rows if empty
  const [vehicles] = await conn.query('SELECT COUNT(*) as count FROM vehicles');
  if (vehicles[0].count === 0) {
    console.log('Seeding initial vehicles...');
    await conn.query(`
      INSERT INTO vehicles (id, society_id, user_id, unit, vehicle_type, make_model, vehicle_number, parking_slot, is_locked, last_movement)
      VALUES
        ('veh_01', 'soc_green_valley_01', 'usr_res_01', 'A-1204', 'Car', 'Honda City (White)', 'MH 02 BG 4421', 'B1-42', 0, 'Entered via Gate 1 • 06:45 PM'),
        ('veh_02', 'soc_green_valley_01', 'usr_res_01', 'A-1204', 'EV', 'Ather 450X (Grey)', 'MH 02 DX 9811', 'B1-43 (EV Slot)', 1, 'Locked (Wheel Clamp Active)'),
        ('veh_03', 'soc_green_valley_01', 'usr_adm_01', 'C-402', 'Car', 'Toyota Hycross (Silver)', 'MH 02 EK 1204', 'C-12', 0, 'Parked in Slot C-12');
    `);
  }

  const [staff] = await conn.query('SELECT COUNT(*) as count FROM domestic_staff');
  if (staff[0].count === 0) {
    console.log('Seeding domestic staff...');
    await conn.query(`
      INSERT INTO domestic_staff (id, society_id, unit, user_id, name, role, phone, pass_code, status, entry_time, exit_time, rating)
      VALUES
        ('stf_01', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'Sunita Bai', 'House Maid & Cleaner', '+91 98201 12345', 'HELP-8821', 'inside', '08:15 AM', NULL, 4.9),
        ('stf_02', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'Ramesh Kumar', 'Cook', '+91 98202 23456', 'HELP-4102', 'inside', '07:30 AM', NULL, 4.8),
        ('stf_03', 'soc_green_valley_01', 'A-1204', 'usr_res_01', 'Mohan Lal', 'Personal Driver', '+91 98203 34567', 'HELP-1930', 'outside', NULL, 'Yesterday 08:00 PM', 4.9);
    `);
  }

  const [utilities] = await conn.query('SELECT COUNT(*) as count FROM utility_readings');
  if (utilities[0].count === 0) {
    console.log('Seeding utility readings...');
    await conn.query(`
      INSERT INTO utility_readings (id, society_id, unit, meter_type, meter_number, previous_reading, current_reading, units_consumed, recorded_by_name, recorded_date, status)
      VALUES
        ('utl_01', 'soc_green_valley_01', 'A-1204', 'water', 'WM-A1204-01', 1420.50, 1455.00, 34.50, 'Ganesh (Plumber)', '2026-11-01', 'billed'),
        ('utl_02', 'soc_green_valley_01', 'A-1204', 'gas', 'PNG-A1204', 380.20, 396.40, 16.20, 'Santosh (Gas Ops)', '2026-11-01', 'billed'),
        ('utl_03', 'soc_green_valley_01', 'A-1204', 'electricity', 'EM-SUB-A1204', 5420.00, 5632.00, 212.00, 'Anand Verma', '2026-11-01', 'pending');
    `);
  }

  const [actions] = await conn.query('SELECT COUNT(*) as count FROM committee_actions');
  if (actions[0].count === 0) {
    console.log('Seeding committee action items...');
    await conn.query(`
      INSERT INTO committee_actions (id, society_id, title, description, category, assigned_to, assigned_role, due_date, priority, status)
      VALUES
        ('act_01', 'soc_green_valley_01', 'Install CCTV in Wing C Lift #2', 'High-res dome camera installation approved in AGM.', 'Security', 'Anand Verma', 'Facility Manager', '2026-11-30', 'urgent', 'in_progress'),
        ('act_02', 'soc_green_valley_01', 'Solar Rooftop Vendor Quotations', 'Review comparative bids for 50kW common-area solar system.', 'Finance', 'Rajesh Nair', 'Secretary', '2026-12-10', 'high', 'open'),
        ('act_03', 'soc_green_valley_01', 'Tennis Court Floodlight LED Upgrade', 'Replace halogen floodlights with 400W LED sports fixtures.', 'Maintenance', 'Pooja Hegde', 'Sports Incharge', '2026-11-25', 'medium', 'completed');
    `);
  }

  const [discussions] = await conn.query('SELECT COUNT(*) as count FROM community_discussions');
  if (discussions[0].count === 0) {
    console.log('Seeding discussions & interest groups...');
    await conn.query(`
      INSERT INTO community_discussions (id, society_id, user_id, author_name, author_unit, author_role, group_type, group_name, title, content, likes_count, comments_count)
      VALUES
        ('disc_01', 'soc_green_valley_01', 'usr_adm_01', 'Rajesh Nair', 'C-402', 'Secretary', 'Forum', 'Apartment Owners Forum', 'Guidelines for EV Charger Setup in Basements', 'Managing committee has finalized the standard operating procedure for dedicated EV meter connections in B1/B2 slots. Please review the attached fire-safety and load-balancing norms.', 28, 14),
        ('disc_02', 'soc_green_valley_01', 'usr_res_01', 'Priya Sharma', 'A-1204', 'Resident', 'Interest Group', 'Pet Parents Powai', 'Weekend Dog Walk & Agility Training at Central Lawn', 'Calling all pet parents! We are hosting a 30-min fun agility & social session this Sunday morning at 7:30 AM. Treats and water provided. Please keep pups leashed during entry.', 35, 19),
        ('disc_03', 'soc_green_valley_01', 'usr_a701', 'Dr. Anita Roy', 'A-701', 'Resident', 'Interest Group', 'Green Living & Composting', 'Wet Waste Segregation & Organic Manure Harvest', 'Our first batch of 100% organic compost from the society wet-waste bins is ready! Residents can collect 2kg free bags from the nursery desk this Saturday.', 42, 8);
    `);
  }

  const [services] = await conn.query('SELECT COUNT(*) as count FROM local_services');
  if (services[0].count === 0) {
    console.log('Seeding local services...');
    await conn.query(`
      INSERT INTO local_services (id, society_id, title, category, provider_name, rating, eta, price_starting, phone, icon)
      VALUES
        ('srv_01', 'soc_green_valley_01', 'Daily Fresh Milk & Groceries', 'Grocery', 'Nature Basket Store #4', 4.9, '10-15 mins', '₹45', '1800-442-1100', 'ShoppingBag'),
        ('srv_02', 'soc_green_valley_01', '20L Bisleri Water Can Delivery', 'Water', 'Powai Pure Waters', 4.8, '20 mins', '₹90', '98200-11223', 'Droplets'),
        ('srv_03', 'soc_green_valley_01', 'Express Ironing & Dry Cleaning', 'Laundry', 'SpinClean Society Valet', 4.9, 'Same Day', '₹15/pc', '98201-99887', 'Shirt'),
        ('srv_04', 'soc_green_valley_01', 'Home Deep Cleaning & Pest Control', 'Cleaning', 'UrbanCare Pro', 4.8, 'Scheduled', '₹899', '1800-112-2233', 'Sparkles'),
        ('srv_05', 'soc_green_valley_01', 'Emergency Electrician & Plumber', 'Repairs', 'Society Rapid Maintenance', 5.0, '10 mins', 'Free Inspection', '98204-55667', 'Wrench');
    `);
  }

  console.log('All ANACITY tables and initial records ready in remote MySQL!');
  await conn.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

