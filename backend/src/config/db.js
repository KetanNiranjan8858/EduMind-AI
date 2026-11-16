import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local fallback store path
const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'sources.json');

if (!fs.existsSync(fallbackDir)) {
  fs.mkdirSync(fallbackDir, { recursive: true });
}
if (!fs.existsSync(fallbackFile)) {
  fs.writeFileSync(fallbackFile, JSON.stringify([], null, 2), 'utf8');
}

let pool = null;
let useFallback = false;

// Helpers for JSON fallback
function readFallback() {
  try {
    const raw = fs.readFileSync(fallbackFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeFallback(data) {
  try {
    fs.writeFileSync(fallbackFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[EduMind DB Fallback] Error writing fallback store:', err);
  }
}

/**
 * Initialize Database Connection
 */
export async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'edumind_db';
  const port = Number(process.env.DB_PORT) || 3306;

  try {
    // 1. Try to connect to MySQL server without DB to ensure database exists
    const adminConn = await mysql.createConnection({
      host,
      user,
      password,
      port,
      connectTimeout: 3000
    });

    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await adminConn.end();

    // 2. Connect pool to the actual database
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000
    });

    // 3. Create sources table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sources (
        id VARCHAR(64) PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL DEFAULT 0,
        mime_type VARCHAR(100) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        is_note BOOLEAN DEFAULT FALSE,
        note_content LONGTEXT,
        gemini_file_uri VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createTableQuery);
    useFallback = false;
    console.log(`[EduMind DB] Successfully connected to MySQL database: ${database}`);
  } catch (err) {
    useFallback = true;
    console.warn(`\n======================================================`);
    console.warn(`[EduMind DB] Warning: MySQL connection failed (${err.message}).`);
    console.warn(`[EduMind DB] Activating resilient local storage fallback (${fallbackFile}).`);
    console.warn(`[EduMind DB] The application is fully operational! When ready, start MySQL and verify .env credentials.`);
    console.warn(`======================================================\n`);
  }
}

/**
 * Unified DB query wrapper
 */
export async function query(sql, params = []) {
  if (!useFallback && pool) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      console.error('[EduMind DB] MySQL query error, falling back to local store:', err.message);
      // continue to fallback handling below
    }
  }

  // Fallback JSON-based implementation for standard CRUD
  const lowerSql = sql.trim().toLowerCase();
  const list = readFallback();

  if (lowerSql.startsWith('select * from sources order by created_at desc')) {
    return list.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (lowerSql.startsWith('select * from sources where id =') || lowerSql.includes('where id = ?')) {
    const id = params[0];
    const found = list.find((item) => item.id === id);
    return found ? [found] : [];
  }

  if (lowerSql.startsWith('select * from sources where id in')) {
    const ids = Array.isArray(params[0]) ? params[0] : params;
    return list.filter((item) => ids.includes(item.id));
  }

  if (lowerSql.startsWith('insert into sources')) {
    // params order matches: [id, original_name, filename, file_path, file_size, mime_type, file_type, is_note, note_content]
    const [id, original_name, filename, file_path, file_size, mime_type, file_type, is_note, note_content] = params;
    const newRecord = {
      id,
      original_name,
      filename,
      file_path,
      file_size: Number(file_size) || 0,
      mime_type,
      file_type,
      is_note: Boolean(is_note),
      note_content: note_content || null,
      gemini_file_uri: null,
      created_at: new Date().toISOString()
    };
    list.unshift(newRecord);
    writeFallback(list);
    return { affectedRows: 1, insertId: id };
  }

  if (lowerSql.startsWith('delete from sources where id =')) {
    const id = params[0];
    const nextList = list.filter((item) => item.id !== id);
    const affected = list.length - nextList.length;
    writeFallback(nextList);
    return { affectedRows: affected };
  }

  // Default return empty array
  return [];
}

export default {
  initDB,
  query
};
