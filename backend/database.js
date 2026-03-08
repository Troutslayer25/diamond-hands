const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = process.env.DB_PATH || __dirname;
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'diamondhands.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT,
    sector TEXT,
    industry_name TEXT,
    company_description TEXT,
    first_seen_date TEXT NOT NULL,
    first_seen_price REAL
  );

  CREATE TABLE IF NOT EXISTS daily_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_date TEXT NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT,
    sector TEXT,
    industry_name TEXT,
    ind_group_rank TEXT,
    ind_group_rs TEXT,
    smr_rating TEXT,
    eps_rating REAL,
    rs_rating REAL,
    current_price REAL,
    price_chg REAL,
    price_pct_chg REAL,
    vol_pct_chg TEXT,
    volume TEXT,
    ad_rating TEXT,
    comp_rating REAL,
    market_cap TEXT,
    company_description TEXT
  );
`);

module.exports = db;