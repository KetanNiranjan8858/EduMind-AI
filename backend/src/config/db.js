import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local fallback store paths (Dedicated Physical Databases)
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Landing Page & Central Studio Database File
export const landingDbFile = path.join(dataDir, 'landing_studio_db.json');

// 2. Exam Prep Dashboard Database File
export const examPrepDbFile = path.join(dataDir, 'exam_prep_db.json');

// Legacy fallback path (for automatic migration)
const legacyFile = path.join(dataDir, 'db.json');

// Default schemas for initial setup
const initialLandingStore = {
  database_name: 'LandingStudioDB',
  description: 'Dedicated database for EduMind AI Landing Page, Central Studio, and User Workspaces',
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

const initialExamPrepStore = {
  database_name: 'ExamPrepDB',
  description: 'Dedicated database for Official Exam Prep Hub, Curated GATE Question Bank, and Mock Assessments',
  users: [],
  exam_prep_questions: [],
  exam_prep_tests: [],
  exam_attempts: [],
  chat_messages: []
};

/**
 * Migration & Initialization: Split legacy db.json into two dedicated databases
 */
function ensureDatabasesInitialized() {
  let legacyData = null;
  if (fs.existsSync(legacyFile)) {
    try {
      legacyData = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
    } catch (e) {
      console.warn('[EduMind DB] Could not parse legacy db.json:', e.message);
    }
  }

  // Initialize Landing Page Database
  if (!fs.existsSync(landingDbFile)) {
    if (legacyData) {
      const landingData = {
        database_name: 'LandingStudioDB',
        description: 'Dedicated database for EduMind AI Landing Page, Central Studio, and User Workspaces',
        users: legacyData.users || [],
        workspaces: legacyData.workspaces && legacyData.workspaces.length > 0 ? legacyData.workspaces : initialLandingStore.workspaces,
        sources: legacyData.sources || [],
        quizzes: legacyData.quizzes || [],
        exam_attempts: (legacyData.exam_attempts || []).filter(
          a => a.category !== 'examprep' && a.workspace_id !== 'ws_gate_prep'
        ),
        chat_messages: (legacyData.chat_messages || []).filter(
          c => c.workspace_id !== 'ws_gate_prep'
        )
      };
      fs.writeFileSync(landingDbFile, JSON.stringify(landingData, null, 2), 'utf8');
      console.log('[EduMind DB] Migrated landing page data to landing_studio_db.json');
    } else {
      fs.writeFileSync(landingDbFile, JSON.stringify(initialLandingStore, null, 2), 'utf8');
    }
  }

  // Initialize Exam Prep Dashboard Database
  if (!fs.existsSync(examPrepDbFile)) {
    if (legacyData) {
      const examPrepData = {
        database_name: 'ExamPrepDB',
        description: 'Dedicated database for Official Exam Prep Hub, Curated GATE Question Bank, and Mock Assessments',
        users: legacyData.users || [],
        exam_prep_questions: legacyData.exam_prep_questions || [],
        exam_prep_tests: legacyData.exam_prep_tests || [],
        exam_attempts: (legacyData.exam_attempts || []).filter(
          a => a.category === 'examprep' || a.workspace_id === 'ws_gate_prep'
        ),
        chat_messages: (legacyData.chat_messages || []).filter(
          c => c.workspace_id === 'ws_gate_prep'
        )
      };
      fs.writeFileSync(examPrepDbFile, JSON.stringify(examPrepData, null, 2), 'utf8');
      console.log('[EduMind DB] Migrated exam prep data to exam_prep_db.json');
    } else {
      fs.writeFileSync(examPrepDbFile, JSON.stringify(initialExamPrepStore, null, 2), 'utf8');
    }
  }
}

ensureDatabasesInitialized();

// Database Accessors for Landing Page
export function readLandingStore() {
  try {
    const raw = fs.readFileSync(landingDbFile, 'utf8');
    const data = JSON.parse(raw);
    if (!data.users) data.users = [];
    if (!data.workspaces) data.workspaces = initialLandingStore.workspaces;
    if (!data.sources) data.sources = [];
    if (!data.quizzes) data.quizzes = [];
    if (!data.exam_attempts) data.exam_attempts = [];
    if (!data.chat_messages) data.chat_messages = [];
    return data;
  } catch (err) {
    console.error('[EduMind Landing DB] Error reading store, returning initial:', err.message);
    return { ...initialLandingStore };
  }
}

export function writeLandingStore(data) {
  try {
    fs.writeFileSync(landingDbFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[EduMind Landing DB] Error writing store:', err);
  }
}

// Database Accessors for Exam Prep Dashboard
export function readExamPrepStore() {
  try {
    const raw = fs.readFileSync(examPrepDbFile, 'utf8');
    const data = JSON.parse(raw);
    if (!data.users) data.users = [];
    if (!data.exam_prep_questions) data.exam_prep_questions = [];
    if (!data.exam_prep_tests) data.exam_prep_tests = [];
    if (!data.exam_attempts) data.exam_attempts = [];
    if (!data.chat_messages) data.chat_messages = [];
    return data;
  } catch (err) {
    console.error('[EduMind Exam Prep DB] Error reading store, returning initial:', err.message);
    return { ...initialExamPrepStore };
  }
}

export function writeExamPrepStore(data) {
  try {
    fs.writeFileSync(examPrepDbFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[EduMind Exam Prep DB] Error writing store:', err);
  }
}

// Backward-compatibility accessors
export function readFallback() {
  return readLandingStore();
}

export function writeFallback(data) {
  return writeLandingStore(data);
}

let pool = null;
let useFallback = false;

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

    // 1. Workspaces (Landing Page)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) DEFAULT NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        color VARCHAR(50) DEFAULT 'indigo',
        icon VARCHAR(50) DEFAULT 'book',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_workspace_user (user_id)
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

    // 2. Sources (Landing Page)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sources (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) DEFAULT NULL,
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
        INDEX idx_workspace_sources (workspace_id),
        INDEX idx_user_sources (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Quizzes (Landing Page Studio)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        total_questions INT NOT NULL DEFAULT 10,
        questions_json LONGTEXT NOT NULL,
        source_files_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_workspace_quizzes (workspace_id),
        INDEX idx_user_quizzes (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Exam Attempts (Supports Category Column for Strict Separation)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_attempts (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL,
        category VARCHAR(50) DEFAULT 'studio',
        user_id VARCHAR(64) DEFAULT NULL,
        candidate_id VARCHAR(64) DEFAULT NULL,
        user_email VARCHAR(150) DEFAULT NULL,
        user_name VARCHAR(150) DEFAULT NULL,
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
        INDEX idx_attempt_category (category),
        INDEX idx_user_attempts (user_id),
        INDEX idx_candidate_attempts (candidate_id),
        INDEX idx_submitted_at (submitted_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Chat Messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) DEFAULT NULL,
        sender VARCHAR(20) NOT NULL,
        message LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_workspace_chat (workspace_id),
        INDEX idx_user_chat (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Users & Authentication
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash TEXT,
        candidate_id VARCHAR(50),
        target_exam VARCHAR(100) DEFAULT 'GATE CS / IT',
        auth_provider VARCHAR(50) DEFAULT 'local',
        role VARCHAR(50) DEFAULT 'student',
        otp_code VARCHAR(10),
        otp_expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (email),
        INDEX idx_candidate_id (candidate_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Exam Prep Question Bank (Exam Prep Dashboard)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_prep_questions (
        id VARCHAR(64) PRIMARY KEY,
        exam_id VARCHAR(50) DEFAULT 'gate_cs',
        subject_id VARCHAR(64) NOT NULL,
        subject_name VARCHAR(150) NOT NULL,
        topic VARCHAR(150),
        difficulty VARCHAR(50) DEFAULT 'Hard',
        question_text LONGTEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer VARCHAR(10) NOT NULL,
        explanation LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_prep_subject (subject_id),
        INDEX idx_prep_exam (exam_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Exam Prep Tests (Exam Prep Dashboard)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_prep_tests (
        id VARCHAR(64) PRIMARY KEY,
        exam_id VARCHAR(50) DEFAULT 'gate_cs',
        title VARCHAR(255) NOT NULL,
        subject_ids TEXT,
        difficulty VARCHAR(50) DEFAULT 'Hard',
        total_questions INT NOT NULL,
        time_limit_minutes INT NOT NULL,
        questions_json LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_test_exam (exam_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    useFallback = false;
    console.log(`[EduMind DB] Connected to MySQL (${database}) with separated schema.`);
  } catch (err) {
    useFallback = true;
    console.warn(`\n======================================================`);
    console.warn(`[EduMind DB] MySQL connection not available (${err.message}).`);
    console.warn(`[EduMind DB] Dedicated physical JSON databases active:`);
    console.warn(`  1. Landing Page DB:   ${landingDbFile}`);
    console.warn(`  2. Exam Prep Page DB: ${examPrepDbFile}`);
    console.warn(`[EduMind DB] Workspaces, sources, exam prep questions & history are fully separated and persisted.`);
    console.warn(`======================================================\n`);
  }
}

/**
 * Intelligent DB query runner with dedicated store routing
 */
export async function query(sql, params = []) {
  if (!useFallback && pool) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      console.error('[EduMind DB] MySQL error, routing to dedicated fallback:', err.message);
    }
  }

  const lowerSql = sql.trim().toLowerCase();

  // =========================================================================
  // 1. USERS & CANDIDATE AUTHENTICATION (Shared Universal Identity)
  // =========================================================================
  if (lowerSql.startsWith('select * from users')) {
    const landingStore = readLandingStore();
    let list = [...(landingStore.users || [])];
    if (lowerSql.includes('where email =')) {
      const email = (params[0] || '').trim().toLowerCase();
      const found = list.find(u => u.email.toLowerCase() === email);
      return found ? [found] : [];
    }
    if (lowerSql.includes('where id =')) {
      const id = params[0];
      const found = list.find(u => u.id === id);
      return found ? [found] : [];
    }
    return list;
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
      role: email && email.includes('admin') ? 'admin' : 'student',
      otp_code: null,
      otp_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save into Landing DB and sync to Exam Prep DB
    const landingStore = readLandingStore();
    if (!landingStore.users) landingStore.users = [];
    landingStore.users.push(userRecord);
    writeLandingStore(landingStore);

    const examPrepStore = readExamPrepStore();
    if (!examPrepStore.users) examPrepStore.users = [];
    examPrepStore.users.push(userRecord);
    writeExamPrepStore(examPrepStore);

    return { affectedRows: 1, insertId: id };
  }
  if (lowerSql.startsWith('update users set name = ?, candidate_id = ?, target_exam = ? where id = ?')) {
    const [name, candidate_id, target_exam, id] = params;
    const landingStore = readLandingStore();
    const user = (landingStore.users || []).find(u => u.id === id);
    if (user) {
      if (name) user.name = name.trim();
      if (candidate_id) user.candidate_id = candidate_id.trim();
      if (target_exam) user.target_exam = target_exam.trim();
      user.updated_at = new Date().toISOString();
      writeLandingStore(landingStore);

      const examPrepStore = readExamPrepStore();
      const epUser = (examPrepStore.users || []).find(u => u.id === id);
      if (epUser) {
        if (name) epUser.name = name.trim();
        if (candidate_id) epUser.candidate_id = candidate_id.trim();
        if (target_exam) epUser.target_exam = target_exam.trim();
        epUser.updated_at = new Date().toISOString();
        writeExamPrepStore(examPrepStore);
      }
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (lowerSql.startsWith('delete from users where id =')) {
    const id = params[0];
    const landingStore = readLandingStore();
    landingStore.users = (landingStore.users || []).filter(u => u.id !== id);
    if (landingStore.exam_attempts) {
      landingStore.exam_attempts = landingStore.exam_attempts.filter(a => a.user_id !== id);
    }
    writeLandingStore(landingStore);

    const examPrepStore = readExamPrepStore();
    examPrepStore.users = (examPrepStore.users || []).filter(u => u.id !== id);
    if (examPrepStore.exam_attempts) {
      examPrepStore.exam_attempts = examPrepStore.exam_attempts.filter(a => a.user_id !== id);
    }
    writeExamPrepStore(examPrepStore);

    return { affectedRows: 1 };
  }
  if (lowerSql.includes('update users set otp_code = ?, otp_expires_at = ? where email = ?')) {
    const [otp_code, otp_expires_at, email] = params;
    const cleanEmail = (email || '').trim().toLowerCase();
    const landingStore = readLandingStore();
    const user = (landingStore.users || []).find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.otp_code = otp_code;
      user.otp_expires_at = otp_expires_at;
      user.updated_at = new Date().toISOString();
      writeLandingStore(landingStore);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (lowerSql.includes('update users set password_hash = ?, otp_code = null, otp_expires_at = null where email = ?')) {
    const [password_hash, email] = params;
    const cleanEmail = (email || '').trim().toLowerCase();
    const landingStore = readLandingStore();
    const user = (landingStore.users || []).find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.password_hash = password_hash;
      user.otp_code = null;
      user.otp_expires_at = null;
      user.updated_at = new Date().toISOString();
      writeLandingStore(landingStore);

      const examPrepStore = readExamPrepStore();
      const epUser = (examPrepStore.users || []).find(u => u.email.toLowerCase() === cleanEmail);
      if (epUser) {
        epUser.password_hash = password_hash;
        epUser.otp_code = null;
        epUser.otp_expires_at = null;
        epUser.updated_at = new Date().toISOString();
        writeExamPrepStore(examPrepStore);
      }
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // =========================================================================
  // 2. LANDING PAGE & STUDIO WORKSPACES (Dedicated to landing_studio_db.json)
  // =========================================================================
  if (lowerSql.startsWith('select * from workspaces')) {
    const store = readLandingStore();
    let list = store.workspaces || [];
    if (lowerSql.includes('user_id =') || lowerSql.includes('user_id is null')) {
      const p = params[0];
      if (p) {
        list = list.filter(w => !w.user_id || w.user_id === p);
      } else {
        list = list.filter(w => !w.user_id);
      }
    }
    return list;
  }
  if (lowerSql.startsWith('insert into workspaces')) {
    const store = readLandingStore();
    let ws;
    if (params.length >= 6) {
      const [id, name, description, color, icon, user_id] = params;
      ws = {
        id,
        user_id: user_id || null,
        name,
        description: description || '',
        color: color || 'indigo',
        icon: icon || 'book',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      const [id, name, description, color, icon] = params;
      ws = {
        id,
        user_id: null,
        name,
        description: description || '',
        color: color || 'indigo',
        icon: icon || 'book',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    if (!store.workspaces) store.workspaces = [];
    store.workspaces.push(ws);
    writeLandingStore(store);
    return { affectedRows: 1, insertId: ws.id };
  }
  if (lowerSql.startsWith('update workspaces set name = ? where id = ?')) {
    const store = readLandingStore();
    const [name, id] = params;
    const found = (store.workspaces || []).find(w => w.id === id);
    if (found) {
      found.name = name;
      found.updated_at = new Date().toISOString();
      writeLandingStore(store);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (lowerSql.startsWith('delete from workspaces where id =')) {
    const store = readLandingStore();
    const id = params[0];
    store.workspaces = (store.workspaces || []).filter(w => w.id !== id);
    store.sources = (store.sources || []).filter(s => s.workspace_id !== id);
    store.quizzes = (store.quizzes || []).filter(q => q.workspace_id !== id);
    store.exam_attempts = (store.exam_attempts || []).filter(a => a.workspace_id !== id);
    store.chat_messages = (store.chat_messages || []).filter(c => c.workspace_id !== id);
    writeLandingStore(store);
    return { affectedRows: 1 };
  }

  // =========================================================================
  // 3. LANDING PAGE & STUDIO SOURCES (Dedicated to landing_studio_db.json)
  // =========================================================================
  if (lowerSql.startsWith('select * from sources')) {
    const store = readLandingStore();
    let list = store.sources || [];
    if (lowerSql.includes('workspace_id =')) {
      const wsId = params[0];
      list = list.filter(s => s.workspace_id === wsId);
      if (lowerSql.includes('user_id =')) {
        const userId = params[1];
        if (userId) {
          list = list.filter(s => s.user_id === userId);
        } else {
          list = list.filter(s => !s.user_id);
        }
      } else if (lowerSql.includes('user_id is null')) {
        list = list.filter(s => !s.user_id);
      }
    } else if (lowerSql.includes('id =')) {
      const id = params[0];
      const found = list.find(s => s.id === id);
      return found ? [found] : [];
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (lowerSql.startsWith('insert into sources')) {
    const store = readLandingStore();
    let record;
    if (params.length >= 11) {
      const [id, workspace_id, user_id, original_name, filename, file_path, file_size, mime_type, file_type, is_note, note_content] = params;
      record = {
        id,
        workspace_id: workspace_id || 'ws_default',
        user_id: user_id || null,
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
    } else {
      const [id, workspace_id, original_name, filename, file_path, file_size, mime_type, file_type, is_note, note_content] = params;
      record = {
        id,
        workspace_id: workspace_id || 'ws_default',
        user_id: null,
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
    }
    if (!store.sources) store.sources = [];
    store.sources.unshift(record);
    writeLandingStore(store);
    return { affectedRows: 1, insertId: record.id };
  }
  if (lowerSql.startsWith('delete from sources where id =')) {
    const store = readLandingStore();
    const id = params[0];
    const prevLen = (store.sources || []).length;
    store.sources = (store.sources || []).filter(s => s.id !== id);
    writeLandingStore(store);
    return { affectedRows: prevLen - store.sources.length };
  }

  // =========================================================================
  // 4. LANDING PAGE & STUDIO QUIZZES (Dedicated to landing_studio_db.json)
  // =========================================================================
  if (lowerSql.startsWith('insert into quizzes')) {
    const store = readLandingStore();
    let qRecord;
    if (params.length >= 8) {
      const [id, workspace_id, user_id, title, difficulty, total_questions, questions_json, source_files_json] = params;
      qRecord = {
        id,
        workspace_id: workspace_id || 'ws_default',
        user_id: user_id || null,
        title,
        difficulty,
        total_questions: Number(total_questions),
        questions_json,
        source_files_json,
        created_at: new Date().toISOString()
      };
    } else {
      const [id, workspace_id, title, difficulty, total_questions, questions_json, source_files_json] = params;
      qRecord = {
        id,
        workspace_id: workspace_id || 'ws_default',
        user_id: null,
        title,
        difficulty,
        total_questions: Number(total_questions),
        questions_json,
        source_files_json,
        created_at: new Date().toISOString()
      };
    }
    if (!store.quizzes) store.quizzes = [];
    store.quizzes.unshift(qRecord);
    writeLandingStore(store);
    return { affectedRows: 1, insertId: qRecord.id };
  }

  // =========================================================================
  // 5. EXAM ATTEMPTS (Strict Separation: Studio DB vs Exam Prep DB)
  // =========================================================================
  if (lowerSql.startsWith('select * from exam_attempts where id =')) {
    const id = params[0];
    // Check Landing DB first, then Exam Prep DB
    const landingStore = readLandingStore();
    const foundLanding = (landingStore.exam_attempts || []).find(a => a.id === id);
    if (foundLanding) return [foundLanding];

    const examPrepStore = readExamPrepStore();
    const foundPrep = (examPrepStore.exam_attempts || []).find(a => a.id === id);
    return foundPrep ? [foundPrep] : [];
  }

  if (lowerSql.startsWith('select * from exam_attempts')) {
    const isPrepQuery =
      lowerSql.includes("category = 'examprep'") ||
      lowerSql.includes("workspace_id = 'ws_gate_prep'") ||
      (params.includes('examprep') || params.includes('ws_gate_prep'));

    const isStudioQuery =
      lowerSql.includes("category = 'studio'") ||
      (lowerSql.includes('workspace_id =') && !isPrepQuery);

    let list = [];

    if (isPrepQuery) {
      const examPrepStore = readExamPrepStore();
      list = [...(examPrepStore.exam_attempts || [])];
    } else if (isStudioQuery) {
      const landingStore = readLandingStore();
      list = [...(landingStore.exam_attempts || [])];
    } else {
      // Generic query: aggregate attempts from both dedicated databases
      const landingStore = readLandingStore();
      const examPrepStore = readExamPrepStore();
      list = [...(landingStore.exam_attempts || []), ...(examPrepStore.exam_attempts || [])];
    }

    // Filter by candidate_id or user_id if provided
    if (lowerSql.includes('user_id =') || lowerSql.includes('candidate_id =')) {
      const p1 = params[0];
      const p2 = params[1] || p1;
      list = list.filter(a =>
        (a.user_id && (a.user_id === p1 || a.user_id === p2)) ||
        (a.candidate_id && (a.candidate_id === p1 || a.candidate_id === p2))
      );
    } else if (lowerSql.includes('workspace_id =')) {
      const wsId = params[0];
      if (wsId) {
        list = list.filter(a => a.workspace_id === wsId);
      }
      if (lowerSql.includes('user_id is null')) {
        list = list.filter(a => !a.user_id && !a.candidate_id);
      }
    }

    return list.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  }

  if (lowerSql.startsWith('insert into exam_attempts')) {
    let attempt;
    let isPrep = false;

    if (params.length >= 19) {
      const [
        id, workspace_id, user_id, candidate_id, user_email, user_name,
        quiz_id, quiz_title, difficulty,
        total_questions, attempted_count, correct_count, incorrect_count,
        accuracy_percentage, overall_percentage, time_taken_seconds,
        quiz_json, user_answers_json, question_times_json, category
      ] = params;

      isPrep = category === 'examprep' || workspace_id === 'ws_gate_prep';

      attempt = {
        id,
        workspace_id: workspace_id || (isPrep ? 'ws_gate_prep' : 'ws_default'),
        category: isPrep ? 'examprep' : 'studio',
        user_id: user_id || null,
        candidate_id: candidate_id || null,
        user_email: user_email || null,
        user_name: user_name || null,
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
    } else {
      const [
        id, workspace_id, quiz_id, quiz_title, difficulty,
        total_questions, attempted_count, correct_count, incorrect_count,
        accuracy_percentage, overall_percentage, time_taken_seconds,
        quiz_json, user_answers_json, question_times_json
      ] = params;

      isPrep = workspace_id === 'ws_gate_prep';

      attempt = {
        id,
        workspace_id: workspace_id || 'ws_default',
        category: isPrep ? 'examprep' : 'studio',
        user_id: null,
        candidate_id: null,
        user_email: null,
        user_name: null,
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
    }

    if (isPrep) {
      // Save strictly into Exam Prep Database
      const examPrepStore = readExamPrepStore();
      if (!examPrepStore.exam_attempts) examPrepStore.exam_attempts = [];
      examPrepStore.exam_attempts.unshift(attempt);
      writeExamPrepStore(examPrepStore);
    } else {
      // Save strictly into Landing Studio Database
      const landingStore = readLandingStore();
      if (!landingStore.exam_attempts) landingStore.exam_attempts = [];
      landingStore.exam_attempts.unshift(attempt);
      writeLandingStore(landingStore);
    }

    return { affectedRows: 1, insertId: attempt.id };
  }

  if (lowerSql.startsWith('delete from exam_attempts where id =')) {
    const id = params[0];
    const landingStore = readLandingStore();
    const examPrepStore = readExamPrepStore();

    landingStore.exam_attempts = (landingStore.exam_attempts || []).filter(a => a.id !== id);
    writeLandingStore(landingStore);

    examPrepStore.exam_attempts = (examPrepStore.exam_attempts || []).filter(a => a.id !== id);
    writeExamPrepStore(examPrepStore);

    return { affectedRows: 1 };
  }

  // =========================================================================
  // 6. CHAT MESSAGES (Separated: Landing Studio vs Exam Prep AI Tutor)
  // =========================================================================
  if (lowerSql.startsWith('select * from chat_messages where workspace_id =')) {
    const wsId = params[0];
    const isPrepChat = wsId === 'ws_gate_prep';
    const store = isPrepChat ? readExamPrepStore() : readLandingStore();

    let list = (store.chat_messages || []).filter(c => c.workspace_id === wsId);
    if (lowerSql.includes('user_id =')) {
      const userId = params[1];
      if (userId) {
        list = list.filter(c => c.user_id === userId);
      } else {
        list = list.filter(c => !c.user_id);
      }
    } else if (lowerSql.includes('user_id is null')) {
      list = list.filter(c => !c.user_id);
    }
    return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  if (lowerSql.startsWith('insert into chat_messages')) {
    let msg;
    if (params.length >= 5) {
      const [id, workspace_id, user_id, sender, message] = params;
      msg = {
        id,
        workspace_id: workspace_id || 'ws_default',
        user_id: user_id || null,
        sender,
        message,
        created_at: new Date().toISOString()
      };
    } else {
      const [id, workspace_id, sender, message] = params;
      msg = {
        id,
        workspace_id: workspace_id || 'ws_default',
        user_id: null,
        sender,
        message,
        created_at: new Date().toISOString()
      };
    }

    const isPrepChat = msg.workspace_id === 'ws_gate_prep';
    const store = isPrepChat ? readExamPrepStore() : readLandingStore();
    if (!store.chat_messages) store.chat_messages = [];
    store.chat_messages.push(msg);

    if (isPrepChat) {
      writeExamPrepStore(store);
    } else {
      writeLandingStore(store);
    }

    return { affectedRows: 1, insertId: msg.id };
  }

  if (lowerSql.startsWith('delete from chat_messages where workspace_id =')) {
    const wsId = params[0];
    const isPrepChat = wsId === 'ws_gate_prep';
    const store = isPrepChat ? readExamPrepStore() : readLandingStore();

    if (lowerSql.includes('user_id =')) {
      const userId = params[1];
      store.chat_messages = (store.chat_messages || []).filter(c => !(c.workspace_id === wsId && c.user_id === userId));
    } else if (lowerSql.includes('user_id is null')) {
      store.chat_messages = (store.chat_messages || []).filter(c => !(c.workspace_id === wsId && !c.user_id));
    } else {
      store.chat_messages = (store.chat_messages || []).filter(c => c.workspace_id !== wsId);
    }

    if (isPrepChat) {
      writeExamPrepStore(store);
    } else {
      writeLandingStore(store);
    }

    return { affectedRows: 1 };
  }

  // =========================================================================
  // 7. EXAM PREP QUESTION BANK (Dedicated to exam_prep_db.json)
  // =========================================================================
  if (lowerSql.startsWith('select * from exam_prep_questions')) {
    const store = readExamPrepStore();
    let list = [...(store.exam_prep_questions || [])];
    if (lowerSql.includes('where id =')) {
      const qId = params[0];
      return list.filter(q => q.id === qId);
    }
    if (lowerSql.includes('where subject_id =')) {
      const subId = params[0];
      list = list.filter(q => q.subject_id === subId);
    } else if (lowerSql.includes('where exam_id =')) {
      const examId = params[0];
      list = list.filter(q => q.exam_id === examId);
    }
    if (lowerSql.includes('and difficulty =')) {
      const diff = params[1] || params[0];
      list = list.filter(q => q.difficulty === diff);
    }
    return list;
  }

  if (lowerSql.startsWith('insert into exam_prep_questions')) {
    const store = readExamPrepStore();
    const [
      id, exam_id, subject_id, subject_name, topic, difficulty,
      question_text, option_a, option_b, option_c, option_d,
      correct_answer, explanation
    ] = params;

    const record = {
      id,
      exam_id: exam_id || 'gate_cs',
      subject_id,
      subject_name,
      topic: topic || '',
      difficulty: difficulty || 'Hard',
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation: explanation || '',
      created_at: new Date().toISOString()
    };

    if (!store.exam_prep_questions) store.exam_prep_questions = [];
    const idx = store.exam_prep_questions.findIndex(q => q.id === id);
    if (idx >= 0) {
      store.exam_prep_questions[idx] = record;
    } else {
      store.exam_prep_questions.push(record);
    }
    writeExamPrepStore(store);
    return { affectedRows: 1, insertId: id };
  }

  if (lowerSql.startsWith('delete from exam_prep_questions where id =')) {
    const store = readExamPrepStore();
    const id = params[0];
    store.exam_prep_questions = (store.exam_prep_questions || []).filter(q => q.id !== id);
    writeExamPrepStore(store);
    return { affectedRows: 1 };
  }

  if (lowerSql.startsWith('update exam_prep_questions set')) {
    const store = readExamPrepStore();
    if (lowerSql.includes('marks =') && lowerSql.includes('negative_marks =')) {
      const [
        subject_id, subject_name, topic, difficulty,
        marks, negative_marks,
        question_text, option_a, option_b, option_c, option_d,
        correct_answer, explanation, id
      ] = params;
      const q = (store.exam_prep_questions || []).find(item => item.id === id);
      if (q) {
        if (subject_id) q.subject_id = subject_id;
        if (subject_name) q.subject_name = subject_name;
        if (topic !== undefined) q.topic = topic;
        if (difficulty) q.difficulty = difficulty;
        if (marks !== undefined) q.marks = Number(marks);
        if (negative_marks !== undefined) q.negative_marks = Number(negative_marks);
        if (question_text) q.question_text = question_text;
        if (option_a) q.option_a = option_a;
        if (option_b) q.option_b = option_b;
        if (option_c) q.option_c = option_c;
        if (option_d) q.option_d = option_d;
        if (correct_answer) q.correct_answer = correct_answer;
        if (explanation !== undefined) q.explanation = explanation;
        q.updated_at = new Date().toISOString();
        writeExamPrepStore(store);
        return { affectedRows: 1 };
      }
    } else {
      const [
        subject_id, subject_name, topic, difficulty,
        question_text, option_a, option_b, option_c, option_d,
        correct_answer, explanation, id
      ] = params;
      const q = (store.exam_prep_questions || []).find(item => item.id === id);
      if (q) {
        if (subject_id) q.subject_id = subject_id;
        if (subject_name) q.subject_name = subject_name;
        if (topic !== undefined) q.topic = topic;
        if (difficulty) q.difficulty = difficulty;
        if (question_text) q.question_text = question_text;
        if (option_a) q.option_a = option_a;
        if (option_b) q.option_b = option_b;
        if (option_c) q.option_c = option_c;
        if (option_d) q.option_d = option_d;
        if (correct_answer) q.correct_answer = correct_answer;
        if (explanation !== undefined) q.explanation = explanation;
        q.updated_at = new Date().toISOString();
        writeExamPrepStore(store);
        return { affectedRows: 1 };
      }
    }
    return { affectedRows: 0 };
  }

  // =========================================================================
  // 8. EXAM PREP TESTS (Dedicated to exam_prep_db.json)
  // =========================================================================
  if (lowerSql.startsWith('select * from exam_prep_tests')) {
    const store = readExamPrepStore();
    let list = [...(store.exam_prep_tests || [])];
    if (lowerSql.includes('where id =')) {
      const tId = params[0];
      return list.filter(t => t.id === tId);
    }
    if (lowerSql.includes('where exam_id =')) {
      const examId = params[0];
      list = list.filter(t => t.exam_id === examId);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (lowerSql.startsWith('insert into exam_prep_tests')) {
    const store = readExamPrepStore();
    const [id, exam_id, title, subject_ids, difficulty, total_questions, time_limit_minutes, questions_json] = params;
    const testRecord = {
      id,
      exam_id: exam_id || 'gate_cs',
      title,
      subject_ids,
      difficulty: difficulty || 'Hard',
      total_questions: Number(total_questions),
      time_limit_minutes: Number(time_limit_minutes),
      questions_json,
      created_at: new Date().toISOString()
    };
    if (!store.exam_prep_tests) store.exam_prep_tests = [];
    store.exam_prep_tests.unshift(testRecord);
    writeExamPrepStore(store);
    return { affectedRows: 1, insertId: id };
  }

  if (lowerSql.startsWith('delete from exam_prep_tests where id =')) {
    const store = readExamPrepStore();
    const id = params[0];
    store.exam_prep_tests = (store.exam_prep_tests || []).filter(t => t.id !== id);
    writeExamPrepStore(store);
    return { affectedRows: 1 };
  }

  return [];
}

export default {
  initDB,
  query,
  readLandingStore,
  writeLandingStore,
  readExamPrepStore,
  writeExamPrepStore,
  readFallback,
  writeFallback
};
