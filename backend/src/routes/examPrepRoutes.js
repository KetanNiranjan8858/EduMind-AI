import express from 'express';
import {
  getExamPrepQuestions,
  getExamPrepSubjects,
  generateExamPrepTest,
  getExamPrepTests
} from '../controllers/examPrepController.js';

const router = express.Router();

router.get('/questions', getExamPrepQuestions);
router.get('/subjects', getExamPrepSubjects);
router.post('/generate', generateExamPrepTest);
router.get('/tests', getExamPrepTests);

export default router;
