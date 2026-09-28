const express = require('express');
const fs = require('fs');
const path = require('path');
const { scanImage } = require('../services/scanner-service');

const router = express.Router();
const CSV_PATH = path.join(__dirname, '..', 'data', 'students.csv');

// ---- tiny CSV parser (handles quoted fields) ----
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((v) => v.trim() !== '')) rows.push(row); }
  return rows;
}

// ---- load students.csv (reloads automatically when the file is edited) ----
let cache = { mtime: 0, map: new Map() };
function getStudents() {
  const { mtimeMs } = fs.statSync(CSV_PATH);
  if (mtimeMs !== cache.mtime) {
    const [header, ...rows] = parseCsv(fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, ''));
    const cols = header.map((h) => h.trim());
    const map = new Map();
    for (const r of rows) {
      const o = {};
      cols.forEach((c, i) => (o[c] = (r[i] || '').trim()));
      if (o.studentId) map.set(o.studentId, o);
    }
    cache = { mtime: mtimeMs, map };
    console.log(`[ATTENDANCE] Loaded ${map.size} students from students.csv`);
  }
  return cache.map;
}

function formatTime(d = new Date()) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function buildResult(scannedId) {
  const s = getStudents().get(scannedId);
  if (!s) return { matched: false };

  const mi = s.middleInitial ? ` ${s.middleInitial.replace('.', '')}.` : '';
  return {
    matched: true,
    studentId: s.studentId,
    studentName: `${s.firstName}${mi} ${s.lastName}`,   // Ramil P. Dela Cruz
    formalName: `${s.lastName}, ${s.firstName}${mi}`,   // Dela Cruz, Ramil P.
    course: s.course || '',
    yearLevel: s.yearLevel || '',
    timeIn: formatTime(),
  };
}

function errorMessage(err) {
  return err.code === 'ENOENT' ? `students.csv not found at ${CSV_PATH}` : err.message || 'Server error';
}

// POST /api/v1/attendance/scan-image
// Body: raw JPEG (Content-Type: image/jpeg). Runs OCR, then looks the ID up in students.csv.
router.post(
  '/scan-image',
  express.raw({ type: ['image/*', 'application/octet-stream'], limit: '5mb' }),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: 'Send the image as the raw request body.' });
    }

    let ocr;
    try {
      ocr = await scanImage(req.body);
    } catch (err) {
      console.error('[ATTENDANCE] OCR error:', err.message);
      return res.status(503).json({ message: err.message });
    }

    if (!ocr.scannedId) return res.json({ detected: false });

    try {
      console.log(`[ATTENDANCE] OCR read: '${ocr.scannedId}'`);
      res.json({ detected: true, scannedId: ocr.scannedId, ...buildResult(ocr.scannedId) });
    } catch (err) {
      console.error('[ATTENDANCE] lookup error:', err);
      res.status(500).json({ message: errorMessage(err) });
    }
  }
);

// POST /api/v1/attendance/scan   body: { scannedId: "24-10326" }  (manual lookup, no OCR)
router.post('/scan', (req, res) => {
  try {
    const scannedId = String((req.body || {}).scannedId || '').trim();
    if (!scannedId) return res.status(400).json({ matched: false, message: 'scannedId required' });
    res.json(buildResult(scannedId));
  } catch (err) {
    console.error('[ATTENDANCE] scan error:', err);
    res.status(500).json({ matched: false, message: errorMessage(err) });
  }
});

module.exports = router;