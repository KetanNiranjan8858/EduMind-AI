import express from 'express';
import { generateQuizHandler, chatHandler } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-quiz', generateQuizHandler);
router.post('/chat', chatHandler);

export default router;
