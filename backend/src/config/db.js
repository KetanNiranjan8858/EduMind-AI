import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local fallback store path
const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'db.json');

if (!fs.existsSync(fallbackDir)) {
  fs.mkdirSync(fallbackDir, { recursive: true });
}

// Initial default database structure for fallback
const initialStore = {
  users: [],
  workspaces: [
    {
      id: 'ws_default',
      name: 'General Study Workspace',
      description: 'Default study space for documents, notes, and assessments',
      color: 'indigo',
      icon: 'book',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  sources: [],
  quizzes: [],
  exam_attempts: [],
  chat_messages: []
};

// Migrate legacy sources.json if it exists
const legacySourcesFile = path.join(fallbackDir, 'sources.json');
if (fs.existsSync(legacySourcesFile) && !fs.existsSync(fallbackFile)) {
  try {
    const legacy = JSON.parse(fs.readFileSync(legacySourcesFile, 'utf8'));
    initialStore.sources = legacy.map(s => ({ ...s, workspace_id: 'ws_default' }));
  } catch {}
}

if (!fs.existsSync(fallbackFile)) {
  fs.writeFileSync(fallbackFile, JSON.stringify(initialStore, null, 2), 'utf8');
}

let pool = null;
let useFallback = false;

export function readFallback() {
  try {
    const raw = fs.readFileSync(fallbackFile, 'utf8');
    const data = JSON.parse(raw);
    if (!data.users) data.users = [];
    if (!data.workspaces || data.workspaces.length === 0) {
      data.workspaces = initialStore.workspaces;
      writeFallback(data);
    }
    return data;
  } catch {
    return { ...initialStore };
  }
}

export function writeFallback(data) {
  try {
    fs.writeFileSync(fallbackFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[EduMind DB Fallback] Error writing store:', err);
  }
}

/**
 * Initialize Database Connection and run Schema
 */
export async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'edumind_db';
  const port = Number(process.env.DB_PORT) || 3306;

  try {
    const adminConn = await mysql.createConnection({
      host,
      user,
      password,
      port,
      connectTimeout: 3000
    });

    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await adminConn.end();

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

    // 1. Workspaces
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        color VARCHAR(50) DEFAULT 'indigo',
        icon VARCHAR(50) DEFAULT 'book',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure default workspace exists
    const [existingWs] = await pool.query('SELECT id FROM workspaces LIMIT 1');
    if (!existingWs || existingWs.length === 0) {
      await pool.query(
        'INSERT INTO workspaces (id, name, description, color, icon) VALUES (?, ?, ?, ?, ?)',
        ['ws_default', 'General Study Workspace', 'Default study space for documents, notes, and assessments', 'indigo', 'book']
      );
    }

    // 2. Sources
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sources (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL DEFAULT 0,
        mime_type VARCHAR(100) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        is_note BOOLEAN DEFAULT FALSE,
        note_content LONGTEXT,
        gemini_file_uri VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_workspace_sources (workspace_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Quizzes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        total_questions INT NOT NULL DEFAULT 10,
        questions_json LONGTEXT NOT NULL,
        source_files_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_workspace_quizzes (workspace_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Exam Attempts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_attempts (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL,
        quiz_id VARCHAR(64),
        quiz_title VARCHAR(255) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        total_questions INT NOT NULL,
        attempted_count INT NOT NULL,
        correct_count INT NOT NULL,
        incorrect_count INT NOT NULL,
        accuracy_percentage INT NOT NULL,
        overall_percentage INT NOT NULL,
        time_taken_seconds INT NOT NULL,
        quiz_json LONGTEXT NOT NULL,
        user_answers_json LONGTEXT NOT NULL,
        question_times_json LONGTEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_workspace_attempts (workspace_id),
        INDEX idx_submitted_at (submitted_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Chat Messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL,
        sender VARCHAR(20) NOT NULL,
        message LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_workspace_chat (workspace_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Users & Authentication (Password protected + OTP)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash TEXT,
        candidate_id VARCHAR(50),
        target_exam VARCHAR(100) DEFAULT 'GATE CS / IT',
        auth_provider VARCHAR(50) DEFAULT 'local',
        otp_code VARCHAR(10),
        otp_expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    useFallback = false;
    console.log(`[EduMind DB] Connected to MySQL (${database}) with complete relational schema.`);
  } catch (err) {
    useFallback = true;
    console.warn(`\n======================================================`);
    console.warn(`[EduMind DB] MySQL connection not available (${err.message}).`);
    console.warn(`[EduMind DB] Resilient multi-workspace JSON storage active (${fallbackFile}).`);
    console.warn(`[EduMind DB] Workspaces, sources, exam history & chat are fully persisted.`);
    console.warn(`======================================================\n`);
  }
}

/**
 * DB query runner with seamless fallback support
 */
export async function query(sql, params = []) {
  if (!useFallback && pool) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      console.error('[EduMind DB] MySQL error, routing to fallback:', err.message);
    }
  }

  // Resilient JSON-based execution engine
  const store = readFallback();
  const lowerSql = sql.trim().toLowerCase();

  // USERS & AUTHENTICATION
  if (lowerSql.startsWith('select * from users where email =')) {
    const email = (params[0] || '').trim().toLowerCase();
    const found = (store.users || []).find(u => u.email.toLowerCase() === email);
    return found ? [found] : [];
  }
  if (lowerSql.startsWith('select * from users where id =')) {
    const id = params[0];
    const found = (store.users || []).find(u => u.id === id);
    return found ? [found] : [];
  }
  if (lowerSql.startsWith('insert into users')) {
    const [id, name, email, password_hash, candidate_id, target_exam, auth_provider] = params;
    const userRecord = {
      id,
      name,
      email: (email || '').trim().toLowerCase(),
      password_hash: password_hash || null,
      candidate_id: candidate_id || null,
      target_exam: target_exam || 'GATE CS / IT',
      auth_provider: auth_provider || 'local',
      otp_code: null,
      otp_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (!store.users) store.users = [];
    store.users.push(userRecord);
    writeFallback(store);
    return { affectedRows: 1, insertId: id };
  }
  if (lowerSql.includes('update users set otp_code = ?, otp_expires_at = ? where email = ?')) {
    const [otp_code, otp_expires_at, email] = params;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = (store.users || []).find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.otp_code = otp_code;
      user.otp_expires_at = otp_expires_at;
      user.updated_at = new Date().toISOString();
      writeFallback(store);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (lowerSql.includes('update users set password_hash = ?, otp_code = null, otp_expires_at = null where email = ?')) {
    const [password_hash, email] = params;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = (store.users || []).find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.password_hash = password_hash;
      user.otp_code = null;
      user.otp_expires_at = null;
      user.updated_at = new Date().toISOString();
      writeFallback(store);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // WORKSPACES
  if (lowerSql.startsWith('select * from workspaces')) {
    return store.workspaces || [];
  }
  if (lowerSql.startsWith('insert into workspaces')) {
    const [id, name, description, color, icon] = params;
    const ws = {
      id,
      name,
      description: description || '',
      color: color || 'indigo',
      icon: icon || 'book',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.workspaces.push(ws);
    writeFallback(store);
    return { affectedRows: 1, insertId: id };
  }
  if (lowerSql.startsWith('update workspaces set name = ? where id = ?')) {
    const [name, id] = params;
    const found = store.workspaces.find(w => w.id === id);
    if (found) {
      found.name = name;
      found.updated_at = new Date().toISOString();
      writeFallback(store);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (lowerSql.startsWith('delete from workspaces where id =')) {
    const id = params[0];
    store.workspaces = store.workspaces.filter(w => w.id !== id);
    store.sources = store.sources.filter(s => s.workspace_id !== id);
    store.quizzes = store.quizzes.filter(q => q.workspace_id !== id);
    store.exam_attempts = store.exam_attempts.filter(a => a.workspace_id !== id);
    store.chat_messages = store.chat_messages.filter(c => c.workspace_id !== id);
    writeFallback(store);
    return { affectedRows: 1 };
  }

  // SOURCES
  if (lowerSql.startsWith('select * from sources where workspace_id =')) {
    const wsId = params[0];
    return store.sources.filter(s => s.workspace_id === wsId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (lowerSql.startsWith('select * from sources where id =') || lowerSql.includes('sources where id = ?')) {
    const id = params[0];
    const found = store.sources.find(s => s.id === id);
    return found ? [found] : [];
  }
  if (lowerSql.startsWith('select * from sources order by created_at desc')) {
    return store.sources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (lowerSql.startsWith('insert into sources')) {
    const [id, workspace_id, original_name, filename, file_path, file_size, mime_type, file_type, is_note, note_content] = params;
    const record = {
      id,
      workspace_id: workspace_id || 'ws_default',
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
    store.sources.unshift(record);
    writeFallback(store);
    return { affectedRows: 1, insertId: id };
  }
  if (lowerSql.startsWith('delete from sources where id =')) {
    const id = params[0];
    const prevLen = store.sources.length;
    store.sources = store.sources.filter(s => s.id !== id);
    writeFallback(store);
    return { affectedRows: prevLen - store.sources.length };
  }

  // EXAM ATTEMPTS (HISTORY)
  if (lowerSql.startsWith('select * from exam_attempts where workspace_id =')) {
    const wsId = params[0];
    return store.exam_attempts
      .filter(a => a.workspace_id === wsId)
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  }
  if (lowerSql.startsWith('select * from exam_attempts where id =')) {
    const id = params[0];
    const found = store.exam_attempts.find(a => a.id === id);
    return found ? [found] : [];
  }
  if (lowerSql.startsWith('insert into exam_attempts')) {
    const [
      id, workspace_id, quiz_id, quiz_title, difficulty,
      total_questions, attempted_count, correct_count, incorrect_count,
      accuracy_percentage, overall_percentage, time_taken_seconds,
      quiz_json, user_answers_json, question_times_json
    ] = params;

    const attempt = {
      id,
      workspace_id: workspace_id || 'ws_default',
      quiz_id,
      quiz_title,
      difficulty,
      total_questions: Number(total_questions),
      attempted_count: Number(attempted_count),
      correct_count: Number(correct_count),
      incorrect_count: Number(incorrect_count),
      accuracy_percentage: Number(accuracy_percentage),
      overall_percentage: Number(overall_percentage),
      time_taken_seconds: Number(time_taken_seconds),
      quiz_json,
      user_answers_json,
      question_times_json,
      submitted_at: new Date().toISOString()
    };
    store.exam_attempts.unshift(attempt);
    writeFallback(store);
    return { affectedRows: 1, insertId: id };
  }
  if (lowerSql.startsWith('delete from exam_attempts where id =')) {
    const id = params[0];
    store.exam_attempts = store.exam_attempts.filter(a => a.id !== id);
    writeFallback(store);
    return { affectedRows: 1 };
  }

  // CHAT MESSAGES
  if (lowerSql.startsWith('select * from chat_messages where workspace_id =')) {
    const wsId = params[0];
    return store.chat_messages
      .filter(c => c.workspace_id === wsId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
  if (lowerSql.startsWith('insert into chat_messages')) {
    const [id, workspace_id, sender, message] = params;
    const msg = {
      id,
      workspace_id: workspace_id || 'ws_default',
      sender,
      message,
      created_at: new Date().toISOString()
    };
    store.chat_messages.push(msg);
    writeFallback(store);
    return { affectedRows: 1, insertId: id };
  }
  if (lowerSql.startsWith('delete from chat_messages where workspace_id =')) {
    const wsId = params[0];
    store.chat_messages = store.chat_messages.filter(c => c.workspace_id !== wsId);
    writeFallback(store);
    return { affectedRows: 1 };
  }

  return [];
}

export default {
  initDB,
  query,
  readFallback,
  writeFallback
};
