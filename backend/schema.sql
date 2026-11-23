-- =========================================================================
-- EduMind AI — Dual Relational Database Architecture
-- 1. Database A: edumind_studio_db   (Landing Page, Central Studio & Workspaces)
-- 2. Database B: edumind_examprep_db (Exam Prep Dashboard & Question Bank)
-- Compatible with MySQL 8.0+ / MariaDB / Cloud Relational Engines
-- =========================================================================

-- #########################################################################
-- DATABASE 1: LANDING PAGE & CENTRAL STUDIO DATABASE (edumind_studio_db)
-- Holds workspaces, uploaded lecture notes/files, AI quizzes, and studio chat
-- #########################################################################

CREATE DATABASE IF NOT EXISTS edumind_studio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edumind_studio_db;

-- 1.1 USERS & CANDIDATE AUTHENTICATION (Landing Studio Accounts)
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

-- 1.2 WORKSPACES (Landing Page User Study Spaces)
CREATE TABLE IF NOT EXISTS workspaces (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) DEFAULT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT 'indigo',
  icon VARCHAR(50) DEFAULT 'book',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_workspace_user (user_id),
  CONSTRAINT fk_workspace_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1.3 SOURCES (Uploaded PDFs, Documents, & Notes for Studio Grounding)
CREATE TABLE IF NOT EXISTS sources (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) DEFAULT NULL,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type VARCHAR(100) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'pdf', 'image', 'video', 'text', 'note'
  is_note BOOLEAN DEFAULT FALSE,
  note_content LONGTEXT,
  gemini_file_uri VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_workspace_sources (workspace_id),
  INDEX idx_user_sources (user_id),
  CONSTRAINT fk_source_workspace FOREIGN KEY (workspace_id) 
    REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_source_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1.4 STUDIO QUIZZES (Assessments generated from uploaded documents)
CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  difficulty VARCHAR(50) NOT NULL, -- 'Easy', 'Medium', 'Hard'
  total_questions INT NOT NULL DEFAULT 10,
  questions_json LONGTEXT NOT NULL,
  source_files_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_workspace_quizzes (workspace_id),
  INDEX idx_user_quizzes (user_id),
  CONSTRAINT fk_quiz_workspace FOREIGN KEY (workspace_id) 
    REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1.5 STUDIO EXAM ATTEMPTS (Attempts taken on document-based assessments)
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
  INDEX idx_user_attempts (user_id),
  INDEX idx_candidate_attempts (candidate_id),
  INDEX idx_submitted_at (submitted_at DESC),
  CONSTRAINT fk_attempt_workspace FOREIGN KEY (workspace_id) 
    REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1.6 STUDIO CHAT MESSAGES (Conversational History with Workspace Grounding)
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) DEFAULT NULL,
  sender VARCHAR(20) NOT NULL, -- 'user' or 'ai'
  message LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_workspace_chat (workspace_id),
  INDEX idx_user_chat (user_id),
  INDEX idx_chat_created (created_at ASC),
  CONSTRAINT fk_chat_workspace FOREIGN KEY (workspace_id) 
    REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- #########################################################################
-- DATABASE 2: EXAM PREP DASHBOARD DATABASE (edumind_examprep_db)
-- Dedicated to Official GATE CS/IT Question Bank, Mock Tests & Performance
-- #########################################################################

CREATE DATABASE IF NOT EXISTS edumind_examprep_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edumind_examprep_db;

-- 2.1 CANDIDATE USER MIRROR (Synced Candidate Accounts for Exam Prep)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT,
  candidate_id VARCHAR(50),
  target_exam VARCHAR(100) DEFAULT 'GATE CS / IT',
  auth_provider VARCHAR(50) DEFAULT 'local',
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_email (email),
  INDEX idx_candidate_id (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.2 EXAM PREP QUESTION BANK (Categorized by Subject, Topic, Difficulty)
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
  correct_answer VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', 'D'
  explanation LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prep_subject (subject_id),
  INDEX idx_prep_exam (exam_id),
  INDEX idx_prep_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.3 EXAM PREP TESTS (Generated Mock Test Papers & Official Simulations)
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

-- 2.4 EXAM PREP ATTEMPTS (Dedicated Official Mock Test Scores & Attempt Records)
CREATE TABLE IF NOT EXISTS exam_attempts (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) DEFAULT 'ws_gate_prep',
  category VARCHAR(50) DEFAULT 'examprep',
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
  INDEX idx_user_attempts (user_id),
  INDEX idx_candidate_attempts (candidate_id),
  INDEX idx_submitted_at (submitted_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.5 EXAM PREP AI TUTOR CHAT (Conversations with GATE Concept Tutor)
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  workspace_id VARCHAR(64) DEFAULT 'ws_gate_prep',
  user_id VARCHAR(64) DEFAULT NULL,
  sender VARCHAR(20) NOT NULL,
  message LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_chat (user_id),
  INDEX idx_chat_created (created_at ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
