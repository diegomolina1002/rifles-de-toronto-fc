import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'rifles.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nickname TEXT DEFAULT '',
    number INTEGER NOT NULL,
    position TEXT NOT NULL CHECK(position IN ('Portero', 'Defensa', 'Medio', 'Delantero')),
    goals INTEGER NOT NULL DEFAULT 0,
    matches INTEGER NOT NULL DEFAULT 0,
    photo_url TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opponent TEXT NOT NULL,
    league TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL DEFAULT '20:00',
    venue TEXT NOT NULL DEFAULT '',
    jersey_color TEXT NOT NULL DEFAULT 'Azul Marino',
    is_upcoming INTEGER NOT NULL DEFAULT 1,
    score_home INTEGER,
    score_away INTEGER,
    status TEXT NOT NULL DEFAULT 'Programado',
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS jerseys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    edition TEXT DEFAULT '',
    league TEXT NOT NULL,
    color_hex TEXT NOT NULL DEFAULT '#1E3A8A',
    description TEXT DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    matchday TEXT DEFAULT '',
    photographer TEXT NOT NULL DEFAULT '@aleextasis',
    image_url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function seedInitialData() {
  // Players and Jerseys stay empty by default until added via /admin
  const matchCount = db.prepare('SELECT COUNT(*) AS count FROM matches').get().count;
  if (matchCount === 0) {
    const insertMatch = db.prepare(`
      INSERT INTO matches (opponent, league, date, time, venue, jersey_color, is_upcoming, score_home, score_away, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertMatch.run(
      'Atlético del Sur F.C.',
      'Liga La Curva CDMX',
      '2026-11-28',
      '20:30',
      'Complejo La Curva, CDMX',
      'Azul Marino',
      1,
      null,
      null,
      'Programado',
      'Jornada Nocturna — Llegar 30 min antes'
    );
    insertMatch.run(
      'Deportivo Contreras',
      'Liga ODEMAC (Final de Copa)',
      '2026-11-15',
      '11:00',
      'Campo Contreras, Magdalena Contreras',
      'Amarilla',
      0,
      3,
      1,
      'Victoria — Campeones',
      '2do Título Histórico del Club'
    );
    insertMatch.run(
      'Halcones Motolinía',
      'Liga Universidad Motolinía (Final)',
      '2026-11-03',
      '19:00',
      'Cancha Universidad Motolinía, CDMX',
      'Roja',
      0,
      4,
      2,
      'Victoria — Campeones',
      '1er Título Histórico del Club'
    );
    insertMatch.run(
      'Club Cuervos Rápido',
      'Capital Fútbol Rápido',
      '2026-11-20',
      '21:00',
      'Capital Arena, CDMX',
      'Blanca',
      0,
      5,
      3,
      'Victoria',
      'Gran remontada en el último cuarto'
    );
  }

  const photoCount = db.prepare('SELECT COUNT(*) AS count FROM photos').get().count;
  if (photoCount === 0) {
    const insertPhoto = db.prepare(`
      INSERT INTO photos (title, matchday, photographer, image_url)
      VALUES (?, ?, ?, ?)
    `);
    insertPhoto.run(
      'Noche de Campeonato — Campeones 2026',
      'Bicampeonato 2026 · CDMX',
      '@aleextasis',
      '/images/campeones-2026.jpg'
    );
    insertPhoto.run(
      'Plantel Oficial — Campo Contreras',
      'Liga ODEMAC · Magdalena Contreras',
      '@aleextasis',
      '/images/accion-2.jpg'
    );
    insertPhoto.run(
      'Acción en Cancha — Control y Velocidad',
      'Torneo CDMX 2026',
      '@aleextasis',
      '/images/accion-1.jpg'
    );
  }
}

seedInitialData();

export default db;
