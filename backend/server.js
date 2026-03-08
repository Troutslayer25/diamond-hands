const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const db = require('./database');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ dest: 'uploads/' });

// Create uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ── Upload Excel File ─────────────────────────────────────
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const uploadDate = new Date().toISOString().split('T')[0];

    const insertUpload = db.prepare(`
      INSERT INTO daily_uploads (
        upload_date, symbol, name, sector, industry_name,
        ind_group_rank, ind_group_rs, smr_rating, eps_rating,
        rs_rating, current_price, price_chg, price_pct_chg,
        vol_pct_chg, volume, ad_rating, comp_rating,
        market_cap, company_description
      ) VALUES (
        @upload_date, @symbol, @name, @sector, @industry_name,
        @ind_group_rank, @ind_group_rs, @smr_rating, @eps_rating,
        @rs_rating, @current_price, @price_chg, @price_pct_chg,
        @vol_pct_chg, @volume, @ad_rating, @comp_rating,
        @market_cap, @company_description
      )
    `);

    const insertStock = db.prepare(`
      INSERT OR IGNORE INTO stocks (
        symbol, name, sector, industry_name,
        company_description, first_seen_date, first_seen_price
      ) VALUES (
        @symbol, @name, @sector, @industry_name,
        @company_description, @first_seen_date, @first_seen_price
      )
    `);

    const processRows = db.transaction((rows) => {
      for (const row of rows) {
        insertStock.run({
          symbol: row['Symbol'],
          name: row['Name'],
          sector: row['Sector'],
          industry_name: row['Industry Name'],
          company_description: row['Company Description'],
          first_seen_date: uploadDate,
          first_seen_price: row['Current Price']
        });

        insertUpload.run({
          upload_date: uploadDate,
          symbol: row['Symbol'],
          name: row['Name'],
          sector: row['Sector'],
          industry_name: row['Industry Name'],
          ind_group_rank: row['Ind Group Rank'],
          ind_group_rs: row['Ind Group RS'],
          smr_rating: row['SMR Rating'],
          eps_rating: row['EPS Rating'],
          rs_rating: row['RS Rating'],
          current_price: row['Current Price'],
          price_chg: row['Price $ Chg'],
          price_pct_chg: row['Price % Chg'],
          vol_pct_chg: row['Vol % Chg vs 50-Day'],
          volume: row['Volume (1000s)'],
          ad_rating: row['A/D Rating'],
          comp_rating: row['Comp Rating'],
          market_cap: row['Market Cap (mil)'],
          company_description: row['Company Description']
        });
      }
    });

    processRows(rows);
    fs.unlinkSync(req.file.path); // clean up temp file

    res.json({ success: true, rowsImported: rows.length, date: uploadDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Get All Scorecards ────────────────────────────────────
app.get('/api/scorecards', (req, res) => {
  const scorecards = db.prepare(`
    SELECT
      s.symbol,
      s.name,
      s.sector,
      s.industry_name,
      s.company_description,
      s.first_seen_date,
      s.first_seen_price,
      (SELECT rs_rating FROM daily_uploads
       WHERE symbol = s.symbol
       ORDER BY upload_date DESC LIMIT 1) as rs_rating,
      (SELECT current_price FROM daily_uploads
       WHERE symbol = s.symbol
       ORDER BY upload_date DESC LIMIT 1) as current_price,
      (SELECT COUNT(DISTINCT upload_date) FROM daily_uploads
       WHERE symbol = s.symbol
       AND upload_date >= date('now', '-21 days')) as appearances_21d
    FROM stocks s
    ORDER BY appearances_21d DESC
  `).all();

  const result = scorecards.map(s => ({
    ...s,
    price_change_pct: s.first_seen_price && s.current_price
      ? (((s.current_price - s.first_seen_price) / s.first_seen_price) * 100).toFixed(2)
      : null
  }));

  res.json(result);
});

// ── Get Single Scorecard ──────────────────────────────────
app.get('/api/scorecards/:symbol', (req, res) => {
  const { symbol } = req.params;
  const stock = db.prepare(`SELECT * FROM stocks WHERE symbol = ?`).get(symbol);
  if (!stock) return res.status(404).json({ error: 'Stock not found' });

  const history = db.prepare(`
    SELECT * FROM daily_uploads
    WHERE symbol = ?
    ORDER BY upload_date DESC
  `).all(symbol);

  const appearances21d = db.prepare(`
    SELECT COUNT(DISTINCT upload_date) as count
    FROM daily_uploads
    WHERE symbol = ? AND upload_date >= date('now', '-21 days')
  `).get(symbol);

  res.json({
    ...stock,
    history,
    appearances_21d: appearances21d.count,
    price_change_pct: stock.first_seen_price && history[0]?.current_price
      ? (((history[0].current_price - stock.first_seen_price) / stock.first_seen_price) * 100).toFixed(2)
      : null
  });
});

app.listen(PORT, () => {
  console.log(`DiamondHands backend running on http://localhost:${PORT}`);
});