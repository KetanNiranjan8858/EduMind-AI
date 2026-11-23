const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

// ================= WORKSPACES =================
export async function fetchWorkspaces(userId) {
  const url = userId ? `${API_BASE}/workspaces?userId=${encodeURIComponent(userId)}` : `${API_BASE}/workspaces`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch workspaces');
  return await res.json();
}

export async function createWorkspace({ name, description, color, icon, userId }) {
  const res = await fetch(`${API_BASE}/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, color, icon, userId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create workspace');
  }
  return await res.json();
}

export async function updateWorkspace(id, { name, description, color }) {
  const res = await fetch(`${API_BASE}/workspaces/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, color })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update workspace');
  }
  return await res.json();
}

export async function deleteWorkspace(id) {
  const res = await fetch(`${API_BASE}/workspaces/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete workspace');
  }
  return await res.json();
}

// ================= SOURCES =================
export async function fetchSources(workspaceId, userId) {
  const params = new URLSearchParams();
  if (workspaceId) params.append('workspaceId', workspaceId);
  if (userId) params.append('userId', userId);
  const qs = params.toString();
  const url = qs ? `${API_BASE}/files?${qs}` : `${API_BASE}/files`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return await res.json();
}

export async function uploadFiles(fileList, workspaceId = 'ws_default', userId = null) {
  const formData = new FormData();
  formData.append('workspaceId', workspaceId);
  if (userId) formData.append('userId', userId);
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

export async function createNote({ title, content, workspaceId = 'ws_default', userId = null }) {
  const res = await fetch(`${API_BASE}/files/note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, workspaceId, userId })
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

// ================= AI & CHAT =================
export async function generateQuiz({ sourceIds, difficulty, questionCount, workspaceId = 'ws_default', userId = null }) {
  const res = await fetch(`${API_BASE}/ai/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceIds, difficulty, questionCount, workspaceId, userId })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Quiz generation failed');
  }

  return await res.json();
}

export async function sendChatMessage({ sourceIds, messages, userQuery, workspaceId = 'ws_default', userId = null }) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceIds, messages, userQuery, workspaceId, userId })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Chat request failed');
  }

  return await res.json();
}

export async function fetchChatHistory(workspaceId = 'ws_default', userId = null) {
  let url = `${API_BASE}/ai/chat-history?workspaceId=${encodeURIComponent(workspaceId)}`;
  if (userId) url += `&userId=${encodeURIComponent(userId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch chat history');
  return await res.json();
}

export async function clearChatHistory(workspaceId = 'ws_default', userId = null) {
  let url = `${API_BASE}/ai/chat-history?workspaceId=${encodeURIComponent(workspaceId)}`;
  if (userId) url += `&userId=${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear chat history');
  return await res.json();
}

// ================= EXAM HISTORY =================
export async function fetchExamHistory(options = 'ws_default') {
  let url = `${API_BASE}/history`;
  if (typeof options === 'string') {
    url += `?workspaceId=${encodeURIComponent(options)}`;
  } else {
    const { workspaceId = 'ws_default', userId, candidateId, category } = options || {};
    url += `?workspaceId=${encodeURIComponent(workspaceId)}`;
    if (userId) url += `&userId=${encodeURIComponent(userId)}`;
    if (candidateId) url += `&candidateId=${encodeURIComponent(candidateId)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch exam history');
  return await res.json();
}

export async function saveExamAttempt({
  workspaceId = 'ws_default',
  userId = null,
  candidateId = null,
  userEmail = null,
  userName = null,
  quiz,
  userAnswers,
  questionTimes,
  timeTakenSeconds,
  stats,
  category = null
}) {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId,
      userId,
      candidateId,
      userEmail,
      userName,
      quiz,
      userAnswers,
      questionTimes,
      timeTakenSeconds,
      stats,
      category
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to save exam history');
  }

  return await res.json();
}

export async function deleteExamAttempt(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete exam history record');
  }

  return await res.json();
}

// ================= AUTHENTICATION & CANDIDATE ACCESS =================
export async function authSignup(data) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Signup failed');
  return json;
}

export async function authLogin(data) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Login failed');
  return json;
}

export async function authGoogleLogin(data) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Google sign-in failed');
  return json;
}

export async function authForgotPassword({ email }) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to send OTP');
  return json;
}

export async function authVerifyOtp({ email, otp }) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Invalid or expired OTP');
  return json;
}

export async function authResetPassword({ email, otp, newPassword }) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Password reset failed');
  return json;
}

// ================= EXAM PREP DATABASE =================
export async function fetchExamPrepQuestions(params = {}) {
  const qs = new URLSearchParams();
  if (params.subjectId) qs.append('subjectId', params.subjectId);
  if (params.examId) qs.append('examId', params.examId);
  if (params.difficulty) qs.append('difficulty', params.difficulty);
  if (params.limit) qs.append('limit', params.limit);
  const qStr = qs.toString();
  const url = qStr ? `${API_BASE}/examprep/questions?${qStr}` : `${API_BASE}/examprep/questions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch exam prep questions');
  return await res.json();
}

export async function fetchExamPrepSubjects() {
  const res = await fetch(`${API_BASE}/examprep/subjects`);
  if (!res.ok) throw new Error('Failed to fetch exam prep subjects');
  return await res.json();
}

export async function generateExamPrepTest(data) {
  const res = await fetch(`${API_BASE}/examprep/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to generate CBT exam');
  return json;
}

export async function fetchExamPrepTests(examId = 'gate_cs') {
  const res = await fetch(`${API_BASE}/examprep/tests?examId=${encodeURIComponent(examId)}`);
  if (!res.ok) throw new Error('Failed to fetch exam prep tests');
  return await res.json();
}

export async function deleteExamPrepTest(id) {
  const res = await fetch(`${API_BASE}/examprep/tests/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete mock test');
  }
  return await res.json();
}

// ================= ADMIN COMMAND CENTER =================
export async function fetchAdminStudents() {
  const res = await fetch(`${API_BASE}/admin/students`);
  if (!res.ok) throw new Error('Failed to fetch students data');
  return await res.json();
}

export async function fetchStudentPerformance(userId) {
  const res = await fetch(`${API_BASE}/admin/students/${encodeURIComponent(userId)}/performance`);
  if (!res.ok) throw new Error('Failed to fetch student performance');
  return await res.json();
}

export async function updateAdminStudent(userId, data) {
  const res = await fetch(`${API_BASE}/admin/students/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to update student');
  return json;
}

export async function deleteAdminStudent(userId) {
  const res = await fetch(`${API_BASE}/admin/students/${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to delete student');
  return json;
}

export async function fetchAdminQuestions(params = {}) {
  const qs = new URLSearchParams();
  if (params.examId) qs.append('examId', params.examId);
  if (params.subjectId) qs.append('subjectId', params.subjectId);
  if (params.topic) qs.append('topic', params.topic);
  if (params.difficulty) qs.append('difficulty', params.difficulty);
  if (params.search) qs.append('search', params.search);
  if (params.page) qs.append('page', params.page);
  if (params.limit) qs.append('limit', params.limit);
  const qStr = qs.toString();
  const url = qStr ? `${API_BASE}/admin/questions?${qStr}` : `${API_BASE}/admin/questions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch admin questions');
  return await res.json();
}

export async function createAdminQuestion(data) {
  const res = await fetch(`${API_BASE}/admin/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to create question');
  return json;
}

export async function bulkCreateAdminQuestions(questions, examId = 'gate_cs') {
  const res = await fetch(`${API_BASE}/admin/questions/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions, examId })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to bulk create questions');
  return json;
}

export async function updateAdminQuestion(id, data) {
  const res = await fetch(`${API_BASE}/admin/questions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to update question');
  return json;
}

export async function generateAdminExplanation(data) {
  const res = await fetch(`${API_BASE}/admin/questions/generate-explanation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to generate explanation');
  return json;
}

export async function updateAdminQuestionExplanation(id, explanation) {
  const res = await fetch(`${API_BASE}/admin/questions/${encodeURIComponent(id)}/explanation`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ explanation })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to update explanation');
  return json;
}

export async function deleteAdminQuestion(id) {
  const res = await fetch(`${API_BASE}/admin/questions/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to delete question');
  return json;
}

export async function verifyAdminPasscode(data) {
  const res = await fetch(`${API_BASE}/admin/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(typeof data === 'string' ? { passcode: data } : data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Admin verification failed');
  return json;
}

export async function fetchAdminTopics(subjectId = null, examId = 'gate_cs') {
  const qs = new URLSearchParams();
  if (examId) qs.append('examId', examId);
  if (subjectId) qs.append('subjectId', subjectId);
  const url = `${API_BASE}/admin/topics?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch topics');
  return await res.json();
}
