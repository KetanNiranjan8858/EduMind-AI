import express from 'express';
import {
  generateQuizHandler,
  chatHandler,
  getChatHistoryHandler,
  clearChatHistoryHandler
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-quiz', generateQuizHandler);
router.post('/chat', chatHandler);
router.get('/chat-history', getChatHistoryHandler);
router.delete('/chat-history', clearChatHistoryHandler);

export default router;
