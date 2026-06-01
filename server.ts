import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import crypto from "crypto";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || "roomiematch.db";

// Asegurar que el directorio exista (importante para el volumen de Railway)
const dbDir = path.dirname(DB_PATH);
if (dbDir !== "." && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// ── Uploads directory (persistent volume) ──
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(path.dirname(DB_PATH), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config: filename único, solo imágenes, max 5MB
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes JPEG, PNG o WebP"));
    }
  },
});

const JWT_SECRET = process.env.JWT_SECRET || "roomie-secret-key-123";
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production");
}

// Crear una interfaz extendida para Request
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// Initialize Database
db.exec("PRAGMA foreign_keys = OFF;");

// Check if we need to add columns (migration)
const listingsInfo = db.prepare("PRAGMA table_info(listings)").all() as any[];
const hasLat = listingsInfo.some(col => col.name === 'lat');

if (!hasLat && listingsInfo.length > 0) {
  console.log("Migrating database: adding lat/lng to listings");
  db.exec("ALTER TABLE listings ADD COLUMN lat REAL;");
  db.exec("ALTER TABLE listings ADD COLUMN lng REAL;");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    photo_url TEXT,
    university TEXT,
    bio TEXT,
    is_verified INTEGER DEFAULT 0,
    compatibility_form TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    safety_level TEXT CHECK(safety_level IN ('green', 'yellow', 'red')),
    description TEXT,
    geojson TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT,
    price REAL,
    available_from DATE,
    max_occupants INTEGER,
    photos TEXT, -- JSON array
    rules TEXT,
    zone_id INTEGER,
    lat REAL,
    lng REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    stars INTEGER CHECK(stars >= 1 AND stars <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, user_id),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);
db.exec("PRAGMA foreign_keys = ON;");

// Seed Data Helper (only if empty or reset)
const seedData = (force = false) => {
  try {
    if (force) {
      console.log("Forcing database reset...");
      db.prepare("DELETE FROM ratings").run();
      db.prepare("DELETE FROM listings").run();
      db.prepare("DELETE FROM zones").run();
      db.prepare("DELETE FROM users").run();
    }

    const userCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;
    if (userCount > 0 && !force) {
      console.log("Database already has data, skipping seed.");
      return;
    }

    console.log("Seeding fresh data for Pamplona...");
    const insertUser = db.prepare("INSERT INTO users (name, email, password_hash, photo_url, university, bio, is_verified, compatibility_form) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const hashedPassword = bcrypt.hashSync("password123", 10);
    
    const usersData = [
      ["Fabian Garcia", "fabian@example.com", hashedPassword, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop", "Universidad de Pamplona", "Estudiante de ingeniería, busco roomie tranquilo y responsable.", 1, JSON.stringify({ schedule: "morning", noise: "low", pets: "no", smoking: "no", study: "quiet" })],
      ["Diana Prince", "diana@unipamplona.edu.co", hashedPassword, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", "Universidad de Pamplona", "Estudiante de arquitectura, muy organizada y amante del café.", 1, JSON.stringify({ schedule: "morning", noise: "low", pets: "no", smoking: "no", study: "quiet" })],
      ["Carlos Mendoza", "carlos@gmail.com", hashedPassword, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", "Universidad de Pamplona", "Busco compartir gastos en un lugar cerca al campus. Soy muy sociable.", 0, JSON.stringify({ schedule: "night", noise: "medium", pets: "yes", smoking: "no", study: "social" })],
      ["Valentina Rojas", "valentina@outlook.com", hashedPassword, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", "Universidad de Pamplona", "Estudiante de medicina, paso poco tiempo en casa por las rotaciones.", 1, JSON.stringify({ schedule: "morning", noise: "low", pets: "no", smoking: "no", study: "quiet" })],
      ["Mateo Jimenez", "mateo@yahoo.com", hashedPassword, "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop", "Universidad de Pamplona", "Me gusta cocinar y el buen ambiente. Busco roomie buena onda.", 1, JSON.stringify({ schedule: "flexible", noise: "medium", pets: "yes", smoking: "no", study: "social" })],
      ["Isabella Castro", "isabella@gmail.com", hashedPassword, "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop", "Universidad de Pamplona", "Busco un lugar tranquilo para terminar mi tesis de derecho.", 1, JSON.stringify({ schedule: "morning", noise: "low", pets: "no", smoking: "no", study: "quiet" })],
      ["Santiago Ortiz", "santiago@unipamplona.edu.co", hashedPassword, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop", "Universidad de Pamplona", "Deportista, busco roomie con hábitos saludables y ordenado.", 0, JSON.stringify({ schedule: "morning", noise: "low", pets: "no", smoking: "no", study: "quiet" })],
      ["Camila Duarte", "camila@gmail.com", hashedPassword, "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop", "Universidad de Pamplona", "Estudiante de artes, busco un espacio creativo y relajado.", 1, JSON.stringify({ schedule: "night", noise: "medium", pets: "yes", smoking: "yes", study: "social" })],
      ["Sebastian Peña", "sebas@gmail.com", hashedPassword, "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop", "Universidad de Pamplona", "Gamer y programador. Busco internet rápido y buena vibra.", 0, JSON.stringify({ schedule: "night", noise: "medium", pets: "no", smoking: "no", study: "quiet" })],
      ["Mariana Lopez", "mariana@gmail.com", hashedPassword, "https://images.unsplash.com/photo-1488423191216-2fdc41e1b2d5?w=400&h=400&fit=crop", "Universidad de Pamplona", "Muy tranquila, me gusta leer y el silencio para estudiar.", 1, JSON.stringify({ schedule: "morning", noise: "low", pets: "no", smoking: "no", study: "quiet" })],
      ["Admin User", "admin@unipamplona.edu.co", hashedPassword, "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop", "Sistema", "Administrador de la Plataforma", 1, null]
    ];
    
    const userIds: number[] = [];
    usersData.forEach(u => {
      const result = insertUser.run(...u);
      userIds.push(Number(result.lastInsertRowid));
    });

    console.log("Seeding zones for Pamplona...");
    const insertZone = db.prepare("INSERT INTO zones (name, safety_level, description, geojson) VALUES (?, ?, ?, ?)");
    const zonesData = [
      ["Campus Principal & El Humilladero", "green", "Área universitaria con alta vigilancia. Incluye la Sede Principal de Unipamplona y zonas residenciales estudiantiles seguras.", JSON.stringify({ type: "Polygon", coordinates: [[[-72.6465, 7.3765], [-72.6430, 7.3760], [-72.6425, 7.3735], [-72.6450, 7.3730], [-72.6470, 7.3745], [-72.6465, 7.3765]]] })],
      ["Campus ISER & Chapinero", "green", "Zona norte de la ciudad, sede del ISER y barrios con gran afluencia de estudiantes y seguridad moderada-alta.", JSON.stringify({ type: "Polygon", coordinates: [[[-72.6540, 7.3810], [-72.6505, 7.3815], [-72.6495, 7.3785], [-72.6520, 7.3775], [-72.6545, 7.3790], [-72.6540, 7.3810]]] })],
      ["Centro Histórico & Comercio", "yellow", "Corazón comercial de Pamplona. Muy seguro de día, pero se recomienda precaución en la noche por calles solitarias.", JSON.stringify({ type: "Polygon", coordinates: [[[-72.6500, 7.3770], [-72.6470, 7.3775], [-72.6460, 7.3745], [-72.6485, 7.3735], [-72.6505, 7.3750], [-72.6500, 7.3770]]] })],
      ["Salida a Cúcuta (Simón Bolívar)", "red", "Sector periférico con menor iluminación. Se han reportado incidentes nocturnos; evitar transitar solo después de las 9 PM.", JSON.stringify({ type: "Polygon", coordinates: [[[-72.6440, 7.3825], [-72.6405, 7.3830], [-72.6395, 7.3795], [-72.6420, 7.3785], [-72.6445, 7.3805], [-72.6440, 7.3825]]] })]
    ];
    
    const zoneIds: number[] = [];
    zonesData.forEach(z => {
      const result = insertZone.run(...z);
      zoneIds.push(Number(result.lastInsertRowid));
    });
    console.log("Seeding listings with verified images...");
    const insertListing = db.prepare("INSERT INTO listings (user_id, title, description, address, price, available_from, max_occupants, photos, rules, zone_id, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    // Full Unsplash hashes for reliable loading
    const interiorHashes = [
      "1560448204-603b3fc33ddc", "1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688", 
      "1484154218962-a197022b5858", "1540518614846-7eded433c457", "1505691938895-1758d7eaa511", 
      "1616594831707-3c773d328f44", "1595526114035-0d45ed16cfbf", "1512917774080-9991f1c4c750",
      "1554995207-c18c203602cb", "1493809842364-78817add7ffb", "1560185127-6ed189bf02f4",
      "1513694203232-719a280e022f", "1486304873000-235643847519", "1494438639946-1ebd1d20bf85",
      "1519710164239-da123dc03ef4", "1586023492125-27b2c045efd7", "1507089947368-19c1da9775ae"
    ];

    const getImg = (idx: number) => `https://images.unsplash.com/photo-${interiorHashes[idx % interiorHashes.length]}?auto=format&fit=crop&w=800&q=80`;

    const listings = [
      [userIds[1], "Habitación amplia cerca a la Unipamplona", "Habitación con baño privado y todos los servicios incluidos. Ambiente familiar.", "Calle 5 #4-20", 450000, "2026-04-01", 1, JSON.stringify([getImg(0)]), "No fumar, no mascotas", zoneIds[0], 7.3755, -72.6455],
      [userIds[2], "Apartamento compartido en El Humilladero", "Busco roomie para compartir apartamento de 2 habitaciones. Muy central.", "Carrera 6 #3-15", 350000, "2026-05-01", 2, JSON.stringify([getImg(1)]), "Se permiten visitas", zoneIds[1], 7.3795, -72.6515],
      [userIds[3], "Habitación económica para estudiante", "Cerca a la sede del Rosario. Incluye servicios básicos.", "Calle 2 #8-10", 280000, "2026-04-15", 1, JSON.stringify([getImg(2)]), "Horas de silencio después de las 10PM", zoneIds[0], 7.3745, -72.6440],
      [userIds[4], "Penthouse compartido con vista increíble", "Lugar moderno, buscamos a alguien responsable. Zona segura.", "Calle 5 #4-22", 600000, "2026-04-01", 2, JSON.stringify([getImg(3)]), "No fiestas", zoneIds[3], 7.3815, -72.6425],
      [userIds[5], "Habitación iluminada en Santa Marta", "Excelente ubicación, cerca a supermercados y transporte.", "Carrera 10 #1-05", 320000, "2026-06-01", 2, JSON.stringify([getImg(4)]), "No fumar", zoneIds[0], 7.3735, -72.6460],
      [userIds[6], "Estudio compartido cerca al parque principal", "Ideal para personas que trabajen o estudien. Ambiente tranquilo.", "Calle 8 #2-30", 400000, "2026-04-01", 1, JSON.stringify([getImg(5)]), "Mascotas bienvenidas", zoneIds[1], 7.3785, -72.6535],
      [userIds[7], "Habitación amoblada en La Salle", "Cama doble, closet y escritorio incluidos. Muy acogedor.", "Carrera 4 #12-05", 380000, "2026-05-15", 3, JSON.stringify([getImg(6)]), "Todo incluido", zoneIds[2], 7.3760, -72.6485],
      [userIds[0], "Apartamento moderno cerca a la Unipamplona", "Busco compañero para apartamento nuevo. Excelentes acabados.", "Calle 2 #8-12", 550000, "2026-04-01", 1, JSON.stringify([getImg(7)]), "No fumar", zoneIds[0], 7.3750, -72.6435],
      [userIds[8], "Habitación para gamer/estudiante", "Habitación con escritorio grande y buena conexión.", "Calle 10 #5-40", 300000, "2026-04-10", 1, JSON.stringify([getImg(8)]), "Respeto por el ruido", zoneIds[1], 7.3790, -72.6525],
      [userIds[9], "Espacio tranquilo cerca a biblioteca", "Habitación silenciosa, ideal para estudio intenso.", "Carrera 7 #4-12", 330000, "2026-04-05", 1, JSON.stringify([getImg(9)]), "Silencio absoluto", zoneIds[0], 7.3740, -72.6450],
      [userIds[1], "Habitación secundaria en El Humilladero", "Pequeña pero acogedora, servicios incluidos.", "Calle 4 #6-18", 250000, "2026-04-20", 1, JSON.stringify([getImg(10)]), "No visitas nocturnas", zoneIds[1], 7.3780, -72.6510],
      [userIds[2], "Cama en habitación compartida", "Opción muy económica para estudiantes.", "Carrera 5 #8-30", 180000, "2026-04-01", 2, JSON.stringify([getImg(11)]), "Orden extremo", zoneIds[2], 7.3755, -72.6495],
      [userIds[3], "Habitación master con tina", "Para quien busca comodidad total.", "Calle 12 #2-45", 700000, "2026-05-01", 1, JSON.stringify([getImg(12)]), "No mascotas", zoneIds[3], 7.3820, -72.6415],
      [userIds[4], "Habitación cerca a zona de comidas", "Muy conveniente para quienes no cocinan.", "Carrera 9 #3-22", 340000, "2026-04-15", 1, JSON.stringify([getImg(13)]), "No fumar en cuarto", zoneIds[0], 7.3748, -72.6465],
      [userIds[5], "Cuarto amoblado estilo vintage", "Decoración única, ambiente muy agradable.", "Calle 6 #5-10", 420000, "2026-04-01", 1, JSON.stringify([getImg(14)]), "Cuidar muebles", zoneIds[1], 7.3792, -72.6530],
      [userIds[6], "Habitación para postgrado", "Silencio garantizado, cerca a facultades.", "Carrera 4 #8-20", 360000, "2026-04-15", 1, JSON.stringify([getImg(15)]), "No ruidos fuertes", zoneIds[2], 7.3765, -72.6475],
      [userIds[7], "Apartamento compartido - El Rosario", "Busco roomie para compartir gastos. Muy central.", "Calle 3 #7-15", 310000, "2026-04-01", 2, JSON.stringify([getImg(16)]), "Limpieza semanal", zoneIds[0], 7.3752, -72.6445],
      [userIds[8], "Habitación con vista al parque", "Lugar muy tranquilo y seguro.", "Carrera 6 #2-10", 390000, "2026-05-01", 1, JSON.stringify([getImg(17)]), "No fumar", zoneIds[1], 7.3788, -72.6520],
      [userIds[9], "Estudio pequeño pero funcional", "Ideal para una persona, servicios incluidos.", "Calle 5 #9-30", 270000, "2026-04-01", 1, JSON.stringify([getImg(0)]), "No mascotas", zoneIds[0], 7.3742, -72.6458],
      [userIds[0], "Habitación de lujo en zona norte", "Acabados de primera, baño privado.", "Carrera 12 #4-50", 650000, "2026-04-01", 1, JSON.stringify([getImg(1)]), "No fiestas", zoneIds[3], 7.3825, -72.6430]
    ];
    
    const listingIds: number[] = [];
    listings.forEach(l => {
      const result = insertListing.run(...l);
      listingIds.push(Number(result.lastInsertRowid));
    });

    console.log("Seeding ratings...");
    const insertRating = db.prepare("INSERT INTO ratings (listing_id, user_id, stars, comment) VALUES (?, ?, ?, ?)");
    const comments = [
      "Excelente lugar, muy tranquilo.",
      "El dueño es muy amable y servicial.",
      "Cerca de todo, muy conveniente.",
      "Un poco ruidoso por las mañanas, pero bien.",
      "La habitación es tal cual las fotos.",
      "Muy limpio y organizado.",
      "Me encantó la vista desde la ventana.",
      "El internet es súper rápido, ideal para estudiar.",
      "Ambiente muy agradable con los otros roomies.",
      "Recomendado 100%."
    ];

    listingIds.forEach(id => {
      // Add 2-3 random ratings per listing
      const numRatings = Math.floor(Math.random() * 2) + 2;
      const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());
      for (let i = 0; i < numRatings; i++) {
        const stars = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
        const comment = comments[Math.floor(Math.random() * comments.length)];
        try {
          insertRating.run(id, shuffledUsers[i], stars, comment);
        } catch (e) {
          // Skip if user already rated (unique constraint)
        }
      }
    });

    console.log("Data seeded successfully.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
// Check if reset flag is passed in command line
const shouldReset = process.argv.includes('--reset');
seedData(shouldReset);

// Extra images repository (used to fill missing photos for listings)
const EXTRA_PHOTO_HASHES = [
  "1560448204-603b3fc33ddc", "1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688",
  "1484154218962-a197022b5858", "1540518614846-7eded433c457", "1505691938895-1758d7eaa511",
  "1616594831707-3c773d328f44", "1595526114035-0d45ed16cfbf", "1512917774080-9991f1c4c750",
  "1554995207-c18c203602cb", "1493809842364-78817add7ffb", "1560185127-6ed189bf02f4",
  "1513694203232-719a280e022f", "1486304873000-235643847519", "1494438639946-1ebd1d20bf85",
  "1519710164239-da123dc03ef4", "1586023492125-27b2c045efd7", "1507089947368-19c1da9775ae"
];

const getExtraImg = (idx: number) => `https://images.unsplash.com/photo-${EXTRA_PHOTO_HASHES[idx % EXTRA_PHOTO_HASHES.length]}?auto=format&fit=crop&w=1200&q=80`;

// Ensure each listing has at least N photos. Updates DB in-place.
function ensureListingPhotos(minPhotos = 4) {
  try {
    const rows: any[] = db.prepare("SELECT id, photos FROM listings").all();
    const update = db.prepare("UPDATE listings SET photos = ? WHERE id = ?");
    rows.forEach((r, i) => {
      let photos: string[] = [];
      try {
        photos = JSON.parse(r.photos || '[]');
      } catch (e) {
        photos = [];
      }
      if (!Array.isArray(photos)) photos = [];
      const originalLength = photos.length;
      let addIndex = i;
      while (photos.length < minPhotos) {
        photos.push(getExtraImg(addIndex));
        addIndex++;
      }
      if (photos.length !== originalLength) {
        update.run(JSON.stringify(photos), r.id);
        console.log(`Patched listing ${r.id}: photos ${originalLength} -> ${photos.length}`);
      }
    });
  } catch (err) {
    console.error('Error ensuring listing photos:', err);
  }
}

// Run photo fill pass on startup so existing DB entries get additional images.
ensureListingPhotos(4);

// If the repository owner provided a curated list of image URLs, use them
// to assign unique images to listings to avoid broken or repeated photos.
const CURATED_IMAGES: string[] = [
  // PEXELS - Sala / Estudio
  "https://images.pexels.com/photos/6934189/pexels-photo-6934189.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7060814/pexels-photo-7060814.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6447384/pexels-photo-6447384.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/4993081/pexels-photo-4993081.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5570222/pexels-photo-5570222.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6588599/pexels-photo-6588599.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/2227832/pexels-photo-2227832.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/813692/pexels-photo-813692.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6438748/pexels-photo-6438748.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7534273/pexels-photo-7534273.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/3952034/pexels-photo-3952034.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/4468806/pexels-photo-4468806.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/4846097/pexels-photo-4846097.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5490369/pexels-photo-5490369.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6316065/pexels-photo-6316065.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6933852/pexels-photo-6933852.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5825527/pexels-photo-5825527.jpeg?auto=compress&cs=tinysrgb&w=1200",
  // PEXELS - Cocina
  "https://images.pexels.com/photos/7535076/pexels-photo-7535076.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7031213/pexels-photo-7031213.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6487939/pexels-photo-6487939.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/4992465/pexels-photo-4992465.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/27390284/pexels-photo-27390284.jpeg?auto=compress&cs=tinysrgb&w=1200",
  // PEXELS - Dormitorio
  "https://images.pexels.com/photos/6636262/pexels-photo-6636262.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6492402/pexels-photo-6492402.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7045996/pexels-photo-7045996.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5998039/pexels-photo-5998039.jpeg?auto=compress&cs=tinysrgb&w=1200",
  // PEXELS - Baños
  "https://images.pexels.com/photos/6585741/pexels-photo-6585741.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6621052/pexels-photo-6621052.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7511696/pexels-photo-7511696.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6207947/pexels-photo-6207947.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7005268/pexels-photo-7005268.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6636300/pexels-photo-6636300.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7045358/pexels-photo-7045358.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6957087/pexels-photo-6957087.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6487949/pexels-photo-6487949.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

function ensureListingPhotosFromCurated(urls: string[], minPhotos = 4) {
  try {
    const rows: any[] = db.prepare("SELECT id FROM listings ORDER BY id").all();
    const update = db.prepare("UPDATE listings SET photos = ? WHERE id = ?");
    if (!urls || urls.length === 0) return;

    // Shuffle a pool of URLs and consume them; when exhausted, reshuffle the full list
    const shuffle = (arr: string[]) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    let pool = shuffle(urls);
    let poolIndex = 0;

    rows.forEach((r) => {
      const photos: string[] = [];
      const used = new Set();
      while (photos.length < minPhotos) {
        if (poolIndex >= pool.length) {
          pool = shuffle(urls);
          poolIndex = 0;
        }
        const candidate = pool[poolIndex++];
        if (!used.has(candidate)) {
          photos.push(candidate);
          used.add(candidate);
        }
      }
      update.run(JSON.stringify(photos), r.id);
      console.log(`Assigned curated photos to listing ${r.id}`);
    });
  } catch (err) {
    console.error('Error assigning curated photos:', err);
  }
}

// Prefer curated images to avoid broken links and minimize repetitions.
ensureListingPhotosFromCurated(CURATED_IMAGES, 4);

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === "production";

  try {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Servir uploads desde el volumen persistente
    app.use("/uploads", express.static(UPLOADS_DIR));

    const encodeImageProxy = (url: string) => {
      if (url.startsWith("/uploads/")) return url;
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    };

    const proxyPhotoList = (photos: any) => {
      if (!Array.isArray(photos)) return [];
      return photos
        .filter((photo) => typeof photo === 'string' && photo.length > 0)
        .map((photo) => encodeImageProxy(photo));
    };

    app.get('/api/image-proxy', async (req, res) => {
      const url = typeof req.query.url === 'string' ? req.query.url : '';
      if (!url) {
        return res.status(400).send('Missing url');
      }

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (RoomieMatch)',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          },
        });

        if (!response.ok || !response.body) {
          throw new Error(`Upstream responded ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');

        const buffer = Buffer.from(await response.arrayBuffer());
        return res.status(200).send(buffer);
      } catch (error) {
        console.error('Image proxy failed:', url, error);
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
            <defs>
              <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stop-color="#f9f7f1"/>
                <stop offset="100%" stop-color="#e3e0d8"/>
              </linearGradient>
            </defs>
            <rect width="1200" height="900" fill="url(#g)"/>
            <rect x="180" y="160" width="840" height="580" rx="28" fill="#ffffff" stroke="#1d3557" stroke-width="10" opacity="0.95"/>
            <rect x="250" y="240" width="280" height="180" rx="18" fill="#d9d7d0"/>
            <rect x="560" y="240" width="340" height="90" rx="18" fill="#c7d7e8"/>
            <rect x="560" y="350" width="340" height="70" rx="18" fill="#f2ede4"/>
            <rect x="250" y="460" width="650" height="140" rx="20" fill="#f2ede4"/>
            <text x="600" y="705" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="#1d3557">Imagen no disponible</text>
            <text x="600" y="760" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#8d8c8a">RoomieMatch</text>
          </svg>`;
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.status(200).send(svg.trim());
      }
    });

    // Auth Middleware
    const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
    
      if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
      }
    
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
        req.user = decoded;
        next();
      } catch (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }
    };

  // --- DEBUG ROUTES ---
  app.get("/api/debug/db", authenticateToken, (req: AuthRequest, res: Response) => {
    // Verificar que sea admin
    if (req.user!.email !== 'admin@unipamplona.edu.co') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const users = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const listings = db.prepare('SELECT COUNT(*) as count FROM listings').get() as any;
    const zones = db.prepare('SELECT COUNT(*) as count FROM zones').get() as any;
    
    res.json({
      users: users.count,
      listings: listings.count,
      zones: zones.count,
      timestamp: new Date().toISOString()
    });
  });

  // ── Image Upload (Temp for Registration) ──
  app.post("/api/upload/temp", (req: Request, res: Response) => {
    upload.single("image")(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "La imagen supera los 5MB" });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No se recibió ninguna imagen" });
      }
      const url = `/uploads/${req.file.filename}`;
      res.json({ url, size: req.file.size });
    });
  });

  // ── Image Upload ──
  app.post("/api/upload", authenticateToken, (req: AuthRequest, res: Response) => {
    upload.single("image")(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "La imagen supera los 5MB" });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No se recibió ninguna imagen" });
      }
      
      const url = `/uploads/${req.file.filename}`;
      res.json({ url, size: req.file.size });
    });
  });

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/register", (req: AuthRequest, res: Response) => {
    const { name, email, password, university, photo_url } = req.body;
    
    // Restrict email domain
    if (!email.endsWith("@unipamplona.edu.co")) {
      return res.status(400).json({ error: "Solo se permiten correos @unipamplona.edu.co" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      const result = db.prepare("INSERT INTO users (name, email, password_hash, university, photo_url) VALUES (?, ?, ?, ?, ?)").run(name, email, hashedPassword, university, photo_url);
      const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, name, email, university, photo_url } });
    } catch (e) {
      res.status(400).json({ error: "El correo ya está registrado" });
    }
  });

  app.post("/api/auth/login", (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user && bcrypt.compareSync(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, university: user.university, photo_url: user.photo_url, is_verified: user.is_verified } });
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  });

  // Profiles
  app.get("/api/profiles/me", authenticateToken, (req: AuthRequest, res: Response) => {
    const user = db.prepare("SELECT id, name, email, photo_url, university, bio, is_verified, compatibility_form FROM users WHERE id = ?").get(req.user!.id);
    if (!user) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(user);
  });

  app.put("/api/profiles/me", authenticateToken, (req: AuthRequest, res: Response) => {
    const { name, photo_url, university, bio, compatibility_form } = req.body;
    db.prepare("UPDATE users SET name = ?, photo_url = ?, university = ?, bio = ?, compatibility_form = ? WHERE id = ?")
      .run(name, photo_url, university, bio, JSON.stringify(compatibility_form), req.user!.id);
    res.json({ success: true });
  });

  app.get("/api/profiles/:id", (req: AuthRequest, res: Response) => {
    const user = db.prepare("SELECT id, name, photo_url, university, bio, is_verified, compatibility_form FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  });

  // Listings
  app.get("/api/listings", (req: AuthRequest, res: Response) => {
    try {
      const { minPrice, maxPrice, zoneId, date } = req.query;
      let query = `
        SELECT l.*, z.name as zone_name, z.safety_level, 
               (SELECT AVG(stars) FROM ratings WHERE listing_id = l.id) as avg_rating
        FROM listings l
        JOIN zones z ON l.zone_id = z.id
        WHERE 1=1
      `;
      const params = [];
      if (minPrice && minPrice !== '') { query += " AND l.price >= ?"; params.push(minPrice); }
      if (maxPrice && maxPrice !== '') { query += " AND l.price <= ?"; params.push(maxPrice); }
      if (zoneId && zoneId !== '') { query += " AND l.zone_id = ?"; params.push(zoneId); }
      if (date && date !== '') { query += " AND l.available_from <= ?"; params.push(date); }
      
      query += " ORDER BY l.created_at DESC LIMIT 50";
      const listings = db.prepare(query).all(...params);
      
      res.json(listings.map((l: any) => {
        let photos = [];
        try {
          photos = JSON.parse(l.photos || "[]");
        } catch (e) {
          console.error("Error parsing photos for listing", l.id);
        }
        return { ...l, photos: proxyPhotoList(photos) };
      }));
    } catch (error) {
      console.error("Error in GET /api/listings:", error);
      res.status(500).json({ error: "Error al obtener publicaciones" });
    }
  });

  app.get("/api/listings/:id", (req: AuthRequest, res: Response) => {
    try {
      const listing = db.prepare(`
        SELECT l.*, z.name as zone_name, z.safety_level, u.name as owner_name, u.photo_url as owner_photo
        FROM listings l
        JOIN zones z ON l.zone_id = z.id
        JOIN users u ON l.user_id = u.id
        WHERE l.id = ?
      `).get(req.params.id) as any;
      
      if (!listing) return res.status(404).json({ error: "Publicación no encontrada" });
      
      const ratings = db.prepare(`
        SELECT r.*, u.name as user_name, u.photo_url as user_photo
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.listing_id = ?
        ORDER BY r.created_at DESC
      `).all(req.params.id);
      
      let photos = [];
      try {
        photos = JSON.parse(listing.photos || "[]");
      } catch (e) {
        console.error("Error parsing photos for listing", listing.id);
      }
      
      res.json({ ...listing, photos: proxyPhotoList(photos), ratings });
    } catch (error) {
      console.error("Error in GET /api/listings/:id:", error);
      res.status(500).json({ error: "Error al obtener el detalle" });
    }
  });

  app.post("/api/listings", authenticateToken, (req: AuthRequest, res: Response) => {
    const { title, description, address, price, available_from, max_occupants, photos, rules, zone_id, lat, lng } = req.body;

    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedDescription = typeof description === "string" ? description.trim() : "";
    const normalizedAddress = typeof address === "string" ? address.trim() : "";
    const normalizedRules = typeof rules === "string" ? rules.trim() : "";
    const numericPrice = Number(price);
    const numericOccupants = Number(max_occupants);
    const numericZoneId = Number(zone_id);
    const numericLat = Number(lat);
    const numericLng = Number(lng);
    const parsedDate = typeof available_from === "string" ? new Date(`${available_from}T00:00:00`) : new Date("invalid");
    const normalizedPhotos = Array.isArray(photos)
      ? photos.map((photo: unknown) => typeof photo === "string" ? photo.trim() : "").filter((photo: string) => photo.length > 0)
      : [];

    if (!normalizedTitle) return res.status(400).json({ error: "El título es obligatorio" });
    if (!normalizedDescription) return res.status(400).json({ error: "La descripción es obligatoria" });
    if (!normalizedAddress) return res.status(400).json({ error: "La dirección es obligatoria" });
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return res.status(400).json({ error: "El precio debe ser un número mayor a 0" });
    if (!Number.isInteger(numericOccupants) || numericOccupants < 1) return res.status(400).json({ error: "Los ocupantes máximos deben ser al menos 1" });
    if (!available_from || Number.isNaN(parsedDate.getTime())) return res.status(400).json({ error: "La fecha disponible no es válida" });
    if (!Number.isInteger(numericZoneId)) return res.status(400).json({ error: "La zona es obligatoria" });
    if (!db.prepare("SELECT id FROM zones WHERE id = ?").get(numericZoneId)) return res.status(400).json({ error: "La zona seleccionada no existe" });
    if (!Number.isFinite(numericLat) || !Number.isFinite(numericLng)) return res.status(400).json({ error: "La ubicación en el mapa no es válida" });
    if (normalizedPhotos.some((photo: string) => !/^https?:\/\//i.test(photo) && !photo.startsWith("/uploads/") && !photo.startsWith("/api/image-proxy?url=") && !photo.startsWith("data:image/"))) {
      return res.status(400).json({ error: "Las fotos deben ser URLs válidas" });
    }

    const result = db.prepare(`
      INSERT INTO listings (user_id, title, description, address, price, available_from, max_occupants, photos, rules, zone_id, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user!.id,
      normalizedTitle,
      normalizedDescription,
      normalizedAddress,
      numericPrice,
      available_from,
      numericOccupants,
      JSON.stringify(normalizedPhotos),
      normalizedRules,
      numericZoneId,
      numericLat,
      numericLng
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/listings/:id", authenticateToken, (req: AuthRequest, res: Response) => {
    const listing = db.prepare("SELECT user_id FROM listings WHERE id = ?").get(req.params.id) as any;
    if (!listing) return res.status(404).json({ error: "Publicación no encontrada" });
    
    // Admin check or owner check
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.user!.id) as any;
    if (listing.user_id !== req.user!.id && user.email !== 'admin@unipamplona.edu.co') {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    db.prepare("DELETE FROM listings WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Ratings
  app.post("/api/listings/:id/rate", authenticateToken, (req: AuthRequest, res: Response) => {
    const { stars, comment } = req.body;
    const numericStars = Number(stars);
    const normalizedComment = typeof comment === "string" ? comment.trim() : "";

    if (!Number.isInteger(numericStars) || numericStars < 1 || numericStars > 5) {
      return res.status(400).json({ error: "Las estrellas deben estar entre 1 y 5" });
    }
    if (!normalizedComment) {
      return res.status(400).json({ error: "El comentario es obligatorio" });
    }

    try {
      db.prepare("INSERT INTO ratings (listing_id, user_id, stars, comment) VALUES (?, ?, ?, ?)")
        .run(req.params.id, req.user!.id, numericStars, normalizedComment);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Ya has calificado esta publicación" });
    }
  });

  // Zones
  app.get("/api/zones", (req: AuthRequest, res: Response) => {
    try {
      const zones = db.prepare("SELECT * FROM zones").all();
      console.log(`Returning ${zones.length} zones from DB`);
      res.json(zones.map((z: any) => {
        let geojson = {};
        try {
          geojson = JSON.parse(z.geojson);
        } catch (e) {
          console.error("Error parsing geojson for zone", z.id);
        }
        return { ...z, geojson };
      }));
    } catch (e) {
      console.error("Error fetching zones:", e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Matching
  app.get("/api/matching", authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const currentUser = db.prepare("SELECT compatibility_form FROM users WHERE id = ?").get(req.user!.id) as any;
      if (!currentUser) return res.status(404).json({ error: "Usuario no encontrado" });
      if (!currentUser.compatibility_form) return res.status(400).json({ error: "Primero completa tu formulario" });
      
      const myForm = JSON.parse(currentUser.compatibility_form);
      const others = db.prepare("SELECT id, name, photo_url, university, compatibility_form FROM users WHERE id != ? AND compatibility_form IS NOT NULL").all(req.user!.id);
      
      const scored = others.map((other: any) => {
        try {
          const otherForm = JSON.parse(other.compatibility_form);
          let matches = 0;
          const keys = ['schedule', 'noise', 'pets', 'smoking', 'study'];
          keys.forEach(k => {
            if (myForm[k] === otherForm[k]) matches++;
          });
          const score = Math.round((matches / keys.length) * 100);
          return { ...other, score };
        } catch (e) {
          return null;
        }
      }).filter(Boolean).sort((a: any, b: any) => b.score - a.score);
      
      res.json(scored);
    } catch (e) {
      console.error("Error in matching:", e);
      res.status(500).json({ error: "Error interno en el matching" });
    }
  });

  // Admin
  app.get("/api/admin/users", authenticateToken, (req: AuthRequest, res: Response) => {
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.user!.id) as any;
    if (!user || user.email !== 'admin@unipamplona.edu.co') return res.status(403).json({ error: "No autorizado" });
    const users = db.prepare("SELECT id, name, email, is_verified FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/verify/:id", authenticateToken, (req: AuthRequest, res: Response) => {
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.user!.id) as any;
    if (!user || user.email !== 'admin@unipamplona.edu.co') return res.status(403).json({ error: "No autorizado" });
    const { is_verified } = req.body;
    db.prepare("UPDATE users SET is_verified = ? WHERE id = ?").run(is_verified ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (!isProd) {
    // Desarrollo: Iniciar Vite dinámicamente
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Producción: Servir estáticos de Vite desde dist/client
    const clientPath = path.join(__dirname, "../client");
    app.use(express.static(clientPath));
    
    // Manejo de SPA: Cualquier ruta que no sea /api devuelve index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientPath, "index.html"));
    });
  }

  // ── Orphan Uploads Cleanup ──
  setInterval(async () => {
    try {
      const files = fs.readdirSync(UPLOADS_DIR);
      const usedPhotos = db.prepare("SELECT photos FROM listings").all() as any[];
      const usedUrls = new Set<string>();
      usedPhotos.forEach(row => {
        try {
          JSON.parse(row.photos).forEach((p: string) => usedUrls.add(p));
        } catch {}
      });
      const usedProfiles = db.prepare("SELECT photo_url FROM users WHERE photo_url LIKE '/uploads/%'").all() as any[];
      usedProfiles.forEach(row => usedUrls.add(row.photo_url));

      let deleted = 0;
      for (const file of files) {
        const url = `/uploads/${file}`;
        if (!usedUrls.has(url)) {
          const filePath = path.join(UPLOADS_DIR, file);
          const stat = fs.statSync(filePath);
          // Solo borrar si tiene más de 1 hora (evita borrar subidas en progreso)
          if (Date.now() - stat.mtimeMs > 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
            deleted++;
          }
        }
      }
      if (deleted > 0) console.log(`[Cleanup] Removed ${deleted} orphan uploads`);
    } catch (e) {
      console.error('[Cleanup] Error:', e);
    }
  }, 60 * 60 * 1000); // Cada hora

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${isProd ? "production" : "development"} mode`);
  });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}
}

startServer();
