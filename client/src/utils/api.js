const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function fetchSources() {
  const res = await fetch(`${API_BASE}/files`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return await res.json();
}

export async function uploadFiles(fileList) {
  const formData = new FormData();
  for (let i = 0; i < fileList.length; i++) {
    formData.append('files', fileList[i]);
  }

  const res = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'File upload failed');
  }

  return await res.json();
}

export async function createNote({ title, content }) {
  const res = await fetch(`${API_BASE}/files/note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create note');
  }

  return await res.json();
}

export async function deleteSource(id) {
  const res = await fetch(`${API_BASE}/files/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete source');
  }

  return await res.json();
}

export async function generateQuiz({ sourceIds, difficulty, questionCount, customTopic }) {
  const res = await fetch(`${API_BASE}/ai/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceIds, difficulty, questionCount, customTopic })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Quiz generation failed');
  }

  return await res.json();
}

export async function sendChatMessage({ sourceIds, messages, userQuery }) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceIds, messages, userQuery })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Chat request failed');
  }

  return await res.json();
}
