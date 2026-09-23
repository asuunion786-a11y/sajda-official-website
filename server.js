const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const CONTENT_PATH = path.join(__dirname, 'data', 'content.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, crypto.randomBytes(10).toString('hex') + safeExt);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readContent() {
  return JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
}

function writeContent(data) {
  fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// --- Public: read content ---
app.get('/api/content', (req, res) => {
  try {
    res.json(readContent());
  } catch (e) {
    res.status(500).json({ error: 'Could not read content' });
  }
});

// --- Admin login ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid username or password' });
});

// --- Admin: save one section, or the whole content object ---
app.put('/api/content/:section', requireAuth, (req, res) => {
  const validSections = ['about', 'activities', 'programs', 'achievements', 'publications', 'contact'];
  const { section } = req.params;
  if (!validSections.includes(section)) {
    return res.status(400).json({ error: 'Unknown section' });
  }
  try {
    const current = readContent();
    current[section] = req.body;
    writeContent(current);
    res.json({ ok: true, content: current });
  } catch (e) {
    res.status(500).json({ error: 'Could not save content' });
  }
});

// --- Admin: upload an image file, get back a URL to use as a cover/logo ---
app.post('/api/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ error: 'No file received' });
    res.json({ url: '/uploads/' + req.file.filename });
  });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`SAJDA site running on http://localhost:${PORT}`);
  console.log(`Admin panel at http://localhost:${PORT}/admin`);
});
