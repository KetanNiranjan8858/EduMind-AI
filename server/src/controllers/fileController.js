import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

function determineFileType(mimeType, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  if (mimeType.includes('pdf') || ext === '.pdf') return 'pdf';
  if (mimeType.includes('image') || ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) return 'image';
  if (mimeType.includes('video') || ['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) return 'video';
  if (mimeType.includes('text') || ['.txt', '.md'].includes(ext)) return 'text';
  return 'file';
}

/**
 * Handle multi-modal file uploads
 */
export async function uploadFiles(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    const savedRecords = [];

    for (const file of req.files) {
      const id = uuidv4();
      const fileType = determineFileType(file.mimetype, file.originalname);
      const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');

      await db.query(
        `INSERT INTO sources (id, original_name, filename, file_path, file_size, mime_type, file_type, is_note, note_content)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          file.originalname,
          file.filename,
          relativePath,
          file.size,
          file.mimetype,
          fileType,
          false,
          null
        ]
      );

      savedRecords.push({
        id,
        original_name: file.originalname,
        filename: file.filename,
        file_path: relativePath,
        file_size: file.size,
        mime_type: file.mimetype,
        file_type: fileType,
        is_note: false,
        created_at: new Date().toISOString()
      });
    }

    return res.status(201).json({
      success: true,
      message: `Successfully uploaded ${savedRecords.length} file(s).`,
      files: savedRecords
    });
  } catch (err) {
    console.error('[EduMind API] Upload error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload files', error: err.message });
  }
}

/**
 * Create a custom text note (saves as physical .txt file and DB record)
 */
export async function createNote(req, res) {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Note title is required.' });
    }

    const noteContent = content || '';
    const id = uuidv4();
    const safeTitle = title.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `note_${Date.now()}_${safeTitle}.txt`;
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, noteContent, 'utf8');
    const stats = fs.statSync(filePath);
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

    await db.query(
      `INSERT INTO sources (id, original_name, filename, file_path, file_size, mime_type, file_type, is_note, note_content)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        `${title.trim()}.txt`,
        filename,
        relativePath,
        stats.size,
        'text/plain',
        'note',
        true,
        noteContent
      ]
    );

    const record = {
      id,
      original_name: `${title.trim()}.txt`,
      filename,
      file_path: relativePath,
      file_size: stats.size,
      mime_type: 'text/plain',
      file_type: 'note',
      is_note: true,
      note_content: noteContent,
      created_at: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      note: record
    });
  } catch (err) {
    console.error('[EduMind API] Create note error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create note', error: err.message });
  }
}

/**
 * Get all uploaded files and notes
 */
export async function getAllSources(req, res) {
  try {
    const results = await db.query('SELECT * FROM sources ORDER BY created_at DESC');
    return res.json({
      success: true,
      sources: results
    });
  } catch (err) {
    console.error('[EduMind API] Get sources error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve sources', error: err.message });
  }
}

/**
 * Delete a file or note from DB and disk
 */
export async function deleteSource(req, res) {
  try {
    const { id } = req.params;
    const records = await db.query('SELECT * FROM sources WHERE id = ?', [id]);

    if (!records || records.length === 0) {
      return res.status(404).json({ success: false, message: 'Source not found.' });
    }

    const record = records[0];

    // Delete physical file from disk if it exists
    if (record.file_path) {
      const fullPath = path.resolve(record.file_path);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (unlinkErr) {
          console.warn(`[EduMind API] Could not delete disk file ${fullPath}:`, unlinkErr.message);
        }
      }
    }

    // Delete from DB
    await db.query('DELETE FROM sources WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Deleted "${record.original_name}" successfully.`,
      id
    });
  } catch (err) {
    console.error('[EduMind API] Delete source error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete source', error: err.message });
  }
}
