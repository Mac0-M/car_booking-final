-- ========================================
-- Car Booking System — SQLite Schema
-- ========================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------
-- Users
-- ----------------------------------------
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
);
-- role: 'User' | 'Admin' | 'Super_Admin'

-- ----------------------------------------
-- Vehicles
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_name     TEXT    NOT NULL,
    type             TEXT    NOT NULL,
    capacity         INTEGER NOT NULL,
    re_fuel          INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true
    total_mile       INTEGER NOT NULL DEFAULT 0,
    last_maintenance TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    status           TEXT    NOT NULL DEFAULT 'available',
    vehicle_img      TEXT,
    total_bookby     INTEGER NOT NULL DEFAULT 0,
    last_update      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
);
-- type:   'Sedan' | 'Pickup' | 'Van' | 'SUV' | 'Other'
-- status: 'available' | 'unavailable'

-- ----------------------------------------
-- Bookings
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    book_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    booked_by     INTEGER NOT NULL REFERENCES users(user_id),
    passenger     INTEGER          REFERENCES users(user_id),
    booked_for    INTEGER          REFERENCES users(user_id), -- Proxy Booking (ฝากจองให้คนอื่น)
    vehicle_id    INTEGER NOT NULL REFERENCES vehicles(vehicle_id),
    depart        TEXT    NOT NULL,
    return        TEXT,
    destination   TEXT,
    use_for       TEXT,
    mile_distance INTEGER,
    status        TEXT    NOT NULL DEFAULT 'booked',
    create_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    last_update   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
);
-- status: 'booked' | 'complete' | 'cancel'

-- ----------------------------------------
-- Indexes
-- ----------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user    ON bookings(booked_by);
CREATE INDEX IF NOT EXISTS idx_bookings_status  ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status  ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
