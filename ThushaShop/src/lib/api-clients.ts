// src/lib/api-clients.ts
import axios from 'axios';

// Create separate client for auth endpoints (no token during login)
export const authClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Main API client with token interceptor
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor to include bearer token if available
// api-clients.ts
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers
    config.headers.Authorization = `Bearer ${token}`;;
  }
  return config;
});

