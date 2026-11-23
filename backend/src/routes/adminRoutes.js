import express from 'express';
import {
  getAllStudents,
  getStudentPerformance,
  updateStudent,
  deleteStudent,
  getAdminQuestions,
  createAdminQuestion,
  bulkCreateAdminQuestions,
  updateAdminQuestion,
  deleteAdminQuestion,
  getAdminTopics,
  verifyAdminPasscode,
  generateAdminQuestionExplanation,
  updateAdminQuestionExplanation
} from '../controllers/adminController.js';

const router = express.Router();

// Admin Authentication & Passcode Verification
router.post('/verify', verifyAdminPasscode);

// Student Management & Performance Analytics
router.get('/students', getAllStudents);
router.get('/students/:userId/performance', getStudentPerformance);
router.put('/students/:userId', updateStudent);
router.delete('/students/:userId', deleteStudent);

// Exam Prep Question Bank Management
router.get('/questions', getAdminQuestions);
router.post('/questions', createAdminQuestion);
router.post('/questions/bulk', bulkCreateAdminQuestions);
router.post('/questions/generate-explanation', generateAdminQuestionExplanation);
router.patch('/questions/:id/explanation', updateAdminQuestionExplanation);
router.put('/questions/:id', updateAdminQuestion);
router.delete('/questions/:id', deleteAdminQuestion);
router.get('/topics', getAdminTopics);

export default router;
