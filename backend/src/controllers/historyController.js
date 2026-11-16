import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

export async function getExamHistory(req, res) {
  try {
    const { workspaceId = 'ws_default', userId, candidateId } = req.query;

    let history = [];
    if (userId || candidateId) {
      // Query history for that specific logged-in ID
      const queryId = userId || candidateId;
      history = await db.query(
        'SELECT * FROM exam_attempts WHERE user_id = ? OR candidate_id = ? ORDER BY submitted_at DESC',
        [queryId, candidateId || queryId]
      );
    } else {
      // Fallback to workspace history if not logged in
      history = await db.query(
        'SELECT * FROM exam_attempts WHERE workspace_id = ? ORDER BY submitted_at DESC',
        [workspaceId]
      );
    }

    // Parse JSON fields if they are strings
    const parsed = history.map(item => ({
      ...item,
      quiz: typeof item.quiz_json === 'string' ? JSON.parse(item.quiz_json) : item.quiz_json,
      userAnswers: typeof item.user_answers_json === 'string' ? JSON.parse(item.user_answers_json) : item.user_answers_json,
      questionTimes: typeof item.question_times_json === 'string' ? JSON.parse(item.question_times_json) : item.question_times_json
    }));

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
      stats = {}
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

    await db.query(
      `INSERT INTO exam_attempts (
        id, workspace_id, user_id, candidate_id, user_email, user_name,
        quiz_id, quiz_title, difficulty,
        total_questions, attempted_count, correct_count, incorrect_count,
        accuracy_percentage, overall_percentage, time_taken_seconds,
        quiz_json, user_answers_json, question_times_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        workspaceId,
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
        JSON.stringify(questionTimes)
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Exam attempt saved to candidate history',
      attemptId: id,
      candidateId,
      userId
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
      message: 'Exam attempt removed from history',
      id
    });
  } catch (err) {
    console.error('[History API] Error deleting attempt:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete attempt', error: err.message });
  }
}
