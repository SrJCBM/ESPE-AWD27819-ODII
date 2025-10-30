const api = async (url, opts = {}) => {
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.msg || `HTTP ${res.status}`);
  return data;
};

window.Auth = {
  register: (payload) => api('/api/auth/register', { method: 'POST', body: payload }),
  login:    (payload) => api('/api/auth/login',    { method: 'POST', body: payload }),
  me:       ()        => api('/api/auth/me'),
  logout:   ()        => api('/api/auth/logout',   { method: 'POST' })
};
