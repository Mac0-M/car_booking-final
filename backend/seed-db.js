const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database/car_booking.sqlite');
console.log('Opening database for seeding at:', dbPath);

const db = new Database(dbPath);

async function seed() {
  // Ensure tables exist before inserting
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      user_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name    TEXT    NOT NULL,
      password     TEXT    NOT NULL,
      email        TEXT    NOT NULL UNIQUE,
      phone        TEXT    NOT NULL,
      profile_img  TEXT,
      total_booked INTEGER NOT NULL DEFAULT 0,
      role         TEXT    NOT NULL DEFAULT 'User',
      create_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
      last_update  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS vehicles (
      vehicle_id       INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_name     TEXT    NOT NULL,
      type             TEXT    NOT NULL,
      capacity         INTEGER NOT NULL,
      re_fuel          INTEGER NOT NULL DEFAULT 0,
      total_mile       INTEGER NOT NULL DEFAULT 0,
      last_maintenance TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
      status           TEXT    NOT NULL DEFAULT 'available',
      vehicle_img      TEXT,
      total_bookby     INTEGER NOT NULL DEFAULT 0,
      last_update      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
    )
  `).run();

  // Read .env file manually to support standalone seeding execution
  const fs = require('fs');
  const dotenvPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(dotenvPath)) {
    const envConfig = fs.readFileSync(dotenvPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      const parts = trimmedLine.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
        process.env[key] = val;
      }
    }
  }

  const enableSuperAdmin = process.env.ENABLE_SUPER_ADMIN !== 'false';
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@admin.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';
  const superAdminPhone = process.env.SUPER_ADMIN_PHONE || '0800000000';

  if (enableSuperAdmin) {
    const existingSuperAdmin = db.prepare("SELECT * FROM users WHERE role = 'Super_Admin'").get();
    const hash = await bcrypt.hash(superAdminPassword, 10);
    if (!existingSuperAdmin) {
      console.log('Seeding Super Admin from env configuration...');
      db.prepare(`
        INSERT INTO users (user_name, password, email, phone, role, total_booked)
        VALUES (?, ?, ?, ?, 'Super_Admin', 0)
      `).run(superAdminName, hash, superAdminEmail, superAdminPhone);
      console.log(`Inserted Super Admin: ${superAdminEmail}`);
    } else {
      console.log('Super Admin already exists. Updating details to match .env configuration...');
      db.prepare(`
        UPDATE users
        SET user_name = ?, password = ?, email = ?, phone = ?, last_update = (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
        WHERE role = 'Super_Admin'
      `).run(superAdminName, hash, superAdminEmail, superAdminPhone);
      console.log(`Updated Super Admin: ${superAdminEmail}`);
    }
  } else {
    console.log('Super Admin seeding is disabled via .env configuration.');
  }

  // Check if users exist besides superadmin
  const userCountObj = db.prepare("SELECT COUNT(*) as count FROM users WHERE role != 'Super_Admin'").get();
  if (userCountObj.count === 0) {
    console.log('Seeding mock users...');
    const users = [
      {
        name: 'Mock Admin User',
        email: 'admin@test.com',
        phone: '0812345678',
        role: 'Admin'
      },
      {
        name: 'สมชาย รักดี',
        email: 'somchai@test.com',
        phone: '0823456789',
        role: 'User'
      },
      {
        name: 'นางสาววิภา ใจดี',
        email: 'wipa@test.com',
        phone: '0834567890',
        role: 'User'
      }
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (user_name, password, email, phone, role, total_booked)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    for (const u of users) {
      const hash = await bcrypt.hash('password123', 10);
      insertUser.run(u.name, hash, u.email, u.phone, u.role);
      console.log(`Inserted user: ${u.email}`);
    }
  } else {
    console.log('Mock users already exist.');
  }

  // Check if vehicles exist
  const vehicleCountObj = db.prepare("SELECT COUNT(*) as count FROM vehicles").get();
  if (vehicleCountObj.count === 0) {
    console.log('Seeding mock vehicles...');
    const vehicles = [
      {
        name: 'Toyota Camry (กข-1234)',
        type: 'Sedan',
        capacity: 4,
        re_fuel: 1,
        total_mile: 12500,
        status: 'available'
      },
      {
        name: 'Isuzu D-Max (ขค-5678)',
        type: 'Pickup',
        capacity: 5,
        re_fuel: 1,
        total_mile: 45200,
        status: 'available'
      },
      {
        name: 'Toyota Commuter (คฆ-9012)',
        type: 'Van',
        capacity: 12,
        re_fuel: 0,
        total_mile: 98100,
        status: 'unavailable'
      },
      {
        name: 'Honda CR-V (งจ-3456)',
        type: 'SUV',
        capacity: 7,
        re_fuel: 1,
        total_mile: 23400,
        status: 'available'
      }
    ];

    const insertVehicle = db.prepare(`
      INSERT INTO vehicles (vehicle_name, type, capacity, re_fuel, total_mile, status, total_bookby)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    for (const v of vehicles) {
      insertVehicle.run(v.name, v.type, v.capacity, v.re_fuel, v.total_mile, v.status);
      console.log(`Inserted vehicle: ${v.name}`);
    }
  } else {
    console.log('Vehicles already exist.');
  }

  console.log('Seeding complete!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
});
