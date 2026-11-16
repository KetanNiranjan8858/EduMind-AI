import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import * as geminiService from '../services/geminiService.js';

/**
 * Controller to generate structured MCQs strictly from selected sources
 */
export async function generateQuizHandler(req, res) {
  try {
    const { sourceIds, difficulty = 'Medium', questionCount = 5, workspaceId = 'ws_default' } = req.body;

    if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one source document or note to generate a quiz.'
      });
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 1), 30);

    // Fetch source records
    const allSources = await db.query('SELECT * FROM sources ORDER BY created_at DESC');
    const selectedSources = allSources.filter(s => sourceIds.includes(s.id));

    if (selectedSources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'None of the selected sources were found.'
      });
    }

    console.log(`[EduMind AI Controller] Generating ${count} question(s) at difficulty "${difficulty}" from ${selectedSources.length} source(s)...`);

    const quiz = await geminiService.generateQuiz({
      sources: selectedSources,
      difficulty,
      questionCount: count
    });

    // Save generated quiz to quizzes table
    const quizId = `quiz_${Date.now()}_${uuidv4().slice(0, 8)}`;
    quiz.id = quizId;
    quiz.workspaceId = workspaceId;

    try {
      await db.query(
        'INSERT INTO quizzes (id, workspace_id, title, difficulty, total_questions, questions_json, source_files_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          quizId,
          workspaceId,
          quiz.quizTitle || 'Assessment Paper',
          difficulty,
          count,
          JSON.stringify(quiz.questions || []),
          JSON.stringify(selectedSources.map(s => s.original_name))
        ]
      );
    } catch (saveErr) {
      console.warn('[EduMind AI] Could not persist quiz record to DB:', saveErr.message);
    }

    return res.json({
      success: true,
      quiz
    });
  } catch (err) {
    console.error('[EduMind AI Controller] Quiz generation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz with AI',
      error: err.message
    });
  }
}

/**
 * Controller for Central Chat Hub with persistence
 */
export async function chatHandler(req, res) {
  try {
    const { sourceIds = [], messages = [], userQuery, workspaceId = 'ws_default' } = req.body;

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({ success: false, message: 'Message query cannot be empty.' });
    }

    let selectedSources = [];
    if (Array.isArray(sourceIds) && sourceIds.length > 0) {
      const allSources = await db.query('SELECT * FROM sources ORDER BY created_at DESC');
      selectedSources = allSources.filter(s => sourceIds.includes(s.id));
    }

    const result = await geminiService.chatWithDocuments({
      sources: selectedSources,
      messages,
      userQuery: userQuery.trim()
    });

    // Persist messages in DB
    try {
      const userMsgId = `msg_${Date.now()}_u`;
      const aiMsgId = `msg_${Date.now() + 1}_a`;

      await db.query(
        'INSERT INTO chat_messages (id, workspace_id, sender, message) VALUES (?, ?, ?, ?)',
        [userMsgId, workspaceId, 'user', userQuery.trim()]
      );

      if (result.reply) {
        await db.query(
          'INSERT INTO chat_messages (id, workspace_id, sender, message) VALUES (?, ?, ?, ?)',
          [aiMsgId, workspaceId, 'ai', result.reply]
        );
      }
    } catch (dbErr) {
      console.warn('[EduMind Chat] Message persistence warning:', dbErr.message);
    }

    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[EduMind AI Controller] Chat error:', err);
    return res.status(500).json({
      success: false,
      message: 'Chat processing failed',
      error: err.message
    });
  }
}

/**
 * Get chat history for workspace
 */
export async function getChatHistoryHandler(req, res) {
  try {
    const { workspaceId = 'ws_default' } = req.query;
    const history = await db.query(
      'SELECT * FROM chat_messages WHERE workspace_id = ? ORDER BY created_at ASC',
      [workspaceId]
    );

    return res.json({
      success: true,
      messages: history.map(h => ({
        id: h.id,
        sender: h.sender,
        text: h.message,
        created_at: h.created_at
      }))
    });
  } catch (err) {
    console.error('[EduMind Chat History] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve chat history', error: err.message });
  }
}

/**
 * Clear chat history for workspace
 */
export async function clearChatHistoryHandler(req, res) {
  try {
    const { workspaceId = 'ws_default' } = req.query;
    await db.query('DELETE FROM chat_messages WHERE workspace_id = ?', [workspaceId]);
    return res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    console.error('[EduMind Chat Clear] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear chat history', error: err.message });
  }
}
