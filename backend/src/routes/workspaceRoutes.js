import express from 'express';
import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
} from '../controllers/workspaceController.js';

const router = express.Router();

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

export default router;
