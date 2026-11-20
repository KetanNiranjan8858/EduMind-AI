import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { GATE_SUBJECTS_METADATA } from './examPrepController.js';

/**
 * 1. GET /api/admin/students
 * Aggregated student roster with performance summaries
 */
export async function getAllStudents(req, res) {
  try {
    const users = await db.query('SELECT * FROM users');
    const attempts = await db.query('SELECT * FROM exam_attempts');

    // Group attempts by user_id and candidate_id
    const attemptsByUser = {};
    for (const a of attempts) {
      const uKey = a.user_id || a.candidate_id || 'unknown';
      if (!attemptsByUser[uKey]) attemptsByUser[uKey] = [];
      attemptsByUser[uKey].push(a);

      if (a.candidate_id && a.candidate_id !== uKey) {
        if (!attemptsByUser[a.candidate_id]) attemptsByUser[a.candidate_id] = [];
        attemptsByUser[a.candidate_id].push(a);
      }
    }

    const students = users.map((u) => {
      const userAttempts = [
        ...(attemptsByUser[u.id] || []),
        ...(u.candidate_id ? (attemptsByUser[u.candidate_id] || []) : [])
      ];

      // Deduplicate by attempt ID
      const uniqueAttemptsMap = new Map();
      userAttempts.forEach((att) => uniqueAttemptsMap.set(att.id, att));
      const uniqueAttempts = Array.from(uniqueAttemptsMap.values());

      const totalTests = uniqueAttempts.length;
      const totalAttempted = uniqueAttempts.reduce((sum, a) => sum + (Number(a.attempted_count) || 0), 0);
      const totalCorrect = uniqueAttempts.reduce((sum, a) => sum + (Number(a.correct_count) || 0), 0);
      const totalQuestions = uniqueAttempts.reduce((sum, a) => sum + (Number(a.total_questions) || 0), 0);
      const totalTimeSeconds = uniqueAttempts.reduce((sum, a) => sum + (Number(a.time_taken_seconds) || 0), 0);

      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
      const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const avgTimePerQuestion = totalAttempted > 0 ? Math.round(totalTimeSeconds / totalAttempted) : 0;

      // Last activity timestamp
      const sortedAttempts = [...uniqueAttempts].sort(
        (a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)
      );
      const lastActive = sortedAttempts[0]?.submitted_at || u.created_at;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        candidateId: u.candidate_id || 'N/A',
        targetExam: u.target_exam || 'GATE CS / IT',
        authProvider: u.auth_provider || 'local',
        createdAt: u.created_at,
        stats: {
          totalTests,
          totalAttempted,
          totalCorrect,
          totalQuestions,
          totalTimeSeconds,
          accuracy,
          overallPercentage,
          avgTimePerQuestion,
          lastActive
        }
      };
    });

    // Overall system metrics
    const totalStudents = students.length;
    const totalExamsConducted = attempts.length;
    const totalAttemptedAll = attempts.reduce((sum, a) => sum + (Number(a.attempted_count) || 0), 0);
    const totalCorrectAll = attempts.reduce((sum, a) => sum + (Number(a.correct_count) || 0), 0);
    const systemAvgAccuracy = totalAttemptedAll > 0 ? Math.round((totalCorrectAll / totalAttemptedAll) * 100) : 0;

    const prepQuestions = await db.query('SELECT * FROM exam_prep_questions');

    return res.json({
      success: true,
      metrics: {
        totalStudents,
        totalExamsConducted,
        systemAvgAccuracy,
        totalQuestionsInBank: prepQuestions.length
      },
      students
    });
  } catch (err) {
    console.error('[Admin API] Error getting students:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve students', error: err.message });
  }
}

/**
 * 2. GET /api/admin/students/:userId/performance
 * Detailed drilldown of individual student attempts and subject analytics
 */
export async function getStudentPerformance(req, res) {
  try {
    const { userId } = req.params;
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const student = users && users[0];

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Fetch student's exam attempts
    const allAttempts = await db.query('SELECT * FROM exam_attempts');
    const studentAttempts = allAttempts.filter(
      (a) => a.user_id === userId || (student.candidate_id && a.candidate_id === student.candidate_id)
    ).sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

    // Parse JSON
    const parsedAttempts = studentAttempts.map((a) => {
      const quizObj = typeof a.quiz_json === 'string' ? JSON.parse(a.quiz_json) : (a.quiz_json || {});
      const answersObj = typeof a.user_answers_json === 'string' ? JSON.parse(a.user_answers_json) : (a.user_answers_json || {});
      const timesObj = typeof a.question_times_json === 'string' ? JSON.parse(a.question_times_json) : (a.question_times_json || {});

      return {
        id: a.id,
        quizTitle: a.quiz_title,
        difficulty: a.difficulty,
        category: a.category || (quizObj.track === 'gate_cs' ? 'examprep' : 'studio'),
        totalQuestions: Number(a.total_questions) || 0,
        attemptedCount: Number(a.attempted_count) || 0,
        correctCount: Number(a.correct_count) || 0,
        incorrectCount: Number(a.incorrect_count) || 0,
        accuracyPercentage: Number(a.accuracy_percentage) || 0,
        overallPercentage: Number(a.overall_percentage) || 0,
        timeTakenSeconds: Number(a.time_taken_seconds) || 0,
        submittedAt: a.submitted_at,
        quiz: quizObj,
        userAnswers: answersObj,
        questionTimes: timesObj
      };
    });

    // Subject breakdown
    const subjectStatsMap = {};
    for (const sub of GATE_SUBJECTS_METADATA) {
      if (sub.id !== 'all') {
        subjectStatsMap[sub.id] = {
          subjectId: sub.id,
          subjectName: sub.name,
          attempts: 0,
          attemptedQuestions: 0,
          correctQuestions: 0,
          accuracy: 0,
          totalTime: 0
        };
      }
    }

    parsedAttempts.forEach((att) => {
      const subId = att.quiz?.subjectId;
      if (subId && subjectStatsMap[subId]) {
        subjectStatsMap[subId].attempts += 1;
        subjectStatsMap[subId].attemptedQuestions += att.attemptedCount;
        subjectStatsMap[subId].correctQuestions += att.correctCount;
        subjectStatsMap[subId].totalTime += att.timeTakenSeconds;
      } else {
        // Match by title
        for (const [sId, sMeta] of Object.entries(subjectStatsMap)) {
          if (
            att.quizTitle?.toLowerCase().includes(sMeta.subjectName.toLowerCase()) ||
            att.quizTitle?.toLowerCase().includes(sId)
          ) {
            sMeta.attempts += 1;
            sMeta.attemptedQuestions += att.attemptedCount;
            sMeta.correctQuestions += att.correctCount;
            sMeta.totalTime += att.timeTakenSeconds;
            break;
          }
        }
      }
    });

    const subjectBreakdown = Object.values(subjectStatsMap).map((s) => ({
      ...s,
      accuracy: s.attemptedQuestions > 0 ? Math.round((s.correctQuestions / s.attemptedQuestions) * 100) : 0
    }));

    return res.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        candidateId: student.candidate_id,
        targetExam: student.target_exam,
        createdAt: student.created_at
      },
      summary: {
        totalTests: parsedAttempts.length,
        totalAttempted: parsedAttempts.reduce((s, a) => s + a.attemptedCount, 0),
        totalCorrect: parsedAttempts.reduce((s, a) => s + a.correctCount, 0),
        avgAccuracy:
          parsedAttempts.length > 0
            ? Math.round(
                parsedAttempts.reduce((s, a) => s + a.accuracyPercentage, 0) / parsedAttempts.length
              )
            : 0,
        totalTimeSpent: parsedAttempts.reduce((s, a) => s + a.timeTakenSeconds, 0)
      },
      subjectBreakdown,
      attempts: parsedAttempts
    });
  } catch (err) {
    console.error('[Admin API] Error getting student performance:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve performance', error: err.message });
  }
}

/**
 * 3. PUT /api/admin/students/:userId
 * Update student profile info
 */
export async function updateStudent(req, res) {
  try {
    const { userId } = req.params;
    const { name, candidateId, targetExam } = req.body;

    await db.query(
      'UPDATE users SET name = ?, candidate_id = ?, target_exam = ? WHERE id = ?',
      [name || '', candidateId || '', targetExam || '', userId]
    );

    return res.json({ success: true, message: 'Student information updated successfully.' });
  } catch (err) {
    console.error('[Admin API] Error updating student:', err);
    return res.status(500).json({ success: false, message: 'Failed to update student', error: err.message });
  }
}

/**
 * 4. DELETE /api/admin/students/:userId
 * Delete a student from the system
 */
export async function deleteStudent(req, res) {
  try {
    const { userId } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    return res.json({ success: true, message: 'Student account deleted successfully.' });
  } catch (err) {
    console.error('[Admin API] Error deleting student:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete student', error: err.message });
  }
}

/**
 * 5. GET /api/admin/questions
 * Comprehensive query of exam prep questions with subject/topic/difficulty filtering and pagination
 */
export async function getAdminQuestions(req, res) {
  try {
    const { examId = 'gate_cs', subjectId, topic, difficulty, search, page = 1, limit = 50 } = req.query;

    let rows = await db.query('SELECT * FROM exam_prep_questions WHERE exam_id = ?', [examId]);

    if (subjectId && subjectId !== 'all') {
      rows = rows.filter((q) => q.subject_id === subjectId);
    }

    if (topic && topic !== 'all') {
      rows = rows.filter((q) => q.topic?.toLowerCase() === topic.toLowerCase());
    }

    if (difficulty && difficulty !== 'all') {
      rows = rows.filter((q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase());
    }

    if (search && search.trim()) {
      const qLower = search.trim().toLowerCase();
      rows = rows.filter(
        (q) =>
          q.question_text?.toLowerCase().includes(qLower) ||
          q.option_a?.toLowerCase().includes(qLower) ||
          q.option_b?.toLowerCase().includes(qLower) ||
          q.option_c?.toLowerCase().includes(qLower) ||
          q.option_d?.toLowerCase().includes(qLower) ||
          q.explanation?.toLowerCase().includes(qLower) ||
          q.topic?.toLowerCase().includes(qLower)
      );
    }

    const total = rows.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = rows.slice(startIndex, startIndex + limitNum);

    const questions = paginated.map((q) => ({
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
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      questions
    });
  } catch (err) {
    console.error('[Admin API] Error getting questions:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve questions', error: err.message });
  }
}

/**
 * 6. POST /api/admin/questions
 * Upload / create a single new exam prep question with custom parameters
 */
export async function createAdminQuestion(req, res) {
  try {
    const {
      examId = 'gate_cs',
      subjectId,
      subjectName,
      topic = '',
      difficulty = 'Hard',
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation = ''
    } = req.body;

    if (!questionText || !questionText.trim()) {
      return res.status(400).json({ success: false, message: 'Question text is required.' });
    }
    if (!optionA || !optionB || !optionC || !optionD) {
      return res.status(400).json({ success: false, message: 'All four options (A, B, C, D) are required.' });
    }
    if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Valid correct answer (A, B, C, or D) is required.' });
    }
    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Subject ID is required.' });
    }

    // Lookup subject name if not passed
    const subMeta = GATE_SUBJECTS_METADATA.find((s) => s.id === subjectId);
    const finalSubjectName = subjectName || subMeta?.name || subjectId;

    const id = `gate_${subjectId}_${Date.now()}_${uuidv4().slice(0, 6)}`;

    await db.query(
      `INSERT INTO exam_prep_questions (
        id, exam_id, subject_id, subject_name, topic, difficulty,
        question_text, option_a, option_b, option_c, option_d,
        correct_answer, explanation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        examId,
        subjectId,
        finalSubjectName,
        topic.trim(),
        difficulty,
        questionText.trim(),
        optionA.trim(),
        optionB.trim(),
        optionC.trim(),
        optionD.trim(),
        correctAnswer.toUpperCase(),
        explanation.trim()
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Question successfully added to Exam Prep Question Bank.',
      questionId: id
    });
  } catch (err) {
    console.error('[Admin API] Error creating question:', err);
    return res.status(500).json({ success: false, message: 'Failed to create question', error: err.message });
  }
}

/**
 * 7. POST /api/admin/questions/bulk
 * Bulk upload array of questions for exam prep
 */
export async function bulkCreateAdminQuestions(req, res) {
  try {
    const { questions, examId = 'gate_cs' } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Questions must be a non-empty array.' });
    }

    let addedCount = 0;
    for (const q of questions) {
      if (!q.question && !q.questionText) continue;
      const qText = q.question || q.questionText;
      const optA = q.options?.A || q.optionA || q.option_a;
      const optB = q.options?.B || q.optionB || q.option_b;
      const optC = q.options?.C || q.optionC || q.option_c;
      const optD = q.options?.D || q.optionD || q.option_d;
      const cAns = (q.correctAnswer || q.correct_answer || 'A').toUpperCase();
      const sId = q.subjectId || q.subject_id || 'math';
      const subMeta = GATE_SUBJECTS_METADATA.find((s) => s.id === sId);
      const sName = q.subjectName || q.subject_name || subMeta?.name || sId;
      const topic = q.topic || sName;
      const diff = q.difficulty || 'Hard';
      const expl = q.explanation || '';

      const id = `gate_${sId}_${Date.now()}_${uuidv4().slice(0, 6)}`;

      await db.query(
        `INSERT INTO exam_prep_questions (
          id, exam_id, subject_id, subject_name, topic, difficulty,
          question_text, option_a, option_b, option_c, option_d,
          correct_answer, explanation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          examId,
          sId,
          sName,
          topic,
          diff,
          qText,
          optA || 'Option A',
          optB || 'Option B',
          optC || 'Option C',
          optD || 'Option D',
          cAns,
          expl
        ]
      );
      addedCount++;
    }

    return res.status(201).json({
      success: true,
      addedCount,
      message: `Successfully uploaded ${addedCount} questions into Exam Prep Question Bank.`
    });
  } catch (err) {
    console.error('[Admin API] Error bulk creating questions:', err);
    return res.status(500).json({ success: false, message: 'Failed to bulk upload questions', error: err.message });
  }
}

/**
 * 8. PUT /api/admin/questions/:id
 * Edit existing question parameters
 */
export async function updateAdminQuestion(req, res) {
  try {
    const { id } = req.params;
    const {
      subjectId,
      subjectName,
      topic,
      difficulty,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation
    } = req.body;

    const subMeta = GATE_SUBJECTS_METADATA.find((s) => s.id === subjectId);
    const finalSubjectName = subjectName || subMeta?.name || subjectId;

    await db.query(
      `UPDATE exam_prep_questions SET
        subject_id = ?, subject_name = ?, topic = ?, difficulty = ?,
        question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?,
        correct_answer = ?, explanation = ?
      WHERE id = ?`,
      [
        subjectId,
        finalSubjectName,
        topic,
        difficulty,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer ? correctAnswer.toUpperCase() : 'A',
        explanation,
        id
      ]
    );

    return res.json({ success: true, message: 'Question updated successfully.' });
  } catch (err) {
    console.error('[Admin API] Error updating question:', err);
    return res.status(500).json({ success: false, message: 'Failed to update question', error: err.message });
  }
}

/**
 * 9. DELETE /api/admin/questions/:id
 * Remove question from Exam Prep question bank
 */
export async function deleteAdminQuestion(req, res) {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM exam_prep_questions WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Question removed from Exam Prep bank.' });
  } catch (err) {
    console.error('[Admin API] Error deleting question:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete question', error: err.message });
  }
}

/**
 * 10. GET /api/admin/topics
 * Get unique topics grouped by subject
 */
export async function getAdminTopics(req, res) {
  try {
    const { examId = 'gate_cs', subjectId } = req.query;
    let questions = await db.query('SELECT * FROM exam_prep_questions WHERE exam_id = ?', [examId]);
    if (subjectId && subjectId !== 'all') {
      questions = questions.filter((q) => q.subject_id === subjectId);
    }

    const topicsBySubject = {};
    for (const q of questions) {
      if (!topicsBySubject[q.subject_id]) topicsBySubject[q.subject_id] = new Set();
      if (q.topic) topicsBySubject[q.subject_id].add(q.topic);
    }

    const formatted = {};
    for (const [sId, set] of Object.entries(topicsBySubject)) {
      formatted[sId] = Array.from(set);
    }

    return res.json({
      success: true,
      topics: formatted
    });
  } catch (err) {
    console.error('[Admin API] Error getting topics:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve topics', error: err.message });
  }
}

/**
 * 11. POST /api/admin/verify
 * Authenticate and verify administrator credentials / security passcode
 */
export async function verifyAdminPasscode(req, res) {
  try {
    const { passcode, email, password } = req.body;

    const MASTER_PASSCODES = [
      'admin123',
      'admin',
      'edumindadmin',
      'EduMind@Admin2026',
      process.env.ADMIN_PASSCODE
    ].filter(Boolean);

    // Check passcode match
    if (passcode && MASTER_PASSCODES.includes(passcode.trim())) {
      return res.json({
        success: true,
        message: 'Admin authorization granted',
        role: 'admin'
      });
    }

    // Check credentials match if email/password provided
    if (email && password) {
      const cleanEmail = email.trim().toLowerCase();
      const rows = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
      const user = rows && rows[0];
      if (user && (user.role === 'admin' || cleanEmail === 'ketanniranjan996@gmail.com' || cleanEmail.includes('admin'))) {
        return res.json({
          success: true,
          message: 'Admin account verified',
          role: 'admin',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            candidateId: user.candidate_id,
            role: 'admin'
          }
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid administrator passcode or insufficient permissions.'
    });
  } catch (err) {
    console.error('[Admin API] Error verifying admin:', err);
    return res.status(500).json({ success: false, message: 'Verification failed', error: err.message });
  }
}
