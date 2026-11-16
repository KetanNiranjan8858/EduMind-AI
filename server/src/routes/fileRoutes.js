import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadFiles,
  createNote,
  getAllSources,
  deleteSource
} from '../controllers/fileController.js';

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max for videos/PDFs
  }
});

// Routes
router.post('/upload', upload.array('files', 15), uploadFiles);
router.post('/note', createNote);
router.get('/', getAllSources);
router.delete('/:id', deleteSource);

export default router;
