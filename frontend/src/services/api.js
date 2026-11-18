const API_BASE = 'http://localhost:8001';

export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('linkai_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || `HTTP ${res.status}`);
    }
    // Check if CSV download
    if (res.headers.get('content-type')?.includes('text/csv')) {
      return await res.blob();
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (data) => fetchApi('/api/auth/login/', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => fetchApi('/api/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchApi('/api/auth/profile/'),
  updateProfile: (data) => fetchApi('/api/auth/profile/', { method: 'PUT', body: JSON.stringify(data) }),
  getApiKeys: () => fetchApi('/api/auth/api-keys/'),
  createApiKey: (name) => fetchApi('/api/auth/api-keys/', { method: 'POST', body: JSON.stringify({ name }) }),
  revokeApiKey: (id) => fetchApi(`/api/auth/api-keys/${id}/`, { method: 'DELETE' }),
  getTeam: () => fetchApi('/api/auth/team/'),
  inviteTeamMember: (data) => fetchApi('/api/auth/team/', { method: 'POST', body: JSON.stringify(data) }),

  // Links
  getLinks: (params = '') => fetchApi(`/api/links/${params}`),
  getLink: (id) => fetchApi(`/api/links/${id}/`),
  createLink: (data) => fetchApi('/api/links/', { method: 'POST', body: JSON.stringify(data) }),
  updateLink: (id, data) => fetchApi(`/api/links/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLink: (id) => fetchApi(`/api/links/${id}/`, { method: 'DELETE' }),
  bulkAction: (action, link_ids, extra = {}) => fetchApi('/api/links/bulk-action/', { method: 'POST', body: JSON.stringify({ action, link_ids, ...extra }) }),
  suggestAlias: (data) => fetchApi('/api/links/ai-suggest-alias/', { method: 'POST', body: JSON.stringify(data) }),
  suggestTitle: (url) => fetchApi('/api/links/ai-suggest-title/', { method: 'POST', body: JSON.stringify({ url }) }),
  getQrCode: (id, params = '') => fetchApi(`/api/links/${id}/qr/${params}`),

  // Analytics
  getDashboardSummary: () => fetchApi('/api/analytics/dashboard-summary/'),
  getLinkAnalytics: (id) => fetchApi(`/api/analytics/link/${id}/`),
  compareLinks: (id1, id2) => fetchApi(`/api/analytics/compare/?link1=${id1}&link2=${id2}`),
  getRealtimeFeed: () => fetchApi('/api/analytics/realtime-feed/'),

  // AI Engine
  getAIInsights: (link_id) => fetchApi('/api/ai/insights/', { method: 'POST', body: JSON.stringify({ link_id }) }),
  getAIPrediction: (link_id) => fetchApi('/api/ai/predict/', { method: 'POST', body: JSON.stringify({ link_id }) }),
  getAICampaign: (link_id, topic) => fetchApi('/api/ai/campaign/', { method: 'POST', body: JSON.stringify({ link_id, topic }) }),
  chatCopilot: (link_id, query) => fetchApi('/api/ai/copilot/', { method: 'POST', body: JSON.stringify({ link_id, query }) }),

  // Automation
  getAutomationRules: () => fetchApi('/api/automation/rules/'),
  createAutomationRule: (data) => fetchApi('/api/automation/rules/', { method: 'POST', body: JSON.stringify(data) }),
  updateAutomationRule: (id, data) => fetchApi(`/api/automation/rules/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAutomationRule: (id) => fetchApi(`/api/automation/rules/${id}/`, { method: 'DELETE' }),
  getAutomationLogs: () => fetchApi('/api/automation/logs/'),
  testWebhook: (url) => fetchApi('/api/automation/test-webhook/', { method: 'POST', body: JSON.stringify({ url }) }),

  // Exports
  exportCsvUrl: `${API_BASE}/api/analytics/export/csv/`,
  getExecutivePdfSummary: () => fetchApi('/api/analytics/export/pdf-summary/'),
  scheduleExport: (data) => fetchApi('/api/analytics/export/schedule/', { method: 'POST', body: JSON.stringify(data) }),
};
