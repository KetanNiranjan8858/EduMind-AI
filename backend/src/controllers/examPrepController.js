import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

export const GATE_SUBJECTS_METADATA = [
  { id: 'all', name: 'All Subjects (Full GATE Syllabus)', shortName: 'Full Syllabus', icon: 'layers', color: 'rose' },
  { id: 'math', name: 'Engineering & Discrete Mathematics', shortName: 'Mathematics', icon: 'sigma', color: 'purple' },
  { id: 'dl', name: 'Digital Logic', shortName: 'Digital Logic', icon: 'cpu', color: 'amber' },
  { id: 'coa', name: 'Computer Organization & Architecture', shortName: 'COA', icon: 'server', color: 'orange' },
  { id: 'ds', name: 'Programming & Data Structures', shortName: 'Data Structures', icon: 'code', color: 'emerald' },
  { id: 'algo', name: 'Algorithms', shortName: 'Algorithms', icon: 'git-branch', color: 'cyan' },
  { id: 'toc', name: 'Theory of Computation', shortName: 'TOC', icon: 'binary', color: 'indigo' },
  { id: 'cd', name: 'Compiler Design', shortName: 'Compiler Design', icon: 'terminal', color: 'violet' },
  { id: 'os', name: 'Operating Systems', shortName: 'OS', icon: 'activity', color: 'rose' },
  { id: 'dbms', name: 'Database Management Systems', shortName: 'DBMS', icon: 'database', color: 'blue' },
  { id: 'cn', name: 'Computer Networks', shortName: 'Networks', icon: 'network', color: 'teal' }
];

/**
 * GET /api/examprep/questions
 * Retrieve questions from the database bank
 */
export async function getExamPrepQuestions(req, res) {
  try {
    const { subjectId, examId = 'gate_cs', difficulty, limit } = req.query;

    let rows = await db.query('SELECT * FROM exam_prep_questions WHERE exam_id = ?', [examId]);

    if (subjectId && subjectId !== 'all') {
      const allowedSubjectIds = subjectId.split(',').map(s => s.trim());
      rows = rows.filter(q => allowedSubjectIds.includes(q.subject_id));
    }

    if (difficulty && difficulty !== 'all') {
      rows = rows.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (limit) {
      const numLimit = Math.max(1, parseInt(limit, 10) || 100);
      rows = rows.slice(0, numLimit);
    }

    // Format for client
    const formatted = rows.map(q => ({
      id: q.id,
      examId: q.exam_id,
      subjectId: q.subject_id,
      subjectName: q.subject_name,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question_text,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d
      },
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      createdAt: q.created_at
    }));

    return res.json({
      success: true,
      count: formatted.length,
      questions: formatted
    });
  } catch (err) {
    console.error('[ExamPrep API] Error fetching questions:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch exam prep questions', error: err.message });
  }
}

/**
 * GET /api/examprep/subjects
 * Retrieve official subject list with live database question counts
 */
export async function getExamPrepSubjects(req, res) {
  try {
    const questions = await db.query('SELECT * FROM exam_prep_questions WHERE exam_id = ?', ['gate_cs']);

    const countsBySubject = {};
    for (const q of questions) {
      countsBySubject[q.subject_id] = (countsBySubject[q.subject_id] || 0) + 1;
    }

    const subjects = GATE_SUBJECTS_METADATA.map(sub => {
      const questionCount = sub.id === 'all'
        ? questions.length
        : (countsBySubject[sub.id] || 0);

      return {
        ...sub,
        questionCount
      };
    });

    return res.json({
      success: true,
      totalQuestions: questions.length,
      subjects
    });
  } catch (err) {
    console.error('[ExamPrep API] Error fetching subjects:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch subjects', error: err.message });
  }
}

/**
 * POST /api/examprep/generate
 * Generate custom CBT test from database questions and persist to exam_prep_tests
 */
export async function generateExamPrepTest(req, res) {
  try {
    const {
      subjectIds = ['all'],
      difficulty = 'Hard',
      questionCount = 20,
      timeLimitMinutes = null,
      examId = 'gate_cs'
    } = req.body;

    let pool = await db.query('SELECT * FROM exam_prep_questions WHERE exam_id = ?', [examId]);

    const isAll = subjectIds.includes('all') || subjectIds.length === 0;
    if (!isAll) {
      pool = pool.filter(q => subjectIds.includes(q.subject_id));
    }

    if (pool.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found matching criteria.' });
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const count = Math.min(Math.max(1, Number(questionCount) || 10), shuffled.length);
    const selected = shuffled.slice(0, count);

    // Dynamic title and time calculation
    const subjectNames = Array.from(new Set(selected.map(q => q.subject_name)));
    const calculatedTime = timeLimitMinutes
      ? Number(timeLimitMinutes)
      : Math.max(15, Math.round(count * 2.5));

    const title = isAll || subjectNames.length > 3
      ? `GATE CS/IT: Generated Mock Assessment (${count} Questions)`
      : `GATE CS: ${subjectNames.join(', ')} (${count} Questions)`;

    const testId = `test_${Date.now()}_${uuidv4().slice(0, 8)}`;

    const questionsFormatted = selected.map((q, idx) => ({
      id: idx + 1,
      dbQuestionId: q.id,
      subjectId: q.subject_id,
      subjectName: q.subject_name,
      question: q.question_text,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d
      },
      correctAnswer: q.correct_answer,
      explanation: q.explanation
    }));

    // Save test to exam_prep_tests table in database
    try {
      await db.query(
        'INSERT INTO exam_prep_tests (id, exam_id, title, subject_ids, difficulty, total_questions, time_limit_minutes, questions_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          testId,
          examId,
          title,
          isAll ? 'all' : subjectIds.join(','),
          difficulty,
          count,
          calculatedTime,
          JSON.stringify(questionsFormatted)
        ]
      );
    } catch (dbErr) {
      console.warn('[ExamPrep API] Could not persist generated test to DB:', dbErr.message);
    }

    const quiz = {
      id: testId,
      track: 'gate_cs',
      subject: isAll ? 'GATE CS/IT Full Syllabus' : subjectNames.join(', '),
      quizTitle: title,
      difficulty,
      totalQuestions: count,
      timeLimitMinutes: calculatedTime,
      description: `Official benchmark assessment generated from database across ${subjectNames.length} GATE CS/IT subjects. Timed under CBT conditions.`,
      topics: Array.from(new Set(selected.map(q => q.topic))).filter(Boolean).slice(0, 8),
      questions: questionsFormatted,
      generatedAt: Date.now()
    };

    return res.json({
      success: true,
      quiz
    });
  } catch (err) {
    console.error('[ExamPrep API] Error generating test:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate test', error: err.message });
  }
}

/**
 * GET /api/examprep/tests
 * Retrieve past generated tests
 */
export async function getExamPrepTests(req, res) {
  try {
    const { examId = 'gate_cs' } = req.query;
    const tests = await db.query('SELECT * FROM exam_prep_tests WHERE exam_id = ?', [examId]);
    return res.json({
      success: true,
      tests: tests.map(t => ({
        id: t.id,
        examId: t.exam_id,
        title: t.title,
        subjectIds: t.subject_ids,
        difficulty: t.difficulty,
        totalQuestions: t.total_questions,
        timeLimitMinutes: t.time_limit_minutes,
        questions: typeof t.questions_json === 'string' ? JSON.parse(t.questions_json) : (t.questions_json || []),
        createdAt: t.created_at
      }))
    });
  } catch (err) {
    console.error('[ExamPrep API] Error getting tests:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tests', error: err.message });
  }
}
