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
  chat_messages: [],
  exam_prep_questions: [],
  exam_prep_tests: []
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
    if (!data.exam_prep_questions) data.exam_prep_questions = [];
    if (!data.exam_prep_tests) data.exam_prep_tests = [];
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
        'INSERT INTO workspaces (id, name, description, color, icon, user_id) VALUES (?, ?, ?, ?, ?, ?)',
        ['ws_default', 'General Study Workspace', 'Default study space for documents, notes, and assessments', 'indigo', 'book', null]
      );
    }

    // 2. Sources (Tied to User ID)
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

    // 3. Quizzes
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

    // 4. Exam Attempts (Linked to workspace and candidate user ID)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_attempts (
        id VARCHAR(64) PRIMARY KEY,
        workspace_id VARCHAR(64) NOT NULL,
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
        INDEX idx_user_attempts (user_id),
        INDEX idx_candidate_attempts (candidate_id),
        INDEX idx_submitted_at (submitted_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Chat Messages (Tied to User ID)
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
        role VARCHAR(50) DEFAULT 'student',
        otp_code VARCHAR(10),
        otp_expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Exam Prep Question Bank (Dedicated Database for Official Exam Prep / GATE CS/IT)
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

    // 8. Exam Prep Tests (Generated Assessments from Database Bank)
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
  if (lowerSql.startsWith('select * from users')) {
    let list = [...(store.users || [])];
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
    if (!store.users) store.users = [];
    store.users.push(userRecord);
    writeFallback(store);
    return { affectedRows: 1, insertId: id };
  }
  if (lowerSql.startsWith('update users set name = ?, candidate_id = ?, target_exam = ? where id = ?')) {
    const [name, candidate_id, target_exam, id] = params;
    const user = (store.users || []).find(u => u.id === id);
    if (user) {
      if (name) user.name = name.trim();
      if (candidate_id) user.candidate_id = candidate_id.trim();
      if (target_exam) user.target_exam = target_exam.trim();
      user.updated_at = new Date().toISOString();
      writeFallback(store);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (lowerSql.startsWith('delete from users where id =')) {
    const id = params[0];
    store.users = (store.users || []).filter(u => u.id !== id);
    if (store.exam_attempts) {
      store.exam_attempts = store.exam_attempts.filter(a => a.user_id !== id);
    }
    writeFallback(store);
    return { affectedRows: 1 };
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

  // WORKSPACES (Supports User ID Isolation)
  if (lowerSql.startsWith('select * from workspaces')) {
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
    store.workspaces.push(ws);
    writeFallback(store);
    return { affectedRows: 1, insertId: ws.id };
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

  // SOURCES (Supports User ID Isolation - Does not show after logout)
  if (lowerSql.startsWith('select * from sources')) {
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
    store.sources.unshift(record);
    writeFallback(store);
    return { affectedRows: 1, insertId: record.id };
  }
  if (lowerSql.startsWith('delete from sources where id =')) {
    const id = params[0];
    const prevLen = store.sources.length;
    store.sources = store.sources.filter(s => s.id !== id);
    writeFallback(store);
    return { affectedRows: prevLen - store.sources.length };
  }

  // QUIZZES (Supports User ID Isolation)
  if (lowerSql.startsWith('insert into quizzes')) {
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
    writeFallback(store);
    return { affectedRows: 1, insertId: qRecord.id };
  }

  // EXAM ATTEMPTS (HISTORY) - Supports Candidate ID & User ID
  if (lowerSql.startsWith('select * from exam_attempts where id =')) {
    const id = params[0];
    const found = (store.exam_attempts || []).find(a => a.id === id);
    return found ? [found] : [];
  }
  if (lowerSql.startsWith('select * from exam_attempts')) {
    let list = [...(store.exam_attempts || [])];

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
      list = list.filter(a => a.workspace_id === wsId);
      if (lowerSql.includes('user_id is null')) {
        list = list.filter(a => !a.user_id && !a.candidate_id);
      }
    }

    return list.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  }
  if (lowerSql.startsWith('insert into exam_attempts')) {
    let attempt;
    if (params.length >= 19) {
      const [
        id, workspace_id, user_id, candidate_id, user_email, user_name,
        quiz_id, quiz_title, difficulty,
        total_questions, attempted_count, correct_count, incorrect_count,
        accuracy_percentage, overall_percentage, time_taken_seconds,
        quiz_json, user_answers_json, question_times_json, category
      ] = params;

      attempt = {
        id,
        workspace_id: workspace_id || 'ws_default',
        category: category || (workspace_id === 'ws_gate_prep' ? 'examprep' : 'studio'),
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

      attempt = {
        id,
        workspace_id: workspace_id || 'ws_default',
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

    if (!store.exam_attempts) store.exam_attempts = [];
    store.exam_attempts.unshift(attempt);
    writeFallback(store);
    return { affectedRows: 1, insertId: attempt.id };
  }
  if (lowerSql.startsWith('delete from exam_attempts where id =')) {
    const id = params[0];
    store.exam_attempts = (store.exam_attempts || []).filter(a => a.id !== id);
    writeFallback(store);
    return { affectedRows: 1 };
  }

  // CHAT MESSAGES (Supports User ID Isolation)
  if (lowerSql.startsWith('select * from chat_messages where workspace_id =')) {
    const wsId = params[0];
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
    if (!store.chat_messages) store.chat_messages = [];
    store.chat_messages.push(msg);
    writeFallback(store);
    return { affectedRows: 1, insertId: msg.id };
  }
  if (lowerSql.startsWith('delete from chat_messages where workspace_id =')) {
    const wsId = params[0];
    if (lowerSql.includes('user_id =')) {
      const userId = params[1];
      store.chat_messages = (store.chat_messages || []).filter(c => !(c.workspace_id === wsId && c.user_id === userId));
    } else if (lowerSql.includes('user_id is null')) {
      store.chat_messages = (store.chat_messages || []).filter(c => !(c.workspace_id === wsId && !c.user_id));
    } else {
      store.chat_messages = (store.chat_messages || []).filter(c => c.workspace_id !== wsId);
    }
    writeFallback(store);
    return { affectedRows: 1 };
  }

  // EXAM PREP QUESTION BANK (Dedicated Database for Exam Prep / GATE CS/IT)
  if (lowerSql.startsWith('select * from exam_prep_questions')) {
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
    // If exists, replace; otherwise push
    const idx = store.exam_prep_questions.findIndex(q => q.id === id);
    if (idx >= 0) {
      store.exam_prep_questions[idx] = record;
    } else {
      store.exam_prep_questions.push(record);
    }
    writeFallback(store);
    return { affectedRows: 1, insertId: id };
  }
  if (lowerSql.startsWith('delete from exam_prep_questions where id =')) {
    const id = params[0];
    store.exam_prep_questions = (store.exam_prep_questions || []).filter(q => q.id !== id);
    writeFallback(store);
    return { affectedRows: 1 };
  }
  if (lowerSql.startsWith('update exam_prep_questions set')) {
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
      writeFallback(store);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // EXAM PREP TESTS (Generated CBT Assessments)
  if (lowerSql.startsWith('select * from exam_prep_tests')) {
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
    writeFallback(store);
    return { affectedRows: 1, insertId: id };
  }
  if (lowerSql.startsWith('delete from exam_prep_tests where id =')) {
    const id = params[0];
    store.exam_prep_tests = (store.exam_prep_tests || []).filter(t => t.id !== id);
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
