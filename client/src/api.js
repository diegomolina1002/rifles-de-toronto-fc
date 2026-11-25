const TOKEN_KEY = 'rifles_admin_token';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Error HTTP ${res.status}`);
  }
  return data;
}

function authHeaders(extra = {}) {
  const token = getAdminToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export const api = {
  // Auth
  login: async (password) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return handleResponse(res);
  },
  verifyAdmin: async () => {
    const res = await fetch('/api/admin/verify', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  // Players
  getPlayers: async () => handleResponse(await fetch('/api/players')),
  createPlayer: async (formData) =>
    handleResponse(
      await fetch('/api/players', {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      })
    ),
  updatePlayer: async (id, formData) =>
    handleResponse(
      await fetch(`/api/players/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: formData
      })
    ),
  deletePlayer: async (id) =>
    handleResponse(
      await fetch(`/api/players/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
    ),

  // Matches
  getMatches: async () => handleResponse(await fetch('/api/matches')),
  createMatch: async (payload) =>
    handleResponse(
      await fetch('/api/matches', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      })
    ),
  updateMatch: async (id, payload) =>
    handleResponse(
      await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      })
    ),
  deleteMatch: async (id) =>
    handleResponse(
      await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
    ),

  // Jerseys
  getJerseys: async () => handleResponse(await fetch('/api/jerseys')),
  createJersey: async (formData) =>
    handleResponse(
      await fetch('/api/jerseys', {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      })
    ),
  updateJersey: async (id, formData) =>
    handleResponse(
      await fetch(`/api/jerseys/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: formData
      })
    ),
  deleteJersey: async (id) =>
    handleResponse(
      await fetch(`/api/jerseys/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
    ),

  // Gallery
  getGallery: async () => handleResponse(await fetch('/api/gallery')),
  uploadGallery: async (formData) =>
    handleResponse(
      await fetch('/api/gallery', {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      })
    ),
  deleteGalleryPhoto: async (id) =>
    handleResponse(
      await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
    )
};
