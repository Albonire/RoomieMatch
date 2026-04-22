import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("roomiematch.db");
const JWT_SECRET = process.env.JWT_SECRET || "roomie-secret-key-123";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
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

// Seed Data Helper (only if empty)
const seedData = () => {
  try {
    const userCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;
    if (userCount > 0) {
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
      ["Admin User", "admin@unipamplona.edu.co", bcrypt.hashSync("admin123", 10), "icon:user", "Sistema", "Administrador de la Plataforma", 1, null]
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

    console.log("Seeding listings...");
    const insertListing = db.prepare("INSERT INTO listings (user_id, title, description, address, price, available_from, max_occupants, photos, rules, zone_id, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const listings = [
      [userIds[1], "Habitación amplia cerca a la Unipamplona", "Habitación con baño privado y todos los servicios incluidos. Ambiente familiar.", "Calle 5 #4-20", 450000, "2026-04-01", 1, JSON.stringify(["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop"]), "No fumar, no mascotas", zoneIds[0], 7.3755, -72.6455],
      [userIds[2], "Apartamento compartido en El Humilladero", "Busco roomie para compartir apartamento de 2 habitaciones. Muy central.", "Carrera 6 #3-15", 350000, "2026-05-01", 2, JSON.stringify(["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"]), "Se permiten visitas", zoneIds[1], 7.3795, -72.6515],
      [userIds[3], "Habitación económica para estudiante", "Cerca a la sede del Rosario. Incluye servicios básicos.", "Calle 2 #8-10", 280000, "2026-04-15", 1, JSON.stringify(["https://images.unsplash.com/photo-1486304873000-235643847519?w=800&h=600&fit=crop"]), "Horas de silencio después de las 10PM", zoneIds[0], 7.3745, -72.6440],
      [userIds[4], "Penthouse compartido con vista increíble", "Lugar moderno, buscamos a alguien responsable. Zona segura.", "Calle 5 #4-22", 600000, "2026-04-01", 2, JSON.stringify(["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"]), "No fiestas", zoneIds[3], 7.3815, -72.6425],
      [userIds[5], "Habitación iluminada en Santa Marta", "Excelente ubicación, cerca a supermercados y transporte.", "Carrera 10 #1-05", 320000, "2026-06-01", 2, JSON.stringify(["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop"]), "No fumar", zoneIds[0], 7.3735, -72.6460],
      [userIds[6], "Estudio compartido cerca al parque principal", "Ideal para personas que trabajen o estudien. Ambiente tranquilo.", "Calle 8 #2-30", 400000, "2026-04-01", 1, JSON.stringify(["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"]), "Mascotas bienvenidas", zoneIds[1], 7.3785, -72.6535],
      [userIds[7], "Habitación amoblada en La Salle", "Cama doble, closet y escritorio incluidos. Muy acogedor.", "Carrera 4 #12-05", 380000, "2026-05-15", 3, JSON.stringify(["https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=800&h=600&fit=crop"]), "Todo incluido", zoneIds[2], 7.3760, -72.6485],
      [userIds[0], "Apartamento moderno cerca a la Unipamplona", "Busco compañero para apartamento nuevo. Excelentes acabados.", "Calle 2 #8-12", 550000, "2026-04-01", 1, JSON.stringify(["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"]), "No fumar", zoneIds[0], 7.3750, -72.6435],
      [userIds[8], "Habitación para gamer/estudiante", "Habitación con escritorio grande y buena conexión.", "Calle 10 #5-40", 300000, "2026-04-10", 1, JSON.stringify(["https://images.unsplash.com/photo-1598425237654-4fc758e50a93?w=800&h=600&fit=crop"]), "Respeto por el ruido", zoneIds[1], 7.3790, -72.6525],
      [userIds[9], "Espacio tranquilo cerca a biblioteca", "Habitación silenciosa, ideal para estudio intenso.", "Carrera 7 #4-12", 330000, "2026-04-05", 1, JSON.stringify(["https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=600&fit=crop"]), "Silencio absoluto", zoneIds[0], 7.3740, -72.6450],
      [userIds[1], "Habitación secundaria en El Humilladero", "Pequeña pero acogedora, servicios incluidos.", "Calle 4 #6-18", 250000, "2026-04-20", 1, JSON.stringify(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"]), "No visitas nocturnas", zoneIds[1], 7.3780, -72.6510],
      [userIds[2], "Cama en habitación compartida", "Opción muy económica para estudiantes.", "Carrera 5 #8-30", 180000, "2026-04-01", 2, JSON.stringify(["https://images.unsplash.com/photo-1555854816-802f1f76fcb1?w=800&h=600&fit=crop"]), "Orden extremo", zoneIds[2], 7.3755, -72.6495],
      [userIds[3], "Habitación master con tina", "Para quien busca comodidad total.", "Calle 12 #2-45", 700000, "2026-05-01", 1, JSON.stringify(["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop"]), "No mascotas", zoneIds[3], 7.3820, -72.6415],
      [userIds[4], "Habitación cerca a zona de comidas", "Muy conveniente para quienes no cocinan.", "Carrera 9 #3-22", 340000, "2026-04-15", 1, JSON.stringify(["https://images.unsplash.com/photo-1536376074432-a228d0a59cf4?w=800&h=600&fit=crop"]), "No fumar en cuarto", zoneIds[0], 7.3748, -72.6465],
      [userIds[5], "Cuarto amoblado estilo vintage", "Decoración única, ambiente muy agradable.", "Calle 6 #5-10", 420000, "2026-04-01", 1, JSON.stringify(["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop"]), "Cuidar muebles", zoneIds[1], 7.3792, -72.6530],
      [userIds[6], "Habitación para postgrado", "Silencio garantizado, cerca a facultades.", "Carrera 4 #8-20", 360000, "2026-04-15", 1, JSON.stringify(["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop"]), "No ruidos fuertes", zoneIds[2], 7.3765, -72.6475],
      [userIds[7], "Apartamento compartido - El Rosario", "Busco roomie para compartir gastos. Muy central.", "Calle 3 #7-15", 310000, "2026-04-01", 2, JSON.stringify(["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"]), "Limpieza semanal", zoneIds[0], 7.3752, -72.6445],
      [userIds[8], "Habitación con vista al parque", "Lugar muy tranquilo y seguro.", "Carrera 6 #2-10", 390000, "2026-05-01", 1, JSON.stringify(["https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=800&h=600&fit=crop"]), "No fumar", zoneIds[1], 7.3788, -72.6520],
      [userIds[9], "Estudio pequeño pero funcional", "Ideal para una persona, servicios incluidos.", "Calle 5 #9-30", 270000, "2026-04-01", 1, JSON.stringify(["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop"]), "No mascotas", zoneIds[0], 7.3742, -72.6458],
      [userIds[0], "Habitación de lujo en zona norte", "Acabados de primera, baño privado.", "Carrera 12 #4-50", 650000, "2026-04-01", 1, JSON.stringify(["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"]), "No fiestas", zoneIds[3], 7.3825, -72.6430]
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
seedData();

async function startServer() {
  try {
    const app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Auth Middleware
    const authenticateToken = (req: any, res: any, next: any) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: "Token faltante" });

      jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: "Token inválido o expirado" });
        req.user = user;
        next();
      });
    };

  // --- API ROUTES ---

  // Auth
  app.post("/api/auth/register", (req, res) => {
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

  app.post("/api/auth/login", (req, res) => {
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
  app.get("/api/profiles/me", authenticateToken, (req, res) => {
    const user = db.prepare("SELECT id, name, email, photo_url, university, bio, is_verified, compatibility_form FROM users WHERE id = ?").get(req.user.id);
    if (!user) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(user);
  });

  app.put("/api/profiles/me", authenticateToken, (req, res) => {
    const { name, photo_url, university, bio, compatibility_form } = req.body;
    db.prepare("UPDATE users SET name = ?, photo_url = ?, university = ?, bio = ?, compatibility_form = ? WHERE id = ?")
      .run(name, photo_url, university, bio, JSON.stringify(compatibility_form), req.user.id);
    res.json({ success: true });
  });

  app.get("/api/profiles/:id", (req, res) => {
    const user = db.prepare("SELECT id, name, photo_url, university, bio, is_verified, compatibility_form FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  });

  // Listings
  app.get("/api/listings", (req, res) => {
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
        return { ...l, photos };
      }));
    } catch (error) {
      console.error("Error in GET /api/listings:", error);
      res.status(500).json({ error: "Error al obtener publicaciones" });
    }
  });

  app.get("/api/listings/:id", (req, res) => {
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
      
      res.json({ ...listing, photos, ratings });
    } catch (error) {
      console.error("Error in GET /api/listings/:id:", error);
      res.status(500).json({ error: "Error al obtener el detalle" });
    }
  });

  app.post("/api/listings", authenticateToken, (req, res) => {
    const { title, description, address, price, available_from, max_occupants, photos, rules, zone_id, lat, lng } = req.body;
    const result = db.prepare(`
      INSERT INTO listings (user_id, title, description, address, price, available_from, max_occupants, photos, rules, zone_id, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, title, description, address, price, available_from, max_occupants, JSON.stringify(photos), rules, zone_id, lat, lng);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/listings/:id", authenticateToken, (req, res) => {
    const listing = db.prepare("SELECT user_id FROM listings WHERE id = ?").get(req.params.id) as any;
    if (!listing) return res.status(404).json({ error: "Publicación no encontrada" });
    
    // Admin check or owner check
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.user.id) as any;
    if (listing.user_id !== req.user.id && user.email !== 'admin@unipamplona.edu.co') {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    db.prepare("DELETE FROM listings WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Ratings
  app.post("/api/listings/:id/rate", authenticateToken, (req, res) => {
    const { stars, comment } = req.body;
    try {
      db.prepare("INSERT INTO ratings (listing_id, user_id, stars, comment) VALUES (?, ?, ?, ?)")
        .run(req.params.id, req.user.id, stars, comment);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Ya has calificado esta publicación" });
    }
  });

  // Zones
  app.get("/api/zones", (req, res) => {
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
  app.get("/api/matching", authenticateToken, (req, res) => {
    try {
      const currentUser = db.prepare("SELECT compatibility_form FROM users WHERE id = ?").get(req.user.id) as any;
      if (!currentUser) return res.status(404).json({ error: "Usuario no encontrado" });
      if (!currentUser.compatibility_form) return res.status(400).json({ error: "Primero completa tu formulario" });
      
      const myForm = JSON.parse(currentUser.compatibility_form);
      const others = db.prepare("SELECT id, name, photo_url, university, compatibility_form FROM users WHERE id != ? AND compatibility_form IS NOT NULL").all(req.user.id);
      
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
  app.get("/api/admin/users", authenticateToken, (req, res) => {
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.user.id) as any;
    if (!user || user.email !== 'admin@unipamplona.edu.co') return res.status(403).json({ error: "No autorizado" });
    const users = db.prepare("SELECT id, name, email, is_verified FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/verify/:id", authenticateToken, (req, res) => {
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.user.id) as any;
    if (!user || user.email !== 'admin@unipamplona.edu.co') return res.status(403).json({ error: "No autorizado" });
    const { is_verified } = req.body;
    db.prepare("UPDATE users SET is_verified = ? WHERE id = ?").run(is_verified ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}
}

startServer();
