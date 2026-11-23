import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

export async function getExamHistory(req, res) {
  try {
    const { workspaceId = 'ws_default', userId, candidateId, category } = req.query;

    let history = [];
    if (userId || candidateId) {
      // Query history for that specific logged-in ID
      const queryId = userId || candidateId;
      if (category) {
        history = await db.query(
          'SELECT * FROM exam_attempts WHERE category = ? AND (user_id = ? OR candidate_id = ?) ORDER BY submitted_at DESC',
          [category, queryId, candidateId || queryId]
        );
      } else {
        history = await db.query(
          'SELECT * FROM exam_attempts WHERE user_id = ? OR candidate_id = ? ORDER BY submitted_at DESC',
          [queryId, candidateId || queryId]
        );
      }
    } else {
      // When logged out, return attempts for the workspace (guest attempts)
      if (category) {
        history = await db.query(
          'SELECT * FROM exam_attempts WHERE category = ? AND workspace_id = ? AND user_id IS NULL AND candidate_id IS NULL ORDER BY submitted_at DESC',
          [category, workspaceId]
        );
      } else {
        history = await db.query(
          'SELECT * FROM exam_attempts WHERE workspace_id = ? AND user_id IS NULL AND candidate_id IS NULL ORDER BY submitted_at DESC',
          [workspaceId]
        );
      }
    }

    // Parse JSON fields if they are strings
    let parsed = history.map(item => {
      const quizObj = typeof item.quiz_json === 'string' ? JSON.parse(item.quiz_json) : (item.quiz_json || {});
      const userAnswersObj = typeof item.user_answers_json === 'string' ? JSON.parse(item.user_answers_json) : (item.user_answers_json || {});
      const questionTimesObj = typeof item.question_times_json === 'string' ? JSON.parse(item.question_times_json) : (item.question_times_json || {});

      const isExamPrep =
        item.category === 'examprep' ||
        item.workspace_id === 'ws_gate_prep' ||
        quizObj?.track === 'gate_cs' ||
        Boolean(quizObj?.subjectId) ||
        (item.quiz_title && item.quiz_title.toLowerCase().includes('gate'));

      return {
        ...item,
        category: isExamPrep ? 'examprep' : 'studio',
        quiz: quizObj,
        userAnswers: userAnswersObj,
        questionTimes: questionTimesObj
      };
    });

    // Enforce strict database separation between Studio and Exam Prep
    if (category === 'studio') {
      parsed = parsed.filter(item => item.category === 'studio' && item.workspace_id !== 'ws_gate_prep');
    } else if (category === 'examprep') {
      parsed = parsed.filter(item => item.category === 'examprep');
    }

    return res.json({
      success: true,
      history: parsed
    });
  } catch (err) {
    console.error('[History API] Error getting exam history:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch exam history', error: err.message });
  }
}

export async function saveExamAttempt(req, res) {
  try {
    const {
      workspaceId = 'ws_default',
      userId = null,
      candidateId = null,
      userEmail = null,
      userName = null,
      quiz,
      userAnswers = {},
      questionTimes = {},
      timeTakenSeconds = 0,
      stats = {},
      category = null
    } = req.body;

    if (!quiz) {
      return res.status(400).json({ success: false, message: 'Quiz object is required to save attempt.' });
    }

    const id = `att_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const quizTitle = quiz.quizTitle || 'Practice Assessment';
    const difficulty = quiz.difficulty || 'Medium';
    const totalQuestions = quiz.questions?.length || 0;
    const attemptedCount = stats.attemptedCount !== undefined ? stats.attemptedCount : Object.keys(userAnswers).length;
    const correctCount = stats.correctCount || 0;
    const incorrectCount = stats.incorrectCount || 0;
    const accuracyPercentage = stats.accuracyPercentage || 0;
    const overallPercentage = stats.overallPercentage || 0;

    // Strict separation: Determine whether this attempt belongs to Exam Prep or Studio
    const isExamPrep =
      category === 'examprep' ||
      workspaceId === 'ws_gate_prep' ||
      quiz?.track === 'gate_cs' ||
      Boolean(quiz?.subjectId) ||
      quizTitle.toLowerCase().includes('gate');

    const effectiveCategory = isExamPrep ? 'examprep' : 'studio';
    const effectiveWorkspaceId = isExamPrep ? 'ws_gate_prep' : (workspaceId || 'ws_default');

    await db.query(
      `INSERT INTO exam_attempts (
        id, workspace_id, user_id, candidate_id, user_email, user_name,
        quiz_id, quiz_title, difficulty,
        total_questions, attempted_count, correct_count, incorrect_count,
        accuracy_percentage, overall_percentage, time_taken_seconds,
        quiz_json, user_answers_json, question_times_json, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        effectiveWorkspaceId,
        userId,
        candidateId,
        userEmail,
        userName,
        quiz.id || id,
        quizTitle,
        difficulty,
        totalQuestions,
        attemptedCount,
        correctCount,
        incorrectCount,
        accuracyPercentage,
        overallPercentage,
        timeTakenSeconds,
        JSON.stringify(quiz),
        JSON.stringify(userAnswers),
        JSON.stringify(questionTimes),
        effectiveCategory
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Exam attempt saved to ${effectiveCategory === 'examprep' ? 'Exam Prep' : 'Studio'} history`,
      attemptId: id,
      candidateId,
      userId,
      category: effectiveCategory
    });
  } catch (err) {
    console.error('[History API] Error saving exam attempt:', err);
    return res.status(500).json({ success: false, message: 'Failed to save exam attempt', error: err.message });
  }
}

export async function deleteExamAttempt(req, res) {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM exam_attempts WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Exam attempt deleted successfully'
    });
  } catch (err) {
    console.error('[History API] Error deleting exam attempt:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete exam attempt', error: err.message });
  }
}
