import express from 'express';
import {
  getExamHistory,
  saveExamAttempt,
  deleteExamAttempt
} from '../controllers/historyController.js';

const router = express.Router();

router.get('/', getExamHistory);
router.post('/', saveExamAttempt);
router.delete('/:id', deleteExamAttempt);

export default router;
