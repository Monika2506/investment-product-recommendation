import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('investiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration and Standardized Errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // If unauthorized and not on auth pages, clear stale credentials
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
          localStorage.removeItem('investiq_token');
          localStorage.removeItem('investiq_user');
          window.location.href = '/login?expired=true';
        }
      }
      return Promise.reject(error.response.data || { message: 'An unexpected server error occurred.' });
    }
    return Promise.reject({ message: error.message || 'Network connection failed. Please check your backend server.' });
  }
);

// API Service Functions
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  demoLogin: (role) => api.post('/auth/demo-login', { role }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  saveProfile: (data) => api.post('/profile', data),
};

export const recommendService = {
  generateRecommendation: (data) => api.post('/recommend', data),
  getHistory: () => api.get('/recommendations/history'),
  getDetail: (id) => api.get(`/recommendations/${id}`),
};

export const securityService = {
  getUserEvents: (limit = 50) => api.get(`/security/events?limit=${limit}`),
  getUserAlerts: () => api.get('/security/alerts'),
  acknowledgeAlert: (alertId) => api.post(`/security/alerts/${alertId}/acknowledge`),
  getSummary: () => api.get('/security/summary'),
  getPreferences: () => api.get('/security/preferences'),
  updatePreferences: (data) => api.put('/security/preferences', data),
  simulateEvent: (type) => api.post('/security/simulate-event', { type }),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (userId) => api.post(`/admin/users/${userId}/toggle-status`),
  getEvents: (params) => api.get('/admin/events', { params }),
  getAlerts: (params) => api.get('/admin/alerts', { params }),
  investigateAlert: (alertId, data) => api.post(`/admin/alerts/${alertId}/investigate`, data),
  getModelMetrics: () => api.get('/admin/model-metrics'),
};

export default api;
