import db from '../config/db.js';
import * as geminiService from '../services/geminiService.js';

/**
 * Controller to generate structured MCQs strictly from selected sources
 */
export async function generateQuizHandler(req, res) {
  try {
    const { sourceIds, difficulty = 'Medium', questionCount = 5, customTopic = '' } = req.body;

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
      questionCount: count,
      customTopic
    });

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
 * Controller for Central Chat Hub
 */
export async function chatHandler(req, res) {
  try {
    const { sourceIds = [], messages = [], userQuery } = req.body;

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
