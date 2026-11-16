import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

export async function getWorkspaces(req, res) {
  try {
    const list = await db.query('SELECT * FROM workspaces ORDER BY created_at ASC');
    return res.json({
      success: true,
      workspaces: list
    });
  } catch (err) {
    console.error('[Workspace API] Error getting workspaces:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch workspaces', error: err.message });
  }
}

export async function createWorkspace(req, res) {
  try {
    const { name, description = '', color = 'indigo', icon = 'book' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Workspace name is required.' });
    }

    const id = `ws_${Date.now()}_${uuidv4().slice(0, 8)}`;
    await db.query(
      'INSERT INTO workspaces (id, name, description, color, icon) VALUES (?, ?, ?, ?, ?)',
      [id, name.trim(), description.trim(), color, icon]
    );

    const newWs = {
      id,
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      workspace: newWs
    });
  } catch (err) {
    console.error('[Workspace API] Error creating workspace:', err);
    return res.status(500).json({ success: false, message: 'Failed to create workspace', error: err.message });
  }
}

export async function deleteWorkspace(req, res) {
  try {
    const { id } = req.params;

    if (id === 'ws_default') {
      return res.status(400).json({ success: false, message: 'Cannot delete the default workspace.' });
    }

    await db.query('DELETE FROM workspaces WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Workspace deleted successfully',
      id
    });
  } catch (err) {
    console.error('[Workspace API] Error deleting workspace:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete workspace', error: err.message });
  }
}
