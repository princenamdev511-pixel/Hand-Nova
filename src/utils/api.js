
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('hcs_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        status: 'offline',
        database: 'disconnected',
        dbNote: 'Server or network is unreachable',
      };
    }
  },
  async register(username, email, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    if (data.token) {
      localStorage.setItem('hcs_token', data.token);
      localStorage.setItem('hcs_user', JSON.stringify(data.user));
    }
    return data;
  },
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    if (data.token) {
      localStorage.setItem('hcs_token', data.token);
      localStorage.setItem('hcs_user', JSON.stringify(data.user));
    }
    return data;
  },
  async getCurrentUser() {
    const token = localStorage.getItem('hcs_token');
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        localStorage.removeItem('hcs_token');
        localStorage.removeItem('hcs_user');
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },
  logout() {
    localStorage.removeItem('hcs_token');
    localStorage.removeItem('hcs_user');
  },
  async getDrawings() {
    const res = await fetch(`${API_BASE_URL}/api/drawings`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to load drawings');
    }
    return data.drawings || [];
  },
  async saveDrawing({ title, dataUrl, strokeCount, gesturesUsed }) {
    const res = await fetch(`${API_BASE_URL}/api/drawings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, dataUrl, strokeCount, gesturesUsed }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to save drawing');
    }
    return data;
  },
  async deleteDrawing(id) {
    const res = await fetch(`${API_BASE_URL}/api/drawings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete drawing');
    }
    return data;
  },
};
