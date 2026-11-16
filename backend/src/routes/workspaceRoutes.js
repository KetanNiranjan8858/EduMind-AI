import express from 'express';
import {
  getWorkspaces,
  createWorkspace,
  deleteWorkspace
} from '../controllers/workspaceController.js';

const router = express.Router();

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.delete('/:id', deleteWorkspace);

export default router;
