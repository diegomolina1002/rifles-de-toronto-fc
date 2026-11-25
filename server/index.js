import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 4000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rifles2026';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'rifles_toronto_fc_2026_secret_key';

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg').toLowerCase() || '.jpg';
    const safeBase =
      path
        .basename(file.originalname || 'img', ext)
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 32) || 'media';
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${safeBase}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WEBP).'));
    }
  }
});

function createToken() {
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.role === 'admin' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesión en el panel admin.' });
  }
  next();
}

function removeUploadedFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  const filePath = path.join(uploadsDir, path.basename(fileUrl));
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, club: 'Rifles de Toronto F.C.', runtime: 'local-sqlite' });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }
  res.json({ token: createToken() });
});

app.get('/api/admin/verify', requireAdmin, (_req, res) => {
  res.json({ authenticated: true });
});

// ========================
// PLAYERS CRUD
// ========================
app.get('/api/players', (_req, res) => {
  const rows = db.prepare('SELECT * FROM players ORDER BY number ASC, id ASC').all();
  res.json(rows);
});

app.post('/api/players', requireAdmin, upload.single('photo'), (req, res) => {
  const { name, nickname = '', number, position, goals = 0, matches = 0 } = req.body;
  if (!name || !number || !position) {
    return res.status(400).json({ error: 'Nombre, dorsal y posición son obligatorios.' });
  }
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const result = db
    .prepare(
      `INSERT INTO players (name, nickname, number, position, goals, matches, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(name).trim(),
      String(nickname).trim(),
      Number(number),
      String(position).trim(),
      Number(goals) || 0,
      Number(matches) || 0,
      photoUrl
    );
  res.status(201).json(db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/players/:id', requireAdmin, upload.single('photo'), (req, res) => {
  const existing = db.prepare('SELECT * FROM players WHERE id = ?').get(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Jugador no encontrado.' });

  const {
    name = existing.name,
    nickname = existing.nickname,
    number = existing.number,
    position = existing.position,
    goals = existing.goals,
    matches = existing.matches,
    clearPhoto
  } = req.body;

  let photoUrl = existing.photo_url;
  if (req.file) {
    removeUploadedFile(existing.photo_url);
    photoUrl = `/uploads/${req.file.filename}`;
  } else if (clearPhoto === 'true') {
    removeUploadedFile(existing.photo_url);
    photoUrl = '';
  }

  db.prepare(
    `UPDATE players
     SET name = ?, nickname = ?, number = ?, position = ?, goals = ?, matches = ?, photo_url = ?
     WHERE id = ?`
  ).run(
    String(name).trim(),
    String(nickname).trim(),
    Number(number),
    String(position).trim(),
    Number(goals) || 0,
    Number(matches) || 0,
    photoUrl,
    existing.id
  );
  res.json(db.prepare('SELECT * FROM players WHERE id = ?').get(existing.id));
});

app.delete('/api/players/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM players WHERE id = ?').get(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Jugador no encontrado.' });
  removeUploadedFile(existing.photo_url);
  db.prepare('DELETE FROM players WHERE id = ?').run(existing.id);
  res.json({ deleted: true, id: existing.id });
});

// ========================
// MATCHES CRUD
// ========================
app.get('/api/matches', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM matches ORDER BY is_upcoming DESC, date DESC, id DESC')
    .all();
  res.json(rows);
});

app.post('/api/matches', requireAdmin, (req, res) => {
  const {
    opponent,
    league,
    date,
    time = '20:00',
    venue = '',
    jersey_color = 'Azul Marino',
    is_upcoming = 1,
    score_home = null,
    score_away = null,
    status = 'Programado',
    notes = ''
  } = req.body;

  if (!opponent || !league || !date) {
    return res.status(400).json({ error: 'Rival, torneo y fecha son obligatorios.' });
  }

  const upcomingFlag = Number(is_upcoming) ? 1 : 0;
  if (upcomingFlag === 1) {
    db.prepare('UPDATE matches SET is_upcoming = 0 WHERE is_upcoming = 1').run();
  }

  const result = db
    .prepare(
      `INSERT INTO matches (opponent, league, date, time, venue, jersey_color, is_upcoming, score_home, score_away, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(opponent).trim(),
      String(league).trim(),
      String(date).trim(),
      String(time).trim(),
      String(venue).trim(),
      String(jersey_color).trim(),
      upcomingFlag,
      score_home === '' || score_home === null ? null : Number(score_home),
      score_away === '' || score_away === null ? null : Number(score_away),
      String(status).trim(),
      String(notes).trim()
    );
  res.status(201).json(db.prepare('SELECT * FROM matches WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/matches/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM matches WHERE id = ?').get(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Partido no encontrado.' });

  const {
    opponent = existing.opponent,
    league = existing.league,
    date = existing.date,
    time = existing.time,
    venue = existing.venue,
    jersey_color = existing.jersey_color,
    is_upcoming = existing.is_upcoming,
    score_home = existing.score_home,
    score_away = existing.score_away,
    status = existing.status,
    notes = existing.notes
  } = req.body;

  const upcomingFlag = Number(is_upcoming) ? 1 : 0;
  if (upcomingFlag === 1 && existing.is_upcoming === 0) {
    db.prepare('UPDATE matches SET is_upcoming = 0 WHERE is_upcoming = 1').run();
  }

  db.prepare(
    `UPDATE matches
     SET opponent = ?, league = ?, date = ?, time = ?, venue = ?, jersey_color = ?,
         is_upcoming = ?, score_home = ?, score_away = ?, status = ?, notes = ?
     WHERE id = ?`
  ).run(
    String(opponent).trim(),
    String(league).trim(),
    String(date).trim(),
    String(time).trim(),
    String(venue).trim(),
    String(jersey_color).trim(),
    upcomingFlag,
    score_home === '' || score_home === null ? null : Number(score_home),
    score_away === '' || score_away === null ? null : Number(score_away),
    String(status).trim(),
    String(notes).trim(),
    existing.id
  );
  res.json(db.prepare('SELECT * FROM matches WHERE id = ?').get(existing.id));
});

app.delete('/api/matches/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM matches WHERE id = ?').get(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Partido no encontrado.' });
  db.prepare('DELETE FROM matches WHERE id = ?').run(existing.id);
  res.json({ deleted: true, id: existing.id });
});

// ========================
// JERSEYS CRUD
// ========================
app.get('/api/jerseys', (_req, res) => {
  const rows = db.prepare('SELECT * FROM jerseys ORDER BY id DESC').all();
  res.json(rows);
});

app.post('/api/jerseys', requireAdmin, upload.single('image'), (req, res) => {
  const { name, edition = '', league, color_hex = '#1E3A8A', description = '' } = req.body;
  if (!name || !league) {
    return res.status(400).json({ error: 'Nombre de la playera y liga son obligatorios.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Sube una fotografía real de la playera.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  const result = db
    .prepare(
      `INSERT INTO jerseys (name, edition, league, color_hex, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(name).trim(),
      String(edition).trim(),
      String(league).trim(),
      String(color_hex).trim() || '#1E3A8A',
      String(description).trim(),
      imageUrl
    );
  res.status(201).json(db.prepare('SELECT * FROM jerseys WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/jerseys/:id', requireAdmin, upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM jerseys WHERE id = ?').get(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Playera no encontrada.' });

  const {
    name = existing.name,
    edition = existing.edition,
    league = existing.league,
    color_hex = existing.color_hex,
    description = existing.description
  } = req.body;

  let imageUrl = existing.image_url;
  if (req.file) {
    removeUploadedFile(existing.image_url);
    imageUrl = `/uploads/${req.file.filename}`;
  }

  db.prepare(
    `UPDATE jerseys
     SET name = ?, edition = ?, league = ?, color_hex = ?, description = ?, image_url = ?
     WHERE id = ?`
  ).run(
    String(name).trim(),
    String(edition).trim(),
    String(league).trim(),
    String(color_hex).trim() || '#1E3A8A',
    String(description).trim(),
    imageUrl,
    existing.id
  );
  res.json(db.prepare('SELECT * FROM jerseys WHERE id = ?').get(existing.id));
});

app.delete('/api/jerseys/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM jerseys WHERE id = ?').get(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Playera no encontrada.' });
  removeUploadedFile(existing.image_url);
  db.prepare('DELETE FROM jerseys WHERE id = ?').run(existing.id);
  res.json({ deleted: true, id: existing.id });
});

// ========================
// GALLERY CRUD (/api/gallery & /api/photos)
// ========================
function getGallery(_req, res) {
  const rows = db.prepare('SELECT * FROM photos ORDER BY id DESC').all();
  res.json(rows);
}

function postGallery(req, res) {
  const files = req.files || [];
  if (files.length === 0) {
    return res.status(400).json({ error: 'Selecciona al menos una foto para subir.' });
  }
  const { title = 'Partido Rifles de Toronto F.C.', matchday = '', photographer = '@aleextasis' } =
    req.body;
  const insert = db.prepare(
    `INSERT INTO photos (title, matchday, photographer, image_url) VALUES (?, ?, ?, ?)`
  );

  const created = [];
  for (let i = 0; i < files.length; i++) {
    const fileTitle =
      files.length > 1 ? `${String(title).trim()} (${i + 1})` : String(title).trim();
    const imageUrl = `/uploads/${files[i].filename}`;
    const result = insert.run(
      fileTitle,
      String(matchday).trim(),
      String(photographer).trim() || '@aleextasis',
      imageUrl
    );
    created.push(db.prepare('SELECT * FROM photos WHERE id = ?').get(result.lastInsertRowid));
  }
  res.status(201).json(created);
}

function deleteGallery(req, res) {
  const existing = db.prepare('SELECT * FROM photos WHERE id = ?').get(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Foto no encontrada.' });
  removeUploadedFile(existing.image_url);
  db.prepare('DELETE FROM photos WHERE id = ?').run(existing.id);
  res.json({ deleted: true, id: existing.id });
}

app.get('/api/gallery', getGallery);
app.post('/api/gallery', requireAdmin, upload.array('photos', 20), postGallery);
app.delete('/api/gallery/:id', requireAdmin, deleteGallery);

app.get('/api/photos', getGallery);
app.post('/api/photos', requireAdmin, upload.array('photos', 20), postGallery);
app.delete('/api/photos/:id', requireAdmin, deleteGallery);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Error en el servidor.' });
});

app.listen(PORT, () => {
  console.log(`Rifles de Toronto F.C. API local corriendo en http://localhost:${PORT}`);
});
