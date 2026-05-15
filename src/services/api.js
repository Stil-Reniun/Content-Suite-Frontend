const API_BASE = 'https://backend-fastapi-it4axo2unq-uc.a.run.app/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    console.log('📡 API Call:', options.method || 'GET', url);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Error del servidor' }));
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (err) {
    console.error('❌ Fetch Error:', err);
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Error de conexión. Verifica tu internet o intenta más tarde.');
    }
    throw err;
  }
}

export const authAPI = {
  login: (email, password) => 
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (email, password, full_name, role) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, role }),
    }),
};

export const brandDNAAPI = {
  create: (data) =>
    fetchAPI('/brand-dna', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAll: async () => {
    const res = await fetchAPI('/brands');
    return Array.isArray(res) ? res : (res.data || []);
  },
  
  search: (query, brand_id) =>
    fetchAPI('/brand-dna/search', {
      method: 'POST',
      body: JSON.stringify({ query, brand_id }),
    }),
  
  generate: (prompt, brand_id) =>
    fetchAPI('/rag/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, brand_id }),
    }),
};

export const governanceAPI = {
  getContent: (content_id) =>
    fetchAPI(`/gov/content/${content_id}`),
  
  getPendingContents: async () => {
    try {
      const data = await fetchAPI('/gov/content/pending');
      return Array.isArray(data) ? data : (data.data || []);
    } catch {
      const all = await fetchAPI('/gov/content');
      const contents = all.data || all;
      return contents.filter(c => c.status === 'pending');
    }
  },
  
  getApprovedContents: async () => {
    try {
      const data = await fetchAPI('/gov/content/approved');
      return Array.isArray(data) ? data : (data.data || []);
    } catch {
      const all = await fetchAPI('/gov/content');
      const contents = all.data || all;
      return contents.filter(c => c.status === 'approved');
    }
  },
  
  getAllContents: () =>
    fetchAPI('/gov/content'),
  
  createContent: (data) =>
    fetchAPI('/gov/content/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  approve: (content_id, approved, feedback, user_id) =>
    fetchAPI('/gov/content/approve', {
      method: 'POST',
      body: JSON.stringify({ content_id, approved, feedback, user_id }),
    }),
  
  auditImage: async (content_id, user_id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/gov/content/audit-image?content_id=${content_id}&user_id=${user_id}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      throw new Error(error.detail || error.message || 'Error en la auditoría');
    }
    
    return response.json();
  },
  
  finalizeApproval: (content_id, user_id) =>
    fetchAPI(`/gov/content/finalize-approval?content_id=${content_id}&user_id=${user_id}`, {
      method: 'POST',
    }),
};

export const llmAPI = {
  getActivity: () =>
    fetchAPI('/llm/activity'),
};

export default { authAPI, brandDNAAPI, governanceAPI, llmAPI };