# EduMind AI 🎓⚡

**EduMind AI** is an advanced, full-stack educational platform and Computer-Based Testing (CBT) engine designed to transform raw study materials (PDFs, notes, media, lecture transcripts) into highly interactive, professional-grade assessments rivaling competitive exam portals like **GATE** and **TCS NQT**.

---

## 🏗️ Architecture & Technology Stack

* **Frontend:** React.js (Vite) + Tailwind CSS (sleek dark theme).
  * Fast state management with cross-tab persistence via `localStorage`.
  * Multi-panel layout: **Source Management** (Left), **Conversational Chat Hub** (Center), **AI Studio** (Right).
  * Standalone dedicated **CBT Exam Portal** (`/exam` or `?mode=cbt`).
  * **Analytics & Review Dashboard** with exact time-tracking per question and Gemini AI explanations.
* **Backend:** Node.js + Express.js API routing, Multer multi-modal file ingestion, and AI orchestration.
* **Database:** MySQL for persistent storage of metadata for uploaded documents and user notes (with automatic, resilient zero-config fallback if MySQL is not yet configured).
* **AI Engine:** Google Gemini API (`gemini-2.5-flash`) via the `@google/genai` SDK and File API for structured JSON generation strictly without hallucinations.

---

## 🚀 Key Modules & Workflows

### 1. The Central Workspace & Source Management (Left Panel)
* **Multi-Modal Uploads:** Upload PDFs, markdown/text notes, images, and videos via custom Multer integration into `server/uploads/`.
* **Note Creation Modal:** Compose lecture notes and formulas directly; saved physically as `.txt` files for Gemini analysis.
* **Custom Context Menu:** Right-click on any source to preview, toggle selection for the AI Studio, or delete from disk and database.

### 2. The Conversational Chat Hub (Center Panel)
* Conversational workspace powered by Gemini 2.5 Flash grounded strictly in selected source materials.
* Ask questions, derive formulas, request practice drills, or inspect notes.

### 3. The AI Studio (Right Panel)
* **Contextual Selection:** Automatically tracks which documents and notes are selected from the Sources panel.
* **Parameters:** Select difficulty (**Easy**, **Medium**, **Hard**, **GATE Level**) and question count (1 to 30 questions).
* **Recent Outputs:** Generated quizzes appear as interactive cards with instant CBT launch buttons.

### 4. Professional Exam Environment (CBT Tab)
* **Isolated Environment:** Spawns a dedicated browser tab via `localStorage` handoff (`edumind_active_exam`).
* **Split-Screen Exam Interface:**
  * **Left:** Question text, formulas, interactive radio buttons (A, B, C, D), *Clear Response*, *Mark for Review & Next*, *Save & Next*.
  * **Right:** Color-coded question palette grid (🟢 Answered, 🔴 Not Answered, 🔵 Marked for Review, ⚪ Not Visited).
* **Dual-Timer System:**
  * **Total Paper Countdown:** Starts at 60s per question with auto-submit when hitting 00:00.
  * **Per-Question Time Tracker:** Silently records exact active seconds spent on each question.

### 5. Analytics & Review Dashboard
* Transitions immediately upon submission.
* **Performance Summary:** Total Score, Strict Accuracy % (attempted only, preventing inflated metrics), and Average Time per question.
* **Detailed Review:** Question-by-question breakdown, user choice vs. correct answer, exact time spent on each question, and step-by-step Gemini AI solutions.

---

## 🛠️ Key Engineering Triumphs

1. **Cross-Tab State Management:** `localStorage` handoff cleanly bridges data between the dashboard and the CBT exam tab without cluttering the database.
2. **Crash Prevention (`getSafeOptions`):** Intercepts and normalizes all variations of LLM option formatting (arrays, objects, strings) to prevent any UI crashes or "White Screens of Death."
3. **Strict Scoring Logic:** Bulletproof calculation preventing NaN and impossible accuracy percentages (e.g. 175%) on unattempted questions or edge cases.

---

## ⚡ Quick Start

### 1. Install Dependencies
Run in both `server/` and `client/`:
```bash
# In server/
cd server
npm install

# In client/
cd ../client
npm install
```

### 2. Configure Environment (`server/.env`)
Edit `server/.env` with your settings:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here

# MySQL Configuration (Optional: automatically uses resilient local store if MySQL is not running)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=edumind_db
DB_PORT=3306
```

### 3. Start Development Servers
```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm start

# Terminal 2: Frontend Client (runs on http://localhost:3000)
cd client
npm run dev
```

Open `http://localhost:3000` in your browser. You can immediately click **"Try GATE CBT Exam"** in the top navigation bar to test the full CBT engine and analytics!
