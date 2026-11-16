-- ==========================================================
-- EduMind AI — Complete Relational Database Schema
-- Multi-User Account Protection & Per-User Content Isolation
-- Compatible with MySQL 8.0+ / MariaDB
-- ==========================================================

CREATE DATABASE IF NOT EXISTS edumind_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edumind_db;

-- 1. USERS & CANDIDATE AUTHENTICATION
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
  INDEX idx_user_email (email),
  INDEX idx_candidate_id (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. WORKSPACES
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

-- 3. SOURCES (Files & Lecture Notes - Tied to User ID)
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

-- 4. QUIZZES (Generated Assessments)
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

-- 5. EXAM ATTEMPTS (Exam History Linked to Candidate & User ID)
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
  INDEX idx_submitted_at (submitted_at DESC),
  CONSTRAINT fk_attempt_workspace FOREIGN KEY (workspace_id) 
    REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. CHAT MESSAGES (Workspace Conversational History Linked to User ID)
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
