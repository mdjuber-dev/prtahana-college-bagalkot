import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import crypto from "crypto";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const uploadRoot = path.join(rootDir, "server", "uploads");

const app = express();
const port = Number(process.env.PORT || 3000);
const dbQueryTimeoutMs = Number(process.env.DB_QUERY_TIMEOUT_MS || 12000);
const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_FRONTEND_URL,
  "https://prarthanapucollegebagalkot.in",
  "https://www.prarthanapucollegebagalkot.in",
  "https://prarthanaclgbgk.prarthanapusciencecollege-web.workers.dev",
].filter(Boolean);

const allowedOrigins = new Set([
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173", "http://127.0.0.1:5173"]),
  ...configuredOrigins,
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000),
  query_timeout: dbQueryTimeoutMs,
  statement_timeout: dbQueryTimeoutMs,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err?.message || err);
});

function isReadOnlyQuery(text) {
  return /^\s*(SELECT|WITH|SHOW)\b/i.test(String(text || ""));
}

function withTimeout(promise, timeoutMs, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`${label} timed out after ${timeoutMs}ms`);
      error.code = "QUERY_TIMEOUT";
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function queryWithRetry(text, params, options = {}) {
  const retries = options.retries ?? (isReadOnlyQuery(text) ? 1 : 0);
  try {
    return await withTimeout(pool.query(text, params), dbQueryTimeoutMs, "Database query");
  } catch (error) {
    const isConnErr =
      error?.code === "ECONNRESET" ||
      error?.code === "57P01" ||
      error?.code === "ETIMEDOUT" ||
      error?.code === "ENOTFOUND" ||
      error?.code === "QUERY_TIMEOUT" ||
      String(error?.message || "").includes("Connection terminated unexpectedly");
    if (isConnErr && retries > 0) {
      console.warn("Database query encountered transient connection error, retrying query once...", error.message);
      return await queryWithRetry(text, params, { retries: retries - 1 });
    }
    throw error;
  }
}

const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || "";
const sessionSecret = process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL || "local-session-secret";

function ok(res, data, extra = {}) {
  res.json({ success: true, data, ...extra });
}

function fail(res, status, error) {
  res.status(status).json({ success: false, error });
}

function handleError(res, label, error) {
  console.error(`${label}:`, error);
  const message = error?.message || (error?.code === "42P01" ? "Required table does not exist in database." : "Server error");
  fail(res, 500, message);
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token) {
  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) return null;
  const expected = crypto.createHmac("sha256", sessionSecret).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Date.now()) return null;
  return payload;
}

function getBearer(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function requireAdmin(req, res, next) {
  const payload = verifyToken(getBearer(req));
  if (!payload?.email) return fail(res, 401, "Admin session required");
  req.admin = payload;
  next();
}

function sanitizeDate(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (str === "" || str === "null" || str === "undefined") return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  return d.toISOString();
}

function sanitizeDateOnly(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (str === "" || str === "null" || str === "undefined") return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function sanitizeUuid(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (str === "" || str === "null" || str === "undefined") return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? str : null;
}

function pick(input, columns) {
  return Object.fromEntries(columns.filter((column) => input[column] !== undefined).map((column) => [column, input[column]]));
}

async function insertRow(table, payload, columns, returning = "*") {
  const row = pick(payload, columns);
  const keys = Object.keys(row);
  if (!keys.length) throw new Error("No valid fields supplied");
  const names = keys.map((key) => `"${key}"`).join(", ");
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
  const values = keys.map((key) => row[key]);
  return queryWithRetry(`INSERT INTO public.${table} (${names}) VALUES (${placeholders}) RETURNING ${returning}`, values);
}

async function updateBy(table, identifier, payload, columns, returning = "*") {
  const row = pick(payload, columns);
  const keys = Object.keys(row);
  if (!keys.length) throw new Error("No valid fields supplied");
  const sets = keys.map((key, index) => `"${key}" = $${index + 1}`).join(", ");
  const values = keys.map((key) => row[key]);
  values.push(identifier.value);
  return queryWithRetry(`UPDATE public.${table} SET ${sets} WHERE "${identifier.column}" = $${values.length} RETURNING ${returning}`, values);
}

async function tableExists(table) {
  const result = await queryWithRetry(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1) AS exists",
    [table],
  );
  return Boolean(result.rows[0]?.exists);
}

async function runHealthQuery() {
  const healthPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5000),
    query_timeout: dbQueryTimeoutMs,
    statement_timeout: dbQueryTimeoutMs,
    keepAlive: true,
    allowExitOnIdle: true,
  });

  try {
    return await withTimeout(healthPool.query("SELECT NOW()"), dbQueryTimeoutMs, "Health database query");
  } finally {
    await healthPool.end().catch(() => { });
  }
}

async function initMediaUploadsTable() {
  try {
    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS public.media_uploads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'misc',
        mime_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        data TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("Media uploads table ready in PostgreSQL.");
  } catch (err) {
    console.error("Failed to initialize media_uploads table:", err);
  }
}
initMediaUploadsTable();

async function initAnnouncementsTable() {
  try {
    await queryWithRetry(`
      CREATE TABLE IF NOT EXISTS public.announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        short_description TEXT,
        full_description TEXT,
        category TEXT NOT NULL DEFAULT 'General Announcement',
        event_date DATE,
        start_date DATE,
        end_date DATE,
        event_time TEXT,
        venue TEXT,
        image_url TEXT,
        attachment_url TEXT,
        cta_text TEXT,
        cta_url TEXT,
        status TEXT NOT NULL DEFAULT 'published',
        is_featured BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("Announcements table ready in PostgreSQL.");

    const countRes = await queryWithRetry("SELECT COUNT(*)::int AS count FROM public.announcements");
    if (countRes.rows[0]?.count === 0) {
      await queryWithRetry(`
        INSERT INTO public.announcements (title, short_description, full_description, category, event_date, venue, status, is_featured, priority, cta_text, cta_url, image_url)
        VALUES 
        (
          'Admissions Open for Academic Year 2026-27 (PCMB & PCMC)',
          'Prarthana PU Science College, Bagalkot invites applications for I & II PUC Science streams. Secure your seat today for expert coaching and top state results.',
          'Applications are invited for admission into I Year and II Year Pre-University Science courses (PCMB & PCMC). We offer specialized integrated coaching for NEET, JEE Main, KCET, and Board examinations with state-of-the-art laboratory facilities and dedicated faculty.',
          'Admission',
          CURRENT_DATE + INTERVAL '10 days',
          'College Campus, Bagalkot',
          'published',
          true,
          10,
          'Apply for Admission',
          '/admission',
          '/frontpagepamplet.jpeg'
        ),
        (
          'Annual Science Exhibition & Innovation Day 2026',
          'Join us at the Prarthana Science Campus for interactive project displays, robotics demonstrations, and guest lectures by renowned academicians.',
          'The Annual Science & Technology Exhibition showcase will feature over 100 innovative working models created by PCMB and PCMC students. Parents, alumni, and prospective students are cordially invited.',
          'Event',
          CURRENT_DATE + INTERVAL '15 days',
          'Prarthana College Main Auditorium, Bagalkot',
          'published',
          true,
          5,
          'View Event Details',
          '/announcements',
          '/campus-life-1.jpg'
        ),
        (
          'Pre-Board Examination Schedule Announced',
          'Timetable for upcoming PUC preparatory and pre-board mock examinations has been released for I & II PU Science students.',
          'Preparatory exams begin from the 1st of next month. Students are advised to collect their detailed hall tickets and subject-wise syllabus checklists from their respective batch coordinators.',
          'Exam',
          CURRENT_DATE + INTERVAL '20 days',
          'Examination Blocks A & B',
          'published',
          false,
          2,
          'Contact Admin Office',
          '/contact',
          '/library.jpg'
        );
      `);
      console.log("Seeded initial announcements data.");
    } else {
      await queryWithRetry(`
        UPDATE public.announcements
        SET image_url = CASE 
          WHEN title LIKE 'Admissions Open%' THEN '/frontpagepamplet.jpeg'
          WHEN title LIKE 'Annual Science Exhibition%' THEN '/campus-life-1.jpg'
          WHEN title LIKE 'Pre-Board Examination%' THEN '/library.jpg'
          ELSE image_url
        END
        WHERE (image_url IS NULL OR image_url = '') AND (
          title LIKE 'Admissions Open%' OR 
          title LIKE 'Annual Science Exhibition%' OR 
          title LIKE 'Pre-Board Examination%'
        )
      `);
    }
  } catch (err) {
    console.error("Failed to initialize announcements table:", err);
  }
}
initAnnouncementsTable();


async function saveMediaFile(file, category) {
  if (!file?.data || !file?.name) throw new Error("File data is required");
  const match = String(file.data).match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid file payload format");
  const mimeType = match[1] || file.type || "application/octet-stream";
  const base64Data = match[2];
  const fileSize = Number(file.size || Buffer.from(base64Data, "base64").length);
  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const safeCategory = String(category || "misc").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const publicUrl = `/uploads/${safeCategory}/${filename}`;

  const result = await queryWithRetry(
    `INSERT INTO public.media_uploads (filename, category, mime_type, file_size, data, url, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, now(), now())
     RETURNING id, filename, category, mime_type, file_size, url, created_at`,
    [file.name, safeCategory, mimeType, fileSize, file.data, publicUrl]
  );

  try {
    const dir = path.join(uploadRoot, safeCategory);
    await fsPromises.mkdir(dir, { recursive: true });
    await fsPromises.writeFile(path.join(dir, filename), Buffer.from(base64Data, "base64"));
  } catch (e) {
    // Secondary disk cache
  }

  return { url: publicUrl, item: result.rows[0] };
}

// Serve uploaded files from Database (with local disk fallback)
app.get("/uploads/:category/:filename", async (req, res) => {
  if (req.params.category === "career-applications") {
    return res.status(403).json({ success: false, error: "Access denied" });
  }
  const publicUrl = `/uploads/${req.params.category}/${req.params.filename}`;
  try {
    const result = await queryWithRetry("SELECT mime_type, data FROM public.media_uploads WHERE url = $1 LIMIT 1", [publicUrl]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      const match = String(row.data).match(/^data:(.+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const buffer = Buffer.from(match[2], "base64");
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.send(buffer);
      }
    }
  } catch (e) {
    console.error("Error retrieving media from database:", e);
  }

  const diskPath = path.join(uploadRoot, req.params.category, req.params.filename);
  try {
    await fsPromises.access(diskPath);
    return res.sendFile(diskPath);
  } catch (e) {
    return res.status(404).send("Media asset not found");
  }
});

// Strict Health Endpoint
app.get("/api/health", async (req, res) => {
  const startedAt = Date.now();
  console.log("Health check started");
  try {
    await runHealthQuery();
    console.log(`Health check passed in ${Date.now() - startedAt}ms`);
    res.json({
      success: true,
      database: "connected",
    });
  } catch (error) {
    console.error(`Health check database error after ${Date.now() - startedAt}ms:`, error);
    res.status(503).json({
      success: false,
      error: "Database unavailable",
    });
  }
});

// Auth endpoints
app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!adminPassword) return fail(res, 500, "ADMIN_PASSWORD is not configured on the backend.");
    if (!email || !password) return fail(res, 400, "Email and password are required.");
    if (password !== adminPassword) return fail(res, 401, "Invalid email or password.");

    const result = await queryWithRetry(
      "SELECT user_id, email, role, created_at FROM public.admin_users WHERE lower(email) = $1 AND COALESCE(role, 'admin') = 'admin' LIMIT 1",
      [email],
    );
    const admin = result.rows[0];
    if (!admin) return fail(res, 403, "You are not authorized to access the Admin Panel.");
    const token = signToken({ email, adminId: admin.user_id, exp: Date.now() + 1000 * 60 * 60 * 12 });
    ok(res, { token, user: { id: admin.user_id || admin.id, email: admin.email, role: admin.role || "admin" } });
  } catch (error) {
    handleError(res, "auth login error", error);
  }
});

app.get("/api/auth/me", requireAdmin, async (req, res) => {
  ok(res, { user: { email: req.admin.email, id: req.admin.adminId } });
});

// Uploads & Media Library
app.post("/api/uploads", requireAdmin, async (req, res) => {
  try {
    const { url, item } = await saveMediaFile(req.body.file, req.body.category);
    ok(res, { url, item });
  } catch (error) {
    handleError(res, "upload error", error);
  }
});

app.get("/api/media", async (req, res) => {
  try {
    const category = req.query.category ? String(req.query.category).toLowerCase() : null;
    let query = "SELECT id, filename as name, category, mime_type, file_size, url, created_at as \"uploadedAt\" FROM public.media_uploads";
    const params = [];
    if (category && category !== "all") {
      query += " WHERE lower(category) = $1";
      params.push(category);
    }
    query += " ORDER BY created_at DESC LIMIT 500";
    const result = await queryWithRetry(query, params);
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "list media error", error);
  }
});

app.delete("/api/media/:id", requireAdmin, async (req, res) => {
  try {
    const result = await queryWithRetry("DELETE FROM public.media_uploads WHERE id = $1 RETURNING url, category, filename", [req.params.id]);
    if (result.rows[0]) {
      const row = result.rows[0];
      const diskPath = path.join(uploadRoot, row.category, path.basename(row.url));
      await fsPromises.unlink(diskPath).catch(() => { });
    }
    ok(res, true);
  } catch (error) {
    handleError(res, "delete media error", error);
  }
});

app.put("/api/media/:id", requireAdmin, async (req, res) => {
  try {
    const file = req.body.file;
    if (!file?.data || !file?.name) return fail(res, 400, "File data required");
    const match = String(file.data).match(/^data:(.+);base64,(.+)$/);
    if (!match) return fail(res, 400, "Invalid base64 payload");
    const mimeType = match[1] || file.type || "application/octet-stream";
    const base64Data = match[2];
    const fileSize = Number(file.size || Buffer.from(base64Data, "base64").length);

    const result = await queryWithRetry(
      `UPDATE public.media_uploads
       SET filename = $1, mime_type = $2, file_size = $3, data = $4, updated_at = now()
       WHERE id = $5
       RETURNING id, filename as name, category, mime_type, file_size, url, created_at as "uploadedAt"`,
      [file.name, mimeType, fileSize, file.data, req.params.id]
    );
    if (!result.rows[0]) return fail(res, 404, "Media item not found");
    ok(res, result.rows[0]);
  } catch (error) {
    handleError(res, "replace media error", error);
  }
});

const galleryColumns = [
  "src", "alt", "title", "category", "type", "poster", "width", "height", "is_active", "sort_order",
  "created_at", "updated_at",
];

app.get("/api/gallery", async (req, res) => {
  try {
    const admin = req.query.admin === "true";
    if (admin && !verifyToken(getBearer(req))) return fail(res, 401, "Admin session required");
    let query = "SELECT * FROM public.gallery";
    if (!admin) query += " WHERE is_active = true";
    query += " ORDER BY sort_order ASC, created_at ASC";
    const result = await queryWithRetry(query);
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "gallery list error", error);
  }
});

app.post("/api/gallery", requireAdmin, async (req, res) => {
  try {
    const payload = {
      src: String(req.body.src || "").trim(),
      alt: String(req.body.alt || "").trim(),
      title: String(req.body.title || "").trim(),
      category: String(req.body.category || "Campus").trim(),
      type: String(req.body.type || "image").trim(),
      poster: String(req.body.poster || "").trim(),
      width: Number(req.body.width) || 800,
      height: Number(req.body.height) || 600,
      is_active: req.body.is_active !== false,
      sort_order: Number(req.body.sort_order) || 0,
    };
    if (!payload.src) return fail(res, 400, "Image source is required");
    const result = await insertRow("gallery", payload, galleryColumns);
    ok(res, result.rows[0]);
  } catch (error) {
    handleError(res, "gallery insert error", error);
  }
});

app.patch("/api/gallery/:id", requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body, updated_at: new Date().toISOString() };
    if ("width" in payload) payload.width = Number(payload.width) || 800;
    if ("height" in payload) payload.height = Number(payload.height) || 600;
    if ("sort_order" in payload) payload.sort_order = Number(payload.sort_order) || 0;
    if ("is_active" in payload) payload.is_active = Boolean(payload.is_active);
    const result = await updateBy("gallery", { column: "id", value: req.params.id }, payload, galleryColumns);
    ok(res, result.rows[0] || null);
  } catch (error) {
    handleError(res, "gallery update error", error);
  }
});

app.delete("/api/gallery/:id", requireAdmin, async (req, res) => {
  try {
    const result = await queryWithRetry("DELETE FROM public.gallery WHERE id = $1 RETURNING src, category", [req.params.id]);
    ok(res, result.rows[0] || true);
  } catch (error) {
    handleError(res, "gallery delete error", error);
  }
});

app.post("/api/career-resumes", async (req, res) => {
  try {
    const { url } = await saveMediaFile(req.body.file, "career-applications");
    ok(res, { path: url, url });
  } catch (error) {
    handleError(res, "career resume upload error", error);
  }
});

// Site CMS
app.get("/api/site-cms", async (req, res) => {
  try {
    const result = await queryWithRetry("SELECT id, key, value, created_at, updated_at FROM public.site_cms ORDER BY key");
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "site_cms error", error);
  }
});

app.get("/api/site-cms/:key", async (req, res) => {
  try {
    const result = await queryWithRetry("SELECT id, key, value, created_at, updated_at FROM public.site_cms WHERE key = $1 LIMIT 1", [req.params.key]);
    ok(res, result.rows[0] || null);
  } catch (error) {
    handleError(res, "site_cms key error", error);
  }
});

app.put("/api/site-cms/:key", requireAdmin, async (req, res) => {
  try {
    const result = await queryWithRetry(
      `INSERT INTO public.site_cms (key, value, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
       RETURNING id, key, value, created_at, updated_at`,
      [req.params.key, JSON.stringify(req.body.value || {})],
    );
    ok(res, result.rows[0]);
  } catch (error) {
    handleError(res, "site_cms upsert error", error);
  }
});

function sanitizeAdmissionPayload(body) {
  const payload = { ...body };
  if (!payload.application_id) {
    payload.application_id = crypto.randomUUID();
  }
  if (!payload.reference_code) {
    payload.reference_code = `PRAR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  const parseBool = (val) => {
    if (val === true || val === "true" || val === "Yes" || val === "yes" || val === "YES" || val === "1" || val === 1) return true;
    if (val === false || val === "false" || val === "No" || val === "no" || val === "NO" || val === "0" || val === 0) return false;
    return false;
  };
  payload.transport_required = parseBool(payload.transport_required);
  payload.hostel_required = parseBool(payload.hostel_required);

  payload.date_of_birth = sanitizeDateOnly(payload.date_of_birth);

  const textFields = [
    "student_name", "father_name", "mother_name", "email", "mobile_number", "alternate_mobile", "parent_mobile",
    "nationality", "mother_tongue", "address", "city", "district", "state", "pin_code",
    "previous_school", "previous_school_address", "sslc_marks", "sslc_board", "passing_year",
    "course_interested", "medium_of_instruction", "preferred_batch", "religion", "caste",
    "blood_group", "aadhaar_number", "parent_occupation", "parent_email", "emergency_contact",
    "annual_family_income", "admission_source", "message", "photo_url"
  ];
  for (const field of textFields) {
    if (payload[field] === undefined || payload[field] === null || String(payload[field]).trim() === "") {
      payload[field] = null;
    }
  }

  payload.submitted_at = sanitizeDate(payload.submitted_at) || new Date().toISOString();
  payload.created_at = sanitizeDate(payload.created_at) || new Date().toISOString();
  payload.status = payload.status || "Submitted";

  return payload;
}

function sanitizeEnquiryPayload(body) {
  const now = new Date().toISOString();
  return {
    name: String(body.name || body.studentName || "").trim() || "Anonymous Visitor",
    mobile: String(body.mobile || body.mobile_number || body.mobileNumber || "").trim() || "Not Provided",
    email: body.email && String(body.email).trim() !== "" ? String(body.email).trim() : null,
    course: String(body.course || body.course_interested || body.courseInterested || "PCMB").trim(),
    message: body.message && String(body.message).trim() !== "" ? String(body.message).trim() : null,
    enquiry_type: String(body.enquiry_type || body.enquiryType || "Website Enquiry").trim(),
    source: String(body.source || "Website").trim(),
    status: String(body.status || "New").trim(),
    submitted_at: sanitizeDate(body.submitted_at) || now,
    created_at: sanitizeDate(body.created_at) || now,
    updated_at: now,
  };
}

const admissionColumns = [
  "application_id", "reference_code", "student_name", "father_name", "mother_name", "date_of_birth", "gender", "email",
  "mobile_number", "alternate_mobile", "parent_mobile", "nationality", "mother_tongue", "address", "city", "district",
  "state", "pin_code", "previous_school", "previous_school_address", "sslc_marks", "sslc_board", "passing_year",
  "course_interested", "medium_of_instruction", "preferred_batch", "religion", "caste", "blood_group", "aadhaar_number",
  "transport_required", "hostel_required", "parent_occupation", "parent_email", "emergency_contact", "annual_family_income",
  "admission_source", "message", "photo_url", "enquiry_type", "submitted_at", "created_at", "updated_at", "status",
  "verified_by", "remarks", "follow_up_date", "reception_notes", "counsellor_name", "counsellor_assigned_date",
  "pdf_path", "bank_name", "bank_account_number", "bank_ifsc", "bank_branch", "fee_payment_status", "fee_amount_paid",
  "fee_due_date", "doc_marks_card_verified", "doc_tc_verified", "doc_aadhaar_verified", "doc_photos_verified",
  "doc_income_certificate_verified", "doc_caste_certificate_verified",
];

app.get("/api/admissions", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 500), 1000);
    const result = await queryWithRetry("SELECT * FROM public.admissions ORDER BY COALESCE(created_at, submitted_at) DESC NULLS LAST LIMIT $1", [limit]);
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "admissions list error", error);
  }
});

app.post("/api/admissions", async (req, res) => {
  try {
    const payload = sanitizeAdmissionPayload(req.body);
    if (!payload.student_name) return fail(res, 400, "Student name is required");
    const result = await insertRow("admissions", payload, admissionColumns);
    ok(res, result.rows[0] || result.rows);
  } catch (error) {
    handleError(res, "admission insert error", error);
  }
});

app.patch("/api/admissions/:column/:value", requireAdmin, async (req, res) => {
  try {
    if (!["application_id", "reference_code", "id"].includes(req.params.column)) return fail(res, 400, "Invalid admission identifier.");
    const payload = { ...req.body, updated_at: new Date().toISOString() };
    if ("date_of_birth" in payload) payload.date_of_birth = sanitizeDateOnly(payload.date_of_birth);
    if ("submitted_at" in payload) payload.submitted_at = sanitizeDate(payload.submitted_at);
    if ("created_at" in payload) payload.created_at = sanitizeDate(payload.created_at);
    const result = await updateBy("admissions", { column: req.params.column, value: req.params.value }, payload, admissionColumns);
    ok(res, result.rows[0] || null);
  } catch (error) {
    handleError(res, "admission update error", error);
  }
});

app.delete("/api/admissions/:column/:value", requireAdmin, async (req, res) => {
  try {
    if (!["application_id", "reference_code", "id"].includes(req.params.column)) return fail(res, 400, "Invalid admission identifier.");
    await queryWithRetry(`DELETE FROM public.admissions WHERE "${req.params.column}" = $1`, [req.params.value]);
    ok(res, true);
  } catch (error) {
    handleError(res, "admission delete error", error);
  }
});

const generalEnquiryColumns = ["name", "mobile", "email", "course", "message", "enquiry_type", "source", "status", "submitted_at", "created_at", "updated_at"];

app.get("/api/general-enquiries", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 500), 1000);
    const result = await queryWithRetry("SELECT * FROM public.general_enquiries ORDER BY created_at DESC NULLS LAST LIMIT $1", [limit]);
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "general enquiries list error", error);
  }
});

app.get("/api/enquiries", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 500), 1000);
    const result = await queryWithRetry("SELECT * FROM public.general_enquiries ORDER BY created_at DESC NULLS LAST LIMIT $1", [limit]);
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "enquiries list error", error);
  }
});

app.post("/api/general-enquiries", async (req, res) => {
  try {
    const payload = sanitizeEnquiryPayload(req.body);
    const result = await insertRow("general_enquiries", payload, generalEnquiryColumns);
    ok(res, result.rows[0] || result.rows);
  } catch (error) {
    handleError(res, "general enquiry insert error", error);
  }
});

app.post("/api/enquiries", async (req, res) => {
  try {
    const payload = sanitizeEnquiryPayload(req.body);
    const result = await insertRow("general_enquiries", payload, generalEnquiryColumns);
    ok(res, result.rows[0] || result.rows);
  } catch (error) {
    handleError(res, "enquiry insert error", error);
  }
});

app.patch("/api/general-enquiries/:id", requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body, updated_at: new Date().toISOString() };
    if ("submitted_at" in payload) payload.submitted_at = sanitizeDate(payload.submitted_at);
    if ("created_at" in payload) payload.created_at = sanitizeDate(payload.created_at);
    const result = await updateBy("general_enquiries", { column: "id", value: req.params.id }, payload, generalEnquiryColumns);
    ok(res, result.rows[0] || null);
  } catch (error) {
    handleError(res, "general enquiry update error", error);
  }
});

app.delete("/api/general-enquiries/:id", requireAdmin, async (req, res) => {
  try {
    const result = await queryWithRetry("DELETE FROM public.general_enquiries WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return fail(res, 404, "Enquiry not found");
    ok(res, true);
  } catch (error) {
    handleError(res, "general enquiry delete error", error);
  }
});

app.delete("/api/enquiries/:id", requireAdmin, async (req, res) => {
  try {
    const result = await queryWithRetry("DELETE FROM public.general_enquiries WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return fail(res, 404, "Enquiry not found");
    ok(res, true);
  } catch (error) {
    handleError(res, "enquiry delete error", error);
  }
});

function sanitizeJobPayload(body) {
  const payload = { ...body };
  payload.application_deadline = sanitizeDateOnly(payload.application_deadline);
  if (payload.vacancies !== undefined && payload.vacancies !== null && String(payload.vacancies).trim() !== "") {
    payload.vacancies = Number(payload.vacancies) || null;
  } else {
    payload.vacancies = null;
  }
  if (payload.display_order !== undefined && payload.display_order !== null) {
    payload.display_order = Number(payload.display_order) || 0;
  }
  if (payload.is_featured !== undefined) {
    payload.is_featured = Boolean(payload.is_featured);
  }
  return payload;
}

const jobColumns = [
  "title", "slug", "department", "employment_type", "location", "qualification", "experience_required", "salary_text",
  "vacancies", "short_description", "description", "responsibilities", "required_qualifications", "preferred_qualifications",
  "benefits", "additional_information", "application_deadline", "status", "is_featured", "display_order", "created_at", "updated_at",
];

app.get("/api/career-jobs", async (req, res) => {
  try {
    const admin = req.query.admin === "true";
    if (admin && !verifyToken(getBearer(req))) return fail(res, 401, "Admin session required");
    let where = "";
    if (!admin) where = "WHERE status = 'active'";
    const result = await queryWithRetry(`SELECT * FROM public.career_jobs ${where} ORDER BY display_order ASC, created_at DESC`);
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "career jobs list error", error);
  }
});

app.get("/api/career-jobs/:slug", async (req, res) => {
  try {
    const result = await queryWithRetry("SELECT * FROM public.career_jobs WHERE slug = $1 AND status = 'active' LIMIT 1", [req.params.slug]);
    ok(res, result.rows[0] || null);
  } catch (error) {
    handleError(res, "career job get error", error);
  }
});

app.post("/api/career-jobs", requireAdmin, async (req, res) => {
  try {
    const payload = sanitizeJobPayload(req.body);
    payload.created_at = sanitizeDate(payload.created_at) || new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    const result = await insertRow("career_jobs", payload, jobColumns);
    ok(res, result.rows[0]);
  } catch (error) {
    handleError(res, "career job insert error", error);
  }
});

app.patch("/api/career-jobs/:id", requireAdmin, async (req, res) => {
  try {
    const payload = sanitizeJobPayload(req.body);
    payload.updated_at = new Date().toISOString();
    if ("created_at" in payload) payload.created_at = sanitizeDate(payload.created_at);
    const result = await updateBy("career_jobs", { column: "id", value: req.params.id }, payload, jobColumns);
    ok(res, result.rows[0] || null);
  } catch (error) {
    handleError(res, "career job update error", error);
  }
});

app.delete("/api/career-jobs/:id", requireAdmin, async (req, res) => {
  try {
    const count = await queryWithRetry("SELECT COUNT(*)::int AS count FROM public.career_applications WHERE job_id = $1", [req.params.id]);
    if (count.rows[0].count > 0) return fail(res, 409, "This job has applications. Close or deactivate it instead of deleting.");
    await queryWithRetry("DELETE FROM public.career_jobs WHERE id = $1", [req.params.id]);
    ok(res, true);
  } catch (error) {
    handleError(res, "career job delete error", error);
  }
});

const applicationColumns = [
  "application_ref", "job_id", "full_name", "email", "mobile", "qualification", "subject_department", "years_experience",
  "current_organization", "linkedin_url", "portfolio_url", "cover_letter", "additional_information", "resume_path",
  "resume_file_name", "resume_file_size", "status", "created_at", "updated_at",
];

app.get("/api/career-applications", requireAdmin, async (req, res) => {
  try {
    const result = await queryWithRetry(
      `SELECT a.*, json_build_object('title', j.title, 'slug', j.slug, 'department', j.department) AS career_jobs
       FROM public.career_applications a
       LEFT JOIN public.career_jobs j ON j.id = a.job_id
       ORDER BY a.created_at DESC
       LIMIT 1000`,
    );
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "career applications list error", error);
  }
});

function sanitizeCareerApplicationPayload(body) {
  const payload = { ...body };
  if (!payload.application_ref || String(payload.application_ref).trim() === "") {
    payload.application_ref = `APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  payload.job_id = sanitizeUuid(payload.job_id);
  payload.full_name = String(payload.full_name || "").trim() || "";
  payload.email = String(payload.email || "").trim() || "";
  payload.mobile = String(payload.mobile || "").trim() || "";
  payload.qualification = String(payload.qualification || "").trim() || "Not Specified";
  payload.subject_department = String(payload.subject_department || "").trim() || "General";
  payload.years_experience = String(payload.years_experience || "").trim() || "0 years";
  payload.cover_letter = String(payload.cover_letter || "").trim() || "No cover letter provided.";
  payload.resume_path = String(payload.resume_path || "").trim() || "";
  payload.resume_file_name = String(payload.resume_file_name || "").trim() || "resume";
  payload.resume_file_size = Number(payload.resume_file_size) || 0;
  payload.status = payload.status || "new";
  payload.created_at = sanitizeDate(payload.created_at) || new Date().toISOString();
  payload.updated_at = new Date().toISOString();
  return payload;
}

app.post("/api/career-applications", async (req, res) => {
  try {
    const payload = sanitizeCareerApplicationPayload(req.body);
    const result = await insertRow("career_applications", payload, applicationColumns, "application_ref");
    ok(res, result.rows[0]);
  } catch (error) {
    handleError(res, "career application insert error", error);
  }
});

app.patch("/api/career-applications/:id", requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body, updated_at: new Date().toISOString() };
    if ("job_id" in payload) payload.job_id = sanitizeUuid(payload.job_id);
    if ("created_at" in payload) payload.created_at = sanitizeDate(payload.created_at);
    const result = await updateBy("career_applications", { column: "id", value: req.params.id }, payload, applicationColumns);
    ok(res, result.rows[0] || null);
  } catch (error) {
    handleError(res, "career application update error", error);
  }
});

app.delete("/api/career-applications/:id", requireAdmin, async (req, res) => {
  try {
    await queryWithRetry("DELETE FROM public.career_applications WHERE id = $1", [req.params.id]);
    ok(res, true);
  } catch (error) {
    handleError(res, "career application delete error", error);
  }
});

app.get("/api/career-applications/:id/resume", requireAdmin, async (req, res) => {
  try {
    const result = await queryWithRetry(
      "SELECT resume_path, resume_file_name FROM public.career_applications WHERE id = $1 LIMIT 1",
      [req.params.id],
    );
    if (!result.rows.length) return fail(res, 404, "Application not found");

    const app = result.rows[0];
    const resumePath = String(app.resume_path || "");
    if (!resumePath) return fail(res, 404, "Resume not found");

    let diskPath;
    if (resumePath.startsWith("/uploads/career-applications/")) {
      const filename = path.basename(resumePath);
      diskPath = path.join(uploadRoot, "career-applications", filename);
    } else if (resumePath.startsWith("resumes/")) {
      return fail(res, 404, "Resume not found");
    } else {
      return fail(res, 400, "Invalid resume path");
    }

    const resolved = path.resolve(diskPath);
    if (!resolved.startsWith(uploadRoot)) return fail(res, 400, "Invalid resume path");

    try {
      await fsPromises.access(resolved);
    } catch {
      return fail(res, 404, "Resume not found");
    }

    const ext = path.extname(resolved).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const mimeType = mimeTypes[ext] || "application/octet-stream";
    const fileName = String(app.resume_file_name || path.basename(resolved)).replace(/"/g, '\\"');
    const disposition = req.query.download === "true" ? "attachment" : "inline";

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);
    return res.sendFile(resolved);
  } catch (error) {
    if (error?.code === "ENOENT") return fail(res, 404, "Resume not found");
    handleError(res, "career resume serve error", error);
  }
});

app.get("/api/career-resumes", requireAdmin, async (req, res) => {
  const resumePath = String(req.query.path || "");
  if (!resumePath.startsWith("/uploads/career-applications/")) return fail(res, 400, "Invalid resume path.");
  ok(res, { url: resumePath });
});

const dashboardColumns = ["name", "provider", "embed_url", "status", "description", "display_order", "is_default", "created_at", "updated_at"];

app.get("/api/dashboard-configs", requireAdmin, async (req, res) => {
  try {
    const result = await queryWithRetry("SELECT * FROM public.dashboard_configs ORDER BY display_order ASC, created_at DESC");
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "dashboard configs list error", error);
  }
});

app.post("/api/dashboard-configs", requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      if (req.body.is_default) await client.query("UPDATE public.dashboard_configs SET is_default = false");
      const payload = { ...req.body, created_at: sanitizeDate(req.body.created_at) || new Date().toISOString(), updated_at: new Date().toISOString() };
      const result = await insertRow("dashboard_configs", payload, dashboardColumns);
      await client.query("COMMIT");
      ok(res, result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    handleError(res, "dashboard config insert error", error);
  }
});

app.patch("/api/dashboard-configs/:id", requireAdmin, async (req, res) => {
  try {
    if (req.body.is_default) await queryWithRetry("UPDATE public.dashboard_configs SET is_default = false WHERE id <> $1", [req.params.id]);
    const payload = { ...req.body, updated_at: new Date().toISOString() };
    if ("created_at" in payload) payload.created_at = sanitizeDate(payload.created_at);
    const result = await updateBy("dashboard_configs", { column: "id", value: req.params.id }, payload, dashboardColumns);
    ok(res, result.rows[0] || null);
  } catch (error) {
    handleError(res, "dashboard config update error", error);
  }
});

app.delete("/api/dashboard-configs/:id", requireAdmin, async (req, res) => {
  try {
    await queryWithRetry("DELETE FROM public.dashboard_configs WHERE id = $1", [req.params.id]);
    ok(res, true);
  } catch (error) {
    handleError(res, "dashboard config delete error", error);
  }
});

app.get("/api/admin-users", requireAdmin, async (req, res) => {
  try {
    const result = await queryWithRetry(
      "SELECT user_id, email, role, created_at FROM public.admin_users WHERE COALESCE(role, 'admin') = 'admin' ORDER BY created_at DESC"
    );

    ok(res, result.rows);
  } catch (error) {
    handleError(res, "admin users list error", error);
  }
});

// Announcements API
const announcementColumns = [
  "title", "short_description", "full_description", "category", "event_date", "start_date", "end_date",
  "event_time", "venue", "image_url", "attachment_url", "cta_text", "cta_url", "status", "is_featured",
  "priority", "created_at", "updated_at",
];

function sanitizeAnnouncementPayload(body) {
  const payload = { ...body };
  payload.title = String(payload.title || "").trim();
  payload.short_description = payload.short_description ? String(payload.short_description).trim() : null;
  payload.full_description = payload.full_description ? String(payload.full_description).trim() : null;
  payload.category = String(payload.category || "General Announcement").trim();
  payload.event_date = sanitizeDateOnly(payload.event_date);
  payload.start_date = sanitizeDateOnly(payload.start_date);
  payload.end_date = sanitizeDateOnly(payload.end_date);
  payload.event_time = payload.event_time ? String(payload.event_time).trim() : null;
  payload.venue = payload.venue ? String(payload.venue).trim() : null;
  payload.image_url = payload.image_url ? String(payload.image_url).trim() : null;
  payload.attachment_url = payload.attachment_url ? String(payload.attachment_url).trim() : null;
  payload.cta_text = payload.cta_text ? String(payload.cta_text).trim() : null;
  payload.cta_url = payload.cta_url ? String(payload.cta_url).trim() : null;
  const statusStr = String(payload.status || "published").toLowerCase();
  payload.status = ["draft", "published", "archived"].includes(statusStr) ? statusStr : "published";
  payload.is_featured = Boolean(payload.is_featured);
  payload.priority = Number(payload.priority) || 0;
  return payload;
}

app.get("/api/announcements", async (req, res) => {
  try {
    const admin = req.query.admin === "true";
    if (admin && !verifyToken(getBearer(req))) return fail(res, 401, "Admin session required");
    
    // Auto-patch null image_urls for initial default entries if present
    try {
      await queryWithRetry(`
        UPDATE public.announcements
        SET image_url = CASE 
          WHEN title LIKE 'Admissions Open%' THEN '/frontpagepamplet.jpeg'
          WHEN title LIKE 'Annual Science Exhibition%' THEN '/campus-life-1.jpg'
          WHEN title LIKE 'Pre-Board Examination%' THEN '/library.jpg'
          ELSE image_url
        END
        WHERE (image_url IS NULL OR image_url = '') AND (
          title LIKE 'Admissions Open%' OR 
          title LIKE 'Annual Science Exhibition%' OR 
          title LIKE 'Pre-Board Examination%'
        )
      `);
    } catch (e) {
      // Non-critical auto-patch
    }

    let where = "";
    if (!admin) {
      where = "WHERE status = 'published'";
    }
    const result = await queryWithRetry(
      `SELECT * FROM public.announcements ${where} ORDER BY priority DESC, is_featured DESC, COALESCE(event_date, created_at) DESC`
    );
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "announcements list error", error);
  }
});

app.get("/api/announcements/:id", async (req, res) => {
  try {
    const id = sanitizeUuid(req.params.id) || req.params.id;
    const result = await queryWithRetry("SELECT * FROM public.announcements WHERE id = $1 LIMIT 1", [id]);
    const announcement = result.rows[0];
    if (!announcement) return fail(res, 404, "Announcement not found");
    if (announcement.status !== "published" && !verifyToken(getBearer(req))) {
      return fail(res, 403, "Announcement not published");
    }
    ok(res, announcement);
  } catch (error) {
    handleError(res, "announcement get error", error);
  }
});

app.post("/api/announcements", requireAdmin, async (req, res) => {
  try {
    const payload = sanitizeAnnouncementPayload(req.body);
    if (!payload.title) return fail(res, 400, "Title is required");
    payload.created_at = sanitizeDate(payload.created_at) || new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    const result = await insertRow("announcements", payload, announcementColumns);
    ok(res, result.rows[0]);
  } catch (error) {
    handleError(res, "announcement insert error", error);
  }
});

app.patch("/api/announcements/:id", requireAdmin, async (req, res) => {
  try {
    const payload = sanitizeAnnouncementPayload(req.body);
    payload.updated_at = new Date().toISOString();
    if ("created_at" in payload) payload.created_at = sanitizeDate(payload.created_at);
    const result = await updateBy("announcements", { column: "id", value: req.params.id }, payload, announcementColumns);
    ok(res, result.rows[0] || null);
  } catch (error) {
    handleError(res, "announcement update error", error);
  }
});

app.delete("/api/announcements/:id", requireAdmin, async (req, res) => {
  try {
    await queryWithRetry("DELETE FROM public.announcements WHERE id = $1", [req.params.id]);
    ok(res, true);
  } catch (error) {
    handleError(res, "announcement delete error", error);
  }
});

app.get("/api/chatbot-knowledge", async (req, res) => {
  try {
    if (!(await tableExists("chatbot_knowledge"))) return ok(res, []);
    const result = await queryWithRetry("SELECT * FROM public.chatbot_knowledge ORDER BY sort_order ASC");
    ok(res, result.rows);
  } catch (error) {
    handleError(res, "chatbot knowledge list error", error);
  }
});

app.post("/api/chatbot-knowledge/sync", requireAdmin, async (req, res) => {
  try {
    if (!(await tableExists("chatbot_knowledge"))) return ok(res, []);
    const knowledge = Array.isArray(req.body.knowledge) ? req.body.knowledge : [];
    const kept = [];
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const item of knowledge) {
        const row = {
          topic: item.topic,
          keywords: item.keywords || [],
          answer: item.answer,
          category: item.category || "General",
          sort_order: item.display_order || item.sort_order || 0,
        };
        if (String(item.id || "").startsWith("kb-")) {
          const inserted = await client.query(
            "INSERT INTO public.chatbot_knowledge (topic, keywords, answer, category, sort_order, updated_at) VALUES ($1, $2, $3, $4, $5, now()) RETURNING id",
            [row.topic, row.keywords, row.answer, row.category, row.sort_order],
          );
          kept.push(inserted.rows[0].id);
        } else {
          await client.query(
            "UPDATE public.chatbot_knowledge SET topic=$1, keywords=$2, answer=$3, category=$4, sort_order=$5, updated_at=now() WHERE id=$6",
            [row.topic, row.keywords, row.answer, row.category, row.sort_order, item.id],
          );
          kept.push(item.id);
        }
      }
      const previous = Array.isArray(req.body.previousIds) ? req.body.previousIds : [];
      const removed = previous.filter((id) => !knowledge.some((item) => item.id === id));
      for (const id of removed) await client.query("DELETE FROM public.chatbot_knowledge WHERE id = $1", [id]);
      await client.query("COMMIT");
      ok(res, kept);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    handleError(res, "chatbot knowledge sync error", error);
  }
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "Prarthana College API is running" });
});

const SITE_URL = (process.env.SITE_URL || "https://prarthanapucollegebagalkot.in").replace(/\/+$/, "");

app.get("/sitemap.xml", async (req, res) => {
  try {
    const staticUrls = [
      "/",
      "/about",
      "/courses",
      "/achievements",
      "/gallery",
      "/fee-structure",
      "/transport",
      "/admission",
      "/contact",
      "/careers",
      "/announcements",
    ];

    let careerUrls = [];
    try {
      const result = await queryWithRetry(
        "SELECT slug FROM public.career_jobs WHERE status = 'active' AND slug IS NOT NULL AND slug <> '' ORDER BY created_at DESC"
      );
      careerUrls = result.rows.map((row) => `/careers/${row.slug}`);
    } catch (e) {
      console.error("Failed to load career jobs for sitemap:", e);
    }

    let announcementUrls = [];
    try {
      const result = await queryWithRetry(
        "SELECT id FROM public.announcements WHERE status = 'published' ORDER BY created_at DESC"
      );
      announcementUrls = result.rows.map((row) => `/announcements/${row.id}`);
    } catch (e) {
      console.error("Failed to load announcements for sitemap:", e);
    }

    const urls = [...staticUrls, ...careerUrls, ...announcementUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc><changefreq>${u === "/" || u === "/admission" ? "weekly" : "monthly"}</changefreq><priority>${u === "/" ? "1.0" : u === "/admission" ? "0.9" : "0.8"}</priority></url>`).join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("sitemap error:", error);
    res.status(500).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>");
  }
});

// Serve static frontend files in production (Docker / single-origin deployment)
const distDir = path.join(rootDir, "dist");
const publicDir = path.join(rootDir, "public");

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: '1y', immutable: true }));
}

app.use('/uploads', (req, res, next) => {
  if (req.path.startsWith('/career-applications/')) {
    return res.status(403).json({ success: false, error: "Access denied" });
  }
  next();
});
app.use('/uploads', express.static(path.join(uploadRoot), { maxAge: '1y', immutable: true }));
app.use(express.static(publicDir, { maxAge: '1y', immutable: true }));

if (fs.existsSync(distDir)) {
  app.get('/{*path}', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return res.sendStatus(404);
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Express error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return fail(res, 400, "Invalid JSON payload in request body.");
  }
  console.error("Unhandled server error:", err);
  fail(res, 500, err?.message || "Internal server error");
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

const server = app.listen(port, () => {
  console.log(`Prarthana College API server running on port ${port}`);
});

server.on("error", (error) => {
  console.error("HTTP server error:", error);
  if (String(error?.code || "").toLowerCase() === "eaddrinuse") {
    console.error(`PORT ${port} IS ALREADY IN USE`);
  }
});
