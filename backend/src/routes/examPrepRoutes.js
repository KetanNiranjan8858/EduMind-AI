import express from 'express';
import {
  getExamPrepQuestions,
  getExamPrepSubjects,
  generateExamPrepTest,
  getExamPrepTests,
  deleteExamPrepTest
} from '../controllers/examPrepController.js';

const router = express.Router();

router.get('/questions', getExamPrepQuestions);
router.get('/subjects', getExamPrepSubjects);
router.post('/generate', generateExamPrepTest);
router.post('/tests/generate', generateExamPrepTest);
router.get('/tests', getExamPrepTests);
router.delete('/tests/:id', deleteExamPrepTest);

export default router;
